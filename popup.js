'use strict';

const STORAGE_KEY = 'lastUsedGroupId';
const core = globalThis.TabMoverCore;

const selectEl = document.getElementById('group-select');
const moveButton = document.getElementById('move');
const statusEl = document.getElementById('status');

function setStatus(message, isError) {
  statusEl.textContent = message;
  statusEl.classList.toggle('error', Boolean(isError));
}

function updateMoveButtonState() {
  moveButton.disabled = selectEl.value === core.PLACEHOLDER_VALUE || selectEl.options.length === 0;
}

/** Oznacene taby v aktualnom okne (aktivny tab je vzdy medzi nimi). */
async function highlightedTabs() {
  return chrome.tabs.query({ highlighted: true, currentWindow: true });
}

function renderGroups(groups, currentWindowId, selectedGroupId) {
  selectEl.innerHTML = '';

  const placeholder = document.createElement('option');
  placeholder.value = core.PLACEHOLDER_VALUE;
  placeholder.textContent = 'vyber grupu';
  selectEl.appendChild(placeholder);

  for (const group of groups) {
    const option = document.createElement('option');
    option.value = core.groupIdToValue(group.id);
    option.textContent = core.formatGroupLabel(group, currentWindowId);
    selectEl.appendChild(option);
  }

  selectEl.value = core.groupIdToValue(selectedGroupId);
  selectEl.disabled = groups.length === 0;
}

async function init() {
  const tabs = await highlightedTabs();
  const currentWindowId = tabs[0] ? tabs[0].windowId : chrome.windows.WINDOW_ID_NONE;

  const groups = await chrome.tabGroups.query({});
  const stored = await chrome.storage.local.get(STORAGE_KEY);
  const defaultGroupId = core.selectDefaultGroupId(groups, stored[STORAGE_KEY] ?? null);

  renderGroups(groups, currentWindowId, defaultGroupId);
  updateMoveButtonState();

  if (groups.length === 0) {
    setStatus('Zatial neexistuje ziadna grupa tabov. Vytvor grupu v Chrome a skus znova.', true);
  }

  return { groups };
}

async function runMove(groups) {
  const targetGroupId = core.parseGroupIdValue(selectEl.value);
  const targetGroup = groups.find((g) => g.id === targetGroupId);
  if (!targetGroup) {
    setStatus('Najprv vyber cielovu grupu.', true);
    return;
  }

  const tabs = await highlightedTabs();
  const plan = core.buildMovePlan(tabs, targetGroup);

  if (!plan.canMove) {
    setStatus('Oznacene taby su pripnute (pinned), nie je mozne ich presunut.', true);
    return;
  }

  // Ulozit pred samotnym presunom: presun do ineho okna prepne fokus a popup
  // sa zavrie skor, nez by neskorsi await na storage.set stihol dobehnut.
  await chrome.storage.local.set({ [STORAGE_KEY]: targetGroup.id });

  if (plan.crossWindowTabIds.length > 0) {
    await chrome.tabs.move(plan.crossWindowTabIds, { windowId: targetGroup.windowId, index: -1 });
  }
  await chrome.tabs.group({ tabIds: plan.tabIds, groupId: targetGroup.id });

  const skippedNote = plan.skippedPinnedCount > 0
    ? ` (${plan.skippedPinnedCount} pripnutych tabov preskocenych)`
    : '';
  setStatus(`Presunutych ${plan.tabIds.length} tabov do grupy "${core.formatGroupLabel(targetGroup, targetGroup.windowId)}"${skippedNote}.`);
}

/** Obali akciu o blokovanie tlacidla a hlasenie chyb. */
function withGuard(action) {
  return async () => {
    moveButton.disabled = true;
    try {
      await action();
    } catch (error) {
      setStatus(`Chyba: ${error.message}`, true);
    } finally {
      updateMoveButtonState();
    }
  };
}

selectEl.addEventListener('change', updateMoveButtonState);

init().then(({ groups }) => {
  moveButton.addEventListener('click', withGuard(() => runMove(groups)));
});
