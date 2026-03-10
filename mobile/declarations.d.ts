declare module '@react-native-async-storage/async-storage' {
  const AsyncStorage: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };

  export default AsyncStorage;
}

declare module '@react-navigation/native-stack' {
  export type NativeStackScreenProps<
    ParamList extends Record<string, object | undefined>,
    RouteName extends keyof ParamList,
  > = {
    navigation: {
      navigate: (screen: keyof ParamList) => void;
    };
    route: {
      key: string;
      name: RouteName;
      params: ParamList[RouteName];
    };
  };

  export function createNativeStackNavigator<
    ParamList extends Record<string, object | undefined>,
  >(): any;
}
