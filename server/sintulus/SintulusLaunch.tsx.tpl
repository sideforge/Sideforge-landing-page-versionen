"use client";

// Sintulus 6 — launch page (film hero, table of contents, article with section nav).
// Installed by server/sintulus/install.sh from sideforge/Sideforge-landing-page-versionen.
// Nav and footer come from PublicShell; the copy is translated through makeT like the other public pages.

import Link from "next/link";
import { useEffect, useRef, type CSSProperties } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
/*__SF_IMPORTS__*/

type Loc = Parameters<typeof PublicShell>[0]["locale"];
type Dict = Parameters<typeof makeT>[1];

const VIDEO = "/media/sintulus-sea.mp4";
const POSTER = "/media/sintulus-sea.jpg";
const PAPER = "#FAF9F5";
const paper = (a: number) => `rgba(250,249,245,${a})`;

const DICT = {
  "en": {
    "Einführung": "Introduction",
    "Was sich ändert": "What changes",
    "Wo es läuft": "Where it runs",
    "Verfügbarkeit und Preis": "Availability and pricing",
    "Fahrplan": "Roadmap",
    "Status": "Status",
    "In Arbeit": "In progress",
    "Erscheint": "Release",
    "Ende 2026": "End of 2026",
    "Löst ab": "Replaces",
    "Abrechnung": "Billing",
    "Nur über Guthaben": "Credits only",
    "Arbeit über Stunden": "Work that runs for hours",
    "Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen.": "Tasks keep running as their own run even when the window is closed, and check back when they are done or need a decision.",
    "Forschung mit Beleg": "Research with evidence",
    "Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit.": "Numbers come from the source and from real Python, never from the model's memory. Every figure carries its provenance.",
    "Code im ganzen Projekt": "Code across the whole project",
    "Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss.": "Changes across many files with a plan, checkpoints and tests — instead of single suggestions you have to piece together yourself.",
    "Räumliches Verständnis": "Spatial understanding",
    "Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild.": "Read and create molecules, structures and scenes in 3D — rotatable in the browser, not a flat picture.",
    "Chat": "Chat",
    "Alltagsfragen, lange Verläufe": "Everyday questions, long threads",
    "Code": "Code",
    "Echte Projekte, echtes Terminal": "Real projects, real terminal",
    "Science": "Science",
    "Datenbanken und eine Python-Kammer": "Databases and a Python chamber",
    "Cowork": "Cowork",
    "Fertige Dateien, bereit zum Abzeichnen": "Finished files, ready to sign off",
    "Öffentliche API": "Public API",
    "Dieselbe Stufe, derselbe Schlüssel": "Same tier, same key",
    "Heute": "Today",
    "Venura 6": "Venura 6",
    "Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen.": "The deep tier for architecture, debugging and long derivations.",
    "Ende November 2026": "End of November 2026",
    "Venura 6.5": "Venura 6.5",
    "Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde.": "Stays on task longer, cleaner tool chains, its own review pass.",
    "Sintulus 6": "Sintulus 6",
    "Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden.": "The strongest tier, rebuilt, for work that takes hours.",
    "Brauche ich dafür ein bestimmtes Abo?": "Do I need a particular plan?",
    "Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.": "No, only credits. Your plan sets the other tiers and limits; Sintulus is always billed directly against credits.",
    "Was passiert mit Sintulus 5?": "What happens to Sintulus 5?",
    "Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.": "It stays selectable for a transition period after launch. We will announce the period at launch.",
    "Warum so spät im Jahr?": "Why so late in the year?",
    "Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.": "Because we only release Sintulus 6 once it passes the checks we learned from Sintulus 5. An early date is worth less to us than a model you can trust with long tasks.",
    "Erscheint Ende 2026": "Coming end of 2026",
    "Auf dieser Seite": "On this page",
    "Sintulus 6 · Vorschau": "Sintulus 6 · Preview",
    "Abschnitte": "Sections",
    "Häufige Fragen": "Frequently asked questions",
    "Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.": "Sintulus 6 is our strongest tier, rebuilt from the ground up. For research with real computation and review, for code at its hardest points and for work that takes hours rather than minutes.",
    "Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.": "Sintulus 5 is the tier for tasks where the result has to be right. Sintulus 6 is meant to hold that standard over long stretches: a research question from the dataset to the verified figure, a refactor across a whole project, a task you hand over in the morning and sign off in the evening.",
    "Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.": "To do that it does not work alone. A plan, several specialised steps and a reviewer that holds the result against the log — visible, traceable, stoppable.",
    "Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.": "A task you hand over in the morning and sign off in the evening.",
    "Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.": "Preview. Scope and dates may still change before launch.",
    "Sintulus 5 jetzt nutzen": "Use Sintulus 5 now",
    "Preise ansehen": "See pricing",
    "Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.": "Everywhere you pick a model tier today — no separate access and no new keys.",
    "Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.": "Like Sintulus 5, Sintulus 6 runs on credits, not on your plan's included allowance. The price follows the model's cost and will be listed in the console at launch.",
    "Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.": "Until then Sintulus 5 remains the top tier — anything you build with it today can be carried on with Sintulus 6 later.",
    "Weiterlesen": "Read next",
    "Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.": "More stamina on long tasks, cleaner tool chains and its own review pass before every answer.",
    "Ansehen": "View",
    "SideAI": "SideAI",
    "Heute schon da": "Already here today",
    "Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.": "Chat, Code, Science, Cowork and Design — everything the new models build on is already running.",
    "SideAI entdecken": "Explore SideAI"
  },
  "fr": {
    "Einführung": "Introduction",
    "Was sich ändert": "Ce qui change",
    "Wo es läuft": "Où il s'exécute",
    "Verfügbarkeit und Preis": "Disponibilité et tarifs",
    "Fahrplan": "Feuille de route",
    "Status": "Statut",
    "In Arbeit": "En cours",
    "Erscheint": "Sortie",
    "Ende 2026": "Fin 2026",
    "Löst ab": "Remplace",
    "Abrechnung": "Facturation",
    "Nur über Guthaben": "Crédits uniquement",
    "Arbeit über Stunden": "Travail qui dure des heures",
    "Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen.": "Les tâches continuent d'exécuter leur propre processus même quand la fenêtre est fermée, et elles se signalent lorsqu'elles sont terminées ou qu'elles nécessitent une décision.",
    "Forschung mit Beleg": "Recherche avec preuves",
    "Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit.": "Les nombres viennent de la source et du Python réel, jamais de la mémoire du modèle. Chaque chiffre indique sa provenance.",
    "Code im ganzen Projekt": "Code dans tout le projet",
    "Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss.": "Refontes sur de nombreux fichiers avec plan, points d'étape et tests — au lieu de suggestions isolées qu'il faut assembler soi-même.",
    "Räumliches Verständnis": "Compréhension spatiale",
    "Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild.": "Lire et créer des molécules, structures et scènes en 3D — rotatives dans le navigateur, pas une image plate.",
    "Chat": "Chat",
    "Alltagsfragen, lange Verläufe": "Questions du quotidien, longs échanges",
    "Code": "Code",
    "Echte Projekte, echtes Terminal": "De vrais projets, un vrai terminal",
    "Science": "Science",
    "Datenbanken und eine Python-Kammer": "Des bases de données et une chambre Python",
    "Cowork": "Cowork",
    "Fertige Dateien, bereit zum Abzeichnen": "Des fichiers finis, prêts à valider",
    "Öffentliche API": "API publique",
    "Dieselbe Stufe, derselbe Schlüssel": "Même niveau, même clé",
    "Heute": "Aujourd'hui",
    "Venura 6": "Venura 6",
    "Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen.": "Le niveau profond pour l'architecture, le débogage et les longues dérivations.",
    "Ende November 2026": "Fin novembre 2026",
    "Venura 6.5": "Venura 6.5",
    "Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde.": "Reste plus longtemps concentré, chaînes d'outils plus propres, passe de révision dédiée",
    "Sintulus 6": "Sintulus 6",
    "Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden.": "Le niveau le plus élevé, reconstruit, pour le travail de longue durée.",
    "Brauche ich dafür ein bestimmtes Abo?": "Ai-je besoin d'un abonnement particulier ?",
    "Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.": "Non, seulement les crédits. L'abonnement détermine les autres paliers et limites ; Sintulus est toujours facturé directement sur les crédits.",
    "Was passiert mit Sintulus 5?": "Que devient Sintulus 5 ?",
    "Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.": "Il reste sélectionnable pendant une période de transition après le lancement. Nous annoncerons cette période au lancement.",
    "Warum so spät im Jahr?": "Pourquoi si tard dans l'année ?",
    "Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.": "Parce que nous ne libérons Sintulus 6 que lorsqu'il passe les tests que nous avons appris avec Sintulus 5. Une date précoce vaut moins pour nous qu'un modèle auquel on peut confier de longues tâches.",
    "Erscheint Ende 2026": "Sortie prévue fin 2026",
    "Auf dieser Seite": "Sur cette page",
    "Sintulus 6 · Vorschau": "Sintulus 6 · Aperçu",
    "Abschnitte": "Sections",
    "Häufige Fragen": "Questions fréquentes",
    "Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.": "Sintulus 6 est notre palier le plus fort, reconstruit de zéro. Pour la recherche avec calcul et vérification, pour le code aux endroits les plus difficiles et pour le travail qui prend des heures au lieu de minutes.",
    "Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.": "Sintulus 5 est le palier pour les tâches où le résultat doit être juste. Sintulus 6 vise à maintenir cette exigence sur la durée : une question de recherche du jeu de données à la figure vérifiée, une refonte sur tout un projet, une tâche qu'on confie le matin et qu'on valide le soir.",
    "Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.": "Pour cela, il ne travaille pas seul. Un plan, plusieurs étapes spécialisées et un vérificateur qui maintient le résultat par rapport au protocole — visible, traçable, pouvant être arrêté.",
    "Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.": "Une tâche que l'on confie le matin et que l'on valide le soir.",
    "Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.": "Aperçu. Les indications sur l'étendue et la date peuvent encore changer d'ici le lancement.",
    "Sintulus 5 jetzt nutzen": "Utiliser Sintulus 5 maintenant",
    "Preise ansehen": "Voir les tarifs",
    "Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.": "Partout où vous choisissez aujourd'hui un niveau de modèle — aucun accès séparé et aucune nouvelle clé.",
    "Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.": "Comme Sintulus 5, Sintulus 6 fonctionne sur crédits et non sur le forfait inclus de l'abonnement. Le prix suit le coût d'achat du modèle et sera affiché dans la console au lancement.",
    "Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.": "D'ici là, Sintulus 5 reste le niveau le plus élevé — tout ce que vous créez avec lui aujourd'hui peut être poursuivi plus tard avec Sintulus 6.",
    "Weiterlesen": "Lire la suite",
    "Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.": "Plus d'endurance sur les longues tâches, des chaînes d'outils plus propres et une passe de vérification propre avant chaque réponse.",
    "Ansehen": "Voir",
    "SideAI": "SideAI",
    "Heute schon da": "Déjà disponible aujourd'hui",
    "Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.": "Chat, Code, Science, Cowork et Design — tout ce sur quoi les nouveaux modèles s'appuient fonctionne déjà.",
    "SideAI entdecken": "Découvrir SideAI"
  },
  "it": {
    "Einführung": "Introduzione",
    "Was sich ändert": "Cosa cambia",
    "Wo es läuft": "Dove viene eseguito",
    "Verfügbarkeit und Preis": "Disponibilità e prezzo",
    "Fahrplan": "Roadmap",
    "Status": "Stato",
    "In Arbeit": "In corso",
    "Erscheint": "Uscita",
    "Ende 2026": "Fine 2026",
    "Löst ab": "Sostituisce",
    "Abrechnung": "Fatturazione",
    "Nur über Guthaben": "Solo crediti",
    "Arbeit über Stunden": "Lavoro che dura ore",
    "Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen.": "Le attività continuano a essere eseguite come processi autonomi anche quando la finestra viene chiusa e tornano quando sono complete o richiedono una decisione.",
    "Forschung mit Beleg": "Ricerca con prove",
    "Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit.": "I numeri provengono dalla fonte e da Python reale, mai dalla memoria del modello. Ogni figura porta con sé la sua provenienza.",
    "Code im ganzen Projekt": "Codice in tutto il progetto",
    "Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss.": "Modifiche su molti file con piano, punti di controllo e test — invece di singoli suggerimenti che bisogna assemblare da soli.",
    "Räumliches Verständnis": "Comprensione spaziale",
    "Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild.": "Leggere e creare molecole, strutture e scene in 3D — ruotabili nel browser, non un'immagine piatta.",
    "Chat": "Chat",
    "Alltagsfragen, lange Verläufe": "Domande quotidiane, conversazioni lunghe",
    "Code": "Codice",
    "Echte Projekte, echtes Terminal": "Progetti veri, terminale vero",
    "Science": "Scienza",
    "Datenbanken und eine Python-Kammer": "Database e una camera Python",
    "Cowork": "Cowork",
    "Fertige Dateien, bereit zum Abzeichnen": "File finiti, pronti da approvare",
    "Öffentliche API": "API pubblica",
    "Dieselbe Stufe, derselbe Schlüssel": "Stesso livello, stessa chiave",
    "Heute": "Oggi",
    "Venura 6": "Venura 6",
    "Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen.": "Il livello profondo per architettura, debug e lunghe derivazioni.",
    "Ende November 2026": "Fine novembre 2026",
    "Venura 6.5": "Venura 6.5",
    "Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde.": "Rimane focalizzata più a lungo, catene di strumenti più pulite, un proprio passaggio di revisione.",
    "Sintulus 6": "Sintulus 6",
    "Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden.": "Il livello più potente, ricostruito, per il lavoro che dura ore.",
    "Brauche ich dafür ein bestimmtes Abo?": "Mi serve un abbonamento specifico?",
    "Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.": "No, solo crediti. Il piano determina gli altri livelli e i limiti; Sintulus viene sempre addebitato direttamente sui crediti.",
    "Was passiert mit Sintulus 5?": "Cosa succede a Sintulus 5?",
    "Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.": "Rimane selezionabile per un periodo di transizione dopo il lancio. Comunicheremo la durata al lancio.",
    "Warum so spät im Jahr?": "Perché così tardi nell'anno?",
    "Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.": "Poiché rilasciamo Sintulus 6 solo dopo che ha superato i test che abbiamo imparato da Sintulus 5. Una data anticipata vale meno per noi di un modello su cui si possono affidare compiti lunghi.",
    "Erscheint Ende 2026": "Uscita alla fine del 2026",
    "Auf dieser Seite": "In questa pagina",
    "Sintulus 6 · Vorschau": "Sintulus 6 · Anteprima",
    "Abschnitte": "Sezioni",
    "Häufige Fragen": "Domande frequenti",
    "Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.": "Sintulus 6 è il nostro livello più potente, ricostruito da zero. Per la ricerca con calcolo reale e revisione, per il codice nei punti più difficili e per il lavoro che richiede ore invece di minuti.",
    "Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.": "Sintulus 5 è il livello per le attività in cui il risultato deve essere corretto. Sintulus 6 deve mantenere questo requisito su lunghe distanze: una domanda di ricerca dal dataset alla figura verificata, un refactoring su tutto il progetto, un'attività che si consegna al mattino e si approva alla sera.",
    "Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.": "Per farlo non lavora da solo. Un piano, diversi passaggi specializzati e un revisore che confronta il risultato con il log — visibile, tracciabile, interrompibile.",
    "Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.": "Un compito che affidi al mattino e approvi la sera.",
    "Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.": "Anteprima. I dettagli su ambito e data possono ancora cambiare prima del lancio.",
    "Sintulus 5 jetzt nutzen": "Usa Sintulus 5 ora",
    "Preise ansehen": "Vedi prezzi",
    "Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.": "Ovunque si sceglie oggi il livello del modello — nessun accesso separato e nessuna nuova chiave.",
    "Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.": "Come Sintulus 5, Sintulus 6 funziona con crediti, non con l'allocazione inclusa del piano. Il prezzo segue il costo del modello e sarà elencato nella console al lancio.",
    "Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.": "Fino ad allora Sintulus 5 resta il livello più alto — tutto ciò che realizzi con esso oggi potrà essere proseguito con Sintulus 6 in seguito.",
    "Weiterlesen": "Continua a leggere",
    "Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.": "Maggiore resistenza nelle attività lunghe, catene di strumenti più pulite e un proprio passaggio di revisione prima di ogni risposta.",
    "Ansehen": "Visualizza",
    "SideAI": "SideAI",
    "Heute schon da": "Già disponibile oggi",
    "Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.": "Chat, Codice, Scienza, Cowork e Design — tutto ciò su cui si basano i nuovi modelli è già attivo.",
    "SideAI entdecken": "Scopri SideAI"
  },
  "es": {
    "Einführung": "Introducción",
    "Was sich ändert": "Qué cambia",
    "Wo es läuft": "Dónde se ejecuta",
    "Verfügbarkeit und Preis": "Disponibilidad y precio",
    "Fahrplan": "Hoja de ruta",
    "Status": "Estado",
    "In Arbeit": "En progreso",
    "Erscheint": "Lanzamiento",
    "Ende 2026": "Fin de 2026",
    "Löst ab": "Reemplaza",
    "Abrechnung": "Facturación",
    "Nur über Guthaben": "Solo créditos",
    "Arbeit über Stunden": "Trabajo que se ejecuta durante horas",
    "Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen.": "Las tareas siguen ejecutándose como su propia ejecución incluso cuando la ventana se cierra, y vuelven a comprobarse cuando están terminadas o necesitan una decisión.",
    "Forschung mit Beleg": "Investigación con evidencia",
    "Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit.": "Los números provienen de la fuente y de Python real, nunca de la memoria del modelo. Cada figura lleva su procedencia.",
    "Code im ganzen Projekt": "Code en todo el proyecto",
    "Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss.": "Cambios en muchos archivos con un plan, puntos de control y pruebas — en lugar de sugerencias individuales que uno tiene que reunir por sí mismo.",
    "Räumliches Verständnis": "Comprensión espacial",
    "Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild.": "Leer y crear moléculas, estructuras y escenas en 3D — giratorio en el navegador, no una imagen plana.",
    "Chat": "Chat",
    "Alltagsfragen, lange Verläufe": "Preguntas cotidianas, conversaciones largas",
    "Code": "Code",
    "Echte Projekte, echtes Terminal": "Proyectos reales, terminal real",
    "Science": "Ciencia",
    "Datenbanken und eine Python-Kammer": "Bases de datos y una cámara Python",
    "Cowork": "Cowork",
    "Fertige Dateien, bereit zum Abzeichnen": "Archivos terminados, listos para aprobar",
    "Öffentliche API": "API pública",
    "Dieselbe Stufe, derselbe Schlüssel": "Mismo nivel, misma clave",
    "Heute": "Hoy",
    "Venura 6": "Venura 6",
    "Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen.": "El nivel profundo para arquitectura, depuración y derivaciones largas.",
    "Ende November 2026": "Fin de noviembre de 2026",
    "Venura 6.5": "Venura 6.5",
    "Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde.": "Permanece en la tarea por más tiempo, cadenas de herramientas más limpias, su propia ronda de revisión",
    "Sintulus 6": "Sintulus 6",
    "Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden.": "El nivel más fuerte, reconstruido, para trabajo que se extiende por horas.",
    "Brauche ich dafür ein bestimmtes Abo?": "¿Necesito un plan específico para eso?",
    "Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.": "No, solo créditos. El plan establece los demás niveles y límites; Sintulus siempre se factura directamente contra créditos.",
    "Was passiert mit Sintulus 5?": "¿Qué ocurre con Sintulus 5?",
    "Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.": "Permanece seleccionable durante un período de transición después del lanzamiento. Anunciaremos el período en el lanzamiento.",
    "Warum so spät im Jahr?": "¿Por qué tan tarde en el año?",
    "Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.": "Porque solo lanzamos Sintulus 6 cuando pasa las pruebas que aprendimos de Sintulus 5. Una fecha temprana nos vale menos que un modelo en el que se puedan confiar tareas largas.",
    "Erscheint Ende 2026": "Llegando a finales de 2026",
    "Auf dieser Seite": "En esta página",
    "Sintulus 6 · Vorschau": "Sintulus 6 · Vista previa",
    "Abschnitte": "Secciones",
    "Häufige Fragen": "Preguntas frecuentes",
    "Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.": "Sintulus 6 es nuestro nivel más fuerte, reconstruido desde cero. Para investigación con cómputo y revisión reales, para código en sus puntos más difíciles y para trabajo que dura horas en lugar de minutos.",
    "Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.": "Sintulus 5 es el nivel para tareas en las que el resultado debe ser correcto. Sintulus 6 debe mantener ese estándar en largas extensiones: una pregunta de investigación desde el conjunto de datos hasta la figura verificada, una reestructuración de todo un proyecto y una tarea que se transfiere y se aprueba por la noche.",
    "Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.": "Para lograrlo no trabaja solo. Un plan, varios pasos especializados y un revisor que mantiene el resultado frente al registro — visible, trazable, detenible.",
    "Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.": "Una tarea que entregas por la mañana y apruebas por la tarde.",
    "Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.": "Vista previa. El alcance y la fecha pueden seguir cambiando hasta el lanzamiento.",
    "Sintulus 5 jetzt nutzen": "Usar Sintulus 5 ahora",
    "Preise ansehen": "Ver precios",
    "Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.": "En todas partes donde elijas hoy el nivel del modelo — sin acceso separado y sin nuevas claves.",
    "Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.": "Como Sintulus 5, Sintulus 6 se ejecuta con créditos y no con el incluido en el plan. El precio sigue el costo del modelo y se mostrará en la consola al iniciar.",
    "Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.": "Hasta entonces Sintulus 5 sigue siendo el nivel más alto — cualquier cosa que construyas con ella hoy puede llevarse posteriormente a Sintulus 6.",
    "Weiterlesen": "Leer más",
    "Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.": "Más resistencia en tareas largas, cadenas de herramientas más limpias y su propia pasada de revisión antes de cada respuesta.",
    "Ansehen": "Vista",
    "SideAI": "SideAI",
    "Heute schon da": "Ya disponible hoy",
    "Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.": "Chat, Code, Science, Cowork y Design — todo lo en lo que se basan los nuevos modelos ya está en ejecución.",
    "SideAI entdecken": "Descubrir SideAI"
  },
  "pt": {
    "Einführung": "Introdução",
    "Was sich ändert": "O que muda",
    "Wo es läuft": "Onde funciona",
    "Verfügbarkeit und Preis": "Disponibilidade e preço",
    "Fahrplan": "Roteiro",
    "Status": "Estado",
    "In Arbeit": "Em curso",
    "Erscheint": "Lançamento",
    "Ende 2026": "Fim de 2026",
    "Löst ab": "Substitui",
    "Abrechnung": "Faturação",
    "Nur über Guthaben": "Apenas via créditos",
    "Arbeit über Stunden": "Trabalho que dura horas",
    "Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen.": "As tarefas continuam a correr como um próprio processo, mesmo quando a janela é fechada, e notificam quando terminam ou precisam de uma decisão.",
    "Forschung mit Beleg": "Investigação com evidência",
    "Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit.": "Os números vêm da fonte e do Python verdadeiro, nunca da memória do modelo. Cada figura traz a sua proveniência.",
    "Code im ganzen Projekt": "Código em todo o projeto",
    "Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss.": "Alterações em muitos ficheiros com plano, pontos intermédios e testes — em vez de sugestões isoladas que se tem de compor sozinho.",
    "Räumliches Verständnis": "Compreensão espacial",
    "Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild.": "Ler e criar moléculas, estruturas e cenas em 3D — rotacionáveis no browser, não como imagem plana.",
    "Chat": "Chat",
    "Alltagsfragen, lange Verläufe": "Perguntas do dia a dia, conversas longas",
    "Code": "Código",
    "Echte Projekte, echtes Terminal": "Projetos reais, terminal real",
    "Science": "Science",
    "Datenbanken und eine Python-Kammer": "Bases de dados e uma câmara Python",
    "Cowork": "Cowork",
    "Fertige Dateien, bereit zum Abzeichnen": "Ficheiros prontos, para aprovar",
    "Öffentliche API": "API pública",
    "Dieselbe Stufe, derselbe Schlüssel": "Mesmo nível, mesma chave",
    "Heute": "Hoje",
    "Venura 6": "Venura 6",
    "Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen.": "O nível profundo para arquitetura, depuração e derivações longas.",
    "Ende November 2026": "Fim de novembro de 2026",
    "Venura 6.5": "Venura 6.5",
    "Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde.": "Permanece mais tempo em tarefa, cadeias de ferramentas mais limpas, sua própria ronda de verificação.",
    "Sintulus 6": "Sintulus 6",
    "Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden.": "O nível mais forte, reconstruído, para trabalho que dura horas.",
    "Brauche ich dafür ein bestimmtes Abo?": "Preciso de um plano específico?",
    "Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.": "Não, apenas créditos. O plano define os restantes escalões e limites; o Sintulus é sempre faturado diretamente contra créditos.",
    "Was passiert mit Sintulus 5?": "O que acontece ao Sintulus 5?",
    "Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.": "Permanece selecionável durante um período de transição após o lançamento. O período será anunciado no lançamento.",
    "Warum so spät im Jahr?": "Por que tão tarde no ano?",
    "Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.": "Porque só libertamos o Sintulus 6 quando este passa nos testes que aprendemos com o Sintulus 5. Uma data antecipada vale menos para nós do que um modelo em que se pode confiar tarefas longas.",
    "Erscheint Ende 2026": "Lançamento fim de 2026",
    "Auf dieser Seite": "Nesta página",
    "Sintulus 6 · Vorschau": "Sintulus 6 · Pré-visualização",
    "Abschnitte": "Secções",
    "Häufige Fragen": "Perguntas frequentes",
    "Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.": "O Sintulus 6 é o nosso escalão mais forte, reconstruído de raiz. Para investigação com cálculo real e verificação, para código nos pontos mais difíceis e para trabalho que leva horas em vez de minutos.",
    "Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.": "O Sintulus 5 é o escalão para tarefas em que o resultado tem de estar certo. O Sintulus 6 pretende manter essa exigência ao longo de percursos longos: uma questão de investigação do conjunto de dados até à figura verificada, uma refatoração por todo um projeto, uma tarefa que se entrega de manhã e se valida à noite.",
    "Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.": "Para isso não trabalha sozinho. Um plano, vários passos especializados e um verificador que mantém o resultado em conformidade com o protocolo — visível, rastreável, interrompível.",
    "Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.": "Uma tarefa que se entrega de manhã e se aprova à noite.",
    "Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.": "Pré-visualização. As informações sobre âmbito e data podem ainda mudar até ao lançamento.",
    "Sintulus 5 jetzt nutzen": "Usar o Sintulus 5 agora",
    "Preise ansehen": "Ver preços",
    "Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.": "Em todo o lado onde se escolhe hoje o nível do modelo — sem acesso separado e sem novas chaves",
    "Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.": "Tal como o Sintulus 5, o Sintulus 6 funciona via créditos e não através da quota incluída no plano. O preço baseia-se no custo do modelo e estará listado na consola no lançamento.",
    "Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.": "Até lá, o Sintulus 5 permanece o nível mais elevado — tudo o que se cria com ele hoje pode ser continuado posteriormente no Sintulus 6.",
    "Weiterlesen": "Ler mais",
    "Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.": "Mais resistência em tarefas longas, cadeias de ferramentas mais limpas e uma ronda de verificação própria antes de cada resposta.",
    "Ansehen": "Ver",
    "SideAI": "SideAI",
    "Heute schon da": "Já disponível hoje",
    "Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.": "Chat, Code, Science, Cowork e Design — tudo o que os novos modelos utilizam já está a correr.",
    "SideAI entdecken": "Descobrir o SideAI"
  }
} as unknown as Dict;

const CSS = `
.sl-hero{height:calc(100svh - 64px);min-height:560px;max-height:1100px;background:#050505 url(${POSTER}) center/cover no-repeat;isolation:isolate}
.sl-vid{opacity:0;transition:opacity .8s ease}
.sl-vid.is-on{opacity:1}
.sl-vid::-webkit-media-controls,.sl-vid::-webkit-media-controls-panel,.sl-vid::-webkit-media-controls-overlay-play-button,.sl-vid::-webkit-media-controls-start-playback-button{display:none!important;-webkit-appearance:none;opacity:0!important}
.sl-shade{background:radial-gradient(ellipse 60% 45% at 50% 46%,rgba(10,9,8,.32),rgba(10,9,8,0) 70%)}
.sl-set{opacity:0;transform:translateY(calc(-50% + 14px));transition:opacity 1.1s ease,transform 1.4s cubic-bezier(.22,1,.36,1);text-shadow:0 1px 18px rgba(10,9,8,.35)}
.sl-hero.is-set .sl-set{opacity:1;transform:translateY(-50%)}
.sl-toc{counter-reset:sl}
.sl-toc li{counter-increment:sl}
.sl-toc a::before{content:"[" counter(sl) "]";font-size:13px;flex:none}
.sl-toc a i{flex:1;overflow:hidden;white-space:nowrap;opacity:.75;font-style:normal}
.sl-toc a i::before{content:"................................................................................................................................................................"}
.sl-rv{opacity:0;transform:translateY(14px);transition:opacity .7s ease,transform .9s cubic-bezier(.22,1,.36,1);transition-delay:var(--d,0s)}
.sl-rv.is-in{opacity:1;transform:none}
.sl-fig [data-draw]{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);transition:stroke-dashoffset 1.8s cubic-bezier(.22,1,.36,1);transition-delay:var(--dd,.1s)}
.sl-cap.is-in .sl-fig [data-draw]{stroke-dashoffset:0}
.sl-road-line{width:var(--prog,0%);transition:width 2s cubic-bezier(.22,1,.36,1)}
.sl-faq summary::-webkit-details-marker{display:none}
.sl-plus::before,.sl-plus::after{content:"";position:absolute;left:0;top:6.5px;width:14px;height:1.2px;background:currentColor;transition:transform .35s cubic-bezier(.22,1,.36,1)}
.sl-plus::after{transform:rotate(90deg)}
.sl-faq details[open] .sl-plus::after{transform:rotate(0)}
.sl-body section{scroll-margin-top:96px}
@media (prefers-reduced-motion:reduce){.sl-rv,.sl-set,.sl-fig [data-draw],.sl-road-line{transition:none!important}.sl-rv{opacity:1;transform:none}.sl-fig [data-draw]{stroke-dashoffset:0}}
`;

export default function SintulusLaunch({ locale }: { locale: Loc; model?: string }) {
  const t = makeT(locale as Parameters<typeof makeT>[0], DICT);
  const href = (p: string) => localeHref(locale as Parameters<typeof localeHref>[0], p);
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const video = useRef<HTMLVideoElement>(null);

  // Film: a looping backdrop, so the title stands at once. The still sits behind it and the video
  // only fades in once it really plays, so a browser that blocks autoplay (iOS low power mode)
  // shows the still instead of its play button; the first touch or scroll starts it then.
  // Reduced motion keeps the still.
  useEffect(() => {
    const h = hero.current, v = video.current;
    h?.classList.add("is-set");
    if (!v) return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const on = () => v.classList.add("is-on");
    const kicks = ["pointerdown", "touchstart", "scroll", "keydown"] as const;
    const stop = () => kicks.forEach((k) => window.removeEventListener(k, kick));
    const kick = () => { v.play()?.then(stop, () => {}); };
    v.muted = true;
    v.defaultMuted = true;
    v.setAttribute("muted", "");
    v.addEventListener("playing", on);
    if (reduced) { v.pause(); return () => v.removeEventListener("playing", on); }
    if (!v.paused && v.readyState > 2) on();
    v.play()?.catch(() => kicks.forEach((k) => window.addEventListener(k, kick, { passive: true })));
    return () => { v.removeEventListener("playing", on); stop(); };
  }, []);

  // Line drawings, reveals, roadmap line and the section nav's scroll-spy.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    el.querySelectorAll<SVGGeometryElement>("[data-draw]").forEach((p) => {
      try { p.style.setProperty("--len", String(Math.ceil(p.getTotalLength()) + 1)); } catch {}
    });
    const items = el.querySelectorAll<HTMLElement>(".sl-rv, .sl-cap, .sl-road");
    const show = (n: HTMLElement) => {
      n.classList.add("is-in");
      const line = n.querySelector<HTMLElement>(".sl-road-line");
      if (line) line.style.setProperty("--prog", line.dataset.prog || "100%");
    };
    if (!("IntersectionObserver" in window)) { items.forEach(show); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { show(e.target as HTMLElement); io.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -12% 0px" });
    items.forEach((n) => io.observe(n));

    const links = el.querySelectorAll<HTMLAnchorElement>("[data-spy] a");
    const spy = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return;
        links.forEach((a) => a.toggleAttribute("data-on", a.getAttribute("href") === `#${e.target.id}`));
      });
    }, { rootMargin: "-30% 0px -60% 0px" });
    links.forEach((a) => { const s = document.getElementById(a.getAttribute("href")!.slice(1)); if (s) spy.observe(s); });
    return () => { io.disconnect(); spy.disconnect(); };
  }, []);

  const sections = [
    { id: "intro", label: t("Einführung") },
    { id: "changes", label: t("Was sich ändert") },
    { id: "surfaces", label: t("Wo es läuft") },
    { id: "availability", label: t("Verfügbarkeit und Preis") },
    { id: "roadmap", label: t("Fahrplan") },
  ];
  const facts = [
    { k: t("Status"), v: t("In Arbeit"), live: true },
    { k: t("Erscheint"), v: t("Ende 2026") },
    { k: t("Löst ab"), v: "Sintulus 5" },
    { k: t("Abrechnung"), v: t("Nur über Guthaben") },
  ];
  const caps = [
    {
      title: t("Arbeit über Stunden"),
      text: t("Aufgaben laufen als eigener Lauf weiter, auch wenn das Fenster geschlossen wird, und melden sich, wenn sie fertig sind oder eine Entscheidung brauchen."),
      fig: (
        <>
          <path d="M8 70 H 124" opacity=".4" />
          <path data-draw d="M14 70 A 52 52 0 0 1 118 70" />
          <circle className="text-brand" cx="66" cy="18" r="4" fill="currentColor" stroke="none" />
          <path d="M14 76 V 64 M118 76 V 64" opacity=".6" />
        </>
      ),
    },
    {
      title: t("Forschung mit Beleg"),
      text: t("Zahlen kommen aus der Quelle und aus echtem Python, nie aus dem Gedächtnis des Modells. Jede Abbildung trägt ihre Herkunft mit."),
      fig: (
        <>
          <rect x="10" y="10" width="54" height="68" opacity=".5" />
          <path d="M18 24 H 54 M18 34 H 48 M18 44 H 52" opacity=".5" />
          <path data-draw className="text-brand" d="M64 44 C 84 44, 84 30, 100 30" />
          <circle className="text-brand" cx="106" cy="30" r="6" />
          <path data-draw style={{ "--dd": ".8s" } as CSSProperties} d="M92 62 H 124 M92 70 H 116" />
        </>
      ),
    },
    {
      title: t("Code im ganzen Projekt"),
      text: t("Umbauten über viele Dateien mit Plan, Zwischenständen und Tests — statt einzelner Vorschläge, die man selbst zusammensetzen muss."),
      fig: (
        <>
          <rect x="8" y="8" width="26" height="20" opacity=".5" />
          <rect x="8" y="36" width="26" height="20" opacity=".5" />
          <rect x="8" y="64" width="26" height="16" opacity=".5" />
          <rect x="98" y="30" width="26" height="28" opacity=".5" />
          <path data-draw className="text-brand" d="M34 18 C 66 18, 66 44, 98 44 M34 46 H 98 M34 72 C 66 72, 66 44, 98 44" />
        </>
      ),
    },
    {
      title: t("Räumliches Verständnis"),
      text: t("Moleküle, Strukturen und Szenen in 3D lesen und erzeugen — drehbar im Browser, nicht als flaches Bild."),
      fig: (
        <>
          <circle cx="66" cy="44" r="34" opacity=".5" />
          <ellipse data-draw cx="66" cy="44" rx="34" ry="11" />
          <ellipse data-draw style={{ "--dd": ".5s" } as CSSProperties} cx="66" cy="44" rx="13" ry="34" />
          <ellipse data-draw className="text-brand" style={{ "--dd": ".9s" } as CSSProperties} cx="66" cy="44" rx="34" ry="22" transform="rotate(-32 66 44)" />
        </>
      ),
    },
  ];
  const surfaces = [
    { label: t("Chat"), note: t("Alltagsfragen, lange Verläufe"), href: "/ai" },
    { label: t("Code"), note: t("Echte Projekte, echtes Terminal"), href: "/code" },
    { label: t("Science"), note: t("Datenbanken und eine Python-Kammer"), href: "/science" },
    { label: t("Cowork"), note: t("Fertige Dateien, bereit zum Abzeichnen"), href: "/cowork" },
    { label: t("Öffentliche API"), note: t("Dieselbe Stufe, derselbe Schlüssel"), href: "/developers" },
  ];
  const road = [
    { when: t("Heute"), name: t("Venura 6"), note: t("Die tiefe Stufe für Architektur, Fehlersuche und lange Herleitungen."), state: "done" },
    { when: t("Ende November 2026"), name: t("Venura 6.5"), note: t("Länger bei der Sache, sauberere Werkzeugketten, eigene Prüfrunde."), state: "done", href: "/venura" },
    { when: t("Ende 2026"), name: t("Sintulus 6"), note: t("Die stärkste Stufe, neu aufgebaut, für Arbeit über Stunden."), state: "here" },
  ];
  const faq = [
    { q: t("Brauche ich dafür ein bestimmtes Abo?"), a: t("Nein, nur Guthaben. Das Abo bestimmt die übrigen Stufen und Grenzen; Sintulus rechnet immer direkt über Guthaben ab.") },
    { q: t("Was passiert mit Sintulus 5?"), a: t("Es bleibt nach dem Start eine Übergangszeit lang wählbar. Den Zeitraum nennen wir mit dem Start.") },
    { q: t("Warum so spät im Jahr?"), a: t("Weil wir Sintulus 6 erst freigeben, wenn es die Prüfungen besteht, die wir an Sintulus 5 gelernt haben. Ein früher Termin ist uns weniger wert als ein Modell, dem man lange Aufgaben überlassen kann.") },
  ];

  const h2 = "font-sans text-2xl sm:text-[1.75rem] font-semibold text-ink tracking-[-0.01em] mb-7";
  const para = "font-serif-display text-lg sm:text-xl leading-[1.55] text-ink-muted";

  return (
    <PublicShell locale={locale}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div ref={root}>
        {/* Hero: the deep-water film, title and table of contents set over it */}
        <div className="bg-canvas pt-16">
          <section ref={hero} className="sl-hero relative overflow-hidden" aria-labelledby="sl-title" style={{ color: PAPER }}>
            <video
              ref={video}
              className="sl-vid absolute inset-0 h-full w-full object-cover"
              src={VIDEO}
              muted
              playsInline
              autoPlay
              loop
              preload="auto"
              aria-hidden="true"
            />
            <div className="sl-shade pointer-events-none absolute inset-0" aria-hidden="true" />
            <div className="sl-set absolute inset-x-0 top-1/2 flex flex-col items-center px-5 text-center">
              <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em]">{t("Erscheint Ende 2026")}</p>
              <h1 id="sl-title" className="font-sans font-bold text-[3.2rem] leading-[0.95] sm:text-7xl lg:text-[7.5rem] tracking-[-0.035em]">
                Sintulus 6
              </h1>
              <ol className="sl-toc mt-10 w-[min(420px,90vw)] list-none p-0 text-left font-serif-display text-[15px] leading-[26px]" aria-label={t("Auf dieser Seite")}>
                {sections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="group flex items-baseline gap-1.5">
                      <i aria-hidden="true" />
                      <span className="flex-none group-hover:underline underline-offset-[5px] decoration-1">{s.label}</span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between p-6 sm:p-8">
              <span className="text-[11px] uppercase tracking-[0.16em]" style={{ color: paper(0.6) }}>{t("Sintulus 6 · Vorschau")}</span>
              <span className="hidden sm:block text-[11px] uppercase tracking-[0.16em]" style={{ color: paper(0.45) }}>{t("Erscheint Ende 2026")}</span>
            </div>
          </section>
        </div>

        {/* Article with sticky section nav */}
        <section className="bg-canvas pt-16 lg:pt-24 pb-20 lg:pb-28">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8 grid lg:grid-cols-[220px_minmax(0,720px)_1fr] gap-12 lg:gap-16">
            <aside className="hidden lg:block" aria-label={t("Abschnitte")}>
              <nav data-spy className="sticky top-28 flex flex-col">
                {[...sections, { id: "faq", label: t("Häufige Fragen") }].map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="border-l border-ink/15 py-1.5 pl-3.5 text-sm text-ink-muted transition-colors hover:border-ink hover:text-ink data-[on]:border-ink data-[on]:text-ink"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </aside>

            <div className="sl-body min-w-0 space-y-24 lg:space-y-28">
              <section id="intro">
                <p className="sl-rv font-serif-display text-xl lg:text-2xl leading-[1.42] text-ink">
                  {t("Sintulus 6 ist unsere stärkste Stufe, von Grund auf neu aufgebaut. Für Forschung mit Rechnung und Prüfer, für Code an den schwierigsten Stellen und für Arbeit, die Stunden dauert statt Minuten.")}
                </p>
                <p className={`sl-rv mt-6 ${para}`}>
                  {t("Sintulus 5 ist die Stufe für Aufgaben, bei denen das Ergebnis stimmen muss. Sintulus 6 soll diesen Anspruch über lange Strecken halten: eine Forschungsfrage vom Datensatz bis zur geprüften Abbildung, ein Umbau über ein ganzes Projekt, eine Aufgabe, die man übergibt und am Abend abnimmt.")}
                </p>
                <p className={`sl-rv mt-6 ${para}`}>
                  {t("Dafür arbeitet es nicht allein. Ein Plan, mehrere spezialisierte Schritte und ein Prüfer, der das Ergebnis gegen das Protokoll hält — sichtbar, nachvollziehbar, abbrechbar.")}
                </p>
                <p className="sl-rv my-10 border-l-2 border-brand pl-6 font-serif-display text-[26px] sm:text-[32px] leading-[1.25] tracking-[-0.012em] text-ink">
                  {t("Eine Aufgabe, die man morgens übergibt und am Abend abnimmt.")}
                </p>

                <dl className="sl-rv mt-2 grid grid-cols-2 border-t border-ink">
                  {facts.map((f) => (
                    <div key={f.k} className="border-b border-ink/15 py-4 pr-4">
                      <dt className="text-xs uppercase tracking-[0.12em] text-ink-muted">{f.k}</dt>
                      <dd className="mt-1.5 flex items-center gap-2 font-sans text-base font-medium text-ink">
                        {f.live && <span aria-hidden="true" className="h-[7px] w-[7px] rounded-full bg-brand" />}
                        {f.v}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="sl-rv mt-3 text-xs leading-relaxed text-ink-faint">
                  {t("Vorschau. Angaben zu Umfang und Termin können sich bis zum Start noch ändern.")}
                </p>
                <div className="sl-rv mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <Link href="/dashboard/ai" className="group inline-flex items-center gap-2 bg-ink hover:bg-ink/90 text-canvas text-base px-5 py-3 rounded-lg transition-colors">
                    {t("Sintulus 5 jetzt nutzen")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                  <Link href={href("/pricing")} className="group inline-flex items-center gap-1.5 text-base text-ink hover:text-ink-muted transition-colors">
                    {t("Preise ansehen")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </section>

              <section id="changes">
                <h2 className={`sl-rv ${h2}`}>{t("Was sich ändert")}</h2>
                <ol className="list-none p-0 border-t border-ink/15">
                  {caps.map((c, i) => (
                    <li key={i} className="sl-cap sl-rv grid grid-cols-[40px_minmax(0,1fr)] sm:grid-cols-[56px_minmax(0,1fr)_132px] gap-5 border-b border-ink/15 py-7 items-start">
                      <span className="font-mono text-[13px] leading-[1.9] text-ink-faint tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-sans text-lg font-semibold text-ink">{c.title}</h3>
                        <p className="mt-2 font-serif-display text-base sm:text-lg leading-[1.55] text-ink-muted">{c.text}</p>
                      </div>
                      <svg className="sl-fig hidden sm:block h-[88px] w-[132px] text-ink" viewBox="0 0 132 88" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                        {c.fig}
                      </svg>
                    </li>
                  ))}
                </ol>
              </section>

              <section id="surfaces">
                <h2 className={`sl-rv ${h2}`}>{t("Wo es läuft")}</h2>
                <p className={`sl-rv ${para}`}>
                  {t("Überall dort, wo man heute die Modellstufe wählt — ohne eigenen Zugang und ohne neue Schlüssel.")}
                </p>
                <ul className="sl-rv mt-6 list-none p-0 border-t border-ink/15">
                  {surfaces.map((s) => (
                    <li key={s.href}>
                      <Link href={href(s.href)} className="group flex items-center justify-between gap-4 border-b border-ink/15 py-4 transition-[padding] duration-300 hover:pl-2">
                        <span className="font-sans text-base sm:text-lg font-semibold text-ink">{s.label}</span>
                        <span className="flex-1 text-sm text-ink-muted">{s.note}</span>
                        <ArrowUpRight className="w-4 h-4 text-ink-faint transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>

              <section id="availability">
                <h2 className={`sl-rv ${h2}`}>{t("Verfügbarkeit und Preis")}</h2>
                <p className={`sl-rv ${para}`}>
                  {t("Wie Sintulus 5 läuft Sintulus 6 über Guthaben und nicht über das Freikontingent des Abos. Der Preis richtet sich nach dem Einkaufspreis des Modells und steht zum Start in der Konsole.")}
                </p>
                <p className={`sl-rv mt-6 ${para}`}>
                  {t("Bis dahin bleibt Sintulus 5 die höchste Stufe — alles, was damit heute entsteht, lässt sich später auf Sintulus 6 weiterführen.")}
                </p>
              </section>

              <section id="roadmap">
                <h2 className={`sl-rv ${h2}`}>{t("Fahrplan")}</h2>
                <div className="sl-road relative mt-3 pl-8 sm:pl-0 sm:pt-[34px]">
                  <span aria-hidden="true" className="absolute left-[7px] top-0 bottom-0 w-px bg-ink/15 sm:left-0 sm:right-0 sm:top-[7px] sm:bottom-auto sm:h-px sm:w-auto" />
                  <span aria-hidden="true" data-prog="100%" className="sl-road-line absolute left-0 top-[7px] hidden h-px bg-ink sm:block" />
                  <ol className="grid list-none gap-8 p-0 sm:grid-cols-3 sm:gap-6">
                    {road.map((r) => (
                      <li key={r.name} className="relative">
                        <span
                          aria-hidden="true"
                          className={`absolute -left-8 top-0.5 h-[15px] w-[15px] rounded-full border sm:left-0 sm:-top-[34px] ${
                            r.state === "here" ? "border-brand bg-brand ring-[5px] ring-brand/20" : "border-ink bg-ink"
                          }`}
                        />
                        <span className="mb-2.5 block font-mono text-[11px] uppercase tracking-[0.1em] text-ink-muted">{r.when}</span>
                        <h3 className="font-sans text-lg font-semibold text-ink">
                          {r.href ? <Link href={href(r.href)} className="hover:underline underline-offset-4">{r.name}</Link> : r.name}
                        </h3>
                        <p className="mt-1 font-serif-display text-base leading-[1.5] text-ink-muted">{r.note}</p>
                      </li>
                    ))}
                  </ol>
                </div>
              </section>

              <section id="faq">
                <h2 className={`sl-rv ${h2}`}>{t("Häufige Fragen")}</h2>
                <div className="sl-faq sl-rv border-t border-ink/15">
                  {faq.map((f) => (
                    <details key={f.q} className="border-b border-ink/15">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5">
                        <h3 className="font-sans text-lg font-semibold leading-snug text-ink">{f.q}</h3>
                        <i aria-hidden="true" className="sl-plus relative h-3.5 w-3.5 flex-none text-ink" />
                      </summary>
                      <p className="font-serif-display pb-6 pr-10 text-base sm:text-lg leading-[1.55] text-ink-muted">{f.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </section>

        {/* Read next */}
        <section className="bg-canvas pb-24 lg:pb-32">
          <div className="max-w-[1320px] mx-auto px-5 sm:px-8">
            <h2 className="sl-rv font-sans text-2xl font-semibold text-ink mb-8">{t("Weiterlesen")}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link
                href={href("/venura")}
                className="sl-rv group relative overflow-hidden rounded-3xl p-8 lg:p-10 min-h-[300px] flex flex-col justify-between"
                style={{ background: "#141413" }}
              >
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em]" style={{ color: paper(0.55) }}>{t("Ende November 2026")}</div>
                  <h3 className="mt-4 font-sans text-4xl lg:text-5xl font-bold tracking-[-0.02em]" style={{ color: PAPER }}>{t("Venura 6.5")}</h3>
                  <p className="mt-4 font-serif-display text-lg leading-[1.45] max-w-[34ch]" style={{ color: paper(0.72) }}>
                    {t("Mehr Ausdauer bei langen Aufgaben, sauberere Werkzeugketten und eine eigene Prüfrunde vor jeder Antwort.")}
                  </p>
                </div>
                <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg px-4 py-2.5 text-sm" style={{ background: PAPER, color: "#141413" }}>
                  {t("Ansehen")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
              <Link
                href={href("/ai")}
                className="sl-rv group rounded-3xl bg-canvas-subtle p-8 lg:p-10 min-h-[300px] flex flex-col justify-between"
                style={{ "--d": ".08s" } as CSSProperties}
              >
                <div>
                  <div className="text-[11px] uppercase tracking-[0.16em] text-ink-muted">{t("SideAI")}</div>
                  <h3 className="mt-4 font-sans text-4xl lg:text-5xl font-bold tracking-[-0.02em] text-ink">{t("Heute schon da")}</h3>
                  <p className="mt-4 font-serif-display text-lg leading-[1.45] text-ink-muted max-w-[34ch]">
                    {t("Chat, Code, Science, Cowork und Design — alles, worauf die neuen Modelle aufsetzen, läuft jetzt schon.")}
                  </p>
                </div>
                <span className="mt-8 inline-flex w-fit items-center gap-2 rounded-lg bg-ink px-4 py-2.5 text-sm text-canvas">
                  {t("SideAI entdecken")}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
