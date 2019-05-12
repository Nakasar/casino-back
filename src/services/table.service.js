const Table = require('../models/table.model');

class CodeConflictError extends Error {
  constructor(message = 'There is already a table with this code.') {
    super(message);
    this.status = 409;
    this.name = 'EXISTING_TABLE_CODE';
    this.message = message;
  }
}

class PlayerNameConflictError extends Error {
  constructor(message = 'There is already a player with this name at the table.') {
    super(message);
    this.status = 409;
    this.name = 'EXISTING_PLAYER_NAME';
    this.message = message;
  }
}

class NonExistingTableError extends Error {
  constructor(message = 'There is no table with this code.') {
    super(message);
    this.status = 404;
    this.name = 'NON_EXISTING_TABLE';
    this.message = message;
  }
}

/**
 * Generate a random code ID for a table.
 * @returns {string}
 */
function generateTableCode() {
  return Math.random().toString(16).substr(2, 13);
}

/**
 * Check if a player has admin rights at a table.
 * @param code
 * @param name
 * @param socketID
 * @returns {Promise<Query|void|number|bigint|T|T|*>}
 */
async function isPlayerAdmin(code, { name, socketID }) {
  const table = await Table.findOne({ code });

  if (!table) {
    throw new NonExistingTableError();
  }

  const player = table.players.find(_player => {
    if (socketID && _player.socketID !== socketID) {
      console.log(_player)
      return false;
    }

    if (name && _player.name !== name) {
      return false;
    }

    return true;
  });

  console.log(player);

  return player && player.admin;
}

/**
 * Create a player in a table.
 * @param code
 * @param player
 * @returns {Promise<void>}
 */
async function addPlayerToTable(code, player) {
  const table = await Table.findOne({ code });

  if (!table) {
    throw new NonExistingTableError();
  }

  if (table.players.find(_player => _player.name === player.name)) {
    throw new PlayerNameConflictError();
  }

  await table.players.push({ name: player.name });

  await table.save();
}

/**
 * Create a new table with a specified game.
 * @param code
 * @param title
 * @param [game]
 * @param [creator]
 * @param [creator.name]
 * @param [creator.socketID]
 * @returns {Promise<object>}
 */
async function createTable({ code, title, game, creator }) {
  const table = new Table({ code, title, game });

  if (!table.code) {
    table.code = generateTableCode();
  }

  if ((await Table.count({ code: table.code })) > 0) {
    throw new CodeConflictError();
  }

  if (creator) {
    table.players = [{
      name: creator.name,
      admin: true,
      socketID: creator.socketID,
    }];
  }

  await table.save();

  return { title: table.title, game: table.game, code: table.code };
}

module.exports = {
  ERRORS: {
    CodeConflictError,
    PlayerNameConflictError,
    NonExistingTableError,
  },
  addPlayerToTable,
  createTable,
  isPlayerAdmin,
};
