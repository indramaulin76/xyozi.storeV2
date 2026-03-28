import { createHmac } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { processTopUpAfterPayment } from '@/lib/digiflazz';

interface WebhookPayload {
  trx_id: string;
  merchant_ref: string;
  status: 'pending' | 'berhasil' | 'expired';
  status_kode: number;
}

export async function POST(request: NextRequest) {
  try {
    const settings = await prisma.settings.findUnique({
      where: { key: 'sukurupiah_api_key' }
    });
    const API_KEY = settings?.value || process.env.SUKURUPIAH_API_KEY!;

    const payload: WebhookPayload = await request.json();

    console.log('[Webhook] Received callback:', JSON.stringify(payload, null, 2));

    const callbackSignature = request.headers.get('X-Callback-Signature');
    const callbackEvent = request.headers.get('X-Callback-Event');

    if (callbackEvent !== 'payment_status') {
      return NextResponse.json({
        success: false,
        message: `Unrecognized callback event: ${callbackEvent}`,
      }, { status: 400 });
    }

    const rawBody = JSON.stringify(payload);
    const expectedSignature = createHmac('sha256', API_KEY).update(rawBody).digest('hex');

    if (callbackSignature !== expectedSignature) {
      console.error('[Webhook] Invalid signature!');
      return NextResponse.json({
        success: false,
        message: 'Invalid signature',
      }, { status: 401 });
    }

    const order = await prisma.order.findUnique({
      where: { referenceId: payload.merchant_ref },
    });

    if (!order) {
      console.error(`[Webhook] Order tidak ditemukan: ${payload.merchant_ref}`);
      return NextResponse.json({
        success: false,
        message: 'Order not found',
      }, { status: 404 });
    }

    if (order.isPaymentProcessed) {
      console.log(`[Webhook] Order ${order.id} sudah diproses sebelumnya. Abaikan.`);
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
      });
    }

    if (payload.status === 'berhasil' && Number(payload.status_kode) === 1) {
      console.log(`[Webhook] Payment berhasil untuk order ${order.id}`);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'LUNAS',
          sakurupiahStatus: 'berhasil',
          isPaymentProcessed: true,
        },
      });

      console.log(`[Webhook] Triggering Digiflazz top-up untuk order ${order.id}...`);

      try {
        await processTopUpAfterPayment(order.id);
      } catch (error) {
        console.error(`[Webhook] Error saat process top-up:`, error);
      }

      return NextResponse.json({
        success: true,
        message: 'Payment status berhasil',
      });

    } else if (payload.status === 'expired' && Number(payload.status_kode) === 2) {
      console.log(`[Webhook] Payment expired untuk order ${order.id}`);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'EXPIRED',
          sakurupiahStatus: 'expired',
          isPaymentProcessed: true,
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment status expired',
      });

    } else if (payload.status === 'pending' && Number(payload.status_kode) === 0) {
      console.log(`[Webhook] Payment pending untuk order ${order.id}`);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          sakurupiahStatus: 'pending',
        },
      });

      return NextResponse.json({
        success: true,
        message: 'Payment status pending',
      });

    } else {
      console.error(`[Webhook] Unknown status: ${payload.status} (${payload.status_kode})`);
      return NextResponse.json({
        success: false,
        message: 'Unknown payment status',
      }, { status: 400 });
    }

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
    }, { status: 500 });
  }
}
