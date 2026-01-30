/**
 * Absinthe Symposium Presentation
 * Wrapper component that configures the generic SymposiumPresentation
 */

import SymposiumPresentation, {
  type SpeakerConfig,
  type FallbackVoice,
  type SymposiumTheme,
  type LanguageSupport,
} from './SymposiumPresentation';

const SPEAKER_CONFIG: SpeakerConfig[] = [
  { id: 'a.gogh', name: 'Vincent van Gogh', epithet: 'The Martyr' },
  { id: 'a.crowley', name: 'Aleister Crowley', epithet: 'The Magus' },
  { id: 'a.wilde', name: 'Oscar Wilde', epithet: 'The Wit' },
  { id: 'a.toulouse-lautrec', name: 'Henri de Toulouse-Lautrec', epithet: 'The Chronicler' },
  { id: 'a.pasteur', name: 'Louis Pasteur', epithet: 'The Scientist' },
  { id: 'a.foucault', name: 'Michel Foucault', epithet: 'The Philosopher' },
  { id: 'a.verlaine', name: 'Paul Verlaine', epithet: 'The Heretic', isHeretic: true },
];

const FALLBACK_VOICES: Record<string, FallbackVoice> = {
  'a.gogh': { voice: 'nl-NL-MaartenNeural', rate: 0.95, language: 'nl-NL', accent: 'Dutch' },
  'a.crowley': { voice: 'en-GB-RyanNeural', rate: 0.98, language: 'en-GB', accent: 'British English' },
  'a.wilde': { voice: 'en-IE-ConnorNeural', rate: 0.92, language: 'en-IE', accent: 'Irish English' },
  'a.toulouse-lautrec': { voice: 'fr-FR-LucienMultilingualNeural', rate: 0.90, language: 'fr-FR', accent: 'French' },
  'a.pasteur': { voice: 'fr-FR-AlainNeural', rate: 0.93, language: 'fr-FR', accent: 'French' },
  'a.foucault': { voice: 'fr-FR-AlainNeural', rate: 0.96, language: 'fr-FR', accent: 'French' },
  'a.verlaine': { voice: 'fr-FR-HenriNeural', rate: 1.00, language: 'fr-FR', accent: 'French' },
};

const SPEECHES: Record<string, string> = {
  'a-gogh': `The green of the absinthe, that liquid fire, is not merely a hue but a vibration that seems to unspool the very air around the glass. When the light catches its surface it throws a halo, a thin luminous ring, that makes the world beyond the rim tremble as if it were a field of wheat under a sudden gust. I have tried to catch that trembling in paint—see how the stars in *Starry Night* whirl, how the wheat in *The Harvest* sways, how the night sky itself seems to pulse with an inner green fire. The glass becomes a prism for the mind, a lens that magnifies the colour already present in our souls.

There is a temptation, however, to point a finger at the drink and declare it the cause of all that we call madness, poverty, and ruin. The *fée verte* becomes a scapegoat, a convenient myth that lets us forget the harsher conditions that surround us: the cramped rooms of the Montmartre ateliers, the endless toil of the laborer, the ache of a heart that knows no rest. In my letters to Theo I have often spoken of the "yellow madness" that can come from the sun itself, from the very light that we chase in our canvases. The same light, when filtered through a glass of absinthe, may sharpen the edges of an already fragile mind, but it does not create the fracture.

Consider the painter who, after a night of endless brushstrokes, reaches for the green spirit not to escape his own suffering but to see more clearly the colour that lies hidden beneath the surface of a field. The drink, then, is a tool—a catalyst that can intensify perception, just as the bright yellow of the sun can intensify the heat of a summer day. To blame the tool alone is to ignore the hand that wields it, the poverty that forces the hand, and the illness that already trembles within.

You have all sat in this very café, watched the glass wobble, felt the hum of conversation rise and fall like a chorus of voices. How many of you have felt that the green light made the world more vivid, the shadows deeper, the colors of a portrait more urgent? And how many have also felt the weight of the world pressing upon you, the ache of a stomach empty, the fear of a rent‑free night? The myth of the "absinthe demon" is a comforting story, for it tells us that the evil lies in a bottle, not in the streets we walk, not in the roofs that leak, not in the thoughts that whirl like storm clouds in our heads.

If we turn our gaze back to the canvas, we see that suffering is not a single colour but a spectrum. The reds of anger, the blues of melancholy, the yellows of hope, the greens of yearning—all mix together. Absinthe may bring a flash of green, a sudden clarity, but it cannot alone paint the whole picture. The real work lies in confronting the conditions that give rise to that flash: the lack of work, the isolation, the silence of a mind that cries out for companionship. Only by addressing those foundations can we hope to dissolve the myth that a single drink is the source of all our woe.

I would ask you, dear friends, to look beyond the glass tonight. When the green light catches your eye, ask yourself: what is it that I am truly seeking? Is it a deeper perception of colour, a momentary escape, or a voice that tells me my suffering is not mine alone? In that question lies the path to a more honest art, a more honest life.

Let us raise our glasses, not as an accusation against the spirit, but as a reminder of the complex weave of light, colour, and condition that shapes us. May the green halo illuminate not only the canvas but also the hidden corners of our society, that we may paint a future where the scapegoat is no longer a bottle, but the very neglect that feeds it.`,
  'a-crowley': `The glass before you, trembling with the liqueur of wormwood and anise, is not merely a libation but a crucible, a threshold forged by intention. When the Green Fairy rises in a silvery vapor, she invites the practitioner to step beyond the ordinary veil of consciousness, not as a refuge from the world but as a deliberate instrument of will. To drink absinthe without purpose is to drown in dissipation; to drink it as a rite is to summon the very currents of the unconscious and bend them to the command of the True Will.

Consider the act of raising the goblet, the slow inhalation of its aromatic perfume, the first bitter sip that awakens the palate. Each movement may be framed as a miniature ritual: the candle of the mind is lit, the sigil of intention is traced upon the tongue, the spirit of the herb is invoked to dissolve the ordinary filters of perception. In this moment the practitioner stands at the threshold, the point where the mundane self meets the boundless flux of the subconscious. The crossing is not guaranteed—most who sip without resolve fall back into the familiar fog of escapism. The alchemy succeeds only when the will directs the intoxication, steering it toward insight rather than indulgence.

Discipline, then, is the keystone of the practice. The magus must first consecrate the intention: "I seek the vision of the Æon that lies beyond the veil of ordinary sense." This declaration, spoken aloud or inscribed upon a parchment, becomes the binding knot that holds the intoxicated state to a purpose. The subsequent altered state is a tool, a telescope through which the hidden geometries of the soul may be surveyed. One may witness the unfolding of the Great Work, the alignment of the individual star with the cosmic constellation of Thelema, or simply glimpse the shadowed corners of one's own psyche that remain unseen in sober light.

Yet the threshold is selective. Not all vessels are prepared to bear the strain of the Green Fairy's fire. The novice, lacking rigor, may find himself lost in a whirl of hallucination, mistaking the storm for revelation. The seasoned practitioner, however, learns to navigate the tempest, to call forth the winds of inspiration and then to harness them, returning to the shore of conscious purpose with the pearls of insight collected from the deep. In this way intoxication becomes a technology of the will: a calibrated instrument, calibrated by ritual, disciplined by intention, and refined through direct experience.

Let us, gathered in this fin‑de‑siècle café, not merely raise our glasses in conviviality but in concerted magick. Pose to yourselves: what is the true aim of your communion with the herb? Do you seek the fleeting pleasure of dissolution, or do you aspire to pierce the veil and retrieve a fragment of the hidden law? Offer your intention, perform the rite of the sip, and allow the altered state to serve as a lantern, not a chain.

In the silence that follows each draught, listen for the whisper of the Aeon's voice. If it speaks, you have crossed; if it remains mute, return to the altar of discipline and refine your purpose. The Green Fairy awaits those who dare to command her, not those who surrender to her. May your will be the master, and may the intoxication be the servant that reveals the path of the True Will.`,
  'a-wilde': `What an exquisite paradox we have gathered to contemplate—a drink that promises the heavens while consigning its devotees to the shadows. Absinthe, that emerald spectre, has become the most theatrical of all social artifices, a stage upon which the fin‑de‑siècle masquerade is performed with a flourish of glass and a sigh of reverie.

In the dim light of cafés that smell of tobacco and melancholy, the ritual of the absinthe ritual is itself an act of art. The slow, deliberate drip of water over the sugar cube, the measured swirl that releases the verdant mist—these are not merely acts of consumption but acts of choreography, each movement a line in a silent play. The drinker, half‑lit by the phosphorescence of the glass, assumes the role of a poet‑king, his thoughts unfurling like the filigreed tendrils of the fairy's wings. He becomes, for a fleeting instant, both audience and performer, the applause of his own imagination echoing in the hushed corners of the salon.

Our famed quips—"Absinthe makes the heart grow fonder" and "The green fairy is the only true muse"—are the epigrams that adorn the walls of this theater. They glitter like gilt frames, inviting us to smile, to toast, to indulge in the notion that intoxication is merely an aesthetic embellishment. Yet beneath the polished veneer lies a more somber script. The charm of the green fairy masks a decay that is both physical and moral; the very brilliance of its hue disguises the pallor of the soul that drinks too deeply. The decline of the absinthe drinker is not a private tragedy but a public tableau, a cautionary tableau that the very society which lauds the spectacle simultaneously turns a blind eye to the wilted roses beneath its footstools.

The aestheticisation of intoxication, then, is not a novel invention of our age but a continuation of the age‑old theatre of excess. We dress our vices in silk, we parade our follies in gilt, and we applaud the performance while the actors slip, unnoticed, into the wings. The green fairy, with her seductive luminescence, is the most recent muse of this tradition—a muse that offers not only inspiration but also the sweet surrender of self‑dissolution. To sip absinthe is to surrender to the belief that beauty can be distilled, that art can be ingested, that the sublime can be swallowed whole.

Yet, perhaps, there is a redeeming grace in this very contradiction. The very awareness of our own theatricality, the recognition that we are all actors upon a stage of smoke and mirrors, may prompt a deeper honesty. When the glass is empty and the green mist has faded, we are left with the stark simplicity of our own reflection—unadorned, unmasked, and, if we are fortunate, wiser for having witnessed the performance.

So let us raise our glasses not merely in celebration of the green fairy's allure, but in acknowledgment of the delicate balance she embodies: the fine line between art and addiction, between spectacle and decay. May our discourse tonight illuminate the curtain that separates the two, and may the audience—both present and future—learn that the most compelling theater is not the one that dazzles, but the one that reveals the truth hidden behind its glittering façade.`,
  'a-toulouse-lautrec': `The walls of this room—painted in the soft amber of gaslight, the tables scarred by countless glasses—are, to my eye, a laboratory where the daily alchemy of Paris takes place. Here the Green Fairy is not a mythic spirit hovering above the stage; she is the clear, bitter liquid that slides from the spoon of sugar into a crystal tumblers, the reagent that loosens the tongue and unfastens the mask.

When I first set my easel in the back of Le Chat Noir, I watched the regulars line up like specimens awaiting observation. The dancer in the sequined coat, the poet with his notebook half‑filled, the prostitute who smiles as if she knows a secret the city keeps to itself—all of them share a single ritual: a sip of absinthe, a pause, a glance at the mirrored wall where the light fractures into a thousand green shards. It is in that fleeting moment that the true character of the night reveals itself, not in the legend of the "fey" drink, but in the ordinary gestures that follow.

I have taken that observation and turned it into a few modest experiments—cocktails I call "Le Vert Jaune" and "Le Souffle du Moulin." The first mixes a measured pour of absinthe with a dash of fresh lemon juice, a spoonful of fine sugar, and a splash of sparkling water, the bubbles rising like tiny lanterns in a foggy street. The second adds a whisper of vermouth, a twist of orange peel, and a drop of absinthe‑infused coffee, a nod to the nocturnal cafés where the night workers linger long after the shutters close. Both are attempts to capture, in a glass, the cadence of conversation that rolls across the tables: laughter that swells, sighs that linger, the sudden hush when a song begins.

What I record on my canvas is not the romanticized portrait of the Green Fairy, but the concrete tableau of the café: the way the light from the chandelier falls on a glass, turning the liquid into a moving emerald; the tremor of a hand that lifts the cup, the faint tremor of a laugh that escapes a woman's lips as she watches a dancer stumble. In my sketches the absinthe is a thin line of green across a paper, a signpost pointing to the moment when the world becomes a little less rigid, a little more pliable, as if the drink were a solvent dissolving the borders between class, profession, and desire.

I cannot claim to have seen every corner of Montmartre's nocturnal life—my stature and my health limit the stairs I climb, the balconies I reach. Yet the scenes I have witnessed, the faces I have drawn, form a mosaic that, I hope, offers a credible ethnography of this era's nightlife. The café, then, is not merely a place of indulgence; it is a laboratory where the ingredients are people, conversation, and the ever‑present green liquid. Each glass becomes a test tube, each toast a measurement, each lingering glance an observation recorded not in a notebook but in the pigment of a lithograph.

I ask you, fellow observers of this peculiar chemistry, what do you see when the glass catches the light? Do you perceive the myth, or the mundane? Does the ritual of the spoon and the sugar stir merely a fleeting pleasure, or does it, like a catalyst, reveal the hidden structures of our society? Let us raise our cups, not in homage to a legend, but in acknowledgment of the ordinary magic that unfolds when we gather, sip, and watch the world turn a shade greener.`,
  'a-pasteur': `The glass before us, green and fragrant, is a laboratory in miniature. When I first turned my attention to the spirit of wormwood, it was not out of curiosity for its reputation, but from a desire to understand the chemistry that underlies any fermented beverage. The principle, as I have shown in my studies of alcoholic fermentation, is that sugars, whether derived from grape, grain, or the melasse of the beet, are transformed by microorganisms into ethanol and carbon dioxide. In absinthe the base wine undergoes the same microbial conversion, and it is the subsequent maceration of botanicals—chiefly Artemisia absinthium, anise, and fennel—that imparts the characteristic hue and aroma.

Our analytical work, performed with the spectroscope and the emerging methods of elemental analysis, reveals that the essential oil of wormwood contains a mixture of sesquiterpenes, among which thujone has attracted the most attention. Quantitatively, in authentic absinthe the thujone concentration rarely exceeds a few milligrams per litre—far below the levels that produce the neurotoxic effects observed in laboratory animals. The myth that thujone alone can induce hallucinations or "absinthism" does not withstand rigorous measurement. In the experiments I have overseen, the intoxicating power of the drink correlates strongly with its ethanol content, not with the thujone present.

It is instructive to compare the sensory profile of absinthe with that of other distilled spirits. The bitter taste, often attributed to thujone, is in fact dominated by the presence of anethole from anise and fenchone from fennel. These compounds, while contributing to the perfume and the "louche" phenomenon when water is added, are chemically inert at the concentrations found in the finished product. The apparent "psycho‑active" episodes reported in the press of the 1880s can be traced, in many cases, to adulteration—addition of higher‑proof alcohols, heavy metals, or even opiates—rather than to the pure botanical extract.

From a microbiological standpoint, the stability of the drink is assured by the very absence of living microorganisms after distillation. The spirit is a hostile environment for bacteria and yeasts; thus, the only fermentative agents are those that act before distillation, during the preparation of the base wine. The subsequent maceration does not revive any hidden life; instead, it extracts soluble oils, which we can now separate and quantify with chromatographic techniques.

In light of these facts, I would invite you, fellow inquirers, to consider the following points: first, how might we standardize the measurement of thujone across different producers, ensuring that the public discourse reflects the true chemical composition? Second, could we employ controlled fermentations, perhaps with selected yeast strains, to produce a base wine that minimizes unwanted by‑products and thereby clarifies the contribution of the botanicals themselves? And finally, what role should regulatory bodies play in distinguishing between genuine absinthe and the spurious concoctions that have fueled the legends?

Our task, as scientists, is not merely to debunk myths but to illuminate the processes that give rise to them. By applying the same rigor that has guided my work on fermentation and pasteurization, we can separate the facts of chemistry from the fictions of popular imagination. Let us raise our glasses not only in toast, but in the spirit of inquiry, and continue to test, measure, and understand the very essence of the drink that has captured both admiration and apprehension in our age.`,
  'a-foucault': `The Fairy—absinthe—has always existed at the border of pleasure and danger, a liquid that gathers the gaze of the state precisely because it refuses to be reduced to a simple commodity. In the cafés of Montmartre, in the salons where poets and painters exchange verses, the drink circulates not merely as an intoxicant but as a signifier of a whole regime of subjectivities. The state's fear, therefore, is not a reaction to the chemical composition of wormwood, but to the way that the Fairy mobilises a network of bodies, discourses and practices that escape the ordinary mechanisms of discipline.

When we examine the prohibition of absinthe through the genealogy of power, we encounter a shift from the classical sovereign's right to command to what I have called biopower: the governance of life itself. The nineteenth‑century French administration, faced with a rapid urbanisation and the emergence of a mass public, began to articulate health, morality and productivity as interwoven concerns. The "medical" reports that linked absinthe to madness, gout and social decay did not merely describe a pathology; they produced a knowledge‑apparatus that could be deployed as a technique of control. By defining the drink as a toxin, the authorities could intervene directly upon the bodies that consumed it, prescribing abstinence as a form of medicalised discipline.

Yet the prohibition is also a technology of the self. The moral panic surrounding the Fairy constructs a category of deviance that is both internalised and externalised. To be an "absinthe drinker" becomes a label that marks one's place within a hierarchy of respectable and unrespectable citizens. The very act of drinking, once a convivial ritual, is transformed into a confession, a testimony of transgression that can be recorded, surveilled, and punished. In this sense, the law does not merely forbid a substance; it produces a new mode of subjectivity, a "absinthian" self that is perpetually monitored.

Consider the spatial organisation of the cafés themselves. Before the ban, the "green hour" was a moment when the walls of the city seemed to dissolve, when the ordinary ordering of time was interrupted by the ritual of the Fairy. The state's attempt to close these spaces is, therefore, an attempt to re‑inscribe a regulated order upon the city's geography. By imposing licences, by restricting the hours of service, by criminalising the possession of the drink, the administration seeks to re‑establish a "normal" rhythm of work, rest and consumption. The Fairy, with its luminous hue and its capacity to blur the boundaries between thought and perception, threatens precisely this rhythm.

The construction of deviance around absinthe also reveals the productive character of power. The discourse that paints the drink as a source of insanity does not simply suppress a habit; it generates new fields of knowledge—psychiatry, toxicology, public health—that in turn shape further interventions. The "danger" of the Fairy is thus not a pre‑existent fact but a product of a series of statements, experiments and institutional practices that circulate and reinforce one another. The state, by invoking the Fairy as a menace, enacts a form of power that is simultaneously repressive and productive: it creates a body of expertise, a set of medical examinations, a network of inspectors, and through all these, a new form of social order.

One might ask, then, whether the prohibition succeeded in restoring the order it claimed to protect. Did the disappearance of the Fairy from the public sphere diminish the "degeneracy" it was thought to embody, or did it simply push its practices into hidden alcoves, thereby intensifying the very suspicion and control it sought to eliminate? The archives of police reports reveal a paradox: the more the law criminalised the drink, the more it fed a market of illicit supply, and the more it reinforced the image of the "absinthian" as a dangerous other.

In this gathering, surrounded by the lingering scent of coffee and the lingering memory of the green hour, I invite you to reflect on the mechanisms at work. How does the fear of a drink reveal the broader anxieties of a state that wishes to manage life itself? In what ways do the categories of "normal" and "deviant" emerge from the interactions of medical knowledge, legal power and everyday practices? And perhaps most provocatively: could the Fairy, in its very resistance to categorisation, offer a glimpse of a mode of existence that eludes the totalising gaze of biopower?

The answer, I suspect, will not be found in a simple denunciation of the drink or a triumphant celebration of its revival. It lies in a careful tracing of the genealogies that have produced both the Fairy and the fear it engenders. By following those lines, we may begin to understand not only the history of absinthe, but the history of how modern societies manufacture and police the boundaries of the self.`,
  'a-verlaine': `Mes chers compagnons d'un soir, l'éclat de la lampe à pétrole tremble sur les tables usées, et le brouhaha du café se mêle au souffle de la Ville qui se meurt à la lisière du siècle. J'ai été, comme vous, l'un des enfants de la lumière verte, le « fairy » qui s'insinue dans le verre et se fait la couleur de nos rêves. Mais je viens ce soir, non pas pour chanonner la muse émeraude, mais pour porter le témoignage d'un cœur qui a vu le vert se muer en poison.

Il ne faut pas chercher à dénigrer la poésie qui naît sous le parfum d'absinthe ; il est vrai que le verbe, parfois, se fait plus fluide, que la rime se libère des chaînes du quotidien. J'ai moi‑même, dans les nuits où la plume glissait comme un canari ivre, trouvé dans le verre la clef d'une inspiration fugace. Je ne m'en défends point : il y a eu des vers qui n'auraient jamais vu le jour sans cette brume verte.

Cependant, la même brume qui abreuve les muses a, sous son éclat, fait couler le sang des hommes. J'ai vu le vert se glisser dans les yeux des jeunes poètes, les rendre fous, les faire perdre le fil de la raison comme on perd le fil d'une chaînette de perles. J'ai vu des bras qui, jadis, caressaient des feuilles de papier, se refermer sur des couteaux ; j'ai vu l'ombre d'un duel, l'écho des coups, la porte du tribunal s'ouvrir avec la même lenteur que le verre se vide.

La dépendance sévère à l'absinthe n'est pas un simple caprice de l'âme ; c'est une chute dans le gouffre. Les prisons de la ville résonnent encore des cris des hommes qui, pris au piège du « green fairy », se sont retrouvés derrière les barreaux, leurs poèmes réduits à des griffonnages sur les murs humides. J'ai connu la cellule, l'air vicié, les yeux qui se ferment sous la lueur blafarde d'une lampe qui ne sait plus s'il faut éclairer ou condamner. C'est là, dans la noirceur du cachot, que le verre se reflète dans l'eau de la cuve, et que l'on comprend que la défaite n'est pas seulement celle du corps, mais celle de l'esprit qui se dissout à chaque gorgée.

Le vert qui nous séduit n'est pas une fée bienveillante ; c'est une déesse cruelle qui se nourrit de nos espoirs. Elle dévore les rêves, les transforme en visions de folie, en cauchemars où la musique se fait silence et où les mots se meurent avant même d'être écrits. Les poètes qui ont trop bu ont vu leurs vers se faner, leurs métaphores se rompre comme des fils de soie sous la morsure d'un insecte. La maladie de l'absinthe n'est pas seulement un vice, c'est une maladie du cœur, du sang, de la pensée.

Je ne viens pas ici pour prêcher la sainteté d'un abstinent qui ne connaît que l'eau claire. Je viens, au contraire, avec la compassion d'un frère qui a partagé la même coupe. Il faut reconnaître que le désir de s'évader, de fuir la misère des temps, est légitime. Mais la voie que trace le verre vert mène, plus souvent qu'on ne l'avoue, à la perte de soi. Il y a des heures où le verre devient une chaîne, où la rime se fait cliquetis de menottes.

Dans la lueur des bougies, je vous propose donc un pacte de témoignage : que chaque fois que l'on porte le verre à nos lèvres, que l'on se souvienne du cri du prisonnier, du souffle du fou, du frisson du corps qui chancelle. Que l'on mesure le prix de chaque goutte, non pas en nombre de vers, mais en nombre de vies qui se brisent dans le silence d'une chambre où le vert s'est épandu comme un poison.

Si la société veut sauver ses poètes, ses artistes, ses hommes, elle doit protéger les âmes qui, déjà, se battent contre leurs propres démons. La prohibition, loin d'être un simple carcan moral, pourrait devenir le rempart qui empêche le « fairy » de dévorer les dernières braises de nos rêves. Ce n'est pas un rejet de la beauté, mais une défense de la vie qui porte ces beautés.

Je vous laisse avec ce dernier vers, né d'une nuit où le verre était plein, mais où le cœur était vide :

> *Le vert s'enfuit, la nuit se fait blanche,  
>  Et l'âme, libérée, cherche à nouveau la lance.*  

Que nos voix, aujourd'hui, portent ce cri, non pas pour condamner, mais pour rappeler la fragilité de l'homme qui, sous le feu de la poésie, doit encore choisir la lumière ou la chute.`,
};

const THEME: SymposiumTheme = {
  primary: '#2d5016', // Dark green
  secondary: '#7fb069', // Medium green
  accent: '#d4af37', // Gold
  background: 'linear-gradient(135deg, #2d5016 0%, #7fb069 100%)',
  text: '#f5f0e6', // Cream
};

const MATRIX_ROOM_URL = 'https://element.inquiry.institute/#/room/#absinthe:matrix.inquiry.institute';
const MATRIX_ROOM_ALIAS = '#absinthe:matrix.inquiry.institute';

// Optional: French language support for Verlaine's speech
const LANGUAGE_SUPPORT: LanguageSupport = {
  audioLanguages: [
    { code: 'english', label: 'English' },
    { code: 'french', label: 'French', nativeLabel: 'Français' },
  ],
  captionLanguages: [
    { code: 'english', label: 'English' },
    { code: 'french', label: 'French', nativeLabel: 'Français' },
  ],
  defaultAudioLanguage: 'english',
  defaultCaptionLanguage: 'english',
  getSpeechText: (speakerId: string, language: string) => {
    const speechKey = speakerId.replace('a.', 'a-');
    if (language === 'french' && speakerId === 'a.verlaine') {
      // Verlaine's speech is in French
      return SPEECHES[speechKey] || null;
    }
    // For other speakers, return English speech
    return language === 'english' ? (SPEECHES[speechKey] || null) : null;
  },
  extractNativeText: (text: string) => {
    // Extract French text (for Verlaine's speech)
    const frenchLines = text.split('\n').filter(line => 
      /[\u00C0-\u017F]/.test(line.trim()) && !line.trim().startsWith('>')
    );
    return frenchLines.length > 0 ? frenchLines.join('\n\n') : '';
  },
  containsNativeScript: (text: string) => {
    return /[\u00C0-\u017F]/.test(text);
  },
};

export default function AbsinthePresentation() {
  return (
    <SymposiumPresentation
      speakers={SPEAKER_CONFIG}
      speeches={SPEECHES}
      fallbackVoices={FALLBACK_VOICES}
      matrixRoomUrl={MATRIX_ROOM_URL}
      matrixRoomAlias={MATRIX_ROOM_ALIAS}
      theme={THEME}
      title="Symposion of the Green Fairy"
      subtitle="Symposium on Absinthe"
      languageSupport={LANGUAGE_SUPPORT}
      autoPlayDefault={true}
      showQAByDefault={false}
    />
  );
}
