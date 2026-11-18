import React, { useState } from "react";

/* Relapse Prevention pack (owner's request, 2026-11-19) — 18 worksheets for alcohol / drug recovery.
   The ideas follow the standard relapse-prevention model (high-risk situations, cravings, slips, seemingly
   irrelevant decisions, lifestyle balance); every word here is our own, written for Indian clients — nothing is
   copied from any published handout. Reading guides sit inside the worksheet they belong to ("Read first").
   Each worksheet is plain data (fields below); PackForm draws any of them. Answers are one flat object
   { "<field id>": value } (keys use - not ., which MongoDB field names avoid) — the server keeps only short strings, numbers, true/false and short lists. */

export const withPack = (v) => (v && typeof v === "object" && !Array.isArray(v) ? { ...v } : {});

const TEAL = "#0f766e";
const tiles = (n, e, c) => [[String(n), TEAL], [e, c]];
const TAG = "Relapse prevention";
const RECOVERY = ["Alcohol or drug recovery", "Early recovery", "After a slip"];

const RP_LIST = [
  {
    key: "rp_quiz", n: 1, kind: "Quiz", name: "Preventing Relapse Quiz", tiles: tiles(1, "?", "#7c3aed"),
    short: "Ten common beliefs about relapse — true or false? See the fact behind each answer.",
    headline: "Test what you know about relapse",
    why: "Many people in recovery carry beliefs about relapse that quietly make it more likely — that it comes out of nowhere, or that it only happens to people with no willpower. Checking these beliefs against the facts makes relapse feel less mysterious and much more preventable.",
    benefits: ["Clear up myths that raise the risk of relapse", "Learn that relapse builds up slowly — so it can be caught early", "Feel less shame about past slips", "A good starting point to talk through with your therapist"],
    forWho: ["Alcohol or drug recovery", "Family members", "Early recovery"],
    time: "About 5 minutes",
    how: [["?", "Read each statement", "Ten short beliefs people often have about relapse."], ["T", "Choose true or false", "Go with your first answer — there's no pass or fail."], ["✦", "See the fact", "A short explanation opens after each answer."]],
    fields: [
      { t: "tf", id: "q", items: [
        { q: "A relapse starts the moment you drink or use again.", a: false, why: "Relapse usually starts much earlier — with changes in mood, thinking and routine, days or weeks before any use. That's good news: there is time to notice it and act." },
        { q: "People relapse because they don't have enough willpower.", a: false, why: "Recovery depends on skills, support and planning far more than willpower. Strong-willed people relapse too when they have no plan for high-risk moments." },
        { q: "Relapse is mostly caused by bad things happening in life.", a: false, why: "Stress can be a trigger, but so can celebrations, boredom, feeling good, or simply being around old places and people. Relapse has many paths." },
        { q: "Relapse is sudden and can't be predicted.", a: false, why: "There are almost always warning signs — skipping support, old thinking coming back, isolating, 'testing' yourself. Knowing your own signs makes relapse predictable and preventable." },
        { q: "Everyone in recovery has the same risk of relapse.", a: false, why: "Risk is different for each person and changes over time — it depends on stress, support, health, surroundings and how long you've been in recovery." },
        { q: "Relapse is always a fully conscious, deliberate choice.", a: false, why: "Small choices that seem unrelated — the route home, who you meet, keeping alcohol 'for guests' — can lead step by step into a risky spot. That's why many relapses feel unplanned." },
        { q: "Withdrawal is completely over within one or two days.", a: false, why: "The physical part may settle in days, but sleep, mood, focus and cravings can stay affected for weeks or months. Knowing this stops you from thinking 'recovery isn't working'." },
        { q: "Nothing can help someone who keeps relapsing — they need a sudden change of heart.", a: false, why: "Repeated relapse means the plan needs changing, not that the person can't recover. Therapy, support groups, lifestyle changes and, where right, medicines all help." },
        { q: "Someone with many relapses usually can't recover.", a: false, why: "Many people recover after several attempts. Each attempt teaches something about triggers and about what helps." },
        { q: "People relapse because they haven't hit 'rock bottom' yet.", a: false, why: "Nobody needs to lose everything before they recover. Help works at any stage — and the earlier, the better." },
      ] },
      { t: "text", id: "note", label: "Which answer surprised you most, and why?", rows: 3 },
    ],
  },
  {
    key: "rp_check", n: 2, kind: "Check-in", name: "How Well Are You Preventing Relapse?", tiles: tiles(2, "✓", "#0ea5e9"),
    short: "Twenty-four questions on how well your recovery plan protects you — and where to make it stronger.",
    headline: "How strong is your relapse prevention plan?",
    why: "A recovery plan has many parts — goals, triggers, support, your surroundings and how you look at past slips. This check-in shows at a glance which parts are already strong and which need attention next, so you and your therapist know where to start.",
    benefits: ["See your plan's strong and weak spots in a few minutes", "Turn a big goal into a few clear next steps", "Track how your plan improves when you repeat it later"],
    forWho: RECOVERY, time: "20–30 minutes — repeat it every few weeks",
    how: [["1", "Read each question", "Twenty-four parts of a solid recovery plan."], ["2", "Answer honestly", "A line or two for each."], ["3", "Talk it through", "Go over the gaps with your therapist."]],
    fields: [
      { t: "text", id: "q1", label: "1. Have you set goals for staying clean and sober? What will staying clean allow you to achieve?", rows: 2 },
      { t: "text", id: "q2a", label: "2a. Your use: what sets you off — money, people, places, things linked to using?", rows: 2 },
      { t: "text", id: "q2b", label: "2b. Who in your work, home and social life drinks or uses drugs?", rows: 2 },
      { t: "text", id: "q2c", label: "2c. How easy is it to get alcohol or drugs around you?", rows: 2 },
      { t: "text", id: "q2d", label: "2d. How easy is it to get money for alcohol or drugs? Are you expecting a large sum of money soon?", rows: 2 },
      { t: "text", id: "q3", label: "3. Have you gone through all your high-risk situations with your peers and your therapist?", rows: 2 },
      { t: "text", id: "q4", label: "4. Do you have a plan for every high-risk situation you can expect?", rows: 2 },
      { t: "text", id: "q5", label: "5. Have you talked about the feelings of loss or missing out that come with getting sober? Do you feel cheated because you can't drink or use?", rows: 2 },
      { t: "text", id: "q6", label: "6. Are you aware of how you justify your drinking or drug use to yourself?", rows: 2 },
      { t: "text", id: "q7", label: "7. Are you aware of the ways you have tried to control your use?", rows: 2 },
      { t: "text", id: "q8", label: "8. Are you prepared for the highs and lows of recovery?", rows: 2 },
      { t: "text", id: "q9", label: "9. Have you taken steps to make alcohol and other substances harder to get?", rows: 2 },
      { t: "text", id: "q10", label: "10. Have you told all the important people in your life about your addiction?", rows: 2 },
      { t: "text", id: "q11", label: "11. Do you expect treatment to be a 'cure' or a magic solution?", rows: 2 },
      { t: "text", id: "q12", label: "12. How do you 'test' yourself in recovery?", rows: 2 },
      { t: "text", id: "q13", label: "13. How will you limit your time with people who drink or use drugs?", rows: 2 },
      { t: "text", id: "q14", label: "14. Are you aware of the 'chain' of decisions that leads you to using?", rows: 2 },
      { t: "text", id: "q15", label: "15. Have you looked closely at past relapses? Do you see them as mistakes, failures or moments of weakness?", rows: 2 },
      { t: "text", id: "q16", label: "16. Which of your personality traits might get in the way of your recovery?", rows: 2 },
      { t: "text", id: "q17", label: "17. Do you feel you're entitled to drink or use?", rows: 2 },
      { t: "text", id: "q18", label: "18. How well can you keep track of how you are feeling?", rows: 2 },
      { t: "text", id: "q19", label: "19. How well do you solve problems? Do you jump at the first solution you see?", rows: 2 },
      { t: "text", id: "q20", label: "20. Do you assume that if you don't have cravings during treatment, you won't have them after it?", rows: 2 },
      { t: "text", id: "q21", label: "21. Do you see craving as something with a life of its own, out of your control?", rows: 2 },
      { t: "text", id: "q22", label: "22. What lifestyle changes have you made? Do you need to change the way you structure your days?", rows: 2 },
      { t: "text", id: "q23", label: "23. Do you go out and look for help, or wait for it to come to you?", rows: 2 },
      { t: "text", id: "q24", label: "24. What are your plans for reducing complications and crises in your life?", rows: 2 }
    ],
  },
  {
    key: "rp_stages", n: 3, kind: "Guide + reflect", name: "Stages of Recovery", tiles: tiles(3, "▲", "#16a34a"),
    short: "The four stages most people move through in recovery — and which one you are in now.",
    headline: "Know where you are in your recovery",
    why: "Recovery isn't one long stretch — it moves through stages, each with its own focus. Knowing your stage helps you put your energy in the right place, be patient with what can't be rushed, and see how far you've already come.",
    benefits: ["Understand what to focus on right now", "Feel less frustrated by slow progress", "See what's coming next — and how to prepare"],
    forWho: RECOVERY, time: "About 10 minutes",
    how: [["i", "Read the four stages", "What each stage is about."], ["●", "Find your stage", "Where you are today."], ["→", "Pick a focus", "One task for this month."]],
    read: { title: "Stages of Recovery", sections: [
      { h: "1 · Stopping (about the first 6 months)", list: ["The focus is on not drinking or using", "Tasks are clear and practical — changes are easy to see", "Life often feels calmer quite quickly", "Building a new daily routine takes most of your attention"] },
      { h: "2 · Rebuilding life (about 6 to 18 months)", list: ["The focus is on preventing relapse", "Decisions about relationships, home, free time, work and family", "Results take longer, as these changes affect other people too", "Building a strong base for the long term"] },
      { h: "3 · Knowing yourself (after about 18 months)", list: ["Deeper issues — past hurt, mental health, old patterns, conflicts", "Often needs time and regular therapy", "Change is more on the inside, so it's less visible", "Understanding your own life takes most of your attention"] },
      { h: "4 · Meaning and purpose (lifelong)", list: ["Questions like 'Who am I?' and 'What matters to me?'", "For some it's faith, for others a mentor — for everyone, reflection", "These questions stay with us all our lives"] },
      { h: "Remember", list: ["You don't choose your stage — you grow into it", "Stages change slowly; someone else may notice before you do", "Each stage builds on the last — the base comes first", "People get stuck at different stages — learn from those further along"] },
    ] },
    fields: [
      { t: "pick", id: "stage", label: "Which stage do you think you are in right now?", options: ["1 · Stopping", "2 · Rebuilding life", "3 · Knowing yourself", "4 · Meaning and purpose", "Not sure"] },
      { t: "text", id: "why", label: "What makes you think so?", rows: 3 },
      { t: "text", id: "next", label: "One task of this stage you want to focus on this month", rows: 3 },
    ],
  },
  {
    key: "rp_review", n: 4, kind: "Worksheet", name: "Relapse Prevention Self-Assessment", tiles: tiles(4, "↺", "#2563eb"),
    short: "Retrace your last relapse — the warning signs, the moment, and what could make the difference next time.",
    headline: "Learn from your last relapse",
    why: "Looking back at a relapse with curiosity, not blame, shows the chain that led to it — the early warning signs, the setting, the feelings. Each link you can name is a place where you can step in next time.",
    benefits: ["Spot your personal early warning signs", "See how much time you had to act", "Turn a painful moment into a plan", "Rate your motivation so your therapist knows where you stand"],
    forWho: ["After a relapse", "Alcohol or drug recovery", "Relapse prevention planning"], time: "10–15 minutes",
    how: [["1", "The warning signs", "What came first."], ["2", "The moment", "Where, when and with whom."], ["3", "Next time", "What you'd do differently."]],
    fields: [
      { t: "text", id: "signs", label: "What behaviours or warning signs came before your most recent relapse?", rows: 4 },
      { t: "text", id: "gap", label: "How much time passed between the first warning sign and drinking / using?", rows: 1 },
      { t: "text", id: "where", label: "Where did it happen, and who were you with?", rows: 2 },
      { t: "text", id: "before", label: "What thoughts, feelings and attitudes came before it?", rows: 3 },
      { t: "text", id: "diff", label: "What could you have done differently to prevent it?", rows: 3 },
      { t: "scale", id: "motivation", label: "Honestly, how motivated are you right now to do what it takes to prevent another relapse?", min: 1, max: 10, low: "Not at all", high: "Fully" },
    ],
  },
  {
    key: "rp_treatment", n: 5, kind: "Questionnaire", name: "Treatment Attitudes Questionnaire", tiles: tiles(5, "✎", "#9333ea"),
    short: "What helped before, what didn't, and how you honestly feel about treatment and support.",
    headline: "Your honest view of treatment",
    why: "How we feel about treatment shapes how much it helps. Writing down what worked before, what didn't, and which beliefs you hold lets you and your therapist build a plan that fits you — instead of repeating what didn't work.",
    benefits: ["Keep what helped before, drop what didn't", "Notice beliefs that could block your progress", "Give your therapist an honest starting point"],
    forWho: ["Starting treatment", "Treatment before", "Alcohol or drug recovery"], time: "10 minutes",
    how: [["1", "Past treatment", "What helped and what didn't."], ["2", "Support groups", "Your experience with meetings."], ["3", "Your beliefs", "True or not true for you."]],
    fields: [
      { t: "text", id: "times", label: "How many times have you had residential (inpatient) treatment before?", rows: 1, hint: "First time? Skip to the support group question." },
      { t: "text", id: "helped", label: "What helped in past treatment?", rows: 2 },
      { t: "text", id: "nothelped", label: "What didn't help?", rows: 2 },
      { t: "text", id: "followed", label: "Which suggestions did you follow?", rows: 2 },
      { t: "text", id: "ignored", label: "Which suggestions did you ignore?", rows: 2 },
      { t: "pick", id: "groups", label: "Have you been to support group meetings (like AA or NA)?", options: ["Yes", "No"] },
      { t: "text", id: "gyes", label: "If yes — what was helpful about the meetings?", rows: 2 },
      { t: "text", id: "gno", label: "What was not helpful about the meetings?", rows: 2 },
      { t: "agree", id: "b", label: "Answer each statement True or False:", labels: ["True", "False"], items: [
        "I expect treatment to take real work from me",
        "It annoys me when people say I need treatment",
        "I expect treatment to help me in the long run",
        "I'd feel guilty if I refused treatment",
        "I need support to stay sober",
        "Once treatment ends, most of my problems will be solved",
        "I can handle my problems on my own",
        "As long as I stay sober, everything else will fall into place",
        "My drinking / use is caused by bad things that happened to me",
        "I don't see the point of talking about my problems",
        "I don't like the idea of going to a lot of meetings",
        "Anyone with my problems would drink or use",
        "My family and friends support my treatment",
        "I don't trust people enough to open up",
        "I need to change my lifestyle to stay sober",
        "I'm willing to change my routine to make time for aftercare",
        "I'm willing to take guidance from others about my recovery",
        "I get defensive when people give me feedback",
      ] },
    ],
  },
  {
    key: "rp_patterns", n: 6, kind: "Worksheet", name: "Recovery Behaviours Form", tiles: tiles(6, "⇄", "#ea580c"),
    short: "Spot the habits that can quietly get in the way of treatment, and plan three better moves for each.",
    headline: "Turn treatment roadblocks into progress",
    why: "Almost everyone falls into a few habits in treatment that protect them from discomfort — staying quiet, blaming, saying 'yes, but…'. They feel safe but slow recovery down. Naming your own patterns and planning small, positive actions makes therapy and group work far more useful.",
    benefits: ["Recognise your own patterns without judging yourself", "Plan three concrete actions for each", "Get much more out of sessions and groups"],
    forWho: ["In treatment or groups", "Alcohol or drug recovery", "Feeling stuck in therapy"], time: "10–15 minutes",
    how: [["i", "Read the patterns", "Seventeen common ones."], ["1", "Pick three", "The ones you notice in yourself."], ["2", "Plan actions", "Three positive steps for each."]],
    read: { title: "Negative Behaviours in Treatment", intro: "Most of us show some of these now and then. Spotting yours is a strength, not a failure.", sections: [
      { list: [
        "The Intimidator — uses anger to keep people at a distance",
        "The Intellectual — knows a lot about addiction but doesn't apply it to themselves",
        "The Victim — blames life events for the drinking or use",
        "The Blamer — blames other people",
        "Playing dumb — \"I don't understand\"",
        "The Avoider — stays quiet and keeps a low profile",
        "The Socialite — friendly with everyone, but stays on the surface",
        "The Slogan expert — repeats group sayings but never gets personal",
        "The Charmer — thinks they can fool people",
        "Closed mind — \"I already know what I need to do\"",
        "The Magic answer — \"I know exactly what caused my problem\"",
        "\"Yes, but…\" — \"Good idea, but it won't work for me\"",
        "The Deflector — moves attention away from themselves",
        "Lip service — agrees to things but doesn't follow through",
        "The Controller — tries to steer how treatment should go",
        "The Stirrer — turns others against the team",
        "The Suspicious one — \"What will you do with this information?\"",
      ] },
    ] },
    example: { title: "Example", lines: ["Pattern: The Avoider — I keep a low profile.", "1. Introduce myself to one new person each week.", "2. Say one thing in group, even something small.", "3. Ask myself why I'm hiding — scared? ashamed? — and talk about it with my therapist."] },
    fields: [
      { t: "group", id: "p", title: "Pattern", n: 3, fields: [
        { t: "pick", id: "w", label: "A pattern I notice in myself", other: true, options: ["The Intimidator", "The Intellectual", "The Victim", "The Blamer", "Playing dumb", "The Avoider", "The Socialite", "The Slogan expert", "The Charmer", "Closed mind", "The Magic answer", "\"Yes, but…\"", "The Deflector", "Lip service", "The Controller", "The Stirrer", "The Suspicious one"] },
        { t: "lines", id: "a", label: "Three positive actions to change it", n: 3 },
      ] },
    ],
  },
  {
    key: "rp_risk", n: 7, kind: "Worksheet", name: "My High-Risk Situations", tiles: tiles(7, "!", "#dc2626"),
    short: "The seven kinds of situations that lead to relapse — find your top three and plan how to cope with each.",
    headline: "Know your high-risk moments — and plan for them",
    why: "Most relapses happen in a handful of predictable situations — strong feelings, conflict, celebrations, social pressure. When you know which ones are risky for you and have coping steps ready, the moment loses much of its power.",
    benefits: ["Learn the seven common high-risk situations", "Name your own top three with real examples", "Have three coping steps ready for each"],
    forWho: RECOVERY, time: "15 minutes",
    how: [["i", "Read the 7 situations", "Where relapse usually happens."], ["1", "Pick your top three", "With a real example of each."], ["2", "Plan to cope", "Three steps for each one."]],
    read: { title: "High-Risk Situations for Relapse", sections: [
      { h: "Difficult feelings", p: "Wanting to drink or use to change how you feel — fear, anger, sadness, anxiety, tension, boredom, loneliness or guilt." },
      { h: "Physical discomfort", p: "Wanting relief from feeling unwell — shakiness or poor sleep after stopping, or pain, illness, injury, tiredness and headaches." },
      { h: "Wanting to feel even better", p: "Feeling good and wanting more — birthdays, weddings, festivals, holidays. \"Just this once, it's a special day.\"" },
      { h: "Testing yourself", p: "Wondering if you really have a problem, using once 'to see if I can stop', or walking into a tempting place to prove your willpower." },
      { h: "Urges and reminders", p: "Being around alcohol or drugs, or things that remind you of them — even a film scene. Sometimes urges come out of the blue." },
      { h: "Conflict with someone", p: "An argument or tension with a partner, family member, friend or colleague — frustration, jealousy, anger, worry." },
      { h: "Social pressure", p: "Someone directly offering or pushing you, or simply being around people who are drinking or using." },
    ] },
    example: { title: "Example", lines: ["Situation: Conflict with someone", "Example: I feel like drinking every time I fight with my partner.", "1. Take a walk to clear my head.", "2. Remind myself what drinking has cost me.", "3. Write my feelings in my journal."] },
    fields: [
      { t: "group", id: "s", title: "Situation", n: 3, fields: [
        { t: "pick", id: "k", label: "Type of situation", options: ["Difficult feelings", "Physical discomfort", "Wanting to feel even better", "Testing yourself", "Urges and reminders", "Conflict with someone", "Social pressure"] },
        { t: "text", id: "ex", label: "A real example from your life", rows: 2 },
        { t: "lines", id: "c", label: "Three ways you could cope", n: 3 },
      ] },
    ],
  },
  {
    key: "rp_dilemma", n: 8, kind: "Worksheet", name: "My Recovery Dilemmas", tiles: tiles(8, "⇆", "#0891b2"),
    short: "Pick a tricky real-life situation in recovery and work out a new way to handle it, step by step.",
    headline: "Work through a tricky moment in recovery",
    why: "Recovery brings awkward, painful questions — friends who still drink, family who don't understand, how to sleep or socialise sober. Thinking one dilemma through in six steps shows what the old way cost you and builds a clear new plan.",
    benefits: ["See that these dilemmas are common — you're not alone", "Compare the old way with what you want now", "Leave with a practical new strategy"],
    forWho: RECOVERY, time: "15 minutes",
    how: [["i", "Read common dilemmas", "Twenty-one real situations."], ["1", "Choose one", "The one that fits you best."], ["2", "Six steps", "From old habit to new plan."]],
    read: { title: "Some Common Recovery Dilemmas", sections: [
      { list: [
        "Someone you used to buy from wants money you owe",
        "Your partner asks why you need so many meetings or sessions",
        "A parent keeps asking how you 'got like this'",
        "Friends invite you to a party and say you can 'just have a beer'",
        "Friends offer you something else, saying your 'real' problem is only one drug",
        "You feel you're missing out on all the fun",
        "You wonder how you'll sleep without it",
        "You wonder how you'll handle sadness, loneliness or anxiety without it",
        "You wonder how you'll talk to people without being high",
        "You wonder what 'normal' even feels like",
        "You wonder how you'll cope with physical pain",
        "A friend drops by with alcohol or drugs",
        "A family member mocks you for going to meetings",
        "People are using all around your area or street",
        "You feel lost after giving up activities linked to using",
        "You don't know how you'll cope with a stressful job",
        "A friend keeps bringing up the 'good old days'",
        "You feel guilty about things you did to get money for using",
        "You feel like a failure because of past relapses",
        "You wonder who you are as a sober person",
        "Intimacy feels hard without alcohol or drugs",
      ] },
    ] },
    fields: [
      { t: "pick", id: "d", label: "The dilemma you'll work on", other: true, options: ["Someone wants money I owe from using", "My partner questions my meetings / sessions", "A parent asks how I 'got like this'", "Friends say I can 'just have a beer'", "Friends offer me a different drug", "Missing out on the fun", "Sleeping without it", "Handling sadness, loneliness or anxiety", "Talking to people sober", "Not knowing what 'normal' feels like", "Coping with physical pain", "A friend drops by with alcohol or drugs", "Family mocks my meetings", "People using all around my area", "Feeling lost without old activities", "A stressful job", "Friends bring up the 'good old days'", "Guilt about the past", "Feeling like a failure after relapses", "Who am I sober?", "Intimacy without alcohol or drugs"] },
      { t: "text", id: "s1", label: "1. A specific situation where this puts your recovery at risk", rows: 2 },
      { t: "text", id: "s2", label: "2. How you used to cope with it", rows: 2 },
      { t: "text", id: "s3", label: "3. What that old way led to", rows: 2 },
      { t: "text", id: "s4", label: "4. What you want instead", rows: 2 },
      { t: "text", id: "s5", label: "5. What good will come from the new way", rows: 2 },
      { t: "text", id: "s6", label: "6. Your new plan to get there", rows: 3 },
    ],
  },
  {
    key: "rp_cravings", n: 9, kind: "Worksheet", name: "My Craving Triggers", tiles: tiles(9, "≈", "#2563eb"),
    short: "Tools that get you through a craving — then your top three triggers, each with three things to do instead.",
    headline: "Ride out cravings with a plan",
    why: "Cravings feel urgent, but they always pass — like a wave that rises, peaks and falls. Knowing what sets yours off, and having three ready alternatives for each trigger, means you don't have to decide what to do in the hardest moment.",
    benefits: ["Learn practical tools that work during a craving", "Name the triggers that set yours off", "Have three positive alternatives ready for each"],
    forWho: ["Strong cravings", "Alcohol or drug recovery", "Early recovery"], time: "15 minutes",
    how: [["i", "Read the craving tools", "What helps in the moment."], ["1", "Your three triggers", "What sets cravings off."], ["2", "Three alternatives", "What you'll do instead."]],
    read: { title: "Managing Cravings: Tricks and Tools", sections: [
      { p: "Some people, places and situations are best avoided so you don't put yourself at risk. You can't avoid every one, but you can know your personal triggers and stay away from them as much as possible. Early recovery is not the time to 'test' yourself on purpose. If you know a risky situation is coming, make a plan for coping with cravings before you go." },
      { h: "Leave", p: "If a place or situation sets off a craving, leave. A polite excuse is fine — your recovery comes first." },
      { h: "Talk to someone", p: "Call a supportive friend, your sponsor or your therapist. If they don't pick up, call the next person. Keep numbers handy." },
      { h: "Go to a support meeting", p: "An AA / NA meeting or your group — an hour where you're safe and understood." },
      { h: "Get active", p: "A walk, exercise, a shower, chores, playing with your kids, a film — ideally somewhere alcohol and drugs aren't around." },
      { h: "Write it down", p: "What you feel, where you were and what helped. Over time, patterns show up." },
      { h: "Ride the wave", p: "Cravings always pass. Put off the decision for 15 minutes at a time — the urge rises, peaks and falls." },
      { h: "Clear your space", p: "Remove alcohol, drugs and anything that goes with them from your home — they keep cravings alive." },
      { h: "Dreams are normal", p: "Dreams about drinking or using are common and fade with time. Writing and talking about them takes away their power." },
      { h: "In a crisis", p: "Big events like a loss can stir old habits even in solid recovery. Lean on the tools that have worked for you all along." },
      { h: "Read recovery literature", p: "Books such as the AA Big Book inspire, give practical ideas and can calm anxiety." },
      { h: "Each win weakens the trigger", p: "Facing a trigger without using — with support and a plan — makes it a little weaker every time." },
    ] },
    example: { title: "Example", lines: ["Trigger: My old drinking friends call me to go out.", "1. Tell them I don't drink any more and end the call quickly.", "2. Go to a meeting.", "3. Go to the gym."] },
    fields: [
      { t: "group", id: "t", title: "Trigger", n: 3, fields: [
        { t: "text", id: "w", label: "The trigger", rows: 2 },
        { t: "lines", id: "a", label: "Three positive things you can do instead", n: 3 },
      ] },
    ],
  },
  {
    key: "rp_brain", n: 10, kind: "Guide + reflect", name: "Protracted Withdrawal", tiles: tiles(10, "✱", "#db2777"),
    short: "Why focus, sleep and mood can stay off for months after stopping — and what helps the brain heal.",
    headline: "Your brain is healing — here's what helps",
    why: "After long use, the brain needs time to heal. Feeling foggy, forgetful or on edge for weeks after stopping is common — and it's a sign of healing, not a sign that sobriety isn't working. Knowing this makes the hard weeks easier to get through.",
    benefits: ["Understand what you may notice after the first week", "Know these signs improve with time", "Choose a few things that help your brain recover"],
    forWho: ["First months after stopping", "Alcohol or drug recovery", "Family members"], time: "10 minutes",
    how: [["i", "Read what happens", "Why the brain needs time."], ["✓", "Tick what you notice", "Your own signs."], ["→", "Pick what helps", "Your plan for this week."]],
    read: { title: "Protracted Withdrawal", sections: [
      { h: "What is it?", p: "After long use of alcohol or drugs, the brain takes time to heal. After the first week you may feel better physically, but thinking can stay foggy for weeks or even months. It improves steadily as recovery goes on, and it doesn't affect your overall intelligence. These signs come from the past use — not from being sober. Healing can take a little longer as we get older." },
      { h: "Signs you may notice", list: ["Trouble remembering new things", "Trouble solving problems", "Poor concentration", "Strong emotional reactions — or feeling numb", "Sleep problems and vivid dreams", "Clumsiness, poor balance or dizziness", "Feeling stressed more easily", "Trouble picking up new ideas", "Poor hand–eye coordination"] },
      { h: "What helps", list: ["Talk about how you feel", "Learn about these signs", "Write things down", "Keep your mind active — read, do puzzles", "Notice what stresses you", "Learn relaxation skills", "Eat three balanced meals; go easy on caffeine and sugar", "Exercise 3–4 times a week", "Find meaning — faith, values, purpose", "Balance work and rest", "Build healthy relationships"] },
    ] },
    fields: [
      { t: "checks", id: "signs", label: "Which of these have you noticed?", groups: [{ items: ["Trouble remembering new things", "Trouble solving problems", "Poor concentration", "Strong emotions or feeling numb", "Sleep problems / vivid dreams", "Clumsiness or dizziness", "Stressed more easily", "Trouble picking up new ideas", "Poor hand–eye coordination"] }] },
      { t: "checks", id: "helps", label: "Which will you try this week?", groups: [{ items: ["Talk about how I feel", "Write things down", "Read or do puzzles", "Relaxation practice", "Three balanced meals", "Less caffeine and sugar", "Exercise 3–4 times", "Balance work and rest", "Time with healthy people"] }] },
      { t: "text", id: "ask", label: "Anything else you've noticed, or want to ask your therapist?", rows: 3 },
    ],
  },
  {
    key: "rp_slip", n: 11, kind: "Guide + plan", name: "Abstinence Violation Effect", tiles: tiles(11, "↶", "#f59e0b"),
    short: "Why one slip can turn into a full relapse — and a plan, made in advance, to stop that happening.",
    headline: "Stop a slip from becoming a relapse",
    why: "After a slip, guilt and shame often say \"I've already blown it, so what's the use?\" — and that thought turns one slip into a full relapse. Deciding now, while you're calm, exactly what you'll do and who you'll tell makes it far easier to get straight back on track.",
    benefits: ["Understand the 'what's the use' trap", "See a slip as something to learn from, not a failure", "Have your next steps decided in advance"],
    forWho: RECOVERY, time: "10 minutes",
    how: [["i", "Read about slips", "The 'what's the use' trap."], ["↶", "Make your plan", "What you'll do and who you'll tell."], ["↺", "Learn from the past", "What led to an earlier slip."]],
    read: { title: "The Abstinence Violation Effect", sections: [
      { p: "After giving in to an urge — to alcohol, drugs, food, anything — most people feel guilty and start putting themselves down. That leads to: \"What's the use? I've already slipped, once more won't matter.\" This thinking is dangerous and needs handling straight away, before a slip becomes a full relapse. (Therapists call it the abstinence violation effect.)" },
      { p: "The trap is stronger when you blame something fixed inside you, like \"I have no willpower\" — that brings shame and the feeling that all is lost. It's weaker when you see a cause you can change, like \"I went to that party without a plan\" — because next time you can do it differently." },
      { h: "How to handle a slip", list: ["Get out of the situation — staying clouds your judgement", "Treat it as a lesson, not a failure — you needed more information, that's all", "Play detective — retrace the decisions and thoughts that led up to it", "Don't keep it secret — secrets feed more slips", "Talk to supportive people — they may see patterns you missed", "Make a plan ahead of time — decide now what you'll do if it happens"] },
    ] },
    fields: [
      { t: "text", id: "first", label: "If I slip, the first thing I'll do to get out of the situation", rows: 2 },
      { t: "text", id: "tell", label: "Who I'll tell, and how I'll reach them", rows: 2 },
      { t: "text", id: "say", label: "What I'll say to myself instead of \"what's the use\"", rows: 2 },
      { t: "text", id: "past", label: "If you've slipped before — what led up to it? Play detective", rows: 3 },
      { t: "text", id: "change", label: "What I'd change next time", rows: 2 },
    ],
  },
  {
    key: "rp_decisions", n: 12, kind: "Guide + plan", name: "Seemingly Irrelevant Decisions", tiles: tiles(12, "→", "#65a30d"),
    short: "Everyday choices that seem harmless but lead step by step towards relapse — and the safer choice for each.",
    headline: "Catch the small choices that lead to relapse",
    why: "Many relapses begin with decisions that seem to have nothing to do with drinking or using — the route home, keeping a bottle 'for guests', an empty weekend. Each small step moves you closer to a risky moment. Spotting them early lets you choose the safer path while it's still easy.",
    benefits: ["Learn how ordinary choices can lead to relapse", "Spot the small decisions coming up for you", "Plan the safer option in advance"],
    forWho: RECOVERY, time: "10 minutes",
    how: [["i", "Read how it works", "Seemingly irrelevant decisions."], ["1", "List your decisions", "Small choices coming up."], ["2", "Choose safer", "The lower-risk option for each."]],
    read: { title: "Seemingly Irrelevant Decisions (SIDs)", sections: [
      { p: "These are everyday choices that seem unimportant but can move you, step by step, towards a situation where you have to decide whether to drink or use. In the moment they don't feel connected to drinking at all — which is why they're hard to spot. Looking back, the chain is usually clear." },
      { h: "Think ahead", list: ["Before a choice, think through the options", "Picture where each option could lead", "Pick the one with the lowest risk — avoiding a risky spot is easier than resisting once you're in it", "If you do choose the riskier option, plan how you'll protect yourself"] },
      { h: "Examples", list: ["Keeping alcohol at home 'for guests'", "Meeting old friends at the usual bar or theka", "Going to a party or wedding where people will be drinking", "Buying snacks from a shop that also sells alcohol", "Taking the road past your old place", "Leaving the weekend unplanned", "Not telling a friend that you've stopped", "Free time after work with nothing planned"] },
    ] },
    fields: [
      { t: "group", id: "d", title: "Decision", n: 3, fields: [
        { t: "text", id: "w", label: "A small decision coming up for me", rows: 2 },
        { t: "text", id: "r", label: "The risky option — and where it could lead", rows: 2 },
        { t: "text", id: "s", label: "The safer option I'll choose", rows: 2 },
      ] },
    ],
  },
  {
    key: "rp_attitudes", n: 13, kind: "Worksheet", name: "My Relapse Attitudes", tiles: tiles(13, "❝", "#7c3aed"),
    short: "Three attitudes that put you at risk, how each shows up in what you do, and a new behaviour for each.",
    headline: "Change the attitudes that put recovery at risk",
    why: "Attitudes like self-pity, resentment or \"I've got this handled\" can quietly steer behaviour back towards using. Naming the attitude, seeing exactly how it shows up, and choosing one new behaviour gives you something concrete to practise.",
    benefits: ["Name the attitudes that raise your risk", "See how they show up in daily life", "Choose a new behaviour to practise"],
    forWho: RECOVERY, time: "10–15 minutes",
    how: [["1", "The attitude", "One that puts you at risk."], ["2", "How it shows", "What you do now."], ["3", "New behaviour", "What you'll do instead."]],
    example: { title: "Example", lines: ["Attitude: Self-pity — I keep asking 'why me?'", "How it shows: I complain that I have to go to meetings and work so hard at sobriety when most people don't. It feels unfair.", "New behaviour: Talk about these feelings with my therapist, group or sponsor."] },
    fields: [
      { t: "group", id: "a", title: "Attitude", n: 3, fields: [
        { t: "text", id: "w", label: "An attitude that puts me at risk", rows: 2 },
        { t: "text", id: "now", label: "How it shows in what I do now", rows: 2 },
        { t: "text", id: "new", label: "A new behaviour to deal with it", rows: 2 },
      ] },
    ],
  },
  {
    key: "rp_thinking", n: 14, kind: "Worksheet", name: "Managing My Relapse Thinking", tiles: tiles(14, "✦", "#0d9488"),
    short: "Ways to think yourself out of using — then two of your risky situations, each with three ways out.",
    headline: "Think your way out of a risky moment",
    why: "In risky moments the mind often focuses only on the 'fun' of using. Deliberately thinking about the real consequences, your progress and the beliefs that trip you up breaks that tunnel vision. Planning your thinking in advance means it's ready when you need it.",
    benefits: ["Learn six ways to think yourself out of using", "Challenge beliefs like 'just one won't hurt'", "Prepare your own ways out for two risky situations"],
    forWho: RECOVERY, time: "15 minutes",
    how: [["i", "Read the six ways", "How to think your way out."], ["1", "Two situations", "Where your thinking puts you at risk."], ["2", "Three ways out", "For each situation."]],
    read: { title: "Think Your Way Out of Using", sections: [
      { h: "Think about what you gain", p: "Better health, family life, steadier work, more money for things that matter, and self-respect." },
      { h: "Remember the bad times honestly", p: "Hangovers, blackouts, fights, shame, money gone, trouble at home or with the police. Picture one specific moment." },
      { h: "Focus on your progress", p: "Don't dwell on what you've 'given up' — if using were still fun, you wouldn't have stopped. Think of what you can do now that you couldn't before." },
      { h: "Think about what could still happen", p: "Going back could bring things you haven't faced yet — losing a job, a relationship, your home, your health, legal trouble, or worse." },
      { h: "Distract your mind", p: "Switch to something absorbing — people you love, a hobby, a task you want to finish." },
      { h: "Challenge risky beliefs", list: ["\"I can control it — just one.\" → Remember what happened the last time you said that.", "\"I deserve a drink after work.\" → Keep a list of other ways to unwind, and use it.", "\"Everyone else is having fun.\" → It only seemed that way because you were around people who used. Most people don't."] },
    ] },
    example: { title: "Example", lines: ["Situation: Walking past a bar with loud music, I want to be inside having fun too.", "1. Think how the night would really end — a fight at home, a blackout, a hangover, regret.", "2. Focus on how far I've come.", "3. Remember what happened the last time I told myself 'just one'."] },
    fields: [
      { t: "group", id: "s", title: "Situation", n: 2, fields: [
        { t: "text", id: "w", label: "The situation, and the thought that puts me at risk", rows: 2 },
        { t: "lines", id: "o", label: "Three ways to think my way out", n: 3 },
      ] },
    ],
  },
  {
    key: "rp_balance", n: 15, kind: "Check-in", name: "Assessing Your Lifestyle", tiles: tiles(15, "≡", "#ca8a04"),
    short: "Questions across nine areas of life — physical, emotional, family, work, money and more — to see where life is out of balance.",
    headline: "How balanced is your life right now?",
    why: "When life is badly out of balance — too much work, no rest, no friends, money worries — using can start to feel like an escape. A quick look across nine areas shows where life is thin, so you can build it up and lower your risk.",
    benefits: ["See your whole life on one page", "Spot the areas that drain you", "Pick one small step to restore balance"],
    forWho: ["Alcohol or drug recovery", "Stress and burnout", "Rebuilding life"], time: "10 minutes",
    how: [["1", "Nine areas of life", "A few questions in each."], ["2", "Answer Yes or No", "Notice where balance is missing."], ["3", "One step", "Where you'll start."]],
    read: { title: "Assessing Your Lifestyle", sections: [{ p: "A balanced lifestyle raises your satisfaction with life and lowers your risk of relapse. When life is badly out of balance and you feel overwhelmed by duties and pressure, drinking or using can start to look like an escape. Some areas will be out of balance for a while — what matters is working towards a balance that suits you. Go through the questions below and notice the areas where moderation is hard for you." }] },
    fields: [
      { t: "yn", id: "l", label: "Answer each question Yes or No — notice where your life is out of balance", groups: [{"h":"Physical","items":["Do you exercise regularly?","Do you eat a reasonable diet?","Do you take good care of your appearance?","Do you get enough sleep?","Do you get regular medical and dental check-ups?"]},{"h":"Mental / emotional","items":["Do you have ways of coping with stress?","Are you seriously depressed or anxious?","Do you worry too much or feel too much stress?"]},{"h":"Intellectual","items":["Are you able to meet your intellectual needs?","Do you have enough interests to keep your mind curious?"]},{"h":"Creative / artistic","items":["Do you practise your creativity or art regularly?","Do you have talents or abilities you are not fully using?"]},{"h":"Family","items":["Are you generally satisfied with your family relationships?","Do you spend enough time with your family?","Can you rely on your family for help and support?"]},{"h":"Personal relationships","items":["Are you happy with how many relationships you have, and how good they are?","Do you have friends you can depend on for help and support?","Can you express your ideas, needs and feelings to others?","Are there relationships in which you have serious problems?"]},{"h":"Spiritual","items":["Is there enough love in your life?","Do you feel a sense of inner peace?","Do you pay enough attention to your inner, spiritual life?"]},{"h":"Work / school","items":["Do you spend too much time or effort working?","Do you spend too little time or effort working?","Are you generally satisfied with your work or studies?"]},{"h":"Financial","items":["Do you have any serious money problems?","Do you handle your money responsibly?","Do you earn enough to meet your expenses?"]}] },
      { t: "text", id: "hard", label: "Areas where you find it hard to keep a healthy balance", rows: 3 },
      { t: "text", id: "step", label: "One small step you'll take to bring more balance", rows: 2 }
    ],
  },
  {
    key: "rp_leisure", n: 16, kind: "Checklist", name: "Leisure Activity Exercise", tiles: tiles(16, "♪", "#e11d48"),
    short: "Over 120 activities in seven groups — tick the ones you'd like to take part in or learn more about.",
    headline: "Fill your free time with things you enjoy",
    why: "Stopping alcohol or drugs often leaves empty hours — and boredom is one of the biggest triggers. Choosing enjoyable activities, old and new, gives your time and energy somewhere good to go.",
    benefits: ["Find activities that fit your interests", "Fill the hours that used to go to using", "Meet people who share healthy interests"],
    forWho: ["Boredom or empty evenings", "Alcohol or drug recovery", "Rebuilding life"], time: "5–10 minutes",
    how: [["✓", "Tick what appeals", "Things to try or get back to."], ["+", "Add your own", "Anything we missed."], ["+", "Plan one", "When, where and with whom."]],
    fields: [
      { t: "checks", id: "act", label: "Tick every activity you'd like to take part in or learn more about", groups: [{"h":"Sports","items":["Waterskiing","Downhill skiing","Cross-country skiing","Hang-gliding","Parachuting","Tobogganing / sledding","Tennis","Soccer (football)","Rugby","American football","Baseball","Softball","Basketball","Field hockey","Street hockey","Ice hockey","Bowling","Paddleball","Squash","Racquetball","Archery","Fishing","Hunting","Sailing","Motor boating","Gymnastics","Golf","Wrestling","Swimming","Jogging / running","Walking","Badminton","Weight lifting","Rollerblading","Roller skating","Ice skating","Volleyball","Water polo","Snorkelling / scuba","Horse riding","Cycling","Skateboarding","Snowboarding"]},{"h":"Games","items":["Pinball","Billiards / pool","Computer / video games","Chess / checkers","Board games","Charades","Table tennis"]},{"h":"Outdoor activities","items":["Climbing / rappelling","Hiking / backpacking","Camping","Canoeing","Kayaking","Outdoor cooking","Bird watching","Animal tracking","Cave exploring","Star gazing","Sightseeing"]},{"h":"Social activities","items":["Dancing (e.g. ballet, tap)","Going to movies","Going to plays","Going to dance performances","Going to parties","Attending lectures","Singing in a group / choir","Playing cards","Clubs (e.g. Rotary)","Informal get-togethers","Member of a place of worship","Going to sporting events","Political group member","Acting / theatre group","Playing in a band"]},{"h":"Nature","items":["Gardening","Plant care / indoor plants","Raising animals","Rock collecting","Shell collecting","Beachcombing","Nature walks"]},{"h":"Crafts / hobbies","items":["Cooking / baking","Pottery / ceramics","Painting / drawing","Photography","Playing / writing music","Writing","Singing","Reading","Going to museums","Model building","Model railways","Sewing / quilting / knitting","Leatherwork","Metalwork","Decoupage","Candle making","Collecting (coins, stamps)","Making recordings","Jewellery making","Sculpting","Welding","Car restoration","Antique restoration","Art / antique collecting","Doll collecting","Film making","Crossword puzzles"]},{"h":"Other activities","items":["Computers / browsing the internet","Meditation / yoga","Watching TV / videos","Listening to music / radio","Volunteering","Travelling","Shopping","Eating out","Flea markets / yard sales","Exercising","Judo / karate"]}] },
      { t: "text", id: "more", label: "Other activities (write your own)", rows: 2 },
      { t: "text", id: "plan", label: "Pick one to try this week — when, where and with whom?", rows: 2 },
    ],
  },
  {
    key: "rp_social", n: 17, kind: "Guide + plan", name: "Social Survival Manual", tiles: tiles(17, "◎", "#4f46e5"),
    short: "Making sober-friendly friends, stepping back from risky ones, and handling weddings, office drinks and more.",
    headline: "Handle friends, family and social life in recovery",
    why: "Old friends, family functions and office parties are where a lot of pressure to drink or use comes from. Knowing how to make new friends, step back from unhealthy ones and handle tricky invitations protects your recovery without cutting you off from people.",
    benefits: ["Practical tips for weddings, parties and office drinks", "Ways to make new, sober-friendly friends", "A plan for the situation coming up for you"],
    forWho: RECOVERY, time: "15 minutes",
    how: [["i", "Read the guide", "Friendships and tricky situations."], ["1", "Your people", "New friends and risky ones."], ["2", "Your plan", "For a situation coming up."]],
    read: { title: "Social Survival Manual", sections: [
      { h: "Making new friends", list: ["There'll be a pull towards old friends who drink or use. New friends take effort, but they protect your recovery", "Reach out first — risk a 'no'", "Suggest something easy: chai or coffee, a walk, a film, watching a match", "Expect some people to say no — that's a normal part of social life, not a rejection of you"] },
      { h: "Stepping back from unhealthy friendships", p: "Ending a close friendship takes courage. But friends who drink or use heavily are unhealthy for you to be around. You may want to explain why — it might even make them think. Plan what you'll say, meet somewhere safe, and expect it to feel like a loss. Get support if it does." },
      { h: "Check your reasons", list: ["Am I showing off that I'm sober and doing well?", "Do I miss the excitement of the old life?", "Am I trying to prove old friends can't influence me?", "Am I hoping they'll share the blame if I slip?"] },
      { h: "A family function or wedding where people will drink", list: ["Consider not going", "If you go, tell the host beforehand that you're not drinking", "Arrive late, leave early", "Take a supportive person with you", "Stay near supportive relatives"] },
      { h: "Colleagues invite you for drinks after work", list: ["Decide in advance what you'll say", "Give a simple reason — family's waiting, other plans. They'll stop asking", "Suggest chai, coffee or dinner instead"] },
      { h: "Your area has bars or sellers nearby", list: ["Move, if that's possible", "If not, build a strong circle of positive people nearby", "If you meet people who use, be polite and move on — don't stop to chat"] },
      { h: "A friend wants your help to quit", list: ["Be clear about what you can and can't do", "Don't let your recovery depend on theirs", "Bring in others to help, to protect yourself"] },
      { h: "Friends who drink socially", list: ["It's okay to ask them not to drink around you", "Suggest plans that don't involve alcohol", "Ask yourself honestly: do we enjoy each other's company without it?"] },
    ] },
    fields: [
      { t: "text", id: "new", label: "Where could you meet new, sober-friendly people?", rows: 2 },
      { t: "text", id: "old", label: "A friendship that may be unhealthy for your recovery — and what you'll do about it", rows: 3 },
      { t: "pick", id: "sit", label: "Which tricky situation is coming up for you?", other: true, options: ["A family function or wedding", "Drinks with colleagues", "Bars or sellers near home", "A friend wants my help to quit", "Friends who drink socially"] },
      { t: "text", id: "plan", label: "Your plan for it", rows: 3 },
    ],
  },
  {
    key: "rp_contacts", n: 18, kind: "Worksheet", name: "Safe and Dangerous Contacts", tiles: tiles(18, "◐", "#0284c7"),
    short: "Two people who could put your sobriety at risk, the situations to watch for, and how you'll cope.",
    headline: "Know who supports your recovery — and who doesn't",
    why: "Some people in our lives support recovery; others — often without meaning to — pull us back. Naming who is risky, in which situations, and planning how you'll cope makes those meetings much safer. Naming your safe people tells you who to lean on.",
    benefits: ["Name the people and moments that raise your risk", "Plan coping steps before you meet them", "Know who your safe, supportive people are"],
    forWho: RECOVERY, time: "10 minutes",
    how: [["1", "Risky contacts", "Two people to be careful with."], ["2", "The situation", "When and where they're risky."], ["3", "Coping plan", "And your safe people."]],
    example: { title: "Example", lines: ["Person: My brother", "Situation: He still drinks heavily and we used to drink together. There's a family function at my parents' this month and I'm worried he'll pressure me.", "1. Tell my family I've stopped drinking.", "2. Tell them in advance I'll only stay a short while.", "3. Keep a soft drink in my hand the whole time.", "4. Take someone supportive along.", "5. If it gets too hard, leave and call my sponsor or therapist."] },
    fields: [
      { t: "group", id: "p", title: "Person", n: 2, fields: [
        { t: "text", id: "who", label: "Who (a first name, or just 'my cousin')", rows: 1 },
        { t: "text", id: "sit", label: "The situation where they put my sobriety at risk", rows: 3 },
        { t: "lines", id: "c", label: "How I'll cope", n: 3 },
      ] },
      { t: "text", id: "safe", label: "My safe people — who supports my recovery?", rows: 2 },
    ],
  },
];

export const RP_LIBRARY = RP_LIST.map((x) => ({ ...x, tag: TAG, pack: "rp", ready: true }));
export const RP_TOOLS = Object.fromEntries(RP_LIBRARY.map((x) => [x.key, x]));

/* Other worksheets drawn by the same PackForm (main library, not the pack). Our own wording. */
export const CORE_BELIEFS = {
  key: "beliefs", name: "Core Beliefs: Examining the Evidence", tag: "CBT", kind: "CBT", ready: true,
  tiles: [["●", "#7c3aed"], ["+", "#16a34a"], ["✕", "#dc2626"], ["~", "#f59e0b"]],
  short: "See how a core belief filters what you notice — what you accept, reject or modify — and find a fairer belief.",
  headline: "Question the belief behind the feeling",
  why: "Core beliefs are our deepest ideas about ourselves, other people and the world — like glasses we see everything through. They don't filter evenly: anything that fits the belief slips in easily and makes it stronger, while anything that doesn't fit is ignored or explained away. Laying all the evidence side by side shows the filter at work, and makes room for a fairer, kinder belief.",
  benefits: ["Name a belief that drives a lot of painful feelings", "Notice the evidence you usually ignore or explain away", "Weigh all of it fairly, side by side", "Arrive at a more balanced belief — and see how much it shifts"],
  forWho: ["Low self-worth", "Anxiety in relationships", "Low mood", "Self-criticism"],
  time: "15–20 minutes — come back and add to it over a week",
  how: [["●", "Name the belief", "A deep idea about yourself, others or the world."], ["+", "Accepted", "What supports it — and you took in."], ["✕", "Rejected or modified", "What doesn't fit — and you pushed away or changed."], ["=", "A fairer belief", "Weigh it all and re-rate the old belief."]],
  read: { title: "How core beliefs filter what we notice", sections: [
    { p: "Core beliefs are our most central ideas about ourselves, other people and the world — for example 'I'm not good enough', 'People can't be trusted' or 'The world is dangerous'. They work like a lens: every experience is seen through them." },
    { p: "Beliefs can change over time, but not evenly. Information that fits the belief is accepted straight away and makes it stronger. Information that doesn't fit is either ignored — it never really sinks in — or twisted with a '…but' until it fits." },
    { h: "In this worksheet you'll sort what happens into three columns", list: ["Accepted — information that supports the belief, which you took in", "Rejected — information that doesn't fit, which you never took in", "Modified — information that doesn't fit, which you changed with a '…but' before taking it in"] },
  ] },
  example: { title: "Example", lines: ["Belief: 'No one likes me.'", "Accepted: My friend didn't answer my call. · The shopkeeper was rude. · My manager criticised my report.", "Rejected: Colleagues invited me to a birthday lunch. · Customers enjoy chatting with me. · A friend checked on me when I was ill.", "Modified: Someone asked me out… but it must have been pity. · My parents and I are close… but parents don't count. · A friend gave me a gift… but only because I gave them one."] },
  fields: [
    { t: "beliefmap", id: "ev", belief: "belief", hint: "Often short and absolute — 'I'm a failure', 'I'm unlovable', 'Nobody can be trusted'.", sides: [
      { title: "Information that supports my core belief", cols: [{ id: "acc", title: "Accepted", sub: "Information I took in as proof of the belief", color: "#16a34a", n: 4 }] },
      { title: "Information that doesn't support my core belief", cols: [
        { id: "rej", title: "Rejected", sub: "Information I didn't take in at all", color: "#dc2626", n: 4 },
        { id: "mod", title: "Modified", sub: "Information I changed (\"…but\") before taking it in", color: "#f59e0b", n: 4 },
      ] },
    ] },
    { t: "scale", id: "before", label: "Before weighing the evidence — how strongly did you believe it?", min: 0, max: 10, low: "Not at all", high: "Completely" },
    { t: "text", id: "balanced", label: "Looking at all three columns together — what's a fairer, more balanced belief?", rows: 3 },
    { t: "scale", id: "after", label: "Now, how strongly do you believe the original belief?", min: 0, max: 10, low: "Not at all", high: "Completely" },
  ],
};
export const PACK_TOOLS = { ...RP_TOOLS, beliefs: CORE_BELIEFS };
export const isPack = (t) => Object.prototype.hasOwnProperty.call(PACK_TOOLS, String(t || ""));

/* ── the form ── */

const has = (v) => (Array.isArray(v) ? v.length > 0 : typeof v === "string" ? v.trim() !== "" : v !== null && v !== undefined);
export const packFilled = (d) => Object.values(withPack(d)).some(has);

function Text({ k, f, d, set, ro }) {
  const v = typeof d[k] === "string" ? d[k] : "";
  return (
    <label className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      {f.hint && <small className="rpk-hint">{f.hint}</small>}
      {(f.rows || 3) > 1
        ? <textarea rows={f.rows || 3} maxLength={1500} disabled={ro} value={v} onChange={(e) => set(k, e.target.value)} />
        : <input type="text" maxLength={300} disabled={ro} value={v} onChange={(e) => set(k, e.target.value)} />}
    </label>
  );
}

function Lines({ k, f, d, set, ro }) {
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      <div className="rpk-lines">
        {Array.from({ length: f.n || 3 }, (_, i) => (
          <label key={i}><b>{i + 1}</b><input type="text" maxLength={300} disabled={ro} value={typeof d[`${k}-${i}`] === "string" ? d[`${k}-${i}`] : ""} onChange={(e) => set(`${k}-${i}`, e.target.value)} /></label>
        ))}
      </div>
    </div>
  );
}

function Pick({ k, f, d, set, ro }) {
  const v = typeof d[k] === "string" ? d[k] : "";
  const opts = f.other ? [...f.options, "Something else"] : f.options;
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      {opts.length > 8 ? (
        <select disabled={ro} value={v} onChange={(e) => set(k, e.target.value)}>
          <option value="">Choose…</option>
          {opts.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <div className="rpk-chips" role="radiogroup" aria-label={f.label}>
          {opts.map((o) => <button key={o} type="button" role="radio" aria-checked={v === o} className={v === o ? "on" : ""} disabled={ro} onClick={() => set(k, v === o ? "" : o)}>{o}</button>)}
        </div>
      )}
      {f.other && v === "Something else" && (
        <input type="text" className="rpk-other" maxLength={300} disabled={ro} placeholder="Write it here" value={typeof d[`${k}-other`] === "string" ? d[`${k}-other`] : ""} onChange={(e) => set(`${k}-other`, e.target.value)} />
      )}
    </div>
  );
}

function Scale({ k, f, d, set, ro }) {
  const v = typeof d[k] === "number" ? d[k] : null;
  const nums = Array.from({ length: f.max - f.min + 1 }, (_, i) => f.min + i);
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      <div className="rpk-scale" role="radiogroup" aria-label={f.label}>
        {nums.map((n) => <button key={n} type="button" role="radio" aria-checked={v === n} className={v === n ? "on" : ""} disabled={ro} onClick={() => set(k, v === n ? null : n)}>{n}</button>)}
      </div>
      <span className="rpk-ends"><i>{f.low}</i><i>{f.high}</i></span>
    </div>
  );
}

function Quiz({ k, f, d, set, ro }) {
  const answered = f.items.filter((_, i) => typeof d[`${k}-${i}`] === "boolean").length;
  const right = f.items.filter((it, i) => d[`${k}-${i}`] === it.a).length;
  return (
    <div className="rpk-f">
      <ol className="rpk-quiz">
        {f.items.map((it, i) => {
          const a = d[`${k}-${i}`];
          const done = typeof a === "boolean";
          return (
            <li key={it.q} className={done ? (a === it.a ? "ok" : "no") : ""}>
              <p>{it.q}</p>
              <div className="rpk-chips">
                {[[true, "True"], [false, "False"]].map(([val, l]) => (
                  <button key={l} type="button" className={a === val ? "on" : ""} disabled={ro} aria-pressed={a === val} onClick={() => set(`${k}-${i}`, a === val ? null : val)}>{l}</button>
                ))}
              </div>
              {done && <div className="rpk-fact"><b>{a === it.a ? "✓ Right" : "Not quite"} — it's {it.a ? "true" : "false"}.</b> {it.why}</div>}
            </li>
          );
        })}
      </ol>
      {answered > 0 && <p className="rpk-score">You got <b>{right} of {answered}</b> right{answered < f.items.length ? ` · ${f.items.length - answered} to go` : ""}.</p>}
    </div>
  );
}

function Agree({ k, f, d, set, ro }) {
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      <ul className="rpk-rows">
        {f.items.map((q, i) => {
          const a = d[`${k}-${i}`];
          return (
            <li key={q}><span>{q}</span>
              <div className="rpk-chips sm">
                {[[true, (f.labels || [])[0] || "True for me"], [false, (f.labels || [])[1] || "Not true"]].map(([val, l]) => <button key={l} type="button" className={a === val ? "on" : ""} disabled={ro} aria-pressed={a === val} onClick={() => set(`${k}-${i}`, a === val ? null : val)}>{l}</button>)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

const R3 = [["y", "Yes"], ["p", "Partly"], ["n", "Not yet"]];
function Rate3({ k, f, d, set, ro }) {
  const count = (x) => f.items.filter((_, i) => d[`${k}-${i}`] === x).length;
  const any = f.items.some((_, i) => typeof d[`${k}-${i}`] === "string" && d[`${k}-${i}`]);
  return (
    <div className="rpk-f">
      <ul className="rpk-rows">
        {f.items.map((q, i) => {
          const a = d[`${k}-${i}`];
          return (
            <li key={q}><span>{q}</span>
              <div className="rpk-chips sm">
                {R3.map(([val, l]) => <button key={val} type="button" className={`${a === val ? "on" : ""} r-${val}`} disabled={ro} aria-pressed={a === val} onClick={() => set(`${k}-${i}`, a === val ? "" : val)}>{l}</button>)}
              </div>
            </li>
          );
        })}
      </ul>
      {any && <p className="rpk-score"><b>{count("y")}</b> strong · <b>{count("p")}</b> partly · <b>{count("n")}</b> not yet</p>}
    </div>
  );
}

function Rate({ k, f, d, set, ro }) {
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      <span className="rpk-ends top"><i>1 = {f.low}</i><i>5 = {f.high}</i></span>
      <ul className="rpk-rows">
        {f.items.map(([name, hint], i) => {
          const a = d[`${k}-${i}`];
          return (
            <li key={name}><span><b>{name}</b><small>{hint}</small></span>
              <div className="rpk-scale sm">
                {[1, 2, 3, 4, 5].map((n) => <button key={n} type="button" className={a === n ? "on" : ""} disabled={ro} aria-pressed={a === n} onClick={() => set(`${k}-${i}`, a === n ? null : n)}>{n}</button>)}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Checks({ k, f, d, set, ro }) {
  const v = Array.isArray(d[k]) ? d[k] : [];
  const toggle = (x) => set(k, v.includes(x) ? v.filter((y) => y !== x) : [...v, x]);
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}{v.length > 0 && <em className="rpk-count">{v.length} ticked</em>}</span>
      {f.groups.map((g, gi) => (
        <div key={g.h || gi} className="rpk-cg">
          {g.h && <h5>{g.h}</h5>}
          <div className="rpk-chips">
            {g.items.map((x) => <button key={x} type="button" className={v.includes(x) ? "on" : ""} disabled={ro} aria-pressed={v.includes(x)} onClick={() => toggle(x)}>{v.includes(x) ? "✓ " : ""}{x}</button>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Cols({ k, f, d, set, ro }) {
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      <div className="rpk-cols">
        {f.cols.map((c) => (
          <div key={c.id} className="rpk-col" style={{ "--c": c.color }}>
            <h5>{c.title}<small>{c.sub}</small></h5>
            {Array.from({ length: c.n || 4 }, (_, i) => {
              const key = `${k}-${c.id}-${i}`;
              return <textarea key={key} rows={2} maxLength={300} disabled={ro} placeholder={i === 0 ? "Write one thing…" : ""} value={typeof d[key] === "string" ? d[key] : ""} onChange={(e) => set(key, e.target.value)} />;
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function YesNo({ k, f, d, set, ro }) {
  return (
    <div className="rpk-f">
      <span className="rpk-l">{f.label}</span>
      {f.groups.map((g, gi) => (
        <div key={g.h} className="rpk-cg">
          <h5>{g.h}</h5>
          <ul className="rpk-rows">
            {g.items.map((q, i) => {
              const key = `${k}-${gi}-${i}`;
              const a = d[key];
              return (
                <li key={q}><span>{q}</span>
                  <div className="rpk-chips sm">
                    {[[true, "Yes"], [false, "No"]].map(([val, l]) => <button key={l} type="button" className={a === val ? "on" : ""} disabled={ro} aria-pressed={a === val} onClick={() => set(key, a === val ? null : val)}>{l}</button>)}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function BeliefMap({ k, f, d, set, ro }) {
  const b = typeof d[f.belief] === "string" ? d[f.belief] : "";
  const col = (c) => (
    <div key={c.id} className="rpk-col" style={{ "--c": c.color }}>
      <h5>{c.title}<small>{c.sub}</small></h5>
      {Array.from({ length: c.n || 4 }, (_, i) => {
        const key = `${k}-${c.id}-${i}`;
        return <textarea key={key} rows={2} maxLength={300} disabled={ro} placeholder={i === 0 ? "Write one thing…" : ""} value={typeof d[key] === "string" ? d[key] : ""} onChange={(e) => set(key, e.target.value)} />;
      })}
    </div>
  );
  return (
    <div className="rpk-f rpk-map">
      <label className="rpk-belief">
        <b>Core belief</b>
        <textarea rows={2} maxLength={300} disabled={ro} value={b} placeholder="e.g. No one likes me." onChange={(e) => set(f.belief, e.target.value)} />
        {f.hint && <small>{f.hint}</small>}
      </label>
      <svg className="rpk-arrows" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden="true">
        <defs><marker id="rpkA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="#475569" /></marker></defs>
        <line x1="50" y1="58" x2="105" y2="4" stroke="#475569" strokeWidth="1.6" markerEnd="url(#rpkA)" vectorEffect="non-scaling-stroke" />
        <polyline points="150,4 150,58" fill="none" stroke="#475569" strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
        <line x1="150" y1="6" x2="166" y2="22" stroke="#475569" strokeWidth="1.6" markerEnd="url(#rpkA)" vectorEffect="non-scaling-stroke" />
        <line x1="250" y1="58" x2="195" y2="4" stroke="#475569" strokeWidth="1.6" markerEnd="url(#rpkA)" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="rpk-sides">
        {f.sides.map((sd) => (
          <section key={sd.title} className={`rpk-side n${sd.cols.length}`}>
            <h4>{sd.title}</h4>
            <div className="rpk-side-cols">{sd.cols.map(col)}</div>
          </section>
        ))}
      </div>
    </div>
  );
}

const FIELD = { beliefmap: BeliefMap, yn: YesNo, cols: Cols, text: Text, lines: Lines, pick: Pick, scale: Scale, tf: Quiz, agree: Agree, rate3: Rate3, rate: Rate, checks: Checks };

function Fields({ fields, p = "", d, set, ro }) {
  return fields.map((f) => {
    const k = p + f.id;
    if (f.t === "group") {
      return Array.from({ length: f.n }, (_, i) => (
        <section key={`${k}-${i}`} className="rpk-card rpk-g">
          <h4><span>{i + 1}</span>{f.title} {i + 1}</h4>
          <Fields fields={f.fields} p={`${k}-${i}-`} d={d} set={set} ro={ro} />
        </section>
      ));
    }
    const C = FIELD[f.t];
    return C ? <C key={k} k={k} f={f} d={d} set={set} ro={ro} /> : null;
  });
}

function Read({ read, startOpen }) {
  const [open, setOpen] = useState(startOpen);
  return (
    <section className="rpk-read">
      <button type="button" className="rpk-read-h" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span aria-hidden="true">📖</span><b>Read first · {read.title}</b><i aria-hidden="true">{open ? "−" : "+"}</i>
      </button>
      {open && (
        <div className="rpk-read-b">
          {read.intro && <p className="rpk-intro">{read.intro}</p>}
          {read.sections.map((s, i) => (
            <div key={s.h || i} className="rpk-sec">
              {s.h && <h4>{s.h}</h4>}
              {s.p && <p>{s.p}</p>}
              {s.list && <ul>{s.list.map((x) => <li key={x}>{x}</li>)}</ul>}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

// one page, saves as you type (the page around it does the saving); `finish` = the Send / privacy block
export function PackForm({ tool, value, onChange, readOnly = false, finish = null }) {
  const def = PACK_TOOLS[tool];
  const d = withPack(value);
  if (!def) return null;
  const set = (k, v) => onChange && onChange({ ...withPack(value), [k]: v });
  // plain fields that follow each other share one card; every group block is its own card
  const chunks = [];
  for (const f of def.fields) {
    if (f.t === "group") chunks.push({ group: f });
    else if (chunks.length && !chunks[chunks.length - 1].group) chunks[chunks.length - 1].fields.push(f);
    else chunks.push({ fields: [f] });
  }
  return (
    <div className="rpk">
      <style>{RPK_CSS}</style>
      {def.read && <Read read={def.read} startOpen={!readOnly && !packFilled(d)} />}
      {def.example && (
        <details className="rpk-ex">
          <summary>See an example</summary>
          <ul>{def.example.lines.map((l) => <li key={l}>{l}</li>)}</ul>
        </details>
      )}
      {chunks.map((c) => (c.group
        ? <Fields key={c.group.id} fields={[c.group]} d={d} set={set} ro={readOnly} />
        : <section key={c.fields[0].id} className="rpk-card"><Fields fields={c.fields} d={d} set={set} ro={readOnly} /></section>))}
      {finish}
    </div>
  );
}

export const RPK_CSS = `
.rpk { display: flex; flex-direction: column; gap: 14px; }
.rpk-card { background: #fff; border-radius: 20px; padding: 18px 18px 6px; box-shadow: 0 1px 2px rgba(0,0,0,.04), 0 10px 26px -18px rgba(15,23,42,.28); }
.rpk-g h4 { display: flex; align-items: center; gap: 10px; margin: 0 0 12px; font-size: 16px; font-weight: 800; color: #0f2a24; }
.rpk-g h4 span { width: 28px; height: 28px; border-radius: 9px; display: grid; place-items: center; background: ${TEAL}; color: #fff; font-size: 14px; }
.rpk-f { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.rpk-l { font-size: 15px; font-weight: 700; color: #1c1c1e; line-height: 1.4; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.rpk-hint { font-size: 12.5px; color: #6b7280; margin-top: -4px; }
.rpk textarea, .rpk input[type="text"], .rpk select { width: 100%; box-sizing: border-box; border: 1px solid #dfe7e4; border-radius: 12px; padding: 10px 12px; font: inherit; font-size: 15px; color: #111827; background: #fbfdfc; resize: vertical; }
.rpk select { height: 44px; padding: 0 12px; }
.rpk textarea:focus, .rpk input[type="text"]:focus, .rpk select:focus { outline: none; border-color: ${TEAL}; box-shadow: 0 0 0 3px rgba(15,118,110,.12); background: #fff; }
.rpk input[disabled] { display: block !important; }
.rpk textarea:disabled, .rpk input:disabled, .rpk select:disabled { background: #f7f9f8; color: #1f2937; -webkit-text-fill-color: #1f2937; opacity: 1; }
.rpk-lines { display: flex; flex-direction: column; gap: 8px; }
.rpk-lines label { display: flex; align-items: center; gap: 10px; }
.rpk-lines b { flex: none; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; background: #e6f4f1; color: ${TEAL}; font-size: 13px; }
.rpk-other { margin-top: 2px; }
.rpk-chips { display: flex; flex-wrap: wrap; gap: 7px; }
.rpk-chips button, .rpk-scale button { border: 1px solid #d6e4df; background: #fff; color: #1f2937; border-radius: 999px; padding: 8px 13px; font: inherit; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background .15s, color .15s, border-color .15s; }
.rpk-chips button:hover:not(:disabled), .rpk-scale button:hover:not(:disabled) { border-color: ${TEAL}; }
.rpk-chips button.on, .rpk-scale button.on { background: ${TEAL}; border-color: ${TEAL}; color: #fff; }
.rpk-chips button.on.r-p { background: #d97706; border-color: #d97706; }
.rpk-chips button.on.r-n { background: #64748b; border-color: #64748b; }
.rpk-chips button:disabled, .rpk-scale button:disabled { cursor: default; }
.rpk-chips.sm button { padding: 6px 11px; font-size: 12.5px; }
.rpk-scale { display: flex; flex-wrap: wrap; gap: 6px; }
.rpk-scale button { width: 42px; height: 42px; padding: 0; border-radius: 12px; }
.rpk-scale.sm button { width: 36px; height: 36px; border-radius: 10px; }
.rpk-ends { display: flex; justify-content: space-between; font-size: 12px; color: #6b7280; }
.rpk-ends i { font-style: normal; }
.rpk-ends.top { justify-content: flex-start; gap: 16px; margin-top: -4px; }
.rpk-rows { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.rpk-rows li { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 10px 0; border-top: 1px solid #eef2f0; }
.rpk-rows li:first-child { border-top: 0; }
.rpk-rows li > span { flex: 1; min-width: 0; font-size: 14.5px; color: #1f2937; line-height: 1.45; display: flex; flex-direction: column; }
.rpk-rows li > span small { font-size: 12.5px; color: #6b7280; }
.rpk-rows li > div { flex: none; }
.rpk-quiz { margin: 0; padding: 0; list-style: none; counter-reset: q; display: flex; flex-direction: column; gap: 12px; }
.rpk-quiz li { counter-increment: q; border: 1px solid #e5ece9; border-radius: 16px; padding: 14px; }
.rpk-quiz li.ok { border-color: #a7e3c4; background: #f4fbf7; }
.rpk-quiz li.no { border-color: #f6d6a8; background: #fffaf2; }
.rpk-quiz p { margin: 0 0 10px; font-size: 15px; font-weight: 700; color: #1c1c1e; }
.rpk-quiz p::before { content: counter(q) ". "; color: ${TEAL}; }
.rpk-fact { margin-top: 10px; font-size: 14px; line-height: 1.5; color: #334155; }
.rpk-score { margin: 4px 0 0; font-size: 14px; color: #0f2a24; }
.rpk-count { font-style: normal; font-size: 12px; font-weight: 800; color: ${TEAL}; background: #e6f4f1; border-radius: 999px; padding: 2px 8px; }
.rpk-cg { margin-top: 6px; }
.rpk-cg h5 { margin: 6px 0 8px; font-size: 12px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #64748b; }
.rpk-cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.rpk-col { border-radius: 16px; padding: 12px; background: color-mix(in srgb, var(--c) 7%, #fff); border: 1px solid color-mix(in srgb, var(--c) 28%, #fff); display: flex; flex-direction: column; gap: 8px; }
.rpk-col h5 { margin: 0 0 2px; font-size: 15px; font-weight: 800; color: var(--c); display: flex; flex-direction: column; }
.rpk-col textarea { resize: none; min-height: 0; }
.rpk-col h5 small { font-size: 12px; font-weight: 600; color: #6b7280; }
@media (max-width: 760px) { .rpk-cols { grid-template-columns: minmax(0, 1fr); } }
.rpk-map { gap: 0; }
.rpk-belief { display: flex; flex-direction: column; gap: 6px; width: min(560px, 100%); margin: 0 auto; border: 2px solid #1c1c1e; border-radius: 18px; padding: 12px 14px; background: #fff; }
.rpk-belief b { font-size: 14px; font-weight: 800; color: #1c1c1e; }
.rpk-belief textarea { border: 0 !important; background: transparent !important; box-shadow: none !important; text-align: center; font-size: 19px !important; font-weight: 600; resize: none; padding: 4px !important; }
.rpk-belief small { font-size: 12px; color: #6b7280; text-align: center; }
.rpk-arrows { display: block; width: 100%; height: 56px; }
.rpk-sides { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 2fr); gap: 12px; }
.rpk-side { border: 2px solid #1c1c1e; border-radius: 18px; overflow: hidden; background: #fff; display: flex; flex-direction: column; }
.rpk-side h4 { margin: 0; padding: 10px 12px; text-align: center; font-size: 14px; font-weight: 800; color: #1c1c1e; border-bottom: 2px solid #1c1c1e; }
.rpk-side-cols { display: grid; grid-template-columns: repeat(var(--n, 1), minmax(0, 1fr)); flex: 1; }
.rpk-side.n2 .rpk-side-cols { --n: 2; }
.rpk-side .rpk-col { border: 0; border-radius: 0; }
.rpk-side.n2 .rpk-col + .rpk-col { border-left: 2px solid #1c1c1e; }
@media (max-width: 760px) {
  .rpk-arrows { display: none; }
  .rpk-belief { margin-bottom: 12px; }
  .rpk-sides { grid-template-columns: minmax(0, 1fr); }
  .rpk-side.n2 .rpk-side-cols { --n: 1; }
  .rpk-side.n2 .rpk-col + .rpk-col { border-left: 0; border-top: 2px solid #1c1c1e; }
}
.rpk-read { background: #f0faf8; border: 1px solid #cdebe5; border-radius: 20px; overflow: hidden; }
.rpk-read-h { width: 100%; display: flex; align-items: center; gap: 12px; padding: 14px 16px; border: 0; background: none; font: inherit; text-align: left; cursor: pointer; color: #0f2a24; }
.rpk-read-h > span { flex: none; width: 38px; height: 38px; border-radius: 12px; display: grid; place-items: center; background: #d5f0ea; font-size: 19px; }
.rpk-read-h b { flex: 1; font-size: 15.5px; }
.rpk-read-h i { font-style: normal; font-size: 22px; font-weight: 700; color: ${TEAL}; }
.rpk-read-b { padding: 0 18px 16px; }
.rpk-intro { margin: 0 0 10px; font-size: 14.5px; color: #3f5f57; font-style: italic; }
.rpk-sec { margin-top: 12px; }
.rpk-sec h4 { margin: 0 0 6px; font-size: 14.5px; font-weight: 800; color: #0f2a24; }
.rpk-sec p { margin: 0; font-size: 14.5px; line-height: 1.6; color: #334155; }
.rpk-sec ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 4px; }
.rpk-sec li { font-size: 14.5px; line-height: 1.5; color: #334155; }
.rpk-ex { background: #fffbeb; border: 1px solid #fde7b0; border-radius: 16px; padding: 12px 16px; }
.rpk-ex summary { cursor: pointer; font-weight: 800; color: #92400e; font-size: 14.5px; }
.rpk-ex ul { margin: 10px 0 2px; padding-left: 18px; display: flex; flex-direction: column; gap: 4px; }
.rpk-ex li { font-size: 14px; line-height: 1.5; color: #57400f; }
@media (max-width: 640px) {
  .rpk-card { padding: 16px 14px 4px; border-radius: 18px; }
  .rpk-rows li { flex-direction: column; align-items: flex-start; gap: 8px; }
  .rpk-scale:not(.sm) { flex-wrap: nowrap; gap: 4px; }
  .rpk-scale:not(.sm) button { flex: 1 1 0; width: auto; min-width: 0; height: 40px; border-radius: 10px; font-size: 13px; }
}
`;
