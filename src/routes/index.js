const auth = require('./auth');
const user = require('./user');
const template = require('./template');
const common = require('./common');
const scene = require('./scene');
const lastBlock = require('./lastBlock');
const sceneCategory = require('./sceneCategory');
const templateCategory = require('./templateCategory');
const team = require('./team');
module.exports = (app) => {
  app.get('/', (req, res) => {
    res.status(200).send({message: 'Welcome to the AUTHENTICATION API. Register or Login to test Authentication.'});
  });
  app.use('/api/auth', auth);
  app.use('/api/user', user);
  app.use('/api/template', template);
  app.use('/api/common', common);
  app.use('/api/scene', scene);
  app.use('/api/team', team);
  app.use('/api/last-block', lastBlock);
  app.use('/api/category', sceneCategory);
  app.use('/api/template-category', templateCategory);
};
