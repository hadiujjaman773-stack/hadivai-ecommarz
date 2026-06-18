import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const { name, nameBn, price, active } = body;

    if (!name || !nameBn || price === undefined) {
      return jsonError("নাম ও মূল্য প্রয়োজন");
    }

    const item = await prisma.shipping.update({
      where: { id },
      data: {
        name,
        nameBn,
        price: Number(price),
        active: active !== false,
      },
    });
    return NextResponse.json(item);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    await prisma.shipping.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
