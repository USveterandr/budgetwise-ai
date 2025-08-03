const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Subscription tier configuration
const SUBSCRIPTION_TIERS = {
  free: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Basic budgeting',
      'Cash flow tracking',
      'Subscription management'
    ]
  },
  personal_plus: {
    name: 'Personal Plus',
    price: 6.97,
    priceId: process.env.STRIPE_PERSONAL_PLUS_PRICE_ID,
    features: [
      'Everything in Free',
      'Net worth tracking',
      'Investment portfolio syncing',
      'Sankey diagrams'
    ]
  },
  investor: {
    name: 'Investor',
    price: 15.97,
    priceId: process.env.STRIPE_INVESTOR_PRICE_ID,
    features: [
      'Everything in Personal Plus',
      'Monte Carlo retirement simulator',
      'Stock option modeling',
      'Tax planning tools'
    ]
  },
  business_pro_elite: {
    name: 'Business Pro Elite',
    price: 29.97,
    priceId: process.env.STRIPE_BUSINESS_PRO_ELITE_PRICE_ID,
    features: [
      'Everything in Investor',
      'Team financial GPS (5 users)',
      'Magic Receipt AI',
      'Profit forecasting',
      'Employee spending controls'
    ]
  }
};

class StripeService {
  // Create a new customer
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata
      });
      return customer;
    } catch (error) {
      console.error('Error creating Stripe customer:', error);
      throw error;
    }
  }

  // Create a checkout session for subscription
  async createCheckoutSession(customerId, priceId, successUrl, cancelUrl, metadata = {}) {
    try {
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
        subscription_data: {
          trial_period_days: 14, // 14-day free trial
          metadata
        },
        allow_promotion_codes: true,
      });
      return session;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  // Create a billing portal session
  async createBillingPortalSession(customerId, returnUrl) {
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
      });
      return session;
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
  }

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      return subscription;
    } catch (error) {
      console.error('Error retrieving subscription:', error);
      throw error;
    }
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId, cancelAtPeriodEnd = true) {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: cancelAtPeriodEnd,
      });
      return subscription;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  // Update subscription
  async updateSubscription(subscriptionId, priceId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(subscriptionId);
      
      const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
        items: [{
          id: subscription.items.data[0].id,
          price: priceId,
        }],
        proration_behavior: 'create_prorations',
      });
      
      return updatedSubscription;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }

  // Get customer's payment methods
  async getPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });
      return paymentMethods;
    } catch (error) {
      console.error('Error retrieving payment methods:', error);
      throw error;
    }
  }

  // Create a setup intent for saving payment method
  async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ['card'],
      });
      return setupIntent;
    } catch (error) {
      console.error('Error creating setup intent:', error);
      throw error;
    }
  }

  // Get subscription tier from price ID
  getSubscriptionTierFromPriceId(priceId) {
    for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
      if (config.priceId === priceId) {
        return tier;
      }
    }
    return 'free';
  }

  // Get subscription tier configuration
  getSubscriptionTierConfig(tier) {
    return SUBSCRIPTION_TIERS[tier] || SUBSCRIPTION_TIERS.free;
  }

  // Get all subscription tiers
  getAllSubscriptionTiers() {
    return SUBSCRIPTION_TIERS;
  }

  // Handle webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          return await this.handleCheckoutCompleted(event.data.object);
        
        case 'invoice.payment_succeeded':
          return await this.handlePaymentSucceeded(event.data.object);
        
        case 'invoice.payment_failed':
          return await this.handlePaymentFailed(event.data.object);
        
        case 'customer.subscription.updated':
          return await this.handleSubscriptionUpdated(event.data.object);
        
        case 'customer.subscription.deleted':
          return await this.handleSubscriptionDeleted(event.data.object);
        
        case 'customer.subscription.trial_will_end':
          return await this.handleTrialWillEnd(event.data.object);
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
          return { received: true };
      }
    } catch (error) {
      console.error('Error handling webhook event:', error);
      throw error;
    }
  }

  // Handle checkout session completed
  async handleCheckoutCompleted(session) {
    const User = require('../models/User');
    
    try {
      const customerId = session.customer;
      const subscriptionId = session.subscription;
      
      if (subscriptionId) {
        const subscription = await this.getSubscription(subscriptionId);
        const tier = this.getSubscriptionTierFromPriceId(subscription.items.data[0].price.id);
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            stripeSubscriptionId: subscriptionId,
            subscriptionTier: tier,
            subscriptionStatus: subscription.status,
            subscriptionStartDate: new Date(subscription.current_period_start * 1000),
            subscriptionEndDate: new Date(subscription.current_period_end * 1000),
            trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
          }
        );
      }
      
      return { received: true };
    } catch (error) {
      console.error('Error handling checkout completed:', error);
      throw error;
    }
  }

  // Handle payment succeeded
  async handlePaymentSucceeded(invoice) {
    const User = require('../models/User');
    
    try {
      const customerId = invoice.customer;
      const subscriptionId = invoice.subscription;
      
      if (subscriptionId) {
        const subscription = await this.getSubscription(subscriptionId);
        
        await User.findOneAndUpdate(
          { stripeCustomerId: customerId },
          {
            subscriptionStatus: 'active',
            subscriptionEndDate: new Date(subscription.current_period_end * 1000)
          }
        );
      }
      
      return { received: true };
    } catch (error) {
      console.error('Error handling payment succeeded:', error);
      throw error;
    }
  }

  // Handle payment failed
  async handlePaymentFailed(invoice) {
    const User = require('../models/User');
    
    try {
      const customerId = invoice.customer;
      
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        { subscriptionStatus: 'past_due' }
      );
      
      return { received: true };
    } catch (error) {
      console.error('Error handling payment failed:', error);
      throw error;
    }
  }

  // Handle subscription updated
  async handleSubscriptionUpdated(subscription) {
    const User = require('../models/User');
    
    try {
      const customerId = subscription.customer;
      const tier = this.getSubscriptionTierFromPriceId(subscription.items.data[0].price.id);
      
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          subscriptionTier: tier,
          subscriptionStatus: subscription.status,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000),
          trialEndDate: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null
        }
      );
      
      return { received: true };
    } catch (error) {
      console.error('Error handling subscription updated:', error);
      throw error;
    }
  }

  // Handle subscription deleted
  async handleSubscriptionDeleted(subscription) {
    const User = require('../models/User');
    
    try {
      const customerId = subscription.customer;
      
      await User.findOneAndUpdate(
        { stripeCustomerId: customerId },
        {
          subscriptionTier: 'free',
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null,
          subscriptionEndDate: new Date(subscription.current_period_end * 1000)
        }
      );
      
      return { received: true };
    } catch (error) {
      console.error('Error handling subscription deleted:', error);
      throw error;
    }
  }

  // Handle trial will end
  async handleTrialWillEnd(subscription) {
    // This is where you would send notification emails
    console.log(`Trial ending soon for subscription: ${subscription.id}`);
    return { received: true };
  }

  // Construct webhook event from raw body
  constructWebhookEvent(rawBody, signature) {
    try {
      return stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Error constructing webhook event:', error);
      throw error;
    }
  }
}

module.exports = new StripeService();