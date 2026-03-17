import React from "react";
import { Pressable, Text } from "react-native";
import { styles } from "../styles/budgetStyles";

type Props = {
  title: string;
  onPress: () => void;
};

const PressableButton = ({ title, onPress }: Props) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => [
      styles.pressableButton,
      pressed && styles.pressableButtonPressed,
    ]}
  >
    <Text style={styles.pressableText}>{title}</Text>
  </Pressable>
);

export default PressableButton;