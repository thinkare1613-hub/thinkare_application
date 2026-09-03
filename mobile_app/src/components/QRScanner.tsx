import { StyleSheet, Text, View } from "react-native";
export function QRScanner() { return <View style={styles.scanner}><Text style={styles.icon}>▦</Text><Text style={styles.text}>Camera scanner</Text></View>; }
const styles = StyleSheet.create({ scanner: { flex: 1, minHeight: 260, borderRadius: 24, borderWidth: 2, borderStyle: "dashed", borderColor: "#9bc7af", backgroundColor: "#eaf5ef", justifyContent: "center", alignItems: "center" }, icon: { color: "#0d8f7c", fontSize: 64 }, text: { color: "#17362c", fontWeight: "700", marginTop: 12 } });
