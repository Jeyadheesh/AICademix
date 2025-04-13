import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Assessment from "@/model/assessment.model";

export async function GET(
  req: NextRequest,
  { params }: { params: { assessment_id: string } }
) {
  try {
    await connectDB();
    const { assessment_id } = params;

    const assessment = await Assessment.findById(assessment_id);
    if (!assessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ assessments: [assessment] }, { status: 200 });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    return NextResponse.json(
      { error: "Failed to fetch assessment" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { assessment_id: string } }
) {
  try {
    await connectDB();
    const { assessment_id } = params;
    const { title, mcq, fillInBlanks, shortAnswer } = await req.json();

    // Find and update the assessment
    const updatedAssessment = await Assessment.findByIdAndUpdate(
      assessment_id,
      { title, mcq, fillInBlanks, shortAnswer },
      { new: true } // Return the updated document
    );

    if (!updatedAssessment) {
      return NextResponse.json(
        { error: "Assessment not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: "Assessment updated successfully!",
        assessment: updatedAssessment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating assessment:", error);
    return NextResponse.json(
      { error: "Failed to update assessment" },
      { status: 500 }
    );
  }
}
