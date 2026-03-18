import React, { useEffect, useRef } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

export default function Tile({ word, selected, onPress, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 0.94 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [selected]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }], flex: 1, margin: 4 }}>
      <TouchableOpacity
        style={[styles.tile, selected && styles.selected, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        <Text style={[styles.word, selected && styles.selectedWord]} numberOfLines={2} adjustsFontSizeToFit>
          {word}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: "#EFEFE6",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  selected: {
    backgroundColor: "#5A594E",
  },
  disabled: {
    opacity: 0.5,
  },
  word: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    color: "#1A1A1A",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  selectedWord: {
    color: "#FFFFFF",
  },
});
