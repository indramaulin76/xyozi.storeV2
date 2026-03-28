import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const url = new URL(request.url);
    const amount = parseFloat(url.searchParams.get('amount') || '0');

    const voucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!voucher) {
      return NextResponse.json(
        { valid: false, error: 'Kode voucher tidak valid' },
        { status: 404 }
      );
    }

    if (!voucher.isActive) {
      return NextResponse.json(
        { valid: false, error: 'Voucher sudah tidak aktif' },
        { status: 400 }
      );
    }

    if (voucher.expiredAt && new Date() > voucher.expiredAt) {
      return NextResponse.json(
        { valid: false, error: 'Voucher sudah expired' },
        { status: 400 }
      );
    }

    if (voucher.maxUses > 0 && voucher.usedCount >= voucher.maxUses) {
      return NextResponse.json(
        { valid: false, error: 'Voucher sudah mencapai batas penggunaan' },
        { status: 400 }
      );
    }

    if (amount > 0 && voucher.minTransaction > amount) {
      return NextResponse.json(
        { valid: false, error: `Minimal transaksi Rp ${voucher.minTransaction.toLocaleString('id-ID')}` },
        { status: 400 }
      );
    }

    let discountPrice = 0;
    let discountAdmin = 0;

    if (voucher.discountPercent > 0 && amount > 0) {
      discountPrice = (amount * voucher.discountPercent) / 100;
    }

    if (voucher.discountPrice > 0) {
      discountPrice = Math.max(discountPrice, voucher.discountPrice);
    }

    if (voucher.discountAdmin > 0) {
      discountAdmin = voucher.discountAdmin;
    }

    const totalDiscount = discountPrice + discountAdmin;

    return NextResponse.json({
      valid: true,
      voucher: {
        code: voucher.code,
        type: voucher.type,
        discountPrice: voucher.discountPrice,
        discountPercent: voucher.discountPercent,
        discountAdmin: voucher.discountAdmin,
      },
      discount: {
        price: discountPrice,
        admin: discountAdmin,
        total: totalDiscount,
      },
    });
  } catch (error) {
    console.error('Error validating voucher:', error);
    return NextResponse.json(
      { valid: false, error: 'Terjadi kesalahan' },
      { status: 500 }
    );
  }
}
