import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const formatCOP = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const validatePassword = (password) => {
  const errors = [];
  if (password.length < 8) errors.push('Mínimo 8 caracteres');
  if (!/[A-Z]/.test(password)) errors.push('Al menos 1 mayúscula');
  if (!/[a-z]/.test(password)) errors.push('Al menos 1 minúscula');
  if (!/[0-9]/.test(password)) errors.push('Al menos 1 número');
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push('Al menos 1 carácter especial');
  return { isValid: errors.length === 0, errors };
};

export const authenticateUser = async (username, password) => {
  try {
    const { data } = await axios.post(`${API_URL}/usuarios/login`, { username, password });
    localStorage.setItem('currentUser', JSON.stringify({ username: data.username }));
    return { success: true, user: { username: data.username } };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error al iniciar sesión' };
  }
};

export const registerUser = async (username, password) => {
  try {
    await axios.post(`${API_URL}/usuarios/register`, { username, password });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.response?.data?.message || 'Error al registrar' };
  }
};

export const isAuthenticated = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getPasswordStrength = (password) => {
  let strength = 0;
  if (password.length >= 8) strength += 30;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
  if (strength <= 40) return { label: 'Débil', color: 'bg-red-500' };
  if (strength <= 70) return { label: 'Media', color: 'bg-yellow-500' };
  return { label: 'Fuerte', color: 'bg-green-500' };
};
