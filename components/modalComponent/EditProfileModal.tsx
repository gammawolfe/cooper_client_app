import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useAuth } from '@/context/AuthContextProvider';
import { useTheme } from '@/context/ThemeContext';
import { FontAwesome } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const FORM_WIDTH = SCREEN_WIDTH * 0.9;

export default function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { user, updateProfile, isLoading } = useAuth();
  const { colors } = useTheme();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    mobile: user?.mobile || '',
    addressLine1: user?.addressLine1 || '',
    addressLine2: user?.addressLine2 || '',
    city: user?.city || '',
    postcode: user?.postcode || '',
    country: user?.country || '',
  });
  const [error, setError] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(user?.image || null);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access gallery was denied');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      setError('Failed to pick image');
      console.error('Image picker error:', err);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('First name and last name are required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.mobile.trim()) {
      setError('Mobile number is required');
      return false;
    }
    if (!formData.addressLine1.trim() || !formData.city.trim() || !formData.postcode.trim() || !formData.country.trim()) {
      setError('Address, city, postcode and country are required');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      await updateProfile({
        ...formData,
        image: image || '',
      });
      onClose();
    } catch (err) {
      setError('Failed to update profile');
      console.error('Update profile error:', err);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <BlurView intensity={20} style={StyleSheet.absoluteFill} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <Animated.View 
          entering={SlideInDown.springify()}
          style={[styles.modalContent, { backgroundColor: colors.card }]}
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Edit Profile</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity style={styles.imageContainer} onPress={pickImage}>
              <Image
                source={{ 
                  uri: image || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}` 
                }}
                style={styles.profileImage}
              />
              <View style={[styles.imageOverlay, { backgroundColor: colors.primary }]}>
                <FontAwesome name="camera" size={20} color="#fff" />
              </View>
            </TouchableOpacity>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>First Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={formData.firstName}
                    onChangeText={(value) => updateField('firstName', value)}
                    placeholder="First Name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Last Name</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={formData.lastName}
                    onChangeText={(value) => updateField('lastName', value)}
                    placeholder="Last Name"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Email</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  placeholder="Email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Mobile</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={formData.mobile}
                  onChangeText={(value) => updateField('mobile', value)}
                  placeholder="Mobile"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Address Line 1</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={formData.addressLine1}
                  onChangeText={(value) => updateField('addressLine1', value)}
                  placeholder="Address Line 1"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Address Line 2</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={formData.addressLine2}
                  onChangeText={(value) => updateField('addressLine2', value)}
                  placeholder="Address Line 2 (Optional)"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>City</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={formData.city}
                    onChangeText={(value) => updateField('city', value)}
                    placeholder="City"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={[styles.label, { color: colors.textSecondary }]}>Postcode</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                    value={formData.postcode}
                    onChangeText={(value) => updateField('postcode', value)}
                    placeholder="Postcode"
                    placeholderTextColor={colors.textSecondary}
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>Country</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
                  value={formData.country}
                  onChangeText={(value) => updateField('country', value)}
                  placeholder="Country"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              {error && (
                <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
              )}
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    width: FORM_WIDTH,
    alignSelf: 'center',
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  field: {
    marginBottom: 16,
  },
  halfField: {
    width: '48%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
