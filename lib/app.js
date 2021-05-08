const express = require('express');
const app = express();

app.use(require('cors')({
    origin: 'http://localhost:7891',
    credentials: true
}))

app.use(require('cookie-parser')())
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/auth', require('./controllers/auth'))
app.use('/api/v1/users', require('./controllers/users'))
app.use('/api/v1/boards', require('./controllers/boards'))
app.use('/api/v1/posts', require('./controllers/posts'))
app.use('/api/v1/comments', require('./controllers/comments'))


app.use(require('./middleware/not-found'));
app.use(require('./middleware/error'));

module.exports = app;
