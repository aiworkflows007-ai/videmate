import React from 'react';
import { LegalLayout } from './LegalLayout';
import { SITE_NAME } from '../../config/site';

interface TermsPageProps {
  onBack: () => void;
}

export function TermsPage({ onBack }: TermsPageProps) {
  return (
    <LegalLayout title="Terms of Service" updated="June 4, 2026" onBack={onBack}>
      <p>
        By using {SITE_NAME}, you agree to these terms. If you do not agree, do not use the service.
      </p>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Acceptable use</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Download only content you have the right to access (your own videos, Creative Commons, or with permission).</li>
          <li>Do not use this tool to infringe copyright, trademarks, or platform terms of service.</li>
          <li>Do not abuse the service with automated scraping, malware, or illegal content.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Disclaimer</h2>
        <p>
          {SITE_NAME} is provided &quot;as is&quot; without warranties. We are not responsible for how you use
          downloaded files. Platform logos and names are trademarks of their respective owners; we are not
          affiliated with YouTube, Meta, TikTok, or other platforms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Limitation of liability</h2>
        <p>
          We are not liable for indirect, incidental, or consequential damages arising from use of the
          service, including data loss or account action by third-party platforms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-bold text-white mb-2">Changes</h2>
        <p>We may update these terms. Continued use after changes means you accept the updated terms.</p>
      </section>
    </LegalLayout>
  );
}
