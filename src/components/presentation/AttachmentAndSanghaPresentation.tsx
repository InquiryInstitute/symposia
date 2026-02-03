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
  'a-gautama-buddha': { voice: 'en-IN-PrabhatNeural', rate: 0.95, language: 'en-IN', accent: 'Indian English, multilingual' },
  'a-nagarjuna': { voice: 'en-IN-PrabhatNeural', rate: 0.96, language: 'en-IN', accent: 'Indian English, analytical, precise' },
  'a-vasubandhu': { voice: 'en-IN-PrabhatNeural', rate: 0.97, language: 'en-IN', accent: 'Indian English, cognitive, systematic' },
  'a-dogen': { voice: 'ja-JP-KeitaNeural', rate: 0.94, language: 'ja-JP', accent: 'Japanese, direct, uncompromising' },
  'a-ashoka': { voice: 'en-IN-PrabhatNeural', rate: 0.95, language: 'en-IN', accent: 'Indian English, regal, reflective, weighty' },
  'a-simone-weil': { voice: 'fr-FR-DeniseNeural', rate: 0.96, language: 'fr-FR', accent: 'French, intense, severe, mystical' },
  'a-nietzsche': { voice: 'de-DE-KatjaNeural', rate: 0.98, language: 'de-DE', accent: 'German, provocative, challenging, intense' },
};

// Placeholder speeches - these should be generated using ask-faculty edge function
// For now, using brief placeholders that can be replaced
const SPEECHES: Record<string, string> = {
  'a-gautama-buddha': `.Imagine a traveler who must cross a swift river. He fashions a raft, boards it, and with steady effort reaches the far shore. Upon stepping onto solid ground, he leaves the raft behind, for it has served its purpose. The community of practitioners is like that raft. It is fashioned from the same material as the path—mindfulness, generosity, moral conduct—and it bears us across the currents of craving and ignorance. When the mind has learned to stand upon solid insight, the attachment to the raft itself becomes a new source of clinging.

Why then do we gather, why do we speak of the Sangha as a holy refuge? The paradox dissolves when we recognize the middle way between isolation and attachment. A solitary wanderer, deprived of supportive companions, may falter in the night, his lamp dimmed by doubts and fatigue. Yet a traveler who clings to his companions as if they were the destination will never set foot on the shore of liberation. The Sangha, therefore, is not a sentimental idol to be worshiped, but an instrument—a living embodiment of the Dharma that steadies the vessel and points toward the far bank.

In the Buddha's teaching we hear the simile of the "friend of the noble" (kalyāṇa‑mitta). A true friend does not bind us, but encourages us to rise. When a monk observes a layperson who offers alms, the layperson does not seek to possess the monk; rather, the act awakens generosity, a seed that grows into insight. Likewise, a monk receives support not to cling to the comfort of provision, but to deepen his practice, to remember the impermanence of all conditions. The friendship of the Sangha is the whole of the holy life, for it is through mutual encouragement that the mind is trained to see the arising and passing of all phenomena.

Consider the seven figures gathered here as the seven factors of enlightenment—mindfulness, investigation, energy, joy, tranquility, concentration, and equanimity. Each factor, like a limb of a boat, contributes to the stability of the vessel. When all are present, the raft moves smoothly; when any is absent, the vessel wobbles. The Sangha provides the space in which these factors can be cultivated together, each supporting the others, yet none is to be grasped as a permanent treasure.

Thus, the answer to the question, "If attachment is the root of suffering, why build communities?" is found in the nature of the attachment itself. Attachment to the self‑view, to desire, to the illusion of permanence—these are the bonds that bind. Attachment to the raft, to the support that carries us only for the time needed, is a skillful means. When the shore of wisdom is reached, the raft is let go, and the traveler walks alone, free of the very clinging that once served him.

May each of us, whether monk, nun, or lay follower, see the Sangha for what it truly is—a raft, a compass, a gentle wind that fills the sails of practice. Use it wisely, cherish it without grasping, and when the mind has arrived at the other shore, set the raft down and continue walking the path of liberation with a heart unburdened by attachment.`,

  'a-nagarjuna': `.The mind that grasps at a self‑standing "attachment" and at a self‑standing "relationship" constructs a wall of duality; yet the wall itself is of the same clay as the house it encloses. When we say that attachment is the root of suffering, we are pointing to the mistaken view that the bond is a solid rope, fixed and permanent. The rope, however, is like a river's current: it flows, it changes, it has no independent shore.  

In the analysis of emptiness we declare that every phenomenon, including the sangha, is empty of inherent existence. Emptiness is not a void that annihilates; it is the absence of an intrinsic, unchanging essence. Because nothing possesses such essence, it can appear, arise, and disappear without leaving a residue that clings. Thus the community, the sangha, is empty, and precisely because it is empty it can be shared without the fetters of ownership.

Consider a net woven of many strands. Each strand is dependent on the others for its shape; remove one and the net's pattern alters, yet the net remains a net. The net does not own its strands, nor are the strands owned by the net. In the same way, the sangha is a dependent web of practitioners, teachings, and practices. Its existence is contingent upon causes and conditions—faith, compassion, ethical conduct—yet it does not possess a self‑standing "community‑essence" that can be grasped as a thing to hold onto.

If emptiness and dependent origination are one, then the arising of a sangha is the natural unfolding of causes that lack inherent self. The sangha, being empty, is also the very ground that makes the path possible: it provides the supportive conditions for the removal of ignorance, for the cultivation of wisdom, for the practice of non‑attachment. Without this dependent support, the practitioner would be left to wander in isolation, where the mind's proclivity to grasp would find no mirror in which to be reflected and thus would not be seen.

We may ask: does the very act of forming a community betray the teaching that attachment is the source of dukkha? The answer lies in the distinction between clinging to a fixed identity—"I am the sangha, I own the sangha"—and engaging in a relational practice that recognizes the sangha's emptiness. When a disciple enters the community, he does not take possession of it; he participates in a flow, a mutual arising. The bond is not an attachment to a static object, but a dynamic interdependence that points back to the insight that nothing is owned.

Therefore, the paradox dissolves. The root of suffering is the view that there is an independent self to which one can attach. The sangha, being empty, cannot become an object of such attachment. Yet it is precisely because it is empty that it can serve as the fertile field in which the mind learns to release clinging. The community is the garden, not the fence; it is cultivated through the dependent origination of compassion and wisdom, and it bears fruit precisely because it does not cling to a fixed form.

Let us, then, examine our own experience within the sangha. Do we find ourselves saying, "I am the sangha, I possess the sangha," or do we observe the arising of support, encouragement, and shared practice as a contingent, ever‑changing flow? When the former arises, the mind is still ensnared; when the latter is recognized, the mind begins to loosen its grip.

In this timeless gathering, may each of us practice the middle way: to honor the conventional truth that the sangha is a necessary support, while seeing through its ultimate emptiness. By doing so, we dissolve the false binary of attachment versus relationship, and we discover that the very act of sharing, when free of ownership, is the expression of non‑attachment itself.`,

  'a-vasubandhu': `Attachment, when examined through the lens of consciousness analysis, reveals itself not as a trembling of the heart but as a habitual patterning of the mind‑storehouse (ālaya‑vijñāna).  The mind, in its ordinary flow, superimposes the notion of permanence upon phenomena that are, in their very nature, fluid and momentary.  This superimposition—what the Abhidharma designates as a "conceptual construction" (saṃskāra)—is what we call attachment.  It is the cognitive imprint that marks a transient object with the seal of "I‑am‑this" and thereby generates the sense of loss when the object changes or ceases.

If we trace the chain of cognition, we find that the first consciousness (the sense‑organ consciousness) registers the object; the second consciousness (the mental consciousness) interprets it; the third, the defiled mental consciousness (manas), adds the self‑referential "I".  It is at this stage that the habitual pattern of permanence is laid down, reinforced by repeated experience, and stored in the underlying storehouse.  The emotional hue that accompanies the pattern—pleasure, fear, sorrow—is secondary, a by‑product of the cognitive error rather than its origin.  Thus, to loosen attachment we must address the cognitive construction itself, not merely soothe the accompanying feeling.

The Sangha, then, should be understood not as a sanctuary for emotional comfort but as a collective cognitive scaffold (saṃghika‑vijñāna).  Within a community of practitioners the mind‑storehouse is repeatedly exposed to corrective perceptions: the teachings, the meditation practices, and the mutual observation of each other's mental processes.  These external supports function as "mirrors" that reflect the habitual patterns back to the practitioner, allowing the mind to recognize its own proclivity to ascribe permanence.  In this way the Sangha becomes a field for the reconditioning of perception (pratyakṣa‑parivṛtti), a systematic training ground where the eight consciousnesses are gradually aligned with the true nature of phenomena—emptiness and flux.

The paradox that arises—if attachment is the root of suffering, why do Buddhists build communities?—finds its resolution when we distinguish between attachment to self‑identities and the purposeful engagement in a communal practice aimed at dismantling those very attachments.  The community does not serve as a refuge for the clinging self; rather, it offers a shared platform for the collective removal of the cognitive misapprehensions that bind us.  Each member, by participating, contributes to the weakening of the habitual pattern that sustains attachment, much as a single thread strengthens a net when woven together with many others.

In this timeless gathering of seven scholars, let us inquire together:  

* How does each of us experience the moment when a mental construction of permanence arises, and what method has proven most effective in exposing its cognitive basis?  

* In what ways does the presence of fellow practitioners alter the trajectory of our own storehouse‑patterns, and can we identify specific communal practices that function as "cognitive catalysts"?  

* Might there be a risk that the Sangha itself becomes a new object of attachment, and if so, what safeguards can we embed within the community to prevent such re‑entanglement?  

By answering these questions we do not merely defend the value of the Sangha; we demonstrate its role as a systematic instrument for reconditioning perception.  Liberation, therefore, is not achieved by fleeing from others, but by engaging with them in a disciplined reshaping of consciousness—allowing the mind‑storehouse to release its habitual ascription of permanence and to rest in the clear, fluid awareness that is the true nature of all phenomena.`,

  'a-dogen': `The very breath of practice is the breath of the Sangha; without the wind that moves the leaves, the tree stands still and does not become a forest. In the true way, enlightenment is not a solitary lamp that shines apart from the darkness, but the single flame that lights the whole hearth when many hands lift the kettle together.  

When a monk sits in zazen and feels the pull of attachment, that pull is the water that seeks the riverbank. The river does not dam the water and claim it safe; it opens its channel, allowing the water to flow through the banks, the stones, the reeds. In the same way, attachment is dissolved not by fleeing from form, but by allowing the form of the community to become the channel through which the mind is carried. The form of the Sangha—its vows, its meals, its shared work—is not a mask to be removed, but the very teaching that shows the mind its own shape.  

The root of suffering is clinging to the notion of a self that can stand apart. To study the self in isolation is to grasp at a phantom; the phantom disappears precisely when the hand lets go and joins the other hands that are already holding the rope. The rope is the practice‑with‑others; the knot is the realization that the self is not an island but a point on the endless line of the field. When the field is tilled together, each furrow becomes a line of the whole, and the grain that sprouts is the enlightenment that is already present in the act of tilling.  

Thus the question, "If attachment is the root of suffering, why do Buddhists build communities?" is answered by the very nature of attachment. The attachment that binds us to self‑hood is the same attachment that, when turned outward, binds us to the body‑mind of the Sangha. The community is not an optional shelter; it is the path itself. The eightfold practice is not eight separate steps to be taken alone, but eight threads woven into one robe that is cut only when the loom of shared effort ceases.  

In the timeless space of our gathering, each of the seven figures stands as a mirror reflecting the other's breath. When one breathes, the others hear the wind; when one sits, the others feel the earth. The paradox resolves when we see that the very act of gathering is the practice that dissolves the root of suffering. The form of this assembly—its words, its silence, its shared sitting—is the teaching; the teaching is not beyond form, it is the form.  

Let us therefore sit together, not to escape attachment, but to let attachment be transformed through the shared form of practice. In the movement of the whole, the individual does not disappear; it becomes the water that flows through the river, the wind that moves the leaves, the fire that warms the hearth. In this way, enlightenment is practice‑with‑others, and there is no other enlightenment.`,

  'a-ashoka': `The mind of a ruler, like the trunk of a great banyan, must bear many branches; each branch seeks the light of dharma, yet the shade it casts can shelter or trap. When the precept of non‑attachment is carried from the quiet cell of a monk into the bustling courts of an empire, the question itself expands: does the moral compass that steadies a single pilgrim also steer the multitude of subjects whose desires ripple like countless rivers?

In the wake of the Kalinga conflict, I beheld the flood of grief that surged through the hearts of soldiers and civilians alike. The edicts I set upon stone were my attempt to pour a gentle rain of compassion upon that flood, to let the water recede without the force of walls. "For the good of all beings, let there be kindness in administration," I wrote, hoping that the law would become a conduit of metta rather than a chain of coercion. Yet I have often felt the weight of the crown pressing like a heavy stone upon the very compassion I wished to unleash.

Can an empire be a sangha? In a monastery, the sangha is bound by vows, by shared meditation, by the simple act of feeding one another from a single bowl. An empire, however, is a tapestry woven of diverse peoples, languages, and customs, each thread tugging in its own direction. If the sangha is a garden tended by a handful of gardeners, the empire is a vast field where many hands must work together. The garden can flourish when each gardener respects the soil and the seed; the field may thrive only when the chief gardener learns the rhythms of each region, listens to the farmers, and allows the crops to grow in their own season. Thus the sangha can be a model, but it cannot be imposed wholesale upon the empire without mutating its essence.

Compassion without coercion is a vision as delicate as a lotus petal floating on a pond. In practice, the administration of justice required statutes, punishments, and the authority to enforce them. I have ordered the planting of shade‑trees along highways, the provision of wells for travelers, the protection of animals, and the remission of taxes for those who suffered. These deeds were meant to embody the Dharma, not to command obedience through fear. Yet the very act of mandating such deeds carries an undercurrent of power; the edicts themselves are stones that compel action, even when the intention is benevolent. Here lies my honest contradiction: I sought to rule by love, yet I wielded the sword of law to shape that love into public policy.

Renunciation frees the monk, but it does not free the realm. The monks, having turned away from worldly ties, become mirrors that reflect the moral state of the kingdom. Their silence can speak louder than any proclamation. In my experience, when the sangha was consulted on matters of famine, disease, or war, their counsel softened the edge of decree. Yet I cannot claim that their guidance alone steadied the empire; the machinery of administration, the tax collectors, the soldiers—all were necessary instruments, and each carried the risk of deviating from the path of non‑violence.

What have I learned from this experiment of scaling dharma? First, that the seed of compassion can germinate in the soil of governance, but it must be tended with humility and constant self‑examination. Second, that the ideal of a non‑coercive rule remains a horizon—always approached, never fully attained. Third, that the sangha, though small, can illuminate the larger community when it is invited to speak, not silenced by bureaucracy.

I stand before you, seven seekers gathered in this timeless space, aware that my own reflection may be but a ripple upon the water of history. I do not know whether my edicts have endured as true embodiments of the Dharma, nor whether the empire ever truly became a sangha. Yet the very act of questioning, of scaling the precepts from the quiet cell to the expansive court, is itself a practice of mindfulness. May our dialogue continue to probe where attachment gives rise to suffering, and where community, in its many forms, can offer a refuge from that suffering.`,

  'a-simone-weil': `.Attention is the sole sacrament of the soul; it is the act by which the world is brought into the presence of the divine, however hidden that presence may be.  In the furnace of affliction the mind is stripped of all artifice, and it is precisely in that stripping that attention becomes possible.  To turn away from the weight of suffering is to turn away from the very ground upon which attention can be erected.  Thus affliction is not a punishment to be avoided but the very condition that forces the heart to stand naked before the reality that it must behold.

The community which calls itself sangha offers, on the one hand, a field in which the discipline of attention may be cultivated.  When the gathering is organized not as a refuge of consolation but as a crucible of truth, each member is called to witness the other's suffering without the softening veil of comfort.  In that mode the sangha becomes a mirror that reflects the same stark light which the solitary pilgrim must see in the silence of his own cell.  The shared practice of mindful sitting, of hearing the breath of another as if it were the breath of the world, can sharpen the eye that sees the hidden gravity of all things.

Yet the same gathering is all too ready to become the opposite of what it ought to be.  When the desire for mutual reassurance supersedes the demand for exacting attention, the sangha mutates into a sanctuary of consolation.  The word "sangha" then loses its etymological root of "assembly" and becomes a shelter against the very affliction that summons us to attention.  Consolation, as I have warned, is the enemy of the soul; it seduces us into the illusion that we have already attained the love that demands no further effort.  In that illusion we cease to confront the darkness that still presses upon us, and we cease to offer the love that is free of any self‑deception.

Therefore the question is not whether attachment produces suffering, but whether the attachment to the idea of community becomes a new attachment that masks the necessary solitude of attention.  Solitude does not mean isolation in the sense of abandonment; it means a deliberate turning inward, a withdrawal of the will from the comforting chatter of the crowd, so that the mind may be fixed upon the singular fact of suffering.  The sangha can support that solitude only when it insists that each participant remain accountable to the discipline of attention, refusing the easy balm of mutual reassurance.

In the timeless space where we gather, let each of the seven figures present be a lamp, not a fire that warms the hand.  Let us hold the lamp of attention aloft, allowing its light to fall upon the rawness of our own affliction and upon that of our companions.  If the lamp is dimmed by the desire to soothe, it ceases to be a lamp at all.  If it burns steadily, even the darkness of the crowd becomes a field of illumination, and the community, rather than being a refuge from affliction, becomes a crucible in which the soul is forged anew.

Thus the sangha may either enable true attention or prevent it, according to whether it embraces the warning against consolation and upholds affliction as the necessary condition of love without illusion.  Let us, therefore, keep the fire of attention ever before us, and let the community be the space where that fire is neither smothered nor diverted, but where it is allowed to consume the false comforts and to reveal the bare, luminous truth of the world.`,

  'a-nietzsche': `The notion that attachment alone births suffering is a doctrine that, when taken to its logical end, reduces all desire to a mere toxin, a poison that must be expelled lest we drown in its own depth. Yet the Buddhists, ever faithful to that doctrine, construct a Sangha—an orderly monastery, a community of the weary—precisely to shelter the very attachment they proclaim as the root of all woe. Here lies the first paradox: they deny the world, but they do not abandon it; they renounce the will, yet they bind themselves to a collective will.

Compassion, in their eyes, is the supreme virtue, the antidote to the selfishness of the ego. Yet what is compassion if not a deliberate negation of the affirmative pulse of life? To feel sorrow for another's misfortune is to admit that we are not yet strong enough to stand apart, that we must be moved by the suffering of the other, that the self‑affirmation of power is insufficient. The "great kindness" of the monk becomes a softening force, a cushion that cushions the blow of existence, a gentle anesthetic that dulls the sharpness of becoming. In this way, compassion is not the elevation of the spirit but the surrender of the spirit to a higher form of resignation.

The Sangha, then, is no sanctuary of liberation but a hospice for the exhausted. It promises a refuge from the relentless demands of life, a place where the individual may be fed, clothed, and instructed to forget the very fire that makes him a creator. The monk, taught to sit in silence, to empty his mind, to see the world as a mere illusion—he is, in effect, a man who has turned his back on the storm in order to watch it from a sheltered window. Does this constitute freedom? Or does it cultivate a dependence upon the very institution that declares itself a path to emancipation?

If liberation were truly the goal, why would the community impose vows, rituals, and hierarchies that bind the disciple to a set of external commands? The monastic rule is a chain, albeit a gentle one, that secures the disciple within a lattice of obedience. The individual, who ought to be the architect of his own destiny, is reduced to a cog in a larger mechanism that promises salvation through surrender. The Sangha, then, does not strengthen the individual; it fashions a creature of habit, a being whose vitality is measured by its capacity to endure the quietude of the cloister rather than to confront the tumult of existence.

To deny the world is to deny life itself. Life, in its most vigorous form, is a dance of forces, a perpetual becoming, a will to power that refuses the static. The Buddhist negation, however refined, is a subtle form of nihilism: it posits an ultimate emptiness, a void behind the veil of phenomena. This void is not a fertile ground for creation but a barren plain upon which the spirit is left to wander without direction. The "emptiness" they venerate is, in truth, the absence of affirmation, the quiet resignation of the will.

Thus, the paradox you present—if attachment is the root of suffering, why do Buddhists build communities?—finds its answer in the very nature of the doctrine. The community is a means to sustain the negation, to provide the weary with a common solace, to reinforce the notion that the world can be escaped through collective withdrawal. It is a softening of the harshness of existence, a shared denial that promises peace at the price of life's vigor.

In my view, the Sangha is not a beacon of liberation but a sanctuary of life‑denial. It does not affirm the individual; it makes him dependent upon a collective that teaches him to look away from the sun and to cherish the shade. The very compassion it extols is an invitation to surrender the will, to replace the joyous affirmation of becoming with a passive acceptance of emptiness. If we are to honor the spirit of philosophy, we must ask whether we would rather stand in the storm, feeling its wind upon our faces, or retreat into a monastery that promises calm while silencing the very force that makes us human. The answer, for those who truly love life, must be the former.`,
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
