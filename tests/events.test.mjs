import { test } from 'node:test';
import assert from 'node:assert/strict';
import fc from 'fast-check';

const { filterByPeriod, formatDateRange } = await import('../src/lib/events.ts');
// --- Helpers --------------------------------------------------------------

function makeEvent(overrides = {}) {
  return {
    id: 'test-event',
    title: 'Test Event',
    description: null,
    date_start: '2026-09-01',
    date_end: null,
    lat: 48.8566,
    lng: 2.3522,
    city: 'Paris',
    link: null,
    status: 'published',
    ...overrides,
  };
}

const today = new Date();
const todayStr = today.toISOString().slice(0, 10);
const thisMonth = today.toISOString().slice(0, 7); // YYYY-MM

function dateInThisMonth(day = 15) {
  return `${thisMonth}-${String(day).padStart(2, '0')}`;
}

function dateInFuture(monthsAhead = 3) {
  const d = new Date(today);
  d.setMonth(d.getMonth() + monthsAhead);
  return d.toISOString().slice(0, 10);
}

function dateInPast(monthsAgo = 3) {
  const d = new Date(today);
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().slice(0, 10);
}

// --- Invariant 1: Draft events are never visible --------------------------

test('draft events are never visible regardless of period', () => {
  fc.assert(
    fc.property(fc.constant('upcoming'), fc.constant('this-month'), (p1, p2) => {
      const draft = makeEvent({ status: 'draft', date_start: dateInFuture() });
      assert.equal(filterByPeriod([draft], p1).length, 0);
      assert.equal(filterByPeriod([draft], p2).length, 0);
    }),
  );
});

// --- Invariant 2: Past events are never visible --------------------------

test('past events are never visible', () => {
  const past = makeEvent({ date_start: dateInPast() });
  assert.equal(filterByPeriod([past], 'upcoming').length, 0);
  assert.equal(filterByPeriod([past], 'this-month').length, 0);
});

// --- Invariant 3: Published upcoming events appear in "upcoming" ---------

test('published upcoming events appear in upcoming filter', () => {
  const e = makeEvent({ date_start: dateInFuture() });
  const result = filterByPeriod([e], 'upcoming');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, e.id);
});

// --- Invariant 4: "this-month" only shows events in the current month ----

test('this-month filter only shows events in the current calendar month', () => {
  const inMonth = makeEvent({ id: 'in', date_start: dateInThisMonth() });
  const future = makeEvent({ id: 'future', date_start: dateInFuture(2) });
  const result = filterByPeriod([inMonth, future], 'this-month');
  assert.equal(result.length, 1);
  assert.equal(result[0].id, 'in');
});

// --- Invariant 5: formatDateRange always returns a non-empty string -------

test('formatDateRange always returns a non-empty string', () => {
  fc.assert(
    fc.property(fc.date({ noTime: true }), fc.boolean(), (d, hasEnd) => {
      const ds = d.toISOString().slice(0, 10);
      const de = hasEnd ? ds : null;
      const result = formatDateRange(ds, de);
      assert.ok(typeof result === 'string');
      assert.ok(result.length > 0);
    }),
  );
});

// --- Invariant 6: Single-day events produce a single date string ---------

test('single-day events produce a single date string (no dash)', () => {
  const ds = '2026-09-12';
  assert.equal(formatDateRange(ds, null), formatDateRange(ds, ds));
  assert.ok(!formatDateRange(ds, null).includes('—'));
});

// --- Invariant 7: Multi-day events include an em-dash --------------------

test('multi-day events include an em-dash separator', () => {
  const result = formatDateRange('2026-09-12', '2026-09-15');
  assert.ok(result.includes('—'));
});
