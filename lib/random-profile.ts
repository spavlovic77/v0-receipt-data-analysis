"use server"

export async function generateRandomProfile() {
  const firstNames = [
    "Peter",
    "Ján",
    "Martin",
    "Tomáš",
    "Marek",
    "Michal",
    "Lukáš",
    "Andrej",
    "Jakub",
    "Matej",
    "Anna",
    "Mária",
    "Eva",
    "Lucia",
    "Katarína",
    "Zuzana",
    "Petra",
    "Monika",
    "Jana",
    "Veronika",
  ]

  const surnames = [
    "Novák",
    "Kováč",
    "Horváth",
    "Varga",
    "Tóth",
    "Nagy",
    "Lukáč",
    "Baláž",
    "Molnár",
    "Szabó",
    "Kiss",
    "Bodnár",
    "Takács",
    "Farkaš",
    "Oláh",
    "Papp",
    "Simon",
    "Kálmán",
    "Rác",
    "Gál",
  ]

  const name = firstNames[Math.floor(Math.random() * firstNames.length)]
  const surname = surnames[Math.floor(Math.random() * surnames.length)]

  // Generate random birth number (rodné číslo) format: YYMMDD/XXXX
  const year = Math.floor(Math.random() * 50) + 50 // 50-99 (1950-1999)
  const month = Math.floor(Math.random() * 12) + 1 // 1-12
  const day = Math.floor(Math.random() * 28) + 1 // 1-28
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0")

  const birthNumber = `${year.toString().padStart(2, "0")}${month.toString().padStart(2, "0")}${day.toString().padStart(2, "0")}/${suffix}`

  return {
    name,
    surname,
    birth_number: birthNumber,
  }
}
