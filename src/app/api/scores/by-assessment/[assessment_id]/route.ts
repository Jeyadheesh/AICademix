import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Score from "@/model/score.model";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ assessment_id: string }> }
) {
  try {
    await connectDB();
    const { assessment_id } = await params;
    const { student_id } = await req.json();

    if (!student_id) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Find the most recent score for this user and assessment
    const score = await Score.findOne({
      userId: student_id,
      assessmentId: assessment_id,
    }).sort({ createdAt: -1 });

    if (score) {
      return NextResponse.json({ scoreId: score._id }, { status: 200 });
    }

    return NextResponse.json(
      { message: "No previous attempts" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking previous attempts:", error);
    return NextResponse.json(
      { error: "Failed to check previous attempts" },
      { status: 500 }
    );
  }
}
