



folgendes:







choice: nur wenn level gleich hoch: springt zu nächster choice via nextchoice
wenn keine nextchoice: finishedcollecting

wenn level niedriger oder höher, dann ist es bug!!!!
wenn alles korrekt ist, sollte das nämlich nicht passieren (hoffe ich)


letzte line con block hüpft zu gather, wenn es continuation hat


was aber, wenn es keine hat? weil autor
fälschlicherweise kein gather gesetzt hat?

dann läuft man in choice mit tieferem level: runtime error.





