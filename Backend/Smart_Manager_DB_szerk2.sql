CREATE TABLE "Felhasznalo" (
  "id" int PRIMARY KEY,
  "felhasznalonev" text UNIQUE NOT NULL,
  "jelszo" text NOT NULL,
  "email" text UNIQUE NOT NULL,
  "teljes_nev" text,
  "szerep_tipus" text NOT NULL,
  "letrehozas_idopont" timestamp DEFAULT (now()),
  "utolso_bejelentkezes" timestamp,
  "elerheto" bool DEFAULT true,
  "aktiv" bool DEFAULT true
);

CREATE TABLE "Projekt" (
  "id" int PRIMARY KEY,
  "projekt_nev" text NOT NULL,
  "leiras" text,
  "letrehozo_id" int NOT NULL,
  "statusz" text,
  "letrehozas_idopont" timestamp DEFAULT (now()),
  "hatarido" timestamp
);

CREATE TABLE "ProjektTag" (
  "projekt_id" int,
  "felhasznalo_id" int,
  "csatlakozas_idopont" timestamp DEFAULT (now()),
  PRIMARY KEY(projekt_id,felhasznalo_id)
);

CREATE TABLE "Feladat" (
  "id" int PRIMARY KEY,
  "projekt_id" int NOT NULL,
  "feladat_nev" text NOT NULL,
  "feladat_leiras" text,
  "letrehozo_id" int NOT NULL,
  "felelos_id" int,
  "prioritas" text DEFAULT 'közepes',
  "statusz" text DEFAULT 'folyamatban',
  "hatarido" timestamp,
  "letrehozas_idopont" timestamp DEFAULT (now()),
  "modositas_idopont" timestamp
);

CREATE TABLE "FeladatKomment" (
  "id" int PRIMARY KEY,
  "feladat_id" int NOT NULL,
  "felhasznalo_id" int NOT NULL,
  "komment_szoveg" text NOT NULL,
  "letrehozas_idopont" timestamp DEFAULT (now())
);

CREATE TABLE "Beadas" (
  "id" int PRIMARY KEY,
  "feladat_id" int NOT NULL,
  "felhasznalo_id" int NOT NULL,
  "tanar_id" int NOT NULL,
  "pontszam" int,
  "jegy" int,
  "statusz" text DEFAULT 'hiányzik',
  "visszajelzes" text,
  "bekuldes_idopont" timestamp DEFAULT (now()),
  "ertekeles_idopont" timestamp
);

CREATE TABLE "File" (
  "id" int PRIMARY KEY,
  "beadas_id" int,
  "felhasznalo_id" int NOT NULL,
  "file_nev" text NOT NULL,
  "file_meret" int,
  "file_tipus" text,
  "feltoltes_idopont" timestamp DEFAULT (now()),
  "file_eleresiut" text
);

CREATE TABLE "Uzenet" (
  "id" int PRIMARY KEY,
  "kuldo_id" int NOT NULL,
  "fogado_id" int,
  "projekt_id" int,
  "uzenet_tartalom" text NOT NULL,
  "allapot" text DEFAULT 'elküldve',
  "kuldes_ideje" timestamp DEFAULT (now())
);

CREATE TABLE "Statisztika" (
  "id" int PRIMARY KEY,
  "felhasznalo_id" int,
  "projekt_id" int,
  "statisztika_nev" text NOT NULL,
  "ertek" int,
  "meresi_idopont" timestamp DEFAULT (now()),
  "pontszam" int
);

CREATE TABLE "Naplo" (
  "id" int PRIMARY KEY,
  "felhasznalo_id" int NOT NULL,
  "projekt_id" int,
  "feladat_id" int,
  "muvelet" text NOT NULL,
  "leiras" text,
  "idopont" timestamp DEFAULT (now())
);

ALTER TABLE "Projekt" ADD FOREIGN KEY ("letrehozo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "ProjektTag" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "ProjektTag" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Feladat" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "Feladat" ADD FOREIGN KEY ("letrehozo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "FeladatKomment" ADD FOREIGN KEY ("feladat_id") REFERENCES "Feladat" ("id");

ALTER TABLE "FeladatKomment" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Beadas" ADD FOREIGN KEY ("feladat_id") REFERENCES "Feladat" ("id");

ALTER TABLE "Beadas" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Beadas" ADD FOREIGN KEY ("tanar_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "File" ADD FOREIGN KEY ("beadas_id") REFERENCES "Beadas" ("id");

ALTER TABLE "File" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Uzenet" ADD FOREIGN KEY ("kuldo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Uzenet" ADD FOREIGN KEY ("fogado_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Uzenet" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "Statisztika" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Statisztika" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "Naplo" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Naplo" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "Naplo" ADD FOREIGN KEY ("feladat_id") REFERENCES "Feladat" ("id");
