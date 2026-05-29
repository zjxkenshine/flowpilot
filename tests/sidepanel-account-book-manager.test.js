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
  assert.match(html, /<th>状态<\/th>/);
  assert.match(html, /<th>免费<\/th>/);
  assert.match(html, /<th>IP<\/th>/);
  assert.match(html, /colspan="6"/);
  assert.ok(accountIndex >= 0 && recordsIndex >= 0 && clearIndex >= 0);
  assert.ok(accountIndex < recordsIndex);
  assert.ok(recordsIndex < clearIndex);
  assert.notEqual(managerIndex, -1);
  assert.notEqual(sidepanelIndex, -1);
  assert.ok(managerIndex < sidepanelIndex);
});

test('account book manager renders empty signup IP as placeholder', () => {
  const source = fs.readFileSync('sidepanel/account-book-manager.js', 'utf8');
  const windowObject = {};
  const api = new Function('window', `${source}; return window.SidepanelAccountBookManager;`)(windowObject);

  const dom = {
    accountBookCount: createNode(),
    accountBookBody: createNode(),
  };

  const manager = api.createAccountBookManager({
    state: {
      getLatestState: () => ({
        accountBookEntries: [
          {
            recordId: 'missing-ip@example.com',
            email: 'missing-ip@example.com',
            phoneNumber: '+15550001111',
            password: 'secret-pass',
            captureStage: 'registration_success',
            createdAt: '2026-05-24T10:00:00.000Z',
            updatedAt: '2026-05-24T10:00:00.000Z',
          },
        ],
      }),
    },
    dom,
    helpers: {
      escapeHtml: (value) => String(value || ''),
    },
    runtime: {},
  });

  manager.render();

  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-registration-success/);
  assert.match(dom.accountBookBody.innerHTML, />注册成功</);
  assert.match(dom.accountBookBody.innerHTML, /account-book-free-chip free-status-unknown/);
  assert.match(dom.accountBookBody.innerHTML, />未知</);
  assert.match(dom.accountBookBody.innerHTML, /<td class="mono account-book-cell account-book-ip-cell">--<\/td>/);
});

test('sidepanel source wires account book manager and latest-state rendering', () => {
  const source = fs.readFileSync('sidepanel/sidepanel.js', 'utf8');

  assert.match(source, /const btnOpenAccountBook = document\.getElementById\('btn-open-account-book'\);/);
  assert.match(source, /window\.SidepanelAccountBookManager\?\.createAccountBookManager/);
  assert.match(source, /downloadTextFile,/);
  assert.match(source, /openActionModal,/);
  assert.match(source, /renderAccountBook\(latestState\);/);
});

test('sidepanel css keeps confirm modal above account book overlay', () => {
  const css = fs.readFileSync('sidepanel/sidepanel.css', 'utf8');
  const overlayMatch = css.match(/\.account-book-overlay\s*\{[\s\S]*?z-index:\s*(\d+);/);
  const modalMatch = css.match(/\.modal-overlay\s*\{[\s\S]*?z-index:\s*(\d+);/);

  assert.ok(overlayMatch, 'missing account book overlay z-index');
  assert.ok(modalMatch, 'missing modal overlay z-index');
  assert.ok(Number(modalMatch[1]) > Number(overlayMatch[1]));
  assert.match(css, /\.account-book-status-chip\.status-phone-verified/);
  assert.match(css, /\.account-book-status-chip\.status-profile-submitted/);
  assert.match(css, /\.account-book-status-chip\.status-registration-success/);
  assert.match(css, /\.account-book-status-chip\.status-flow-completed/);
  assert.match(css, /\.account-book-status-chip\.status-unknown/);
  assert.match(css, /\.account-book-free-chip\.free-status-free/);
  assert.match(css, /\.account-book-free-chip\.free-status-paid/);
  assert.match(css, /\.account-book-free-chip\.free-status-plus/);
  assert.match(css, /\.account-book-free-chip\.free-status-unknown/);
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
        signupIp: '203.0.113.8',
        signupRegion: 'jp',
        freeStatus: 'paid',
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
      downloadTextFile(content, fileName, mimeType, options) {
        downloads.push({ content, fileName, mimeType, options });
      },
      openActionModal: async (options) => {
        assert.equal(options.title, '导出账号信息');
        assert.equal(options.message, '请选择账号簿的导出格式。');
        assert.deepEqual(options.actions.map((action) => action.id), [null, 'json', 'txt']);
        return 'json';
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
  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-flow-completed/);
  assert.match(dom.accountBookBody.innerHTML, />导入成功</);
  assert.match(dom.accountBookBody.innerHTML, /account-book-free-chip free-status-paid/);
  assert.match(dom.accountBookBody.innerHTML, />付费</);
  assert.match(dom.accountBookBody.innerHTML, /203\.0\.113\.8 \[JP\]/);
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
  assert.deepEqual(downloads[0].options, { prependUtf8Bom: true });
  assert.match(downloads[0].fileName, /^flowpilot-account-book-\d{8}-\d{6}\.json$/);
  const exported = JSON.parse(downloads[0].content);
  assert.equal(exported.count, 1);
  assert.equal(exported.entries[0].password, 'secret-pass');
  assert.equal(exported.entries[0].captureStage, 'flow_completed');
  assert.equal(exported.entries[0].statusLabel, '导入成功');
  assert.equal(exported.entries[0].freeStatus, 'paid');
  assert.equal(exported.entries[0].freeStatusLabel, '付费');
  assert.equal(exported.entries[0].signupIp, '203.0.113.8');
  assert.equal(exported.entries[0].signupRegion, 'JP');

  await dom.btnClearAccountBook.listeners.click();
  await flushPromises();

  assert.deepStrictEqual(latestState.accountBookEntries, []);
  assert.deepStrictEqual(toasts.at(-1), {
    message: '已清空 1 条账号信息。',
    tone: 'success',
  });
});

test('account book manager exports utf8 bom txt with readable 6-column table', async () => {
  const source = fs.readFileSync('sidepanel/account-book-manager.js', 'utf8');
  const windowObject = {};
  const api = new Function('window', `${source}; return window.SidepanelAccountBookManager;`)(windowObject);

  const downloads = [];
  const dom = {
    btnExportAccountBook: createNode(),
  };
  const manager = api.createAccountBookManager({
    state: {
      getLatestState: () => ({
        accountBookEntries: [
          {
            recordId: 'complete@example.com',
            email: 'complete@example.com',
            phoneNumber: '+15551234567',
            password: 'secret-pass',
            captureStage: 'flow_completed',
            createdAt: '2026-05-24T10:00:00.000Z',
            updatedAt: '2026-05-24T10:05:00.000Z',
            signupIp: '203.0.113.8',
            signupRegion: 'us',
            freeStatus: 'free',
          },
          {
            recordId: 'empty@example.com',
            email: '',
            phoneNumber: '',
            password: '',
            captureStage: 'profile_submitted',
            createdAt: '2026-05-23T10:00:00.000Z',
            updatedAt: '2026-05-23T10:00:00.000Z',
            signupIp: '',
            signupRegion: '',
          },
        ],
      }),
    },
    dom,
    helpers: {
      downloadTextFile(content, fileName, mimeType, options) {
        downloads.push({ content, fileName, mimeType, options });
      },
      openActionModal: async (options) => {
        assert.deepEqual(options.actions.map((action) => action.label), ['取消', '导出 JSON', '导出 TXT']);
        return 'txt';
      },
      showToast() {},
    },
    runtime: {},
  });

  manager.bindEvents();
  await dom.btnExportAccountBook.listeners.click();

  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].mimeType, 'text/plain;charset=utf-8');
  assert.deepEqual(downloads[0].options, { prependUtf8Bom: true });
  assert.match(downloads[0].fileName, /^flowpilot-account-book-\d{8}-\d{6}\.txt$/);
  assert.match(downloads[0].content, /^# FlowPilot Account Book Export\r\n# schemaVersion=1\r\n# encoding=UTF-8\r\n# exportedAt=/);
  assert.match(downloads[0].content, /\r\n# count=2\r\n\r\n邮箱\t手机号\t密码\t状态\t免费\tIP\r\n/);
  assert.match(downloads[0].content, /complete@example\.com\t\+15551234567\tsecret-pass\t导入成功\t免费\t203\.0\.113\.8 \[US\]\r\n/);
  assert.match(downloads[0].content, /--\t--\t--\t填写成功\t未知\t--\r\n$/);
});

test('account book manager renders all status labels with matching classes', () => {
  const source = fs.readFileSync('sidepanel/account-book-manager.js', 'utf8');
  const windowObject = {};
  const api = new Function('window', `${source}; return window.SidepanelAccountBookManager;`)(windowObject);

  const dom = {
    accountBookCount: createNode(),
    accountBookBody: createNode(),
  };

  const manager = api.createAccountBookManager({
    state: {
      getLatestState: () => ({
        accountBookEntries: [
          {
            recordId: 'phone-only',
            email: '',
            phoneNumber: '+15550001111',
            password: '',
            captureStage: 'phone_verification_passed',
            createdAt: '2026-05-24T10:03:00.000Z',
            updatedAt: '2026-05-24T10:03:00.000Z',
          },
          {
            recordId: 'profile-submitted@example.com',
            email: 'profile-submitted@example.com',
            phoneNumber: '+15550004444',
            password: '',
            captureStage: 'profile_submitted',
            createdAt: '2026-05-24T10:02:30.000Z',
            updatedAt: '2026-05-24T10:02:30.000Z',
          },
          {
            recordId: 'registered@example.com',
            email: 'registered@example.com',
            phoneNumber: '+15550002222',
            password: '',
            captureStage: 'registration_success',
            createdAt: '2026-05-24T10:02:00.000Z',
            updatedAt: '2026-05-24T10:02:00.000Z',
          },
          {
            recordId: 'completed@example.com',
            email: 'completed@example.com',
            phoneNumber: '+15550003333',
            password: '',
            captureStage: 'flow_completed',
            createdAt: '2026-05-24T10:01:00.000Z',
            updatedAt: '2026-05-24T10:01:00.000Z',
          },
        ],
      }),
    },
    dom,
    helpers: {
      escapeHtml: (value) => String(value || ''),
    },
    runtime: {},
  });

  manager.render();

  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-phone-verified/);
  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-profile-submitted/);
  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-registration-success/);
  assert.match(dom.accountBookBody.innerHTML, /account-book-status-chip status-flow-completed/);
  assert.match(dom.accountBookBody.innerHTML, />验证成功</);
  assert.match(dom.accountBookBody.innerHTML, />填写成功</);
  assert.match(dom.accountBookBody.innerHTML, />注册成功</);
  assert.match(dom.accountBookBody.innerHTML, />导入成功</);
});
