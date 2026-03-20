import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Animated,
  Share,
} from "react-native";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase";
import { GROUPS, PUZZLE_TITLE } from "../data/puzzle";
import ConfettiOverlay from "../components/ConfettiOverlay";

const COLOR_EMOJI = {
  "#F9DF6D": "🟨",
  "#A0C35A": "🟩",
  "#B0C4EF": "🟦",
  "#BA81C5": "🟪",
};

export default function ResultScreen({ navigation, route }) {
  const { playerName, mistakes, elapsed, won, groups, solvedGroups } = route.params;
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(true);
  const [displayScore, setDisplayScore] = useState(0);

  const score = calculateScore(won, mistakes, elapsed);
  const accuracy = Math.round((4 / (4 + mistakes)) * 100);

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

  function handleShare() {
    const lines = [PUZZLE_TITLE];
    if (won && solvedGroups?.length) {
      solvedGroups.forEach((g) => {
        lines.push((COLOR_EMOJI[g.color] ?? "⬜").repeat(4));
      });
    }
    lines.push(`Mistakes: ${mistakes} | Time: ${formatTime(elapsed)}`);
    if (won) lines.push(`Score: ${score}`);
    Share.share({ message: lines.join("\n") });
  }

  function handlePlayAgain() {
    navigation.reset({
      index: 1,
      routes: [
        { name: "Home" },
        { name: "Game", params: { playerName } },
      ],
    });
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
          {won && <Stat label="Accuracy" value={`${accuracy}%`} />}
          <Stat label="Time" value={formatTime(elapsed)} />
          <Stat label="Mistakes" value={mistakes} />
          {won && <Stat label="Score" value={displayScore} />}
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

        {won && (
          <TouchableOpacity style={styles.btnShare} onPress={handleShare}>
            <Text style={styles.btnShareText}>Share Result</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.btn}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.btnText}>View Leaderboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnSecondary} onPress={handlePlayAgain}>
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
  // Accuracy-first: a perfect-but-slow player always outscores a faster wrong guesser
  return (4 - mistakes) * 250 + Math.max(0, 200 - elapsed);
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: { flex: 1, padding: 24, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 60, marginBottom: 12 },
  headline: { fontSize: 26, fontWeight: "800", color: "#F9F9F3", marginBottom: 24 },
  statsRow: {
    flexDirection: "row",
    gap: 24,
    marginBottom: 24,
    flexWrap: "wrap",
    justifyContent: "center",
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
  btnShare: {
    borderWidth: 2,
    borderColor: "#A0C35A",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 20,
    width: "80%",
    alignItems: "center",
  },
  btnShareText: { color: "#A0C35A", fontWeight: "700", fontSize: 16 },
  btn: {
    backgroundColor: "#F9F9F3",
    borderRadius: 24,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 12,
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
