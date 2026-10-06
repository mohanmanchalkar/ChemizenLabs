import { authConfigured, sessionClient } from "./supabase";
export async function getAdmin() {
  if (!authConfigured()) return null;
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
