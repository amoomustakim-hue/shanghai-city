# WhatsApp bot plan (modelled on Cravvingss)

Two jobs: **riders book rides and see fares**, and **drivers receive and accept rides**.
The onboarding copies how Cravvingss does it (`backend/src/channels/`, `core/conversation/`).

## How people arrive
- A `wa.me` link with prefilled text, one per audience:
  "Hi SheDrives, I want a ride" and "Hi SheDrives, I want to drive".
- The first message is matched **deterministically** (no AI) to pick the path, exactly like Cravvingss's
  `routeStarterMessage`: rider, driver, or "not sure" (then we ask).

## Rider onboarding, all in chat
1. **Welcome** and a choice: *Book a ride* / *Drive with SheDrives*.
2. **Terms**: a short message with the terms and privacy links and one **I agree** button. The tap is
   recorded (Cravvingss's `termsGate`), so we can show every rider accepted.
3. **Verification** (proposal item 02): name, ID details and a selfie, sent as photos in chat or through
   a one-tap web link; an admin approves. Riders can't book until approved.
4. Done. Next time they message, they go straight to booking.

## Booking in chat
1. Pickup: share a **location pin** (or type an area); remembered for next time.
2. Destination: pin or typed address.
3. **Fare quote** before booking: estimated minutes ÷ 60 × ₦20,000. Buttons: *Book now* / *Change*.
4. Payment link (one gateway), or cash rules if agreed.
5. **Driver found** card: name, photo, rating, car, plate number.
6. Trip updates (arriving, arrived, started, completed) and a **1 to 5 rating** reply at the end.
7. Global words that always work: `home`, `cancel`, `support`.

## Driver onboarding
- "I want to drive" replies with a **one-tap secure link** to the web sign-up form (Cravvingss's
  dashboard link: single use, expires in 15 minutes, no password; login is a WhatsApp code).
  Documents, vehicle photos and the inspection centre are collected on the web form, because uploading
  several documents in a chat is painful.
- Status updates come back to WhatsApp: received, inspection booked, approved, subscription due.

## Drivers receiving rides
- A new ride arrives as a WhatsApp message with **Accept** and **Pass** buttons (Cravvingss's
  `courier-actions`): pickup area, destination, estimated time and fare, rider rating.
- First driver to accept gets it; the others' buttons say it was taken.
- Only drivers with an **active subscription** (₦20,000 weekly or ₦75,000 monthly) are offered rides.
- "Decide in chat, drive in the app": the trip itself (arrived, started, completed, live location) runs in
  the driver app, because a chat thread can't share live GPS.

## Security rules carried over from Cravvingss
- Who someone is comes from their WhatsApp number and our server tokens, never from what they type.
- Webhook signatures are verified; a failed handler still returns 200 so Meta doesn't replay it.

## Open questions for the She Drives team
- Who may book in the MVP: women only, or anyone with drivers defaulting to women passengers?
- Rider verification: required before the first ride, or only for some trips?
- Payment: online only, or cash too?
- Which WhatsApp number, and is it on the WhatsApp Business API (Meta Cloud API) yet?
