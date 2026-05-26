(function attachBackgroundAccountBook(root, factory) {
  root.MultiPageBackgroundAccountBook = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundAccountBookModule() {
  function createAccountBookHelpers(deps = {}) {
    const {
      ACCOUNT_BOOK_STORAGE_KEY = 'accountBookEntries',
      chrome,
      getState,
    } = deps;

    function normalizeString(value = '') {
      return String(value || '').trim();
    }

    function normalizeSignupRegion(value = '') {
      const letters = String(value || '').match(/[A-Za-z]/g);
      const normalized = letters ? letters.join('').toUpperCase() : '';
      return normalized.length === 2 ? normalized : '';
    }

    function normalizePhoneDigits(value = '') {
      return String(value || '').replace(/\D+/g, '');
    }

    function normalizeRecordIdFromPhone(value = '') {
      const digits = normalizePhoneDigits(value);
      if (digits) {
        return `phone:${digits}`;
      }
      const normalized = normalizeString(value).toLowerCase();
      return normalized ? `phone:${normalized}` : '';
    }

    function normalizeRecordId(email = '', phoneNumber = '') {
      const normalizedEmail = normalizeString(email).toLowerCase();
      if (normalizedEmail) {
        return normalizedEmail;
      }
      return normalizeRecordIdFromPhone(phoneNumber);
    }

    function normalizeCaptureStage(value = '') {
      const normalized = normalizeString(value).toLowerCase();
      if (normalized === 'flow_completed') {
        return 'flow_completed';
      }
      if (normalized === 'registration_success') {
        return 'registration_success';
      }
      return normalized === 'phone_verification_passed' ? 'phone_verification_passed' : '';
    }

    function getCaptureStageRank(value = '') {
      switch (normalizeCaptureStage(value)) {
        case 'phone_verification_passed':
          return 1;
        case 'registration_success':
          return 2;
        case 'flow_completed':
          return 3;
        default:
          return 0;
      }
    }

    function normalizeTimestamp(value = '') {
      const text = normalizeString(value);
      if (!text) {
        return '';
      }
      const timestamp = Date.parse(text);
      return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : '';
    }

    function getActivationPhoneNumber(activation = null) {
      if (!activation || typeof activation !== 'object' || Array.isArray(activation)) {
        return '';
      }
      return normalizeString(
        activation.phoneNumber
        || activation.number
        || activation.phone
        || ''
      );
    }

    function resolveStatePhoneNumber(state = {}, captureStage = '') {
      const stage = normalizeCaptureStage(captureStage);
      const identifierType = normalizeString(state.accountIdentifierType).toLowerCase();
      const phoneIdentifier = identifierType === 'phone'
        ? normalizeString(state.accountIdentifier)
        : '';

      if (stage === 'phone_verification_passed' || stage === 'registration_success') {
        return normalizeString(
          state.signupPhoneNumber
          || phoneIdentifier
          || state.phoneNumber
          || state.phone
          || ''
        );
      }

      return normalizeString(
        getActivationPhoneNumber(state.signupPhoneCompletedActivation)
        || state.signupPhoneNumber
        || phoneIdentifier
        || state.phoneNumber
        || state.phone
        || ''
      );
    }

    function buildDraftEntry(state = {}, captureStage = '') {
      const stage = normalizeCaptureStage(captureStage);
      if (!stage) {
        return null;
      }

      const email = normalizeString(state.email).toLowerCase();
      const phoneNumber = resolveStatePhoneNumber(state, stage);
      const recordId = normalizeRecordId(email, phoneNumber);
      if (!recordId) {
        return null;
      }

      const now = new Date().toISOString();
      const password = normalizeString(state.password || state.customPassword || '');
      const flowId = normalizeString(state.flowId || state.activeFlowId || '');
      const panelMode = normalizeString(state.panelMode || '');
      const signupIp = normalizeString(state.ipProxyAppliedExitIp || '');
      const signupRegion = normalizeSignupRegion(state.ipProxyAppliedExitRegion || '');

      return {
        recordId,
        email,
        phoneNumber,
        password,
        flowId,
        panelMode,
        captureStage: stage,
        createdAt: now,
        updatedAt: now,
        finalFlowCompletedAt: stage === 'flow_completed' ? now : '',
        signupIp,
        signupRegion,
      };
    }

    function normalizeAccountBookEntry(entry) {
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        return null;
      }

      const email = normalizeString(entry.email).toLowerCase();
      const phoneNumber = normalizeString(entry.phoneNumber || entry.phone || entry.number || '');
      const recordId = normalizeString(entry.recordId || normalizeRecordId(email, phoneNumber)).toLowerCase();
      const captureStage = normalizeCaptureStage(entry.captureStage);
      if (!recordId || !captureStage) {
        return null;
      }

      const createdAt = normalizeTimestamp(entry.createdAt || entry.updatedAt || entry.finalFlowCompletedAt || '');
      const updatedAt = normalizeTimestamp(entry.updatedAt || entry.createdAt || entry.finalFlowCompletedAt || '');
      const finalFlowCompletedAt = captureStage === 'flow_completed'
        ? normalizeTimestamp(entry.finalFlowCompletedAt || entry.updatedAt || entry.createdAt || '')
        : normalizeTimestamp(entry.finalFlowCompletedAt || '');

      return {
        recordId,
        email,
        phoneNumber,
        password: normalizeString(entry.password || ''),
        flowId: normalizeString(entry.flowId || ''),
        panelMode: normalizeString(entry.panelMode || ''),
        captureStage,
        createdAt: createdAt || updatedAt || new Date().toISOString(),
        updatedAt: updatedAt || createdAt || new Date().toISOString(),
        finalFlowCompletedAt,
        signupIp: normalizeString(entry.signupIp || ''),
        signupRegion: normalizeSignupRegion(entry.signupRegion || ''),
      };
    }

    function normalizeAccountBookEntries(entries) {
      if (!Array.isArray(entries)) {
        return [];
      }

      const normalized = [];
      const seen = new Set();
      for (const entry of entries) {
        const item = normalizeAccountBookEntry(entry);
        if (!item || seen.has(item.recordId)) {
          continue;
        }
        seen.add(item.recordId);
        normalized.push(item);
      }

      normalized.sort((left, right) => {
        const rightTime = Date.parse(right.updatedAt || right.createdAt || '') || 0;
        const leftTime = Date.parse(left.updatedAt || left.createdAt || '') || 0;
        return rightTime - leftTime;
      });
      return normalized;
    }

    async function getPersistedAccountBookEntries() {
      try {
        const stored = await chrome.storage.local.get(ACCOUNT_BOOK_STORAGE_KEY);
        return normalizeAccountBookEntries(stored[ACCOUNT_BOOK_STORAGE_KEY]);
      } catch (error) {
        console.warn('[MultiPage:account-book] Failed to read account book entries:', error?.message || error);
        return [];
      }
    }

    async function setPersistedAccountBookEntries(entries) {
      const normalized = normalizeAccountBookEntries(entries);
      await chrome.storage.local.set({
        [ACCOUNT_BOOK_STORAGE_KEY]: normalized,
      });
      return normalized;
    }

    function mergeAccountBookEntry(existingEntry = null, draftEntry = null) {
      if (!draftEntry) {
        return existingEntry ? normalizeAccountBookEntry(existingEntry) : null;
      }
      if (!existingEntry) {
        return normalizeAccountBookEntry(draftEntry);
      }

      const normalizedExisting = normalizeAccountBookEntry(existingEntry);
      const normalizedDraft = normalizeAccountBookEntry(draftEntry);
      if (!normalizedExisting || !normalizedDraft) {
        return normalizedExisting || normalizedDraft || null;
      }

      const updatedAt = normalizedDraft.updatedAt || new Date().toISOString();
      const captureStage = getCaptureStageRank(normalizedDraft.captureStage) >= getCaptureStageRank(normalizedExisting.captureStage)
        ? normalizedDraft.captureStage
        : normalizedExisting.captureStage;
      const finalFlowCompletedAt = captureStage === 'flow_completed'
        ? normalizeTimestamp(
          normalizedDraft.finalFlowCompletedAt
          || normalizedExisting.finalFlowCompletedAt
          || updatedAt
        )
        : normalizeTimestamp(normalizedExisting.finalFlowCompletedAt || '');

      return {
        ...normalizedExisting,
        recordId: normalizedDraft.email
          || normalizedExisting.email
          || normalizedExisting.recordId
          || normalizedDraft.recordId,
        email: normalizedDraft.email || normalizedExisting.email,
        phoneNumber: normalizedDraft.phoneNumber || normalizedExisting.phoneNumber,
        password: normalizedDraft.password || normalizedExisting.password,
        flowId: normalizedDraft.flowId || normalizedExisting.flowId,
        panelMode: normalizedDraft.panelMode || normalizedExisting.panelMode,
        captureStage,
        createdAt: normalizeTimestamp(normalizedExisting.createdAt || normalizedDraft.createdAt || updatedAt) || updatedAt,
        updatedAt,
        finalFlowCompletedAt,
        signupIp: normalizedExisting.signupIp || normalizedDraft.signupIp,
        signupRegion: normalizedExisting.signupRegion || normalizedDraft.signupRegion,
      };
    }

    function findExistingEntry(entries = [], draftEntry = null) {
      if (!draftEntry) {
        return null;
      }
      const emailKey = normalizeString(draftEntry.email).toLowerCase();
      const phoneKey = normalizePhoneDigits(draftEntry.phoneNumber);
      const draftId = normalizeString(draftEntry.recordId).toLowerCase();

      return normalizeAccountBookEntries(entries).find((entry) => {
        const entryEmail = normalizeString(entry.email).toLowerCase();
        const entryPhone = normalizePhoneDigits(entry.phoneNumber);
        const entryId = normalizeString(entry.recordId).toLowerCase();
        if (emailKey && entryEmail === emailKey) {
          return true;
        }
        if (phoneKey && entryPhone && entryPhone === phoneKey) {
          return true;
        }
        return Boolean(draftId) && entryId === draftId;
      }) || null;
    }

    function upsertAccountBookEntryInList(entries = [], draftEntry = null) {
      const normalizedEntries = normalizeAccountBookEntries(entries);
      const existingEntry = findExistingEntry(normalizedEntries, draftEntry);
      const mergedEntry = mergeAccountBookEntry(existingEntry, draftEntry);
      if (!mergedEntry) {
        return normalizedEntries;
      }

      const emailKey = normalizeString(mergedEntry.email).toLowerCase();
      const phoneKey = normalizePhoneDigits(mergedEntry.phoneNumber);
      const mergedId = normalizeString(mergedEntry.recordId).toLowerCase();

      const nextEntries = normalizedEntries.filter((entry) => {
        const entryEmail = normalizeString(entry.email).toLowerCase();
        const entryPhone = normalizePhoneDigits(entry.phoneNumber);
        const entryId = normalizeString(entry.recordId).toLowerCase();
        return entryId !== mergedId
          && (!emailKey || entryEmail !== emailKey)
          && (!phoneKey || !entryPhone || entryPhone !== phoneKey);
      });
      nextEntries.unshift(mergedEntry);
      return normalizeAccountBookEntries(nextEntries);
    }

    async function upsertAccountBookEntry(stage, stateOverride = null) {
      const state = stateOverride || await getState();
      const draftEntry = buildDraftEntry(state, stage);
      if (!draftEntry) {
        return null;
      }

      const currentEntries = await getPersistedAccountBookEntries();
      const nextEntries = upsertAccountBookEntryInList(currentEntries, draftEntry);
      await setPersistedAccountBookEntries(nextEntries);
      return findExistingEntry(nextEntries, draftEntry)
        || nextEntries[0]
        || null;
    }

    async function clearAccountBookEntries() {
      const currentEntries = await getPersistedAccountBookEntries();
      await setPersistedAccountBookEntries([]);
      return {
        clearedCount: currentEntries.length,
      };
    }

    return {
      clearAccountBookEntries,
      getPersistedAccountBookEntries,
      normalizeAccountBookEntries,
      normalizeAccountBookEntry,
      setPersistedAccountBookEntries,
      upsertAccountBookEntry,
    };
  }

  return {
    createAccountBookHelpers,
  };
});
