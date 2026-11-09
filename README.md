# NIENTE MI DIVIDE DA CUS ❤

Roma ➜ Milano, 480 km di corsa per raggiungere la mia principessa.

Sito statico (HTML + CSS + JS, nessuna installazione) da pubblicare con **GitHub + Vercel**.

```
index.html   → la pagina
style.css    → lo stile pixel
app.js       → il livello animato e la logica
runs.json    → le tue corse (i dati)
fonts/       → font pixel inclusi (Press Start 2P, VT323 – licenza OFL)
vercel.json  → evita che runs.json resti in cache
```

---

## 1. Metti il progetto su GitHub

1. Vai su github.com, poi **New repository**, e chiamalo per esempio `niente-mi-divide-da-cus`.
   Può essere anche **privato**.
2. Nella pagina del repo clicca **"uploading an existing file"** e trascina **tutti i file e la cartella `fonts`**.
3. Clicca **Commit changes**.

## 2. Pubblica con Vercel

1. Vai su vercel.com, poi **Add New… → Project**, e importa il repo appena creato.
2. Framework preset: **Other**. Non serve toccare altro.
3. Clicca **Deploy**. Dopo pochi secondi hai il link, tipo `niente-mi-divide-da-cus.vercel.app`, da mandare a Chiara 😉

Ogni modifica al repo fa ripartire il deploy da sola (circa 20–40 secondi).

---

## 3. Aggiungere le corse

### Metodo comodo: dal sito (consigliato)

Serve un token GitHub, da creare **una volta sola**:

1. Su GitHub: foto profilo, poi **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**.
2. **Repository access**: *Only select repositories*, e scegli il repo del sito.
3. **Permissions → Repository permissions → Contents**: *Read and write*.
4. Imposta la scadenza che preferisci (anche 1 anno), poi genera e copia il token (`github_pat_…`).

Poi sul sito:

1. Clicca l'ingranaggio **⚙** in fondo alla pagina.
2. Inserisci utente GitHub, nome del repo, branch (`main`) e il token, poi premi **SALVA**.
3. Compare il pulsante **+ CORSA**: inserisci data, km (anche con la virgola, es. `7,5`) ed eventualmente una nota.

Il sito salva la corsa direttamente in `runs.json` sul tuo GitHub. Sul tuo telefono la vedi subito; per tutti gli altri compare appena Vercel finisce il nuovo deploy (meno di un minuto).
Nel diario puoi anche eliminare una corsa con la **✕**.

> Il token resta salvato **solo nel browser in cui lo inserisci** (telefono e/o computer) e non finisce mai nel sito pubblico.
> Chi apre il link, come Chiara, non vede né il pulsante + CORSA né le ✕.
> Per toglierlo da un dispositivo: ⚙ e poi **SCOLLEGA**.

### Metodo manuale: modifica `runs.json` su GitHub

Apri `runs.json` nel repo, clicca la matita ✏️ e aggiungi una riga:

```json
[
  { "date": "2026-11-09", "km": 7.5, "note": "lungo Tevere" },
  { "date": "2026-11-12", "km": 10 }
]
```

- `date` nel formato `AAAA-MM-GG`
- `km` con il **punto** come separatore decimale
- `note` è facoltativa

Poi clicca **Commit changes**.

---

## Personalizzazioni veloci (in `app.js`, in alto)

- `GOAL_KM`: l'obiettivo (480)
- `MILESTONES`: le tappe con i cartelli (sono in proporzione al percorso lungo l'A1)
- `HEART_EVERY_KM`: ogni quanti km l'omino raccoglie un cuore
- `HERO_PAL` / `PRINCESS_PAL`: i colori dei personaggi. Per esempio `B` è la maglietta e `H` i tuoi capelli; per Chiara `D` sono i capelli e `P` il vestito.

Buona corsa! 🏃‍♂️ ➜ 👸🏻
