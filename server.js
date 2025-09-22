require('dotenv').config();

const express = require('express');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const PORT = process.env.PORT || 3000;
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bcrypt = require('bcryptjs');

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

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: uri,
        touchAfter: 24 * 3600,
    }),
    cookie: {
        secure: false,
        maxAge: 24 * 3600 * 1000
    }
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(
    async(username, password, done) => {
        try {
            const db = client.db('todo_list');
            const collection = db.collection('users');

            const user = await collection.findOne({username});

            if(!user) return done(null, false, {message: 'Incorrect username'});

            const isMatch = await bcrypt.compare(password, user.password);
            if(!isMatch) return done(null, false, {message: 'Incorrect password'});

            return done(null, user);
        } catch(error) {
            return done(error);
        }
    }
));

passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async(id, done) => {
    try {
        const db = client.db('todo_list');
        const collection = db.collection('users');

        const user = await collection.findOne({_id: new ObjectId(id)});

        if(!user) return done(null, false);

        return done(null, user);
    } catch(error) {
        return done(error);
    }
});

const isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) return next();
    res.redirect('/');
}

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

/**
 * returns the login page
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
})

/**
 * returns the dashboard page
 */
app.get('/dashboard', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views/dashboard.html'));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/login.html'));
})

app.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true,
}));

app.post('/register', async (req, res) => {
    try {
        const {username, password} = req.body;

        if(!username || !password) return res.status(400).json({error: 'Username and password are required'});

        const db = client.db('todo_list');
        const usersCollection = db.collection('users');

        const existingUser = await usersCollection.findOne({username});

        if(existingUser) {
            const isValid = await bcrypt.compare(password, existingUser.password);
            if(isValid) {
                return req.login(existingUser, (err) => {
                    if(err) return res.status(500).json({error: 'An error occurred while logging in'});

                    return res.json({
                        message: 'Logged in successfully',
                        redirect: '/dashboard',
                        isAuthenticated: true,
                    });
                });
            } else {
                return res.status(400).json({error: 'User exists but password is incorrect'});
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = {
            username: username,
            password: hashedPassword,
            createdAt: new Date()
        };

        const result = await usersCollection.insertOne(newUser);

        const user = await usersCollection.findOne({_id: result.insertedId});
        req.login(user, (err) => {
            if(err) return res.status(500).json({error: 'An error occurred while logging in'});
            else res.json({message: 'User registered successfully', redirect: '/dashboard'});
        })
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while registering the user'});
    }
})

/**
 * returns all tasks
 */
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

/**
 * returns all categories
 */
app.get('/api/categories', isAuthenticated, async (req, res) => {
    try {
        const db = client.db('todo_list');
        const collection = db.collection('categories');

        const categories = await collection.find({userId: req.user._id}).toArray();
        res.json(categories);
    } catch(error) {
        console.error(error);
        res.status(500).json({error: 'An error occurred while fetching categories'});
    }
});

/**
 * sends a new category to the db
 */
app.post('/api/categories', isAuthenticated, async (req, res) => {
    try {
        const {input} = req.body;

        if(!input || !input.trim()) return res.status(400).json({error: 'Category is required'});

        const db = client.db('todo_list');
        const collection = db.collection('categories');

        const category = {
            category: input.trim(),
            userId: req.user._id
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

/**
 * sends a new task to the db
 */
app.post('/api/tasks', isAuthenticated, async (req, res) => {
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
            completed: false,
            userId: req.user._id,
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