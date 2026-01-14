import React from 'react';
import { LegalPage } from '../components/LegalPage';
import termsMarkdown from '../content/terms-of-service.md?raw';

const TermsOfServicePage: React.FC = () => {
  return (
    <LegalPage
      title="Terms of Service"
      markdownContent={termsMarkdown}
      lastUpdated="January 11, 2026"
    />
  );
};

export default TermsOfServicePage;
