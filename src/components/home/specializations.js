import React from 'react';
import { 
  Brain, 
  CloudRain, 
  Heart, 
  Zap, 
  Users, 
  Briefcase, 
  Stethoscope, 
  Activity 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useMediaQuery from "@mui/material/useMediaQuery";

const specializations = [
  { id: 1, title: "Anxiety", icon: <Brain size={32} />, color: "#E3F2FD", iconColor: "#1976D2", link: "/view-all-therapist?specialization=Anxiety" },
  { id: 2, title: "Depression", icon: <CloudRain size={32} />, color: "#F3E5F5", iconColor: "#7B1FA2", link: "/view-all-therapist?specialization=Depression" },
  { id: 3, title: "Relationships", icon: <Heart size={32} />, color: "#FFEBEE", iconColor: "#D32F2F", link: "/view-all-therapist?specialization=Relationship" },
  { id: 4, title: "Stress", icon: <Activity size={32} />, color: "#E8F5E9", iconColor: "#388E3C", link: "/view-all-therapist?specialization=Stress" },
  { id: 5, title: "OCD", icon: <Zap size={32} />, color: "#FFF3E0", iconColor: "#F57C00", link: "/view-all-therapist?specialization=OCD" },
  { id: 6, title: "Trauma", icon: <Stethoscope size={32} />, color: "#E0F2F1", iconColor: "#00796B", link: "/view-all-therapist?specialization=Trauma" },
  { id: 7, title: "Parenting", icon: <Users size={32} />, color: "#EFEBE9", iconColor: "#5D4037", link: "/view-all-therapist?specialization=Parenting" },
  { id: 8, title: "Career", icon: <Briefcase size={32} />, color: "#ECEFF1", iconColor: "#455A64", link: "/view-all-therapist?specialization=Career" },
];

const Specializations = () => {
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));

  return (
    <section className="specializations-area pt--60 pb--60 bg-color-white">
      <div className="container">
        <div className="row mb--40">
          <div className="col-lg-12">
            <div className="section-title text-center">
              <h2 className="title" style={{ 
                fontSize: isMobile ? "2rem" : "3.5rem", 
                fontWeight: "800", 
                color: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: isMobile ? "10px" : "20px",
                whiteSpace: isMobile ? "nowrap" : "normal"
              }}>
                <span style={{ height: "3px", width: isMobile ? "30px" : "60px", backgroundColor: "#228756", borderRadius: "10px", display: "inline-block" }}></span>
                Explore Specializations
                <span style={{ height: "3px", width: isMobile ? "30px" : "60px", backgroundColor: "#228756", borderRadius: "10px", display: "inline-block" }}></span>
              </h2>
              <p className="description mt--10" style={{ fontSize: isMobile ? "1.1rem" : "1.4rem", color: "#666", padding: isMobile ? "0 10px" : "0" }}>
                Find the right support for your specific needs
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {specializations.map((item) => (
            <div className="col-lg-3 col-md-4 col-sm-6 col-6" key={item.id}>
              <Link to={item.link} className="spec-card">
                <div className="spec-inner" style={{ backgroundColor: item.color }}>
                  <div className="spec-icon" style={{ color: item.iconColor }}>
                    {item.icon}
                  </div>
                  <h3 className="spec-title">{item.title}</h3>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .spec-card {
          display: block;
          text-decoration: none;
          transition: transform 0.3s ease;
        }
        .spec-card:hover {
          transform: translateY(-10px);
        }
        .spec-inner {
          padding: 30px 20px;
          border-radius: 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          transition: box-shadow 0.3s ease;
        }
        .spec-card:hover .spec-inner {
          box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        .spec-icon {
          background: #ffffff;
          width: 70px;
          height: 70px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .spec-title {
          font-size: 1.4rem;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        @media (max-width: 768px) {
          .spec-inner {
            padding: 20px 10px;
          }
          .spec-icon {
            width: 50px;
            height: 50px;
          }
          .spec-title {
            font-size: 1.1rem;
          }
        }
      `}</style>
    </section>
  );
};

export default Specializations;
