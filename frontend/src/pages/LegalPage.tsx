import { Link } from 'react-router-dom';
import privacyPolicy from '../content/legal/privacy.md?raw';
import termsOfService from '../content/legal/termsOfService.md?raw';
import credits from '../content/legal/credits.md?raw';

const legalDocuments = {
  privacy: {
    label: 'Privacy Policy',
    content: privacyPolicy,
  },
  terms: {
    label: 'Terms of Service',
    content: termsOfService,
  },
  credits: {
    label: 'Credits',
    content: credits,
  },
};

type LegalDocumentKey = keyof typeof legalDocuments;

type LegalPageProps = {
  documentKey: LegalDocumentKey;
};

const renderBlock = (block: string, index: number) => {
  const trimmed = block.trim();

  if (!trimmed) {
    return null;
  }

  if (index === 0) {
    return (
      <h1
        key={`${index}-${trimmed}`}
        className="font-bebas text-5xl uppercase tracking-[0.12em] text-[#f0ead0] md:text-7xl"
      >
        {trimmed}
      </h1>
    );
  }

  if (/^\d+\.\s/.test(trimmed)) {
    return (
      <h2
        key={`${index}-${trimmed}`}
        className="pt-8 text-xl font-semibold text-[#f0ead0]"
      >
        {trimmed}
      </h2>
    );
  }

  if (trimmed.split('\n').every((line) => line.startsWith('- '))) {
    return (
      <ul
        key={`${index}-${trimmed}`}
        className="list-disc space-y-2 pl-6 text-sm leading-7 text-[#d8d1b8] md:text-base"
      >
        {trimmed.split('\n').map((line) => (
          <li key={line}>{line.slice(2)}</li>
        ))}
      </ul>
    );
  }

  return (
    <p
      key={`${index}-${trimmed}`}
      className="whitespace-pre-line text-sm leading-7 text-[#d8d1b8] md:text-base"
    >
      {trimmed}
    </p>
  );
};

export default function LegalPage({ documentKey }: LegalPageProps) {
  const document = legalDocuments[documentKey];
  const blocks = document.content.trim().split(/\n{2,}/);

  return (
    <section className="min-h-[calc(100vh-73px)] bg-[#0c0c0b] px-6 py-12 text-[#f0ead0]">
      <article className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-[#f0ead0]/10 pb-6">
          <Link
            to="/home"
            className="text-xs uppercase tracking-[0.16em] text-[#c8c2a8] transition hover:text-[#f0ead0]"
          >
            Back to site
          </Link>
          <span className="text-xs uppercase tracking-[0.16em] text-[#8f8870]">
            {document.label}
          </span>
        </div>

        <div className="space-y-5">{blocks.map(renderBlock)}</div>
      </article>
    </section>
  );
}
