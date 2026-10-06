import { Resend } from "resend";
import { serviceClient } from "./supabase";
export async function notifyAdmin(id: string) {
  const db = serviceClient();
  const configured = Boolean(
    process.env.RESEND_API_KEY && process.env.RESEND_FROM,
  );
  if (!configured) {
    const { error } = await db
      .from("enquiries")
      .update({ email_status: "unconfigured" })
      .eq("id", id)
      .neq("email_status", "sent");
    if (error) throw new Error("Unable to record notification state");
    return;
  }
  const { data: claimed, error } = await db.rpc("claim_enquiry_notification", {
    p_id: id,
  });
  if (error) throw new Error("Unable to claim notification");
  if (!claimed) return;
  const { data: row, error: loadError } = await db
    .from("enquiries")
    .select("id,name,email,phone,institution,service,message")
    .eq("id", id)
    .single();
  if (loadError || !row) {
    await db.from("enquiries").update({ email_status: "failed" }).eq("id", id);
    throw new Error("Unable to load notification");
  }
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: sendError } = await resend.emails.send(
      {
        from: process.env.RESEND_FROM!,
        to: process.env.ADMIN_EMAIL || "chemizenlabs@gmail.com",
        replyTo: row.email,
        subject: "New Chemizen Labs enquiry",
        text: `New enquiry ${row.id}\n\nName: ${row.name}\nEmail: ${row.email}\nPhone: ${row.phone || "Not supplied"}\nInstitution: ${row.institution || "Not supplied"}\nInterest: ${row.service}\n\n${row.message}\n\nOpen your private dashboard: ${process.env.APP_ORIGIN}/admin/enquiries?id=${row.id}`,
      },
      { idempotencyKey: `enquiry-${row.id}` },
    );
    if (sendError) throw new Error("Email delivery failed");
    const { error: updateError } = await db
      .from("enquiries")
      .update({ email_status: "sent", email_sent_at: new Date().toISOString() })
      .eq("id", id);
    if (updateError) throw new Error("Unable to record delivery");
  } catch {
    await db.from("enquiries").update({ email_status: "failed" }).eq("id", id);
    throw new Error("Notification unavailable");
  }
}
