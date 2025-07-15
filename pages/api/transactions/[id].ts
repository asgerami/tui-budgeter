import type { NextApiRequest, NextApiResponse } from "next";
import {
  updateTransaction,
  deleteTransaction,
  getTransactions,
} from "../../../utils/mongodb";
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
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing id" });
  }

  if (req.method === "GET") {
    const txs = await getTransactions(userId);
    const tx = txs.find((t) => t.id === id);
    if (!tx) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(tx);
  }

  if (req.method === "PUT") {
    const update = req.body;
    const txs = await getTransactions(userId);
    const tx = txs.find((t) => t.id === id);
    if (!tx) return res.status(404).json({ error: "Not found" });
    await updateTransaction(id, userId, update);
    return res.status(200).json({ message: "Updated" });
  }

  if (req.method === "DELETE") {
    const txs = await getTransactions(userId);
    const tx = txs.find((t) => t.id === id);
    if (!tx) return res.status(404).json({ error: "Not found" });
    await deleteTransaction(id, userId);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}
