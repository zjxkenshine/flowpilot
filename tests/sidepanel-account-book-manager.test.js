const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function createClassList() {
  const classNames = new Set();
  return {
    add(...values) {
      values.forEach((value) => classNames.add(String(value)));
    },
    remove(...values) {
      values.forEach((value) => classNames.delete(String(value)));
    },
    toggle(value, force) {
      const key = String(value);
      if (force === undefined) {
        if (classNames.has(key)) {
          classNames.delete(key);
          return false;
        }
        classNames.add(key);
        return true;
      }
      if (force) {
        classNames.add(key);
        return true;
      }
      classNames.delete(key);
      return false;
    },
    contains(value) {
      return classNames.has(String(value));
    },
  };
}

function createNode(initial = {}) {
  return {
    innerHTML: '',
    textContent: '',
    hidden: false,
    disabled: false,
    listeners: {},
    classList: createClassList(),
    attributes: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    setAttribute(name, value) {
      this.attributes[name] = String(value);
    },
    getAttribute(name) {
      return this.attributes[name];
    },
    ...initial,
  };
}

function createClosestTarget(matches = {}) {
  return {
    closest(selector) {
      return matches[selector] || null;
    },
  };
}

function createAttrNode(attrName, attrValue) {
  return {
    getAttribute(name) {
      return name === attrName ? attrValue : '';
    },
  };
}

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
}

test('sidepanel html contains account book overlay, button order, and manager script', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');
  const accountIndex = html.indexOf('id="btn-open-account-book"');
  const recordsIndex = html.indexOf('id="btn-open-account-records"');
  const clearIndex = html.indexOf('id="btn-clear-log"');
  const managerIndex = html.indexOf('<script src="account-book-manager.js"></script>');
  const sidepanelIndex = html.indexOf('<script src="sidepanel.js"></script>');

  assert.match(html, /id="btn-open-account-book"/);
  assert.match(html, /id="account-book-overlay"/);
  assert.match(html, /id="account-book-body"/);
  assert.match(html, /id="btn-export-account-book"/);
  assert.match(html, /id="btn-clear-account-book"/);
  assert.ok(accountIndex >= 0 && recordsIndex >= 0 && clearIndex >= 0);
  assert.ok(accountIndex < recordsIndex);
  assert.ok(recordsIndex < clearIndex);
  assert.notEqual(managerIndex, -1);
  assert.notEqual(sidepanelIndex, -1);
  assert.ok(managerIndex < sidepanelIndex);
});

test('sidepanel source wires account book manager and latest-state rendering', () => {
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

  assert.match(source, /const btnOpenAccountBook = document\.getElementById\('btn-open-account-book'\);/);
  assert.match(source, /window\.SidepanelAccountBookManager\?\.createAccountBookManager/);
  assert.match(source, /downloadTextFile,/);
  assert.match(source, /renderAccountBook\(latestState\);/);
});

test('sidepanel css keeps confirm modal above account book overlay', () => {
  const css = fs.readFileSync('sidepanel/sidepanel.css', 'utf8');
  const overlayMatch = css.match(/\.account-book-overlay\s*\{[\s\S]*?z-index:\s*(\d+);/);
  const modalMatch = css.match(/\.modal-overlay\s*\{[\s\S]*?z-index:\s*(\d+);/);

  assert.ok(overlayMatch, 'missing account book overlay z-index');
  assert.ok(modalMatch, 'missing modal overlay z-index');
  assert.ok(Number(modalMatch[1]) > Number(overlayMatch[1]));
});

test('account book manager masks passwords by default, toggles display, exports json, and clears entries', async () => {
  const source = fs.readFileSync('sidepanel/account-book-manager.js', 'utf8');
  const windowObject = {};
  const api = new Function('window', `${source}; return window.SidepanelAccountBookManager;`)(windowObject);

  let latestState = {
    accountBookEntries: [
      {
        recordId: 'flow@example.com',
        email: 'flow@example.com',
        phoneNumber: '+15551234567',
        password: 'secret-pass',
        flowId: 'openai',
        panelMode: 'sub2api',
        captureStage: 'flow_completed',
        createdAt: '2026-05-24T10:00:00.000Z',
        updatedAt: '2026-05-24T10:05:00.000Z',
        finalFlowCompletedAt: '2026-05-24T10:05:00.000Z',
      },
    ],
  };
  const downloads = [];
  const toasts = [];
  const dom = {
    accountBookOverlay: createNode({ hidden: true }),
    accountBookCount: createNode(),
    accountBookBody: createNode(),
    btnOpenAccountBook: createNode(),
    btnExportAccountBook: createNode(),
    btnClearAccountBook: createNode(),
    btnCloseAccountBook: createNode(),
  };

  const manager = api.createAccountBookManager({
    state: {
      getLatestState: () => latestState,
      syncLatestState(nextState) {
        latestState = { ...latestState, ...(nextState || {}) };
      },
    },
    dom,
    helpers: {
      escapeHtml: (value) => String(value || ''),
      downloadTextFile(content, fileName, mimeType) {
        downloads.push({ content, fileName, mimeType });
      },
      openConfirmModal: async () => true,
      showToast(message, tone) {
        toasts.push({ message, tone });
      },
    },
    runtime: {
      sendMessage: async (message) => {
        if (message.type === 'CLEAR_ACCOUNT_BOOK') {
          return { clearedCount: 1 };
        }
        return {};
      },
    },
  });

  manager.bindEvents();
  manager.render();

  assert.match(dom.accountBookCount.textContent, /共 1 条账号信息/);
  assert.match(dom.accountBookBody.innerHTML, /flow@example\.com/);
  assert.match(dom.accountBookBody.innerHTML, /\+15551234567/);
  assert.match(dom.accountBookBody.innerHTML, /••••••••/);
  assert.doesNotMatch(dom.accountBookBody.innerHTML, /secret-pass/);

  dom.accountBookBody.listeners.click({
    target: createClosestTarget({
      '[data-account-book-toggle-password]': createAttrNode('data-account-book-toggle-password', 'flow@example.com'),
    }),
  });

  assert.match(dom.accountBookBody.innerHTML, /secret-pass/);
  assert.match(dom.accountBookBody.innerHTML, />隐藏</);

  await dom.btnExportAccountBook.listeners.click();
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].mimeType, 'application/json;charset=utf-8');
  assert.match(downloads[0].fileName, /^flowpilot-account-book-\d{8}-\d{6}\.json$/);
  const exported = JSON.parse(downloads[0].content);
  assert.equal(exported.count, 1);
  assert.equal(exported.entries[0].password, 'secret-pass');

  await dom.btnClearAccountBook.listeners.click();
  await flushPromises();

  assert.deepStrictEqual(latestState.accountBookEntries, []);
  assert.deepStrictEqual(toasts.at(-1), {
    message: '已清空 1 条账号信息。',
    tone: 'success',
  });
});
