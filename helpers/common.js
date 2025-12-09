import { Dimensions } from 'react-native';

const { width: deviceWidth, height: deviceHeight } = Dimensions.get('window');

/**
 * Responsive width percentage
 * @param {number} percentage - Percentage of screen width (0-100)
 */
export const wp = (percentage) => {
  return (percentage * deviceWidth) / 100;
};

/**
 * Responsive height percentage
 * @param {number} percentage - Percentage of screen height (0-100)
 */
export const hp = (percentage) => {
  return (percentage * deviceHeight) / 100;
};

/**
 * Get device dimensions
 */
export const getDeviceDimensions = () => ({
  width: deviceWidth,
  height: deviceHeight,
});

/**
 * Format date to Italian locale
 * @param {Date|string} date
 * @param {object} options - Intl.DateTimeFormat options
 */
export const formatDate = (date, options = {}) => {
  const defaultOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  };
  
  return new Date(date).toLocaleDateString('it-IT', defaultOptions);
};

/**
 * Format time to HH:MM
 * @param {Date|string} date
 */
export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date for display in calendar
 * @param {Date|string} date
 */
export const formatCalendarDate = (date) => {
  const d = new Date(date);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (d.toDateString() === today.toDateString()) {
    return 'Oggi';
  }
  if (d.toDateString() === tomorrow.toDateString()) {
    return 'Domani';
  }

  return d.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

/**
 * Get user initials from name
 * @param {string} firstName
 * @param {string} lastName
 */
export const getInitials = (firstName, lastName) => {
  const first = firstName?.charAt(0)?.toUpperCase() || '';
  const last = lastName?.charAt(0)?.toUpperCase() || '';
  return `${first}${last}`;
};

/**
 * Truncate text with ellipsis
 * @param {string} text
 * @param {number} maxLength
 */
export const truncateText = (text, maxLength) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get relative time (e.g., "2 ore fa", "ieri")
 * @param {Date|string} date
 */
export const getRelativeTime = (date) => {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now - then;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Ora';
  if (diffMins < 60) return `${diffMins} min fa`;
  if (diffHours < 24) return `${diffHours} ore fa`;
  if (diffDays === 1) return 'Ieri';
  if (diffDays < 7) return `${diffDays} giorni fa`;

  return formatDate(date, { day: 'numeric', month: 'short' });
};