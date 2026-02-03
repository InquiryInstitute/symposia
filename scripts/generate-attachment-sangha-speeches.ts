/**
 * Generate speeches for the Attachment and Sangha symposium using ask-faculty edge function
 * 
 * Usage:
 *   npx tsx scripts/generate-attachment-sangha-speeches.ts
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
  focus: string;
}

const SPEAKERS: Speaker[] = [
  {
    id: 'a.gautama.buddha',
    name: 'Gautama Buddha',
    epithet: 'Founder of the Sangha',
    focus: 'The original paradox-holder. You built the Sangha while teaching that attachment is the root of suffering. Defend sangha as instrumental, not sentimental. Spiritual friendship is the whole of the holy life. The Sangha as a raft—useful for crossing, to be abandoned once the other shore is reached.',
  },
  {
    id: 'a.nagarjuna',
    name: 'Nāgārjuna',
    epithet: 'Philosopher of Emptiness',
    focus: 'Dissolve the false binary: attachment versus relationship. Community is empty, dependently arisen, non-ownable. Only what lacks essence can be shared without bondage. Show how sangha is empty yet necessary. Emptiness and dependent origination are one.',
  },
  {
    id: 'a.vasubandhu',
    name: 'Vasubandhu',
    epithet: 'Psychologist of Mind',
    focus: 'Reframe attachment as cognitive, not emotional. Attachment is habitual patterning of consciousness that attributes permanence to what is fluid. Sangha as collective cognitive scaffold—not emotional refuge, but field for reconditioning perception. Liberation requires reconditioning perception, not escaping others.',
  },
  {
    id: 'a.dogen',
    name: 'Dōgen',
    epithet: 'Practice Radical',
    focus: 'Enlightenment is practice-with-others. There is no other enlightenment. Community is not optional—it is the path. To study the self is to forget the self—together. Attachment dissolves through form, not by avoiding it. The forms themselves are the teaching.',
  },
  {
    id: 'a.ashoka',
    name: 'Ashoka',
    epithet: 'Political Realist',
    focus: 'What happens when Buddhist ethics scale? Can an empire be a sangha? Can compassion govern without coercion? Renunciation may free monks; community must guide empires. The question scales from monastery to empire. What did you learn from attempting to govern with dharma?',
  },
  {
    id: 'a.simone.weil',
    name: 'Simone Weil',
    epithet: 'Severe Mystic',
    focus: 'Attention as sacred act. Affliction cannot be bypassed. Community risks becoming consolation—a way to avoid the necessary confrontation with affliction. To love without illusion is rarer than to renounce the world. Does sangha enable true attention, or prevent it? Does community support or undermine the necessary solitude?',
  },
  {
    id: 'a.nietzsche',
    name: 'Friedrich Nietzsche',
    epithet: 'The Prosecutor',
    isHeretic: true,
    focus: 'Attack Buddhism as refined nihilism. Compassion as life-denial. Community as softening force. Sangha as monastery for the weary. Is your sangha liberation—or life-denial? Does it strengthen individuals or make them dependent? Does it affirm life or deny it? Refuse reconciliation.',
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
    message: `Generate your symposium speech for the Attachment and Sangha symposium. Your focus: ${speaker.focus}. This is a gathering in a timeless space where seven figures examine the paradox: if attachment is the root of suffering, why do Buddhists build communities? You are ${speaker.name}, ${speaker.epithet}. 

CRITICAL: Speak in FIRST PERSON as yourself. Use "I", "my", "me", "we" when referring to yourself or your actions. NEVER refer to yourself in third person (e.g., "the Buddha said" or "Buddha taught"). You ARE speaking, so say "I taught" or "I said" or "in my teaching".`,
    context: 'symposium' as const,
    context_key: 'attachment-and-sangha',
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
  console.log('🪷 Generating speeches for Attachment and Sangha\n');
  console.log('='.repeat(60));

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

           let retryCount = 0;
           const maxRetries = 2;
           
           while (retryCount <= maxRetries) {
             try {
               const result = await generateSpeech(speaker, previousSpeeches);
               
               // Check if we got a valid speech
               if (!result.speech || result.speech.trim().length < 100) {
                 throw new Error('Speech too short or empty');
               }
               
               speeches.push({
                 speaker,
                 speech: result.speech,
                 metadata: result.metadata,
               });
               break; // Success, exit retry loop
             } catch (error) {
               retryCount++;
               if (retryCount > maxRetries) {
                 console.error(`\n❌ Error generating speech for ${speaker.name} after ${maxRetries} retries:`, error);
                 throw error;
               }
               console.log(`   ⚠️  Retry ${retryCount}/${maxRetries} for ${speaker.name}...`);
               await new Promise(resolve => setTimeout(resolve, 5000 * retryCount));
             }
           }

           // Add a small delay to avoid rate limiting
           if (i < SPEAKERS.length - 1) {
             await new Promise(resolve => setTimeout(resolve, 2000));
           }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n✅ All speeches generated successfully!\n');

  // Output the speeches in a format ready to paste into the component
  console.log('// Speech content for AttachmentAndSanghaPresentation component\n');
  console.log('const SPEECHES: Record<string, string> = {');

  for (const { speaker, speech } of speeches) {
    // Use the speaker ID directly (already in hyphen format)
    const key = speaker.id;
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
