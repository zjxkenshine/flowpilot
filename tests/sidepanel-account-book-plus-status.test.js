const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function createNode(initial = {}) {
  return {
    hidden: false,
    innerHTML: '',
    textContent: '',
    listeners: {},
    addEventListener(type, handler) {
      this.listeners[type] = handler;
    },
    closest() {
      return null;
    },
    getAttribute(name) {
      return this[name] || '';
    },
    ...initial,
  };
}

test('account book manager renders and exports plus free status', async () => {
  const source = fs.readFileSync('sidepanel/account-book-manager.js', 'utf8');
  const windowObject = {};
  const api = new Function('window', `${source}; return window.SidepanelAccountBookManager;`)(windowObject);

  const downloads = [];
  const dom = {
    accountBookCount: createNode(),
    accountBookBody: createNode(),
    btnExportAccountBook: createNode(),
  };
  const manager = api.createAccountBookManager({
    state: {
      getLatestState: () => ({
        accountBookEntries: [
          {
            recordId: 'plus@example.com',
            email: 'plus@example.com',
            phoneNumber: '+15550004444',
            password: 'secret-pass',
            captureStage: 'registration_success',
            createdAt: '2026-05-24T10:00:00.000Z',
            updatedAt: '2026-05-24T10:00:00.000Z',
            freeStatus: 'plus',
          },
        ],
      }),
    },
    dom,
    helpers: {
      escapeHtml: (value) => String(value || ''),
      downloadTextFile(content, fileName, mimeType, options) {
        downloads.push({ content, fileName, mimeType, options });
      },
      openActionModal: async () => 'json',
      showToast() {},
    },
    runtime: {},
  });

  manager.bindEvents();
  manager.render();

  assert.match(dom.accountBookBody.innerHTML, /account-book-free-chip free-status-plus/);
  assert.match(dom.accountBookBody.innerHTML, />Plus</);

  await dom.btnExportAccountBook.listeners.click();
  const exported = JSON.parse(downloads[0].content);
  assert.equal(exported.entries[0].freeStatus, 'plus');
  assert.equal(exported.entries[0].freeStatusLabel, 'Plus');
});
