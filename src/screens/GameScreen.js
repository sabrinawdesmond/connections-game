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
import * as Haptics from "expo-haptics";
import { GROUPS, WORD_MAP, getShuffledWords, PUZZLE_TITLE } from "../data/puzzle";
import Tile from "../components/Tile";
import SolvedGroup from "../components/SolvedGroup";
import MistakeTracker from "../components/MistakeTracker";
import ConfettiOverlay from "../components/ConfettiOverlay";

const MAX_MISTAKES = 4;

export default function GameScreen({ navigation, route }) {
  const playerName = route?.params?.playerName ?? "Anonymous";

  const [words, setWords] = useState(getShuffledWords);
  const [selected, setSelected] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [mistakes, setMistakes] = useState(0);
  const [previousGuesses, setPreviousGuesses] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [flippingGroup, setFlippingGroup] = useState(null);
  const [showWinConfetti, setShowWinConfetti] = useState(false);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const messageOpacity = useRef(new Animated.Value(0)).current;
  const startTime = useRef(Date.now());
  const messageAnimation = useRef(null);

  // Back button guard — prompt before leaving mid-game
  useEffect(() => {
    if (gameOver) return;
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      Alert.alert(
        "Leave game?",
        "Your progress will be lost.",
        [
          { text: "Stay", style: "cancel" },
          { text: "Leave", style: "destructive", onPress: () => navigation.dispatch(e.data.action) },
        ]
      );
    });
    return unsubscribe;
  }, [navigation, gameOver]);

  function flashMessage(msg, duration = 2000) {
    if (messageAnimation.current) messageAnimation.current.stop();
    setMessage(msg);
    messageOpacity.setValue(0);
    messageAnimation.current = Animated.sequence([
      Animated.timing(messageOpacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(duration - 380),
      Animated.timing(messageOpacity, { toValue: 0, duration: 200, useNativeDriver: true }),
    ]);
    messageAnimation.current.start(() => setMessage(""));
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

    const sortedGuess = [...selected].sort().join(",");
    if (previousGuesses.includes(sortedGuess)) {
      flashMessage("Already guessed!");
      return;
    }

    const groupIds = selected.map((w) => WORD_MAP[w]);
    const allSame = groupIds.every((id) => id === groupIds[0]);

    setPreviousGuesses((prev) => [...prev, sortedGuess]);

    if (allSame) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const solvedGroup = GROUPS.find((g) => g.id === groupIds[0]);
      setFlippingGroup({ words: [...selected], color: solvedGroup.color });
      setSelected([]);

      setTimeout(() => {
        const newSolvedGroups = [...solvedGroups, solvedGroup];
        setSolvedGroups(newSolvedGroups);
        setWords((prev) => prev.filter((w) => !selected.includes(w)));
        setFlippingGroup(null);

        if (newSolvedGroups.length === GROUPS.length) {
          const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
          setGameOver("won");
          setShowWinConfetti(true);
          setTimeout(() => {
            navigation.navigate("Result", {
              playerName,
              mistakes,
              elapsed,
              won: true,
              solvedGroups: newSolvedGroups,
            });
          }, 400);
        }
      }, 700);
    } else {
      const counts = {};
      groupIds.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
      const isOneAway = Object.values(counts).some((v) => v === 3);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      shake();
      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      setSelected([]);

      if (isOneAway) {
        flashMessage("One away!", 3000);
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
      {showWinConfetti && <ConfettiOverlay won={true} />}
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.inner}>
          <Text style={styles.title}>{PUZZLE_TITLE}</Text>
          <Text style={styles.subtitle}>Create four groups of four!</Text>

          {solvedGroups.map((g) => (
            <SolvedGroup key={g.id} group={g} />
          ))}

          <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
            {rows.map((row, ri) => (
              <View key={ri} style={styles.row}>
                {row.map((word) => (
                  <Tile
                    key={word}
                    word={word}
                    selected={selected.includes(word)}
                    onPress={() => toggleSelect(word)}
                    disabled={!!gameOver || !!flippingGroup}
                    flipping={!!flippingGroup?.words.includes(word)}
                    flipDelay={flippingGroup ? flippingGroup.words.indexOf(word) * 200 : 0}
                    flipColor={flippingGroup?.color}
                  />
                ))}
              </View>
            ))}
          </Animated.View>

          {!!message && (
            <Animated.View style={[styles.messageBubble, { opacity: messageOpacity }]}>
              <Text style={styles.messageText}>{message}</Text>
            </Animated.View>
          )}

          <MistakeTracker mistakes={mistakes} />

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
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: { alignItems: "center", paddingVertical: 16 },
  inner: { width: "100%", maxWidth: 500, paddingHorizontal: 16 },
  title: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 4,
    color: "#F9F9F3",
  },
  subtitle: {
    fontSize: 13,
    textAlign: "center",
    color: "#AAA",
    marginBottom: 16,
  },
  row: {
    flexDirection: "row",
    marginBottom: 0,
  },
  messageBubble: {
    backgroundColor: "#F9F9F3",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: "center",
    marginVertical: 10,
  },
  messageText: {
    color: "#121212",
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
    backgroundColor: "#F9F9F3",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  btnPrimaryText: {
    color: "#121212",
    fontWeight: "700",
    fontSize: 14,
  },
  btnSecondary: {
    borderWidth: 2,
    borderColor: "#F9F9F3",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  btnSecondaryText: {
    color: "#F9F9F3",
    fontWeight: "700",
    fontSize: 14,
  },
  btnDisabled: {
    backgroundColor: "#444",
    borderColor: "#444",
  },
  leaderboardLink: {
    marginTop: 20,
    alignSelf: "center",
  },
  leaderboardLinkText: {
    color: "#AAA",
    textDecorationLine: "underline",
    fontSize: 14,
  },
});
