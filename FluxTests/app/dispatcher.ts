/// <reference path="../scripts/typings/async/async.d.ts" />
module FluxTests {

    export class Dispatcher {
        private _callbacks: ((evt: EventType, data?: any) => void)[];

        constructor() {
            this._callbacks = [];
        }

        dispatch(evt: EventType, data?: any) {
            var tasks = this._callbacks.map((eventProcessor) => {
                return (next: (value?: any) => any) => {
                    var err = eventProcessor(evt, data);
                    next(err ? err : null);
                }
            });

            async.parallel(tasks, (error: any) => {
                if (error) {
                    throw new Error(error);
                }
            });
        }

        register(callback: (evt: EventType, data?: any) => void) {
            this._callbacks.push(callback);
        }
    }
}