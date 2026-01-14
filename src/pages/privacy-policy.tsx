import React from 'react';
import { LegalPage } from '../components/LegalPage';
import privacyPolicyMarkdown from '../content/privacy-policy.md?raw';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      markdownContent={privacyPolicyMarkdown}
      lastUpdated="January 11, 2026"
      isPrivacyPolicy={true}
    />
  );
};

export default PrivacyPolicyPage;
