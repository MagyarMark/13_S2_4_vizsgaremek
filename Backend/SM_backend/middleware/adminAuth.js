// csak admin felhasználót enged tovább
const verifyAdmin = (req, res, next) => {
  // nincs user adat, nincs hozzáférés
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Nincs bejelentkezve'
    });
  }

  // nem admin szerepnél tiltjuk a kérést
  if (req.user.szerep_tipus !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin jogosultság szükséges ehhez a művelethez'
    });
  }

  next();
};

module.exports = { verifyAdmin };
