// system imports
const { promisify } = require('util');

const MonsterDeathRecordRedisState = require('../data/MonsterDeathRecordRedisState');

class RedisScrapingResultWriter {
  constructor(redis, namespace = 'nasomi:') {
    this.redis = redis;
    this.namespace = namespace;
  }

  writeMonsterRecord(monsterRecord) {
    const redisState = new MonsterDeathRecordRedisState(monsterRecord);

    const redisKey = redisState.getMonsterName();
    const redisValue = redisState.getRedisValue();

    // Write to the redis store
    return promisify(this.redis.set).bind(this.redis)(
      `${this.namespace}${redisKey}`,
      redisValue
    );
  }
}
module.exports = RedisScrapingResultWriter;
