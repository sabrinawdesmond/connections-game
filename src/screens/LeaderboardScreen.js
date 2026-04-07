import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebase";
import { PUZZLE_ID, THEME } from "../data/puzzle";
import { getThemeColor } from "../data/themes";

const TOP_ROW_COLOR = getThemeColor(THEME, "Straightforward");

const MEDALS = ["🥇", "🥈", "🥉"];

export default function LeaderboardScreen({ navigation }) {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchScores();
  }, []);

  async function fetchScores() {
    try {
      const q = query(
        collection(db, "scores"),
        where("puzzleId", "==", PUZZLE_ID),
        orderBy("score", "desc"),
        limit(20)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setScores(data);
    } catch (e) {
      console.error("Failed to fetch scores:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  function formatTime(seconds) {
    if (!seconds && seconds !== 0) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  function renderItem({ item, index }) {
    return (
      <View style={[styles.row, index === 0 && styles.topRow]}>
        <Text style={styles.rank}>{MEDALS[index] ?? `${index + 1}`}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{item.playerName}</Text>
          <Text style={styles.details}>
            {item.won ? "✅ Won" : "❌ Lost"} · {item.mistakes} mistake{item.mistakes !== 1 ? "s" : ""} · {formatTime(item.elapsed)}
          </Text>
        </View>
        <Text style={styles.score}>{item.score ?? 0}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.page}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Leaderboard</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <ActivityIndicator style={{ marginTop: 40 }} size="large" color="#F9F9F3" />
        ) : scores.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No scores yet. Be the first!</Text>
          </View>
        ) : (
          <FlatList
            data={scores}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchScores();
                }}
              />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#121212" },
  page: {
    flex: 1,
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  back: { color: "#AAA", fontSize: 15 },
  title: { fontSize: 20, fontWeight: "800", color: "#F9F9F3" },
  list: { padding: 16 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  topRow: {
    borderWidth: 2,
    borderColor: TOP_ROW_COLOR,
  },
  rank: { fontSize: 22, width: 36 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: "700", color: "#F9F9F3" },
  details: { fontSize: 12, color: "#888", marginTop: 2 },
  score: { fontSize: 20, fontWeight: "800", color: "#F9F9F3" },
  empty: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#666", fontSize: 16 },
});
