import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useWallet } from '@/context/WalletContextProvider';
import { useContacts } from '@/context/ContactContextProvider';
import { Colors } from '@/constants/Colors';
import { Wallet, walletService } from '@/services/api.wallet.service';
import { IContact } from '@/types/contact';
import { inviteService } from '@/services/api.invite.service';

import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';

type ContactWallet = Wallet;

export default function PayFriendScreen() {
  const { wallets, transferFunds, isLoading: isWalletLoading } = useWallet();
  const { contacts, loading: isContactLoading, error } = useContacts();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredContacts, setFilteredContacts] = useState<IContact[]>(contacts);
  const [selectedContact, setSelectedContact] = useState<IContact | undefined>(undefined);
  const [selectedWallet, setSelectedWallet] = useState<Wallet | undefined>(undefined);
  const [selectedContactWallet, setSelectedContactWallet] = useState<ContactWallet | undefined>(undefined);
  const [contactWallets, setContactWallets] = useState<Wallet[]>([]);
  const [isLoadingWallets, setIsLoadingWallets] = useState(false);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    setFilteredContacts(contacts);
  }, [contacts]);

  const loadContactWallets = async (userId: string) => {
    try {
      setIsLoadingWallets(true);
      const wallets = await walletService.getContactWallets(userId);
      setContactWallets(wallets || []); // Ensure we always set an array
    } catch (error) {
      console.error('Error loading contact wallets:', error);
      Alert.alert('Error', 'Failed to load contact wallets');
      setContactWallets([]); // Set empty array on error
    } finally {
      setIsLoadingWallets(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      const normalizedQuery = query.toLowerCase();
      const filtered = contacts.filter(contact => 
        contact.name.toLowerCase().includes(normalizedQuery) ||
        contact.email?.toLowerCase().includes(normalizedQuery) ||
        contact.phoneNumber?.includes(query)
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  };

  const handleContactSelect = async (contact: IContact) => {
    if (!contact.isRegistered) {
      Alert.alert('Not a Cooper User', 'This contact is not registered with Cooper');
      return;
    }
    if (!contact.registeredUserId) {
      Alert.alert('Error', 'Contact is missing user ID');
      return;
    }
    setSelectedContact(contact);
    setSelectedContactWallet(undefined);
    await loadContactWallets(contact.registeredUserId);
  };

  const handleWalletSelect = (wallet: Wallet) => {
    setSelectedWallet(wallet);
    if (selectedContactWallet && selectedContactWallet.currency !== wallet.currency) {
      setSelectedContactWallet(undefined);
    }
  };

  const handleContactWalletSelect = (wallet: ContactWallet) => {
    if (selectedWallet && wallet.currency !== selectedWallet.currency) {
      Alert.alert('Currency Mismatch', 'The selected wallets must have the same currency');
      return;
    }
    setSelectedContactWallet(wallet);
  };

  const handleTransfer = async () => {
    if (!selectedWallet || !selectedContactWallet || !amount || !description) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      await transferFunds(
        selectedWallet._id,
        selectedContactWallet._id,
        parseFloat(amount),
        description
      );
      Alert.alert('Success', 'Payment sent successfully');
      // Reset form
      setSelectedContact(undefined);
      setSelectedWallet(undefined);
      setSelectedContactWallet(undefined);
      setAmount('');
      setDescription('');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send payment');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (contact: IContact) => {
    if (!contact.email) {
      Alert.alert('Error', 'Contact has no email address');
      return;
    }

    try {
      setIsLoading(true);
      await inviteService.inviteUser(contact.email, contact.phoneNumber);
      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${contact.name}`
      );
    } catch (error) {
      console.error('Error inviting user:', error);
      Alert.alert(
        'Error',
        'Failed to send invitation. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || isWalletLoading || isContactLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.light.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search contacts..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {!selectedContact ? (
          <View style={styles.contactsContainer}>
            {filteredContacts.map((contact) => (
              <TouchableOpacity
                key={contact.id}
                style={[
                  styles.contactItem,
                  contact.isRegistered && styles.registeredContactItem
                ]}
                onPress={() => handleContactSelect(contact)}
              >
                <View style={styles.contactAvatar}>
                  <Text style={styles.avatarText}>
                    {contact.name[0]}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactTextInfo}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.email && <Text style={styles.contactEmail}>{contact.email}</Text>}
                    {contact.phoneNumber && <Text style={styles.contactPhone}>{contact.phoneNumber}</Text>}
                    {contact.isRegistered && (
                      <Text style={styles.registeredBadge}>Cooper User</Text>
                    )}
                  </View>
                  {!contact.isRegistered && contact.email && (
                    <TouchableOpacity 
                      style={styles.inviteButton}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleInviteUser(contact);
                      }}
                    >
                      <Text style={styles.inviteButtonText}>Invite</Text>
                    </TouchableOpacity>
                  )}
                  {!contact.isRegistered && !contact.email && (
                    <Text style={styles.noEmailText}>No email available</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View>
            <View style={[styles.contactItem, styles.selectedContactItem]}>
              <View style={styles.contactAvatar}>
                <Text style={styles.avatarText}>
                  {selectedContact.name[0]}
                </Text>
              </View>
              <View style={styles.contactInfo}>
                <View style={styles.contactTextInfo}>
                  <Text style={styles.contactName}>{selectedContact.name}</Text>
                  {selectedContact.email && <Text style={styles.contactEmail}>{selectedContact.email}</Text>}
                  {selectedContact.phoneNumber && <Text style={styles.contactPhone}>{selectedContact.phoneNumber}</Text>}
                  {selectedContact.isRegistered && (
                    <Text style={styles.registeredBadge}>Cooper User</Text>
                  )}
                </View>
                <TouchableOpacity style={styles.changeButton} onPress={() => setSelectedContact(undefined)}>
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.walletSection}>
              <Text style={styles.sectionTitle}>Your Wallet</Text>
              <View style={styles.dropdownContainer}>
                <DropdownItem
                  data={wallets.filter(wallet => wallet.source === 'user')}
                  placeholder="Select your wallet"
                  onSelect={handleWalletSelect}
                  buttonTextAfterSelection={(selectedItem) => 
                    `${selectedItem.currency} - ${selectedItem.balance.toFixed(2)}`
                  }
                  rowTextForSelection={(item) => 
                    `${item.currency} - ${item.balance.toFixed(2)}`
                  }
                  value={selectedWallet}
                />
              </View>
            </View>

            {selectedWallet && (
              <View style={styles.walletSection}>
                <Text style={styles.sectionTitle}>{`${selectedContact.name}'s Wallet`}</Text>
                {isLoadingWallets ? (
                  <ActivityIndicator size="small" color={Colors.light.tint} />
                ) : contactWallets && contactWallets.length > 0 ? (
                  <View style={styles.dropdownContainer}>
                    <DropdownItem
                      data={contactWallets.filter(wallet => 
                        wallet.currency === selectedWallet.currency && 
                        wallet.source === 'user'
                      )}
                      placeholder={`Select ${selectedContact.name}'s wallet`}
                      onSelect={handleContactWalletSelect}
                      buttonTextAfterSelection={(selectedItem) => 
                        `${selectedItem.currency} - ${selectedItem.balance.toFixed(2)}`
                      }
                      rowTextForSelection={(item) => 
                        `${item.currency} - ${item.balance.toFixed(2)}`
                      }
                      value={selectedContactWallet}
                    />
                  </View>
                ) : (
                  <Text style={styles.noWalletsText}>No matching wallets found</Text>
                )}
              </View>
            )}

            <View style={styles.formSection}>
              <TextInput
                style={styles.amountInput}
                placeholder="Amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <TextInput
                style={styles.descriptionInput}
                placeholder="Description"
                value={description}
                onChangeText={setDescription}
                multiline
              />
              <TouchableOpacity
                style={[
                  styles.transferButton,
                  (!selectedWallet ||
                    !selectedContactWallet ||
                    !amount ||
                    !description ||
                    isLoading) &&
                    styles.disabledButton,
                ]}
                onPress={handleTransfer}
                disabled={!selectedWallet || !selectedContactWallet || !amount || !description || isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.transferButtonText}>Send Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 100, // Add padding to clear the tab bar
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
    padding: 16,
  },
  errorText: {
    color: Colors.light.error,
    textAlign: 'center',
    fontSize: 16,
  },
  searchContainer: {
    padding: 16,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  contactsContainer: {
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  registeredContactItem: {
    backgroundColor: Colors.light.tint + '10',
  },
  selectedContactItem: {
    backgroundColor: Colors.light.tint + '10',
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomWidth: 0,
  },
  contactAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.light.tint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactTextInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
  },
  contactEmail: {
    fontSize: 14,
    color: '#666',
  },
  contactPhone: {
    fontSize: 14,
    color: '#666',
  },
  registeredBadge: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  inviteButton: {
    backgroundColor: Colors.light.tint + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 4,
  },
  inviteButtonText: {
    color: Colors.light.tint,
    fontSize: 12,
    fontWeight: '600',
  },
  noEmailText: {
    color: '#999',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },
  changeButton: {
    padding: 8,
  },
  changeButtonText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  walletSection: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdownContainer: {
    marginTop: 8,
    paddingHorizontal: 16,
  },
  formSection: {
    padding: 16,
    gap: 12,
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
  },
  transferButton: {
    backgroundColor: Colors.light.tint,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  transferButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noWalletsText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 10,
  },
});
