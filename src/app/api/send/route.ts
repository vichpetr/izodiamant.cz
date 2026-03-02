import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || 'IZODIAMANT <onboarding@resend.dev>';
  const contactEmail = process.env.CONTACT_EMAIL || 'info@izodiamant.cz';

  if (!apiKey) {
    console.error("Kritická chyba: RESEND_API_KEY není definována v .env");
    return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { name, phone, email, message, material, service, thickness, length, price } = await request.json();

    const isContactForm = material === 'Obecný dotaz';
    const adminSubject = isContactForm ? `Nová zpráva: ${name}` : `Poptávka z kalkulačky: ${name}`;

    const adminHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
          <h1 style="color: #c4d600; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">IZODIAMANT</h1>
          <p style="color: rgba(255,255,255,0.6); margin: 5px 0 0; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Sanace zdiva</p>
        </div>
        
        <div style="padding: 40px;">
          <h2 style="font-size: 20px; margin-bottom: 25px; border-bottom: 2px solid #c4d600; padding-bottom: 10px; display: inline-block;">
            ${isContactForm ? 'Zpráva z kontaktního formuláře' : 'Nová poptávka z kalkulačky'}
          </h2>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px; width: 140px;">Jméno:</td>
              <td style="padding: 10px 0; font-weight: bold; font-size: 16px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px;">Telefon:</td>
              <td style="padding: 10px 0; font-weight: bold; font-size: 16px;">
                <a href="tel:${phone}" style="color: #1a1a1a; text-decoration: none;">${phone}</a>
              </td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 14px;">E-mail:</td>
              <td style="padding: 10px 0; font-weight: bold; font-size: 16px;">
                ${email ? `<a href="mailto:${email}" style="color: #1a1a1a;">${email}</a>` : '<span style="color: #ccc;">Neuveden</span>'}
              </td>
            </tr>
          </table>

          ${!isContactForm ? `
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin-bottom: 30px;">
              <h3 style="margin-top: 0; font-size: 14px; text-transform: uppercase; color: #666;">Specifikace poptávky:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 5px 0; font-size: 14px;">Zdivo:</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">${material}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px;">Technologie:</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right; color: #8a9600;">${service}</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px;">Tloušťka:</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">${thickness} cm</td>
                </tr>
                <tr>
                  <td style="padding: 5px 0; font-size: 14px;">Délka:</td>
                  <td style="padding: 5px 0; font-weight: bold; text-align: right;">${length} m</td>
                </tr>
                <tr style="border-top: 1px solid #ddd;">
                  <td style="padding: 15px 0 0; font-size: 16px; font-weight: bold;">Odhad ceny:</td>
                  <td style="padding: 15px 0 0; font-size: 20px; font-weight: 900; text-align: right; color: #1a1a1a;">${price}</td>
                </tr>
              </table>
            </div>
          ` : ''}

          ${message ? `
            <div style="border-top: 1px solid #eee; padding-top: 25px;">
              <h3 style="font-size: 14px; text-transform: uppercase; color: #666;">Zpráva od zákazníka:</h3>
              <p style="font-size: 16px; line-height: 1.6; white-space: pre-wrap; color: #333; background: #fff8e1; padding: 15px; border-radius: 8px; border-left: 4px solid #c4d600;">${message}</p>
            </div>
          ` : ''}
        </div>
        
        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
          Odesláno z webu izodiamant.cz
        </div>
      </div>
    `;

    // Send email to admin
    await resend.emails.send({
      from: fromEmail,
      to: [contactEmail],
      replyTo: email || undefined,
      subject: adminSubject,
      html: adminHtml,
    });

    // Send confirmation to customer if email is provided
    if (email) {
      const customerSubject = 'Děkujeme za vaši poptávku – IZODIAMANT.cz';
      const customerHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #eee; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #1a1a1a; padding: 30px; text-align: center;">
            <h1 style="color: #c4d600; margin: 0; font-size: 24px; text-transform: uppercase; letter-spacing: 2px;">IZODIAMANT</h1>
          </div>
          <div style="padding: 40px; text-align: center;">
            <h2 style="font-size: 22px; margin-bottom: 20px;">Dobrý den, ${name},</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #444; margin-bottom: 30px;">
              Děkujeme za váš zájem o naše služby. Vaši zprávu jsme úspěšně přijali a náš technik ji již začal zpracovávat.
            </p>
            <div style="background-color: #f9f9f9; padding: 25px; border-radius: 8px; text-align: left; margin-bottom: 30px;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666; text-transform: uppercase;">Co se bude dít dál?</p>
              <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.8;">
                <li>Prověříme technické možnosti realizace.</li>
                <li>Budeme vás kontaktovat pro upřesnění detailů nebo domluvení bezplatné obhlídky.</li>
                <li>V případě kalkulačky pro vás připravíme přesný rozpis prací.</li>
              </ul>
            </div>
            <p style="font-size: 14px; color: #888;">
              Tento e-mail je potvrzením o doručení zprávy. <br />
              V případě potřeby nás můžete kontaktovat přímo na <a href="tel:+420737017012" style="color: #1a1a1a; font-weight: bold; text-decoration: none;">+420 737 017 012</a>.
            </p>
          </div>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #999; font-size: 11px;">
            &copy; ${new Date().getFullYear()} IZODIAMANT - Sanace a izolace zdiva
          </div>
        </div>
      `;

      await resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: customerSubject,
        html: customerHtml,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Chyba při odesílání e-mailu:", error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
