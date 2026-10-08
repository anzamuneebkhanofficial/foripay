import { NextResponse } from "next/server";
import { generatePasswordResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required." },
        { status: 400 }
      );
    }

    try {
      const { token, user } = await generatePasswordResetToken(email);

      // Send password reset email asynchronously
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetToken: token,
      });
    } catch {
      // Don't leak whether account exists or not for security
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, a password reset link has been dispatched.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to process password reset request." },
      { status: 500 }
    );
  }
}
