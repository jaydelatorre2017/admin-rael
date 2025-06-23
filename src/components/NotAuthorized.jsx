import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";

export default function NotAuthorized() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: isDark
          ? "linear-gradient(120deg, #23272f 0%, #1a202c 100%)"
          : "linear-gradient(120deg, #f1f5f9 0%, #e0e7ef 100%)",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
      }}
    >
      <Paper
        elevation={8}
        sx={{
          background: isDark ? "#23272f" : "#fff",
          p: 4,
          borderRadius: "1.2rem",
          textAlign: "center",
          maxWidth: 340,
        }}
      >
        <Box
          sx={{
            background: isDark ? "#ef4444" : "#f87171",
            borderRadius: "50%",
            width: 54,
            height: 54,
            mx: "auto",
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" fill={isDark ? "#23272f" : "#fff"} />
            <path
              d="M9 9l6 6M15 9l-6 6"
              stroke={isDark ? "#ef4444" : "#f87171"}
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </Box>
        <Typography
          variant="h5"
          fontWeight={700}
          color={isDark ? "#ef4444" : "#f87171"}
          mb={1}
        >
          Not Authorized
        </Typography>
        <Typography
          color={isDark ? "#cbd5e1" : "#64748b"}
          fontSize="1rem"
        >
          You do not have permission to view this page.
        </Typography>
      </Paper>
    </Box>
  );
}