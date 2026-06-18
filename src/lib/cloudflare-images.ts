/** Strip optional quotes from .env values */
function env(name: string): string {
  const raw = process.env[name];
  if (!raw) return "";
  return raw.replace(/^["']|["']$/g, "").trim();
}

export function getCloudflareAccountHash(): string {
  return (
    env("CLOUDFLARE_IMAGES_ACCOUNT_HASH") ||
    "45b48483907720b366200f5efe9be218"
  );
}

export function getCloudflareDeliveryUrl(
  imageId: string,
  variant = "public"
) {
  return `https://imagedelivery.net/${getCloudflareAccountHash()}/${imageId}/${variant}`;
}

export function isCloudflareUploadConfigured(): boolean {
  return Boolean(env("CLOUDFLARE_ACCOUNT_ID") && env("CLOUDFLARE_API_TOKEN"));
}

export async function uploadToCloudflareImages(file: File | Blob, filename: string) {
  const accountId = env("CLOUDFLARE_ACCOUNT_ID");
  const apiToken = env("CLOUDFLARE_API_TOKEN");

  if (!accountId || !apiToken) {
    throw new Error(
      "Cloudflare API সেটআপ নেই। .env-এ CLOUDFLARE_ACCOUNT_ID ও CLOUDFLARE_API_TOKEN যোগ করুন"
    );
  }

  const formData = new FormData();
  const blob =
    file instanceof File
      ? file
      : new Blob([file], { type: "application/octet-stream" });
  formData.append("file", blob, filename);

  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/images/v1`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${apiToken}` },
      body: formData,
    }
  );

  let data: {
    success?: boolean;
    errors?: { message?: string }[];
    result?: { id: string; variants?: string[] };
  };

  try {
    data = await res.json();
  } catch {
    throw new Error(`Cloudflare API ত্রুটি (HTTP ${res.status})`);
  }

  if (!res.ok || !data.success) {
    const msg =
      data.errors?.[0]?.message ||
      `Cloudflare Images আপলোড ব্যর্থ (HTTP ${res.status})`;
    throw new Error(msg);
  }

  const result = data.result;
  if (!result?.id) {
    throw new Error("Cloudflare থেকে ইমেজ ID পাওয়া যায়নি");
  }

  const variantUrl = result.variants?.find((v) => v.includes("/public"))
    || result.variants?.[0];
  const url = variantUrl || getCloudflareDeliveryUrl(result.id, "public");

  return { id: result.id, url, provider: "cloudflare" as const };
}
