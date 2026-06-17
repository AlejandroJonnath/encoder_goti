import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  centerContent: { flex: 1, padding: 24, justifyContent: "center" },
  scrollContent: { padding: 24, alignItems: "center" },
  uploadBox: {
    width: "100%",
    height: 250,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  uploadText: { fontSize: 20, fontWeight: "bold", marginTop: 16, textAlign: "center" },
  uploadSubtext: { fontSize: 14, color: "#666", marginTop: 8 },
  fileInfoBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    elevation: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  actionButton: {
    width: "100%",
    padding: 18,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  actionButtonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  loadingBox: { alignItems: "center", marginVertical: 32 },
  loadingText: { marginTop: 16, color: "#0EA5E9", fontWeight: "bold", textAlign: "center" },
  loadingSubtext: { marginTop: 8, color: "#666", fontSize: 14, textAlign: "center" },
  resultBox: {
    width: "100%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    marginBottom: 24,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0EA5E9",
    marginBottom: 12,
  },
  resultText: { fontSize: 14, color: "#333", lineHeight: 22 },
  cancelButton: { marginTop: 16, padding: 8 },
  cancelText: { color: "#888", fontSize: 14 },
  
  // Language selectors
  langSelectorContainer: {
    width: "100%",
    marginBottom: 24,
  },
  langLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  langGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  langChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#E0F2FE", // light blue
    marginBottom: 10,
    width: "48%",
    alignItems: "center",
  },
  langChipActive: {
    backgroundColor: "#0EA5E9", // solid blue
  },
  langChipText: {
    color: "#0284C7",
    fontWeight: "600",
  },
  langChipTextActive: {
    color: "#FFF",
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  halfButton: {
    width: "48%",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#0EA5E9",
  },
  halfButtonText: {
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold",
    marginLeft: 8
  }
});
