import type { NextApiRequest, NextApiResponse } from "next";
import {
  createRecurringTransaction,
  getRecurringTransactions,
} from "../../../utils/mongodb";
import { RecurringTransaction } from "../../../types";
import { v4 as uuidv4 } from "uuid";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Replace with real user ID from session/auth
  const userId = (req.query.userId as string) || "demo-user";

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
