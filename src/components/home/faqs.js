import FAQ from "./faq";
import { HelpCircle, Brain, Heart, Users, BookOpen, Shield, IndianRupee } from "lucide-react";

const faqCategories = [
  {
    icon: Brain,
    label: "About Therapy",
    color: "#228756",
    bg: "#f0fdf4",
    faqs: [
      {
        q: "What is therapy and how does it actually help?",
        a: "Therapy is a professional conversation with a trained psychologist where you talk openly about your thoughts, feelings, and challenges in a safe, non-judgmental space. It helps by giving you tools to understand why you feel the way you do, break unhelpful patterns, and build healthier responses to life's difficulties. Unlike venting to a friend, therapy is structured — your psychologist uses evidence-based techniques tailored specifically to your situation. Research shows therapy is as effective as medication for conditions like anxiety and depression, with longer-lasting results."
      },
      {
        q: "Therapy lena zyada zaruri kab hota hai — kab khud se theek ho jate hain?",
        a: "Agar aapki problem 2-3 hafte se zyada reh rahi hai, roz ke kaam mein rukawat aa rahi hai, neend ya khana prabhavit ho raha hai, ya aap khud ko akela mehsoos kar rahe hain — toh psychologist se milna sahi waqt hai. Chhoti problems jaise ek exam ka stress khud theek ho jaati hain. Lekin agar overthinking, panic attacks, constant sadness, ya relationship mein baar baar ek hi problem aa rahi hai — toh professional help lena samajhdari hai, kamzori nahi."
      },
      {
        q: "What is the difference between a Counselling Psychologist and a Clinical Psychologist?",
        a: "A Counselling Psychologist helps with everyday emotional challenges — relationship problems, stress, anxiety, self-esteem, career confusion, and life transitions. They use talk therapy approaches like CBT, person-centred therapy, and solution-focused therapy. A Clinical Psychologist is trained to assess and treat more complex mental health conditions such as severe depression, OCD, PTSD, bipolar disorder, schizophrenia, eating disorders, and personality disorders. They also conduct psychometric assessments (IQ tests, ADHD diagnosis, autism evaluations). Both are verified mental health professionals — the difference is in the complexity of conditions they treat."
      },
      {
        q: "Does talking to a psychologist actually work or is it just 'timepass'?",
        a: "Therapy has decades of scientific research behind it. Cognitive Behavioural Therapy (CBT) is as effective as antidepressants for depression and more effective in preventing relapse. Exposure and Response Prevention (ERP) is the most effective treatment for OCD, with 60–80% of patients showing significant improvement. Multiple studies published in journals like The Lancet confirm that therapy produces measurable, lasting changes in brain activity. At Choose Your Therapist, every psychologist uses evidence-based methods — not just supportive conversation — so you can expect real, trackable progress."
      },
      {
        q: "Kya therapy sirf paagal logon ke liye hoti hai?",
        a: "Bilkul nahi. Yeh India mein sabse bada misconception hai. Therapy un logon ke liye hoti hai jo apni zindagi behtar banana chahte hain. Duniya ke sabse successful log — athletes, CEOs, actors — regularly therapists se milte hain performance aur mental clarity ke liye. Anxiety, relationship issues, self-doubt, career confusion, parenting stress — yeh sab common human experiences hain. Therapy lena utna hi normal hai jitna doctor ke paas jaana ya gym karna. Maanat aur himmat ki nishani hai, kamzori ki nahi."
      },
      {
        q: "How many therapy sessions will I need?",
        a: "It depends on your goals and the nature of your concern. For mild stress or situational anxiety, 6–8 sessions are often enough to feel significantly better. For moderate depression or relationship issues, 12–20 sessions are typically recommended. For complex trauma, OCD, or long-standing personality patterns, therapy may continue for 6 months to a year. Your psychologist will discuss a treatment plan in the first session and adjust based on your progress. Many people continue therapy even after feeling better — as a tool for personal growth and resilience."
      }
    ]
  },
  {
    icon: Heart,
    label: "Mental Health Conditions",
    color: "#dc2626",
    bg: "#fff5f5",
    faqs: [
      {
        q: "Anxiety aur normal tension mein kya fark hai?",
        a: "Normal tension ek specific situation se hoti hai — jaise exam se pehle ya interview ke din — aur woh situation khatam hone ke baad chali jaati hai. Anxiety disorder tab hota hai jab darr ya chinta bina kisi clear reason ke rehti hai, weeks tak chalti hai, aur daily life ko prabhavit karti hai. Symptoms mein shamil hain: baar baar buri soch aana, seene mein dard ya dil ka tez dhakna, neend na aana, kisi jagah jaane se darna, ya choti cheez pe bahut zyada react karna. Agar aap in symptoms ko pehchante hain, ek counselling psychologist se milna bahut faydemand hoga."
      },
      {
        q: "Mujhe depression hai ya main sirf udaas hoon — kaise pehchanun?",
        a: "Udaasi ek emotion hai jo natural hai — kuch bura hone ke baad aata hai aur kuch dino mein guzar jaata hai. Depression ek clinical condition hai jisme: 2 hafte ya zyada time tak mood low rehta hai, kisi cheez mein interest nahi rehta jise aap pehle enjoy karte the, energy bilkul nahi hoti, neend ya toh bahut zyada aati hai ya bilkul nahi, khana khaane ka mann nahi karta, khud ko worthless ya guilty feel hota hai, aur kabhi kabhi zindagi khatam karne ke khayal bhi aate hain. Agar 5 ya zyada symptoms 2 hafte se zyada se hain — toh yeh depression ho sakta hai aur clinical psychologist se milna zaroori hai."
      },
      {
        q: "OCD kya hota hai aur iska treatment kaise hota hai?",
        a: "OCD mein do cheezein hoti hain — obsessions (unwanted intrusive thoughts jo baar baar aate hain, jaise 'maine darwaza band nahi kiya', 'haath mein germs hain', ya kuch bura ho jayega) aur compulsions (woh repeated actions jo anxiety kam karne ke liye kiye jaate hain, jaise baar baar haath dhona, cheezein count karna, ya darwaza 10 baar check karna). OCD ka gold-standard treatment hai Exposure and Response Prevention (ERP) — jisme trained clinical psychologist dheere dheere aapko obsessive triggers ke saamne expose karta hai bina compulsion karne ke. 60–80% patients mein significant improvement dekhi jaati hai."
      },
      {
        q: "Trauma aur PTSD — kab normal grief khatam hoti hai aur treatment ki zarurat padti hai?",
        a: "Koi bhi traumatic event ke baad kuch weeks tak distress hona normal hai. PTSD tab diagnose hota hai jab 1 mahine ke baad bhi: flashbacks ya nightmares aa rahe hain, triggers se darna, emotional numbness, hypervigilance (hamesha alert rehna), ya event ke baare mein sochne se bachna jaari hai. Complex trauma (bachpan ki abuse, domestic violence, repeated traumatic events) ke liye Trauma-Focused CBT ya EMDR (Eye Movement Desensitisation and Reprocessing) evidence-based treatments hain. Yeh therapies sirf trained clinical psychologists hi de sakte hain."
      },
      {
        q: "Kya anxiety ya depression ke liye dawai leni padti hai ya therapy hi kaafi hai?",
        a: "Mild to moderate anxiety aur depression ke liye akeli therapy — especially CBT — utni hi effective hai jitni medication, aur zyada lasting results deti hai. Severe cases mein psychiatrist dawai recommend kar sakte hain jo therapy ke saath milkar better kaam karti hai. Choose Your Therapist par verified psychologists hain jo therapy dete hain. Agar aapko medication ki bhi zarurat lagi, toh hum aapko psychiatrist ke paas refer karne mein help kar sakte hain. Dawai psychology ke bina akeli long-term solution nahi hai — therapy sikhati hai ki future mein khud kaise deal karein."
      }
    ]
  },
  {
    icon: Users,
    label: "Relationships & Family",
    color: "#7c3aed",
    bg: "#faf5ff",
    faqs: [
      {
        q: "Couples therapy kab leni chahiye — kya yeh sirf tab hoti hai jab divorce ke kinar ho?",
        a: "Nahi — couples therapy sirf crisis mein nahi, balki preventive tool ki tarah bhi kaam karti hai. Agar aap mein communication problems hain, baar baar ek hi baat pe jhagda hota hai, physical ya emotional intimacy kam ho gayi hai, ek partner ne affair kiya hai, ya dono ko lagta hai ki woh ek doosre ko nahi samjhte — yeh sab couples therapy ke liye sahi reasons hain. Jitni jaldi therapy li jaaye, utna behtar. Research kehta hai ki average couple 6 saal ki problems ke baad therapy lene jaata hai — jab tak bahut zyada damage ho chuka hota hai."
      },
      {
        q: "Mera partner therapy ke liye tayyar nahi hai — kya main akele ja sakta/sakti hoon?",
        a: "Bilkul. Individual therapy mein aap apne relationship patterns, responses, aur needs par kaam kar sakte hain — chahe partner saath aaye ya na aaye. Aksar ek partner ke therapy lene se relationship dynamics naturally badalne lagte hain. Kabhi kabhi ek ka change doosre ko bhi theek hone ki jagah deta hai. Agar aap khud mein clarity laana chahte hain — kya relationship mein rehna chahiye ya nahi, ya apni emotional needs samajhna chahte hain — toh individual counselling bahut helpful hai."
      },
      {
        q: "Bacho ke liye kab psychologist ki zarurat padti hai?",
        a: "Bacho mein yeh signs dekhein: school mein achanak performance girar, friends se alg rehna, baar baar gussa ya rona, neend ki problems, khaana na khaana, school jaane se mana karna, ya koi bada change jaise parents ka alag hona, move karna, ya bullying. Special educational needs (ADHD, learning disability, autism) ke liye psychometric assessment ki zarurat padti hai. Choose Your Therapist par child psychologists aur special educators available hain jo bachon ke saath age-appropriate therapy techniques use karte hain — play therapy, art therapy, aur behavioural interventions."
      },
      {
        q: "Kya family therapy mein sab logon ko saath aana padta hai?",
        a: "Ideally haan — family therapy mein jo log involved hain woh saath aate hain (parents aur bachche, ya siblings, ya joint family members). Lekin yeh flexible hai — pehle kuch sessions individual bhi ho sakte hain, phir combined. Family therapy ka goal yeh nahi ki kisi ek ko 'fix' kiya jaaye, balki family ke patterns, communication, aur dynamics ko samjha jaaye. Choose Your Therapist par family systems trained therapists available hain."
      }
    ]
  },
  {
    icon: BookOpen,
    label: "Booking & Process",
    color: "#0369a1",
    bg: "#f0f9ff",
    faqs: [
      {
        q: "Pehle session mein kya hoga — kya mujhe sab kuch batana padega?",
        a: "Nahi — pehla session ek introduction hota hai, confession nahi. Psychologist aapka background samjhega, aap kya leke aaye hain, aur aap therapy se kya expect kar rahe hain. Aap utna hi share karein jitna comfortable ho. Koi pressure nahi hota. Pehle session mein psychologist treatment plan bhi discuss karta hai — kitne sessions lagenege, kaunsi technique use hongi, aur progress kaise track hogi. Baad mein har session mein dheere dheere deeper jaate hain — aapki apni pace par."
      },
      {
        q: "Online therapy vs in-person therapy — kaunsi better hai?",
        a: "Research kehta hai ki online therapy in-person therapy jitni hi effective hai majority of conditions ke liye — anxiety, depression, stress, relationship issues, grief. Online therapy ke fayde: ghar se attend karo, koi travel nahi, scheduling flexible hai, aur privacy zyada hoti hai kyunki koi aapko clinic mein nahi dekhta. In-person therapy better ho sakti hai agar: aapko non-verbal cues dekhna important hai, severe mental health condition hai, ya aap physically kisi ke saath hona prefer karte hain. Choose Your Therapist par dono options available hain."
      },
      {
        q: "Sahi therapist kaise choose karein — itne saare profiles mein se kaise decide karein?",
        a: "Teen cheezein dekho: (1) Specialization — kya unke paas aapki specific problem ka experience hai? Profile mein 'service expertise' section mein dekho. (2) Credentials — Counselling Psychologist ya Clinical Psychologist? Unka degree aur experience kitna hai? (3) Reviews — past clients ne kya likha hai? Pehle session mein therapeutic alliance important hai — agar comfortable nahi laga toh doosre psychologist se try karo. Change karna ekdum normal hai. Sahi fit milna zaroori hai — therapist ka naam ya fees se zyada important yeh hai ki aap unse comfortable feel karo."
      },
      {
        q: "Agar pehli session ke baad achha nahi laga toh kya karein?",
        a: "Apne psychologist ko honestly batao. Ek achha therapist feedback welcome karta hai. Agar pehle session mein lagta hai ki yeh aapke liye sahi nahi hai — aap dusre therapist se try kar sakte hain. Choose Your Therapist par yeh completely acceptable hai. Kabhi kabhi 2-3 sessions ke baad rapport banta hai. Lekin agar 3 sessions ke baad bhi comfortable nahi feel ho raha ya koi improvement nahi dikh raha — toh switch karna sahi decision hai."
      }
    ]
  },
  {
    icon: IndianRupee,
    label: "Cost & Confidentiality",
    color: "#b45309",
    bg: "#fffbeb",
    faqs: [
      {
        q: "Therapy kitni mehngi hoti hai — kya yeh afford kar sakte hain?",
        a: "Choose Your Therapist par sessions ₹500 se shuru hokar ₹3000 per session tak hain — therapist ke experience aur specialization ke hisaab se. Students aur young professionals ke liye affordable options available hain. Online sessions generally in-person se sasti hoti hain. Subscription plans bhi hain agar aap regular therapy karna chahte hain. Ek session ki cost compare karein ek restaurant meal ya entertainment pe kharche se — mental health mein investment usse kahin zyada return deti hai long-term mein."
      },
      {
        q: "Kya jo main therapist ko batata/batati hoon woh confidential rehta hai?",
        a: "Haan — 100%. Therapists ka ethical code kehta hai ki jo aap session mein share karte hain woh strictly confidential rehta hai. Choose Your Therapist par hum international data protection standards follow karte hain. Sirf teen situations mein confidentiality break hoti hai: (1) agar aap khud ko ya kisi aur ko serious harm pahunchane ki baat karte hain, (2) court order aata hai, (3) minor abuse ka case ho. Baaki sab — relationships, personal secrets, workplace issues, family problems — completely between you and your therapist."
      },
      {
        q: "Kya insurance se therapy cover hoti hai India mein?",
        a: "India mein mental health insurance coverage abhi bhi limited hai, lekin growing hai. 2017 ke Mental Healthcare Act ke baad insurance companies ko mental health conditions cover karna zaroori hai. Kuch policies outpatient therapy cover karti hain. Apne insurer se specifically poochho 'psychological counselling' ya 'psychotherapy' coverage ke baare mein. Choose Your Therapist par invoices aur receipts provide kiye jaate hain jo insurance claims ke liye use ho sakte hain. Agar insurance nahi hai — hamare affordable plans dekhiye."
      },
      {
        q: "Session record hota hai kya — koi video save toh nahi hoti?",
        a: "Nahi. Online sessions record nahi kiye jaate — na audio, na video. Yeh psychologists ke ethical guidelines aur Choose Your Therapist ki privacy policy ka hissa hai. Session notes therapist apne clinical records mein rakhte hain jo strictly confidential hote hain aur kisi ke saath share nahi kiye jaate. Aap khud bhi session record nahi kar sakte without therapist's consent — yeh therapeutic relationship ki safety ke liye zaroori hai."
      }
    ]
  },
  {
    icon: Shield,
    label: "About Our Psychologists",
    color: "#065f46",
    bg: "#f0fdf4",
    faqs: [
      {
        q: "Aapke psychologists verified hain — iska kya matlab hai?",
        a: "Choose Your Therapist par har psychologist ka verification process hota hai: (1) Degree verification — MA/MSc Psychology ya MPhil Clinical Psychology ka proof. (2) Registration — Clinical Psychologists aur Special Educators ki RCI (Rehabilitation Council of India) registration check ki jaati hai. (3) Experience verification — internship aur practice history. (4) Reference checks. Hum kisi bhi unverified ya untrained person ko platform par allow nahi karte. Aap har therapist ki profile mein unka qualification aur experience dekh sakte hain."
      },
      {
        q: "RCI registration kya hoti hai aur kyon important hai?",
        a: "RCI (Rehabilitation Council of India) ek government body hai jo Clinical Psychologists aur Special Educators ko register aur regulate karta hai India mein. RCI registration ka matlab hai ki psychologist ne recognized university se MPhil Clinical Psychology ya equivalent degree ki hai, supervised clinical hours complete ki hain, aur professional standards follow karte hain. Without RCI registration, koi bhi 'Clinical Psychologist' ya 'Special Educator' ka title legally use nahi kar sakta. Choose Your Therapist par sab relevant professionals ki RCI registration verified hai."
      },
      {
        q: "Kya main apna therapist change kar sakta/sakti hoon?",
        a: "Bilkul. Sahi therapist dhundhna ek process hai aur pehle ya doosre se match nahi hona bilkul normal hai. Agar aapko lagta hai ki aap apne current therapist se comfortable nahi hain, progress nahi ho rahi, ya aap koi aur approach try karna chahte hain — aap bina kisi explanation ke dusre therapist mein switch kar sakte hain. Choose Your Therapist ka goal hai ki aapko sahi fit mile — hum isme help karte hain."
      }
    ]
  }
];

export default function Faqs() {
  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '80px 0 100px' }}>
      <div className="container">

        {/* Header */}
        <div className="row justify-content-center" style={{ marginBottom: '60px' }}>
          <div className="col-lg-8 text-center">
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(34, 135, 86, 0.1)', color: '#228756',
              padding: '8px 20px', borderRadius: '100px',
              fontSize: '14px', fontWeight: 700, marginBottom: '20px'
            }}>
              <HelpCircle size={18} />
              Frequently Asked Questions
            </div>
            <h2 style={{ fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 900, color: '#1e293b', marginBottom: '16px', lineHeight: 1.2 }}>
              Everything You Want to Know About Therapy
            </h2>
            <p style={{ color: '#64748b', fontSize: '18px', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto' }}>
              Real answers to the questions most people are too hesitant to ask — about therapy, psychologists, costs, and what actually happens in a session.
            </p>
          </div>
        </div>

        {/* Categories */}
        {faqCategories.map((category, catIndex) => {
          const Icon = category.icon;
          return (
            <div key={catIndex} style={{ marginBottom: '56px' }}>

              {/* Category Header */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                marginBottom: '24px', padding: '14px 20px',
                backgroundColor: category.bg, borderRadius: '14px',
                borderLeft: `4px solid ${category.color}`
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  backgroundColor: category.color, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Icon size={20} color="#fff" />
                </div>
                <div>
                  <h3 style={{
                    fontSize: '20px', fontWeight: 800, color: '#1e293b',
                    margin: 0, lineHeight: 1.2
                  }}>
                    {category.label}
                  </h3>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                    {category.faqs.length} questions
                  </p>
                </div>
              </div>

              {/* FAQs in this category */}
              <div style={{ maxWidth: '900px' }}>
                {category.faqs.map((item, index) => (
                  <FAQ key={index} q={item.q} a={item.a} />
                ))}
              </div>

            </div>
          );
        })}

        {/* Bottom CTA */}
        <div style={{
          textAlign: 'center', marginTop: '20px', padding: '48px 32px',
          backgroundColor: '#fff', borderRadius: '24px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 24px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '26px', fontWeight: 800, color: '#1e293b', marginBottom: '12px' }}>
            Still have questions?
          </h3>
          <p style={{ color: '#64748b', fontSize: '17px', marginBottom: '28px', maxWidth: '480px', margin: '0 auto 28px' }}>
            Talk to a real person. Our team is happy to help you find the right psychologist for your specific needs.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="/view-all-therapist"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '50px',
                backgroundColor: '#228756', color: '#fff',
                fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                transition: 'all 0.2s'
              }}
            >
              Browse Psychologists
            </a>
            <a
              href="/contact-us"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '14px 32px', borderRadius: '50px',
                backgroundColor: '#f1f5f9', color: '#1e293b',
                fontWeight: 700, fontSize: '16px', textDecoration: 'none',
                border: '1px solid #e2e8f0'
              }}
            >
              Contact Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
