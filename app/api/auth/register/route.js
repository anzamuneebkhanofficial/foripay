import { NextResponse } from "next/server";
import { registerUser, createSessionCookie, generateEmailVerificationToken } from "@/lib/auth";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, businessName } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Register real user
    const user = await registerUser({ name, email, password, businessName });
    
    // Generate Email Verification Token
    const verificationToken = await generateEmailVerificationToken(user.email);

    // Send welcome email via Nodemailer asynchronously
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      businessName: user.businessName,
      verificationToken, // Pass token for email template
    }).catch((err) => {
      console.error("Welcome email delivery notice:", err.message);
    });

    return NextResponse.json({
      success: true,
      message: "Registration successful. Please check your email to verify your account.",
      user,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create account." },
      { status: 400 }
    );
  }
}
