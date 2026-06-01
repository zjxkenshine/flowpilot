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
${extractFunction('isReadOnlyControl')}
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

test('PayPal hosted email finder detects login_email username field', () => {
  const emailInput = createElement({
    tag: 'input',
    type: 'email',
    id: 'email',
    name: 'login_email',
    placeholder: '电子邮箱地址或手机号码',
    attrs: { autocomplete: 'username' },
  });

  const api = loadApi([emailInput]);

  assert.equal(api.findEmailInput(), emailInput);
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
  let phoneFillCount = 0;
  let sleepCount = 0;
  let delayedReadOnlyEmailField = null;
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
      querySelector(selector) {
        const text = String(selector || '');
        if (text === 'label') {
          return this.children?.find?.((child) => child.tagName === 'LABEL') || null;
        }
        return null;
      },
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
      dispatchEvent(event) {
        events.push({
          type: 'dispatch',
          id: this.id,
          event: event?.type || '',
          value: this.value,
        });
        return true;
      },
      focus() {},
      blur() {},
      click() {
        events.push({ type: 'native-click', id: this.id, text: this.textContent });
        if (this.type === 'checkbox') {
          this.checked = !this.checked;
        } else if (this.type === 'radio') {
          this.checked = true;
        }
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

  const countrySelect = createDomElement({
    tagName: 'SELECT',
    id: 'country',
    value: 'DE',
    options: [
      { textContent: 'Germany', label: 'Germany', value: 'DE' },
      { textContent: 'United States', label: 'United States', value: 'US' },
      { textContent: 'Brasil', label: 'Brasil', value: 'BR' },
    ],
  });
  const emailInput = createDomElement({ tagName: 'INPUT', id: 'email', type: 'email', name: 'email' });
  emailInput.setAttribute('placeholder', '电子邮箱地址或手机号码');
  emailInput.setAttribute('autocomplete', 'username');
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
      { textContent: 'Sao Paulo', label: 'Sao Paulo', value: 'SP' },
      { textContent: 'SP', label: 'SP', value: 'SP' },
    ],
  });
  const phoneTypeSelect = createDomElement({
    tagName: 'SELECT',
    id: 'phoneType',
    name: 'phoneType',
    value: '',
    attrs: { 'aria-label': 'Tipo de telefone' },
    options: [
      { textContent: 'Celular', label: 'Celular', value: 'mobile' },
      { textContent: 'Residencial', label: 'Residencial', value: 'home' },
    ],
  });
  const creditRadio = createDomElement({
    tagName: 'INPUT',
    id: 'credit',
    type: 'radio',
    name: 'cardType',
    attrs: { 'aria-label': 'Crédito' },
  });
  const debitRadio = createDomElement({
    tagName: 'INPUT',
    id: 'debit',
    type: 'radio',
    name: 'cardType',
    attrs: { 'aria-label': 'Débito' },
  });
  const brazilCepInput = createDomElement({ tagName: 'INPUT', id: 'postal-code-br', type: 'text', attrs: { placeholder: 'CEP' } });
  const brazilAddressInput = createDomElement({ tagName: 'INPUT', id: 'address-br', type: 'text', attrs: { placeholder: 'Endereço' } });
  const brazilNumberInput = createDomElement({ tagName: 'INPUT', id: 'number-br', type: 'text', attrs: { placeholder: 'Nº' } });
  const brazilNeighborhoodInput = createDomElement({ tagName: 'INPUT', id: 'bairro-br', type: 'text', attrs: { placeholder: 'Distrito/Bairro (opcional)' } });
  const brazilCityInput = createDomElement({ tagName: 'INPUT', id: 'city-br', type: 'text', attrs: { placeholder: 'Cidade' } });
  const brazilStateSelect = createDomElement({
    tagName: 'SELECT',
    id: 'state-br',
    value: '',
    attrs: { 'aria-label': 'Estado' },
    options: [
      { textContent: 'Sao Paulo', label: 'Sao Paulo', value: 'SP' },
      { textContent: 'Rio de Janeiro', label: 'Rio de Janeiro', value: 'RJ' },
    ],
  });
  const brazilBirthdayInput = createDomElement({ tagName: 'INPUT', id: 'birth-br', type: 'text', attrs: { placeholder: 'Data de nascimento' } });
  const brazilCpfInput = createDomElement({ tagName: 'INPUT', id: 'cpf-br', type: 'text', attrs: { placeholder: 'CPF' } });
  const brazilRequiredTermsCheckbox = createDomElement({
    tagName: 'INPUT',
    id: 'terms-br',
    type: 'checkbox',
    attrs: { 'aria-label': 'Você confirma que leu, aceita e concorda com o Contrato do Usuário e com a Declaração de Privacidade do PayPal, e que é maior de idade.' },
  });
  const brazilMarketingCheckbox = createDomElement({
    tagName: 'INPUT',
    id: 'marketing-br',
    type: 'checkbox',
    attrs: { 'aria-label': 'Receber promoções e ofertas do PayPal.' },
  });
  const submitButton = createDomElement({
    tagName: 'BUTTON',
    id: 'hostedSubmit',
    text: 'Agree & Create Account',
    attrs: { 'data-testid': 'submit-button' },
  });
  const phoneErrorOkButton = createDomElement({
    tagName: 'BUTTON',
    id: 'phoneErrorOkButton',
    text: 'OK',
    attrs: { 'data-testid': 'primary-button-exceed' },
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
  const createAccountBillingLine1Input = createDomElement({ tagName: 'INPUT', id: 'billingLine1', type: 'text' });
  const createAccountBillingCityInput = createDomElement({ tagName: 'INPUT', id: 'billingCity', type: 'text' });
  const createAccountBillingPostalCodeInput = createDomElement({ tagName: 'INPUT', id: 'billingPostalCode', type: 'text' });
  const createAccountBillingStateSelect = createDomElement({
    tagName: 'SELECT',
    id: 'billingState',
    value: '',
    options: [
      { textContent: 'New York', label: 'New York', value: 'NY' },
      { textContent: 'Texas', label: 'Texas', value: 'TX' },
      { textContent: 'Washington', label: 'Washington', value: 'WA' },
    ],
  });
  const createAccountAddressErrorContainer = createDomElement({
    tagName: 'DIV',
    id: 'page-level-error-message',
    text: 'Check the address you entered and try again.',
    attrs: {
      'aria-live': 'polite',
      'data-testid': 'page-level-error-container',
      tabindex: '-1',
    },
  });
  const createAccountAddressErrorMessage = createDomElement({
    tagName: 'P',
    text: 'Check the address you entered and try again.',
    attrs: {
      'data-error-key': 'pageLevelError.invalidAddress',
      'data-testid': 'page-level-error-message',
    },
  });
  const createAccountSuggestionContainer = createDomElement({
    tagName: 'DIV',
    id: 'addressSuggestionContainer',
    attrs: { 'data-dd-action-name': '[Auto-suggested address]' },
  });
  const createAccountSuggestionList = createDomElement({
    tagName: 'UL',
    id: 'suggestedAddressList',
  });
  const createAccountSuggestionButton0 = createDomElement({
    tagName: 'BUTTON',
    id: 'addressIndex0',
    text: '2307 Spring Hill Road Petaluma, CA, USA',
  });
  const createAccountSuggestionButton1 = createDomElement({
    tagName: 'BUTTON',
    id: 'addressIndex1',
    text: '2307 Spring Forest Road Raleigh, NC, USA',
  });
  const readOnlyEmailFieldZh = createDomElement({
    tagName: 'DIV',
    text: '邮箱',
    attrs: { class: 'ReadOnlyFormField-container' },
  });
  const readOnlyEmailFieldEn = createDomElement({
    tagName: 'DIV',
    text: 'Email address',
    attrs: { class: 'ReadOnlyFormField-container' },
  });
  const plainEmailText = createDomElement({
    tagName: 'DIV',
    text: 'Email address',
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

  function showGuestCheckout(options = {}) {
    location.href = 'https://www.paypal.com/checkoutweb/signup';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/signup';
    body.innerText = options.brazil
      ? 'Pague com cartão de débito ou de crédito Brasil CEP Endereço Nº Distrito/Bairro Cidade Estado Data de nascimento CPF Contrato do Usuário Declaração de Privacidade'
      : 'Pay with debit or credit card';
    body.textContent = body.innerText;
    if (options.brazil) {
      firstNameInput.setAttribute('placeholder', 'Nome');
      lastNameInput.setAttribute('placeholder', 'Sobrenome');
      passwordInput.setAttribute('placeholder', 'Criar senha');
      setElements([
        countrySelect,
        emailInput,
        phoneTypeSelect,
        phoneInput,
        debitRadio,
        creditRadio,
        cardNumberInput,
        cardExpiryInput,
        cardCvvInput,
        firstNameInput,
        lastNameInput,
        brazilCepInput,
        brazilAddressInput,
        brazilNumberInput,
        brazilNeighborhoodInput,
        brazilCityInput,
        brazilStateSelect,
        passwordInput,
        brazilBirthdayInput,
        brazilCpfInput,
        brazilRequiredTermsCheckbox,
        brazilMarketingCheckbox,
        ...(options.addressSuggestions ? [createAccountSuggestionContainer, createAccountSuggestionList, createAccountSuggestionButton0, createAccountSuggestionButton1] : []),
        submitButton,
      ]);
      return;
    }
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
      ...(options.addressSuggestions ? [createAccountSuggestionContainer, createAccountSuggestionList, createAccountSuggestionButton0, createAccountSuggestionButton1] : []),
      submitButton,
    ]);
  }

  function showCreateAccount(options = {}) {
    location.href = 'https://www.paypal.com/checkoutweb/create-account';
    location.host = 'www.paypal.com';
    location.pathname = '/checkoutweb/create-account';
    body.innerText = options.invalidAddress
      ? 'Create your PayPal account. Agree & Create Account. Check the address you entered and try again.'
      : 'Create your PayPal account. Agree & Create Account';
    body.textContent = body.innerText;
    setElements([
      createAccountBillingLine1Input,
      createAccountBillingCityInput,
      createAccountBillingPostalCodeInput,
      createAccountBillingStateSelect,
      ...(options.invalidAddress ? [createAccountAddressErrorContainer, createAccountAddressErrorMessage] : []),
      ...(options.addressSuggestions ? [createAccountSuggestionContainer, createAccountSuggestionList, createAccountSuggestionButton0, createAccountSuggestionButton1] : []),
      createAccountButton,
    ]);
  }

  function showPayEmail() {
    location.href = 'https://www.paypal.com/pay?token=demo';
    location.host = 'www.paypal.com';
    location.pathname = '/pay';
    body.innerText = '请输入您的电子邮箱地址。 下一页 或 创建账户';
    body.textContent = body.innerText;
    setElements([emailInput, nextButton, createAccountButton]);
  }

  function showPayReadOnlyEmail({ locale = 'zh', plainTextOnly = false } = {}) {
    location.href = 'https://www.paypal.com/pay?token=demo';
    location.host = 'www.paypal.com';
    location.pathname = '/pay';
    const readOnlyField = locale === 'en' ? readOnlyEmailFieldEn : readOnlyEmailFieldZh;
    nextButton.textContent = locale === 'en' ? 'Continue' : '下一页';
    nextButton.innerText = nextButton.textContent;
    body.innerText = plainTextOnly
      ? 'Email address Continue'
      : `${readOnlyField.textContent} ${nextButton.textContent}`;
    body.textContent = body.innerText;
    setElements([
      plainTextOnly ? plainEmailText : readOnlyField,
      nextButton,
      createAccountButton,
    ]);
  }

  function showPayReadOnlyEmailAfterDelay({ locale = 'en' } = {}) {
    location.href = 'https://www.paypal.com/pay?token=demo';
    location.host = 'www.paypal.com';
    location.pathname = '/pay';
    delayedReadOnlyEmailField = locale === 'en' ? readOnlyEmailFieldEn : readOnlyEmailFieldZh;
    nextButton.textContent = locale === 'en' ? 'Continue' : '下一页';
    nextButton.innerText = nextButton.textContent;
    body.innerText = `${delayedReadOnlyEmailField.textContent} ${nextButton.textContent}`;
    body.textContent = body.innerText;
    setElements([nextButton, createAccountButton]);
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

  function showGuestPortuguesePhoneError() {
    showGuestCheckout({ brazil: true });
    body.innerText = 'Não foi possível concluir sua solicitação. Tente outro número de telefone.';
    body.textContent = body.innerText;
    setElements([...elements, phoneErrorOkButton]);
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
        const labelForMatch = text.match(/^label\[for="(.+)"\]$/);
        if (labelForMatch) {
          return elements.find((element) => element.tagName === 'LABEL' && element.getAttribute('for') === labelForMatch[1]) || null;
        }
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
        if (text.includes('primary-button-exceed')) {
          return elements.includes(phoneErrorOkButton) ? phoneErrorOkButton : null;
        }
        return null;
      },
      querySelectorAll(selector) {
        const text = String(selector || '');
        if (text === '*') return elements.slice();
        if (text.includes(',')) {
          const seen = new Set();
          return text.split(',')
            .flatMap((part) => this.querySelectorAll(part.trim()))
            .filter((element) => {
              if (seen.has(element)) return false;
              seen.add(element);
              return true;
            });
        }
        if (text === 'input') return elements.filter((element) => element.tagName === 'INPUT');
        if (text === 'textarea') return elements.filter((element) => element.tagName === 'TEXTAREA');
        if (text === 'select') return elements.filter((element) => element.tagName === 'SELECT');
        if (text.includes('input[type="checkbox"]')) return elements.filter((element) => element.tagName === 'INPUT' && element.type === 'checkbox');
        if (text.includes('input[type="radio"]')) return elements.filter((element) => element.tagName === 'INPUT' && element.type === 'radio');
        if (text === 'input[type="email"]') return elements.filter((element) => element.type === 'email');
        if (text === 'input[type="password"]') return elements.filter((element) => element.type === 'password');
        if (text === 'input[type="tel"]') return elements.filter((element) => element.tagName === 'INPUT' && element.type === 'tel');
        if (text.includes('data-testid') && text.includes('phone')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /phone/i.test(element.getAttribute('data-testid') || ''));
        }
        if (text.includes('name') && text.includes('phone')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /phone/i.test(element.name || ''));
        }
        if (text.includes('autocomplete') && text.includes('tel')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /^tel/i.test(element.getAttribute('autocomplete') || ''));
        }
        if (text.includes('inputmode') && text.includes('tel')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /^tel$/i.test(element.getAttribute('inputmode') || ''));
        }
        if (text.includes('cpf')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /cpf/i.test([
            element.id,
            element.name,
            element.getAttribute('placeholder'),
            element.getAttribute('aria-label'),
          ].filter(Boolean).join(' ')));
        }
        if (text.includes('document')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /document|cpf|cnpj/i.test([
            element.id,
            element.name,
            element.getAttribute('placeholder'),
            element.getAttribute('aria-label'),
          ].filter(Boolean).join(' ')));
        }
        if (text.includes('tax')) {
          return elements.filter((element) => element.tagName === 'INPUT' && /tax|cpf|cnpj/i.test([
            element.id,
            element.name,
            element.getAttribute('placeholder'),
            element.getAttribute('aria-label'),
          ].filter(Boolean).join(' ')));
        }
        if (text.includes('addressSuggestionContainer') || text.includes('suggestedAddressList') || text.includes('Auto-suggested address')) {
          return elements.filter((element) => (
            element.id === 'addressSuggestionContainer'
            || element.id === 'suggestedAddressList'
            || /^addressIndex/.test(element.id || '')
          ));
        }
        if (text.includes('button[id^="addressIndex"]') || text === 'li button') {
          return elements.filter((element) => element.tagName === 'BUTTON' && /^addressIndex/.test(element.id || ''));
        }
        if (text.includes('[role="option"]')) {
          return elements.filter((element) => element.getAttribute('role') === 'option');
        }
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
        if (
          text.includes('page-level-error-message')
          || text.includes('page-level-error-container')
          || text.includes('[data-error-key]')
          || text.includes('[aria-live]')
        ) {
          return elements.filter((element) => (
            element.id === 'page-level-error-message'
            || element.getAttribute('data-testid') === 'page-level-error-container'
            || element.getAttribute('data-testid') === 'page-level-error-message'
            || Boolean(element.getAttribute('data-error-key'))
            || Boolean(element.getAttribute('aria-live'))
          ));
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
    sleep(ms) {
      sleepCount += 1;
      events.push({ type: 'sleep', ms });
      if (delayedReadOnlyEmailField && sleepCount >= 2 && !elements.includes(delayedReadOnlyEmailField)) {
        setElements([delayedReadOnlyEmailField, nextButton, createAccountButton]);
      }
      return Promise.resolve();
    },
    fillInput(element, value) {
      const isPhoneElement = element === phoneInput
        || /phone/i.test(element.id || '')
        || /phone/i.test(element.name || '')
        || String(element.type || '').toLowerCase() === 'tel'
        || /^tel/i.test(element.getAttribute?.('autocomplete') || '');
      if (isPhoneElement && typeof options.renderPhone === 'function') {
        phoneFillCount += 1;
        element.value = options.renderPhone(value, phoneFillCount);
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
    countrySelect,
    createDomElement,
    events,
    send,
    setElements,
    elements: () => elements.slice(),
    brazil: {
      phoneTypeSelect,
      creditRadio,
      debitRadio,
      cepInput: brazilCepInput,
      addressInput: brazilAddressInput,
      numberInput: brazilNumberInput,
      neighborhoodInput: brazilNeighborhoodInput,
      cityInput: brazilCityInput,
      stateSelect: brazilStateSelect,
      birthdayInput: brazilBirthdayInput,
      cpfInput: brazilCpfInput,
      requiredTermsCheckbox: brazilRequiredTermsCheckbox,
      marketingCheckbox: brazilMarketingCheckbox,
    },
    showBlockedPage,
    showCaptchaOverlay,
    showGuestCardError,
    showPayEmail,
    showPayReadOnlyEmail,
    showPayReadOnlyEmailAfterDelay,
    showCreateAccount,
    showGenericError,
    showGuestCheckout,
    showGuestPhoneError,
    showGuestPortuguesePhoneError,
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
  assert.equal(harness.countrySelect.value, 'US');
  assert.equal(harness.events.some((event) => event.type === 'dispatch' && event.id === 'country' && event.event === 'input' && event.value === 'US'), true);
  assert.equal(harness.events.some((event) => event.type === 'dispatch' && event.id === 'country' && event.event === 'change' && event.value === 'US'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.events.filter((event) => event.type === 'operation').map((event) => event.metadata))),
    [{ stepKey: 'paypal-hosted-card', kind: 'click', label: 'hosted-paypal-card-submit' }]
  );
});

test('PayPal hosted guest checkout refills profile when phone input stays empty after fill', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value, phoneFillCount) => (phoneFillCount === 1 ? '' : `+1 ${value}`),
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
      phonePostFillCheckDelayMs: 10000,
      phoneEmptyRefillMaxRetries: 3,
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
  assert.equal(
    harness.events.filter((event) => event.type === 'fill' && event.id === 'phone').length,
    2
  );
  assert.deepEqual(
    harness.events.filter((event) => event.type === 'sleep' && event.ms === 10000).map((event) => event.ms),
    [10000, 10000]
  );
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
});

test('PayPal hosted guest checkout uses 8 second default before refilling empty phone', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value, phoneFillCount) => (phoneFillCount === 1 ? '' : `+1 ${value}`),
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
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.phonePostFillCheckDelayMs, 8000);
  assert.equal(result.phoneRefillAttempts, 2);
  assert.deepEqual(
    harness.events.filter((event) => event.type === 'sleep' && event.ms === 8000).map((event) => event.ms),
    [8000, 8000]
  );
});

test('PayPal hosted guest checkout finds phone input without phone id', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showGuestCheckout();
  const alternatePhoneInput = harness.createDomElement({
    tagName: 'INPUT',
    id: 'contact-number',
    type: 'tel',
    name: 'phoneNumber',
    attrs: {
      autocomplete: 'tel-national',
      placeholder: 'Mobile number',
    },
  });
  const nextElements = harness.elements()
    .filter((element) => element.id !== 'phone');
  const emailIndex = nextElements.findIndex((element) => element.id === 'email');
  nextElements.splice(emailIndex + 1, 0, alternatePhoneInput);
  harness.setElements(nextElements);

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
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.phoneMatched, true);
  assert.equal(result.renderedPhoneDigits, '14155551234');
  assert.match(result.phoneInputDescriptor, /contact-number|phoneNumber|tel-national/);
  assert.equal(
    harness.events.some((event) => event.type === 'fill' && event.id === 'contact-number' && event.value === '+1 4155551234'),
    true
  );
});

test('PayPal hosted guest checkout fails without submit when phone input remains empty after refills', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: () => '',
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
      phonePostFillCheckDelayMs: 0,
      phoneEmptyRefillMaxRetries: 3,
      address: { street: '1 Main St', city: 'New York', state: 'New York', zip: '10001' },
    },
  });

  assert.equal(result.ok, undefined);
  assert.match(result.error, /^PAYPAL_HOSTED_PHONE_EMPTY_AFTER_FILL::/);
  assert.equal(
    harness.events.filter((event) => event.type === 'fill' && event.id === 'phone').length,
    4
  );
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), false);
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

test('PayPal hosted guest checkout fills Brazil-specific profile fields and required terms', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => value,
  });
  harness.showGuestCheckout({ brazil: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      countryCode: 'BR',
      generatedFromCountry: 'BR',
      email: 'guest.br@example.com',
      phone: '+5511987654321',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      cardType: 'credit',
      password: 'Aa1!example',
      firstName: 'Lucas',
      lastName: 'Silva',
      birthday: '03/02/2001',
      cpf: '529.982.247-25',
      documentNumber: '529.982.247-25',
      address: {
        countryCode: 'BR',
        street: 'Rua Haddock Lobo 1307',
        streetName: 'Rua Haddock Lobo',
        number: '1307',
        neighborhood: 'Jardins',
        city: 'Sao Paulo',
        state: 'Sao Paulo',
        stateCode: 'SP',
        zip: '01414-003',
        postalCode: '01414-003',
        cpf: '529.982.247-25',
        documentNumber: '529.982.247-25',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.submitted, true);
  assert.equal(result.phoneMatched, true);
  assert.equal(result.brazilPhoneTypeSelected, true);
  assert.equal(result.brazilCardTypeSelected, true);
  assert.equal(result.brazilBirthdayFilled, true);
  assert.equal(result.brazilTermsChecked, true);
  assert.equal(result.brazilMarketingTermsSkipped, true);
  assert.equal(result.brazilRequiredFieldsReady, true);
  assert.equal(harness.countrySelect.value, 'BR');
  assert.equal(harness.brazil.phoneTypeSelect.value, 'mobile');
  assert.equal(harness.brazil.creditRadio.checked, true);
  assert.equal(harness.brazil.debitRadio.checked, false);
  assert.equal(harness.brazil.cepInput.value, '01414-003');
  assert.equal(harness.brazil.addressInput.value, 'Rua Haddock Lobo');
  assert.equal(harness.brazil.numberInput.value, '1307');
  assert.equal(harness.brazil.neighborhoodInput.value, 'Jardins');
  assert.equal(harness.brazil.cityInput.value, 'Sao Paulo');
  assert.equal(harness.brazil.stateSelect.value, 'SP');
  assert.equal(harness.brazil.birthdayInput.value, '03/02/2001');
  assert.equal(harness.brazil.cpfInput.value, '529.982.247-25');
  assert.equal(harness.brazil.requiredTermsCheckbox.checked, true);
  assert.equal(harness.brazil.marketingCheckbox.checked, false);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
});

test('PayPal hosted guest checkout still converts legacy Brazil ISO birthday', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => value,
  });
  harness.showGuestCheckout({ brazil: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      countryCode: 'BR',
      generatedFromCountry: 'BR',
      email: 'guest.br@example.com',
      phone: '+5511987654321',
      cardNumber: '4147200000000000',
      cardExpiry: '12 / 29',
      cardCvv: '123',
      cardType: 'credit',
      password: 'Aa1example2',
      firstName: 'Lucas',
      lastName: 'Silva',
      birthday: '2001-02-03',
      cpf: '529.982.247-25',
      documentNumber: '529.982.247-25',
      address: {
        countryCode: 'BR',
        street: 'Rua Haddock Lobo 1307',
        streetName: 'Rua Haddock Lobo',
        number: '1307',
        neighborhood: 'Jardins',
        city: 'Sao Paulo',
        state: 'Sao Paulo',
        stateCode: 'SP',
        zip: '01414-003',
        postalCode: '01414-003',
        cpf: '529.982.247-25',
        documentNumber: '529.982.247-25',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.brazilBirthdayFilled, true);
  assert.equal(harness.brazil.birthdayInput.value, '03/02/2001');
});

test('PayPal hosted guest checkout address-only retry only refills billing address', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGuestCheckout();

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      addressOnly: true,
      address: {
        street: '2307 Spring Hill Road',
        city: 'Petaluma',
        state: 'California',
        zip: '94952',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'guest_checkout');
  assert.equal(result.submitted, true);
  assert.equal(result.addressOnly, true);
  assert.equal(result.addressRefilled, true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '2307 Spring Hill Road'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingCity' && event.value === 'Petaluma'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingPostalCode' && event.value === '94952'), true);
  assert.equal(harness.events.some((event) => event.type === 'dispatch' && event.id === 'billingState' && event.event === 'change' && event.value === 'CA'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
  assert.deepEqual(
    harness.events
      .filter((event) => event.type === 'fill' && [
        'email',
        'phone',
        'cardNumber',
        'cardExpiry',
        'cardCvv',
        'password',
        'firstName',
        'lastName',
      ].includes(event.id))
      .map((event) => event.id),
    []
  );
});

test('PayPal hosted guest checkout fails when visible country select cannot switch to US', async () => {
  const harness = createHostedPayPalHarness({
    renderPhone: (value) => `+1 ${value}`,
  });
  harness.showGuestCheckout();
  harness.countrySelect.value = 'DE';
  harness.countrySelect.options = [
    { textContent: 'Germany', label: 'Germany', value: 'DE', selected: true },
    { textContent: 'Canada', label: 'Canada', value: 'CA' },
  ];

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
      address: {
        street: '1 Main St',
        city: 'New York',
        state: 'New York',
        zip: '10001',
      },
    },
  });

  assert.equal(result.ok, undefined);
  assert.match(result.error, /country dropdown does not contain (?:United States|US)/);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), false);
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
  assert.equal(typeof state.scriptVersion, 'string');
  assert.equal(state.readOnlyEmailDetected, false);
  assert.equal(Array.isArray(state.visibleInputSummaries), true);

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
      emailInputStableWaitMs: 5000,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'pay_login');
  assert.equal(result.submitted, true);
  assert.equal(typeof result.scriptVersion, 'string');
  assert.equal(result.emailInputStableWaitMs, 5000);
  assert.equal(harness.events.some((event) => event.type === 'sleep' && event.ms === 5000), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'email' && event.value === 'guest@example.com'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), false);
  assert.deepEqual(
    JSON.parse(JSON.stringify(harness.events.filter((event) => event.type === 'operation').map((event) => event.metadata))),
    [{ stepKey: 'paypal-hosted-email', kind: 'click', label: 'hosted-paypal-email-next' }]
  );
});

test('PayPal hosted /pay skips Chinese read-only email field and clicks Next', async () => {
  const harness = createHostedPayPalHarness();
  harness.showPayReadOnlyEmail({ locale: 'zh' });

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });
  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'pay_login');
  assert.equal(state.hasHostedEmailInput, true);
  assert.equal(typeof state.scriptVersion, 'string');
  assert.equal(state.readOnlyEmailDetected, true);
  assert.match(state.readOnlyEmailLabel, /邮箱/);
  assert.match(state.readOnlyEmailSummary, /ReadOnlyFormField|邮箱/);
  assert.equal(Array.isArray(state.visibleInputSummaries), true);

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
      emailInputStableWaitMs: 5000,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'pay_login');
  assert.equal(result.submitted, true);
  assert.equal(result.emailSkipped, true);
  assert.equal(result.readOnlyEmailDetected, true);
  assert.match(result.readOnlyEmailLabel, /邮箱/);
  assert.equal(harness.events.some((event) => event.type === 'sleep' && event.ms === 5000), false);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.value === 'guest@example.com'), false);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), false);
});

test('PayPal hosted /pay rechecks when read-only email field appears after initial probe', async () => {
  const harness = createHostedPayPalHarness();
  harness.showPayReadOnlyEmailAfterDelay({ locale: 'en' });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
      emailInputTimeoutMs: 1,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.emailSkipped, true);
  assert.equal(result.readOnlyEmailDetected, true);
  assert.match(result.readOnlyEmailLabel, /Email/i);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.value === 'guest@example.com'), false);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), true);
});

test('PayPal hosted /pay skips English read-only email field and clicks Continue', async () => {
  const harness = createHostedPayPalHarness();
  harness.showPayReadOnlyEmail({ locale: 'en' });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.emailSkipped, true);
  assert.equal(result.readOnlyEmailDetected, true);
  assert.match(result.readOnlyEmailLabel, /Email/i);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.value === 'guest@example.com'), false);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), true);
});

test('PayPal hosted /pay does not skip plain email text without read-only structure', async () => {
  const harness = createHostedPayPalHarness();
  harness.showPayReadOnlyEmail({ locale: 'en', plainTextOnly: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'pay_login',
      email: 'guest@example.com',
      emailInputTimeoutMs: 1,
    },
  });

  assert.equal(result.ok, undefined);
  assert.match(result.error, /未找到邮箱输入框或只读邮箱字段/);
  assert.match(result.error, /scriptVersion:/);
  assert.match(result.error, /visibleButtons:/);
  assert.match(result.error, /body: Email address Continue/);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.value === 'guest@example.com'), false);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'btnNext'), false);
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

test('PayPal hosted create account page exposes invalid address error', async () => {
  const harness = createHostedPayPalHarness();
  harness.showCreateAccount({ invalidAddress: true });

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'create_account');
  assert.equal(state.hostedCreateAccountAddressError, true);
  assert.match(state.hostedCreateAccountAddressErrorMessage, /Check the address/);
});

test('PayPal hosted create account step refills address before retry click', async () => {
  const harness = createHostedPayPalHarness();
  harness.showCreateAccount({ invalidAddress: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'create_account',
      address: {
        street: '8 Retry Ave',
        city: 'Austin',
        state: 'Texas',
        zip: '73301',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.stage, 'create_account');
  assert.equal(result.submitted, true);
  assert.equal(result.addressRefilled, true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '8 Retry Ave'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingCity' && event.value === 'Austin'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingPostalCode' && event.value === '73301'), true);
  assert.equal(harness.events.some((event) => event.type === 'dispatch' && event.id === 'billingState' && event.event === 'change' && event.value === 'TX'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), true);
});

test('PayPal hosted create account selects first address suggestion when fallback is requested', async () => {
  const harness = createHostedPayPalHarness();
  harness.showCreateAccount({ invalidAddress: true, addressSuggestions: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'create_account',
      useAddressSuggestionFallback: true,
      address: {
        street: '2307 Spring Hill Road',
        city: 'Petaluma',
        state: 'California',
        zip: '94952',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.addressSuggestionFallbackAttempted, true);
  assert.equal(result.addressSuggestionSelected, true);
  assert.match(result.addressSuggestionSelectedText, /Petaluma/);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '2307 Spring Hill Roa'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'addressIndex0'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), true);
});

test('PayPal hosted create account restores address when suggestion fallback has no options', async () => {
  const harness = createHostedPayPalHarness();
  harness.showCreateAccount({ invalidAddress: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'create_account',
      useAddressSuggestionFallback: true,
      address: {
        street: '8 Retry Ave',
        city: 'Austin',
        state: 'Texas',
        zip: '73301',
      },
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.addressSuggestionFallbackAttempted, true);
  assert.equal(result.addressSuggestionSelected, false);
  assert.match(result.addressSuggestionError, /suggestions/i);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '8 Retry Av'), true);
  assert.equal(harness.events.some((event) => event.type === 'fill' && event.id === 'billingLine1' && event.value === '8 Retry Ave'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'createAccountButton'), true);
});

test('PayPal hosted guest checkout selects first address suggestion without breaking phone check', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGuestCheckout({ addressSuggestions: true });

  const result = await harness.send({
    type: 'PAYPAL_RUN_HOSTED_CHECKOUT_STEP',
    source: 'test',
    payload: {
      expectedStage: 'guest_checkout',
      useAddressSuggestionFallback: true,
      email: 'guest@example.com',
      phone: '4155551234',
      address: {
        street: '2307 Spring Hill Road',
        city: 'Petaluma',
        state: 'California',
        zip: '94952',
      },
      phonePostFillCheckDelayMs: 0,
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.phoneMatched, true);
  assert.equal(result.addressSuggestionFallbackAttempted, true);
  assert.equal(result.addressSuggestionSelected, true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'addressIndex0'), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'hostedSubmit'), true);
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

test('PayPal hosted guest checkout dismisses Portuguese phone error OK dialog', async () => {
  const harness = createHostedPayPalHarness();
  harness.showGuestPortuguesePhoneError();

  const state = await harness.send({
    type: 'PAYPAL_HOSTED_GET_STATE',
    source: 'test',
    payload: {},
  });

  assert.equal(state.ok, true);
  assert.equal(state.hostedStage, 'guest_checkout');
  assert.equal(state.hostedGuestPhoneError, true);
  assert.match(state.hostedGuestPhoneErrorMessage, /Não foi possível concluir sua solicitação/i);

  const dismissResult = await harness.send({
    type: 'PAYPAL_HOSTED_DISMISS_PHONE_ERROR',
    source: 'test',
    payload: {
      dismissPhoneErrorDelayMs: 3000,
    },
  });

  assert.equal(dismissResult.ok, true);
  assert.equal(dismissResult.phoneErrorDismissed, true);
  assert.equal(dismissResult.okButtonFound, true);
  assert.match(dismissResult.hostedGuestPhoneErrorMessage, /Tente outro número de telefone/i);
  assert.equal(harness.events.some((event) => event.type === 'sleep' && event.ms === 3000), true);
  assert.equal(harness.events.some((event) => event.type === 'click' && event.id === 'phoneErrorOkButton'), true);
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
