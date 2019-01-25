const mysql = require('mysql');
const redis = require('redis');
const config = require('config');
const sleep = require('sleep');

const ScrapingJob = require('./cron/ScrapingJob');
const MySqlScrapingResultWriter = require('./cron/MySqlScrapingResultWriter');
const RedisScrapingResultWriter = require('./cron/RedisScrapingResultWriter');

// Hello world! This is where the code for the TOD tracker
// is going to end up being stored. And we can go from here if we need to

const getConnectionPoolForDatabase = () => {
  const dbConfig = config.get('db');
  return mysql.createPool(dbConfig);
};

const getRedisConnetion = () => {
  const redisConfig = config.get('redis');
  return redis.createClient(redisConfig);
};

// This is a cheap hack to make sure when the SQL server is coming up from within docker
// that is's alive and well
sleep.msleep(5000);

const scrapingJob = new ScrapingJob(
  5,
  [
    new MySqlScrapingResultWriter(getConnectionPoolForDatabase()),
    new RedisScrapingResultWriter(getRedisConnetion())
  ],
  getConnectionPoolForDatabase()
);

scrapingJob.start();
