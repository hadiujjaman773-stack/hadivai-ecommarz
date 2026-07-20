import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { revalidateStoreCache } from "@/lib/revalidate-store";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const { title, titleBn, subtitle, subtitleBn, image, link, active } = body;

    if (!title?.trim() || !titleBn?.trim() || !image?.trim()) {
      return jsonError("শিরোনাম ও ব্যানার ইমেজ প্রয়োজন");
    }

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: title.trim(),
        titleBn: titleBn.trim(),
        subtitle: subtitle?.trim() || null,
        subtitleBn: subtitleBn?.trim() || null,
        image: image.trim(),
        link: link?.trim() || null,
        active: active !== false,
      },
    });

    revalidateStoreCache("banners");
    return NextResponse.json(banner);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withAuth(async () => {
    const { id } = await params;
    const existing = await prisma.banner.findUnique({ where: { id } });
    if (!existing) return jsonError("ব্যানার পাওয়া যায়নি", 404);

    await prisma.$transaction(async (tx) => {
      await tx.banner.delete({ where: { id } });

      if (existing.isMain) {
        const next = await tx.banner.findFirst({
          where: { active: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        });
        if (next) {
          await tx.banner.update({
            where: { id: next.id },
            data: { isMain: true, order: 0 },
          });
        }
      }
    });

    revalidateStoreCache("banners");
    return NextResponse.json({ success: true });
  });
}
