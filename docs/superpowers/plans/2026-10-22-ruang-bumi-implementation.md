# Ruang Bumi MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the MVP of "Ruang Bumi" with 5 initial topics and the foundation for interactivity.

**Architecture:** Astro for content, React for interactivity islands, Leaflet for maps, CSS variables for theming.

**Tech Stack:** Astro, MDX, React, Leaflet, Tailwind CSS, Zod.

**Spec:** docs/superpowers/specs/2026-10-22-ruang-bumi-design.md

## Global Constraints

- Use Astro 5.x, React 19.x.
- Dependencies pinned in `package.json`.
- CSS variables for all design tokens.
- No third-party online tiles in `MapView` (GeoJSON local only).
- Accessibility: WCAG 2.2 AA.
- Performance: Initial JS < 60KB, Peta < 250KB total.

## Review Focus

1. **Content schema validation:** Does `content.config.ts` fail build on invalid topics/sources?
2. **Leaflet integration:** Is the map client-side only and accessible?
3. **Source/Atribution:** Are `<Cite>` and `<Figure>` correctly generating attribution lists?
4. **Theme switching:** Do CSS variables update correctly for light/dark mode?
5. **Accessibility:** Do interactive visual components pass a11y checks?

---

### Task 1: Foundation & Layout
**Files:**
- Create: `src/components/layout/Header.astro`, `src/components/layout/Footer.astro`
- Create: `src/layouts/TopikLayout.astro`
- Modify: `src/styles/tokens.css`, `src/styles/base.css`

**Interfaces:**
- Produces: Base layout with theme toggle, breadcrumb component.

- [x] **Step 1: Implement CSS tokens in `src/styles/tokens.css`**
- [x] **Step 2: Create base layout components**
- [x] **Step 3: Commit**

### Task 2: Content Collections & Schema
**Files:**
- Create: `src/content.config.ts`
- Create: `src/content/sumber/sources.yaml`, `src/content/dataset/datasets.yaml`

**Interfaces:**
- Produces: Typed content collections for topics, sources, and datasets.

- [x] **Step 1: Define schema in `src/content.config.ts` using Zod**
- [x] **Step 2: Create sample YAML files**
- [x] **Step 3: Commit**

### Task 3: Interactive Components Foundation
**Files:**
- Create: `src/components/viz/MapView.tsx` (React)
- Create: `src/components/topik/Cite.tsx`, `src/components/topik/Figure.tsx`

**Interfaces:**
- Consumes: Content collection data (topik, sumber, dataset).
- Produces: MapView island, Citation component, Figure component.

- [x] **Step 1: Implement `Cite.astro` and `Figure.astro`**
- [x] **Step 2: Implement `MapView.tsx` wrapper for Leaflet**
- [x] **Step 3: Commit**

### Task 4: Content Implementation (MVP 1st Topic)
**Files:**
- Create: `src/content/topik/atmosfer/angin-darat-laut.mdx`
- Create: `src/components/viz/SimAnginLaut.tsx`

**Interfaces:**
- Produces: First topic with interactive simulation.

- [x] **Step 1: Implement `SimAnginLaut.tsx`**
- [x] **Step 2: Write `angin-darat-laut.mdx`**
- [x] **Step 3: Commit**

### Task 5: Build Checks & Final Polish
**Files:**
- Create: `scripts/check-sources.mjs`

**Interfaces:**
- Consumes: YAML source/dataset files.
- Produces: Build failure if schema/source rules are broken.

- [x] **Step 1: Write `check-sources.mjs`**
- [x] **Step 2: Integrate into CI (package.json scripts)**
- [x] **Step 3: Final review & commit**

---

## Status implementasi (22 Oktober 2026)

Fase 0 dan MVP Fase 1 sudah berjalan di `ruang-bumi/`:

- Fondasi: Astro 7 + MDX + React + Tailwind v4 (token di `tokens.css`), semua dependency dipin exact,
  Node 24 lewat `.nvmrc`.
- Lima topik terbit: angin darat-laut, lempeng tektonik, musim, siklus air, bioma. Masing-masing
  punya 2–4 sumber, satu visual interaktif, dan kuis tiga soal.
- Halaman: beranda (filter + pencarian sisi klien), semua topik, kategori, glosarium, sumber,
  tentang, 404, serta halaman topik dinamis dengan sidebar.
- Sistem sumber: `Cite` dengan popover, `Figure` yang mewajibkan sumber/dataset, `DataNote`,
  daftar sumber otomatis bernomor, dan penjaga build di `scripts/check-sources.mjs`
  (diuji dengan topik rusak: build berhenti).
- Peta: Leaflet 1.9.4 dengan GeoJSON lokal (PB2002 + Natural Earth), tanpa tile pihak ketiga,
  toggle layer, tombol Dunia/Indonesia, panel info, daftar lempeng tekstual, dan warna yang ikut
  tema.
- Verifikasi: `astro check` bersih, `check:sources` lolos, 339 tautan internal valid,
  `tests/ui-check.mjs` lolos di 390/1280 px tema terang dan gelap tanpa pelanggaran axe
  serious/critical, tanpa overflow.

Penyimpangan sadar dari rencana awal:

- Pencarian memakai filter sisi klien, belum Pagefind.
- Visual bioma berupa diagram sabuk lintang interaktif (SVG), bukan Leaflet; lebih ringan dan
  jujur sebagai ilustrasi.
- Unit test Vitest belum ditambahkan; pengujian saat ini berupa pemeriksaan build, tautan, dan
  peramban (Playwright + axe).
- Data gempa USGS live dan grafik Observable Plot tetap di Fase 2 sesuai SPEC.
