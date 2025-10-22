CREATE TABLE "Felhasznalo" (
  "id" INT PRIMARY KEY,
  "felhasznalonev" "VARCHAR(50)" UNIQUE NOT NULL,
  "jelszo" "VARCHAR(255)" NOT NULL,
  "email" "VARCHAR(255)" UNIQUE NOT NULL,
  "teljes_nev" "VARCHAR(100)" NOT NULL,
  "letrehozas_idopont" TIMESTAMP DEFAULT (now()),
  "utolso_bejelentkezes" TIMESTAMP,
  "elerheto" BOOLEAN DEFAULT true
);

CREATE TABLE "Szerep" (
  "id" INT PRIMARY KEY,
  "felhasznalo_id" INT,
  "projekt_id" INT,
  "szerep_tipus" "VARCHAR(50)"
);

CREATE TABLE "SzerepEngedely" (
  "id" INT PRIMARY KEY,
  "szerep_id" INT NOT NULL,
  "jogosultsagok" "VARCHAR(255)"
);

CREATE TABLE "Projekt" (
  "id" INT PRIMARY KEY,
  "projekt_nev" "VARCHAR(255)" NOT NULL,
  "leiras" TEXT,
  "letrehozo_id" INT NOT NULL,
  "statusz" "VARCHAR(50)",
  "letrehozas_idopont" TIMESTAMP DEFAULT (now()),
  "hatarido" DATE
);

CREATE TABLE "ProjektTag" (
  "projekt_id" INT,
  "felhasznalo_id" INT,
  "csatlakozas_idopont" TIMESTAMP DEFAULT (now()),
  "PRIMARY" "KEY(projekt_id,felhasznalo_id)"
);

CREATE TABLE "Feladat" (
  "id" INT PRIMARY KEY,
  "projekt_id" INT NOT NULL,
  "feladat_nev" "VARCHAR(255)" NOT NULL,
  "feladat_leiras" TEXT,
  "letrehozo_id" INT NOT NULL,
  "felelos_id" INT,
  "prioritas" "VARCHAR(20)" DEFAULT 'közepes',
  "statusz" "VARCHAR(50)" DEFAULT 'folyamatban',
  "hatarido" DATE,
  "letrehozas_idopont" TIMESTAMP DEFAULT (now()),
  "modositas_idopont" TIMESTAMP
);

CREATE TABLE "FeladatKomment" (
  "id" INT PRIMARY KEY,
  "feladat_id" INT NOT NULL,
  "felhasznalo_id" INT NOT NULL,
  "komment_szoveg" TEXT NOT NULL,
  "letrehozas_idopont" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "Beadas" (
  "id" INT PRIMARY KEY,
  "feladat_id" INT NOT NULL,
  "felhasznalo_id" INT NOT NULL,
  "tanar_id" INT NOT NULL,
  "pontszam" INT NOT NULL,
  "jegy" INT NOT NULL,
  "statusz" "VARCHAR(50)" DEFAULT 'beküldve',
  "visszajelzes" TEXT,
  "bekuldes_idopont" TIMESTAMP DEFAULT (now()),
  "ertekeles_idopont" TIMESTAMP
);

CREATE TABLE "File" (
  "id" INT PRIMARY KEY,
  "feladat_id" INT,
  "beadas_id" INT,
  "felhasznalo_id" INT NOT NULL,
  "file_nev" "VARCHAR(255)" NOT NULL,
  "file_meret" INT,
  "file_tipus" "VARCHAR(50)",
  "file_tartalma" binary,
  "feltoltes_idopont" TIMESTAMP DEFAULT (now()),
  "file_eleresiut" "VARHCAR(255)"
);

CREATE TABLE "Uzenet" (
  "id" INT PRIMARY KEY,
  "kuldo_id" INT NOT NULL,
  "fogado_id" INT,
  "projekt_id" INT,
  "uzenet_tartalom" TEXT NOT NULL,
  "statusz" "VARCHAR(20)" DEFAULT 'elküldve',
  "kuldes_ideje" TIMESTAMP DEFAULT (now())
);

CREATE TABLE "Statisztika" (
  "id" INT PRIMARY KEY,
  "felhasznalo_id" INT,
  "projekt_id" INT,
  "statisztika_nev" "VARCHAR(100)" NOT NULL,
  "ertek" "DECIMAL(10,2)",
  "meresi_idopont" TIMESTAMP DEFAULT (now()),
  "pontszam" INT
);

CREATE TABLE "Naplo" (
  "id" INT PRIMARY KEY,
  "felhasznalo_id" INT NOT NULL,
  "projekt_id" INT,
  "feladat_id" INT,
  "muvelet" "VARCHAR(100)" NOT NULL,
  "leiras" TEXT,
  "idopont" TIMESTAMP DEFAULT (now())
);

ALTER TABLE "Projekt" ADD FOREIGN KEY ("id") REFERENCES "Szerep" ("projekt_id");

ALTER TABLE "Szerep" ADD FOREIGN KEY ("id") REFERENCES "SzerepEngedely" ("szerep_id");

ALTER TABLE "Projekt" ADD FOREIGN KEY ("letrehozo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "ProjektTag" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "ProjektTag" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Feladat" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("id");

ALTER TABLE "Feladat" ADD FOREIGN KEY ("letrehozo_id") REFERENCES "Felhasznalo" ("id");

ALTER TABLE "Feladat" ADD FOREIGN KEY ("felelos_id") REFERENCES "Felhasznalo" ("id");

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
