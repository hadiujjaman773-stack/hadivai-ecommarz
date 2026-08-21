import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";
import { getClientIp } from "@/lib/client-ip";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request);
    if (clientIp) {
      const blocked = await prisma.blockedIp.findUnique({
        where: { ip: clientIp },
      });
      if (blocked) {
        return NextResponse.json(
          { error: "আপনার অ্যাক্সেস সীমিত। সাপোর্টে যোগাযোগ করুন।" },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const {
      fullName,
      email,
      phone,
      address,
      city,
      district,
      note,
      items,
      subtotal,
      shipping,
      total,
    } = body;

    if (!fullName || !phone || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় তথ্য পূরণ করুন" },
        { status: 400 }
      );
    }

    const productIds = Array.from(
      new Set(
        (items as Array<{ productId?: string }>)
          .map((item) => item.productId)
          .filter((id): id is string => Boolean(id))
      )
    );

    let finalShipping = Number(shipping) || 0;
    let finalTotal = Number(total) || Number(subtotal) + finalShipping;

    if (productIds.length > 0) {
      const products = await prisma.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, shippingFree: true },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      const knownIds = productIds.filter((id) => byId.has(id));
      const allFree =
        knownIds.length > 0 &&
        knownIds.every((id) => byId.get(id)?.shippingFree === true);

      if (allFree) {
        finalShipping = 0;
        finalTotal = Number(subtotal) || 0;
      }
    }

    const order = await createOrder({
      fullName,
      email: email?.trim() || undefined,
      phone,
      address,
      city,
      district,
      note,
      items,
      subtotal: Number(subtotal) || 0,
      shipping: finalShipping,
      total: finalTotal,
      clientIp: clientIp || undefined,
    });

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "অর্ডার জমা দিতে সমস্যা হয়েছে",
      },
      { status: 400 }
    );
  }
}
