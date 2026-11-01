# Developer Handover — Dr. Fahim Foysal Kollol Website
_Living document. Benzadid Intelligence builds the first front-end sections; the developer continues **with the exact same design pattern** and keeps this file updated._
Last updated: 2026-10-03 (developer handover — final check done)

---

# ★ START HERE — Developer Brief (handover 2026-10-03)
_Read Part A completely before writing any code. Part B (sections 0–10 below) is the detailed technical log; the change log in §10 is the history of every decision._

## A1. Priority order (do not reorder)
1. **Keep the existing design exactly as it is.** The prototype in `5. Hero Prototype/` is the **visual and behavioural reference** — layout, colours, fonts, glass cards, giant gradient words, every scroll animation, timing, mobile layout, EN/BN behaviour. Port it to Next.js **pixel- and motion-faithful**. Do **not** "improve", restyle, simplify or swap animations/libraries in a way that changes how it looks or feels.
2. **Everything the visitor can read or click must be editable from the admin panel** — every text, label, button text + link, number, list, card, image, order, SEO field, in **both English and Bangla**. The admin must mirror the front end 1:1 (one admin screen/section per front-end section). Nothing hard-coded in the final build.
3. **Any new page or section must follow the existing pattern** (see A2). If something new is needed, pick the closest existing component and reuse it — never invent a new visual style.
4. Only after 1–3: the pending items (A5), small fixes, performance, SEO.
5. Every change → add a dated entry to §10 of this file.

## A2. The design pattern every page must follow
- **Palette "Fresh Aqua" (locked):** white `#FFFFFF`, tint `#EEF7F6`, aqua `#2BB3B1`, teal `#0B6E73` (CTA), ink `#062F31` (text only). **No navy, no orange.**
- **Fonts:** EN Fraunces (headings) + Inter (body) · BN Anek Bangla (headings) + Hind Siliguri (body).
- **Giant gradient words** (teal → aqua, `background-clip:text`), auto-fitted so the whole word is always visible.
- **Glass cards** (white 86–90 %, blur 16 px, aqua hairline border, soft teal shadow), rounded 20–28 px.
- **Background-free images** (doctor cut-outs, condition images) floating with a soft drop-shadow.
- **Scroll-driven motion**: pinned "showcase" stages that rest ~60 % of each step then glide (smoothstep), always reversible on scroll-up; tickers; count-ups; one sticky-stack hand-off (homepage serial section; category/condition pages lower sections).
- **Laptop + phone** designed separately (phone ≠ shrunk laptop) — test 1280×720 and 390×844 minimum, **EN and BN**.
- **Conversion first:** every page ends in Book a serial / Call / WhatsApp. No prices, no anaesthesia/hospital-stay promises, no outcome guarantees.
- Respect `prefers-reduced-motion` (already done in the prototype).

## A3. What is built (prototype, ready to port)
| Area | File | Status |
|---|---|---|
| **OT-light preloader** (lamp glides over the name; dark → lit; ~3.6 s; once per session; tap to skip; EN/BN) | `assets/preloader.css` + snippet at top of `<body>` in all 4 pages | ✅ final |
| Hero (scroll-scrubbed incision video, code-drawn cut + blood, text rises from the cut) | `index.html` | ✅ final |
| Meet Your Surgeon (pinned; name, degrees, 6 count-up stats, **degrees ticker** at the bottom) | `index.html` | ✅ final |
| Conditions on the homepage (same pinned stage; laptop: doctor swings right/left **in groups of 3 by position**, zoomed; big word + wide card with large image on the free side; phone: centred doctor) | `index.html` | ✅ final |
| How to get a serial (**sticky-stacks over the conditions**, numbers ticker on top, 3 steps one per scroll — laptop horizontal, phone vertical — animated SVG pictogram icons) | `index.html` | ✅ final (step-1 link → Contact page when built) |
| Reviews (Google box + 4 **SAMPLE** reviews) | `index.html` | ⚠️ placeholder content |
| Videos | `index.html` | ⚠️ placeholder — **section may be removed, not finalised** |
| Gallery | `index.html` | ⚠️ placeholder (waiting for photos) |
| FAQ (7 Q&A, EN/BN) | `index.html` | ⚠️ draft answers — doctor approval needed |
| Blog preview (3 cards) | `index.html` | ⚠️ placeholder until blogs are written |
| Visit: doctor centred + CTA + 3 chambers + embedded map | `index.html` | ⚠️ map pins not verified (see A6) |
| Footer (homepage + inner pages) | `index.html`, `assets/site.js` | ❌ **must be redesigned** (A5-6) |
| Conditions & Treatments hub | `conditions/index.html` | ✅ |
| 7 category pages (doctor → condition images "swap mode", wide cards, words fitted to card width, stacked lower sections, doctor CTA) | `conditions/category.html?cat=` | ✅ |
| 26 condition pages (title centred + scroll hint → image enters left, steps What/Symptoms/Treatment/When; doctor CTA; stacked "Other conditions") | `conditions/condition.html?c=` | ✅ (ovarian cyst `hidden:true`) |
| Shared system | `assets/site.css`, `assets/site.js`, `assets/conditions-data.js` | ✅ |
| Images | `img/doctor.webp`, `img/doctor-gloves.webp`, `img/doctor-cta.webp`, `img/conditions/<slug>.webp` (26, background removed) | ✅ (ask for hi-res originals) |
| Demo (reference only) | `3. Demos/serial-steps-icons.html` | reference |

Homepage is **not finished** as a whole — the sections above exist, but content (reviews, videos, gallery, blogs, map pins) is pending and the client may still add/remove sections.

## A4. Main tasks for the developer (in this order)
1. **Port to Next.js + Tailwind + Supabase + Vercel**, design- and motion-identical. Keep the scroll engines (showcase, swap mode, hero mode, sticky stack, tickers, homepage stage) as client components; keep the `?v=` cache-busting idea via Next's asset hashing.
2. **Supabase schema + admin panel mirroring every section** (A7). Bilingual fields (`*_en`, `*_bn`) for every text. Image uploads must accept transparent PNG/WebP for cut-outs.
3. **Footer redesign** (A5-6).
4. **Contact / Chambers page** (same pattern: big gradient title, glass chamber cards, map, Book/Call/WhatsApp) → then point serial step 1 to it.
5. **About the Doctor page** — story, qualifications, memberships, training, **publications list (11, 6 indexed — titles/links needed from doctor)**, photos; same pattern (pinned showcase / glass cards / tickers).
6. **Blog system + the 10 blogs** (A5-1).
7. Google reviews integration, map pins, gallery/video content when assets arrive (A6).
8. SEO + performance + QA (A8).

**A4-9 · Speed is a top requirement (client: "lightning fast — every click and every scroll").** Targets: Lighthouse Performance ≥ 90 on mobile, LCP < 2.5 s, CLS < 0.05, INP < 200 ms, scroll animations at 60 fps. How: Next/Image (AVIF/WebP, correct sizes, lazy below the fold), preload only the first hero frames + fonts (`font-display:swap`, subset Bangla/English), load the remaining hero frames progressively, animate only `transform`/`opacity` (no layout-changing properties in scroll handlers), one shared `requestAnimationFrame` loop, no heavy animation libraries, static generation/ISR for every page, Supabase reads cached, Vercel edge caching. The prototype is a design reference — do not copy its unoptimised asset loading 1:1.

## A5. Pending work — specs
**A5-1 · 10 blogs, EN + BN.** Bangla must be **natural, easy Bangla for patients — not a literal translation**; English short and clear. SEO-first (one primary keyword per post, BN + EN titles/meta, FAQ block, internal links to the matching condition page, Physician/MedicalWebPage + FAQPage schema). 800–1,200 words each, safety disclaimer at the end, every post ends with Book a serial / Call. **Design = site pattern:** giant gradient title, glass content cards, floating background-free images, big pull-quotes / big-number call-outs. **No village names** (ভগন্দর, গেজ, অর্শ) — use ফিস্টুলা, ফিশার, পাইলস. Titles (draft, refine for SEO):
1. পাইলস হলে কি অপারেশন লাগবেই? — Do piles always need surgery?
2. লংগো (স্টেপলার) অপারেশন: কী, কার জন্য — Longo stapler surgery for piles, explained
3. ফিস্টুলা বারবার ফিরে আসে কেন, আর কীভাবে ঠেকাবেন — Why fistula comes back and how to prevent it
4. পায়খানার সাথে রক্ত: পাইলস, ফিশার নাকি ক্যান্সার? — Blood in stool: piles, fissure or cancer?
5. ফিশারের জ্বালাপোড়া ব্যথার আধুনিক চিকিৎসা — Modern treatment for painful anal fissure
6. পিত্তথলির পাথর: ল্যাপারোস্কপির পর কবে কাজে ফিরবেন — Gallstones: back to work after keyhole surgery
7. হার্নিয়া: মেশ দিয়ে ল্যাপারোস্কপিক অপারেশন (TAPP/IPOM) সহজ ভাষায় — Laparoscopic hernia mesh repair, simply explained
8. স্তনে চাকা মানেই ক্যান্সার নয় — কখন ডাক্তার দেখাবেন — A breast lump is not always cancer
9. অ্যাপেন্ডিসাইটিসের লক্ষণ: দেরি করলে কী বিপদ — Appendicitis signs and the danger of waiting
10. অপারেশনের আগে-পরে রোগীদের সবচেয়ে বেশি করা ১০টা প্রশ্ন — 10 questions patients ask before and after surgery
All medical content must be **reviewed and approved by Dr. Kollol** before publishing.

**A5-2 · Homepage content to finalise:** replace the 4 SAMPLE reviews with real, consented reviews (or Google reviews); connect the Google box to his Google Business Profile; videos — **client has not decided whether to keep the Videos section**; gallery photos; FAQ approval; blog cards → real posts.

**A5-3 · Map.** Embedded Google map with chamber switcher exists; pins must be confirmed (A6).

**A5-4 · About the Doctor + publications** (A4-5).

**A5-5 · Contact page** (A4-4), Appointment form (→ WhatsApp + Supabase), Privacy/Disclaimer.

**A5-6 · Footer — redesign (client request).** The current footer colour (deep teal/ink `#062F31`) is **disliked** — use the site's own colours: teal `#0B6E73` → aqua `#2BB3B1` (the same gradient as the CTA buttons and giant words) or a light tint `#EEF7F6` version with teal text — never the deep ink background. Make it **more elaborate**, same glass/gradient style:
- Brand block: logo mark, Dr. Fahim Foysal Kollol, title, one-line bio, BMDC A-61041.
- Quick links (Home, About, Conditions & Treatments, Blogs, Contact).
- Conditions by category (7 categories).
- Chambers: 3 cards with days + times + map link (Sherpur highlighted).
- Contact: Book a serial, Call, WhatsApp, Facebook page.
- Bottom bar: © year · disclaimer line · **Benzadid Intelligence tagline + credit link** (get the exact tagline text from Shadly).
- EN/BN, laptop + phone, admin-editable like everything else.

## A6. Waiting on the doctor / client
1. **Map pins:** New Medicare Path. Lab (Mymensingh) ✅ matches Google Maps. Amzad Diagnostic (Sherpur) found at "Puraton Raz Bari, Nalitabari–Sherpur Rd" but leaflet says "Zila Hospital Road, Narayanpur" ⚠️ confirm. Asia Diagnostic Center (Sherpur) ❌ not on Google Maps — currently approximate with a visible note. Get exact Google Maps links/WhatsApp locations.
2. Real reviews / Google Business Profile link.
3. Publication list (titles, journals, links).
4. Videos (and decision to keep the section), gallery photos, hi-res doctor photos.
5. FAQ + blog medical approval.
6. Ovarian cyst (keep/drop), exact "testicular" condition, chamber-1 name/time, permission for "250 fistula / 1 recurrence".
7. Domain, Benzadid Intelligence footer tagline.

## A7. Admin panel — must mirror the front end
Navbar + dropdown · hero copy · Meet-Your-Surgeon (name, title, degrees, post, 6 stats + labels, degrees-ticker items) · homepage conditions (featured list + order + "And more" text; side-grouping is automatic by position) · numbers ticker · How-to-get-a-serial (3 steps: title, text, buttons + links; icons fixed) · reviews (+ Google link) · videos · gallery (image + caption) · FAQ · blog posts (EN/BN, SEO fields, cover image, category, related condition) · visit section + chambers (name, address, days, times, phone, map query/pin, highlight flag) · CTA texts + doctor photos · categories (7) · conditions (26: names, med name, short, what, symptoms, treatment, when, stat, laparoscopic flag, image, hidden flag, home order) · footer (all blocks) · SEO title/description per page EN/BN · notice banner · appointment requests.

## A8. QA checklist before every delivery
Laptop 1280×720 + 1440×900 and phone 390×844 + 360×800 · EN + BN · scroll down **and up** through every pinned stage (nothing overlaps, every giant word fully visible, no card covers the doctor's face) · reduced-motion · Lighthouse (performance, SEO, accessibility) · all phone/WhatsApp/map links · no console errors.

---

# Part B — Detailed technical log

---

## 0. Non-negotiable rules
1. **Same design everywhere** — every new section/page follows the existing pattern (colours, fonts, glass cards, scroll-driven motion) on **laptop + mobile** and **Bangla + English**.
2. **Everything is editable from the admin panel** — every text, number, label, card, image, link, button, list item and order. Nothing hard-coded in the final build. (Top priority.)
3. **Main goal of the site:** patients instantly understand *this is their surgeon* → **call / book a serial immediately**. No pricing, no anesthesia/hospital-stay details on the site.
4. Bangla = natural, simple Bangla (not literal). English = short, hooky. Medical terms in Bangla are written **in Bangla script** (ফিস্টুলা, ফিশার, পাইলস) — **no village names** (ভগন্দর, গেজ, অর্শ).
5. No outcome guarantees ("100% success"); doctor is FCPS Colorectal *enrolled*, not qualified — never call him "Colorectal Specialist".

---

## 1. Project facts
- Doctor: Dr. Fahim Foysal Kollol — MBBS, BCS (Health), FCPS (Surgery), MACS (USA); Assistant Professor of Surgery, Mymensingh Medical College Hospital; BMDC A-61041.
- Title: General, Laparoscopic, Breast & Colorectal Surgeon.
- Chambers: Sherpur (Thu: Asia Diagnostic Center 3–9 PM*; Fri: Amjad Diagnostic Center 11 AM–9 PM) — **highlight Sherpur**; Mymensingh: New Medicare Pathology Lab, Charpara, Sat–Tue 3:30–8 PM.
  *Chamber 1 name conflict (leaflet vs card) — confirm with doctor.
- Phones: patients 01670879100 (WhatsApp) · serial 01750-529252 · assistant 01671-869026.
- Source material: `1. Doc's Information/`.

## 2. Stack (target)
Next.js + Tailwind, Supabase (DB + admin), Vercel. Prototype is plain HTML/CSS/JS: `5. Hero Prototype/index.html`.

## 3. Design system
| Token | Value |
|---|---|
| white | #FFFFFF |
| aqua-tint | #EEF7F6 |
| aqua | #2BB3B1 |
| teal (CTA) | #0B6E73 |
| ink (text) | #062F31 |
| muted text | #3F6668 |
**No navy, no orange.** Fonts: EN headings Fraunces, EN body Inter; BN headings Anek Bangla, BN body Hind Siliguri. Glass cards: `rgba(255,255,255,.6)` + `backdrop-filter: blur(14px)` + aqua border 28%. Giant display words: teal→aqua gradient text.

## 4. What is built (homepage, prototype)
| # | Section | How it works |
|---|---|---|
| 1 | Navbar | Glass bar, EN/BN toggle, Book a serial; burger on mobile |
| 2 | Hero | Scroll-scrubbed video (WebP frames in `frames/wide` 16:9 & `frames/tall` 9:16, extracted with ffmpeg 30fps). Blade path measured per frame (`CFG` in code). Red incision + blood beads drawn in **code** (AI video tools block blood). Text rises out of the cut; scroll up reverses. Copy: "Every incision has a reason. / And an expert surgeon knows it all." CTA "Meet your surgeon ↓" / "পরিচিত হন আপনার সার্জনের সাথে". |
| 3 | Meet Your Surgeon (pinned) | Same doctor cutout (`img/doctor.webp`, rembg) centred. Giant word "Meet Your Surgeon" / "ইনিই আপনার সার্জন". Left: name, title, degrees, post, CTA, chamber days. Right: 6 stat cards with **count-up every time the section enters (down or up)**. Background starts with the hero's sampled bottom pixel row → **no seam** between hero and this section. |
| 4 | Conditions (same pinned stage) | Intro texts fly **upwards** out of frame; condition names in giant text scroll up **behind** the doctor; glass card per condition. Laptop: each word auto-fit to one line, max size. |
Gotchas: `body{overflow-x:clip}` (not hidden — hidden breaks `position:sticky`). Local server: `.claude/launch.json` "kollol-demos" (port 3018); client-root `index.html` redirects to the prototype.

## 5. Decisions log
- 2026-09-29 Palette "Fresh Aqua" locked; hero = gloved hands + incision video.
- 2026-09-30 Hero copy locked; intro word → "Meet Your Surgeon" / "ইনিই আপনার সার্জন".
- 2026-10-01 Conditions section: see §6. Nav item renamed **"Conditions & Treatments"** / "রোগ ও চিকিৎসা". Structure = **Model A + hub**: one hub page, each condition has its own dedicated page (condition + how it is treated together).
- 2026-10-01 Categories = **7 organ-based groups** (§6b). "Laparoscopic" is NOT a category — it is a **badge/filter** on cards where he operates laparoscopically. "Hepatobiliary" not used (he does no liver/pancreas surgery) → "Gallbladder & Bile Duct".
- 2026-10-01 Condition pages: short, easy language (EN + BN) — what it is, symptoms, how Dr. Kollol treats it — every page ends in **call / book a serial** (conversion first). No pricing, anesthesia or hospital-stay details.

## 6. Conditions section (homepage) — ✅ APPLIED 2026-10-01
- Heading: **"Conditions Dr. Kollol treats"** / **"যেসব রোগের চিকিৎসা করেন ডাঃ কল্লোল"** (approved).
- **Remove the counter** ("01 / 08").
- Fix names: Appendix → **Appendicitis**; Breast → **Breast Lump** + **Breast Cancer**.
- Scrolling names in BN = medical names in Bangla script (ফিস্টুলা, ফিশার…), never village names.
- Order follows the 7 categories below; at least one urology condition (Kidney Stones).
- A: category chips at top that light up per category · B: closing "And more" step listing the rest · C: final CTA card · D: category order · E: every card links to its condition page.

## 6b. The 7 categories (hub page, navbar dropdown, homepage order)
| # | Category EN / BN | Conditions (from doctor's leaflet + WhatsApp text) |
|---|---|---|
| 1 | Colorectal & Anal / মলদ্বার ও বৃহদন্ত্র | Piles, Fissure, Fistula, Anal/Rectal cancer, Anal pain & bleeding |
| 2 | Gallbladder & Bile Duct / পিত্তথলি ও পিত্তনালি | Gallstones (lap), Bile duct stones |
| 3 | Abdomen & Pelvis / পেট ও তলপেট | Appendicitis (lap), Inguinal hernia (lap TAPP), Umbilical hernia (lap IPOM), Ovarian cyst (lap — **keep? pending**) |
| 4 | Breast / স্তন | Breast cancer, Breast lump (fibroadenoma), Fibrocystic disease, Breast pain, Nipple discharge, Breast abscess, Gynecomastia |
| 5 | Kidney & Urinary / কিডনি ও মূত্রতন্ত্র | Kidney stones, Ureteric stones, Bladder stones |
| 6 | Testis & Veins / অণ্ডকোষ ও শিরা | Testicular disease (exact condition to confirm), Varicocele (lap), Varicose veins |
| 7 | Skin & Soft Tissue / চামড়া ও নরম টিস্যু | Tumours / lumps under the skin, Cysts |
Total ≈ 26. Never describe him as urologist or gynaecologist on urology/ovarian pages — only "Dr. Kollol performs this surgery". Optional hub line: "As a general surgeon, Dr. Kollol treats conditions across these areas."

## 7. Pages plan
| Page | Status |
|---|---|
| Home | **sections built** (hero → serial → reviews → videos → gallery → FAQ → blog → visit) — content placeholders pending, see Part A |
| About the Doctor (+ publications) | **pending — developer** (Part A4-5) |
| **Conditions & Treatments hub** — prototype `conditions/index.html` → Next.js `/conditions-treatments` | **✅ BUILT** |
| **Category pages** (×7) — prototype `conditions/category.html?cat=<slug>` → `/conditions-treatments/[category]` | **✅ BUILT** |
| **Condition pages** (×25 visible + 1 hidden) — prototype `conditions/condition.html?c=<slug>` → `/conditions-treatments/[category]/[condition]` | **✅ BUILT** (EN + BN copy written) |
| Homepage extras: Google reviews + other items the client will specify | **developer / later** |
| Blogs | **pending — developer** (spec + 10 titles in Part A5-1) |
| Contact / Chambers | **pending — developer** (Part A4-4) |
| Appointment (form → WhatsApp + Supabase) · Privacy/Disclaimer | pending |

## 7b. How the Conditions system is built (prototype → Next.js)
**Files** (in `5. Hero Prototype/`):
| File | Purpose |
|---|---|
| `assets/conditions-data.js` | **Single source of truth** — 7 categories + 26 conditions, EN/BN. Becomes the Supabase tables below. |
| `assets/site.css` | Shared design system for inner pages (nav + dropdown, page hero, glass cards, condition cards, CTA band, footer, mobile bar) |
| `assets/site.js` | Shared nav/dropdown, footer, mobile sticky bar (Call · WhatsApp · Serial), EN/BN switch (same `localStorage` key `kollol-lang` as homepage), scroll reveal, giant-word fit + upward drift |
| `conditions/index.html` | Hub: giant title behind doctor → sticky category chips (auto-highlight) → 7 category sections (giant drifting category word + cards) → CTA band (3 chambers) → footer |
| `conditions/category.html` | Category page: giant category name behind doctor, quick list, all cards, other categories, CTA |
| `conditions/condition.html` | Condition page template: hero (giant name behind doctor, breadcrumb, short line, laparoscopic badge, proof stat) → What it is → Symptoms → How Dr. Kollol treats it (numbered steps + proof) → When to see a doctor (sticky, with Serial/WhatsApp) → CTA band → related conditions |
| `index.html` (homepage) | Conditions section now reads the same data: heading "Conditions Dr. Kollol treats", **no counter**, 7 category chips light up (one swipeable row on phone), 11 featured conditions (`home.order`) + final "And more" step listing the rest + Book/All buttons. Every card links to its condition page. Navbar "Conditions & Treatments" dropdown (7 categories). |

**Inner-page hero = PINNED SHOWCASE (2026-10-02)** — `K.showcase()` in `site.js`, styles `.show*` / `.sp*` in `site.css`, used by hub, all 7 category pages and every condition page.
- Doctor photo: `img/doctor-gloves.webp` (gloves pose, rembg cutout). Laptop: fixed on the **LEFT**. Phone: fixed in the **CENTRE** (same as homepage).
- Giant words pass **BEHIND** the doctor (laptop: upper band starting at 24vw, auto-fit to one line; phone: above his head).
- Condition **image + glass card pass IN FRONT**, on the free side (laptop: lower-right, image + card side by side; phone: one compact card with a thumbnail, below his face). Decision: images never go behind the doctor (they'd be hidden) and never over his face.
- Each step "rests" ~60% of its scroll (smoothstep), then glides to the next → readable, smooth, reversible.
- Hub steps: intro + every condition (category order, chips light up). Category: intro + its conditions. Condition: Condition → What is it → Symptoms → Treatment → When to see a doctor (+ Serial/WhatsApp).
- Images: `K.mockImg()` generates labelled MOCK placeholders. Real photos/illustrations go in the `image` field per condition (admin upload). Use licensed medical illustrations — no graphic surgical photos.
- Homepage keeps the original crossed-arms photo (`img/doctor.webp`).

**Suggested Supabase schema**
- `categories(slug, order, name_en, name_bn, desc_en, desc_bn)`
- `conditions(slug, category_slug, order, is_laparoscopic, is_hidden, home_order, home_word_en, home_word_bn, name_en/bn, medical_en/bn, short_en/bn, what_en/bn, when_en/bn, stat_en/bn, image)`
- `condition_symptoms(condition_slug, order, text_en, text_bn)` · `condition_treatment_steps(condition_slug, order, text_en, text_bn)`
- Ovarian cyst is in data with `hidden:true` (pending doctor decision).

## 8. Admin panel must manage (minimum)
Navbar links · hero copy · intro/stats (numbers + labels) · degrees · chambers (name, address, days, times, phones) · conditions (name EN/BN, category, card text, order, link, image) · condition pages content · reviews · FAQ · blogs · notice banner · appointment requests · SEO title/description per page (EN/BN).

## 9. Open gaps / waiting on doctor
1. Ovarian cyst — keep or drop (gynae) 2. "Testicular disease" — which exact condition 3. Chamber 1 name/time 4. Permission for "250 fistula, 1 recurrence" 5. Real reviews / Google reviews 6. Publication list 7. Hi-res photos (2–3 poses) 8. Domain.

## 10. Change log
- 2026-10-01 File created (Claude). Developer: append entries here for every change.
- 2026-10-01 Added 7-category structure (§6b), page plan statuses, condition-page content rule, open gaps.
- 2026-10-01 BUILT: conditions data (26, EN+BN), hub, 7 category pages, condition template, homepage conditions section rework, navbar dropdown, shared site.css/site.js (§7b). Tested laptop 1280×720 + phone 390×844, EN + BN.
- 2026-10-02 Inner pages rebuilt with the pinned showcase + new gloves photo (see §7b). Tested 1280×720 + 390×844, EN + BN. Assets use `?v=N` cache-busting in the prototype.
- 2026-10-01 Homepage conditions order now follows the chip/category order exactly (Breast before Kidney). Cards less transparent (white 90%, inner pages 86%) for readability. Phone "And more" card sits below the doctor's arms: 6 tags + "+N" chip linking to the hub, buttons side by side.

### 2026-10-02 — Background-free condition images
- 26 source images (`6. Condition n Treatment Images/`) → background removed → `5. Hero Prototype/img/conditions/<slug>.webp` (transparent WebP).
- `K.condImg(c)` in site.js = single source of image path (Supabase: `conditions.image_url`, admin-uploadable, must be transparent PNG/WebP).
- Used in: showcase panels (hub/category/condition), `.ccard` grid cards (`.cimg`), homepage pinned cards (`.svc-card .ci`). Style = floating, drop-shadow, no box.
- Known quality gaps: dark-bg anatomy images keep straight tissue-block edges; small holes in gallstones/bile-duct; appendicitis image concept off → regenerate on white.

### 2026-10-02 (later) — Condition images 1–7, 9, 10 replaced
- New white-bg renders for piles, fistula, fissure, rectal-cancer, anal-pain-bleeding, gallstones, bile-duct-stones, inguinal-hernia, umbilical-hernia → background removed (rembg isnet; hernia pair via white flood-fill so the aqua magnifier inset + teal ring survive) → overwritten in `img/conditions/`. #8 appendicitis unchanged.
- Cache-bust: image URLs now `?v=2` (`K.condImg` + homepage `.svc-card .ci`); assets bumped to v=7.
- Hernia images are wide (torso + inset) → appear smaller in phone thumbnails. Umbilical source was full-bleed (torso cut by frame top/left).

### 2026-10-02 — Condition pages: condition image replaces the doctor
- `K.showcase(el, steps, {hero:{src,alt}})` → "hero mode": no doctor; `.show-hero` holds the condition image. Step 1 (title) = no image; during the first scroll the image grows in from the card side (laptop: right→left, phone: from below) and stays pinned (laptop left 44vw, phone centred) while What/Symptoms/Treatment/When cards change. Reverses on scroll-up. Hub/category pages unchanged (still doctor).
- Doctor moved to the CTA band on condition pages: `K.ctaBand({doc:true})` → laptop left side, phone centred above the heading.
- condition.html assets v=8. Applies to every condition (single template), EN + BN.
- Fix (same day): giant words in hero mode moved to the RIGHT column on laptop (left 52vw, auto-fit to 44vw) so they are never hidden by the image; image reduced to 40vw. Phone: word sits above the image (top 23%, auto-fit 94vw, one line), image 23vh between word and card.
- CTA band on condition pages rebuilt like the homepage: `.cta-stick` = doctor sticky in the centre for the whole band; giant `.cta-big` name scrolls BEHIND him; `.cta-card` (heading + buttons) and the 3 chamber cards scroll IN FRONT; band uses `overflow:clip` (hidden would kill sticky). Doctor leaves before "Other conditions in this area". condition.html assets v=9.
- Revision: laptop step 1 = title word + first card CENTRED, blinking "Scroll" mouse hint (`.show-hint`, fades on first scroll, hidden on phone). First scroll slides words + card to the right column while the image enters from the left (`SC.wbox/pbox` translateX driven by the same eased value as the image).
- CTA band is now a FIXED composition (no sticky, nothing slides over the doctor): laptop = giant name behind, doctor centred, CTA card left, 3 chambers right; phone = name behind his head, doctor, then CTA card + chambers stacked below. condition.html assets v=10.
- Revision 2 (laptop): scroll hint = solid teal pill "Scroll down to learn more" + bouncing ↓ + pulsing ring, sits BELOW the card. First card wide (min(760px,58vw)), centred by measuring its real position, with an "On this page" strip (What is it · Symptoms · Treatment · When to see a doctor) — admin-free, built from the step titles. Cards hug their content (no empty white). In hero mode, neighbouring giant words fade to 0 (no word peeks behind the card). Phone unchanged (hint + strip hidden). condition.html v=11.

### 2026-10-02 — Category pages: doctor → condition images ("swap mode")
- `K.showcase(el, steps, {swap:true})`: intro step shows the doctor (laptop left / phone centre) with a big category word + a wide intro card (34vw→96vw, right up to his hand). First scroll (scroll-scrubbed) slides the doctor out left + fades him, while the first condition image grows into his spot; later steps cross-fade the image per condition (`.show-gal .g`, one per step).
- Laptop: condition cards are wide (50vw→96vw). Each giant word is fitted to its own card width (two-pass fit, ×0.965 for glyph overhang) and starts at the card's left edge → word edges line up with the card. Neighbouring words fade to 0 (nothing peeks behind cards). Card thumbnails hidden in swap mode.
- Phone: word one line above the image, image centred, card at bottom (same as condition pages).
- CTA band on category pages now uses `K.ctaBand({doc:true})` (fixed composition, doctor centred). category.html assets v=15. All 7 category pages share the template; EN + BN.

### 2026-10-03 — CTA doctor photo
- New arms-crossed photo (original kept in `1. Doc's Information/doctor-arms-crossed-CTA-original.jpg`) → background removed (rembg isnet) → `img/doctor-cta.webp` (649×1081). Used by `K.ctaBand({doc:true})` on every condition + category page ("Don't wait. Talk to your surgeon" band), laptop + phone. Showcase/intro still uses doctor-gloves.webp. All conditions pages assets v=16. Admin: should be a replaceable "CTA doctor photo" (transparent PNG/WebP).

### 2026-10-03 — Stacking sections (ref: Pinterest pin 844493676784201, "sticky card stack")
- `K.stack([els])` in site.js (+ `.stk`, `.stk-up` CSS). Every listed section except the last becomes sticky at `top = min(0, 100vh − height)` (tall sections stick at their bottom → never covered unread); the next slides up over it with rounded top corners, soft upward shadow and an aqua glow line (`.stk-up::before`); the covered one eases back (scale → .94, opacity → .55). Last section stays in normal flow; footer has z-index 50 so it is never under a sticky layer. Headings inside stacked sections reveal from a mask (clip-path).
- Category pages: All conditions → Other areas → CTA(doctor, last). Condition pages: CTA(doctor) → Other conditions (last). Homepage intentionally NOT included (to revisit when new homepage sections exist). Reduced-motion users get normal flow. Assets v=18.

### 2026-10-03 — Homepage "Meet Your Surgeon" conditions: swinging, zoomed doctor (LAPTOP ONLY)
- index.html `svcDraw`: from the first condition the doctor (`.doc-img`, transform-origin top) alternates RIGHT / LEFT per condition (`sideOf(i)`: even → right, odd → left, "And more" → centre), zoomed to upper-chest-and-face (`docState`: scale fits ~42% of the photo into ~76% of the viewport, head at 24% from top). Between conditions he glides through the middle and dips in scale (sin curve) — scroll-scrubbed, reverses on scroll-up. Positions use `restH` (hold ~60%, then smoothstep glide). Intro ("Meet Your Surgeon") unchanged: centred, normal size; blend in with `inS`.
- Giant word: same vertical band as before, but on laptop it sits on the FREE side (opposite the doctor, ±25vw) and is fitted to 44vw + max 20vh so the whole word is always visible (behind the zoomed doctor it would be hidden). "And more" stays centred, full width.
- Condition cards (laptop): wide (min(46vw,640px)), anchored bottom on the free side, 2-column grid with a big floating image (~36vh tall, ≈2–3× the old one) on the left. Phone layout untouched.
- Revision: doctor side now changes per GROUP OF 3 by position, never by category: `sideOf(i)=floor(i/3)%2 ? left : right` (cards use the same rule for l/r). Current list → Piles/Fistula/Fissure right · Gallstones/Appendicitis/Hernia left · Breast lump/Breast cancer/Kidney stones right · Varicocele/Varicose veins left · And more centre. Adding conditions/categories keeps the 3-3-3 rhythm (only the last group can be short). Inside a group the doctor holds still; only word + card change.

### 2026-10-03 — Homepage part 2 (after the conditions) — index.html
Order: hero → Meet Your Surgeon/conditions (pinned stage) → **How to get a serial** → Reviews → Videos → Gallery → FAQ → Blog → Visit (CTA + chambers + map) → footer. All copy EN/BN in `HX` (index.html) — every string/list must become admin-editable.
- **Degrees ticker** (`#tkrDeg`): bottom edge of the Meet-Your-Surgeon frame, infinite right→left (MBBS · BCS/33rd · FCPS · MACS · SOSB · SELSB · Asst Prof MMCH · Laparoscopy training). Lifts/fades with the intro.
- **Numbers ticker** (`#tkrNum`): top of the serial section, infinite right→left, counts up each time it enters (same `COPY.s1n…s6n` source as the stat cards). Tickers repeat their item set to > screen width, then loop at -50%; hover pauses; reduced-motion stops.
- **How to get a serial** (`#serial`, `hsDraw`): the ONLY sticky-stack on the homepage — rises over the conditions stage (`margin-top:-100vh`; `.doc` got +100vh and `svcDraw` uses `offsetHeight − 2·vh`), stage eases back (scale .94, opacity .5). Then pinned, one step per scroll (restH hold): laptop = cards travel right → centre → left (previous stays faded on the left), phone = bottom → centre → top. 3 steps (4th "Meet Dr. Kollol" removed by client). Icons = inline animated SVG pictograms (`ICONS`, `#siP` person symbol, `si-*` classes); only the centre card animates. Step 1 button → `#visit` for now; **switch to the Contact page when it exists.**
- **Reviews**: Google-reviews box (placeholder rating text + "See reviews on Google"/"Write a review" → `#`, wire to the real Google Business Profile) + 4 **SAMPLE** reviews (tagged "Sample"/"নমুনা", initials only). **Must be replaced with real, consented reviews before launch.**
- **Videos** + **Gallery**: separate sections, placeholders only ("coming soon"). Admin: video URLs (YouTube/FB) + gallery images with captions.
- **FAQ**: 7 Q&A drafts (EN/BN) in `<details>` accordion. **Answers must be approved by Dr. Kollol.** Add FAQPage schema later.
- **Blog**: 3 placeholder cards (piles surgery / gallstones keyhole / breast lump). **TODO: write the blogs** (10 planned in 00_Foundation_Plan) and link cards to real posts.
- **Visit**: doctor (doctor-cta.webp) centred, big name behind, CTA card left, 3 chamber cards right (tap = show on map, tap again = open Google Maps directions), embedded map (`maps.google.com/maps?q=…&output=embed`, no API key).
  Map check 2026-10-03: ✅ New Medicare Path. Lab — "Charpara Medical Gate, Dhaka-Mymensingh Rd" (PCV5+V8 Mymensingh) matches. ⚠️ Amzad diagnostic center found at "Puraton Raz Bari, Nalitabari–Sherpur Rd" (229C+MW Sherpur) — leaflet says "Zila Hospital Road, Narayanpur": confirm with doctor. ❌ Asia Diagnostic Center (Sherpur) not on Google Maps — map uses "Sadar Hospital Road, Narayanpur" (approximate) with a visible note. Ask the doctor for exact pins / Google Maps links.
- Fixed: countUp could show negative numbers for one frame (rAF timestamp earlier than t0) → clamped. "And more" card no longer overflows the bottom on laptop.
- 2026-10-03 Part A "START HERE — Developer Brief" added at the top (priorities, design pattern, built/pending status, tasks, blog + footer specs, open items, admin mirror, QA). Page-plan table refreshed.

### 2026-10-03 — OT-light preloader added (client chose variation A)
- Files: `assets/preloader.css` (loaded in `<head>` so it paints before anything else) + an inline snippet right after `<body>` in `index.html`, `conditions/index.html`, `category.html`, `condition.html` (`#pl` markup + 3-line script).
- Behaviour: OT lamp glides left → right with a beam; the name is ONE text layer (gradient clipped to text, driven by the registered `--plx` property) — dark until the beam passes, lit after; subtitle lights at the end; screen floods white and the site appears (~3.6 s total). Shown **once per browser session** (`sessionStorage 'kpl'`, class `pl-skip` on `<html>`), **tap/click anywhere to skip**, removed from the DOM when done, hidden for `prefers-reduced-motion`. Bangla text is used when `localStorage 'kollol-lang' = 'bn'`.
- Next.js: render it in the root layout as the first element (server-rendered, no JS needed to show it); name + subtitle EN/BN must come from the admin panel; keep it CSS-only (no animation library). Demos/alternatives: `3. Demos/preloaders/` (A = chosen; p10 = original; B–E = alternatives).

### 2026-10-04 — Full Next.js 15 + Tailwind CSS v4 + Supabase + Admin CMS Port
- **Architecture & Foundation:**
  - Initialized Next.js 15 (App Router, TypeScript, Tailwind CSS v4, Lucide icons, Zod validation).
  - Implemented `next.config.ts` security headers (Strict-Transport-Security, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, CSP).
  - Created complete Supabase PostgreSQL schema in `supabase/schema.sql` (13 relational tables with strict RLS policies).
  - Built unified data service `src/lib/content/service.ts` with local in-memory pre-seeded data fallback ensuring instant rendering without cold-start dependencies.
- **Frontend & Visual Fidelity:**
  - Preserved exact "Fresh Aqua" design palette (`#FFFFFF`, `#EEF7F6`, `#2BB3B1`, `#0B6E73`, `#062F31`) without alterations.
  - Implemented OT-light preloader in `src/components/Preloader.tsx` with session-storage skip and instant bilingual support.
  - Rebuilt scroll-scrubbed canvas incision hero (`HeroIncision.tsx`) with dual WebP frame sequences (`tall` for mobile, `wide` for desktop), code-drawn bleeding cut, and rising typography.
  - Implemented pinned doctor showcase stages (`DoctorConditionsStage.tsx` and `PinnedShowcase.tsx`) with side-swinging doctor in groups of 3, count-up stats, and 7 category chips.
  - Integrated sticky serial steps (`SerialStepsSection.tsx`) with animated SVG pictograms and numbers ticker.
  - Fully redesigned the Footer (`Footer.tsx`) with Fresh Aqua/Teal gradient styling, chamber cards, quick links, and Benzadid Intelligence credit.
  - Created interactive Appointment Modal (`AppointmentModal.tsx`) with Zod validation and direct WhatsApp pre-filled booking messages.
- **Dynamic Content & Inner Routes:**
  - Built 7 category pages and 26 dedicated condition pages with Hero and Swap modes under `/conditions-treatments`.
  - Authored all 10 planned medical blogs in natural Bangla and clear English under `/blogs` and `/blogs/[slug]`.
  - Built dedicated `/about` page (BMDC A-61041 credentials, MMCH post, timeline, 11 research publications) and `/contact` page with interactive Google Maps embeds.
- **Admin CMS & Security:**
  - Route protection middleware (`src/middleware.ts`) intercepting `/admin/*` via HTTP-only cryptographic session cookies.
  - Admin login portal (`/admin/login`) with rate-limiting notices and password authentication.
  - Complete CMS Dashboard (`/admin`) with real-time saving and feedback toasts:
    - *Overview*: Quick counters, recent patient submissions, quick shortcuts.
    - *Appointments*: Filterable patient inbox with status updates (`pending`, `confirmed`, `cancelled`) and 1-click WhatsApp launcher.
    - *Hero & Profile*: Bilingual copy, BMDC credentials, and 4 count-up clinical metrics.
    - *Conditions*: Filterable 26 conditions manager with laparoscopic badge toggles, symptoms, and treatments editor.
    - *Chambers*: Hospital locations, weekly visiting schedules, and Google Maps queries editor.
    - *Medical Blogs*: 10 blog posts publisher and Markdown editor.
    - *FAQs & Reviews*: Bilingual surgical FAQs and verified patient testimonials editor.
    - *Site Settings*: Brand names, hotlines, emergency contacts, banner alerts, and disclaimers.
- **Verification & QA:**
  - Tested production build (`npm run build`) — 47 SSG/Dynamic routes compiled cleanly.
  - Automated browser subagent E2E journey passed: tested responsive viewports (Desktop, Tablet, Mobile), OT-light preloader, hero scroll, language switcher, appointment modal validation, and full Admin CMS workflow.

### 2026-10-17 — Media Gallery (Photos & Video Library), Auto-WebP Storage Optimization, and Admin Media Management
- **Git & Remote Verification:**
  - Audited local workspace and remote repositories (`origin` at `kollol44/drkollolweb` and `liakot` at `LiakotHosen/drkollol`). Verified working branch `main` is completely in sync with `origin/main` with clean working tree.
- **Dedicated Gallery Page (`/gallery`):**
  - Built full-featured `/gallery` page matching "Fresh Aqua" design system (Fraunces/Inter + Anek Bangla/Hind Siliguri).
  - Dual media tabs: "Photo Gallery" and "Video Insights" with bilingual support (`EN` / `বাং`).
  - Strict 4-column x 2-row (8 items per page) grid with accessible pagination controls (previous, next, page numbers formatted in EN and Bangla numerals).
  - Category filter pills for photos: All, Operation Theatre (OT), Consultation Chambers, Conferences & Seminars, Patient Care, Health Camps.
  - Full-screen high-definition Lightbox modal for photos with zoom view, category badges, titles, and clinical captions.
  - Responsive Video Player modal for playing YouTube and Facebook surgical videos without layout shift.
  - Bottom conversion callout with direct helpline and appointment booking modal trigger.
- **Image Optimization & Security Pipeline (`/api/admin/upload`):**
  - Non-technical admins uploading 10MB–15MB high-res images are automatically converted to modern `.webp` format.
  - Dynamic downsampling (max dimension 1920px) and quality tuning bringing image size under 800KB (typically 40KB–150KB, achieving 88%–97% storage savings) while preserving crisp surgical clarity.
  - Hardened security: Magic byte signature verification (JPEG `FF D8 FF`, PNG `89 50 4E 47`, WebP `52 49 46 46`), admin session authorization, and sanitized unique file generation.
  - Returns detailed optimization metrics (`originalSize`, `optimizedSize`, `savings`).
- **Video Integration (`src/lib/video-utils.ts`):**
  - Universal parser for YouTube (standard watch, youtu.be, shorts, embeds) and Facebook video URLs (listed, unlisted, public).
  - Auto-extracts YouTube video IDs, generates secure embed URLs (`youtube-nocookie.com`), and automatically retrieves high-resolution video thumbnails.
- **Admin Media Console (`AdminGallery.tsx`):**
  - Added "Gallery & Videos" tab to the Admin CMS sidebar under *Identity & Reputation*.
  - Upload photo modal with drag-and-drop, real-time optimization savings indicator, bilingual fields, category picker, and home featured toggle.
  - Add video modal with instant YouTube URL auto-detection, live thumbnail preview, bilingual descriptions, and category tags.
  - Interactive grid with edit, delete, preview modals, and sort ordering.
- **Database & Architecture Integration:**
  - Created `GalleryPhoto` and `GalleryVideo` schema types (`src/types/database.ts`).
  - Added pre-seeded clinical default photos and educational videos in `src/lib/content/default-data.ts`.
  - Built CRUD services in `src/lib/content/service.ts` with local memory caching and Supabase integration.
  - Updated API route `src/app/api/admin/content/route.ts` with GET, PUT, DELETE handlers and static revalidation for `/gallery` and `/`.
  - Provided database migration in `supabase/gallery_migration.sql` with RLS policies and performance indexes.
- **Homepage & Navigation Updates:**
  - Replaced homepage placeholder sections in `GallerySection.tsx` and `VideosSection.tsx` with dynamic showcase grids, interactive previews, and "Explore All" links to `/gallery`.
  - Added Gallery links to Navbar (desktop header and mobile drawer) and Footer quick links in both English and Bangla.
- **Build & Quality Assurance:**
  - Production build (`npm run build`) succeeded with 0 errors across all 59 static and dynamic routes.
  - Dev server verified with API test suite (auth, upload optimization, content queries) and browser journeys.

### 2026-10-20 — Design-only updates in the developer repo (pushed 2026-10-20)
- Homepage doctor photo: new `public/img/doctor-v3.webp` (cap, background removed, scrubs matched to #0B6E73, placed in the same 624×1126 frame so the swing/zoom maths is unchanged). Only the 6 `src` strings that pointed to `/img/doctor.webp` now point to `doctor-v3.webp` (Meet Your Surgeon, conditions stage, chat widget ×2, admin sidebar avatar, OG image). New filename on purpose — Next/Image + browser cache kept serving the old picture. `doctor.webp` and `doctor-cta.webp` untouched.
- Incisional & Ventral Hernia: own image `public/img/conditions/incisional-hernia.webp`; fallback `default-data.ts` image_url updated. **Live data comes from Supabase → developer must set this condition's image_url to `/img/conditions/incisional-hernia.webp` in the admin panel.**
- Chat widget (`src/components/chat/ChatWidget.tsx`) restyled to the approved "Question bubbles" design: doctor-avatar launcher with pulse + badge, 3 question bubbles float up (EN/BN) and tuck away after ~14 s; tap = opens chat with an instant answer. Topic chip strip removed. Light-tint header, rounded bubbles, typing dots, "not a diagnosis" line. Chat logic (Gemini `/api/chat`, Supabase config, rate limit) unchanged. Bubble answers: serial = "call or message 01750529252"; others = "hard to say without seeing you → book a serial". 12-answer set for the AI: `2. Research & Plan/07_Chatbot_12_QA.md` (AI-prompt rule still to be discussed).
- Chat widget on the HOMEPAGE is hidden during the hero video and fades in once #doctor (Meet Your Surgeon) reaches 60% of the viewport; the 14 s bubble timer starts only then. All other pages: always visible. Scroll-hint concepts for the hero: `3. Demos/scroll-hint/index.html` (not applied yet).
- Hero scroll cue → approved "ring button" (HeroIncision.tsx + .cue-ring in globals.css): ring fills with hero progress (--p from the existing tick), bouncing ↓, tap scrolls 0.8 screen, fades out over the last 10% of the hero. Text = admin scroll_cue_en/bn + 'or tap here'. Below lg it sits above the MobileStickyBar and on the right (the incision runs across the left half on tall screens). Hero sizes/animation untouched.
- Chat launcher revised: no auto-popping questions / badge / timer. Laptop (hover devices): hovering the doctor avatar shows a label ("Dr. Kollol's Assistant · Click to chat") + the 3 question bubbles; click = open chat. Phone/touch: one tap opens the chat directly. Inside the chat the 3 questions show as chips under the welcome message until the conversation starts (main path on phones).

### 2026-10-24 — Homepage Gallery Full-Bleed Carousel & Pro UI/UX Redesign
- Rebuilt `src/components/home/GallerySection.tsx` from static grid into a full-screen bleed horizontal carousel.
- Edge-to-edge bleed layout across the viewport with soft lateral translucent edge masks on laptop and mobile viewports.
- Medium-sized cards (`16:11` ratio, `280px-410px` wide) keeping focus on crisp clinical details without vertical bloat.
- Smooth right-to-left auto-slide every 3.6s with seamless infinite looping and hover-pause capability.
- Play/Pause toggle button with active glowing status dot and bilingual labels.
- Left and Right glassmorphic arrow buttons for manual step-by-step navigation.
- Interactive drag/clickable scrub track reflecting real-time carousel scroll progress.
- Touch swiping on mobile and drag scrolling on desktop.
- Fullscreen Lightbox modal with internal Previous/Next navigation, keyboard controls (`Esc`, `ArrowLeft`, `ArrowRight`), category badges, and clinical descriptions.
- **Section Reordering & Videos Carousel Redesign (`HomePageClient.tsx`, `VideosSection.tsx`):**
  - Reordered homepage sections: Clinical Gallery (`#gallery`) now precedes Videos (`#videos`), placing Videos directly before Common FAQs (`#faq`).
  - Redesigned `VideosSection.tsx` to mirror the full-screen bleed carousel architecture:
    - Infinite looping track with soft lateral edge vignettes.
    - Medium-sized video cards with video thumbnails, red pulsing play indicators, bilingual category tags, and Fraunces/Anek Bangla typography.
    - Smooth right-to-left auto-slide every 3.8s with hover-pause and touch pause.
    - Play/Pause toggle with glowing status indicator.
    - Left/Right tactile glassmorphic navigation buttons.
    - Interactive scrub track with real-time progress bar.
    - Touch swipe gestures for mobile and mouse drag for desktop.
    - High-resolution video modal player with responsive YouTube embed, internal Prev/Next video navigation, and bilingual clinical descriptions.



## 2026-11-01 — Doctor photo swap (design only)
- New bg-removed photos: `public/img/doctor-cta-v3.webp` (649×1081, arms crossed) and `public/img/doctor-gloves-v3.webp` (655×1069, gloves). Same canvas size and head position as the old files, so layout is unchanged.
- References switched in: VisitChambersSection, AboutPageClient, CategoryPageClient, ConditionPageClient, VideosSection, GalleryPageClient, video-utils (fallback thumbnail), PinnedShowcase.
- `AdminGallery.tsx` intentionally untouched (admin panel off-limits). Old `doctor-cta.webp` / `doctor-gloves.webp` are kept in public/img.
- `doctor-v3.webp` (Meet Your Surgeon, chat widget, OG) is unchanged.
