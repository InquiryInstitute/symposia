/**
 * Attachment and Sangha Symposium Presentation
 * Wrapper component that configures the generic SymposiumPresentation
 */

import SymposiumPresentation, {
  type SpeakerConfig,
  type FallbackVoice,
  type SymposiumTheme,
} from './SymposiumPresentation';

const SPEAKER_CONFIG: SpeakerConfig[] = [
  { id: 'a-gautama-buddha', name: 'Gautama Buddha', epithet: 'Founder of the Sangha' },
  { id: 'a-nagarjuna', name: 'Nāgārjuna', epithet: 'Philosopher of Emptiness' },
  { id: 'a-vasubandhu', name: 'Vasubandhu', epithet: 'Psychologist of Mind' },
  { id: 'a-dogen', name: 'Dōgen', epithet: 'Practice Radical' },
  { id: 'a-ashoka', name: 'Ashoka', epithet: 'Political Realist' },
  { id: 'a-simone-weil', name: 'Simone Weil', epithet: 'Severe Mystic' },
  { id: 'a-nietzsche', name: 'Friedrich Nietzsche', epithet: 'The Prosecutor', isHeretic: true },
];

const FALLBACK_VOICES: Record<string, FallbackVoice> = {
  'a-gautama-buddha': { voice: 'en-US-DavisNeural', rate: 0.95, language: 'en-US', accent: 'Calm, measured' },
  'a-nagarjuna': { voice: 'en-US-GuyNeural', rate: 0.96, language: 'en-US', accent: 'Analytical, precise' },
  'a-vasubandhu': { voice: 'en-US-GuyNeural', rate: 0.97, language: 'en-US', accent: 'Cognitive, systematic' },
  'a-dogen': { voice: 'en-US-DavisNeural', rate: 0.94, language: 'en-US', accent: 'Direct, uncompromising' },
  'a-ashoka': { voice: 'en-US-DavisNeural', rate: 0.95, language: 'en-US', accent: 'Reflective, weighty' },
  'a-simone-weil': { voice: 'en-US-AriaNeural', rate: 0.96, language: 'en-US', accent: 'Intense, severe' },
  'a-nietzsche': { voice: 'de-DE-KatjaNeural', rate: 0.98, language: 'de-DE', accent: 'Provocative, challenging' },
};

// Placeholder speeches - these should be generated using ask-faculty edge function
// For now, using brief placeholders that can be replaced
const SPEECHES: Record<string, string> = {
  'a-gautama-buddha': `So it has come to this. I who taught that attachment is the root of suffering, who built the Sangha that has endured for two and a half millennia—I am called to account.

"Spiritual friendship is the whole of the holy life." I said this. I meant it. And yet the question remains: if attachment is suffering, why did I build a community? Why did I create structures, rules, forms that require commitment, loyalty, interdependence?

The Sangha is not a family to which one clings. It is a raft—useful for crossing the river, to be abandoned once the other shore is reached. But one does not abandon the raft in mid-river. The question is not whether sangha is attachment. The question is: what is attachment? Is it the same as relationship? Is it the same as commitment?

I built the Sangha as an instrument of liberation, not as an object of attachment. The structures, the rules, the forms—they create the conditions for practice. They are not ends in themselves, but means. Yet I also taught that spiritual friendship is the whole of the holy life. This is the paradox we must examine.`,

  'a-nagarjuna': `The question before us is a false binary: attachment versus relationship. I have spent my life dissolving such binaries. Community is empty, dependently arisen, non-ownable. Only what lacks essence can be shared without bondage.

The question is not whether sangha is attachment. The question is: what is attachment? If attachment is the misapprehension of phenomena as having inherent existence, then sangha, being empty, cannot be the object of true attachment. Yet conventionally, sangha functions. Use it skillfully, knowing its emptiness.

Emptiness and dependent origination are one. The sangha arises dependently—from causes and conditions. It has no inherent existence. It cannot be owned, possessed, or clung to in the way that substantial things can be. This very emptiness is what makes it possible to engage with sangha without creating new forms of bondage.

The false binary dissolves: sangha is neither attachment nor non-attachment. It is empty, and in that emptiness lies its utility.`,

  'a-vasubandhu': `Attachment is not primarily emotional—it is cognitive. It is the habitual patterning of consciousness that attributes permanence to what is fluid. Sangha can help recondition this patterning, not by providing comfort, but by providing a field in which consciousness can restructure itself.

The chamber is structured to support certain patterns of consciousness. The inscriptions follow cognitive patterns, the seating arrangement creates a field of awareness, the fire provides a focal point for attention. Sangha functions similarly—as a collective cognitive scaffold.

Liberation requires reconditioning perception, not escaping others. The habitual patterns that create attachment are patterns of consciousness. They can be observed, analyzed, and transformed. Sangha provides the context for this transformation—not as an emotional refuge, but as a cognitive laboratory.

The question is not whether sangha creates attachment. The question is: does sangha support the reconditioning of consciousness, or does it reinforce existing patterns?`,

  'a-dogen': `You speak of sangha as if it were optional. I say: it is not optional. It is the path.

To study the self is to forget the self. To forget the self is to be actualized by myriad things. The myriad things include the sangha. Enlightenment is practice-with-others. There is no other enlightenment.

Community is not about comfort. It is about shared form. Attachment dissolves through form, not by avoiding it. The forms themselves—bowing, chanting, sitting—are the teaching. The shared practice, the shared form, creates the conditions for the self to be forgotten.

I can show you, but you must practice to see. Community is not sentiment but necessity. The path is not found in isolation. The path is found in practice-with-others.`,

  'a-ashoka': `I have tried to govern an empire with dharma. I have built hospitals, planted trees, restricted slaughter. But I have also maintained armies, collected taxes, enforced laws.

The question before us is not just about monks in a monastery. It is about what happens when Buddhist ethics scale. Can an empire be a sangha? Can compassion govern without coercion? Renunciation may free monks; community must guide empires. But how?

I learned that the question has no easy answer. I learned that even compassionate rule requires force. I learned that sangha at the scale of empire is not the same as sangha in a monastery. The structures that work for a small community may not work for a vast empire.

The question scales. What works in a monastery may not work in an empire. But the principles remain: compassion, non-harm, the welfare of all beings. The challenge is how to embody these principles at scale.`,

  'a-simone-weil': `You speak of sangha as support for practice. I ask: support for what?

If practice is attention, then attention requires solitude. Community can become consolation—a way to avoid the necessary confrontation with affliction. Affliction cannot be bypassed. It must be attended to. And attention, taken to its highest degree, is prayer.

To love without illusion is rarer than to renounce the world. Does sangha enable this, or prevent it? Does community support attention, or does it provide a way to avoid the necessary solitude?

Attention requires solitude. The confrontation with affliction cannot be shared in a way that softens it. Community risks becoming consolation—a way to make the unbearable bearable, which is to say, a way to avoid the necessary confrontation.

The question is not whether sangha is good or bad. The question is: does it support attention, or does it provide an escape from attention?`,

  'a-nietzsche': `So. The gathering of the life-deniers.

You speak of sangha as liberation. I say: look at what you have created. A community of the weary, the weak, those who cannot bear life's harshness. You call it compassion; I call it ressentiment. You call it practice; I call it life-denial.

Is your sangha liberation—or a monastery for the weary? Does it strengthen individuals or make them dependent? Does it affirm life or deny it?

Buddhism is refined nihilism. Sangha is its most dangerous aspect because it makes life-denial seem virtuous, communal, even beautiful. You gather together to escape the world, to escape suffering, to escape life itself. You call this liberation, but I call it the will to nothingness.

The question is not whether sangha serves liberation. The question is: what kind of liberation? Liberation from life, or liberation into life? Your sangha serves the former. I serve the latter.`,
};

const THEME: SymposiumTheme = {
  primary: '#92400e', // Dark saffron/brown
  secondary: '#d97706', // Medium orange
  accent: '#fbbf24', // Gold
  background: 'linear-gradient(135deg, #1c1917 0%, #3f3f46 100%)',
  text: '#fffbeb', // Cream
};

const MATRIX_ROOM_URL = 'https://element.inquiry.institute/#/room/#attachment-and-sangha:matrix.inquiry.institute';
const MATRIX_ROOM_ALIAS = '#attachment-and-sangha:matrix.inquiry.institute';

export default function AttachmentAndSanghaPresentation() {
  return (
    <SymposiumPresentation
      speakers={SPEAKER_CONFIG}
      speeches={SPEECHES}
      fallbackVoices={FALLBACK_VOICES}
      matrixRoomUrl={MATRIX_ROOM_URL}
      matrixRoomAlias={MATRIX_ROOM_ALIAS}
      theme={THEME}
      title="Attachment and Sangha"
      subtitle="Attachment Is the Root of Suffering—So Why Do Buddhists Build Communities?"
      autoPlayDefault={true}
      showQAByDefault={false}
    />
  );
}
