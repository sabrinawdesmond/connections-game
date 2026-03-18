import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  SafeAreaView,
  Alert,
} from "react-native";
import { GROUPS, WORD_MAP, getShuffledWords, PUZZLE_TITLE } from "../data/puzzle";
import Tile from "../components/Tile";
import SolvedGroup from "../components/SolvedGroup";
import MistakeTracker from "../components/MistakeTracker";

const MAX_MISTAKES = 4;

export default function GameScreen({ navigation, route }) {
  const playerName = route?.params?.playerName ?? "Anonymous";

  const [words, setWords] = useState(getShuffledWords);
  const [selected, setSelected] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameOver, setGameOver] = useState(false); // 'won' | 'lost' | false
  const [message, setMessage] = useState("");

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());

  // Show a temporary message
  function flashMessage(msg) {
    setMessage(msg);
    setTimeout(() => setMessage(""), 2000);
  }

  function shake() {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  }

  function toggleSelect(word) {
    if (selected.includes(word)) {
      setSelected(selected.filter((w) => w !== word));
    } else if (selected.length < 4) {
      setSelected([...selected, word]);
    }
  }

  function handleShuffle() {
    setWords((prev) => {
      const shuffled = [...prev];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return shuffled;
    });
  }

  function handleSubmit() {
    if (selected.length !== 4) return;

    const groupIds = selected.map((w) => WORD_MAP[w]);
    const allSame = groupIds.every((id) => id === groupIds[0]);

    if (allSame) {
      const solvedGroup = GROUPS.find((g) => g.id === groupIds[0]);
      const newSolvedGroups = [...solvedGroups, solvedGroup];
      setSolvedGroups(newSolvedGroups);
      setWords((prev) => prev.filter((w) => !selected.includes(w)));
      setSelected([]);

      if (newSolvedGroups.length === GROUPS.length) {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        setGameOver("won");
        navigation.navigate("Result", {
          playerName,
          mistakes,
          elapsed,
          won: true,
        });
      }
    } else {
      // Check if "one away"
      const counts = {};
      groupIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
      const isOneAway = Object.values(counts).some((v) => v === 3);

      shake();
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setSelected([]);

      if (isOneAway) {
        flashMessage("One away...");
      } else {
        flashMessage("Not quite!");
      }

      if (newMistakes >= MAX_MISTAKES) {
        const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
        setGameOver("lost");
        navigation.navigate("Result", {
          playerName,
          mistakes: newMistakes,
          elapsed,
          won: false,
          groups: GROUPS,
        });
      }
    }
  }

  const rows = [];
  for (let i = 0; i < words.length; i += 4) {
    rows.push(words.slice(i, i + 4));
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{PUZZLE_TITLE}</Text>
        <Text style={styles.subtitle}>Create four groups of four!</Text>

        {/* Solved groups slide in at the top */}
        {solvedGroups.map((g) => (
          <SolvedGroup key={g.id} group={g} />
        ))}

        {/* Board */}
        <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.row}>
              {row.map((word) => (
                <Tile
                  key={word}
                  word={word}
                  selected={selected.includes(word)}
                  onPress={() => toggleSelect(word)}
                  disabled={!!gameOver}
                />
              ))}
            </View>
          ))}
        </Animated.View>

        {/* Flash message */}
        {!!message && (
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>{message}</Text>
          </View>
        )}

        <MistakeTracker mistakes={mistakes} />

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={handleShuffle}>
            <Text style={styles.btnSecondaryText}>Shuffle</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btnSecondary}
            onPress={() => setSelected([])}
            disabled={selected.length === 0}
          >
            <Text style={styles.btnSecondaryText}>Deselect All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btnPrimary, selected.length !== 4 && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={selected.length !== 4}
          >
            <Text style={styles.btnPrimaryText}>Submit</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.leaderboardLink}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.leaderboardLinkText}>View Leaderboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9F9F3" },
  container: { padding: 16, alignItems: "stretch" },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    color: "#1A1A1A",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#666",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  messageBubble: {
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  messageText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    flexWrap: "wrap",
  },
  btnPrimary: {
    backgroundColor: "#1A1A1A",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnPrimaryText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 14,
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: "#1A1A1A",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnSecondaryText: {
    color: "#1A1A1A",
    fontWeight: "700",
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: "#AAA",
    borderColor: "#AAA",
  },
  leaderboardLink: {
    marginTop: 20,
    alignSelf: "center",
  },
  leaderboardLinkText: {
    color: "#555",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
