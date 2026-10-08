import { NextResponse } from "next/server";
import { verifyAndResetPassword } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and new password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    await verifyAndResetPassword(token, password);

    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to reset password." },
      { status: 400 }
    );
  }
}
