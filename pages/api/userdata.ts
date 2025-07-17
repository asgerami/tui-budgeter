import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";
import clientPromise from "../../utils/mongodb";
import { pusher } from "../../utils/pusher";

const DB_NAME = "tui-budgeter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection("userdata");

  if (req.method === "GET") {
    // Fetch user data
    const doc = await collection.findOne({ userId });
    const transactions = doc?.transactions || [];
    return res.status(200).json(transactions);
  }

  if (req.method === "POST") {
    // Save/update user data
    const { transactions } = req.body;
    await collection.updateOne(
      { userId },
      { $set: { transactions } },
      { upsert: true }
    );
    // Trigger Pusher event for real-time update
    await pusher.trigger("transactions", "updated", { userId });
    return res.status(200).json({ ok: true });
  }

  if (req.method === "DELETE") {
    // Delete all user data
    await collection.deleteOne({ userId });
    // Trigger Pusher event for real-time update
    await pusher.trigger("transactions", "updated", { userId });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
