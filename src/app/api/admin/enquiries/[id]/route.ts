import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdmin } from "@/lib/admin-auth";
import { sameOrigin, boundedJson } from "@/lib/security";
import { enquiryStatuses } from "@/lib/enquiry-schema";
const schema = z.object({ status: z.enum(enquiryStatuses) });
export async function PATCH(
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
  try {
    const input = schema.safeParse(await boundedJson(request));
    if (!input.success)
      return NextResponse.json({ error: "Invalid status." }, { status: 400 });
    const { data, error } = await admin.client
      .from("enquiries")
      .update({ status: input.data.status })
      .eq("id", id)
      .select("id")
      .maybeSingle();
    if (error)
      return NextResponse.json(
        { error: "Unable to update this enquiry." },
        { status: 503 },
      );
    if (!data)
      return NextResponse.json(
        { error: "Enquiry not found." },
        { status: 404 },
      );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
}
