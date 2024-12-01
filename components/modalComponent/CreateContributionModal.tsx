import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { formatCurrency, parseCurrency } from '@/utils/currency';
import { DropdownItem } from '@/components/dropdownComponent/DropdownItem';

interface CreateContributionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (contributionData: {
    name: string;
    description: string;
    currency: string;
    fixedContributionAmount: number;
    cycleLengthInDays: number;
  }) => void;
}

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD'];
const CYCLE_LENGTHS = [
  { label: '1 Week', value: 7 },
  { label: '2 Weeks', value: 14 },
  { label: '1 Month', value: 30 },
  { label: '2 Months', value: 60 },
  { label: '3 Months', value: 90 },
];

export default function CreateContributionModal({
  visible,
  onClose,
  onSubmit,
}: CreateContributionModalProps) {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [cycleLengthInDays, setCycleLengthInDays] = useState(30);

  const handleSubmit = () => {
    const parsedAmount = parseCurrency(amount);

    if (!name || !parsedAmount) {
      // TODO: Show error message
      return;
    }

    if (parsedAmount <= 0) {
      // TODO: Show error message about invalid amount
      return;
    }

    onSubmit({
      name,
      description,
      currency,
      fixedContributionAmount: parsedAmount,
      cycleLengthInDays,
    });

    // Reset form
    setName('');
    setDescription('');
    setCurrency('USD');
    setAmount('');
    setCycleLengthInDays(30);
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
                Create New Contribution
              </Text>
              <Text style={[styles.subtitle, { color: colors.text + '80' }]}>
                Set up your contribution details
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: colors.text }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form} contentContainerStyle={styles.formContent}>
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Basic Information</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Name</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter contribution name"
                  placeholderTextColor={colors.text + '80'}
                  value={name}
                  onChangeText={setName}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Description</Text>
                <TextInput
                  style={[styles.textArea, { color: colors.text, borderColor: colors.border }]}
                  placeholder="Enter description"
                  placeholderTextColor={colors.text + '80'}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Contribution Amount</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Currency</Text>
                <DropdownItem
                  data={CURRENCIES}
                  placeholder="Select currency"
                  onSelect={(selectedItem) => setCurrency(selectedItem)}
                  buttonTextAfterSelection={(selectedItem) => selectedItem}
                  rowTextForSelection={(item) => item}
                  value={currency}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Amount</Text>
                <TextInput
                  style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                  placeholder="0.00"
                  placeholderTextColor={colors.text + '80'}
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Cycle Settings</Text>
              <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text }]}>Cycle Length</Text>
                <DropdownItem
                  data={CYCLE_LENGTHS}
                  placeholder="Select cycle length"
                  onSelect={(selectedItem) => setCycleLengthInDays(selectedItem.value)}
                  buttonTextAfterSelection={(selectedItem) => selectedItem.label}
                  rowTextForSelection={(item) => item.label}
                  value={CYCLE_LENGTHS.find(cycle => cycle.value === cycleLengthInDays)}
                />
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitButton, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Create Contribution</Text>
            </TouchableOpacity>
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
  formContent: {
    paddingBottom: 24,
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
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 48,
  },
  picker: {
    height: 48,
  },
  footer: {
    marginTop: 'auto',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
