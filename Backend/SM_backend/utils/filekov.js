const pool = require('../config/database');

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

const felhEngedelyBeadas = async (felhasznalo_id, beadas_id) => {
    try {
        const query = `
            SELECT id FROM "Beadas"
            WHERE id = $1
        `;
        
        const result = await pool.query(query, [beadas_id]);
        return result.rows.length > 0;
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
