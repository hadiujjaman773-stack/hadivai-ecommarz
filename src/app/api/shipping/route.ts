import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const shipping = await prisma.shipping.findMany({
      where: { active: true },
      orderBy: { price: "asc" },
      select: { id: true, name: true, nameBn: true, price: true },
    });
    return NextResponse.json(shipping);
  } catch {
    return NextResponse.json([]);
  }
}
