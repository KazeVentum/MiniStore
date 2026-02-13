export const cn = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date) => {
  if (!date) return 'Sin fecha';

  try {
    // Basic normalization for SQLite dates (YYYY-MM-DD HH:MM:SS) 
    // replacing space with T for valid ISO parsing if needed
    const normalizedDate = typeof date === 'string' && !date.includes('T')
      ? date.replace(' ', 'T')
      : date;

    const d = new Date(normalizedDate);

    if (isNaN(d.getTime())) {
      console.warn('Invalid date format:', date);
      return 'Fecha inválida';
    }

    return d.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error fecha';
  }
};

export const getDaysUntilDate = (targetDate) => {
  const today = new Date();
  const target = new Date(targetDate);
  const diffTime = target - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const isToday = (date) => {
  const today = new Date();
  const target = new Date(date);
  return (
    today.getDate() === target.getDate() &&
    today.getMonth() === target.getMonth() &&
    today.getFullYear() === target.getFullYear()
  );
};

export const isTomorrow = (date) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return isToday(date, tomorrow);
};
