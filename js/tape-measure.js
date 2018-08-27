FC.Presenters.TapeMeasure = new Class({
    Implements: [ Events, Chain, Options ],
    options: {
        gridsPerInch: 2,
        position: {
            position: "centerLeft",
            edge: "centerRight",
            offset: {
                x: -40,
                y: 2
            }
        },
        attr: {
            tapePreset: "data-tape-preset"
        },
        selectors: {
            modalBox: "div#TapeMeasureBox",
            tape: "div#Tape",
            measure: "input.number",
            container: "div[class^=step-]"
        }
    },
    initialize: function(a, b, c) {
        this.setOptions(c);
        this.shirt = a;
        this.$$inputs = $$(b);
        this.$input = null;
        this.$box = document.getElement(this.options.selectors.modalBox);
        this.$measure = this.$box.getElement(this.options.selectors.measure);
        this.modalBox = this.$box.retrieve("modalbox");
        this.modalBox || (this.modalBox = new ModalBox(this.$box, {
            mask: !1,
            draggable: !1,
            pin: !1,
            onHide: this.focusInput.bind(this)
        }));
        this.tape = new Drag.Scroll(this.$box.getElement(this.options.selectors.tape));
        this._attachForInputs();
        this._enableTapeMeasure();
        this._enableManualInput();
        this._enableKeyboardControl();
    },
    hide: function() {
        this.modalBox.hide();
    },
    focusInput: function() {
        if (!Browser.ie && this.$input) {
            if (!this.$input.getParent("div[class^=step-]").hasClass("current")) return !1;
            this.disabled = !0;
            this.$input.focus();
            this.disabled = !1;
        }
    },
    _attachForInputs: function() {
        this.$$inputs.each(function(a) {
            a.addEvent("focus", function() {
                var b, c;
                b = $(document.body);
                if (a.getPosition(b).x > b.getWidth()) return !1;
                Browser.ie || !0 !== this.disabled ? (b = Number(a.get("value")), c = Number(a.get(this.options.attr.tapePreset)),
                navigator.userAgent.match(/Trident\/7\./) && 0 === b && a.set("value", 0), this.disabled = !0,
                this.$input = a, this.modalBox.hide(), this.modalBox.setPosition(Object.merge({
                    relativeTo: a
                }, this.options.position)), this.modalBox.show(), this.$measure.set("value", b ? b : "").focus(),
                this.tape.setToGrid(b ? b * this.options.gridsPerInch : c * this.options.gridsPerInch || 0, 0)) : this.disabled = !1;
            }.bind(this));
        }, this);
    },
    _enableTapeMeasure: function() {
        this.tape.addEvents({
            drag: function() {
                this.$measure.set("value", this.tape.getCurrentGrid().x / this.options.gridsPerInch);
            }.bind(this),
            complete: function() {
                this.$input && this.$box.isVisible() && (this.$input.set("value", this.$measure.get("value")),
                this._syncInputsChange());
            }.bind(this)
        });
    },
    _enableManualInput: function() {
        this.$measure.addEvent("change:pause(400)", function() {
            var a = Number.from(this.$measure.get("value")), b = Math.round(a * this.options.gridsPerInch) || 0;
            a ? (this.$measure.set("value", b / this.options.gridsPerInch), this.tape.scrollToGrid(b, 0)) : this.$measure.set("value", "");
        }.bind(this));
        this.$measure.addEvent("blur", function() {
            this.$input.set("value", this._normalizeInputs(this.$measure.get("value")));
            this._syncInputsChange();
        }.bind(this));
    },
    _enableKeyboardControl: function() {
        this.hasNumberWidget = "number" === this.$measure.get("type");
        this.step = Number.from(this.$measure.get("step"));
        this.$measure.addEvent("keydown", function(a) {
            var b = Number.from(this.$measure.get("value"));
            if ([ "up", "down" ].contains(a.key)) {
                if (!b) return this.tape.fireEvent("drag").fireEvent("complete"), !1;
                this.hasNumberWidget || (this.$measure.set("value", "up" === a.key ? b + this.step : b - this.step),
                this.$measure.fireEvent("change"));
            } else "tab" === a.key ? this.hide() : "enter" === a.key && Browser.ie && 10 > Browser.version && this.$measure.fireEvent("change");
        }.bind(this));
    },
    _normalizeInputs: function(a) {
        return (2 * Number.from(a)).round() / 2;
    },
    _syncInputsChange: function() {
        this.shirt.store(this.$input.get("name"), this.$input.get("value"));
    }
});
