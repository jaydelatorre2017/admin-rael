import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Divider,
} from "@mui/material";
import { API_URL, headername, keypoint } from '../utils/config';

const QRScannerDashboard = () => {
    const videoRef = useRef(null);
    const scannerRef = useRef(null);
    const scanLogRef = useRef(new Map());
    const [participantInfo, setParticipantInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const SCAN_INTERVAL = 2 * 1000; // 2 seconds
    const EVENT_ID = "f2dc29f7-ad2b-4f11-a740-d3b1d8bdfc44";

    const playBeep = () => {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.15);
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
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        window.speechSynthesis.speak(utterance);
    };

    const handleScan = async (scanned) => {
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
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        participant_id: scanned,
                        event_id: EVENT_ID,
                    }),
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || "Unknown error");

                const infoRes = await fetch(
                    `${API_URL}/api/attendance/get_participant_attendance?participant_id=${scanned}`
                );
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
        if (videoRef.current) {
            const qrScanner = new QrScanner(
                videoRef.current,
                (result) => {
                    const scanned = result.data.trim();
                    handleScan(scanned);
                },
                {
                    preferredCamera: "environment",
                    highlightScanRegion: true,
                    highlightCodeOutline: true,
                }
            );
            scannerRef.current = qrScanner;
            qrScanner.start().catch((err) => {
                setError(`Error starting scanner: ${err.message}`);
            });
        }

        return () => {
            scannerRef.current?.destroy();
            window.speechSynthesis.cancel();
        };
    }, []);

    return (
        <Box
            sx={{
                padding: 4,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                minHeight: "100vh",
                backgroundImage: `url('/sulongedukalidad.png')`, // your background image path
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
            }}
        >
            {/* Logo Row */}
            <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: 600, mb: 2 }}>
                <img src="cam-norte.png" alt="Left Logo" style={{ height: 90 }} />
                <img src="LeftLogo.png" alt="Right Logo" style={{ height: 90 }} />
            </Box>

            <Typography variant="h4" mb={2} color="white" sx={{ textShadow: "1px 1px 4px #000" }}>
                QR Attendance Scanner
            </Typography>

            <Box
                sx={{
                    width: 260,
                    height: 260,
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: "12px",
                    border: "3px solid #4caf50",
                    mb: 3,
                    backgroundColor: "#000",
                }}
            >
                <video
                    ref={videoRef}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
            </Box>

            {loading && <CircularProgress />}

            {error && (
                <Typography color="error" mt={2}>
                    {error}
                </Typography>
            )}

            {participantInfo && (
                <Paper
                    elevation={4}
                    sx={{
                        mt: 3,
                        p: 3,
                        width: "100%",
                        maxWidth: 400,
                        backgroundColor: "#fafafa",
                        borderRadius: 2,
                    }}
                >
                    <Typography variant="h6" gutterBottom>
                        Participant Info
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Typography><strong>Name:</strong> {participantInfo.full_name}</Typography>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="subtitle1" gutterBottom>
                        Attendance Summary:
                    </Typography>
                    <Typography>🕓 Time In: {participantInfo.time_in || "N/A"}</Typography>
                    <Typography>🕔 Time Out: {participantInfo.time_out || "N/A"}</Typography>

                </Paper>
            )}
        </Box>
    );
};

export default QRScannerDashboard;
