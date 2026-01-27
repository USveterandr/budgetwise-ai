import RevenueCatUI, { PAYWALL_RESULT } from "react-native-purchases-ui";

// The Paywall UI is configured in the RevenueCat Dashboard.
// Products (monthly, yearly, lifetime) should be attached to the 'Default' offering.
export async function presentPaywall(): Promise<boolean> {
    
    try {
        // Present paywall for current offering with close button enabled
        const paywallResult: PAYWALL_RESULT = await RevenueCatUI.presentPaywall({
            displayCloseButton: true,
        });
        
        switch (paywallResult) {
            case PAYWALL_RESULT.PURCHASED:
            case PAYWALL_RESULT.RESTORED:
                return true;
            case PAYWALL_RESULT.NOT_PRESENTED:
            case PAYWALL_RESULT.ERROR:
            case PAYWALL_RESULT.CANCELLED:
            default:
                return false;
        }
    } catch (e) {
        console.error("Paywall presentation error:", e);
        return false;
    }
}

// Present the custom paywall component
export async function presentCustomPaywall(): Promise<boolean> {
    // This function would typically trigger a state change to show the CustomPaywall component
    // For now, we'll return true to indicate the paywall should be shown
    console.log("Custom paywall requested");
    return true;
}

// Get available subscription plans
export async function getSubscriptionPlans() {
    // In a real implementation, this would fetch from RevenueCat or our own service
    return [
        { id: 'starter', name: 'Starter', price: 9.99 },
        { id: 'professional', name: 'Professional', price: 19.99 },
        { id: 'business', name: 'Business', price: 39.99 },
        { id: 'enterprise', name: 'Enterprise', price: 99.99 }
    ];
}
