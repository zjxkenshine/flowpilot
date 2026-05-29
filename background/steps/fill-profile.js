(function attachBackgroundStep5(root, factory) {
  root.MultiPageBackgroundStep5 = factory();
})(typeof self !== 'undefined' ? self : globalThis, function createBackgroundStep5Module() {
  function createStep5Executor(deps = {}) {
    const {
      addLog,
      generateRandomBirthday,
      generateRandomName,
      getStep5ProfileSubmitResultConfigForState = null,
      resolveSignupMethod = () => 'email',
      sendToContentScript,
    } = deps;

    function resolveStep5SignupContext(state = {}) {
      const signupMethod = String(resolveSignupMethod(state) || state?.resolvedSignupMethod || state?.signupMethod || '')
        .trim()
        .toLowerCase() === 'phone'
        ? 'phone'
        : 'email';
      const rawAccountIdentifierType = String(state?.accountIdentifierType || '').trim().toLowerCase();
      const phoneNumber = String(
        state?.signupPhoneNumber
        || (rawAccountIdentifierType === 'phone' ? state?.accountIdentifier : '')
        || ''
      ).trim();
      const accountIdentifierType = signupMethod === 'phone' || rawAccountIdentifierType === 'phone' || phoneNumber
        ? 'phone'
        : 'email';

      return {
        signupMethod,
        accountIdentifierType,
        phoneNumber,
      };
    }

    async function executeStep5(state = {}) {
      const { firstName, lastName } = generateRandomName();
      const { year, month, day } = generateRandomBirthday();
      const signupContext = resolveStep5SignupContext(state);
      const submitResultConfig = typeof getStep5ProfileSubmitResultConfigForState === 'function'
        ? getStep5ProfileSubmitResultConfigForState(state)
        : null;
      const submitResultMaxRounds = Math.min(60, Math.max(1, Math.floor(Number(submitResultConfig?.maxRounds) || 12)));
      const submitResultRoundWaitSeconds = Math.min(120, Math.max(1, Math.floor(Number(submitResultConfig?.roundWaitSeconds) || 10)));

      await addLog(`步骤 5：已生成姓名 ${firstName} ${lastName}，生日 ${year}-${month}-${day}`);

      await sendToContentScript('signup-page', {
        type: 'EXECUTE_NODE',
        nodeId: 'fill-profile',
        step: 5,
        source: 'background',
        payload: {
          ...signupContext,
          firstName,
          lastName,
          year,
          month,
          day,
          step5ProfileSubmitResultMaxRounds: submitResultMaxRounds,
          step5ProfileSubmitResultRoundWaitSeconds: submitResultRoundWaitSeconds,
        },
      });
    }

    return { executeStep5 };
  }

  return { createStep5Executor };
});
