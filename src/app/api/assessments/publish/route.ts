import { NextResponse } from "next/server";
import connectDB from "@/utils/db";
import Assessment from "@/model/assessment.model";

    export async function POST(request: Request) {
    try {
        await connectDB();
        const { title, mcq, fillInBlanks, shortAnswer } = await request.json();

        // Debug: Log incoming data
        console.log("Incoming data:", { title, mcq, fillInBlanks, shortAnswer });

        // Validate required fields
        if (!title || !mcq || !fillInBlanks || !shortAnswer) {
        return NextResponse.json(
            { error: "All fields are required." },
            { status: 400 }
        );
        }

        // Create a new assessment
        const newAssessment = await Assessment.create({
        title,
        mcq,
        fillInBlanks,
        shortAnswer,
        });

        // Debug: Log the saved document
        console.log("Saved assessment:", newAssessment);

        return NextResponse.json(
        { message: "Published successfully!", assessment: newAssessment },
        { status: 201 }
        );
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json(
        { error: "Failed to publish assessment." },
        { status: 500 }
        );
    }
    }