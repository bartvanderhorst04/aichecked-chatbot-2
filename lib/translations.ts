export type Language = 'nl' | 'en' | 'de';
export type LocalizedAction = { id: string; label: string; href?: string };
export const languageOptions: Array<{ code: Language; label: string }> = [
  { code: 'nl', label: 'Nederlands' },
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
];

type Labels = {
  assistant: string; subtitle: string; infoBar: string; opening: string; chooseTopic: string; chooseLanguage: string; languagePrompt: string; changeLanguage: string; back: string;
  help: string; ready: string; teaser: string; pill: string; close: string; languageLabel: string;
  inputPlaceholder: string; inputLabel: string; actionLabel: string; honeypot: string;
  ask: string; contact: string; call: string; callback: string; send: string; sending: string;
  thanks: string; company: string; name: string; email: string; phone: string; question: string;
  requiredName: string; requiredContact: string; requiredQuestion: string; invalidEmail: string;
  technicalError: string; moreQuestion: string; fallback: string; contactIntro: string; rentalReply: string; rentalCta: string;
  privacy: string; formIntro: Record<'parts' | 'machine' | 'workshop' | 'occasion' | 'rental' | 'general', string>;
  disclaimer: string; disclaimerLabel: string; disclaimerInfo: string; privacyNotice: string;
  flow: Record<'parts' | 'workshop' | 'occasion' | 'rental' | 'machine' | 'general' | 'ask', string>;
  followUp: Record<'new' | 'existing' | 'unknown', string>;
  menu: LocalizedAction[]; choices: Record<'parts' | 'machine' | 'workshop' | 'occasion' | 'rental' | 'general' | 'machineNew' | 'machineExisting', LocalizedAction[]>;
};

export const translations: Record<Language, Labels> = {
  nl: {
    assistant: 'Wim van Breda AI assistent', subtitle: 'Waarmee kunnen wij u helpen?', infoBar: 'Wij reageren zo snel mogelijk!', opening: 'Welkom. Waarmee kan ik u helpen?', chooseTopic: 'Kies een onderwerp', chooseLanguage: 'Kies uw taal', languagePrompt: 'Selecteer de taal waarin u geholpen wilt worden.', changeLanguage: 'Taal wijzigen', back: 'Terug',
    help: 'Hulp nodig?', ready: 'Wij staan voor u klaar!', pill: 'Wim van Breda AI assistent', languageLabel: 'Taal kiezen',
    teaser: 'Waarmee kunnen wij u helpen?', close: 'Sluiten', inputPlaceholder: 'Typ uw vraag…', inputLabel: 'Typ uw vraag', actionLabel: 'Keuzemogelijkheden', honeypot: 'Website',
    ask: 'Stel uw vraag', contact: 'Contact', call: 'Bel direct', callback: 'Terugbelverzoek', send: 'Verzenden', sending: 'Verzenden…',
    thanks: 'Bedankt. Wij nemen zo snel mogelijk contact met u op.', company: 'Bedrijfsnaam', name: 'Uw naam', email: 'E-mailadres', phone: 'Telefoonnummer', question: 'Uw vraag',
    requiredName: 'Vul uw naam in.', requiredContact: 'Vul minimaal een e-mailadres of telefoonnummer in.', requiredQuestion: 'Vul uw vraag in.', invalidEmail: 'Vul een geldig e-mailadres in.',
    technicalError: 'Verzenden is niet gelukt. Probeer het later opnieuw.', moreQuestion: 'Nog een vraag stellen', fallback: 'Hierover beschik ik niet over voldoende informatie. Laat gerust uw gegevens achter.', contactIntro: 'Laat uw gegevens achter, dan neemt Wim van Breda contact met u op.', rentalReply: 'U kunt onze verhuuropties bekijken op de verhuurpagina. Daar vindt u meer informatie over beschikbare machines.', rentalCta: 'Bekijk verhuurpagina',
    privacy: 'Door dit formulier te versturen, gaat u akkoord dat Wim van Breda contact met u opneemt over uw aanvraag.',
    disclaimer: 'De AI-assistent van Wim van Breda geeft algemene en vrijblijvende informatie. Aan antwoorden van de chatbot kunnen geen rechten worden ontleend. Prijzen, beschikbaarheid, levertijden, technische geschiktheid, garanties en afspraken zijn pas bindend na schriftelijke bevestiging door Wim van Breda.\n\nDe chatbot kan helpen bij algemene vragen, onderdelen, machines, service, verhuur, occasions en contactverzoeken. Bij twijfel of bij vragen over prijs, voorraad, levertijd of technische geschiktheid verwijst de chatbot door naar Wim van Breda.',
    disclaimerLabel: 'Disclaimer', disclaimerInfo: 'Informatie over de AI-assistent',
    privacyNotice: 'Wanneer u gegevens via de chatbot verstuurt, gebruikt Wim van Breda deze gegevens om contact met u op te nemen over uw aanvraag. Raadpleeg de privacyverklaring van Wim van Breda voor meer informatie.',
    formIntro: {
      parts: 'Om u goed te helpen, vermeld graag de productnaam, het OEM-nummer, merk en type machine, eventueel serienummer en een korte omschrijving.',
      machine: 'Om u goed te helpen, vermeld graag het type machine, de toepassing, of het om nieuw, gebruikt of huur gaat en uw gewenste termijn.',
      workshop: 'Om u goed te helpen, vermeld graag de machine, het probleem, de urgentie en – indien relevant – de locatie.',
      occasion: 'Om u goed te helpen, vermeld graag waar u naar op zoek bent en wanneer u contact wilt.',
      rental: 'Om u goed te helpen, vermeld graag de werkzaamheden, gewenste machine en gewenste periode.',
      general: 'Beschrijf uw vraag zo volledig mogelijk, dan komt deze bij de juiste collega terecht.',
    },
    flow: { parts: 'Voor onderdelen kunt u terecht in onze webshop. Daar vindt u ons actuele assortiment.', workshop: 'Voor onderhoud of reparatie kunt u telefonisch contact opnemen of een terugbelverzoek achterlaten. Onze werkplaats helpt u graag verder.', occasion: 'Ons occasionaanbod wisselt regelmatig. Bekijk daarom het actuele aanbod op onze website.', rental: 'Voor verhuur kunt u terecht op onze verhuurpagina. Heeft u een vraag of wilt u een aanvraag indienen? Laat dan uw gegevens achter.', machine: 'Gaat uw vraag over een nieuwe machine of een bestaande machine?', general: 'Hoe wilt u contact met ons opnemen?', ask: 'Waarmee kunnen wij u helpen?' },
    followUp: { new: 'Waar wilt u meer over weten?', existing: 'Waar gaat uw vraag over?', unknown: 'Geen probleem. Om welke machine of werkzaamheden gaat het?' },
    menu: [{ id: 'parts', label: 'Onderdeel zoeken' }, { id: 'workshop', label: 'Reparatie / service' }, { id: 'occasion', label: 'Occasions' }, { id: 'rental', label: 'Machine huren' }, { id: 'general', label: 'Contact' }],
    choices: {
      parts: [{ id: 'webshop', label: 'Naar de webshop', href: 'https://webshop.wimvanbreda.nl' }, { id: 'parts-form', label: 'Onderdeel niet gevonden' }, { id: 'callback', label: 'Terugbelverzoek' }, { id: 'form', label: 'Contact' }, { id: 'ask', label: 'Nog een vraag stellen' }],
      machine: [{ id: 'new', label: 'Nieuwe machine' }, { id: 'existing', label: 'Bestaande machine' }, { id: 'unknown', label: 'Ik weet het niet' }],
      workshop: [{ id: 'call', label: 'Bel direct' }, { id: 'callback', label: 'Terugbelverzoek achterlaten' }, { id: 'form', label: 'Onderhoudsvraag stellen' }, { id: 'form', label: 'Reparatievraag stellen' }, { id: 'ask', label: 'Nog een vraag stellen' }],
      occasion: [{ id: 'occasion-link', label: 'Bekijk occasions', href: 'https://wimvanbreda.nl/occasions-overzicht/' }, { id: 'form', label: 'Vraag stellen over een occasion' }, { id: 'callback', label: 'Terugbelverzoek' }, { id: 'form', label: 'Contact opnemen' }, { id: 'ask', label: 'Nog een vraag stellen' }],
      rental: [{ id: 'rental-link', label: 'Bekijk verhuurpagina', href: 'https://wimvanbreda.nl/verhuur/' }, { id: 'form', label: 'Verhuuraanvraag doen' }, { id: 'callback', label: 'Terugbelverzoek' }, { id: 'form', label: 'Contact opnemen' }, { id: 'ask', label: 'Nog een vraag stellen' }],
      general: [{ id: 'call', label: 'Bel direct' }, { id: 'form', label: 'Stel uw vraag' }],
      machineNew: [{ id: 'specifications', label: 'Specificaties' }, { id: 'application', label: 'Toepassing' }, { id: 'form', label: 'Machine aanvragen' }, { id: 'rental', label: 'Verhuur' }, { id: 'occasion', label: 'Occasion' }, { id: 'ask', label: 'Stel uw vraag' }, { id: 'callback', label: 'Terugbelverzoek' }, { id: 'form', label: 'Contact opnemen' }],
      machineExisting: [{ id: 'parts', label: 'Onderdelen' }, { id: 'workshop', label: 'Onderhoud' }, { id: 'workshop', label: 'Reparatie' }, { id: 'documentation', label: 'Documentatie' }, { id: 'ask', label: 'Stel uw vraag' }, { id: 'form', label: 'Contact opnemen' }],
    },
  },
  en: {
    assistant: 'Wim van Breda AI assistant', subtitle: 'How can we help you?', infoBar: 'We will respond as soon as possible!', opening: 'Welcome. How can I help you?', chooseTopic: 'Choose a topic', chooseLanguage: 'Choose your language', languagePrompt: 'Select the language in which you would like to be helped.', changeLanguage: 'Change language', back: 'Back',
    help: 'Need help?', ready: 'We are here for you!', pill: 'Wim van Breda AI assistant', languageLabel: 'Choose language',
    teaser: 'How can we help you?', close: 'Close', inputPlaceholder: 'Type your question…', inputLabel: 'Type your question', actionLabel: 'Options', honeypot: 'Website',
    ask: 'Ask your question', contact: 'Contact', call: 'Call now', callback: 'Request a callback', send: 'Send', sending: 'Sending…',
    thanks: 'Thank you. We will contact you as soon as possible.', company: 'Company name', name: 'Your name', email: 'Email address', phone: 'Phone number', question: 'Your question',
    requiredName: 'Please enter your name.', requiredContact: 'Please enter an email address or phone number.', requiredQuestion: 'Please enter your question.', invalidEmail: 'Please enter a valid email address.',
    technicalError: 'Sending failed. Please try again later.', moreQuestion: 'Ask another question', fallback: 'We do not have enough information about this. Please leave your details.', contactIntro: 'Please leave your details and Wim van Breda will contact you.', rentalReply: 'You can view our rental options on the rental page. There you will find more information about available machines.', rentalCta: 'View rental page',
    privacy: 'By submitting this form, you agree that Wim van Breda may contact you about your request.',
    disclaimer: 'The Wim van Breda AI assistant provides general and non-binding information. No rights can be derived from the chatbot’s responses. Prices, availability, delivery times, technical suitability, warranties and agreements are only binding after written confirmation by Wim van Breda.\n\nThe chatbot can help with general questions, parts, machines, service, rental, used machines and contact requests. In case of doubt, or for questions about price, stock, delivery time or technical suitability, the chatbot will refer you to Wim van Breda.',
    disclaimerLabel: 'Disclaimer', disclaimerInfo: 'Information about the AI assistant',
    privacyNotice: 'When you submit details through the chatbot, Wim van Breda uses this information to contact you about your request. Please refer to Wim van Breda’s privacy statement for more information.',
    formIntro: {
      parts: 'To help you properly, please include the product name, OEM number, machine make and type, serial number if available, and a short description.',
      machine: 'To help you properly, please include the machine type, application, whether it is new, used or rental, and your preferred timeframe.',
      workshop: 'To help you properly, please include the machine, the problem, urgency and, where relevant, the location.',
      occasion: 'To help you properly, please tell us what you are looking for and when you would like to be contacted.',
      rental: 'To help you properly, please include the work, desired machine and required period.',
      general: 'Please describe your question as fully as possible so it reaches the right colleague.',
    },
    flow: { parts: 'For parts, please visit our webshop.', workshop: 'Our workshop will be happy to help with maintenance or repairs.', occasion: 'View our current used-machine range on our website.', rental: 'For rentals, please visit our rental page.', machine: 'Is your question about a new or existing machine?', general: 'How would you like to contact us?', ask: 'Please type your question.' },
    followUp: { new: 'What would you like to know more about?', existing: 'What is your question about?', unknown: 'No problem. Which machine or work is this about?' },
    menu: [{ id: 'parts', label: 'Find a part' }, { id: 'workshop', label: 'Repair / service' }, { id: 'occasion', label: 'Used machines' }, { id: 'rental', label: 'Machine rental' }, { id: 'general', label: 'Contact' }],
    choices: {
      parts: [{ id: 'webshop', label: 'Go to webshop', href: 'https://webshop.wimvanbreda.nl' }, { id: 'parts-form', label: 'Part not found' }, { id: 'callback', label: 'Request a callback' }, { id: 'form', label: 'Contact' }, { id: 'ask', label: 'Ask another question' }],
      machine: [{ id: 'new', label: 'New machine' }, { id: 'existing', label: 'Existing machine' }, { id: 'unknown', label: 'I do not know' }],
      workshop: [{ id: 'call', label: 'Call now' }, { id: 'callback', label: 'Request a callback' }, { id: 'form', label: 'Maintenance or repair question' }, { id: 'ask', label: 'Ask another question' }],
      occasion: [{ id: 'occasion-link', label: 'View used machines', href: 'https://wimvanbreda.nl/occasions-overzicht/' }, { id: 'form', label: 'Ask about a used machine' }, { id: 'callback', label: 'Request a callback' }, { id: 'ask', label: 'Ask another question' }],
      rental: [{ id: 'rental-link', label: 'View rental page', href: 'https://wimvanbreda.nl/verhuur/' }, { id: 'form', label: 'Rental request' }, { id: 'callback', label: 'Request a callback' }, { id: 'ask', label: 'Ask another question' }],
      general: [{ id: 'call', label: 'Call now' }, { id: 'form', label: 'Ask your question' }],
      machineNew: [{ id: 'specifications', label: 'Specifications' }, { id: 'application', label: 'Application' }, { id: 'form', label: 'Request a machine' }, { id: 'rental', label: 'Rental' }, { id: 'occasion', label: 'Used machines' }, { id: 'ask', label: 'Ask your question' }, { id: 'callback', label: 'Request a callback' }, { id: 'form', label: 'Contact' }],
      machineExisting: [{ id: 'parts', label: 'Parts' }, { id: 'workshop', label: 'Maintenance' }, { id: 'workshop', label: 'Repair' }, { id: 'documentation', label: 'Documentation' }, { id: 'ask', label: 'Ask your question' }, { id: 'form', label: 'Contact' }],
    },
  },
  de: {
    assistant: 'Wim van Breda KI-Assistent', subtitle: 'Wie können wir Ihnen helfen?', infoBar: 'Wir antworten so schnell wie möglich!', opening: 'Willkommen. Wobei kann ich Ihnen helfen?', chooseTopic: 'Wählen Sie ein Thema', chooseLanguage: 'Sprache wählen', languagePrompt: 'Wählen Sie die Sprache, in der Sie Hilfe erhalten möchten.', changeLanguage: 'Sprache ändern', back: 'Zurück',
    help: 'Brauchen Sie Hilfe?', ready: 'Wir sind für Sie da!', pill: 'Wim van Breda KI-Assistent', languageLabel: 'Sprache wählen',
    teaser: 'Wie können wir Ihnen helfen?', close: 'Schließen', inputPlaceholder: 'Geben Sie Ihre Frage ein…', inputLabel: 'Geben Sie Ihre Frage ein', actionLabel: 'Auswahlmöglichkeiten', honeypot: 'Website',
    ask: 'Stellen Sie Ihre Frage', contact: 'Kontakt', call: 'Jetzt anrufen', callback: 'Rückruf anfordern', send: 'Senden', sending: 'Wird gesendet…',
    thanks: 'Vielen Dank. Wir melden uns so schnell wie möglich bei Ihnen.', company: 'Firmenname', name: 'Ihr Name', email: 'E-Mail-Adresse', phone: 'Telefonnummer', question: 'Ihre Frage',
    requiredName: 'Bitte geben Sie Ihren Namen ein.', requiredContact: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein.', requiredQuestion: 'Bitte geben Sie Ihre Frage ein.', invalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
    technicalError: 'Senden fehlgeschlagen. Bitte versuchen Sie es später erneut.', moreQuestion: 'Weitere Frage stellen', fallback: 'Dazu liegen uns nicht genügend Informationen vor. Bitte hinterlassen Sie Ihre Daten.', contactIntro: 'Hinterlassen Sie Ihre Daten, dann nimmt Wim van Breda Kontakt mit Ihnen auf.', rentalReply: 'Sie können unsere Mietoptionen auf der Vermietungsseite ansehen. Dort finden Sie weitere Informationen über verfügbare Maschinen.', rentalCta: 'Vermietungsseite ansehen',
    privacy: 'Mit dem Absenden dieses Formulars stimmen Sie zu, dass Wim van Breda Sie zu Ihrer Anfrage kontaktieren darf.',
    disclaimer: 'Der KI-Assistent von Wim van Breda gibt allgemeine und unverbindliche Informationen. Aus den Antworten des Chatbots können keine Rechte abgeleitet werden. Preise, Verfügbarkeit, Lieferzeiten, technische Eignung, Garantien und Vereinbarungen sind erst nach schriftlicher Bestätigung durch Wim van Breda verbindlich.\n\nDer Chatbot kann bei allgemeinen Fragen, Ersatzteilen, Maschinen, Service, Vermietung, Gebrauchtmaschinen und Kontaktanfragen helfen. Bei Zweifeln oder Fragen zu Preis, Lagerbestand, Lieferzeit oder technischer Eignung verweist der Chatbot an Wim van Breda.',
    disclaimerLabel: 'Hinweis', disclaimerInfo: 'Informationen zum KI-Assistenten',
    privacyNotice: 'Wenn Sie Daten über den Chatbot senden, verwendet Wim van Breda diese Informationen, um Sie bezüglich Ihrer Anfrage zu kontaktieren. Weitere Informationen finden Sie in der Datenschutzerklärung von Wim van Breda.',
    formIntro: {
      parts: 'Damit wir Ihnen gut helfen können, nennen Sie bitte Produktname, OEM-Nummer, Marke und Typ der Maschine, wenn möglich Seriennummer sowie eine kurze Beschreibung.',
      machine: 'Damit wir Ihnen gut helfen können, nennen Sie bitte Maschinentyp, Einsatzbereich, ob es um Neu, Gebraucht oder Miete geht und Ihren gewünschten Zeitraum.',
      workshop: 'Damit wir Ihnen gut helfen können, nennen Sie bitte Maschine, Problem, Dringlichkeit und gegebenenfalls den Einsatzort.',
      occasion: 'Damit wir Ihnen gut helfen können, sagen Sie uns bitte, wonach Sie suchen und wann wir Sie kontaktieren dürfen.',
      rental: 'Damit wir Ihnen gut helfen können, nennen Sie bitte Arbeiten, gewünschte Maschine und gewünschten Zeitraum.',
      general: 'Beschreiben Sie Ihre Frage möglichst vollständig, damit sie die richtige Ansprechperson erreicht.',
    },
    flow: { parts: 'Für Ersatzteile besuchen Sie bitte unseren Webshop.', workshop: 'Unsere Werkstatt hilft Ihnen gerne bei Wartung oder Reparatur.', occasion: 'Sehen Sie unser aktuelles Gebrauchtmaschinenangebot auf unserer Website an.', rental: 'Für Vermietungen besuchen Sie bitte unsere Vermietungsseite.', machine: 'Geht Ihre Frage um eine neue oder bestehende Maschine?', general: 'Wie möchten Sie Kontakt aufnehmen?', ask: 'Geben Sie gerne Ihre Frage ein.' },
    followUp: { new: 'Worüber möchten Sie mehr erfahren?', existing: 'Worum geht es bei Ihrer Frage?', unknown: 'Kein Problem. Um welche Maschine oder Arbeiten geht es?' },
    menu: [{ id: 'parts', label: 'Ersatzteil suchen' }, { id: 'workshop', label: 'Reparatur / Service' }, { id: 'occasion', label: 'Gebrauchtmaschinen' }, { id: 'rental', label: 'Maschine mieten' }, { id: 'general', label: 'Kontakt' }],
    choices: {
      parts: [{ id: 'webshop', label: 'Zum Webshop', href: 'https://webshop.wimvanbreda.nl' }, { id: 'parts-form', label: 'Teil nicht gefunden' }, { id: 'callback', label: 'Rückruf anfordern' }, { id: 'form', label: 'Kontakt' }, { id: 'ask', label: 'Weitere Frage stellen' }],
      machine: [{ id: 'new', label: 'Neue Maschine' }, { id: 'existing', label: 'Bestehende Maschine' }, { id: 'unknown', label: 'Ich weiß es nicht' }],
      workshop: [{ id: 'call', label: 'Jetzt anrufen' }, { id: 'callback', label: 'Rückruf anfordern' }, { id: 'form', label: 'Wartungs- oder Reparaturfrage' }, { id: 'ask', label: 'Weitere Frage stellen' }],
      occasion: [{ id: 'occasion-link', label: 'Gebrauchtmaschinen ansehen', href: 'https://wimvanbreda.nl/occasions-overzicht/' }, { id: 'form', label: 'Frage zu Gebrauchtmaschinen' }, { id: 'callback', label: 'Rückruf anfordern' }, { id: 'ask', label: 'Weitere Frage stellen' }],
      rental: [{ id: 'rental-link', label: 'Vermietungsseite ansehen', href: 'https://wimvanbreda.nl/verhuur/' }, { id: 'form', label: 'Mietanfrage' }, { id: 'callback', label: 'Rückruf anfordern' }, { id: 'ask', label: 'Weitere Frage stellen' }],
      general: [{ id: 'call', label: 'Jetzt anrufen' }, { id: 'form', label: 'Stellen Sie Ihre Frage' }],
      machineNew: [{ id: 'specifications', label: 'Spezifikationen' }, { id: 'application', label: 'Einsatzbereich' }, { id: 'form', label: 'Maschine anfragen' }, { id: 'rental', label: 'Vermietung' }, { id: 'occasion', label: 'Gebrauchtmaschinen' }, { id: 'ask', label: 'Stellen Sie Ihre Frage' }, { id: 'callback', label: 'Rückruf anfordern' }, { id: 'form', label: 'Kontakt' }],
      machineExisting: [{ id: 'parts', label: 'Ersatzteile' }, { id: 'workshop', label: 'Wartung' }, { id: 'workshop', label: 'Reparatur' }, { id: 'documentation', label: 'Dokumentation' }, { id: 'ask', label: 'Stellen Sie Ihre Frage' }, { id: 'form', label: 'Kontakt' }],
    },
  },
};

export function detectLanguage(value: string): Language | undefined {
  if (/\b(the|and|with|please|machine|parts|price|rent)\b/i.test(value)) return 'en';
  if (/\b(und|bitte|maschine|teile|preis|mieten|ich|sie)\b/i.test(value)) return 'de';
  return undefined;
}
