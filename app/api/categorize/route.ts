import type { NextRequest } from "next/server"
import { generateObject } from "ai"
import { z } from "zod"
import type { ReceiptItem, CategorizedItem, CategoryCode, SectorCode } from "@/lib/types"
import { getCategoryByCode, getSectorByCode } from "@/lib/types"

const validCategories = [
  "FOOD_DAIRY",
  "FOOD_MEAT",
  "FOOD_BAKERY",
  "FOOD_FRUITS_VEG",
  "FOOD_FROZEN",
  "FOOD_CANNED",
  "FOOD_SNACKS",
  "FOOD_SWEETS",
  "FOOD_SPICES",
  "FOOD_OILS",
  "FOOD_PASTA_RICE",
  "FOOD_BREAKFAST",
  "FOOD_BABY",
  "FOOD_OTHER",
  "BEV_SOFT_DRINKS",
  "BEV_WATER",
  "BEV_JUICE",
  "BEV_COFFEE_TEA",
  "BEV_BEER",
  "BEV_WINE",
  "BEV_SPIRITS",
  "BEV_ENERGY",
  "BEV_OTHER",
  "PERS_HAIR",
  "PERS_SKIN",
  "PERS_ORAL",
  "PERS_BODY",
  "PERS_COSMETICS",
  "PERS_PERFUME",
  "PERS_HYGIENE",
  "PERS_OTHER",
  "HOME_CLEANING",
  "HOME_LAUNDRY",
  "HOME_KITCHEN",
  "HOME_STORAGE",
  "HOME_DECOR",
  "HOME_GARDEN",
  "HOME_PET",
  "HOME_OTHER",
  "FASH_CLOTHING",
  "FASH_FOOTWEAR",
  "FASH_ACCESSORIES",
  "FASH_UNDERWEAR",
  "FASH_SPORTS",
  "FASH_KIDS",
  "FASH_OTHER",
  "ELEC_PHONES",
  "ELEC_COMPUTERS",
  "ELEC_ACCESSORIES",
  "ELEC_AUDIO",
  "ELEC_BATTERIES",
  "ELEC_OTHER",
  "SERV_RESTAURANT",
  "SERV_CAFE",
  "SERV_TAKEAWAY",
  "SERV_PHOTO",
  "SERV_REPAIR",
  "SERV_OTHER",
  "AUTO_FUEL",
  "AUTO_PARTS",
  "AUTO_ACCESSORIES",
  "AUTO_CARE",
  "AUTO_OTHER",
  "HEALTH_PHARMACY",
  "HEALTH_VITAMINS",
  "HEALTH_MEDICAL",
  "HEALTH_OPTICAL",
  "HEALTH_OTHER",
  "LEIS_TOYS",
  "LEIS_BOOKS",
  "LEIS_SPORTS",
  "LEIS_MUSIC",
  "LEIS_HOBBY",
  "LEIS_OTHER",
  "OTHER_DEPOSIT",
  "OTHER_PACKAGING",
  "OTHER_UNKNOWN",
] as const

const categorizationSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      category: z.string(), // Accept any string, validate later
      confidence: z.number().min(0).max(1),
    }),
  ),
})

const BRAND_DATABASE: Record<string, CategoryCode> = {
  // Perfumes & Cosmetics
  beckham: "PERS_PERFUME",
  "david beckham": "PERS_PERFUME",
  "la rive": "PERS_PERFUME",
  delia: "PERS_COSMETICS",
  hismile: "PERS_ORAL",
  nivea: "PERS_SKIN",
  dove: "PERS_BODY",
  loreal: "PERS_HAIR",
  "l'oreal": "PERS_HAIR",
  schwarzkopf: "PERS_HAIR",
  palette: "PERS_HAIR",
  garnier: "PERS_HAIR",
  pantene: "PERS_HAIR",
  head: "PERS_HAIR",
  syoss: "PERS_HAIR",
  colgate: "PERS_ORAL",
  signal: "PERS_ORAL",
  sensodyne: "PERS_ORAL",
  lacalut: "PERS_ORAL",
  meridol: "PERS_ORAL",
  elmex: "PERS_ORAL",
  "fa ": "PERS_BODY",
  rexona: "PERS_HYGIENE",
  adidas: "PERS_PERFUME",
  "bruno banani": "PERS_PERFUME",
  playboy: "PERS_PERFUME",
  str8: "PERS_PERFUME",
  axe: "PERS_HYGIENE",

  // Cleaning
  domestos: "HOME_CLEANING",
  ajax: "HOME_CLEANING",
  cif: "HOME_CLEANING",
  vanish: "HOME_LAUNDRY",
  cillit: "HOME_CLEANING",
  bref: "HOME_CLEANING",
  "wc net": "HOME_CLEANING",
  persil: "HOME_LAUNDRY",
  ariel: "HOME_LAUNDRY",
  tide: "HOME_LAUNDRY",
  silan: "HOME_LAUNDRY",
  lenor: "HOME_LAUNDRY",
  jar: "HOME_KITCHEN",
  fairy: "HOME_KITCHEN",
  pur: "HOME_KITCHEN",

  // Beverages
  coca: "BEV_SOFT_DRINKS",
  cola: "BEV_SOFT_DRINKS",
  pepsi: "BEV_SOFT_DRINKS",
  fanta: "BEV_SOFT_DRINKS",
  sprite: "BEV_SOFT_DRINKS",
  "7up": "BEV_SOFT_DRINKS",
  kofola: "BEV_SOFT_DRINKS",
  vinea: "BEV_SOFT_DRINKS",
  mirinda: "BEV_SOFT_DRINKS",
  corgon: "BEV_BEER",
  "zlatý bažant": "BEV_BEER",
  "zlaty bazant": "BEV_BEER",
  šariš: "BEV_BEER",
  saris: "BEV_BEER",
  urpiner: "BEV_BEER",
  heineken: "BEV_BEER",
  budvar: "BEV_BEER",
  pilsner: "BEV_BEER",
  kozel: "BEV_BEER",
  staropramen: "BEV_BEER",
  radegast: "BEV_BEER",
  redbull: "BEV_ENERGY",
  "red bull": "BEV_ENERGY",
  monster: "BEV_ENERGY",
  burn: "BEV_ENERGY",
  hell: "BEV_ENERGY",
  semtex: "BEV_ENERGY",
  mattoni: "BEV_WATER",
  bonaqua: "BEV_WATER",
  rajec: "BEV_WATER",
  budiš: "BEV_WATER",
  budis: "BEV_WATER",
  "dobrá voda": "BEV_WATER",
  nescafe: "BEV_COFFEE_TEA",
  nespresso: "BEV_COFFEE_TEA",
  jacobs: "BEV_COFFEE_TEA",
  tchibo: "BEV_COFFEE_TEA",
  lavazza: "BEV_COFFEE_TEA",
  lipton: "BEV_COFFEE_TEA",
  pickwick: "BEV_COFFEE_TEA",

  // Food brands
  pringles: "FOOD_SNACKS",
  pringels: "FOOD_SNACKS",
  lays: "FOOD_SNACKS",
  "lay's": "FOOD_SNACKS",
  cheetos: "FOOD_SNACKS",
  doritos: "FOOD_SNACKS",
  bohemia: "FOOD_SNACKS",
  slovakia: "FOOD_SNACKS",
  lentilky: "FOOD_SWEETS",
  milka: "FOOD_SWEETS",
  oreo: "FOOD_SWEETS",
  kinder: "FOOD_SWEETS",
  merci: "FOOD_SWEETS",
  raffaello: "FOOD_SWEETS",
  ferrero: "FOOD_SWEETS",
  lindt: "FOOD_SWEETS",
  toblerone: "FOOD_SWEETS",
  haribo: "FOOD_SWEETS",
  mentos: "FOOD_SWEETS",
  "tic tac": "FOOD_SWEETS",
  nestle: "FOOD_SWEETS",
  rajo: "FOOD_DAIRY",
  danone: "FOOD_DAIRY",
  activia: "FOOD_DAIRY",
  actimel: "FOOD_DAIRY",
  müller: "FOOD_DAIRY",
  zott: "FOOD_DAIRY",
  president: "FOOD_DAIRY",
  lactofree: "FOOD_DAIRY",
  nutella: "FOOD_SWEETS",
  barilla: "FOOD_PASTA_RICE",
  knorr: "FOOD_SPICES",
  maggi: "FOOD_SPICES",
  vegeta: "FOOD_SPICES",
  hellmann: "FOOD_SPICES",
  heinz: "FOOD_CANNED",
  bonduelle: "FOOD_CANNED",
  hamé: "FOOD_CANNED",
  hame: "FOOD_CANNED",

  // Baby
  canpol: "FOOD_BABY",
  pampers: "FOOD_BABY",
  huggies: "FOOD_BABY",
  hipp: "FOOD_BABY",
  nutrilon: "FOOD_BABY",
  bebivita: "FOOD_BABY",

  // Pharmacy
  magnosolv: "HEALTH_PHARMACY",
  paralen: "HEALTH_PHARMACY",
  ibalgin: "HEALTH_PHARMACY",
  brufen: "HEALTH_PHARMACY",
  voltaren: "HEALTH_PHARMACY",
  aspirin: "HEALTH_PHARMACY",
  sumamed: "HEALTH_PHARMACY",
  olynth: "HEALTH_PHARMACY",
  mucosolvan: "HEALTH_PHARMACY",
  centrum: "HEALTH_VITAMINS",

  // Services
  focaccia: "SERV_CAFE",
  espresso: "SERV_CAFE",
  cappuccino: "SERV_CAFE",
  latte: "SERV_CAFE",
  americano: "SERV_CAFE",
  "flat white": "SERV_CAFE",
  croissant: "SERV_CAFE",

  // Fashion prefixes
  "vk ": "FASH_CLOTHING",
  "vk ponožky": "FASH_UNDERWEAR",
}

const KEYWORD_PATTERNS: Array<{ pattern: RegExp; category: CategoryCode; confidence: number }> = [
  // FOOD - Dairy (mliečne výrobky)
  {
    pattern:
      /tvaroh|mlieko|maslo|syr|jogurt|smotana|kefír|brynza|parenica|oštiepok|niva|eidam|gouda|mozzarella|cottage|acidko|kys.*smot|sladká.*smot|šľahač/i,
    category: "FOOD_DAIRY",
    confidence: 0.95,
  },
  // FOOD - Meat (mäso)
  {
    pattern:
      /kur[aíi]|brav|hov|mäs|maso|steak|rezn|šunk|klobás|párky|salám|slanin|špek|paštét|jaternic|krvavnič|údeni|grilov|gril/i,
    category: "FOOD_MEAT",
    confidence: 0.95,
  },
  // FOOD - Bakery (pekárenské)
  {
    pattern:
      /chlieb|rohlík|rožok|bageta|croissant|žemľa|pečivo|koláč|buchta|závin|vianočk|mazanec|pagáč|lúpač|grahamov/i,
    category: "FOOD_BAKERY",
    confidence: 0.95,
  },
  // FOOD - Fruits & Vegetables (ovocie a zelenina)
  {
    pattern:
      /jablk|hrušk|banán|pomaranč|citrón|jahod|čerešn|višň|broskyň|marhul|slivk|hrozn|malín|čučoried|zelenin|mrkv|uhor|paprik|rajč|cibuľ|cesnak|zeler|kapust|karfiol|brokolica|šalát|špenát|petržlen|reďkov/i,
    category: "FOOD_FRUITS_VEG",
    confidence: 0.95,
  },
  // FOOD - Frozen (mrazené)
  { pattern: /mrazen|zmrzlin|frozen|ice.*cream|nanuk|mraz|hlboko/i, category: "FOOD_FROZEN", confidence: 0.9 },
  // FOOD - Canned (konzervy)
  {
    pattern: /konzerv|tuniak|fazuľ|hrášok|kukuric|šošovic|paradaj.*pretlak|kečup|horčic/i,
    category: "FOOD_CANNED",
    confidence: 0.9,
  },
  // FOOD - Snacks (snacky)
  {
    pattern: /chips|lupienk|tyčink|krekr|oriešk|arašíd|snack|chrumk|slané|pečivo|praženič|slaninov|syrový/i,
    category: "FOOD_SNACKS",
    confidence: 0.9,
  },
  // FOOD - Sweets (sladkosti)
  {
    pattern: /čokolád|bonbón|cukrík|sušienk|keks|torta|zákus|cukrov|karamel|gumov|želé|pralink|oplatk|wafer|oblátk/i,
    category: "FOOD_SWEETS",
    confidence: 0.9,
  },
  // FOOD - Spices (koreniny)
  {
    pattern:
      /soľ|koreni|paprik|oregano|bazalk|majorán|tymian|škorica|muškát|kari|curry|kmín|rasca|bobkov|čierne.*koreni/i,
    category: "FOOD_SPICES",
    confidence: 0.9,
  },
  // FOOD - Oils (oleje)
  { pattern: /olej|olivov|slnečnic|repkov|masť|sadlo|margarín/i, category: "FOOD_OILS", confidence: 0.9 },
  // FOOD - Pasta & Rice (cestoviny a ryža)
  {
    pattern: /cestovin|špaget|makaron|penne|fusilli|tagliatell|ryža|bulgur|quinoa|múka|krupic|pohánk|ovsené|vločk/i,
    category: "FOOD_PASTA_RICE",
    confidence: 0.9,
  },
  // FOOD - Breakfast (raňajky)
  { pattern: /cereáli|müsli|corn.*flakes|raňajk|granola|ovos|kaš/i, category: "FOOD_BREAKFAST", confidence: 0.9 },
  // FOOD - Baby (detská výživa)
  { pattern: /dojčen|detsk.*výživ|príkrm|kašičk|plien|bábätk|dojča|kojen/i, category: "FOOD_BABY", confidence: 0.95 },

  // BEVERAGES
  { pattern: /limonád|tonik|schweppes|ginger|tonic|soda|nealko/i, category: "BEV_SOFT_DRINKS", confidence: 0.95 },
  { pattern: /voda|minerál|perlivá|neperlivá|aqua|prameň|studnič/i, category: "BEV_WATER", confidence: 0.95 },
  {
    pattern: /džús|juice|nektár|smoothie|ovocn.*nápoj|mušt|jablkov|pomarančov/i,
    category: "BEV_JUICE",
    confidence: 0.9,
  },
  { pattern: /káva|coffee|čaj|tea|kakao|brew|presso|lungo/i, category: "BEV_COFFEE_TEA", confidence: 0.9 },
  {
    pattern: /pivo|beer|ležiak|radler|pšeničn|nefiltrovan|lager|ale |ipa |%.*piv/i,
    category: "BEV_BEER",
    confidence: 0.95,
  },
  {
    pattern: /víno|wine|prosecco|šampan|sekt|cabernet|merlot|chardonnay|riesling|rulandsk|frankovk|veltlín/i,
    category: "BEV_WINE",
    confidence: 0.95,
  },
  {
    pattern: /whisky|vodka|rum|gin|brandy|likér|slivovic|borovičk|hruškovica|marhuľovic|koňak|cognac|absinth/i,
    category: "BEV_SPIRITS",
    confidence: 0.95,
  },
  { pattern: /energy|energetick|power|boost|guarana/i, category: "BEV_ENERGY", confidence: 0.95 },

  // PERSONAL CARE
  {
    pattern:
      /šampón|vlasov|kondicionér|farb.*vlas|vlas.*farb|icc|color|balzam.*vlas|maska.*vlas|olej.*vlas|lak.*vlas|gél.*vlas|tužidlo|styling/i,
    category: "PERS_HAIR",
    confidence: 0.95,
  },
  {
    pattern: /krém|pleťov|sérum|opaľovac|telov.*mliek|hydratač|výživ|anti.*age|denný|nočný|očný|make.*up.*odlič/i,
    category: "PERS_SKIN",
    confidence: 0.95,
  },
  { pattern: /zubn|pasta|ústn|voda|kefk|medzizubn|nitk|bielenie.*zub/i, category: "PERS_ORAL", confidence: 0.95 },
  {
    pattern: /sprchov|gél|mydlo|pena.*kúpeľ|tekuté.*mydl|antibakteriál|dezinfek.*ruk/i,
    category: "PERS_BODY",
    confidence: 0.95,
  },
  {
    pattern:
      /makeup|make.*up|rúž|mascara|očn.*tien|púder|mejkap|rtěnk|lesk.*pery|korektor|make-up|základ|primer|bronzer|riasenk/i,
    category: "PERS_COSMETICS",
    confidence: 0.95,
  },
  { pattern: /parfém|voňavk|edt|edp|eau.*de|toaletn.*vod|kolín|cologne/i, category: "PERS_PERFUME", confidence: 0.95 },
  {
    pattern: /deo|dezodor|antiperspir|hygienic|intím|damsk.*vlož|tampón|menštruač/i,
    category: "PERS_HYGIENE",
    confidence: 0.95,
  },

  // HOUSEHOLD
  {
    pattern: /čisti[čt]|dezinfek|wc|toalet|sanitár|odstraňov|odpudzov|odvápňov|čistiaci.*prostr/i,
    category: "HOME_CLEANING",
    confidence: 0.95,
  },
  {
    pattern: /prac|prášok|aviváž|bielid|škrob|zmäkčov|gél.*pran|kapsul.*pran/i,
    category: "HOME_LAUNDRY",
    confidence: 0.95,
  },
  {
    pattern: /kuchyn|hrniec|panvic|riad|príbor|pohár|tanier|misk|cedidlo|naberač|varech|forma.*peč/i,
    category: "HOME_KITCHEN",
    confidence: 0.9,
  },
  { pattern: /sáčk|vrecko|fóli|alobal|kontajner|box.*na|dóza|uzatvár/i, category: "HOME_STORAGE", confidence: 0.9 },
  { pattern: /sviečk|váza|rámik|dekorác|ozdoba|vankúš|závěs|záclona/i, category: "HOME_DECOR", confidence: 0.9 },
  { pattern: /záhrad|kvet.*zemin|hnojiv|semien|rastlin|substrát|mulč/i, category: "HOME_GARDEN", confidence: 0.9 },
  { pattern: /krmiv|granul|mačk|pes|zviera|akvárium|hlodav|vtáč|podstielk/i, category: "HOME_PET", confidence: 0.95 },
  { pattern: /papier|utier|servít|vreckovk|toaletn.*pap|kuchyn.*utier/i, category: "HOME_OTHER", confidence: 0.85 },

  // FASHION
  {
    pattern: /tričk|košeľ|sveter|mikina|bunda|kabát|šaty|sukňa|nohavic|džíns|legín|tepláky|šortky|blúz|vesta|plášť/i,
    category: "FASH_CLOTHING",
    confidence: 0.95,
  },
  {
    pattern: /topánk|obuv|tenisky|sandál|čižm|papuč|mokasín|lodičk|baleríny/i,
    category: "FASH_FOOTWEAR",
    confidence: 0.95,
  },
  {
    pattern: /čiapk|šál|rukavic|opasok|kabelk|peňaženk|hodinky|náramok|náhrdelník|náušnic|okuliare.*slneč/i,
    category: "FASH_ACCESSORIES",
    confidence: 0.95,
  },
  {
    pattern: /ponožk|sock|spodn.*bieliz|podprsenk|slipy|boxerk|tielk|nohavičk|plavky/i,
    category: "FASH_UNDERWEAR",
    confidence: 0.95,
  },
  { pattern: /športov|fitness|bežeck|cyklistic|funkčn/i, category: "FASH_SPORTS", confidence: 0.9 },
  { pattern: /vk\s|dám\.|pán\.|det\./i, category: "FASH_CLOTHING", confidence: 0.8 },

  // ELECTRONICS
  {
    pattern: /telefón|mobil|smartphone|iphone|samsung.*gala|xiaomi|huawei/i,
    category: "ELEC_PHONES",
    confidence: 0.95,
  },
  { pattern: /notebook|počítač|tablet|laptop|pc|monitor|klávesnic|myš/i, category: "ELEC_COMPUTERS", confidence: 0.95 },
  { pattern: /nabíjač|kábel|adaptér|powerbank|usb|lightning|type.*c/i, category: "ELEC_ACCESSORIES", confidence: 0.95 },
  { pattern: /slúchadl|reproduktor|speaker|audio|bluetooth|wireless/i, category: "ELEC_AUDIO", confidence: 0.95 },
  { pattern: /batéri|akumulátor|článok|aa|aaa|lithium/i, category: "ELEC_BATTERIES", confidence: 0.95 },

  // SERVICES
  {
    pattern: /menu|obed|večer|jedlo|porcia|hlavné.*jedl|polievk|predjedl|dezert/i,
    category: "SERV_RESTAURANT",
    confidence: 0.95,
  },
  { pattern: /brew|presso|ccino|latte|flat.*white|lungo|ristretto/i, category: "SERV_CAFE", confidence: 0.9 },
  {
    pattern: /pizza|burger|sendvič|wrap|šalát|kebab|gyros|bageta|hot.*dog/i,
    category: "SERV_TAKEAWAY",
    confidence: 0.9,
  },
  { pattern: /foto|tlač|print|kopírov|scan/i, category: "SERV_PHOTO", confidence: 0.95 },
  { pattern: /oprav|servis|údržb/i, category: "SERV_REPAIR", confidence: 0.9 },

  // AUTOMOTIVE
  {
    pattern: /diesel|benzín|nafta|paliv|natural.*95|natural.*98|lpg|cng|phm/i,
    category: "AUTO_FUEL",
    confidence: 0.98,
  },
  { pattern: /olej.*motor|brzdov|filter|sviečk|náhradn|autodiel/i, category: "AUTO_PARTS", confidence: 0.95 },
  { pattern: /osviežovač|autokozmetik|utierka.*auto|hubka.*auto/i, category: "AUTO_ACCESSORIES", confidence: 0.9 },
  { pattern: /umýv.*auto|šampón.*auto|vosk|leštidl|activ.*foam/i, category: "AUTO_CARE", confidence: 0.9 },

  // HEALTH
  {
    pattern: /liek|tablet|kapsul|sirup|kvapky|masť|gél.*lieč|injek|ampulk|supp/i,
    category: "HEALTH_PHARMACY",
    confidence: 0.95,
  },
  {
    pattern: /vitamin|minerál|doplnok.*strav|omega|zinok|magnéz|železo|vápnik|horčík/i,
    category: "HEALTH_VITAMINS",
    confidence: 0.95,
  },
  { pattern: /obväz|náplasť|teplomer|tlakomer|injek|steril|gáza/i, category: "HEALTH_MEDICAL", confidence: 0.95 },
  { pattern: /okuliare|šošovky|očn|kontaktn.*šošov|roztok.*šošov/i, category: "HEALTH_OPTICAL", confidence: 0.95 },

  // LEISURE
  {
    pattern: /hračk|lego|bábik|autíčk|lopta|puzzle|stavebnic|plyš|spoločens.*hr/i,
    category: "LEIS_TOYS",
    confidence: 0.95,
  },
  { pattern: /kniha|časopis|noviny|román|učebnic|zošit|slovník|atlas/i, category: "LEIS_BOOKS", confidence: 0.95 },
  {
    pattern: /športov.*potreby|raketa|lyže|korčul|bicykel|činka|fit.*náčini/i,
    category: "LEIS_SPORTS",
    confidence: 0.95,
  },
  { pattern: /cd|dvd|vinyl|gramofón|hudobn|platň/i, category: "LEIS_MUSIC", confidence: 0.9 },
  { pattern: /kreatív|nárami.*sada|bizuter|botanik|hydropon|diy|hand.*made/i, category: "LEIS_HOBBY", confidence: 0.9 },

  // OTHER
  { pattern: /záloha|deposit|vratn|záloh.*obal/i, category: "OTHER_DEPOSIT", confidence: 0.98 },
  { pattern: /taška|igelit|sáčok|obal|tašk.*plast|tašk.*pap/i, category: "OTHER_PACKAGING", confidence: 0.9 },
]

function categorizeByBrand(name: string): { category: CategoryCode; confidence: number } | null {
  const lowerName = name.toLowerCase()
  for (const [brand, category] of Object.entries(BRAND_DATABASE)) {
    if (lowerName.includes(brand)) {
      return { category, confidence: 0.95 }
    }
  }
  return null
}

function categorizeByKeywords(name: string): { category: CategoryCode; confidence: number } | null {
  for (const { pattern, category, confidence } of KEYWORD_PATTERNS) {
    if (pattern.test(name)) {
      return { category, confidence }
    }
  }
  return null
}

function categorizeByVAT(vatRate: number, name: string): { category: CategoryCode; confidence: number } | null {
  const lowerName = name.toLowerCase()

  // 5% VAT in Slovakia = food staples, pharmacy, books
  if (vatRate === 5) {
    // Check for pharmacy indicators
    if (/liek|tablet|kapsul|masť|sirup|fo\s*$|mg|ml.*liek/i.test(lowerName)) {
      return { category: "HEALTH_PHARMACY", confidence: 0.8 }
    }
    // Check for book indicators
    if (/kniha|časopis|noviny|zošit/i.test(lowerName)) {
      return { category: "LEIS_BOOKS", confidence: 0.8 }
    }
    // Default to food for 5% VAT
    return { category: "FOOD_OTHER", confidence: 0.6 }
  }

  // 0% VAT = deposits, exports
  if (vatRate === 0) {
    if (/záloha|deposit|vratn|obal|pet|plech/i.test(lowerName)) {
      return { category: "OTHER_DEPOSIT", confidence: 0.95 }
    }
  }

  return null
}

function preCategorize(item: ReceiptItem): { category: CategoryCode; confidence: number; method: string } | null {
  // 1. Try brand matching first (highest priority)
  const brandResult = categorizeByBrand(item.name)
  if (brandResult && brandResult.confidence >= 0.9) {
    return { ...brandResult, method: "brand" }
  }

  // 2. Try keyword pattern matching
  const keywordResult = categorizeByKeywords(item.name)
  if (keywordResult && keywordResult.confidence >= 0.85) {
    return { ...keywordResult, method: "keyword" }
  }

  // 3. Try VAT-based hints
  const vatResult = categorizeByVAT(item.vatRate, item.name)
  if (vatResult && vatResult.confidence >= 0.7) {
    return { ...vatResult, method: "vat" }
  }

  // 4. Return lower confidence matches
  if (keywordResult) return { ...keywordResult, method: "keyword" }
  if (brandResult) return { ...brandResult, method: "brand" }

  return null
}

function normalizeCategory(rawCategory: string): CategoryCode {
  const upper = rawCategory.toUpperCase().replace(/[^A-Z_]/g, "")

  // Direct match
  if (validCategories.includes(upper as any)) {
    return upper as CategoryCode
  }

  // Try partial matches
  for (const validCat of validCategories) {
    if (upper.includes(validCat) || validCat.includes(upper)) {
      return validCat as CategoryCode
    }
  }

  // Map common AI responses to categories
  const mappings: Record<string, CategoryCode> = {
    FOOD: "FOOD_OTHER",
    BEVERAGE: "BEV_OTHER",
    BEVERAGES: "BEV_OTHER",
    DRINK: "BEV_OTHER",
    DRINKS: "BEV_OTHER",
    PERSONAL: "PERS_OTHER",
    COSMETIC: "PERS_COSMETICS",
    COSMETICS: "PERS_COSMETICS",
    HOUSEHOLD: "HOME_OTHER",
    HOME: "HOME_OTHER",
    CLEANING: "HOME_CLEANING",
    FASHION: "FASH_OTHER",
    CLOTHES: "FASH_CLOTHING",
    CLOTHING: "FASH_CLOTHING",
    ELECTRONICS: "ELEC_OTHER",
    ELECTRONIC: "ELEC_OTHER",
    SERVICE: "SERV_OTHER",
    SERVICES: "SERV_OTHER",
    RESTAURANT: "SERV_RESTAURANT",
    CAFE: "SERV_CAFE",
    AUTO: "AUTO_OTHER",
    AUTOMOTIVE: "AUTO_OTHER",
    FUEL: "AUTO_FUEL",
    HEALTH: "HEALTH_OTHER",
    PHARMACY: "HEALTH_PHARMACY",
    MEDICINE: "HEALTH_PHARMACY",
    LEISURE: "LEIS_OTHER",
    TOYS: "LEIS_TOYS",
    BOOKS: "LEIS_BOOKS",
    DEPOSIT: "OTHER_DEPOSIT",
    PACKAGING: "OTHER_PACKAGING",
    UNKNOWN: "OTHER_UNKNOWN",
    OTHER: "OTHER_UNKNOWN",
  }

  for (const [key, value] of Object.entries(mappings)) {
    if (upper.includes(key)) {
      return value
    }
  }

  return "OTHER_UNKNOWN"
}

function createCategorizedItem(item: ReceiptItem, category: CategoryCode, confidence: number): CategorizedItem {
  const categoryDef = getCategoryByCode(category)
  const sectorDef = categoryDef ? getSectorByCode(categoryDef.sector) : undefined

  return {
    ...item,
    category,
    categoryName: categoryDef?.name || "Nezaradené",
    sector: categoryDef?.sector || ("OTHER" as SectorCode),
    sectorName: sectorDef?.name || "Ostatné",
    confidence,
    reasoning: "",
    isManuallyEdited: false,
  }
}

async function categorizeWithAI(items: ReceiptItem[], useStrongModel = false): Promise<CategorizedItem[]> {
  const itemsList = items
    .map((item, idx) => `${idx + 1}. ID="${item.id}" | "${item.name}" | DPH=${item.vatRate}%`)
    .join("\n")

  const model = useStrongModel ? "openai/gpt-4o" : "openai/gpt-4o-mini"

  const prompt = `Si expert na kategorizáciu slovenských pokladničných dokladov (eKasa).

ÚLOHA: Zaraď každú položku do správnej kategórie.

KATEGÓRIE (použi PRESNÝ kód):
FOOD_DAIRY=Mliečne výrobky (mlieko,syr,jogurt,tvaroh,maslo)
FOOD_MEAT=Mäso (kura,hovädzie,bravčové,klobásy,šunka)
FOOD_BAKERY=Pečivo (chlieb,rožky,bagety)
FOOD_FRUITS_VEG=Ovocie a zelenina
FOOD_SNACKS=Snacky (chips,tyčinky,oriešky)
FOOD_SWEETS=Sladkosti (čokoláda,bonbóny,sušienky)
FOOD_OTHER=Ostatné potraviny
BEV_SOFT_DRINKS=Nealkoholické nápoje (Cola,Fanta,Kofola)
BEV_WATER=Voda (minerálky)
BEV_BEER=Pivo
BEV_WINE=Víno
BEV_SPIRITS=Destiláty (vodka,rum,whisky)
BEV_ENERGY=Energetické nápoje
BEV_COFFEE_TEA=Káva a čaj
BEV_OTHER=Ostatné nápoje
PERS_HAIR=Vlasová kozmetika (šampón,farba ICC,kondicionér)
PERS_SKIN=Pleťová kozmetika
PERS_ORAL=Ústna hygiena (zubná pasta Lacalut)
PERS_COSMETICS=Dekoratívna kozmetika
PERS_PERFUME=Parfumy (David Beckham,LA RIVE)
PERS_HYGIENE=Hygiena (dezodorant,tampóny)
PERS_OTHER=Ostatná kozmetika
HOME_CLEANING=Čistiace prostriedky (Domestos,WC)
HOME_LAUNDRY=Pracie prostriedky
HOME_PET=Potreby pre zvieratá
HOME_OTHER=Ostatné pre domácnosť
FASH_UNDERWEAR=Spodná bielizeň a ponožky
FASH_CLOTHING=Oblečenie
FASH_FOOTWEAR=Obuv
SERV_RESTAURANT=Reštaurácia (jedlo,menu)
SERV_CAFE=Kaviareň (káva,Focaccia,croissant)
SERV_PHOTO=Foto služby
AUTO_FUEL=Palivo (Diesel,Natural,benzín)
HEALTH_PHARMACY=Lieky (Sumamed,Paralen,Ibalgin)
HEALTH_VITAMINS=Vitamíny
LEIS_TOYS=Hračky
LEIS_HOBBY=Hobby (kreatívne sady,DIY)
OTHER_DEPOSIT=Záloha (vratný obal,PET,plechovka)
OTHER_UNKNOWN=Neznáme

POLOŽKY:
${itemsList}

TIPY:
- "VK" = veľkoobchodná značka oblečenia
- "ICC" = farba na vlasy (napr. PALETTE ICC)
- DPH 5% = potraviny, lieky, knihy
- DPH 0% = zálohy
- DPH 23% = luxusné tovary, alkohol

Vráť JSON: {"items":[{"id":"...","category":"KÓD","confidence":0.0-1.0}]}`

  try {
    const { object } = await generateObject({
      model,
      schema: categorizationSchema,
      prompt,
      temperature: 0.1, // Lower temperature for more consistent results
    })

    return items.map((item) => {
      const aiResult = object.items.find((r) => r.id === item.id)
      if (!aiResult) {
        return createCategorizedItem(item, "OTHER_UNKNOWN", 0.3)
      }
      const normalizedCategory = normalizeCategory(aiResult.category)
      return createCategorizedItem(item, normalizedCategory, aiResult.confidence || 0.7)
    })
  } catch (error) {
    console.error("[v0] AI categorization error:", error)
    return items.map((item) => {
      const vatResult = categorizeByVAT(item.vatRate, item.name)
      if (vatResult) {
        return createCategorizedItem(item, vatResult.category, vatResult.confidence * 0.7)
      }
      return createCategorizedItem(item, "OTHER_UNKNOWN", 0.2)
    })
  }
}

export async function POST(request: NextRequest) {
  console.log("[v0] API /api/categorize called")

  const { items, batchSize = 10 } = (await request.json()) as { items: ReceiptItem[]; batchSize?: number }

  console.log("[v0] Received items for categorization:", items.length)

  const encoder = new TextEncoder()
  const stream = new TransformStream()
  const writer = stream.writable.getWriter()

  const sendEvent = async (data: object) => {
    console.log("[v0] Sending event:", (data as any).type || "unknown")
    await writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`))
  }
  ;(async () => {
    try {
      // Step 1: Pre-categorize with expanded Slovak patterns
      console.log("[v0] Starting pre-categorization with Slovak patterns...")
      const preCategorized: CategorizedItem[] = []
      const needsAI: ReceiptItem[] = []

      for (const item of items) {
        const preResult = preCategorize(item)
        if (preResult && preResult.confidence >= 0.7) {
          // Lowered threshold
          preCategorized.push(createCategorizedItem(item, preResult.category, preResult.confidence))
        } else {
          needsAI.push(item)
        }
      }

      console.log("[v0] Pre-categorized:", preCategorized.length, "Needs AI:", needsAI.length)

      await sendEvent({
        type: "pre-categorize",
        preCategorizedCount: preCategorized.length,
        needsAICount: needsAI.length,
      })

      // Step 2: Create batches for AI
      const batches: ReceiptItem[][] = []
      for (let i = 0; i < needsAI.length; i += batchSize) {
        batches.push(needsAI.slice(i, i + batchSize))
      }

      console.log("[v0] Created", batches.length, "batches for AI processing")

      await sendEvent({
        type: "batches-created",
        totalBatches: batches.length,
        batches: batches.map((b, i) => ({
          id: i,
          itemCount: b.length,
          status: "pending",
          progress: 0,
        })),
      })

      // Process batches in parallel
      const aiResults: CategorizedItem[] = []
      const batchPromises = batches.map(async (batch, batchIndex) => {
        await sendEvent({
          type: "batch-start",
          batchId: batchIndex,
          status: "processing",
        })

        const startTime = Date.now()
        console.log("[v0] Starting batch", batchIndex, "with", batch.length, "items")
        const result = await categorizeWithAI(batch, false)
        const endTime = Date.now()
        console.log("[v0] Completed batch", batchIndex, "in", endTime - startTime, "ms")

        await sendEvent({
          type: "batch-complete",
          batchId: batchIndex,
          status: "complete",
          itemsProcessed: result.length,
          timeMs: endTime - startTime,
        })

        return result
      })

      const batchResults = await Promise.all(batchPromises)
      for (const result of batchResults) {
        aiResults.push(...result)
      }

      console.log("[v0] All batches complete. AI results:", aiResults.length)

      const stillUncategorized = aiResults.filter((item) => item.category === "OTHER_UNKNOWN" || item.confidence < 0.5)
      console.log("[v0] Still uncategorized after first pass:", stillUncategorized.length)

      if (stillUncategorized.length > 0) {
        console.log("[v0] Starting second pass with GPT-4o for", stillUncategorized.length, "items")

        const secondPassBatches: CategorizedItem[][] = []
        for (let i = 0; i < stillUncategorized.length; i += 15) {
          secondPassBatches.push(stillUncategorized.slice(i, i + 15))
        }

        await sendEvent({
          type: "second-pass-start",
          itemCount: stillUncategorized.length,
          totalBatches: secondPassBatches.length,
        })

        // Process second pass batches in parallel
        const secondPassPromises = secondPassBatches.map(async (batch, batchIndex) => {
          await sendEvent({
            type: "second-pass-batch-start",
            batchId: batchIndex,
            totalBatches: secondPassBatches.length,
            itemCount: batch.length,
          })

          const startTime = Date.now()

          const secondPassResults = await categorizeWithAI(
            batch.map(({ id, name, price, quantity, vatRate, itemType, totalPrice }) => ({
              id,
              name,
              price,
              quantity,
              vatRate,
              itemType,
              totalPrice,
            })),
            true,
          )

          let batchImproved = 0
          const improvedItems: { id: string; result: CategorizedItem }[] = []

          for (const result of secondPassResults) {
            if (result.category !== "OTHER_UNKNOWN" && result.confidence >= 0.5) {
              improvedItems.push({ id: result.id, result })
              batchImproved++
            }
          }

          const endTime = Date.now()

          await sendEvent({
            type: "second-pass-batch-complete",
            batchId: batchIndex,
            totalBatches: secondPassBatches.length,
            improved: batchImproved,
            timeMs: endTime - startTime,
          })

          return improvedItems
        })

        const secondPassResultArrays = await Promise.all(secondPassPromises)

        // Merge improved items back into aiResults
        let totalImproved = 0
        for (const improvedItems of secondPassResultArrays) {
          for (const { id, result } of improvedItems) {
            const index = aiResults.findIndex((item) => item.id === id)
            if (index !== -1) {
              aiResults[index] = result
              totalImproved++
            }
          }
        }

        console.log("[v0] Second pass complete. Improved:", totalImproved)

        await sendEvent({
          type: "second-pass-complete",
          improved: totalImproved,
        })
      } else {
        console.log("[v0] No uncategorized items or low confidence items, skipping second pass")
      }

      // Combine and sort results
      const allResults = [...preCategorized, ...aiResults]
      const resultMap = new Map(allResults.map((item) => [item.id, item]))
      const finalResults = items.map((item) => resultMap.get(item.id)!)

      console.log("[v0] Categorization complete. Total results:", finalResults.length)

      await sendEvent({
        type: "complete",
        results: finalResults,
      })

      await writer.close()
    } catch (error) {
      console.error("[v0] Categorization error:", error)
      await sendEvent({
        type: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      })
      await writer.close()
    }
  })()

  return new Response(stream.readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
