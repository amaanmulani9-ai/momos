# Food App Implementation Batches

## Batch 1: Discovery and Menu Conversion
- Home: restaurant search/sort and trust chips.
- Menu: persistent filters, trending/recent searches, improved ranking.
- Product detail: dietary/allergen cues and reorder indicators.
- Test plan:
  - Search and sort restaurants.
  - Verify filters persist after refresh.
  - Verify quick search chips update recent history.

## Batch 2: Cart and Checkout Reliability
- Cart: best coupon suggestion and one-tap apply.
- Checkout: stronger validation, delivery slot, tip summary, enriched notes.
- Test plan:
  - Validate phone and required fields.
  - Place order with and without tips.
  - Confirm totals and notes include slot/tip.

## Batch 3: Retention and Support Flows
- Order tracking: timeline timestamps, delay message, support CTA.
- Profile: completeness score + reorder shortcuts.
- Login: OTP resend timer.
- Contact: issue category, SLA message, ticket reference.
- Test plan:
  - Verify polling + timeline state progression.
  - Verify OTP resend unlocks after countdown.
  - Submit contact form and see ticket/SLA content.

## Batch 4: Admin Operations Console
- Add admin overview API and order status transition API.
- Admin dashboard tabs: Orders, Restaurants, Menu, Promotions, Users, Support.
- Guardrail: prevent status skipping in API.
- Test plan:
  - Change status step-by-step.
  - Attempt invalid jump and verify rejection.
  - Validate restaurants/menu/support tabs render data.
