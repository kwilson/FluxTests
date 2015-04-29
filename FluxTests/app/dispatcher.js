/// <reference path="../scripts/typings/async/async.d.ts" />
var FluxTests;
(function (FluxTests) {
    var Dispatcher = (function () {
        function Dispatcher() {
            this._callbacks = [];
        }
        Dispatcher.prototype.dispatch = function (evt, data) {
            var tasks = this._callbacks.map(function (eventProcessor) {
                return function (next) {
                    var err = eventProcessor(evt, data);
                    next(err ? err : null);
                };
            });
            async.parallel(tasks, function (error) {
                if (error) {
                    throw new Error(error);
                }
            });
        };
        Dispatcher.prototype.register = function (callback) {
            this._callbacks.push(callback);
        };
        return Dispatcher;
    })();
    FluxTests.Dispatcher = Dispatcher;
})(FluxTests || (FluxTests = {}));
//# sourceMappingURL=dispatcher.js.map