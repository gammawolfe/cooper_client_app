import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from './AuthContextProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ActivityContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  lastActiveTime: number;
  resetTimer: () => void;
}

const ActivityContext = createContext<ActivityContextType | undefined>(undefined);

// Configurable timeouts
const LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes of inactivity
const BACKGROUND_LOCK_TIMEOUT = 1 * 60 * 1000; // 1 minute in background
const STORAGE_KEY = '@last_active_time';

export function useActivity() {
  const context = useContext(ActivityContext);
  if (context === undefined) {
    throw new Error('useActivity must be used within a ActivityProvider');
  }
  return context;
}

export function ActivityProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());
  const appState = useRef(AppState.currentState);
  const backgroundTimeRef = useRef<number | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const lastActiveTimeRef = useRef(lastActiveTime);

  // Load last active time from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((time) => {
      if (time) {
        const parsedTime = parseInt(time);
        setLastActiveTime(parsedTime);
        lastActiveTimeRef.current = parsedTime;
      }
    });
  }, []);

  // Save last active time to storage
  const updateLastActiveTime = useCallback((time: number) => {
    setLastActiveTime(time);
    lastActiveTimeRef.current = time;
    AsyncStorage.setItem(STORAGE_KEY, time.toString());
  }, []);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    const currentTime = Date.now();
    updateLastActiveTime(currentTime);

    timeoutRef.current = setTimeout(() => {
      const timeSinceLastActive = Date.now() - lastActiveTimeRef.current;
      if (timeSinceLastActive >= LOCK_TIMEOUT && !isLocked) {
        lockApp();
      }
    }, LOCK_TIMEOUT);
  }, [isLocked]);

  const lockApp = useCallback(() => {
    if (isLocked) return; // Prevent multiple locks
    setIsLocked(true);
    router.push('/(modals)/auth-screen');
  }, [isLocked]);

  const unlockApp = useCallback(() => {
    setIsLocked(false);
    resetTimer();
    if (router.canGoBack()) {
      router.back();
    }
  }, [resetTimer]);

  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    console.log('App state changed:', appState.current, '->', nextAppState);

    if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground
      if (backgroundTimeRef.current) {
        const timeInBackground = Date.now() - backgroundTimeRef.current;
        if (timeInBackground > BACKGROUND_LOCK_TIMEOUT && !isLocked) {
          lockApp();
        }
      }
      resetTimer();
    } else if (nextAppState.match(/inactive|background/)) {
      // App went to background
      backgroundTimeRef.current = Date.now();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Immediately lock if going to background
      if (!isLocked) {
        lockApp();
      }
    }

    appState.current = nextAppState;
  }, [lockApp, resetTimer, isLocked]);

  // Set up app state change listener
  useEffect(() => {
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Start initial timer
    if (user && !isLocked) {
      resetTimer();
    }

    return () => {
      subscription.remove();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [handleAppStateChange, user, resetTimer, isLocked]);

  const value = {
    isLocked,
    lockApp,
    unlockApp,
    lastActiveTime,
    resetTimer,
  };

  return <ActivityContext.Provider value={value}>{children}</ActivityContext.Provider>;
}