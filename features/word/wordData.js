const opentracing = require('opentracing');
const store = require('store2');

module.exports = class WordData {
    constructor(storageService, logger, tracer, serviceData) {
        this._archiveService = storageService;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
    }

    insertWord(key) {
        // const val = +store.get(key) || 0;
        store.add(key.toLowerCase(), 1);
    }

    getWordCount(key) {
        return store.get(key.toLowerCase()) || 0;
    }

    getAllWordsCount() {
        return store.getAll();
    }

    // async wordCounter(newValue, parentSpan) {
    //     const logObj = {
    //         prefix: `${this.constructor.name}`,
    //         isError: false,
    //         msg: 'success',
    //     };
    //     const span = this._tracer.startSpan(logObj.prefix, { childOf: parentSpan });
    //     try {
    //         await this._archiveService.saveData();
    //     } catch (error) {
    //         span.setTag(opentracing.Tags.ERROR, true);
    //         logObj.isError = true;
    //         logObj.msg = error.message;
    //         throw error;
    //     } finally {
    //         this._logger.log(logObj.isError ? 'error' : 'info', `${logObj.prefix} - ${logObj.msg}`, span);
    //         span.finish();
    //     }
    // }
};
