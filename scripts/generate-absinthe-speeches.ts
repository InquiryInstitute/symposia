/**
 * Generate speeches for the Absinthe symposia using ask-faculty edge function
 * 
 * Usage:
 *   npx tsx scripts/generate-absinthe-speeches.ts
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
  id: string;
  name: string;
  epithet: string;
  isHeretic?: boolean;
  sessionTitle: string;
  focus: string;
}

const SPEAKERS: Speaker[] = [
  {
    id: 'a.gogh',
    name: 'Vincent van Gogh',
    epithet: 'The Martyr',
    sessionTitle: 'Opening: The Gathering',
    focus: 'Perception, suffering, and the retroactive scapegoat. Absinthe as perceptual intensifier—color, vibration, halos. The danger of retroactively blaming the substance instead of conditions. Mental illness, poverty, and alcohol as myth-making machine.',
  },
  {
    id: 'a.crowley',
    name: 'Aleister Crowley',
    epithet: 'The Magus',
    sessionTitle: 'Crowley: Intoxication as Ritual Technology',
    focus: 'Intoxication as ritual technology. Absinthe as a technology of will, not escapism. Intoxication as threshold crossing. Discipline vs dissipation—intention, ritual, altered states as tools.',
  },
  {
    id: 'a.wilde',
    name: 'Oscar Wilde',
    epithet: 'The Wit',
    sessionTitle: 'Wilde: Absinthe as Social Artifice',
    focus: 'Absinthe as social artifice. Absinthe as performance and social theater. Famous quips vs lived decline. The aestheticization of intoxication—charm masking decay.',
  },
  {
    id: 'a.toulouse-lautrec',
    name: 'Henri de Toulouse-Lautrec',
    epithet: 'The Chronicler',
    sessionTitle: 'Toulouse-Lautrec: The Café as Laboratory',
    focus: 'The café as laboratory. Invented absinthe cocktails; near-constant use. Café culture embodied. Absinthe as social lubricant, not mysticism. The artist as ethnographer of nightlife—everyday absinthe, not mythic absinthe.',
  },
  {
    id: 'a.pasteur',
    name: 'Louis Pasteur',
    epithet: 'The Scientist',
    sessionTitle: 'Pasteur: What Was Actually in the Glass',
    focus: 'What was actually in the glass? Chemical analysis, fermentation, the thujone question. Data against myth.',
  },
  {
    id: 'a.foucault',
    name: 'Michel Foucault',
    epithet: 'The Philosopher',
    sessionTitle: 'Foucault: Why the State Feared the Fairy',
    focus: 'Why the state feared the Fairy. Prohibition as biopower, the construction of deviance, absinthe as threat to social order.',
  },
  {
    id: 'a.verlaine',
    name: 'Paul Verlaine',
    epithet: 'The Heretic',
    isHeretic: true,
    sessionTitle: 'Verlaine: The Case from the Wreckage',
    focus: 'The case for prohibition—delivered from inside the wreckage. Severe absinthe dependency: violence, madness, prison, collapse. When the Green Fairy does devour. No redemption, only testimony.',
  },
];

interface PreviousSpeech {
  speaker: string;
  content: string;
}

async function generateSpeech(
  speaker: Speaker,
  previousSpeeches: PreviousSpeech[] = []
): Promise<{ speech: string; metadata: any }> {
  const functionUrl = `${SUPABASE_URL}/functions/v1/ask-faculty`;

  const requestBody = {
    faculty_id: speaker.id,
    message: `Generate your symposium speech for the Absinthe symposia. Your focus: ${speaker.focus}. This is a gathering in a fin-de-siècle Parisian café. You are ${speaker.name}, ${speaker.epithet}.`,
    context: 'symposium' as const,
    context_key: 'absinthe',
    generate_speech: true,
    speech_length: 'medium' as const, // ~7 minutes, ~1050 words
    previous_speeches: previousSpeeches,
  };

  console.log(`\n📝 Generating speech for ${speaker.name} (${speaker.epithet})...`);
  if (previousSpeeches.length > 0) {
    console.log(`   (with ${previousSpeeches.length} previous speech${previousSpeeches.length > 1 ? 'es' : ''} as context)`);
  }

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
    throw new Error(`ask-faculty failed for ${speaker.id}: ${response.status} ${response.statusText}\n${errorText}`);
  }

  const data = await response.json();
  
  if (!data.response) {
    throw new Error(`No response in data for ${speaker.id}: ${JSON.stringify(data)}`);
  }

  console.log(`   ✅ Generated ${data.metadata?.word_count || 'unknown'} words`);
  if (data.metadata?.estimated_duration_minutes) {
    console.log(`   ⏱️  Estimated duration: ${data.metadata.estimated_duration_minutes.toFixed(1)} minutes`);
  }

  return {
    speech: data.response,
    metadata: data.metadata || {},
  };
}

async function generateAllSpeeches() {
  console.log('🍃 Generating speeches for the Symposion of the Green Fairy\n');
  console.log('=' .repeat(60));

  const speeches: Array<{
    speaker: Speaker;
    speech: string;
    metadata: any;
  }> = [];

  for (let i = 0; i < SPEAKERS.length; i++) {
    const speaker = SPEAKERS[i];
    
    // Build previous speeches array
    const previousSpeeches: PreviousSpeech[] = speeches.map(s => ({
      speaker: s.speaker.id,
      content: s.speech,
    }));

    try {
      const result = await generateSpeech(speaker, previousSpeeches);
      speeches.push({
        speaker,
        speech: result.speech,
        metadata: result.metadata,
      });

      // Add a small delay to avoid rate limiting
      if (i < SPEAKERS.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`\n❌ Error generating speech for ${speaker.name}:`, error);
      throw error;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All speeches generated successfully!\n');

  // Output the speeches in a format ready to paste into the component
  console.log('// Speech content for AbsinthePresentation component\n');
  console.log('const SPEECHES: Record<string, string> = {');

  for (const { speaker, speech } of speeches) {
    // Convert dot notation to hyphen for the key (e.g., 'a.gogh' -> 'a-gogh')
    const key = speaker.id.replace(/\./g, '-');
    const escapedSpeech = speech
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\${/g, '\\${');
    
    console.log(`  '${key}': \`${escapedSpeech}\`,`);
  }

  console.log('};');
  console.log('\n// Total speeches:', speeches.length);
  console.log('// Total word count:', speeches.reduce((sum, s) => sum + (s.metadata?.word_count || 0), 0));
  console.log('// Total estimated duration:', speeches.reduce((sum, s) => sum + (s.metadata?.estimated_duration_minutes || 0), 0).toFixed(1), 'minutes');
}

// Run the script
generateAllSpeeches().catch((error) => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
