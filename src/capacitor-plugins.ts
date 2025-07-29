import { registerPlugin } from '@capacitor/core';
import { Capacitor } from '@capacitor/core';
import { 
  App, 
  AppInfo, 
  AppState, 
  URLOpenListenerEvent 
} from '@capacitor/app';
import { 
  Camera, 
  CameraResultType, 
  CameraSource, 
  Photo 
} from '@capacitor/camera';
import { 
  Device, 
  DeviceInfo 
} from '@capacitor/device';
import { 
  Filesystem, 
  Directory, 
  Encoding 
} from '@capacitor/filesystem';
import { 
  Haptics, 
  ImpactStyle, 
  NotificationType 
} from '@capacitor/haptics';
import { 
  Keyboard, 
  KeyboardInfo 
} from '@capacitor/keyboard';
import { 
  Network, 
  ConnectionStatus 
} from '@capacitor/network';
import { 
  Preferences 
} from '@capacitor/preferences';
import { 
  Share, 
  ShareOptions 
} from '@capacitor/share';
import { 
  SplashScreen 
} from '@capacitor/splash-screen';
import { 
  StatusBar, 
  Style 
} from '@capacitor/status-bar';

// Export all plugins for easy import
export {
  App,
  Camera,
  Device,
  Filesystem,
  Haptics,
  ImpactStyle,
  Keyboard,
  Network,
  Preferences,
  Share,
  SplashScreen,
  StatusBar
};

// Export types
export type {
  AppInfo,
  AppState,
  URLOpenListenerEvent,
  CameraResultType,
  CameraSource,
  Photo,
  DeviceInfo,
  Directory,
  Encoding,
  NotificationType,
  KeyboardInfo,
  ConnectionStatus,
  ShareOptions,
  Style
};

// Initialize plugins
export const initializeCapacitorPlugins = async () => {
  try {
    // Hide splash screen after app loads
    await SplashScreen.hide();
    
    // Set status bar style (only on native platforms)
    if (Capacitor.isNativePlatform()) {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ff6b35' });
    }
    
    // Get device info
    const deviceInfo = await Device.getInfo();
    console.log('Device Info:', deviceInfo);
    
    // Check network status
    const networkStatus = await Network.getStatus();
    console.log('Network Status:', networkStatus);
    
    // Listen for app state changes
    App.addListener('appStateChange', (state: AppState) => {
      console.log('App state changed:', state);
    });
    
    // Listen for URL opens
    App.addListener('appUrlOpen', (event: URLOpenListenerEvent) => {
      console.log('App opened with URL:', event);
    });
    
    // Listen for keyboard events (only on native platforms)
    if (Capacitor.isNativePlatform()) {
      Keyboard.addListener('keyboardWillShow', (info: KeyboardInfo) => {
        console.log('Keyboard will show:', info);
      });
      
      Keyboard.addListener('keyboardDidHide', () => {
        console.log('Keyboard hidden');
      });
    }
    
    // Listen for network changes
    Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
      console.log('Network status changed:', status);
    });
    
    return true;
  } catch (error) {
    console.error('Error initializing Capacitor plugins:', error);
    return false;
  }
};