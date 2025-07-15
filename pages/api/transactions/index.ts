import type { NextApiRequest, NextApiResponse } from "next";
import { createTransaction, getTransactions } from "../../../utils/mongodb";
import { Transaction } from "../../../types";
import { v4 as uuidv4 } from "uuid";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const userId = session.user.email;

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
