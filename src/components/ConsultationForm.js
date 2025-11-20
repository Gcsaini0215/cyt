import React, { useState } from "react";
import { Box, Grid, TextField, MenuItem, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function ConsultationFormSection() {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    concern: "",
    otherConcern: "",
  });

  const concerns = [
    "Stress & Anxiety",
    "Depression",
    "Relationship Issues",
    "Workplace Stress",
    "Self-Esteem & Confidence",
    "Anger Management",
    "Sleep Difficulties",
    "Grief or Loss",
    "Teen / Adolescent Issues",
    "Career Confusion",
    "Other (Please Specify)",
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Submitted:", form);
    alert("Thank you! Our team will contact you soon for your consultation.");
    setForm({
      name: "",
      email: "",
      phone: "",
      concern: "",
      otherConcern: "",
    });
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(180deg, #f9fffb 0%, #eaf5ee 100%)",
        py: { xs: 6, md: 10 },
        px: { xs: 2, md: 0 },
        borderTop: "2px solid #d1e7d5",
      }}
    >
      <Grid container spacing={4} justifyContent="center" alignItems="center">
        {/* Left side - promo text */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "#1b4d3e",
                fontSize: { xs: "2rem", md: "2.8rem" },
                textAlign: { xs: "center", md: "left" },
              }}
            >
              Book Your <span style={{ color: "#228756" }}>Free First Consultation</span>
            </Typography>

            <Typography
              sx={{
                color: "#444",
                fontSize: "1.1rem",
                lineHeight: 1.8,
                maxWidth: 500,
                textAlign: { xs: "center", md: "left" },
                margin: "auto",
              }}
            >
              Connect with a {isMobile ? "" : "verified "}therapist to discuss your concerns in a private,
              supportive space. Whether it’s stress, anxiety, or relationship challenges —
              your first step towards healing starts here.
            </Typography>

            <ul
              style={{
                marginTop: 20,
                color: "#333",
                fontSize: "1rem",
                lineHeight: 1.8,
              }}
            >
              <li>🧠 Confidential one-on-one conversation</li>
              <li>🌿 Talk to {isMobile ? "" : "verified "}mental health experts</li>
              <li>💬 Online or in-person options available</li>
            </ul>
          </motion.div>
        </Grid>

        {/* Right side - form */}
        <Grid item xs={12} md={6}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                backgroundColor: "#ffffff",
                p: 4,
                borderRadius: 3,
                boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                border: "1px solid #dceee2",
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  mb: 3,
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#1b4d3e",
                }}
              >
                Fill in your details below 👇
              </Typography>

              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                margin="normal"
              />
              <TextField
                fullWidth
                label="Phone Number"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                margin="normal"
              />

              <TextField
                select
                fullWidth
                label="Area of Concern"
                name="concern"
                value={form.concern}
                onChange={handleChange}
                required
                margin="normal"
              >
                {concerns.map((option, index) => (
                  <MenuItem key={index} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              {form.concern === "Other (Please Specify)" && (
                <TextField
                  fullWidth
                  label="Please Specify"
                  name="otherConcern"
                  value={form.otherConcern}
                  onChange={handleChange}
                  margin="normal"
                />
              )}

              <Button
                type="submit"
                fullWidth
                sx={{
                  mt: 3,
                  py: 1.5,
                  fontWeight: 700,
                  fontSize: "1rem",
                  background: "linear-gradient(90deg, #228756, #3bcf84)",
                  color: "#fff",
                  borderRadius: "30px",
                  "&:hover": {
                    background: "linear-gradient(90deg, #1e734b, #33b374)",
                  },
                }}
              >
                Book Free Consultation
              </Button>

              <Typography
                sx={{
                  mt: 2,
                  fontSize: "0.85rem",
                  color: "#555",
                  textAlign: "center",
                }}
              >
                🔒 Your information is 100% confidential.
              </Typography>
            </Box>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}
