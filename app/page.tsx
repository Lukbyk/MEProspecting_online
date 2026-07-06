"use client";

import { useEffect, useMemo, useState } from "react";
import type { BootstrapData, Campaign, Company, Event, Person } from "@/lib/types";

const STATUS_PL: Record<string, string> = {
  sourced: "źródłowy",
  enriched: "wzbogacony",
  awaiting_selection: "do zatwierdzenia",
  selected: "wybrany",
  sent: "wysłany",
  replied: "odpowiedział",
  qualified: "zakwalifikowany",
  booked: "umówiony",
  won: "wygrany",
  lost: "utracony",
  nurture: "uśpiony",
  rejected: "odrzucony",
  suppressed: "optout"
};

type View = "queue" | "base" | "companies" | "campaigns";

export default function Home() {
  const [data, setData] = useState<BootstrapData | null>(null);
  const [view, setView] = useState<View>("queue");
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const response = await fetch("/api/bootstrap", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || "Nie udało się wczytać danych.");
    setData(payload);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  const queue = useMemo(
    () => (data?.people || []).filter((person) => person.status === "awaiting_selection" && person.campaign_id),
    [data]
  );
  const stats = useMemo(() => makeStats(data), [data]);
  const eventsByPerson = useMemo(() => groupEvents(data?.events || []), [data]);

  async function mutatePerson(person: Person, action: "confirm" | "reject") {
    setBusyId(person.id);
    setError(null);
    try {
      const response = await fetch(`/api/people/${person.id}/${action}`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Zapis nieudany.");
      await load();
      setSelectedPerson(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zapis nieudany.");
    } finally {
      setBusyId(null);
    }
  }

  async function setCampaign(person: Person, campaignId: string) {
    setBusyId(person.id);
    setError(null);
    try {
      const response = await fetch(`/api/people/${person.id}/campaign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: campaignId ? Number(campaignId) : null })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Zapis nieudany.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Zapis nieudany.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <main className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span />
          <div>
            <strong>Media Energetyczne</strong>
            <small>Prospecting w chmurze</small>
          </div>
        </div>
        <NavButton label="Kolejka osób" count={queue.length} active={view === "queue"} onClick={() => setView("queue")} />
        <NavButton label="Baza osób" count={data?.people.length || 0} active={view === "base"} onClick={() => setView("base")} />
        <NavButton label="Firmy" count={data?.companies.length || 0} active={view === "companies"} onClick={() => setView("companies")} />
        <NavButton label="Kampanie" count={data?.campaigns.length || 0} active={view === "campaigns"} onClick={() => setView("campaigns")} />
        <p className="sidebarNote">Demo MVP: Supabase + Vercel, bez lokalnego SQLite.</p>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">Panel operatora</p>
            <h1>{titleFor(view)}</h1>
          </div>
          <button className="secondary" onClick={() => load().catch((err) => setError(err.message))}>
            Odśwież
          </button>
        </header>

        {error ? <div className="alert">{error}</div> : null}
        {!data ? (
          <div className="empty">Ładowanie danych z Supabase...</div>
        ) : (
          <>
            <section className="stats">
              <Stat label="Firmy" value={stats.companies} />
              <Stat label="Osoby" value={stats.people} />
              <Stat label="Do zatwierdzenia" value={stats.queue} accent />
              <Stat label="Wysłane / odpowiedzi" value={`${stats.sent}/${stats.replied}`} />
            </section>

            {view === "queue" ? (
              <PeopleTable
                people={queue}
                campaigns={data.campaigns}
                busyId={busyId}
                onOpen={setSelectedPerson}
                onConfirm={(person) => mutatePerson(person, "confirm")}
                onReject={(person) => mutatePerson(person, "reject")}
                onCampaign={setCampaign}
              />
            ) : null}
            {view === "base" ? (
              <PeopleTable
                people={data.people}
                campaigns={data.campaigns}
                busyId={busyId}
                onOpen={setSelectedPerson}
                onConfirm={(person) => mutatePerson(person, "confirm")}
                onReject={(person) => mutatePerson(person, "reject")}
                onCampaign={setCampaign}
              />
            ) : null}
            {view === "companies" ? <CompaniesTable companies={data.companies} /> : null}
            {view === "campaigns" ? <CampaignsTable campaigns={data.campaigns} people={data.people} /> : null}
          </>
        )}
      </section>

      {selectedPerson ? (
        <PersonPanel
          person={selectedPerson}
          campaign={data?.campaigns.find((campaign) => campaign.id === selectedPerson.campaign_id) || null}
          events={eventsByPerson[selectedPerson.id] || []}
          busy={busyId === selectedPerson.id}
          onClose={() => setSelectedPerson(null)}
          onConfirm={() => mutatePerson(selectedPerson, "confirm")}
          onReject={() => mutatePerson(selectedPerson, "reject")}
        />
      ) : null}
    </main>
  );
}

function NavButton(props: { label: string; count: number; active: boolean; onClick: () => void }) {
  return (
    <button className={`nav ${props.active ? "active" : ""}`} onClick={props.onClick}>
      <span>{props.label}</span>
      <b>{props.count}</b>
    </button>
  );
}

function Stat(props: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className={props.accent ? "stat accent" : "stat"}>
      <strong>{props.value}</strong>
      <span>{props.label}</span>
    </div>
  );
}

function PeopleTable(props: {
  people: Person[];
  campaigns: Campaign[];
  busyId: number | null;
  onOpen: (person: Person) => void;
  onConfirm: (person: Person) => void;
  onReject: (person: Person) => void;
  onCampaign: (person: Person, campaignId: string) => void;
}) {
  if (props.people.length === 0) return <div className="empty">Brak osób w tym widoku.</div>;
  return (
    <div className="table">
      <div className="thead peopleGrid">
        <span>Osoba</span>
        <span>Firma</span>
        <span>Kontakt</span>
        <span>Status</span>
        <span>Kampania</span>
        <span>Akcje</span>
      </div>
      {props.people.map((person) => (
        <div className="row peopleGrid" key={person.id} onClick={() => props.onOpen(person)}>
          <div className="cell primary" data-label="Osoba">
            <strong>{fullName(person)}</strong>
            <small>{person.title || "brak stanowiska"}</small>
          </div>
          <div className="cell" data-label="Firma">
            <strong>{person.company_name}</strong>
            <small>{[person.city, person.region].filter(Boolean).join(", ") || "brak lokalizacji"}</small>
          </div>
          <div className="cell contactCell" data-label="Kontakt">
            <span className={`dot c${person.contactability || "C"}`}>{person.contactability || "C"}</span>
            <small>{person.email || "brak maila"}</small>
          </div>
          <div className="cell" data-label="Status">
            <span className="pill">{STATUS_PL[person.status]}</span>
            <small>{person.ready_reason || "bez uzasadnienia"}</small>
          </div>
          <div className="cell" data-label="Kampania" onClick={(event) => event.stopPropagation()}>
            <select
              value={person.campaign_id || ""}
              disabled={props.busyId === person.id}
              onChange={(event) => props.onCampaign(person, event.target.value)}
            >
              <option value="">bez kampanii</option>
              {props.campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.name}
                </option>
              ))}
            </select>
          </div>
          <div className="cell actions" data-label="Akcje" onClick={(event) => event.stopPropagation()}>
            <button
              disabled={props.busyId === person.id || person.status !== "awaiting_selection"}
              onClick={() => props.onConfirm(person)}
            >
              Potwierdź
            </button>
            <button disabled={props.busyId === person.id || !person.campaign_id} onClick={() => props.onReject(person)}>
              Wycofaj
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompaniesTable({ companies }: { companies: Company[] }) {
  if (companies.length === 0) return <div className="empty">Brak firm w bazie.</div>;
  return (
    <div className="table">
      <div className="thead companyGrid">
        <span>Firma</span>
        <span>Status</span>
        <span>Osoby</span>
        <span>Gotowi</span>
        <span>Branża</span>
      </div>
      {companies.map((company) => (
        <div className="row companyGrid" key={company.duns}>
          <div className="cell primary" data-label="Firma">
            <strong>{company.company_name}</strong>
            <small>{[company.city, company.region, company.domain].filter(Boolean).join(" · ")}</small>
          </div>
          <div className="cell" data-label="Status">
            <span className="pill">{company.company_status || "nowa"}</span>
          </div>
          <div className="cell mono" data-label="Osoby">
            {company.n_people || 0}
          </div>
          <div className="cell mono" data-label="Gotowi">
            {company.n_ready || 0}
          </div>
          <div className="cell" data-label="Branża">
            {company.industry || "brak branży"}
          </div>
        </div>
      ))}
    </div>
  );
}

function CampaignsTable({ campaigns, people }: { campaigns: Campaign[]; people: Person[] }) {
  if (campaigns.length === 0) return <div className="empty">Brak kampanii.</div>;
  return (
    <div className="campaignCards">
      {campaigns.map((campaign) => {
        const assigned = people.filter((person) => person.campaign_id === campaign.id);
        return (
          <article className="campaignCard" key={campaign.id}>
            <div>
              <span className="pill">{campaign.status}</span>
              <h2>{campaign.name}</h2>
              <p>{campaign.goal || "Brak celu kampanii."}</p>
            </div>
            <dl>
              <dt>Okno</dt>
              <dd>
                {campaign.date_from || "?"} - {campaign.date_to || "?"}
              </dd>
              <dt>Przypisani</dt>
              <dd>{assigned.length}</dd>
              <dt>Do zatwierdzenia</dt>
              <dd>{assigned.filter((person) => person.status === "awaiting_selection").length}</dd>
            </dl>
          </article>
        );
      })}
    </div>
  );
}

function PersonPanel(props: {
  person: Person;
  campaign: Campaign | null;
  events: Event[];
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReject: () => void;
}) {
  return (
    <div className="overlay">
      <aside className="panel">
        <button className="close" onClick={props.onClose}>
          ×
        </button>
        <p className="eyebrow">Osoba</p>
        <h2>{fullName(props.person)}</h2>
        <p className="muted">{props.person.title || "brak stanowiska"} · {props.person.company_name}</p>
        <section>
          <h3>Kontakt</h3>
          <dl>
            <dt>Email</dt>
            <dd>{props.person.email || "brak"}</dd>
            <dt>Źródło</dt>
            <dd>{props.person.source || "brak"}</dd>
            <dt>Status</dt>
            <dd>{STATUS_PL[props.person.status]}</dd>
            <dt>Kampania</dt>
            <dd>{props.campaign?.name || "bez kampanii"}</dd>
          </dl>
          <div className="panelActions">
            <button disabled={props.busy || props.person.status !== "awaiting_selection"} onClick={props.onConfirm}>
              Potwierdź w kampanii
            </button>
            <button disabled={props.busy || !props.person.campaign_id} onClick={props.onReject}>
              Wycofaj
            </button>
          </div>
        </section>
        <section>
          <h3>Historia</h3>
          {props.events.length === 0 ? (
            <p className="muted">Brak zdarzeń.</p>
          ) : (
            <ol className="timeline">
              {props.events.map((event) => (
                <li key={event.id}>
                  <strong>{event.event_type}</strong>
                  <span>{event.actor || "system"} · {event.at || "bez daty"}</span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </aside>
    </div>
  );
}

function titleFor(view: View) {
  return {
    queue: "Kolejka osób",
    base: "Baza osób",
    companies: "Firmy",
    campaigns: "Kampanie"
  }[view];
}

function fullName(person: Person) {
  return [person.first_name, person.last_name].filter(Boolean).join(" ") || `Osoba #${person.id}`;
}

function makeStats(data: BootstrapData | null) {
  const people = data?.people || [];
  return {
    companies: data?.companies.length || 0,
    people: people.length,
    queue: people.filter((person) => person.status === "awaiting_selection" && person.campaign_id).length,
    sent: people.filter((person) => person.status === "sent").length,
    replied: people.filter((person) => person.status === "replied").length
  };
}

function groupEvents(events: Event[]) {
  return events.reduce<Record<number, Event[]>>((acc, event) => {
    const id = Number(event.entity_id);
    if (!acc[id]) acc[id] = [];
    acc[id].push(event);
    return acc;
  }, {});
}
