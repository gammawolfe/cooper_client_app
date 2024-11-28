import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import * as Contacts from 'expo-contacts';
import { authService, User } from '@/services/api.auth.service';
import { IContact, IDeviceContact } from '@/types/contact';

interface ContactContextType {
  contacts: IContact[];
  loading: boolean;
  error: string | null;
  refreshContacts: () => Promise<void>;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContacts = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [contacts, setContacts] = useState<IContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDeviceContacts = async (): Promise<IDeviceContact[]> => {
    const { status } = await Contacts.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission to access contacts was denied');
    }

    const { data } = await Contacts.getContactsAsync({
      fields: [
        Contacts.Fields.Name,
        Contacts.Fields.PhoneNumbers,
        Contacts.Fields.Emails,
        Contacts.Fields.Image,
      ],
    });

    return data
      .filter(contact => contact.name)
      .map(contact => ({
        id: contact.id || String(Date.now() + Math.random()),
        name: contact.name || 'Unknown',
        phoneNumbers: contact.phoneNumbers?.map(phone => ({ 
          number: phone.number || ''
        })),
        emails: contact.emails?.map(email => ({ 
          email: email.email || ''
        })),
        image: contact.image?.uri,
      }));
  };

  const getAllAppUsers = async (): Promise<User[]> => {
    try {
      return await authService.getAllAppUsers();
    } catch (error) {
      console.error('Error fetching registered users:', error);
      throw error;
    }
  };

  const loadContacts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load both device contacts and registered users
      const [deviceContacts, registeredUsers] = await Promise.all([
        loadDeviceContacts(),
        getAllAppUsers(),
      ]);

      // Create maps for matching registered users
      const registeredPhones = new Map<string, User>();
      const registeredEmails = new Map<string, User>();

      // Helper function to normalize phone numbers
      const normalizePhone = (phone: string) => {
        return phone.replace(/\D/g, '');
      };

      // Populate maps with registered users' contact info
      registeredUsers.forEach(user => {
        if (user.mobile) {
          registeredPhones.set(normalizePhone(user.mobile), user);
        }
        if (user.email) {
          registeredEmails.set(user.email.toLowerCase(), user);
        }
      });

      // Process device contacts and check if they're registered
      const processedContacts: IContact[] = deviceContacts.map(contact => {
        // Check if any phone number matches
        let matchedUser: User | undefined = undefined;

        // Try matching by phone number first
        for (const phone of contact.phoneNumbers || []) {
          const normalizedPhone = normalizePhone(phone.number);
          const userByPhone = registeredPhones.get(normalizedPhone);
          if (userByPhone) {
            matchedUser = userByPhone;
            break;
          }
        }

        // If no match by phone, try email
        if (!matchedUser) {
          for (const email of contact.emails || []) {
            const userByEmail = registeredEmails.get(email.email.toLowerCase());
            if (userByEmail) {
              matchedUser = userByEmail;
              break;
            }
          }
        }

        const contactImage = contact.image || matchedUser?.image;

        return {
          id: contact.id,
          name: contact.name,
          phoneNumber: contact.phoneNumbers?.[0]?.number,
          email: contact.emails?.[0]?.email,
          image: contactImage,
          isRegistered: !!matchedUser,
          registeredUserId: matchedUser?._id,
          registeredUser: matchedUser,
        };
      });

      setContacts(processedContacts);
    } catch (error) {
      console.error('Error loading contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  const refreshContacts = async () => {
    await loadContacts();
  };

  return (
    <ContactContext.Provider value={{ contacts, loading, error, refreshContacts }}>
      {children}
    </ContactContext.Provider>
  );
};
