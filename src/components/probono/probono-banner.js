import React from "react";
import PhotoHero from "../global/photo-hero";

const STATS = [
  { value: "₹0", label: "no payment" },
  { value: "45 min", label: "on Google Meet" },
  { value: "1", label: "free session per person" },
];

export default function ProbonoBanner({ action }) {
  return (
    <PhotoHero
      pill="Pro Bono Support Program"
      title={<>One Free <span>Support Session</span> With a Supervised Trainee</>}
      lead="A free 45-minute session for first-time clients, with a psychology trainee working under professional supervision."
      stats={STATS}
      action={action}
    />
  );
}
