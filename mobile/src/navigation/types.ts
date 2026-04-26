export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  CreateHouse: undefined;
  JoinHouse: undefined;
  HouseDetails: { houseId: number };
  Budget: {
    userName: string;
    houseId: number;
  };
  
};
