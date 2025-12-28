// Generate random Slovak profile data
export async function generateRandomProfile() {
  const firstNames = [
    "Ján",
    "Peter",
    "Martin",
    "Tomáš",
    "Michal",
    "Juraj",
    "Ľuboš",
    "Vladimír",
    "Mária",
    "Anna",
    "Lucia",
    "Zuzana",
    "Katarína",
    "Eva",
    "Jana",
    "Petra",
  ]

  const lastNames = [
    "Novák",
    "Horváth",
    "Varga",
    "Tóth",
    "Nagy",
    "Kováč",
    "Molnár",
    "Szabó",
    "Balog",
    "Kiss",
    "Németh",
    "Farkas",
    "Balogh",
    "Papp",
    "Takács",
    "Juhász",
  ]

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
  const fullName = `${firstName} ${lastName}`

  // Generate random phone number (Slovak format)
  const phone = `+421 ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)} ${Math.floor(Math.random() * 900 + 100)}`

  // Generate random birth date (between 1960 and 2005)
  const year = Math.floor(Math.random() * 45) + 1960
  const month = Math.floor(Math.random() * 12) + 1
  const day = Math.floor(Math.random() * 28) + 1
  const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  return { fullName, phone, birthDate }
}
