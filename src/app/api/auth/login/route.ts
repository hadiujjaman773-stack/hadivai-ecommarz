import { NextResponse } from "next/server";
import { createSession, loginUser } from "@/lib/auth";
import { ensureDefaultAdmin } from "@/lib/bootstrap-admin";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "ইমেইল ও পাসওয়ার্ড প্রয়োজন" },
        { status: 400 }
      );
    }

    await ensureDefaultAdmin();

    const user = await loginUser(email.trim().toLowerCase(), password);
    if (!user) {
      return NextResponse.json(
        { error: "ভুল ইমেইল বা পাসওয়ার্ড" },
        { status: 401 }
      );
    }

    await createSession(user);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "লগইন ব্যর্থ" }, { status: 500 });
  }
}
