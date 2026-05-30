const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Ruta principal que sirve el diseño visual desde la carpeta views
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Inicializa el servidor para que escuche las peticiones
app.listen(PORT, () => {
    console.log(`Servidor activo en el puerto ${PORT}`);
});