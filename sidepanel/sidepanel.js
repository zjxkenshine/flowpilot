// sidepanel/sidepanel.js — Side Panel logic

const STATUS_ICONS = {
  pending: '',
  running: '',
  completed: '\u2713',  // ✓
  failed: '\u2717',     // ✗
  stopped: '\u25A0',    // ■
  manual_completed: '跳',
  skipped: '跳',
  disabled: '禁',
};

const logArea = document.getElementById('log-area');
const btnOpenAccountBook = document.getElementById('btn-open-account-book');
const accountBookOverlay = document.getElementById('account-book-overlay');
const accountBookCount = document.getElementById('account-book-count');
const accountBookBody = document.getElementById('account-book-body');
const btnExportAccountBook = document.getElementById('btn-export-account-book');
const btnClearAccountBook = document.getElementById('btn-clear-account-book');
const btnCloseAccountBook = document.getElementById('btn-close-account-book');
const btnOpenAccountRecords = document.getElementById('btn-open-account-records');
const accountRecordsOverlay = document.getElementById('account-records-overlay');
const accountRecordsMeta = document.getElementById('account-records-meta');
const accountRecordsStats = document.getElementById('account-records-stats');
const accountRecordsList = document.getElementById('account-records-list');
const accountRecordsPageLabel = document.getElementById('account-records-page-label');
const btnAccountRecordsPrev = document.getElementById('btn-account-records-prev');
const btnAccountRecordsNext = document.getElementById('btn-account-records-next');
const btnCloseAccountRecords = document.getElementById('btn-close-account-records');
const btnClearAccountRecords = document.getElementById('btn-clear-account-records');
const btnToggleAccountRecordsSelection = document.getElementById('btn-toggle-account-records-selection');
const btnDeleteSelectedAccountRecords = document.getElementById('btn-delete-selected-account-records');
const updateSection = document.getElementById('update-section');
const btnRepoHome = document.getElementById('btn-repo-home');
const extensionUpdateStatus = document.getElementById('extension-update-status');
const extensionVersionMeta = document.getElementById('extension-version-meta');
const btnReleaseLog = document.getElementById('btn-release-log');
const updateCardVersion = document.getElementById('update-card-version');
const updateCardSummary = document.getElementById('update-card-summary');
const updateReleaseList = document.getElementById('update-release-list');
const btnIgnoreRelease = document.getElementById('btn-ignore-release');
const btnOpenRelease = document.getElementById('btn-open-release');
const settingsCard = document.getElementById('settings-card');
const selectFlow = document.getElementById('select-flow');
const accountContributionPanel = document.getElementById('contribution-mode-panel');
const accountContributionBadge = document.getElementById('contribution-mode-badge');
const accountContributionText = document.getElementById('contribution-mode-text');
const inputContributionNickname = document.getElementById('input-contribution-nickname');
const inputContributionQq = document.getElementById('input-contribution-qq');
const contributionPrimaryStatusLabel = document.getElementById('contribution-primary-status-label');
const contributionSecondaryStatusLabel = document.getElementById('contribution-secondary-status-label');
const contributionOauthStatus = document.getElementById('contribution-oauth-status');
const contributionCallbackStatus = document.getElementById('contribution-callback-status');
const accountContributionSummary = document.getElementById('contribution-mode-summary');
const btnStartContribution = document.getElementById('btn-start-contribution');
const btnOpenContributionUpload = document.getElementById('btn-open-contribution-upload');
const btnExitContributionMode = document.getElementById('btn-exit-contribution-mode');
const displayOauthUrl = document.getElementById('display-oauth-url');
const displayLocalhostUrl = document.getElementById('display-localhost-url');
const displayStatus = document.getElementById('display-status');
const statusBar = document.getElementById('status-bar');
const inputEmail = document.getElementById('input-email');
const inputSignupPhone = document.getElementById('input-signup-phone');
const inputPassword = document.getElementById('input-password');
const btnToggleVpsUrl = document.getElementById('btn-toggle-vps-url');
const btnToggleVpsPassword = document.getElementById('btn-toggle-vps-password');
const btnFetchEmail = document.getElementById('btn-fetch-email');
const btnTogglePassword = document.getElementById('btn-toggle-password');
const btnSaveSettings = document.getElementById('btn-save-settings');
const btnStop = document.getElementById('btn-stop');
const btnReset = document.getElementById('btn-reset');
const btnContributionMode = document.getElementById('btn-contribution-mode');
const contributionUpdateLayer = document.getElementById('contribution-update-layer');
const contributionUpdateHint = document.getElementById('contribution-update-hint');
const contributionUpdateHintText = document.getElementById('contribution-update-hint-text');
const btnDismissContributionUpdateHint = document.getElementById('btn-dismiss-contribution-update-hint');
const autoRunAdBar = document.getElementById('auto-run-ad-bar');
const autoRunAdViewport = document.getElementById('auto-run-ad-viewport');
const autoRunAdTrack = document.getElementById('auto-run-ad-track');
const autoRunAdText = document.getElementById('auto-run-ad-text');
const autoRunAdTextClone = document.getElementById('auto-run-ad-text-clone');
const stepsProgress = document.getElementById('steps-progress');
const btnAutoRun = document.getElementById('btn-auto-run');
const btnAutoContinue = document.getElementById('btn-auto-continue');
const autoContinueBar = document.getElementById('auto-continue-bar');
const autoScheduleBar = document.getElementById('auto-schedule-bar');
const autoScheduleTitle = document.getElementById('auto-schedule-title');
const autoScheduleMeta = document.getElementById('auto-schedule-meta');
const btnAutoRunNow = document.getElementById('btn-auto-run-now');
const btnAutoCancelSchedule = document.getElementById('btn-auto-cancel-schedule');
const btnClearLog = document.getElementById('btn-clear-log');
const configMenuShell = document.getElementById('config-menu-shell');
const btnConfigMenu = document.getElementById('btn-config-menu');
const configMenu = document.getElementById('config-menu');
const btnExportSettings = document.getElementById('btn-export-settings');
const btnImportSettings = document.getElementById('btn-import-settings');
const inputImportSettingsFile = document.getElementById('input-import-settings-file');
const labelSourceSelector = document.getElementById('label-source-selector');
const selectPanelMode = document.getElementById('select-panel-mode');
const rowVpsUrl = document.getElementById('row-vps-url');
const inputVpsUrl = document.getElementById('input-vps-url');
const rowVpsPassword = document.getElementById('row-vps-password');
const inputVpsPassword = document.getElementById('input-vps-password');
const rowLocalCpaStep9Mode = document.getElementById('row-local-cpa-step9-mode');
const localCpaStep9ModeButtons = Array.from(document.querySelectorAll('[data-local-cpa-step9-mode]'));
const rowSub2ApiUrl = document.getElementById('row-sub2api-url');
const inputSub2ApiUrl = document.getElementById('input-sub2api-url');
const rowSub2ApiEmail = document.getElementById('row-sub2api-email');
const inputSub2ApiEmail = document.getElementById('input-sub2api-email');
const rowSub2ApiPassword = document.getElementById('row-sub2api-password');
const inputSub2ApiPassword = document.getElementById('input-sub2api-password');
const rowSub2ApiGroup = document.getElementById('row-sub2api-group');
const inputSub2ApiGroup = document.getElementById('input-sub2api-group');
const sub2ApiGroupPickerRoot = document.getElementById('sub2api-group-picker');
const btnSub2ApiGroupMenu = document.getElementById('btn-sub2api-group-menu');
const sub2ApiGroupCurrent = document.getElementById('sub2api-group-current');
const sub2ApiGroupMenu = document.getElementById('sub2api-group-menu');
const btnAddSub2ApiGroup = document.getElementById('btn-add-sub2api-group');
const rowSub2ApiAccountPriority = document.getElementById('row-sub2api-account-priority');
const inputSub2ApiAccountPriority = document.getElementById('input-sub2api-account-priority');
const rowSub2ApiDefaultProxy = document.getElementById('row-sub2api-default-proxy');
const inputSub2ApiDefaultProxy = document.getElementById('input-sub2api-default-proxy');
const rowSub2ApiReloginEnabled = document.getElementById('row-sub2api-relogin-enabled');
const inputSub2ApiReloginEnabled = document.getElementById('input-sub2api-relogin-enabled');
const rowSub2ApiReloginPool = document.getElementById('row-sub2api-relogin-pool');
const inputSub2ApiReloginAccountPool = document.getElementById('input-sub2api-relogin-account-pool');
const inputSub2ApiReloginPoolImport = document.getElementById('input-sub2api-relogin-pool-import');
const btnSub2ApiReloginPoolImport = document.getElementById('btn-sub2api-relogin-pool-import');
const btnSub2ApiReloginPoolRefresh = document.getElementById('btn-sub2api-relogin-pool-refresh');
const btnSub2ApiReloginPoolCopy = document.getElementById('btn-sub2api-relogin-pool-copy');
const btnSub2ApiReloginPoolClearUsed = document.getElementById('btn-sub2api-relogin-pool-clear-used');
const btnSub2ApiReloginPoolDeleteAll = document.getElementById('btn-sub2api-relogin-pool-delete-all');
const sub2ApiReloginPoolSummary = document.getElementById('sub2api-relogin-pool-summary');
const inputSub2ApiReloginPoolSearch = document.getElementById('input-sub2api-relogin-pool-search');
const selectSub2ApiReloginPoolFilter = document.getElementById('select-sub2api-relogin-pool-filter');
const sub2ApiReloginPoolList = document.getElementById('sub2api-relogin-pool-list');
const rowIpProxyEnabled = document.getElementById('row-ip-proxy-enabled');
const inputIpProxyEnabled = document.getElementById('input-ip-proxy-enabled');
const btnToggleIpProxySection = document.getElementById('btn-toggle-ip-proxy-section');
const ipProxyEnabledStatus = document.getElementById('ip-proxy-enabled-status');
const ipProxyEnabledStatusDot = document.getElementById('ip-proxy-enabled-status-dot');
const ipProxyEnabledStatusText = document.getElementById('ip-proxy-enabled-status-text');
const ipProxyEnabledButtons = Array.from(document.querySelectorAll('[data-ip-proxy-enabled]'));
const rowIpProxyFold = document.getElementById('row-ip-proxy-fold');
const rowIpProxyService = document.getElementById('row-ip-proxy-service');
const selectIpProxyService = document.getElementById('select-ip-proxy-service');
const btnIpProxyServiceLogin = document.getElementById('btn-ip-proxy-service-login');
const rowIpProxyMode = document.getElementById('row-ip-proxy-mode');
const ipProxyModeButtons = Array.from(document.querySelectorAll('[data-ip-proxy-mode]'));
const rowIpProxyApiRouteMode = document.getElementById('row-ip-proxy-api-route-mode');
const selectIpProxyApiRouteMode = document.getElementById('select-ip-proxy-api-route-mode');
const rowIpProxySpecialDomainRouteMode = document.getElementById('row-ip-proxy-special-domain-route-mode');
const selectIpProxySpecialDomainRouteMode = document.getElementById('select-ip-proxy-special-domain-route-mode');
const rowIpProxyLayout = document.getElementById('row-ip-proxy-layout');
const ipProxyLayout = document.getElementById('ip-proxy-layout');
const ipProxyApiPanel = document.getElementById('ip-proxy-api-panel');
const rowIpProxyApiUrl = document.getElementById('row-ip-proxy-api-url');
const inputIpProxyApiUrl = document.getElementById('input-ip-proxy-api-url');
const btnToggleIpProxyApiUrl = document.getElementById('btn-toggle-ip-proxy-api-url');
const rowIpProxyApiCount = document.getElementById('row-ip-proxy-api-count');
const inputIpProxyApiCount = document.getElementById('input-ip-proxy-api-count');
const rowIpProxyApiRegion = document.getElementById('row-ip-proxy-api-region');
const inputIpProxyApiRegion = document.getElementById('input-ip-proxy-api-region');
const rowIpProxyApiZone = document.getElementById('row-ip-proxy-api-zone');
const inputIpProxyApiZone = document.getElementById('input-ip-proxy-api-zone');
const rowIpProxyApiPtype = document.getElementById('row-ip-proxy-api-ptype');
const inputIpProxyApiPtype = document.getElementById('input-ip-proxy-api-ptype');
const rowIpProxyApiHost = document.getElementById('row-ip-proxy-api-host');
const selectIpProxyApiHost = document.getElementById('select-ip-proxy-api-host');
const rowIpProxyApiProto = document.getElementById('row-ip-proxy-api-proto');
const selectIpProxyApiProto = document.getElementById('select-ip-proxy-api-proto');
const rowIpProxyApiStype = document.getElementById('row-ip-proxy-api-stype');
const selectIpProxyApiStype = document.getElementById('select-ip-proxy-api-stype');
const rowIpProxyApiSplit = document.getElementById('row-ip-proxy-api-split');
const selectIpProxyApiSplit = document.getElementById('select-ip-proxy-api-split');
const inputIpProxyApiSplit = selectIpProxyApiSplit;
const rowIpProxyApiSessType = document.getElementById('row-ip-proxy-api-sess-type');
const selectIpProxyApiSessType = document.getElementById('select-ip-proxy-api-sess-type');
const rowIpProxyApiSessTime = document.getElementById('row-ip-proxy-api-sess-time');
const inputIpProxyApiSessTime = document.getElementById('input-ip-proxy-api-sess-time');
const rowIpProxyApiSessAuto = document.getElementById('row-ip-proxy-api-sess-auto');
const selectIpProxyApiSessAuto = document.getElementById('select-ip-proxy-api-sess-auto');
const rowIpProxyApiRefreshKey = document.getElementById('row-ip-proxy-api-refresh-key');
const inputIpProxyApiRefreshKey = document.getElementById('input-ip-proxy-api-refresh-key');
const rowIpProxyApiRefreshUrl = document.getElementById('row-ip-proxy-api-refresh-url');
const inputIpProxyApiRefreshUrl = document.getElementById('input-ip-proxy-api-refresh-url');
const rowIpProxyAccountList = document.getElementById('row-ip-proxy-account-list');
const inputIpProxyAccountList = document.getElementById('input-ip-proxy-account-list');
const rowIpProxyAccountSessionPrefix = document.getElementById('row-ip-proxy-account-session-prefix');
const inputIpProxyAccountSessionPrefix = document.getElementById('input-ip-proxy-account-session-prefix');
const rowIpProxyAccountLifeMinutes = document.getElementById('row-ip-proxy-account-life-minutes');
const inputIpProxyAccountLifeMinutes = document.getElementById('input-ip-proxy-account-life-minutes');
const rowIpProxyPoolTargetCount = document.getElementById('row-ip-proxy-pool-target-count');
const inputIpProxyPoolTargetCount = document.getElementById('input-ip-proxy-pool-target-count');
const rowIpProxySwitchIpRoundCount = document.getElementById('row-ip-proxy-switch-ip-round-count');
const inputIpProxySwitchIpRoundCount = document.getElementById('input-ip-proxy-switch-ip-round-count');
const rowIpProxyAutoRefreshPoolOnExhausted = document.getElementById('row-ip-proxy-auto-refresh-pool-on-exhausted');
const inputIpProxyAutoRefreshPoolOnExhausted = document.getElementById('input-ip-proxy-auto-refresh-pool-on-exhausted');
const rowIpProxyAutoSyncEnabled = document.getElementById('row-ip-proxy-auto-sync-enabled');
const inputIpProxyAutoSyncEnabled = document.getElementById('input-ip-proxy-auto-sync-enabled');
const rowIpProxyAutoSyncInterval = document.getElementById('row-ip-proxy-auto-sync-interval');
const inputIpProxyAutoSyncIntervalMinutes = document.getElementById('input-ip-proxy-auto-sync-interval-minutes');
const rowIpProxyHost = document.getElementById('row-ip-proxy-host');
const inputIpProxyHost = document.getElementById('input-ip-proxy-host');
const rowIpProxyPort = document.getElementById('row-ip-proxy-port');
const inputIpProxyPort = document.getElementById('input-ip-proxy-port');
const rowIpProxyProtocol = document.getElementById('row-ip-proxy-protocol');
const selectIpProxyProtocol = document.getElementById('select-ip-proxy-protocol');
const rowIpProxyUsername = document.getElementById('row-ip-proxy-username');
const inputIpProxyUsername = document.getElementById('input-ip-proxy-username');
const btnToggleIpProxyUsername = document.getElementById('btn-toggle-ip-proxy-username');
const rowIpProxyPassword = document.getElementById('row-ip-proxy-password');
const inputIpProxyPassword = document.getElementById('input-ip-proxy-password');
const btnToggleIpProxyPassword = document.getElementById('btn-toggle-ip-proxy-password');
const rowIpProxyRegion = document.getElementById('row-ip-proxy-region');
const inputIpProxyRegion = document.getElementById('input-ip-proxy-region');
const rowIpProxyActions = document.getElementById('row-ip-proxy-actions');
const ipProxyActionButtons = document.getElementById('ip-proxy-action-buttons');
const ipProxyActionHint = document.getElementById('ip-proxy-action-hint');
const btnIpProxyRefresh = document.getElementById('btn-ip-proxy-refresh');
const btnIpProxyNext = document.getElementById('btn-ip-proxy-next');
const btnIpProxyChange = document.getElementById('btn-ip-proxy-change');
const btnIpProxyProbe = document.getElementById('btn-ip-proxy-probe');
const btnIpProxyCheckIp = document.getElementById('btn-ip-proxy-check-ip');
const ipProxyCurrent = document.getElementById('ip-proxy-current');
const rowIpProxyRuntimeStatus = document.getElementById('row-ip-proxy-runtime-status');
const ipProxyRuntimeStatus = document.getElementById('ip-proxy-runtime-status');
const ipProxyRuntimeDot = document.getElementById('ip-proxy-runtime-dot');
const ipProxyRuntimeText = document.getElementById('ip-proxy-runtime-text');
const ipProxyRuntimeDetails = document.getElementById('ip-proxy-runtime-details');
const ipProxyRuntimeDetailsText = document.getElementById('ip-proxy-runtime-details-text');
const rowIpProxyExitInfo = document.getElementById('row-ip-proxy-exit-info');
const displayIpProxyExitIp = document.getElementById('display-ip-proxy-exit-ip');
const displayIpProxyExitRegion = document.getElementById('display-ip-proxy-exit-region');
const btnIpProxyExitRefresh = document.getElementById('btn-ip-proxy-exit-refresh');
const rowCodex2ApiUrl = document.getElementById('row-codex2api-url');
const inputCodex2ApiUrl = document.getElementById('input-codex2api-url');
const rowCodex2ApiAdminKey = document.getElementById('row-codex2api-admin-key');
const inputCodex2ApiAdminKey = document.getElementById('input-codex2api-admin-key');
const rowKiroRsUrl = document.getElementById('row-kiro-rs-url');
const inputKiroRsUrl = document.getElementById('input-kiro-rs-url');
const btnOpenKiroRsGithub = document.getElementById('btn-open-kiro-rs-github');
const rowKiroRsKey = document.getElementById('row-kiro-rs-key');
const inputKiroRsKey = document.getElementById('input-kiro-rs-key');
const btnTestKiroRs = document.getElementById('btn-test-kiro-rs');
const rowKiroRsTestStatus = document.getElementById('row-kiro-rs-test-status');
const displayKiroRsTestStatus = document.getElementById('display-kiro-rs-test-status');
const rowKiroWebStatus = document.getElementById('row-kiro-web-status');
const displayKiroWebStatus = document.getElementById('display-kiro-web-status');
const rowKiroLoginUrl = document.getElementById('row-kiro-login-url');
const displayKiroLoginUrl = document.getElementById('display-kiro-login-url');
const rowKiroUploadStatus = document.getElementById('row-kiro-upload-status');
const displayKiroUploadStatus = document.getElementById('display-kiro-upload-status');
const rowCustomPassword = document.getElementById('row-custom-password');
const rowPlusMode = document.getElementById('row-plus-mode');
const inputPlusModeEnabled = document.getElementById('input-plus-mode-enabled');
const rowPhonePlusMode = document.getElementById('row-phone-plus-mode');
const inputPhonePlusModeEnabled = document.getElementById('input-phone-plus-mode-enabled');
const rowBrowserFingerprint = document.getElementById('row-browser-fingerprint');
const rowBrowserFingerprintLanguage = document.getElementById('row-browser-fingerprint-language');
const inputBrowserFingerprintEnabled = document.getElementById('input-browser-fingerprint-enabled');
const selectBrowserFingerprintLevel = document.getElementById('select-browser-fingerprint-level');
const selectBrowserFingerprintLanguage = document.getElementById('select-browser-fingerprint-language');
const browserFingerprintCaption = document.getElementById('browser-fingerprint-caption');
const rowPlusPaymentMethod = document.getElementById('row-plus-payment-method');
const selectPlusPaymentMethod = document.getElementById('select-plus-payment-method');
const rowPlusCheckoutVerificationFailureStrategy = document.getElementById('row-plus-verification-failure-strategy');
const selectPlusCheckoutVerificationFailureStrategy = document.getElementById('select-plus-checkout-verification-failure-strategy');
const rowPlusCheckAllowedRegions = document.getElementById('row-plus-check-allowed-regions');
const plusCheckAllowedRegionInputs = Array.from(document.querySelectorAll('[data-plus-check-region]'));
const rowPlusCheckoutCreatePreWait = document.getElementById('row-plus-checkout-create-pre-wait');
const inputPlusCheckoutCreatePreWaitSeconds = document.getElementById('input-plus-checkout-create-pre-wait-seconds');
const rowPlusCheckoutOpenStableWait = document.getElementById('row-plus-checkout-open-stable-wait');
const inputPlusCheckoutOpenStableWaitSeconds = document.getElementById('input-plus-checkout-open-stable-wait-seconds');
const rowPlusHostedCheckoutCardPreWait = document.getElementById('row-plus-hosted-checkout-card-pre-wait');
const inputPlusHostedCheckoutCardPreWaitSeconds = document.getElementById('input-plus-hosted-checkout-card-pre-wait-seconds');
const btnGpcCardKeyPurchase = document.getElementById('btn-gpc-card-key-purchase');
const plusPaymentMethodCaption = document.getElementById('plus-payment-method-caption');
const rowPlusAccountAccessStrategy = document.getElementById('row-plus-account-access-strategy');
const selectPlusAccountAccessStrategy = document.getElementById('select-plus-account-access-strategy');
const plusAccountAccessStrategyCaption = document.getElementById('plus-account-access-strategy-caption');
const rowPayPalAccount = document.getElementById('row-paypal-account');
const selectPayPalAccount = document.getElementById('select-paypal-account');
const payPalAccountPickerRoot = document.getElementById('paypal-account-picker');
const btnPayPalAccountMenu = document.getElementById('btn-paypal-account-menu');
const payPalAccountCurrent = document.getElementById('paypal-account-current');
const payPalAccountMenu = document.getElementById('paypal-account-menu');
const btnAddPayPalAccount = document.getElementById('btn-add-paypal-account');
const rowPayPalProfileCountry = document.getElementById('row-paypal-profile-country');
const selectPayPalProfileCountryCode = document.getElementById('select-paypal-profile-country-code');
const rowPayPalProfileGenerator = document.getElementById('row-paypal-profile-generator');
const payPalProfileGeneratorShell = document.getElementById('paypal-profile-generator-shell');
const btnGeneratePayPalProfile = document.getElementById('btn-generate-paypal-profile');
const btnCopyPayPalProfile = document.getElementById('btn-copy-paypal-profile');
const btnTogglePayPalProfile = document.getElementById('btn-toggle-paypal-profile');
const payPalProfileSummary = document.getElementById('paypal-profile-summary');
const payPalProfileDetails = document.getElementById('paypal-profile-details');
const rowHostedCheckoutVerificationUrl = document.getElementById('row-hosted-checkout-verification-url');
const inputHostedCheckoutVerificationUrl = document.getElementById('input-hosted-checkout-verification-url');
const rowHostedCheckoutManualFetch = document.getElementById('row-hosted-checkout-manual-fetch');
const btnHostedCheckoutManualFetch = document.getElementById('btn-hosted-checkout-manual-fetch');
const displayHostedCheckoutManualCode = document.getElementById('display-hosted-checkout-manual-code');
const rowHostedCheckoutSmsSource = document.getElementById('row-hosted-checkout-sms-source');
const selectHostedCheckoutSmsSource = document.getElementById('select-hosted-checkout-sms-source');
const rowHostedCheckoutSecurityChallenge = document.getElementById('row-hosted-checkout-security-challenge');
const inputHostedCheckoutSecurityChallengeEnabled = document.getElementById('input-hosted-checkout-security-challenge-enabled');
const rowHostedCheckoutVerificationPopupDelay = document.getElementById('row-hosted-checkout-verification-popup-delay');
const inputHostedCheckoutVerificationPopupDelaySeconds = document.getElementById('input-hosted-checkout-verification-popup-delay-seconds');
const rowHostedCheckoutPhone = document.getElementById('row-hosted-checkout-phone');
const inputHostedCheckoutPhone = document.getElementById('input-hosted-checkout-phone');
const rowHostedCheckoutSmsPool = document.getElementById('row-hosted-checkout-sms-pool');
const rowHostedCheckoutResendSettings = document.getElementById('row-hosted-checkout-resend-settings');
const inputHostedCheckoutSmsPoolAutoDisableEnabled = document.getElementById('input-hosted-checkout-sms-pool-auto-disable-enabled');
const inputHostedCheckoutSmsPoolMaxUses = document.getElementById('input-hosted-checkout-sms-pool-max-uses');
const inputHostedCheckoutFirstDirectResendEnabled = document.getElementById('input-hosted-checkout-first-direct-resend-enabled');
const inputHostedCheckoutFirstResendWaitSeconds = document.getElementById('input-hosted-checkout-first-resend-wait-seconds');
const inputHostedCheckoutSubsequentResendWaitSeconds = document.getElementById('input-hosted-checkout-subsequent-resend-wait-seconds');
const inputHostedCheckoutVerificationPollAttempts = document.getElementById('input-hosted-checkout-verification-poll-attempts');
const inputHostedCheckoutVerificationPollIntervalSeconds = document.getElementById('input-hosted-checkout-verification-poll-interval-seconds');
const inputHostedCheckoutVerificationResendMaxAttempts = document.getElementById('input-hosted-checkout-verification-resend-max-attempts');
const btnToggleHostedSmsPool = document.getElementById('btn-toggle-hosted-sms-pool');
const hostedSmsPoolShell = document.getElementById('hosted-sms-pool-shell');
const inputHostedCheckoutSmsPool = document.getElementById('input-hosted-checkout-sms-pool');
const btnHostedSmsPoolRefresh = document.getElementById('btn-hosted-sms-pool-refresh');
const btnHostedSmsPoolExport = document.getElementById('btn-hosted-sms-pool-export');
const btnHostedSmsPoolClearUsed = document.getElementById('btn-hosted-sms-pool-clear-used');
const btnHostedSmsPoolDeleteAll = document.getElementById('btn-hosted-sms-pool-delete-all');
const inputHostedSmsPoolImport = document.getElementById('input-hosted-sms-pool-import');
const btnHostedSmsPoolImportFile = document.getElementById('btn-hosted-sms-pool-import-file');
const inputHostedSmsPoolImportFile = document.getElementById('input-hosted-sms-pool-import-file');
const btnHostedSmsPoolImport = document.getElementById('btn-hosted-sms-pool-import');
const hostedSmsPoolSummary = document.getElementById('hosted-sms-pool-summary');
const inputHostedSmsPoolSearch = document.getElementById('input-hosted-sms-pool-search');
const selectHostedSmsPoolFilter = document.getElementById('select-hosted-sms-pool-filter');
const hostedSmsPoolList = document.getElementById('hosted-sms-pool-list');
const rowChatGptApiSmsPool = document.getElementById('row-chatgpt-api-sms-pool');
const btnToggleChatGptApiSmsPool = document.getElementById('btn-toggle-chatgpt-api-sms-pool');
const chatGptApiSmsPoolShell = document.getElementById('chatgpt-api-sms-pool-shell');
const inputChatGptApiSmsPool = document.getElementById('input-chatgpt-api-sms-pool');
const btnChatGptApiSmsPoolRefresh = document.getElementById('btn-chatgpt-api-sms-pool-refresh');
const btnChatGptApiSmsPoolClearUsed = document.getElementById('btn-chatgpt-api-sms-pool-clear-used');
const btnChatGptApiSmsPoolDeleteAll = document.getElementById('btn-chatgpt-api-sms-pool-delete-all');
const inputChatGptApiSmsPoolImport = document.getElementById('input-chatgpt-api-sms-pool-import');
const btnChatGptApiSmsPoolImport = document.getElementById('btn-chatgpt-api-sms-pool-import');
const inputChatGptApiSmsPoolAutoDisableEnabled = document.getElementById('input-chatgpt-api-sms-pool-auto-disable-enabled');
const chatGptApiSmsPoolSummary = document.getElementById('chatgpt-api-sms-pool-summary');
const inputChatGptApiSmsPoolSearch = document.getElementById('input-chatgpt-api-sms-pool-search');
const selectChatGptApiSmsPoolFilter = document.getElementById('select-chatgpt-api-sms-pool-filter');
const chatGptApiSmsPoolList = document.getElementById('chatgpt-api-sms-pool-list');
const rowPlusHostedCheckoutOauthDelay = document.getElementById('row-plus-hosted-checkout-oauth-delay');
const inputPlusHostedCheckoutOauthDelaySeconds = document.getElementById('input-plus-hosted-checkout-oauth-delay-seconds');
const rowPlusCheckoutConversionProxy = document.getElementById('row-plus-checkout-conversion-proxy');
const selectPlusCheckoutConversionProxySource = document.getElementById('select-plus-checkout-conversion-proxy-source');
const plusCheckoutConversionProxySourceButtons = Array.from(document.querySelectorAll('[data-plus-checkout-conversion-proxy-source]'));
const inputPlusCheckoutConversionProxy = document.getElementById('input-plus-checkout-conversion-proxy');
const plusCheckoutConversionProxy711Shell = document.getElementById('plus-checkout-conversion-proxy-711-shell');
const inputPlusCheckoutConversionProxy711Region = document.getElementById('input-plus-checkout-conversion-proxy-711-region');
const rowPlusCheckoutConversionProxyTest = document.getElementById('row-plus-checkout-conversion-proxy-test');
const btnPlusCheckoutConversionProxyTest = document.getElementById('btn-plus-checkout-conversion-proxy-test');
const inputPlusCheckoutCloudConversionEnabled = document.getElementById('input-plus-checkout-cloud-conversion-enabled');
const rowPlusCheckoutConversionProxyExit = document.getElementById('row-plus-checkout-conversion-proxy-exit');
const displayPlusCheckoutConversionProxyExitCheck = document.getElementById('display-plus-checkout-conversion-proxy-exit-check');
const rowPlusCheckoutRegionalCheckout = document.getElementById('row-plus-checkout-regional-checkout');
const inputPlusCheckoutRegionalCheckoutEnabled = document.getElementById('input-plus-checkout-regional-checkout-enabled');
const rowPlusCheckoutCloudConversionApiUrl = document.getElementById('row-plus-checkout-cloud-conversion-api-url');
const inputPlusCheckoutCloudConversionApiUrl = document.getElementById('input-plus-checkout-cloud-conversion-api-url');
const rowPlusCheckoutCloudConversionApiKey = document.getElementById('row-plus-checkout-cloud-conversion-api-key');
const inputPlusCheckoutCloudConversionApiKey = document.getElementById('input-plus-checkout-cloud-conversion-api-key');
const btnPlusCheckoutConversionProxySwitch = document.getElementById('btn-plus-checkout-conversion-proxy-switch');
const btnPlusCheckoutConversionProxyNext = document.getElementById('btn-plus-checkout-conversion-proxy-next');
const btnPlusCheckoutConversionProxyCancel = document.getElementById('btn-plus-checkout-conversion-proxy-cancel');
const displayPlusCheckoutConversionProxyTestResult = document.getElementById('display-plus-checkout-conversion-proxy-test-result');
const rowPlusCheckoutConversionProxyRuntime = document.getElementById('row-plus-checkout-conversion-proxy-runtime');
const displayPlusCheckoutConversionProxyRuntimeStatus = document.getElementById('display-plus-checkout-conversion-proxy-runtime-status');
const rowGpcHelperApi = document.getElementById('row-gpc-helper-api');
const inputGpcHelperApi = document.getElementById('input-gpc-helper-api');
const btnGpcHelperConvertApiKey = document.getElementById('btn-gpc-helper-convert-api-key');
const rowGpcHelperCardKey = document.getElementById('row-gpc-helper-card-key');
const inputGpcHelperCardKey = document.getElementById('input-gpc-helper-card-key');
const btnToggleGpcHelperCardKey = document.getElementById('btn-toggle-gpc-helper-card-key');
const btnGpcHelperBalance = document.getElementById('btn-gpc-helper-balance');
const displayGpcHelperBalance = document.getElementById('display-gpc-helper-balance');
const rowGpcHelperPhoneMode = document.getElementById('row-gpc-helper-phone-mode');
const selectGpcHelperPhoneMode = document.getElementById('select-gpc-helper-phone-mode');
const rowGpcHelperCountryCode = document.getElementById('row-gpc-helper-country-code');
const selectGpcHelperCountryCode = document.getElementById('select-gpc-helper-country-code');
const rowGpcHelperPhone = document.getElementById('row-gpc-helper-phone');
const inputGpcHelperPhone = document.getElementById('input-gpc-helper-phone');
const rowGpcHelperOtpChannel = document.getElementById('row-gpc-helper-otp-channel');
const selectGpcHelperOtpChannel = document.getElementById('select-gpc-helper-otp-channel');
const rowGpcHelperLocalSmsEnabled = document.getElementById('row-gpc-helper-local-sms-enabled');
const inputGpcHelperLocalSmsEnabled = document.getElementById('input-gpc-helper-local-sms-enabled');
const rowGpcHelperLocalSmsUrl = document.getElementById('row-gpc-helper-local-sms-url');
const inputGpcHelperLocalSmsUrl = document.getElementById('input-gpc-helper-local-sms-url');
const rowGpcHelperPin = document.getElementById('row-gpc-helper-pin');
const inputGpcHelperPin = document.getElementById('input-gpc-helper-pin');
const btnToggleGpcHelperPin = document.getElementById('btn-toggle-gpc-helper-pin');
const rowGoPayCountryCode = document.getElementById('row-gopay-country-code');
const selectGoPayCountryCode = document.getElementById('select-gopay-country-code');
const rowGoPayPhone = document.getElementById('row-gopay-phone');
const inputGoPayPhone = document.getElementById('input-gopay-phone');
const rowGoPayOtp = document.getElementById('row-gopay-otp');
const inputGoPayOtp = document.getElementById('input-gopay-otp');
const rowGoPayPin = document.getElementById('row-gopay-pin');
const inputGoPayPin = document.getElementById('input-gopay-pin');
const selectMailProvider = document.getElementById('select-mail-provider');
const btnMailLogin = document.getElementById('btn-mail-login');
const rowCustomMailProviderPool = document.getElementById('row-custom-mail-provider-pool');
const inputCustomMailProviderPool = document.getElementById('input-custom-mail-provider-pool');
const rowMail2925Mode = document.getElementById('row-mail-2925-mode');
const rowMail2925PoolSettings = document.getElementById('row-mail2925-pool-settings');
const mail2925ModeButtons = Array.from(document.querySelectorAll('[data-mail2925-mode]'));
const rowEmailGenerator = document.getElementById('row-email-generator');
const selectEmailGenerator = document.getElementById('select-email-generator');
const rowCustomEmailPool = document.getElementById('row-custom-email-pool');
const inputCustomEmailPool = document.getElementById('input-custom-email-pool');
const btnCustomEmailPoolRefresh = document.getElementById('btn-custom-email-pool-refresh');
const btnCustomEmailPoolClearUsed = document.getElementById('btn-custom-email-pool-clear-used');
const btnCustomEmailPoolDeleteAll = document.getElementById('btn-custom-email-pool-delete-all');
const inputCustomEmailPoolImport = document.getElementById('input-custom-email-pool-import');
const btnCustomEmailPoolImport = document.getElementById('btn-custom-email-pool-import');
const customEmailPoolSummary = document.getElementById('custom-email-pool-summary');
const inputCustomEmailPoolSearch = document.getElementById('input-custom-email-pool-search');
const selectCustomEmailPoolFilter = document.getElementById('select-custom-email-pool-filter');
const checkboxCustomEmailPoolSelectAll = document.getElementById('checkbox-custom-email-pool-select-all');
const customEmailPoolSelectionSummary = document.getElementById('custom-email-pool-selection-summary');
const btnCustomEmailPoolBulkUsed = document.getElementById('btn-custom-email-pool-bulk-used');
const btnCustomEmailPoolBulkUnused = document.getElementById('btn-custom-email-pool-bulk-unused');
const btnCustomEmailPoolBulkEnable = document.getElementById('btn-custom-email-pool-bulk-enable');
const btnCustomEmailPoolBulkDisable = document.getElementById('btn-custom-email-pool-bulk-disable');
const btnCustomEmailPoolBulkDelete = document.getElementById('btn-custom-email-pool-bulk-delete');
const customEmailPoolList = document.getElementById('custom-email-pool-list');
const rowTempEmailBaseUrl = document.getElementById('row-temp-email-base-url');
const inputTempEmailBaseUrl = document.getElementById('input-temp-email-base-url');
const rowTempEmailAdminAuth = document.getElementById('row-temp-email-admin-auth');
const inputTempEmailAdminAuth = document.getElementById('input-temp-email-admin-auth');
const rowTempEmailCustomAuth = document.getElementById('row-temp-email-custom-auth');
const inputTempEmailCustomAuth = document.getElementById('input-temp-email-custom-auth');
const rowTempEmailLookupMode = document.getElementById('row-temp-email-lookup-mode');
const tempEmailLookupModeButtons = Array.from(document.querySelectorAll('[data-temp-email-lookup-mode]'));
const rowTempEmailReceiveMailbox = document.getElementById('row-temp-email-receive-mailbox');
const inputTempEmailReceiveMailbox = document.getElementById('input-temp-email-receive-mailbox');
const rowTempEmailRandomSubdomainToggle = document.getElementById('row-temp-email-random-subdomain-toggle');
const inputTempEmailUseRandomSubdomain = document.getElementById('input-temp-email-use-random-subdomain');
const rowTempEmailDomain = document.getElementById('row-temp-email-domain');
const selectTempEmailDomain = document.getElementById('select-temp-email-domain');
const tempEmailDomainPickerRoot = document.getElementById('temp-email-domain-picker');
const btnTempEmailDomainMenu = document.getElementById('btn-temp-email-domain-menu');
const tempEmailDomainCurrent = document.getElementById('temp-email-domain-current');
const tempEmailDomainMenu = document.getElementById('temp-email-domain-menu');
const inputTempEmailDomain = document.getElementById('input-temp-email-domain');
const btnTempEmailDomainMode = document.getElementById('btn-temp-email-domain-mode');
const cloudflareTempEmailSection = document.getElementById('cloudflare-temp-email-section');
const btnCloudflareTempEmailUsageGuide = document.getElementById('btn-cloudflare-temp-email-usage-guide');
const btnCloudflareTempEmailGithub = document.getElementById('btn-cloudflare-temp-email-github');
const cloudMailSection = document.getElementById('cloud-mail-section');
const rowCloudMailBaseUrl = document.getElementById('row-cloud-mail-base-url');
const rowCloudMailAdminEmail = document.getElementById('row-cloud-mail-admin-email');
const rowCloudMailAdminPassword = document.getElementById('row-cloud-mail-admin-password');
const rowCloudMailReceiveMailbox = document.getElementById('row-cloud-mail-receive-mailbox');
const rowCloudMailDomain = document.getElementById('row-cloud-mail-domain');
const inputCloudMailBaseUrl = document.getElementById('input-cloud-mail-base-url');
const inputCloudMailAdminEmail = document.getElementById('input-cloud-mail-admin-email');
const inputCloudMailAdminPassword = document.getElementById('input-cloud-mail-admin-password');
const inputCloudMailReceiveMailbox = document.getElementById('input-cloud-mail-receive-mailbox');
const inputCloudMailDomain = document.getElementById('input-cloud-mail-domain');
const yydsMailSection = document.getElementById('yyds-mail-section');
const inputYydsMailApiKey = document.getElementById('input-yyds-mail-api-key');
const inputYydsMailBaseUrl = document.getElementById('input-yyds-mail-base-url');
const hotmailSection = document.getElementById('hotmail-section');
const mail2925Section = document.getElementById('mail2925-section');
const luckmailSection = document.getElementById('luckmail-section');
const icloudSection = document.getElementById('icloud-section');
const icloudSummary = document.getElementById('icloud-summary');
const icloudList = document.getElementById('icloud-list');
const icloudLoginHelp = document.getElementById('icloud-login-help');
const icloudLoginHelpTitle = document.getElementById('icloud-login-help-title');
const icloudLoginHelpText = document.getElementById('icloud-login-help-text');
const btnIcloudLoginDone = document.getElementById('btn-icloud-login-done');
const btnIcloudRefresh = document.getElementById('btn-icloud-refresh');
const btnIcloudDeleteUsed = document.getElementById('btn-icloud-delete-used');
const selectIcloudHostPreference = document.getElementById('select-icloud-host-preference');
const rowIcloudTargetMailboxType = document.getElementById('row-icloud-target-mailbox-type');
const selectIcloudTargetMailboxType = document.getElementById('select-icloud-target-mailbox-type');
const rowIcloudForwardMailProvider = document.getElementById('row-icloud-forward-mail-provider');
const selectIcloudForwardMailProvider = document.getElementById('select-icloud-forward-mail-provider');
const selectIcloudFetchMode = document.getElementById('select-icloud-fetch-mode');
const checkboxAutoDeleteIcloud = document.getElementById('checkbox-auto-delete-icloud');
const inputIcloudSearch = document.getElementById('input-icloud-search');
const selectIcloudFilter = document.getElementById('select-icloud-filter');
const checkboxIcloudSelectAll = document.getElementById('checkbox-icloud-select-all');
const icloudSelectionSummary = document.getElementById('icloud-selection-summary');
const btnIcloudBulkUsed = document.getElementById('btn-icloud-bulk-used');
const btnIcloudBulkUnused = document.getElementById('btn-icloud-bulk-unused');
const btnIcloudBulkPreserve = document.getElementById('btn-icloud-bulk-preserve');
const btnIcloudBulkUnpreserve = document.getElementById('btn-icloud-bulk-unpreserve');
const btnIcloudBulkDelete = document.getElementById('btn-icloud-bulk-delete');
const rowHotmailServiceMode = document.getElementById('row-hotmail-service-mode');
const hotmailServiceModeButtons = Array.from(document.querySelectorAll('[data-hotmail-service-mode]'));
const rowHotmailRemoteBaseUrl = document.getElementById('row-hotmail-remote-base-url');
const inputHotmailRemoteBaseUrl = document.getElementById('input-hotmail-remote-base-url');
const rowHotmailLocalBaseUrl = document.getElementById('row-hotmail-local-base-url');
const inputHotmailLocalBaseUrl = document.getElementById('input-hotmail-local-base-url');
const inputHotmailEmail = document.getElementById('input-hotmail-email');
const inputHotmailClientId = document.getElementById('input-hotmail-client-id');
const inputHotmailPassword = document.getElementById('input-hotmail-password');
const inputHotmailRefreshToken = document.getElementById('input-hotmail-refresh-token');
const inputHotmailImport = document.getElementById('input-hotmail-import');
const inputHotmailSearch = document.getElementById('input-hotmail-search');
const selectHotmailFilter = document.getElementById('select-hotmail-filter');
const btnAddHotmailAccount = document.getElementById('btn-add-hotmail-account');
const btnImportHotmailAccounts = document.getElementById('btn-import-hotmail-accounts');
const btnToggleHotmailForm = document.getElementById('btn-toggle-hotmail-form');
const btnHotmailUsageGuide = document.getElementById('btn-hotmail-usage-guide');
const btnClearUsedHotmailAccounts = document.getElementById('btn-clear-used-hotmail-accounts');
const btnDeleteAllHotmailAccounts = document.getElementById('btn-delete-all-hotmail-accounts');
const btnToggleHotmailList = document.getElementById('btn-toggle-hotmail-list');
const hotmailFormShell = document.getElementById('hotmail-form-shell');
const hotmailListShell = document.getElementById('hotmail-list-shell');
const hotmailAccountsList = document.getElementById('hotmail-accounts-list');
const inputMail2925Email = document.getElementById('input-mail2925-email');
const inputMail2925Password = document.getElementById('input-mail2925-password');
const inputMail2925Import = document.getElementById('input-mail2925-import');
const inputMail2925Search = document.getElementById('input-mail2925-search');
const selectMail2925Filter = document.getElementById('select-mail2925-filter');
const btnAddMail2925Account = document.getElementById('btn-add-mail2925-account');
const btnToggleMail2925Form = document.getElementById('btn-toggle-mail2925-form');
const btnImportMail2925Accounts = document.getElementById('btn-import-mail2925-accounts');
const btnDeleteAllMail2925Accounts = document.getElementById('btn-delete-all-mail2925-accounts');
const btnToggleMail2925List = document.getElementById('btn-toggle-mail2925-list');
const mail2925FormShell = document.getElementById('mail2925-form-shell');
const mail2925ListShell = document.getElementById('mail2925-list-shell');
const mail2925AccountsList = document.getElementById('mail2925-accounts-list');
const inputLuckmailApiKey = document.getElementById('input-luckmail-api-key');
const inputLuckmailBaseUrl = document.getElementById('input-luckmail-base-url');
const selectLuckmailEmailType = document.getElementById('select-luckmail-email-type');
const inputLuckmailDomain = document.getElementById('input-luckmail-domain');
const btnLuckmailRefresh = document.getElementById('btn-luckmail-refresh');
const btnLuckmailDisableUsed = document.getElementById('btn-luckmail-disable-used');
const luckmailSummary = document.getElementById('luckmail-summary');
const inputLuckmailSearch = document.getElementById('input-luckmail-search');
const selectLuckmailFilter = document.getElementById('select-luckmail-filter');
const checkboxLuckmailSelectAll = document.getElementById('checkbox-luckmail-select-all');
const luckmailSelectionSummary = document.getElementById('luckmail-selection-summary');
const btnLuckmailBulkUsed = document.getElementById('btn-luckmail-bulk-used');
const btnLuckmailBulkUnused = document.getElementById('btn-luckmail-bulk-unused');
const btnLuckmailBulkPreserve = document.getElementById('btn-luckmail-bulk-preserve');
const btnLuckmailBulkUnpreserve = document.getElementById('btn-luckmail-bulk-unpreserve');
const btnLuckmailBulkDisable = document.getElementById('btn-luckmail-bulk-disable');
const btnLuckmailBulkEnable = document.getElementById('btn-luckmail-bulk-enable');
const luckmailList = document.getElementById('luckmail-list');
const rowEmailPrefix = document.getElementById('row-email-prefix');
const labelEmailPrefix = document.getElementById('label-email-prefix');
const inputEmailPrefix = document.getElementById('input-email-prefix');
const selectMail2925PoolAccount = document.getElementById('select-mail2925-pool-account');
const inputMail2925UseAccountPool = document.getElementById('input-mail2925-use-account-pool');
const labelMail2925UseAccountPool = document.getElementById('label-mail2925-use-account-pool');
const rowInbucketHost = document.getElementById('row-inbucket-host');
const inputInbucketHost = document.getElementById('input-inbucket-host');
const rowInbucketMailbox = document.getElementById('row-inbucket-mailbox');
const inputInbucketMailbox = document.getElementById('input-inbucket-mailbox');
const rowCfDomain = document.getElementById('row-cf-domain');
const selectCfDomain = document.getElementById('select-cf-domain');
const cfDomainPickerRoot = document.getElementById('cf-domain-picker');
const btnCfDomainMenu = document.getElementById('btn-cf-domain-menu');
const cfDomainCurrent = document.getElementById('cf-domain-current');
const cfDomainMenu = document.getElementById('cf-domain-menu');
const inputCfDomain = document.getElementById('input-cf-domain');
const btnCfDomainMode = document.getElementById('btn-cf-domain-mode');
const inputRunCount = document.getElementById('input-run-count');
const inputAutoSkipFailures = document.getElementById('input-auto-skip-failures');
const inputAutoRunRetryPaypalCallback = document.getElementById('input-auto-run-retry-paypal-callback');
const inputAutoRunPreserveIssueLogsOnRestart = document.getElementById('input-auto-run-preserve-issue-logs-on-restart');
const inputAutoSkipFailuresThreadIntervalMinutes = document.getElementById('input-auto-skip-failures-thread-interval-minutes');
const inputStep6CookieCleanupEnabled = document.getElementById('input-step6-cookie-cleanup-enabled');
const inputAutoDelayEnabled = document.getElementById('input-auto-delay-enabled');
const inputAutoDelayMinutes = document.getElementById('input-auto-delay-minutes');
const inputAutoStepDelaySeconds = document.getElementById('input-auto-step-delay-seconds');
const inputRegistrationStageWaitSeconds = document.getElementById('input-registration-stage-wait-seconds');
const inputSignupIdentityRedirectTimeoutSeconds = document.getElementById('input-signup-identity-redirect-timeout-seconds');
const inputAuthContentScriptRecoveryTimeoutSeconds = document.getElementById('input-auth-content-script-recovery-timeout-seconds');
const inputSignupVerificationReadyTimeoutSeconds = document.getElementById('input-signup-verification-ready-timeout-seconds');
const inputSignupVerificationReadyMaxRounds = document.getElementById('input-signup-verification-ready-max-rounds');
const inputSignupVerificationReadyRoundWaitSeconds = document.getElementById('input-signup-verification-ready-round-wait-seconds');
const inputStep5ProfileSubmitResultMaxRounds = document.getElementById('input-step5-profile-submit-result-max-rounds');
const inputStep5ProfileSubmitResultRoundWaitSeconds = document.getElementById('input-step5-profile-submit-result-round-wait-seconds');
const inputOAuthFlowTimeoutEnabled = document.getElementById('input-oauth-flow-timeout-enabled');
const inputOAuthOpenAfterRefreshWaitSeconds = document.getElementById('input-oauth-open-after-refresh-wait-seconds');
const rowStepExecutionRange = document.getElementById('row-step-execution-range');
const inputStepExecutionRangeEnabled = document.getElementById('input-step-execution-range-enabled');
const inputStepExecutionRangeFrom = document.getElementById('input-step-execution-range-from');
const inputStepExecutionRangeTo = document.getElementById('input-step-execution-range-to');
const inputVerificationResendCount = document.getElementById('input-verification-resend-count');
const rowPhoneVerificationEnabled = document.getElementById('row-phone-verification-enabled');
const btnTogglePhoneVerificationSection = document.getElementById('btn-toggle-phone-verification-section');
const rowPhoneVerificationFold = document.getElementById('row-phone-verification-fold');
const inputPhoneVerificationEnabled = document.getElementById('input-phone-verification-enabled');
const rowSignupMethod = document.getElementById('row-signup-method');
const rowPhoneSignupReloginAfterBindEmail = document.getElementById('row-phone-signup-relogin-after-bind-email');
const inputPhoneSignupReloginAfterBindEmail = document.getElementById('input-phone-signup-relogin-after-bind-email');
const rowPhoneSignupPhonePrefixedEmail = document.getElementById('row-phone-signup-phone-prefixed-email');
const inputPhoneSignupPhonePrefixedEmail = document.getElementById('input-phone-signup-phone-prefixed-email');
const rowSignupPhone = document.getElementById('row-signup-phone');
const signupMethodButtons = Array.from(document.querySelectorAll('[data-signup-method]'));
const selectPhoneSmsProvider = document.getElementById('select-phone-sms-provider');
const rowHeroSmsPlatform = document.getElementById('row-hero-sms-platform');
const rowHeroSmsCountry = document.getElementById('row-hero-sms-country');
const rowHeroSmsCountryFallback = document.getElementById('row-hero-sms-country-fallback');
const rowHeroSmsOperator = document.getElementById('row-hero-sms-operator');
const rowHeroSmsAcquirePriority = document.getElementById('row-hero-sms-acquire-priority');
const rowHeroSmsApiKey = document.getElementById('row-hero-sms-api-key');
const rowHeroSmsMaxPrice = document.getElementById('row-hero-sms-max-price');
const rowPhoneSmsProvider = document.getElementById('row-phone-sms-provider');
const rowPhoneSmsProviderOrder = document.getElementById('row-phone-sms-provider-order');
const rowPhoneSmsProviderOrderActions = document.getElementById('row-phone-sms-provider-order-actions');
const rowFiveSimApiKey = document.getElementById('row-five-sim-api-key');
const rowFiveSimCountry = document.getElementById('row-five-sim-country');
const rowFiveSimCountryFallback = document.getElementById('row-five-sim-country-fallback');
const rowFiveSimOperator = document.getElementById('row-five-sim-operator');
const rowFiveSimProduct = document.getElementById('row-five-sim-product');
const rowNexSmsApiKey = document.getElementById('row-nex-sms-api-key');
const rowNexSmsCountry = document.getElementById('row-nex-sms-country');
const rowNexSmsCountryFallback = document.getElementById('row-nex-sms-country-fallback');
const rowNexSmsServiceCode = document.getElementById('row-nex-sms-service-code');
const rowHeroSmsRuntimePair = document.getElementById('row-hero-sms-runtime-pair');
const rowHeroSmsCurrentNumber = document.getElementById('row-hero-sms-current-number');
const rowHeroSmsCurrentCountdown = document.getElementById('row-hero-sms-current-countdown');
const rowHeroSmsPriceTiers = document.getElementById('row-hero-sms-price-tiers');
const rowHeroSmsCurrentCode = document.getElementById('row-hero-sms-current-code');
const rowHeroSmsPreferredActivation = document.getElementById('row-hero-sms-preferred-activation');
const rowPhoneCodeSettingsGroup = document.getElementById('row-phone-code-settings-group');
const rowPhoneVerificationResendCount = document.getElementById('row-phone-verification-resend-count');
const rowPhoneReplacementLimit = document.getElementById('row-phone-replacement-limit');
const rowPhoneActivationRetryRounds = document.getElementById('row-phone-activation-retry-rounds');
const rowPhoneActivationTierUpgradeLimit = document.getElementById('row-phone-activation-tier-upgrade-limit');
const rowPhoneCodeWaitSeconds = document.getElementById('row-phone-code-wait-seconds');
const rowPhoneCodeTimeoutWindows = document.getElementById('row-phone-code-timeout-windows');
const rowPhoneCodePollIntervalSeconds = document.getElementById('row-phone-code-poll-interval-seconds');
const rowPhoneCodePollMaxRounds = document.getElementById('row-phone-code-poll-max-rounds');
const rowSignupPhoneVerificationSubmitResultMaxRounds = document.getElementById('row-signup-phone-submit-result-max-rounds');
const rowSignupPhoneVerificationSubmitResultRoundWaitSeconds = document.getElementById('row-signup-phone-submit-result-round-wait-seconds');
const rowFreePhoneReuseEnabled = document.getElementById('row-free-phone-reuse-enabled');
const rowFreePhoneReuseAutoEnabled = document.getElementById('row-free-phone-reuse-auto-enabled');
const rowFreeReusablePhone = document.getElementById('row-free-reusable-phone');
const inputHeroSmsApiKey = document.getElementById('input-hero-sms-api-key');
const btnToggleHeroSmsApiKey = document.getElementById('btn-toggle-hero-sms-api-key');
const inputFiveSimApiKey = document.getElementById('input-five-sim-api-key');
const btnToggleFiveSimApiKey = document.getElementById('btn-toggle-five-sim-api-key');
const inputFiveSimOperator = document.getElementById('input-five-sim-operator');
const inputFiveSimProduct = document.getElementById('input-five-sim-product');
const inputNexSmsApiKey = document.getElementById('input-nex-sms-api-key');
const btnToggleNexSmsApiKey = document.getElementById('btn-toggle-nex-sms-api-key');
const inputNexSmsServiceCode = document.getElementById('input-nex-sms-service-code');
const inputHeroSmsMinPrice = document.getElementById('input-hero-sms-min-price');
const inputHeroSmsMaxPrice = document.getElementById('input-hero-sms-max-price');
const inputHeroSmsPreferredPrice = document.getElementById('input-hero-sms-preferred-price');
const inputPhoneReplacementLimit = document.getElementById('input-phone-replacement-limit');
const inputPhoneActivationRetryRounds = document.getElementById('input-phone-activation-retry-rounds');
const inputPhoneActivationTierUpgradeLimit = document.getElementById('input-phone-activation-tier-upgrade-limit');
const inputPhoneCodeWaitSeconds = document.getElementById('input-phone-code-wait-seconds');
const inputPhoneCodeTimeoutWindows = document.getElementById('input-phone-code-timeout-windows');
const inputPhoneCodePollIntervalSeconds = document.getElementById('input-phone-code-poll-interval-seconds');
const inputPhoneCodePollMaxRounds = document.getElementById('input-phone-code-poll-max-rounds');
const inputSignupPhoneVerificationSubmitResultMaxRounds = document.getElementById('input-signup-phone-verification-submit-result-max-rounds');
const inputSignupPhoneVerificationSubmitResultRoundWaitSeconds = document.getElementById('input-signup-phone-verification-submit-result-round-wait-seconds');
const inputHeroSmsReuseEnabled = document.getElementById('input-hero-sms-reuse-enabled');
const inputFreePhoneReuseEnabled = document.getElementById('input-free-phone-reuse-enabled');
const inputFreePhoneReuseAutoEnabled = document.getElementById('input-free-phone-reuse-auto-enabled');
const inputFreeReusablePhone = document.getElementById('input-free-reusable-phone');
const selectHeroSmsCountry = document.getElementById('select-hero-sms-country');
const selectHeroSmsCountryFallback = document.getElementById('select-hero-sms-country-fallback');
const selectHeroSmsAcquirePriority = document.getElementById('select-hero-sms-acquire-priority');
const selectHeroSmsPreferredActivation = document.getElementById('select-hero-sms-preferred-activation');
const selectFiveSimCountry = document.getElementById('select-five-sim-country');
const heroSmsCountryMenuShell = document.getElementById('hero-sms-country-menu-shell');
const btnHeroSmsCountryMenu = document.getElementById('btn-hero-sms-country-menu');
const heroSmsCountryMenu = document.getElementById('hero-sms-country-menu');
const btnHeroSmsCountryClear = document.getElementById('btn-hero-sms-country-clear');
const fiveSimCountryMenuShell = document.getElementById('five-sim-country-menu-shell');
const btnFiveSimCountryMenu = document.getElementById('btn-five-sim-country-menu');
const fiveSimCountryMenu = document.getElementById('five-sim-country-menu');
const btnFiveSimCountryClear = document.getElementById('btn-five-sim-country-clear');
const selectNexSmsCountry = document.getElementById('select-nex-sms-country');
const nexSmsCountryMenuShell = document.getElementById('nex-sms-country-menu-shell');
const btnNexSmsCountryMenu = document.getElementById('btn-nex-sms-country-menu');
const nexSmsCountryMenu = document.getElementById('nex-sms-country-menu');
const btnNexSmsCountryClear = document.getElementById('btn-nex-sms-country-clear');
const selectPhoneSmsProviderOrder = document.getElementById('select-phone-sms-provider-order');
const phoneSmsProviderOrderMenuShell = document.getElementById('phone-sms-provider-order-menu-shell');
const btnPhoneSmsProviderOrderMenu = document.getElementById('btn-phone-sms-provider-order-menu');
const phoneSmsProviderOrderMenu = document.getElementById('phone-sms-provider-order-menu');
const btnPhoneSmsProviderOrderReset = document.getElementById('btn-phone-sms-provider-order-reset');
const btnHeroSmsPricePreview = document.getElementById('btn-hero-sms-price-preview');
const btnPhoneSmsBalance = document.getElementById('btn-phone-sms-balance');
const displayHeroSmsPlatform = document.getElementById('display-hero-sms-platform');
const displayHeroSmsCurrentNumber = document.getElementById('display-hero-sms-current-number');
const displayHeroSmsCurrentCountdown = document.getElementById('display-hero-sms-current-countdown');
const displayHeroSmsPriceTiers = document.getElementById('display-hero-sms-price-tiers');
const displayPhoneSmsBalance = document.getElementById('display-phone-sms-balance');
const displayHeroSmsCurrentCode = document.getElementById('display-hero-sms-current-code');
const displayFreeReusablePhoneCountry = document.getElementById('display-free-reusable-phone-country');
const displayFreeReusablePhone = document.getElementById('display-free-reusable-phone');
const rowFailedSignupPhoneReuse = document.getElementById('row-failed-signup-phone-reuse');
const displayFailedSignupPhoneReuseCountry = document.getElementById('display-failed-signup-phone-reuse-country');
const displayFailedSignupPhoneReuse = document.getElementById('display-failed-signup-phone-reuse');
const displayHeroSmsCountryFallbackOrder = document.getElementById('display-hero-sms-country-fallback-order');
const heroSmsOperatorList = document.getElementById('hero-sms-operator-list');
const displayFiveSimCountryFallbackOrder = document.getElementById('display-five-sim-country-fallback-order');
const displayNexSmsCountryFallbackOrder = document.getElementById('display-nex-sms-country-fallback-order');
const displayPhoneSmsProviderOrder = document.getElementById('display-phone-sms-provider-order');
const btnSaveFreeReusablePhone = document.getElementById('btn-save-free-reusable-phone');
const btnClearFreeReusablePhone = document.getElementById('btn-clear-free-reusable-phone');
const btnClearFailedSignupPhoneReuse = document.getElementById('btn-clear-failed-signup-phone-reuse');
const rowAccountRunHistoryHelperBaseUrl = document.getElementById('row-account-run-history-helper-base-url');
const inputAccountRunHistoryHelperBaseUrl = document.getElementById('input-account-run-history-helper-base-url');
const autoStartModal = document.getElementById('auto-start-modal');
const sharedFormModal = document.getElementById('shared-form-modal');
const sharedFormModalTitle = document.getElementById('shared-form-modal-title');
const btnSharedFormModalClose = document.getElementById('btn-shared-form-modal-close');
const sharedFormModalMessage = document.getElementById('shared-form-modal-message');
const sharedFormModalAlert = document.getElementById('shared-form-modal-alert');
const sharedFormModalFields = document.getElementById('shared-form-modal-fields');
const btnSharedFormModalCancel = document.getElementById('btn-shared-form-modal-cancel');
const btnSharedFormModalConfirm = document.getElementById('btn-shared-form-modal-confirm');
const autoStartTitle = autoStartModal?.querySelector('.modal-title');
const autoStartMessage = document.getElementById('auto-start-message');
const autoStartAlert = document.getElementById('auto-start-alert');
const modalOptionRow = document.getElementById('modal-option-row');
const modalOptionInput = document.getElementById('modal-option-input');
const modalOptionText = document.getElementById('modal-option-text');
const btnAutoStartClose = document.getElementById('btn-auto-start-close');
const btnAutoStartCancel = document.getElementById('btn-auto-start-cancel');
const btnAutoStartRestart = document.getElementById('btn-auto-start-restart');
const btnAutoStartContinue = document.getElementById('btn-auto-start-continue');
const autoHintText = document.querySelector('.auto-hint');
const stepsList = document.querySelector('.steps-list');
const PLUS_PAYMENT_METHOD_PAYPAL = 'paypal';
const PLUS_PAYMENT_METHOD_PAYPAL_HOSTED = 'paypal-hosted';
const PLUS_PAYMENT_METHOD_GOPAY = 'gopay';
const PLUS_PAYMENT_METHOD_GPC_HELPER = 'gpc-helper';
const PLUS_CHECK_ALLOWED_REGION_OPTIONS = Object.freeze(['KZ', 'BR', 'JP', 'NP', 'IQ', 'US']);
const DEFAULT_GPC_HELPER_API_URL = 'https://gpc.qlhazycoder.top';
const GPC_HELPER_PORTAL_URL = 'https://gpc.qlhazycoder.top/';
const GPC_HELPER_PHONE_MODE_AUTO = 'auto';
const GPC_HELPER_PHONE_MODE_MANUAL = 'manual';
const DEFAULT_PLUS_HOSTED_CHECKOUT_OAUTH_DELAY_SECONDS = 3;
const DEFAULT_OAUTH_OPEN_AFTER_REFRESH_WAIT_SECONDS = 5;
const DEFAULT_PLUS_CHECKOUT_CREATE_PRE_WAIT_SECONDS = 10;
const DEFAULT_PLUS_CHECKOUT_OPEN_STABLE_WAIT_SECONDS = 20;
const DEFAULT_PLUS_HOSTED_CHECKOUT_CARD_PRE_WAIT_SECONDS = 10;
const DEFAULT_HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_SECONDS = 20;
const DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES = 3;
const HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL = 'fixed_pool';
const HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS = 'phone_sms';
const DEFAULT_PLUS_PAYMENT_METHOD = PLUS_PAYMENT_METHOD_PAYPAL;
const PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH = 'oauth';
const PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION = 'sub2api_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION = 'cpa_codex_session';
const PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI = 'codex_session';
const DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY = PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
const DEFAULT_PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY = 'continue';
const DEFAULT_BROWSER_FINGERPRINT_LEVEL = 'standard';
const DEFAULT_BROWSER_FINGERPRINT_LANGUAGE = 'zh-CN';
const SIGNUP_METHOD_EMAIL = 'email';
const SIGNUP_METHOD_PHONE = 'phone';
const DEFAULT_SIGNUP_METHOD = SIGNUP_METHOD_EMAIL;
const DEFAULT_ACTIVE_FLOW_ID = 'openai';
const DEFAULT_PHONE_SIGNUP_RELOGIN_AFTER_BIND_EMAIL_ENABLED = false;
const DEFAULT_PHONE_SIGNUP_PHONE_PREFIXED_EMAIL_ENABLED = true;
const PHONE_SIGNUP_REUSE_LOCK_TITLE = '手机号注册流程不使用号码复用，切回邮箱注册后会恢复原设置';
let latestState = null;
let hostedSmsPoolExpanded = false;
let chatGptApiSmsPoolExpanded = false;
let sub2ApiReloginPoolSearchKeyword = '';
let sub2ApiReloginPoolFilter = 'all';
let currentPlusModeEnabled = false;
let currentPhonePlusModeEnabled = false;
let currentPlusPaymentMethod = DEFAULT_PLUS_PAYMENT_METHOD;
let currentPlusAccountAccessStrategy = DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY;
let currentSignupMethod = DEFAULT_SIGNUP_METHOD;
let currentPhoneSignupReloginAfterBindEmailEnabled = DEFAULT_PHONE_SIGNUP_RELOGIN_AFTER_BIND_EMAIL_ENABLED;
let currentStepDefinitionFlowId = DEFAULT_ACTIVE_FLOW_ID;
let currentStepDefinitionSignature = buildStepDefinitionSignature({
  activeFlowId: currentStepDefinitionFlowId,
  openaiIntegrationTargetId: typeof selectPanelMode !== 'undefined' && selectPanelMode ? selectPanelMode.value : '',
  panelMode: typeof selectPanelMode !== 'undefined' && selectPanelMode ? selectPanelMode.value : '',
  plusModeEnabled: currentPlusModeEnabled,
  phonePlusModeEnabled: currentPhonePlusModeEnabled,
  plusPaymentMethod: currentPlusPaymentMethod,
  plusAccountAccessStrategy: currentPlusAccountAccessStrategy,
  signupMethod: currentSignupMethod,
  phoneSignupReloginAfterBindEmailEnabled: currentPhoneSignupReloginAfterBindEmailEnabled,
});
let phoneSignupReuseUiWasLocked = false;
let kiroRsConnectionTestStatusText = '未测试';
let heroSmsCountrySelectionOrder = [];
let phoneSmsProviderOrderSelection = [];
let heroSmsCountryMenuSearchKeyword = '';
const heroSmsCountrySearchTextById = new Map();
const heroSmsOperatorsByCountryId = new Map();
const heroSmsSelectedOperatorByCountryId = new Map();
const phonePreferredActivationOptionMap = new Map();
let phoneRuntimeCountdownTimer = null;
let phoneRuntimeCountdownEndsAt = 0;
let phoneRuntimeCountdownWindowIndex = 0;
let phoneRuntimeCountdownWindowTotal = 0;
let fiveSimCountrySelectionOrder = [];
let fiveSimCountryMenuSearchKeyword = '';
const fiveSimCountrySearchTextByCode = new Map();
let nexSmsCountrySelectionOrder = [];
let nexSmsCountryMenuSearchKeyword = '';
const nexSmsCountrySearchTextById = new Map();
let stepDefinitions = getStepDefinitionsForMode(false, {
  plusPaymentMethod: currentPlusPaymentMethod,
  plusAccountAccessStrategy: currentPlusAccountAccessStrategy,
  signupMethod: currentSignupMethod,
  phoneSignupReloginAfterBindEmailEnabled: currentPhoneSignupReloginAfterBindEmailEnabled,
});
let workflowNodes = getWorkflowNodesForMode(false, {
  plusPaymentMethod: currentPlusPaymentMethod,
  plusAccountAccessStrategy: currentPlusAccountAccessStrategy,
  signupMethod: currentSignupMethod,
  phoneSignupReloginAfterBindEmailEnabled: currentPhoneSignupReloginAfterBindEmailEnabled,
});
let STEP_IDS = stepDefinitions.map((step) => Number(step.id)).filter(Number.isFinite);
let STEP_DEFAULT_STATUSES = Object.fromEntries(STEP_IDS.map((stepId) => [stepId, 'pending']));
let SKIPPABLE_STEPS = new Set(STEP_IDS);
let NODE_IDS = workflowNodes.map((node) => String(node.nodeId || '').trim()).filter(Boolean);
let NODE_DEFAULT_STATUSES = Object.fromEntries(NODE_IDS.map((nodeId) => [nodeId, 'pending']));
let SKIPPABLE_NODES = new Set(NODE_IDS);
const AUTO_DELAY_MIN_MINUTES = 1;
const AUTO_DELAY_MAX_MINUTES = 1440;
const AUTO_DELAY_DEFAULT_MINUTES = 30;
const AUTO_FALLBACK_THREAD_INTERVAL_MIN_MINUTES = 0;
const AUTO_FALLBACK_THREAD_INTERVAL_MAX_MINUTES = 1440;
const AUTO_FALLBACK_THREAD_INTERVAL_DEFAULT_MINUTES = 0;
const AUTO_RUN_MAX_RETRIES_PER_ROUND = 5;
const AUTO_STEP_DELAY_MIN_SECONDS = 0;
const AUTO_STEP_DELAY_MAX_SECONDS = 600;
const DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS = 30;
const SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MIN_SECONDS = 5;
const SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MAX_SECONDS = 300;
const DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS = 45;
const AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MIN_SECONDS = 5;
const AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MAX_SECONDS = 180;
const DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS = 30;
const SIGNUP_VERIFICATION_READY_TIMEOUT_MIN_SECONDS = 5;
const SIGNUP_VERIFICATION_READY_TIMEOUT_MAX_SECONDS = 300;
const DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS = 60;
const SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MIN = 1;
const SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MAX = 20;
const DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS = 5;
const SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MIN = 1;
const SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MAX = 300;
const DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS = 12;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MIN = 1;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MAX = 60;
const DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS = 6;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN = 1;
const SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX = 120;
const DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS = 5;
const STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MIN = 1;
const STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MAX = 60;
const DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS = 12;
const STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN = 1;
const STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX = 120;
const DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS = 10;
const VERIFICATION_RESEND_COUNT_MIN = 0;
const VERIFICATION_RESEND_COUNT_MAX = 20;
const DEFAULT_VERIFICATION_RESEND_COUNT = 4;
const PHONE_REPLACEMENT_LIMIT_MIN = 1;
const PHONE_REPLACEMENT_LIMIT_MAX = 20;
const DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT = 3;
const PHONE_ACTIVATION_RETRY_ROUNDS_MIN = 1;
const PHONE_ACTIVATION_RETRY_ROUNDS_MAX = 10;
const DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS = 2;
const BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_URL = 'https://gujumpgate.zg.fyi/api/checkout';
const BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_KEY = '2KwVxE6f0ABH002JLkoQJ9ReRf4_d01y';
const PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MIN = 0;
const PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MAX = 20;
const DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT = 1;
const PHONE_CODE_WAIT_SECONDS_MIN = 15;
const PHONE_CODE_WAIT_SECONDS_MAX = 300;
const DEFAULT_PHONE_CODE_WAIT_SECONDS = 60;
const PHONE_CODE_TIMEOUT_WINDOWS_MIN = 1;
const PHONE_CODE_TIMEOUT_WINDOWS_MAX = 10;
const DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS = 2;
const PHONE_CODE_POLL_INTERVAL_SECONDS_MIN = 1;
const PHONE_CODE_POLL_INTERVAL_SECONDS_MAX = 30;
const DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS = 5;
const PHONE_CODE_POLL_MAX_ROUNDS_MIN = 1;
const PHONE_CODE_POLL_MAX_ROUNDS_MAX = 120;
const DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS = 4;
const PHONE_SMS_PROVIDER_HERO = 'hero-sms';
const PHONE_SMS_PROVIDER_FIVE_SIM = '5sim';
const PHONE_SMS_PROVIDER_HERO_SMS = PHONE_SMS_PROVIDER_HERO;
const PHONE_SMS_PROVIDER_NEXSMS = 'nexsms';
const PHONE_SMS_PROVIDER_SMSBOWER = 'smsbower';
const PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER = 'sms-verification-number';
const PHONE_SMS_PROVIDER_GRIZZLYSMS = 'grizzlysms';
const PHONE_SMS_PROVIDER_SMSPOOL = 'smspool';
const PHONE_SMS_PROVIDER_CHATGPT_API = 'chatgpt-api';
const DEFAULT_PHONE_SMS_PROVIDER = PHONE_SMS_PROVIDER_HERO;
const DEFAULT_PHONE_SMS_PROVIDER_ORDER = Object.freeze([
  PHONE_SMS_PROVIDER_HERO,
  PHONE_SMS_PROVIDER_FIVE_SIM,
  PHONE_SMS_PROVIDER_NEXSMS,
]);
const PHONE_SMS_PRICE_INPUT_MAX = 0.1;
const DEFAULT_FIVE_SIM_COUNTRY_ORDER = Object.freeze(['thailand']);
const DEFAULT_FIVE_SIM_OPERATOR = 'any';
const DEFAULT_FIVE_SIM_PRODUCT = 'openai';
const DEFAULT_NEX_SMS_COUNTRY_ORDER = Object.freeze([1]);
const DEFAULT_NEX_SMS_SERVICE_CODE = 'ot';
const DEFAULT_SMS_VERIFICATION_NUMBER_BASE_URL = 'https://sms-verification-number.com/stubs/handler_api';
const DEFAULT_SMS_VERIFICATION_NUMBER_SERVICE_CODE = 'dr';
const HERO_SMS_COUNTRY_SELECTION_MAX = 10;
const DEFAULT_HERO_SMS_REUSE_ENABLED = true;
const HERO_SMS_ACQUIRE_PRIORITY_COUNTRY = 'country';
const HERO_SMS_ACQUIRE_PRIORITY_PRICE = 'price';
const HERO_SMS_ACQUIRE_PRIORITY_PRICE_HIGH = 'price_high';
const DEFAULT_HERO_SMS_ACQUIRE_PRIORITY = HERO_SMS_ACQUIRE_PRIORITY_COUNTRY;
const HERO_SMS_SUPPORTED_COUNTRY_ITEMS = Object.freeze([
  { id: 1, chn: '乌克兰', eng: 'Ukraine' },
  { id: 2, chn: '哈萨克斯坦', eng: 'Kazakhstan' },
  { id: 3, chn: '中国', eng: 'China' },
  { id: 4, chn: '菲律宾', eng: 'Philippines' },
  { id: 5, chn: '缅甸', eng: 'Myanmar' },
  { id: 6, chn: '印度尼西亚', eng: 'Indonesia' },
  { id: 7, chn: '马来西亚', eng: 'Malaysia' },
  { id: 8, chn: '肯尼亚', eng: 'Kenya' },
  { id: 9, chn: '坦桑尼亚', eng: 'Tanzania' },
  { id: 10, chn: '越南', eng: 'Vietnam' },
  { id: 11, chn: '吉尔吉斯斯坦', eng: 'Kyrgyzstan' },
  { id: 13, chn: '以色列', eng: 'Israel' },
  { id: 14, chn: '香港', eng: 'Hong Kong' },
  { id: 15, chn: '波兰', eng: 'Poland' },
  { id: 16, chn: '英格兰', eng: 'United Kingdom' },
  { id: 17, chn: '马达加斯加', eng: 'Madagascar' },
  { id: 18, chn: '刚果', eng: 'DR Congo' },
  { id: 19, chn: '尼日利亚', eng: 'Nigeria' },
  { id: 20, chn: '澳门', eng: 'Macao' },
  { id: 21, chn: '埃及', eng: 'Egypt' },
  { id: 22, chn: '印度', eng: 'India' },
  { id: 23, chn: '爱尔兰', eng: 'Ireland' },
  { id: 24, chn: '柬埔寨', eng: 'Cambodia' },
  { id: 25, chn: '老挝', eng: 'Laos' },
  { id: 26, chn: '海地', eng: 'Haiti' },
  { id: 27, chn: '象牙海岸', eng: 'Ivory Coast' },
  { id: 28, chn: '冈比亚', eng: 'Gambia' },
  { id: 29, chn: '塞尔维亚', eng: 'Serbia' },
  { id: 30, chn: '也门', eng: 'Yemen' },
  { id: 31, chn: '南非', eng: 'South Africa' },
  { id: 32, chn: '罗马尼亚', eng: 'Romania' },
  { id: 33, chn: '哥伦比亚', eng: 'Colombia' },
  { id: 34, chn: '爱沙尼亚', eng: 'Estonia' },
  { id: 35, chn: '阿塞拜疆', eng: 'Azerbaijan' },
  { id: 36, chn: '加拿大', eng: 'Canada' },
  { id: 37, chn: '摩洛哥', eng: 'Morocco' },
  { id: 38, chn: '加纳', eng: 'Ghana' },
  { id: 39, chn: '阿根廷', eng: 'Argentina' },
  { id: 40, chn: '乌兹别克斯坦', eng: 'Uzbekistan' },
  { id: 41, chn: '喀麦隆', eng: 'Cameroon' },
  { id: 42, chn: '乍得', eng: 'Chad' },
  { id: 43, chn: '德国', eng: 'Germany' },
  { id: 44, chn: '立陶宛', eng: 'Lithuania' },
  { id: 45, chn: '克罗地亚', eng: 'Croatia' },
  { id: 46, chn: '瑞典', eng: 'Sweden' },
  { id: 47, chn: '伊拉克', eng: 'Iraq' },
  { id: 48, chn: '荷兰', eng: 'Netherlands' },
  { id: 49, chn: '拉脱维亚', eng: 'Latvia' },
  { id: 50, chn: '奥地利', eng: 'Austria' },
  { id: 51, chn: '白俄罗斯', eng: 'Belarus' },
  { id: 52, chn: '泰国', eng: 'Thailand' },
  { id: 53, chn: '沙特阿拉伯', eng: 'Saudi Arabia' },
  { id: 54, chn: '墨西哥', eng: 'Mexico' },
  { id: 55, chn: '台湾', eng: 'Taiwan' },
  { id: 56, chn: '西班牙', eng: 'Spain' },
  { id: 57, chn: '伊朗', eng: 'Iran' },
  { id: 58, chn: '阿尔及利亚', eng: 'Algeria' },
  { id: 59, chn: '斯洛文尼亚', eng: 'Slovenia' },
  { id: 60, chn: '孟加拉国', eng: 'Bangladesh' },
  { id: 61, chn: '塞内加尔', eng: 'Senegal' },
  { id: 62, chn: '土耳其', eng: 'Turkey' },
  { id: 63, chn: '捷克共和国', eng: 'Czech' },
  { id: 64, chn: '斯里兰卡', eng: 'Sri Lanka' },
  { id: 65, chn: '秘鲁', eng: 'Peru' },
  { id: 66, chn: '巴基斯坦', eng: 'Pakistan' },
  { id: 67, chn: '新西兰', eng: 'New Zealand' },
  { id: 68, chn: '几内亚', eng: 'Guinea' },
  { id: 69, chn: '马里', eng: 'Mali' },
  { id: 70, chn: '委内瑞拉', eng: 'Venezuela' },
  { id: 71, chn: '埃塞俄比亚', eng: 'Ethiopia' },
  { id: 72, chn: '蒙古', eng: 'Mongolia' },
  { id: 73, chn: '巴西', eng: 'Brazil' },
  { id: 74, chn: '阿富汗', eng: 'Afghanistan' },
  { id: 75, chn: '乌干达', eng: 'Uganda' },
  { id: 76, chn: '安哥拉', eng: 'Angola' },
  { id: 77, chn: '塞浦路斯', eng: 'Cyprus' },
  { id: 78, chn: '法國', eng: 'France' },
  { id: 79, chn: '巴布亚新几內亚', eng: 'Papua' },
  { id: 80, chn: '莫桑比克', eng: 'Mozambique' },
  { id: 81, chn: '尼泊尔', eng: 'Nepal' },
  { id: 82, chn: '比利時', eng: 'Belgium' },
  { id: 83, chn: '保加利亚', eng: 'Bulgaria' },
  { id: 84, chn: '匈牙利', eng: 'Hungary' },
  { id: 85, chn: '摩尔多瓦', eng: 'Moldova' },
  { id: 86, chn: '義大利', eng: 'Italy' },
  { id: 87, chn: '巴拉圭', eng: 'Paraguay' },
  { id: 88, chn: '洪都拉斯', eng: 'Honduras' },
  { id: 89, chn: '突尼斯', eng: 'Tunisia' },
  { id: 90, chn: '尼加拉瓜', eng: 'Nicaragua' },
  { id: 91, chn: '東帝汶', eng: 'Timor-Leste' },
  { id: 92, chn: '玻利維亞', eng: 'Bolivia' },
  { id: 93, chn: '哥斯達黎加', eng: 'Costa Rica' },
  { id: 94, chn: '危地馬拉', eng: 'Guatemala' },
  { id: 95, chn: '阿拉伯聯合酋長國', eng: 'UAE' },
  { id: 96, chn: '津巴布韋', eng: 'Zimbabwe' },
  { id: 97, chn: '波多黎各', eng: 'Puerto Rico' },
  { id: 98, chn: '蘇丹蘇丹', eng: 'Sudan' },
  { id: 99, chn: '多哥', eng: 'Togo' },
  { id: 100, chn: '科威特', eng: 'Kuwait' },
  { id: 101, chn: '薩爾瓦多', eng: 'Salvador' },
  { id: 102, chn: '利比亚', eng: 'Libya' },
  { id: 103, chn: '牙買加', eng: 'Jamaica' },
  { id: 104, chn: '特立尼達和多巴哥', eng: 'Trinidad and Tobago' },
  { id: 105, chn: '厄瓜多爾', eng: 'Ecuador' },
  { id: 106, chn: '斯威士蘭', eng: 'Swaziland' },
  { id: 107, chn: '阿曼', eng: 'Oman' },
  { id: 108, chn: '波斯尼亞和黑塞哥維那', eng: 'Bosnia' },
  { id: 109, chn: '多明尼加共和國', eng: 'Dominican Republic' },
  { id: 110, chn: '敘利亞', eng: 'Syria' },
  { id: 111, chn: '卡塔爾', eng: 'Qatar' },
  { id: 112, chn: '巴拿馬', eng: 'Panama' },
  { id: 113, chn: '古巴', eng: 'Cuba' },
  { id: 114, chn: '毛里塔尼亚', eng: 'Mauritania' },
  { id: 115, chn: '塞拉利昂', eng: 'Sierra Leone' },
  { id: 116, chn: '約旦', eng: 'Jordan' },
  { id: 117, chn: '葡萄牙', eng: 'Portugal' },
  { id: 118, chn: '巴巴多斯', eng: 'Barbados' },
  { id: 119, chn: '布隆迪', eng: 'Burundi' },
  { id: 120, chn: '貝寧', eng: 'Benin' },
  { id: 121, chn: '文萊', eng: 'Brunei' },
  { id: 122, chn: '巴哈馬', eng: 'Bahamas' },
  { id: 123, chn: '博茨瓦納', eng: 'Botswana' },
  { id: 124, chn: '伯利茲', eng: 'Belize' },
  { id: 125, chn: '中非共和國', eng: 'Central African Republic' },
  { id: 126, chn: '多米尼加', eng: 'Dominica' },
  { id: 127, chn: '格林納達', eng: 'Grenada' },
  { id: 128, chn: '佐治亞州', eng: 'Georgia' },
  { id: 129, chn: '希臘', eng: 'Greece' },
  { id: 130, chn: '幾內亞比紹', eng: 'Guinea-Bissau' },
  { id: 131, chn: '圭亞那', eng: 'Guyana' },
  { id: 132, chn: '冰島', eng: 'Iceland' },
  { id: 133, chn: '科摩羅', eng: 'Comoros' },
  { id: 134, chn: '聖基茨和尼維斯', eng: 'Saint Kitts and Nevis' },
  { id: 135, chn: '利比里亞', eng: 'Liberia' },
  { id: 136, chn: '萊索托', eng: 'Lesotho' },
  { id: 137, chn: '馬拉維', eng: 'Malawi' },
  { id: 138, chn: '納米比亞', eng: 'Namibia' },
  { id: 139, chn: '尼日爾', eng: 'Niger' },
  { id: 140, chn: '盧旺達', eng: 'Rwanda' },
  { id: 141, chn: '斯洛伐克', eng: 'Slovakia' },
  { id: 142, chn: '蘇里南', eng: 'Suriname' },
  { id: 143, chn: '塔吉克斯坦', eng: 'Tajikistan' },
  { id: 144, chn: '摩納哥', eng: 'Monaco' },
  { id: 145, chn: '巴林', eng: 'Bahrain' },
  { id: 146, chn: '團圓', eng: 'Reunion' },
  { id: 147, chn: '贊比亞', eng: 'Zambia' },
  { id: 148, chn: '亞美尼亞', eng: 'Armenia' },
  { id: 149, chn: '索馬里', eng: 'Somalia' },
  { id: 150, chn: '刚果', eng: 'Congo' },
  { id: 151, chn: '智利', eng: 'Chile' },
  { id: 152, chn: '布基纳法索', eng: 'Burkina Faso' },
  { id: 153, chn: '黎巴嫩', eng: 'Lebanon' },
  { id: 154, chn: '加蓬', eng: 'Gabon' },
  { id: 155, chn: '阿爾巴尼亞', eng: 'Albania' },
  { id: 156, chn: '烏拉圭', eng: 'Uruguay' },
  { id: 157, chn: '毛里求斯', eng: 'Mauritius' },
  { id: 158, chn: '丁烷', eng: 'Bhutan' },
  { id: 159, chn: '马尔代夫', eng: 'Maldives' },
  { id: 160, chn: '瓜德罗普岛', eng: 'Guadeloupe' },
  { id: 161, chn: '土库曼斯坦', eng: 'Turkmenistan' },
  { id: 162, chn: '法属圭亚那', eng: 'French Guiana' },
  { id: 163, chn: '芬兰', eng: 'Finland' },
  { id: 164, chn: '圣卢西亚', eng: 'Saint Lucia' },
  { id: 165, chn: '卢森堡', eng: 'Luxembourg' },
  { id: 166, chn: '圣文森特和格林纳丁斯', eng: 'Saint Vincent and the Grenadines' },
  { id: 167, chn: '赤道几内亚', eng: 'Equatorial Guinea' },
  { id: 168, chn: '吉布地', eng: 'Djibouti' },
  { id: 169, chn: '安提瓜和巴布达', eng: 'Antigua and Barbuda' },
  { id: 170, chn: '开曼群岛', eng: 'Cayman Islands' },
  { id: 171, chn: '黑山共和国', eng: 'Montenegro' },
  { id: 172, chn: '丹麥', eng: 'Denmark' },
  { id: 173, chn: '瑞士', eng: 'Switzerland' },
  { id: 174, chn: '挪威', eng: 'Norway' },
  { id: 175, chn: '澳大利亚', eng: 'Australia' },
  { id: 176, chn: '厄立特里亞', eng: 'Eritrea' },
  { id: 177, chn: '南蘇丹', eng: 'South Sudan' },
  { id: 178, chn: '聖多美和普林西比', eng: 'Sao Tome and Principe' },
  { id: 179, chn: '阿魯巴島', eng: 'Aruba' },
  { id: 180, chn: '蒙特塞拉特', eng: 'Montserrat' },
  { id: 181, chn: '安圭拉島', eng: 'Anguilla' },
  { id: 182, chn: '日本', eng: 'Japan' },
  { id: 183, chn: '北馬其頓', eng: 'North Macedonia' },
  { id: 184, chn: '塞舌爾共和國', eng: 'Seychelles' },
  { id: 185, chn: '新喀里多尼亞', eng: 'New Caledonia' },
  { id: 186, chn: '佛得角', eng: 'Cape Verde' },
  { id: 187, chn: '美国（物理)', eng: 'USA' },
  { id: 188, chn: '巴勒斯坦', eng: 'Palestine' },
  { id: 189, chn: '斐濟', eng: 'Fiji' },
  { id: 196, chn: '新加坡共和国', eng: 'Singapore' },
  { id: 198, chn: '萨摩亚', eng: 'Samoa' },
  { id: 199, chn: '马耳他', eng: 'Malta' },
  { id: 201, chn: '直布罗陀', eng: 'Gibraltar' },
  { id: 203, chn: '科索沃', eng: 'Kosovo' },
  { id: 204, chn: '纽埃', eng: 'Niue' },
]);
const HERO_SMS_SUPPORTED_COUNTRY_ID_SET = new Set(HERO_SMS_SUPPORTED_COUNTRY_ITEMS.map((item) => String(item.id)));
const HERO_SMS_FALLBACK_COUNTRY_ITEMS = HERO_SMS_SUPPORTED_COUNTRY_ITEMS;
const FIVE_SIM_COUNTRY_CN_BY_ID = Object.freeze({
  afghanistan: '阿富汗',
  albania: '阿尔巴尼亚',
  algeria: '阿尔及利亚',
  angola: '安哥拉',
  argentina: '阿根廷',
  armenia: '亚美尼亚',
  australia: '澳大利亚',
  austria: '奥地利',
  azerbaijan: '阿塞拜疆',
  bahamas: '巴哈马',
  bahrain: '巴林',
  bangladesh: '孟加拉国',
  belarus: '白俄罗斯',
  belgium: '比利时',
  bolivia: '玻利维亚',
  bosnia: '波黑',
  brazil: '巴西',
  bulgaria: '保加利亚',
  cambodia: '柬埔寨',
  cameroon: '喀麦隆',
  canada: '加拿大',
  chile: '智利',
  china: '中国',
  colombia: '哥伦比亚',
  croatia: '克罗地亚',
  cyprus: '塞浦路斯',
  czech: '捷克',
  denmark: '丹麦',
  egypt: '埃及',
  england: '英国',
  estonia: '爱沙尼亚',
  ethiopia: '埃塞俄比亚',
  finland: '芬兰',
  france: '法国',
  georgia: '格鲁吉亚',
  germany: '德国',
  ghana: '加纳',
  greece: '希腊',
  hongkong: '中国香港',
  hungary: '匈牙利',
  india: '印度',
  indonesia: '印度尼西亚',
  ireland: '爱尔兰',
  israel: '以色列',
  italy: '意大利',
  japan: '日本',
  jordan: '约旦',
  kazakhstan: '哈萨克斯坦',
  kenya: '肯尼亚',
  kyrgyzstan: '吉尔吉斯斯坦',
  laos: '老挝',
  latvia: '拉脱维亚',
  lithuania: '立陶宛',
  malaysia: '马来西亚',
  mexico: '墨西哥',
  moldova: '摩尔多瓦',
  morocco: '摩洛哥',
  myanmar: '缅甸',
  nepal: '尼泊尔',
  netherlands: '荷兰',
  newzealand: '新西兰',
  nigeria: '尼日利亚',
  norway: '挪威',
  pakistan: '巴基斯坦',
  paraguay: '巴拉圭',
  peru: '秘鲁',
  philippines: '菲律宾',
  poland: '波兰',
  portugal: '葡萄牙',
  romania: '罗马尼亚',
  russia: '俄罗斯',
  saudiarabia: '沙特阿拉伯',
  serbia: '塞尔维亚',
  singapore: '新加坡',
  slovakia: '斯洛伐克',
  slovenia: '斯洛文尼亚',
  southafrica: '南非',
  spain: '西班牙',
  srilanka: '斯里兰卡',
  sweden: '瑞典',
  switzerland: '瑞士',
  taiwan: '中国台湾',
  tajikistan: '塔吉克斯坦',
  tanzania: '坦桑尼亚',
  thailand: '泰国',
  turkey: '土耳其',
  ukraine: '乌克兰',
  uruguay: '乌拉圭',
  usa: '美国',
  uzbekistan: '乌兹别克斯坦',
  venezuela: '委内瑞拉',
  vietnam: '越南',
});
const HERO_SMS_COUNTRY_CODE_ALIAS_OVERRIDES = Object.freeze({
  'bahamas': ['BS'],
  'bolivia': ['BO'],
  'czech republic': ['CZ'],
  'democratic republic of the congo': ['CD'],
  'laos': ['LA'],
  'moldova': ['MD'],
  'north korea': ['KP'],
  'south korea': ['KR'],
  'russia': ['RU'],
  'russian federation': ['RU'],
  'syria': ['SY'],
  'taiwan': ['TW'],
  'tanzania': ['TZ'],
  'united kingdom': ['GB', 'UK'],
  'united states': ['US', 'USA'],
  'venezuela': ['VE'],
  'vietnam': ['VN'],
});
const HERO_SMS_COUNTRY_ISO_CODE_BY_NAME = (() => {
  const lookup = new Map();
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    return lookup;
  }
  const displayNames = new Intl.DisplayNames(['en'], { type: 'region' });
  for (let first = 65; first <= 90; first += 1) {
    for (let second = 65; second <= 90; second += 1) {
      const code = String.fromCharCode(first) + String.fromCharCode(second);
      const name = displayNames.of(code);
      const key = normalizeHeroSmsCountryAliasKey(name);
      if (!key || lookup.has(key)) {
        continue;
      }
      lookup.set(key, code);
    }
  }
  return lookup;
})();
const DEFAULT_LOCAL_CPA_STEP9_MODE = 'submit';
const DEFAULT_CPA_CALLBACK_MODE = 'step8';
const MAIL_2925_MODE_PROVIDE = 'provide';
const MAIL_2925_MODE_RECEIVE = 'receive';
const DEFAULT_MAIL_2925_MODE = MAIL_2925_MODE_PROVIDE;
const CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_RECEIVE_MAILBOX = 'receive-mailbox';
const CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL = 'registration-email';
const DEFAULT_CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE = CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_RECEIVE_MAILBOX;
const NEW_USER_GUIDE_PROMPT_DISMISSED_STORAGE_KEY = 'multipage-new-user-guide-prompt-dismissed';
const AUTO_SKIP_FAILURES_PROMPT_DISMISSED_STORAGE_KEY = 'multipage-auto-skip-failures-prompt-dismissed';
const AUTO_RUN_FALLBACK_RISK_PROMPT_DISMISSED_STORAGE_KEY = 'multipage-auto-run-fallback-risk-prompt-dismissed';
const CPA_PHONE_SIGNUP_PROMPT_DISMISSED_STORAGE_KEY = 'multipage-cpa-phone-signup-prompt-dismissed';
const CLOUDFLARE_TEMP_EMAIL_REGISTRATION_LOOKUP_PROMPT_DISMISSED_STORAGE_KEY = 'multipage-cloudflare-temp-email-registration-lookup-prompt-dismissed';
const CPA_PHONE_SIGNUP_WARNING_MESSAGE = '请确保打开手机接码设置中的“绑定后重登”开关，不然可能无法使用（有些版本无需开启）';
const PHONE_VERIFICATION_SECTION_EXPANDED_STORAGE_KEY = 'multipage-phone-verification-section-expanded';
let phoneVerificationSectionExpanded = false;

function readPhoneVerificationSectionExpanded() {
  try {
    return window.localStorage?.getItem(PHONE_VERIFICATION_SECTION_EXPANDED_STORAGE_KEY) === '1';
  } catch (err) {
    return false;
  }
}

function persistPhoneVerificationSectionExpanded(expanded) {
  try {
    if (expanded) {
      window.localStorage?.setItem(PHONE_VERIFICATION_SECTION_EXPANDED_STORAGE_KEY, '1');
    } else {
      window.localStorage?.removeItem(PHONE_VERIFICATION_SECTION_EXPANDED_STORAGE_KEY);
    }
  } catch (err) {
    // Ignore storage errors; the current in-memory state is enough for this session.
  }
}

function setPhoneVerificationSectionExpanded(expanded) {
  phoneVerificationSectionExpanded = Boolean(expanded);
  persistPhoneVerificationSectionExpanded(phoneVerificationSectionExpanded);
  if (typeof updatePhoneVerificationSettingsUI === 'function') {
    updatePhoneVerificationSettingsUI();
  }
}

function togglePhoneVerificationSectionExpanded() {
  setPhoneVerificationSectionExpanded(!phoneVerificationSectionExpanded);
}

function initPhoneVerificationSectionExpandedState() {
  phoneVerificationSectionExpanded = readPhoneVerificationSectionExpanded();
  if (typeof updatePhoneVerificationSettingsUI === 'function') {
    updatePhoneVerificationSettingsUI();
  }
}

function getStepDefinitionsForMode(plusModeEnabled = false, options = {}) {
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : 'paypal';
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined' ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY : 'oauth';
  const previousPhonePlusModeEnabled = typeof currentPhonePlusModeEnabled !== 'undefined'
    ? currentPhonePlusModeEnabled
    : false;
  const phonePlusModeEnabled = typeof options === 'string'
    ? previousPhonePlusModeEnabled
    : Boolean(options.phonePlusModeEnabled ?? previousPhonePlusModeEnabled);
  const normalizedPlusModeEnabled = Boolean(plusModeEnabled) && !phonePlusModeEnabled;
  const rawPaymentMethod = typeof options === 'string'
    ? options
    : (options.plusPaymentMethod || currentPlusPaymentMethod || defaultMethod);
  const rawPlusAccountAccessStrategy = typeof options === 'string'
    ? currentPlusAccountAccessStrategy
    : (options.plusAccountAccessStrategy || currentPlusAccountAccessStrategy || defaultStrategy);
  const rawSignupMethod = typeof options === 'string'
    ? currentSignupMethod
    : (options.signupMethod || currentSignupMethod || DEFAULT_SIGNUP_METHOD);
  const phoneSignupReloginAfterBindEmailEnabled = typeof options === 'string'
    ? currentPhoneSignupReloginAfterBindEmailEnabled
    : Boolean(options.phoneSignupReloginAfterBindEmailEnabled ?? currentPhoneSignupReloginAfterBindEmailEnabled);
  const sub2apiReloginEnabled = typeof options === 'string'
    ? Boolean(typeof latestState !== 'undefined' ? latestState?.sub2apiReloginEnabled : false)
    : Boolean(options.sub2apiReloginEnabled ?? (typeof latestState !== 'undefined' ? latestState?.sub2apiReloginEnabled : false));
  const openaiIntegrationTargetId = typeof options === 'string'
    ? (typeof latestState !== 'undefined' ? latestState?.openaiIntegrationTargetId || latestState?.panelMode : '')
    : (options.openaiIntegrationTargetId || options.panelMode || (typeof latestState !== 'undefined' ? latestState?.openaiIntegrationTargetId || latestState?.panelMode : ''));
  const accountContributionEnabled = typeof options === 'string'
    ? Boolean(typeof latestState !== 'undefined' ? latestState?.accountContributionEnabled : false)
    : Boolean(options.accountContributionEnabled ?? (typeof latestState !== 'undefined' ? latestState?.accountContributionEnabled : false));
  const activeFlowId = typeof options === 'string'
    ? ((typeof latestState !== 'undefined' ? latestState?.activeFlowId : '') || defaultFlowId)
    : (options.activeFlowId || (typeof latestState !== 'undefined' ? latestState?.activeFlowId : '') || defaultFlowId);
  const hasExplicitHostedCheckoutIsFinalStep = typeof options === 'string'
    || Object.prototype.hasOwnProperty.call(options, 'plusHostedCheckoutIsFinalStep')
    || (typeof latestState !== 'undefined'
      && latestState
      && Object.prototype.hasOwnProperty.call(latestState, 'plusHostedCheckoutIsFinalStep'));
  const hostedCheckoutIsFinalStep = typeof options === 'string'
    ? (typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true)
    : (options.plusHostedCheckoutIsFinalStep
      ?? (typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true)
      ?? true);
  const stepDefinitionOptions = {
    activeFlowId: String(activeFlowId || '').trim().toLowerCase() || defaultFlowId,
    plusModeEnabled: normalizedPlusModeEnabled,
    phonePlusModeEnabled,
    plusPaymentMethod: normalizePlusPaymentMethod(rawPaymentMethod),
    plusAccountAccessStrategy: normalizePlusAccountAccessStrategy(rawPlusAccountAccessStrategy),
    signupMethod: normalizeSignupMethod(rawSignupMethod),
    phoneSignupReloginAfterBindEmailEnabled,
    accountContributionEnabled,
  };
  if (hasExplicitHostedCheckoutIsFinalStep) {
    stepDefinitionOptions.plusHostedCheckoutIsFinalStep = hostedCheckoutIsFinalStep;
  }
  if (openaiIntegrationTargetId) {
    stepDefinitionOptions.openaiIntegrationTargetId = openaiIntegrationTargetId;
    stepDefinitionOptions.panelMode = openaiIntegrationTargetId;
  }
  if (sub2apiReloginEnabled) {
    stepDefinitionOptions.sub2apiReloginEnabled = true;
  }
  return (window.MultiPageStepDefinitions?.getSteps?.(stepDefinitionOptions) || [])
    .sort((left, right) => {
      const leftOrder = Number.isFinite(left.order) ? left.order : left.id;
      const rightOrder = Number.isFinite(right.order) ? right.order : right.id;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return left.id - right.id;
    });
}

function getWorkflowNodesForMode(plusModeEnabled = false, options = {}) {
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : 'paypal';
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined' ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY : 'oauth';
  const previousPhonePlusModeEnabled = typeof currentPhonePlusModeEnabled !== 'undefined'
    ? currentPhonePlusModeEnabled
    : false;
  const phonePlusModeEnabled = typeof options === 'string'
    ? previousPhonePlusModeEnabled
    : Boolean(options.phonePlusModeEnabled ?? previousPhonePlusModeEnabled);
  const normalizedPlusModeEnabled = Boolean(plusModeEnabled) && !phonePlusModeEnabled;
  const rawPaymentMethod = typeof options === 'string'
    ? options
    : (options.plusPaymentMethod || currentPlusPaymentMethod || defaultMethod);
  const rawPlusAccountAccessStrategy = typeof options === 'string'
    ? currentPlusAccountAccessStrategy
    : (options.plusAccountAccessStrategy || currentPlusAccountAccessStrategy || defaultStrategy);
  const rawSignupMethod = typeof options === 'string'
    ? currentSignupMethod
    : (options.signupMethod || currentSignupMethod || DEFAULT_SIGNUP_METHOD);
  const phoneSignupReloginAfterBindEmailEnabled = typeof options === 'string'
    ? currentPhoneSignupReloginAfterBindEmailEnabled
    : Boolean(options.phoneSignupReloginAfterBindEmailEnabled ?? currentPhoneSignupReloginAfterBindEmailEnabled);
  const accountContributionEnabled = typeof options === 'string'
    ? Boolean(typeof latestState !== 'undefined' ? latestState?.accountContributionEnabled : false)
    : Boolean(options.accountContributionEnabled ?? (typeof latestState !== 'undefined' ? latestState?.accountContributionEnabled : false));
  const activeFlowId = typeof options === 'string'
    ? ((typeof latestState !== 'undefined' ? latestState?.activeFlowId : '') || defaultFlowId)
    : (options.activeFlowId || (typeof latestState !== 'undefined' ? latestState?.activeFlowId : '') || defaultFlowId);
  const hasExplicitHostedCheckoutIsFinalStep = typeof options === 'string'
    || Object.prototype.hasOwnProperty.call(options, 'plusHostedCheckoutIsFinalStep')
    || (typeof latestState !== 'undefined'
      && latestState
      && Object.prototype.hasOwnProperty.call(latestState, 'plusHostedCheckoutIsFinalStep'));
  const hostedCheckoutIsFinalStep = typeof options === 'string'
    ? (typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true)
    : (options.plusHostedCheckoutIsFinalStep
      ?? (typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true)
      ?? true);
  const workflowNodeOptions = {
    activeFlowId: String(activeFlowId || '').trim().toLowerCase() || defaultFlowId,
    plusModeEnabled: normalizedPlusModeEnabled,
    phonePlusModeEnabled,
    plusPaymentMethod: normalizePlusPaymentMethod(rawPaymentMethod),
    plusAccountAccessStrategy: normalizePlusAccountAccessStrategy(rawPlusAccountAccessStrategy),
    signupMethod: normalizeSignupMethod(rawSignupMethod),
    phoneSignupReloginAfterBindEmailEnabled,
    accountContributionEnabled,
  };
  if (hasExplicitHostedCheckoutIsFinalStep) {
    workflowNodeOptions.plusHostedCheckoutIsFinalStep = hostedCheckoutIsFinalStep;
  }
  const nodes = window.MultiPageStepDefinitions?.getNodes?.(workflowNodeOptions);
  if (Array.isArray(nodes) && nodes.length) {
    return nodes.slice().sort((left, right) => {
      const leftOrder = Number.isFinite(Number(left.displayOrder)) ? Number(left.displayOrder) : 0;
      const rightOrder = Number.isFinite(Number(right.displayOrder)) ? Number(right.displayOrder) : 0;
      if (leftOrder !== rightOrder) return leftOrder - rightOrder;
      return String(left.nodeId || '').localeCompare(String(right.nodeId || ''));
    });
  }

  return getStepDefinitionsForMode(plusModeEnabled, options).map((step) => ({
    nodeId: String(step.key || '').trim(),
    title: step.title,
    displayOrder: Number.isFinite(Number(step.id)) ? Number(step.id) : Number(step.order),
    executeKey: String(step.key || '').trim(),
  })).filter((node) => node.nodeId);
}

function getStepIdByKeyForCurrentMode(stepKey = '') {
  const normalizedKey = String(stepKey || '').trim();
  if (!normalizedKey) {
    return 0;
  }
  const match = (stepDefinitions || []).find((step) => String(step?.key || '') === normalizedKey);
  return Number(match?.id) || 0;
}

function getNodeIdByStepForCurrentMode(step) {
  const numericStep = Number(step);
  const node = (workflowNodes || []).find((candidate) => Number(candidate?.displayOrder) === numericStep);
  if (node?.nodeId) {
    return String(node.nodeId).trim();
  }
  const definition = (stepDefinitions || []).find((candidate) => Number(candidate?.id) === numericStep);
  return String(definition?.key || '').trim();
}

function getStepIdByNodeIdForCurrentMode(nodeId = '') {
  const normalizedNodeId = String(nodeId || '').trim();
  if (!normalizedNodeId) {
    return 0;
  }
  const node = (workflowNodes || []).find((candidate) => String(candidate?.nodeId || '').trim() === normalizedNodeId);
  const displayOrder = Number(node?.displayOrder);
  if (Number.isInteger(displayOrder) && displayOrder > 0) {
    return displayOrder;
  }
  return getStepIdByKeyForCurrentMode(normalizedNodeId);
}

function buildStepDefinitionSignature(options = {}) {
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : 'paypal';
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined' ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY : 'oauth';
  const activeFlowId = String(options.activeFlowId || defaultFlowId).trim().toLowerCase() || defaultFlowId;
  const openaiIntegrationTargetId = String(options.openaiIntegrationTargetId || options.panelMode || '').trim().toLowerCase();
  const signaturePayload = {
    activeFlowId,
    openaiIntegrationTargetId,
    panelMode: openaiIntegrationTargetId,
    plusModeEnabled: Boolean(options.plusModeEnabled),
    phonePlusModeEnabled: Boolean(options.phonePlusModeEnabled),
    plusPaymentMethod: normalizePlusPaymentMethod(options.plusPaymentMethod || defaultMethod),
    plusAccountAccessStrategy: normalizePlusAccountAccessStrategy(options.plusAccountAccessStrategy || defaultStrategy),
    signupMethod: normalizeSignupMethod(options.signupMethod || DEFAULT_SIGNUP_METHOD),
    phoneSignupReloginAfterBindEmailEnabled: Boolean(options.phoneSignupReloginAfterBindEmailEnabled),
    sub2apiReloginEnabled: Boolean(options.sub2apiReloginEnabled),
    accountContributionEnabled: Boolean(options.accountContributionEnabled),
    plusHostedCheckoutIsFinalStep: options.plusHostedCheckoutIsFinalStep !== false,
  };
  return JSON.stringify(signaturePayload);
}

function rebuildStepDefinitionState(plusModeEnabled = false, options = {}) {
  const previousPhonePlusModeEnabled = typeof currentPhonePlusModeEnabled !== 'undefined'
    ? currentPhonePlusModeEnabled
    : false;
  const nextPhonePlusModeEnabled = Boolean(options.phonePlusModeEnabled ?? previousPhonePlusModeEnabled);
  if (typeof currentPhonePlusModeEnabled !== 'undefined') {
    currentPhonePlusModeEnabled = nextPhonePlusModeEnabled;
  }
  currentPlusModeEnabled = Boolean(plusModeEnabled) && !nextPhonePlusModeEnabled;
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : 'paypal';
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined' ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY : 'oauth';
  const rawPaymentMethod = typeof options === 'string'
    ? options
    : (options.plusPaymentMethod || currentPlusPaymentMethod || defaultMethod);
  const rawPlusAccountAccessStrategy = typeof options === 'string'
    ? currentPlusAccountAccessStrategy
    : (options.plusAccountAccessStrategy || currentPlusAccountAccessStrategy || defaultStrategy);
  const rawSignupMethod = typeof options === 'string'
    ? currentSignupMethod
    : (options.signupMethod || currentSignupMethod || DEFAULT_SIGNUP_METHOD);
  const phoneSignupReloginAfterBindEmailEnabled = typeof options === 'string'
    ? currentPhoneSignupReloginAfterBindEmailEnabled
    : Boolean(options.phoneSignupReloginAfterBindEmailEnabled ?? currentPhoneSignupReloginAfterBindEmailEnabled);
  const sub2apiReloginEnabled = typeof options === 'string'
    ? Boolean(typeof latestState !== 'undefined' ? latestState?.sub2apiReloginEnabled : false)
    : Boolean(options.sub2apiReloginEnabled ?? (typeof latestState !== 'undefined' ? latestState?.sub2apiReloginEnabled : false));
  const openaiIntegrationTargetId = typeof options === 'string'
    ? (typeof latestState !== 'undefined' ? latestState?.openaiIntegrationTargetId || latestState?.panelMode : '')
    : (options.openaiIntegrationTargetId || options.panelMode || (typeof latestState !== 'undefined' ? latestState?.openaiIntegrationTargetId || latestState?.panelMode : ''));
  const accountContributionEnabled = Boolean(
    options.accountContributionEnabled
    ?? (typeof latestState !== 'undefined' ? latestState?.accountContributionEnabled : false)
  );
  const hasExplicitHostedCheckoutIsFinalStep = Object.prototype.hasOwnProperty.call(options, 'plusHostedCheckoutIsFinalStep')
    || (typeof latestState !== 'undefined'
      && latestState
      && Object.prototype.hasOwnProperty.call(latestState, 'plusHostedCheckoutIsFinalStep'));
  const hostedCheckoutIsFinalStep = options.plusHostedCheckoutIsFinalStep
    ?? (typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true)
    ?? true;
  currentPlusPaymentMethod = normalizePlusPaymentMethod(rawPaymentMethod);
  currentPlusAccountAccessStrategy = normalizePlusAccountAccessStrategy(rawPlusAccountAccessStrategy);
  currentSignupMethod = normalizeSignupMethod(rawSignupMethod);
  currentPhoneSignupReloginAfterBindEmailEnabled = phoneSignupReloginAfterBindEmailEnabled;
  const nextActiveFlowId = String(
    options?.activeFlowId
    || (typeof latestState !== 'undefined' ? latestState?.activeFlowId : '')
    || defaultFlowId
  ).trim().toLowerCase() || defaultFlowId;
  if (typeof currentStepDefinitionFlowId !== 'undefined') {
    currentStepDefinitionFlowId = nextActiveFlowId;
  }
  stepDefinitions = getStepDefinitionsForMode(currentPlusModeEnabled, {
    activeFlowId: nextActiveFlowId,
    phonePlusModeEnabled: nextPhonePlusModeEnabled,
    plusPaymentMethod: currentPlusPaymentMethod,
    plusAccountAccessStrategy: currentPlusAccountAccessStrategy,
    openaiIntegrationTargetId,
    panelMode: openaiIntegrationTargetId,
    sub2apiReloginEnabled,
    signupMethod: currentSignupMethod,
    phoneSignupReloginAfterBindEmailEnabled: currentPhoneSignupReloginAfterBindEmailEnabled,
    accountContributionEnabled,
    ...(hasExplicitHostedCheckoutIsFinalStep ? { plusHostedCheckoutIsFinalStep: hostedCheckoutIsFinalStep } : {}),
  });
  const nextWorkflowNodes = typeof getWorkflowNodesForMode === 'function'
    ? getWorkflowNodesForMode(currentPlusModeEnabled, {
      activeFlowId: nextActiveFlowId,
      phonePlusModeEnabled: nextPhonePlusModeEnabled,
      plusPaymentMethod: currentPlusPaymentMethod,
      plusAccountAccessStrategy: currentPlusAccountAccessStrategy,
      openaiIntegrationTargetId,
      panelMode: openaiIntegrationTargetId,
      sub2apiReloginEnabled,
      signupMethod: currentSignupMethod,
      phoneSignupReloginAfterBindEmailEnabled: currentPhoneSignupReloginAfterBindEmailEnabled,
      accountContributionEnabled,
      ...(hasExplicitHostedCheckoutIsFinalStep ? { plusHostedCheckoutIsFinalStep: hostedCheckoutIsFinalStep } : {}),
    })
    : stepDefinitions.map((step) => ({
      nodeId: String(step.key || step.id || '').trim(),
      title: step.title,
      displayOrder: Number.isFinite(Number(step.id)) ? Number(step.id) : Number(step.order),
    }));
  if (typeof workflowNodes !== 'undefined') {
    workflowNodes = nextWorkflowNodes;
  }
  STEP_IDS = stepDefinitions.map((step) => Number(step.id)).filter(Number.isFinite);
  STEP_DEFAULT_STATUSES = Object.fromEntries(STEP_IDS.map((stepId) => [stepId, 'pending']));
  SKIPPABLE_STEPS = new Set(STEP_IDS);
  if (typeof NODE_IDS !== 'undefined') {
    NODE_IDS = nextWorkflowNodes.map((node) => String(node.nodeId || '').trim()).filter(Boolean);
  }
  if (typeof NODE_DEFAULT_STATUSES !== 'undefined') {
    NODE_DEFAULT_STATUSES = Object.fromEntries((typeof NODE_IDS !== 'undefined' ? NODE_IDS : []).map((nodeId) => [nodeId, 'pending']));
  }
  if (typeof SKIPPABLE_NODES !== 'undefined') {
    SKIPPABLE_NODES = new Set(typeof NODE_IDS !== 'undefined' ? NODE_IDS : []);
  }
}
const CONTRIBUTION_CONTENT_PROMPT_DISMISSED_VERSION_STORAGE_KEY = 'multipage-contribution-content-prompt-dismissed-version';
const AUTO_RUN_FALLBACK_RISK_WARNING_MIN_RUNS = 3;
const HOTMAIL_SERVICE_MODE_REMOTE = 'remote';
const HOTMAIL_SERVICE_MODE_LOCAL = 'local';
const ICLOUD_PROVIDER = 'icloud';
const GMAIL_PROVIDER = 'gmail';
const GMAIL_ALIAS_GENERATOR = 'gmail-alias';
const LUCKMAIL_PROVIDER = 'luckmail-api';
const YYDS_MAIL_PROVIDER = 'yyds-mail';
const CUSTOM_EMAIL_POOL_GENERATOR = 'custom-pool';
const DEFAULT_LUCKMAIL_BASE_URL = 'https://mails.luckyous.com';
const DEFAULT_LUCKMAIL_EMAIL_TYPE = 'ms_graph';
const DEFAULT_YYDS_MAIL_BASE_URL = window.YydsMailUtils?.DEFAULT_YYDS_MAIL_BASE_URL || 'https://maliapi.215.im/v1';
const DISPLAY_TIMEZONE = 'Asia/Shanghai';
const DEFAULT_ACCOUNT_RUN_HISTORY_HELPER_BASE_URL = 'http://127.0.0.1:17373';
const CONTRIBUTION_UPLOAD_URL = 'https://flowpilot.qlhazycoder.top/';
const DEFAULT_PHONE_VERIFICATION_ENABLED = false;
const DEFAULT_HERO_SMS_COUNTRY_ID = 52;
const DEFAULT_HERO_SMS_COUNTRY_LABEL = 'Thailand';
const DEFAULT_FIVE_SIM_COUNTRY_ID = 'vietnam';
const DEFAULT_FIVE_SIM_COUNTRY_LABEL = '越南 (Vietnam)';
const FIVE_SIM_SUPPORTED_COUNTRY_ITEMS = Object.freeze([
  { id: 'indonesia', chn: '印度尼西亚', eng: 'Indonesia', searchText: 'indonesia 印度尼西亚 印尼 Indonesia ID +62' },
  { id: 'thailand', chn: '泰国', eng: 'Thailand', searchText: 'thailand 泰国 Thailand TH +66' },
  { id: 'england', chn: '英国', eng: 'England', searchText: 'england 英国 England UK GB United Kingdom +44' },
  { id: 'usa', chn: '美国', eng: 'United States', searchText: 'usa 美国 United States US +1' },
  { id: 'japan', chn: '日本', eng: 'Japan', searchText: 'japan 日本 Japan JP +81' },
  { id: 'germany', chn: '德国', eng: 'Germany', searchText: 'germany 德国 Germany DE +49' },
  { id: 'vietnam', chn: '越南', eng: 'Vietnam', searchText: 'vietnam 越南 Vietnam VN +84' },
]);
const FIVE_SIM_SUPPORTED_COUNTRY_ID_SET = new Set(FIVE_SIM_SUPPORTED_COUNTRY_ITEMS.map((item) => item.id));
const NEX_SMS_FALLBACK_COUNTRY_ITEMS = Object.freeze([
  { id: 1, label: 'Ukraine (#1)', searchText: 'Ukraine 1 UA' },
  { id: 6, label: 'Indonesia (#6)', searchText: 'Indonesia 6 ID' },
  { id: 7, label: 'Malaysia (#7)', searchText: 'Malaysia 7 MY' },
]);
const DEFAULT_IP_PROXY_SERVICE = '711proxy';
const SUPPORTED_IP_PROXY_SERVICES = ['711proxy', 'lumiproxy', 'iproyal', 'omegaproxy'];
const IP_PROXY_ENABLED_SERVICES = ['711proxy'];
const DEFAULT_IP_PROXY_MODE = 'account';
const SUPPORTED_IP_PROXY_MODES = ['api', 'account'];
const DEFAULT_IP_PROXY_PROTOCOL = 'http';
const SUPPORTED_IP_PROXY_PROTOCOLS = ['http', 'https', 'socks4', 'socks5'];
const DEFAULT_IP_PROXY_API_ROUTE_MODE = 'direct';
const SUPPORTED_IP_PROXY_API_ROUTE_MODES = ['direct', 'local_proxy', 'provider_proxy'];
const IP_PROXY_API_MODE_ENABLED = true;
const IP_PROXY_ACCOUNT_LIST_ENABLED = false;

function getManagedAliasUtils() {
  return window.MultiPageManagedAliasUtils || null;
}

function isManagedAliasProvider(provider = selectMailProvider.value, mail2925Mode = getSelectedMail2925Mode()) {
  const utils = getManagedAliasUtils();
  if (utils?.usesManagedAliasGeneration) {
    return utils.usesManagedAliasGeneration(provider, { mail2925Mode });
  }
  if (utils?.isManagedAliasProvider) {
    const normalizedProvider = String(provider || '').trim().toLowerCase();
    if (normalizedProvider === '2925') {
      return utils.isManagedAliasProvider(provider)
        && normalizeMail2925Mode(mail2925Mode) === MAIL_2925_MODE_PROVIDE;
    }
    return utils.isManagedAliasProvider(provider);
  }
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  if (normalizedProvider === '2925') {
    return normalizeMail2925Mode(mail2925Mode) === MAIL_2925_MODE_PROVIDE;
  }
  return normalizedProvider === GMAIL_PROVIDER;
}

function parseManagedAliasBaseEmail(rawValue, provider = selectMailProvider.value) {
  const utils = getManagedAliasUtils();
  if (utils?.parseManagedAliasBaseEmail) {
    return utils.parseManagedAliasBaseEmail(rawValue, provider);
  }
  return null;
}

function isManagedAliasEmail(value, baseEmail = '', provider = selectMailProvider.value) {
  const utils = getManagedAliasUtils();
  if (utils?.isManagedAliasEmail) {
    return utils.isManagedAliasEmail(value, provider, baseEmail);
  }
  return false;
}

function getManagedAliasProviderUiCopy(provider = selectMailProvider.value, mail2925Mode = getSelectedMail2925Mode()) {
  if (!isManagedAliasProvider(provider, mail2925Mode)) {
    return null;
  }
  const utils = getManagedAliasUtils();
  if (utils?.getManagedAliasProviderUiCopy) {
    return utils.getManagedAliasProviderUiCopy(provider);
  }
  if (String(provider || '').trim().toLowerCase() === GMAIL_PROVIDER) {
    return {
      baseLabel: '基邮箱',
      basePlaceholder: '例如 yourname@gmail.com',
      buttonLabel: '生成',
      successVerb: '生成',
      label: 'Gmail +tag 邮箱',
      placeholder: '点击生成 Gmail +tag 邮箱，或手动填写完整邮箱',
      hint: '先填写基邮箱后点“生成”，也可以直接手动填写完整的 Gmail 邮箱。',
    };
  }
  if (String(provider || '').trim().toLowerCase() === '2925') {
    return {
      baseLabel: '基邮箱',
      basePlaceholder: '例如 yourname@2925.com',
      buttonLabel: '生成',
      successVerb: '生成',
      label: '2925 邮箱',
      placeholder: '点击生成 2925 邮箱，或手动填写完整邮箱',
      hint: '先填写基邮箱后点“生成”，也可以直接手动填写完整的 2925 邮箱。',
    };
  }
  return null;
}

function getManagedAliasBaseEmailKey(provider = selectMailProvider.value) {
  const normalizedProvider = String(provider || '').trim().toLowerCase();
  if (normalizedProvider === GMAIL_PROVIDER) {
    return 'gmailBaseEmail';
  }
  if (normalizedProvider === '2925') {
    return 'mail2925BaseEmail';
  }
  return '';
}

function isMail2925AccountPoolEnabled(state = latestState) {
  return Boolean(state?.mail2925UseAccountPool);
}

function getPreferredMail2925PoolAccountId(state = latestState) {
  const currentId = String(state?.currentMail2925AccountId || '').trim();
  if (currentId && getMail2925Accounts(state).some((account) => account.id === currentId)) {
    return currentId;
  }
  return '';
}

function syncMail2925PoolAccountOptions(state = latestState) {
  if (!selectMail2925PoolAccount) {
    return;
  }

  const accounts = getMail2925Accounts(state);
  const selectedId = getPreferredMail2925PoolAccountId(state);
  const options = ['<option value="">请选择号池邮箱</option>'].concat(
    accounts.map((account) => `<option value="${escapeHtml(account.id)}">${escapeHtml(account.email || '(未命名账号)')}</option>`)
  );
  selectMail2925PoolAccount.innerHTML = options.join('');
  selectMail2925PoolAccount.value = selectedId;
}

async function syncSelectedMail2925PoolAccount(options = {}) {
  const { silent = false } = options;
  if (!selectMail2925PoolAccount || !isMail2925AccountPoolEnabled(latestState)) {
    return null;
  }

  const accountId = String(selectMail2925PoolAccount.value || '').trim();
  if (!accountId) {
    syncLatestState({ currentMail2925AccountId: null });
    setManagedAliasBaseEmailInputForProvider('2925', latestState);
    return null;
  }

  const response = await chrome.runtime.sendMessage({
    type: 'SELECT_MAIL2925_ACCOUNT',
    source: 'sidepanel',
    payload: { accountId },
  });
  if (response?.error) {
    throw new Error(response.error);
  }

  syncLatestState({
    currentMail2925AccountId: response.account?.id || accountId,
    ...(response.account?.email ? { mail2925BaseEmail: String(response.account.email).trim() } : {}),
  });
  setManagedAliasBaseEmailInputForProvider('2925', latestState);
  if (!silent) {
    showToast(`已切换当前 2925 号池邮箱为 ${response.account?.email || accountId}`, 'success', 1800);
  }
  return response.account || null;
}

function getManagedAliasBaseEmailForProvider(provider = selectMailProvider.value, state = latestState) {
  if (String(provider || '').trim().toLowerCase() === '2925' && isMail2925AccountPoolEnabled(state)) {
    const currentMail2925Email = getCurrentMail2925Email(state);
    if (currentMail2925Email) {
      return currentMail2925Email;
    }
  }

  const key = getManagedAliasBaseEmailKey(provider);
  if (!key) {
    return '';
  }

  const providerValue = String(state?.[key] || '').trim();
  if (providerValue) {
    return providerValue;
  }

  const legacyEmailPrefix = String(state?.emailPrefix || '').trim();
  return parseManagedAliasBaseEmail(legacyEmailPrefix, provider) ? legacyEmailPrefix : '';
}

function buildManagedAliasBaseEmailPayload(state = latestState) {
  const payload = {
    gmailBaseEmail: String(state?.gmailBaseEmail || '').trim(),
    mail2925BaseEmail: String(state?.mail2925BaseEmail || '').trim(),
    mail2925UseAccountPool: Boolean(state?.mail2925UseAccountPool),
    emailPrefix: '',
  };
  const key = getManagedAliasBaseEmailKey();
  if (key) {
    if (key === 'mail2925BaseEmail' && isMail2925AccountPoolEnabled(state)) {
      payload[key] = String(state?.mail2925BaseEmail || '').trim();
    } else {
      payload[key] = inputEmailPrefix.value.trim();
    }
  }
  return payload;
}

function syncManagedAliasBaseEmailDraftFromInput(provider = selectMailProvider.value) {
  const key = getManagedAliasBaseEmailKey(provider);
  if (!key) {
    return;
  }
  if (key === 'mail2925BaseEmail' && isMail2925AccountPoolEnabled(latestState)) {
    return;
  }
  syncLatestState({ [key]: inputEmailPrefix.value.trim() });
}

function setManagedAliasBaseEmailInputForProvider(provider = selectMailProvider.value, state = latestState) {
  syncMail2925PoolAccountOptions(state);
  inputEmailPrefix.value = getManagedAliasBaseEmailForProvider(provider, state);
}

function getCurrentRegistrationEmailUiCopy() {
  if (isCustomMailProvider()) {
    return getCustomMailProviderUiCopy();
  }
  const useYydsMail = typeof isYydsMailProvider === 'function'
    ? isYydsMailProvider()
    : String(selectMailProvider.value || '').trim().toLowerCase() === 'yyds-mail';
  if (useYydsMail) {
    return {
      buttonLabel: '获取',
      placeholder: '点击获取 YYDS Mail 邮箱，或手动粘贴邮箱',
      successVerb: '获取',
      label: 'YYDS Mail',
    };
  }
  if (usesGeneratedAliasMailProvider()) {
    return getManagedAliasProviderUiCopy();
  }
  return getEmailGeneratorUiCopy();
}

function isCurrentRegistrationEmailCompatible(email = inputEmail.value.trim(), provider = selectMailProvider.value, state = latestState) {
  if (!usesGeneratedAliasMailProvider(provider, getSelectedMail2925Mode()) || !email) {
    return true;
  }
  const baseEmail = getManagedAliasBaseEmailForProvider(provider, state);
  return isManagedAliasEmail(email, baseEmail, provider);
}

function validateCurrentRegistrationEmail(email = inputEmail.value.trim(), options = {}) {
  const { showToastOnFailure = false } = options;
  if (isCurrentRegistrationEmailCompatible(email)) {
    return true;
  }

  if (showToastOnFailure) {
    const uiCopy = getManagedAliasProviderUiCopy();
    const baseEmail = getManagedAliasBaseEmailForProvider();
    showToast(
      baseEmail
        ? `当前邮箱服务为“${uiCopy?.label || '别名邮箱'}”，注册邮箱需与 ${uiCopy?.baseLabel || '基邮箱'} 对应。`
        : `当前邮箱服务为“${uiCopy?.label || '别名邮箱'}”，请直接填写完整邮箱，或先填写基邮箱后点击“生成”。`,
      'warn'
    );
  }
  return false;
}

let currentAutoRun = {
  autoRunning: false,
  phase: 'idle',
  currentRun: 0,
  totalRuns: 1,
  attemptRun: 0,
  scheduledAt: null,
  countdownAt: null,
  countdownTitle: '',
  countdownNote: '',
};
let pendingAutoRunStartTotalRuns = 0;
let pendingAutoRunStartExpiresAt = 0;
let settingsDirty = false;
let settingsSaveInFlight = false;
let settingsAutoSaveTimer = null;
let settingsSaveRevision = 0;
let signupPhoneInputDirty = false;
let signupPhoneInputFocused = false;
let signupPhoneInputPersistPromise = null;
let cloudflareDomainEditMode = false;
let cloudflareTempEmailDomainEditMode = false;
let modalChoiceResolver = null;
let currentModalActions = [];
let modalResultBuilder = null;
let activePlusManualConfirmationRequestId = '';
let plusManualConfirmationDialogInFlight = false;
let scheduledCountdownTimer = null;
let configMenuOpen = false;
let configActionInFlight = false;
let currentReleaseSnapshot = null;
let currentContributionContentSnapshot = null;
let contributionContentSnapshotRequestInFlight = null;
let autoRunAdScrollSyncFrame = 0;

function normalizeAutomationWindowId(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric >= 0 ? numeric : null;
}

async function getCurrentSidepanelWindowId() {
  if (chrome?.windows?.getCurrent) {
    try {
      const currentWindow = await chrome.windows.getCurrent();
      const windowId = normalizeAutomationWindowId(currentWindow?.id);
      if (windowId !== null) {
        return windowId;
      }
    } catch (error) {
      console.warn('Failed to get current sidepanel window:', error?.message || error);
    }
  }

  return normalizeAutomationWindowId(latestState?.automationWindowId);
}

function shouldAttachAutomationWindow(message = {}) {
  const source = String(message?.source || '').trim();
  if (source && source !== 'sidepanel') {
    return false;
  }
  return [
    'EXECUTE_NODE',
    'AUTO_RUN',
    'SCHEDULE_AUTO_RUN',
    'RESUME_AUTO_RUN',
    'START_SCHEDULED_AUTO_RUN_NOW',
    'SKIP_AUTO_RUN_COUNTDOWN',
    'PROBE_IP_PROXY_EXIT',
  ].includes(String(message?.type || '').trim());
}

async function sendSidepanelMessage(message = {}) {
  const payload = {
    ...(message || {}),
    source: message?.source || 'sidepanel',
  };
  if (shouldAttachAutomationWindow(payload)) {
    const windowId = await getCurrentSidepanelWindowId();
    if (windowId !== null) {
      payload.payload = {
        ...(payload.payload || {}),
        automationWindowId: windowId,
      };
      syncLatestState({ automationWindowId: windowId });
    }
  }
  return chrome.runtime.sendMessage(payload);
}

window.sendSidepanelMessage = sendSidepanelMessage;

async function sendRuntimeMessageWithTimeout(message = {}, timeoutMs = 30000, label = '后台消息') {
  let timeoutId = null;
  const effectiveTimeoutMs = Math.max(1000, Number(timeoutMs) || 30000);
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`${label}超时（>${Math.round(effectiveTimeoutMs / 1000)} 秒）`));
    }, effectiveTimeoutMs);
  });
  try {
    return await Promise.race([
      chrome.runtime.sendMessage(message),
      timeoutPromise,
    ]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

const DEFAULT_SUB2API_GROUP_OPTIONS = ['codex', 'openai-plus'];
const editableListPickerModule = window.SidepanelEditableListPicker || {};
const normalizeEditableListValues = editableListPickerModule.normalizeEditableListValues
  || ((...sources) => {
    const values = [];
    const seen = new Set();
    const append = (value) => {
      const items = Array.isArray(value)
        ? value
        : String(value || '').split(/[\r\n,，、]+/);
      items.forEach((item) => {
        const normalized = String(item || '').trim();
        const key = normalized.toLowerCase();
        if (key && !seen.has(key)) {
          seen.add(key);
          values.push(normalized);
        }
      });
    };
    sources.forEach(append);
    return values;
  });
const createEditableListPicker = editableListPickerModule.createEditableListPicker
  || (() => ({
    close() { },
    render() { },
    setOpen() { },
    setSelection() { },
    setVisible() { },
  }));
const closeEditableListPickers = editableListPickerModule.closeEditableListPickers || (() => { });
const isClickInsideEditableListPicker = editableListPickerModule.isClickInsideEditableListPicker || (() => false);

function normalizeSub2ApiGroupOptions(...sources) {
  return normalizeEditableListValues(...sources);
}

function normalizeSub2ApiAccountPriorityValue(value) {
  const rawValue = String(value ?? '').trim();
  const numeric = Number(rawValue);
  if (!rawValue || !Number.isSafeInteger(numeric) || numeric < 1) {
    return 1;
  }
  return numeric;
}

function getSelectedSub2ApiGroupName() {
  return String(inputSub2ApiGroup?.value || '').trim()
    || DEFAULT_SUB2API_GROUP_OPTIONS[0];
}

function getSub2ApiGroupOptionsState(state = latestState) {
  const options = normalizeSub2ApiGroupOptions(
    state?.sub2apiGroupNames,
    state?.sub2apiGroupName
  );
  return options.length ? options : [...DEFAULT_SUB2API_GROUP_OPTIONS];
}

const sub2ApiGroupPicker = createEditableListPicker({
  root: sub2ApiGroupPickerRoot,
  input: inputSub2ApiGroup,
  trigger: btnSub2ApiGroupMenu,
  current: sub2ApiGroupCurrent,
  menu: sub2ApiGroupMenu,
  fallbackItems: DEFAULT_SUB2API_GROUP_OPTIONS,
  minItems: 1,
  itemLabel: '分组',
  onDelete: handleDeleteSub2ApiGroup,
  onDeleteError: (error) => showToast(error?.message || '删除 SUB2API 分组失败。', 'error'),
});

const cfDomainPicker = createEditableListPicker({
  root: cfDomainPickerRoot,
  input: selectCfDomain,
  trigger: btnCfDomainMenu,
  current: cfDomainCurrent,
  menu: cfDomainMenu,
  emptyLabel: '请先添加域名',
  itemLabel: '域名',
  normalizeItems: normalizeCloudflareDomains,
  normalizeValue: normalizeCloudflareDomainValue,
  onDelete: handleDeleteCloudflareDomain,
  onDeleteError: (error) => showToast(error?.message || '删除 Cloudflare 域名失败。', 'error'),
});

const tempEmailDomainPicker = createEditableListPicker({
  root: tempEmailDomainPickerRoot,
  input: selectTempEmailDomain,
  trigger: btnTempEmailDomainMenu,
  current: tempEmailDomainCurrent,
  menu: tempEmailDomainMenu,
  emptyLabel: '请先更新域名',
  itemLabel: '域名',
  normalizeItems: normalizeCloudflareTempEmailDomains,
  normalizeValue: normalizeCloudflareTempEmailDomainValue,
  onDelete: handleDeleteCloudflareTempEmailDomain,
  onDeleteError: (error) => showToast(error?.message || '删除 Cloudflare Temp Email 域名失败。', 'error'),
});

function renderSub2ApiGroupOptions(state = latestState, selectedValue = '') {
  if (!inputSub2ApiGroup) {
    return;
  }

  const selected = String(selectedValue || state?.sub2apiGroupName || '').trim();
  const options = getSub2ApiGroupOptionsState({
    ...(state || {}),
    sub2apiGroupName: selected || state?.sub2apiGroupName,
  });
  if (selected && !options.some((name) => name.toLowerCase() === selected.toLowerCase())) {
    options.unshift(selected);
  }

  sub2ApiGroupPicker.render(options, selected || options[0] || DEFAULT_SUB2API_GROUP_OPTIONS[0]);
}
let customEmailPoolEntriesState = [];

const EYE_OPEN_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>';
const EYE_CLOSED_ICON = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 19C5 19 1 12 1 12a21.77 21.77 0 0 1 5.06-6.94"/><path d="M9.9 4.24A10.94 10.94 0 0 1 12 5c7 0 11 7 11 7a21.86 21.86 0 0 1-2.16 3.19"/><path d="M1 1l22 22"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/></svg>';
const PRIVACY_MASKED_INPUT_IDS = Object.freeze([
  'input-contribution-qq',
  'input-sub2api-url',
  'input-sub2api-email',
  'input-sub2api-default-proxy',
  'input-codex2api-url',
  'input-kiro-rs-url',
  'input-gpc-helper-api',
  'input-gpc-helper-phone',
  'input-gpc-helper-local-sms-url',
  'input-gopay-phone',
  'input-gopay-otp',
  'input-email-prefix',
  'input-inbucket-host',
  'input-inbucket-mailbox',
  'input-email',
  'input-temp-email-base-url',
  'input-temp-email-receive-mailbox',
  'input-cloud-mail-base-url',
  'input-cloud-mail-admin-email',
  'input-cloud-mail-receive-mailbox',
  'input-cloud-mail-domain',
  'input-yyds-mail-base-url',
  'input-hotmail-remote-base-url',
  'input-hotmail-local-base-url',
  'input-hotmail-email',
  'input-hotmail-client-id',
  'input-mail2925-email',
  'input-luckmail-base-url',
  'input-luckmail-domain',
  'input-ip-proxy-account-session-prefix',
  'input-ip-proxy-host',
  'input-ip-proxy-region',
  'input-account-run-history-helper-base-url',
  'input-free-reusable-phone',
  'input-signup-phone',
]);
const PRIVACY_MASKED_TEXTAREA_IDS = Object.freeze([
  'input-custom-mail-provider-pool',
  'input-custom-email-pool-import',
  'input-hotmail-import',
  'input-mail2925-import',
  'input-ip-proxy-account-list',
]);
const COPY_ICON = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>';
const parseHotmailImportText = window.HotmailUtils?.parseHotmailImportText;
const normalizeHotmailServiceModeFromUtils = window.HotmailUtils?.normalizeHotmailServiceMode;
const shouldClearHotmailCurrentSelection = window.HotmailUtils?.shouldClearHotmailCurrentSelection;
const upsertHotmailAccountInList = window.HotmailUtils?.upsertHotmailAccountInList;
const filterHotmailAccountsByUsage = window.HotmailUtils?.filterHotmailAccountsByUsage;
const getHotmailBulkActionLabel = window.HotmailUtils?.getHotmailBulkActionLabel;
const getHotmailListToggleLabel = window.HotmailUtils?.getHotmailListToggleLabel;
const upsertPayPalAccountInList = window.PayPalUtils?.upsertPayPalAccountInList;
const normalizeLuckmailTimestampValue = window.LuckMailUtils?.normalizeTimestamp
  || ((value) => {
    const timestamp = Date.parse(String(value || ''));
    return Number.isFinite(timestamp) ? timestamp : 0;
  });
const sidepanelUpdateService = window.SidepanelUpdateService;
const contributionContentService = window.SidepanelContributionContentService;
const sharedFormDialog = window.SidepanelFormDialog?.createFormDialog?.({
  overlay: sharedFormModal,
  titleNode: sharedFormModalTitle,
  closeButton: btnSharedFormModalClose,
  messageNode: sharedFormModalMessage,
  alertNode: sharedFormModalAlert,
  fieldsContainer: sharedFormModalFields,
  cancelButton: btnSharedFormModalCancel,
  confirmButton: btnSharedFormModalConfirm,
});
const DEFAULT_LUCKMAIL_PRESERVE_TAG_NAME = window.LuckMailUtils?.DEFAULT_LUCKMAIL_PRESERVE_TAG_NAME || '保留';
const normalizeIcloudHost = window.IcloudUtils?.normalizeIcloudHost
  || ((value) => {
    const normalized = String(value || '').trim().toLowerCase();
    return normalized === 'icloud.com' || normalized === 'icloud.com.cn' ? normalized : '';
  });
const normalizeIcloudFetchMode = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'always_new' ? 'always_new' : 'reuse_existing';
};
const normalizeIcloudTargetMailboxType = window.MailProviderUtils?.normalizeIcloudTargetMailboxType
  || ((value) => String(value || '').trim().toLowerCase() === 'forward-mailbox'
    ? 'forward-mailbox'
    : 'icloud-inbox');
const getIcloudForwardMailProviderOptions = window.MailProviderUtils?.getIcloudForwardMailProviderOptions
  || (() => Array.from(selectIcloudForwardMailProvider?.options || [])
    .map((option) => ({
      value: String(option?.value || '').trim().toLowerCase(),
      label: String(option?.textContent || option?.label || option?.value || '').trim(),
    }))
    .filter((option) => option.value));
const normalizeIcloudForwardMailProvider = window.MailProviderUtils?.normalizeIcloudForwardMailProvider
  || ((value) => {
    const normalized = String(value || '').trim().toLowerCase();
    const options = getIcloudForwardMailProviderOptions();
    return options.some((option) => option.value === normalized)
      ? normalized
      : (options[0]?.value || 'qq');
  });
const ICLOUD_FORWARD_MAIL_PROVIDER_LABELS = Object.fromEntries(
  getIcloudForwardMailProviderOptions().map((option) => [option.value, option.label])
);
const getIcloudLoginUrlForHost = window.IcloudUtils?.getIcloudLoginUrlForHost
  || ((host) => host === 'icloud.com.cn' ? 'https://www.icloud.com.cn/' : (host === 'icloud.com' ? 'https://www.icloud.com/' : ''));

btnAutoCancelSchedule?.remove();
const MAIL_PROVIDER_LOGIN_CONFIGS = {
  [ICLOUD_PROVIDER]: {
    label: 'iCloud 邮箱',
    buttonLabel: '登录',
  },
  [GMAIL_PROVIDER]: {
    label: 'Gmail 邮箱',
    url: 'https://mail.google.com/mail/u/0/#inbox',
    buttonLabel: '登录',
  },
  '163': {
    label: '163 邮箱',
    url: 'https://mail.163.com/',
    buttonLabel: '登录',
  },
  '163-vip': {
    label: '163 VIP 邮箱',
    url: 'https://webmail.vip.163.com/',
    buttonLabel: '登录',
  },
  '126': {
    label: '126 邮箱',
    url: 'https://mail.126.com/',
    buttonLabel: '登录',
  },
  qq: {
    label: 'QQ 邮箱',
    url: 'https://wx.mail.qq.com/',
    buttonLabel: '登录',
  },
  'cloudflare-temp-email': {
    label: 'Cloudflare Temp Email 部署',
    url: 'https://github.com/QLHazyCoder/cloudflare_temp_email',
    buttonLabel: '部署',
  },
  [YYDS_MAIL_PROVIDER]: {
    label: 'YYDS Mail',
    url: 'https://vip.215.im/docs',
    buttonLabel: '文档',
  },
  '2925': {
    label: '2925 邮箱',
    url: 'https://2925.com/#/mailList',
  },
};
const IP_PROXY_SERVICE_LOGIN_CONFIGS = {
  '711proxy': {
    label: '711Proxy',
    url: 'https://www.711proxy.com/signup?code=AD2497',
    buttonLabel: '注册',
  },
};

// ============================================================
// Toast Notifications
// ============================================================

const toastContainer = document.getElementById('toast-container');

const TOAST_ICONS = {
  error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
  warn: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
};

const LOG_LEVEL_LABELS = {
  info: '信息',
  ok: '成功',
  warn: '警告',
  error: '错误',
};

const CLOUDFLARE_TEMP_EMAIL_REPOSITORY_URL = 'https://github.com/QLHazyCoder/cloudflare_temp_email';

function usesGeneratedAliasMailProvider(
  provider,
  mail2925Mode = getSelectedMail2925Mode(),
  generator = undefined
) {
  const customEmailPoolGenerator = typeof CUSTOM_EMAIL_POOL_GENERATOR === 'string'
    ? CUSTOM_EMAIL_POOL_GENERATOR
    : 'custom-pool';
  const resolvedGenerator = generator !== undefined
    ? generator
    : (typeof getSelectedEmailGenerator === 'function' ? getSelectedEmailGenerator() : '');
  return resolvedGenerator !== customEmailPoolGenerator
    && isManagedAliasProvider(provider, mail2925Mode);
}

function parseGmailBaseEmail(rawValue = '') {
  const value = String(rawValue || '').trim().toLowerCase();
  const match = value.match(/^([^@\s+]+)@((?:gmail|googlemail)\.com)$/i);
  if (!match) return null;

  return {
    localPart: match[1],
    domain: match[2].toLowerCase(),
  };
}

function isManagedGmailAlias(value, baseEmail) {
  const parsedBase = parseGmailBaseEmail(baseEmail);
  if (!parsedBase) return false;

  const match = String(value || '').trim().toLowerCase().match(/^([^@\s+]+)(?:\+[^@\s]+)?@((?:gmail|googlemail)\.com)$/i);
  if (!match) return false;

  return match[1] === parsedBase.localPart && match[2] === parsedBase.domain;
}

function showToast(message, type = 'error', duration = 4000) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `${TOAST_ICONS[type] || ''}<span class="toast-msg">${escapeHtml(message)}</span><button class="toast-close">&times;</button>`;

  toast.querySelector('.toast-close').addEventListener('click', () => dismissToast(toast));
  toastContainer.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => dismissToast(toast), duration);
  }
}

function dismissToast(toast) {
  if (!toast.parentNode) return;
  toast.classList.add('toast-exit');
  toast.addEventListener('animationend', () => toast.remove());
}

function setHostedCheckoutManualCodeDisplay(value = '未获取', title = '') {
  if (!displayHostedCheckoutManualCode) {
    return;
  }
  displayHostedCheckoutManualCode.textContent = String(value || '').trim() || '未获取';
  displayHostedCheckoutManualCode.title = String(title || '').trim();
}

function resetActionModalOption() {
  if (!modalOptionRow || !modalOptionInput || !modalOptionText) {
    return;
  }

  modalOptionRow.hidden = true;
  modalOptionInput.checked = false;
  modalOptionInput.disabled = false;
  modalOptionText.textContent = '不再提示';
}

function resetActionModalAlert() {
  if (!autoStartAlert) {
    return;
  }

  autoStartAlert.hidden = true;
  autoStartAlert.textContent = '';
  autoStartAlert.className = 'modal-alert';
}

function setActionModalMessageContent({ text = '', html = '' } = {}) {
  if (!autoStartMessage) {
    return;
  }

  if (html) {
    autoStartMessage.innerHTML = html;
    return;
  }

  autoStartMessage.textContent = text;
}

function resetActionModalButtons() {
  const buttons = [btnAutoStartCancel, btnAutoStartRestart, btnAutoStartContinue];
  buttons.forEach((button) => {
    if (!button) return;
    button.hidden = true;
    button.disabled = false;
    button.onclick = null;
  });
  currentModalActions = [];
}

function configureActionModalButton(button, action) {
  if (!button) return;
  if (!action) {
    button.hidden = true;
    button.onclick = null;
    return;
  }

  button.hidden = false;
  button.disabled = false;
  button.textContent = action.label;
  button.className = `btn ${action.variant || 'btn-outline'} btn-sm`;
  button.onclick = () => resolveModalChoice(action.id);
}

function configureActionModalOption(option) {
  if (!modalOptionRow || !modalOptionInput || !modalOptionText) {
    return;
  }

  if (!option) {
    resetActionModalOption();
    return;
  }

  modalOptionRow.hidden = false;
  modalOptionInput.checked = Boolean(option.checked);
  modalOptionInput.disabled = Boolean(option.disabled);
  modalOptionText.textContent = option.label || '不再提示';
}

function configureActionModalAlert(alert) {
  if (!autoStartAlert) {
    return;
  }

  if (!alert?.text) {
    resetActionModalAlert();
    return;
  }

  autoStartAlert.hidden = false;
  autoStartAlert.textContent = alert.text;
  autoStartAlert.className = `modal-alert${alert.tone === 'danger' ? ' is-danger' : ''}`;
}

function resolveModalChoice(choice) {
  const optionChecked = Boolean(modalOptionInput?.checked);
  const result = typeof modalResultBuilder === 'function'
    ? modalResultBuilder(choice, { optionChecked })
    : choice;
  if (modalChoiceResolver) {
    modalChoiceResolver(result);
    modalChoiceResolver = null;
  }
  modalResultBuilder = null;
  resetActionModalButtons();
  resetActionModalAlert();
  resetActionModalOption();
  if (autoStartModal) {
    autoStartModal.hidden = true;
  }
}

function openActionModal({ title, message, messageHtml, actions, option, alert, buildResult }) {
  if (!autoStartModal) {
    return Promise.resolve(null);
  }

  if (modalChoiceResolver) {
    resolveModalChoice(null);
  }

  resetActionModalButtons();
  autoStartTitle.textContent = title;
  setActionModalMessageContent({ text: message, html: messageHtml });
  currentModalActions = actions || [];
  modalResultBuilder = typeof buildResult === 'function' ? buildResult : null;
  const buttonSlots = currentModalActions.length <= 2
    ? [btnAutoStartCancel, btnAutoStartContinue]
    : [btnAutoStartCancel, btnAutoStartRestart, btnAutoStartContinue];
  buttonSlots.forEach((button, index) => {
    configureActionModalButton(button, currentModalActions[index]);
  });
  configureActionModalAlert(alert);
  configureActionModalOption(option);
  autoStartModal.hidden = false;

  return new Promise((resolve) => {
    modalChoiceResolver = resolve;
  });
}

function openAutoStartChoiceDialog(startStep, options = {}) {
  const runningStep = Number.isInteger(options.runningStep) ? options.runningStep : null;
  const continueMessage = runningStep
    ? `继续当前会先等待步骤 ${runningStep} 完成，再按最新进度自动执行。`
    : `继续当前会从步骤 ${startStep} 开始自动执行。`;
  return openActionModal({
    title: '启动自动',
    message: `检测到当前已有流程进度。${continueMessage}重新开始会清空当前流程进度并从步骤 1 新开一轮。`,
    actions: [
      { id: null, label: '取消', variant: 'btn-ghost' },
      { id: 'restart', label: '重新开始', variant: 'btn-outline' },
      { id: 'continue', label: '继续当前', variant: 'btn-primary' },
    ],
  });
}

async function openConfirmModal({ title, message, confirmLabel = '确认', confirmVariant = 'btn-primary', alert = null }) {
  const choice = await openActionModal({
    title,
    message,
    alert,
    actions: [
      { id: null, label: '取消', variant: 'btn-ghost' },
      { id: 'confirm', label: confirmLabel, variant: confirmVariant },
    ],
  });
  return choice === 'confirm';
}

async function openConfirmModalWithOption({
  title,
  message,
  messageHtml = '',
  confirmLabel = '确认',
  confirmVariant = 'btn-primary',
  alert = null,
  optionLabel = '不再提示',
  optionChecked = false,
  optionDisabled = false,
}) {
  const result = await openActionModal({
    title,
    message,
    messageHtml,
    alert,
    actions: [
      { id: null, label: '取消', variant: 'btn-ghost' },
      { id: 'confirm', label: confirmLabel, variant: confirmVariant },
    ],
    option: {
      label: optionLabel,
      checked: optionChecked,
      disabled: optionDisabled,
    },
    buildResult: (choice, meta) => ({
      choice,
      optionChecked: Boolean(meta?.optionChecked),
    }),
  });

  return {
    confirmed: result?.choice === 'confirm',
    optionChecked: Boolean(result?.optionChecked),
  };
}

async function openPlusManualConfirmationDialog(options = {}) {
  const method = String(options.method || '').trim().toLowerCase();
  const activeFlowId = String(latestState?.activeFlowId || latestState?.flowId || 'openai').trim().toLowerCase();
  const panelMode = String(latestState?.panelMode || latestState?.openaiIntegrationTargetId || '').trim().toLowerCase();
  const signupMethod = String(latestState?.resolvedSignupMethod || latestState?.signupMethod || 'email').trim().toLowerCase();
  const plusModeEnabled = latestState?.plusModeEnabled === undefined ? true : Boolean(latestState.plusModeEnabled);
  const plusAccountAccessStrategy = String(latestState?.plusAccountAccessStrategy || 'oauth').trim().toLowerCase();
  const useSub2ApiSessionImport = plusModeEnabled
    && activeFlowId === 'openai'
    && panelMode === 'sub2api'
    && signupMethod === 'email'
    && plusAccountAccessStrategy === 'sub2api_codex_session';
  const continuationActionLabel = useSub2ApiSessionImport
    ? '导入当前 ChatGPT 会话到 SUB2API'
    : 'OAuth 登录';
  const title = String(options.title || '').trim() || (method === 'gopay' ? 'GoPay 订阅确认' : '手动确认');
  const message = String(options.message || '').trim()
    || (method === 'gopay'
      ? '请在当前订阅页中手动完成 GoPay 订阅，完成后点击“我已完成订阅”继续。'
      : '请先在页面中完成当前手动操作，完成后点击确认继续。');
  return openActionModal({
    title,
    message,
    actions: [
      { id: 'cancel', label: '取消等待', variant: 'btn-ghost' },
      { id: 'confirm', label: '我已完成订阅', variant: 'btn-primary' },
    ],
    alert: method === 'gopay'
      ? { text: `确认后流程会直接继续到 Plus 模式后续的${continuationActionLabel}。`, tone: 'info' }
      : null,
  });
}

async function syncPlusManualConfirmationDialog() {
  const requestId = String(latestState?.plusManualConfirmationRequestId || '').trim();
  const pending = Boolean(latestState?.plusManualConfirmationPending);
  if (!pending || !requestId || plusManualConfirmationDialogInFlight || activePlusManualConfirmationRequestId === requestId) {
    return;
  }

  const step = Number(latestState?.plusManualConfirmationStep) || 0;
  const method = String(latestState?.plusManualConfirmationMethod || '').trim().toLowerCase();
  const activeFlowId = String(latestState?.activeFlowId || latestState?.flowId || 'openai').trim().toLowerCase();
  const panelMode = String(latestState?.panelMode || latestState?.openaiIntegrationTargetId || '').trim().toLowerCase();
  const signupMethod = String(latestState?.resolvedSignupMethod || latestState?.signupMethod || 'email').trim().toLowerCase();
  const plusModeEnabled = latestState?.plusModeEnabled === undefined ? true : Boolean(latestState.plusModeEnabled);
  const plusAccountAccessStrategy = String(latestState?.plusAccountAccessStrategy || 'oauth').trim().toLowerCase();
  const useSub2ApiSessionImport = plusModeEnabled
    && activeFlowId === 'openai'
    && panelMode === 'sub2api'
    && signupMethod === 'email'
    && plusAccountAccessStrategy === 'sub2api_codex_session';
  const continuationActionLabel = useSub2ApiSessionImport
    ? '导入当前 ChatGPT 会话到 SUB2API'
    : 'OAuth 登录';
  const title = latestState?.plusManualConfirmationTitle;
  const message = latestState?.plusManualConfirmationMessage;
  activePlusManualConfirmationRequestId = requestId;
  plusManualConfirmationDialogInFlight = true;
  let shouldReopenDialog = false;

  try {
    const choice = await openPlusManualConfirmationDialog({
      method,
      title,
      message,
    });
    const currentRequestId = String(latestState?.plusManualConfirmationRequestId || '').trim();
    const stillPending = Boolean(latestState?.plusManualConfirmationPending);
    if (!stillPending || currentRequestId !== requestId) {
      return;
    }
    if (choice == null) {
      shouldReopenDialog = true;
      showToast('当前订阅确认仍在等待中，将重新弹出确认窗口。', 'info', 1800);
      return;
    }

    const confirmed = choice === 'confirm';
    const response = await chrome.runtime.sendMessage({
      type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
      source: 'sidepanel',
      payload: {
        step,
        requestId,
        confirmed,
      },
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    if (confirmed) {
      showToast(method === 'gopay' ? `GoPay 订阅已确认，正在继续${continuationActionLabel}...` : '已确认，流程继续执行中...', 'info', 2200);
    } else {
      showToast(method === 'gopay' ? '已取消 GoPay 订阅等待。' : '已取消当前手动确认。', 'warn', 2200);
    }
  } catch (error) {
    showToast(error?.message || String(error || '未知错误'), 'error');
  } finally {
    if (activePlusManualConfirmationRequestId === requestId) {
      activePlusManualConfirmationRequestId = '';
    }
    plusManualConfirmationDialogInFlight = false;
    if (
      shouldReopenDialog
      && latestState?.plusManualConfirmationPending
      && String(latestState?.plusManualConfirmationRequestId || '').trim() === requestId
    ) {
      setTimeout(() => {
        void syncPlusManualConfirmationDialog();
      }, 0);
    }
  }
}

function isPromptDismissed(storageKey) {
  return localStorage.getItem(storageKey) === '1';
}

function setPromptDismissed(storageKey, dismissed) {
  if (dismissed) {
    localStorage.setItem(storageKey, '1');
  } else {
    localStorage.removeItem(storageKey);
  }
}

function isNewUserGuidePromptDismissed() {
  return isPromptDismissed(NEW_USER_GUIDE_PROMPT_DISMISSED_STORAGE_KEY);
}

function setNewUserGuidePromptDismissed(dismissed) {
  setPromptDismissed(NEW_USER_GUIDE_PROMPT_DISMISSED_STORAGE_KEY, dismissed);
}

function shouldPromptNewUserGuide() {
  if (isNewUserGuidePromptDismissed()) {
    return false;
  }
  if (!btnContributionMode || btnContributionMode.disabled) {
    return false;
  }
  if (typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState)
    : Boolean(latestState?.accountContributionEnabled)) {
    return false;
  }
  return true;
}

function getContributionPortalUrl() {
  return String(contributionContentService?.portalUrl || 'https://flowpilot.qlhazycoder.top').trim();
}

function getContributionContentFlowId(state = latestState) {
  return String(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID;
}

function getContributionContentTargetId(state = latestState) {
  const flowId = getContributionContentFlowId(state);
  if (flowId === 'kiro') {
    return String(state?.kiroTargetId || state?.targetId || 'kiro-rs').trim().toLowerCase() || 'kiro-rs';
  }
  return String(state?.openaiIntegrationTargetId || state?.panelMode || state?.targetId || 'cpa').trim().toLowerCase() || 'cpa';
}

function openNewUserGuidePrompt() {
  return openActionModal({
    title: '新手引导',
    message: '如果你是第一次使用，可以先查看贡献页里的公告和使用教程。点击“查看引导”会自动打开贡献页面。',
    alert: {
      text: '本提示仅出现一次。',
    },
    actions: [
      { id: null, label: '取消', variant: 'btn-ghost' },
      { id: 'confirm', label: '查看引导', variant: 'btn-primary' },
    ],
  });
}

async function maybeShowNewUserGuidePrompt() {
  if (!shouldPromptNewUserGuide()) {
    return false;
  }

  setNewUserGuidePromptDismissed(true);
  const choice = await openNewUserGuidePrompt();
  if (choice === 'confirm') {
    openExternalUrl(getContributionPortalUrl());
    return true;
  }
  return false;
}

function getContributionContentPromptScope(snapshot = currentContributionContentSnapshot) {
  return {
    flowId: String(snapshot?.flowId || getContributionContentFlowId()).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID,
    targetId: String(snapshot?.targetId || getContributionContentTargetId()).trim().toLowerCase() || 'cpa',
  };
}

function getContributionContentPromptDismissedStorageKey(snapshot = currentContributionContentSnapshot) {
  const scope = getContributionContentPromptScope(snapshot);
  return `${CONTRIBUTION_CONTENT_PROMPT_DISMISSED_VERSION_STORAGE_KEY}:${scope.flowId}:${scope.targetId}`;
}

function getDismissedContributionContentPromptVersion(snapshot = currentContributionContentSnapshot) {
  return String(localStorage.getItem(getContributionContentPromptDismissedStorageKey(snapshot)) || '').trim();
}

function setDismissedContributionContentPromptVersion(version, snapshot = currentContributionContentSnapshot) {
  const normalized = String(version || '').trim();
  const storageKey = getContributionContentPromptDismissedStorageKey(snapshot);
  if (normalized) {
    localStorage.setItem(storageKey, normalized);
  } else {
    localStorage.removeItem(storageKey);
  }
}

function isAutoSkipFailuresPromptDismissed() {
  return isPromptDismissed(AUTO_SKIP_FAILURES_PROMPT_DISMISSED_STORAGE_KEY);
}

function setAutoSkipFailuresPromptDismissed(dismissed) {
  setPromptDismissed(AUTO_SKIP_FAILURES_PROMPT_DISMISSED_STORAGE_KEY, dismissed);
}

function isAutoRunFallbackRiskPromptDismissed() {
  return isPromptDismissed(AUTO_RUN_FALLBACK_RISK_PROMPT_DISMISSED_STORAGE_KEY);
}

function setAutoRunFallbackRiskPromptDismissed(dismissed) {
  setPromptDismissed(AUTO_RUN_FALLBACK_RISK_PROMPT_DISMISSED_STORAGE_KEY, dismissed);
}

function isCpaPhoneSignupPromptDismissed() {
  return isPromptDismissed(CPA_PHONE_SIGNUP_PROMPT_DISMISSED_STORAGE_KEY);
}

function setCpaPhoneSignupPromptDismissed(dismissed) {
  setPromptDismissed(CPA_PHONE_SIGNUP_PROMPT_DISMISSED_STORAGE_KEY, dismissed);
}

function isCloudflareTempEmailRegistrationLookupPromptDismissed() {
  return isPromptDismissed(CLOUDFLARE_TEMP_EMAIL_REGISTRATION_LOOKUP_PROMPT_DISMISSED_STORAGE_KEY);
}

function setCloudflareTempEmailRegistrationLookupPromptDismissed(dismissed) {
  setPromptDismissed(CLOUDFLARE_TEMP_EMAIL_REGISTRATION_LOOKUP_PROMPT_DISMISSED_STORAGE_KEY, dismissed);
}

function shouldWarnAutoRunFallbackRisk(totalRuns, autoRunSkipFailures) {
  return totalRuns >= AUTO_RUN_FALLBACK_RISK_WARNING_MIN_RUNS;
}

function shouldWarnCpaPhoneSignup(signupMethod = null, panelMode = null) {
  const resolvedSignupMethod = normalizeSignupMethod(
    signupMethod ?? (
      typeof getSelectedSignupMethod === 'function'
        ? getSelectedSignupMethod()
        : DEFAULT_SIGNUP_METHOD
    )
  );
  const resolvedPanelMode = normalizePanelMode(
    panelMode ?? (
      typeof getSelectedPanelMode === 'function'
        ? getSelectedPanelMode()
        : 'cpa'
    )
  );

  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      panelMode: resolvedPanelMode,
      signupMethod: resolvedSignupMethod,
      state: {
        ...(typeof latestState !== 'undefined' ? latestState : {}),
        panelMode: resolvedPanelMode,
        signupMethod: resolvedSignupMethod,
      },
    })
    : (() => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
        defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
      }) || null;
      return registry?.resolveSidepanelCapabilities
        ? registry.resolveSidepanelCapabilities({
          activeFlowId: typeof latestState !== 'undefined' ? latestState?.activeFlowId : '',
          panelMode: resolvedPanelMode,
          signupMethod: resolvedSignupMethod,
          state: {
            ...(typeof latestState !== 'undefined' ? latestState : {}),
            panelMode: resolvedPanelMode,
            signupMethod: resolvedSignupMethod,
          },
        })
        : null;
    })();

  if (capabilityState && typeof capabilityState.shouldWarnCpaPhoneSignup === 'boolean') {
    return capabilityState.shouldWarnCpaPhoneSignup && !isCpaPhoneSignupPromptDismissed();
  }

  return resolvedSignupMethod === SIGNUP_METHOD_PHONE
    && resolvedPanelMode === 'cpa'
    && !isCpaPhoneSignupPromptDismissed();
}

async function openCpaPhoneSignupWarningModal() {
  const result = await openConfirmModalWithOption({
    title: 'CPA 手机号注册提醒',
    message: CPA_PHONE_SIGNUP_WARNING_MESSAGE,
    confirmLabel: '继续',
    optionLabel: '不再提醒',
  });

  return {
    confirmed: result.confirmed,
    dismissPrompt: result.optionChecked,
  };
}

async function confirmCpaPhoneSignupIfNeeded(options = {}) {
  const signupMethod = Object.prototype.hasOwnProperty.call(options, 'signupMethod')
    ? options.signupMethod
    : null;
  const panelMode = Object.prototype.hasOwnProperty.call(options, 'panelMode')
    ? options.panelMode
    : null;

  if (!shouldWarnCpaPhoneSignup(signupMethod, panelMode)) {
    return true;
  }

  const result = await openCpaPhoneSignupWarningModal();
  if (result.dismissPrompt) {
    setCpaPhoneSignupPromptDismissed(true);
  }

  return result.confirmed;
}

function buildCloudflareTempEmailRegistrationLookupPromptHtml() {
  const repositoryUrl = escapeHtml(CLOUDFLARE_TEMP_EMAIL_REPOSITORY_URL);
  return `需要部署本扩展作者修改后的 <a href="${repositoryUrl}" target="_blank" rel="noopener noreferrer" data-external-url="${repositoryUrl}">Cloudflare Temp Email</a>；部署后可支持多线程收码。`;
}

async function confirmCloudflareTempEmailRegistrationLookupIfNeeded() {
  if (isCloudflareTempEmailRegistrationLookupPromptDismissed()) {
    return true;
  }

  const result = await openConfirmModalWithOption({
    title: '注册邮箱查信',
    messageHtml: buildCloudflareTempEmailRegistrationLookupPromptHtml(),
    confirmLabel: '我已知晓',
    optionLabel: '不再提醒',
  });

  if (result.confirmed && result.optionChecked) {
    setCloudflareTempEmailRegistrationLookupPromptDismissed(true);
  }

  return result.confirmed;
}

async function openAutoSkipFailuresConfirmModal() {
  const result = await openConfirmModalWithOption({
    title: '自动重试说明',
    message: `开启后，自动模式在某一轮失败时，会先在当前轮自动重试；单轮最多重试 ${AUTO_RUN_MAX_RETRIES_PER_ROUND} 次，仍失败则放弃当前轮并继续下一轮。线程间隔只在开启自动重试且总轮数大于 1 时生效。`,
    confirmLabel: '确认开启',
  });

  return {
    confirmed: result.confirmed,
    dismissPrompt: result.optionChecked,
  };
}

async function openAutoRunFallbackRiskConfirmModal(totalRuns) {
  const result = await openConfirmModalWithOption({
    title: '自动运行风险提醒',
    message: `当前轮数已经不适合单节点情况，请确保已经配置并打开节点轮询功能（若没有配置，请点击贡献/使用按钮，根据网页中使用教程进行配置），避免连续使用一个节点注册，导致出现手机号验证。`,
    confirmLabel: '继续',
  });

  return {
    confirmed: result.confirmed,
    dismissPrompt: result.optionChecked,
  };
}

function updateConfigMenuControls() {
  const disabled = configActionInFlight || settingsSaveInFlight;
  const accountContributionEnabled = typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState)
    : Boolean(latestState?.accountContributionEnabled);
  if (accountContributionEnabled && configMenuOpen) {
    configMenuOpen = false;
  }
  const importLocked = disabled
    || accountContributionEnabled
    || currentAutoRun.autoRunning
    || Object.values(getStepStatuses()).some((status) => status === 'running');
  if (btnConfigMenu) {
    btnConfigMenu.disabled = disabled || accountContributionEnabled;
    btnConfigMenu.setAttribute('aria-expanded', String(configMenuOpen));
  }
  if (configMenu) {
    configMenu.hidden = accountContributionEnabled || !configMenuOpen;
  }
  if (btnExportSettings) {
    btnExportSettings.disabled = disabled || accountContributionEnabled;
  }
  if (btnImportSettings) {
    btnImportSettings.disabled = importLocked;
  }
}

function closeConfigMenu() {
  configMenuOpen = false;
  updateConfigMenuControls();
}

function openConfigMenu() {
  configMenuOpen = true;
  updateConfigMenuControls();
}

function toggleConfigMenu() {
  configMenuOpen ? closeConfigMenu() : openConfigMenu();
}

async function waitForSettingsSaveIdle() {
  while (settingsSaveInFlight) {
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

async function flushPendingSettingsBeforeExport() {
  clearTimeout(settingsAutoSaveTimer);
  await waitForSettingsSaveIdle();
  if (settingsDirty) {
    await saveSettings({ silent: true });
  }
}

async function settlePendingSettingsBeforeImport() {
  clearTimeout(settingsAutoSaveTimer);
  await waitForSettingsSaveIdle();
}

function downloadTextFile(content, fileName, mimeType = 'application/json;charset=utf-8', options = {}) {
  const parts = [];
  if (options?.prependUtf8Bom) {
    parts.push('\uFEFF');
  }
  parts.push(content);
  const blob = new Blob(parts, { type: mimeType });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
}

function isDoneStatus(status) {
  return status === 'completed' || status === 'manual_completed' || status === 'skipped';
}

function isPlainObjectValue(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizeStepExecutionRangeFlowId(value = '', fallback = DEFAULT_ACTIVE_FLOW_ID) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'codex') {
    return DEFAULT_ACTIVE_FLOW_ID;
  }
  const fallbackValue = String(fallback || '').trim().toLowerCase();
  return normalized || fallbackValue || DEFAULT_ACTIVE_FLOW_ID;
}

function getCurrentStepExecutionRangeFlowId(state = latestState) {
  const selectedFlow = String(selectFlow?.value || '').trim().toLowerCase();
  if (selectedFlow) {
    return normalizeStepExecutionRangeFlowId(selectedFlow);
  }
  return normalizeStepExecutionRangeFlowId(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID);
}

function hasStepExecutionRangeShape(value) {
  return isPlainObjectValue(value) && (
    Object.prototype.hasOwnProperty.call(value, 'enabled')
    || Object.prototype.hasOwnProperty.call(value, 'fromStep')
    || Object.prototype.hasOwnProperty.call(value, 'toStep')
    || Object.prototype.hasOwnProperty.call(value, 'from')
    || Object.prototype.hasOwnProperty.call(value, 'to')
  );
}

function normalizePositiveStepNumber(value, fallback = 0) {
  const numeric = Math.floor(Number(value));
  if (Number.isInteger(numeric) && numeric > 0) {
    return numeric;
  }
  const fallbackNumber = Math.floor(Number(fallback));
  return Number.isInteger(fallbackNumber) && fallbackNumber > 0 ? fallbackNumber : 0;
}

function normalizeStepExecutionRangeEntry(value = {}) {
  const source = isPlainObjectValue(value) ? value : {};
  const rawFrom = Object.prototype.hasOwnProperty.call(source, 'fromStep') ? source.fromStep : source.from;
  const rawTo = Object.prototype.hasOwnProperty.call(source, 'toStep') ? source.toStep : source.to;
  let fromStep = normalizePositiveStepNumber(rawFrom, 1);
  let toStep = normalizePositiveStepNumber(rawTo, fromStep || 1);
  if (fromStep > 0 && toStep > 0 && fromStep > toStep) {
    [fromStep, toStep] = [toStep, fromStep];
  }
  const hasBounds = fromStep > 0 && toStep > 0;
  const enabled = Object.prototype.hasOwnProperty.call(source, 'enabled')
    ? Boolean(source.enabled)
    : hasBounds;
  return {
    enabled: Boolean(enabled && hasBounds),
    fromStep: fromStep || 1,
    toStep: toStep || fromStep || 1,
  };
}

function getKiroUploadStatusLabel(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '未开始';
  }

  const normalizedValue = rawValue.toLowerCase();
  switch (normalizedValue) {
    case 'waiting_login':
      return '等待登录授权';
    case 'ready_to_upload':
      return '等待上传';
    case 'uploading':
      return '上传中';
    case 'uploaded':
    case 'credential uploaded.':
      return '上传成功';
    case 'error':
      return '上传失败';
    case 'waiting_user':
      return '等待用户确认';
    case 'authorized':
      return '已授权';
    case 'expired':
      return '已过期';
    default:
      return rawValue;
  }
}

function setKiroRsConnectionTestStatus(message = '') {
  const nextText = String(message || '').trim() || '未测试';
  kiroRsConnectionTestStatusText = nextText;
  if (typeof displayKiroRsTestStatus !== 'undefined' && displayKiroRsTestStatus) {
    displayKiroRsTestStatus.textContent = nextText;
  }
}

function normalizeStepExecutionRangeByFlow(value = {}) {
  const source = isPlainObjectValue(value) ? value : {};
  const next = {};

  if (hasStepExecutionRangeShape(source)) {
    next[DEFAULT_ACTIVE_FLOW_ID] = normalizeStepExecutionRangeEntry(source);
    return next;
  }

  for (const [rawFlowId, rawEntry] of Object.entries(source)) {
    if (!hasStepExecutionRangeShape(rawEntry)) {
      continue;
    }
    const flowId = normalizeStepExecutionRangeFlowId(rawFlowId, '');
    if (!flowId) {
      continue;
    }
    next[flowId] = normalizeStepExecutionRangeEntry(rawEntry);
  }

  return next;
}

function getStepExecutionRangeForCurrentFlow(state = latestState) {
  const config = normalizeStepExecutionRangeByFlow(state?.stepExecutionRangeByFlow || {});
  const flowId = getCurrentStepExecutionRangeFlowId(state);
  return config[flowId] || { enabled: false, fromStep: 1, toStep: getLastCurrentStepId() || 1 };
}

function getLastCurrentStepId() {
  return STEP_IDS.length ? Math.max(...STEP_IDS) : 1;
}

function getStepExecutionRangeNodes() {
  return Array.isArray(workflowNodes)
    ? workflowNodes.filter((node) => String(node?.nodeId || '').trim())
    : [];
}

function getStepExecutionRangeNodeLabel(node = {}) {
  const nodeId = String(node?.nodeId || '').trim();
  const displayOrder = Number(node?.displayOrder);
  const title = String(node?.title || nodeId).trim();
  const orderLabel = Number.isInteger(displayOrder) && displayOrder > 0
    ? `步骤 ${displayOrder}`
    : nodeId;
  return title ? `${orderLabel} · ${title}` : orderLabel;
}

function getStepExecutionRangeBoundaryNodeId(stepNumber, boundary = 'start') {
  const nodes = getStepExecutionRangeNodes();
  const fallbackNode = boundary === 'end' ? nodes[nodes.length - 1] : nodes[0];
  const resolvedNodeId = getNodeIdByStepForCurrentMode(stepNumber);
  return String(resolvedNodeId || fallbackNode?.nodeId || '').trim();
}

function getStepExecutionRangeStepOptionLabel(node = {}) {
  const nodeId = String(node?.nodeId || '').trim();
  const step = getStepIdByNodeIdForCurrentMode(nodeId);
  const displayOrder = Number(node?.displayOrder);
  if (Number.isInteger(step) && step > 0) {
    return String(step);
  }
  if (Number.isInteger(displayOrder) && displayOrder > 0) {
    return String(displayOrder);
  }
  return nodeId;
}

function syncStepExecutionRangeSelectOptions(selectedFromNodeId = '', selectedToNodeId = '') {
  const nodes = getStepExecutionRangeNodes();
  const fromSelect = inputStepExecutionRangeFrom;
  const toSelect = inputStepExecutionRangeTo;
  if (!fromSelect || !toSelect) {
    return;
  }

  const buildOptions = (selectedValue) => nodes.map((node) => {
    const nodeId = String(node?.nodeId || '').trim();
    const label = getStepExecutionRangeStepOptionLabel(node);
    return `<option value="${escapeHtml(nodeId)}"${nodeId === selectedValue ? ' selected' : ''}>${escapeHtml(label)}</option>`;
  }).join('');

  fromSelect.innerHTML = buildOptions(String(selectedFromNodeId || nodes[0]?.nodeId || '').trim());
  toSelect.innerHTML = buildOptions(String(selectedToNodeId || nodes[nodes.length - 1]?.nodeId || '').trim());
}

function isStepExecutionRangeUiAvailable(state = latestState) {
  return getCurrentStepExecutionRangeFlowId(state) === DEFAULT_ACTIVE_FLOW_ID;
}

function clampStepExecutionRangeInputs() {
  const nodes = getStepExecutionRangeNodes();
  const firstNodeId = String(nodes[0]?.nodeId || '').trim();
  const lastNodeId = String(nodes[nodes.length - 1]?.nodeId || '').trim();
  const selectedFromNodeId = String(inputStepExecutionRangeFrom?.value || firstNodeId).trim() || firstNodeId;
  const selectedToNodeId = String(inputStepExecutionRangeTo?.value || lastNodeId).trim() || lastNodeId;
  const fromStep = Math.max(1, getStepIdByNodeIdForCurrentMode(selectedFromNodeId) || 1);
  const toStep = Math.max(1, getStepIdByNodeIdForCurrentMode(selectedToNodeId) || fromStep);
  const normalizedFromStep = Math.min(fromStep, toStep);
  const normalizedToStep = Math.max(fromStep, toStep);
  const normalizedFromNodeId = getStepExecutionRangeBoundaryNodeId(normalizedFromStep, 'start');
  const normalizedToNodeId = getStepExecutionRangeBoundaryNodeId(normalizedToStep, 'end');
  syncStepExecutionRangeSelectOptions(normalizedFromNodeId, normalizedToNodeId);
  if (inputStepExecutionRangeFrom) {
    inputStepExecutionRangeFrom.value = normalizedFromNodeId;
  }
  if (inputStepExecutionRangeTo) {
    inputStepExecutionRangeTo.value = normalizedToNodeId;
  }
  return {
    fromNodeId: normalizedFromNodeId,
    toNodeId: normalizedToNodeId,
    fromStep: normalizedFromStep,
    toStep: normalizedToStep,
  };
}

function buildStepExecutionRangeByFlowPayload(existingConfig = latestState?.stepExecutionRangeByFlow || {}) {
  const config = normalizeStepExecutionRangeByFlow(existingConfig);
  if (!isStepExecutionRangeUiAvailable(latestState)) {
    return config;
  }
  const normalizedRange = clampStepExecutionRangeInputs();
  const flowId = getCurrentStepExecutionRangeFlowId(latestState);
  config[flowId] = normalizeStepExecutionRangeEntry({
    enabled: Boolean(inputStepExecutionRangeEnabled?.checked),
    fromStep: normalizedRange?.fromStep,
    toStep: normalizedRange?.toStep,
  });
  return config;
}

function isNodeDisabledByStepExecutionRange(nodeId, state = latestState) {
  const range = getStepExecutionRangeForCurrentFlow(state);
  if (!range.enabled) {
    return false;
  }
  const step = getStepIdByNodeIdForCurrentMode(nodeId);
  if (!Number.isInteger(step) || step <= 0) {
    return false;
  }
  return step < range.fromStep || step > range.toStep;
}

function getEnabledNodeIdsForStepExecutionRange(state = latestState) {
  return NODE_IDS.filter((nodeId) => !isNodeDisabledByStepExecutionRange(nodeId, state));
}

function applyStepExecutionRangeState(state = latestState) {
  if (!rowStepExecutionRange) {
    return;
  }
  const available = isStepExecutionRangeUiAvailable(state);
  rowStepExecutionRange.style.display = available ? '' : 'none';
  const range = getStepExecutionRangeForCurrentFlow(state);
  const fromNodeId = getStepExecutionRangeBoundaryNodeId(range.fromStep, 'start');
  const toNodeId = getStepExecutionRangeBoundaryNodeId(range.toStep, 'end');
  syncStepExecutionRangeSelectOptions(fromNodeId, toNodeId);
  if (inputStepExecutionRangeFrom) {
    inputStepExecutionRangeFrom.value = fromNodeId;
  }
  if (inputStepExecutionRangeTo) {
    inputStepExecutionRangeTo.value = toNodeId;
  }
  if (inputStepExecutionRangeEnabled) {
    inputStepExecutionRangeEnabled.checked = Boolean(range.enabled);
  }
  const controlsDisabled = !available || isAutoRunLockedPhase() || isAutoRunScheduledPhase();
  if (inputStepExecutionRangeEnabled) inputStepExecutionRangeEnabled.disabled = controlsDisabled;
  if (inputStepExecutionRangeFrom) inputStepExecutionRangeFrom.disabled = controlsDisabled || !inputStepExecutionRangeEnabled?.checked;
  if (inputStepExecutionRangeTo) inputStepExecutionRangeTo.disabled = controlsDisabled || !inputStepExecutionRangeEnabled?.checked;
}

function getDisplayNodeStatus(nodeId, status, state = latestState) {
  return isNodeDisabledByStepExecutionRange(nodeId, state) ? 'disabled' : (status || 'pending');
}

function escapeCssValue(value = '') {
  const raw = String(value || '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(raw);
  }
  return raw.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function normalizeStoredNodeStatus(status = '') {
  const normalized = String(status || '').trim() || 'pending';
  return normalized === 'disabled' ? 'pending' : normalized;
}

function getStoredNodeStatuses(state = latestState) {
  const merged = { ...NODE_DEFAULT_STATUSES, ...(state?.nodeStatuses || {}) };
  return Object.fromEntries(NODE_IDS.map((nodeId) => [
    nodeId,
    normalizeStoredNodeStatus(merged[nodeId]),
  ]));
}

function getNodeStatuses(state = latestState) {
  const merged = typeof getStoredNodeStatuses === 'function'
    ? getStoredNodeStatuses(state)
    : Object.fromEntries(NODE_IDS.map((nodeId) => {
      const source = { ...NODE_DEFAULT_STATUSES, ...(state?.nodeStatuses || {}) };
      const status = String(source[nodeId] || '').trim() || 'pending';
      return [nodeId, status === 'disabled' ? 'pending' : status];
    }));
  return Object.fromEntries(NODE_IDS.map((nodeId) => [
    nodeId,
    typeof getDisplayNodeStatus === 'function'
      ? getDisplayNodeStatus(nodeId, merged[nodeId] || 'pending', state)
      : (merged[nodeId] || 'pending'),
  ]));
}

function getStepStatuses(state = latestState) {
  const merged = { ...STEP_DEFAULT_STATUSES };
  if (typeof getNodeStatuses === 'function') {
    const nodeStatuses = getNodeStatuses(state);
    for (const [nodeId, status] of Object.entries(nodeStatuses)) {
      const step = getStepIdByNodeIdForCurrentMode(nodeId);
      if (step) {
        merged[step] = status || 'pending';
      }
    }
  }
  return Object.fromEntries(STEP_IDS.map((stepId) => [stepId, merged[stepId] || 'pending']));
}

function getFirstUnfinishedNode(state = latestState) {
  const statuses = getNodeStatuses(state);
  for (const nodeId of NODE_IDS) {
    if (statuses[nodeId] === 'disabled') {
      continue;
    }
    if (!isDoneStatus(statuses[nodeId])) {
      return nodeId;
    }
  }
  return '';
}

function getFirstUnfinishedStep(state = latestState) {
  const nodeId = getFirstUnfinishedNode(state);
  return nodeId ? getStepIdByNodeIdForCurrentMode(nodeId) : null;
}

function getRunningNodes(state = latestState) {
  const statuses = getNodeStatuses(state);
  return Object.entries(statuses)
    .filter(([, status]) => status === 'running')
    .map(([nodeId]) => nodeId);
}

function getRunningSteps(state = latestState) {
  return getRunningNodes(state)
    .map((nodeId) => getStepIdByNodeIdForCurrentMode(nodeId))
    .filter((step) => Number.isInteger(step) && step > 0)
    .sort((a, b) => a - b);
}

function hasSavedProgress(state = latestState) {
  const statuses = getNodeStatuses(state);
  return Object.values(statuses).some((status) => status !== 'pending' && status !== 'disabled');
}

function isContributionModeSwitchBlocked(state = latestState) {
  const statuses = getStepStatuses(state);
  const anyRunning = Object.values(statuses).some((status) => status === 'running');
  return anyRunning || isAutoRunLockedPhase() || isAutoRunPausedPhase() || isAutoRunScheduledPhase();
}

function shouldOfferAutoModeChoice(state = latestState) {
  return hasSavedProgress(state) && getFirstUnfinishedStep(state) !== null;
}

function syncLatestState(nextState) {
  const normalizedNextState = {
    ...(nextState || {}),
  };
  if (
    Object.prototype.hasOwnProperty.call(normalizedNextState, 'activeFlowId')
    || Object.prototype.hasOwnProperty.call(normalizedNextState, 'flowId')
  ) {
    const fallbackFlowId = latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID;
    const rawFlowId = Object.prototype.hasOwnProperty.call(normalizedNextState, 'activeFlowId')
      ? normalizedNextState.activeFlowId
      : normalizedNextState.flowId;
    const normalizedFlowId = typeof normalizeFlowId === 'function'
      ? normalizeFlowId(rawFlowId, fallbackFlowId)
      : (String(rawFlowId || fallbackFlowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID);
    normalizedNextState.activeFlowId = normalizedFlowId;
    normalizedNextState.flowId = normalizedFlowId;
  }
  const mergedNodeStatuses = normalizedNextState?.nodeStatuses
    ? getStoredNodeStatuses({
      nodeStatuses: { ...NODE_DEFAULT_STATUSES, ...(latestState?.nodeStatuses || {}), ...normalizedNextState.nodeStatuses },
    })
    : getStoredNodeStatuses(latestState);

  latestState = {
    ...(latestState || {}),
    ...normalizedNextState,
    nodeStatuses: mergedNodeStatuses,
  };

  if (typeof renderAccountBook === 'function') {
    renderAccountBook(latestState);
  }
  if (typeof renderAccountRecords === 'function') {
    renderAccountRecords(latestState);
  }
}

function parseSub2ApiReloginAccountPoolEntries(value = '') {
  const lines = String(value || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => String(line || '').trim())
    .filter(Boolean);
  const entries = [];
  const seen = new Set();
  for (const line of lines) {
    const parts = line.split('----').map((part) => String(part || '').trim());
    if (parts.length < 3) {
      continue;
    }
    const phone = parts.shift();
    const email = parts.pop();
    const password = parts.join('----');
    if (!phone || !password || !email || !/@/.test(email)) {
      continue;
    }
    const key = `${phone}----${password}----${email.toLowerCase()}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({ key, phone, password, email: email.toLowerCase() });
  }
  return entries;
}

function normalizeSub2ApiReloginAccountPoolText(value = '') {
  return parseSub2ApiReloginAccountPoolEntries(value)
    .map((entry) => `${entry.phone}----${entry.password}----${entry.email}`)
    .join('\n');
}

function getSub2ApiReloginPoolUsage() {
  const usage = latestState?.sub2apiReloginAccountPoolUsage;
  return usage && typeof usage === 'object' && !Array.isArray(usage) ? usage : {};
}

function setSub2ApiReloginPoolState(patch = {}) {
  syncLatestState(patch);
  renderSub2ApiReloginPool();
}

function getSub2ApiReloginPoolEntries() {
  return parseSub2ApiReloginAccountPoolEntries(
    inputSub2ApiReloginAccountPool?.value || latestState?.sub2apiReloginAccountPoolText || ''
  );
}

function renderSub2ApiReloginPool() {
  if (!sub2ApiReloginPoolList) {
    return;
  }
  const entries = getSub2ApiReloginPoolEntries();
  const usage = getSub2ApiReloginPoolUsage();
  const keyword = String(sub2ApiReloginPoolSearchKeyword || '').trim().toLowerCase();
  const filter = String(sub2ApiReloginPoolFilter || 'all').trim().toLowerCase();
  const currentKey = String(latestState?.sub2apiReloginCurrentAccount?.key || '').trim();
  const counts = entries.reduce((acc, entry) => {
    const item = usage[entry.key] || {};
    acc.total += 1;
    if (item.enabled === false) acc.disabled += 1;
    else acc.enabled += 1;
    if (Number(item.usedAt) > 0) acc.used += 1;
    else acc.unused += 1;
    if (String(item.lastError || '').trim()) acc.error += 1;
    return acc;
  }, { total: 0, enabled: 0, disabled: 0, used: 0, unused: 0, error: 0 });
  if (sub2ApiReloginPoolSummary) {
    sub2ApiReloginPoolSummary.textContent = `共 ${counts.total} 条，未用 ${counts.unused}，已用 ${counts.used}，禁用 ${counts.disabled}`;
  }
  const visibleEntries = entries.filter((entry) => {
    const item = usage[entry.key] || {};
    const used = Number(item.usedAt) > 0;
    const enabled = item.enabled !== false;
    const hasError = Boolean(String(item.lastError || '').trim());
    if (keyword && !`${entry.phone} ${entry.email}`.toLowerCase().includes(keyword)) {
      return false;
    }
    if (filter === 'unused') return !used;
    if (filter === 'used') return used;
    if (filter === 'enabled') return enabled;
    if (filter === 'disabled') return !enabled;
    if (filter === 'error') return hasError;
    return true;
  });
  sub2ApiReloginPoolList.innerHTML = '';
  if (!visibleEntries.length) {
    const empty = document.createElement('div');
    empty.className = 'icloud-empty';
    empty.textContent = entries.length ? '没有匹配的补登账号' : '尚未导入补登账号';
    sub2ApiReloginPoolList.appendChild(empty);
    return;
  }
  visibleEntries.forEach((entry) => {
    const item = usage[entry.key] || {};
    const used = Number(item.usedAt) > 0;
    const enabled = item.enabled !== false;
    const hasError = Boolean(String(item.lastError || '').trim());
    const row = document.createElement('div');
    row.className = 'icloud-item sub2api-relogin-item';
    row.dataset.key = entry.key;
    const main = document.createElement('div');
    main.className = 'icloud-item-main';
    const phone = document.createElement('div');
    phone.className = 'icloud-item-email';
    phone.textContent = entry.phone;
    const email = document.createElement('div');
    email.className = 'data-value mono';
    email.textContent = entry.email;
    const meta = document.createElement('div');
    meta.className = 'icloud-item-meta';
    [
      used ? ['已用', 'used'] : ['未用', 'active'],
      enabled ? ['启用', 'active'] : ['禁用', 'used'],
      currentKey === entry.key ? ['当前', 'active'] : null,
      hasError ? ['异常', 'used'] : null,
    ].filter(Boolean).forEach(([label, className]) => {
      const tag = document.createElement('span');
      tag.className = `icloud-tag ${className}`;
      tag.textContent = label;
      meta.appendChild(tag);
    });
    if (hasError) {
      const errorText = document.createElement('div');
      errorText.className = 'data-value sub2api-relogin-error';
      errorText.textContent = item.lastError;
      main.append(phone, email, meta, errorText);
    } else {
      main.append(phone, email, meta);
    }
    const actions = document.createElement('div');
    actions.className = 'icloud-item-actions';
    [
      [enabled ? '禁用' : '启用', 'toggle-enabled'],
      [used ? '标未用' : '标已用', 'toggle-used'],
      ['删除', 'delete'],
    ].forEach(([label, action]) => {
      const button = document.createElement('button');
      button.className = 'btn btn-ghost btn-xs';
      button.type = 'button';
      button.dataset.action = action;
      button.dataset.key = entry.key;
      button.textContent = label;
      actions.appendChild(button);
    });
    row.append(main, actions);
    sub2ApiReloginPoolList.appendChild(row);
  });
}

function isContributionModeActiveForFlow(state = latestState, flowId = undefined) {
  const rawFlowId = flowId !== undefined
    ? flowId
    : (state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID);
  const normalizedFlowId = typeof normalizeFlowId === 'function'
    ? normalizeFlowId(rawFlowId, DEFAULT_ACTIVE_FLOW_ID)
    : (String(rawFlowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID);
  const stateFlowId = typeof normalizeFlowId === 'function'
    ? normalizeFlowId(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID, DEFAULT_ACTIVE_FLOW_ID)
    : (String(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID);
  return normalizedFlowId === stateFlowId && Boolean(state?.accountContributionEnabled);
}

let accountRunHistoryRefreshTimer = null;

function scheduleAccountRunHistoryRefresh(delayMs = 150) {
  if (accountRunHistoryRefreshTimer) {
    clearTimeout(accountRunHistoryRefreshTimer);
  }
  accountRunHistoryRefreshTimer = setTimeout(() => {
    accountRunHistoryRefreshTimer = null;
    chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).then(state => {
      syncLatestState(state);
      syncAutoRunState(state);
      updateStatusDisplay(latestState);
      updateButtonStates();
    }).catch(() => { });
  }, Math.max(0, Number(delayMs) || 0));
}

function normalizeOperationDelayEnabled(value) {
  return true;
}

function appendOperationDelayLog(enabled, level = 'info', message = '') {
  appendLog({
    timestamp: Date.now(),
    level,
    message: message || (enabled
      ? '操作间延迟已固定开启。'
      : '操作间延迟保持固定开启。'),
  });
}

function applyOperationDelayState(state = latestState, options = {}) {
  const enabled = options.restoreFailed ? true : normalizeOperationDelayEnabled(state?.operationDelayEnabled);
  if (typeof syncLatestState === 'function') {
    syncLatestState({ operationDelayEnabled: enabled });
  }
  if (options.restoreFailed) {
    appendOperationDelayLog(true, 'warn', '操作间延迟设置读取失败，已回退为默认开启。');
  }
}

async function persistOperationDelayToggle() {
  applyOperationDelayState({ operationDelayEnabled: true });
  return true;
  const nextEnabled = normalizeOperationDelayEnabled(inputOperationDelayEnabled?.checked);
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_SETTING',
      source: 'sidepanel',
      payload: { operationDelayEnabled: nextEnabled },
    });
    if (response?.error) throw new Error(response.error);
    const confirmed = normalizeOperationDelayEnabled(response?.state?.operationDelayEnabled ?? nextEnabled);
    lastConfirmedOperationDelayEnabled = confirmed;
    if (inputOperationDelayEnabled) inputOperationDelayEnabled.checked = confirmed;
    syncLatestState({ operationDelayEnabled: confirmed });
    appendOperationDelayLog(confirmed);
  } catch (error) {
    if (inputOperationDelayEnabled) inputOperationDelayEnabled.checked = lastConfirmedOperationDelayEnabled;
    appendOperationDelayLog(lastConfirmedOperationDelayEnabled, 'error', `操作间延迟设置保存失败，已恢复为上一次确认的状态：${error.message}`);
    throw error;
  }
}

function normalizePlusPaymentMethod(value = '') {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.normalizePlusPaymentMethod) {
    return rootScope.GoPayUtils.normalizePlusPaymentMethod(value);
  }
  const gopayValue = typeof PLUS_PAYMENT_METHOD_GOPAY !== 'undefined' ? PLUS_PAYMENT_METHOD_GOPAY : 'gopay';
  const gpcValue = typeof PLUS_PAYMENT_METHOD_GPC_HELPER !== 'undefined' ? PLUS_PAYMENT_METHOD_GPC_HELPER : 'gpc-helper';
  const paypalValue = typeof PLUS_PAYMENT_METHOD_PAYPAL !== 'undefined' ? PLUS_PAYMENT_METHOD_PAYPAL : 'paypal';
  const paypalHostedValue = typeof PLUS_PAYMENT_METHOD_PAYPAL_HOSTED !== 'undefined' ? PLUS_PAYMENT_METHOD_PAYPAL_HOSTED : 'paypal-hosted';
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === paypalHostedValue || normalized === 'paypal_direct' || normalized === 'paypal-direct') {
    return paypalHostedValue;
  }
  if (normalized === gpcValue) {
    return gpcValue;
  }
  return normalized === gopayValue ? gopayValue : paypalValue;
}

function normalizePlusCheckoutVerificationFailureStrategy(value = '') {
  return String(value || '').trim().toLowerCase() === 'retry'
    ? 'retry'
    : DEFAULT_PLUS_CHECKOUT_VERIFICATION_FAILURE_STRATEGY;
}

function normalizePlusCheckAllowedRegionCodeValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }
  const allowedSet = new Set(PLUS_CHECK_ALLOWED_REGION_OPTIONS);
  const bracketMatch = raw.match(/\[([A-Za-z]{2})\]/);
  if (bracketMatch) {
    const code = bracketMatch[1].toUpperCase();
    return allowedSet.has(code) ? code : '';
  }
  const separatedLetters = raw.match(/\b([A-Za-z])\s*[-_]\s*([A-Za-z])\b/);
  if (separatedLetters) {
    const code = `${separatedLetters[1]}${separatedLetters[2]}`.toUpperCase();
    if (allowedSet.has(code)) {
      return code;
    }
  }
  const compact = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (/^[A-Z]{2}$/.test(compact) && allowedSet.has(compact)) {
    return compact;
  }
  const lower = raw.toLowerCase();
  if (/\b(?:kz|kazakhstan)\b|哈萨克/.test(lower)) return 'KZ';
  if (/\b(?:br|bra|brazil|brasil)\b|巴西/.test(lower)) return 'BR';
  if (/\b(?:jp|jpn|japan)\b|日本/.test(lower)) return 'JP';
  if (/\b(?:np|nepal)\b|尼泊尔/.test(lower)) return 'NP';
  if (/\b(?:iq|iraq)\b|伊拉克/.test(lower)) return 'IQ';
  if (/\b(?:us|usa|united\s+states|america)\b|美国/.test(lower)) return 'US';
  return '';
}

function normalizePlusCheckAllowedRegionsValue(value = []) {
  const tokens = Array.isArray(value)
    ? value
    : String(value || '').split(/[\s,;|/]+/);
  const selected = new Set();
  tokens.forEach((entry) => {
    const code = normalizePlusCheckAllowedRegionCodeValue(entry);
    if (code) {
      selected.add(code);
    }
  });
  return PLUS_CHECK_ALLOWED_REGION_OPTIONS.filter((code) => selected.has(code));
}

function getSelectedPlusCheckAllowedRegions() {
  if (typeof plusCheckAllowedRegionInputs === 'undefined' || !Array.isArray(plusCheckAllowedRegionInputs)) {
    return normalizePlusCheckAllowedRegionsValue(latestState?.plusCheckAllowedRegions || []);
  }
  return normalizePlusCheckAllowedRegionsValue(
    plusCheckAllowedRegionInputs
      .filter((input) => input?.checked)
      .map((input) => input.dataset.plusCheckRegion)
  );
}

function syncPlusCheckAllowedRegionsControl(value = []) {
  const selectedRegions = new Set(normalizePlusCheckAllowedRegionsValue(value));
  if (typeof plusCheckAllowedRegionInputs === 'undefined' || !Array.isArray(plusCheckAllowedRegionInputs)) {
    return;
  }
  plusCheckAllowedRegionInputs.forEach((input) => {
    if (!input) {
      return;
    }
    const code = normalizePlusCheckAllowedRegionCodeValue(input.dataset.plusCheckRegion);
    input.checked = selectedRegions.has(code);
  });
}

function normalizeBrowserFingerprintLevel(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'basic' || normalized === 'enhanced') {
    return normalized;
  }
  return DEFAULT_BROWSER_FINGERPRINT_LEVEL;
}

function normalizeBrowserFingerprintLanguage(value = '') {
  const normalized = String(value || '').trim().replace(/_/g, '-').toLowerCase();
  if (normalized === 'random' || normalized === 'auto') {
    return 'random';
  }
  if (normalized === 'en' || normalized === 'en-us') {
    return 'en-US';
  }
  if (normalized === 'zh' || normalized === 'zh-cn' || normalized === 'zh-hans') {
    return 'zh-CN';
  }
  return DEFAULT_BROWSER_FINGERPRINT_LANGUAGE;
}

function normalizePlusHostedCheckoutOauthDelaySeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_PLUS_HOSTED_CHECKOUT_OAUTH_DELAY_SECONDS;
  }
  return Math.min(120, Math.max(0, Math.floor(numeric)));
}

function normalizeOAuthOpenAfterRefreshWaitSeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_OAUTH_OPEN_AFTER_REFRESH_WAIT_SECONDS;
  }
  return Math.min(120, Math.max(0, Math.floor(numeric)));
}

function normalizePlusCheckoutCreatePreWaitSeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_PLUS_CHECKOUT_CREATE_PRE_WAIT_SECONDS;
  }
  return Math.min(120, Math.max(0, Math.floor(numeric)));
}

function normalizePlusCheckoutOpenStableWaitSeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_PLUS_CHECKOUT_OPEN_STABLE_WAIT_SECONDS;
  }
  return Math.min(120, Math.max(0, Math.floor(numeric)));
}

function normalizePlusHostedCheckoutCardPreWaitSeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_PLUS_HOSTED_CHECKOUT_CARD_PRE_WAIT_SECONDS;
  }
  return Math.min(120, Math.max(0, Math.floor(numeric)));
}

function normalizeHostedCheckoutVerificationPopupDelaySeconds(value) {
  const numeric = Number(String(value ?? '').trim());
  if (!Number.isFinite(numeric)) {
    return DEFAULT_HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_SECONDS;
  }
  return Math.min(60, Math.max(0, Math.floor(numeric)));
}

function normalizeHostedCheckoutResendWaitSecondsValue(value, fallback = 20) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.min(300, Math.max(0, Math.floor(Number(fallback) || 20)));
  }
  return Math.min(300, Math.max(0, parsed));
}

function normalizeHostedCheckoutVerificationPollAttemptsValue(value, fallback = 6) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.min(60, Math.max(1, Math.floor(Number(fallback) || 6)));
  }
  return Math.min(60, Math.max(1, parsed));
}

function normalizeHostedCheckoutVerificationPollIntervalSecondsValue(value, fallback = 5) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.min(60, Math.max(1, Math.floor(Number(fallback) || 5)));
  }
  return Math.min(60, Math.max(1, parsed));
}

function normalizeHostedCheckoutVerificationResendMaxAttemptsValue(value, fallback = 1) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.min(10, Math.max(0, Math.floor(Number(fallback) || 1)));
  }
  return Math.min(10, Math.max(0, parsed));
}

function normalizeHostedCheckoutSmsPoolMaxUsesValue(value, fallback = DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES) {
  const rawValue = String(value ?? '').trim();
  const fallbackValue = Math.min(99, Math.max(1, Math.floor(Number(fallback) || DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES)));
  if (!rawValue) {
    return fallbackValue;
  }
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallbackValue;
  }
  return Math.min(99, Math.max(1, Math.floor(parsed)));
}

function normalizeHostedCheckoutSmsSourceValue(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/-/g, '_');
  return normalized === HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS
    ? HOSTED_CHECKOUT_SMS_SOURCE_PHONE_SMS
    : HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL;
}

function normalizePayPalProfileCountryCodeValue(value, fallback = 'US') {
  if (value === undefined || value === null) {
    return normalizePayPalProfileCountryCodeValue(fallback, 'US') || 'US';
  }
  const raw = String(value).trim();
  if (!raw) {
    return '';
  }
  const normalized = raw.toUpperCase().replace(/[^A-Z]/g, '');
  if (['US', 'JP', 'BR'].includes(normalized)) {
    return normalized;
  }
  const fallbackRaw = String(fallback ?? '').trim();
  if (!fallbackRaw) {
    return '';
  }
  const fallbackNormalized = fallbackRaw.toUpperCase().replace(/[^A-Z]/g, '');
  return ['US', 'JP', 'BR'].includes(fallbackNormalized) ? fallbackNormalized : 'US';
}

function normalizePlusCheckoutConversionProxyUrlValue(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }
  try {
    const parsed = new URL(rawValue);
    const protocol = String(parsed.protocol || '').replace(/:$/g, '').trim().toLowerCase();
    if (!['http', 'https', 'socks4', 'socks5', 'socks5h'].includes(protocol)) {
      return rawValue;
    }
    const host = String(parsed.hostname || '').trim();
    const port = String(parsed.port || '').trim();
    if (!host || !port) {
      return rawValue;
    }
    const username = parsed.username ? decodeURIComponent(parsed.username) : '';
    const password = parsed.password ? decodeURIComponent(parsed.password) : '';
    const auth = username || password
      ? `${encodeURIComponent(username)}${parsed.password || password ? `:${encodeURIComponent(password)}` : ''}@`
      : '';
    return `${protocol}://${auth}${host}:${port}`;
  } catch {
    return rawValue;
  }
}

function normalizePlusCheckoutConversionProxySourceValue(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === '711proxy_pool') {
    return '711proxy_pool';
  }
  if (normalized === 'direct') {
    return 'direct';
  }
  if (normalized === 'ip_proxy') {
    return 'ip_proxy';
  }
  return 'manual';
}

function normalizePlusCheckoutConversionProxy711RegionDraftValue(value = '') {
  return String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
}

function normalizePlusCheckoutConversionProxy711RegionValue(value = '') {
  const draft = normalizePlusCheckoutConversionProxy711RegionDraftValue(value);
  return draft.length === 2 ? draft : '';
}

function normalizePlusCheckoutCloudConversionApiUrlValue(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }
  try {
    const parsed = new URL(rawValue);
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return rawValue;
  }
}

function normalizePlusCheckoutCloudConversionApiKeyValue(value = '') {
  return String(value || '').trim();
}

function normalizeHostedCheckoutVerificationUrlValue(value = '') {
  const rawValue = String(value || '').trim();
  if (!rawValue) {
    return '';
  }
  try {
    const parsed = new URL(rawValue);
    parsed.searchParams.delete('t');
    return parsed.toString();
  } catch {
    return rawValue
      .replace(/([?&])t=\d+(?=(&|$))/i, '$1')
      .replace(/[?&]$/g, '');
  }
}

function normalizeHostedCheckoutPhoneValue(value = '') {
  const rawValue = String(value || '').trim();
  const digits = rawValue.replace(/\D+/g, '');
  if (!digits) {
    return '';
  }
  if (digits.length === 11 && digits.startsWith('1')) {
    return digits.slice(1);
  }
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function normalizeHostedCheckoutPoolUrlValue(value = '') {
  return normalizeHostedCheckoutVerificationUrlValue(value);
}

function parseHostedCheckoutSmsPoolEntries(value = '') {
  const separator = '----';
  const lines = String(value || '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const seen = new Set();
  const entries = [];
  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const separatorIndex = line.indexOf(separator);
    const hasSeparator = separatorIndex > 0;
    const phone = hasSeparator
      ? normalizeHostedCheckoutPhoneValue(line.slice(0, separatorIndex))
      : normalizeHostedCheckoutPhoneValue(line);
    const verificationUrl = hasSeparator
      ? normalizeHostedCheckoutPoolUrlValue(line.slice(separatorIndex + separator.length))
      : normalizeHostedCheckoutPoolUrlValue(lines[index + 1] || '');
    if (!hasSeparator && verificationUrl) {
      index += 1;
    }
    const key = phone && verificationUrl ? `${phone}${separator}${verificationUrl}` : '';
    if (!phone || !verificationUrl || !key || seen.has(key)) {
      continue;
    }
    seen.add(key);
    entries.push({
      phone,
      verificationUrl,
    });
  }
  return entries;
}

function normalizeHostedCheckoutSmsPoolTextValue(value = '') {
  return parseHostedCheckoutSmsPoolEntries(value)
    .map((entry) => `${entry.phone}----${entry.verificationUrl}`)
    .join('\n');
}

function normalizeHostedCheckoutCurrentSmsEntryValue(entry = null, entries = null) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
    return null;
  }
  const normalizedEntries = Array.isArray(entries)
    ? parseHostedCheckoutSmsPoolEntries(
      entries.map((item) => `${item.phone}----${item.verificationUrl}`).join('\n')
    )
    : parseHostedCheckoutSmsPoolEntries(latestState?.hostedCheckoutSmsPoolText || '');
  const normalizedPhone = normalizeHostedCheckoutPhoneValue(entry.phone || '');
  const normalizedUrl = normalizeHostedCheckoutPoolUrlValue(entry.verificationUrl || '');
  const normalizedKey = String(
    entry.key
    || (normalizedPhone && normalizedUrl ? `${normalizedPhone}----${normalizedUrl}` : '')
  ).trim();
  if (!normalizedKey) {
    return null;
  }
  const matchedEntry = normalizedEntries.find((candidate) => {
    const candidateKey = `${candidate.phone}----${candidate.verificationUrl}`;
    return candidateKey === normalizedKey;
  });
  if (matchedEntry) {
    return {
      key: `${matchedEntry.phone}----${matchedEntry.verificationUrl}`,
      phone: matchedEntry.phone,
      verificationUrl: matchedEntry.verificationUrl,
    };
  }
  if (!normalizedPhone || !normalizedUrl) {
    return null;
  }
  return {
    key: normalizedKey,
    phone: normalizedPhone,
    verificationUrl: normalizedUrl,
  };
}

function normalizePlusAccountAccessStrategy(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION;
  }
  if (normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION;
  }
  return PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
}

function normalizePlusAccountAccessStrategyUiValue(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (
    normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI
    || normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION
    || normalized === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION
  ) {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI;
  }
  return PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
}

function getPlusAccountSessionStrategyForTarget(targetId = '') {
  const normalizedTargetId = normalizePlusStrategyTargetId(targetId);
  if (normalizedTargetId === 'sub2api') {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION;
  }
  if (normalizedTargetId === 'cpa') {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION;
  }
  return PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
}

function resolvePlusAccountAccessStrategyForTarget(value = '', targetId = '') {
  const normalizedUiValue = normalizePlusAccountAccessStrategyUiValue(value);
  if (normalizedUiValue !== PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI) {
    return PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
  }
  return getPlusAccountSessionStrategyForTarget(targetId);
}

function getSelectedPlusPaymentMethod(state = latestState) {
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : 'paypal';
  if (typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod?.value) {
    return normalizePlusPaymentMethod(selectPlusPaymentMethod.value);
  }
  return normalizePlusPaymentMethod(state?.plusPaymentMethod || currentPlusPaymentMethod || defaultMethod);
}

function isHostedCheckoutFinalStepEnabled(state = latestState, options = {}) {
  const paymentMethod = normalizePlusPaymentMethod(
    options.plusPaymentMethod
    ?? state?.plusPaymentMethod
    ?? currentPlusPaymentMethod
    ?? DEFAULT_PLUS_PAYMENT_METHOD
  );
  if (paymentMethod === PLUS_PAYMENT_METHOD_PAYPAL_HOSTED) {
    return true;
  }
  if (paymentMethod !== PLUS_PAYMENT_METHOD_PAYPAL) {
    return false;
  }
  const plusModeEnabled = Boolean(
    options.plusModeEnabled
    ?? state?.plusModeEnabled
    ?? currentPlusModeEnabled
    ?? false
  );
  const phonePlusModeEnabled = Boolean(
    options.phonePlusModeEnabled
    ?? state?.phonePlusModeEnabled
    ?? currentPhonePlusModeEnabled
    ?? false
  );
  if (!plusModeEnabled && !phonePlusModeEnabled) {
    return false;
  }
  return (options.plusHostedCheckoutIsFinalStep ?? state?.plusHostedCheckoutIsFinalStep) !== false;
}

function getRequestedPlusAccountAccessStrategy(state = latestState) {
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined'
    ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY
    : 'oauth';
  const oauthStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH
    : 'oauth';
  const sub2apiSessionStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION
    : 'sub2api_codex_session';
  const cpaSessionStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION
    : 'cpa_codex_session';
  const sessionUiValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI
    : 'codex_session';
  const resolveTargetId = () => {
    if (typeof getSelectedPanelMode === 'function') {
      return getSelectedPanelMode();
    }
    if (typeof selectPanelMode !== 'undefined' && selectPanelMode?.value) {
      return selectPanelMode.value;
    }
    return state?.panelMode || state?.openaiIntegrationTargetId || 'cpa';
  };
  const resolveStrategyForTarget = typeof resolvePlusAccountAccessStrategyForTarget === 'function'
    ? resolvePlusAccountAccessStrategyForTarget
    : ((value = '', targetId = '') => {
      const normalizedValue = String(value || '').trim().toLowerCase();
      const isSessionImport = normalizedValue === sessionUiValue
        || normalizedValue === sub2apiSessionStrategyValue
        || normalizedValue === cpaSessionStrategyValue;
      if (!isSessionImport) {
        return oauthStrategyValue;
      }
      const normalizedTargetId = typeof normalizePlusStrategyTargetId === 'function'
        ? normalizePlusStrategyTargetId(targetId)
        : String(targetId || '').trim().toLowerCase();
      if (normalizedTargetId === 'sub2api') {
        return sub2apiSessionStrategyValue;
      }
      if (normalizedTargetId === 'cpa') {
        return cpaSessionStrategyValue;
      }
      return oauthStrategyValue;
    });
  const fallbackStrategy = normalizePlusAccountAccessStrategy(
    (typeof selectPlusAccountAccessStrategy !== 'undefined' && selectPlusAccountAccessStrategy?.dataset?.requestedValue)
    || state?.plusAccountAccessStrategy
    || currentPlusAccountAccessStrategy
    || defaultStrategy
  );
  if (
    typeof selectPlusAccountAccessStrategy !== 'undefined'
    && selectPlusAccountAccessStrategy
    && !selectPlusAccountAccessStrategy.disabled
  ) {
    return resolveStrategyForTarget(selectPlusAccountAccessStrategy.value || fallbackStrategy, resolveTargetId());
  }
  return fallbackStrategy;
}

function normalizePlusStrategyTargetId(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'sub2api') {
    return 'sub2api';
  }
  if (normalized === 'codex2api') {
    return 'codex2api';
  }
  return 'cpa';
}

function getPlusAccountAccessStrategyContinuationLabel(strategy = '', targetId = '') {
  const normalizedStrategy = normalizePlusAccountAccessStrategy(strategy);
  if (normalizedStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
    return '导入当前 ChatGPT 会话到 SUB2API';
  }
  if (normalizedStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
    return '导入当前 ChatGPT 会话到 CPA';
  }
  return 'OAuth 登录';
}

function getPlusAccountAccessStrategyDescription(strategy = '', targetId = '') {
  const normalizedStrategy = normalizePlusAccountAccessStrategy(strategy);
  const normalizedTargetId = normalizePlusStrategyTargetId(targetId);
  if (normalizedStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION) {
    return '复用当前 Plus 已登录会话，直接导入到 SUB2API';
  }
  if (normalizedStrategy === PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION) {
    return '复用当前 Plus 已登录会话，直接导入到 CPA';
  }
  if (normalizedTargetId === 'sub2api') {
    return '通过 OAuth 回调创建 SUB2API 账号';
  }
  if (normalizedTargetId === 'codex2api') {
    return '通过 OAuth 回调创建 Codex2API 账号';
  }
  return '通过 OAuth 回调创建 CPA 账号';
}

function resolvePlusManualContinuationActionLabelFromState(state = latestState) {
  const activeFlowId = String(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase();
  const signupMethod = normalizeSignupMethod(state?.resolvedSignupMethod || state?.signupMethod || DEFAULT_SIGNUP_METHOD);
  const plusModeEnabled = state?.plusModeEnabled === undefined ? true : Boolean(state?.plusModeEnabled);
  const targetId = normalizePlusStrategyTargetId(state?.panelMode || state?.openaiIntegrationTargetId || 'cpa');
  const strategy = normalizePlusAccountAccessStrategy(state?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY);
  const effectiveStrategy = plusModeEnabled && activeFlowId === DEFAULT_ACTIVE_FLOW_ID && signupMethod === SIGNUP_METHOD_EMAIL
    ? strategy
    : PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH;
  return getPlusAccountAccessStrategyContinuationLabel(effectiveStrategy, targetId);
}

function normalizeGpcHelperPhoneModeValue(value = '') {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.normalizeGpcHelperPhoneMode) {
    return rootScope.GoPayUtils.normalizeGpcHelperPhoneMode(value);
  }
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === GPC_HELPER_PHONE_MODE_AUTO || normalized === 'builtin'
    ? GPC_HELPER_PHONE_MODE_AUTO
    : GPC_HELPER_PHONE_MODE_MANUAL;
}

function getGpcHelperAutoModeEnabled(state = latestState) {
  return Boolean(state?.gopayHelperAutoModeEnabled);
}

function normalizeGpcAutoModePermissionValue(value) {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'number') {
    if (value === 1) return true;
    if (value === 0) return false;
  }
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!normalized) {
    return null;
  }
  if (['true', '1', 'yes', 'y', 'on', 'enabled', 'enable'].includes(normalized)) {
    return true;
  }
  if (['false', '0', 'no', 'n', 'off', 'disabled', 'disable'].includes(normalized)) {
    return false;
  }
  return null;
}

function getGpcAutoModePermissionFromPayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return null;
  }
  for (const key of ['auto_mode_enabled', 'autoModeEnabled', 'auto_enabled', 'autoEnabled']) {
    if (payload[key] !== undefined) {
      return normalizeGpcAutoModePermissionValue(payload[key]);
    }
  }
  if (payload.data && typeof payload.data === 'object' && !Array.isArray(payload.data)) {
    return getGpcAutoModePermissionFromPayload(payload.data);
  }
  return null;
}

function shouldPreserveSelectedGpcAutoMode(state = latestState) {
  const payloadPermission = getGpcAutoModePermissionFromPayload(state?.gopayHelperBalancePayload);
  return normalizeGpcHelperPhoneModeValue(state?.gopayHelperPhoneMode) === GPC_HELPER_PHONE_MODE_AUTO
    && (Boolean(state?.gopayHelperAutoModeEnabled) || payloadPermission === true);
}

function hasGpcAutoModePermissionField(payload = {}) {
  return getGpcAutoModePermissionFromPayload(payload) !== null;
}

function isGpcAutoModePermissionDenied(state = latestState) {
  const payloadPermission = getGpcAutoModePermissionFromPayload(state?.gopayHelperBalancePayload);
  return payloadPermission === false;
}

function normalizeGpcRemainingUsesValue(value) {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.normalizeGpcRemainingUses) {
    return rootScope.GoPayUtils.normalizeGpcRemainingUses(value);
  }
  if (value === undefined || value === null || String(value).trim() === '') {
    return null;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : null;
}

function getGpcBalanceRemainingUsesFromResponse(response = {}) {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.getGpcBalanceRemainingUses) {
    const remaining = rootScope.GoPayUtils.getGpcBalanceRemainingUses(response?.data || response?.payload || response);
    if (remaining !== null && remaining !== undefined) {
      return remaining;
    }
  }
  return normalizeGpcRemainingUsesValue(
    response?.remainingUses
    ?? response?.data?.remaining_uses
    ?? response?.data?.remainingUses
    ?? response?.payload?.data?.remaining_uses
    ?? response?.payload?.remaining_uses
    ?? response?.payload?.remainingUses
  );
}

function getGpcAutoModeEnabledFromResponse(response = {}) {
  if (typeof response?.autoModeEnabled === 'boolean') {
    return response.autoModeEnabled;
  }
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.isGpcAutoModeEnabled) {
    return rootScope.GoPayUtils.isGpcAutoModeEnabled(response?.data || response?.payload || response);
  }
  return Boolean(
    response?.data?.auto_mode_enabled
    ?? response?.data?.autoModeEnabled
    ?? response?.payload?.data?.auto_mode_enabled
    ?? response?.payload?.auto_mode_enabled
    ?? response?.payload?.autoModeEnabled
  );
}

function normalizeGpcOtpChannelValue(value = '') {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.GoPayUtils?.normalizeGpcOtpChannel) {
    return rootScope.GoPayUtils.normalizeGpcOtpChannel(value);
  }
  return String(value || '').trim().toLowerCase() === 'sms' ? 'sms' : 'whatsapp';
}

function normalizeGpcLocalSmsHelperBaseUrlValue(value = '') {
  const fallback = 'http://127.0.0.1:18767';
  const rawValue = String(value || fallback).trim();
  try {
    const parsed = new URL(rawValue);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return fallback;
    }
    const endpointPath = parsed.pathname.replace(/\/+$/g, '') || '/';
    if (['/otp', '/latest-otp', '/health'].includes(endpointPath)) {
      parsed.pathname = '';
      parsed.search = '';
      parsed.hash = '';
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

function hasOwnStateValue(source, key) {
  return Object.prototype.hasOwnProperty.call(source, key);
}

function readAutoRunStateValue(source, keys, fallback) {
  for (const key of keys) {
    if (hasOwnStateValue(source, key)) {
      return source[key];
    }
  }
  return fallback;
}

function normalizePendingAutoRunStartRunCount(value) {
  const numeric = Math.floor(Number(value) || 0);
  return numeric > 0 ? numeric : 0;
}

function registerPendingAutoRunStartRunCount(totalRuns) {
  pendingAutoRunStartTotalRuns = normalizePendingAutoRunStartRunCount(totalRuns);
  pendingAutoRunStartExpiresAt = pendingAutoRunStartTotalRuns > 0
    ? Date.now() + 30000
    : 0;
}

function clearPendingAutoRunStartRunCount() {
  pendingAutoRunStartTotalRuns = 0;
  pendingAutoRunStartExpiresAt = 0;
}

function getPendingAutoRunStartRunCount() {
  if (pendingAutoRunStartTotalRuns > 0 && pendingAutoRunStartExpiresAt > 0 && Date.now() > pendingAutoRunStartExpiresAt) {
    clearPendingAutoRunStartRunCount();
  }
  return pendingAutoRunStartTotalRuns;
}

function getAutoRunSourceTotalRuns(source = {}) {
  return normalizePendingAutoRunStartRunCount(readAutoRunStateValue(source, ['autoRunTotalRuns', 'totalRuns'], 0));
}

function syncAutoRunState(source = {}) {
  const phase = source.autoRunPhase ?? source.phase ?? currentAutoRun.phase;
  const autoRunning = source.autoRunning !== undefined
    ? Boolean(source.autoRunning)
    : (source.autoRunPhase !== undefined || source.phase !== undefined
      ? ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(phase)
      : currentAutoRun.autoRunning);

  currentAutoRun = {
    autoRunning,
    phase,
    currentRun: readAutoRunStateValue(source, ['autoRunCurrentRun', 'currentRun'], currentAutoRun.currentRun),
    totalRuns: readAutoRunStateValue(source, ['autoRunTotalRuns', 'totalRuns'], currentAutoRun.totalRuns),
    attemptRun: readAutoRunStateValue(source, ['autoRunAttemptRun', 'attemptRun'], currentAutoRun.attemptRun),
    scheduledAt: readAutoRunStateValue(source, ['scheduledAutoRunAt', 'scheduledAt'], currentAutoRun.scheduledAt),
    countdownAt: readAutoRunStateValue(source, ['autoRunCountdownAt', 'countdownAt'], currentAutoRun.countdownAt),
    countdownTitle: readAutoRunStateValue(source, ['autoRunCountdownTitle', 'countdownTitle'], currentAutoRun.countdownTitle),
    countdownNote: readAutoRunStateValue(source, ['autoRunCountdownNote', 'countdownNote'], currentAutoRun.countdownNote),
  };
}

function isContributionButtonLocked() {
  const autoActive = currentAutoRun.autoRunning
    || isAutoRunLockedPhase()
    || isAutoRunPausedPhase()
    || isAutoRunScheduledPhase();
  if (autoActive) {
    return false;
  }

  const statuses = getStepStatuses();
  const anyRunning = Object.values(statuses).some((status) => status === 'running');
  return anyRunning;
}

function isAutoRunLockedPhase() {
  return currentAutoRun.phase === 'running'
    || currentAutoRun.phase === 'waiting_step'
    || currentAutoRun.phase === 'retrying'
    || currentAutoRun.phase === 'waiting_interval';
}

function isAutoRunPausedPhase() {
  return currentAutoRun.phase === 'waiting_email';
}

function isAutoRunWaitingStepPhase() {
  return currentAutoRun.phase === 'waiting_step';
}

function isAutoRunScheduledPhase() {
  return currentAutoRun.phase === 'scheduled';
}

function isAutoRunSourceSyncPhase(phase) {
  return ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(phase);
}

function shouldSyncRunCountFromAutoRunSource(source = {}) {
  const phase = source.autoRunPhase ?? source.phase ?? currentAutoRun.phase;
  const autoRunning = source.autoRunning !== undefined
    ? Boolean(source.autoRunning)
    : isAutoRunSourceSyncPhase(phase);
  const shouldSync = autoRunning || isAutoRunSourceSyncPhase(phase);
  if (!shouldSync) {
    return false;
  }

  const pendingTotalRuns = getPendingAutoRunStartRunCount();
  if (pendingTotalRuns > 0) {
    const sourceTotalRuns = getAutoRunSourceTotalRuns(source);
    if (sourceTotalRuns > 0 && sourceTotalRuns !== pendingTotalRuns) {
      return false;
    }
    if (sourceTotalRuns === pendingTotalRuns) {
      clearPendingAutoRunStartRunCount();
    }
  }
  return true;
}

function getAutoRunLabel(payload = currentAutoRun) {
  if ((payload.phase ?? currentAutoRun.phase) === 'scheduled') {
    return (payload.totalRuns || 1) > 1 ? ` (${payload.totalRuns}轮)` : '';
  }
  const attemptLabel = payload.attemptRun ? ` · 尝试${payload.attemptRun}` : '';
  if ((payload.totalRuns || 1) > 1) {
    return ` (${payload.currentRun}/${payload.totalRuns}${attemptLabel})`;
  }
  return attemptLabel ? ` (${attemptLabel.slice(3)})` : '';
}

function normalizeAutoDelayMinutes(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return AUTO_DELAY_DEFAULT_MINUTES;
  }
  return Math.min(AUTO_DELAY_MAX_MINUTES, Math.max(AUTO_DELAY_MIN_MINUTES, Math.floor(numeric)));
}

function normalizeAutoRunThreadIntervalMinutes(value) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return AUTO_FALLBACK_THREAD_INTERVAL_DEFAULT_MINUTES;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return AUTO_FALLBACK_THREAD_INTERVAL_DEFAULT_MINUTES;
  }

  return Math.min(
    AUTO_FALLBACK_THREAD_INTERVAL_MAX_MINUTES,
    Math.max(AUTO_FALLBACK_THREAD_INTERVAL_MIN_MINUTES, Math.floor(numeric))
  );
}

function normalizeAutoStepDelaySeconds(value) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return null;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  return Math.min(AUTO_STEP_DELAY_MAX_SECONDS, Math.max(AUTO_STEP_DELAY_MIN_SECONDS, Math.floor(numeric)));
}

function normalizeRegistrationStageWaitSeconds(value, fallback = DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS) {
  const fallbackNumber = Math.min(
    AUTO_STEP_DELAY_MAX_SECONDS,
    Math.max(AUTO_STEP_DELAY_MIN_SECONDS, Math.floor(Number(fallback) || DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS))
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(AUTO_STEP_DELAY_MAX_SECONDS, Math.max(AUTO_STEP_DELAY_MIN_SECONDS, Math.floor(numeric)));
}

function normalizeSignupIdentityRedirectTimeoutSeconds(value, fallback = DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS) {
  const fallbackNumber = Math.min(
    SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MAX_SECONDS,
    Math.max(
      SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MIN_SECONDS,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MAX_SECONDS,
    Math.max(SIGNUP_IDENTITY_REDIRECT_TIMEOUT_MIN_SECONDS, Math.floor(numeric))
  );
}

function normalizeAuthContentScriptRecoveryTimeoutSeconds(value, fallback = DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS) {
  const fallbackNumber = Math.min(
    AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MAX_SECONDS,
    Math.max(
      AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MIN_SECONDS,
      Math.floor(Number(fallback) || DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MAX_SECONDS,
    Math.max(AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_MIN_SECONDS, Math.floor(numeric))
  );
}

function normalizeSignupVerificationReadyTimeoutSeconds(value, fallback = DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS) {
  const fallbackNumber = Math.min(
    SIGNUP_VERIFICATION_READY_TIMEOUT_MAX_SECONDS,
    Math.max(
      SIGNUP_VERIFICATION_READY_TIMEOUT_MIN_SECONDS,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_VERIFICATION_READY_TIMEOUT_MAX_SECONDS,
    Math.max(SIGNUP_VERIFICATION_READY_TIMEOUT_MIN_SECONDS, Math.floor(numeric))
  );
}

function normalizeSignupVerificationReadyMaxRounds(value, fallback = DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS) {
  const fallbackNumber = Math.min(
    SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MAX,
    Math.max(
      SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MAX,
    Math.max(SIGNUP_VERIFICATION_READY_MAX_ROUNDS_MIN, Math.floor(numeric))
  );
}

function normalizeSignupVerificationReadyRoundWaitSeconds(value, fallback = DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS) {
  const fallbackNumber = Math.min(
    SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MAX,
    Math.max(
      SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MAX,
    Math.max(SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS_MIN, Math.floor(numeric))
  );
}

function normalizeSignupPhoneVerificationSubmitResultMaxRounds(value, fallback = DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS) {
  const fallbackNumber = Math.min(
    SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MAX,
    Math.max(
      SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MAX,
    Math.max(SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS_MIN, Math.floor(numeric))
  );
}

function normalizeSignupPhoneVerificationSubmitResultRoundWaitSeconds(value, fallback = DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS) {
  const fallbackNumber = Math.min(
    SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX,
    Math.max(
      SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX,
    Math.max(SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN, Math.floor(numeric))
  );
}

function normalizeStep5ProfileSubmitResultMaxRounds(value, fallback = DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS) {
  const fallbackNumber = Math.min(
    STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MAX,
    Math.max(
      STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MAX,
    Math.max(STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS_MIN, Math.floor(numeric))
  );
}

function normalizeStep5ProfileSubmitResultRoundWaitSeconds(value, fallback = DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS) {
  const fallbackNumber = Math.min(
    STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX,
    Math.max(
      STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN,
      Math.floor(Number(fallback) || DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS)
    )
  );
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallbackNumber;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallbackNumber;
  }

  return Math.min(
    STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MAX,
    Math.max(STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS_MIN, Math.floor(numeric))
  );
}

function normalizeVerificationResendCount(value, fallback) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return fallback;
  }

  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric)) {
    return fallback;
  }

  return Math.min(
    VERIFICATION_RESEND_COUNT_MAX,
    Math.max(VERIFICATION_RESEND_COUNT_MIN, Math.floor(numeric))
  );
}

function formatAutoStepDelayInputValue(value) {
  const normalized = normalizeAutoStepDelaySeconds(value);
  return normalized === null ? '' : String(normalized);
}

function formatRegistrationStageWaitInputValue(value) {
  return String(normalizeRegistrationStageWaitSeconds(value));
}

function formatSignupIdentityRedirectTimeoutInputValue(value) {
  return String(normalizeSignupIdentityRedirectTimeoutSeconds(value));
}

function formatAuthContentScriptRecoveryTimeoutInputValue(value) {
  return String(normalizeAuthContentScriptRecoveryTimeoutSeconds(value));
}

function formatSignupVerificationReadyTimeoutInputValue(value) {
  return String(normalizeSignupVerificationReadyTimeoutSeconds(value));
}

function formatSignupVerificationReadyMaxRoundsInputValue(value) {
  return String(normalizeSignupVerificationReadyMaxRounds(value));
}

function formatSignupVerificationReadyRoundWaitInputValue(value, fallback = DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS) {
  return String(normalizeSignupVerificationReadyRoundWaitSeconds(value, fallback));
}

function formatSignupPhoneVerificationSubmitResultMaxRoundsInputValue(value) {
  return String(normalizeSignupPhoneVerificationSubmitResultMaxRounds(value));
}

function formatSignupPhoneVerificationSubmitResultRoundWaitInputValue(value) {
  return String(normalizeSignupPhoneVerificationSubmitResultRoundWaitSeconds(value));
}

function formatStep5ProfileSubmitResultMaxRoundsInputValue(value) {
  return String(normalizeStep5ProfileSubmitResultMaxRounds(value));
}

function formatStep5ProfileSubmitResultRoundWaitInputValue(value) {
  return String(normalizeStep5ProfileSubmitResultRoundWaitSeconds(value));
}

function normalizeCustomEmailPoolEntries(value = '') {
  const source = Array.isArray(value)
    ? value
    : String(value || '').split(/[\r\n,，;；]+/);

  return source
    .map((item) => String(item || '').trim().toLowerCase())
    .filter((item) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item));
}

function normalizeCustomEmailPoolEntryEmail(value = '') {
  return String(value || '').trim().toLowerCase();
}

function createCustomEmailPoolEntryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `custom-pool-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeCustomEmailPoolEntryObjects(value = []) {
  const source = Array.isArray(value) ? value : [];
  const seenEmails = new Set();
  const entries = [];

  for (const rawEntry of source) {
    const asObject = rawEntry && typeof rawEntry === 'object'
      ? rawEntry
      : { email: rawEntry };
    const email = normalizeCustomEmailPoolEntryEmail(asObject.email || '');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      continue;
    }
    if (seenEmails.has(email)) {
      continue;
    }
    seenEmails.add(email);
    entries.push({
      id: String(asObject.id || createCustomEmailPoolEntryId()),
      email,
      enabled: asObject.enabled !== undefined ? Boolean(asObject.enabled) : true,
      used: Boolean(asObject.used),
      note: String(asObject.note || '').trim(),
      lastUsedAt: Number.isFinite(Number(asObject.lastUsedAt)) ? Number(asObject.lastUsedAt) : 0,
    });
  }

  return entries;
}

function getNormalizedCustomEmailPoolEntriesState() {
  const entries = (typeof customEmailPoolEntriesState !== 'undefined' && Array.isArray(customEmailPoolEntriesState))
    ? customEmailPoolEntriesState
    : [];
  return normalizeCustomEmailPoolEntryObjects(entries);
}

function getActiveCustomEmailPoolEmails(entries = getNormalizedCustomEmailPoolEntriesState()) {
  return normalizeCustomEmailPoolEntryObjects(entries)
    .filter((entry) => entry.enabled && !entry.used)
    .map((entry) => entry.email);
}

function setCustomEmailPoolEntriesState(entries = [], options = {}) {
  const { syncInput = true } = options;
  customEmailPoolEntriesState = normalizeCustomEmailPoolEntryObjects(entries);
  if (syncInput && inputCustomEmailPool) {
    inputCustomEmailPool.value = getActiveCustomEmailPoolEmails(customEmailPoolEntriesState).join('\n');
  }
}

function restoreCustomEmailPoolEntriesFromState(state = {}) {
  const rawEntries = Array.isArray(state?.customEmailPoolEntries)
    ? state.customEmailPoolEntries
    : [];
  if (rawEntries.length > 0) {
    return normalizeCustomEmailPoolEntryObjects(rawEntries);
  }
  return normalizeCustomEmailPoolEntries(state?.customEmailPool).map((email) => ({
    id: createCustomEmailPoolEntryId(),
    email,
    enabled: true,
    used: false,
    note: '',
    lastUsedAt: 0,
  }));
}

function usesCustomEmailPoolGenerator(provider = selectMailProvider.value) {
  const providerUsesYydsMail = typeof isYydsMailProvider === 'function'
    ? isYydsMailProvider(provider)
    : String(provider || '').trim().toLowerCase() === 'yyds-mail';
  return !isCustomMailProvider(provider)
    && !isLuckmailProvider(provider)
    && !providerUsesYydsMail
    && getSelectedEmailGenerator() === CUSTOM_EMAIL_POOL_GENERATOR;
}

function getCustomMailProviderPoolSize() {
  return normalizeCustomEmailPoolEntries(inputCustomMailProviderPool?.value).length;
}

function usesCustomMailProviderPool(provider = selectMailProvider.value) {
  return isCustomMailProvider(provider) && getCustomMailProviderPoolSize() > 0;
}

function getCustomEmailPoolSize() {
  if (typeof customEmailPoolEntriesState !== 'undefined' && Array.isArray(customEmailPoolEntriesState)) {
    const activeEntries = getActiveCustomEmailPoolEmails(customEmailPoolEntriesState);
    if (activeEntries.length > 0 || customEmailPoolEntriesState.length > 0) {
      return activeEntries.length;
    }
  }
  return normalizeCustomEmailPoolEntries(inputCustomEmailPool?.value).length;
}

function getLockedRunCountFromEmailPool(provider = selectMailProvider.value) {
  if (usesCustomMailProviderPool(provider)) {
    return getCustomMailProviderPoolSize();
  }
  if (usesCustomEmailPoolGenerator(provider)) {
    return getCustomEmailPoolSize();
  }
  return 0;
}

function shouldLockRunCountToEmailPool(provider = (typeof selectMailProvider !== 'undefined' ? selectMailProvider?.value : undefined)) {
  return getLockedRunCountFromEmailPool(provider) > 0;
}

function syncRunCountFromCustomEmailPool() {
  if (!usesCustomEmailPoolGenerator()) {
    return;
  }
  inputRunCount.value = String(getCustomEmailPoolSize());
}

function syncRunCountFromCustomMailProviderPool() {
  if (!usesCustomMailProviderPool()) {
    return;
  }
  inputRunCount.value = String(getCustomMailProviderPoolSize());
}

function syncRunCountFromConfiguredEmailPool(provider = selectMailProvider.value) {
  const poolSize = getLockedRunCountFromEmailPool(provider);
  if (poolSize > 0) {
    inputRunCount.value = String(poolSize);
  }
}

function getRunCountValue() {
  const lockedRunCount = typeof getLockedRunCountFromEmailPool === 'function'
    ? getLockedRunCountFromEmailPool()
    : 0;
  if (lockedRunCount > 0) {
    return lockedRunCount;
  }
  return Math.max(1, parseInt(inputRunCount.value, 10) || 1);
}

function updateFallbackThreadIntervalInputState() {
  if (!inputAutoSkipFailuresThreadIntervalMinutes) {
    return;
  }

  inputAutoSkipFailuresThreadIntervalMinutes.disabled = Boolean(inputAutoSkipFailures.disabled);
}

function updateAutoDelayInputState() {
  const scheduled = isAutoRunScheduledPhase();
  inputAutoDelayEnabled.disabled = scheduled;
  inputAutoDelayMinutes.disabled = scheduled || !inputAutoDelayEnabled.checked;
}

function formatCountdown(remainingMs) {
  const totalSeconds = Math.max(0, Math.ceil(remainingMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatScheduleTime(timestamp) {
  return new Date(timestamp).toLocaleString('zh-CN', {
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function stopScheduledCountdownTicker() {
  clearInterval(scheduledCountdownTimer);
  scheduledCountdownTimer = null;
}

function getActiveAutoRunCountdown() {
  if (isAutoRunScheduledPhase() && Number.isFinite(currentAutoRun.scheduledAt)) {
    return {
      at: currentAutoRun.scheduledAt,
      title: '已计划自动运行',
      note: `计划于 ${formatScheduleTime(currentAutoRun.scheduledAt)} 开始`,
      tone: 'scheduled',
    };
  }

  if (currentAutoRun.phase !== 'waiting_interval') {
    return null;
  }

  if (!Number.isFinite(currentAutoRun.countdownAt)) {
    return null;
  }

  return {
    at: currentAutoRun.countdownAt,
    title: currentAutoRun.countdownTitle || '等待中',
    note: currentAutoRun.countdownNote || '',
    tone: 'running',
  };
}

function renderScheduledAutoRunInfo() {
  if (!autoScheduleBar) {
    return;
  }

  const countdown = getActiveAutoRunCountdown();
  if (!countdown) {
    autoScheduleBar.style.display = 'none';
    return;
  }

  const remainingMs = countdown.at - Date.now();
  autoScheduleBar.style.display = 'flex';
  if (btnAutoRunNow) {
    btnAutoRunNow.hidden = false;
    btnAutoRunNow.textContent = currentAutoRun.phase === 'waiting_interval' ? '立即继续' : '立即开始';
  }
  if (btnAutoCancelSchedule) {
    btnAutoCancelSchedule.hidden = true;
  }
  autoScheduleTitle.textContent = countdown.title;
  autoScheduleMeta.textContent = remainingMs > 0
    ? `${countdown.note ? `${countdown.note}，` : ''}剩余 ${formatCountdown(remainingMs)}`
    : '倒计时即将结束，正在准备继续...';
  return;
}

function syncScheduledCountdownTicker() {
  renderScheduledAutoRunInfo();
  if (getActiveAutoRunCountdown()) {
    if (scheduledCountdownTimer) {
      return;
    }

    scheduledCountdownTimer = setInterval(() => {
      renderScheduledAutoRunInfo();
      updateStatusDisplay(latestState);
    }, 1000);
    return;
  }

  stopScheduledCountdownTicker();
  return;
}

function setDefaultAutoRunButton() {
  btnAutoRun.disabled = false;
  inputRunCount.disabled = shouldLockRunCountToEmailPool();
  btnAutoRun.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg> 自动';
}

function normalizeCloudflareDomainValue(value = '') {
  let normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  normalized = normalized.replace(/^@+/, '');
  normalized = normalized.replace(/^https?:\/\//, '');
  normalized = normalized.replace(/\/.*$/, '');
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(normalized)) {
    return '';
  }
  return normalized;
}

function normalizeCloudflareDomains(values = []) {
  const seen = new Set();
  const domains = [];
  for (const value of Array.isArray(values) ? values : []) {
    const normalized = normalizeCloudflareDomainValue(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    domains.push(normalized);
  }
  return domains;
}

function normalizeCloudflareTempEmailBaseUrlValue(value = '') {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(raw) ? raw : `https://${raw}`;
  try {
    const parsed = new URL(candidate);
    parsed.hash = '';
    parsed.search = '';
    const pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${pathname}`;
  } catch {
    return '';
  }
}

function normalizeCloudflareTempEmailReceiveMailboxValue(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '';
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized) ? normalized : '';
}

function normalizeCloudflareTempEmailDomainValue(value = '') {
  return normalizeCloudflareDomainValue(value);
}

function normalizeCloudflareTempEmailDomains(values = []) {
  const seen = new Set();
  const domains = [];
  for (const value of Array.isArray(values) ? values : []) {
    const normalized = normalizeCloudflareTempEmailDomainValue(value);
    if (!normalized || seen.has(normalized)) continue;
    seen.add(normalized);
    domains.push(normalized);
  }
  return domains;
}

function normalizeCloudMailBaseUrlValue(value = '') {
  return normalizeCloudflareTempEmailBaseUrlValue(value);
}

function normalizeCloudMailReceiveMailboxValue(value = '') {
  return normalizeCloudflareTempEmailReceiveMailboxValue(value);
}

function normalizeCloudMailDomainValue(value = '') {
  return normalizeCloudflareDomainValue(value);
}

function getCloudflareDomainsFromState() {
  const domains = normalizeCloudflareDomains(latestState?.cloudflareDomains || []);
  const activeDomain = normalizeCloudflareDomainValue(latestState?.cloudflareDomain || '');
  if (activeDomain && !domains.includes(activeDomain)) {
    domains.unshift(activeDomain);
  }
  return { domains, activeDomain: activeDomain || domains[0] || '' };
}

function getCloudflareTempEmailDomainsFromState() {
  const domains = normalizeCloudflareTempEmailDomains(latestState?.cloudflareTempEmailDomains || []);
  const activeDomain = normalizeCloudflareTempEmailDomainValue(latestState?.cloudflareTempEmailDomain || '');
  if (activeDomain && !domains.includes(activeDomain)) {
    domains.unshift(activeDomain);
  }
  return { domains, activeDomain: activeDomain || domains[0] || '' };
}

function renderCloudflareDomainOptions(preferredDomain = '') {
  const preferred = normalizeCloudflareDomainValue(preferredDomain);
  const { domains, activeDomain } = getCloudflareDomainsFromState();
  const selected = preferred || activeDomain;
  cfDomainPicker.render(domains, domains.includes(selected) ? selected : domains[0] || '');
}

function renderCloudflareTempEmailDomainOptions(preferredDomain = '') {
  const preferred = normalizeCloudflareTempEmailDomainValue(preferredDomain);
  const { domains, activeDomain } = getCloudflareTempEmailDomainsFromState();
  const selected = preferred || activeDomain;
  tempEmailDomainPicker.render(domains, domains.includes(selected) ? selected : domains[0] || '');
}

function setCloudflareDomainEditMode(editing, options = {}) {
  const { clearInput = false } = options;
  cloudflareDomainEditMode = Boolean(editing);
  cfDomainPicker.setVisible(!cloudflareDomainEditMode);
  inputCfDomain.style.display = cloudflareDomainEditMode ? '' : 'none';
  btnCfDomainMode.textContent = cloudflareDomainEditMode ? '保存' : '添加';
  if (cloudflareDomainEditMode) {
    if (clearInput) {
      inputCfDomain.value = '';
    }
    inputCfDomain.focus();
  } else if (clearInput) {
    inputCfDomain.value = '';
  }
}

function setCloudflareTempEmailDomainEditMode(editing, options = {}) {
  const { clearInput = false } = options;
  cloudflareTempEmailDomainEditMode = false;
  tempEmailDomainPicker.setVisible(true);
  inputTempEmailDomain.style.display = 'none';
  btnTempEmailDomainMode.textContent = '更新';
  if (clearInput) {
    inputTempEmailDomain.value = '';
  }
}

function applyCloudflareTempEmailSettingsState(state = {}) {
  inputTempEmailBaseUrl.value = state?.cloudflareTempEmailBaseUrl || '';
  inputTempEmailAdminAuth.value = state?.cloudflareTempEmailAdminAuth || '';
  inputTempEmailCustomAuth.value = state?.cloudflareTempEmailCustomAuth || '';
  inputTempEmailReceiveMailbox.value = state?.cloudflareTempEmailReceiveMailbox || '';
  setCloudflareTempEmailLookupMode(state?.cloudflareTempEmailLookupMode);
  if (inputTempEmailUseRandomSubdomain) {
    inputTempEmailUseRandomSubdomain.checked = Boolean(state?.cloudflareTempEmailUseRandomSubdomain);
  }
  renderCloudflareTempEmailDomainOptions(state?.cloudflareTempEmailDomain || '');
  setCloudflareTempEmailDomainEditMode(false, { clearInput: true });
}

function applyCloudMailSettingsState(state = {}) {
  if (inputCloudMailBaseUrl) {
    inputCloudMailBaseUrl.value = state?.cloudMailBaseUrl || '';
  }
  if (inputCloudMailAdminEmail) {
    inputCloudMailAdminEmail.value = state?.cloudMailAdminEmail || '';
  }
  if (inputCloudMailAdminPassword) {
    inputCloudMailAdminPassword.value = state?.cloudMailAdminPassword || '';
  }
  if (inputCloudMailReceiveMailbox) {
    inputCloudMailReceiveMailbox.value = state?.cloudMailReceiveMailbox || '';
  }
  if (inputCloudMailDomain) {
    inputCloudMailDomain.value = state?.cloudMailDomain || '';
  }
}

function applyYydsMailSettingsState(state = {}) {
  const normalizeYydsBaseUrlValue = typeof normalizeYydsMailBaseUrl === 'function'
    ? normalizeYydsMailBaseUrl
    : ((value) => String(value || '').trim() || 'https://maliapi.215.im/v1');
  if (inputYydsMailApiKey) {
    inputYydsMailApiKey.value = state?.yydsMailApiKey || '';
  }
  if (inputYydsMailBaseUrl) {
    inputYydsMailBaseUrl.value = normalizeYydsBaseUrlValue(state?.yydsMailBaseUrl);
  }
}

function collectSettingsPayload() {
  const defaultGpcHelperApiUrl = typeof DEFAULT_GPC_HELPER_API_URL !== 'undefined'
    ? DEFAULT_GPC_HELPER_API_URL
    : 'https://gpc.qlhazycoder.top';
  const builtinPlusCheckoutCloudConversionApiUrl = typeof BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_URL !== 'undefined'
    ? BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_URL
    : 'https://gujumpgate.zg.fyi/api/checkout';
  const builtinPlusCheckoutCloudConversionApiKey = typeof BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_KEY !== 'undefined'
    ? BUILTIN_PLUS_CHECKOUT_CLOUD_CONVERSION_API_KEY
    : '2KwVxE6f0ABH002JLkoQJ9ReRf4_d01y';
  const defaultSmsVerificationNumberBaseUrl = typeof DEFAULT_SMS_VERIFICATION_NUMBER_BASE_URL !== 'undefined'
    ? DEFAULT_SMS_VERIFICATION_NUMBER_BASE_URL
    : 'https://sms-verification-number.com/stubs/handler_api';
  const defaultSmsVerificationNumberServiceCode = typeof DEFAULT_SMS_VERIFICATION_NUMBER_SERVICE_CODE !== 'undefined'
    ? DEFAULT_SMS_VERIFICATION_NUMBER_SERVICE_CODE
    : 'dr';
  const defaultPlusCheckoutCreatePreWaitSeconds = typeof DEFAULT_PLUS_CHECKOUT_CREATE_PRE_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_PLUS_CHECKOUT_CREATE_PRE_WAIT_SECONDS
    : 10;
  const defaultPlusCheckoutOpenStableWaitSeconds = typeof DEFAULT_PLUS_CHECKOUT_OPEN_STABLE_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_PLUS_CHECKOUT_OPEN_STABLE_WAIT_SECONDS
    : 20;
  const defaultPlusHostedCheckoutCardPreWaitSeconds = typeof DEFAULT_PLUS_HOSTED_CHECKOUT_CARD_PRE_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_PLUS_HOSTED_CHECKOUT_CARD_PRE_WAIT_SECONDS
    : 10;
  const defaultHostedCheckoutVerificationPopupDelaySeconds = typeof DEFAULT_HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_SECONDS !== 'undefined'
    ? DEFAULT_HOSTED_CHECKOUT_VERIFICATION_POPUP_DELAY_SECONDS
    : 20;
  const defaultHostedCheckoutSmsPoolMaxUses = typeof DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES !== 'undefined'
    ? DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES
    : 3;
  const normalizeHostedCheckoutVerificationPopupDelaySecondsInput = typeof normalizeHostedCheckoutVerificationPopupDelaySeconds === 'function'
    ? normalizeHostedCheckoutVerificationPopupDelaySeconds
    : ((value) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(60, Math.max(0, Math.floor(numeric))) : defaultHostedCheckoutVerificationPopupDelaySeconds;
    });
  const normalizeHostedCheckoutSmsPoolMaxUsesInput = typeof normalizeHostedCheckoutSmsPoolMaxUsesValue === 'function'
    ? normalizeHostedCheckoutSmsPoolMaxUsesValue
    : ((value, fallback = defaultHostedCheckoutSmsPoolMaxUses) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(99, Math.max(1, Math.floor(numeric))) : fallback;
    });
  const normalizeHostedCheckoutSmsSourceInput = typeof normalizeHostedCheckoutSmsSourceValue === 'function'
    ? normalizeHostedCheckoutSmsSourceValue
    : ((value = '') => (String(value || '').trim().toLowerCase().replace(/-/g, '_') === 'phone_sms' ? 'phone_sms' : 'fixed_pool'));
  const normalizePayPalProfileCountryCodeInput = typeof normalizePayPalProfileCountryCodeValue === 'function'
    ? normalizePayPalProfileCountryCodeValue
    : ((value, fallback = 'US') => {
      if (value === undefined || value === null) return fallback || 'US';
      const normalized = String(value).trim().toUpperCase().replace(/[^A-Z]/g, '');
      if (!String(value).trim()) return '';
      return ['US', 'JP', 'BR'].includes(normalized) ? normalized : (fallback || 'US');
    });
  const normalizeHostedCheckoutResendWaitSecondsInput = typeof normalizeHostedCheckoutResendWaitSecondsValue === 'function'
    ? normalizeHostedCheckoutResendWaitSecondsValue
    : ((value, fallback = 20) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(300, Math.max(0, Math.floor(numeric))) : fallback;
    });
  const normalizeHostedCheckoutVerificationPollAttemptsInput = typeof normalizeHostedCheckoutVerificationPollAttemptsValue === 'function'
    ? normalizeHostedCheckoutVerificationPollAttemptsValue
    : ((value, fallback = 6) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(60, Math.max(1, Math.floor(numeric))) : fallback;
    });
  const normalizeHostedCheckoutVerificationPollIntervalSecondsInput = typeof normalizeHostedCheckoutVerificationPollIntervalSecondsValue === 'function'
    ? normalizeHostedCheckoutVerificationPollIntervalSecondsValue
    : ((value, fallback = 5) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(60, Math.max(1, Math.floor(numeric))) : fallback;
    });
  const normalizeHostedCheckoutVerificationResendMaxAttemptsInput = typeof normalizeHostedCheckoutVerificationResendMaxAttemptsValue === 'function'
    ? normalizeHostedCheckoutVerificationResendMaxAttemptsValue
    : ((value, fallback = 1) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isFinite(numeric) ? Math.min(10, Math.max(0, Math.floor(numeric))) : fallback;
    });
  const normalizeHostedCheckoutVerificationUrlInput = typeof normalizeHostedCheckoutVerificationUrlValue === 'function'
    ? normalizeHostedCheckoutVerificationUrlValue
    : ((value = '') => String(value || '').trim());
  const normalizeHostedCheckoutPhoneInput = typeof normalizeHostedCheckoutPhoneValue === 'function'
    ? normalizeHostedCheckoutPhoneValue
    : ((value = '') => String(value || '').trim().replace(/\D+/g, ''));
  const normalizeHostedCheckoutSmsPoolTextInput = typeof normalizeHostedCheckoutSmsPoolTextValue === 'function'
    ? normalizeHostedCheckoutSmsPoolTextValue
    : ((value = '') => String(value || '').replace(/\r/g, '').trim());
  const parseHostedCheckoutSmsPoolEntriesInput = typeof parseHostedCheckoutSmsPoolEntries === 'function'
    ? parseHostedCheckoutSmsPoolEntries
    : ((value = '') => normalizeHostedCheckoutSmsPoolTextInput(value)
      .split('\n')
      .map((line) => String(line || '').trim())
      .filter(Boolean)
      .map((line) => {
        const [phone = '', verificationUrl = ''] = line.split('----');
        return { key: line, phone, verificationUrl };
      }));
  const normalizeHostedCheckoutCurrentSmsEntryInput = typeof normalizeHostedCheckoutCurrentSmsEntryValue === 'function'
    ? normalizeHostedCheckoutCurrentSmsEntryValue
    : ((entry = null) => (entry && typeof entry === 'object' && !Array.isArray(entry) ? entry : null));
  const normalizeYydsBaseUrlValue = typeof normalizeYydsMailBaseUrl === 'function'
    ? normalizeYydsMailBaseUrl
    : ((value) => String(value || '').trim() || 'https://maliapi.215.im/v1');
  const normalizePlusCheckoutConversionProxyInput = typeof normalizePlusCheckoutConversionProxyUrlValue === 'function'
    ? normalizePlusCheckoutConversionProxyUrlValue
    : ((value) => String(value || '').trim());
  const normalizePlusCheckoutConversionProxySourceInput = typeof normalizePlusCheckoutConversionProxySourceValue === 'function'
    ? normalizePlusCheckoutConversionProxySourceValue
    : ((value) => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      if (normalized === 'ip_proxy') {
        return 'ip_proxy';
      }
      return 'manual';
    });
  const normalizePlusCheckoutConversionProxy711RegionInput = typeof normalizePlusCheckoutConversionProxy711RegionValue === 'function'
    ? normalizePlusCheckoutConversionProxy711RegionValue
    : ((value) => {
      const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      return normalized.length === 2 ? normalized : '';
    });
  const normalizeBrowserFingerprintLevelInput = typeof normalizeBrowserFingerprintLevel === 'function'
    ? normalizeBrowserFingerprintLevel
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'basic' || normalized === 'enhanced') {
        return normalized;
      }
      return 'standard';
    });
  const normalizeBrowserFingerprintLanguageInput = typeof normalizeBrowserFingerprintLanguage === 'function'
    ? normalizeBrowserFingerprintLanguage
    : ((value = '') => {
      const normalized = String(value || '').trim().replace(/_/g, '-').toLowerCase();
      if (normalized === 'random' || normalized === 'auto') {
        return 'random';
      }
      return normalized === 'en' || normalized === 'en-us' ? 'en-US' : 'zh-CN';
    });
  const { domains, activeDomain } = getCloudflareDomainsFromState();
  const selectedCloudflareDomain = normalizeCloudflareDomainValue(
    !cloudflareDomainEditMode ? selectCfDomain.value : activeDomain
  ) || activeDomain;
  const { domains: tempEmailDomains, activeDomain: tempEmailActiveDomain } = getCloudflareTempEmailDomainsFromState();
  const selectedCloudflareTempEmailDomain = normalizeCloudflareTempEmailDomainValue(
    !cloudflareTempEmailDomainEditMode ? selectTempEmailDomain.value : tempEmailActiveDomain
  ) || tempEmailActiveDomain;
  const normalizeCloudMailBaseUrlInput = typeof normalizeCloudMailBaseUrlValue === 'function'
    ? normalizeCloudMailBaseUrlValue
    : normalizeCloudflareTempEmailBaseUrlValue;
  const normalizeCloudMailReceiveMailboxInput = typeof normalizeCloudMailReceiveMailboxValue === 'function'
    ? normalizeCloudMailReceiveMailboxValue
    : normalizeCloudflareTempEmailReceiveMailboxValue;
  const normalizeCloudMailDomainInput = typeof normalizeCloudMailDomainValue === 'function'
    ? normalizeCloudMailDomainValue
    : normalizeCloudflareTempEmailDomainValue;
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined'
    ? DEFAULT_ACTIVE_FLOW_ID
    : 'openai';
  const activeFlowId = typeof getSelectedFlowId === 'function'
    ? getSelectedFlowId(latestState)
    : (() => {
      const normalized = String(
        latestState?.activeFlowId || latestState?.flowId || defaultFlowId
      ).trim().toLowerCase();
      if (normalized === 'codex') {
        return defaultFlowId;
      }
      return normalized || defaultFlowId;
    })();
  const accountContributionEnabled = typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState, activeFlowId)
    : (activeFlowId === defaultFlowId && Boolean(latestState?.accountContributionEnabled));
  const icloudFetchModeRawValue = typeof selectIcloudFetchMode !== 'undefined'
    ? String(selectIcloudFetchMode?.value || '')
    : '';
  const icloudTargetMailboxTypeValue = typeof selectIcloudTargetMailboxType !== 'undefined'
    ? selectIcloudTargetMailboxType?.value
    : '';
  const icloudForwardMailProviderValue = typeof selectIcloudForwardMailProvider !== 'undefined'
    ? selectIcloudForwardMailProvider?.value
    : '';
  const normalizedIcloudTargetMailboxType = normalizeIcloudTargetMailboxType(icloudTargetMailboxTypeValue);
  const normalizedIcloudForwardMailProvider = normalizeIcloudForwardMailProvider(icloudForwardMailProviderValue);
  const normalizeGpcOtpChannelSafe = typeof normalizeGpcOtpChannelValue === 'function'
    ? normalizeGpcOtpChannelValue
    : ((value = '') => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      if (rootScope.GoPayUtils?.normalizeGpcOtpChannel) {
        return rootScope.GoPayUtils.normalizeGpcOtpChannel(value);
      }
      return String(value || '').trim().toLowerCase() === 'sms' ? 'sms' : 'whatsapp';
    });
  const normalizeGpcLocalSmsHelperBaseUrlSafe = typeof normalizeGpcLocalSmsHelperBaseUrlValue === 'function'
    ? normalizeGpcLocalSmsHelperBaseUrlValue
    : ((value = '') => {
      const fallback = 'http://127.0.0.1:18767';
      const rawValue = String(value || fallback).trim();
      try {
        const parsed = new URL(rawValue);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return fallback;
        }
        const endpointPath = parsed.pathname.replace(/\/+$/g, '') || '/';
        if (['/otp', '/latest-otp', '/health'].includes(endpointPath)) {
          parsed.pathname = '';
          parsed.search = '';
          parsed.hash = '';
        }
        return parsed.toString().replace(/\/$/, '');
      } catch {
        return fallback;
      }
    });
  const getSelectedIpProxyEnabledSafe = typeof getSelectedIpProxyEnabled === 'function'
    ? getSelectedIpProxyEnabled
    : (() => false);
  const defaultIpProxyService = typeof DEFAULT_IP_PROXY_SERVICE !== 'undefined'
    ? DEFAULT_IP_PROXY_SERVICE
    : '711proxy';
  const currentIpProxyStateOverride = typeof buildCurrentIpProxyActionStateOverride === 'function'
    ? buildCurrentIpProxyActionStateOverride(latestState)
    : {};
  const selectedIpProxyService = typeof normalizeIpProxyService === 'function'
    ? normalizeIpProxyService(
      currentIpProxyStateOverride?.ipProxyService
      || latestState?.ipProxyService
      || defaultIpProxyService
    )
    : String(currentIpProxyStateOverride?.ipProxyService || latestState?.ipProxyService || defaultIpProxyService).trim().toLowerCase() || defaultIpProxyService;
  const currentIpProxyServiceProfile = (
    currentIpProxyStateOverride?.ipProxyServiceProfiles?.[selectedIpProxyService]
    || {}
  );
  const normalizeIpProxyAutoSyncIntervalMinutesSafe = (value = '', fallback = 15) => {
    const rawValue = String(value ?? '').trim();
    if (!rawValue) {
      return Math.max(1, Math.min(1440, Number(fallback) || 15));
    }
    const numeric = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(numeric)) {
      return Math.max(1, Math.min(1440, Number(fallback) || 15));
    }
    return Math.max(1, Math.min(1440, numeric));
  };
  const mail2925UseAccountPool = typeof inputMail2925UseAccountPool !== 'undefined'
    ? Boolean(inputMail2925UseAccountPool?.checked)
    : Boolean(latestState?.mail2925UseAccountPool);
  const phoneSmsProviderValue = typeof selectPhoneSmsProvider !== 'undefined' && selectPhoneSmsProvider
    ? normalizePhoneSmsProvider(selectPhoneSmsProvider.value)
    : normalizePhoneSmsProvider(latestState?.phoneSmsProvider);
  const phoneSmsProviderOrderValue = typeof getSelectedPhoneSmsProviderOrder === 'function'
    ? getSelectedPhoneSmsProviderOrder()
    : (typeof normalizePhoneSmsProviderOrderValue === 'function'
      ? normalizePhoneSmsProviderOrderValue(latestState?.phoneSmsProviderOrder || [], [])
      : []);
  const currentPhoneSmsApiKeyValue = typeof inputHeroSmsApiKey !== 'undefined' && inputHeroSmsApiKey
    ? (inputHeroSmsApiKey.value || '')
    : '';
  const phoneSmsProviderSmsBower = typeof PHONE_SMS_PROVIDER_SMSBOWER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSBOWER
    : 'smsbower';
  const phoneSmsProviderSmsVerificationNumber = typeof PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER
    : 'sms-verification-number';
  const phoneSmsProviderGrizzlySms = typeof PHONE_SMS_PROVIDER_GRIZZLYSMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_GRIZZLYSMS
    : 'grizzlysms';
  const phoneSmsProviderSmsPool = typeof PHONE_SMS_PROVIDER_SMSPOOL !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSPOOL
    : 'smspool';
  const heroSmsApiKeyValue = phoneSmsProviderValue === PHONE_SMS_PROVIDER_HERO_SMS
    ? currentPhoneSmsApiKeyValue
    : String(latestState?.heroSmsApiKey || '');
  const fiveSimApiKeyValue = typeof inputFiveSimApiKey !== 'undefined' && inputFiveSimApiKey
    ? String(inputFiveSimApiKey.value || '')
    : String(latestState?.fiveSimApiKey || '');
  const nexSmsApiKeyValue = typeof inputNexSmsApiKey !== 'undefined' && inputNexSmsApiKey
    ? String(inputNexSmsApiKey.value || '')
    : String(latestState?.nexSmsApiKey || '');
  const smsBowerApiKeyValue = phoneSmsProviderValue === phoneSmsProviderSmsBower
    ? currentPhoneSmsApiKeyValue
    : String(latestState?.smsBowerApiKey || '');
  const smsVerificationNumberApiKeyValue = phoneSmsProviderValue === phoneSmsProviderSmsVerificationNumber
    ? currentPhoneSmsApiKeyValue
    : String(latestState?.smsVerificationNumberApiKey || '');
  const grizzlySmsApiKeyValue = phoneSmsProviderValue === phoneSmsProviderGrizzlySms
    ? currentPhoneSmsApiKeyValue
    : String(latestState?.grizzlySmsApiKey || '');
  const smsPoolApiKeyValue = phoneSmsProviderValue === phoneSmsProviderSmsPool
    ? currentPhoneSmsApiKeyValue
    : String(latestState?.smsPoolApiKey || '');
  const defaultHeroSmsReuseEnabled = typeof DEFAULT_HERO_SMS_REUSE_ENABLED !== 'undefined'
    ? DEFAULT_HERO_SMS_REUSE_ENABLED
    : true;
  const defaultPhoneCodeWaitSeconds = typeof DEFAULT_PHONE_CODE_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_PHONE_CODE_WAIT_SECONDS
    : 60;
  const defaultPhoneActivationRetryRounds = typeof DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS !== 'undefined'
    ? DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS
    : 2;
  const defaultPhoneActivationTierUpgradeLimit = typeof DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT !== 'undefined'
    ? DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT
    : 1;
  const defaultPhoneCodeTimeoutWindows = typeof DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS !== 'undefined'
    ? DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS
    : 2;
  const defaultPhoneCodePollIntervalSeconds = typeof DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS !== 'undefined'
    ? DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS
    : 5;
  const defaultPhoneCodePollMaxRounds = typeof DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS !== 'undefined'
    ? DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS
    : 12;
  const normalizeSettingsIntegerInput = (value, fallback, min, max) => {
    const fallbackNumeric = Number(fallback);
    const fallbackNumber = Math.min(
      max,
      Math.max(min, Number.isFinite(fallbackNumeric) ? Math.floor(fallbackNumeric) : min)
    );
    const rawValue = String(value ?? '').trim();
    if (!rawValue) {
      return fallbackNumber;
    }

    const numeric = Number(rawValue);
    if (!Number.isFinite(numeric)) {
      return fallbackNumber;
    }

    return Math.min(max, Math.max(min, Math.floor(numeric)));
  };
  const defaultSignupVerificationReadyTimeoutSeconds = typeof DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS !== 'undefined'
    ? DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS
    : 60;
  const defaultSignupVerificationReadyMaxRounds = typeof DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS !== 'undefined'
    ? DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS
    : 5;
  const defaultSignupVerificationReadyRoundWaitSeconds = typeof DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_SIGNUP_VERIFICATION_READY_ROUND_WAIT_SECONDS
    : 12;
  const defaultSignupPhoneVerificationSubmitResultMaxRounds = typeof DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS !== 'undefined'
    ? DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_MAX_ROUNDS
    : 6;
  const defaultSignupPhoneVerificationSubmitResultRoundWaitSeconds = typeof DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_SIGNUP_PHONE_VERIFICATION_SUBMIT_RESULT_ROUND_WAIT_SECONDS
    : 5;
  const defaultStep5ProfileSubmitResultMaxRounds = typeof DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS !== 'undefined'
    ? DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_MAX_ROUNDS
    : 12;
  const defaultStep5ProfileSubmitResultRoundWaitSeconds = typeof DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_STEP5_PROFILE_SUBMIT_RESULT_ROUND_WAIT_SECONDS
    : 10;
  const normalizeSignupVerificationReadyTimeoutSecondsForPayload = typeof normalizeSignupVerificationReadyTimeoutSeconds === 'function'
    ? normalizeSignupVerificationReadyTimeoutSeconds
    : ((value, fallback = defaultSignupVerificationReadyTimeoutSeconds) => (
      normalizeSettingsIntegerInput(value, fallback, 5, 300)
    ));
  const normalizeSignupVerificationReadyMaxRoundsForPayload = typeof normalizeSignupVerificationReadyMaxRounds === 'function'
    ? normalizeSignupVerificationReadyMaxRounds
    : ((value, fallback = defaultSignupVerificationReadyMaxRounds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 20)
    ));
  const normalizeSignupVerificationReadyRoundWaitSecondsForPayload = typeof normalizeSignupVerificationReadyRoundWaitSeconds === 'function'
    ? normalizeSignupVerificationReadyRoundWaitSeconds
    : ((value, fallback = defaultSignupVerificationReadyRoundWaitSeconds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 300)
    ));
  const normalizeSignupPhoneVerificationSubmitResultMaxRoundsForPayload = typeof normalizeSignupPhoneVerificationSubmitResultMaxRounds === 'function'
    ? normalizeSignupPhoneVerificationSubmitResultMaxRounds
    : ((value, fallback = defaultSignupPhoneVerificationSubmitResultMaxRounds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 60)
    ));
  const normalizeSignupPhoneVerificationSubmitResultRoundWaitSecondsForPayload = typeof normalizeSignupPhoneVerificationSubmitResultRoundWaitSeconds === 'function'
    ? normalizeSignupPhoneVerificationSubmitResultRoundWaitSeconds
    : ((value, fallback = defaultSignupPhoneVerificationSubmitResultRoundWaitSeconds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 120)
    ));
  const normalizeStep5ProfileSubmitResultMaxRoundsForPayload = typeof normalizeStep5ProfileSubmitResultMaxRounds === 'function'
    ? normalizeStep5ProfileSubmitResultMaxRounds
    : ((value, fallback = defaultStep5ProfileSubmitResultMaxRounds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 60)
    ));
  const normalizeStep5ProfileSubmitResultRoundWaitSecondsForPayload = typeof normalizeStep5ProfileSubmitResultRoundWaitSeconds === 'function'
    ? normalizeStep5ProfileSubmitResultRoundWaitSeconds
    : ((value, fallback = defaultStep5ProfileSubmitResultRoundWaitSeconds) => (
      normalizeSettingsIntegerInput(value, fallback, 1, 120)
    ));
  const normalizeRegistrationStageWaitSecondsForPayload = typeof normalizeRegistrationStageWaitSeconds === 'function'
    ? normalizeRegistrationStageWaitSeconds
    : ((value, fallback = 30) => normalizeSettingsIntegerInput(value, fallback, 0, 600));
  const normalizeSignupIdentityRedirectTimeoutSecondsForPayload = typeof normalizeSignupIdentityRedirectTimeoutSeconds === 'function'
    ? normalizeSignupIdentityRedirectTimeoutSeconds
    : ((value, fallback = 45) => normalizeSettingsIntegerInput(value, fallback, 5, 300));
  const normalizeAuthContentScriptRecoveryTimeoutSecondsForPayload = typeof normalizeAuthContentScriptRecoveryTimeoutSeconds === 'function'
    ? normalizeAuthContentScriptRecoveryTimeoutSeconds
    : ((value, fallback = 30) => normalizeSettingsIntegerInput(value, fallback, 5, 180));
  const defaultRegistrationStageWaitSeconds = typeof DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS !== 'undefined'
    ? DEFAULT_REGISTRATION_STAGE_WAIT_SECONDS
    : 30;
  const defaultSignupIdentityRedirectTimeoutSeconds = typeof DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS !== 'undefined'
    ? DEFAULT_SIGNUP_IDENTITY_REDIRECT_TIMEOUT_SECONDS
    : 45;
  const defaultAuthContentScriptRecoveryTimeoutSeconds = typeof DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS !== 'undefined'
    ? DEFAULT_AUTH_CONTENT_SCRIPT_RECOVERY_TIMEOUT_SECONDS
    : 30;
  const selectedSignupMethod = typeof getSelectedSignupMethod === 'function'
    ? getSelectedSignupMethod()
    : (
      (typeof normalizeSignupMethod === 'function'
        ? normalizeSignupMethod(latestState?.signupMethod)
        : (String(latestState?.signupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email'))
    );
  const sub2apiReloginEnabled = typeof inputSub2ApiReloginEnabled !== 'undefined' && inputSub2ApiReloginEnabled
    ? Boolean(inputSub2ApiReloginEnabled.checked)
    : Boolean(latestState?.sub2apiReloginEnabled);
  const normalizeSub2ApiReloginAccountPoolTextSafe = typeof normalizeSub2ApiReloginAccountPoolText === 'function'
    ? normalizeSub2ApiReloginAccountPoolText
    : ((value = '') => String(value || '').trim());
  const sub2apiReloginAccountPoolText = normalizeSub2ApiReloginAccountPoolTextSafe(
    typeof inputSub2ApiReloginAccountPool !== 'undefined' && inputSub2ApiReloginAccountPool
      ? inputSub2ApiReloginAccountPool.value
      : latestState?.sub2apiReloginAccountPoolText || ''
  );
  const sub2apiReloginAccountPoolUsage = typeof getSub2ApiReloginPoolUsage === 'function'
    ? getSub2ApiReloginPoolUsage()
    : (latestState?.sub2apiReloginAccountPoolUsage || {});
  const phoneSignupReuseLocked = typeof isPhoneSignupReuseLocked === 'function'
    ? isPhoneSignupReuseLocked(latestState, { signupMethod: selectedSignupMethod })
    : selectedSignupMethod === 'phone';
  const phoneSmsReuseEnabledValue = phoneSignupReuseLocked
    ? getStoredPhoneSmsReuseEnabled(latestState)
    : typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled
    ? normalizeHeroSmsReuseEnabledValue(inputHeroSmsReuseEnabled.checked)
    : normalizeHeroSmsReuseEnabledValue(
      latestState?.phoneSmsReuseEnabled,
      latestState?.heroSmsReuseEnabled
    );
  const heroSmsReuseEnabledValue = phoneSmsReuseEnabledValue;
  const freePhoneReuseEnabledValue = phoneSignupReuseLocked
    ? getStoredFreePhoneReuseEnabled(latestState)
    : typeof inputFreePhoneReuseEnabled !== 'undefined' && inputFreePhoneReuseEnabled
    ? Boolean(inputFreePhoneReuseEnabled.checked)
    : Boolean(latestState?.freePhoneReuseEnabled);
  const freePhoneReuseAutoEnabledValue = phoneSignupReuseLocked
    ? getStoredFreePhoneReuseAutoEnabled(latestState)
    : typeof inputFreePhoneReuseAutoEnabled !== 'undefined' && inputFreePhoneReuseAutoEnabled
    ? Boolean(inputFreePhoneReuseAutoEnabled.checked)
    : Boolean(latestState?.freePhoneReuseAutoEnabled);
  const defaultHeroSmsAcquirePriority = typeof DEFAULT_HERO_SMS_ACQUIRE_PRIORITY !== 'undefined'
    ? DEFAULT_HERO_SMS_ACQUIRE_PRIORITY
    : (typeof HERO_SMS_ACQUIRE_PRIORITY_COUNTRY !== 'undefined' ? HERO_SMS_ACQUIRE_PRIORITY_COUNTRY : 'country');
  const heroSmsAcquirePriorityValue = typeof selectHeroSmsAcquirePriority !== 'undefined' && selectHeroSmsAcquirePriority
    ? normalizeHeroSmsAcquirePriority(selectHeroSmsAcquirePriority.value)
    : normalizeHeroSmsAcquirePriority(
      typeof DEFAULT_HERO_SMS_ACQUIRE_PRIORITY !== 'undefined'
        ? DEFAULT_HERO_SMS_ACQUIRE_PRIORITY
        : 'country'
    );
  const currentPhoneSmsMaxPriceValue = typeof inputHeroSmsMaxPrice !== 'undefined' && inputHeroSmsMaxPrice
    ? normalizePhoneSmsMaxPriceValue(inputHeroSmsMaxPrice.value, phoneSmsProviderValue)
    : '';
  const normalizePhoneSmsMinPriceValueSafe = typeof normalizePhoneSmsMinPriceValue === 'function'
    ? normalizePhoneSmsMinPriceValue
    : ((value = '', provider = phoneSmsProviderValue) => {
      normalizePhoneSmsProvider(provider);
      if (typeof normalizePhoneSmsPriceInputValue === 'function') {
        return normalizePhoneSmsPriceInputValue(value);
      }
      return String(value || '').trim();
    });
  const currentPhoneSmsMinPriceValue = typeof inputHeroSmsMinPrice !== 'undefined' && inputHeroSmsMinPrice
    ? normalizePhoneSmsMinPriceValueSafe(inputHeroSmsMinPrice.value, phoneSmsProviderValue)
    : '';
  const heroSmsMaxPriceValue = phoneSmsProviderValue === PHONE_SMS_PROVIDER_HERO_SMS
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.heroSmsMaxPrice || '', PHONE_SMS_PROVIDER_HERO_SMS);
  const fiveSimMaxPriceValue = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.fiveSimMaxPrice || '', PHONE_SMS_PROVIDER_FIVE_SIM);
  const smsBowerMaxPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsBower
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.smsBowerMaxPrice || '', phoneSmsProviderSmsBower);
  const smsVerificationNumberMaxPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsVerificationNumber
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.smsVerificationNumberMaxPrice || '', phoneSmsProviderSmsVerificationNumber);
  const grizzlySmsMaxPriceValue = phoneSmsProviderValue === phoneSmsProviderGrizzlySms
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.grizzlySmsMaxPrice || '', phoneSmsProviderGrizzlySms);
  const smsPoolMaxPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsPool
    ? currentPhoneSmsMaxPriceValue
    : normalizePhoneSmsMaxPriceValue(latestState?.smsPoolMaxPrice || '', phoneSmsProviderSmsPool);
  const heroSmsMinPriceValue = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? normalizePhoneSmsMinPriceValueSafe(latestState?.heroSmsMinPrice || '', PHONE_SMS_PROVIDER_HERO_SMS)
    : currentPhoneSmsMinPriceValue;
  const fiveSimMinPriceValue = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? currentPhoneSmsMinPriceValue
    : normalizePhoneSmsMinPriceValueSafe(latestState?.fiveSimMinPrice || '', PHONE_SMS_PROVIDER_FIVE_SIM);
  const smsBowerMinPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsBower
    ? currentPhoneSmsMinPriceValue
    : normalizePhoneSmsMinPriceValueSafe(latestState?.smsBowerMinPrice || '', phoneSmsProviderSmsBower);
  const smsVerificationNumberMinPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsVerificationNumber
    ? currentPhoneSmsMinPriceValue
    : normalizePhoneSmsMinPriceValueSafe(latestState?.smsVerificationNumberMinPrice || '', phoneSmsProviderSmsVerificationNumber);
  const grizzlySmsMinPriceValue = phoneSmsProviderValue === phoneSmsProviderGrizzlySms
    ? currentPhoneSmsMinPriceValue
    : normalizePhoneSmsMinPriceValueSafe(latestState?.grizzlySmsMinPrice || '', phoneSmsProviderGrizzlySms);
  const smsPoolMinPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsPool
    ? currentPhoneSmsMinPriceValue
    : normalizePhoneSmsMinPriceValueSafe(latestState?.smsPoolMinPrice || '', phoneSmsProviderSmsPool);
  const defaultFiveSimProduct = typeof DEFAULT_FIVE_SIM_PRODUCT !== 'undefined'
    ? DEFAULT_FIVE_SIM_PRODUCT
    : 'openai';
  const defaultNexSmsServiceCode = typeof DEFAULT_NEX_SMS_SERVICE_CODE !== 'undefined'
    ? DEFAULT_NEX_SMS_SERVICE_CODE
    : 'ot';
  const normalizeFiveSimProductForPayload = typeof normalizeFiveSimProductValue === 'function'
    ? normalizeFiveSimProductValue
    : ((value = '') => String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || defaultFiveSimProduct);
  const normalizeNexSmsServiceCodeForPayload = typeof normalizeNexSmsServiceCodeValue === 'function'
    ? normalizeNexSmsServiceCodeValue
    : ((value = '') => String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || defaultNexSmsServiceCode);
  const normalizeFiveSimCountryOrderForPayload = typeof normalizeFiveSimCountryOrderValue === 'function'
    ? normalizeFiveSimCountryOrderValue
    : ((value = []) => (Array.isArray(value) ? value : [])
      .map((entry) => normalizeFiveSimCountryId(entry, ''))
      .filter(Boolean));
  const normalizeNexSmsCountryIdForPayload = typeof normalizeNexSmsCountryIdValue === 'function'
    ? normalizeNexSmsCountryIdValue
    : ((value, fallback = -1) => {
      const normalized = Math.floor(Number(value));
      return Number.isFinite(normalized) && normalized >= 0 ? normalized : fallback;
    });
  const normalizeNexSmsCountryOrderForPayload = typeof normalizeNexSmsCountryOrderValue === 'function'
    ? normalizeNexSmsCountryOrderValue
    : ((value = []) => (Array.isArray(value) ? value : [])
      .map((entry) => normalizeNexSmsCountryIdForPayload(entry, -1))
      .filter((entry) => entry >= 0));
  const phoneSmsProviderNexsms = typeof PHONE_SMS_PROVIDER_NEXSMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_NEXSMS
    : 'nexsms';
  const defaultNexSmsCountryOrder = typeof DEFAULT_NEX_SMS_COUNTRY_ORDER !== 'undefined'
    ? DEFAULT_NEX_SMS_COUNTRY_ORDER
    : [1];
  const fiveSimOperatorValue = typeof inputFiveSimOperator !== 'undefined' && inputFiveSimOperator
    ? normalizeFiveSimOperator(inputFiveSimOperator.value || latestState?.fiveSimOperator)
    : normalizeFiveSimOperator(latestState?.fiveSimOperator);
  const fiveSimProductValue = typeof inputFiveSimProduct !== 'undefined' && inputFiveSimProduct
    ? normalizeFiveSimProductForPayload(inputFiveSimProduct.value || latestState?.fiveSimProduct)
    : normalizeFiveSimProductForPayload(latestState?.fiveSimProduct || defaultFiveSimProduct);
  const nexSmsServiceCodeValue = typeof inputNexSmsServiceCode !== 'undefined' && inputNexSmsServiceCode
    ? normalizeNexSmsServiceCodeForPayload(inputNexSmsServiceCode.value || latestState?.nexSmsServiceCode)
    : normalizeNexSmsServiceCodeForPayload(latestState?.nexSmsServiceCode || defaultNexSmsServiceCode);
  const heroSmsPreferredPriceValue = typeof inputHeroSmsPreferredPrice !== 'undefined' && inputHeroSmsPreferredPrice
    ? normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice.value)
    : normalizeHeroSmsMaxPriceValue(latestState?.heroSmsPreferredPrice || '');
  const smsBowerPreferredPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsBower
    ? heroSmsPreferredPriceValue
    : normalizeHeroSmsMaxPriceValue(latestState?.smsBowerPreferredPrice || '');
  const smsVerificationNumberPreferredPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsVerificationNumber
    ? heroSmsPreferredPriceValue
    : normalizeHeroSmsMaxPriceValue(latestState?.smsVerificationNumberPreferredPrice || '');
  const grizzlySmsPreferredPriceValue = phoneSmsProviderValue === phoneSmsProviderGrizzlySms
    ? heroSmsPreferredPriceValue
    : normalizeHeroSmsMaxPriceValue(latestState?.grizzlySmsPreferredPrice || '');
  const smsPoolPreferredPriceValue = phoneSmsProviderValue === phoneSmsProviderSmsPool
    ? heroSmsPreferredPriceValue
    : normalizeHeroSmsMaxPriceValue(latestState?.smsPoolPreferredPrice || '');
  const phonePreferredActivationValue = phoneSignupReuseLocked
    ? (latestState?.phonePreferredActivation ? { ...latestState.phonePreferredActivation } : null)
    : typeof getSelectedPhonePreferredActivation === 'function'
    ? getSelectedPhonePreferredActivation()
    : null;
  const phoneVerificationReplacementLimitValue = typeof inputPhoneReplacementLimit !== 'undefined' && inputPhoneReplacementLimit
    ? normalizePhoneVerificationReplacementLimit(
      inputPhoneReplacementLimit.value,
      latestState?.phoneVerificationReplacementLimit
    )
    : DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT;
  const phoneActivationRetryRoundsValue = typeof inputPhoneActivationRetryRounds !== 'undefined' && inputPhoneActivationRetryRounds
    ? normalizePhoneActivationRetryRoundsValue(
      inputPhoneActivationRetryRounds.value,
      latestState?.phoneActivationRetryRounds ?? latestState?.heroSmsActivationRetryRounds
    )
    : defaultPhoneActivationRetryRounds;
  const phoneActivationTierUpgradeLimitValue = typeof inputPhoneActivationTierUpgradeLimit !== 'undefined' && inputPhoneActivationTierUpgradeLimit
    ? normalizePhoneActivationTierUpgradeLimit(
      inputPhoneActivationTierUpgradeLimit.value,
      latestState?.phoneActivationTierUpgradeLimit
    )
    : defaultPhoneActivationTierUpgradeLimit;
  const phoneCodeWaitSecondsValue = typeof inputPhoneCodeWaitSeconds !== 'undefined' && inputPhoneCodeWaitSeconds
    ? normalizePhoneCodeWaitSecondsValue(
      inputPhoneCodeWaitSeconds.value,
      latestState?.phoneCodeWaitSeconds
    )
    : defaultPhoneCodeWaitSeconds;
  const phoneCodeTimeoutWindowsValue = typeof inputPhoneCodeTimeoutWindows !== 'undefined' && inputPhoneCodeTimeoutWindows
    ? normalizePhoneCodeTimeoutWindowsValue(
      inputPhoneCodeTimeoutWindows.value,
      latestState?.phoneCodeTimeoutWindows
    )
    : defaultPhoneCodeTimeoutWindows;
  const phoneCodePollIntervalSecondsValue = typeof inputPhoneCodePollIntervalSeconds !== 'undefined' && inputPhoneCodePollIntervalSeconds
    ? normalizePhoneCodePollIntervalSecondsValue(
      inputPhoneCodePollIntervalSeconds.value,
      latestState?.phoneCodePollIntervalSeconds
    )
    : defaultPhoneCodePollIntervalSeconds;
  const phoneCodePollMaxRoundsValue = typeof inputPhoneCodePollMaxRounds !== 'undefined' && inputPhoneCodePollMaxRounds
    ? normalizePhoneCodePollMaxRoundsValue(
      inputPhoneCodePollMaxRounds.value,
      latestState?.phoneCodePollMaxRounds
    )
    : defaultPhoneCodePollMaxRounds;
  const signupPhoneVerificationSubmitResultMaxRoundsValue = typeof inputSignupPhoneVerificationSubmitResultMaxRounds !== 'undefined' && inputSignupPhoneVerificationSubmitResultMaxRounds
    ? normalizeSignupPhoneVerificationSubmitResultMaxRoundsForPayload(
      inputSignupPhoneVerificationSubmitResultMaxRounds.value,
      latestState?.signupPhoneVerificationSubmitResultMaxRounds
    )
    : defaultSignupPhoneVerificationSubmitResultMaxRounds;
  const signupPhoneVerificationSubmitResultRoundWaitSecondsValue = typeof inputSignupPhoneVerificationSubmitResultRoundWaitSeconds !== 'undefined' && inputSignupPhoneVerificationSubmitResultRoundWaitSeconds
    ? normalizeSignupPhoneVerificationSubmitResultRoundWaitSecondsForPayload(
      inputSignupPhoneVerificationSubmitResultRoundWaitSeconds.value,
      latestState?.signupPhoneVerificationSubmitResultRoundWaitSeconds
    )
    : defaultSignupPhoneVerificationSubmitResultRoundWaitSeconds;
  const signupVerificationReadyMaxRoundsValue = normalizeSignupVerificationReadyMaxRoundsForPayload(
    typeof inputSignupVerificationReadyMaxRounds !== 'undefined' && inputSignupVerificationReadyMaxRounds
      ? inputSignupVerificationReadyMaxRounds.value
      : undefined,
    latestState?.signupVerificationReadyMaxRounds ?? defaultSignupVerificationReadyMaxRounds
  );
  const legacySignupVerificationReadyTimeoutSeconds = normalizeSignupVerificationReadyTimeoutSecondsForPayload(
    latestState?.signupVerificationReadyTimeoutSeconds,
    defaultSignupVerificationReadyTimeoutSeconds
  );
  const signupVerificationReadyRoundWaitFallback = Math.max(
    1,
    Math.ceil(legacySignupVerificationReadyTimeoutSeconds / Math.max(1, signupVerificationReadyMaxRoundsValue))
  );
  const signupVerificationReadyRoundWaitSecondsValue = normalizeSignupVerificationReadyRoundWaitSecondsForPayload(
    typeof inputSignupVerificationReadyRoundWaitSeconds !== 'undefined' && inputSignupVerificationReadyRoundWaitSeconds
      ? inputSignupVerificationReadyRoundWaitSeconds.value
      : undefined,
    latestState?.signupVerificationReadyRoundWaitSeconds ?? signupVerificationReadyRoundWaitFallback
  );
  const signupVerificationReadyTimeoutSecondsValue = normalizeSignupVerificationReadyTimeoutSecondsForPayload(
    signupVerificationReadyMaxRoundsValue * signupVerificationReadyRoundWaitSecondsValue,
    defaultSignupVerificationReadyTimeoutSeconds
  );
  const step5ProfileSubmitResultMaxRoundsValue = normalizeStep5ProfileSubmitResultMaxRoundsForPayload(
    typeof inputStep5ProfileSubmitResultMaxRounds !== 'undefined' && inputStep5ProfileSubmitResultMaxRounds
      ? inputStep5ProfileSubmitResultMaxRounds.value
      : undefined,
    latestState?.step5ProfileSubmitResultMaxRounds ?? defaultStep5ProfileSubmitResultMaxRounds
  );
  const step5ProfileSubmitResultRoundWaitSecondsValue = normalizeStep5ProfileSubmitResultRoundWaitSecondsForPayload(
    typeof inputStep5ProfileSubmitResultRoundWaitSeconds !== 'undefined' && inputStep5ProfileSubmitResultRoundWaitSeconds
      ? inputStep5ProfileSubmitResultRoundWaitSeconds.value
      : undefined,
    latestState?.step5ProfileSubmitResultRoundWaitSeconds ?? defaultStep5ProfileSubmitResultRoundWaitSeconds
  );
  const selectedPhoneSmsCountry = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? ((typeof getSelectedFiveSimCountries === 'function' ? getSelectedFiveSimCountries()[0] : null)
      || { id: DEFAULT_FIVE_SIM_COUNTRY_ID, code: DEFAULT_FIVE_SIM_COUNTRY_ID, label: DEFAULT_FIVE_SIM_COUNTRY_LABEL })
    : (phoneSmsProviderValue === phoneSmsProviderNexsms
      ? ((typeof getSelectedNexSmsCountries === 'function' ? getSelectedNexSmsCountries()[0] : null)
        || { id: defaultNexSmsCountryOrder[0], label: `Country #${defaultNexSmsCountryOrder[0]}` })
      : (typeof getSelectedHeroSmsCountryOption === 'function'
        ? getSelectedHeroSmsCountryOption()
        : {
          id: typeof DEFAULT_HERO_SMS_COUNTRY_ID !== 'undefined' ? DEFAULT_HERO_SMS_COUNTRY_ID : 52,
          label: typeof DEFAULT_HERO_SMS_COUNTRY_LABEL !== 'undefined' ? DEFAULT_HERO_SMS_COUNTRY_LABEL : 'Thailand',
        }));
  const heroSmsCountry = phoneSmsProviderValue === PHONE_SMS_PROVIDER_HERO_SMS
    ? selectedPhoneSmsCountry
    : {
      id: normalizeHeroSmsCountryId(latestState?.heroSmsCountryId),
      label: normalizeHeroSmsCountryLabel(latestState?.heroSmsCountryLabel),
    };
  const fiveSimCountry = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? selectedPhoneSmsCountry
    : {
      id: normalizeFiveSimCountryId(latestState?.fiveSimCountryId),
      label: normalizeFiveSimCountryLabel(latestState?.fiveSimCountryLabel),
    };
  const normalizedCustomEmailPool = typeof getActiveCustomEmailPoolEmails === 'function'
    ? getActiveCustomEmailPoolEmails()
    : (typeof normalizeCustomEmailPoolEntries === 'function'
      ? normalizeCustomEmailPoolEntries(inputCustomEmailPool?.value)
      : []);
  const normalizedCustomEmailPoolEntries = typeof getNormalizedCustomEmailPoolEntriesState === 'function'
    ? getNormalizedCustomEmailPoolEntriesState()
    : [];
  const selectedPhoneSmsCountryFallback = typeof syncHeroSmsFallbackSelectionOrderFromSelect === 'function'
    ? syncHeroSmsFallbackSelectionOrderFromSelect()
      .filter((country) => String(country.id) !== String(selectedPhoneSmsCountry.id))
    : [];
  const fiveSimCountryOrderValue = typeof getSelectedFiveSimCountries === 'function'
    ? getSelectedFiveSimCountries()
      .map((country) => normalizeFiveSimCountryCode(country.code || country.id, ''))
      .filter(Boolean)
    : normalizeFiveSimCountryOrderForPayload(latestState?.fiveSimCountryOrder || []);
  const nexSmsCountryOrderValue = typeof getSelectedNexSmsCountries === 'function'
    ? getSelectedNexSmsCountries()
      .map((country) => normalizeNexSmsCountryIdForPayload(country.id, -1))
      .filter((countryId) => countryId >= 0)
    : normalizeNexSmsCountryOrderForPayload(latestState?.nexSmsCountryOrder || []);
  const heroSmsCountryFallback = phoneSmsProviderValue === PHONE_SMS_PROVIDER_HERO_SMS
    ? selectedPhoneSmsCountryFallback
    : normalizeHeroSmsCountryFallbackList(latestState?.heroSmsCountryFallback || []);
  const heroSmsOperatorByCountry = phoneSmsProviderValue === PHONE_SMS_PROVIDER_HERO_SMS
    ? (typeof getHeroSmsOperatorByCountryPayload === 'function'
      ? getHeroSmsOperatorByCountryPayload()
      : {})
    : (typeof normalizeHeroSmsOperatorByCountryMap === 'function'
      ? normalizeHeroSmsOperatorByCountryMap(latestState?.heroSmsOperatorByCountry || {})
      : (latestState?.heroSmsOperatorByCountry || {}));
  const fiveSimCountryFallback = phoneSmsProviderValue === PHONE_SMS_PROVIDER_FIVE_SIM
    ? selectedPhoneSmsCountryFallback
    : normalizeFiveSimCountryFallbackList(latestState?.fiveSimCountryFallback || []);
  const payPalAccounts = typeof getPayPalAccounts === 'function'
    ? getPayPalAccounts(latestState)
    : (Array.isArray(latestState?.paypalAccounts) ? latestState.paypalAccounts : []);
  const currentPayPalAccount = typeof getCurrentPayPalAccount === 'function'
    ? getCurrentPayPalAccount(latestState)
    : payPalAccounts.find((account) => account?.id === String(latestState?.currentPayPalAccountId || '').trim()) || null;
  const normalizePanelModeSafe = typeof normalizePanelMode === 'function'
    ? normalizePanelMode
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      return normalized === 'sub2api' || normalized === 'codex2api' ? normalized : 'cpa';
    });
  const rawPanelMode = normalizePanelModeSafe(selectPanelMode?.value || latestState?.panelMode || 'cpa');
  const selectedTargetId = typeof getSelectedTargetId === 'function'
    ? getSelectedTargetId(activeFlowId)
    : (activeFlowId === defaultFlowId
      ? rawPanelMode
      : String(selectPanelMode?.value || latestState?.kiroTargetId || 'kiro-rs').trim().toLowerCase() || 'kiro-rs');
  const capabilityActiveFlowId = sub2apiReloginEnabled ? defaultFlowId : activeFlowId;
  const capabilityTargetId = sub2apiReloginEnabled ? 'sub2api' : selectedTargetId;
  const capabilityPanelMode = sub2apiReloginEnabled ? 'sub2api' : rawPanelMode;
  const capabilitySignupMethod = sub2apiReloginEnabled ? SIGNUP_METHOD_PHONE : selectedSignupMethod;
  const rawPlusModeEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  const rawPhonePlusModeEnabled = typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
    ? Boolean(inputPhonePlusModeEnabled.checked)
    : Boolean(latestState?.phonePlusModeEnabled);
  const requestedPlusAccountAccessStrategy = typeof getRequestedPlusAccountAccessStrategy === 'function'
    ? getRequestedPlusAccountAccessStrategy(latestState)
    : normalizePlusAccountAccessStrategy(latestState?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY);
  const rawPhoneVerificationEnabled = Boolean(inputPhoneVerificationEnabled?.checked);
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      activeFlowId: capabilityActiveFlowId,
      targetId: capabilityTargetId,
      panelMode: capabilityPanelMode,
      signupMethod: capabilitySignupMethod,
      state: {
        ...(latestState || {}),
        activeFlowId: capabilityActiveFlowId,
        ...(capabilityActiveFlowId === defaultFlowId
          ? { panelMode: capabilityPanelMode, openaiIntegrationTargetId: capabilityPanelMode }
          : { kiroTargetId: capabilityTargetId }),
        plusModeEnabled: rawPlusModeEnabled,
        phonePlusModeEnabled: rawPhonePlusModeEnabled,
        plusAccountAccessStrategy: requestedPlusAccountAccessStrategy,
        phoneVerificationEnabled: rawPhoneVerificationEnabled,
        signupMethod: capabilitySignupMethod,
        sub2apiReloginEnabled,
      },
    })
    : (() => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
        defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
      }) || null;
      return registry?.resolveSidepanelCapabilities
        ? registry.resolveSidepanelCapabilities({
          activeFlowId: capabilityActiveFlowId,
          panelMode: capabilityPanelMode,
          targetId: capabilityTargetId,
          signupMethod: capabilitySignupMethod,
          state: {
            ...(latestState || {}),
            activeFlowId: capabilityActiveFlowId,
            ...(capabilityActiveFlowId === defaultFlowId
              ? { panelMode: capabilityPanelMode, openaiIntegrationTargetId: capabilityPanelMode }
              : { kiroTargetId: capabilityTargetId }),
            plusModeEnabled: rawPlusModeEnabled,
            phonePlusModeEnabled: rawPhonePlusModeEnabled,
            plusAccountAccessStrategy: requestedPlusAccountAccessStrategy,
            phoneVerificationEnabled: rawPhoneVerificationEnabled,
            signupMethod: capabilitySignupMethod,
            sub2apiReloginEnabled,
          },
        })
        : null;
    })();
  const effectivePanelMode = capabilityState?.effectivePanelMode || capabilityState?.panelMode || rawPanelMode;
  const effectiveTargetId = capabilityState?.effectiveTargetId || selectedTargetId;
  const effectivePlusModeEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.plusModeEnabled)
    : (rawPlusModeEnabled && !rawPhonePlusModeEnabled);
  const effectivePhonePlusModeEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.phonePlusModeEnabled)
    : rawPhonePlusModeEnabled;
  const effectivePhoneVerificationEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.phoneVerificationEnabled)
    : (rawPhonePlusModeEnabled ? true : rawPhoneVerificationEnabled);
  const effectiveSignupMethod = capabilityState?.effectiveSignupMethod || selectedSignupMethod;
  const payloadActiveFlowId = sub2apiReloginEnabled ? defaultFlowId : activeFlowId;
  const payloadPanelMode = sub2apiReloginEnabled ? 'sub2api' : effectivePanelMode;
  const payloadTargetId = sub2apiReloginEnabled ? 'sub2api' : effectiveTargetId;
  const payloadPlusModeEnabled = sub2apiReloginEnabled ? false : effectivePlusModeEnabled;
  const payloadPhonePlusModeEnabled = sub2apiReloginEnabled ? false : effectivePhonePlusModeEnabled;
  const payloadPhoneVerificationEnabled = sub2apiReloginEnabled ? false : effectivePhoneVerificationEnabled;
  const payloadSignupMethod = sub2apiReloginEnabled ? SIGNUP_METHOD_PHONE : effectiveSignupMethod;
  const payloadPlusAccountAccessStrategy = sub2apiReloginEnabled
    ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY
    : (effectivePhonePlusModeEnabled
      ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY
      : requestedPlusAccountAccessStrategy);
  const plusPaymentMethod = getSelectedPlusPaymentMethod();
  const normalizeGpcHelperPhoneModeSafe = typeof normalizeGpcHelperPhoneModeValue === 'function'
    ? normalizeGpcHelperPhoneModeValue
    : ((value = '') => String(value || '').trim().toLowerCase() === 'auto' || String(value || '').trim().toLowerCase() === 'builtin' ? 'auto' : 'manual');
  const selectedGpcPhoneMode = normalizeGpcHelperPhoneModeSafe(
    typeof selectGpcHelperPhoneMode !== 'undefined' && selectGpcHelperPhoneMode
      ? selectGpcHelperPhoneMode.value
      : (latestState?.gopayHelperPhoneMode || 'manual')
  );
  const effectiveGpcPhoneMode = selectedGpcPhoneMode;
  const selectedGpcOtpChannel = normalizeGpcOtpChannelSafe(
    typeof selectGpcHelperOtpChannel !== 'undefined' && selectGpcHelperOtpChannel
      ? selectGpcHelperOtpChannel.value
      : (latestState?.gopayHelperOtpChannel || 'whatsapp')
  );
  const selectedGpcLocalSmsHelperEnabled = effectiveGpcPhoneMode === 'auto' ? false : Boolean(
    typeof inputGpcHelperLocalSmsEnabled !== 'undefined' && inputGpcHelperLocalSmsEnabled
      ? inputGpcHelperLocalSmsEnabled.checked
      : latestState?.gopayHelperLocalSmsHelperEnabled
  );
  const selectedSub2ApiGroupName = String(inputSub2ApiGroup.value || '').trim();
  const sub2apiGroupNames = [];
  const seenSub2ApiGroupNames = new Set();
  const appendSub2ApiGroupNames = (value) => {
    if (Array.isArray(value)) {
      value.forEach(appendSub2ApiGroupNames);
      return;
    }
    String(value || '')
      .split(/[\r\n,，、]+/)
      .map((name) => name.trim())
      .filter(Boolean)
      .forEach((name) => {
        const key = name.toLowerCase();
        if (!key || seenSub2ApiGroupNames.has(key)) {
          return;
        }
        seenSub2ApiGroupNames.add(key);
        sub2apiGroupNames.push(name);
      });
  };
  [
    latestState?.sub2apiGroupNames,
    latestState?.sub2apiGroupName,
    selectedSub2ApiGroupName,
  ].forEach(appendSub2ApiGroupNames);
  if (sub2apiGroupNames.length === 0) {
    appendSub2ApiGroupNames(['codex', 'openai-plus']);
  }
  const sub2apiAccountPriorityNormalizer = typeof normalizeSub2ApiAccountPriorityValue === 'function'
    ? normalizeSub2ApiAccountPriorityValue
    : ((value) => {
      const numeric = Number(String(value ?? '').trim());
      return Number.isSafeInteger(numeric) && numeric >= 1 ? numeric : 1;
    });
  const flowRegistryApi = typeof getFlowRegistry === 'function' ? getFlowRegistry() : null;
  const defaultKiroRsUrl = String(flowRegistryApi?.DEFAULT_KIRO_RS_URL || '').trim();
  const normalizeKiroTargetIdSafe = typeof normalizeTargetIdForFlow === 'function'
    ? normalizeTargetIdForFlow
    : ((_flowId, targetId = '', fallback = 'kiro-rs') => {
      const normalized = String(targetId || '').trim().toLowerCase();
      return normalized || String(fallback || '').trim().toLowerCase() || 'kiro-rs';
    });
  const currentKiroRsUrlValue = typeof inputKiroRsUrl !== 'undefined' && inputKiroRsUrl
    ? String(inputKiroRsUrl.value ?? '').trim()
    : null;
  const currentKiroRsKeyValue = typeof inputKiroRsKey !== 'undefined' && inputKiroRsKey
    ? String(inputKiroRsKey.value ?? '').trim()
    : null;
  const normalizeHostedCheckoutDelaySecondsSafe = typeof normalizePlusHostedCheckoutOauthDelaySeconds === 'function'
    ? normalizePlusHostedCheckoutOauthDelaySeconds
    : ((value) => {
      const numeric = Number(String(value ?? '').trim());
      if (!Number.isFinite(numeric)) {
        return 3;
      }
      return Math.min(120, Math.max(0, Math.floor(numeric)));
    });
  return {
    activeFlowId: payloadActiveFlowId,
    ...(accountContributionEnabled ? {} : {
      ...(payloadActiveFlowId === defaultFlowId
        ? {
          panelMode: payloadPanelMode,
          openaiIntegrationTargetId: payloadPanelMode,
        }
        : {}),
    }),
    kiroTargetId: normalizeKiroTargetIdSafe(
      'kiro',
      payloadActiveFlowId === 'kiro'
        ? payloadTargetId
        : (latestState?.kiroTargetId || 'kiro-rs'),
      'kiro-rs'
    ),
    kiroRsUrl: currentKiroRsUrlValue !== null
      ? (currentKiroRsUrlValue || defaultKiroRsUrl)
      : (String(latestState?.kiroRsUrl || defaultKiroRsUrl).trim() || defaultKiroRsUrl),
    kiroRsKey: currentKiroRsKeyValue !== null
      ? currentKiroRsKeyValue
      : String(latestState?.kiroRsKey || '').trim(),
    vpsUrl: inputVpsUrl.value.trim(),
    vpsPassword: inputVpsPassword.value,
    localCpaStep9Mode: getSelectedLocalCpaStep9Mode(),
    sub2apiUrl: inputSub2ApiUrl.value.trim(),
    sub2apiEmail: inputSub2ApiEmail.value.trim(),
    sub2apiPassword: inputSub2ApiPassword.value,
    sub2apiGroupName: selectedSub2ApiGroupName,
    sub2apiGroupNames,
    sub2apiAccountPriority: sub2apiAccountPriorityNormalizer(
      typeof inputSub2ApiAccountPriority !== 'undefined' && inputSub2ApiAccountPriority
        ? inputSub2ApiAccountPriority.value
        : latestState?.sub2apiAccountPriority
    ),
    sub2apiDefaultProxyName: sub2apiReloginEnabled ? '' : inputSub2ApiDefaultProxy.value.trim(),
    sub2apiReloginEnabled,
    sub2apiReloginAccountPoolText,
    sub2apiReloginAccountPoolUsage,
    sub2apiReloginCurrentAccount: latestState?.sub2apiReloginCurrentAccount || null,
    ipProxyEnabled: sub2apiReloginEnabled ? false : getSelectedIpProxyEnabledSafe(),
    ipProxyService: selectedIpProxyService,
    ipProxyMode: currentIpProxyServiceProfile.mode,
    ipProxyApiUrl: currentIpProxyServiceProfile.apiUrl,
    ipProxyApiHost: currentIpProxyStateOverride.ipProxyApiHost,
    ipProxyApiCount: currentIpProxyStateOverride.ipProxyApiCount,
    ipProxyApiRegion: currentIpProxyServiceProfile.apiRegion,
    ipProxyApiProto: currentIpProxyStateOverride.ipProxyApiProto,
    ipProxyApiStype: currentIpProxyStateOverride.ipProxyApiStype,
    ipProxyApiSplit: currentIpProxyStateOverride.ipProxyApiSplit,
    ipProxyApiZone: currentIpProxyStateOverride.ipProxyApiZone,
    ipProxyApiPtype: currentIpProxyStateOverride.ipProxyApiPtype,
    ipProxyApiSessType: currentIpProxyStateOverride.ipProxyApiSessType,
    ipProxyApiSessTime: currentIpProxyStateOverride.ipProxyApiSessTime,
    ipProxyApiSessAuto: currentIpProxyStateOverride.ipProxyApiSessAuto,
    ipProxyApiRefreshKey: currentIpProxyStateOverride.ipProxyApiRefreshKey,
    ipProxyServiceProfiles: currentIpProxyStateOverride.ipProxyServiceProfiles,
    ipProxyAccountList: currentIpProxyServiceProfile.accountList,
    ipProxyAccountSessionPrefix: currentIpProxyServiceProfile.accountSessionPrefix,
    ipProxyAccountLifeMinutes: currentIpProxyServiceProfile.accountLifeMinutes,
    ipProxyPoolTargetCount: currentIpProxyServiceProfile.poolTargetCount,
    ipProxySwitchIpRoundCount: currentIpProxyServiceProfile.switchIpRoundCount,
    ipProxyAutoRefreshPoolOnExhausted: Boolean(currentIpProxyStateOverride.ipProxyAutoRefreshPoolOnExhausted),
    ipProxyAutoSyncEnabled: Boolean(currentIpProxyStateOverride.ipProxyAutoSyncEnabled),
    ipProxyAutoSyncIntervalMinutes: normalizeIpProxyAutoSyncIntervalMinutesSafe(
      currentIpProxyStateOverride.ipProxyAutoSyncIntervalMinutes,
      latestState?.ipProxyAutoSyncIntervalMinutes
    ),
    ipProxyHost: currentIpProxyServiceProfile.host,
    ipProxyPort: Number.parseInt(String(currentIpProxyServiceProfile.port || '').trim(), 10) || 0,
    ipProxyProtocol: currentIpProxyServiceProfile.protocol,
    ipProxyUsername: currentIpProxyServiceProfile.username,
    ipProxyPassword: currentIpProxyServiceProfile.password,
    ipProxyRegion: currentIpProxyServiceProfile.region,
    ipProxyApiRouteMode: currentIpProxyServiceProfile.apiRouteMode,
    ipProxySpecialDomainRouteMode: currentIpProxyServiceProfile.specialDomainRouteMode,
    codex2apiUrl: inputCodex2ApiUrl.value.trim(),
    codex2apiAdminKey: inputCodex2ApiAdminKey.value.trim(),
    browserFingerprintEnabled: typeof inputBrowserFingerprintEnabled !== 'undefined' && inputBrowserFingerprintEnabled
      ? Boolean(inputBrowserFingerprintEnabled.checked)
      : latestState?.browserFingerprintEnabled !== false,
    browserFingerprintLevel: typeof selectBrowserFingerprintLevel !== 'undefined' && selectBrowserFingerprintLevel
      ? normalizeBrowserFingerprintLevelInput(selectBrowserFingerprintLevel.value)
      : normalizeBrowserFingerprintLevelInput(latestState?.browserFingerprintLevel),
    browserFingerprintLanguage: typeof selectBrowserFingerprintLanguage !== 'undefined' && selectBrowserFingerprintLanguage
      ? normalizeBrowserFingerprintLanguageInput(selectBrowserFingerprintLanguage.value)
      : normalizeBrowserFingerprintLanguageInput(latestState?.browserFingerprintLanguage),
    plusModeEnabled: payloadPlusModeEnabled,
    phonePlusModeEnabled: payloadPhonePlusModeEnabled,
    plusPaymentMethod,
    plusHostedCheckoutIsFinalStep: latestState?.plusHostedCheckoutIsFinalStep !== false,
    plusAccountAccessStrategy: payloadPlusAccountAccessStrategy,
    plusCheckoutVerificationFailureStrategy: (() => {
      const normalizeVerificationFailureStrategy = typeof normalizePlusCheckoutVerificationFailureStrategy === 'function'
        ? normalizePlusCheckoutVerificationFailureStrategy
        : ((value = '') => String(value || '').trim().toLowerCase() === 'retry' ? 'retry' : 'continue');
      return typeof selectPlusCheckoutVerificationFailureStrategy !== 'undefined' && selectPlusCheckoutVerificationFailureStrategy
        ? normalizeVerificationFailureStrategy(selectPlusCheckoutVerificationFailureStrategy.value)
        : normalizeVerificationFailureStrategy(latestState?.plusCheckoutVerificationFailureStrategy);
    })(),
    plusCheckAllowedRegions: (() => {
      const normalizeRegions = typeof normalizePlusCheckAllowedRegionsValue === 'function'
        ? normalizePlusCheckAllowedRegionsValue
        : ((value = []) => (Array.isArray(value) ? value : []).map((entry) => String(entry || '').trim().toUpperCase()).filter(Boolean));
      return typeof getSelectedPlusCheckAllowedRegions === 'function'
        ? getSelectedPlusCheckAllowedRegions()
        : normalizeRegions(latestState?.plusCheckAllowedRegions || []);
    })(),
    plusCheckoutCreatePreWaitSeconds: typeof inputPlusCheckoutCreatePreWaitSeconds !== 'undefined' && inputPlusCheckoutCreatePreWaitSeconds
      ? normalizePlusCheckoutCreatePreWaitSeconds(inputPlusCheckoutCreatePreWaitSeconds.value)
      : defaultPlusCheckoutCreatePreWaitSeconds,
    plusCheckoutOpenStableWaitSeconds: typeof inputPlusCheckoutOpenStableWaitSeconds !== 'undefined' && inputPlusCheckoutOpenStableWaitSeconds
      ? normalizePlusCheckoutOpenStableWaitSeconds(inputPlusCheckoutOpenStableWaitSeconds.value)
      : defaultPlusCheckoutOpenStableWaitSeconds,
    plusHostedCheckoutCardPreWaitSeconds: typeof inputPlusHostedCheckoutCardPreWaitSeconds !== 'undefined' && inputPlusHostedCheckoutCardPreWaitSeconds
      ? normalizePlusHostedCheckoutCardPreWaitSeconds(inputPlusHostedCheckoutCardPreWaitSeconds.value)
      : defaultPlusHostedCheckoutCardPreWaitSeconds,
    hostedCheckoutSecurityChallengeEnabled: typeof inputHostedCheckoutSecurityChallengeEnabled !== 'undefined' && inputHostedCheckoutSecurityChallengeEnabled
      ? Boolean(inputHostedCheckoutSecurityChallengeEnabled.checked)
      : Boolean(latestState?.hostedCheckoutSecurityChallengeEnabled),
    hostedCheckoutVerificationPopupDelaySeconds: typeof inputHostedCheckoutVerificationPopupDelaySeconds !== 'undefined' && inputHostedCheckoutVerificationPopupDelaySeconds
      ? normalizeHostedCheckoutVerificationPopupDelaySecondsInput(inputHostedCheckoutVerificationPopupDelaySeconds.value)
      : defaultHostedCheckoutVerificationPopupDelaySeconds,
    hostedCheckoutSmsSource: typeof selectHostedCheckoutSmsSource !== 'undefined' && selectHostedCheckoutSmsSource
      ? normalizeHostedCheckoutSmsSourceInput(selectHostedCheckoutSmsSource.value)
      : normalizeHostedCheckoutSmsSourceInput(latestState?.hostedCheckoutSmsSource),
    hostedCheckoutSmsPoolAutoDisableEnabled: typeof inputHostedCheckoutSmsPoolAutoDisableEnabled !== 'undefined' && inputHostedCheckoutSmsPoolAutoDisableEnabled
      ? Boolean(inputHostedCheckoutSmsPoolAutoDisableEnabled.checked)
      : Boolean(latestState?.hostedCheckoutSmsPoolAutoDisableEnabled),
    hostedCheckoutSmsPoolMaxUses: typeof inputHostedCheckoutSmsPoolMaxUses !== 'undefined' && inputHostedCheckoutSmsPoolMaxUses
      ? (typeof normalizeHostedCheckoutSmsPoolMaxUsesValue === 'function'
        ? normalizeHostedCheckoutSmsPoolMaxUsesValue(inputHostedCheckoutSmsPoolMaxUses.value, latestState?.hostedCheckoutSmsPoolMaxUses ?? defaultHostedCheckoutSmsPoolMaxUses)
        : normalizeHostedCheckoutSmsPoolMaxUsesInput(inputHostedCheckoutSmsPoolMaxUses.value, latestState?.hostedCheckoutSmsPoolMaxUses ?? defaultHostedCheckoutSmsPoolMaxUses))
      : normalizeHostedCheckoutSmsPoolMaxUsesInput(latestState?.hostedCheckoutSmsPoolMaxUses, defaultHostedCheckoutSmsPoolMaxUses),
    hostedCheckoutFirstDirectResendEnabled: typeof inputHostedCheckoutFirstDirectResendEnabled !== 'undefined' && inputHostedCheckoutFirstDirectResendEnabled
      ? Boolean(inputHostedCheckoutFirstDirectResendEnabled.checked)
      : Boolean(latestState?.hostedCheckoutFirstDirectResendEnabled),
    hostedCheckoutFirstResendWaitSeconds: typeof inputHostedCheckoutFirstResendWaitSeconds !== 'undefined' && inputHostedCheckoutFirstResendWaitSeconds
      ? normalizeHostedCheckoutResendWaitSecondsInput(
        inputHostedCheckoutFirstResendWaitSeconds.value,
        latestState?.hostedCheckoutFirstResendWaitSeconds ?? latestState?.hostedCheckoutVerificationPopupDelaySeconds ?? 20
      )
      : normalizeHostedCheckoutResendWaitSecondsInput(latestState?.hostedCheckoutFirstResendWaitSeconds ?? latestState?.hostedCheckoutVerificationPopupDelaySeconds, 20),
    hostedCheckoutSubsequentResendWaitSeconds: typeof inputHostedCheckoutSubsequentResendWaitSeconds !== 'undefined' && inputHostedCheckoutSubsequentResendWaitSeconds
      ? normalizeHostedCheckoutResendWaitSecondsInput(inputHostedCheckoutSubsequentResendWaitSeconds.value, latestState?.hostedCheckoutSubsequentResendWaitSeconds ?? 25)
      : normalizeHostedCheckoutResendWaitSecondsInput(latestState?.hostedCheckoutSubsequentResendWaitSeconds, 25),
    hostedCheckoutVerificationPollAttempts: typeof inputHostedCheckoutVerificationPollAttempts !== 'undefined' && inputHostedCheckoutVerificationPollAttempts
      ? normalizeHostedCheckoutVerificationPollAttemptsInput(inputHostedCheckoutVerificationPollAttempts.value, latestState?.hostedCheckoutVerificationPollAttempts ?? 6)
      : normalizeHostedCheckoutVerificationPollAttemptsInput(latestState?.hostedCheckoutVerificationPollAttempts, 6),
    hostedCheckoutVerificationPollIntervalSeconds: typeof inputHostedCheckoutVerificationPollIntervalSeconds !== 'undefined' && inputHostedCheckoutVerificationPollIntervalSeconds
      ? normalizeHostedCheckoutVerificationPollIntervalSecondsInput(inputHostedCheckoutVerificationPollIntervalSeconds.value, latestState?.hostedCheckoutVerificationPollIntervalSeconds ?? 5)
      : normalizeHostedCheckoutVerificationPollIntervalSecondsInput(latestState?.hostedCheckoutVerificationPollIntervalSeconds, 5),
    hostedCheckoutVerificationResendMaxAttempts: typeof inputHostedCheckoutVerificationResendMaxAttempts !== 'undefined' && inputHostedCheckoutVerificationResendMaxAttempts
      ? normalizeHostedCheckoutVerificationResendMaxAttemptsInput(inputHostedCheckoutVerificationResendMaxAttempts.value, latestState?.hostedCheckoutVerificationResendMaxAttempts ?? 1)
      : normalizeHostedCheckoutVerificationResendMaxAttemptsInput(latestState?.hostedCheckoutVerificationResendMaxAttempts, 1),
    hostedCheckoutVerificationUrl: typeof inputHostedCheckoutVerificationUrl !== 'undefined' && inputHostedCheckoutVerificationUrl
      ? normalizeHostedCheckoutVerificationUrlInput(inputHostedCheckoutVerificationUrl.value)
      : normalizeHostedCheckoutVerificationUrlInput(latestState?.hostedCheckoutVerificationUrl || ''),
    hostedCheckoutPhoneNumber: typeof inputHostedCheckoutPhone !== 'undefined' && inputHostedCheckoutPhone
      ? normalizeHostedCheckoutPhoneInput(inputHostedCheckoutPhone.value)
      : normalizeHostedCheckoutPhoneInput(latestState?.hostedCheckoutPhoneNumber || ''),
    hostedCheckoutSmsPoolText: typeof inputHostedCheckoutSmsPool !== 'undefined' && inputHostedCheckoutSmsPool
      ? normalizeHostedCheckoutSmsPoolTextInput(inputHostedCheckoutSmsPool.value)
      : normalizeHostedCheckoutSmsPoolTextInput(latestState?.hostedCheckoutSmsPoolText || ''),
    hostedCheckoutSmsPoolUsage: latestState?.hostedCheckoutSmsPoolUsage && typeof latestState.hostedCheckoutSmsPoolUsage === 'object'
      ? latestState.hostedCheckoutSmsPoolUsage
      : {},
    chatGptApiSmsPoolText: typeof inputChatGptApiSmsPool !== 'undefined' && inputChatGptApiSmsPool
      ? normalizeHostedCheckoutSmsPoolTextInput(inputChatGptApiSmsPool.value)
      : normalizeHostedCheckoutSmsPoolTextInput(latestState?.chatGptApiSmsPoolText || ''),
    chatGptApiSmsPoolUsage: latestState?.chatGptApiSmsPoolUsage && typeof latestState.chatGptApiSmsPoolUsage === 'object'
      ? latestState.chatGptApiSmsPoolUsage
      : {},
    chatGptApiSmsPoolAutoDisableEnabled: typeof inputChatGptApiSmsPoolAutoDisableEnabled !== 'undefined' && inputChatGptApiSmsPoolAutoDisableEnabled
      ? Boolean(inputChatGptApiSmsPoolAutoDisableEnabled.checked)
      : false,
    hostedCheckoutCurrentSmsEntry: normalizeHostedCheckoutCurrentSmsEntryInput(
      latestState?.hostedCheckoutCurrentSmsEntry || null,
      parseHostedCheckoutSmsPoolEntriesInput(
        typeof inputHostedCheckoutSmsPool !== 'undefined' && inputHostedCheckoutSmsPool
          ? inputHostedCheckoutSmsPool.value
          : latestState?.hostedCheckoutSmsPoolText || ''
      )
    ),
    plusHostedCheckoutOauthDelaySeconds: normalizeHostedCheckoutDelaySecondsSafe(
      typeof inputPlusHostedCheckoutOauthDelaySeconds !== 'undefined' && inputPlusHostedCheckoutOauthDelaySeconds
        ? inputPlusHostedCheckoutOauthDelaySeconds.value
        : latestState?.plusHostedCheckoutOauthDelaySeconds
    ),
    plusCheckoutCloudConversionEnabled: typeof inputPlusCheckoutCloudConversionEnabled !== 'undefined' && inputPlusCheckoutCloudConversionEnabled
      ? Boolean(inputPlusCheckoutCloudConversionEnabled.checked)
      : false,
    plusCheckoutRegionalCheckoutEnabled: typeof inputPlusCheckoutRegionalCheckoutEnabled !== 'undefined' && inputPlusCheckoutRegionalCheckoutEnabled
      ? Boolean(inputPlusCheckoutRegionalCheckoutEnabled.checked)
      : Boolean(latestState?.plusCheckoutRegionalCheckoutEnabled),
    plusCheckoutCloudConversionApiUrl: typeof inputPlusCheckoutCloudConversionApiUrl !== 'undefined' && inputPlusCheckoutCloudConversionApiUrl
      ? normalizePlusCheckoutCloudConversionApiUrlValue(inputPlusCheckoutCloudConversionApiUrl.value)
      : builtinPlusCheckoutCloudConversionApiUrl,
    plusCheckoutCloudConversionApiKey: typeof inputPlusCheckoutCloudConversionApiKey !== 'undefined' && inputPlusCheckoutCloudConversionApiKey
      ? normalizePlusCheckoutCloudConversionApiKeyValue(inputPlusCheckoutCloudConversionApiKey.value)
      : builtinPlusCheckoutCloudConversionApiKey,
    plusCheckoutConversionProxySource: normalizePlusCheckoutConversionProxySourceInput(
      (typeof selectPlusCheckoutConversionProxySource !== 'undefined' && selectPlusCheckoutConversionProxySource
        ? selectPlusCheckoutConversionProxySource.value
        : '')
      || (typeof plusCheckoutConversionProxySourceButtons !== 'undefined' && Array.isArray(plusCheckoutConversionProxySourceButtons)
        ? plusCheckoutConversionProxySourceButtons.find((button) => button.classList.contains('active'))?.dataset.plusCheckoutConversionProxySource
        : '')
      || latestState?.plusCheckoutConversionProxySource
    ),
    plusCheckoutConversionProxyUrl: typeof inputPlusCheckoutConversionProxy !== 'undefined' && inputPlusCheckoutConversionProxy
      ? normalizePlusCheckoutConversionProxyInput(inputPlusCheckoutConversionProxy.value)
      : normalizePlusCheckoutConversionProxyInput(latestState?.plusCheckoutConversionProxyUrl || ''),
    plusCheckoutConversionProxy711Region: typeof inputPlusCheckoutConversionProxy711Region !== 'undefined' && inputPlusCheckoutConversionProxy711Region
      ? normalizePlusCheckoutConversionProxy711RegionInput(inputPlusCheckoutConversionProxy711Region.value)
      : normalizePlusCheckoutConversionProxy711RegionInput(latestState?.plusCheckoutConversionProxy711Region || ''),
    paypalEmail: String(currentPayPalAccount?.email || latestState?.paypalEmail || '').trim(),
    paypalPassword: String(currentPayPalAccount?.password || latestState?.paypalPassword || ''),
    currentPayPalAccountId: String(latestState?.currentPayPalAccountId || '').trim(),
    paypalAccounts: payPalAccounts,
    paypalProfileCountryCode: typeof selectPayPalProfileCountryCode !== 'undefined' && selectPayPalProfileCountryCode
      ? normalizePayPalProfileCountryCodeInput(selectPayPalProfileCountryCode.value)
      : normalizePayPalProfileCountryCodeInput(latestState?.paypalProfileCountryCode),
    paypalGeneratedProfile: typeof getPayPalGeneratedProfile === 'function'
      ? (getPayPalGeneratedProfile(latestState) || {})
      : (
        latestState?.paypalGeneratedProfile
        && typeof latestState.paypalGeneratedProfile === 'object'
        && !Array.isArray(latestState.paypalGeneratedProfile)
          ? latestState.paypalGeneratedProfile
          : {}
      ),
    gopayCountryCode: window.GoPayUtils?.normalizeGoPayCountryCode
      ? window.GoPayUtils.normalizeGoPayCountryCode(typeof selectGoPayCountryCode !== 'undefined' && selectGoPayCountryCode ? selectGoPayCountryCode.value : latestState?.gopayCountryCode)
      : (typeof selectGoPayCountryCode !== 'undefined' && selectGoPayCountryCode
        ? String(selectGoPayCountryCode.value || '+86').trim()
        : String(latestState?.gopayCountryCode || '+86').trim()),
    gopayPhone: window.GoPayUtils?.normalizeGoPayPhone
      ? window.GoPayUtils.normalizeGoPayPhone(typeof inputGoPayPhone !== 'undefined' && inputGoPayPhone ? inputGoPayPhone.value : latestState?.gopayPhone)
      : (typeof inputGoPayPhone !== 'undefined' && inputGoPayPhone
        ? String(inputGoPayPhone.value || '').trim()
        : String(latestState?.gopayPhone || '').trim()),
    gopayOtp: window.GoPayUtils?.normalizeGoPayOtp
      ? window.GoPayUtils.normalizeGoPayOtp(typeof inputGoPayOtp !== 'undefined' && inputGoPayOtp ? inputGoPayOtp.value : latestState?.gopayOtp)
      : (typeof inputGoPayOtp !== 'undefined' && inputGoPayOtp
        ? String(inputGoPayOtp.value || '').trim().replace(/[^\d]/g, '')
        : String(latestState?.gopayOtp || '').trim().replace(/[^\d]/g, '')),
    gopayPin: window.GoPayUtils?.normalizeGoPayPin
      ? window.GoPayUtils.normalizeGoPayPin(typeof inputGoPayPin !== 'undefined' && inputGoPayPin ? inputGoPayPin.value : latestState?.gopayPin)
      : (typeof inputGoPayPin !== 'undefined' && inputGoPayPin
        ? String(inputGoPayPin.value || '')
        : String(latestState?.gopayPin || '')),
    gopayHelperApiUrl: window.GoPayUtils?.normalizeGpcHelperBaseUrl
      ? window.GoPayUtils.normalizeGpcHelperBaseUrl(defaultGpcHelperApiUrl)
      : String(defaultGpcHelperApiUrl).trim().replace(/\/+$/g, ''),
    gopayHelperApiKey: typeof inputGpcHelperCardKey !== 'undefined' && inputGpcHelperCardKey
      ? String(inputGpcHelperCardKey.value || '').trim()
      : String(latestState?.gopayHelperApiKey || latestState?.gopayHelperCardKey || '').trim(),
    gopayHelperCardKey: '',
    gopayHelperPhoneMode: effectiveGpcPhoneMode,
    gopayHelperCountryCode: window.GoPayUtils?.normalizeGoPayCountryCode
      ? window.GoPayUtils.normalizeGoPayCountryCode(typeof selectGpcHelperCountryCode !== 'undefined' && selectGpcHelperCountryCode ? selectGpcHelperCountryCode.value : latestState?.gopayHelperCountryCode)
      : (typeof selectGpcHelperCountryCode !== 'undefined' && selectGpcHelperCountryCode
        ? String(selectGpcHelperCountryCode.value || '+86').trim()
        : String(latestState?.gopayHelperCountryCode || '+86').trim()),
    gopayHelperPhoneNumber: window.GoPayUtils?.normalizeGoPayPhone
      ? window.GoPayUtils.normalizeGoPayPhone(typeof inputGpcHelperPhone !== 'undefined' && inputGpcHelperPhone ? inputGpcHelperPhone.value : latestState?.gopayHelperPhoneNumber)
      : (typeof inputGpcHelperPhone !== 'undefined' && inputGpcHelperPhone
        ? String(inputGpcHelperPhone.value || '').trim()
        : String(latestState?.gopayHelperPhoneNumber || '').trim()),
    gopayHelperPin: window.GoPayUtils?.normalizeGoPayPin
      ? window.GoPayUtils.normalizeGoPayPin(typeof inputGpcHelperPin !== 'undefined' && inputGpcHelperPin ? inputGpcHelperPin.value : latestState?.gopayHelperPin)
      : (typeof inputGpcHelperPin !== 'undefined' && inputGpcHelperPin
        ? String(inputGpcHelperPin.value || '')
        : String(latestState?.gopayHelperPin || '')),
    gopayHelperOtpChannel: selectedGpcOtpChannel,
    gopayHelperLocalSmsHelperEnabled: selectedGpcLocalSmsHelperEnabled,
    gopayHelperLocalSmsHelperUrl: normalizeGpcLocalSmsHelperBaseUrlSafe(
      typeof inputGpcHelperLocalSmsUrl !== 'undefined' && inputGpcHelperLocalSmsUrl
        ? inputGpcHelperLocalSmsUrl.value
        : (latestState?.gopayHelperLocalSmsHelperUrl || '')
    ),
    ...(accountContributionEnabled ? {} : {
      customPassword: inputPassword.value,
    }),
    mailProvider: selectMailProvider.value,
    mail2925Mode: getSelectedMail2925Mode(),
    mail2925UseAccountPool,
    currentMail2925AccountId: String(latestState?.currentMail2925AccountId || '').trim(),
    emailGenerator: selectEmailGenerator.value,
    customMailProviderPool: typeof normalizeCustomEmailPoolEntries === 'function'
      ? normalizeCustomEmailPoolEntries(inputCustomMailProviderPool?.value)
      : [],
    customEmailPool: normalizedCustomEmailPool,
    customEmailPoolEntries: normalizedCustomEmailPoolEntries,
    autoDeleteUsedIcloudAlias: checkboxAutoDeleteIcloud?.checked,
    icloudHostPreference: selectIcloudHostPreference?.value || 'auto',
    icloudTargetMailboxType: normalizedIcloudTargetMailboxType,
    icloudForwardMailProvider: normalizedIcloudForwardMailProvider,
    icloudFetchMode: (icloudFetchModeRawValue.trim().toLowerCase() === 'always_new'
      ? 'always_new'
      : 'reuse_existing'),
    ...(accountContributionEnabled ? {} : {
      accountRunHistoryTextEnabled: true,
      accountRunHistoryHelperBaseUrl: normalizeAccountRunHistoryHelperBaseUrlValue(inputAccountRunHistoryHelperBaseUrl?.value),
    }),
    ...buildManagedAliasBaseEmailPayload(),
    inbucketHost: inputInbucketHost.value.trim(),
    inbucketMailbox: inputInbucketMailbox.value.trim(),
    hotmailServiceMode: getSelectedHotmailServiceMode(),
    hotmailRemoteBaseUrl: inputHotmailRemoteBaseUrl.value.trim(),
    hotmailLocalBaseUrl: inputHotmailLocalBaseUrl.value.trim(),
    luckmailApiKey: inputLuckmailApiKey.value,
    luckmailBaseUrl: normalizeLuckmailBaseUrl(inputLuckmailBaseUrl.value),
    luckmailEmailType: normalizeLuckmailEmailType(selectLuckmailEmailType.value),
    luckmailDomain: inputLuckmailDomain.value.trim(),
    cloudflareDomain: selectedCloudflareDomain,
    cloudflareDomains: domains,
    cloudflareTempEmailBaseUrl: normalizeCloudflareTempEmailBaseUrlValue(inputTempEmailBaseUrl.value),
    cloudflareTempEmailAdminAuth: inputTempEmailAdminAuth.value,
    cloudflareTempEmailCustomAuth: inputTempEmailCustomAuth.value,
    cloudflareTempEmailLookupMode: typeof getSelectedCloudflareTempEmailLookupMode === 'function'
      ? getSelectedCloudflareTempEmailLookupMode()
      : 'receive-mailbox',
    cloudflareTempEmailReceiveMailbox: normalizeCloudflareTempEmailReceiveMailboxValue(inputTempEmailReceiveMailbox.value),
    cloudflareTempEmailUseRandomSubdomain: Boolean(inputTempEmailUseRandomSubdomain?.checked),
    cloudflareTempEmailDomain: selectedCloudflareTempEmailDomain,
    cloudflareTempEmailDomains: tempEmailDomains,
    cloudMailBaseUrl: normalizeCloudMailBaseUrlInput((typeof inputCloudMailBaseUrl !== 'undefined' && inputCloudMailBaseUrl) ? inputCloudMailBaseUrl.value : ''),
    cloudMailAdminEmail: ((typeof inputCloudMailAdminEmail !== 'undefined' && inputCloudMailAdminEmail) ? inputCloudMailAdminEmail.value : '').trim(),
    cloudMailAdminPassword: (typeof inputCloudMailAdminPassword !== 'undefined' && inputCloudMailAdminPassword) ? inputCloudMailAdminPassword.value : '',
    cloudMailReceiveMailbox: normalizeCloudMailReceiveMailboxInput((typeof inputCloudMailReceiveMailbox !== 'undefined' && inputCloudMailReceiveMailbox) ? inputCloudMailReceiveMailbox.value : ''),
    cloudMailDomain: normalizeCloudMailDomainInput((typeof inputCloudMailDomain !== 'undefined' && inputCloudMailDomain) ? inputCloudMailDomain.value : ''),
    yydsMailApiKey: (typeof inputYydsMailApiKey !== 'undefined' && inputYydsMailApiKey) ? inputYydsMailApiKey.value.trim() : '',
    yydsMailBaseUrl: normalizeYydsBaseUrlValue((typeof inputYydsMailBaseUrl !== 'undefined' && inputYydsMailBaseUrl) ? inputYydsMailBaseUrl.value : ''),
    autoRunSkipFailures: inputAutoSkipFailures.checked,
    autoRunRetryPaypalCallback: typeof inputAutoRunRetryPaypalCallback !== 'undefined' && inputAutoRunRetryPaypalCallback
      ? Boolean(inputAutoRunRetryPaypalCallback.checked)
      : false,
    autoRunPreserveIssueLogsOnRestart: typeof inputAutoRunPreserveIssueLogsOnRestart !== 'undefined' && inputAutoRunPreserveIssueLogsOnRestart
      ? Boolean(inputAutoRunPreserveIssueLogsOnRestart.checked)
      : false,
    autoRunFallbackThreadIntervalMinutes: normalizeAutoRunThreadIntervalMinutes(inputAutoSkipFailuresThreadIntervalMinutes.value),
    step6CookieCleanupEnabled: typeof inputStep6CookieCleanupEnabled !== 'undefined' && inputStep6CookieCleanupEnabled
      ? Boolean(inputStep6CookieCleanupEnabled.checked)
      : false,
    stepExecutionRangeByFlow: typeof buildStepExecutionRangeByFlowPayload === 'function'
      ? buildStepExecutionRangeByFlowPayload(latestState?.stepExecutionRangeByFlow)
      : (latestState?.stepExecutionRangeByFlow || {}),
    autoRunDelayEnabled: inputAutoDelayEnabled.checked,
    autoRunDelayMinutes: normalizeAutoDelayMinutes(inputAutoDelayMinutes.value),
    autoStepDelaySeconds: normalizeAutoStepDelaySeconds(inputAutoStepDelaySeconds.value),
    registrationStageWaitSeconds: normalizeRegistrationStageWaitSecondsForPayload(
      typeof inputRegistrationStageWaitSeconds !== 'undefined' && inputRegistrationStageWaitSeconds
        ? inputRegistrationStageWaitSeconds.value
        : undefined,
      defaultRegistrationStageWaitSeconds
    ),
    signupIdentityRedirectTimeoutSeconds: normalizeSignupIdentityRedirectTimeoutSecondsForPayload(
      typeof inputSignupIdentityRedirectTimeoutSeconds !== 'undefined' && inputSignupIdentityRedirectTimeoutSeconds
        ? inputSignupIdentityRedirectTimeoutSeconds.value
        : undefined,
      defaultSignupIdentityRedirectTimeoutSeconds
    ),
    authContentScriptRecoveryTimeoutSeconds: normalizeAuthContentScriptRecoveryTimeoutSecondsForPayload(
      typeof inputAuthContentScriptRecoveryTimeoutSeconds !== 'undefined' && inputAuthContentScriptRecoveryTimeoutSeconds
        ? inputAuthContentScriptRecoveryTimeoutSeconds.value
        : undefined,
      defaultAuthContentScriptRecoveryTimeoutSeconds
    ),
    signupVerificationReadyTimeoutSeconds: signupVerificationReadyTimeoutSecondsValue,
    signupVerificationReadyMaxRounds: signupVerificationReadyMaxRoundsValue,
    signupVerificationReadyRoundWaitSeconds: signupVerificationReadyRoundWaitSecondsValue,
    signupPhoneVerificationSubmitResultMaxRounds: signupPhoneVerificationSubmitResultMaxRoundsValue,
    signupPhoneVerificationSubmitResultRoundWaitSeconds: signupPhoneVerificationSubmitResultRoundWaitSecondsValue,
    step5ProfileSubmitResultMaxRounds: step5ProfileSubmitResultMaxRoundsValue,
    step5ProfileSubmitResultRoundWaitSeconds: step5ProfileSubmitResultRoundWaitSecondsValue,
    oauthFlowTimeoutEnabled: typeof inputOAuthFlowTimeoutEnabled !== 'undefined' && inputOAuthFlowTimeoutEnabled
      ? Boolean(inputOAuthFlowTimeoutEnabled.checked)
      : true,
    oauthOpenAfterRefreshWaitSeconds: typeof inputOAuthOpenAfterRefreshWaitSeconds !== 'undefined' && inputOAuthOpenAfterRefreshWaitSeconds
      ? (typeof normalizeOAuthOpenAfterRefreshWaitSeconds === 'function'
        ? normalizeOAuthOpenAfterRefreshWaitSeconds(inputOAuthOpenAfterRefreshWaitSeconds.value)
        : Math.max(0, Math.min(120, Math.floor(Number(inputOAuthOpenAfterRefreshWaitSeconds.value) || 8))))
      : (typeof normalizeOAuthOpenAfterRefreshWaitSeconds === 'function'
        ? normalizeOAuthOpenAfterRefreshWaitSeconds(latestState?.oauthOpenAfterRefreshWaitSeconds)
        : Math.max(0, Math.min(120, Math.floor(Number(latestState?.oauthOpenAfterRefreshWaitSeconds) || 8)))),
    phoneVerificationEnabled: payloadPhoneVerificationEnabled,
    signupMethod: payloadSignupMethod,
    phoneSignupReloginAfterBindEmailEnabled: sub2apiReloginEnabled ? false : typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail
      ? Boolean(inputPhoneSignupReloginAfterBindEmail.checked)
      : false,
    phoneSignupPhonePrefixedEmailEnabled: typeof inputPhoneSignupPhonePrefixedEmail !== 'undefined' && inputPhoneSignupPhonePrefixedEmail
      ? Boolean(inputPhoneSignupPhonePrefixedEmail.checked)
      : (typeof DEFAULT_PHONE_SIGNUP_PHONE_PREFIXED_EMAIL_ENABLED !== 'undefined'
        ? DEFAULT_PHONE_SIGNUP_PHONE_PREFIXED_EMAIL_ENABLED
        : true),
    phoneSmsProvider: phoneSmsProviderValue,
    phoneSmsProviderOrder: phoneSmsProviderOrderValue,
    verificationResendCount: normalizeVerificationResendCount(
      inputVerificationResendCount?.value,
      DEFAULT_VERIFICATION_RESEND_COUNT
    ),
    heroSmsApiKey: heroSmsApiKeyValue,
    fiveSimApiKey: fiveSimApiKeyValue,
    fiveSimCountryOrder: fiveSimCountryOrderValue,
    fiveSimOperator: fiveSimOperatorValue,
    fiveSimProduct: fiveSimProductValue,
    nexSmsApiKey: nexSmsApiKeyValue,
    nexSmsCountryOrder: nexSmsCountryOrderValue,
    nexSmsServiceCode: nexSmsServiceCodeValue,
    smsBowerApiKey: smsBowerApiKeyValue,
    smsBowerServiceCode: latestState?.smsBowerServiceCode || 'dr',
    smsVerificationNumberApiKey: smsVerificationNumberApiKeyValue,
    smsVerificationNumberBaseUrl: latestState?.smsVerificationNumberBaseUrl || defaultSmsVerificationNumberBaseUrl,
    smsVerificationNumberServiceCode: latestState?.smsVerificationNumberServiceCode || defaultSmsVerificationNumberServiceCode,
    grizzlySmsApiKey: grizzlySmsApiKeyValue,
    grizzlySmsServiceCode: latestState?.grizzlySmsServiceCode || 'dr',
    smsPoolApiKey: smsPoolApiKeyValue,
    smsPoolServiceCode: latestState?.smsPoolServiceCode || '671',
    phoneSmsReuseEnabled: phoneSmsReuseEnabledValue,
    heroSmsReuseEnabled: heroSmsReuseEnabledValue,
    freePhoneReuseEnabled: freePhoneReuseEnabledValue,
    freePhoneReuseAutoEnabled: freePhoneReuseAutoEnabledValue,
    heroSmsAcquirePriority: heroSmsAcquirePriorityValue,
    heroSmsMinPrice: heroSmsMinPriceValue,
    heroSmsMaxPrice: heroSmsMaxPriceValue,
    heroSmsPreferredPrice: heroSmsPreferredPriceValue,
    smsBowerMinPrice: smsBowerMinPriceValue,
    smsBowerMaxPrice: smsBowerMaxPriceValue,
    smsBowerPreferredPrice: smsBowerPreferredPriceValue,
    smsVerificationNumberMinPrice: smsVerificationNumberMinPriceValue,
    smsVerificationNumberMaxPrice: smsVerificationNumberMaxPriceValue,
    smsVerificationNumberPreferredPrice: smsVerificationNumberPreferredPriceValue,
    grizzlySmsMinPrice: grizzlySmsMinPriceValue,
    grizzlySmsMaxPrice: grizzlySmsMaxPriceValue,
    grizzlySmsPreferredPrice: grizzlySmsPreferredPriceValue,
    smsPoolMinPrice: smsPoolMinPriceValue,
    smsPoolMaxPrice: smsPoolMaxPriceValue,
    smsPoolPreferredPrice: smsPoolPreferredPriceValue,
    phonePreferredActivation: phonePreferredActivationValue,
    phoneVerificationReplacementLimit: phoneVerificationReplacementLimitValue,
    phoneActivationRetryRounds: phoneActivationRetryRoundsValue,
    phoneActivationTierUpgradeLimit: phoneActivationTierUpgradeLimitValue,
    phoneCodeWaitSeconds: phoneCodeWaitSecondsValue,
    phoneCodeTimeoutWindows: phoneCodeTimeoutWindowsValue,
    phoneCodePollIntervalSeconds: phoneCodePollIntervalSecondsValue,
    phoneCodePollMaxRounds: phoneCodePollMaxRoundsValue,
    signupPhoneVerificationSubmitResultMaxRounds: signupPhoneVerificationSubmitResultMaxRoundsValue,
    signupPhoneVerificationSubmitResultRoundWaitSeconds: signupPhoneVerificationSubmitResultRoundWaitSecondsValue,
    heroSmsCountryId: heroSmsCountry.id,
    heroSmsCountryLabel: heroSmsCountry.label,
    heroSmsCountryFallback,
    heroSmsOperatorByCountry,
    fiveSimCountryId: fiveSimCountry.id,
    fiveSimCountryLabel: fiveSimCountry.label,
    fiveSimCountryFallback,
    fiveSimMaxPrice: fiveSimMaxPriceValue,
    fiveSimMinPrice: fiveSimMinPriceValue,
    smsBowerCountryId: selectedPhoneSmsCountry.id,
    smsBowerCountryLabel: selectedPhoneSmsCountry.label,
    smsBowerCountryFallback: selectedPhoneSmsCountryFallback,
    smsVerificationNumberCountryId: selectedPhoneSmsCountry.id,
    smsVerificationNumberCountryLabel: selectedPhoneSmsCountry.label,
    smsVerificationNumberCountryFallback: selectedPhoneSmsCountryFallback,
    grizzlySmsCountryId: selectedPhoneSmsCountry.id,
    grizzlySmsCountryLabel: selectedPhoneSmsCountry.label,
    grizzlySmsCountryFallback: selectedPhoneSmsCountryFallback,
    smsPoolCountryId: selectedPhoneSmsCountry.id,
    smsPoolCountryLabel: selectedPhoneSmsCountry.label,
    smsPoolCountryFallback: selectedPhoneSmsCountryFallback,
  };
}

function normalizeLocalCpaStep9Mode(value = '') {
  return String(value || '').trim().toLowerCase() === 'bypass'
    ? 'bypass'
    : DEFAULT_LOCAL_CPA_STEP9_MODE;
}

function normalizeMail2925Mode(value = '') {
  return String(value || '').trim().toLowerCase() === MAIL_2925_MODE_RECEIVE
    ? MAIL_2925_MODE_RECEIVE
    : DEFAULT_MAIL_2925_MODE;
}

function normalizeCloudflareTempEmailLookupMode(value = '') {
  return String(value || '').trim().toLowerCase() === CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL
    ? CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL
    : DEFAULT_CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE;
}

function normalizeHotmailServiceMode(value = '') {
  if (typeof normalizeHotmailServiceModeFromUtils === 'function') {
    return normalizeHotmailServiceModeFromUtils(value);
  }
  return String(value || '').trim().toLowerCase() === HOTMAIL_SERVICE_MODE_REMOTE
    ? HOTMAIL_SERVICE_MODE_REMOTE
    : HOTMAIL_SERVICE_MODE_LOCAL;
}

function normalizeAccountRunHistoryHelperBaseUrlValue(value = '') {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return DEFAULT_ACCOUNT_RUN_HISTORY_HELPER_BASE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return DEFAULT_ACCOUNT_RUN_HISTORY_HELPER_BASE_URL;
    }

    if (parsed.pathname === '/append-account-log' || parsed.pathname === '/sync-account-run-records') {
      parsed.pathname = '';
      parsed.search = '';
      parsed.hash = '';
    }

    return parsed.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_ACCOUNT_RUN_HISTORY_HELPER_BASE_URL;
  }
}


function normalizePhoneSmsProvider(value = '') {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.PhoneSmsProviderRegistry?.normalizeProviderId) {
    return rootScope.PhoneSmsProviderRegistry.normalizeProviderId(value);
  }
  const nexSmsProvider = typeof PHONE_SMS_PROVIDER_NEXSMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_NEXSMS
    : 'nexsms';
  const smsBowerProvider = typeof PHONE_SMS_PROVIDER_SMSBOWER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSBOWER
    : 'smsbower';
  const smsVerificationNumberProvider = typeof PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER
    : 'sms-verification-number';
  const grizzlySmsProvider = typeof PHONE_SMS_PROVIDER_GRIZZLYSMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_GRIZZLYSMS
    : 'grizzlysms';
  const smsPoolProvider = typeof PHONE_SMS_PROVIDER_SMSPOOL !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSPOOL
    : 'smspool';
  const chatGptApiProvider = typeof PHONE_SMS_PROVIDER_CHATGPT_API !== 'undefined'
    ? PHONE_SMS_PROVIDER_CHATGPT_API
    : 'chatgpt-api';
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === PHONE_SMS_PROVIDER_FIVE_SIM) {
    return PHONE_SMS_PROVIDER_FIVE_SIM;
  }
  if (normalized === nexSmsProvider) {
    return nexSmsProvider;
  }
  if (normalized === smsBowerProvider) {
    return smsBowerProvider;
  }
  if (normalized === smsVerificationNumberProvider) {
    return smsVerificationNumberProvider;
  }
  if (normalized === grizzlySmsProvider) {
    return grizzlySmsProvider;
  }
  if (normalized === smsPoolProvider) {
    return smsPoolProvider;
  }
  if (normalized === chatGptApiProvider) {
    return chatGptApiProvider;
  }
  return PHONE_SMS_PROVIDER_HERO_SMS;
}
function setPhoneSmsProviderSelectValue(provider) {
  const normalizedProvider = normalizePhoneSmsProvider(provider);
  if (selectPhoneSmsProvider) {
    selectPhoneSmsProvider.value = normalizedProvider;
    if (selectPhoneSmsProvider.dataset) {
      selectPhoneSmsProvider.dataset.activeProvider = normalizedProvider;
    }
  }
  return normalizedProvider;
}

function getLastAppliedPhoneSmsProvider() {
  return normalizePhoneSmsProvider(
    selectPhoneSmsProvider?.dataset?.activeProvider
      || latestState?.phoneSmsProvider
      || selectPhoneSmsProvider?.value
  );
}

function getSelectedPhoneSmsProvider() {
  return normalizePhoneSmsProvider(selectPhoneSmsProvider?.value || latestState?.phoneSmsProvider);
}

function getPhoneSmsProviderLabel(provider = getSelectedPhoneSmsProvider()) {
  if (typeof window !== 'undefined' && window.PhoneSmsProviderRegistry?.getProviderLabel) {
    return window.PhoneSmsProviderRegistry.getProviderLabel(provider);
  }
  const normalized = normalizePhoneSmsProvider(provider);
  if (normalized === PHONE_SMS_PROVIDER_FIVE_SIM) return '5sim';
  if (normalized === PHONE_SMS_PROVIDER_NEXSMS) return 'NexSMS';
  if (normalized === PHONE_SMS_PROVIDER_SMSBOWER) return 'SMSBower';
  if (normalized === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) return 'SMS Verification Number';
  if (normalized === PHONE_SMS_PROVIDER_GRIZZLYSMS) return 'GrizzlySMS';
  if (normalized === PHONE_SMS_PROVIDER_SMSPOOL) return 'SMSPool';
  if (normalized === PHONE_SMS_PROVIDER_CHATGPT_API) return 'ChatGPT API 接码';
  return 'HeroSMS';
}

function isFiveSimProviderSelected() {
  return getSelectedPhoneSmsProvider() === PHONE_SMS_PROVIDER_FIVE_SIM;
}

function normalizePhoneSmsCountryId(value, provider = getSelectedPhoneSmsProvider()) {
  if (normalizePhoneSmsProvider(provider) === PHONE_SMS_PROVIDER_FIVE_SIM) {
    return normalizeFiveSimCountryId(value);
  }
  return normalizeHeroSmsCountryId(value);
}

function normalizePhoneSmsCountryLabel(value = '', provider = getSelectedPhoneSmsProvider()) {
  if (normalizePhoneSmsProvider(provider) === PHONE_SMS_PROVIDER_FIVE_SIM) {
    return normalizeFiveSimCountryLabel(value);
  }
  return normalizeHeroSmsCountryLabel(value);
}

function normalizePhoneSmsPriceInputValue(value = '', max = (typeof PHONE_SMS_PRICE_INPUT_MAX !== 'undefined' ? PHONE_SMS_PRICE_INPUT_MAX : 0.1)) {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }
  const rounded = Math.round(numeric * 10000) / 10000;
  const maxNumeric = Number(max);
  if (!Number.isFinite(maxNumeric) || maxNumeric <= 0) {
    return String(rounded);
  }
  return String(Math.min(rounded, Math.round(maxNumeric * 10000) / 10000));
}

function normalizePhoneSmsMaxPriceValue(value = '', provider = '') {
  void provider;
  return normalizePhoneSmsPriceInputValue(value);
}

function normalizePhoneSmsMinPriceValue(value = '', provider = '') {
  void provider;
  return normalizePhoneSmsPriceInputValue(value);
}

function getHeroSmsProviderModule() {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  return rootScope.PhoneSmsHeroSmsProvider || null;
}

function normalizeFiveSimCountryId(value, fallback = DEFAULT_FIVE_SIM_COUNTRY_ID) {
  const fallbackSource = fallback === undefined || fallback === null ? DEFAULT_FIVE_SIM_COUNTRY_ID : fallback;
  const normalizedFallback = String(fallbackSource).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
  const rawNormalized = typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.normalizeFiveSimCountryId
    ? window.PhoneSmsFiveSimProvider.normalizeFiveSimCountryId(value, '')
    : String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
  const normalized = String(rawNormalized || '').trim().toLowerCase();
  if (normalized) {
    return normalized;
  }
  if (!normalizedFallback) {
    return '';
  }
  return normalizedFallback || DEFAULT_FIVE_SIM_COUNTRY_ID;
}

function normalizeFiveSimCountryLabel(value = '', fallback = DEFAULT_FIVE_SIM_COUNTRY_LABEL) {
  if (typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.normalizeFiveSimCountryLabel) {
    return window.PhoneSmsFiveSimProvider.normalizeFiveSimCountryLabel(value, fallback);
  }
  return String(value || '').trim() || fallback;
}

function formatFiveSimCountryDisplayLabel(id = '', englishValue = '', fallback = DEFAULT_FIVE_SIM_COUNTRY_LABEL) {
  if (typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.formatFiveSimCountryLabel) {
    return window.PhoneSmsFiveSimProvider.formatFiveSimCountryLabel(id, englishValue, fallback);
  }
  const countryId = normalizeFiveSimCountryId(id, '');
  const english = normalizeFiveSimCountryLabel(englishValue || countryId || fallback, fallback);
  const chinese = FIVE_SIM_COUNTRY_CN_BY_ID[countryId] || '';
  if (chinese && english) {
    if (String(english).includes(chinese)) {
      return english;
    }
    if (chinese.toLowerCase() !== english.toLowerCase()) {
      return `${chinese} (${english})`;
    }
  }
  return chinese || english;
}

function normalizeFiveSimOperator(value = '', fallback = DEFAULT_FIVE_SIM_OPERATOR) {
  if (typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.normalizeFiveSimOperator) {
    return window.PhoneSmsFiveSimProvider.normalizeFiveSimOperator(value || fallback);
  }
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || fallback;
}

function normalizeFiveSimMaxPriceValue(value = '') {
  if (typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.normalizeFiveSimMaxPrice) {
    return window.PhoneSmsFiveSimProvider.normalizeFiveSimMaxPrice(value);
  }
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }
  return String(Math.round(numeric * 10000) / 10000);
}

function normalizeFiveSimCountryFallbackList(value = []) {
  if (typeof window !== 'undefined' && window.PhoneSmsFiveSimProvider?.normalizeFiveSimCountryFallback) {
    return window.PhoneSmsFiveSimProvider.normalizeFiveSimCountryFallback(value);
  }
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const seen = new Set();
  const normalized = [];

  source.forEach((entry) => {
    let id = '';
    let label = '';
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      id = normalizeFiveSimCountryId(entry.id ?? entry.countryId ?? entry.slug, '');
      label = normalizeFiveSimCountryLabel(
        entry.label ?? entry.countryLabel ?? formatFiveSimCountryDisplayLabel(id, entry.text_en ?? entry.name, id),
        id
      );
    } else {
      const text = String(entry || '').trim();
      const structured = text.match(/^([a-z0-9_-]+)\s*(?:[:|/-]\s*(.+))?$/i);
      id = normalizeFiveSimCountryId(structured?.[1] || text, '');
      label = String(structured?.[2] || '').trim() || formatFiveSimCountryDisplayLabel(id, id, id);
    }
    if (!id || seen.has(id)) {
      return;
    }
    seen.add(id);
    normalized.push({ id, label: label || formatFiveSimCountryDisplayLabel(id, id, id) });
  });

  return normalized;
}

function normalizeHeroSmsCountryId(value, fallback = DEFAULT_HERO_SMS_COUNTRY_ID) {
  const parsed = Math.floor(Number(value));
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }
  const fallbackParsed = Math.floor(Number(fallback));
  return Number.isFinite(fallbackParsed) && fallbackParsed > 0 ? fallbackParsed : DEFAULT_HERO_SMS_COUNTRY_ID;
}

function normalizeHeroSmsCountryLabel(value = '') {
  return String(value || '').trim() || DEFAULT_HERO_SMS_COUNTRY_LABEL;
}

function normalizeHeroSmsOperatorValue(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '');
}

function normalizeHeroSmsOperatorByCountryMap(value = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  const normalized = {};
  Object.entries(value).forEach(([rawCountryId, rawOperator]) => {
    const countryId = normalizeHeroSmsCountryId(rawCountryId, 0);
    if (countryId <= 0) {
      return;
    }
    const operator = normalizeHeroSmsOperatorValue(rawOperator);
    if (!operator || operator === 'any') {
      return;
    }
    normalized[String(countryId)] = operator;
  });
  return normalized;
}

function normalizeHeroSmsMaxPriceValue(value = '') {
  const rawValue = String(value ?? '').trim();
  if (!rawValue) {
    return '';
  }
  const numeric = Number(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return '';
  }
  return String(Math.round(numeric * 10000) / 10000);
}

function normalizePhoneSmsProviderValue(value = '') {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.PhoneSmsProviderRegistry?.normalizeProviderId) {
    return rootScope.PhoneSmsProviderRegistry.normalizeProviderId(value);
  }
  return normalizePhoneSmsProvider(value);
}
function normalizePhoneSmsProviderOrderValue(value = [], fallbackOrder = []) {
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  if (rootScope.PhoneSmsProviderRegistry?.normalizeProviderOrder) {
    return rootScope.PhoneSmsProviderRegistry.normalizeProviderOrder(value, fallbackOrder);
  }
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const normalized = [];
  const seen = new Set();

  source.forEach((entry) => {
    const provider = normalizePhoneSmsProviderValue(entry);
    if (seen.has(provider)) {
      return;
    }
    seen.add(provider);
    normalized.push(provider);
  });

  if (normalized.length) {
    return normalized.slice(0, 3);
  }

  const fallback = Array.isArray(fallbackOrder) ? fallbackOrder : [];
  if (!fallback.length) {
    return [];
  }
  const fallbackNormalized = [];
  fallback.forEach((entry) => {
    const provider = normalizePhoneSmsProviderValue(entry);
    if (!provider || fallbackNormalized.includes(provider)) {
      return;
    }
    fallbackNormalized.push(provider);
  });
  return fallbackNormalized.slice(0, 3);
}
function formatPhoneSmsProviderOrderSummary(order = []) {
  const normalized = normalizePhoneSmsProviderOrderValue(order, []);
  if (!normalized.length) {
    return '未设置';
  }
  return normalized
    .map((provider, index) => `${index + 1}. ${getPhoneSmsProviderLabel(provider)}`)
    .join(' → ');
}

function updatePhoneSmsProviderOrderSummary(order = []) {
  const normalized = normalizePhoneSmsProviderOrderValue(order, []);
  if (displayPhoneSmsProviderOrder) {
    displayPhoneSmsProviderOrder.textContent = formatPhoneSmsProviderOrderSummary(normalized);
  }
  if (btnPhoneSmsProviderOrderMenu) {
    btnPhoneSmsProviderOrderMenu.textContent = normalized.length
      ? `${normalized.map((provider) => getPhoneSmsProviderLabel(provider)).join(' / ')} (${normalized.length}/3)`
      : `未选择 (0/3)`;
  }
}

function resolveNormalizedProviderOrderForRuntime(state = {}) {
  const rawOrder = Array.isArray(state?.phoneSmsProviderOrder)
    ? state.phoneSmsProviderOrder
    : [];
  const normalizedOrder = normalizePhoneSmsProviderOrderValue(rawOrder, []);
  if (normalizedOrder.length) {
    return normalizedOrder;
  }
  const fallbackProvider = normalizePhoneSmsProviderValue(
    state?.phoneSmsProvider || selectPhoneSmsProvider?.value || DEFAULT_PHONE_SMS_PROVIDER
  );
  return [fallbackProvider];
}

function setPhoneSmsProviderOrderMenuOpen(open) {
  const nextOpen = Boolean(open);
  if (btnPhoneSmsProviderOrderMenu) {
    btnPhoneSmsProviderOrderMenu.setAttribute('aria-expanded', String(nextOpen));
  }
  if (phoneSmsProviderOrderMenu) {
    phoneSmsProviderOrderMenu.hidden = !nextOpen;
  }
}

function renderPhoneSmsProviderOrderMenu() {
  if (!phoneSmsProviderOrderMenu || !selectPhoneSmsProviderOrder) {
    return;
  }
  phoneSmsProviderOrderMenu.innerHTML = '';
  const selectedOrder = normalizePhoneSmsProviderOrderValue(phoneSmsProviderOrderSelection, []);
  const selectedSet = new Set(selectedOrder);

  Array.from(selectPhoneSmsProviderOrder.options || []).forEach((option) => {
    const provider = normalizePhoneSmsProviderValue(option.value || '');
    const active = selectedSet.has(provider);
    const orderIndex = active ? selectedOrder.findIndex((entry) => entry === provider) + 1 : 0;
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'header-dropdown-item hero-sms-country-menu-item';
    item.classList.toggle('is-active', active);

    const labelText = document.createElement('span');
    labelText.className = 'hero-sms-country-menu-item-label';
    labelText.textContent = getPhoneSmsProviderLabel(provider);

    const badge = document.createElement('span');
    badge.className = 'hero-sms-country-menu-item-badge';
    badge.textContent = active ? `✓ ${orderIndex}` : '';

    item.appendChild(labelText);
    item.appendChild(badge);
    item.addEventListener('click', () => {
      option.selected = !option.selected;
      const nextOrder = syncPhoneSmsProviderOrderFromSelect({
        enforceMax: true,
        ensureDefault: false,
        showLimitToast: false,
        syncProvider: false,
      });
      updatePhoneSmsProviderOrderSummary(nextOrder);
      markSettingsDirty(true);
      saveSettings({ silent: true }).catch(() => { });
    });
    phoneSmsProviderOrderMenu.appendChild(item);
  });
}

function syncPhoneSmsProviderOrderFromSelect(options = {}) {
  const selectionLimit = Math.max(1, Math.floor(Number(options.maxSelection) || 3));
  const enforceMax = options.enforceMax !== false;
  const ensureDefault = options.ensureDefault !== false;
  const syncProvider = Boolean(options.syncProvider);
  const showLimitToast = Boolean(options.showLimitToast);
  if (!selectPhoneSmsProviderOrder) {
    phoneSmsProviderOrderSelection = [];
    updatePhoneSmsProviderOrderSummary([]);
    return [];
  }

  const selectedProviders = Array.from(selectPhoneSmsProviderOrder.options)
    .filter((option) => option.selected)
    .map((option) => normalizePhoneSmsProviderValue(option.value || ''))
    .filter(Boolean);
  const selectedSet = new Set(selectedProviders);

  let nextOrder = phoneSmsProviderOrderSelection.filter((provider) => selectedSet.has(provider));
  selectedProviders.forEach((provider) => {
    if (!nextOrder.includes(provider)) {
      nextOrder.push(provider);
    }
  });

  if (ensureDefault && !nextOrder.length) {
    const fallbackProvider = getSelectedPhoneSmsProvider();
    nextOrder = normalizePhoneSmsProviderOrderValue([fallbackProvider], []);
  }

  if (enforceMax && nextOrder.length > selectionLimit) {
    const droppedCount = nextOrder.length - selectionLimit;
    nextOrder = nextOrder.slice(0, selectionLimit);
    if (showLimitToast && droppedCount > 0 && typeof showToast === 'function') {
      showToast(`服务商顺序最多 ${selectionLimit} 个，已保留前 ${selectionLimit} 个。`, 'warn', 2200);
    }
  }

  const nextOrderSet = new Set(nextOrder);
  Array.from(selectPhoneSmsProviderOrder.options).forEach((option) => {
    const provider = normalizePhoneSmsProviderValue(option.value || '');
    option.selected = nextOrderSet.has(provider);
  });

  phoneSmsProviderOrderSelection = [...nextOrder];
  if (syncProvider && nextOrder.length && selectPhoneSmsProvider) {
    selectPhoneSmsProvider.value = normalizePhoneSmsProviderValue(nextOrder[0]);
  }
  renderPhoneSmsProviderOrderMenu();
  updatePhoneSmsProviderOrderSummary(nextOrder);
  return nextOrder;
}

function applyPhoneSmsProviderOrderSelection(order = [], options = {}) {
  const ensureDefault = options.ensureDefault !== false;
  const syncProvider = Boolean(options.syncProvider);
  const normalizedOrder = normalizePhoneSmsProviderOrderValue(order, []);
  phoneSmsProviderOrderSelection = [...normalizedOrder];
  if (selectPhoneSmsProviderOrder) {
    const selectedSet = new Set(normalizedOrder);
    Array.from(selectPhoneSmsProviderOrder.options).forEach((option) => {
      const provider = normalizePhoneSmsProviderValue(option.value || '');
      option.selected = selectedSet.has(provider);
    });
  }
  return syncPhoneSmsProviderOrderFromSelect({
    ensureDefault,
    enforceMax: true,
    syncProvider,
    showLimitToast: false,
  });
}

function clearPhoneSmsProviderOrderSelection(options = {}) {
  const syncProvider = Boolean(options.syncProvider);
  phoneSmsProviderOrderSelection = [];
  if (selectPhoneSmsProviderOrder) {
    Array.from(selectPhoneSmsProviderOrder.options || []).forEach((option) => {
      option.selected = false;
    });
  }
  const nextOrder = syncPhoneSmsProviderOrderFromSelect({
    ensureDefault: false,
    enforceMax: true,
    syncProvider,
    showLimitToast: false,
  });
  if (!nextOrder.length && !syncProvider && selectPhoneSmsProvider) {
    selectPhoneSmsProvider.value = normalizePhoneSmsProviderValue(
      selectPhoneSmsProvider.value || DEFAULT_PHONE_SMS_PROVIDER
    );
  }
  return nextOrder;
}

function getSelectedPhoneSmsProviderOrder() {
  const normalized = syncPhoneSmsProviderOrderFromSelect({
    ensureDefault: false,
    enforceMax: true,
    syncProvider: false,
    showLimitToast: false,
  });
  return normalizePhoneSmsProviderOrderValue(normalized, []);
}

function getSelectedPhoneSmsProvider() {
  if (!selectPhoneSmsProvider) {
    return DEFAULT_PHONE_SMS_PROVIDER;
  }
  const normalized = normalizePhoneSmsProviderValue(selectPhoneSmsProvider.value);
  selectPhoneSmsProvider.value = normalized;
  return normalized;
}

function normalizeFiveSimCountryCode(value = '', fallback = 'thailand') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
  return normalized || fallback;
}

function normalizeFiveSimCountryOrderValue(value = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const normalized = [];
  const seen = new Set();

  source.forEach((entry) => {
    const code = normalizeFiveSimCountryCode(
      entry && typeof entry === 'object' && !Array.isArray(entry)
        ? (entry.code || entry.country || entry.id || '')
        : entry,
      ''
    );
    if (!code || seen.has(code)) {
      return;
    }
    seen.add(code);
    normalized.push(code);
  });

  if (!normalized.length) {
    return [];
  }
  return normalized.slice(0, 10);
}

function formatFiveSimCountryOrderValue(value = []) {
  return normalizeFiveSimCountryOrderValue(value).join(',');
}

function normalizeFiveSimOperatorValue(value = '') {
  return normalizeFiveSimCountryCode(value, DEFAULT_FIVE_SIM_OPERATOR);
}

function normalizeFiveSimProductValue(value = '') {
  return normalizeFiveSimCountryCode(value, DEFAULT_FIVE_SIM_PRODUCT);
}

function normalizeNexSmsCountryIdValue(value, fallback = 0) {
  const parsed = Math.floor(Number(value));
  if (Number.isFinite(parsed) && parsed >= 0) {
    return parsed;
  }
  const fallbackParsed = Math.floor(Number(fallback));
  if (Number.isFinite(fallbackParsed) && fallbackParsed >= 0) {
    return fallbackParsed;
  }
  return 0;
}

function normalizeNexSmsCountryOrderValue(value = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const normalized = [];
  const seen = new Set();
  source.forEach((entry) => {
    const countryId = normalizeNexSmsCountryIdValue(
      entry && typeof entry === 'object' && !Array.isArray(entry)
        ? (entry.id || entry.countryId || entry.country || '')
        : entry,
      -1
    );
    if (countryId < 0 || seen.has(countryId)) {
      return;
    }
    seen.add(countryId);
    normalized.push(countryId);
  });
  if (!normalized.length) {
    return [];
  }
  return normalized.slice(0, 10);
}

function normalizeNexSmsServiceCodeValue(value = '') {
  const normalized = String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '');
  return normalized || DEFAULT_NEX_SMS_SERVICE_CODE;
}

function normalizeFiveSimCountryLabel(value = '', fallback = 'Thailand') {
  return String(value || '').trim() || fallback;
}

function normalizeFiveSimCountryFallbackList(value = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const normalized = [];
  const seen = new Set();
  source.forEach((entry) => {
    let code = '';
    let label = '';
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      code = normalizeFiveSimCountryCode(entry.code || entry.id || entry.country || '', '');
      label = normalizeFiveSimCountryLabel(entry.label || entry.countryLabel || '');
    } else {
      code = normalizeFiveSimCountryCode(entry, '');
    }
    if (!code || seen.has(code)) {
      return;
    }
    seen.add(code);
    normalized.push({
      id: code,
      code,
      label: label || code,
    });
  });
  return normalized;
}

function normalizeNexSmsCountryLabel(value = '', fallback = '') {
  return String(value || '').trim() || fallback;
}

function normalizeNexSmsCountryFallbackList(value = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const normalized = [];
  const seen = new Set();
  source.forEach((entry) => {
    let countryId = -1;
    let label = '';
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      countryId = normalizeNexSmsCountryIdValue(entry.id || entry.countryId || entry.country || '', -1);
      label = normalizeNexSmsCountryLabel(entry.label || entry.countryLabel || '');
    } else {
      countryId = normalizeNexSmsCountryIdValue(entry, -1);
    }
    if (countryId < 0 || seen.has(countryId)) {
      return;
    }
    seen.add(countryId);
    normalized.push({
      id: countryId,
      label: label || `Country #${countryId}`,
    });
  });
  return normalized;
}

function getFiveSimCountryDisplayNameByIso(isoCode = '') {
  const normalizedIso = String(isoCode || '').trim().toUpperCase();
  if (!normalizedIso || typeof Intl === 'undefined' || typeof Intl.DisplayNames !== 'function') {
    return '';
  }
  try {
    const zhDisplayNames = new Intl.DisplayNames(['zh-CN'], { type: 'region' });
    return String(zhDisplayNames.of(normalizedIso) || '').trim();
  } catch {
    return '';
  }
}

function buildFiveSimCountryDisplayLabel(country = {}) {
  const code = normalizeFiveSimCountryCode(country.code || country.id || country.country || '', 'thailand');
  const english = String(country.text_en || country.eng || country.english || code).trim();
  const iso = String(
    country.isoCode
    || country.iso
    || country.countryCode
    || ''
  ).trim().toUpperCase();
  const chinese = getFiveSimCountryDisplayNameByIso(iso);
  const base = chinese && english
    ? `${chinese} (${english})`
    : (chinese || english || code);
  return iso ? `${base} [${iso}]` : base;
}

function buildFiveSimCountrySearchText(country = {}, label = '', code = '') {
  const tokens = new Set();
  const iso = String(country.isoCode || country.iso || country.countryCode || '').trim().toUpperCase();
  const chinese = getFiveSimCountryDisplayNameByIso(iso);
  [label, code, iso, chinese, country.text_en, country.english, country.text_ru].forEach((entry) => {
    const token = String(entry || '').trim();
    if (token) {
      tokens.add(token);
    }
  });
  return Array.from(tokens).join(' ');
}

function parseFiveSimCountriesPayload(payload = {}) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return [];
  }
  const entries = Object.entries(payload)
    .map(([countryCode, details]) => {
      const isoObject = details?.iso && typeof details.iso === 'object' ? details.iso : {};
      const isoCode = Object.keys(isoObject)[0] || '';
      const normalizedCode = normalizeFiveSimCountryCode(countryCode, '');
      if (!normalizedCode) {
        return null;
      }
      const option = {
        code: normalizedCode,
        id: normalizedCode,
        isoCode: String(isoCode || '').trim().toUpperCase(),
        text_en: String(details?.text_en || normalizedCode).trim(),
      };
      const label = buildFiveSimCountryDisplayLabel(option);
      return {
        id: normalizedCode,
        code: normalizedCode,
        isoCode: option.isoCode,
        label,
        searchText: buildFiveSimCountrySearchText(option, label, normalizedCode),
      };
    })
    .filter(Boolean);
  return entries.sort((left, right) => String(left.label || '').localeCompare(String(right.label || '')));
}

function normalizePhoneVerificationReplacementLimit(value, fallback = DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_REPLACEMENT_LIMIT_MIN,
      Math.min(PHONE_REPLACEMENT_LIMIT_MAX, Number(fallback) || DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT)
    );
  }
  return Math.max(PHONE_REPLACEMENT_LIMIT_MIN, Math.min(PHONE_REPLACEMENT_LIMIT_MAX, parsed));
}

function normalizePhoneActivationRetryRoundsValue(value, fallback = DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_ACTIVATION_RETRY_ROUNDS_MIN,
      Math.min(PHONE_ACTIVATION_RETRY_ROUNDS_MAX, Number(fallback) || DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS)
    );
  }
  return Math.max(PHONE_ACTIVATION_RETRY_ROUNDS_MIN, Math.min(PHONE_ACTIVATION_RETRY_ROUNDS_MAX, parsed));
}

function normalizePhoneActivationTierUpgradeLimit(value, fallback = DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MIN,
      Math.min(PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MAX, Number(fallback) || DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT)
    );
  }
  return Math.max(PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MIN, Math.min(PHONE_ACTIVATION_TIER_UPGRADE_LIMIT_MAX, parsed));
}

function normalizePhoneCodeWaitSecondsValue(value, fallback = DEFAULT_PHONE_CODE_WAIT_SECONDS) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_CODE_WAIT_SECONDS_MIN,
      Math.min(PHONE_CODE_WAIT_SECONDS_MAX, Number(fallback) || DEFAULT_PHONE_CODE_WAIT_SECONDS)
    );
  }
  return Math.max(PHONE_CODE_WAIT_SECONDS_MIN, Math.min(PHONE_CODE_WAIT_SECONDS_MAX, parsed));
}

function normalizePhoneCodeTimeoutWindowsValue(value, fallback = DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_CODE_TIMEOUT_WINDOWS_MIN,
      Math.min(PHONE_CODE_TIMEOUT_WINDOWS_MAX, Number(fallback) || DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS)
    );
  }
  return Math.max(PHONE_CODE_TIMEOUT_WINDOWS_MIN, Math.min(PHONE_CODE_TIMEOUT_WINDOWS_MAX, parsed));
}

function normalizePhoneCodePollIntervalSecondsValue(value, fallback = DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_CODE_POLL_INTERVAL_SECONDS_MIN,
      Math.min(PHONE_CODE_POLL_INTERVAL_SECONDS_MAX, Number(fallback) || DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS)
    );
  }
  return Math.max(PHONE_CODE_POLL_INTERVAL_SECONDS_MIN, Math.min(PHONE_CODE_POLL_INTERVAL_SECONDS_MAX, parsed));
}

function normalizePhoneCodePollMaxRoundsValue(value, fallback = DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS) {
  const rawValue = String(value ?? '').trim();
  const parsed = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsed)) {
    return Math.max(
      PHONE_CODE_POLL_MAX_ROUNDS_MIN,
      Math.min(PHONE_CODE_POLL_MAX_ROUNDS_MAX, Number(fallback) || DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS)
    );
  }
  return Math.max(PHONE_CODE_POLL_MAX_ROUNDS_MIN, Math.min(PHONE_CODE_POLL_MAX_ROUNDS_MAX, parsed));
}

function normalizeHeroSmsReuseEnabledValue(value, fallbackValue = undefined) {
  if (value === undefined || value === null) {
    if (fallbackValue !== undefined && fallbackValue !== null) {
      return Boolean(fallbackValue);
    }
    return DEFAULT_HERO_SMS_REUSE_ENABLED;
  }
  return Boolean(value);
}

function normalizeHeroSmsAcquirePriority(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === HERO_SMS_ACQUIRE_PRIORITY_PRICE) {
    return HERO_SMS_ACQUIRE_PRIORITY_PRICE;
  }
  if (normalized === HERO_SMS_ACQUIRE_PRIORITY_PRICE_HIGH) {
    return HERO_SMS_ACQUIRE_PRIORITY_PRICE_HIGH;
  }
  return HERO_SMS_ACQUIRE_PRIORITY_COUNTRY;
}

function normalizeHeroSmsCountryFallbackList(value = []) {
  const source = Array.isArray(value)
    ? value
    : String(value || '')
      .split(/[\r\n,，;；]+/)
      .map((entry) => String(entry || '').trim())
      .filter(Boolean);
  const seen = new Set();
  const normalized = [];

  source.forEach((entry) => {
    let id = 0;
    let label = '';
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const parsedId = Math.floor(Number(entry.id ?? entry.countryId));
      id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 0;
      label = normalizeHeroSmsCountryLabel(entry.label ?? entry.countryLabel);
    } else {
      const text = String(entry || '').trim();
      const structured = text.match(/^(\d+)\s*(?:[:|/-]\s*(.+))?$/);
      if (structured) {
        const parsedId = Math.floor(Number(structured[1]));
        id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 0;
        label = normalizeHeroSmsCountryLabel(structured[2]);
      } else {
        const parsedId = Math.floor(Number(text));
        id = Number.isFinite(parsedId) && parsedId > 0 ? parsedId : 0;
      }
    }

    if (!id || seen.has(id)) {
      return;
    }
    seen.add(id);
    normalized.push({
      id,
      label: label || `Country #${id}`,
    });
  });

  return normalized;
}

function syncHeroSmsOperatorSelectionState(value = {}) {
  heroSmsSelectedOperatorByCountryId.clear();
  const normalized = normalizeHeroSmsOperatorByCountryMap(value);
  Object.entries(normalized).forEach(([countryId, operator]) => {
    heroSmsSelectedOperatorByCountryId.set(String(countryId), operator);
  });
  return normalized;
}

function getHeroSmsOperatorByCountryPayload() {
  const selectedCountries = normalizeHeroSmsCountryFallbackList(
    syncHeroSmsFallbackSelectionOrderFromSelect({
      enforceMax: true,
      ensureDefault: false,
      showLimitToast: false,
    })
  );
  const payload = {};
  selectedCountries.forEach((country) => {
    const countryId = String(normalizeHeroSmsCountryId(country?.id, 0));
    if (!countryId) {
      return;
    }
    const operator = normalizeHeroSmsOperatorValue(heroSmsSelectedOperatorByCountryId.get(countryId));
    if (operator && operator !== 'any') {
      payload[countryId] = operator;
    }
  });
  return payload;
}

async function loadHeroSmsOperators(options = {}) {
  const silent = Boolean(options?.silent);
  const fetchImpl = options?.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
  heroSmsOperatorsByCountryId.clear();
  if (!fetchImpl) {
    return;
  }
  try {
    const controller = typeof AbortController === 'function' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), 10000) : null;
    const response = await fetchImpl('https://hero-sms.com/stubs/handler_api.php?action=getOperators', {
      signal: controller?.signal,
      cache: 'no-store',
    });
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const countryOperators = payload && typeof payload === 'object' && !Array.isArray(payload)
      ? (payload.countryOperators && typeof payload.countryOperators === 'object' && !Array.isArray(payload.countryOperators)
        ? payload.countryOperators
        : payload)
      : {};
    Object.entries(countryOperators).forEach(([rawCountryId, rawOperators]) => {
      const countryId = normalizeHeroSmsCountryId(rawCountryId, 0);
      if (countryId <= 0) {
        return;
      }
      const operators = Array.isArray(rawOperators)
        ? rawOperators
            .map((entry) => normalizeHeroSmsOperatorValue(entry))
            .filter(Boolean)
        : [];
      heroSmsOperatorsByCountryId.set(String(countryId), Array.from(new Set(operators)));
    });
  } catch (error) {
    heroSmsOperatorsByCountryId.clear();
    if (!silent && typeof showToast === 'function') {
      showToast(`HeroSMS 运营商列表加载失败：${normalizeHeroSmsFetchErrorMessage(error)}`, 'warn', 2600);
    }
  }
}

function renderHeroSmsOperatorControls(countries = []) {
  if (!heroSmsOperatorList) {
    return;
  }
  heroSmsOperatorList.innerHTML = '';
  const normalizedCountries = normalizeHeroSmsCountryFallbackList(countries);
  if (!normalizedCountries.length) {
    const empty = document.createElement('span');
    empty.className = 'hero-sms-operator-empty';
    empty.textContent = '请先选择至少 1 个国家';
    heroSmsOperatorList.appendChild(empty);
    return;
  }
  normalizedCountries.forEach((country) => {
    const countryId = String(normalizeHeroSmsCountryId(country?.id, 0));
    const operators = Array.isArray(heroSmsOperatorsByCountryId.get(countryId))
      ? heroSmsOperatorsByCountryId.get(countryId)
      : [];
    const item = document.createElement('div');
    item.className = 'hero-sms-operator-item';
    const label = document.createElement('span');
    label.className = 'hero-sms-operator-label';
    label.textContent = country?.label || `Country #${countryId}`;
    const select = document.createElement('select');
    select.className = 'data-input mono hero-sms-operator-select';
    select.dataset.countryId = countryId;
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = '任意运营商（默认）';
    select.appendChild(defaultOption);
    operators.forEach((operator) => {
      const option = document.createElement('option');
      option.value = operator;
      option.textContent = operator;
      select.appendChild(option);
    });
    const selectedOperator = normalizeHeroSmsOperatorValue(heroSmsSelectedOperatorByCountryId.get(countryId));
    if (selectedOperator && operators.includes(selectedOperator)) {
      select.value = selectedOperator;
    } else {
      select.value = '';
      if (selectedOperator) {
        heroSmsSelectedOperatorByCountryId.delete(countryId);
      }
    }
    if (!operators.length) {
      select.disabled = true;
    }
    select.addEventListener('change', () => {
      const nextValue = normalizeHeroSmsOperatorValue(select.value);
      if (nextValue) {
        heroSmsSelectedOperatorByCountryId.set(countryId, nextValue);
      } else {
        heroSmsSelectedOperatorByCountryId.delete(countryId);
      }
      markSettingsDirty(true);
      saveSettings({ silent: true }).catch(() => { });
    });
    item.appendChild(label);
    item.appendChild(select);
    heroSmsOperatorList.appendChild(item);
  });
}

function collectHeroSmsCountrySearchTokens(value, tokens, depth = 0) {
  if (depth > 2 || value === null || value === undefined) {
    return;
  }
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (normalized) {
      tokens.add(normalized);
    }
    return;
  }
  if (Array.isArray(value)) {
    value.forEach((entry) => collectHeroSmsCountrySearchTokens(entry, tokens, depth + 1));
    return;
  }
  if (typeof value === 'object') {
    Object.values(value).forEach((entry) => collectHeroSmsCountrySearchTokens(entry, tokens, depth + 1));
  }
}

function normalizeHeroSmsCountryAliasKey(value = '') {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[’'`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function collectHeroSmsCountryCodeAliases(country = {}, label = '') {
  const aliases = new Set();
  const candidateLabels = [
    String(label || '').trim(),
    String(country?.eng || '').trim(),
    String(country?.name || '').trim(),
    String(country?.country || '').trim(),
  ].filter(Boolean);
  candidateLabels.forEach((candidate) => {
    const normalized = normalizeHeroSmsCountryAliasKey(candidate);
    if (!normalized) {
      return;
    }
    const code = HERO_SMS_COUNTRY_ISO_CODE_BY_NAME.get(normalized);
    if (code) {
      aliases.add(code);
    }
    const overrideAliases = HERO_SMS_COUNTRY_CODE_ALIAS_OVERRIDES[normalized];
    if (Array.isArray(overrideAliases)) {
      overrideAliases.forEach((entry) => {
        const token = String(entry || '').trim().toUpperCase();
        if (token) {
          aliases.add(token);
        }
      });
    }
  });
  return Array.from(aliases);
}

function buildHeroSmsCountrySearchText(country = {}, label = '', id = '') {
  const tokens = new Set();
  collectHeroSmsCountrySearchTokens(country, tokens, 0);
  if (label) {
    tokens.add(String(label).trim());
  }
  if (id) {
    tokens.add(String(id).trim());
  }
  collectHeroSmsCountryCodeAliases(country, label).forEach((alias) => tokens.add(alias));
  return Array.from(tokens).join(' ');
}

function buildHeroSmsCountryDisplayLabel(country = {}) {
  const english = String(country?.eng || '').trim();
  const chinese = String(country?.chn || '').trim();
  if (chinese && english) {
    if (chinese.toLowerCase() === english.toLowerCase()) {
      return english;
    }
    return `${chinese} (${english})`;
  }
  return chinese || english;
}

function normalizeHeroSmsFetchErrorMessage(error) {
  const message = String(error?.message || error || '').trim();
  if (!message) {
    return '未知网络错误';
  }
  if (/aborted|abort|timed out|timeout/i.test(message)) {
    return '请求超时，请稍后重试';
  }
  if (/failed to fetch|networkerror|network request failed/i.test(message)) {
    return '网络不可用或被拦截';
  }
  return message;
}

function normalizeHeroSmsCountryPayloadEntries(source) {
  if (Array.isArray(source)) {
    return source;
  }
  if (!source || typeof source !== 'object') {
    return [];
  }
  return Object.values(source)
    .filter((entry) => entry && typeof entry === 'object' && !Array.isArray(entry));
}

function parseHeroSmsCountryPayload(payload) {
  const candidateSources = [
    payload?.value,
    payload?.data,
    payload?.countries,
    payload?.result,
    payload,
  ];
  for (const source of candidateSources) {
    const entries = normalizeHeroSmsCountryPayloadEntries(source);
    if (entries.length) {
      return entries;
    }
  }
  return [];
}

function normalizeHeroSmsPriceForPreview(value) {
  const direct = Number(value);
  if (Number.isFinite(direct) && direct >= 0) {
    return direct;
  }
  const text = String(value ?? '').trim();
  if (!text) {
    return null;
  }
  const matched = text.match(/-?\d+(?:[.,]\d+)?/);
  if (!matched) {
    return null;
  }
  const parsed = Number(String(matched[0] || '').replace(',', '.'));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null;
  }
  return parsed;
}

function formatHeroSmsPriceForPreview(value) {
  const price = Number(value);
  if (!Number.isFinite(price) || price < 0) {
    return '';
  }
  const rounded = Math.round(price * 10000) / 10000;
  return rounded.toFixed(4).replace(/\.?0+$/, '');
}

function isHeroSmsPreviewEmptyPayload(payload) {
  if (payload === undefined || payload === null) {
    return true;
  }
  if (typeof payload === 'string') {
    return !payload.trim();
  }
  if (Array.isArray(payload)) {
    return payload.length === 0;
  }
  if (typeof payload === 'object') {
    return Object.keys(payload).length === 0;
  }
  return false;
}

function collectHeroSmsPriceEntriesForPreview(payload, entries = []) {
  const heroProvider = getHeroSmsProviderModule();
  if (heroProvider?.collectPriceEntries) {
    const sharedEntries = heroProvider.collectPriceEntries(payload, { sourceAction: 'preview' }, [])
      .map((entry) => ({
        cost: Number(entry.price),
        price: Number(entry.price),
        hasStockField: Boolean(entry.hasStockField),
        stockCount: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
        count: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
        inStock: Boolean(entry.inStock),
        sourceAction: entry.sourceAction,
      }));
    if (Array.isArray(entries)) {
      entries.push(...sharedEntries);
      return entries;
    }
    return sharedEntries;
  }
  if (Array.isArray(payload)) {
    payload.forEach((entry) => collectHeroSmsPriceEntriesForPreview(entry, entries));
    return entries;
  }
  if (!payload || typeof payload !== 'object') {
    return entries;
  }

  const cost = normalizeHeroSmsPriceForPreview(payload.cost ?? payload.price ?? payload.Price);
  if (cost !== null) {
    const count = Number(payload.count ?? payload.qty ?? payload.Qty);
    const physicalCount = Number(payload.physicalCount);
    const hasCount = Number.isFinite(count);
    const hasPhysicalCount = Number.isFinite(physicalCount);
    const stockCount = hasPhysicalCount
      ? physicalCount
      : (hasCount ? count : 0);
    const hasStockField = hasCount || hasPhysicalCount;
    entries.push({
      cost,
      hasStockField,
      stockCount: Number.isFinite(stockCount) ? stockCount : 0,
      inStock: !hasStockField || stockCount > 0,
    });
  }

  const pushTierMapEntries = (tierMap) => {
    if (!tierMap || typeof tierMap !== 'object') {
      return;
    }
    Object.entries(tierMap).forEach(([priceKey, countRaw]) => {
      const priceValue = normalizeHeroSmsPriceForPreview(priceKey);
      if (priceValue === null) {
        return;
      }
      const stockCount = Number(countRaw);
      if (!Number.isFinite(stockCount)) {
        return;
      }
      entries.push({
        cost: priceValue,
        hasStockField: true,
        stockCount: Math.max(0, stockCount),
        inStock: stockCount > 0,
      });
    });
  };

  pushTierMapEntries(payload.freePriceMap);
  pushTierMapEntries(payload.priceMap);

  // Some HeroSMS payloads encode tiers as object keys, e.g.:
  // { "0.05": { count: 0 }, "0.35": { count: 12 } }
  // Parse those keyed tiers as well, so preview does not miss higher-price stock.
  Object.entries(payload).forEach(([key, value]) => {
    const keyedPrice = normalizeHeroSmsPriceForPreview(key);
    if (keyedPrice === null) {
      return;
    }
    if (value && typeof value === 'object') {
      const stockCandidates = [
        value.count,
        value.physicalCount,
        value.stock,
        value.available,
        value.quantity,
        value.qty,
        value.left,
        value.free,
      ]
        .map((raw) => Number(raw))
        .filter((raw) => Number.isFinite(raw));
      const hasStockField = stockCandidates.length > 0;
      const trimmedKey = String(key || '').trim();
      const looksLikeCountryOrServiceKey = /^[0-9]{1,4}$/.test(trimmedKey);
      const looksLikeDecimalPriceKey = /^-?\d+[.,]\d+$/.test(trimmedKey)
        || /^[^\d-]*-?\d+[.,]\d+[^\d]*$/.test(trimmedKey);
      // Guard against country/service IDs encoded as numeric keys (e.g. "52", "16").
      // For numeric keys we require explicit stock fields, while decimal price keys can
      // still be consumed even when the provider only returns a scalar quantity.
      if (looksLikeCountryOrServiceKey && !looksLikeDecimalPriceKey) {
        return;
      }
      const stockCount = hasStockField ? Math.max(...stockCandidates) : 0;
      entries.push({
        cost: keyedPrice,
        hasStockField,
        stockCount: Number.isFinite(stockCount) ? stockCount : 0,
        inStock: stockCount > 0,
      });
      return;
    }
    const numericCount = Number(value);
    if (Number.isFinite(numericCount)) {
      entries.push({
        cost: keyedPrice,
        hasStockField: true,
        stockCount: Math.max(0, numericCount),
        inStock: numericCount > 0,
      });
    }
  });

  Object.values(payload).forEach((entry) => collectHeroSmsPriceEntriesForPreview(entry, entries));
  return entries;
}

function collectHeroSmsPriceEntriesFromTopCountriesPayload(payload, countryId, entries = []) {
  const heroProvider = getHeroSmsProviderModule();
  if (heroProvider?.collectTopCountriesPriceEntries) {
    const sharedEntries = heroProvider.collectTopCountriesPriceEntries(
      payload,
      countryId,
      { sourceAction: 'getTopCountriesByService' },
      []
    ).map((entry) => ({
      cost: Number(entry.price),
      price: Number(entry.price),
      hasStockField: Boolean(entry.hasStockField),
      stockCount: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
      count: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
      inStock: Boolean(entry.inStock),
      sourceAction: entry.sourceAction,
    }));
    if (Array.isArray(entries)) {
      entries.push(...sharedEntries);
      return entries;
    }
    return sharedEntries;
  }
  const normalizedCountryId = normalizeHeroSmsCountryId(countryId, 0);
  if (normalizedCountryId <= 0) {
    return entries;
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return entries;
  }
  Object.values(payload).forEach((entry) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      return;
    }
    const entryCountryId = normalizeHeroSmsCountryId(
      entry.country ?? entry.countryId ?? entry.country_id ?? entry.id,
      0
    );
    if (entryCountryId !== normalizedCountryId) {
      return;
    }
    collectHeroSmsPriceEntriesForPreview(entry, entries);
  });
  return entries;
}

function collectHeroSmsPriceEntriesFromVerificationPayload(payload, countryId, serviceCode = 'dr', entries = []) {
  const heroProvider = getHeroSmsProviderModule();
  if (heroProvider?.collectVerificationPriceEntries) {
    const sharedEntries = heroProvider.collectVerificationPriceEntries(
      payload,
      countryId,
      serviceCode,
      { sourceAction: 'getPricesVerification' },
      []
    ).map((entry) => ({
      cost: Number(entry.price),
      price: Number(entry.price),
      hasStockField: Boolean(entry.hasStockField),
      stockCount: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
      count: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
      inStock: Boolean(entry.inStock),
      sourceAction: entry.sourceAction,
    }));
    if (Array.isArray(entries)) {
      entries.push(...sharedEntries);
      return entries;
    }
    return sharedEntries;
  }
  const normalizedCountryId = normalizeHeroSmsCountryId(countryId, 0);
  if (normalizedCountryId <= 0) {
    return entries;
  }
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return entries;
  }
  const normalizedServiceCode = String(serviceCode || '').trim();
  if (!normalizedServiceCode) {
    return entries;
  }
  const serviceNode = payload?.[normalizedServiceCode];
  if (!serviceNode || typeof serviceNode !== 'object' || Array.isArray(serviceNode)) {
    return entries;
  }
  const countryNode = serviceNode?.[String(normalizedCountryId)];
  if (!countryNode || typeof countryNode !== 'object' || Array.isArray(countryNode)) {
    return entries;
  }
  const priceValue = normalizeHeroSmsPriceForPreview(countryNode.price);
  if (priceValue === null) {
    return entries;
  }
  const stockCount = Number(countryNode.count);
  entries.push({
    cost: priceValue,
    hasStockField: Number.isFinite(stockCount),
    stockCount: Number.isFinite(stockCount) ? Math.max(0, stockCount) : 0,
    inStock: !Number.isFinite(stockCount) || stockCount > 0,
  });
  return entries;
}

function collectHeroSmsPriceCandidatesForPreview(payload, candidates = []) {
  collectHeroSmsPriceEntriesForPreview(payload, [])
    .filter((entry) => entry.inStock)
    .forEach((entry) => {
      candidates.push(entry.cost);
    });
  return candidates;
}

function formatPhoneSmsPriceEntriesSummary(payload) {
  const heroProvider = getHeroSmsProviderModule();
  if (heroProvider?.summarizePreviewPriceEntries) {
    const summary = heroProvider.summarizePreviewPriceEntries(
      collectHeroSmsPriceEntriesForPreview(payload, [])
        .filter((entry) => Number.isFinite(Number(entry.cost)) && Number(entry.cost) > 0)
        .map((entry) => ({
          price: Number(entry.cost),
          stockCount: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
          hasStockField: Boolean(entry.hasStockField),
          inStock: Boolean(entry.inStock),
          sourceAction: entry.sourceAction || 'preview',
        }))
    );
    return {
      entries: summary.entries.map((entry) => ({
        ...entry,
        cost: Number(entry.price),
      })),
      inStockPrices: summary.inStockPrices,
      allPrices: summary.allPrices,
    };
  }
  const entries = collectHeroSmsPriceEntriesForPreview(payload, [])
    .filter((entry) => Number.isFinite(Number(entry.cost)) && Number(entry.cost) > 0);
  const inStockPrices = Array.from(new Set(
    entries
      .filter((entry) => entry.inStock)
      .map((entry) => Math.round(Number(entry.cost) * 10000) / 10000)
  )).sort((left, right) => left - right);
  const allPrices = Array.from(new Set(
    entries.map((entry) => Math.round(Number(entry.cost) * 10000) / 10000)
  )).sort((left, right) => left - right);
  return { entries, inStockPrices, allPrices };
}

function describeHeroSmsPreviewPayload(payload) {
  if (payload === undefined || payload === null) {
    return '';
  }
  if (typeof payload === 'string') {
    return payload.trim();
  }
  if (typeof payload === 'number' || typeof payload === 'boolean') {
    return String(payload);
  }
  if (typeof payload === 'object') {
    const directMessage = String(
      payload.message
      || payload.msg
      || payload.error
      || payload.title
      || payload.statusText
      || ''
    ).trim();
    if (directMessage) {
      const extra = String(payload?.info?.text || payload?.info?.description || '').trim();
      return extra ? `${directMessage}: ${extra}` : directMessage;
    }
    try {
      return JSON.stringify(payload);
    } catch {
      return '[object]';
    }
  }
  return String(payload);
}

function summarizeHeroSmsPreviewError(payload, responseStatus = 0) {
  if (isHeroSmsPreviewEmptyPayload(payload)) {
    return '未返回有效价格';
  }
  const text = describeHeroSmsPreviewPayload(payload);
  if (text === '{}' || text === '[]') {
    return '未返回有效价格';
  }
  if (/UNPROCESSABLE_ENTITY/i.test(text) && /api_key/i.test(text) && /REQUIRED/i.test(text)) {
    return '请先填写接码 API Key';
  }
  if (/BAD_KEY|WRONG_KEY|INVALID_KEY/i.test(text)) {
    return 'API Key 无效';
  }
  if (/NO_BALANCE|NOT_ENOUGH_BALANCE/i.test(text)) {
    return '余额不足';
  }
  if (/BANNED|ACCOUNT_BANNED/i.test(text)) {
    return '账号已被封禁';
  }
  if (/WRONG_SERVICE|SERVICE_NOT_FOUND/i.test(text)) {
    return '服务代码无效';
  }
  if (/WRONG_COUNTRY|COUNTRY_NOT_FOUND/i.test(text)) {
    return '国家参数无效';
  }
  if (/NO_NUMBERS/i.test(text)) {
    return '暂无可用号源';
  }
  if (responseStatus && responseStatus >= 400) {
    return `HTTP ${responseStatus}`;
  }
  return text || '未知错误';
}

function resolvePhoneSmsPricePreviewRange(provider = '') {
  const activeProvider = provider || (
    typeof getSelectedPhoneSmsProvider === 'function'
      ? getSelectedPhoneSmsProvider()
      : (typeof DEFAULT_PHONE_SMS_PROVIDER !== 'undefined' ? DEFAULT_PHONE_SMS_PROVIDER : 'hero-sms')
  );
  const rawMinPrice = typeof inputHeroSmsMinPrice !== 'undefined' && inputHeroSmsMinPrice
    ? inputHeroSmsMinPrice.value
    : '';
  const rawMaxPrice = typeof inputHeroSmsMaxPrice !== 'undefined' && inputHeroSmsMaxPrice
    ? inputHeroSmsMaxPrice.value
    : '';
  const minPriceText = typeof normalizePhoneSmsMinPriceValue === 'function'
    ? normalizePhoneSmsMinPriceValue(rawMinPrice, activeProvider)
    : normalizeHeroSmsMaxPriceValue(rawMinPrice);
  const maxPriceText = typeof normalizePhoneSmsMaxPriceValue === 'function'
    ? normalizePhoneSmsMaxPriceValue(rawMaxPrice, activeProvider)
    : normalizeHeroSmsMaxPriceValue(rawMaxPrice);
  const minPrice = minPriceText ? Number(minPriceText) : null;
  const maxPrice = maxPriceText ? Number(maxPriceText) : null;
  return {
    minPrice,
    maxPrice,
    hasMinPrice: Number.isFinite(minPrice) && minPrice > 0,
    hasMaxPrice: Number.isFinite(maxPrice) && maxPrice > 0,
    invalid: Number.isFinite(minPrice) && minPrice > 0
      && Number.isFinite(maxPrice) && maxPrice > 0
      && minPrice > maxPrice,
  };
}

function isPhoneSmsPriceWithinPreviewRange(price, range = {}) {
  const numeric = Number(price);
  if (!Number.isFinite(numeric) || numeric <= 0 || range?.invalid) {
    return false;
  }
  const normalized = Math.round(numeric * 10000) / 10000;
  if (range?.hasMinPrice && normalized < Number(range.minPrice)) {
    return false;
  }
  if (range?.hasMaxPrice && normalized > Number(range.maxPrice)) {
    return false;
  }
  return true;
}

function filterPhoneSmsPriceEntriesForPreviewRange(entries = [], range = {}) {
  if (!range?.hasMinPrice && !range?.hasMaxPrice && !range?.invalid) {
    return Array.isArray(entries) ? [...entries] : [];
  }
  return (Array.isArray(entries) ? entries : []).filter((entry) => (
    isPhoneSmsPriceWithinPreviewRange(entry?.price ?? entry?.cost, range)
  ));
}

function filterPhoneSmsPriceValuesForPreviewRange(values = [], range = {}) {
  if (!range?.hasMinPrice && !range?.hasMaxPrice && !range?.invalid) {
    return Array.isArray(values) ? [...values] : [];
  }
  return (Array.isArray(values) ? values : []).filter((price) => (
    isPhoneSmsPriceWithinPreviewRange(price, range)
  ));
}

function formatPhoneSmsPriceRangePreviewText(range = {}) {
  const minText = range?.hasMinPrice
    ? (formatHeroSmsPriceForPreview(range.minPrice) || String(range.minPrice))
    : '';
  const maxText = range?.hasMaxPrice
    ? (formatHeroSmsPriceForPreview(range.maxPrice) || String(range.maxPrice))
    : '';
  if (minText && maxText) {
    return `${minText}~${maxText}`;
  }
  if (minText) {
    return `${minText}~`;
  }
  if (maxText) {
    return `~${maxText}`;
  }
  return '';
}

function buildPhoneSmsPriceRangePreviewMessage(range = {}) {
  const rangeText = formatPhoneSmsPriceRangePreviewText(range);
  if (range?.invalid) {
    return `价格区间无效：最低购买价 ${formatHeroSmsPriceForPreview(range.minPrice) || range.minPrice} 高于价格上限 ${formatHeroSmsPriceForPreview(range.maxPrice) || range.maxPrice}`;
  }
  return rangeText ? `区间内无可用号源（当前 ${rangeText}）` : '暂无可用号源';
}

function formatPriceTiersForPreview(entries = [], options = {}) {
  const maxPrice = Number(options?.maxPrice);
  const hasMaxPrice = Number.isFinite(maxPrice) && maxPrice > 0;
  const normalized = Array.from(
    new Map(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => {
          const price = Number(entry?.price ?? entry?.cost);
          if (!Number.isFinite(price) || price <= 0) {
            return null;
          }
          const normalizedPrice = Math.round(price * 10000) / 10000;
          const countRaw = Number(entry?.count);
          const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : null;
          return [normalizedPrice, count];
        })
        .filter(Boolean)
    ).entries()
  )
    .map(([price, count]) => ({ price: Number(price), count }))
    .sort((left, right) => left.price - right.price);
  if (!normalized.length) {
    return '';
  }

  const limit = 16;
  const displayed = normalized.slice(0, limit);
  const suffix = normalized.length > limit ? ` ... +${normalized.length - limit} 档` : '';
  return displayed.map((entry) => {
    const priceText = formatHeroSmsPriceForPreview(entry.price) || String(entry.price);
    const countText = entry.count === null ? '' : `x${entry.count}`;
    const overLimitText = hasMaxPrice && entry.price > maxPrice ? '↑' : '';
    return `${priceText}${countText ? `(${countText})` : ''}${overLimitText}`;
  }).join(', ') + suffix;
}

function formatPriceTiersWithZeroStockForPreview(entries = [], options = {}) {
  const maxPrice = Number(options?.maxPrice);
  const hasMaxPrice = Number.isFinite(maxPrice) && maxPrice > 0;
  const normalized = Array.from(
    new Map(
      (Array.isArray(entries) ? entries : [])
        .map((entry) => {
          const price = Number(entry?.price ?? entry?.cost);
          if (!Number.isFinite(price) || price <= 0) {
            return null;
          }
          const normalizedPrice = Math.round(price * 10000) / 10000;
          const countRaw = Number(entry?.count);
          const count = Number.isFinite(countRaw) ? Math.max(0, Math.floor(countRaw)) : null;
          return [normalizedPrice, count];
        })
        .filter(Boolean)
    ).entries()
  )
    .map(([price, count]) => ({ price: Number(price), count }))
    .sort((left, right) => left.price - right.price);
  if (!normalized.length) {
    return '';
  }

  const limit = 16;
  const displayed = normalized.slice(0, limit);
  const suffix = normalized.length > limit ? ` ... +${normalized.length - limit} 档` : '';
  return displayed.map((entry) => {
    const priceText = formatHeroSmsPriceForPreview(entry.price) || String(entry.price);
    const countText = entry.count === null ? '' : `x${entry.count}`;
    const overLimitText = hasMaxPrice && entry.price > maxPrice ? '↑' : '';
    return `${priceText}${countText ? `(${countText})` : ''}${overLimitText}`;
  }).join(', ') + suffix;
}

function describeNexSmsPreviewPayload(payload) {
  if (payload === undefined || payload === null) {
    return '';
  }
  if (typeof payload === 'string') {
    return payload.trim();
  }
  if (typeof payload === 'number' || typeof payload === 'boolean') {
    return String(payload);
  }
  if (typeof payload === 'object') {
    const directMessage = String(
      payload.message
      || payload.msg
      || payload.error
      || payload.title
      || payload.statusText
      || payload?.data?.message
      || payload?.data?.error
      || ''
    ).trim();
    if (directMessage) {
      return directMessage;
    }
    try {
      return JSON.stringify(payload);
    } catch {
      return '[object]';
    }
  }
  return String(payload);
}

function getSelectedHeroSmsCountryOption() {
  const selectedCountries = syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  if (selectedCountries.length) {
    return selectedCountries[0];
  }
  return isFiveSimProviderSelected()
    ? { id: DEFAULT_FIVE_SIM_COUNTRY_ID, label: DEFAULT_FIVE_SIM_COUNTRY_LABEL }
    : { id: DEFAULT_HERO_SMS_COUNTRY_ID, label: DEFAULT_HERO_SMS_COUNTRY_LABEL };
}

function getFiveSimCountryOptionLabel(code = '') {
  const normalizedCode = normalizeFiveSimCountryCode(code, '');
  if (!normalizedCode) {
    return '';
  }
  const matched = Array.from(selectFiveSimCountry?.options || [])
    .find((option) => normalizeFiveSimCountryCode(option.value, '') === normalizedCode);
  if (matched) {
    return normalizeFiveSimCountryLabel(matched.textContent, normalizedCode);
  }
  const fallback = FIVE_SIM_SUPPORTED_COUNTRY_ITEMS.find((item) => item.id === normalizedCode);
  return fallback ? formatFiveSimCountryDisplayLabel(fallback.id, fallback.eng, fallback.id) : normalizedCode;
}

function getNexSmsCountryLabelById(id) {
  const countryId = normalizeNexSmsCountryIdValue(id, -1);
  if (countryId < 0) {
    return '';
  }
  const matched = Array.from(selectNexSmsCountry?.options || [])
    .find((option) => normalizeNexSmsCountryIdValue(option.value, -1) === countryId);
  return normalizeNexSmsCountryLabel(matched?.textContent || '', `Country #${countryId}`);
}

function getSelectedFiveSimCountries() {
  return syncFiveSimCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
}

function getSelectedNexSmsCountries() {
  return syncNexSmsCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
}

function updateHeroSmsPlatformDisplay() {
  if (!displayHeroSmsPlatform) {
    return;
  }
  const provider = getSelectedPhoneSmsProvider();
  const selected = provider === PHONE_SMS_PROVIDER_FIVE_SIM
    ? (getSelectedFiveSimCountries()[0] || { id: DEFAULT_FIVE_SIM_COUNTRY_ID, label: DEFAULT_FIVE_SIM_COUNTRY_LABEL })
    : (provider === PHONE_SMS_PROVIDER_NEXSMS
      ? (getSelectedNexSmsCountries()[0] || { id: DEFAULT_NEX_SMS_COUNTRY_ORDER[0], label: `Country #${DEFAULT_NEX_SMS_COUNTRY_ORDER[0]}` })
      : getSelectedHeroSmsCountryOption());
  const countryText = selected?.label ? ` / ${selected.label}` : '';
  displayHeroSmsPlatform.textContent = `${getPhoneSmsProviderLabel(provider)} / OpenAI${countryText}`;
  if (inputHeroSmsApiKey) {
    if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      inputHeroSmsApiKey.placeholder = '请输入 5sim API Key';
    } else if (provider === PHONE_SMS_PROVIDER_NEXSMS) {
      inputHeroSmsApiKey.placeholder = '请输入 NexSMS API Key';
    } else if (provider === PHONE_SMS_PROVIDER_SMSBOWER) {
      inputHeroSmsApiKey.placeholder = '请输入 SMSBower API Key';
    } else if (provider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      inputHeroSmsApiKey.placeholder = '请输入 SMS Verification Number API Key';
    } else if (provider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      inputHeroSmsApiKey.placeholder = '请输入 GrizzlySMS API Key';
    } else if (provider === PHONE_SMS_PROVIDER_SMSPOOL) {
      inputHeroSmsApiKey.placeholder = '请输入 SMSPool API Key';
    } else if (provider === PHONE_SMS_PROVIDER_CHATGPT_API) {
      inputHeroSmsApiKey.placeholder = 'ChatGPT API 接码无需填写平台 API Key';
    } else {
      inputHeroSmsApiKey.placeholder = '请输入 HeroSMS API Key';
    }
  }
}

function getHeroSmsCountryLabelById(id) {
  const targetId = String(id || '').trim();
  const countrySelect = selectHeroSmsCountry || selectHeroSmsCountryFallback;
  if (!targetId || !countrySelect) {
    return '';
  }
  const matched = Array.from(countrySelect.options).find((option) => option.value === targetId);
  return String(matched?.textContent || '').trim()
    || (isFiveSimProviderSelected() ? targetId : `Country #${targetId}`);
}

function renderHeroSmsCountryFallbackOrder(countries = []) {
  if (!displayHeroSmsCountryFallbackOrder) {
    return;
  }
  displayHeroSmsCountryFallbackOrder.textContent = '';
  const normalized = isFiveSimProviderSelected() ? normalizeFiveSimCountryFallbackList(countries) : normalizeHeroSmsCountryFallbackList(countries);
  if (!normalized.length) {
    displayHeroSmsCountryFallbackOrder.textContent = '未设置';
    return;
  }
  normalized.forEach((country, index) => {
    const chip = document.createElement('span');
    chip.className = 'country-order-chip';
    const label = document.createElement('span');
    label.className = 'country-order-chip-label';
    label.textContent = `${index + 1}. ${country.label}(${country.id})`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'country-order-remove';
    removeBtn.title = `移除 ${country.label}`;
    removeBtn.setAttribute('aria-label', `移除 ${country.label}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeHeroSmsCountryFromOrder(country.id);
    });
    chip.appendChild(label);
    chip.appendChild(removeBtn);
    displayHeroSmsCountryFallbackOrder.appendChild(chip);
    if (index < normalized.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'country-order-separator';
      separator.textContent = '→';
      displayHeroSmsCountryFallbackOrder.appendChild(separator);
    }
  });
  if (typeof renderHeroSmsOperatorControls === 'function') {
    renderHeroSmsOperatorControls(normalized);
  }
}

function setHeroSmsCountryMenuOpen(open) {
  const nextOpen = Boolean(open);
  if (btnHeroSmsCountryMenu) {
    btnHeroSmsCountryMenu.setAttribute('aria-expanded', String(nextOpen));
  }
  if (heroSmsCountryMenu) {
    heroSmsCountryMenu.hidden = !nextOpen;
    if (nextOpen) {
      const searchInput = heroSmsCountryMenu.querySelector('.hero-sms-country-menu-search-input');
      if (searchInput) {
        // Always reset previous keyword on open to avoid accidental "empty list" state.
        heroSmsCountryMenuSearchKeyword = '';
        searchInput.value = '';
        applyHeroSmsCountryMenuFilter('');
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 0);
      }
    }
  }
}

function applyHeroSmsCountryMenuFilter(keyword = '') {
  if (!heroSmsCountryMenu) {
    return;
  }
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  const items = Array.from(heroSmsCountryMenu.querySelectorAll('.hero-sms-country-menu-item'));
  let visibleCount = 0;
  items.forEach((item) => {
    const haystack = String(item.dataset.searchText || '').toLowerCase();
    const visible = !normalizedKeyword || haystack.includes(normalizedKeyword);
    item.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });

  let empty = heroSmsCountryMenu.querySelector('.hero-sms-country-menu-empty');
  if (visibleCount === 0) {
    if (!empty) {
      empty = document.createElement('span');
      empty.className = 'data-value hero-sms-country-menu-empty';
      empty.textContent = '没有匹配国家';
      heroSmsCountryMenu.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function updateHeroSmsCountryMenuSummary(selectedCountries = []) {
  if (!btnHeroSmsCountryMenu) {
    return;
  }
  const normalized = isFiveSimProviderSelected() ? normalizeFiveSimCountryFallbackList(selectedCountries) : normalizeHeroSmsCountryFallbackList(selectedCountries);
  if (!normalized.length) {
    btnHeroSmsCountryMenu.textContent = `\u672a\u9009\u62e9 (0/${HERO_SMS_COUNTRY_SELECTION_MAX})`;
    return;
  }
  const labels = normalized.map((country) => country.label);
  btnHeroSmsCountryMenu.textContent = `${labels.join(' / ')} (${normalized.length}/${HERO_SMS_COUNTRY_SELECTION_MAX})`;
}

function renderHeroSmsCountryChoiceButtons() {
  if (!heroSmsCountryMenu || !selectHeroSmsCountry) {
    return;
  }
  const options = Array.from(selectHeroSmsCountry.options || []);
  const selectedOrder = [...heroSmsCountrySelectionOrder];
  const selectedSet = new Set(selectedOrder.map((id) => String(id)));

  heroSmsCountryMenu.innerHTML = '';
  const searchWrap = document.createElement('div');
  searchWrap.className = 'hero-sms-country-menu-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'data-input mono hero-sms-country-menu-search-input';
  searchInput.placeholder = '搜索国家（中/英/代码/ID）';
  searchInput.value = heroSmsCountryMenuSearchKeyword;
  searchInput.addEventListener('input', () => {
    heroSmsCountryMenuSearchKeyword = String(searchInput.value || '').trim();
    applyHeroSmsCountryMenuFilter(heroSmsCountryMenuSearchKeyword);
  });
  searchWrap.appendChild(searchInput);
  heroSmsCountryMenu.appendChild(searchWrap);

  if (!options.length) {
    const empty = document.createElement('span');
    empty.className = 'data-value hero-sms-country-menu-empty';
    empty.textContent = '暂无国家选项';
    heroSmsCountryMenu.appendChild(empty);
    updateHeroSmsCountryMenuSummary([]);
    return;
  }

  options.forEach((option) => {
    const countryId = String(option.value || '').trim();
    if (!countryId) {
      return;
    }
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'header-dropdown-item hero-sms-country-menu-item';
    const active = selectedSet.has(countryId);
    const orderIndex = active
      ? selectedOrder.findIndex((id) => String(id) === countryId) + 1
      : 0;
    const label = String(option.textContent || '').trim() || `Country #${countryId}`;
    item.classList.toggle('is-active', active);
    const labelText = document.createElement('span');
    labelText.className = 'hero-sms-country-menu-item-label';
    labelText.textContent = label;
    const badge = document.createElement('span');
    badge.className = 'hero-sms-country-menu-item-badge';
    badge.textContent = active ? `✓ ${orderIndex}` : '';
    item.appendChild(labelText);
    item.appendChild(badge);
    item.dataset.searchText = `${label} ${countryId} ${heroSmsCountrySearchTextById.get(countryId) || ''}`;
    item.addEventListener('click', () => {
      option.selected = !option.selected;
      syncHeroSmsFallbackSelectionOrderFromSelect({
        enforceMax: true,
        ensureDefault: false,
        showLimitToast: true,
      });
      updateHeroSmsPlatformDisplay();
      markSettingsDirty(true);
      saveSettings({ silent: true }).catch(() => { });
    });
    heroSmsCountryMenu.appendChild(item);
  });

  applyHeroSmsCountryMenuFilter(heroSmsCountryMenuSearchKeyword);

  updateHeroSmsCountryMenuSummary(
    selectedOrder.map((id) => ({
      id,
      label: getHeroSmsCountryLabelById(id),
    }))
  );
}

function syncHeroSmsFallbackSelectionOrderFromSelect(options = {}) {
  const countrySelect = selectHeroSmsCountry || selectHeroSmsCountryFallback;
  const selectionLimit = Math.max(1, Math.floor(Number(options.maxSelection) || HERO_SMS_COUNTRY_SELECTION_MAX));
  const enforceMax = options.enforceMax !== false;
  const ensureDefault = options.ensureDefault !== false;
  const showLimitToast = Boolean(options.showLimitToast);

  if (!countrySelect) {
    const defaultCountry = isFiveSimProviderSelected()
      ? { id: DEFAULT_FIVE_SIM_COUNTRY_ID, label: DEFAULT_FIVE_SIM_COUNTRY_LABEL }
      : { id: normalizeHeroSmsCountryId(DEFAULT_HERO_SMS_COUNTRY_ID), label: DEFAULT_HERO_SMS_COUNTRY_LABEL };
    heroSmsCountrySelectionOrder = [defaultCountry.id];
    renderHeroSmsCountryFallbackOrder([defaultCountry]);
    return [defaultCountry];
  }

  const selectedIds = Array.from(countrySelect.options)
    .filter((option) => option.selected)
    .map((option) => normalizePhoneSmsCountryId(option.value, getSelectedPhoneSmsProvider()))
    .filter(Boolean);
  if (!selectedIds.length && !countrySelect.multiple) {
    const fallbackId = normalizePhoneSmsCountryId(countrySelect.value, getSelectedPhoneSmsProvider());
    if (fallbackId) {
      selectedIds.push(fallbackId);
    }
  }

  const selectedSet = new Set(selectedIds);
  let nextOrder = heroSmsCountrySelectionOrder.filter((id) => selectedSet.has(id));
  selectedIds.forEach((id) => {
    if (!nextOrder.includes(id)) {
      nextOrder.push(id);
    }
  });

  if (ensureDefault && !nextOrder.length) {
    const defaultId = normalizePhoneSmsCountryId(countrySelect.value || (isFiveSimProviderSelected() ? DEFAULT_FIVE_SIM_COUNTRY_ID : DEFAULT_HERO_SMS_COUNTRY_ID));
    nextOrder = [defaultId];
  }

  if (enforceMax && nextOrder.length > selectionLimit) {
    const droppedCount = nextOrder.length - selectionLimit;
    nextOrder = nextOrder.slice(0, selectionLimit);
    if (showLimitToast && droppedCount > 0 && typeof showToast === 'function') {
      showToast(`接码国家最多选择 ${selectionLimit} 个，已保留前 ${selectionLimit} 个。`, 'warn', 2200);
    }
  }

  const nextOrderSet = new Set(nextOrder.map((id) => String(id)));
  Array.from(countrySelect.options).forEach((option) => {
    option.selected = nextOrderSet.has(String(option.value));
  });

  heroSmsCountrySelectionOrder = nextOrder;
  const selectedCountries = heroSmsCountrySelectionOrder.map((id) => ({
    id,
    label: getHeroSmsCountryLabelById(id),
  }));
  renderHeroSmsCountryFallbackOrder(selectedCountries);
  renderHeroSmsCountryChoiceButtons();
  return selectedCountries;
}

function applyHeroSmsFallbackSelection(countries = [], options = {}) {
  const includePrimary = Boolean(options.includePrimary);
  const normalizeFallbackForCurrentProvider = isFiveSimProviderSelected()
    ? normalizeFiveSimCountryFallbackList
    : normalizeHeroSmsCountryFallbackList;
  const sourceCountries = includePrimary
    ? countries
    : [
      getSelectedHeroSmsCountryOption(),
      ...normalizeFallbackForCurrentProvider(countries),
    ];
  const normalized = (isFiveSimProviderSelected()
    ? normalizeFiveSimCountryFallbackList(sourceCountries)
    : normalizeHeroSmsCountryFallbackList(sourceCountries)
  ).slice(0, HERO_SMS_COUNTRY_SELECTION_MAX);
  const selectedIds = normalized
    .map((entry) => normalizePhoneSmsCountryId(entry.id, getSelectedPhoneSmsProvider()))
    .filter(Boolean);

  const countrySelect = selectHeroSmsCountry || selectHeroSmsCountryFallback;
  if (countrySelect) {
    const selectedSet = new Set(selectedIds.map((id) => String(id)));
    Array.from(countrySelect.options).forEach((option) => {
      option.selected = selectedSet.has(String(option.value));
    });
  }
  heroSmsCountrySelectionOrder = [...selectedIds];
  return syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
}

function removeHeroSmsCountryFromOrder(id) {
  const provider = getSelectedPhoneSmsProvider();
  const normalizedId = normalizePhoneSmsCountryId(id, provider);
  if (!normalizedId) {
    return [];
  }
  heroSmsCountrySelectionOrder = heroSmsCountrySelectionOrder
    .filter((entry) => String(entry) !== String(normalizedId));
  [selectHeroSmsCountry, selectHeroSmsCountryFallback].forEach((selectEl) => {
    if (!selectEl) {
      return;
    }
    Array.from(selectEl.options || []).forEach((option) => {
      if (String(normalizePhoneSmsCountryId(option.value, provider)) === String(normalizedId)) {
        option.selected = false;
      }
    });
  });
  const nextOrder = syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  updateHeroSmsPlatformDisplay();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  return nextOrder;
}

function normalizePhoneActivationState(record = {}) {
  if (!record || typeof record !== 'object' || Array.isArray(record)) {
    return null;
  }
  const provider = normalizePhoneSmsProviderValue(record.provider || latestState?.phoneSmsProvider || PHONE_SMS_PROVIDER_HERO);
  const activationId = String(record.activationId ?? record.id ?? record.activation ?? '').trim();
  const phoneNumber = String(record.phoneNumber ?? record.phone ?? record.number ?? '').trim();
  if (!activationId || !phoneNumber) {
    return null;
  }
  const normalized = {
    provider,
    activationId,
    phoneNumber,
    serviceCode: String(record.serviceCode || '').trim(),
    successfulUses: Math.max(0, Math.floor(Number(record.successfulUses) || 0)),
    maxUses: Math.max(1, Math.floor(Number(record.maxUses) || 3)),
  };
  const operator = normalizeHeroSmsOperatorValue(record.operator);
  if (operator) {
    normalized.operator = operator;
  }

  if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
    normalized.countryId = normalizeFiveSimCountryCode(
      record.countryCode || record.countryId || '',
      ''
    );
  } else if (provider === PHONE_SMS_PROVIDER_NEXSMS) {
    normalized.countryId = normalizeNexSmsCountryId(record.countryId, -1);
  } else {
    normalized.countryId = normalizeHeroSmsCountryId(record.countryId, 0);
  }

  const countryLabel = String(record.countryLabel || '').trim();
  if (countryLabel) {
    normalized.countryLabel = countryLabel;
  }
  const expiresAt = Number(record.expiresAt);
  if (Number.isFinite(expiresAt) && expiresAt > 0) {
    normalized.expiresAt = Math.floor(expiresAt);
  }
  return normalized;
}

function buildPhoneActivationOptionKey(activation) {
  const normalized = normalizePhoneActivationState(activation);
  if (!normalized) {
    return '';
  }
  return [
    normalized.provider,
    String(normalized.activationId || '').trim(),
    String(normalized.phoneNumber || '').trim(),
  ].join('::');
}

function resolvePhoneActivationCountryLabel(activation = null) {
  const normalized = normalizePhoneActivationState(activation);
  if (!normalized) {
    return '';
  }
  if (normalized.countryLabel) {
    return normalized.countryLabel;
  }
  if (normalized.provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
    return String(normalized.countryId || '').trim();
  }
  if (normalized.provider === PHONE_SMS_PROVIDER_NEXSMS) {
    const countryId = normalizeNexSmsCountryId(normalized.countryId, -1);
    return countryId >= 0 ? `Country #${countryId}` : '';
  }
  return normalizeHeroSmsCountryLabel(
    getHeroSmsCountryLabelById(normalized.countryId || '')
  );
}

function getPhoneSmsProviderLabel(provider = '') {
  const normalized = normalizePhoneSmsProviderValue(provider);
  if (normalized === PHONE_SMS_PROVIDER_FIVE_SIM) {
    return '5sim';
  }
  if (normalized === PHONE_SMS_PROVIDER_NEXSMS) {
    return 'NexSMS';
  }
  return 'HeroSMS';
}

function buildPhoneActivationOptionLabel(activation = null, sourceLabel = '') {
  const normalized = normalizePhoneActivationState(activation);
  if (!normalized) {
    return '';
  }
  const countryLabel = resolvePhoneActivationCountryLabel(normalized);
  const providerLabel = getPhoneSmsProviderLabel(normalized.provider);
  const operatorLabel = normalized.operator ? ` / ${normalized.operator}` : '';
  const reuseLabel = normalized.maxUses > 1
    ? ` / ${Math.max(0, normalized.successfulUses) + 1}/${normalized.maxUses}`
    : '';
  const sourcePrefix = sourceLabel ? `[${sourceLabel}] ` : '';
  return `${sourcePrefix}${normalized.phoneNumber} / ${providerLabel}${countryLabel ? ` / ${countryLabel}` : ''}${operatorLabel} (#${normalized.activationId})${reuseLabel}`;
}

function stopPhoneRuntimeCountdownTicker() {
  clearInterval(phoneRuntimeCountdownTimer);
  phoneRuntimeCountdownTimer = null;
}

function renderPhoneRuntimeCountdown() {
  if (!displayHeroSmsCurrentCountdown) {
    return;
  }
  const hasActivation = Boolean(normalizePhoneActivationState(latestState?.currentPhoneActivation));
  const endsAt = Number(phoneRuntimeCountdownEndsAt) || 0;
  const now = Date.now();
  if (!hasActivation || !Number.isFinite(endsAt) || endsAt <= 0) {
    displayHeroSmsCurrentCountdown.textContent = hasActivation ? '等待中' : '未启动';
    stopPhoneRuntimeCountdownTicker();
    return;
  }
  const remainingMs = endsAt - now;
  const windowHint = (
    phoneRuntimeCountdownWindowTotal > 0
      ? `（${Math.max(1, phoneRuntimeCountdownWindowIndex)}/${phoneRuntimeCountdownWindowTotal}）`
      : ''
  );
  if (remainingMs <= 0) {
    displayHeroSmsCurrentCountdown.textContent = `00:00:00${windowHint}`;
    stopPhoneRuntimeCountdownTicker();
    return;
  }
  displayHeroSmsCurrentCountdown.textContent = `${formatCountdown(remainingMs)}${windowHint}`;
}

function syncPhoneRuntimeCountdown(state = {}) {
  phoneRuntimeCountdownEndsAt = Math.max(0, Number(state?.currentPhoneVerificationCountdownEndsAt) || 0);
  phoneRuntimeCountdownWindowIndex = Math.max(0, Math.floor(Number(state?.currentPhoneVerificationCountdownWindowIndex) || 0));
  phoneRuntimeCountdownWindowTotal = Math.max(0, Math.floor(Number(state?.currentPhoneVerificationCountdownWindowTotal) || 0));
  renderPhoneRuntimeCountdown();
  if (phoneRuntimeCountdownEndsAt > Date.now()) {
    if (!phoneRuntimeCountdownTimer) {
      phoneRuntimeCountdownTimer = setInterval(() => {
        renderPhoneRuntimeCountdown();
      }, 1000);
    }
  } else {
    stopPhoneRuntimeCountdownTicker();
  }
}

function renderPhonePreferredActivationOptions(state = {}) {
  if (!selectHeroSmsPreferredActivation) {
    return;
  }
  const provider = normalizePhoneSmsProviderValue(
    state?.phoneSmsProvider || latestState?.phoneSmsProvider || getSelectedPhoneSmsProvider()
  );
  const selectedPreferred = normalizePhoneActivationState(state?.phonePreferredActivation || latestState?.phonePreferredActivation);
  const reusablePool = Array.isArray(state?.phoneReusableActivationPool)
    ? state.phoneReusableActivationPool
    : (Array.isArray(latestState?.phoneReusableActivationPool) ? latestState.phoneReusableActivationPool : []);
  const optionEntries = [];
  const seen = new Set();
  const pushActivationOption = (activation, sourceLabel) => {
    const normalized = normalizePhoneActivationState(activation);
    if (!normalized || normalized.provider !== provider) {
      return;
    }
    const key = buildPhoneActivationOptionKey(normalized);
    if (!key || seen.has(key)) {
      return;
    }
    seen.add(key);
    optionEntries.push({
      key,
      activation: normalized,
      label: buildPhoneActivationOptionLabel(normalized, sourceLabel),
    });
  };
  pushActivationOption(state?.currentPhoneActivation || latestState?.currentPhoneActivation, '当前');
  pushActivationOption(state?.reusablePhoneActivation || latestState?.reusablePhoneActivation, '复用');
  reusablePool.forEach((activation) => pushActivationOption(activation, '池'));
  pushActivationOption(selectedPreferred, '已选');

  phonePreferredActivationOptionMap.clear();
  selectHeroSmsPreferredActivation.innerHTML = '';
  const autoOption = document.createElement('option');
  autoOption.value = '';
  autoOption.textContent = '自动（先复用已有可用号，再创建新号）';
  selectHeroSmsPreferredActivation.appendChild(autoOption);
  optionEntries.forEach((entry) => {
    phonePreferredActivationOptionMap.set(entry.key, entry.activation);
    const option = document.createElement('option');
    option.value = entry.key;
    option.textContent = entry.label;
    selectHeroSmsPreferredActivation.appendChild(option);
  });

  const selectedKey = buildPhoneActivationOptionKey(selectedPreferred);
  if (selectedKey && phonePreferredActivationOptionMap.has(selectedKey)) {
    selectHeroSmsPreferredActivation.value = selectedKey;
  } else {
    selectHeroSmsPreferredActivation.value = '';
  }
}

function getSelectedPhonePreferredActivation() {
  if (!selectHeroSmsPreferredActivation) {
    return null;
  }
  const selectedKey = String(selectHeroSmsPreferredActivation.value || '').trim();
  if (!selectedKey) {
    return null;
  }
  const activation = phonePreferredActivationOptionMap.get(selectedKey);
  return activation ? { ...activation } : null;
}

function resolveFailedSignupPhoneReuseActivationForDisplay(state = {}) {
  const hasStateValue = state
    && typeof state === 'object'
    && Object.prototype.hasOwnProperty.call(state, 'failedSignupPhoneReuseActivation');
  const activation = hasStateValue
    ? state.failedSignupPhoneReuseActivation
    : latestState?.failedSignupPhoneReuseActivation;
  if (!activation || typeof activation !== 'object' || Array.isArray(activation)) {
    return null;
  }
  const phoneNumber = String(activation.phoneNumber ?? activation.phone ?? activation.number ?? '').trim();
  if (!phoneNumber) {
    return null;
  }
  const activationId = String(activation.activationId ?? activation.id ?? activation.activation ?? '').trim();
  return {
    ...activation,
    phoneNumber,
    activationId,
  };
}

function updateHeroSmsRuntimeDisplay(state = {}) {
  if (displayHeroSmsCurrentNumber) {
    const activation = normalizePhoneActivationState(state?.currentPhoneActivation || latestState?.currentPhoneActivation);
    const phoneNumber = String(activation?.phoneNumber || '').trim();
    const activationId = String(activation?.activationId || '').trim();
    const countryLabel = normalizePhoneSmsCountryLabel(
      activation?.countryLabel || getHeroSmsCountryLabelById(activation?.countryId || ''),
      activation?.provider || getSelectedPhoneSmsProvider()
    );
    const operatorLabel = activation?.operator ? ` / ${activation.operator}` : '';
    displayHeroSmsCurrentNumber.textContent = phoneNumber
      ? `${phoneNumber}${activationId ? ` (#${activationId})` : ''}${countryLabel ? ` / ${countryLabel}` : ''}${operatorLabel}`
      : '未分配';
  }
  if (displayHeroSmsCurrentCode) {
    const code = String(state?.currentPhoneVerificationCode ?? latestState?.currentPhoneVerificationCode ?? '').trim();
    displayHeroSmsCurrentCode.textContent = code || '未获取';
  }
  if (displayFreeReusablePhone || displayFreeReusablePhoneCountry || inputFreeReusablePhone) {
    const activation = state?.freeReusablePhoneActivation ?? latestState?.freeReusablePhoneActivation ?? null;
    const phoneNumber = String(activation?.phoneNumber || '').trim();
    const activationId = String(activation?.activationId || '').trim();
    const successfulUses = Number.isFinite(Number(activation?.successfulUses))
      ? Number(activation.successfulUses)
      : null;
    const maxUses = Number.isFinite(Number(activation?.maxUses))
      ? Number(activation.maxUses)
      : null;
    const countryLabel = normalizePhoneSmsCountryLabel(
      activation?.countryLabel
      || getHeroSmsCountryLabelById(activation?.countryId || '')
      || state?.heroSmsCountryLabel
      || latestState?.heroSmsCountryLabel
      || getHeroSmsCountryLabelById(state?.heroSmsCountryId || latestState?.heroSmsCountryId || ''),
      activation?.provider || getSelectedPhoneSmsProvider()
    );
    const usesText = successfulUses !== null || maxUses !== null
      ? ` / ${successfulUses ?? 0}/${maxUses ?? 3}`
      : '';
    if (displayFreeReusablePhone) {
      displayFreeReusablePhone.textContent = phoneNumber
        ? `${phoneNumber}${activationId ? ` (#${activationId})` : ''}${usesText}`
        : '未保存';
    }
    if (displayFreeReusablePhoneCountry) {
      displayFreeReusablePhoneCountry.textContent = phoneNumber
        ? `地区：${countryLabel || '未保存'}`
        : '地区：未保存';
    }
    if (inputFreeReusablePhone) {
      inputFreeReusablePhone.value = phoneNumber;
    }
  }
  if (rowFailedSignupPhoneReuse || displayFailedSignupPhoneReuse || displayFailedSignupPhoneReuseCountry) {
    const activation = resolveFailedSignupPhoneReuseActivationForDisplay(state);
    const phoneNumber = String(activation?.phoneNumber || '').trim();
    const activationId = String(activation?.activationId || '').trim();
    const countryLabel = normalizePhoneSmsCountryLabel(
      activation?.countryLabel
      || getHeroSmsCountryLabelById(activation?.countryId || ''),
      activation?.provider || getSelectedPhoneSmsProvider()
    );
    if (rowFailedSignupPhoneReuse) {
      rowFailedSignupPhoneReuse.style.display = phoneNumber ? '' : 'none';
    }
    if (displayFailedSignupPhoneReuse) {
      displayFailedSignupPhoneReuse.textContent = phoneNumber
        ? `${phoneNumber}${activationId ? ` (#${activationId})` : ''}`
        : '未保存';
    }
    if (displayFailedSignupPhoneReuseCountry) {
      displayFailedSignupPhoneReuseCountry.textContent = phoneNumber
        ? `地区：${countryLabel || '未保存'}`
        : '地区：未保存';
    }
  }
  syncPhoneRuntimeCountdown(state);
  renderPhonePreferredActivationOptions(state);
}

function applyFreeReusablePhoneMutationResult(refreshedState = {}, mutationResult = {}, options = {}) {
  const { clear = false } = options;
  const explicitActivation = clear
    ? null
    : (
      mutationResult?.freeReusablePhoneActivation
      || mutationResult?.state?.freeReusablePhoneActivation
      || null
    );
  const statePatch = {
    ...(refreshedState || {}),
    ...(mutationResult?.state || {}),
    ...(clear || explicitActivation
      ? { freeReusablePhoneActivation: explicitActivation }
      : {}),
  };
  syncLatestState(statePatch);
  updateHeroSmsRuntimeDisplay(latestState || statePatch);
}

async function refreshFreeReusablePhoneStateFallback(mutationResult = {}, options = {}) {
  if (mutationResult?.state || mutationResult?.freeReusablePhoneActivation || options.clear) {
    applyFreeReusablePhoneMutationResult(latestState, mutationResult, options);
    return;
  }
  try {
    const refreshedState = await chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' });
    applyFreeReusablePhoneMutationResult(refreshedState || latestState, mutationResult, options);
  } catch (error) {
    console.warn('Failed to refresh free reusable phone state:', error);
    applyFreeReusablePhoneMutationResult(latestState, mutationResult, options);
  }
}

async function loadHeroSmsCountries(options = {}) {
  const countrySelect = selectHeroSmsCountry || selectHeroSmsCountryFallback;
  if (!countrySelect) {
    return;
  }
  const silent = Boolean(options?.silent);
  const preferFallbackOnly = Boolean(options?.preferFallbackOnly);

  const provider = getSelectedPhoneSmsProvider();
  const previousSelectionOrder = [...heroSmsCountrySelectionOrder];
  const previousSelectedIds = previousSelectionOrder.length
    ? previousSelectionOrder
    : Array.from(countrySelect.options)
        .filter((option) => option.selected)
        .map((option) => normalizePhoneSmsCountryId(option.value, provider))
        .filter(Boolean);

  const applyOptions = (optionItems = [], selectEl) => {
    if (!selectEl) {
      return;
    }
    selectEl.innerHTML = '';
    optionItems.forEach((entry) => {
      const option = document.createElement('option');
      option.value = String(entry.id);
      option.textContent = entry.label;
      selectEl.appendChild(option);
    });
  };
  const applyFiveSimFallbackOptions = () => {
    const fallbackItems = FIVE_SIM_SUPPORTED_COUNTRY_ITEMS.map((item) => ({
      id: item.id,
      label: formatFiveSimCountryDisplayLabel(item.id, item.eng),
      searchText: item.searchText,
    }));
    applyOptions(fallbackItems, selectHeroSmsCountry);
    applyOptions(fallbackItems, selectHeroSmsCountryFallback);
    heroSmsCountrySearchTextById.clear();
    fallbackItems.forEach((entry) => heroSmsCountrySearchTextById.set(String(entry.id), entry.searchText));
  };
  const applyHeroSmsFallbackOptions = () => {
    const fallbackItems = HERO_SMS_FALLBACK_COUNTRY_ITEMS
      .map((item) => {
        const id = normalizeHeroSmsCountryId(item.id);
        const label = buildHeroSmsCountryDisplayLabel(item);
        return {
          id,
          label: String(label || '').trim() || `Country #${id}`,
          searchText: buildHeroSmsCountrySearchText(item, label, String(id)),
        };
      })
      .filter((item) => item.id > 0);
    if (!fallbackItems.some((item) => item.id === DEFAULT_HERO_SMS_COUNTRY_ID)) {
      fallbackItems.unshift({
        id: DEFAULT_HERO_SMS_COUNTRY_ID,
        label: DEFAULT_HERO_SMS_COUNTRY_LABEL,
        searchText: `${DEFAULT_HERO_SMS_COUNTRY_LABEL} ${DEFAULT_HERO_SMS_COUNTRY_ID}`,
      });
    }
    applyOptions(fallbackItems, selectHeroSmsCountry);
    applyOptions(fallbackItems, selectHeroSmsCountryFallback);
    heroSmsCountrySearchTextById.clear();
    fallbackItems.forEach((entry) => {
      heroSmsCountrySearchTextById.set(String(entry.id), entry.searchText);
    });
  };

  if (provider !== PHONE_SMS_PROVIDER_FIVE_SIM && provider !== PHONE_SMS_PROVIDER_NEXSMS) {
    await loadHeroSmsOperators({ silent: true });
  }

  if (provider === PHONE_SMS_PROVIDER_FIVE_SIM && preferFallbackOnly) {
    applyFiveSimFallbackOptions();
  } else if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      const response = await fetch('https://5sim.net/v1/guest/countries', {
        signal: controller.signal,
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = await response.json();
      const countriesPayload = payload && typeof payload === 'object' && !Array.isArray(payload) ? payload : {};
      const optionItems = Object.entries(countriesPayload)
        .map(([slug, entry]) => {
          const id = normalizeFiveSimCountryId(slug, '');
          const label = formatFiveSimCountryDisplayLabel(id, entry?.text_en || slug, slug);
          return {
            id,
            label,
            searchText: [
              slug,
              label,
              entry?.text_en,
              entry?.text_ru,
              Object.keys(entry?.iso || {}).join(' '),
              Object.keys(entry?.prefix || {}).join(' '),
            ].filter(Boolean).join(' '),
          };
        })
        .filter((entry) => entry.id)
        .sort((left, right) => String(left.label || '').localeCompare(String(right.label || '')));
      if (!optionItems.length) {
        throw new Error('国家列表为空');
      }
      heroSmsCountrySearchTextById.clear();
      optionItems.forEach((entry) => heroSmsCountrySearchTextById.set(String(entry.id), entry.searchText));
      applyOptions(optionItems, selectHeroSmsCountry);
      applyOptions(optionItems, selectHeroSmsCountryFallback);
    } catch (error) {
      applyFiveSimFallbackOptions();
      if (!silent && typeof showToast === 'function') {
        showToast(`5sim 国家列表加载失败：${normalizeHeroSmsFetchErrorMessage(error)}（已切换为内置国家列表）`, 'warn', 2800);
      }
    }
  } else if (preferFallbackOnly) {
    applyHeroSmsFallbackOptions();
  } else try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://hero-sms.com/stubs/handler_api.php?action=getCountries', {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);
    const payload = await response.json();
    const countries = parseHeroSmsCountryPayload(payload);
    if (!countries.length) {
      throw new Error('国家列表为空');
    }
    const optionItems = countries
      .filter((item) => Number(item?.id) > 0 && (String(item?.eng || '').trim() || String(item?.chn || '').trim()))
      .sort((left, right) => String(left.eng || '').localeCompare(String(right.eng || '')))
      .map((item) => {
        const id = normalizeHeroSmsCountryId(item.id);
        const label = buildHeroSmsCountryDisplayLabel(item);
        return {
          id,
          label: String(label || '').trim() || `Country #${id}`,
          searchText: buildHeroSmsCountrySearchText(item, label, String(id)),
        };
      });

    if (!optionItems.length) {
      throw new Error('国家列表为空');
    }

    heroSmsCountrySearchTextById.clear();
    optionItems.forEach((entry) => {
      heroSmsCountrySearchTextById.set(String(entry.id), entry.searchText);
    });

    applyOptions(optionItems, selectHeroSmsCountry);
    applyOptions(optionItems, selectHeroSmsCountryFallback);
  } catch (error) {
    applyHeroSmsFallbackOptions();
    if (!silent && typeof showToast === 'function') {
      showToast(`国家列表加载失败：${normalizeHeroSmsFetchErrorMessage(error)}（已切换为内置国家列表）`, 'warn', 2800);
    }
  }
  const availableIds = new Set(Array.from(countrySelect.options).map((option) => String(option.value)));
  const normalizedSelectedIds = previousSelectedIds
    .map((id) => String(id))
    .filter((id) => availableIds.has(id))
    .map((id) => normalizePhoneSmsCountryId(id, provider));
  heroSmsCountrySelectionOrder = normalizedSelectedIds;
  const selectedSet = new Set(normalizedSelectedIds.map((id) => String(id)));
  Array.from(countrySelect.options).forEach((option) => {
    option.selected = selectedSet.has(String(option.value));
  });
  syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  updateHeroSmsPlatformDisplay();
}

function getFiveSimCountryLabelByCode(code = '') {
  const normalizedCode = normalizeFiveSimCountryCode(code, '');
  if (!normalizedCode || !selectFiveSimCountry) {
    return '';
  }
  const matched = Array.from(selectFiveSimCountry.options || [])
    .find((option) => String(option.value || '').trim() === normalizedCode);
  return normalizeFiveSimCountryLabel(matched?.textContent || '', normalizedCode);
}

function renderFiveSimCountryFallbackOrder(countries = []) {
  if (!displayFiveSimCountryFallbackOrder) {
    return;
  }
  const normalized = normalizeFiveSimCountryFallbackList(countries);
  displayFiveSimCountryFallbackOrder.textContent = '';
  if (!normalized.length) {
    displayFiveSimCountryFallbackOrder.textContent = '未设置';
    return;
  }
  normalized.forEach((country, index) => {
    const chip = document.createElement('span');
    chip.className = 'country-order-chip';
    const label = document.createElement('span');
    label.className = 'country-order-chip-label';
    label.textContent = `${index + 1}. ${country.label}`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'country-order-remove';
    removeBtn.title = `移除 ${country.label}`;
    removeBtn.setAttribute('aria-label', `移除 ${country.label}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeFiveSimCountryFromOrder(country.code || country.id);
    });
    chip.appendChild(label);
    chip.appendChild(removeBtn);
    displayFiveSimCountryFallbackOrder.appendChild(chip);
    if (index < normalized.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'country-order-separator';
      separator.textContent = '→';
      displayFiveSimCountryFallbackOrder.appendChild(separator);
    }
  });
}

function setFiveSimCountryMenuOpen(open) {
  const nextOpen = Boolean(open);
  if (btnFiveSimCountryMenu) {
    btnFiveSimCountryMenu.setAttribute('aria-expanded', String(nextOpen));
  }
  if (fiveSimCountryMenu) {
    fiveSimCountryMenu.hidden = !nextOpen;
    if (nextOpen) {
      const searchInput = fiveSimCountryMenu.querySelector('.hero-sms-country-menu-search-input');
      if (searchInput) {
        fiveSimCountryMenuSearchKeyword = '';
        searchInput.value = '';
        applyFiveSimCountryMenuFilter('');
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 0);
      }
    }
  }
}

function applyFiveSimCountryMenuFilter(keyword = '') {
  if (!fiveSimCountryMenu) {
    return;
  }
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  const items = Array.from(fiveSimCountryMenu.querySelectorAll('.hero-sms-country-menu-item'));
  let visibleCount = 0;
  items.forEach((item) => {
    const haystack = String(item.dataset.searchText || '').toLowerCase();
    const visible = !normalizedKeyword || haystack.includes(normalizedKeyword);
    item.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });

  let empty = fiveSimCountryMenu.querySelector('.hero-sms-country-menu-empty');
  if (visibleCount === 0) {
    if (!empty) {
      empty = document.createElement('span');
      empty.className = 'data-value hero-sms-country-menu-empty';
      empty.textContent = '没有匹配国家';
      fiveSimCountryMenu.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function updateFiveSimCountryMenuSummary(selectedCountries = []) {
  if (!btnFiveSimCountryMenu) {
    return;
  }
  const normalized = normalizeFiveSimCountryFallbackList(selectedCountries);
  if (!normalized.length) {
    btnFiveSimCountryMenu.textContent = `未选择 (0/${HERO_SMS_COUNTRY_SELECTION_MAX})`;
    return;
  }
  const labels = normalized.map((country) => country.label);
  btnFiveSimCountryMenu.textContent = `${labels.join(' / ')} (${normalized.length}/${HERO_SMS_COUNTRY_SELECTION_MAX})`;
}

function renderFiveSimCountryChoiceButtons() {
  if (!fiveSimCountryMenu || !selectFiveSimCountry) {
    return;
  }
  const options = Array.from(selectFiveSimCountry.options || []);
  const selectedOrder = [...fiveSimCountrySelectionOrder];
  const selectedSet = new Set(selectedOrder);

  fiveSimCountryMenu.innerHTML = '';
  const searchWrap = document.createElement('div');
  searchWrap.className = 'hero-sms-country-menu-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'data-input mono hero-sms-country-menu-search-input';
  searchInput.placeholder = '搜索国家（中/英/代码）';
  searchInput.value = fiveSimCountryMenuSearchKeyword;
  searchInput.addEventListener('input', () => {
    fiveSimCountryMenuSearchKeyword = String(searchInput.value || '').trim();
    applyFiveSimCountryMenuFilter(fiveSimCountryMenuSearchKeyword);
  });
  searchWrap.appendChild(searchInput);
  fiveSimCountryMenu.appendChild(searchWrap);

  if (!options.length) {
    const empty = document.createElement('span');
    empty.className = 'data-value hero-sms-country-menu-empty';
    empty.textContent = '暂无国家选项';
    fiveSimCountryMenu.appendChild(empty);
    updateFiveSimCountryMenuSummary([]);
    return;
  }

  options.forEach((option) => {
    const countryId = normalizeFiveSimCountryId(option.value, '');
    if (!countryId) {
      return;
    }
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'hero-sms-country-menu-item';
    item.dataset.countryId = countryId;
    item.dataset.searchText = fiveSimCountrySearchTextByCode.get(countryId)
      || `${countryId} ${option.textContent || ''}`;
    const selected = selectedSet.has(countryId);
    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    item.textContent = option.textContent || countryId;
    item.addEventListener('click', (event) => {
      event.preventDefault();
      toggleFiveSimCountryInOrder(countryId);
    });
    fiveSimCountryMenu.appendChild(item);
  });
  applyFiveSimCountryMenuFilter(fiveSimCountryMenuSearchKeyword);
}

function syncFiveSimCountrySelectionOrderFromSelect(options = {}) {
  const selectionLimit = Math.max(1, Math.floor(Number(options.maxSelection) || HERO_SMS_COUNTRY_SELECTION_MAX));
  const enforceMax = options.enforceMax !== false;
  const ensureDefault = options.ensureDefault !== false;
  const showLimitToast = Boolean(options.showLimitToast);
  const countrySelect = selectFiveSimCountry;
  if (!countrySelect) {
    fiveSimCountrySelectionOrder = [];
    renderFiveSimCountryFallbackOrder([]);
    updateFiveSimCountryMenuSummary([]);
    return [];
  }

  const selectedCodes = Array.from(countrySelect.options || [])
    .filter((option) => option.selected)
    .map((option) => normalizeFiveSimCountryCode(option.value, ''))
    .filter(Boolean);
  const selectedSet = new Set(selectedCodes);
  let nextOrder = fiveSimCountrySelectionOrder.filter((code) => selectedSet.has(code));
  selectedCodes.forEach((code) => {
    if (!nextOrder.includes(code)) {
      nextOrder.push(code);
    }
  });

  if (ensureDefault && !nextOrder.length) {
    nextOrder = [normalizeFiveSimCountryCode(countrySelect.value || DEFAULT_FIVE_SIM_COUNTRY_ID)];
  }
  if (enforceMax && nextOrder.length > selectionLimit) {
    const droppedCount = nextOrder.length - selectionLimit;
    nextOrder = nextOrder.slice(0, selectionLimit);
    if (showLimitToast && droppedCount > 0 && typeof showToast === 'function') {
      showToast(`5sim 国家最多选择 ${selectionLimit} 个，已保留前 ${selectionLimit} 个。`, 'warn', 2200);
    }
  }

  const nextOrderSet = new Set(nextOrder);
  Array.from(countrySelect.options || []).forEach((option) => {
    option.selected = nextOrderSet.has(normalizeFiveSimCountryCode(option.value, ''));
  });
  fiveSimCountrySelectionOrder = [...nextOrder];
  const selectedCountries = fiveSimCountrySelectionOrder.map((code) => ({
    id: code,
    code,
    label: getFiveSimCountryOptionLabel(code),
  }));
  renderFiveSimCountryFallbackOrder(selectedCountries);
  updateFiveSimCountryMenuSummary(selectedCountries);
  renderFiveSimCountryChoiceButtons();
  return selectedCountries;
}

function applyFiveSimCountrySelection(countries = [], options = {}) {
  const normalized = normalizeFiveSimCountryFallbackList(countries).slice(0, HERO_SMS_COUNTRY_SELECTION_MAX);
  const selectedCodes = normalized
    .map((entry) => normalizeFiveSimCountryCode(entry.code || entry.id, ''))
    .filter(Boolean);
  fiveSimCountrySelectionOrder = [...selectedCodes];
  if (selectFiveSimCountry) {
    const selectedSet = new Set(selectedCodes);
    Array.from(selectFiveSimCountry.options || []).forEach((option) => {
      option.selected = selectedSet.has(normalizeFiveSimCountryCode(option.value, ''));
    });
  }
  return syncFiveSimCountrySelectionOrderFromSelect({
    ensureDefault: options.ensureDefault !== false,
    enforceMax: true,
    showLimitToast: false,
  });
}

function toggleFiveSimCountryInOrder(code = '') {
  const normalizedCode = normalizeFiveSimCountryCode(code, '');
  if (!normalizedCode || !selectFiveSimCountry) {
    return [];
  }
  const option = Array.from(selectFiveSimCountry.options || [])
    .find((entry) => normalizeFiveSimCountryCode(entry.value, '') === normalizedCode);
  if (option) {
    option.selected = !option.selected;
  }
  const nextOrder = syncFiveSimCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  return nextOrder;
}

function removeFiveSimCountryFromOrder(code = '') {
  const normalizedCode = normalizeFiveSimCountryCode(code, '');
  fiveSimCountrySelectionOrder = fiveSimCountrySelectionOrder.filter((entry) => entry !== normalizedCode);
  if (selectFiveSimCountry) {
    Array.from(selectFiveSimCountry.options || []).forEach((option) => {
      if (normalizeFiveSimCountryCode(option.value, '') === normalizedCode) {
        option.selected = false;
      }
    });
  }
  const nextOrder = syncFiveSimCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  return nextOrder;
}

async function loadFiveSimCountries(options = {}) {
  if (!selectFiveSimCountry) {
    return;
  }
  const silent = Boolean(options?.silent);
  const preferFallbackOnly = Boolean(options?.preferFallbackOnly);
  const previousOrder = [...fiveSimCountrySelectionOrder];
  const applyOptions = (items = []) => {
    selectFiveSimCountry.innerHTML = '';
    fiveSimCountrySearchTextByCode.clear();
    items.forEach((entry) => {
      const code = normalizeFiveSimCountryCode(entry.code || entry.id, '');
      if (!code) {
        return;
      }
      const option = document.createElement('option');
      option.value = code;
      option.textContent = entry.label || getFiveSimCountryOptionLabel(code) || code;
      selectFiveSimCountry.appendChild(option);
      fiveSimCountrySearchTextByCode.set(code, entry.searchText || `${option.textContent} ${code}`);
    });
  };
  const fallbackItems = FIVE_SIM_SUPPORTED_COUNTRY_ITEMS.map((item) => ({
    id: item.id,
    code: item.id,
    label: formatFiveSimCountryDisplayLabel(item.id, item.eng, item.id),
    searchText: item.searchText,
  }));

  if (preferFallbackOnly) {
    applyOptions(fallbackItems);
  } else try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const response = await fetch('https://5sim.net/v1/guest/countries', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const payload = await response.json();
    const items = parseFiveSimCountriesPayload(payload);
    applyOptions(items.length ? items : fallbackItems);
  } catch (error) {
    applyOptions(fallbackItems);
    if (!silent && typeof showToast === 'function') {
      showToast(`5sim 国家列表加载失败：${normalizeHeroSmsFetchErrorMessage(error)}（已切换为内置国家列表）`, 'warn', 2800);
    }
  }

  applyFiveSimCountrySelection(previousOrder.length ? previousOrder : latestState?.fiveSimCountryOrder || [], {
    ensureDefault: false,
  });
}

function renderNexSmsCountryFallbackOrder(countries = []) {
  if (!displayNexSmsCountryFallbackOrder) {
    return;
  }
  const normalized = normalizeNexSmsCountryFallbackList(countries);
  displayNexSmsCountryFallbackOrder.textContent = '';
  if (!normalized.length) {
    displayNexSmsCountryFallbackOrder.textContent = '未设置';
    return;
  }
  normalized.forEach((country, index) => {
    const chip = document.createElement('span');
    chip.className = 'country-order-chip';
    const label = document.createElement('span');
    label.className = 'country-order-chip-label';
    label.textContent = `${index + 1}. ${country.label}`;
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'country-order-remove';
    removeBtn.title = `移除 ${country.label}`;
    removeBtn.setAttribute('aria-label', `移除 ${country.label}`);
    removeBtn.textContent = '×';
    removeBtn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      removeNexSmsCountryFromOrder(country.id);
    });
    chip.appendChild(label);
    chip.appendChild(removeBtn);
    displayNexSmsCountryFallbackOrder.appendChild(chip);
    if (index < normalized.length - 1) {
      const separator = document.createElement('span');
      separator.className = 'country-order-separator';
      separator.textContent = '→';
      displayNexSmsCountryFallbackOrder.appendChild(separator);
    }
  });
}

function setNexSmsCountryMenuOpen(open) {
  const nextOpen = Boolean(open);
  if (btnNexSmsCountryMenu) {
    btnNexSmsCountryMenu.setAttribute('aria-expanded', String(nextOpen));
  }
  if (nexSmsCountryMenu) {
    nexSmsCountryMenu.hidden = !nextOpen;
    if (nextOpen) {
      const searchInput = nexSmsCountryMenu.querySelector('.hero-sms-country-menu-search-input');
      if (searchInput) {
        nexSmsCountryMenuSearchKeyword = '';
        searchInput.value = '';
        applyNexSmsCountryMenuFilter('');
        setTimeout(() => {
          searchInput.focus();
          searchInput.select();
        }, 0);
      }
    }
  }
}

function applyNexSmsCountryMenuFilter(keyword = '') {
  if (!nexSmsCountryMenu) {
    return;
  }
  const normalizedKeyword = String(keyword || '').trim().toLowerCase();
  const items = Array.from(nexSmsCountryMenu.querySelectorAll('.hero-sms-country-menu-item'));
  let visibleCount = 0;
  items.forEach((item) => {
    const haystack = String(item.dataset.searchText || '').toLowerCase();
    const visible = !normalizedKeyword || haystack.includes(normalizedKeyword);
    item.hidden = !visible;
    if (visible) {
      visibleCount += 1;
    }
  });
  let empty = nexSmsCountryMenu.querySelector('.hero-sms-country-menu-empty');
  if (visibleCount === 0) {
    if (!empty) {
      empty = document.createElement('span');
      empty.className = 'data-value hero-sms-country-menu-empty';
      empty.textContent = '没有匹配国家';
      nexSmsCountryMenu.appendChild(empty);
    }
  } else if (empty) {
    empty.remove();
  }
}

function updateNexSmsCountryMenuSummary(selectedCountries = []) {
  if (!btnNexSmsCountryMenu) {
    return;
  }
  const normalized = normalizeNexSmsCountryFallbackList(selectedCountries);
  btnNexSmsCountryMenu.textContent = normalized.length
    ? `${normalized.map((country) => country.label).join(' / ')} (${normalized.length}/${HERO_SMS_COUNTRY_SELECTION_MAX})`
    : `未选择 (0/${HERO_SMS_COUNTRY_SELECTION_MAX})`;
}

function renderNexSmsCountryChoiceButtons() {
  if (!nexSmsCountryMenu || !selectNexSmsCountry) {
    return;
  }
  const options = Array.from(selectNexSmsCountry.options || []);
  const selectedOrder = [...nexSmsCountrySelectionOrder];
  const selectedSet = new Set(selectedOrder);
  nexSmsCountryMenu.innerHTML = '';
  const searchWrap = document.createElement('div');
  searchWrap.className = 'hero-sms-country-menu-search';
  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'data-input mono hero-sms-country-menu-search-input';
  searchInput.placeholder = '搜索国家 ID';
  searchInput.value = nexSmsCountryMenuSearchKeyword;
  searchInput.addEventListener('input', () => {
    nexSmsCountryMenuSearchKeyword = String(searchInput.value || '').trim();
    applyNexSmsCountryMenuFilter(nexSmsCountryMenuSearchKeyword);
  });
  searchWrap.appendChild(searchInput);
  nexSmsCountryMenu.appendChild(searchWrap);

  if (!options.length) {
    const empty = document.createElement('span');
    empty.className = 'data-value hero-sms-country-menu-empty';
    empty.textContent = '暂无国家选项';
    nexSmsCountryMenu.appendChild(empty);
    updateNexSmsCountryMenuSummary([]);
    return;
  }

  options.forEach((option) => {
    const countryId = normalizeNexSmsCountryIdValue(option.value, -1);
    if (countryId < 0) {
      return;
    }
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'hero-sms-country-menu-item';
    item.dataset.countryId = String(countryId);
    item.dataset.searchText = nexSmsCountrySearchTextById.get(countryId)
      || `${countryId} ${option.textContent || ''}`;
    const selected = selectedSet.has(countryId);
    item.setAttribute('aria-pressed', selected ? 'true' : 'false');
    item.textContent = option.textContent || `Country #${countryId}`;
    item.addEventListener('click', (event) => {
      event.preventDefault();
      toggleNexSmsCountryInOrder(countryId);
    });
    nexSmsCountryMenu.appendChild(item);
  });
  applyNexSmsCountryMenuFilter(nexSmsCountryMenuSearchKeyword);
}

function syncNexSmsCountrySelectionOrderFromSelect(options = {}) {
  const selectionLimit = Math.max(1, Math.floor(Number(options.maxSelection) || HERO_SMS_COUNTRY_SELECTION_MAX));
  const enforceMax = options.enforceMax !== false;
  const ensureDefault = options.ensureDefault !== false;
  const showLimitToast = Boolean(options.showLimitToast);
  const countrySelect = selectNexSmsCountry;
  if (!countrySelect) {
    nexSmsCountrySelectionOrder = [];
    renderNexSmsCountryFallbackOrder([]);
    updateNexSmsCountryMenuSummary([]);
    return [];
  }

  const selectedIds = Array.from(countrySelect.options || [])
    .filter((option) => option.selected)
    .map((option) => normalizeNexSmsCountryIdValue(option.value, -1))
    .filter((id) => id >= 0);
  const selectedSet = new Set(selectedIds);
  let nextOrder = nexSmsCountrySelectionOrder.filter((id) => selectedSet.has(id));
  selectedIds.forEach((id) => {
    if (!nextOrder.includes(id)) {
      nextOrder.push(id);
    }
  });

  if (ensureDefault && !nextOrder.length) {
    nextOrder = [normalizeNexSmsCountryIdValue(DEFAULT_NEX_SMS_COUNTRY_ORDER[0], 1)];
  }
  if (enforceMax && nextOrder.length > selectionLimit) {
    const droppedCount = nextOrder.length - selectionLimit;
    nextOrder = nextOrder.slice(0, selectionLimit);
    if (showLimitToast && droppedCount > 0 && typeof showToast === 'function') {
      showToast(`NexSMS 国家最多选择 ${selectionLimit} 个，已保留前 ${selectionLimit} 个。`, 'warn', 2200);
    }
  }

  const nextOrderSet = new Set(nextOrder);
  Array.from(countrySelect.options || []).forEach((option) => {
    option.selected = nextOrderSet.has(normalizeNexSmsCountryIdValue(option.value, -1));
  });
  nexSmsCountrySelectionOrder = [...nextOrder];
  const selectedCountries = nexSmsCountrySelectionOrder.map((id) => ({
    id,
    label: getNexSmsCountryLabelById(id),
  }));
  renderNexSmsCountryFallbackOrder(selectedCountries);
  updateNexSmsCountryMenuSummary(selectedCountries);
  renderNexSmsCountryChoiceButtons();
  return selectedCountries;
}

function applyNexSmsCountrySelection(countries = [], options = {}) {
  const normalized = normalizeNexSmsCountryFallbackList(countries).slice(0, HERO_SMS_COUNTRY_SELECTION_MAX);
  const selectedIds = normalized
    .map((entry) => normalizeNexSmsCountryIdValue(entry.id, -1))
    .filter((id) => id >= 0);
  nexSmsCountrySelectionOrder = [...selectedIds];
  if (selectNexSmsCountry) {
    const selectedSet = new Set(selectedIds);
    Array.from(selectNexSmsCountry.options || []).forEach((option) => {
      option.selected = selectedSet.has(normalizeNexSmsCountryIdValue(option.value, -1));
    });
  }
  return syncNexSmsCountrySelectionOrderFromSelect({
    ensureDefault: options.ensureDefault !== false,
    enforceMax: true,
    showLimitToast: false,
  });
}

function toggleNexSmsCountryInOrder(id = -1) {
  const countryId = normalizeNexSmsCountryIdValue(id, -1);
  if (countryId < 0 || !selectNexSmsCountry) {
    return [];
  }
  const option = Array.from(selectNexSmsCountry.options || [])
    .find((entry) => normalizeNexSmsCountryIdValue(entry.value, -1) === countryId);
  if (option) {
    option.selected = !option.selected;
  }
  const nextOrder = syncNexSmsCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  return nextOrder;
}

function removeNexSmsCountryFromOrder(id = -1) {
  const countryId = normalizeNexSmsCountryIdValue(id, -1);
  nexSmsCountrySelectionOrder = nexSmsCountrySelectionOrder.filter((entry) => entry !== countryId);
  if (selectNexSmsCountry) {
    Array.from(selectNexSmsCountry.options || []).forEach((option) => {
      if (normalizeNexSmsCountryIdValue(option.value, -1) === countryId) {
        option.selected = false;
      }
    });
  }
  const nextOrder = syncNexSmsCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  return nextOrder;
}

async function loadNexSmsCountries() {
  if (!selectNexSmsCountry) {
    return;
  }
  const previousOrder = [...nexSmsCountrySelectionOrder];
  selectNexSmsCountry.innerHTML = '';
  nexSmsCountrySearchTextById.clear();
  NEX_SMS_FALLBACK_COUNTRY_ITEMS.forEach((entry) => {
    const id = normalizeNexSmsCountryIdValue(entry.id, -1);
    if (id < 0) {
      return;
    }
    const option = document.createElement('option');
    option.value = String(id);
    option.textContent = entry.label || `Country #${id}`;
    selectNexSmsCountry.appendChild(option);
    nexSmsCountrySearchTextById.set(id, entry.searchText || `${option.textContent} ${id}`);
  });
  applyNexSmsCountrySelection(previousOrder.length ? previousOrder : latestState?.nexSmsCountryOrder || [], {
    ensureDefault: false,
  });
}

async function buildNexSmsPricePreviewLines(options = {}) {
  const countryIds = (
    typeof getSelectedNexSmsCountries === 'function'
      ? getSelectedNexSmsCountries()
      : normalizeNexSmsCountryFallbackList(
        Array.isArray(latestState?.nexSmsCountryOrder) ? latestState.nexSmsCountryOrder : []
      )
  )
    .map((country) => normalizeNexSmsCountryIdValue(country.id, -1))
    .filter((id) => id >= 0);
  const serviceCode = normalizeNexSmsServiceCodeValue(
    inputNexSmsServiceCode?.value || latestState?.nexSmsServiceCode || DEFAULT_NEX_SMS_SERVICE_CODE
  );
  const priceRange = resolvePhoneSmsPricePreviewRange(
    typeof PHONE_SMS_PROVIDER_NEXSMS !== 'undefined' ? PHONE_SMS_PROVIDER_NEXSMS : 'nexsms'
  );
  const maxPrice = priceRange.maxPrice;
  const apiKey = String(inputNexSmsApiKey?.value || '').trim();
  const providerLabel = String(options?.providerLabel || 'NexSMS').trim();

  if (!apiKey) {
    return [`${providerLabel}: 请先填写 NexSMS API Key`];
  }
  if (priceRange.invalid) {
    return [`${providerLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`];
  }
  if (!countryIds.length) {
    return [`${providerLabel}: 请先选择至少 1 个国家`];
  }

  const previews = [];
  for (const countryId of countryIds) {
    const countryLabel = getNexSmsCountryLabelById(countryId) || `Country #${countryId}`;
    try {
      const url = new URL('/api/getCountryByService', 'https://api.nexsms.net');
      url.searchParams.set('apiKey', apiKey);
      url.searchParams.set('serviceCode', serviceCode);
      url.searchParams.set('countryId', String(countryId));
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || Number(payload?.code) !== 0) {
        previews.push(`${countryLabel}: ${describeNexSmsPreviewPayload(payload) || `HTTP ${response.status}`}`);
        continue;
      }
      const data = payload?.data || {};
      const tierEntries = data?.priceMap && typeof data.priceMap === 'object'
        ? Object.entries(data.priceMap)
          .map(([price, count]) => {
            const numericPrice = Number(price);
            const numericCount = Number(count);
            if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
              return null;
            }
            return {
              price: Math.round(numericPrice * 10000) / 10000,
              count: Number.isFinite(numericCount) ? Math.max(0, Math.floor(numericCount)) : null,
            };
          })
          .filter(Boolean)
        : [];
      const availablePrices = tierEntries
        .filter((entry) => entry.count === null || entry.count > 0)
        .map((entry) => entry.price);
      const uniqueSorted = Array.from(new Set(availablePrices)).sort((left, right) => left - right);
      const fallbackMin = Number(data?.minPrice);
      const filteredTierEntries = filterPhoneSmsPriceEntriesForPreviewRange(tierEntries, priceRange);
      const rangePrices = filterPhoneSmsPriceValuesForPreviewRange(uniqueSorted, priceRange);
      const fallbackMinPrice = Number.isFinite(fallbackMin) && fallbackMin > 0
        ? Math.round(fallbackMin * 10000) / 10000
        : null;
      const rangeFallbackMin = isPhoneSmsPriceWithinPreviewRange(fallbackMinPrice, priceRange)
        ? fallbackMinPrice
        : null;
      const lowest = rangePrices.length ? rangePrices[0] : rangeFallbackMin;
      if (!Number.isFinite(lowest)) {
        previews.push(`${countryLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`);
        continue;
      }
      const tierText = formatPriceTiersForPreview(filteredTierEntries, { maxPrice });
      const lowestLabel = priceRange.hasMinPrice || priceRange.hasMaxPrice ? '区间内最低' : '最低';
      previews.push(`${countryLabel}: ${lowestLabel} ${lowest}${tierText ? `；档位：${tierText}` : ''}`);
    } catch (error) {
      previews.push(`${countryLabel}: 查询失败（${normalizeHeroSmsFetchErrorMessage(error)}）`);
    }
  }

  if (!previews.length) {
    previews.push('未获取');
  }
  return [`${providerLabel}:`, ...previews];
}

async function previewFiveSimPriceTiers() {
  if (!displayHeroSmsPriceTiers) {
    return;
  }
  const countryCodes = (
    typeof getSelectedFiveSimCountries === 'function'
      ? getSelectedFiveSimCountries()
      : normalizeFiveSimCountryFallbackList(
        Array.isArray(latestState?.fiveSimCountryOrder) ? latestState.fiveSimCountryOrder : []
      )
  )
    .map((country) => normalizeFiveSimCountryCode(country.code || country.id, ''))
    .filter(Boolean);
  const product = normalizeFiveSimProductValue(
    inputFiveSimProduct?.value || latestState?.fiveSimProduct || DEFAULT_FIVE_SIM_PRODUCT
  );
  const priceRange = resolvePhoneSmsPricePreviewRange(
    typeof PHONE_SMS_PROVIDER_FIVE_SIM !== 'undefined' ? PHONE_SMS_PROVIDER_FIVE_SIM : '5sim'
  );
  const maxPrice = priceRange.maxPrice;

  displayHeroSmsPriceTiers.textContent = '查询中...';
  if (rowHeroSmsPriceTiers) {
    rowHeroSmsPriceTiers.style.display = '';
  }
  if (priceRange.invalid) {
    displayHeroSmsPriceTiers.textContent = buildPhoneSmsPriceRangePreviewMessage(priceRange);
    return;
  }
  if (!countryCodes.length) {
    displayHeroSmsPriceTiers.textContent = '请先选择至少 1 个国家，再查询价格';
    return;
  }

  const collectPriceEntries = (payload, entries = []) => {
    if (Array.isArray(payload)) {
      payload.forEach((entry) => collectPriceEntries(entry, entries));
      return entries;
    }
    if (!payload || typeof payload !== 'object') {
      return entries;
    }
    const cost = Number(payload.cost);
    const count = Number(payload.count);
    if (Number.isFinite(cost) && cost > 0) {
      entries.push({
        cost: Math.round(cost * 10000) / 10000,
        count: Number.isFinite(count) ? count : 0,
      });
    }
    Object.entries(payload).forEach(([key, value]) => {
      const keyedPrice = Number(key);
      if (!Number.isFinite(keyedPrice) || keyedPrice <= 0) {
        return;
      }
      if (value && typeof value === 'object') {
        const keyedCount = Number(value.count);
        entries.push({
          cost: Math.round(keyedPrice * 10000) / 10000,
          count: Number.isFinite(keyedCount) ? keyedCount : 0,
        });
        return;
      }
      const numericCount = Number(value);
      entries.push({
        cost: Math.round(keyedPrice * 10000) / 10000,
        count: Number.isFinite(numericCount) ? numericCount : 0,
      });
    });
    Object.values(payload).forEach((entry) => collectPriceEntries(entry, entries));
    return entries;
  };

  const previews = [];
  for (const countryCode of countryCodes) {
    const countryLabel = getFiveSimCountryLabelByCode(countryCode) || countryCode;
    try {
      const url = new URL('https://5sim.net/v1/guest/prices');
      url.searchParams.set('country', countryCode);
      url.searchParams.set('product', product);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        previews.push(`${countryLabel}: HTTP ${response.status}`);
        continue;
      }
      const productRoot = payload?.[product] || payload;
      const countryRoot = productRoot?.[countryCode] || productRoot;
      const tierEntries = collectPriceEntries(countryRoot, [])
        .filter((entry) => Number.isFinite(entry.cost) && entry.cost > 0)
        .map((entry) => ({
          price: entry.cost,
          count: Number.isFinite(entry.count) ? Math.max(0, Math.floor(entry.count)) : null,
        }));
      const prices = tierEntries
        .filter((entry) => entry.count === null || entry.count > 0)
        .map((entry) => entry.price);
      const uniqueSorted = Array.from(new Set(prices)).sort((left, right) => left - right);
      const rangePrices = filterPhoneSmsPriceValuesForPreviewRange(uniqueSorted, priceRange);
      const filteredTierEntries = filterPhoneSmsPriceEntriesForPreviewRange(tierEntries, priceRange);
      if (!rangePrices.length) {
        previews.push(`${countryLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`);
        continue;
      }
      const lowest = rangePrices[0];
      const tierText = formatPriceTiersForPreview(filteredTierEntries, { maxPrice });
      const lowestLabel = priceRange.hasMinPrice || priceRange.hasMaxPrice ? '区间内最低' : '最低';
      previews.push(`${countryLabel}: ${lowestLabel} ${lowest}${tierText ? `；档位：${tierText}` : ''}`);
    } catch (error) {
      previews.push(`${countryLabel}: 查询失败（${normalizeHeroSmsFetchErrorMessage(error)}）`);
    }
  }
  displayHeroSmsPriceTiers.textContent = previews.join('\n') || '未获取';
}

async function buildFiveSimPricePreviewLines(options = {}) {
  const countryCodes = (
    typeof getSelectedFiveSimCountries === 'function'
      ? getSelectedFiveSimCountries()
      : normalizeFiveSimCountryFallbackList(
        Array.isArray(latestState?.fiveSimCountryOrder) ? latestState.fiveSimCountryOrder : []
      )
  )
    .map((country) => normalizeFiveSimCountryCode(country.code || country.id, ''))
    .filter(Boolean);
  const product = normalizeFiveSimProductValue(
    inputFiveSimProduct?.value || latestState?.fiveSimProduct || DEFAULT_FIVE_SIM_PRODUCT
  );
  const priceRange = resolvePhoneSmsPricePreviewRange(
    typeof PHONE_SMS_PROVIDER_FIVE_SIM !== 'undefined' ? PHONE_SMS_PROVIDER_FIVE_SIM : '5sim'
  );
  const maxPrice = priceRange.maxPrice;
  const providerLabel = String(options?.providerLabel || '5sim').trim();

  if (!countryCodes.length) {
    return [`${providerLabel}: 请先选择至少 1 个国家`];
  }
  if (priceRange.invalid) {
    return [`${providerLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`];
  }

  const collectPriceEntries = (payload, entries = []) => {
    if (Array.isArray(payload)) {
      payload.forEach((entry) => collectPriceEntries(entry, entries));
      return entries;
    }
    if (!payload || typeof payload !== 'object') {
      return entries;
    }
    const cost = Number(payload.cost);
    const count = Number(payload.count);
    if (Number.isFinite(cost) && cost > 0) {
      entries.push({
        cost: Math.round(cost * 10000) / 10000,
        count: Number.isFinite(count) ? count : 0,
      });
    }
    Object.entries(payload).forEach(([key, value]) => {
      const keyedPrice = Number(key);
      if (!Number.isFinite(keyedPrice) || keyedPrice <= 0) {
        return;
      }
      if (value && typeof value === 'object') {
        const keyedCount = Number(value.count);
        entries.push({
          cost: Math.round(keyedPrice * 10000) / 10000,
          count: Number.isFinite(keyedCount) ? keyedCount : 0,
        });
        return;
      }
      const numericCount = Number(value);
      entries.push({
        cost: Math.round(keyedPrice * 10000) / 10000,
        count: Number.isFinite(numericCount) ? numericCount : 0,
      });
    });
    Object.values(payload).forEach((entry) => collectPriceEntries(entry, entries));
    return entries;
  };

  const previews = [];
  for (const countryCode of countryCodes) {
    const countryLabel = getFiveSimCountryLabelByCode(countryCode) || countryCode;
    try {
      const url = new URL('https://5sim.net/v1/guest/prices');
      url.searchParams.set('country', countryCode);
      url.searchParams.set('product', product);
      const response = await fetch(url.toString(), { cache: 'no-store' });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        previews.push(`${countryLabel}: HTTP ${response.status}`);
        continue;
      }
      const productRoot = payload?.[product] || payload;
      const countryRoot = productRoot?.[countryCode] || productRoot;
      const tierEntries = collectPriceEntries(countryRoot, [])
        .filter((entry) => Number.isFinite(entry.cost) && entry.cost > 0)
        .map((entry) => ({
          price: entry.cost,
          count: Number.isFinite(entry.count) ? Math.max(0, Math.floor(entry.count)) : null,
        }));
      const prices = tierEntries
        .filter((entry) => entry.count === null || entry.count > 0)
        .map((entry) => entry.price);
      const uniqueSorted = Array.from(new Set(prices)).sort((left, right) => left - right);
      const rangePrices = filterPhoneSmsPriceValuesForPreviewRange(uniqueSorted, priceRange);
      const filteredTierEntries = filterPhoneSmsPriceEntriesForPreviewRange(tierEntries, priceRange);
      if (!rangePrices.length) {
        previews.push(`${countryLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`);
        continue;
      }
      const lowest = rangePrices[0];
      const tierText = formatPriceTiersForPreview(filteredTierEntries, { maxPrice });
      const lowestLabel = priceRange.hasMinPrice || priceRange.hasMaxPrice ? '区间内最低' : '最低';
      previews.push(`${countryLabel}: ${lowestLabel} ${lowest}${tierText ? `；档位：${tierText}` : ''}`);
    } catch (error) {
      previews.push(`${countryLabel}: 查询失败（${normalizeHeroSmsFetchErrorMessage(error)}）`);
    }
  }

  if (!previews.length) {
    previews.push('未获取');
  }
  return [`${providerLabel}:`, ...previews];
}

async function previewHeroSmsPriceTiers() {
  const normalizeProvider = typeof normalizePhoneSmsProviderValue === 'function'
    ? normalizePhoneSmsProviderValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '5sim') return '5sim';
      if (normalized === 'nexsms') return 'nexsms';
      return 'hero-sms';
    });
  const fiveSimProviderValue = typeof PHONE_SMS_PROVIDER_FIVE_SIM !== 'undefined' ? PHONE_SMS_PROVIDER_FIVE_SIM : '5sim';
  const nexSmsProviderValue = typeof PHONE_SMS_PROVIDER_NEXSMS !== 'undefined' ? PHONE_SMS_PROVIDER_NEXSMS : 'nexsms';
  const heroProviderValue = typeof PHONE_SMS_PROVIDER_HERO !== 'undefined' ? PHONE_SMS_PROVIDER_HERO : 'hero-sms';
  const defaultProviderValue = typeof DEFAULT_PHONE_SMS_PROVIDER !== 'undefined' ? DEFAULT_PHONE_SMS_PROVIDER : 'hero-sms';
  const activeProvider = typeof getSelectedPhoneSmsProvider === 'function'
    ? getSelectedPhoneSmsProvider()
    : normalizeProvider(selectPhoneSmsProvider?.value || defaultProviderValue);
  displayHeroSmsPriceTiers.textContent = '查询中...';
  if (rowHeroSmsPriceTiers) {
    rowHeroSmsPriceTiers.style.display = '';
  }
  if (!displayHeroSmsPriceTiers) {
    return;
  }

  const selectedProviderOrder = (
    typeof getSelectedPhoneSmsProviderOrder === 'function'
      ? getSelectedPhoneSmsProviderOrder()
      : normalizePhoneSmsProviderOrderValue(phoneSmsProviderOrderSelection, [])
  );
  const providerOrder = selectedProviderOrder.length
    ? selectedProviderOrder
    : [normalizeProvider(activeProvider)];

  const previews = [];
  for (const provider of providerOrder) {
    if (provider === fiveSimProviderValue) {
      const lines = await buildFiveSimPricePreviewLines({ providerLabel: '5sim' });
      previews.push(...lines, '');
      continue;
    }
    if (provider === nexSmsProviderValue) {
      const lines = await buildNexSmsPricePreviewLines({ providerLabel: 'NexSMS' });
      previews.push(...lines, '');
      continue;
    }
    if (provider !== heroProviderValue) {
      continue;
    }

    const selectedCountries = syncHeroSmsFallbackSelectionOrderFromSelect({
      enforceMax: true,
      ensureDefault: false,
      showLimitToast: false,
    });
    const candidates = selectedCountries
      .map((country) => ({
        id: normalizeHeroSmsCountryId(country?.id, 0),
        label: normalizeHeroSmsCountryLabel(country?.label, ''),
      }))
      .filter((country) => country.id > 0);
    const priceRange = resolvePhoneSmsPricePreviewRange(heroProviderValue);
    const maxPrice = priceRange.maxPrice;
    const apiKey = String(inputHeroSmsApiKey?.value || '').trim();

    const heroLines = ['HeroSMS:'];
    if (!apiKey) {
      heroLines.push('请先填写接码 API Key');
      previews.push(...heroLines, '');
      continue;
    }
    if (priceRange.invalid) {
      heroLines.push(buildPhoneSmsPriceRangePreviewMessage(priceRange));
      previews.push(...heroLines, '');
      continue;
    }
    if (!candidates.length) {
      heroLines.push('请先选择至少 1 个国家');
      previews.push(...heroLines, '');
      continue;
    }
    for (const country of candidates) {
      const countryId = normalizeHeroSmsCountryId(country.id, 0);
      if (countryId <= 0) {
        continue;
      }
      const countryLabel = normalizeHeroSmsCountryLabel(
        country.label || getHeroSmsCountryLabelById(countryId),
        `Country #${countryId}`
      );
      try {
        const parsedPayloads = [];
        const failedPriceActions = [];
        const fetchPriceAction = async (action) => {
          const url = new URL('https://hero-sms.com/stubs/handler_api.php');
          url.searchParams.set('action', action);
          url.searchParams.set('service', 'dr');
          url.searchParams.set('country', String(countryId));
          if (action === 'getPricesExtended') {
            url.searchParams.set('freePrice', 'true');
          }
          if (apiKey) {
            url.searchParams.set('api_key', apiKey);
          }
          const response = await fetch(url.toString(), { cache: 'no-store' });
          const rawText = await response.text();
          let payload = rawText;
          try {
            payload = rawText ? JSON.parse(rawText) : '';
          } catch {
            payload = rawText;
          }
          if (!response.ok) {
            const reason = summarizeHeroSmsPreviewError(payload, response.status);
            failedPriceActions.push(`${action}: ${reason}`);
            return;
          }
          parsedPayloads.push(payload);
        };

        const fetchTopCountriesPayload = async () => {
          const url = new URL('https://hero-sms.com/stubs/handler_api.php');
          url.searchParams.set('action', 'getTopCountriesByService');
          url.searchParams.set('service', 'dr');
          url.searchParams.set('freePrice', 'true');
          if (apiKey) {
            url.searchParams.set('api_key', apiKey);
          }
          const response = await fetch(url.toString(), { cache: 'no-store' });
          const rawText = await response.text();
          let payload = rawText;
          try {
            payload = rawText ? JSON.parse(rawText) : '';
          } catch {
            payload = rawText;
          }
          if (!response.ok) {
            const reason = summarizeHeroSmsPreviewError(payload, response.status);
            failedPriceActions.push(`getTopCountriesByService: ${reason}`);
            return null;
          }
          return payload;
        };

        const fetchVerificationPricesPayload = async () => {
          const url = new URL('https://hero-sms.com/stubs/handler_api.php');
          url.searchParams.set('action', 'getPricesVerification');
          url.searchParams.set('service', 'dr');
          url.searchParams.set('country', String(countryId));
          if (apiKey) {
            url.searchParams.set('api_key', apiKey);
          }
          const response = await fetch(url.toString(), { cache: 'no-store' });
          const rawText = await response.text();
          let payload = rawText;
          try {
            payload = rawText ? JSON.parse(rawText) : '';
          } catch {
            payload = rawText;
          }
          if (!response.ok) {
            const reason = summarizeHeroSmsPreviewError(payload, response.status);
            failedPriceActions.push(`getPricesVerification: ${reason}`);
            return null;
          }
          return payload;
        };

        await fetchPriceAction('getPricesExtended');
        await fetchPriceAction('getPrices');
        // Additional visibility probe: some regions expose richer tier maps on getPricesForVerification.
        await fetchPriceAction('getPricesForVerification');
        const [topCountriesPayload, verificationPayload] = await Promise.all([
          fetchTopCountriesPayload(),
          fetchVerificationPricesPayload(),
        ]);

        const priceEntries = parsedPayloads
          .flatMap((payload) => collectHeroSmsPriceEntriesForPreview(payload, []))
          .concat(
            collectHeroSmsPriceEntriesFromTopCountriesPayload(topCountriesPayload, countryId, []),
            collectHeroSmsPriceEntriesFromVerificationPayload(verificationPayload, countryId, 'dr', [])
          )
          .filter((entry) => Number.isFinite(Number(entry.cost)) && Number(entry.cost) > 0);
        const heroProvider = getHeroSmsProviderModule();
        const previewSummary = heroProvider?.summarizePreviewPriceEntries
          ? heroProvider.summarizePreviewPriceEntries(
            priceEntries.map((entry) => ({
              price: Number(entry.cost),
              stockCount: Number.isFinite(Number(entry.stockCount)) ? Math.max(0, Number(entry.stockCount)) : 0,
              hasStockField: Boolean(entry.hasStockField),
              inStock: Boolean(entry.inStock),
              sourceAction: entry.sourceAction || 'preview',
            }))
          )
          : null;
        const allPrices = Array.isArray(previewSummary?.allPrices)
          ? previewSummary.allPrices
          : [];
        const inStockPrices = Array.isArray(previewSummary?.inStockPrices)
          ? previewSummary.inStockPrices
          : allPrices.filter((price) => (
            priceEntries.some((entry) => Number(entry.cost) === Number(price) && entry.inStock)
          ));
        const tierEntries = Array.isArray(previewSummary?.mergedTiers)
          ? previewSummary.mergedTiers.map((tier) => ({
            price: Number(tier.price),
            count: Number.isFinite(Number(tier.stockCount)) ? Math.max(0, Number(tier.stockCount)) : 0,
          }))
          : [];
        const rangeAllPrices = filterPhoneSmsPriceValuesForPreviewRange(allPrices, priceRange);
        const rangeInStockPrices = filterPhoneSmsPriceValuesForPreviewRange(inStockPrices, priceRange);
        const filteredTierEntries = filterPhoneSmsPriceEntriesForPreviewRange(tierEntries, priceRange);
        const tierPreviewText = formatPriceTiersWithZeroStockForPreview(filteredTierEntries, { maxPrice });
        if (!rangeInStockPrices.length) {
          if ((priceRange.hasMinPrice || priceRange.hasMaxPrice) && allPrices.length && !rangeAllPrices.length) {
            heroLines.push(`${countryLabel}: ${buildPhoneSmsPriceRangePreviewMessage(priceRange)}`);
            continue;
          }
          if (rangeAllPrices.length || allPrices.length) {
            const lowestKnownPrice = rangeAllPrices.length ? rangeAllPrices[0] : allPrices[0];
            const lowestKnown = formatHeroSmsPriceForPreview(lowestKnownPrice) || String(lowestKnownPrice);
            heroLines.push(`${countryLabel}: 全档位均无库存（最低标价 ${lowestKnown}）${tierPreviewText ? `；档位：${tierPreviewText}` : ''}`);
            continue;
          }
          if (failedPriceActions.length) {
            heroLines.push(`${countryLabel}: ${failedPriceActions.join(' | ')}`);
            continue;
          }
          heroLines.push(`${countryLabel}: 无可用价格`);
          continue;
        }
        const lowestWithinRange = rangeInStockPrices[0];
        const lowestText = formatHeroSmsPriceForPreview(lowestWithinRange) || String(lowestWithinRange);
        const lowestLabel = priceRange.hasMinPrice || priceRange.hasMaxPrice ? '区间内最低' : '最低';
        heroLines.push(`${countryLabel}: ${lowestLabel} ${lowestText}${tierPreviewText ? `；档位：${tierPreviewText}` : ''}`);
      } catch (error) {
        heroLines.push(`${countryLabel}: 查询失败（${normalizeHeroSmsFetchErrorMessage(error)}）`);
      }
    }
    if (heroLines.length === 1) {
      heroLines.push('未获取');
    }
    previews.push(...heroLines, '');
  }

  while (previews.length && previews[previews.length - 1] === '') {
    previews.pop();
  }
  displayHeroSmsPriceTiers.textContent = previews.join('\n') || '未获取';
}

async function previewPhoneSmsBalance() {
  if (!displayPhoneSmsBalance) {
    return;
  }
  const provider = getSelectedPhoneSmsProvider();
  if (provider === PHONE_SMS_PROVIDER_CHATGPT_API) {
    displayPhoneSmsBalance.textContent = 'ChatGPT API 接码使用自定义号码池，无余额接口';
    if (rowHeroSmsPriceTiers) rowHeroSmsPriceTiers.style.display = '';
    return;
  }
  const apiKey = String(inputHeroSmsApiKey?.value || '').trim();
  if (!apiKey) {
    displayPhoneSmsBalance.textContent = '请先填写接码 API Key';
    if (rowHeroSmsPriceTiers) rowHeroSmsPriceTiers.style.display = '';
    return;
  }
  displayPhoneSmsBalance.textContent = '余额查询中...';
  if (rowHeroSmsPriceTiers) rowHeroSmsPriceTiers.style.display = '';
  try {
    let url = null;
    if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      url = new URL('https://5sim.net/v1/user/profile');
    } else if (provider === PHONE_SMS_PROVIDER_SMSBOWER) {
      url = new URL('https://smsbower.page/stubs/handler_api.php');
    } else if (provider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      url = new URL('https://sms-verification-number.com/stubs/handler_api');
    } else if (provider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      url = new URL('https://api.grizzlysms.com/stubs/handler_api.php');
    } else if (provider === PHONE_SMS_PROVIDER_SMSPOOL) {
      url = new URL('https://api.smspool.net/stubs/handler_api.php?setting=smspool');
    } else {
      url = new URL('https://hero-sms.com/stubs/handler_api.php');
    }
    const requestOptions = {};
    if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      requestOptions.headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };
    } else {
      url.searchParams.set('action', 'getBalance');
      url.searchParams.set('api_key', apiKey);
    }
    const response = await fetch(url.toString(), requestOptions);
    const rawText = await response.text();
    let payload = rawText;
    try {
      payload = rawText ? JSON.parse(rawText) : '';
    } catch {
      payload = rawText;
    }
    if (!response.ok) {
      displayPhoneSmsBalance.textContent = `余额查询失败：${summarizeHeroSmsPreviewError(payload, response.status)}`;
      return;
    }
    if (provider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      const balance = Number(payload?.balance);
      const frozen = Number(payload?.frozen_balance);
      displayPhoneSmsBalance.textContent = Number.isFinite(balance)
        ? `5sim 余额 ${formatHeroSmsPriceForPreview(balance) || balance}${Number.isFinite(frozen) ? `，冻结 ${formatHeroSmsPriceForPreview(frozen) || frozen}` : ''}`
        : `5sim 余额：${describeHeroSmsPreviewPayload(payload) || '未知'}`;
    } else {
      const text = describeHeroSmsPreviewPayload(payload).replace(/^ACCESS_BALANCE:/i, '').trim();
      displayPhoneSmsBalance.textContent = `${getPhoneSmsProviderLabel(provider)} 余额 ${text || '未知'}`;
    }
  } catch (error) {
    displayPhoneSmsBalance.textContent = `余额查询失败：${normalizeHeroSmsFetchErrorMessage(error)}`;
  }
}

function getSelectedLocalCpaStep9Mode() {
  const activeButton = localCpaStep9ModeButtons.find((button) => button.classList.contains('is-active'));
  return normalizeLocalCpaStep9Mode(activeButton?.dataset.localCpaStep9Mode);
}

function setLocalCpaStep9Mode(mode) {
  const resolvedMode = normalizeLocalCpaStep9Mode(mode);
  localCpaStep9ModeButtons.forEach((button) => {
    const active = button.dataset.localCpaStep9Mode === resolvedMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function getSelectedMail2925Mode() {
  const activeButton = mail2925ModeButtons.find((button) => button.classList.contains('is-active'));
  return normalizeMail2925Mode(activeButton?.dataset.mail2925Mode);
}

function setMail2925Mode(mode) {
  const resolvedMode = normalizeMail2925Mode(mode);
  mail2925ModeButtons.forEach((button) => {
    const active = button.dataset.mail2925Mode === resolvedMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function getSelectedCloudflareTempEmailLookupMode() {
  const activeButton = tempEmailLookupModeButtons.find((button) => button.classList.contains('is-active'));
  return normalizeCloudflareTempEmailLookupMode(activeButton?.dataset.tempEmailLookupMode);
}

function setCloudflareTempEmailLookupMode(mode) {
  const resolvedMode = normalizeCloudflareTempEmailLookupMode(mode);
  tempEmailLookupModeButtons.forEach((button) => {
    const active = button.dataset.tempEmailLookupMode === resolvedMode;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function getSelectedHotmailServiceMode() {
  const activeButton = hotmailServiceModeButtons.find((button) => button.classList.contains('is-active'));
  return normalizeHotmailServiceMode(activeButton?.dataset.hotmailServiceMode);
}

function setHotmailServiceMode(mode) {
  const resolvedMode = normalizeHotmailServiceMode(mode);
  hotmailServiceModeButtons.forEach((button) => {
    const active = button.dataset.hotmailServiceMode === resolvedMode;
    button.disabled = false;
    button.setAttribute('aria-disabled', 'false');
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function updateAccountRunHistorySettingsUI() {
  if (!rowAccountRunHistoryHelperBaseUrl) {
    return;
  }

  rowAccountRunHistoryHelperBaseUrl.style.display = 'none';
}

function normalizeSignupMethod(value = '') {
  return String(value || '').trim().toLowerCase() === 'phone'
    ? 'phone'
    : 'email';
}

function isPhoneSignupReuseLocked(state = latestState, options = {}) {
  const hasOptionMethod = Object.prototype.hasOwnProperty.call(options || {}, 'signupMethod');
  const rawMethod = hasOptionMethod
    ? options.signupMethod
    : (typeof getSelectedSignupMethod === 'function'
      ? getSelectedSignupMethod()
      : (state?.signupMethod || DEFAULT_SIGNUP_METHOD));
  const selectedMethod = normalizeSignupMethod(rawMethod);
  if (selectedMethod === SIGNUP_METHOD_PHONE) {
    return true;
  }

  if (!options?.includeRuntimeIdentity) {
    return false;
  }

  const identifierType = String(
    options?.accountIdentifierType
    ?? state?.accountIdentifierType
    ?? ''
  ).trim().toLowerCase();
  return identifierType === 'phone';
}

function getStoredPhoneSmsReuseEnabled(state = latestState) {
  return normalizeHeroSmsReuseEnabledValue(
    state?.phoneSmsReuseEnabled,
    state?.heroSmsReuseEnabled
  );
}

function getStoredFreePhoneReuseEnabled(state = latestState) {
  return Boolean(state?.freePhoneReuseEnabled);
}

function getStoredFreePhoneReuseAutoEnabled(state = latestState) {
  return Boolean(state?.freePhoneReuseAutoEnabled);
}

function restorePhoneReuseControlsFromState(state = latestState) {
  if (typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled) {
    inputHeroSmsReuseEnabled.checked = getStoredPhoneSmsReuseEnabled(state);
  }
  if (typeof inputFreePhoneReuseEnabled !== 'undefined' && inputFreePhoneReuseEnabled) {
    inputFreePhoneReuseEnabled.checked = getStoredFreePhoneReuseEnabled(state);
  }
  if (typeof inputFreePhoneReuseAutoEnabled !== 'undefined' && inputFreePhoneReuseAutoEnabled) {
    inputFreePhoneReuseAutoEnabled.checked = getStoredFreePhoneReuseAutoEnabled(state);
  }
}

function setElementReuseLockedState(element, locked, title = PHONE_SIGNUP_REUSE_LOCK_TITLE) {
  if (!element) {
    return;
  }
  element.classList?.toggle?.('is-disabled', Boolean(locked));
  if (locked) {
    element.title = title;
  } else if (element.title === title) {
    element.title = '';
  }
}

function normalizePanelMode(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'sub2api' || normalized === 'codex2api') {
    return normalized;
  }
  return 'cpa';
}

let flowRegistry = null;
let settingsSchema = null;
let flowCapabilityRegistry = null;

function getFlowRegistry() {
  if (flowRegistry) {
    return flowRegistry;
  }
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  flowRegistry = rootScope.MultiPageFlowRegistry || null;
  return flowRegistry;
}

function getSettingsSchema() {
  if (settingsSchema) {
    return settingsSchema;
  }
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  const registry = getFlowRegistry();
  settingsSchema = rootScope.MultiPageSettingsSchema?.createSettingsSchema?.({
    defaultFlowId: DEFAULT_ACTIVE_FLOW_ID,
    flowRegistry: registry || undefined,
  }) || null;
  return settingsSchema;
}

function normalizeFlowId(value = '', fallback = DEFAULT_ACTIVE_FLOW_ID) {
  const registry = getFlowRegistry();
  if (registry?.normalizeFlowId) {
    return registry.normalizeFlowId(value, fallback);
  }
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'codex') {
    return DEFAULT_ACTIVE_FLOW_ID;
  }
  const fallbackValue = String(fallback || '').trim().toLowerCase();
  return normalized || fallbackValue || DEFAULT_ACTIVE_FLOW_ID;
}

function getDefaultTargetIdForFlow(flowId = DEFAULT_ACTIVE_FLOW_ID) {
  const registry = getFlowRegistry();
  if (registry?.getDefaultTargetId) {
    return registry.getDefaultTargetId(normalizeFlowId(flowId));
  }
  return normalizeFlowId(flowId) === 'kiro' ? 'kiro-rs' : 'cpa';
}

function normalizeTargetIdForFlow(flowId = DEFAULT_ACTIVE_FLOW_ID, targetId = '', fallback = '') {
  const normalizedFlowId = normalizeFlowId(flowId);
  const registry = getFlowRegistry();
  const fallbackTargetId = fallback || getDefaultTargetIdForFlow(normalizedFlowId);
  if (registry?.normalizeTargetId) {
    return registry.normalizeTargetId(normalizedFlowId, targetId, fallbackTargetId);
  }
  if (normalizedFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    return normalizePanelMode(targetId || fallbackTargetId);
  }
  const normalized = String(targetId || '').trim().toLowerCase();
  return normalized || String(fallbackTargetId || '').trim().toLowerCase() || 'kiro-rs';
}

function getSelectedFlowId(state = latestState) {
  const selectedValue = typeof selectFlow !== 'undefined' && selectFlow
    ? selectFlow.value
    : '';
  return normalizeFlowId(
    selectedValue || state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID,
    state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID
  );
}

function getSelectedTargetIdForState(state = latestState, flowId = getSelectedFlowId(state)) {
  const normalizedFlowId = normalizeFlowId(flowId);
  const schema = getSettingsSchema();
  if (schema?.getSelectedTargetId) {
    return schema.getSelectedTargetId(state || {}, normalizedFlowId);
  }
  if (normalizedFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    return normalizePanelMode(state?.panelMode || getDefaultTargetIdForFlow(normalizedFlowId));
  }
  return normalizeTargetIdForFlow(
    normalizedFlowId,
    state?.kiroTargetId || '',
    getDefaultTargetIdForFlow(normalizedFlowId)
  );
}

function getSelectedTargetId(flowId = getSelectedFlowId()) {
  const normalizedFlowId = normalizeFlowId(flowId);
  const selectedValue = typeof selectPanelMode !== 'undefined' && selectPanelMode
    ? selectPanelMode.value
    : '';
  if (normalizedFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    return normalizePanelMode(
      selectedValue || latestState?.panelMode || getDefaultTargetIdForFlow(normalizedFlowId)
    );
  }
  return normalizeTargetIdForFlow(
    normalizedFlowId,
    selectedValue || latestState?.kiroTargetId || '',
    getDefaultTargetIdForFlow(normalizedFlowId)
  );
}

function renderFlowSelectorOptions(selectedFlowId = getSelectedFlowId()) {
  if (!selectFlow) {
    return [];
  }
  const registry = getFlowRegistry();
  const flowIds = Array.isArray(registry?.getRegisteredFlowIds?.())
    ? registry.getRegisteredFlowIds()
    : [DEFAULT_ACTIVE_FLOW_ID];
  const normalizedSelectedFlowId = normalizeFlowId(selectedFlowId);
  selectFlow.innerHTML = '';
  flowIds.forEach((flowId) => {
    const option = document.createElement('option');
    option.value = flowId;
    option.textContent = registry?.getFlowLabel?.(flowId) || flowId;
    selectFlow.appendChild(option);
  });
  selectFlow.value = normalizedSelectedFlowId;
  return flowIds;
}

function renderTargetSelectorOptions(flowId = getSelectedFlowId(), selectedTargetId = '') {
  if (!selectPanelMode) {
    return [];
  }
  const registry = getFlowRegistry();
  const normalizedFlowId = normalizeFlowId(flowId);
  const targetOptions = Array.isArray(registry?.getTargetOptions?.(normalizedFlowId))
    ? registry.getTargetOptions(normalizedFlowId)
    : [];
  const normalizedTargetId = normalizeTargetIdForFlow(
    normalizedFlowId,
    selectedTargetId,
    getDefaultTargetIdForFlow(normalizedFlowId)
  );
  selectPanelMode.innerHTML = '';
  targetOptions.forEach((targetOption) => {
    const option = document.createElement('option');
    option.value = targetOption.id;
    option.textContent = targetOption.label || targetOption.id;
    selectPanelMode.appendChild(option);
  });
  if (labelSourceSelector) {
    labelSourceSelector.textContent = '来源';
  }
  selectPanelMode.disabled = targetOptions.length <= 1;
  if (targetOptions.length > 0) {
    selectPanelMode.value = normalizedTargetId;
  }
  return targetOptions;
}

function collectVisibleSettingsTargets(visibleGroupIds = []) {
  const registry = getFlowRegistry();
  const visibleGroupIdSet = new Set(
    Array.isArray(visibleGroupIds)
      ? visibleGroupIds.map((groupId) => String(groupId || '').trim()).filter(Boolean)
      : []
  );
  const groupDefinitions = registry?.getSettingsGroupDefinitions?.() || {};
  const rowIds = new Set();
  const sectionIds = new Set();
  Object.entries(groupDefinitions).forEach(([groupId, definition]) => {
    if (!visibleGroupIdSet.has(groupId)) {
      return;
    }
    (definition?.rowIds || []).forEach((rowId) => rowIds.add(rowId));
    (definition?.sectionIds || []).forEach((sectionId) => sectionIds.add(sectionId));
  });
  return {
    rowIds: Array.from(rowIds),
    sectionIds: Array.from(sectionIds),
  };
}

function applyFlowSettingsGroupVisibility(visibleGroupIds = []) {
  const registry = getFlowRegistry();
  const groupDefinitions = registry?.getSettingsGroupDefinitions?.() || {};
  const { rowIds: visibleRowIds, sectionIds: visibleSectionIds } = collectVisibleSettingsTargets(visibleGroupIds);
  const visibleRowIdSet = new Set(visibleRowIds);
  const visibleSectionIdSet = new Set(visibleSectionIds);
  const allRowIds = new Set();
  const allSectionIds = new Set();
  Object.values(groupDefinitions).forEach((definition) => {
    (definition?.rowIds || []).forEach((rowId) => allRowIds.add(rowId));
    (definition?.sectionIds || []).forEach((sectionId) => allSectionIds.add(sectionId));
  });
  allRowIds.forEach((rowId) => {
    const element = document.getElementById(rowId);
    if (!element) {
      return;
    }
    element.style.display = visibleRowIdSet.has(rowId) ? '' : 'none';
  });
  allSectionIds.forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (!element) {
      return;
    }
    element.style.display = visibleSectionIdSet.has(sectionId) ? '' : 'none';
  });
  applySub2ApiReloginVisibilityOverrides();
  return {
    rowIds: visibleRowIds,
    sectionIds: visibleSectionIds,
  };
}

function applySub2ApiReloginVisibilityOverrides(state = latestState) {
  const enabled = Boolean(state?.sub2apiReloginEnabled);
  const targetId = String(state?.openaiIntegrationTargetId || state?.panelMode || selectPanelMode?.value || '').trim().toLowerCase();
  const activeFlowId = String(state?.activeFlowId || state?.flowId || selectFlow?.value || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase();
  const active = enabled && activeFlowId === DEFAULT_ACTIVE_FLOW_ID && targetId === 'sub2api';
  if (rowSub2ApiReloginPool) {
    rowSub2ApiReloginPool.style.display = active ? '' : 'none';
  }
  if (!active) {
    return;
  }
  [
    rowCustomPassword,
    rowPlusMode,
    rowPhonePlusMode,
    rowBrowserFingerprint,
    rowPlusAccountAccessStrategy,
    rowPlusPaymentMethod,
    rowPlusCheckoutVerificationFailureStrategy,
    rowPlusCheckoutCreatePreWait,
    rowPlusCheckoutOpenStableWait,
    rowPlusHostedCheckoutCardPreWait,
    rowPlusCheckoutConversionProxy,
    rowPayPalAccount,
    rowPayPalProfileGenerator,
    rowHostedCheckoutVerificationUrl,
    rowHostedCheckoutManualFetch,
    rowHostedCheckoutSecurityChallenge,
    rowHostedCheckoutVerificationPopupDelay,
    rowHostedCheckoutPhone,
    rowHostedCheckoutSmsPool,
    rowHostedCheckoutResendSettings,
    rowChatGptApiSmsPool,
  ].filter(Boolean).forEach((element) => {
    element.style.display = 'none';
  });
  [
    rowPlusCheckoutConversionProxyTest,
    rowPlusCheckoutConversionProxyExit,
    typeof rowPlusCheckoutRegionalCheckout !== 'undefined' ? rowPlusCheckoutRegionalCheckout : null,
    rowPlusCheckoutCloudConversionApiUrl,
    rowPlusCheckoutCloudConversionApiKey,
    rowPlusCheckoutConversionProxyRuntime,
  ].filter(Boolean).forEach((element) => {
    element.style.display = 'none';
  });
  if (typeof document !== 'undefined') {
    document.querySelectorAll('#phone-verification-section, #ip-proxy-section').forEach((element) => {
      element.style.display = 'none';
    });
  }
}

function syncFlowSelectorsFromState(state = latestState) {
  const activeFlowId = normalizeFlowId(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID);
  renderFlowSelectorOptions(activeFlowId);
  const targetId = getSelectedTargetIdForState(state, activeFlowId);
  renderTargetSelectorOptions(activeFlowId, targetId);
  return {
    activeFlowId,
    targetId,
  };
}

function getFlowCapabilityRegistry() {
  if (flowCapabilityRegistry) {
    return flowCapabilityRegistry;
  }
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  flowCapabilityRegistry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
    defaultFlowId: DEFAULT_ACTIVE_FLOW_ID,
  }) || null;
  return flowCapabilityRegistry;
}

function resolveCurrentSidepanelCapabilities(options = {}) {
  const registry = getFlowCapabilityRegistry();
  if (!registry?.resolveSidepanelCapabilities) {
    return null;
  }
  const activeFlowId = normalizeFlowId(
    options?.activeFlowId
      ?? options?.state?.activeFlowId
      ?? latestState?.activeFlowId
      ?? latestState?.flowId
      ?? DEFAULT_ACTIVE_FLOW_ID
  );
  const state = {
    ...(latestState || {}),
    ...(options?.state || {}),
    activeFlowId,
  };
  const targetId = options?.targetId !== undefined
    ? options.targetId
    : (activeFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? (options?.panelMode ?? state?.panelMode)
      : (options?.kiroTargetId ?? state?.kiroTargetId));
  if (activeFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    state.panelMode = normalizePanelMode(
      targetId || state?.panelMode || getDefaultTargetIdForFlow(activeFlowId)
    );
  } else {
    state.kiroTargetId = normalizeTargetIdForFlow(
      activeFlowId,
      targetId || state?.kiroTargetId || '',
      getDefaultTargetIdForFlow(activeFlowId)
    );
  }
  return registry.resolveSidepanelCapabilities({
    activeFlowId,
    panelMode: state?.panelMode,
    targetId: activeFlowId === DEFAULT_ACTIVE_FLOW_ID ? state?.panelMode : state?.kiroTargetId,
    signupMethod: options?.signupMethod ?? state?.signupMethod,
    state,
  });
}

function resolveStepDefinitionCapabilityState(state = latestState, options = {}) {
  const nextState = {
    ...(state || {}),
    ...(options?.state || {}),
  };
  const capabilityState = resolveCurrentSidepanelCapabilities({
    activeFlowId: options?.activeFlowId ?? nextState?.activeFlowId,
    panelMode: options?.panelMode ?? nextState?.panelMode,
    signupMethod: options?.signupMethod ?? nextState?.signupMethod,
    state: nextState,
  });
  return {
    capabilityState,
    phonePlusModeEnabled: capabilityState
      ? Boolean(capabilityState.runtimeLocks?.phonePlusModeEnabled)
      : Boolean(nextState?.phonePlusModeEnabled),
    plusModeEnabled: capabilityState
      ? Boolean(capabilityState.runtimeLocks?.plusModeEnabled)
      : (Boolean(nextState?.plusModeEnabled) && !Boolean(nextState?.phonePlusModeEnabled)),
    plusAccountAccessStrategy: capabilityState?.effectivePlusAccountAccessStrategy
      || (
        Boolean(nextState?.phonePlusModeEnabled)
          ? PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH
          : normalizePlusAccountAccessStrategy(
            nextState?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY
          )
      ),
    signupMethod: capabilityState?.effectiveSignupMethod
      || (
        Boolean(nextState?.phonePlusModeEnabled)
          ? SIGNUP_METHOD_PHONE
          : normalizeSignupMethod((options?.signupMethod ?? nextState?.signupMethod) || DEFAULT_SIGNUP_METHOD)
      ),
  };
}

function getSelectedPanelMode() {
  const resolvedPanelMode = normalizePanelMode(
    typeof selectPanelMode !== 'undefined' && selectPanelMode
      ? selectPanelMode.value
      : (typeof latestState !== 'undefined' ? latestState?.panelMode : '')
  );
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({ panelMode: resolvedPanelMode })
    : null;
  return capabilityState?.effectivePanelMode || capabilityState?.panelMode || resolvedPanelMode;
}

function getSelectedSignupMethod() {
  const activeButton = signupMethodButtons.find((button) => button.classList.contains('is-active'));
  return normalizeSignupMethod(activeButton?.dataset.signupMethod || latestState?.signupMethod || DEFAULT_SIGNUP_METHOD);
}

function setSignupMethod(method) {
  const resolvedMethod = normalizeSignupMethod(method);
  signupMethodButtons.forEach((button) => {
    const active = normalizeSignupMethod(button.dataset.signupMethod) === resolvedMethod;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  syncLatestState({ signupMethod: resolvedMethod });
  return resolvedMethod;
}

function canSelectPhoneSignupMethod() {
  const phoneEnabled = Boolean(inputPhoneVerificationEnabled?.checked);
  const plusModeEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  const phonePlusModeEnabled = typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
    ? Boolean(inputPhonePlusModeEnabled.checked)
    : Boolean(latestState?.phonePlusModeEnabled);
  const accountContributionEnabled = typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState)
    : Boolean(latestState?.accountContributionEnabled);
  const selectedPanelMode = normalizePanelMode(
    typeof selectPanelMode !== 'undefined' && selectPanelMode
      ? selectPanelMode.value
      : latestState?.panelMode
  );
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      panelMode: selectedPanelMode,
      state: {
        ...(typeof latestState !== 'undefined' ? latestState : {}),
        phoneVerificationEnabled: phoneEnabled,
        plusModeEnabled,
        phonePlusModeEnabled,
        accountContributionEnabled,
      },
    })
    : (() => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
        defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
      }) || null;
      return registry?.resolveSidepanelCapabilities
        ? registry.resolveSidepanelCapabilities({
          activeFlowId: typeof latestState !== 'undefined' ? latestState?.activeFlowId : '',
          panelMode: selectedPanelMode,
          state: {
            ...(typeof latestState !== 'undefined' ? latestState : {}),
            phoneVerificationEnabled: phoneEnabled,
            plusModeEnabled,
            phonePlusModeEnabled,
            accountContributionEnabled,
          },
        })
        : null;
    })();
  if (capabilityState && typeof capabilityState.canSelectPhoneSignup === 'boolean') {
    return capabilityState.canSelectPhoneSignup;
  }
  return phoneEnabled && (!plusModeEnabled || phonePlusModeEnabled) && !accountContributionEnabled;
}

function isSignupMethodSwitchLocked() {
  return isAutoRunLockedPhase() || isAutoRunPausedPhase() || isAutoRunScheduledPhase();
}

function updateSignupMethodUI(options = {}) {
  if (!signupMethodButtons.length) {
    if (typeof syncSignupPhoneInputFromState === 'function') {
      syncSignupPhoneInputFromState(latestState);
    }
    return;
  }

  const phonePlusModeEnabled = typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
    ? Boolean(inputPhonePlusModeEnabled.checked)
    : Boolean(latestState?.phonePlusModeEnabled);
  const sub2apiReloginEnabled = typeof inputSub2ApiReloginEnabled !== 'undefined' && inputSub2ApiReloginEnabled
    ? Boolean(inputSub2ApiReloginEnabled.checked)
    : Boolean(latestState?.sub2apiReloginEnabled);
  const showSignupMethod = Boolean(inputPhoneVerificationEnabled?.checked || phonePlusModeEnabled);
  if (rowSignupMethod) {
    rowSignupMethod.style.display = showSignupMethod ? '' : 'none';
  }
  const showSignupPhoneSubmitResultSettings = showSignupMethod && normalizeSignupMethod(getSelectedSignupMethod()) === SIGNUP_METHOD_PHONE;
  [
    typeof rowSignupPhoneVerificationSubmitResultMaxRounds !== 'undefined' ? rowSignupPhoneVerificationSubmitResultMaxRounds : null,
    typeof rowSignupPhoneVerificationSubmitResultRoundWaitSeconds !== 'undefined' ? rowSignupPhoneVerificationSubmitResultRoundWaitSeconds : null,
  ].forEach((row) => {
    if (row) {
      row.style.display = showSignupPhoneSubmitResultSettings ? '' : 'none';
    }
  });

  let selectedMethod = normalizeSignupMethod(getSelectedSignupMethod());
  const phoneSelectable = canSelectPhoneSignupMethod();
  const accountContributionEnabled = typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState)
    : Boolean(latestState?.accountContributionEnabled);
  if (phonePlusModeEnabled) {
    selectedMethod = setSignupMethod(SIGNUP_METHOD_PHONE);
  } else if (!phoneSelectable && selectedMethod === SIGNUP_METHOD_PHONE) {
    selectedMethod = setSignupMethod(SIGNUP_METHOD_EMAIL);
    if (options.notify && typeof showToast === 'function') {
      showToast('已切回邮箱注册', 'info', 1600);
    }
  } else {
    setSignupMethod(selectedMethod);
  }

  const locked = isSignupMethodSwitchLocked();
  signupMethodButtons.forEach((button) => {
    const method = normalizeSignupMethod(button.dataset.signupMethod);
    const disabled = locked
      || (phonePlusModeEnabled
        ? method !== SIGNUP_METHOD_PHONE
        : (method === SIGNUP_METHOD_PHONE && !phoneSelectable));
    button.disabled = disabled;
    button.setAttribute('aria-disabled', String(disabled));
    if (phonePlusModeEnabled) {
      button.title = method === SIGNUP_METHOD_EMAIL
        ? 'Phone Plus 模式固定为手机号注册'
        : '';
    } else if (method === SIGNUP_METHOD_PHONE) {
      if (!Boolean(inputPhoneVerificationEnabled?.checked)) {
        button.title = '开启接码后可选择手机号注册';
      } else if (typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled?.checked) {
        button.title = 'Plus 模式暂不支持手机号注册';
      } else if (accountContributionEnabled) {
        button.title = '账号贡献开启时不能使用手机号注册';
      } else if (locked) {
        button.title = '自动流程运行中不能切换注册方式';
      } else {
        button.title = '';
      }
    }
  });
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState({
      ...(latestState || {}),
      activeFlowId: sub2apiReloginEnabled ? DEFAULT_ACTIVE_FLOW_ID : latestState?.activeFlowId,
      panelMode: sub2apiReloginEnabled ? 'sub2api' : latestState?.panelMode,
      openaiIntegrationTargetId: sub2apiReloginEnabled ? 'sub2api' : latestState?.openaiIntegrationTargetId,
      sub2apiReloginEnabled,
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled,
      signupMethod: selectedMethod,
    }, {
      signupMethod: selectedMethod,
    })
    : {
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled,
      signupMethod: phonePlusModeEnabled ? SIGNUP_METHOD_PHONE : selectedMethod,
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, {
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    plusPaymentMethod: getSelectedPlusPaymentMethod(latestState),
    openaiIntegrationTargetId: sub2apiReloginEnabled ? 'sub2api' : (latestState?.openaiIntegrationTargetId || latestState?.panelMode),
    panelMode: sub2apiReloginEnabled ? 'sub2api' : (latestState?.panelMode || latestState?.openaiIntegrationTargetId),
    sub2apiReloginEnabled,
    signupMethod: stepDefinitionState.signupMethod,
    phoneSignupReloginAfterBindEmailEnabled: typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail
      ? Boolean(inputPhoneSignupReloginAfterBindEmail.checked)
      : currentPhoneSignupReloginAfterBindEmailEnabled,
  });
  if (typeof syncSignupPhoneInputFromState === 'function') {
    syncSignupPhoneInputFromState(latestState);
  }
}

function updatePhoneVerificationSettingsUI() {
  const rawEnabled = Boolean(inputPhoneVerificationEnabled?.checked);
  const rawPlusModeEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  const rawPhonePlusModeEnabled = typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
    ? Boolean(inputPhonePlusModeEnabled.checked)
    : Boolean(latestState?.phonePlusModeEnabled);
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode,
      signupMethod: typeof getSelectedSignupMethod === 'function' ? getSelectedSignupMethod() : latestState?.signupMethod,
      state: {
        ...(latestState || {}),
        phoneVerificationEnabled: rawEnabled,
        plusModeEnabled: rawPlusModeEnabled,
        phonePlusModeEnabled: rawPhonePlusModeEnabled,
      },
    })
    : (() => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
        defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
      }) || null;
      return registry?.resolveSidepanelCapabilities
        ? registry.resolveSidepanelCapabilities({
          activeFlowId: latestState?.activeFlowId,
          panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : (latestState?.panelMode || 'cpa'),
          signupMethod: typeof getSelectedSignupMethod === 'function' ? getSelectedSignupMethod() : latestState?.signupMethod,
          state: {
            ...(latestState || {}),
            phoneVerificationEnabled: rawEnabled,
            plusModeEnabled: rawPlusModeEnabled,
            phonePlusModeEnabled: rawPhonePlusModeEnabled,
          },
        })
        : null;
    })();
  const canShowPhoneSettings = capabilityState
    ? Boolean(capabilityState.canShowPhoneSettings)
    : true;
  const effectivePhoneVerificationEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.phoneVerificationEnabled)
    : (rawPhonePlusModeEnabled ? true : rawEnabled);
  const effectivePhonePlusModeEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.phonePlusModeEnabled)
    : rawPhonePlusModeEnabled;
  if (inputPhoneVerificationEnabled) {
    inputPhoneVerificationEnabled.checked = effectivePhoneVerificationEnabled;
    inputPhoneVerificationEnabled.disabled = effectivePhonePlusModeEnabled;
  }
  const enabled = canShowPhoneSettings && effectivePhoneVerificationEnabled;
  const showSettings = enabled && phoneVerificationSectionExpanded;
  const selectedSignupMethodForPhoneSettings = typeof getSelectedSignupMethod === 'function'
    ? getSelectedSignupMethod()
    : normalizeSignupMethod(latestState?.signupMethod || DEFAULT_SIGNUP_METHOD);
  const showPhoneSignupReloginAfterBindEmail = showSettings
    && selectedSignupMethodForPhoneSettings === SIGNUP_METHOD_PHONE;
  const showPhoneSignupPhonePrefixedEmail = showSettings
    && selectedSignupMethodForPhoneSettings === SIGNUP_METHOD_PHONE;
  const normalizeProvider = typeof normalizePhoneSmsProviderValue === 'function'
    ? normalizePhoneSmsProviderValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '5sim') return '5sim';
      if (normalized === 'nexsms') return 'nexsms';
      return 'hero-sms';
    });
  const heroProviderValue = typeof PHONE_SMS_PROVIDER_HERO !== 'undefined' ? PHONE_SMS_PROVIDER_HERO : 'hero-sms';
  const fiveSimProviderValue = typeof PHONE_SMS_PROVIDER_FIVE_SIM !== 'undefined' ? PHONE_SMS_PROVIDER_FIVE_SIM : '5sim';
  const nexSmsProviderValue = typeof PHONE_SMS_PROVIDER_NEXSMS !== 'undefined' ? PHONE_SMS_PROVIDER_NEXSMS : 'nexsms';
  const smsBowerProviderValue = typeof PHONE_SMS_PROVIDER_SMSBOWER !== 'undefined' ? PHONE_SMS_PROVIDER_SMSBOWER : 'smsbower';
  const smsVerificationNumberProviderValue = typeof PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER !== 'undefined' ? PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER : 'sms-verification-number';
  const grizzlySmsProviderValue = typeof PHONE_SMS_PROVIDER_GRIZZLYSMS !== 'undefined' ? PHONE_SMS_PROVIDER_GRIZZLYSMS : 'grizzlysms';
  const smsPoolProviderValue = typeof PHONE_SMS_PROVIDER_SMSPOOL !== 'undefined' ? PHONE_SMS_PROVIDER_SMSPOOL : 'smspool';
  const chatGptApiProviderValue = typeof PHONE_SMS_PROVIDER_CHATGPT_API !== 'undefined' ? PHONE_SMS_PROVIDER_CHATGPT_API : 'chatgpt-api';
  const providerOrderForDisplay = resolveNormalizedProviderOrderForRuntime(latestState || {});
  const provider = providerOrderForDisplay[0] || (
    typeof getSelectedPhoneSmsProvider === 'function'
      ? getSelectedPhoneSmsProvider()
      : normalizeProvider(selectPhoneSmsProvider?.value || latestState?.phoneSmsProvider || heroProviderValue)
  );
  const heroProvider = provider === heroProviderValue;
  const fiveSimProvider = provider === fiveSimProviderValue;
  const nexSmsProvider = provider === nexSmsProviderValue;
  const smsBowerProvider = provider === smsBowerProviderValue;
  const smsVerificationNumberProvider = provider === smsVerificationNumberProviderValue;
  const grizzlySmsProvider = provider === grizzlySmsProviderValue;
  const smsPoolProvider = provider === smsPoolProviderValue;
  const chatGptApiProvider = provider === chatGptApiProviderValue;
  const heroLikeProvider = heroProvider || smsBowerProvider || smsVerificationNumberProvider || grizzlySmsProvider || smsPoolProvider;
  if (rowPhoneVerificationEnabled) {
    rowPhoneVerificationEnabled.style.display = canShowPhoneSettings ? '' : 'none';
  }
  if (rowHeroSmsPlatform) {
    rowHeroSmsPlatform.style.display = canShowPhoneSettings ? '' : 'none';
  }
  updateSignupMethodUI();
  if (btnTogglePhoneVerificationSection) {
    btnTogglePhoneVerificationSection.disabled = !enabled;
    btnTogglePhoneVerificationSection.textContent = showSettings ? '收起设置' : '展开设置';
    btnTogglePhoneVerificationSection.title = enabled
      ? (showSettings ? '收起接码设置' : '展开接码设置')
      : '开启接码后可展开设置';
    btnTogglePhoneVerificationSection.setAttribute('aria-expanded', String(showSettings));
  }
  if (rowPhoneVerificationFold) {
    rowPhoneVerificationFold.style.display = showSettings ? '' : 'none';
  }

  const phoneVerificationRows = [
    typeof rowPhoneSmsProvider !== 'undefined' ? rowPhoneSmsProvider : null,
    typeof rowPhoneSmsProviderOrder !== 'undefined' ? rowPhoneSmsProviderOrder : null,
    typeof rowPhoneSmsProviderOrderActions !== 'undefined' ? rowPhoneSmsProviderOrderActions : null,
    typeof rowHeroSmsCountry !== 'undefined' ? rowHeroSmsCountry : null,
    typeof rowHeroSmsCountryFallback !== 'undefined' ? rowHeroSmsCountryFallback : null,
    typeof rowHeroSmsOperator !== 'undefined' ? rowHeroSmsOperator : null,
    typeof rowHeroSmsAcquirePriority !== 'undefined' ? rowHeroSmsAcquirePriority : null,
    typeof rowHeroSmsApiKey !== 'undefined' ? rowHeroSmsApiKey : null,
    typeof rowFiveSimApiKey !== 'undefined' ? rowFiveSimApiKey : null,
    typeof rowFiveSimCountry !== 'undefined' ? rowFiveSimCountry : null,
    typeof rowFiveSimCountryFallback !== 'undefined' ? rowFiveSimCountryFallback : null,
    typeof rowFiveSimProduct !== 'undefined' ? rowFiveSimProduct : null,
    typeof rowNexSmsApiKey !== 'undefined' ? rowNexSmsApiKey : null,
    typeof rowNexSmsCountry !== 'undefined' ? rowNexSmsCountry : null,
    typeof rowNexSmsCountryFallback !== 'undefined' ? rowNexSmsCountryFallback : null,
    typeof rowNexSmsServiceCode !== 'undefined' ? rowNexSmsServiceCode : null,
    typeof rowHeroSmsMaxPrice !== 'undefined' ? rowHeroSmsMaxPrice : null,
    typeof rowFiveSimOperator !== 'undefined' ? rowFiveSimOperator : null,
    typeof rowPhoneCodeSettingsGroup !== 'undefined' ? rowPhoneCodeSettingsGroup : null,
    typeof rowPhoneVerificationResendCount !== 'undefined' ? rowPhoneVerificationResendCount : null,
    typeof rowPhoneReplacementLimit !== 'undefined' ? rowPhoneReplacementLimit : null,
    typeof rowPhoneActivationRetryRounds !== 'undefined' ? rowPhoneActivationRetryRounds : null,
    typeof rowPhoneActivationTierUpgradeLimit !== 'undefined' ? rowPhoneActivationTierUpgradeLimit : null,
    typeof rowPhoneCodeWaitSeconds !== 'undefined' ? rowPhoneCodeWaitSeconds : null,
    typeof rowPhoneCodeTimeoutWindows !== 'undefined' ? rowPhoneCodeTimeoutWindows : null,
    typeof rowPhoneCodePollIntervalSeconds !== 'undefined' ? rowPhoneCodePollIntervalSeconds : null,
    typeof rowPhoneCodePollMaxRounds !== 'undefined' ? rowPhoneCodePollMaxRounds : null,
    typeof rowFreePhoneReuseEnabled !== 'undefined' ? rowFreePhoneReuseEnabled : null,
    typeof rowFreePhoneReuseAutoEnabled !== 'undefined' ? rowFreePhoneReuseAutoEnabled : null,
  ];
  phoneVerificationRows.forEach((row) => {
    if (row) {
      row.style.display = showSettings ? '' : 'none';
    }
  });
  if (typeof rowPhoneSignupReloginAfterBindEmail !== 'undefined' && rowPhoneSignupReloginAfterBindEmail) {
    rowPhoneSignupReloginAfterBindEmail.style.display = showPhoneSignupReloginAfterBindEmail ? '' : 'none';
  }
  if (typeof rowPhoneSignupPhonePrefixedEmail !== 'undefined' && rowPhoneSignupPhonePrefixedEmail) {
    rowPhoneSignupPhonePrefixedEmail.style.display = showPhoneSignupPhonePrefixedEmail ? '' : 'none';
  }
  if (rowHeroSmsCountry) rowHeroSmsCountry.style.display = showSettings && heroLikeProvider ? '' : 'none';
  if (rowHeroSmsCountryFallback) rowHeroSmsCountryFallback.style.display = showSettings && heroLikeProvider ? '' : 'none';
  if (typeof rowHeroSmsOperator !== 'undefined' && rowHeroSmsOperator) rowHeroSmsOperator.style.display = showSettings && heroProvider ? '' : 'none';
  if (rowHeroSmsAcquirePriority) rowHeroSmsAcquirePriority.style.display = showSettings && heroLikeProvider ? '' : 'none';
  if (rowHeroSmsApiKey) rowHeroSmsApiKey.style.display = showSettings && (heroLikeProvider || chatGptApiProvider) ? '' : 'none';
  if (rowFiveSimApiKey) rowFiveSimApiKey.style.display = showSettings && fiveSimProvider ? '' : 'none';
  if (rowFiveSimCountry) rowFiveSimCountry.style.display = showSettings && fiveSimProvider ? '' : 'none';
  if (rowFiveSimCountryFallback) rowFiveSimCountryFallback.style.display = showSettings && fiveSimProvider ? '' : 'none';
  if (rowFiveSimOperator) rowFiveSimOperator.style.display = showSettings && fiveSimProvider ? '' : 'none';
  if (rowFiveSimProduct) rowFiveSimProduct.style.display = showSettings && fiveSimProvider ? '' : 'none';
  if (rowNexSmsApiKey) rowNexSmsApiKey.style.display = showSettings && nexSmsProvider ? '' : 'none';
  if (rowNexSmsCountry) rowNexSmsCountry.style.display = showSettings && nexSmsProvider ? '' : 'none';
  if (rowNexSmsCountryFallback) rowNexSmsCountryFallback.style.display = showSettings && nexSmsProvider ? '' : 'none';
  if (rowNexSmsServiceCode) rowNexSmsServiceCode.style.display = showSettings && nexSmsProvider ? '' : 'none';
  if (rowFiveSimOperator) {
    rowFiveSimOperator.style.display = showSettings && fiveSimProvider ? '' : 'none';
  }
  if (rowChatGptApiSmsPool) {
    rowChatGptApiSmsPool.style.display = showSettings && chatGptApiProvider ? '' : 'none';
  }
  if (typeof rowFreePhoneReuseEnabled !== 'undefined' && rowFreePhoneReuseEnabled) {
    rowFreePhoneReuseEnabled.style.display = showSettings ? '' : 'none';
  }
  if (typeof rowFreePhoneReuseAutoEnabled !== 'undefined' && rowFreePhoneReuseAutoEnabled) {
    rowFreePhoneReuseAutoEnabled.style.display = showSettings ? '' : 'none';
  }
  const phoneSignupReuseLocked = typeof isPhoneSignupReuseLocked === 'function'
    ? isPhoneSignupReuseLocked(latestState, {
      signupMethod: typeof getSelectedSignupMethod === 'function'
        ? getSelectedSignupMethod()
        : latestState?.signupMethod,
    })
    : false;
  if (!phoneSignupReuseLocked && phoneSignupReuseUiWasLocked) {
    restorePhoneReuseControlsFromState(latestState);
  }
  if (phoneSignupReuseLocked) {
    if (typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled) {
      inputHeroSmsReuseEnabled.checked = false;
    }
    if (typeof inputFreePhoneReuseEnabled !== 'undefined' && inputFreePhoneReuseEnabled) {
      inputFreePhoneReuseEnabled.checked = false;
    }
    if (typeof inputFreePhoneReuseAutoEnabled !== 'undefined' && inputFreePhoneReuseAutoEnabled) {
      inputFreePhoneReuseAutoEnabled.checked = false;
    }
  }
  phoneSignupReuseUiWasLocked = phoneSignupReuseLocked;
  const settingsLocked = isAutoRunLockedPhase() || isAutoRunScheduledPhase();
  if (typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail) {
    inputPhoneSignupReloginAfterBindEmail.disabled = settingsLocked || !showPhoneSignupReloginAfterBindEmail;
  }
  if (typeof rowPhoneSignupReloginAfterBindEmail !== 'undefined' && rowPhoneSignupReloginAfterBindEmail) {
    rowPhoneSignupReloginAfterBindEmail.classList.toggle('is-disabled', settingsLocked || !showPhoneSignupReloginAfterBindEmail);
  }
  if (typeof inputPhoneSignupPhonePrefixedEmail !== 'undefined' && inputPhoneSignupPhonePrefixedEmail) {
    inputPhoneSignupPhonePrefixedEmail.disabled = settingsLocked || !showPhoneSignupPhonePrefixedEmail;
  }
  if (typeof rowPhoneSignupPhonePrefixedEmail !== 'undefined' && rowPhoneSignupPhonePrefixedEmail) {
    rowPhoneSignupPhonePrefixedEmail.classList.toggle('is-disabled', settingsLocked || !showPhoneSignupPhonePrefixedEmail);
  }
  const freePhoneReuseEnabled = Boolean(
    !phoneSignupReuseLocked
    && typeof inputFreePhoneReuseEnabled !== 'undefined'
    && inputFreePhoneReuseEnabled?.checked
  );
  const freePhoneReuseAutoAvailable = showSettings && !phoneSignupReuseLocked && freePhoneReuseEnabled;
  if (typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled) {
    inputHeroSmsReuseEnabled.disabled = settingsLocked || phoneSignupReuseLocked;
  }
  if (typeof inputFreePhoneReuseAutoEnabled !== 'undefined' && inputFreePhoneReuseAutoEnabled) {
    inputFreePhoneReuseAutoEnabled.disabled = settingsLocked || phoneSignupReuseLocked || !freePhoneReuseAutoAvailable;
    if (!freePhoneReuseAutoAvailable) {
      inputFreePhoneReuseAutoEnabled.checked = false;
    }
  }
  setFreePhoneReuseControlsLocked(settingsLocked || phoneSignupReuseLocked);
  if (typeof selectHeroSmsPreferredActivation !== 'undefined' && selectHeroSmsPreferredActivation) {
    selectHeroSmsPreferredActivation.disabled = settingsLocked || phoneSignupReuseLocked;
  }
  if (typeof inputFreeReusablePhone !== 'undefined' && inputFreeReusablePhone) {
    inputFreeReusablePhone.disabled = settingsLocked || phoneSignupReuseLocked;
  }
  if (typeof btnSaveFreeReusablePhone !== 'undefined' && btnSaveFreeReusablePhone) {
    btnSaveFreeReusablePhone.disabled = settingsLocked || phoneSignupReuseLocked;
  }
  if (typeof btnClearFreeReusablePhone !== 'undefined' && btnClearFreeReusablePhone) {
    btnClearFreeReusablePhone.disabled = settingsLocked || phoneSignupReuseLocked;
  }
  const heroSmsReuseRow = typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled?.closest
    ? inputHeroSmsReuseEnabled.closest('.hero-sms-price-control')
    : null;
  setElementReuseLockedState(heroSmsReuseRow, phoneSignupReuseLocked);
  setElementReuseLockedState(
    typeof rowFreePhoneReuseEnabled !== 'undefined' ? rowFreePhoneReuseEnabled : null,
    phoneSignupReuseLocked
  );
  setElementReuseLockedState(
    typeof rowFreePhoneReuseAutoEnabled !== 'undefined' ? rowFreePhoneReuseAutoEnabled : null,
    phoneSignupReuseLocked
  );
  setElementReuseLockedState(
    typeof rowHeroSmsPreferredActivation !== 'undefined' ? rowHeroSmsPreferredActivation : null,
    phoneSignupReuseLocked
  );
  setElementReuseLockedState(
    typeof rowFreeReusablePhone !== 'undefined' ? rowFreeReusablePhone : null,
    phoneSignupReuseLocked
  );
  if (typeof rowFreePhoneReuseAutoEnabled !== 'undefined' && rowFreePhoneReuseAutoEnabled) {
    rowFreePhoneReuseAutoEnabled.classList.toggle('is-disabled', phoneSignupReuseLocked || !freePhoneReuseAutoAvailable);
  }
  const runtimeVisible = enabled;
  const failedSignupPhoneReuseVisible = runtimeVisible
    && Boolean(resolveFailedSignupPhoneReuseActivationForDisplay(latestState));
  [
    typeof rowHeroSmsRuntimePair !== 'undefined' ? rowHeroSmsRuntimePair : null,
    typeof rowHeroSmsCurrentNumber !== 'undefined' ? rowHeroSmsCurrentNumber : null,
    typeof rowHeroSmsCurrentCountdown !== 'undefined' ? rowHeroSmsCurrentCountdown : null,
    typeof rowHeroSmsCurrentCode !== 'undefined' ? rowHeroSmsCurrentCode : null,
    typeof rowFreeReusablePhone !== 'undefined' ? rowFreeReusablePhone : null,
    typeof rowHeroSmsPreferredActivation !== 'undefined' ? rowHeroSmsPreferredActivation : null,
  ].forEach((row) => {
    if (row) {
      row.style.display = runtimeVisible ? '' : 'none';
    }
  });
  if (typeof rowFailedSignupPhoneReuse !== 'undefined' && rowFailedSignupPhoneReuse) {
    rowFailedSignupPhoneReuse.style.display = failedSignupPhoneReuseVisible ? '' : 'none';
  }
  if (typeof syncSignupPhoneInputFromState === 'function') {
    syncSignupPhoneInputFromState(latestState);
  }
  if (!showSettings && typeof rowHeroSmsPriceTiers !== 'undefined' && rowHeroSmsPriceTiers) {
    rowHeroSmsPriceTiers.style.display = 'none';
  }
  updateHeroSmsPlatformDisplay();
}

function updatePlusModeUI() {
  const paypalValue = typeof PLUS_PAYMENT_METHOD_PAYPAL !== 'undefined' ? PLUS_PAYMENT_METHOD_PAYPAL : 'paypal';
  const paypalHostedValue = typeof PLUS_PAYMENT_METHOD_PAYPAL_HOSTED !== 'undefined' ? PLUS_PAYMENT_METHOD_PAYPAL_HOSTED : 'paypal-hosted';
  const gopayValue = typeof PLUS_PAYMENT_METHOD_GOPAY !== 'undefined' ? PLUS_PAYMENT_METHOD_GOPAY : 'gopay';
  const gpcValue = typeof PLUS_PAYMENT_METHOD_GPC_HELPER !== 'undefined' ? PLUS_PAYMENT_METHOD_GPC_HELPER : 'gpc-helper';
  const oauthStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_OAUTH
    : 'oauth';
  const sub2apiSessionStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_SUB2API_CODEX_SESSION
    : 'sub2api_codex_session';
  const cpaSessionStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_CPA_CODEX_SESSION
    : 'cpa_codex_session';
  const sessionUiStrategyValue = typeof PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI !== 'undefined'
    ? PLUS_ACCOUNT_ACCESS_STRATEGY_CODEX_SESSION_UI
    : 'codex_session';
  const defaultMethod = typeof DEFAULT_PLUS_PAYMENT_METHOD !== 'undefined' ? DEFAULT_PLUS_PAYMENT_METHOD : paypalValue;
  const resolveStrategyTargetId = typeof normalizePlusStrategyTargetId === 'function'
    ? normalizePlusStrategyTargetId
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'sub2api') {
        return 'sub2api';
      }
      if (normalized === 'codex2api') {
        return 'codex2api';
      }
      return 'cpa';
    });
  const describePlusAccountAccessStrategy = typeof getPlusAccountAccessStrategyDescription === 'function'
    ? getPlusAccountAccessStrategyDescription
    : ((strategy = '', targetId = '') => {
      const normalizedStrategy = normalizePlusAccountAccessStrategy(strategy);
      const normalizedTargetId = resolveStrategyTargetId(targetId);
      if (normalizedStrategy === sub2apiSessionStrategyValue) {
        return '复用当前 Plus 已登录会话，直接导入到 SUB2API';
      }
      if (normalizedStrategy === cpaSessionStrategyValue) {
        return '复用当前 Plus 已登录会话，直接导入到 CPA';
      }
      if (normalizedTargetId === 'sub2api') {
        return '通过 OAuth 回调创建 SUB2API 账号';
      }
      if (normalizedTargetId === 'codex2api') {
        return '通过 OAuth 回调创建 Codex2API 账号';
      }
      return '通过 OAuth 回调创建 CPA 账号';
    });
  const normalizeStrategyUiValue = typeof normalizePlusAccountAccessStrategyUiValue === 'function'
    ? normalizePlusAccountAccessStrategyUiValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (
        normalized === sessionUiStrategyValue
        || normalized === sub2apiSessionStrategyValue
        || normalized === cpaSessionStrategyValue
      ) {
        return sessionUiStrategyValue;
      }
      return oauthStrategyValue;
    });
  const requestedPlusAccountAccessStrategy = typeof getRequestedPlusAccountAccessStrategy === 'function'
    ? getRequestedPlusAccountAccessStrategy(latestState)
    : normalizePlusAccountAccessStrategy(latestState?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY);
  const rawEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : false;
  const rawPhonePlusModeEnabled = typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
    ? Boolean(inputPhonePlusModeEnabled.checked)
    : Boolean(latestState?.phonePlusModeEnabled);
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode,
      state: {
        ...(latestState || {}),
        plusModeEnabled: rawEnabled,
        phonePlusModeEnabled: rawPhonePlusModeEnabled,
        plusAccountAccessStrategy: requestedPlusAccountAccessStrategy,
      },
    })
    : (() => {
      const rootScope = typeof window !== 'undefined' ? window : globalThis;
      const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
        defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
      }) || null;
      return registry?.resolveSidepanelCapabilities
        ? registry.resolveSidepanelCapabilities({
          activeFlowId: latestState?.activeFlowId,
          panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : (latestState?.panelMode || 'cpa'),
          state: {
            ...(latestState || {}),
            plusModeEnabled: rawEnabled,
            phonePlusModeEnabled: rawPhonePlusModeEnabled,
            plusAccountAccessStrategy: requestedPlusAccountAccessStrategy,
          },
        })
        : null;
    })();
  const supportsPlusMode = capabilityState
    ? Boolean(capabilityState.canShowPlusSettings)
    : true;
  const effectivePhonePlusModeEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.phonePlusModeEnabled)
    : rawPhonePlusModeEnabled;
  const effectivePlusModeEnabled = capabilityState
    ? Boolean(capabilityState.runtimeLocks?.plusModeEnabled)
    : (rawEnabled && !rawPhonePlusModeEnabled);
  const enabled = supportsPlusMode && (effectivePlusModeEnabled || effectivePhonePlusModeEnabled);
  const canEditPlusAccountAccessStrategy = !effectivePhonePlusModeEnabled && Boolean(capabilityState?.canEditPlusAccountAccessStrategy);
  const availablePlusAccountAccessStrategies = effectivePhonePlusModeEnabled
    ? [oauthStrategyValue]
    : (Array.isArray(capabilityState?.availablePlusAccountAccessStrategies)
    && capabilityState.availablePlusAccountAccessStrategies.length > 0
    ? capabilityState.availablePlusAccountAccessStrategies
    : [oauthStrategyValue]);
  const effectivePlusAccountAccessStrategy = effectivePhonePlusModeEnabled
    ? oauthStrategyValue
    : (capabilityState?.effectivePlusAccountAccessStrategy
    || requestedPlusAccountAccessStrategy
    || oauthStrategyValue);
  const effectiveTargetId = resolveStrategyTargetId(
    capabilityState?.effectivePanelMode
    || capabilityState?.effectiveTargetId
    || capabilityState?.panelMode
    || (typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode)
    || 'cpa'
  );
  const method = enabled ? getSelectedPlusPaymentMethod() : defaultMethod;
  const gpcPhoneMode = normalizeGpcHelperPhoneModeValue(
    typeof selectGpcHelperPhoneMode !== 'undefined' && selectGpcHelperPhoneMode
      ? selectGpcHelperPhoneMode.value
      : (latestState?.gopayHelperPhoneMode || 'manual')
  );
  const gpcAutoModeDenied = isGpcAutoModePermissionDenied(latestState);
  const isGpcAutoMode = gpcPhoneMode === GPC_HELPER_PHONE_MODE_AUTO;
  const gpcAutoModeBlocked = isGpcAutoMode && gpcAutoModeDenied;
  const gpcOtpChannel = normalizeGpcOtpChannelValue(
    typeof selectGpcHelperOtpChannel !== 'undefined' && selectGpcHelperOtpChannel
      ? selectGpcHelperOtpChannel.value
      : (latestState?.gopayHelperOtpChannel || 'whatsapp')
  );
  const localSmsEnabled = Boolean(
    typeof inputGpcHelperLocalSmsEnabled !== 'undefined' && inputGpcHelperLocalSmsEnabled
      ? inputGpcHelperLocalSmsEnabled.checked
      : latestState?.gopayHelperLocalSmsHelperEnabled
  );
  const selectedMethod = typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod?.value
    ? normalizePlusPaymentMethod(selectPlusPaymentMethod.value)
    : method;
  const hostedCheckoutFinalStepEnabled = typeof isHostedCheckoutFinalStepEnabled === 'function'
    ? isHostedCheckoutFinalStepEnabled(typeof latestState !== 'undefined' ? latestState : null, {
      plusModeEnabled: effectivePlusModeEnabled,
      phonePlusModeEnabled: effectivePhonePlusModeEnabled,
      plusPaymentMethod: selectedMethod,
    })
    : (
      selectedMethod === paypalHostedValue
      || (
        selectedMethod === paypalValue
        && enabled
        && ((typeof latestState !== 'undefined' ? latestState?.plusHostedCheckoutIsFinalStep : true) !== false)
      )
    );
  const hostedRowsVisible = enabled && hostedCheckoutFinalStepEnabled;
  const gpcRowsVisible = enabled && selectedMethod === gpcValue;
  const canShowGpcModeSelector = gpcRowsVisible;
  const localSmsControlsVisible = gpcRowsVisible && !isGpcAutoMode;
  const effectiveLocalSmsEnabled = !isGpcAutoMode && localSmsEnabled;
  if (typeof rowPlusMode !== 'undefined' && rowPlusMode) {
    rowPlusMode.style.display = supportsPlusMode ? '' : 'none';
  }
  if (typeof rowPhonePlusMode !== 'undefined' && rowPhonePlusMode) {
    rowPhonePlusMode.style.display = supportsPlusMode ? '' : 'none';
  }
  if (typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled) {
    inputPlusModeEnabled.checked = effectivePlusModeEnabled;
  }
  if (typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled) {
    inputPhonePlusModeEnabled.checked = effectivePhonePlusModeEnabled;
  }
  if (typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod) {
    selectPlusPaymentMethod.value = method;
    if (selectPlusPaymentMethod.style) {
      selectPlusPaymentMethod.style.display = enabled ? '' : 'none';
    }
  }
  if (typeof plusPaymentMethodCaption !== 'undefined' && plusPaymentMethodCaption) {
    plusPaymentMethodCaption.textContent = method === gpcValue
      ? `GPC ${isGpcAutoMode ? '自动' : '手动'}订阅链路`
      : method === gopayValue
      ? 'GoPay 印尼订阅链路'
      : selectedMethod === paypalHostedValue
      ? 'PayPal 无卡直绑链路（兼容旧配置）'
      : hostedCheckoutFinalStepEnabled
      ? 'PayPal Hosted 自动闭环链路'
      : 'PayPal 传统订阅链路（隐藏兼容）';
  }
  if (typeof plusPaymentMethodCaption !== 'undefined' && plusPaymentMethodCaption && method === gpcValue && gpcAutoModeBlocked) {
    plusPaymentMethodCaption.textContent = 'GPC 自动订阅链路（需手动切换）';
  }
  [
    typeof rowPlusPaymentMethod !== 'undefined' ? rowPlusPaymentMethod : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled ? '' : 'none';
  });
  [
    typeof rowPlusCheckoutCreatePreWait !== 'undefined' ? rowPlusCheckoutCreatePreWait : null,
    typeof rowPlusCheckoutOpenStableWait !== 'undefined' ? rowPlusCheckoutOpenStableWait : null,
    typeof rowPlusHostedCheckoutCardPreWait !== 'undefined' ? rowPlusHostedCheckoutCardPreWait : null,
    typeof rowPlusCheckoutConversionProxy !== 'undefined' ? rowPlusCheckoutConversionProxy : null,
    typeof rowPlusCheckoutConversionProxyTest !== 'undefined' ? rowPlusCheckoutConversionProxyTest : null,
    typeof rowPlusCheckoutConversionProxyExit !== 'undefined' ? rowPlusCheckoutConversionProxyExit : null,
    typeof rowPlusCheckoutRegionalCheckout !== 'undefined' ? rowPlusCheckoutRegionalCheckout : null,
    typeof rowPlusCheckoutConversionProxyRuntime !== 'undefined' ? rowPlusCheckoutConversionProxyRuntime : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled ? '' : 'none';
  });
  if (typeof rowPlusCheckoutVerificationFailureStrategy !== 'undefined' && rowPlusCheckoutVerificationFailureStrategy) {
    rowPlusCheckoutVerificationFailureStrategy.style.display = hostedRowsVisible ? '' : 'none';
  }
  if (typeof selectPlusCheckoutVerificationFailureStrategy !== 'undefined' && selectPlusCheckoutVerificationFailureStrategy) {
    selectPlusCheckoutVerificationFailureStrategy.value = normalizePlusCheckoutVerificationFailureStrategy(
      latestState?.plusCheckoutVerificationFailureStrategy
    );
  }
  if (typeof rowPlusCheckAllowedRegions !== 'undefined' && rowPlusCheckAllowedRegions) {
    rowPlusCheckAllowedRegions.style.display = enabled && effectivePhonePlusModeEnabled ? '' : 'none';
  }
  if (typeof updatePlusCheckoutConversionModeUi === 'function') {
    updatePlusCheckoutConversionModeUi();
  }
  if (enabled) {
    if (typeof renderPlusCheckoutConversionProxyExitCheck === 'function') {
      renderPlusCheckoutConversionProxyExitCheck(latestState);
    }
    if (typeof renderPlusCheckoutConversionProxyRuntimeStatus === 'function') {
      renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
    }
  }
  [
    typeof rowPlusAccountAccessStrategy !== 'undefined' ? rowPlusAccountAccessStrategy : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled ? '' : 'none';
  });
  if (typeof selectPlusAccountAccessStrategy !== 'undefined' && selectPlusAccountAccessStrategy) {
    const availableStrategyUiValueSet = new Set(availablePlusAccountAccessStrategies.map(normalizeStrategyUiValue));
    Array.from(selectPlusAccountAccessStrategy.options || []).forEach((option) => {
      const optionValue = normalizeStrategyUiValue(option?.value || '');
      const optionSupported = availableStrategyUiValueSet.has(optionValue);
      option.hidden = enabled ? !optionSupported : false;
      option.disabled = enabled ? !optionSupported : false;
    });
    selectPlusAccountAccessStrategy.dataset.requestedValue = effectivePhonePlusModeEnabled
      ? oauthStrategyValue
      : (capabilityState?.runtimeLocks?.accountContribution
      ? requestedPlusAccountAccessStrategy
      : effectivePlusAccountAccessStrategy);
    selectPlusAccountAccessStrategy.value = normalizeStrategyUiValue(effectivePlusAccountAccessStrategy);
    selectPlusAccountAccessStrategy.disabled = !enabled || !canEditPlusAccountAccessStrategy;
    selectPlusAccountAccessStrategy.setAttribute('aria-disabled', String(selectPlusAccountAccessStrategy.disabled));
  }
  if (typeof plusAccountAccessStrategyCaption !== 'undefined' && plusAccountAccessStrategyCaption) {
    if (!enabled) {
      plusAccountAccessStrategyCaption.textContent = '当前来源仅支持 OAuth';
    } else if (!canEditPlusAccountAccessStrategy) {
      plusAccountAccessStrategyCaption.textContent = '当前来源仅支持 OAuth';
    } else if (effectivePlusAccountAccessStrategy === sub2apiSessionStrategyValue) {
      plusAccountAccessStrategyCaption.textContent = '复用当前 Plus 已登录会话，直接导入到 SUB2API';
    } else if (effectivePlusAccountAccessStrategy === oauthStrategyValue) {
      plusAccountAccessStrategyCaption.textContent = '通过 OAuth 回调创建 SUB2API 账号';
    } else {
      plusAccountAccessStrategyCaption.textContent = '当前来源仅支持 OAuth';
    }
  }
  if (typeof plusAccountAccessStrategyCaption !== 'undefined' && plusAccountAccessStrategyCaption) {
    if (!enabled || !canEditPlusAccountAccessStrategy) {
      plusAccountAccessStrategyCaption.textContent = '当前来源仅支持 OAuth';
    } else {
      plusAccountAccessStrategyCaption.textContent = describePlusAccountAccessStrategy(
        effectivePlusAccountAccessStrategy,
        effectiveTargetId
      );
    }
  }
  if (typeof plusAccountAccessStrategyCaption !== 'undefined' && plusAccountAccessStrategyCaption) {
    plusAccountAccessStrategyCaption.textContent = !enabled
      ? '当前来源仅支持 OAuth'
      : (effectivePhonePlusModeEnabled
        ? 'Phone Plus 模式固定使用 OAuth'
      : ((effectivePlusAccountAccessStrategy !== oauthStrategyValue || canEditPlusAccountAccessStrategy)
        ? describePlusAccountAccessStrategy(
          effectivePlusAccountAccessStrategy,
          effectiveTargetId
        )
        : '当前来源仅支持 OAuth'));
  }
  if (enabled && effectivePlusAccountAccessStrategy === sub2apiSessionStrategyValue) {
    [
      typeof rowSub2ApiUrl !== 'undefined' ? rowSub2ApiUrl : null,
      typeof rowSub2ApiEmail !== 'undefined' ? rowSub2ApiEmail : null,
      typeof rowSub2ApiPassword !== 'undefined' ? rowSub2ApiPassword : null,
      typeof rowSub2ApiGroup !== 'undefined' ? rowSub2ApiGroup : null,
      typeof rowSub2ApiAccountPriority !== 'undefined' ? rowSub2ApiAccountPriority : null,
      typeof rowSub2ApiDefaultProxy !== 'undefined' ? rowSub2ApiDefaultProxy : null,
    ].forEach((row) => {
      if (row) row.style.display = '';
    });
  }
  if (enabled && effectivePlusAccountAccessStrategy === cpaSessionStrategyValue) {
    [
      typeof rowVpsUrl !== 'undefined' ? rowVpsUrl : null,
      typeof rowVpsPassword !== 'undefined' ? rowVpsPassword : null,
      typeof rowLocalCpaStep9Mode !== 'undefined' ? rowLocalCpaStep9Mode : null,
    ].forEach((row) => {
      if (row) row.style.display = '';
    });
  }
  [
    typeof rowPayPalAccount !== 'undefined' ? rowPayPalAccount : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled && selectedMethod === paypalValue && !hostedCheckoutFinalStepEnabled ? '' : 'none';
  });
  [
    typeof rowPayPalProfileCountry !== 'undefined' ? rowPayPalProfileCountry : null,
    typeof rowPayPalProfileGenerator !== 'undefined' ? rowPayPalProfileGenerator : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled && (selectedMethod === paypalValue || selectedMethod === paypalHostedValue) ? '' : 'none';
  });
  [
    typeof rowHostedCheckoutSmsSource !== 'undefined' ? rowHostedCheckoutSmsSource : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = hostedRowsVisible ? '' : 'none';
  });
  const normalizeHostedCheckoutSmsSourceForUi = typeof normalizeHostedCheckoutSmsSourceValue === 'function'
    ? normalizeHostedCheckoutSmsSourceValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase().replace(/-/g, '_');
      return normalized === 'phone_sms' ? 'phone_sms' : 'fixed_pool';
    });
  const hostedCheckoutSmsSource = normalizeHostedCheckoutSmsSourceForUi(
    typeof selectHostedCheckoutSmsSource !== 'undefined' && selectHostedCheckoutSmsSource
      ? selectHostedCheckoutSmsSource.value
      : latestState?.hostedCheckoutSmsSource
  );
  const hostedCheckoutFixedSmsRowsVisible = hostedRowsVisible
    && hostedCheckoutSmsSource === (typeof HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL !== 'undefined'
      ? HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL
      : 'fixed_pool');
  [
    typeof rowHostedCheckoutVerificationUrl !== 'undefined' ? rowHostedCheckoutVerificationUrl : null,
    typeof rowHostedCheckoutManualFetch !== 'undefined' ? rowHostedCheckoutManualFetch : null,
    typeof rowHostedCheckoutPhone !== 'undefined' ? rowHostedCheckoutPhone : null,
    typeof rowHostedCheckoutSmsPool !== 'undefined' ? rowHostedCheckoutSmsPool : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = hostedCheckoutFixedSmsRowsVisible ? '' : 'none';
  });
  [
    typeof rowHostedCheckoutSecurityChallenge !== 'undefined' ? rowHostedCheckoutSecurityChallenge : null,
    typeof rowHostedCheckoutVerificationPopupDelay !== 'undefined' ? rowHostedCheckoutVerificationPopupDelay : null,
    typeof rowHostedCheckoutResendSettings !== 'undefined' ? rowHostedCheckoutResendSettings : null,
    typeof rowPlusHostedCheckoutOauthDelay !== 'undefined' ? rowPlusHostedCheckoutOauthDelay : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = hostedRowsVisible ? '' : 'none';
  });
  if (typeof rowHostedCheckoutSmsPool !== 'undefined' && rowHostedCheckoutSmsPool) {
    if (hostedCheckoutFixedSmsRowsVisible) {
      if (hostedSmsPoolExpanded && typeof queueHostedSmsPoolRefresh === 'function') {
        queueHostedSmsPoolRefresh();
      }
    } else if (typeof resetHostedSmsPoolManager === 'function') {
      resetHostedSmsPoolManager();
    }
  }
  if (
    enabled
    && (selectedMethod === paypalValue || selectedMethod === paypalHostedValue)
    && typeof renderPayPalProfile === 'function'
  ) {
    renderPayPalProfile();
  }
  [
    typeof rowGpcHelperApi !== 'undefined' ? rowGpcHelperApi : null,
    typeof rowGpcHelperCardKey !== 'undefined' ? rowGpcHelperCardKey : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = gpcRowsVisible ? '' : 'none';
  });
  if (typeof rowGpcHelperPhoneMode !== 'undefined' && rowGpcHelperPhoneMode) {
    rowGpcHelperPhoneMode.style.display = canShowGpcModeSelector ? '' : 'none';
  }
  if (typeof selectGpcHelperPhoneMode !== 'undefined' && selectGpcHelperPhoneMode) {
    selectGpcHelperPhoneMode.value = gpcPhoneMode;
  }
  [
    typeof rowGpcHelperCountryCode !== 'undefined' ? rowGpcHelperCountryCode : null,
    typeof rowGpcHelperPhone !== 'undefined' ? rowGpcHelperPhone : null,
    typeof rowGpcHelperOtpChannel !== 'undefined' ? rowGpcHelperOtpChannel : null,
    typeof rowGpcHelperPin !== 'undefined' ? rowGpcHelperPin : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = gpcRowsVisible && !isGpcAutoMode ? '' : 'none';
  });
  if (typeof selectGpcHelperOtpChannel !== 'undefined' && selectGpcHelperOtpChannel) {
    selectGpcHelperOtpChannel.value = gpcOtpChannel;
  }
  if (typeof inputGpcHelperLocalSmsEnabled !== 'undefined' && inputGpcHelperLocalSmsEnabled) {
    inputGpcHelperLocalSmsEnabled.checked = effectiveLocalSmsEnabled;
  }
  if (typeof rowGpcHelperLocalSmsEnabled !== 'undefined' && rowGpcHelperLocalSmsEnabled) {
    rowGpcHelperLocalSmsEnabled.style.display = localSmsControlsVisible ? '' : 'none';
  }
  if (typeof rowGpcHelperLocalSmsUrl !== 'undefined' && rowGpcHelperLocalSmsUrl) {
    rowGpcHelperLocalSmsUrl.style.display = localSmsControlsVisible && effectiveLocalSmsEnabled ? '' : 'none';
  }
  if (typeof btnGpcCardKeyPurchase !== 'undefined' && btnGpcCardKeyPurchase) {
    btnGpcCardKeyPurchase.style.display = gpcRowsVisible ? '' : 'none';
  }
  [
    typeof rowGoPayCountryCode !== 'undefined' ? rowGoPayCountryCode : null,
    typeof rowGoPayPhone !== 'undefined' ? rowGoPayPhone : null,
    typeof rowGoPayOtp !== 'undefined' ? rowGoPayOtp : null,
    typeof rowGoPayPin !== 'undefined' ? rowGoPayPin : null,
  ].forEach((row) => {
    if (!row) {
      return;
    }
    row.style.display = enabled && selectedMethod === gopayValue ? '' : 'none';
  });
}

function setSettingsCardLocked(locked) {
  if (!settingsCard) {
    return;
  }
  settingsCard.classList.toggle('is-locked', locked);
  settingsCard.toggleAttribute('inert', false);
  Array.from(settingsCard.children).forEach((child) => {
    const keepInteractive = child?.id === 'row-custom-email-pool';
    child.toggleAttribute('inert', Boolean(locked && !keepInteractive));
  });
}

function setFreePhoneReuseControlsLocked(locked) {
  if (inputFreePhoneReuseEnabled) {
    inputFreePhoneReuseEnabled.disabled = locked;
  }
  if (inputFreePhoneReuseAutoEnabled) {
    inputFreePhoneReuseAutoEnabled.disabled = locked
      || !Boolean(inputFreePhoneReuseEnabled?.checked)
      || !Boolean(inputPhoneVerificationEnabled?.checked && phoneVerificationSectionExpanded);
  }
}

async function setRuntimeEmailState(email) {
  const normalizedEmail = String(email || '').trim() || null;
  const response = await chrome.runtime.sendMessage({
    type: 'SET_EMAIL_STATE',
    source: 'sidepanel',
    payload: { email: normalizedEmail },
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  return normalizedEmail;
}

function getRuntimeSignupPhoneValue(state = latestState) {
  const identifierType = String(state?.accountIdentifierType || '').trim().toLowerCase();
  return String(
    state?.signupPhoneNumber
    || (identifierType === 'phone' ? state?.accountIdentifier : '')
    || ''
  ).trim();
}

function shouldExecuteStep3WithSignupPhoneIdentity(state = latestState) {
  const identifierType = String(state?.accountIdentifierType || '').trim().toLowerCase();
  const resolvedMethod = normalizeSignupMethod(
    state?.resolvedSignupMethod
    || state?.signupMethod
    || (typeof getSelectedSignupMethod === 'function' ? getSelectedSignupMethod() : DEFAULT_SIGNUP_METHOD)
  );
  return identifierType === 'phone'
    || Boolean(getRuntimeSignupPhoneValue(state))
    || resolvedMethod === SIGNUP_METHOD_PHONE;
}

function getSignupPhoneInputValue() {
  return typeof inputSignupPhone !== 'undefined' && inputSignupPhone
    ? String(inputSignupPhone.value || '').trim()
    : '';
}

function shouldPreserveSignupPhoneInputValue(stateSignupPhone = '') {
  if (typeof inputSignupPhone === 'undefined' || !inputSignupPhone || !signupPhoneInputDirty) {
    return false;
  }
  if (getSignupPhoneInputValue() === String(stateSignupPhone || '').trim()) {
    signupPhoneInputDirty = false;
    return false;
  }
  return signupPhoneInputFocused || (typeof document !== 'undefined' && document.activeElement === inputSignupPhone);
}

function syncSignupPhoneInputFromState(state = latestState) {
  const signupPhone = getRuntimeSignupPhoneValue(state);
  if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
    if (!shouldPreserveSignupPhoneInputValue(signupPhone)) {
      inputSignupPhone.value = signupPhone;
    }
  }
  if (typeof rowSignupPhone !== 'undefined' && rowSignupPhone) {
    const phoneVerificationEnabled = typeof inputPhoneVerificationEnabled !== 'undefined' && inputPhoneVerificationEnabled
      ? Boolean(inputPhoneVerificationEnabled.checked)
      : Boolean(state?.phoneVerificationEnabled || latestState?.phoneVerificationEnabled);
    const rawSignupMethod = state?.signupMethod || (
      typeof getSelectedSignupMethod === 'function'
        ? getSelectedSignupMethod()
        : 'email'
    );
    const selectedMethod = typeof normalizeSignupMethod === 'function'
      ? normalizeSignupMethod(rawSignupMethod)
      : (String(rawSignupMethod || '').trim().toLowerCase() === 'phone' ? 'phone' : 'email');
    const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
      ? resolveCurrentSidepanelCapabilities({
        panelMode: state?.panelMode || latestState?.panelMode,
        signupMethod: selectedMethod,
        state: {
          ...(latestState || {}),
          ...(state || {}),
          phoneVerificationEnabled,
        },
      })
      : (() => {
        const rootScope = typeof window !== 'undefined' ? window : globalThis;
        const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
          defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
        }) || null;
        return registry?.resolveSidepanelCapabilities
          ? registry.resolveSidepanelCapabilities({
            activeFlowId: state?.activeFlowId || latestState?.activeFlowId,
            panelMode: state?.panelMode || latestState?.panelMode,
            signupMethod: selectedMethod,
            state: {
              ...(latestState || {}),
              ...(state || {}),
              phoneVerificationEnabled,
            },
          })
          : null;
      })();
    const canShowPhoneSettings = capabilityState
      ? Boolean(capabilityState.canShowPhoneSettings)
      : true;
    rowSignupPhone.style.display = canShowPhoneSettings
      && phoneVerificationEnabled
      && (selectedMethod === 'phone' || Boolean(signupPhone) || Boolean(getSignupPhoneInputValue()) || signupPhoneInputDirty)
      ? ''
      : 'none';
  }
}

async function setRuntimeSignupPhoneState(phoneNumber) {
  const normalizedPhone = String(phoneNumber || '').trim() || null;
  const response = await chrome.runtime.sendMessage({
    type: 'SET_SIGNUP_PHONE_STATE',
    source: 'sidepanel',
    payload: { phoneNumber: normalizedPhone },
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  return normalizedPhone;
}

async function persistSignupPhoneInputValue(options = {}) {
  const { final = true, silent = true } = options;
  if (typeof inputSignupPhone === 'undefined' || !inputSignupPhone) {
    return getRuntimeSignupPhoneValue(latestState);
  }
  if (signupPhoneInputPersistPromise) {
    return signupPhoneInputPersistPromise;
  }

  const phoneNumber = getSignupPhoneInputValue();
  inputSignupPhone.value = phoneNumber;
  const currentPhone = getRuntimeSignupPhoneValue(latestState);
  if (!signupPhoneInputDirty && phoneNumber === currentPhone) {
    return phoneNumber;
  }

  signupPhoneInputPersistPromise = (async () => {
    const response = await chrome.runtime.sendMessage({
      type: final ? 'SAVE_SIGNUP_PHONE' : 'SET_SIGNUP_PHONE_STATE',
      source: 'sidepanel',
      payload: { phoneNumber },
    });
    if (response?.error) {
      throw new Error(response.error);
    }

    const normalizedPhone = String(response?.phoneNumber || phoneNumber || '').trim();
    signupPhoneInputDirty = getSignupPhoneInputValue() !== normalizedPhone;
    syncLatestState({
      signupPhoneNumber: normalizedPhone,
      phoneNumber: '',
      ...(normalizedPhone
        ? {
          accountIdentifierType: 'phone',
          accountIdentifier: normalizedPhone,
        }
        : (String(latestState?.accountIdentifierType || '').trim().toLowerCase() === 'phone'
          ? {
            accountIdentifierType: null,
            accountIdentifier: '',
          }
          : {})),
    });
    syncSignupPhoneInputFromState(latestState);
    if (!silent) {
      showToast(normalizedPhone ? '注册手机号已保存。' : '注册手机号已清空。', 'success', 1600);
    }
    return normalizedPhone;
  })();

  try {
    return await signupPhoneInputPersistPromise;
  } finally {
    signupPhoneInputPersistPromise = null;
  }
}

async function persistSignupPhoneInputForAction() {
  if (typeof inputSignupPhone === 'undefined' || !inputSignupPhone) {
    return;
  }
  const phoneNumber = getSignupPhoneInputValue();
  const currentPhone = getRuntimeSignupPhoneValue(latestState);
  if (!signupPhoneInputDirty && phoneNumber === currentPhone) {
    return;
  }
  await persistSignupPhoneInputValue({ final: true, silent: true });
}

function isGpcHelperCheckoutSelected() {
  const gpcValue = typeof PLUS_PAYMENT_METHOD_GPC_HELPER !== 'undefined' ? PLUS_PAYMENT_METHOD_GPC_HELPER : 'gpc-helper';
  const plusEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  return plusEnabled && getSelectedPlusPaymentMethod() === gpcValue;
}

function getSelectedGpcHelperPhoneMode() {
  return normalizeGpcHelperPhoneModeValue(
    typeof selectGpcHelperPhoneMode !== 'undefined' && selectGpcHelperPhoneMode
      ? selectGpcHelperPhoneMode.value
      : (latestState?.gopayHelperPhoneMode || GPC_HELPER_PHONE_MODE_MANUAL)
  );
}

async function showGpcStartBlockedDialog(message) {
  await openConfirmModal({
    title: 'GPC 任务无法开启',
    message,
    confirmLabel: '知道了',
  });
}

async function refreshGpcBalanceForStart() {
  const response = await chrome.runtime.sendMessage({
    type: 'REFRESH_GPC_CARD_BALANCE',
    source: 'sidepanel',
    payload: {
      gopayHelperApiUrl: inputGpcHelperApi?.value || DEFAULT_GPC_HELPER_API_URL,
      gopayHelperApiKey: inputGpcHelperCardKey?.value || latestState?.gopayHelperApiKey || '',
      reason: 'before_start',
    },
  });
  if (response?.error) {
    throw new Error(response.error);
  }
  const nextState = {
    gopayHelperBalance: response?.balance || latestState?.gopayHelperBalance || '',
    gopayHelperBalancePayload: response?.data || response?.payload?.data || response?.payload || latestState?.gopayHelperBalancePayload || null,
    gopayHelperBalanceUpdatedAt: response?.updatedAt || Date.now(),
    gopayHelperBalanceError: '',
    gopayHelperRemainingUses: getGpcBalanceRemainingUsesFromResponse(response) ?? 0,
    gopayHelperAutoModeEnabled: getGpcAutoModeEnabledFromResponse(response),
    gopayHelperApiKeyStatus: response?.apiKeyStatus || response?.data?.status || response?.payload?.data?.status || response?.payload?.status || '',
  };
  syncLatestState(nextState);
  if (displayGpcHelperBalance && nextState.gopayHelperBalance) {
    displayGpcHelperBalance.textContent = nextState.gopayHelperBalance;
  }
  updatePlusModeUI();
  return nextState;
}

async function ensureGpcApiKeyReadyForStart(options = {}) {
  if (!isGpcHelperCheckoutSelected()) {
    return true;
  }
  const selectedMode = getSelectedGpcHelperPhoneMode();
  let balanceState;
  try {
    balanceState = await refreshGpcBalanceForStart();
  } catch (error) {
    await showGpcStartBlockedDialog(`API Key 余额校验失败：${error?.message || '未知错误'}。请先确认 API Key 是否正确。`);
    return false;
  }

  const remainingUses = normalizeGpcRemainingUsesValue(balanceState.gopayHelperRemainingUses);
  const apiKeyStatus = String(balanceState.gopayHelperApiKeyStatus || '').trim().toLowerCase();
  if (apiKeyStatus && apiKeyStatus !== 'active') {
    await showGpcStartBlockedDialog(`当前 GPC API Key 状态为 ${balanceState.gopayHelperApiKeyStatus}，不能开启任务。`);
    return false;
  }
  if (remainingUses !== null && remainingUses <= 0) {
    await showGpcStartBlockedDialog('当前 GPC API Key 剩余次数不足，不能开启任务。');
    return false;
  }

  if (selectedMode === GPC_HELPER_PHONE_MODE_AUTO && isGpcAutoModePermissionDenied(balanceState)) {
    await showGpcStartBlockedDialog('当前 GPC API Key 未开通自动模式，已保留你的当前选择。如需继续，请由你手动切换到手动模式后再开启任务。');
    return false;
  }

  if (options?.notify) {
    showToast('GPC API Key 余额和权限校验通过。', 'success', 1800);
  }
  return true;
}

async function openPlusManualConfirmationDialog(options = {}) {
  const method = String(options.method || '').trim().toLowerCase();
  const gopayValue = typeof PLUS_PAYMENT_METHOD_GOPAY !== 'undefined' ? PLUS_PAYMENT_METHOD_GOPAY : 'gopay';
  const activeFlowId = String(latestState?.activeFlowId || latestState?.flowId || 'openai').trim().toLowerCase();
  const panelMode = String(latestState?.panelMode || latestState?.openaiIntegrationTargetId || '').trim().toLowerCase();
  const signupMethod = String(latestState?.resolvedSignupMethod || latestState?.signupMethod || 'email').trim().toLowerCase();
  const plusModeEnabled = latestState?.plusModeEnabled === undefined ? true : Boolean(latestState.plusModeEnabled);
  const plusAccountAccessStrategy = String(latestState?.plusAccountAccessStrategy || 'oauth').trim().toLowerCase();
  const useSub2ApiSessionImport = plusModeEnabled
    && activeFlowId === 'openai'
    && panelMode === 'sub2api'
    && signupMethod === 'email'
    && plusAccountAccessStrategy === 'sub2api_codex_session';
  const continuationActionLabel = useSub2ApiSessionImport
    ? '导入当前 ChatGPT 会话到 SUB2API'
    : 'OAuth 登录';
  if (method === 'gopay-otp') {
    if (!sharedFormDialog?.open) {
      return null;
    }
    const result = await sharedFormDialog.open({
      title: String(options.title || '').trim() || 'GPC OTP 验证',
      message: String(options.message || '').trim() || '请在WhatsApp里面获取验证码（耐心等待三十秒左右）',
      fields: [
        {
          key: 'otp',
          label: 'OTP',
          type: 'text',
          placeholder: '请输入 OTP 验证码',
          inputMode: 'numeric',
          autocomplete: 'one-time-code',
          required: true,
          requiredMessage: '请输入 OTP 验证码。',
          normalize: (value) => String(value || '').trim().replace(/[^\d]/g, ''),
          validate: (value) => {
            const normalized = String(value || '').trim().replace(/[^\d]/g, '');
            if (!normalized) return '请输入 OTP 验证码。';
            if (!/^\d{6}$/.test(normalized)) return 'OTP 必须是 6 位数字，请检查。';
            return '';
          },
        },
      ],
      confirmLabel: '提交 OTP',
    });
    return result ? { action: 'confirm', otp: String(result.otp || '').trim().replace(/[^\d]/g, '') } : { action: 'cancel' };
  }
  const title = String(options.title || '').trim() || (method === gopayValue ? 'GoPay 订阅确认' : '手动确认');
  const message = String(options.message || '').trim()
    || (method === gopayValue
      ? '请在当前订阅页中手动完成 GoPay 订阅，完成后点击“我已完成订阅”继续。'
      : '请先在页面中完成当前手动操作，完成后点击确认继续。');
  return openActionModal({
    title,
    message,
    actions: [
      { id: 'cancel', label: '取消等待', variant: 'btn-ghost' },
      { id: 'confirm', label: '我已完成订阅', variant: 'btn-primary' },
    ],
    alert: method === gopayValue
      ? { text: `确认后流程会直接继续到 Plus 模式后续的${continuationActionLabel}。`, tone: 'info' }
      : null,
  });
}

async function syncPlusManualConfirmationDialog() {
  const gopayValue = typeof PLUS_PAYMENT_METHOD_GOPAY !== 'undefined' ? PLUS_PAYMENT_METHOD_GOPAY : 'gopay';
  const requestId = String(latestState?.plusManualConfirmationRequestId || '').trim();
  const pending = Boolean(latestState?.plusManualConfirmationPending);
  if (!pending || !requestId || plusManualConfirmationDialogInFlight || activePlusManualConfirmationRequestId === requestId) {
    return;
  }

  const step = Number(latestState?.plusManualConfirmationStep) || 0;
  const method = String(latestState?.plusManualConfirmationMethod || '').trim().toLowerCase();
  const activeFlowId = String(latestState?.activeFlowId || latestState?.flowId || 'openai').trim().toLowerCase();
  const panelMode = String(latestState?.panelMode || latestState?.openaiIntegrationTargetId || '').trim().toLowerCase();
  const signupMethod = String(latestState?.resolvedSignupMethod || latestState?.signupMethod || 'email').trim().toLowerCase();
  const plusModeEnabled = latestState?.plusModeEnabled === undefined ? true : Boolean(latestState.plusModeEnabled);
  const plusAccountAccessStrategy = String(latestState?.plusAccountAccessStrategy || 'oauth').trim().toLowerCase();
  const useSub2ApiSessionImport = plusModeEnabled
    && activeFlowId === 'openai'
    && panelMode === 'sub2api'
    && signupMethod === 'email'
    && plusAccountAccessStrategy === 'sub2api_codex_session';
  const continuationActionLabel = useSub2ApiSessionImport
    ? '导入当前 ChatGPT 会话到 SUB2API'
    : 'OAuth 登录';
  const title = latestState?.plusManualConfirmationTitle;
  const message = latestState?.plusManualConfirmationMessage;
  activePlusManualConfirmationRequestId = requestId;
  plusManualConfirmationDialogInFlight = true;
  let shouldReopenDialog = false;

  try {
    const choice = await openPlusManualConfirmationDialog({
      method,
      title,
      message,
    });
    const currentRequestId = String(latestState?.plusManualConfirmationRequestId || '').trim();
    const stillPending = Boolean(latestState?.plusManualConfirmationPending);
    if (!stillPending || currentRequestId !== requestId) {
      return;
    }
    if (choice == null) {
      shouldReopenDialog = true;
      showToast('当前订阅确认仍在等待中，将重新弹出确认窗口。', 'info', 1800);
      return;
    }

    const confirmed = choice === 'confirm' || choice?.action === 'confirm';
    const response = await chrome.runtime.sendMessage({
      type: 'RESOLVE_PLUS_MANUAL_CONFIRMATION',
      source: 'sidepanel',
      payload: {
        step,
        requestId,
        confirmed,
        ...(choice?.otp ? { otp: choice.otp } : {}),
      },
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    if (confirmed) {
      showToast(
        method === 'gopay-otp'
          ? 'GPC OTP 已提交，正在继续验证...'
          : (method === gopayValue ? `GoPay 订阅已确认，正在继续${continuationActionLabel}...` : '已确认，流程继续执行中...'),
        'info',
        2200
      );
    } else {
      showToast(
        method === 'gopay-otp'
          ? '已取消 GPC OTP 输入。'
          : (method === gopayValue ? '已取消 GoPay 订阅等待。' : '已取消当前手动确认。'),
        'warn',
        2200
      );
    }
  } catch (error) {
    showToast(error?.message || String(error || '未知错误'), 'error');
  } finally {
    if (activePlusManualConfirmationRequestId === requestId) {
      activePlusManualConfirmationRequestId = '';
    }
    plusManualConfirmationDialogInFlight = false;
    if (
      shouldReopenDialog
      && latestState?.plusManualConfirmationPending
      && String(latestState?.plusManualConfirmationRequestId || '').trim() === requestId
    ) {
      setTimeout(() => {
        void syncPlusManualConfirmationDialog();
      }, 0);
    }
  }
}
async function openPlusManualConfirmationDialog(options = {}) {
  const method = String(options.method || '').trim().toLowerCase();
  const gopayValue = typeof PLUS_PAYMENT_METHOD_GOPAY !== 'undefined' ? PLUS_PAYMENT_METHOD_GOPAY : 'gopay';
  const continuationActionLabel = resolvePlusManualContinuationActionLabelFromState(latestState);
  if (method === 'gopay-otp') {
    if (!sharedFormDialog?.open) {
      return null;
    }
    const result = await sharedFormDialog.open({
      title: String(options.title || '').trim() || 'GPC OTP 验证',
      message: String(options.message || '').trim() || '请在WhatsApp里面获取验证码（耐心等待三十秒左右）',
      fields: [
        {
          key: 'otp',
          label: 'OTP',
          type: 'text',
          placeholder: '请输入 OTP 验证码',
          inputMode: 'numeric',
          autocomplete: 'one-time-code',
          required: true,
          requiredMessage: '请输入 OTP 验证码。',
          normalize: (value) => String(value || '').trim().replace(/[^\d]/g, ''),
          validate: (value) => {
            const normalized = String(value || '').trim().replace(/[^\d]/g, '');
            if (!normalized) return '请输入 OTP 验证码。';
            if (!/^\d{6}$/.test(normalized)) return 'OTP 必须是 6 位数字，请检查。';
            return '';
          },
        },
      ],
      confirmLabel: '提交 OTP',
    });
    return result
      ? { action: 'confirm', otp: String(result.otp || '').trim().replace(/[^\d]/g, '') }
      : { action: 'cancel' };
  }

  const title = String(options.title || '').trim() || (method === gopayValue ? 'GoPay subscription confirmation' : 'Manual confirmation');
  const message = String(options.message || '').trim()
    || (method === gopayValue
      ? 'Complete the GoPay subscription on the current page, then continue.'
      : 'Finish the current manual action on the page, then continue.');
  return openActionModal({
    title,
    message,
    actions: [
      { id: 'cancel', label: 'Cancel', variant: 'btn-ghost' },
      { id: 'confirm', label: 'Continue', variant: 'btn-primary' },
    ],
    alert: method === gopayValue
      ? { text: `After confirmation, the Plus flow will continue with ${continuationActionLabel}.`, tone: 'info' }
      : null,
  });
}

async function clearRegistrationEmail(options = {}) {
  const { silent = false } = options;
  if (!inputEmail.value.trim() && !latestState?.email) {
    return;
  }

  inputEmail.value = '';
  syncLatestState({ email: null });

  try {
    await setRuntimeEmailState(null);
  } catch (err) {
    if (!silent) {
      showToast(`清空邮箱失败：${err.message}`, 'error');
    }
    throw err;
  }
}

async function clearRegistrationSignupPhone(options = {}) {
  const { silent = false } = options;
  if (!getRuntimeSignupPhoneValue(latestState)) {
    if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
      inputSignupPhone.value = '';
    }
    signupPhoneInputDirty = false;
    syncSignupPhoneInputFromState(latestState);
    return;
  }

  if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
    inputSignupPhone.value = '';
  }
  signupPhoneInputDirty = false;
  syncLatestState({
    signupPhoneNumber: '',
    ...(String(latestState?.accountIdentifierType || '').trim().toLowerCase() === 'phone'
      ? {
        accountIdentifierType: null,
        accountIdentifier: '',
      }
      : {}),
  });
  syncSignupPhoneInputFromState(latestState);

  try {
    await setRuntimeSignupPhoneState(null);
  } catch (err) {
    if (!silent) {
      showToast(`清空注册手机号失败：${err.message}`, 'error');
    }
    throw err;
  }
}

function markSettingsDirty(isDirty = true) {
  settingsDirty = isDirty;
  if (isDirty) {
    settingsSaveRevision += 1;
  }
  updateSaveButtonState();
}

function updateSaveButtonState() {
  btnSaveSettings.disabled = settingsSaveInFlight || !settingsDirty;
  updateConfigMenuControls();
  btnSaveSettings.textContent = settingsSaveInFlight ? '保存中' : '保存';
}

function isEditableElementInSettingsCard(element) {
  if (!element || !(element instanceof Element)) {
    return false;
  }
  const tagName = String(element.tagName || '').toLowerCase();
  const isEditableInput = (
    tagName === 'textarea'
    || (tagName === 'input' && !['checkbox', 'radio', 'button', 'submit', 'reset', 'range', 'file', 'color'].includes(String(element.type || '').toLowerCase()))
    || Boolean(element.isContentEditable)
  );
  if (!isEditableInput) {
    return false;
  }
  return !settingsCard || settingsCard.contains(element);
}

function scheduleSettingsAutoSave() {
  clearTimeout(settingsAutoSaveTimer);
  settingsAutoSaveTimer = setTimeout(() => {
    saveSettings({ silent: true, source: 'autosave' }).catch(() => { });
  }, 1200);
}

async function saveSettings(options = {}) {
  const { silent = false, force = false, source = '' } = options;
  clearTimeout(settingsAutoSaveTimer);

  if (!force && !settingsDirty && !settingsSaveInFlight && silent) {
    return;
  }

  const payload = collectSettingsPayload();
  const saveRevision = settingsSaveRevision;
  settingsSaveInFlight = true;
  updateSaveButtonState();

  const shouldSkipStateApplyForFocusedEditor = (() => {
    if (!silent || source !== 'autosave') {
      return false;
    }
    const activeEl = typeof document !== 'undefined' ? document.activeElement : null;
    return isEditableElementInSettingsCard(activeEl);
  })();

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SAVE_SETTING',
      source: 'sidepanel',
      payload,
    });

    if (response?.error) {
      throw new Error(response.error);
    }

    if (response?.state && saveRevision === settingsSaveRevision) {
      if (shouldSkipStateApplyForFocusedEditor) {
        syncLatestState(response.state);
        markSettingsDirty(false);
      } else {
        applySettingsState(response.state);
      }
    } else {
      syncLatestState(payload);
      if (saveRevision === settingsSaveRevision) {
        markSettingsDirty(false);
      }
      updatePanelModeUI();
      updateMailProviderUI();
      updateButtonStates();
    }
    if (!silent) {
      showToast('配置已保存', 'success', 1800);
    }
  } catch (err) {
    markSettingsDirty(true);
    if (!silent) {
      showToast(`保存失败：${err.message}`, 'error');
    }
    throw err;
  } finally {
    settingsSaveInFlight = false;
    updateSaveButtonState();
  }
}

async function persistCurrentSettingsForAction() {
  clearTimeout(settingsAutoSaveTimer);
  await waitForSettingsSaveIdle();
  await persistSignupPhoneInputForAction();
  await saveSettings({ silent: true, force: true });
}

function applyAutoRunStatus(payload = currentAutoRun) {
  syncAutoRunState(payload);
  const runLabel = getAutoRunLabel(currentAutoRun);
  const locked = isAutoRunLockedPhase();
  const paused = isAutoRunPausedPhase();
  const scheduled = isAutoRunScheduledPhase();
  const settingsCardLocked = scheduled || locked;

  setSettingsCardLocked(settingsCardLocked);
  setFreePhoneReuseControlsLocked(settingsCardLocked);

  inputRunCount.disabled = currentAutoRun.autoRunning || (
    typeof shouldLockRunCountToEmailPool === 'function'
      ? shouldLockRunCountToEmailPool()
      : getLockedRunCountFromEmailPool() > 0
  );
  btnAutoRun.disabled = currentAutoRun.autoRunning;
  btnFetchEmail.disabled = locked
    || isCustomMailProvider()
    || usesCustomEmailPoolGenerator();
  inputEmail.disabled = locked;
  if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
    inputSignupPhone.disabled = locked;
  }
  if (typeof inputSub2ApiAccountPriority !== 'undefined' && inputSub2ApiAccountPriority) {
    inputSub2ApiAccountPriority.disabled = locked;
  }
  inputAutoSkipFailures.disabled = scheduled;

  const lockedRunCount = typeof getLockedRunCountFromEmailPool === 'function'
    ? getLockedRunCountFromEmailPool()
    : 0;
  const isSyncPhase = typeof isAutoRunSourceSyncPhase === 'function'
    ? isAutoRunSourceSyncPhase
    : (phase) => ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(phase);
  const shouldSyncRunCount = typeof shouldSyncRunCountFromAutoRunSource === 'function'
    ? shouldSyncRunCountFromAutoRunSource(currentAutoRun)
    : (currentAutoRun.autoRunning || isSyncPhase(currentAutoRun.phase));
  if (lockedRunCount > 0) {
    inputRunCount.value = String(lockedRunCount);
  } else if (shouldSyncRunCount && currentAutoRun.totalRuns > 0) {
    inputRunCount.value = String(currentAutoRun.totalRuns);
  }

  switch (currentAutoRun.phase) {
    case 'scheduled':
      autoContinueBar.style.display = 'none';
      btnAutoRun.innerHTML = `已计划${runLabel}`;
      break;
    case 'waiting_step':
      autoContinueBar.style.display = 'none';
      btnAutoRun.innerHTML = `等待中${runLabel}`;
      break;
    case 'waiting_email':
      autoContinueBar.style.display = 'flex';
      btnAutoRun.innerHTML = `已暂停${runLabel}`;
      break;
    case 'running':
      autoContinueBar.style.display = 'none';
      btnAutoRun.innerHTML = `运行中${runLabel}`;
      break;
    case 'retrying':
      autoContinueBar.style.display = 'none';
      btnAutoRun.innerHTML = `重试中${runLabel}`;
      break;
    case 'waiting_interval':
      autoContinueBar.style.display = 'none';
      btnAutoRun.innerHTML = `等待中${runLabel}`;
      break;
    default:
      autoContinueBar.style.display = 'none';
      setDefaultAutoRunButton();
      inputEmail.disabled = false;
      if (!locked) {
        btnFetchEmail.disabled = isCustomMailProvider() || usesCustomEmailPoolGenerator();
      }
      break;
  }

  updateAutoDelayInputState();
  updateFallbackThreadIntervalInputState();
  syncScheduledCountdownTicker();
  updateStopButtonState(scheduled || paused || locked || Object.values(getStepStatuses()).some(status => status === 'running'));
  updateConfigMenuControls();
  renderContributionMode();
}

function initializeManualStepActions() {
  document.querySelectorAll('.step-row').forEach((row) => {
    if (row.querySelector('.step-actions')) {
      return;
    }
    const step = Number(row.dataset.step);
    const nodeId = String(row.dataset.nodeId || getNodeIdByStepForCurrentMode(step) || '').trim();
    const statusEl = row.querySelector('.step-status');
    if (!statusEl) return;

    const actions = document.createElement('div');
    actions.className = 'step-actions';

    const manualBtn = document.createElement('button');
    manualBtn.type = 'button';
    manualBtn.className = 'step-manual-btn';
    manualBtn.dataset.step = String(step);
    manualBtn.dataset.nodeId = nodeId;
    manualBtn.title = '跳过此节点';
    manualBtn.setAttribute('aria-label', `跳过节点 ${nodeId || step}`);
    manualBtn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/></svg>';
    manualBtn.addEventListener('click', async (event) => {
      event.stopPropagation();
      try {
        await handleSkipNode(nodeId || getNodeIdByStepForCurrentMode(step));
      } catch (err) {
        showToast(err.message, 'error');
      }
    });

    statusEl.parentNode.replaceChild(actions, statusEl);
    actions.appendChild(manualBtn);
    actions.appendChild(statusEl);
  });
}

function renderStepsList() {
  if (!stepsList) return;

  stepsList.innerHTML = workflowNodes.map((node) => {
    const step = getStepIdByNodeIdForCurrentMode(node.nodeId);
    const nodeId = String(node.nodeId || '').trim();
    return `
    <div class="step-row" data-step="${step}" data-node-id="${escapeHtml(nodeId)}" data-step-key="${escapeHtml(node.executeKey || nodeId)}">
      <div class="step-indicator" data-step="${step}" data-node-id="${escapeHtml(nodeId)}"><span class="step-num">${step || node.displayOrder || ''}</span></div>
      <button class="step-btn" data-step="${step}" data-node-id="${escapeHtml(nodeId)}" data-step-key="${escapeHtml(node.executeKey || nodeId)}">${escapeHtml(node.title)}</button>
      <span class="step-status" data-step="${step}" data-node-id="${escapeHtml(nodeId)}"></span>
    </div>
  `;
  }).join('');

  if (stepsProgress) {
    stepsProgress.textContent = `0 / ${NODE_IDS.length}`;
  }

  initializeManualStepActions();
  applyStepExecutionRangeState(latestState);
  renderStepStatuses();
  updateButtonStates();
}

function syncStepDefinitionsForMode(plusModeEnabled = false, plusPaymentMethodOrOptions = {}, maybeOptions = {}) {
  const defaultFlowId = typeof DEFAULT_ACTIVE_FLOW_ID !== 'undefined' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const defaultStrategy = typeof DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY !== 'undefined' ? DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY : 'oauth';
  const currentState = typeof latestState !== 'undefined' ? latestState : {};
  const hasPaymentMethodShortcut = typeof plusPaymentMethodOrOptions === 'string';
  const options = typeof plusPaymentMethodOrOptions === 'string'
    ? maybeOptions
    : (plusPaymentMethodOrOptions || {});
  const previousPhonePlusModeEnabled = typeof currentPhonePlusModeEnabled !== 'undefined'
    ? currentPhonePlusModeEnabled
    : false;
  const nextPhonePlusModeEnabled = Boolean(options.phonePlusModeEnabled ?? previousPhonePlusModeEnabled);
  const nextPlusModeEnabled = Boolean(plusModeEnabled) && !nextPhonePlusModeEnabled;
  const rawPaymentMethod = typeof plusPaymentMethodOrOptions === 'string'
    ? plusPaymentMethodOrOptions
    : (options.plusPaymentMethod || getSelectedPlusPaymentMethod(currentState));
  const nextPlusAccountAccessStrategy = normalizePlusAccountAccessStrategy(
    options.plusAccountAccessStrategy
      || currentPlusAccountAccessStrategy
      || defaultStrategy
  );
  const nextSignupMethod = normalizeSignupMethod(options.signupMethod || currentSignupMethod || DEFAULT_SIGNUP_METHOD);
  const nextPhoneSignupReloginAfterBindEmailEnabled = Boolean(
    options.phoneSignupReloginAfterBindEmailEnabled
      ?? (typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail
        ? inputPhoneSignupReloginAfterBindEmail.checked
        : currentPhoneSignupReloginAfterBindEmailEnabled)
  );
  const nextSub2ApiReloginEnabled = Boolean(
    options.sub2apiReloginEnabled
      ?? (typeof inputSub2ApiReloginEnabled !== 'undefined' && inputSub2ApiReloginEnabled
        ? inputSub2ApiReloginEnabled.checked
        : currentState?.sub2apiReloginEnabled)
  );
  const nextOpenAiIntegrationTargetId = String(
    options.openaiIntegrationTargetId
    || options.panelMode
    || currentState?.openaiIntegrationTargetId
    || currentState?.panelMode
    || (typeof selectPanelMode !== 'undefined' && selectPanelMode ? selectPanelMode.value : '')
    || ''
  ).trim().toLowerCase();
  const nextAccountContributionEnabled = Boolean(
    options.accountContributionEnabled
      ?? Boolean(currentState?.accountContributionEnabled)
  );
  const nextPaymentMethod = normalizePlusPaymentMethod(rawPaymentMethod);
  const nextActiveFlowId = String(
    options.activeFlowId
    || currentState?.activeFlowId
    || defaultFlowId
  ).trim().toLowerCase() || defaultFlowId;
  const hasExplicitHostedCheckoutIsFinalStep = hasPaymentMethodShortcut
    || Object.prototype.hasOwnProperty.call(options, 'plusHostedCheckoutIsFinalStep')
    || (currentState
      && Object.prototype.hasOwnProperty.call(currentState, 'plusHostedCheckoutIsFinalStep'));
  const nextHostedCheckoutIsFinalStep = options.plusHostedCheckoutIsFinalStep
    ?? currentState?.plusHostedCheckoutIsFinalStep
    ?? true;
  const rootScope = typeof window !== 'undefined' ? window : globalThis;
  const currentPaymentStep = stepDefinitions.find((step) => step.key === 'paypal-approve');
  const nextPaymentTitle = rootScope.MultiPageStepDefinitions?.getPlusPaymentStepTitle?.({
    activeFlowId: nextActiveFlowId,
    plusModeEnabled: nextPlusModeEnabled,
    phonePlusModeEnabled: nextPhonePlusModeEnabled,
    plusPaymentMethod: nextPaymentMethod,
    plusAccountAccessStrategy: nextPlusAccountAccessStrategy,
    ...(hasExplicitHostedCheckoutIsFinalStep ? { plusHostedCheckoutIsFinalStep: nextHostedCheckoutIsFinalStep } : {}),
    openaiIntegrationTargetId: nextOpenAiIntegrationTargetId,
    panelMode: nextOpenAiIntegrationTargetId,
    sub2apiReloginEnabled: nextSub2ApiReloginEnabled,
    signupMethod: nextSignupMethod,
    phoneSignupReloginAfterBindEmailEnabled: nextPhoneSignupReloginAfterBindEmailEnabled,
  });
  const nextSignature = buildStepDefinitionSignature({
    activeFlowId: nextActiveFlowId,
    plusModeEnabled: nextPlusModeEnabled,
    phonePlusModeEnabled: nextPhonePlusModeEnabled,
    plusPaymentMethod: nextPaymentMethod,
    plusAccountAccessStrategy: nextPlusAccountAccessStrategy,
    plusHostedCheckoutIsFinalStep: nextHostedCheckoutIsFinalStep,
    openaiIntegrationTargetId: nextOpenAiIntegrationTargetId,
    panelMode: nextOpenAiIntegrationTargetId,
    sub2apiReloginEnabled: nextSub2ApiReloginEnabled,
    signupMethod: nextSignupMethod,
    phoneSignupReloginAfterBindEmailEnabled: nextPhoneSignupReloginAfterBindEmailEnabled,
    accountContributionEnabled: nextAccountContributionEnabled,
  });
  const paymentTitleChanged = Boolean(
    (nextPlusModeEnabled || nextPhonePlusModeEnabled)
    && currentPaymentStep
    && nextPaymentTitle
    && currentPaymentStep.title !== nextPaymentTitle
  );
  const shouldRender = Boolean(options.render)
    || nextSignature !== currentStepDefinitionSignature
    || paymentTitleChanged;
  if (!shouldRender) {
    return;
  }

  rebuildStepDefinitionState(nextPlusModeEnabled, {
    activeFlowId: nextActiveFlowId,
    phonePlusModeEnabled: nextPhonePlusModeEnabled,
    plusPaymentMethod: nextPaymentMethod,
    plusAccountAccessStrategy: nextPlusAccountAccessStrategy,
    ...(hasExplicitHostedCheckoutIsFinalStep ? { plusHostedCheckoutIsFinalStep: nextHostedCheckoutIsFinalStep } : {}),
    openaiIntegrationTargetId: nextOpenAiIntegrationTargetId,
    panelMode: nextOpenAiIntegrationTargetId,
    sub2apiReloginEnabled: nextSub2ApiReloginEnabled,
    signupMethod: nextSignupMethod,
    phoneSignupReloginAfterBindEmailEnabled: nextPhoneSignupReloginAfterBindEmailEnabled,
    accountContributionEnabled: nextAccountContributionEnabled,
  });
  currentStepDefinitionSignature = nextSignature;
  renderStepsList();
}

function syncStepDefinitionsFromUiState(stateOverrides = {}) {
  const nextState = {
    ...(latestState || {}),
    ...(stateOverrides || {}),
  };
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState(nextState, {
      activeFlowId: nextState?.activeFlowId,
      panelMode: nextState?.panelMode,
      signupMethod: nextState?.signupMethod,
      state: nextState,
    })
    : {
      plusModeEnabled: Boolean(nextState?.plusModeEnabled) && !Boolean(nextState?.phonePlusModeEnabled),
      phonePlusModeEnabled: Boolean(nextState?.phonePlusModeEnabled),
      signupMethod: normalizeSignupMethod(nextState?.signupMethod || DEFAULT_SIGNUP_METHOD),
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, {
    activeFlowId: nextState?.activeFlowId || nextState?.flowId || DEFAULT_ACTIVE_FLOW_ID,
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    plusPaymentMethod: getSelectedPlusPaymentMethod(nextState),
    plusAccountAccessStrategy: stepDefinitionState.plusAccountAccessStrategy,
    openaiIntegrationTargetId: nextState?.openaiIntegrationTargetId || nextState?.panelMode,
    panelMode: nextState?.panelMode || nextState?.openaiIntegrationTargetId,
    sub2apiReloginEnabled: Boolean(nextState?.sub2apiReloginEnabled),
    signupMethod: stepDefinitionState.signupMethod,
    phoneSignupReloginAfterBindEmailEnabled: Boolean(nextState?.phoneSignupReloginAfterBindEmailEnabled),
    accountContributionEnabled: Boolean(nextState?.accountContributionEnabled),
  });
  return stepDefinitionState;
}

// ============================================================
// State Restore on load
// ============================================================

function applySettingsState(state) {
  if (typeof syncStepDefinitionsForMode === 'function') {
    const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
      ? resolveStepDefinitionCapabilityState(state, {
        signupMethod: state?.signupMethod,
      })
      : {
        plusModeEnabled: Boolean(state?.plusModeEnabled) && !Boolean(state?.phonePlusModeEnabled),
        phonePlusModeEnabled: Boolean(state?.phonePlusModeEnabled),
        signupMethod: normalizeSignupMethod(state?.signupMethod || DEFAULT_SIGNUP_METHOD),
      };
    syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, {
      activeFlowId: state?.activeFlowId || state?.flowId,
      phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
      plusPaymentMethod: state?.plusPaymentMethod,
      plusAccountAccessStrategy: stepDefinitionState.plusAccountAccessStrategy,
      openaiIntegrationTargetId: state?.openaiIntegrationTargetId || state?.panelMode,
      panelMode: state?.panelMode || state?.openaiIntegrationTargetId,
      sub2apiReloginEnabled: Boolean(state?.sub2apiReloginEnabled),
      signupMethod: stepDefinitionState.signupMethod,
      phoneSignupReloginAfterBindEmailEnabled: Boolean(state?.phoneSignupReloginAfterBindEmailEnabled),
      accountContributionEnabled: Boolean(state?.accountContributionEnabled),
    });
  }
  const fallbackIpProxyService = '711proxy';
  const fallbackIpProxyMode = 'account';
  const fallbackIpProxyProtocol = 'http';
  const resolveIpProxyService = (value) => (typeof normalizeIpProxyService === 'function'
    ? normalizeIpProxyService(value)
    : String(value || fallbackIpProxyService).trim().toLowerCase() || fallbackIpProxyService);
  const resolveIpProxyMode = (value) => {
    if (typeof normalizeIpProxyModeForCurrentRelease === 'function') {
      return normalizeIpProxyModeForCurrentRelease(value);
    }
    if (typeof normalizeIpProxyMode === 'function') {
      return normalizeIpProxyMode(value);
    }
    const normalized = String(value || fallbackIpProxyMode).trim().toLowerCase();
    return normalized || fallbackIpProxyMode;
  };
  const resolveIpProxyProtocol = (value) => (typeof normalizeIpProxyProtocol === 'function'
    ? normalizeIpProxyProtocol(value)
    : String(value || fallbackIpProxyProtocol).trim().toLowerCase() || fallbackIpProxyProtocol);
  const resolveIpProxyPort = (value) => {
    if (typeof normalizeIpProxyPort === 'function') {
      return normalizeIpProxyPort(value);
    }
    const numeric = Number.parseInt(String(value || '').trim(), 10);
    return Number.isInteger(numeric) && numeric > 0 && numeric <= 65535 ? numeric : 0;
  };
  const resolveIpProxyAccountList = (value) => (typeof normalizeIpProxyAccountList === 'function'
    ? normalizeIpProxyAccountList(value || '')
    : String(value || '').replace(/\r/g, '').trim());
  const resolveIpProxySessionPrefix = (value) => (typeof normalizeIpProxyAccountSessionPrefix === 'function'
    ? normalizeIpProxyAccountSessionPrefix(value || '')
    : String(value || '').trim());
  const resolveIpProxyAccountLifeMinutes = (value) => (typeof normalizeIpProxyAccountLifeMinutes === 'function'
    ? normalizeIpProxyAccountLifeMinutes(value || '')
    : String(value || '').trim());
  const resolveIpProxyPoolTargetCount = (value) => (typeof normalizeIpProxyPoolTargetCount === 'function'
    ? normalizeIpProxyPoolTargetCount(value || '', 20)
    : String(value || '20').trim() || '20');
  const resolveIpProxySwitchIpRoundCount = (value) => (typeof normalizeIpProxySwitchIpRoundCount === 'function'
    ? normalizeIpProxySwitchIpRoundCount(value || '', 1)
    : typeof normalizeIpProxyPoolTargetCount === 'function'
      ? normalizeIpProxyPoolTargetCount(value || '', 1)
    : String(value || '1').trim() || '1');
  const resolveIpProxyAutoSyncEnabled = (value) => Boolean(value);
  const resolveIpProxyAutoSyncIntervalMinutes = (value) => {
    const numeric = Number.parseInt(String(value ?? '').trim(), 10);
    if (!Number.isFinite(numeric)) {
      return 15;
    }
    return Math.max(1, Math.min(1440, numeric));
  };
  syncLatestState(state);
  const defaultActiveFlowId = typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai';
  const appliedFlowSelection = typeof syncFlowSelectorsFromState === 'function'
    ? syncFlowSelectorsFromState(state)
    : {
      activeFlowId: String(state?.activeFlowId || state?.flowId || defaultActiveFlowId).trim().toLowerCase() || defaultActiveFlowId,
      targetId: String(state?.panelMode || 'cpa').trim().toLowerCase() || 'cpa',
    };
  if (typeof applyOperationDelayState === 'function') {
    applyOperationDelayState(state);
  }
  syncAutoRunState(state);
  if (typeof applyStepExecutionRangeState === 'function') {
    applyStepExecutionRangeState(latestState);
  }
  renderStepStatuses(latestState);

  inputEmail.value = state?.email || '';
  if (typeof syncSignupPhoneInputFromState === 'function') {
    syncSignupPhoneInputFromState(state);
  }
  syncPasswordField(state || {});
  if (typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled) {
    inputPlusModeEnabled.checked = Boolean(state?.plusModeEnabled);
  }
  if (typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled) {
    inputPhonePlusModeEnabled.checked = Boolean(state?.phonePlusModeEnabled);
  }
  if (typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod) {
    selectPlusPaymentMethod.value = normalizePlusPaymentMethod(state?.plusPaymentMethod);
  }
  if (typeof inputBrowserFingerprintEnabled !== 'undefined' && inputBrowserFingerprintEnabled) {
    inputBrowserFingerprintEnabled.checked = state?.browserFingerprintEnabled !== false;
  }
  if (typeof selectBrowserFingerprintLevel !== 'undefined' && selectBrowserFingerprintLevel) {
    selectBrowserFingerprintLevel.value = normalizeBrowserFingerprintLevel(state?.browserFingerprintLevel);
  }
  if (typeof selectBrowserFingerprintLanguage !== 'undefined' && selectBrowserFingerprintLanguage) {
    selectBrowserFingerprintLanguage.value = normalizeBrowserFingerprintLanguage(state?.browserFingerprintLanguage);
  }
  if (typeof updateBrowserFingerprintUI === 'function') {
    updateBrowserFingerprintUI(state);
  }
  if (latestState) {
    latestState.plusHostedCheckoutIsFinalStep = state?.plusHostedCheckoutIsFinalStep !== false;
  }
  currentPlusAccountAccessStrategy = normalizePlusAccountAccessStrategy(
    state?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY
  );
  if (typeof selectPlusAccountAccessStrategy !== 'undefined' && selectPlusAccountAccessStrategy) {
    selectPlusAccountAccessStrategy.dataset.requestedValue = currentPlusAccountAccessStrategy;
    selectPlusAccountAccessStrategy.value = normalizePlusAccountAccessStrategyUiValue(currentPlusAccountAccessStrategy);
  }
  if (typeof selectPlusCheckoutVerificationFailureStrategy !== 'undefined' && selectPlusCheckoutVerificationFailureStrategy) {
    selectPlusCheckoutVerificationFailureStrategy.value = normalizePlusCheckoutVerificationFailureStrategy(
      state?.plusCheckoutVerificationFailureStrategy
    );
  }
  if (typeof syncPlusCheckAllowedRegionsControl === 'function') {
    syncPlusCheckAllowedRegionsControl(state?.plusCheckAllowedRegions || []);
  }
  if (typeof inputGpcHelperApi !== 'undefined' && inputGpcHelperApi) {
    const defaultGpcHelperApiUrl = typeof DEFAULT_GPC_HELPER_API_URL !== 'undefined'
      ? DEFAULT_GPC_HELPER_API_URL
      : 'https://gpc.qlhazycoder.top';
    inputGpcHelperApi.value = `${defaultGpcHelperApiUrl.replace(/\/+$/g, '')}/`;
  }
  if (typeof inputGpcHelperCardKey !== 'undefined' && inputGpcHelperCardKey) {
    inputGpcHelperCardKey.value = state?.gopayHelperApiKey || state?.gopayHelperCardKey || '';
  }
  if (typeof selectGpcHelperPhoneMode !== 'undefined' && selectGpcHelperPhoneMode) {
    selectGpcHelperPhoneMode.value = normalizeGpcHelperPhoneModeValue(state?.gopayHelperPhoneMode || 'manual');
  }
  if (typeof selectGpcHelperCountryCode !== 'undefined' && selectGpcHelperCountryCode) {
    const normalizedCountryCode = window.GoPayUtils?.normalizeGoPayCountryCode
      ? window.GoPayUtils.normalizeGoPayCountryCode(state?.gopayHelperCountryCode)
      : String(state?.gopayHelperCountryCode || '+86').trim();
    const hasOption = Array.from(selectGpcHelperCountryCode.options || [])
      .some((option) => option.value === normalizedCountryCode);
    if (!hasOption && normalizedCountryCode) {
      const option = document.createElement('option');
      option.value = normalizedCountryCode;
      option.textContent = `自定义 ${normalizedCountryCode}`;
      selectGpcHelperCountryCode.appendChild(option);
    }
    selectGpcHelperCountryCode.value = normalizedCountryCode || '+86';
  }
  if (typeof inputGpcHelperPhone !== 'undefined' && inputGpcHelperPhone) {
    inputGpcHelperPhone.value = state?.gopayHelperPhoneNumber || '';
  }
  if (typeof selectGpcHelperOtpChannel !== 'undefined' && selectGpcHelperOtpChannel) {
    selectGpcHelperOtpChannel.value = normalizeGpcOtpChannelValue(state?.gopayHelperOtpChannel || 'whatsapp');
  }
  if (typeof inputGpcHelperLocalSmsEnabled !== 'undefined' && inputGpcHelperLocalSmsEnabled) {
    inputGpcHelperLocalSmsEnabled.checked = Boolean(state?.gopayHelperLocalSmsHelperEnabled);
  }
  if (typeof inputGpcHelperLocalSmsUrl !== 'undefined' && inputGpcHelperLocalSmsUrl) {
    inputGpcHelperLocalSmsUrl.value = normalizeGpcLocalSmsHelperBaseUrlValue(state?.gopayHelperLocalSmsHelperUrl || '');
  }
  if (typeof inputGpcHelperPin !== 'undefined' && inputGpcHelperPin) {
    inputGpcHelperPin.value = state?.gopayHelperPin || '';
  }
  if (typeof displayGpcHelperBalance !== 'undefined' && displayGpcHelperBalance) {
    const balanceText = String(state?.gopayHelperBalance || '').trim();
    const balanceError = String(state?.gopayHelperBalanceError || '').trim();
    const balanceAt = Number(state?.gopayHelperBalanceUpdatedAt) || 0;
    displayGpcHelperBalance.textContent = balanceError
      ? `余额查询失败：${balanceError}`
      : (balanceText || (balanceAt ? '余额已更新' : '余额未获取'));
  }
  if (typeof selectGoPayCountryCode !== 'undefined' && selectGoPayCountryCode) {
    const normalizedGoPayCountryCode = window.GoPayUtils?.normalizeGoPayCountryCode
      ? window.GoPayUtils.normalizeGoPayCountryCode(state?.gopayCountryCode)
      : String(state?.gopayCountryCode || '+86').trim();
    const hasOption = Array.from(selectGoPayCountryCode.options || [])
      .some((option) => option.value === normalizedGoPayCountryCode);
    if (!hasOption && normalizedGoPayCountryCode) {
      const option = document.createElement('option');
      option.value = normalizedGoPayCountryCode;
      option.textContent = `自定义 ${normalizedGoPayCountryCode}`;
      selectGoPayCountryCode.appendChild(option);
    }
    selectGoPayCountryCode.value = normalizedGoPayCountryCode || '+86';
  }
  if (typeof inputGoPayPhone !== 'undefined' && inputGoPayPhone) {
    inputGoPayPhone.value = state?.gopayPhone || '';
  }
  if (typeof inputGoPayOtp !== 'undefined' && inputGoPayOtp) {
    inputGoPayOtp.value = state?.gopayOtp || '';
  }
  if (typeof inputGoPayPin !== 'undefined' && inputGoPayPin) {
    inputGoPayPin.value = state?.gopayPin || '';
  }
  if (typeof inputHostedCheckoutVerificationUrl !== 'undefined' && inputHostedCheckoutVerificationUrl) {
    inputHostedCheckoutVerificationUrl.value = normalizeHostedCheckoutVerificationUrlValue(state?.hostedCheckoutVerificationUrl || '');
  }
  if (typeof selectHostedCheckoutSmsSource !== 'undefined' && selectHostedCheckoutSmsSource) {
    selectHostedCheckoutSmsSource.value = normalizeHostedCheckoutSmsSourceValue(state?.hostedCheckoutSmsSource);
  }
  if (typeof selectPayPalProfileCountryCode !== 'undefined' && selectPayPalProfileCountryCode) {
    selectPayPalProfileCountryCode.value = normalizePayPalProfileCountryCodeValue(state?.paypalProfileCountryCode);
  }
  if (typeof inputHostedCheckoutSecurityChallengeEnabled !== 'undefined' && inputHostedCheckoutSecurityChallengeEnabled) {
    inputHostedCheckoutSecurityChallengeEnabled.checked = Boolean(state?.hostedCheckoutSecurityChallengeEnabled);
  }
  if (typeof inputHostedCheckoutVerificationPopupDelaySeconds !== 'undefined' && inputHostedCheckoutVerificationPopupDelaySeconds) {
    inputHostedCheckoutVerificationPopupDelaySeconds.value = String(
      normalizeHostedCheckoutVerificationPopupDelaySeconds(
        state?.hostedCheckoutFirstResendWaitSeconds ?? state?.hostedCheckoutVerificationPopupDelaySeconds
      )
    );
  }
  if (typeof inputHostedCheckoutSmsPoolAutoDisableEnabled !== 'undefined' && inputHostedCheckoutSmsPoolAutoDisableEnabled) {
    inputHostedCheckoutSmsPoolAutoDisableEnabled.checked = Boolean(state?.hostedCheckoutSmsPoolAutoDisableEnabled);
  }
  if (typeof inputHostedCheckoutSmsPoolMaxUses !== 'undefined' && inputHostedCheckoutSmsPoolMaxUses) {
    inputHostedCheckoutSmsPoolMaxUses.value = String(
      normalizeHostedCheckoutSmsPoolMaxUsesValue(state?.hostedCheckoutSmsPoolMaxUses, DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES)
    );
  }
  if (typeof inputHostedCheckoutFirstDirectResendEnabled !== 'undefined' && inputHostedCheckoutFirstDirectResendEnabled) {
    inputHostedCheckoutFirstDirectResendEnabled.checked = Boolean(state?.hostedCheckoutFirstDirectResendEnabled);
  }
  if (typeof inputHostedCheckoutFirstResendWaitSeconds !== 'undefined' && inputHostedCheckoutFirstResendWaitSeconds) {
    inputHostedCheckoutFirstResendWaitSeconds.value = String(
      normalizeHostedCheckoutResendWaitSecondsValue(
        state?.hostedCheckoutFirstResendWaitSeconds ?? state?.hostedCheckoutVerificationPopupDelaySeconds,
        20
      )
    );
  }
  if (typeof inputHostedCheckoutSubsequentResendWaitSeconds !== 'undefined' && inputHostedCheckoutSubsequentResendWaitSeconds) {
    inputHostedCheckoutSubsequentResendWaitSeconds.value = String(
      normalizeHostedCheckoutResendWaitSecondsValue(state?.hostedCheckoutSubsequentResendWaitSeconds, 25)
    );
  }
  if (typeof inputHostedCheckoutVerificationPollAttempts !== 'undefined' && inputHostedCheckoutVerificationPollAttempts) {
    inputHostedCheckoutVerificationPollAttempts.value = String(
      normalizeHostedCheckoutVerificationPollAttemptsValue(state?.hostedCheckoutVerificationPollAttempts, 6)
    );
  }
  if (typeof inputHostedCheckoutVerificationPollIntervalSeconds !== 'undefined' && inputHostedCheckoutVerificationPollIntervalSeconds) {
    inputHostedCheckoutVerificationPollIntervalSeconds.value = String(
      normalizeHostedCheckoutVerificationPollIntervalSecondsValue(state?.hostedCheckoutVerificationPollIntervalSeconds, 5)
    );
  }
  if (typeof inputHostedCheckoutVerificationResendMaxAttempts !== 'undefined' && inputHostedCheckoutVerificationResendMaxAttempts) {
    inputHostedCheckoutVerificationResendMaxAttempts.value = String(
      normalizeHostedCheckoutVerificationResendMaxAttemptsValue(state?.hostedCheckoutVerificationResendMaxAttempts, 1)
    );
  }
  if (typeof setHostedCheckoutManualCodeDisplay === 'function') {
    setHostedCheckoutManualCodeDisplay('未获取');
  }
  if (typeof inputHostedCheckoutPhone !== 'undefined' && inputHostedCheckoutPhone) {
    inputHostedCheckoutPhone.value = normalizeHostedCheckoutPhoneValue(state?.hostedCheckoutPhoneNumber || '');
  }
  if (typeof inputHostedCheckoutSmsPool !== 'undefined' && inputHostedCheckoutSmsPool) {
    inputHostedCheckoutSmsPool.value = normalizeHostedCheckoutSmsPoolTextValue(state?.hostedCheckoutSmsPoolText || '');
  }
  latestState = {
    ...(latestState && typeof latestState === 'object' ? latestState : {}),
    ...(state && typeof state === 'object' ? state : {}),
    hostedCheckoutCurrentSmsEntry: typeof normalizeHostedCheckoutCurrentSmsEntryValue === 'function'
      ? normalizeHostedCheckoutCurrentSmsEntryValue(
        state?.hostedCheckoutCurrentSmsEntry || null,
        typeof parseHostedCheckoutSmsPoolEntries === 'function'
          ? parseHostedCheckoutSmsPoolEntries(state?.hostedCheckoutSmsPoolText || '')
          : []
      )
      : (state?.hostedCheckoutCurrentSmsEntry || null),
  };
  if (typeof inputPlusHostedCheckoutOauthDelaySeconds !== 'undefined' && inputPlusHostedCheckoutOauthDelaySeconds) {
    inputPlusHostedCheckoutOauthDelaySeconds.value = String(
      normalizePlusHostedCheckoutOauthDelaySeconds(state?.plusHostedCheckoutOauthDelaySeconds)
    );
  }
  if (typeof inputPlusCheckoutCreatePreWaitSeconds !== 'undefined' && inputPlusCheckoutCreatePreWaitSeconds) {
    inputPlusCheckoutCreatePreWaitSeconds.value = String(
      normalizePlusCheckoutCreatePreWaitSeconds(state?.plusCheckoutCreatePreWaitSeconds)
    );
  }
  if (typeof inputPlusCheckoutOpenStableWaitSeconds !== 'undefined' && inputPlusCheckoutOpenStableWaitSeconds) {
    inputPlusCheckoutOpenStableWaitSeconds.value = String(
      normalizePlusCheckoutOpenStableWaitSeconds(state?.plusCheckoutOpenStableWaitSeconds)
    );
  }
  if (typeof inputPlusHostedCheckoutCardPreWaitSeconds !== 'undefined' && inputPlusHostedCheckoutCardPreWaitSeconds) {
    inputPlusHostedCheckoutCardPreWaitSeconds.value = String(
      normalizePlusHostedCheckoutCardPreWaitSeconds(state?.plusHostedCheckoutCardPreWaitSeconds)
    );
  }
  if (typeof inputPlusCheckoutCloudConversionEnabled !== 'undefined' && inputPlusCheckoutCloudConversionEnabled) {
    inputPlusCheckoutCloudConversionEnabled.checked = Boolean(state?.plusCheckoutCloudConversionEnabled);
  }
  if (typeof inputPlusCheckoutRegionalCheckoutEnabled !== 'undefined' && inputPlusCheckoutRegionalCheckoutEnabled) {
    inputPlusCheckoutRegionalCheckoutEnabled.checked = Boolean(state?.plusCheckoutRegionalCheckoutEnabled);
  }
  if (typeof syncPlusCheckAllowedRegionsControl === 'function') {
    syncPlusCheckAllowedRegionsControl(state?.plusCheckAllowedRegions || []);
  }
  if (typeof inputPlusCheckoutCloudConversionApiUrl !== 'undefined' && inputPlusCheckoutCloudConversionApiUrl) {
    inputPlusCheckoutCloudConversionApiUrl.value = normalizePlusCheckoutCloudConversionApiUrlValue(state?.plusCheckoutCloudConversionApiUrl || '');
  }
  if (typeof inputPlusCheckoutCloudConversionApiKey !== 'undefined' && inputPlusCheckoutCloudConversionApiKey) {
    inputPlusCheckoutCloudConversionApiKey.value = normalizePlusCheckoutCloudConversionApiKeyValue(state?.plusCheckoutCloudConversionApiKey || '');
  }
  if (typeof validateHostedCheckoutContactConfig === 'function') {
    validateHostedCheckoutContactConfig();
  }
  if (typeof inputPlusCheckoutConversionProxy !== 'undefined' && inputPlusCheckoutConversionProxy) {
    inputPlusCheckoutConversionProxy.value = normalizePlusCheckoutConversionProxyUrlValue(state?.plusCheckoutConversionProxyUrl || '');
  }
  if (typeof syncPlusCheckoutConversionProxySourceControl === 'function') {
    syncPlusCheckoutConversionProxySourceControl(state?.plusCheckoutConversionProxySource || 'manual');
  }
  if (typeof inputPlusCheckoutConversionProxy711Region !== 'undefined' && inputPlusCheckoutConversionProxy711Region) {
    const normalizeRegionValue = typeof normalizePlusCheckoutConversionProxy711RegionValue === 'function'
      ? normalizePlusCheckoutConversionProxy711RegionValue
      : ((value = '') => {
        const normalized = String(value || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
        return normalized.length === 2 ? normalized : '';
      });
    inputPlusCheckoutConversionProxy711Region.value = normalizeRegionValue(state?.plusCheckoutConversionProxy711Region || '');
  }
  if (typeof updatePlusCheckoutConversionModeUi === 'function') {
    updatePlusCheckoutConversionModeUi();
  }
  if (typeof renderPlusCheckoutConversionProxyRuntimeStatus === 'function') {
    renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
  }
  inputVpsUrl.value = state?.vpsUrl || '';
  inputVpsPassword.value = state?.vpsPassword || '';
  setLocalCpaStep9Mode(state?.localCpaStep9Mode);
  inputSub2ApiUrl.value = state?.sub2apiUrl || '';
  inputSub2ApiEmail.value = state?.sub2apiEmail || '';
  inputSub2ApiPassword.value = state?.sub2apiPassword || '';
  renderSub2ApiGroupOptions(state, state?.sub2apiGroupName || '');
  if (typeof inputSub2ApiAccountPriority !== 'undefined' && inputSub2ApiAccountPriority) {
    inputSub2ApiAccountPriority.value = String(normalizeSub2ApiAccountPriorityValue(state?.sub2apiAccountPriority));
  }
  inputSub2ApiDefaultProxy.value = state?.sub2apiDefaultProxyName || '';
  if (typeof inputSub2ApiReloginEnabled !== 'undefined' && inputSub2ApiReloginEnabled) {
    inputSub2ApiReloginEnabled.checked = Boolean(state?.sub2apiReloginEnabled);
  }
  const normalizeSub2ApiReloginAccountPoolTextSafe = typeof normalizeSub2ApiReloginAccountPoolText === 'function'
    ? normalizeSub2ApiReloginAccountPoolText
    : ((value = '') => String(value || '').trim());
  if (typeof inputSub2ApiReloginAccountPool !== 'undefined' && inputSub2ApiReloginAccountPool) {
    inputSub2ApiReloginAccountPool.value = normalizeSub2ApiReloginAccountPoolTextSafe(state?.sub2apiReloginAccountPoolText || '');
  }
  if (typeof inputSub2ApiReloginPoolImport !== 'undefined' && inputSub2ApiReloginPoolImport && !inputSub2ApiReloginPoolImport.value.trim()) {
    inputSub2ApiReloginPoolImport.value = normalizeSub2ApiReloginAccountPoolTextSafe(state?.sub2apiReloginAccountPoolText || '');
  }
  if (typeof renderSub2ApiReloginPool === 'function') {
    renderSub2ApiReloginPool();
  }
  if (typeof inputKiroRsUrl !== 'undefined' && inputKiroRsUrl) {
    inputKiroRsUrl.value = String(state?.kiroRsUrl || '').trim();
  }
  if (typeof inputKiroRsKey !== 'undefined' && inputKiroRsKey) {
    inputKiroRsKey.value = String(state?.kiroRsKey || '');
  }
  if (typeof displayKiroRsTestStatus !== 'undefined' && displayKiroRsTestStatus) {
    displayKiroRsTestStatus.textContent = kiroRsConnectionTestStatusText;
  }
  if (typeof displayKiroWebStatus !== 'undefined' && displayKiroWebStatus) {
    const kiroWebStatus = String(
      state?.kiroRuntime?.webAuth?.status
      || state?.kiroRuntime?.register?.status
      || ''
    ).trim();
    displayKiroWebStatus.textContent = kiroWebStatus || '未开始';
  }
  if (typeof displayKiroLoginUrl !== 'undefined' && displayKiroLoginUrl) {
    const kiroLoginUrl = String(
      state?.kiroRuntime?.register?.loginUrl
      || ''
    ).trim();
    displayKiroLoginUrl.textContent = kiroLoginUrl || '未打开';
  }
  if (typeof displayKiroUploadStatus !== 'undefined' && displayKiroUploadStatus) {
    const kiroUploadStatus = String(
      state?.kiroRuntime?.upload?.status
      || ''
    ).trim();
    displayKiroUploadStatus.textContent = getKiroUploadStatusLabel(kiroUploadStatus);
  }
  const normalizedIpProxyService = resolveIpProxyService(state?.ipProxyService);
  const normalizedIpProxyServiceProfiles = typeof normalizeIpProxyServiceProfiles === 'function'
    ? normalizeIpProxyServiceProfiles(state?.ipProxyServiceProfiles || {}, state || {})
    : (state?.ipProxyServiceProfiles || {});
  const activeIpProxyProfile = typeof getIpProxyServiceProfile === 'function'
    ? getIpProxyServiceProfile(normalizedIpProxyService, {
      ...(state || {}),
      ipProxyService: normalizedIpProxyService,
      ipProxyServiceProfiles: normalizedIpProxyServiceProfiles,
    })
    : {
      mode: resolveIpProxyMode(state?.ipProxyMode),
      apiUrl: String(state?.ipProxyApiUrl || '').trim(),
      accountList: resolveIpProxyAccountList(state?.ipProxyAccountList || ''),
      accountSessionPrefix: resolveIpProxySessionPrefix(state?.ipProxyAccountSessionPrefix || ''),
      accountLifeMinutes: resolveIpProxyAccountLifeMinutes(state?.ipProxyAccountLifeMinutes || ''),
      poolTargetCount: resolveIpProxyPoolTargetCount(state?.ipProxyPoolTargetCount || ''),
      switchIpRoundCount: resolveIpProxySwitchIpRoundCount(state?.ipProxySwitchIpRoundCount || ''),
      autoRefreshPoolOnExhausted: Boolean(state?.ipProxyAutoRefreshPoolOnExhausted),
      host: String(state?.ipProxyHost || '').trim(),
      port: String(resolveIpProxyPort(state?.ipProxyPort || '') || ''),
      protocol: resolveIpProxyProtocol(state?.ipProxyProtocol),
      username: String(state?.ipProxyUsername || '').trim(),
      password: String(state?.ipProxyPassword || ''),
      region: String(state?.ipProxyRegion || '').trim(),
      apiRouteMode: String(state?.ipProxyApiRouteMode || 'direct').trim().toLowerCase() || 'direct',
      specialDomainRouteMode: String(state?.ipProxySpecialDomainRouteMode || 'local_proxy').trim().toLowerCase() || 'local_proxy',
    };
  if (typeof selectIpProxyService !== 'undefined' && selectIpProxyService) {
    selectIpProxyService.value = normalizedIpProxyService;
  }
  if (typeof inputIpProxyApiUrl !== 'undefined' && inputIpProxyApiUrl) {
    inputIpProxyApiUrl.value = String(activeIpProxyProfile.apiUrl || '').trim();
  }
  if (typeof inputIpProxyApiCount !== 'undefined' && inputIpProxyApiCount) {
    inputIpProxyApiCount.value = String(activeIpProxyProfile.apiCount || '');
  }
  if (typeof inputIpProxyApiRegion !== 'undefined' && inputIpProxyApiRegion) {
    inputIpProxyApiRegion.value = String(activeIpProxyProfile.apiRegion || '');
  }
  if (typeof inputIpProxyApiZone !== 'undefined' && inputIpProxyApiZone) {
    inputIpProxyApiZone.value = String(activeIpProxyProfile.apiZone || '');
  }
  if (typeof inputIpProxyApiPtype !== 'undefined' && inputIpProxyApiPtype) {
    inputIpProxyApiPtype.value = String(activeIpProxyProfile.apiPtype || '');
  }
  if (typeof selectIpProxyApiHost !== 'undefined' && selectIpProxyApiHost) {
    selectIpProxyApiHost.value = String(activeIpProxyProfile.apiHost || '').trim();
  }
  if (typeof selectIpProxyApiProto !== 'undefined' && selectIpProxyApiProto) {
    selectIpProxyApiProto.value = String(activeIpProxyProfile.apiProto || 'http').trim().toLowerCase() || 'http';
  }
  if (typeof selectIpProxyApiStype !== 'undefined' && selectIpProxyApiStype) {
    selectIpProxyApiStype.value = String(activeIpProxyProfile.apiStype || 'text').trim().toLowerCase() || 'text';
  }
  if (typeof selectIpProxyApiSplit !== 'undefined' && selectIpProxyApiSplit) {
    selectIpProxyApiSplit.value = String(activeIpProxyProfile.apiSplit || '\\r\\n');
  }
  if (typeof selectIpProxyApiSessType !== 'undefined' && selectIpProxyApiSessType) {
    selectIpProxyApiSessType.value = String(activeIpProxyProfile.apiSessType || 'rotating').trim().toLowerCase() || 'rotating';
  }
  if (typeof inputIpProxyApiSessTime !== 'undefined' && inputIpProxyApiSessTime) {
    inputIpProxyApiSessTime.value = String(activeIpProxyProfile.apiSessTime || '');
  }
  if (typeof selectIpProxyApiSessAuto !== 'undefined' && selectIpProxyApiSessAuto) {
    selectIpProxyApiSessAuto.value = String(activeIpProxyProfile.apiSessAuto || '1');
  }
  if (typeof inputIpProxyApiRefreshKey !== 'undefined' && inputIpProxyApiRefreshKey) {
    inputIpProxyApiRefreshKey.value = String(activeIpProxyProfile.apiRefreshKey || '');
  }
  if (typeof selectIpProxyApiRouteMode !== 'undefined' && selectIpProxyApiRouteMode) {
    selectIpProxyApiRouteMode.value = String(activeIpProxyProfile.apiRouteMode || 'direct').trim().toLowerCase() || 'direct';
  }
  if (typeof inputIpProxyAccountList !== 'undefined' && inputIpProxyAccountList) {
    inputIpProxyAccountList.value = activeIpProxyProfile.accountList;
  }
  if (typeof inputIpProxyAccountSessionPrefix !== 'undefined' && inputIpProxyAccountSessionPrefix) {
    inputIpProxyAccountSessionPrefix.value = activeIpProxyProfile.accountSessionPrefix;
  }
  if (typeof inputIpProxyAccountLifeMinutes !== 'undefined' && inputIpProxyAccountLifeMinutes) {
    inputIpProxyAccountLifeMinutes.value = activeIpProxyProfile.accountLifeMinutes;
  }
  if (typeof inputIpProxyPoolTargetCount !== 'undefined' && inputIpProxyPoolTargetCount) {
    inputIpProxyPoolTargetCount.value = activeIpProxyProfile.poolTargetCount;
  }
  if (typeof inputIpProxySwitchIpRoundCount !== 'undefined' && inputIpProxySwitchIpRoundCount) {
    inputIpProxySwitchIpRoundCount.value = activeIpProxyProfile.switchIpRoundCount;
  }
  if (typeof inputIpProxyAutoRefreshPoolOnExhausted !== 'undefined' && inputIpProxyAutoRefreshPoolOnExhausted) {
    inputIpProxyAutoRefreshPoolOnExhausted.checked = Boolean(activeIpProxyProfile.autoRefreshPoolOnExhausted);
  }
  if (typeof inputIpProxyAutoSyncEnabled !== 'undefined' && inputIpProxyAutoSyncEnabled) {
    inputIpProxyAutoSyncEnabled.checked = resolveIpProxyAutoSyncEnabled(state?.ipProxyAutoSyncEnabled);
  }
  if (typeof inputIpProxyAutoSyncIntervalMinutes !== 'undefined' && inputIpProxyAutoSyncIntervalMinutes) {
    inputIpProxyAutoSyncIntervalMinutes.value = String(
      resolveIpProxyAutoSyncIntervalMinutes(state?.ipProxyAutoSyncIntervalMinutes)
    );
  }
  if (typeof inputIpProxyHost !== 'undefined' && inputIpProxyHost) {
    inputIpProxyHost.value = activeIpProxyProfile.host;
  }
  if (typeof inputIpProxyPort !== 'undefined' && inputIpProxyPort) {
    const normalizedPort = resolveIpProxyPort(activeIpProxyProfile.port || '');
    inputIpProxyPort.value = normalizedPort > 0 ? String(normalizedPort) : '';
  }
  if (typeof selectIpProxyProtocol !== 'undefined' && selectIpProxyProtocol) {
    selectIpProxyProtocol.value = resolveIpProxyProtocol(activeIpProxyProfile.protocol);
  }
  if (typeof inputIpProxyUsername !== 'undefined' && inputIpProxyUsername) {
    inputIpProxyUsername.value = activeIpProxyProfile.username;
  }
  if (typeof inputIpProxyPassword !== 'undefined' && inputIpProxyPassword) {
    inputIpProxyPassword.value = activeIpProxyProfile.password;
  }
  if (typeof inputIpProxyRegion !== 'undefined' && inputIpProxyRegion) {
    inputIpProxyRegion.value = activeIpProxyProfile.region;
  }
  if (typeof selectIpProxySpecialDomainRouteMode !== 'undefined' && selectIpProxySpecialDomainRouteMode) {
    selectIpProxySpecialDomainRouteMode.value = String(activeIpProxyProfile.specialDomainRouteMode || 'local_proxy').trim().toLowerCase() || 'local_proxy';
  }
  if (typeof setIpProxyMode === 'function') {
    setIpProxyMode(activeIpProxyProfile.mode);
  }
  if (typeof setIpProxyEnabled === 'function') {
    setIpProxyEnabled(Boolean(state?.ipProxyEnabled));
  }
  syncLatestState({
    ipProxyService: normalizedIpProxyService,
    ipProxyServiceProfiles: normalizedIpProxyServiceProfiles,
    ...(typeof buildIpProxyStatePatchFromServiceProfile === 'function'
      ? buildIpProxyStatePatchFromServiceProfile(normalizedIpProxyService, activeIpProxyProfile)
      : {}),
  });
  if (typeof updateIpProxyUI === 'function') {
    updateIpProxyUI(latestState);
  }
  if (typeof selectFlow !== 'undefined' && selectFlow) {
    selectFlow.value = appliedFlowSelection.activeFlowId;
  }
  if (selectPanelMode && appliedFlowSelection.targetId) {
    selectPanelMode.value = appliedFlowSelection.targetId;
  }
  inputCodex2ApiUrl.value = state?.codex2apiUrl || '';
  inputCodex2ApiAdminKey.value = state?.codex2apiAdminKey || '';
  const yydsMailProvider = typeof YYDS_MAIL_PROVIDER === 'string'
    ? YYDS_MAIL_PROVIDER
    : 'yyds-mail';
  const restoredMailProvider = isCustomMailProvider(state?.mailProvider)
    || [ICLOUD_PROVIDER, 'hotmail-api', GMAIL_PROVIDER, 'luckmail-api', yydsMailProvider, '163', '163-vip', '126', 'qq', 'inbucket', '2925', 'cloudflare-temp-email', 'cloudmail'].includes(String(state?.mailProvider || '').trim())
    ? String(state?.mailProvider || '163').trim()
    : (String(state?.emailGenerator || '').trim().toLowerCase() === 'custom'
      || String(state?.emailGenerator || '').trim().toLowerCase() === 'manual'
      ? 'custom'
      : '163');
  selectMailProvider.value = restoredMailProvider;
  setMail2925Mode(state?.mail2925Mode);
  {
    const restoredEmailGenerator = String(state?.emailGenerator || '').trim().toLowerCase();
    if (restoredMailProvider === GMAIL_PROVIDER) {
      selectEmailGenerator.value = restoredEmailGenerator === CUSTOM_EMAIL_POOL_GENERATOR
        ? CUSTOM_EMAIL_POOL_GENERATOR
        : GMAIL_ALIAS_GENERATOR;
    } else if (restoredEmailGenerator === CUSTOM_EMAIL_POOL_GENERATOR) {
      selectEmailGenerator.value = CUSTOM_EMAIL_POOL_GENERATOR;
    } else if (restoredEmailGenerator === 'icloud') {
      selectEmailGenerator.value = 'icloud';
    } else if (restoredEmailGenerator === 'cloudflare') {
      selectEmailGenerator.value = 'cloudflare';
    } else if (restoredEmailGenerator === 'cloudflare-temp-email') {
      selectEmailGenerator.value = 'cloudflare-temp-email';
    } else if (restoredEmailGenerator === 'cloudmail') {
      selectEmailGenerator.value = 'cloudmail';
    } else {
      selectEmailGenerator.value = 'duck';
    }
  }
  if (selectIcloudHostPreference) {
    selectIcloudHostPreference.value = String(state?.icloudHostPreference || '').trim().toLowerCase() === 'icloud.com'
      ? 'icloud.com'
      : (String(state?.icloudHostPreference || '').trim().toLowerCase() === 'icloud.com.cn' ? 'icloud.com.cn' : 'auto');
  }
  if (selectIcloudFetchMode) {
    selectIcloudFetchMode.value = normalizeIcloudFetchMode(state?.icloudFetchMode);
  }
  if (selectIcloudTargetMailboxType) {
    selectIcloudTargetMailboxType.value = normalizeIcloudTargetMailboxType(state?.icloudTargetMailboxType);
  }
  if (selectIcloudForwardMailProvider) {
    selectIcloudForwardMailProvider.value = normalizeIcloudForwardMailProvider(state?.icloudForwardMailProvider);
  }
  if (checkboxAutoDeleteIcloud) {
    checkboxAutoDeleteIcloud.checked = Boolean(state?.autoDeleteUsedIcloudAlias);
  }
  if (inputAccountRunHistoryHelperBaseUrl) {
    inputAccountRunHistoryHelperBaseUrl.value = normalizeAccountRunHistoryHelperBaseUrlValue(state?.accountRunHistoryHelperBaseUrl);
  }
  if (inputContributionNickname) {
    inputContributionNickname.value = state?.contributionNickname || '';
  }
  if (inputContributionQq) {
    inputContributionQq.value = state?.contributionQq || '';
  }
  if (inputMail2925UseAccountPool) {
    inputMail2925UseAccountPool.checked = Boolean(state?.mail2925UseAccountPool);
  }
  setManagedAliasBaseEmailInputForProvider(restoredMailProvider, state);
  inputInbucketHost.value = state?.inbucketHost || '';
  inputInbucketMailbox.value = state?.inbucketMailbox || '';
  if (inputCustomMailProviderPool) {
    inputCustomMailProviderPool.value = normalizeCustomEmailPoolEntries(state?.customMailProviderPool).join('\n');
  }
  const restoredCustomEmailPoolEntries = typeof restoreCustomEmailPoolEntriesFromState === 'function'
    ? restoreCustomEmailPoolEntriesFromState(state)
    : normalizeCustomEmailPoolEntries(state?.customEmailPool);
  if (typeof setCustomEmailPoolEntriesState === 'function') {
    setCustomEmailPoolEntriesState(restoredCustomEmailPoolEntries);
  } else if (inputCustomEmailPool) {
    inputCustomEmailPool.value = restoredCustomEmailPoolEntries.join('\n');
  }
  setHotmailServiceMode(state?.hotmailServiceMode);
  inputHotmailRemoteBaseUrl.value = state?.hotmailRemoteBaseUrl || '';
  inputHotmailLocalBaseUrl.value = state?.hotmailLocalBaseUrl || '';
  inputLuckmailApiKey.value = state?.luckmailApiKey || '';
  inputLuckmailBaseUrl.value = normalizeLuckmailBaseUrl(state?.luckmailBaseUrl);
  selectLuckmailEmailType.value = normalizeLuckmailEmailType(state?.luckmailEmailType);
  inputLuckmailDomain.value = state?.luckmailDomain || '';
  applyCloudflareTempEmailSettingsState(state);
  if (typeof applyCloudMailSettingsState === 'function') {
    applyCloudMailSettingsState(state);
  }
  if (typeof applyYydsMailSettingsState === 'function') {
    applyYydsMailSettingsState(state);
  }
  renderCloudflareDomainOptions(state?.cloudflareDomain || '');
  setCloudflareDomainEditMode(false, { clearInput: true });
  inputAutoSkipFailures.checked = Boolean(state?.autoRunSkipFailures);
  if (typeof inputAutoRunRetryPaypalCallback !== 'undefined' && inputAutoRunRetryPaypalCallback) {
    inputAutoRunRetryPaypalCallback.checked = Boolean(state?.autoRunRetryPaypalCallback);
  }
  if (typeof inputAutoRunPreserveIssueLogsOnRestart !== 'undefined' && inputAutoRunPreserveIssueLogsOnRestart) {
    inputAutoRunPreserveIssueLogsOnRestart.checked = Boolean(state?.autoRunPreserveIssueLogsOnRestart);
  }
  inputAutoSkipFailuresThreadIntervalMinutes.value = String(normalizeAutoRunThreadIntervalMinutes(state?.autoRunFallbackThreadIntervalMinutes));
  if (typeof inputStep6CookieCleanupEnabled !== 'undefined' && inputStep6CookieCleanupEnabled) {
    inputStep6CookieCleanupEnabled.checked = Boolean(state?.step6CookieCleanupEnabled);
  }
  inputAutoDelayEnabled.checked = Boolean(state?.autoRunDelayEnabled);
  inputAutoDelayMinutes.value = String(normalizeAutoDelayMinutes(state?.autoRunDelayMinutes));
  inputAutoStepDelaySeconds.value = formatAutoStepDelayInputValue(state?.autoStepDelaySeconds);
  if (typeof inputRegistrationStageWaitSeconds !== 'undefined' && inputRegistrationStageWaitSeconds) {
    inputRegistrationStageWaitSeconds.value = formatRegistrationStageWaitInputValue(state?.registrationStageWaitSeconds);
  }
  if (typeof inputSignupIdentityRedirectTimeoutSeconds !== 'undefined' && inputSignupIdentityRedirectTimeoutSeconds) {
    inputSignupIdentityRedirectTimeoutSeconds.value = formatSignupIdentityRedirectTimeoutInputValue(
      state?.signupIdentityRedirectTimeoutSeconds
    );
  }
  if (typeof inputAuthContentScriptRecoveryTimeoutSeconds !== 'undefined' && inputAuthContentScriptRecoveryTimeoutSeconds) {
    inputAuthContentScriptRecoveryTimeoutSeconds.value = formatAuthContentScriptRecoveryTimeoutInputValue(
      state?.authContentScriptRecoveryTimeoutSeconds
    );
  }
  if (typeof inputSignupVerificationReadyTimeoutSeconds !== 'undefined' && inputSignupVerificationReadyTimeoutSeconds) {
    inputSignupVerificationReadyTimeoutSeconds.value = formatSignupVerificationReadyTimeoutInputValue(
      state?.signupVerificationReadyTimeoutSeconds
    );
  }
  if (typeof inputSignupVerificationReadyMaxRounds !== 'undefined' && inputSignupVerificationReadyMaxRounds) {
    inputSignupVerificationReadyMaxRounds.value = formatSignupVerificationReadyMaxRoundsInputValue(
      state?.signupVerificationReadyMaxRounds
    );
  }
  if (typeof inputSignupVerificationReadyRoundWaitSeconds !== 'undefined' && inputSignupVerificationReadyRoundWaitSeconds) {
    const readyMaxRounds = normalizeSignupVerificationReadyMaxRounds(
      state?.signupVerificationReadyMaxRounds,
      DEFAULT_SIGNUP_VERIFICATION_READY_MAX_ROUNDS
    );
    const readyTimeoutSeconds = normalizeSignupVerificationReadyTimeoutSeconds(
      state?.signupVerificationReadyTimeoutSeconds,
      DEFAULT_SIGNUP_VERIFICATION_READY_TIMEOUT_SECONDS
    );
    const readyRoundWaitFallback = Math.max(1, Math.ceil(readyTimeoutSeconds / Math.max(1, readyMaxRounds)));
    inputSignupVerificationReadyRoundWaitSeconds.value = formatSignupVerificationReadyRoundWaitInputValue(
      state?.signupVerificationReadyRoundWaitSeconds,
      readyRoundWaitFallback
    );
  }
  if (typeof inputStep5ProfileSubmitResultMaxRounds !== 'undefined' && inputStep5ProfileSubmitResultMaxRounds) {
    inputStep5ProfileSubmitResultMaxRounds.value = formatStep5ProfileSubmitResultMaxRoundsInputValue(
      state?.step5ProfileSubmitResultMaxRounds
    );
  }
  if (typeof inputStep5ProfileSubmitResultRoundWaitSeconds !== 'undefined' && inputStep5ProfileSubmitResultRoundWaitSeconds) {
    inputStep5ProfileSubmitResultRoundWaitSeconds.value = formatStep5ProfileSubmitResultRoundWaitInputValue(
      state?.step5ProfileSubmitResultRoundWaitSeconds
    );
  }
  if (typeof inputOAuthFlowTimeoutEnabled !== 'undefined' && inputOAuthFlowTimeoutEnabled) {
    inputOAuthFlowTimeoutEnabled.checked = state?.oauthFlowTimeoutEnabled !== undefined
      ? Boolean(state.oauthFlowTimeoutEnabled)
      : true;
  }
  if (typeof inputOAuthOpenAfterRefreshWaitSeconds !== 'undefined' && inputOAuthOpenAfterRefreshWaitSeconds) {
    inputOAuthOpenAfterRefreshWaitSeconds.value = String(
      normalizeOAuthOpenAfterRefreshWaitSeconds(state?.oauthOpenAfterRefreshWaitSeconds)
    );
  }
  if (inputVerificationResendCount) {
    const restoredVerificationResendCount = state?.verificationResendCount !== undefined
      ? state.verificationResendCount
      : (state?.signupVerificationResendCount ?? state?.loginVerificationResendCount);
    inputVerificationResendCount.value = String(
      normalizeVerificationResendCount(restoredVerificationResendCount, DEFAULT_VERIFICATION_RESEND_COUNT)
    );
  }
  if (inputPhoneVerificationEnabled) {
    inputPhoneVerificationEnabled.checked = state?.phoneVerificationEnabled !== undefined
      ? Boolean(state.phoneVerificationEnabled)
      : DEFAULT_PHONE_VERIFICATION_ENABLED;
  }
  if (typeof setSignupMethod === 'function') {
    setSignupMethod(state?.signupMethod || DEFAULT_SIGNUP_METHOD);
  }
  if (typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail) {
    inputPhoneSignupReloginAfterBindEmail.checked = state?.phoneSignupReloginAfterBindEmailEnabled !== undefined
      ? Boolean(state.phoneSignupReloginAfterBindEmailEnabled)
      : DEFAULT_PHONE_SIGNUP_RELOGIN_AFTER_BIND_EMAIL_ENABLED;
  }
  if (typeof inputPhoneSignupPhonePrefixedEmail !== 'undefined' && inputPhoneSignupPhonePrefixedEmail) {
    inputPhoneSignupPhonePrefixedEmail.checked = state?.phoneSignupPhonePrefixedEmailEnabled !== undefined
      ? Boolean(state.phoneSignupPhonePrefixedEmailEnabled)
      : (typeof DEFAULT_PHONE_SIGNUP_PHONE_PREFIXED_EMAIL_ENABLED !== 'undefined'
        ? DEFAULT_PHONE_SIGNUP_PHONE_PREFIXED_EMAIL_ENABLED
        : true);
  }
  const restoredPhoneSmsProvider = normalizePhoneSmsProvider(state?.phoneSmsProvider);
  const previousPhoneSmsProvider = selectPhoneSmsProvider ? normalizePhoneSmsProvider(selectPhoneSmsProvider.value) : restoredPhoneSmsProvider;
  const phoneSmsProviderHeroSms = typeof PHONE_SMS_PROVIDER_HERO_SMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_HERO_SMS
    : 'hero-sms';
  const phoneSmsProviderFiveSim = typeof PHONE_SMS_PROVIDER_FIVE_SIM !== 'undefined'
    ? PHONE_SMS_PROVIDER_FIVE_SIM
    : '5sim';
  const phoneSmsProviderSmsBower = typeof PHONE_SMS_PROVIDER_SMSBOWER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSBOWER
    : 'smsbower';
  const phoneSmsProviderSmsVerificationNumber = typeof PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER
    : 'sms-verification-number';
  const phoneSmsProviderGrizzlySms = typeof PHONE_SMS_PROVIDER_GRIZZLYSMS !== 'undefined'
    ? PHONE_SMS_PROVIDER_GRIZZLYSMS
    : 'grizzlysms';
  const phoneSmsProviderSmsPool = typeof PHONE_SMS_PROVIDER_SMSPOOL !== 'undefined'
    ? PHONE_SMS_PROVIDER_SMSPOOL
    : 'smspool';
  const normalizePhoneSmsMaxPriceInput = typeof normalizePhoneSmsMaxPriceValue === 'function'
    ? normalizePhoneSmsMaxPriceValue
    : ((value = '') => String(value || '').trim());
  const normalizePhoneSmsMinPriceInput = typeof normalizePhoneSmsMinPriceValue === 'function'
    ? normalizePhoneSmsMinPriceValue
    : ((value = '') => String(value || '').trim());
  const normalizeHeroSmsPreferredPriceInput = typeof normalizeHeroSmsMaxPriceValue === 'function'
    ? normalizeHeroSmsMaxPriceValue
    : ((value = '') => String(value || '').trim());
  const defaultFiveSimProduct = typeof DEFAULT_FIVE_SIM_PRODUCT !== 'undefined'
    ? DEFAULT_FIVE_SIM_PRODUCT
    : 'openai';
  const defaultNexSmsServiceCode = typeof DEFAULT_NEX_SMS_SERVICE_CODE !== 'undefined'
    ? DEFAULT_NEX_SMS_SERVICE_CODE
    : 'ot';
  setPhoneSmsProviderSelectValue(restoredPhoneSmsProvider);
  const restoredPhoneSmsProviderOrder = typeof applyPhoneSmsProviderOrderSelection === 'function'
    ? applyPhoneSmsProviderOrderSelection(state?.phoneSmsProviderOrder || [], {
      ensureDefault: false,
      syncProvider: false,
    })
    : [];
  updatePhoneSmsProviderOrderSummary(restoredPhoneSmsProviderOrder);
  if (previousPhoneSmsProvider !== restoredPhoneSmsProvider) {
    heroSmsCountrySelectionOrder = [];
    loadHeroSmsCountries({ silent: true, preferFallbackOnly: true }).catch(() => { });
  }
  if (typeof syncHeroSmsOperatorSelectionState === 'function') {
    syncHeroSmsOperatorSelectionState(state?.heroSmsOperatorByCountry || {});
  }
  if (inputHeroSmsApiKey) {
    if (restoredPhoneSmsProvider === phoneSmsProviderFiveSim) {
      inputHeroSmsApiKey.value = state?.fiveSimApiKey || '';
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsBower) {
      inputHeroSmsApiKey.value = state?.smsBowerApiKey || '';
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsVerificationNumber) {
      inputHeroSmsApiKey.value = state?.smsVerificationNumberApiKey || '';
    } else if (restoredPhoneSmsProvider === phoneSmsProviderGrizzlySms) {
      inputHeroSmsApiKey.value = state?.grizzlySmsApiKey || '';
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsPool) {
      inputHeroSmsApiKey.value = state?.smsPoolApiKey || '';
    } else {
      inputHeroSmsApiKey.value = state?.heroSmsApiKey || '';
    }
  }
  if (typeof inputFiveSimApiKey !== 'undefined' && inputFiveSimApiKey) {
    inputFiveSimApiKey.value = String(state?.fiveSimApiKey || '');
  }
  if (typeof inputFiveSimOperator !== 'undefined' && inputFiveSimOperator) {
    inputFiveSimOperator.value = typeof normalizeFiveSimOperatorValue === 'function'
      ? normalizeFiveSimOperatorValue(state?.fiveSimOperator || DEFAULT_FIVE_SIM_OPERATOR)
      : normalizeFiveSimOperator(state?.fiveSimOperator || DEFAULT_FIVE_SIM_OPERATOR);
  }
  if (typeof inputFiveSimProduct !== 'undefined' && inputFiveSimProduct) {
    inputFiveSimProduct.value = typeof normalizeFiveSimProductValue === 'function'
      ? normalizeFiveSimProductValue(state?.fiveSimProduct || defaultFiveSimProduct)
      : String(state?.fiveSimProduct || defaultFiveSimProduct).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || defaultFiveSimProduct;
  }
  if (typeof inputNexSmsApiKey !== 'undefined' && inputNexSmsApiKey) {
    inputNexSmsApiKey.value = String(state?.nexSmsApiKey || '');
  }
  if (typeof inputNexSmsServiceCode !== 'undefined' && inputNexSmsServiceCode) {
    inputNexSmsServiceCode.value = typeof normalizeNexSmsServiceCodeValue === 'function'
      ? normalizeNexSmsServiceCodeValue(state?.nexSmsServiceCode || defaultNexSmsServiceCode)
      : String(state?.nexSmsServiceCode || defaultNexSmsServiceCode).trim().toLowerCase().replace(/[^a-z0-9_-]+/g, '') || defaultNexSmsServiceCode;
  }
  if (typeof inputHeroSmsReuseEnabled !== 'undefined' && inputHeroSmsReuseEnabled) {
    inputHeroSmsReuseEnabled.checked = normalizeHeroSmsReuseEnabledValue(
      state?.phoneSmsReuseEnabled,
      state?.heroSmsReuseEnabled
    );
  }
  if (typeof inputFreePhoneReuseEnabled !== 'undefined' && inputFreePhoneReuseEnabled) {
    inputFreePhoneReuseEnabled.checked = Boolean(state?.freePhoneReuseEnabled);
  }
  if (typeof inputFreePhoneReuseAutoEnabled !== 'undefined' && inputFreePhoneReuseAutoEnabled) {
    inputFreePhoneReuseAutoEnabled.checked = Boolean(state?.freePhoneReuseAutoEnabled);
  }
  if (typeof selectHeroSmsAcquirePriority !== 'undefined' && selectHeroSmsAcquirePriority) {
    selectHeroSmsAcquirePriority.value = normalizeHeroSmsAcquirePriority(state?.heroSmsAcquirePriority);
  }
  if (inputHeroSmsMaxPrice) {
    if (restoredPhoneSmsProvider === phoneSmsProviderFiveSim) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.fiveSimMaxPrice || '', phoneSmsProviderFiveSim);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsBower) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.smsBowerMaxPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsVerificationNumber) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.smsVerificationNumberMaxPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderGrizzlySms) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.grizzlySmsMaxPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsPool) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.smsPoolMaxPrice || '', restoredPhoneSmsProvider);
    } else {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceInput(state?.heroSmsMaxPrice || '', restoredPhoneSmsProvider);
    }
  }
  if (typeof inputHeroSmsMinPrice !== 'undefined' && inputHeroSmsMinPrice) {
    if (restoredPhoneSmsProvider === phoneSmsProviderFiveSim) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.fiveSimMinPrice || '', phoneSmsProviderFiveSim);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsBower) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.smsBowerMinPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsVerificationNumber) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.smsVerificationNumberMinPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderGrizzlySms) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.grizzlySmsMinPrice || '', restoredPhoneSmsProvider);
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsPool) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.smsPoolMinPrice || '', restoredPhoneSmsProvider);
    } else {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceInput(state?.heroSmsMinPrice || '', restoredPhoneSmsProvider);
    }
  }
  if (inputFiveSimOperator) {
    inputFiveSimOperator.value = normalizeFiveSimOperator(state?.fiveSimOperator);
  }
  if (typeof inputHeroSmsPreferredPrice !== 'undefined' && inputHeroSmsPreferredPrice) {
    if (restoredPhoneSmsProvider === phoneSmsProviderSmsBower) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsPreferredPriceInput(state?.smsBowerPreferredPrice || '');
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsVerificationNumber) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsPreferredPriceInput(state?.smsVerificationNumberPreferredPrice || '');
    } else if (restoredPhoneSmsProvider === phoneSmsProviderGrizzlySms) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsPreferredPriceInput(state?.grizzlySmsPreferredPrice || '');
    } else if (restoredPhoneSmsProvider === phoneSmsProviderSmsPool) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsPreferredPriceInput(state?.smsPoolPreferredPrice || '');
    } else {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsPreferredPriceInput(state?.heroSmsPreferredPrice || '');
    }
  }
  if (typeof inputChatGptApiSmsPool !== 'undefined' && inputChatGptApiSmsPool) {
    inputChatGptApiSmsPool.value = normalizeHostedCheckoutSmsPoolTextValue(state?.chatGptApiSmsPoolText || '');
  }
  if (typeof inputChatGptApiSmsPoolAutoDisableEnabled !== 'undefined' && inputChatGptApiSmsPoolAutoDisableEnabled) {
    inputChatGptApiSmsPoolAutoDisableEnabled.checked = Boolean(state?.chatGptApiSmsPoolAutoDisableEnabled);
  }
  if (typeof inputPhoneReplacementLimit !== 'undefined' && inputPhoneReplacementLimit) {
    inputPhoneReplacementLimit.value = String(
      normalizePhoneVerificationReplacementLimit(
        state?.phoneVerificationReplacementLimit,
        DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT
      )
    );
  }
  if (typeof inputPhoneActivationRetryRounds !== 'undefined' && inputPhoneActivationRetryRounds) {
    inputPhoneActivationRetryRounds.value = String(
      normalizePhoneActivationRetryRoundsValue(
        state?.phoneActivationRetryRounds ?? state?.heroSmsActivationRetryRounds,
        DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS
      )
    );
  }
  if (typeof inputPhoneActivationTierUpgradeLimit !== 'undefined' && inputPhoneActivationTierUpgradeLimit) {
    inputPhoneActivationTierUpgradeLimit.value = String(
      normalizePhoneActivationTierUpgradeLimit(
        state?.phoneActivationTierUpgradeLimit,
        DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT
      )
    );
  }
  if (typeof inputPhoneCodeWaitSeconds !== 'undefined' && inputPhoneCodeWaitSeconds) {
    inputPhoneCodeWaitSeconds.value = String(
      normalizePhoneCodeWaitSecondsValue(state?.phoneCodeWaitSeconds, DEFAULT_PHONE_CODE_WAIT_SECONDS)
    );
  }
  if (typeof inputPhoneCodeTimeoutWindows !== 'undefined' && inputPhoneCodeTimeoutWindows) {
    inputPhoneCodeTimeoutWindows.value = String(
      normalizePhoneCodeTimeoutWindowsValue(state?.phoneCodeTimeoutWindows, DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS)
    );
  }
  if (typeof inputPhoneCodePollIntervalSeconds !== 'undefined' && inputPhoneCodePollIntervalSeconds) {
    inputPhoneCodePollIntervalSeconds.value = String(
      normalizePhoneCodePollIntervalSecondsValue(
        state?.phoneCodePollIntervalSeconds,
        DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS
      )
    );
  }
  if (typeof inputPhoneCodePollMaxRounds !== 'undefined' && inputPhoneCodePollMaxRounds) {
    inputPhoneCodePollMaxRounds.value = String(
      normalizePhoneCodePollMaxRoundsValue(state?.phoneCodePollMaxRounds, DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS)
    );
  }
  if (typeof inputSignupPhoneVerificationSubmitResultMaxRounds !== 'undefined' && inputSignupPhoneVerificationSubmitResultMaxRounds) {
    inputSignupPhoneVerificationSubmitResultMaxRounds.value = formatSignupPhoneVerificationSubmitResultMaxRoundsInputValue(
      state?.signupPhoneVerificationSubmitResultMaxRounds
    );
  }
  if (typeof inputSignupPhoneVerificationSubmitResultRoundWaitSeconds !== 'undefined' && inputSignupPhoneVerificationSubmitResultRoundWaitSeconds) {
    inputSignupPhoneVerificationSubmitResultRoundWaitSeconds.value = formatSignupPhoneVerificationSubmitResultRoundWaitInputValue(
      state?.signupPhoneVerificationSubmitResultRoundWaitSeconds
    );
  }
  if (typeof applyHeroSmsFallbackSelection === 'function') {
    const primaryCountry = restoredPhoneSmsProvider === phoneSmsProviderFiveSim
      ? {
        id: normalizeFiveSimCountryId(state?.fiveSimCountryId),
        label: normalizeFiveSimCountryLabel(state?.fiveSimCountryLabel),
      }
      : {
        id: normalizeHeroSmsCountryId(state?.heroSmsCountryId),
        label: normalizeHeroSmsCountryLabel(state?.heroSmsCountryLabel),
      };
    applyHeroSmsFallbackSelection(
      [
        primaryCountry,
        ...(restoredPhoneSmsProvider === phoneSmsProviderFiveSim
          ? normalizeFiveSimCountryFallbackList(state?.fiveSimCountryFallback || [])
          : normalizeHeroSmsCountryFallbackList(state?.heroSmsCountryFallback || [])),
      ],
      { includePrimary: true }
    );
    updateHeroSmsPlatformDisplay();
  } else if (selectHeroSmsCountry) {
    const restoredCountryId = restoredPhoneSmsProvider === phoneSmsProviderFiveSim
      ? String(normalizeFiveSimCountryId(state?.fiveSimCountryId))
      : String(normalizeHeroSmsCountryId(state?.heroSmsCountryId));
    if (Array.from(selectHeroSmsCountry.options).some((option) => option.value === restoredCountryId)) {
      selectHeroSmsCountry.value = restoredCountryId;
    } else {
      Array.from(selectHeroSmsCountry.options).forEach((option) => {
        option.selected = false;
      });
    }
    updateHeroSmsPlatformDisplay();
  }
  updateHeroSmsPlatformDisplay();
  if (typeof updateHeroSmsRuntimeDisplay === 'function') {
    updateHeroSmsRuntimeDisplay(state);
  }
  const isSyncPhase = typeof isAutoRunSourceSyncPhase === 'function'
    ? isAutoRunSourceSyncPhase
    : (phase) => ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(phase);
  const shouldSyncInitialRunCount = typeof shouldSyncRunCountFromAutoRunSource === 'function'
    ? shouldSyncRunCountFromAutoRunSource(state)
    : (Boolean(state?.autoRunning) || isSyncPhase(state?.autoRunPhase ?? state?.phase));
  if (state?.autoRunTotalRuns && shouldSyncInitialRunCount) {
    inputRunCount.value = String(state.autoRunTotalRuns);
  }

  applyAutoRunStatus(state);
  markSettingsDirty(false);
  updateAutoDelayInputState();
  updateFallbackThreadIntervalInputState();
  updateAccountRunHistorySettingsUI();
  updatePhoneVerificationSettingsUI();
  if (typeof renderPayPalAccounts === 'function') {
    renderPayPalAccounts();
  }
  if (typeof renderPayPalProfile === 'function') {
    renderPayPalProfile();
  }
  if (typeof updatePlusModeUI === 'function') {
    updatePlusModeUI();
  }
  updatePanelModeUI();
  updateMailProviderUI();
  if (typeof queueCustomEmailPoolRefresh === 'function') {
    queueCustomEmailPoolRefresh();
  }
  if (isLuckmailProvider(state?.mailProvider)) {
    if (typeof queueLuckmailPurchaseRefresh === 'function') {
      queueLuckmailPurchaseRefresh();
    }
  }
  updateButtonStates();
  if (typeof syncPlusManualConfirmationDialog === 'function') {
    void syncPlusManualConfirmationDialog();
  }
}

async function restoreState() {
  try {
    const state = await chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' });
    applySettingsState(state);
    if (getSelectedEmailGenerator() === 'icloud' && icloudSection?.style.display !== 'none') {
      refreshIcloudAliases({ silent: true }).catch(() => { });
    }

    if (state.oauthUrl) {
      displayOauthUrl.textContent = state.oauthUrl;
      displayOauthUrl.classList.add('has-value');
    }
    if (state.localhostUrl) {
      displayLocalhostUrl.textContent = state.localhostUrl;
      displayLocalhostUrl.classList.add('has-value');
    }
    if (state.nodeStatuses) {
      for (const [nodeId, status] of Object.entries(state.nodeStatuses)) {
        updateNodeUI(nodeId, status);
      }
    }

    if (state.logs) {
      for (const entry of state.logs) {
        appendLog(entry);
      }
    }

    updateStatusDisplay(latestState);
    updateProgressCounter();
    renderContributionMode();
  } catch (err) {
    console.error('Failed to restore state:', err);
    if (typeof applyOperationDelayState === 'function') {
      applyOperationDelayState(undefined, { restoreFailed: true });
    }
  }
}

function openExternalUrl(url) {
  const targetUrl = String(url || '').trim();
  if (!targetUrl) {
    return;
  }

  if (chrome?.tabs?.create) {
    chrome.tabs.create({ url: targetUrl, active: true }).catch(() => {
      window.open(targetUrl, '_blank', 'noopener');
    });
    return;
  }

  window.open(targetUrl, '_blank', 'noopener');
}

function getRepositoryHomeUrl() {
  const serviceRepositoryUrl = String(sidepanelUpdateService?.repositoryUrl || '').trim();
  if (serviceRepositoryUrl) {
    return serviceRepositoryUrl;
  }

  const releasesPageUrl = String(sidepanelUpdateService?.releasesPageUrl || '').trim();
  if (releasesPageUrl) {
    return releasesPageUrl.replace(/\/releases\/?$/, '');
  }

  return 'https://github.com/QLHazyCoder/FlowPilot';
}

function getReleaseListUrl() {
  const snapshotReleaseListUrl = String(currentReleaseSnapshot?.releasesPageUrl || '').trim();
  if (snapshotReleaseListUrl) {
    return snapshotReleaseListUrl;
  }

  const serviceReleaseListUrl = String(sidepanelUpdateService?.releasesPageUrl || '').trim();
  if (serviceReleaseListUrl) {
    return serviceReleaseListUrl;
  }

  return `${getRepositoryHomeUrl()}/releases`;
}

function openRepositoryHomePage() {
  openExternalUrl(getRepositoryHomeUrl());
}

function openReleaseListPage() {
  openExternalUrl(getReleaseListUrl());
}

function ignoreCurrentReleaseUpdate() {
  if (!sidepanelUpdateService?.ignoreReleaseSnapshot) {
    return;
  }

  const ignoredVersion = sidepanelUpdateService.ignoreReleaseSnapshot(currentReleaseSnapshot);
  if (!ignoredVersion) {
    return;
  }

  renderReleaseSnapshot({
    ...currentReleaseSnapshot,
    status: 'ignored',
    ignoredVersion,
  });
  showToast(`已忽略 ${ignoredVersion} 更新，有新版本时会再次提醒。`, 'info', 2200);
}

function openCloudflareTempEmailUsageGuidePage() {
  const targetUrl = getContributionPortalUrl();
  if (!targetUrl) {
    return;
  }
  openExternalUrl(targetUrl);
}

function openCloudflareTempEmailRepositoryPage() {
  openExternalUrl(CLOUDFLARE_TEMP_EMAIL_REPOSITORY_URL);
}

function createUpdateNoteList(notes = []) {
  if (!Array.isArray(notes) || notes.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'update-release-empty';
    empty.textContent = '该版本未提供可解析的更新说明，请查看完整更新日志。';
    return empty;
  }

  const list = document.createElement('ul');
  list.className = 'update-release-notes';

  notes.forEach((note) => {
    const item = document.createElement('li');
    item.textContent = note;
    list.appendChild(item);
  });

  return list;
}

function renderUpdateReleaseList(releases = []) {
  if (!updateReleaseList) {
    return;
  }

  updateReleaseList.innerHTML = '';

  releases.forEach((release) => {
    const item = document.createElement('article');
    item.className = 'update-release-item';

    const head = document.createElement('div');
    head.className = 'update-release-head';

    const titleRow = document.createElement('div');
    titleRow.className = 'update-release-title-row';

    const version = document.createElement('span');
    version.className = 'update-release-version';
    version.textContent = release.displayVersion || `FlowPilot${release.version}`;
    titleRow.appendChild(version);

    if (release.title) {
      const name = document.createElement('span');
      name.className = 'update-release-name';
      name.textContent = release.title;
      titleRow.appendChild(name);
    }

    head.appendChild(titleRow);

    const publishedAt = sidepanelUpdateService?.formatReleaseDate?.(release.publishedAt) || '';
    if (publishedAt) {
      const date = document.createElement('span');
      date.className = 'update-release-date';
      date.textContent = publishedAt;
      head.appendChild(date);
    }

    item.appendChild(head);
    item.appendChild(createUpdateNoteList(release.notes));
    updateReleaseList.appendChild(item);
  });
}

function resetUpdateCard() {
  if (updateSection) {
    updateSection.hidden = true;
  }
  if (updateCardVersion) {
    updateCardVersion.textContent = '';
  }
  if (updateCardSummary) {
    updateCardSummary.textContent = '';
  }
  if (updateReleaseList) {
    updateReleaseList.innerHTML = '';
  }
  if (btnOpenRelease) {
    btnOpenRelease.hidden = true;
    btnOpenRelease.onclick = null;
  }
  if (btnIgnoreRelease) {
    btnIgnoreRelease.hidden = true;
    btnIgnoreRelease.onclick = null;
  }
}

function renderReleaseSnapshot(snapshot) {
  currentReleaseSnapshot = snapshot;

  if (!extensionUpdateStatus || !extensionVersionMeta) {
    return;
  }

  extensionUpdateStatus.classList.remove('is-update-available', 'is-check-failed', 'is-version-label');

  const localVersionText = snapshot?.localVersion || '';
  const logUrl = snapshot?.logUrl || snapshot?.releasesPageUrl || sidepanelUpdateService?.releasesPageUrl || '';

  if (btnReleaseLog) {
    btnReleaseLog.onclick = () => openExternalUrl(logUrl);
    btnReleaseLog.hidden = true;
  }
  extensionVersionMeta.hidden = true;
  extensionVersionMeta.textContent = '';

  switch (snapshot?.status) {
    case 'update-available': {
      extensionUpdateStatus.textContent = '有更新';
      extensionUpdateStatus.classList.add('is-update-available');
      if (btnReleaseLog) {
        btnReleaseLog.hidden = false;
      }

      if (updateSection) {
        updateSection.hidden = false;
      }
      if (updateCardVersion) {
        updateCardVersion.textContent = `最新版本 ${snapshot.latestVersion}`;
      }
      if (updateCardSummary) {
        const updateCount = Array.isArray(snapshot.newerReleases) ? snapshot.newerReleases.length : 0;
        updateCardSummary.textContent = updateCount > 1
          ? `当前 ${localVersionText}，共有 ${updateCount} 个新版本可更新。`
          : `当前 ${localVersionText}，可更新到 ${snapshot.latestVersion}。`;
      }
      renderUpdateReleaseList(snapshot.newerReleases || []);
      if (btnOpenRelease) {
        btnOpenRelease.hidden = false;
        btnOpenRelease.textContent = '前往更新';
        btnOpenRelease.onclick = () => openExternalUrl(logUrl);
      }
      if (btnIgnoreRelease) {
        btnIgnoreRelease.hidden = false;
        btnIgnoreRelease.onclick = ignoreCurrentReleaseUpdate;
      }
      break;
    }

    case 'ignored': {
      extensionUpdateStatus.textContent = localVersionText || 'FlowPilot0.0';
      extensionUpdateStatus.classList.add('is-version-label');
      resetUpdateCard();
      break;
    }

    case 'latest': {
      extensionUpdateStatus.textContent = localVersionText || 'FlowPilot0.0';
      extensionUpdateStatus.classList.add('is-version-label');
      resetUpdateCard();
      break;
    }

    case 'empty': {
      extensionUpdateStatus.textContent = localVersionText || 'FlowPilot0.0';
      extensionUpdateStatus.classList.add('is-version-label');
      resetUpdateCard();
      break;
    }

    case 'error':
    default: {
      extensionUpdateStatus.textContent = localVersionText || 'FlowPilot0.0';
      extensionUpdateStatus.classList.add('is-version-label', 'is-check-failed');
      extensionVersionMeta.textContent = snapshot?.errorMessage || 'GitHub Releases 检查失败';
      extensionVersionMeta.hidden = false;
      resetUpdateCard();
      break;
    }
  }
}

async function initializeReleaseInfo() {
  if (!extensionUpdateStatus || !extensionVersionMeta) {
    return;
  }

  const manifest = chrome.runtime.getManifest();
  const localVersion = sidepanelUpdateService?.getLocalVersionLabel?.(manifest)
    || manifest?.version_name
    || (manifest?.version ? `FlowPilot${manifest.version}` : '');

  currentReleaseSnapshot = null;
  extensionUpdateStatus.textContent = localVersion || 'FlowPilot0.0';
  extensionUpdateStatus.classList.remove('is-update-available', 'is-check-failed');
  extensionUpdateStatus.classList.add('is-version-label');
  extensionVersionMeta.hidden = true;
  extensionVersionMeta.textContent = '';
  resetUpdateCard();
}

function getContributionUpdateHintMessage(snapshot = currentContributionContentSnapshot) {
  const lines = getContributionUpdatePromptLines(snapshot);
  if (!lines.length) {
    return '';
  }
  if (lines.length === 1) {
    return lines[0];
  }
  return lines.map((line, index) => `${index + 1}. ${line}`).join('\n');
}

function getContributionUpdatePromptLines(snapshot = currentContributionContentSnapshot) {
  if (!snapshot?.promptVersion) {
    return [];
  }

  const items = Array.isArray(snapshot.items) ? snapshot.items : [];
  const autoRunNoticeItem = items.find((item) =>
    item
    && String(item.slug || '').trim().toLowerCase() === 'auto_run_notice'
  );
  if (autoRunNoticeItem) {
    const noticeText = String(autoRunNoticeItem.text || '').trim();
    return autoRunNoticeItem.isVisible && noticeText ? [noticeText] : [];
  }

  const hasAnnouncementOrTutorial = items.some((item) =>
    item
    && item.isVisible
    && ['announcement', 'tutorial'].includes(String(item.slug || '').trim().toLowerCase())
  );
  const hasQuestionnaire = items.some((item) =>
    item
    && item.isVisible
    && String(item.slug || '').trim().toLowerCase() === 'questionnaire'
  );

  const lines = [];
  if (hasAnnouncementOrTutorial) {
    lines.push('公告 / 使用教程有更新了，可点上方“贡献/使用”查看。');
  }
  if (hasQuestionnaire) {
    lines.push('有新的征求意见，请佬友共同参与选择。');
  }
  return lines;
}

function getAutoRunAdConfig(snapshot = currentContributionContentSnapshot) {
  const items = Array.isArray(snapshot?.items) ? snapshot.items : [];
  const adItem = items.find((item) =>
    item
    && String(item.slug || '').trim().toLowerCase() === 'extension_auto_run_ad'
  );
  if (!adItem || !adItem.isVisible) {
    return null;
  }

  const text = String(adItem.text || '').replace(/\s+/g, ' ').trim();
  if (!text) {
    return null;
  }

  return {
    text,
    title: String(adItem.title || '').trim(),
  };
}

function sanitizeAutoRunAdUrl(value = '') {
  const raw = String(value || '').trim();
  if (!raw) {
    return '';
  }

  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '';
    }
    return parsed.href;
  } catch (_error) {
    return '';
  }
}

function parseAutoRunAdSegments(value = '') {
  const rawText = String(value || '').trim();
  if (!rawText) {
    return [];
  }

  const segments = [];
  let cursor = 0;

  while (cursor < rawText.length) {
    const labelStart = rawText.indexOf('[', cursor);
    if (labelStart < 0) {
      segments.push({
        type: 'text',
        text: rawText.slice(cursor),
      });
      break;
    }

    const labelEnd = rawText.indexOf(']', labelStart + 1);
    if (labelEnd < 0 || rawText[labelEnd + 1] !== '(') {
      segments.push({
        type: 'text',
        text: rawText.slice(cursor),
      });
      break;
    }

    if (labelStart > cursor) {
      segments.push({
        type: 'text',
        text: rawText.slice(cursor, labelStart),
      });
    }

    let urlEnd = labelEnd + 2;
    let depth = 1;
    while (urlEnd < rawText.length && depth > 0) {
      const ch = rawText[urlEnd];
      if (ch === '(') {
        depth += 1;
      } else if (ch === ')') {
        depth -= 1;
      }
      urlEnd += 1;
    }

    if (depth > 0) {
      segments.push({
        type: 'text',
        text: rawText.slice(labelStart),
      });
      break;
    }

    const label = rawText.slice(labelStart + 1, labelEnd).trim();
    const rawSegment = rawText.slice(labelStart, urlEnd);
    const url = sanitizeAutoRunAdUrl(rawText.slice(labelEnd + 2, urlEnd - 1));
    if (label && url) {
      segments.push({
        type: 'link',
        text: label,
        url,
      });
    } else {
      segments.push({
        type: 'text',
        text: rawSegment,
      });
    }
    cursor = urlEnd;
  }

  return segments.filter((segment) => String(segment?.text || '').length > 0);
}

function getAutoRunAdPlainText(segments = []) {
  return segments.map((segment) => String(segment?.text || '')).join('').replace(/\s+/g, ' ').trim();
}

function renderAutoRunAdSegments(container, segments = [], options = {}) {
  if (!container) {
    return;
  }

  const { tabIndex = undefined } = options;
  container.textContent = '';
  for (const segment of Array.isArray(segments) ? segments : []) {
    const text = String(segment?.text || '');
    if (!text) {
      continue;
    }

    if (segment?.type === 'link' && segment?.url) {
      const link = document.createElement('a');
      link.className = 'auto-run-ad-link';
      link.href = segment.url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.dataset.externalUrl = segment.url;
      if (Number.isInteger(tabIndex)) {
        link.tabIndex = tabIndex;
      }
      link.textContent = text;
      container.appendChild(link);
      continue;
    }

    container.appendChild(document.createTextNode(text));
  }
}

function positionContributionUpdateHint() {
  if (!contributionUpdateLayer || !contributionUpdateHint || !btnContributionMode) {
    return;
  }
  if (contributionUpdateLayer.hidden || contributionUpdateHint.hidden) {
    return;
  }

  const buttonRect = btnContributionMode.getBoundingClientRect();
  const viewportWidth = Math.max(document.documentElement?.clientWidth || 0, window.innerWidth || 0);
  const viewportHeight = Math.max(document.documentElement?.clientHeight || 0, window.innerHeight || 0);
  const hintWidth = contributionUpdateHint.offsetWidth || 220;
  const hintHeight = contributionUpdateHint.offsetHeight || 56;
  const viewportPadding = 12;
  const gap = 10;

  const maxLeft = Math.max(viewportPadding, viewportWidth - hintWidth - viewportPadding);
  const left = Math.min(Math.max(viewportPadding, Math.round(buttonRect.left)), maxLeft);
  const shouldPlaceAbove = (buttonRect.bottom + gap + hintHeight) > (viewportHeight - viewportPadding)
    && buttonRect.top > (hintHeight + gap + viewportPadding);
  const top = shouldPlaceAbove
    ? Math.max(viewportPadding, Math.round(buttonRect.top - hintHeight - gap))
    : Math.max(viewportPadding, Math.round(buttonRect.bottom + gap));
  const buttonCenter = Math.round(buttonRect.left + (buttonRect.width / 2));
  const arrowOffset = Math.min(Math.max(16, buttonCenter - left), Math.max(16, hintWidth - 16));

  contributionUpdateHint.style.left = `${left}px`;
  contributionUpdateHint.style.top = `${top}px`;
  contributionUpdateHint.style.setProperty('--contribution-update-arrow-left', `${arrowOffset}px`);
}

function shouldShowContributionUpdateHint(snapshot = currentContributionContentSnapshot) {
  const promptVersion = String(snapshot?.promptVersion || '').trim();
  if (!contributionUpdateLayer || !contributionUpdateHint || !contributionUpdateHintText || !btnContributionMode) {
    return false;
  }
  if (!promptVersion) {
    return false;
  }
  if (!getContributionUpdatePromptLines(snapshot).length) {
    return false;
  }
  if (promptVersion === getDismissedContributionContentPromptVersion(snapshot)) {
    return false;
  }
  if (typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(latestState)
    : Boolean(latestState?.accountContributionEnabled)) {
    return false;
  }
  return !btnContributionMode.disabled;
}

function renderContributionUpdateHint(snapshot = currentContributionContentSnapshot) {
  if (!contributionUpdateLayer || !contributionUpdateHint) {
    return;
  }

  const visible = shouldShowContributionUpdateHint(snapshot);
  contributionUpdateLayer.hidden = !visible;
  contributionUpdateHint.hidden = !visible;
  if (!visible || !contributionUpdateHintText) {
    return;
  }

  contributionUpdateHintText.textContent = getContributionUpdateHintMessage(snapshot);
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => positionContributionUpdateHint());
    return;
  }
  positionContributionUpdateHint();
}

function resetAutoRunAdScrollState() {
  if (!autoRunAdBar || !autoRunAdTrack || !autoRunAdTextClone) {
    return;
  }
  autoRunAdBar.classList.remove('is-scrolling');
  autoRunAdBar.style.removeProperty('--auto-run-ad-gap');
  autoRunAdBar.style.removeProperty('--auto-run-ad-duration');
  autoRunAdBar.style.removeProperty('--auto-run-ad-scroll-distance');
  autoRunAdTextClone.textContent = '';
}

function syncAutoRunAdScrollState() {
  if (!autoRunAdBar || !autoRunAdViewport || !autoRunAdTrack || !autoRunAdText || !autoRunAdTextClone || autoRunAdBar.hidden) {
    resetAutoRunAdScrollState();
    return;
  }

  const text = String(autoRunAdText.textContent || '').trim();
  if (!text) {
    resetAutoRunAdScrollState();
    return;
  }

  const viewportWidth = autoRunAdViewport.clientWidth || 0;
  const textWidth = Math.ceil(autoRunAdText.getBoundingClientRect().width || 0);
  if (!viewportWidth || !textWidth || textWidth <= viewportWidth) {
    resetAutoRunAdScrollState();
    return;
  }

  const scrollGap = 32;
  const scrollDistance = textWidth + scrollGap;
  const durationSeconds = Math.max(18, scrollDistance / 24);
  autoRunAdBar.classList.add('is-scrolling');
  autoRunAdBar.style.setProperty('--auto-run-ad-gap', `${scrollGap}px`);
  autoRunAdBar.style.setProperty('--auto-run-ad-duration', `${durationSeconds.toFixed(2)}s`);
  autoRunAdBar.style.setProperty('--auto-run-ad-scroll-distance', `${scrollDistance}px`);
}

function scheduleAutoRunAdScrollSync() {
  if (autoRunAdScrollSyncFrame && typeof window.cancelAnimationFrame === 'function') {
    window.cancelAnimationFrame(autoRunAdScrollSyncFrame);
    autoRunAdScrollSyncFrame = 0;
  }

  if (typeof window.requestAnimationFrame === 'function') {
    autoRunAdScrollSyncFrame = window.requestAnimationFrame(() => {
      autoRunAdScrollSyncFrame = 0;
      syncAutoRunAdScrollState();
    });
    return;
  }

  syncAutoRunAdScrollState();
}

function renderAutoRunAd(snapshot = currentContributionContentSnapshot) {
  if (!autoRunAdBar || !autoRunAdText || !autoRunAdTextClone) {
    return;
  }

  const config = getAutoRunAdConfig(snapshot);
  const visible = Boolean(config);
  autoRunAdBar.hidden = !visible;
  if (!visible) {
    autoRunAdBar.title = '';
    autoRunAdText.textContent = '';
    autoRunAdTextClone.textContent = '';
    resetAutoRunAdScrollState();
    return;
  }

  const segments = parseAutoRunAdSegments(config.text);
  const plainText = getAutoRunAdPlainText(segments);
  autoRunAdBar.title = plainText || config.text;
  renderAutoRunAdSegments(autoRunAdText, segments);
  renderAutoRunAdSegments(autoRunAdTextClone, segments, { tabIndex: -1 });
  scheduleAutoRunAdScrollSync();
}

function dismissContributionUpdateHint() {
  const promptVersion = String(currentContributionContentSnapshot?.promptVersion || '').trim();
  if (promptVersion) {
    setDismissedContributionContentPromptVersion(promptVersion);
  }
  renderContributionUpdateHint();
}

async function refreshContributionContentHint() {
  if (!contributionContentService?.getContentUpdateSnapshot) {
    currentContributionContentSnapshot = null;
    renderContributionUpdateHint();
    renderAutoRunAd();
    return null;
  }
  if (contributionContentSnapshotRequestInFlight) {
    return contributionContentSnapshotRequestInFlight;
  }

  contributionContentSnapshotRequestInFlight = contributionContentService.getContentUpdateSnapshot({
    flowId: getContributionContentFlowId(),
    targetId: getContributionContentTargetId(),
  })
    .then((snapshot) => {
      currentContributionContentSnapshot = snapshot;
      renderContributionUpdateHint(snapshot);
      renderAutoRunAd(snapshot);
      return snapshot;
    })
    .catch((error) => {
      currentContributionContentSnapshot = null;
      renderContributionUpdateHint(null);
      renderAutoRunAd(null);
      throw error;
    })
    .finally(() => {
      contributionContentSnapshotRequestInFlight = null;
    });

  return contributionContentSnapshotRequestInFlight;
}

function syncPasswordField(state) {
  const accountContributionEnabled = typeof isContributionModeActiveForFlow === 'function'
    ? isContributionModeActiveForFlow(state)
    : Boolean(state?.accountContributionEnabled);
  inputPassword.value = accountContributionEnabled ? '' : (state.customPassword || state.password || '');
}

function isCustomMailProvider(provider = selectMailProvider.value) {
  return String(provider || '').trim().toLowerCase() === 'custom';
}

function isLuckmailProvider(provider = selectMailProvider.value) {
  return String(provider || '').trim().toLowerCase() === LUCKMAIL_PROVIDER;
}

function isYydsMailProvider(provider = selectMailProvider.value) {
  const yydsMailProvider = typeof YYDS_MAIL_PROVIDER === 'string'
    ? YYDS_MAIL_PROVIDER
    : 'yyds-mail';
  return String(provider || '').trim().toLowerCase() === yydsMailProvider;
}

function isIcloudMailProvider(provider = selectMailProvider.value) {
  return String(provider || '').trim().toLowerCase() === ICLOUD_PROVIDER;
}

function normalizeLuckmailBaseUrl(value = '') {
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return DEFAULT_LUCKMAIL_BASE_URL;
  }

  try {
    const parsed = new URL(trimmed);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return DEFAULT_LUCKMAIL_BASE_URL;
    }
    parsed.pathname = parsed.pathname.replace(/\/+$/, '');
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return DEFAULT_LUCKMAIL_BASE_URL;
  }
}

function normalizeLuckmailEmailType(value = '') {
  const normalized = String(value || '').trim().toLowerCase();
  return ['self_built', 'ms_imap', 'ms_graph', 'google_variant'].includes(normalized)
    ? normalized
    : DEFAULT_LUCKMAIL_EMAIL_TYPE;
}

function normalizeYydsMailBaseUrl(value = '') {
  if (window.YydsMailUtils?.normalizeYydsMailBaseUrl) {
    return window.YydsMailUtils.normalizeYydsMailBaseUrl(value);
  }
  const trimmed = String(value || '').trim();
  if (!trimmed) {
    return DEFAULT_YYDS_MAIL_BASE_URL;
  }
  const candidate = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(candidate);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return DEFAULT_YYDS_MAIL_BASE_URL;
    }
    parsed.hash = '';
    parsed.search = '';
    parsed.pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '');
    return `${parsed.origin}${parsed.pathname}` || DEFAULT_YYDS_MAIL_BASE_URL;
  } catch {
    return DEFAULT_YYDS_MAIL_BASE_URL;
  }
}

function getSelectedEmailGenerator() {
  const generator = String(selectEmailGenerator.value || '').trim().toLowerCase();
  if (generator === 'custom' || generator === 'manual') {
    return 'custom';
  }
  if (generator === GMAIL_ALIAS_GENERATOR) {
    return GMAIL_ALIAS_GENERATOR;
  }
  if (generator === CUSTOM_EMAIL_POOL_GENERATOR) {
    return CUSTOM_EMAIL_POOL_GENERATOR;
  }
  if (generator === 'icloud') {
    return 'icloud';
  }
  if (generator === 'cloudflare') return 'cloudflare';
  if (generator === 'cloudflare-temp-email') return 'cloudflare-temp-email';
  if (generator === 'cloudmail') return 'cloudmail';
  return 'duck';
}

function getEmailGeneratorUiCopy() {
  if (getSelectedEmailGenerator() === 'custom') {
    return getCustomMailProviderUiCopy();
  }
  if (getSelectedEmailGenerator() === GMAIL_ALIAS_GENERATOR) {
    return {
      buttonLabel: '生成',
      placeholder: '步骤 3 自动生成 Gmail +tag 邮箱并回填',
      successVerb: '生成',
      label: 'Gmail +tag 邮箱',
    };
  }
  if (getSelectedEmailGenerator() === CUSTOM_EMAIL_POOL_GENERATOR) {
    return {
      buttonLabel: '取下一个',
      placeholder: '按邮箱池顺序自动回填，也可以手动粘贴当前轮邮箱',
      successVerb: '取用',
      label: '自定义邮箱池',
    };
  }
  if (getSelectedEmailGenerator() === 'icloud') {
    return {
      buttonLabel: '获取',
      placeholder: '点击获取 iCloud 隐私邮箱，或手动粘贴邮箱',
      successVerb: '获取',
      label: 'iCloud 隐私邮箱',
    };
  }
  if (getSelectedEmailGenerator() === 'cloudflare') {
    return {
      buttonLabel: '生成',
      placeholder: '点击生成 Cloudflare 邮箱，或手动粘贴邮箱',
      successVerb: '生成',
      label: 'Cloudflare 邮箱',
    };
  }
  if (getSelectedEmailGenerator() === 'cloudflare-temp-email') {
    return {
      buttonLabel: '生成 Temp',
      placeholder: '点击生成 Cloudflare Temp Email，或手动粘贴邮箱',
      successVerb: '生成',
      label: 'Cloudflare Temp Email',
    };
  }
  if (getSelectedEmailGenerator() === 'cloudmail') {
    return {
      buttonLabel: '生成',
      placeholder: '点击生成 Cloud Mail 邮箱，或手动粘贴邮箱',
      successVerb: '生成',
      label: 'Cloud Mail',
    };
  }

  return {
    buttonLabel: '获取',
    placeholder: '点击获取 DuckDuckGo 邮箱，或手动粘贴邮箱',
    successVerb: '获取',
    label: 'Duck 邮箱',
  };
}

function getCustomMailProviderUiCopy() {
  if (usesCustomMailProviderPool()) {
    return {
      buttonLabel: '自定义邮箱',
      placeholder: '号池会按顺序自动回填，也可以手动覆盖当前轮邮箱',
      successVerb: '使用',
      label: '自定义邮箱',
    };
  }
  return {
    buttonLabel: '自定义邮箱',
    placeholder: '请填写本轮要使用的注册邮箱',
    successVerb: '使用',
    label: '自定义邮箱',
  };
}

function getCustomVerificationPromptCopy(step) {
  const verificationLabel = step === 4 ? '注册验证码' : '登录验证码';
  const isLoginVerificationStep = step === 8 || step === 11;
  return {
    title: `手动处理${verificationLabel}`,
    message: `当前邮箱服务为“自定义邮箱”。请先在页面中手动输入${verificationLabel}，并确认已经进入下一页面后，再点击确认。`,
    alert: {
      text: `点击确认后会跳过步骤 ${step}。`,
      tone: 'danger',
    },
    ...(isLoginVerificationStep ? {
      phoneActionLabel: '出现手机号验证',
      phoneActionAlert: {
        text: '如果当前页面已经进入手机号验证，可直接标记为失败并继续下一个邮箱。',
        tone: 'danger',
      },
    } : {}),
  };
}

function normalizeGoPayOtpInputValue(value = '') {
  return window.GoPayUtils?.normalizeGoPayOtp
    ? window.GoPayUtils.normalizeGoPayOtp(value)
    : String(value || '').trim().replace(/[^\d]/g, '');
}

async function openGoPayOtpInputDialog(payload = {}) {
  if (!sharedFormDialog?.open) {
    throw new Error('验证码输入弹窗未加载，请刷新扩展后重试。');
  }

  const initialCode = normalizeGoPayOtpInputValue(payload.code || inputGoPayOtp?.value || latestState?.gopayOtp || '');
  const result = await sharedFormDialog.open({
    title: '输入 GoPay 验证码',
    message: '请把当前 GoPay 页面收到的验证码填到这里，确认后插件会继续填写验证码并进入 PIN 步骤。',
    confirmLabel: '提交验证码',
    confirmVariant: 'btn-primary',
    fields: [
      {
        key: 'code',
        label: '验证码',
        type: 'text',
        required: true,
        requiredMessage: '请输入 GoPay 验证码。',
        placeholder: '请输入数字验证码',
        inputMode: 'numeric',
        autocomplete: 'one-time-code',
        value: initialCode,
        validate: (value) => {
          const normalized = normalizeGoPayOtpInputValue(value);
          if (!normalized) return '请输入 GoPay 验证码。';
          if (normalized.length < 4) return 'GoPay 验证码长度过短，请检查。';
          return '';
        },
      },
    ],
  });
  const code = normalizeGoPayOtpInputValue(result?.code || '');
  if (!code) {
    return { cancelled: true, code: '' };
  }
  if (inputGoPayOtp) {
    inputGoPayOtp.value = code;
  }
  syncLatestState({ gopayOtp: code });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
  return { code };
}

async function openCustomVerificationConfirmDialog(step) {
  const promptCopy = getCustomVerificationPromptCopy(step);
  if (step === 8 || step === 11) {
    return openActionModal({
      title: promptCopy.title,
      message: promptCopy.message,
      alert: promptCopy.alert,
      actions: [
        { id: null, label: '取消', variant: 'btn-ghost' },
        { id: 'add_phone', label: promptCopy.phoneActionLabel || '出现手机号验证', variant: 'btn-outline' },
        { id: 'confirm', label: '确认跳过', variant: 'btn-danger' },
      ],
      buildResult: (choice) => ({
        confirmed: choice === 'confirm',
        addPhoneDetected: choice === 'add_phone',
      }),
    });
  }

  const confirmed = await openConfirmModal({
    title: promptCopy.title,
    message: promptCopy.message,
    confirmLabel: '确认跳过',
    confirmVariant: 'btn-danger',
    alert: promptCopy.alert,
  });
  return { confirmed, addPhoneDetected: false };
}

function getHotmailAccounts(state = latestState) {
  return Array.isArray(state?.hotmailAccounts) ? state.hotmailAccounts : [];
}

function getCurrentHotmailAccount(state = latestState) {
  const currentId = state?.currentHotmailAccountId;
  return getHotmailAccounts(state).find((account) => account.id === currentId) || null;
}

function getCurrentHotmailEmail(state = latestState) {
  return String(getCurrentHotmailAccount(state)?.email || '').trim();
}

function getMail2925Accounts(state = latestState) {
  return Array.isArray(state?.mail2925Accounts) ? state.mail2925Accounts : [];
}

function getCurrentMail2925Account(state = latestState) {
  const currentId = state?.currentMail2925AccountId;
  return getMail2925Accounts(state).find((account) => account.id === currentId) || null;
}

function getCurrentMail2925Email(state = latestState) {
  return String(getCurrentMail2925Account(state)?.email || '').trim();
}

function getPayPalAccounts(state = latestState) {
  return Array.isArray(state?.paypalAccounts) ? state.paypalAccounts : [];
}

function getCurrentPayPalAccount(state = latestState) {
  const currentId = String(state?.currentPayPalAccountId || '').trim();
  return getPayPalAccounts(state).find((account) => account.id === currentId) || null;
}

function getPayPalGeneratedProfile(state = latestState) {
  const profile = state?.paypalGeneratedProfile;
  return profile && typeof profile === 'object' && !Array.isArray(profile) ? profile : null;
}

function syncMail2925BaseEmailFromCurrentAccount(state = latestState, options = {}) {
  const { persist = false } = options;
  if (!isMail2925AccountPoolEnabled(state)) {
    return false;
  }

  const currentEmail = getCurrentMail2925Email(state);
  if (!currentEmail || currentEmail === String(state?.mail2925BaseEmail || '').trim()) {
    return false;
  }

  syncLatestState({ mail2925BaseEmail: currentEmail });
  if (persist) {
    saveSettings({ silent: true }).catch(() => { });
  }
  return true;
}

function getCurrentLuckmailPurchase(state = latestState) {
  return state?.currentLuckmailPurchase || null;
}

function getCurrentLuckmailEmail(state = latestState) {
  return String(getCurrentLuckmailPurchase(state)?.email_address || '').trim();
}

function getLuckmailUsedPurchases(state = latestState) {
  const rawValue = state?.luckmailUsedPurchases;
  if (!rawValue || typeof rawValue !== 'object' || Array.isArray(rawValue)) {
    return {};
  }

  return Object.entries(rawValue).reduce((result, [key, value]) => {
    const numeric = Number(key);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return result;
    }
    result[String(Math.floor(numeric))] = Boolean(value);
    return result;
  }, {});
}

function normalizeLuckmailProjectName(value = '') {
  return String(value || '').trim().toLowerCase();
}

function getLuckmailPreserveTagName(state = latestState) {
  return String(state?.luckmailPreserveTagName || '').trim() || DEFAULT_LUCKMAIL_PRESERVE_TAG_NAME;
}

function formatLuckmailDateTime(value) {
  const timestamp = normalizeLuckmailTimestampValue(value);
  if (!timestamp) {
    return String(value || '').trim() || '未知';
  }
  return new Date(timestamp).toLocaleString('zh-CN', {
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
  });
}

function getMailProviderLoginConfig(provider = selectMailProvider.value) {
  return MAIL_PROVIDER_LOGIN_CONFIGS[String(provider || '').trim()] || null;
}

function getSelectedIcloudHostPreference() {
  return normalizeIcloudHost(selectIcloudHostPreference?.value || latestState?.icloudHostPreference || '')
    || normalizeIcloudHost(latestState?.preferredIcloudHost)
    || 'icloud.com';
}

function getMailProviderLoginUrl(provider = selectMailProvider.value) {
  const config = getMailProviderLoginConfig(provider);
  if (String(provider || '').trim() === ICLOUD_PROVIDER) {
    return getIcloudLoginUrlForHost(getSelectedIcloudHostPreference());
  }
  const url = String(config?.url || '').trim();
  return url ? url : '';
}

function getIpProxyServiceLoginConfig(service = selectIpProxyService?.value || latestState?.ipProxyService || DEFAULT_IP_PROXY_SERVICE) {
  return IP_PROXY_SERVICE_LOGIN_CONFIGS[String(service || '').trim()] || null;
}

function getIpProxyServiceLoginUrl(service = selectIpProxyService?.value || latestState?.ipProxyService || DEFAULT_IP_PROXY_SERVICE) {
  const config = getIpProxyServiceLoginConfig(service);
  const url = String(config?.url || '').trim();
  return url ? url : '';
}

function isCurrentEmailManagedByHotmail(state = latestState) {
  const hotmailEmail = getCurrentHotmailEmail(state);
  if (!hotmailEmail) {
    return false;
  }

  const inputEmailValue = String(inputEmail.value || '').trim();
  const stateEmailValue = String(state?.email || '').trim();
  return inputEmailValue === hotmailEmail || stateEmailValue === hotmailEmail;
}

function isCurrentEmailManagedByLuckmail(state = latestState) {
  const luckmailEmail = getCurrentLuckmailEmail(state);
  if (!luckmailEmail) {
    return false;
  }

  const inputEmailValue = String(inputEmail.value || '').trim();
  const stateEmailValue = String(state?.email || '').trim();
  return inputEmailValue === luckmailEmail || stateEmailValue === luckmailEmail;
}

function isCurrentEmailManagedByGeneratedAlias(
  provider = latestState?.mailProvider,
  state = latestState,
  mail2925Mode = latestState?.mail2925Mode
) {
  const normalizedProvider = String(provider || '').trim();
  if (!usesGeneratedAliasMailProvider(normalizedProvider, mail2925Mode)) {
    return false;
  }

  const inputEmailValue = String(inputEmail.value || '').trim().toLowerCase();
  const stateEmailValue = String(state?.email || '').trim().toLowerCase();
  const baseEmail = getManagedAliasBaseEmailForProvider(normalizedProvider, state);
  return isManagedAliasEmail(inputEmailValue, baseEmail, normalizedProvider)
    || isManagedAliasEmail(stateEmailValue, baseEmail, normalizedProvider);
}

async function maybeClearGeneratedAliasAfterEmailPrefixChange() {
  const provider = selectMailProvider.value;
  if (!usesGeneratedAliasMailProvider(provider, latestState?.mail2925Mode)) {
    return;
  }

  const previousPrefix = getManagedAliasBaseEmailForProvider(provider, latestState);
  const nextPrefix = inputEmailPrefix.value.trim();
  if (previousPrefix === nextPrefix) {
    return;
  }

  if (!previousPrefix) {
    return;
  }

  if (!isCurrentEmailManagedByGeneratedAlias(provider, latestState, latestState?.mail2925Mode)) {
    return;
  }

  await clearRegistrationEmail({ silent: true });
}

function updateMailLoginButtonState() {
  if (!btnMailLogin) {
    return;
  }

  const config = getMailProviderLoginConfig();
  const loginUrl = getMailProviderLoginUrl();
  btnMailLogin.disabled = !loginUrl;
  btnMailLogin.textContent = config?.buttonLabel || '登录';
  btnMailLogin.title = loginUrl ? `打开 ${config.label} 登录页` : '当前邮箱服务没有可跳转的登录页';
}

function updateIpProxyServiceLoginButtonState(options = {}) {
  if (!btnIpProxyServiceLogin) {
    return;
  }
  const service = normalizeIpProxyService(
    options?.service
    || selectIpProxyService?.value
    || latestState?.ipProxyService
    || DEFAULT_IP_PROXY_SERVICE
  );
  const loginConfig = getIpProxyServiceLoginConfig(service);
  const loginUrl = getIpProxyServiceLoginUrl(service);
  const enabled = options?.enabled !== undefined
    ? Boolean(options.enabled)
    : Boolean(getSelectedIpProxyEnabled());
  btnIpProxyServiceLogin.disabled = !enabled || !loginUrl;
  const buttonLabel = loginConfig?.buttonLabel || '登录';
  btnIpProxyServiceLogin.textContent = buttonLabel;
  btnIpProxyServiceLogin.title = loginUrl
    ? `打开 ${loginConfig?.label || service} ${buttonLabel}页`
    : '当前代理服务没有可跳转的登录页';
}

const hostedSmsPoolManager = window.SidepanelHostedSmsPoolManager?.createHostedSmsPoolManager({
  dom: {
    btnHostedSmsPoolRefresh,
    btnHostedSmsPoolExport,
    btnHostedSmsPoolClearUsed,
    btnHostedSmsPoolDeleteAll,
    inputHostedSmsPoolImport,
    btnHostedSmsPoolImportFile,
    inputHostedSmsPoolImportFile,
    btnHostedSmsPoolImport,
    hostedSmsPoolSummary,
    inputHostedSmsPoolSearch,
    selectHostedSmsPoolFilter,
    hostedSmsPoolList,
  },
  helpers: {
    copyTextToClipboard,
    downloadTextFile,
    escapeHtml,
    openConfirmModal,
    showToast,
  },
  state: {
    getText: () => normalizeHostedCheckoutSmsPoolTextValue(inputHostedCheckoutSmsPool?.value || latestState?.hostedCheckoutSmsPoolText || ''),
    setText: (text) => {
      const normalized = normalizeHostedCheckoutSmsPoolTextValue(text);
      if (inputHostedCheckoutSmsPool) {
        inputHostedCheckoutSmsPool.value = normalized;
      }
      syncLatestState({ hostedCheckoutSmsPoolText: normalized });
      validateHostedCheckoutContactConfig();
    },
    getUsage: () => latestState?.hostedCheckoutSmsPoolUsage || {},
    setUsage: (usage) => {
      syncLatestState({ hostedCheckoutSmsPoolUsage: usage && typeof usage === 'object' ? usage : {} });
    },
    getMaxUses: () => normalizeHostedCheckoutSmsPoolMaxUsesValue(
      inputHostedCheckoutSmsPoolMaxUses?.value || latestState?.hostedCheckoutSmsPoolMaxUses,
      DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES
    ),
    getCurrentEntry: () => latestState?.hostedCheckoutCurrentSmsEntry || null,
    setCurrentEntry: (entry) => {
      syncLatestState({
        hostedCheckoutCurrentSmsEntry: normalizeHostedCheckoutCurrentSmsEntryValue(
          entry,
          parseHostedCheckoutSmsPoolEntries(inputHostedCheckoutSmsPool?.value || latestState?.hostedCheckoutSmsPoolText || '')
        ),
      });
    },
    isVisible: () => Boolean(rowHostedCheckoutSmsPool) && rowHostedCheckoutSmsPool.style.display !== 'none',
  },
  actions: {
    persistPool: async () => {
      markSettingsDirty(true);
      await saveSettings({ silent: true });
    },
  },
  constants: {
    copyIcon: COPY_ICON,
  },
});
const queueHostedSmsPoolRefresh = hostedSmsPoolManager?.queueRefresh || (() => {});
const refreshHostedSmsPool = hostedSmsPoolManager?.refresh || (() => {});
const renderHostedSmsPool = hostedSmsPoolManager?.render || (() => {});
const resetHostedSmsPoolManager = hostedSmsPoolManager?.reset || (() => {});
const bindHostedSmsPoolEvents = hostedSmsPoolManager?.bindEvents || (() => {});
bindHostedSmsPoolEvents();

const chatGptApiSmsPoolManager = window.SidepanelHostedSmsPoolManager?.createHostedSmsPoolManager({
  dom: {
    btnHostedSmsPoolRefresh: btnChatGptApiSmsPoolRefresh,
    btnHostedSmsPoolClearUsed: btnChatGptApiSmsPoolClearUsed,
    btnHostedSmsPoolDeleteAll: btnChatGptApiSmsPoolDeleteAll,
    inputHostedSmsPoolImport: inputChatGptApiSmsPoolImport,
    btnHostedSmsPoolImport: btnChatGptApiSmsPoolImport,
    hostedSmsPoolSummary: chatGptApiSmsPoolSummary,
    inputHostedSmsPoolSearch: inputChatGptApiSmsPoolSearch,
    selectHostedSmsPoolFilter: selectChatGptApiSmsPoolFilter,
    hostedSmsPoolList: chatGptApiSmsPoolList,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    openConfirmModal,
    showToast,
  },
  state: {
    getText: () => normalizeHostedCheckoutSmsPoolTextValue(inputChatGptApiSmsPool?.value || latestState?.chatGptApiSmsPoolText || ''),
    setText: (text) => {
      const normalized = normalizeHostedCheckoutSmsPoolTextValue(text);
      if (inputChatGptApiSmsPool) {
        inputChatGptApiSmsPool.value = normalized;
      }
      syncLatestState({ chatGptApiSmsPoolText: normalized });
    },
    getUsage: () => latestState?.chatGptApiSmsPoolUsage || {},
    setUsage: (usage) => {
      syncLatestState({ chatGptApiSmsPoolUsage: usage && typeof usage === 'object' ? usage : {} });
    },
    getCurrentEntry: () => latestState?.chatGptApiCurrentSmsEntry || null,
    setCurrentEntry: (entry) => {
      syncLatestState({
        chatGptApiCurrentSmsEntry: normalizeHostedCheckoutCurrentSmsEntryValue(
          entry,
          parseHostedCheckoutSmsPoolEntries(inputChatGptApiSmsPool?.value || latestState?.chatGptApiSmsPoolText || '')
        ),
      });
    },
    isVisible: () => Boolean(rowChatGptApiSmsPool) && rowChatGptApiSmsPool.style.display !== 'none',
  },
  actions: {
    persistPool: async () => {
      markSettingsDirty(true);
      await saveSettings({ silent: true });
    },
  },
  constants: {
    copyIcon: COPY_ICON,
  },
  labels: {
    poolLabel: 'ChatGPT API 接码池',
    importSubject: 'ChatGPT API 接码号码',
    localPhonePrefix: '填入',
    emptySummary: '导入 ChatGPT API 接码号码，每行一个号码和验证码接口。',
    emptyListText: '还没有 ChatGPT API 接码号码，先导入一批号码再开始。',
    refreshLoadingText: '正在刷新 ChatGPT API 接码池...',
    updateLoadingText: '正在更新 ChatGPT API 接码池...',
    updateFailedPrefix: '更新 ChatGPT API 接码池失败',
    importEmptyWarning: '请先粘贴 ChatGPT API 接码号码，每行一个号码和验证码接口。',
    deleteTitle: '删除 ChatGPT API 接码号码',
    clearUsageMessage: '确认清空 ChatGPT API 接码池的使用次数吗？号码本身会保留。',
    deleteAllTitle: '删除 ChatGPT API 接码池',
    deleteAllMessage: '确认删除当前全部 ChatGPT API 接码号码吗？此操作不可撤销。',
  },
  normalizers: {
    normalizePhone: (value = '') => String(value || '').trim().replace(/\D+/g, '') || String(value || '').trim(),
    formatLocalPhone: (value = '') => String(value || '').trim().replace(/\D+/g, '') || String(value || '').trim(),
  },
});
const queueChatGptApiSmsPoolRefresh = chatGptApiSmsPoolManager?.queueRefresh || (() => {});
const resetChatGptApiSmsPoolManager = chatGptApiSmsPoolManager?.reset || (() => {});
const bindChatGptApiSmsPoolEvents = chatGptApiSmsPoolManager?.bindEvents || (() => {});
bindChatGptApiSmsPoolEvents();

function updateHostedSmsPoolCollapseUI(expanded = hostedSmsPoolExpanded) {
  hostedSmsPoolExpanded = Boolean(expanded);
  if (btnToggleHostedSmsPool) {
    btnToggleHostedSmsPool.textContent = hostedSmsPoolExpanded ? '收起' : '展开';
    btnToggleHostedSmsPool.setAttribute('aria-expanded', String(hostedSmsPoolExpanded));
  }
  if (hostedSmsPoolShell) {
    hostedSmsPoolShell.hidden = !hostedSmsPoolExpanded;
    hostedSmsPoolShell.classList.toggle('is-expanded', hostedSmsPoolExpanded);
    hostedSmsPoolShell.classList.toggle('is-collapsed', !hostedSmsPoolExpanded);
  }
  if (hostedSmsPoolExpanded) {
    queueHostedSmsPoolRefresh();
  }
}

btnToggleHostedSmsPool?.addEventListener('click', () => {
  updateHostedSmsPoolCollapseUI(!hostedSmsPoolExpanded);
});

function updateChatGptApiSmsPoolCollapseUI(expanded = chatGptApiSmsPoolExpanded) {
  chatGptApiSmsPoolExpanded = Boolean(expanded);
  if (btnToggleChatGptApiSmsPool) {
    btnToggleChatGptApiSmsPool.textContent = chatGptApiSmsPoolExpanded ? '收起' : '展开';
    btnToggleChatGptApiSmsPool.setAttribute('aria-expanded', String(chatGptApiSmsPoolExpanded));
  }
  if (chatGptApiSmsPoolShell) {
    chatGptApiSmsPoolShell.hidden = !chatGptApiSmsPoolExpanded;
    chatGptApiSmsPoolShell.classList.toggle('is-expanded', chatGptApiSmsPoolExpanded);
    chatGptApiSmsPoolShell.classList.toggle('is-collapsed', !chatGptApiSmsPoolExpanded);
  }
  if (chatGptApiSmsPoolExpanded) {
    queueChatGptApiSmsPoolRefresh();
  }
}

btnToggleChatGptApiSmsPool?.addEventListener('click', () => {
  updateChatGptApiSmsPoolCollapseUI(!chatGptApiSmsPoolExpanded);
});

function validateHostedCheckoutContactConfig(options = {}) {
  const paymentMethod = typeof getSelectedPlusPaymentMethod === 'function'
    ? getSelectedPlusPaymentMethod(latestState)
    : 'paypal';
  const plusModeEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  const poolText = normalizeHostedCheckoutSmsPoolTextValue(inputHostedCheckoutSmsPool?.value || latestState?.hostedCheckoutSmsPoolText || '');
  const phone = normalizeHostedCheckoutPhoneValue(inputHostedCheckoutPhone?.value || latestState?.hostedCheckoutPhoneNumber || '');
  const verificationUrl = normalizeHostedCheckoutVerificationUrlValue(inputHostedCheckoutVerificationUrl?.value || latestState?.hostedCheckoutVerificationUrl || '');
  const smsSource = normalizeHostedCheckoutSmsSourceValue(
    selectHostedCheckoutSmsSource?.value || latestState?.hostedCheckoutSmsSource
  );
  const required = plusModeEnabled
    && paymentMethod === 'paypal'
    && smsSource === HOSTED_CHECKOUT_SMS_SOURCE_FIXED_POOL
    && !poolText;
  const missingPhone = required && !phone;
  const missingVerificationUrl = required && !verificationUrl;
  const valid = !missingPhone && !missingVerificationUrl;
  const message = (() => {
    if (!required || valid) {
      return '';
    }
    if (missingPhone && missingVerificationUrl) {
      return '当前 PayPal 接码池为空，请先填写 PayPal 电话(不带+1) 和 验证码接口，或导入 PayPal 接码池。';
    }
    if (missingPhone) {
      return '当前 PayPal 接码池为空，请先填写 PayPal 电话(不带+1)，或导入 PayPal 接码池。';
    }
    return '当前 PayPal 接码池为空，请先填写验证码接口，或导入 PayPal 接码池。';
  })();

  if (inputHostedCheckoutPhone) {
    inputHostedCheckoutPhone.classList.toggle('is-invalid', missingPhone);
    inputHostedCheckoutPhone.title = missingPhone ? message : '';
  }
  if (inputHostedCheckoutVerificationUrl) {
    inputHostedCheckoutVerificationUrl.classList.toggle('is-invalid', missingVerificationUrl);
    inputHostedCheckoutVerificationUrl.title = missingVerificationUrl ? message : '';
  }

  if (options.focusOnError && !valid) {
    if (missingPhone) {
      inputHostedCheckoutPhone?.focus?.();
    } else if (missingVerificationUrl) {
      inputHostedCheckoutVerificationUrl?.focus?.();
    }
  }

  return {
    valid,
    required,
    missingPhone,
    missingVerificationUrl,
    message,
  };
}

function syncHostedCheckoutVerificationPopupDelayInput() {
  if (!inputHostedCheckoutVerificationPopupDelaySeconds) {
    return;
  }
  inputHostedCheckoutVerificationPopupDelaySeconds.value = String(
    normalizeHostedCheckoutVerificationPopupDelaySeconds(inputHostedCheckoutVerificationPopupDelaySeconds.value)
  );
}

async function handleHostedCheckoutManualFetch() {
  if (!btnHostedCheckoutManualFetch) {
    return;
  }

  const normalizedVerificationUrl = normalizeHostedCheckoutVerificationUrlValue(inputHostedCheckoutVerificationUrl?.value || '');
  if (inputHostedCheckoutVerificationUrl) {
    inputHostedCheckoutVerificationUrl.value = normalizedVerificationUrl;
  }

  const previousLabel = btnHostedCheckoutManualFetch.textContent;
  btnHostedCheckoutManualFetch.disabled = true;
  btnHostedCheckoutManualFetch.textContent = '获取中...';
  setHostedCheckoutManualCodeDisplay('获取中...');

  try {
    const response = await sendRuntimeMessageWithTimeout({
      type: 'FETCH_HOSTED_CHECKOUT_VERIFICATION_CODE',
      source: 'sidepanel',
      payload: {
        verificationUrl: normalizedVerificationUrl,
      },
    }, 20000, '手动获取验证码');
    if (response?.error) {
      throw new Error(response.error);
    }
    const code = String(response?.code || '').trim();
    if (!code) {
      throw new Error('未返回有效验证码。');
    }
    setHostedCheckoutManualCodeDisplay(code, response?.verificationUrl || normalizedVerificationUrl);
    showToast('已获取 hosted checkout 验证码。', 'success', 2500);
  } catch (error) {
    const message = error?.message || String(error || '手动获取验证码失败');
    setHostedCheckoutManualCodeDisplay('获取失败', message);
    showToast(message, 'error');
  } finally {
    btnHostedCheckoutManualFetch.disabled = false;
    btnHostedCheckoutManualFetch.textContent = previousLabel || '手动获取验证码';
  }
}

function updateMailProviderUI() {
  const normalizeIcloudHostValue = typeof normalizeIcloudHost === 'function'
    ? normalizeIcloudHost
    : ((value) => {
      const normalized = String(value || '').trim().toLowerCase();
      return normalized === 'icloud.com' || normalized === 'icloud.com.cn' ? normalized : '';
    });
  const icloudTargetMailboxTypeValue = typeof selectIcloudTargetMailboxType !== 'undefined'
    ? selectIcloudTargetMailboxType?.value
    : latestState?.icloudTargetMailboxType;
  const icloudForwardMailProviderValue = typeof selectIcloudForwardMailProvider !== 'undefined'
    ? selectIcloudForwardMailProvider?.value
    : latestState?.icloudForwardMailProvider;
  const icloudHostPreferenceValue = typeof selectIcloudHostPreference !== 'undefined'
    ? selectIcloudHostPreference?.value
    : latestState?.icloudHostPreference;
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode,
      state: latestState || {},
    })
    : null;
  const canShowLuckmail = capabilityState
    ? Boolean(capabilityState.canShowLuckmail)
    : true;
  const mailProviderOptions = Array.from(selectMailProvider?.options || []);
  mailProviderOptions.forEach((option) => {
    if (!option) {
      return;
    }
    if (String(option.value || '').trim().toLowerCase() === 'luckmail-api') {
      option.hidden = !canShowLuckmail;
    }
  });
  if (!canShowLuckmail && String(selectMailProvider?.value || '').trim().toLowerCase() === 'luckmail-api') {
    const fallbackOption = mailProviderOptions.find((option) => option && !option.hidden);
    if (fallbackOption) {
      selectMailProvider.value = String(fallbackOption.value || '').trim();
    }
  }
  const use2925 = selectMailProvider.value === '2925';
  const useGmail = selectMailProvider.value === GMAIL_PROVIDER;
  const useMail2925 = selectMailProvider.value === '2925';
  const useMail2925AccountPool = useMail2925 && Boolean(inputMail2925UseAccountPool?.checked);
  const mail2925Mode = getSelectedMail2925Mode();
  const gmailAliasGenerator = typeof GMAIL_ALIAS_GENERATOR === 'string'
    ? GMAIL_ALIAS_GENERATOR
    : 'gmail-alias';
  const customEmailPoolGenerator = typeof CUSTOM_EMAIL_POOL_GENERATOR === 'string'
    ? CUSTOM_EMAIL_POOL_GENERATOR
    : 'custom-pool';
  const gmailOnlyGenerators = new Set([gmailAliasGenerator, customEmailPoolGenerator]);
  Array.from(selectEmailGenerator?.options || []).forEach((option) => {
    if (!option) return;
    if (useGmail) {
      option.hidden = !gmailOnlyGenerators.has(String(option.value || '').trim().toLowerCase());
      return;
    }
    option.hidden = String(option.value || '').trim().toLowerCase() === gmailAliasGenerator;
  });
  if (useGmail && !gmailOnlyGenerators.has(String(selectEmailGenerator.value || '').trim().toLowerCase())) {
    selectEmailGenerator.value = gmailAliasGenerator;
  }
  if (!useGmail && String(selectEmailGenerator.value || '').trim().toLowerCase() === gmailAliasGenerator) {
    selectEmailGenerator.value = 'duck';
  }
  const selectedGenerator = getSelectedEmailGenerator();
  const useGeneratedAlias = usesGeneratedAliasMailProvider(selectMailProvider.value, mail2925Mode, selectedGenerator);
  const useInbucket = selectMailProvider.value === 'inbucket';
  const useHotmail = selectMailProvider.value === 'hotmail-api';
  const useLuckmail = canShowLuckmail && isLuckmailProvider();
  const useYydsMail = typeof isYydsMailProvider === 'function'
    ? isYydsMailProvider()
    : String(selectMailProvider.value || '').trim().toLowerCase() === 'yyds-mail';
  const useCustomEmail = isCustomMailProvider();
  const useCustomMailProviderPool = useCustomEmail && usesCustomMailProviderPool(selectMailProvider.value);
  const useIcloudProvider = isIcloudMailProvider();
  const useEmailGenerator = !useHotmail && !useLuckmail && !useYydsMail && !useCustomEmail && (!useGeneratedAlias || useGmail);
  const useCloudflareTempEmailProvider = selectMailProvider.value === 'cloudflare-temp-email';
  const useCloudMailProvider = selectMailProvider.value === 'cloudmail';
  const aliasUiCopy = useGeneratedAlias
    ? getManagedAliasProviderUiCopy(selectMailProvider.value, mail2925Mode)
    : null;
  const uiCopy = getCurrentRegistrationEmailUiCopy();
  updateMailLoginButtonState();
  if (rowMail2925Mode) {
    rowMail2925Mode.style.display = use2925 ? '' : 'none';
  }
  if (rowMail2925PoolSettings) {
    rowMail2925PoolSettings.style.display = useMail2925 ? '' : 'none';
  }
  if (typeof rowCustomMailProviderPool !== 'undefined' && rowCustomMailProviderPool) {
    rowCustomMailProviderPool.style.display = useCustomEmail ? '' : 'none';
  }
  rowEmailPrefix.style.display = useGeneratedAlias && !useMail2925AccountPool ? '' : 'none';
  const hotmailServiceMode = getSelectedHotmailServiceMode();
  rowInbucketHost.style.display = useInbucket ? '' : 'none';
  rowInbucketMailbox.style.display = useInbucket ? '' : 'none';
  const useCustomEmailPool = useEmailGenerator && selectedGenerator === customEmailPoolGenerator;
  const useCloudflare = selectedGenerator === 'cloudflare';
  const useIcloud = selectedGenerator === 'icloud';
  const useCloudflareTempEmailGenerator = selectedGenerator === 'cloudflare-temp-email';
  const useCloudMailGenerator = selectedGenerator === 'cloudmail';
  const showCloudflareDomain = useEmailGenerator && useCloudflare;
  const showCloudflareTempEmailSettings = useCloudflareTempEmailProvider || (useEmailGenerator && useCloudflareTempEmailGenerator);
  const showCloudflareTempEmailLookupMode = useCloudflareTempEmailProvider && !useCloudflareTempEmailGenerator;
  const selectedCloudflareTempEmailLookupMode = typeof getSelectedCloudflareTempEmailLookupMode === 'function'
    ? getSelectedCloudflareTempEmailLookupMode()
    : 'receive-mailbox';
  const cloudflareTempEmailRegistrationLookupMode = typeof CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL === 'string'
    ? CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL
    : 'registration-email';
  const useCloudflareTempEmailRegistrationLookup = showCloudflareTempEmailLookupMode
    && selectedCloudflareTempEmailLookupMode === cloudflareTempEmailRegistrationLookupMode;
  const showCloudflareTempEmailReceiveMailbox = showCloudflareTempEmailLookupMode
    && !useCloudflareTempEmailRegistrationLookup;
  const showCloudMailSettings = useCloudMailProvider || (useEmailGenerator && useCloudMailGenerator);
  const showCloudMailReceiveMailbox = useCloudMailProvider && !useCloudMailGenerator;
  const showCloudMailDomain = useEmailGenerator && useCloudMailGenerator;
  const selectedIcloudHost = typeof getSelectedIcloudHostPreference === 'function'
    ? getSelectedIcloudHostPreference()
    : (normalizeIcloudHostValue(icloudHostPreferenceValue || latestState?.icloudHostPreference || '')
      || normalizeIcloudHostValue(latestState?.preferredIcloudHost)
      || 'icloud.com');
  const icloudTargetMailboxType = normalizeIcloudTargetMailboxType(icloudTargetMailboxTypeValue);
  const isIcloudComCnHost = selectedIcloudHost === 'icloud.com.cn';
  const showIcloudTargetMailboxType = useIcloudProvider;
  const showIcloudForwardMailProvider = useIcloudProvider && icloudTargetMailboxType === 'forward-mailbox';
  const showCloudflareTempEmailRandomSubdomainToggle = useEmailGenerator && useCloudflareTempEmailGenerator;
  const showCloudflareTempEmailDomain = useEmailGenerator && useCloudflareTempEmailGenerator;
  if (rowEmailGenerator) {
    rowEmailGenerator.style.display = useEmailGenerator ? '' : 'none';
  }
  if (typeof rowCustomEmailPool !== 'undefined' && rowCustomEmailPool) {
    rowCustomEmailPool.style.display = useCustomEmailPool ? '' : 'none';
    if (useCustomEmailPool) {
      queueCustomEmailPoolRefresh();
    } else {
      resetCustomEmailPoolManager();
    }
  }
  if (cloudflareTempEmailSection) {
    cloudflareTempEmailSection.style.display = showCloudflareTempEmailSettings ? '' : 'none';
  }
  if (typeof cloudMailSection !== 'undefined' && cloudMailSection) {
    cloudMailSection.style.display = showCloudMailSettings ? '' : 'none';
  }
  if (typeof yydsMailSection !== 'undefined' && yydsMailSection) {
    yydsMailSection.style.display = useYydsMail ? '' : 'none';
  }
  if (typeof rowCloudMailBaseUrl !== 'undefined' && rowCloudMailBaseUrl) rowCloudMailBaseUrl.style.display = showCloudMailSettings ? '' : 'none';
  if (typeof rowCloudMailAdminEmail !== 'undefined' && rowCloudMailAdminEmail) rowCloudMailAdminEmail.style.display = showCloudMailSettings ? '' : 'none';
  if (typeof rowCloudMailAdminPassword !== 'undefined' && rowCloudMailAdminPassword) rowCloudMailAdminPassword.style.display = showCloudMailSettings ? '' : 'none';
  if (typeof rowCloudMailReceiveMailbox !== 'undefined' && rowCloudMailReceiveMailbox) rowCloudMailReceiveMailbox.style.display = showCloudMailReceiveMailbox ? '' : 'none';
  if (typeof rowCloudMailDomain !== 'undefined' && rowCloudMailDomain) rowCloudMailDomain.style.display = showCloudMailDomain ? '' : 'none';
  if (icloudSection) {
    const showIcloudSection = (useEmailGenerator && useIcloud) || useIcloudProvider;
    icloudSection.style.display = showIcloudSection ? '' : 'none';
    if (showIcloudSection) {
      queueIcloudAliasRefresh();
    }
    if (!showIcloudSection) {
      hideIcloudLoginHelp();
    }
  }
  if (typeof rowIcloudTargetMailboxType !== 'undefined' && rowIcloudTargetMailboxType) {
    rowIcloudTargetMailboxType.style.display = showIcloudTargetMailboxType ? '' : 'none';
  }
  if (typeof rowIcloudForwardMailProvider !== 'undefined' && rowIcloudForwardMailProvider) {
    rowIcloudForwardMailProvider.style.display = showIcloudForwardMailProvider ? '' : 'none';
  }
  rowCfDomain.style.display = showCloudflareDomain ? '' : 'none';
  const { domains } = getCloudflareDomainsFromState();
  if (showCloudflareDomain) {
    setCloudflareDomainEditMode(cloudflareDomainEditMode || domains.length === 0, { clearInput: false });
  } else {
    setCloudflareDomainEditMode(false, { clearInput: false });
  }
  rowTempEmailBaseUrl.style.display = showCloudflareTempEmailSettings ? '' : 'none';
  rowTempEmailAdminAuth.style.display = showCloudflareTempEmailSettings ? '' : 'none';
  rowTempEmailCustomAuth.style.display = showCloudflareTempEmailSettings ? '' : 'none';
  if (typeof rowTempEmailLookupMode !== 'undefined' && rowTempEmailLookupMode) {
    rowTempEmailLookupMode.style.display = showCloudflareTempEmailLookupMode ? '' : 'none';
  }
  rowTempEmailReceiveMailbox.style.display = showCloudflareTempEmailReceiveMailbox ? '' : 'none';
  if (rowTempEmailRandomSubdomainToggle) {
    rowTempEmailRandomSubdomainToggle.style.display = showCloudflareTempEmailRandomSubdomainToggle ? '' : 'none';
  }
  rowTempEmailDomain.style.display = showCloudflareTempEmailDomain ? '' : 'none';
  const { domains: tempEmailDomains } = getCloudflareTempEmailDomainsFromState();
  if (showCloudflareTempEmailDomain) {
    setCloudflareTempEmailDomainEditMode(cloudflareTempEmailDomainEditMode || tempEmailDomains.length === 0, { clearInput: false });
  } else {
    setCloudflareTempEmailDomainEditMode(false, { clearInput: false });
  }

  if (hotmailSection) {
    hotmailSection.style.display = useHotmail ? '' : 'none';
  }
  if (mail2925Section) {
    mail2925Section.style.display = useMail2925AccountPool ? '' : 'none';
  }
  if (luckmailSection) {
    luckmailSection.style.display = useLuckmail ? '' : 'none';
  }
  labelEmailPrefix.textContent = '邮箱前缀';
  inputEmailPrefix.placeholder = '例如 abc';
  if (labelMail2925UseAccountPool) {
    labelMail2925UseAccountPool.style.display = useMail2925 ? '' : 'none';
  }
  syncMail2925PoolAccountOptions(latestState);
  if (selectMail2925PoolAccount) {
    selectMail2925PoolAccount.style.display = useMail2925AccountPool ? '' : 'none';
    selectMail2925PoolAccount.disabled = !useMail2925AccountPool || getMail2925Accounts().length === 0;
  }
  inputEmailPrefix.style.display = '';
  inputEmailPrefix.readOnly = false;
  selectEmailGenerator.disabled = useHotmail || useLuckmail || useYydsMail || useCustomEmail || (useGeneratedAlias && !useGmail);
  if (useGmail) {
    labelEmailPrefix.textContent = 'Gmail 原邮箱';
    inputEmailPrefix.placeholder = '例如 yourname@gmail.com';
  }
  labelEmailPrefix.textContent = aliasUiCopy?.baseLabel || labelEmailPrefix.textContent;
  inputEmailPrefix.placeholder = aliasUiCopy?.basePlaceholder || inputEmailPrefix.placeholder;
  if (rowHotmailServiceMode) {
    rowHotmailServiceMode.style.display = useHotmail ? '' : 'none';
  }
  if (rowHotmailRemoteBaseUrl) {
    rowHotmailRemoteBaseUrl.style.display = useHotmail && hotmailServiceMode === HOTMAIL_SERVICE_MODE_REMOTE ? '' : 'none';
  }
  if (rowHotmailLocalBaseUrl) {
    rowHotmailLocalBaseUrl.style.display = useHotmail && hotmailServiceMode === HOTMAIL_SERVICE_MODE_LOCAL ? '' : 'none';
  }
  btnFetchEmail.hidden = useHotmail || useLuckmail || useCustomEmail || useCustomEmailPool;
  inputEmail.readOnly = useHotmail || useLuckmail;
  inputEmail.placeholder = useHotmail
    ? '由 Hotmail 账号池自动分配'
    : (useLuckmail
      ? '步骤 3 自动购买 LuckMail 邮箱并回填'
      : (useGeneratedAlias ? '步骤 3 自动生成 2925 邮箱并回填' : uiCopy.placeholder));
  if (useGmail && useGeneratedAlias) {
    inputEmail.placeholder = '步骤 3 自动生成 Gmail +tag 邮箱并回填';
  }
  if (!useHotmail && !useLuckmail) {
    inputEmail.placeholder = uiCopy.placeholder;
  }
  if (useCustomEmail && useCustomMailProviderPool) {
    inputEmail.placeholder = '号池会按顺序自动回填当前轮邮箱，也可以手动覆盖';
  }
  btnFetchEmail.disabled = useLuckmail || useCustomEmail || useCustomEmailPool || isAutoRunLockedPhase();
  if (!btnFetchEmail.disabled) {
    btnFetchEmail.textContent = uiCopy.buttonLabel;
  }
  if (autoHintText) {
    autoHintText.textContent = useHotmail
      ? '请先校验并选择一个 Hotmail 账号'
      : (useLuckmail
        ? '步骤 3 会自动购买 LuckMail 邮箱并用于收码'
        : (useGeneratedAlias
          ? '步骤 3 会自动生成邮箱，无需手动获取'
          : (useCustomEmail ? '请先填写自定义注册邮箱，成功一轮后会自动清空' : `先自动获取${uiCopy.label}，或手动粘贴邮箱后再继续`)));
  }
  if (autoHintText && useCustomEmailPool) {
    autoHintText.textContent = getCustomEmailPoolSize() > 0
      ? `当前邮箱池共 ${getCustomEmailPoolSize()} 个邮箱，自动轮数会跟随数量；实际收码仍走当前邮箱服务`
      : '请先在邮箱池里每行填写一个邮箱，自动轮数会跟随数量';
  }
  if (autoHintText && useCustomEmail && useCustomMailProviderPool) {
    autoHintText.textContent = `当前自定义号池共 ${getCustomMailProviderPoolSize()} 个邮箱，自动轮数会跟随数量；第 4/8 步仍需手动输入验证码`;
  }
  if (autoHintText && useGmail && useGeneratedAlias) {
    autoHintText.textContent = '请先填写 Gmail 原邮箱，步骤 3 会自动生成 Gmail +tag 地址';
  }
  if (autoHintText && useGeneratedAlias && aliasUiCopy?.hint) {
    autoHintText.textContent = aliasUiCopy.hint;
  }
  if (autoHintText && useMail2925AccountPool && !useCustomEmailPool) {
    autoHintText.textContent = getMail2925Accounts().length
      ? (useGeneratedAlias
        ? '当前已启用 2925 号池模式，步骤 3 会基于下拉框选中的号池邮箱生成别名地址'
        : '当前已启用 2925 号池模式，步骤 4 / 8 遇到登录页时会优先使用下拉框选中的账号自动登录')
      : '当前已启用 2925 号池模式，请先在下方 2925 账号池中添加账号并选择邮箱';
  }
  if (autoHintText && showCloudflareTempEmailReceiveMailbox && !useCustomEmailPool) {
    autoHintText.textContent = '若注册邮箱会转发到 Cloudflare Temp Email，请在“邮件接收”中填写实际接收转发邮件的邮箱。';
  }
  if (autoHintText && showCloudflareTempEmailRandomSubdomainToggle && inputTempEmailUseRandomSubdomain?.checked) {
    autoHintText.textContent = '已启用随机子域名：扩展会按当前选中的 Temp 域名提交，并额外携带 enableRandomSubdomain；是否生效取决于后端 RANDOM_SUBDOMAIN_DOMAINS 配置。';
  }
  if (autoHintText && useIcloudProvider && showIcloudForwardMailProvider) {
    const forwardProvider = normalizeIcloudForwardMailProvider(icloudForwardMailProviderValue);
    const forwardProviderLabel = ICLOUD_FORWARD_MAIL_PROVIDER_LABELS[forwardProvider]
      || MAIL_PROVIDER_LOGIN_CONFIGS[forwardProvider]?.label
      || '目标邮箱';
    autoHintText.textContent = `iCloud ${isIcloudComCnHost ? 'com.cn' : ''} 当前使用转发收码：第 4/8 步会从 ${forwardProviderLabel} 轮询验证码。`;
  }
  if (useHotmail) {
    inputEmail.value = getCurrentHotmailEmail();
  } else if (useLuckmail) {
    inputEmail.value = getCurrentLuckmailEmail();
  }
  if (useCustomEmailPool) {
    syncRunCountFromCustomEmailPool();
    if (typeof queueCustomEmailPoolRefresh === 'function') {
      queueCustomEmailPoolRefresh();
    }
  }
  if (useCustomMailProviderPool) {
    syncRunCountFromCustomMailProviderPool();
  }
  if (typeof inputRunCount !== 'undefined' && inputRunCount) {
    inputRunCount.disabled = currentAutoRun.autoRunning || shouldLockRunCountToEmailPool();
  }
  renderHotmailAccounts();
  if (useMail2925) {
    renderMail2925Accounts();
  }
  if (useLuckmail) {
    renderLuckmailPurchases();
  }
}

function updateBrowserFingerprintUI(state = latestState) {
  const activeFlowId = typeof getSelectedFlowId === 'function'
    ? getSelectedFlowId(state)
    : String(state?.activeFlowId || state?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID;
  const visible = activeFlowId === DEFAULT_ACTIVE_FLOW_ID;
  const enabled = typeof inputBrowserFingerprintEnabled !== 'undefined' && inputBrowserFingerprintEnabled
    ? Boolean(inputBrowserFingerprintEnabled.checked)
    : state?.browserFingerprintEnabled !== false;
  const level = normalizeBrowserFingerprintLevel(
    typeof selectBrowserFingerprintLevel !== 'undefined' && selectBrowserFingerprintLevel
      ? selectBrowserFingerprintLevel.value
      : state?.browserFingerprintLevel
  );
  const language = normalizeBrowserFingerprintLanguage(
    typeof selectBrowserFingerprintLanguage !== 'undefined' && selectBrowserFingerprintLanguage
      ? selectBrowserFingerprintLanguage.value
      : state?.browserFingerprintLanguage
  );

  if (typeof rowBrowserFingerprint !== 'undefined' && rowBrowserFingerprint) {
    rowBrowserFingerprint.style.display = visible ? '' : 'none';
  }
  if (typeof rowBrowserFingerprintLanguage !== 'undefined' && rowBrowserFingerprintLanguage) {
    rowBrowserFingerprintLanguage.style.display = visible ? '' : 'none';
  }
  if (typeof inputBrowserFingerprintEnabled !== 'undefined' && inputBrowserFingerprintEnabled) {
    inputBrowserFingerprintEnabled.checked = enabled;
  }
  if (typeof selectBrowserFingerprintLevel !== 'undefined' && selectBrowserFingerprintLevel) {
    selectBrowserFingerprintLevel.value = level;
    selectBrowserFingerprintLevel.disabled = !enabled;
  }
  if (typeof selectBrowserFingerprintLanguage !== 'undefined' && selectBrowserFingerprintLanguage) {
    selectBrowserFingerprintLanguage.value = language;
    selectBrowserFingerprintLanguage.disabled = !enabled;
  }
  if (typeof browserFingerprintCaption !== 'undefined' && browserFingerprintCaption) {
    browserFingerprintCaption.textContent = enabled
      ? ({
        basic: '基础生成：UA 与语言',
        standard: '标准生成',
        enhanced: '增强生成：含 Canvas / Audio',
      }[level] || '标准生成')
      : '已关闭';
  }
}

async function saveCloudflareDomainSettings(domains, activeDomain, options = {}) {
  const { silent = false } = options;
  const normalizedDomains = normalizeCloudflareDomains(domains);
  const normalizedActiveDomain = normalizeCloudflareDomainValue(activeDomain) || normalizedDomains[0] || '';
  const payload = {
    cloudflareDomain: normalizedActiveDomain,
    cloudflareDomains: normalizedDomains,
  };

  const response = await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload,
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  syncLatestState({
    ...payload,
  });
  renderCloudflareDomainOptions(normalizedActiveDomain);
  setCloudflareDomainEditMode(false, { clearInput: true });
  markSettingsDirty(false);
  updateMailProviderUI();

  if (!silent) {
    showToast('Cloudflare 域名已保存', 'success', 1800);
  }
}

async function saveCloudflareTempEmailDomainSettings(domains, activeDomain, options = {}) {
  const { silent = false } = options;
  const normalizedDomains = normalizeCloudflareTempEmailDomains(domains);
  const normalizedActiveDomain = normalizeCloudflareTempEmailDomainValue(activeDomain) || normalizedDomains[0] || '';
  const payload = {
    cloudflareTempEmailDomain: normalizedActiveDomain,
    cloudflareTempEmailDomains: normalizedDomains,
  };

  const response = await chrome.runtime.sendMessage({
    type: 'SAVE_SETTING',
    source: 'sidepanel',
    payload,
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  syncLatestState({
    ...payload,
  });
  renderCloudflareTempEmailDomainOptions(normalizedActiveDomain);
  setCloudflareTempEmailDomainEditMode(false, { clearInput: true });
  markSettingsDirty(false);
  updateMailProviderUI();

  if (!silent) {
    showToast('Cloudflare Temp Email 域名已保存', 'success', 1800);
  }
}

function joinCloudflareTempEmailSettingsUrl(baseUrl, path) {
  const normalizedBaseUrl = normalizeCloudflareTempEmailBaseUrlValue(baseUrl);
  const normalizedPath = String(path || '').trim();
  if (!normalizedBaseUrl || !normalizedPath) {
    return normalizedBaseUrl || '';
  }
  return `${normalizedBaseUrl}${normalizedPath.startsWith('/') ? '' : '/'}${normalizedPath}`;
}

function buildCloudflareTempEmailSyncHeaders(options = {}) {
  const { includeAdminAuth = false } = options;
  const headers = {
    Accept: 'application/json',
  };
  const customAuth = String(inputTempEmailCustomAuth?.value || '').trim();
  if (customAuth) {
    headers['x-custom-auth'] = customAuth;
  }
  if (includeAdminAuth) {
    const adminAuth = String(inputTempEmailAdminAuth?.value || '').trim();
    if (adminAuth) {
      headers['x-admin-auth'] = adminAuth;
    }
  }
  return headers;
}

async function requestCloudflareTempEmailSyncPayload(baseUrl, path, options = {}) {
  const url = joinCloudflareTempEmailSettingsUrl(baseUrl, path);
  if (!url) {
    throw new Error('Cloudflare Temp Email 服务地址为空或格式无效。');
  }

  const response = await fetch(url, {
    cache: 'no-store',
    headers: buildCloudflareTempEmailSyncHeaders(options),
  });
  const rawText = await response.text();
  let payload = rawText;
  try {
    payload = rawText ? JSON.parse(rawText) : {};
  } catch {
    payload = rawText;
  }

  if (!response.ok) {
    const message = typeof payload === 'object' && payload
      ? (payload.message || payload.error || payload.msg)
      : '';
    throw new Error(message || `HTTP ${response.status}`);
  }

  return payload;
}

function mergeCloudflareTempEmailDomains(existingDomains, fetchedDomains) {
  const mergedDomains = [];
  const seen = new Set();
  for (const domain of normalizeCloudflareTempEmailDomains(fetchedDomains)) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    mergedDomains.push(domain);
  }
  for (const domain of normalizeCloudflareTempEmailDomains(existingDomains)) {
    if (seen.has(domain)) continue;
    seen.add(domain);
    mergedDomains.push(domain);
  }
  return mergedDomains;
}

async function fetchCloudflareTempEmailAvailableDomains(baseUrl) {
  let openSettingsError = null;
  try {
    const payload = await requestCloudflareTempEmailSyncPayload(baseUrl, '/open_api/settings');
    const domains = normalizeCloudflareTempEmailDomains(payload?.domains || []);
    if (domains.length) {
      return {
        domains,
        source: 'open_api/settings',
      };
    }
    openSettingsError = new Error('公开设置未返回可用域名。');
  } catch (error) {
    openSettingsError = error;
  }

  const adminAuth = String(inputTempEmailAdminAuth?.value || '').trim();
  if (!adminAuth) {
    throw openSettingsError || new Error('未获取到可用域名。');
  }

  const payload = await requestCloudflareTempEmailSyncPayload(baseUrl, '/admin/worker/configs', {
    includeAdminAuth: true,
  });
  const domains = normalizeCloudflareTempEmailDomains(payload?.DOMAINS || []);
  if (!domains.length) {
    throw openSettingsError || new Error('管理配置未返回可用域名。');
  }
  return {
    domains,
    source: 'admin/worker/configs',
  };
}

async function syncCloudflareTempEmailDomainsFromService() {
  const normalizedBaseUrl = normalizeCloudflareTempEmailBaseUrlValue(inputTempEmailBaseUrl?.value || '');
  if (!normalizedBaseUrl) {
    throw new Error('请先填写有效的 Cloudflare Temp Email 服务地址。');
  }

  const previousButtonText = btnTempEmailDomainMode.textContent;
  btnTempEmailDomainMode.disabled = true;
  btnTempEmailDomainMode.textContent = '更新中...';

  try {
    const { domains: fetchedDomains, source } = await fetchCloudflareTempEmailAvailableDomains(normalizedBaseUrl);
    const { domains: existingDomains, activeDomain } = getCloudflareTempEmailDomainsFromState();
    const currentDomain = normalizeCloudflareTempEmailDomainValue(selectTempEmailDomain.value || activeDomain);
    const mergedDomains = mergeCloudflareTempEmailDomains(existingDomains, fetchedDomains);
    const nextActiveDomain = mergedDomains.includes(currentDomain)
      ? currentDomain
      : (fetchedDomains[0] || mergedDomains[0] || '');
    const existingSet = new Set(normalizeCloudflareTempEmailDomains(existingDomains));
    const addedCount = fetchedDomains.filter((domain) => !existingSet.has(domain)).length;

    await saveCloudflareTempEmailDomainSettings(mergedDomains, nextActiveDomain, { silent: true });
    if (addedCount > 0) {
      showToast(`已更新 Cloudflare Temp Email 域名，新增 ${addedCount} 个。`, 'success', 2200);
    } else {
      showToast('已同步 Cloudflare Temp Email 域名，暂无新增项。', 'info', 2200);
    }
    return {
      domains: mergedDomains,
      activeDomain: nextActiveDomain,
      source,
    };
  } catch (error) {
    const message = error?.message || String(error || '未知错误');
    throw new Error(`更新 Cloudflare Temp Email 域名失败：${message}`);
  } finally {
    btnTempEmailDomainMode.disabled = false;
    btnTempEmailDomainMode.textContent = previousButtonText || '更新';
  }
}

async function handleDeleteCloudflareDomain(domain) {
  const targetDomain = normalizeCloudflareDomainValue(domain);
  if (!targetDomain) {
    return;
  }

  const { domains, activeDomain } = getCloudflareDomainsFromState();
  const nextDomains = domains.filter((item) => item !== targetDomain);
  if (nextDomains.length === domains.length) {
    return;
  }

  const currentDomain = normalizeCloudflareDomainValue(selectCfDomain.value || activeDomain);
  const nextActiveDomain = currentDomain === targetDomain
    ? (nextDomains[0] || '')
    : (nextDomains.includes(currentDomain) ? currentDomain : nextDomains[0] || '');
  await saveCloudflareDomainSettings(nextDomains, nextActiveDomain, { silent: true });
  showToast(`已删除 Cloudflare 域名：${targetDomain}`, 'success', 1600);
}

async function handleDeleteCloudflareTempEmailDomain(domain) {
  const targetDomain = normalizeCloudflareTempEmailDomainValue(domain);
  if (!targetDomain) {
    return;
  }

  const { domains, activeDomain } = getCloudflareTempEmailDomainsFromState();
  const nextDomains = domains.filter((item) => item !== targetDomain);
  if (nextDomains.length === domains.length) {
    return;
  }

  const currentDomain = normalizeCloudflareTempEmailDomainValue(selectTempEmailDomain.value || activeDomain);
  const nextActiveDomain = currentDomain === targetDomain
    ? (nextDomains[0] || '')
    : (nextDomains.includes(currentDomain) ? currentDomain : nextDomains[0] || '');
  await saveCloudflareTempEmailDomainSettings(nextDomains, nextActiveDomain, { silent: true });
  showToast(`已删除 Cloudflare Temp Email 域名：${targetDomain}`, 'success', 1600);
}

async function handleAddSub2ApiGroup() {
  if (!sharedFormDialog?.open) {
    showToast('表单弹窗未加载，请刷新扩展后重试。', 'error');
    return;
  }

  const result = await sharedFormDialog.open({
    title: '添加 SUB2API 分组',
    confirmLabel: '添加',
    confirmVariant: 'btn-primary',
    fields: [
      {
        key: 'groupName',
        label: '分组',
        type: 'text',
        placeholder: '例如 openai-plus',
        autocomplete: 'off',
        required: true,
        requiredMessage: '请先填写 SUB2API 分组名称。',
        validate: (value) => {
          const names = normalizeSub2ApiGroupOptions(value);
          return names.length ? '' : '请先填写 SUB2API 分组名称。';
        },
      },
    ],
  });
  if (!result) {
    return;
  }

  const newGroups = normalizeSub2ApiGroupOptions(result.groupName);
  if (!newGroups.length) {
    return;
  }

  const selectedGroup = newGroups[0];
  const nextGroups = normalizeSub2ApiGroupOptions(
    getSub2ApiGroupOptionsState(latestState),
    newGroups
  );
  syncLatestState({
    sub2apiGroupName: selectedGroup,
    sub2apiGroupNames: nextGroups,
  });
  renderSub2ApiGroupOptions(latestState, selectedGroup);
  markSettingsDirty(true);
  await saveSettings({ silent: true }).catch(() => { });
  showToast(`已添加并切换到 SUB2API 分组：${selectedGroup}`, 'success', 1800);
}

async function handleDeleteSub2ApiGroup(groupName) {
  const targetName = String(groupName || '').trim();
  if (!targetName) {
    return;
  }

  const currentGroups = getSub2ApiGroupOptionsState(latestState);
  if (currentGroups.length <= 1) {
    showToast('至少保留一个 SUB2API 分组。', 'warn', 1800);
    return;
  }

  const targetKey = targetName.toLowerCase();
  const nextGroups = currentGroups.filter((name) => name.toLowerCase() !== targetKey);
  if (nextGroups.length === currentGroups.length) {
    return;
  }

  const currentGroup = getSelectedSub2ApiGroupName();
  const nextSelectedGroup = currentGroup.toLowerCase() === targetKey
    ? nextGroups[0]
    : (nextGroups.find((name) => name.toLowerCase() === currentGroup.toLowerCase()) || nextGroups[0]);

  syncLatestState({
    sub2apiGroupName: nextSelectedGroup,
    sub2apiGroupNames: nextGroups,
  });
  renderSub2ApiGroupOptions(latestState, nextSelectedGroup);
  sub2ApiGroupPicker.setOpen(true);
  markSettingsDirty(true);
  await saveSettings({ silent: true }).catch(() => { });
  showToast(`已删除 SUB2API 分组：${targetName}`, 'success', 1600);
}

function updatePanelModeUI() {
  const activeFlowId = typeof getSelectedFlowId === 'function'
    ? getSelectedFlowId(latestState)
    : normalizeFlowId(latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID);
  const targetId = typeof getSelectedTargetId === 'function'
    ? getSelectedTargetId(activeFlowId)
    : (activeFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? normalizePanelMode(selectPanelMode?.value || latestState?.panelMode || 'cpa')
      : String(selectPanelMode?.value || latestState?.kiroTargetId || 'kiro-rs').trim().toLowerCase() || 'kiro-rs');
  const rawPanelMode = activeFlowId === DEFAULT_ACTIVE_FLOW_ID
    ? normalizePanelMode(targetId || latestState?.panelMode || 'cpa')
    : normalizePanelMode(latestState?.panelMode || 'cpa');
  const capabilityState = typeof resolveCurrentSidepanelCapabilities === 'function'
    ? resolveCurrentSidepanelCapabilities({
      activeFlowId,
      targetId,
      panelMode: rawPanelMode,
      state: {
        ...(latestState || {}),
        activeFlowId,
        ...(activeFlowId === DEFAULT_ACTIVE_FLOW_ID
          ? { panelMode: rawPanelMode }
          : { kiroTargetId: targetId }),
      },
    })
    : null;
  const effectiveTargetId = capabilityState?.effectiveTargetId || targetId;
  renderFlowSelectorOptions(activeFlowId);
  renderTargetSelectorOptions(activeFlowId, effectiveTargetId);
  if (selectFlow) {
    selectFlow.value = activeFlowId;
  }
  if (selectPanelMode) {
    selectPanelMode.value = effectiveTargetId;
  }
  const visibleGroupIds = Array.isArray(capabilityState?.visibleGroupIds)
    ? capabilityState.visibleGroupIds
    : [];
  if (typeof applyFlowSettingsGroupVisibility === 'function') {
    applyFlowSettingsGroupVisibility(visibleGroupIds);
  }
  if (typeof updatePlusModeUI === 'function') {
    updatePlusModeUI();
  }
  if (typeof updateBrowserFingerprintUI === 'function') {
    updateBrowserFingerprintUI();
  }
  if (typeof updatePhoneVerificationSettingsUI === 'function') {
    updatePhoneVerificationSettingsUI();
  }
  if (typeof applySub2ApiReloginVisibilityOverrides === 'function') {
    applySub2ApiReloginVisibilityOverrides(latestState);
  }
  const panelMode = capabilityState?.effectivePanelMode || capabilityState?.panelMode || rawPanelMode;

  const useCodex2Api = panelMode === 'codex2api';
  const step9Btn = document.querySelector('.step-btn[data-step-key="platform-verify"]');
  if (step9Btn && activeFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    step9Btn.textContent = panelMode === 'sub2api'
      ? 'SUB2API 回调验证'
      : (useCodex2Api ? 'Codex2API 回调验证' : 'CPA 回调验证');
  }
}

// ============================================================
// UI Updates
// ============================================================

function updateNodeUI(nodeId, status) {
  const normalizedNodeId = String(nodeId || '').trim();
  if (!normalizedNodeId) return;
  syncLatestState({
    nodeStatuses: {
      ...getStoredNodeStatuses(),
      [normalizedNodeId]: status,
    },
  });

  renderSingleNodeStatus(normalizedNodeId, status);
  updateButtonStates();
  updateProgressCounter();
  updateConfigMenuControls();
}

function updateStepUI(step, status) {
  const nodeId = getNodeIdByStepForCurrentMode(step);
  if (nodeId) {
    updateNodeUI(nodeId, status);
    return;
  }
  updateButtonStates();
  updateProgressCounter();
  updateConfigMenuControls();
}

function renderSingleNodeStatus(nodeId, status) {
  const normalizedNodeId = String(nodeId || '').trim();
  const normalizedStatus = typeof getDisplayNodeStatus === 'function'
    ? getDisplayNodeStatus(normalizedNodeId, status || 'pending', latestState)
    : (status || 'pending');
  const selectorNodeId = escapeCssValue(normalizedNodeId);
  const statusEl = document.querySelector(`.step-status[data-node-id="${selectorNodeId}"]`);
  const row = document.querySelector(`.step-row[data-node-id="${selectorNodeId}"]`);

  if (statusEl) statusEl.textContent = STATUS_ICONS[normalizedStatus] || '';
  if (row) {
    row.className = `step-row ${normalizedStatus}`;
  }
}

function renderSingleStepStatus(step, status) {
  const nodeId = typeof getNodeIdByStepForCurrentMode === 'function'
    ? getNodeIdByStepForCurrentMode(step)
    : '';
  if (nodeId && typeof renderSingleNodeStatus === 'function') {
    renderSingleNodeStatus(nodeId, status);
    return;
  }
  const normalizedStatus = status || 'pending';
  const statusEl = document.querySelector(`.step-status[data-step="${step}"]`);
  const row = document.querySelector(`.step-row[data-step="${step}"]`);

  if (statusEl) statusEl.textContent = STATUS_ICONS[normalizedStatus] || '';
  if (row) {
    row.className = `step-row ${normalizedStatus}`;
  }
}

function renderStepStatuses(state = latestState) {
  if (typeof getNodeStatuses === 'function' && typeof NODE_IDS !== 'undefined') {
    const statuses = getNodeStatuses(state);
    for (const nodeId of NODE_IDS) {
      renderSingleNodeStatus(nodeId, statuses[nodeId]);
    }
  } else {
    const statuses = getStepStatuses(state);
    for (const step of STEP_IDS) {
      renderSingleStepStatus(step, statuses[step]);
    }
  }
  updateProgressCounter();
}

function updateProgressCounter() {
  if (typeof getNodeStatuses === 'function' && typeof NODE_IDS !== 'undefined') {
    const statuses = getNodeStatuses();
    const enabledNodeIds = NODE_IDS.filter((nodeId) => statuses[nodeId] !== 'disabled');
    const completed = enabledNodeIds.filter((nodeId) => isDoneStatus(statuses[nodeId])).length;
    stepsProgress.textContent = `${completed} / ${enabledNodeIds.length || NODE_IDS.length}`;
    return;
  }
  const completed = Object.values(getStepStatuses()).filter(isDoneStatus).length;
  stepsProgress.textContent = `${completed} / ${STEP_IDS.length}`;
}

function updateButtonStates() {
  const statuses = getNodeStatuses();
  const anyRunning = Object.values(statuses).some(s => s === 'running');
  const autoLocked = isAutoRunLockedPhase();
  const autoScheduled = isAutoRunScheduledPhase();
  const enabledNodeIds = getEnabledNodeIdsForStepExecutionRange(latestState);
  const icloudTargetMailboxTypeValue = typeof selectIcloudTargetMailboxType !== 'undefined'
    ? selectIcloudTargetMailboxType?.value
    : latestState?.icloudTargetMailboxType;

  for (const nodeId of NODE_IDS) {
    const step = getStepIdByNodeIdForCurrentMode(nodeId);
    const btn = document.querySelector(`.step-btn[data-node-id="${escapeCssValue(nodeId)}"]`);
    if (!btn) continue;
    const currentStatus = statuses[nodeId];

    if (currentStatus === 'disabled') {
      btn.disabled = true;
    } else if (anyRunning || autoLocked || autoScheduled) {
      btn.disabled = true;
    } else if (enabledNodeIds.indexOf(nodeId) === 0) {
      btn.disabled = false;
    } else {
      const currentIndex = enabledNodeIds.indexOf(nodeId);
      const prevNodeId = currentIndex > 0 ? enabledNodeIds[currentIndex - 1] : null;
      const prevStatus = prevNodeId === null ? 'completed' : statuses[prevNodeId];
      btn.disabled = !(isDoneStatus(prevStatus) || currentStatus === 'failed' || isDoneStatus(currentStatus) || currentStatus === 'stopped');
    }
  }

  document.querySelectorAll('.step-manual-btn').forEach((btn) => {
    const step = Number(btn.dataset.step);
    const nodeId = String(btn.dataset.nodeId || getNodeIdByStepForCurrentMode(step) || '').trim();
    const currentStatus = statuses[nodeId];
    const currentIndex = enabledNodeIds.indexOf(nodeId);
    const prevNodeId = currentIndex > 0 ? enabledNodeIds[currentIndex - 1] : null;
    const prevStatus = prevNodeId === null ? 'completed' : statuses[prevNodeId];

    if (!SKIPPABLE_NODES.has(nodeId) || currentStatus === 'disabled' || anyRunning || autoLocked || autoScheduled || currentStatus === 'running' || isDoneStatus(currentStatus)) {
      btn.style.display = 'none';
      btn.disabled = true;
      btn.title = '当前不可跳过';
      return;
    }

    if (prevNodeId !== null && !isDoneStatus(prevStatus)) {
      btn.style.display = 'none';
      btn.disabled = true;
      btn.title = `请先完成节点 ${prevNodeId}`;
      return;
    }

    btn.style.display = '';
    btn.disabled = false;
    btn.title = `跳过节点 ${nodeId}`;
  });

  btnReset.disabled = anyRunning || autoScheduled || isAutoRunPausedPhase() || autoLocked;
  const disableIcloudControls = anyRunning || autoScheduled || autoLocked;
  if (btnIcloudRefresh) btnIcloudRefresh.disabled = disableIcloudControls;
  if (btnIcloudDeleteUsed) btnIcloudDeleteUsed.disabled = disableIcloudControls || !hasDeletableUsedIcloudAliases();
  if (selectIcloudHostPreference) selectIcloudHostPreference.disabled = disableIcloudControls;
  if (typeof selectIcloudTargetMailboxType !== 'undefined' && selectIcloudTargetMailboxType) {
    selectIcloudTargetMailboxType.disabled = disableIcloudControls;
  }
  if (typeof selectIcloudForwardMailProvider !== 'undefined' && selectIcloudForwardMailProvider) {
    const normalizedIcloudTargetMailboxType = normalizeIcloudTargetMailboxType(icloudTargetMailboxTypeValue);
    const allowIcloudForwardMailProvider = isIcloudMailProvider()
      && normalizedIcloudTargetMailboxType === 'forward-mailbox';
    selectIcloudForwardMailProvider.disabled = disableIcloudControls || !allowIcloudForwardMailProvider;
  }
  if (selectIcloudFetchMode) {
    const allowIcloudFetchMode = getSelectedEmailGenerator() === ICLOUD_PROVIDER
      && !isCustomMailProvider()
      && !isManagedAliasProvider();
    selectIcloudFetchMode.disabled = disableIcloudControls || !allowIcloudFetchMode;
  }
  if (checkboxAutoDeleteIcloud) checkboxAutoDeleteIcloud.disabled = disableIcloudControls;
  if (btnContributionMode) btnContributionMode.disabled = isContributionButtonLocked();
  applyStepExecutionRangeState(latestState);
  updateStopButtonState(anyRunning || autoScheduled || isAutoRunPausedPhase() || autoLocked);
  renderContributionMode();
}

function updateStopButtonState(active) {
  btnStop.disabled = !active;
}

function updateStatusDisplay(state) {
  if (!state || !state.nodeStatuses) return;

  statusBar.className = 'status-bar';
  const nodeStatuses = getNodeStatuses(state);

  const countdown = getActiveAutoRunCountdown();
  if (countdown) {
    const remainingMs = countdown.at - Date.now();
    displayStatus.textContent = remainingMs > 0
      ? `${countdown.title}，剩余 ${formatCountdown(remainingMs)}`
      : `${countdown.title}，即将结束...`;
    statusBar.classList.add(countdown.tone === 'scheduled' ? 'scheduled' : 'running');
    return;
  }

  if (isAutoRunScheduledPhase()) {
    const remainingMs = Number.isFinite(currentAutoRun.scheduledAt)
      ? currentAutoRun.scheduledAt - Date.now()
      : 0;
    displayStatus.textContent = remainingMs > 0
      ? `自动计划中，剩余 ${formatCountdown(remainingMs)}`
      : '倒计时即将结束，正在准备启动...';
    statusBar.classList.add('scheduled');
    return;
  }

  if (isAutoRunPausedPhase()) {
    displayStatus.textContent = `自动已暂停${getAutoRunLabel()}，等待邮箱后继续`;
    statusBar.classList.add('paused');
    return;
  }

  if (isAutoRunWaitingStepPhase()) {
    const runningNodes = getRunningNodes(state);
    displayStatus.textContent = runningNodes.length
      ? `自动等待节点 ${runningNodes.join(', ')} 完成后继续${getAutoRunLabel()}`
      : `自动正在按最新进度准备继续${getAutoRunLabel()}`;
    statusBar.classList.add('running');
    return;
  }

  const running = Object.entries(nodeStatuses).find(([, s]) => s === 'running');
  if (running) {
    displayStatus.textContent = `节点 ${running[0]} 运行中...`;
    statusBar.classList.add('running');
    return;
  }

  if (isAutoRunLockedPhase()) {
    displayStatus.textContent = `${currentAutoRun.phase === 'retrying' ? '自动重试中' : '自动运行中'}${getAutoRunLabel()}`;
    statusBar.classList.add('running');
    return;
  }

  const failed = Object.entries(nodeStatuses).find(([, s]) => s === 'failed');
  if (failed) {
    displayStatus.textContent = `节点 ${failed[0]} 失败`;
    statusBar.classList.add('failed');
    return;
  }

  const stopped = Object.entries(nodeStatuses).find(([, s]) => s === 'stopped');
  if (stopped) {
    displayStatus.textContent = `节点 ${stopped[0]} 已停止`;
    statusBar.classList.add('stopped');
    return;
  }

  const lastCompleted = Object.entries(nodeStatuses)
    .filter(([, s]) => isDoneStatus(s))
    .map(([nodeId]) => nodeId)
    .sort((left, right) => NODE_IDS.indexOf(right) - NODE_IDS.indexOf(left))[0];
  const enabledNodeIds = getEnabledNodeIdsForStepExecutionRange(state);
  const lastEnabledNodeId = enabledNodeIds[enabledNodeIds.length - 1] || NODE_IDS[NODE_IDS.length - 1];

  if (lastCompleted === lastEnabledNodeId) {
    const range = getStepExecutionRangeForCurrentFlow(state);
    const doneText = range.enabled ? '执行范围已完成' : '全部节点已完成';
    displayStatus.textContent = (nodeStatuses[lastCompleted] === 'manual_completed' || nodeStatuses[lastCompleted] === 'skipped') ? `${doneText}/跳过` : doneText;
    statusBar.classList.add('completed');
  } else if (lastCompleted) {
    displayStatus.textContent = (nodeStatuses[lastCompleted] === 'manual_completed' || nodeStatuses[lastCompleted] === 'skipped')
      ? `节点 ${lastCompleted} 已跳过`
      : `节点 ${lastCompleted} 已完成`;
  } else {
    displayStatus.textContent = '就绪';
  }
}

function appendLog(entry) {
  const time = new Date(entry.timestamp).toLocaleTimeString('zh-CN', {
    hour12: false,
    timeZone: DISPLAY_TIMEZONE,
  });
  const levelLabel = LOG_LEVEL_LABELS[entry.level] || entry.level;
  const line = document.createElement('div');
  line.className = `log-line log-${entry.level}`;

  const normalizedStep = Math.floor(Number(entry.step) || 0);
  const stepNum = normalizedStep > 0 ? String(normalizedStep) : null;

  let html = `<span class="log-time">${time}</span> `;
  html += `<span class="log-level log-level-${entry.level}">${levelLabel}</span> `;
  if (stepNum) {
    html += `<span class="log-step-tag step-${stepNum}">步${stepNum}</span>`;
  }
  html += `<span class="log-msg">${escapeHtml(entry.message)}</span>`;

  line.innerHTML = html;
  logArea.appendChild(line);
  logArea.scrollTop = logArea.scrollHeight;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function fetchGeneratedEmail(options = {}) {
  const { showFailureToast = true } = options;
  const uiCopy = getCurrentRegistrationEmailUiCopy();
  if (isCustomMailProvider()) {
    throw new Error('当前邮箱服务为自定义邮箱，请直接填写注册邮箱。');
  }
  const defaultLabel = uiCopy.buttonLabel;
  btnFetchEmail.disabled = true;
  btnFetchEmail.textContent = '...';

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'FETCH_GENERATED_EMAIL',
      source: 'sidepanel',
      payload: {
        generateNew: true,
        currentEmail: inputEmail.value.trim(),
        generator: selectEmailGenerator.value,
        mailProvider: selectMailProvider.value,
        mail2925Mode: getSelectedMail2925Mode(),
        ...(getSelectedEmailGenerator() === CUSTOM_EMAIL_POOL_GENERATOR
          ? {
              customEmailPool: getActiveCustomEmailPoolEmails(),
            }
          : {}),
        ...buildManagedAliasBaseEmailPayload(),
      },
    });

    if (response?.error) {
      throw new Error(response.error);
    }
    if (!response?.email) {
      throw new Error('未返回可用邮箱。');
    }

    inputEmail.value = response.email;
    if (getSelectedEmailGenerator() === 'icloud') {
      queueIcloudAliasRefresh();
    }
    showToast(`已${uiCopy.successVerb} ${uiCopy.label}：${response.email}`, 'success', 2500);
    return response.email;
  } catch (err) {
    if (showFailureToast) {
      showToast(`${uiCopy.label}${uiCopy.successVerb}失败：${err.message}`, 'error');
    }
    throw err;
  } finally {
    btnFetchEmail.disabled = false;
    btnFetchEmail.textContent = defaultLabel;
  }
}

function syncToggleButtonLabel(button, input, labels) {
  if (!button || !input) return;

  const isHidden = input.type === 'password';
  button.innerHTML = isHidden ? EYE_OPEN_ICON : EYE_CLOSED_ICON;
  button.setAttribute('aria-label', isHidden ? labels.show : labels.hide);
  button.title = isHidden ? labels.show : labels.hide;
}

function getPasswordToggleLabels(button) {
  if (!button) {
    return {
      show: '\u663e\u793a\u5185\u5bb9',
      hide: '\u9690\u85cf\u5185\u5bb9',
    };
  }
  const show = button.dataset?.showLabel
    || button.getAttribute('aria-label')
    || button.title
    || '\u663e\u793a\u5185\u5bb9';
  const hide = button.dataset?.hideLabel
    || String(show).replace(/^\u663e\u793a/, '\u9690\u85cf')
    || '\u9690\u85cf\u5185\u5bb9';
  return { show, hide };
}

function syncPasswordVisibilityToggle(button) {
  const targetId = String(button?.dataset?.passwordToggle || '').trim();
  const input = targetId ? document.getElementById(targetId) : null;
  if (!button || !input) return;
  syncToggleButtonLabel(button, input, getPasswordToggleLabels(button));
}

function syncPasswordVisibilityToggles(root = document) {
  root.querySelectorAll?.('[data-password-toggle]').forEach(syncPasswordVisibilityToggle);
}

function bindPasswordVisibilityToggles(root = document) {
  root.querySelectorAll?.('[data-password-toggle]').forEach((button) => {
    if (button.dataset?.passwordToggleBound === 'true') {
      syncPasswordVisibilityToggle(button);
      return;
    }
    if (button.dataset) {
      button.dataset.passwordToggleBound = 'true';
    }
    syncPasswordVisibilityToggle(button);
    button.addEventListener('click', () => {
      const targetId = String(button.dataset?.passwordToggle || '').trim();
      const input = targetId ? document.getElementById(targetId) : null;
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      syncPasswordVisibilityToggle(button);
    });
  });
}

function getPrivacyMaskFieldLabel(control) {
  const row = control?.closest?.('.data-row, .modal-form-row');
  const label = row?.querySelector?.('.data-label, .modal-form-label')?.textContent;
  const fallback = control?.getAttribute?.('aria-label')
    || control?.placeholder
    || control?.id
    || '\u5185\u5bb9';
  return String(label || fallback || '\u5185\u5bb9').replace(/\s+/g, ' ').trim();
}

function getPrivacyMaskLabels(control) {
  const label = getPrivacyMaskFieldLabel(control) || '\u5185\u5bb9';
  return {
    show: `\u663e\u793a${label}`,
    hide: `\u9690\u85cf${label}`,
  };
}

function ensurePrivacyControlShell(control, className) {
  const parent = control?.parentElement || null;
  if (!control || !parent) {
    return null;
  }
  if (parent.classList?.contains(className)) {
    return parent;
  }
  const shell = document.createElement('div');
  shell.className = className;
  parent.insertBefore(shell, control);
  shell.appendChild(control);
  return shell;
}

function createPrivacyToggleButton(control, labels) {
  const button = document.createElement('button');
  button.className = 'input-icon-btn';
  button.type = 'button';
  if (control?.id) {
    button.id = `btn-toggle-${control.id.replace(/^input-/, '')}`;
  }
  button.setAttribute('aria-label', labels.show);
  button.title = labels.show;
  return button;
}

function installPrivacyMaskedInput(input) {
  if (!input || input.type === 'hidden') {
    return;
  }
  const labels = getPrivacyMaskLabels(input);
  input.type = 'password';
  input.classList?.add('data-input-with-icon');
  const shell = ensurePrivacyControlShell(input, 'input-with-icon');
  if (!shell) {
    return;
  }

  let button = shell.querySelector?.(`[data-password-toggle="${input.id}"]`) || null;
  if (!button) {
    button = createPrivacyToggleButton(input, labels);
    shell.appendChild(button);
  }
  button.dataset.passwordToggle = input.id;
  button.dataset.showLabel = button.dataset.showLabel || labels.show;
  button.dataset.hideLabel = button.dataset.hideLabel || labels.hide;
  syncPasswordVisibilityToggle(button);
}

function syncPrivacyTextareaToggle(button, textarea) {
  if (!button || !textarea) {
    return;
  }
  const labels = getPrivacyMaskLabels(textarea);
  const isHidden = textarea.dataset?.privacyMasked !== 'false';
  textarea.classList?.toggle('is-privacy-masked', isHidden);
  button.innerHTML = isHidden ? EYE_OPEN_ICON : EYE_CLOSED_ICON;
  button.setAttribute('aria-label', isHidden ? labels.show : labels.hide);
  button.title = isHidden ? labels.show : labels.hide;
}

function installPrivacyMaskedTextarea(textarea) {
  if (!textarea) {
    return;
  }
  const labels = getPrivacyMaskLabels(textarea);
  textarea.classList?.add('data-textarea-with-icon', 'is-privacy-masked');
  if (!textarea.dataset) {
    return;
  }
  textarea.dataset.privacyMasked = textarea.dataset.privacyMasked || 'true';
  const shell = ensurePrivacyControlShell(textarea, 'textarea-with-icon');
  if (!shell) {
    return;
  }

  let button = shell.querySelector?.(`[data-privacy-textarea-toggle="${textarea.id}"]`) || null;
  if (!button) {
    button = createPrivacyToggleButton(textarea, labels);
    shell.appendChild(button);
  }
  button.dataset.privacyTextareaToggle = textarea.id;
  syncPrivacyTextareaToggle(button, textarea);
  if (button.dataset?.privacyTextareaToggleBound === 'true') {
    return;
  }
  button.dataset.privacyTextareaToggleBound = 'true';
  button.addEventListener('click', () => {
    textarea.dataset.privacyMasked = textarea.dataset.privacyMasked === 'false' ? 'true' : 'false';
    syncPrivacyTextareaToggle(button, textarea);
  });
}

function installPrivacyMaskControls(root = document) {
  PRIVACY_MASKED_INPUT_IDS.forEach((inputId) => {
    const input = root.getElementById?.(inputId) || document.getElementById(inputId);
    installPrivacyMaskedInput(input);
  });
  PRIVACY_MASKED_TEXTAREA_IDS.forEach((textareaId) => {
    const textarea = root.getElementById?.(textareaId) || document.getElementById(textareaId);
    installPrivacyMaskedTextarea(textarea);
  });
}

installPrivacyMaskControls();
bindPasswordVisibilityToggles();

async function copyTextToClipboard(text) {
  const value = String(text || '').trim();
  if (!value) {
    throw new Error('没有可复制的内容。');
  }
  if (!navigator.clipboard?.writeText) {
    throw new Error('当前环境不支持剪贴板复制。');
  }
  await navigator.clipboard.writeText(value);
}

const hotmailManager = window.SidepanelHotmailManager?.createHotmailManager({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    btnAddHotmailAccount,
    btnClearUsedHotmailAccounts,
    btnDeleteAllHotmailAccounts,
    btnHotmailUsageGuide,
    btnImportHotmailAccounts,
    btnToggleHotmailForm,
    btnToggleHotmailList,
    hotmailFormShell,
    hotmailAccountsList,
    hotmailListShell,
    inputEmail,
    inputHotmailClientId,
    inputHotmailEmail,
    inputHotmailImport,
    inputHotmailPassword,
    inputHotmailRefreshToken,
    inputHotmailSearch,
    selectHotmailFilter,
    selectMailProvider,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    getCurrentHotmailEmail,
    getHotmailAccounts,
    openConfirmModal,
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  constants: {
    copyIcon: COPY_ICON,
    displayTimeZone: DISPLAY_TIMEZONE,
    expandedStorageKey: 'multipage-hotmail-list-expanded',
  },
  hotmailUtils: {
    filterHotmailAccountsByUsage,
    getHotmailBulkActionLabel,
    getHotmailListToggleLabel,
    parseHotmailImportText,
    shouldClearHotmailCurrentSelection,
    upsertHotmailAccountInList,
  },
});
const initHotmailListExpandedState = hotmailManager?.initHotmailListExpandedState
  || (() => { });
const renderHotmailAccounts = hotmailManager?.renderHotmailAccounts
  || (() => { });
const bindHotmailEvents = hotmailManager?.bindHotmailEvents
  || (() => { });
bindHotmailEvents();

const payPalManager = window.SidepanelPayPalManager?.createPayPalManager({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    btnAddPayPalAccount,
    btnPayPalAccountMenu,
    payPalAccountCurrent,
    payPalAccountMenu,
    payPalAccountPickerRoot,
    selectPayPalAccount,
  },
  helpers: {
    editableListPicker: editableListPickerModule,
    escapeHtml,
    getPayPalAccounts,
    openFormDialog: (options) => {
      if (!sharedFormDialog?.open) {
        throw new Error('表单弹窗能力未加载，请刷新扩展后重试。');
      }
      return sharedFormDialog.open(options);
    },
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  paypalUtils: {
    upsertPayPalAccountInList,
  },
});
const renderPayPalAccounts = payPalManager?.renderPayPalAccounts
  || (() => { });
const bindPayPalEvents = payPalManager?.bindPayPalEvents
  || (() => { });
bindPayPalEvents();

const payPalProfileGenerator = window.SidepanelPayPalProfileGenerator?.createPayPalProfileGenerator({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    profileShell: payPalProfileGeneratorShell,
    btnGenerateProfile: btnGeneratePayPalProfile,
    btnCopyProfile: btnCopyPayPalProfile,
    btnToggleProfile: btnTogglePayPalProfile,
    profileSummary: payPalProfileSummary,
    profileDetails: payPalProfileDetails,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    getCurrentPayPalAccount,
    getDraftCustomPassword: () => String(inputPassword?.value || latestState?.customPassword || '').trim(),
    getDraftEmail: () => String(inputEmail?.value || latestState?.email || '').trim(),
    getDraftHostedCheckoutPhone: () => normalizeHostedCheckoutPhoneValue(inputHostedCheckoutPhone?.value || latestState?.hostedCheckoutPhoneNumber || ''),
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  data: {
    generateRandomBirthday: typeof generateRandomBirthday === 'function' ? generateRandomBirthday : null,
    generateRandomName: typeof generateRandomName === 'function' ? generateRandomName : null,
    getAddressSeedForCountry: window.MultiPageAddressSources?.getAddressSeedForCountry,
    normalizeCountryCode: window.MultiPageAddressSources?.normalizeCountryCode,
  },
});
const renderPayPalProfile = payPalProfileGenerator?.renderPayPalProfile
  || (() => { });
const bindPayPalProfileEvents = payPalProfileGenerator?.bindPayPalProfileEvents
  || (() => { });
bindPayPalProfileEvents();

const mail2925Manager = window.SidepanelMail2925Manager?.createMail2925Manager({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    btnAddMail2925Account,
    btnDeleteAllMail2925Accounts,
    btnImportMail2925Accounts,
    btnToggleMail2925Form,
    btnToggleMail2925List,
    inputMail2925Email,
    inputMail2925Import,
    inputMail2925Password,
    inputMail2925Search,
    selectMail2925Filter,
    mail2925AccountsList,
    mail2925FormShell,
    mail2925ListShell,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    getMail2925Accounts,
    openConfirmModal,
    refreshManagedAliasBaseEmail: () => {
      syncMail2925BaseEmailFromCurrentAccount(latestState, { persist: true });
      setManagedAliasBaseEmailInputForProvider('2925', latestState);
    },
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  constants: {
    copyIcon: COPY_ICON,
    displayTimeZone: DISPLAY_TIMEZONE,
    expandedStorageKey: 'multipage-mail2925-list-expanded',
  },
  mail2925Utils: window.Mail2925Utils || {},
});
const initMail2925ListExpandedState = mail2925Manager?.initMail2925ListExpandedState
  || (() => { });
const renderMail2925Accounts = mail2925Manager?.renderMail2925Accounts
  || (() => { });
const bindMail2925Events = mail2925Manager?.bindMail2925Events
  || (() => { });
bindMail2925Events();

const icloudManager = window.SidepanelIcloudManager?.createIcloudManager({
  dom: {
    btnIcloudBulkDelete,
    btnIcloudBulkPreserve,
    btnIcloudBulkUnpreserve,
    btnIcloudBulkUnused,
    btnIcloudBulkUsed,
    btnIcloudDeleteUsed,
    btnIcloudLoginDone,
    btnIcloudRefresh,
    checkboxIcloudSelectAll,
    icloudList,
    icloudLoginHelp,
    icloudLoginHelpText,
    icloudLoginHelpTitle,
    icloudSection,
    icloudSelectionSummary,
    icloudSummary,
    inputIcloudSearch,
    selectIcloudFilter,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    openConfirmModal,
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
});
const hideIcloudLoginHelp = icloudManager?.hideIcloudLoginHelp
  || (() => { });
const hasDeletableUsedIcloudAliases = icloudManager?.hasDeletableUsedAliases
  || (() => false);
const queueIcloudAliasRefresh = icloudManager?.queueIcloudAliasRefresh
  || (() => { });
const refreshIcloudAliases = icloudManager?.refreshIcloudAliases
  || (async () => { });
const renderIcloudAliases = icloudManager?.renderIcloudAliases
  || (() => { });
const resetIcloudManager = icloudManager?.reset
  || (() => { });
const showIcloudLoginHelp = icloudManager?.showIcloudLoginHelp
  || (() => { });
const updateIcloudBulkUI = icloudManager?.updateIcloudBulkUI
  || (() => { });
const bindIcloudEvents = icloudManager?.bindIcloudEvents
  || (() => { });
bindIcloudEvents();

const luckmailManager = window.SidepanelLuckmailManager?.createLuckmailManager({
  dom: {
    btnLuckmailBulkDisable,
    btnLuckmailBulkEnable,
    btnLuckmailBulkPreserve,
    btnLuckmailBulkUnpreserve,
    btnLuckmailBulkUnused,
    btnLuckmailBulkUsed,
    btnLuckmailDisableUsed,
    btnLuckmailRefresh,
    checkboxLuckmailSelectAll,
    inputEmail,
    inputLuckmailSearch,
    luckmailList,
    luckmailSection,
    luckmailSelectionSummary,
    luckmailSummary,
    selectLuckmailFilter,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    formatLuckmailDateTime,
    getLuckmailPreserveTagName,
    normalizeLuckmailProjectName,
    openConfirmModal,
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  constants: {
    copyIcon: COPY_ICON,
  },
});
const queueLuckmailPurchaseRefresh = luckmailManager?.queueLuckmailPurchaseRefresh
  || (() => { });
const refreshLuckmailPurchases = luckmailManager?.refreshLuckmailPurchases
  || (async () => { });
const renderLuckmailPurchases = luckmailManager?.renderLuckmailPurchases
  || (() => { });
const resetLuckmailManager = luckmailManager?.reset
  || (() => { });
const bindLuckmailEvents = luckmailManager?.bindLuckmailEvents
  || (() => { });
bindLuckmailEvents();

const customEmailPoolManager = window.SidepanelCustomEmailPoolManager?.createCustomEmailPoolManager({
  dom: {
    btnCustomEmailPoolRefresh,
    btnCustomEmailPoolClearUsed,
    btnCustomEmailPoolDeleteAll,
    inputCustomEmailPoolImport,
    btnCustomEmailPoolImport,
    customEmailPoolSummary,
    inputCustomEmailPoolSearch,
    selectCustomEmailPoolFilter,
    checkboxCustomEmailPoolSelectAll,
    customEmailPoolSelectionSummary,
    btnCustomEmailPoolBulkUsed,
    btnCustomEmailPoolBulkUnused,
    btnCustomEmailPoolBulkEnable,
    btnCustomEmailPoolBulkDisable,
    btnCustomEmailPoolBulkDelete,
    customEmailPoolList,
  },
  helpers: {
    copyTextToClipboard,
    escapeHtml,
    openConfirmModal,
    showToast,
  },
  state: {
    getEntries: () => getNormalizedCustomEmailPoolEntriesState(),
    setEntries: (entries) => {
      setCustomEmailPoolEntriesState(entries);
    },
    getCurrentEmail: () => String(inputEmail?.value || latestState?.email || '').trim().toLowerCase(),
    isVisible: () => Boolean(rowCustomEmailPool) && rowCustomEmailPool.style.display !== 'none',
  },
  actions: {
    persistEntries: async () => {
      syncRunCountFromConfiguredEmailPool();
      updateMailProviderUI();
      markSettingsDirty(true);
      await saveSettings({ silent: true });
    },
    setRuntimeEmail: async (email) => {
      await setRuntimeEmailState(email);
      syncLatestState({ email });
      if (inputEmail) {
        inputEmail.value = email || '';
      }
    },
  },
  constants: {
    copyIcon: COPY_ICON,
  },
});
const queueCustomEmailPoolRefresh = customEmailPoolManager?.queueCustomEmailPoolRefresh
  || (() => { });
const refreshCustomEmailPoolEntries = customEmailPoolManager?.refreshCustomEmailPoolEntries
  || (async () => { });
const renderCustomEmailPoolEntries = customEmailPoolManager?.renderCustomEmailPoolEntries
  || (() => { });
const resetCustomEmailPoolManager = customEmailPoolManager?.reset
  || (() => { });
const bindCustomEmailPoolEvents = customEmailPoolManager?.bindEvents
  || (() => { });
bindCustomEmailPoolEvents();

const accountRecordsManager = window.SidepanelAccountRecordsManager?.createAccountRecordsManager({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    accountRecordsList,
    accountRecordsMeta,
    accountRecordsOverlay,
    accountRecordsPageLabel,
    accountRecordsStats,
    btnAccountRecordsNext,
    btnAccountRecordsPrev,
    btnClearAccountRecords,
    btnDeleteSelectedAccountRecords,
    btnCloseAccountRecords,
    btnOpenAccountRecords,
    btnToggleAccountRecordsSelection,
  },
  helpers: {
    escapeHtml,
    openConfirmModal,
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  constants: {
    displayTimeZone: DISPLAY_TIMEZONE,
    pageSize: 10,
  },
});
const renderAccountRecords = accountRecordsManager?.render
  || (() => { });
const bindAccountRecordEvents = accountRecordsManager?.bindEvents
  || (() => { });
const closeAccountRecordsPanel = accountRecordsManager?.closePanel
  || (() => { });
bindAccountRecordEvents();
const accountBookManager = window.SidepanelAccountBookManager?.createAccountBookManager({
  state: {
    getLatestState: () => latestState,
    syncLatestState,
  },
  dom: {
    accountBookOverlay,
    accountBookCount,
    accountBookBody,
    btnOpenAccountBook,
    btnExportAccountBook,
    btnClearAccountBook,
    btnCloseAccountBook,
  },
  helpers: {
    downloadTextFile,
    escapeHtml,
    openActionModal,
    openConfirmModal,
    showToast,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
});
const renderAccountBook = accountBookManager?.render
  || (() => { });
const bindAccountBookEvents = accountBookManager?.bindEvents
  || (() => { });
const closeAccountBookPanel = accountBookManager?.closePanel
  || (() => { });
bindAccountBookEvents();
const accountContributionManager = window.SidepanelContributionMode?.createContributionModeManager({
  state: {
    getLatestState: () => latestState,
  },
  dom: {
    btnConfigMenu,
    btnContributionMode,
    inputContributionNickname,
    inputContributionQq,
    contributionPrimaryStatusLabel,
    contributionSecondaryStatusLabel,
    contributionCallbackStatus,
    btnExitContributionMode,
    btnOpenAccountRecords,
    btnOpenContributionUpload,
    btnStartContribution,
    accountContributionBadge,
    accountContributionPanel,
    accountContributionSummary,
    accountContributionText,
    contributionOauthStatus,
    rowAccountRunHistoryHelperBaseUrl,
    rowPhoneVerificationEnabled,
    rowCustomPassword,
    rowLocalCpaStep9Mode,
    rowSub2ApiAccountPriority,
    rowSub2ApiDefaultProxy,
    rowSub2ApiEmail,
    rowSub2ApiGroup,
    rowSub2ApiPassword,
    rowSub2ApiUrl,
    rowVpsPassword,
    rowVpsUrl,
    selectPanelMode,
  },
  helpers: {
    applySettingsState,
    closeAccountRecordsPanel,
    closeConfigMenu,
    getContributionNickname: () => latestState?.email || '',
    getContributionProfile: () => ({
      nickname: String(inputContributionNickname?.value || '').trim(),
      qq: String(inputContributionQq?.value || '').trim(),
    }),
    getSelectedFlowId: () => (typeof getSelectedFlowId === 'function'
      ? getSelectedFlowId(latestState)
      : String(latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID),
    getSelectedTargetId: (flowId, state = latestState) => (typeof getSelectedTargetIdForState === 'function'
      ? getSelectedTargetIdForState(state, flowId)
      : (String(state?.panelMode || state?.kiroTargetId || 'cpa').trim().toLowerCase() || 'cpa')),
    isModeSwitchBlocked: isContributionModeSwitchBlocked,
    openConfirmModal,
    openExternalUrl,
    persistCurrentSettingsForAction,
    showToast,
    startContributionAutoRun: () => startAutoRunFromCurrentSettings(),
    updateAccountRunHistorySettingsUI,
    updateConfigMenuControls,
    updatePanelModeUI,
    updateStatusDisplay,
  },
  runtime: {
    sendMessage: (message) => chrome.runtime.sendMessage(message),
  },
  constants: {
    contributionOauthUrl: `${String(contributionContentService?.portalUrl || 'https://flowpilot.qlhazycoder.top').replace(/\/+$/, '')}/oauth/`,
    contributionPortalUrl: String(contributionContentService?.portalUrl || 'https://flowpilot.qlhazycoder.top').replace(/\/+$/, ''),
    contributionUploadUrl: `${String(contributionContentService?.portalUrl || 'https://flowpilot.qlhazycoder.top').replace(/\/+$/, '')}/upload`,
  },
});
const baseRenderAccountContribution = accountContributionManager?.render
  || (() => { });
const renderContributionMode = () => {
  baseRenderAccountContribution();
  renderContributionUpdateHint();
  updateSignupMethodUI({ notify: true });
};
const bindAccountContributionEvents = accountContributionManager?.bindEvents
  || (() => { });
bindAccountContributionEvents();
renderStepsList();

async function exportSettingsFile() {
  closeConfigMenu();
  configActionInFlight = true;
  updateConfigMenuControls();

  try {
    await flushPendingSettingsBeforeExport();
    const response = await chrome.runtime.sendMessage({
      type: 'EXPORT_SETTINGS',
      source: 'sidepanel',
      payload: {},
    });

    if (response?.error) {
      throw new Error(response.error);
    }
    if (!response?.fileContent || !response?.fileName) {
      throw new Error('\u672a\u751f\u6210\u53ef\u4e0b\u8f7d\u7684\u914d\u7f6e\u6587\u4ef6\u3002');
    }

    downloadTextFile(response.fileContent, response.fileName, 'application/json;charset=utf-8', {
      prependUtf8Bom: true,
    });
    showToast('\u914d\u7f6e\u5df2\u5bfc\u51fa\uff1a' + response.fileName, 'success', 2200);
  } catch (err) {
    showToast('\u5bfc\u51fa\u914d\u7f6e\u5931\u8d25\uff1a' + err.message, 'error');
  } finally {
    configActionInFlight = false;
    updateConfigMenuControls();
  }
}

async function importSettingsFromFile(file) {
  if (!file) return;

  configActionInFlight = true;
  closeConfigMenu();
  updateConfigMenuControls();

  try {
    await settlePendingSettingsBeforeImport();
    const rawText = await file.text();
    const normalizedText = String(rawText || '').replace(/^\uFEFF/, '');

    let parsedConfig = null;
    try {
      parsedConfig = JSON.parse(normalizedText);
    } catch {
      throw new Error('\u914d\u7f6e\u6587\u4ef6\u4e0d\u662f\u6709\u6548\u7684 JSON\u3002');
    }

    const confirmed = await openConfirmModal({
      title: '\u5bfc\u5165\u914d\u7f6e',
      message: '\u786e\u8ba4\u5bfc\u5165\u914d\u7f6e\u6587\u4ef6 "' + file.name + '" \u5417\uff1f\u5bfc\u5165\u540e\u4f1a\u8986\u76d6\u5f53\u524d\u914d\u7f6e\u3002',
      confirmLabel: '\u786e\u8ba4\u8986\u76d6\u5bfc\u5165',
      confirmVariant: 'btn-danger',
    });
    if (!confirmed) {
      return;
    }

    const response = await chrome.runtime.sendMessage({
      type: 'IMPORT_SETTINGS',
      source: 'sidepanel',
      payload: {
        config: parsedConfig,
      },
    });

    if (response?.error) {
      throw new Error(response.error);
    }
    if (!response?.state) {
      throw new Error('\u5bfc\u5165\u540e\u672a\u8fd4\u56de\u6700\u65b0\u914d\u7f6e\u72b6\u6001\u3002');
    }

    applySettingsState(response.state);
    updateStatusDisplay(latestState);
    showToast('\u914d\u7f6e\u5df2\u5bfc\u5165\uff0c\u5f53\u524d\u914d\u7f6e\u5df2\u8986\u76d6\u3002', 'success', 2200);
  } catch (err) {
    showToast('\u5bfc\u5165\u914d\u7f6e\u5931\u8d25\uff1a' + err.message, 'error');
  } finally {
    configActionInFlight = false;
    updateConfigMenuControls();
    if (inputImportSettingsFile) {
      inputImportSettingsFile.value = '';
    }
  }
}

function syncPasswordToggleLabel() {
  syncToggleButtonLabel(btnTogglePassword, inputPassword, {
    show: '显示密码',
    hide: '隐藏密码',
  });
}

function syncVpsUrlToggleLabel() {
  syncToggleButtonLabel(btnToggleVpsUrl, inputVpsUrl, {
    show: '显示 CPA 地址',
    hide: '隐藏 CPA 地址',
  });
}

function syncVpsPasswordToggleLabel() {
  syncToggleButtonLabel(btnToggleVpsPassword, inputVpsPassword, {
    show: '显示管理密钥',
    hide: '隐藏管理密钥',
  });
}

function syncIpProxyApiUrlToggleLabel() {
  syncToggleButtonLabel(btnToggleIpProxyApiUrl, inputIpProxyApiUrl, {
    show: '显示代理 API',
    hide: '隐藏代理 API',
  });
}

function syncIpProxyUsernameToggleLabel() {
  syncToggleButtonLabel(btnToggleIpProxyUsername, inputIpProxyUsername, {
    show: '显示代理账号',
    hide: '隐藏代理账号',
  });
}

function syncIpProxyPasswordToggleLabel() {
  syncToggleButtonLabel(btnToggleIpProxyPassword, inputIpProxyPassword, {
    show: '显示代理密码',
    hide: '隐藏代理密码',
  });
}

function syncHeroSmsApiKeyToggleLabel() {
  syncToggleButtonLabel(btnToggleHeroSmsApiKey, inputHeroSmsApiKey, {
    show: '显示接码 API Key',
    hide: '隐藏接码 API Key',
  });
}

async function maybeTakeoverAutoRun(actionLabel) {
  if (!isAutoRunPausedPhase()) {
    return true;
  }

  const confirmed = await openConfirmModal({
    title: '接管自动',
    message: `当前自动流程已暂停。若继续${actionLabel}，将停止自动流程并切换为手动控制。是否继续？`,
    confirmLabel: '确认接管',
    confirmVariant: 'btn-primary',
  });
  if (!confirmed) {
    return false;
  }

  await chrome.runtime.sendMessage({ type: 'TAKEOVER_AUTO_RUN', source: 'sidepanel', payload: {} });
  return true;
}

async function handleSkipNode(nodeId) {
  const normalizedNodeId = String(nodeId || '').trim();
  if (!normalizedNodeId) {
    throw new Error('缺少要跳过的节点。');
  }
  if (isAutoRunPausedPhase()) {
    const takeoverResponse = await chrome.runtime.sendMessage({
      type: 'TAKEOVER_AUTO_RUN',
      source: 'sidepanel',
      payload: {},
    });
    if (takeoverResponse?.error) {
      throw new Error(takeoverResponse.error);
    }
  }

  await persistCurrentSettingsForAction();

  const response = await chrome.runtime.sendMessage({
    type: 'SKIP_NODE',
    source: 'sidepanel',
    payload: {
      nodeId: normalizedNodeId,
      step: getStepIdByNodeIdForCurrentMode(normalizedNodeId),
    },
  });

  if (response?.error) {
    throw new Error(response.error);
  }

  showToast(`节点 ${normalizedNodeId} 已跳过`, 'success', 2200);
}

async function handleSkipStep(step) {
  const nodeId = getNodeIdByStepForCurrentMode(step);
  if (!nodeId) {
    throw new Error(`无效步骤：${step}`);
  }
  return handleSkipNode(nodeId);
}

// ============================================================
// Button Handlers
// ============================================================

stepsList?.addEventListener('click', async (event) => {
  const btn = event.target.closest('.step-btn');
  if (!btn) {
    return;
  }
  try {
    const step = Number(btn.dataset.step);
    const nodeId = String(btn.dataset.nodeId || getNodeIdByStepForCurrentMode(step) || '').trim();
    if (!(await maybeTakeoverAutoRun(`执行节点 ${nodeId || step}`))) {
      return;
    }
    await persistCurrentSettingsForAction();
    const gpcCreateStep = getStepIdByKeyForCurrentMode('plus-checkout-create') || 6;
    if (step === gpcCreateStep && !(await ensureGpcApiKeyReadyForStart())) {
      return;
    }
    const shouldPersistSharedPassword = nodeId === 'fill-password' || nodeId === 'kiro-submit-password';
    if (shouldPersistSharedPassword && inputPassword.value !== (latestState?.customPassword || '')) {
      await chrome.runtime.sendMessage({
        type: 'SAVE_SETTING',
        source: 'sidepanel',
        payload: { customPassword: inputPassword.value },
      });
      syncLatestState({ customPassword: inputPassword.value });
    }
    if (nodeId === 'fill-password') {
      if (shouldExecuteStep3WithSignupPhoneIdentity(latestState)) {
        const response = await sendSidepanelMessage({ type: 'EXECUTE_NODE', source: 'sidepanel', payload: { nodeId } });
        if (response?.error) {
          throw new Error(response.error);
        }
      } else if (selectMailProvider.value === 'hotmail-api' || isLuckmailProvider()) {
        const response = await sendSidepanelMessage({ type: 'EXECUTE_NODE', source: 'sidepanel', payload: { nodeId } });
        if (response?.error) {
          throw new Error(response.error);
        }
      } else if (false && usesGeneratedAliasMailProvider(selectMailProvider.value)) {
        const emailPrefix = inputEmailPrefix.value.trim();
        if (!emailPrefix) {
          showToast(selectMailProvider.value === GMAIL_PROVIDER ? '请先填写 Gmail 原邮箱。' : '请先填写 2925 邮箱前缀。', 'warn');
          return;
        }
        const response = await sendSidepanelMessage({ type: 'EXECUTE_NODE', source: 'sidepanel', payload: { nodeId, emailPrefix } });
        if (response?.error) {
          throw new Error(response.error);
        }
      } else {
        let email = inputEmail.value.trim();
        if (!email) {
          if (isCustomMailProvider()) {
            showToast('当前邮箱服务为自定义邮箱，请先填写注册邮箱后再执行第 3 步。', 'warn');
            return;
          }
          try {
            email = await fetchGeneratedEmail({ showFailureToast: false });
          } catch (err) {
            showToast(`自动获取失败：${err.message}，请手动粘贴邮箱后重试。`, 'warn');
            return;
          }
        }
        if (!validateCurrentRegistrationEmail(email, { showToastOnFailure: true })) {
          return;
        }
        const response = await sendSidepanelMessage({ type: 'EXECUTE_NODE', source: 'sidepanel', payload: { nodeId, email } });
        if (response?.error) {
          throw new Error(response.error);
        }
      }
    } else {
      const response = await sendSidepanelMessage({ type: 'EXECUTE_NODE', source: 'sidepanel', payload: { nodeId } });
      if (response?.error) {
        throw new Error(response.error);
      }
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
});

btnFetchEmail.addEventListener('click', async () => {
  if (selectMailProvider.value === 'hotmail-api' || isLuckmailProvider() || isCustomMailProvider()) {
    return;
  }
  await fetchGeneratedEmail().catch(() => { });
});

btnTogglePassword.addEventListener('click', () => {
  inputPassword.type = inputPassword.type === 'password' ? 'text' : 'password';
  syncPasswordToggleLabel();
});

btnToggleVpsUrl.addEventListener('click', () => {
  inputVpsUrl.type = inputVpsUrl.type === 'password' ? 'text' : 'password';
  syncVpsUrlToggleLabel();
});

btnToggleVpsPassword.addEventListener('click', () => {
  inputVpsPassword.type = inputVpsPassword.type === 'password' ? 'text' : 'password';
  syncVpsPasswordToggleLabel();
});

btnToggleIpProxyApiUrl?.addEventListener('click', () => {
  inputIpProxyApiUrl.type = inputIpProxyApiUrl.type === 'password' ? 'text' : 'password';
  syncIpProxyApiUrlToggleLabel();
});

btnToggleIpProxyUsername?.addEventListener('click', () => {
  inputIpProxyUsername.type = inputIpProxyUsername.type === 'password' ? 'text' : 'password';
  syncIpProxyUsernameToggleLabel();
});

btnToggleIpProxyPassword?.addEventListener('click', () => {
  inputIpProxyPassword.type = inputIpProxyPassword.type === 'password' ? 'text' : 'password';
  syncIpProxyPasswordToggleLabel();
});

btnToggleIpProxySection?.addEventListener('click', () => {
  if (typeof toggleIpProxySectionExpanded === 'function') {
    toggleIpProxySectionExpanded();
  }
});

btnTogglePhoneVerificationSection?.addEventListener('click', () => {
  togglePhoneVerificationSectionExpanded();
});

btnMailLogin?.addEventListener('click', async () => {
  const config = getMailProviderLoginConfig();
  const loginUrl = getMailProviderLoginUrl();
  if (!config || !loginUrl) {
    return;
  }

  try {
    await chrome.tabs.create({ url: loginUrl, active: true });
  } catch (err) {
    showToast(`打开${config.label}失败：${err.message}`, 'error');
  }
});

btnIpProxyServiceLogin?.addEventListener('click', () => {
  const service = normalizeIpProxyService(
    selectIpProxyService?.value || latestState?.ipProxyService || DEFAULT_IP_PROXY_SERVICE
  );
  const config = getIpProxyServiceLoginConfig(service);
  const loginUrl = getIpProxyServiceLoginUrl(service);
  if (!config || !loginUrl) {
    showToast('当前代理服务没有可跳转的登录页。', 'warn', 1800);
    return;
  }
  openExternalUrl(loginUrl);
});

localCpaStep9ModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextMode = button.dataset.localCpaStep9Mode;
    if (getSelectedLocalCpaStep9Mode() === normalizeLocalCpaStep9Mode(nextMode)) {
      return;
    }
    setLocalCpaStep9Mode(nextMode);
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

hotmailServiceModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (button.disabled) {
      return;
    }
    const nextMode = button.dataset.hotmailServiceMode;
    if (getSelectedHotmailServiceMode() === normalizeHotmailServiceMode(nextMode)) {
      return;
    }
    setHotmailServiceMode(nextMode);
    updateMailProviderUI();
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

btnSaveSettings.addEventListener('click', async () => {
  if (!settingsDirty) {
    showToast('配置已是最新', 'info', 1400);
    return;
  }
  await saveSettings({ silent: false }).catch(() => { });
});

btnStop.addEventListener('click', async () => {
  btnStop.disabled = true;
  await chrome.runtime.sendMessage({ type: 'STOP_FLOW', source: 'sidepanel', payload: {} });
  showToast(isAutoRunScheduledPhase() ? '正在取消倒计时计划...' : '正在停止当前流程...', 'warn', 2000);
});

btnConfigMenu?.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleConfigMenu();
});

btnRepoHome?.addEventListener('click', () => {
  openRepositoryHomePage();
});

btnCloudflareTempEmailUsageGuide?.addEventListener('click', () => {
  openCloudflareTempEmailUsageGuidePage();
});

btnCloudflareTempEmailGithub?.addEventListener('click', () => {
  openCloudflareTempEmailRepositoryPage();
});

btnDismissContributionUpdateHint?.addEventListener('click', (event) => {
  event.stopPropagation();
  dismissContributionUpdateHint();
});

configMenu?.addEventListener('click', (event) => {
  event.stopPropagation();
});

btnExportSettings?.addEventListener('click', async () => {
  if (configActionInFlight || settingsSaveInFlight) {
    return;
  }
  await exportSettingsFile();
});

btnImportSettings?.addEventListener('click', async () => {
  if (configActionInFlight || settingsSaveInFlight) {
    return;
  }
  closeConfigMenu();
  if (inputImportSettingsFile) {
    inputImportSettingsFile.value = '';
    inputImportSettingsFile.click();
  }
});

inputImportSettingsFile?.addEventListener('change', async () => {
  const file = inputImportSettingsFile.files?.[0] || null;
  await importSettingsFromFile(file);
});

autoStartModal?.addEventListener('click', (event) => {
  if (event.target === autoStartModal) {
    resolveModalChoice(null);
  }
});
autoStartMessage?.addEventListener('click', (event) => {
  const link = event.target?.closest?.('a[data-external-url]');
  if (!link) return;
  event.preventDefault();
  openExternalUrl(link.dataset.externalUrl || link.href);
});
autoRunAdBar?.addEventListener('click', (event) => {
  const link = event.target?.closest?.('a[data-external-url]');
  if (!link) return;
  event.preventDefault();
  openExternalUrl(link.dataset.externalUrl || link.href);
});
btnAutoStartClose?.addEventListener('click', () => resolveModalChoice(null));

async function startAutoRunFromCurrentSettings() {
  const initialLockedRunCount = typeof getLockedRunCountFromEmailPool === 'function'
    ? getLockedRunCountFromEmailPool()
    : 0;
  const requestedTotalRuns = initialLockedRunCount > 0
    ? initialLockedRunCount
    : getRunCountValue();
  registerPendingAutoRunStartRunCount(requestedTotalRuns);

  // 站点内容刷新只影响提示/广告展示，不应阻塞自动流程启动。
  refreshContributionContentHint().catch((error) => {
    console.warn('Failed to refresh contribution content hint before auto run:', error);
  });

  if (typeof persistCurrentSettingsForAction === 'function') {
    await persistCurrentSettingsForAction();
  }
  const autoRunStartValidation = (() => {
    const rootScope = typeof window !== 'undefined' ? window : globalThis;
    const registry = rootScope.MultiPageFlowCapabilities?.createFlowCapabilityRegistry?.({
      defaultFlowId: typeof DEFAULT_ACTIVE_FLOW_ID === 'string' ? DEFAULT_ACTIVE_FLOW_ID : 'openai',
    }) || null;
    if (!registry?.validateAutoRunStart) {
      return { ok: true, errors: [] };
    }
    const validationState = {
      ...(latestState || {}),
      panelMode: typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode,
      signupMethod: typeof getSelectedSignupMethod === 'function' ? getSelectedSignupMethod() : latestState?.signupMethod,
      phoneVerificationEnabled: typeof inputPhoneVerificationEnabled !== 'undefined' && inputPhoneVerificationEnabled
        ? Boolean(inputPhoneVerificationEnabled.checked)
        : Boolean(latestState?.phoneVerificationEnabled),
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled: typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
        ? Boolean(inputPhonePlusModeEnabled.checked)
        : Boolean(latestState?.phonePlusModeEnabled),
      accountContributionEnabled: Boolean(latestState?.accountContributionEnabled),
    };
    return registry.validateAutoRunStart({
      activeFlowId: validationState.activeFlowId,
      panelMode: validationState.panelMode,
      signupMethod: validationState.signupMethod,
      state: validationState,
    });
  })();
  if (autoRunStartValidation?.ok === false) {
    clearPendingAutoRunStartRunCount();
    throw new Error(autoRunStartValidation.errors?.[0]?.message || '当前设置不支持启动自动流程。');
  }
  if (!(await ensureGpcApiKeyReadyForStart())) {
    clearPendingAutoRunStartRunCount();
    return false;
  }

  const customEmailPoolEnabled = typeof usesCustomEmailPoolGenerator === 'function'
    && usesCustomEmailPoolGenerator();
  const lockedRunCount = typeof getLockedRunCountFromEmailPool === 'function'
    ? getLockedRunCountFromEmailPool()
    : 0;
  if (customEmailPoolEnabled && lockedRunCount <= 0) {
    throw new Error('请先在邮箱池里至少填写 1 个邮箱。');
  }
  const totalRuns = lockedRunCount > 0 ? lockedRunCount : requestedTotalRuns;
  registerPendingAutoRunStartRunCount(totalRuns);
  if (lockedRunCount > 0) {
    inputRunCount.value = String(lockedRunCount);
  }
  let mode = 'restart';
  const autoRunSkipFailures = inputAutoSkipFailures.checked;
  const autoRunRetryPaypalCallback = typeof inputAutoRunRetryPaypalCallback !== 'undefined' && inputAutoRunRetryPaypalCallback
    ? Boolean(inputAutoRunRetryPaypalCallback.checked)
    : false;
  const autoRunPreserveIssueLogsOnRestart = typeof inputAutoRunPreserveIssueLogsOnRestart !== 'undefined' && inputAutoRunPreserveIssueLogsOnRestart
    ? Boolean(inputAutoRunPreserveIssueLogsOnRestart.checked)
    : false;
  const contributionNickname = String(inputContributionNickname?.value || '').trim();
  const contributionQq = String(inputContributionQq?.value || '').trim();
  const fallbackThreadIntervalMinutes = normalizeAutoRunThreadIntervalMinutes(
    inputAutoSkipFailuresThreadIntervalMinutes.value
  );
  inputAutoSkipFailuresThreadIntervalMinutes.value = String(fallbackThreadIntervalMinutes);

  if (shouldOfferAutoModeChoice()) {
    const startStep = getFirstUnfinishedStep();
    const runningStep = getRunningSteps()[0] ?? null;
    const choice = await openAutoStartChoiceDialog(startStep, { runningStep });
    if (!choice) {
      clearPendingAutoRunStartRunCount();
      return false;
    }
    mode = choice;
  }

  if (shouldWarnAutoRunFallbackRisk(totalRuns, autoRunSkipFailures)
    && !isAutoRunFallbackRiskPromptDismissed()) {
    const result = await openAutoRunFallbackRiskConfirmModal(totalRuns);
    if (!result.confirmed) {
      clearPendingAutoRunStartRunCount();
      return false;
    }
    if (result.dismissPrompt) {
      setAutoRunFallbackRiskPromptDismissed(true);
    }
  }

  btnAutoRun.disabled = true;
  inputRunCount.disabled = true;
  const delayEnabled = inputAutoDelayEnabled.checked;
  const delayMinutes = normalizeAutoDelayMinutes(inputAutoDelayMinutes.value);
  const activeFlowId = typeof getSelectedFlowId === 'function'
    ? getSelectedFlowId(latestState)
    : (String(latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID);
  const targetId = typeof getSelectedTargetId === 'function'
    ? getSelectedTargetId(activeFlowId)
    : (
      activeFlowId === DEFAULT_ACTIVE_FLOW_ID
        ? normalizePanelMode(latestState?.panelMode || 'cpa')
        : (String(latestState?.kiroTargetId || 'kiro-rs').trim().toLowerCase() || 'kiro-rs')
    );
  inputAutoDelayMinutes.value = String(delayMinutes);
  btnAutoRun.innerHTML = delayEnabled
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 计划中...'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg> 运行中...';
  const response = await sendSidepanelMessage({
    type: delayEnabled ? 'SCHEDULE_AUTO_RUN' : 'AUTO_RUN',
    source: 'sidepanel',
    payload: {
      totalRuns,
      delayMinutes,
      activeFlowId,
      targetId,
      autoRunSkipFailures,
      autoRunRetryPaypalCallback,
      autoRunPreserveIssueLogsOnRestart,
      accountContributionEnabled: Boolean(latestState?.accountContributionEnabled),
      contributionAdapterId: latestState?.contributionAdapterId || '',
      contributionNickname,
      contributionQq,
      mode,
    },
  });
  if (response?.error) {
    clearPendingAutoRunStartRunCount();
    throw new Error(response.error);
  }
  return true;
}

// Auto Run
btnAutoRun.addEventListener('click', async () => {
  try {
    await startAutoRunFromCurrentSettings();
  } catch (err) {
    clearPendingAutoRunStartRunCount();
    setDefaultAutoRunButton();
    inputRunCount.disabled = shouldLockRunCountToEmailPool();
    showToast(err.message, 'error');
  }
});

btnAutoContinue.addEventListener('click', async () => {
  const email = inputEmail.value.trim();
  if (!email) {
    showToast(
      isCustomMailProvider() ? '请先填写自定义注册邮箱。' : '请先获取或粘贴邮箱。',
      'warn'
    );
    return;
  }
  autoContinueBar.style.display = 'none';
  await sendSidepanelMessage({ type: 'RESUME_AUTO_RUN', source: 'sidepanel', payload: { email } });
});

btnAutoRunNow?.addEventListener('click', async () => {
  try {
    btnAutoRunNow.disabled = true;
    const waitingInterval = currentAutoRun.phase === 'waiting_interval';
    await sendSidepanelMessage({
      type: waitingInterval ? 'SKIP_AUTO_RUN_COUNTDOWN' : 'START_SCHEDULED_AUTO_RUN_NOW',
      source: 'sidepanel',
      payload: {},
    });
    if (waitingInterval) {
      showToast('已跳过当前倒计时，自动流程将立即继续。', 'info', 1800);
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnAutoRunNow.disabled = false;
  }
});

btnAutoCancelSchedule?.addEventListener('click', async () => {
  try {
    btnAutoCancelSchedule.disabled = true;
    await chrome.runtime.sendMessage({ type: 'CANCEL_SCHEDULED_AUTO_RUN', source: 'sidepanel', payload: {} });
    showToast('已取消倒计时计划。', 'info', 1800);
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    btnAutoCancelSchedule.disabled = false;
  }
});

// Reset
btnReset.addEventListener('click', async () => {
  const confirmed = await openConfirmModal({
    title: '重置流程',
    message: '确认重置全部步骤和数据吗？',
    confirmLabel: '确认重置',
    confirmVariant: 'btn-danger',
  });
  if (!confirmed) {
    return;
  }

  await chrome.runtime.sendMessage({ type: 'RESET', source: 'sidepanel' });
  syncLatestState({
    nodeStatuses: NODE_DEFAULT_STATUSES,
    currentHotmailAccountId: null,
    currentLuckmailPurchase: null,
    currentLuckmailMailCursor: null,
    email: null,
    signupPhoneNumber: '',
    accountIdentifierType: null,
    accountIdentifier: '',
  });
  syncAutoRunState({
    autoRunning: false,
    autoRunPhase: 'idle',
    autoRunCurrentRun: 0,
    autoRunTotalRuns: 1,
    autoRunAttemptRun: 0,
    scheduledAutoRunAt: null,
    autoRunCountdownAt: null,
    autoRunCountdownTitle: '',
    autoRunCountdownNote: '',
  });
  displayOauthUrl.textContent = '等待中...';
  displayOauthUrl.classList.remove('has-value');
  displayLocalhostUrl.textContent = '等待中...';
  displayLocalhostUrl.classList.remove('has-value');
  setKiroRsConnectionTestStatus('未测试');
  inputEmail.value = '';
  if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
    inputSignupPhone.value = '';
  }
  if (typeof syncSignupPhoneInputFromState === 'function') {
    syncSignupPhoneInputFromState(latestState);
  }
  displayStatus.textContent = '就绪';
  statusBar.className = 'status-bar';
  logArea.innerHTML = '';
  resetIcloudManager();
  document.querySelectorAll('.step-row').forEach(row => row.className = 'step-row');
  document.querySelectorAll('.step-status').forEach(el => el.textContent = '');
  setDefaultAutoRunButton();
  applyAutoRunStatus(currentAutoRun);
  markSettingsDirty(false);
  updateStopButtonState(false);
  updateButtonStates();
  updateProgressCounter();
  renderHotmailAccounts();
  resetLuckmailManager();
  if (isLuckmailProvider()) {
    queueLuckmailPurchaseRefresh();
  }
});

// Clear log
btnClearLog.addEventListener('click', () => {
  logArea.innerHTML = '';
});

// Save settings on change
inputEmail.addEventListener('change', async () => {
  if (selectMailProvider.value === 'hotmail-api' || isLuckmailProvider()) {
    return;
  }
  const email = inputEmail.value.trim();
  inputEmail.value = email;
  try {
    if (email) {
      if (!validateCurrentRegistrationEmail(email, { showToastOnFailure: true })) {
        return;
      }
      const response = await chrome.runtime.sendMessage({ type: 'SAVE_EMAIL', source: 'sidepanel', payload: { email } });
      if (response?.error) {
        throw new Error(response.error);
      }
    } else {
      await setRuntimeEmailState(null);
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
});
inputEmail.addEventListener('input', updateButtonStates);
if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
  inputSignupPhone.addEventListener('focus', () => {
    signupPhoneInputFocused = true;
  });
  inputSignupPhone.addEventListener('blur', async () => {
    signupPhoneInputFocused = false;
    if (!signupPhoneInputDirty) {
      return;
    }
    try {
      await persistSignupPhoneInputValue({ final: true, silent: true });
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
  inputSignupPhone.addEventListener('change', async () => {
    try {
      await persistSignupPhoneInputValue({ final: true, silent: true });
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
  inputSignupPhone.addEventListener('input', () => {
    signupPhoneInputDirty = true;
    updateButtonStates();
  });
}
inputVpsUrl.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputVpsUrl.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputVpsPassword.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputVpsPassword.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

[inputHotmailRemoteBaseUrl, inputHotmailLocalBaseUrl].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    if (input === inputPlusHostedCheckoutOauthDelaySeconds) {
      input.value = String(normalizePlusHostedCheckoutOauthDelaySeconds(input.value));
    }
    saveSettings({ silent: true }).catch(() => { });
  });
});

[inputOAuthOpenAfterRefreshWaitSeconds, inputPlusCheckoutCreatePreWaitSeconds, inputPlusCheckoutOpenStableWaitSeconds, inputPlusHostedCheckoutCardPreWaitSeconds].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    if (input === inputOAuthOpenAfterRefreshWaitSeconds) {
      input.value = String(normalizeOAuthOpenAfterRefreshWaitSeconds(input.value));
    } else if (input === inputPlusCheckoutCreatePreWaitSeconds) {
      input.value = String(normalizePlusCheckoutCreatePreWaitSeconds(input.value));
    } else if (input === inputPlusCheckoutOpenStableWaitSeconds) {
      input.value = String(normalizePlusCheckoutOpenStableWaitSeconds(input.value));
    } else if (input === inputPlusHostedCheckoutCardPreWaitSeconds) {
      input.value = String(normalizePlusHostedCheckoutCardPreWaitSeconds(input.value));
    }
    saveSettings({ silent: true }).catch(() => { });
  });
});

[inputLuckmailApiKey, inputLuckmailBaseUrl, inputLuckmailDomain].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    saveSettings({ silent: true }).catch(() => { });
  });
});

[inputYydsMailApiKey, inputYydsMailBaseUrl].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    saveSettings({ silent: true }).catch(() => { });
  });
});

selectLuckmailEmailType?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputPassword.addEventListener('input', () => {
  markSettingsDirty(true);
  updateButtonStates();
  scheduleSettingsAutoSave();
});
inputPassword.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

function setPlusCheckoutConversionProxyTestResult(message = '未测试', options = {}) {
  if (!displayPlusCheckoutConversionProxyTestResult) {
    return;
  }
  const normalizedMessage = String(message || '').trim() || '未测试';
  const status = String(options?.status || 'idle').trim().toLowerCase();
  const detail = String(options?.detail || '').trim();
  displayPlusCheckoutConversionProxyTestResult.textContent = normalizedMessage;
  displayPlusCheckoutConversionProxyTestResult.title = detail || normalizedMessage;
  displayPlusCheckoutConversionProxyTestResult.classList.remove('status-running', 'status-success', 'status-error');
  if (status === 'running') {
    displayPlusCheckoutConversionProxyTestResult.classList.add('status-running');
  } else if (status === 'success') {
    displayPlusCheckoutConversionProxyTestResult.classList.add('status-success');
  } else if (status === 'error') {
    displayPlusCheckoutConversionProxyTestResult.classList.add('status-error');
  }
}

function formatPlusCheckoutConversionProxyExitCheckTime(value = 0) {
  const timestamp = Number(value) || 0;
  if (!timestamp) {
    return '';
  }
  try {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '';
  }
}

function renderPlusCheckoutConversionProxyExitCheck(state = latestState) {
  if (!displayPlusCheckoutConversionProxyExitCheck) {
    return;
  }
  const exitCheck = state?.plusCheckoutConversionProxyExitCheck;
  const status = String(exitCheck?.status || '').trim().toLowerCase();
  let text = '未检测';
  let title = text;
  let statusClass = '';
  if (status === 'running') {
    text = '检测中...';
    title = String(exitCheck?.displayName || '').trim()
      ? `正在检测：${String(exitCheck.displayName).trim()}`
      : text;
    statusClass = 'status-running';
  } else if (status === 'success') {
    const exitIp = String(exitCheck?.exitIp || '').trim();
    const exitRegion = String(exitCheck?.exitRegion || '').trim();
    const exitSource = String(exitCheck?.exitSource || '').trim();
    const checkedTime = formatPlusCheckoutConversionProxyExitCheckTime(exitCheck?.checkedAt);
    text = [
      exitIp ? `${exitIp}${exitRegion ? ` [${exitRegion}]` : ''}` : '已检测',
      exitSource,
      checkedTime,
    ].filter(Boolean).join(' · ');
    title = [
      String(exitCheck?.displayName || '').trim() ? `代理：${String(exitCheck.displayName).trim()}` : '',
      String(exitCheck?.exitEndpoint || '').trim() ? `出口探测：${String(exitCheck.exitEndpoint).trim()}` : '',
      String(exitCheck?.diagnostics || '').trim() ? `诊断：${String(exitCheck.diagnostics).trim()}` : '',
    ].filter(Boolean).join(' | ') || text;
    statusClass = 'status-success';
  } else if (status === 'error') {
    const diagnostics = String(exitCheck?.diagnostics || '').trim();
    text = `检测失败：${diagnostics || '未获取到出口 IP'}`;
    title = text;
    statusClass = 'status-error';
  }
  displayPlusCheckoutConversionProxyExitCheck.textContent = text;
  displayPlusCheckoutConversionProxyExitCheck.title = title;
  displayPlusCheckoutConversionProxyExitCheck.classList.remove('status-running', 'status-success', 'status-error');
  if (statusClass) {
    displayPlusCheckoutConversionProxyExitCheck.classList.add(statusClass);
  }
}

function getPlusCheckoutConversionProxyManualSession(state = latestState) {
  const session = state?.plusCheckoutConversionProxyManualSession;
  return session && typeof session === 'object' && !Array.isArray(session) && session.active
    ? session
    : null;
}

function syncPlusCheckoutConversionProxySourceControl(source = 'manual') {
  const normalizedSource = normalizePlusCheckoutConversionProxySourceValue(source);
  if (typeof selectPlusCheckoutConversionProxySource !== 'undefined' && selectPlusCheckoutConversionProxySource) {
    selectPlusCheckoutConversionProxySource.value = normalizedSource;
  }
  if (typeof plusCheckoutConversionProxySourceButtons !== 'undefined' && Array.isArray(plusCheckoutConversionProxySourceButtons)) {
    plusCheckoutConversionProxySourceButtons.forEach((button) => {
      const active = normalizePlusCheckoutConversionProxySourceValue(button.dataset.plusCheckoutConversionProxySource) === normalizedSource;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  return normalizedSource;
}

function getSelectedPlusCheckoutConversionProxySource(state = latestState) {
  const selectValue = typeof selectPlusCheckoutConversionProxySource !== 'undefined' && selectPlusCheckoutConversionProxySource
    ? selectPlusCheckoutConversionProxySource.value
    : '';
  const activeButtonValue = typeof plusCheckoutConversionProxySourceButtons !== 'undefined' && Array.isArray(plusCheckoutConversionProxySourceButtons)
    ? plusCheckoutConversionProxySourceButtons.find((button) => button.classList.contains('active'))?.dataset.plusCheckoutConversionProxySource
    : '';
  return normalizePlusCheckoutConversionProxySourceValue(selectValue || activeButtonValue || state?.plusCheckoutConversionProxySource || 'manual');
}

function getCurrentPlusCheckoutConversionProxy711Region(state = latestState) {
  return normalizePlusCheckoutConversionProxy711RegionValue(
    typeof inputPlusCheckoutConversionProxy711Region !== 'undefined' && inputPlusCheckoutConversionProxy711Region
      ? inputPlusCheckoutConversionProxy711Region.value
      : state?.plusCheckoutConversionProxy711Region || ''
  );
}

function setPlusCheckoutConversionProxyButtonsBusy(isBusy = false, labels = {}) {
  const busy = Boolean(isBusy);
  const source = typeof getSelectedPlusCheckoutConversionProxySource === 'function'
    ? getSelectedPlusCheckoutConversionProxySource(latestState)
    : normalizePlusCheckoutConversionProxySourceValue(latestState?.plusCheckoutConversionProxySource || 'manual');
  const cloudEnabled = typeof isPlusCheckoutCloudConversionEnabled === 'function'
    ? isPlusCheckoutCloudConversionEnabled()
    : Boolean(latestState?.plusCheckoutCloudConversionEnabled);
  const switchDisabled = busy || cloudEnabled || source === 'ip_proxy';
  if (btnPlusCheckoutConversionProxyTest) {
    btnPlusCheckoutConversionProxyTest.disabled = busy;
    if (labels.test) {
      btnPlusCheckoutConversionProxyTest.textContent = labels.test;
    } else if (!busy) {
      btnPlusCheckoutConversionProxyTest.textContent = '测试代理';
    }
  }
  if (btnPlusCheckoutConversionProxySwitch) {
    btnPlusCheckoutConversionProxySwitch.disabled = switchDisabled;
    btnPlusCheckoutConversionProxySwitch.setAttribute?.('aria-disabled', switchDisabled ? 'true' : 'false');
    if (labels.switch) {
      btnPlusCheckoutConversionProxySwitch.textContent = labels.switch;
    } else if (!busy) {
      btnPlusCheckoutConversionProxySwitch.textContent = '切换代理';
    }
  }
  if (btnPlusCheckoutConversionProxyNext) {
    btnPlusCheckoutConversionProxyNext.disabled = busy;
    if (labels.next) {
      btnPlusCheckoutConversionProxyNext.textContent = labels.next;
    } else if (!busy) {
      btnPlusCheckoutConversionProxyNext.textContent = '下一个';
    }
  }
  if (btnPlusCheckoutConversionProxyCancel) {
    btnPlusCheckoutConversionProxyCancel.disabled = busy;
    if (labels.cancel) {
      btnPlusCheckoutConversionProxyCancel.textContent = labels.cancel;
    } else if (!busy) {
      btnPlusCheckoutConversionProxyCancel.textContent = '取消代理';
    }
  }
}

function renderPlusCheckoutConversionProxyRuntimeStatus(state = latestState) {
  if (!displayPlusCheckoutConversionProxyRuntimeStatus) {
    return;
  }
  const resolveSource = typeof getSelectedPlusCheckoutConversionProxySource === 'function'
    ? getSelectedPlusCheckoutConversionProxySource
    : ((currentState = latestState) => {
      const normalized = String(currentState?.plusCheckoutConversionProxySource || 'manual').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      if (normalized === 'ip_proxy') {
        return 'ip_proxy';
      }
      return 'manual';
    });
  const resolve711Region = typeof getCurrentPlusCheckoutConversionProxy711Region === 'function'
    ? getCurrentPlusCheckoutConversionProxy711Region
    : ((currentState = latestState) => {
      const normalized = String(currentState?.plusCheckoutConversionProxy711Region || '').trim().toUpperCase().replace(/[^A-Z]/g, '').slice(0, 2);
      return normalized.length === 2 ? normalized : '';
    });
  const normalizeSourceValue = typeof normalizePlusCheckoutConversionProxySourceValue === 'function'
    ? normalizePlusCheckoutConversionProxySourceValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      if (normalized === 'ip_proxy') {
        return 'ip_proxy';
      }
      return 'manual';
    });
  const session = getPlusCheckoutConversionProxyManualSession(state);
  const source = resolveSource(state);
  const inputProxyUrl = normalizePlusCheckoutConversionProxyUrlValue(
    typeof inputPlusCheckoutConversionProxy !== 'undefined' && inputPlusCheckoutConversionProxy
      ? inputPlusCheckoutConversionProxy.value
      : state?.plusCheckoutConversionProxyUrl || ''
  );
  const input711Region = resolve711Region(state);
  let text = '手动代理未开启';
  let title = text;
  let nextClass = '';
  if (source === '711proxy_pool') {
    text = `711 临时池未开启${input711Region ? `（国家代码：${input711Region}）` : '（国家代码跟随 IP 代理配置）'}`;
    title = text;
  } else if (source === 'direct') {
    text = '无代理模式未开启（支付转换相关域名直连）';
    title = text;
  } else if (source === 'ip_proxy') {
    text = 'IP代理模式（沿用当前 IP 代理/当前网络环境）';
    title = '支付转换代理不会额外切换或覆盖浏览器代理';
  }
  if (session?.active) {
    const displayName = String(session.displayName || '').trim() || '未知代理';
    const currentSource = normalizeSourceValue(session?.source || source);
    const pendingLabel = currentSource === '711proxy_pool'
      ? `711 临时池${input711Region ? ` [${input711Region}]` : ''}`
      : (currentSource === 'direct' ? '无代理模式' : (currentSource === 'ip_proxy' ? 'IP代理模式' : inputProxyUrl));
    if (currentSource === 'manual' && inputProxyUrl && inputProxyUrl !== String(session.proxyUrl || '').trim()) {
      text = `当前生效：${displayName}；待切换：${inputProxyUrl}`;
      title = text;
      nextClass = 'state-pending';
    } else if (
      currentSource === '711proxy_pool'
      && source === '711proxy_pool'
      && input711Region !== normalizePlusCheckoutConversionProxy711RegionValue(session.requestedRegion || '')
    ) {
      text = `当前生效：${displayName}；待切换：${pendingLabel}`;
      title = text;
      nextClass = 'state-pending';
    } else if (currentSource === 'direct' && source !== 'direct') {
      text = `当前生效：${displayName}；待切换：${source === '711proxy_pool' ? `711 临时池${input711Region ? ` [${input711Region}]` : ''}` : (source === 'ip_proxy' ? 'IP代理模式' : inputProxyUrl || '手动代理')}`;
      title = text;
      nextClass = 'state-pending';
    } else if (currentSource !== 'direct' && source === 'direct') {
      text = `当前生效：${displayName}；待切换：无代理模式`;
      title = text;
      nextClass = 'state-pending';
    } else if (currentSource === 'ip_proxy' && source !== 'ip_proxy') {
      text = `当前生效：${displayName}；待切换：${source === '711proxy_pool' ? `711 临时池${input711Region ? ` [${input711Region}]` : ''}` : (source === 'direct' ? '无代理模式' : inputProxyUrl || '手动代理')}`;
      title = text;
      nextClass = 'state-pending';
    } else if (currentSource !== 'ip_proxy' && source === 'ip_proxy') {
      text = `当前生效：${displayName}；待切换：IP代理模式`;
      title = text;
      nextClass = 'state-pending';
    } else {
      text = `当前生效：${displayName}`;
      title = text;
      nextClass = 'state-active';
    }
  }
  displayPlusCheckoutConversionProxyRuntimeStatus.textContent = text;
  displayPlusCheckoutConversionProxyRuntimeStatus.title = title;
  displayPlusCheckoutConversionProxyRuntimeStatus.classList.remove('state-active', 'state-pending');
  if (nextClass) {
    displayPlusCheckoutConversionProxyRuntimeStatus.classList.add(nextClass);
  }
}

function isPlusCheckoutCloudConversionEnabled() {
  if (typeof inputPlusCheckoutCloudConversionEnabled !== 'undefined' && inputPlusCheckoutCloudConversionEnabled) {
    return Boolean(inputPlusCheckoutCloudConversionEnabled.checked);
  }
  return Boolean(latestState?.plusCheckoutCloudConversionEnabled);
}

function validatePlusCheckoutCloudConversionConfig() {
  const method = normalizePlusPaymentMethod(
    typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod
      ? selectPlusPaymentMethod.value
      : latestState?.plusPaymentMethod
  );
  if (method !== 'paypal' || !isPlusCheckoutCloudConversionEnabled()) {
    return { valid: true, message: '' };
  }

  const normalizedApiUrl = normalizePlusCheckoutCloudConversionApiUrlValue(
    typeof inputPlusCheckoutCloudConversionApiUrl !== 'undefined' && inputPlusCheckoutCloudConversionApiUrl
      ? inputPlusCheckoutCloudConversionApiUrl.value
      : latestState?.plusCheckoutCloudConversionApiUrl
  );
  if (!normalizedApiUrl) {
    return {
      valid: false,
      message: '云端支付转换服务地址未内置成功，请联系开发者检查扩展配置。',
    };
  }

  try {
    const parsed = new URL(normalizedApiUrl);
    if (!/^https?:$/i.test(String(parsed.protocol || ''))) {
      throw new Error('unsupported protocol');
    }
  } catch {
    return {
      valid: false,
      message: '云端支付转换服务地址不是有效的 HTTP/HTTPS URL。',
    };
  }

  return { valid: true, message: '' };
}

function updatePlusCheckoutConversionModeUi() {
  const cloudEnabled = isPlusCheckoutCloudConversionEnabled();
  const resolveSource = typeof getSelectedPlusCheckoutConversionProxySource === 'function'
    ? getSelectedPlusCheckoutConversionProxySource
    : ((state = latestState) => {
      const normalized = String(state?.plusCheckoutConversionProxySource || 'manual').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      if (normalized === 'ip_proxy') {
        return 'ip_proxy';
      }
      return 'manual';
    });
  const normalizeSourceValue = typeof normalizePlusCheckoutConversionProxySourceValue === 'function'
    ? normalizePlusCheckoutConversionProxySourceValue
    : ((value = '') => {
      const normalized = String(value || '').trim().toLowerCase();
      if (normalized === '711proxy_pool') {
        return '711proxy_pool';
      }
      if (normalized === 'direct') {
        return 'direct';
      }
      if (normalized === 'ip_proxy') {
        return 'ip_proxy';
      }
      return 'manual';
    });
  const plusModeEnabled = typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
    ? Boolean(inputPlusModeEnabled.checked)
    : Boolean(latestState?.plusModeEnabled);
  const selectedMethod = normalizePlusPaymentMethod(
    typeof selectPlusPaymentMethod !== 'undefined' && selectPlusPaymentMethod
      ? selectPlusPaymentMethod.value
      : latestState?.plusPaymentMethod
  );
  const paypalMode = selectedMethod === 'paypal';
  const cloudRowsVisible = plusModeEnabled && paypalMode && cloudEnabled;
  const source = resolveSource(latestState);
  const manualMode = source === 'manual';
  const directMode = source === 'direct';
  const poolMode = source === '711proxy_pool';
  const ipProxyMode = source === 'ip_proxy';

  if (typeof syncPlusCheckoutConversionProxySourceControl === 'function') {
    syncPlusCheckoutConversionProxySourceControl(source);
  } else if (typeof plusCheckoutConversionProxySourceButtons !== 'undefined' && Array.isArray(plusCheckoutConversionProxySourceButtons)) {
    plusCheckoutConversionProxySourceButtons.forEach((button) => {
      const active = normalizeSourceValue(button.dataset.plusCheckoutConversionProxySource) === source;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }
  if (typeof selectPlusCheckoutConversionProxySource !== 'undefined' && selectPlusCheckoutConversionProxySource) {
    selectPlusCheckoutConversionProxySource.disabled = cloudEnabled;
    selectPlusCheckoutConversionProxySource.setAttribute('aria-disabled', cloudEnabled ? 'true' : 'false');
  }
  if (typeof plusCheckoutConversionProxySourceButtons !== 'undefined' && Array.isArray(plusCheckoutConversionProxySourceButtons)) {
    plusCheckoutConversionProxySourceButtons.forEach((button) => {
      button.disabled = cloudEnabled;
    });
  }

  if (typeof inputPlusCheckoutConversionProxy !== 'undefined' && inputPlusCheckoutConversionProxy) {
    inputPlusCheckoutConversionProxy.style.display = manualMode ? '' : 'none';
    inputPlusCheckoutConversionProxy.disabled = cloudEnabled;
    inputPlusCheckoutConversionProxy.readOnly = cloudEnabled;
    inputPlusCheckoutConversionProxy.setAttribute('aria-disabled', cloudEnabled ? 'true' : 'false');
  }
  if (typeof plusCheckoutConversionProxy711Shell !== 'undefined' && plusCheckoutConversionProxy711Shell) {
    plusCheckoutConversionProxy711Shell.style.display = poolMode ? '' : 'none';
  }
  if (typeof inputPlusCheckoutConversionProxy711Region !== 'undefined' && inputPlusCheckoutConversionProxy711Region) {
    inputPlusCheckoutConversionProxy711Region.disabled = cloudEnabled;
    inputPlusCheckoutConversionProxy711Region.readOnly = cloudEnabled;
    inputPlusCheckoutConversionProxy711Region.setAttribute('aria-disabled', cloudEnabled ? 'true' : 'false');
  }
  if (typeof btnPlusCheckoutConversionProxyTest !== 'undefined' && btnPlusCheckoutConversionProxyTest) {
    btnPlusCheckoutConversionProxyTest.disabled = cloudEnabled;
    btnPlusCheckoutConversionProxyTest.setAttribute('aria-disabled', cloudEnabled ? 'true' : 'false');
  }
  if (typeof btnPlusCheckoutConversionProxyNext !== 'undefined' && btnPlusCheckoutConversionProxyNext) {
    btnPlusCheckoutConversionProxyNext.style.display = (!cloudEnabled && poolMode) ? '' : 'none';
    btnPlusCheckoutConversionProxyNext.disabled = cloudEnabled;
    btnPlusCheckoutConversionProxyNext.setAttribute('aria-disabled', cloudEnabled ? 'true' : 'false');
  }
  if (typeof btnPlusCheckoutConversionProxySwitch !== 'undefined' && btnPlusCheckoutConversionProxySwitch) {
    btnPlusCheckoutConversionProxySwitch.disabled = cloudEnabled || ipProxyMode;
    btnPlusCheckoutConversionProxySwitch.setAttribute('aria-disabled', (cloudEnabled || ipProxyMode) ? 'true' : 'false');
    btnPlusCheckoutConversionProxySwitch.title = ipProxyMode
      ? 'IP代理模式会沿用当前 IP 代理/当前网络环境，无需额外切换'
      : '手动启用当前支付转换代理';
  }
  if (typeof rowPlusCheckoutCloudConversionApiUrl !== 'undefined' && rowPlusCheckoutCloudConversionApiUrl) {
    rowPlusCheckoutCloudConversionApiUrl.style.display = cloudRowsVisible ? '' : 'none';
  }
  if (typeof rowPlusCheckoutCloudConversionApiKey !== 'undefined' && rowPlusCheckoutCloudConversionApiKey) {
    rowPlusCheckoutCloudConversionApiKey.style.display = cloudRowsVisible ? '' : 'none';
  }
  if (typeof inputPlusCheckoutCloudConversionApiUrl !== 'undefined' && inputPlusCheckoutCloudConversionApiUrl) {
    inputPlusCheckoutCloudConversionApiUrl.disabled = !cloudEnabled;
  }
  if (typeof inputPlusCheckoutCloudConversionApiKey !== 'undefined' && inputPlusCheckoutCloudConversionApiKey) {
    inputPlusCheckoutCloudConversionApiKey.disabled = !cloudEnabled;
  }

  if (cloudEnabled) {
    setPlusCheckoutConversionProxyTestResult('云端模式', {
      detail: '已启用云端支付转换，本地支付转换代理与代理测试已自动停用。',
    });
  } else if (source === '711proxy_pool') {
    setPlusCheckoutConversionProxyTestResult('711 临时池', {
      detail: '将从已保存的 711Proxy API 配置临时拉取代理池，并在本次支付转换完成后恢复原网络环境。',
    });
  } else if (source === 'direct') {
    setPlusCheckoutConversionProxyTestResult('无代理模式', {
      detail: '本次检测会临时绕过当前 IP 代理，仅让支付转换相关域名直连，并在完成后恢复原网络环境。',
    });
  } else if (source === 'ip_proxy') {
    setPlusCheckoutConversionProxyTestResult('IP代理模式', {
      detail: '将沿用当前 IP 代理/当前网络环境，不额外切换支付转换代理。',
    });
  }
}

async function handlePlusCheckoutConversionProxyTest() {
  if (!btnPlusCheckoutConversionProxyTest) {
    return;
  }
  const source = getSelectedPlusCheckoutConversionProxySource(latestState);
  const proxyUrl = normalizePlusCheckoutConversionProxyUrlValue(inputPlusCheckoutConversionProxy?.value || '');
  const proxy711Region = getCurrentPlusCheckoutConversionProxy711Region(latestState);
  if (inputPlusCheckoutConversionProxy) {
    inputPlusCheckoutConversionProxy.value = proxyUrl;
  }
  if (source === 'manual' && !proxyUrl) {
    setPlusCheckoutConversionProxyTestResult('请先填写代理', {
      status: 'error',
      detail: '请先填写支付转换代理地址，再执行测试。',
    });
    showToast('请先填写支付转换代理地址。', 'error');
    return;
  }

  setPlusCheckoutConversionProxyButtonsBusy(true, { test: '测试中...' });
  setPlusCheckoutConversionProxyTestResult('测试中...', {
    status: 'running',
    detail: '正在检测代理出口和 chatgpt.com 可达性。',
  });

  try {
    const response = await sendRuntimeMessageWithTimeout({
      type: 'TEST_PLUS_CHECKOUT_CONVERSION_PROXY',
      source: 'sidepanel',
      payload: {
        source,
        proxyUrl,
        proxy711Region,
        ipProxyStateOverride: source === '711proxy_pool' && typeof buildCurrentIpProxyActionStateOverride === 'function'
          ? buildCurrentIpProxyActionStateOverride(latestState)
          : undefined,
      },
    }, 45000, '支付转换代理测试');
    if (response?.error) {
      throw new Error(response.error);
    }
    const exitIp = String(response?.exitIp || '').trim();
    const exitRegion = String(response?.exitRegion || '').trim();
    const exitSummary = exitIp
      ? `${exitIp}${exitRegion ? ` [${exitRegion}]` : ''}`
      : '已连通';
    const detailParts = [
      response?.proxyDisplayName ? `代理：${response.proxyDisplayName}` : '',
      response?.exitEndpoint ? `出口探测：${response.exitEndpoint}` : '',
      response?.targetEndpoint ? `目标连通：${response.targetEndpoint}` : '',
      response?.diagnostics ? `诊断：${response.diagnostics}` : '',
    ].filter(Boolean);
    setPlusCheckoutConversionProxyTestResult(`可用: ${exitSummary}`, {
      status: 'success',
      detail: detailParts.join(' | ') || `代理测试通过：${exitSummary}`,
    });
    showToast(
      source === '711proxy_pool'
        ? `711 临时池测试通过：${exitSummary}`
        : (source === 'direct'
          ? `无代理模式测试通过：${exitSummary}`
          : (source === 'ip_proxy'
            ? `IP代理模式测试通过：${exitSummary}`
            : `支付转换代理测试通过：${exitSummary}`)),
      'success',
      2500
    );
  } catch (error) {
    const message = error?.message || String(error || '支付转换代理测试失败');
    setPlusCheckoutConversionProxyTestResult('测试失败', {
      status: 'error',
      detail: message,
    });
    showToast(message, 'error');
  } finally {
    setPlusCheckoutConversionProxyButtonsBusy(false);
  }
}

async function handlePlusCheckoutConversionProxyManualSwitch() {
  const source = getSelectedPlusCheckoutConversionProxySource(latestState);
  const proxyUrl = normalizePlusCheckoutConversionProxyUrlValue(inputPlusCheckoutConversionProxy?.value || '');
  const proxy711Region = getCurrentPlusCheckoutConversionProxy711Region(latestState);
  if (inputPlusCheckoutConversionProxy) {
    inputPlusCheckoutConversionProxy.value = proxyUrl;
  }
  if (source === 'ip_proxy') {
    setPlusCheckoutConversionProxyTestResult('IP代理模式', {
      detail: '将沿用当前 IP 代理/当前网络环境，不额外切换支付转换代理。',
    });
    renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
    showToast('IP代理模式会沿用当前 IP 代理/当前网络环境，无需额外切换。', 'info', 2500);
    return;
  }
  if (source === 'manual' && !proxyUrl) {
    showToast('请先填写支付转换代理地址。', 'error');
    return;
  }
  setPlusCheckoutConversionProxyButtonsBusy(true, { switch: '切换中...' });
  try {
    const response = await sendRuntimeMessageWithTimeout({
      type: 'SWITCH_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL',
      source: 'sidepanel',
      payload: {
        source,
        proxyUrl,
        proxy711Region,
        ipProxyStateOverride: source === '711proxy_pool' && typeof buildCurrentIpProxyActionStateOverride === 'function'
          ? buildCurrentIpProxyActionStateOverride(latestState)
          : undefined,
      },
    }, 30000, '支付转换代理手动切换');
    if (response?.error) {
      throw new Error(response.error);
    }
    syncLatestState({
      plusCheckoutConversionProxyManualSession: response?.plusCheckoutConversionProxyManualSession || null,
      plusCheckoutConversionProxyExitCheck: response?.plusCheckoutConversionProxyExitCheck || null,
      plusCheckoutConversionProxySource: response?.plusCheckoutConversionProxySource ?? source,
      plusCheckoutConversionProxyUrl: response?.plusCheckoutConversionProxyUrl ?? proxyUrl,
      plusCheckoutConversionProxy711Region: response?.plusCheckoutConversionProxy711Region ?? proxy711Region,
    });
    renderPlusCheckoutConversionProxyExitCheck(latestState);
    renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
    if (response?.alreadyActive) {
      showToast(
        `当前代理已生效：${response?.displayName || (source === '711proxy_pool' ? '711 临时池' : (source === 'direct' ? '无代理模式' : proxyUrl))}`,
        'info',
        2200
      );
      return;
    }
    showToast(
      source === '711proxy_pool'
        ? `已切换到 711 临时池代理：${response?.displayName || '已选节点'}`
        : (source === 'direct'
          ? `已切换到无代理模式：${response?.displayName || '支付转换相关域名直连'}`
          : `已切换支付转换代理：${response?.displayName || proxyUrl}`),
      'success',
      2200
    );
  } finally {
    setPlusCheckoutConversionProxyButtonsBusy(false);
  }
}

async function handlePlusCheckoutConversionProxyNext711() {
  const source = getSelectedPlusCheckoutConversionProxySource(latestState);
  if (source !== '711proxy_pool') {
    showToast('“下一个”仅支持 711 临时池代理。', 'error');
    return;
  }
  const proxy711Region = getCurrentPlusCheckoutConversionProxy711Region(latestState);
  setPlusCheckoutConversionProxyButtonsBusy(true, { next: '切换中...' });
  setPlusCheckoutConversionProxyTestResult('切换中...', {
    status: 'running',
    detail: '正在切换到 711 临时池的下一个可用出口。',
  });
  try {
    const response = await sendRuntimeMessageWithTimeout({
      type: 'NEXT_PLUS_CHECKOUT_CONVERSION_PROXY_711',
      source: 'sidepanel',
      payload: {
        source,
        proxy711Region,
        ipProxyStateOverride: typeof buildCurrentIpProxyActionStateOverride === 'function'
          ? buildCurrentIpProxyActionStateOverride(latestState)
          : undefined,
      },
    }, 45000, '711 临时池下一个');
    if (response?.error) {
      throw new Error(response.error);
    }
    syncLatestState({
      plusCheckoutConversionProxyManualSession: response?.plusCheckoutConversionProxyManualSession || latestState?.plusCheckoutConversionProxyManualSession || null,
      plusCheckoutConversionProxyExitCheck: response?.plusCheckoutConversionProxyExitCheck || latestState?.plusCheckoutConversionProxyExitCheck || null,
      plusCheckoutConversionProxySource: response?.plusCheckoutConversionProxySource ?? source,
      plusCheckoutConversionProxy711Region: response?.plusCheckoutConversionProxy711Region ?? proxy711Region,
    });
    renderPlusCheckoutConversionProxyExitCheck(latestState);
    renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
    if (response?.switched) {
      const displayName = response?.displayName || '已选节点';
      const suffix = response?.exitChanged ? '，真实出口已变化' : '';
      setPlusCheckoutConversionProxyTestResult(`当前代理：${displayName}`, {
        status: 'success',
        detail: response?.skippedReason || `已切换到 711 临时池下一个代理${suffix}。`,
      });
      showToast(`已切换到 711 临时池下一个代理：${displayName}${suffix}`, 'success', 2400);
      return;
    }
    const reason = response?.skippedReason || response?.reason || '当前 711 临时池已到末尾，未找到不同出口。';
    setPlusCheckoutConversionProxyTestResult('未切换', {
      status: 'error',
      detail: reason,
    });
    showToast(reason, 'warn', 3200);
  } finally {
    setPlusCheckoutConversionProxyButtonsBusy(false);
  }
}

async function handlePlusCheckoutConversionProxyManualCancel() {
  setPlusCheckoutConversionProxyButtonsBusy(true, { cancel: '取消中...' });
  try {
    const response = await sendRuntimeMessageWithTimeout({
      type: 'CANCEL_PLUS_CHECKOUT_CONVERSION_PROXY_MANUAL',
      source: 'sidepanel',
      payload: {},
    }, 30000, '支付转换代理取消');
    if (response?.error) {
      throw new Error(response.error);
    }
    syncLatestState({
      plusCheckoutConversionProxyManualSession: null,
      plusCheckoutConversionProxyExitCheck: null,
    });
    renderPlusCheckoutConversionProxyExitCheck(latestState);
    renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
    if (response?.alreadyInactive) {
      showToast('当前没有手动开启的支付转换代理。', 'info', 2200);
      return;
    }
    showToast('已取消支付转换代理，并恢复切换前网络环境。', 'success', 2200);
  } finally {
    setPlusCheckoutConversionProxyButtonsBusy(false);
  }
}

inputHostedCheckoutVerificationPopupDelaySeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputHostedCheckoutVerificationPopupDelaySeconds?.addEventListener('blur', () => {
  syncHostedCheckoutVerificationPopupDelayInput();
  saveSettings({ silent: true }).catch(() => { });
});

inputHostedCheckoutSecurityChallengeEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectHostedCheckoutSmsSource?.addEventListener('change', () => {
  selectHostedCheckoutSmsSource.value = normalizeHostedCheckoutSmsSourceValue(selectHostedCheckoutSmsSource.value);
  syncLatestState({ hostedCheckoutSmsSource: selectHostedCheckoutSmsSource.value });
  validateHostedCheckoutContactConfig();
  if (typeof updatePlusModeUI === 'function') {
    updatePlusModeUI();
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectPayPalProfileCountryCode?.addEventListener('change', () => {
  selectPayPalProfileCountryCode.value = normalizePayPalProfileCountryCodeValue(selectPayPalProfileCountryCode.value);
  syncLatestState({ paypalProfileCountryCode: selectPayPalProfileCountryCode.value });
  if (typeof renderPayPalProfile === 'function') {
    renderPayPalProfile();
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputHostedCheckoutSmsPoolAutoDisableEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputHostedCheckoutSmsPoolMaxUses?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
  queueHostedSmsPoolRefresh();
});

inputHostedCheckoutSmsPoolMaxUses?.addEventListener('blur', () => {
  inputHostedCheckoutSmsPoolMaxUses.value = String(
    normalizeHostedCheckoutSmsPoolMaxUsesValue(inputHostedCheckoutSmsPoolMaxUses.value, DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES)
  );
  saveSettings({ silent: true }).catch(() => { });
  queueHostedSmsPoolRefresh();
});

inputHostedCheckoutFirstDirectResendEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

[
  inputHostedCheckoutFirstResendWaitSeconds,
  inputHostedCheckoutSubsequentResendWaitSeconds,
  inputHostedCheckoutVerificationPollAttempts,
  inputHostedCheckoutVerificationPollIntervalSeconds,
  inputHostedCheckoutVerificationResendMaxAttempts,
].filter(Boolean).forEach((input) => {
  input.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input.addEventListener('blur', () => {
    if (input === inputHostedCheckoutFirstResendWaitSeconds) {
      input.value = String(normalizeHostedCheckoutResendWaitSecondsValue(input.value, 20));
    } else if (input === inputHostedCheckoutSubsequentResendWaitSeconds) {
      input.value = String(normalizeHostedCheckoutResendWaitSecondsValue(input.value, 25));
    } else if (input === inputHostedCheckoutVerificationPollAttempts) {
      input.value = String(normalizeHostedCheckoutVerificationPollAttemptsValue(input.value, 6));
    } else if (input === inputHostedCheckoutVerificationPollIntervalSeconds) {
      input.value = String(normalizeHostedCheckoutVerificationPollIntervalSecondsValue(input.value, 5));
    } else if (input === inputHostedCheckoutVerificationResendMaxAttempts) {
      input.value = String(normalizeHostedCheckoutVerificationResendMaxAttemptsValue(input.value, 1));
    }
    saveSettings({ silent: true }).catch(() => { });
  });
});

inputHostedCheckoutVerificationUrl?.addEventListener('input', () => {
  setHostedCheckoutManualCodeDisplay('未获取');
  validateHostedCheckoutContactConfig();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputHostedCheckoutVerificationUrl?.addEventListener('blur', () => {
  inputHostedCheckoutVerificationUrl.value = normalizeHostedCheckoutVerificationUrlValue(inputHostedCheckoutVerificationUrl.value);
  validateHostedCheckoutContactConfig();
  saveSettings({ silent: true }).catch(() => { });
});

btnHostedCheckoutManualFetch?.addEventListener('click', () => {
  handleHostedCheckoutManualFetch().catch((error) => {
    showToast(error?.message || String(error || '手动获取验证码失败'), 'error');
  });
});

inputHostedCheckoutPhone?.addEventListener('input', () => {
  validateHostedCheckoutContactConfig();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputHostedCheckoutPhone?.addEventListener('blur', () => {
  inputHostedCheckoutPhone.value = normalizeHostedCheckoutPhoneValue(inputHostedCheckoutPhone.value);
  validateHostedCheckoutContactConfig();
  saveSettings({ silent: true }).catch(() => { });
});

inputPlusCheckoutConversionProxy?.addEventListener('input', () => {
  setPlusCheckoutConversionProxyTestResult('未测试');
  renderPlusCheckoutConversionProxyRuntimeStatus();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputPlusCheckoutConversionProxy?.addEventListener('blur', () => {
  inputPlusCheckoutConversionProxy.value = normalizePlusCheckoutConversionProxyUrlValue(inputPlusCheckoutConversionProxy.value);
  setPlusCheckoutConversionProxyTestResult('未测试');
  renderPlusCheckoutConversionProxyRuntimeStatus();
  saveSettings({ silent: true }).catch(() => { });
});

selectPlusCheckoutConversionProxySource?.addEventListener('change', () => {
  const nextSource = normalizePlusCheckoutConversionProxySourceValue(selectPlusCheckoutConversionProxySource.value);
  syncPlusCheckoutConversionProxySourceControl(nextSource);
  syncLatestState({ plusCheckoutConversionProxySource: nextSource });
  updatePlusCheckoutConversionModeUi();
  setPlusCheckoutConversionProxyTestResult('\u672a\u6d4b\u8bd5');
  renderPlusCheckoutConversionProxyRuntimeStatus();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

plusCheckoutConversionProxySourceButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextSource = normalizePlusCheckoutConversionProxySourceValue(button.dataset.plusCheckoutConversionProxySource);
    syncPlusCheckoutConversionProxySourceControl(nextSource);
    syncLatestState({ plusCheckoutConversionProxySource: nextSource });
    updatePlusCheckoutConversionModeUi();
    setPlusCheckoutConversionProxyTestResult('未测试');
    renderPlusCheckoutConversionProxyRuntimeStatus();
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

inputPlusCheckoutConversionProxy711Region?.addEventListener('input', () => {
  inputPlusCheckoutConversionProxy711Region.value = normalizePlusCheckoutConversionProxy711RegionDraftValue(inputPlusCheckoutConversionProxy711Region.value);
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
  renderPlusCheckoutConversionProxyRuntimeStatus();
});

inputPlusCheckoutConversionProxy711Region?.addEventListener('blur', () => {
  inputPlusCheckoutConversionProxy711Region.value = normalizePlusCheckoutConversionProxy711RegionValue(inputPlusCheckoutConversionProxy711Region.value);
  setPlusCheckoutConversionProxyTestResult('未测试');
  renderPlusCheckoutConversionProxyRuntimeStatus();
  saveSettings({ silent: true }).catch(() => { });
});

inputPlusCheckoutCloudConversionEnabled?.addEventListener('change', () => {
  updatePlusCheckoutConversionModeUi();
  validatePlusCheckoutCloudConversionConfig();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputPlusCheckoutRegionalCheckoutEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

plusCheckAllowedRegionInputs.forEach((input) => {
  input?.addEventListener('change', () => {
    syncLatestState({ plusCheckAllowedRegions: getSelectedPlusCheckAllowedRegions() });
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

inputPlusCheckoutCloudConversionApiUrl?.addEventListener('input', () => {
  validatePlusCheckoutCloudConversionConfig();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputPlusCheckoutCloudConversionApiUrl?.addEventListener('blur', () => {
  inputPlusCheckoutCloudConversionApiUrl.value = normalizePlusCheckoutCloudConversionApiUrlValue(inputPlusCheckoutCloudConversionApiUrl.value);
  validatePlusCheckoutCloudConversionConfig();
  saveSettings({ silent: true }).catch(() => { });
});

inputPlusCheckoutCloudConversionApiKey?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputPlusCheckoutCloudConversionApiKey?.addEventListener('blur', () => {
  inputPlusCheckoutCloudConversionApiKey.value = normalizePlusCheckoutCloudConversionApiKeyValue(inputPlusCheckoutCloudConversionApiKey.value);
  saveSettings({ silent: true }).catch(() => { });
});

btnPlusCheckoutConversionProxyTest?.addEventListener('click', () => {
  handlePlusCheckoutConversionProxyTest().catch((error) => {
    showToast(error?.message || String(error || '支付转换代理测试失败'), 'error');
  });
});

btnPlusCheckoutConversionProxySwitch?.addEventListener('click', () => {
  handlePlusCheckoutConversionProxyManualSwitch().catch((error) => {
    showToast(error?.message || String(error || '支付转换代理切换失败'), 'error');
  });
});

btnPlusCheckoutConversionProxyNext?.addEventListener('click', () => {
  handlePlusCheckoutConversionProxyNext711().catch((error) => {
    showToast(error?.message || String(error || '711 临时池下一个失败'), 'error');
  });
});

btnPlusCheckoutConversionProxyCancel?.addEventListener('click', () => {
  handlePlusCheckoutConversionProxyManualCancel().catch((error) => {
    showToast(error?.message || String(error || '支付转换代理取消失败'), 'error');
  });
});

inputPlusModeEnabled?.addEventListener('change', () => {
  if (inputPlusModeEnabled.checked && inputPhonePlusModeEnabled) {
    inputPhonePlusModeEnabled.checked = false;
  }
  updatePlusModeUI();
  updateSignupMethodUI({ notify: true });
  updatePhoneVerificationSettingsUI();
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState({
      ...(latestState || {}),
      plusModeEnabled: Boolean(inputPlusModeEnabled.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled?.checked),
      signupMethod: getSelectedSignupMethod(),
    }, {
      signupMethod: getSelectedSignupMethod(),
    })
    : {
      plusModeEnabled: Boolean(inputPlusModeEnabled.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled?.checked),
      signupMethod: getSelectedSignupMethod(),
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, getSelectedPlusPaymentMethod(), {
    render: true,
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    signupMethod: stepDefinitionState.signupMethod,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputPhonePlusModeEnabled?.addEventListener('change', () => {
  if (inputPhonePlusModeEnabled.checked) {
    if (inputPlusModeEnabled) {
      inputPlusModeEnabled.checked = false;
    }
    if (inputPhoneVerificationEnabled) {
      inputPhoneVerificationEnabled.checked = true;
    }
    setPhoneVerificationSectionExpanded(true);
    setSignupMethod(SIGNUP_METHOD_PHONE);
    currentPlusAccountAccessStrategy = DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY;
    if (selectPlusAccountAccessStrategy) {
      selectPlusAccountAccessStrategy.dataset.requestedValue = DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY;
      selectPlusAccountAccessStrategy.value = normalizePlusAccountAccessStrategyUiValue(DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY);
    }
  }
  updatePlusModeUI();
  updateSignupMethodUI({ notify: true });
  updatePhoneVerificationSettingsUI();
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState({
      ...(latestState || {}),
      plusModeEnabled: Boolean(inputPlusModeEnabled?.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled.checked),
      phoneVerificationEnabled: Boolean(inputPhoneVerificationEnabled?.checked),
      signupMethod: getSelectedSignupMethod(),
    }, {
      signupMethod: getSelectedSignupMethod(),
    })
    : {
      plusModeEnabled: Boolean(inputPlusModeEnabled?.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled.checked),
      signupMethod: getSelectedSignupMethod(),
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, getSelectedPlusPaymentMethod(), {
    render: true,
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    signupMethod: stepDefinitionState.signupMethod,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnGpcCardKeyPurchase?.addEventListener('click', () => {
  openExternalUrl('https://pay.ldxp.cn/shop/gpc');
});

inputBrowserFingerprintEnabled?.addEventListener('change', () => {
  updateBrowserFingerprintUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectBrowserFingerprintLevel?.addEventListener('change', () => {
  selectBrowserFingerprintLevel.value = normalizeBrowserFingerprintLevel(selectBrowserFingerprintLevel.value);
  updateBrowserFingerprintUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectBrowserFingerprintLanguage?.addEventListener('change', () => {
  selectBrowserFingerprintLanguage.value = normalizeBrowserFingerprintLanguage(selectBrowserFingerprintLanguage.value);
  updateBrowserFingerprintUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnGpcHelperConvertApiKey?.addEventListener('click', () => {
  openExternalUrl(GPC_HELPER_PORTAL_URL);
});

btnOpenKiroRsGithub?.addEventListener('click', () => {
  openExternalUrl('https://github.com/QLHazyCoder/kiro.rs');
});

btnGpcHelperBalance?.addEventListener('click', async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'REFRESH_GPC_CARD_BALANCE',
      source: 'sidepanel',
      payload: {
        gopayHelperApiUrl: inputGpcHelperApi?.value || DEFAULT_GPC_HELPER_API_URL,
        gopayHelperApiKey: inputGpcHelperCardKey?.value || '',
        gopayHelperCountryCode: selectGpcHelperCountryCode?.value || '+86',
        reason: 'manual',
      },
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    if (displayGpcHelperBalance) {
      displayGpcHelperBalance.textContent = response?.balance || '余额已更新';
    }
    const nextState = {
      gopayHelperBalance: response?.balance || latestState?.gopayHelperBalance || '',
      gopayHelperBalancePayload: response?.data || response?.payload?.data || response?.payload || latestState?.gopayHelperBalancePayload || null,
      gopayHelperBalanceUpdatedAt: response?.updatedAt || Date.now(),
      gopayHelperBalanceError: '',
      gopayHelperRemainingUses: getGpcBalanceRemainingUsesFromResponse(response) ?? 0,
      gopayHelperAutoModeEnabled: getGpcAutoModeEnabledFromResponse(response),
      gopayHelperApiKeyStatus: response?.apiKeyStatus || response?.data?.status || response?.payload?.data?.status || response?.payload?.status || '',
    };
    const nextAutoModePermission = getGpcAutoModePermissionFromPayload(nextState.gopayHelperBalancePayload);
    const nextAutoModeDenied = nextAutoModePermission === false;
    const nextAutoModeConfirmed = nextAutoModePermission === true || nextState.gopayHelperAutoModeEnabled;
    const selectedModeBeforeBalanceState = getSelectedGpcHelperPhoneMode();
    syncLatestState(nextState);
    if (nextAutoModeDenied && selectedModeBeforeBalanceState === GPC_HELPER_PHONE_MODE_AUTO) {
      showToast('当前 API Key 未开通自动模式，已保留当前选择；如需继续请手动切换到手动模式。', 'warn');
    } else if (nextAutoModeDenied) {
      showToast('GPC 余额已更新，当前 API Key 只能使用手动模式。', 'success');
    } else if (nextAutoModeConfirmed) {
      showToast('GPC 余额已更新，自动模式可用。', 'success');
    } else {
      showToast('GPC 余额已更新，当前接口未返回自动模式权限，已保留所选模式。', 'success');
    }
    updatePlusModeUI();
  } catch (error) {
    showToast(error?.message || '查询 GPC 余额失败。', 'error');
  }
});

btnTestKiroRs?.addEventListener('click', async () => {
  const defaultLabel = btnTestKiroRs.textContent || '测试';
  btnTestKiroRs.disabled = true;
  btnTestKiroRs.textContent = '测试中';
  setKiroRsConnectionTestStatus('测试中...');
  try {
    await persistCurrentSettingsForAction();
    const activeFlowId = typeof getSelectedFlowId === 'function'
      ? getSelectedFlowId(latestState)
      : 'kiro';
    const targetId = typeof getSelectedTargetId === 'function'
      ? getSelectedTargetId(activeFlowId)
      : 'kiro-rs';
    const response = await sendSidepanelMessage({
      type: 'CHECK_KIRO_RS_CONNECTION',
      payload: {
        activeFlowId,
        targetId,
        baseUrl: String(inputKiroRsUrl?.value || '').trim(),
        apiKey: String(inputKiroRsKey?.value || ''),
      },
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    const message = String(response?.message || '').trim() || 'kiro.rs 测试完成。';
    setKiroRsConnectionTestStatus(message);
    showToast(message, response?.ok ? 'success' : 'error', response?.ok ? 2200 : 4200);
  } catch (error) {
    const message = error?.message || 'kiro.rs 测试失败。';
    setKiroRsConnectionTestStatus(message);
    showToast(message, 'error', 4200);
  } finally {
    btnTestKiroRs.disabled = false;
    btnTestKiroRs.textContent = defaultLabel;
  }
});

selectPlusPaymentMethod?.addEventListener('change', () => {
  selectPlusPaymentMethod.value = normalizePlusPaymentMethod(selectPlusPaymentMethod.value);
  updatePlusModeUI();
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState({
      ...(latestState || {}),
      plusModeEnabled: Boolean(inputPlusModeEnabled?.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled?.checked),
      signupMethod: getSelectedSignupMethod(),
    }, {
      signupMethod: getSelectedSignupMethod(),
    })
    : {
      plusModeEnabled: Boolean(inputPlusModeEnabled?.checked),
      phonePlusModeEnabled: Boolean(inputPhonePlusModeEnabled?.checked),
      signupMethod: getSelectedSignupMethod(),
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, {
    render: true,
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    plusPaymentMethod: selectPlusPaymentMethod.value,
    signupMethod: stepDefinitionState.signupMethod,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

[
  inputGpcHelperApi,
  inputGpcHelperCardKey,
  selectGpcHelperPhoneMode,
  selectGpcHelperCountryCode,
  inputGpcHelperPhone,
  selectGpcHelperOtpChannel,
  inputGpcHelperLocalSmsEnabled,
  inputGpcHelperLocalSmsUrl,
  inputGpcHelperPin,
  selectGoPayCountryCode,
  inputGoPayPhone,
  inputGoPayOtp,
  inputGoPayPin,
  selectPlusCheckoutVerificationFailureStrategy,
  inputHostedCheckoutVerificationUrl,
  inputHostedCheckoutPhone,
  inputPlusHostedCheckoutOauthDelaySeconds,
].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('change', () => {
    if (input === selectGpcHelperPhoneMode || input === selectGpcHelperOtpChannel || input === inputGpcHelperLocalSmsEnabled) {
      updatePlusModeUI();
    }
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
  input?.addEventListener('blur', () => {
    saveSettings({ silent: true }).catch(() => { });
  });
});

selectMailProvider.addEventListener('change', async () => {
  const previousProvider = latestState?.mailProvider || '';
  const previousMail2925Mode = latestState?.mail2925Mode;
  const nextProvider = selectMailProvider.value;
  syncManagedAliasBaseEmailDraftFromInput(previousProvider);
  setManagedAliasBaseEmailInputForProvider(nextProvider, latestState);
  updateMailProviderUI();
  const leavingHotmail = previousProvider === 'hotmail-api'
    && nextProvider !== 'hotmail-api'
    && isCurrentEmailManagedByHotmail();
  const leavingLuckmail = previousProvider === LUCKMAIL_PROVIDER
    && nextProvider !== LUCKMAIL_PROVIDER
    && isCurrentEmailManagedByLuckmail();
  const leavingGeneratedAlias = (
    previousProvider !== nextProvider
    || (previousProvider === '2925' && normalizeMail2925Mode(previousMail2925Mode) !== getSelectedMail2925Mode())
  ) && usesGeneratedAliasMailProvider(previousProvider, previousMail2925Mode)
    && isCurrentEmailManagedByGeneratedAlias(previousProvider, latestState, previousMail2925Mode);
  if (leavingHotmail || leavingLuckmail || leavingGeneratedAlias) {
    await clearRegistrationEmail({ silent: true }).catch(() => { });
  }
  if (nextProvider === '2925' && Boolean(inputMail2925UseAccountPool?.checked)) {
    syncMail2925PoolAccountOptions(latestState);
    if (!selectMail2925PoolAccount.value && getMail2925Accounts().length > 0) {
      selectMail2925PoolAccount.value = String(getMail2925Accounts()[0]?.id || '');
    }
    await syncSelectedMail2925PoolAccount({ silent: true }).catch(() => { });
  }
  if (nextProvider === LUCKMAIL_PROVIDER) {
    queueLuckmailPurchaseRefresh();
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

mail2925ModeButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const nextMode = normalizeMail2925Mode(button.dataset.mail2925Mode);
    const previousMode = normalizeMail2925Mode(latestState?.mail2925Mode);
    if (nextMode === getSelectedMail2925Mode()) {
      return;
    }

    setMail2925Mode(nextMode);
    updateMailProviderUI();

    const leavingGeneratedAlias = selectMailProvider.value === '2925'
      && previousMode === MAIL_2925_MODE_PROVIDE
      && nextMode !== MAIL_2925_MODE_PROVIDE
      && isCurrentEmailManagedByGeneratedAlias('2925', latestState, previousMode);
    if (leavingGeneratedAlias) {
      await clearRegistrationEmail({ silent: true }).catch(() => { });
    }

    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

tempEmailLookupModeButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const nextMode = normalizeCloudflareTempEmailLookupMode(button.dataset.tempEmailLookupMode);
    const previousMode = getSelectedCloudflareTempEmailLookupMode();
    if (nextMode === previousMode) {
      return;
    }

    if (nextMode === CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE_REGISTRATION_EMAIL) {
      const confirmed = await confirmCloudflareTempEmailRegistrationLookupIfNeeded();
      if (!confirmed) {
        setCloudflareTempEmailLookupMode(previousMode);
        updateMailProviderUI();
        return;
      }
    }

    setCloudflareTempEmailLookupMode(nextMode);
    updateMailProviderUI();
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

selectEmailGenerator.addEventListener('change', () => {
  updateMailProviderUI();
  clearRegistrationEmail({ silent: true }).catch(() => { });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectIcloudHostPreference?.addEventListener('change', () => {
  updateMailProviderUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  if (getSelectedEmailGenerator() === 'icloud') {
    queueIcloudAliasRefresh();
  }
});

selectIcloudTargetMailboxType?.addEventListener('change', () => {
  updateMailProviderUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectIcloudForwardMailProvider?.addEventListener('change', () => {
  updateMailProviderUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectIcloudFetchMode?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

checkboxAutoDeleteIcloud?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectPanelMode.addEventListener('change', async () => {
  const activeFlowId = typeof getSelectedFlowId === 'function'
    ? getSelectedFlowId(latestState)
    : normalizeFlowId(latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID);
  const defaultTargetId = typeof getDefaultTargetIdForFlow === 'function'
    ? getDefaultTargetIdForFlow(activeFlowId)
    : (activeFlowId === DEFAULT_ACTIVE_FLOW_ID ? 'cpa' : 'kiro-rs');
  const previousTargetId = typeof getSelectedTargetIdForState === 'function'
    ? getSelectedTargetIdForState(latestState, activeFlowId)
    : (activeFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? normalizePanelMode(latestState?.panelMode || defaultTargetId)
      : String(latestState?.kiroTargetId || defaultTargetId).trim().toLowerCase() || defaultTargetId);
  let nextTargetId = typeof normalizeTargetIdForFlow === 'function'
    ? normalizeTargetIdForFlow(activeFlowId, selectPanelMode.value, defaultTargetId)
    : (activeFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? normalizePanelMode(selectPanelMode.value)
      : String(selectPanelMode.value || defaultTargetId).trim().toLowerCase() || defaultTargetId);
  if (activeFlowId === DEFAULT_ACTIVE_FLOW_ID) {
    const nextPanelMode = normalizePanelMode(nextTargetId);
    selectPanelMode.value = nextPanelMode;
    const confirmed = await confirmCpaPhoneSignupIfNeeded({
      signupMethod: getSelectedSignupMethod(),
      panelMode: nextPanelMode,
    });
    if (!confirmed) {
      selectPanelMode.value = previousTargetId;
      updatePanelModeUI();
      return;
    }
    nextTargetId = nextPanelMode;
    syncLatestState({
      activeFlowId,
      flowId: activeFlowId,
      panelMode: nextPanelMode,
    });
    if (
      typeof selectPlusAccountAccessStrategy !== 'undefined'
      && selectPlusAccountAccessStrategy
      && !latestState?.accountContributionEnabled
    ) {
      const nextPlusStrategy = resolvePlusAccountAccessStrategyForTarget(
        selectPlusAccountAccessStrategy.value
          || selectPlusAccountAccessStrategy.dataset?.requestedValue
          || currentPlusAccountAccessStrategy,
        nextPanelMode
      );
      currentPlusAccountAccessStrategy = nextPlusStrategy;
      selectPlusAccountAccessStrategy.dataset.requestedValue = nextPlusStrategy;
      selectPlusAccountAccessStrategy.value = normalizePlusAccountAccessStrategyUiValue(nextPlusStrategy);
      syncLatestState({
        plusAccountAccessStrategy: nextPlusStrategy,
      });
    }
  } else {
    syncLatestState({
      activeFlowId,
      flowId: activeFlowId,
      kiroTargetId: nextTargetId,
    });
  }
  updatePanelModeUI();
  if (typeof syncStepDefinitionsFromUiState === 'function') {
    syncStepDefinitionsFromUiState({
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled: typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
        ? Boolean(inputPhonePlusModeEnabled.checked)
        : Boolean(latestState?.phonePlusModeEnabled),
      signupMethod: getSelectedSignupMethod(),
      phoneSignupReloginAfterBindEmailEnabled: typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail
        ? Boolean(inputPhoneSignupReloginAfterBindEmail.checked)
        : Boolean(latestState?.phoneSignupReloginAfterBindEmailEnabled),
      sub2apiReloginEnabled: Boolean(inputSub2ApiReloginEnabled?.checked),
      openaiIntegrationTargetId: latestState?.openaiIntegrationTargetId || latestState?.panelMode,
      panelMode: latestState?.panelMode || latestState?.openaiIntegrationTargetId,
    });
  }
  applyStepExecutionRangeState(latestState);
  renderStepStatuses(latestState);
  updateButtonStates();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectPlusAccountAccessStrategy?.addEventListener('change', () => {
  const nextUiValue = normalizePlusAccountAccessStrategyUiValue(selectPlusAccountAccessStrategy.value);
  selectPlusAccountAccessStrategy.value = nextUiValue;
  selectPlusAccountAccessStrategy.dataset.requestedValue = resolvePlusAccountAccessStrategyForTarget(
    nextUiValue,
    typeof getSelectedPanelMode === 'function' ? getSelectedPanelMode() : latestState?.panelMode
  );
  updatePlusModeUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

[inputKiroRsUrl, inputKiroRsKey].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    setKiroRsConnectionTestStatus('未测试');
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    saveSettings({ silent: true }).catch(() => { });
  });
});

function syncCurrentIpProxyServiceProfileToLatestState() {
  const selectedService = normalizeIpProxyService(
    selectIpProxyService?.value || latestState?.ipProxyService || DEFAULT_IP_PROXY_SERVICE
  );
  const normalizedProfiles = typeof buildIpProxyServiceProfilesPatch === 'function'
    ? buildIpProxyServiceProfilesPatch(selectedService, latestState || {})
    : { ...(latestState?.ipProxyServiceProfiles || {}) };
  const currentProfile = typeof getIpProxyServiceProfile === 'function'
    ? getIpProxyServiceProfile(selectedService, {
      ...(latestState || {}),
      ipProxyService: selectedService,
      ipProxyServiceProfiles: normalizedProfiles,
    })
    : {
      mode: normalizeIpProxyMode(getSelectedIpProxyMode()),
      apiUrl: String(inputIpProxyApiUrl?.value || '').trim(),
      accountList: normalizeIpProxyAccountList(inputIpProxyAccountList?.value || ''),
      accountSessionPrefix: normalizeIpProxyAccountSessionPrefix(inputIpProxyAccountSessionPrefix?.value || ''),
      accountLifeMinutes: normalizeIpProxyAccountLifeMinutes(inputIpProxyAccountLifeMinutes?.value || ''),
      poolTargetCount: normalizeIpProxyPoolTargetCount(inputIpProxyPoolTargetCount?.value || '', 20),
      switchIpRoundCount: typeof normalizeIpProxySwitchIpRoundCount === 'function'
        ? normalizeIpProxySwitchIpRoundCount(inputIpProxySwitchIpRoundCount?.value || '', 1)
        : normalizeIpProxyPoolTargetCount(inputIpProxySwitchIpRoundCount?.value || '', 1),
      autoRefreshPoolOnExhausted: Boolean(inputIpProxyAutoRefreshPoolOnExhausted?.checked),
      host: String(inputIpProxyHost?.value || '').trim(),
      port: String(normalizeIpProxyPort(inputIpProxyPort?.value || '') || ''),
      protocol: normalizeIpProxyProtocol(selectIpProxyProtocol?.value || ''),
      username: String(inputIpProxyUsername?.value || '').trim(),
      password: String(inputIpProxyPassword?.value || ''),
      region: String(inputIpProxyRegion?.value || '').trim(),
      apiRouteMode: String(selectIpProxyApiRouteMode?.value || latestState?.ipProxyApiRouteMode || 'direct').trim().toLowerCase() || 'direct',
    };
  syncLatestState({
    ipProxyService: selectedService,
    ipProxyServiceProfiles: normalizedProfiles,
    ...(typeof buildIpProxyStatePatchFromServiceProfile === 'function'
      ? buildIpProxyStatePatchFromServiceProfile(selectedService, currentProfile)
      : {}),
  });
}

function handleIpProxyEnabledToggle(nextEnabled) {
  const enabled = Boolean(nextEnabled);
  const previousEnabled = Boolean(latestState?.ipProxyEnabled);
  if (previousEnabled === enabled) {
    setIpProxyEnabled(enabled);
    updateIpProxyUI(latestState);
    return;
  }
  setIpProxyEnabled(enabled);
  if (enabled && typeof setIpProxySectionExpanded === 'function') {
    setIpProxySectionExpanded(true);
  }
  syncLatestState({ ipProxyEnabled: enabled });
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
}

if (inputIpProxyEnabled) {
  inputIpProxyEnabled.addEventListener('change', () => {
    handleIpProxyEnabledToggle(Boolean(inputIpProxyEnabled.checked));
  });
} else {
  ipProxyEnabledButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextEnabled = String(button.dataset.ipProxyEnabled) === 'true';
      handleIpProxyEnabledToggle(nextEnabled);
    });
  });
}

inputSub2ApiReloginEnabled?.addEventListener('change', () => {
  const enabled = Boolean(inputSub2ApiReloginEnabled.checked);
  const patch = {
    sub2apiReloginEnabled: enabled,
    activeFlowId: DEFAULT_ACTIVE_FLOW_ID,
    flowId: DEFAULT_ACTIVE_FLOW_ID,
    panelMode: 'sub2api',
    openaiIntegrationTargetId: 'sub2api',
    signupMethod: enabled ? SIGNUP_METHOD_PHONE : latestState?.signupMethod,
    resolvedSignupMethod: enabled ? SIGNUP_METHOD_PHONE : latestState?.resolvedSignupMethod,
    phoneVerificationEnabled: enabled ? false : Boolean(latestState?.phoneVerificationEnabled),
    sub2apiDefaultProxyName: enabled ? '' : (inputSub2ApiDefaultProxy?.value || latestState?.sub2apiDefaultProxyName || ''),
    ipProxyEnabled: enabled ? false : Boolean(latestState?.ipProxyEnabled),
  };
  if (enabled) {
    if (selectFlow) selectFlow.value = DEFAULT_ACTIVE_FLOW_ID;
    if (selectPanelMode) selectPanelMode.value = 'sub2api';
    if (inputIpProxyEnabled) inputIpProxyEnabled.checked = false;
    if (inputSub2ApiDefaultProxy) inputSub2ApiDefaultProxy.value = '';
  }
  syncLatestState(patch);
  syncStepDefinitionsFromUiState(patch);
  updatePanelModeUI();
  renderSub2ApiReloginPool();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
});

function saveSub2ApiReloginPoolPatch(patch = {}) {
  setSub2ApiReloginPoolState(patch);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
}

btnSub2ApiReloginPoolImport?.addEventListener('click', () => {
  const imported = normalizeSub2ApiReloginAccountPoolText(inputSub2ApiReloginPoolImport?.value || '');
  if (inputSub2ApiReloginAccountPool) {
    inputSub2ApiReloginAccountPool.value = imported;
  }
  saveSub2ApiReloginPoolPatch({
    sub2apiReloginAccountPoolText: imported,
    sub2apiReloginCurrentAccount: null,
  });
});

btnSub2ApiReloginPoolRefresh?.addEventListener('click', () => {
  renderSub2ApiReloginPool();
});

btnSub2ApiReloginPoolCopy?.addEventListener('click', async () => {
  const text = normalizeSub2ApiReloginAccountPoolText(inputSub2ApiReloginAccountPool?.value || latestState?.sub2apiReloginAccountPoolText || '');
  try {
    await navigator.clipboard?.writeText(text);
    showToast('补登账号池已复制', 'ok');
  } catch {
    showToast('复制失败', 'error');
  }
});

btnSub2ApiReloginPoolClearUsed?.addEventListener('click', () => {
  const usage = getSub2ApiReloginPoolUsage();
  const nextUsage = Object.fromEntries(Object.entries(usage).map(([key, item]) => [key, {
    ...(item || {}),
    usedAt: 0,
    lastError: '',
  }]));
  saveSub2ApiReloginPoolPatch({ sub2apiReloginAccountPoolUsage: nextUsage });
});

btnSub2ApiReloginPoolDeleteAll?.addEventListener('click', () => {
  if (inputSub2ApiReloginAccountPool) inputSub2ApiReloginAccountPool.value = '';
  if (inputSub2ApiReloginPoolImport) inputSub2ApiReloginPoolImport.value = '';
  saveSub2ApiReloginPoolPatch({
    sub2apiReloginAccountPoolText: '',
    sub2apiReloginAccountPoolUsage: {},
    sub2apiReloginCurrentAccount: null,
  });
});

inputSub2ApiReloginPoolSearch?.addEventListener('input', () => {
  sub2ApiReloginPoolSearchKeyword = inputSub2ApiReloginPoolSearch.value || '';
  renderSub2ApiReloginPool();
});

selectSub2ApiReloginPoolFilter?.addEventListener('change', () => {
  sub2ApiReloginPoolFilter = selectSub2ApiReloginPoolFilter.value || 'all';
  renderSub2ApiReloginPool();
});

sub2ApiReloginPoolList?.addEventListener('click', (event) => {
  const button = event.target?.closest?.('button[data-action][data-key]');
  if (!button) {
    return;
  }
  const key = String(button.dataset.key || '').trim();
  const action = String(button.dataset.action || '').trim();
  const entries = getSub2ApiReloginPoolEntries();
  const usage = getSub2ApiReloginPoolUsage();
  const current = usage[key] || {};
  if (action === 'toggle-enabled') {
    saveSub2ApiReloginPoolPatch({
      sub2apiReloginAccountPoolUsage: {
        ...usage,
        [key]: {
          ...current,
          enabled: current.enabled === false,
        },
      },
    });
    return;
  }
  if (action === 'toggle-used') {
    const used = Number(current.usedAt) > 0;
    saveSub2ApiReloginPoolPatch({
      sub2apiReloginAccountPoolUsage: {
        ...usage,
        [key]: {
          ...current,
          enabled: current.enabled !== false,
          usedAt: used ? 0 : Date.now(),
          lastError: used ? '' : String(current.lastError || ''),
        },
      },
    });
    return;
  }
  if (action === 'delete') {
    const nextEntries = entries.filter((entry) => entry.key !== key);
    const nextText = nextEntries.map((entry) => `${entry.phone}----${entry.password}----${entry.email}`).join('\n');
    const nextUsage = { ...usage };
    delete nextUsage[key];
    if (inputSub2ApiReloginAccountPool) inputSub2ApiReloginAccountPool.value = nextText;
    saveSub2ApiReloginPoolPatch({
      sub2apiReloginAccountPoolText: nextText,
      sub2apiReloginAccountPoolUsage: nextUsage,
      sub2apiReloginCurrentAccount: latestState?.sub2apiReloginCurrentAccount?.key === key ? null : latestState?.sub2apiReloginCurrentAccount,
    });
  }
});

selectIpProxyService?.addEventListener('change', () => {
  const previousService = normalizeIpProxyService(latestState?.ipProxyService || DEFAULT_IP_PROXY_SERVICE);
  const nextService = normalizeIpProxyService(selectIpProxyService.value);
  const normalizedProfiles = typeof normalizeIpProxyServiceProfiles === 'function'
    ? normalizeIpProxyServiceProfiles(latestState?.ipProxyServiceProfiles || {}, latestState || {})
    : { ...(latestState?.ipProxyServiceProfiles || {}) };

  if (typeof buildCurrentIpProxyServiceProfileFromInputs === 'function') {
    normalizedProfiles[previousService] = buildCurrentIpProxyServiceProfileFromInputs();
  }

  const nextProfile = typeof getIpProxyServiceProfile === 'function'
    ? getIpProxyServiceProfile(nextService, {
      ...(latestState || {}),
      ipProxyService: nextService,
      ipProxyServiceProfiles: normalizedProfiles,
    })
    : {
      mode: typeof normalizeIpProxyModeForCurrentRelease === 'function'
        ? normalizeIpProxyModeForCurrentRelease(latestState?.ipProxyMode)
        : normalizeIpProxyMode(latestState?.ipProxyMode),
      apiUrl: String(latestState?.ipProxyApiUrl || '').trim(),
      accountList: normalizeIpProxyAccountList(latestState?.ipProxyAccountList || ''),
      accountSessionPrefix: normalizeIpProxyAccountSessionPrefix(latestState?.ipProxyAccountSessionPrefix || ''),
      accountLifeMinutes: normalizeIpProxyAccountLifeMinutes(latestState?.ipProxyAccountLifeMinutes || ''),
      poolTargetCount: normalizeIpProxyPoolTargetCount(latestState?.ipProxyPoolTargetCount || '', 20),
      switchIpRoundCount: typeof normalizeIpProxySwitchIpRoundCount === 'function'
        ? normalizeIpProxySwitchIpRoundCount(latestState?.ipProxySwitchIpRoundCount || '', 1)
        : normalizeIpProxyPoolTargetCount(latestState?.ipProxySwitchIpRoundCount || '', 1),
      autoRefreshPoolOnExhausted: Boolean(latestState?.ipProxyAutoRefreshPoolOnExhausted),
      host: String(latestState?.ipProxyHost || '').trim(),
      port: String(normalizeIpProxyPort(latestState?.ipProxyPort || '') || ''),
      protocol: normalizeIpProxyProtocol(latestState?.ipProxyProtocol),
      username: String(latestState?.ipProxyUsername || '').trim(),
      password: String(latestState?.ipProxyPassword || ''),
      region: String(latestState?.ipProxyRegion || '').trim(),
      apiRouteMode: String(latestState?.ipProxyApiRouteMode || 'direct').trim().toLowerCase() || 'direct',
      specialDomainRouteMode: String(latestState?.ipProxySpecialDomainRouteMode || 'local_proxy').trim().toLowerCase() || 'local_proxy',
    };

  if (typeof applyIpProxyServiceProfileToInputs === 'function') {
    applyIpProxyServiceProfileToInputs(nextProfile);
  } else {
    setIpProxyMode(nextProfile.mode);
  }

  syncLatestState({
    ipProxyService: nextService,
    ipProxyServiceProfiles: normalizedProfiles,
    ...(typeof buildIpProxyStatePatchFromServiceProfile === 'function'
      ? buildIpProxyStatePatchFromServiceProfile(nextService, nextProfile)
      : {}),
  });
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
});

ipProxyModeButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const nextMode = normalizeIpProxyMode(button.dataset.ipProxyMode || DEFAULT_IP_PROXY_MODE);
    const apiModeAvailable = typeof isIpProxyApiModeAvailable === 'function'
      ? Boolean(isIpProxyApiModeAvailable())
      : (typeof IP_PROXY_API_MODE_ENABLED !== 'undefined' ? Boolean(IP_PROXY_API_MODE_ENABLED) : false);
    if (getSelectedIpProxyMode() === nextMode) {
      return;
    }
    setIpProxyMode(nextMode);
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => {});
  });
});

selectIpProxyProtocol?.addEventListener('change', () => {
  syncCurrentIpProxyServiceProfileToLatestState();
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
});

selectIpProxyApiRouteMode?.addEventListener('change', () => {
  syncCurrentIpProxyServiceProfileToLatestState();
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
});

selectIpProxySpecialDomainRouteMode?.addEventListener('change', () => {
  syncCurrentIpProxyServiceProfileToLatestState();
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
});

btnIpProxyRefresh?.addEventListener('click', async () => {
  try {
    const result = typeof runIpProxyActionWithLock === 'function'
      ? await runIpProxyActionWithLock('refresh', async () => {
        await persistCurrentSettingsForAction();
        await refreshIpProxyPoolByApi();
      })
      : await (async () => {
        await persistCurrentSettingsForAction();
        await refreshIpProxyPoolByApi();
        return { skipped: false };
      })();
    if (result?.skipped) {
      return;
    }
  } catch (err) {
    showToast(err?.message || String(err || '未知错误'), 'error');
  }
});

btnIpProxyNext?.addEventListener('click', async () => {
  try {
    const result = typeof runIpProxyActionWithLock === 'function'
      ? await runIpProxyActionWithLock('next', async () => {
        await persistCurrentSettingsForAction();
        await switchIpProxyToNext();
      })
      : await (async () => {
        await persistCurrentSettingsForAction();
        await switchIpProxyToNext();
        return { skipped: false };
      })();
    if (result?.skipped) {
      return;
    }
  } catch (err) {
    showToast(err?.message || String(err || '未知错误'), 'error');
  }
});

btnIpProxyChange?.addEventListener('click', async () => {
  try {
    const result = typeof runIpProxyActionWithLock === 'function'
      ? await runIpProxyActionWithLock('change', async () => {
        await persistCurrentSettingsForAction();
        await changeIpProxyExitBySession();
      })
      : await (async () => {
        await persistCurrentSettingsForAction();
        await changeIpProxyExitBySession();
        return { skipped: false };
      })();
    if (result?.skipped) {
      return;
    }
  } catch (err) {
    showToast(err?.message || String(err || '未知错误'), 'error');
  }
});

btnIpProxyProbe?.addEventListener('click', async () => {
  try {
    const result = typeof runIpProxyActionWithLock === 'function'
      ? await runIpProxyActionWithLock('probe', async () => {
        await persistCurrentSettingsForAction();
        await probeIpProxyExit();
      })
      : await (async () => {
        await persistCurrentSettingsForAction();
        await probeIpProxyExit();
        return { skipped: false };
      })();
    if (result?.skipped) {
      return;
    }
  } catch (err) {
    showToast(err?.message || String(err || '未知错误'), 'error');
  }
});

btnIpProxyExitRefresh?.addEventListener('click', async () => {
  try {
    const result = typeof runIpProxyActionWithLock === 'function'
      ? await runIpProxyActionWithLock('probe', async () => {
        await persistCurrentSettingsForAction();
        await probeIpProxyExit();
      })
      : await (async () => {
        await persistCurrentSettingsForAction();
        await probeIpProxyExit();
        return { skipped: false };
      })();
    if (result?.skipped) {
      return;
    }
  } catch (err) {
    showToast(err?.message || String(err || '未知错误'), 'error');
  }
});

btnIpProxyCheckIp?.addEventListener('click', async () => {
  try {
    await chrome.tabs.create({ url: 'https://ipinfo.io/what-is-my-ip' });
  } catch (err) {
    showToast(`打开 IP 检测页失败：${err?.message || String(err || '未知错误')}`, 'error');
  }
});

selectCfDomain.addEventListener('change', () => {
  if (selectCfDomain.disabled) {
    return;
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectTempEmailDomain.addEventListener('change', () => {
  if (selectTempEmailDomain.disabled) {
    return;
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnCfDomainMode.addEventListener('click', async () => {
  try {
    if (!cloudflareDomainEditMode) {
      setCloudflareDomainEditMode(true, { clearInput: true });
      return;
    }

    const newDomain = normalizeCloudflareDomainValue(inputCfDomain.value);
    if (!newDomain) {
      showToast('请输入有效的 Cloudflare 域名。', 'warn');
      inputCfDomain.focus();
      return;
    }

    const { domains } = getCloudflareDomainsFromState();
    await saveCloudflareDomainSettings([...domains, newDomain], newDomain);
  } catch (err) {
    showToast(err.message, 'error');
  }
});

btnTempEmailDomainMode.addEventListener('click', async () => {
  try {
    await syncCloudflareTempEmailDomainsFromService();
  } catch (err) {
    showToast(err.message, 'error');
  }
});

inputCfDomain.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    btnCfDomainMode.click();
  }
});

inputTempEmailDomain.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault();
    btnTempEmailDomainMode.click();
  }
});

inputSub2ApiUrl.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSub2ApiUrl.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputSub2ApiEmail.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSub2ApiEmail.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputSub2ApiPassword.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSub2ApiPassword.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputSub2ApiGroup.addEventListener('change', () => {
  syncLatestState({
    sub2apiGroupName: getSelectedSub2ApiGroupName(),
    sub2apiGroupNames: normalizeSub2ApiGroupOptions(
      getSub2ApiGroupOptionsState(latestState),
      getSelectedSub2ApiGroupName()
    ),
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputSub2ApiAccountPriority.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSub2ApiAccountPriority.addEventListener('blur', () => {
  inputSub2ApiAccountPriority.value = String(normalizeSub2ApiAccountPriorityValue(inputSub2ApiAccountPriority.value));
  saveSettings({ silent: true }).catch(() => { });
});

btnAddSub2ApiGroup?.addEventListener('click', () => {
  handleAddSub2ApiGroup().catch((error) => {
    showToast(error?.message || '添加 SUB2API 分组失败。', 'error');
  });
});

inputSub2ApiDefaultProxy.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSub2ApiDefaultProxy.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputCodex2ApiUrl.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputCodex2ApiUrl.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputCodex2ApiAdminKey.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputCodex2ApiAdminKey.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

[
  inputIpProxyApiUrl,
  inputIpProxyAccountList,
  inputIpProxyHost,
  inputIpProxyUsername,
  inputIpProxyPassword,
].forEach((input) => {
  input?.addEventListener('input', () => {
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    saveSettings({ silent: true }).catch(() => {});
  });
});

inputIpProxyApiUrl?.addEventListener('input', () => {
  if (typeof sync711ApiFieldsFromUrlForPanel === 'function') {
    sync711ApiFieldsFromUrlForPanel();
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
  }
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

[
  inputIpProxyApiCount,
  inputIpProxyApiZone,
  inputIpProxyApiPtype,
  selectIpProxyApiHost,
  selectIpProxyApiProto,
  selectIpProxyApiStype,
  inputIpProxyApiSplit,
  selectIpProxyApiSessType,
  inputIpProxyApiSessTime,
  selectIpProxyApiSessAuto,
  inputIpProxyApiRefreshKey,
].forEach((input) => {
  input?.addEventListener('input', () => {
    if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
      rebuild711ApiUrlFromFieldsForPanel();
    }
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('change', () => {
    if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
      rebuild711ApiUrlFromFieldsForPanel();
    }
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  });
  input?.addEventListener('blur', () => {
    if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
      rebuild711ApiUrlFromFieldsForPanel();
    }
    saveSettings({ silent: true }).catch(() => {});
  });
});

inputIpProxyApiRegion?.addEventListener('input', () => {
  if (typeof normalizeIpProxyApiRegionDraftForPanel === 'function') {
    inputIpProxyApiRegion.value = normalizeIpProxyApiRegionDraftForPanel(inputIpProxyApiRegion.value || '');
  }
  if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
    rebuild711ApiUrlFromFieldsForPanel();
  }
  syncCurrentIpProxyServiceProfileToLatestState();
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputIpProxyApiRegion?.addEventListener('change', () => {
  if (typeof normalizeIpProxyApiRegionForPanel === 'function') {
    inputIpProxyApiRegion.value = normalizeIpProxyApiRegionForPanel(inputIpProxyApiRegion.value || '');
  }
  if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
    rebuild711ApiUrlFromFieldsForPanel();
  }
  syncCurrentIpProxyServiceProfileToLatestState();
  updateIpProxyUI(latestState);
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputIpProxyApiRegion?.addEventListener('blur', () => {
  if (typeof normalizeIpProxyApiRegionForPanel === 'function') {
    inputIpProxyApiRegion.value = normalizeIpProxyApiRegionForPanel(inputIpProxyApiRegion.value || '');
  }
  if (typeof rebuild711ApiUrlFromFieldsForPanel === 'function') {
    rebuild711ApiUrlFromFieldsForPanel();
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyUsername?.addEventListener('paste', () => {
  setTimeout(() => {
    let profileUpdated = false;
    if (typeof sync711SessionFieldsFromUsernameForPanel !== 'function') {
      profileUpdated = false;
    } else {
      const result = sync711SessionFieldsFromUsernameForPanel();
      profileUpdated = profileUpdated || Boolean(result?.updated);
    }
    if (typeof sync711RegionFieldFromUsernameForPanel === 'function') {
      const regionResult = sync711RegionFieldFromUsernameForPanel();
      profileUpdated = profileUpdated || Boolean(regionResult?.updated);
    }
    if (typeof syncIpProxyRegionInputFromCredentials === 'function') {
      const beforeRegion = String(inputIpProxyRegion?.value || '');
      syncIpProxyRegionInputFromCredentials({ force: true });
      const afterRegion = String(inputIpProxyRegion?.value || '');
      profileUpdated = profileUpdated || (beforeRegion !== afterRegion);
    }
    if (!profileUpdated) return;
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
    scheduleSettingsAutoSave();
  }, 0);
});

inputIpProxyHost?.addEventListener('blur', () => {
  if (typeof syncIpProxyRegionInputFromCredentials === 'function') {
    const beforeRegion = String(inputIpProxyRegion?.value || '');
    syncIpProxyRegionInputFromCredentials({ force: true });
    const afterRegion = String(inputIpProxyRegion?.value || '');
    if (afterRegion !== beforeRegion) {
      markSettingsDirty(true);
      saveSettings({ silent: true }).catch(() => {});
    }
  }
});

inputIpProxyUsername?.addEventListener('blur', () => {
  let profileUpdated = false;
  if (typeof sync711SessionFieldsFromUsernameForPanel === 'function') {
    const result = sync711SessionFieldsFromUsernameForPanel();
    profileUpdated = profileUpdated || Boolean(result?.updated);
  }
  if (typeof sync711RegionFieldFromUsernameForPanel === 'function') {
    const regionResult = sync711RegionFieldFromUsernameForPanel();
    profileUpdated = profileUpdated || Boolean(regionResult?.updated);
  }

  if (typeof syncIpProxyRegionInputFromCredentials === 'function') {
    const beforeRegion = String(inputIpProxyRegion?.value || '');
    syncIpProxyRegionInputFromCredentials({ force: true });
    const afterRegion = String(inputIpProxyRegion?.value || '');
    profileUpdated = profileUpdated || (afterRegion !== beforeRegion);
  }

  if (profileUpdated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => {});
  }
});

inputIpProxyAccountSessionPrefix?.addEventListener('input', () => {
  const syncResult = typeof sync711UsernameFromSessionFieldsForPanel === 'function'
    ? sync711UsernameFromSessionFieldsForPanel()
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
  }
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxyAccountSessionPrefix?.addEventListener('blur', () => {
  inputIpProxyAccountSessionPrefix.value = normalizeIpProxyAccountSessionPrefix(inputIpProxyAccountSessionPrefix.value || '');
  const syncResult = typeof sync711UsernameFromSessionFieldsForPanel === 'function'
    ? sync711UsernameFromSessionFieldsForPanel({ removeWhenEmpty: true })
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyAccountLifeMinutes?.addEventListener('input', () => {
  const syncResult = typeof sync711UsernameFromSessionFieldsForPanel === 'function'
    ? sync711UsernameFromSessionFieldsForPanel()
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
  }
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxyAccountLifeMinutes?.addEventListener('blur', () => {
  inputIpProxyAccountLifeMinutes.value = normalizeIpProxyAccountLifeMinutes(inputIpProxyAccountLifeMinutes.value || '');
  const syncResult = typeof sync711UsernameFromSessionFieldsForPanel === 'function'
    ? sync711UsernameFromSessionFieldsForPanel({ removeWhenEmpty: true })
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyRegion?.addEventListener('input', () => {
  const normalizedRegion = typeof normalize711RegionCodeForPanel === 'function'
    ? normalize711RegionCodeForPanel(inputIpProxyRegion.value || '')
    : String(inputIpProxyRegion.value || '').trim().toUpperCase();
  if (normalizedRegion) {
    inputIpProxyRegion.value = normalizedRegion;
  }

  const syncResult = typeof sync711UsernameFromRegionForPanel === 'function'
    ? sync711UsernameFromRegionForPanel()
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
  }
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxyRegion?.addEventListener('blur', () => {
  const normalizedRegion = typeof normalize711RegionCodeForPanel === 'function'
    ? normalize711RegionCodeForPanel(inputIpProxyRegion.value || '')
    : String(inputIpProxyRegion.value || '').trim().toUpperCase();
  inputIpProxyRegion.value = normalizedRegion;
  const syncResult = typeof sync711UsernameFromRegionForPanel === 'function'
    ? sync711UsernameFromRegionForPanel({ removeWhenEmpty: true })
    : null;
  if (syncResult?.updated) {
    syncCurrentIpProxyServiceProfileToLatestState();
    updateIpProxyUI(latestState);
    markSettingsDirty(true);
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyPoolTargetCount?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxyPoolTargetCount?.addEventListener('blur', () => {
  inputIpProxyPoolTargetCount.value = normalizeIpProxyPoolTargetCount(inputIpProxyPoolTargetCount.value || '', 20);
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxySwitchIpRoundCount?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxySwitchIpRoundCount?.addEventListener('blur', () => {
  inputIpProxySwitchIpRoundCount.value = typeof normalizeIpProxySwitchIpRoundCount === 'function'
    ? normalizeIpProxySwitchIpRoundCount(inputIpProxySwitchIpRoundCount.value || '', 1)
    : normalizeIpProxyPoolTargetCount(inputIpProxySwitchIpRoundCount.value || '', 1);
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyAutoRefreshPoolOnExhausted?.addEventListener('change', () => {
  markSettingsDirty(true);
  if (typeof updateIpProxyUI === 'function') {
    updateIpProxyUI(latestState);
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyAutoSyncEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  if (typeof updateIpProxyUI === 'function') {
    updateIpProxyUI(latestState);
  }
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyAutoSyncIntervalMinutes?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputIpProxyAutoSyncIntervalMinutes?.addEventListener('blur', () => {
  const numeric = Number.parseInt(String(inputIpProxyAutoSyncIntervalMinutes.value || '').trim(), 10);
  const normalized = Number.isFinite(numeric)
    ? Math.max(1, Math.min(1440, numeric))
    : 15;
  inputIpProxyAutoSyncIntervalMinutes.value = String(normalized);
  saveSettings({ silent: true }).catch(() => {});
});

inputIpProxyPort?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputIpProxyPort?.addEventListener('blur', () => {
  const normalizedPort = normalizeIpProxyPort(inputIpProxyPort.value || '');
  inputIpProxyPort.value = normalizedPort > 0 ? String(normalizedPort) : '';
  saveSettings({ silent: true }).catch(() => {});
});

inputEmailPrefix.addEventListener('input', () => {
  maybeClearGeneratedAliasAfterEmailPrefixChange().catch(() => { });
  syncManagedAliasBaseEmailDraftFromInput();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputEmailPrefix.addEventListener('blur', () => {
  maybeClearGeneratedAliasAfterEmailPrefixChange().catch(() => { });
  syncManagedAliasBaseEmailDraftFromInput();
  saveSettings({ silent: true }).catch(() => { });
});

inputCustomEmailPool?.addEventListener('input', () => {
  syncRunCountFromConfiguredEmailPool();
  updateMailProviderUI();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputCustomEmailPool?.addEventListener('blur', () => {
  inputCustomEmailPool.value = normalizeCustomEmailPoolEntries(inputCustomEmailPool.value).join('\n');
  syncRunCountFromConfiguredEmailPool();
  updateMailProviderUI();
  saveSettings({ silent: true }).catch(() => { });
});

inputCustomMailProviderPool?.addEventListener('input', () => {
  syncRunCountFromConfiguredEmailPool();
  updateMailProviderUI();
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputCustomMailProviderPool?.addEventListener('blur', () => {
  inputCustomMailProviderPool.value = normalizeCustomEmailPoolEntries(inputCustomMailProviderPool.value).join('\n');
  syncRunCountFromConfiguredEmailPool();
  updateMailProviderUI();
  saveSettings({ silent: true }).catch(() => { });
});

selectMail2925PoolAccount?.addEventListener('change', async () => {
  try {
    await syncSelectedMail2925PoolAccount();
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  } catch (err) {
    showToast(err.message, 'error');
  }
});

inputMail2925UseAccountPool?.addEventListener('change', async () => {
  const enabled = Boolean(inputMail2925UseAccountPool.checked);
  syncLatestState({ mail2925UseAccountPool: enabled });
  if (enabled) {
    syncMail2925PoolAccountOptions(latestState);
    if (!selectMail2925PoolAccount.value && getMail2925Accounts().length > 0) {
      selectMail2925PoolAccount.value = String(getMail2925Accounts()[0]?.id || '');
    }
    try {
      await syncSelectedMail2925PoolAccount({ silent: true });
    } catch (err) {
      showToast(err.message, 'error');
    }
  }
  setManagedAliasBaseEmailInputForProvider('2925', latestState);
  updateMailProviderUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputInbucketMailbox.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputInbucketMailbox.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputInbucketHost.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputInbucketHost.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputRunCount.addEventListener('input', () => {
  clearPendingAutoRunStartRunCount();
  updateFallbackThreadIntervalInputState();
});
inputRunCount.addEventListener('blur', () => {
  if (shouldLockRunCountToEmailPool()) {
    syncRunCountFromConfiguredEmailPool();
    updateFallbackThreadIntervalInputState();
    return;
  }
  inputRunCount.value = String(getRunCountValue());
  updateFallbackThreadIntervalInputState();
});

inputAutoSkipFailures.addEventListener('change', async () => {
  if (inputAutoSkipFailures.checked && !isAutoSkipFailuresPromptDismissed()) {
    const result = await openAutoSkipFailuresConfirmModal();
    if (!result.confirmed) {
      inputAutoSkipFailures.checked = false;
      updateFallbackThreadIntervalInputState();
      return;
    }
    if (result.dismissPrompt) {
      setAutoSkipFailuresPromptDismissed(true);
    }
  }
  updateFallbackThreadIntervalInputState();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputAutoRunRetryPaypalCallback?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputAutoRunPreserveIssueLogsOnRestart?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputTempEmailBaseUrl.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputTempEmailBaseUrl.addEventListener('blur', () => {
  inputTempEmailBaseUrl.value = normalizeCloudflareTempEmailBaseUrlValue(inputTempEmailBaseUrl.value);
  saveSettings({ silent: true }).catch(() => { });
});

inputTempEmailAdminAuth.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputTempEmailAdminAuth.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputTempEmailCustomAuth.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputTempEmailCustomAuth.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputTempEmailReceiveMailbox.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputTempEmailReceiveMailbox.addEventListener('blur', () => {
  inputTempEmailReceiveMailbox.value = normalizeCloudflareTempEmailReceiveMailboxValue(inputTempEmailReceiveMailbox.value);
  saveSettings({ silent: true }).catch(() => { });
});

inputTempEmailUseRandomSubdomain?.addEventListener('change', () => {
  updateMailProviderUI();
  clearRegistrationEmail({ silent: true }).catch(() => { });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputAutoSkipFailuresThreadIntervalMinutes.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputAutoSkipFailuresThreadIntervalMinutes.addEventListener('blur', () => {
  inputAutoSkipFailuresThreadIntervalMinutes.value = String(
    normalizeAutoRunThreadIntervalMinutes(inputAutoSkipFailuresThreadIntervalMinutes.value)
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputAutoDelayEnabled.addEventListener('change', () => {
  updateAutoDelayInputState();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputStep6CookieCleanupEnabled?.addEventListener('change', () => {
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputStepExecutionRangeEnabled?.addEventListener('change', () => {
  const stepExecutionRangeByFlow = buildStepExecutionRangeByFlowPayload(latestState?.stepExecutionRangeByFlow);
  syncLatestState({ stepExecutionRangeByFlow });
  applyStepExecutionRangeState(latestState);
  renderStepStatuses(latestState);
  updateButtonStates();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectFlow?.addEventListener('change', () => {
  const nextActiveFlowId = typeof normalizeFlowId === 'function'
    ? normalizeFlowId(selectFlow.value, latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID)
    : (String(selectFlow.value || latestState?.activeFlowId || latestState?.flowId || DEFAULT_ACTIVE_FLOW_ID).trim().toLowerCase() || DEFAULT_ACTIVE_FLOW_ID);
  const nextStateBase = {
    ...(latestState || {}),
    activeFlowId: nextActiveFlowId,
    flowId: nextActiveFlowId,
  };
  const defaultTargetId = typeof getDefaultTargetIdForFlow === 'function'
    ? getDefaultTargetIdForFlow(nextActiveFlowId)
    : (nextActiveFlowId === DEFAULT_ACTIVE_FLOW_ID ? 'cpa' : 'kiro-rs');
  const nextTargetId = typeof getSelectedTargetIdForState === 'function'
    ? getSelectedTargetIdForState(nextStateBase, nextActiveFlowId)
    : (nextActiveFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? normalizePanelMode(nextStateBase?.panelMode || defaultTargetId)
      : String(nextStateBase?.kiroTargetId || defaultTargetId).trim().toLowerCase() || defaultTargetId);
  syncLatestState({
    activeFlowId: nextActiveFlowId,
    flowId: nextActiveFlowId,
    ...(nextActiveFlowId === DEFAULT_ACTIVE_FLOW_ID
      ? { panelMode: normalizePanelMode(nextTargetId || defaultTargetId) }
      : {
        kiroTargetId: typeof normalizeTargetIdForFlow === 'function'
          ? normalizeTargetIdForFlow(nextActiveFlowId, nextTargetId, defaultTargetId)
          : (String(nextTargetId || defaultTargetId).trim().toLowerCase() || defaultTargetId),
      }),
  });
  updatePanelModeUI();
  if (typeof syncStepDefinitionsFromUiState === 'function') {
    syncStepDefinitionsFromUiState({
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled: typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
        ? Boolean(inputPhonePlusModeEnabled.checked)
        : Boolean(latestState?.phonePlusModeEnabled),
      signupMethod: getSelectedSignupMethod(),
      phoneSignupReloginAfterBindEmailEnabled: typeof inputPhoneSignupReloginAfterBindEmail !== 'undefined' && inputPhoneSignupReloginAfterBindEmail
        ? Boolean(inputPhoneSignupReloginAfterBindEmail.checked)
        : Boolean(latestState?.phoneSignupReloginAfterBindEmailEnabled),
    });
  }
  applyStepExecutionRangeState(latestState);
  renderStepStatuses(latestState);
  updateButtonStates();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

[inputStepExecutionRangeFrom, inputStepExecutionRangeTo].forEach((input) => {
  const handleRangeChange = () => {
    const stepExecutionRangeByFlow = buildStepExecutionRangeByFlowPayload(latestState?.stepExecutionRangeByFlow);
    syncLatestState({ stepExecutionRangeByFlow });
    markSettingsDirty(true);
    renderStepStatuses(latestState);
    updateButtonStates();
    scheduleSettingsAutoSave();
  };
  input?.addEventListener('input', handleRangeChange);
  input?.addEventListener('change', handleRangeChange);
  input?.addEventListener('blur', () => {
    clampStepExecutionRangeInputs();
    saveSettings({ silent: true }).catch(() => { });
  });
});

inputAutoDelayMinutes.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputAutoDelayMinutes.addEventListener('blur', () => {
  inputAutoDelayMinutes.value = String(normalizeAutoDelayMinutes(inputAutoDelayMinutes.value));
  saveSettings({ silent: true }).catch(() => { });
});



function getPhoneSmsCountrySelectionForProvider(provider = getSelectedPhoneSmsProvider(), options = {}) {
  const normalizedProvider = normalizePhoneSmsProvider(provider);
  const countrySelect = selectHeroSmsCountry || selectHeroSmsCountryFallback;
  const selectionLimit = Math.max(1, Math.floor(Number(options.maxSelection) || HERO_SMS_COUNTRY_SELECTION_MAX));
  const ensureDefault = options.ensureDefault !== false;
  const defaultCountry = normalizedProvider === PHONE_SMS_PROVIDER_FIVE_SIM
    ? { id: DEFAULT_FIVE_SIM_COUNTRY_ID, label: DEFAULT_FIVE_SIM_COUNTRY_LABEL }
    : { id: DEFAULT_HERO_SMS_COUNTRY_ID, label: DEFAULT_HERO_SMS_COUNTRY_LABEL };

  if (!countrySelect) {
    return ensureDefault ? [defaultCountry] : [];
  }

  const optionByValue = new Map(
    Array.from(countrySelect.options || []).map((option) => [String(option.value), option])
  );
  const selectedIds = Array.from(countrySelect.options || [])
    .filter((option) => option.selected)
    .map((option) => normalizePhoneSmsCountryId(option.value, normalizedProvider))
    .filter(Boolean);

  if (!selectedIds.length && !countrySelect.multiple) {
    const fallbackId = normalizePhoneSmsCountryId(countrySelect.value, normalizedProvider);
    if (fallbackId) {
      selectedIds.push(fallbackId);
    }
  }

  const selectedSet = new Set(selectedIds.map((id) => String(id)));
  let orderedIds = heroSmsCountrySelectionOrder
    .map((id) => normalizePhoneSmsCountryId(id, normalizedProvider))
    .filter((id) => id && selectedSet.has(String(id)));

  selectedIds.forEach((id) => {
    if (!orderedIds.some((existing) => String(existing) === String(id))) {
      orderedIds.push(id);
    }
  });

  if (!orderedIds.length && ensureDefault) {
    orderedIds = [defaultCountry.id];
  }

  return orderedIds.slice(0, selectionLimit).map((id) => {
    const option = optionByValue.get(String(id));
    const optionLabel = String(option?.textContent || '').trim();
    return {
      id,
      label: optionLabel || normalizePhoneSmsCountryLabel(defaultCountry.id === id ? defaultCountry.label : '', normalizedProvider),
    };
  });
}

async function switchPhoneSmsProvider(nextProvider) {
  const previousProvider = getLastAppliedPhoneSmsProvider();
  const normalizedNextProvider = normalizePhoneSmsProvider(nextProvider);

  const currentApiKey = String(inputHeroSmsApiKey?.value || '');
  const currentMaxPrice = normalizePhoneSmsMaxPriceValue(inputHeroSmsMaxPrice?.value || '', previousProvider);
  const currentMinPrice = normalizePhoneSmsMinPriceValue(inputHeroSmsMinPrice?.value || '', previousProvider);
  const currentSelection = typeof getPhoneSmsCountrySelectionForProvider === 'function'
    ? getPhoneSmsCountrySelectionForProvider(previousProvider, { ensureDefault: true })
    : [];
  const currentPrimary = currentSelection[0] || getSelectedHeroSmsCountryOption();
  const currentFallback = currentSelection.slice(1);

  const patch = {
    phoneSmsProvider: normalizedNextProvider,
  };
  if (previousProvider === PHONE_SMS_PROVIDER_FIVE_SIM) {
    patch.fiveSimApiKey = currentApiKey;
    patch.fiveSimMaxPrice = currentMaxPrice;
    patch.fiveSimMinPrice = currentMinPrice;
    patch.fiveSimCountryId = currentPrimary.id;
    patch.fiveSimCountryLabel = currentPrimary.label;
    patch.fiveSimCountryFallback = currentFallback;
    patch.fiveSimCountryOrder = [currentPrimary, ...currentFallback]
      .map((country) => normalizeFiveSimCountryId(country?.id, ''))
      .filter(Boolean);
    patch.fiveSimOperator = normalizeFiveSimOperator(inputFiveSimOperator?.value || latestState?.fiveSimOperator);
  } else if (previousProvider === PHONE_SMS_PROVIDER_SMSBOWER) {
    patch.smsBowerApiKey = currentApiKey;
    patch.smsBowerMaxPrice = currentMaxPrice;
    patch.smsBowerMinPrice = currentMinPrice;
    patch.smsBowerPreferredPrice = normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice?.value || latestState?.smsBowerPreferredPrice || '');
    patch.smsBowerCountryId = currentPrimary.id;
    patch.smsBowerCountryLabel = currentPrimary.label;
    patch.smsBowerCountryFallback = currentFallback;
  } else if (previousProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
    patch.smsVerificationNumberApiKey = currentApiKey;
    patch.smsVerificationNumberMaxPrice = currentMaxPrice;
    patch.smsVerificationNumberMinPrice = currentMinPrice;
    patch.smsVerificationNumberPreferredPrice = normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice?.value || latestState?.smsVerificationNumberPreferredPrice || '');
    patch.smsVerificationNumberCountryId = currentPrimary.id;
    patch.smsVerificationNumberCountryLabel = currentPrimary.label;
    patch.smsVerificationNumberCountryFallback = currentFallback;
  } else if (previousProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
    patch.grizzlySmsApiKey = currentApiKey;
    patch.grizzlySmsMaxPrice = currentMaxPrice;
    patch.grizzlySmsMinPrice = currentMinPrice;
    patch.grizzlySmsPreferredPrice = normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice?.value || latestState?.grizzlySmsPreferredPrice || '');
    patch.grizzlySmsCountryId = currentPrimary.id;
    patch.grizzlySmsCountryLabel = currentPrimary.label;
    patch.grizzlySmsCountryFallback = currentFallback;
  } else if (previousProvider === PHONE_SMS_PROVIDER_SMSPOOL) {
    patch.smsPoolApiKey = currentApiKey;
    patch.smsPoolMaxPrice = currentMaxPrice;
    patch.smsPoolMinPrice = currentMinPrice;
    patch.smsPoolPreferredPrice = normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice?.value || latestState?.smsPoolPreferredPrice || '');
    patch.smsPoolCountryId = currentPrimary.id;
    patch.smsPoolCountryLabel = currentPrimary.label;
    patch.smsPoolCountryFallback = currentFallback;
  } else {
    patch.heroSmsApiKey = currentApiKey;
    patch.heroSmsMaxPrice = currentMaxPrice;
    patch.heroSmsMinPrice = currentMinPrice;
    patch.heroSmsCountryId = currentPrimary.id;
    patch.heroSmsCountryLabel = currentPrimary.label;
    patch.heroSmsCountryFallback = currentFallback;
    patch.heroSmsOperatorByCountry = typeof getHeroSmsOperatorByCountryPayload === 'function'
      ? getHeroSmsOperatorByCountryPayload()
      : {};
  }

  syncLatestState(patch);
  setPhoneSmsProviderSelectValue(normalizedNextProvider);
  heroSmsCountrySelectionOrder = [];
  if (inputHeroSmsApiKey) {
    if (normalizedNextProvider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      inputHeroSmsApiKey.value = String(latestState?.fiveSimApiKey || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER) {
      inputHeroSmsApiKey.value = String(latestState?.smsBowerApiKey || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      inputHeroSmsApiKey.value = String(latestState?.smsVerificationNumberApiKey || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      inputHeroSmsApiKey.value = String(latestState?.grizzlySmsApiKey || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL) {
      inputHeroSmsApiKey.value = String(latestState?.smsPoolApiKey || '');
    } else {
      inputHeroSmsApiKey.value = String(latestState?.heroSmsApiKey || '');
    }
  }
  if (inputHeroSmsMaxPrice) {
    if (normalizedNextProvider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.fiveSimMaxPrice || '', PHONE_SMS_PROVIDER_FIVE_SIM);
      latestState.fiveSimMaxPrice = inputHeroSmsMaxPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.smsBowerMaxPrice || '', normalizedNextProvider);
      latestState.smsBowerMaxPrice = inputHeroSmsMaxPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.smsVerificationNumberMaxPrice || '', normalizedNextProvider);
      latestState.smsVerificationNumberMaxPrice = inputHeroSmsMaxPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.grizzlySmsMaxPrice || '', normalizedNextProvider);
      latestState.grizzlySmsMaxPrice = inputHeroSmsMaxPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL) {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.smsPoolMaxPrice || '', normalizedNextProvider);
      latestState.smsPoolMaxPrice = inputHeroSmsMaxPrice.value;
    } else {
      inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(latestState?.heroSmsMaxPrice || '', normalizedNextProvider);
      latestState.heroSmsMaxPrice = inputHeroSmsMaxPrice.value;
    }
  }
  if (typeof inputHeroSmsMinPrice !== 'undefined' && inputHeroSmsMinPrice) {
    if (normalizedNextProvider === PHONE_SMS_PROVIDER_FIVE_SIM) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.fiveSimMinPrice || '', PHONE_SMS_PROVIDER_FIVE_SIM);
      latestState.fiveSimMinPrice = inputHeroSmsMinPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.smsBowerMinPrice || '', normalizedNextProvider);
      latestState.smsBowerMinPrice = inputHeroSmsMinPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.smsVerificationNumberMinPrice || '', normalizedNextProvider);
      latestState.smsVerificationNumberMinPrice = inputHeroSmsMinPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.grizzlySmsMinPrice || '', normalizedNextProvider);
      latestState.grizzlySmsMinPrice = inputHeroSmsMinPrice.value;
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL) {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.smsPoolMinPrice || '', normalizedNextProvider);
      latestState.smsPoolMinPrice = inputHeroSmsMinPrice.value;
    } else {
      inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(latestState?.heroSmsMinPrice || '', normalizedNextProvider);
      latestState.heroSmsMinPrice = inputHeroSmsMinPrice.value;
    }
  }
  if (typeof inputHeroSmsPreferredPrice !== 'undefined' && inputHeroSmsPreferredPrice) {
    if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(latestState?.smsBowerPreferredPrice || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(latestState?.smsVerificationNumberPreferredPrice || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(latestState?.grizzlySmsPreferredPrice || '');
    } else if (normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL) {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(latestState?.smsPoolPreferredPrice || '');
    } else {
      inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(latestState?.heroSmsPreferredPrice || '');
    }
  }
  if (inputFiveSimOperator) {
    inputFiveSimOperator.value = normalizeFiveSimOperator(latestState?.fiveSimOperator);
  }
  if (displayHeroSmsPriceTiers) displayHeroSmsPriceTiers.textContent = '未获取';
  if (displayPhoneSmsBalance) displayPhoneSmsBalance.textContent = '余额未获取';
  if (rowHeroSmsPriceTiers) rowHeroSmsPriceTiers.style.display = 'none';

  await loadHeroSmsCountries({ silent: true });
  const restoredPrimary = normalizedNextProvider === PHONE_SMS_PROVIDER_FIVE_SIM
    ? {
      id: normalizeFiveSimCountryId(latestState?.fiveSimCountryId),
      label: normalizeFiveSimCountryLabel(latestState?.fiveSimCountryLabel),
    }
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER
    ? {
      id: normalizeHeroSmsCountryId(latestState?.smsBowerCountryId || latestState?.heroSmsCountryId),
      label: normalizeHeroSmsCountryLabel(latestState?.smsBowerCountryLabel || latestState?.heroSmsCountryLabel),
    }
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER
    ? {
      id: normalizeHeroSmsCountryId(latestState?.smsVerificationNumberCountryId || 33),
      label: normalizeHeroSmsCountryLabel(latestState?.smsVerificationNumberCountryLabel || 'Colombia'),
    }
    : normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS
    ? {
      id: normalizeHeroSmsCountryId(latestState?.grizzlySmsCountryId || 52),
      label: normalizeHeroSmsCountryLabel(latestState?.grizzlySmsCountryLabel || 'Thailand'),
    }
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL
    ? {
      id: normalizeHeroSmsCountryId(latestState?.smsPoolCountryId || 1),
      label: normalizeHeroSmsCountryLabel(latestState?.smsPoolCountryLabel || 'United States'),
    }
    : {
      id: normalizeHeroSmsCountryId(latestState?.heroSmsCountryId),
      label: normalizeHeroSmsCountryLabel(latestState?.heroSmsCountryLabel),
    };
  const restoredFallback = normalizedNextProvider === PHONE_SMS_PROVIDER_FIVE_SIM
    ? normalizeFiveSimCountryFallbackList(latestState?.fiveSimCountryFallback || [])
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMSBOWER
    ? normalizeHeroSmsCountryFallbackList(latestState?.smsBowerCountryFallback || [])
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMS_VERIFICATION_NUMBER
    ? normalizeHeroSmsCountryFallbackList(latestState?.smsVerificationNumberCountryFallback || [])
    : normalizedNextProvider === PHONE_SMS_PROVIDER_GRIZZLYSMS
    ? normalizeHeroSmsCountryFallbackList(latestState?.grizzlySmsCountryFallback || [])
    : normalizedNextProvider === PHONE_SMS_PROVIDER_SMSPOOL
    ? normalizeHeroSmsCountryFallbackList(latestState?.smsPoolCountryFallback || [])
    : normalizeHeroSmsCountryFallbackList(latestState?.heroSmsCountryFallback || []);
  if (typeof syncHeroSmsOperatorSelectionState === 'function') {
    syncHeroSmsOperatorSelectionState(latestState?.heroSmsOperatorByCountry || {});
  }
  applyHeroSmsFallbackSelection([restoredPrimary, ...restoredFallback], { includePrimary: true });
  updatePhoneVerificationSettingsUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => {});
}

selectPhoneSmsProvider?.addEventListener('change', () => {
  switchPhoneSmsProvider(selectPhoneSmsProvider.value).catch((error) => {
    showToast(`切换接码平台失败：${error?.message || error}`, 'warn', 2200);
  });
});

inputPhoneVerificationEnabled?.addEventListener('change', () => {
  if (inputPhonePlusModeEnabled?.checked) {
    inputPhoneVerificationEnabled.checked = true;
    setPhoneVerificationSectionExpanded(true);
    updatePhoneVerificationSettingsUI();
  } else if (inputPhoneVerificationEnabled.checked) {
    setPhoneVerificationSectionExpanded(true);
    updatePhoneVerificationSettingsUI();
  } else {
    setSignupMethod(SIGNUP_METHOD_EMAIL);
    updatePhoneVerificationSettingsUI();
    showToast('已切回邮箱注册', 'info', 1600);
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

signupMethodButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    if (button.disabled) {
      return;
    }
    const nextSignupMethod = normalizeSignupMethod(button.dataset.signupMethod);
    const confirmed = await confirmCpaPhoneSignupIfNeeded({
      signupMethod: nextSignupMethod,
      panelMode: getSelectedPanelMode(),
    });
    if (!confirmed) {
      updateSignupMethodUI();
      return;
    }
    setSignupMethod(nextSignupMethod);
    updateSignupMethodUI();
    markSettingsDirty(true);
    saveSettings({ silent: true }).catch(() => { });
  });
});

inputPhoneSignupReloginAfterBindEmail?.addEventListener('change', () => {
  const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
    ? resolveStepDefinitionCapabilityState({
      ...(latestState || {}),
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled: typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
        ? Boolean(inputPhonePlusModeEnabled.checked)
        : Boolean(latestState?.phonePlusModeEnabled),
      signupMethod: getSelectedSignupMethod(),
      phoneSignupReloginAfterBindEmailEnabled: Boolean(inputPhoneSignupReloginAfterBindEmail.checked),
    }, {
      signupMethod: getSelectedSignupMethod(),
    })
    : {
      plusModeEnabled: typeof inputPlusModeEnabled !== 'undefined' && inputPlusModeEnabled
        ? Boolean(inputPlusModeEnabled.checked)
        : Boolean(latestState?.plusModeEnabled),
      phonePlusModeEnabled: typeof inputPhonePlusModeEnabled !== 'undefined' && inputPhonePlusModeEnabled
        ? Boolean(inputPhonePlusModeEnabled.checked)
        : Boolean(latestState?.phonePlusModeEnabled),
      signupMethod: getSelectedSignupMethod(),
    };
  syncStepDefinitionsForMode(stepDefinitionState.plusModeEnabled, {
    phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
    plusPaymentMethod: getSelectedPlusPaymentMethod(latestState),
    signupMethod: stepDefinitionState.signupMethod,
    phoneSignupReloginAfterBindEmailEnabled: Boolean(inputPhoneSignupReloginAfterBindEmail.checked),
  });
  updatePhoneVerificationSettingsUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneSignupPhonePrefixedEmail?.addEventListener('change', () => {
  updatePhoneVerificationSettingsUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectPhoneSmsProvider?.addEventListener('change', async () => {
  if (selectPhoneSmsProvider) {
    selectPhoneSmsProvider.value = normalizePhoneSmsProviderValue(selectPhoneSmsProvider.value);
  }
  if (selectPhoneSmsProvider?.value === PHONE_SMS_PROVIDER_FIVE_SIM) {
    await loadFiveSimCountries().catch(() => { });
    applyFiveSimCountrySelection(
      Array.isArray(latestState?.fiveSimCountryOrder) ? latestState.fiveSimCountryOrder : []
    );
  } else if (selectPhoneSmsProvider?.value === PHONE_SMS_PROVIDER_NEXSMS) {
    await loadNexSmsCountries().catch(() => { });
    applyNexSmsCountrySelection(
      Array.isArray(latestState?.nexSmsCountryOrder) ? latestState.nexSmsCountryOrder : []
    );
  } else {
    await loadHeroSmsCountries().catch(() => { });
    const nextPrimaryCountryId = normalizeHeroSmsCountryId(latestState?.heroSmsCountryId, 0);
    const nextPrimaryCountries = nextPrimaryCountryId > 0
      ? [{
        id: nextPrimaryCountryId,
        label: normalizeHeroSmsCountryLabel(latestState?.heroSmsCountryLabel),
      }]
      : [];
    applyHeroSmsFallbackSelection(
      [
        ...nextPrimaryCountries,
        ...normalizeHeroSmsCountryFallbackList(
          Array.isArray(latestState?.heroSmsCountryFallback) ? latestState.heroSmsCountryFallback : []
        ),
      ],
      { includePrimary: true }
    );
  }
  updateHeroSmsPlatformDisplay();
  updatePhoneVerificationSettingsUI();
  if (rowHeroSmsPriceTiers) {
    rowHeroSmsPriceTiers.style.display = 'none';
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputAccountRunHistoryHelperBaseUrl?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});

inputAccountRunHistoryHelperBaseUrl?.addEventListener('blur', () => {
  inputAccountRunHistoryHelperBaseUrl.value = normalizeAccountRunHistoryHelperBaseUrlValue(inputAccountRunHistoryHelperBaseUrl.value);
  saveSettings({ silent: true }).catch(() => { });
});

function syncAutoStepDelayInputs() {
  inputAutoStepDelaySeconds.value = formatAutoStepDelayInputValue(inputAutoStepDelaySeconds.value);
}

function syncRegistrationStageWaitInputs() {
  if (typeof inputRegistrationStageWaitSeconds !== 'undefined' && inputRegistrationStageWaitSeconds) {
    inputRegistrationStageWaitSeconds.value = formatRegistrationStageWaitInputValue(inputRegistrationStageWaitSeconds.value);
  }
}

function syncSignupIdentityRedirectTimeoutInputs() {
  if (typeof inputSignupIdentityRedirectTimeoutSeconds !== 'undefined' && inputSignupIdentityRedirectTimeoutSeconds) {
    inputSignupIdentityRedirectTimeoutSeconds.value = formatSignupIdentityRedirectTimeoutInputValue(
      inputSignupIdentityRedirectTimeoutSeconds.value
    );
  }
}

function syncAuthContentScriptRecoveryTimeoutInputs() {
  if (typeof inputAuthContentScriptRecoveryTimeoutSeconds !== 'undefined' && inputAuthContentScriptRecoveryTimeoutSeconds) {
    inputAuthContentScriptRecoveryTimeoutSeconds.value = formatAuthContentScriptRecoveryTimeoutInputValue(
      inputAuthContentScriptRecoveryTimeoutSeconds.value
    );
  }
}

function syncSignupVerificationReadyTimeoutInputs() {
  if (typeof inputSignupVerificationReadyTimeoutSeconds !== 'undefined' && inputSignupVerificationReadyTimeoutSeconds) {
    inputSignupVerificationReadyTimeoutSeconds.value = formatSignupVerificationReadyTimeoutInputValue(
      inputSignupVerificationReadyTimeoutSeconds.value
    );
  }
  if (typeof inputSignupVerificationReadyRoundWaitSeconds !== 'undefined' && inputSignupVerificationReadyRoundWaitSeconds) {
    inputSignupVerificationReadyRoundWaitSeconds.value = formatSignupVerificationReadyRoundWaitInputValue(
      inputSignupVerificationReadyRoundWaitSeconds.value
    );
  }
}

function syncSignupVerificationReadyMaxRoundsInputs() {
  if (typeof inputSignupVerificationReadyMaxRounds !== 'undefined' && inputSignupVerificationReadyMaxRounds) {
    inputSignupVerificationReadyMaxRounds.value = formatSignupVerificationReadyMaxRoundsInputValue(
      inputSignupVerificationReadyMaxRounds.value
    );
  }
}

function syncSignupPhoneVerificationSubmitResultInputs() {
  if (typeof inputSignupPhoneVerificationSubmitResultMaxRounds !== 'undefined' && inputSignupPhoneVerificationSubmitResultMaxRounds) {
    inputSignupPhoneVerificationSubmitResultMaxRounds.value = formatSignupPhoneVerificationSubmitResultMaxRoundsInputValue(
      inputSignupPhoneVerificationSubmitResultMaxRounds.value
    );
  }
  if (typeof inputSignupPhoneVerificationSubmitResultRoundWaitSeconds !== 'undefined' && inputSignupPhoneVerificationSubmitResultRoundWaitSeconds) {
    inputSignupPhoneVerificationSubmitResultRoundWaitSeconds.value = formatSignupPhoneVerificationSubmitResultRoundWaitInputValue(
      inputSignupPhoneVerificationSubmitResultRoundWaitSeconds.value
    );
  }
}

function syncStep5ProfileSubmitResultInputs() {
  if (typeof inputStep5ProfileSubmitResultMaxRounds !== 'undefined' && inputStep5ProfileSubmitResultMaxRounds) {
    inputStep5ProfileSubmitResultMaxRounds.value = formatStep5ProfileSubmitResultMaxRoundsInputValue(
      inputStep5ProfileSubmitResultMaxRounds.value
    );
  }
  if (typeof inputStep5ProfileSubmitResultRoundWaitSeconds !== 'undefined' && inputStep5ProfileSubmitResultRoundWaitSeconds) {
    inputStep5ProfileSubmitResultRoundWaitSeconds.value = formatStep5ProfileSubmitResultRoundWaitInputValue(
      inputStep5ProfileSubmitResultRoundWaitSeconds.value
    );
  }
}

inputAutoStepDelaySeconds.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputAutoStepDelaySeconds.addEventListener('blur', () => {
  syncAutoStepDelayInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputRegistrationStageWaitSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputRegistrationStageWaitSeconds?.addEventListener('blur', () => {
  syncRegistrationStageWaitInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputSignupIdentityRedirectTimeoutSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupIdentityRedirectTimeoutSeconds?.addEventListener('blur', () => {
  syncSignupIdentityRedirectTimeoutInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputAuthContentScriptRecoveryTimeoutSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputAuthContentScriptRecoveryTimeoutSeconds?.addEventListener('blur', () => {
  syncAuthContentScriptRecoveryTimeoutInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputSignupVerificationReadyTimeoutSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupVerificationReadyTimeoutSeconds?.addEventListener('blur', () => {
  syncSignupVerificationReadyTimeoutInputs();
  saveSettings({ silent: true }).catch(() => { });
});
inputSignupVerificationReadyRoundWaitSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupVerificationReadyRoundWaitSeconds?.addEventListener('blur', () => {
  syncSignupVerificationReadyTimeoutInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputSignupVerificationReadyMaxRounds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupVerificationReadyMaxRounds?.addEventListener('blur', () => {
  syncSignupVerificationReadyMaxRoundsInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputStep5ProfileSubmitResultMaxRounds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputStep5ProfileSubmitResultMaxRounds?.addEventListener('blur', () => {
  syncStep5ProfileSubmitResultInputs();
  saveSettings({ silent: true }).catch(() => { });
});
inputStep5ProfileSubmitResultRoundWaitSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputStep5ProfileSubmitResultRoundWaitSeconds?.addEventListener('blur', () => {
  syncStep5ProfileSubmitResultInputs();
  saveSettings({ silent: true }).catch(() => { });
});

inputVerificationResendCount?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputVerificationResendCount?.addEventListener('blur', () => {
  inputVerificationResendCount.value = String(
    normalizeVerificationResendCount(
      inputVerificationResendCount.value,
      DEFAULT_VERIFICATION_RESEND_COUNT
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputHeroSmsApiKey?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputHeroSmsApiKey?.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputFiveSimApiKey?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputFiveSimApiKey?.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputFiveSimOperator?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputFiveSimOperator?.addEventListener('blur', () => {
  inputFiveSimOperator.value = normalizeFiveSimOperatorValue(inputFiveSimOperator.value);
  saveSettings({ silent: true }).catch(() => { });
});

inputFiveSimProduct?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputFiveSimProduct?.addEventListener('blur', () => {
  inputFiveSimProduct.value = normalizeFiveSimProductValue(inputFiveSimProduct.value);
  updateHeroSmsPlatformDisplay();
  saveSettings({ silent: true }).catch(() => { });
});

inputNexSmsApiKey?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputNexSmsApiKey?.addEventListener('blur', () => {
  saveSettings({ silent: true }).catch(() => { });
});

inputNexSmsServiceCode?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputNexSmsServiceCode?.addEventListener('blur', () => {
  inputNexSmsServiceCode.value = normalizeNexSmsServiceCodeValue(inputNexSmsServiceCode.value);
  updateHeroSmsPlatformDisplay();
  saveSettings({ silent: true }).catch(() => { });
});

inputHeroSmsReuseEnabled?.addEventListener('change', () => {
  if (isPhoneSignupReuseLocked(latestState)) {
    inputHeroSmsReuseEnabled.checked = false;
    updatePhoneVerificationSettingsUI();
    return;
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputFreePhoneReuseEnabled?.addEventListener('change', () => {
  if (isPhoneSignupReuseLocked(latestState)) {
    inputFreePhoneReuseEnabled.checked = false;
    if (inputFreePhoneReuseAutoEnabled) {
      inputFreePhoneReuseAutoEnabled.checked = false;
    }
    updatePhoneVerificationSettingsUI();
    return;
  }
  if (!inputFreePhoneReuseEnabled.checked && inputFreePhoneReuseAutoEnabled) {
    inputFreePhoneReuseAutoEnabled.checked = false;
  }
  updatePhoneVerificationSettingsUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

inputFreePhoneReuseAutoEnabled?.addEventListener('change', () => {
  if (isPhoneSignupReuseLocked(latestState)) {
    inputFreePhoneReuseAutoEnabled.checked = false;
    updatePhoneVerificationSettingsUI();
    return;
  }
  updatePhoneVerificationSettingsUI();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnSaveFreeReusablePhone?.addEventListener('click', async () => {
  if (isPhoneSignupReuseLocked(latestState)) {
    showToast?.('手机号注册流程不能记录白嫖复用号码，请切回邮箱注册后再使用。', 'warn', 2600);
    updatePhoneVerificationSettingsUI();
    return;
  }
  const phoneNumber = String(inputFreeReusablePhone?.value || '').trim();
  if (!phoneNumber) {
    showToast?.('请先填写白嫖复用手机号。', 'warn', 2200);
    inputFreeReusablePhone?.focus?.();
    return;
  }
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'SET_FREE_REUSABLE_PHONE', payload: { phoneNumber },
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    await refreshFreeReusablePhoneStateFallback(response || {});
    showToast?.('已记录白嫖复用手机号。', 'success', 1800);
  } catch (error) {
    console.error('Failed to save free reusable phone:', error);
    showToast?.(`记录白嫖复用手机号失败：${error?.message || error}`, 'error', 4000);
  }
});

btnClearFreeReusablePhone?.addEventListener('click', async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CLEAR_FREE_REUSABLE_PHONE',
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    await refreshFreeReusablePhoneStateFallback(response || {}, { clear: true });
    showToast?.('已清除白嫖复用手机号。', 'info', 1800);
  } catch (error) {
    console.error('Failed to clear free reusable phone:', error);
    showToast?.(`清除白嫖复用手机号失败：${error?.message || error}`, 'error', 4000);
  }
});

btnClearFailedSignupPhoneReuse?.addEventListener('click', async () => {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'CLEAR_FAILED_SIGNUP_PHONE_REUSE',
    });
    if (response?.error) {
      throw new Error(response.error);
    }
    syncLatestState({
      ...(response?.state || {}),
      failedSignupPhoneReuseActivation: response?.failedSignupPhoneReuseActivation ?? null,
    });
    updateHeroSmsRuntimeDisplay(latestState);
    showToast?.('已清除失败复用手机号。', 'info', 1800);
  } catch (error) {
    console.error('Failed to clear failed signup phone reuse:', error);
    showToast?.(`清除失败复用手机号失败：${error?.message || error}`, 'error', 4000);
  }
});

selectHeroSmsAcquirePriority?.addEventListener('change', () => {
  selectHeroSmsAcquirePriority.value = normalizeHeroSmsAcquirePriority(selectHeroSmsAcquirePriority.value);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});
selectHeroSmsPreferredActivation?.addEventListener('change', () => {
  if (isPhoneSignupReuseLocked(latestState)) {
    renderPhonePreferredActivationOptions(latestState);
    updatePhoneVerificationSettingsUI();
    return;
  }
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});
inputHeroSmsMaxPrice?.addEventListener('input', () => {
  markSettingsDirty(true);
});
inputHeroSmsMaxPrice?.addEventListener('blur', () => {
  inputHeroSmsMaxPrice.value = normalizePhoneSmsMaxPriceValue(inputHeroSmsMaxPrice.value, getSelectedPhoneSmsProvider());
  saveSettings({ silent: true }).catch(() => { });
});
inputHeroSmsMinPrice?.addEventListener('input', () => {
  markSettingsDirty(true);
});
inputHeroSmsMinPrice?.addEventListener('blur', () => {
  inputHeroSmsMinPrice.value = normalizePhoneSmsMinPriceValue(inputHeroSmsMinPrice.value, getSelectedPhoneSmsProvider());
  saveSettings({ silent: true }).catch(() => { });
});

inputFiveSimOperator?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputFiveSimOperator?.addEventListener('blur', () => {
  inputFiveSimOperator.value = normalizeFiveSimOperator(inputFiveSimOperator.value);
  saveSettings({ silent: true }).catch(() => { });
});
inputHeroSmsPreferredPrice?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputHeroSmsPreferredPrice?.addEventListener('blur', () => {
  inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(inputHeroSmsPreferredPrice.value);
  saveSettings({ silent: true }).catch(() => { });
});

selectFiveSimCountry?.addEventListener('change', () => {
  syncFiveSimCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectNexSmsCountry?.addEventListener('change', () => {
  syncNexSmsCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  updateHeroSmsPlatformDisplay();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnHeroSmsPricePreview?.addEventListener('click', async () => {
  try {
    await previewHeroSmsPriceTiers();
    if (typeof showToast === 'function') {
      showToast('已刷新接码国家价格预览。', 'info', 1600);
    }
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast(`价格预览失败：${error?.message || error}`, 'warn', 2200);
    }
  }
});

btnPhoneSmsBalance?.addEventListener('click', async () => {
  try {
    await previewPhoneSmsBalance();
    if (typeof showToast === 'function') {
      showToast('已刷新接码平台余额。', 'info', 1600);
    }
  } catch (error) {
    if (typeof showToast === 'function') {
      showToast(`余额查询失败：${error?.message || error}`, 'warn', 2200);
    }
  }
});

inputPhoneReplacementLimit?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneReplacementLimit?.addEventListener('blur', () => {
  inputPhoneReplacementLimit.value = String(
    normalizePhoneVerificationReplacementLimit(
      inputPhoneReplacementLimit.value,
      DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneActivationRetryRounds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneActivationRetryRounds?.addEventListener('blur', () => {
  inputPhoneActivationRetryRounds.value = String(
    normalizePhoneActivationRetryRoundsValue(
      inputPhoneActivationRetryRounds.value,
      DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneActivationTierUpgradeLimit?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneActivationTierUpgradeLimit?.addEventListener('blur', () => {
  inputPhoneActivationTierUpgradeLimit.value = String(
    normalizePhoneActivationTierUpgradeLimit(
      inputPhoneActivationTierUpgradeLimit.value,
      DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneCodeWaitSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneCodeWaitSeconds?.addEventListener('blur', () => {
  inputPhoneCodeWaitSeconds.value = String(
    normalizePhoneCodeWaitSecondsValue(inputPhoneCodeWaitSeconds.value, DEFAULT_PHONE_CODE_WAIT_SECONDS)
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneCodeTimeoutWindows?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneCodeTimeoutWindows?.addEventListener('blur', () => {
  inputPhoneCodeTimeoutWindows.value = String(
    normalizePhoneCodeTimeoutWindowsValue(
      inputPhoneCodeTimeoutWindows.value,
      DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneCodePollIntervalSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneCodePollIntervalSeconds?.addEventListener('blur', () => {
  inputPhoneCodePollIntervalSeconds.value = String(
    normalizePhoneCodePollIntervalSecondsValue(
      inputPhoneCodePollIntervalSeconds.value,
      DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});

inputPhoneCodePollMaxRounds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputPhoneCodePollMaxRounds?.addEventListener('blur', () => {
  inputPhoneCodePollMaxRounds.value = String(
    normalizePhoneCodePollMaxRoundsValue(
      inputPhoneCodePollMaxRounds.value,
      DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS
    )
  );
  saveSettings({ silent: true }).catch(() => { });
});
inputSignupPhoneVerificationSubmitResultMaxRounds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupPhoneVerificationSubmitResultMaxRounds?.addEventListener('blur', () => {
  syncSignupPhoneVerificationSubmitResultInputs();
  saveSettings({ silent: true }).catch(() => { });
});
inputSignupPhoneVerificationSubmitResultRoundWaitSeconds?.addEventListener('input', () => {
  markSettingsDirty(true);
  scheduleSettingsAutoSave();
});
inputSignupPhoneVerificationSubmitResultRoundWaitSeconds?.addEventListener('blur', () => {
  syncSignupPhoneVerificationSubmitResultInputs();
  saveSettings({ silent: true }).catch(() => { });
});
selectHeroSmsCountry?.addEventListener('change', () => {
  syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  updateHeroSmsPlatformDisplay();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

selectHeroSmsCountryFallback?.addEventListener('change', () => {
  syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: true,
  });
  updateHeroSmsPlatformDisplay();
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnHeroSmsCountryMenu?.addEventListener('click', (event) => {
  event.preventDefault();
  const nextOpen = btnHeroSmsCountryMenu.getAttribute('aria-expanded') !== 'true';
  setHeroSmsCountryMenuOpen(nextOpen);
});

btnHeroSmsCountryClear?.addEventListener('click', () => {
  if (!selectHeroSmsCountry) {
    return;
  }
  Array.from(selectHeroSmsCountry.options).forEach((option) => {
    option.selected = false;
  });
  heroSmsCountryMenuSearchKeyword = '';
  syncHeroSmsFallbackSelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  updateHeroSmsPlatformDisplay();
  setHeroSmsCountryMenuOpen(false);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  if (typeof showToast === 'function') {
    showToast('已清空国家优先级。', 'info', 1800);
  }
});

btnFiveSimCountryMenu?.addEventListener('click', (event) => {
  event.preventDefault();
  const nextOpen = btnFiveSimCountryMenu.getAttribute('aria-expanded') !== 'true';
  setFiveSimCountryMenuOpen(nextOpen);
});

btnFiveSimCountryClear?.addEventListener('click', () => {
  if (!selectFiveSimCountry) {
    return;
  }
  Array.from(selectFiveSimCountry.options).forEach((option) => {
    option.selected = false;
  });
  fiveSimCountryMenuSearchKeyword = '';
  syncFiveSimCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  setFiveSimCountryMenuOpen(false);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  if (typeof showToast === 'function') {
    showToast('已清空国家优先级。', 'info', 1800);
  }
});

btnNexSmsCountryMenu?.addEventListener('click', (event) => {
  event.preventDefault();
  const nextOpen = btnNexSmsCountryMenu.getAttribute('aria-expanded') !== 'true';
  setNexSmsCountryMenuOpen(nextOpen);
});

btnNexSmsCountryClear?.addEventListener('click', () => {
  if (!selectNexSmsCountry) {
    return;
  }
  Array.from(selectNexSmsCountry.options).forEach((option) => {
    option.selected = false;
  });
  nexSmsCountryMenuSearchKeyword = '';
  syncNexSmsCountrySelectionOrderFromSelect({
    enforceMax: true,
    ensureDefault: false,
    showLimitToast: false,
  });
  updateHeroSmsPlatformDisplay();
  setNexSmsCountryMenuOpen(false);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  if (typeof showToast === 'function') {
    showToast('已清空国家优先级。', 'info', 1800);
  }
});

btnPhoneSmsProviderOrderMenu?.addEventListener('click', (event) => {
  event.preventDefault();
  const nextOpen = btnPhoneSmsProviderOrderMenu.getAttribute('aria-expanded') !== 'true';
  setPhoneSmsProviderOrderMenuOpen(nextOpen);
});

selectPhoneSmsProviderOrder?.addEventListener('change', () => {
  const nextOrder = syncPhoneSmsProviderOrderFromSelect({
    ensureDefault: false,
    enforceMax: true,
    syncProvider: false,
    showLimitToast: true,
  });
  updatePhoneVerificationSettingsUI();
  updateHeroSmsPlatformDisplay();
  updatePhoneSmsProviderOrderSummary(nextOrder);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
});

btnPhoneSmsProviderOrderReset?.addEventListener('click', () => {
  const nextOrder = clearPhoneSmsProviderOrderSelection({
    syncProvider: false,
  });
  setPhoneSmsProviderOrderMenuOpen(false);
  updatePhoneVerificationSettingsUI();
  updateHeroSmsPlatformDisplay();
  updatePhoneSmsProviderOrderSummary(nextOrder);
  markSettingsDirty(true);
  saveSettings({ silent: true }).catch(() => { });
  if (typeof showToast === 'function') {
    showToast('已清空服务商顺序。', 'info', 1800);
  }
});

// ============================================================
// Listen for Background broadcasts
// ============================================================

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case 'REQUEST_CUSTOM_VERIFICATION_BYPASS_CONFIRMATION': {
      (async () => {
        const step = Number(message.payload?.step);
        const result = await openCustomVerificationConfirmDialog(step);
        sendResponse(result || { confirmed: false, addPhoneDetected: false });
      })().catch((err) => {
        sendResponse({ error: err.message });
      });
      return true;
    }

    case 'REQUEST_GOPAY_OTP_INPUT': {
      (async () => {
        const result = await openGoPayOtpInputDialog(message.payload || {});
        sendResponse(result || { cancelled: true, code: '' });
      })().catch((err) => {
        sendResponse({ error: err.message });
      });
      return true;
    }

    case 'SECURITY_BLOCKED_ALERT': {
      openConfirmModal({
        title: message.payload?.title || '流程已完全停止',
        message: message.payload?.message || '检测到安全风控，当前流程已完全停止。',
        alert: message.payload?.alert || { text: '检测到 Cloudflare 风控，请暂停当前操作。', tone: 'danger' },
        confirmLabel: '我知道了',
        confirmVariant: 'btn-danger',
      }).catch(() => { });
      break;
    }

    case 'LOG_ENTRY':
      appendLog(message.payload);
      if (message.payload.level === 'error') {
        showToast(message.payload.message, 'error');
        scheduleAccountRunHistoryRefresh();
      }
      break;

    case 'NODE_STATUS_CHANGED': {
      const { nodeId, status } = message.payload;
      updateNodeUI(nodeId, status);
      chrome.runtime.sendMessage({ type: 'GET_STATE', source: 'sidepanel' }).then(state => {
        syncLatestState(state);
        syncAutoRunState(state);
        updateStatusDisplay(latestState);
        updateButtonStates();
        if (status === 'completed' || status === 'manual_completed' || status === 'skipped') {
          syncPasswordField(state);
          if (state.oauthUrl) {
            displayOauthUrl.textContent = state.oauthUrl;
            displayOauthUrl.classList.add('has-value');
          }
          if (state.localhostUrl) {
            displayLocalhostUrl.textContent = state.localhostUrl;
            displayLocalhostUrl.classList.add('has-value');
          }
        }
      }
      ).catch(() => { });
      break;
    }

    case 'AUTO_RUN_RESET': {
      // Full UI reset for next run
      syncLatestState({
        oauthUrl: null,
        localhostUrl: null,
        email: null,
        password: null,
        nodeStatuses: NODE_DEFAULT_STATUSES,
        logs: [],
        scheduledAutoRunAt: null,
        autoRunCountdownAt: null,
        autoRunCountdownTitle: '',
        autoRunCountdownNote: '',
      });
      displayOauthUrl.textContent = '等待中...';
      displayOauthUrl.classList.remove('has-value');
      displayLocalhostUrl.textContent = '等待中...';
      displayLocalhostUrl.classList.remove('has-value');
      inputEmail.value = '';
      if (typeof inputSignupPhone !== 'undefined' && inputSignupPhone) {
        inputSignupPhone.value = '';
      }
      syncLatestState({
        signupPhoneNumber: '',
        accountIdentifierType: null,
        accountIdentifier: '',
      });
      if (typeof syncSignupPhoneInputFromState === 'function') {
        syncSignupPhoneInputFromState(latestState);
      }
      displayStatus.textContent = '就绪';
      statusBar.className = 'status-bar';
      logArea.innerHTML = '';
      resetIcloudManager();
      resetLuckmailManager();
      resetCustomEmailPoolManager();
      document.querySelectorAll('.step-row').forEach(row => row.className = 'step-row');
      document.querySelectorAll('.step-status').forEach(el => el.textContent = '');
      syncAutoRunState({
        autoRunning: false,
        autoRunPhase: 'idle',
        autoRunCurrentRun: 0,
        autoRunTotalRuns: 1,
        autoRunAttemptRun: 0,
        scheduledAutoRunAt: null,
        autoRunCountdownAt: null,
        autoRunCountdownTitle: '',
        autoRunCountdownNote: '',
      });
      applyAutoRunStatus(currentAutoRun);
      updateProgressCounter();
      updateButtonStates();
      renderPayPalAccounts();
      renderHotmailAccounts();
      renderMail2925Accounts();
      if (isLuckmailProvider()) {
        queueLuckmailPurchaseRefresh();
      }
      break;
    }

    case 'DATA_UPDATED': {
      syncLatestState(message.payload);
      const activeSettingsEditor = typeof document !== 'undefined' ? document.activeElement : null;
      const shouldDeferDataUpdatedUiApply = settingsSaveInFlight
        && isEditableElementInSettingsCard(activeSettingsEditor);
      if (shouldDeferDataUpdatedUiApply) {
        // Avoid overwriting the focused editor while the current save request
        // is still in flight; otherwise typing can be interrupted by DATA_UPDATED.
        if (message.payload.operationDelayEnabled !== undefined && typeof applyOperationDelayState === 'function') {
          applyOperationDelayState(message.payload);
        }
        updateAccountRunHistorySettingsUI();
        renderContributionMode();
        void syncPlusManualConfirmationDialog();
        break;
      }
      if (message.payload.operationDelayEnabled !== undefined && typeof applyOperationDelayState === 'function') {
        applyOperationDelayState(message.payload);
      }
      if (message.payload.email !== undefined) {
        inputEmail.value = message.payload.email || '';
        queueCustomEmailPoolRefresh();
      }
      if (
        message.payload.signupPhoneNumber !== undefined
        || message.payload.accountIdentifierType !== undefined
        || message.payload.accountIdentifier !== undefined
      ) {
        if (typeof syncSignupPhoneInputFromState === 'function') {
          syncSignupPhoneInputFromState(latestState);
        }
      }
      if (
        message.payload.password !== undefined
        || message.payload.customPassword !== undefined
        || message.payload.accountContributionEnabled !== undefined
      ) {
        syncPasswordField(latestState || {});
      }
      if (message.payload.hostedCheckoutVerificationPopupDelaySeconds !== undefined && inputHostedCheckoutVerificationPopupDelaySeconds) {
        inputHostedCheckoutVerificationPopupDelaySeconds.value = String(
          normalizeHostedCheckoutVerificationPopupDelaySeconds(message.payload.hostedCheckoutVerificationPopupDelaySeconds)
        );
      }
      if (message.payload.hostedCheckoutSecurityChallengeEnabled !== undefined && inputHostedCheckoutSecurityChallengeEnabled) {
        inputHostedCheckoutSecurityChallengeEnabled.checked = Boolean(message.payload.hostedCheckoutSecurityChallengeEnabled);
      }
      if (message.payload.hostedCheckoutSmsSource !== undefined && selectHostedCheckoutSmsSource) {
        selectHostedCheckoutSmsSource.value = normalizeHostedCheckoutSmsSourceValue(message.payload.hostedCheckoutSmsSource);
        validateHostedCheckoutContactConfig();
        if (typeof updatePlusModeUI === 'function') {
          updatePlusModeUI();
        }
      }
      if (message.payload.paypalProfileCountryCode !== undefined && selectPayPalProfileCountryCode) {
        selectPayPalProfileCountryCode.value = normalizePayPalProfileCountryCodeValue(message.payload.paypalProfileCountryCode);
        renderPayPalProfile();
      }
      if (message.payload.hostedCheckoutSmsPoolAutoDisableEnabled !== undefined && inputHostedCheckoutSmsPoolAutoDisableEnabled) {
        inputHostedCheckoutSmsPoolAutoDisableEnabled.checked = Boolean(message.payload.hostedCheckoutSmsPoolAutoDisableEnabled);
      }
      if (message.payload.hostedCheckoutSmsPoolMaxUses !== undefined && inputHostedCheckoutSmsPoolMaxUses) {
        inputHostedCheckoutSmsPoolMaxUses.value = String(
          normalizeHostedCheckoutSmsPoolMaxUsesValue(message.payload.hostedCheckoutSmsPoolMaxUses, DEFAULT_HOSTED_CHECKOUT_SMS_POOL_MAX_USES)
        );
        queueHostedSmsPoolRefresh();
      }
      if (message.payload.hostedCheckoutFirstDirectResendEnabled !== undefined && inputHostedCheckoutFirstDirectResendEnabled) {
        inputHostedCheckoutFirstDirectResendEnabled.checked = Boolean(message.payload.hostedCheckoutFirstDirectResendEnabled);
      }
      if (message.payload.hostedCheckoutFirstResendWaitSeconds !== undefined && inputHostedCheckoutFirstResendWaitSeconds) {
        inputHostedCheckoutFirstResendWaitSeconds.value = String(
          normalizeHostedCheckoutResendWaitSecondsValue(message.payload.hostedCheckoutFirstResendWaitSeconds, 20)
        );
      }
      if (message.payload.hostedCheckoutSubsequentResendWaitSeconds !== undefined && inputHostedCheckoutSubsequentResendWaitSeconds) {
        inputHostedCheckoutSubsequentResendWaitSeconds.value = String(
          normalizeHostedCheckoutResendWaitSecondsValue(message.payload.hostedCheckoutSubsequentResendWaitSeconds, 25)
        );
      }
      if (message.payload.hostedCheckoutVerificationPollAttempts !== undefined && inputHostedCheckoutVerificationPollAttempts) {
        inputHostedCheckoutVerificationPollAttempts.value = String(
          normalizeHostedCheckoutVerificationPollAttemptsValue(message.payload.hostedCheckoutVerificationPollAttempts, 6)
        );
      }
      if (message.payload.hostedCheckoutVerificationPollIntervalSeconds !== undefined && inputHostedCheckoutVerificationPollIntervalSeconds) {
        inputHostedCheckoutVerificationPollIntervalSeconds.value = String(
          normalizeHostedCheckoutVerificationPollIntervalSecondsValue(message.payload.hostedCheckoutVerificationPollIntervalSeconds, 5)
        );
      }
      if (message.payload.hostedCheckoutVerificationResendMaxAttempts !== undefined && inputHostedCheckoutVerificationResendMaxAttempts) {
        inputHostedCheckoutVerificationResendMaxAttempts.value = String(
          normalizeHostedCheckoutVerificationResendMaxAttemptsValue(message.payload.hostedCheckoutVerificationResendMaxAttempts, 1)
        );
      }
      if (message.payload.plusCheckoutCreatePreWaitSeconds !== undefined && inputPlusCheckoutCreatePreWaitSeconds) {
        inputPlusCheckoutCreatePreWaitSeconds.value = String(
          normalizePlusCheckoutCreatePreWaitSeconds(message.payload.plusCheckoutCreatePreWaitSeconds)
        );
      }
      if (message.payload.plusCheckoutOpenStableWaitSeconds !== undefined && inputPlusCheckoutOpenStableWaitSeconds) {
        inputPlusCheckoutOpenStableWaitSeconds.value = String(
          normalizePlusCheckoutOpenStableWaitSeconds(message.payload.plusCheckoutOpenStableWaitSeconds)
        );
      }
      if (message.payload.plusHostedCheckoutCardPreWaitSeconds !== undefined && inputPlusHostedCheckoutCardPreWaitSeconds) {
        inputPlusHostedCheckoutCardPreWaitSeconds.value = String(
          normalizePlusHostedCheckoutCardPreWaitSeconds(message.payload.plusHostedCheckoutCardPreWaitSeconds)
        );
      }
      if (message.payload.plusCheckoutVerificationFailureStrategy !== undefined && selectPlusCheckoutVerificationFailureStrategy) {
        selectPlusCheckoutVerificationFailureStrategy.value = normalizePlusCheckoutVerificationFailureStrategy(
          message.payload.plusCheckoutVerificationFailureStrategy
        );
      }
      if (message.payload.plusCheckAllowedRegions !== undefined && typeof syncPlusCheckAllowedRegionsControl === 'function') {
        syncPlusCheckAllowedRegionsControl(message.payload.plusCheckAllowedRegions);
      }
      if (message.payload.hostedCheckoutVerificationUrl !== undefined && inputHostedCheckoutVerificationUrl) {
        inputHostedCheckoutVerificationUrl.value = normalizeHostedCheckoutVerificationUrlValue(message.payload.hostedCheckoutVerificationUrl);
        setHostedCheckoutManualCodeDisplay('未获取');
        validateHostedCheckoutContactConfig();
      }
      if (message.payload.hostedCheckoutPhoneNumber !== undefined && inputHostedCheckoutPhone) {
        inputHostedCheckoutPhone.value = normalizeHostedCheckoutPhoneValue(message.payload.hostedCheckoutPhoneNumber);
        validateHostedCheckoutContactConfig();
      }
      if (message.payload.plusCheckoutRegionalCheckoutEnabled !== undefined && typeof inputPlusCheckoutRegionalCheckoutEnabled !== 'undefined' && inputPlusCheckoutRegionalCheckoutEnabled) {
        inputPlusCheckoutRegionalCheckoutEnabled.checked = Boolean(message.payload.plusCheckoutRegionalCheckoutEnabled);
      }
      if (message.payload.hostedCheckoutSmsPoolText !== undefined && inputHostedCheckoutSmsPool) {
        inputHostedCheckoutSmsPool.value = normalizeHostedCheckoutSmsPoolTextValue(message.payload.hostedCheckoutSmsPoolText);
        queueHostedSmsPoolRefresh();
        validateHostedCheckoutContactConfig();
      }
      if (message.payload.hostedCheckoutSmsPoolUsage !== undefined || message.payload.hostedCheckoutCurrentSmsEntry !== undefined) {
        queueHostedSmsPoolRefresh();
      }
      if (message.payload.localCpaStep9Mode !== undefined) {
        setLocalCpaStep9Mode(message.payload.localCpaStep9Mode);
      }
      if (
        message.payload.panelMode !== undefined
        || message.payload.activeFlowId !== undefined
        || message.payload.flowId !== undefined
        || message.payload.kiroTargetId !== undefined
      ) {
        if (typeof syncFlowSelectorsFromState === 'function') {
          syncFlowSelectorsFromState(latestState);
        } else if (message.payload.panelMode !== undefined) {
          selectPanelMode.value = normalizePanelMode(message.payload.panelMode || 'cpa');
        }
        updatePanelModeUI();
      }
      if (
        message.payload.sub2apiGroupName !== undefined
        || message.payload.sub2apiGroupNames !== undefined
      ) {
        renderSub2ApiGroupOptions(latestState, latestState?.sub2apiGroupName || '');
      }
      if (
        message.payload.ipProxyEnabled !== undefined
        || message.payload.ipProxyService !== undefined
        || message.payload.ipProxyServiceProfiles !== undefined
        || message.payload.ipProxyMode !== undefined
        || message.payload.ipProxyApiUrl !== undefined
        || message.payload.ipProxyAccountList !== undefined
        || message.payload.ipProxyAccountSessionPrefix !== undefined
        || message.payload.ipProxyAccountLifeMinutes !== undefined
        || message.payload.ipProxyPoolTargetCount !== undefined
        || message.payload.ipProxySwitchIpRoundCount !== undefined
        || message.payload.ipProxyAutoRefreshPoolOnExhausted !== undefined
        || message.payload.ipProxyApiCount !== undefined
        || message.payload.ipProxyApiRegion !== undefined
        || message.payload.ipProxyApiZone !== undefined
        || message.payload.ipProxyApiPtype !== undefined
        || message.payload.ipProxyApiHost !== undefined
        || message.payload.ipProxyApiProto !== undefined
        || message.payload.ipProxyApiStype !== undefined
        || message.payload.ipProxyApiSplit !== undefined
        || message.payload.ipProxyApiSessType !== undefined
        || message.payload.ipProxyApiSessTime !== undefined
        || message.payload.ipProxyApiSessAuto !== undefined
        || message.payload.ipProxyApiRefreshKey !== undefined
        || message.payload.ipProxyApiRouteMode !== undefined
        || message.payload.ipProxyHost !== undefined
        || message.payload.ipProxyPort !== undefined
        || message.payload.ipProxyProtocol !== undefined
        || message.payload.ipProxyUsername !== undefined
        || message.payload.ipProxyPassword !== undefined
        || message.payload.ipProxyRegion !== undefined
        || message.payload.ipProxyApiPool !== undefined
        || message.payload.ipProxyApiCurrentIndex !== undefined
        || message.payload.ipProxyApiCurrent !== undefined
        || message.payload.ipProxyAccountPool !== undefined
        || message.payload.ipProxyAccountCurrentIndex !== undefined
        || message.payload.ipProxyAccountCurrent !== undefined
        || message.payload.ipProxyCurrent !== undefined
        || message.payload.ipProxyCurrentIndex !== undefined
        || message.payload.ipProxyPool !== undefined
        || message.payload.ipProxyApplied !== undefined
        || message.payload.ipProxyAppliedReason !== undefined
        || message.payload.ipProxyAppliedHost !== undefined
        || message.payload.ipProxyAppliedPort !== undefined
        || message.payload.ipProxyAppliedRegion !== undefined
        || message.payload.ipProxyAppliedHasAuth !== undefined
        || message.payload.ipProxyAppliedWarning !== undefined
        || message.payload.ipProxyAppliedExitIp !== undefined
        || message.payload.ipProxyAppliedExitRegion !== undefined
        || message.payload.ipProxyAppliedExitDetecting !== undefined
        || message.payload.ipProxyAppliedExitError !== undefined
        || message.payload.ipProxyAppliedExitSource !== undefined
        || message.payload.ipProxyAutoSyncEnabled !== undefined
        || message.payload.ipProxyAutoSyncIntervalMinutes !== undefined
      ) {
        const hasIpProxyConfigPayload = (
          message.payload.ipProxyService !== undefined
          || message.payload.ipProxyServiceProfiles !== undefined
          || message.payload.ipProxyMode !== undefined
          || message.payload.ipProxyApiUrl !== undefined
          || message.payload.ipProxyApiCount !== undefined
          || message.payload.ipProxyApiRegion !== undefined
          || message.payload.ipProxyApiZone !== undefined
          || message.payload.ipProxyApiPtype !== undefined
          || message.payload.ipProxyApiHost !== undefined
          || message.payload.ipProxyApiProto !== undefined
          || message.payload.ipProxyApiStype !== undefined
          || message.payload.ipProxyApiSplit !== undefined
          || message.payload.ipProxyApiSessType !== undefined
          || message.payload.ipProxyApiSessTime !== undefined
          || message.payload.ipProxyApiSessAuto !== undefined
          || message.payload.ipProxyApiRefreshKey !== undefined
          || message.payload.ipProxyApiRouteMode !== undefined
          || message.payload.ipProxyAccountList !== undefined
          || message.payload.ipProxyAccountSessionPrefix !== undefined
          || message.payload.ipProxyAccountLifeMinutes !== undefined
          || message.payload.ipProxyPoolTargetCount !== undefined
          || message.payload.ipProxySwitchIpRoundCount !== undefined
          || message.payload.ipProxyAutoRefreshPoolOnExhausted !== undefined
          || message.payload.ipProxyHost !== undefined
          || message.payload.ipProxyPort !== undefined
          || message.payload.ipProxyProtocol !== undefined
          || message.payload.ipProxyUsername !== undefined
          || message.payload.ipProxyPassword !== undefined
          || message.payload.ipProxyRegion !== undefined
        );
        const selectedProxyService = normalizeIpProxyService(
          message.payload.ipProxyService !== undefined
            ? message.payload.ipProxyService
            : latestState?.ipProxyService
        );
        const mergedProxyState = {
          ...(latestState || {}),
          ...message.payload,
          ipProxyService: selectedProxyService,
        };
        let normalizedProxyProfiles = (mergedProxyState?.ipProxyServiceProfiles || {});
        if (typeof normalizeIpProxyServiceProfiles === 'function') {
          normalizedProxyProfiles = normalizeIpProxyServiceProfiles(
            mergedProxyState?.ipProxyServiceProfiles || {},
            mergedProxyState
          );
        }
        if (typeof buildIpProxyServiceProfileFromFlatState === 'function') {
          normalizedProxyProfiles[selectedProxyService] = buildIpProxyServiceProfileFromFlatState(mergedProxyState);
        }
        if (selectIpProxyService) {
          selectIpProxyService.value = selectedProxyService;
        }
        if (message.payload.ipProxyEnabled !== undefined) {
          setIpProxyEnabled(Boolean(message.payload.ipProxyEnabled));
        }
        if (message.payload.ipProxyAutoRefreshPoolOnExhausted !== undefined && inputIpProxyAutoRefreshPoolOnExhausted) {
          inputIpProxyAutoRefreshPoolOnExhausted.checked = Boolean(message.payload.ipProxyAutoRefreshPoolOnExhausted);
        }
        if (message.payload.ipProxyAutoSyncEnabled !== undefined && inputIpProxyAutoSyncEnabled) {
          inputIpProxyAutoSyncEnabled.checked = Boolean(message.payload.ipProxyAutoSyncEnabled);
        }
        if (message.payload.ipProxyAutoSyncIntervalMinutes !== undefined && inputIpProxyAutoSyncIntervalMinutes) {
          const numeric = Number.parseInt(String(message.payload.ipProxyAutoSyncIntervalMinutes ?? '').trim(), 10);
          inputIpProxyAutoSyncIntervalMinutes.value = String(
            Number.isFinite(numeric) ? Math.max(1, Math.min(1440, numeric)) : 15
          );
        }
        if (message.payload.ipProxyApiUrl !== undefined && inputIpProxyApiUrl) {
          inputIpProxyApiUrl.value = String(message.payload.ipProxyApiUrl || '').trim();
        }
        if (hasIpProxyConfigPayload) {
          const activeProxyProfile = typeof getIpProxyServiceProfile === 'function'
            ? getIpProxyServiceProfile(selectedProxyService, {
              ...mergedProxyState,
              ipProxyServiceProfiles: normalizedProxyProfiles,
            })
            : {
              mode: typeof normalizeIpProxyModeForCurrentRelease === 'function'
                ? normalizeIpProxyModeForCurrentRelease(mergedProxyState?.ipProxyMode)
                : normalizeIpProxyMode(mergedProxyState?.ipProxyMode),
              apiUrl: String(mergedProxyState?.ipProxyApiUrl || '').trim(),
              accountList: normalizeIpProxyAccountList(mergedProxyState?.ipProxyAccountList || ''),
              accountSessionPrefix: normalizeIpProxyAccountSessionPrefix(mergedProxyState?.ipProxyAccountSessionPrefix || ''),
              accountLifeMinutes: normalizeIpProxyAccountLifeMinutes(mergedProxyState?.ipProxyAccountLifeMinutes || ''),
              poolTargetCount: normalizeIpProxyPoolTargetCount(mergedProxyState?.ipProxyPoolTargetCount || '', 20),
              switchIpRoundCount: typeof normalizeIpProxySwitchIpRoundCount === 'function'
                ? normalizeIpProxySwitchIpRoundCount(mergedProxyState?.ipProxySwitchIpRoundCount || '', 1)
                : normalizeIpProxyPoolTargetCount(mergedProxyState?.ipProxySwitchIpRoundCount || '', 1),
              autoRefreshPoolOnExhausted: Boolean(mergedProxyState?.ipProxyAutoRefreshPoolOnExhausted),
              host: String(mergedProxyState?.ipProxyHost || '').trim(),
              port: String(normalizeIpProxyPort(mergedProxyState?.ipProxyPort || '') || ''),
              protocol: normalizeIpProxyProtocol(mergedProxyState?.ipProxyProtocol),
              username: String(mergedProxyState?.ipProxyUsername || '').trim(),
              password: String(mergedProxyState?.ipProxyPassword || ''),
              region: String(mergedProxyState?.ipProxyRegion || '').trim(),
              apiRouteMode: String(mergedProxyState?.ipProxyApiRouteMode || 'direct').trim().toLowerCase() || 'direct',
            };
          if (typeof applyIpProxyServiceProfileToInputs === 'function') {
            applyIpProxyServiceProfileToInputs(activeProxyProfile);
          } else {
            setIpProxyMode(activeProxyProfile.mode);
            if (inputIpProxyApiUrl) inputIpProxyApiUrl.value = String(activeProxyProfile.apiUrl || '').trim();
            if (inputIpProxyAccountList) inputIpProxyAccountList.value = activeProxyProfile.accountList;
            if (inputIpProxyAccountSessionPrefix) inputIpProxyAccountSessionPrefix.value = activeProxyProfile.accountSessionPrefix;
            if (inputIpProxyAccountLifeMinutes) inputIpProxyAccountLifeMinutes.value = activeProxyProfile.accountLifeMinutes;
            if (inputIpProxyPoolTargetCount) inputIpProxyPoolTargetCount.value = activeProxyProfile.poolTargetCount;
            if (inputIpProxySwitchIpRoundCount) inputIpProxySwitchIpRoundCount.value = activeProxyProfile.switchIpRoundCount;
            if (inputIpProxyAutoRefreshPoolOnExhausted) inputIpProxyAutoRefreshPoolOnExhausted.checked = Boolean(activeProxyProfile.autoRefreshPoolOnExhausted);
            if (inputIpProxyHost) inputIpProxyHost.value = activeProxyProfile.host;
            if (inputIpProxyPort) inputIpProxyPort.value = activeProxyProfile.port;
            if (selectIpProxyApiRouteMode) selectIpProxyApiRouteMode.value = String(activeProxyProfile.apiRouteMode || 'direct').trim().toLowerCase() || 'direct';
            if (selectIpProxyProtocol) selectIpProxyProtocol.value = normalizeIpProxyProtocol(activeProxyProfile.protocol);
            if (inputIpProxyUsername) inputIpProxyUsername.value = activeProxyProfile.username;
            if (inputIpProxyPassword) inputIpProxyPassword.value = activeProxyProfile.password;
            if (inputIpProxyRegion) inputIpProxyRegion.value = activeProxyProfile.region;
          }
          syncLatestState({
            ipProxyService: selectedProxyService,
            ipProxyServiceProfiles: normalizedProxyProfiles,
            ...(typeof buildIpProxyStatePatchFromServiceProfile === 'function'
              ? buildIpProxyStatePatchFromServiceProfile(selectedProxyService, activeProxyProfile)
              : {}),
          });
        } else {
          syncLatestState({
            ipProxyService: selectedProxyService,
            ipProxyServiceProfiles: normalizedProxyProfiles,
          });
        }
        updateIpProxyUI(latestState);
      }
      if (message.payload.oauthUrl !== undefined) {
        displayOauthUrl.textContent = message.payload.oauthUrl || '等待中...';
        displayOauthUrl.classList.toggle('has-value', Boolean(message.payload.oauthUrl));
      }
      if (message.payload.localhostUrl !== undefined) {
        displayLocalhostUrl.textContent = message.payload.localhostUrl || '等待中...';
        displayLocalhostUrl.classList.toggle('has-value', Boolean(message.payload.localhostUrl));
      }
      if (message.payload.cloudflareTempEmailBaseUrl !== undefined) {
        inputTempEmailBaseUrl.value = message.payload.cloudflareTempEmailBaseUrl || '';
      }
      if (message.payload.cloudflareTempEmailAdminAuth !== undefined) {
        inputTempEmailAdminAuth.value = message.payload.cloudflareTempEmailAdminAuth || '';
      }
      if (message.payload.cloudflareTempEmailCustomAuth !== undefined) {
        inputTempEmailCustomAuth.value = message.payload.cloudflareTempEmailCustomAuth || '';
      }
      if (message.payload.cloudflareTempEmailLookupMode !== undefined) {
        setCloudflareTempEmailLookupMode(message.payload.cloudflareTempEmailLookupMode);
      }
      if (message.payload.cloudflareTempEmailReceiveMailbox !== undefined) {
        inputTempEmailReceiveMailbox.value = message.payload.cloudflareTempEmailReceiveMailbox || '';
      }
      if (message.payload.cloudflareTempEmailUseRandomSubdomain !== undefined && inputTempEmailUseRandomSubdomain) {
        inputTempEmailUseRandomSubdomain.checked = Boolean(message.payload.cloudflareTempEmailUseRandomSubdomain);
      }
      if (message.payload.cloudflareTempEmailDomain !== undefined || message.payload.cloudflareTempEmailDomains !== undefined) {
        renderCloudflareTempEmailDomainOptions(message.payload.cloudflareTempEmailDomain || latestState?.cloudflareTempEmailDomain || '');
      }
      if (
        message.payload.cloudflareTempEmailUseRandomSubdomain !== undefined
        || message.payload.cloudflareTempEmailLookupMode !== undefined
        || message.payload.cloudflareTempEmailDomain !== undefined
        || message.payload.cloudflareTempEmailDomains !== undefined
      ) {
        updateMailProviderUI();
      }
      if (message.payload.cloudMailBaseUrl !== undefined && inputCloudMailBaseUrl) {
        inputCloudMailBaseUrl.value = message.payload.cloudMailBaseUrl || '';
      }
      if (message.payload.cloudMailAdminEmail !== undefined && inputCloudMailAdminEmail) {
        inputCloudMailAdminEmail.value = message.payload.cloudMailAdminEmail || '';
      }
      if (message.payload.cloudMailAdminPassword !== undefined && inputCloudMailAdminPassword) {
        inputCloudMailAdminPassword.value = message.payload.cloudMailAdminPassword || '';
      }
      if (message.payload.cloudMailReceiveMailbox !== undefined && inputCloudMailReceiveMailbox) {
        inputCloudMailReceiveMailbox.value = message.payload.cloudMailReceiveMailbox || '';
      }
      if (message.payload.cloudMailDomain !== undefined && inputCloudMailDomain) {
        inputCloudMailDomain.value = message.payload.cloudMailDomain || '';
      }
      if (message.payload.plusModeEnabled !== undefined && inputPlusModeEnabled) {
        inputPlusModeEnabled.checked = Boolean(message.payload.plusModeEnabled);
      }
      if (message.payload.phonePlusModeEnabled !== undefined && inputPhonePlusModeEnabled) {
        inputPhonePlusModeEnabled.checked = Boolean(message.payload.phonePlusModeEnabled);
      }
      if (message.payload.plusPaymentMethod !== undefined && selectPlusPaymentMethod) {
        selectPlusPaymentMethod.value = normalizePlusPaymentMethod(message.payload.plusPaymentMethod);
      }
      if (message.payload.browserFingerprintEnabled !== undefined && inputBrowserFingerprintEnabled) {
        inputBrowserFingerprintEnabled.checked = Boolean(message.payload.browserFingerprintEnabled);
      }
      if (message.payload.browserFingerprintLevel !== undefined && selectBrowserFingerprintLevel) {
        selectBrowserFingerprintLevel.value = normalizeBrowserFingerprintLevel(message.payload.browserFingerprintLevel);
      }
      if (message.payload.browserFingerprintLanguage !== undefined && selectBrowserFingerprintLanguage) {
        selectBrowserFingerprintLanguage.value = normalizeBrowserFingerprintLanguage(message.payload.browserFingerprintLanguage);
      }
      if (
        message.payload.browserFingerprintEnabled !== undefined
        || message.payload.browserFingerprintLevel !== undefined
        || message.payload.browserFingerprintLanguage !== undefined
      ) {
        updateBrowserFingerprintUI(latestState);
      }
      if (message.payload.plusAccountAccessStrategy !== undefined && selectPlusAccountAccessStrategy) {
        currentPlusAccountAccessStrategy = normalizePlusAccountAccessStrategy(message.payload.plusAccountAccessStrategy);
        selectPlusAccountAccessStrategy.dataset.requestedValue = currentPlusAccountAccessStrategy;
        if (!selectPlusAccountAccessStrategy.disabled) {
          selectPlusAccountAccessStrategy.value = normalizePlusAccountAccessStrategyUiValue(currentPlusAccountAccessStrategy);
        }
      }
      if (message.payload.plusCheckoutCreatePreWaitSeconds !== undefined && inputPlusCheckoutCreatePreWaitSeconds) {
        inputPlusCheckoutCreatePreWaitSeconds.value = String(
          normalizePlusCheckoutCreatePreWaitSeconds(message.payload.plusCheckoutCreatePreWaitSeconds)
        );
      }
      if (message.payload.plusCheckoutOpenStableWaitSeconds !== undefined && inputPlusCheckoutOpenStableWaitSeconds) {
        inputPlusCheckoutOpenStableWaitSeconds.value = String(
          normalizePlusCheckoutOpenStableWaitSeconds(message.payload.plusCheckoutOpenStableWaitSeconds)
        );
      }
      if (message.payload.plusHostedCheckoutCardPreWaitSeconds !== undefined && inputPlusHostedCheckoutCardPreWaitSeconds) {
        inputPlusHostedCheckoutCardPreWaitSeconds.value = String(
          normalizePlusHostedCheckoutCardPreWaitSeconds(message.payload.plusHostedCheckoutCardPreWaitSeconds)
        );
      }
      if (message.payload.plusCheckoutVerificationFailureStrategy !== undefined && selectPlusCheckoutVerificationFailureStrategy) {
        selectPlusCheckoutVerificationFailureStrategy.value = normalizePlusCheckoutVerificationFailureStrategy(
          message.payload.plusCheckoutVerificationFailureStrategy
        );
      }
      if (message.payload.plusCheckAllowedRegions !== undefined && typeof syncPlusCheckAllowedRegionsControl === 'function') {
        syncPlusCheckAllowedRegionsControl(message.payload.plusCheckAllowedRegions);
      }
      if (message.payload.plusCheckoutConversionProxyUrl !== undefined && inputPlusCheckoutConversionProxy) {
        inputPlusCheckoutConversionProxy.value = normalizePlusCheckoutConversionProxyUrlValue(message.payload.plusCheckoutConversionProxyUrl);
        setPlusCheckoutConversionProxyTestResult('未测试');
      }
      if (message.payload.plusCheckoutConversionProxySource !== undefined) {
        syncPlusCheckoutConversionProxySourceControl(message.payload.plusCheckoutConversionProxySource);
      }
      if (message.payload.plusCheckoutConversionProxy711Region !== undefined && inputPlusCheckoutConversionProxy711Region) {
        inputPlusCheckoutConversionProxy711Region.value = normalizePlusCheckoutConversionProxy711RegionValue(message.payload.plusCheckoutConversionProxy711Region);
      }
      if (message.payload.plusCheckoutRegionalCheckoutEnabled !== undefined && typeof inputPlusCheckoutRegionalCheckoutEnabled !== 'undefined' && inputPlusCheckoutRegionalCheckoutEnabled) {
        inputPlusCheckoutRegionalCheckoutEnabled.checked = Boolean(message.payload.plusCheckoutRegionalCheckoutEnabled);
      }
      if (
        message.payload.plusCheckoutConversionProxyManualSession !== undefined
        || message.payload.plusCheckoutConversionProxyExitCheck !== undefined
        || message.payload.plusCheckoutConversionProxySource !== undefined
        || message.payload.plusCheckoutConversionProxyUrl !== undefined
        || message.payload.plusCheckoutConversionProxy711Region !== undefined
        || message.payload.plusCheckoutRegionalCheckoutEnabled !== undefined
      ) {
        updatePlusCheckoutConversionModeUi();
        renderPlusCheckoutConversionProxyExitCheck(latestState);
        renderPlusCheckoutConversionProxyRuntimeStatus(latestState);
      }
      if (message.payload.gopayHelperPhoneMode !== undefined && selectGpcHelperPhoneMode) {
        selectGpcHelperPhoneMode.value = normalizeGpcHelperPhoneModeValue(message.payload.gopayHelperPhoneMode);
      }
      if (message.payload.gopayHelperOtpChannel !== undefined && selectGpcHelperOtpChannel) {
        selectGpcHelperOtpChannel.value = normalizeGpcOtpChannelValue(message.payload.gopayHelperOtpChannel);
      }
      if (message.payload.gopayHelperLocalSmsHelperEnabled !== undefined && inputGpcHelperLocalSmsEnabled) {
        inputGpcHelperLocalSmsEnabled.checked = Boolean(message.payload.gopayHelperLocalSmsHelperEnabled);
      }
      if (message.payload.gopayHelperLocalSmsHelperUrl !== undefined && inputGpcHelperLocalSmsUrl) {
        inputGpcHelperLocalSmsUrl.value = normalizeGpcLocalSmsHelperBaseUrlValue(message.payload.gopayHelperLocalSmsHelperUrl);
      }
      if (message.payload.gopayHelperBalance !== undefined || message.payload.gopayHelperBalanceError !== undefined) {
        if (typeof displayGpcHelperBalance !== 'undefined' && displayGpcHelperBalance) {
          const balanceText = String(message.payload.gopayHelperBalance ?? latestState?.gopayHelperBalance ?? '').trim();
          const balanceError = String(message.payload.gopayHelperBalanceError ?? latestState?.gopayHelperBalanceError ?? '').trim();
          displayGpcHelperBalance.textContent = balanceError
            ? `余额查询失败：${balanceError}`
            : (balanceText || '余额已更新');
        }
      }
      if (
        message.payload.plusModeEnabled !== undefined
        || message.payload.phonePlusModeEnabled !== undefined
        || message.payload.plusPaymentMethod !== undefined
        || message.payload.plusAccountAccessStrategy !== undefined
        || message.payload.plusCheckoutVerificationFailureStrategy !== undefined
        || message.payload.plusCheckAllowedRegions !== undefined
        || message.payload.plusCheckoutCreatePreWaitSeconds !== undefined
        || message.payload.plusCheckoutOpenStableWaitSeconds !== undefined
        || message.payload.plusHostedCheckoutCardPreWaitSeconds !== undefined
        || message.payload.plusCheckoutConversionProxyUrl !== undefined
        || message.payload.paypalProfileCountryCode !== undefined
        || message.payload.gopayHelperPhoneMode !== undefined
        || message.payload.gopayHelperAutoModeEnabled !== undefined
        || message.payload.gopayHelperOtpChannel !== undefined
        || message.payload.gopayHelperLocalSmsHelperEnabled !== undefined
      ) {
        const stepDefinitionState = typeof resolveStepDefinitionCapabilityState === 'function'
          ? resolveStepDefinitionCapabilityState(latestState, {
            signupMethod: latestState?.signupMethod,
          })
          : {
            plusModeEnabled: Boolean(latestState?.plusModeEnabled) && !Boolean(latestState?.phonePlusModeEnabled),
            phonePlusModeEnabled: Boolean(latestState?.phonePlusModeEnabled),
            plusAccountAccessStrategy: normalizePlusAccountAccessStrategy(latestState?.plusAccountAccessStrategy || DEFAULT_PLUS_ACCOUNT_ACCESS_STRATEGY),
            signupMethod: normalizeSignupMethod(latestState?.signupMethod || DEFAULT_SIGNUP_METHOD),
          };
        syncStepDefinitionsForMode(
          stepDefinitionState.plusModeEnabled,
          {
            phonePlusModeEnabled: stepDefinitionState.phonePlusModeEnabled,
            render: true,
            plusPaymentMethod: latestState?.plusPaymentMethod,
            plusAccountAccessStrategy: stepDefinitionState.plusAccountAccessStrategy,
            signupMethod: stepDefinitionState.signupMethod,
          }
        );
        updatePlusModeUI();
        updateSignupMethodUI({ notify: true });
      }
      if (
        message.payload.plusManualConfirmationPending !== undefined
        || message.payload.plusManualConfirmationRequestId !== undefined
        || message.payload.plusManualConfirmationStep !== undefined
        || message.payload.plusManualConfirmationMethod !== undefined
        || message.payload.plusManualConfirmationTitle !== undefined
        || message.payload.plusManualConfirmationMessage !== undefined
      ) {
        void syncPlusManualConfirmationDialog();
      }
      if (message.payload.currentHotmailAccountId !== undefined || message.payload.hotmailAccounts !== undefined) {
        renderHotmailAccounts();
        if (selectMailProvider.value === 'hotmail-api') {
          inputEmail.value = getCurrentHotmailEmail();
        }
      }
      if (message.payload.currentPayPalAccountId !== undefined || message.payload.paypalAccounts !== undefined) {
        renderPayPalAccounts();
        renderPayPalProfile();
      }
      if (
        message.payload.paypalGeneratedProfile !== undefined
        || message.payload.plusHostedCheckoutGuestProfile !== undefined
        || message.payload.hostedCheckoutGuestProfile !== undefined
      ) {
        renderPayPalProfile();
      }
      if (message.payload.currentMail2925AccountId !== undefined || message.payload.mail2925Accounts !== undefined) {
        renderMail2925Accounts();
        if (selectMailProvider.value === '2925') {
          setManagedAliasBaseEmailInputForProvider('2925', latestState);
        }
      }
      if (message.payload.customEmailPoolEntries !== undefined || message.payload.customEmailPool !== undefined) {
        setCustomEmailPoolEntriesState(restoreCustomEmailPoolEntriesFromState({
          ...latestState,
          ...message.payload,
        }));
        syncRunCountFromConfiguredEmailPool();
        queueCustomEmailPoolRefresh();
      }
      if (message.payload.luckmailApiKey !== undefined) {
        inputLuckmailApiKey.value = message.payload.luckmailApiKey || '';
      }
      if (message.payload.luckmailBaseUrl !== undefined) {
        inputLuckmailBaseUrl.value = normalizeLuckmailBaseUrl(message.payload.luckmailBaseUrl);
      }
      if (message.payload.luckmailEmailType !== undefined) {
        selectLuckmailEmailType.value = normalizeLuckmailEmailType(message.payload.luckmailEmailType);
      }
      if (message.payload.luckmailDomain !== undefined) {
        inputLuckmailDomain.value = message.payload.luckmailDomain || '';
      }
      if (message.payload.luckmailUsedPurchases !== undefined && isLuckmailProvider()) {
        queueLuckmailPurchaseRefresh();
      }
      if (message.payload.currentLuckmailPurchase !== undefined && isLuckmailProvider()) {
        inputEmail.value = getCurrentLuckmailEmail();
        queueLuckmailPurchaseRefresh();
      }
      if (message.payload.autoDeleteUsedIcloudAlias !== undefined && checkboxAutoDeleteIcloud) {
        checkboxAutoDeleteIcloud.checked = Boolean(message.payload.autoDeleteUsedIcloudAlias);
      }
      if (message.payload.accountRunHistoryHelperBaseUrl !== undefined && inputAccountRunHistoryHelperBaseUrl) {
        inputAccountRunHistoryHelperBaseUrl.value = normalizeAccountRunHistoryHelperBaseUrlValue(message.payload.accountRunHistoryHelperBaseUrl);
        updateAccountRunHistorySettingsUI();
      }
      if (message.payload.icloudHostPreference !== undefined && selectIcloudHostPreference) {
        const hostPreference = String(message.payload.icloudHostPreference || '').trim().toLowerCase();
        selectIcloudHostPreference.value = hostPreference === 'icloud.com'
          ? 'icloud.com'
          : (hostPreference === 'icloud.com.cn' ? 'icloud.com.cn' : 'auto');
        updateMailProviderUI();
      }
      if (message.payload.icloudTargetMailboxType !== undefined && selectIcloudTargetMailboxType) {
        selectIcloudTargetMailboxType.value = normalizeIcloudTargetMailboxType(message.payload.icloudTargetMailboxType);
        updateMailProviderUI();
      }
      if (message.payload.icloudForwardMailProvider !== undefined && selectIcloudForwardMailProvider) {
        selectIcloudForwardMailProvider.value = normalizeIcloudForwardMailProvider(message.payload.icloudForwardMailProvider);
        updateMailProviderUI();
      }
      if (message.payload.icloudFetchMode !== undefined && selectIcloudFetchMode) {
        selectIcloudFetchMode.value = normalizeIcloudFetchMode(message.payload.icloudFetchMode);
      }
      if (message.payload.autoRunSkipFailures !== undefined) {
        inputAutoSkipFailures.checked = Boolean(message.payload.autoRunSkipFailures);
        updateFallbackThreadIntervalInputState();
      }
      if (
        message.payload.autoRunRetryPaypalCallback !== undefined
        && typeof inputAutoRunRetryPaypalCallback !== 'undefined'
        && inputAutoRunRetryPaypalCallback
      ) {
        inputAutoRunRetryPaypalCallback.checked = Boolean(message.payload.autoRunRetryPaypalCallback);
      }
      if (
        message.payload.autoRunPreserveIssueLogsOnRestart !== undefined
        && typeof inputAutoRunPreserveIssueLogsOnRestart !== 'undefined'
        && inputAutoRunPreserveIssueLogsOnRestart
      ) {
        inputAutoRunPreserveIssueLogsOnRestart.checked = Boolean(message.payload.autoRunPreserveIssueLogsOnRestart);
      }
      if (message.payload.autoRunDelayEnabled !== undefined) {
        inputAutoDelayEnabled.checked = Boolean(message.payload.autoRunDelayEnabled);
        updateAutoDelayInputState();
      }
      if (
        message.payload.step6CookieCleanupEnabled !== undefined
        && typeof inputStep6CookieCleanupEnabled !== 'undefined'
        && inputStep6CookieCleanupEnabled
      ) {
        inputStep6CookieCleanupEnabled.checked = Boolean(message.payload.step6CookieCleanupEnabled);
      }
      if (message.payload.stepExecutionRangeByFlow !== undefined) {
        applyStepExecutionRangeState({
          ...(latestState || {}),
          stepExecutionRangeByFlow: message.payload.stepExecutionRangeByFlow,
        });
        renderStepStatuses(latestState);
        updateButtonStates();
      }
      if (message.payload.autoRunDelayMinutes !== undefined) {
        inputAutoDelayMinutes.value = String(normalizeAutoDelayMinutes(message.payload.autoRunDelayMinutes));
      }
      if (message.payload.autoRunFallbackThreadIntervalMinutes !== undefined) {
        inputAutoSkipFailuresThreadIntervalMinutes.value = String(
          normalizeAutoRunThreadIntervalMinutes(message.payload.autoRunFallbackThreadIntervalMinutes)
        );
        updateFallbackThreadIntervalInputState();
      }
      if (message.payload.autoStepDelaySeconds !== undefined) {
        inputAutoStepDelaySeconds.value = formatAutoStepDelayInputValue(message.payload.autoStepDelaySeconds);
      }
      if (message.payload.registrationStageWaitSeconds !== undefined && typeof inputRegistrationStageWaitSeconds !== 'undefined' && inputRegistrationStageWaitSeconds) {
        inputRegistrationStageWaitSeconds.value = formatRegistrationStageWaitInputValue(message.payload.registrationStageWaitSeconds);
      }
      if (
        message.payload.signupIdentityRedirectTimeoutSeconds !== undefined
        && typeof inputSignupIdentityRedirectTimeoutSeconds !== 'undefined'
        && inputSignupIdentityRedirectTimeoutSeconds
      ) {
        inputSignupIdentityRedirectTimeoutSeconds.value = formatSignupIdentityRedirectTimeoutInputValue(
          message.payload.signupIdentityRedirectTimeoutSeconds
        );
      }
      if (
        message.payload.authContentScriptRecoveryTimeoutSeconds !== undefined
        && typeof inputAuthContentScriptRecoveryTimeoutSeconds !== 'undefined'
        && inputAuthContentScriptRecoveryTimeoutSeconds
      ) {
        inputAuthContentScriptRecoveryTimeoutSeconds.value = formatAuthContentScriptRecoveryTimeoutInputValue(
          message.payload.authContentScriptRecoveryTimeoutSeconds
        );
      }
      if (
        message.payload.signupVerificationReadyTimeoutSeconds !== undefined
        && typeof inputSignupVerificationReadyTimeoutSeconds !== 'undefined'
        && inputSignupVerificationReadyTimeoutSeconds
      ) {
        inputSignupVerificationReadyTimeoutSeconds.value = formatSignupVerificationReadyTimeoutInputValue(
          message.payload.signupVerificationReadyTimeoutSeconds
        );
      }
      if (
        message.payload.signupVerificationReadyMaxRounds !== undefined
        && typeof inputSignupVerificationReadyMaxRounds !== 'undefined'
        && inputSignupVerificationReadyMaxRounds
      ) {
        inputSignupVerificationReadyMaxRounds.value = formatSignupVerificationReadyMaxRoundsInputValue(
          message.payload.signupVerificationReadyMaxRounds
        );
      }
      if (
        message.payload.signupVerificationReadyRoundWaitSeconds !== undefined
        && typeof inputSignupVerificationReadyRoundWaitSeconds !== 'undefined'
        && inputSignupVerificationReadyRoundWaitSeconds
      ) {
        inputSignupVerificationReadyRoundWaitSeconds.value = formatSignupVerificationReadyRoundWaitInputValue(
          message.payload.signupVerificationReadyRoundWaitSeconds
        );
      }
      if (
        message.payload.step5ProfileSubmitResultMaxRounds !== undefined
        && typeof inputStep5ProfileSubmitResultMaxRounds !== 'undefined'
        && inputStep5ProfileSubmitResultMaxRounds
      ) {
        inputStep5ProfileSubmitResultMaxRounds.value = formatStep5ProfileSubmitResultMaxRoundsInputValue(
          message.payload.step5ProfileSubmitResultMaxRounds
        );
      }
      if (
        message.payload.step5ProfileSubmitResultRoundWaitSeconds !== undefined
        && typeof inputStep5ProfileSubmitResultRoundWaitSeconds !== 'undefined'
        && inputStep5ProfileSubmitResultRoundWaitSeconds
      ) {
        inputStep5ProfileSubmitResultRoundWaitSeconds.value = formatStep5ProfileSubmitResultRoundWaitInputValue(
          message.payload.step5ProfileSubmitResultRoundWaitSeconds
        );
      }
      if (message.payload.oauthFlowTimeoutEnabled !== undefined && typeof inputOAuthFlowTimeoutEnabled !== 'undefined' && inputOAuthFlowTimeoutEnabled) {
        inputOAuthFlowTimeoutEnabled.checked = Boolean(message.payload.oauthFlowTimeoutEnabled);
      }
      if (message.payload.oauthOpenAfterRefreshWaitSeconds !== undefined && typeof inputOAuthOpenAfterRefreshWaitSeconds !== 'undefined' && inputOAuthOpenAfterRefreshWaitSeconds) {
        inputOAuthOpenAfterRefreshWaitSeconds.value = String(
          normalizeOAuthOpenAfterRefreshWaitSeconds(message.payload.oauthOpenAfterRefreshWaitSeconds)
        );
      }
      if (
        (
          message.payload.verificationResendCount !== undefined
          || message.payload.signupVerificationResendCount !== undefined
          || message.payload.loginVerificationResendCount !== undefined
        )
        && inputVerificationResendCount
      ) {
        const nextVerificationResendCount = message.payload.verificationResendCount !== undefined
          ? message.payload.verificationResendCount
          : (message.payload.signupVerificationResendCount ?? message.payload.loginVerificationResendCount);
        inputVerificationResendCount.value = String(
          normalizeVerificationResendCount(
            nextVerificationResendCount,
            DEFAULT_VERIFICATION_RESEND_COUNT
          )
        );
      }
      if (message.payload.phoneSmsProvider !== undefined && selectPhoneSmsProvider) {
        setPhoneSmsProviderSelectValue(message.payload.phoneSmsProvider);
      }
      if ((message.payload.heroSmsApiKey !== undefined || message.payload.fiveSimApiKey !== undefined) && inputHeroSmsApiKey) {
        inputHeroSmsApiKey.value = getSelectedPhoneSmsProvider() === PHONE_SMS_PROVIDER_FIVE_SIM
          ? (message.payload.fiveSimApiKey !== undefined ? message.payload.fiveSimApiKey || '' : latestState?.fiveSimApiKey || '')
          : (message.payload.heroSmsApiKey !== undefined ? message.payload.heroSmsApiKey || '' : latestState?.heroSmsApiKey || '');
      }
      if (message.payload.fiveSimApiKey !== undefined && inputFiveSimApiKey) {
        inputFiveSimApiKey.value = String(message.payload.fiveSimApiKey || '').trim();
      }
      if (message.payload.nexSmsApiKey !== undefined && inputNexSmsApiKey) {
        inputNexSmsApiKey.value = String(message.payload.nexSmsApiKey || '').trim();
      }
      if (message.payload.fiveSimCountryOrder !== undefined && typeof applyFiveSimCountrySelection === 'function') {
        applyFiveSimCountrySelection(
          Array.isArray(message.payload.fiveSimCountryOrder) ? message.payload.fiveSimCountryOrder : []
        );
      }
      if (message.payload.nexSmsCountryOrder !== undefined && typeof applyNexSmsCountrySelection === 'function') {
        applyNexSmsCountrySelection(
          Array.isArray(message.payload.nexSmsCountryOrder) ? message.payload.nexSmsCountryOrder : []
        );
      }
      if (message.payload.fiveSimOperator !== undefined && inputFiveSimOperator) {
        inputFiveSimOperator.value = normalizeFiveSimOperatorValue(message.payload.fiveSimOperator);
      }
      if (message.payload.fiveSimProduct !== undefined && inputFiveSimProduct) {
        inputFiveSimProduct.value = normalizeFiveSimProductValue(message.payload.fiveSimProduct);
      }
      if (message.payload.nexSmsServiceCode !== undefined && inputNexSmsServiceCode) {
        inputNexSmsServiceCode.value = normalizeNexSmsServiceCodeValue(message.payload.nexSmsServiceCode);
      }
      if (
        (message.payload.phoneSmsReuseEnabled !== undefined
          || message.payload.heroSmsReuseEnabled !== undefined)
        && inputHeroSmsReuseEnabled
      ) {
        inputHeroSmsReuseEnabled.checked = normalizeHeroSmsReuseEnabledValue(
          message.payload.phoneSmsReuseEnabled,
          message.payload.heroSmsReuseEnabled
        );
        updatePhoneVerificationSettingsUI();
      }
      if (message.payload.freePhoneReuseEnabled !== undefined && inputFreePhoneReuseEnabled) {
        inputFreePhoneReuseEnabled.checked = Boolean(message.payload.freePhoneReuseEnabled);
        updatePhoneVerificationSettingsUI();
      }
      if (message.payload.freePhoneReuseAutoEnabled !== undefined && inputFreePhoneReuseAutoEnabled) {
        inputFreePhoneReuseAutoEnabled.checked = Boolean(message.payload.freePhoneReuseAutoEnabled);
        updatePhoneVerificationSettingsUI();
      }
      if (message.payload.heroSmsAcquirePriority !== undefined && selectHeroSmsAcquirePriority) {
        selectHeroSmsAcquirePriority.value = normalizeHeroSmsAcquirePriority(message.payload.heroSmsAcquirePriority);
      }
      if ((message.payload.heroSmsMaxPrice !== undefined || message.payload.fiveSimMaxPrice !== undefined) && inputHeroSmsMaxPrice) {
        inputHeroSmsMaxPrice.value = getSelectedPhoneSmsProvider() === PHONE_SMS_PROVIDER_FIVE_SIM
          ? normalizePhoneSmsMaxPriceValue(message.payload.fiveSimMaxPrice !== undefined ? message.payload.fiveSimMaxPrice : latestState?.fiveSimMaxPrice, PHONE_SMS_PROVIDER_FIVE_SIM)
          : normalizePhoneSmsMaxPriceValue(message.payload.heroSmsMaxPrice !== undefined ? message.payload.heroSmsMaxPrice : latestState?.heroSmsMaxPrice, getSelectedPhoneSmsProvider());
      }
      if ((message.payload.heroSmsMinPrice !== undefined || message.payload.fiveSimMinPrice !== undefined) && typeof inputHeroSmsMinPrice !== 'undefined' && inputHeroSmsMinPrice) {
        inputHeroSmsMinPrice.value = getSelectedPhoneSmsProvider() === PHONE_SMS_PROVIDER_FIVE_SIM
          ? normalizePhoneSmsMinPriceValue(message.payload.fiveSimMinPrice !== undefined ? message.payload.fiveSimMinPrice : latestState?.fiveSimMinPrice, PHONE_SMS_PROVIDER_FIVE_SIM)
          : normalizePhoneSmsMinPriceValue(message.payload.heroSmsMinPrice !== undefined ? message.payload.heroSmsMinPrice : latestState?.heroSmsMinPrice, getSelectedPhoneSmsProvider());
      }
      if (message.payload.fiveSimOperator !== undefined && inputFiveSimOperator) {
        inputFiveSimOperator.value = normalizeFiveSimOperator(message.payload.fiveSimOperator);
      }
      if (message.payload.heroSmsPreferredPrice !== undefined && typeof inputHeroSmsPreferredPrice !== 'undefined' && inputHeroSmsPreferredPrice) {
        inputHeroSmsPreferredPrice.value = normalizeHeroSmsMaxPriceValue(message.payload.heroSmsPreferredPrice);
      }
      if (message.payload.phoneVerificationReplacementLimit !== undefined && typeof inputPhoneReplacementLimit !== 'undefined' && inputPhoneReplacementLimit) {
        inputPhoneReplacementLimit.value = String(
          normalizePhoneVerificationReplacementLimit(
            message.payload.phoneVerificationReplacementLimit,
            DEFAULT_PHONE_VERIFICATION_REPLACEMENT_LIMIT
          )
        );
      }
      if (message.payload.phoneActivationRetryRounds !== undefined && typeof inputPhoneActivationRetryRounds !== 'undefined' && inputPhoneActivationRetryRounds) {
        inputPhoneActivationRetryRounds.value = String(
          normalizePhoneActivationRetryRoundsValue(
            message.payload.phoneActivationRetryRounds,
            DEFAULT_PHONE_ACTIVATION_RETRY_ROUNDS
          )
        );
      }
      if (message.payload.phoneActivationTierUpgradeLimit !== undefined && typeof inputPhoneActivationTierUpgradeLimit !== 'undefined' && inputPhoneActivationTierUpgradeLimit) {
        inputPhoneActivationTierUpgradeLimit.value = String(
          normalizePhoneActivationTierUpgradeLimit(
            message.payload.phoneActivationTierUpgradeLimit,
            DEFAULT_PHONE_ACTIVATION_TIER_UPGRADE_LIMIT
          )
        );
      }
      if (message.payload.phoneCodeWaitSeconds !== undefined && inputPhoneCodeWaitSeconds) {
        inputPhoneCodeWaitSeconds.value = String(
          normalizePhoneCodeWaitSecondsValue(message.payload.phoneCodeWaitSeconds, DEFAULT_PHONE_CODE_WAIT_SECONDS)
        );
      }
      if (message.payload.phoneCodeTimeoutWindows !== undefined && inputPhoneCodeTimeoutWindows) {
        inputPhoneCodeTimeoutWindows.value = String(
          normalizePhoneCodeTimeoutWindowsValue(message.payload.phoneCodeTimeoutWindows, DEFAULT_PHONE_CODE_TIMEOUT_WINDOWS)
        );
      }
      if (message.payload.phoneCodePollIntervalSeconds !== undefined && inputPhoneCodePollIntervalSeconds) {
        inputPhoneCodePollIntervalSeconds.value = String(
          normalizePhoneCodePollIntervalSecondsValue(
            message.payload.phoneCodePollIntervalSeconds,
            DEFAULT_PHONE_CODE_POLL_INTERVAL_SECONDS
          )
        );
      }
      if (message.payload.phoneCodePollMaxRounds !== undefined && inputPhoneCodePollMaxRounds) {
        inputPhoneCodePollMaxRounds.value = String(
          normalizePhoneCodePollMaxRoundsValue(message.payload.phoneCodePollMaxRounds, DEFAULT_PHONE_CODE_POLL_MAX_ROUNDS)
        );
      }
      if (message.payload.signupPhoneVerificationSubmitResultMaxRounds !== undefined && inputSignupPhoneVerificationSubmitResultMaxRounds) {
        inputSignupPhoneVerificationSubmitResultMaxRounds.value = formatSignupPhoneVerificationSubmitResultMaxRoundsInputValue(
          message.payload.signupPhoneVerificationSubmitResultMaxRounds
        );
      }
      if (message.payload.signupPhoneVerificationSubmitResultRoundWaitSeconds !== undefined && inputSignupPhoneVerificationSubmitResultRoundWaitSeconds) {
        inputSignupPhoneVerificationSubmitResultRoundWaitSeconds.value = formatSignupPhoneVerificationSubmitResultRoundWaitInputValue(
          message.payload.signupPhoneVerificationSubmitResultRoundWaitSeconds
        );
      }
      if (
        message.payload.phoneSmsProvider !== undefined
        || message.payload.phoneSmsProviderOrder !== undefined
      ) {
        const nextOrder = applyPhoneSmsProviderOrderSelection(
          message.payload.phoneSmsProviderOrder !== undefined
            ? message.payload.phoneSmsProviderOrder
            : (Array.isArray(latestState?.phoneSmsProviderOrder)
              ? latestState.phoneSmsProviderOrder
              : []),
          { ensureDefault: false, syncProvider: false }
        );
        if (selectPhoneSmsProvider) {
          selectPhoneSmsProvider.value = normalizePhoneSmsProviderValue(
            message.payload.phoneSmsProvider !== undefined
              ? message.payload.phoneSmsProvider
              : latestState?.phoneSmsProvider
          );
        }
        updatePhoneSmsProviderOrderSummary(nextOrder);
        updatePhoneVerificationSettingsUI();
      }
      if (message.payload.phoneVerificationEnabled !== undefined && inputPhoneVerificationEnabled) {
        inputPhoneVerificationEnabled.checked = Boolean(message.payload.phoneVerificationEnabled);
      }
      if (message.payload.signupMethod !== undefined) {
        setSignupMethod(message.payload.signupMethod);
      }
      if (message.payload.phoneSignupPhonePrefixedEmailEnabled !== undefined && inputPhoneSignupPhonePrefixedEmail) {
        inputPhoneSignupPhonePrefixedEmail.checked = Boolean(message.payload.phoneSignupPhonePrefixedEmailEnabled);
      }
      if (
        message.payload.phoneVerificationEnabled !== undefined
        || message.payload.phonePlusModeEnabled !== undefined
        || message.payload.signupMethod !== undefined
        || message.payload.phoneSignupPhonePrefixedEmailEnabled !== undefined
      ) {
        updatePhoneVerificationSettingsUI();
      }
      const activePhoneSmsProvider = normalizePhoneSmsProviderValue(
        message.payload.phoneSmsProvider !== undefined
          ? message.payload.phoneSmsProvider
          : latestState?.phoneSmsProvider
      );
      if (activePhoneSmsProvider === PHONE_SMS_PROVIDER_FIVE_SIM) {
        if (
          message.payload.fiveSimCountryOrder !== undefined
          || message.payload.phoneSmsProvider !== undefined
          || message.payload.phoneSmsProviderOrder !== undefined
        ) {
          applyFiveSimCountrySelection(
            message.payload.fiveSimCountryOrder !== undefined
              ? message.payload.fiveSimCountryOrder
              : (Array.isArray(latestState?.fiveSimCountryOrder) ? latestState.fiveSimCountryOrder : [])
          );
        }
      } else if (activePhoneSmsProvider === PHONE_SMS_PROVIDER_NEXSMS) {
        if (
          message.payload.nexSmsCountryOrder !== undefined
          || message.payload.phoneSmsProvider !== undefined
          || message.payload.phoneSmsProviderOrder !== undefined
        ) {
          applyNexSmsCountrySelection(
            message.payload.nexSmsCountryOrder !== undefined
              ? message.payload.nexSmsCountryOrder
              : (Array.isArray(latestState?.nexSmsCountryOrder) ? latestState.nexSmsCountryOrder : [])
          );
        }
      } else if (
        message.payload.heroSmsCountryId !== undefined
        || message.payload.heroSmsCountryLabel !== undefined
        || message.payload.heroSmsCountryFallback !== undefined
        || message.payload.heroSmsOperatorByCountry !== undefined
        || message.payload.fiveSimCountryId !== undefined
        || message.payload.fiveSimCountryLabel !== undefined
        || message.payload.fiveSimCountryFallback !== undefined
        || message.payload.fiveSimCountryOrder !== undefined
      ) {
        const activeProvider = getSelectedPhoneSmsProvider();
        const nextPrimary = activeProvider === PHONE_SMS_PROVIDER_FIVE_SIM
          ? {
            id: normalizeFiveSimCountryId(
              message.payload.fiveSimCountryId !== undefined
                ? message.payload.fiveSimCountryId
                : latestState?.fiveSimCountryId
            ),
            label: normalizeFiveSimCountryLabel(
              message.payload.fiveSimCountryLabel !== undefined
                ? message.payload.fiveSimCountryLabel
                : latestState?.fiveSimCountryLabel
            ),
          }
          : {
            id: normalizeHeroSmsCountryId(
              message.payload.heroSmsCountryId !== undefined
                ? message.payload.heroSmsCountryId
                : latestState?.heroSmsCountryId
            ),
            label: normalizeHeroSmsCountryLabel(
              message.payload.heroSmsCountryLabel !== undefined
                ? message.payload.heroSmsCountryLabel
                : latestState?.heroSmsCountryLabel
            ),
          };
        const nextFallback = activeProvider === PHONE_SMS_PROVIDER_FIVE_SIM
          ? normalizeFiveSimCountryFallbackList(
            message.payload.fiveSimCountryFallback !== undefined
              ? message.payload.fiveSimCountryFallback
              : message.payload.fiveSimCountryOrder !== undefined
                ? message.payload.fiveSimCountryOrder
              : latestState?.fiveSimCountryFallback
          )
          : normalizeHeroSmsCountryFallbackList(
            message.payload.heroSmsCountryFallback !== undefined
              ? message.payload.heroSmsCountryFallback
              : latestState?.heroSmsCountryFallback
          );
        applyHeroSmsFallbackSelection(
          [nextPrimary, ...nextFallback],
          { includePrimary: true }
        );
        if (message.payload.heroSmsOperatorByCountry !== undefined && typeof syncHeroSmsOperatorSelectionState === 'function') {
          syncHeroSmsOperatorSelectionState(message.payload.heroSmsOperatorByCountry);
        }
        updateHeroSmsPlatformDisplay();
      }
      if (
        message.payload.currentPhoneActivation !== undefined
        || message.payload.reusablePhoneActivation !== undefined
        || message.payload.phoneReusableActivationPool !== undefined
        || message.payload.phonePreferredActivation !== undefined
        || message.payload.currentPhoneVerificationCode !== undefined
        || message.payload.currentPhoneVerificationCountdownEndsAt !== undefined
        || message.payload.currentPhoneVerificationCountdownWindowIndex !== undefined
        || message.payload.currentPhoneVerificationCountdownWindowTotal !== undefined
        || message.payload.freeReusablePhoneActivation !== undefined
        || message.payload.failedSignupPhoneReuseActivation !== undefined
        || message.payload.heroSmsLastPriceTiers !== undefined
        || message.payload.heroSmsLastPriceCountryId !== undefined
        || message.payload.heroSmsLastPriceCountryLabel !== undefined
        || message.payload.heroSmsLastPriceUserLimit !== undefined
        || message.payload.phoneSmsProvider !== undefined
        || message.payload.phoneSmsProviderOrder !== undefined
      ) {
        updateHeroSmsRuntimeDisplay({
          ...latestState,
          ...message.payload,
        });
      }
      updateAccountRunHistorySettingsUI();
      renderContributionMode();
      void syncPlusManualConfirmationDialog();
      break;
    }

    case 'ICLOUD_LOGIN_REQUIRED': {
      const loginMessage = '需要登录 iCloud，我已经为你打开登录页。';
      showToast(loginMessage, 'warn', 5000);
      if (icloudSummary) {
        icloudSummary.textContent = loginMessage;
      }
      showIcloudLoginHelp(message.payload || {});
      break;
    }

    case 'ICLOUD_ALIASES_CHANGED': {
      queueIcloudAliasRefresh();
      break;
    }

    case 'AUTO_RUN_STATUS': {
      syncLatestState({
        autoRunning: ['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(message.payload.phase),
        autoRunPhase: message.payload.phase,
        autoRunCurrentRun: message.payload.currentRun,
        autoRunTotalRuns: message.payload.totalRuns,
        autoRunAttemptRun: message.payload.attemptRun,
        scheduledAutoRunAt: message.payload.scheduledAt ?? null,
        autoRunCountdownAt: message.payload.countdownAt ?? null,
        autoRunCountdownTitle: message.payload.countdownTitle ?? '',
        autoRunCountdownNote: message.payload.countdownNote ?? '',
      });
      applyAutoRunStatus(message.payload);
      updateStatusDisplay(latestState);
      updateButtonStates();
      if (!['scheduled', 'running', 'waiting_step', 'waiting_email', 'retrying', 'waiting_interval'].includes(message.payload.phase)) {
        scheduleAccountRunHistoryRefresh();
      }
      break;
    }
  }
});

// ============================================================
// Theme Toggle
// ============================================================

const btnTheme = document.getElementById('btn-theme');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('multipage-theme', theme);
}

function initTheme() {
  const saved = localStorage.getItem('multipage-theme');
  if (saved) {
    setTheme(saved);
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

document.addEventListener('click', (event) => {
  const clickedInsideConfigMenu = Boolean(configMenuShell?.contains(event.target));
  const clickedInsideCountryMenu = Boolean(heroSmsCountryMenuShell?.contains(event.target));
  const clickedInsideFiveSimCountryMenu = Boolean(fiveSimCountryMenuShell?.contains(event.target));
  const clickedInsideNexSmsCountryMenu = Boolean(nexSmsCountryMenuShell?.contains(event.target));
  const clickedInsideProviderOrderMenu = Boolean(phoneSmsProviderOrderMenuShell?.contains(event.target));
  const clickedInsideEditableListPicker = isClickInsideEditableListPicker(event.target);

  if (configMenuOpen && !clickedInsideConfigMenu) {
    closeConfigMenu();
  }

  const countryMenuOpen = btnHeroSmsCountryMenu?.getAttribute('aria-expanded') === 'true';
  if (countryMenuOpen && !clickedInsideCountryMenu) {
    setHeroSmsCountryMenuOpen(false);
  }
  const fiveSimCountryMenuOpen = btnFiveSimCountryMenu?.getAttribute('aria-expanded') === 'true';
  if (fiveSimCountryMenuOpen && !clickedInsideFiveSimCountryMenu) {
    setFiveSimCountryMenuOpen(false);
  }
  const nexSmsCountryMenuOpen = btnNexSmsCountryMenu?.getAttribute('aria-expanded') === 'true';
  if (nexSmsCountryMenuOpen && !clickedInsideNexSmsCountryMenu) {
    setNexSmsCountryMenuOpen(false);
  }
  const providerOrderMenuOpen = btnPhoneSmsProviderOrderMenu?.getAttribute('aria-expanded') === 'true';
  if (providerOrderMenuOpen && !clickedInsideProviderOrderMenu) {
    setPhoneSmsProviderOrderMenuOpen(false);
  }
  if (!clickedInsideEditableListPicker) {
    closeEditableListPickers();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape') {
    return;
  }
  if (configMenuOpen) {
    closeConfigMenu();
  }
  if (btnHeroSmsCountryMenu?.getAttribute('aria-expanded') === 'true') {
    setHeroSmsCountryMenuOpen(false);
  }
  if (btnFiveSimCountryMenu?.getAttribute('aria-expanded') === 'true') {
    setFiveSimCountryMenuOpen(false);
  }
  if (btnNexSmsCountryMenu?.getAttribute('aria-expanded') === 'true') {
    setNexSmsCountryMenuOpen(false);
  }
  if (btnPhoneSmsProviderOrderMenu?.getAttribute('aria-expanded') === 'true') {
    setPhoneSmsProviderOrderMenuOpen(false);
  }
  closeEditableListPickers();
});

window.addEventListener('resize', () => {
  positionContributionUpdateHint();
  scheduleAutoRunAdScrollSync();
});

document.addEventListener('scroll', () => {
  positionContributionUpdateHint();
}, true);

// ============================================================
// Init
// ============================================================

initializeManualStepActions();
initTheme();
initHotmailListExpandedState();
initMail2925ListExpandedState();
if (typeof initIpProxySectionExpandedState === 'function') {
  initIpProxySectionExpandedState();
}
if (typeof initPhoneVerificationSectionExpandedState === 'function') {
  initPhoneVerificationSectionExpandedState();
}
applyPhoneSmsProviderOrderSelection([], { ensureDefault: false, syncProvider: false });
updateSaveButtonState();
updateConfigMenuControls();
setLocalCpaStep9Mode(DEFAULT_LOCAL_CPA_STEP9_MODE);
setMail2925Mode(DEFAULT_MAIL_2925_MODE);
setCloudflareTempEmailLookupMode(DEFAULT_CLOUDFLARE_TEMP_EMAIL_LOOKUP_MODE);
initializeReleaseInfo().catch((err) => {
  console.error('Failed to initialize release info:', err);
});
Promise.allSettled([
  loadHeroSmsCountries({ silent: true, preferFallbackOnly: true }),
  loadFiveSimCountries({ silent: true, preferFallbackOnly: true }),
  loadNexSmsCountries(),
]).then((results) => {
  const heroResult = results[0];
  const fiveSimResult = results[1];
  const nexSmsResult = results[2];
  if (heroResult?.status === 'rejected') {
    console.debug('HeroSMS country list startup fallback skipped:', heroResult.reason);
  }
  if (fiveSimResult?.status === 'rejected') {
    console.debug('5sim country list startup fallback skipped:', fiveSimResult.reason);
  }
  if (nexSmsResult?.status === 'rejected') {
    console.debug('NexSMS country list startup fallback skipped:', nexSmsResult.reason);
  }
  return restoreState().then(() => {
    syncPasswordToggleLabel();
    syncVpsUrlToggleLabel();
    syncVpsPasswordToggleLabel();
    syncIpProxyApiUrlToggleLabel();
    syncIpProxyUsernameToggleLabel();
    syncIpProxyPasswordToggleLabel();
    syncHeroSmsApiKeyToggleLabel();
    syncPasswordVisibilityToggles();
    syncHeroSmsApiKeyToggleLabel();
    updatePanelModeUI();
    updateButtonStates();
    updateStatusDisplay(latestState);
    return refreshContributionContentHint()
      .catch((error) => {
        console.warn('Failed to refresh contribution content hint during initialization:', error);
        return null;
      })
      .then(() => maybeShowNewUserGuidePrompt());
  }).catch((err) => {
    console.error('Failed to initialize sidepanel state:', err);
  });
});

updateHostedSmsPoolCollapseUI(false);
