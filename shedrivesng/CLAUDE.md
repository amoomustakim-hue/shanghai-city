# She Drives NG: working rules for Claude Code

## What this is
Ride hailing in Nigeria with female drivers: website, rider and driver apps, admin portal, government
revenue portal, and a WhatsApp bot. Read `docs/product.md` (from the proposal) and `docs/brand.md` first.

## Git
- Work on a branch (`feat/…`, `fix/…`, `chore/…`), never directly on `main`.
- After every change: open a PR into `main` and merge it.

## Copy and content
- Never invent facts: no made-up stats, testimonials, partners, prices, phone numbers, emails or handles.
  Use a placeholder like `[PHONE]` until the founder confirms the real one. Contacts already confirmed
  from the brand's own graphics are listed in `docs/brand.md`.
- No em or en dashes in user-facing copy.
- Money is naira, stored as integer kobo in code.

## Design
- Brand colours, type and motifs: `docs/brand.md`. The current site is a reference for pages and functions
  only, not for look.
- Test every page at phone width (360 to 430px) and on desktop. No horizontal scroll.
