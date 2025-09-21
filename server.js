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

app.get('/api/tasks', async (req, res) => {
    try {
        const db = client.db('todo_list');
        const collection = db.collection('tasks');

        const tasks = await collection.find().toArray();
        res.json(tasks);
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while fetching tasks'});
    }
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
});

app.post('/api/categories', async (req, res) => {
    try {
        const {input} = req.body;

        if(!input || !input.trim()) return res.status(400).json({error: 'Category is required'});

        const db = client.db('todo_list');
        const collection = db.collection('categories');

        const category = {
            category: input.trim()
        }

        const result = await collection.insertOne(category);

        res.status(201).json({
            message: 'Category created successfully',
            categoryId: result.insertedId,
            category: input.trim()
        })
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while creating the category'});
    }
})

app.post('/api/tasks', async (req, res) => {
    try {
        const {name, description, dueDate, category} = req.body;

        if(!name || !name.trim()) return res.status(400).json({error: 'Name is required'});

        const db = client.db('todo_list');
        const collection = db.collection('tasks');

        const task = {
            name: name.trim(),
            description: description?.trim() || '',
            dueDate: dueDate || null,
            category: category || 'Uncategorized',
            completed: false
        };

        const result = await collection.insertOne(task);

        res.status(201).json({
            message: 'Task created successfully',
            taskId: result.insertedId
        })
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while creating the task'});
    }
})

connectDB().catch(console.dir);