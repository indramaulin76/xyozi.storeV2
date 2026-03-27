"use server"

import type { Category } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { fetchDigiflazzPriceList, checkDigiflazzProduct } from "@/lib/digiflazz"
import { normalizeBrand } from "@/lib/digiflazz-brand"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_SIZE = 5 * 1024 * 1024 // 5MB

export async function checkProductInDigiflazz(skuCode: string) {
  try {
    const result = await checkDigiflazzProduct(skuCode);
    
    if (result.error) {
      return { success: false, error: result.error };
    }
    
    if (!result.exists) {
      return { success: true, exists: false, message: "Produk tidak ditemukan di Digiflazz" };
    }
    
    return { 
      success: true, 
      exists: true, 
      product: {
        name: result.product!.product_name,
        price: result.product!.price,
        brand: result.product!.brand,
        category: result.product!.category
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function uploadProductImage(productId: string, formData: FormData) {
  try {
    // Validate product exists
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    // Get file from formData
    const file = formData.get("image") as File | null

    if (!file) {
      return { success: false, error: "Tidak ada file yang diupload" }
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return { success: false, error: "Format file tidak didukung. Gunakan: JPG, PNG, WEBP, atau GIF" }
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return { success: false, error: "Ukuran file terlalu besar. Maksimal 5MB" }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const ext = file.name.split(".").pop() || "png"
    const filename = `product-${productId}-${timestamp}.${ext}`

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const filepath = path.join(uploadsDir, filename)
    await writeFile(filepath, buffer)

    // Update product with image URL
    const imageUrl = `/uploads/${filename}`
    
    await prisma.product.update({
      where: { id: productId },
      data: { imageUrl }
    })

    // Revalidate relevant paths
    revalidatePath("/admin/produk")
    revalidatePath("/produk")
    revalidatePath(`/produk/${product.categoryId}`)

    return { 
      success: true, 
      message: "Gambar berhasil diupload",
      imageUrl 
    }

  } catch (error: any) {
    console.error("Upload Error:", error)
    return { success: false, error: error.message || "Gagal mengupload gambar" }
  }
}

export async function deleteProductImage(productId: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    if (!product.imageUrl) {
      return { success: false, error: "Produk tidak memiliki gambar" }
    }

    // Delete file from filesystem
    const filepath = path.join(process.cwd(), "public", product.imageUrl)
    try {
      const { unlink } = await import("fs/promises")
      await unlink(filepath)
    } catch (fileError) {
      console.warn("File tidak ditemukan di filesystem, skip delete")
    }

    // Update database
    await prisma.product.update({
      where: { id: productId },
      data: { imageUrl: null }
    })

    revalidatePath("/admin/produk")
    revalidatePath("/produk")

    return { success: true, message: "Gambar berhasil dihapus" }

  } catch (error: any) {
    console.error("Delete Image Error:", error)
    return { success: false, error: error.message || "Gagal menghapus gambar" }
  }
}

function resolveCategoryForItemBrand(categories: Category[], itemBrand: string) {
  const nb = normalizeBrand(itemBrand)
  if (!nb) return undefined

  for (const c of categories) {
    if (c.digiflazzBrand && normalizeBrand(c.digiflazzBrand) === nb) {
      return c
    }
  }

  // Cocokkan secara "longgar" juga berdasarkan digiflazzBrand,
  // supaya variasi seperti "Point Blank" vs "Point-Blank (PB)" tetap bisa masuk.
  for (const c of categories) {
    if (!c.digiflazzBrand) continue
    const db = normalizeBrand(c.digiflazzBrand)
    if (!db) continue
    if (nb.includes(db) || db.includes(nb)) {
      return c
    }
  }

  const candidates: Category[] = []
  for (const c of categories) {
    const nn = normalizeBrand(c.name)
    if (!nn) continue
    if (nb.includes(nn) || nn.includes(nb)) {
      candidates.push(c)
    }
  }
  if (candidates.length === 0) return undefined

  candidates.sort(
    (a, b) => normalizeBrand(b.name).length - normalizeBrand(a.name).length
  )
  return candidates[0]
}

export async function syncDigiflazzProducts() {
  try {
    const categories = await prisma.category.findMany()

    if (categories.length === 0) {
      return { success: false, error: "Database Kategori Anda masih kosong! Harap tambahkan kategori (misal: 'Mobile Legends') di menu Kategori sebelum sinkronisasi." }
    }

    const rawProducts = await fetchDigiflazzPriceList()

    if (!rawProducts || !Array.isArray(rawProducts)) {
      return { success: false, error: "Gagal menarik data produk dari Digiflazz. Pastikan konfigurasi benar." }
    }

    const skuCodes = [...new Set(rawProducts.map((i) => i.buyer_sku_code.toLowerCase()))]
    const existingRows = await prisma.product.findMany({
      where: { skuCode: { in: skuCodes } },
      select: { skuCode: true, categoryId: true },
    })
    const existingBySku = new Map(existingRows.map((p) => [p.skuCode, p]))

    let withCategoryCount = 0
    let noCategoryCount = 0
    const unmatchedBrands: string[] = []

    for (const item of rawProducts) {
      const category = resolveCategoryForItemBrand(categories, item.brand)
      const skuCode = item.buyer_sku_code.toLowerCase()
      const existing = existingBySku.get(skuCode)
      const active = !!(item.buyer_product_status && item.seller_product_status)

      if (category) {
        const markup = category.markupPercent || 10
        const sellPrice = Math.ceil(item.price * (1 + markup / 100))

        await prisma.product.upsert({
          where: { skuCode },
          update: {
            name: item.product_name,
            basicPrice: item.price,
            sellPrice,
            status: active ? "active" : "inactive",
            ...(existing?.categoryId == null ? { categoryId: category.id } : {}),
          },
          create: {
            categoryId: category.id,
            skuCode,
            name: item.product_name,
            basicPrice: item.price,
            sellPrice,
            maxPrice: item.price * 1.5,
            status: active ? "active" : "inactive",
          },
        })
        withCategoryCount++
      } else {
        await prisma.product.upsert({
          where: { skuCode },
          update: {
            name: item.product_name,
            basicPrice: item.price,
            status: active ? "active" : "inactive",
          },
          create: {
            skuCode,
            name: item.product_name,
            basicPrice: item.price,
            sellPrice: item.price * 1.1,
            maxPrice: item.price * 1.5,
            status: active ? "active" : "inactive",
          },
        })
        noCategoryCount++

        if (!unmatchedBrands.includes(item.brand)) {
          unmatchedBrands.push(item.brand)
        }
      }
    }

    revalidatePath("/admin/produk")
    
    let message = `Berhasil sync ${rawProducts.length} produk dari Digiflazz!`;
    message += `\n✅ Dengan Kategori: ${withCategoryCount}`;
    message += `\n⚠️ Tanpa Kategori: ${noCategoryCount} (silakan assign manual di admin)`;
    if (unmatchedBrands.length > 0) {
      message += `\nUnmatched brand (contoh): ${unmatchedBrands.slice(0, 10).join(", ")}`;
    }
    
    return { 
      success: true, 
      message,
      detail: {
        withCategory: withCategoryCount,
        noCategory: noCategoryCount,
        unmatchedBrands: unmatchedBrands.slice(0, 10)
      }
    }
  } catch (error: any) {
    console.error("Sync Error:", error.message)
    return { success: false, error: error.message || "Gagal sinkronisasi produk Digiflazz." }
  }
}

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

export async function getFlashSaleProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { isFlashSale: true, status: "active" },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })
    return products
  } catch (error) {
    console.error("Error fetching flash sale products:", error)
    return []
  }
}

export async function setFlashSale(productId: string, enabled: boolean, flashSalePrice?: number) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    if (enabled && flashSalePrice) {
      if (flashSalePrice >= product.sellPrice) {
        return { success: false, error: "Harga flash sale harus lebih murah dari harga normal" }
      }
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        isFlashSale: enabled,
        flashSalePrice: enabled ? flashSalePrice || product.sellPrice * 0.8 : null
      }
    })

    revalidatePath("/admin/flash-sale")
    revalidatePath("/")
    return { success: true, message: enabled ? "Produk ditambahkan ke Flash Sale" : "Produk dihapus dari Flash Sale" }
  } catch (error: any) {
    console.error("Error setting flash sale:", error)
    return { success: false, error: error.message || "Gagal update flash sale" }
  }
}

export async function getPopularProducts(limit: number = 8) {
  try {
    const products = await prisma.product.findMany({
      where: { isPopular: true, status: "active" },
      include: {
        category: {
          select: { name: true, slug: true }
        }
      },
      take: limit,
      orderBy: { orderCount: 'desc' }
    })
    return products
  } catch (error) {
    console.error("Error fetching popular products:", error)
    return []
  }
}

export async function setPopular(productId: string, enabled: boolean) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" }
    }

    await prisma.product.update({
      where: { id: productId },
      data: { isPopular: enabled }
    })

    revalidatePath("/admin/produk-populer")
    revalidatePath("/")
    return { success: true, message: enabled ? "Produk ditambahkan ke Produk Populer" : "Produk dihapus dari Produk Populer" }
  } catch (error: any) {
    console.error("Error setting popular:", error)
    return { success: false, error: error.message || "Gagal update produk populer" }
  }
}

export async function incrementOrderCount(productId: string) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { orderCount: { increment: 1 } }
    })
    return { success: true }
  } catch (error) {
    console.error("Error incrementing order count:", error)
    return { success: false }
  }
}

export async function bulkAssignCategory(productIds: string[], categoryId: string | null) {
  try {
    if (productIds.length === 0) {
      return { success: false, error: "Pilih minimal 1 produk" }
    }

    await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data:
        categoryId === null
          ? { categoryId: null }
          : { categoryId },
    })

    revalidatePath("/admin/produk")
    revalidatePath("/")

    const message =
      categoryId === null
        ? `${productIds.length} produk berhasil dilepas dari kategori`
        : `${productIds.length} produk berhasil di-assign ke kategori`

    return {
      success: true,
      message,
    }
  } catch (error: any) {
    console.error("Error bulk assign category:", error)
    return { success: false, error: error.message || "Gagal assign kategori" }
  }
}

export async function bulkDeleteProducts(productIds: string[]) {
  try {
    if (productIds.length === 0) {
      return { success: false, error: "Pilih minimal 1 produk" }
    }

    await prisma.product.deleteMany({
      where: { id: { in: productIds } }
    })

    revalidatePath("/admin/produk")
    revalidatePath("/")
    
    return { 
      success: true, 
      message: `${productIds.length} produk berhasil dihapus` 
    }
  } catch (error: any) {
    console.error("Error bulk delete:", error)
    return { success: false, error: error.message || "Gagal hapus produk" }
  }
}

export async function deleteProductsWithoutCategory() {
  try {
    const result = await prisma.product.deleteMany({
      where: { 
        categoryId: { equals: null } as any
      }
    } as any)
    
    revalidatePath("/admin/produk")
    revalidatePath("/")
    
    return { 
      success: true, 
      message: `${result.count} produk tanpa kategori berhasil dihapus` 
    }
  } catch (error: any) {
    console.error("Error delete products without category:", error)
    return { success: false, error: error.message || "Gagal hapus produk tanpa kategori" }
  }
}
