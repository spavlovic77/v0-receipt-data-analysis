// Receipt item from eKasa XML
export interface ReceiptItem {
  id: string
  name: string
  price: number
  quantity: number
  vatRate: number
  itemType: string
  totalPrice: number
}

export type SectorCode =
  | "FOOD"
  | "BEVERAGES"
  | "PERSONAL_CARE"
  | "HOUSEHOLD"
  | "FASHION"
  | "ELECTRONICS"
  | "SERVICES"
  | "AUTOMOTIVE"
  | "HEALTH"
  | "LEISURE"
  | "OTHER"

export type CategoryCode =
  // FOOD sector
  | "FOOD_DAIRY"
  | "FOOD_MEAT"
  | "FOOD_BAKERY"
  | "FOOD_FRUITS_VEG"
  | "FOOD_FROZEN"
  | "FOOD_CANNED"
  | "FOOD_SNACKS"
  | "FOOD_SWEETS"
  | "FOOD_SPICES"
  | "FOOD_OILS"
  | "FOOD_PASTA_RICE"
  | "FOOD_BREAKFAST"
  | "FOOD_BABY"
  | "FOOD_OTHER"
  // BEVERAGES sector
  | "BEV_SOFT_DRINKS"
  | "BEV_WATER"
  | "BEV_JUICE"
  | "BEV_COFFEE_TEA"
  | "BEV_BEER"
  | "BEV_WINE"
  | "BEV_SPIRITS"
  | "BEV_ENERGY"
  | "BEV_OTHER"
  // PERSONAL_CARE sector
  | "PERS_HAIR"
  | "PERS_SKIN"
  | "PERS_ORAL"
  | "PERS_FRAGRANCE"
  | "PERS_MAKEUP"
  | "PERS_HYGIENE"
  | "PERS_SHAVING"
  | "PERS_DEODORANT"
  | "PERS_OTHER"
  // HOUSEHOLD sector
  | "HOME_CLEANING"
  | "HOME_LAUNDRY"
  | "HOME_PAPER"
  | "HOME_KITCHEN"
  | "HOME_STORAGE"
  | "HOME_DECOR"
  | "HOME_GARDEN"
  | "HOME_PETS"
  | "HOME_OTHER"
  // FASHION sector
  | "FASH_CLOTHING"
  | "FASH_UNDERWEAR"
  | "FASH_FOOTWEAR"
  | "FASH_ACCESSORIES"
  | "FASH_SPORTSWEAR"
  | "FASH_CHILDREN"
  | "FASH_OTHER"
  // ELECTRONICS sector
  | "ELEC_PHONES"
  | "ELEC_COMPUTERS"
  | "ELEC_AUDIO"
  | "ELEC_TV"
  | "ELEC_BATTERIES"
  | "ELEC_CABLES"
  | "ELEC_APPLIANCES"
  | "ELEC_LIGHTING"
  | "ELEC_OTHER"
  // SERVICES sector
  | "SERV_RESTAURANT"
  | "SERV_CAFE"
  | "SERV_FASTFOOD"
  | "SERV_DELIVERY"
  | "SERV_PHOTO"
  | "SERV_REPAIR"
  | "SERV_BEAUTY"
  | "SERV_OTHER"
  // AUTOMOTIVE sector
  | "AUTO_FUEL"
  | "AUTO_OIL"
  | "AUTO_PARTS"
  | "AUTO_ACCESSORIES"
  | "AUTO_WASH"
  | "AUTO_OTHER"
  // HEALTH sector
  | "HEALTH_PHARMACY"
  | "HEALTH_VITAMINS"
  | "HEALTH_MEDICAL"
  | "HEALTH_OPTICAL"
  | "HEALTH_OTHER"
  // LEISURE sector
  | "LEIS_TOYS"
  | "LEIS_BOOKS"
  | "LEIS_MUSIC"
  | "LEIS_SPORTS"
  | "LEIS_HOBBY"
  | "LEIS_TRAVEL"
  | "LEIS_OTHER"
  // OTHER
  | "OTHER_DEPOSIT"
  | "OTHER_PACKAGING"
  | "OTHER_UNCATEGORIZED"

export interface SectorDefinition {
  code: SectorCode
  name: string
  description: string
}

export interface CategoryDefinition {
  code: CategoryCode
  sector: SectorCode
  name: string
  description: string
  keywords: string[]
  vatHints: number[]
}

export const SECTORS: SectorDefinition[] = [
  { code: "FOOD", name: "Potraviny", description: "Všetky potravinové výrobky" },
  { code: "BEVERAGES", name: "Nápoje", description: "Nealkoholické aj alkoholické nápoje" },
  { code: "PERSONAL_CARE", name: "Osobná starostlivosť", description: "Kozmetika a hygiena" },
  { code: "HOUSEHOLD", name: "Domácnosť", description: "Potreby pre domácnosť" },
  { code: "FASHION", name: "Móda", description: "Oblečenie a obuv" },
  { code: "ELECTRONICS", name: "Elektronika", description: "Elektronické zariadenia" },
  { code: "SERVICES", name: "Služby", description: "Stravovacie a iné služby" },
  { code: "AUTOMOTIVE", name: "Auto-moto", description: "Automobilové potreby" },
  { code: "HEALTH", name: "Zdravie", description: "Lekáreň a zdravotné potreby" },
  { code: "LEISURE", name: "Voľný čas", description: "Hračky, knihy a hobby" },
  { code: "OTHER", name: "Ostatné", description: "Nezaradené položky" },
]

export const CATEGORIES: CategoryDefinition[] = [
  // FOOD sector
  {
    code: "FOOD_DAIRY",
    sector: "FOOD",
    name: "Mliečne výrobky",
    description: "Mlieko, syry, jogurty, maslo",
    keywords: [
      "tvaroh",
      "mlieko",
      "maslo",
      "syr",
      "jogurt",
      "smotana",
      "bryndza",
      "parenica",
      "ostiepok",
      "syrok",
      "kefír",
      "acidko",
    ],
    vatHints: [5, 19],
  },
  {
    code: "FOOD_MEAT",
    sector: "FOOD",
    name: "Mäso a údeniny",
    description: "Čerstvé mäso, údeniny, hydina",
    keywords: [
      "kura",
      "brav",
      "hov",
      "mäso",
      "steak",
      "rezeň",
      "šunka",
      "saláma",
      "párok",
      "klobása",
      "slanina",
      "pečeň",
      "krídl",
      "stehno",
    ],
    vatHints: [5, 19],
  },
  {
    code: "FOOD_BAKERY",
    sector: "FOOD",
    name: "Pečivo",
    description: "Chlieb, rožky, koláče",
    keywords: [
      "chlieb",
      "rožok",
      "rohlík",
      "bageta",
      "croissant",
      "buchta",
      "koláč",
      "zákusok",
      "torta",
      "vianočka",
      "bábovka",
    ],
    vatHints: [5, 19],
  },
  {
    code: "FOOD_FRUITS_VEG",
    sector: "FOOD",
    name: "Ovocie a zelenina",
    description: "Čerstvé ovocie a zelenina",
    keywords: [
      "jablk",
      "hruška",
      "banán",
      "pomaranč",
      "citrón",
      "rajčin",
      "paprik",
      "uhorka",
      "kapusta",
      "mrkva",
      "zemiaky",
      "cibuľa",
      "cesnak",
      "šalát",
      "brokolica",
    ],
    vatHints: [5],
  },
  {
    code: "FOOD_FROZEN",
    sector: "FOOD",
    name: "Mrazené výrobky",
    description: "Mrazené potraviny a zmrzlina",
    keywords: ["mrazen", "zmrzlin", "nanuk", "frozen", "mrož", "ľad"],
    vatHints: [5, 19],
  },
  {
    code: "FOOD_CANNED",
    sector: "FOOD",
    name: "Konzervy",
    description: "Konzervované potraviny",
    keywords: ["konzerv", "tuniak", "fazuľa", "hrach", "kukurica", "paradajk", "zaváranin"],
    vatHints: [19],
  },
  {
    code: "FOOD_SNACKS",
    sector: "FOOD",
    name: "Slané pochutiny",
    description: "Chipsy, krekry, oriešky",
    keywords: [
      "chips",
      "čips",
      "krekr",
      "tyčink",
      "oriešk",
      "arašid",
      "slnečnic",
      "pringles",
      "lays",
      "chio",
      "bohemia",
      "tuc",
      "ritz",
      "nachos",
    ],
    vatHints: [19],
  },
  {
    code: "FOOD_SWEETS",
    sector: "FOOD",
    name: "Sladkosti",
    description: "Čokoláda, cukríky, sušienky",
    keywords: [
      "čokolád",
      "bonbón",
      "cukrík",
      "sušienk",
      "keks",
      "lentilk",
      "milka",
      "orion",
      "merci",
      "kinder",
      "haribo",
      "mentos",
      "gumov",
      "žuvač",
      "orbit",
    ],
    vatHints: [19],
  },
  {
    code: "FOOD_SPICES",
    sector: "FOOD",
    name: "Korenie a dochucovadlá",
    description: "Korenie, soľ, kečup, horčica",
    keywords: ["koren", "soľ", "kečup", "horčic", "majonéz", "omáčk", "ocot", "oliv", "kapary"],
    vatHints: [19],
  },
  {
    code: "FOOD_OILS",
    sector: "FOOD",
    name: "Oleje a tuky",
    description: "Rastlinné oleje a tuky",
    keywords: ["olej", "slnečnic", "olivov", "repkov", "margarín", "mast", "tuk"],
    vatHints: [19],
  },
  {
    code: "FOOD_PASTA_RICE",
    sector: "FOOD",
    name: "Cestoviny a ryža",
    description: "Cestoviny, ryža, múka",
    keywords: ["cestoviny", "špagety", "makarón", "ryža", "múka", "krúpy", "pohánk", "ovsené", "vločk"],
    vatHints: [19],
  },
  {
    code: "FOOD_BREAKFAST",
    sector: "FOOD",
    name: "Raňajky",
    description: "Cereálie, müsli, džem",
    keywords: ["cereál", "müsli", "granola", "džem", "med", "nutella", "nátierka", "corn flakes"],
    vatHints: [19],
  },
  {
    code: "FOOD_BABY",
    sector: "FOOD",
    name: "Detská výživa",
    description: "Dojčenská výživa a príkrmy",
    keywords: ["detská", "dojčen", "príkrm", "hipp", "bebivita", "sunar", "nutrilon", "aptamil"],
    vatHints: [5],
  },
  {
    code: "FOOD_OTHER",
    sector: "FOOD",
    name: "Ostatné potraviny",
    description: "Iné potraviny",
    keywords: [],
    vatHints: [5, 19],
  },

  // BEVERAGES sector
  {
    code: "BEV_SOFT_DRINKS",
    sector: "BEVERAGES",
    name: "Nealkoholické nápoje",
    description: "Cola, limonády, sýtené nápoje",
    keywords: ["cola", "pepsi", "fanta", "sprite", "kofola", "vinea", "limonád", "sýten", "7up", "schweppes", "tonic"],
    vatHints: [19],
  },
  {
    code: "BEV_WATER",
    sector: "BEVERAGES",
    name: "Vody",
    description: "Minerálne a stolové vody",
    keywords: ["voda", "mineral", "rajec", "budiš", "šariš", "mattoni", "bonaqua", "perlivá", "neperlivá", "stolová"],
    vatHints: [19],
  },
  {
    code: "BEV_JUICE",
    sector: "BEVERAGES",
    name: "Džúsy a šťavy",
    description: "Ovocné džúsy a nektáre",
    keywords: ["džús", "juice", "šťava", "nektár", "smoothie", "ovocn", "pomaranč", "jablk", "multivitamín"],
    vatHints: [19],
  },
  {
    code: "BEV_COFFEE_TEA",
    sector: "BEVERAGES",
    name: "Káva a čaj",
    description: "Káva, čaj, kakao",
    keywords: [
      "káva",
      "coffee",
      "čaj",
      "tea",
      "kakao",
      "nescafe",
      "jacobs",
      "tchibo",
      "lipton",
      "pickwick",
      "espresso",
      "cappuccino",
      "latte",
    ],
    vatHints: [19],
  },
  {
    code: "BEV_BEER",
    sector: "BEVERAGES",
    name: "Pivo",
    description: "Pivo a pivné nápoje",
    keywords: [
      "pivo",
      "beer",
      "corgon",
      "zlatý bažant",
      "šariš",
      "smädný mních",
      "heineken",
      "pilsner",
      "kozel",
      "budweiser",
      "radler",
      "ležiak",
    ],
    vatHints: [23],
  },
  {
    code: "BEV_WINE",
    sector: "BEVERAGES",
    name: "Víno",
    description: "Víno a šumivé víno",
    keywords: [
      "víno",
      "wine",
      "červen",
      "biele",
      "ružov",
      "sekt",
      "šampan",
      "prosecco",
      "rizling",
      "frankovka",
      "cabernet",
      "chardonnay",
    ],
    vatHints: [23],
  },
  {
    code: "BEV_SPIRITS",
    sector: "BEVERAGES",
    name: "Liehoviny",
    description: "Destiláty a likéry",
    keywords: [
      "whisky",
      "vodka",
      "rum",
      "gin",
      "likér",
      "brandy",
      "koňak",
      "slivovica",
      "hruškov",
      "borovičk",
      "tequila",
      "jäger",
    ],
    vatHints: [23],
  },
  {
    code: "BEV_ENERGY",
    sector: "BEVERAGES",
    name: "Energetické nápoje",
    description: "Energy drinky",
    keywords: ["energy", "redbull", "monster", "rockstar", "burn", "tiger", "energetick"],
    vatHints: [19, 23],
  },
  {
    code: "BEV_OTHER",
    sector: "BEVERAGES",
    name: "Ostatné nápoje",
    description: "Iné nápoje",
    keywords: ["nápoj", "drink", "sirup", "mošt"],
    vatHints: [19],
  },

  // PERSONAL_CARE sector
  {
    code: "PERS_HAIR",
    sector: "PERSONAL_CARE",
    name: "Starostlivosť o vlasy",
    description: "Šampóny, kondicionéry, farby",
    keywords: [
      "šampón",
      "kondicion",
      "vlasy",
      "farba",
      "palette",
      "syoss",
      "head",
      "pantene",
      "loreal",
      "garnier",
      "lak",
      "gél",
      "vosk",
      "icc",
    ],
    vatHints: [23],
  },
  {
    code: "PERS_SKIN",
    sector: "PERSONAL_CARE",
    name: "Starostlivosť o pleť",
    description: "Krémy, čistenie pleti",
    keywords: ["krém", "pleť", "tvár", "sérum", "mask", "peeling", "nivea", "garnier", "loreal", "hydrat", "čistic"],
    vatHints: [23],
  },
  {
    code: "PERS_ORAL",
    sector: "PERSONAL_CARE",
    name: "Ústna hygiena",
    description: "Zubné pasty, kefky, ústne vody",
    keywords: [
      "zubn",
      "pasta",
      "kefka",
      "ústn",
      "voda",
      "colgate",
      "oral-b",
      "sensodyne",
      "elmex",
      "listerine",
      "parodontax",
    ],
    vatHints: [23],
  },
  {
    code: "PERS_FRAGRANCE",
    sector: "PERSONAL_CARE",
    name: "Parfumy",
    description: "Parfumy a toaletné vody",
    keywords: [
      "parfém",
      "parfum",
      "toaletn",
      "edt",
      "edp",
      "beckham",
      "la rive",
      "adidas",
      "bruno banani",
      "vôňa",
      "fragrance",
    ],
    vatHints: [23],
  },
  {
    code: "PERS_MAKEUP",
    sector: "PERSONAL_CARE",
    name: "Dekoratívna kozmetika",
    description: "Rúže, očné tiene, laky",
    keywords: ["rúž", "očné", "tiene", "riasenak", "lak", "necht", "make-up", "púder", "korektor", "maskara", "rtěnka"],
    vatHints: [23],
  },
  {
    code: "PERS_HYGIENE",
    sector: "PERSONAL_CARE",
    name: "Osobná hygiena",
    description: "Mydlá, sprchové gély, vlhčené obrúsky",
    keywords: [
      "mydlo",
      "sprchov",
      "gél",
      "telové",
      "vlhčen",
      "obrúsk",
      "intímn",
      "dámsk",
      "hygien",
      "fa ",
      "dove",
      "palmolive",
    ],
    vatHints: [23],
  },
  {
    code: "PERS_SHAVING",
    sector: "PERSONAL_CARE",
    name: "Holenie",
    description: "Holiace potreby",
    keywords: ["holi", "žilet", "britvica", "pena", "gél", "after", "shave", "gillette", "wilkinson"],
    vatHints: [23],
  },
  {
    code: "PERS_DEODORANT",
    sector: "PERSONAL_CARE",
    name: "Dezodoranty",
    description: "Antiperspiranty a dezodoranty",
    keywords: ["deo", "dezodor", "antiperspir", "rexona", "axe", "adidas", "dove", "nivea"],
    vatHints: [23],
  },
  {
    code: "PERS_OTHER",
    sector: "PERSONAL_CARE",
    name: "Ostatná kozmetika",
    description: "Iné kozmetické výrobky",
    keywords: [],
    vatHints: [23],
  },

  // HOUSEHOLD sector
  {
    code: "HOME_CLEANING",
    sector: "HOUSEHOLD",
    name: "Čistiace prostriedky",
    description: "Čističe, dezinfekcia",
    keywords: ["čisti", "dezinfek", "domestos", "ajax", "cif", "cillit", "bref", "wc", "sanit", "odstraň", "príprav"],
    vatHints: [23],
  },
  {
    code: "HOME_LAUNDRY",
    sector: "HOUSEHOLD",
    name: "Pranie",
    description: "Pracie prášky, aviváže",
    keywords: ["prací", "prášok", "aviváž", "bieli", "persil", "ariel", "lenor", "vanish", "savo", "gél", "kapsul"],
    vatHints: [23],
  },
  {
    code: "HOME_PAPER",
    sector: "HOUSEHOLD",
    name: "Papierové výrobky",
    description: "Toaletný papier, utierky",
    keywords: ["papier", "toalet", "utier", "servít", "vreckov", "tašk", "ziga", "tento", "kleenex"],
    vatHints: [23],
  },
  {
    code: "HOME_KITCHEN",
    sector: "HOUSEHOLD",
    name: "Kuchynské potreby",
    description: "Riady, príbory, hrnce",
    keywords: ["riad", "príbor", "hrniec", "panvic", "nôž", "lyžic", "vidlič", "misky", "tanier", "pohár", "fľaš"],
    vatHints: [23],
  },
  {
    code: "HOME_STORAGE",
    sector: "HOUSEHOLD",
    name: "Úložné potreby",
    description: "Krabice, boxy, organizéry",
    keywords: ["úlož", "box", "krabic", "organiz", "plast", "vedro", "kôš", "vreck", "sáčok"],
    vatHints: [23],
  },
  {
    code: "HOME_DECOR",
    sector: "HOUSEHOLD",
    name: "Dekorácie",
    description: "Sviečky, vázy, dekorácie",
    keywords: ["dekorác", "sviečk", "váz", "kvet", "umelý", "rámik", "obraz", "vianoc", "veľkonoc"],
    vatHints: [23],
  },
  {
    code: "HOME_GARDEN",
    sector: "HOUSEHOLD",
    name: "Záhrada",
    description: "Záhradné potreby",
    keywords: ["záhrad", "kvet", "hlina", "hnojivo", "semien", "rastlin", "nárad", "hadica"],
    vatHints: [23],
  },
  {
    code: "HOME_PETS",
    sector: "HOUSEHOLD",
    name: "Chovateľské potreby",
    description: "Krmivo a potreby pre zvieratá",
    keywords: ["krmiv", "granul", "mačk", "pes", "psík", "zviera", "akvárium", "vtáč", "podstielk"],
    vatHints: [23],
  },
  {
    code: "HOME_OTHER",
    sector: "HOUSEHOLD",
    name: "Ostatné dom. potreby",
    description: "Iné potreby pre domácnosť",
    keywords: [],
    vatHints: [23],
  },

  // FASHION sector
  {
    code: "FASH_CLOTHING",
    sector: "FASHION",
    name: "Oblečenie",
    description: "Tričká, nohavice, šaty",
    keywords: [
      "trič",
      "košeľ",
      "nohavic",
      "džíns",
      "sukň",
      "šaty",
      "bund",
      "kabát",
      "sveter",
      "mikina",
      "sako",
      "vesta",
    ],
    vatHints: [23],
  },
  {
    code: "FASH_UNDERWEAR",
    sector: "FASHION",
    name: "Spodná bielizeň",
    description: "Spodné prádlo, ponožky",
    keywords: [
      "ponožk",
      "sock",
      "spodná",
      "tangá",
      "slip",
      "boxerk",
      "podprsenk",
      "pančuch",
      "silonk",
      "bieliz",
      "pyžam",
    ],
    vatHints: [23],
  },
  {
    code: "FASH_FOOTWEAR",
    sector: "FASHION",
    name: "Obuv",
    description: "Topánky, tenisky, sandále",
    keywords: ["obuv", "topánk", "tenisky", "sandál", "šľapk", "papuč", "čižm", "mokasín", "lodičk", "poltopánk"],
    vatHints: [23],
  },
  {
    code: "FASH_ACCESSORIES",
    sector: "FASHION",
    name: "Doplnky",
    description: "Opasky, kabelky, šatky",
    keywords: ["opasok", "kabelk", "peňaženk", "ruksak", "batoh", "šatka", "šál", "hodinky", "bižutér", "okuliare"],
    vatHints: [23],
  },
  {
    code: "FASH_SPORTSWEAR",
    sector: "FASHION",
    name: "Športové oblečenie",
    description: "Športové odevy a doplnky",
    keywords: ["šport", "fitness", "legín", "dres", "tepláky", "funkčn", "kompres"],
    vatHints: [23],
  },
  {
    code: "FASH_CHILDREN",
    sector: "FASHION",
    name: "Detské oblečenie",
    description: "Oblečenie pre deti",
    keywords: ["detsk", "bábätk", "kojeneck", "dievčensk", "chlapčensk"],
    vatHints: [23],
  },
  {
    code: "FASH_OTHER",
    sector: "FASHION",
    name: "Ostatná móda",
    description: "Iné módne výrobky",
    keywords: ["vk ", "dám.", "pán.", "det."],
    vatHints: [23],
  },

  // ELECTRONICS sector
  {
    code: "ELEC_PHONES",
    sector: "ELECTRONICS",
    name: "Telefóny",
    description: "Mobily a príslušenstvo",
    keywords: ["telefón", "mobil", "smartph", "iphone", "samsung", "xiaomi", "puzdro", "obal", "fólia"],
    vatHints: [23],
  },
  {
    code: "ELEC_COMPUTERS",
    sector: "ELECTRONICS",
    name: "Počítače",
    description: "PC, notebooky, tablety",
    keywords: ["počítač", "notebook", "laptop", "tablet", "klávesnic", "myš", "monitor", "usb", "flash"],
    vatHints: [23],
  },
  {
    code: "ELEC_AUDIO",
    sector: "ELECTRONICS",
    name: "Audio",
    description: "Slúchadlá, reproduktory",
    keywords: ["slúchad", "reprodukt", "reprak", "bluetooth", "bezdrôt", "earbuds", "airpods"],
    vatHints: [23],
  },
  {
    code: "ELEC_TV",
    sector: "ELECTRONICS",
    name: "TV a video",
    description: "Televízory, prehrávače",
    keywords: ["televíz", "tv", "prehrávač", "dvd", "hdmi", "projektor"],
    vatHints: [23],
  },
  {
    code: "ELEC_BATTERIES",
    sector: "ELECTRONICS",
    name: "Batérie",
    description: "Batérie a akumulátory",
    keywords: ["batéri", "akumulát", "nabíjat", "alkalic", "lítiov", "power bank"],
    vatHints: [23],
  },
  {
    code: "ELEC_CABLES",
    sector: "ELECTRONICS",
    name: "Káble a adaptéry",
    description: "Káble, adaptéry, nabíjačky",
    keywords: ["kábel", "cable", "adaptér", "nabíjač", "charger", "redukci", "lightning", "type-c"],
    vatHints: [23],
  },
  {
    code: "ELEC_APPLIANCES",
    sector: "ELECTRONICS",
    name: "Spotrebiče",
    description: "Malé domáce spotrebiče",
    keywords: ["spotreb", "mixér", "varič", "rýchl", "hriankovač", "kávovar", "féntartalom"],
    vatHints: [23],
  },
  {
    code: "ELEC_LIGHTING",
    sector: "ELECTRONICS",
    name: "Osvetlenie",
    description: "Žiarovky, lampy",
    keywords: ["žiarovk", "led", "svetlo", "lampa", "svietidl", "baterka"],
    vatHints: [23],
  },
  {
    code: "ELEC_OTHER",
    sector: "ELECTRONICS",
    name: "Ostatná elektronika",
    description: "Iné elektronické výrobky",
    keywords: [],
    vatHints: [23],
  },

  // SERVICES sector
  {
    code: "SERV_RESTAURANT",
    sector: "SERVICES",
    name: "Reštaurácia",
    description: "Hlavné jedlá, menu",
    keywords: ["menu", "obed", "večera", "jedlo", "porcia", "príloha", "polievk", "reštaurácia", "rezeň", "steak"],
    vatHints: [5],
  },
  {
    code: "SERV_CAFE",
    sector: "SERVICES",
    name: "Kaviareň",
    description: "Káva, zákusky",
    keywords: ["kaviareň", "café", "espresso", "cappuccino", "latte", "zákusok", "torta", "koláč", "dezert"],
    vatHints: [5, 19],
  },
  {
    code: "SERV_FASTFOOD",
    sector: "SERVICES",
    name: "Rýchle občerstvenie",
    description: "Fast food, pizza, burger",
    keywords: ["pizza", "burger", "sendvič", "wrap", "kebab", "hot dog", "fastfood", "mcdonalds", "kfc", "subway"],
    vatHints: [5],
  },
  {
    code: "SERV_DELIVERY",
    sector: "SERVICES",
    name: "Rozvoz jedla",
    description: "Donáška, balené jedlá",
    keywords: ["donáška", "rozvoz", "delivery", "balené", "takeaway", "sebou"],
    vatHints: [5],
  },
  {
    code: "SERV_PHOTO",
    sector: "SERVICES",
    name: "Foto a tlač",
    description: "Fotoslužby, kopírovanie",
    keywords: ["foto", "print", "tlač", "kópia", "kopírov", "scan"],
    vatHints: [23],
  },
  {
    code: "SERV_REPAIR",
    sector: "SERVICES",
    name: "Opravy",
    description: "Opravy a servis",
    keywords: ["oprava", "servis", "výmena", "inštalác"],
    vatHints: [23],
  },
  {
    code: "SERV_BEAUTY",
    sector: "SERVICES",
    name: "Kozmetické služby",
    description: "Kadernícvo, manikúra",
    description: "Kadernícvo, manikúra",
    keywords: ["kaderníc", "strihan", "manikúra", "pedikúra", "solárium", "masáž"],
    vatHints: [23],
  },
  {
    code: "SERV_OTHER",
    sector: "SERVICES",
    name: "Ostatné služby",
    description: "Iné služby",
    keywords: [],
    vatHints: [5, 23],
  },

  // AUTOMOTIVE sector
  {
    code: "AUTO_FUEL",
    sector: "AUTOMOTIVE",
    name: "Pohonné hmoty",
    description: "Benzín, nafta, LPG",
    keywords: ["diesel", "benzín", "nafta", "paliv", "lpg", "natural", "95", "98", "phm"],
    vatHints: [23],
  },
  {
    code: "AUTO_OIL",
    sector: "AUTOMOTIVE",
    name: "Oleje a mazivá",
    description: "Motorové oleje, mazivá",
    keywords: ["olej", "motor", "mazivo", "castrol", "mobil", "shell", "prevodov"],
    vatHints: [23],
  },
  {
    code: "AUTO_PARTS",
    sector: "AUTOMOTIVE",
    name: "Náhradné diely",
    description: "Autodielce, filtry",
    keywords: ["filter", "brzdy", "sviečk", "remeň", "tlmič", "výfuk", "spojka"],
    vatHints: [23],
  },
  {
    code: "AUTO_ACCESSORIES",
    sector: "AUTOMOTIVE",
    name: "Príslušenstvo",
    description: "Autokozmetika, doplnky",
    keywords: ["autokozm", "vôňa", "stojan", "držiak", "guma", "stierač", "koberce"],
    vatHints: [23],
  },
  {
    code: "AUTO_WASH",
    sector: "AUTOMOTIVE",
    name: "Umývanie auta",
    description: "Autoumyváreň, prostriedky",
    keywords: ["umýv", "autoum", "šampón", "vosk", "leštid"],
    vatHints: [23],
  },
  {
    code: "AUTO_OTHER",
    sector: "AUTOMOTIVE",
    name: "Ostatné auto",
    description: "Iné automobilové výrobky",
    keywords: [],
    vatHints: [23],
  },

  // HEALTH sector
  {
    code: "HEALTH_PHARMACY",
    sector: "HEALTH",
    name: "Lieky",
    description: "Voľnopredajné lieky",
    keywords: ["liek", "tablet", "kapsul", "sirup", "kvapky", "masť", "paralen", "ibalgin", "aspirin", "mucosolvan"],
    vatHints: [5],
  },
  {
    code: "HEALTH_VITAMINS",
    sector: "HEALTH",
    name: "Vitamíny a doplnky",
    description: "Vitamíny, minerály, doplnky výživy",
    keywords: [
      "vitamin",
      "doplnok",
      "minerál",
      "magnézi",
      "zinok",
      "vápnik",
      "omega",
      "magnosolv",
      "centrum",
      "supradyn",
    ],
    vatHints: [5],
  },
  {
    code: "HEALTH_MEDICAL",
    sector: "HEALTH",
    name: "Zdravotnícke potreby",
    description: "Obväzy, náplaste, teplomery",
    keywords: ["obväz", "náplast", "teplomer", "bandáž", "injekc", "strieka", "dezinfek", "zdravot"],
    vatHints: [5, 23],
  },
  {
    code: "HEALTH_OPTICAL",
    sector: "HEALTH",
    name: "Optika",
    description: "Okuliare, kontaktné šošovky",
    keywords: ["okuliar", "šošovk", "dioptr", "kontaktn", "optik", "rozotk"],
    vatHints: [23],
  },
  {
    code: "HEALTH_OTHER",
    sector: "HEALTH",
    name: "Ostatné zdravie",
    description: "Iné zdravotné výrobky",
    keywords: [],
    vatHints: [5],
  },

  // LEISURE sector
  {
    code: "LEIS_TOYS",
    sector: "LEISURE",
    name: "Hračky",
    description: "Hračky pre deti",
    keywords: ["hračk", "lego", "bábik", "autíčk", "lopta", "puzzle", "stavebnic", "plyšov", "panenk"],
    vatHints: [23],
  },
  {
    code: "LEIS_BOOKS",
    sector: "LEISURE",
    name: "Knihy a časopisy",
    description: "Knihy, časopisy, noviny",
    keywords: ["kniha", "časopis", "noviny", "roman", "detektív", "komiks", "učebnic", "slovník"],
    vatHints: [5],
  },
  {
    code: "LEIS_MUSIC",
    sector: "LEISURE",
    name: "Hudba a filmy",
    description: "CD, DVD, vinyl",
    keywords: ["cd", "dvd", "vinyl", "hudba", "film", "blu-ray"],
    vatHints: [23],
  },
  {
    code: "LEIS_SPORTS",
    sector: "LEISURE",
    name: "Športové potreby",
    description: "Športové vybavenie",
    keywords: ["šport", "lopta", "raketa", "korčul", "lyž", "bicyk", "čink", "fitness"],
    vatHints: [23],
  },
  {
    code: "LEIS_HOBBY",
    sector: "LEISURE",
    name: "Hobby a remeslá",
    description: "Kreatívne potreby, DIY",
    keywords: ["kresli", "farby", "pastelk", "fixer", "výtvarn", "pletac", "šijac", "modelár"],
    vatHints: [23],
  },
  {
    code: "LEIS_TRAVEL",
    sector: "LEISURE",
    name: "Cestovanie",
    description: "Cestovné potreby, batožina",
    keywords: ["kufor", "batožin", "cestovn", "vak", "spacák", "stan", "mapa"],
    vatHints: [23],
  },
  {
    code: "LEIS_OTHER",
    sector: "LEISURE",
    name: "Ostatný voľný čas",
    description: "Iné voľnočasové výrobky",
    keywords: [],
    vatHints: [23],
  },

  // OTHER sector
  {
    code: "OTHER_DEPOSIT",
    sector: "OTHER",
    name: "Zálohy",
    description: "Vratné zálohy na obaly",
    keywords: ["záloha", "deposit", "vratná", "fľaša", "plechovka"],
    vatHints: [0],
  },
  {
    code: "OTHER_PACKAGING",
    sector: "OTHER",
    name: "Obaly",
    description: "Obaly a tašky",
    keywords: ["obal", "taška", "sáčok", "igelit", "papier"],
    vatHints: [23],
  },
  {
    code: "OTHER_UNCATEGORIZED",
    sector: "OTHER",
    name: "Nezaradené",
    description: "Položky bez kategórie",
    keywords: [],
    vatHints: [],
  },
]

// Helper to get category by code
export function getCategoryByCode(code: CategoryCode): CategoryDefinition | undefined {
  return CATEGORIES.find((c) => c.code === code)
}

// Helper to get sector by code
export function getSectorByCode(code: SectorCode): SectorDefinition | undefined {
  return SECTORS.find((s) => s.code === code)
}

// Helper to get all categories for a sector
export function getCategoriesBySector(sectorCode: SectorCode): CategoryDefinition[] {
  return CATEGORIES.filter((c) => c.sector === sectorCode)
}

// Categorized item with AI-assigned category
export interface CategorizedItem extends ReceiptItem {
  category: CategoryCode
  categoryName: string
  sector: SectorCode
  sectorName: string
  confidence: number
  reasoning: string
  isManuallyEdited: boolean
}

// Parsed receipt with metadata
export interface ParsedReceipt {
  id: string
  receiptNumber?: string
  cashRegisterCode?: string
  timestamp: Date
  items: ReceiptItem[]
  totalAmount: number
  vatSummary: { rate: number; amount: number }[]
}

// Export format
export interface ExportData {
  generatedAt: string
  totalItems: number
  categorySummary: {
    category: CategoryCode
    categoryName: string
    sector: SectorCode
    sectorName: string
    itemCount: number
    totalValue: number
  }[]
  items: CategorizedItem[]
}
