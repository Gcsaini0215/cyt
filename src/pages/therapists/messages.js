import React from "react";
import Head from "next/head";
import MainLayout from "../../components/therapists/main-layout";
import ChatApp from "../../components/chat/chat-app";

// Live chat with clients (components/chat/chat-app.js)
export default function TherapistMessagesPage() {
  return (
    <MainLayout>
      <Head><title>Messages | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <ChatApp role="therapist" />
    </MainLayout>
  );
}
