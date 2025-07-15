import type { NextApiRequest, NextApiResponse } from "next";
import {
  createRecurringTransaction,
  getRecurringTransactions,
} from "../../../utils/mongodb";
import { RecurringTransaction } from "../../../types";
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
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
  const userId = decoded.email;
  if (!userId) {
    return res.status(401).json({ error: "Invalid user" });
  }

  if (req.method === "GET") {
    // List all recurring transactions for the user
    const recs = await getRecurringTransactions(userId);
    return res.status(200).json(recs);
  }

  if (req.method === "POST") {
    const {
      name,
      amount,
      category,
      type,
      description,
      startDate,
      frequency,
      endDate,
    } = req.body;
    if (!name || !amount || !category || !type || !startDate || !frequency) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    const rec: RecurringTransaction = {
      id: uuidv4(),
      userId,
      name,
      amount,
      category,
      type,
      description,
      startDate,
      frequency,
      endDate,
      lastGenerated: startDate,
    };
    await createRecurringTransaction(rec);
    return res.status(201).json(rec);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
