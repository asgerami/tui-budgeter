import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../utils/mongodb";
import { hash } from "bcryptjs";

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
    await users.insertOne({ name, email, hashedPassword });
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
