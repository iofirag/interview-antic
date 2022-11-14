const store = require('store2');

module.exports = class StorageService {
    constructor(config, logger, tracer) {
        this._config = config;
        this._logger = logger;
        this._tracer = tracer;
    }

    insertWord(key) {
        const val = +store.get(key) || 0;
        store.add(key, val + 1);
    }

    getWordsCount(key) {
        return store.get(key);
    }

    getAllWordsCount() {
        return store.getAll();
    }
};
