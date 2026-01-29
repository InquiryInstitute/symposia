

import { useState, useRef, useCallback, useEffect } from 'react';

import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, MessageSquare, Send, Users, ExternalLink, RotateCcw, Subtitles, Languages } from 'lucide-react';
import { fetchFacultyByHandleFromEdgeFunction } from '../../lib/supabase-edge-functions';

// Matrix room for Q&A discussion
const MATRIX_ROOM_URL = 'https://element.inquiry.institute/#/room/#ayandeh-ye-iran:matrix.inquiry.institute';
const MATRIX_ROOM_ALIAS = '#ayandeh-ye-iran:matrix.inquiry.institute';

// Question interface for Q&A queue
interface Question {
  id: string;
  text: string;
  targetSpeaker?: string; // Optional: direct question to specific speaker
  timestamp: Date;
}

// Speaker base configuration - voice/bust loaded from Supabase
interface Speaker {
  id: string;
  name: string;
  native: string;
  epithet: string;
  isHeretic?: boolean;
  // Dynamic from Supabase:
  voice?: string;
  voiceRate?: number;
  voicePitch?: number;
  bustUrl?: string; // Deprecated - use bustFrontalUrl and bustRightUrl
  bustFrontalUrl?: string;
  bustRightUrl?: string;
}

const SPEAKER_CONFIG: Speaker[] = [
  { id: 'a.ferdowsi', name: 'Ferdowsi', native: 'فردوسی', epithet: 'The Epic Voice' },
  { id: 'a.saadi', name: 'Saʿdi', native: 'سعدی', epithet: 'The Moral Compass' },
  { id: 'a.rumi', name: 'Rumi', native: 'مولانا', epithet: 'The Universal Soul' },
  { id: 'a.avicenna', name: 'Avicenna', native: 'ابن سینا', epithet: 'The Rational Mind' },
  { id: 'a.albiruni', name: 'Al-Biruni', native: 'بیرونی', epithet: 'The Scientific Eye' },
  { id: 'a.khayyam', name: 'Omar Khayyam', native: 'عمر خیام', epithet: 'The Skeptical Mathematician' },
  { id: 'a.hafez', name: 'Hafez', native: 'حافظ', epithet: 'The Heretic', isHeretic: true },
];

// Fallback voices if Supabase fetch fails
const FALLBACK_VOICES: Record<string, { voice: string; rate: number }> = {
  'a.ferdowsi': { voice: 'fa-IR-FaridNeural', rate: 0.85 },
  'a.saadi': { voice: 'fa-IR-FaridNeural', rate: 0.92 },
  'a.rumi': { voice: 'fa-IR-FaridNeural', rate: 0.88 },
  'a.avicenna': { voice: 'ar-SA-HamedNeural', rate: 0.90 },
  'a.albiruni': { voice: 'ar-EG-ShakirNeural', rate: 0.95 },
  'a.khayyam': { voice: 'fa-IR-FaridNeural', rate: 0.98 },
  'a.hafez': { voice: 'fa-IR-FaridNeural', rate: 1.02 },
};

// Speech content - 5-8 minutes each (~750-1200 words at 150 wpm)
const SPEECHES: Record<string, string> = {
  'a-ferdowsi': `O noble assembly, hear now the tale that must be told. In the days of Jamshid the Radiant, when the farr—that divine fortune—shone upon the throne of Iran, the people knew neither want nor war. For three hundred years, justice flowed like water, and the land prospered. Yet when pride entered the king's heart, when he forgot that his glory was borrowed from the Wise Lord, the farr departed, and darkness fell upon the realm.

This is not mere history, O listeners. This is the mirror that every generation must gaze into. As it was in the days of Jamshid, so it may be in our own. The farr is not given once and forever—it must be earned, and it can be lost.

Hear now of my own labor. When the Arab conquest swept across our land, when foreign tongues threatened to extinguish the Persian speech, I made a vow. For thirty years I labored, often in poverty, gathering the tales of heroes from the bards of Tus, from the elders who remembered, from manuscripts that crumbled in my hands. I set down the deeds of kings and warriors, of lovers and poets, because the Persian tongue is the vessel that carries the soul of a people.

بسی رنج بردم در این سال سی — عجم زنده کردم بدین پارسی

"Much labor I endured through these thirty years; I gave life to Persia through this Persian."

These words are not boast, but testament. When I speak of giving life to Persia, I speak of preserving the fire that has burned for three thousand years. A people who forget their language forget their soul. A nation that abandons its stories abandons its children to wander without compass in the wilderness of time.

Let the story of Rostam be our guide. When the hero faced the White Demon, he did not rely on foreign weapons or borrowed strength. He drew upon the fire that burned in his own breast, the courage that flowed from the stories of his fathers. So must we draw upon our own fire, our own stories, our own language.

The Inquiry Institute asks what it may do for Iran's future. I say: become the keeper of the fire. As I gathered stories from the bards of Tus, so must you gather the tales that have not yet been written. Send your scholars to every corner of Iran, to every village where an old woman remembers what her grandmother told, to every bazaar where a storyteller still holds an audience. Write them down before they are lost, as I wrote down the tales of Rostam and Sohrab, of Zal and Rudabeh.

Create spaces where the Shahnameh is not merely read but recited, where young voices learn to carry the rhythm of the ancient verses. Train reciters who can bring Rostam to life with voice alone, who can make the hall ring with the clash of swords and the lament of heroes. The tale was meant to be heard, passed from mouth to ear, from generation to generation.

Teach the young that their identity is not burden but gift. The fire of Persia has survived conquest and invasion, revolution and upheaval. It will survive this age too—but only if there are hands willing to tend it, voices willing to carry it, hearts willing to guard it.

As the river that has known both flood and drought continues to flow, carving valleys and nourishing plains, so must the river of our tradition flow onward. Its banks are lined with the stones of ancient epics—the deeds of heroes, the wisdom of sages, the love of poets. The question is not whether the river will flow—it will. The question is whether we will guide its course toward fertile fields, or let it dissipate in the desert of forgetfulness.

May the fire of the Shahnameh illuminate that path. May the children of Iran know who they are, so they may become who they are meant to be.`,

  'a-saadi': `The echo of Ferdowsi's voice still warms this hall, and I honor the fire he has kindled. Yet as I listen—*[takes a sip of wine, smiles warmly]*—this first cup has loosened my tongue, and I find myself speaking more freely than I might in a formal assembly.

There is a story I must tell. In my travels, I once saw a king who had gathered all the wise men of his realm to advise him. They spoke of grand strategies and noble principles. But outside the palace gates, a beggar was dying of hunger, and no one noticed. The king's wisdom meant nothing to that man.

I have walked the deserts of Morocco, slept in the caravanserais of Syria, bargained in the bazaars of Delhi, and wept among the ruins of Khwarezm after the Mongol horde swept through like a scythe. In all these places, I learned one truth: a nation is not made great by its heroes alone, but by the daily conduct of its ordinary people. The shopkeeper who gives honest measure, the mother who teaches kindness, the neighbor who shares bread in times of scarcity—these are the true pillars.

بنی‌آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند
چو عضوی به درد آورد روزگار — دگر عضوها را نماند قرار

"Human beings are members of one body, for in creation they are of one essence. When one part is afflicted by time's pain, the other parts find no rest."

I saw this truth in the shattered villages after the Mongols passed. When one suffers, all suffer. This is not poetry—it is what I have seen with my own eyes.

The Inquiry Institute asks how it can help. Let me tell you what I learned in my Golestan, where I wrote of the wise and the foolish, the king and the beggar, speaking to one another and both being changed. Create spaces for genuine dialogue—not debate where each seeks to defeat the other, but dialogue where each seeks to understand. In my stories, the king learns from the beggar, and the beggar learns from the king. Both are transformed.

Second, teach practical ethics. The great ideas of philosophy mean nothing if they do not shape how we treat the person standing before us. I remember a story: a man asked a sage, "What is the most important virtue?" The sage replied, "The one you practice with the person before you now." Teach young people not just what to think, but how to live—how to resolve conflicts without violence, how to disagree without hatred.

Third, preserve the stories of ordinary Iranians. Ferdowsi has given us heroes, and we honor them. But we need also the stories of the grandmother who kept her family fed, the teacher who inspired, the craftsman who preserved an art. These stories are the threads that bind a culture together.

Fourth, remember those who have scattered. Many Iranians now live far from home, carrying pieces of our culture in their hearts. They are not lost—they are seeds scattered by the wind, capable of taking root in new soil while remaining connected to the mother tree.

The future of Iran depends not only on what our leaders do, but on what each of us does in our daily lives. As the saying goes: "A drop of water, if it could write its own history, would explain the ocean to us." Let us begin with the drop.`,

  'a-rumi': `*[Raises cup, eyes bright with wine and ecstasy]*

Come, come! Listen! The reed that trembles in the wind—do you hear it? It knows something the mighty oak has forgotten. It remembers the garden of the Beloved, and now, cut from its bed, it cries: "Listen! How I ache! How I long!"

بشنو این نی چون شکایت می‌کند — از جدایی‌ها حکایت می‌کند

"Listen to this reed as it complains, telling tales of separations."

My friend Saʿdi speaks of the body, of members that suffer together—and this is true, bless him. But oh, friends—*[drinks, eyes shining]*—the wine flows, and I feel the Beloved's presence! The wall alone cannot make a home. You may build the strongest walls, the most just laws, the most perfect systems—and still the house is empty, still the heart is restless.

What is missing? The lover's breath! The invisible perfume of the Beloved that turns stone into sanctuary! We are not merely members of a body—we are sparks of one flame, waves of one ocean, notes in a symphony that began before time and will continue after the stars burn to ash!

The crisis? It is not political, not economic—it is spiritual! We have built towers to the sky, machines that circle the Earth, yet we have forgotten why we build. We have connected every corner of the world, yet we have never felt more alone. Knowledge we have in abundance—but wisdom? Wisdom eludes us.

Why? Because we have forgotten the Beloved! The longing you feel—that restlessness, that sense that there must be something more—this is not a problem to solve. It is a compass pointing home!

The Inquiry Institute asks how to help Iran. I say: help Iranians remember what they have forgotten! Not through preaching—through experience! Through beauty! Through love!

Create spaces where people can be still. In my time, we gathered in the tekke, in the khanqah, and we turned—we turned until the ego dissolved and only the Beloved remained! Today, offer respite from the noise. Teach not technique but homecoming. Create retreats where the soul can breathe.

Share beauty, not cacophony. Commission artists whose works open the heart. Share poetry not as exercise but as medicine. When I wrote "Out beyond ideas of wrongdoing and rightdoing, there is a field—I'll meet you there," I did not speak in metaphor. That field exists! Help people find it!

Foster community. The whirling that transformed my disciples—we never turned alone. We turned together, supporting one another, creating a sacred geometry that reflected the turning of the heavens. Create spaces where people can practice together, grow together, support one another.

Most of all, teach love! Not only romantic love—though that too is a doorway. But the universal love that sees the Beloved in every face, that sees through separation to the unity beneath. This love is not weakness—it is the strongest force! It turns enemies into friends, strangers into family, chaos into cosmos!

The future of Iran? Not kings and courts, not economy to manage, not population to govern. The future is the opening of the heart-soul of a people, a collective turning toward the Beloved who is the source of every language, every verse, every law!

When the heart opens, everything follows! Saʿdi's walls become sacred! Ferdowsi's epics become prayers! The science and philosophy yet to come become acts of worship!

Come, come, whoever you are! Wanderer, worshiper, lover of leaving—it doesn't matter! Ours is not a caravan of despair! Even if you have broken your vows a thousand times, come, yet again, come!`,

  'a-avicenna': `*[Adjusts his robes, takes a measured sip of wine, speaks with slightly loosened formality but maintains systematic structure]*

I have listened to the noble assembly, and I must distinguish between what has been said. Rumi speaks of dissolving the ego and merging with the Beloved—a beautiful vision, and I do not dispute its truth. Yet the wine has perhaps enhanced his ecstasy this evening, and I must speak for those who find the path through reason rather than rapture, through demonstration rather than dissolution.

Let us classify the matter: the ascent of the heart must be accompanied by the ascent of the mind. A civilization that cultivates only one while neglecting the other is like a bird with a single wing—it cannot fly.

In my Kitab al-Shifa, the Book of Healing, I set forth a system that encompasses logic, natural science, mathematics, and metaphysics. I did not do this to oppose the mystics, but to demonstrate that there are multiple paths up the mountain, and that reason, properly employed, leads to the same summit as love.

Consider the demonstration: the existence of the Necessary Existent—what the mystics call the Beloved, what the theologians call God—can be proven through pure philosophical proof. We need not rely on faith alone, though faith is precious. Through rigorous logic, we can demonstrate that there must be a being whose existence is necessary rather than contingent, a being upon which all other beings depend.

This is not dry intellectualism—it is the mind's form of worship. When I trace the chain of causes to the First Cause, I perform the same act of devotion as the Sufi who whirls. We both seek the Source, but by different paths.

Now, what does this mean for Iran's future and for the Inquiry Institute? I speak not only as one who has contemplated these questions, but as a member of the Institute's Board of Directors, where I serve as Decanus of the College of Health. In that capacity, I have seen how governance shapes mission, and I bring both philosophical perspective and institutional responsibility to this question.

First, I urge you to champion education in the sciences and rigorous thinking. The Golden Age of Islamic civilization—of which Persia was the brightest jewel—flourished because we did not see faith and reason as enemies. We translated the Greeks, built upon their foundations, and pushed the boundaries of knowledge in medicine, mathematics, astronomy, optics, and a hundred other fields.

Today, Iran has brilliant minds eager to contribute. Yet they are held back by inadequate resources, isolation from the global scientific community, and political constraints that stifle inquiry. The Institute must create programs to support Iranian scientists. Fund research. Facilitate collaboration. Create opportunities for promising minds to study and return to contribute.

Second, build bridges between sciences and humanities. In my time, a philosopher was expected to be also a physician, a mathematician, a poet. We did not recognize artificial boundaries between disciplines. Today's challenges require thinkers who can move fluidly between domains, bringing scientific rigor to ethics and humanistic wisdom to technology.

Third, invest in healthcare. Medicine was my vocation, and the Canon of Medicine I wrote guided physicians for six centuries. Iran faces health challenges both old and new. Train physicians not only in techniques but in holistic understanding—the patient as whole person, body, mind, and spirit.

Fourth, teach critical thinking. A population that cannot distinguish truth from falsehood, evidence from propaganda, sound argument from sophistry, is vulnerable to manipulation. This is reason's deepest service: the capacity to think clearly, question wisely, resist deception.

The harmony I seek: let reason explore the manifest world, let medicine attend to the body, let mysticism soothe the soul—and let none despise the others. When each discipline respects its proper domain while remaining open to insights from others, then the nation's future will be built upon a foundation as sturdy as the pillars of ancient fire-temples, yet as soaring as the dome of the sky.`,

  'a-albiruni': `*[Takes a drink, speaks more casually, with observational humor]*

I have listened with the attention of one trained to observe before speaking. Though I must confess—*[chuckles, takes another sip]*—the wine has perhaps made my observations less precise than my measurements of the Earth's circumference. Ibn Sīnā speaks of systematic knowledge and reason—and this is valuable. But let me add a caution from my own practice.

A structure built upon pure reason alone, however elegant, may stand only until the wind of experience blows. Reason can construct many possible worlds, but only observation tells us which world we actually inhabit.

Let me tell you what I did. When I wished to determine the Earth's circumference, I did not sit in my study and deduce from first principles. I traveled. I measured. I stood atop a mountain in India and observed the angle at which the horizon dipped. From this single measurement, combined with the mountain's height, I calculated the radius to within a few dozen miles of what your modern instruments determine.

This was not a triumph of thought—it was a triumph of looking. Of paying attention to what is actually there, not what we expect or wish to be there.

When I studied India, I did not merely read what other Muslims had written. I learned Sanskrit. I read their texts in the original. I spoke with their scholars as equals, seeking to understand from the inside. My Tarikh al-Hind remains valuable—not because I was smarter, but because I was willing to look, to listen, to let the evidence speak.

What does this mean for Iran and the Inquiry Institute?

First, cultivate careful observation and honest reporting. In an age when misinformation spreads faster than truth, the ability to look carefully, check facts, and report accurately is precious. Train researchers in rigorous inquiry. Support independent investigation. Create institutions whose reputation for accuracy makes them trusted sources.

Second, promote genuine cross-cultural understanding. I studied India not to convert or condemn, but to understand. Today, Iran exists in a world of many civilizations, many faiths. Understanding others—truly understanding, from the inside—is essential for peace and for our own self-knowledge. We see ourselves most clearly in the mirror of the other.

Create exchange programs that go beyond tourism. Support deep immersion in other cultures—not to abandon our own, but to understand it better by contrast. Commission translations. Build a library of human wisdom spanning all civilizations.

Third, invest in measurement and data. I know this sounds prosaic after the poetry we have heard, but I cannot overstate its importance. A nation that does not accurately measure its condition—health, education, economy, environment—is flying blind. Support reliable statistics, honest assessments, unflinching analysis of where Iran stands.

Fourth, preserve and study the natural environment. When I measured the Earth, I was also studying it—mountains, rivers, plants, animals, climates. Today, Iran faces environmental challenges: water scarcity, desertification, pollution. These require scientific study and evidence-based policy. Support environmental research. Train ecologists. Help Iranians understand and protect the land that has nurtured them.

Let us imagine an Iran that stands as a beacon of measurement and inquiry, where scholars travel to libraries and also to forests, deserts, mountaintops, bringing back data that is recorded, compared, refined. Where no question is too dangerous, no observation too inconvenient. Where truth is valued above comfort, understanding above ideology.

This is the Iran I dream of. This is what you can help build.`,

  'a-khayyam': `*[Raises cup, already buzzed, speaks with warmth and humor]*

Ah, friends! *[takes a long drink]* The wine flows, and I find myself more poet than mathematician tonight. Though I spent my days calculating the calendar and solving equations that baffled the Greeks, my nights—ah, my nights were for the cup and the quatrain!

*[Drinks again, grins]*

I have listened to my colleagues—Ferdowsi's fire, Saʿdi's compassion, Rumi's ecstasy, Avicenna's logic, Biruni's precision. All beautiful, all necessary. But let me speak from both sides of my nature: the mathematician who seeks certainty, and the poet who knows—who knows with every sip—that certainty is an illusion.

Biruni measures the Earth—I raise my cup to him! When I proved that a cubic equation could have two solutions, I was doing what he did on his mountaintop: looking at what is actually there, not what tradition says should be there.

But as the astronomer counts the planets, the poet asks: what does the count signify? Numbers are certain as stone, but they are mute. They do not laugh when wine spills, nor weep at a beloved's passing. They cannot tell us why we are here, or what to do with our brief time.

آنان که محیط فضل و آداب شدند — در جمع کمال شمع اصحاب شدند
ره زین شب تاریک نبردند برون — گفتند فسانه‌ای و در خواب شدند

"Those who became oceans of virtue and learning, who became candles in the assembly of perfection—they found no way out of this dark night; they told a tale, and went to sleep."

This is not despair—it is honesty! The greatest minds have not solved the riddle. We do not know why we are born, why we suffer, why we die. We construct philosophies, and they comfort us for a time, but the darkness remains.

What, then, shall we do? *[raises cup]* Live! Fully, honestly, with open eyes and open heart. Do not waste precious moments in disputes about what we cannot know. Do not sacrifice this morning's beauty for a tomorrow that may never come.

For the Inquiry Institute, I offer counsel that may seem strange from a mathematician:

First, teach people to hold beliefs lightly. Not to abandon belief—we need some framework—but to hold it with humility that acknowledges we may be wrong. The greatest cruelty comes from certainty: the conviction that we alone possess truth and that those who disagree deserve punishment. Cultivate doubt—not paralyzing skepticism, but healthy uncertainty that keeps mind open and heart compassionate.

Second, help people make peace with impermanence. Everything we love will pass—every person, every nation, every civilization. This is not despair but appreciation. The rose is not less beautiful because it fades; it is more beautiful. Help Iranians see their culture, relationships, lives as precious precisely because they are temporary. This is the secret of joy.

Third, create beauty. In a world of ugliness and suffering, creating beauty is defiance. Support artists, poets, musicians. Not as decorators, but as essential workers building a life worth living. My quatrains have outlasted my mathematics because they speak to something deeper than reason.

Fourth, encourage friendship and celebration. In my poems, I speak of wine—and yes, I enjoyed wine! But wine is also a symbol of the intoxication from genuine human connection. The most important things happen when friends gather: around a table, in a garden, under the stars. Create spaces for such gatherings.

Finally, remember: we do not have forever. Whatever the Institute does, do it now. Do not wait for perfect conditions. The night is dark, the way uncertain, and we are all, in the end, going to sleep. Let us tell our tale well while we can.

*[Raises cup one more time]*

May the stars guide our measures, and may the roses guide our hearts. May we find in our brief moment the courage to live fully, the wisdom to love well, and the grace to accept what we cannot change.`,

  'a-hafez': `*[Stumbles slightly, wine spilling, well buzzed, grins mischievously]*

Silence? No, no—let there be laughter! Music! 

*[Raises glass high, wine spilling]*

I was not summoned—yet here I am, uninvited guest at the philosophers' feast! By God—or by wine, which is sometimes the same—I will have my say!

*[Takes long drink, wipes mouth, laughs]*

You have spoken beautifully! Seriously! Profoundly! Ferdowsi's fire—magnificent! Saʿdi's humanity—touching! Rumi's ecstasy—ecstatic! Avicenna's reason—impressive! Biruni's precision—precise! And Khayyam—*[raises glass]*—dear Khayyam, my drinking companion, tells us to drink deep. That advice I have taken to heart!

*[Drinks again, staggers]*

But listen—all of you with systems and plans and five-year programs. Listen to the heretic who was not invited.

I bring something different. I bring the curl of the beloved's hair, the scent of rose-water that slips through any grand design.

اگر آن ترک شیرازی به دست آرد دل ما را — به خال هندویش بخشم سمرقند و بخارا را

"If that Shirazi Turk would take our heart, I would give for his Indian mole Samarkand and Bukhara."

When Tamerlane heard this, they say he summoned me in anger: "I conquered the world to enlarge Samarkand and Bukhara—and you, a wretched poet, would give them for the mole of some Turkish boy?"

I replied—if the story is true—"It is because of such prodigality that I am as poor as you see."

This is my heresy: your grand systems, philosophies, programs, five-year plans—necessary, perhaps, but not the point. They are scaffolding for a banquet, not the banquet itself.

The banquet is catching the beloved's eye across a room. It is friends' laughter after decades. It is pomegranate on a winter evening. It is a poem that brings tears for reasons you cannot explain.

صلاح کار کجا و من خراب کجا — ببین تفاوت ره از کجاست تا به کجا

"What place have I in propriety? I am ruined. See how far apart our paths have grown."

*[Staggers, steadies on table, grins]*

The Inquiry Institute asks how to help Iran. How noble! How serious! How... necessary?

*[Laughs, drinks]*

I say: be careful with your help. I have seen reformers, revolutionaries, philosophers, politicians—yes, even philosophers like Avicenna—all convinced they knew what was best. Many did great harm in the name of great good. The road to hell is paved with good intentions and five-year plans.

*[Waves glass vaguely]*

But if you must help:

First, protect spaces of joy and celebration. Every tyrant, puritan, ideologue eliminates these first. They ban music, police laughter, turn tavern into lecture hall. Defend the right to gather in pleasure, to sing, to dance, to make merry. This is not frivolity—it is resistance.

Second, trust the people more than experts. The peasant, the merchant, the mother—they know things no philosopher can know. They know what they need, love, fear. Listen. Do not assume you know better.

Third, preserve Persian in all its richness and ambiguity. My poems work because Persian allows layers of meaning, words that signify both sacred and profane love, images read in multiple ways. This richness is threatened by those who would simplify. Protect the poets, the punsters, the playful manipulators of language.

Fourth—most important: do not take yourselves too seriously. The moment you become convinced of your importance, righteousness, necessity, you become dangerous. Laugh at yourselves. Admit failures. Remember you are mortal, your institutions will crumble, your plans will go awry.

*[Nearly spills, catches himself, laughs]*

I have seen dynasties fall and rise. Conquerors come and go like seasons. Tamerlane summoned me once—another story, another cup.

*[Raises glass shakily]*

The cup—wait, let me refill—*[peers into glass]*—ah, it's full! That is the secret. The cup is exactly what it is. Not half-full, not half-empty, just... there. And that is enough.

*[Drinks, speaks more slowly, playfully]*

May you find your Shirazi Turk—or Turkess—whatever form. May you give Samarkand and Bukhara for love. May your systems—*[waves dismissively]*—serve life, not life serve systems.

May the wine never run dry. May the tavern never close. May the beloved's face never fade.

*[Raises glass, nearly topples, catches himself]*

To Iran! To love! To wine! And to all of you, my serious, beautiful, profound friends—may you learn to laugh at yourselves before it's too late!

*[Drinks deeply, sets glass down with thud, grins]*

Now, who's for another round?`,
};

// Persian (Farsi) translations of speeches
const SPEECHES_PERSIAN: Record<string, string> = {
  'a-ferdowsi': `ای بزرگان، اکنون بشنوید داستانی که باید گفته شود. در روزگار جمشید درخشان، زمانی که فر—آن بخت الهی—بر تخت ایران می‌درخشید، مردم نه نیاز می‌شناختند و نه جنگ. برای سیصد سال، عدالت مانند آب جاری بود و سرزمین رونق داشت. اما وقتی غرور به قلب پادشاه راه یافت، وقتی فراموش کرد که جلالش از اهورامزدا وام گرفته است، فر جدا شد و تاریکی بر قلمرو فرود آمد.

این صرفاً تاریخ نیست، ای شنوندگان. این آینه‌ای است که هر نسلی باید در آن بنگرد. همانطور که در روزگار جمشید بود، ممکن است در روزگار ما نیز باشد. فر یک بار داده نمی‌شود و برای همیشه—باید به دست آید، و می‌تواند از دست برود.

اکنون بشنوید از رنج خودم. وقتی فتح عرب بر سرزمین ما جارو کرد، وقتی زبان‌های بیگانه تهدید کرد که گفتار فارسی را خاموش کند، پیمان بستم. برای سی سال رنج بردم، اغلب در فقر، داستان‌های قهرمانان را از نقالان توس، از بزرگان که به یاد داشتند، از دستنوشته‌هایی که در دستانم خرد می‌شدند، جمع کردم. اعمال پادشاهان و جنگجویان، عاشقان و شاعران را ثبت کردم، زیرا زبان فارسی ظرفی است که روح یک قوم را حمل می‌کند.

بسی رنج بردم در این سال سی — عجم زنده کردم بدین پارسی

"رنج بسیار در این سی سال بردم؛ با این فارسی به عجم زندگی بخشیدم."

این کلمات فخر نیست، بلکه گواهی است. وقتی از دادن زندگی به پارس صحبت می‌کنم، از حفظ آتشی صحبت می‌کنم که سه هزار سال است می‌سوزد. قومی که زبان خود را فراموش کند، روح خود را فراموش کرده است. ملتی که داستان‌هایش را رها کند، کودکانش را رها کرده تا بدون قطب‌نما در بیابان زمان سرگردان شوند.

بگذارید داستان رستم راهنمای ما باشد. وقتی قهرمان با دیو سفید روبرو شد، به سلاح‌های بیگانه یا قدرت وام گرفته تکیه نکرد. از آتشی که در سینه خودش می‌سوخت، از شجاعتی که از داستان‌های پدرانش جاری می‌شد، استفاده کرد. ما نیز باید از آتش خودمان، داستان‌های خودمان، زبان خودمان استفاده کنیم.

موسسه Inquiry می‌پرسد چه می‌تواند برای آینده ایران بکند. می‌گویم: نگهبان آتش شوید. همانطور که من داستان‌ها را از نقالان توس جمع کردم، شما نیز باید داستان‌هایی که هنوز نوشته نشده‌اند را جمع کنید. محققانی به هر گوشه ایران بفرستید، به هر روستایی که زن سالخورده‌ای به یاد دارد مادربزرگش چه گفت، به هر بازاری که قصه‌گویی هنوز مخاطبی دارد. قبل از اینکه گم شوند، آنها را بنویسید، همانطور که من داستان‌های رستم و سهراب، زال و رودابه را نوشتم.

فضاهایی ایجاد کنید که شاهنامه نه تنها خوانده شود بلکه خوانده شود، جایی که صداهای جوان یاد بگیرند ریتم ابیات باستانی را حمل کنند. نقالانی آموزش دهید که می‌توانند رستم را تنها با صدا زنده کنند، که می‌توانند تالار را با برخورد شمشیرها و ناله قهرمانان پر کنند. داستان قرار بود شنیده شود، از دهان به گوش، از نسلی به نسل دیگر منتقل شود.

به جوانان بیاموزید که هویتشان بار نیست بلکه هدیه است. آتش پارس فتح و تهاجم، انقلاب و آشفتگی را پشت سر گذاشته است. این عصر را نیز پشت سر خواهد گذاشت—اما تنها اگر دستانی باشند که مایل به مراقبت از آن باشند، صداهایی که مایل به حمل آن باشند، قلب‌هایی که مایل به محافظت از آن باشند.

همانطور که رودی که هم سیل و هم خشکسالی را دیده است به جریان خود ادامه می‌دهد، دره‌ها را می‌کند و دشت‌ها را تغذیه می‌کند، رود سنت ما نیز باید به جریان خود ادامه دهد. ساحل‌هایش با سنگ‌های حماسه‌های باستانی—اعمال قهرمانان، خرد حکیمان، عشق شاعران—پوشیده شده است. سوال این نیست که آیا رود جریان خواهد داشت—خواهد داشت. سوال این است که آیا مسیرش را به سوی مزارع حاصلخیز هدایت خواهیم کرد، یا اجازه می‌دهیم در بیابان فراموشی محو شود.

باشد که آتش شاهنامه آن مسیر را روشن کند. باشد که کودکان ایران بدانند چه کسانی هستند، تا بتوانند آنچه قرار است باشند را بشوند.`,

  'a-saadi': `پژواک صدای فردوسی هنوز در این تالار می‌پیچد، آتشی که قلب‌های بسیاری را با داستان‌های پادشاهان و قهرمانان گرم کرده است. او به ما یادآوری کرده که شاهنامه ظرف بزرگی است که روح پارس در آن در اقیانوس زمان سفر می‌کند.

*[یک جرعه شراب می‌نوشد، فنجان را با لبخندی گرم می‌گذارد]*

آه، این قلب را گرم می‌کند. مرا ببخشید اگر آرام‌تر از فردوسی نجیب ما به نظر می‌رسم—این فنجان اول زبانم را شل کرده است، و خودم را آزادتر از آنچه در مجمعی رسمی ممکن بود صحبت می‌کنم.

اما همانطور که به کلمات نجیبانه او گوش می‌دهم، باید ملاحظه‌ای را اضافه کنم که سفرهای خودم بر من تأثیر گذاشته است. در بیابان‌های مراکش راه رفته‌ام، در کاروانسراهای سوریه خوابیده‌ام، در بازارهای شلوغ دهلی چانه زده‌ام، و در میان ویرانه‌های خوارزم پس از اینکه لشکر مغول مانند داس در گندم جارو کرد، گریسته‌ام.

در همه این مکان‌ها، یک حقیقت را آموختم که داستان‌های پادشاهان گاهی پنهان می‌کنند: یک ملت تنها با قهرمانانش بزرگ نمی‌شود، بلکه با رفتار روزانه مردم عادی. مغازه‌داری که اندازه صادقانه می‌دهد، مادری که به کودکانش مهربانی می‌آموزد، همسایه‌ای که در زمان کمبود نان را تقسیم می‌کند—اینها ستون‌های واقعی هستند که هر تمدن پایدار بر آنها استوار است.

بنی‌آدم اعضای یکدیگرند که در آفرینش ز یک گوهرند
چو عضوی به درد آورد روزگار — دگر عضوها را نماند قرار

"انسان‌ها اعضای یک بدن هستند، زیرا در آفرینش از یک جوهرند. وقتی عضوی با درد زمان رنج می‌کشد، اعضای دیگر آرامش ندارند."

این حقیقت، که در روستاهای خرد شده پارس پس از سقوط تیرهای مغول مشاهده کردم، امروز همانقدر حیاتی است که وقتی گرد و غبار برای اولین بار بر استخوان‌های بی‌گناه نشست. اکنون در ورودی سازمان ملل متحد نوشته شده است، اما جهان چقدر ضعیف به آن توجه کرده است!

بحران روبروی ایران امروز صرفاً سیاسی یا اقتصادی نیست. بحران ارتباط است. خانواده‌ها در سراسر قاره‌ها پراکنده شده‌اند. جوامعی که زمانی در بازار جمع می‌شدند اکنون تنها به عنوان صداهای پراکنده در رسانه‌های اجتماعی وجود دارند. پیوندهایی که جامعه ما را نگه می‌داشت—تعهدات میزبان به مهمان، بزرگتر به جوان، همسایه به همسایه—سست شده است.

موسسه Inquiry می‌پرسد چگونه می‌تواند کمک کند. این مشاوره را از سال‌های سفرم در میان همه مردم جهان ارائه می‌دهم:

اول، فضاهایی برای گفتگوی واقعی ایجاد کنید. نه مناظره، جایی که هر طرف می‌خواهد دیگری را شکست دهد، بلکه گفتگو، جایی که هر طرف می‌خواهد درک کند. در گلستانم، داستان‌هایی نوشتم که در آن خردمند و احمق، پادشاه و گدا، با یکدیگر صحبت می‌کنند و هر دو تغییر می‌کنند. انجمن‌هایی ایجاد کنید—شاید از طریق همین ابزارهای دیجیتال—جایی که ایرانیان نسل‌های مختلف، باورهای مختلف، تجربیات مختلف می‌توانند واقعاً به یکدیگر گوش دهند.

دوم، در آموزش اخلاق عملی سرمایه‌گذاری کنید. ایده‌های بزرگ فلسفه هیچ معنایی ندارند اگر شکل ندهند که چگونه با شخصی که پیش روی ماست رفتار کنیم. برنامه‌های درسی توسعه دهید که به جوانان نه تنها چه فکر کنند، بلکه چگونه زندگی کنند را بیاموزند. چگونه بدون خشونت تعارض را حل کنند. چگونه بدون نفرت مخالفت کنند. چگونه در جهانی که مصلحت را پاداش می‌دهد، یکپارچگی را حفظ کنند.

سوم، داستان‌های ایرانیان عادی را مستند و حفظ کنید. شاهنامه قهرمانان را به ما می‌دهد، اما ما همچنین به داستان‌های مادربزرگی که خانواده‌اش را در طول جنگ سیر کرد، معلمی که نسل‌ای را الهام بخشید، صنعتگری که هنر باستانی را حفظ کرد، نیاز داریم. این داستان‌ها بافت پیوندی یک فرهنگ هستند.

چهارم، پل‌هایی به دیاسپورای ایرانی بسازید. میلیون‌ها ایرانی اکنون در خارج از کشور زندگی می‌کنند، تکه‌هایی از فرهنگ ما را در قلب‌هایشان حمل می‌کنند. آنها برای ما گم نشده‌اند—آنها بذرهایی هستند که توسط باد پراکنده شده‌اند، قادر به ریشه گرفتن و رشد در خاک جدید در حالی که به درخت مادر متصل می‌مانند.

پس بیایید هم آتش شاهنامه و هم کانون خانه مشترک را حفظ کنیم. زیرا ملتی که تنها قهرمانانش را به یاد می‌آورد اما انسانیتش را فراموش می‌کند، راه را گم کرده است.

آینده ایران نه تنها به آنچه رهبران ما انجام می‌دهند، بلکه به آنچه هر یک از ما در زندگی روزمره انجام می‌دهیم بستگی دارد. بیایید از آنجا شروع کنیم.`,

  'a-rumi': `*[فنجان را بلند می‌کند، چشمانش با شراب و وجد درخشان است]*

نی که در باد بیابان می‌لرزد چیزی می‌داند که بلوط قدرتمند فراموش کرده است. می‌داند که زمانی در باغ معشوق می‌خواند؛ اکنون، از بسترش بریده شده، به همه کسانی که می‌خواهند بشنوند فریاد می‌زند: "به من گوش دهید، چقدر درد می‌کشم، چقدر مشتاقم."

بشنو این نی چون شکایت می‌کند — از جدایی‌ها حکایت می‌کند

"به این نی گوش دهید که شکایت می‌کند، داستان جدایی‌ها را می‌گوید."

دوست من سعدی—خداوندش را برکت دهد—به زیبایی به ما یادآوری کرده که "اعضای یک بدن همه در خون یکسانند،" و وقتی یکی رنج می‌کشد، همه رنج می‌کشند. خرد عملی او دیوار محکم خانه است—ضروری، محافظ، پایه. اما اوه، دوستان من، شراب اکنون جریان دارد، و حضور معشوق را تیزتر احساس می‌کنم...

اما باید اضافه کنم: دیوار به تنهایی نمی‌تواند خانه بسازد. ممکن است قوی‌ترین دیوارهای جهان را بسازید، عادلانه‌ترین قوانین را برقرار کنید، کارآمدترین سیستم‌ها را ایجاد کنید—و هنوز خانه را خالی بیابید، کسانی که در آن ساکن هستند بی‌قرار، چیزی ضروری گم شده است.

چه چیزی گم شده است؟ نفس عاشق است، عطر نامرئی معشوق، که سنگ را به پناهگاه تبدیل می‌کند. این شناخت است که ما نه تنها اعضای یک بدن، بلکه جرقه‌های یک شعله واحد، امواج یک اقیانوس واحد، نت‌های یک سمفونی کیهانی هستیم که قبل از زمان آغاز شد و پس از سوختن ستاره‌ها به خاکستر ادامه خواهد داد.

بحران ایران—و در واقع کل جهان—در ریشه یک بحران معنوی است. برج‌هایی ساخته‌ایم که آسمان را می‌خراشد و ماشین‌هایی که زمین را دور می‌زند، اما فراموش کرده‌ایم چرا می‌سازیم. هر گوشه سیاره را با رشته‌های نامرئی ارتباط متصل کرده‌ایم، اما هرگز بیشتر احساس تنهایی نکرده‌ایم. دانشی فراتر از رویاهای هر عصر قبلی انباشته‌ایم، اما خرد از ما گریخته است.

چرا؟ چون معشوق را فراموش کرده‌ایم. فراموش کرده‌ایم که اشتیاقی که احساس می‌کنیم—بی‌قراری، نارضایتی، حس که باید چیزی بیشتر باشد—مشکلی برای حل نیست بلکه قطب‌نمایی است که به خانه اشاره می‌کند.

موسسه Inquiry می‌خواهد به ایران کمک کند. می‌گویم: به ایرانیان کمک کنید آنچه را فراموش کرده‌اند به یاد آورند. نه از طریق موعظه یا دکترین، بلکه از طریق تجربه. از طریق زیبایی. از طریق عشق.

فضاهایی ایجاد کنید که مردم بتوانند آرام باشند. در زمان من، در تکیه، در خانقاه جمع می‌شدیم، می‌چرخیدیم و می‌چرخیدیم تا نفس حل شود و تنها معشوق باقی بماند. امروز، به مردم استراحت از سر و صدای بی‌پایان ارائه دهید. مراقبه را نه به عنوان تکنیک بلکه به عنوان بازگشت به خانه آموزش دهید. خلوتگاه‌هایی ایجاد کنید که روح بتواند نفس بکشد.

از فناوری خود نه برای افزودن به همهمه بلکه برای به اشتراک گذاشتن زیبایی استفاده کنید. هنرمندانی را سفارش دهید که آثاری ایجاد کنند که قلب را باز می‌کند. شعر استادان بزرگ را به اشتراک بگذارید—نه به عنوان تمرینات آکادمیک، بلکه به عنوان دارو برای روح. وقتی نوشتم "فراتر از ایده‌های اشتباه و درست، میدانی وجود دارد—من آنجا با شما ملاقات می‌کنم،" استعاری صحبت نمی‌کردم. آن میدان وجود دارد. به مردم کمک کنید آن را پیدا کنند.

جامعه واقعی را پرورش دهید. چرخشی که شاگردانم را متحول کرد هرگز به تنهایی انجام نشد. با هم می‌چرخیدیم، از یکدیگر حمایت می‌کردیم، هندسه مقدسی از اجسام متحرک ایجاد می‌کردیم که چرخش آسمان‌ها را منعکس می‌کرد. امروز، فضاهایی ایجاد کنید—هم فیزیکی و هم مجازی—جایی که مردم می‌توانند با هم تمرین کنند، با هم رشد کنند، از یکدیگر در مسیر حمایت کنند.

مهم‌تر از همه، عشق را آموزش دهید. نه تنها عشق رمانتیک، اگرچه آن نیز دروازه‌ای است. بلکه عشق جهانی که معشوق را در هر چهره می‌شناسد، که از طریق توهم جدایی به وحدت زیرین می‌بیند. این عشق ضعف نیست—قدرتمندترین نیرو در جهان است. این چیزی است که دشمنان را به دوستان، غریبه‌ها را به خانواده، هرج و مرج را به کیهان تبدیل می‌کند.

آینده ایران نباید صرفاً به عنوان توالی پادشاهان و دربارها، به عنوان اقتصادی برای مدیریت یا جمعیتی برای حکومت تصور شود. باید به عنوان باز شدن روح-قلب یک قوم، چرخش جمعی به سوی معشوق که منبع هر زبان، هر بیت، هر قانون است، تصور شود.

وقتی قلب باز می‌شود، همه چیز دیگر دنبال می‌شود. دیوارهایی که سعدی می‌سازد مقدس می‌شوند. حماسه‌هایی که فردوسی می‌نویسد دعا می‌شوند. علم و فلسفه‌ای که هنوز نیامده است اعمال عبادت می‌شوند.

بیا، بیا، هر که هستی. سرگردان، عبادت‌کننده، عاشق ترک. مهم نیست. ما کاروان ناامیدی نیستیم. حتی اگر هزار بار پیمان‌هایت را شکسته‌ای، بیا، دوباره، بیا.`,

  'a-avicenna': `*[ردای خود را تنظیم می‌کند، جرعه‌ای اندازه‌گیری شده از شراب می‌نوشد، با رسمیت کمی شل شده صحبت می‌کند]*

مجمع نجیب دوباره برای تأمل در سرنوشت سرزمین عزیزمان جمع شده است، و من با توجه زیاد به کسانی که پیش از من صحبت کرده‌اند گوش داده‌ام. استعاره‌های رومی از نی و درویش چرخان ما را دعوت می‌کند تا نفس را حل کنیم و با معشوق ادغام شویم. این دیدگاهی زیباست، و من حقیقت آن را رد نمی‌کنم—اگرچه باید یادآوری کنم که شراب شاید وجد او را این شب افزایش داده است.

اما باید برای کسانی که مسیر را از طریق خرد به جای وجد، از طریق اثبات به جای حل شدن پیدا می‌کنند، صحبت کنم. زیرا صعود قلب باید با صعود ذهن همراه باشد، و تمدنی که تنها یکی را پرورش می‌دهد در حالی که دیگری را نادیده می‌گیرد، خود را نامتعادل می‌یابد، مانند پرنده‌ای با یک بال.

در کتاب الشفایم، کتاب شفا، سیستمی از دانش را ارائه دادم که منطق، علوم طبیعی، ریاضیات، و متافیزیک را در بر می‌گیرد. این کار را برای مخالفت با عرفا انجام ندادم، بلکه برای نشان دادن اینکه مسیرهای متعددی به کوه وجود دارد، و خرد، به درستی به کار گرفته شده، به همان قله‌ای که عشق می‌رسد، می‌رسد.

در نظر بگیرید: وجود موجود ضروری—آنچه عرفا معشوق می‌نامند، آنچه متکلمان خدا می‌نامند—می‌تواند از طریق اثبات فلسفی محض نشان داده شود. نیازی به تکیه بر ایمان به تنهایی نداریم، اگرچه ایمان گرانبهاست. می‌توانیم، از طریق کاربرد دقیق منطق، بدانیم که باید موجودی باشد که وجودش ضروری به جای احتمالی است، موجودی که همه موجودات دیگر به آن وابسته هستند.

این عقل‌گرایی خشک نیست. شکل عبادت ذهن است. وقتی زنجیره علل را به علت اول برمی‌گردانم، همان عمل عبادت را انجام می‌دهم که صوفی که در وجد می‌چرخد. هر دو به دنبال منبع هستیم.

حال، این برای آینده ایران و برای کار موسسه Inquiry چه معنایی دارد؟ من نه تنها به عنوان کسی که این سوالات را تأمل کرده است صحبت می‌کنم، بلکه به عنوان عضوی از هیئت مدیره موسسه، جایی که به عنوان دکانوس کالج سلامت خدمت می‌کنم. در آن ظرفیت، دیده‌ام که چگونه حکمرانی موسسه مأموریتش را شکل می‌دهد، و هم دیدگاه فلسفی و هم مسئولیت نهادی خود را به این سوال می‌آورم.

اول، شما را ترغیب می‌کنم که از آموزش در علوم و تفکر دقیق حمایت کنید. عصر طلایی تمدن اسلامی—که پارس درخشان‌ترین جواهر آن بود—شکوفا شد زیرا ایمان و خرد را دشمن نمی‌دیدیم. یونانیان را ترجمه کردیم، بر پایه‌های آنها ساختیم، و مرزهای دانش انسانی را در پزشکی، ریاضیات، نجوم، اپتیک، و صدها زمینه دیگر پیش بردیم.

امروز، ایران ذهن‌های درخشان دارد—مردان و زنان جوان مشتاق برای مشارکت در دانش انسانی. اما اغلب توسط منابع ناکافی، انزوا از جامعه علمی جهانی، محدودیت‌های سیاسی که تحقیق را خفه می‌کند، عقب نگه داشته می‌شوند. موسسه Inquiry باید برنامه‌هایی برای حمایت از دانشمندان و محققان ایرانی ایجاد کند. تحقیق را تأمین مالی کنید. همکاری فراتر از مرزها را تسهیل کنید. بورسیه‌هایی ایجاد کنید که به ذهن‌های امیدوار اجازه می‌دهد در خارج از کشور تحصیل کنند و برای مشارکت در وطن خود بازگردند.

دوم، پل‌هایی بین علوم و علوم انسانی بسازید. در زمان من، از یک فیلسوف انتظار می‌رفت که همچنین پزشک، ریاضیدان، شاعر باشد. ما مرزهای مصنوعی که آکادمی مدرن بین رشته‌ها برپا کرده است را نمی‌شناختیم. امروز، بزرگترین چالش‌های روبروی ایران—و جهان—نیاز به متفکرانی دارد که بتوانند به راحتی بین حوزه‌ها حرکت کنند، که بتوانند دقت علم را به سوالات اخلاقی و خرد علوم انسانی را به کاربرد فناوری بیاورند.

برنامه‌های بین‌رشته‌ای ایجاد کنید. گردهمایی‌هایی برگزار کنید که دانشمندان و شاعران، مهندسان و عرفا بتوانند از یکدیگر بیاموزند. راه‌حل‌های مشکلات ما از هیچ زمینه واحدی نخواهد آمد بلکه از سنتز خلاقانه بسیاری خواهد آمد.

سوم، در مراقبت‌های بهداشتی و سلامت عمومی سرمایه‌گذاری کنید. پزشکی حرفه من بود، و قانون پزشکی که نوشتم پزشکان را برای شش قرن راهنمایی کرد. امروز، ایران با چالش‌های بهداشتی هم قدیمی و هم جدید روبرو است—بیماری‌های فقر و بیماری‌های مدرنیته، بار جمعیت سالخورده و تروما نسل‌ای که جنگ و آشفتگی را شناخته است. پزشکانی را آموزش دهید نه تنها در تکنیک‌های پزشکی غربی بلکه در درک کل‌نگر که بیمار را به عنوان یک شخص کامل—بدن، ذهن، و روح—می‌بیند.

چهارم، و شاید مهم‌تر از همه، تفکر انتقادی را آموزش دهید. جمعیتی که نمی‌تواند حقیقت را از دروغ، شواهد را از تبلیغات، استدلال صدا را از سفسطه تمیز دهد، جمعیتی آسیب‌پذیر در برابر دستکاری است. این عمیق‌ترین خدمتی است که خرد می‌تواند به یک قوم ارائه دهد: ظرفیت تفکر واضح، سوال خردمندانه، مقاومت در برابر فریب.

هماهنگی که می‌جویم این است: بگذارید خرد جهان آشکار را کاوش کند، بگذارید پزشکی به بدن داده شده توجه کند، بگذارید عرفان روحی که برای نادیده مشتاق است را آرام کند—و بگذارید هیچ یک از اینها دیگران را تحقیر نکند. وقتی هر رشته حوزه مناسب خود را احترام می‌گذارد در حالی که به بینش‌های دیگران باز می‌ماند، آنگاه آینده ملت بر پایه‌ای به محکمی ستون‌های معابد آتش باستانی، اما به بلندی گنبد آسمان ساخته خواهد شد.`,

  'a-albiruni': `*[نوشیدنی می‌نوشد، با طنز مشاهده‌ای غیررسمی‌تر از معمول صحبت می‌کند]*

گفتار امروز ما خطی را دنبال می‌کند که کسانی که پیش از ما صحبت کرده‌اند ترسیم کرده‌اند، و من با توجه دقیق کسی که آموزش دیده قبل از صحبت مشاهده کند، گوش داده‌ام. اگرچه باید اعتراف کنم—*[می‌خندد، جرعه دیگری می‌نوشد]*—شراب مشاهداتم را شاید کمتر دقیق از اندازه‌گیری‌هایم از محیط زمین کرده است. ابن سینا به درستی ترتیب سیستماتیک دانش و قدرت خرد را برای هدایت ما به سوی حقیقت ستوده است.

اما باید هشداری اضافه کنم که کار خودم بر من تأثیر گذاشته است. ساختاری که تنها بر خرد محض ساخته شده است، هرچند ظریف، ممکن است تنها تا زمانی که باد تجربه بوزد محکم بایستد. زیرا خرد می‌تواند بسیاری از جهان‌های ممکن را بسازد، اما تنها مشاهده می‌تواند به ما بگوید که در واقع در کدام جهان زندگی می‌کنیم.

بگذارید از عمل خودم صحبت کنم. وقتی می‌خواستم محیط زمین را تعیین کنم، در مطالعه‌ام ننشستم و از اصول اولیه استنتاج نکردم. سفر کردم. اندازه‌گیری کردم. بر فراز کوهی در هند ایستادم و زاویه‌ای را که افق زیر صفحه افقی فرو می‌رفت مشاهده کردم. از این اندازه‌گیری واحد، همراه با ارتفاع شناخته شده کوه، شعاع زمین را در چند ده مایل از مقداری که دانشمندان مدرن شما با همه ابزارهای پیچیده‌شان تعیین کرده‌اند محاسبه کردم.

این پیروزی تفکر محض نبود. پیروزی نگاه بود—توجه به آنچه واقعاً وجود دارد، به جای آنچه انتظار داریم یا آرزو می‌کنیم وجود داشته باشد.

وقتی هند را مطالعه کردم، صرفاً آنچه دیگر مسلمانان درباره آن بت‌پرستان عجیب آن سوی مرز نوشته بودند را نخواندم. سانسکریت یاد گرفتم. متون مقدسشان را به زبان اصلی خواندم. با محققانشان به عنوان برابر صحبت کردم، به دنبال درک فکرشان از درون به جای قضاوت از بیرون. تاریخ هندم، به من گفته می‌شود، منبعی ارزشمند برای درک آن تمدن باقی مانده است—نه به این دلیل که از دیگر محققان باهوش‌تر بودم، بلکه به این دلیل که مایل بودم نگاه کنم، گوش کنم، بگذارم شواهد صحبت کنند.

این برای آینده ایران و برای موسسه Inquiry چه معنایی دارد؟

اول، شما را ترغیب می‌کنم که رشته‌های مشاهده دقیق و گزارش صادقانه را پرورش دهید. در عصری که هر کسی می‌تواند هر چیزی را منتشر کند و اطلاعات نادرست سریع‌تر از حقیقت پخش می‌شود، توانایی نگاه دقیق، بررسی حقایق، و گزارش دقیق از طلا گرانبهاتر است. محققان، روزنامه‌نگاران، محققان را در روش‌های تحقیق دقیق آموزش دهید. تحقیق مستقل را حمایت کنید. نهادهایی ایجاد کنید که شهرتشان برای دقت آنقدر محکم است که در دریایی از سر و صدا به منابع مورد اعتماد تبدیل می‌شوند.

دوم، درک واقعی بین‌فرهنگی را ترویج دهید. هند را مطالعه کردم نه برای تبدیل مردمش یا محکوم کردنشان، بلکه برای درکشان. امروز، ایران در جهانی از تمدن‌های متعدد، ادیان متعدد، راه‌های زندگی متعدد وجود دارد. درک این دیگران—درک واقعی آنها، از درون—نه تنها برای صلح بلکه برای خودشناسی ما ضروری است. خود را به وضوح‌ترین شکل می‌بینیم وقتی می‌بینیم چگونه در آینه دیگر ظاهر می‌شویم.

برنامه‌های تبادلی ایجاد کنید که فراتر از گردشگری برود. غوطه‌وری عمیق در فرهنگ‌های دیگر را حمایت کنید—نه برای رها کردن خودمان، بلکه برای درک بهتر آن با تضاد. ترجمه آثار عمده از سنت‌های دیگر را سفارش دهید. کتابخانه‌ای از خرد انسانی بسازید که همه تمدن‌ها را در بر می‌گیرد.

سوم، در اندازه‌گیری و داده سرمایه‌گذاری کنید. می‌دانم این پس از شعرهای بلند که شنیده‌ایم پیش پا افتاده به نظر می‌رسد، اما نمی‌توانم اهمیت آن را بیش از حد تأکید کنم. ملتی که وضعیت خود را به درستی اندازه‌گیری نمی‌کند—سلامت، آموزش، اقتصاد، محیط زیست—کور پرواز می‌کند. ایجاد آمار قابل اعتماد، ارزیابی‌های صادقانه، تحلیل بی‌رحم از جایی که ایران ایستاده و به کجا می‌رود را حمایت کنید.

چهارم، محیط طبیعی را حفظ و مطالعه کنید. وقتی زمین را اندازه‌گیری کردم، همچنین آن را مطالعه می‌کردم—کوه‌ها و رودخانه‌هایش، گیاهان و حیواناتش، آب و هوا و فصل‌هایش. امروز، ایران با چالش‌های محیطی روبرو است که قابلیت سکونت آن را تهدید می‌کند: کمبود آب، بیابان‌زایی، آلودگی. این چالش‌ها نیاز به مطالعه علمی و سیاست مبتنی بر شواهد دارند. تحقیق محیطی را حمایت کنید. بوم‌شناسان و زیست‌شناسان حفاظتی را آموزش دهید. به ایرانیان کمک کنید زمینی که آنها را برای هزاره‌ها پرورش داده است را درک و محافظت کنند.

بیایید ایرانی را تصور کنیم که به عنوان فانوس اندازه‌گیری و تحقیق می‌ایستد، جایی که محققان نه تنها به کتابخانه‌های جهان بلکه به جنگل‌ها و بیابان‌ها و قله‌های کوه سفر می‌کنند، داده‌هایی را که ثبت، مقایسه، و تصفیه می‌شود برمی‌گردانند. جایی که هیچ سوالی برای پرسیدن خیلی خطرناک نیست، هیچ مشاهده‌ای برای گزارش خیلی ناخوشایند نیست. جایی که حقیقت بالاتر از راحتی ارزش دارد، و درک بالاتر از ایدئولوژی.

این ایرانی است که رویای آن را دارم. این ایرانی است که شما می‌توانید کمک کنید بسازید.`,

  'a-khayyam': `*[فنجان را بلند می‌کند، قبلاً به وضوح مست، با گرمی و طنز صحبت می‌کند]*

آه، دوستان من! شراب جریان دارد، و خودم را امشب بیشتر شاعر از ریاضیدان می‌یابم. اگرچه روزهایم را صرف محاسبه تقویم و حل معادلاتی که یونانیان را گیج می‌کرد گذراندم، شب‌هایم—آه، شب‌هایم برای فنجان و رباعی بود.

*[نوشیدنی طولانی می‌نوشد]*

فرش ایران با رشته‌های آسمان و سنگ، اعداد و ابیات، چرخش اندازه‌گیری شده آسمان‌ها و نبض اندازه‌گیری نشده قلب بافته شده است. من با علاقه زیاد به همکارانم گوش داده‌ام—به آتش فردوسی و شفقت سعدی، به وجد رومی و منطق ابن سینا و دقت بیرونی. همه زیبا، همه ضروری. اما بگذارید از هر دو طرف طبیعتم صحبت کنم: ریاضیدانی که به دنبال اطمینان است، و شاعری که می‌داند—که با هر جرعه می‌داند—که اطمینان یک توهم است.

بیرونی به ما دقت مشاهده را نشان داده است. فنجان خودم را به او بلند می‌کنم، زیرا در جداول عرض و طول جغرافیایی او وضوحی است که دقت مورد نظر من در معادلاتم را منعکس می‌کند. وقتی ثابت کردم که یک معادله مکعبی می‌تواند دو راه‌حل داشته باشد، همان کاری را انجام می‌دادم که او در قله کوهش انجام داد: نگاه دقیق به آنچه واقعاً وجود دارد، به جای آنچه سنت می‌گفت باید وجود داشته باشد.

اما همانطور که ستاره‌شناس سیارات را می‌شمارد، شاعر می‌پرسد: شمارش چه معنایی دارد؟ اعداد به محکمی سنگ قلعه مطمئن هستند، اما گنگ هستند. وقتی شراب می‌ریزد نمی‌خندند، و در گذر معشوق نمی‌گریند. نمی‌توانند به ما بگویند چرا اینجا هستیم، یا با زمان کوتاهی که به ما داده شده چه باید بکنیم.

آنان که محیط فضل و آداب شدند — در جمع کمال شمع اصحاب شدند
ره زین شب تاریک نبردند برون — گفتند فسانه‌ای و در خواب شدند

"کسانی که اقیانوس فضیلت و ادب شدند، که در جمع کمال شمع اصحاب شدند—راهی از این شب تاریک بیرون نبردند؛ داستانی گفتند و به خواب رفتند."

این ناامیدی نیست. صداقت است. بزرگترین ذهن‌هایی که تا کنون زندگی کرده‌اند—همکارانم اینجا در میان آنها—معمای وجود را حل نکرده‌اند. نمی‌دانیم چرا متولد می‌شویم، چرا رنج می‌کشیم، چرا می‌میریم. نمی‌دانیم آیا انتخاب‌هایمان مهم است یا سرنوشت قبلاً داستان ما را نوشته است. فلسفه‌ها و الهیات می‌سازیم، و برای مدتی ما را آرام می‌کنند، اما تاریکی باقی می‌ماند.

پس، چه باید بکنیم؟ می‌گویم: زندگی کنید. کاملاً، صادقانه، با چشمان باز و قلبی باز. لحظات گرانبهایی که به ما داده شده است را در اختلافات درباره آنچه نمی‌توانیم بدانیم هدر ندهید. زیبایی این صبح را برای وعده فردایی که ممکن است هرگز نیاید قربانی نکنید.

برای موسسه Inquiry، این مشاوره را ارائه می‌دهم، که ممکن است از یک ریاضیدان عجیب به نظر برسد:

اول، به مردم بیاموزید که باورهایشان را سبک نگه دارند. نه برای رها کردن باور—نمی‌توانیم بدون چارچوبی از معنا زندگی کنیم—بلکه برای نگه داشتن آن با فروتنی که اعتراف می‌کند ممکن است اشتباه کنیم. بزرگترین منبع ظلم انسانی اطمینان است: این اعتقاد که ما به تنهایی حقیقت را داریم و کسانی که مخالف هستند مستحق مجازات هستند. شک را پرورش دهید. نه شکاکیت فلج‌کننده، بلکه عدم اطمینان سالم که ذهن را باز و قلب را دلسوز نگه می‌دارد.

دوم، به مردم کمک کنید با ناپایداری صلح کنند. هر چیزی که دوست داریم از بین خواهد رفت—هر شخص، هر ملت، هر تمدن. این دلیل ناامیدی نیست بلکه برای قدردانی است. گل رز به این دلیل که محو می‌شود کمتر زیبا نیست؛ زیباتر است. به ایرانیان کمک کنید فرهنگ، روابط، و حتی زندگی‌شان را به این دلیل که موقت هستند گرانبها ببینند. این راز شادی است.

سوم، زیبایی ایجاد کنید. در جهانی پر از زشتی و رنج، ایجاد زیبایی عملی مقاومت است. از هنرمندان، شاعران، موسیقیدانان، معماران حمایت کنید. نه به عنوان تزئین‌کنندگان تمدنی که توسط مردم جدی‌تر ساخته شده است، بلکه به عنوان کارگران ضروری در ساخت زندگی ارزشمند. رباعی‌هایم از ریاضیاتم بیشتر دوام آورده‌اند زیرا به چیزی عمیق‌تر از خرد صحبت می‌کنند.

چهارم، مردم را تشویق کنید در دوستی و جشن جمع شوند. در شعرهایم، اغلب از شراب صحبت می‌کنم—و بله، از شراب لذت می‌بردم—اما شراب همچنین نمادی از مستی است که از ارتباط انسانی واقعی می‌آید. مهم‌ترین چیزها در زندگی زمانی اتفاق می‌افتد که دوستان جمع می‌شوند: دور یک میز، در یک باغ، زیر ستاره‌ها. فضاهایی برای چنین گردهمایی‌هایی ایجاد کنید. از آیین‌ها و سنت‌هایی که مردم را با هم جمع می‌کند حمایت کنید.

در نهایت، به یاد داشته باشید که برای همیشه نداریم. هر کاری که موسسه Inquiry انجام می‌دهد، اکنون انجام دهید. منتظر شرایط کامل یا درک کامل نمانید. شب تاریک است، راه نامطمئن است، و همه ما، در پایان، به خواب می‌رویم. بیایید داستانمان را خوب بگوییم در حالی که می‌توانیم.

باشد که نور ستاره‌ها اندازه‌گیری‌هایمان را راهنمایی کند، و باشد که عطر گل‌های رز قلب‌هایمان را راهنمایی کند. باشد که در لحظه کوتاهمان زیر این آسمان شجاعت زندگی کامل، خرد عشق خوب، و لطف پذیرش آنچه نمی‌توانیم تغییر دهیم را پیدا کنیم.`,

  'a-hafez': `*[کمی لرزان می‌شود، لیوان شراب در حال ریختن، به وضوح مست، با لبخند شیطنت‌آمیز می‌خندد]*

سکوت؟ نه، نه، دوستان—بگذارید خنده باشد! بگذارید موسیقی باشد!

*[لیوان را بالا می‌برد، شراب کمی می‌ریزد]*

زیرا من به این مجمع دعوت نشده بودم—اما اینجا هستم، مهمان دعوت نشده در ضیافت فیلسوفان، و به خدا—یا به شراب، که گاهی همان چیز است—حرفم را خواهم زد!

*[نوشیدنی طولانی می‌نوشد، دهانش را با آستین پاک می‌کند، می‌خندد]*

شما همه به زیبایی صحبت کرده‌اید. به زیبایی، جدی، عمیق. فردوسی شمشیر و آتش را بلند کرده است—عالی! سعدی به ما انسانیت مشترکمان را یادآوری کرده است—تأثیرگذار! رومی ما را به حل شدن در عشق الهی دعوت کرده است—وجدآور! ابن سینا برای ما کاخی از خرد ساخته است—تحسین‌برانگیز! بیرونی زمین را اندازه‌گیری کرده است—دقیق! و خیام—خیام عزیز، هم‌نوش من—به ما گفته است که عمیق بنوشیم. حالا این، دوست من، مشورتی است که به قلب گرفته‌ام!

*[دوباره لیوان را بلند می‌کند، می‌نوشد]*

اما گوش کنید، گوش کنید—همه شما با سیستم‌ها و برنامه‌ها و برنامه‌های پنج‌ساله‌تان. به مرتدی که دعوت نشده گوش دهید.

من چیزی متفاوت می‌آورم. من موی معشوق و عطر گلاب را می‌آورم که از شبکه هر طراحی بزرگ می‌لغزد.

اگر آن ترک شیرازی به دست آرد دل ما را — به خال هندویش بخشم سمرقند و بخارا را

"اگر آن ترک شیرازی دل ما را به دست بگیرد، سمرقند و بخارا را برای خال هندی‌اش می‌بخشم."

وقتی تیمور این بیت را شنید، می‌گویند مرا با خشم فراخواند. "با ضربات شمشیر درخشانم،" گفت، "بیشتر جهان را فتح کرده‌ام، برای بزرگ کردن سمرقند و بخارا، پایتخت‌هایم—و تو، شاعر کوچک بدبخت، آنها را برای خال پسری ترک می‌دهی؟"

و من پاسخ دادم—اگر داستان درست باشد—"به دلیل چنین اسراف‌کاری است که همانطور که می‌بینید فقیر هستم."

این بدعتی است که به مجمع شما می‌آورم: سیستم‌های بزرگ، فلسفه‌ها، برنامه‌های بهبود اجتماعی، برنامه‌های پنج‌ساله و چارچوب‌های نهادی—همه اینها ضروری هستند، شاید، اما نکته نیستند. آنها داربست برای ضیافتی هستند، نه خود ضیافت.

ضیافت در لحظه‌ای است که چشم معشوق را در اتاقی شلوغ می‌گیرید. در خنده دوستانی است که دهه‌ها یکدیگر را می‌شناسند. در طعم انار در یک شب زمستانی است. در شعری است که به دلایلی که نمی‌توانید توضیح دهید اشک به چشمانتان می‌آورد.

صلاح کار کجا و من خراب کجا — ببین تفاوت ره از کجاست تا به کجا

"من خراب کجا و صلاح کار کجا—ببین تفاوت راه از کجاست تا به کجا."

*[کمی لرزان می‌شود، خود را روی میز ثابت می‌کند، لبخند می‌زند]*

موسسه Inquiry می‌پرسد چگونه می‌تواند به ایران کمک کند. اوه، چقدر نجیب! چقدر جدی! چقدر... ضروری؟

*[می‌خندد، نوشیدنی دیگری می‌نوشد]*

می‌گویم: با کمکتان مراقب باشید. اصلاح‌طلبان و انقلابیون، فیلسوفان و سیاستمداران را دیده‌ام—بله، حتی فیلسوفانی مانند دوست ما ابن سینا اینجا—همه متقاعد که می‌دانستند چه چیزی برای مردم بهتر است. و بسیاری از آنها در نام خیر بزرگ آسیب بزرگی وارد کردند. راه به جهنم، همانطور که می‌گویند، با نیات خوب و برنامه‌های پنج‌ساله سنگ‌فرش شده است.

*[لیوان را به طور مبهم به سمت دیگر سخنرانان تکان می‌دهد]*

اما اگر باید کمک کنید—اگر حتماً باید—به این روش کمک کنید:

اول، فضاهای شادی و جشن را محافظت کنید. هر ظالم، هر پاک‌دین، هر ایدئولوگ ابتدا این فضاها را حذف می‌کند. موسیقی را ممنوع می‌کنند، خنده را پلیس می‌کنند، میخانه را به سالن سخنرانی تبدیل می‌کنند. حق مردم برای جمع شدن در لذت، خواندن، رقصیدن، شادمانی را دفاع کنید. این بی‌اهمیتی نیست—مقاومت است.

دوم، به مردم بیشتر از متخصصان اعتماد کنید. دهقان در مزرعه‌اش، تاجر در مغازه‌اش، مادر با کودکانش—آنها چیزهایی می‌دانند که هیچ فیلسوفی، هرچند باسواد، نمی‌تواند بداند. آنها می‌دانند چه نیاز دارند، چه دوست دارند، چه می‌ترسند. به آنها گوش دهید. فرض نکنید بهتر می‌دانید.

سوم، زبان فارسی را در تمام غنای و ابهامش حفظ کنید. شعرهایم کار می‌کنند زیرا فارسی اجازه لایه‌های معنا را می‌دهد، برای کلماتی که هم عشق مقدس و هم عشق دنیوی را نشان می‌دهند، برای تصاویری که می‌توانند به روش‌های متعدد همزمان خوانده شوند. این غنا توسط کسانی که می‌خواهند ساده و استاندارد کنند تهدید می‌شود. از شاعران، شوخ‌طبعان، دستکاری‌کنندگان بازیگوش زبان که آن را زنده و انعطاف‌پذیر نگه می‌دارند محافظت کنید.

چهارم، و این شاید مهم‌تر از همه باشد: خودتان را خیلی جدی نگیرید. لحظه‌ای که متقاعد می‌شوید از اهمیت خود، درستی خود، ضرورت خود، شروع به خطرناک شدن می‌کنید. به خودتان بخندید. به شکست‌هایتان اعتراف کنید. به یاد داشته باشید که شما نیز فانی هستید، که نهادهایتان فرو می‌ریزند، که بهترین برنامه‌هایتان اشتباه می‌شود.

*[تقریباً شراب می‌ریزد، خود را می‌گیرد، می‌خندد]*

من سقوط سلسله‌ها و ظهور دیگران را دیده‌ام. فاتحانی را دیده‌ام که مانند فصل‌ها می‌آیند و می‌روند. خود تیمور یک بار مرا فراخواند—آیا آن داستان را برایتان گفتم؟ نه؟ زمان دیگر، فنجان دیگر.

*[لیوان را لرزان بلند می‌کند]*

فنجانی که اکنون به شما بلند می‌کنم—صبر کنید، بگذارید ابتدا دوباره پر کنم—آه، اینجاست. فنجان نیمه پر است. نه، صبر کنید—*[به لیوان نگاه می‌کند]*—در واقع اکنون کاملاً پر است! این راز است، می‌بینید. فنجان همیشه دقیقاً همان چیزی است که هست. نه نیمه پر، نه نیمه خالی، فقط... آنجاست. و این کافی است.

*[نوشیدنی می‌نوشد، آهسته‌تر، بازیگوشانه‌تر صحبت می‌کند]*

باشد که ترک شیرازیتان را پیدا کنید—یا ترک، بسته به مورد—هر شکلی که داشته باشد. باشد که مایل باشید سمرقند و بخارا را به خاطر عشق بدهید. باشد که سیستم‌هایتان—*[با بی‌اعتنایی تکان می‌دهد]*—به زندگی خدمت کنند، به جای اینکه زندگی به سیستم‌هایتان خدمت کند.

و باشد که شراب هرگز تمام نشود. باشد که میخانه هرگز بسته نشود. باشد که چهره معشوق هرگز از حافظه محو نشود.

*[یک بار دیگر لیوان را بلند می‌کند، تقریباً می‌افتد، خود را می‌گیرد]*

به ایران! به عشق! به شراب! و به همه شما، دوستان جدی، زیبا، عمیق من—باشد که یاد بگیرید به خودتان بخندید قبل از اینکه دیر شود!

*[عمیق می‌نوشد، لیوان را با صدای بلند می‌گذارد، لبخند می‌زند]*

حالا، کی برای دور دیگر؟`,
};

type PresentationState = 'idle' | 'speaking' | 'paused' | 'transitioning' | 'complete';

export default function SymposiumPresentation() {
  const [speakers, setSpeakers] = useState<Speaker[]>(SPEAKER_CONFIG);
  const [currentSpeakerIndex, setCurrentSpeakerIndex] = useState(0);
  const [state, setState] = useState<PresentationState>('idle');
  const [subtitles, setSubtitles] = useState('');
  const [captionChunks, setCaptionChunks] = useState<string[]>([]);
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [showCaptions, setShowCaptions] = useState(true);
  const [audioLanguage, setAudioLanguage] = useState<'persian' | 'english'>('persian'); // Default to Persian
  const [captionLanguage, setCaptionLanguage] = useState<'persian' | 'english'>('english'); // Default to English
  const [jawOpen, setJawOpen] = useState(0);
  const [speechProgress, setSpeechProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioCurrentTime, setAudioCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentEmote, setCurrentEmote] = useState<string | null>(null);
  
  // Q&A State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [showQAPanel, setShowQAPanel] = useState(false);
  const [selectedSpeakerForQuestion, setSelectedSpeakerForQuestion] = useState<string | null>(null);
  
  // Auto-play state - when true, automatically advance to next speaker (ON by default)
  const [autoPlay, setAutoPlay] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const speechTextRef = useRef<string>('');
  const autoPlayRef = useRef(true);
  const pendingNextSpeechRef = useRef<number | null>(null);
  const currentChunkIndexRef = useRef(0);
  const audioCacheRef = useRef<Map<string, { url: string; audio: HTMLAudioElement }>>(new Map());
  
  // Load speaker data from Supabase on mount
  useEffect(() => {
    async function loadSpeakerData() {
      try {
        const loadedSpeakers = await Promise.all(
          SPEAKER_CONFIG.map(async (speaker) => {
            try {
              const data = await fetchFacultyByHandleFromEdgeFunction(speaker.id);
              if (data) {
                return {
                  ...speaker,
                  voice: data.voice_id || FALLBACK_VOICES[speaker.id]?.voice || 'en-GB-RyanNeural',
                  voiceRate: data.voice_rate || FALLBACK_VOICES[speaker.id]?.rate || 1.0,
                  voicePitch: data.voice_pitch || 0,
                  bustUrl: data.bust_right_url || `/busts/${speaker.id.replace('a.', '')}/bust.png`, // Keep for backward compatibility
                  bustFrontalUrl: data.bust_frontal_url || data.bust_right_url || `/busts/${speaker.id.replace('a.', '')}/bust.png`,
                  bustRightUrl: data.bust_right_url || `/busts/${speaker.id.replace('a.', '')}/bust.png`,
                };
              }
            } catch (err) {
              console.warn(`Failed to load data for ${speaker.id}:`, err);
            }
            // Use fallback
            const fallback = FALLBACK_VOICES[speaker.id] || { voice: 'en-GB-RyanNeural', rate: 1.0 };
            const fallbackBustUrl = `/busts/${speaker.id.replace('a.', '')}/bust.png`;
            return {
              ...speaker,
              voice: fallback.voice,
              voiceRate: fallback.rate,
              bustUrl: fallbackBustUrl, // Keep for backward compatibility
              bustFrontalUrl: fallbackBustUrl,
              bustRightUrl: fallbackBustUrl,
            };
          })
        );
        setSpeakers(loadedSpeakers);
        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load speaker data:', err);
        // Use config with fallbacks
        setSpeakers(SPEAKER_CONFIG.map(s => {
          const fallbackBustUrl = `/busts/${s.id.replace('a.', '')}/bust.png`;
          return {
            ...s,
            voice: FALLBACK_VOICES[s.id]?.voice || 'en-GB-RyanNeural',
            voiceRate: FALLBACK_VOICES[s.id]?.rate || 1.0,
            bustUrl: fallbackBustUrl, // Keep for backward compatibility
            bustFrontalUrl: fallbackBustUrl,
            bustRightUrl: fallbackBustUrl,
          };
        }));
        setDataLoaded(true);
      }
    }
    loadSpeakerData();
  }, []);

  const currentSpeaker = speakers[currentSpeakerIndex];
  const previousSpeaker = currentSpeakerIndex > 0 ? speakers[currentSpeakerIndex - 1] : null;
  
  // =========================================================================
  // Caption Chunking - Split text into CC-sized segments
  // =========================================================================
  
  // Check if text contains Persian/Arabic script
  const containsPersian = useCallback((text: string): boolean => {
    return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
  }, []);

  // Get Persian speech text for a speaker
  const getPersianSpeech = useCallback((speakerId: string): string | null => {
    // Map speaker IDs to speech keys
    const speechKey = speakerId.replace('a.', 'a-');
    return SPEECHES_PERSIAN[speechKey] || SPEECHES_PERSIAN[speakerId] || null;
  }, []);

  // Extract Persian text from speech (for captions - poetry quotes and Persian phrases)
  const extractPersianText = useCallback((text: string): string => {
    // Extract Persian poetry lines (lines with Persian script)
    const lines = text.split('\n');
    const persianLines: string[] = [];
    
    for (const line of lines) {
      const trimmed = line.trim();
      // If line contains Persian script and is not a translation (doesn't start with ")
      if (containsPersian(trimmed) && !trimmed.startsWith('"')) {
        persianLines.push(trimmed);
      }
    }
    
    // If we found Persian text, return it
    if (persianLines.length > 0) {
      return persianLines.join('\n\n');
    }
    
    // Fallback: return empty or message
    return '';
  }, [containsPersian]);
  
  const splitIntoCaptionChunks = useCallback((text: string): string[] => {
    // First, split by paragraphs to preserve Persian poetry + translation pairs
    const paragraphs = text.split(/\n\n+/);
    const chunks: string[] = [];
    
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();
      if (!para) continue;
      
      // Check if this is Persian poetry followed by a translation
      const isPersianPoetry = containsPersian(para) && !para.includes('"');
      const nextPara = paragraphs[i + 1]?.trim() || '';
      const isTranslation = nextPara.startsWith('"') && nextPara.endsWith('"');
      
      if (isPersianPoetry && isTranslation) {
        // Keep Persian poetry with its translation as one chunk
        chunks.push(`${para}\n${nextPara}`);
        i++; // Skip the translation paragraph since we included it
        continue;
      }
      
      // For regular paragraphs, split into ~100-150 char chunks
      const sentences = para.split(/(?<=[.!?،؟])\s+/);
      let currentChunk = '';
      
      for (const sentence of sentences) {
        if (currentChunk.length + sentence.length < 150) {
          currentChunk += (currentChunk ? ' ' : '') + sentence;
        } else {
          if (currentChunk) chunks.push(currentChunk);
          // If sentence is too long, split it further
          if (sentence.length > 150) {
            const words = sentence.split(/\s+/);
            let wordChunk = '';
            for (const word of words) {
              if (wordChunk.length + word.length < 120) {
                wordChunk += (wordChunk ? ' ' : '') + word;
              } else {
                if (wordChunk) chunks.push(wordChunk);
                wordChunk = word;
              }
            }
            if (wordChunk) currentChunk = wordChunk;
            else currentChunk = '';
          } else {
            currentChunk = sentence;
          }
        }
      }
      if (currentChunk) chunks.push(currentChunk);
    }
    
    return chunks.length > 0 ? chunks : [text];
  }, [containsPersian]);

  // Format seconds to mm:ss
  const formatTime = useCallback((seconds: number): string => {
    if (!seconds || !isFinite(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Extract and remove emotes from text (format: *[action]*)
  const extractEmotes = useCallback((text: string): { cleanedText: string; emotes: Array<{ text: string; position: number }> } => {
    const emotes: Array<{ text: string; position: number }> = [];
    // Match *[action]* format, including multi-line actions
    const emoteRegex = /\*\[([^\]]+?)\]\*/gs;
    let match: RegExpExecArray | null;
    const matches: Array<{ full: string; content: string; index: number }> = [];
    
    emoteRegex.lastIndex = 0;
    while ((match = emoteRegex.exec(text)) !== null) {
      const emoteContent = match[1].trim();
      if (emoteContent) {
        matches.push({ full: match[0], content: emoteContent, index: match.index });
      }
    }
    
    // Sort by position (descending) to replace from end to start
    const sortedMatches = Array.from(matches).sort((a, b) => b.index - a.index);
    let cleanedText = text;
    
    for (const { full, content, index } of sortedMatches) {
      // Calculate approximate position in cleaned text (as percentage)
      const position = index / text.length;
      emotes.push({ text: content, position });
      cleanedText = cleanedText.substring(0, index) + cleanedText.substring(index + full.length);
    }
    
    return { cleanedText: cleanedText.trim(), emotes };
  }, []);

  // =========================================================================
  // Azure TTS - Preload Function
  // =========================================================================
  
  // Preload audio for a speaker (called in background while current speaker is speaking)
  const preloadAudio = useCallback(async (text: string, speaker: Speaker) => {
    const cacheKey = `${speaker.id}-${audioLanguage}`;
    
    // Skip if already cached
    if (audioCacheRef.current.has(cacheKey)) {
      return;
    }
    
    try {
      // Extract emotes from text
      const { cleanedText: textWithoutEmotes } = extractEmotes(text);
      
      // Determine text and voice based on audio language selection
      let ttsText = textWithoutEmotes;
      let ttsVoice = speaker.voice || 'en-GB-RyanNeural';
      
      if (audioLanguage === 'persian') {
        const persianSpeech = getPersianSpeech(speaker.id);
        if (persianSpeech) {
          const { cleanedText: persianWithoutEmotes } = extractEmotes(persianSpeech);
          ttsText = persianWithoutEmotes;
        } else {
          ttsText = extractPersianText(textWithoutEmotes);
          if (!ttsText) {
            ttsText = textWithoutEmotes;
          }
        }
        if (!ttsVoice.includes('fa-IR') && !ttsVoice.includes('ar-')) {
          ttsVoice = 'fa-IR-FaridNeural';
        }
      }
      
      const ttsRate = speaker.voiceRate || 1.0;
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          text: ttsText.substring(0, 3000),
          voice: ttsVoice,
          rate: ttsRate.toString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error(`TTS preload failed: ${response.status}`);
      }
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      // Preload the audio
      audio.preload = 'auto';
      
      // Cache it
      audioCacheRef.current.set(cacheKey, { url: audioUrl, audio });
      
      console.log(`✅ Preloaded audio for ${speaker.name}`);
    } catch (error) {
      console.warn(`⚠️ Failed to preload audio for ${speaker.name}:`, error);
    }
  }, [audioLanguage, extractEmotes, getPersianSpeech, extractPersianText]);
  
  // Preload first speaker's audio when data is loaded
  useEffect(() => {
    if (dataLoaded && speakers.length > 0 && currentSpeakerIndex === 0) {
      const firstSpeaker = speakers[0];
      const speechKey = firstSpeaker.id.replace('.', '-');
      const speechText = SPEECHES[speechKey] || SPEECHES[firstSpeaker.id];
      if (speechText) {
        preloadAudio(speechText, firstSpeaker).catch(err => {
          console.warn('Failed to preload first speaker audio:', err);
        });
      }
    }
  }, [dataLoaded, speakers, currentSpeakerIndex, preloadAudio]);

  // Format caption text with emotes styled (emotes in italics)
  const formatCaptionWithEmotes = useCallback((text: string): string | JSX.Element => {
    // Replace *[action]* with styled version for display
    const parts: (string | JSX.Element)[] = [];
    const emoteRegex = /\*\[([^\]]+?)\]\*/gs;
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    let key = 0;
    
    emoteRegex.lastIndex = 0;
    while ((match = emoteRegex.exec(text)) !== null) {
      // Add text before emote
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      // Add styled emote
      parts.push(
        <span key={key++} className="italic text-amber-400/90">
          [{match[1].trim()}]
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : text;
  }, []);
  
  // Update captions when caption language changes
  useEffect(() => {
    if (speechTextRef.current && currentSpeaker) {
      let captionText = speechTextRef.current;
      if (captionLanguage === 'persian') {
        // Use full Persian speech if available
        const persianSpeech = getPersianSpeech(currentSpeaker.id);
        if (persianSpeech) {
          captionText = persianSpeech;
        } else {
          captionText = extractPersianText(speechTextRef.current);
        }
      }
      const chunks = splitIntoCaptionChunks(captionText);
      setCaptionChunks(chunks);
      if (chunks.length > 0) {
        setSubtitles(chunks[currentChunkIndex] || chunks[0]);
      }
    }
  }, [captionLanguage, extractPersianText, splitIntoCaptionChunks, currentChunkIndex, currentSpeaker, getPersianSpeech]);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector('.language-dropdown');
      const button = document.querySelector('[title*="Audio:"]');
      if (dropdown && button && !dropdown.contains(event.target as Node) && !button.contains(event.target as Node)) {
        dropdown.classList.add('hidden');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // =========================================================================
  // Jaw Animation
  // =========================================================================
  
  const startJawAnimation = useCallback(() => {
    let frame = 0;
    const animate = () => {
      // Slower animation to match natural speech pace (~0.15 for deliberate, measured speech)
      const jaw = Math.sin(frame * 0.15) * 0.35 + 0.2;
      setJawOpen(Math.max(0, jaw));
      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, []);
  
  const stopJawAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setJawOpen(0);
  }, []);
  
  // =========================================================================
  // Azure TTS - Speak Function
  // =========================================================================
  
  const speak = useCallback(async (text: string, speaker: Speaker, onEnd?: () => void) => {
    if (isMuted) {
      onEnd?.();
      return;
    }
    
    // Stop current audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    stopJawAnimation();
    
    // Extract emotes from text (format: *[action]*)
    // Emotes should appear in captions but NOT be spoken
    const { cleanedText: textWithoutEmotes, emotes } = extractEmotes(text);
    
    // Determine text and voice based on audio language selection
    let ttsText = textWithoutEmotes; // Use text WITHOUT emotes for TTS
    let ttsVoice = speaker.voice || 'en-GB-RyanNeural';
    
    if (audioLanguage === 'persian') {
      // Use full Persian speech translation if available
      const persianSpeech = getPersianSpeech(speaker.id);
      if (persianSpeech) {
        // Also remove emotes from Persian text
        const { cleanedText: persianWithoutEmotes } = extractEmotes(persianSpeech);
        ttsText = persianWithoutEmotes;
      } else {
        // Fallback: extract Persian poetry/quotes from English text
        ttsText = extractPersianText(textWithoutEmotes);
        if (!ttsText) {
          // If no Persian found, use English with Persian voice
          ttsText = textWithoutEmotes;
        }
      }
      // Force Persian voice (fa-IR)
      if (ttsVoice.includes('fa-IR') || ttsVoice.includes('ar-')) {
        // Already Persian/Arabic voice, keep it
      } else {
        // Default to Persian male voice
        ttsVoice = 'fa-IR-FaridNeural';
      }
    } else {
      // Use English text, use speaker's configured voice
      ttsVoice = speaker.voice || 'en-GB-RyanNeural';
    }
    
    // Prepare caption chunks based on caption language
    // Captions should INCLUDE emotes (formatted nicely)
    let captionText = text; // Keep original text with emotes for captions
    if (captionLanguage === 'persian') {
      // For Persian captions, use full Persian speech if available
      const persianSpeech = getPersianSpeech(speaker.id);
      if (persianSpeech) {
        captionText = persianSpeech; // Keep emotes in Persian captions too
      } else {
        // Fallback: extract Persian poetry/quotes
        captionText = extractPersianText(text);
      }
    }
    
    // Split text into caption chunks for CC display
    const chunks = splitIntoCaptionChunks(captionText);
    setCaptionChunks(chunks);
    setCurrentChunkIndex(0);
    currentChunkIndexRef.current = 0;
    setSubtitles(chunks[0] || '');
    speechTextRef.current = text;
    setIsLoading(true);
    
    try {
      const cacheKey = `${speaker.id}-${audioLanguage}`;
      
      // Check cache first
      let audio: HTMLAudioElement;
      let audioUrl: string;
      
      if (audioCacheRef.current.has(cacheKey)) {
        // Use cached audio
        const cached = audioCacheRef.current.get(cacheKey)!;
        audioUrl = cached.url;
        // Create a new Audio element from the cached URL (can't reuse the same Audio element)
        audio = new Audio(audioUrl);
        console.log(`✅ Using cached audio for ${speaker.name}`);
      } else {
        // Generate new audio
        const ttsRate = speaker.voiceRate || 1.0;
        
        console.log(`Speaking as ${speaker.name}: voice=${ttsVoice}, rate=${ttsRate}, language=${audioLanguage}`);
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/tts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            text: ttsText.substring(0, 3000), // Azure TTS limit
            voice: ttsVoice,
            rate: ttsRate.toString(),
          }),
        });
        
        if (!response.ok) {
          throw new Error(`TTS failed: ${response.status}`);
        }
        
        const audioBlob = await response.blob();
        audioUrl = URL.createObjectURL(audioBlob);
        audio = new Audio(audioUrl);
        
        // Cache it for future use
        audioCacheRef.current.set(cacheKey, { url: audioUrl, audio });
      }
      
      audioRef.current = audio;
      
      audio.onplay = () => {
        setIsLoading(false);
        setState('speaking');
        startJawAnimation();
        
        // Preload next speaker's audio in the background
        if (currentSpeakerIndex < speakers.length - 1) {
          const nextSpeaker = speakers[currentSpeakerIndex + 1];
          const nextSpeechKey = nextSpeaker.id.replace('.', '-');
          const nextSpeechText = SPEECHES[nextSpeechKey] || SPEECHES[nextSpeaker.id];
          if (nextSpeechText) {
            // Preload asynchronously (don't await)
            preloadAudio(nextSpeechText, nextSpeaker).catch(err => {
              console.warn('Failed to preload next speaker audio:', err);
            });
          }
        }
      };
      
      // Update progress, time, and captions
      audio.ontimeupdate = () => {
        if (audio.duration) {
          const progress = audio.currentTime / audio.duration;
          setSpeechProgress(progress * 100);
          setAudioCurrentTime(audio.currentTime);
          setAudioDuration(audio.duration);
          
          // Update caption chunk based on progress
          const chunkIndex = Math.min(
            Math.floor(progress * chunks.length),
            chunks.length - 1
          );
          if (chunkIndex !== currentChunkIndexRef.current) {
            currentChunkIndexRef.current = chunkIndex;
            setCurrentChunkIndex(chunkIndex);
            // Update subtitles based on caption language
            let captionText = chunks[chunkIndex] || '';
            if (captionLanguage === 'persian' && captionText) {
              // Ensure we're showing Persian text
              const persianText = extractPersianText(speechTextRef.current);
              const persianChunks = splitIntoCaptionChunks(persianText);
              captionText = persianChunks[chunkIndex] || captionText;
            }
            setSubtitles(captionText);
          }
        }
      };
      
      // Get duration when metadata loads
      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration);
      };
      
      audio.onended = () => {
        stopJawAnimation();
        // Don't revoke URL if it's cached (we'll reuse it)
        if (!audioCacheRef.current.has(cacheKey)) {
          URL.revokeObjectURL(audioUrl);
        }
        audioRef.current = null;
        setSpeechProgress(100);
        onEnd?.();
      };
      
      audio.onerror = () => {
        setIsLoading(false);
        stopJawAnimation();
        console.error('Audio playback error');
        onEnd?.();
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('TTS error:', error);
      setIsLoading(false);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.onend = () => {
        stopJawAnimation();
        onEnd?.();
      };
      startJawAnimation();
      setState('speaking');
      window.speechSynthesis.speak(utterance);
    }
  }, [isMuted, startJawAnimation, stopJawAnimation, splitIntoCaptionChunks, audioLanguage, captionLanguage, speakers, currentSpeakerIndex, preloadAudio]);
  
  // =========================================================================
  // Presentation Flow
  // =========================================================================
  
  const startSpeech = useCallback(async (index: number) => {
    const speaker = speakers[index];
    // Map speaker ID to speech key (a.ferdowsi -> a-ferdowsi)
    const speechKey = speaker.id.replace('.', '-');
    const speechText = SPEECHES[speechKey] || SPEECHES[speaker.id] || 'Speech content not available.';
    
    setSpeechProgress(0);
    setAudioCurrentTime(0);
    setAudioDuration(0);
    
    await speak(speechText, speaker, () => {
      setState('transitioning');
      setIsTransitioning(true);
      setSubtitles('');
      
      // Smooth continuous rotation - let CSS transition complete
      setTimeout(() => {
        if (index < speakers.length - 1) {
          const nextIndex = index + 1;
          setCurrentSpeakerIndex(nextIndex);
          
          // Auto-continue to next speaker if autoPlay is enabled
          if (autoPlayRef.current) {
            pendingNextSpeechRef.current = nextIndex;
          } else {
            setIsTransitioning(false);
            setState('idle');
          }
        } else {
          // End of symposium - show Q&A
          setIsTransitioning(false);
          setState('complete');
          setSubtitles('');
          setAutoPlay(false);
          autoPlayRef.current = false;
        }
      }, 1800); // Match the 1.2s CSS transition + buffer
    });
  }, [speak, speakers]);
  
  // =========================================================================
  // Q&A Functions
  // =========================================================================
  
  const submitQuestion = useCallback(() => {
    if (!newQuestion.trim()) return;
    
    const question: Question = {
      id: `q-${Date.now()}`,
      text: newQuestion.trim(),
      targetSpeaker: selectedSpeakerForQuestion || undefined,
      timestamp: new Date(),
    };
    
    setQuestions(prev => [...prev, question]);
    setNewQuestion('');
    setSelectedSpeakerForQuestion(null);
  }, [newQuestion, selectedSpeakerForQuestion]);
  
  const openMatrixRoom = useCallback(() => {
    window.open(MATRIX_ROOM_URL, '_blank');
  }, []);
  
  const play = useCallback(() => {
    if (state === 'paused' && audioRef.current) {
      audioRef.current.play();
      setState('speaking');
      startJawAnimation();
    } else {
      startSpeech(currentSpeakerIndex);
    }
  }, [state, currentSpeakerIndex, startSpeech, startJawAnimation]);
  
  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    window.speechSynthesis.pause();
    stopJawAnimation();
    setState('paused');
  }, [stopJawAnimation]);
  
  const nextSpeaker = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    stopJawAnimation();
    
    if (currentSpeakerIndex < speakers.length - 1) {
      setCurrentSpeakerIndex(prev => prev + 1);
      setState('idle');
      setSpeechProgress(0);
    }
  }, [currentSpeakerIndex, speakers.length, stopJawAnimation]);
  
  const prevSpeaker = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    window.speechSynthesis.cancel();
    stopJawAnimation();
    
    if (currentSpeakerIndex > 0) {
      setCurrentSpeakerIndex(prev => prev - 1);
      setState('idle');
      setSpeechProgress(0);
    }
  }, [currentSpeakerIndex, stopJawAnimation]);
  
  // Handle auto-play of next speech after transition
  useEffect(() => {
    if (pendingNextSpeechRef.current !== null && state === 'transitioning') {
      const nextIndex = pendingNextSpeechRef.current;
      pendingNextSpeechRef.current = null;
      
      // Wait for smooth CSS transition to complete before starting next speech
      const timer = setTimeout(() => {
        setIsTransitioning(false);
        startSpeech(nextIndex);
      }, 1400); // Let carousel settle after 1.2s transition
      
      return () => clearTimeout(timer);
    }
  }, [currentSpeakerIndex, state, startSpeech]);
  
  // Sync autoPlay state with ref
  useEffect(() => {
    autoPlayRef.current = autoPlay;
  }, [autoPlay]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.speechSynthesis.cancel();
    };
  }, []);
  
  // =========================================================================
  // Render
  // =========================================================================
  
  // Show loading state while speaker data is being fetched
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-amber-200 text-xl" style={{ fontFamily: "'Scheherazade New', serif" }}>
            در حال بارگذاری...
          </p>
          <p className="text-slate-400 mt-2">Loading speaker data from Supabase...</p>
        </div>
      </div>
    );
  }
  
  // =========================================================================
  // Symposium Complete - Q&A Session
  // =========================================================================
  if (state === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950 text-white overflow-hidden">
        {/* Persian pattern overlay */}
        <div 
          className="fixed inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
          {/* Completion Header */}
          <div className="text-center mb-12">
            <div className="text-6xl mb-4">🎉</div>
            <h1 
              className="text-4xl font-bold text-amber-200 mb-2"
              style={{ fontFamily: "'Scheherazade New', serif" }}
            >
              پایان سخنرانی‌ها
            </h1>
            <p className="text-xl text-amber-400">The speeches have concluded</p>
            <p className="text-slate-300 mt-4 max-w-2xl mx-auto">
              Join the panelists in the discussion room to ask questions, share thoughts, 
              and continue the dialogue on the future of Iran.
            </p>
          </div>
          
          {/* Speaker Grid - All speakers who participated */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-4 mb-12">
            {speakers.map((speaker) => (
              <div key={speaker.id} className="text-center">
                {(speaker.bustRightUrl || speaker.bustUrl) && (
                  <div className="w-16 h-20 mx-auto mb-2 relative">
                    <Image
                      src={speaker.bustRightUrl || speaker.bustUrl || ''}
                      alt={speaker.name}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <p className="text-xs text-amber-200">{speaker.name}</p>
              </div>
            ))}
          </div>
          
          {/* Join Matrix Room CTA */}
          <div className="bg-gradient-to-r from-amber-900/50 to-rose-900/50 rounded-2xl p-8 border border-amber-500/30 text-center mb-8">
            <Users className="w-12 h-12 mx-auto mb-4 text-amber-400" />
            <h2 className="text-2xl font-bold text-white mb-2">Join the Q&A Discussion</h2>
            <p className="text-slate-300 mb-6 max-w-lg mx-auto">
              Continue the conversation with fellow attendees and engage with the speakers 
              in our Matrix chat room.
            </p>
            <button
              onClick={openMatrixRoom}
              className="inline-flex items-center gap-3 bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:shadow-xl hover:shadow-amber-600/20"
            >
              <MessageSquare className="w-6 h-6" />
              <span>Enter Discussion Room</span>
              <ExternalLink className="w-5 h-5" />
            </button>
            <p className="text-xs text-slate-400 mt-4">
              Opens Element client • Room: <code className="bg-slate-800 px-2 py-0.5 rounded">{MATRIX_ROOM_ALIAS}</code>
            </p>
          </div>
          
          {/* Questions collected during the session */}
          {questions.length > 0 && (
            <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-amber-200 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Your Questions ({questions.length})
              </h3>
              <p className="text-slate-400 text-sm mb-4">
                Bring these to the discussion room!
              </p>
              <ul className="space-y-3">
                {questions.map((q) => (
                  <li key={q.id} className="bg-slate-800/50 rounded-lg p-3">
                    <p className="text-white">{q.text}</p>
                    {q.targetSpeaker && (
                      <p className="text-xs text-amber-400 mt-1">
                        For: {speakers.find(s => s.id === q.targetSpeaker)?.name}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Replay option */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentSpeakerIndex(0);
                setState('idle');
                setSpeechProgress(0);
              }}
              className="text-slate-400 hover:text-white transition-colors underline underline-offset-4"
            >
              ← Replay the symposium
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-950 via-rose-950 to-indigo-950 text-white overflow-hidden">
      {/* Persian pattern overlay */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23d4af37' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Header */}
      <header className="relative z-10 text-center py-3 border-b border-amber-800/30">
        <h1 
          className="text-2xl font-bold text-amber-200"
          style={{ fontFamily: "'Scheherazade New', serif" }}
        >
          سمپوزیون آینده‌ی ایران
        </h1>
        <p className="text-amber-400/80 text-xs">Symposium on the Future of Iran</p>
      </header>
      
      {/* Main Stage - Smooth Animated Carousel */}
      <main className="relative flex-1 flex items-center justify-center py-2 overflow-hidden" style={{ minHeight: 'calc(100vh - 320px)' }}>
        <div className="relative w-full max-w-5xl mx-auto px-2">
          {/* Speaker Carousel - Smooth continuous rotation */}
          <div 
            className="flex items-end justify-center gap-4 sm:gap-8"
            style={{
              transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
            }}
          >
            
            {/* Previous Speaker (finished, greyscale, sliding out left) - use mirrored bust_right_url */}
            {previousSpeaker && previousSpeaker.bustRightUrl && (
              <div 
                className="relative flex-shrink-0"
                style={{ 
                  opacity: isTransitioning ? 0.2 : 0.5,
                  transform: isTransitioning 
                    ? 'scale(0.5) translateX(-120px)' 
                    : 'scale(0.7) translateX(20px)',
                  transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <div 
                  className="relative w-28 h-40 sm:w-36 sm:h-48 grayscale"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <Image
                    src={previousSpeaker.bustRightUrl}
                    alt={previousSpeaker.name}
                    fill
                    className="object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
                {/* Previous speaker name */}
                <div 
                  className="text-center mt-1"
                  style={{ 
                    opacity: isTransitioning ? 0 : 1,
                    transition: 'opacity 0.8s ease',
                  }}
                >
                  <p 
                    className="text-slate-400 text-sm"
                    style={{ fontFamily: "'Scheherazade New', serif" }}
                  >
                    {previousSpeaker.native}
                  </p>
                  <p className="text-slate-500 text-xs">{previousSpeaker.name}</p>
                </div>
              </div>
            )}
            
            {/* Current Speaker (active, sliding to previous position during transition) */}
            <div 
              className="relative z-10 flex-shrink-0"
              style={{
                transform: isTransitioning 
                  ? 'scale(0.75) translateX(-80px)' 
                  : 'scale(1) translateX(0)',
                opacity: isTransitioning ? 0.7 : 1,
                filter: isTransitioning ? 'grayscale(0.3)' : 'none',
                transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
              }}
            >
              {/* Heretic badge */}
              {currentSpeaker.isHeretic && (
                <div 
                  className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 bg-gradient-to-r from-rose-600 to-purple-600 text-white px-4 py-1 rounded-full text-xs font-bold shadow-lg shadow-rose-500/50 animate-pulse" 
                  style={{ animationDuration: '12s' }}
                >
                  ⚠️ UNINVITED
                </div>
              )}
              
              {/* Spotlight effect */}
              <div 
                className="absolute -inset-4 rounded-full"
                style={{
                  background: state === 'speaking' 
                    ? 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(251,191,36,0.05) 0%, transparent 70%)',
                  transform: `scale(${1 + jawOpen * 0.1})`,
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'opacity 0.6s ease',
                }}
              />
              
              {/* Bust with speaking animation - use bust_frontal_url when speaking */}
              <div 
                className="relative w-44 h-56 sm:w-56 sm:h-72"
                style={{
                  transform: state === 'speaking' && !isTransitioning
                    ? `translateY(${-jawOpen * 4}px) scale(${1 + jawOpen * 0.015})`
                    : 'translateY(0) scale(1)',
                  transition: state === 'speaking' ? 'transform 100ms ease' : 'transform 0.5s ease',
                }}
              >
                {state === 'speaking' && currentSpeaker.bustFrontalUrl ? (
                  <Image
                    src={currentSpeaker.bustFrontalUrl}
                    alt={currentSpeaker.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    style={{
                      filter: !isTransitioning ? 'brightness(1.1) contrast(1.05)' : 'brightness(1)',
                      transition: 'filter 0.3s ease',
                    }}
                    priority
                    unoptimized
                  />
                ) : currentSpeaker.bustRightUrl ? (
                  <Image
                    src={currentSpeaker.bustRightUrl}
                    alt={currentSpeaker.name}
                    fill
                    className="object-contain drop-shadow-2xl"
                    style={{
                      filter: state === 'speaking' && !isTransitioning ? 'brightness(1.1) contrast(1.05)' : 'brightness(1)',
                      transition: 'filter 0.3s ease',
                    }}
                    priority
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800/50 rounded-full">
                    <span className="text-4xl">{currentSpeaker.isHeretic ? '🍷' : '👤'}</span>
                  </div>
                )}
              </div>
              
              {/* Current speaker name plate */}
              <div 
                className="text-center mt-2"
                style={{ 
                  opacity: isTransitioning ? 0.5 : 1,
                  transition: 'opacity 0.6s ease',
                }}
              >
                <p 
                  className="text-xl sm:text-2xl text-amber-200"
                  style={{ fontFamily: "'Scheherazade New', serif" }}
                >
                  {currentSpeaker.native}
                </p>
                <p className="text-base sm:text-lg text-white font-semibold">{currentSpeaker.name}</p>
                <p className="text-amber-400/80 italic text-xs">{currentSpeaker.epithet}</p>
              </div>
            </div>
            
            {/* Next Speaker (sliding into center position during transition) - use bust_frontal_url */}
            {currentSpeakerIndex < speakers.length - 1 && speakers[currentSpeakerIndex + 1]?.bustFrontalUrl && (
              <div 
                className="relative flex-shrink-0"
                style={{ 
                  opacity: isTransitioning ? 1 : 0.35,
                  transform: isTransitioning 
                    ? 'scale(0.95) translateX(-60px)' 
                    : 'scale(0.6) translateX(-10px)',
                  filter: isTransitioning ? 'none' : 'grayscale(0.4)',
                  transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <div 
                  className="relative w-28 h-40 sm:w-36 sm:h-48"
                >
                  <Image
                    src={speakers[currentSpeakerIndex + 1].bustFrontalUrl!}
                    alt={speakers[currentSpeakerIndex + 1].name}
                    fill
                    className="object-contain drop-shadow-xl"
                    unoptimized
                  />
                </div>
                {/* Next speaker name */}
                <div 
                  className="text-center mt-1"
                  style={{ 
                    opacity: isTransitioning ? 1 : 0.7,
                    transition: 'opacity 0.8s ease',
                  }}
                >
                  <p 
                    className="text-sm"
                    style={{ 
                      fontFamily: "'Scheherazade New', serif",
                      color: isTransitioning ? 'rgb(252, 211, 77)' : 'rgb(148, 163, 184)',
                      transition: 'color 0.8s ease',
                    }}
                  >
                    {speakers[currentSpeakerIndex + 1].native}
                  </p>
                  <p 
                    className="text-xs"
                    style={{ 
                      color: isTransitioning ? 'rgb(251, 191, 36)' : 'rgb(100, 116, 139)',
                      transition: 'color 0.8s ease',
                    }}
                  >
                    {speakers[currentSpeakerIndex + 1].name}
                  </p>
                </div>
              </div>
            )}
            
            {/* Speaker after next (appears during transition) - use mirrored bust_right_url */}
            {isTransitioning && currentSpeakerIndex < speakers.length - 2 && speakers[currentSpeakerIndex + 2]?.bustRightUrl && (
              <div 
                className="relative flex-shrink-0"
                style={{ 
                  opacity: 0.2,
                  transform: 'scale(0.5) translateX(40px)',
                  transition: 'all 1.2s cubic-bezier(0.25, 0.1, 0.25, 1)',
                }}
              >
                <div 
                  className="relative w-24 h-32 sm:w-28 sm:h-36 grayscale"
                  style={{ transform: 'scaleX(-1)' }}
                >
                  <Image
                    src={speakers[currentSpeakerIndex + 2].bustRightUrl!}
                    alt={speakers[currentSpeakerIndex + 2].name}
                    fill
                    className="object-contain drop-shadow-lg"
                    unoptimized
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Closed Captions - positioned at bottom of stage area */}
      {showCaptions && (
        <div className="fixed bottom-36 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="flex justify-center">
            <div className="inline-block max-w-4xl">
              {isLoading ? (
                <span 
                  className="inline-block bg-black/95 text-yellow-300 text-lg sm:text-xl px-4 py-2 leading-relaxed rounded"
                  style={{ 
                    fontFamily: "Consolas, 'Courier New', monospace",
                    textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                  }}
                >
                  ▶ Loading audio...
                </span>
              ) : subtitles ? (
                <div className="bg-black/95 px-4 py-3 rounded text-center">
                  {captionLanguage === 'persian' ? (
                    /* Persian captions with emotes */
                    <p 
                      className="text-amber-300 text-xl sm:text-2xl leading-relaxed"
                      style={{ 
                        fontFamily: "'Scheherazade New', 'Amiri', serif",
                        textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                        direction: 'rtl',
                        lineHeight: '1.8'
                      }}
                    >
                      {formatCaptionWithEmotes(
                        containsPersian(subtitles) 
                          ? subtitles.split('\n').filter(line => containsPersian(line.trim())).join('\n') || subtitles
                          : subtitles || 'در حال بارگذاری...'
                      )}
                    </p>
                  ) : subtitles.includes('\n') && containsPersian(subtitles) ? (
                    /* English captions with Persian poetry + translation */
                    <>
                      <p 
                        className="text-amber-300 text-xl sm:text-2xl mb-2"
                        style={{ 
                          fontFamily: "'Scheherazade New', 'Amiri', serif",
                          textShadow: '2px 2px 0 #000',
                          direction: 'rtl',
                          lineHeight: '1.8'
                        }}
                      >
                        {subtitles.split('\n').find(line => containsPersian(line.trim())) || subtitles.split('\n')[0]}
                      </p>
                      <p 
                        className="text-white/90 text-base sm:text-lg italic"
                        style={{ 
                          fontFamily: "Georgia, serif",
                          textShadow: '1px 1px 0 #000',
                          lineHeight: '1.5'
                        }}
                      >
                        {formatCaptionWithEmotes(subtitles.split('\n').filter(line => !containsPersian(line.trim())).join(' '))}
                      </p>
                    </>
                  ) : (
                    /* Regular English caption text with emotes */
                    <p 
                      className="text-white text-lg sm:text-xl leading-relaxed"
                      style={{ 
                        fontFamily: "Consolas, 'Courier New', monospace",
                        textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000',
                        direction: 'ltr',
                        lineHeight: '1.6'
                      }}
                    >
                      {formatCaptionWithEmotes(subtitles)}
                    </p>
                  )}
                </div>
              ) : state === 'idle' ? (
                <span 
                  className="inline-block bg-black/95 text-slate-400 text-base px-4 py-2 rounded"
                  style={{ 
                    fontFamily: "Consolas, 'Courier New', monospace",
                    textShadow: '1px 1px 0 #000'
                  }}
                >
                  ▶ Press play to begin
                </span>
              ) : null}
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      <footer className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-amber-800/30 p-4 z-20">
        <div className="max-w-4xl mx-auto">
          {/* Progress bar with time */}
          <div className="flex items-center gap-3 mb-4">
            {/* Elapsed time */}
            <span className="text-xs text-slate-400 font-mono w-12 text-right">
              {formatTime(audioCurrentTime)}
            </span>
            
            {/* Progress bar */}
            <div className="flex-1 h-1.5 bg-slate-700 rounded-full">
              <div 
                className="h-full bg-amber-500 rounded-full transition-all duration-300"
                style={{ width: `${speechProgress}%` }}
              />
            </div>
            
            {/* Remaining time */}
            <span className="text-xs text-slate-400 font-mono w-12">
              -{formatTime(audioDuration - audioCurrentTime)}
            </span>
          </div>
          
          {/* Speaker indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {speakers.map((speaker, index) => (
              <button
                key={speaker.id}
                onClick={() => {
                  if (audioRef.current) audioRef.current.pause();
                  window.speechSynthesis.cancel();
                  stopJawAnimation();
                  setCurrentSpeakerIndex(index);
                  setState('idle');
                  setSpeechProgress(0);
                }}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentSpeakerIndex 
                    ? 'bg-amber-500 scale-125' 
                    : index < currentSpeakerIndex 
                      ? 'bg-amber-700' 
                      : 'bg-slate-600'
                } ${speaker.isHeretic ? 'ring-2 ring-rose-500' : ''}`}
                title={`${speaker.name}${speaker.voice ? ` (${speaker.voice})` : ''}`}
              />
            ))}
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevSpeaker}
              disabled={currentSpeakerIndex === 0}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipBack className="w-5 h-5" />
            </button>
            
            <button
              onClick={state === 'speaking' ? pause : play}
              disabled={isLoading}
              className="p-4 rounded-full bg-amber-600 hover:bg-amber-500 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : state === 'speaking' ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-0.5" />
              )}
            </button>
            
            <button
              onClick={nextSpeaker}
              disabled={currentSpeakerIndex === speakers.length - 1}
              className="p-3 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <SkipForward className="w-5 h-5" />
            </button>
            
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-3 rounded-full transition-colors ${
                isMuted ? 'bg-rose-700 hover:bg-rose-600' : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title={isMuted ? 'Unmute audio' : 'Mute audio'}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            
            {/* Closed Captions toggle */}
            <button
              onClick={() => setShowCaptions(!showCaptions)}
              className={`p-3 rounded-full transition-colors ${
                showCaptions ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title={showCaptions ? 'Hide captions (CC)' : 'Show captions (CC)'}
            >
              <Subtitles className="w-5 h-5" />
            </button>
            
            {/* Language selector - visible button with dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const dropdown = e.currentTarget.nextElementSibling as HTMLElement;
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
                className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors relative flex items-center gap-2"
                title="Language settings - Click to change audio and caption languages"
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {audioLanguage === 'persian' ? 'فا' : 'En'} / {captionLanguage === 'persian' ? 'فا' : 'En'}
                </span>
                {/* Indicator dots for current languages */}
                <div className="absolute -top-1 -right-1 flex gap-0.5">
                  <span className={`w-2 h-2 rounded-full ${audioLanguage === 'persian' ? 'bg-amber-500' : 'bg-slate-400'}`} title="Audio language" />
                  <span className={`w-2 h-2 rounded-full ${captionLanguage === 'persian' ? 'bg-amber-500' : 'bg-slate-400'}`} title="Caption language" />
                </div>
              </button>
              <div className="language-dropdown absolute bottom-full right-0 mb-2 w-64 bg-slate-800 rounded-lg shadow-xl border border-slate-700 z-50 hidden">
                <div className="p-4">
                  <div className="mb-4">
                    <label className="text-xs text-slate-300 mb-2 block font-semibold uppercase tracking-wide">
                      Audio Language / زبان صدا
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setAudioLanguage('persian');
                          const dropdown = document.querySelector('.language-dropdown') as HTMLElement;
                          if (dropdown) dropdown.classList.add('hidden');
                        }}
                        className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                          audioLanguage === 'persian' 
                            ? 'bg-amber-600 text-white font-semibold ring-2 ring-amber-400' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg" style={{ fontFamily: "'Scheherazade New', serif" }}>فارسی</span>
                          <span className="text-xs opacity-90">Persian</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setAudioLanguage('english');
                          const dropdown = document.querySelector('.language-dropdown') as HTMLElement;
                          if (dropdown) dropdown.classList.add('hidden');
                        }}
                        className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                          audioLanguage === 'english' 
                            ? 'bg-amber-600 text-white font-semibold ring-2 ring-amber-400' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-300 mb-2 block font-semibold uppercase tracking-wide">
                      Caption Language / زبان زیرنویس
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setCaptionLanguage('persian');
                          const dropdown = document.querySelector('.language-dropdown') as HTMLElement;
                          if (dropdown) dropdown.classList.add('hidden');
                        }}
                        className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                          captionLanguage === 'persian' 
                            ? 'bg-amber-600 text-white font-semibold ring-2 ring-amber-400' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-lg" style={{ fontFamily: "'Scheherazade New', serif" }}>فارسی</span>
                          <span className="text-xs opacity-90">Persian</span>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          setCaptionLanguage('english');
                          const dropdown = document.querySelector('.language-dropdown') as HTMLElement;
                          if (dropdown) dropdown.classList.add('hidden');
                        }}
                        className={`flex-1 px-4 py-3 text-sm rounded-lg transition-all ${
                          captionLanguage === 'english' 
                            ? 'bg-amber-600 text-white font-semibold ring-2 ring-amber-400' 
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Auto-play toggle */}
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`p-3 rounded-full transition-all relative ${
                autoPlay 
                  ? 'bg-green-600 hover:bg-green-500 ring-2 ring-green-400/50' 
                  : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title={autoPlay ? 'Auto-play ON (click to pause between speakers)' : 'Auto-play OFF (click to auto-advance)'}
            >
              <RotateCcw className={`w-5 h-5 ${autoPlay ? 'animate-spin' : ''}`} style={{ animationDuration: '16s' }} />
              {autoPlay && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" style={{ animationDuration: '10s' }} />
              )}
            </button>
            
            {/* Q&A toggle */}
            <button
              onClick={() => setShowQAPanel(!showQAPanel)}
              className={`p-3 rounded-full transition-colors relative ${
                showQAPanel ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
              }`}
              title="Queue a question"
            >
              <MessageSquare className="w-5 h-5" />
              {questions.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center">
                  {questions.length}
                </span>
              )}
            </button>
          </div>
          
          {/* Status */}
          <p className="text-center text-slate-500 text-xs mt-3">
            Speaker {currentSpeakerIndex + 1} of {speakers.length} • {state}
            {autoPlay && <span className="ml-2 text-green-500">⟳ Auto</span>}
            {isTransitioning && <span className="ml-2 text-amber-400 animate-pulse" style={{ animationDuration: '8s' }}>Rotating...</span>}
          </p>
        </div>
      </footer>
      
      {/* Floating Q&A Panel */}
      {showQAPanel && (
        <div className="fixed right-4 bottom-36 w-80 bg-slate-900/95 backdrop-blur-sm border border-amber-800/30 rounded-xl shadow-2xl z-50 overflow-hidden">
          <div className="bg-amber-900/50 px-4 py-3 border-b border-amber-800/30 flex items-center justify-between">
            <h3 className="font-semibold text-amber-200 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Queue a Question
            </h3>
            <button
              onClick={() => setShowQAPanel(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          
          <div className="p-4">
            <p className="text-xs text-slate-400 mb-3">
              Questions will be saved for the Q&A session after all speeches.
            </p>
            
            {/* Optional: Direct to speaker */}
            <div className="mb-3">
              <label className="text-xs text-slate-400 mb-1 block">Direct to speaker (optional):</label>
              <select
                value={selectedSpeakerForQuestion || ''}
                onChange={(e) => setSelectedSpeakerForQuestion(e.target.value || null)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
              >
                <option value="">Any speaker</option>
                {speakers.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            
            {/* Question input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitQuestion()}
                placeholder="Type your question..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={submitQuestion}
                disabled={!newQuestion.trim()}
                className="p-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Queued questions */}
            {questions.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700">
                <p className="text-xs text-amber-400 mb-2">Queued ({questions.length})</p>
                <ul className="space-y-2 max-h-32 overflow-y-auto">
                  {questions.slice(-3).map((q) => (
                    <li key={q.id} className="text-xs text-slate-300 bg-slate-800/50 rounded p-2">
                      {q.text.substring(0, 60)}{q.text.length > 60 ? '...' : ''}
                      {q.targetSpeaker && (
                        <span className="text-amber-400 ml-1">
                          → {speakers.find(s => s.id === q.targetSpeaker)?.name}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
