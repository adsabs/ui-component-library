interface SentryFeedbackPayload {
  formName: string;
  subject: string;
  name: string;
  email: string;
  data: Record<string, unknown>;
}

/**
 * Sends structured feedback data to Sentry before the recaptcha/API
 * submission attempt, so user data is captured even when recaptcha is
 * blocked or the submission fails.
 *
 * Fire-and-forget — never throws, never blocks the form flow.
 */
export const sendFeedbackToSentry = (payload: SentryFeedbackPayload): void => {
  try {
    const { formName, subject, name, email, data } = payload;

    const whenReady =
      typeof (window as any).whenSentryReady === 'function'
        ? (window as any).whenSentryReady()
        : typeof (window as any).Sentry !== 'undefined'
          ? Promise.resolve((window as any).Sentry)
          : null;

    if (!whenReady) {
      return;
    }

    const sentryPayload = {
      message: `${subject} feedback from ${name || 'anonymous'}`,
      source: 'specific-feedback-form',
      url: window.location.href,
      tags: {
        feedback_type: formName,
        source: 'specific-feedback-form',
      },
      ...(name ? { name } : {}),
      ...(email ? { email } : {}),
    };

    const captureContext = {
      tags: {
        feedback_type: formName,
        source: 'specific-feedback-form',
      },
      extra: {
        userAgent: navigator.userAgent,
        formData: data,
      },
    };

    whenReady
      .then((sentry: any) => {
        if (!sentry) {
          return;
        }

        if (typeof sentry.captureFeedback === 'function') {
          try {
            sentry.captureFeedback(sentryPayload, { captureContext });
          } catch (_) {}
        } else if (typeof sentry.sendFeedback === 'function') {
          try {
            const result = sentry.sendFeedback(sentryPayload, {
              captureContext,
            });
            if (result && typeof result.catch === 'function') {
              result.catch(() => {});
            }
          } catch (_) {}
        }
      })
      .catch(() => {});
  } catch (_) {
    // fire-and-forget
  }
};
