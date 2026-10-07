// Psychologist-in-<place> pages: per state / city copy, FAQs and which therapist "state"
// values belong to the place. Shared by /psychologist-in/[state], the /psychologist-in hub
// and the home "Find a psychologist near you" section.

// ─── State config ────────────────────────────────────────────────────────────
export const PLACES = {
  "uttar-pradesh": {
    name: "Uttar Pradesh",
    filterValues: ["uttar pradesh", "up", "noida"],
    cities: ["Noida", "Lucknow", "Agra", "Kanpur", "Varanasi", "Allahabad", "Ghaziabad", "Meerut"],
    slug: "uttar-pradesh",
    geo: { lat: 26.8467, lng: 80.9462, region: "IN-UP" },
    description: "Find verified counselling psychologists and clinical psychologists across Uttar Pradesh — in Noida, Lucknow, Agra, Kanpur, and online. Book sessions for anxiety, depression, OCD, relationship issues, and more.",
    localKeywords: "psychologist in Noida, therapist in Lucknow, counsellor in Agra, psychologist in Kanpur, mental health UP, online therapy Uttar Pradesh",
    localIntro: "Uttar Pradesh's rapid urban growth — from Noida's corporate corridors to smaller cities finding their footing — has brought real change in how mental health is talked about, but access still lags outside the biggest hubs. Choose Your Therapist closes that gap with the same verified psychologists, whether you're in a Sector 62 office or a smaller town without a single local clinic, and whether you want an in-person session at our Noida studio or a private video call from home.",
    faqs: [
      {
        q: "Which are the best psychologists in Uttar Pradesh?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists across Uttar Pradesh, including Noida, Lucknow, Agra, and Kanpur. You can filter by specialization and book online or in-person sessions."
      },
      {
        q: "Can I get online therapy in Uttar Pradesh?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions in addition to in-person consultations. This means you can access quality mental health support from anywhere in UP — including smaller cities and rural areas."
      },
      {
        q: "Is there a psychologist in Noida available for anxiety?",
        a: "Yes. Choose Your Therapist has multiple verified psychologists in Noida who specialize in anxiety, panic attacks, social anxiety, and stress. You can view their profiles, read reviews, and book a session directly."
      },
      {
        q: "What is the cost of therapy in Uttar Pradesh?",
        a: "Therapy sessions with psychologists in Uttar Pradesh on Choose Your Therapist start from ₹500 per session. Fees vary by therapist experience and specialization. Online sessions are generally more affordable than in-person visits."
      }
    ]
  },
  "delhi": {
    name: "Delhi",
    filterValues: ["delhi", "new delhi", "ncr"],
    cities: ["New Delhi", "South Delhi", "North Delhi", "West Delhi", "Dwarka", "Rohini", "Saket", "Lajpat Nagar"],
    slug: "delhi",
    geo: { lat: 28.6139, lng: 77.2090, region: "IN-DL" },
    description: "Connect with verified psychologists in Delhi for anxiety, depression, OCD, trauma, and relationship counselling. Book online or in-person sessions with top-rated mental health professionals across Delhi.",
    localKeywords: "psychologist in Delhi, therapist in South Delhi, counsellor in Dwarka, psychologist in Saket, mental health Delhi, online therapy Delhi NCR",
    localIntro: "Delhi's pace — long commutes, competitive workplaces, and a culture that prizes achievement — takes a real toll, yet finding an hour for a walk-in appointment across the city is its own source of stress. Choose Your Therapist works around that: book a verified psychologist for a video session between meetings, or visit in person if you're closer to our Noida-Delhi studio, without losing half a day to travel.",
    faqs: [
      {
        q: "Who are the best psychologists in Delhi?",
        a: "Choose Your Therapist has a curated network of verified counselling psychologists and clinical psychologists across Delhi. All professionals are degree-verified and experienced in evidence-based therapies like CBT, DBT, and ERP."
      },
      {
        q: "Can I find a clinical psychologist in Delhi for OCD?",
        a: "Yes. Clinical psychologists on Choose Your Therapist in Delhi are trained in Exposure and Response Prevention (ERP), the gold-standard treatment for OCD. You can filter therapists by specialization to find an OCD specialist in Delhi."
      },
      {
        q: "Is couples counselling available in Delhi?",
        a: "Yes. Multiple verified relationship counsellors and couples therapists are available in Delhi through Choose Your Therapist. Both online and in-person sessions are available for couples dealing with communication issues, trust problems, or relationship conflict."
      },
      {
        q: "What is the fee for a psychologist in Delhi?",
        a: "Therapy fees in Delhi range from ₹800 to ₹3000 per session depending on the psychologist's experience and specialization. Choose Your Therapist shows transparent pricing on every therapist profile so you can choose what fits your budget."
      }
    ]
  },
  "maharashtra": {
    name: "Maharashtra",
    filterValues: ["maharashtra"],
    cities: ["Mumbai", "Pune", "Nashik", "Nagpur", "Aurangabad", "Thane"],
    slug: "maharashtra",
    geo: { lat: 19.7515, lng: 75.7139, region: "IN-MH" },
    description: "Find verified psychologists in Maharashtra — Mumbai, Pune, Nagpur and beyond. Book online or in-person therapy sessions for anxiety, depression, relationship issues, OCD, and more.",
    localKeywords: "psychologist in Mumbai, therapist in Pune, counsellor in Nagpur, mental health Maharashtra, online therapy Mumbai, psychologist near me Mumbai",
    localIntro: "Maharashtra covers two very different rhythms of stress — Mumbai's round-the-clock financial-capital pressure and Pune's dense student and early-career population — and both need the same thing: a therapist who's actually available when you are. Choose Your Therapist's verified network spans the state, from Nagpur to Nashik, so quality care isn't limited to whichever city happens to have a clinic nearby.",
    faqs: [
      {
        q: "Which are the best psychologists in Mumbai?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists in Mumbai and across Maharashtra. Browse profiles by specialization — anxiety, depression, OCD, couples therapy — and book online or in-person sessions."
      },
      {
        q: "Is online therapy available in Pune?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions. If you are in Pune, you can book a session with any therapist on our platform — from Maharashtra or anywhere in India."
      },
      {
        q: "Can I find a child psychologist in Maharashtra?",
        a: "Yes. Choose Your Therapist has child psychologists and special educators in Maharashtra who work with children facing ADHD, anxiety, learning disabilities, autism spectrum disorder, and behavioural issues."
      },
      {
        q: "What does a therapy session cost in Mumbai?",
        a: "Therapy sessions in Mumbai on Choose Your Therapist range from ₹800 to ₹3000 per session. Online sessions are generally more affordable. All pricing is transparent and displayed on each therapist's profile."
      }
    ]
  },
  "rajasthan": {
    name: "Rajasthan",
    filterValues: ["rajasthan"],
    cities: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner"],
    slug: "rajasthan",
    geo: { lat: 27.0238, lng: 74.2179, region: "IN-RJ" },
    description: "Find verified psychologists in Rajasthan — in Jaipur, Jodhpur, Udaipur, Kota, and online. Book therapy sessions for anxiety, depression, relationship counselling, stress management, and more.",
    localKeywords: "psychologist in Jaipur, therapist in Jodhpur, counsellor in Udaipur, mental health Rajasthan, online therapy Jaipur, best psychologist Kota",
    localIntro: "Rajasthan is home to some of India's most demanding academic environments — Kota's coaching culture in particular puts enormous pressure on students and their families — alongside heritage cities where mental health support has traditionally meant leaning on joint family, not professionals. Choose Your Therapist offers a private, judgment-free alternative, reachable from Jaipur, Jodhpur, Udaipur, or any smaller town with an internet connection.",
    faqs: [
      {
        q: "Are there verified psychologists in Jaipur?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and therapists in Jaipur and across Rajasthan. You can browse profiles, check specializations, read reviews, and book sessions online or in-person."
      },
      {
        q: "Can students in Kota access mental health support?",
        a: "Absolutely. Choose Your Therapist provides online therapy sessions that students in Kota can access from their room. We have psychologists who specialize in academic stress, exam anxiety, burnout, and student mental health."
      },
      {
        q: "Is online counselling available across Rajasthan?",
        a: "Yes. Our online therapy sessions are accessible from any city in Rajasthan — Jaipur, Jodhpur, Udaipur, Kota, Ajmer, Bikaner, or any smaller town with internet access."
      },
      {
        q: "What is the cost of therapy in Rajasthan?",
        a: "Sessions with psychologists in Rajasthan start from ₹500 per session on Choose Your Therapist. Online sessions are affordable and flexible. All fees are clearly shown on each therapist's profile."
      }
    ]
  },
  "gujarat": {
    name: "Gujarat",
    filterValues: ["gujarat"],
    cities: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Gandhinagar", "Bhavnagar"],
    slug: "gujarat",
    geo: { lat: 22.2587, lng: 71.1924, region: "IN-GJ" },
    description: "Find verified psychologists in Gujarat — in Ahmedabad, Surat, Vadodara, Rajkot, and online. Book therapy sessions for anxiety, depression, OCD, stress, relationship issues, and more.",
    localKeywords: "psychologist in Ahmedabad, therapist in Surat, counsellor in Vadodara, mental health Gujarat, online therapy Ahmedabad, best psychologist Gujarat",
    localIntro: "Gujarat's entrepreneurial economy means a lot of people carrying business stress home with them — long hours, financial pressure, and family-run businesses where work and personal life rarely separate. Choose Your Therapist's verified psychologists understand that context and offer flexible online sessions across Ahmedabad, Surat, Vadodara, and Rajkot, so getting support doesn't mean stepping away from the business for an afternoon.",
    faqs: [
      {
        q: "Who are the best psychologists in Ahmedabad?",
        a: "Choose Your Therapist has verified counselling and clinical psychologists in Ahmedabad and across Gujarat. Browse therapist profiles, check their specializations and reviews, and book a session that fits your schedule."
      },
      {
        q: "Can I get therapy in Gujarati language?",
        a: "Some therapists on our platform are comfortable communicating in Gujarati. You can check the 'languages spoken' filter on our therapist directory to find a Gujarati-speaking psychologist."
      },
      {
        q: "Is online therapy available in Gujarat?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions — accessible from Ahmedabad, Surat, Vadodara, Rajkot, or any other city in Gujarat."
      },
      {
        q: "What does therapy cost in Gujarat?",
        a: "Therapy sessions with psychologists in Gujarat on Choose Your Therapist start from ₹500 per session. Fees vary by experience and specialization, and are transparently shown on each therapist's profile."
      }
    ]
  },
  "chandigarh": {
    name: "Chandigarh",
    filterValues: ["chandigarh"],
    cities: ["Chandigarh", "Mohali", "Panchkula"],
    slug: "chandigarh",
    geo: { lat: 30.7333, lng: 76.7794, region: "IN-CH" },
    description: "Find verified psychologists in Chandigarh, Mohali, and Panchkula. Book online or in-person therapy sessions for anxiety, depression, stress, relationship counselling, OCD, and more.",
    localKeywords: "psychologist in Chandigarh, therapist in Mohali, counsellor in Panchkula, mental health Chandigarh, online therapy Chandigarh, best psychologist Chandigarh",
    localIntro: "As one of India's most planned and prosperous cities, Chandigarh has a young professional and student population that's often more open to therapy than smaller nearby towns — but options within the tricity (Chandigarh, Mohali, Panchkula) can still feel limited. Choose Your Therapist adds verified, degree-checked psychologists to the mix, available online or in person, without the wait times a single local clinic often has.",
    faqs: [
      {
        q: "Are there psychologists available in Chandigarh?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and clinical psychologists in Chandigarh and the tricity area (Mohali, Panchkula). Browse profiles and book online or in-person sessions."
      },
      {
        q: "Can I get couples therapy in Chandigarh?",
        a: "Yes. Relationship counsellors and couples therapists on Choose Your Therapist in Chandigarh are available for both online and in-person sessions to help with communication issues, trust, and relationship conflicts."
      },
      {
        q: "Is online therapy available in Chandigarh?",
        a: "Yes. All psychologists on Choose Your Therapist offer secure online video sessions accessible from Chandigarh, Mohali, Panchkula, or anywhere in the tricity area."
      },
      {
        q: "What is the therapy session cost in Chandigarh?",
        a: "Therapy sessions with psychologists in Chandigarh on Choose Your Therapist start from ₹600 per session. All pricing is transparent and shown on each therapist's profile before you book."
      }
    ]
  },
  "uttarakhand": {
    name: "Uttarakhand",
    filterValues: ["uttarakhand"],
    cities: ["Dehradun", "Haridwar", "Rishikesh", "Nainital", "Roorkee", "Haldwani"],
    slug: "uttarakhand",
    geo: { lat: 30.0668, lng: 79.0193, region: "IN-UT" },
    description: "Find verified psychologists in Uttarakhand — Dehradun, Haridwar, Rishikesh, and online. Book therapy sessions for anxiety, depression, stress, OCD, and relationship counselling.",
    localKeywords: "psychologist in Dehradun, therapist in Haridwar, counsellor in Rishikesh, mental health Uttarakhand, online therapy Dehradun",
    localIntro: "Uttarakhand is known worldwide for wellness tourism — Rishikesh especially — yet residents of the state's own hill towns often have the least local access to mental health professionals, with many practitioners concentrated in Dehradun. Choose Your Therapist was founded here, in Haridwar, in 2020, and our online sessions now reach smaller towns and villages across the state where a psychologist's office simply doesn't exist.",
    faqs: [
      {
        q: "Are there psychologists available in Dehradun?",
        a: "Yes. Choose Your Therapist has verified psychologists in Dehradun and across Uttarakhand. You can book in-person or online sessions for anxiety, depression, stress, and other mental health concerns."
      },
      {
        q: "Can I access therapy from Rishikesh or Haridwar?",
        a: "Yes. Online therapy on Choose Your Therapist is accessible from anywhere in Uttarakhand — including Rishikesh, Haridwar, Nainital, and smaller towns. You only need a smartphone and internet connection."
      },
      {
        q: "Is online counselling available in Uttarakhand?",
        a: "Yes. All therapists on our platform offer online video sessions, making quality mental health support accessible across Uttarakhand regardless of your location."
      },
      {
        q: "What is the cost of therapy in Uttarakhand?",
        a: "Sessions with psychologists in Uttarakhand on Choose Your Therapist start from ₹500. Online sessions are flexible and affordable. Fees are displayed clearly on every therapist's profile."
      }
    ]
  },
  "west-bengal": {
    name: "West Bengal",
    filterValues: ["west bengal"],
    cities: ["Kolkata", "Howrah", "Siliguri", "Durgapur", "Asansol"],
    slug: "west-bengal",
    geo: { lat: 22.9868, lng: 87.8550, region: "IN-WB" },
    description: "Find verified psychologists in West Bengal — Kolkata, Howrah, Siliguri, and online. Book therapy sessions for anxiety, depression, OCD, relationship counselling, and stress management.",
    localKeywords: "psychologist in Kolkata, therapist in Howrah, counsellor in Siliguri, mental health West Bengal, online therapy Kolkata, best psychologist Kolkata",
    localIntro: "West Bengal has a strong culture of conversation — adda over tea, long family discussions — which can feel like emotional support but isn't a substitute for professional help when anxiety or depression run deep. Choose Your Therapist's verified psychologists, some fluent in Bengali, are available online across Kolkata, Howrah, and Siliguri for anyone who wants that conversation to be genuinely therapeutic, not just cathartic.",
    faqs: [
      {
        q: "Who are the best psychologists in Kolkata?",
        a: "Choose Your Therapist has verified counselling psychologists and clinical psychologists in Kolkata and across West Bengal. Browse their profiles, check specializations and reviews, and book a session."
      },
      {
        q: "Is Bengali-language therapy available?",
        a: "Some therapists on our platform are comfortable in Bengali. Use the 'languages spoken' filter on the therapist directory to find a Bengali-speaking psychologist for your sessions."
      },
      {
        q: "Can I get online therapy from Kolkata?",
        a: "Yes. All psychologists on Choose Your Therapist offer online video sessions — accessible from Kolkata, Howrah, Siliguri, or anywhere in West Bengal."
      },
      {
        q: "What does a therapy session cost in Kolkata?",
        a: "Therapy with psychologists in Kolkata on Choose Your Therapist starts from ₹500 per session. All fees are transparent and shown on each therapist's profile before booking."
      }
    ]
  },
  "andhra-pradesh": {
    name: "Andhra Pradesh",
    filterValues: ["andhra pradesh"],
    cities: ["Visakhapatnam", "Vijayawada", "Guntur", "Tirupati", "Nellore"],
    slug: "andhra-pradesh",
    geo: { lat: 15.9129, lng: 79.7400, region: "IN-AP" },
    description: "Find verified psychologists in Andhra Pradesh — Visakhapatnam, Vijayawada, Tirupati, and online. Book therapy sessions for anxiety, depression, OCD, relationship counselling, and more.",
    localKeywords: "psychologist in Visakhapatnam, therapist in Vijayawada, counsellor in Tirupati, mental health Andhra Pradesh, online therapy Andhra Pradesh",
    localIntro: "Andhra Pradesh's growing IT and port-city economy — centred on Visakhapatnam and Vijayawada — has brought a newer, faster pace of life to a state where mental health support has historically meant family or, for many, nothing at all. Choose Your Therapist's verified network offers a confidential, professional option for residents across the state, reachable online wherever the nearest clinic happens to be.",
    faqs: [
      {
        q: "Are there verified psychologists in Andhra Pradesh?",
        a: "Yes. Choose Your Therapist has verified counselling psychologists and clinical psychologists in Andhra Pradesh. Browse profiles by specialization and book online or in-person sessions."
      },
      {
        q: "Is Telugu-language therapy available?",
        a: "Some therapists on our platform are comfortable communicating in Telugu. Use the 'languages spoken' filter on the therapist directory to find a Telugu-speaking psychologist."
      },
      {
        q: "Can I access online therapy from Andhra Pradesh?",
        a: "Yes. All therapists on Choose Your Therapist offer secure online video sessions accessible from Visakhapatnam, Vijayawada, Tirupati, Guntur, or anywhere in Andhra Pradesh."
      },
      {
        q: "What is the cost of therapy in Andhra Pradesh?",
        a: "Therapy sessions in Andhra Pradesh on Choose Your Therapist start from ₹500 per session. Fees vary by therapist and are displayed on their profiles."
      }
    ]
  },
  // ─── City-level pages — same online network, city-specific search intent ──
  "mumbai": {
    name: "Mumbai",
    filterValues: ["maharashtra"],
    cities: ["Andheri", "Bandra", "Powai", "Thane", "Navi Mumbai", "Borivali", "Malad", "Chembur"],
    slug: "mumbai",
    geo: { lat: 19.0760, lng: 72.8777, region: "IN-MH" },
    description: "Connect with verified psychologists serving Mumbai online — for anxiety, depression, OCD, relationship issues, and workplace stress. Book flexible video sessions with degree-verified therapists from anywhere in the city.",
    localKeywords: "psychologist in Mumbai, therapist in Andheri, counsellor in Bandra, online therapy Mumbai, best psychologist Mumbai, mental health Mumbai, psychologist near me Mumbai",
    relatedRegion: { slug: "maharashtra", name: "Maharashtra" },
    localIntro: "Mumbai runs on speed — two-hour commutes, always-on work culture, and a cost of living that keeps the pressure constant — which leaves little room to find, let alone visit, a psychologist across town. Choose Your Therapist removes the travel from the equation: book a verified therapist for a video session between your commute and the next deadline, from Andheri to Chembur.",
    faqs: [
      { q: "Are there verified psychologists available for Mumbai residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists serving Mumbai through secure online video sessions. All therapists are degree-verified and experienced in evidence-based approaches like CBT and ERP." },
      { q: "Is online therapy as effective as in-person therapy in Mumbai?", a: "Research shows online therapy is as effective as in-person sessions for most concerns, including anxiety, depression, and relationship issues. It also saves commute time across a city as spread out as Mumbai." },
      { q: "Can I find a therapist in Mumbai who speaks Marathi or Hindi?", a: "Some therapists on our platform are comfortable in Marathi and Hindi in addition to English. Use the 'languages spoken' filter on our therapist directory to find the right match." },
      { q: "What does a therapy session cost for someone based in Mumbai?", a: "Online sessions on Choose Your Therapist start from ₹500. All pricing is shown transparently on each therapist's profile before you book, with no hidden fees." }
    ]
  },
  "bangalore": {
    name: "Bangalore",
    filterValues: ["karnataka"],
    cities: ["Whitefield", "Koramangala", "Indiranagar", "HSR Layout", "Electronic City", "Jayanagar"],
    slug: "bangalore",
    geo: { lat: 12.9716, lng: 77.5946, region: "IN-KA" },
    description: "Find verified psychologists serving Bangalore online — for work stress, anxiety, depression, and relationship counselling. Book a video session with a degree-verified therapist that fits your schedule.",
    localKeywords: "psychologist in Bangalore, therapist in Koramangala, counsellor in Whitefield, online therapy Bangalore, best psychologist Bangalore, mental health Bangalore, therapist near me Bangalore",
    localIntro: "Bangalore's tech and startup culture has normalised burnout in a way few other cities have — long sprints, constant deadlines, and a young migrant workforce often living far from the family support they'd otherwise lean on. Choose Your Therapist's verified psychologists are used to that specific kind of stress, and video sessions mean you can book one between stand-ups without adding a commute to an already long day.",
    faqs: [
      { q: "Are there psychologists who understand tech-industry burnout in Bangalore?", a: "Yes. Several therapists on Choose Your Therapist specialize in work-related stress, burnout, and career anxiety — common concerns among Bangalore's IT and startup workforce." },
      { q: "Can I book a therapy session in Bangalore outside office hours?", a: "Yes. Online sessions on our platform can be scheduled early morning, evening, or weekends, so you can fit therapy around a demanding work schedule." },
      { q: "Is online counselling available across Bangalore?", a: "Yes. Whether you're in Whitefield, Koramangala, Electronic City, or anywhere else in Bangalore, all you need is a stable internet connection to book a session." },
      { q: "What is the fee for a psychologist for someone in Bangalore?", a: "Sessions start from ₹500 on Choose Your Therapist. Fees vary by therapist experience and specialization, and are shown clearly on each profile." }
    ]
  },
  "pune": {
    name: "Pune",
    filterValues: ["maharashtra"],
    cities: ["Kothrud", "Baner", "Viman Nagar", "Hinjewadi", "Kharadi", "Aundh"],
    slug: "pune",
    geo: { lat: 18.5204, lng: 73.8567, region: "IN-MH" },
    description: "Connect with verified psychologists serving Pune online — for anxiety, depression, academic stress, and relationship counselling. Book a video session with a degree-verified therapist at a time that works for you.",
    localKeywords: "psychologist in Pune, therapist in Kothrud, counsellor in Baner, online therapy Pune, best psychologist Pune, mental health Pune, student counsellor Pune",
    relatedRegion: { slug: "maharashtra", name: "Maharashtra" },
    localIntro: "As one of India's biggest education hubs, Pune has a huge population of students living away from home for the first time, alongside a growing IT workforce navigating a very different kind of pressure. Choose Your Therapist's psychologists work with both — from exam anxiety and homesickness to early-career burnout — through online sessions available across Kothrud, Baner, Hinjewadi, and the rest of the city.",
    faqs: [
      { q: "Are there therapists who work with students in Pune?", a: "Yes. Choose Your Therapist has psychologists experienced with academic stress, exam anxiety, and the transition to college life — relevant for Pune's large student population." },
      { q: "Is online therapy available across Pune?", a: "Yes. All psychologists on our platform offer secure online video sessions accessible from Kothrud, Baner, Hinjewadi, Viman Nagar, or anywhere else in Pune." },
      { q: "Can I find a Marathi-speaking counsellor for someone in Pune?", a: "Some therapists on our platform are comfortable in Marathi. Use the 'languages spoken' filter on the therapist directory to find a match." },
      { q: "What does therapy cost for someone based in Pune?", a: "Online sessions start from ₹500 on Choose Your Therapist. All pricing is transparent and shown on each therapist's profile." }
    ]
  },
  "hyderabad": {
    name: "Hyderabad",
    filterValues: ["telangana"],
    cities: ["Gachibowli", "Banjara Hills", "Madhapur", "Kukatpally", "Secunderabad", "Jubilee Hills"],
    slug: "hyderabad",
    geo: { lat: 17.3850, lng: 78.4867, region: "IN-TG" },
    description: "Find verified psychologists serving Hyderabad online — for anxiety, depression, OCD, and relationship counselling. Book a video session with a degree-verified therapist from anywhere in the city.",
    localKeywords: "psychologist in Hyderabad, therapist in Gachibowli, counsellor in Banjara Hills, online therapy Hyderabad, best psychologist Hyderabad, mental health Hyderabad",
    localIntro: "Hyderabad's IT corridor around Gachibowli and Hitech City has pulled in a young, high-earning workforce that's also under high pressure — long hours balanced against family expectations that haven't always caught up with a corporate lifestyle. Choose Your Therapist's verified psychologists offer online sessions that fit around demanding schedules, wherever in the city you're based.",
    faqs: [
      { q: "Are there verified psychologists available for Hyderabad residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists offering secure online video sessions to residents of Hyderabad and the wider Telangana region." },
      { q: "Can I find a Telugu-speaking psychologist for Hyderabad?", a: "Some therapists on our platform are comfortable communicating in Telugu. Use the 'languages spoken' filter on the therapist directory to find one." },
      { q: "Is online counselling available across Hyderabad?", a: "Yes. Whether you're in Gachibowli, Banjara Hills, Kukatpally, or Secunderabad, you can book an online session from anywhere with an internet connection." },
      { q: "What is the cost of therapy for someone in Hyderabad?", a: "Sessions start from ₹500 on Choose Your Therapist. Fees vary by therapist and are displayed transparently on each profile." }
    ]
  },
  "chennai": {
    name: "Chennai",
    filterValues: ["tamil nadu"],
    cities: ["Adyar", "T Nagar", "Velachery", "Anna Nagar", "OMR", "Nungambakkam"],
    slug: "chennai",
    geo: { lat: 13.0827, lng: 80.2707, region: "IN-TN" },
    description: "Connect with verified psychologists serving Chennai online — for anxiety, depression, relationship issues, and stress management. Book a video session with a degree-verified therapist that fits your schedule.",
    localKeywords: "psychologist in Chennai, therapist in Adyar, counsellor in T Nagar, online therapy Chennai, best psychologist Chennai, mental health Chennai",
    localIntro: "Chennai balances a strong traditional family structure with one of South India's biggest IT and healthcare job markets, and that mix often means mental health struggles stay private rather than discussed — even within the family. Choose Your Therapist offers a confidential online alternative, with some Tamil-speaking psychologists on the platform, reachable from Adyar, T Nagar, OMR, or anywhere else in the city.",
    faqs: [
      { q: "Are there verified psychologists available for Chennai residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists offering online video sessions to residents across Chennai." },
      { q: "Can I find a Tamil-speaking therapist for Chennai?", a: "Some therapists on our platform are comfortable communicating in Tamil. Use the 'languages spoken' filter on the therapist directory to find a match." },
      { q: "Is online therapy available across Chennai?", a: "Yes. Whether you're in Adyar, T Nagar, OMR, or Anna Nagar, you can book a session with any therapist on our platform online." },
      { q: "What does a therapy session cost for someone in Chennai?", a: "Online sessions start from ₹500 on Choose Your Therapist. All fees are shown transparently on each therapist's profile before booking." }
    ]
  },
  "kolkata": {
    name: "Kolkata",
    filterValues: ["west bengal"],
    cities: ["Salt Lake", "New Town", "Howrah", "Behala", "Park Street", "Ballygunge"],
    slug: "kolkata",
    geo: { lat: 22.5726, lng: 88.3639, region: "IN-WB" },
    description: "Find verified psychologists serving Kolkata online — for anxiety, depression, OCD, and relationship counselling. Book a video session with a degree-verified therapist at a time that suits you.",
    localKeywords: "psychologist in Kolkata, therapist in Salt Lake, counsellor in New Town, online therapy Kolkata, best psychologist Kolkata, mental health Kolkata",
    relatedRegion: { slug: "west-bengal", name: "West Bengal" },
    localIntro: "Kolkata's culture of long, open conversation — over tea, at family gatherings — often stands in for emotional support, but it isn't the same as working through anxiety or depression with a trained professional. Choose Your Therapist's verified psychologists, some fluent in Bengali, are available for online sessions across Salt Lake, New Town, and the rest of the city, private and outside the usual social circle.",
    faqs: [
      { q: "Are there verified psychologists available for Kolkata residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists offering secure online video sessions to Kolkata and the wider West Bengal region." },
      { q: "Can I find a Bengali-speaking psychologist for Kolkata?", a: "Some therapists on our platform are comfortable in Bengali. Use the 'languages spoken' filter on our therapist directory to find one." },
      { q: "Is online counselling available across Kolkata?", a: "Yes. Whether you're in Salt Lake, New Town, Howrah, or South Kolkata, you can book an online session with any therapist on our platform." },
      { q: "What is the cost of therapy for someone based in Kolkata?", a: "Sessions start from ₹500 on Choose Your Therapist. Fees vary by therapist and are shown transparently on each profile." }
    ]
  },
  "ahmedabad": {
    name: "Ahmedabad",
    filterValues: ["gujarat"],
    cities: ["Satellite", "Bopal", "Navrangpura", "Vastrapur", "Prahlad Nagar", "Maninagar"],
    slug: "ahmedabad",
    geo: { lat: 23.0225, lng: 72.5714, region: "IN-GJ" },
    description: "Connect with verified psychologists serving Ahmedabad online — for anxiety, depression, stress, and relationship counselling. Book a video session with a degree-verified therapist from anywhere in the city.",
    localKeywords: "psychologist in Ahmedabad, therapist in Satellite, counsellor in Bopal, online therapy Ahmedabad, best psychologist Ahmedabad, mental health Ahmedabad",
    relatedRegion: { slug: "gujarat", name: "Gujarat" },
    localIntro: "Ahmedabad's business-first culture means a lot of people carrying financial and family-business pressure home, often without ever naming it as stress they could get help for. Choose Your Therapist's verified psychologists, some comfortable in Gujarati, offer private online sessions across Satellite, Bopal, Navrangpura, and Vastrapur — support that fits around a business day, not the other way round.",
    faqs: [
      { q: "Are there verified psychologists available for Ahmedabad residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists offering online video sessions across Ahmedabad and Gujarat." },
      { q: "Can I get therapy in Gujarati for someone in Ahmedabad?", a: "Some therapists on our platform are comfortable communicating in Gujarati. Check the 'languages spoken' filter on our therapist directory to find a match." },
      { q: "Is online therapy available across Ahmedabad?", a: "Yes. Whether you're in Satellite, Bopal, Navrangpura, or Vastrapur, you can book a session online from anywhere in the city." },
      { q: "What does therapy cost for someone based in Ahmedabad?", a: "Online sessions start from ₹500 on Choose Your Therapist. All pricing is transparently displayed on each therapist's profile." }
    ]
  },
  "jaipur": {
    name: "Jaipur",
    filterValues: ["rajasthan"],
    cities: ["Malviya Nagar", "Vaishali Nagar", "C-Scheme", "Mansarovar", "Jagatpura"],
    slug: "jaipur",
    geo: { lat: 26.9124, lng: 75.7873, region: "IN-RJ" },
    description: "Find verified psychologists serving Jaipur online — for anxiety, depression, academic stress, and relationship counselling. Book a video session with a degree-verified therapist that fits your schedule.",
    localKeywords: "psychologist in Jaipur, therapist in Malviya Nagar, counsellor in Vaishali Nagar, online therapy Jaipur, best psychologist Jaipur, mental health Jaipur",
    relatedRegion: { slug: "rajasthan", name: "Rajasthan" },
    localIntro: "Jaipur's growing student and young-professional population is increasingly open to therapy, but the city's fast expansion has outpaced the number of psychologists practicing locally, especially outside the older parts of the city. Choose Your Therapist fills that gap with verified therapists available online across Malviya Nagar, Vaishali Nagar, C-Scheme, and Mansarovar — no waitlist for the one clinic in your area.",
    faqs: [
      { q: "Are there verified psychologists available for Jaipur residents?", a: "Yes. Choose Your Therapist has verified counselling psychologists serving Jaipur and the wider Rajasthan region through secure online video sessions." },
      { q: "Can students in Jaipur access online counselling?", a: "Yes. We have therapists who specialize in academic stress, exam anxiety, and burnout — sessions can be booked from your room, around your study schedule." },
      { q: "Is online therapy available across Jaipur?", a: "Yes. Whether you're in Malviya Nagar, Vaishali Nagar, C-Scheme, or Mansarovar, all you need is an internet connection to book a session." },
      { q: "What is the cost of therapy for someone in Jaipur?", a: "Sessions start from ₹500 on Choose Your Therapist. Fees are shown transparently on each therapist's profile before you book." }
    ]
  },
  "lucknow": {
    name: "Lucknow",
    filterValues: ["uttar pradesh", "up", "noida"],
    cities: ["Gomti Nagar", "Hazratganj", "Indira Nagar", "Alambagh", "Aliganj"],
    slug: "lucknow",
    geo: { lat: 26.8467, lng: 80.9462, region: "IN-UP" },
    description: "Connect with verified psychologists serving Lucknow online — for anxiety, depression, OCD, and relationship counselling. Book a video session with a degree-verified therapist from anywhere in the city.",
    localKeywords: "psychologist in Lucknow, therapist in Gomti Nagar, counsellor in Hazratganj, online therapy Lucknow, best psychologist Lucknow, mental health Lucknow",
    relatedRegion: { slug: "uttar-pradesh", name: "Uttar Pradesh" },
    localIntro: "Lucknow's growing corporate and government-exam-prep population is under real pressure — competitive exams, career uncertainty, family expectations — often without a nearby psychologist who understands that specific context. Choose Your Therapist's verified network is reachable online across Gomti Nagar, Hazratganj, Indira Nagar, and Alambagh, with most therapists comfortable communicating in Hindi as well as English.",
    faqs: [
      { q: "Are there verified psychologists available for Lucknow residents?", a: "Yes. Choose Your Therapist has verified counselling and clinical psychologists serving Lucknow and across Uttar Pradesh through secure online video sessions." },
      { q: "Can I find a Hindi-speaking psychologist for Lucknow?", a: "Yes, most therapists on our platform are comfortable communicating in Hindi in addition to English. You can confirm this on each therapist's profile before booking." },
      { q: "Is online counselling available across Lucknow?", a: "Yes. Whether you're in Gomti Nagar, Hazratganj, Indira Nagar, or Alambagh, you can book a session online from anywhere in the city." },
      { q: "What does a therapy session cost for someone in Lucknow?", a: "Online sessions start from ₹500 on Choose Your Therapist. All pricing is transparent and shown on each therapist's profile." }
    ]
  }
};

// ─── Services shown on every page ───────────────────────────────────────────
export const PLACE_SERVICES = [
  { title: "Anxiety & Stress", desc: "Evidence-based therapy for worry, panic attacks, and chronic stress.", icon: "feather-wind", color: "#228756" },
  { title: "Depression", desc: "Professional support to overcome persistent low mood and hopelessness.", icon: "feather-sun", color: "#0ea5e9" },
  { title: "OCD", desc: "ERP — the gold-standard treatment for obsessive-compulsive disorder.", icon: "feather-refresh-cw", color: "#7c3aed" },
  { title: "Trauma & PTSD", desc: "Trauma-focused CBT and EMDR for healing from past painful experiences.", icon: "feather-shield", color: "#dc2626" },
  { title: "Relationship Issues", desc: "Couples counselling and individual therapy for relationship challenges.", icon: "feather-heart", color: "#e11d48" },
  { title: "Child & Adolescent", desc: "Therapy for ADHD, autism, anxiety, and behavioural issues in children.", icon: "feather-user", color: "#b45309" },
];

// does this therapist belong to the place? (therapists type their state freely: "UP", "Noida, Uttar Pradesh"…)
export const inPlace = (t, place) => {
  const s = String(t?.state || "").toLowerCase();
  return place.filterValues.some((v) => (v.length <= 3 ? new RegExp(`(^|[^a-z])${v}([^a-z]|$)`).test(s) : s.includes(v)));
};

export const placePath = (slug) => `/psychologist-in/${slug}`;

// count / in-person / lowest fee per place, from the full directory (server side)
export function placeStats(all, getMinFee, sessionModes) {
  const out = {};
  for (const [slug, place] of Object.entries(PLACES)) {
    const list = all.filter((t) => inPlace(t, place));
    const fees = list.map((t) => getMinFee(t.fees)).filter(Boolean);
    out[slug] = { count: list.length, inPerson: list.filter((t) => sessionModes(t).inPerson).length, minFee: fees.length ? Math.min(...fees) : null };
  }
  return out;
}

// states vs cities (cities point at their state via relatedRegion, or aren't a state slug)
const STATE_SLUGS = ["uttar-pradesh", "delhi", "maharashtra", "rajasthan", "gujarat", "chandigarh", "uttarakhand", "west-bengal", "andhra-pradesh"];
export const isStateSlug = (slug) => STATE_SLUGS.includes(slug);

// the visitor's state (ipapi "region") -> our place slug, if we have a page for it
export const placeForRegion = (region) => {
  const r = String(region || "").toLowerCase();
  if (!r) return null;
  if (r.includes("delhi")) return "delhi";
  return Object.keys(PLACES).find((slug) => isStateSlug(slug) && PLACES[slug].filterValues.some((v) => v.length > 3 && r.includes(v))) || null;
};

export const NOIDA_CENTRE = {
  name: "CYT Therapy Centre, Noida",
  address: "Sector 51, Noida, Uttar Pradesh 201301",
  hours: "Mon – Sun, 9 AM – 9 PM",
  book: "/noida-appointment",
  page: "/psychologist-in-noida-delhi",
};
