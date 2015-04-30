/// <reference path="event-types.ts" />
/// <reference path="payload-sources.ts" />
module FluxTests {

    export interface IPayload {
        // source: PayloadSource; // This may be added a a future date
        actionType: string;
        [index: string]: any;
    }

    export class Dispatcher {
        private static _prefix = 'ID_';

        private _lastID = 1;
        private _callbacks: { [index: string]: any } = {};
        private _isPending: { [index: string]: any } = {};
        private _isHandled: { [index: string]: any } = {};
        private _isDispatching = false;
        private _pendingPayload: any = null;

        /**
        * Registers a callback to be invoked with every dispatched payload. Returns
        * a token that can be used with `waitFor()`.
        *
        * @param {function} callback
        * @return {string}
        */
        register(callback: (payload: IPayload) => void): string {
            var id = Dispatcher._prefix + this._lastID++;
            this._callbacks[id] = callback;
            return id;
        }

        /**
        * Removes a callback based on its token.
        *
        * @param {string} id
        */
        unregister(id: string): void {
            invariant(
                this._callbacks[id],
                'Dispatcher.unregister(...): `%s` does not map to a registered callback.',
                id
            );

            delete this._callbacks[id];
        }

        /**
        * Waits for the callbacks specified to be invoked before continuing execution
        * of the current callback. This method should only be used by a callback in
        * response to a dispatched payload.
        *
        * @param {array<string>} ids
        */
        waitFor(ids: string[]): void {
            invariant(
                this._isDispatching,
                'Dispatcher.waitFor(...): Must be invoked while dispatching.'
                );

            for (var ii = 0; ii < ids.length; ii++) {
                var id = ids[ii];
                if (this._isPending[id]) {
                    invariant(
                        this._isHandled[id],
                        'Dispatcher.waitFor(...): Circular dependency detected while ' +
                        'waiting for `%s`.',
                        id
                    );

                    continue;
                }

                invariant(
                    this._callbacks[id],
                    'Dispatcher.waitFor(...): `%s` does not map to a registered callback.',
                    id
                    );

                this._invokeCallback(id);
            }
        }

        /**
        * Dispatches a payload to all registered callbacks.
        *
        * @param {object} payload
        */
        dispatch(payload: IPayload): void {
            invariant(
                !this._isDispatching,
                'Dispatch.dispatch(...): Cannot dispatch in the middle of a dispatch.'
            );

            this._startDispatching(payload);

            try {
                var callbacks = this._callbacks;
                for (var id in callbacks) {
                    if (callbacks.hasOwnProperty(id)) {
                        if (this._isPending[id]) {
                            continue;
                        }

                        this._invokeCallback(id);
                    }
                }
            } finally {
                this._stopDispatching();
            }
        }

        /**
        * Is this Dispatcher currently dispatching.
        *
        * @return {boolean}
        */
        isDispatching(): boolean {
            return this._isDispatching;
        }

        /**
        * Call the callback stored with the given id. Also do some internal
        * bookkeeping.
        *
        * @param {string} id
        * @internal
        */
        private _invokeCallback(id: string): void {
            this._isPending[id] = true;
            this._callbacks[id](this._pendingPayload);
            this._isHandled[id] = true;
        }

        /**
        * Set up bookkeeping needed when dispatching.
        *
        * @param {object} payload
        * @internal
        */
        private _startDispatching(payload: IPayload): void {
            var callbacks = this._callbacks;
            for (var id in callbacks) {
                if (callbacks.hasOwnProperty(id)) {
                    this._isPending[id] = false;
                    this._isHandled[id] = false;
                }
            }

            this._pendingPayload = payload;
            this._isDispatching = true;
        }

        /**
        * Clear bookkeeping used for dispatching.
        *
        * @internal
        */
        private _stopDispatching(): void {
            this._pendingPayload = null;
            this._isDispatching = false;
        }
    }
}