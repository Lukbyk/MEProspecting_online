import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createSupabaseAdmin();
    const [companies, people, campaigns, events] = await Promise.all([
      supabase.from("company_status").select("*").order("company_name"),
      supabase
        .from("people")
        .select("*, companies(company_name, region, city)")
        .order("created_at", { ascending: false }),
      supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
      supabase
        .from("events")
        .select("*")
        .eq("entity_type", "person")
        .order("at", { ascending: true })
        .order("id", { ascending: true })
    ]);

    for (const result of [companies, people, campaigns, events]) {
      if (result.error) throw result.error;
    }

    const peopleRows = (people.data || []).map((person: any) => ({
      ...person,
      company_name: person.companies?.company_name,
      region: person.companies?.region,
      city: person.companies?.city,
      companies: undefined
    }));

    return NextResponse.json({
      companies: companies.data || [],
      people: peopleRows,
      campaigns: campaigns.data || [],
      events: events.data || []
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Nie udało się pobrać danych." },
      { status: 500 }
    );
  }
}
