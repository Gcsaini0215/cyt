import React, { useState } from "react";
import { Box, Typography, TextField, Button, Paper, Card, CardContent, CircularProgress, Alert, Container } from "@mui/material";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";

export default function AIAffirmation() {
  const [input, setInput] = useState("");
  const [affirmation, setAffirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateAffirmation = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError("");
    setAffirmation("");

    try {
      const prompt = `Create a positive affirmation for someone who is ${input}: `;
      const response = await fetch("https://api-inference.huggingface.co/models/distilgpt2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 50,
            num_return_sequences: 1,
            do_sample: true,
            temperature: 0.8,
            top_p: 0.9,
          },
        }),
      });
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      const generated = result[0].generated_text;
      const affirmationText = generated.slice(prompt.length).trim().split('\n')[0].split('. ')[0] + '.';
      setAffirmation(affirmationText || "I am worthy and capable of achieving my goals.");
    } catch (error) {
      setError("Failed to generate affirmation. Please try again.");
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div id="__next">
      <MyNavbar />
      <Container maxWidth="md" sx={{ py: 4, minHeight: "80vh" }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          AI Affirmation Generator
        </Typography>
        <Typography variant="body1" align="center" sx={{ mb: 3 }}>
          Describe your current mood, goal, or challenge, and our AI will create a personalized positive affirmation to inspire you.
        </Typography>

        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., feeling anxious, wanting to build confidence, overcoming self-doubt..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={generateAffirmation}
            disabled={loading || !input.trim()}
            fullWidth
          >
            {loading ? <CircularProgress size={24} /> : "Generate Affirmation"}
          </Button>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {affirmation && (
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Your Personalized Affirmation
              </Typography>
              <Typography variant="body1" sx={{ fontStyle: 'italic', fontSize: '1.2rem', color: 'primary.main' }}>
                "{affirmation}"
              </Typography>
              <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                Repeat this affirmation daily to cultivate positive thinking and emotional well-being.
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>
      <NewsLetter />
      <Footer />
    </div>
  );
}