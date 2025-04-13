import connectDB from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import rhymes from "@/model/rhymes.model";

export async function GET(req: NextRequest) {
  const email: any = req.nextUrl.searchParams.get("email");
  console.log(email);

  try {
    await connectDB();
    const val = await rhymes.findOne({ email });

    return NextResponse.json(val || {});
  } catch (e) {
    return NextResponse.json(
      {
        message: e,
      },
      {
        status: 400,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  const { email, rhymess }: any = await req.json();
  console.log(email, rhymess);

  try {
    await connectDB();
    const val = await rhymes.findOneAndUpdate(
      { email },
      {
        $push: {
          rhymes: { $each: rhymess },
        },
      },
      { new: true, upsert: true }
    );

    return NextResponse.json(val);
  } catch (e: any) {
    return NextResponse.json(
      {
        message: e.message,
      },
      {
        status: 400,
      }
    );
  }
}
