const pool = require('../config/db');

// userhez tartozó feltöltési előzményt adja vissza
const felhFeltoltesiElozmeny = async (felhasznalo_id, beadas_id = null) => {
    try {
        let query = `
            SELECT 
                id,
                file_nev,
                file_meret,
                file_tipus,
                feltoltes_idopont,
                file_eleresiut,
                beadas_id
            FROM "File"
            WHERE felhasznalo_id = $1
        `;
        
        const params = [felhasznalo_id];
        
        if (beadas_id) {
            query += ` AND beadas_id = $2`;
            params.push(beadas_id);
        }
        
        query += ` ORDER BY feltoltes_idopont DESC`;
        
        const result = await pool.query(query, params);
        return result.rows;
    } catch (error) {
        console.error('Hiba a felhasználó feltöltési előzményei lekérdezésekor:', error);
        throw error;
    }
};
// egy beadáshoz tartozó fájlok listázása
const beadasFileok = async (beadas_id) => {
    try {
        const query = `
            SELECT 
                f.id,
                f.file_nev,
                f.file_meret,
                f.file_tipus,
                f.feltoltes_idopont,
                f.file_eleresiut,
                fu.felhasznalonev,
                fu.teljes_nev,
                fu.email
            FROM "File" f
            LEFT JOIN "Felhasznalo" fu ON f.felhasznalo_id = fu.id
            WHERE f.beadas_id = $1
            ORDER BY f.feltoltes_idopont DESC
        `;
        
        const result = await pool.query(query, [beadas_id]);
        return result.rows;
    } catch (error) {
        console.error('Hiba a beadas fájljai lekérdezésekor:', error);
        throw error;
    }
};

// ellenőrzi, hogy a user jogosult-e a beadáshoz hozzáférni
const felhEngedelyBeadas = async (user, beadas_id) => {
    try {
        if (beadas_id === undefined || beadas_id === null || beadas_id === '') {
            return false;
        }
        const id = Number(beadas_id);
        if (!Number.isFinite(id)) {
            return false;
        }

        const result = await pool.query(
            `SELECT id, felhasznalo_id, tanar_id FROM "Beadas" WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return false;
        }

        const row = result.rows[0];

        if (user.szerep_tipus === 'admin') {
            return true;
        }
        if (row.felhasznalo_id === user.id) {
            return true;
        }
        if (row.tanar_id === user.id) {
            return true;
        }

        return false;
    } catch (error) {
        console.error('Hiba az engedélyek ellenőrzésekor:', error);
        throw error;
    }
};

module.exports = {
    felhFeltoltesiElozmeny,
    beadasFileok,
    felhEngedelyBeadas
};
