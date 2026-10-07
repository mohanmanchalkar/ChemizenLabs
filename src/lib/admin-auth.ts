import { cookies } from "next/headers";
import { authConfigured, sessionClient } from "./supabase";
import { createDevClient } from "./dev-store";

export async function getAdmin() {
  if (authConfigured()) {
    try {
      const client = await sessionClient();
      const {
        data: { user },
        error,
      } = await client.auth.getUser();
      if (error || !user) return null;
      const { data, error: roleError } = await client
        .from("admin_members")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();
      if (roleError || !data) return null;
      return { client, user };
    } catch {
      return null;
    }
  }

  if (process.env.NODE_ENV === "development") {
    try {
      const jar = await cookies();
      const devSession = jar.get("admin_session")?.value;
      if (devSession === "dev-chemizen-admin") {
        return {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          client: createDevClient() as any,
          user: {
            id: "dev-admin-id",
            email: "admin@chemizenlabs.com",
          },
        };
      }
    } catch {
      return null;
    }
  }

  return null;
}
