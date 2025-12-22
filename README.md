# Analyzátor Pokladničných Dokladov

Webová aplikácia na automatickú kategorizáciu položiek z eKasa pokladničných dokladov pomocou umelej inteligencie.

## Popis

Aplikácia umožňuje nahrať XML súbory z eKasa systému a automaticky kategorizuje jednotlivé položky do maloobchodných sektorov a kategórií. Využíva hybridný prístup s viacerými úrovňami kategorizácie pre maximálnu presnosť.

## Hlavné funkcie

- **Nahrávanie súborov** - Drag & drop alebo výber XML súborov z eKasa
- **Hybridná kategorizácia** - Trojúrovňový systém:
  1. Databáza značiek (100+ slovenských a medzinárodných značiek)
  2. Keyword matching s regex vzormi pre slovenské produkty
  3. AI kategorizácia s dvojpriechodovým spracovaním (GPT-4o-mini + GPT-4o pre ťažké prípady)
- **VAT-based hints** - Využitie slovenských sadzieb DPH pre presnejšiu kategorizáciu
- **Interaktívna tabuľka** - Prehľad položiek s možnosťou manuálnej úpravy kategórií
- **Štatistiky výkonu** - Priemerný čas kategorizácie, odhadované náklady na AI

## Štatistiky

Aplikácia zobrazuje nasledovné metriky:
- Počet položiek podľa sektorov a kategórií
- Priemerný čas kategorizácie na položku (ms)
- Odhadovaná cena za položku (€)
- Celkové náklady na AI

## Technológie

- Next.js 15 (App Router)
- Vercel AI SDK s podporou GPT-4o a GPT-4o-mini
- Tailwind CSS + shadcn/ui
- TypeScript + Zod validácia

## Štruktúra projektu

```
├── app/
│   ├── actions/          # Server actions (parsing, kategorization)
│   ├── api/              # API routes (streaming kategorization)
│   └── page.tsx          # Hlavná stránka
├── components/           # UI komponenty
│   ├── receipt-analyzer.tsx
│   ├── file-uploader.tsx
│   ├── items-table.tsx
│   ├── category-stats.tsx
│   └── batch-progress.tsx
└── lib/
    ├── parser.ts         # XML parser pre eKasa formát
    └── types.ts          # TypeScript typy, sektory a kategórie
```

## Hierarchická taxonómia

### Sektory (11)

| Kód | Názov | Popis |
|-----|-------|-------|
| FOOD | Potraviny | Všetky potravinové výrobky |
| BEVERAGES | Nápoje | Nealkoholické aj alkoholické nápoje |
| PERSONAL_CARE | Osobná starostlivosť | Kozmetika a hygiena |
| HOUSEHOLD | Domácnosť | Potreby pre domácnosť |
| FASHION | Móda | Oblečenie a obuv |
| ELECTRONICS | Elektronika | Elektronické zariadenia |
| SERVICES | Služby | Stravovacie a iné služby |
| AUTOMOTIVE | Auto-moto | Automobilové potreby |
| HEALTH | Zdravie | Lekáreň a zdravotné potreby |
| LEISURE | Voľný čas | Hračky, knihy a hobby |
| OTHER | Ostatné | Nezaradené položky |

### Kategórie (75+)

#### POTRAVINY (14 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| FOOD_DAIRY | Mliečne výrobky | Mlieko, syry, jogurty, maslo, tvaroh |
| FOOD_MEAT | Mäso a údeniny | Kuracie, bravčové, šunka, saláma |
| FOOD_BAKERY | Pečivo | Chlieb, rožky, koláče, torty |
| FOOD_FRUITS_VEG | Ovocie a zelenina | Jablká, banány, rajčiny, zemiaky |
| FOOD_FROZEN | Mrazené výrobky | Mrazené potraviny, zmrzlina |
| FOOD_CANNED | Konzervy | Tuniak, fazuľa, zaváraniny |
| FOOD_SNACKS | Slané pochutiny | Chipsy, krekry, oriešky |
| FOOD_SWEETS | Sladkosti | Čokoláda, cukríky, sušienky |
| FOOD_SPICES | Korenie a dochucovadlá | Korenie, kečup, horčica |
| FOOD_OILS | Oleje a tuky | Slnečnicový olej, olivový olej |
| FOOD_PASTA_RICE | Cestoviny a ryža | Špagety, ryža, múka |
| FOOD_BREAKFAST | Raňajky | Cereálie, müsli, džem |
| FOOD_BABY | Detská výživa | Dojčenská výživa, príkrmy |
| FOOD_OTHER | Ostatné potraviny | Iné potraviny |

#### NÁPOJE (9 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| BEV_SOFT_DRINKS | Nealkoholické nápoje | Cola, Fanta, Kofola |
| BEV_WATER | Vody | Minerálka, stolová voda |
| BEV_JUICE | Džúsy a šťavy | Pomarančový džús, jablková šťava |
| BEV_COFFEE_TEA | Káva a čaj | Káva, čaj, kakao |
| BEV_BEER | Pivo | Corgoň, Zlatý Bažant, Heineken |
| BEV_WINE | Víno | Červené, biele, šumivé |
| BEV_SPIRITS | Liehoviny | Whisky, vodka, rum, slivovica |
| BEV_ENERGY | Energetické nápoje | Red Bull, Monster |
| BEV_OTHER | Ostatné nápoje | Sirupy, mošty |

#### OSOBNÁ STAROSTLIVOSŤ (9 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| PERS_HAIR | Starostlivosť o vlasy | Šampóny, farby, laky |
| PERS_SKIN | Starostlivosť o pleť | Krémy, séra, masky |
| PERS_ORAL | Ústna hygiena | Zubné pasty, kefky |
| PERS_FRAGRANCE | Parfumy | Parfumy, toaletné vody |
| PERS_MAKEUP | Dekoratívna kozmetika | Rúže, očné tiene |
| PERS_HYGIENE | Osobná hygiena | Mydlá, sprchové gély |
| PERS_SHAVING | Holenie | Žiletky, pena na holenie |
| PERS_DEODORANT | Dezodoranty | Antiperspiranty, deo |
| PERS_OTHER | Ostatná kozmetika | Iné kozmetické výrobky |

#### DOMÁCNOSŤ (9 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| HOME_CLEANING | Čistiace prostriedky | Domestos, Ajax, CIF |
| HOME_LAUNDRY | Pranie | Pracie prášky, aviváže |
| HOME_PAPER | Papierové výrobky | Toaletný papier, utierky |
| HOME_KITCHEN | Kuchynské potreby | Riady, príbory, hrnce |
| HOME_STORAGE | Úložné potreby | Boxy, organizéry |
| HOME_DECOR | Dekorácie | Sviečky, vázy |
| HOME_GARDEN | Záhrada | Záhradné potreby |
| HOME_PETS | Chovateľské potreby | Krmivo pre zvieratá |
| HOME_OTHER | Ostatné dom. potreby | Iné potreby |

#### MÓDA (7 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| FASH_CLOTHING | Oblečenie | Tričká, nohavice, šaty |
| FASH_UNDERWEAR | Spodná bielizeň | Ponožky, spodné prádlo |
| FASH_FOOTWEAR | Obuv | Topánky, tenisky |
| FASH_ACCESSORIES | Doplnky | Opasky, kabelky |
| FASH_SPORTSWEAR | Športové oblečenie | Legíny, dresy |
| FASH_CHILDREN | Detské oblečenie | Detské odevy |
| FASH_OTHER | Ostatná móda | Iné módne výrobky |

#### ELEKTRONIKA (9 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| ELEC_PHONES | Telefóny | Mobily, príslušenstvo |
| ELEC_COMPUTERS | Počítače | Notebooky, tablety |
| ELEC_AUDIO | Audio | Slúchadlá, reproduktory |
| ELEC_TV | TV a video | Televízory |
| ELEC_BATTERIES | Batérie | Alkalické, lítiové |
| ELEC_CABLES | Káble a adaptéry | USB káble, nabíjačky |
| ELEC_APPLIANCES | Spotrebiče | Mixéry, kávovary |
| ELEC_LIGHTING | Osvetlenie | Žiarovky, LED |
| ELEC_OTHER | Ostatná elektronika | Iné zariadenia |

#### SLUŽBY (8 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| SERV_RESTAURANT | Reštaurácia | Obedy, večere, menu |
| SERV_CAFE | Kaviareň | Káva, zákusky |
| SERV_FASTFOOD | Rýchle občerstvenie | Pizza, burgre |
| SERV_DELIVERY | Donáška | Rozvoz jedla |
| SERV_PHOTO | Foto služby | Fotky, tlač |
| SERV_REPAIR | Opravy | Servis, opravy |
| SERV_BEAUTY | Kozmetické služby | Salón, wellness |
| SERV_OTHER | Ostatné služby | Iné služby |

#### AUTO-MOTO (6 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| AUTO_FUEL | Palivá | Benzín, nafta |
| AUTO_OIL | Oleje | Motorové oleje |
| AUTO_PARTS | Náhradné diely | Autosúčiastky |
| AUTO_ACCESSORIES | Príslušenstvo | Voňavky, doplnky |
| AUTO_WASH | Umývanie | Autoumyváreň |
| AUTO_OTHER | Ostatné auto | Iné potreby |

#### ZDRAVIE (5 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| HEALTH_PHARMACY | Lekáreň | Lieky, voľnopredajné |
| HEALTH_VITAMINS | Vitamíny | Vitamíny, doplnky |
| HEALTH_MEDICAL | Zdravotné potreby | Obväzy, teplomery |
| HEALTH_OPTICAL | Optika | Okuliare, šošovky |
| HEALTH_OTHER | Ostatné zdravie | Iné produkty |

#### VOĽNÝ ČAS (7 kategórií)
| Kód | Názov | Príklady |
|-----|-------|----------|
| LEIS_TOYS | Hračky | Hračky pre deti |
| LEIS_BOOKS | Knihy | Knihy, časopisy |
| LEIS_MUSIC | Hudba | CD, vinyl |
| LEIS_SPORTS | Šport | Športové potreby |
| LEIS_HOBBY | Hobby | Kreatívne potreby |
| LEIS_TRAVEL | Cestovanie | Batožina, mapy |
| LEIS_OTHER | Ostatný voľný čas | Iné potreby |

#### OSTATNÉ (3 kategórie)
| Kód | Názov | Príklady |
|-----|-------|----------|
| OTHER_DEPOSIT | Zálohy | Fľaškové zálohy |
| OTHER_PACKAGING | Obaly | Tašky, obaly |
| OTHER_UNCATEGORIZED | Nezaradené | Nerozpoznané položky |

## Algoritmus kategorizácie

1. **Fáza 1: Databáza značiek** - Okamžité rozpoznanie 100+ známych značiek
2. **Fáza 2: Keyword matching** - 50+ regex vzorcov pre slovenské produkty
3. **Fáza 3: VAT hints** - Využitie DPH sadzby ako indikátora kategórie
4. **Fáza 4: AI prvý priechod** - GPT-4o-mini pre zostávajúce položky
5. **Fáza 5: AI druhý priechod** - GPT-4o pre položky označené ako "OTHER"

## Použitie

1. Nahrajte XML súbor z eKasa systému (drag & drop alebo kliknutím)
2. Počkajte na automatickú kategorizáciu
3. Skontrolujte a upravte kategórie podľa potreby
4. Prezrite si štatistiky podľa sektorov a kategórií
