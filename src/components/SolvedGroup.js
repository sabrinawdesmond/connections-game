import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";

export default function SolvedGroup({ group }) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 14,
        bounciness: 5,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: group.color },
        { transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Text style={styles.label}>{group.label}</Text>
      <Text style={styles.words}>{group.words.join(", ")}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    alignItems: "center",
  },
  label: {
    fontWeight: "800",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  words: {
    fontSize: 13,
    color: "#1A1A1A",
    textAlign: "center",
  },
});
