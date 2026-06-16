import React from "react";
import Head from "next/head";
import MyNavbar from "../components/navbar";
import Footer from "../components/footer";
import Newsletter from "../components/home/newsletter";
import Faqs from "../components/home/faqs";
import PageBreadCrumb from "../components/global/page-breadcrumb";

const PAGE_URL = "https://www.chooseyourtherapist.in/faqs";
const OG_IMAGE = "https://i.postimg.cc/gj1yngrd/choose.png";

// FAQPage schema — mirrors all 26 questions from the FAQ component
const faqPageSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "name": "Everything You Want to Know About Therapy | Choose Your Therapist FAQs",
  "description": "Real answers to questions about therapy, psychologists, mental health conditions, costs, confidentiality, and how to choose the right therapist in India.",
  "url": PAGE_URL,
  "mainEntity": [
    // About Therapy
    {
      "@type": "Question",
      "name": "What is therapy and how does it actually help?",
      "acceptedAnswer": { "@type": "Answer", "text": "Therapy is a professional conversation with a trained psychologist where you talk openly about your thoughts, feelings, and challenges in a safe, non-judgmental space. It helps by giving you tools to understand why you feel the way you do, break unhelpful patterns, and build healthier responses to life's difficulties. Research shows therapy is as effective as medication for conditions like anxiety and depression, with longer-lasting results." }
    },
    {
      "@type": "Question",
      "name": "Therapy lena zyada zaruri kab hota hai — kab khud se theek ho jate hain?",
      "acceptedAnswer": { "@type": "Answer", "text": "Agar aapki problem 2-3 hafte se zyada reh rahi hai, roz ke kaam mein rukawat aa rahi hai, neend ya khana prabhavit ho raha hai — toh psychologist se milna sahi waqt hai. Chhoti problems jaise ek exam ka stress khud theek ho jaati hain. Lekin agar overthinking, panic attacks, constant sadness, ya relationship mein baar baar ek hi problem aa rahi hai — toh professional help lena samajhdari hai, kamzori nahi." }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a Counselling Psychologist and a Clinical Psychologist?",
      "acceptedAnswer": { "@type": "Answer", "text": "A Counselling Psychologist helps with everyday emotional challenges — relationship problems, stress, anxiety, self-esteem, career confusion, and life transitions. A Clinical Psychologist is trained to assess and treat more complex mental health conditions such as severe depression, OCD, PTSD, bipolar disorder, and personality disorders. They also conduct psychometric assessments like IQ tests, ADHD diagnosis, and autism evaluations." }
    },
    {
      "@type": "Question",
      "name": "Does talking to a psychologist actually work or is it just timepass?",
      "acceptedAnswer": { "@type": "Answer", "text": "Therapy has decades of scientific research behind it. Cognitive Behavioural Therapy (CBT) is as effective as antidepressants for depression and more effective in preventing relapse. Exposure and Response Prevention (ERP) is the most effective treatment for OCD, with 60–80% of patients showing significant improvement. At Choose Your Therapist, every psychologist uses evidence-based methods — not just supportive conversation — so you can expect real, trackable progress." }
    },
    {
      "@type": "Question",
      "name": "Kya therapy sirf paagal logon ke liye hoti hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Bilkul nahi. Yeh India mein sabse bada misconception hai. Therapy un logon ke liye hoti hai jo apni zindagi behtar banana chahte hain. Anxiety, relationship issues, self-doubt, career confusion, parenting stress — yeh sab common human experiences hain. Therapy lena utna hi normal hai jitna doctor ke paas jaana ya gym karna. Maanat aur himmat ki nishani hai, kamzori ki nahi." }
    },
    {
      "@type": "Question",
      "name": "How many therapy sessions will I need?",
      "acceptedAnswer": { "@type": "Answer", "text": "It depends on your goals and the nature of your concern. For mild stress or situational anxiety, 6–8 sessions are often enough. For moderate depression or relationship issues, 12–20 sessions are typically recommended. For complex trauma or OCD, therapy may continue for 6 months to a year. Your psychologist will discuss a treatment plan in the first session and adjust based on your progress." }
    },
    // Mental Health Conditions
    {
      "@type": "Question",
      "name": "Anxiety aur normal tension mein kya fark hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Normal tension ek specific situation se hoti hai aur woh khatam hone ke baad chali jaati hai. Anxiety disorder tab hota hai jab darr ya chinta bina kisi clear reason ke rehti hai, weeks tak chalti hai, aur daily life ko prabhavit karti hai. Symptoms mein shamil hain: baar baar buri soch aana, seene mein dard, dil ka tez dhakna, neend na aana, ya chhoti cheez pe bahut zyada react karna." }
    },
    {
      "@type": "Question",
      "name": "Mujhe depression hai ya main sirf udaas hoon — kaise pehchanun?",
      "acceptedAnswer": { "@type": "Answer", "text": "Udaasi ek emotion hai jo natural hai aur kuch dino mein guzar jaata hai. Depression ek clinical condition hai jisme 2 hafte ya zyada tak: mood low rehta hai, kisi cheez mein interest nahi rehta, energy bilkul nahi hoti, neend ya toh bahut zyada ya bilkul nahi, khud ko worthless feel hota hai. Agar 5 ya zyada symptoms 2 hafte se zyada se hain — toh clinical psychologist se milna zaroori hai." }
    },
    {
      "@type": "Question",
      "name": "OCD kya hota hai aur iska treatment kaise hota hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "OCD mein obsessions (unwanted intrusive thoughts jo baar baar aate hain) aur compulsions (repeated actions jo anxiety kam karne ke liye kiye jaate hain) hote hain. OCD ka gold-standard treatment hai Exposure and Response Prevention (ERP) — jisme trained clinical psychologist dheere dheere aapko obsessive triggers ke saamne expose karta hai bina compulsion karne ke. 60–80% patients mein significant improvement dekhi jaati hai." }
    },
    {
      "@type": "Question",
      "name": "Trauma aur PTSD — kab normal grief khatam hoti hai aur treatment ki zarurat padti hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "PTSD tab diagnose hota hai jab 1 mahine ke baad bhi flashbacks ya nightmares aa rahe hain, triggers se darna, emotional numbness, ya hypervigilance jaari hai. Complex trauma ke liye Trauma-Focused CBT ya EMDR evidence-based treatments hain. Yeh therapies sirf trained clinical psychologists hi de sakte hain." }
    },
    {
      "@type": "Question",
      "name": "Kya anxiety ya depression ke liye dawai leni padti hai ya therapy hi kaafi hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Mild to moderate anxiety aur depression ke liye akeli therapy — especially CBT — utni hi effective hai jitni medication, aur zyada lasting results deti hai. Severe cases mein psychiatrist dawai recommend kar sakte hain jo therapy ke saath milkar better kaam karti hai. Dawai psychology ke bina akeli long-term solution nahi hai — therapy sikhati hai ki future mein khud kaise deal karein." }
    },
    // Relationships
    {
      "@type": "Question",
      "name": "Couples therapy kab leni chahiye — kya yeh sirf tab hoti hai jab divorce ke kinar ho?",
      "acceptedAnswer": { "@type": "Answer", "text": "Nahi — couples therapy sirf crisis mein nahi, balki preventive tool ki tarah bhi kaam karti hai. Agar aap mein communication problems hain, baar baar ek hi baat pe jhagda hota hai, intimacy kam ho gayi hai, ya ek partner ne affair kiya hai — yeh sab couples therapy ke liye sahi reasons hain. Research kehta hai ki average couple 6 saal ki problems ke baad therapy lene jaata hai — jab tak bahut zyada damage ho chuka hota hai." }
    },
    {
      "@type": "Question",
      "name": "Mera partner therapy ke liye tayyar nahi hai — kya main akele ja sakta hoon?",
      "acceptedAnswer": { "@type": "Answer", "text": "Bilkul. Individual therapy mein aap apne relationship patterns, responses, aur needs par kaam kar sakte hain — chahe partner saath aaye ya na aaye. Aksar ek partner ke therapy lene se relationship dynamics naturally badalne lagte hain. Kabhi kabhi ek ka change doosre ko bhi theek hone ki jagah deta hai." }
    },
    {
      "@type": "Question",
      "name": "Bacho ke liye kab psychologist ki zarurat padti hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Bacho mein yeh signs dekhein: school mein achanak performance girar, friends se alag rehna, baar baar gussa ya rona, neend ki problems, ya school jaane se mana karna. Special educational needs (ADHD, learning disability, autism) ke liye psychometric assessment ki zarurat padti hai. Choose Your Therapist par child psychologists aur special educators available hain." }
    },
    // Booking
    {
      "@type": "Question",
      "name": "Pehle session mein kya hoga — kya mujhe sab kuch batana padega?",
      "acceptedAnswer": { "@type": "Answer", "text": "Nahi — pehla session ek introduction hota hai, confession nahi. Psychologist aapka background samjhega, aap kya leke aaye hain, aur aap therapy se kya expect kar rahe hain. Aap utna hi share karein jitna comfortable ho. Pehle session mein treatment plan bhi discuss hota hai — kitne sessions lagenege, kaunsi technique use hongi, aur progress kaise track hogi." }
    },
    {
      "@type": "Question",
      "name": "Online therapy vs in-person therapy — kaunsi better hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Research kehta hai ki online therapy in-person therapy jitni hi effective hai majority of conditions ke liye — anxiety, depression, stress, relationship issues, grief. Online therapy ke fayde: ghar se attend karo, koi travel nahi, scheduling flexible hai, aur privacy zyada hoti hai. Choose Your Therapist par dono options available hain." }
    },
    {
      "@type": "Question",
      "name": "Sahi therapist kaise choose karein — itne saare profiles mein se kaise decide karein?",
      "acceptedAnswer": { "@type": "Answer", "text": "Teen cheezein dekho: (1) Specialization — kya unke paas aapki specific problem ka experience hai? (2) Credentials — Counselling Psychologist ya Clinical Psychologist? Unka degree aur experience? (3) Reviews — past clients ne kya likha hai? Pehle session mein agar comfortable nahi laga toh doosre psychologist se try karo — yeh bilkul normal hai." }
    },
    // Cost & Confidentiality
    {
      "@type": "Question",
      "name": "Therapy kitni mehngi hoti hai — kya yeh afford kar sakte hain?",
      "acceptedAnswer": { "@type": "Answer", "text": "Choose Your Therapist par sessions ₹500 se shuru hokar ₹3000 per session tak hain — therapist ke experience aur specialization ke hisaab se. Students aur young professionals ke liye affordable options available hain. Online sessions generally in-person se sasti hoti hain. Subscription plans bhi hain agar aap regular therapy karna chahte hain." }
    },
    {
      "@type": "Question",
      "name": "Kya jo main therapist ko batata hoon woh confidential rehta hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Haan — 100%. Therapists ka ethical code kehta hai ki jo aap session mein share karte hain woh strictly confidential rehta hai. Sirf teen situations mein confidentiality break hoti hai: (1) agar aap khud ko ya kisi aur ko serious harm pahunchane ki baat karte hain, (2) court order aata hai, (3) minor abuse ka case ho. Baaki sab completely between you and your therapist." }
    },
    {
      "@type": "Question",
      "name": "Session record hota hai kya — koi video save toh nahi hoti?",
      "acceptedAnswer": { "@type": "Answer", "text": "Nahi. Online sessions record nahi kiye jaate — na audio, na video. Yeh psychologists ke ethical guidelines aur Choose Your Therapist ki privacy policy ka hissa hai. Session notes therapist apne clinical records mein rakhte hain jo strictly confidential hote hain aur kisi ke saath share nahi kiye jaate." }
    },
    // About Psychologists
    {
      "@type": "Question",
      "name": "Aapke psychologists verified hain — iska kya matlab hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "Choose Your Therapist par har psychologist ka verification process hota hai: degree verification, RCI registration check (clinical psychologists ke liye), experience verification, aur reference checks. Hum kisi bhi unverified ya untrained person ko platform par allow nahi karte. Aap har therapist ki profile mein unka qualification aur experience dekh sakte hain." }
    },
    {
      "@type": "Question",
      "name": "RCI registration kya hoti hai aur kyon important hai?",
      "acceptedAnswer": { "@type": "Answer", "text": "RCI (Rehabilitation Council of India) ek government body hai jo Clinical Psychologists aur Special Educators ko register aur regulate karta hai India mein. Without RCI registration, koi bhi 'Clinical Psychologist' ya 'Special Educator' ka title legally use nahi kar sakta. Choose Your Therapist par sab relevant professionals ki RCI registration verified hai." }
    },
    {
      "@type": "Question",
      "name": "Are therapists on Choose Your Therapist RCI verified?",
      "acceptedAnswer": { "@type": "Answer", "text": "All therapists on our platform are verified mental health professionals. Clinical Psychologists and Special Educators hold valid RCI (Rehabilitation Council of India) registration. Counselling Psychologists hold recognized degrees in psychology and have verified clinical experience. You can view each therapist's credentials directly on their profile page." }
    }
  ]
};

// BreadcrumbList schema
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.chooseyourtherapist.in/" },
    { "@type": "ListItem", "position": 2, "name": "FAQs", "item": PAGE_URL }
  ]
};

export default function FaqPage() {
  return (
    <div id="__next">
      <Head>
        <title>Therapy FAQs | Psychologist Questions Answered | Choose Your Therapist</title>
        <meta name="description" content="Get answers to your questions about online therapy, counselling psychology, booking psychologists in India, session costs, confidentiality, and how Choose Your Therapist works." />
        <meta name="keywords" content="therapy FAQ India, psychologist questions, counselling psychology FAQ, online therapy cost India, how to book therapist, RCI psychologist India, mental health FAQ" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={PAGE_URL} />

        <meta property="og:title" content="Therapy FAQs | Psychologist Questions Answered | Choose Your Therapist" />
        <meta property="og:description" content="Get answers to common questions about therapy, booking psychologists in India, session costs, and how Choose Your Therapist works." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={OG_IMAGE} />
        <meta property="og:site_name" content="Choose Your Therapist" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Therapy FAQs | Choose Your Therapist" />
        <meta name="twitter:description" content="Common questions about online therapy, psychologists, and mental health services in India." />
        <meta name="twitter:image" content={OG_IMAGE} />

        {/* Schema.org — FAQPage + BreadcrumbList */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      </Head>
      <MyNavbar />
      <PageBreadCrumb title="Frequently Asked Questions (FAQ)" linkTitle="Help and Support for Clients"/>
      <Faqs />

      <div className="rbt-contact-me bg-color-extra2 rbt-section-gap">
        <div className="container">
          <div className="row g-5 align-items-center">
            <div className="col-lg-6">
              <div className="content">
                <div className="section-title text-start">
                  <h2 className="title">
                    Want to Stay Informed About New Services &amp; Mental Health
                    Resources?
                  </h2>
                  <p className="description mt--20">
                    Stay connected with Choose Your Therapist to receive updates
                    on our latest services, mental health resources, and special
                    offers.
                  </p>
                  <div className="social-share-wrapper mt--30">
                    <h5>You can also follow us on:</h5>
                    <ul className="social-icon social-default transparent-with-border justify-content-start mt--30">
                      <li>
                        <a href="https://www.facebook.com/">
                          <i className="feather-facebook"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.twitter.com">
                          <i className="feather-twitter"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.instagram.com/">
                          <i className="feather-instagram"></i>
                        </a>
                      </li>
                      <li>
                        <a href="https://www.linkdin.com/">
                          <i className="feather-linkedin"></i>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5 offset-xl-1">
              <div className="rbt-contact-form contact-form-style-1 max-width-auto">
                <form id="contact-form" className="w-100">
                  <div className="form-group">
                    <input name="con_name" type="text" placeholder="Name" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <input name="con_email" type="email" placeholder="Email" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <input type="text" placeholder="Phone" />
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-group">
                    <textarea placeholder="Message"></textarea>
                    <span className="focus-border"></span>
                  </div>
                  <div className="form-submit-group">
                    <button
                      type="submit"
                      className="rbt-btn radius-round btn-gradient hover-icon-reverse"
                    >
                      <span className="icon-reverse-wrapper">
                        <span className="btn-text">GET IT NOW</span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                        <span className="btn-icon">
                          <i className="feather-arrow-right"></i>
                        </span>
                      </span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Newsletter />
      <Footer />
    </div>
  );
}
