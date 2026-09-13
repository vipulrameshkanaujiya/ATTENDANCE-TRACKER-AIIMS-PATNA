const sharp = require('sharp');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local to avoid extra dependencies
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        let val = trimmed.slice(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  }
}

loadEnv();

(async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey);

  const sourcePath = path.resolve(process.cwd(), 'public/batch-photo.jpg');
  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Source image not found at ${sourcePath}`);
    process.exit(1);
  }

  const inputBuffer = fs.readFileSync(sourcePath);

  // Resize and convert to WebP
  const optimized = await sharp(inputBuffer)
    .resize(1200, 800, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();

  const originalKb = (inputBuffer.length / 1024).toFixed(1);
  const optimizedKb = (optimized.length / 1024).toFixed(1);
  console.log(`Original size: ${originalKb} KB (${inputBuffer.length} bytes)`);
  console.log(`Optimized WebP size: ${optimizedKb} KB (${optimized.length} bytes)`);

  // Save a local copy as public/batch-photo.webp
  fs.writeFileSync(path.resolve(process.cwd(), 'public/batch-photo.webp'), optimized);
  console.log('Saved local copy to public/batch-photo.webp');

  // Ensure storage bucket exists
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets && buckets.some((b) => b.name === 'batch-photos');
    if (!bucketExists) {
      console.log('Creating "batch-photos" storage bucket...');
      await supabase.storage.createBucket('batch-photos', { public: true });
    }
  } catch (err) {
    console.warn('Bucket check/creation notice:', err.message);
  }

  // Upload to Supabase Storage
  const fileName = 'batch-photo-2024.webp';
  const { error: uploadError } = await supabase.storage
    .from('batch-photos')
    .upload(fileName, optimized, {
      contentType: 'image/webp',
      upsert: true,
    });

  if (uploadError) {
    console.error('Upload error:', uploadError);
    return;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('batch-photos')
    .getPublicUrl(fileName);

  console.log('Public URL:', publicUrl);

  // Update app_settings
  const { error: dbError } = await supabase.from('app_settings').upsert({
    key: 'batch_photo',
    value: { url: publicUrl, caption: 'MBBS Batch 2024 — AIIMS Patna' },
    updated_at: new Date().toISOString(),
  });

  if (dbError) {
    console.error('Database update error:', dbError);
  } else {
    console.log('✅ Batch photo optimized, uploaded to Supabase Storage, and app_settings updated!');
  }
})();
