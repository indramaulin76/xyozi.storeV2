"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createPaymentInvoice } from "@/lib/sukurupiah"
import { calculateFee, getPaymentMethod } from "@/lib/payment-methods"

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

interface CreateOrderParams {
  userGameId: string
  zoneId?: string
  productId: string
  paymentMethod: string
  customerPhone?: string
  voucherCode?: string
  discountAmount?: number
}

export async function createOrder(data: CreateOrderParams) {
  const { userGameId, zoneId, productId, paymentMethod, customerPhone, voucherCode, discountAmount } = data

  if (!userGameId || !productId || !paymentMethod) {
    return { success: false, error: 'Data tidak lengkap' }
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { category: true }
  })

  if (!product) {
    return { success: false, error: 'Produk tidak ditemukan' }
  }

  const paymentMethodInfo = getPaymentMethod(paymentMethod)
  if (!paymentMethodInfo) {
    return { success: false, error: 'Metode pembayaran tidak valid' }
  }

  const feeCalculation = calculateFee(paymentMethod, product.sellPrice)

  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "")
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase()
  const referenceId = `XY-${dateStr}-${randomStr}`

  // 1. Buat Order Terlebih Dahulu
  const order = await prisma.order.create({
    data: {
      referenceId,
      userGameId,
      zoneId: zoneId || null,
      productId,
      amount: product.sellPrice,
      paymentStatus: 'PENDING',
      digiflazzStatus: 'PENDING',
      paymentMethod,
      paymentFee: feeCalculation.totalFee,
      customerPhone: customerPhone || null,
      voucherCode: voucherCode || null,
      discountAmount: discountAmount || 0,
    }
  })

  // Increment voucher usage if voucher was used
  if (voucherCode) {
    await prisma.voucher.update({
      where: { code: voucherCode },
      data: { usedCount: { increment: 1 } }
    })
  }

  let invoice;
  try {
    // 2. Buat Invoice ke Payment Gateway (dengan diskon)
    const totalPaymentWithDiscount = Math.max(0, feeCalculation.totalPayment - (discountAmount || 0));
    invoice = await createPaymentInvoice({
      method: paymentMethod,
      name: 'Customer',
      phone: '081234567890',
      amount: totalPaymentWithDiscount,
      merchantRef: referenceId,
      expired: 24,
      products: [
        {
          name: product.name,
          qty: 1,
          price: Math.max(0, product.sellPrice - (discountAmount || 0)),
        },
      ],
      callbackUrl: `${BASE_URL}/api/webhook/sukurupiah`,
      returnUrl: `${BASE_URL}/transaksi/${referenceId}`,
    })

    const paymentData = invoice.data[0]

    // 3. Update Order dengan Data Pembayaran
    await prisma.order.update({
      where: { id: order.id },
      data: {
        sakurupiahTrxId: paymentData.trx_id,
        paymentQrCode: paymentData.qr || null,
        paymentNo: paymentData.payment_no || null,
        checkoutUrl: paymentData.checkout_url || null,
        expiredAt: new Date(paymentData.expired),
      },
    })

  } catch (error: any) {
    console.error('Gagal membuat invoice Sakurupiah:', error.message || error)
    
    // JANGAN HAPUS ORDER, biarkan statusnya PENDING di database
    // Ini membantu Admin melacak transaksi yang gagal dicarikan invoicenya
    return { 
      success: false, 
      error: 'Gagal mendapatkan metode pembayaran. Silakan hubungi CS atau coba metode lain.' 
    }
  }

  // 4. Redirect dipanggil di PALING AKHIR, di luar blok try-catch
  revalidatePath("/admin/pesanan")
  redirect(`/transaksi/${referenceId}`)
}

export async function getOrderByReference(referenceId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { referenceId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })
    return order
  } catch (error) {
    console.error("Error fetching order:", error)
    return null
  }
}
