import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withInventoryAuth, jsonError } from "@/lib/admin-api";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  return withInventoryAuth(async () => {
    const { id } = await params;
    const body = await request.json();
    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) return jsonError("খরচ পাওয়া যায়নি", 404);

    const expense = await prisma.expense.update({
      where: { id },
      data: {
        title: body.title ?? existing.title,
        titleBn: body.titleBn !== undefined ? body.titleBn : existing.titleBn,
        category: body.category ?? existing.category,
        amount: body.amount !== undefined ? Number(body.amount) : existing.amount,
        note: body.note !== undefined ? body.note : existing.note,
        date: body.date ? new Date(body.date) : existing.date,
      },
    });

    return NextResponse.json(expense);
  });
}

export async function DELETE(_request: Request, { params }: Params) {
  return withInventoryAuth(async () => {
    const { id } = await params;
    await prisma.expense.delete({ where: { id } });
    return NextResponse.json({ success: true });
  });
}
