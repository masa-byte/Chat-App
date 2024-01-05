Pozdrav :D
Da biste pokrenuli aplikaciju, potrebno je da imate node.js instaliran, a sa njim i npm, zatim ng za Angular i nest za Nest.
Ja sam napisala setup.ps1 koji ce da skine node.js ako ga vec nemate, onda ga instalirajte i ponovo pokrenite setup.ps1 koji ce sada
da pokrene instalira i ng i nest, a zatim sledecim pokretanjem podici ce server i 2 klijenta i otvorice klijente u web browseru.

Aplikacija je napravljena da moze da radi za vise klijenata, ali je potrebno da se u config fajlovima i za backend i za frontend 
dodeli port na kome ce da se pokrenu klijenti i sa tim i id i ime.
Ukoliko zelite da probate sa 3 klijenta, config fajlovi su podeseni (otkomentarisite deo), samo treba dodati u package.json sledecu liniju:
"start:client3": "cd chat-frontend && start /B ng serve --port 4202 -o"
(i zarez na kraju prethodne linije)

Implementirane su sve CRUD metode, ali samo dve se koriste kod klijenta, jer je to bilo u sklopu zadatka za sada.
Posto je skoro sve implementirano asinhrono, nema nikakvog blokiranja niti cekanja.
Zelela sam da CRUD operacije nad porukama idu preko HTTP zahteva, a ne preko soketa, jer oni meni sluze za obavestenja file system watchera.
Kako se svuda koristi fsPromises, nema race condition-a, jer se sve operacije izvrsavaju asinhrono.
Takodje su i svi file system watcheri asinhroni, tako da bi trebalo da se sve promene korektno detektuju.
Enkriptovani fajlovi se cuvaju u files/encrypted direktorijumu, koji se ponasa kao neka vrsta baze, a kada stignu klijentu, onda se vrsi dekripcija
sa klijentske strane i upisuju se u files/decrypted, sto simulira da korisnik downloaduje fajl koji se onda lokalno dekriptuje i takav i sacuva.

Postoji posebna c# aplikacija koja se stara o kriptovanju i dekriptovanju poruka, posto typescript ne radi dobro sa time.
Ova aplikacija takodje vrsi hesiranje fajlova za verifikaciju integriteta.
Ona se nalazi u folderu Ciphers i bice pokrenuta uz dotnet run zajedno sa ostatkom aplikacije.

Prave se shared folderi i ako se menja izmedju cetova, ucitavace se poruke nastale TOKOM TE SESIJE.
Kada se sesija zavrsi i pokrene druga, svi folderi se brisu i prave se novi.

Za oslobadjanje portova na kraju, koristite sledece komande:
netstat -ano | findstr :<port>
koji daje PID procesa koji koristi dati port, a onda
taskkill /PID <PID> /F 


