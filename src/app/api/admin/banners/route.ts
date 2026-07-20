import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withAuth, jsonError } from "@/lib/admin-api";
import { revalidateStoreCache } from "@/lib/revalidate-store";

export async function GET() {
  return withAuth(async () => {
    const banners = await prisma.banner.findMany({
      orderBy: [{ isMain: "desc" }, { order: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json(banners);
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    const body = await request.json();
    const { title, titleBn, subtitle, subtitleBn, image, link, active, isMain } =
      body;

    if (!title?.trim() || !titleBn?.trim() || !image?.trim()) {
      return jsonError("শিরোনাম ও ব্যানার ইমেজ প্রয়োজন");
    }

    const count = await prisma.banner.count();
    const makeMain = isMain === true || count === 0;

    const banner = await prisma.$transaction(async (tx) => {
      if (makeMain) {
        await tx.banner.updateMany({ data: { isMain: false } });
      }

      return tx.banner.create({
        data: {
          title: title.trim(),
          titleBn: titleBn.trim(),
          subtitle: subtitle?.trim() || null,
          subtitleBn: subtitleBn?.trim() || null,
          image: image.trim(),
          link: link?.trim() || null,
          active: active !== false,
          isMain: makeMain,
          order: makeMain ? 0 : count,
        },
      });
    });

    revalidateStoreCache("banners");
    return NextResponse.json(banner, { status: 201 });
  });
}
