/**
 * Script untuk reset status order yang gagal agar bisa diproses ulang.
 * 
 * Usage: npx tsx scripts/reset-order.ts <REFERENCE_ID>
 * Contoh: npx tsx scripts/reset-order.ts XY-260328-NH9AF
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const refId = process.argv[2]

  if (!refId) {
    console.log('Usage: npx tsx scripts/reset-order.ts <REFERENCE_ID>')
    console.log('Contoh: npx tsx scripts/reset-order.ts XY-260328-NH9AF')
    
    // Tampilkan order terbaru yang bermasalah
    const recentOrders = await prisma.order.findMany({
      where: {
        OR: [
          { digiflazzStatus: 'FAILED' },
          { digiflazzStatus: 'PROCESSING' },
          { paymentStatus: 'LUNAS', digiflazzStatus: 'PENDING' },
        ]
      },
      select: { referenceId: true, paymentStatus: true, digiflazzStatus: true, isPaymentProcessed: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    if (recentOrders.length > 0) {
      console.log('\n📋 Order yang bermasalah:')
      for (const o of recentOrders) {
        console.log(`  ${o.referenceId} | payment: ${o.paymentStatus} | digiflazz: ${o.digiflazzStatus} | processed: ${o.isPaymentProcessed} | ${o.createdAt.toISOString()}`)
      }
    } else {
      console.log('\n✅ Tidak ada order bermasalah.')
    }
    return
  }

  const order = await prisma.order.findUnique({
    where: { referenceId: refId },
  })

  if (!order) {
    console.error(`❌ Order dengan referenceId "${refId}" tidak ditemukan.`)
    return
  }

  console.log('📋 Order ditemukan:')
  console.log(`  ID: ${order.id}`)
  console.log(`  Ref: ${order.referenceId}`)
  console.log(`  Payment: ${order.paymentStatus}`)
  console.log(`  Digiflazz: ${order.digiflazzStatus}`)
  console.log(`  isPaymentProcessed: ${order.isPaymentProcessed}`)

  // Reset agar bisa diproses ulang oleh webhook
  await prisma.order.update({
    where: { id: order.id },
    data: {
      isPaymentProcessed: false,
      digiflazzStatus: 'PENDING',
    },
  })

  console.log('\n✅ Order berhasil direset:')
  console.log('  isPaymentProcessed -> false')
  console.log('  digiflazzStatus -> PENDING')
  console.log('\n📌 Sekarang webhook Sakurupiah bisa memproses ulang order ini.')
  console.log('   Atau trigger manual top-up lagi.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
