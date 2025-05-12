/* eslint-disable turbo/no-undeclared-env-vars */
import GoogleProvider from "next-auth/providers/google";
import prisma from "@repo/db/clients";

export const authOptionUser = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  secret: process.env.JWT_SECRET || "secret",
  callbacks: {
    async signIn({ user, profile }: any) {
      let dbUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (!dbUser) {
        dbUser = await prisma.user.create({
          data: {
            email: user.email,
            name: `${profile.given_name} ${profile.family_name}`,
            avatar: profile.picture,
          },
        });
      }

      user.id = dbUser.id;
      user.name = dbUser.name;
      user.avatar = dbUser.avatar;

      return true;
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        };
      }
      return token;
    },

    async session({ session, token }: any) {
      session.user = token.user;
      return session;
    },
  },

  pages: {
    signIn: "//signin",
  },
};
