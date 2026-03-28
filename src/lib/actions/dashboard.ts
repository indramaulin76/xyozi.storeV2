"use server"

import { prisma } from "@/lib/prisma"

export async function getDashboardStats() {
  try {
    const [
      totalRevenue,
      successOrders,
      pendingOrders,
      totalCustomers,
      totalProducts,
      totalCategories
    ] = await Promise.all([
      prisma.order.aggregate({
        _sum: { amount: true },
        where: { paymentStatus: 'LUNAS' }
      }),
      prisma.order.count({
        where: { digiflazzStatus: 'SUCCESS' }
      }),
      prisma.order.count({
        where: { paymentStatus: 'PENDING' }
      }),
      prisma.order.groupBy({
        by: ['userGameId'],
        _count: true
      }),
      prisma.product.count(),
      prisma.category.count()
    ])

    return {
      totalRevenue: totalRevenue._sum.amount || 0,
      successOrders,
      pendingOrders,
      totalCustomers: totalCustomers.length,
      totalProducts,
      totalCategories
    }
  } catch (error) {
    console.error("Error getting dashboard stats:", error)
    return {
      totalRevenue: 0,
      successOrders: 0,
      pendingOrders: 0,
      totalCustomers: 0,
      totalProducts: 0,
      totalCategories: 0
    }
  }
}

export async function getRecentOrders(limit: number = 5) {
  try {
    const orders = await prisma.order.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    })
    return orders
  } catch (error) {
    console.error("Error getting recent orders:", error)
    return []
  }
}

import { getWebsiteSettings } from "./settings"
import crypto from 'crypto'

export async function checkSystemStatus() {
  const settings = await getWebsiteSettings()
  
  const status = {
    database: { status: 'Unknown', color: 'text-slate-400' },
    digiflazz: { status: 'Unknown', color: 'text-slate-400' },
    sukurupiah: { status: 'Unknown', color: 'text-slate-400' },
    serverMode: { status: 'Unknown', color: 'text-slate-400' }
  }

  // Check Database
  try {
    await prisma.$queryRaw`SELECT 1`
    status.database = { status: 'Connected', color: 'text-green-500' }
  } catch {
    status.database = { status: 'Disconnected', color: 'text-red-500' }
  }

  // Check Digiflazz (Cek Saldo untuk memastikan API Key benar)
  try {
    if (!settings.digiflazzUsername || !settings.digiflazzApiKey) {
      status.digiflazz = { status: 'Not Configured', color: 'text-yellow-500' }
    } else {
      const sign = crypto.createHash('md5').update(`${settings.digiflazzUsername}${settings.digiflazzApiKey}depo`).digest('hex');
      const res = await fetch(`${settings.digiflazzEndpoint}/cek-saldo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cmd: 'deposit',
          username: settings.digiflazzUsername,
          sign: sign
        }),
        cache: 'no-store'
      })
      const data = await res.json()
      if (res.ok && data.data && data.data.status !== 'Gagal') {
        status.digiflazz = { status: 'Connected', color: 'text-green-500' }
      } else {
        status.digiflazz = { status: 'Error', color: 'text-red-500' }
      }
    }
  } catch {
    status.digiflazz = { status: 'Offline', color: 'text-red-500' }
  }

  // Check Sukurupiah (Cek Balance)
  try {
    if (!settings.sukurupiahApiId || !settings.sukurupiahApiKey) {
      status.sukurupiah = { status: 'Not Configured', color: 'text-yellow-500' }
    } else {
      const formData = new URLSearchParams({
        api_id: settings.sukurupiahApiId,
        method: 'balance',
      });

      const res = await fetch(`${settings.sukurupiahEndpoint}check_balance.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.sukurupiahApiKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
        cache: 'no-store'
      })
      const data = await res.json()
      if (res.ok && data.status === '200') {
        status.sukurupiah = { status: 'Connected', color: 'text-green-500' }
      } else {
        status.sukurupiah = { status: 'Error', color: 'text-yellow-500' }
      }
    }
  } catch {
    status.sukurupiah = { status: 'Offline', color: 'text-red-500' }
  }

  // Server Mode
  const isSandbox = settings.digiflazzTesting
  status.serverMode = {
    status: isSandbox ? 'Sandbox' : 'Production',
    color: isSandbox ? 'text-yellow-500' : 'text-blue-500'
  }

  return status
}
