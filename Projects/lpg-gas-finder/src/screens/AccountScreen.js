import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import paymentService from '../services/paymentService';
import PaymentModal from '../components/PaymentModal';
import theme from '../config/theme';
import { useAuth } from '../context/AuthContext';

const AccountScreen = () => {
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [wallet, setWallet] = useState(paymentService.getUserWallet());
  const [activeTab, setActiveTab] = useState('overview'); // overview, transactions
  const transactions = paymentService.getTransactionHistory();
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleAddMoney = () => {
    setPaymentModalVisible(true);
  };

  const handlePaymentSuccess = (result) => {
    setPaymentModalVisible(false);
    setWallet(paymentService.getUserWallet());
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', onPress: () => {}, style: 'cancel' },
        {
          text: 'Sign Out',
          onPress: async () => {
            setIsSigningOut(true);
            try {
              await signOut();
            } catch (err) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setIsSigningOut(false);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  const renderTransactionItem = ({ item, index }) => {
    const isDebit = item.amount < 0;
    const isGasOrder = item.type === 'gas_order';

    return (
      <View style={styles.transactionItem}>
        <View style={styles.transactionLeft}>
          <View
            style={[
              styles.transactionIcon,
              isGasOrder && styles.transactionIconOrder,
            ]}
          >
            <MaterialCommunityIcons
              name={isGasOrder ? 'gas-cylinder' : 'wallet-plus'}
              size={20}
              color={isGasOrder ? theme.colors.secondary : theme.colors.success}
            />
          </View>
          <View>
            <Text style={styles.transactionDescription}>{item.description}</Text>
            <Text style={styles.transactionDate}>
              {new Date(item.timestamp).toLocaleDateString()}
            </Text>
          </View>
        </View>
        <View style={styles.transactionRight}>
          <Text
            style={[
              styles.transactionAmount,
              isDebit && styles.transactionAmountDebit,
            ]}
          >
            {isDebit ? '−' : '+'}ZMW {Math.abs(item.amount).toLocaleString()}
          </Text>
          <Text
            style={[
              styles.transactionStatus,
              item.status === 'completed' && styles.transactionStatusCompleted,
            ]}
          >
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.profileIcon}>
            <MaterialCommunityIcons name="account-circle" size={60} color={theme.colors.secondary} />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'User'}</Text>
            <Text style={styles.profilePhone}>{user?.email || '+260 123 456 789'}</Text>
            <View style={styles.memberBadge}>
              <MaterialCommunityIcons name="star" size={14} color={theme.colors.secondary} />
              <Text style={styles.memberBadgeText}>
                {wallet.subscriptionName} Member
              </Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={handleSignOut}
            disabled={isSigningOut}
            style={styles.signOutButton}
          >
            {isSigningOut ? (
              <ActivityIndicator size="small" color={theme.colors.secondary} />
            ) : (
              <MaterialCommunityIcons name="logout" size={24} color={theme.colors.secondary} />
            )}
          </TouchableOpacity>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletTop}>
            <View>
              <Text style={styles.walletLabel}>Available Balance</Text>
              <Text style={styles.walletAmount}>
                ZMW {wallet.balance.toLocaleString()}
              </Text>
            </View>
            <MaterialCommunityIcons name="wallet" size={50} color={theme.colors.secondary} />
          </View>

          <View style={styles.walletActions}>
            <TouchableOpacity style={styles.walletActionBtn} onPress={handleAddMoney}>
              <MaterialCommunityIcons name="plus" size={20} color="white" />
              <Text style={styles.walletActionText}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.walletActionBtn}>
              <MaterialCommunityIcons name="send" size={20} color="white" />
              <Text style={styles.walletActionText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Subscription Status Card */}
        <View style={styles.subscriptionCard}>
          <View style={styles.subscriptionHeader}>
            <View>
              <Text style={styles.subscriptionLabel}>Current Plan</Text>
              <Text style={styles.subscriptionName}>{wallet.subscriptionName}</Text>
            </View>
            {wallet.subscriptionName !== 'Free' && (
              <View style={styles.subscriptionBadge}>
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.success} />
              </View>
            )}
          </View>

          <View style={styles.subscriptionFeatures}>
            <View style={styles.subscriptionFeature}>
              <MaterialCommunityIcons
                name={wallet.features.viewPrices ? 'check' : 'close'}
                size={16}
                color={wallet.features.viewPrices ? theme.colors.success : theme.colors.textTertiary}
              />
              <Text style={styles.subscriptionFeatureText}>View Prices</Text>
            </View>
            <View style={styles.subscriptionFeature}>
              <MaterialCommunityIcons
                name={wallet.features.orderDelivery ? 'check' : 'close'}
                size={16}
                color={wallet.features.orderDelivery ? theme.colors.success : theme.colors.textTertiary}
              />
              <Text style={styles.subscriptionFeatureText}>Order Delivery</Text>
            </View>
            <View style={styles.subscriptionFeature}>
              <MaterialCommunityIcons
                name={wallet.features.priority ? 'check' : 'close'}
                size={16}
                color={wallet.features.priority ? theme.colors.success : theme.colors.textTertiary}
              />
              <Text style={styles.subscriptionFeatureText}>Priority Support</Text>
            </View>
          </View>

          {wallet.features.discounts > 0 && (
            <View style={styles.discountBox}>
              <MaterialCommunityIcons name="percent" size={20} color={theme.colors.secondary} />
              <Text style={styles.discountText}>
                Get {wallet.features.discounts}% discount on all orders
              </Text>
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'overview' && styles.tabActive]}
            onPress={() => setActiveTab('overview')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.tabTextActive,
              ]}
            >
              Overview
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
            onPress={() => setActiveTab('transactions')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'transactions' && styles.tabTextActive,
              ]}
            >
              Transactions
            </Text>
          </TouchableOpacity>
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View style={styles.overviewSection}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="gas-cylinder" size={32} color={theme.colors.secondary} />
                <Text style={styles.statValue}>12</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="star" size={32} color={theme.colors.warning} />
                <Text style={styles.statValue}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialCommunityIcons name="calendar-check" size={32} color={theme.colors.success} />
                <Text style={styles.statValue}>25</Text>
                <Text style={styles.statLabel}>Days</Text>
              </View>
            </View>

            <View style={styles.quickActionsSection}>
              <Text style={styles.sectionTitle}>Quick Actions</Text>
              <TouchableOpacity style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <MaterialCommunityIcons name="history" size={24} color={theme.colors.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Order History</Text>
                  <Text style={styles.actionSubtitle}>View all past orders</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <MaterialCommunityIcons name="map-marker" size={24} color={theme.colors.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Delivery Addresses</Text>
                  <Text style={styles.actionSubtitle}>Manage your addresses</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <View style={styles.actionIcon}>
                  <MaterialCommunityIcons name="help-circle" size={24} color={theme.colors.secondary} />
                </View>
                <View style={styles.actionContent}>
                  <Text style={styles.actionTitle}>Support</Text>
                  <Text style={styles.actionSubtitle}>Contact customer service</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color={theme.colors.textTertiary} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <View style={styles.transactionsSection}>
            {transactions.length > 0 ? (
              <FlatList
                data={transactions}
                renderItem={renderTransactionItem}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="receipt" size={48} color={theme.colors.textTertiary} />
                <Text style={styles.emptyStateText}>No transactions yet</Text>
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Payment Modal */}
      <PaymentModal
        visible={paymentModalVisible}
        onClose={() => setPaymentModalVisible(false)}
        onPaymentSuccess={handlePaymentSuccess}
        paymentType="deposit"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: 20,
    alignItems: 'center',
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    justifyContent: 'space-between',
  },
  profileIcon: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: `${theme.colors.primaryLight}33`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    marginBottom: 8,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}1A`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  memberBadgeText: {
    fontSize: 11,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary,
  },
  walletCard: {
    backgroundColor: theme.colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FFD9D9',
  },
  walletTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 4,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.secondary,
  },
  walletActions: {
    flexDirection: 'row',
    gap: 12,
  },
  walletActionBtn: {
    flex: 1,
    backgroundColor: theme.colors.secondary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  walletActionText: {
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  subscriptionCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  subscriptionLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.medium,
    marginBottom: 4,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
  },
  subscriptionBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  subscriptionFeature: {
    alignItems: 'center',
    gap: 6,
  },
  subscriptionFeatureText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.fontWeight.medium,
  },
  discountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}1A`,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  discountText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: theme.colors.secondary,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textTertiary,
  },
  tabTextActive: {
    color: theme.colors.secondary,
  },
  overviewSection: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 4,
  },
  quickActionsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: 12,
  },
  actionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: `${theme.colors.primaryLight}33`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  transactionsSection: {
    padding: 16,
  },
  transactionItem: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  transactionIcon: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  transactionIconOrder: {
    backgroundColor: `${theme.colors.primaryLight}33`,
  },
  transactionDescription: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
  },
  transactionDate: {
    fontSize: 11,
    color: theme.colors.textTertiary,
    marginTop: 2,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.success,
  },
  transactionAmountDebit: {
    color: theme.colors.secondary,
  },
  transactionStatus: {
    fontSize: 10,
    color: theme.colors.textTertiary,
    marginTop: 2,
    fontWeight: theme.typography.fontWeight.medium,
  },
  transactionStatusCompleted: {
    color: theme.colors.success,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textTertiary,
    marginTop: 12,
  },
  bottomSpace: {
    height: 20,
  },
  signOutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${theme.colors.secondary}1A`,
  },
});

export default AccountScreen;
