"use server"

import { generateObject } from "ai"
import { z } from "zod"
import type { ReceiptItem, CategorizedItem, CategoryCode, SectorCode } from "@/lib/types"
import { CATEGORIES, SECTORS } from "@/lib/types"

const validCategories = [
  // FOOD
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
  // BEVERAGES
  "BEV_SOFT_DRINKS",
  "BEV_WATER",
  "BEV_JUICE",
  "BEV_COFFEE_TEA",
  "BEV_BEER",
  "BEV_WINE",
  "BEV_SPIRITS",
  "BEV_ENERGY",
  "BEV_OTHER",
  // PERSONAL_CARE
  "PERS_HAIR",
  "PERS_SKIN",
  "PERS_ORAL",
  "PERS_FRAGRANCE",
  "PERS_MAKEUP",
  "PERS_HYGIENE",
  "PERS_SHAVING",
  "PERS_DEODORANT",
  "PERS_OTHER",
  // HOUSEHOLD
  "HOME_CLEANING",
  "HOME_LAUNDRY",
  "HOME_PAPER",
  "HOME_KITCHEN",
  "HOME_STORAGE",
  "HOME_DECOR",
  "HOME_GARDEN",
  "HOME_PETS",
  "HOME_OTHER",
  // FASHION
  "FASH_CLOTHING",
  "FASH_UNDERWEAR",
  "FASH_FOOTWEAR",
  "FASH_ACCESSORIES",
  "FASH_SPORTSWEAR",
  "FASH_CHILDREN",
  "FASH_OTHER",
  // ELECTRONICS
  "ELEC_PHONES",
  "ELEC_COMPUTERS",
  "ELEC_AUDIO",
  "ELEC_TV",
  "ELEC_BATTERIES",
  "ELEC_CABLES",
  "ELEC_APPLIANCES",
  "ELEC_LIGHTING",
  "ELEC_OTHER",
  // SERVICES
  "SERV_RESTAURANT",
  "SERV_CAFE",
  "SERV_FASTFOOD",
  "SERV_DELIVERY",
  "SERV_PHOTO",
  "SERV_REPAIR",
  "SERV_BEAUTY",
  "SERV_OTHER",
  // AUTOMOTIVE
  "AUTO_FUEL",
  "AUTO_OIL",
  "AUTO_PARTS",
  "AUTO_ACCESSORIES",
  "AUTO_WASH",
  "AUTO_OTHER",
  // HEALTH
  "HEALTH_PHARMACY",
  "HEALTH_VITAMINS",
  "HEALTH_MEDICAL",
  "HEALTH_OPTICAL",
  "HEALTH_OTHER",
  // LEISURE
  "LEIS_TOYS",
  "LEIS_BOOKS",
  "LEIS_MUSIC",
  "LEIS_SPORTS",
  "LEIS_HOBBY",
  "LEIS_TRAVEL",
  "LEIS_OTHER",
  // OTHER
  "OTHER_DEPOSIT",
  "OTHER_PACKAGING",
  "OTHER_UNCATEGORIZED",
] as const

const categorizationSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      category: z.enum(validCategories),
      confidence: z.number().min(0).max(1),
    }),
  ),
})

const BRAND_DATABASE: Record<string, CategoryCode> = {
  // Personal care - Hair
  palette: "PERS_HAIR",
  syoss: "PERS_HAIR",
  head: "PERS_HAIR",
  pantene: "PERS_HAIR",
  loreal: "PERS_HAIR",
  garnier: "PERS_HAIR",
  schwarzkopf: "PERS_HAIR",
  tresemme: "PERS_HAIR",
  // Personal care - Fragrance
  beckham: "PERS_FRAGRANCE",
  "david beckham": "PERS_FRAGRANCE",
  "la rive": "PERS_FRAGRANCE",
  adidas: "PERS_FRAGRANCE",
  "bruno banani": "PERS_FRAGRANCE",
  playboy: "PERS_FRAGRANCE",
  // Personal care - Oral
  colgate: "PERS_ORAL",
  "oral-b": "PERS_ORAL",
  sensodyne: "PERS_ORAL",
  elmex: "PERS_ORAL",
  listerine: "PERS_ORAL",
  parodontax: "PERS_ORAL",
  // Personal care - Hygiene
  nivea: "PERS_HYGIENE",
  dove: "PERS_HYGIENE",
  "fa ": "PERS_HYGIENE",
  palmolive: "PERS_HYGIENE",
  // Personal care - Deodorant
  rexona: "PERS_DEODORANT",
  axe: "PERS_DEODORANT",
  // Personal care - Shaving
  gillette: "PERS_SHAVING",
  wilkinson: "PERS_SHAVING",

  // Household - Cleaning
  domestos: "HOME_CLEANING",
  ajax: "HOME_CLEANING",
  cif: "HOME_CLEANING",
  cillit: "HOME_CLEANING",
  bref: "HOME_CLEANING",
  pronto: "HOME_CLEANING",
  // Household - Laundry
  persil: "HOME_LAUNDRY",
  ariel: "HOME_LAUNDRY",
  lenor: "HOME_LAUNDRY",
  vanish: "HOME_LAUNDRY",
  savo: "HOME_LAUNDRY",
  // Household - Kitchen
  jar: "HOME_KITCHEN",
  fairy: "HOME_KITCHEN",

  // Beverages - Soft drinks
  coca: "BEV_SOFT_DRINKS",
  cola: "BEV_SOFT_DRINKS",
  pepsi: "BEV_SOFT_DRINKS",
  fanta: "BEV_SOFT_DRINKS",
  sprite: "BEV_SOFT_DRINKS",
  kofola: "BEV_SOFT_DRINKS",
  vinea: "BEV_SOFT_DRINKS",
  "7up": "BEV_SOFT_DRINKS",
  schweppes: "BEV_SOFT_DRINKS",
  // Beverages - Water
  rajec: "BEV_WATER",
  budiš: "BEV_WATER",
  šariš: "BEV_WATER",
  mattoni: "BEV_WATER",
  bonaqua: "BEV_WATER",
  // Beverages - Coffee/Tea
  nescafe: "BEV_COFFEE_TEA",
  jacobs: "BEV_COFFEE_TEA",
  tchibo: "BEV_COFFEE_TEA",
  lipton: "BEV_COFFEE_TEA",
  pickwick: "BEV_COFFEE_TEA",
  // Beverages - Beer
  corgon: "BEV_BEER",
  "zlatý bažant": "BEV_BEER",
  šariš: "BEV_BEER",
  "smädný mních": "BEV_BEER",
  heineken: "BEV_BEER",
  pilsner: "BEV_BEER",
  kozel: "BEV_BEER",
  budweiser: "BEV_BEER",
  radler: "BEV_BEER",
  // Beverages - Energy
  redbull: "BEV_ENERGY",
  monster: "BEV_ENERGY",
  rockstar: "BEV_ENERGY",
  burn: "BEV_ENERGY",
  tiger: "BEV_ENERGY",

  // Food - Snacks
  pringles: "FOOD_SNACKS",
  lays: "FOOD_SNACKS",
  chio: "FOOD_SNACKS",
  bohemia: "FOOD_SNACKS",
  tuc: "FOOD_SNACKS",
  ritz: "FOOD_SNACKS",
  // Food - Sweets
  lentilky: "FOOD_SWEETS",
  milka: "FOOD_SWEETS",
  orion: "FOOD_SWEETS",
  merci: "FOOD_SWEETS",
  kinder: "FOOD_SWEETS",
  raffaello: "FOOD_SWEETS",
  ferrero: "FOOD_SWEETS",
  haribo: "FOOD_SWEETS",
  mentos: "FOOD_SWEETS",
  orbit: "FOOD_SWEETS",
  // Food - Dairy
  rajo: "FOOD_DAIRY",
  sabi: "FOOD_DAIRY",
  danone: "FOOD_DAIRY",
  activia: "FOOD_DAIRY",
  actimel: "FOOD_DAIRY",
  jogobella: "FOOD_DAIRY",

  // Health - Pharmacy
  magnosolv: "HEALTH_VITAMINS",
  paralen: "HEALTH_PHARMACY",
  ibalgin: "HEALTH_PHARMACY",
  aspirin: "HEALTH_PHARMACY",
  mucosolvan: "HEALTH_PHARMACY",
  stoptussin: "HEALTH_PHARMACY",

  // Services - Cafe
  focaccia: "SERV_CAFE",
  "batch brew": "SERV_CAFE",
  espresso: "SERV_CAFE",
  cappuccino: "SERV_CAFE",
  latte: "SERV_CAFE",

  // Leisure - Toys
  canpol: "LEIS_TOYS",
  lego: "LEIS_TOYS",
  // Baby
  pampers: "HOME_PAPER",
  huggies: "HOME_PAPER",
}

const KEYWORD_PATTERNS: Array<{ pattern: RegExp; category: CategoryCode; confidence: number }> = [
  // Food - Dairy
  {
    pattern: /tvaroh|mlieko|maslo|syr|jogurt|smotana|syrok|bryndza|parenica|ostiepok|kefír/i,
    category: "FOOD_DAIRY",
    confidence: 0.9,
  },
  // Food - Meat
  {
    pattern: /kur[aí.]|brav|hov|mäso|maso|steak|rezn|šunk|sunk|salám|párok|klobás|slanin|pečeň/i,
    category: "FOOD_MEAT",
    confidence: 0.9,
  },
  // Food - Bakery
  {
    pattern: /chlieb|rožok|rohlík|bageta|croissant|buchta|koláč|zákusok|torta|vianočka|bábovka/i,
    category: "FOOD_BAKERY",
    confidence: 0.9,
  },
  // Food - Fruits/Vegetables
  {
    pattern:
      /jablk|hruška|banán|pomaranč|citrón|rajčin|paprik|uhorka|kapusta|mrkva|zemiaky|cibuľa|cesnak|šalát|brokolica/i,
    category: "FOOD_FRUITS_VEG",
    confidence: 0.9,
  },
  // Food - Frozen
  { pattern: /mrazen|zmrzlin|nanuk|frozen|ľad/i, category: "FOOD_FROZEN", confidence: 0.9 },
  // Food - Canned
  { pattern: /konzerv|tuniak|fazuľa|hrach|kukurica|paradajk|zaváranin/i, category: "FOOD_CANNED", confidence: 0.85 },
  // Food - Snacks
  { pattern: /chips|čips|krekr|tyčink|oriešk|arašid|slnečnic|nachos/i, category: "FOOD_SNACKS", confidence: 0.85 },
  // Food - Sweets
  { pattern: /čokolád|bonbón|cukrík|sušienk|keks|gumov|žuvač/i, category: "FOOD_SWEETS", confidence: 0.85 },
  // Food - Spices
  { pattern: /koren|soľ|kečup|horčic|majonéz|omáčk|ocot/i, category: "FOOD_SPICES", confidence: 0.85 },
  // Food - Oils
  { pattern: /olej|slnečnic|olivov|repkov|margarín/i, category: "FOOD_OILS", confidence: 0.85 },
  // Food - Pasta/Rice
  {
    pattern: /cestoviny|špagety|makarón|ryža|múka|krúpy|pohánk|ovsené|vločk/i,
    category: "FOOD_PASTA_RICE",
    confidence: 0.85,
  },
  // Food - Breakfast
  {
    pattern: /cereál|müsli|granola|džem|med|nutella|nátierka|corn flakes/i,
    category: "FOOD_BREAKFAST",
    confidence: 0.85,
  },
  // Food - Baby
  { pattern: /detská.*výživ|dojčen|príkrm|hipp|bebivita|sunar|nutrilon/i, category: "FOOD_BABY", confidence: 0.9 },

  // Beverages
  { pattern: /limonád|sýten|tonic/i, category: "BEV_SOFT_DRINKS", confidence: 0.85 },
  { pattern: /voda|mineral|perlivá|neperlivá|stolová/i, category: "BEV_WATER", confidence: 0.8 },
  { pattern: /džús|juice|šťava|nektár|smoothie/i, category: "BEV_JUICE", confidence: 0.85 },
  { pattern: /káva|coffee|čaj|tea|kakao/i, category: "BEV_COFFEE_TEA", confidence: 0.85 },
  { pattern: /pivo|beer|ležiak/i, category: "BEV_BEER", confidence: 0.9 },
  {
    pattern: /víno|wine|sekt|šampan|prosecco|rizling|frankovka|cabernet|chardonnay/i,
    category: "BEV_WINE",
    confidence: 0.9,
  },
  {
    pattern: /whisky|vodka|rum|gin|likér|brandy|koňak|slivovica|hruškov|borovičk|tequila|jäger/i,
    category: "BEV_SPIRITS",
    confidence: 0.9,
  },
  { pattern: /energy|energetick/i, category: "BEV_ENERGY", confidence: 0.85 },

  // Personal care
  {
    pattern: /šampón|kondicion|vlasy|farba.*vlas|vlas.*farb|icc|color|colour|lak.*vlas/i,
    category: "PERS_HAIR",
    confidence: 0.9,
  },
  { pattern: /krém|pleť|tvár|sérum|mask[ay]|peeling|hydrat|čistic/i, category: "PERS_SKIN", confidence: 0.9 },
  { pattern: /zubn|pasta|kefka|ústn/i, category: "PERS_ORAL", confidence: 0.9 },
  { pattern: /parfém|parfum|toaletn|edt|edp|vôňa|fragrance/i, category: "PERS_FRAGRANCE", confidence: 0.9 },
  {
    pattern: /rúž|očné|tiene|riasenak|lak.*necht|make-up|púder|korektor|maskara/i,
    category: "PERS_MAKEUP",
    confidence: 0.9,
  },
  { pattern: /mydlo|sprchov|gél|telové|vlhčen|obrúsk|intímn|hygien/i, category: "PERS_HYGIENE", confidence: 0.9 },
  { pattern: /holi|žilet|britvica|after.*shave/i, category: "PERS_SHAVING", confidence: 0.9 },
  { pattern: /deo|dezodor|antiperspir/i, category: "PERS_DEODORANT", confidence: 0.9 },

  // Household
  { pattern: /čisti[čt]|dezinfek|sanit|odstraň|príprav/i, category: "HOME_CLEANING", confidence: 0.9 },
  { pattern: /prací|prášok|aviváž|bieli|kapsul.*prac/i, category: "HOME_LAUNDRY", confidence: 0.9 },
  { pattern: /papier|toalet|utier|servít|vreckov/i, category: "HOME_PAPER", confidence: 0.85 },
  {
    pattern: /riad|príbor|hrniec|panvic|nôž|lyžic|vidlič|misky|tanier|pohár/i,
    category: "HOME_KITCHEN",
    confidence: 0.85,
  },
  { pattern: /úlož|box|krabic|organiz|plast|vedro|kôš/i, category: "HOME_STORAGE", confidence: 0.85 },
  { pattern: /dekorác|sviečk|váz|kvet|umelý|rámik|obraz|vianoc|veľkonoc/i, category: "HOME_DECOR", confidence: 0.8 },
  { pattern: /záhrad|hlina|hnojivo|semien|rastlin|hadica/i, category: "HOME_GARDEN", confidence: 0.85 },
  { pattern: /krmiv|granul|mačk|pes|psík|zviera|akvárium|vtáč|podstielk/i, category: "HOME_PETS", confidence: 0.9 },

  // Fashion
  {
    pattern: /trič|košeľ|nohavic|džíns|sukň|šaty|bund|kabát|sveter|mikina|sako|vesta/i,
    category: "FASH_CLOTHING",
    confidence: 0.9,
  },
  {
    pattern: /ponožk|sock|spodná|tangá|slip|boxerk|podprsenk|pančuch|silonk|bieliz|pyžam/i,
    category: "FASH_UNDERWEAR",
    confidence: 0.9,
  },
  {
    pattern: /obuv|topánk|tenisky|sandál|šľapk|papuč|čižm|mokasín|lodičk/i,
    category: "FASH_FOOTWEAR",
    confidence: 0.9,
  },
  {
    pattern: /opasok|kabelk|peňaženk|ruksak|batoh|šatka|šál|hodinky|bižutér|okuliare/i,
    category: "FASH_ACCESSORIES",
    confidence: 0.9,
  },
  { pattern: /šport.*odevy|fitness.*odevy|legín|dres|tepláky|funkčn/i, category: "FASH_SPORTSWEAR", confidence: 0.85 },
  { pattern: /detsk.*odevy|bábätk|kojeneck|dievčensk|chlapčensk/i, category: "FASH_CHILDREN", confidence: 0.85 },
  { pattern: /vk\s|dám\.|pán\.|det\./i, category: "FASH_OTHER", confidence: 0.7 },

  // Electronics
  { pattern: /telefón|mobil|smartph|iphone|samsung|xiaomi|puzdro|fólia/i, category: "ELEC_PHONES", confidence: 0.9 },
  {
    pattern: /počítač|notebook|laptop|tablet|klávesnic|myš|monitor|usb|flash/i,
    category: "ELEC_COMPUTERS",
    confidence: 0.9,
  },
  { pattern: /slúchad|reprodukt|reprak|bluetooth|bezdrôt|earbuds|airpods/i, category: "ELEC_AUDIO", confidence: 0.9 },
  { pattern: /televíz|tv|prehrávač|dvd|hdmi|projektor/i, category: "ELEC_TV", confidence: 0.9 },
  { pattern: /batéri|akumulát|nabíjat|alkalic|lítiov|power bank/i, category: "ELEC_BATTERIES", confidence: 0.9 },
  {
    pattern: /kábel|cable|adaptér|nabíjač|charger|redukci|lightning|type-c/i,
    category: "ELEC_CABLES",
    confidence: 0.9,
  },
  { pattern: /spotreb|mixér|varič|rýchl|hriankovač|kávovar|fén/i, category: "ELEC_APPLIANCES", confidence: 0.85 },
  { pattern: /žiarovk|led|svetlo|lampa|svietidl|baterka/i, category: "ELEC_LIGHTING", confidence: 0.85 },

  // Services
  {
    pattern: /menu|obed|večer|jedlo|porcia|príloha|polievk|reštauráci|rezeň/i,
    category: "SERV_RESTAURANT",
    confidence: 0.9,
  },
  { pattern: /kaviareň|café|zákusok|dezert/i, category: "SERV_CAFE", confidence: 0.85 },
  {
    pattern: /pizza|burger|sendvič|wrap|kebab|hot dog|fastfood|mcdonalds|kfc|subway/i,
    category: "SERV_FASTFOOD",
    confidence: 0.9,
  },
  { pattern: /donáška|rozvoz|delivery|balené|takeaway|sebou/i, category: "SERV_DELIVERY", confidence: 0.85 },
  { pattern: /foto|print|tlač|kópia|kopírov|scan/i, category: "SERV_PHOTO", confidence: 0.9 },
  { pattern: /oprava|servis|výmena|inštalác/i, category: "SERV_REPAIR", confidence: 0.85 },
  { pattern: /kaderníc|strihan|manikúra|pedikúra|solárium|masáž/i, category: "SERV_BEAUTY", confidence: 0.9 },

  // Automotive
  { pattern: /diesel|benzín|nafta|paliv|lpg|natural|phm/i, category: "AUTO_FUEL", confidence: 0.95 },
  {
    pattern: /olej.*motor|motor.*olej|mazivo|castrol|mobil.*olej|shell.*olej|prevodov/i,
    category: "AUTO_OIL",
    confidence: 0.9,
  },
  { pattern: /filter|brzdy|sviečk|remeň|tlmič|výfuk|spojka/i, category: "AUTO_PARTS", confidence: 0.85 },
  {
    pattern: /autokozm|vôňa.*auto|stojan|držiak.*auto|guma|stierač|koberce.*auto/i,
    category: "AUTO_ACCESSORIES",
    confidence: 0.85,
  },
  { pattern: /umýv|autoum|šampón.*auto|vosk|leštid/i, category: "AUTO_WASH", confidence: 0.85 },

  // Health
  { pattern: /liek|tablet|kapsul|sirup|kvapky|masť/i, category: "HEALTH_PHARMACY", confidence: 0.9 },
  { pattern: /vitamin|doplnok|minerál|magnézi|zinok|vápnik|omega/i, category: "HEALTH_VITAMINS", confidence: 0.9 },
  { pattern: /obväz|náplast|teplomer|bandáž|injekc|strieka|zdravot/i, category: "HEALTH_MEDICAL", confidence: 0.85 },
  { pattern: /okuliar|šošovk|dioptr|kontaktn|optik/i, category: "HEALTH_OPTICAL", confidence: 0.9 },

  // Leisure
  { pattern: /hračk|bábik|autíčk|lopta|puzzle|stavebnic|plyšov|panenk/i, category: "LEIS_TOYS", confidence: 0.9 },
  { pattern: /kniha|časopis|noviny|roman|detektív|komiks|učebnic|slovník/i, category: "LEIS_BOOKS", confidence: 0.9 },
  { pattern: /cd|dvd|vinyl|hudba|film|blu-ray/i, category: "LEIS_MUSIC", confidence: 0.85 },
  { pattern: /šport|raketa|korčul|lyž|bicyk|čink|fitness/i, category: "LEIS_SPORTS", confidence: 0.85 },
  { pattern: /kresli|farby|pastelk|fixer|výtvarn|pletac|šijac|modelár/i, category: "LEIS_HOBBY", confidence: 0.85 },
  { pattern: /kufor|batožin|cestovn|vak|spacák|stan|mapa/i, category: "LEIS_TRAVEL", confidence: 0.85 },

  // Other
  { pattern: /záloha|deposit|vratná|fľaša.*vrát|plechovka.*vrát/i, category: "OTHER_DEPOSIT", confidence: 0.95 },
  { pattern: /obal|taška|sáčok|igelit/i, category: "OTHER_PACKAGING", confidence: 0.8 },
]

function getVatCategoryHints(vatRate: number): CategoryCode[] {
  switch (vatRate) {
    case 5:
      return [
        "FOOD_DAIRY",
        "FOOD_MEAT",
        "FOOD_BAKERY",
        "FOOD_FRUITS_VEG",
        "FOOD_BABY",
        "SERV_RESTAURANT",
        "SERV_CAFE",
        "SERV_FASTFOOD",
        "SERV_DELIVERY",
        "HEALTH_PHARMACY",
        "HEALTH_VITAMINS",
        "LEIS_BOOKS",
      ]
    case 19:
      return [
        "FOOD_SNACKS",
        "FOOD_SWEETS",
        "FOOD_CANNED",
        "FOOD_PASTA_RICE",
        "FOOD_BREAKFAST",
        "BEV_SOFT_DRINKS",
        "BEV_WATER",
        "BEV_JUICE",
        "BEV_COFFEE_TEA",
        "BEV_ENERGY",
      ]
    case 23:
      return [
        "PERS_HAIR",
        "PERS_SKIN",
        "PERS_ORAL",
        "PERS_FRAGRANCE",
        "PERS_MAKEUP",
        "HOME_CLEANING",
        "HOME_LAUNDRY",
        "FASH_CLOTHING",
        "FASH_UNDERWEAR",
        "FASH_FOOTWEAR",
        "ELEC_PHONES",
        "ELEC_AUDIO",
        "BEV_BEER",
        "BEV_WINE",
        "BEV_SPIRITS",
        "AUTO_FUEL",
      ]
    case 0:
      return ["OTHER_DEPOSIT"]
    default:
      return []
  }
}

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

function categorizeByVat(item: ReceiptItem, partialResult: CategoryCode | null): CategoryCode | null {
  const vatHints = getVatCategoryHints(item.vatRate)
  if (vatHints.length === 0) return null

  if (partialResult && vatHints.includes(partialResult)) {
    return partialResult
  }

  if (vatHints.length === 1) {
    return vatHints[0]
  }

  return null
}

function preCategorize(item: ReceiptItem): { category: CategoryCode; confidence: number; method: string } | null {
  const brandResult = categorizeByBrand(item.name)
  if (brandResult && brandResult.confidence >= 0.9) {
    return { ...brandResult, method: "brand" }
  }

  const keywordResult = categorizeByKeywords(item.name)
  if (keywordResult && keywordResult.confidence >= 0.8) {
    return { ...keywordResult, method: "keyword" }
  }

  const vatCategory = categorizeByVat(item, keywordResult?.category || null)
  if (vatCategory && item.vatRate === 5) {
    return { category: vatCategory, confidence: 0.75, method: "vat" }
  }

  if (keywordResult) {
    return { ...keywordResult, method: "keyword" }
  }
  if (brandResult) {
    return { ...brandResult, method: "brand" }
  }

  return null
}

function getCategoryInfo(code: CategoryCode): { name: string; sector: SectorCode; sectorName: string } {
  const category = CATEGORIES.find((c) => c.code === code)
  if (!category) {
    return { name: "Nezaradené", sector: "OTHER", sectorName: "Ostatné" }
  }
  const sector = SECTORS.find((s) => s.code === category.sector)
  return {
    name: category.name,
    sector: category.sector,
    sectorName: sector?.name || "Ostatné",
  }
}

function buildCategoryContext(): string {
  let context = "SECTORS:\n"
  for (const sector of SECTORS) {
    context += `\n${sector.code}: ${sector.name}\n`
    const categories = CATEGORIES.filter((c) => c.sector === sector.code)
    for (const cat of categories) {
      context += `  - ${cat.code}: ${cat.name}\n`
    }
  }
  return context
}

async function categorizeWithAI(
  items: ReceiptItem[],
  batchIndex: number,
  useStrongModel = false,
  maxRetries = 2,
): Promise<CategorizedItem[]> {
  const categoryContext = buildCategoryContext()
  const itemsList = items
    .map((item, idx) => `${idx + 1}. ID="${item.id}" Name="${item.name}" VAT=${item.vatRate}%`)
    .join("\n")

  const model = useStrongModel ? "openai/gpt-4o" : "openai/gpt-4o-mini"

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { object } = await generateObject({
        model,
        schema: categorizationSchema,
        prompt: `Categorize these Slovak retail receipt items into the most specific subcategory.
Use VAT rate as hint: 5%=food/pharma/books, 19%=standard goods, 23%=luxury/non-essential.

${categoryContext}

ITEMS TO CATEGORIZE:
${itemsList}

Return JSON with "items" array. Each item needs: id (exact match), category (use most specific subcategory code), confidence (0-1).
Common Slovak abbreviations: VK=wholesale, ICC=hair color code, kur=chicken, brav=pork, hov=beef, HRUD=lumpy (tvaroh)`,
      })

      return items.map((item) => {
        const aiResult = object.items.find((r) => r.id === item.id)
        const rawCategory = aiResult?.category || "OTHER_UNCATEGORIZED"
        const category = (
          validCategories.includes(rawCategory as any) ? rawCategory : "OTHER_UNCATEGORIZED"
        ) as CategoryCode
        const categoryInfo = getCategoryInfo(category)

        return {
          ...item,
          category,
          categoryName: categoryInfo.name,
          sector: categoryInfo.sector,
          sectorName: categoryInfo.sectorName,
          confidence: aiResult?.confidence || 0.5,
          reasoning: "",
          isManuallyEdited: false,
        }
      })
    } catch (error) {
      console.error(`[v0] AI batch ${batchIndex + 1}, attempt ${attempt + 1} failed:`, error)
      if (attempt === maxRetries) {
        return items.map((item) => {
          const categoryInfo = getCategoryInfo("OTHER_UNCATEGORIZED")
          return {
            ...item,
            category: "OTHER_UNCATEGORIZED" as CategoryCode,
            categoryName: categoryInfo.name,
            sector: categoryInfo.sector,
            sectorName: categoryInfo.sectorName,
            confidence: 0,
            reasoning: "",
            isManuallyEdited: false,
          }
        })
      }
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return items.map((item) => {
    const categoryInfo = getCategoryInfo("OTHER_UNCATEGORIZED")
    return {
      ...item,
      category: "OTHER_UNCATEGORIZED" as CategoryCode,
      categoryName: categoryInfo.name,
      sector: categoryInfo.sector,
      sectorName: categoryInfo.sectorName,
      confidence: 0,
      reasoning: "",
      isManuallyEdited: false,
    }
  })
}

export async function categorizeItems(items: ReceiptItem[], batchIndex?: number): Promise<CategorizedItem[]> {
  if (items.length === 0) return []
  return categorizeWithAI(items, batchIndex ?? 0, false)
}

export async function categorizeItemsBatch(items: ReceiptItem[], batchSize = 10): Promise<CategorizedItem[]> {
  console.log(`[v0] Starting hybrid categorization of ${items.length} items`)

  const preCategorized: CategorizedItem[] = []
  const needsAI: ReceiptItem[] = []

  for (const item of items) {
    const preResult = preCategorize(item)
    if (preResult && preResult.confidence >= 0.75) {
      const categoryInfo = getCategoryInfo(preResult.category)
      preCategorized.push({
        ...item,
        category: preResult.category,
        categoryName: categoryInfo.name,
        sector: categoryInfo.sector,
        sectorName: categoryInfo.sectorName,
        confidence: preResult.confidence,
        reasoning: "",
        isManuallyEdited: false,
      })
      console.log(`[v0] Pre-categorized "${item.name}" -> ${preResult.category} (${preResult.method})`)
    } else {
      needsAI.push(item)
    }
  }

  console.log(`[v0] Pre-categorized ${preCategorized.length} items, ${needsAI.length} need AI`)

  const aiResults: CategorizedItem[] = []
  if (needsAI.length > 0) {
    const batches: ReceiptItem[][] = []
    for (let i = 0; i < needsAI.length; i += batchSize) {
      batches.push(needsAI.slice(i, i + batchSize))
    }

    for (let i = 0; i < batches.length; i++) {
      const batchResult = await categorizeWithAI(batches[i], i, false)
      aiResults.push(...batchResult)
      console.log(`[v0] AI batch ${i + 1}/${batches.length} completed`)
    }
  }

  // Second pass with GPT-4o for uncategorized items
  const stillUncategorized = aiResults.filter((item) => item.category === "OTHER_UNCATEGORIZED")
  console.log(`[v0] ${stillUncategorized.length} items still uncategorized, running second pass with GPT-4o`)

  if (stillUncategorized.length > 0) {
    const secondPassBatches: ReceiptItem[][] = []
    for (let i = 0; i < stillUncategorized.length; i += 15) {
      secondPassBatches.push(
        stillUncategorized.slice(i, i + 15).map(({ id, name, price, quantity, vatRate, itemType, totalPrice }) => ({
          id,
          name,
          price,
          quantity,
          vatRate,
          itemType,
          totalPrice,
        })),
      )
    }

    for (let i = 0; i < secondPassBatches.length; i++) {
      const secondPassResults = await categorizeWithAI(secondPassBatches[i], i, true)

      for (const result of secondPassResults) {
        const index = aiResults.findIndex((item) => item.id === result.id)
        if (index !== -1 && result.category !== "OTHER_UNCATEGORIZED") {
          aiResults[index] = result
          console.log(`[v0] Second pass: "${result.name}" -> ${result.category}`)
        }
      }
    }
  }

  const allResults = [...preCategorized, ...aiResults]
  const resultMap = new Map(allResults.map((item) => [item.id, item]))
  const finalResults = items.map((item) => resultMap.get(item.id)!)

  const categorized = finalResults.filter((item) => item.category !== "OTHER_UNCATEGORIZED").length
  console.log(
    `[v0] Final: ${categorized}/${items.length} items categorized (${Math.round((100 * categorized) / items.length)}%)`,
  )

  return finalResults
}
