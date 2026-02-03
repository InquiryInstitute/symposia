/**
 * Generate bust images for Attachment and Sangha symposium speakers
 * 
 * Usage:
 *   npx tsx scripts/generate-attachment-sangha-busts.ts
 * 
 * Requires:
 *   - PUBLIC_SUPABASE_URL environment variable
 *   - PUBLIC_SUPABASE_ANON_KEY environment variable
 */

// Try to load dotenv if available
try {
  await import('dotenv/config');
} catch {
  // dotenv not available, use environment variables directly
}

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  console.error('You can set it as an environment variable or in a .env file');
  process.exit(1);
}

interface Speaker {
  id: string; // dot format (a.gautama.buddha)
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
    voice_id: 'en-US-GuyNeural',
    traits: 'Indian Buddhist philosopher, scholarly appearance, contemplative expression',
  },
  {
    id: 'a.vasubandhu',
    name: 'Vasubandhu',
    epithet: 'Psychologist of Mind',
    voice_id: 'en-US-GuyNeural',
    traits: 'Indian Buddhist philosopher, analytical expression, scholarly bearing',
  },
  {
    id: 'a.dogen',
    name: 'Dōgen',
    epithet: 'Practice Radical',
    voice_id: 'en-US-DavisNeural',
    traits: 'Japanese Zen master, shaved head, direct expression, simple robes',
  },
  {
    id: 'a.ashoka',
    name: 'Ashoka',
    epithet: 'Political Realist',
    voice_id: 'en-US-DavisNeural',
    traits: 'Mauryan emperor, regal bearing, contemplative expression, ancient Indian ruler',
  },
  {
    id: 'a.simone.weil',
    name: 'Simone Weil',
    epithet: 'Severe Mystic',
    voice_id: 'en-US-AriaNeural',
    traits: 'French philosopher, intense expression, early 20th century appearance, severe features',
  },
  {
    id: 'a.nietzsche',
    name: 'Friedrich Nietzsche',
    epithet: 'The Prosecutor',
    voice_id: 'de-DE-KatjaNeural',
    traits: 'German philosopher, distinctive mustache, intense expression, 19th century appearance',
  },
];

async function generateBusts(speaker: Speaker, retryCount = 0): Promise<{ success: boolean; error?: string; bust_frontal_url?: string; bust_right_url?: string }> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/generate-busts`;

  const requestBody = {
    faculty_slug: speaker.id,
    name: speaker.name,
    epithet: speaker.epithet,
    voice_id: speaker.voice_id,
    traits: speaker.traits,
  };

  console.log(`\n🎨 Generating busts for ${speaker.name} (${speaker.epithet})...`);
  console.log(`   Faculty ID: ${speaker.id}`);

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
          return generateBusts(speaker, retryCount + 1);
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

async function verifyBusts(speakerId: string): Promise<{ bust_frontal_url: string | null; bust_right_url: string | null }> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/faculty?handle=${speakerId}`;

  try {
    const response = await fetch(functionUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch faculty: ${response.status}`);
    }

    const data = await response.json();
    return {
      bust_frontal_url: data.bust_frontal_url || null,
      bust_right_url: data.bust_right_url || null,
    };
  } catch (error) {
    console.error(`   ⚠️  Failed to verify: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return {
      bust_frontal_url: null,
      bust_right_url: null,
    };
  }
}

async function generateAllBusts() {
  console.log('🪷 Generating busts for Attachment and Sangha speakers\n');
  console.log('='.repeat(60));

  // First, check which busts already exist
  console.log('\n📋 Checking existing busts...\n');
  const existingBusts: Record<string, { bust_frontal_url: string | null; bust_right_url: string | null }> = {};
  
  for (const speaker of SPEAKERS) {
    const verification = await verifyBusts(speaker.id);
    existingBusts[speaker.id] = verification;
    
    if (verification.bust_frontal_url && verification.bust_right_url) {
      console.log(`✅ ${speaker.name}: Already has both busts`);
    } else if (verification.bust_frontal_url || verification.bust_right_url) {
      console.log(`⚠️  ${speaker.name}: Has partial busts (Front: ${verification.bust_frontal_url ? '✓' : '✗'}, Right: ${verification.bust_right_url ? '✓' : '✗'})`);
    } else {
      console.log(`❌ ${speaker.name}: No busts found`);
    }
  }

  // Filter to only speakers missing busts
  const speakersNeedingBusts = SPEAKERS.filter(speaker => {
    const existing = existingBusts[speaker.id];
    return !existing.bust_frontal_url || !existing.bust_right_url;
  });

  if (speakersNeedingBusts.length === 0) {
    console.log('\n🎉 All speakers already have busts!');
    return;
  }

  console.log(`\n📝 Need to generate busts for ${speakersNeedingBusts.length} speaker(s):`);
  speakersNeedingBusts.forEach(s => console.log(`   - ${s.name}`));
  console.log('\n⚠️  Note: Replicate rate limit is 6 requests/min. Each speaker needs 2 images, so this will take time.\n');

  const results: Array<{
    speaker: Speaker;
    generation: { success: boolean; error?: string; bust_frontal_url?: string; bust_right_url?: string };
    verification: { bust_frontal_url: string | null; bust_right_url: string | null };
  }> = [];

  for (let i = 0; i < speakersNeedingBusts.length; i++) {
    const speaker = speakersNeedingBusts[i];
    
    // Generate busts
    const generation = await generateBusts(speaker);
    
    // Wait a moment for database update
    if (generation.success) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Verify they're set in database
    const verification = await verifyBusts(speaker.id);
    
    results.push({ speaker, generation, verification });

    // Add delay between speakers to avoid rate limiting
    // Replicate allows 6 requests/min with burst of 1, so wait 70 seconds between speakers
    // (each speaker = 2 images, so we need ~35 seconds per image)
    if (i < speakersNeedingBusts.length - 1) {
      console.log(`   ⏳ Waiting 70 seconds before next speaker (rate limit: 6/min, burst: 1)...`);
      await new Promise(resolve => setTimeout(resolve, 70000));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:\n');

  let successCount = 0;
  let verifiedCount = 0;

  for (const { speaker, generation, verification } of results) {
    const genSuccess = generation.success;
    const verified = verification.bust_frontal_url && verification.bust_right_url;
    
    if (genSuccess) successCount++;
    if (verified) verifiedCount++;

    const status = genSuccess && verified ? '✅' : genSuccess ? '⚠️' : '❌';
    console.log(`${status} ${speaker.name}`);
    if (genSuccess) {
      console.log(`   Generated: Front=${generation.bust_frontal_url ? '✓' : '✗'}, Right=${generation.bust_right_url ? '✓' : '✗'}`);
    }
    if (verified) {
      console.log(`   Verified in DB: Front=${verification.bust_frontal_url ? '✓' : '✗'}, Right=${verification.bust_right_url ? '✓' : '✗'}`);
    } else if (genSuccess) {
      console.log(`   ⚠️  Generated but not yet in database (may need a moment to update)`);
    }
    if (generation.error) {
      console.log(`   Error: ${generation.error}`);
    }
    console.log();
  }

  console.log(`\n✅ Successfully generated: ${successCount}/${SPEAKERS.length}`);
  console.log(`✅ Verified in database: ${verifiedCount}/${SPEAKERS.length}`);

  if (verifiedCount === SPEAKERS.length) {
    console.log('\n🎉 All busts generated and verified!');
  } else if (successCount === SPEAKERS.length) {
    console.log('\n⚠️  All busts generated, but some may need a moment to appear in database.');
  } else {
    console.log('\n❌ Some busts failed to generate. Check errors above.');
  }
}

// Run the script
generateAllBusts().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
