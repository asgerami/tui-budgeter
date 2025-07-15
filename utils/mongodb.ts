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

import { RecurringTransaction, Transaction } from "../types";

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

export async function getUsersCollection() {
  const client = await clientPromise;
  return client.db().collection("users");
}

export async function setUserVerificationToken(
  email: string,
  token: string,
  expiry: Date
) {
  const col = await getUsersCollection();
  return col.updateOne(
    { email },
    {
      $set: {
        verificationToken: token,
        verificationTokenExpiry: expiry,
        verified: false,
      },
    }
  );
}

export async function verifyUserByToken(token: string) {
  const col = await getUsersCollection();
  const user = await col.findOne({ verificationToken: token });
  if (!user) return null;
  if (user.verificationTokenExpiry && user.verificationTokenExpiry < new Date())
    return null;
  await col.updateOne(
    { email: user.email },
    {
      $set: { verified: true },
      $unset: { verificationToken: "", verificationTokenExpiry: "" },
    }
  );
  return user;
}

export async function setUserResetToken(
  email: string,
  token: string,
  expiry: Date
) {
  const col = await getUsersCollection();
  return col.updateOne(
    { email },
    { $set: { resetToken: token, resetTokenExpiry: expiry } }
  );
}

export async function getUserByResetToken(token: string) {
  const col = await getUsersCollection();
  const user = await col.findOne({ resetToken: token });
  if (!user) return null;
  if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) return null;
  return user;
}

export async function clearUserResetToken(email: string) {
  const col = await getUsersCollection();
  return col.updateOne(
    { email },
    { $unset: { resetToken: "", resetTokenExpiry: "" } }
  );
}

export default clientPromise;
