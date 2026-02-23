import ServicesHeader from "../../components/services/header";
import MyNavbar from "../../components/navbar";
import Footer from "../../components/footer";
import TherapistProfile from "../../components/services/thrapist-profile";
import NewsLetter from "../../components/home/newsletter";
import ServiceDetails from "../../components/services/service-details";
import React from "react";
import { useParams } from "next/router";
import { useRouter } from "next/router";
import NotFoundPage from "../notfound";

const serviceContent = [
  {
    id: "personalized_wellbeing",
    title:
      "Step Into Your Personalized Wellness Journey",
    short_desc: "A space designed just for you—offering therapy, support, and mindful experiences that bring balance, clarity, and growth to your life.",
    image: "blog2.png",
    image_caption: "Providing Support, Guidance, and Tools",
    long_desc:
      "Therapy and counseling sessions are essential mental health services provided by trained professionals to individuals seeking support for emotional, psychological, or behavioral issues. These sessions offer a safe, non-judgmental space for clients to explore their thoughts, feelings, and experiences.",
    quote:
      "The curious paradox is that when I accept myself just as I am, then I can change.",
    author: "Carl Rogers",
    content: [
      {
        heading: "Addressing a Range of Mental Health Issues",
        desc: "<p>Therapy and counseling can effectively address a wide range of issues, including anxiety, depression, stress, relationship problems, grief, trauma, and more. Through these sessions, clients can gain a deeper understanding of their feelings and behaviors, develop coping strategies, and work towards positive changes in their lives.<p/>",
      },
      {
        heading: "Different Formats for Different Needs",
        desc: "<p>Therapy and counseling sessions can be conducted in various formats to suit the unique needs of each client. Individual therapy allows for one-on-one sessions between the client and therapist, focusing on personal issues and goals. Couples therapy involves both partners and aims to improve communication and resolve conflicts. Family therapy addresses issues within the family unit, while group therapy provides support and encouragement from peers facing similar challenges.</p>",
      },
      {
        heading: "Different Formats for Different Needs",
        desc: "<p>Therapy and counseling sessions can be conducted in various formats to suit the unique needs of each client. Individual therapy allows for one-on-one sessions between the client and therapist, focusing on personal issues and goals. Couples therapy involves both partners and aims to improve communication and resolve conflicts. Family therapy addresses issues within the family unit, while group therapy provides support and encouragement from peers facing similar challenges.</p>",
      },
    ],
    images: ["service-1.jpeg", "service-02.jpeg", "service-03.jpeg"],
    tags: ["Life Style", "React", "Market", "Share"],
  },
  {
    id: "cyt-rs",
    title: "BJP",
    short_desc: "dasda",
    image: "blog-single-03.webp",
    image_caption: "#ff550e",
    long_desc:
      "https://akm-img-a-in.tosshub.com/sites/electiontak/images/counting-day/partylogo-118x118/bjp.jpg",
    quote: "45.0",
    author: "",
    content: [
      {
        heading: "Utilizing Various Therapeutic Approaches",
        desc: "<p>Therapists and counselors use a variety of therapeutic approaches and techniques based on their training and the needs of the client. <br>Cognitive-behavioral therapy (CBT) focuses on changing negative thought patterns and behaviors. Psychodynamic therapy explores unconscious thoughts and feelings to understand present behavior. Humanistic therapy emphasizes personal growth and self-actualization.</p>",
      },
    ],
    images: ["", "", ""],
    tags: ["CYT", "Therapist", "Market", "Share"],
  },
];

export default function Services() {
  const [data, setData] = React.useState();
  const router = useRouter();
  const { id  } = router.query;

  React.useEffect(() => {
    if (id) {
      const data = serviceContent.find((x) => x.id === id);
      setData(data);
    }
  }, [id]);

  return data ? (
    <div id="__next">
      <MyNavbar />
      <div className="rbt-overlay-page-wrapper">
        {data && (
          <>
            <ServicesHeader data={data} />
            <ServiceDetails data={data} />
            
          </>
        )}
      </div>
      <NewsLetter />
      <Footer />
    </div>
  ) : (
    <NotFoundPage />
  );
}
