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
    value: '',
    files: [],
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
    appendChild(node) {
      if (!this.children) {
        this.children = [];
      }
      this.children.push(node);
    },
    click() {
      this.clicked = true;
    },
    ...initial,
  };
}

async function flushPromises() {
  await new Promise((resolve) => setImmediate(resolve));
  await new Promise((resolve) => setImmediate(resolve));
}

test('sidepanel html exposes PayPal hosted sms pool export and file import controls', () => {
  const html = fs.readFileSync('sidepanel/sidepanel.html', 'utf8');

  assert.match(html, /id="btn-hosted-sms-pool-export"/);
  assert.match(html, /id="btn-hosted-sms-pool-import-file"/);
  assert.match(html, /id="input-hosted-sms-pool-import-file"/);
  assert.match(html, /accept="\.txt,text\/plain"/);
});

test('hosted sms pool manager exports utf8 txt payload with meta and restores from file import', async () => {
  const source = fs.readFileSync('sidepanel/hosted-sms-pool-manager.js', 'utf8');
  const documentObject = {
    createElement() {
      return {
        className: '',
        innerHTML: '',
        querySelector() {
          return { addEventListener() {} };
        },
      };
    },
  };
  const windowObject = { document: documentObject };
  const api = new Function('window', 'document', `${source}; return window.SidepanelHostedSmsPoolManager;`)(windowObject, documentObject);

  let latest = {
    text: '1234567890----https://example.com/api/verify-1\n0987654321----https://example.com/api/verify-2',
    usage: {
      '1234567890----https://example.com/api/verify-1': {
        useCount: 2,
        usedAt: 1710000000000,
        lastAttemptAt: 1710000001000,
        lastError: 'timeout',
      },
      stale: {
        useCount: 9,
        usedAt: 1,
        lastAttemptAt: 1,
        lastError: 'stale',
      },
    },
    currentEntry: {
      key: '1234567890----https://example.com/api/verify-1',
      phone: '1234567890',
      verificationUrl: 'https://example.com/api/verify-1',
    },
  };
  const downloads = [];
  const toasts = [];
  const confirms = [];
  const dom = {
    hostedSmsPoolSummary: createNode(),
    hostedSmsPoolList: createNode(),
    btnHostedSmsPoolRefresh: createNode(),
    btnHostedSmsPoolExport: createNode(),
    btnHostedSmsPoolClearUsed: createNode(),
    btnHostedSmsPoolDeleteAll: createNode(),
    btnHostedSmsPoolImport: createNode(),
    btnHostedSmsPoolImportFile: createNode(),
    inputHostedSmsPoolImport: createNode(),
    inputHostedSmsPoolImportFile: createNode(),
    inputHostedSmsPoolSearch: createNode(),
    selectHostedSmsPoolFilter: createNode({ value: 'all' }),
  };

  const manager = api.createHostedSmsPoolManager({
    dom,
    helpers: {
      copyTextToClipboard: async () => {},
      downloadTextFile(content, fileName, mimeType, options) {
        downloads.push({ content, fileName, mimeType, options });
      },
      escapeHtml: (value) => String(value || ''),
      openConfirmModal: async (options) => {
        confirms.push(options);
        return true;
      },
      showToast(message, tone) {
        toasts.push({ message, tone });
      },
    },
    state: {
      getText: () => latest.text,
      setText: (text) => {
        latest.text = String(text || '');
      },
      getUsage: () => latest.usage,
      setUsage: (usage) => {
        latest.usage = usage;
      },
      getCurrentEntry: () => latest.currentEntry,
      setCurrentEntry: (entry) => {
        latest.currentEntry = entry;
      },
      isVisible: () => true,
    },
    actions: {
      persistPool: async () => {},
    },
    constants: {
      copyIcon: '',
    },
  });

  manager.bindEvents();
  manager.render();

  await dom.btnHostedSmsPoolExport.listeners.click();
  assert.equal(downloads.length, 1);
  assert.equal(downloads[0].mimeType, 'text/plain;charset=utf-8');
  assert.equal(downloads[0].options.prependUtf8Bom, true);
  assert.match(downloads[0].fileName, /^flowpilot-paypal-sms-pool-\d{8}-\d{6}\.txt$/);
  assert.match(downloads[0].content, /^# FlowPilot PayPal SMS Pool Export\r\n# schemaVersion=1\r\n# encoding=UTF-8\r\n# exportedAt=/);
  assert.match(downloads[0].content, /\r\n\r\n1234567890----https:\/\/example\.com\/api\/verify-1\r\n0987654321----https:\/\/example\.com\/api\/verify-2$/);
  const metaLine = downloads[0].content.split('\r\n').find((line) => line.startsWith('# meta='));
  const meta = JSON.parse(metaLine.slice('# meta='.length));
  assert.equal(meta.currentKey, '1234567890----https://example.com/api/verify-1');
  assert.equal(meta.usage['1234567890----https://example.com/api/verify-1'].useCount, 2);
  assert.equal(Object.prototype.hasOwnProperty.call(meta.usage, 'stale'), false);

  const importFile = {
    name: 'pool.txt',
    async text() {
      return downloads[0].content;
    },
  };
  dom.inputHostedSmsPoolImportFile.files = [importFile];
  await dom.btnHostedSmsPoolImportFile.listeners.click();
  dom.inputHostedSmsPoolImportFile.listeners.change();
  await flushPromises();

  assert.equal(confirms.length, 1);
  assert.match(confirms[0].message, /会覆盖当前 PayPal 接码池/);
  assert.equal(latest.currentEntry?.key, '1234567890----https://example.com/api/verify-1');
  assert.equal(latest.usage['1234567890----https://example.com/api/verify-1'].lastError, 'timeout');
  assert.equal(latest.text.includes('0987654321----https://example.com/api/verify-2'), true);
  assert.match(toasts.findLast((item) => /已导入/.test(item.message))?.message || '', /已导入 2 个号码/);
});

test('hosted sms pool manager imports legacy txt without meta and clears usage/current', async () => {
  const source = fs.readFileSync('sidepanel/hosted-sms-pool-manager.js', 'utf8');
  const documentObject = {
    createElement() {
      return {
        className: '',
        innerHTML: '',
        querySelector() {
          return { addEventListener() {} };
        },
      };
    },
  };
  const windowObject = { document: documentObject };
  const api = new Function('window', 'document', `${source}; return window.SidepanelHostedSmsPoolManager;`)(windowObject, documentObject);

  let latest = {
    text: '',
    usage: {
      stale: { useCount: 1, usedAt: 1, lastAttemptAt: 1, lastError: 'stale' },
    },
    currentEntry: { key: 'stale', phone: '1111111111', verificationUrl: 'https://stale' },
  };
  const dom = {
    hostedSmsPoolSummary: createNode(),
    hostedSmsPoolList: createNode(),
    btnHostedSmsPoolRefresh: createNode(),
    btnHostedSmsPoolExport: createNode(),
    btnHostedSmsPoolClearUsed: createNode(),
    btnHostedSmsPoolDeleteAll: createNode(),
    btnHostedSmsPoolImport: createNode(),
    btnHostedSmsPoolImportFile: createNode(),
    inputHostedSmsPoolImport: createNode(),
    inputHostedSmsPoolImportFile: createNode(),
    inputHostedSmsPoolSearch: createNode(),
    selectHostedSmsPoolFilter: createNode({ value: 'all' }),
  };

  const manager = api.createHostedSmsPoolManager({
    dom,
    helpers: {
      copyTextToClipboard: async () => {},
      downloadTextFile() {},
      escapeHtml: (value) => String(value || ''),
      openConfirmModal: async () => true,
      showToast() {},
    },
    state: {
      getText: () => latest.text,
      setText: (text) => { latest.text = String(text || ''); },
      getUsage: () => latest.usage,
      setUsage: (usage) => { latest.usage = usage; },
      getCurrentEntry: () => latest.currentEntry,
      setCurrentEntry: (entry) => { latest.currentEntry = entry; },
      isVisible: () => true,
    },
    actions: {
      persistPool: async () => {},
    },
  });

  manager.bindEvents();
  manager.render();
  dom.btnHostedSmsPoolImportFile.listeners.click();
  dom.inputHostedSmsPoolImportFile.files = [{
    name: 'legacy.txt',
    async text() {
      return '\uFEFF1234567890----https://example.com/verify';
    },
  }];
  dom.inputHostedSmsPoolImportFile.listeners.change();
  await flushPromises();

  assert.equal(latest.text, '1234567890----https://example.com/verify');
  assert.deepEqual(latest.usage, {});
  assert.equal(latest.currentEntry, null);
});

test('hosted sms pool manager renders disabled entries and supports custom labels', async () => {
  const source = fs.readFileSync('sidepanel/hosted-sms-pool-manager.js', 'utf8');
  const documentObject = {
    createElement() {
      return {
        className: '',
        innerHTML: '',
        querySelector() {
          return { addEventListener() {} };
        },
        appendChild() {},
      };
    },
  };
  const windowObject = { document: documentObject };
  const api = new Function('window', 'document', `${source}; return window.SidepanelHostedSmsPoolManager;`)(windowObject, documentObject);

  let latest = {
    text: '628111111111----https://example.com/api/sms/1',
    usage: {
      '628111111111----https://example.com/api/sms/1': {
        useCount: 2,
        usedAt: 10,
        lastAttemptAt: 11,
        lastError: 'waiting',
        enabled: false,
        disabledReason: 'timeout',
        disabledAt: 12,
        failureCount: 2,
      },
    },
    currentEntry: null,
  };
  const dom = {
    hostedSmsPoolSummary: createNode(),
    hostedSmsPoolList: createNode(),
    btnHostedSmsPoolRefresh: createNode(),
    btnHostedSmsPoolClearUsed: createNode(),
    btnHostedSmsPoolDeleteAll: createNode(),
    inputHostedSmsPoolImport: createNode(),
    btnHostedSmsPoolImport: createNode(),
    inputHostedSmsPoolSearch: createNode(),
    selectHostedSmsPoolFilter: createNode({ value: 'disabled' }),
  };

  const manager = api.createHostedSmsPoolManager({
    dom,
    helpers: {
      copyTextToClipboard: async () => {},
      escapeHtml: (value) => String(value || ''),
      openConfirmModal: async () => true,
      showToast() {},
    },
    state: {
      getText: () => latest.text,
      setText: (text) => { latest.text = String(text || ''); },
      getUsage: () => latest.usage,
      setUsage: (usage) => { latest.usage = usage; },
      getCurrentEntry: () => latest.currentEntry,
      setCurrentEntry: (entry) => { latest.currentEntry = entry; },
      isVisible: () => true,
    },
    actions: {
      persistPool: async () => {},
    },
    labels: {
      poolLabel: 'ChatGPT API 接码池',
      importSubject: 'ChatGPT API 接码号码',
      emptySummary: '导入 ChatGPT API 接码号码，每行一个号码和验证码接口。',
    },
    normalizers: {
      normalizePhone: (value = '') => String(value || '').trim().replace(/\D+/g, ''),
      formatLocalPhone: (value = '') => String(value || '').trim().replace(/\D+/g, ''),
    },
  });

  manager.bindEvents();
  manager.render();

  assert.match(dom.hostedSmsPoolSummary.textContent, /已禁用/);
});
