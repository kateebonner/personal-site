# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS with no build step, chosen explicitly by Kate over Astro and Eleventy. Deployed by GitHub Pages from the root of `main` to the custom domain katebonner.ai (CNAME present). Third-party libraries load from a CDN via an import map; Three.js is already in use this way. Posts are authored by copying an HTML template; a Markdown-to-HTML script was deliberately deferred until there are two or three notes.

## Users

Primary: hiring managers and technical recruiters at quantum industry companies (control, error correction, simulation, hardware and software). They arrive from LinkedIn, a résumé link, or an email, spend under a minute deciding how to categorize Kate, and read About and Projects only if that first impression holds. They know the field; jargon is fine, hype is not.

Secondary, not optimized for: peers and collaborators in quantum and scientific software, and academic readers (PhD admissions). Research signals stay visible for them but do not drive layout.

## Product Purpose

katebonner.ai is Kate Bonner's personal site. It exists so that a quantum-industry reader categorizes Kate correctly within seconds as a physicist who builds quantum control software, then finds the evidence (experience timeline, a project, technical notes) and a way to contact her. Success is a recruiter reaching the contact link with an accurate mental model: physics first, software as the instrument, current quantum control work at Harmoniqs and Columbia.

## Positioning

"Physicist building the software that steers qubits." The claim a neighboring site could not truthfully copy: a physics degree, a current M.S. in Quantum Science & Technology, founding-team work on quantum optimal control tooling, and five years of shipped software before that (cybersecurity, fintech, media data). Most candidates are one or the other; Kate is both, and the site proves it with real research, real shipped work, and current quantum control contributions.

Deliberate emphasis: science over product or design. Kate's Harmoniqs work is described by what it does scientifically (research environment for designing and running pulse optimizations, Piccolo.jl solver integration, pulse and fidelity visualization, formulation and experiment context, hardware connections). Product and design titles do not appear on the site.

## Operating Context

Viewed on desktop and mobile, usually from a LinkedIn profile or an email thread. Kate updates the site every month or two by editing HTML directly in the repo and pushing to `main`. The domain and DNS are on Cloudflare; a kate@katebonner.ai forwarding address is planned via Cloudflare Email Routing and is not yet configured.

## Capabilities and Constraints

Pages (confirmed):
- Home: the confirmed headline, subline, contact line, and the signature animation. Nav links to About, Projects, Notes in the header. Kate removed the section lanes, the time axis, the T dimension row, and the cursor (2026-09-09).
- About: first-person bio only. Kate rejected the visual timeline figure and then the chronological experience list as well (2026-09-09); the bio carries the career summary and LinkedIn carries the detail. No separate résumé PDF.
- Projects: one entry at launch, the Schrödinger animation, linking to its write-up. More added over time.
- Notes: writing index. One seeded note at launch: how the hero animation works (math, numerics, rendering).
- Footer on every page: one line with kate@katebonner.ai and LinkedIn (linkedin.com/in/kate-bonner). Kate removed the title block and the sheet zone marks (2026-09-09). No GitHub, Scholar, or other links.

Confirmed headline (Home):
"Physicist building the software that steers qubits." Subline: "Quantum optimal control at Harmoniqs. M.S. in Quantum Science & Technology at Columbia, expected December 2026. Five years shipping software before physics pulled me back."

Confirmed timeline content (newest first):
- Harmoniqs, founding team, New York, 2026 to present. Harmoniqs builds quantum optimal control software. Kate works on amicode, the research environment scientists use to design and run pulse optimizations: the Piccolo.jl solver integration, pulse and fidelity visualization, the formulation and experiment context, and connections to quantum hardware.
- Columbia University, Master's Degree, Quantum Science & Technology, September 2025 to present, expected December 2026. Coursework: Quantum Computing; Quantum Optimization & Machine Learning; Quantum Error Correction; Applied Quantum Optics.
- Coast (YC S21), Technical Solutions Engineer, January to May 2025. Bespoke frontend applications demonstrating enterprise fintech and crypto API products; HMAC-SHA256 request signing, JWT handling, OAuth 2.0 token exchange.
- NBCUniversal, Associate Product Manager, November 2023 to January 2025. Managed a suite of modular services standardizing the Consumer Data team's first-party data transformation; oversaw integration and UAT of an LLM chat and vector search feature.
- Comun, Software Engineer, October 2022 to August 2023. React Native mobile app for a seed-stage fintech; owned end-to-end delivery of the peer-to-peer payment feature.
- Darktrace, Cyber Security Technologist, July 2021 to October 2022. Architected enterprise network security deployments and integrations; one of six global technical experts on the endpoint network traffic sensor; named Top New Cyber Technologist of 2022 after leading 44+ proof-of-value trials driving $2.6M+ in deals.
- Georgetown University Department of Physics, Undergraduate Researcher, January to May 2020. PID control loops with 8-bit PWM (0.4% duty-cycle resolution) regulating substrate heating to within ±0.5 °C, critically damped; CAD photomasks and photolithography/sputtering processes for four-point, concentric-ring, and rectangular-array electrode geometries for silver-silicon junctions.
- Georgetown University, Bachelor's Degree, Physics, August 2016 to May 2020. Earlier research assistant work (February to April 2019) modeling 3D animations of the 1D time-dependent Schrödinger equation for a free particle as a teaching tool; this is the origin of the site's signature animation.

Degree wording is Kate's: "Bachelor's Degree, Physics" and "Master's Degree, Quantum Science & Technology", not B.A./M.S. abbreviations.

Signature element (binding): a 3D animation of the 1D free-particle time-dependent Schrödinger equation. A Gaussian wavepacket plotted as x versus Re(ψ) versus Im(ψ), a spiraling ribbon that travels and disperses, with the |ψ|² envelope faintly drawn, looping by resetting smoothly. Home hero only; other pages are calm and text-first. The previous site's Bloch sphere is retired and is an anti-reference, not a component to reuse.

Technical constraints: must respect `prefers-reduced-motion` (static frame or gentle idle), must degrade to a static image when WebGL is unavailable, must not block first paint or text rendering. No analytics or tracking unless Kate asks for it later. Every claim on the site must be traceable to Kate's résumé or public work and must not contradict her LinkedIn.

Terminology: the writing section is "Notes", not "Blog" or "Writing". Pages are "About", "Projects", "Notes".

Undecided: how notes are authored once there are several (template copy versus a small Markdown script); whether Projects grows with Harmoniqs work, the qLDPC challenge, the Georgetown junction research, or the VR physics paper (all declined for launch); social preview image content beyond a frame of the animation.

## Brand Commitments

- Name: Kate Bonner. Domain: katebonner.ai. Site title: "Kate Bonner".
- Voice: first person, plain and direct. Short sentences, concrete nouns, no hype. Reads like a competent colleague.
- No photo of Kate anywhere on the site.
- The whole site looks like a mechanical technical drawing (Kate's direction, 2026-09-09, keeping the pulse-sequence layout): black ink on white paper, ISO-style line-weight hierarchy, drafting red as the only accent, hatched fills, dimension lines, and a plain sheet border. The zone marks, title block, lane blocks, and time axis were removed on 2026-09-09 at Kate's direction. Lettering: upright engineering lettering (Share Tech) with Share Tech Mono for readouts and Atkinson Hyperlegible for long prose. The prior olive palette, the matplotlib channel hues, and Barlow/STIX/B612 are all rejected.
- The Schrödinger animation is the single spectacle; everything else recedes.

## Evidence on Hand

- Kate's current résumé (January 2026) and prior CVs, supplied by Kate outside the repo. Source of every timeline fact above.
- Public GitHub history: 172 pull requests across Harmoniqs repositories (amicode, harmoniqs-ai, opencode, Legato.jl, Intonato.jl, IntonatoQICK.jl, aws-infra), the source of the Harmoniqs description. Public fork of the Unitary Foundation qLDPC challenge (not featured at launch).
- The old site's Bloch sphere implementation (git history), evidence of Three.js familiarity only.
- Absent, do not fabricate: testimonials, publications, press, logos, photos, metrics beyond those on the résumé, and any Harmoniqs internal details.

## Product Principles

1. Physics first, software as the instrument. Every page answers "what does she understand" before "what has she shipped".
2. Truthful and verifiable. Nothing appears that a recruiter could not confirm from the résumé, LinkedIn, or public code.
3. Scannable in under a minute, rewarding at depth. Headline, timeline, and contact are reachable without effort; notes and the animation write-up reward the reader who stays.
4. One signature, then restraint. The animation carries the personality; the rest of the site stays quiet and legible.
5. Hand-maintainable. Adding a note or project is copying a file; nothing requires a toolchain.

## Accessibility & Inclusion

WCAG 2.1 AA contrast throughout. The hero respects reduced-motion preferences and has a static fallback without WebGL. Navigation is keyboard-operable with visible focus. Equations in notes have text alternatives.
