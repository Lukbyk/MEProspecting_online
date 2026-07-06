export type CampaignStatus = "zaproponowana" | "planowana" | "aktywna" | "zamknieta";

export type PersonStatus =
  | "sourced"
  | "enriched"
  | "awaiting_selection"
  | "selected"
  | "sent"
  | "replied"
  | "qualified"
  | "booked"
  | "won"
  | "lost"
  | "nurture"
  | "rejected"
  | "suppressed";

export type Company = {
  duns: string;
  company_name: string;
  domain: string | null;
  city: string | null;
  region: string | null;
  industry: string | null;
  sales_eur: number | null;
  employees_total: number | null;
  employees_reliable: number | null;
  branch_flag: number | null;
  blocked: number | null;
  company_status?: string | null;
  n_people?: number | null;
  n_ready?: number | null;
  n_selected?: number | null;
  n_contacted?: number | null;
};

export type Campaign = {
  id: number;
  name: string;
  date_from: string | null;
  date_to: string | null;
  goal: string | null;
  status: CampaignStatus;
  created_at: string | null;
};

export type Person = {
  id: number;
  duns: string;
  first_name: string | null;
  last_name: string | null;
  title: string | null;
  email: string | null;
  email_type: "personal" | "generic" | "none" | null;
  contactability: "A" | "B" | "C" | "D" | null;
  source: "dnb" | "apollo" | null;
  is_dnb_anchor: number | null;
  icp_profile: string | null;
  ready_for_outreach: number | null;
  ready_reason: string | null;
  selected_for_outreach: number | null;
  campaign_id: number | null;
  optout: number | null;
  status: PersonStatus;
  created_at: string | null;
  company_name?: string;
  region?: string | null;
  city?: string | null;
};

export type Event = {
  id: number;
  entity_type: "company" | "person";
  entity_id: string;
  event_type: string;
  actor: "ai" | "operator" | "system" | null;
  payload: string | null;
  at: string | null;
};

export type BootstrapData = {
  companies: Company[];
  people: Person[];
  campaigns: Campaign[];
  events: Event[];
};
