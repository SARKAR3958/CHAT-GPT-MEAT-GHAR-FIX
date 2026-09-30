import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminProvider, useAdmin } from './AdminContext';
import { AdminScreen } from './types';

// Sub Views
import { SplashScreen } from './views/SplashScreen';
import { LoginScreen } from './views/LoginScreen';
import { DashboardScreen } from './views/DashboardScreen';
import { ProductsScreen } from './views/ProductsScreen';
import { AddProductScreen } from './views/AddProductScreen';
import { ProductDetailsScreen } from './views/ProductDetailsScreen';
import { OrdersScreen } from './views/OrdersScreen';
import { OrderDetailsScreen } from './views/OrderDetailsScreen';
import { UsersScreen } from './views/UsersScreen';
import { CategoriesScreen } from './views/CategoriesScreen';
import { OffersScreen } from './views/OffersScreen';
import { ReportsSettingsScreen } from './views/ReportsSettingsScreen';
import { SupportScreen } from './views/SupportScreen';
import { BannersScreen } from './views/BannersScreen';
import { FlashDealsScreen } from './views/FlashDealsScreen';
import { PushNotificationsScreen } from './views/PushNotificationsScreen';

// Navigation Components
import { AdminDrawer } from './components/AdminDrawer';

interface AdminPanelProps {
  onSwitchToCustomerApp?: () => void;
  initialScreen?: AdminScreen;
}

const AdminPanelRouter: React.FC<AdminPanelProps> = ({ onSwitchToCustomerApp }) => {
  const { currentScreen: requestedScreen, toastMessage, isLoggedIn } = useAdmin();
  const currentScreen = isLoggedIn || requestedScreen === "splash" ? requestedScreen : "login";

  return (
    <div className="w-full h-full bg-[#F8F9FA] relative flex flex-col justify-between overflow-hidden font-sans select-none antialiased">
      {/* Active Screen Router with Smooth Transitions */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        <AnimatePresence mode="wait">
          {currentScreen === 'splash' && (
            <motion.div
              key="splash"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <SplashScreen />
            </motion.div>
          )}

          {currentScreen === 'login' && (
            <motion.div
              key="login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <LoginScreen />
            </motion.div>
          )}

          {currentScreen === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <DashboardScreen />
            </motion.div>
          )}

          {currentScreen === 'flash_deals' && (
            <motion.div
              key="flash_deals"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <FlashDealsScreen />
            </motion.div>
          )}

          {currentScreen === 'banners' && (
            <motion.div
              key="banners"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <BannersScreen />
            </motion.div>
          )}

          {currentScreen === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <ProductsScreen />
            </motion.div>
          )}

          {currentScreen === 'add_product' && (
            <motion.div
              key="add_product"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <AddProductScreen isEditMode={false} />
            </motion.div>
          )}

          {currentScreen === 'edit_product' && (
            <motion.div
              key="edit_product"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <AddProductScreen isEditMode={true} />
            </motion.div>
          )}

          {currentScreen === 'product_details' && (
            <motion.div
              key="product_details"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <ProductDetailsScreen />
            </motion.div>
          )}

          {currentScreen === 'orders' && (
            <motion.div
              key="orders"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <OrdersScreen />
            </motion.div>
          )}

          {currentScreen === 'order_details' && (
            <motion.div
              key="order_details"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <OrderDetailsScreen />
            </motion.div>
          )}

          {currentScreen === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <UsersScreen />
            </motion.div>
          )}

          {currentScreen === 'categories' && (
            <motion.div
              key="categories"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <CategoriesScreen />
            </motion.div>
          )}

          {currentScreen === 'offers' && (
            <motion.div
              key="offers"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <OffersScreen />
            </motion.div>
          )}

          {currentScreen === 'reports_settings' && (
            <motion.div
              key="reports_settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <ReportsSettingsScreen />
            </motion.div>
          )}

          {currentScreen === 'support' && (
            <motion.div
              key="support"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <SupportScreen />
            </motion.div>
          )}

          {currentScreen === 'push_notifications' && (
            <motion.div
              key="push_notifications"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="w-full h-full"
            >
              <PushNotificationsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Dark Slide-out Navigation Drawer Menu */}
      <AdminDrawer onSwitchToCustomerApp={onSwitchToCustomerApp} />

      {/* Animated Action Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-slate-900/90 backdrop-blur-md text-white text-xs font-bold rounded-2xl shadow-xl border border-white/10 flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSwitchToCustomerApp, initialScreen = 'splash' }) => {
  return (
    <AdminProvider initialScreen={initialScreen} onExitAdmin={onSwitchToCustomerApp}>
      <AdminPanelRouter onSwitchToCustomerApp={onSwitchToCustomerApp} />
    </AdminProvider>
  );
};
