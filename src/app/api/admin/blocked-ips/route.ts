import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";

export async function GET(request: Request) {
  return withAuth(async () => {
    const ip = new URL(request.url).searchParams.get("ip");
    if (ip) {
      const blocked = await prisma.blockedIp.findUnique({ where: { ip } });
      return NextResponse.json({ blocked: !!blocked, record: blocked });
    }
    const list = await prisma.blockedIp.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { ip, reason, orderId } = body;

    if (!ip?.trim()) {
      return jsonError("IP ঠিকানা প্রয়োজন");
    }

    const record = await prisma.blockedIp.upsert({
      where: { ip: ip.trim() },
      create: {
        ip: ip.trim(),
        reason: reason?.trim() || null,
        orderId: orderId || null,
      },
      update: {
        reason: reason?.trim() || null,
        orderId: orderId || null,
      },
    });

    return NextResponse.json(record, { status: 201 });
  });
}

export async function DELETE(request: Request) {
  return withAuth(async () => {
    const ip = new URL(request.url).searchParams.get("ip");
    if (!ip?.trim()) {
      return jsonError("IP ঠিকানা প্রয়োজন");
    }

    await prisma.blockedIp.deleteMany({ where: { ip: ip.trim() } });
    return NextResponse.json({ success: true });
  });
}
