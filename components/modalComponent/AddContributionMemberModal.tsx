import React, { useState, useEffect } from 'react';
import { Modal, StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Avatar } from '@/components/ui/Avatar';
import { Checkbox } from '@/components/ui/Checkbox';
import { useContacts } from '@/context/ContactContextProvider';
import { IContact } from '@/types/contact';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSubmit: (selectedContacts: IContact[]) => void;
  currentMembers: string[]; // Array of current member IDs
}

export default function AddContributionMemberModal({ visible, onClose, onSubmit, currentMembers }: Props) {
  const { colors } = useTheme();
  const { contacts, loading, error } = useContacts();
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContacts, setSelectedContacts] = useState<IContact[]>([]);

  // Filter contacts to only show registered users and apply search
  useEffect(() => {
    const registeredContacts = contacts.filter(contact => contact.isRegistered);
    const filtered = registeredContacts.filter(contact => 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (contact.phoneNumber && contact.phoneNumber.includes(searchQuery)) ||
      (contact.email && contact.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredContacts(filtered);
  }, [searchQuery, contacts]);

  const toggleContact = (contact: IContact) => {
    if (!contact.registeredUserId) {
      console.warn('Contact has no registered user ID');
      return;
    }

    console.log('Toggling contact:', {
      name: contact.name,
      registeredUserId: contact.registeredUserId
    });

    const isSelected = selectedContacts.some(c => c.registeredUserId === contact.registeredUserId);
    
    if (isSelected) {
      setSelectedContacts(selectedContacts.filter(c => c.registeredUserId !== contact.registeredUserId));
      console.log('Contact removed from selection');
    } else {
      setSelectedContacts([...selectedContacts, contact]);
      console.log('Contact added to selection');
    }
  };

  const handleSubmit = () => {
    onSubmit(selectedContacts);
    setSelectedContacts([]);
    onClose();
  };

  const renderContact = ({ item }: { item: IContact }) => {
    const isSelected = selectedContacts.some(c => c.registeredUserId === item.registeredUserId);
    const isCurrentMember = item.registeredUserId && currentMembers.includes(item.registeredUserId);

    return (
      <TouchableOpacity
        style={[
          styles.contactItem,
          isSelected && { backgroundColor: colors.primary + '20' }
        ]}
        onPress={() => !isCurrentMember && toggleContact(item)}
        disabled={isCurrentMember === true}
      >
        <View style={styles.contactInfo}>
          <Avatar
            size={40}
            name={item.name}
            image={item.image}
            style={styles.avatar}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.name, { color: colors.text }]}>{item.name}</Text>
            {item.email && (
              <Text style={[styles.detail, { color: colors.textSecondary }]}>{item.email}</Text>
            )}
            {isCurrentMember && (
              <Text style={[styles.memberTag, { color: colors.primary }]}>Already a member</Text>
            )}
          </View>
        </View>
        {!isCurrentMember && (
          <Checkbox
            checked={isSelected}
            onChange={() => toggleContact(item)}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
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
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
          </View>
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
            Add Selected
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
  },
  memberTag: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  errorText: {
    textAlign: 'center',
    fontSize: 16,
  },
  footer: {
    padding: 16,
  },
  submitButton: {
    marginTop: 8,
  },
});
