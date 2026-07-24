# Wim van Breda chatbot-widget

Een embedbare, meertalige Next.js-widget voor snelle routering van vragen over onderdelen, machines, onderhoud, reparatie, occasions, verhuur en algemeen contact.

## Installatie en lokaal testen

Benodigd: Node.js 20+, npm en een Resend-account met een geverifieerd verzenddomein.

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open vervolgens `http://localhost:3000`. Gebruik `npm run build` vóór iedere productie-deploy.

## Environment variables

Vul uitsluitend `.env.local` lokaal of Vercel Environment Variables in:

- `OPENAI_API_KEY`: OpenAI-sleutel, uitsluitend server-side.
- `RESEND_API_KEY`: Resend-sleutel voor formuliermails.
- `MAIL_FROM`: geverifieerde Resend-afzender, bijvoorbeeld `Wim van Breda chatbot <chatbot@uwdomein.nl>`.
- `WORKSHOP_TO`, `SALES_TO`, `PARTS_TO`, `RECEPTION_TO`: interne ontvangers.
- `WVB_PHONE_NUMBER`: telefoonnummer zonder `tel:`; deze waarde voedt de belknop.
- `NEXT_PUBLIC_SITE_URL`: productie-URL van deze widget-app.

`MAIL_HOST`, `MAIL_PORT`, `MAIL_USER` en `MAIL_PASS` zijn gereserveerd indien later Nodemailer wordt gekozen; de huidige implementatie gebruikt Resend. Plaats nooit een echte sleutel in `.env.example`, broncode of WordPress.

## E-mailroutering

Alle routering staat centraal in `lib/contactRouting.ts`. De browser stuurt alleen een contacttype; de server bepaalt het bijbehorende environment-variable-adres.

- `WORKSHOP` / `WORKSHOP_CALLBACK` → `WORKSHOP_TO`
- `SALES` / `SALES_CALLBACK` → `SALES_TO`
- `PARTS` / `PARTS_CALLBACK` → `PARTS_TO`
- `RECEPTION` → `RECEPTION_TO`

Ontvangers zijn nooit zichtbaar of kiesbaar voor bezoekers. `app/api/contact/route.ts` valideert invoer, honeypot en rate-limit; `lib/mail.ts` verstuurt de HTML-mail met relevante paginacontext.

## OpenAI en veiligheid

`/api/chat` gebruikt OpenAI uitsluitend voor open vragen. Beslisboomkeuzes blijven client-side. De API past vooraf prijs- en prompt-injection-guardrails toe; de OpenAI-systeeminstructie krijgt alleen de lokale knowledge base mee. Sleutels, prompts en interne configuratie worden niet aan de browser teruggegeven.

Beide API-routes hebben een in-memory rate limit en een honeypot. Gebruik voor meer dan één serverless instance een gedeelde rate-limitopslag (bijvoorbeeld Upstash Redis) vóór grootschalige productie. Er is geen analytics en er worden geen aanvragen opgeslagen.

## Knowledge base en wijzigingen

- Nieuwe feitelijke informatie: `knowledge/wimvanbreda.md` en `knowledge/links.md`.
- Gedrags- of veiligheidsregels: `knowledge/regels.md` en `knowledge/verboden.md`.
- Nieuwe flow of afdeling: `lib/contactRouting.ts` plus de acties in `components/ChatWidget.tsx`.
- Nieuwe taal/teksten: `lib/translations.ts` en de flowteksten in `ChatWidget.tsx`.
- Huisstijl: de uitsluitend `wvb-chatbot-`-scoped regels in `app/globals.css`.
- Telefoonnummer: `WVB_PHONE_NUMBER`.

Controleer alle knowledge-base-aanpassingen tegen wimvanbreda.nl voordat ze live gaan.

## Vercel deploy

1. Push de repository naar de gekozen Git-provider en importeer hem in Vercel.
2. Voeg alle variabelen uit `.env.example` toe in **Settings → Environment Variables** (zonder `.env.local` te uploaden).
3. Configureer een geverifieerd `MAIL_FROM`-domein in Resend.
4. Deploy en test `/widget`, `/api/chat` en een contactformulier.
5. Stel de productie-URL in bij `NEXT_PUBLIC_SITE_URL`.

De CSP in `next.config.js` staat iframe-embedding alleen toe vanaf `wimvanbreda.nl` en `www.wimvanbreda.nl`. Voeg een extra geautoriseerd domein daar expliciet toe.

## WordPress embed

Plaats vlak vóór `</body>` een script tag, na de Vercel-deploy:

```html
<script src="https://MIJN-DOMAIN.nl/widget.js" async></script>
```

`widget.js` initialiseert slechts één iframe en de widget draait geïsoleerd van WordPress-CSS. Test op desktop, tablet en mobiel. Gebruik de echte Vercel-domeinnaam in plaats van `MIJN-DOMAIN.nl`.

## Tests en acceptatiecheck

`tests/contactRouting.test.ts` dekt contacttypes, callbacks, prijsregel, promptbescherming en classificatie. Controleer daarnaast handmatig:

1. Onderdelen → webshop; onderdeel niet gevonden → PARTS.
2. Onderhoud/reparatie en callback → WORKSHOP / WORKSHOP_CALLBACK.
3. Nieuwe machine, verhuur en occasion → SALES.
4. Hoofdmenu “Contact opnemen” → receptie.
5. Prijsvraag toont exact de verplichte tekst en formulier.
6. Engels en Duits schakelen interface en antwoorden consequent om.
7. Open op een machinepagina en controleer URL/paginatitel in de ontvangen e-mail.
8. Controleer mobiel, toetsenbordfocus en foutmeldingen in het formulier.

## Veelvoorkomende fouten

- **E-mail wordt niet verstuurd:** controleer `RESEND_API_KEY`, domeinverificatie en `MAIL_FROM`.
- **Geen AI-antwoord:** controleer `OPENAI_API_KEY` en de OpenAI-quotumstatus; de widget valt veilig terug op het contactformulier.
- **Embed blijft leeg:** controleer de productie-URL, CSP `frame-ancestors` en browser-console.
- **Belknop werkt niet:** vul `WVB_PHONE_NUMBER` in en deploy opnieuw.
