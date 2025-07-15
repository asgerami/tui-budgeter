import type { NextApiRequest, NextApiResponse } from "next";
import { createTransaction, getTransactions } from "../../../utils/mongodb";
import { Transaction } from "../../../types";
import { v4 as uuidv4 } from "uuid";
import { verifyIdToken } from "../../../utils/firebaseAdmin";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const idToken = authHeader.split(" ")[1];
  let decoded;
  try {
    decoded = await verifyIdToken(idToken);
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const userId = decoded.email;
  if (!userId) {
    return res.status(401).json({ error: "Invalid user" });
  }

  if (req.method === "GET") {
    const txs = await getTransactions(userId);
    return res.status(200).json(txs);
  }

  if (req.method === "POST") {
    const { date, category, amount, type, description } = req.body;
    if (!date || !category || !amount || !type) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const tx: Transaction & { userId: string } = {
      id: uuidv4(),
      userId,
      date,
      category,
      amount,
      type,
      description,
    };
    await createTransaction(tx);
    return res.status(201).json(tx);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
