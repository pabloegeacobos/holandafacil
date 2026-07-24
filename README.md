# HolandaFácil — Platform for Spanish speakers in the Netherlands

> Status: live at [holandafacil.com](https://holandafacil.com)

## Problem

Spanish speakers who move to the Netherlands for work — often through a
staffing agency (*uitzendbureau* / ETT) — struggle to find reliable
information in their own language about paperwork, labor rights, and which
agencies are actually trustworthy. Official Dutch resources are scattered
and rarely translated, and workers frequently discover contract or salary
issues only after they've already signed.

HolandaFácil centralizes practical guides, a community space, and
crowdsourced reviews of staffing agencies so newcomers can make informed
decisions before accepting a job offer.

## Features

- **Staffing agency (ETT) directory & reviews** — browse agencies sourced
  from official ABU/SNA-certified registries, with community-submitted
  ratings covering pay accuracy, overtime, housing, and contract honesty.
- **Optional BSN identity verification** — users can voluntarily verify
  their Dutch citizen service number (validated with the official 11-check
  checksum) to signal that a review comes from a real person, without ever
  exposing the number publicly.
- **Community classifieds board** (*Tablón*) — post and browse listings
  (housing, services, travel, buy/sell) between Spain/LatAm and the
  Netherlands.
- **Practical guides** — step-by-step content on BSN registration, bank
  accounts, housing, and Dutch labor rights.
- **City pages** — localized landing pages for the main Dutch cities where
  Spanish-speaking workers relocate.
- **User accounts & dashboard** — profile, password reset flow, and
  personal missions/referrals.
- **Companies page** — landing for staffing agencies/employers, with a
  lead capture form.
- **Multi-language** — fully translated in Spanish, English, and Polish.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router) + [React 19](https://react.dev/)
- [Supabase](https://supabase.com/) (Postgres, Auth, `@supabase/ssr`)
- [next-intl](https://next-intl.dev/) for i18n
- [Tailwind CSS 4](https://tailwindcss.com/)
- TypeScript
- Deployed on [Vercel](https://vercel.com/)

## Local setup

1. Clone the repo and install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in your own Supabase
   project credentials:
   ```bash
   cp .env.example .env.local
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```

## Screenshots

[pending]

## License

All rights reserved. Contact for licensing inquiries.
