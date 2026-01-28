# Symposia | سمپوزیا

**A living archive of imagined dialogues between history's great minds.**

<div align="center">

*"In dialogue, thought discovers itself."*

[![License: CC BY-NC-SA 4.0](https://img.shields.io/badge/License-CC%20BY--NC--SA%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/)
[![Deploy to GitHub Pages](https://github.com/InquiryInstitute/symposia/actions/workflows/deploy.yml/badge.svg)](https://github.com/InquiryInstitute/symposia/actions/workflows/deploy.yml)

**[View Live Site →](https://inquiryinstitute.github.io/symposia/)**

</div>

---

## About

**Symposia** is an ongoing project by [Inquiry Institute](https://inquiry.institute) to record and publish imaginary symposia—conversations that never happened but perhaps should have. Using the power of language models and careful historical research, we bring together thinkers across time and tradition to address the questions that shape our world.

These are not predictions or prescriptions. They are *explorations*—attempts to honor the complexity of human thought by staging encounters between minds that, in their own times, grappled with eternal questions.

## Featured Symposia

### 🇮🇷 Symposion-e Āyandeh-ye Irān
**سمپوزیون آینده‌ی ایران**
*Symposium on the Future of Iran*

Seven voices from Persia's intellectual heritage—poets, philosophers, scientists, and a prophet—convene to contemplate the destiny of their civilization.

**Panelists:**
| Speaker | Persian | Role | Era |
|---------|---------|------|-----|
| Ferdowsi | فردوسی | The Epic Voice | c. 940–1020 CE |
| Saʿdi | سعدی | The Moral Compass | c. 1210–1291 CE |
| Hafez | حافظ | The Mystic Heart | c. 1315–1390 CE |
| Rumi | رومی | The Universal Soul | 1207–1273 CE |
| Avicenna | ابن سینا | The Rational Mind | c. 980–1037 CE |
| Al-Biruni | بیرونی | The Scientific Eye | 973–1048 CE |
| Zarathustra ✦ | زرتشت | The Primordial Flame | c. 1500–1000 BCE |

---

## Development

This site is built with [Astro](https://astro.build) and deployed to GitHub Pages.

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
symposia/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages deployment
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro    # Base page layout
│   ├── pages/
│   │   ├── index.astro         # Homepage
│   │   └── ayandeh-ye-iran/    # Iran symposium
│   │       └── index.astro
│   └── styles/
│       └── global.css          # Global styles
├── public/                     # Static assets
├── astro.config.mjs
└── package.json
```

## Philosophy

Each symposium follows certain principles:

1. **Fidelity to Voice** — Each speaker's contributions reflect their known works, philosophical positions, and rhetorical style
2. **Generative Tension** — Disagreement is not avoided but cultivated; truth emerges through dialectic
3. **Temporal Awareness** — Speakers acknowledge the anachronism while transcending it
4. **Multilingual Texture** — Original language fragments are woven throughout to honor the source traditions
5. **Open Questions** — Symposia do not conclude with consensus but with richer questions

## RAG Integration

Speaker personas are stored in the [Inquiry Institute](https://inquiry.institute) faculty database (Supabase) with full persona schemas for RAG-based dialogue generation. Each speaker includes:

- Biographical information
- Research statement and questions
- Conversational posture
- Epistemic stance
- Argumentative mechanics
- Ethical orientation
- Affective envelope
- Cultural context

## Contributing

We welcome scholars, translators, and thoughtful contributors who wish to:
- Propose new symposia topics
- Improve speaker characterizations with textual evidence
- Translate content into other languages
- Create derivative artistic works

## License

This work is licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-nc-sa/4.0/).

---

<div align="center">

*An [Inquiry Institute](https://inquiry.institute) Project*

**سخن‌گو که با سخن دانش آید**
*Speak, for through speech comes wisdom*

</div>
