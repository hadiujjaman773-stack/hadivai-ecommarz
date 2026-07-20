import { NextResponse } from "next/server";
import { withAuth, jsonError } from "@/lib/admin-api";
import { uploadImage, getUploadMode } from "@/lib/image-upload";

export async function GET() {
  return withAuth(async () => {
    const mode = getUploadMode();
    return NextResponse.json({
      mode,
      message:
        mode === "imgbb"
          ? "ImgBB আপলোড সক্রিয়"
          : mode === "cloudflare"
          ? "Cloudflare Images আপলোড সক্রিয়"
          : "লোকাল আপলোড সক্রিয় (public/uploads)। ImgBB-তে পাঠাতে .env-এ IMGBB_API_KEY যোগ করুন",
    });
  });
}

export async function POST(request: Request) {
  return withAuth(async () => {
    try {
      const formData = await request.formData();
      const file = formData.get("file");

      if (!file || !(file instanceof File)) {
        return jsonError("ফাইল প্রয়োজন");
      }

      if (!file.type.startsWith("image/")) {
        return jsonError("শুধু ইমেজ ফাইল গ্রহণযোগ্য");
      }

      if (file.size > 10 * 1024 * 1024) {
        return jsonError("ফাইল সর্বোচ্চ ১০MB");
      }

      const result = await uploadImage(file, file.name || "image.jpg");
      return NextResponse.json(result);
    } catch (err) {
      console.error("[upload]", err);
      return jsonError(
        err instanceof Error ? err.message : "আপলোড ব্যর্থ",
        500
      );
    }
  });
}
