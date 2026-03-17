import React from "react";
import { Text, View, Pressable } from "react-native";
import ReanimatedSwipeable from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";

import { Expense } from "../types/Expense";
import { styles } from "../styles/budgetStyles";

type Props = {
  item: Expense;
  onDelete: (id: string) => void;
};

const ExpenseItem = ({ item, onDelete }: Props) => {

  const renderRightActions = (progress: any, dragX: any) => {

    const animatedStyle = useAnimatedStyle(() => {
      const translateX = interpolate(
        dragX.value,
        [-100, 0],
        [0, 100],
        Extrapolation.CLAMP
      );

      const opacity = interpolate(
        progress.value,
        [0, 1],
        [0, 1],
        Extrapolation.CLAMP
      );

      return {
        transform: [{ translateX }],
        opacity,
      };
    });

    return (
      <Animated.View style={[styles.deleteButton, animatedStyle]}>
        <Pressable onPress={() => onDelete(item.id)}>
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </Animated.View>
    );
  };

  const formattedDate = item.date
    ? new Date(item.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        })
    : null;

  return (
    <ReanimatedSwipeable renderRightActions={renderRightActions}>
      <View style={styles.expenseItem}>
        <View>
          <Text style={styles.expenseName}>{item.name}</Text>
          <Text style={styles.expenseMeta}>{formattedDate} Paid by {item.paidBy}</Text>
        </View>

        <Text style={styles.expenseAmount}>${item.amount}</Text>
      </View>
    </ReanimatedSwipeable>
  );
};

export default ExpenseItem;
