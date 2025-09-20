
import { useState, useEffect } from 'react';
import { supabase } from '../app/integrations/supabase/client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const AUTH_KEY = 'gesecolage_auth';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Check for stored auth data
      const storedAuth = await AsyncStorage.getItem(AUTH_KEY);
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        setUser(authData.user);
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setLoading(true);

      // Query the app_users table for authentication
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('username', username)
        .single();

      if (error || !data) {
        return { success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' };
      }

      // In a real app, you would hash and compare passwords
      // For now, we'll use a simple comparison (NOT SECURE for production)
      if (password !== 'password123') {
        return { success: false, message: 'Nom d\'utilisateur ou mot de passe incorrect' };
      }

      const user: User = {
        id: data.id,
        username: data.username,
        role: data.role,
        name: data.name,
        email: data.email
      };

      setUser(user);
      
      // Store auth data
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user }));

      return { success: true };
    } catch (error) {
      console.log('Login error:', error);
      return { success: false, message: 'Erreur de connexion' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      await AsyncStorage.removeItem(AUTH_KEY);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };
};
