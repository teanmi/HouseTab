import React, { useMemo } from 'react';
import { Pressable, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { createBudgetStyles } from '../styles/budgetStyles';

type Props = {
  title: string;
  onPress: () => void;
};

const PressableButton = ({ title, onPress }: Props) => {
  const { theme } = useTheme();
  const styles = useMemo(() => createBudgetStyles(theme), [theme]);

  return (
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
};

export default PressableButton;
