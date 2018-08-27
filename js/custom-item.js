FC.Presenters.CustomItem = new Class({
    Implements: [ Events, Chain, Options ],
    options: {
        lazy: !1
    },
    initialize: function(a, b, c) {
        this.setOptions(c);
        this.item = a;
        this.$container = $(b);
        this.options.lazy || this._load();
        this._syncInputsChange();
    },
    _load: function() {
        this._initial = this.item.isNewItem() ? this._getValuesFromInputs() : this._setValuesToInputs();
        this._fetchInputsDescs();
    },
    _getValuesFromInputs: function() {
        this.$container.getElements("input[name][type=radio]:checked").each(function(a) {
            this.item.store(a.get("name"), a.get("value"));
        }, this);
        this.$container.getElements("input[name][type=text]:enabled").each(function(a) {
            var b = a.get("value");
            this.item.store(a.get("name"), b.length ? b : null);
        }, this);
        return this;
    },
    _setValuesToInputs: function() {
        this.$container.getElements("input[name][type=radio]:enabled").each(function(a) {
            var b = a.get("name"), c = null !== this.item.retrieve(b) ? this.item.retrieve(b).toString() : null;
            "charges[item_monogram]" !== b && a.set("checked", c === a.get("value"));
        }, this);
        this.item.hasValid("monogram") ? document.id("WithMonogram").set("checked", !0) : document.id("NoneMonogram").set("checked", !0);
        this.$container.getElements("input[name][type=text]:enabled").each(function(a) {
            a.set("value", this.item.retrieve(a.get("name")));
        }, this);
        return this;
    },
    _fetchInputsDescs: function(a) {
        this.$container.getElements("input[name][type=radio]").each(function(a) {
            var c = a.getElement("+ label");
            c && this.item.setDescs(a.get("name"), a.get("value"), c.get("text"));
        }, this);
    },
    _syncInputsChange: function() {
        this.$container.addEvents({
            "change:relay(input[type=text][name])": function(a, b) {
                this.item.store(b.get("name"), b.get("value"));
            }.bind(this),
            "click:relay(input[type!=text][name])": function(a, b) {
                this.item.store(b.get("name"), b.get("value"));
            }.bind(this)
        });
    },
    inputChange: function(a) {
        a && this.$container.fireEvent("text" === a.get("type") ? "change:relay(input[type=text][name])" : "click:relay(input[type!=text][name])", [ null, a ]);
    }
});
