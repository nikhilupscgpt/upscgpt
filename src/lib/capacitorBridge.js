/**
 * Capacitor Cross-Platform Native Bridge
 * Safely executes native device features on iOS / Android while
 * gracefully falling back on standard desktop/mobile browsers.
 */

import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';

export const isNativePlatform = () => {
  return typeof window !== 'undefined' && Capacitor.isNativePlatform();
};

export const getPlatform = () => {
  return typeof window !== 'undefined' ? Capacitor.getPlatform() : 'web'; // 'ios' | 'android' | 'web'
};

/**
 * Configure native mobile status bar to match dark theme
 */
export const initMobileNativeUI = async () => {
  if (!isNativePlatform()) return;

  try {
    await StatusBar.setStyle({ style: Style.Dark });
    if (Capacitor.getPlatform() === 'android') {
      await StatusBar.setBackgroundColor({ color: '#090d16' });
    }
  } catch (err) {
    console.warn('[Capacitor] StatusBar setup notice:', err);
  }
};

/**
 * Trigger native physical vibration / haptics:
 * - 'light': gentle tap for UI interactions (e.g. toggling a filter, calendar day)
 * - 'success': positive haptic pulse (correct answer, streak completed)
 * - 'error': dual buzz (wrong answer)
 */
export const triggerNativeHaptic = async (type = 'light') => {
  if (!isNativePlatform()) return;

  try {
    if (type === 'light') {
      await Haptics.impact({ style: ImpactStyle.Light });
    } else if (type === 'medium') {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } else if (type === 'success') {
      await Haptics.notification({ type: NotificationType.Success });
    } else if (type === 'error') {
      await Haptics.notification({ type: NotificationType.Error });
    }
  } catch (err) {
    // Graceful fallback if device lacks vibration hardware
  }
};
