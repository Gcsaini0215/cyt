import React from "react";
import ImageTag from "../../utils/image-tag";

const TeamImg = "/assets/img/deepdirec.png";
const TeamImg3 = "/assets/img/ffabb.png";
const TeamImg4 = "/assets/img/akt.png";
const TeamImg5 = "/assets/img/gopichand.png";
const vibhor = "/assets/img/vibhor.png";
const RitikaGupta = "/assets/img/RitikaGupta.png";
const anushka = "/assets/img/anushka.png";
const Ayushi = "/assets/img/ayushi.png";

const teamInfo = [
  {
    name: "Mr. Deepak Kumar",
    deg: "Founder & Director | Psychologist (B.A, M.A, Ph.D Psychology-NET)",
    address: "Uttarakhand, IN",
    profile: TeamImg,
    content:
      "As a practicing psychologist, our Director’s vision is to create a world where mental wellness is valued equally to physical health and seeking help is a sign of strength.",
  },
  {
    name: "Mr. Ashish Kumar Thakran",
    deg: "Co-Founder | Entrepreneur",
    address: "Uttarakhand, IN",
    profile: TeamImg4,
    content:
      "As a co-founder, the vision is to integrate technology with care, making mental health support more approachable, scalable, and impactful for individuals and communities.",
  },
  {
    name: "Ms. Fabiha Sultana Shaik",
    deg: "Chief Advisor | Psychologist",
    address: "Andhra Pradesh, IN",
    profile: TeamImg3,
    content:
      "As Chief Advisor and Psychologist, the vision is to explore the intricacies of the human mind and implement innovative strategies that enhance our platform, promoting stigma-free care and holistic well-being for all.",
  },
  {
    name: "Ms. Ayushi Pandwal",
    deg: "External Research & Academic Advisor | Assistant Professor",
    address: "Noida, IN",
    profile: Ayushi,
    content:
      "As External Research and Academic Advisor, the vision is to strengthen scholarly initiatives, promote evidence-based practices, and support meaningful academic growth for individuals and institutions.",
  },
  {
    name: "Ms. Ritika Gupta",
    deg: "Operations Lead",
    address: "Noida, IN",
    profile: RitikaGupta,
    content:
      "She is the Operations Lead who blends efficiency with empathy, ensuring that our platform runs seamlessly while staying true to its mission of holistic wellbeing.",
  },
  {
    name: "Ms. Anushka Singh",
    deg: "Community Growth Lead | M.A Clinical Psychology",
    address: "Ranchi, IN",
    profile: anushka,
    content:
      "She is the Community Growth Lead, passionate about building strong, supportive networks that promote holistic wellbeing.",
  },
  {
    name: "Mr. Gopichand Saini",
    deg: "Chief Technology Officer",
    address: "Noida, Uttar Pradesh, IN",
    profile: TeamImg5,
    content:
      "Welcome to CYT, where innovation meets excellence. As the CTO, I am proud to lead a dedicated team committed to delivering impactful and scalable innovations.",
  },
  {
    name: "Mr. Vibhor Verma",
    deg: "Legal Advisor | Advocate",
    address: "Uttarakhand, IN",
    profile: vibhor,
    content:
      "I am impassioned about the intricacies of the human mind and the way it works. Also, a creative thinker and analyst who enjoys generating out-of-the-box ideas.",
  },
];

export default function TeamBanner() {
  return (
    <>
      <style>{`
        .team-section {
          padding: 60px 20px;
          background: #fff;
        }

        .section-title {
          text-align: center;
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          color: #222;
        }

        .section-subtitle {
          text-align: center;
          max-width: 700px;
          margin: 0 auto 40px auto;
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }

        .team-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .team-card {
          background: #fafafa;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          transition: transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease;
          border: 1px solid #e5e5e5;
        }

        .team-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.18);
          border: 2px solid #22c55e;
        }

        .team-img {
          width: 100%;
          height: 260px;
          overflow: hidden;
        }

        .team-img img {
          width: 100%;
          height: 100%;
          object-fit: cover; /* Desktop default */
          transition: transform 0.4s ease;
        }

        .team-card:hover .team-img img {
          transform: scale(1.05);
        }

        .team-info {
          padding: 15px 20px 25px 20px;
          text-align: center;
        }

        .team-info h4 {
          font-size: 20px;
          font-weight: 700;
          color: #111;
          margin-bottom: 6px;
        }

        .team-info .deg {
          display: block;
          font-size: 14px;
          font-weight: 600;
          background: linear-gradient(90deg, #16a34a, #22c55e, #4ade80);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          margin-bottom: 6px;
        }

        .team-info .address {
          font-size: 13px;
          color: #777;
          margin-bottom: 10px;
        }

        .team-info .content {
          font-size: 14px;
          color: #555;
          line-height: 1.5;
        }

        /* Desktop */
        @media (min-width: 992px) {
          .team-grid {
            grid-template-columns: repeat(4, 1fr);
          }
          .team-img {
            height: 220px;
          }
          .team-img img {
            object-fit: cover; /* Desktop: cover */
          }
        }

        /* Tablet */
        @media (min-width: 600px) and (max-width: 991px) {
          .team-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .team-img {
            height: 200px;
          }
          .team-img img {
            object-fit: cover; /* Tablet: cover */
          }
        }

        /* Mobile */
        @media (max-width: 599px) {
          .team-grid {
            grid-template-columns: 1fr;
          }
          .team-img {
            height: 180px;
          }
          .team-img img {
            object-fit: contain; /* Mobile: contain to avoid face cut */
          }
        }
      `}</style>

      <div className="team-section">
        <div className="container">
          <h2 className="section-title">The Faces Behind the Vision</h2>
          <p className="section-subtitle">
            "Choose Your Therapist" vision comes alive through people. Each face
            represents compassion, skill, and dedication — working together to
            build a platform where mental well-being is prioritized and every
            journey is valued.
          </p>

          <div className="team-grid">
            {teamInfo.map((member, index) => (
              <div className="team-card" key={index}>
                <div className="team-img">
                  <ImageTag src={member.profile} alt={member.name} />
                </div>
                <div className="team-info">
                  <h4>{member.name}</h4>
                  <span className="deg">{member.deg}</span>
                  <p className="address">{member.address}</p>
                  <p className="content">{member.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
