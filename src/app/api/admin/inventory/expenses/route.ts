import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth, jsonError } from "@/lib/admin-api";
import { paginateArray, parsePaginationParams } from "@/lib/pagination";

export async function GET(request: Request) {
  return withInventoryAuth(async () => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    let expenses = await prisma.expense.findMany({
      where: category ? { category } : undefined,
      orderBy: { date: "desc" },
    });

    if (search?.trim()) {
      const term = search.trim().toLowerCase();
      expenses = expenses.filter(
        (e) =>
          e.title.toLowerCase().includes(term) ||
          (e.titleBn?.toLowerCase().includes(term) ?? false)
      );
    }

    const { page, pageSize } = parsePaginationParams(searchParams);
    return NextResponse.json(paginateArray(expenses, page, pageSize));
  });
}

export async function POST(request: Request) {
  return withInventoryAuth(async () => {
    const body = await request.json();
    const { title, titleBn, category, amount, note, date } = body;

    if (!title || amount === undefined) {
      return jsonError("শিরোনাম ও পরিমাণ প্রয়োজন");
    }

    const expense = await prisma.expense.create({
      data: {
        title,
        titleBn: titleBn || null,
        category: category || "other",
        amount: Number(amount),
        note: note || null,
        date: date ? new Date(date) : new Date(),
      },
    });

    return NextResponse.json(expense, { status: 201 });
  });
}
