const stripeService = require('../services/stripeService');
const User = require('../models/User');

class SubscriptionController {
  // Get all subscription tiers
  async getSubscriptionTiers(req, res) {
    try {
      const tiers = stripeService.getAllSubscriptionTiers();
      res.json({
        success: true,
        data: tiers
      });
    } catch (error) {
      console.error('Error getting subscription tiers:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription tiers'
      });
    }
  }

  // Create checkout session
  async createCheckoutSession(req, res) {
    try {
      const { planKey, isAnnual, successUrl, cancelUrl } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get subscription tier config
      const tierConfig = stripeService.getSubscriptionTierConfig(planKey);
      if (!tierConfig || !tierConfig.priceId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          user.email,
          `${user.firstName} ${user.lastName}`,
          { userId: userId.toString() }
        );
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await User.findByIdAndUpdate(userId, {
          stripeCustomerId: customerId
        });
      }

      // Create checkout session
      const session = await stripeService.createCheckoutSession(
        customerId,
        tierConfig.priceId,
        successUrl,
        cancelUrl,
        {
          userId: userId.toString(),
          planKey,
          isAnnual: isAnnual.toString()
        }
      );

      res.json({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id
      });
    } catch (error) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create checkout session'
      });
    }
  }

  // Create billing portal session
  async createBillingPortalSession(req, res) {
    try {
      const { returnUrl } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          message: 'User or Stripe customer not found'
        });
      }

      // Create billing portal session
      const session = await stripeService.createBillingPortalSession(
        user.stripeCustomerId,
        returnUrl
      );

      res.json({
        success: true,
        portalUrl: session.url
      });
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create billing portal session'
      });
    }
  }

  // Get user's subscription status
  async getSubscriptionStatus(req, res) {
    try {
      const userId = req.user.id;

      // Get user with subscription info
      const user = await User.findById(userId).select(
        'subscriptionTier subscriptionStatus subscriptionStartDate subscriptionEndDate trialEndDate stripeCustomerId stripeSubscriptionId'
      );

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get subscription tier config
      const tierConfig = stripeService.getSubscriptionTierConfig(user.subscriptionTier);

      // Get Stripe subscription details if available
      let stripeSubscription = null;
      if (user.stripeSubscriptionId) {
        try {
          stripeSubscription = await stripeService.getSubscription(user.stripeSubscriptionId);
        } catch (error) {
          console.error('Error fetching Stripe subscription:', error);
        }
      }

      res.json({
        success: true,
        data: {
          tier: user.subscriptionTier,
          tierConfig,
          status: user.subscriptionStatus,
          startDate: user.subscriptionStartDate,
          endDate: user.subscriptionEndDate,
          trialEndDate: user.trialEndDate,
          isActive: user.isSubscriptionActive(),
          displayName: user.getSubscriptionDisplayName(),
          stripeSubscription: stripeSubscription ? {
            id: stripeSubscription.id,
            status: stripeSubscription.status,
            currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
            cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
            trialEnd: stripeSubscription.trial_end ? new Date(stripeSubscription.trial_end * 1000) : null
          } : null
        }
      });
    } catch (error) {
      console.error('Error getting subscription status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get subscription status'
      });
    }
  }

  // Update subscription
  async updateSubscription(req, res) {
    try {
      const { planKey } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({
          success: false,
          message: 'User or subscription not found'
        });
      }

      // Get new tier config
      const tierConfig = stripeService.getSubscriptionTierConfig(planKey);
      if (!tierConfig || !tierConfig.priceId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subscription plan'
        });
      }

      // Update subscription in Stripe
      const updatedSubscription = await stripeService.updateSubscription(
        user.stripeSubscriptionId,
        tierConfig.priceId
      );

      // Update user in database
      await User.findByIdAndUpdate(userId, {
        subscriptionTier: planKey,
        subscriptionStatus: updatedSubscription.status,
        subscriptionEndDate: new Date(updatedSubscription.current_period_end * 1000)
      });

      res.json({
        success: true,
        message: 'Subscription updated successfully',
        data: {
          tier: planKey,
          status: updatedSubscription.status
        }
      });
    } catch (error) {
      console.error('Error updating subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update subscription'
      });
    }
  }

  // Cancel subscription
  async cancelSubscription(req, res) {
    try {
      const { cancelAtPeriodEnd = true } = req.body;
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.stripeSubscriptionId) {
        return res.status(404).json({
          success: false,
          message: 'User or subscription not found'
        });
      }

      // Cancel subscription in Stripe
      const canceledSubscription = await stripeService.cancelSubscription(
        user.stripeSubscriptionId,
        cancelAtPeriodEnd
      );

      // Update user in database if immediate cancellation
      if (!cancelAtPeriodEnd) {
        await User.findByIdAndUpdate(userId, {
          subscriptionTier: 'free',
          subscriptionStatus: 'cancelled',
          stripeSubscriptionId: null
        });
      }

      res.json({
        success: true,
        message: cancelAtPeriodEnd 
          ? 'Subscription will be canceled at the end of the current period'
          : 'Subscription canceled immediately',
        data: {
          cancelAtPeriodEnd: canceledSubscription.cancel_at_period_end,
          periodEnd: new Date(canceledSubscription.current_period_end * 1000)
        }
      });
    } catch (error) {
      console.error('Error canceling subscription:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel subscription'
      });
    }
  }

  // Handle Stripe webhooks
  async handleWebhook(req, res) {
    try {
      const signature = req.headers['stripe-signature'];
      
      // Construct webhook event
      const event = stripeService.constructWebhookEvent(req.body, signature);
      
      // Handle the event
      await stripeService.handleWebhookEvent(event);
      
      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook error'
      });
    }
  }

  // Get payment methods
  async getPaymentMethods(req, res) {
    try {
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user || !user.stripeCustomerId) {
        return res.status(404).json({
          success: false,
          message: 'User or Stripe customer not found'
        });
      }

      // Get payment methods
      const paymentMethods = await stripeService.getPaymentMethods(user.stripeCustomerId);

      res.json({
        success: true,
        data: paymentMethods.data.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year
          } : null
        }))
      });
    } catch (error) {
      console.error('Error getting payment methods:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get payment methods'
      });
    }
  }

  // Create setup intent for saving payment method
  async createSetupIntent(req, res) {
    try {
      const userId = req.user.id;

      // Get user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripeService.createCustomer(
          user.email,
          `${user.firstName} ${user.lastName}`,
          { userId: userId.toString() }
        );
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        await User.findByIdAndUpdate(userId, {
          stripeCustomerId: customerId
        });
      }

      // Create setup intent
      const setupIntent = await stripeService.createSetupIntent(customerId);

      res.json({
        success: true,
        clientSecret: setupIntent.client_secret
      });
    } catch (error) {
      console.error('Error creating setup intent:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create setup intent'
      });
    }
  }
}

module.exports = new SubscriptionController();