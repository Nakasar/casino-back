
const http = require('http');
const express = require('express');
const mongoose = require('mongoose');
const socketIo = require('socket.io');

const socketManager = require('./routes/socket');

const PORT = process.env.PORT || 3000;

async function start() {
  return new Promise((resolve, reject) => {
    try {
      const app = express();
      const server = http.Server(app);
      const io = socketIo(server);

      app.get('/', (req, res, next) => {
        try {
          return res.json({});
        } catch (err) {
          return next(err);
        }
      });

      app.get('*', (req, res, next) => {
        res.status(404);
        return res.json({
          error: true,
          status: 404,
          message: 'Route not found.',
        });
      });

      io.on('connection', socketManager.initSocket);

      mongoose.connect('mongodb://localhost:27017/casino', { useNewUrlParser: true });

      server.listen(PORT, err => {
        if (err) {
          console.error('Could not start server.');
          console.error(err);
          return reject(err);
        }

        console.info('Server listening, application started.');

        return resolve();
      });

      return resolve();
    } catch (err) {
      console.error('Could not start application CASINO.');
      console.error(err);

      return reject(err);
    }
  });
}

module.exports = { start };
