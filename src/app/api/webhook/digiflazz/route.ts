import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { sendWhatsAppNotification, sendAdminNotification } from '@/lib/whatsapp';

function formatPhone(phone: string): string {
  return phone.replace(/^0/, '62').replace(/\D/g, '');
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (e) {
      return NextResponse.json({ success: false, message: 'Invalid JSON' }, { status: 400 });
    }

    console.log('[Webhook Digiflazz] Received payload:', JSON.stringify(payload, null, 2));

    // Data dari Digiflazz Webhook biasanya dibungkus dalam object `data`
    const data = payload.data || payload;
    const refId = data.ref_id;
    const status = data.status; // Sukses, Gagal, Pending
    const sn = data.sn || null;
    const message = data.message || data.rd || null;

    if (!refId) {
      console.error('[Webhook Digiflazz] Missing ref_id in payload');
      return NextResponse.json({ success: false, message: 'Missing ref_id' }, { status: 400 });
    }

    // Optional: Validasi Signature Digiflazz
    // Signature dikirim via header x-hub-signature (contoh: sha1=...)
    // const signatureHeader = request.headers.get('x-hub-signature');
    // Jika user menyimpan DIGIFLAZZ_WEBHOOK_SECRET, bisa divalidasi dengan hmac sha1

    const order = await prisma.order.findUnique({
      where: { referenceId: refId },
      include: {
        product: {
          include: {
            category: true
          }
        }
      }
    });

    if (!order) {
      console.error(`[Webhook Digiflazz] Order tidak ditemukan: ${refId}`);
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    if (order.digiflazzStatus === 'SUCCESS') {
      console.log(`[Webhook Digiflazz] Order ${order.id} sudah sukses sebelumnya. Abaikan.`);
      return NextResponse.json({ success: true, message: 'Already processed as SUCCESS' });
    }

    // Mapping status Digiflazz ke status internal kita
    let internalStatus = order.digiflazzStatus;
    if (status === 'Sukses') {
      internalStatus = 'SUCCESS';
      console.log(`[Webhook Digiflazz] Update status BERHASIL untuk order ${order.id}, SN: ${sn}`);
    } else if (status === 'Gagal') {
      internalStatus = 'FAILED';
      console.log(`[Webhook Digiflazz] Update status GAGAL untuk order ${order.id}: ${message}`);
    } else if (status === 'Pending') {
      internalStatus = 'PROCESSING';
      console.log(`[Webhook Digiflazz] Status masih PROCESSING untuk order ${order.id}`);
    } else {
      console.warn(`[Webhook Digiflazz] Status tidak dikenal: ${status}`);
    }

    // Simpan ke database
    await prisma.order.update({
      where: { id: order.id },
      data: {
        digiflazzStatus: internalStatus,
        serialNumber: sn || order.serialNumber, // Update SN jika ada
        digiflazzMessage: message || order.digiflazzMessage, // Update pesan
      },
    });

    // Kirim WhatsApp notification jika status SUCCESS dan nomor tersedia
    if (internalStatus === 'SUCCESS' && order.customerPhone) {
      const waResult = await sendWhatsAppNotification({
        phoneNumber: order.customerPhone,
        customerName: 'Pelanggan',
        invoiceNumber: order.referenceId,
        productName: order.product.name,
        serialNumber: sn || order.serialNumber,
      });
      
      if (!waResult.success) {
        console.warn(`[Webhook Digiflazz] Gagal kirim WhatsApp untuk order ${order.id}:`, waResult.error);
        await sendAdminNotification({
          type: 'FAILED',
          invoiceNumber: order.referenceId,
          customerPhone: formatPhone(order.customerPhone),
          error: waResult.error || 'Unknown error',
        });
      }
    }

    // Kirim notifikasi ke admin jika transaksi GAGAL
    if (internalStatus === 'FAILED') {
      await sendAdminNotification({
        type: 'FAILED',
        invoiceNumber: order.referenceId,
        customerPhone: order.customerPhone ? formatPhone(order.customerPhone) : 'N/A',
        error: `Transaksi GAGAL - ${message || 'Tidak ada pesan'}`,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook processed successfully',
    });

  } catch (error) {
    console.error('[Webhook Digiflazz] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
