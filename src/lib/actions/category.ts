"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    return categories
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function getCategoryBySlug(slug: string) {
  try {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: {
        products: {
          where: { status: 'active' },
          orderBy: { sellPrice: 'asc' }
        }
      }
    })
    return category
  } catch (error) {
    console.error("Error fetching category by slug:", error)
    return null
  }
}

export async function createCategory(formData: { name: string, slug: string, logoUrl?: string }) {
  try {
    const category = await prisma.category.create({
      data: {
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
      }
    })
    revalidatePath("/admin/kategori")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Gagal menambahkan kategori" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    })
    revalidatePath("/admin/kategori")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Gagal menghapus kategori" }
  }
}
