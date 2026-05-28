// Import required modules
const express = require('express');

// Create an Express application
const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files (CSS, images)
app.use(express.static('public'));

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));

// ─── In-memory data store ───────────────────────────────────────────────────
let tasks = [
    { id: 1, title: 'Complete Math Assignment', deadline: '2026-05-30', priority: 'high', completed: false },
    { id: 2, title: 'Read Chapter 5', deadline: '2026-06-01', priority: 'medium', completed: false },
    { id: 3, title: 'Submit Lab Report', deadline: '2026-06-03', priority: 'low', completed: true },
];
let nextId = 4;

// ─── ROUTES ────────────────────────────────────────────────────────────────

// GET / → Homepage: view all tasks (with optional sort)
app.get('/', (req, res) => {
    const sort = req.query.sort || 'deadline';
    let sorted = [...tasks];

    if (sort === 'priority') {
        const order = { high: 1, medium: 2, low: 3 };
        sorted.sort((a, b) => order[a.priority] - order[b.priority]);
    } else {
        sorted.sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    const total = tasks.length;
    const pending = tasks.filter(t => !t.completed).length;
    const completed = tasks.filter(t => t.completed).length;
    const urgent = tasks.filter(t => t.priority === 'high' && !t.completed).length;

    res.render('index', { tasks: sorted, sort, total, pending, completed, urgent });
});

// GET /add → Show add-task form
app.get('/add', (req, res) => {
    res.render('add');
});

// POST /add → Save new task
app.post('/add', (req, res) => {
    const { title, deadline, priority } = req.body;
    tasks.push({ id: nextId++, title, deadline, priority, completed: false });
    res.redirect('/');
});

// GET /edit/:id → Show edit form pre-filled with task data
app.get('/edit/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (!task) return res.redirect('/');
    res.render('edit', { task });
});

// POST /edit/:id → Save updated task
app.post('/edit/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (task) {
        task.title = req.body.title;
        task.deadline = req.body.deadline;
        task.priority = req.body.priority;
    }
    res.redirect('/');
});

// POST /complete/:id → Toggle completed status
app.post('/complete/:id', (req, res) => {
    const task = tasks.find(t => t.id === parseInt(req.params.id));
    if (task) task.completed = !task.completed;
    res.redirect('/');
});

// POST /delete/:id → Remove task from array
app.post('/delete/:id', (req, res) => {
    tasks = tasks.filter(t => t.id !== parseInt(req.params.id));
    res.redirect('/');
});

// ─── Start server ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});