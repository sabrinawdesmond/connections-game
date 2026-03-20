import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PUZZLE_TITLE } from "../data/puzzle";

export default function HomeScreen({ navigation }) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  async function handlePlay() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Please enter a nickname to continue.");
      return;
    }
    await AsyncStorage.setItem("playerName", trimmed);
    navigation.navigate("Game", { playerName: trimmed });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.bigEmoji}>👰🏻‍♀️💍</Text>
        <Text style={styles.title}>{PUZZLE_TITLE}</Text>
        <Text style={styles.subtitle}>
          Group the 16 words into four categories.{"\n"}You have 4 mistakes before it's game over.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your nickname</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. PuzzlePro"
            placeholderTextColor="#666"
            value={name}
            onChangeText={(t) => { setName(t); setError(""); }}
            maxLength={20}
            autoCorrect={false}
          />
          {!!error && <Text style={styles.error}>{error}</Text>}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handlePlay}>
          <Text style={styles.btnText}>Play</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.btnSecondary}
          onPress={() => navigation.navigate("Leaderboard")}
        >
          <Text style={styles.btnSecondaryText}>Leaderboard</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  bigEmoji: { fontSize: 64, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: "800", color: "#F9F9F3", textAlign: "center" },
  subtitle: {
    fontSize: 14,
    color: "#AAA",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 32,
    lineHeight: 20,
  },
  inputGroup: { width: "100%", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#AAA", marginBottom: 6 },
  input: {
    borderWidth: 2,
    borderColor: "#444",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#1E1E1E",
    color: "#F9F9F3",
  },
  error: { color: "#FF6B6B", fontSize: 12, marginTop: 4 },
  btn: {
    backgroundColor: "#F9F9F3",
    borderRadius: 24,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "#121212", fontWeight: "700", fontSize: 17 },
  btnSecondary: {
    borderWidth: 2,
    borderColor: "#F9F9F3",
    borderRadius: 24,
    paddingVertical: 14,
    width: "100%",
    alignItems: "center",
  },
  btnSecondaryText: { color: "#F9F9F3", fontWeight: "700", fontSize: 17 },
});
