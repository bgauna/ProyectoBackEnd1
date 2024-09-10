const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const productsFilePath = path.join(__dirname, '../data/products.json');

// Función para leer productos
const getProducts = () => {
    const data = fs.readFileSync(productsFilePath, 'utf-8');
    return JSON.parse(data);
};

// Función para escribir productos
const saveProducts = (products) => {
    fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Ruta GET / (Lista todos los productos con limitación opcional)
router.get('/', (req, res) => {
    const products = getProducts();
    const limit = req.query.limit ? parseInt(req.query.limit) : products.length;
    res.json(products.slice(0, limit));
});

// Ruta GET /:pid (Obtiene un producto por ID)
router.get('/:pid', (req, res) => {
    const products = getProducts();
    const product = products.find(p => p.id === parseInt(req.params.pid));
    if (product) {
        res.json(product);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// Ruta POST / (Agrega un nuevo producto)
router.post('/', (req, res) => {
    const products = getProducts();
    const newProduct = {
        id: products.length > 0 ? products[products.length - 1].id + 1 : 1,
        ...req.body,
        status: req.body.status || true,
    };

    if (!newProduct.title || !newProduct.description || !newProduct.code || !newProduct.price || newProduct.stock === undefined || !newProduct.category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios, excepto thumbnails' });
    }

    products.push(newProduct);
    saveProducts(products);
    res.status(201).json(newProduct);
});

// Ruta PUT /:pid (Actualiza un producto)
router.put('/:pid', (req, res) => {
    const products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));

    if (index !== -1) {
        const updatedProduct = { ...products[index], ...req.body, id: products[index].id };
        products[index] = updatedProduct;
        saveProducts(products);
        res.json(updatedProduct);
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// Ruta DELETE /:pid (Elimina un producto)
router.delete('/:pid', (req, res) => {
    let products = getProducts();
    const index = products.findIndex(p => p.id === parseInt(req.params.pid));

    if (index !== -1) {
        products = products.filter(p => p.id !== parseInt(req.params.pid));
        saveProducts(products);
        res.json({ message: 'Producto eliminado' });
    } else {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

module.exports = router;
