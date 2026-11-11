'use strict';

const test = require('node:test');
const assert = require('node:assert');

const core = require('../src/tab-mover-core.js');

test('groupIdToValue/parseGroupIdValue: round-trip medzi cislom a hodnotou <select>', () => {
  assert.strictEqual(core.groupIdToValue(5), '5');
  assert.strictEqual(core.groupIdToValue(null), core.PLACEHOLDER_VALUE);
  assert.strictEqual(core.parseGroupIdValue('5'), 5);
  assert.strictEqual(core.parseGroupIdValue(core.PLACEHOLDER_VALUE), null);
});

test('formatGroupLabel: pouzije title grupy', () => {
  const group = { id: 1, windowId: 10, title: 'Prace', color: 'blue' };
  assert.strictEqual(core.formatGroupLabel(group, 10), 'Prace');
});

test('formatGroupLabel: bez title vrati nahradny nazov', () => {
  const group = { id: 1, windowId: 10, title: '', color: 'blue' };
  assert.strictEqual(core.formatGroupLabel(group, 10), '(bez nazvu)');
});

test('formatGroupLabel: grupa v inom okne ma indikator', () => {
  const group = { id: 1, windowId: 99, title: 'Prace', color: 'blue' };
  assert.strictEqual(core.formatGroupLabel(group, 10), 'Prace - ine okno');
});

test('formatGroupLabel: grupa v aktualnom okne nema indikator', () => {
  const group = { id: 1, windowId: 10, title: 'Prace', color: 'blue' };
  assert.strictEqual(core.formatGroupLabel(group, 10), 'Prace');
});

test('selectDefaultGroupId: vrati naposledy pouzitu grupu, ak este existuje', () => {
  const groups = [{ id: 1 }, { id: 2 }, { id: 3 }];
  assert.strictEqual(core.selectDefaultGroupId(groups, 2), 2);
});

test('selectDefaultGroupId: ak naposledy pouzita grupa uz neexistuje, vrati null (placeholder)', () => {
  const groups = [{ id: 1 }, { id: 3 }];
  assert.strictEqual(core.selectDefaultGroupId(groups, 2), null);
});

test('selectDefaultGroupId: ak ziadna grupa nebola este pouzita, vrati null (placeholder)', () => {
  const groups = [{ id: 1 }, { id: 3 }];
  assert.strictEqual(core.selectDefaultGroupId(groups, null), null);
  assert.strictEqual(core.selectDefaultGroupId(groups, undefined), null);
});

test('selectDefaultGroupId: bez grup vrati null', () => {
  assert.strictEqual(core.selectDefaultGroupId([], 2), null);
});

test('buildMovePlan: obycajny presun v ramci toho isteho okna', () => {
  const tabs = [
    { id: 11, windowId: 10, pinned: false },
    { id: 12, windowId: 10, pinned: false },
  ];
  const targetGroup = { id: 100, windowId: 10 };
  const plan = core.buildMovePlan(tabs, targetGroup);
  assert.deepStrictEqual(plan, {
    tabIds: [11, 12],
    crossWindowTabIds: [],
    skippedPinnedCount: 0,
    canMove: true,
  });
});

test('buildMovePlan: taby z ineho okna treba najprv presunut', () => {
  const tabs = [
    { id: 11, windowId: 10, pinned: false },
    { id: 12, windowId: 20, pinned: false },
  ];
  const targetGroup = { id: 100, windowId: 10 };
  const plan = core.buildMovePlan(tabs, targetGroup);
  assert.deepStrictEqual(plan, {
    tabIds: [11, 12],
    crossWindowTabIds: [12],
    skippedPinnedCount: 0,
    canMove: true,
  });
});

test('buildMovePlan: pripnute (pinned) taby sa vynechaju', () => {
  const tabs = [
    { id: 11, windowId: 10, pinned: true },
    { id: 12, windowId: 10, pinned: false },
  ];
  const targetGroup = { id: 100, windowId: 10 };
  const plan = core.buildMovePlan(tabs, targetGroup);
  assert.deepStrictEqual(plan, {
    tabIds: [12],
    crossWindowTabIds: [],
    skippedPinnedCount: 1,
    canMove: true,
  });
});

test('buildMovePlan: ak su vsetky taby pripnute, canMove je false', () => {
  const tabs = [
    { id: 11, windowId: 10, pinned: true },
  ];
  const targetGroup = { id: 100, windowId: 10 };
  const plan = core.buildMovePlan(tabs, targetGroup);
  assert.deepStrictEqual(plan, {
    tabIds: [],
    crossWindowTabIds: [],
    skippedPinnedCount: 1,
    canMove: false,
  });
});

test('buildMovePlan: prazdny zoznam tabov -> canMove false', () => {
  const targetGroup = { id: 100, windowId: 10 };
  const plan = core.buildMovePlan([], targetGroup);
  assert.deepStrictEqual(plan, {
    tabIds: [],
    crossWindowTabIds: [],
    skippedPinnedCount: 0,
    canMove: false,
  });
});
