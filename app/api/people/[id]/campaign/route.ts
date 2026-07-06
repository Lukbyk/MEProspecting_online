import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const personId = Number(id);
    const body = await request.json();
    const campaignId = body.campaignId ? Number(body.campaignId) : null;

    if (!Number.isInteger(personId) || (campaignId !== null && !Number.isInteger(campaignId))) {
      return NextResponse.json({ error: "Niepoprawne dane kampanii." }, { status: 400 });
    }

    const supabase = createSupabaseAdmin();
    const patch = campaignId
      ? { campaign_id: campaignId, status: "selected", updated_by: "operator" }
      : { campaign_id: null, status: "enriched", updated_by: "operator" };

    const { error: updateError } = await supabase.from("people").update(patch).eq("id", personId);
    if (updateError) throw updateError;

    if (campaignId) {
      const { error: campaignError } = await supabase
        .from("campaigns")
        .update({ status: "aktywna", updated_by: "operator" })
        .eq("id", campaignId)
        .eq("status", "zaproponowana");
      if (campaignError) throw campaignError;
    }

    const { error: eventError } = await supabase.from("events").insert({
      entity_type: "person",
      entity_id: String(personId),
      event_type: campaignId ? "campaign_access_set" : "campaign_access_cleared",
      actor: "operator",
      payload: { campaignId }
    });
    if (eventError) throw eventError;

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udało się zapisać kampanii." },
      { status: 500 }
    );
  }
}
