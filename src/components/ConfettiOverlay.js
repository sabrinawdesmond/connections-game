import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Dimensions } from "react-native";

const { width: SW, height: SH } = Dimensions.get("window");

const WIN_EMOJIS = ["💍", "🌹", "💐", "🥂", "🌸", "🪷", "🤍", "🎊", "💒", "🫶"];
const LOSE_EMOJIS = ["😭", "😭", "😢", "😭", "😢", "😭"];

function createParticles(won, count = 40) {
  const emojis = won ? WIN_EMOJIS : LOSE_EMOJIS;
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * SW,
    emoji: emojis[Math.floor(Math.random() * emojis.length)],
    size: 20 + Math.random() * 16,
    delay: Math.random() * 2000,
    duration: 2200 + Math.random() * 1800,
    drift: (Math.random() - 0.5) * 100,
  }));
}

function Particle({ x, emoji, size, delay, duration, drift }) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: SH + 60,
          duration,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: drift,
          duration,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.delay(duration * 0.65),
          Animated.timing(opacity, {
            toValue: 0,
            duration: duration * 0.35,
            useNativeDriver: true,
          }),
        ]),
      ]),
    ]).start();
  }, []);

  return (
    <Animated.Text
      style={{
        position: "absolute",
        left: x,
        top: 0,
        fontSize: size,
        opacity,
        transform: [{ translateX }, { translateY }],
      }}
    >
      {emoji}
    </Animated.Text>
  );
}

export default function ConfettiOverlay({ won }) {
  const particles = useRef(createParticles(won)).current;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Particle key={p.id} {...p} />
      ))}
    </View>
  );
}
