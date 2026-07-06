insert into public.companies
  (duns, company_name, domain, city, region, industry, sales_eur, employees_total, employees_reliable, branch_flag, blocked, source)
values
  ('849693443', 'Świat Szkła Sp. z o.o.', 'swiat-szkla.com.pl', 'Bielsko-Biała', 'Śląskie', 'Produkcja szkła płaskiego', 630, null, 0, 0, 0, 'demo'),
  ('522817543', 'Prolinea Sp. z o.o.', 'prolinea.eu', 'Wrocław', 'Dolnośląskie', 'Produkcja szkła płaskiego', 251, 5, 1, 0, 0, 'demo'),
  ('369417940', 'Huta Szkła Biaglass Łużyce', 'luzyce.pl', 'Pieńsk', 'Dolnośląskie', 'Produkcja szkła gospodarczego', 180, null, 0, 0, 0, 'demo'),
  ('989510751', 'Innovaglass Solution Sp. z o.o.', 'innovaglasssolution.com', 'Warszawa', 'Mazowieckie', 'Obróbka szkła', 61, null, 0, 0, 0, 'demo'),
  ('675248111', 'Photonroof P.S.A.', 'misspv1.pl', 'Zaczernie', 'Podkarpackie', 'Fotowoltaika / szkło', 121, null, 0, 0, 0, 'demo'),
  ('731904882', 'Energo-Szkło Technology Sp. z o.o.', 'energoszklo.pl', 'Poznań', 'Wielkopolskie', 'Szkło techniczne dla energetyki', 1840, 76, 1, 0, 0, 'demo'),
  ('614280337', 'TermoGlass Polska S.A.', 'termoglass.pl', 'Gdańsk', 'Pomorskie', 'Izolacje szklane / przemysł', 3920, 144, 1, 0, 0, 'demo')
on conflict (duns) do nothing;

insert into public.campaigns
  (id, name, date_from, date_to, goal, status, updated_by)
overriding system value
values
  (1, 'Szkło H1 - Śląsk + Dolny Śląsk', '2026-06-12', '2026-06-30', 'Producenci szkła płaskiego, okno przed wakacjami', 'aktywna', 'ai'),
  (2, 'Producenci szkła - Dolny Śląsk + Mazowsze', '2026-06-23', '2026-07-11', 'Kandydaci z mailem osobistym, gotowi do kontaktu. Okno przed sezonem letnim.', 'zaproponowana', 'ai')
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.campaigns', 'id'), greatest((select max(id) from public.campaigns), 1), true);

insert into public.people
  (id, duns, first_name, last_name, title, email, email_type, contactability, source, is_dnb_anchor,
   icp_profile, ready_for_outreach, ready_reason, selected_for_outreach, campaign_id, optout,
   status, created_at, updated_by)
overriding system value
values
  (1, '849693443', 'Tomasz Edward', 'Olek', 'Prezes Zarządu', 't.olek@swiat-szkla.com.pl', 'personal', 'A', 'dnb', 1, null, 1, 'mail osobisty z D&B', 0, 1, 0, 'sent', '2026-06-11 17:35+00', 'operator'),
  (2, '849693443', 'Anna', 'Nowak', 'Dyrektor Operacyjny', 'a.nowak@swiat-szkla.com.pl', 'personal', 'A', 'apollo', 0, 'Operacje', 1, 'gotowa: decydent operacyjny + mail osobisty', 0, 2, 0, 'awaiting_selection', '2026-06-12 02:14+00', 'ai'),
  (3, '522817543', 'Mirosław Jan', 'Piększa', 'Prezes Zarządu', 'm.pienksza@prolinea.eu', 'personal', 'A', 'dnb', 1, null, 1, 'mail osobisty z D&B', 0, 1, 0, 'sent', '2026-06-11 17:35+00', 'operator'),
  (4, '369417940', 'Joanna', 'Lewandowska', 'Dyrektor Sprzedaży', 'j.lewandowska@luzyce.pl', 'personal', 'A', 'apollo', 0, 'Sprzedaż', 1, 'gotowa: profil sprzedażowy + mail osobisty', 0, 2, 0, 'awaiting_selection', '2026-06-12 02:30+00', 'ai'),
  (5, '989510751', 'Jacek Paweł', 'Witt', 'Prezes Zarządu', 'j.witt@innovaglasssolution.com', 'personal', 'A', 'dnb', 1, null, 1, 'mail osobisty z D&B', 0, 1, 0, 'replied', '2026-06-11 17:35+00', 'ai'),
  (6, '675248111', 'Dawid', 'Cycoń', 'Prezes Zarządu', 'd.cycon@misspv1.pl', 'personal', 'A', 'dnb', 1, null, 1, 'mail osobisty z D&B', 1, 1, 0, 'selected', '2026-06-11 17:35+00', 'operator'),
  (7, '731904882', 'Katarzyna', 'Kubiak', 'Dyrektor Operacyjna', 'k.kubiak@energoszklo.pl', 'personal', 'A', 'apollo', 0, 'Operacje', 1, 'gotowa: decydent operacyjny + mail osobisty', 0, null, 0, 'enriched', '2026-06-22 08:10+00', 'ai'),
  (8, '731904882', 'Robert', 'Maj', 'Prezes Zarządu', 'biuro@energoszklo.pl', 'generic', 'D', 'dnb', 1, null, 0, 'kotwica D&B; mail generyczny, do Apollo', 0, null, 0, 'sourced', '2026-06-22 08:11+00', 'ai'),
  (9, '614280337', 'Michał', 'Wrona', 'Kierownik ds. Zakupów Energii', 'm.wrona@termoglass.pl', 'personal', 'A', 'apollo', 0, 'Zakupy', 1, 'gotowy: profil zakupowy + mail osobisty', 0, null, 0, 'enriched', '2026-06-22 08:22+00', 'ai'),
  (10, '614280337', 'Ewa', 'Lis', 'Członek Zarządu', null, 'none', 'B', 'dnb', 1, null, 0, 'brak maila; wymaga wzbogacenia', 0, null, 0, 'sourced', '2026-06-22 08:23+00', 'ai')
on conflict (id) do nothing;

select setval(pg_get_serial_sequence('public.people', 'id'), greatest((select max(id) from public.people), 1), true);

insert into public.events(entity_type, entity_id, event_type, actor, payload, at)
values
  ('person', '1', 'sent', 'operator', '{"label":"Wysłany mail #1 (kampania H1)"}', '2026-06-13 09:12+00'),
  ('person', '3', 'sent', 'operator', '{"label":"Mail #1 wysłany"}', '2026-06-12 08:40+00'),
  ('person', '3', 'followup_1', 'operator', '{"label":"Follow-up #1"}', '2026-06-16 09:05+00'),
  ('person', '3', 'followup_2_silence', 'operator', '{"label":"Follow-up #2 - cisza"}', '2026-06-23 09:10+00'),
  ('person', '5', 'sent', 'operator', '{"label":"Mail #1 wysłany"}', '2026-06-12 08:42+00'),
  ('person', '5', 'replied', 'ai', '{"label":"ODPOWIEDŹ - zainteresowany"}', '2026-06-13 14:08+00');
