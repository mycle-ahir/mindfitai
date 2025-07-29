import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { 
  App, 
  Camera, 
  Device, 
  Haptics, 
  ImpactStyle,
  Network, 
  Preferences,
  Share,
  StatusBar
} from '../capacitor-plugins';
import type { 
  CameraResultType,
  CameraSource
} from '../capacitor-plugins';

// Hook for device information
export const useDevice = () => {
  const [deviceInfo, setDeviceInfo] = useState<any>(null);
  const [isNative, setIsNative] = useState(false);

  useEffect(() => {
    const getDeviceInfo = async () => {
      try {
        setIsNative(Capacitor.isNativePlatform());
        const info = await Device.getInfo();
        setDeviceInfo(info);
      } catch (error) {
        console.error('Error getting device info:', error);
      }
    };

    getDeviceInfo();
  }, []);

  return { deviceInfo, isNative };
};

// Hook for network status
export const useNetwork = () => {
  const [networkStatus, setNetworkStatus] = useState<any>(null);

  useEffect(() => {
    const getNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setNetworkStatus(status);
      } catch (error) {
        console.error('Error getting network status:', error);
      }
    };

    getNetworkStatus();

    const networkListener = Network.addListener('networkStatusChange', (status) => {
      setNetworkStatus(status);
    });

    return () => {
      networkListener.remove();
    };
  }, []);

  return networkStatus;
};

// Hook for camera functionality
export const useCamera = () => {
  const takePhoto = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.warn('Camera not available in web environment');
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      return photo;
    } catch (error) {
      console.error('Error taking photo:', error);
      return null;
    }
  };

  const pickFromGallery = async () => {
    try {
      if (!Capacitor.isNativePlatform()) {
        console.warn('Gallery not available in web environment');
        return null;
      }

      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      return photo;
    } catch (error) {
      console.error('Error picking from gallery:', error);
      return null;
    }
  };

  return { takePhoto, pickFromGallery };
};

// Hook for haptic feedback
export const useHaptics = () => {
  const impact = async (style: ImpactStyle = ImpactStyle.Medium) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.impact({ style });
      }
    } catch (error) {
      console.error('Error with haptic feedback:', error);
    }
  };

  const vibrate = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Haptics.vibrate();
      }
    } catch (error) {
      console.error('Error with vibration:', error);
    }
  };

  return { impact, vibrate };
};

// Hook for preferences (local storage)
export const usePreferences = () => {
  const setItem = async (key: string, value: string) => {
    try {
      await Preferences.set({ key, value });
    } catch (error) {
      console.error('Error setting preference:', error);
    }
  };

  const getItem = async (key: string) => {
    try {
      const result = await Preferences.get({ key });
      return result.value;
    } catch (error) {
      console.error('Error getting preference:', error);
      return null;
    }
  };

  const removeItem = async (key: string) => {
    try {
      await Preferences.remove({ key });
    } catch (error) {
      console.error('Error removing preference:', error);
    }
  };

  const clear = async () => {
    try {
      await Preferences.clear();
    } catch (error) {
      console.error('Error clearing preferences:', error);
    }
  };

  return { setItem, getItem, removeItem, clear };
};

// Hook for sharing
export const useShare = () => {
  const share = async (title: string, text: string, url?: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await Share.share({
          title,
          text,
          url,
          dialogTitle: 'Share with...'
        });
      } else {
        // Fallback for web
        if (navigator.share) {
          await navigator.share({ title, text, url });
        } else {
          console.warn('Sharing not supported in this browser');
        }
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return { share };
};

// Hook for status bar
export const useStatusBar = () => {
  const setStyle = async (style: 'LIGHT' | 'DARK') => {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setStyle({ 
          style: style === 'LIGHT' ? 'LIGHT' : 'DARK' 
        });
      }
    } catch (error) {
      console.error('Error setting status bar style:', error);
    }
  };

  const setBackgroundColor = async (color: string) => {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.setBackgroundColor({ color });
      }
    } catch (error) {
      console.error('Error setting status bar color:', error);
    }
  };

  const hide = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.hide();
      }
    } catch (error) {
      console.error('Error hiding status bar:', error);
    }
  };

  const show = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await StatusBar.show();
      }
    } catch (error) {
      console.error('Error showing status bar:', error);
    }
  };

  return { setStyle, setBackgroundColor, hide, show };
};