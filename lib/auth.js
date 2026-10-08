import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import crypto from "crypto";
import { connectToDatabase } from "./mongodb";
import User from "@/models/User";
import { signSessionToken, verifySessionToken } from "./session";

/**
 * Production Authentication & Authorization Engine (MongoDB + Mongoose)
 * - 100% Real Database: Zero local JSON file dependency.
 * - System Administrator configured via environment (ADMIN_EMAIL / ADMIN_PASSWORD).
 * - Statistically verified, cryptographically signed HTTP-only session tokens.
 */

function getAdminUser() {
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@paylock.io").toLowerCase().trim();
  const adminPass = (process.env.ADMIN_PASSWORD || "AdminPayLock2026!").replace(/^"|"$/g, "").trim();

  return {
    id: "usr_admin_root",
    name: "System Administrator",
    email: adminEmail,
    businessName: "ForiPay Admin Node",
    role: "admin",
    walletBtc: "bc1qadminvault983ks09f2k03jf02jf920jf02jf920jf92",
    walletEth: "0x49c952F39180fFa218D15A5237C0d7B190e29490",
    createdAt: "2026-01-01T00:00:00.000Z",
    password: adminPass,
    isEmailVerified: true,
  };
}

export async function hashPassword(plainTextPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainTextPassword, salt);
}

export async function verifyPassword(plainTextPassword, hashedPassword) {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const normalized = email.toLowerCase().trim();
  const admin = getAdminUser();
  if (normalized === admin.email) {
    return admin;
  }

  await connectToDatabase();
  const user = await User.findOne({ email: normalized }).lean();
  if (!user) return null;

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    passwordHash: user.password,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    verificationToken: user.verificationToken,
    verificationTokenExpires: user.verificationTokenExpires,
    resetPasswordToken: user.resetPasswordToken,
    resetPasswordExpires: user.resetPasswordExpires,
    createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
  };
}

export async function findUserById(id) {
  if (!id) return null;
  const admin = getAdminUser();
  if (id === admin.id) return admin;

  await connectToDatabase();
  try {
    const user = await User.findById(id).lean();
    if (!user) return null;
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function getAllUsers() {
  await connectToDatabase();
  const users = await User.find({ role: { $ne: "admin" } })
    .sort({ createdAt: -1 })
    .lean();

  return users.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    role: u.role,
    isEmailVerified: u.isEmailVerified,
    createdAt: u.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

export async function deleteUser(id) {
  await connectToDatabase();
  try {
    await User.findByIdAndDelete(id);
    return true;
  } catch {
    return false;
  }
}

export async function registerUser({ name, email, password, businessName }) {
  const normalizedEmail = email.toLowerCase().trim();
  const admin = getAdminUser();

  if (normalizedEmail === admin.email) {
    throw new Error("This email is reserved for system administration.");
  }

  await connectToDatabase();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) {
    throw new Error("A merchant account with this email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const created = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: passwordHash,
    role: "user",
    isEmailVerified: false,
  });

  return {
    id: created._id.toString(),
    name: created.name,
    email: created.email,
    role: created.role,
    isEmailVerified: created.isEmailVerified,
    createdAt: created.createdAt.toISOString(),
  };
}

export async function authenticateUser(email, password) {
  const normalizedEmail = email?.toLowerCase().trim();
  const cleanPassword = (password || "").trim();
  const admin = getAdminUser();

  // 1. Verify Admin Credentials
  if (normalizedEmail === admin.email) {
    if (cleanPassword === admin.password) {
      return sanitizeUser(admin);
    }
    throw new Error("Invalid email or password.");
  }

  // 2. Verify Registered Merchant Credentials against MongoDB
  await connectToDatabase();
  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const isValid = await verifyPassword(cleanPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid email or password.");
  }

  if (user.isEmailVerified === false) {
    throw new Error("Please verify your email address before logging in.");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
    createdAt: user.createdAt.toISOString(),
  };
}

export async function generateEmailVerificationToken(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("No merchant account found with this email.");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  await connectToDatabase();
  await User.findOneAndUpdate(
    { email: user.email },
    {
      verificationToken: token,
      verificationTokenExpires: expiresAt,
    }
  );

  return token;
}

export async function verifyEmail(token) {
  if (!token) throw new Error("Verification token is required.");

  await connectToDatabase();
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired verification token.");
  }

  user.isEmailVerified = true;
  user.verificationToken = null;
  user.verificationTokenExpires = null;
  await user.save();

  return user.toSafeObject();
}

export async function generatePasswordResetToken(email) {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("No merchant account found with this email.");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await connectToDatabase();
  await User.findOneAndUpdate(
    { email: user.email },
    {
      resetPasswordToken: token,
      resetPasswordExpires: expiresAt,
    }
  );

  return { token, user };
}

export async function verifyAndResetPassword(token, newPassword) {
  if (!token) throw new Error("Reset token is required.");

  await connectToDatabase();
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("Invalid or expired reset token.");
  }

  user.password = await hashPassword(newPassword);
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();

  return user.toSafeObject();
}

export function sanitizeUser(user) {
  if (!user) return null;
  const { password, passwordHash, ...safe } = user;
  return safe;
}

// Session Cookie Management (Stateless Signed Cryptographic Tokens)
export async function createSessionCookie(user) {
  const safeUser = sanitizeUser(user);
  const token = await signSessionToken(safeUser);

  const cookieStore = await cookies();
  cookieStore.set("paylock_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });

  return token;
}

export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("paylock_session")?.value;
    if (!token) return null;

    const user = await verifySessionToken(token);
    return user || null;
  } catch {
    return null;
  }
}

export async function clearSessionCookie() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("paylock_session");
  } catch {}
}
