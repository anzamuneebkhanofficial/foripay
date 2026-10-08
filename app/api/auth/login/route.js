import { NextResponse } from "next/server";
import { authenticateUser, createSessionCookie } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);
    await createSessionCookie(user);

    return NextResponse.json({
      success: true,
      message: "Signed in successfully.",
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Invalid credentials." },
      { status: 401 }
    );
  }
}
