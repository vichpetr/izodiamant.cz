import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Kritická chyba: RESEND_API_KEY není definována v .env");
    return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { name, phone, email, message, material, service, thickness, length, price } = await request.json();

    const isContactForm = material === 'Obecný dotaz';
    const subject = isContactForm ? `Nová zpráva: ${name}` : `Poptávka z kalkulačky: ${name}`;

    const html = `
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
            <div style="border-top: 1px solid #eee; pt: 25px;">
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

    const { data, error } = await resend.emails.send({
      from: 'IZODIAMANT Web <onboarding@resend.dev>',
      to: ['info@izodiamant.cz'],
      replyTo: email || undefined,
      subject: subject,
      html: html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
