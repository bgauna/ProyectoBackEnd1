const express = require('express');
const { Server } = require('socket.io');
const { engine } = require('express-handlebars');
const path = require('path');
const productsRouter = require('./routes/products');
const cartsRouter = require('./routes/carts');

const app = express();
const PORT = 8080;

// Configuración de Handlebars
app.engine('handlebars', engine({
    defaultLayout: 'main', // Este es el layout por defecto que busca Handlebars
    layoutsDir: path.join(__dirname, 'views', 'layouts'), // Ruta a la carpeta de layouts
}));
app.set('view engine', 'handlebars');
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsear JSON
app.use(express.json());

// Rutas de productos y carritos
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Ruta para la vista home
app.get('/', (req, res) => {
    res.render('home', { title: 'Productos' });
});

// Ruta para la vista con WebSockets
app.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Productos en Tiempo Real' });
});

// Iniciar servidor
const server = app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

// Configurar WebSocket con Socket.IO
const io = new Server(server);

io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Emitir lista de productos cuando un cliente se conecta
    socket.emit('productList', getProducts());

    // Escuchar eventos de creación y eliminación de productos
    socket.on('newProduct', (product) => {
        const products = getProducts();
        products.push(product);
        saveProducts(products);

        // Emitir la lista de productos actualizada a todos los clientes
        io.emit('productList', products);
    });

    socket.on('deleteProduct', (productId) => {
        let products = getProducts();
        products = products.filter(p => p.id !== productId);
        saveProducts(products);

        // Emitir la lista de productos actualizada
        io.emit('productList', products);
    });
});

const fs = require('fs');
const productsFilePath = path.join(__dirname, 'data/products.json');

const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

app.use(express.static(path.join(__dirname, 'public')));

