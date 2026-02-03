/**
 * Check if bust images have transparent backgrounds
 * 
 * Usage:
 *   npx tsx scripts/check-bust-transparency.ts
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

interface Speaker {
  id: string;
  name: string;
}

const SPEAKERS: Speaker[] = [
  { id: 'a.gautama.buddha', name: 'Gautama Buddha' },
  { id: 'a.nagarjuna', name: 'Nāgārjuna' },
  { id: 'a.vasubandhu', name: 'Vasubandhu' },
  { id: 'a.dogen', name: 'Dōgen' },
  { id: 'a.ashoka', name: 'Ashoka' },
  { id: 'a.simone.weil', name: 'Simone Weil' },
  { id: 'a.nietzsche', name: 'Friedrich Nietzsche' },
];

/**
 * Check if an image has transparency by downloading it and checking the format
 * PNG with alpha channel should have transparency
 */
async function checkImageTransparency(imageUrl: string): Promise<{ hasTransparency: boolean; format: string; error?: string }> {
  try {
    const response = await fetch(imageUrl, { method: 'HEAD' });
    if (!response.ok) {
      return { hasTransparency: false, format: 'unknown', error: `HTTP ${response.status}` };
    }

    const contentType = response.headers.get('content-type') || '';
    
    // PNG files can have transparency, but we need to check the actual image
    // For now, we'll download a small portion to check
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return { hasTransparency: false, format: 'unknown', error: `Failed to download: ${imageResponse.status}` };
    }

    const buffer = await imageResponse.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Check PNG signature
    const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
    
    if (isPNG) {
      // Check for tRNS chunk (transparency) or RGBA color type (which supports alpha)
      // PNG color types: 0=grayscale, 2=RGB, 3=indexed, 4=grayscale+alpha, 6=RGB+alpha
      const colorType = uint8Array[25];
      const hasAlpha = colorType === 4 || colorType === 6; // Grayscale+alpha or RGB+alpha
      
      // Also check for tRNS chunk (transparency chunk)
      let hasTRNS = false;
      for (let i = 0; i < Math.min(uint8Array.length - 4, 1000); i++) {
        if (uint8Array[i] === 0x74 && uint8Array[i+1] === 0x52 && uint8Array[i+2] === 0x4E && uint8Array[i+3] === 0x53) {
          hasTRNS = true;
          break;
        }
      }
      
      return {
        hasTransparency: hasAlpha || hasTRNS,
        format: `PNG (color type: ${colorType}, alpha: ${hasAlpha}, tRNS: ${hasTRNS})`,
      };
    }
    
    // JPEG never has transparency
    const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
    if (isJPEG) {
      return { hasTransparency: false, format: 'JPEG (no transparency support)' };
    }
    
    return { hasTransparency: false, format: 'unknown' };
  } catch (error) {
    return {
      hasTransparency: false,
      format: 'unknown',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function checkAllBusts() {
  console.log('🔍 Checking bust transparency for Attachment and Sangha speakers\n');
  console.log('='.repeat(60));

  const results: Array<{
    speaker: Speaker;
    frontal: { url: string | null; transparency: { hasTransparency: boolean; format: string; error?: string } | null };
    right: { url: string | null; transparency: { hasTransparency: boolean; format: string; error?: string } | null };
  }> = [];

  for (const speaker of SPEAKERS) {
    // Fetch faculty data
    const functionUrl = `${SUPABASE_URL}/functions/v1/faculty?handle=${speaker.id}`;
    
    let frontalUrl: string | null = null;
    let rightUrl: string | null = null;
    
    try {
      const response = await fetch(functionUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        frontalUrl = data.bust_frontal_url || null;
        rightUrl = data.bust_right_url || null;
      }
    } catch (error) {
      console.error(`   ⚠️  Failed to fetch faculty data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Check transparency
    const frontalTransparency = frontalUrl ? await checkImageTransparency(frontalUrl) : null;
    const rightTransparency = rightUrl ? await checkImageTransparency(rightUrl) : null;

    results.push({
      speaker,
      frontal: { url: frontalUrl, transparency: frontalTransparency },
      right: { url: rightUrl, transparency: rightTransparency },
    });

    console.log(`\n${speaker.name}:`);
    if (frontalUrl) {
      const status = frontalTransparency?.hasTransparency ? '✅' : '❌';
      console.log(`   ${status} Front: ${frontalTransparency?.hasTransparency ? 'Transparent' : 'NOT TRANSPARENT'} (${frontalTransparency?.format || 'unknown'})`);
      if (frontalTransparency?.error) {
        console.log(`      Error: ${frontalTransparency.error}`);
      }
    } else {
      console.log(`   ⚠️  Front: No URL`);
    }
    
    if (rightUrl) {
      const status = rightTransparency?.hasTransparency ? '✅' : '❌';
      console.log(`   ${status} Right: ${rightTransparency?.hasTransparency ? 'Transparent' : 'NOT TRANSPARENT'} (${rightTransparency?.format || 'unknown'})`);
      if (rightTransparency?.error) {
        console.log(`      Error: ${rightTransparency.error}`);
      }
    } else {
      console.log(`   ⚠️  Right: No URL`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  const needsRegeneration: Speaker[] = [];

  for (const { speaker, frontal, right } of results) {
    const frontalNeedsFix = frontal.url && !frontal.transparency?.hasTransparency;
    const rightNeedsFix = right.url && !right.transparency?.hasTransparency;
    
    if (frontalNeedsFix || rightNeedsFix) {
      needsRegeneration.push(speaker);
      console.log(`❌ ${speaker.name} needs regeneration:`);
      if (frontalNeedsFix) console.log(`   - Front bust is not transparent`);
      if (rightNeedsFix) console.log(`   - Right bust is not transparent`);
    } else if (frontal.url || right.url) {
      console.log(`✅ ${speaker.name} has transparent busts`);
    } else {
      console.log(`⚠️  ${speaker.name} has no busts`);
    }
  }

  if (needsRegeneration.length > 0) {
    console.log(`\n⚠️  ${needsRegeneration.length} speaker(s) need bust regeneration:`);
    needsRegeneration.forEach(s => console.log(`   - ${s.name}`));
    console.log(`\nRun: npx tsx scripts/generate-attachment-sangha-busts.ts`);
  } else {
    console.log(`\n✅ All existing busts have transparent backgrounds!`);
  }
}

checkAllBusts().catch(console.error);
