import NextAuth, { NextAuthOptions } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import Database from 'better-sqlite3';
import path from 'path';

export const authOptions: NextAuthOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.AUTH_DISCORD_ID as string,
      clientSecret: process.env.AUTH_DISCORD_SECRET as string,
      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`
        } else {
          const format = profile.avatar.startsWith("a_") ? "gif" : "png"
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`
        }
        return {
          id: profile.id,
          name: profile.global_name || profile.username, // NextAuth 'name' becomes Display Name
          username: profile.username,                    // Custom property for Username
          email: profile.email,
          image: profile.image_url,
        }
      },
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
          token.username = (user as any).username;
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
        (session.user as any).username = token.username;
      }
      return session;
    }
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
};

const authHandler = NextAuth(authOptions);

export async function GET(req: Request, ctx: any) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  return authHandler(req, ctx);
}

export async function POST(req: Request, ctx: any) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
  if (host) process.env.NEXTAUTH_URL = `${protocol}://${host}`;
  return authHandler(req, ctx);
}
