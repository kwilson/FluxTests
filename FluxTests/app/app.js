/// <reference path="../scripts/typings/wolfy87-eventemitter/wolfy87-eventemitter.d.ts" />
/// <reference path="../scripts/typings/react/react-global.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var FluxTests;
(function (FluxTests) {
    var FluxTestsApp = (function (_super) {
        __extends(FluxTestsApp, _super);
        function FluxTestsApp() {
            _super.call(this);
            this.on('start', this.appStarted);
        }
        FluxTestsApp.prototype.appStarted = function () {
            var rootView = new RootView();
            var processor = new TextProcessor();
            // Create the React element
            var reactOutput = ComponentFactory.getTextView();
            React.render(React.createElement(reactOutput, null), document.getElementById('output-region-2'));
        };
        FluxTestsApp.dispatcher = new FluxTests.Dispatcher();
        return FluxTestsApp;
    })(Marionette.Application);
    FluxTests.FluxTestsApp = FluxTestsApp;
    // Helper class for creating React components
    var ComponentFactory = (function () {
        function ComponentFactory() {
        }
        ComponentFactory.getTextView = function () {
            var textStore = new TextModelFluxStore();
            return React.createClass({
                displayName: "TextView",
                getInitialState: function () {
                    return { text: textStore.getValue() };
                },
                componentDidMount: function () {
                    textStore.addChangeListener(this._onChange);
                },
                componentWillUnmount: function () {
                    textStore.removeChangeListener(this._onChange);
                },
                render: function () {
                    return (React.createElement("div", null, this.state.text));
                },
                _onChange: function () {
                    this.setState({ text: textStore.getValue() });
                }
            });
        };
        return ComponentFactory;
    })();
    FluxTests.ComponentFactory = ComponentFactory;
    // This just simulates some round trip to the server with a 2 second delay. It also appends a date.
    var TextProcessor = (function () {
        function TextProcessor() {
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        }
        TextProcessor.prototype._processEvent = function (evt, data) {
            switch (evt) {
                case FluxTests.EventType.ItemSubmitted:
                    var value = data;
                    setTimeout(function () {
                        FluxTestsApp.dispatcher.dispatch(FluxTests.EventType.ItemAdded, value + ' : ' + new Date());
                    }, 2000);
                    return;
            }
        };
        return TextProcessor;
    })();
    FluxTests.TextProcessor = TextProcessor;
    // React store type using EventEmitter to handle change subscriptions.
    var TextModelFluxStore = (function () {
        function TextModelFluxStore() {
            this.emitter = new EventEmitter();
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        }
        TextModelFluxStore.prototype.getValue = function () {
            return this.model;
        };
        TextModelFluxStore.prototype.addChangeListener = function (callback) {
            this.emitter.on(TextModelFluxStore.CHANGE_EVENT, callback);
        };
        TextModelFluxStore.prototype.removeChangeListener = function (callback) {
            this.emitter.removeListener(TextModelFluxStore.CHANGE_EVENT, callback);
        };
        TextModelFluxStore.prototype.emitChange = function () {
            this.emitter.emit(TextModelFluxStore.CHANGE_EVENT);
        };
        TextModelFluxStore.prototype._processEvent = function (evt, data) {
            switch (evt) {
                case FluxTests.EventType.ItemSubmitted:
                    this.model = '';
                    this.emitChange();
                    return;
                case FluxTests.EventType.ItemAdded:
                    this.model = data;
                    this.emitChange();
                    return;
            }
        };
        TextModelFluxStore.CHANGE_EVENT = 'change';
        return TextModelFluxStore;
    })();
    FluxTests.TextModelFluxStore = TextModelFluxStore;
    // Base layout view for Marionette
    var RootView = (function (_super) {
        __extends(RootView, _super);
        function RootView(options) {
            if (options === void 0) { options = {}; }
            this.el = 'body';
            _super.call(this, options);
            this.addRegions({
                inputRegion: '#input-region',
                outputRegion: '#output-region'
            });
            this.inputRegion.show(new InputItemView());
            this.outputRegion.show(new TextValueModelView());
        }
        return RootView;
    })(Marionette.LayoutView);
    FluxTests.RootView = RootView;
    // Marionette view for the input form
    var InputItemView = (function (_super) {
        __extends(InputItemView, _super);
        function InputItemView(options) {
            if (options === void 0) { options = {}; }
            options.template = '#input-template';
            options.events = {
                'submit form': this.onClickEventHandler
            };
            _super.call(this, options);
        }
        InputItemView.prototype.onClickEventHandler = function (e) {
            e.preventDefault();
            var inputEl = this.$('input');
            var value = inputEl.val();
            FluxTestsApp.dispatcher.dispatch(FluxTests.EventType.ItemSubmitted, value);
            inputEl.val('');
        };
        return InputItemView;
    })(Marionette.ItemView);
    FluxTests.InputItemView = InputItemView;
    // Backbone model for text value
    var TextValueStore = (function (_super) {
        __extends(TextValueStore, _super);
        function TextValueStore(attributes, options) {
            _super.call(this, attributes, options);
            if (attributes) {
                this.text = attributes.text;
            }
        }
        TextValueStore.prototype.initialize = function () {
            FluxTestsApp.dispatcher.register(this._processEvent.bind(this));
        };
        TextValueStore.prototype._processEvent = function (evt, data) {
            switch (evt) {
                case FluxTests.EventType.ItemAdded:
                    this.text = data;
                    this.trigger('change');
                    return;
                case FluxTests.EventType.ItemSubmitted:
                    this.text = '';
                    this.trigger('change');
                    return;
            }
        };
        return TextValueStore;
    })(Backbone.Model);
    FluxTests.TextValueStore = TextValueStore;
    // Marionette view for text output
    var TextValueModelView = (function (_super) {
        __extends(TextValueModelView, _super);
        function TextValueModelView(options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            this.model = new TextValueStore();
            options.template = function () {
                return _this.model.text;
            };
            _super.call(this, options);
            this.model.on('change', this.render);
        }
        return TextValueModelView;
    })(Marionette.ItemView);
    FluxTests.TextValueModelView = TextValueModelView;
})(FluxTests || (FluxTests = {}));
//# sourceMappingURL=app.js.map