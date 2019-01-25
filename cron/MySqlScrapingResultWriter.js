// system imports
const { promisify } = require('util');
const winston = require('winston');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const TABLE_NAME = 'monster_records';

class MySqlScrapingResultWriter {
  constructor(connectionPool) {
    this.mysqlConnection = connectionPool;
    this.setupTables();
  }

  setupTables() {
    this.mysqlConnection.query(`
    CREATE TABLE IF NOT EXISTS nasomi.monster_records (
      id INT AUTO_INCREMENT PRIMARY KEY,      
      monster_name VARCHAR(255) NOT NULL,
      player_name VARCHAR(255) NOT NULL,
      linkshell_name VARCHAR(255) NOT NULL,
      time TIMESTAMP NOT NULL
    ) ENGINE=MEMORY;
  `);
  }

  writeMonsterRecord(monsterRecord) {
    const now = new Date().getTime();
    this.mysqlConnection.query(
      `INSERT INTO ${TABLE_NAME} SET ?;`,
      {
        id: null,
        monster_name: monsterRecord.getMonsterName(),
        player_name: monsterRecord.getPlayerName(),
        linkshell_name: monsterRecord.getLinkshell()
      },
      function(error, results, fields) {
        if (error) {
          logger.error(error);
        }
      }
      // There's nothing else to do here so we're good
    );
    return Promise.resolve();
  }
}

module.exports = MySqlScrapingResultWriter;
