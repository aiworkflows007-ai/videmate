import React from 'react';
import { ArrowLeft } from 'lucide-react';

interface LegalLayoutProps {
  title: string;
  updated: string;
  onBack: () => void;
  children: React.ReactNode;
}

export function LegalLayout({ title, updated, onBack, children }: LegalLayoutProps) {
  return (
    <article className="max-w-3xl mx-auto animate-fade-in pb-16">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-secondary mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </button>
      <header className="mb-10">
        <h1 className="font-display text-3xl md:text-4xl font-black text-white mb-2">{title}</h1>
        <p className="text-sm text-on-surface-variant">Last updated: {updated}</p>
      </header>
      <div className="prose-legal space-y-6 text-on-surface-variant text-sm leading-relaxed">{children}</div>
    </article>
  );
}
