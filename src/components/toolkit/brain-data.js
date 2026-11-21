/* Brain Explorer — content for therapists (psychoeducation with clients). 2026-11-21.
   Written in our own words from standard neuroscience; general education, not diagnosis.
   Each part: where it is, what it does, what changes in common difficulties, a plain line to say to a
   client, and how therapy works with it. Clinical wording needs a psychologist's sign-off before going live.
   `group` drives the colour; `pos` is a rough spot on the 3D model (x: left/right, y: up/down, z: front/back). */

export const BRAIN_GROUPS = {
  cortex: { label: "Cerebral cortex (lobes)", color: "#3b82f6" },
  limbic: { label: "Emotion & memory (limbic system)", color: "#e5532a" },
  deep: { label: "Deep relay & reward centres", color: "#a855f7" },
  regulate: { label: "Body regulation & hormones", color: "#e0a92a" },
  hind: { label: "Brainstem & cerebellum", color: "#16a34a" },
  link: { label: "Connections", color: "#0ea5e9" },
};

export const BRAIN_PARTS = [
  {
    id: "prefrontal", name: "Prefrontal cortex", group: "cortex", color: "#4f7cff", pos: [0, 0.35, 1.05],
    where: "The very front of the brain, just behind the forehead.",
    does: [
      "Planning, decision-making and solving problems",
      "Holding attention and working memory (keeping things 'in mind')",
      "Calming emotional reactions — the brain's 'brake' on the amygdala",
      "Self-control, weighing consequences, and thinking about ourselves and others",
    ],
    mind: [
      "Under high stress it works less well, so thinking clearly, focusing and planning feel harder",
      "Depression is linked with lower activity here — hard to start tasks, low motivation, slowed thinking",
      "ADHD is associated with differences in prefrontal networks that manage attention and impulses",
      "It keeps maturing into the mid-20s, which is one reason teenagers act more on impulse",
    ],
    say: "This is your brain's 'wise manager'. When you're very stressed it goes a bit offline — that's why it's hard to think straight in a panic. Calming the body brings it back.",
    therapy: "CBT, problem-solving, mindfulness and naming emotions ('affect labelling') all exercise this area and strengthen its calming link to the amygdala.",
  },
  {
    id: "frontal", name: "Frontal lobe (incl. motor areas)", group: "cortex", color: "#38b6f0", pos: [0, 0.75, 0.6],
    where: "The large front part of each hemisphere, from the forehead back to the top of the head.",
    does: [
      "Voluntary movement (the motor cortex at its back edge)",
      "Speech production (Broca's area, usually on the left side)",
      "Personality, judgement and social behaviour",
    ],
    mind: [
      "Injury here can change personality, judgement and impulse control",
      "Fatigue and burnout often show up first as 'executive' problems — organising, prioritising, finishing tasks",
    ],
    say: "The front of your brain is where you plan, choose and act — it gets tired like a muscle, so rest really does help it work.",
    therapy: "Breaking tasks into small steps, routines and behavioural activation reduce the load on frontal 'executive' systems.",
  },
  {
    id: "parietal", name: "Parietal lobe", group: "cortex", color: "#f5a524", pos: [0, 1.0, -0.35],
    where: "The top and upper back of the brain, behind the frontal lobe.",
    does: [
      "Processing touch, pressure, temperature and pain (somatosensory cortex)",
      "Sense of where the body is in space",
      "Numbers, reading maps, and combining information from different senses",
    ],
    mind: [
      "Body-focused anxiety can make normal sensations feel louder and more alarming",
      "Dissociation can involve changes in how the body and surroundings are sensed",
    ],
    say: "This part maps your body and the space around you. When we're anxious it can turn the volume up on ordinary body feelings.",
    therapy: "Grounding (5-4-3-2-1), body scans and interoceptive exposure help the brain re-read body signals as safe.",
  },
  {
    id: "temporal", name: "Temporal lobe", group: "cortex", color: "#f0776c", pos: [0.95, -0.05, 0.25],
    where: "On each side of the brain, behind the temples and above the ears.",
    does: [
      "Hearing and understanding sounds",
      "Understanding language (Wernicke's area, usually on the left)",
      "Recognising faces and objects; holds the hippocampus and amygdala on its inner side",
    ],
    mind: [
      "Closely tied to memory and emotion because the hippocampus and amygdala sit inside it",
      "Hearing voices (in psychosis) is linked with unusual activity in auditory and language areas",
    ],
    say: "This side part helps you hear, understand words and recognise people — and it sits right next to your memory and emotion centres.",
    therapy: "Talking therapy itself works through these language areas — putting feelings into words helps the brain process them.",
  },
  {
    id: "occipital", name: "Occipital lobe", group: "cortex", color: "#9b7bf7", pos: [0, 0.35, -1.1],
    where: "The back of the head.",
    does: ["Seeing — processing shape, colour, movement and depth", "Turning what the eyes receive into images we recognise"],
    mind: [
      "Vivid visual flashbacks and nightmares after trauma involve visual areas along with memory and fear centres",
      "Migraines with visual aura start in this region",
    ],
    say: "This is your brain's 'screen' at the back of the head — it builds the pictures you see, including in memories and dreams.",
    therapy: "Imagery-based work (imagery rescripting, safe-place imagery, EMDR) uses the brain's visual system to change how memories feel.",
  },
  {
    id: "insula", name: "Insula", group: "cortex", color: "#14b8a6", pos: [0.7, 0.15, 0.25],
    where: "Folded deep inside the brain, beneath the frontal and temporal lobes on each side.",
    does: [
      "Reading signals from inside the body — heartbeat, breathing, hunger, nausea (interoception)",
      "Turning body signals into feelings, such as disgust or unease",
      "Empathy — sensing what others feel",
    ],
    mind: [
      "Often more active in anxiety and panic, making the heart or breath feel alarming",
      "Involved in cravings in addiction",
      "Linked to body awareness difficulties in eating disorders",
    ],
    say: "The insula listens to your body from the inside. In anxiety it can be oversensitive, so a fast heartbeat feels like danger even when you're safe.",
    therapy: "Slow breathing, mindfulness and interoceptive exposure teach the insula that body sensations can be noticed without fear.",
  },
  {
    id: "cingulate", name: "Anterior cingulate cortex", group: "cortex", color: "#6d8cff", pos: [0, 0.55, 0.55],
    where: "A curved band in the middle of the brain, wrapped around the front of the corpus callosum.",
    does: [
      "Noticing mistakes and conflict ('something's not right')",
      "Linking emotion with attention and motivation",
      "Feeling the emotional side of pain — including social pain like rejection",
    ],
    mind: [
      "Overactive 'error alarm' is linked with OCD and constant worry",
      "Plays a role in depression and in how much physical or emotional pain bothers us",
    ],
    say: "This part is like a smoke alarm for mistakes. In OCD or worry it can go off too easily — the alarm isn't proof that something is wrong.",
    therapy: "ERP for OCD and acceptance-based approaches teach the brain to let the alarm ring without acting on it, so it quietens over time.",
  },
  {
    id: "amygdala", name: "Amygdala", group: "limbic", pos: [0.55, -0.2, 0.35], small: true,
    where: "Two almond-shaped clusters deep in the temporal lobes, one on each side.",
    does: [
      "Detecting threat and setting off the fight–flight–freeze response, in a fraction of a second",
      "Giving emotional weight to memories, so important or scary events are remembered strongly",
      "Reading facial expressions, especially fear and anger",
    ],
    mind: [
      "Often over-reactive in anxiety disorders, panic and PTSD — it 'sees' danger too quickly",
      "Can react before the thinking brain has caught up, which is why fear can feel automatic",
      "Long-term stress can make it more sensitive",
    ],
    say: "Your amygdala is a smoke detector. Its job is to keep you safe, but after stress or trauma it can go off for burnt toast, not just real fires.",
    therapy: "Exposure, trauma-focused therapy, slow breathing and a strong prefrontal 'brake' help the amygdala learn that a situation is safe.",
  },
  {
    id: "hippocampus", name: "Hippocampus", group: "limbic", pos: [0.5, -0.25, -0.05], small: true,
    where: "A curved, seahorse-shaped structure inside each temporal lobe, behind the amygdala.",
    does: [
      "Turning daily experiences into long-term memories",
      "Putting memories in context — when and where something happened",
      "Learning and finding our way around (spatial memory)",
    ],
    mind: [
      "Long-term stress hormones can affect it; it is often found smaller in chronic depression and PTSD",
      "In trauma, memories may be stored without a clear 'that was then' time-stamp, so they feel like they're happening now",
      "It is one of the few brain areas that keeps forming new neurons — exercise and sleep support it",
    ],
    say: "This is your memory librarian. It files experiences with a date and place. After trauma some memories get filed without a date, so they feel like now.",
    therapy: "Trauma-focused CBT and EMDR help 'date-stamp' memories; sleep, exercise and treating depression support hippocampal health.",
  },
  {
    id: "hypothalamus", name: "Hypothalamus", group: "regulate", pos: [0, -0.3, 0.3], small: true,
    where: "A small area at the base of the brain, just above the pituitary gland.",
    does: [
      "Keeping the body in balance — temperature, hunger, thirst, sleep–wake rhythm",
      "Starting the stress hormone chain (the HPA axis: hypothalamus → pituitary → adrenal glands → cortisol)",
      "Linking emotions with body reactions",
    ],
    mind: [
      "Chronic stress keeps the HPA axis switched on, with effects on sleep, appetite, energy and mood",
      "Changes in appetite and sleep in depression are partly linked to this system",
    ],
    say: "This is your body's thermostat and stress switch. When stress doesn't let up, it keeps cortisol flowing, which is why sleep and appetite change.",
    therapy: "Regular sleep and meals, exercise, relaxation and reducing ongoing stressors all help the stress system reset.",
  },
  {
    id: "pituitary", name: "Pituitary gland", group: "regulate", pos: [0, -0.55, 0.4], small: true,
    where: "A pea-sized gland hanging below the hypothalamus.",
    does: ["The 'master gland' — releases hormones that control the thyroid, adrenals, growth and reproductive organs"],
    mind: ["Part of the stress (HPA) chain", "Thyroid and other hormone problems can look like depression or anxiety, so medical checks matter"],
    say: "A tiny gland that tells the rest of your body's hormone system what to do — including how much stress hormone to release.",
    therapy: "When mood symptoms could be hormonal (thyroid, postpartum, menopause), a medical check-up sits alongside therapy.",
  },
  {
    id: "thalamus", name: "Thalamus", group: "deep", pos: [0, 0.05, 0.0], small: true,
    where: "Two egg-shaped structures right in the centre of the brain.",
    does: [
      "A relay station — almost all senses (except smell) pass through it on the way to the cortex",
      "Filters what reaches our attention",
      "Helps regulate sleep, alertness and consciousness",
    ],
    mind: ["Linked to sensory overload and sleep problems", "Involved in how pain signals are passed on"],
    say: "Think of it as the brain's post office — it sorts incoming signals and decides what gets sent up for attention.",
    therapy: "Reducing sensory load, sleep routines and attention training can help when everything feels too loud or too much.",
  },
  {
    id: "basal", name: "Basal ganglia & reward circuit", group: "deep", pos: [0.35, 0.1, 0.3],
    where: "A group of structures deep in the brain around the thalamus (including the striatum and nucleus accumbens).",
    does: [
      "Starting and smoothing movement",
      "Forming habits and routines",
      "Reward and motivation — dopamine signals here make us want and repeat things",
    ],
    mind: [
      "Addiction hijacks this reward system, making cravings strong and habits hard to break",
      "Low reward response is linked with loss of pleasure (anhedonia) in depression",
      "Involved in OCD and tics (repetitive loops), and in Parkinson's disease",
    ],
    say: "This is your brain's habit and reward engine. It learns what feels good and makes us repeat it — which helps with good habits and also traps us in unhelpful ones.",
    therapy: "Behavioural activation rebuilds reward from small activities; habit reversal and relapse-prevention work with these habit loops.",
  },
  {
    id: "callosum", name: "Corpus callosum", group: "link", pos: [0, 0.35, 0.1],
    where: "A thick band of nerve fibres joining the left and right halves of the brain.",
    does: ["Lets the two hemispheres share information and work together"],
    mind: ["Brain-imaging studies have found differences in it in some developmental conditions and after early-life stress"],
    say: "The bridge between the left and right sides of your brain, so they can work as a team.",
    therapy: "Mostly background knowledge for the therapist; useful when explaining that the brain works as connected networks, not separate boxes.",
  },
  {
    id: "cerebellum", name: "Cerebellum", group: "hind", pos: [0, -0.6, -0.85],
    where: "The 'little brain' at the back, under the occipital lobe.",
    does: ["Balance, posture and coordination", "Fine-tuning movement and timing", "Also helps with some thinking, attention and emotional regulation"],
    mind: ["Increasingly linked with attention, emotion regulation and some developmental conditions such as autism"],
    say: "This back part keeps you balanced and smooth in your movements — and it turns out it helps with timing your thoughts and feelings too.",
    therapy: "Movement, rhythm and coordination activities (yoga, dance, walking) can be calming partly through this system.",
  },
  {
    id: "brainstem", name: "Brainstem", group: "hind", pos: [0, -0.85, -0.25],
    where: "The stalk at the base of the brain that connects to the spinal cord (midbrain, pons, medulla).",
    does: [
      "Keeps us alive automatically — breathing, heart rate, blood pressure",
      "Sleep and wakefulness, alertness",
      "Survival reflexes, including the freeze or shutdown response",
    ],
    mind: [
      "The body's survival responses (racing heart, fast breathing, freezing) run through here",
      "Feeling numb or 'shut down' under overwhelming threat involves these survival circuits",
    ],
    say: "This is the oldest, most automatic part of your brain. It runs your heartbeat and breathing, and it can push the body into survival mode without asking you first.",
    therapy: "Slow, long exhales and gentle body-based (somatic) work reach these automatic systems directly and signal safety.",
  },
];
