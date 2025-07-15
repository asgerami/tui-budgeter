import type { NextApiRequest, NextApiResponse } from "next";
import {
  updateRecurringTransaction,
  deleteRecurringTransaction,
  getRecurringTransactions,
} from "../../../utils/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Missing id" });
  }

  if (req.method === "GET") {
    // For demo: fetch all and filter (should optimize in real app)
    const userId = (req.query.userId as string) || "demo-user";
    const recs = await getRecurringTransactions(userId);
    const rec = recs.find((r) => r.id === id);
    if (!rec) return res.status(404).json({ error: "Not found" });
    return res.status(200).json(rec);
  }

  if (req.method === "PUT") {
    const update = req.body;
    await updateRecurringTransaction(id, update);
    return res.status(200).json({ message: "Updated" });
  }

  if (req.method === "DELETE") {
    await deleteRecurringTransaction(id);
    return res.status(204).end();
  }

  return res.status(405).json({ error: "Method not allowed" });
}
