export interface Theme {
  background: string;
  text: string;
  textSecondary: string;
  placeholderText: string;
  border: string;
  primary: string;
  success: string;
  error: string;
  inputBackground: string;
  cardBackground: string;
  modalBackground: string;
  tintColor: string;
}

export const lightTheme: Theme = {
  background: '#FFFFFF',
  text: '#000000',
  textSecondary: '#666666',
  placeholderText: '#999999',
  border: '#E0E0E0',
  primary: '#007AFF',
  success: '#34C759',
  error: '#FF3B30',
  inputBackground: '#F5F5F5',
  cardBackground: '#FFFFFF',
  modalBackground: '#FFFFFF',
  tintColor: '#007AFF',
};

export const darkTheme: Theme = {
  background: '#1C1C1E',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  placeholderText: '#999999',
  border: '#444444',
  primary: '#0A84FF',
  success: '#34C759',
  error: '#FF453A',
  inputBackground: '#2C2C2E',
  cardBackground: '#2C2C2E',
  modalBackground: '#2C2C2E',
  tintColor: '#0A84FF',
};
