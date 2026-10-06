import { NextResponse } from "next/server";
import { z } from "zod";
import { sameOrigin } from "@/lib/security";
import { getAdmin } from "@/lib/admin-auth";
import { notifyAdmin } from "@/lib/notifications";
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!sameOrigin(request))
    return NextResponse.json(
      { error: "Request not accepted." },
      { status: 403 },
    );
  const admin = await getAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Administrator access required." },
      { status: 401 },
    );
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return NextResponse.json({ error: "Invalid enquiry." }, { status: 400 });
  const { data, error } = await admin.client
    .from("enquiries")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (error)
    return NextResponse.json(
      { error: "Unable to load enquiry." },
      { status: 503 },
    );
  if (!data)
    return NextResponse.json({ error: "Enquiry not found." }, { status: 404 });
  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM)
    return NextResponse.json(
      { error: "Email delivery has not been configured." },
      { status: 503 },
    );
  try {
    await notifyAdmin(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Email could not be delivered. The enquiry is still saved." },
      { status: 503 },
    );
  }
}
