import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
  Modal,
} from 'react-native';
import { useAuth } from '../../services/auth';
import { api } from '../../services/api';
import { Colors } from '../../constants/Colors';

interface PaymentMethodResponse {
  id: string;
  payer: string;
  email: {
    address: string;
    isInvalid: boolean;
    isValid: boolean;
    nonconformities: any[];
  };
  paymentType: 0 | 1; // 0: Credit Card, 1: PayPal
  cardHolderName?: string;
  cardNumber?: number;
  active: boolean;
  createdDate: string;
  lastUpdated: string;
  isInvalid: boolean;
  isValid: boolean;
  nonconformities: any[];
  userId: string;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodResponse[]>([]);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethodResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Payment method form
  const [paymentForm, setPaymentForm] = useState({
    payer: '',
    email: '',
    type: 0 as 0 | 1,
    cardHolderName: '',
    cardNumber: '',
  });

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const response = await api.getPaymentMethods();
      console.log('Payment methods response:', response);
      
      if (Array.isArray(response)) {
        // Filter only active and valid payment methods
        const validMethods = response.filter(method => 
          method && 
          method.id && 
          method.active && 
          method.isValid
        );
        setPaymentMethods(validMethods);
      } else {
        setPaymentMethods([]);
      }
    } catch (error) {
      console.error('Failed to load payment methods:', error);
      setPaymentMethods([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getCardType = (cardNumber: number): string => {
    const cardStr = cardNumber.toString();
    const firstDigit = cardStr.charAt(0);
    const firstTwoDigits = cardStr.substring(0, 2);
    
    if (firstDigit === '4') {
      return 'Visa';
    } else if (['51', '52', '53', '54', '55'].includes(firstTwoDigits) || 
               (parseInt(firstTwoDigits) >= 22 && parseInt(firstTwoDigits) <= 27)) {
      return 'Mastercard';
    } else if (['34', '37'].includes(firstTwoDigits)) {
      return 'American Express';
    } else if (firstTwoDigits === '60') {
      return 'Discover';
    } else {
      return 'Credit Card';
    }
  };

  const formatCardNumber = (cardNumber: number): string => {
    const cardStr = cardNumber.toString();
    if (cardStr.length >= 4) {
      return `**** **** **** ${cardStr.slice(-4)}`;
    }
    return `**** ${cardStr}`;
  };

  const getCardIcon = (cardType: string): string => {
    switch (cardType) {
      case 'Visa':
        return '💳';
      case 'Mastercard':
        return '💳';
      case 'American Express':
        return '💳';
      default:
        return '💳';
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await logout();
          } catch (error) {
            console.error('Logout error:', error);
          }
        },
      },
    ]);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      await api.changePassword(oldPassword, newPassword, confirmPassword);
      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Failed to change password:', error);
      Alert.alert('Error', 'Failed to change password');
    }
  };

  const handleSavePaymentMethod = async () => {
    if (!paymentForm.payer || !paymentForm.email) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      const paymentData = {
        payer: paymentForm.payer,
        email: paymentForm.email,
        type: paymentForm.type,
        ...(paymentForm.type === 0 && {
          cardHolderName: paymentForm.cardHolderName,
          cardNumber: paymentForm.cardNumber ? parseInt(paymentForm.cardNumber) : undefined,
        }),
      };

      if (editingPayment) {
        await api.updatePaymentMethod(editingPayment.id, paymentData);
      } else {
        await api.addPaymentMethod(paymentData);
      }
      
      Alert.alert('Success', 'Payment method saved successfully');
      setShowPaymentModal(false);
      setEditingPayment(null);
      resetPaymentForm();
      loadPaymentMethods();
    } catch (error) {
      console.error('Failed to save payment method:', error);
      Alert.alert('Error', 'Failed to save payment method');
    }
  };

  const handleDeletePaymentMethod = async (id: string) => {
    Alert.alert(
      'Delete Payment Method',
      'Are you sure you want to delete this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deletePaymentMethod(id);
              loadPaymentMethods();
              Alert.alert('Success', 'Payment method deleted');
            } catch (error) {
              console.error('Failed to delete payment method:', error);
              Alert.alert('Error', 'Failed to delete payment method');
            }
          },
        },
      ]
    );
  };

  const openEditPaymentMethod = (method: PaymentMethodResponse) => {
    setEditingPayment(method);
    setPaymentForm({
      payer: method.payer || '',
      email: method.email?.address || '',
      type: method.paymentType,
      cardHolderName: method.cardHolderName || '',
      cardNumber: method.cardNumber?.toString() || '',
    });
    setShowPaymentModal(true);
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      payer: '',
      email: '',
      type: 0,
      cardHolderName: '',
      cardNumber: '',
    });
  };

  const renderPaymentMethod = (method: PaymentMethodResponse, index: number) => {
    if (!method || !method.id) {
      return null;
    }

    const cardType = method.cardNumber ? getCardType(method.cardNumber) : '';
    const formattedCardNumber = method.cardNumber ? formatCardNumber(method.cardNumber) : '';
    const cardIcon = method.paymentType === 0 ? getCardIcon(cardType) : '🅿️';

    return (
      <View key={`payment-${method.id}-${index}`} style={styles.paymentMethodItem}>
        <View style={styles.paymentMethodInfo}>
          <View style={styles.paymentMethodHeader}>
            <Text style={styles.paymentMethodIcon}>{cardIcon}</Text>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>{method.payer}</Text>
              {method.paymentType === 0 ? (
                <>
                  <Text style={styles.cardType}>{cardType}</Text>
                  <Text style={styles.cardNumber}>{formattedCardNumber}</Text>
                </>
              ) : (
                <Text style={styles.paypalEmail}>{method.email?.address}</Text>
              )}
            </View>
          </View>
        </View>
        <View style={styles.paymentMethodActions}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => openEditPaymentMethod(method)}
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeletePaymentMethod(method.id)}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderPaymentMethods = () => {
    if (isLoading) {
      return <Text style={styles.loadingText}>Loading payment methods...</Text>;
    }

    if (paymentMethods.length === 0) {
      return <Text style={styles.noPaymentMethods}>No payment methods added</Text>;
    }

    return (
      <View>
        {paymentMethods.map((method, index) => renderPaymentMethod(method, index))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user?.userName || 'Unknown User'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'No email'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        
        {!user?.isGoogleUser && (
          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => setShowPasswordModal(true)}
          >
            <Text style={styles.settingText}>Change Password</Text>
            <Text style={styles.settingArrow}>›</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetPaymentForm();
              setEditingPayment(null);
              setShowPaymentModal(true);
            }}
          >
            <Text style={styles.addButtonText}>+ Add</Text>
          </TouchableOpacity>
        </View>
        
        {renderPaymentMethods()}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Password Change Modal */}
      <Modal visible={showPasswordModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPasswordModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TouchableOpacity onPress={handleChangePassword}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Current Password"
              value={oldPassword}
              onChangeText={setOldPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </View>
        </View>
      </Modal>

      {/* Payment Method Modal */}
      <Modal visible={showPaymentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingPayment ? 'Edit Payment Method' : 'Add Payment Method'}
            </Text>
            <TouchableOpacity onPress={handleSavePaymentMethod}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Payment Type</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  paymentForm.type === 0 && styles.selectedTypeOption,
                ]}
                onPress={() => setPaymentForm({ ...paymentForm, type: 0 })}
              >
                <Text style={styles.typeOptionText}>💳 Credit Card</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeOption,
                  paymentForm.type === 1 && styles.selectedTypeOption,
                ]}
                onPress={() => setPaymentForm({ ...paymentForm, type: 1 })}
              >
                <Text style={styles.typeOptionText}>🅿️ PayPal</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Payer Name"
              value={paymentForm.payer}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, payer: text })}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              value={paymentForm.email}
              onChangeText={(text) => setPaymentForm({ ...paymentForm, email: text })}
              keyboardType="email-address"
            />

            {paymentForm.type === 0 && (
              <>
                                <TextInput
                  style={styles.input}
                  placeholder="Card Holder Name"
                  value={paymentForm.cardHolderName}
                  onChangeText={(text) => setPaymentForm({ ...paymentForm, cardHolderName: text })}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Card Number"
                  value={paymentForm.cardNumber}
                  onChangeText={(text) => setPaymentForm({ ...paymentForm, cardNumber: text })}
                  keyboardType="numeric"
                />
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  userInfo: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  addButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addButtonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  settingItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: Colors.text,
  },
  settingArrow: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  paymentMethodItem: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 2,
  },
  cardType: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 2,
  },
  cardNumber: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
  },
  paypalEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentMethodActions: {
    flexDirection: 'row',
  },
  editButton: {
    backgroundColor: Colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  editButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.error,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  deleteButtonText: {
    color: Colors.surface,
    fontSize: 12,
    fontWeight: '600',
  },
  noPaymentMethods: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 24,
    backgroundColor: Colors.surface,
    borderRadius: 12,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    padding: 24,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    alignItems: 'center',
    marginTop: 32,
  },
  logoutButtonText: {
    color: Colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  cancelButton: {
    color: Colors.primary,
    fontSize: 16,
  },
  saveButton: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 8,
    padding: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  selectedTypeOption: {
    borderColor: Colors.primary,
  },
  typeOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
});