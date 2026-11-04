export interface QuizTemplateOption {
  id: string;
  text: string;
}

export interface QuizTemplateQuestion {
  id: string;
  text: string;
  type: "single";
  options: QuizTemplateOption[];
  correctOptionId: string;
}

export interface QuizTemplate {
  id: string;
  title: string;
  badge: string;
  description: string;
  iconName: "HeartHandshake" | "Flame" | "Sparkles" | "Compass";
  colorClass: string;
  borderClass: string;
  questions: QuizTemplateQuestion[];
}

export const TEMPLATES: QuizTemplate[] = [
  {
    id: "best-friends",
    title: "Best Friends Test",
    badge: "Most Popular",
    description: "Find out which friend actually remembers your quirks, cravings, and habits.",
    iconName: "HeartHandshake",
    colorClass: "bg-pink-500/15 text-pink-400 border border-pink-500/30",
    borderClass: "border-pink-500/30 hover:border-pink-500/60",
    questions: [
      {
        id: "q_1",
        text: "What is my favourite Indian snack?",
        type: "single",
        options: [
          { id: "o_1", text: "Samosa" },
          { id: "o_2", text: "Vada Pav" },
          { id: "o_3", text: "Pani Puri" },
          { id: "o_4", text: "Maggi" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "What am I most likely doing on a Sunday?",
        type: "single",
        options: [
          { id: "o_1", text: "Sleeping till late" },
          { id: "o_2", text: "Watching Netflix/YouTube" },
          { id: "o_3", text: "Going out with friends" },
          { id: "o_4", text: "Playing games" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "What do I usually do when I am upset?",
        type: "single",
        options: [
          { id: "o_1", text: "Stop talking to everyone" },
          { id: "o_2", text: "Call my best friend" },
          { id: "o_3", text: "Listen to music" },
          { id: "o_4", text: "Sleep" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_4",
        text: "Which drink would I choose first?",
        type: "single",
        options: [
          { id: "o_1", text: "Chai" },
          { id: "o_2", text: "Cold coffee" },
          { id: "o_3", text: "Coca-Cola" },
          { id: "o_4", text: "Mango juice" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_5",
        text: "What annoys me the most?",
        type: "single",
        options: [
          { id: "o_1", text: "Being left on seen" },
          { id: "o_2", text: "Slow internet" },
          { id: "o_3", text: "Someone cancelling plans" },
          { id: "o_4", text: "Getting ignored" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_6",
        text: "What kind of videos do I watch the most?",
        type: "single",
        options: [
          { id: "o_1", text: "Memes" },
          { id: "o_2", text: "Gaming" },
          { id: "o_3", text: "Cricket" },
          { id: "o_4", text: "Reels" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_7",
        text: "If I suddenly got ₹10,000, what would I do first?",
        type: "single",
        options: [
          { id: "o_1", text: "Buy clothes" },
          { id: "o_2", text: "Buy a new phone/gadget" },
          { id: "o_3", text: "Go out with friends" },
          { id: "o_4", text: "Save it" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_8",
        text: "Where would I rather hang out with friends?",
        type: "single",
        options: [
          { id: "o_1", text: "Café" },
          { id: "o_2", text: "Mall" },
          { id: "o_3", text: "Street food place" },
          { id: "o_4", text: "Someone's home" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_9",
        text: "What am I most likely to say when making plans?",
        type: "single",
        options: [
          { id: "o_1", text: "\"Let's go!\"" },
          { id: "o_2", text: "\"I'll see.\"" },
          { id: "o_3", text: "\"Maybe later.\"" },
          { id: "o_4", text: "\"You guys decide.\"" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_10",
        text: "How long can I stay without checking my phone?",
        type: "single",
        options: [
          { id: "o_1", text: "5 minutes" },
          { id: "o_2", text: "30 minutes" },
          { id: "o_3", text: "2 hours" },
          { id: "o_4", text: "Almost the whole day" },
        ],
        correctOptionId: "o_1",
      },
    ],
  },
  {
    id: "crush-admirer",
    title: "Crush & Secret Admirer",
    badge: "Vibe Check",
    description: "Deep questions to see who pays attention to the little things you do.",
    iconName: "Sparkles",
    colorClass: "bg-purple-500/15 text-purple-400 border border-purple-500/30",
    borderClass: "border-purple-500/30 hover:border-purple-500/60",
    questions: [
      {
        id: "q_1",
        text: "What would impress me the most?",
        type: "single",
        options: [
          { id: "o_1", text: "Good sense of humour" },
          { id: "o_2", text: "Good looks" },
          { id: "o_3", text: "Kindness" },
          { id: "o_4", text: "Confidence" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "What would be my ideal first date?",
        type: "single",
        options: [
          { id: "o_1", text: "Café" },
          { id: "o_2", text: "Street food + walk" },
          { id: "o_3", text: "Movie" },
          { id: "o_4", text: "Long drive" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "How would I act around my crush?",
        type: "single",
        options: [
          { id: "o_1", text: "Act normal" },
          { id: "o_2", text: "Become shy" },
          { id: "o_3", text: "Tease them" },
          { id: "o_4", text: "Talk too much" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_4",
        text: "What message from my crush would make me happiest?",
        type: "single",
        options: [
          { id: "o_1", text: "\"I miss you.\"" },
          { id: "o_2", text: "\"You look good today.\"" },
          { id: "o_3", text: "\"Can we talk?\"" },
          { id: "o_4", text: "\"I was thinking about you.\"" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_5",
        text: "What would I notice first about someone?",
        type: "single",
        options: [
          { id: "o_1", text: "Smile" },
          { id: "o_2", text: "Eyes" },
          { id: "o_3", text: "Voice" },
          { id: "o_4", text: "Personality" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_6",
        text: "What is my biggest green flag?",
        type: "single",
        options: [
          { id: "o_1", text: "Good listener" },
          { id: "o_2", text: "Funny" },
          { id: "o_3", text: "Caring" },
          { id: "o_4", text: "Respectful" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_7",
        text: "Where would I most likely text my crush?",
        type: "single",
        options: [
          { id: "o_1", text: "WhatsApp" },
          { id: "o_2", text: "Instagram" },
          { id: "o_3", text: "Snapchat" },
          { id: "o_4", text: "I would not text first 😭" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_8",
        text: "If my crush takes hours to reply, what would I do?",
        type: "single",
        options: [
          { id: "o_1", text: "Wait patiently" },
          { id: "o_2", text: "Check their last seen" },
          { id: "o_3", text: "Overthink everything" },
          { id: "o_4", text: "Send another message" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_9",
        text: "What kind of compliment would I like most?",
        type: "single",
        options: [
          { id: "o_1", text: "\"You're cute.\"" },
          { id: "o_2", text: "\"You're really funny.\"" },
          { id: "o_3", text: "\"I like talking to you.\"" },
          { id: "o_4", text: "\"You're different from others.\"" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_10",
        text: "If my crush asked me to hang out tomorrow, I would...",
        type: "single",
        options: [
          { id: "o_1", text: "Say yes immediately" },
          { id: "o_2", text: "Pretend to be busy" },
          { id: "o_3", text: "Ask my friends what to do" },
          { id: "o_4", text: "Panic and overthink 😂" },
        ],
        correctOptionId: "o_1",
      },
    ],
  },
  {
    id: "roommate-chaos",
    title: "Roommate Chaos",
    badge: "Chaos Level 100",
    description: "Hilarious household habits, unwashed dishes, and 2 AM kitchen raids.",
    iconName: "Flame",
    colorClass: "bg-violet-500/15 text-violet-400 border border-violet-500/30",
    borderClass: "border-violet-500/30 hover:border-violet-500/60",
    questions: [
      {
        id: "q_1",
        text: "What is my most common hostel/room habit?",
        type: "single",
        options: [
          { id: "o_1", text: "Leaving clothes everywhere" },
          { id: "o_2", text: "Keeping my bed messy" },
          { id: "o_3", text: "Forgetting to switch off lights" },
          { id: "o_4", text: "Leaving empty bottles around" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "Who usually cleans the room?",
        type: "single",
        options: [
          { id: "o_1", text: "Me" },
          { id: "o_2", text: "My roommate" },
          { id: "o_3", text: "Both of us" },
          { id: "o_4", text: "Nobody 💀" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "What would I eat at 1 AM?",
        type: "single",
        options: [
          { id: "o_1", text: "Maggi" },
          { id: "o_2", text: "Biscuits" },
          { id: "o_3", text: "Chips" },
          { id: "o_4", text: "Order food online" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_4",
        text: "What happens when my roommate's food arrives?",
        type: "single",
        options: [
          { id: "o_1", text: "I ask for a bite" },
          { id: "o_2", text: "I secretly take some" },
          { id: "o_3", text: "I don't touch it" },
          { id: "o_4", text: "I ask, \"Bhai, share karega?\"" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_5",
        text: "What would wake me up in the morning?",
        type: "single",
        options: [
          { id: "o_1", text: "Alarm" },
          { id: "o_2", text: "Roommate" },
          { id: "o_3", text: "Phone call from home" },
          { id: "o_4", text: "Nothing 😂" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_6",
        text: "What is most likely to start a fight between roommates?",
        type: "single",
        options: [
          { id: "o_1", text: "Loud music" },
          { id: "o_2", text: "Food" },
          { id: "o_3", text: "AC/fan" },
          { id: "o_4", text: "Cleaning" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_7",
        text: "What do I do when my roommate says, \"Let's study\"?",
        type: "single",
        options: [
          { id: "o_1", text: "Start studying" },
          { id: "o_2", text: "Study for 10 minutes" },
          { id: "o_3", text: "Start talking" },
          { id: "o_4", text: "Open Instagram" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_8",
        text: "What would I order when we are too lazy to cook?",
        type: "single",
        options: [
          { id: "o_1", text: "Biryani" },
          { id: "o_2", text: "Pizza" },
          { id: "o_3", text: "Momos" },
          { id: "o_4", text: "Burger" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_9",
        text: "If someone knocks on our room door late at night, I would...",
        type: "single",
        options: [
          { id: "o_1", text: "Open the door" },
          { id: "o_2", text: "Ask \"Kaun hai?\"" },
          { id: "o_3", text: "Pretend we're sleeping" },
          { id: "o_4", text: "Make my roommate open it" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_10",
        text: "What is our most common room conversation?",
        type: "single",
        options: [
          { id: "o_1", text: "College" },
          { id: "o_2", text: "Food" },
          { id: "o_3", text: "Relationships" },
          { id: "o_4", text: "\"Bhai, kal se pakka padhai.\" 😂" },
        ],
        correctOptionId: "o_1",
      },
    ],
  },
  {
    id: "childhood-nostalgia",
    title: "Childhood Nostalgia",
    badge: "Core Memories",
    description: "Test who has known you long enough to remember your wild playground days.",
    iconName: "Compass",
    colorClass: "bg-indigo-500/15 text-indigo-400 border border-indigo-500/30",
    borderClass: "border-indigo-500/30 hover:border-indigo-500/60",
    questions: [
      {
        id: "q_1",
        text: "Which cartoon did I watch the most as a kid?",
        type: "single",
        options: [
          { id: "o_1", text: "Doraemon" },
          { id: "o_2", text: "Shinchan" },
          { id: "o_3", text: "Chhota Bheem" },
          { id: "o_4", text: "Tom & Jerry" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "What was my favourite childhood snack?",
        type: "single",
        options: [
          { id: "o_1", text: "Parle-G" },
          { id: "o_2", text: "Kurkure" },
          { id: "o_3", text: "Maggi" },
          { id: "o_4", text: "Hide & Seek" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "Which game did I play the most with friends?",
        type: "single",
        options: [
          { id: "o_1", text: "Cricket" },
          { id: "o_2", text: "Hide and Seek" },
          { id: "o_3", text: "Lagori" },
          { id: "o_4", text: "Kabaddi" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_4",
        text: "What did I do when my parents said \"Go study\"?",
        type: "single",
        options: [
          { id: "o_1", text: "Actually studied" },
          { id: "o_2", text: "Opened the book and watched TV later" },
          { id: "o_3", text: "Pretended to study" },
          { id: "o_4", text: "Started cleaning my room" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_5",
        text: "Which childhood TV show would I wait for?",
        type: "single",
        options: [
          { id: "o_1", text: "Taarak Mehta Ka Ooltah Chashmah" },
          { id: "o_2", text: "CID" },
          { id: "o_3", text: "WWE" },
          { id: "o_4", text: "Cartoon Network shows" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_6",
        text: "What was my favourite school-day treat?",
        type: "single",
        options: [
          { id: "o_1", text: "₹5 chocolate" },
          { id: "o_2", text: "Ice cream" },
          { id: "o_3", text: "Vadapav" },
          { id: "o_4", text: "School canteen Maggi" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_7",
        text: "What did I usually do during summer vacation?",
        type: "single",
        options: [
          { id: "o_1", text: "Visit relatives" },
          { id: "o_2", text: "Play outside" },
          { id: "o_3", text: "Play video games" },
          { id: "o_4", text: "Watch cartoons all day" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_8",
        text: "Which school excuse did I use the most?",
        type: "single",
        options: [
          { id: "o_1", text: "\"I forgot my homework.\"" },
          { id: "o_2", text: "\"I left my notebook at home.\"" },
          { id: "o_3", text: "\"I didn't know there was a test.\"" },
          { id: "o_4", text: "\"Sir/Ma'am, my pen stopped working.\"" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_9",
        text: "What was I most scared of as a child?",
        type: "single",
        options: [
          { id: "o_1", text: "Getting scolded by parents" },
          { id: "o_2", text: "Getting low marks" },
          { id: "o_3", text: "Ghosts" },
          { id: "o_4", text: "Going to the doctor" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_10",
        text: "What did I dream of becoming as a child?",
        type: "single",
        options: [
          { id: "o_1", text: "Cricketer" },
          { id: "o_2", text: "Doctor" },
          { id: "o_3", text: "Police officer" },
          { id: "o_4", text: "Astronaut" },
        ],
        correctOptionId: "o_1",
      },
    ],
  },
];

export function getTemplateById(id: string): QuizTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
