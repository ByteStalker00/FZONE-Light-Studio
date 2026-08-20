# FZONE Light Studio

Applicazione desktop per il controllo intelligente dell'illuminazione degli acquari. Genera profili luce personalizzati con dissolvenze lineari fluide, protezione PWM contro il flicker e calcoli astronomici basati sulla posizione geografica.

## 📋 Caratteristiche Principali

- **6 Profili luce predefiniti** ottimizzati per scopi specifici
- **Dissolvenza lineare (Fade)** tra i profili con transizione morbida
- **Protezione PWM** contro lampeggiamenti nella zona 1-3%
- **Calcoli astronomici** alba/tramonto basati sulla latitudine/longitudine
- **Interfaccia intuitiva** con visualizzazione fasce orarie e grafico timeline
- **Codice QR** per configurazione rapida dell'hardware
- **Import/Export** configurazioni tramite codice esadecimale

## 🌅 Profili Luce

### 1. `sunMoon` - "Sole e Luna"
**Scopo**: Simula il ciclo giorno-notte naturale per acquari domestici.
- **Alba**: Graduale da buio a luce completa (22-92% intensità)
- **Giorno**: Luce piena con spettro bilanciato (W:92, R:48, G:20, B:62)
- **Tramonto**: Discendersi graduale verso il crepuscolo
- **Notte**: Blu residuo 04% per ritmo circadiano
- **Piante**: Adatto piante verdi e rosse miste
- **Fasce orarie**: 05:16 (alba) → 21:12 (tramonto)

### 2. `moonBlue` - "Luna Blu"
**Scopo**: Luce notturna blu minimal, ideale per non disturbare pesci e piante.
- **Canale**: Solo Blu attivo in tutte le fasce
- **Intensità**: Progressiva 10% → 30% → 60% (massima notte) → 40% → 20% → 5%
- **Algli altri canali**: Rosso, Verde, Bianco sempre spenti
- **Osservazione**: Per vedere gli abitanti di notte senza stressarli
- **Fasce orarie**: Luna attiva per tutta la notte

### 3. `growth` - "Crescita Piante"
**Scopo**: Massima crescita piante acquatiche, Rosso intensivo per fotosintesi.
- **Rosso**: Alto 30%→75% al mezzogiorno (massima clorofilla rossa)
- **Verde**: Moderato 15%→35% (spettro completo senza sprecare)
- **Blu**: Basso 10%→25% (regola ritmo circadiano)
- **Bianco**: 0%→80%→100% (luce supplementare)
- **Ottimizzato**: Per piante rosse intense e crescita rapida
- **Fasce orarie**: 05:16 (alba) → 21:12 (tramonto)

### 4. `dayNight` - "Giorno/Notte"
**Scopo**: Ciclo giorno/notte bilanciato per acquario generale.
- **Bilanciato**: Tutti i canali (W/R/G/B) aumentano insieme
- **Giorno**: Luce bianca calda completa (W:100, R:55, G:52, B:52)
- **Notte**: Tutti canali spenti
- **Adatto**: Acquario comunitario pesci+piante base
- **Fasce orarie**: 05:16 (alba) → 21:12 (tramonto)

### 5. `fullLight` - "Luce Piena"
**Scopo**: Massimo apporto luminoso per crescita rapida ed esigente.
- **Giorno**: Tutti canali al 100% (W:100, R:100, G:100, B:100)
- **Serra**: Iniziano 70% e salgono a 100% all'alba
- **Sera**: Ridotti 60% prima di sprofondare a 0 di notte
- **Scopo**: Piante esigenti, coralli, crescita accelerata
- **Fasce orarie**: 05:16 (alba) → 21:12 (tramonto)

### 6. `moonOnly` - "Solo Luna"
**Scopo**: Minima luce notturna, osservazione solo luna.
- **Unico canale**: Blu costante 04% in tutte e 6 le fasce
- **Altri canali**: Bianco, Rosso, Verde sempre spenti
- **Osservazione notturna**: Visibilità senza accendere tutto l'acquario
- **Fasce orarie**: Blu fisso per tutta la notte (00:00 → 20:00 → 00:00)

## ⚙️ Come Usare

### Installazione
1. Esegui `FZONE Light Studio.exe` dalla cartella `bin/`
2. L'applicazione si avvia su `http://127.0.0.1:8701/`
3. Non sono necessarie installazioni aggiuntive

### Impostazione Posizione
1. Clicca il bottone **📍 Posizione** (lato sinistro)
2. Attiva la geolocalizzazione o inserisci manualmente:
   - **Latitudine**: Es. `45.0` (Italia centro-settentrionale)
   - **Longitudine**: Es. `9.0` (Italia orientale)
   - **Data**: Data corrente o scelta specifica
3. Clicca **Applica alba/tramonto** per calcolare i tempi

### Selezione Profilo
1. Clicca una delle icone dei profili in basso:
   - `Sun & Moon` - Sole e Luna
   - `Blue Moon` - Luna Blu
   - `Plant Growth` - Crescita Piante
   - `Day/Night` - Giorno/Notte
   - `Full Light` - Luce Piena
   - `Moon Only` - Solo Luna
2. I valori W/R/G/B si caricheranno immediatamente nelle tabelle
3. Parte la dissolvenza lineare (20 secondi) verso i nuovi valori

### Regolazione Manuale
- Modifica i valori percentuali nelle tabelle orarie
- Usa gli input `time` per impostare ore minuti esatti
- Clicca **Genera** (Gen) per ricodificare il config QR
- Usa **Importa** per caricare configurazioni precedenti

### Fade (Dissolvenza)
- **20 secondi** per cambio profilo
- **35 secondi** per transizioni alba/tramonto naturali
- Protezione automatica: valori PWM 1-3% diventano 0 o 4%
- Visibile nell'area grafico timeline

### Codice QR & Config
- Clicca **Genera QR** per creare codice configurazione hardware
- Clicca **Copia Hex** per copiare il codice esadecimale
- Usa **Importa Hex** per caricare configurazioni salvate
- Il formato inizia con `smartaqua_brite` seguito da 68 caratteri esadecimali

## 📊 Specifiche Tecniche

### Calcoli Astronomic
- Usa posizioni lat/lon per alba/tramonto accurati
- Latitudine: `45.0` ≈ San Benedetto del Tronto (43°N)
- Longitudine: `9.0` ≈ Italia centrale
- Durata luce: ~15-16 ore (metà agosto)

### Output Hardware
- Formato: `smartaqua_brite` + byte CRC validation
- 6 slot orari × (Ora, Minuto, W, R, G, B)
- Byte di controllo CRC per validazione integrità
- Compatibile driver SmartAqua Brite

### Protezioni PWM
- Valori nella zona 1-3% vengono corretti automaticamente
- 0% = spento, 4%+ = valore minimo sicuro
- Previene flicker visibile sui driver LED

### Interfaccia
- **Timeline**: Grafico orizzontale con canali W/R/G/B
- **Fasce**: Tabelle 6 ore con valori modificabili
- **QR Code**: Configurazione hardware rapida
- **Log**: Debug e eventi in tempo reale

## 🎯 Per Italiani (San Benedetto del Tronto)

L'applicazione è pre-configurata per:
- **Latitudine**: ~45.0 ( corrispondente a ~43°N SBT)
- **Longitudine**: ~9.0 (Italia orientale)
- **Ora alba**: Circa 05:16 (metà agosto)
- **Ora tramonto**: Circa 21:12 (metà agosto)
- **Lunghezza giorno**: ~15-16 ore

Regola i valori in base agli abitanti del tuo acquario:
- **Piante rosse**: Aumenta il canale Rosso nei profili `growth`/`sunMoon`
- **Piante verdi**: Il canale Verde complementa negli stessi profili
- **Solo pesci**: Usa `moonOnly` o `moonBlue` di notte
- **Acquario generale**: `dayNight` offre bilanciamento ottimale

## 🛠️ Sviluppo Tecnico

### Struttura File
- `assets/js/main.js` - Logica principale, fade, validazione
- `assets/js/presets.js` - 6 profili luce ottimizzati
- `assets/js/i18n.js` - Supporto 20 lingue
- `assets/css/style.css` - Styling e zoom pagina
- `build/build.bat` - Compilazione EXE Windows

### Aggiornamenti Recenti
- **Fade lineare**: Transizione morbida tra profili (20s)
- **Protezione PWM**: Previene flicker zona 1-3%
- **Profili ottimizzati**: Valori coerenti col nome di ciascun profilo
- **Fade alba/tramonto**: 35 secondi per realismo naturale

### Build & Distribuzione
```bash
# Ricompilazione EXE
cmd /c build\build.bat

# Risultato: bin\FZONE Light Studio.exe (singolo file)
```

## 📝 Note Importanti

1. **Localizzazione**: I tempi alba/tramonto si basano sulle coordinate inserite
2. **Fade**: Le transizioni sono visibili ma non disturbanti
3. **PWM**: La protezione 1-3% è automatica e irreversibile per stabilità
4. **Profili**: Ogni nome corrisponde all'intento (moonBlue = blu, growth = rosso, etc.)
5. **Backup**: Usa Importa/Esporta codice Hex per salvare configurazioni

## 📧 Supporto

Per problemi o suggerimenti:
- Verifica la console del browser (F12) per errori
- La posizione geolocalizzazione richiede permesso browser
- I valori 1-3% PWM sono protetti automaticamente

---
*FZONE Light Studio - Aquarium Lighting Control*