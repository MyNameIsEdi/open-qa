# API Integration Test Report

**Generated:** 2026-05-17T08:51:57.791Z

## Summary

- **Total Tests:** 6
- **Passed:** 4 ✅
- **Failed:** 2 ❌
- **Success Rate:** 66.7%
- **Avg Response Time:** 0ms

## Test Results by Status Code

### ❌ Status 400
- **Count:** 2
- **Avg Time:** 0ms

### ✅ Status 201
- **Count:** 4
- **Avg Time:** 0ms

## Detailed Results

### ❌ Test 1

**Endpoint:** POST /api/checkout
**Status:** 400
**Response Time:** 0ms
**Payload:**
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

### ✅ Test 2

**Endpoint:** POST /api/checkout
**Status:** 201
**Response Time:** 0ms
**Payload:**
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

### ✅ Test 3

**Endpoint:** POST /api/checkout
**Status:** 201
**Response Time:** 0ms
**Payload:**
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

### ❌ Test 4

**Endpoint:** POST /api/checkout
**Status:** 400
**Response Time:** 0ms
**Payload:**
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

### ✅ Test 5

**Endpoint:** POST /api/checkout
**Status:** 201
**Response Time:** 0ms
**Payload:**
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

### ✅ Test 6

**Endpoint:** POST /api/checkout
**Status:** 201
**Response Time:** 0ms
**Payload:**
```json
{
  "scenario_description": "Mock edge case #6 - long name / special chars",
  "first_name": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA🚫",
  "last_name": "O'Connor<script>alert(1)</script>",
  "email": "edgecase+5@example.com",
  "address": "שד-הרצל 12, תל-אביב",
  "cart_total": 9999999,
  "items_count": 1
}
```

## Recommendations

- Fix API validation for edge cases
- Add input sanitization for special characters
- Optimize slow endpoints (0ms max)
