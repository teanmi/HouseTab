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
  background: '#F7FBFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  placeholderText: '#94A3B8',
  border: '#D6E6F2',
  primary: '#2983B7',
  success: '#34C759',
  error: '#FF3B30',
  inputBackground: '#FFFFFF',
  cardBackground: '#FFFFFF',
  modalBackground: '#FFFFFF',
  tintColor: '#2983B7',
};

export const darkTheme: Theme = {
  background: '#0B1720',
  text: '#EAF3FA',
  textSecondary: '#9FB6C7',
  placeholderText: '#7E97A8',
  border: '#1F3442',
  primary: '#2983B7',
  success: '#34C759',
  error: '#FF453A',
  inputBackground: '#102532',
  cardBackground: '#112736',
  modalBackground: '#112736',
  tintColor: '#2983B7',
};