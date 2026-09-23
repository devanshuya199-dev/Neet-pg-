import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const state = searchParams.get("state") || undefined;
  const branchId = searchParams.get("branchId") || undefined;
  const year = Number(searchParams.get("year") || 2025);
  const quota = searchParams.get("quota") as any || undefined;
  const category = searchParams.get("category") as any || undefined;

  const rows = await prisma.cutoff.findMany({
    where: {
      year,
      ...(state ? { college: { state } } : {}),
      ...(branchId ? { branchId } : {}),
      ...(quota ? { quota } : {}),
      ...(category ? { category } : {})
    },
    include: { college: true, branch: true },
    orderBy: { closingRank: "asc" },
    take: 500
  });

  return NextResponse.json(rows);
}
