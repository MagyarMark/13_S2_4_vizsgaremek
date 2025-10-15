CREATE TABLE "Csapat" (
  "csapat_id" "VARCHAR(255)" PRIMARY KEY,
  "csapatnev" "VARCHAR(255)"
);

CREATE TABLE "CsapatTag" (
  "csapat_id" "VARCHAR(255)",
  "felhasznalo_id" "VARCHAR(255)",
  PRIMARY KEY ("csapat_id", "felhasznalo_id")
);

CREATE TABLE "Felhasznalo" (
  "felhasznalo_id" "VARCHAR(255)" PRIMARY KEY,
  "felhasznalonev" "VARCHAR(255)" NOT NULL,
  "jelszo" "VARCHAR(255)" NOT NULL,
  "email" "VARCHAR(255)" NOT NULL
);

CREATE TABLE "Uzenet" (
  "uzenet_id" integer,
  "felhasznalo_id" "VARCHAR(255)" PRIMARY KEY,
  "kuldo_id" integer NOT NULL,
  "fogado_id" integer NOT NULL,
  "uzenet_tartalom" varchar,
  "statusz" varchar,
  "kuldes_ideje" timestamp
);

CREATE TABLE "Szerepek" (
  "felhasznalo_id" "VARCHAR(255)" PRIMARY KEY,
  "szerepkor" "VARCHAR(255)"
);

CREATE TABLE "Engedelyek" (
  "engedely_id" "VARCHAR(255)",
  "hozzaferesiszint" "VARCHAR(255)"
);

CREATE TABLE "Projekt" (
  "projekt_id" "VARCHAR(255)" PRIMARY KEY,
  "felhasznalo_id" "VARCHAR(255)",
  "projekt_nev" "VARCHAR(255)",
  "projekt_tagok" "VARCHAR(255)"
);

CREATE TABLE "ProjektTag" (
  "projekt_id" "VARCAHR(255)",
  "felhasznalo_id" "VARCHAR(255)",
  "szerepkor" "VARCHAR(50)",
  PRIMARY KEY ("projekt_id", "felhasznalo_id")
);

CREATE TABLE "Feladatok" (
  "feladat_id" "VARCHAR(255)",
  "projekt_id" "VARCHAR(255)" PRIMARY KEY,
  "feladat_nev" "VARCHAR(255)",
  "hatarido" "VARCHAR(255)"
);

CREATE TABLE "Fileok" (
  "feladat_id" "VARCHAR(255)",
  "file_id" "VARCHAR(255)",
  "filenev" "VARCHAR(255)",
  "filetipus" "VARCHAR(255)"
);

ALTER TABLE "Uzenet" ADD CONSTRAINT "kuld" FOREIGN KEY ("felhasznalo_id") REFERENCES "Felhasznalo" ("felhasznalo_id");

ALTER TABLE "Felhasznalo" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Csapat" ("csapat_id");

ALTER TABLE "Felhasznalo" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Szerepek" ("felhasznalo_id");

ALTER TABLE "Felhasznalo" ADD FOREIGN KEY ("felhasznalo_id") REFERENCES "Projekt" ("projekt_tagok");

ALTER TABLE "Feladatok" ADD FOREIGN KEY ("projekt_id") REFERENCES "Projekt" ("projekt_id");

ALTER TABLE "Csapat" ADD FOREIGN KEY ("csapat_id") REFERENCES "CsapatTag" ("csapat_id");

ALTER TABLE "ProjektTag" ADD FOREIGN KEY ("projekt_id") REFERENCES "CsapatTag" ("felhasznalo_id");

ALTER TABLE "Engedelyek" ADD FOREIGN KEY ("engedely_id") REFERENCES "Szerepek" ("szerepkor");

ALTER TABLE "Fileok" ADD FOREIGN KEY ("feladat_id") REFERENCES "Feladatok" ("feladat_id");
