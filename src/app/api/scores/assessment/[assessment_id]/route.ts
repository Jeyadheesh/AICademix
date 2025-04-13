import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Score from "@/model/score.model";
import User from "@/model/user.model";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ assessment_id: string }> }
) {
  try {
    await connectDB();
    const { assessment_id } = await params;

    // Find all scores for this assessment
    const scores = await Score.find({
      assessmentId: assessment_id,
    }).sort({ createdAt: -1 });

    // If no scores, return empty array
    if (!scores || scores.length === 0) {
      return NextResponse.json({ scores: [] }, { status: 200 });
    }

    // Get unique user IDs from scores
    const userIds = [...new Set(scores.map((score) => score.userId))];

    // Fetch user data for these IDs to get names
    const users = await User.find({
      _id: { $in: userIds },
    });

    // Create a map of user IDs to names
    const userMap: any = {};
    users.forEach((user) => {
      userMap[user._id.toString()] = user.name || user.email;
    });

    // Enhance score data with student names
    const enhancedScores = scores.map((score) => {
      const scoreObj = score.toObject();
      return {
        ...scoreObj,
        studentName: userMap[score.userId.toString()] || "Unknown Student",
        submittedAt: score.createdAt,
      };
    });

    return NextResponse.json({ scores: enhancedScores }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assessment scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment scores" },
      { status: 500 }
    );
  }
}
