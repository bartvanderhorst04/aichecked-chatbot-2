# AIChecked.nl Chatbot Widget

Een premium floating chatbot widget voor AIChecked.nl. Vervangt de bestaande "Plan een gratis kennismaking" CTA-knop en integreert naadloos in de bestaande website.

---

## Bestanden

```
components/
  AICheckedChatbot.tsx    ← Hoofdcomponent (voeg toe aan je homepage)

app/api/
  chat/route.ts           ← OpenAI chat API endpoint
  lead/route.ts           ← Lead capture & e-mail notificatie endpoint

.env.example              ← Omgevingsvariabelen voorbeeld
```

---

## Installatie op AIChecked.nl (statische HTML website)

De chatbot draait als standalone app op **chat.aichecked.nl** (Vercel). De statische
website embedt hem via één script tag — er zijn geen API keys nodig op de website
zelf; alle OpenAI- en e-mailaanroepen gebeuren server-side op chat.aichecked.nl.

### Stap 1: Deploy deze app naar Vercel

```bash
vercel --prod
```

Stel in Vercel (Settings → Environment Variables) in:

- `OPENAI_API_KEY` = jouw OpenAI API key (verplicht)
- `RESEND_API_KEY` = jouw Resend API key voor chatbot notificaties

Koppel daarna het domein **chat.aichecked.nl** aan het Vercel project
(Settings → Domains) en voeg bij je DNS-provider een CNAME record toe:
`chat` → `cname.vercel-dns.com`.

### Stap 2: Plak de embed script tag op de website

Voeg op elke pagina van aichecked.nl, vlak voor `</body>`, toe:

```html
<script src="https://chat.aichecked.nl/embed.js" defer></script>
```

Dat is alles. Het script (`public/embed.js`) injecteert een iframe naar
`https://chat.aichecked.nl/embed` rechtsonder op de pagina en vergroot/verkleint
het iframe automatisch wanneer de chat opent of sluit, zodat het de rest van de
pagina nooit blokkeert.

### Beveiliging

- Alleen `aichecked.nl` en `www.aichecked.nl` mogen de widget embedden
  (afgedwongen via een `frame-ancestors` CSP-header in `next.config.js`).
- API keys staan uitsluitend als environment variables op Vercel en komen nooit
  in de browser of op de statische website terecht.

---

## Vercel Deployment

```bash
# Installeer dependencies
npm install

# Test lokaal
npm run dev

# Deploy naar Vercel
vercel --prod
```

**Vercel environment variables instellen:**

1. Ga naar je Vercel project dashboard
2. Settings → Environment Variables
3. Voeg toe:
   - `OPENAI_API_KEY` = jouw OpenAI API key
   - `RESEND_API_KEY` = jouw Resend API key

---

## E-mail notificaties

### Optie A: Resend (aanbevolen)

1. Maak een account op [resend.com](https://resend.com)
2. Verifieer je domein `aichecked.nl`
3. Maak een API key aan
4. Stel `RESEND_API_KEY` in als environment variable

Alle chatbot notificaties lopen via `app/api/send-chat-email/route.ts`.

---

## Wat de chatbot doet

- **Vervangt** de bestaande "Plan een gratis kennismaking" floating button
- **Behoudt** de CTA als prominente button binnen de chat
- **Converseert** in het Nederlands via GPT-4o-mini
- **Herkent** koopsignalen en toont automatisch het lead capture formulier
- **Stuurt** lead notificaties naar info@aichecked.nl
- **Toont** AIChecked.nl contactgegevens na succesvolle aanvraag

---

## Aanpassen

De chatbot gebruikt uitsluitend inline CSS en geen externe dependencies, zodat hij de bestaande website styling niet beïnvloedt.

Om kleuren of teksten aan te passen, bewerk je direct `components/AICheckedChatbot.tsx`:
- Primaire kleur: `#2EF2C0` (emerald green)
- Achtergrond: `#050505` / `#0B0B0B`
- Welkomstbericht: `WELCOME_MESSAGE.content`
- Quick reply opties: `QUICK_REPLIES` array
- Systeemprompt: `SYSTEM_PROMPT` in `app/api/chat/route.ts`
