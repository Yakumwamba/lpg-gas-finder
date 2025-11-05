/**
 * Payment Service
 * Handles wallet operations and payment processing
 */

// Mock user wallet data - In production, this should be fetched from backend
let userWallet = {
  balance: 250.0,
  currency: 'ZMW',
  subscriptionName: 'Free',
  subscriptionTier: 'free',
  features: {
    viewPrices: false,
    orderDelivery: false,
    priority: false,
    discounts: 0,
  },
};

// Mock transaction history
let transactions = [
  {
    id: 'txn_001',
    type: 'deposit',
    amount: 500.0,
    description: 'Added money to wallet',
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'txn_002',
    type: 'gas_order',
    amount: -150.0,
    description: 'LPG Gas - 13kg cylinder',
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
  {
    id: 'txn_003',
    type: 'gas_order',
    amount: -100.0,
    description: 'LPG Gas - 9kg cylinder',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    status: 'completed',
  },
];

const paymentService = {
  /**
   * Get user wallet information
   */
  getUserWallet() {
    return { ...userWallet };
  },

  /**
   * Get transaction history
   */
  getTransactionHistory() {
    return [...transactions].sort((a, b) =>
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  /**
   * Add money to wallet
   * @param {number} amount - Amount to add
   * @param {string} paymentMethod - Payment method used
   * @returns {Promise<Object>} Transaction result
   */
  async addMoney(amount, paymentMethod) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject({ success: false, error: 'Invalid amount' });
          return;
        }

        // Create transaction record
        const transaction = {
          id: `txn_${Date.now()}`,
          type: 'deposit',
          amount: amount,
          description: `Added money via ${paymentMethod}`,
          timestamp: new Date().toISOString(),
          status: 'completed',
        };

        // Update wallet balance
        userWallet.balance += amount;
        transactions.unshift(transaction);

        resolve({
          success: true,
          transaction,
          newBalance: userWallet.balance,
        });
      }, 1500); // Simulate API delay
    });
  },

  /**
   * Process payment for gas order
   * @param {number} amount - Amount to deduct
   * @param {string} description - Order description
   * @returns {Promise<Object>} Transaction result
   */
  async processPayment(amount, description) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (amount <= 0) {
          reject({ success: false, error: 'Invalid amount' });
          return;
        }

        if (userWallet.balance < amount) {
          reject({ success: false, error: 'Insufficient balance' });
          return;
        }

        // Apply discount if applicable
        let finalAmount = amount;
        if (userWallet.features.discounts > 0) {
          const discount = (amount * userWallet.features.discounts) / 100;
          finalAmount = amount - discount;
        }

        // Create transaction record
        const transaction = {
          id: `txn_${Date.now()}`,
          type: 'gas_order',
          amount: -finalAmount,
          description: description || 'LPG Gas Order',
          timestamp: new Date().toISOString(),
          status: 'completed',
        };

        // Update wallet balance
        userWallet.balance -= finalAmount;
        transactions.unshift(transaction);

        resolve({
          success: true,
          transaction,
          newBalance: userWallet.balance,
          discountApplied: userWallet.features.discounts > 0,
          discountAmount: amount - finalAmount,
        });
      }, 1500); // Simulate API delay
    });
  },

  /**
   * Update subscription plan
   * @param {string} planId - Plan ID (free, basic, premium)
   * @returns {Promise<Object>} Result
   */
  async updateSubscription(planId) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const plans = {
          free: {
            name: 'Free',
            tier: 'free',
            features: {
              viewPrices: false,
              orderDelivery: false,
              priority: false,
              discounts: 0,
            },
          },
          basic: {
            name: 'Basic',
            tier: 'basic',
            features: {
              viewPrices: true,
              orderDelivery: true,
              priority: false,
              discounts: 5,
            },
          },
          premium: {
            name: 'Premium',
            tier: 'premium',
            features: {
              viewPrices: true,
              orderDelivery: true,
              priority: true,
              discounts: 15,
            },
          },
        };

        const plan = plans[planId];
        if (!plan) {
          reject({ success: false, error: 'Invalid plan' });
          return;
        }

        userWallet.subscriptionName = plan.name;
        userWallet.subscriptionTier = plan.tier;
        userWallet.features = plan.features;

        resolve({
          success: true,
          subscription: {
            name: plan.name,
            tier: plan.tier,
            features: plan.features,
          },
        });
      }, 1000);
    });
  },

  /**
   * Check if user can place order
   * @param {number} orderAmount - Order amount
   * @returns {boolean} Whether user can place order
   */
  canPlaceOrder(orderAmount) {
    return userWallet.features.orderDelivery && userWallet.balance >= orderAmount;
  },

  /**
   * Get available payment methods
   */
  getPaymentMethods() {
    return [
      { id: 'mtn', name: 'MTN Mobile Money', icon: 'cellphone' },
      { id: 'airtel', name: 'Airtel Money', icon: 'cellphone' },
      { id: 'zamtel', name: 'Zamtel Money', icon: 'cellphone' },
      { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
    ];
  },
};

export default paymentService;
