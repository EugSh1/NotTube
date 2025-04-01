import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import prisma from "./lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [GitHub],
    trustHost: true,
    pages: {
        signIn: "/sign-in"
    },
    callbacks: {
        async authorized({ auth }) {
            return !!auth;
        },
        async signIn({ user, account }) {
            if (account?.provider === "github") {
                try {
                    const githubId = account.providerAccountId;

                    const foundUser = await prisma.user.findUnique({ where: { id: githubId } });

                    if (!foundUser) {
                        await prisma.user.create({
                            data: {
                                id: githubId,
                                name: user.name || `Unnamed user ${Math.random().toFixed(2)}`,
                                image: user.image
                            }
                        });
                    }

                    user.id = githubId;
                    return true;
                } catch (error) {
                    console.error(`Error creating user: ${error}`);
                    return false;
                }
            }
            return false;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
                token.image = user.image;
            }
            return token;
        },
        async session({ session, token }) {
            session.user.id = token.id as string;
            session.user.name = token.name as string;
            session.user.image = token.image as string;
            return session;
        }
    }
});
