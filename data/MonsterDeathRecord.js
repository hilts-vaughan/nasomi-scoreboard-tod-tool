class MonsterDeathRecord {
  constructor(monsterName, monsterTimeDead, playerName, playerLinkshell) {
    this.monsterName = monsterName;
    this.monsterTimeDead = monsterTimeDead;
    this.playerName = playerName;
    this.playerLinkshell = playerLinkshell;
  }

  getPlayerName() {
    return this.playerName;
  }

  getMonsterName() {
    return this.monsterName;
  }

  getLinkshell() {
    return this.playerLinkshell;
  }

  isSameAs(monsterRecord) {
    // We ignore the timestamp on purpose since it's not relevant
    // and we might even remove it in favour of using redis timestamps
    return (
      monsterRecord.getPlayerName() === this.getPlayerName() &&
      monsterRecord.getMonsterName() === this.getMonsterName() &&
      monsterRecord.getLinkshell() === this.getLinkshell()
    );
  }
}

module.exports = MonsterDeathRecord;
