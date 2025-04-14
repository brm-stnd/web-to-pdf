import { NextRequest } from 'next/server';
import puppeteer from 'puppeteer-core';

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN!;
const BROWSERLESS_URL = `wss://production-sfo.browserless.io?token=${BROWSERLESS_TOKEN}`;

export async function POST(req: NextRequest) {
  const { url, ...rest } = await req.json();

  if (!url || typeof url !== 'string') {
    return new Response(JSON.stringify({ error: 'Missing or invalid "url" property' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const extraKeys = Object.keys(rest);
  if (extraKeys.length > 0) {
    return new Response(JSON.stringify({ error: `Unexpected property: ${extraKeys[0]}` }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: BROWSERLESS_URL,
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise((resolve) => {
                img.addEventListener('load', resolve);
                img.addEventListener('error', resolve);
              })
        )
      );
    });

    const pdfBuffer = await page.pdf({ format: 'A4' });

    await page.close();
    await browser.disconnect();

    return new Response(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="output.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF Generation Failed:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate PDF' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}