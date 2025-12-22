# Procesná Analýza Systému Automatickej Kategorizácie Pokladničných Dokladov

## 1. PREHĽAD SYSTÉMU

### 1.1 Účel a Cieľ
Systém predstavuje webovú analytickú platformu určenú na automatizované spracovanie a kategorizáciu položiek z pokladničných dokladov generovaných slovenským eKasa systémom. Primárnym cieľom je transformácia neštruktúrovaných alebo čiastočne štruktúrovaných dát z pokladničných dokladov do hierarchicky organizovanej taxonómie maloobchodných sektorov a produktových kategórií.

### 1.2 Vstupné Dátové Toky
Systém podporuje tri primárne vstupné kanály:

**Kanál A: Nahrávanie XML súborov**
- Používateľ importuje XML súbory obsahujúce SOAP správy z eKasa registračného protokolu
- Podporované sú viaceré XML namespace verzie (v2, ekasa, ns2)
- Jeden súbor môže obsahovať viacero pokladničných dokladov (receipts)

**Kanál B: QR kód skenovanie**
- Používateľ skenuje QR kód z fyzického pokladničného dokladu pomocou zariadenia s kamerou
- QR kód obsahuje Receipt ID v hexadecimálnom formáte
- Systém vykonáva synchronný HTTP POST request na verejné API slovenskej Finančnej správy
- Endpoint: https://ekasa.financnasprava.sk/mdu/api/v1/opd/receipt/find
- Odpoveď je JSON objekt obsahujúci kompletné informácie o doklade

**Kanál C: Vzorové datasety**
- Systém ponúka preddefinované vzorové súbory pre testovacie a demonštračné účely
- Vzorové súbory sú uložené v adresárovej štruktúre a načítané asynchronne

## 2. DÁTOVÝ MODEL A PARSOVANIE

### 2.1 Štruktúra eKasa Dokladu
Každý pokladničný doklad obsahuje nasledovné dátové entity:

**Hlavičkové metadáta:**
- Identifikátory pokladne (CashRegisterCode)
- Číslo dokladu (ReceiptNumber)
- Časové značky vytvorenia a vydania
- Daňové identifikátory predajcu (DIČ, IČO, IČ DPH)

**Finančné agregáty:**
- Celková suma transakcie (Amount)
- Daňové základy podľa sadzieb DPH (TaxBaseBasic, TaxBaseReduced)
- Výšky DPH podľa sadzieb (BasicVatAmount, ReducedVatAmount)
- Nezdaniteľné sumy (TaxFreeAmount)

**Položkové záznamy:**
Každý doklad obsahuje kolekciu položiek s atribútmi:
- Názov položky (Name) - primárny identifikátor pre kategorizáciu
- Jednotková cena (Price)
- Množstvo (Quantity)
- Sadzba DPH (VatRate) - 0%, 5%, 19%, alebo 23%
- Typ položky (ItemType) - K = štandardná položka

### 2.2 Parsing Pipeline

**Fáza 1: XML Deserializácia**
- Systém prijme XML string a identifikuje všetky prvky RegisterReceiptRequest alebo SendReceiptDataMessage
- Pre každý prvok extrahuje vnorený ReceiptData element
- Využíva regulárne výrazy pre robustné parsovacie správanie naprieč rôznymi XML namespace verziami

**Fáza 2: Položková Extrakcia**
- V rámci každého ReceiptData identifikuje všetky Item elementy
- Extrahuje atribúty pomocou regex pattern matchingu: Name, Price, Quantity, VatRate
- Transformuje string reprezentácie číselných hodnôt na floating-point formát
- Konvertuje percentuálnu sadzbu DPH na numerickú hodnotu

**Fáza 3: Štrukturálna Normalizácia**
- Vytvorenie normalizovaných objektov typu ReceiptItem pre každú položku
- Agregácia položiek do objektu ParsedReceipt reprezentujúceho kompletný doklad
- Validácia povinných polí a typová konverzia

## 3. HYBRIDNÝ KATEGORIZAČNÝ MOTOR

Systém využíva päťúrovňový kategorizačný pipeline s postupným zvyšovaním výpočtovej komplexity a presnosti.

### 3.1 Úroveň 1: Brand Database Lookup

**Princíp:**
Využíva preddefinovanú databázu obsahujúcu 100+ známych značiek a produktov s priamym mapovaním na kategórie.

**Technický proces:**
- Normalizácia vstupného názvu položky (lowercase, odstránenie diakritiky)
- Presné string matching proti kľúčom v brand databáze
- Okamžité priradenie kategórie pri zhode
- O(1) časová zložitosť vďaka hash-based lookup

**Príklady databázových záznamov:**
- "domestos" → HOUSEHOLD_CLEANING
- "rajo" → FOOD_DAIRY
- "zlatý bažant" → BEVERAGES_BEER
- "beckham" → PERSONAL_CARE_FRAGRANCE

### 3.2 Úroveň 2: Pattern-Based Keyword Matching

**Princíp:**
Aplikácia 50+ regulárnych výrazov zachytávajúcich slovenské produktové názvy a morfologické varianty.

**Technický proces:**
- Iterácia cez array keyword patterns
- Každý pattern obsahuje regex a cieľovú kategóriu
- Regex podporuje čiastočné zhody, plurály, skratky
- Prvá úspešná zhoda určuje kategóriu

**Príklady patterns:**
- `/\b(mliek|mliečn|jogurt|tvaroh|syr|maslo)\b/i` → FOOD_DAIRY
- `/\b(šunk|saláma|klobás|párok|bravčov|kurac)\b/i` → FOOD_MEAT
- `/\b(ponožk|tričk|nohavic|čiapk)\b/i` → FASHION_CLOTHING
- `/\b(káv|čaj|cappucin|espres)\b/i` → BEVERAGES_COFFEE_TEA

### 3.3 Úroveň 3: VAT-Based Inference

**Princíp:**
Využitie slovenskej legislatívy o sadzbách DPH ako heuristického indikátora produktovej kategórie.

**Logické pravidlá:**
- **DPH 0%** → Typicky zálohy na obaly → OTHER_DEPOSIT
- **DPH 5%** → Základné potraviny, knihy, lieky → FOOD alebo HEALTH
- **DPH 19%** → Štandardné tovary → FOOD_SNACKS, BEVERAGES
- **DPH 23%** → Luxusný tovar, alkohol, elektronika → BEVERAGES_SPIRITS, ELECTRONICS

**Implementácia:**
Ak položka nebola kategorizovaná v úrovniach 1-2, systém použije DPH ako fallback:
- Vytvorí confidence score basovaný na sadzbe
- Pridelí najvhodnejšiu kategóriu pre danú DPH sadzbu
- Označí položku pre ďalšie spracovanie v AI fázach

### 3.4 Úroveň 4: AI Kategorizácia - Prvý Priechod (GPT-4o-mini)

**Princíp:**
Využitie Large Language Model pre kontextuálne porozumenie slovenských produktových názvov.

**Technický workflow:**

**Krok 1: Batch Preparation**
- Položky nekategorizované v úrovniach 1-3 sa agregujú do dávok
- Veľkosť dávky: 10 položiek
- Minimalizácia API latency pri zachovaní presnosti

**Krok 2: Schema Definition**
- Využitie knižnice Zod pre definíciu očakávanej štruktúry odpovede
- Schema špecifikuje povinné polia: category, confidence
- Definícia enumerácie všetkých 75+ validných kategórii

**Krok 3: Prompt Engineering**
- Konštrukcia promptu v slovenskom jazyku s explicitnými inštrukciami
- Zahrnutie kompletnej taxonómie s príkladmi
- Poskytnutie kontextu: DPH sadzba, cena ako doplnkové signály
- Inštrukcia o konzervatívnom prístupe: "Ak neistota, použite OTHER"

**Krok 4: Parallel Batch Processing**
- Všetky dávky sa spracovávajú paralelne pomocou Promise.all
- Každá dávka generuje samostatný HTTP request na AI endpoint
- Využitie Vercel AI Gateway pre routing a cost optimization
- Model: gpt-4o-mini s teplotou 0.1 pre konzistentné výsledky

**Krok 5: Response Parsing & Validation**
- AI odpoveď je JSON objekt validovaný proti Zod schema
- Extrakcia category kódu a confidence score
- Normalizácia kategórie: mapovanie variantov na kanonické kódy
- Fallback mechanizmus pri parsovaní errors

**Krok 6: Sector Assignment**
- Po pridelení kategórie sa automaticky určí nadradený sektor
- Lookup v CATEGORIES mape: kategória → sektor kód
- Obohatenie položky o sectorName a sector pre hierarchickú štruktúru

### 3.5 Úroveň 5: AI Kategorizácia - Druhý Priechod (GPT-4o)

**Princíp:**
Pokročilá rekategorizácia položiek označených ako OTHER_UNCATEGORIZED pomocou výkonnejšieho modelu.

**Trigger podmienky:**
- Položka má category === "OTHER_UNCATEGORIZED" alebo "OTHER_UNKNOWN"
- Confidence score < 0.6 z prvého priechodu

**Technické rozdiely od prvého priechodu:**
- Model: gpt-4o (výkonnejší, vyššia cena)
- Batch size: 15 položiek (väčšia kontext window)
- Enhanced prompt: explicitné upozornenie na "ťažké prípady"
- Dodatočný kontext: informácia o zlyhaní prvého priechodu

**Paralelné spracovanie:**
- Podobne ako prvý priechod, dávky bežia súčasne
- Každá dávka reportuje progress cez Server-Sent Events
- Používateľ vidí real-time status spracovania

**Výsledok:**
- Položky získajú definitívnu kategóriu
- Typicky 60-80% úspešnosť zlepšenia z "OTHER" kategórie
- Zvyšné položky ostávajú ako OTHER_UNCATEGORIZED

## 4. STREAMING ARCHITEKTURA A REAL-TIME PROGRESS

### 4.1 Server-Sent Events (SSE) Protocol

**Účel:**
Umožniť unidirectional real-time komunikáciu zo servera ku klientovi počas dlhotrvajúceho kategorizačného procesu.

**Technická implementácia:**

**Server-side (API Route):**
- Endpoint: /api/categorize
- Content-Type: text/event-stream
- Keep-alive: áno
- Vytvorenie TransformStream pre progressívne odosielanie dát

**Event types:**
1. **batch-start** - Signalizácia začiatku spracovania dávky
   - Payload: {batchNumber, itemCount}
2. **batch-complete** - Dokončenie dávky
   - Payload: {batchNumber, duration, results[]}
3. **second-pass-batch-start** - Začiatok druhého priechodu
4. **second-pass-batch-complete** - Dokončenie druhého priechodu
5. **complete** - Finálny event s kompletným výsledkom

**Client-side (React Component):**
- Vytvorenie EventSource objektu pripájajúceho sa na endpoint
- Registrácia event listenerov pre každý event type
- Akumulácia parciálnych výsledkov v React state
- Progressive rendering tabuľky s položkami

### 4.2 Progress Visualization

**Batch Progress Cards:**
- Každá dávka má vlastnú kartu zobrazujúcu stav
- Stavy: waiting (šedá), processing (modrá s animáciou), complete (zelená)
- Zobrazenie času spracovania v milisekundách
- Mriežkové usporiadanie pre prehľadnosť

**Overall Progress Bar:**
- Lineárny indikátor celkového pokroku
- Výpočet: (dokončené položky / celkový počet) × 100%
- Dynamická aktualizácia pri dokončení každej dávky

## 5. VÝKONNOSTNÉ METRIKY A COST TRACKING

### 5.1 Time Metrics

**Meranie:**
- Použitie high-resolution časovača: performance.now()
- Merané intervaly:
  - Celkový čas kategorizácie
  - Čas pre jednotlivé dávky
  - Čas pre prvý vs. druhý priechod

**Kalkulácie:**
- Priemerný čas na položku = celkový čas / počet položiek
- Zobrazenie v milisekundách pre presnosť

### 5.2 Cost Estimation

**Princíp:**
Odhad nákladov na API volania k OpenAI službám basovaný na token consumption.

**Pricing model (GPT-4o-mini):**
- Input: $0.150 per 1M tokens
- Output: $0.600 per 1M tokens

**Estimation heuristika:**
- Priemerný input per položka: ~200 tokens (prompt + kontext)
- Priemerný output per položka: ~50 tokens (kategória + reasoning)
- Celkový cost = (input_tokens × input_price) + (output_tokens × output_price)

**Display:**
- Cena za položku v €
- Celkové náklady za všetky položky
- Konverzia USD → EUR podľa pevného kurzu

## 6. POUŽÍVATEĽSKÉ ROZHRANIE A INTERAKCIA

### 6.1 Theme System

**Dual Theme Support:**
Systém podporuje svetlý (light) a tmavý (dark) režim.

**Technická implementácia:**
- Využitie CSS custom properties (variables)
- Definícia farieb pre oba režimy v globals.css
- JavaScript toggle funkcia upravujúca data-theme atribút na root elemente
- Perzistencia výberu v localStorage pre session persistence

**Farby:**
- Light: biele pozadia, tmavé texty, jemné tiene
- Dark: tmavé pozadia (šedé odtiene), svetlé texty, glowing efekty

### 6.2 QR Code Scanner

**Workflow:**

**Krok 1: Camera Access**
- Používateľ klikne na scan button
- Systém vyžiada prístup k zariadeniu cez navigator.mediaDevices.getUserMedia
- Permission prompt od browsera

**Krok 2: Video Stream**
- Aktivácia kamery a zobrazenie live streamu v canvas elemente
- Frame rate: 60 FPS pre plynulé zobrazenie

**Krok 3: QR Detection Loop**
- Každých ~100ms sa extrahuje frame z video streamu
- Frame sa konvertuje na ImageData
- Aplikácia jsQR knižnice pre QR kód detekciu
- Binárna analýza pixelov, hľadanie QR pattern markers

**Krok 4: Data Extraction**
- Pri úspešnej detekcii extrakcia QR payload (Receipt ID string)
- Zastavenie video streamu a uvoľnenie kamery
- Automatické spustenie fetchReceiptById akcie

**Krok 5: API Call & Categorization**
- HTTP POST na Finančnú správu API
- Parsing JSON odpovede, extrakcia items array
- Automatické spustenie kategorizačného pipeline
- Presmerovanie na results view

### 6.3 Interactive Data Table

**Features:**

**Search & Filter:**
- Real-time textové vyhľadávanie v názvoch položiek
- Filter dropdown pre sektory (hierarchicky zoskupené)
- Filter dropdown pre kategórie (zoskupené pod sektor)
- Kombinácia filtrov (AND logika)

**Inline Editing:**
- Klik na kategóriu otvára dropdown
- Výber novej kategórie aktualizuje state
- Automatická aktualizácia sektora pri zmene kategórie
- Visual indicator pre manuálne upravené položky (badge)

**Confidence Display:**
- Farebné odznaky podľa confidence score:
  - Vysoká (>0.8): zelená
  - Stredná (0.6-0.8): žltá
  - Nízka (<0.6): červená

**Responsive Design:**
- Na mobile skrytie menej kritických stĺpcov (sektor)
- Horizontálny scroll pre tabuľku
- Stack layout pre filtre

### 6.4 Statistics Dashboard

**Hierarchické zobrazenie:**

**Sector Level:**
- Progress bar pre každý sektor
- Percentuálne zastúpenie položiek v sektore
- Počet položiek v sektore

**Category Level:**
- Pod každým sektorom zobrazenie sub-kategórií
- Progress bar relatívny k položkám v danom sektore
- Percentá sú kalkulované voči sektoru, nie celku

**Performance Metrics Cards:**
- Priemerný čas kategorizácie
- Cena za položku
- Celkové náklady
- Počet položiek kategorizovaných pravidlami vs. AI

## 7. DÁTOVÉ TOKY A STAVOVÝ MANAGEMENT

### 7.1 Client-Side State

**React State Management:**
Systém využíva React useState hooks pre správu lokálneho stavu:

**Main Application State:**
- uploadedReceipts: ParsedReceipt[] - kolekcia spracovaných dokladov
- categorizedItems: CategorizedItem[] - položky s priradenými kategóriami
- state: 'idle' | 'parsing' | 'categorizing' | 'complete' - workflow fáza

**UI State:**
- batchProgress: Map<number, BatchStatus> - status každej dávky
- secondPassInfo: SecondPassInfo - informácie o druhom priechode
- searchTerm: string - textové vyhľadávanie
- sectorFilter: string - vybraný sektor filter
- categoryFilter: string - vybraná kategória filter

### 7.2 Server Actions

**Next.js Server Actions:**
Server-side funkcie vykonávané na pozadí bez potreby API route definície.

**parseReceiptFile:**
- Input: File objekt
- Output: ParsedReceipt[]
- Async file reading, XML parsing, validácia

**fetchReceiptById:**
- Input: receiptId string
- Output: ParsedReceipt
- HTTP POST na external API, JSON parsing, normalizácia

**categorizeItemsBatch:**
- Input: ReceiptItem[], batchNumber
- Output: CategorizedItem[]
- Synchrónne spustenie kategorizačného pipeline

### 7.3 Data Flow Diagram

```
User Input (QR/File/Sample)
    ↓
Parser (XML/JSON → ReceiptItem[])
    ↓
API Route (/api/categorize)
    ↓
Hybrid Categorization Engine
    ├─ Brand DB → immediate category
    ├─ Keywords → pattern match
    ├─ VAT hints → fallback
    ├─ AI Pass 1 → GPT-4o-mini (parallel batches)
    └─ AI Pass 2 → GPT-4o (parallel batches)
    ↓
SSE Stream → Client
    ↓
React State Update
    ↓
UI Render (Table + Stats)
    ↓
User Review & Manual Edits
    ↓
Final Categorized Dataset
```

## 8. VALIDÁCIA A ERROR HANDLING

### 8.1 Zod Schema Validation

**Účel:**
Knižnica Zod poskytuje runtime type checking pre JavaScript/TypeScript, zabezpečujúc typovú bezpečnosť dát prechádzajúcich cez systém.

**Použitie v systéme:**

**AI Response Schema:**
- Definícia očakávanej štruktúry odpovede z LLM
- Povinné polia: category (enum), confidence (number 0-1)
- Automatické parsovanie a validácia JSON odpovede
- Throwing ValidationError pri nesúlade

**Receipt Item Schema:**
- Validácia extrahovaných položiek z XML
- Type coercion: string → number pre Price, Quantity, VatRate
- Validácia rozsahov: VatRate in [0, 5, 19, 23]

### 8.2 Error Recovery

**Parsing Errors:**
- Catch block pre XML parsing exceptions
- Logging chybových správ s kontextom
- Návrat prázdneho array namiesto crash

**AI API Errors:**
- Retry logika: až 2 opakovania pri zlyhaní
- Exponential backoff medzi pokusmi
- Fallback na keyword matching pri trvalých chybách

**Network Errors:**
- Timeout handling pre external API calls (Finančná správa)
- User-friendly error messages pri nedostupnosti služby
- Možnosť zopakovať operáciu

## 9. BEZPEČNOSŤ A PRIVACY

### 9.1 Data Protection

**Client-Side Processing:**
- Všetko parsing a validácia prebieha na serveri, nie v browseri
- Žiadne ukladanie súborov na disk
- In-memory processing s automatickým garbage collection

**API Keys:**
- OpenAI API key je stored v environment variables
- Never exposed to client
- Použitie Vercel AI Gateway pre additional security layer

### 9.2 External API Integration

**Finančná správa API:**
- Read-only access cez verejný endpoint
- Žiadna authentikácia required (verejné dáta)
- Rate limiting awareness: throttling pre hromadné requesty

## 10. OPTIMALIZÁCIE A BEST PRACTICES

### 10.1 Performance Optimizations

**Parallel Processing:**
- AI dávky bežia paralelne namiesto sekvenčne
- Zníženie celkového času o 60-70%

**Lazy Loading:**
- jsQR knižnica sa načítava len pri otvorení scannera
- Redukcia initial bundle size

**Memoization:**
- React useMemo pre drahé kalkulácie (sector stats)
- Prevencia zbytočných re-renderov

### 10.2 Code Organization

**Separation of Concerns:**
- Parser logic v lib/parser.ts
- Categorization v app/actions/categorize.ts
- UI components v components/
- Types centralizované v lib/types.ts

**Type Safety:**
- Strict TypeScript mode enabled
- Explicitné type annotations
- Žiadne 'any' types

**Modularity:**
- Každá úroveň kategorizácie je samostatná funkcia
- Ľahko pridávateľné nové pravidlá/značky
- Testovateľné izolované jednotky

## 11. BUDÚCE ROZŠÍRENIA

### 11.1 Možné Vylepšenia

**Machine Learning Feedback Loop:**
- Zber manuálnych opráv od používateľov
- Tréning custom ML modelu na slovenských dátach
- Postupné zvyšovanie presnosti bez AI API nákladov

**Multi-Language Support:**
- Rozšírenie pre české, poľské produkty
- Automatická detekcia jazyka
- Lokalizované kategórie

**Batch File Processing:**
- Upload multiple files naraz
- Paralelné parsovanie
- Aggregate statistics across files

**Export & Integration:**
- CSV export s kompletnou hierarchiou
- API endpoint pre integráciu s účtovnými systémami
- Webhook notifikácie po dokončení kategorizácie

### 11.2 Scalability Considerations

**Database Integration:**
- Aktuálne: in-memory processing
- Budúce: PostgreSQL pre perzistentné ukladanie
- Historické tracking zmien kategórií

**Caching Layer:**
- Redis cache pre často používané brand lookups
- Memoizácia AI odpovedí pre identické položky
- Redukcia API costs

**Horizontal Scaling:**
- Stateless design umožňuje load balancing
- Vercel Edge Functions pre global distribution
- CDN caching pre statické assets

---

**Verzia dokumentu:** 1.0  
**Dátum:** December 2024  
**Autor:** Process Analyst Team
