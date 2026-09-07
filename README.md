# LiftMate AI

Lovable AI-prompt: Personlig treningsapp

Kopier alt under denne linjen og lim inn i Lovable:

Bygg en personlig treningsapp for mobil (progressive web app, optimalisert for bruk på telefon i gymmen). Dette er kun for én bruker (meg), ingen innlogging eller brukerkonto trengs. All data skal lagres lokalt på enheten (bruk localStorage eller IndexedDB) slik at alt er tilgjengelig offline og persisterer mellom økter.

Designstil

Lys, fargerik og visuelt fengende – ikke en kjedelig/klinisk treningslogg. Tenk energiske, motiverende farger (gjerne varme aksentfarger som oransje/gul/koral kombinert med hvit/lys bakgrunn), tydelig typografi, store trykkvennlige knapper (dette skal brukes med svette hender mellom sett), og tilfredsstillende mikro-interaksjoner/animasjoner når man fullfører et sett eller en økt (f.eks. en liten "checkmark"-animasjon eller konfetti ved fullført økt).

Kjernefunksjoner

1. Daglig vekt-innsjekk

Hjemskjerm har en enkel input for å logge morgenvekt (kg) hver dag

Appen beregner et rullerende 7-dagers gjennomsnitt av vekten

Sammenligner denne ukens gjennomsnitt mot forrige ukes gjennomsnitt

Viser en tydelig status: "På rett vei", "Går for fort opp", "Går for sakte/ikke opp" – basert på et mål-tempo som er innstillbart av brukeren (standard: +0,2–0,3 kg per uke)

Brukeren skal kunne endre målsettingen i innstillinger (f.eks. bytte mål-tempo, eller bytte fra "bulk" til "cut"-modus med negativt mål-tempo)

Vis enkel visualisering av vekttrend (en linje som viser daglige vekter og glidende gjennomsnitt er ok, men ingen avansert graf-funksjonalitet trengs – bare nok til å se retningen)

2. Treningsplan (fast ukeplan, redigerbar)

Bygg inn følgende 6-dagers ukeplan som standard data i appen. Hver dag skal vises som et eget "kort" brukeren kan trykke på for å starte økten:

Mandag – Push A (Styrke-fokus)

Incline barbell press – 4 sett x 5 reps, øk 2,5 kg når 4x5 klares (hvile: 180 sek)

Hammer Strength incline press – 3 sett x 8-10 reps (hvile: 120 sek)

Hammer Strength pec deck – 3 sett x 12-15 reps (hvile: 75 sek)

Shoulder press (maskin) – 3 sett x 10-12 reps (hvile: 90 sek)

Lateral raise (maskin) – 4 sett x 12-15 reps (hvile: 75 sek)

Cable triceps pushdown – 3 sett x 10-12 reps (hvile: 75 sek)

Leg raises – 3 sett x 12-15 reps (hvile: 50 sek)

Tirsdag – Pull A (Rygg/Biceps)

Cable pulldown, bredt grep – 4 sett x 8-10 reps (hvile: 120 sek)

Cable row, smalt grep – 3 sett x 10-12 reps (hvile: 90 sek)

Low row (maskin) – 3 sett x 10-12 reps (hvile: 90 sek)

Reverse pec deck – 3 sett x 15 reps (hvile: 50 sek)

Hammer curl – 3 sett x 10-12 reps (hvile: 75 sek)

Cable curl – 3 sett x 10-12 reps (hvile: 75 sek)

Dumbbell shrugs – 3 sett x 12-15 reps (hvile: 50 sek)

Onsdag – Ben

Hack squat – 4 sett x 8-10 reps (hvile: 150 sek)

Leg extension – 3 sett x 12-15 reps (hvile: 75 sek)

Leg curl – 3 sett x 12-15 reps (hvile: 75 sek)

Calf extension – 4 sett x 15 reps (hvile: 50 sek)

Leg raises – 3 sett x 15 reps (hvile: 50 sek)

Crunch-maskin – 3 sett x 15 reps (hvile: 50 sek)

Torsdag – Push B (Volum + teknikk)

Incline barbell press – 3 sett x 8 reps @ moderat vekt (65-70% av 1RM) (hvile: 120 sek)

Hammer Strength incline press – 3 sett x 8-10 reps (hvile: 120 sek)

Hammer Strength pec deck – 3 sett x 12-15 reps (hvile: 75 sek)

Shoulder press (maskin) – 3 sett x 10-12 reps (hvile: 90 sek)

Lateral raise (maskin) – 4 sett x 12-15 reps (hvile: 75 sek)

Overhead triceps extension – 3 sett x 10-12 reps (hvile: 75 sek)

Cable pushdown, stangrep – 3 sett x 10-12 reps (hvile: 75 sek)

Fredag – Pull B (Ryggtykkelse)

Low row (maskin) – 4 sett x 8-10 reps (hvile: 120 sek)

Cable row, smalt grep – 3 sett x 10-12 reps (hvile: 90 sek)

Cable pulldown, bredt grep – 3 sett x 12-15 reps (hvile: 90 sek)

Reverse pec deck – 3 sett x 15 reps (hvile: 50 sek)

Seated preacher curl – 3 sett x 10-12 reps (hvile: 75 sek)

Cable shrug – 3 sett x 12-15 reps (hvile: 50 sek)

Lørdag – Skulder/Arm-spesialisering

Shoulder press (maskin) – 4 sett x 8-10 reps (hvile: 120 sek)

Lateral raise (maskin) – 4 sett x 15-20 reps (hvile: 75 sek)

Cable pushdown, stangrep – 3 sett x 10-12 reps (hvile: 75 sek)

Hammer curl – 3 sett x 10-12 reps (hvile: 75 sek)

Crunch-maskin – 3 sett x 15-20 reps (hvile: 50 sek)

Leg raises – 3 sett x 15 reps (hvile: 50 sek)

Søndag – Hvile/Padel Ingen strukturert styrkeøkt. Vis en enkel "hviledag"-melding, eventuelt mulighet til å logge padel/cardio som fri aktivitet.

Brukeren må kunne redigere planen fritt: legge til nye øvelser, fjerne øvelser, endre rekkefølge, endre sett/reps/hvile-mål for enhver øvelse, og endre hvilken dag som er tildelt hvilken økt-type. Dette skal være enkelt tilgjengelig fra et redigeringsgrensesnitt, ikke gjemt bort.

3. Start økt / gjennomføring

Fra hjemskjermen kan brukeren trykke "Start dagens økt" (viser automatisk riktig dag basert på ukedag, men brukeren kan også velge en annen økt manuelt)

Under selve økten vises én øvelse om gangen (eller en scrollbar liste – design det som gir best flyt for gymbruk)

For hvert sett: vis foreslått vekt (se progressive overload-logikk under) og mål-reps, med enkle inputfelt/steppere for å registrere faktisk vekt og faktiske reps brukeren tok

Når et sett logges som fullført, start hviletimeren automatisk (nedtelling basert på hvile-verdien for den øvelsen), med tydelig visuell og gjerne lyd/vibrasjons-varsel når hviletiden er over

Vis fremdrift gjennom økten (f.eks. "Sett 3 av 4", "Øvelse 2 av 7")

Mulighet til å legge til ekstra sett eller hoppe over en øvelse hvis nødvendig

Når alle øvelser er fullført: vis en oppsummeringsskjerm av økten (total tid, totalt volum, eventuelle nye personlige rekorder) med en tilfredsstillende avslutningsanimasjon

4. Automatisk progressive overload

Etter hver fullført økt beregner appen automatisk forslag til vekt for neste gang samme øvelse gjøres

Fast regel: hvis brukeren klarte alle sett på toppen av (eller over) mål-rep-rangen for en øvelse, øk vekten med et standard hopp (2,5 kg for hovedløft/tunge compound-øvelser som incline barbell press og hack squat, 1-2 kg eller minste tilgjengelige increment for maskiner/isolasjonsøvelser – gjør dette innstillbart per øvelse siden vektstørrelser varierer)

Hvis brukeren ikke nådde bunnen av rep-rangen, foreslå samme vekt igjen (ev. et lite hint om at vekten kan vurderes redusert hvis dette skjer flere ganger på rad)

Dette skal skje helautomatisk uten at brukeren må bekrefte noe – neste gang øvelsen dukker opp i en økt, er vekten allerede oppdatert

Lagre en logg over vekt/reps-historikk per øvelse, alltid tilgjengelig for gjennomsyn

5. Utvikling over tid per øvelse

Egen skjerm/seksjon hvor brukeren kan velge en øvelse og se historikk over alle tidligere økter for den øvelsen: dato, vekt brukt, reps per sett

Ingen avanserte grafer nødvendig, men vis det på en oversiktlig måte som gjør det lett å se om en øvelse har stagnert (f.eks. fremhev med farge hvis vekten ikke har økt de siste 3-4 gangene øvelsen er gjort, slik at brukeren ser hvilke løft/muskelgrupper som trenger ekstra fokus)

Datamodell (forslag)

Exercises: id, navn, muskelgruppe, standard sett/reps/hvile, vekt-increment

WorkoutDays: dag, liste med exercise-referanser i rekkefølge

WorkoutSessions: dato, hvilken dag, liste med loggede sett per øvelse (vekt, reps, tidspunkt), total varighet

BodyWeightLogs: dato, vekt

Settings: mål-tempo for vektendring (kg/uke), retning (opp/ned/vedlikehold)

Tekniske krav

Progressive Web App som fungerer godt på mobil (kan legges til på hjemskjerm)

All data i localStorage/IndexedDB – ingen backend, ingen internettforbindelse nødvendig etter første lasting

Rask og responsiv – dette brukes midt i en treningsøkt, så ingen trege overganger eller lange lastetider

Norsk språk i grensesnittet

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://trymtracker.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/f1a7b906-1dad-44e5-94c6-1b7365a6e225).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
