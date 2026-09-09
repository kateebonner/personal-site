# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS/JS with no build step, chosen explicitly by Kate over Astro and Eleventy. Deployed by GitHub Pages from the root of `main` to the custom domain katebonner.ai (CNAME present). No third-party code at runtime: the figure is drawn on a 2D canvas with a pencil brush (2026-09-09); Three.js and the import map are gone. Posts are authored by copying an HTML template; a Markdown-to-HTML script was deliberately deferred until there are two or three notes.

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
- Home: placeholder headline and subline (lorem ipsum until Kate writes copy), contact line, and the signature animation. No nav.
- About: removed for now (2026-09-09). The bio text stays on record in git history.
- Projects and Notes: removed on 2026-09-09 (nothing to add yet); the pages and the note template are deleted.
- Footer on every page: one line with kate@katebonner.ai and LinkedIn (linkedin.com/in/kate-bonner). Kate removed the title block and the sheet zone marks (2026-09-09). No GitHub, Scholar, or other links.

Confirmed headline (Home), currently replaced on the page by lorem ipsum placeholder text at Kate's request (2026-09-09) until she writes new copy:
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

Signature element (binding): a 3D animation of the 1D free-particle time-dependent Schrödinger equation. Parameters since 2026-09-09, matching Kate's own 2023 animation data: hbar = m = 1, momentum width sigma = 2 (position width 0.354 at t = 0), p0 = 4 (raised from her file's 1 on 2026-09-09 so the packet visibly travels), t from 0 to 5, forward only, 12 s per loop, x from -8 to 36; the spreading dominates (width grows twenty-fold while the centre moves five units) and the amplitude is the exact normalised one: the peak falls as (1 + tau^2)^(-1/4) so the integral of |psi|^2 stays one (Kate first asked for her 2023 file's constant-amplitude form, then on the same day asked for physical accuracy; the normalised form is the record). The paper background is a fixed layer that shifts slightly in rotation, position, brightness, and warmth on every drawn frame, in step with the figure, like separate photographs in a stop-motion film (Kate, 2026-09-09); it holds still under reduced motion. The loop runs forward only over 12 s with the ink fading across the cut, because the reversed half of a ping-pong loop is not a forward evolution. A Gaussian wavepacket plotted as x versus Re(ψ) versus Im(ψ), a spiraling ribbon that travels and disperses, with no envelope, dimension, or axis lettering (Kate removed the extra details on 2026-09-09), looping by resetting smoothly. Home only. The previous site's Bloch sphere is retired and is an anti-reference, not a component to reuse.

Technical constraints: must respect `prefers-reduced-motion` (a single held frame), must degrade to the inline SVG frame when scripts are off, must not block first paint or text rendering. The figure is meant to look like a pencil sketch animated frame by frame (Kate, 2026-09-09). No analytics or tracking unless Kate asks for it later. Every claim on the site must be traceable to Kate's résumé or public work and must not contradict her LinkedIn.

Terminology: the writing section is "Notes", not "Blog" or "Writing". The site is Home only for now; Projects and Notes were removed on 2026-09-09 because there is nothing to show yet.

Undecided: how notes are authored once there are several (template copy versus a small Markdown script); whether Projects grows with Harmoniqs work, the qLDPC challenge, the Georgetown junction research, or the VR physics paper (all declined for launch); social preview image content beyond a frame of the animation.

## Brand Commitments

- Name: Kate Bonner. Domain: katebonner.ai. Site title: "Kate Bonner".
- Voice: first person, plain and direct. Short sentences, concrete nouns, no hype. Reads like a competent colleague.
- No photo of Kate anywhere on the site.
- Off-white tan paper (#F2ECE1) with burgundy ink (#7A1E2C) for every line and letter, vermilion only on hover and focus (Kate's direction, 2026-09-09). No sheet border, no hatching, no title block. Lettering stays Share Tech, with Share Tech Mono for the contact line and Atkinson Hyperlegible for prose.
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
