/// <reference path="dispatcher.ts" />
module FluxTests {
    export class AppDispatcher {
        private static dispatcher = new Dispatcher();

        static register(callback: (payload: IPayload) => void): string {
            return AppDispatcher.dispatcher.register(callback);
        }
        
        static unregister(id: string): void {
            AppDispatcher.dispatcher.unregister(id);
        }

        static waitFor(ids: string[]): void {
            AppDispatcher.dispatcher.waitFor(ids);
        }

        static handleViewAction(payload: IPayload) {
            AppDispatcher.dispatcher.dispatch(payload);
        }
    }
}