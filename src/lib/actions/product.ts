"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getProducts() {
  try {
    const products = await prisma.product.findMany({
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    return products
  } catch (error) {
    console.error("Error fetching products:", error)
    return []
  }
}

export async function createProduct(data: {
  categoryId: string,
  skuCode: string,
  name: string,
  basicPrice: number,
  sellPrice: number,
  maxPrice: number,
  status?: string
}) {
  try {
    const product = await prisma.product.create({
      data: {
        categoryId: data.categoryId,
        skuCode: data.skuCode,
        name: data.name,
        basicPrice: data.basicPrice,
        sellPrice: data.sellPrice,
        maxPrice: data.maxPrice,
        status: data.status || "active",
      }
    })
    revalidatePath("/admin/produk")
    return { success: true, data: product }
  } catch (error) {
    console.error("Error creating product:", error)
    return { success: false, error: "Gagal menambahkan produk. Pastikan SKU unik." }
  }
}

export async function deleteProduct(id: string) {
  try {
    await prisma.product.delete({
      where: { id }
    })
    revalidatePath("/admin/produk")
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { success: false, error: "Gagal menghapus produk" }
  }
}
