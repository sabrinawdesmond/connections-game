import React, { useEffect, useRef, useState } from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from "react-native";

function tileFont(str) {
  if (str.length > 11) return 9;
  if (str.length > 8)  return 11;
  if (str.length > 5)  return 12.5;
  return 14;
}

export default function Tile({ word, selected, onPress, disabled, flipping, flipDelay, flipColor }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const flipScaleX = useRef(new Animated.Value(1)).current;
  const [showFlipColor, setShowFlipColor] = useState(false);

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: selected ? 0.94 : 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  }, [selected]);

  useEffect(() => {
    if (!flipping) return;

    const timeout = setTimeout(() => {
      Animated.timing(flipScaleX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start(() => {
        setShowFlipColor(true);
        Animated.timing(flipScaleX, {
          toValue: 1,
          duration: 280,
          useNativeDriver: true,
        }).start();
      });
    }, flipDelay || 0);

    return () => clearTimeout(timeout);
  }, [flipping]);

  const bgColor = showFlipColor ? flipColor : (selected ? "#F9F9F3" : "#2A2A2A");
  const textColor = showFlipColor ? "#1A1A1A" : (selected ? "#121212" : "#F9F9F3");

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }, { scaleX: flipScaleX }], flex: 1, margin: 4 }}>
      <TouchableOpacity
        style={[styles.tile, { backgroundColor: bgColor }, disabled && styles.disabled]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
      >
        {word.includes(" ")
          ? word.split(" ").map((w, i) => (
              <Text key={i} style={[styles.word, { color: textColor, fontSize: tileFont(w) }]}>
                {w}
              </Text>
            ))
          : <Text style={[styles.word, { color: textColor, fontSize: tileFont(word) }]}>
              {word}
            </Text>
        }
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    padding: 6,
  },
  disabled: {
    opacity: 0.5,
  },
  word: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
});
