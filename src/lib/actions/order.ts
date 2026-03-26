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
}

export async function createOrder(data: CreateOrderParams) {
  try {
    const { userGameId, zoneId, productId, paymentMethod } = data

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
      }
    })

    try {
      const invoice = await createPaymentInvoice({
        method: paymentMethod,
        name: 'Customer',
        phone: '081234567890',
        amount: feeCalculation.totalPayment,
        merchantRef: referenceId,
        expired: 24,
        products: [
          {
            name: product.name,
            qty: 1,
            price: product.sellPrice,
          },
        ],
        callbackUrl: `${BASE_URL}/api/webhook/sukurupiah`,
        returnUrl: `${BASE_URL}/transaksi/${referenceId}`,
      })

      const paymentData = invoice.data[0]

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

      redirect(`/transaksi/${referenceId}`)

    } catch (error: any) {
      console.error('Error creating payment invoice:', error)

      await prisma.order.delete({ where: { id: order.id } })

      if (error.message?.includes('NEXT_REDIRECT')) {
        throw error
      }

      return { success: false, error: 'Gagal membuat invoice pembayaran' }
    }

  } catch (error: any) {
    console.error("Error creating order:", error)

    if (error.message?.includes('NEXT_REDIRECT')) {
      throw error
    }

    return { success: false, error: "Gagal membuat pesanan. Silakan coba lagi." }
  }
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
