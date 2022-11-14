const container = require('../containerConfig');

const wordService = container.resolve('wordService');

module.exports.wordCounter = wordService.wordCounter.bind(wordService);
module.exports.wordStatistics = wordService.wordStatistics.bind(wordService);
module.exports.allWordStatistics = wordService.allWordStatistics.bind(wordService);
