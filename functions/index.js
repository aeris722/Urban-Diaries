"use strict";

const crypto = require("node:crypto");
const admin = require("firebase-admin");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

if (!admin.apps.length) {
  admin.initializeApp();
}

function sha256(value) {
  return crypto.createHash("sha256").update(value, "utf8").digest();
}

function safePasswordMatch(candidate, expected) {
  const candidateHash = sha256(candidate);
  const expectedHash = sha256(expected);
  return crypto.timingSafeEqual(candidateHash, expectedHash);
}

exports.verifyAdminPassword = onCall(async (request) => {
  const uid = request.auth?.uid;
  const provider = request.auth?.token?.firebase?.sign_in_provider;
  const email = request.auth?.token?.email;
  const submittedPassword = String(request.data?.password ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!uid) {
    throw new HttpsError("unauthenticated", "Authentication required.");
  }

  if (provider !== "google.com") {
    throw new HttpsError("permission-denied", "Google sign-in is required.");
  }

  if (!submittedPassword.trim()) {
    throw new HttpsError("invalid-argument", "Password is required.");
  }

  if (!adminPassword) {
    throw new HttpsError("failed-precondition", "ADMIN_PASSWORD is not configured.");
  }

  if (!adminEmail) {
    throw new HttpsError("failed-precondition", "ADMIN_EMAIL is not configured.");
  }

  if (String(email).toLowerCase() !== adminEmail.toLowerCase()) {
    throw new HttpsError("permission-denied", "Unauthorized account.");
  }

  if (!safePasswordMatch(submittedPassword, adminPassword)) {
    throw new HttpsError("permission-denied", "Incorrect admin password.");
  }

  const userRecord = await admin.auth().getUser(uid);
  const nextClaims = { ...(userRecord.customClaims ?? {}), admin: true };
  await admin.auth().setCustomUserClaims(uid, nextClaims);

  return { success: true };
});
