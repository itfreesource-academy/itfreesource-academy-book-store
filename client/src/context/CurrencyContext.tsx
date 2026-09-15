import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Currency, Timezone } from '../types/index.js';
import { useAuth } from './AuthContext.js';

export interface CurrencyConfig {
  code: Currency;
  name: string;
  symbol: string;
  rate: number; // relative to 1 USD
  flag: string;
}

export interface TimezoneConfig {
  id: Timezone;
  label: string;
  region: string;
}

export const SUPPORTED_CURRENCIES: Record<Currency, CurrencyConfig> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1.0, flag: '🇺🇸' },
  AED: { code: 'AED', name: 'UAE Dirham', symbol: 'AED ', rate: 3.67, flag: '🇦🇪' },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.50, flag: '🇮🇳' },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 155.00, flag: '🇯🇵' },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.52, flag: '🇦🇺' }
};

export const SUPPORTED_TIMEZONES: Record<Timezone, TimezoneConfig> = {
  'America/New_York': { id: 'America/New_York', label: 'New York (EDT/EST)', region: 'USA' },
  'Asia/Dubai': { id: 'Asia/Dubai', label: 'Dubai (GST)', region: 'UAE' },
  'Asia/Kolkata': { id: 'Asia/Kolkata', label: 'Kolkata / Mumbai (IST)', region: 'India' },
  'Asia/Tokyo': { id: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Japan' },
  'Australia/Sydney': { id: 'Australia/Sydney', label: 'Sydney (AEST/AEDT)', region: 'Australia' }
};

interface CurrencyContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  timezone: Timezone;
  setTimezone: (timezone: Timezone) => void;
  formatPrice: (usdAmount: number, targetCurrency?: Currency) => string;
  convertPrice: (usdAmount: number, targetCurrency?: Currency) => number;
  formatDateTime: (isoDate: string, targetTimezone?: Timezone) => string;
  formatDateOnly: (isoDate: string, targetTimezone?: Timezone) => string;
  currentCurrencyConfig: CurrencyConfig;
  currentTimezoneConfig: TimezoneConfig;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [currency, setCurrencyState] = useState<Currency>(() => {
    const saved = localStorage.getItem('app_currency') as Currency;
    return saved && SUPPORTED_CURRENCIES[saved] ? saved : 'USD';
  });

  const [timezone, setTimezoneState] = useState<Timezone>(() => {
    const saved = localStorage.getItem('app_timezone') as Timezone;
    return saved && SUPPORTED_TIMEZONES[saved] ? saved : 'America/New_York';
  });

  // Automatically adapt to logged-in user persona's timezone & currency
  // Depends on user?.id so it only fires on actual identity change (login/logout/switch),
  // not on every re-render where the `user` object reference may differ.
  useEffect(() => {
    if (user) {
      if (user.currency && SUPPORTED_CURRENCIES[user.currency]) {
        setCurrencyState(user.currency);
        localStorage.setItem('app_currency', user.currency);
      }
      if (user.timezone && SUPPORTED_TIMEZONES[user.timezone]) {
        setTimezoneState(user.timezone);
        localStorage.setItem('app_timezone', user.timezone);
      }
    }
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('app_currency', newCurrency);
  };

  const setTimezone = (newTimezone: Timezone) => {
    setTimezoneState(newTimezone);
    localStorage.setItem('app_timezone', newTimezone);
  };

  const convertPrice = (usdAmount: number, targetCurrency?: Currency): number => {
    const curr = targetCurrency || currency;
    const config = SUPPORTED_CURRENCIES[curr] || SUPPORTED_CURRENCIES.USD;
    const converted = (usdAmount || 0) * config.rate;
    return curr === 'JPY' ? Math.round(converted) : Number(converted.toFixed(2));
  };

  const formatPrice = (usdAmount: number, targetCurrency?: Currency): string => {
    const curr = targetCurrency || currency;
    const config = SUPPORTED_CURRENCIES[curr] || SUPPORTED_CURRENCIES.USD;
    const converted = convertPrice(usdAmount, curr);
    if (curr === 'JPY') {
      return `${config.symbol}${converted.toLocaleString()}`;
    }
    return `${config.symbol}${converted.toFixed(2)}`;
  };

  const formatDateTime = (isoDate: string, targetTimezone?: Timezone): string => {
    if (!isoDate) return '—';
    const tz = targetTimezone || timezone;
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(new Date(isoDate));
    } catch {
      return new Date(isoDate).toLocaleString();
    }
  };

  const formatDateOnly = (isoDate: string, targetTimezone?: Timezone): string => {
    if (!isoDate) return '—';
    const tz = targetTimezone || timezone;
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(new Date(isoDate));
    } catch {
      return new Date(isoDate).toLocaleDateString();
    }
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        timezone,
        setTimezone,
        formatPrice,
        convertPrice,
        formatDateTime,
        formatDateOnly,
        currentCurrencyConfig: SUPPORTED_CURRENCIES[currency],
        currentTimezoneConfig: SUPPORTED_TIMEZONES[timezone]
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextType => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
