/**
 * Payment Modal Component
 * Handles payment method selection and processing
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../config/theme';
import paymentService from '../services/paymentService';

const PaymentModal = ({ visible, onClose, onPaymentSuccess, paymentType = 'deposit' }) => {
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentMethods = paymentService.getPaymentMethods();

  const handleMethodSelect = (methodId) => {
    setSelectedMethod(methodId);
  };

  const handlePayment = async () => {
    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    // Validate payment method
    if (!selectedMethod) {
      Alert.alert('No Payment Method', 'Please select a payment method.');
      return;
    }

    // Validate phone number or card number based on method
    if (selectedMethod !== 'card' && !phoneNumber.trim()) {
      Alert.alert('Missing Phone Number', 'Please enter your phone number.');
      return;
    }

    if (selectedMethod === 'card' && !cardNumber.trim()) {
      Alert.alert('Missing Card Number', 'Please enter your card number.');
      return;
    }

    setIsProcessing(true);

    try {
      // Process payment
      const result = await paymentService.addMoney(
        amountNum,
        paymentMethods.find((m) => m.id === selectedMethod)?.name || 'Unknown'
      );

      setIsProcessing(false);

      if (result.success) {
        Alert.alert(
          'Payment Successful',
          `ZMW ${amountNum.toFixed(2)} has been added to your wallet.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setAmount('');
                setPhoneNumber('');
                setCardNumber('');
                setSelectedMethod(null);

                // Call success callback
                if (onPaymentSuccess) {
                  onPaymentSuccess(result);
                }

                // Close modal
                onClose();
              },
            },
          ]
        );
      }
    } catch (error) {
      setIsProcessing(false);
      Alert.alert('Payment Failed', error.error || 'An error occurred while processing your payment.');
    }
  };

  const quickAmounts = [50, 100, 250, 500];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Money to Wallet</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Amount Input */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Amount (ZMW)</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textTertiary}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                editable={!isProcessing}
              />

              {/* Quick Amount Buttons */}
              <View style={styles.quickAmountsContainer}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={styles.quickAmountButton}
                    onPress={() => setAmount(quickAmount.toString())}
                    disabled={isProcessing}
                  >
                    <Text style={styles.quickAmountText}>+{quickAmount}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Select Payment Method</Text>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethodCard,
                    selectedMethod === method.id && styles.paymentMethodCardActive,
                  ]}
                  onPress={() => handleMethodSelect(method.id)}
                  disabled={isProcessing}
                >
                  <View style={styles.paymentMethodIcon}>
                    <MaterialCommunityIcons
                      name={method.icon}
                      size={24}
                      color={
                        selectedMethod === method.id
                          ? theme.colors.primary
                          : theme.colors.textSecondary
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentMethodName,
                      selectedMethod === method.id && styles.paymentMethodNameActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                  {selectedMethod === method.id && (
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={20}
                      color={theme.colors.primary}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Phone Number Input (for mobile money) */}
            {selectedMethod && selectedMethod !== 'card' && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0977 123 456"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                  editable={!isProcessing}
                />
              </View>
            )}

            {/* Card Number Input (for card payment) */}
            {selectedMethod === 'card' && (
              <View style={styles.section}>
                <Text style={styles.sectionLabel}>Card Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor={theme.colors.textTertiary}
                  value={cardNumber}
                  onChangeText={setCardNumber}
                  keyboardType="number-pad"
                  editable={!isProcessing}
                  maxLength={19}
                />
              </View>
            )}

            {/* Pay Button */}
            <TouchableOpacity
              style={[styles.payButton, isProcessing && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <MaterialCommunityIcons name="lock-check" size={20} color="white" />
                  <Text style={styles.payButtonText}>
                    Pay ZMW {amount || '0.00'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Security Note */}
            <View style={styles.securityNote}>
              <MaterialCommunityIcons
                name="shield-check"
                size={16}
                color={theme.colors.success}
              />
              <Text style={styles.securityNoteText}>
                Secure payment processing. Your information is encrypted.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.radius.xl,
    borderTopRightRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  modalTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  amountInput: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  quickAmountsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickAmountText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  paymentMethodCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: `${theme.colors.primary}0F`,
  },
  paymentMethodIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  paymentMethodName: {
    flex: 1,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  paymentMethodNameActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  input: {
    backgroundColor: theme.colors.backgroundAlt,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textPrimary,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  payButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.lg,
  },
  securityNoteText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
  },
});

export default PaymentModal;
