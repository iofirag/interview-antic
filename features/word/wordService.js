const opentracing = require('opentracing');

module.exports = class WordService {
    constructor(wordLogic, logger, tracer, serviceData) {
        this._handler = wordLogic;
        this._logger = logger;
        this._tracer = tracer;
        this._serviceData = serviceData;
    }

    async wordCounter(req, res) {
        let result;
        try {
            const {file, body} = req;
            if (file) {
                // Get data from file
                this._handler.handleWordCounterByFilePath(file.path);
            } else if (body) {
                if (body.indexOf('http') === 0) {
                    // Should fetch from url
                    this._handler.handleWordCounterByUrl(body);
                } else {
                    // string data
                    this._handler.handleWordCounterByText(body);
                }
            }
        } catch (error) {
            res.statusCode = 500;
            result = error.message;
        } finally {
            res.end(result ? JSON.stringify(result) : '');
        }
    }

    wordStatistics(req, res) {
        let result;
        try {
            const { word } = req.params;
            result = this._handler.wordStatistics(word);
        } catch (error) {
            res.statusCode = 500;
            result = error.message;
        } finally {
            res.end(result !== undefined ? JSON.stringify(result) : '');
        }
    }

    allWordStatistics(req, res) {
        let result;
        try {
            result = this._handler.allWordStatistics();
        } catch (error) {
            res.statusCode = 500;
            result = error.message;
        } finally {
            res.end(result !== undefined ? JSON.stringify(result) : '');
        }
    }
};
