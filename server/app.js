const express = require('express');
const cors = require('cors');

const log = require('loglevel');
const Keycloak = require('keycloak-connect');
const session = require('express-session');
const HttpError = require('./utils/HttpError');
const { errorHandler } = require('./utils/utils');
const { handlerWrapper } = require('./utils/utils');
const router = require('./routes');

const memoryStore = new session.MemoryStore();

const keycloak = new Keycloak({
  store: memoryStore,
});

const app = express();

if (process.env.NODE_ENV === 'development') {
  log.info('disable cors');
  app.use(cors());
}

// app.use(
//   keycloak.middleware({
//     logout: '/logout',
//     admin: '/',
//   }),
// );

/*
 * Check request
 */
app.use(
  handlerWrapper(async (req, _res, next) => {
    if (
      req.method === 'POST' ||
      req.method === 'PATCH' ||
      req.method === 'PUT'
    ) {
      if (req.headers['content-type'] !== 'application/json') {
        throw new HttpError(
          415,
          'Invalid content type. API only supports application/json',
        );
      }
    }
    next();
  }),
);

app.use(express.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(express.json()); // parse application/json

// app.get('/settings', keycloak.protect('realm:web-map-manager'), (req, res) =>
//   res.status(200).json({ ok: true }),
// );

app.use(router);

app.get(
  '/settings',
  keycloak.enforcer('web-map-global-setting:view'),
  (req, res) => res.status(200).json({ ok: true }),
);

// Global error handler
app.use(errorHandler);

const { version } = require('../package.json');

app.get('*', function (req, res) {
  res.status(200).send(version);
});

module.exports = app;
