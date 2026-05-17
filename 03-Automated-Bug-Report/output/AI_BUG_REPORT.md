## Bug: locator.click: Timeout 30000ms exceeded.

**Severity:** High
**Component:** Checkout / Payments

### Description
The automated checkout test failed while clicking the payment submit control. The element remained disabled and was later detached from the DOM, indicating unstable UI state during a failed payment API call.

### Root Cause Analysis
Playwright timed out waiting for `button[data-testid="submit-payment"]` to become enabled. Network logs show `POST /v1/payments` returned HTTP 500 (Payment Gateway Timeout, code 5004). The UI likely disables the submit button during payment processing but does not re-enable or recover when the API fails.

### Steps to Reproduce
1. Navigate to checkout with a valid cart total ($49.99).
2. Proceed to the payment step.
3. Trigger payment submission while the payment gateway returns 500.
4. Observe the submit button stays disabled or is removed from the DOM.
5. Run `checkout-flow.spec.ts` — click on submit-payment times out after 30s.

### Suggested Fix
- Handle payment API 500 responses: re-enable the submit button and show an error state.
- Add retry/backoff or user-visible failure messaging in `CheckoutPage.submitPayment`.
- Investigate payment gateway timeout (code 5004) with the payments service team.
