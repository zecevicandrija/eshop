const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');
const usersRouter = require('./routes/users');
const projectsRouter = require('./routes/projects');
const tasksRouter = require('./routes/tasks');
const teamsRouter = require('./routes/teams');
const authRouter = require('./routes/auth');
const korisniciRouter = require('./routes/korisnici'); // Dodato
const messagesRouter = require('./routes/messages');


const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Database connection
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

// Routes
app.use('/api/users', usersRouter);
app.use('/api/projekti', projectsRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/teams', teamsRouter);
app.use('/api/auth', authRouter);
app.use('/api/korisnici', korisniciRouter); // Dodato
app.use('/api/messages', messagesRouter);


// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});