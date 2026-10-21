import React from "react";
import TraineeLayout, { useTraineePortal } from "../components/trainee/trainee-layout";

/* Trainee portal home. The dashboard content is still being planned — for now it only greets the trainee. */
function Home() {
  const { me, profile } = useTraineePortal();
  const first = profile?.firstName || (me?.name || "").split(" ")[0] || "there";
  return (
    <>
      <div className="tp-h">
        <div>
          <h1>Welcome, {first}</h1>
          <p>Your trainee dashboard</p>
        </div>
      </div>
      <div className="tp-card tp-home-empty" aria-label="Dashboard" />
      <style dangerouslySetInnerHTML={{ __html: ".tp-home-empty{min-height:420px}" }} />
    </>
  );
}

export default function TraineeHome() {
  return <TraineeLayout title="Dashboard"><Home /></TraineeLayout>;
}
