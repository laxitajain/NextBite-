import { connectMongoDB } from "@/lib/mongodb";
import User from "@/models/user";
import NextAuth from "next-auth/next";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {},

      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) {
            return null;
          }

          const passwordsMatch = await bcrypt.compare(password, user.password);

          if (!passwordsMatch) {
            return null;
          }

          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.toObject().role,
            image: user.image || null,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) token.id = user.id;
      if (user?.role) token.role = user.role;
      if (user?.image !== undefined) token.image = user.image;
      if (trigger === "update") {
        const { connectMongoDB } = await import("@/lib/mongodb");
        const UserModel = (await import("@/models/user")).default;
        await connectMongoDB();
        const freshUser = await UserModel.findById(token.id).lean();
        if (freshUser?.image) token.image = freshUser.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token?.id) session.user.id = token.id;
      if (token?.role) session.user.role = token.role;
      if (token?.image) session.user.image = token.image;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
