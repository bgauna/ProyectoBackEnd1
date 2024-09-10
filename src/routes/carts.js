const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const cartsFilePath = path.join(__dirname, '../data/carts.json');
const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer carritos
const getCarts = () => {
    const data = fs.readFileSync(cartsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para leer productos
const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para escribir carritos
const saveCarts = (carts) => {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
};

// Ruta POST / (Crea un nuevo carrito)
router.post('/', (req, res) => {
    const carts = getCarts();
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: [],
    };

    carts.push(newCart);
    saveCarts(carts);
    res.status(201).json(newCart);
});

// Ruta GET /:cid (Lista productos de un carrito)
router.get('/:cid', (req, res) => {
    const carts = getCarts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    if (cart) {
        res.json(cart.products);
    } else {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Ruta POST /:cid/product/:pid (Agrega un producto al carrito)
router.post('/:cid/product/:pid', (req, res) => {
    const carts = getCarts();
    const products = getProducts();
    const cart = carts.find(c => c.id === parseInt(req.params.cid));
    const product = products.find(p => p.id === parseInt(req.params.pid));

    if (!cart || !product) {
        return res.status(404).json({ error: 'Carrito o producto no encontrado' });
    }

    const productInCart = cart.products.find(p => p.product === product.id);
    if (productInCart) {
        productInCart.quantity += 1;
    } else {
        cart.products.push({ product: product.id, quantity: 1 });
    }

    saveCarts(carts);
    res.status(201).json(cart);
});

module.exports = router;
