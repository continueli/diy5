FC.Presenters.CustomShirt = new Class({
    Extends: FC.Presenters.CustomItem,
    initialize: function(a, b, c) {
        this.item = this.shirt = a;
        this.parent.apply(this, arguments);
    },
    t: function(a) {
        return Locale.get("CustomShirt." + a);
    }
});

FC.Presenters.CustomShirt.Demonstration = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function() {
        this.parent.apply(this, arguments);
        this.shirt.addEvent("show", this._syncDisplay.bind(this));
        this.$$angle = this.$container.getElements("input[name=viewing_angle]");
        this.$$img = this.$container.getElements("img").each(function(a) {
            a.store("position", a.get("data-position"));
        });
        this._syncDisplay();
    },
    _syncDisplay: function() {
        this.$$angle.filter("[value=" + this.shirt.retrieve("viewingAngle") + "]").set("checked", !0);
        this.$$img.each(function(a) {
            var b = a.retrieve("position"), c = this.shirt.retrieve("tailorings[" + b + "]"), c = c ? a.get("data-url-" + c.dasherize()) : null;
            a.set("src", c || this.shirt.getDemoUrl(b));
        }, this);
    }
});

FC.Presenters.CustomShirt.Fabrics = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function(a, b) {
        this.$container = b;
        this.parent.apply(this, arguments);
        this.$multiple = $("FabricsMultiple");
        this.$catalogs = $("FabricCatalogs");
        this.$collections = $("FabricCollections");
        this.collections = new Fx.Scroll(this.$collections, {
            link: "cancel"
        });
    },
    loadFabrics: function(a, b, c) {
        var d = FC.getLocale();
        new Request.HTML({
            url: [ "zh-TW" !== d ? "/" + d : "", "", b ? "edit/" + b : a ].join(""),
            onRequest: function() {
                c.addClass("loading");
            },
            onSuccess: function(a) {
                var b = $$(a), d;
                a = b.filter("#FabricCatalogs").pop();
                d = b.filter("#FabricCollections").pop();
                b = b.filter("#FabricCollectionsNav").pop();
                this.$catalogs.set("html", this.$catalogs.get("html") + a.get("html"));
                this.$collections.set("html", this.$collections.get("html") + d.get("html"));
                b.getElements(".fabric-nav").each(function(a) {
                    this.$container.grab(a);
                }, this);
                this.$$navs = this.$container.getElements(".fabric-nav");
                this._load();
                this._retrieveProductsInfo();
                this._enableFabricsDisplay();
                this._enableMultipleSelect();
                this._refreshCollections();
                this._lazyLoadFabrics();
                this.shirt.fireEvent("fabricsload");
                c.removeClass("loading");
            }.bind(this),
            onFailure: function(a) {
                alert(this.t("alert-loading-fabric-failed").substitute({
                    status: a.status,
                    text: a.statusText
                }));
                c.getElements(".loading-mask").set("text", this.t("loading-mask-no-fabric"));
            }.bind(this)
        }).get();
    },
    _retrieveProductsInfo: function() {
        this.$container.getElements("[data-product]").each(function(a) {
            FC.Product.factory(JSON.decode(a.get("data-product")));
        });
        this.$container.getElements("input[name=fabrics][id^=AllSkuNo]").each(function(a) {
            var b = a.get("value"), c = FC.Product.factory(b).findVariant(b);
            c && (a = a.getNext("input[data-demo-images]")) && Object.each(JSON.decode(a.get("data-demo-images")), function(a, b) {
                c.addDemoUrl(b, a);
            });
        });
    },
    _enableFabricsDisplay: function() {
        this.$catalogs.addEvent("change", this._refreshCollections.bind(this));
        this.$catalogs.getElements("option[data-pages-count]").each(function(a) {
            a = a.get("value");
            new Carousel(this.$collections, this.$collections.getElements("ul." + a), this.$$navs.filter("." + a).getElements("a").pop(), {
                onChange: function(a, c, d, e) {
                    e.removeClass("current");
                    c.addClass("current");
                },
                onComplete: this._lazyLoadFabrics.bind(this)
            });
        }, this);
        this.$collections.getElements("ul").set("reveal", {
            onShow: this._lazyLoadFabrics.bind(this)
        });
        new Tips(this.$collections.getElements("label[for]").each(function(a) {
            a.store("tip:text", a.getSiblings("div.tips-text").get("html").pop().replace("data-lazy-load-", ""));
        }), {
            className: "tip-wrap-fabrics"
        });
    },
    _enableMultipleSelect: function() {
        this.$multiple.set("checked", !1).addEvents({
            click: function() {
                this._updateSelection();
                this._refreshCollections();
            }.bind(this)
        });
        this._updateSelection();
        this.$container.addEvent("click:relay(input[name][type=checkbox])", function(a, b) {
            b.get("checked") || this.$container.getElements("ul.all input[name][type=checkbox]:checked").length || b.set("checked", !0);
        }.bind(this));
        Browser.ie && (Browser.ie6 || Browser.ie7) && this.$catalogs.addEvent("change", function() {
            this.$catalogs.getSelected().get("disabled").pop() && (this.$multiple.set("checked", !0),
            this._updateSelection(), this._refreshCollections());
        }.bind(this));
    },
    _updateSelection: function() {
        var a = this.$multiple.get("checked");
        this.shirt.setFabricsMultiple(a);
        this.$container.getElements("input[name]:checked").set("checked", !1);
        this.$collections.hide().toggleClass("multiple", a);
        a ? this.$collections.getElements("ul.all label:not(.disabled)[for]:not([for$=Multiple)]").each(function(a) {
            a.set("for", a.get("for") + "Multiple");
        }) : this.$collections.getElements("ul.all label:not(.disabled)[for$=Multiple]").each(function(a) {
            a.set("for", a.get("for").replace(/Multiple$/, ""));
        });
        this.$collections.show();
        this.$catalogs.getElement(a ? "option:disabled" : "option:enabled").set("selected", !0);
        this.$catalogs.set("disabled", a);
    },
    _refreshCollections: function() {
        var a, b = this.$catalogs.get("value"), c = this.$multiple.get("checked");
        this.collections.toLeft();
        this.$$navs.fade("hide").hide().filter("." + b).show().fade("in");
        this.shirt.skuNo || (a = this.$container.getElement("ul." + b + " input[name=fabrics]:enabled"),
        this.inputChange(a));
        this.$container.getElements("ul:not(." + b + ")").removeClass("current").dissolve();
        this.$container.getElements("ul." + b).addClass("current").reveal({
            display: Browser.ie && 8 > Browser.version ? "inline" : "inline-block"
        });
        this.$container.getElements("ul." + b + " input[type=" + (c ? "checkbox" : "radio") + "][value=" + this.shirt.skuNo + "]:enabled").set("checked", !0);
    },
    _lazyLoadFabrics: function() {
        this.$collections.getElement("ul.current").getElements("label img[data-lazy-load-src]").each(function(a) {
            a.addEvent("load:once", function() {
                $$("img[data-lazy-load-src=" + a.get("src") + "]").each(function(b) {
                    b.set("src", a.get("src")).removeProperty("data-lazy-load-src");
                });
            });
            a.set("src", a.get("data-lazy-load-src"));
            a.set("data-lazy-load-src", null);
        }, this);
    }
});

FC.Presenters.CustomShirt.Tailorings = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function() {
        this.parent.apply(this, arguments);
        this._shortenLabelDisplay();
        this._ensureSleeveCuff();
        this._syncViewingAngle();
    },
    _ensureSleeveCuff: function() {
        this.$container.getElements("input[name*=sleeve]").each(function(a) {
            a.addEvent("click", function() {
                var b = a.getElement("!> * input[name*=cuff]");
                this.shirt.store(b.get("name"), b.set("checked", !0).get("value"));
                this.$container.getElements("ul.cuff-for-sleeve").hide();
                b.getParent("ul").show();
            }.bind(this));
        }, this);
    },
    _syncViewingAngle: function() {
        this.$container.addEvent("click:relay(input[data-viewing-angle])", function(a, b) {
            this.shirt.store("viewingAngle", b.get("data-viewing-angle"));
        }.bind(this));
    },
    _shortenLabelDisplay: function() {
        this.$container.getElements("[data-shorten-label]").each(function(a) {
            var b = RegExp("\\s" + a.get("data-shorten-label") + "$", "i");
            a.getElements("label").each(function(a) {
                var d = a.get("text"), e;
                !/^no\s/i.test(d) && (e = d.match(b)) && (e = e[b.lastIndex], a.set("text", d.replace(e, "")),
                a.appendHTML('<span class="invisible">' + e + "</span>"));
            });
        });
    }
});

FC.Presenters.CustomShirt.Details = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function() {
        this.parent.apply(this, arguments);
        this.$buttonCharge = this.$container.getElement('input[name="charges[shirt_button]"]');
        this._syncButtonCharges();
    },
    _syncButtonCharges: function() {
        this.$container.addEvent("click:relay(input[type=radio][name])", function(a, b) {
            var c = b.get("data-charge");
            this.$buttonCharge.set("value", Number.from(c));
            this.inputChange(this.$buttonCharge);
        }.bind(this));
    }
});

FC.Presenters.CustomShirt.Extras = new Class({
    Extends: FC.Presenters.CustomShirt,
    options: {
        box: "#AddonNecktiesProductBox"
    },
    initialize: function() {
        this.parent.apply(this, arguments);
        this.$monogram = $("MonogramOptions");
        this.$$chargesMonogram = this.$container.getElements("input[name*=monogram][name*=charges]");
        this.$$chargesUrgency = this.$container.getElements("input[name*=urgency][name*=charges]");
        this.$$addonNecktie = this.$container.getElements("input[name*=necktie][name*=addon]");
        this._enableMonogramSelect();
        this._refreshMonogram();
        this._unifyChargeUrgency();
        this._enableAddonSelect();
    },
    _unifyChargeUrgency: function() {
        var a = CustomShirts.getItems().pop(), b = 0;
        this.$$chargesUrgency.addEvent("click", function() {
            CustomShirts.applyForItems(this.get("name"), this.get("value"));
        });
        a && (b = a.getCharges("shirtUrgency"), this.$$chargesUrgency.filter("[value=" + b + "]").set("checked", !0),
        this.shirt.setCharges("shirtUrgency", b));
    },
    _enableMonogramSelect: function() {
        new Tips(this.$monogram.getElements("input[name*=color] ~ label").store("tip:text", ""));
        this.$$chargesMonogram.addEvent("click", this._refreshMonogram.bind(this));
    },
    _refreshMonogram: function() {
        var a = this.$$chargesMonogram.filter(":checked#WithMonogram").pop();
        this.$monogram.slide(a ? "in" : this.$container.isVisible() ? "out" : "hide");
        a || (this.$monogram.getElements("input[type=text]").set("value", ""), this.$monogram.getElements("input[type=radio]").set("checked", !1));
    },
    _enableModalBox: function() {
        this.$box = document.getElement(this.options.box);
        this.box = new ModalBox(this.$box, {
            contentSelector: "div#AddonProductList",
            onShow: function() {
                this.$necktieList = this.$necktieList || $("AddonProductList");
                this.initNecktieList = this.$necktieList.getElement("ul").clone(!0, !0);
            }.bind(this),
            onHide: function() {
                this.$necktieList.getElement("ul").dispose();
                this.$necktieList.grab(this.initNecktieList, "top");
                0 === this.initNecktieList.getElements("li > input:checked").length && this.$$addonNecktie.filter("[value=0]").set("checked", !0);
            }.bind(this)
        });
        this.$box.getElement("a.submit").addEvent("click", function() {
            this.initNecktieList = this.$necktieList.getElement("ul").clone(!0, !0);
            alert("加購成功！");
            this.box.hide();
            0 < this.initNecktieList.getElements("li > input:checked").length && this.$$addonNecktie.filter("[value!=0]").set("checked", !0);
        }.bind(this));
    },
    _enableAddonSelect: function() {
        this._enableModalBox();
        this.$$addonNecktie.addEvent("click", function() {
            this.$$addonNecktie.filter(":checked[value!=0]").pop() ? this.box.load("/products/addon/neckties") : this.$necktieList.getElements("ul > li").each(function(a) {
                a.getElement("input").erase("checked");
            });
        }.bind(this));
    }
});

FC.Presenters.CustomShirt.MeasurementRef = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function() {
        this.parent.apply(this, arguments);
        this.$login = $("HistoryLogin");
        this.$lastRecord = this.$login.getElement("a.confirm");
        this.$history = this.$container.getElement("input[name=history[ctrl]]");
        this.$$historyOptions = this.$container.getElements("input[name=history[from]])");
        this.$$refers = this.$container.getElements("input[name*=refer]");
        this.$$bodyOptions = this.$container.getElements("input[name*=extend]");
        this.$$standardOptions = this.$container.getElements("input[name*=standard]");
        this.$$refersOptions = $$(this.$$bodyOptions, this.$$standardOptions);
        this._enableHints();
        this._enableHistory();
        this._enableOptions();
    },
    _enableHints: function() {
        var a;
        a = this.$$bodyOptions.getElements(" ~ label").flatten().each(function(a) {
            a.store("tip:text", a.getSiblings("p.tips-text").get("html").pop());
        });
        new Tips(a, {
            className: "tip-wrap-wraptext"
        });
        new Tips(this.$container.getElements("a.paper-tape").each(function(a) {
            a.store("tip:text", a.get("rel"));
        }));
    },
    _enableHistory: function() {
        $$(this.$history, this.$lastRecord).addEvent("click", this._retrieveLastRecord.bind(this));
        this.$login.getElement("a.cancel").addEvent("click", this.__refreshHistory.bind(this));
        this.$login.getElements("a[class!=cancel]").addEvent("click", function(a) {
            a.target.hide().getSiblings("a").show("inline");
        });
    },
    _enableOptions: function() {
        this.$$refers.addEvent("click", function(a) {
            var b = a.target;
            a = this.$$refersOptions.filter("." + b.get("value"));
            b = a[0] || b;
            a.filter(":checked").length || (this.shirt.store(b.get("name"), b.get("value")),
            this.__refreshHistory(), this.__refreshOptions());
        }.bind(this));
        this.$$refersOptions.addEvent("click", this.__refreshHistory.bind(this));
        this.$$refersOptions.addEvent("click", this.__refreshOptions.bind(this));
    },
    _retrieveLastRecord: function() {
        var a = Object.clone(CustomShirts.getItems().filter(function(a) {
            return a.gender === this.shirt.gender;
        }.bind(this)).pop());
        this.__refreshHistory();
        a && a.gender === this.shirt.gender ? (this.shirt.cloneMeasurements(a), this.__refreshHistory("cart"),
        this.__refreshOptions()) : User.isLoggedIn() ? (this.__refreshHistory("check"),
        new Request.JSON({
            useSpinner: !0,
            data: {
                gender: this.shirt.gender
            },
            spinOptions: {
                hideOnClick: !0,
                destroyOnHide: !0
            },
            spinnerTarget: this.$history.getParent("label"),
            method: "get",
            url: this.$lastRecord.get("rel"),
            onSuccess: function(a) {
                a = new FC.ShirtItem(a.sku_no, a.data, a.schema);
                a.hasValid("measurements") ? (this.shirt.cloneMeasurements(a), this.__refreshHistory("order"),
                this.__refreshOptions()) : this.__refreshHistory("none", !0);
            }.bind(this)
        }).send()) : this.$login.reveal();
    },
    __refreshOptions: function(a) {
        var b;
        a && a.target ? (b = $(a.target).get("data-refer"), a = $(a.target).get("value")) : (b = this.shirt.getTailorings("refer"),
        a = this.shirt.retrieve({
            body: "tailorings[extend]",
            standard: "standard[neck]"
        }[b] || "none"));
        this.$$refers.filter("[value=" + b + "]").set("checked", !0);
        this.$$refersOptions.set("checked", !1).filter("[value=" + a + "]").set("checked", !0);
    },
    __refreshHistory: function(a, b) {
        a = "string" === typeof a ? a : null;
        this.$login = (b = b || !a) ? this.$login.dissolve() : this.$login;
        this.$history.set("checked", !b);
        this.$$historyOptions.set("checked", !1).filter("[value=" + a + "]").set("checked", !0);
    }
});

FC.Presenters.CustomShirt.MeasurementInputs = new Class({
    Extends: FC.Presenters.CustomShirt,
    initialize: function() {
        this.parent.apply(this, arguments);
        this.$$images = this.$container.getElements("img");
        this.$$inputs = this.$container.getElements("input[name^=inputs]");
        this.$$measurements = this.$container.getElements("input[name^=measurements]");
        this.$$instructions = this.$container.getElements("*[class^=by-]");
        this.$$formulas = this.$container.getElements("ins[class*=invisible]");
        this.$$adjustments = this.$container.getElements("ins.adjustment[data-measurement]");
        this.$$adjustments.each(function(a) {
            a.store("data-measurement", a.get("data-measurement"));
        });
        this.displaySign = null;
        this._enableImageSwitch();
        this._enableHints();
        this._enableOptionalInputs();
        this._normalizeInputs();
        this.shirt.addEvent("change", this._refreshDisplay.bind(this));
        new Tips(this.$$adjustments, {
            onShow: function(a, b) {
                this.setText(b.get("tip:text"));
                a.show();
                Browser.ie && 9 > Browser.version && b.set("title", b.get("tip:text"));
            }
        });
    },
    _normalizeInputs: function() {
        this.$container.addEvent("blur:relay(input[name^=inputs])", function(a, b) {
            var c, d = Number.from(b.get("value")) || 0;
            c = (2 * d).round() / 2;
            c !== d && (b.set("value", 0 === c ? "" : c), this.inputChange(b));
        }.bind(this));
    },
    _enableOptionalInputs: function() {
        this.$container.addEvent("click:relay(.optional-label button.toggle)", function(a, b) {
            var c = b.getParent("div.optional-label").get("data-spec");
            this.$container.getElements("div.optional-label[data-spec~=" + c + "]");
            this.shirt.toggleForceEnabledMeasurement(c).fireEvent("change");
        }.bind(this));
    },
    _enableImageSwitch: function() {
        this.$$images.length && (this.$$images.each(function(a) {
            a.set("reveal", {
                heightOverride: a.get("height"),
                widthOverride: a.get("width"),
                mode: "both"
            });
        }), this.$$instructions.each(function(a) {
            (a.getElements("img").dissolve().shift() || new Elements()).reveal();
        }, this), this.$container.addEvent("focus:relay(input[name^=inputs])", function(a, b) {
            var c = b.retrieve("instruction-image", this.$$images.filter("." + b.get("data-spec")).pop());
            c && (c.getElements("!> ~~ * img").dissolve(), c.reveal());
        }.bind(this)));
    },
    _enableHints: function() {
        new Tips(this.$container.getElements("a.paper-tape").each(function(a) {
            a.store("tip:text", a.get("rel"));
        }));
    },
    _refreshDisplay: function() {
        var a = this.shirt.retrieve("tailorings[refer]"), b = this.shirt.retrieve("tailorings[extend]"), c = this.shirt.retrieve("tailorings[sleeve]"), d = this.shirt.getDisabledMeasurements(), e = this.shirt.getOptionalMeasurements(), c = a + b + c + "|" + d + "|" + e + Object.values(this.shirt.measurements || []), f;
        c !== this.displaySign && (this.displaySign = c, c = this.$container.getElements("div.optional-label[data-spec]"),
        this.$$instructions.each(function(b) {
            b.hasClass("by-" + a) ? b.show() : b.hide();
        }, this), this.$container.getElements("input[name] !> label.invisible").removeClass("invisible").show(),
        this.$$inputs.each(function(b) {
            b.set("disabled", !b.hasClass(a) || d.contains(b.getLastLevelOfName())).set("value", b.hasClass(a) ? this.shirt.retrieve(b.get("name")) || null : null);
            b.get("disabled") && b.getParent("label").addClass("invisible").hide();
        }, this), this.$$measurements.each(function(a) {
            a.set("value", this.shirt.retrieve(a.get("name")) || "??");
            d.contains(a.getLastLevelOfName()) && a.getParent("label").addClass("invisible").hide();
        }, this), c.each(function(a) {
            var b = a.get("data-spec");
            a.toggleClass("invisible", !e.contains(b)).toggleClass("enabled", !d.contains(b));
        }), this.$$formulas.hide().filter("." + b).show("inline"), this.$$adjustments.each(function(a) {
            f = this.shirt.getMakingAdjustment(a.retrieve("data-measurement"));
            a.set("text", [ f.operator, " ", f.value, " =" ].join("")).set("tip:text", [ f.desc, " ", f.operator, " ", f.value, " ", f.unit ].join(""));
        }.bind(this)));
    }
});

FC.Presenters.CustomShirt.Finish = new Class({
    initialize: function(a, b, c) {
        this.shirt = a;
        this.$container = b;
        this.$form = this.$container.getParent("form");
        this.editingItem = c;
        this.$shopping = $("ShirtsShopping");
        this.$inventory = this.$shopping.getElement("select");
        this.$addToCart = this.$shopping.getElement("a.submit");
        this.$container.getParent("div[class^=step-]").addEvent("show", this._updateSummary.bind(this));
        this.shirt.addEvent("change", this._updateInventory.bind(this));
        this.$inventory.addEvent("change", this._updateShopping.bind(this));
        this.$addToCart.addEvent("click", this._addToCart.bind(this));
        this._updateSummary();
        this._updateInventory();
        this._updateShopping();
        this.editingItem && this.shirt.fireEvent("change");
    },
    t: function(a) {
        return Locale.get("CustomShirt." + a);
    },
    _addAddonItems: function() {
        this.$necktieList = $("AddonProductList");
        0 < this.$necktieList.getChildren().length && (JSON.decode(this.$necktieList.getElement("input[type=hidden]").get("data-neckties")).each(function(a) {
            FC.Product.factory(a);
        }), this.$necktieList.getElements("input:checked").each(function(a) {
            a = a.get("id");
            a = FC.Product.factory(a).findVariant(a);
            a = new FC.AddonItem().setByVariant(a).setQuantity(Math.min(1, a.getSalesQtyLimit()));
            CustomShirts.setAddonItem(a);
            CustomShirts.addFromAddonItem();
        }));
    },
    _addToCart: function(a) {
        a.stop();
        if ("#step-6" !== location.hash) location.href = "#step-6"; else if (this.editingItem || "0" !== this.$inventory.get("value")) {
            this.shirt.cleanupDisabledMeasurements();
            try {
                this.$form.submit(), this.editingItem ? (CustomShirts.removeItem(this.editingItem),
                CustomShirts.addFromCustomizingItem(), this._addAddonItems(), alert(this.t("alert-edit-success"))) : (CustomShirts.addFromCustomizingItem(),
                this._addAddonItems(), alert(this.t("alert-cart-success")));
            } catch (b) {
                if ("ExceedCookieLengthError" === b.name) alert(this.t("alert-cart-cookie-full")); else throw b;
            }
        } else alert(this.t("alert-bag-full"));
    },
    _updateSummary: function() {
        var a = this.shirt.getDisabledMeasurements(), b = [];
        this.$container.getElements("li.measurements span.invisible").removeClass("invisible").show();
        "#step-6" === location.hash && (Browser.ie6 || this.$inventory.focus());
        this.$container.getElements("var[class]").each(function(c) {
            var d = c.get("class"), e = [];
            "measurements" !== d && (e = this.shirt.retrieve("summary[" + d + "]"));
            switch (d) {
              case "fabrics":
              case "tailorings":
              case "details":
                c.set("html", e.length ? e.join("") : "");
                break;

              case "charges":
                c.set("html", e.length ? e.reverse().join("") : "");
                break;

              case "monogram":
                e.length ? c.set("html", " " + this.t("punct-enum-parens")[0] + e.join("") + this.t("punct-enum-parens")[1]) : c.set("html", "");
                break;

              case "addon":
                c.set("html", $("AddonProductList").getElements("ul > li").some(function(a) {
                    return $(a).getElement("input").get("checked");
                }) ? "加購" : "不加購");
                break;

              case "necktie":
                $("AddonProductList").getElements("ul > li").each(function(a) {
                    $(a).getElement("input").get("checked") && b.push($(a).getElement("div.desc > p").get("text"));
                });
                c.set("html", b.length ? b.join("、") : "");
                break;

              case "measurements":
                d = c.get("data-position"), c.set("text", this.shirt.retrieve("measurements[" + d + "]")),
                a.contains(d) && c.getParent("span").addClass("invisible").hide();
            }
        }, this);
        Browser.ie && 9 > Browser.version && this.$container.getElements("li var span").addClass("each-item").filter(":last-child").addClass("last-item");
    },
    _updateInventory: function() {
        if (this.shirt.getFabricsSign() !== this.$inventory.get("data-fabrics-sign")) {
            var a, b;
            a = CustomShirts.getItems().erase(this.editingItem);
            b = this.shirt.getLeastAvailableInventory(a);
            this.$inventory.empty().set("data-fabrics-sign", this.shirt.getFabricsSign());
            for (a = b ? 1 : 0; a <= b; a += 1) this.$inventory.grab(new Element("option[value={i}][text={i}]".replace(/\{i\}/g, a)));
            this._updateShopping();
        }
    },
    _updateShopping: function() {
        this.shirt.setQuantity(Number(this.$inventory.get("value")) || 0);
    }
});

FC.Presenters.CustomShirt.Navigation = new Class({
    initialize: function(a, b) {
        this.shirt = a;
        this.$container = b;
        this.validator = new Form.Validator.SingleHint(this.$container);
        this.validator.stop();
        this.$$steps = {};
        this.$container.getElements("div[class^=step]").each(function(a) {
            this.$$steps[a.get("class").match(/step-([\d\-]+)/).pop()] = a;
        }, this);
        this.$$stepsAll = $$(Object.values(this.$$steps));
        this.$$stepsMain = this.$$stepsAll.filter(":not([class^=step-5-])");
        this.$$stepsSub = this.$$stepsAll.filter("[class^=step-5-]");
        this.currentStep = this.validatingStep = null;
        this.$measurementNav = document.id("MeasurementNav");
        this.steps = new Fx.Scroll(this.$container, {
            link: "cancel",
            wheelStops: !1,
            onChainComplete: this._validateStep.bind(this),
            onStart: function() {
                var a = this.$$steps[this.currentStep];
                this.$$stepsAll.removeClass("current");
                a && a.addClass("current").fireEvent("show");
                this.validator.stop();
            }.bind(this)
        });
        this.step5s = new Fx.Scroll(this.$container.getElement("#MeasurementNavScroll"), {
            link: "cancel",
            wheelStops: !1,
            onChainComplete: function() {
                if ([ "5-2", "5-3", "5-4" ].contains(this.currentStep)) {
                    var a = this.$$steps[this.currentStep].getElement("input[type=text]:enabled").getParent("fieldset");
                    a && (Browser.ie6 || a.focus());
                }
            }.bind(this)
        });
        Browser.ie && (Browser.ie6 || Browser.ie7 ? (this.steps.setOptions({
            duration: 0
        }), this.step5s.setOptions({
            duration: 0
        })) : Browser.ie10 && (this.$$ieRedraw = $$(".ie-redraw"), this.steps.addEvent("complete", function() {
            "2" === this.currentStep && (this.$$ieRedraw.invoke("hide"), function() {
                this.$$ieRedraw.show();
            }.bind(this).delay(100));
        }.bind(this))));
        this._enableKeyboardNavigation();
        this.shirt.addEvent("change", this._syncMeasurement.bind(this));
    },
    _refreshNavigation: function() {
        $$("#CustomShirtsNav li").removeClass("current").filter("a[href=#step-" + this.currentStep.substring(0, 1) + "] !").addClass("current");
        this.$measurementNav.getElements("li").removeClass("current").filter(".step-" + this.currentStep).addClass("current");
        this.$measurementNav.getElement(" > .current var") ? this.$measurementNav.reveal() : this.$measurementNav.dissolve();
        this._syncMeasurement();
    },
    _syncMeasurement: function() {
        var a, b;
        [ "5-2", "5-3", "5-4" ].contains(this.currentStep) && (a = document.getElement("#MeasurementNav"),
        b = this.shirt.getDisabledMeasurements(), b.length ? a.getElements("dd").removeClass("invisible").filter(b.map(function(a) {
            return "var[data-measure~=" + a + "] ! dd";
        }).join(", ")).addClass("invisible") : a.getElements("dd.invisible").removeClass("invisible"),
        a.getElements("var").each(function(a) {
            a.set("text", this.shirt.retrieve("measurements[" + a.get("data-measure") + "]") || "??");
        }, this));
    },
    _validateStep: function() {
        var a = this.$$steps[this.currentStep] || this.$$steps[this.currentStep.substring(0, 1)];
        this.validatingStep && this.currentStep === this.validatingStep ? (this.validator.start().validateFieldset(a),
        this.shirt.isNewItem() || this.shirt.hasValidQuantity() || alert(Locale.get("CustomShirt.alert-fabric-out-stock"))) : this.validator.stop();
    },
    getInitialStep: function() {
        return this.shirt.isNewItem() ? "#step-1" : "#step-6";
    },
    followSteps: function() {
        var a = location.hash.replace(/#step-/, ""), b = this.__retrieveLastValidStep(), c, d;
        this.validator.reset();
        a > b ? (window.history.back(), function() {
            location.href = "#step-" + b;
            this.validatingStep = b;
        }.bind(this).delay(100)) : (this.currentStep = a, this.validatingStep = this.validatingStep === this.currentStep ? this.validatingStep : null,
        c = this.$$steps[a.substring(0, 1)], d = this.$$steps[a] && this.$$steps[a] !== c ? this.$$steps[a] : this.$$steps["5-1"],
        c && d && (Browser.ie && (Browser.ie6 || Browser.ie7) ? (this.$$stepsMain.hide(),
        this.steps.toElement(c).chain(function() {
            c.show();
        }), this.$$stepsSub.hide(), this.step5s.toElement(d).chain(function() {
            d.show();
        })) : (this.steps.toElement(c), this.step5s.toElement(d))), this._refreshNavigation());
    },
    __retrieveLastValidStep: function() {
        var a = 1, b;
        this.shirt.hasValid("fabrics") && this.shirt.hasValidQuantity() ? (b = this.shirt.hasValid("monogram") ? this.shirt.hasValid("measurements") ? 6 : 5 : 4,
        4 !== b || document.getElement("input:checked#WithMonogram") || (b = this.shirt.hasValid("measurements") ? 6 : 5)) : b = 1;
        5 === b && (a = 1 === a && this.shirt.hasValid("tailorings", [ "refer" ]) ? 2 : a,
        a = 2 === a && this.shirt.hasValid("measurements", [ "height", "weight" ]) ? 3 : a,
        a = 3 === a && this.shirt.hasValid("measurements", [ "chest", "waist" ]) ? 4 : a);
        return [ b, a ].join("-");
    },
    _enableKeyboardNavigation: function() {
        this.$container.addEvent("keydown:relay(.step-nav a.next)", function(a) {
            "tab" !== a.key || a.shift || (a.stop(), location.href = $(a.target).get("href"));
        });
    }
});

Locale.define("en", "CustomShirt", {
    "alert-loading-fabric-failed": "ERROR：Loading fabric failed.\n{status} {text}",
    "loading-mask-no-fabric": "ERROR: Fabric not found.",
    "alert-bag-full": "Just reached storage limit of this item, can't add more quantity to cart.",
    "alert-edit-success": "Edit successed.",
    "alert-cart-success": "Already add to cart.",
    "alert-cart-cookie-full": "Exceed cart quantity limit, can't add more product to cart.",
    "alert-fabric-out-stock": "No Stock",
    "punct-enum-parens": [ "(", ")" ]
});

Locale.define("zh-CHT", "CustomShirt", {
    "alert-loading-fabric-failed": "錯誤：無法載入布料。\n{status} {text}",
    "loading-mask-no-fabric": "錯誤，找不到布料。",
    "alert-bag-full": "訂製襯衫已達布料庫存上限，無法再加入購物車。",
    "alert-edit-success": "訂製襯衫商品已修改完成",
    "alert-cart-success": "訂製襯衫已加入購物車",
    "alert-cart-cookie-full": "已超過購物車可存放訂製襯衫上限，無法加入購物車。",
    "alert-fabric-out-stock": "您選擇的布料已無庫存。",
    "punct-enum-parens": [ "（", "）" ]
});
