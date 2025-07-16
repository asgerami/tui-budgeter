import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import clientPromise from "../../utils/mongodb";

const DB_NAME = "tui-budgeter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);
  console.log("API userId:", userId);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection("userdata");

  if (req.method === "GET") {
    // Fetch user data
    console.log("GET request - searching for userId:", userId);
    const doc = await collection.findOne({ userId });
    console.log("MongoDB query result:", doc);
    const transactions = doc?.transactions || [];
    console.log("Returning transactions:", transactions);
    return res.status(200).json(transactions);
  }

  if (req.method === "POST") {
    // Save/update user data
    const { transactions } = req.body;
    console.log("POST request - saving for userId:", userId);
    console.log("Transactions to save:", transactions);
    await collection.updateOne(
      { userId },
      { $set: { transactions } },
      { upsert: true }
    );
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // Delete all user data
    await collection.deleteOne({ userId });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
