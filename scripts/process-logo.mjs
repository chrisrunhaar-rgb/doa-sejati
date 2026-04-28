import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SOURCE = 'C:/Users/user/Documents/Doa Sejati/Logo/Doa Sejati - no background.png';
const ICONS = path.join(ROOT, 'public/icons');
const PUBLIC = path.join(ROOT, 'public');
const APP = path.join(ROOT, 'app');

// Dark navy background for home screen icons
async function main() {
  const meta = await sharp(SOURCE).metadata();
  console.log(`Source: ${meta.width}x${meta.height} channels:${meta.channels} hasAlpha:${meta.hasAlpha}`);

  // Get logo as transparent PNG (remove white bg if no alpha channel)
  let logoBuffer;
  if (meta.hasAlpha) {
    logoBuffer = await sharp(SOURCE).toBuffer();
  } else {
    const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 235 && g > 235 && b > 235) data[i + 3] = 0;
    }
    logoBuffer = await sharp(Buffer.from(data), {
      raw: { width: info.width, height: info.height, channels: 4 }
    }).png().toBuffer();
  }

  // Generate app icon: blue DS mark on white background, centred with padding
  async function makeIcon(size, outPath) {
    const pad = Math.round(size * 0.14);
    const logoSize = size - pad * 2;
    const resized = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 255 } } })
      .composite([{ input: resized, gravity: 'center' }])
      .png()
      .toFile(outPath);
    console.log('→', path.basename(outPath));
  }

  await makeIcon(192, path.join(ICONS, 'logo-192.png'));
  await makeIcon(512, path.join(ICONS, 'logo-512.png'));
  await makeIcon(180, path.join(ICONS, 'apple-touch-icon.png'));

  // Favicon: 32x32 transparent, copy to app/favicon.ico
  const faviconTmp = path.join(PUBLIC, 'favicon-tmp.png');
  await makeIcon(32, faviconTmp);
  fs.copyFileSync(faviconTmp, path.join(APP, 'favicon.ico'));
  fs.unlinkSync(faviconTmp);
  console.log('→ app/favicon.ico');

  // NOTE: logo-ds-white.png (in-app logo with text) is managed separately
  // Source: public/icons/logo-white.png — do NOT auto-generate it here

  console.log('\nDone.');
}

main().catch(e => { console.error(e); process.exit(1); });
