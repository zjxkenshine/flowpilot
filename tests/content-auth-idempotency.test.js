const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

class FakeEvent {
  constructor(type, options = {}) {
    this.type = type;
    Object.assign(this, options);
  }
}

class FakeMouseEvent extends FakeEvent {}
class FakeKeyboardEvent extends FakeEvent {}
class FakeInputEvent extends FakeEvent {}

test('content utils can be executed twice without duplicate listener registration', async () => {
  const source = fs.readFileSync('content/utils.js', 'utf8');
  const listeners = [];
  const messages = [];
  const root = {
    console: { log() {}, warn() {}, error() {} },
    location: { href: 'https://auth.openai.com/create-account/password', hostname: 'auth.openai.com', pathname: '/create-account/password' },
    document: {
      body: {},
      documentElement: {},
      querySelector() { return null; },
      querySelectorAll() { return []; },
    },
    window: null,
    top: null,
    setTimeout,
    clearTimeout,
    Event: FakeEvent,
    MouseEvent: FakeMouseEvent,
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    HTMLInputElement: function HTMLInputElement() {},
    chrome: {
      runtime: {
        onMessage: {
          addListener(listener) {
            listeners.push(listener);
          },
        },
        sendMessage(message) {
          messages.push(message);
          return Promise.resolve({ ok: true });
        },
      },
    },
  };
  root.window = root;
  root.top = root;
  Object.defineProperty(root.HTMLInputElement, 'prototype', {
    value: {
      value: '',
    },
  });
  Object.defineProperty(root.HTMLInputElement.prototype, 'value', {
    set(nextValue) {
      this.__value = nextValue;
    },
    get() {
      return this.__value || '';
    },
  });

  const runner = new Function('self', 'globalThis', 'location', 'window', 'document', 'chrome', `${source}; return self.__MULTIPAGE_UTILS_API__;`);
  const firstApi = runner(root, root, root.location, root.window, root.document, root.chrome);
  const secondApi = runner(root, root, root.location, root.window, root.document, root.chrome);

  assert.equal(typeof firstApi?.fillInput, 'function');
  assert.equal(secondApi, firstApi);
  assert.equal(listeners.length, 1);
  assert.equal(messages.filter((message) => message.type === 'CONTENT_SCRIPT_READY').length, 1);
});

test('signup-page can be executed twice without duplicate listener registration', async () => {
  const utilsSource = fs.readFileSync('content/utils.js', 'utf8');
  const signupSource = fs.readFileSync('content/signup-page.js', 'utf8');
  const runtimeListeners = [];
  const root = {
    console: { log() {}, warn() {}, error() {} },
    location: { href: 'https://auth.openai.com/create-account/password', hostname: 'auth.openai.com', pathname: '/create-account/password' },
    document: {
      title: '',
      body: { textContent: '' },
      documentElement: {
        _attrs: {},
        getAttribute(name) {
          return this._attrs[name] || null;
        },
        setAttribute(name, value) {
          this._attrs[name] = String(value);
        },
      },
      querySelector() { return null; },
      querySelectorAll() { return []; },
    },
    window: null,
    top: null,
    navigator: {},
    setTimeout,
    clearTimeout,
    Event: FakeEvent,
    MouseEvent: FakeMouseEvent,
    KeyboardEvent: FakeKeyboardEvent,
    InputEvent: FakeInputEvent,
    MutationObserver: class {
      observe() {}
      disconnect() {}
    },
    HTMLInputElement: function HTMLInputElement() {},
    chrome: {
      runtime: {
        onMessage: {
          addListener(listener) {
            runtimeListeners.push(listener);
          },
        },
        sendMessage() {
          return Promise.resolve({ ok: true });
        },
      },
    },
  };
  root.window = root;
  root.top = root;
  Object.defineProperty(root.HTMLInputElement, 'prototype', {
    value: {
      value: '',
    },
  });
  Object.defineProperty(root.HTMLInputElement.prototype, 'value', {
    set(nextValue) {
      this.__value = nextValue;
    },
    get() {
      return this.__value || '';
    },
  });

  new Function('self', 'globalThis', 'location', 'window', 'document', 'chrome', `${utilsSource}; return self.__MULTIPAGE_UTILS_API__;`)(
    root,
    root,
    root.location,
    root.window,
    root.document,
    root.chrome
  );
  const runner = new Function('self', 'globalThis', 'location', 'window', 'document', 'chrome', `${signupSource}; return self.__MULTIPAGE_SIGNUP_PAGE_INITIALIZED__;`);
  const firstResult = runner(root, root, root.location, root.window, root.document, root.chrome);
  const secondResult = runner(root, root, root.location, root.window, root.document, root.chrome);

  assert.equal(firstResult, true);
  assert.equal(secondResult, true);
  assert.equal(runtimeListeners.length, 2);
  assert.equal(root.document.documentElement.getAttribute('data-multipage-signup-page-listener'), '1');
  assert.equal(root.__MULTIPAGE_SIGNUP_PAGE_DUPLICATE_LOGGED__, true);
});
