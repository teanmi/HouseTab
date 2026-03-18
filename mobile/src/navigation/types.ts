export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AppStackParamList = {
  Home: undefined;
  HouseList: undefined;
  CreateHouse: undefined;
  JoinHouse: undefined;
  HouseDetails: { houseId: number };
  Budget: {
    userName: string;
    roomates: string[];
  };
  
};
