import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise, {
  getRecurringTransactions,
  updateRecurringTransaction,
} from "../../../utils/mongodb";
import { v4 as uuidv4 } from "uuid";

function getNextDate(date: Date, frequency: string | number): Date {
  const d = new Date(date);
  switch (frequency) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
    default:
      if (typeof frequency === "number") d.setDate(d.getDate() + frequency);
      break;
  }
  return d;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // TODO: Replace with real user ID from session/auth
  const userId = (req.query.userId as string) || "demo-user";
  const recs = await getRecurringTransactions(userId);
  const now = new Date();
  const client = await clientPromise;
  const transactions = client.db().collection("transactions");
  let generated = 0;

  for (const rec of recs) {
    let last = rec.lastGenerated
      ? new Date(rec.lastGenerated)
      : new Date(rec.startDate);
    let next = getNextDate(last, rec.frequency);
    const end = rec.endDate ? new Date(rec.endDate) : undefined;
    while (next <= now && (!end || next <= end)) {
      await transactions.insertOne({
        id: uuidv4(),
        userId,
        date: next.toISOString().split("T")[0],
        category: rec.category,
        amount:
          rec.type === "expense" ? -Math.abs(rec.amount) : Math.abs(rec.amount),
        type: rec.type,
        description: rec.description,
        createdFromRecurringId: rec.id,
      });
      last = next;
      next = getNextDate(last, rec.frequency);
      generated++;
    }
    if (last.toISOString().split("T")[0] !== rec.lastGenerated) {
      await updateRecurringTransaction(rec.id, {
        lastGenerated: last.toISOString().split("T")[0],
      });
    }
  }
  res.status(200).json({ generated });
}
