export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  Budget: {
    userName: string;
    roomates: string[];
  };
};
