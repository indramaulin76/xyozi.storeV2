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

export async function checkSystemStatus() {
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

  // Check Digiflazz
  try {
    const res = await fetch('https://api.digiflazz.com/v1/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: process.env.DIGIFLAZZ_USERNAME,
        sign: process.env.DIGIFLAZZ_SIGN
      }),
      cache: 'no-store'
    })
    if (res.ok) {
      status.digiflazz = { status: 'Connected', color: 'text-green-500' }
    } else {
      status.digiflazz = { status: 'Error', color: 'text-red-500' }
    }
  } catch {
    status.digiflazz = { status: 'Offline', color: 'text-red-500' }
  }

  // Check Sukurupiah
  try {
    const res = await fetch(`${process.env.SUKURUPIAH_URL}/balance`, {
      method: 'GET',
      headers: {
        'X-API-ID': process.env.SUKURUPIAH_API_ID || '',
        'X-API-KEY': process.env.SUKURUPIAH_API_KEY || ''
      },
      cache: 'no-store'
    })
    if (res.ok) {
      status.sukurupiah = { status: 'Connected', color: 'text-green-500' }
    } else {
      status.sukurupiah = { status: 'Error', color: 'text-yellow-500' }
    }
  } catch {
    status.sukurupiah = { status: 'Offline', color: 'text-red-500' }
  }

  // Server Mode
  const isSandbox = process.env.DIGIFLAZZ_TESTING === 'true'
  status.serverMode = {
    status: isSandbox ? 'Sandbox' : 'Production',
    color: isSandbox ? 'text-yellow-500' : 'text-blue-500'
  }

  return status
}
