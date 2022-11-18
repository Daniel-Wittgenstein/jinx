
Vorsicht: jin/jinx sehr ähnlich. vielleicht jinx später zu $jinx ändern. (nah, jinx hat doch eh keine
relevanten methoden, die man verwechseln könnte)


Scrollback ist erstmal kein Feature, weil wir genug andere Probleme haben und
sonst nie fertig werden. Scrollback ist eh ein Scheiß und war immer ein Scheiß.

#############################

es gibt folgende Befehle für den User:

jin.createPanel
  -> erschafft einen neuen outputContainer

jin.output
  -> setzt das aktuelle Panel, wo output geschehen soll

jin.say
  -> schreibt ein neues output paragraph element ins aktuelle panel.

jin.takeTurnFrom (ehemals jin.goto)

  -> geht sofort zu label oder knot
  wichtig ist hier aber:
    es sollte nur so benutzt werden:
    - in einem onclick event von einem link/button
    - in einem setTimeout event, das würde wahrscheinlich nicht zu problemen
      führen, weil setTimeout immer erst nach turn abarbeitung getriggert wird.
      aber zur sicherheit testen!!!!

    - NEIN in einem before oder after effect. NEIN SIEHE DIVERT UNTEN, SAUBERE ART ES ZU MACHEN

    in welchen effects ergibt das sinn?
    in einem effect appstart und dort in einem click handler
    oder einem settimeout handler

    wo ergibt es null sinn?
    in einem get/set/onVariableChange event

    es gibt einen fundamentalen unterschied zwischen goto im sinne:
    sage jinx: mache bei dieser line mit der ausführung weiter
    und goto im sinne von: fangen einen neuen zug von hier aus an
    das letztere involviert den runner und alle before/after effekte müssen
    ausgeführt werden. das erste würde innerhalb des jinx-flows
    hin und her hüpfen, aber ich bin nicht überzeugt davon. das ist nur
    im rahmen von after und before sinnvoll und dafür hat der runner schon
    das divert-rückgabe feature, d.h. ich würde jin.goto wirklich darauf
    beschränken einen neuen zug zu triggern! und demensprechend dürfte kein
    effect aufrufen, außer ein event handler/eine funktion innerhalb eines appstart effects.
    aber nicht mal da ist es nötig, die funktion in einen appstart effekt zu wrappen, oder?
    kann die Funktion nicht einfach so jin verwenden, es ist ja schon vorher definiert,
    was ist das problem? Wozu ist appStart überhaupt gut? weil wir z.B.
    popup zeigen wollen wenn seite neu geladen/geöffnet wird und wir nur einen
    onload event haben, aber tausend appStart effecte registrieren können. das ist der nutzen.
    oder um event handler zu registrieren, weil sonst dom noch nicht ready ist!!!
    womit diese funktion innerhalb von appstart wieder sinnvoll wird.
    aber, wie gesagt, es ist der einzige effekt, wo goto erlaubt sein sollte
    und auch nicht direkt ausgeführt, sondern nur in einen event handler genestet.
    mit einer global variable sollte es sogar möglich sein, zu verhindern,
    dass jin.goto direkt in appStrat aufgeführt wird, weil die variable
    NACH ALLEN APPSTART EFFECTS wieder neutralisiert werden kann.
    Variable muss noch nicht mal global sein, sie kann nur in runner gültig sein,
    aber dort global.

    sollte heißen: takeTurnFrom


Was ist wenn wir jin.goto nur von einem inline js aus erlauben würden?
und das mit entsprechender globaler variable garantieren würden?
Dann könnte man auch z.B. zu einem beliebig ausgewählten knot springen
(Beispiel: three random deaths oder random begegnungen k.A.)
vielleicht später, aber das meiste davon kann man mit divert in after/before machen


jin.choice
  NOT A THING!!!! wie sollte das auch funktionieren? nesting geht ja nicht.
  will man eine simple goto-choice programmatisch erstellen, dann könnte man
  einfach button mit onclick(jin.goto) benutzen.

#############################

Intern:

jinx braucht diese drei Methoden:

  jinx.selectChoice (public) (gibt's schon) ok

  jinx.jumpTo (public) (NEUE METHODE) ok

  jinx.kickOff (public) ok

Die zweite führt von einem label oder knot aus aus
und ist wichtig (s.u. wieso) Sie ist für runner.js gemacht, nicht für den user!

#############################

so läuft ein turn ab:

- du klickst was an

- IM RUNNER: before effects werden getriggert
  wenn ein before effekte zurückgibt:
    {divert: true, target: "labelorknotname"}
  dann tritt ein besonderer divert-effekt ein.
  dann wird ein divert-target von "labelknotorname" gesetzt.
  die weiteren before-effekte laufen immer noch alle durch!

- IM RUNNER: wenn alle before-effekte durchgelaufen sind,
  wird geguckt, ob es ein divert-target gibt.
  wenn ja, wird jinx.jumpTo("knotorlabelname") aufgerufen.
  d.h. wir springen direkt an einen anderen knot (oder label)

  wenn es kein aktuelles divert-target gibt,
  wird jinx.selectChoice(choiceIndex) aufgerufen, d.h. wir springen
  wir zu der Zeile nach der choice (die ganz einfach ermittelt werden kann,
  d.h. die choice wird ganz normal gewählt, es tritt kein before-effect
  in kraft, der irgendwas overridet.)

- JINX: in beiden fällen führt dann jinx von der gewählten zeile 
  ausgehend zeilen nacheinander aus.

- RUNNER: jedes Mal, wenn ein event von jinx zurück zum runner geschickt wird,
  der choice oder textpara ist, wird
  ein entsprechendes element in den current output container gepusht

  bei textpara: text content string läuft durch paragraphText und allText effects
    und ist danach fixiert. (das hier ist exakt dasselbe wie jin.say aufzurufen!)

  bei choicepara: text content string läuft durch choiceText und allText effects
    und ist danach fixiert

- wenn Jinx den Event an den runner schickt, dass es fertig ist mit Durchlaufen
  (entweder spiel zu Ende oder einfach warten auf nächste Choice-Auswahl), dann
  führt der runner die after-effects aus. die after effects können natürlich
  auch jin.say aufrufen.

- RUNNER: wenn ein after-effect zurückgibt:
  {divert: true, target: "labelorknotname"}
  dann merkt sich der runner das wieder.

- nachdem alle after-effects durchgelaufen sind,
  schaut der runner, ob es ein aktuelles divert gibt.

  wenn JA, ruft er jinx.startExecFrom("knotorlabelname") auf
  und das Ganze geht wieder, bis Jinx den Event an den Runner schickt, dass es fertig ist.

  wenn NEIN, geht es weiter

- RUNNER: TRIM der runner kann jetzt alte einträge aus dem outputContainer
  löschen, z.B. alle, um nur die neuesten einträge anzuzeigen oder nur bestimmte
  alte (scrollback von n Zügen) usw.

- RUNNER: CONVERT_TO_HTML jetzt holt der runner die abstrakten inhalte der outputContainer
  und konvertiert sie zu html, inklusive richtige ids/data attrubites für choices, damit
  klick-handler für diese funktionieren.

- RUNNER: BEFORE_RENDER jetzt führt der Runner die effects beforeRender aus!
  diese können das HTML noch modifizieren. der häufigste use case hier ist:
  asset injection! (ist ein before-render effekt).

- RUNNER: RENDER jetzt rendert der runner alle outputContainer (mit dem Inhalt, den sie noch enthalten).
  Natürlich wird sich der Inhalt dieser Container in der Regel verändert haben.
  D.h. hier wird erst wirklich das innerHTML der Container verändert.

#############################

Wie funktioniert einen Spielstand laden?

Jeder Spielstand enthält alle outputContainer und ihren Inhalt.

Nach dem Wiederherstellen des Spielstands werden einfach nur die Schritte
ausgeführt: RUNNER: CONVERT_TO_HTML inklusive BEFORE_RENDER, RUNNER: RENDER

Spielstände können natürlich vor dem Speichern auch getrimmt werden,
d.h. die outputcontainerstates getrimmt werden, damit sie nicht zu groß werden:
RUNNER: TRIM


#############################

Das ist es im Wesentlichen!