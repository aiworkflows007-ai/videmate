import React from 'react';
import { LegalLayout } from './LegalLayout';
import { SITE_NAME, SITE_URL } from '../../config/site';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const contact = SITE_URL ? `${SITE_URL}/` : 'this website';

  return (
    <LegalLayout title="Privacy Policy" updated="June 4, 2026" onBack={onBack}>
      <p>
        {SITE_NAME} (&quot;we&quot;, &quot;our&quot;) respects your privacy. This policy explains what
        information we collect when you use {contact} and how we use it.
      </p>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Information we collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong className="text-on-surface">Usage data:</strong> We may use analytics tools (e.g.
            Google Analytics) to understand page views, device type, and general traffic — not to identify
            you personally.
          </li>
          <li>
            <strong className="text-on-surface">URLs you paste:</strong> Links are processed in your browser
            or on our servers only to perform downloads you request. We do not sell your URLs to third
            parties.
          </li>
          <li>
            <strong className="text-on-surface">Cookies:</strong> We and our partners use cookies for site
            functionality, preferences, and advertising.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Google AdSense</h2>
        <p>
          We use Google AdSense to display ads. Google and its partners may use cookies (including the
          DoubleClick cookie) to serve ads based on your visits to this and other sites. You can opt out of
          personalized advertising by visiting{' '}
          <a
            href="https://www.google.com/settings/ads"
            className="text-secondary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google Ads Settings
          </a>{' '}
          or{' '}
          <a
            href="https://optout.aboutads.info/"
            className="text-secondary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            aboutads.info
          </a>
          .
        </p>
        <p className="mt-2">
          Third-party vendors, including Google, use cookies to serve ads. See how Google uses data at{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            className="text-secondary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Google partner sites policy
          </a>
          .
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Your choices</h2>
        <p>
          You can block cookies in your browser settings. Blocking cookies may limit some features. Local
          downloads stay on your device unless you delete them.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Children</h2>
        <p>This service is not directed at children under 13. We do not knowingly collect data from children.</p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
        <p>
          Questions about this policy? Contact us through the support link on the site
          {SITE_URL ? ` or visit ${SITE_URL}` : ''}.
        </p>
      </section>
    </LegalLayout>
  );
}
