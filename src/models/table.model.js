const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TableSchema = new Schema({
  title: {
    type: 'string',
  },
  code: {
    type: 'string',
    lowercase: true,
    unique: true,
  },
  game: {
    type: 'string',
    uppercase: true,
  },
  players: [{
    _id: false,
    name: {
      type: 'string',
      required: true,
    },
    socketID: {
      type: 'string',
    },
    invitationCode: {
      type: 'string',
    },
    admin: {
      type: 'boolean',
      default: false,
    },
  }],
  data: {
    type: Schema.Types.Mixed,
  },
  chat: [{
    author: {
      type: 'string',
      required: true,
    },
    date: {
      type: 'date',
      default: new Date(),
    },
    message: {
      type: 'string',
    },
  }],
});

module.exports = mongoose.model('Table', TableSchema);
