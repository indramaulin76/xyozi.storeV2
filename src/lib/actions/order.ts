"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function createOrder(data: {
  userGameId: string,
  zoneId?: string,
  productId: string,
  amount: number
}) {
  try {
    // Generate Reference ID unik (Contoh: XY-250326-XXXX)
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referenceId = `XY-${dateStr}-${randomStr}`;

    const order = await prisma.order.create({
      data: {
        referenceId,
        userGameId: data.userGameId,
        zoneId: data.zoneId,
        productId: data.productId,
        amount: data.amount,
        paymentStatus: "PENDING",
        digiflazzStatus: "PENDING",
      }
    })

    return { success: true, referenceId: order.referenceId }
  } catch (error) {
    console.error("Error creating order:", error)
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
