export interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
  topic: 'Support' | 'Feedback' | 'Report abuse' | 'Partnership';
  phone?: string;
  attachment?: File;
}

export interface ContactResponse {
  success: boolean;
  ticketId?: string;
  error?: string;
}

export const contactService = {
  sendContact: async (payload: ContactPayload): Promise<ContactResponse> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulate 10% random failure
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: "Failed to send message. Please try again later.",
      };
    }

    console.log("Mock contact submission received:", payload);
    
    // Generate a mock ticket ID
    const ticketId = `TICKET-${Math.floor(100000 + Math.random() * 900000)}`;
    
    return {
      success: true,
      ticketId,
    };
  },
};
