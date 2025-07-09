import React, { useRef, useState, useEffect } from "react";
import IntroText from "./components/IntroText";
import MoodMeter from "./components/MoodMeter";
import axios from "axios";
import "./App.css";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState("");
  const [mood, setMood] = useState("neutral");
  const [anger, setAnger] = useState(0);
  const [happy, setHappy] = useState(0);
  const [shake, setShake] = useState(false);
  const [showSlapImage, setShowSlapImage] = useState(false);

  const audioRef = useRef(null);
  const slapAudioRef = useRef(null);

  // 🎤 Speak Bengali reply
  const speakBengali = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "bn-IN";
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find(
      (voice) =>
        voice.lang.includes("bn") ||
        voice.name.toLowerCase().includes("bangla") ||
        voice.name.toLowerCase().includes("bengali")
    );
    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
    }
    speechSynthesis.speak(utterance);
  };

  // 🎭 Detect mood from Maa's REPLY
  const detectMood = (text) => {
    const t = text.toLowerCase();
    if (
      t.includes("মরিস") ||
      t.includes("খুন") ||
      t.includes("বোকা") ||
      t.includes("চড়") ||
      t.includes("লাথি") ||
      t.includes("অপদার্থ")
    ) return "angry";

    if (
      t.includes("আমি কেউ না") ||
      t.includes("দাম নেই") ||
      t.includes("অবহেলা") ||
      t.includes("মন খারাপ") ||
      t.includes("কাঁদছি")
    ) return "sad";

    if (
      t.includes("রসগোল্লা") ||
      t.includes("গর্ব") ||
      t.includes("ভালোবাসি") ||
      t.includes("আনন্দ") ||
      t.includes("হাসি")
    ) return "happy";

    return "neutral";
  };

  // 📩 Main interaction
  const handleAsk = async () => {
    if (!prompt.trim()) return;
    setReply("⏳ মা ভাবছে...");

    try {
      const res = await axios.post("https://maa-gpt.onrender.com/api/ask", {
        prompt,
      });
      const maaReply = res.data.reply;
      setReply(maaReply);

      const moodResult = detectMood(maaReply);
      setMood(moodResult);

      // 🗣️ Speak reply
      speakBengali(maaReply);

      // 💥 Mood effects
      if (moodResult === "angry") {
        setAnger((prev) => Math.min(prev + 20, 100));
        if (slapAudioRef.current) slapAudioRef.current.play();
        setShake(true);
        setShowSlapImage(true);
        setTimeout(() => {
          setShake(false);
          setShowSlapImage(false);
        }, 600);
      }

      if (moodResult === "happy") {
        setHappy((prev) => Math.min(prev + 20, 100));
      }

      setPrompt("");
    } catch (err) {
      console.error(err);
      setReply("⚠️ মা এখন কথা বলছে না... 😢");
    }
  };

  // 🎵 Mood-based music playback
  useEffect(() => {
    const musicMap = {
      angry: "/sounds/angry.mp3",
      sad: "/sounds/sad.mp3",
      happy: "/sounds/happy.mp3",
      neutral: "/sounds/neutral.mp3",
    };

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = musicMap[mood];
      audioRef.current.load();
      audioRef.current.play().catch(() => {});
    }
  }, [mood]);

  // 🔁 Load speech voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  return (
    <div className={`app mood-${mood} ${shake ? "shake" : ""}`}>
      <IntroText />

      <textarea
        placeholder="মাকে কিছু বলো..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleAsk}>মাকে বলো</button>

      {reply && <div className="response">{reply}</div>}

      <h4>😤 রাগ মিটার</h4>
      <MoodMeter moodLevel={anger} type="anger" />

      <h4>😊 খুশি মিটার</h4>
      <MoodMeter moodLevel={happy} type="happy" />

      {showSlapImage && (
        <img src="/images/slap.png" alt="Slap" className="slap-image show" />
      )}

      <audio ref={audioRef} loop />
      <audio ref={slapAudioRef} src="/sounds/slap.mp3" />
    </div>
  );
};

export default App;
