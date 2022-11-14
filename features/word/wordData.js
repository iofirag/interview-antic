const store = require('store2');

module.exports = class WordData {
    constructor(logger, serviceData) {
        this._logger = logger;
        this._serviceData = serviceData;
    }

    insertWord(key) {
        store.add(key.toLowerCase(), 1);
    }

    getWordCount(key) {
        return store.get(key.toLowerCase()) || 0;
    }

    getAllWordsCount() {
        return store.getAll();
    }
};
