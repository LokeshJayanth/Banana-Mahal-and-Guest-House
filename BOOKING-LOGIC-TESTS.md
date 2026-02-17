# 🧪 BOOKING AVAILABILITY LOGIC - TEST CASES

This document contains comprehensive test cases to verify the booking availability logic works correctly for both Function Hall and Guest House.

---

## 🏛️ FUNCTION HALL LOGIC

### Rule:
- ONE booking per date (slot doesn't matter)
- If ANY CONFIRMED/BLOCKED booking exists on a date → ❌ NOT AVAILABLE
- PENDING and REJECTED bookings do NOT block dates

### Test Scenario 1: Single Booking Blocks Entire Day

**Setup:**
```
Sheet contains:
- Function Hall | 2026-02-19 | MORNING | CONFIRMED
```

**Test Cases:**
| User Selects | Slot | Expected Result | Reason |
|--------------|------|-----------------|--------|
| 2026-02-19 | MORNING | ❌ BLOCKED | Exact match |
| 2026-02-19 | AFTERNOON | ❌ BLOCKED | Same date (slot ignored) |
| 2026-02-19 | FULL_DAY | ❌ BLOCKED | Same date (slot ignored) |
| 2026-02-18 | ANY | ✅ AVAILABLE | Different date |
| 2026-02-20 | ANY | ✅ AVAILABLE | Different date |

### Test Scenario 2: Status Filtering

**Setup:**
```
Sheet contains:
- Function Hall | 2026-02-19 | MORNING | PENDING
- Function Hall | 2026-02-20 | MORNING | REJECTED
- Function Hall | 2026-02-21 | MORNING | CONFIRMED
- Function Hall | 2026-02-22 | MORNING | BLOCKED
- Function Hall | 2026-02-23 | MORNING | CANCELLED
```

**Test Cases:**
| User Selects | Expected Result | Reason |
|--------------|-----------------|--------|
| 2026-02-19 | ✅ AVAILABLE | PENDING doesn't block |
| 2026-02-20 | ✅ AVAILABLE | REJECTED doesn't block |
| 2026-02-21 | ❌ BLOCKED | CONFIRMED blocks |
| 2026-02-22 | ❌ BLOCKED | BLOCKED blocks |
| 2026-02-23 | ❌ BLOCKED | CANCELLED blocks |

---

## 🏠 GUEST HOUSE LOGIC

### Rule:
- ONE Guest House exists (like a hotel room)
- Date range based bookings
- Uses overlap detection: `(start1 <= end2) AND (start2 <= end1)`
- If ANY overlap with CONFIRMED/BLOCKED booking → ❌ NOT AVAILABLE

### Test Scenario 1: Basic Overlap Detection

**Setup:**
```
Sheet contains:
- Guest House | 2026-02-17 to 2026-02-19 | CONFIRMED
```

**Test Cases:**

| # | User Check-in | User Check-out | Expected | Reason |
|---|---------------|----------------|----------|--------|
| 1 | 2026-02-17 | 2026-02-19 | ❌ BLOCKED | Exact match |
| 2 | 2026-02-17 | 2026-02-18 | ❌ BLOCKED | Partial overlap (start matches) |
| 3 | 2026-02-18 | 2026-02-19 | ❌ BLOCKED | Partial overlap (end matches) |
| 4 | 2026-02-18 | 2026-02-18 | ❌ BLOCKED | Single day within range |
| 5 | 2026-02-16 | 2026-02-18 | ❌ BLOCKED | Starts before, ends during |
| 6 | 2026-02-19 | 2026-02-20 | ❌ BLOCKED | Starts during, ends after |
| 7 | 2026-02-16 | 2026-02-20 | ❌ BLOCKED | Encompasses entire booking |
| 8 | 2026-02-15 | 2026-02-16 | ✅ AVAILABLE | Ends before booking starts |
| 9 | 2026-02-20 | 2026-02-22 | ✅ AVAILABLE | Starts after booking ends |

### Test Scenario 2: Multiple Bookings

**Setup:**
```
Sheet contains:
- Guest House | 2026-02-10 to 2026-02-12 | CONFIRMED
- Guest House | 2026-02-15 to 2026-02-17 | CONFIRMED
- Guest House | 2026-02-20 to 2026-02-22 | CONFIRMED
```

**Test Cases:**

| User Check-in | User Check-out | Expected | Reason |
|---------------|----------------|----------|--------|
| 2026-02-09 | 2026-02-11 | ❌ BLOCKED | Overlaps first booking |
| 2026-02-13 | 2026-02-14 | ✅ AVAILABLE | Gap between bookings |
| 2026-02-14 | 2026-02-16 | ❌ BLOCKED | Overlaps second booking |
| 2026-02-18 | 2026-02-19 | ✅ AVAILABLE | Gap between bookings |
| 2026-02-19 | 2026-02-21 | ❌ BLOCKED | Overlaps third booking |
| 2026-02-23 | 2026-02-25 | ✅ AVAILABLE | After all bookings |

### Test Scenario 3: Edge Cases

**Setup:**
```
Sheet contains:
- Guest House | 2026-02-15 to 2026-02-20 | CONFIRMED
```

**Test Cases:**

| User Check-in | User Check-out | Expected | Reason |
|---------------|----------------|----------|--------|
| 2026-02-14 | 2026-02-15 | ❌ BLOCKED | Check-out on booked check-in |
| 2026-02-20 | 2026-02-21 | ❌ BLOCKED | Check-in on booked check-out |
| 2026-02-14 | 2026-02-14 | ✅ AVAILABLE | Day before booking |
| 2026-02-21 | 2026-02-21 | ✅ AVAILABLE | Day after booking |

### Test Scenario 4: Status Filtering

**Setup:**
```
Sheet contains:
- Guest House | 2026-02-10 to 2026-02-12 | PENDING
- Guest House | 2026-02-15 to 2026-02-17 | REJECTED
- Guest House | 2026-02-20 to 2026-02-22 | CONFIRMED
- Guest House | 2026-02-25 to 2026-02-27 | BLOCKED
```

**Test Cases:**

| User Check-in | User Check-out | Expected | Reason |
|---------------|----------------|----------|--------|
| 2026-02-10 | 2026-02-12 | ✅ AVAILABLE | PENDING doesn't block |
| 2026-02-15 | 2026-02-17 | ✅ AVAILABLE | REJECTED doesn't block |
| 2026-02-20 | 2026-02-22 | ❌ BLOCKED | CONFIRMED blocks |
| 2026-02-25 | 2026-02-27 | ❌ BLOCKED | BLOCKED blocks |

---

## 🧮 OVERLAP FORMULA VERIFICATION

### Formula:
```javascript
(start1 <= end2) AND (start2 <= end1)
```

### Manual Calculation Examples:

**Example 1: Overlap Exists**
```
Booked: 2026-02-17 to 2026-02-19
User:   2026-02-18 to 2026-02-20

Check 1: userStart (18) <= bookedEnd (19) → TRUE
Check 2: bookedStart (17) <= userEnd (20) → TRUE
Result: TRUE AND TRUE = OVERLAP ❌ BLOCKED
```

**Example 2: No Overlap (Before)**
```
Booked: 2026-02-17 to 2026-02-19
User:   2026-02-15 to 2026-02-16

Check 1: userStart (15) <= bookedEnd (19) → TRUE
Check 2: bookedStart (17) <= userEnd (16) → FALSE
Result: TRUE AND FALSE = NO OVERLAP ✅ AVAILABLE
```

**Example 3: No Overlap (After)**
```
Booked: 2026-02-17 to 2026-02-19
User:   2026-02-20 to 2026-02-22

Check 1: userStart (20) <= bookedEnd (19) → FALSE
Check 2: bookedStart (17) <= userEnd (22) → TRUE
Result: FALSE AND TRUE = NO OVERLAP ✅ AVAILABLE
```

---

## 🎯 CALENDAR DISABLE LOGIC

### Function Hall Calendar:
- Disable exact date if ANY CONFIRMED/BLOCKED booking exists
- Single date comparison: `bookedDate === selectedDate`

### Guest House Calendar:
- Disable date if it falls within ANY CONFIRMED/BLOCKED booking range
- Range check: `selectedDate >= bookedStart AND selectedDate <= bookedEnd`

### Visual Example:

**Booked: Feb 17-19 (CONFIRMED)**
```
Calendar View:
15 16 [17 18 19] 20 21
✅ ✅  ❌ ❌ ❌  ✅ ✅

User can select:
- 15 to 16 ✅
- 20 to 21 ✅

User CANNOT select:
- 17 (disabled)
- 18 (disabled)
- 19 (disabled)
- Any range touching 17-19
```

---

## 🔍 DEBUGGING CHECKLIST

If availability check fails, verify:

1. **Console Logs:**
   ```
   ✅ Valid bookings loaded: X (should be > 0 if bookings exist)
   ✅ Blocking [Resource] from [start] to [end] ([status])
   ```

2. **Date Format:**
   ```
   ✅ Dates normalized to timestamps
   ✅ startTimestamp and endTimestamp exist
   ✅ startDateStr and endDateStr for display
   ```

3. **Status Filtering:**
   ```
   ✅ Only CONFIRMED, BLOCKED, CANCELLED block dates
   ✅ PENDING and REJECTED are ignored
   ```

4. **Overlap Logic:**
   ```
   ✅ Formula: (start1 <= end2) AND (start2 <= end1)
   ✅ Both conditions must be TRUE for overlap
   ```

5. **Calendar Disable:**
   ```
   ✅ Function Hall: Exact date match
   ✅ Guest House: Date within range
   ```

---

## 🚀 TESTING PROCEDURE

### Step 1: Create Test Bookings
In Google Sheet, add:
```
Function Hall | 2026-02-19 | FULL_DAY | CONFIRMED
Guest House | 2026-02-17 to 2026-02-19 | CONFIRMED
```

### Step 2: Test Function Hall
1. Open booking page
2. Select "Function Hall"
3. Try to select 2026-02-19
4. ✅ Should be disabled in calendar
5. If not disabled, check console for errors

### Step 3: Test Guest House
1. Select "Guest House"
2. Try to select check-in: 2026-02-18
3. ✅ Should be disabled in calendar
4. Try check-in: 2026-02-20, check-out: 2026-02-22
5. ✅ Should be available

### Step 4: Test Overlap
1. Select check-in: 2026-02-16
2. Select check-out: 2026-02-18
3. ✅ Should show "Not available" message
4. Check console for overlap detection logs

### Step 5: Test Status Filtering
1. Change booking status to PENDING
2. Refresh booking page
3. ✅ Date should now be available
4. Change back to CONFIRMED
5. ✅ Date should be blocked again

---

## 📊 EXPECTED CONSOLE OUTPUT

### Successful Load:
```
🚀 Premium booking page loaded
📥 Loading blocked bookings...
📦 Raw data received: [...]
✅ Blocking Function Hall from 2026-02-19 to 2026-02-19 (CONFIRMED)
✅ Blocking Guest House from 2026-02-17 to 2026-02-19 (CONFIRMED)
✅ Valid bookings loaded: 2
📅 Initializing calendar...
✅ Calendar initialized successfully
✅ Event listeners attached with security measures
```

### Availability Check:
```
🔍 Checking availability for: Guest House 2026-02-18
📋 Total bookings to check: 2
❌ Guest House BLOCKED: User range 2026-02-18 to 2026-02-20 overlaps with 2026-02-17 to 2026-02-19
   Overlap check: userStart(1739750400000) <= bookedEnd(1739923200000) = true
   Overlap check: bookedStart(1739664000000) <= userEnd(1739836800000) = true
🔍 Guest House 2026-02-18 to 2026-02-20: ❌ BLOCKED
```

---

## ✅ SUCCESS CRITERIA

All tests pass when:
- ✅ Function Hall blocks entire day regardless of slot
- ✅ Guest House blocks all overlapping date ranges
- ✅ Only CONFIRMED/BLOCKED/CANCELLED bookings block dates
- ✅ Calendar disables correct dates
- ✅ Availability check prevents double bookings
- ✅ Console logs show correct overlap detection
- ✅ No false positives (available dates blocked)
- ✅ No false negatives (blocked dates available)

---

**Last Updated**: February 17, 2026  
**Logic Version**: v2.0 - Hotel-Style Overlap Detection  
**Status**: ✅ Production Ready
