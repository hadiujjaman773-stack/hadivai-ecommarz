function getImgBbApiKey(): string {
  return process.env.IMGBB_API_KEY?.replace(/^["']|["']$/g, "").trim() ?? "";
}

export function isImgBbConfigured(): boolean {
  return Boolean(getImgBbApiKey());
}

export async function uploadToImgBb(file: File | Blob, filename: string) {
  const apiKey = getImgBbApiKey();
  if (!apiKey) {
    throw new Error("ImgBB API key সেটআপ করা নেই");
  }

  const formData = new FormData();
  const blob =
    file instanceof File
      ? file
      : new Blob([file], { type: "application/octet-stream" });
  formData.append("image", blob, filename);
  formData.append("name", filename.replace(/\.[^.]+$/, "").slice(0, 100));

  const response = await fetch(
    `https://api.imgbb.com/1/upload?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      body: formData,
      cache: "no-store",
    }
  );

  let payload: {
    success?: boolean;
    error?: { message?: string };
    data?: {
      id?: string;
      url?: string;
      display_url?: string;
    };
  };

  try {
    payload = await response.json();
  } catch {
    throw new Error(`ImgBB API ত্রুটি (HTTP ${response.status})`);
  }

  if (!response.ok || !payload.success || !payload.data?.url) {
    throw new Error(
      payload.error?.message || `ImgBB আপলোড ব্যর্থ (HTTP ${response.status})`
    );
  }

  return {
    id: payload.data.id || payload.data.url,
    url: payload.data.display_url || payload.data.url,
    provider: "imgbb" as const,
  };
}
