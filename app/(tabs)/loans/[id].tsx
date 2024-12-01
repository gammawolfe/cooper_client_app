import React from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import loanService from '@/services/api.loan.service';
import { useTheme } from '@/context/ThemeContext';
import { LoanRequestDetails } from '@/components/loan-requestComponent/LoanRequestDetails';

export default function LoanRequestDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();

  const { data: loanRequest, isLoading, error } = useQuery({
    queryKey: ['loanRequest', id],
    queryFn: () => loanService.getLoanRequest(id),
    retry: false,
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (error) {
    const errorMessage = error instanceof AxiosError && error.response?.status === 403
      ? "We're experiencing a temporary issue with viewing loan request details. Our team is working on fixing this. Please try again later."
      : "Failed to load loan request. Please try again later.";

    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          {errorMessage}
        </Text>
        <Text 
          style={[styles.backLink, { color: colors.primary }]} 
          onPress={() => router.back()}
        >
          Go Back
        </Text>
      </View>
    );
  }

  if (!loanRequest) {
    return (
      <View style={styles.errorContainer}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Loan request not found
        </Text>
        <Text 
          style={[styles.backLink, { color: colors.primary }]} 
          onPress={() => router.back()}
        >
          Go Back
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <LoanRequestDetails loanRequest={loanRequest} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
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
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  backLink: {
    fontSize: 16,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});