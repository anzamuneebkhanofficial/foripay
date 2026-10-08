import { NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required." },
        { status: 400 }
      );
    }

    const user = await verifyEmail(token);

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now log in.",
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to verify email." },
      { status: 400 }
    );
  }
}
