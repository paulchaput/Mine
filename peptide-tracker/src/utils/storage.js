/**
 * LocalStorage utilities for data persistence
 */

const STORAGE_KEYS = {
  USER_PROTOCOLS: 'peptide_tracker_user_protocols',
  VIALS: 'peptide_tracker_vials',
  DOSES: 'peptide_tracker_doses',
  CYCLES: 'peptide_tracker_cycles',
  SETTINGS: 'peptide_tracker_settings'
};

/**
 * Save data to localStorage
 */
const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return false;
  }
};

/**
 * Load data from localStorage
 */
const loadFromStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return defaultValue;
  }
};

/**
 * User Protocols
 */
export const saveUserProtocols = (protocols) => {
  return saveToStorage(STORAGE_KEYS.USER_PROTOCOLS, protocols);
};

export const loadUserProtocols = () => {
  return loadFromStorage(STORAGE_KEYS.USER_PROTOCOLS, []);
};

/**
 * Vials
 */
export const saveVials = (vials) => {
  return saveToStorage(STORAGE_KEYS.VIALS, vials);
};

export const loadVials = () => {
  return loadFromStorage(STORAGE_KEYS.VIALS, []);
};

/**
 * Doses
 */
export const saveDoses = (doses) => {
  return saveToStorage(STORAGE_KEYS.DOSES, doses);
};

export const loadDoses = () => {
  return loadFromStorage(STORAGE_KEYS.DOSES, []);
};

/**
 * Cycles
 */
export const saveCycles = (cycles) => {
  return saveToStorage(STORAGE_KEYS.CYCLES, cycles);
};

export const loadCycles = () => {
  return loadFromStorage(STORAGE_KEYS.CYCLES, []);
};

/**
 * Settings
 */
export const saveSettings = (settings) => {
  return saveToStorage(STORAGE_KEYS.SETTINGS, settings);
};

export const loadSettings = () => {
  return loadFromStorage(STORAGE_KEYS.SETTINGS, {
    disclaimerAccepted: false,
    syringeType: 'U100',
    theme: 'light'
  });
};

/**
 * Export all data
 */
export const exportAllData = () => {
  return {
    version: '1.0',
    exportDate: new Date().toISOString(),
    data: {
      userProtocols: loadUserProtocols(),
      vials: loadVials(),
      doses: loadDoses(),
      cycles: loadCycles(),
      settings: loadSettings()
    }
  };
};

/**
 * Import all data
 */
export const importAllData = (importData) => {
  try {
    if (!importData || !importData.data) {
      throw new Error('Invalid import data');
    }

    const { data } = importData;

    if (data.userProtocols) saveUserProtocols(data.userProtocols);
    if (data.vials) saveVials(data.vials);
    if (data.doses) saveDoses(data.doses);
    if (data.cycles) saveCycles(data.cycles);
    if (data.settings) saveSettings(data.settings);

    return { success: true };
  } catch (error) {
    console.error('Error importing data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all data
 */
export const clearAllData = () => {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
