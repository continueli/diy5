FC.Presenters.ShoppingBag = new Class({
    Implements: [ Events, Options, Chain ],
    options: {
        selectors: {
            shopNavLink: "#ShopNav li.bag > a",
            userNavLink: "#UserNav li.bag > a",
            bag: "#Bag",
            cartPrefix: "li.for-",
            total: ".summary var",
            link: ".summary a",
            cartName: ".summary strong",
            itemTemplate: "tr.template",
            manyCartsNotice: ".many-carts-notice",
            totalQty: "#UserNav .total-qty"
        }
    },
    initialize: function(a, c) {
        this.setOptions(c);
        this.carts = Array.from(a);
        this.options.defaultCart && this.carts.sort(function(c, b) {
            var a = this.options.defaultCart.getName();
            return c.getName() === a ? -1 : b.getName() === a ? 1 : 0;
        }.bind(this));
        this.defaultCart = this.carts[0];
        this.$shopNavLink = document.getElement(this.options.selectors.shopNavLink) ? document.getElement(this.options.selectors.shopNavLink) : document.getElement(this.options.selectors.userNavLink);
        this.$bag = document.getElement(this.options.selectors.bag);
        this.$manyCartsNotice = this.$bag.getElement(this.options.selectors.manyCartsNotice);
        this.$totalQty = document.getElement(this.options.selectors.totalQty);
        this.$$carts = [];
        this.$$totals = [];
        this.$$links = [];
        this.$$cartNames = [];
        this.$bag && (this.carts.each(function(c) {
            var b = this.$bag.getElement(this.options.selectors.cartPrefix + c.getHyphenatedName());
            c !== this.defaultCart || b.match(":first-child") || b.inject(this.$bag.getElement("> ul"), "top");
            this.$$carts.push(b);
            this.$$totals.push(b.getElement(this.options.selectors.total));
            this.$$links.push(b.getElement(this.options.selectors.link));
            this.$$cartNames.push(b.getElement(this.options.selectors.cartName).get("text"));
        }.bind(this)), "en" === FC.getLocale() && this._enableCurrencySwap(), this.$itemTemplate = this.$bag.getElement(this.options.selectors.itemTemplate).dispose().clone(),
        this.$itemTemplate.removeClass("template"), this.carts.invoke("addEvent", "change", this.update.bind(this)),
        this.update());
    },
    update: function() {
        this.rerenderItems();
        this.updateShopNavLink();
        this.currencySwapper && this.currencySwapper.swap();
    },
    updateShopNavLink: function() {
        var a = this.carts.findIndex(function(c) {
            return !c.isEmpty();
        });
        this.$shopNavLink.set("href", this.$$links[[ 0, a ].max()].get("href"));
    },
    rerenderItems: function() {
        var a = [], c, g = 0;
        this.$bag.hide();
        this.carts.each(function(b, h) {
            var k, l = this.$$carts[h];
            b.isEmpty() ? l.addClass("empty") : (c = l.getElement("table tbody"), a.push(this.$$cartNames[h]),
            this.$$totals[h].set("text", "NT$ " + b.getProductTotal().toPrice()), c.empty(),
            b.getItems().each(function(e) {
                var a, f, d = this.$itemTemplate.clone();
                a = d.getElement(".picture");
                k = "CustomBeddings" === b.getName() && null === e.spec;
                a.getElement("a").set("href", e.getUrl());
                a.getElement("img").set("src", a.get("data-image-host") + e.getImagePath("small", k));
                "en" === FC.getLocale() ? (d.getElement(".order-qty .piece").set("text", 1 < e.getQuantity() ? "pcs." : "pc."),
                "CustomShirts" === b.getName() ? (a = "Custom Shirt", f = e.getFabricNo()) : (a = e.getName(),
                f = e.getSpec())) : (a = e.getName(), f = e.getSpec());
                d.getElement(".product-desc a").set("text", a).set("href", e.getUrl());
                d.getElement(".product-desc span").set("text", f);
                d.getElement(".order-qty var").set("text", e.getQuantity());
                d.getElement(".unit-price-with-extra var").set("text", e.getUnitPriceWithExtra());
                c.grab(d);
                g += e.getQuantity();
            }.bind(this)), b.getAddonItems().each(function(a) {
                var b, f, d = this.$itemTemplate.clone();
                b = d.getElement(".picture");
                b.getElement("a").set("href", a.getUrl());
                b.getElement("img").set("src", b.get("data-image-host") + a.getImagePath("small", k));
                "en" === FC.getLocale() && d.getElement(".order-qty .piece").set("text", 1 < a.getQuantity() ? "pcs." : "pc.");
                b = a.getName();
                f = a.color;
                d.getElement(".product-desc a").set("text", b).set("href", a.getUrl());
                d.getElement(".product-desc span").set("text", f);
                d.getElement(".order-qty var").set("text", a.getQuantity());
                d.getElement(".unit-price-with-extra var").set("text", a.getUnitPriceWithExtra());
                c.grab(d);
                g += a.getQuantity();
            }.bind(this)), l.removeClass("empty"));
        }.bind(this));
        this.$totalQty && this.$totalQty.set("text", 0 === g ? "" : g);
        $$(this.$$carts).filter(":not(.empty)").removeClass("even").filter(function(a, c) {
            return 1 === c % 2;
        }).addClass("even");
        this.$bag.toggleClass("empty", !this.$$carts.some(function(a) {
            return !a.hasClass("empty");
        }));
        this._renderCartsNotice(a);
        this.$bag.show();
    },
    _renderCartsNotice: function(a) {
        var c = [];
        if (1 < a.length) {
            c = [ " 與 ", a.pop(), " 需分開結帳" ];
            for (c.unshift(a.pop()); a.length; ) c.unshift("、"), c.unshift(a.pop());
            this.$manyCartsNotice.set("text", "( " + c.join("") + " )").show();
        } else this.$manyCartsNotice.hide();
    },
    _enableCurrencySwap: function() {
        this.currencySwapper = new CurrencySwapper(this.$bag.getElement("[data-currency-swap]"));
    }
});

FC.Presenters.Edm = new Class({
    Implements: [ Events, Options, Chain ],
    initialize: function(a, b) {
        this.setOptions(b);
        this.$form = a;
        this._enableControls();
    },
    _enableControls: function() {
        this.$form && (this.$email = this.$form.getElement("input.email"), this.$form.addEvent("submit", function(a) {
            a.stop();
            this._request("post");
        }.bind(this)), this.$form.getElements(".new").addEvent("click", function(a) {
            a.stop();
            this._request("post");
        }.bind(this)), this.$form.getElements(".cancel").addEvent("click", function(a) {
            a.stop();
            this._request("delete");
        }.bind(this)));
    },
    _request: function(a) {
        this.req = new Request.JSON({
            url: this.$form.action,
            method: "delete" === a ? "delete" : "post",
            data: {
                email: this.$email.get("value")
            },
            onSuccess: function(a) {
                a.errors ? alert(Object.values(a.errors).join("\n")) : alert(a.msg);
            }.bind(this),
            onFailure: function(a) {
                alert("操作失敗：\n" + [ a.status, a.statusText ].join(" "));
            }
        }).send();
    }
});

FC.Presenters.Product = new Class({
    Implements: [ Events, Chain, Options ],
    options: {
        attrs: {
            skuNo: "data-sku-no"
        },
        selectors: {
            navigators: "div[id=Specification] > *:first-child a",
            contents: "div[id=Exhibition] > *[id]",
            contentFrame: "div[id=Present]",
            addToCart: "button.add-to-cart",
            orderQty: "select.order-qty"
        }
    },
    initialize: function(a, c, b) {
        this.setOptions(b);
        this.element = $(a);
        this.$$navigators = this.element.getElements(this.options.selectors.navigators);
        this.$$contents = this.element.getElements(this.options.selectors.contents);
        this.$contentFrame = this.element.getElement(this.options.selectors.contentFrame);
        this.$addToCart = this.element.getElement(this.options.selectors.addToCart);
        this.$orderQty = this.element.getElement(this.options.selectors.orderQty);
        this.cart = "jp" === this.$addToCart.get("data-cart-type") ? JpCart : Cart;
        this._enableNavigation();
        this._enableAddToCart();
    },
    _enableNavigation: function() {
        var a, c, b;
        this.scroller = new Fx.Scroll(this.$contentFrame);
        b = function(a) {
            this.scroller.toElement(this.$$contents[a]);
            $$(this.$$navigators).removeClass("current");
            $$(this.$$navigators[a]).addClass("current");
        };
        a = 0;
        for (c = this.$$navigators.length; a < c; a += 1) this.$$navigators[a].addEvent("click", b.bind(this, a));
    },
    _enableAddToCart: function() {
        this.$addToCart.addEvent("click", function() {
            var a, c, b = this.$orderQty.get(this.options.attrs.skuNo), e = "", d = this.$orderQty.get("value").toInt(), d = this.cart.hasItem(b) ? d + this.cart.getItem(b).getQuantity() : d;
            try {
                a = FC.Product.factory(b).findVariant(b), c = a.toCartItem(d);
            } catch (h) {
                return;
            }
            FC.isMobileRequest() && "JpCart" === this.cart.getName() && (e = "\n\n註：日本直送商品僅提供「信用卡」付款方式，請前往桌面版網站結帳。");
            if (this.cart.hasItem(b)) try {
                this.cart.updateItem(b, c), alert([ "商品已存在購物車，", c.getQuantity() < d ? "已調整購買數為最大可供貨數" : "已附加購買數為總數", " (", c.getQuantity(), ")", e ].join(""));
            } catch (f) {
                if ("ExceedCookieLengthError" === f.name) alert("已超過購物車可存放商品上限，無法加入購物車。"); else throw f;
            } else if (0 < c.getQuantity()) try {
                this.cart.addItem(c), alert("商品已加入購物車" + e);
            } catch (g) {
                if ("ExceedCookieLengthError" === g.name) alert("已超過購物車可存放商品上限，無法加入購物車。"); else throw g;
            }
        }.bind(this));
        this.$orderQty.addEvent("change", function() {
            var a = this.$orderQty.get(this.options.attrs.skuNo), c = this.$orderQty.get("value"), b = FC.Product.factory(a);
            this.$addToCart.set("disabled", !(!isNaN(c) && 0 < c && a.length && b && b.findVariant(a)));
        }.bind(this));
    }
});

FC.Presenters.ProductSpec = new Class({
    Implements: [ Events, Chain, Options ],
    options: {
        attrs: {
            skuNo: "data-sku-no",
            jsonData: "data-product",
            kinsCss: "data-kins-selector",
            imageCss: "data-image-selector"
        },
        selectors: {
            colorSwatches: ".color-swatches a",
            sizeBoxes: ".size-boxes a",
            sizeSelections: ".size-select-box",
            inventory: ".inventory select",
            addToCartBtn: ".inventory button",
            unitPrice: ".unit-price input",
            totalPrice: ".total-price input",
            markedPriceDiffTo: ".price .for-price-diff"
        }
    },
    initialize: function(a, d, c, e, b) {
        this.setOptions(b);
        this.$element = $(a);
        this.product = FC.Product.factory(JSON.decode(this.$element.get(this.options.attrs.jsonData)));
        this.$element.removeProperty(this.options.attrs.jsonData);
        this.currency = this.$element.get("data-currency");
        this.$$colorSwatches = this.$element.getElements(this.options.selectors.colorSwatches);
        this.$$sizeBoxes = this.$element.getElements(this.options.selectors.sizeBoxes);
        this.$$sizeSelections = this.$element.getElements(this.options.selectors.sizeSelections);
        this.$inventory = this.$element.getElement(this.options.selectors.inventory);
        this.$addToCartBtn = this.$element.getElement(this.options.selectors.addToCartBtn);
        this.$unitPrice = this.$element.getElement(this.options.selectors.unitPrice);
        this.$totalPrice = this.$element.getElement(this.options.selectors.totalPrice);
        this.$markedPriceDiffTo = document.getElement(this.options.selectors.markedPriceDiffTo);
        this._chainInventoryLoad();
        this._chainRepSkuDisplay();
        this.$unitPrice && this.$totalPrice && this._chainTotalUpdate();
        this.$$presets = this.$element.getElements(this.options.selectors.colorSwatches + "[rev=" + d + "]");
        this.$$presets = this.$$presets.concat(1 === this.$$sizeBoxes.length ? this.$$sizeBoxes : this.$element.getElements(this.options.selectors.sizeBoxes + "[rev=" + c + "]"));
        this.$$presets = this.$$presets.length ? this.$$presets : $$(this.$$colorSwatches.clone().shift());
        this.$$presets.fireEvent("click");
        isFinite(Number(e)) && (this.$inventory.set("value", e), this.$inventory.fireEvent("change"));
    },
    _chainInventoryLoad: function() {
        this.$$colorSwatches.each(function(a) {
            a.addEvent("click", function(a) {
                var c = !0;
                if (a.hasClass("current")) return !1;
                this.color = a.get("rev");
                this.size = null;
                this.$inventory.empty().grab(new Element("option[value=--][text=--]"));
                this.$inventory.set(this.options.attrs.skuNo, "").fireEvent("change");
                $$(this.$$colorSwatches, this.$$sizeBoxes).removeClass("current");
                a.addClass("current");
                this.$$sizeBoxes.each(function(a) {
                    var b = this.product.findVariant({
                        Color: this.color,
                        Size: a.get("rev")
                    });
                    b && 0 < b.salesQty ? (a.set("href", "#"), a.removeClass("empty"), c = !1) : (a.set("href", null),
                    a.addClass("empty"));
                    this.$$sizeSelections.each(function(b) {
                        b.set("value", "").getElements("option[value=" + a.get("rev") + "]").each(function(b) {
                            b.set("disabled", a.hasClass("empty"));
                        });
                    });
                }, this);
                1 === this.$$sizeBoxes.length ? this.$$sizeBoxes.fireEvent("click") : (a = this.product.findVariant({
                    Color: this.color,
                    Size: this.$$sizeBoxes[0].get("rev")
                })) && this._chainPriceDiffDisplay(a);
                this.$addToCartBtn && (c ? this.$addToCartBtn.removeClass("add-to-cart").addClass("sold-out") : this.$addToCartBtn.removeClass("sold-out").addClass("add-to-cart"));
                return !1;
            }.bind(this, a));
        }.bind(this));
        this.$$sizeBoxes.each(function(a) {
            a.addEvent("click", function(a) {
                var c, e, b;
                this.color = this.color || this.$$colorSwatches.filter(".current").pop() ? this.$$colorSwatches.filter(".current").pop().get("rev") : null;
                if (a.hasClass("empty") || a.hasClass("current") || null === this.color) return !1;
                this.size = a.get("rev");
                if (b = this.product.findVariant({
                    Color: this.color,
                    Size: this.size
                })) {
                    this.$inventory.empty();
                    c = b.getSalesQtyLimit() ? 1 : 0;
                    for (e = b.getSalesQtyLimit(); c <= e; c += 1) this.$inventory.grab(new Element("option[value=#{i}][text=#{i}]".replace(/#\{i\}/g, c)));
                    this.$inventory.set(this.options.attrs.skuNo, b.skuNo).fireEvent("change");
                    this._chainPriceDiffDisplay(b);
                }
                this.$$sizeBoxes.removeClass("current");
                a.addClass("current");
                this.$$sizeSelections.each(function(b) {
                    b.set("value", a.get("rev"));
                });
                return !1;
            }.bind(this, a));
        }.bind(this));
        this.$$sizeSelections.each(function(a) {
            a.addEvent("change", function() {
                var d = this.$$sizeBoxes.filter("[rev=" + a.get("value") + "]:not(.empty)").pop();
                d ? d.fireEvent("click") : (0 < a.selectedIndex && alert("這個尺寸已無庫存"), this.$$sizeBoxes.removeClass("current"),
                this.$inventory.empty().grab(new Element("option[value=--][text=--]")), this.$inventory.set(this.options.attrs.skuNo, "").fireEvent("change"));
            }.bind(this));
        }.bind(this));
    },
    _chainRepSkuDisplay: function() {
        var a, d, c;
        c = function(a) {
            var b;
            $$(a.get(this.options.attrs.kinsCss)).erase(a).each(function(a) {
                var b = a.getParent();
                b.set("tween", {
                    duration: 400
                });
                b.get("tween").chain(function(a) {
                    a.getSiblings().hide();
                    a.show();
                    b.get("tween").clearChain();
                    b.fade("in");
                }.bind(a, a));
                a.getParent().fade("out");
            });
            (b = this.$element.getElement(a.get(this.options.attrs.imageCss))) && "img" === b.get("tag") && b.set("src", a.get("rel"));
        };
        a = 0;
        for (d = this.$$colorSwatches.length; a < d; a += 1) this.$$colorSwatches[a].addEvent("click", c.bind(this, this.$$colorSwatches[a]));
    },
    _chainPriceDiffDisplay: function(a) {
        this.$markedPriceDiffTo && this.$markedPriceDiffTo.set("text", a.markedPrice);
        this.$unitPrice && this.$unitPrice.set("value", this.currency + a.markedPrice);
    },
    _chainTotalUpdate: function() {
        this.$inventory.addEvent("change", function() {
            var a = this.$inventory.get("value"), a = isNaN(a) ? "--" : (a.toInt() * this.$unitPrice.get("value").toInt()).toPrice();
            this.$totalPrice.set("value", this.currency + a);
        }.bind(this));
    }
});

FC.Presenters.QuickView = new Class({
    Implements: [ Events, Chain, Options ],
    options: {
        selectors: {
            modalBox: "div#QuickViewBox",
            hint: "a#QuickViewHint"
        }
    },
    initialize: function(a, b) {
        this.setOptions(b);
        this.$$links = $$(a);
        this.$box = document.getElement(this.options.selectors.modalBox) || new Element(this.options.selectors.modalBox).inject($(document.body), "bottom");
        this.$hint = document.getElement(this.options.selectors.hint) || new Element(this.options.selectors.hint).inject($(document.body), "bottom").hide();
        this.modalBox = this.$box.retrieve("modalbox") || new ModalBox(this.$box);
        this._enableHintForLinks();
        this._enableModalBoxForHint();
    },
    _enableModalBoxForHint: function() {
        Browser.ie6 || this.modalBox.addEvent("load", function() {
            "undefined" !== typeof window.FB && window.FB.XFBML.parse(this.$box);
        }.bind(this));
        this.$hint.removeEvents("click").addEvent("click", function() {
            0 < location.hash.length && (location.hash = "---");
            this.modalBox.hide();
            this.modalBox.load(this.$hint.getParent().get("href"));
            return !1;
        }.bind(this));
    },
    _enableHintForLinks: function() {
        this.$$links.each(function(a) {
            a.retrieve("quick-view") || (a.store("quick-view", this), a.addEvent("mouseenter", function(a) {
                this.$hint.inject(a, "bottom");
                this.$hint.position({
                    relativeTo: a,
                    edge: "topLeft",
                    position: "topLeft"
                });
                this.$hint.show();
            }.bind(this, a)), a.addEvent("mouseleave", function(a) {
                this.$hint.inject($(document.body, "bottom"));
                this.$hint.hide();
            }.bind(this, a)));
        }, this);
    }
});
