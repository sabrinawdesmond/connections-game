import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

const MAX_MISTAKES = 4;

function Dot({ used }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prevUsed = useRef(false);

  useEffect(() => {
    if (used && !prevUsed.current) {
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.4,
          useNativeDriver: true,
          speed: 30,
          bounciness: 0,
        }),
        Animated.spring(scale, {
          toValue: 0,
          useNativeDriver: true,
          speed: 20,
          bounciness: 4,
        }),
      ]).start();
    }
    prevUsed.current = used;
  }, [used]);

  return (
    <Animated.View style={[styles.dot, used && styles.dotUsed, { transform: [{ scale }] }]} />
  );
}

export default function MistakeTracker({ mistakes }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mistakes remaining:</Text>
      <View style={styles.dots}>
        {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
          <Dot key={i} used={i < mistakes} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 10,
  },
  label: {
    fontSize: 13,
    color: "#AAA",
    marginBottom: 6,
  },
  dots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#F9F9F3",
  },
  dotUsed: {
    backgroundColor: "#444",
  },
});
