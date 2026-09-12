const sharp = require('sharp');

(async () => {
  await sharp('public/logo.png').resize(192, 192).toFile('public/icon-192.png');
  await sharp('public/logo.png').resize(512, 512).toFile('public/icon-512.png');
  await sharp('public/logo.png').resize(180, 180).toFile('public/apple-touch-icon.png');
  // Maskable icon needs padding (safe zone 80% of canvas)
  const maskableSize = 512;
  const innerSize = Math.floor(maskableSize * 0.8);
  const padding = Math.floor((maskableSize - innerSize) / 2);
  const resized = await sharp('public/logo.png').resize(innerSize, innerSize).toBuffer();
  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 79, g: 70, b: 229, alpha: 1 } // Indigo background
    }
  }).composite([{ input: resized, top: padding, left: padding }])
    .toFile('public/icon-maskable-512.png');
  console.log('Icons generated ✅');
})();
