import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LegalPage } from '../components/LegalPage';
import { BrowserRouter } from 'react-router-dom';

const mockMarkdown = `
# Test Title
## Section 1
Content of section 1.
## Section 2
Content of section 2.
`;

const renderLegalPage = (props = {}) => {
  return render(
    <BrowserRouter>
      <LegalPage
        title="Privacy Policy"
        markdownContent={mockMarkdown}
        lastUpdated="January 11, 2026"
        {...props}
      />
    </BrowserRouter>
  );
};

describe('LegalPage', () => {
  it('renders title and last updated date', () => {
    renderLegalPage();
    expect(screen.getByText('Privacy Policy')).toBeDefined();
    expect(screen.getByText(/Last Updated: January 11, 2026/i)).toBeDefined();
  });

  it('renders table of contents from H2 headings', () => {
    renderLegalPage();
    expect(screen.getByText('Section 1')).toBeDefined();
    expect(screen.getByText('Section 2')).toBeDefined();
  });

  it('renders markdown content', () => {
    renderLegalPage();
    expect(screen.getByText('Content of section 1.')).toBeDefined();
    expect(screen.getByText('Content of section 2.')).toBeDefined();
  });

  it('shows contact CTA when isPrivacyPolicy is true', () => {
    renderLegalPage({ isPrivacyPolicy: true });
    expect(screen.getByText(/Questions about privacy\?/i)).toBeDefined();
    expect(screen.getByText('Contact Us')).toBeDefined();
  });

  it('does not show contact CTA when isPrivacyPolicy is false', () => {
    renderLegalPage({ isPrivacyPolicy: false });
    expect(screen.queryByText(/Questions about privacy\?/i)).toBeNull();
  });
});
