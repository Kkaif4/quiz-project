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
  themeIcon?: string;
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
    themeIcon: "/theme-best-friends.svg",
    colorClass: "bg-[var(--accent-rose)]/15 text-[var(--accent-rose)] border border-[var(--accent-rose)]/30",
    borderClass: "border-[var(--accent-rose)]/30 hover:border-[var(--accent-rose)]/60",
    questions: [
      {
        id: "q_1",
        text: "What is my absolute favorite comfort food or late-night craving?",
        type: "single",
        options: [
          { id: "o_1", text: "Freshly baked cheesy pizza" },
          { id: "o_2", text: "Spicy ramen with all toppings" },
          { id: "o_3", text: "Smash burger and seasoned fries" },
          { id: "o_4", text: "Boba milk tea or artisanal ice cream" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "What am I most likely doing on a lazy Sunday afternoon?",
        type: "single",
        options: [
          { id: "o_1", text: "Binge-watching a brand new series in bed" },
          { id: "o_2", text: "Endlessly scrolling TikTok and sending reels" },
          { id: "o_3", text: "Gaming with friends while blasting music" },
          { id: "o_4", text: "Spontaneously suggesting a random road trip" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "If I get suddenly stressed or overwhelmed, how do I react first?",
        type: "single",
        options: [
          { id: "o_1", text: "Go completely quiet and need alone time" },
          { id: "o_2", text: "Rant in rapid-fire voice notes to my bestie" },
          { id: "o_3", text: "Take an immediate three-hour nap" },
          { id: "o_4", text: "Impulse online shopping or snack binging" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_4",
        text: "What is my biggest pet peeve that instantly ruins my mood?",
        type: "single",
        options: [
          { id: "o_1", text: "People talking over me or interrupting" },
          { id: "o_2", text: "Slow walking crowds or laggy WiFi" },
          { id: "o_3", text: "Being left on read or delivered for hours" },
          { id: "o_4", text: "Loud chewing or bad restaurant etiquette" },
        ],
        correctOptionId: "o_3",
      },
      {
        id: "q_5",
        text: "Which music vibe dominates my daily headphones playlist?",
        type: "single",
        options: [
          { id: "o_1", text: "Top chart pop anthems & upbeat hits" },
          { id: "o_2", text: "Moody indie, lofi & acoustic tracks" },
          { id: "o_3", text: "High-energy hip-hop and trap beats" },
          { id: "o_4", text: "Nostalgic 2000s throwbacks & rock" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_6",
        text: "If we unexpectedly won a million dollars tomorrow, what is my first move?",
        type: "single",
        options: [
          { id: "o_1", text: "Book first-class flights for an unforgettable world tour" },
          { id: "o_2", text: "Buy a dream apartment and spoil friends and family" },
          { id: "o_3", text: "Invest quietly and pretend nothing happened" },
          { id: "o_4", text: "Spend half of it in the first 48 hours on gear & clothes" },
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
    themeIcon: "/theme-warm-memories.svg",
    colorClass: "bg-[var(--accent-lavender)]/15 text-[var(--accent-plum)] border border-[var(--accent-lavender)]/30",
    borderClass: "border-[var(--accent-lavender)]/30 hover:border-[var(--accent-lavender)]/60",
    questions: [
      {
        id: "q_1",
        text: "What is the first thing that usually catches my attention about someone?",
        type: "single",
        options: [
          { id: "o_1", text: "A warm genuine smile and laughing eyes" },
          { id: "o_2", text: "Quick wit, playful banter, and humor" },
          { id: "o_3", text: "Effortless aesthetic style and confidence" },
          { id: "o_4", text: "Unprompted kindness to everyone around them" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "What would be my ideal first date atmosphere?",
        type: "single",
        options: [
          { id: "o_1", text: "Cozy hidden coffee spot with deep conversation" },
          { id: "o_2", text: "Late night walk with street food under city lights" },
          { id: "o_3", text: "Fun competitive arcade or bowling match" },
          { id: "o_4", text: "Sunset picnic with music and good snacks" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_3",
        text: "How do I naturally act when I secretly have feelings for someone?",
        type: "single",
        options: [
          { id: "o_1", text: "Laugh a little too hard at everything they say" },
          { id: "o_2", text: "Get uncharacteristically shy and flustered" },
          { id: "o_3", text: "Act playful and tease them constantly" },
          { id: "o_4", text: "Try to act extra cool and unbothered" },
        ],
        correctOptionId: "o_3",
      },
      {
        id: "q_4",
        text: "What is my favorite way to receive genuine appreciation?",
        type: "single",
        options: [
          { id: "o_1", text: "Thoughtful little surprise gifts or their favorite snack" },
          { id: "o_2", text: "Meaningful heartfelt messages and sincere compliments" },
          { id: "o_3", text: "Undivided attention and quality uninterrupted time" },
          { id: "o_4", text: "Warm comforting hugs and physical closeness" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_5",
        text: "Which sweet treat is guaranteed to win my heart anytime?",
        type: "single",
        options: [
          { id: "o_1", text: "Rich warm fudge brownie with ice cream" },
          { id: "o_2", text: "Iced caramel macchiato or brown sugar boba" },
          { id: "o_3", text: "Chewy freshly baked chocolate chip cookies" },
          { id: "o_4", text: "Sour fruity gummies or tangy candy" },
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
    themeIcon: "/theme-daily-chaos.svg",
    colorClass: "bg-[var(--accent-champagne)]/25 text-[#8A5B17] dark:text-[#E6C88A] border border-[var(--accent-champagne)]/40",
    borderClass: "border-[var(--accent-champagne)]/40 hover:border-[var(--accent-champagne)]/70",
    questions: [
      {
        id: "q_1",
        text: "What is my most notorious habit around the house?",
        type: "single",
        options: [
          { id: "o_1", text: "Leaving half-finished water cups everywhere" },
          { id: "o_2", text: "Sneaking bites of communal food without confession" },
          { id: "o_3", text: "Playing music without headphones at midnight" },
          { id: "o_4", text: "Taking 40-minute boiling hot showers" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_2",
        text: "When the sink is filled with dirty dishes, who tackles them first?",
        type: "single",
        options: [
          { id: "o_1", text: "Me, but while sighing theatrically the entire time" },
          { id: "o_2", text: "Whoever literally runs out of clean spoons" },
          { id: "o_3", text: "Nobody, we declare them 'soaking' indefinitely" },
          { id: "o_4", text: "We order takeout to avoid using more plates" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "What is our undisputed go-to midnight snack run?",
        type: "single",
        options: [
          { id: "o_1", text: "Drive-thru burgers and nuggets at 1:30 AM" },
          { id: "o_2", text: "Extra spicy instant noodles with cheese & egg" },
          { id: "o_3", text: "Delivery pizza with extra dipping sauces" },
          { id: "o_4", text: "Random concoction made from leftover fridge scraps" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_4",
        text: "If someone unexpectedly knocks on the door, what is my immediate reaction?",
        type: "single",
        options: [
          { id: "o_1", text: "Freeze in absolute silence and pretend nobody is home" },
          { id: "o_2", text: "Push someone else to look through the peephole" },
          { id: "o_3", text: "Swing it open without hesitation" },
          { id: "o_4", text: "Assume it's an emergency or package delivery" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_5",
        text: "What is my ideal thermostat / room temperature setting?",
        type: "single",
        options: [
          { id: "o_1", text: "Arctic freezer mode with the AC blasting full throttle" },
          { id: "o_2", text: "Warm and cozy tropical greenhouse" },
          { id: "o_3", text: "Balanced mild room temperature (around 21°C / 70°F)" },
          { id: "o_4", text: "Doesn't matter as long as I have two heavy blankets" },
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
    themeIcon: "/theme-favorites.svg",
    colorClass: "bg-[var(--accent-sage)]/15 text-[var(--accent-sage)] border border-[var(--accent-sage)]/30",
    borderClass: "border-[var(--accent-sage)]/30 hover:border-[var(--accent-sage)]/60",
    questions: [
      {
        id: "q_1",
        text: "What was my ultimate favorite cartoon or kids show back in the day?",
        type: "single",
        options: [
          { id: "o_1", text: "Ben 10 / Pokemon / Dragon Ball" },
          { id: "o_2", text: "SpongeBob SquarePants" },
          { id: "o_3", text: "Disney Channel / Nickelodeon live-action sitcoms" },
          { id: "o_4", text: "Classic Tom & Jerry / Looney Tunes" },
        ],
        correctOptionId: "o_2",
      },
      {
        id: "q_2",
        text: "What was my dream career when I was around 8 years old?",
        type: "single",
        options: [
          { id: "o_1", text: "Astronaut or space explorer" },
          { id: "o_2", text: "Famous athlete or superstar soccer player" },
          { id: "o_3", text: "YouTuber, actor or rock band singer" },
          { id: "o_4", text: "Inventor, scientist, or doctor" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_3",
        text: "Which playground game did we play until we were completely exhausted?",
        type: "single",
        options: [
          { id: "o_1", text: "Tag, freeze tag, or intense hide-and-seek" },
          { id: "o_2", text: "The Floor is Lava across all playground equipment" },
          { id: "o_3", text: "Competitive dodgeball or 4-square" },
          { id: "o_4", text: "Trading card battles (Pokemon, Beyblade, etc.)" },
        ],
        correctOptionId: "o_1",
      },
      {
        id: "q_4",
        text: "What was my quintessential after-school snack?",
        type: "single",
        options: [
          { id: "o_1", text: "Crispy potato chips or spicy cheese puffs" },
          { id: "o_2", text: "Popsicles or juice freeze pops" },
          { id: "o_3", text: "Chocolate cookies dunked in cold milk" },
          { id: "o_4", text: "Quick grilled cheese sandwich or instant noodles" },
        ],
        correctOptionId: "o_3",
      },
      {
        id: "q_5",
        text: "What kind of childhood mischief was I most likely caught doing?",
        type: "single",
        options: [
          { id: "o_1", text: "Accidentally breaking a household item while playing indoors" },
          { id: "o_2", text: "Sneaking outside to play without parent permission" },
          { id: "o_3", text: "Secretly staying awake past bedtime reading or playing" },
          { id: "o_4", text: "Pulling a goofy prank on siblings or friends" },
        ],
        correctOptionId: "o_3",
      },
    ],
  },
];

export function getTemplateById(id: string): QuizTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
