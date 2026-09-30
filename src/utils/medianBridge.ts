/**
 * MEAT GHAR - MEDIAN.CO (GONATIVE) NATIVE BRIDGE UTILITY
 * 
 * This file handles native app integration features when the web application
 * is compiled into an Android APK / iOS App using Median.co (GoNative).
 * 
 * Features:
 * 1. Push Notification auto-registration
 * 2. Push Notification tagging (sync user phone/name with push tokens)
 * 3. Smart Android APK Google Login (Native popup tab prevention)
 */

import { supabase } from '../lib/supabase';

// Helper to check if the app is currently running inside Median.co (GoNative) container
export function isMedianApp(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Detect GoNative/Median user agent string or global bridge objects
  const userAgent = navigator.userAgent || '';
  const isGoNativeUA = userAgent.includes('GoNative') || userAgent.includes('Median');
  const hasGlobalBridge = !!((window as any).median || (window as any).gonative);
  
  return isGoNativeUA || hasGlobalBridge;
}

/**
 * 1. REGISTERS FOR PUSH NOTIFICATIONS
 * This requests permission and registers the device with Median's push notification service (OneSignal / FCM).
 */
export function registerMedianPush() {
  if (typeof window === 'undefined') return;

  try {
    // Median.co offers a unified JS Bridge for push registration
    if ((window as any).median?.push?.register) {
      console.log('Initiating Median Push registration...');
      (window as any).median.push.register();
    } else if ((window as any).gonative?.push?.register) {
      console.log('Initiating GoNative Push registration...');
      (window as any).gonative.push.register();
    } else {
      console.log('Push notification bridge not detected (Standard Web view).');
    }
  } catch (err) {
    console.error('Error registering Median push notifications:', err);
  }
}

/**
 * 2. SYNC USER PROFILE TAGS WITH PUSH TOKENS
 * This associates the user's phone number and name with the device push token,
 * allowing the Admin to target specific customers with custom push alerts.
 */
export function syncMedianPushTags(phone: string, userName: string) {
  if (typeof window === 'undefined') return;

  try {
    const tags = {
      phone: phone,
      name: userName,
      app: 'MeatGhar',
      last_active: new Date().toISOString()
    };

    if ((window as any).median?.push?.setTags) {
      console.log('Syncing tags with Median Push...', tags);
      (window as any).median.push.setTags(tags);
    } else if ((window as any).gonative?.push?.setTags) {
      console.log('Syncing tags with GoNative Push...', tags);
      (window as any).gonative.push.setTags(tags);
    }
  } catch (err) {
    console.error('Error syncing push tags:', err);
  }
}

/**
 * 3. OPTIMIZED GOOGLE SIGN-IN FOR ANDROID APK
 * When wrapped as an APK, standard redirects would take the user out of the app.
 * This function opens the Supabase Google Sign-In in a clean native tab popup
 * which preserves the app state and returns automatically.
 */
export async function signInWithGoogleAndroidAPK() {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  
  // We request Supabase OAuth with skipBrowserRedirect: true to manually handle the URL
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: currentOrigin,
      skipBrowserRedirect: true, // Crucial: gets the URL instead of force redirecting main frame
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }

  if (data?.url) {
    console.log('Opening APK OAuth URL in Custom Tab / App Browser:', data.url);
    
    if (isMedianApp()) {
      const gWindow = window as any;
      
      // Method A: Check for Median JS Bridge's window.open with 'appbrowser' (In-App Tab) mode
      if (gWindow.median?.window?.open) {
        console.log('Using Median JS Bridge to open OAuth in appbrowser mode...');
        gWindow.median.window.open(data.url, 'appbrowser');
      } else if (gWindow.gonative?.window?.open) {
        console.log('Using GoNative JS Bridge to open OAuth in appbrowser mode...');
        gWindow.gonative.window.open(data.url, 'appbrowser');
      } else {
        // Method B: window.open with custom popup options
        console.log('Using standard window.open fallback inside Webview...');
        const oauthPopup = window.open(data.url, '_blank', 'location=yes,clearsessioncache=no,clearcache=no');
        
        // Keep checking if the popup has redirected back to the app domain to auto-close it
        if (oauthPopup) {
          const interval = setInterval(() => {
            try {
              if (oauthPopup.closed) {
                clearInterval(interval);
              } else {
                const popupUrl = oauthPopup.location?.href;
                if (popupUrl && popupUrl.includes(currentOrigin) && (popupUrl.includes('access_token') || popupUrl.includes('code='))) {
                  // Login successful! Close popup to return to the active app screen
                  oauthPopup.close();
                  clearInterval(interval);
                  window.location.reload(); // Reload main app to instantly pick up the new session
                }
              }
            } catch (e) {
              // Cross-origin restrictions can throw errors while on Google login domain, which is expected.
            }
          }, 1000);
        }
      }
    } else {
      // Fallback for regular web browsers
      window.location.href = data.url;
    }
  }
}
