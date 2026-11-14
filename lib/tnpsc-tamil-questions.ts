import { randomUUID } from "node:crypto"
import type { DifficultyLevel, QuizQuestion } from "@/lib/questions"

const pastQuestions: Omit<QuizQuestion, "id" | "difficulty">[] = [
  {
    prompt: "‘உள்ளங்கை நெல்லிக்கனி போல’ என்ற உவமைத் தொடர் உணர்த்தும் பொருள் யாது?",
    options: ["நிலைத்து நிற்பது", "வெளிப்படைத் தன்மை", "மிகுதியான அழகு", "அடைய அரிதானது"],
    answer: "வெளிப்படைத் தன்மை",
    explanation: "உள்ளங்கையில் உள்ள நெல்லிக்கனி தெளிவாகத் தெரிவதைப் போல, வெளிப்படையாக இருப்பதைக் குறிக்கிறது.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q1",
  },
  {
    prompt: "‘சிலை மேல் எழுத்து போல’ என்ற உவமைத் தொடர் உணர்த்தும் பொருள் யாது?",
    options: ["எளிதில் மறைவது", "நிலைத்து நிற்பது", "மிகவும் பழமையானது", "தெளிவற்றது"],
    answer: "நிலைத்து நிற்பது",
    explanation: "சிலையில் பொறிக்கப்பட்ட எழுத்து நீடித்து நிற்பதை இந்த உவமை குறிக்கிறது.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q2",
  },
  {
    prompt: "‘ஒயிலாட்டத்தில் இரு வரிசையில் நின்று ஆடுகின்றனர்’ என்ற தொடரைச் செயப்பாட்டு வினையாக மாற்றுக.",
    options: [
      "ஒயிலாட்டத்தில் இரு வரிசையில் நின்று ஆடப்படுகின்றனர்.",
      "ஒயிலாட்டம் இரு வரிசையில் நின்று ஆடப்படுகிறது.",
      "ஒயிலாட்டம் இரு வரிசையில் நின்று ஆடுகிறார்கள்.",
      "ஒயிலாட்டத்தில் இரு வரிசையில் நின்று ஆடப்படுகிறது.",
    ],
    answer: "ஒயிலாட்டம் இரு வரிசையில் நின்று ஆடப்படுகிறது.",
    explanation: "செயப்பாட்டு வினையில் செயல் பெறுபொருள் எழுவாயாக அமையும்.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q3",
  },
  {
    prompt: "‘சாலச் சிறந்தது’ என்னும் தொடரின் இலக்கண வகை யாது?",
    options: ["பெயர்ச்சொல் தொடர்", "வினைமுற்றுத் தொடர்", "உரிச்சொல் தொடர்", "வேற்றுமைத் தொடர்"],
    answer: "உரிச்சொல் தொடர்",
    explanation: "‘சால’ என்பது மிகுதியைக் குறிக்கும் உரிச்சொல்.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q5",
  },
  {
    prompt: "‘கேள்’ என்னும் வேர்ச்சொல்லின் வினையெச்சம் யாது?",
    options: ["கேட்ட", "கேட்டு", "கேட்பான்", "கேள்வி"],
    answer: "கேட்டு",
    explanation: "‘கேள்’ என்னும் வினையின் வினையெச்ச வடிவம் ‘கேட்டு’.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q8",
  },
  {
    prompt: "‘தணிந்தது’ என்னும் சொல்லின் வேர்ச்சொல் எது?",
    options: ["தண்", "தணிவு", "தணி", "தணிந்த"],
    answer: "தணி",
    explanation: "‘தணிந்தது’ என்பதன் வேர்ச்சொல் ‘தணி’.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q9",
  },
  {
    prompt: "‘பரவை’ என்னும் சொல்லின் பொருள் யாது?",
    options: ["மலை", "கடல்", "காடு", "வானம்"],
    answer: "கடல்",
    explanation: "‘பரவை’ என்பது கடலைக் குறிக்கும் தமிழ்ச் சொல்.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q13",
  },
  {
    prompt: "‘Gold Biscuit’ என்பதற்கான நேரான தமிழ்ச் சொல் யாது?",
    options: ["வைரக்கட்டி", "தங்கக்கட்டி", "வெள்ளிக்காசு", "செப்புத்தகடு"],
    answer: "தங்கக்கட்டி",
    explanation: "‘Gold Biscuit’ என்பதற்கான நேரான தமிழாக்கம் ‘தங்கக்கட்டி’.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q14",
  },
  {
    prompt: "திருக்குறள் முதன்முதலில் அச்சிடப்பட்ட ஆண்டு எது?",
    options: ["1792", "1812", "1835", "1856"],
    answer: "1812",
    explanation: "திருக்குறள் முதன்முதலில் 1812ஆம் ஆண்டு அச்சிடப்பட்டது.",
    sourceCategory: "TNPSC Group IV 2022 · General Tamil · Q86",
  },
  {
    prompt: "‘இணையில்லை முப்பாலுக்கு இந்நிலத்தே’ என்ற வரியை இயற்றியவர் யார்?",
    options: ["பாரதியார்", "பாரதிதாசன்", "கவிமணி", "நாமக்கல் கவிஞர்"],
    answer: "பாரதிதாசன்",
    explanation: "திருக்குறளைப் போற்றிப் பாரதிதாசன் இயற்றிய வரி இது.",
    sourceCategory: "TNPSC previous-year General Tamil",
  },
]

function shuffle<T>(items: T[]) {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index--) {
    const other = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[other]] = [result[other], result[index]]
  }
  return result
}

export function makeTnpscTamilQuestions(difficulty: DifficultyLevel) {
  return shuffle(pastQuestions).slice(0, 5).map((question) => ({
    ...question,
    id: randomUUID(),
    options: shuffle(question.options),
    difficulty,
  })) satisfies QuizQuestion[]
}
