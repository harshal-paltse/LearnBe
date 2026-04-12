import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useLocalStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((data) => {
        if (data !== null) setValue(JSON.parse(data));
      })
      .finally(() => setLoading(false));
  }, [key]);

  const set = useCallback(
    async (newValue: T) => {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    },
    [key]
  );

  const remove = useCallback(async () => {
    setValue(defaultValue);
    await AsyncStorage.removeItem(key);
  }, [key, defaultValue]);

  return { value, set, remove, loading };
}
