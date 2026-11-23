import React from "react";
import Head from "next/head";
import ClientShell from "../../components/client/client-shell";
import ChatApp from "../../components/chat/chat-app";

// Live chat with therapists (components/chat/chat-app.js)
export default function ClientMessagesPage() {
  return (
    <ClientShell title="Messages">
      <Head><title>Messages | Choose Your Therapist</title><meta name="robots" content="noindex" /></Head>
      <ChatApp role="client" />
    </ClientShell>
  );
}
