import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import theme from '../config/theme';

/**
 * Subscription Screen - Plans & Pricing
 * Modern design with gradient cards and professional layout
 */
const SubscriptionScreen = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'Forever',
      description: 'Basic features for casual users',
      gradient: [theme.colors.gray400, theme.colors.gray500],
      features: [
        { name: 'View nearby stations', included: true },
        { name: 'Basic station info', included: true },
        { name: 'View prices', included: false },
        { name: 'Order delivery', included: false },
        { name: 'Priority support', included: false },
        { name: 'Discounts', included: false },
      ],
      popular: false,
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      period: 'month',
      description: 'Essential features for regular users',
      gradient: theme.gradients.primary.colors,
      features: [
        { name: 'View nearby stations', included: true },
        { name: 'Detailed station info', included: true },
        { name: 'View prices', included: true },
        { name: 'Order delivery', included: true },
        { name: 'Priority support', included: false },
        { name: '5% discount on orders', included: true },
      ],
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 59,
      period: 'month',
      description: 'Full access with premium benefits',
      gradient: theme.gradients.secondary.colors,
      features: [
        { name: 'All Basic features', included: true },
        { name: 'Advanced filtering', included: true },
        { name: 'Real-time tracking', included: true },
        { name: 'Unlimited orders', included: true },
        { name: '24/7 Priority support', included: true },
        { name: '15% discount on orders', included: true },
      ],
      popular: false,
    },
  ];

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan.id);
    if (plan.id === 'free') {
      Alert.alert('Free Plan', 'You are already on the free plan!');
    } else {
      Alert.alert(
        'Subscribe to ' + plan.name,
        `This will charge ZMW ${plan.price} per ${plan.period}.\n\nProceed with subscription?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Subscribe',
            onPress: () => {
              Alert.alert('Success', `You are now subscribed to ${plan.name} plan!`);
            },
          },
        ]
      );
    }
  };

  const renderFeature = (feature) => (
    <View key={feature.name} style={styles.featureRow}>
      <MaterialCommunityIcons
        name={feature.included ? 'check-circle' : 'close-circle'}
        size={18}
        color={feature.included ? theme.colors.success : theme.colors.gray300}
      />
      <Text
        style={[
          styles.featureText,
          !feature.included && styles.featureTextDisabled,
        ]}
      >
        {feature.name}
      </Text>
    </View>
  );

  const renderPlanCard = (plan) => (
    <View key={plan.id} style={styles.planCardWrapper}>
      {plan.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularBadgeText}>MOST POPULAR</Text>
        </View>
      )}

      <LinearGradient
        colors={plan.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.planCard, plan.popular && styles.planCardPopular]}
      >
        {/* Plan Header */}
        <View style={styles.planHeader}>
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planDescription}>{plan.description}</Text>
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <View style={styles.priceRow}>
            <Text style={styles.currency}>ZMW</Text>
            <Text style={styles.price}>{plan.price}</Text>
          </View>
          <Text style={styles.period}>per {plan.period}</Text>
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[
            styles.subscribeButton,
            selectedPlan === plan.id && styles.subscribeButtonSelected,
          ]}
          onPress={() => handleSelectPlan(plan)}
        >
          <Text style={styles.subscribeButtonText}>
            {plan.id === 'free' ? 'Current Plan' : 'Choose Plan'}
          </Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Features List */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Features included:</Text>
        {plan.features.map(renderFeature)}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="crown-outline"
          size={48}
          color={theme.colors.secondary}
        />
        <Text style={styles.headerTitle}>Choose Your Plan</Text>
        <Text style={styles.headerSubtitle}>
          Select the perfect plan for your gas refill needs
        </Text>
      </View>

      {/* Plans */}
      <View style={styles.plansContainer}>
        {plans.map(renderPlanCard)}
      </View>

      {/* Benefits Section */}
      <View style={styles.benefitsSection}>
        <Text style={styles.sectionTitle}>Why Subscribe?</Text>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <MaterialCommunityIcons
              name="lightning-bolt"
              size={28}
              color={theme.colors.secondary}
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Fast Delivery</Text>
            <Text style={styles.benefitText}>
              Get your LPG gas delivered to your doorstep within hours
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <MaterialCommunityIcons
              name="shield-check"
              size={28}
              color={theme.colors.success}
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Secure Payments</Text>
            <Text style={styles.benefitText}>
              Safe and encrypted payment processing for all transactions
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <MaterialCommunityIcons
              name="percent"
              size={28}
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>Great Discounts</Text>
            <Text style={styles.benefitText}>
              Save money with exclusive member discounts on every order
            </Text>
          </View>
        </View>

        <View style={styles.benefitCard}>
          <View style={styles.benefitIconContainer}>
            <MaterialCommunityIcons
              name="headset"
              size={28}
              color={theme.colors.info}
            />
          </View>
          <View style={styles.benefitContent}>
            <Text style={styles.benefitTitle}>24/7 Support</Text>
            <Text style={styles.benefitText}>
              Premium members get round-the-clock customer support
            </Text>
          </View>
        </View>
      </View>

      {/* FAQ Section */}
      <View style={styles.faqSection}>
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

        <View style={styles.faqCard}>
          <Text style={styles.faqQuestion}>Can I cancel anytime?</Text>
          <Text style={styles.faqAnswer}>
            Yes, you can cancel your subscription at any time from your account settings.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.faqQuestion}>How does billing work?</Text>
          <Text style={styles.faqAnswer}>
            You will be charged monthly on the date you subscribed. You can update your payment method anytime.
          </Text>
        </View>

        <View style={styles.faqCard}>
          <Text style={styles.faqQuestion}>What payment methods are accepted?</Text>
          <Text style={styles.faqAnswer}>
            We accept MTN Mobile Money, Airtel Money, Zamtel Money, and credit/debit cards.
          </Text>
        </View>
      </View>

      <View style={styles.bottomSpace} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    alignItems: 'center',
    paddingVertical: theme.spacing['2xl'],
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  plansContainer: {
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing['2xl'],
  },
  planCardWrapper: {
    marginBottom: theme.spacing.lg,
  },
  popularBadge: {
    backgroundColor: theme.colors.secondary,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    alignItems: 'center',
  },
  popularBadgeText: {
    color: theme.colors.white,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 1,
  },
  planCard: {
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xl,
    ...theme.shadows.lg,
  },
  planCardPopular: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  planHeader: {
    marginBottom: theme.spacing.lg,
  },
  planName: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginBottom: theme.spacing.xs,
  },
  planDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },
  priceContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  currency: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.white,
    marginTop: theme.spacing.sm,
    marginRight: theme.spacing.xs,
  },
  price: {
    fontSize: theme.typography.fontSize['5xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.white,
  },
  period: {
    fontSize: theme.typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: theme.spacing.xs,
  },
  subscribeButton: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.radius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.md,
  },
  subscribeButtonSelected: {
    backgroundColor: theme.colors.success,
  },
  subscribeButtonText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
  },
  featuresContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    ...theme.shadows.sm,
  },
  featuresTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  featureText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  featureTextDisabled: {
    color: theme.colors.textTertiary,
    textDecorationLine: 'line-through',
  },
  benefitsSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing['2xl'],
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.lg,
  },
  benefitCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    ...theme.shadows.sm,
  },
  benefitIconContainer: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.backgroundAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  benefitText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.normal * theme.typography.fontSize.sm,
  },
  faqSection: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing['2xl'],
  },
  faqCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
    ...theme.shadows.sm,
  },
  faqQuestion: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
  },
  faqAnswer: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.sm,
  },
  bottomSpace: {
    height: theme.spacing['2xl'],
  },
});

export default SubscriptionScreen;
