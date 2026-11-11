/*
 * Ciste jadro logiky Tab Movera - bez zavislosti na chrome API, aby sa dalo
 * testovat nad plain Node (node --test). Rovnako sa da nacitat ako klasicky
 * skript v popup kontexte (vystavi sa ako globalThis.TabMoverCore) aj cez
 * require() v testoch.
 */
(function (root, factory) {
  'use strict';
  var api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.TabMoverCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  var PLACEHOLDER_VALUE = '';

  /** Hodnota <select> (string) -> groupId (number) alebo null pre placeholder. */
  function parseGroupIdValue(value) {
    if (value === PLACEHOLDER_VALUE || value === null || value === undefined) return null;
    return Number(value);
  }

  /** groupId (number alebo null) -> hodnota <select> (string). */
  function groupIdToValue(id) {
    return id === null || id === undefined ? PLACEHOLDER_VALUE : String(id);
  }

  /** Nazov grupy na zobrazenie/triedenie, s nahradnym textom pre prazdny title. */
  function effectiveTitle(group) {
    return group.title && group.title.trim() ? group.title.trim() : '(bez nazvu)';
  }

  /** Popisok grupy do comba: nazov (alebo nahradny text) + indikator ineho okna. */
  function formatGroupLabel(group, currentWindowId) {
    var title = effectiveTitle(group);
    if (group.windowId !== currentWindowId) {
      return title + ' - ine okno';
    }
    return title;
  }

  /** Grupy zotriedene abecedne podla nazvu (sk lokalizacia, bez ohladu na velkost pismen). */
  function sortGroupsByTitle(groups) {
    return groups.slice().sort(function (a, b) {
      return effectiveTitle(a).localeCompare(effectiveTitle(b), 'sk', { sensitivity: 'base' });
    });
  }

  /**
   * Predvolene vybrana grupa pri otvoreni popupu. Ak naposledy pouzita grupa
   * uz neexistuje (bola zmazana), vracia null - teda placeholder "vyber grupu".
   */
  function selectDefaultGroupId(groups, lastUsedGroupId) {
    if (lastUsedGroupId === null || lastUsedGroupId === undefined) return null;
    var exists = groups.some(function (g) { return g.id === lastUsedGroupId; });
    return exists ? lastUsedGroupId : null;
  }

  /**
   * Naplanuje presun tabov do cielovej grupy:
   * - pripnute (pinned) taby su vynechane (Chrome ich nedovoli zoskupit)
   * - taby z ineho okna nez cielova grupa treba najprv presunut (crossWindowTabIds)
   */
  function buildMovePlan(tabs, targetGroup) {
    var movable = tabs.filter(function (t) { return !t.pinned; });
    var tabIds = movable.map(function (t) { return t.id; });
    var crossWindowTabIds = movable
      .filter(function (t) { return t.windowId !== targetGroup.windowId; })
      .map(function (t) { return t.id; });

    return {
      tabIds: tabIds,
      crossWindowTabIds: crossWindowTabIds,
      skippedPinnedCount: tabs.length - movable.length,
      canMove: tabIds.length > 0,
    };
  }

  return {
    PLACEHOLDER_VALUE: PLACEHOLDER_VALUE,
    parseGroupIdValue: parseGroupIdValue,
    groupIdToValue: groupIdToValue,
    formatGroupLabel: formatGroupLabel,
    sortGroupsByTitle: sortGroupsByTitle,
    selectDefaultGroupId: selectDefaultGroupId,
    buildMovePlan: buildMovePlan,
  };
});
