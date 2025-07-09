import React, { useRef, useState, useEffect } from "react";
import IntroText from "./components/IntroText";
import MoodMeter from "./components/MoodMeter";
import axios from "axios";
import "./App.css";

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [mood, setMood] = useState("neutral");
  const [anger, setAnger] = useState(0);
  const [happy, setHappy] = useState(0);
  const [shake, setShake] = useState(false);
  const [showSlapImage, setShowSlapImage] = useState(false);

  const audioRef = useRef(null);
  const slapAudioRef = useRef(null);

  // 🗣️ Speak Bengali using Web Speech API
  const speakBengali = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const bengaliVoice = voices.find(
      (voice) =>
        voice.lang.includes("bn") ||
        voice.name.toLowerCase().includes("bangla") ||
        voice.name.toLowerCase().includes("bengali")
    );

    if (bengaliVoice) {
      utterance.voice = bengaliVoice;
    } else {
      console.warn("⚠️ Bengali voice not found, using default.");
    }

    utterance.lang = "bn-IN";
    utterance.rate = 1;
    utterance.pitch = 1;
    speechSynthesis.speak(utterance);
  };

  // 🎭 Detect mood from text
  const detectMood = (text) => {
    if (text.includes("😡") || text.includes("রাগ") || text.includes("থাপ্প")) return "angry";
    if (text.includes("😢") || text.includes("মন খারাপ") || text.includes("কেউ না")) return "sad";
    if (text.includes("🥰") || text.includes("ভালো") || text.includes("গর্ব")) return "happy";
    return "neutral";
  };

  // 📩 Send prompt to backend and process response
  const handleAsk = async () => {
    const res = await axios.post("https://maa-gpt.onrender.com/api/ask", { prompt });
    const reply = res.data.reply;
    setResponse(reply);
    speakBengali(reply);

    const moodDetected = detectMood(reply);
    setMood(moodDetected);

    if (moodDetected === "angry") {
      setAnger((prev) => Math.min(prev + 20, 100));
      if (slapAudioRef.current) {
        slapAudioRef.current.play().catch(() => {});
      }
      setShake(true);
      setShowSlapImage(true);
      setTimeout(() => {
        setShake(false);
        setShowSlapImage(false);
      }, 600);
    }

    if (moodDetected === "happy") {
      setHappy((prev) => Math.min(prev + 20, 100));
    }
  };

  // 🎵 Mood-based music
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

  // 🗣️ Load voices
  useEffect(() => {
    window.speechSynthesis.getVoices();
  }, []);

  return (
    <div className={`app mood-${mood} ${shake ? "shake" : ""}`}>
      <IntroText />
      <textarea
        placeholder="মাকে কিছু বল..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleAsk}>জিজ্ঞেস করো</button>

      {response && <div className="response">{response}</div>}

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
