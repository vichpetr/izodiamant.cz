import { Resend } from 'resend';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Kritická chyba: RESEND_API_KEY není definována v .env");
    return NextResponse.json({ error: 'Server configuration error: Missing API Key' }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const { email, material, thickness, length, price, name, phone, message } = await request.json();

    const isContactForm = material === 'Obecný dotaz';

    const { data, error } = await resend.emails.send({
      from: 'IZODIAMANT <onboarding@resend.dev>',
      to: ['info@izodiamant.cz'],
      subject: isContactForm ? `Nová zpráva: ${name}` : 'Nová poptávka z kalkulačky',
      html: isContactForm ? `
        <h1>Nová zpráva z kontaktního formuláře</h1>
        <p><strong>Jméno:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefon:</strong> ${phone}</p>
        <p><strong>Zpráva:</strong><br />${message}</p>
      ` : `
        <h1>Nová poptávka z kalkulačky</h1>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Materiál:</strong> ${material}</p>
        <p><strong>Tloušťka:</strong> ${thickness} cm</p>
        <p><strong>Délka:</strong> ${length} m</p>
        <p><strong>Odhadovaná cena:</strong> ${price} Kč</p>
      `,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
