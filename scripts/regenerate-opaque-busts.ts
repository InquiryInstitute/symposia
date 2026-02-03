/**
 * Regenerate busts that don't have transparent backgrounds
 * 
 * Usage:
 *   npx tsx scripts/regenerate-opaque-busts.ts
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
  epithet: string;
  voice_id: string;
  traits?: string;
}

const SPEAKERS: Speaker[] = [
  {
    id: 'a.gautama.buddha',
    name: 'Gautama Buddha',
    epithet: 'Founder of the Sangha',
    voice_id: 'en-IN-PrabhatNeural',
    traits: 'Ancient Indian sage, serene expression, shaved head, simple robes, meditative posture',
  },
  {
    id: 'a.nagarjuna',
    name: 'Nāgārjuna',
    epithet: 'Philosopher of Emptiness',
    voice_id: 'en-IN-PrabhatNeural',
    traits: 'Indian Buddhist philosopher, scholarly appearance, contemplative expression',
  },
  {
    id: 'a.vasubandhu',
    name: 'Vasubandhu',
    epithet: 'Psychologist of Mind',
    voice_id: 'en-IN-PrabhatNeural',
    traits: 'Indian Buddhist philosopher, analytical expression, scholarly bearing',
  },
  {
    id: 'a.dogen',
    name: 'Dōgen',
    epithet: 'Practice Radical',
    voice_id: 'ja-JP-KeitaNeural',
    traits: 'Japanese Zen master, shaved head, direct expression, simple robes',
  },
  {
    id: 'a.ashoka',
    name: 'Ashoka',
    epithet: 'Political Realist',
    voice_id: 'en-IN-PrabhatNeural',
    traits: 'Mauryan emperor, regal bearing, contemplative expression, ancient Indian ruler',
  },
];

async function regenerateBusts(speaker: Speaker, retryCount = 0): Promise<{ success: boolean; error?: string; bust_frontal_url?: string; bust_right_url?: string }> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/generate-busts`;

  const requestBody = {
    faculty_slug: speaker.id,
    name: speaker.name,
    epithet: speaker.epithet,
    voice_id: speaker.voice_id,
    traits: speaker.traits,
  };

  console.log(`\n🎨 Regenerating busts for ${speaker.name} (${speaker.epithet})...`);
  console.log(`   Faculty ID: ${speaker.id}`);
  console.log(`   ⚠️  This will replace existing busts with transparent versions`);

  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      const errorData = JSON.parse(errorText).error || errorText;
      
      // Check for rate limiting
      if (errorData.includes('429') || errorData.includes('throttled') || errorData.includes('rate limit')) {
        const retryMatch = errorData.match(/retry_after[":\s]+(\d+)/i);
        const retryAfter = retryMatch ? parseInt(retryMatch[1]) : 10;
        
        if (retryCount < 3) {
          console.log(`   ⏳ Rate limited. Waiting ${retryAfter + 2} seconds before retry ${retryCount + 1}/3...`);
          await new Promise(resolve => setTimeout(resolve, (retryAfter + 2) * 1000));
          return regenerateBusts(speaker, retryCount + 1);
        } else {
          throw new Error(`Rate limited after ${retryCount} retries. Please wait and try again later.`);
        }
      }
      
      throw new Error(`generate-busts failed: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const data = await response.json();
    
    if (data.success) {
      console.log(`   ✅ Front view: ${data.bust_frontal_url}`);
      console.log(`   ✅ Right view: ${data.bust_right_url}`);
      return data;
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error(`   ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function regenerateAllOpaqueBusts() {
  console.log('🪷 Regenerating busts with transparent backgrounds\n');
  console.log('='.repeat(60));
  console.log(`\n⚠️  This will regenerate ${SPEAKERS.length} speaker(s) with transparent backgrounds.`);
  console.log(`⚠️  Replicate rate limit: 6 requests/min. Each speaker needs 2 images.`);
  console.log(`⚠️  This will take approximately ${Math.ceil((SPEAKERS.length * 2) / 6)} minutes.\n`);

  const results: Array<{
    speaker: Speaker;
    generation: { success: boolean; error?: string; bust_frontal_url?: string; bust_right_url?: string };
  }> = [];

  for (let i = 0; i < SPEAKERS.length; i++) {
    const speaker = SPEAKERS[i];
    
    // Generate busts
    const generation = await regenerateBusts(speaker);
    results.push({ speaker, generation });

    // Add delay between speakers to avoid rate limiting
    // Replicate allows 6 requests/min with burst of 1, so wait 70 seconds between speakers
    // (each speaker = 2 images, so we need ~35 seconds per image)
    if (i < SPEAKERS.length - 1) {
      console.log(`   ⏳ Waiting 70 seconds before next speaker (rate limit: 6/min, burst: 1)...`);
      await new Promise(resolve => setTimeout(resolve, 70000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  let successCount = 0;

  for (const { speaker, generation } of results) {
    if (generation.success) {
      successCount++;
      console.log(`✅ ${speaker.name}: Regenerated with transparent backgrounds`);
    } else {
      console.log(`❌ ${speaker.name}: Failed - ${generation.error || 'Unknown error'}`);
    }
  }

  console.log(`\n✅ Successfully regenerated: ${successCount}/${SPEAKERS.length}`);

  if (successCount === SPEAKERS.length) {
    console.log('\n🎉 All busts regenerated with transparent backgrounds!');
  } else {
    console.log('\n⚠️  Some busts failed to regenerate. Check errors above.');
  }
}

// Run the script
regenerateAllOpaqueBusts().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
