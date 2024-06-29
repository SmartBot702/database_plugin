const sqlite3 = require('sqlite3').verbose();

let db = new sqlite3.Database(':memory:');

db.serialize(() => {
  db.run("CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, user TEXT, message TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

const addMessage = (user, message, callback) => {
  db.run("INSERT INTO messages (user, message) VALUES (?, ?)", [user, message], callback);
};

const getMessages = (callback) => {
  db.all("SELECT * FROM messages ORDER BY timestamp DESC", (err, rows) => {
    callback(err, rows);
  });
};

const getUserMessages = (user, callback) => {
  db.all("SELECT * FROM messages WHERE user = ? ORDER BY timestamp DESC", [user], (err, rows) => {
    callback(err, rows);
  });
};

const handler = (event, context, callback) => {
  const { operation, user, message } = event;

  if (operation === 'addMessage') {
    addMessage(user, message, (err) => {
      if (err) {
        callback(null, { success: false, message: err.message });
      } else {
        callback(null, { success: true, message: 'Message added successfully' });
      }
    });
  } else if (operation === 'getMessages') {
    getMessages((err, rows) => {
      if (err) {
        callback(null, { success: false, message: err.message });
      } else {
        callback(null, { success: true, data: rows });
      }
    });
  } else if (operation === 'getUserMessages') {
    getUserMessages(user, (err, rows) => {
      if (err) {
        callback(null, { success: false, message: err.message });
      } else {
        callback(null, { success: true, data: rows });
      }
    });
  } else {
    callback(null, { success: false, message: 'Invalid operation' });
  }
};

module.exports = { handler };