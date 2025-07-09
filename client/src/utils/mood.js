export const detectMood = (text) => {
  const t = text.toLowerCase();
  if (t.includes("fail") || t.includes("late") || t.includes("hate")) return "angry";
  if (t.includes("love") || t.includes("thank")) return "happy";
  if (t.includes("alone") || t.includes("cry")) return "sad";
  return "neutral";
};