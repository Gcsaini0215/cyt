import React from "react";
import ViewAllTherapist from "../components/View-All-Therapist/view-all-therapist";
import Footer from "../components/footer";
import NewsLetter from "../components/home/newsletter";
import MyNavbar from "../components/navbar";

export default function ViewAllTherapistPage() {
  return (
    <div id="__next">
      <main className="">
        <MyNavbar />
        <main className="rbt-main-wrapper">
          <ViewAllTherapist />
          <NewsLetter />
        </main>
        <Footer />
      </main>
    </div>
  );
}
