/**
 * Test speech length generation
 */

import 'dotenv/config';

const SUPABASE_URL = process.env.PUBLIC_SUPABASE_URL || 'https://pilmscrodlitdrygabvo.supabase.co';
const SUPABASE_ANON_KEY = process.env.PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  console.error('Error: PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

async function testSpeechLength() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/ask-faculty`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      faculty_id: 'a.gautama.buddha',
      message: 'Generate your symposium speech for the Attachment and Sangha symposium. Your focus: The original paradox-holder. You built the Sangha while teaching that attachment is the root of suffering. Defend sangha as instrumental, not sentimental. Spiritual friendship is the whole of the holy life. The Sangha as a raft—useful for crossing, to be abandoned once the other shore is reached.',
      context: 'symposium',
      context_key: 'attachment-and-sangha',
      generate_speech: true,
      speech_length: 'medium',
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`\n❌ Error: ${response.status} ${response.statusText}`);
    console.error(errorText);
    return;
  }

  const data = await response.json();
  console.log(`\n📊 Full Response:\n`, JSON.stringify(data, null, 2).substring(0, 500));
  
  const wordCount = data.response ? data.response.split(/\s+/).length : 0;
  
  console.log(`\n📊 Speech Length Test Results:\n`);
  console.log(`Word count: ${wordCount} (target: 1050)`);
  console.log(`Estimated duration: ${data.metadata?.estimated_duration_minutes || 'unknown'} minutes`);
  if (data.response) {
    console.log(`\nFirst 300 chars:`);
    console.log(data.response.substring(0, 300));
    console.log(`\n...`);
    console.log(`\nLast 200 chars:`);
    console.log(data.response.substring(Math.max(0, data.response.length - 200)));
  }
  
  if (wordCount < 900) {
    console.log(`\n⚠️  Speech is too short (${wordCount} < 900 words)`);
  } else if (wordCount >= 900 && wordCount < 1200) {
    console.log(`\n✅ Speech length is acceptable (${wordCount} words)`);
  } else {
    console.log(`\n✅ Speech length is good (${wordCount} words)`);
  }
}

testSpeechLength().catch(console.error);
