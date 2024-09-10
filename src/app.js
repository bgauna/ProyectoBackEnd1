const express = require('express');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
const PORT = 8080;

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para la raíz
app.get('/', (req, res) => {
    res.send('Servidor de API funcionando. Usa /api/products o /api/carts.');
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
