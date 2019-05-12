const TableService = require('../../services/table.service');

function initSocket(socket) {
  console.log(`Received connection socket [Id=${socket.id}].`);

  socket.on('disconnect', () => {
    console.log(`Socket [Id=${socket.id}] disconnected.`);
  });

  socket.on('create-table', (tableData, pseudo, callback) => {
    if (!callback) {
      return;
    }

    if (!tableData) {
      return callback({ error: true, status: 400, message: "Table data is null.", code: 'INVALID_TABLE_DATA' });
    }
    if (!pseudo) {
      return callback({ error: true, status: 400, message: "Pseudo is null.", code: 'INVALID_PSEUDO' });
    }

    const { code, title, game } = tableData;

    TableService.createTable({ code, title, game, creator: { name: pseudo, socketID: socket.id } }).then(table => {
      return callback({ success: true, table });
    }).catch(err => {
      if (err instanceof TableService.ERRORS.CodeConflictError) {
        return callback({ error: true, status: err.status, message: err.message, code: err.code });
      }

      console.error(err);

      return callback({ error: true, status: 501, message: 'Could not create the table.', code: 'INTERNAL_SERVER_ERROR' });
    });
  });

  socket.on('table_create-player', async (tableCode, player, callback) => {
    if (!callback) {
      return;
    }

    if (!tableCode) {
      return callback({ error: true, status: 400, message: "tableCode is null.", code: 'INVALID_TABLE_CODE' });
    }
    if (!player || !player.name) {
      return callback({ error: true, status: 400, message: "player must be an object with at least 'name'.", code: 'INVALID_PLAYER' });
    }

    try {
      if (!(await TableService.isPlayerAdmin(tableCode, { socketID: socket.id }))) {
        return callback({ error: true, status: 403, message: "You are not admin at this table.", code: 'NOT_ADMIN_AT_TABLE' });
      }

      await  TableService.addPlayerToTable(tableCode, { name: player.name });

      return callback({ success: true });
    } catch (err) {
      if (err instanceof TableService.ERRORS.PlayerNameConflictError) {
        return callback({ error: true, status: err.status, message: err.message, code: err.code });
      }
      if (err instanceof TableService.ERRORS.NonExistingTableError) {
        return callback({ error: true, status: err.status, message: err.message, code: err.code });
      }

      console.error(err);

      return callback({ error: true, status: 501, message: 'Could not create the player.', code: 'INTERNAL_SERVER_ERROR' });
    }
  });
}

module.exports = { initSocket };
