import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { API_URL, headername, keypoint } from '../utils/config';

const QRScannerDashboard = () => {
  const videoRef = useRef(null);
  const scannerRef = useRef(null);
  const scanLogRef = useRef(new Map());
  const [participantInfo, setParticipantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeEventId, setActiveEventId] = useState(null);
  const [activeEventInfo, setActiveEventInfo] = useState(null);
  const SCAN_INTERVAL = 2000;

  const playBeep = () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  };

  const speakText = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.2;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.toLowerCase().includes("female") ||
      v.name.toLowerCase().includes("google") ||
      v.name.toLowerCase().includes("samantha")
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleScan = async (scanned) => {
    if (!activeEventId) return;

    const now = Date.now();
    const lastScanTime = scanLogRef.current.get(scanned);
    if (!lastScanTime || now - lastScanTime >= SCAN_INTERVAL) {
      scanLogRef.current.set(scanned, now);
      playBeep();
      setLoading(true);
      setParticipantInfo(null);
      setError("");

      try {
        const res = await fetch(`${API_URL}/api/attendance/create_attendance`, {
          method: "POST",
           headers: {
    "Content-Type": "application/json",
    [headername]: keypoint
  },
          body: JSON.stringify({ participant_id: scanned, event_id: activeEventId }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unknown error");

        const infoRes = await fetch(`${API_URL}/api/attendance/get_participant_attendance?participant_id=${scanned}`,{
            headers: { [headername]: keypoint }
        });
        const infoData = await infoRes.json();
        if (!infoRes.ok) throw new Error(infoData.error || "Fetch failed");

        const participant = infoData?.[0];
        if (!participant) throw new Error("Participant not found");

        setParticipantInfo(participant);
        speakText(`Your ID has been scanned, ${participant.nickname}`);
      } catch (err) {
        console.error(err.message);
        setError(err.message);
        speakText(`${err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const fetchActiveEvent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events/get_active_events`,{
            headers: { [headername]: keypoint }
        });
        const events = await res.json();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const matched = events.find(e => {
          const start = new Date(Date.parse(e.start_date));
          const end = new Date(Date.parse(e.end_date));
          start.setHours(0, 0, 0, 0);
          end.setHours(0, 0, 0, 0);
          return today >= start && today <= end;
        });
        if (matched) {
          setActiveEventId(matched.id);
          setActiveEventInfo(matched);
        } else setError("No active event today.");
      } catch (err) {
        console.error(err);
        setError("Failed to load active events.");
      }
    };
    fetchActiveEvent();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(videoRef.current, result => {
        const scanned = result.data.trim();
        handleScan(scanned);
      }, {
        preferredCamera: "environment",
        highlightScanRegion: true,
        highlightCodeOutline: true,
      });

      scannerRef.current = qrScanner;
      qrScanner.start().catch(err => {
        setError(`Error starting scanner: ${err.message}`);
      });
    }

    return () => {
      scannerRef.current?.destroy();
      window.speechSynthesis.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEventId]);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start px-6 py-10 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url('/scannerbg.jpg')`,
      }}
    >
      <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-md z-0" />

      <div className="flex justify-between items-center w-full max-w-xl mb-6 z-10">
        <img src="RightLogo.png" alt="Right Logo" className="h-[90px] bg-white p-2 rounded-full shadow-md" />
        <img src="LeftLogo.png" alt="Left Logo" className="h-[90px] bg-white p-2 rounded-full shadow-md" />
      </div>

      <h1 className="text-3xl font-bold text-white z-10 drop-shadow-md mb-2">Please Scan Your ID here!</h1>

      {activeEventInfo && (
        <p className="text-white text-center z-10 mb-4 text-sm drop-shadow-md">
          <strong>{activeEventInfo.name}</strong><br />
          {activeEventInfo.start_date} to {activeEventInfo.end_date}
        </p>
      )}

      <div className="relative w-[260px] h-[260px] rounded-xl border-4 border-green-500 overflow-hidden mb-4 bg-black z-10">
        <video ref={videoRef} className="w-full h-full object-cover" />
      </div>

      {loading && <div className="z-10 text-white">Loading...</div>}

      {error && (
        <p className="text-red-500 mt-2 text-sm font-medium z-10">{error}</p>
      )}

      {participantInfo && (
        <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full mt-4 z-10">
          <h2 className="text-lg font-bold mb-3">Participant Info</h2>
          <hr className="mb-3" />
          <p className="text-sm mb-2"><strong>Name:</strong> {participantInfo.full_name}</p>
          <h3 className="text-sm font-semibold mt-4 mb-1">Attendance Summary:</h3>
          <p className="text-sm">🕓 Time In: {participantInfo.time_in || "N/A"}</p>
          <p className="text-sm">🕔 Time Out: {participantInfo.time_out || "N/A"}</p>
        </div>
      )}
    </div>
  );
};

export default QRScannerDashboard;
