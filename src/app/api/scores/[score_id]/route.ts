import { NextRequest, NextResponse } from "next/server";

import connectDB from "@/utils/db";
import Score from "@/model/score.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ score_id: string }> }
) {
  try {
    await connectDB();
    const { score_id } = await params;

    const score = await Score.findById(score_id);
    if (!score) {
      return NextResponse.json({ error: "Score not found" }, { status: 404 });
    }

    return NextResponse.json({ score }, { status: 200 });
  } catch (error) {
    console.error("Error fetching score:", error);
    return NextResponse.json(
      { error: "Failed to fetch score" },
      { status: 500 }
    );
  }
}
