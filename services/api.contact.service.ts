import apiClient from './authConfig';

// Types
export interface Contact {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile?: string;
  wallets?: {
    _id: string;
    currency: string;
  }[];
}

interface ApiErrorResponse {
  message: string;
  status: number;
}

class ContactService {
  async getContacts(): Promise<Contact[]> {
    try {
      const response = await apiClient.get<{ contacts: Contact[] }>('/users/contacts');
      return response.data.contacts;
    } catch (error) {
      console.error('Get contacts error:', error);
      throw this.handleError(error);
    }
  }

  async searchContacts(query: string): Promise<Contact[]> {
    try {
      const response = await apiClient.get<{ contacts: Contact[] }>(`/users/contacts/search?q=${encodeURIComponent(query)}`);
      return response.data.contacts;
    } catch (error) {
      console.error('Search contacts error:', error);
      throw this.handleError(error);
    }
  }

  async addContact(email: string): Promise<Contact> {
    try {
      const response = await apiClient.post<{ contact: Contact }>('/users/contacts', { email });
      return response.data.contact;
    } catch (error) {
      console.error('Add contact error:', error);
      throw this.handleError(error);
    }
  }

  async removeContact(contactId: string): Promise<void> {
    try {
      await apiClient.delete(`/users/contacts/${contactId}`);
    } catch (error) {
      console.error('Remove contact error:', error);
      throw this.handleError(error);
    }
  }

  private handleError(error: any): Error {
    if (error.response?.data) {
      const apiError = error.response.data as ApiErrorResponse;
      throw new Error(apiError.message);
    }
    throw error;
  }
}

export const contactService = new ContactService();
