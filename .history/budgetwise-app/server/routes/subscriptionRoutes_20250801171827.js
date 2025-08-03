const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController');
const auth = require('../middleware/auth');

// Get subscription tiers
router.get('/tiers', subscriptionController.getSubscriptionTiers);

// Create checkout session
router.post('/create-checkout-session', auth, subscriptionController.createCheckoutSession);

// Create billing portal session
router.post('/create-billing-portal-session', auth, subscriptionController.createBillingPortalSession);

// Get user's subscription status
router.get('/status', auth, subscriptionController.getSubscriptionStatus);

// Update subscription
router.put('/update', auth, subscriptionController.updateSubscription);

// Cancel subscription
router.delete('/cancel', auth, subscriptionController.cancelSubscription);

// Webhook endpoint for Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), subscriptionController.handleWebhook);

// Get payment methods
router.get('/payment-methods', auth, subscriptionController.getPaymentMethods);

// Create setup intent for saving payment method
router.post('/create-setup-intent', auth, subscriptionController.createSetupIntent);

module.exports = router;