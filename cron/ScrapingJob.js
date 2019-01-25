const NasomiScoreboardParser = require('./parser/NasomiScoreboardParser');
const MonsterRecordDiffer = require('./parser/MonsterRecordDiffer');
const MonsterDeathRecord = require('../data/MonsterDeathRecord');

const cron = require('node-cron');
const request = require('superagent');
const winston = require('winston');
const cheerio = require('cheerio');

const logger = winston.createLogger({
  transports: [new winston.transports.Console()]
});

const NASOMI_SCOREBOARD_URL = 'https://na.nasomi.com/scoreboard.php';

class ScrapingJob {
  constructor(cadence, scrapingResultWriters, dbConnector) {
    this.cadence = cadence;
    this.scrapingResultWriters = scrapingResultWriters;
    this.dbConnector = dbConnector;
  }

  /**
   * This begins the scraping job on the given cadence
   */
  start() {
    cron.schedule('* * * * *', this.performWork.bind(this));
    this.performWork();
  }

  performWork() {
    logger.info(
      'Beginning to do some work on the scraping job since it has become active'
    );

    return request
      .get(NASOMI_SCOREBOARD_URL)
      .set(
        'User-Agent',
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.113 Safari/537.36'
      )
      .set('accept', 'html')
      .end((err, res) => {
        if (err) {
          logger.error(
            'There was something that went wrong. It is being logged out below.'
          );
          logger.error(err);
          return;
        }

        // TODO: What if this is going to take too long and then the next job begins???
        // This is safe for the most part but since the cadence is so low this is fine
        const newMonsterRecords = this.createMonsterRecordsFromResponse(res);
        this.getExistingMonsterRecords().then(existingMonsterRecords => {
          console.log(existingMonsterRecords);
          const updatedRecords = new MonsterRecordDiffer(
            existingMonsterRecords,
            newMonsterRecords
          ).getNewRecords();

          this.writeRecords(updatedRecords);
        });
      });
  }

  writeRecords(newRecords) {
    // We don't block on purpose and just let ourselves continue on
    newRecords.forEach(record => {
      this.scrapingResultWriters.forEach(writer => {
        writer.writeMonsterRecord(record).then(() => {
          logger.info(
            `Wrote the record with with the name ${record.getMonsterName()} to the persistence layer`
          );
        });
      });
    });
  }

  createMonsterRecordsFromResponse(res) {
    const htmlString = res.text;

    const $element = cheerio.load(htmlString);
    const scoreboardParser = new NasomiScoreboardParser();
    const newMonsterRecords = scoreboardParser.parse($element);

    return newMonsterRecords;
  }

  getExistingMonsterRecords() {
    const RECENT_QUERY = `
        SELECT
        *
    FROM
        monster_records AS FIRST
    WHERE
        time = (
        SELECT
            MAX( time )
        FROM
          monster_records AS TEMP
        WHERE
            FIRST.monster_name = TEMP.monster_name )
    ORDER BY
        monster_name ASC;
    `;

    // Get the query results from the most recent ToD (since this is the last time they were recorded as killed)
    // since the timing is off. The initial time it is run it is considered to be bad data, since there is nothing
    // to known from it being shown... but that is fine. This is the most recent result for the item.
    return new Promise((done, reject) => {
      this.dbConnector.query(RECENT_QUERY, function(error, results, fields) {
        if (error) {
          return logger.error(error);
        }

        const mostRecentMonsterRecords = results.map(result => {
          return new MonsterDeathRecord(
            result.monster_name,
            result.time,
            result.player_name,
            result.linkshell_name
          );
        });

        // Turn the query into results and  from here we can go ahead and store more info
        done(mostRecentMonsterRecords);
      });
    });
  }
}

module.exports = ScrapingJob;
