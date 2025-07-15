import NextAuth, { SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { compare } from "bcryptjs";
import clientPromise from "../../../utils/mongodb";

export const authOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const client = await clientPromise;
        const users = client.db().collection("users");
        const user = await users.findOne({ email: credentials.email });
        if (
          user &&
          user.hashedPassword &&
          (await compare(credentials.password, user.hashedPassword))
        ) {
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        }
        return null;
      },
    }),
  ],
  session: {
    strategy: "jwt" as SessionStrategy,
  },
  pages: {
    signIn: "/signin",
    signOut: "/signin",
    error: "/signin",
  },
  secret: process.env.NEXTAUTH_SECRET || "supersecret",
};

export default NextAuth(authOptions);
