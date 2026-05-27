const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const source = fs.readFileSync('content/paypal-flow.js', 'utf8');

function extractFunction(name) {
  const markers = [`async function ${name}(`, `function ${name}(`];
  const start = markers
    .map((marker) => source.indexOf(marker))
    .find((index) => index >= 0);
  if (start < 0) {
    throw new Error(`missing function ${name}`);
  }

  let parenDepth = 0;
  let signatureEnded = false;
  let braceStart = -1;
  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    if (char === '(') {
      parenDepth += 1;
    } else if (char === ')') {
      parenDepth -= 1;
      if (parenDepth === 0) {
        signatureEnded = true;
      }
    } else if (char === '{' && signatureEnded) {
      braceStart = index;
      break;
    }
  }
  if (braceStart < 0) {
    throw new Error(`missing body for function ${name}`);
  }

  let depth = 0;
  let end = braceStart;
  for (; end < source.length; end += 1) {
    const char = source[end];
    if (char === '{') depth += 1;
    if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        end += 1;
        break;
      }
    }
  }

  return source.slice(start, end);
}

function createElement({
  tag = 'div',
  type = '',
  id = '',
  name = '',
  text = '',
  value = '',
  placeholder = '',
  attrs = {},
  style = {},
  rect = { width: 160, height: 40 },
  parentElement = null,
} = {}) {
  return {
    nodeType: 1,
    tag,
    type,
    id,
    name,
    textContent: text,
    value,
    placeholder,
    disabled: false,
    hidden: Boolean(attrs.hidden),
    style: {
      display: 'block',
      visibility: 'visible',
      opacity: '1',
      ...style,
    },
    parentElement,
    getAttribute(key) {
      if (key === 'type') return type;
      if (key === 'id') return id;
      if (key === 'name') return name;
      if (key === 'placeholder') return placeholder;
      if (key === 'value') return value;
      return Object.prototype.hasOwnProperty.call(attrs, key) ? attrs[key] : null;
    },
    getBoundingClientRect() {
      return rect;
    },
  };
}

function loadApi(elements) {
  const document = {
    documentElement: {},
    querySelectorAll(selector) {
      if (selector === 'input') {
        return elements.filter((el) => el.tag === 'input');
      }
      if (selector === 'input[type="email"]') {
        return elements.filter((el) => el.tag === 'input' && el.type === 'email');
      }
      if (selector === 'input[type="password"]') {
        return elements.filter((el) => el.tag === 'input' && el.type === 'password');
      }
      if (selector.includes('button') || selector.includes('[role="button"]')) {
        return elements.filter((el) => el.tag === 'button' || el.attrs?.role === 'button');
      }
      return [];
    },
  };
  const window = {
    getComputedStyle(el) {
      return el?.style || { display: 'block', visibility: 'visible', opacity: '1' };
    },
  };

  return new Function('document', 'window', `
${extractFunction('isVisibleElement')}
${extractFunction('normalizeText')}
${extractFunction('getActionText')}
${extractFunction('getVisibleControls')}
${extractFunction('isEnabledControl')}
${extractFunction('findClickableByText')}
${extractFunction('findInputByPatterns')}
${extractFunction('findEmailInput')}
${extractFunction('findPasswordInput')}
${extractFunction('findLoginNextButton')}
${extractFunction('findEmailNextButton')}
${extractFunction('findPasswordLoginButton')}
${extractFunction('getPayPalLoginPhase')}
return {
  findEmailInput,
  findPasswordInput,
  findEmailNextButton,
  findPasswordLoginButton,
  getPayPalLoginPhase,
};
`)(document, window);
}

function createSubmitApi(overrides = {}) {
  const bindings = {
    waitForDocumentComplete: async () => {},
    normalizeText: (text = '') => String(text || '').replace(/\s+/g, ' ').trim(),
    findPasswordInput: () => null,
    findEmailInput: () => null,
    findEmailNextButton: () => null,
    isEnabledControl: () => true,
    findPasswordLoginButton: () => null,
    fillInput: () => {},
    simulateClick: () => {},
    waitUntil: async (predicate) => predicate(),
    findLoginNextButton: () => null,
    sleep: async () => {},
    ...overrides,
  };

  return new Function(
    'waitForDocumentComplete',
    'normalizeText',
    'findPasswordInput',
    'findEmailInput',
    'findEmailNextButton',
    'isEnabledControl',
    'findPasswordLoginButton',
    'fillInput',
    'simulateClick',
    'waitUntil',
    'findLoginNextButton',
    'sleep',
    `
${extractFunction('refillPayPalEmailInput')}
${extractFunction('submitPayPalLogin')}
return { refillPayPalEmailInput, submitPayPalLogin };
`
  )(
    bindings.waitForDocumentComplete,
    bindings.normalizeText,
    bindings.findPasswordInput,
    bindings.findEmailInput,
    bindings.findEmailNextButton,
    bindings.isEnabledControl,
    bindings.findPasswordLoginButton,
    bindings.fillInput,
    bindings.simulateClick,
    bindings.waitUntil,
    bindings.findLoginNextButton,
    bindings.sleep
  );
}

test('PayPal email page ignores hidden pre-rendered password input', () => {
  const hiddenPanel = createElement({ attrs: { 'aria-hidden': 'true' } });
  const emailInput = createElement({
    tag: 'input',
    type: 'text',
    id: 'login_email',
    name: 'login_email',
    value: 'user@example.com',
    placeholder: 'Email',
  });
  const hiddenPasswordInput = createElement({
    tag: 'input',
    type: 'password',
    id: 'login_password',
    name: 'login_password',
    parentElement: hiddenPanel,
  });
  const nextButton = createElement({
    tag: 'button',
    id: 'btnNext',
    text: 'Next',
  });

  const api = loadApi([emailInput, hiddenPasswordInput, nextButton]);

  assert.equal(api.findEmailInput(), emailInput);
  assert.equal(api.findPasswordInput(), null);
  assert.equal(api.findEmailNextButton(), nextButton);
  assert.equal(api.findPasswordLoginButton(), null);
  assert.equal(api.getPayPalLoginPhase(emailInput, api.findPasswordInput()), 'email');
});

test('PayPal combined login page still sees visible password input', () => {
  const emailInput = createElement({
    tag: 'input',
    type: 'text',
    id: 'login_email',
    name: 'login_email',
  });
  const passwordInput = createElement({
    tag: 'input',
    type: 'password',
    id: 'login_password',
    name: 'login_password',
  });
  const loginButton = createElement({
    tag: 'button',
    id: 'btnLogin',
    text: 'Log In',
  });

  const api = loadApi([emailInput, passwordInput, loginButton]);

  assert.equal(api.findEmailInput(), emailInput);
  assert.equal(api.findPasswordInput(), passwordInput);
  assert.equal(api.findPasswordLoginButton(), loginButton);
  assert.equal(api.getPayPalLoginPhase(emailInput, passwordInput), 'login_combined');
});

test('PayPal email submit refills a prefilled email before clicking next', async () => {
  const emailInput = createElement({
    tag: 'input',
    type: 'text',
    id: 'login_email',
    name: 'login_email',
    value: 'user@example.com',
    placeholder: 'Email',
  });
  const nextButton = createElement({
    tag: 'button',
    id: 'btnNext',
    text: 'Next',
  });
  const fillValues = [];
  const clicked = [];
  let focusCount = 0;
  let blurCount = 0;

  emailInput.focus = () => {
    focusCount += 1;
  };
  emailInput.blur = () => {
    blurCount += 1;
  };

  const api = createSubmitApi({
    findEmailInput: () => emailInput,
    findEmailNextButton: () => nextButton,
    fillInput: (element, value) => {
      fillValues.push(value);
      element.value = value;
    },
    simulateClick: (element) => {
      clicked.push(element);
    },
  });

  const result = await api.submitPayPalLogin({
    email: 'user@example.com',
    password: 'secret',
  });

  assert.deepEqual(fillValues, ['', 'user@example.com']);
  assert.equal(focusCount, 1);
  assert.equal(blurCount, 1);
  assert.deepEqual(clicked, [nextButton]);
  assert.deepEqual(result, {
    submitted: false,
    phase: 'email_submitted',
    awaiting: 'password_page',
  });
});

function createHostedPayPalHarness(options = {}) {
  const events = [];
  const attrs = new Map();
  const elementsById = new Map();
  let elements = [];
  let listener = null;
  const body = { innerText: '', textContent: '' };
  const location = {
    href: 'https://www.paypal.com/checkoutweb/signup',
    host: 'www.paypal.com',
    pathname: '/checkoutweb/signup',
  };

  function createDomElement({
    tagName = 'DIV',
    id = '',
    type = '',
    name = '',
    text = '',
    value = '',
    attrs: initialAttrs = {},
    options: selectOptions = [],
  } = {}) {
    const attrMap = new Map(Object.entries(initialAttrs));
    const element = {
      nodeType: 1,
      tagName,
      id,
      type,
      name,
      textContent: text,
      innerText: text,
      value,
      checked: false,
      disabled: false,
      hidden: false,
      options: selectOptions,
      parentElement: null,
      parentNode: null,
      nextSibling: null,
      isConnected: false,
      style: { display: 'block', visibility: 'visible', opacity: '1' },
      getAttribute(key) {
        if (key === 'id') return this.id;
        if (key === 'type') return this.type;
        if (key === 'name') return this.name;
        if (key === 'class') return attrMap.get('class') || '';
        if (key === 'placeholder') return attrMap.get('placeholder') || '';
        return attrMap.has(key) ? attrMap.get(key) : null;
      },
      setAttribute(key, nextValue) {
        attrMap.set(key, String(nextValue));
      },
      dispatchEvent() {
        return true;
      },
      focus() {},
      blur() {},
      click() {
        events.push({ type: 'native-click', id: this.id, text: this.textContent });
      },
      remove() {
        events.push({ type: 'remove', id: this.id });
        const index = elements.indexOf(this);
        if (index >= 0) {
          elements.splice(index, 1);
        }
        this.parentElement = null;
        this.parentNode = null;
        this.isConnected = false;
      },
      getBoundingClientRect() {
        return { left: 10, top: 10, width: 180, height: 44 };
      },
    };
    if (id) elementsById.set(id, element);
    return element;
  }

  const countrySelect = createDomElement({ tagName: 'SELECT', id: 'country', value: 'US' });
  const emailInput = createDomElement({ tagName: 'INPUT', id: 'email', type: 'email', name: 'email' });
  const phoneInput = createDomElement({ tagName: 'INPUT', id: 'phone', type: 'tel', name: 'phone' });
  const cardNumberInput = createDomElement({ tagName: 'INPUT', id: 'cardNumber', type: 'text' });
  const cardExpiryInput = createDomElement({ tagName: 'INPUT', id: 'cardExpiry', type: 'text' });
  const cardCvvInput = createDomElement({ tagName: 'INPUT', id: 'cardCvv', type: 'text' });
  const passwordInput = createDomElement({ tagName: 'INPUT', id: 'password', type: 'password' });
  const firstNameInput = createDomElement({ tagName: 'INPUT', id: 'firstName', type: 'text' });
  const lastNameInput = createDomElement({ tagName: 'INPUT', id: 'lastName', type: 'text' });
  const billingLine1Input = createDomElement({ tagName: 'INPUT', id: 'billingLine1', type: 'text' });
  const billingCityInput = createDomElement({ tagName: 'INPUT', id: 'billingCity', type: 'text' });
  const billingPostalCodeInput = createDomElement({ tagName: 'INPUT', id: 'billingPostalCode', type: 'text' });
  const billingStateSelect = createDomElement({
    tagName: 'SELECT',
    id: 'billingState',
    value: '',
    options: [
      { textContent: 'New York', label: 'New York', value: 'NY' },
      { textContent: 'California', label: 'California', value: 'CA' },
    ],
  });
  const submitButton = createDomElement({
    tagName: 'BUTTON',
    id: 'hostedSubmit',
    text: 'Agree & Create Account',
    attrs: { 'data-testid': 'submit-button' },
  });
  const verificationInputs = Array.from({ length: 6 }, (_, index) => createDomElement({
    tagName: 'INPUT',
    id: `ci-ciBasic-${index}`,
    type: 'text',
  }));
  const verificationAlert = createDomElement({
    tagName: 'DIV',
    id: 'message_ciBasic',
    text: 'Check the code and try again. Get a new code.',
    attrs: { role: 'alert' },
  });
  const verificationResendButton = createDomElement({
    tagName: 'BUTTON',
    id: 'resendButton',
    text: 'Resend',
    attrs: { 'data-testid': 'resend-link' },
  });
  const createAccountButton = createDomElement({
    tagName: 'BUTTON',
    id: 'createAccountButton',
    text: 'Agree & Create Account',
    attrs: { 'data-testid': 'createAccountButton' },
  });
  const nextButton = createDomElement({
    tagName: 'BUTTON',
    id: 'btnNext',
    text: '下一页',
  });
  const captchaOverlay = createDomElement({
    tagName: 'DIV',
    id: 'captcha-standalone',
    text: 'PayPal 安全问题 recaptcha',
    attrs: {
      class: 'container-fluid captcha-overlay captcha-container',
      'data-app': 'authchallenge_response',
      'data-captcha-type': 'recaptcha',
    },
  });
  const captchaFrame = createDomElement({
    tagName: 'IFRAME',
    attrs: {
      src: 'https://www.paypalobjects.com/web/res/test/recaptcha/recaptcha_v2.html?siteKey=test',
    },
  });
  captchaFrame.src = captchaFrame.getAttribute('src');

  function setElements(nextElements) {
    elements = nextElements;
    elementsById.clear();
    for (const element of nextElements) {
      element.parentElement = null;
      element.parentNode = null;
      element.nextSibling = null;
      element.isConnected = false;
      if (element.id) elementsById.set(element.id, element);
    }
    nextElements.forEach((element, index) => {
      element.parentElement = body;
      element.parentNode = body;
      element.nextSibling = nextElements[index + 1] || null;
      element.isConnected = true;
    });
  }

  function showGuestCheckout() {
    location.href = 'https://www.paypal.com/checkoutweb/signup';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/signup';
    body.innerText = 'Pay with debit or credit card';
    body.textContent = body.innerText;
    setElements([
      countrySelect,
      emailInput,
      phoneInput,
      cardNumberInput,
      cardExpiryInput,
      cardCvvInput,
      passwordInput,
      firstNameInput,
      lastNameInput,
      billingLine1Input,
      billingCityInput,
      billingPostalCodeInput,
      billingStateSelect,
      submitButton,
    ]);
  }

  function showCreateAccount() {
    location.href = 'https://www.paypal.com/checkoutweb/create-account';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/create-account';
    body.innerText = 'Create your PayPal account. Agree & Create Account';
    body.textContent = body.innerText;
    setElements([createAccountButton]);
  }

  function showPayEmail() {
    location.href = 'https://www.paypal.com/pay?token=demo';
    location.host = 'www.paypal.com';
    location.pathname = '/pay';
    body.innerText = '请输入您的电子邮箱地址。 下一页 或 创建账户';
    body.textContent = body.innerText;
    setElements([emailInput, nextButton, createAccountButton]);
  }

  function showVerification({ invalid = false } = {}) {
    location.href = 'https://www.paypal.com/checkoutweb/verification';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/verification';
    body.innerText = invalid
      ? 'Enter your security code. Check the code and try again. Get a new code.'
      : 'Enter your security code.';
    body.textContent = body.innerText;
    setElements([
      ...verificationInputs,
      ...(invalid ? [verificationAlert] : []),
      verificationResendButton,
    ]);
  }

  function showGenericError({ url = 'https://www.paypal.com/checkoutweb/genericError?token=EC-test', text = 'Things don\'t appear to be working at the moment.' } = {}) {
    location.href = url;
    location.host = 'www.paypal.com';
    location.pathname = new URL(url).pathname;
    body.innerText = text;
    body.textContent = body.innerText;
    setElements([submitButton]);
  }

  function showBlockedPage() {
    location.href = 'https://www.paypal.com/checkoutweb/blocked?token=EC-test';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/blocked';
    body.innerText = 'You have been blocked. We couldn\'t load the security challenge.';
    body.textContent = body.innerText;
    setElements([]);
  }

  function showCaptchaOverlay() {
    location.href = 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/signup';
    body.innerText = 'Pay with debit or credit card. PayPal 安全问题 recaptcha';
    body.textContent = body.innerText;
    setElements([
      captchaOverlay,
      countrySelect,
      emailInput,
      phoneInput,
      cardNumberInput,
      cardExpiryInput,
      cardCvvInput,
      passwordInput,
      firstNameInput,
      lastNameInput,
      billingLine1Input,
      billingCityInput,
      billingPostalCodeInput,
      billingStateSelect,
      submitButton,
    ]);
    captchaFrame.parentElement = captchaOverlay;
    captchaFrame.parentNode = captchaOverlay;
    captchaFrame.isConnected = true;
  }

  function showGuestCardError() {
    showGuestCheckout();
    body.innerText = 'We weren\'t able to add this card. Check all the details are correct and try again or try a different card.';
    body.textContent = body.innerText;
  }

  function showGuestPhoneError() {
    showGuestCheckout();
    body.innerText = 'We\'re unable to complete your request. Try a different phone number.';
    body.textContent = body.innerText;
  }

  const context = {
    console: { log() {}, warn() {}, error() {}, info() {} },
    location,
    window: {},
    Event: class TestEvent { constructor(type) { this.type = type; } },
    MouseEvent: class TestMouseEvent { constructor(type) { this.type = type; } },
    PointerEvent: class TestPointerEvent { constructor(type) { this.type = type; } },
    document: {
      readyState: 'complete',
      body,
      documentElement: {
        getAttribute(name) {
          return attrs.get(name) || null;
        },
        setAttribute(name, nextValue) {
          attrs.set(name, String(nextValue));
        },
        contains(node) {
          return elements.includes(node);
        },
      },
      getElementById(id) {
        return elementsById.get(id) || null;
      },
      querySelector(selector) {
        const text = String(selector || '');
        if (text === '#captcha-standalone') {
          return elements.includes(captchaOverlay) ? captchaOverlay : null;
        }
        if (text.includes('resend-link')) {
          return elements.includes(verificationResendButton) ? verificationResendButton : null;
        }
        if (text.includes('createAccountButton') || text.includes('create-account-button')) {
          return elements.includes(createAccountButton) ? createAccountButton : null;
        }
        if (text.includes('submit-button') || text.includes('hosted-payment-submit-button')) {
          return elements.includes(submitButton) ? submitButton : null;
        }
        return null;
      },
      querySelectorAll(selector) {
        const text = String(selector || '');
        if (text === 'input') return elements.filter((element) => element.tagName === 'INPUT');
        if (text === 'input[type="email"]') return elements.filter((element) => element.type === 'email');
        if (text === 'input[type="password"]') return elements.filter((element) => element.type === 'password');
        if (text === '#captcha-standalone') return elements.includes(captchaOverlay) ? [captchaOverlay] : [];
        if (text === '.captcha-overlay') return elements.includes(captchaOverlay) ? [captchaOverlay] : [];
        if (text === '.captcha-container') return elements.includes(captchaOverlay) ? [captchaOverlay] : [];
        if (text.includes('data-app') && text.includes('authchallenge')) return elements.includes(captchaOverlay) ? [captchaOverlay] : [];
        if (text.includes('data-captcha-type')) return elements.includes(captchaOverlay) ? [captchaOverlay] : [];
        if (text.includes('iframe') && text.includes('recaptcha')) return elements.includes(captchaFrame) ? [captchaFrame] : [];
        if (text.includes('button') || text.includes('[role="button"]')) {
          return elements.filter((element) => element.tagName === 'BUTTON');
        }
        if (text.includes('[role="alert"]')) {
          return elements.filter((element) => element.getAttribute('role') === 'alert');
        }
        return [];
      },
    },
    chrome: {
      runtime: {
        onMessage: {
          addListener(fn) {
            listener = fn;
          },
        },
      },
    },
    CodexOperationDelay: {
      async performOperationWithDelay(metadata, operation) {
        events.push({ type: 'operation', metadata });
        const result = await operation();
        events.push({ type: 'delay', metadata });
        return result;
      },
    },
    resetStopState() {},
    isStopError() { return false; },
    throwIfStopped() {},
    sleep() { return Promise.resolve(); },
    fillInput(element, value) {
      if (element === phoneInput && typeof options.renderPhone === 'function') {
        element.value = options.renderPhone(value);
      } else {
        element.value = value;
      }
      events.push({ type: 'fill', id: element.id, value: element.value });
    },
    simulateClick(element) {
      events.push({ type: 'click', id: element.id, text: element.textContent });
    },
  };
  body.appendChild = (node) => {
    events.push({ type: 'append-child', id: node.id });
    if (!elements.includes(node)) {
      elements.push(node);
    }
    setElements(elements.slice());
    return node;
  };
  body.insertBefore = (node, referenceNode) => {
    events.push({ type: 'insert-before', id: node.id, before: referenceNode?.id || '' });
    const withoutNode = elements.filter((element) => element !== node);
    const index = referenceNode ? withoutNode.indexOf(referenceNode) : -1;
    if (index >= 0) {
      withoutNode.splice(index, 0, node);
    } else {
      withoutNode.push(node);
    }
    setElements(withoutNode);
    return node;
  };
  body.removeChild = (node) => {
    events.push({ type: 'remove-child', id: node.id });
    const index = elements.indexOf(node);
    if (index >= 0) {
      elements.splice(index, 1);
    }
    node.parentElement = null;
    node.parentNode = null;
    node.isConnected = false;
    setElements(elements.slice());
    return node;
  };
  context.window = context;
  context.window.getComputedStyle = (element) => element?.style || { display: 'block', visibility: 'visible', opacity: '1' };

  vm.createContext(context);
  vm.runInContext(source, context);
  assert.equal(typeof listener, 'function');

  async function send(message) {
    return await new Promise((resolve) => {
      listener(message, {}, resolve);
    });
  }

  return {
    events,
    send,
    showBlockedPage,
    showCaptchaOverlay,
    showGuestCardError,
    showPayEmail,
    showCreateAccount,
    showGenericError,
    showGuestCheckout,
    showGuestPhoneError,
    showVerification,
  };
}

test('PayPal hosted guest checkout verifies configured local phone before submit', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      email: 'guest@example.com',
      phone: '4155551234',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      firstName: 'James',
      lastName: 'Smith',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.submitted, true);
  assert.equal(result.phoneMatched, true);
  assert.equal(result.payloadPhoneDigits, '4155551234');
  assert.equal(result.renderedPhoneDigits, '14155551234');
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.events.filter((event) => event.type === 'operation').map((event) => event.metadata))),
    [{ stepKey: 'paypal-hosted-card', kind: 'click', label: 'hosted-paypal-card-submit' }]
  );
});

test('PayPal hosted guest checkout accepts profile address aliases', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      email: 'guest@example.com',
      phone: '4155551234',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      firstName: 'James',
      lastName: 'Smith',
      address: {
        address1: '350 Fifth Avenue',
        city: 'New York',
        region: 'New York',
        postalCode: '10118',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.submitted, true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '350 Fifth Avenue'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingPostalCode' && event.value === '10118'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
});

test('PayPal hosted guest checkout blocks submit when rendered phone differs from config', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: () => '9999999999',
  });
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      phone: '4155551234',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.match(result.error, /电话不一致/);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), false);
});

test('PayPal hosted guest checkout rejects missing phone payload instead of using default phone', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      email: 'guest@example.com',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.match(result.error, /未收到后台下发的池中手机号\/验证码配置|未收到后台下发的池中手机号/);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), false);
});

test('PayPal hosted guest checkout rejects blank phone payload before verification check', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      phone: '   ',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.match(result.error, /未收到后台下发的池中手机号\/验证码配置|未收到后台下发的池中手机号/);
});

test('PayPal hosted /pay email page fills email and clicks Next instead of Create Account', async () => {
  const harness = createHostedPayPalHarness();
  harness.showPayEmail();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });
  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'pay_login');
  assert.equal(state.hasHostedEmailInput, true);

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'pay_login');
  assert.equal(result.submitted, true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'email' && event.value === 'guest@example.com'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), false);
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.events.filter((event) => event.type === 'operation').map((event) => event.metadata))),
    [{ stepKey: 'paypal-hosted-email', kind: 'click', label: 'hosted-paypal-email-next' }]
  );
});

test('PayPal hosted create account page is detected and handled as its own step', async () => {
  const harness = createHostedPayPalHarness();
  harness.showCreateAccount();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });
  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'create_account');
  assert.equal(state.createAccountReady, true);

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: { expectedStage: 'create_account' },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'create_account');
  assert.equal(result.submitted, true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.events.filter((event) => event.type === 'operation').map((event) => event.metadata))),
    [{ stepKey: 'paypal-hosted-create-account', kind: 'click', label: 'hosted-paypal-create-account' }]
  );
});

test('PayPal hosted verification page exposes invalid-code and resend state', async () => {
  const harness = createHostedPayPalHarness();
  harness.showVerification({ invalid: true });

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'verification');
  assert.equal(state.verificationInputsVisible, true);
  assert.equal(state.hostedVerificationInvalidCode, true);
  assert.match(state.hostedVerificationErrorText, /Check the code/);
  assert.equal(state.hostedVerificationResendReady, true);
});

test('PayPal hosted verification page fills code digits and clicks Resend', async () => {
  const harness = createHostedPayPalHarness();
  harness.showVerification({ invalid: true });

  const fillResult = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      verificationCode: '123456',
    },
  });

  assert.equal(fillResult.ok, true);
  assert.equal(fillResult.codeSubmitted, true);
  assert.deepEqual(
    harness.events.filter((event) => event.type === 'fill').slice(-6).map((event) => event.value),
    ['1', '2', '3', '4', '5', '6']
  );

  const resendResult = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      resendVerificationCode: true,
    },
  });

  assert.equal(resendResult.ok, true);
  assert.equal(resendResult.resendClicked, true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'resendButton'), true);
});

test('PayPal hosted genericError URL is exposed as generic_error stage', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGenericError();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'generic_error');
  assert.equal(state.hostedGenericError, true);
  assert.match(state.hostedGenericErrorMessage, /Things don'?t appear/);
});

test('PayPal hosted blocked page is treated as non-blocking unknown state', async () => {
  const harness = createHostedPayPalHarness();
  harness.showBlockedPage();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: { securityChallengeEnabled: true },
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'unknown');
  assert.equal(state.hostedBlocked, false);
  assert.equal(state.hostedSecurityChallengeVisible, true);
  assert.equal(state.hostedSecurityChallengeSelector, 'body-text');

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: { expectedStage: 'guest_checkout' },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'unknown');
  assert.equal(result.submitted, false);
  assert.equal(harness.events.some((event) => event.type === 'click'), false);
});

test('PayPal hosted captcha overlay is ignored by default', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showCaptchaOverlay();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'guest_checkout');
  assert.equal(state.hostedBlocked, false);
  assert.equal(state.hostedSecurityChallengeVisible, false);
  assert.equal(state.hostedSecurityChallengeSelector, '');
  assert.equal(state.hostedSecurityChallengeRemoved, false);
  assert.equal(harness.events.some((event) => event.type === 'remove' && event.id === 'captcha-standalone'), false);
});

test('PayPal hosted captcha overlay is removed and checkout flow continues', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showCaptchaOverlay();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: { securityChallengeEnabled: true },
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'guest_checkout');
  assert.equal(state.hostedBlocked, false);
  assert.equal(state.hostedSecurityChallengeVisible, true);
  assert.equal(state.hostedSecurityChallengeSelector, '#captcha-standalone');
  assert.equal(state.hostedSecurityChallengeRemovable, true);
  assert.equal(state.hostedSecurityChallengeRemoved, true);
  assert.equal(state.hostedSecurityChallengeRestored, false);
  assert.equal(harness.events.some((event) => event.type === 'remove' && event.id === 'captcha-standalone'), true);
  assert.equal(harness.events.some((event) => event.type === 'insert-before' && event.id === 'captcha-standalone'), false);
  assert.equal(harness.events.some((event) => event.type === 'append-child' && event.id === 'captcha-standalone'), false);

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      email: 'guest@example.com',
      phone: '4155551234',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      password: 'Aa1!example',
      firstName: 'James',
      lastName: 'Smith',
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'guest_checkout');
  assert.equal(result.submitted, true);
  assert.equal(result.phoneMatched, true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
});

test('PayPal hosted guest checkout exposes card and phone errors', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGuestCardError();

  const cardState = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(cardState.ok, true);
  assert.equal(cardState.hostedStage, 'guest_checkout');
  assert.equal(cardState.hostedGuestCardError, true);
  assert.match(cardState.hostedGuestCardErrorMessage, /add this card|different card/i);

  harness.showGuestPhoneError();
  const phoneState = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(phoneState.ok, true);
  assert.equal(phoneState.hostedStage, 'guest_checkout');
  assert.equal(phoneState.hostedGuestPhoneError, true);
  assert.match(phoneState.hostedGuestPhoneErrorMessage, /different phone number/i);
});

test('PayPal hosted genericError copy is exposed with message', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGenericError({
    url: 'https://www.paypal.com/checkoutweb/signup?ba_token=BA-test',
    text: 'Sorry, something went wrong. Please try again.',
  });

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'generic_error');
  assert.equal(state.hostedGenericError, true);
  assert.match(state.hostedGenericErrorMessage, /Sorry, something went wrong/);
});

test('PayPal hosted genericError step does not click submit buttons', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGenericError({
    text: 'Something went wrong. Please go back to ChatGPT and choose another way to pay. PayPal isn\'t available at this time.',
  });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'generic_error',
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'generic_error');
  assert.equal(result.hostedGenericError, true);
  assert.equal(result.submitted, false);
  assert.equal(harness.events.some((event) => event.type === 'click'), false);
});
