require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const PORT = process.env.PORT || 3000;
const path = require('path');

app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const connectDB = async function() {
    try {
        await client.connect();

        await client.db("admin").command({ping: 1});
        console.log("Pinged your deployment. You successfully connected to the MongoDB.");

        app.listen(PORT, () => {
            console.log("Server listening on port " + PORT);
        })
    } catch(error) {
        console.error(error);
    }
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
})

app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
})

app.get('/api/categories', async (req, res) => {
    try {
        const db = client.db('todo_list');
        const collection = db.collection('categories');

        const categories = await collection.find().toArray();
        res.json(categories);
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while fetching categories'});
    }
})

connectDB().catch(console.dir);