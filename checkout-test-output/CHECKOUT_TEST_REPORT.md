# E-Commerce Checkout Test Report

**Generated:** 2026-05-17T08:51:52.123Z

## Summary

- **Total Tests:** 5
- **Passed:** 3 ✅
- **Failed:** 2 ❌
- **Success Rate:** 60.0%

## Test Details

### ❌ Test 1: Checkout: edgecase+0@example.com - $-99.99

**Status:** FAIL

**Test Data:**
```json
{
  "scenario_description": "Mock edge case #1 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+0@example.com",
  "address": null,
  "cart_total": -99.99,
  "items_count": 1
}
```

**Error:** Invalid cart total: negative amount detected

**Timestamp:** 2026-05-17T08:51:52.120Z

### ✅ Test 2: Checkout: edgecase+1@example.com - $9999999

**Status:** PASS

**Test Data:**
```json
{
  "scenario_description": "Mock edge case #2 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+1@example.com",
  "address": "שד-הרצל 12, תל-אביב",
  "cart_total": 9999999,
  "items_count": 1
}
```

**Timestamp:** 2026-05-17T08:51:52.122Z

### ✅ Test 3: Checkout: edgecase+2@example.com - $9999999

**Status:** PASS

**Test Data:**
```json
{
  "scenario_description": "Mock edge case #3 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+2@example.com",
  "address": null,
  "cart_total": 9999999,
  "items_count": 1000000
}
```

**Timestamp:** 2026-05-17T08:51:52.122Z

### ❌ Test 4: Checkout: edgecase+3@example.com - $-99.99

**Status:** FAIL

**Test Data:**
```json
{
  "scenario_description": "Mock edge case #4 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+3@example.com",
  "address": "שד-הרצל 12, תל-אביב",
  "cart_total": -99.99,
  "items_count": 1
}
```

**Error:** Invalid cart total: negative amount detected

**Timestamp:** 2026-05-17T08:51:52.123Z

### ✅ Test 5: Checkout: edgecase+4@example.com - $9999999

**Status:** PASS

**Test Data:**
```json
{
  "scenario_description": "Mock edge case #5 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+4@example.com",
  "address": null,
  "cart_total": 9999999,
  "items_count": 1
}
```

**Timestamp:** 2026-05-17T08:51:52.123Z

## Recommendations

- Review failed test cases for edge case handling
- Verify form validation logic with generated payloads
- Consider adding more error recovery patterns
