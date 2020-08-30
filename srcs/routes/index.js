const auth = require('./auth');
const user = require('./user');
const division = require('./division');
const event = require('./event');

const authenticate = require('../middlewares/authenticate');

module.exports = app => {
    app.get('/', (req, res) => {
        res.status(200).send({ message: "Welcome to the AUTHENTICATION API. Register or Login to test Authentication."});
    });
    app.use('/api/auth', auth);
    app.use('/api/division', division);
    app.use('/api/event', event);
    app.use('/api/user', authenticate, user);
};