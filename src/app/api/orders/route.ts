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
    const { fullName, email, phone, address, city, district, note, items, subtotal, shipping, total } = body;

    if (!fullName || !phone || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় তথ্য পূরণ করুন" },
        { status: 400 }
      );
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
      subtotal,
      shipping: shipping ?? 120,
      total,
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
