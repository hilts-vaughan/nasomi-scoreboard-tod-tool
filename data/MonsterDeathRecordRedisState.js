/*
    This is used for just representing a redis state inside of memory for a monster death record
    so that we can export to redis in a clean way.
*/
class MonsterDeathRecordRedisState {
  constructor(deathRecord) {
    this.deathRecord = deathRecord;
  }

  getRedisValue() {
    return JSON.stringify(this.deathRecord);
  }

  getMonsterName() {
    return this.deathRecord.getMonsterName();
  }
}

module.exports = MonsterDeathRecordRedisState;
