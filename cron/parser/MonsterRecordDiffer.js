class MonsterRecordDiffer {
  constructor(originalRecords, newRecords) {
    this.originalRecords = originalRecords;
    this.newRecords = newRecords;
  }

  getNewRecords() {
    const originalHashSet = this.generateHashSetForMonsters(
      this.originalRecords
    );

    // For the new records, check to see if they are the same as the record as the old slot
    const newRecords = [];
    this.newRecords.forEach(newRecord => {
      const candidateRecordName = newRecord.getMonsterName();
      const currentRecordWithName = originalHashSet[candidateRecordName];

      // If the record does not exist, it's new as well so that's good enough
      if (
        !currentRecordWithName ||
        !currentRecordWithName.isSameAs(newRecord)
      ) {
        newRecords.push(newRecord);
      }
    });

    return newRecords;
  }

  generateHashSetForMonsters(monsterRecords) {
    const hashSet = {};
    monsterRecords.forEach(monsterRecord => {
      const monsterName = monsterRecord.getMonsterName();
      hashSet[monsterName] = monsterRecord;
    });

    return hashSet;
  }
}

module.exports = MonsterRecordDiffer;
