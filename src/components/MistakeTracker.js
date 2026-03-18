import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MAX_MISTAKES = 4;

export default function MistakeTracker({ mistakes }) {
  const remaining = MAX_MISTAKES - mistakes;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Mistakes remaining:</Text>
      <View style={styles.dots}>
        {Array.from({ length: MAX_MISTAKES }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i >= remaining && styles.dotUsed]}
          />
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
    color: "#555",
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
    backgroundColor: "#5A594E",
  },
  dotUsed: {
    backgroundColor: "#D3D3C7",
  },
});
