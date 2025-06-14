import React, { useEffect, useState } from "react";
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Paper,
  Button,
  Collapse,
  useMediaQuery,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import { useTheme } from "@mui/material/styles";

const ChatWidget = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [open, setOpen] = useState(false); // For mobile chat toggle
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
        setLoading(true);
        try {
      const res = await fetch("https://chat.msnone-neopolis.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, session_id: sessionId }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
      setSessionId(data.session_id || "");
      setLoading(false);
    }
    catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
      setLoading(false);
    }
    finally {
      setLoading(false);
    }
    };


    fetchSession();
  }, []);

  const handleSend = async () => {
    if (!query.trim()) return;

    const userMsg = { from: "user", text: query };
    setQuery("");
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true); // show typing

    try {
      const res = await fetch("https://chat.msnone-neopolis.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, session_id: sessionId }),
      });

      const data = await res.json();
      setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
      setSessionId(data.session_id);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Something went wrong. Please try again." },
      ]);
    } finally {
      setLoading(false); // hide typing
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <>
      {isMobile && !open && (
        <Box sx={{ position: "fixed", bottom: 16, right: 16, zIndex: 9999 }}>
          <IconButton
            color="primary"
            sx={{ backgroundColor: "#fff", boxShadow: 3 }}
            onClick={() => setOpen(true)}
          >
            <ChatIcon />
          </IconButton>
        </Box>
      )}

      {(open || !isMobile) && (
        <Box
          sx={{
            position: "fixed",
            bottom: 16,
            right: 16,
            zIndex: 9999,
            width: 350,
            boxShadow: 4,
            borderRadius: 2,
          }}
        >
          <Paper elevation={3}>
            <Box
              sx={{
                p: 1.5,
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderTopLeftRadius: 8,
                borderTopRightRadius: 8,
              }}
            >
              <Typography variant="subtitle1">
                🏢 MSN One Neopolis Assistant
              </Typography>
              <Box>
                <IconButton
                  onClick={() =>
                    isMobile
                      ? setOpen((prev) => !prev)
                      : setMinimized((prev) => !prev)
                  }
                  color="inherit"
                >
                  {minimized ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>
            </Box>

            <Collapse in={!minimized}>
              <Box
                sx={{
                  minHeight: isMobile ? 200 : 300,
                  maxHeight: isMobile ? 300 : 500,
                  overflowY: "auto",
                  p: 2,
                  backgroundColor: "#fafafa",
                }}
              >
                {messages.map((msg, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      display: "flex",
                      justifyContent:
                        msg.from === "user" ? "flex-end" : "flex-start",
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        maxWidth: "80%",
                        backgroundColor:
                          msg.from === "user"
                            ? theme.palette.primary.light
                            : "#e0e0e0",
                        color: msg.from === "user" ? "#fff" : "#000",
                      }}
                    >
                      {msg.text}
                    </Box>
                  </Box>
                ))}
                {loading && (
                  <Box sx={{ px: 2, pb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Bot is typing...
                    </Typography>
                  </Box>
                )}
              </Box>

              <Box
                sx={{ p: 1.5, display: "flex", alignItems: "center", gap: 1 }}
              >
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your message..."
                />
                <IconButton color="primary" onClick={handleSend}>
                  <SendIcon />
                </IconButton>
              </Box>
            </Collapse>
          </Paper>
        </Box>
      )}
    </>
  );
};

export default ChatWidget;
