// HTML šablona poděkování za realizaci + prosba o hodnocení (Google i Mapy.com).
// Paleta a struktura navazují na e-maily z src/app/api/send/route.ts.

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const GOOGLE_REVIEW_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEW_URL || 'https://g.page/r/CUCprMsY1UeiEBM/review';
const FIRMY_REVIEW_URL =
  process.env.NEXT_PUBLIC_FIRMY_REVIEW_URL ||
  'https://www.firmy.cz/detail/13505805-izodiamant-nove-hrady.html#hodnoceni';

export function thankYouSubject(): string {
  return 'Děkujeme za důvěru – budeme rádi za vaše hodnocení';
}

/** Sestaví HTML poděkování. `name` je jméno zákazníka (může být prázdné). */
export function thankYouHtml(name: string): string {
  const safeName = escapeHtml(name).trim();
  const greeting = safeName ? `Dobrý den, ${safeName},` : 'Dobrý den,';

  const reviewButton = (href: string, label: string) => `
    <a href="${href}" target="_blank"
       style="display:inline-block; background-color:#1a1a1a; color:#c4d600; text-decoration:none;
              font-weight:bold; text-transform:uppercase; letter-spacing:1px; font-size:14px;
              padding:14px 28px; border-radius:10px; margin:6px 8px 6px 0;">
      ${label}
    </a>`;

  return `
  <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.05);">
    <div style="background-color:#1a1a1a; padding:32px; text-align:center;">
      <h1 style="color:#c4d600; margin:0; font-size:24px; text-transform:uppercase; letter-spacing:2px; font-style:italic;">IZODIAMANT</h1>
      <p style="color:rgba(255,255,255,0.5); margin:6px 0 0; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Vracíme zdraví vaší stavbě.</p>
    </div>

    <div style="padding:40px;">
      <div style="width:60px; height:6px; background-color:#c4d600; border-radius:3px; margin-bottom:24px;"></div>
      <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">${greeting}</p>
      <p style="font-size:16px; line-height:1.6; margin:0 0 16px;">
        děkujeme, že jste svěřili sanaci svého zdiva právě nám. Vážíme si vaší důvěry a věříme,
        že vám vaše stavba bude ještě dlouho dělat radost – suchá a zdravá.
      </p>
      <p style="font-size:16px; line-height:1.6; margin:0 0 24px;">
        Pokud jste byli s naší prací spokojeni, budeme moc rádi za krátké hodnocení. Pomůže nám to
        i dalším lidem, kteří řeší vlhké zdivo a hledají, komu můžou věřit. Zabere to jen chvilku:
      </p>

      <div style="text-align:center; margin:8px 0 28px;">
        ${reviewButton(GOOGLE_REVIEW_URL, 'Hodnotit na Google')}
        ${reviewButton(FIRMY_REVIEW_URL, 'Hodnotit na Mapy.com')}
      </div>

      <div style="background-color:#f8f9fa; border-radius:15px; padding:20px 24px; margin-bottom:8px;">
        <p style="font-size:14px; line-height:1.6; color:#555; margin:0;">
          Kdybyste cokoli potřebovali – doplnit dokumentaci, poradit s dalším postupem nebo řešit
          reklamaci – stačí odpovědět na tento e-mail nebo zavolat na <strong>+420 737 017 012</strong>.
          Rádi pomůžeme.
        </p>
      </div>
    </div>

    <div style="background-color:#f8f9fa; padding:24px 40px; text-align:center; border-top:1px solid #f0f1f2;">
      <p style="font-size:12px; color:#999; margin:0;">
        &copy; ${new Date().getFullYear()} IZODIAMANT &nbsp;·&nbsp;
        <a href="https://izodiamant.cz" style="color:#8a9600; text-decoration:none;">www.izodiamant.cz</a>
      </p>
    </div>
  </div>`;
}
