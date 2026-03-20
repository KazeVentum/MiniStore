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
  
  if (password.length < 8) {
    errors.push('Mínimo 8 caracteres');
  }
  if (password.length > 12) {
    errors.push('Máximo 12 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Al menos 1 mayúscula');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Al menos 1 minúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Al menos 1 número');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Al menos 1 carácter especial');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const authenticateUser = (username, password) => {
  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const user = storedUsers.find(u => u.username === username && u.password === password);
  
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify({ username: user.username }));
    return { success: true, user: { username: user.username } };
  }
  
  return { success: false, error: 'Usuario o contraseña incorrectos' };
};

export const registerUser = (username, password) => {
  const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
  
  if (storedUsers.find(u => u.username === username)) {
    return { success: false, error: 'El usuario ya existe' };
  }
  
  storedUsers.push({ username, password });
  localStorage.setItem('users', JSON.stringify(storedUsers));
  
  return { success: true };
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
  
  if (password.length >= 8) strength += 20;
  if (password.length <= 12) strength += 10;
  if (/[A-Z]/.test(password)) strength += 15;
  if (/[a-z]/.test(password)) strength += 15;
  if (/[0-9]/.test(password)) strength += 20;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
  
  if (strength <= 40) return { label: 'Débil', color: 'bg-red-500' };
  if (strength <= 70) return { label: 'Media', color: 'bg-yellow-500' };
  return { label: 'Fuerte', color: 'bg-green-500' };
};