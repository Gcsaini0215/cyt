const TeamImg = "/assets/img/shivangi.png";
const Priya = "/assets/img/Priya.png";
const TeamImg2 = "/assets/img/aparajitab.png";
const shivangirana = "/assets/img/shivangirana.png";
const avika = "/assets/img/avika.png";
const priya = "/assets/img/priyaa.png";
import ImageTag from "../../utils/image-tag";
import React from "react";
const internInfo = [
   
 {
    name: "Priya Ranga",
    deg: "Diploma",
    profile: priya,
    noOfStars: 5,
    content: "Start the journey to mental health awareness with a simple step: nurture your mind with kindness.",
  },
  {
    name: "Priya Mehta",
    deg: "B.Sc. Psychology Student",
    profile: Priya,
    noOfStars: 5,
    content: "Start the journey to mental health awareness with a simple step: nurture your mind with kindness.",
  },
  {
    name: "Shivangi Chandola",
    deg: "Graduate Psychology",
    profile: TeamImg,
    noOfStars: 5,
    content: "Mental health awareness starts with you. Be kind to your mind.",
  },

  {
    name: "Aparaajita Bhawaani",
    deg: "Graduate Psychology",
    profile: TeamImg2,
    noOfStars: 5,
    content:
      "Don't suffer in silence. Reach out and get the support you deserve.",
  },

  {
    name: "Shivangi Rana",
    deg: "Graduation Student",
    profile: shivangirana,
    noOfStars: 5,
    content:
      "Your story is important. Share it and inspire others to seek help.",
  },
  {
    name: "Avika",
    deg: "Graduation Student",
    profile: avika,
    noOfStars: 5,
    content:
      "Every step towards mental wellness is a step towards a brighter future.",
  },
];
export default function InterSection() {
  const [team, setTeam] = React.useState(internInfo[0]);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const handleClick = (id) => {
    setTeam(internInfo[id]);
    setSelectedIndex(id);
  };
  return (
    <div className="rbt-testimonial-area bg-color-white rbt-section-gap overflow-hidden">
      <div className="wrapper mb--60">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <span className="subtitle bg-primary-opacity">
                  Learning from Everyone
                </span>
                <h2 className="title">Voices of Our Interns</h2>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row align-items-center row--30">
          <div className="col-lg-6">
            <div
              className="rbt-testimonial-content tab-content"
              id="myTabContent"
            >
              <div
                className="tab-pane fade active show"
                id="testimonial-tab1"
                role="tabpanel"
                aria-labelledby="testimonial-tab1-tab"
              >
                <div className="inner">
                  <div className="rating mb--30">
                    {Array.from({ length: team.noOfStars }).map((_, index) => {
                      return <i className="fa fa-star" key={index}></i>;
                    })}
                  </div>
                  <p>{team.content}</p>
                </div>
                <div className="author-info">
                  <h6>
                    <span>{team.name} </span> - {team.deg}
                  </h6>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6 mt_md--30 mt_sm--30">
            <ul className="testimonial-thumb-wrapper nav nav-tabs" id="myTab">
              {internInfo.map((item, index) => {
                return (
                  <li key={item.name}>
                    <a
                      className={index === selectedIndex ? "active" : ""}
                      id="testimonial-tab1-tab"
                      style={{ cursor: "pointer" }}
                      aria-selected={index === selectedIndex ? "true" : "false"}
                      onClick={() => handleClick(index)}
                    >
                      <div className="testimonial-thumbnai">
                        <div className="thumb">
                          <ImageTag
                            alt="Testimonial Images"
                            width="494"
                            height="494"
                            src={item.profile}
                          />
                        </div>
                      </div>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
