import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import * as Contacts from 'expo-contacts';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Avatar } from '@/components/ui/Avatar';
import { Checkbox } from '@/components/ui/Checkbox';

interface Contact {
  id: string;
  name: string;
  phoneNumber?: string;
  email?: string;
  selected: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedContacts: Contact[]) => void;
  currentMembers: string[]; // Array of current member IDs
}

export default function AddContributionMemberModal({ visible, onClose, onSubmit, currentMembers }: Props) {
  const { colors } = useTheme();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<Contact[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === 'granted') {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
        });

        if (data.length > 0) {
          const formattedContacts: Contact[] = data
            .filter(contact => contact.name) // Only include contacts with names
            .map(contact => ({
              id: contact.id || String(Math.random()),
              name: contact.name || 'Unknown',
              phoneNumber: contact.phoneNumbers?.[0]?.number,
              email: contact.emails?.[0]?.email,
              selected: false,
            }));
          setContacts(formattedContacts);
          setFilteredContacts(formattedContacts);
        }
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    const filtered = contacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.phoneNumber && contact.phoneNumber.includes(searchQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const toggleContact = (contact: Contact) => {
    const updatedContacts = filteredContacts.map(c => 
      c.id === contact.id ? { ...c, selected: !c.selected } : c
    );
    setFilteredContacts(updatedContacts);
    setContacts(contacts.map(c => 
      c.id === contact.id ? { ...c, selected: !c.selected } : c
    ));
    
    if (!contact.selected) {
      setSelectedContacts([...selectedContacts, contact]);
    } else {
      setSelectedContacts(selectedContacts.filter(c => c.id !== contact.id));
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedContacts);
    onClose();
  };

  const renderContact = ({ item }: { item: Contact }) => (
    <TouchableOpacity
      style={[
        styles.contactItem,
        item.selected && { backgroundColor: colors.primary + '20' }
      ]}
      onPress={() => toggleContact(item)}
    >
      <View style={styles.contactInfo}>
        <Avatar
          size={40}
          name={item.name}
          style={styles.avatar}
        />
        <View style={styles.contactDetails}>
          <Text style={[styles.contactName, { color: colors.text }]}>{item.name}</Text>
          {item.phoneNumber && (
            <Text style={[styles.contactSubtext, { color: colors.text + '80' }]}>
              {item.phoneNumber}
            </Text>
          )}
        </View>
      </View>
      <Checkbox
        checked={item.selected}
        onChange={() => toggleContact(item)}
      />
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Add Members</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeButton, { color: colors.primary }]}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search contacts..."
          style={styles.searchBar}
        />

        {loading ? (
          <ActivityIndicator style={styles.loading} color={colors.primary} />
        ) : (
          <FlatList
            data={filteredContacts}
            renderItem={renderContact}
            keyExtractor={item => item.id}
            style={styles.list}
            contentContainerStyle={styles.listContent}
          />
        )}

        <View style={styles.footer}>
          <Button
            onPress={handleSubmit}
            disabled={selectedContacts.length === 0}
            style={styles.submitButton}
          >
            Add {selectedContacts.length} Members
          </Button>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    marginTop: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 16,
  },
  searchBar: {
    margin: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderRadius: 8,
    marginVertical: 4,
    paddingHorizontal: 12,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  contactDetails: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
  },
  contactSubtext: {
    fontSize: 14,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  submitButton: {
    width: '100%',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
