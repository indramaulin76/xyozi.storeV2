import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vouchers = await prisma.voucher.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(vouchers);
  } catch (error) {
    console.error('Error fetching vouchers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vouchers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      code,
      type,
      discountPrice,
      discountPercent,
      discountAdmin,
      minTransaction,
      maxUses,
      expiredAt,
    } = body;

    if (!code) {
      return NextResponse.json(
        { error: 'Kode voucher wajib diisi' },
        { status: 400 }
      );
    }

    const existingVoucher = await prisma.voucher.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingVoucher) {
      return NextResponse.json(
        { error: 'Kode voucher sudah digunakan' },
        { status: 400 }
      );
    }

    const voucher = await prisma.voucher.create({
      data: {
        code: code.toUpperCase(),
        type: type || 'BOTH',
        discountPrice: discountPrice || 0,
        discountPercent: discountPercent || 0,
        discountAdmin: discountAdmin || 0,
        minTransaction: minTransaction || 0,
        maxUses: maxUses || 0,
        expiredAt: expiredAt ? new Date(expiredAt) : null,
      },
    });

    return NextResponse.json(voucher);
  } catch (error) {
    console.error('Error creating voucher:', error);
    return NextResponse.json(
      { error: 'Failed to create voucher' },
      { status: 500 }
    );
  }
}
