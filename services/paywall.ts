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
