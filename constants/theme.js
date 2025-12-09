// Colori estratti dal logo TuttoScuola

export const theme = {
  colors: {
    // Primary - Giallo matita
    primary: '#f0b82e',
    primaryDark: '#d9a526',
    primaryLight: '#f5cb5e',

    // Secondary - Blu-grigio (righello/globo)
    secondary: '#6e8d9b',
    secondaryDark: '#5a7a88',
    secondaryLight: '#8aa5b1',

    // Accent - Arancione (punta matita, libro ABC)
    accent: '#dd592a',
    accentLight: '#e57a52',

    // Background - Crema
    background: '#f7edd9',
    backgroundDark: '#efe3cb',
    card: '#ffffff',

    // Text - Marrone scuro
    text: '#2b1b18',
    textLight: '#5c4a46',
    textDark: '#1a100e',

    // Neutrals
    dark: '#2b1b18',
    darkLight: '#e8e0d4',
    gray: '#d4ccc0',
    grayLight: '#ebe5db',

    // Status
    success: '#4caf50',
    successLight: '#81c784',
    error: '#dd592a',
    errorLight: '#e57a52',
    warning: '#f0b82e',
    warningLight: '#f5cb5e',

    // UI
    border: '#d4ccc0',
    placeholder: '#9c8f85',
    disabled: '#c4b8aa',
  },

  fonts: {
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },

  radius: {
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14,
    xl: 16,
    xxl: 20,
    full: 9999,
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },

  shadows: {
    sm: {
      shadowColor: '#2b1b18',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#2b1b18',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    lg: {
      shadowColor: '#2b1b18',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },
};

// Semantic colors per ruoli
export const roleColors = {
  student: theme.colors.primary,      // Giallo
  teacher: theme.colors.secondary,    // Blu-grigio
  admin: theme.colors.accent,         // Arancione
};

// Colori per tipi di slot
export const slotTypeColors = {
  interrogazione: '#dd592a',  // Arancione - importante
  verifica: '#e53935',        // Rosso - urgente
  altro: '#6e8d9b',           // Blu-grigio - neutro
};