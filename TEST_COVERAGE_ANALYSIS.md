# Test Coverage Analysis - Descansar

## Executive Summary

**Current Test Coverage: 0%**

The Descansar codebase (a PWA break timer application) currently has **no automated tests**. This analysis identifies critical areas that need testing and provides specific recommendations for implementation.

---

## Codebase Overview

| Category | Files | Lines of Code | Test Coverage |
|----------|-------|---------------|---------------|
| Core Logic | 3 | ~815 | 0% |
| Timer Modes | 2 | ~553 | 0% |
| UI Components | 3 | ~747 | 0% |
| Features | 5 | ~1,811 | 0% |
| Utilities | 2 | ~287 | 0% |
| **Total** | **16** | **~4,200** | **0%** |

---

## Priority 1: Critical - Pure Functions (Utilities)

These are the easiest to test and provide immediate value.

### `js/utils/helpers.js`

| Function | Lines | Complexity | Recommended Tests |
|----------|-------|------------|-------------------|
| `formatTime()` | 12-16 | Low | 5-7 test cases |
| `formatTimeHHMM()` | 23-28 | Low | 3-4 test cases |
| `validateNumber()` | 38-44 | Medium | 8-10 test cases |
| `validateBreakDuration()` | 52-59 | Low | 4-5 test cases |
| `debounce()` | 67-77 | Medium | 3-4 test cases |
| `generateId()` | 83-85 | Low | 2-3 test cases |
| `minutesToSeconds()` | 152-154 | Low | 3-4 test cases |
| `calculateReturnTime()` | 142-145 | Low | 3-4 test cases |

**Example test cases for `formatTime()`:**
```javascript
// Test cases needed:
formatTime(0)      // => "00:00"
formatTime(59)     // => "00:59"
formatTime(60)     // => "01:00"
formatTime(90)     // => "01:30"
formatTime(3600)   // => "60:00"
formatTime(3661)   // => "61:01"
```

**Example test cases for `validateNumber()`:**
```javascript
// Test cases needed:
validateNumber(5, 1, 10, 3)       // => 5 (valid)
validateNumber(0, 1, 10, 3)       // => 3 (below min)
validateNumber(15, 1, 10, 3)      // => 3 (above max)
validateNumber('abc', 1, 10, 3)   // => 3 (NaN)
validateNumber(null, 1, 10, 3)    // => 3 (null)
validateNumber(undefined, 1, 10, 3) // => 3 (undefined)
validateNumber('5', 1, 10, 3)     // => 5 (string number)
validateNumber(5.7, 1, 10, 3)     // => 5 (float truncated)
```

---

## Priority 2: Critical - Core Timer Logic

### `js/core/Timer.js` (270 lines)

This is the heart of the application. Testing state transitions is critical.

**State Machine Tests Needed:**

| Current State | Action | Expected State | Side Effects |
|--------------|--------|----------------|--------------|
| IDLE | start() | RUNNING | interval starts, events emitted |
| RUNNING | pause() | PAUSED | interval cleared, events emitted |
| PAUSED | resume() | RUNNING | interval restarts, events emitted |
| RUNNING | reset() | IDLE | interval cleared, time reset |
| RUNNING | tick() (time=0) | COMPLETED | complete event emitted |

**Event Emission Tests:**
```javascript
// Test that correct events are emitted with proper data
timer.on('tick', (data) => {
  expect(data).toHaveProperty('remainingSeconds');
  expect(data).toHaveProperty('totalSeconds');
  expect(data).toHaveProperty('progress');
});
```

**Edge Cases to Test:**
- Starting an already running timer (should be no-op)
- Pausing an idle timer (should be no-op)
- Resuming a running timer (should be no-op)
- Timer with 0 duration
- Timer progress calculation at boundaries

**Mocking Requirements:**
- `setInterval` and `clearInterval` need to be mocked
- Use `jest.useFakeTimers()` or Vitest equivalent

---

## Priority 3: Critical - Storage Module

### `js/core/Storage.js` (215 lines)

**Tests Needed:**

| Method | Test Scenarios |
|--------|---------------|
| `get()/set()` | Store and retrieve primitive values |
| `get()/set()` | Store and retrieve objects |
| `get()` | Return default when key doesn't exist |
| `get()` | Handle corrupted JSON gracefully |
| `remove()` | Successfully remove keys |
| `getSettings()` | Return merged defaults with stored values |
| `saveSettings()` | Merge with existing settings |
| `getStats()` | Return correct default structure |
| `addCompletedSession()` | Update streak correctly |
| `addCompletedSession()` | Limit history to 30 items |
| `getYesterday()` | Calculate correct date |

**Mocking Requirements:**
- Mock `localStorage` (jsdom provides this automatically)

**Edge Cases:**
- `localStorage` quota exceeded
- Corrupted stored data
- Cross-day streak calculations

---

## Priority 4: High - Timer Modes

### `js/modes/AdvancedMode.js` (385 lines)

**Tests Needed:**

| Feature | Test Cases |
|---------|------------|
| Technique Selection | Pomodoro preset values applied correctly |
| Technique Selection | 52/17 preset values applied correctly |
| Technique Selection | Custom settings preserved |
| Phase Transitions | Work → Short Break (cycles < threshold) |
| Phase Transitions | Work → Long Break (cycles >= threshold) |
| Phase Transitions | Break → Work |
| Cycle Counting | Cycle increments after work phase |
| Cycle Counting | Cycle resets after long break |
| Statistics | Work minutes accumulated correctly |
| Statistics | Session added to storage on complete |

**Example Test:**
```javascript
describe('AdvancedMode', () => {
  describe('getNextPhase', () => {
    it('returns SHORT_BREAK after WORK when cycles < threshold', () => {
      mode.currentPhase = PHASE_TYPES.WORK;
      mode.currentCycle = 1;
      mode.settings.cyclesBeforeLong = 4;
      expect(mode.getNextPhase()).toBe(PHASE_TYPES.SHORT_BREAK);
    });

    it('returns LONG_BREAK after WORK when cycles >= threshold', () => {
      mode.currentPhase = PHASE_TYPES.WORK;
      mode.currentCycle = 4;
      mode.settings.cyclesBeforeLong = 4;
      expect(mode.getNextPhase()).toBe(PHASE_TYPES.LONG_BREAK);
    });
  });
});
```

### `js/modes/SimpleMode.js` (168 lines)

Simpler logic but still needs testing for:
- Duration initialization
- Event forwarding from Timer
- State getters

---

## Priority 5: Medium - Feature Modules

### `js/features/Forest.js` (252 lines)

**Testable Logic (without DOM):**
- `getCurrentStage()` - returns correct stage based on progress
- `addTreeToForest()` - increments tree count in storage
- Progress calculation logic
- Growth stages threshold logic

**Example:**
```javascript
describe('Forest.getCurrentStage', () => {
  it('returns seed stage at 0%', () => {
    forest.currentProgress = 0;
    expect(forest.getCurrentStage().name).toBe('Насіння');
  });

  it('returns full tree at 100%', () => {
    forest.currentProgress = 100;
    expect(forest.getCurrentStage().name).toBe('Велике дерево');
  });
});
```

### `js/features/Exercises.js` & `js/features/EyeExercises.js`

- Exercise sequence logic
- Timer integration
- State transitions

### `js/features/AmbientSounds.js` (560 lines)

- Sound parameter calculations
- Volume control logic
- Requires Web Audio API mocking (complex)

---

## Priority 6: Lower - UI Components

### `js/ui/Display.js`, `js/ui/Controls.js`, `js/ui/Stats.js`

These require DOM interaction testing:
- Use jsdom for unit tests
- Consider Playwright/Cypress for E2E tests

**Focus on:**
- Event handler binding
- DOM state updates based on timer state
- Progress ring SVG calculations

---

## Recommended Testing Setup

### 1. Install Testing Framework

```bash
# Option A: Vitest (recommended for modern ES modules)
npm init -y
npm install -D vitest jsdom @vitest/coverage-v8

# Option B: Jest
npm install -D jest jest-environment-jsdom @babel/preset-env
```

### 2. Configuration

**vitest.config.js:**
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
    globals: true,
  },
});
```

### 3. Project Structure

```
/descansar
├── js/
│   ├── core/
│   ├── modes/
│   ├── ui/
│   ├── features/
│   └── utils/
├── tests/
│   ├── unit/
│   │   ├── utils/
│   │   │   └── helpers.test.js
│   │   ├── core/
│   │   │   ├── Timer.test.js
│   │   │   └── Storage.test.js
│   │   └── modes/
│   │       └── AdvancedMode.test.js
│   └── integration/
│       └── timer-flow.test.js
├── vitest.config.js
└── package.json
```

---

## Implementation Roadmap

### Phase 1: Foundation (Estimated: 20-30 tests)
1. Set up Vitest with jsdom
2. Test all pure functions in `helpers.js`
3. Test `Storage` module with mocked localStorage

### Phase 2: Core Logic (Estimated: 30-40 tests)
1. Test `Timer` class state machine
2. Test `Timer` event emission
3. Test timer edge cases

### Phase 3: Modes (Estimated: 25-35 tests)
1. Test `AdvancedMode` phase transitions
2. Test `AdvancedMode` technique presets
3. Test `SimpleMode` basic operations

### Phase 4: Features (Estimated: 20-30 tests)
1. Test `Forest` growth logic
2. Test `Exercises` sequences
3. Test `EyeExercises` sequences

### Phase 5: Integration (Estimated: 10-15 tests)
1. Full timer session flow
2. Mode switching
3. Statistics accumulation

---

## Coverage Targets

| Phase | Target Coverage | Focus Areas |
|-------|-----------------|-------------|
| Phase 1 | 15% | Utilities, Storage |
| Phase 2 | 40% | + Core Timer |
| Phase 3 | 60% | + Modes |
| Phase 4 | 75% | + Features |
| Phase 5 | 80%+ | + Integration |

---

## Key Risks Without Tests

1. **Timer State Bugs**: Timer may get stuck in invalid states
2. **Data Loss**: Storage operations may fail silently
3. **Broken Calculations**: Time formatting or progress calculations may be wrong
4. **Regression Risk**: Any code change could break existing functionality
5. **Phase Transition Bugs**: Pomodoro cycles may not progress correctly

---

## Quick Wins

Start with these 5 test files to achieve immediate coverage gains:

1. **`tests/unit/utils/helpers.test.js`** - ~25 tests, pure functions
2. **`tests/unit/core/Storage.test.js`** - ~15 tests, localStorage operations
3. **`tests/unit/core/Timer.test.js`** - ~20 tests, state machine
4. **`tests/unit/modes/AdvancedMode.test.js`** - ~15 tests, phase logic
5. **`tests/unit/features/Forest.test.js`** - ~10 tests, growth stages

This would provide approximately **85 tests** covering the most critical paths.

---

## Conclusion

The Descansar codebase has clean, modular architecture that is well-suited for unit testing. The lack of external dependencies (pure vanilla JS) makes testing straightforward. Starting with utility functions and core timer logic will provide the highest ROI for test coverage efforts.

**Recommended First Step**: Set up Vitest and write tests for `helpers.js` functions - this can be done in under an hour and establishes the testing pattern for the rest of the codebase.
