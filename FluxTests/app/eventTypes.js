var FluxTests;
(function (FluxTests) {
    (function (EventType) {
        EventType[EventType["ItemAdded"] = 0] = "ItemAdded";
        EventType[EventType["ItemSubmitted"] = 1] = "ItemSubmitted";
    })(FluxTests.EventType || (FluxTests.EventType = {}));
    var EventType = FluxTests.EventType;
})(FluxTests || (FluxTests = {}));
//# sourceMappingURL=eventTypes.js.map