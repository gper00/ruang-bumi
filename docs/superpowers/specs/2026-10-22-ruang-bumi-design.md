# Ruang Bumi Design Specification

## 1. Overview

```
Ruang Bumi – site belajar ilmu kebumian Indonesia
```

*Target*: 5 topik MVP, visual interaktif, transparansi sumber, aksesibilitas WCAG 2.2 AA.

## 2. Project Architecture

```
/
├─ src/
│  ├─ content/
│  │  ├─ topik/
│  │  ├─ sumber/sources.yaml
│  │  ├─ dataset/datasets.yaml
│  │  └─ glosarium/istilah.yaml
│  ├─ components/
│  │  ├─ layout/
│  │  ├─ topik/
│  │  ├─ sumber/
│  │  ├─ viz/
│  │  ├─ quiz/
│  │  └─ glosarium/
│  ├─ layouts/TopikLayout.astro
│  ├─ pages/
│  │  ├─ index.astro
│  │  ├─ topik/[...slug].astro
│  │  ├─ kategori/[kategori].astro
│  │  ├─ glosarium.astro
│  │  ├─ sumber.astro
│  │  ├─ tentang.astro
│  │  └─ 404.astro
│  ├─ lib/
│  └─ styles/
├─ data/
│  ├─ raw/
│  ├─ processed/
│  └─ scripts/
├─ scripts/
│  └─ check-sources.mjs
├─ tests/
├─ SPEC.md
├─ CONTENT-GUIDE.md
└─ LICENSE
```

## 3. Tech Stack

| Layer | Technology | Reason |
|-------|------------|--------|
| **Framework** | Astro (stable LTS, pin version) | Static site + islands
| **Content** | MDX + Content Collections + Zod | Proven pattern for Astro
| **Interactivity** | React (v18) | Comfortable ecosystem
| **Mapping** | Leaflet 1.9.4 | Already used in prototype, no tiles
| **Charting** | Observable Plot | Light, functional, used in prototype
| **Animation** | GSAP or CSS | For simple transitions
| **Search** | Pagefind | Zero‑config, light
| **Styling** | CSS Variables + Tailwind | Global theming, utility classes
| **Testing** | Vitest, Playwright, axe | Unit + visual + accessibility
| **Hosting** | Cloudflare Pages | Free, global CDN

## 4. Content Schema (MDX frontmatter)

```
---
pertanyaan: string
slug?: string
kategori: enum('planet-bumi','atmosfer','laut','daratan','ekologi','penutup')
level: enum('pemula','menengah') = pemula
menit: number
jawabanSingkat: string
terkait: string[] (max 6)
sumber: string[] (min 2)
dataset?: string[]
glosarium?: string[]
status: enum('draft','review','terbit') = draft
verifikasi: date
penulis: string = 'gper00'
---
```

The `src/content.config.ts` will expose this schema.

## 5. Component Plan

| Component | Purpose | Props |
|-----------|---------|-------|
| `Layout/Header`, `Footer`, `ThemeToggle`, `Breadcrumb` | Site layout | – |
| `AnswerBox` | Short answer emphasis | `content` |
| `Section` | Generic section wrapper | `title`, `children` |
| `Fact` | Fact list | `items` |
| `RelatedTopics` | Related topik links | `ids` |
| `SourceList` | Attributions | `sumber` array |
| `MapView` | Leaflet wrapper | `layers`, `view`, `dataset`, `caption` |
| `Chart` | Observable Plot wrapper | `dataset`, `config` |
| `Quiz` | Question bank component | `qs: { q, o, a, f }[]` |
| `Term` | Glossary item | `term`, `definition` |

## 6. CI Pipeline

```
ci.yml:
- lint: eslint, prettier, astro check
- test: vitest, playwright
- build: astro build
- deploy: to Cloudflare Pages (on push to main)
```

## 7. Source Verification

All content must include `<Cite>` tags output by custom MDX components. `check-sources.mjs` will ensure no missing source IDs.

## 8. Next Steps

*Create the initial Astro repository and set up the above structure.*

Please review the spec and let me know if you want any changes before I start implementation.
