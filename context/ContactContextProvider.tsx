import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import * as Contacts from 'expo-contacts';
import { authService, User } from '@/services/api.auth.service';
import { IContact, IDeviceContact } from '@/types/contact';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_NAME } from '@/services/authConfig';

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
  const [loading, setLoading] = useState(false); 
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
    const token = await SecureStore.getItemAsync(TOKEN_NAME);
    if (!token) {
      return []; 
    }
    
    try {
      return await authService.getAllAppUsers();
    } catch (error) {
      console.debug('Error fetching registered users:', error);
      return []; 
    }
  };

  const loadContacts = async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_NAME);
      if (!token) {
        setContacts([]); 
        return;
      }

      setLoading(true);
      setError(null);

      const [deviceContacts, registeredUsers] = await Promise.all([
        loadDeviceContacts(),
        getAllAppUsers(),
      ]);

      const registeredPhones = new Map<string, User>();
      const registeredEmails = new Map<string, User>();

      const normalizePhone = (phone: string) => {
        return phone.replace(/\D/g, '');
      };

      registeredUsers.forEach(user => {
        if (user.mobile) {
          registeredPhones.set(normalizePhone(user.mobile), user);
        }
        if (user.email) {
          registeredEmails.set(user.email.toLowerCase(), user);
        }
      });

      const processedContacts: IContact[] = deviceContacts.map(contact => {
        let matchedUser: User | undefined = undefined;

        for (const phone of contact.phoneNumbers || []) {
          const normalizedPhone = normalizePhone(phone.number);
          const userByPhone = registeredPhones.get(normalizedPhone);
          if (userByPhone) {
            matchedUser = userByPhone;
            break;
          }
        }

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
          email: matchedUser?.email || contact.emails?.[0]?.email,
          image: contactImage,
          isRegistered: !!matchedUser,
          registeredUserId: matchedUser?._id,
          registeredUser: matchedUser,
        };
      });

      setContacts(processedContacts);
    } catch (error) {
      console.debug('Error loading contacts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const checkAuthAndLoadContacts = async () => {
    const token = await SecureStore.getItemAsync(TOKEN_NAME);
    if (token) {
      loadContacts();
    } else {
      setContacts([]);
    }
  };

  useEffect(() => {
    checkAuthAndLoadContacts();
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
