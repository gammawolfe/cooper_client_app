import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { CreateWalletDTO } from '@/services/api.wallet.service';
import { Wallet } from '@/services/api.wallet.service';
import { walletService } from '@/services/api.wallet.service';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];

interface CreateWalletModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (walletData: CreateWalletDTO) => Promise<boolean>;
}

export default function CreateWalletModal({
  visible,
  onClose,
  onSubmit,
}: CreateWalletModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [userWallets, setUserWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's existing wallets when modal opens
  useEffect(() => {
    if (visible) {
      loadUserWallets();
    }
  }, [visible]);

  const loadUserWallets = async () => {
    try {
      const wallets = await walletService.getUserWallets();
      setUserWallets(wallets);
    } catch (error) {
      console.error('Failed to load wallets:', error);
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      Alert.alert('Error', 'Please enter a wallet name');
      return;
    }

    // Check if user already has a wallet with this currency
    const existingWallet = userWallets.find(
      wallet => wallet.currency.toUpperCase() === currency.toUpperCase()
    );

    if (existingWallet) {
      Alert.alert(
        'Currency Already Exists',
        `You already have a wallet for ${currency}. You cannot create multiple wallets with the same currency.`
      );
      return;
    }

    setLoading(true);
    try {
      // Wait for the wallet creation to complete
      const success = await onSubmit({
        name,
        currency,
        isDefault,
      });

      // Only show success message and reset if we got a success response
      if (success) {
        Alert.alert(
          'Success',
          `Your wallet "${name}" has been created successfully!`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form and close modal
                setName('');
                setCurrency('');
                setIsDefault(false);
                onClose();
              }
            }
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to create wallet. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={[styles.content, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Create New Wallet
              </Text>
              <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
                Set up your wallet details
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Wallet Information</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter wallet name"
                  placeholderTextColor={colors.text + '80'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                <DropdownItem<string>
                  data={CURRENCIES}
                  placeholder="Select currency"
                  value={currency}
                  onSelect={(selectedItem, index) => setCurrency(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => selectedItem}
                  rowTextForSelection={(item) => item}
                />
              </View>

              <View style={styles.checkboxContainer}>
                <TouchableOpacity
                  style={[
                    styles.checkbox,
                    { borderColor: colors.border },
                    isDefault && { backgroundColor: colors.primary }
                  ]}
                  onPress={() => setIsDefault(!isDefault)}
                >
                  {isDefault && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
                <Text style={[styles.checkboxLabel, { color: colors.text }]}>
                  Set as default wallet
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  { backgroundColor: colors.primary },
                  loading && { opacity: 0.7 }
                ]}
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Creating...' : 'Create Wallet'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.8,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  form: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 48,
  },
  dropdown: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
  },
  dropdownButtonText: {
    fontSize: 16,
    textAlign: 'left',
  },
  dropdownList: {
    borderRadius: 12,
    marginTop: 8,
  },
  dropdownRow: {
    height: 48,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  dropdownSelectedRow: {
    borderBottomWidth: 0,
  },
  dropdownRowText: {
    fontSize: 16,
    textAlign: 'left',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 6,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 16,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
