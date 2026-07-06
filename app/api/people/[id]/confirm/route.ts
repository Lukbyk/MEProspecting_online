import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const personId = Number(id);
    if (!Number.isInteger(personId)) {
      return NextResponse.json({ error: "Niepoprawne ID osoby." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const { data: person, error: readError } = await supabase
      .from("people")
      .select("id, campaign_id, status")
      .eq("id", personId)
      .single();
    if (readError) throw readError;
    if (!person?.campaign_id || person.status !== "awaiting_selection") {
      return NextResponse.json({ ok: true, changed: 0 });
    }

    const { error: updateError } = await supabase
      .from("people")
      .update({ status: "selected", selected_for_outreach: 1, updated_by: "operator" })
      .eq("id", personId)
      .eq("status", "awaiting_selection")
      .not("campaign_id", "is", null);
    if (updateError) throw updateError;

    const { error: campaignError } = await supabase
      .from("campaigns")
      .update({ status: "aktywna", updated_by: "operator" })
      .eq("id", person.campaign_id)
      .eq("status", "zaproponowana");
    if (campaignError) throw campaignError;

    const { error: eventError } = await supabase.from("events").insert({
      entity_type: "person",
      entity_id: String(personId),
      event_type: "campaign_confirmed",
      actor: "operator",
      payload: { campaignId: person.campaign_id }
    });
    if (eventError) throw eventError;

    return NextResponse.json({ ok: true, changed: 1 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udało się potwierdzić osoby." },
      { status: 500 }
    );
  }
}
