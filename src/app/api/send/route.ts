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
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a; border: 1px solid #eee; border-radius: 20px; overflow: hidden; background-color: #ffffff; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
          <div style="background-color: #1a1a1a; padding: 40px 30px; text-align: center;">
            <h1 style="color: #c4d600; margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: 3px; font-style: italic;">IZODIAMANT</h1>
            <p style="color: rgba(255,255,255,0.5); margin: 8px 0 0; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; font-weight: bold;">Vracíme zdraví vaší stavbě</p>
          </div>
          
          <div style="padding: 50px 40px; text-align: center;">
            <div style="width: 60px; height: 6px; background-color: #c4d600; margin: 0 auto 30px; border-radius: 3px;"></div>
            <h2 style="font-size: 24px; font-weight: 900; margin-bottom: 20px; text-transform: uppercase; tracking: -0.02em; italic: true;">Dobrý den, ${name},</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #444; margin-bottom: 35px; font-weight: 500;">
              Děkujeme za váš zájem o naše služby. Vaši zprávu jsme úspěšně přijali a náš technik ji již začal zpracovávat.
            </p>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 15px; text-align: left; margin-bottom: 35px; border: 1px solid #f0f1f2;">
              <p style="margin: 0 0 15px; font-size: 12px; font-weight: 900; color: #c4d600; text-transform: uppercase; letter-spacing: 1px;">Co se bude dít dál?</p>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #c4d600; font-weight: bold; margin-right: 10px;">•</div>
                <div style="font-size: 14px; color: #555; font-weight: 500;">Prověříme technické možnosti realizace.</div>
              </div>
              <div style="display: flex; margin-bottom: 12px;">
                <div style="color: #c4d600; font-weight: bold; margin-right: 10px;">•</div>
                <div style="font-size: 14px; color: #555; font-weight: 500;">Budeme vás kontaktovat pro upřesnění detailů nebo domluvení <span style="font-weight: bold; color: #1a1a1a;">bezplatné obhlídky</span>.</div>
              </div>
              <div style="display: flex;">
                <div style="color: #c4d600; font-weight: bold; margin-right: 10px;">•</div>
                <div style="font-size: 14px; color: #555; font-weight: 500;">V případě poptávky z kalkulačky pro vás připravíme přesný rozpis prací.</div>
              </div>
            </div>

            <p style="font-size: 14px; color: #888; line-height: 1.6;">
              Tento e-mail je potvrzením o doručení zprávy.<br />
              V případě potřeby nás můžete kontaktovat přímo:
            </p>
            
            <div style="margin-top: 20px;">
              <a href="tel:+420737017012" style="display: inline-block; padding: 12px 25px; background-color: #1a1a1a; color: #c4d600; text-decoration: none; border-radius: 10px; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">
                +420 737 017 012
              </a>
            </div>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 30px; text-align: center; color: #adb5bd; font-size: 11px; border-top: 1px solid #f0f1f2; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
            &copy; ${new Date().getFullYear()} IZODIAMANT — Sanace a izolace zdiva<br />
            <a href="https://izodiamant.cz" style="color: #c4d600; text-decoration: none; margin-top: 5px; display: inline-block;">www.izodiamant.cz</a>
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
