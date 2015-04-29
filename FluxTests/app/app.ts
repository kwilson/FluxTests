/// <reference path="../scripts/typings/wolfy87-eventemitter/wolfy87-eventemitter.d.ts" />
/// <reference path="../scripts/typings/react/react-global.d.ts" />

module FluxTests {
    export class FluxTestsApp extends Marionette.Application {

        static dispatcher = new Dispatcher();

        constructor() {
            super();
            this.on('start', this.appStarted);
        }

        private appStarted() {
            var rootView = new RootView();
            var processor = new TextProcessor();

            // Create the React element
            var reactOutput = ComponentFactory.getTextView();

            React.render(
                React.createElement(reactOutput, null),
                document.getElementById('output-region-2'));
        }
    }

    // Helper class for creating React components
    export class ComponentFactory {
        static getTextView() {
            var textStore = new TextModelFluxStore();

            return React.createClass({
                displayName: "TextView",
                getInitialState() {
                    return { text: textStore.getValue() };
                },
                componentDidMount() {
                    textStore.addChangeListener(this._onChange);
                },
                componentWillUnmount() {
                    textStore.removeChangeListener(this._onChange);
                },
                render() {
                    return (
                        React.createElement("div", null, this.state.text)
                        );
                },
                _onChange() {
                    this.setState({ text: textStore.getValue() });
                }
            });
        }
    }

    // This just simulates some round trip to the server with a 2 second delay. It also appends a date.
    export class TextProcessor {
        constructor() {
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        }

        private _processEvent(evt: EventType, data?: any) {
            switch (evt) {
                case EventType.ItemSubmitted:
                    var value = data;
                    setTimeout(() => {
                        FluxTestsApp.dispatcher.dispatch(EventType.ItemAdded, value + ' : ' + new Date());
                    }, 2000);

                    return;
            }
        }
    }

    // React store type using EventEmitter to handle change subscriptions.
    export class TextModelFluxStore {
        private model: string;
        private static CHANGE_EVENT = 'change';

        private emitter: Wolfy87EventEmitter.EventEmitter;

        constructor() {
            this.emitter = new EventEmitter();
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        }

        getValue(): string {
            return this.model;
        }

        addChangeListener(callback: () => void) {
            this.emitter.on(TextModelFluxStore.CHANGE_EVENT, callback);
        }

        removeChangeListener(callback: () => void) {
            this.emitter.removeListener(TextModelFluxStore.CHANGE_EVENT, callback);
        }

        emitChange() {
            this.emitter.emit(TextModelFluxStore.CHANGE_EVENT);
        }

        private _processEvent(evt: EventType, data?: string) {
            switch (evt) {
                case EventType.ItemSubmitted:
                    this.model = '';
                    this.emitChange();
                    return;

                case EventType.ItemAdded:
                    this.model = data;
                    this.emitChange();
                    return;
            }
        }
    }

    // Base layout view for Marionette
    export class RootView extends Marionette.LayoutView<any> {
        private inputRegion: Marionette.Region;
        private outputRegion: Marionette.Region;

        constructor(options: any = {}) {
            this.el = 'body';
            super(options);

            this.addRegions({
                inputRegion: '#input-region',
                outputRegion: '#output-region'
            });

            this.inputRegion.show(new InputItemView());
            this.outputRegion.show(new TextValueModelView());
        }
    }

    // Marionette view for the input form
    export class InputItemView extends Marionette.ItemView<any> {

        constructor(options: any = {}) {
            options.template = '#input-template';
            options.events = {
                'submit form': this.onClickEventHandler
            };
            super(options);
        }

        private onClickEventHandler(e: JQueryEventObject) {
            e.preventDefault();

            var inputEl = this.$('input');
            var value = inputEl.val();
            FluxTestsApp.dispatcher.dispatch(EventType.ItemSubmitted, value);
            inputEl.val('');
        }
    }

    // Backbone model for text value
    export class TextValueStore extends Backbone.Model {
        text: string;

        constructor(attributes?: any, options?: any) {
            super(attributes, options);

            if (attributes) {
                this.text = attributes.text;
            }
        }

        initialize() {
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        }

        private _processEvent(evt: EventType, data?: any) {
            switch (evt) {
                case EventType.ItemAdded:
                    this.text = data;
                    this.trigger('change');
                    return;

                case EventType.ItemSubmitted:
                    this.text = '';
                    this.trigger('change');
                    return;
            }
        }
    }

    // Marionette view for text output
    export class TextValueModelView extends Marionette.ItemView<TextValueStore> {
        constructor(options: any = {}) {

            this.model = new TextValueStore();

            options.template = () => {
                return this.model.text;
            };

            super(options);

            this.model.on('change', this.render);
        }
    }
} 