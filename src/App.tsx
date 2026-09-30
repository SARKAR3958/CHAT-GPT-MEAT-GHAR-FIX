import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MobileFrame, ScreenType } from './components/MobileFrame';
import { SplashScreen } from './components/screens/SplashScreen';
import { Onboarding1Screen } from './components/screens/Onboarding1Screen';
import { Onboarding2Screen } from './components/screens/Onboarding2Screen';
import { Onboarding3Screen } from './components/screens/Onboarding3Screen';
import { SignupScreen } from './components/screens/SignupScreen';
import { SignUpFormScreen } from './components/screens/SignUpFormScreen';
import { LocationPermissionScreen } from './components/screens/LocationPermissionScreen';
import { LocationSearchScreen } from './components/screens/LocationSearchScreen';
import { AddressFormScreen } from './components/screens/AddressFormScreen';
import { HomeScreen } from './components/screens/HomeScreen';
import { CategoryListScreen } from './components/screens/CategoryListScreen';
import { SearchScreen } from './components/screens/SearchScreen';
import { ProductDetailsScreen } from './components/screens/ProductDetailsScreen';
import { CartScreen } from './components/screens/CartScreen';
import { DeliveryAddressScreen } from './components/screens/DeliveryAddressScreen';
import { CheckoutScreen } from './components/screens/CheckoutScreen';
import { OrderSuccessScreen } from './components/screens/OrderSuccessScreen';
import { TrackOrderScreen } from './components/screens/TrackOrderScreen';
import { RateOrderScreen } from './components/screens/RateOrderScreen';
import { MyOrdersScreen } from './components/screens/MyOrdersScreen';
import { OrderDetailsScreen } from './components/screens/OrderDetailsScreen';
import { MyProfileScreen } from './components/screens/MyProfileScreen';
import { MyAddressesScreen } from './components/screens/MyAddressesScreen';
import { NotificationsScreen } from './components/screens/NotificationsScreen';
import { HelpSupportScreen } from './components/screens/HelpSupportScreen';
import { CouponsScreen } from './components/screens/CouponsScreen';
import { EditProfileScreen } from './components/screens/EditProfileScreen';
import { ShareScreen } from './components/screens/ShareScreen';
import { WalletScreen } from './components/screens/WalletScreen';
const AdminPanel = lazy(() => import('./components/admin/AdminPanel').then(module=>({default:module.AdminPanel})));
import { LocationData } from './types/location';
import { preloadAllImages } from './utils/preloadAssets';
import { MeatGharLogo } from './components/MeatGharLogo';
import { RotateCcw } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { supabase, signInWithGoogle } from './lib/supabase';
import { isMedianApp, registerMedianPush, syncMedianPushTags, signInWithGoogleAndroidAPK } from './utils/medianBridge';

export default function App() {
  const isInitialAdmin = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('admin-mtg') ||
    window.location.pathname.toLowerCase().includes('admin_mtg') ||
    window.location.hash.toLowerCase().includes('admin-mtg') ||
    window.location.search.toLowerCase().includes('admin-mtg') ||
    window.location.pathname.toLowerCase().includes('admin') ||
    window.location.hash.toLowerCase().includes('admin')
  );

  const [currentScreen, setCurrentScreen] = useState<ScreenType>(isInitialAdmin ? 'admin_panel' : 'splash');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [authMethod, setAuthMethod] = useState<'manual' | 'google' | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryPassword, setRecoveryPassword] = useState('');
  const [isOrderDelivered, setIsOrderDelivered] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [productOriginScreen, setProductOriginScreen] = useState<ScreenType>('home');
  const [categoryOriginScreen, setCategoryOriginScreen] = useState<'home' | 'category_manual'>('home');
  const [userLocation, setUserLocation] = useState<LocationData>(() => {
    try {
      const savedLoc = localStorage.getItem('meatghar_selected_location');
      if (savedLoc) {
        return JSON.parse(savedLoc);
      }
    } catch {
      // ignore
    }
    return {
      address: 'Select delivery location',
      lat: 26.1445,
      lng: 91.7362,
      road: 'MG Road',
      suburb: '',
      city: 'Guwahati',
      state: 'Assam',
      postcode: '',
    };
  });

  const handleUpdateLocation = useCallback((newLoc: LocationData) => {
    setUserLocation(newLoc);
    try {
      localStorage.setItem('meatghar_selected_location', JSON.stringify(newLoc));
    } catch {
      // ignore
    }
  }, []);

  // Track screen navigation history stack for Android hardware/navigation bar back button
  const historyStackRef = useRef<ScreenType[]>([isInitialAdmin ? 'admin_panel' : 'splash']);
  const lastBackPressTimeRef = useRef<number>(0);
  const toastTimeoutRef = useRef<number | null>(null);
  const [showExitToast, setShowExitToast] = useState(false);
  const [isAppExited, setIsAppExited] = useState(false);

  // Custom Toast States
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('error');

  const showAppToast = (msg: string, type: 'success' | 'error' = 'error') => {
    setToastMessage(msg);
    setToastType(type);
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 5000);
  return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Load saved user profile from localStorage if exists
  useEffect(() => {
    // Check URL pathname, hash, or query for /admin-mtg route
    const checkAdminQuery = () => {
      const loc = window.location;
      const fullPath = (loc.pathname + loc.hash + loc.search).toLowerCase();
      if (
        fullPath.includes('admin-mtg') ||
        fullPath.includes('admin_mtg') ||
        fullPath.includes('/admin') ||
        fullPath.includes('#admin') ||
        fullPath.includes('?admin')
      ) {
        setCurrentScreen('admin_panel');
      }
    };

    checkAdminQuery();
    window.addEventListener('popstate', checkAdminQuery);
    window.addEventListener('hashchange', checkAdminQuery);

    // Register Push Notifications on Mount for Median.co APK / iOS App wrapper
    if (isMedianApp()) {
      registerMedianPush();
    }

    let alive=true;
    const applySession = async (session:any, event:string) => {
      if(!alive)return;
      if(event==='PASSWORD_RECOVERY' || window.location.hash==='#reset-password')setRecoveryMode(true);
      if(!session?.user){setUserEmail('');setUserName('');setPhoneNumber('');localStorage.removeItem('meatghar_user');localStorage.removeItem('meatghar_auth_uid');return;}
      const user=session.user;
      const previousUid=localStorage.getItem('meatghar_auth_uid');
      if(previousUid && previousUid!==user.id)for(const key of ['meatghar_cart_items','meatghar_selected_address_id','meatghar_last_order_id'])localStorage.removeItem(key);
      const {data:profile,error}=await supabase.from('profiles').select('*').eq('id',user.id).maybeSingle();
      if(!alive)return;
      if(profile?.is_blocked){await supabase.auth.signOut();setCurrentScreen('signup');return;}
      const name=profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || '';
      const phone=profile?.phone || user.user_metadata?.phone || user.phone || '';
      setUserName(name);setPhoneNumber(phone);setUserEmail(user.email || '');setAuthMethod(user.app_metadata?.provider==='google'?'google':'manual');
      localStorage.setItem('meatghar_auth_uid',user.id);
      localStorage.setItem('meatghar_user',JSON.stringify({userName:name,phone,email:user.email || '',authMethod:user.app_metadata?.provider==='google'?'google':'manual'}));
      if(isMedianApp())syncMedianPushTags(phone,name);
      if(event==='SIGNED_IN' && !isInitialAdmin && window.location.hash!=='#reset-password') {
        if(error){showAppToast('Unable to load your account: '+error.message,'error');return;}
        if(!profile){
          if(user.user_metadata?.phone && user.user_metadata?.full_name){const {error}=await supabase.rpc('sync_my_profile',{p_name:user.user_metadata.full_name,p_phone:user.user_metadata.phone});if(error){showAppToast(error.message,'error');setCurrentScreen('profile_edit');return;}}
          else{setCurrentScreen('profile_edit');return;}
        }
        setCurrentScreen('home');
      }
    };
    void supabase.auth.getSession().then(({data:{session},error})=>{if(error)showAppToast(error.message,'error');else void applySession(session,'RESTORE');});
    const {data:authSub}=supabase.auth.onAuthStateChange((event,session)=>{setTimeout(()=>void applySession(session,event),0);});

    return () => {
      alive=false;
      window.removeEventListener('popstate', checkAdminQuery);
      window.removeEventListener('hashchange', checkAdminQuery);
      authSub.subscription.unsubscribe();
    };
  }, []);

  // Native app exit handler
  const handleExitApp = useCallback(() => {
    // 1. Try Android Capacitor App exit
    try {
      if ((window as any).Capacitor?.Plugins?.App?.exitApp) {
        (window as any).Capacitor.Plugins.App.exitApp();
        return;
      }
    } catch {
      // ignore
    }

    // 2. Try Cordova Android App exit
    try {
      if ((navigator as any).app?.exitApp) {
        (navigator as any).app.exitApp();
        return;
      }
    } catch {
      // ignore
    }

    // 3. Try standard window close or show clean standby screen
    try {
      window.close();
    } catch {
      // ignore
    }

    setIsAppExited(true);
  }, []);

  // Root back press handler (Double tap to exit)
  const handleRootBack = useCallback(() => {
    const now = Date.now();
    const timeSinceLastPress = now - lastBackPressTimeRef.current;

    if (timeSinceLastPress < 2000) {
      // Second press within 2 seconds: Exit App!
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      setShowExitToast(false);
      handleExitApp();
    } else {
      // First press: show toast
      lastBackPressTimeRef.current = now;
      setShowExitToast(true);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = window.setTimeout(() => {
        setShowExitToast(false);
      }, 2000);

      // Re-push home state so browser doesn't exit prematurely on 1st tap
      try {
        window.history.pushState({ screen: 'home' }, '');
      } catch {
        // ignore
      }
    }
  }, [handleExitApp]);

  const navigateScreen = useCallback((nextScreen: ScreenType) => {
    const publicScreens:ScreenType[]=['splash','onboarding1','onboarding2','onboarding3','signup','signup_form','home','category','search','product_details','share','admin_panel'];
    if(!publicScreens.includes(nextScreen) && !localStorage.getItem('meatghar_auth_uid'))nextScreen='signup';
    if (nextScreen === currentScreen) return;
    try {
      const targetUrl = nextScreen === 'admin_panel' ? '/admin-mtg' : '/';
      window.history.pushState({ screen: nextScreen }, '', targetUrl);
    } catch {
      // ignore
    }
    historyStackRef.current.push(nextScreen);
    setCurrentScreen(nextScreen);
  }, [currentScreen]);

  const checkAddressAndNavigate = async (userId: string) => {
    const {data:profile,error:profileLoadError}=await supabase.from('profiles').select('*').eq('id',userId).maybeSingle();
    if(profileLoadError){showAppToast('Unable to load your account: '+profileLoadError.message,'error');return;}
    if (!profile) {
      const {data:{user}}=await supabase.auth.getUser();
      if(user?.user_metadata?.phone && user.user_metadata?.full_name){
        const {error}=await supabase.rpc('sync_my_profile',{p_name:user.user_metadata.full_name,p_phone:user.user_metadata.phone});
        if(error){showAppToast(error.message,'error');navigateScreen('profile_edit');return;}
      } else {navigateScreen('profile_edit');return;}
    } else {if(profile.is_blocked){await supabase.auth.signOut();showAppToast('Your account is blocked. Contact the store.','error');navigateScreen('signup');return;}setUserName(profile.full_name);setPhoneNumber(profile.phone);}

    const { data, error } = await supabase
      .from('addresses')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
      .limit(1).maybeSingle();

    if (error || !data) {
      navigateScreen('address_form');
    } else {
      navigateScreen('home');
    }
  };

  const goBack = useCallback(() => {
    if (currentScreen === 'product_details') {
      if (productOriginScreen === 'home') {
        navigateScreen('home');
        return;
      } else if (productOriginScreen === 'category') {
        navigateScreen('category');
        return;
      } else if (productOriginScreen === 'search') {
        navigateScreen('search');
        return;
      } else {
        navigateScreen('home');
        return;
      }
    }

    if (currentScreen === 'category') {
      if (categoryOriginScreen === 'home') {
        navigateScreen('home');
        return;
      } else if (selectedCategoryName) {
        setSelectedCategoryName(null);
        return;
      } else {
        navigateScreen('home');
        return;
      }
    }

    if (
      currentScreen === 'search' ||
      currentScreen === 'delivery_address' ||
      currentScreen === 'location_search' ||
      currentScreen === 'address_form' ||
      currentScreen === 'help_support' ||
      currentScreen === 'notifications'
    ) {
      if (historyStackRef.current.length > 1) {
        window.history.back();
      } else {
        navigateScreen('home');
      }
      return;
    }

    if (historyStackRef.current.length > 1) {
      window.history.back();
    } else if (currentScreen !== 'home') {
      navigateScreen('home');
    } else {
      handleRootBack();
    }
  }, [
    currentScreen,
    categoryOriginScreen,
    handleRootBack,
    navigateScreen,
    productOriginScreen,
    selectedCategoryName,
  ]);

  useEffect(() => {
    preloadAllImages();

    // Initialize root state in browser history
    try {
      window.history.replaceState({ screen: currentScreen }, '');
    } catch {
      // ignore
    }

    // Handle browser / Android system navigation bar back button & swipe back
    const handlePopState = (event: PopStateEvent) => {
      if (event.state && event.state.screen) {
        const targetScreen = event.state.screen as ScreenType;
        setCurrentScreen(targetScreen);
        const idx = historyStackRef.current.lastIndexOf(targetScreen);
        if (idx !== -1) {
          historyStackRef.current = historyStackRef.current.slice(0, idx + 1);
        } else {
          historyStackRef.current.push(targetScreen);
        }
      } else {
        // If history popped to root, check if we can step back or we are on home
        if (historyStackRef.current.length > 1) {
          historyStackRef.current.pop();
          const prevScreen = historyStackRef.current[historyStackRef.current.length - 1];
          setCurrentScreen(prevScreen);
          try {
            window.history.pushState({ screen: prevScreen }, '');
          } catch {
            // ignore
          }
        } else if (currentScreen !== 'home') {
          setCurrentScreen('home');
          try {
            window.history.pushState({ screen: 'home' }, '');
          } catch {
            // ignore
          }
        } else {
          // Already on Home screen: trigger double-back-to-exit!
          handleRootBack();
        }
      }
    };

    window.addEventListener('popstate', handlePopState);

    // Support Android Cordova / Capacitor hardware backbutton event
    const handleAndroidBackButton = (e: Event) => {
      e.preventDefault();
      if (historyStackRef.current.length > 1) {
        window.history.back();
      } else if (currentScreen !== 'home') {
        navigateScreen('home');
      } else {
        handleRootBack();
      }
    };
    document.addEventListener('backbutton', handleAndroidBackButton);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      document.removeEventListener('backbutton', handleAndroidBackButton);
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [currentScreen, handleRootBack, navigateScreen]);

  // Navigation tab helper
  const handleTabNavigation = (tab: string, categoryName?: string) => {
    if (categoryName) {
      setSelectedCategoryName(categoryName);
      setCategoryOriginScreen('home');
    } else if (tab === 'category' || tab === 'categories') {
      setSelectedCategoryName(null);
      setCategoryOriginScreen('category_manual');
    }

    switch (tab) {
      case 'home':
        navigateScreen('home');
        break;
      case 'categories':
      case 'category':
        navigateScreen('category');
        break;
      case 'search':
        navigateScreen('search');
        break;
      case 'location':
      case 'location_search':
        navigateScreen('location_search');
        break;
      case 'cart':
        navigateScreen('cart');
        break;
      case 'checkout':
        navigateScreen('checkout');
        break;
      case 'orders':
      case 'my_orders':
        navigateScreen('my_orders');
        break;
      case 'share':
        navigateScreen('share');
        break;
      case 'profile':
      case 'my_profile':
        navigateScreen('my_profile');
        break;
      case 'notifications':
        navigateScreen('notifications');
        break;
      case 'delivery_address':
        navigateScreen('delivery_address');
        break;
      default:
        navigateScreen('home');
    }
  };

  const handleProfileOptionClick = (optionId: string) => {
    switch (optionId) {
      case 'profile_edit':
        navigateScreen('profile_edit');
        break;
      case 'addresses':
        navigateScreen('my_addresses');
        break;
      case 'orders':
      case 'my_orders':
        navigateScreen('my_orders');
        break;
      case 'cart':
        navigateScreen('cart');
        break;
      case 'categories':
      case 'category':
        navigateScreen('category');
        break;
      case 'notifications':
        navigateScreen('notifications');
        break;
      case 'referral':
      case 'share':
        navigateScreen('share');
        break;
      case 'wallet':
        navigateScreen('wallet');
        break;
      case 'admin_panel':
      case 'admin':
        navigateScreen('admin_panel');
        break;
      case 'support':
        navigateScreen('help_support');
        break;
      case 'coupons':
        navigateScreen('coupons');
        break;
      case 'home':
        navigateScreen('home');
        break;
      case 'profile':
      case 'my_profile':
        navigateScreen('my_profile');
        break;
      default:
        navigateScreen('my_profile');
    }
  };

  if (recoveryMode) return <div className="p-6 max-w-lg mx-auto"><h1 className="font-bold text-xl">Reset password</h1><input aria-label="New password" type="password" minLength={8} value={recoveryPassword} onChange={e=>setRecoveryPassword(e.target.value)} className="border p-3 w-full my-4"/><button className="bg-red-700 text-white p-3 rounded-xl" onClick={async()=>{if(recoveryPassword.length<8){showAppToast('Use at least 8 characters','error');return;}const {error}=await supabase.auth.updateUser({password:recoveryPassword});if(error) alert(error.message);else {setRecoveryMode(false);window.history.replaceState({},'',window.location.pathname);navigateScreen('home');}}}>Save password</button></div>;
  return (
    <CartProvider key={userEmail || 'guest'}>
      <MobileFrame currentScreen={currentScreen} setScreen={navigateScreen}>
        <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0, x: 15 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -15 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
          className="w-full h-full flex flex-col"
        >
          {/* Screen 01: Splash */}
          {currentScreen === 'splash' && (
            <SplashScreen
              onNext={async () => {
                const {data:{session}}=await supabase.auth.getSession();
                if(session){await checkAddressAndNavigate(session.user.id);return;}
                historyStackRef.current = ['onboarding1'];
                navigateScreen('onboarding1');
              }}
            />
          )}

          {/* Screen 02: Onboarding 1 */}
          {currentScreen === 'onboarding1' && (
            <Onboarding1Screen
              onNext={() => navigateScreen('onboarding2')}
              onSkip={() => navigateScreen('signup')}
            />
          )}

          {/* Screen 03: Onboarding 2 */}
          {currentScreen === 'onboarding2' && (
            <Onboarding2Screen
              onNext={() => navigateScreen('onboarding3')}
              onSkip={() => navigateScreen('signup')}
            />
          )}

          {/* Screen 04: Onboarding 3 */}
          {currentScreen === 'onboarding3' && (
            <Onboarding3Screen
              onNext={() => navigateScreen('signup')}
              onSkip={() => navigateScreen('signup')}
            />
          )}

          {/* Screen 05: Direct Login */}
          {currentScreen === 'signup' && (
            <SignupScreen
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              onLoginSubmit={async (email, password) => {
                const {data,error} = await supabase.auth.signInWithPassword({email:email.trim(),password});
                if(error) {showAppToast(error.message,'error');return;}
                if(data.user) { historyStackRef.current=['home']; await checkAddressAndNavigate(data.user.id); }
              }}
              onGoogleLogin={async () => { try {await signInWithGoogleAndroidAPK();} catch(error:any){showAppToast(error.message || 'Google sign-in failed','error');} }}
              onGoToSignUp={() => navigateScreen('signup_form')}
              onOpenAdmin={() => navigateScreen('admin_panel')}
            />
          )}

          {/* Screen 06: Create Account (Sign Up Form) */}
          {currentScreen === 'signup_form' && (
            <SignUpFormScreen
              onSignUpSubmit={async (data) => {
                const uName = data.fullName.trim();
                const uPhone = data.phone.trim();
                const uEmail = data.email.trim();
                const uPassword = data.password;
                if (!uPassword || uPassword.length < 8) {showAppToast('Use a password of at least 8 characters','error'); return;}

                if (!uName || !uPhone || !uEmail) {
                  showAppToast('Please fill in all required fields!', 'error');
                  return;
                }

                try {
                  // 1. Sign Up inside Supabase Auth
                  const { data: authData, error: authErr } = await supabase.auth.signUp({
                    email: uEmail,
                    password: uPassword,
                    options: {
                      emailRedirectTo: window.location.origin,
                      data: {
                        phone: uPhone,
                        full_name: uName,
                      }
                    }
                  });

                  if (authErr) {
                    showAppToast(`Registration failed: ${authErr.message}`, 'error');
                    return;
                  }

                  if (!authData.session) {showAppToast('Check your email to confirm your account, then sign in.','success');navigateScreen('signup');return;}
                  const {error:profileErr}=await supabase.rpc('sync_my_profile',{p_name:uName,p_phone:uPhone});
                  if(profileErr) {showAppToast(profileErr.message,'error');return;}
                  historyStackRef.current=['home']; await checkAddressAndNavigate(authData.user!.id);
                } catch (err: any) {
                  showAppToast(`An error occurred during sign up: ${err.message || String(err)}`, 'error');
                }
              }}
              onGoogleLogin={async () => {try {await signInWithGoogleAndroidAPK();} catch(error:any) {showAppToast(error.message,'error');}}}
              onGoToLogin={() => navigateScreen('signup')}
            />
          )}

          {/* Screen 07: Location Permission */}
          {currentScreen === 'location_perm' && (
            <LocationPermissionScreen
              onBack={() => goBack()}
              onUseCurrentLocation={() => navigateScreen('location_search')}
              onEnterAddressManually={() => navigateScreen('address_form')}
            />
          )}

          {/* Screen 08: Map Location Search */}
          {currentScreen === 'location_search' && (
            <LocationSearchScreen
              onBack={() => goBack()}
              onConfirmLocation={(loc) => {
                setUserLocation(loc);
                navigateScreen('address_form');
              }}
            />
          )}

          {/* Screen 09: Add New Address */}
          {currentScreen === 'address_form' && (
            <AddressFormScreen
              onBack={() => goBack()}
              onSaveAddress={async (data) => {
                const {data: savedAddress, error} = await supabase.from('addresses').insert({
                  user_id: (await supabase.auth.getUser()).data.user?.id,
                  full_name: data.fullName,
                  phone: data.mobileNumber,
                  house_flat: data.houseFlat,
                  street_road: data.street,
                  locality: data.locality,
                  city: data.city + " (" + data.area + ")",
                  type: data.addressType
                }).select().single();
                if (error) {
                  showAppToast('Failed to save address: ' + error.message, 'error');
                  return;
                }
                localStorage.setItem('meatghar_selected_address_id',savedAddress.id);
                navigateScreen('home');
              }}
              locationData={userLocation}
            />
          )}

          {/* Screen 10: Home Store */}
          {currentScreen === 'home' && (
            <HomeScreen
              onNavigateTab={handleTabNavigation}
              onSelectProduct={(productId) => {
                setSelectedProductId(productId);
                setProductOriginScreen('home');
                navigateScreen('product_details');
              }}
              userLocation={userLocation}
              onUpdateLocation={handleUpdateLocation}
              onAddNewAddress={() => navigateScreen('address_form')}
              userEmail={userEmail}
            />
          )}

          {/* Screen 11: Category List */}
          {currentScreen === 'category' && (
            <CategoryListScreen
              initialCategory={selectedCategoryName}
              fromOrigin={categoryOriginScreen}
              onBack={() => goBack()}
              onSelectProduct={(productId) => {
                setSelectedProductId(productId);
                setProductOriginScreen(categoryOriginScreen === 'home' ? 'home' : 'category');
                navigateScreen('product_details');
              }}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 12: Search Screen */}
          {currentScreen === 'search' && (
            <SearchScreen
              onBack={() => goBack()}
              onSelectProduct={(productId) => {
                setSelectedProductId(productId);
                setProductOriginScreen('search');
                navigateScreen('product_details');
              }}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 13: Product Details */}
          {currentScreen === 'product_details' && (
            <ProductDetailsScreen
              productId={selectedProductId}
              onBack={() => goBack()}
              onAddToCart={() => navigateScreen('cart')}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 14: Your Cart */}
          {currentScreen === 'cart' && (
            <CartScreen
              onBack={() => goBack()}
              onProceedToCheckout={() => navigateScreen('delivery_address')}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 15: Delivery Address */}
          {currentScreen === 'delivery_address' && (
            <DeliveryAddressScreen
              onBack={() => goBack()}
              onContinueToCheckout={() => navigateScreen('checkout')}
              onAddNewAddress={() => navigateScreen('address_form')}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 16: Checkout */}
          {currentScreen === 'checkout' && (
            <CheckoutScreen
              onBack={() => goBack()}
              onPlaceOrder={() => {setSelectedOrderId(localStorage.getItem('meatghar_last_order_id') || '');navigateScreen('order_success');}}
            />
          )}

          {/* Screen 17: Order Confirmed Celebration (Green Tick Lottie) */}
          {currentScreen === 'order_success' && (
            <OrderSuccessScreen
              onTrackOrder={() => navigateScreen('track_order')}
              onViewOrderDetails={() => navigateScreen('order_details')}
            />
          )}

          {/* Screen 18: Track Order */}
          {currentScreen === 'track_order' && (
            <TrackOrderScreen
              orderId={selectedOrderId}
              onBack={() => navigateScreen('my_orders')}
              onArrivedOtpView={() => navigateScreen('order_details')}
              onMarkDelivered={() => setIsOrderDelivered(true)}
            />
          )}

          {/* Screen 22: Rate Your Order */}
          {currentScreen === 'rate_order' && (
            <RateOrderScreen
              orderId={selectedOrderId}
              onBack={() => navigateScreen('my_orders')}
              onSubmitReview={() => navigateScreen('my_orders')}
            />
          )}

          {/* Screen 23: My Orders */}
          {currentScreen === 'my_orders' && (
            <MyOrdersScreen
              onBack={() => navigateScreen('home')}
              onSelectOrderDetails={(id) => {setSelectedOrderId(id); navigateScreen('order_details');}}
              onNavigateTab={handleTabNavigation}
              isOrderDelivered={isOrderDelivered}
            />
          )}

          {/* Screen 24: Order Details */}
          {currentScreen === 'order_details' && (
            <OrderDetailsScreen
              orderId={selectedOrderId}
              onTrackOrder={() => navigateScreen('track_order')}
              onRateOrder={() => navigateScreen('rate_order')}
              onBack={() => goBack()}
              onReorder={() => navigateScreen('cart')}
              onGetHelp={() => navigateScreen('help_support')}
            />
          )}

          {/* Screen 25: My Profile */}
          {currentScreen === 'my_profile' && (
            <MyProfileScreen
              userName={userName}
              userPhone={phoneNumber}
              currentAddress={userLocation.address}
              onBack={() => goBack()}
              onNavigateOption={handleProfileOptionClick}
              onLogout={async () => { const {error}=await supabase.auth.signOut(); if(error){showAppToast(error.message,'error');return;} for(const key of ['meatghar_user','meatghar_cart_items','meatghar_selected_address_id','meatghar_last_order_id']) localStorage.removeItem(key); navigateScreen('signup'); }}
            />
          )}

          {/* Screen 26: Edit Profile */}
          {currentScreen === 'profile_edit' && (
            <EditProfileScreen
              userName={userName}
              userPhone={phoneNumber}
              userEmail={userEmail}
              authMethod={authMethod || 'manual'}
              onBack={() => goBack()}
              onSaveProfile={async (data) => {
                const {error}=await supabase.rpc('sync_my_profile',{p_name:data.fullName,p_phone:data.phone || phoneNumber}); if(error){showAppToast(error.message,'error');return false;}
                setUserName(data.fullName);
                if (data.phone) setPhoneNumber(data.phone);
                // Email changes require a separate verified Auth email-change flow.
                navigateScreen('home'); return true;
              }}
            />
          )}

          {/* Screen 27: My Addresses */}
          {currentScreen === 'my_addresses' && (
            <MyAddressesScreen
              onBack={() => goBack()}
              onAddNewAddress={() => navigateScreen('address_form')}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 28: Notifications */}
          {currentScreen === 'notifications' && (
            <NotificationsScreen
              onBack={() => goBack()}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 29: Help & Support */}
          {currentScreen === 'help_support' && (
            <HelpSupportScreen
              onBack={() => goBack()}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 30: Coupons & Offers */}
          {currentScreen === 'coupons' && (
            <CouponsScreen
              onBack={() => goBack()}
              onNavigateTab={handleTabNavigation}
              onApplyCoupon={() => navigateScreen('cart')}
            />
          )}

          {/* Screen 31: Share & Earn */}
          {currentScreen === 'share' && (
            <ShareScreen
              userName={userName}
              userPhone={phoneNumber}
              onBack={() => goBack()}
              onNavigateTab={handleTabNavigation}
            />
          )}

          {/* Screen 31.5: Wallet Screen */}
          {currentScreen === 'wallet' && (
            <WalletScreen
              onBack={() => goBack()}
            />
          )}

          {/* Screen 32: Meat Ghar Admin Panel */}
          {currentScreen === 'admin_panel' && (
            <Suspense fallback={<div className="p-6">Loading admin…</div>}><AdminPanel
              onSwitchToCustomerApp={() => navigateScreen('home')}
            /></Suspense>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Native Android-Style Double Back Exit Toast */}
      <AnimatePresence>
        {showExitToast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[9999] pointer-events-none px-4 py-2 bg-slate-900/95 text-white text-[12px] font-bold rounded-full shadow-2xl backdrop-blur-md border border-white/15 flex items-center gap-2 tracking-wide whitespace-nowrap"
          >
            <div className="w-2 h-2 rounded-full bg-[#BA181B] animate-ping shrink-0" />
            <span>Press back again to exit Meat Ghar</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Closed Standby State (for browsers/PWA when window.close() is sandbox-blocked) */}
      {isAppExited && (
        <div className="fixed inset-0 bg-slate-950/98 z-[10000] flex flex-col items-center justify-center p-6 text-center select-none backdrop-blur-xl">
          <div className="w-16 h-16 rounded-2xl bg-red-950/50 border border-red-500/30 flex items-center justify-center mb-4 shadow-lg shadow-red-950/50">
            <MeatGharLogo variant="white" size="sm" showTagline={false} />
          </div>
          <h2 className="text-lg font-black text-white mb-1">Meat Ghar Exited</h2>
          <p className="text-xs text-slate-400 max-w-xs mb-6 leading-relaxed">
            The application session was closed via device navigation back gesture.
          </p>
          <button
            type="button"
            onClick={() => {
              setIsAppExited(false);
              historyStackRef.current = ['home'];
              navigateScreen('home');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#BA181B] hover:bg-red-800 active:bg-red-900 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reopen Meat Ghar</span>
          </button>
        </div>
      )}

      {/* Custom Error/Success App-wide Toast System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-4 left-4 right-4 z-[99999] p-4 rounded-2xl shadow-2xl flex items-start gap-3 border ${
              toastType === 'success' 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="text-base shrink-0 mt-0.5">{toastType === 'success' ? '✓' : '⚠️'}</span>
            <div className="text-left">
              <p className="text-xs font-bold leading-relaxed">{toastMessage}</p>
            </div>
            <button 
              type="button" 
              onClick={() => setToastMessage(null)}
              className="ml-auto text-slate-400 hover:text-slate-600 text-xs font-bold px-1"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </MobileFrame>
    </CartProvider>
  );
}
