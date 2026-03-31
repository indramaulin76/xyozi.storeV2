"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function getCategories() {
  try {
    console.log("[getCategories] Starting fetch from database...");
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: { name: 'asc' }
    })
    console.log("[getCategories] Raw database response:", categories);
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
          where: { 
            status: 'active'
          },
          orderBy: { sellPrice: 'asc' }
        }
      }
    })
    
    // Filter out products without category on the application level
    if (category) {
      category.products = category.products.filter(p => p.categoryId !== null);
    }
    
    return category
  } catch (error) {
    console.error("Error fetching category by slug:", error)
    return null
  }
}

export async function createCategory(formData: { name: string, slug: string, logoUrl?: string, bannerUrl?: string, markupPercent?: number, description?: string, menuSection?: string, field1Label?: string, field1Placeholder?: string, field2Label?: string | null, field2Placeholder?: string, field2Required?: boolean, digiflazzBrand?: string, digiflazzCategory?: string }) {
  try {
    const category = await prisma.category.create({
      data: {
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        markupPercent: formData.markupPercent || 10,
        description: formData.description,
        menuSection: formData.menuSection || "topup",
        field1Label: formData.field1Label || "User ID",
        field1Placeholder: formData.field1Placeholder || null,
        field2Label: formData.field2Label || null,
        field2Placeholder: formData.field2Placeholder || null,
        field2Required: formData.field2Required || false,
        digiflazzBrand: formData.digiflazzBrand || null,
        digiflazzCategory: formData.digiflazzCategory || null,
      }
    })
    revalidatePath("/admin/kategori")
    revalidatePath("/")
    return { success: true, data: category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { success: false, error: "Gagal menambahkan kategori" }
  }
}

export async function updateCategory(id: string, formData: { 
  name: string, 
  slug: string, 
  logoUrl?: string, 
  bannerUrl?: string, 
  markupPercent?: number,
  description?: string,
  menuSection?: string,
  field1Label?: string,
  field1Placeholder?: string,
  field2Label?: string | null,
  field2Placeholder?: string,
  field2Required?: boolean,
  digiflazzBrand?: string,
  digiflazzCategory?: string
}) {
  try {
    const oldCategory = await prisma.category.findUnique({
      where: { id },
      select: { markupPercent: true }
    });

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: formData.name,
        slug: formData.slug,
        logoUrl: formData.logoUrl,
        bannerUrl: formData.bannerUrl,
        markupPercent: formData.markupPercent || 10,
        description: formData.description,
        menuSection: formData.menuSection || "topup",
        field1Label: formData.field1Label || "User ID",
        field1Placeholder: formData.field1Placeholder || null,
        field2Label: formData.field2Label || null,
        field2Placeholder: formData.field2Placeholder || null,
        field2Required: formData.field2Required || false,
        digiflazzBrand: formData.digiflazzBrand || null,
        digiflazzCategory: formData.digiflazzCategory || null,
      }
    });

    if (oldCategory && formData.markupPercent !== oldCategory.markupPercent) {
      const newMarkup = formData.markupPercent || 0;
      
      const products = await prisma.product.findMany({
        where: { 
          categoryId: id,
          isManualPrice: false
        }
      });
      
      for (const product of products) {
        const newSellPrice = Math.ceil(product.basicPrice * (1 + newMarkup / 100));
        await prisma.product.update({
          where: { id: product.id },
          data: { sellPrice: newSellPrice }
        });
      }
      
      console.log(`[Category Update] Updated ${products.length} products with new markup ${newMarkup}%`);
    }

    revalidatePath("/admin/kategori")
    revalidatePath("/admin/produk")
    revalidatePath("/")
    revalidatePath(`/produk/${formData.slug}`)
    return { success: true, data: category }
  } catch (error) {
    console.error("Error updating category:", error)
    return { success: false, error: "Gagal memperbarui kategori" }
  }
}

export async function deleteCategory(id: string) {
  try {
    await prisma.category.delete({
      where: { id }
    })
    revalidatePath("/admin/kategori")
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { success: false, error: "Gagal menghapus kategori" }
  }
}
