import { NextResponse } from "next/server";
import { createOrder } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, address, city, district, note, items, subtotal, shipping, total } = body;

    if (!fullName || !phone || !address || !city || !items?.length) {
      return NextResponse.json(
        { error: "প্রয়োজনীয় তথ্য পূরণ করুন" },
        { status: 400 }
      );
    }

    const order = await createOrder({
      fullName,
      phone,
      address,
      city,
      district,
      note,
      items,
      subtotal,
      shipping: shipping ?? 120,
      total,
    });

    return NextResponse.json(order);
  } catch {
    return NextResponse.json(
      { error: "অর্ডার জমা দিতে সমস্যা হয়েছে" },
      { status: 500 }
    );
  }
}
