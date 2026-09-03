import { Pressable, StyleSheet, Text } from "react-native";
export function PrimaryButton({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.button, pressed && styles.pressed]}><Text style={styles.text}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({ button: { backgroundColor: "#0d8f7c", borderRadius: 14, padding: 17, alignItems: "center" }, pressed: { opacity: 0.8 }, text: { color: "#fff", fontSize: 16, fontWeight: "700" } });
