const sharp = require('sharp');
const path = require('path');

async function createBadgeIcon() {
  const inputPath = path.join(__dirname, '../public/icons/logo.png');
  const outputPath = path.join(__dirname, '../public/icons/logo-badge.png');

  const meta = await sharp(inputPath).metadata();
  console.log('Input:', meta.width, 'x', meta.height, 'channels:', meta.channels, 'hasAlpha:', meta.hasAlpha);

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const { width, height } = info;

  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];

    // Treat near-white or fully transparent as background
    const isBackground = a < 20 || (r > 230 && g > 230 && b > 230);

    if (isBackground) {
      pixels[i] = 0;
      pixels[i + 1] = 0;
      pixels[i + 2] = 0;
      pixels[i + 3] = 0;
    } else {
      // Logo shape: white opaque (Android only reads alpha channel for badge)
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      pixels[i + 3] = 255;
    }
  }

  await sharp(Buffer.from(pixels), {
    raw: { width, height, channels: 4 },
  })
    .resize(96, 96)
    .png()
    .toFile(outputPath);

  console.log('Created:', outputPath);
}

createBadgeIcon().catch(console.error);
