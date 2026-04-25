## 🎓 Smart Manager

**Smart Manager** egy modern, webalapú oktatási projektmenedzsment rendszer, amely segíti a tanárok és diákok közötti hatékony együttműködést, feladatkezelést és kommunikációt — mindezt egyetlen, átlátható felületen.

> A projekt ötlete abból a tapasztalatból született, hogy tanárok nehézségekről számoltak be csoportos iskolai projektek nyomon követésénél és értékelésénél. A Smart Manager célja egy egységes platform biztosítása, ahol a feladatkezelés, fájlmenedzsment és valós idejű kommunikáció egy helyen érhető el.

---

## Tartalomjegyzék

- [A projektről](#a-projektről)
- [Rendszerkövetelmények](#rendszerkövetelmények)
- [Technológiai stack](#technológiai-stack)
- [Projekt struktúra](#projekt-struktúra)
- [Telepítés és futtatás](#telepítés-és-futtatás)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Asztali adminisztrációs alkalmazás](#asztali-adminisztrációs-alkalmazás)
  - [Docker (opcionális)](#docker-opcionális)
- [Környezeti változók](#környezeti-változók)
- [Felhasználói szerepkörök és funkciók](#felhasználói-szerepkörök-és-funkciók)
- [API végpontok](#api-végpontok)
- [Adatbázis](#adatbázis)
- [Tesztelés](#tesztelés)
- [Dokumentációk](#dokumentációk)
- [Szerzők](#szerzők)

---

## A projektről

A Smart Manager három fő komponensre épül, amelyek együtt alkotnak egy teljes oktatási menedzsment rendszert:

| Komponens | Leírás |
|-----------|--------|
| **Frontend** | Vue 3 alapú webalkalmazás diákok, tanárok és adminok számára |
| **Backend** | Node.js / Express REST API — valós idejű chat, videóhívás, fájlkezelés, email küldés |
| **Asztali alkalmazás** | C# / WinUI 3 alapú Windows adminisztrációs felület (SMadmin) |

### Főbb jellemzők

- Szerepkör-alapú irányítópultok (diák / tanár / admin)
- Valós idejű chat (Socket.IO) és WebRTC videóhívás
- Feladat-menedzsment: létrehozás, kiosztás, értékelés, fájlfeltöltés
- Értékelési rendszer: pontszám, jegy, visszajelzés
- Csoportmunka és projektmenedzsment
- Adatvizualizáció (Chart.js alapú statisztikák)
- Email megerősítés és fiók-reaktiváció (Nodemailer)
- Útvonal-védelem (route guards) a jogosultság alapú navigációhoz
- Swagger API dokumentáció
- Docker-alapú telepíthetőség

---

## Rendszerkövetelmények

| Eszköz | Minimális verzió |
|--------|-----------------|
| Node.js | >= 18.0.0 |
| PostgreSQL | >= 13 |
| .NET SDK | 8 (asztali alkalmazáshoz) |
| Windows | 10 / 11 (asztali alkalmazáshoz) |
| Docker | opcionális |

---

## Technológiai stack

### Frontend
| Technológia | Verzió | Felhasználás |
|-------------|--------|--------------|
| Vue.js | ^3.5.21 | Frontend keretrendszer |
| Vue Router | ^4.5.1 | Útvonalak kezelése, route guards |
| Vite | ^7.1.7 | Build és fejlesztői szerver |
| Socket.IO client | ^4.8.3 | Valós idejű chat és WebRTC jelzés |
| Chart.js | ^4.5.1 | Adatvizualizáció |
| Moment.js | ^2.30.1 | Dátum- és időkezelés |

### Backend
| Technológia | Verzió | Felhasználás |
|-------------|--------|--------------|
| Node.js | >= 18 | Szerver futtatókörnyezet |
| Express | ^5.1.0 | REST API keretrendszer |
| PostgreSQL (pg) | ^8.16.3 | Adatbázis |
| Socket.IO | ^4.8.3 | Valós idejű chat és WebRTC videóhívás |
| JSON Web Token | ^9.0.3 | Hitelesítés (access + refresh token) |
| bcryptjs | ^3.0.3 | Jelszó-titkosítás |
| Nodemailer | ^8.0.2 | Email küldés |
| express-validator | ^7.3.1 | Bemeneti adatok validációja |
| express-rate-limit | ^7.5.0 | Rate limiting |
| swagger-jsdoc + ui | ^6 / ^5 | Interaktív API dokumentáció |
| db-migrate | ^0.11.14 | Adatbázis migráció |

### Asztali alkalmazás (SMadmin)
| Technológia | Leírás |
|-------------|--------|
| C# / .NET 8 | Programozási nyelv és platform |
| WinUI 3 (Windows App SDK) | Grafikus felhasználói felület |

---

## Telepítés és futtatás

### Backend

1. Lépj be a backend mappájába:
   ```bash
   cd Backend/SM_backend
   ```

2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

3. Hozz létre egy `.env` fájlt a `.env.example` alapján (lásd: [Környezeti változók](#környezeti-változók)):
   ```bash
   cp .env.example .env
   ```

4. Futtasd az adatbázis-migrációkat:
   ```bash
   npm run build
   ```

5. (Opcionális) Töltsd fel a tesztadatokat:
   ```bash
   npm run seed
   ```

6. Indítsd el a szervert:
   ```bash
   # Fejlesztői módban (automatikus újraindítással):
   npm run dev

   # Éles módban:
   npm start
   ```

A backend alapértelmezetten a `http://localhost:3000` címen fut.
Swagger UI (fejlesztői módban): `http://localhost:3000/api-docs`
Állapot-ellenőrzés: `http://localhost:3000/api/health`

---

### Frontend

1. Lépj be a frontend mappájába:
   ```bash
   cd Frontend/SmartManager
   ```

2. Telepítsd a függőségeket:
   ```bash
   npm install
   ```

3. Indítsd el a fejlesztői szervert:
   ```bash
   npm run dev
   ```

4. Éles build készítéséhez:
   ```bash
   npm run build
   npm run preview
   ```

A frontend alapértelmezetten a `http://localhost:5173` címen fut.

---

### Asztali adminisztrációs alkalmazás

1. Nyisd meg az `SMadmin.sln` fájlt **Visual Studio 2022**-ben (vagy újabb verzióban).
2. Győződj meg róla, hogy a **Windows App SDK** és a **.NET 8** telepítve van.
3. Ellenőrizd, hogy a backend fut és elérhető a `http://localhost:3000` címen.
4. Fordítsd le és futtasd az alkalmazást (**F5** vagy **Ctrl+F5**).

---

### Docker (opcionális)

```bash
cd Backend/SM_backend

# Image buildelése:
docker build -t sm-backend .

# Konténer indítása:
docker run -p 3000:3000 --env-file .env sm-backend
```

---

## Környezeti változók

Hozz létre egy `.env` fájlt a `Backend/SM_backend/` mappában a `.env.example` alapján:

```env
# Adatbázis
DB_HOST=localhost
DB_PORT=5432
DB_NAME=smart_manager
DB_USER=postgres
DB_PASSWORD=jelszo
DB_ENV=production

# JWT
JWT_ACCESS_SECRET=titkos_access_kulcs
JWT_REFRESH_SECRET=titkos_refresh_kulcs

# Email (Nodemailer)
EMAIL_USER=email@pelda.hu
EMAIL_PASS=email_jelszo

# CORS (engedélyezett frontend originek)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Socket.IO
SOCKET_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Email megerősítő URL-ek (frontend útvonalak)
EMAIL_VERIFICATION_URL_BASE=http://localhost:5173/verify-email
ACCOUNT_REACTIVATION_URL_BASE=http://localhost:5173/reactivate-account

# Szerver
PORT=3000
NODE_ENV=development
BIND_HOST=localhost

# Rate limiting (max kérés per 15 perc per IP az auth végpontokon)
AUTH_RATE_LIMIT_MAX=100
```

---

## Felhasználói szerepkörök és funkciók

### Vendég (nem regisztrált felhasználó)
- Kezdőoldal megtekintése
- Általános szerződési feltételek olvasása
- Bejelentkezés / Regisztráció (jelszóerősség-ellenőrzéssel)
- Kapcsolatfelvétel

### Diák
- Személyes dashboard — feladatstatisztikák (aktív, befejezett, közelgő, késésben)
- Feladatok megtekintése, beadása, fájlfeltöltés
- Értékelések megtekintése (pontszám, jegy, visszajelzés)
- Projektmunka / csapatmunka
- Valós idejű chat (Socket.IO) és WebRTC videóhívás
- Profilbeállítások, jelszóváltoztatás, fiók deaktiválás
- Sötét / világos téma váltás

### Tanár
- Tanári dashboard — aktív feladatok, beadások, késések, Chart.js statisztikák
- Feladatok létrehozása, szerkesztése, törlése, felhasználók hozzárendelése
- Projektek kezelése: létrehozás, tagok meghívása, feladatok hozzárendelése
- Beadások értékelése (pontszám, jegy, visszajelzés)
- Diák statisztikájának megtekintése
- Valós idejű chat (Socket.IO) és WebRTC videóhívás
- Profilbeállítások, jelszóváltoztatás, fiók deaktiválás

### Admin (webes felület)
- Felhasználók listázása, keresése, szerepkör-szűrése, törlése
- Projektek listázása, keresése, státusz-szűrése, törlése
- Beadások áttekintése és szűrése

### Admin (asztali alkalmazás – SMadmin)
- JWT alapú bejelentkezés
- Dashboard: rendszerstatisztikák és jóváhagyásra váró tanárok aktiválása
- Felhasználók kezelése: keresés, szerepkör-szűrés, lapozás, törlés
- Projektek kezelése: keresés, státusz-szűrés, lapozás, törlés
- Beadások kezelése: státusz-szűrés, lapozás

---

## API végpontok

### Hitelesítés – `/api/auth`
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `POST` | `/api/auth/register` | Új felhasználó regisztrációja (tanár vagy diák) |
| `POST` | `/api/auth/login` | Bejelentkezés, JWT token visszaadása |
| `POST` | `/api/auth/refresh` | Access token megújítása refresh tokennel |
| `GET` | `/api/auth/profileData` | Bejelentkezett felhasználó adatainak lekérése |
| `GET` | `/api/auth/verify-email` | Email cím megerősítése |

### Projektek – `/api`
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `GET` | `/api/projects` | Felhasználóhoz tartozó projektek listája |
| `POST` | `/api/newProject` | Új projekt létrehozása |
| `PUT` | `/api/projectUpdate/:id` | Projekt adatainak frissítése |
| `DELETE` | `/api/deleteProject/:id` | Projekt törlése |

### Üzenetek – `/api/messages`
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `GET` | `/api/messages/allMessages` | Üzenetek lekérése (privát vagy projekt chat) |
| `POST` | `/api/messages/sendMessage` | Üzenet küldése |
| `PUT` | `/api/messages/editMessage/:id` | Üzenet szerkesztése |
| `DELETE` | `/api/messages/deleteMessage/:id` | Üzenet törlése |

### Fájlok és beadások – `/api/files`
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `GET` | `/api/files/upload` | Feltöltési előzmények lekérése |
| `GET` | `/api/files/submission` | Beadások listázása (szerepkör alapján) |
| `POST` | `/api/upload` | Fájl feltöltése egy beadáshoz |

### Admin – `/api/admin`
| Metódus | Végpont | Leírás |
|---------|---------|--------|
| `GET` | `/api/admin/users` | Felhasználók listázása (szűrés, lapozás) |
| `GET` | `/api/admin/user/:id` | Egy felhasználó részletes adatai |
| `PUT` | `/api/admin/user/:id` | Felhasználó adatainak frissítése (pl. aktiválás) |
| `DELETE` | `/api/admin/user/:id` | Felhasználó törlése |
| `GET` | `/api/admin/projects` | Projektek listázása (szűrés, lapozás) |
| `DELETE` | `/api/admin/project/:id` | Projekt törlése |
| `GET` | `/api/admin/submissions` | Beadások listázása (szűrés, lapozás) |
| `GET` | `/api/admin/stats` | Rendszerstatisztikák lekérése |
| `GET` | `/api/health` | Szerver és adatbázis állapot ellenőrzése |

> A teljes, interaktív API dokumentáció Swagger UI-on érhető el fejlesztői módban: `http://localhost:3000/api-docs`

---

## Adatbázis

A rendszer **PostgreSQL** adatbázist használ. Az adatbázis-migrációkat a `db-migrate` eszköz kezeli, a seeder script tesztadatokat tölt fel.

| Tábla | Leírás |
|-------|--------|
| `Felhasznalo` | Felhasználók (diák, tanár, admin) — szerepkör, aktív státusz, email megerősítés, utolsó bejelentkezés |
| `Projekt` | Projektek — név, leírás, létrehozó, státusz (tervezés / aktív / lezárt / archivált), határidő |
| `ProjektTag` | Projekt tagságok (Felhasznalo ↔ Projekt, több-több kapcsolat) |
| `Feladat` | Feladatok — projekthez rendelve, határidővel és státusszal |
| `FeladatKomment` | Feladatokhoz fűzött kommentek |
| `Beadas` | Beadások — feladat–diák–tanár kapcsolat, pontszám, maximális pontszám, jegy, visszajelzés |
| `File` | Feltöltött fájlok — beadáshoz és feladathoz kapcsolva, fájlnév, méret, típus, elérési út |
| `Uzenet` | Üzenetek — privát (küldő ↔ fogadó) és projekt chat, módosítás időpontjával |
| `Statisztika` | Felhasználói és projekt statisztikák |
| `Naplo` | Rendszer aktivitási napló |

---

## Tesztelés

### Frontend tesztelés — Robot Framework

Az automatizált frontend tesztek **Robot Framework** keretrendszerrel készültek, **RIDE IDE**-ben, a **SeleniumLibrary** könyvtár és **Chrome** böngésző segítségével.

| Tesztfájl | Tesztesetek |
|-----------|-------------|
| `Basic_Test.robot` | Bejelentkezés + kijelentkezés, regisztráció |
| `Beallitasok_Test.robot` | Jelszóváltoztatás és visszaállítás, fiók deaktiválás |
| `Chat_Test.robot` | Üzenetküldés és fogadás két felhasználó között |
| `Tanar_Test.robot` | Projekt feladat hozzáadás, felhasználó hozzárendelés, diák értékelése, statisztika megtekintése |
| `Diak_Test.robot` | Diák feladatbeadás |

A tesztek futtatásához:
```bash
cd Frontend/Frontend_Test
robot Basic_Test.robot
robot Tanar_Test.robot
# stb.
```

### Backend tesztelés — Insomnia

A REST API végpontok tesztelése **Insomnia** API klienssel történt — a végpontok helyes működésének és HTTP státuszkódjainak ellenőrzése.

Tesztelt végpontok: felhasználói adatok lekérése, feladat frissítése, feladat komment létrehozása, beszélgetés lekérdezése, beadás létrehozása, üzenet törlése.

Az Insomnia workspace exportfájlja: `Backend/Insomnia_2026-04-13.yaml`

### Asztali alkalmazás tesztelése

Az SMadmin tesztjei az `Asztali_Teszt.xlsx` fájlban dokumentáltak.

---

## Dokumentációk

| Dokumentum | Leírás |
|------------|--------|
| `Dokumentáció_MagyarMárk_NagyHuba.docx` | Teljes projekt dokumentáció |
| `Szoftverspecifikacio_MagyarMark_NagyHuba.docx` | Szoftverspecifikáció és projekt adatlap |
| `Felhasználói kézikönyv.docx` | Részletes felhasználói útmutató képernyőképekkel |
| `Adatszerkezet_MagyarMárk_NagyHuba.docx` | Adatbázis-szerkezet és táblaleírások |
| `Algoritmus_dokumentáció.docx` | Algoritmus specifikáció folyamatábrákkal |
| `Tesztelés_dokumentáció_MagyarMárk_NagyHuba.docx` | Frontend és backend tesztelési dokumentáció |
| `Gantt-projekttervező_SM.xlsx` | Projekt időterv (Gantt diagram) |
| `Smart Manager.drawio` | Rendszer- és adatbázis-tervező diagram |

---

## Szerzők

A projektet a **13_S2_4** csoport készítette vizsgaremekként.

| Név | Feladatkör |
|-----|-----------|
| **Magyar Márk József** | Frontend fejlesztés |
| **Nagy Huba Kende** | Backend fejlesztés |

---

> *© 2025 Smart Manager. Minden jog fenntartva.*
