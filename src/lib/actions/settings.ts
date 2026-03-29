"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

interface WebsiteSettings {
  siteName: string
  siteLogo: string | null
  siteLogoText: string
  siteTagline: string
  seoTitle: string
  seoDescription: string
  seoKeywords: string
  socialFacebook: string
  socialInstagram: string
  socialTikTok: string
  socialYouTube: string
  contactEmail: string
  contactWhatsApp: string
  contactAddress: string
  contactHotline: string
  pageAboutUs: string
  pageTermsOfService: string
  pagePrivacyPolicy: string
  footerCopyright: string
  // API Digiflazz
  digiflazzUsername: string
  digiflazzApiKey: string
  digiflazzEndpoint: string
  digiflazzTesting: boolean
  // API Sukurupiah
  sukurupiahApiId: string
  sukurupiahApiKey: string
  sukurupiahEndpoint: string
}

export async function getWebsiteSettings(): Promise<WebsiteSettings> {
  try {
    const settings = await prisma.settings.findMany()
    
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)
    
    return {
      siteName: settingsMap["site_name"] || "Xyozi Store",
      siteLogo: settingsMap["site_logo"] || null,
      siteLogoText: settingsMap["site_logo_text"] || "Tokomu",
      siteTagline: settingsMap["site_tagline"] || "Top Up Game Terpercaya",
      seoTitle: settingsMap["seo_title"] || "",
      seoDescription: settingsMap["seo_description"] || "",
      seoKeywords: settingsMap["seo_keywords"] || "",
      socialFacebook: settingsMap["social_facebook"] || "",
      socialInstagram: settingsMap["social_instagram"] || "",
      socialTikTok: settingsMap["social_tiktok"] || "",
      socialYouTube: settingsMap["social_youtube"] || "",
      contactEmail: settingsMap["contact_email"] || "",
      contactWhatsApp: settingsMap["contact_whatsapp"] || "",
      contactAddress: settingsMap["contact_address"] || "",
      contactHotline: settingsMap["contact_hotline"] || "",
      pageAboutUs: settingsMap["page_about_us"] || "",
      pageTermsOfService: settingsMap["page_tos"] || "",
      pagePrivacyPolicy: settingsMap["page_privacy"] || "",
      footerCopyright: settingsMap["footer_copyright"] || `© ${new Date().getFullYear()} Xyozi Store. All rights reserved.`,
      // API Settings
      digiflazzUsername: settingsMap["digiflazz_username"] || "",
      digiflazzApiKey: settingsMap["digiflazz_api_key"] || "",
      digiflazzEndpoint: settingsMap["digiflazz_endpoint"] || "https://api.digiflazz.com/v1",
      digiflazzTesting: settingsMap["digiflazz_testing"] === "true",
      sukurupiahApiId: settingsMap["sukurupiah_api_id"] || "",
      sukurupiahApiKey: settingsMap["sukurupiah_api_key"] || "",
      sukurupiahEndpoint: settingsMap["sukurupiah_endpoint"] || process.env.SUKURUPIAH_ENDPOINT || "https://sakurupiah.id/api/",
    }
  } catch (error) {
    console.error("Error fetching website settings:", error)
    return {
      siteName: "Xyozi Store",
      siteLogo: null,
      siteLogoText: "Tokomu",
      siteTagline: "Top Up Game Terpercaya",
      seoTitle: "",
      seoDescription: "",
      seoKeywords: "",
      socialFacebook: "",
      socialInstagram: "",
      socialTikTok: "",
      socialYouTube: "",
      contactEmail: "",
      contactWhatsApp: "",
      contactAddress: "",
      contactHotline: "",
      pageAboutUs: "",
      pageTermsOfService: "",
      pagePrivacyPolicy: "",
      footerCopyright: `© ${new Date().getFullYear()} Xyozi Store. All rights reserved.`,
      digiflazzUsername: "",
      digiflazzApiKey: "",
      digiflazzEndpoint: "https://api.digiflazz.com/v1",
      digiflazzTesting: false,
      sukurupiahApiId: "",
      sukurupiahApiKey: "",
      sukurupiahEndpoint: "https://sakurupiah.id/api/",
    }
  }
}

export async function updateWebsiteSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.settings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
    
    revalidatePath("/")
    revalidatePath("/admin/pengaturan")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating website setting:", error)
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}

export async function updateWebsiteSettings(data: Partial<WebsiteSettings>): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: { key: string; value: string }[] = []
    
    if (data.siteName !== undefined) updates.push({ key: "site_name", value: data.siteName })
    if (data.siteLogo !== undefined) updates.push({ key: "site_logo", value: data.siteLogo || "" })
    if (data.siteLogoText !== undefined) updates.push({ key: "site_logo_text", value: data.siteLogoText })
    if (data.siteTagline !== undefined) updates.push({ key: "site_tagline", value: data.siteTagline })
    if (data.seoTitle !== undefined) updates.push({ key: "seo_title", value: data.seoTitle })
    if (data.seoDescription !== undefined) updates.push({ key: "seo_description", value: data.seoDescription })
    if (data.seoKeywords !== undefined) updates.push({ key: "seo_keywords", value: data.seoKeywords })
    if (data.socialFacebook !== undefined) updates.push({ key: "social_facebook", value: data.socialFacebook })
    if (data.socialInstagram !== undefined) updates.push({ key: "social_instagram", value: data.socialInstagram })
    if (data.socialTikTok !== undefined) updates.push({ key: "social_tiktok", value: data.socialTikTok })
    if (data.socialYouTube !== undefined) updates.push({ key: "social_youtube", value: data.socialYouTube })
    if (data.contactEmail !== undefined) updates.push({ key: "contact_email", value: data.contactEmail })
    if (data.contactWhatsApp !== undefined) updates.push({ key: "contact_whatsapp", value: data.contactWhatsApp })
    if (data.contactAddress !== undefined) updates.push({ key: "contact_address", value: data.contactAddress })
    if (data.contactHotline !== undefined) updates.push({ key: "contact_hotline", value: data.contactHotline })
    if (data.pageAboutUs !== undefined) updates.push({ key: "page_about_us", value: data.pageAboutUs })
    if (data.pageTermsOfService !== undefined) updates.push({ key: "page_tos", value: data.pageTermsOfService })
    if (data.pagePrivacyPolicy !== undefined) updates.push({ key: "page_privacy", value: data.pagePrivacyPolicy })
    if (data.footerCopyright !== undefined) updates.push({ key: "footer_copyright", value: data.footerCopyright })
    
    // API Settings
    if (data.digiflazzUsername !== undefined) updates.push({ key: "digiflazz_username", value: data.digiflazzUsername })
    if (data.digiflazzApiKey !== undefined) updates.push({ key: "digiflazz_api_key", value: data.digiflazzApiKey })
    if (data.digiflazzEndpoint !== undefined) updates.push({ key: "digiflazz_endpoint", value: data.digiflazzEndpoint })
    if (data.digiflazzTesting !== undefined) updates.push({ key: "digiflazz_testing", value: data.digiflazzTesting ? "true" : "false" })
    
    if (data.sukurupiahApiId !== undefined) updates.push({ key: "sukurupiah_api_id", value: data.sukurupiahApiId })
    if (data.sukurupiahApiKey !== undefined) updates.push({ key: "sukurupiah_api_key", value: data.sukurupiahApiKey })
    if (data.sukurupiahEndpoint !== undefined) updates.push({ key: "sukurupiah_endpoint", value: data.sukurupiahEndpoint })
    
    for (const update of updates) {
      await prisma.settings.upsert({
        where: { key: update.key },
        update: { value: update.value },
        create: { key: update.key, value: update.value },
      })
    }
    
    revalidatePath("/")
    revalidatePath("/admin/pengaturan")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating website settings:", error)
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}

export async function getFlashSaleSettings() {
  try {
    const settings = await prisma.settings.findMany()
    const settingsMap = settings.reduce((acc, s) => {
      acc[s.key] = s.value
      return acc
    }, {} as Record<string, string>)
    
    return {
      enabled: settingsMap["flash_sale_enabled"] === "true",
      endTime: settingsMap["flash_sale_end_time"] ? new Date(settingsMap["flash_sale_end_time"]) : null,
    }
  } catch (error) {
    console.error("Error fetching flash sale settings:", error)
    return { enabled: false, endTime: null }
  }
}

export async function updateFlashSaleSettings(enabled: boolean, endTime?: string): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.settings.upsert({
      where: { key: "flash_sale_enabled" },
      update: { value: enabled ? "true" : "false" },
      create: { key: "flash_sale_enabled", value: enabled ? "true" : "false" },
    })

    if (endTime) {
      await prisma.settings.upsert({
        where: { key: "flash_sale_end_time" },
        update: { value: endTime },
        create: { key: "flash_sale_end_time", value: endTime },
      })
    }
    
    revalidatePath("/")
    revalidatePath("/admin/flash-sale")
    
    return { success: true }
  } catch (error) {
    console.error("Error updating flash sale settings:", error)
    return { success: false, error: "Gagal menyimpan pengaturan" }
  }
}
