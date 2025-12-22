# API Dokumentácia - Verifikácia Dokladov

## Verifikačné API

External systémy môžu overiť autenticitu naskenovaného dokladu pomocou tohto API endpointu.

### Endpoint

```
POST /api/verify-receipt
```

### Request Body

```json
{
  "receiptId": "0-ABC123...",
  "messageHash": "0x1234567890abcdef..."
}
```

### Parametre

- `receiptId` (string, povinné) - ID dokladu z eKasa systému
- `messageHash` (string, povinné) - Keccak256 hash správy vo formáte: `keccak256(receiptId:name:surname:birthNumber:dic)`

**DÔLEŽITÉ**: Osobné údaje (meno, priezvisko, rodné číslo) sa NIKDY neposielajú cez API v čistom texte. External systém musí:
1. Mať k dispozícii všetky údaje lokálne
2. Vytvoriť správu vo formáte: `receiptId:name:surname:birthNumber:dic`
3. Vypočítať keccak256 hash tejto správy
4. Poslať len `receiptId` a `messageHash`

### Príklad vytvorenia messageHash (JavaScript/Node.js)

```javascript
import { ethers } from 'ethers'

// Údaje ktoré má external systém lokálne
const receiptId = "0-ABC123..."
const name = "Adam"
const surname = "Smith"
const birthNumber = "7711097383"
const dic = "2120726927"

// Vytvorenie správy
const message = `${receiptId}:${name}:${surname}:${birthNumber}:${dic}`

// Vypočítanie hash
const messageHash = ethers.id(message) // keccak256 hash
console.log(messageHash) // "0x1234567890abcdef..."

// Poslanie na API
fetch('/api/verify-receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ receiptId, messageHash })
})
```

### Response - Úspešná verifikácia

```json
{
  "valid": true,
  "receiptId": "0-ABC123...",
  "ethAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
  "timestamp": "2025-01-10T12:34:56.789Z"
}
```

### Response - Neplatná verifikácia

```json
{
  "valid": false,
  "error": "Invalid signature format"
}
```

### Response - Chyby

**404 Not Found**
```json
{
  "error": "Receipt not found"
}
```

**400 Bad Request**
```json
{
  "error": "Missing required fields: receiptId, messageHash"
}
```

**500 Internal Server Error**
```json
{
  "error": "Verification failed"
}
```

## Ako funguje verifikácia

### 1. Podpísanie dokladu (pri skenovaní v aplikácii)

Pri skenovaní dokladu systém:
- Vytvorí správu: `receiptId:name:surname:birthNumber:dic`
- Vytvorí keccak256 hash tejto správy
- Podpíše hash pomocou Ethereum súkromného kľúča používateľa
- Uloží podpis do databázy

### 2. Verifikácia (external systém)

External systém:
1. Má k dispozícii údaje (receiptId, name, surname, birthNumber, dic)
2. Vytvorí správu v rovnakom formáte: `receiptId:name:surname:birthNumber:dic`
3. Vypočíta keccak256 hash: `messageHash = keccak256(message)`
4. Zavolá API s `receiptId` a `messageHash`

API systém:
1. Nájde doklad v databáze podľa `receiptId`
2. Získa uložený podpis a Ethereum adresu používateľa
3. Overí podpis pomocou `ecrecover` - zrekonštruuje adresu z messageHash a podpisu
4. Porovná zrekonštruovanú adresu s uloženou adresou
5. Vráti `valid: true` ak sa adresy zhodujú

## Bezpečnosť

✅ **Chránené osobné údaje** - Meno, priezvisko a rodné číslo sa NIKDY neposielajú cez sieť v čistom texte

✅ **Kryptografická bezpečnosť** - Používa sa Ethereum secp256k1 krivka a keccak256 hash

✅ **Zero-knowledge proof** - API overí autenticitu bez potreby poznať osobné údaje

✅ **Súkromný kľúč je chránený** - Nikdy neopustí systém, uložený len v Supabase

✅ **Row Level Security (RLS)** - Databázové politiky chránia prístup k údajom

## Použitie v praxi

```javascript
// External systém má tieto údaje z iného zdroja (napr. QR kód obsahuje len receiptId)
const receiptId = "0-ABC123..."

// A má osobné údaje používateľa z vlastného systému
const userFromOwnDatabase = {
  name: "Adam",
  surname: "Smith",
  birthNumber: "7711097383"
}

// Plus má DIČ z dokladu
const dic = "2120726927"

// Vytvorí hash lokálne (bez odoslania osobných údajov)
const message = `${receiptId}:${userFromOwnDatabase.name}:${userFromOwnDatabase.surname}:${userFromOwnDatabase.birthNumber}:${dic}`
const messageHash = ethers.id(message)

// Pošle len receiptId a hash
const response = await fetch('/api/verify-receipt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ receiptId, messageHash })
})

const result = await response.json()
if (result.valid) {
  console.log('✅ Doklad je autentický!')
} else {
  console.log('❌ Doklad nie je autentický!')
}
