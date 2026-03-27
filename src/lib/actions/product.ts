"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { fetchDigiflazzPriceList, checkDigiflazzProduct } from "@/lib/digiflazz"
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

    let processedCount = 0;
    let skippedCount = 0;
    const unmatchedBrands: string[] = [];

    for (const item of rawProducts) {
      // Cari kategori dengan prioritas:
      // 1. Exact match dengan digiflazzBrand
      // 2. Contains match dengan nama kategori
      
      let category = categories.find(c => 
        c.digiflazzBrand && 
        c.digiflazzBrand.toLowerCase() === item.brand.toLowerCase()
      );

      // Fallback ke contains match
      if (!category) {
        category = categories.find(c => 
          item.brand.toLowerCase().includes(c.name.toLowerCase()) ||
          c.name.toLowerCase().includes(item.brand.toLowerCase())
        );
      }

      if (category) {
        // Hitung harga jual berdasarkan markupPercent dari kategori (default 10%)
        const markup = category.markupPercent || 10;
        const sellPrice = Math.ceil(item.price * (1 + markup / 100));

        await prisma.product.upsert({
          where: { skuCode: item.buyer_sku_code },
          update: {
            name: item.product_name,
            basicPrice: item.price,
            sellPrice: sellPrice,
            status: (item.buyer_product_status && item.seller_product_status) ? "active" : "inactive"
          },
          create: {
            categoryId: category.id,
            skuCode: item.buyer_sku_code.toLowerCase(),
            name: item.product_name,
            basicPrice: item.price,
            sellPrice: sellPrice,
            maxPrice: item.price * 1.5,
            status: "active"
          }
        })
        processedCount++;
      } else {
        skippedCount++;
        // Track unmatched brands
        if (!unmatchedBrands.includes(item.brand)) {
          unmatchedBrands.push(item.brand);
        }
      }
    }

    revalidatePath("/admin/produk")
    
    let message = `Berhasil memproses ${processedCount} produk dari ${rawProducts.length} data Digiflazz.`;
    if (skippedCount > 0) {
      message += ` ${skippedCount} produk tidak cocok dengan kategori manapun.`;
    }
    
    return { 
      success: true, 
      message,
      detail: {
        processed: processedCount,
        skipped: skippedCount,
        unmatchedBrands: unmatchedBrands.slice(0, 10) // Max 10 brands shown
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
