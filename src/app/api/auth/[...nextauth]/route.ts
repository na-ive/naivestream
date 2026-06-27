import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Database from 'better-sqlite3';
import path from 'path';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID as string,
      clientSecret: process.env.AUTH_DISCORD_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "discord") {
        try {
          const dbPath = path.join(process.cwd(), 'anime.db');
          const db = new Database(dbPath);
          
          const stmt = db.prepare(`
            INSERT INTO users (discord_id, username, display_name, email, avatar, last_login)
            VALUES (@discord_id, @username, @display_name, @email, @avatar, CURRENT_TIMESTAMP)
            ON CONFLICT(discord_id) DO UPDATE SET
              username = @username,
              display_name = @display_name,
              email = @email,
              avatar = @avatar,
              updated_at = CURRENT_TIMESTAMP,
              last_login = CURRENT_TIMESTAMP
          `);
          
          stmt.run({
            discord_id: user.id,
            username: user.name || (profile as any)?.username || '',
            display_name: (profile as any)?.global_name || user.name || '',
            email: user.email || '',
            avatar: user.image || '',
          });
          
          db.close();
        } catch (error) {
          console.error("Error upserting user on sign in", error);
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        try {
          const dbPath = path.join(process.cwd(), 'anime.db');
          const db = new Database(dbPath);
          const row = db.prepare('SELECT id FROM users WHERE discord_id = ?').get(user.id) as { id: number } | undefined;
          if (row) {
            token.userId = row.id;
          }
          db.close();
        } catch (error) {
          console.error("Error fetching user id in JWT callback", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.userId;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
