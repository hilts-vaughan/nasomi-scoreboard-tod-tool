const MonsterDeathRecord = require('../../data/MonsterDeathRecord');

const BASE_TABLE_SELECTOR =
  'body > div > table > tbody > tr > td:nth-child(2) > table';

const TR_SELECTOR = 'tr';

class NasomiScoreboardParser {
  parse($) {
    const $table = $(BASE_TABLE_SELECTOR);
    const $rows = $table.find(TR_SELECTOR).slice(1); // remove the first item which is a header row

    const CURRENT_TIME = new Date().getTime();

    const monsterRecords = [];
    $rows.each((index, $row) => {
      $row = $($row);
      const $slots = $row.find('td');

      const monster = $slots
        .eq(0)
        .text()
        .trim();

      const killer = $slots
        .eq(1)
        .text()
        .trim();

      const linkshell = $slots
        .eq(2)
        .text()
        .trim();

      monsterRecords.push(
        new MonsterDeathRecord(monster, CURRENT_TIME, killer, linkshell)
      );
    });

    return monsterRecords;
  }
}

module.exports = NasomiScoreboardParser;
