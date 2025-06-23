import React, { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner"; // <- import the QR Scanner class
import { Box, Typography, Paper } from "@mui/material";

const QRScannerDashboard = () => {
  const videoRef = useRef(null);
  const [scanner, setScanner] = useState(null);
  const [participantId, setParticipantId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (videoRef.current) {
      const qrScanner = new QrScanner(
        videoRef.current,
        (result) => {
          setParticipantId(result.data); // <- scanned value
          qrScanner.stop();             // stop after scan
        },
        {
          preferredCamera: "environment",
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      qrScanner.start().catch((err) => setError(`Error starting scanner: ${err.message}`));
      setScanner(qrScanner); // save scanner instance
    }

    return () => {
      scanner && scanner.destroy(); // clean up scanner
    };
  }, []);

  return (
    <Box sx={{ padding: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Typography variant="h4" mb={2}>QR Scanner</Typography>

      {/* Camera preview */}
      <video ref={videoRef} style={{ width: "320px", borderRadius: "8px" }} />

      {/* Error display */}
      {error && <Typography color="error" mt={2}>{error}</Typography>}

      {/* Scanned result */}
      {participantId && (
        <Paper sx={{ padding: 2, width: 320, mt: 4 }}>
          <Typography variant="h6">Scanned Participant ID:</Typography>
          <Typography sx={{ wordBreak: "break-word" }}>{participantId}</Typography>
        </Paper>
      )}
    </Box>
  );
};

export default QRScannerDashboard;
