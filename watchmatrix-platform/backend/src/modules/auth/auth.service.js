import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../../config/prisma.js";

let sellerProfileSupportCache = null;

function buildAuthResponse(user) {
  const accessToken = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  return {
    user,
    accessToken
  };
}

function normalizeSellerProfile(profile = {}) {
  return {
    businessName: String(profile.businessName || "").trim(),
    businessType: String(profile.businessType || "").trim(),
    businessAddress: String(profile.businessAddress || "").trim(),
    panOrVat: String(profile.panOrVat || "").trim(),
    phone: String(profile.phone || "").trim(),
    yearsInBusiness: Number.isInteger(profile.yearsInBusiness) ? profile.yearsInBusiness : null,
    monthlyOrderVolume: profile.monthlyOrderVolume?.trim() || null,
    websiteUrl: profile.websiteUrl?.trim() || null
  };
}

function withUserSelection(includeSellerProfile) {
  const baseSelection = {
    id: true,
    fullName: true,
    email: true,
    role: true,
    isActive: true,
    createdAt: true,
    updatedAt: true
  };

  if (!includeSellerProfile) {
    return baseSelection;
  }

  return {
    ...baseSelection,
    sellerProfile: {
      select: {
        businessName: true,
        businessType: true,
        businessAddress: true,
        panOrVat: true,
        phone: true,
        yearsInBusiness: true,
        monthlyOrderVolume: true,
        websiteUrl: true
      }
    }
  };
}

async function supportsSellerProfile() {
  if (sellerProfileSupportCache !== null) {
    return sellerProfileSupportCache;
  }

  try {
    const result = await prisma.$queryRaw`SELECT to_regclass('public."SellerProfile"') IS NOT NULL AS "exists"`;
    sellerProfileSupportCache = Boolean(result?.[0]?.exists);
  } catch (_error) {
    sellerProfileSupportCache = false;
  }

  return sellerProfileSupportCache;
}

export async function registerUser({ fullName, email, password, role, sellerProfile }) {
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const sellerProfileData = role === "SELLER" ? normalizeSellerProfile(sellerProfile) : null;
  const includeSellerProfile = await supportsSellerProfile();

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role,
      sellerProfile: includeSellerProfile && sellerProfileData ? {
        create: sellerProfileData
      } : undefined,
      cart: {
        create: {}
      }
    },
    select: withUserSelection(includeSellerProfile)
  });

  return buildAuthResponse(user);
}

export async function bootstrapAdmin({ fullName, email, password, setupKey }) {
  const includeSellerProfile = await supportsSellerProfile();
  const configuredSetupKey = String(process.env.ADMIN_SETUP_KEY || "").trim();

  if (!configuredSetupKey) {
    const err = new Error("Admin setup is not enabled on this server");
    err.statusCode = 503;
    throw err;
  }

  if (setupKey !== configuredSetupKey) {
    const err = new Error("Invalid admin setup key");
    err.statusCode = 403;
    throw err;
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true }
  });

  if (existingAdmin) {
    const err = new Error("Admin account already exists. Contact current admin.");
    err.statusCode = 409;
    throw err;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error("Email already in use");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      passwordHash,
      role: "ADMIN",
      isActive: true,
      cart: {
        create: {}
      }
    },
    select: withUserSelection(includeSellerProfile)
  });

  return buildAuthResponse(user);
}

export async function loginUser({ email, password }) {
  const includeSellerProfile = await supportsSellerProfile();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      ...withUserSelection(includeSellerProfile),
      passwordHash: true
    }
  });

  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("Account is suspended. Please contact admin.");
    err.statusCode = 403;
    throw err;
  }

  const safeUser = {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    sellerProfile: user.sellerProfile || null
  };

  return buildAuthResponse(safeUser);
}

export async function getCurrentUser(userId) {
  const includeSellerProfile = await supportsSellerProfile();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: withUserSelection(includeSellerProfile)
  });

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  return user;
}
