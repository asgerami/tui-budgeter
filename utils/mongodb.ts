import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!global._mongoClientPromise) {
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}
clientPromise = global._mongoClientPromise!;

import { RecurringTransaction } from "../types";
import { Transaction } from "../types";

export async function getRecurringTransactionsCollection() {
  const client = await clientPromise;
  return client.db().collection<RecurringTransaction>("recurring_transactions");
}

export async function createRecurringTransaction(rec: RecurringTransaction) {
  const col = await getRecurringTransactionsCollection();
  return col.insertOne(rec);
}

export async function getRecurringTransactions(userId: string) {
  const col = await getRecurringTransactionsCollection();
  return col.find({ userId }).toArray();
}

export async function updateRecurringTransaction(
  id: string,
  update: Partial<RecurringTransaction>
) {
  const col = await getRecurringTransactionsCollection();
  return col.updateOne({ id }, { $set: update });
}

export async function deleteRecurringTransaction(id: string) {
  const col = await getRecurringTransactionsCollection();
  return col.deleteOne({ id });
}

export async function getTransactionsCollection() {
  const client = await clientPromise;
  return client.db().collection<Transaction>("transactions");
}

export async function createTransaction(tx: Transaction & { userId: string }) {
  const col = await getTransactionsCollection();
  return col.insertOne(tx);
}

export async function getTransactions(userId: string) {
  const col = await getTransactionsCollection();
  return col.find({ userId }).toArray();
}

export async function updateTransaction(
  id: string,
  userId: string,
  update: Partial<Transaction>
) {
  const col = await getTransactionsCollection();
  return col.updateOne({ id, userId }, { $set: update });
}

export async function deleteTransaction(id: string, userId: string) {
  const col = await getTransactionsCollection();
  return col.deleteOne({ id, userId });
}

export default clientPromise;
