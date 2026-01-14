import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { BackToHomeButton } from './BackToHomeButton';
import { Printer, ChevronRight, MessageSquare, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router-dom';

interface LegalPageProps {
  title: string;
  markdownContent: string;
  lastUpdated: string;
  isPrivacyPolicy?: boolean;
}

export const LegalPage: React.FC<LegalPageProps> = ({
  title,
  markdownContent,
  lastUpdated,
  isPrivacyPolicy,
}) => {
  const [toc, setToc] = useState<{ id: string; text: string }[]>([]);
  const [isTocOpen, setIsTocOpen] = useState(false);

  useEffect(() => {
    // Basic TOC generation from H2 headings
    const h2Regex = /^## (.*$)/gim;
    const matches = Array.from(markdownContent.matchAll(h2Regex));
    const items = matches.map((match) => ({
      text: match[1],
      id: match[1].toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-'),
    }));
    setToc(items);
  }, [markdownContent]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 animate-fade-in">
      {/* Header Area */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-200 pb-8">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">{title}</h1>
          <div className="flex items-center gap-4 text-slate-500 text-sm">
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </Button>
          <BackToHomeButton />
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-12">
        {/* Table of Contents - Sidebar */}
        <nav className="hidden lg:block sticky top-24 self-start">
          <h2 className="font-bold text-slate-900 mb-4 uppercase tracking-wider text-xs">On this page</h2>
          <ul className="space-y-3">
            {toc.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-sm text-slate-600 hover:text-teal-600 transition-colors flex items-center gap-2 group"
                >
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile TOC */}
        <div className="lg:hidden mb-8">
          <button
            onClick={() => setIsTocOpen(!isTocOpen)}
            className="w-full flex items-center justify-between p-4 bg-slate-100 rounded-lg font-semibold text-slate-800"
          >
            <span>Table of Contents</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isTocOpen ? 'rotate-180' : ''}`} />
          </button>
          {isTocOpen && (
            <ul className="mt-2 p-4 bg-white border border-slate-100 rounded-lg shadow-sm space-y-3">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setIsTocOpen(false)}
                    className="text-sm text-slate-600 block py-1"
                  >
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* content */}
        <article className="prose prose-slate lg:prose-lg prose-teal max-w-none prose-headings:scroll-mt-24">
          <ReactMarkdown
            components={{
              h2: ({ node, ...props }) => {
                const id = String(props.children)
                  .toLowerCase()
                  .replace(/[^\w\s]/g, '')
                  .replace(/\s+/g, '-');
                return <h2 id={id} {...props} />;
              },
            }}
          >
            {markdownContent}
          </ReactMarkdown>

          {isPrivacyPolicy && (
            <div className="mt-16 p-6 bg-teal-50 border border-teal-100 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-teal-100 rounded-full text-teal-600">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-teal-900 m-0">Questions about privacy?</h3>
                  <p className="text-teal-700 mt-1 m-0 text-sm">We're here to help you understand how we protect your data.</p>
                </div>
              </div>
              <Link to="/contact-us">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white whitespace-nowrap">
                  Contact Us
                </Button>
              </Link>
            </div>
          )}
        </article>
      </div>

      {/* Mobile Sticky Back Button */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm">
        <BackToHomeButton className="w-full shadow-xl h-14 text-lg" />
      </div>
    </div>
  );
};
