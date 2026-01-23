import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ContactForm } from '../components/ContactForm';
import { BrowserRouter } from 'react-router-dom';
import { contactService } from '../mocks/contactService';

// Mock the contact service
vi.mock('../mocks/contactService', () => ({
  contactService: {
    sendContact: vi.fn(),
  },
}));

const renderContactForm = () => {
  return render(
    <BrowserRouter>
      <ContactForm />
    </BrowserRouter>
  );
};

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows validation errors for empty required fields', async () => {
    renderContactForm();
    
    fireEvent.click(screen.getByText(/Send Message/i));

    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeDefined();
      expect(screen.getByText(/Invalid email address/i)).toBeDefined();
      expect(screen.getByText(/Subject must be at least 5 characters/i)).toBeDefined();
      expect(screen.getByText(/Message must be at least 20 characters/i)).toBeDefined();
    });
  });

  it('shows error for message shorter than 20 characters', async () => {
    renderContactForm();
    
    fireEvent.change(screen.getByLabelText(/Message \*/i), {
      target: { value: 'Too short' },
    });
    
    fireEvent.click(screen.getByText(/Send Message/i));

    await waitFor(() => {
      expect(screen.getByText(/Message must be at least 20 characters/i)).toBeDefined();
    });
  });

  it('submits the form successfully and shows success message', async () => {
    const mockResponse: { success: boolean; ticketId: string } = {
      success: true,
      ticketId: 'MOCK-123',
    };
    (contactService.sendContact as jest.Mock).mockResolvedValue(mockResponse);

    renderContactForm();
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject \*/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Message \*/i), { 
      target: { value: 'This is a message that is longer than twenty characters.' } 
    });
    
    fireEvent.click(screen.getByText(/Send Message/i));

    await waitFor(() => {
      expect(screen.getByText(/Message Sent!/i)).toBeDefined();
      expect(screen.getByText(/MOCK-123/i)).toBeDefined();
    });
  });

  it('shows error alert on submission failure', async () => {
    const mockErrorResponse: { success: boolean; error: string } = {
      success: false,
      error: 'Submission failed',
    };
    (contactService.sendContact as jest.Mock).mockResolvedValue(mockErrorResponse);

    renderContactForm();
    
    fireEvent.change(screen.getByLabelText(/Full Name \*/i), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByLabelText(/Email Address \*/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Subject \*/i), { target: { value: 'Test Subject' } });
    fireEvent.change(screen.getByLabelText(/Message \*/i), { 
      target: { value: 'This is a message that is longer than twenty characters.' } 
    });
    
    fireEvent.click(screen.getByText(/Send Message/i));

    await waitFor(() => {
      expect(screen.getByText(/Submission failed/i)).toBeDefined();
    });
  });
});
