import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { GROUPS } from "../data/puzzle";
import ConfettiOverlay from "../components/ConfettiOverlay";

export default function ResultScreen({ navigation, route }) {
  const { playerName, mistakes, elapsed, won, groups } = route.params;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  const score = calculateScore(won, mistakes, elapsed);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    saveScore();

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, speed: 14, bounciness: 5, useNativeDriver: true }),
    ]).start();

    if (won && score > 0) {
      let start = null;
      const duration = 1000;
      const step = (timestamp) => {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);
        setDisplayScore(Math.floor(progress * score));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
  }, []);

  async function saveScore() {
    try {
      await addDoc(collection(db, "scores"), {
        playerName,
        won,
        mistakes,
        elapsed,
        score,
        createdAt: serverTimestamp(),
      });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save score:", e);
    } finally {
      setSaving(false);
    }
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ConfettiOverlay won={won} />
      <Animated.View
        style={[
          styles.container,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={styles.emoji}>{won ? "🎉" : "😬"}</Text>
        <Text style={styles.headline}>{won ? "You got it!" : "Better luck next time!"}</Text>

        <View style={styles.statsRow}>
          <Stat label="Time" value={formatTime(elapsed)} />
          <Stat label="Mistakes" value={mistakes} />
          <Stat label="Score" value={won ? displayScore : 0} />
        </View>

        {!won && (
          <View style={styles.answersContainer}>
            <Text style={styles.answersTitle}>The answers were:</Text>
            {GROUPS.map((g) => (
              <View key={g.id} style={[styles.answerRow, { backgroundColor: g.color }]}>
                <Text style={styles.answerLabel}>{g.label}</Text>
                <Text style={styles.answerWords}>{g.words.join(", ")}</Text>
              </View>
            ))}
          </View>
        )}

        {saving ? (
          <ActivityIndicator style={{ marginTop: 20 }} color="#F9F9F3" />
        ) : saved ? (
          <Text style={styles.savedText}>Score saved!</Text>
        ) : (
          <Text style={styles.savedText}>Could not save score.</Text>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.btnText}>View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.btnSecondaryText}>Play Again</Text>
        </TouchableOpacity>
      </Animated.View>
    </SafeAreaView>
  );
}

function Stat({ label, value }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function calculateScore(won, mistakes, elapsed) {
  if (!won) return 0;
  return Math.max(0, 1000 - mistakes * 150 - elapsed);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 60, marginBottom: 12 },
  headline: { fontSize: 26, fontWeight: "800", color: "#F9F9F3", marginBottom: 24 },
  statsRow: {
    flexDirection: "row",
    gap: 32,
    marginBottom: 24,
  },
  stat: { alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "800", color: "#F9F9F3" },
  statLabel: { fontSize: 12, color: "#888", marginTop: 2 },
  answersContainer: { width: "100%", marginBottom: 20 },
  answersTitle: { fontSize: 14, fontWeight: "700", marginBottom: 8, color: "#AAA" },
  answerRow: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 6,
    alignItems: "center",
  },
  answerLabel: { fontWeight: "800", fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "#1A1A1A" },
  answerWords: { fontSize: 12, marginTop: 2, color: "#1A1A1A" },
  savedText: { color: "#666", fontSize: 13, marginTop: 12 },
  btn: {
    backgroundColor: "#F9F9F3",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  btnText: { color: "#121212", fontWeight: "700", fontSize: 16 },
  btnSecondary: {
    borderWidth: 2,
    borderColor: "#F9F9F3",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 12,
    width: "80%",
    alignItems: "center",
  },
  btnSecondaryText: { color: "#F9F9F3", fontWeight: "700", fontSize: 16 },
});
