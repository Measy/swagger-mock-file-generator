'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _swaggerParser = require('swagger-parser');

var _swaggerParser2 = _interopRequireDefault(_swaggerParser);

var _swaggerMockParser = require('swagger-mock-parser');

var _swaggerMockParser2 = _interopRequireDefault(_swaggerMockParser);

// babel-polyfill can only be imported once
if (!global._babelPolyfill) {
    require('babel-polyfill');
}

exports['default'] = function (swaggerFile, mockFile, cb) {
    if (!swaggerFile) {
        throw new Error('missing swagger file path');
    }
    var parser = new _swaggerMockParser2['default']({ useExample: true });
    var parserPromise = new Promise(function (resolve) {
        _swaggerParser2['default'].dereference(swaggerFile, function (err, swagger) {
            if (err) throw err;
            resolve(swagger);
        });
    });

    parserPromise.then(function (api) {
        var paths = api.paths;
        try {
            (function () {
                var _loop = function (path) {
                    if (paths.hasOwnProperty(path)) {
                        var _loop2 = function (action) {
                            if (paths[path].hasOwnProperty(action)) {
                                if (paths[path][action].responses) {
                                    var _loop3 = function (resCode) {
                                        if (paths[path][action].responses.hasOwnProperty(resCode)) {
                                            if (paths[path][action].responses[resCode].schema) {
                                                // if example is defined and not empty,on override just skip it
                                                if (paths[path][action].responses[resCode].schema.example && paths[path][action].responses[resCode].schema.example !== '') {
                                                    return 'continue';
                                                } else {
                                                    paths[path][action].responses[resCode].schema.example = setImmediate(function () {
                                                        parser.parse(paths[path][action].responses[resCode].schema);
                                                    });
                                                }
                                            }
                                        }
                                    };

                                    for (var resCode in paths[path][action].responses) {
                                        var _ret4 = _loop3(resCode);

                                        if (_ret4 === 'continue') continue;
                                    }
                                }
                            }
                        };

                        for (var action in paths[path]) {
                            _loop2(action);
                        }
                    }
                };

                for (var path in paths) {
                    _loop(path);
                };
                var cache = [];
                _fs2['default'].writeFile(mockFile || 'swaggerWithMock.json', JSON.stringify(api, function (key, value) {
                    if (typeof value === 'object' && value !== null) {
                        if (cache.indexOf(value) !== -1) {
                            // Circular reference found, discard key
                            return;
                        }
                        // Store value in our collection
                        cache.push(value);
                    }
                    return value;
                }, 2), 'utf-8', function (err) {
                    if (err) throw err;
                    if (cb) cb();
                });
                cache = null;
            })();
        } catch (e) {
            console.log(e);
        }
    });
};

;
module.exports = exports['default'];