import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, TextField, Button, Paper, Avatar, CircularProgress, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";

export default function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [conversation, setConversation] = useState({ past_user_inputs: [], generated_responses: [] });
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setConversation((prev) => ({
      past_user_inputs: [...prev.past_user_inputs, input],
      generated_responses: prev.generated_responses,
    }));
    const currentInput = input;
    setInput("");
    setSending(true);

    try {
      let modifiedInput = currentInput;
      if (conversation.past_user_inputs.length === 0) {
        modifiedInput = "You are a professional therapist. Provide empathetic, supportive, and helpful responses to users seeking mental health advice. Always encourage seeking professional help if needed. " + currentInput;
      }
      const tempConversation = {
        past_user_inputs: [...conversation.past_user_inputs, modifiedInput],
        generated_responses: conversation.generated_responses,
      };

      const response = await fetch("https://api-inference.huggingface.co/models/facebook/blenderbot-90M", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: tempConversation,
          parameters: { max_length: 150, min_length: 10 },
        }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      const botReply = result.conversation.generated_responses[result.conversation.generated_responses.length - 1];
      setConversation((prev) => ({
        ...prev,
        generated_responses: [...prev.generated_responses, botReply],
      }));
      const botMessage = { role: "assistant", content: botReply };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error generating response:", error);
      const errorMessage = { role: "assistant", content: "Sorry, I encountered an error. Please try again." };
      setMessages((prev) => [...prev, errorMessage]);
    }
    setSending(false);
  };

  return (
    <div id="__next">
      <MyNavbar />
      <Container maxWidth="md" sx={{ py: 4, minHeight: "80vh" }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          AI Therapy Chatbot
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Chat with our AI assistant for general therapy advice and support. Remember, this is not a substitute for professional help.
        </Typography>

        <Paper
          elevation={3}
          sx={{
            height: "500px",
            overflowY: "auto",
            p: 2,
            mb: 2,
            backgroundColor: "#f5f5f5",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {messages.length === 0 && !loading && (
            <Typography variant="body2" color="textSecondary" align="center" sx={{ mt: 2 }}>
              Start a conversation by typing a message below.
            </Typography>
          )}
          {messages.map((msg, idx) => (
            <Box
              key={idx}
              sx={{
                display: "flex",
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                mb: 2,
              }}
            >
              {msg.role === "assistant" && (
                <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>AI</Avatar>
              )}
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: "70%",
                  backgroundColor: msg.role === "user" ? "primary.main" : "white",
                  color: msg.role === "user" ? "white" : "text.primary",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{msg.content}</Typography>
              </Paper>
              {msg.role === "user" && (
                <Avatar sx={{ ml: 1, bgcolor: "primary.main" }}>You</Avatar>
              )}
            </Box>
          ))}
          {sending && (
            <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2 }}>
              <Avatar sx={{ mr: 1, bgcolor: "secondary.main" }}>AI</Avatar>
              <Paper elevation={1} sx={{ p: 2, backgroundColor: "white", borderRadius: 2 }}>
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ ml: 1 }}>Typing...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={chatEndRef} />
        </Paper>
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Type your message..."
            disabled={sending}
          />
          <Button
            variant="contained"
            onClick={sendMessage}
            disabled={sending || !input.trim()}
            sx={{ px: 3 }}
          >
            Send
          </Button>
        </Box>
      </Container>
      <NewsLetter />
      <Footer />
    </div>
  );
}