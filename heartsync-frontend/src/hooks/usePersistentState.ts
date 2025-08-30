// src/hooks/usePersistentState.ts (Final Type-Safe Version)

import { useState, useEffect } from 'react';

// This is a "reviver" function for JSON.parse. It safely handles 'unknown' values.
function jsonReviver(key: string, value: unknown) {
  // We must first check if the value is an object before accessing properties.
  if (typeof value === 'object' && value !== null && 'type' in value && value.type === 'bigint' && 'value' in value) {
    // This is a type guard to ensure the structure is what we expect.
    return BigInt((value as {value: string}).value);
  }
  return value;
}

function usePersistentState<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item, jsonReviver) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // The replacer function also uses 'unknown' for type safety.
        const replacer = (key: string, value: unknown) => {
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