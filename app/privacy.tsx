import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Stack } from 'expo-router';

export default function PrivacyScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Privacy Policy',
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
        }}
      />

      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.lastUpdated, { color: colors.text + '80' }]}>
          Last updated: December 13, 2023
        </Text>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Information We Collect
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We collect information that you provide directly to us, including:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Personal information (name, email address)
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Financial information (transaction history, account balances)
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Device information (device type, operating system)
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            How We Use Your Information
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We use the information we collect to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Provide and maintain our services
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Process your transactions
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Send you important notifications
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Improve our services and develop new features
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Data Security
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            We implement appropriate security measures to protect your personal information:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • End-to-end encryption for sensitive data
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Regular security audits and updates
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Secure data storage and transmission
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Your Rights
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            You have the right to:
          </Text>
          <View style={styles.bulletPoints}>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Access your personal information
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Request correction of your data
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Request deletion of your data
            </Text>
            <Text style={[styles.bulletPoint, { color: colors.text }]}>
              • Opt-out of marketing communications
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Contact Us
          </Text>
          <Text style={[styles.paragraph, { color: colors.text }]}>
            If you have any questions about this Privacy Policy, please contact us at:
          </Text>
          <Text style={[styles.contactInfo, { color: colors.primary }]}>
            privacy@cooperapp.com
          </Text>
        </View>

        <Text style={[styles.footer, { color: colors.text + '80' }]}>
          This privacy policy is subject to change. We will notify you of any changes by posting the new policy on this page.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoints: {
    marginLeft: 8,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 16,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  footer: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 24,
    textAlign: 'center',
  },
});