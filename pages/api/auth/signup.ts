import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../utils/mongodb";
import { hash } from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  try {
    const client = await clientPromise;
    const users = client.db().collection("users");
    const existing = await users.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "User already exists" });
    }
    const hashedPassword = await hash(password, 10);
    const verificationToken = uuidv4();
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h
    await users.insertOne({
      name,
      email,
      hashedPassword,
      verified: false,
      verificationToken,
      verificationTokenExpiry,
    });
    // Send verification email
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}