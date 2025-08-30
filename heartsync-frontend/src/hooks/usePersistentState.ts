// src/hooks/usePersistentState.ts (Final Corrected Version)

import { useState, useEffect } from 'react';

// This is a "reviver" function for JSON.parse. It looks for our special
// BigInt format and converts the string back into a real BigInt.
function jsonReviver(key: string, value: any) {
  if (typeof value === 'object' && value !== null && value.type === 'bigint') {
    return BigInt(value.value);
  }
  return value;
}

function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    // On first load, try to get the value from localStorage
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Use our custom reviver to correctly parse BigInts
      return item ? JSON.parse(item, jsonReviver) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    // Whenever the state changes, save it to localStorage
    if (typeof window !== 'undefined') {
      try {
        // We create a replacer function to convert BigInts to our special format
        const replacer = (key: string, value: any) => {
          if (typeof value === 'bigint') {
            return { type: 'bigint', value: value.toString() };
          }
          return value;
        };
        window.localStorage.setItem(key, JSON.stringify(state, replacer));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    }
  }, [key, state]);

  return [state, setState];
}

export default usePersistentState;