import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { revalidateStoreCache } from "@/lib/revalidate-store";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return jsonError("ব্যানার পাওয়া যায়নি", 404);

    const banner = await prisma.$transaction(async (tx) => {
      await tx.banner.updateMany({ data: { isMain: false } });
      return tx.banner.update({
        where: { id },
        data: { isMain: true, order: 0, active: true },
      });
    });

    revalidateStoreCache("banners");
    return NextResponse.json(banner);
  });
}
