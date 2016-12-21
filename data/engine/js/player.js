// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com

function isTouchDevice() {
    return document.ontouchstart !== undefined;
}

var mediaParams = {
    setVolume:function (e, vol) {
        var el = $(e);

        if (Object.isElement(el) && el.tagName.toLowerCase() == "div") {
            return;
        }

        if (!el || Object.isUndefined(vol) || (!Object.isFunction(el.setVolume) && play.flashAudio)) {
            console.log('object element not ready (volume)');
            setTimeout(function () {
                mediaParams.setVolume(e, vol);
            }.bind(this), 500);
            return;
        }
        /* systemVolume koeff */
        vol = vol * play.globalVolume;

        (play.flashAudio) ? el.setVolume(vol) : el.volume = vol;
    },

    setLoop:function (e, val) {
        var el = $(e);

        if (!el || Object.isUndefined(val) || (!Object.isFunction(el.setLoop) && play.flashAudio)) {
            console.log('object element not ready (loop)');
            setTimeout(function () {
                mediaParams.setLoop(e, val);
            }.bind(this), 500);

            return;
        }

        val = (val == 1);

        (play.flashAudio) ? el.setLoop(val) : el.loop = val;
    },

    setStartTime:function (el, time) {
    },

    setEndTime:function (el, time) {
    }
};

/**Custom ScrollBar
 * Allows to add styled scroll bars
 * to block elevent.
 * Mousewheel support and compatibility
 * with all text actions.
 */

var scrollBar = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                block:$('ScrollDiv'),
                content:$('ContentDiv'),
                suffixId:'qwerty'/*,
                 contentHeight: 0*/
            };

            Object.extend(this.options, options || {});
            //fix for hidden objects dimentions rendering
            var tempDisp = $(this.options.block).style.display;
            $(this.options.block).style.visibility = 'hidden';
            $(this.options.block).style.display = 'block';

            var block = $(this.options.block)
                , cont = $(this.options.content);

            /**Detecting Content height*/
            if (cont.childNodes.length > 0 && !Object.isUndefined(cont.firstDescendant()) && cont.firstDescendant().tagName.toLowerCase() == "img") {
                this.options.fullContentHeight = cont.firstDescendant().getHeight();
            } else {
                var tmpEl = new Element("div", {style:"visibility:hidden;"});

                $A(cont.childNodes).each(function (el) {
                    tmpEl.insert(el);
                }.bind(this));

                $('contPane').insert(tmpEl);
                this.options.fullContentHeight = tmpEl.getHeight();

                $A(tmpEl.childNodes).each(function (el) {
                    cont.insert(el);
                }.bind(this));

                $('contPane').removeChild(tmpEl);

                cont.style.height = this.options.fullContentHeight + "px";
            }
            /**EOF*/
            this.options.fullBlockHeight = block.getHeight();
            contHeight = this.options.fullContentHeight - this.options.fullBlockHeight;
            this.options.contentHeight = contHeight;
            this.options.content = cont;
            cont.relativize();
            cont.style.zIndex = "auto";

            $(this.options.block).style.display = tempDisp;
            $(this.options.block).style.visibility = 'visible';

            if (contHeight < 10) {
                $('handle' + this.options.suffixId).style.display = 'none';
                $('scrollHolder' + this.options.suffixId).hide();
                $('track' + this.options.suffixId).style.height = parseInt($('track' + this.options.suffixId).style.height.replace(/px$/, "")) + 30 + 'px';

                return;
                //$('track'+this.options.suffixId).parentNode.hide();	
                /*$('scrollHolder'+this.options.suffixId).hide();
                 $('handle'+this.options.suffixId).style.display = 'none';
                 $('track'+this.options.suffixId).hide();*/
                //cont.style.width = parseInt(cont.style.width.replace(/px$/,"")) + 15 + 'px';
            }

            this.wrap(cont, this.options.contentHeight, this);
        } catch (err) {
            alert('scrollBar: initialize error:' + console.log(err));
        }
    },

    wrap:function (el, contentHeight, scroller) {
        try {
            var makeScroll = new Control.Slider($('handle' + this.options.suffixId), $('track' + this.options.suffixId), {
                axis:'vertical',
                range:$R(0, contentHeight),
                //values:$R(0,contentHeight),
                onSlide:function (val, event) {
                    //event.stop();
                    var cont = scroller.options.content
                        , newTop = parseInt(val);
                    cont.setStyle({top:-newTop + 'px'});


                },
                onChange:function (val, event) {
                    //event.stop();
                    var cont = scroller.options.content
                        , newTop = parseInt(val);
                    cont.setStyle({top:-newTop + 'px'});
                }
            });

            this.makeScroll = makeScroll;

            $(this.options.block).observe('DOMMouseScroll', this.mouseWheel.bindAsEventListener(this, makeScroll));
            $(this.options.block).observe('mousewheel', this.mouseWheel.bindAsEventListener(this, makeScroll));

            /**Up Arrow*/
            $('scrollHolder' + this.options.suffixId).firstDescendant().observe('mousedown', function (event) {
                Event.stop(event);
                this.clearIntervals();
                this.scrollUpInterval = setInterval(function () {
                    makeScroll.setValueBy(-4);
                }.bind(this), 33);
            }.bind(this));

            $('scrollHolder' + this.options.suffixId).firstDescendant().observe('mouseup', function (event) {
                //alert('hi');
                Event.stop(event);
                this.clearIntervals();
            }.bind(this));

            /**Down Arrow*/
            $('scrollHolder' + this.options.suffixId).firstDescendant().next().observe('mousedown', function (event) {
                Event.stop(event);
                this.clearIntervals();
                this.scrollDownInterval = setInterval(function () {
                    makeScroll.setValueBy(4);
                }.bind(this), 33);
            }.bind(this));

            $('scrollHolder' + this.options.suffixId).firstDescendant().next().observe('mouseup', function (event) {
                Event.stop(event);
                this.clearIntervals();
            }.bind(this));

            $(this.options.block).observe('click', function (event) {
                Event.stop(event);
            });
        } catch (err) {
            alert('error in scrollBar wrap:' + console.log(err));
        }
    },

    clearIntervals:function () {
        clearInterval(this.scrollUpInterval);
        clearInterval(this.scrollDownInterval);
    },

    mouseWheel:function (event, scroll) {
        var move = 0;

        if (!event) {
            event = window.event;
        }

        if (event.wheelDelta) {
            move = event.wheelDelta / 120;
        } else if (event.detail) {
            move = -event.detail / 3;
        }

        move = Math.round(move);

        if (move) {
            scroll.setValueBy(-move);
        }

        Event.stop(event);
    },

    scroll:function (direction, delta) {
        this.makeScroll.setValue(delta);
    },

    scrollBy:function (direction, delta) {
        if (delta == 1) {
            delta = 1.5;
        }

        this.makeScroll.setValueBy(delta);
    },

    scroller:function (direction, delta) {
        var d = parseFloat(delta)
            , currentTop = +$(this.options.content).style.top.substr(0, $(this.options.content).style.top.length - 2);

        if (this.options.fullContentHeight > ((-currentTop) + this.options.fullBlockHeight)) {
            $(this.options.content).style.top = (currentTop - d) + 'px';
        }
    }
});

/**TODO:
 * x-global objects preloader, disabling events for preload delay
 * x-move prototype and script.aculo.us to lib folder
 * x-templates-based common strings
 * x-We need to add DOM id for each element in collection
 * x-stack for card object effects,
 * -internal action priority
 * x-load,
 * x-unload card actions,
 * x-fix goto from panel,
 * x-add sound support,
 * -add effects:
 *         x-no transition
 *         x-fade
 *         x-push up
 *         x-push Left
 *         x-push right
 *         x-push down
 *         x-slide down
 *         x-slide left
 *         x-slide remove down
 *         x-slide remove left
 *         x-slide remove right
 *         x-slide remove up
 *         x-slide up
 *         x-slide right
 *         x-zoom
 *         x-swirl
 *         x-iris rectangle;
 *         x-iris circle
 *         x-barnDoor
 *         x-barnClose
 *         x-wipe up
 *         x-wipe down
 *         x-wipe left
 *         x-wipe right
 * *x-add    video support,
 * x-add text support with custom scroller,
 * *x-add buttons support
 * x-ghost writer
 * x-show/hide object
 * x-open a web page
 * x-print card
 * x-automatic timer
 * x-scrollCard
 * -refactor code
 * */
var appState = Class.create({
    itemAnimationCycles:0
});

/**Helper object
 * Contains some helpful
 * functions.
 */
var helper = function(){
    return { getCountTypeActions:function (actions, type) {
        var i = 0;

        actions.each(function (action) {
            if (action.priority == type) {
                i++;
            }
        }.bind(this));

        return i;
    },

        isGoToActionPresent:function (actions) {
            var res = false;

            actions.each(function (action) {
                if (!Object.isUndefined(action.effect)) {
                    res = true;
                }
            }.bind(this));

            return res;
        },

        isHideShowActionPresent:function (actions) {
            var res = false;

            actions.each(function (action) {
                if (action.type == "HSHideShowAction") {
                    res = true;
                }
            }.bind(this));

            return res;
        },

        getCardObjectById:function (id) {
            var currentCard = cardsCollection.currentElement()
                , cardObject = currentCard.objects.find(function (obj) {
                    return id == obj.id;
                }, this);

            return cardObject;
        },

        getObjectByCardId:function (cardId) {
            var id = cardId.slice(-36)
                , currentCard = cardsCollection.currentElement()
                , cardObject = currentCard.objects.find(function (obj) {
                    return id == obj.id;
                }, this);
            return cardObject;
        },

        getCountObjectActions:function (actions) {
            return actions.length;
        },

        checkForGroupObjectData:function (newCard, play, j) {
            return (!Object.isUndefined(newCard.objects[j].isGroupObject) && !Object.isUndefined(play.groupObjectsData) && !Object.isUndefined(play.groupObjectsData[newCard.objects[j].id]));
        },

        checkForDraggableObjectData:function (id, play) {
            return (!Object.isUndefined(play.draggableObjectsData) && !Object.isUndefined(play.draggableObjectsData[id]));
        },

        checkForTextObjectData:function (newCard, play, j) {
            var id = play.template.newCardElementId(cardsCollection.currentElement().id, newCard.objects[j].id);

            return (!Object.isUndefined(play.textObjectsData) && !Object.isUndefined(play.textObjectsData[id]));
        },

        getDraggableObjectStyle:function (newCard, play, j) {
            var objStyle = play.draggableObjectsData[newCard.objects[j].id];
            var style = "top:" + objStyle.top + ";" +
                "left:" + objStyle.left + ";" +
                "height:" + objStyle.height + ";" +
                "width:" + objStyle.width + ";" +
                "z-index:" + objStyle.zIndex + ";";

            return style;
        },

        getTextObjectData:function (newCard, play, j) {
            var id = play.template.newCardElementId(cardsCollection.currentElement().id, newCard.objects[j].id)
                , text = play.textObjectsData[id];

            return text;
        },
        getElementsFromPoint:function (e) {
            if (isTouchDevice()) {
                var x = e.changedTouches[0].clientX
                    , y = e.changedTouches[0].clientY;
            } else {
                var x = e.clientX
                    , y = e.clientY;
            }
            var objects = cardsCollection.currentElement().objects;
            return objects.map(function (element) {
                return $(play.template.newCardElementId(cardsCollection.currentElement().id, element.id));
            }).select(function (element) {
                    var rect = element.getBoundingClientRect();
                    return (x >= rect.left && x <= rect.left + rect.width) && (y >= rect.top && y <= rect.top + rect.height);
                });
        },
        getElementsFromPointWithSnapping:function (e) {

            if (isTouchDevice()) {
                var x = e.changedTouches[0].clientX
                    , y = e.changedTouches[0].clientY;
            } else {
                var x = e.clientX
                    , y = e.clientY;
            }
            var container = $(play.template.cardId(cardsCollection.currentElement().id));
            var objects = cardsCollection.currentElement().objects;
            return objects.map(function (element) {
                var domElement = $(play.template.newCardElementId(cardsCollection.currentElement().id, element.id));
                if (element.hasOwnProperty("snapping")) {
                    var elementWithSnapping = $(play.template.newCardElementId(cardsCollection.currentElement().id, element.snapping.target));
                    elementWithSnapping.setAttribute("data-snapping", element.snapping.delta);
                }
                return domElement;
            }).select(function (element) {
                    var rect = element.getBoundingClientRect(),
                        snapping;
                    /** from IE or old browsers */
                    if(!element.hasOwnProperty("dataset")){
                        snapping = element.hasOwnProperty("data-snapping") ? parseInt(element.getAttribute("data-snapping"), 10) : 0;
                    } else {
                        snapping = element.dataset.hasOwnProperty("snapping") ? parseInt(element.dataset.snapping, 10) : 0;
                    }

                    return (x >= rect.left - snapping && x <= rect.right + snapping) && (y >= rect.top - snapping && y <= rect.bottom + snapping);
                });
        },
        checkIfShapeClicked:function (element, e) {
            var canVas = element
                , ctx = canVas.getContext('2d')
                , x
                , y;

            if(!Object.isUndefined(e.touches) && !Object.isUndefined(e.touches[0])){
                x = e.touches[0].pageX;
                y = e.touches[0].pageY;
            } else {
                x = e.pointerX();
                y = e.pointerY();
            }

            if (!x || !y) {
                return false;
            }

            var diffX = 0;

            if ($('scrollThumbs')) {
                if ($('scrollThumbs').style.display == 'block') {
                    diffX = $('scrollThumbs').getWidth();
                }
            }

            var offset = canVas.cumulativeOffset();

            x -= parseInt(offset.left);
            y -= parseInt(offset.top);

            try {
                var imgData = ctx.getImageData(x, y, 1, 1).data;
            } catch (err) {
                // if(!Object.isUndefined(this.ask)) return;
                try {
                    netscape.security.PrivilegeManager.enablePrivilege("UniversalBrowserRead");

                    this.ask = 1;
                    // return;
                    var imgData = ctx.getImageData(x, y, 1, 1).data;
                } catch (e) {
                }
            }
            if (typeof(imgData) != 'undefined' && imgData[0] == 0 && imgData[1] == 0 && imgData[2] == 0 && imgData[3] == 0) {
                return false;
            } else {
                return true;
            }
        },

        rotateElement:function (element, rotationAngle) {
            if (rotationAngle != 0) {
                element.setStyle("-webkit-transform:rotate(" + rotationAngle + "deg);" +
                    "-moz-transform:rotate(" + rotationAngle + "deg);" +
                    "-ms-transform:rotate(" + rotationAngle + "deg);" +
                    "-o-transform:rotate(" + rotationAngle + "deg);");
            }
        },

        getKeyCode:function (key) {
            switch (key) {
                case "left":
                    return 37;
                    break;
                case "up":
                    return 38;
                    break;
                case "right":
                    return 39;
                    break;
                case "down":
                    return 40;
                    break;
                case "0":
                    return 48;
                    break;
                case "1":
                    return 49;
                    break;
                case "2":
                    return 50;
                    break;
                case "3":
                    return 51;
                    break;
                case "4":
                    return 52;
                    break;
                case "5":
                    return 53;
                    break;
                case "6":
                    return 54;
                    break;
                case "7":
                    return 55;
                    break;
                case "8":
                    return 56;
                    break;
                case "9":
                    return 57;
                    break;
                case "a":
                    return 65;
                    break;
                case "b":
                    return 66;
                    break;
                case "c":
                    return 67;
                    break;
                case "d":
                    return 68;
                    break;
                case "e":
                    return 69;
                    break;
                case "f":
                    return 70;
                    break;
                case "g":
                    return 71;
                    break;
                case "h":
                    return 72;
                    break;
                case "i":
                    return 73;
                    break;
                case "j":
                    return 74;
                    break;
                case "k":
                    return 75;
                    break;
                case "l":
                    return 76;
                    break;
                case "m":
                    return 77;
                    break;
                case "n":
                    return 78;
                    break;
                case "o":
                    return 79;
                    break;
                case "p":
                    return 80;
                    break;
                case "q":
                    return 81;
                    break;
                case "r":
                    return 82;
                    break;
                case "s":
                    return 83;
                    break;
                case "t":
                    return 84;
                    break;
                case "u":
                    return 85;
                    break;
                case "v":
                    return 86;
                    break;
                case "w":
                    return 87;
                    break;
                case "x":
                    return 88;
                    break;
                case "y":
                    return 89;
                    break;
                case "z":
                    return 90;
                    break;
                /*f-keys*/
                case "f1":
                    return  112;
                    break;
                case "f2":
                    return  113;
                    break;
                case "f3":
                    return  114;
                    break;
                case "f4":
                    return  115;
                    break;
                case "f5":
                    return  116;
                    break;
                case "f6":
                    return  117;
                    break;
                case "f7":
                    return  118;
                    break;
                case "f8 ":
                    return     119;
                    break;
                case "f9":
                    return  120;
                    break;
                case "f10":
                    return  121;
                    break;
                case "f11":
                    return  122;
                    break;
                case "f12":
                    return  123;
                    break;
                /*others*/
                case "enter":
                    return 13;
                    break;
                case "escape":
                    return 27;
                    break;
                case "space":
                    return 32;
                    break;
                case "del":
                    return 8;
                    break;
            }
        },
        /** FIX textPane fornts for Mac 10.6.8 Safari */
        normalizeFonts:function (textPane) {
            /** TODO cache normalizer object */
            var normalizer = $H({
                'Helvetica':[1.22, null],
                'Lucida Grande':[1.23, null],
                'Euphemia UCAS':[null, -1],
                'Krungthep':[null, -1],
                'Plantagenet Cherokee':[null, -1],
                'Sathu':[null, -1],
                'Thonburi':[null, -1],
                'Helvetica CY':[null, -2],
                'Geneva':[null, -2],
                'Monaco':[null, -2],
                'Apple Symbols':[null, -2],
                'Geneva CY':[null, -2],
                'Charcoal CY':[null, -2],
                'Osaka':[null, /*-3*/ null, -0.07],
                /** most problematic fonts */
                'Courier':[1.22, 1],
                'Hoefler Text':[1.22, /*5*/ null, 0.114],
                'Silom':[1.54, /*6*/ null, 0.136],
                'Skia':[1.22, /*5*/ null, 0.114],
                'Times':[1.22, 1],
                'Times New Roman':[1.23, 0],
                /** Hiragino top margin problem */
                /** negative margin 25% of font size */
                'Hiragino Kaku Gothic Pro':[null, null, -0.25],
                'Hiragino Kaku Gothic ProN':[null, null, -0.25],
                'Hiragino Kaku Gothic Std':[null, null, -0.25],
                'Hiragino Kaku Gothic StdN':[null, null, -0.25],
                'Hiragino Maru Gothic Pro':[null, null, -0.25],
                'Hiragino Maru Gothic ProN':[null, null, -0.25],
                'Hiragino Mincho Pro':[null, null, -0.25],
                'Hiragino Mincho ProN':[null, null, -0.25],
                'Hiragino Sans GB':[null, null, -0.25],
                /** BE parsing problem */
                'Apple LiSung Light':'Apple LiSung',
                'LiSong Pro Light':'LiSong Pro',
                'Heiti SC Light':'Heiti SC',
                'Heiti TC Light':'Heiti TC',
                'STHeiti Light':'STHeiti'
            });

            var specFonts = normalizer.keys();

            /** can't get font-size, so parse font string */
            $(textPane).childElements().each(function (el) {
                var font = el.getStyle('font');

                specFonts.each(function (fontName) {
                    if (!font.endsWith(fontName) && !font.endsWith("'" + fontName + "'")) {
                        return;
                    }

                    var params = normalizer.get(fontName);
                    //fix for IPAD
                    if (isTouchDevice()) {
                        params[0] -= 0.01;
                    }

                    /* replace original font */
                    if (Object.isString(params)) {
                        el.setStyle('font:' + font.replace(fontName, params) + ';');

                        return;
                    }

                    /* set line height */
                    if (!Object.isUndefined(params[0]) && null != params[0]) {
                        el.setStyle('line-height:' + params[0] + ';');
                    }

                    if (!Object.isUndefined(params[1]) && null != params[1]) {
                        el.setStyle('position:relative;top:' + params[1] + 'px;');
                    }

                    /** margin depends on font size */
                    if (!Object.isUndefined(params[2]) && null != params[2]) {
                        var fontSize = font.match(/(\d+)/);

                        if (Object.isUndefined(fontSize[0]) || parseInt(fontSize[0], 10) < 1) {
                            return;
                        }

                        el.setStyle('position:relative;top:' + (parseInt(fontSize[0], 10) * params[2]).round() + 'px;');
                    }
                });
            });
        },

        fixEditableText:function (el) {
            el.observe("keyup", function (e) {
                try {
                    if (Prototype.Browser.WebKit && (!el.lastChild || el.lastChild.nodeName.toLowerCase() != "br")) {
                        el.appendChild(document.createElement("br"));
                    }
                    /*var sanitazed = el.innerHTML.replace(/<div[^<]*?>/g, '').replace(/<\/div[^<]*?>/g, '<br>');
                     el.update(sanitazed);*/
                } catch (err) {
                    console.log(err);
                }
            }.bind(this));

            el.observe("keypress", function (e) {
                /*	if(Object.isUndefined(el.isFixed)||!el.isFixed){
                 var selection = window.getSelection();
                 var range = selection.getRangeAt(0);
                 var empty = document.createTextNode(" ");
                 range.deleteContents();
                 range.insertNode(empty);
                 range.setStartBefore(empty);
                 range.setEndBefore(empty);
                 range.collapse(false);
                 selection.removeAllRanges();
                 selection.addRange(range);
                 el.isFixed=true;
                 }*/
                var charCode = (e.which) ? e.which : e.keyCode;

                if (charCode == 13) {
                    if (window.getSelection && !Prototype.Browser.Gecko) {
                        e.preventDefault();
                        var selection = window.getSelection();
                        var range = selection.getRangeAt(0);
                        var br = document.createElement("br");
                        range.deleteContents();
                        range.insertNode(br);
                        /**Fixing caret position after br bug on webkit*/
                        selection.removeAllRanges();
                        selection.addRange(range);
                        var empty = document.createTextNode("\n");
                        range.insertNode(empty);
                        range.setStartAfter(empty);
                        range.setEndAfter(empty);
                        /**EOF*/
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);

                        return false;
                    }
                }
            });
        },

        stopAllMovies:function () {
            $$("video").each(function (el) {
                el.pause();
                try {
                    el.currentTime = "0.01";
                } catch (e) {
                }

            });
        },

        stopAllSounds:function () {
            $$("audio").each(function (el) {
                el.pause();
                try {
                    el.currentTime = "0.01";
                } catch (e) {
                }
            });
        },

        setCardVolume:function () {
            $$("video, audio").each(function (el) {
                /* TODO think about caching start velumes for each element */
                mediaParams.setVolume(el.identify(), 1);
            });
        },


        observeAfterCardLoaded:function (cardId, object, event, callback, namespace) {
            if (Object.isUndefined(namespace)) {
                namespace = this;
            }

            document.observe('Card' + cardId + ':loaded', function (e) {
                setTimeout(function () {
                    if (!Object.isElement($(object)))return;
                    $(object).observe(event, callback);
                }.bind(namespace), 300);
            }.bind(namespace));
        },

        getBoxShadowStyle:function (shadow, rotation) {
            var rotation = parseInt(rotation || 0, 10),
                style = '',
                shadowString = [],
                browserStyleNames = ["-webkit-box-shadow", "-moz-box-shadow", "-ms-box-shadow", "-o-box-shadow", "box-shadow"];

            if (Object.isUndefined(shadow) || null == shadow) {
                return style;
            }

            var rotationToRad = rotation * Math.PI / 180;

            if (!shadow.shadowDistance && !shadow.shadowAngle) {
                shadow.shadowDistance = Math.sqrt(shadow.xOffset * shadow.xOffset + shadow.yOffset * shadow.yOffset);
                if (shadow.xOffset > 0 && shadow.yOffset == 0) {
                    shadow.shadowAngle = 0;
                } else if (shadow.xOffset == 0 && shadow.yOffset > 0) {
                    shadow.shadowAngle = Math.PI / 2;
                } else if (shadow.xOffset < 0 && shadow.yOffset == 0) {
                    shadow.shadowAngle = Math.PI;
                } else if (shadow.xOffset == 0 && shadow.yOffset < 0) {
                    shadow.shadowAngle = 3 * Math.PI / 2;
                } else {
                    shadow.shadowAngle = Math.atan(Math.abs(shadow.xOffset) / Math.abs(shadow.yOffset));
                    if (shadow.xOffset > 0 && shadow.yOffset > 0) {
                    } else if (shadow.xOffset < 0 && shadow.yOffset > 0) {
                        shadow.shadowAngle += Math.PI / 2;
                    } else if (shadow.xOffset < 0 && shadow.yOffset < 0) {
                        shadow.shadowAngle += Math.PI;
                    } else if (shadow.xOffset > 0 && shadow.yOffset < 0) {
                        shadow.shadowAngle += 3 * Math.PI / 2;
                    }
                }
            }

            shadowString.push((parseInt(shadow.shadowDistance, 10) * Math.cos(+shadow.shadowAngle - rotationToRad)).floor() + "px");
            shadowString.push((parseInt(shadow.shadowDistance, 10) * Math.sin(+shadow.shadowAngle - rotationToRad)).floor() + "px");
            shadowString.push(parseInt(shadow.blur, 10) + "px");
            shadowString.push("rgba(0,0,0, " + (shadow.shadowOpacity ? shadow.shadowOpacity : "1") + ")");
            shadowString = shadowString.join(" ");

            /** create style string */
            style = browserStyleNames.reduce(function (prev, current, iteration) {
                /** add value to first argument on first iteration */
                if (1 == iteration) {
                    prev = prev + ":" + shadowString + ";";
                }

                return prev + current + ":" + shadowString + ";";
            });

            return style;
        },

        getScrollBoxSize:function (size, drawFrame, isReadOnly) {
            if (drawFrame === "1") {
                return (size > 2) ? size - 2 : size;
            } else {
                if (isReadOnly === "1") {
                    return (size > 6) ? size - 6 : size;//instead of padding fixbug 1000
                }
            }
            return size;
        },

        getZIndexValue:function (order, offset) {
            var offset = offset || 0,
                val = (order || 0) * 10 + offset;

            /** Mac send max int value as flag that z-index is not set */
            /** TODO maybe need to implement for other elements */
            return (2147483647 == order) ? (9999 - offset) : (parseInt(val, 10) + 10);
        },

        getAnimationZIndex:function (direction, item) {
            var zindex = "auto";

            /** TODO won't work for first element with zIndex = 1, need proper layering scheme */
            if (direction == 0) {
                if (item.goingAbsoluteLayer == "1") {
                    zindex = 9999;
                } else if (item.goingAbsoluteLayer == "0") {
                    zindex = 1;
                } else if (item.goingAbsoluteLayer == "2") {
                    var creatorZIndex = parseInt($(item.creator).style.zIndex);

                    zindex = creatorZIndex + 1;
                }
            } else if (direction == 1) {
                if (item.returningAbsoluteLayer == "1") {
                    zindex = 9999;
                } else if (item.returningAbsoluteLayer == "0") {
                    zindex = 1;
                } else if (item.returningAbsoluteLayer == "2") {
                    var creatorZIndex = parseInt($(item.creator).style.zIndex);

                    zindex = creatorZIndex + 1;
                }
            }

            switch (item.layer) {
                case "0":
                    zindex--;
                    break;
                case "1":
                    zindex--;
                    break;
                case "2":
                    zindex++;
                    break;
            }

            return zindex;
        },

        setCardObjectVisibilityFlag:function (objectID, mode) {
            var modes = {
                    "show":"1",
                    "hide":"0",
                    "toggle":""
                },
                foundObject;

            /* call undefined mode? */
            if (Object.isUndefined(modes[mode])) {
                return;
            }

            var modeValue = modes[mode];

            /* no cardsCollection? */
            if (!(cardsCollection && cardsCollection.els && cardsCollection.els.length)) {
                return;
            }

            cardsCollection.els.each(function (card) {
                /* no objects inside card, continue */
                if (!card.objects || !card.objects.length) {
                    return;
                }

                foundObject = card.objects.find(function (obj) {
                    return obj.id == objectID;
                });

                /* no object on this card, check next card */
                if (Object.isUndefined(foundObject)) {
                    return;
                }

                /** TODO check foundObject is an array(not possible for now, but...) */
                if ("toggle" == mode) {
                    /* change modeValue(hide-to-show, show-to-hide)*/
                    modeValue = ( modes["show"] == foundObject.isVisible ) ? modes["hide"] : modes["show"];
                }

                foundObject.isVisible = modeValue;

                throw $break;
            });
        },

        prepareAndPlayMedia:function (obj, type, time) {
            var isFlash = (type == 'audio') ? play.flashAudio : play.flashVideo;
            if (false === obj.showVideo) {
                obj.show();
                obj.showVideo = true;
            }
            if (isFlash) {
                /** For flash */
                setTimeout(function () {
                    this.seekMedia(obj, type, time);
                    this.playMedia(obj, type);
                    obj.fire(obj.id + ":ready");
                }.bind(this), 1500);
            } else if (!isTouchDevice() && !obj.isPng) {
                /** For desktop browsers with html5 audio/video support */
                if ((obj.isactive != "isactive" || !obj.isactive) && obj.readyState < 1) {
                    obj.observe("canplay", function (e) {
                        this.seekMedia(obj, type, time);
                        this.playMedia(obj, type);
                        obj.fire(obj.id + ":ready");
                        obj.stopObserving("canplay");
                        obj.isactive = "isactive";
                    }.bind(this));

                    obj.load();
                    obj.isactive = "isactive";
                } else {
                    this.seekMedia(obj, type, time);
                    this.playMedia(obj, type);

                    obj.fire(obj.id + ":ready");
                }
            } else if (!obj.isPng) {    /** For ipad */
                if (isTouchDevice()) {
                    if (type == "audio") {
                        play.lastActiveSound = obj.id;
                    }
                    try {
                        var fActivate = function () {
                            if (obj.readyState == 3 || obj.readyState == 4) {
                                var fixedTime = +(time).toFixed(1);
                                obj.currentTime = fixedTime;
                                clearInterval(obj.objLoadInterval);
                                obj.play();
                                if (false === obj.showVideo && false === obj.paused) {
                                    obj.show();
                                    obj.showVideo = true;
                                }
                                obj.fire(obj.id + ":ready");
                                return true;
                            }
                            return false;
                        }
                        if( !fActivate() ){ // fixed click X2IBA-2725
                            clearInterval(obj.objLoadInterval);
                            obj.objLoadInterval = setInterval(fActivate, 100);
                        }
                    } catch (err) {
                        console.log(err)
                    }
                } else {
                    var doAfterLoaded = function (e) {
                        obj.isactive = 'isactive';
                        obj.stopObserving('canplaythrough');
                        obj.stopObserving('progress');
                        this.seekMedia(obj, type, time);

                        this.playMedia(obj, type);
                        obj.fire(obj.id + ":ready");
                    }.bind(this);

                    if (this.isTimePositionBuffered(obj, time)) {
                        doAfterLoaded();
                    } else {
                        if (time == 0) {
                            obj.observe('canplaythrough', doAfterLoaded);
                        } else {
                            obj.observe('progress', function () {
                                if (this.isTimePositionBuffered(obj, (time + 1))) {
                                    doAfterLoaded();
                                }
                            }.bind(this));
                        }
                    }
                    var nothingLoaded = (obj.buffered.length == 0 || obj.buffered.start(0) == obj.buffered.end(0));
                    if (obj.readyState == 0 || nothingLoaded) {
                        obj.load();
                    }
                }
            } else {
                this.playMedia(obj, type);
            }
        },

        playMedia:function (obj, type) {
            if (isTouchDevice() && type == 'audio') {
                play.lastActiveSound = obj.id;  // used for stalled/waiting restart
            }
            obj.play();
        },

        seekMedia:function (obj, type, time) {
            var isFlash = (type == 'audio') ? play.flashAudio : play.flashVideo;

            if (Object.isUndefined(time)) {
                time = 0;
            }
            // iPad seems to don't like currenttime = 0
            if (time == 0 && Prototype.Browser.MobileSafari) {
                time = 0.01;
            }

            if (isFlash) {
                obj.seek(time);
            } else {
                obj.currentTime = time;
            }
        },

        isTimePositionBuffered:function (mediaObj, timePos) {
            var buffer = mediaObj.seekable;

            if (timePos == 0) {
                timePos = 0.01;
            }

            for (var i = 0; i < buffer.length; i++) {
                if (timePos > buffer.start(i) && timePos < buffer.end(i)) {
                    return true;
                }
            }

            return false;
        },

        stopMedia:function (obj, fadeOutTime) {
            obj.isFadeOutStarted = true;
            obj.stopObserving('timeupdate');

            if (!fadeOutTime) {
                fadeOutTime = 0;
            }

            if (isTouchDevice()) {
                // mobile safari doesn't support fadeouts
                if (obj.mediaType == "video") {
                    obj.triggerEvent("ended");
                } else {
                    obj.pause();
                }
                obj.isFadeOutStarted = false;

                /*if (fadeOutTime > 0 && !this.options.isWidget) {
                 alert("\"Fade ou sound\" feature isn't supported on mobile devices");
                 }*/
            } else {
                var startingVolume = parseInt(obj.volume, 10)
                    , currentVolume = startingVolume
                    , fadeOutStages = Math.round(fadeOutTime * 10)
                    , volumeDelta = 1;

                if (fadeOutStages > 0) {
                    volumeDelta = startingVolume / fadeOutStages;
                }

                obj.fadeOutInterval = setInterval(function () {
                    if (fadeOutStages > 0 && (currentVolume - volumeDelta) > 0.001 && (!obj.paused || obj.playing)) {
                        currentVolume -= volumeDelta;
                        fadeOutStages--;
                        mediaParams.setVolume(obj, currentVolume);
                    } else if (!obj.paused || obj.playing) {
                        clearInterval(obj.fadeOutInterval);
                        obj.triggerEvent('ended');
                    }
                }, 100);
            }
        },

        effectsChainSorter:function (objA, objB) {
            if (objA.type == 'HSHideShowAction') {
                return -1;
            }

            if (objB.type == 'HSHideShowAction') {
                return 1;
            }

            if (objA.type == "HSOtherCardAction" || !Object.isUndefined(objA.effect)) {  //goto action
                return 1;
            }

            if (objB.type == "HSOtherCardAction" || !Object.isUndefined(objB.effect)) {  //goto action
                return -1;
            }

            return 0;
        },

        observeOnce:function (el, eventName, handler) {
            el.observe(eventName, function (event) {
                handler(event);
                el.stopObserving(eventName, handler);
            });
        },
        /**
         * Checks whether if media objects which it is necessary to activate clicked of the user
         * action: HSPlayMovieAction, HSPlaySoundAction, HSSequencerAction
         * only mobile device
         */
        isNeedMobileMediaActivation:function (newCard) {
            var isActivation = false;
            var checkMedia = function(act){
                if (Object.isFunction(act) || Object.isString(act)) {
                    return false;
                }
                if (act.type == "HSPlayMovieAction" && act.movies) {
                    for (i = 0, len = act.movies.length; i < len; ++i) {
                        var obj = this.getCardObjectById(act.movies[i].object);
                        if (1 == obj.isPNGMap) continue;
                        return true;
                    }
                }
                if (act.type == "HSPlaySoundAction" && act.sounds) {
                    return true;
                }
                if (act.type == "HSSequencerAction") {
                    var seq = act.sequenceItems;
                    for (var i = 0, objTemp, len = seq.length; i < len; ++i) {
                        objTemp = this.getCardObjectById(seq[i].object);
                        if (objTemp.actions && objTemp.actions.click) {
                            for (var j = 0, click, lenj = objTemp.actions.click.length; j < lenj; ++j) {
                                click = objTemp.actions.click[j];
                                if (click.sounds) {
                                    return true;
                                }
                                if (click.movies) {
                                    var objTempMovie = this.getCardObjectById(click.movies.object);
                                    if (1 == objTempMovie.isPNGMap) continue;
                                    return true;
                                }
                            }
                        }
                    }
                }
                return false;
            }.bind(this);

            if(newCard.actions){
                if (!Object.isUndefined(newCard.actions.arrive) && Object.isArray(newCard.actions.arrive)) {
                    newCard.actions.arrive.each(function (act) {
                        if(checkMedia(act)){
                            isActivation = true;
                            throw $break;
                        }
                    });
                }
            }

            for (var i = 0, obj; i < newCard.objects.length; i++) {
                obj = newCard.objects[i];
                if (!obj.actions) {
                    continue;
                }
                if (Object.isUndefined(obj.actions) || Object.isUndefined(obj.actions.click) || obj.actions.click.length == 0) {
                    continue;
                }
                if(Object.isUndefined(obj['timer'])){
                    continue;
                }
                obj.actions.click.each(function (act) {
                    if(checkMedia(act)){
                        isActivation = true;
                        throw $break;
                    }
                });
            }
            return isActivation;
        },

        /**Drawing shape on canvas, according to
         * given points array or image;
         * Soon drawing image on canvas will be added.
         */
        drawShape:function (canvas, obj){
            var obj = obj || {},
                ctx = canvas.getContext('2d');

            if(!canvas){
                return false;
            }

            var drawImage = function(){
                var img = new Image();
                var loadImageHandler = function(){
                    ctx.drawImage(img, 0, 0);
                    canvas.setOpacity(0);
                    img.stopObserving("load");
                };

                if (!!obj.src) {
                    img.src = prefix + obj.src /*+ "?" + new Date().getTime()*/;
                }

                if (!!obj.shapeFile) {
                    img.src = prefix + obj.shapeFile /*+ "?" + new Date().getTime()*/;
                }
                img.observe("load", loadImageHandler);
            };

            var drawShapePoints = function(){
                ctx.beginPath();
                ctx.moveTo(0, 0);
                for (var i = 1, l = obj.shape.points.length; i < l; ++i) {
                    var points = obj.shape.points[i];
                    ctx.lineTo(points.xCoord, points.yCoord);
                    //ctx.bezierCurveTo(points.ctrl1xCoord,points.ctrl1yCoord,points.ctrl2xCoord,points.ctrl2yCoord,points.xCoord,points.yCoord);
                }
                ctx.closePath();
                ctx.fill();
            };

            canvas.setStyle("-webkit-transform:rotate(" + (obj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (obj.rotationAngle) + "deg);" +
                "-ms-transform:rotate(" + (obj.rotationAngle) + "deg);" +
                "-o-transform:rotate(" + (obj.rotationAngle ) + "deg);");

            if (!!obj.shape && obj.shape.draw == true) {
                drawShapePoints();
            }  else {
                drawImage();
            }
        },

        /**
         * If canvas, change cursor when set draggable and has shape for element
         */
        changeCursor:function (el, obj){
            if(isTouchDevice() || el.tagName.toLowerCase() !== "canvas"){
                return;
            }

            el.observe('mousemove', function (event) {
                var cursor;
                if (play.help.checkIfShapeClicked(el, event)) {
                    if(event.which && !!obj.cursorDrag){
                        cursor = play.template.cursorStyle(obj.cursorDrag, obj.hotSpotX, obj.hotSpotY);
                    } else {
                        cursor = play.template.cursorStyle(obj.cursor, obj.hotSpotX, obj.hotSpotY);
                    }
                } else {
                    cursor = cardsCollection.currentElement().cursor;
                }

                if(el.style.cursor !== cursor){
                    el.style.cursor = cursor;
                }
            });
        }
    }
};

/**Main player object
 * Contains logic, observers and
 * card injection realization
 */
var playerObj = Class.create({
    initialize:function (options) {
        try {
            this.help = new helper;
            this.options = {
                onInitGo:'firstCard',
                onInitCardNumber:'0',
                onInitTransition:'HSFadeTransition',
                globalData:{},
                isResizeWindow:false,
                isWidget:false,
                isFrameEnabled:true,
                test:true
            };
            Object.extend(this.options, options || {});
            /**FADING WATERMARK AFTER DELAY*/
            $('wrapperTable').show();
            //this.removeWatermark();
            /**EOF*/
                //alert(isTouchDevice());
            this.globalData = this.options.globalData;
            this.additionalWrapperWidth = (this.options.isFrameEnabled) ? 10 : 0;
            this.additionalWrapperHeight = (this.options.isFrameEnabled) ? 10 : 0;
            this.contentMargin = 5;
            /**TODO: make sure we don't need minimum 180px width of container, via x2iba-949*/
            var wrapperWidth = /*(parseInt(this.globalData.stacks[0].xSize)>180)?*/parseInt(this.globalData.stacks[0].xSize) + this.additionalWrapperWidth/*:180*/;

            /**FIXING CARD DIMENSIONS*/
            var offsets = this.getWrapperOffsets();
            var contPaneOffset = (document.viewport.getWidth() > this.globalData.stacks[0].xSize)
                ? ("left:50%;margin-left:" + (-(this.globalData.stacks[0].xSize / 2 )) + "px;")
                : "left:0px;";

            $('mainbar').setStyle("top:" + (offsets.wrapperTop + 10) + "px;margin-left:" + (parseInt(this.globalData.stacks[0].xSize) - 166) + "px;");
            $('contPane').morph("width:" + this.globalData.stacks[0].xSize + "px;" +
                "height:" + this.globalData.stacks[0].ySize + "px;" +
                "top:" + offsets.wrapperTop + "px;" + contPaneOffset, {
                duration:0});
            $('wrapperTable').setStyle(/*position:relative;*/"width:" + wrapperWidth + "px;height:" + (parseInt(this.globalData.stacks[0].ySize) + this.additionalWrapperHeight) + "px;margin:" + offsets.wrapperTableTop + "px auto;");

            if (this.options.isResizeWindow) {
                var wrapperHeight = (parseInt(this.globalData.stacks[0].ySize) + this.additionalWrapperHeight);
                var resizeWindowHeight = (window.outerHeight - window.innerHeight) + wrapperHeight;
                var resizeWindowWidth = (Prototype.Browser.IE) ? (wrapperWidth + 20) : wrapperWidth;
                window.resizeTo(resizeWindowWidth, resizeWindowHeight);
            }

            if (this.options.isWidget) {
                this.options.onInitTransition = 'No_Transition';
                /**X2iBA-111 FIX*/
                var eventName = 'Card' + this.options.onInitCardNumber + ':loaded'
                    , onCardLoaded = function (e) {
                        document.stopObserving(eventName, onCardLoaded);
                        $(document.body).removeChild($('widgetFrame'));
                    };

                document.observe(eventName, onCardLoaded);
                /**EOF*/
            }
            /**EOF FIXING CARD DIMENSIONS*/
            this.flashVideo = !this.supportsVideo();
            this.flashAudio = !this.supportsAudio();
            this.globalVolume = 1;
            this.draggableObjects = [];
            this.draggableObjectsData = {};
            this.textObjectsData = {};
            this.clearChangeFlag = false;
            this.timerTimeouts = [];
            this.preloadElements = [];
            this.homeStackPrefix = 'data/stackData/' + config.homeStackName + '/';
            this.lastSeenStackLink = this.homeStackPrefix + 'stack.json';
            this.stackWasChanged = false;
            this.mobileSafariMedia = {};
            this.trackEvents = (!isTouchDevice()) ? this.mouseEvents : this.touchEvents;

            ["click", "mousedown", "mouseup"].each(function (el) {
                this.appendMouseMethods(el);
            }.bind(this));
            this.appendStartingTexts();
            this.appendEventsSimulation();
            $('contPane').style.background = "#fff";
            this.animateGoto(this.options.onInitGo, this.options.onInitCardNumber, this.options.onInitTransition);

            /** global observers for stack level */
            this.hypertextObserver = new Action.hypertextObserver(linksCollection);
            this.slideShowObserver = '';
            /** end global observers */

            /** card level observers */
            this.keyMapperObserver = '';
            /** end card level observers */

            this.suspendEventLoadCard = false;
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    unloadAlerted:0,

    where:'',

    no:'',

    effect:'',

    animateFrom:'',

    flashVideo:false,

    initHypertextObserver:function () {
    },

    moveToFrontObjects:[],

    setMediaActive:function () {
        ["audio", "video"].each(function (el) {
            $$(el).invoke("setAttribute", "isactive", "isactive");
        });
    },

    smartAudioActivator:function () {
        try {
            ["touchstart", "touchend"].each(function (evt) {
                $(document.body).observe(evt, function (e) {
                    if (play.lastActiveSound !== undefined) {
                        return;
                    }
                    //if(this.noNeedToActivateMedia)return;
                    /**TODO:
                     * fix this*/
                        //this.noNeedToActivateMedia = true;
                        //this.setMediaActive();
                        //return;
                        //if(!Object.isUndefined(this.mediaActivationTimeout))return;
                    this.activatedThisTime = false;
                    $$("audio").each(function (element, index) {
                        if (this.activatedThisTime)return;
                        if (Object.isUndefined(element.isactive) || element.isactive != "isactive") {
                            this.activatedThisTime = true;
                            /*element.play();
                             this.mediaActivationTimeout = setTimeout(function(){*/
                            element.load();
                            element.isactive = "isactive";
                            element.pause();
                            element.paused = true;
                            /*},200);
                             element.observe("timeupdate",function(){
                             element.pause();
                             element.isactive="isactive";
                             clearTimeout(this.mediaActivationTimeout);
                             element.paused=true;
                             this.noNeedToActivateMedia = true;
                             this.setMediaActive();
                             delete this.mediaActivationTimeout;
                             }.bind(this));

                             //throw $break;
                             this.activatedThisTime = true;
                             return;
                             }
                             }.bind(this));
                             if(this.activatedThisTime)return;
                             $$("video").each(function(element,index){
                             if(Object.isUndefined(element.isactive)||element.isactive!="isactive"){
                             element.play();
                             this.mediaActivationTimeout = setTimeout(function(){
                             element.load();
                             element.isactive="isactive";
                             element.paused=true;
                             },200);
                             element.observe("timeupdate",function(){
                             element.pause();
                             element.isactive="isactive";
                             clearTimeout(this.mediaActivationTimeout);
                             element.paused=true;
                             this.noNeedToActivateMedia = true;
                             this.setMediaActive();
                             delete this.mediaActivationTimeout;
                             }.bind(this));

                             this.activatedThisTime = true;
                             return;*/
                        }
                    }.bind(this));
                    this.activatedThisTime = false;
                }.bind(this));
            }, this);
        } catch (err) {
            console.log(err);
        }
    },

    removeWatermark:function () {
        $('contPane').observe("mouseup", function () {
            $('mainbar').fade();
        });

        setTimeout(function () {
            $('mainbar').fade();
        }, 10000);
    },

    getWrapperOffsets:function (stackHeight) {
        var wrapperH = parseInt(stackHeight || this.globalData.stacks[0].ySize) + this.additionalWrapperHeight;
        var halfTopOffset = ((window.innerHeight - wrapperH) / 2);
        if (this.options.isWidget || (!this.options.isFrameEnabled && this.options.isResizeWindow)) {
            this.additionalWrapperHeight = 0;
            this.contentMargin = 0;
            var top = (halfTopOffset > 1) ? halfTopOffset + this.contentMargin : this.contentMargin;
            var left = 0;
        } else if (this.options.isFrameEnabled && this.options.isResizeWindow) {
            var top = this.contentMargin;
            var left = this.contentMargin;
        } else if (!this.options.isFrameEnabled && !this.options.isResizeWindow) {
            var top = (halfTopOffset > 1) ? halfTopOffset : 0;
            var left = 0;
        } else {
            var top = (halfTopOffset > 1) ? halfTopOffset + this.contentMargin : this.contentMargin;
            var left = this.contentMargin;
        }

        var tableTop = ((halfTopOffset > 1) && (!this.options.isWidget && !this.options.isResizeWindow)) ? halfTopOffset : 0;

        return {wrapperTop:top, wrapperLeft:left, wrapperTableTop:tableTop, wrapperHeight:wrapperH};
    },

    mobileSafariGetMediaFromAction:function (act, needToStop, ignoreSounds) {
        if (Object.isUndefined(this.objectsToActivate)) {
            this.objectsToActivate = [];
        }
        if (Object.isUndefined(ignoreSounds)) {
            ignoreSounds = false;
        }
        if (['HSPlaySoundAction', 'HSPlayMovieAction'].include(act.type)) {
            if (act.type == "HSPlayMovieAction" && act.movies) {
                act.movies.forEach(function (movie) {
                    var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, movie.object));
                    var objModelId = movie.object;
                    var objectModelRepresentation = play.help.getCardObjectById(objModelId);
                    if (1 == objectModelRepresentation.isPNGMap) return;
                    obj.needToStop = needToStop;
                    var isAdded = this.objectsToActivate.detect(function (element) {
                        return element.id == obj.id;
                    });

                    if (!isAdded && !needToStop) {
                        this.objectsToActivate.push(obj);
                    }

                }.bind(this));
            }
            if (act.type == "HSPlaySoundAction" && act.sounds) {
                act.sounds.forEach(function (sound) {
                    var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, sound.object));
                    obj.needToStop = needToStop;
                    var isAdded = this.objectsToActivate.detect(function (element) {
                        return element.id == obj.id;
                    });

                    if (!isAdded && !needToStop) {
                        this.objectsToActivate.push(obj);
                    }
                }.bind(this));
            }
        }
        if (act.type == "HSSequencerAction") {
            var _this = this;
            act.sequenceItems.forEach(function (item) {
                var temp = play.help.getCardObjectById(item.object);
                if (temp.actions && temp.actions.click) {
                    temp.actions.click.forEach(function (click) {
                        if (click.sounds) {
                            click.sounds.forEach(function (sound) {
                                var tempSound = $(play.template.newCardElementId(cardsCollection.currentElement().id, sound.object));
                                var isAdded = _this.objectsToActivate.detect(function (element) {
                                    return element.id == tempSound.id;
                                });
                                if (!isAdded) {
                                    _this.objectsToActivate.push(tempSound);
                                }
                            });
                        }

                        if (click.movies) {
                            click.movies.forEach(function (movie) {
                                var tempMovie = $(play.template.newCardElementId(cardsCollection.currentElement().id, movie.object));
                                var isAdded = _this.objectsToActivate.detect(function (element) {
                                    return element.id == tempMovie.id;
                                });
                                if (!isAdded) {
                                    _this.objectsToActivate.push(tempMovie);
                                }
                            });
                        }

                    });

                }
            });
        }
    },

    mobileSafariMediaActivator:function () {
        this.globalData.stacks[0].cards.each(function (card, index) {
            var cardIndex = index;
            card.objects.each(function (obj) {
                if (obj.type == 'sound') {
                    this.mobileSafariMediaStoreOnStack(obj, cardIndex);
                }
            }.bind(this));
        }.bind(this));
    },

    mobileSafariMediaStoreOnStack:function (obj, cardIndex) {
        var mediaId = obj.id;

        if (this.mobileSafariMedia[mediaId]) {
            return;
        }
        /*var tag = (obj.type=="video")?obj.type:"audio";
         if(tag=="audio"){
         obj.xCoord =  (Math.random()*Math.random()) * 1000;
         obj.yCoord = (Math.random()*Math.random())*1000;
         }*/
        var mediaObject = new Element("audio", {    id:mediaId,
            src:prefix + obj.src,
            /*width:'40',
             height:'40',
             isVisible:"1",
             controls:"controls",*/
            style:"position:absolute;" +
                "z-index:0;" +
                "display:block;" +
                "width:0px;" +
                "height:0px;"});
        mediaObject.data = obj;
        this.mobileSafariMedia[mediaId] = mediaObject;
        $('wrapperTable').insert(mediaObject);
    },

    saveGroupObjectsState:function () {
        var thisCard = cardsCollection.currentElement();
        this.groupObjectsData = {};

        thisCard.objects.each(function (el) {
            if (!Object.isUndefined(el.isGroupObject) && el.isGroupObject == 1 && Object.isElement($(this.template.newCardElementId(cardsCollection.currentElement().id, el.id)))) {
                var element = $(this.template.newCardElementId(cardsCollection.currentElement().id, el.id));
                var tempData = {
                    width:element.getStyle('width'),
                    height:element.getStyle('height'),
                    top:element.getStyle('top'),
                    left:element.getStyle('left'),
                    position:element.getStyle('position'),
                    zIndex:element.getStyle('z-index')
                };
                this.groupObjectsData[el.id] = tempData;
            }
        }.bind(this));
    },

    moveToFrontOnPreload:function (cardObject, moveToFrontObjects) {
        var nodes = $A($(cardObject).childNodes)
            , preloadMaxZIndex = 0;

        /** Take maximum z-index */
        preloadMaxZIndex = nodes.max(function (el) {
            return parseInt(el.style.zIndex) ? parseInt(el.style.zIndex) : 0;
        });
        /** move to front */
        moveToFrontObjects.each(function (elem) {
            var element = nodes.find(function (el) {
                return el.id.slice(el.id.length - 36, el.id.length) == elem.item.object;
            });

            if (element) {
                element.style.zIndex = preloadMaxZIndex += 2;
                var elementImage = nodes.find(function (el) {
                    return el.id == element.id + "_image";
                });

                if (elementImage) {
                    elementImage.style.zIndex = preloadMaxZIndex - 1;
                }
            }
        });
    },

    saveDraggableObjectsState:function () {
        var thisCard = cardsCollection.currentElement();
        thisCard.objects.each(function (el) {
            if (!Object.isUndefined(el.isDraggable) && el.isDraggable == 1 && Object.isElement($(this.template.newCardElementId(cardsCollection.currentElement().id, el.id)))) {
                var element = $(this.template.newCardElementId(cardsCollection.currentElement().id, el.id));
                var tempData = {
                    width:element.getStyle('width'),
                    height:element.getStyle('height'),
                    top:element.getStyle('top'),
                    left:element.getStyle('left'),
                    position:element.getStyle('position'),
                    zIndex:element.getStyle('z-index')
                };
                this.draggableObjectsData[el.id] = tempData;
            }
        }.bind(this));
    },

    saveTextObjectsState:function () {
        var thisCard = cardsCollection.currentElement();
        thisCard.objects.each(function (el) {
            if (!Object.isUndefined(el.isReadOnly) && el.isReadOnly == 0 && Object.isElement($(this.template.newCardElementId(cardsCollection.currentElement().id, el.id)))) {
                var element = $(this.template.newCardElementId(cardsCollection.currentElement().id, el.id));
                var textPane = $(element.id + "textPane");
                var tempData = textPane.innerHTML;
                this.textObjectsData[this.template.newCardElementId(cardsCollection.currentElement().id, el.id)] = tempData;
            }
        }.bind(this));
    },

    appendStartingTexts:function () {
        this.globalData.stacks.each(function (stack) {
            stack.cards.each(function (card) {
                card.objects.each(function (object) {
                    if ((object.type == "text") && (object.textType == "scrollable")) {
                        var objId = this.template.newCardElementId(card.id, object.id);
                        this.textObjectsData[objId] = object.text || "";
                    }
                }, this);
            }, this);
        }, this);
    },

    appendMouseMethods:function (evtName) {
        try {
            HTMLElement.prototype[evtName] = function () {
                var evt = this.ownerDocument.createEvent('MouseEvents');
                evt.initMouseEvent(evtName, false, true, this.ownerDocument.defaultView, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
                this.dispatchEvent(evt);
            };
        } catch (err) {
            console.log(err);
        }
    },

    appendEventsSimulation:function () {
        Element.prototype.triggerEvent = function (eventName) {
            if (document.createEvent) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent(eventName, true, true);

                return this.dispatchEvent(evt);
            }

            if (this.fireEvent) {
                return this.fireEvent('on' + eventName);
            }
        };
    },

    supportsVideo:function () {
        try {
            if (!!document.createElement('video').canPlayType == false || (document.createElement('video').canPlayType('video/quicktime') == '' && document.createElement('video').canPlayType('video/mp4') == '')) return false;
            else return true;
        } catch (err) {
            alert(err);
            return false;
        }
    },

    supportsAudio:function () {
        try {
            if (!!document.createElement('audio').canPlayType == false || (document.createElement('audio').canPlayType('audio/aac') == '' && document.createElement('audio').canPlayType('audio/mp4') == '')) {
                return false;
            } else {
                return true;
            }
        } catch (err) {
            return false;
        }
    },

    resizePlayer:function (width, height, duration) {  // animate time = 1 second
        var offsets = this.getWrapperOffsets(height);
        $('mainbar').morph("top:" + (offsets.wrapperTop + 10) + "px;margin-left:" + (width - 166) + "px;", {duration:duration});
        $('contPane').setStyle("top:" + offsets.wrapperTop + "px;" +
            "left:50%;" +
            "margin-left:-" + (width / 2) + "px;" +
            "width:" + width + "px;" +
            "height:" + height + "px;");
        $('wrapperTable').morph("width:" + (width + this.additionalWrapperWidth) + "px;" +
            "height:" + (height + this.additionalWrapperHeight) + "px;" +
            "margin:" + offsets.wrapperTableTop + "px auto;", {duration:duration});
    },

    changeStack:function (link, effect, homeStackAction, no, backAction) {
        var homeFromHome = false;
        this.lastSeenStackLink = prefix + 'stack.json';

        /**XIIMAC-19857 FIX */
        if (link == this.lastSeenStackLink) {
            homeFromHome = true;
        }
        /**EOF*/

        tempPrefix = prefix;
        prefix = "data/stackData/";

        this.stackWasChanged = true;
        var stackLink = (homeStackAction) ? link : (backAction) ? link : prefix + link;

        var req = new AJAXLocalRequest(stackLink,
            { onSuccess:function (responce) {
                try {
                    var data = responce
                        , jsonData = new stackJsonParser()
                        , stackCount = jsonData.getStackCount(data)
                        , stack = jsonData.getStack(data, 0)
                        , cards = stack.cards
                    /**XIIMAC-19883*/
                        , oldCardSizeX = this.globalData.stacks[0].xSize
                        , oldCardSizeY = this.globalData.stacks[0].ySize;
                    /**EOF XIIMAC-19883*/

                    document.title = stack.name;
                    var lastVisitedCard = cardsCollection.currentElement().id;

                    cardsCollection = new stackObj({comments:stack.comments});

                    for (var i = 0; i < cards.length; i++) {
                        cardsCollection.push(cards[i]);
                    }
                    this.unloadAlerted = 0;
                } catch (err) {
                    console.log(err);
                }

                try {
                    prefix = (backAction || homeStackAction) ? link.replace(/stack.json$/, "") : "data/stackData/" + link.replace(/stack.json$/, "");

                    /**if we have visited home stack and the action is to go back to home stack,
                     * we should set the card pointer to those card, that was last seen in the home stack
                     */
                    if (homeStackAction) {
                        (Object.isUndefined(this.globalData.HSCardNumber)) ? this.globalData.HSCardNumber = prevLastVisitedStackCard = lastVisitedCard : prevLastVisitedStackCard = this.globalData.HSCardNumber;
                        this.globalData = data;
                        this.globalData.HSCardNumber = lastVisitedCard;
                        cardsCollection.setPointer(0);
                    } else {
                        (Object.isUndefined(this.globalData.HSCardNumber)) ? this.globalData.HSCardNumber = prevLastVisitedStackCard = lastVisitedCard : prevLastVisitedStackCard = this.globalData.HSCardNumber;
                        this.globalData = data;
                        this.globalData.HSCardNumber = lastVisitedCard;
                        var pointer = (Object.isUndefined(no)) ? 0 : no;
                        cardsCollection.setPointer(pointer);
                    }
                    /**FIXING CARD DIMENSIONS*/
                    var newCardSizeX = parseInt(this.globalData.stacks[0].xSize);
                    var newCardSizeY = parseInt(this.globalData.stacks[0].ySize);

                    if (newCardSizeX != oldCardSizeX && newCardSizeY != oldCardSizeY) {
                        // align cur card on player center
                        var curCard = $$('#contPane > div:first')[0];
                        curCard.style.left = Math.max(0, (newCardSizeX - oldCardSizeX) / 2) + 'px';
                        curCard.style.top = Math.max(0, (newCardSizeY - oldCardSizeY) / 2) + 'px';

                        this.resizePlayer(Math.max(oldCardSizeX, newCardSizeX), Math.max(oldCardSizeY, newCardSizeY), 0);
                        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function () {
                            this.resizePlayer(newCardSizeX, newCardSizeY, 0.5);
                        }.bind(this));
                    }
                    if (this.options.isResizeWindow) {
                        var wrapperWidth = (parseInt(this.globalData.stacks[0].xSize) + this.additionalWrapperWidth);
                        var wrapperHeight = (parseInt(this.globalData.stacks[0].ySize) + this.additionalWrapperHeight);
                        var resizeWindowHeight = (window.outerHeight - window.innerHeight) + wrapperHeight;
                        var resizeWindowWidth = (Prototype.Browser.IE) ? (wrapperWidth + 20) : wrapperWidth;

                        setTimeout(function () {
                            Action.playResizeWindow(resizeWindowWidth, resizeWindowHeight);
                        }.bind(this), 10);
                    }
                    /**EOF CARD DIMENSIONS*/
                    var animateFrom = $$('#contPane > div:first')[0];

                    /**FIX FOR SAME card ID'S*/
                    if (lastVisitedCard == no) {
                        var tempId = animateFrom.id + "inPreviousStack"
                            , el = $('contPane').firstDescendant();
                        el.id = tempId;
                        el.removeAttribute("id");
                        el.setAttribute("id", tempId);
                    }
                    /**EOF*/
                    animateFrom.style.zIndex = 999999;
                    var newCard = cardsCollection.currentElement()
                        , animateTo = this.injectCard(newCard, effect)
                        , changeStackEffect = effect;

                    this.playEffect(animateFrom, animateTo, changeStackEffect);

                    /* set links */
                    linksCollection = stack.links || [];
                    linksObjects = stack.linksActionObjects || [];
                    this.hypertextObserver.setLinks(linksCollection);
                } catch (err) {
                    console.log(err);
                }
            }.bind(this),
                onException:function () {
                    prefix = tempPrefix;
                    new messageCreate({image:"./data/engine/templates/img/info.png", text:"Stack not found!", caption:"OK"});
                },

                onFailure:function () {
                    prefix = tempPrefix;
                    new messageCreate({image:"./data/engine/templates/img/info.png", text:"Stack not found!", caption:"OK"});

                }.bind(this)
            });
    },

    extendObject:function () {
        if (!document.createElement('object').play) {
            Element.addMethods(["OBJECT", "EMBED"], {
                play:function (element) {
                    var element = $(element);
                    Try.these(function () {
                        element.playMedia();
                    }.bind(this)) || false;
                },

                pause:function (element) {
                    var element = $(element);
                    Try.these(function () {
                        element.pauseMedia();
                    }.bind(this)) || false;
                },

                rotate:function (element, degree) {
                    var element = $(element);
                    if (Object.isFunction(element.setStyle)) {
                        element.setStyle("-webkit-transform:rotate(" + degree + "deg);" +
                            "-moz-transform:rotate(" + degree + "deg);" +
                            "-ms-transform:rotate(" + degree + "deg);" +
                            "-o-transform:rotate(" + degree + "deg);");
                    } else {
                        var elPosition = $(element).getDimensions();
                        var height = elPosition.height;
                        var width = elPosition.width;
                        var radius = Math.sqrt((height * height + width * width));
                        var top = parseInt($(element).style.top.replace(/px$/, ""));
                        var left = parseInt($(element).style.left.replace(/px$/, ""));
                        var flVideoTopPos = Math.abs((width * Math.sin((degree + 90) * Math.PI / 180)) - (width - height));
                        var flVideoLeftPos = Math.abs(height * Math.cos((degree) * Math.PI / 180) - height);
                        var newTop = top - width * Math.sin((degree + 90) * Math.PI / 180) + height;
                        var newLeft = left - (flVideoLeftPos + Math.sqrt(flVideoLeftPos) + 5);
                        $(element).setStyle("top:" + (newTop) + "px;left:" + newLeft + "px;height:" + radius + "px; width:" + radius + "px;");
                        element.TSetProperty('/', 2, 100 * width / radius);
                        element.TSetProperty('/', 3, 100 * width / radius);
                        element.TSetProperty('/', 0, 0);
                        element.TSetProperty('/', 1, flVideoTopPos - 50);
                        element.TSetProperty('/', 10, degree);
                    }
                },

                updateRotatedFlash:function (element) {
                    var element = $(element);
                    var i = 0;

                    this.updateRotatedFlashInterval = setInterval(function () {
                        var pos = parseInt(element.style.top.replace(/px$/, ""));
                        (i % 0.2) == 0 ? i += 0.1 : i -= 0.1;
                        element.style.top = pos + i + "px";
                    }.bind(this), 50);
                }//,

                //	getDuration: function(element){
                //		var element = $(element);
                //		return element.duration();
                //	},

                //	duration: this.getDuration()
            });
        }
    },

    rotateVideo:function (id, degree) {
        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {
            $(id).rotate(degree);
        }.bind(this));
    },

    updateRotatedFlashVideo:function (id) {
        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {
            setTimeout(function () {
                $(id).updateRotatedFlash();
            }.bind(this), 10);
        }.bind(this));
    },

    makeElementDraggable:function (id, dragOptions) {
        var state = "";
        var options = {
            onDrag:function () {
                state = 'dragging';
            },
            manualDropOff:false,
            change:Prototype.emptyFunction,
            onEnd:Prototype.emptyFunction
        };
        Object.extend(options, dragOptions || { });
        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {
            setTimeout(function () {
                $(id).observe(play.trackEvents.start, function (event) {
                    state = 'start';
                });
                $(id).observe(play.trackEvents.end, function (event) {
                    if (state != 'dragging') {
                        event.element().fire('draggable:click');
                    }
                    state = '';
                });
                this.draggableObjects.push(new Draggable(id, {
                    ghosting:false,
                    starteffect:false,
                    endeffect:false,
                    zindex:$(id).style.zIndex,
                    onDrag:options.onDrag,
                    onEnd:options.onEnd,
                    manualDropOff:options.manualDropOff,
                    change:options.change
                }));
                $(id).setAttribute("passmeevt", "true");
                $(id).setAttribute("isDraggable", "true");
            }.bind(this), 250);
        }.bind(this));
    },

    appendDragableVideoStyle:function (newCard, play, j, id) {
        setTimeout(function () {
            var style = this.help.getDraggableObjectStyle(newCard, this, j);
            $(id).setStyle(style);
        }.bind(this), 20);
    },

    setVideoAutoplay:function (id) {
        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {
            setTimeout(function () {
                $(id).setAttribute("playonstart", "true");
                $(id).play();
            }.bind(this), 250);
        }.bind(this));
    },

    setVideoDontAutoplay:function (id) {
        document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {
            setTimeout(function () {
                $(id).pause();
            }.bind(this), 250);
        }.bind(this));
    },

    createVideoElement:function (newCard, j) {
        var obj = newCard.objects[j];
        var videoId = this.template.newCardElementId(newCard.id, obj.id);

        /**PNG MAP VIDEO SIMULATIONS*/
        if (obj.isPNGMap == 1) {
            return new createElements.pngMapVideo({id:videoId, object:obj, help:this.help}).container;
        }
        /**EOF*/
        if (this.supportsVideo()) {
            if (isTouchDevice() && !Object.isUndefined(this.mobileSafariMedia[videoId])) {
                var videoElement = this.mobileSafariMedia[videoId];
            } else {
                var videoElement = new Element(obj.type,
                    {src:prefix + obj.src,
                        id:videoId,
                        autoplay:false,
                        data:prefix + obj.src,
                        style:'position:relative;background:none;z-index:' + this.help.getZIndexValue(obj.order) + ';display:block;top:' +
                            obj.yCoord + 'px;left:' + obj.xCoord + 'px;height:' +
                            obj.ySize + 'px;width:' + obj.xSize + 'px;' +
                            'cursor:' + obj.cursor.replace(/Resources/, prefix + "Resources") + ';opacity:' + obj.opacity + ';' +
                            (isTouchDevice() && new browserDetect().browserName === 'Safari' && +obj.opacity < 1 ? '-webkit-filter: contrast(101%);' : '') // fix X2IBA-1155
                    });
                videoElement.insert("<source src='" + prefix + obj.src + "' type='video/quicktime'>");
                videoElement.insert('your browser doesn\'t support this video encoding');
            }
        } else {
            this.extendObject();
            //classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" 
            var rotateStyle = "";
            if (obj.rotationAngle > 0 || obj.rotationAngle < 0) {
                rotateStyle = "-webkit-transform:rotate(" + obj.rotationAngle + "deg);" +
                    "-moz-transform:rotate(" + obj.rotationAngle + "deg);" +
                    "-ms-transform:rotate(" + obj.rotationAngle + "deg);" +
                    "-o-transform:rotate(" + obj.rotationAngle + "deg);";

            }
            var local = (/file\:/.test(window.location.href)) ? "_local" : "";
            var videoElement = '<object type="application/x-shockwave-flash" isVisible="' + obj.isVisible + '" data="data/engine/templates/flash/mediaplayer' + local + '.swf" mediatype="video" id="' + videoId + '"' +
                ' style="position:absolute;background:none;z-index:' + this.help.getZIndexValue(obj.order) + ';';
            videoElement += (obj.isVisible == 1) ? "display:block;" : "display:none;";

            videoElement += 'top:' + obj.yCoord + 'px;left:' + obj.xCoord + 'px;height:' +
                obj.ySize + 'px;width:' + obj.xSize + 'px;opacity:' + obj.opacity + ';' + rotateStyle + '">' +
                '<param name="allowNetworking" value="all">' +
                '<param name="allowFullScreen" value="true">' +
                '<param name="allowScriptAccess" value="always">' +
                '<param name="wmode" value="transparent">' +
                '<param name="movie" value="data/engine/templates/flash/mediaplayer.swf">' +
                '<param name="flashvars" value="src=../../../../' + prefix + obj.src + '&id=' + videoId + '&controls=false">' +
                '</object>';
            if (rotateStyle != "")this.updateRotatedFlashVideo(videoId);
        }
        /** set up box shadow */
        if (Object.isFunction(videoElement.setStyle)) {
            /** if already DOM element */
            videoElement.setStyle(this.help.getBoxShadowStyle(obj.shadow, obj.rotationAngle));
        } else {
            /** element is a string */
            videoElement = videoElement.replace('style="', 'style="' + this.help.getBoxShadowStyle(obj.shadow, obj.rotationAngle));
        }

        return videoElement;
    },

    createVideoControls:function (videoObj) {
        var BUTTON_PLAY_WIDTH = 17;
        var BUTTON_JUMPS_WIDTH = 17;
        var CONTROLS_HEIGHT = 16;
        var SEEK_LINE_EDGES = 3;
        var BUTTON_SEEK_WIDTH = 11;
        var draggableController;
        var videoId = videoObj.id;

        if (Object.isElement($(videoId + '_controls'))) {
            // don't create second copy of videocontrols
            return;
        }

        var videoControls = new Element('div', {
            id:videoId + '_controls',
            style:'position:absolute;background:none;z-index:' + videoObj.style['z-index'] + ';top:' +
                (parseFloat(videoObj.style['top']) + parseFloat(videoObj.style['height'])) + 'px;left:' + videoObj.style['left'] + ';height:' + CONTROLS_HEIGHT + 'px;width:'
                + videoObj.style['width'] + '; background-image:url("data/engine/templates/img/videocontrols/seekline.png");	background-repeat:repeat-x;'
        });

        if (videoObj.style.display == 'none') {
            videoControls.style.display = 'none';
        }

        var playButton = new Element('div', {width:BUTTON_PLAY_WIDTH + 'px', height:CONTROLS_HEIGHT + 'px', id:videoId + "_controllsPlayPause",
            style:'float:left;background-image:url("data/engine/templates/img/videocontrols/playpause.png");background-position:top left;width:' + BUTTON_PLAY_WIDTH + 'px;height: ' + CONTROLS_HEIGHT + 'px;'});
        var seekButton = new Element('img', {src:'data/engine/templates/img/videocontrols/seek.png', width:BUTTON_SEEK_WIDTH + 'px', height:CONTROLS_HEIGHT + 'px', id:videoId + "_controllsSeek",
            style:'top: 0px; left: -' + SEEK_LINE_EDGES + 'px;position: relative;float:left;'});
        var jumpButtonLeft = new Element('div', {id:videoId + "_controllsJumpLeft",
            style:'float:right;background-image:url("data/engine/templates/img/videocontrols/jumpleft.png"); background-position:top left;width:' + BUTTON_JUMPS_WIDTH + 'px;height: ' + CONTROLS_HEIGHT + 'px;'});
        var jumpButtonRight = new Element('div', {id:videoId + "_controllsJumpRight",
            style:'float:right;background-image:url("data/engine/templates/img/videocontrols/jumpright.png");background-position:top left;width:' + BUTTON_JUMPS_WIDTH + 'px;height: ' + CONTROLS_HEIGHT + 'px;'});
        var seekLineWidth = parseFloat(videoObj.style['width']) - BUTTON_PLAY_WIDTH - (BUTTON_JUMPS_WIDTH * 2) - BUTTON_SEEK_WIDTH;

        videoControls.insert(playButton);
        videoControls.insert("<img src='data/engine/templates/img/videocontrols/seekLineLeftEdge.png' height='" + CONTROLS_HEIGHT + "px' width='2px' style='float:left;'>");
        videoControls.insert(seekButton);
        videoControls.insert(jumpButtonRight);
        videoControls.insert(jumpButtonLeft);
        videoControls.insert("<img src='data/engine/templates/img/videocontrols/seekLineRightEdge.png' height='" + CONTROLS_HEIGHT + "px' width='2px' style='float:right;'>");
        videoControls.observe(this.trackEvents.start, function (e) {
            var leftBorder = BUTTON_PLAY_WIDTH + Math.floor(BUTTON_SEEK_WIDTH / 2);
            //var rightBorder = obj.xSize - (BUTTON_JUMPS_WIDTH*2)- Math.ceil(BUTTON_SEEK_WIDTH/2);
            var rightBorder = leftBorder + seekLineWidth;  //bit simplier calculation
            if (e.offsetX >= leftBorder && e.offsetY <= rightBorder) {
                var perc = (e.offsetX - leftBorder) / seekLineWidth;
                videoObj.autostartAfterSeeking = !videoObj.paused;
                videoObj.pause();
                videoObj.seeking = true;
                videoObj.currentTime = videoObj.duration * perc;
                $(videoId + "_controllsSeek").style.left = '' + (e.offsetX - leftBorder - SEEK_LINE_EDGES >> 0) + 'px';
                // copy pasted from Draggable.initDrag 
                var pointer = [Event.pointerX(e), Event.pointerY(e)];
                if (!pointer[0] && !Object.isUndefined(e.touches))var pointer = [e.touches[0].clientX, e.touches[0].clientY];
                var pos = seekButton.cumulativeOffset();
                draggableController.offset = [];
                draggableController.offset[0] = Math.ceil(BUTTON_SEEK_WIDTH / 2) - SEEK_LINE_EDGES;
                draggableController.offset[1] = pointer[1] - pos[1];
                Draggables.activate(draggableController);
            }

            e.preventDefault();
        });

        // for single click on seekLine. Dragging not perfomed, so Drag.onEnd not runned. We dublicate autostart here.
        videoControls.observe(this.trackEvents.end, function (e) {
            if (!draggableController.dragging && videoObj.autostartAfterSeeking) {
                videoObj.autostartAfterSeeking = false;
                videoObj.play();
            }
        });

        if (videoObj) {
            videoObj.getScreenshot = function () {
                var dimX = parseInt(this.style.width);
                var dimY = parseInt(this.style.height) + 16;
                var controlsOffset = dimY - CONTROLS_HEIGHT;
                var img = new Element('img', {});
                var screenshot = new Element('canvas', {width:dimX, height:dimY});
                var ctx = screenshot.getContext('2d');
                // playpause
                img.src = 'data/engine/templates/img/videocontrols/playpause.png';
                //var offsetX = (playButton.style['background-position-x'] == 'left')?0:BUTTON_PLAY_WIDTH;
                var offsetX = 0;
                var offsetY = (videoObj.style.display == 'none') ? CONTROLS_HEIGHT : 0;
                //var offsetY = (playButton.style['background-position-y'] != 'top')?0:CONTROLS_HEIGHT;
                ctx.drawImage(img, offsetX, offsetY, BUTTON_PLAY_WIDTH, CONTROLS_HEIGHT,
                    0, controlsOffset, BUTTON_PLAY_WIDTH, CONTROLS_HEIGHT);
                // left seek edge
                img.src = 'data/engine/templates/img/videocontrols/seekLineLeftEdge.png';
                ctx.drawImage(img, BUTTON_PLAY_WIDTH, controlsOffset);
                // jump button left
                img.src = 'data/engine/templates/img/videocontrols/jumpleft.png';
                ctx.drawImage(img, 0, 0, BUTTON_JUMPS_WIDTH, CONTROLS_HEIGHT,
                    dimX - BUTTON_JUMPS_WIDTH * 2, controlsOffset, BUTTON_JUMPS_WIDTH, CONTROLS_HEIGHT);
                // jump button right
                img.src = 'data/engine/templates/img/videocontrols/jumpright.png';
                ctx.drawImage(img, 0, 0, BUTTON_JUMPS_WIDTH, CONTROLS_HEIGHT,
                    dimX - BUTTON_JUMPS_WIDTH, controlsOffset, BUTTON_JUMPS_WIDTH, CONTROLS_HEIGHT);
                // right seek edge
                img.src = 'data/engine/templates/img/videocontrols/seekLineRightEdge.png';
                ctx.drawImage(img, dimX - BUTTON_JUMPS_WIDTH * 2 - SEEK_LINE_EDGES, controlsOffset);
                // seek line
                img.src = 'data/engine/templates/img/videocontrols/seekline.png';
                ctx.drawImage(img, 0, 0, 1, CONTROLS_HEIGHT,
                    BUTTON_PLAY_WIDTH + SEEK_LINE_EDGES, controlsOffset, dimX - BUTTON_PLAY_WIDTH - SEEK_LINE_EDGES * 2 - BUTTON_JUMPS_WIDTH * 2, CONTROLS_HEIGHT);
                if (isTouchDevice()) {
                    img.src = this.poster;
                    ctx.drawImage(img, 0, 0);
                } else {
                    if (this.paused) {
                        this.play();
                        ctx.drawImage(this, 0, 0);
                        this.pause();
                    } else {
                        ctx.drawImage(this, 0, 0);
                    }
                }

                ctx.drawImage(seekButton, parseInt(seekButton.style.left) + BUTTON_PLAY_WIDTH + SEEK_LINE_EDGES - 1, dimY - CONTROLS_HEIGHT);

                return screenshot;
            };

            if (videoObj.hide && !videoObj._hide) {
                videoObj._hide = videoObj.hide;
                videoObj.hide = function () {
                    this._hide();
                    var controls = $($(this).id + '_controls');
                    if (controls) controls.hide();
                };
            }

            if (videoObj.show && !videoObj._show) {
                videoObj._show = videoObj.show;
                videoObj.show = function () {
                    this._show();
                    var controls = $($(this).id + '_controls');
                    if (controls) controls.show();
                };
            }

            videoObj.observe('draggable:updatePosition', function () {
                videoControls.style.top = Math.floor(this.offsetTop + this.offsetHeight) + 'px';
                videoControls.style.left = this.offsetLeft + 'px';
            });

            videoObj.updateSeekButtonPosition = function () {
                var percent = videoObj.currentTime / videoObj.duration;
                $(videoId + "_controllsSeek").style.left = '' + (seekLineWidth * percent - SEEK_LINE_EDGES >> 0) + 'px';
            };

            videoObj.playerTimeUpdate = function () {
                if (videoObj.seeking) return;
                if (isNaN(videoObj.duration)) return;
                if (videoObj.paused) return;
                videoObj.updateSeekButtonPosition();
            };

            videoObj.observe('timeupdate', videoObj.playerTimeUpdate);

            var playButtonChange = function (e) {
                playButton.setStyle({'backgroundPosition':(videoObj.paused) ? 'top left' : 'bottom left'});
                playButton.paused = videoObj.paused;
            };
            videoObj.observe('pause', playButtonChange);
            videoObj.observe('playing', playButtonChange);
            videoObj.observe('ended', videoObj.pause);//delete timeupdate observe

            this.enableTracking(playButton, this.trackFunctionsVideo);
            this.enableTracking(jumpButtonRight, this.trackFunctionsVideo);
            this.enableTracking(jumpButtonLeft, this.trackFunctionsVideo);
            playButton.observe(this.trackEvents.end, function (event) {
                if (event.touches) {
                    // check, if touch ends on our playButton.
                    var offset = event.element().cumulativeOffset();
                    var x = event.changedTouches[0].pageX - offset[0];
                    var y = event.changedTouches[0].pageY - offset[1];
                    if (!((x > 0 && x < event.element().clientWidth) && (y > 0 && y < event.element().clientHeight))) return;
                }

                if (videoObj.paused) {
                    //on movie end was cleared all timeupdate events-need to restore it on play
                    var registry = Element.retrieve(videoObj, 'prototype_event_registry');
                    var responders = registry.get('timeupdate')
                    if (Object.isUndefined(registry) || Object.isUndefined(responders) || responders.length == 0) {
                        videoObj.observe('timeupdate', videoObj.playerTimeUpdate);
                    }
                    if (isTouchDevice()) {
                        $$('video').invoke('pause');
                        if (isNaN(videoObj.duration)) {
                            videoObj.load();
                        }
                        videoObj.isactive = 'isactive';
                    }
                    videoObj.play();
                } else {
                    videoObj.pause();
                }
            });
            jumpButtonLeft.observe(this.trackEvents.end, function (event) {
                if (event.touches) {
                    // check, if touch ends on our playButton.
                    var offset = event.element().cumulativeOffset();
                    var x = event.changedTouches[0].pageX - offset[0];
                    var y = event.changedTouches[0].pageY - offset[1];
                    if (!((x > 0 && x < event.element().clientWidth) && (y > 0 && y < event.element().clientHeight))) return;
                }
                if (!videoObj.paused) {
                    videoObj.pause();
                }
                if (videoObj.currentTime != videoObj.startTime) {
                    var newTime = videoObj.currentTime - 0.5;
                    newTime = newTime > videoObj.startTime ? newTime : videoObj.startTime;
                    play.help.seekMedia(videoObj, 'video', newTime);
                    videoObj.updateSeekButtonPosition();
                }
            });
            jumpButtonRight.observe(this.trackEvents.end, function (event) {
                if (event.touches) {
                    // check, if touch ends on our playButton.
                    var offset = event.element().cumulativeOffset();
                    var x = event.changedTouches[0].pageX - offset[0];
                    var y = event.changedTouches[0].pageY - offset[1];
                    if (!((x > 0 && x < event.element().clientWidth) && (y > 0 && y < event.element().clientHeight))) return;
                }
                if (!videoObj.paused) {
                    videoObj.pause();
                }
                if (videoObj.currentTime != videoObj.duration) {
                    var newTime = videoObj.currentTime + 0.5;
                    newTime = newTime < videoObj.duration ? newTime : videoObj.duration;
                    play.help.seekMedia(videoObj, 'video', newTime);
                    videoObj.updateSeekButtonPosition();
                }
            });

            draggableController = new Draggable(seekButton, {
                //constraint: 'horizontal',  //realized by snap
                snap:function (x, y, obj) {
                    x = Math.max(x, -SEEK_LINE_EDGES);
                    x = Math.min(x, seekLineWidth - SEEK_LINE_EDGES);
                    return [x, 0];
                },
                onStart:function () {
                    // this function can be run twicy
                    if (!videoObj.autostartAfterSeeking) {
                        videoObj.autostartAfterSeeking = !videoObj.paused;
                    }
                    videoObj.pause();
                    videoObj.seeking = true;
                },
                onEnd:function (drag) {
                    var perc = (drag.handle.offsetLeft - BUTTON_PLAY_WIDTH) / seekLineWidth;
                    videoObj.currentTime = videoObj.duration * perc;
                    if (videoObj.autostartAfterSeeking) {
                        videoObj.play();
                        videoObj.autostartAfterSeeking = false;
                    }
                    videoObj.seeking = false;
                },
                onDrag:function (drag) {
                    var perc = (drag.handle.offsetLeft - BUTTON_PLAY_WIDTH) / seekLineWidth;
                    videoObj.currentTime = videoObj.duration * perc;
                },
                starteffect:Prototype.emptyFunction,
                endeffect:Prototype.emptyFunction
            });

        }
        videoObj.insert({after:videoControls});
    },


    touchEvents:{
        start:"touchstart",
        end:"touchend",
        move:"touchmove"
    },

    mouseEvents:{
        start:"mousedown",
        end:"mouseup",
        move:"mousemove"
    },

    trackFunctionsButton:{
        elModel:null,
        check:function (el, event) {
            if (this.elModel.buttonType == "HSInvisibleShapeButtonType") {
                var elements = play.help.getElementsFromPoint(event);
                return elements.any(function (element) {
                    return element.id = el.id;
                });
            } else {
                return play.help.checkIfShapeClicked(el, event);
            }
        },
        activate:function (el) {
            el.setOpacity(0.3);
        },
        deactivate:function (el) {
            if (el.getOpacity() != 0)el.setOpacity(0);
        }
    },

    trackFunctionsVideo:{
        check:function (el, event) {
            var x = event.pointerX() || event.touches[0].clientX;
            var y = event.pointerY() || event.touches[0].clientY;
            var offset = el.cumulativeOffset();
            x -= offset[0];
            y -= offset[1];
            return ((x > 0 && x < el.clientWidth) && (y > 0 && y < el.clientHeight));
        },
        activate:function (el) {
            el.setStyle({'backgroundPosition':(el.paused) ? 'top right' : 'bottom right'});
        },
        deactivate:function (el) {
            el.setStyle({'backgroundPosition':(el.paused) ? 'top left' : 'bottom left'});
        }
    },
    enableTracking:function (el, trackFunctions) {
        if (!trackFunctions) {
            this.trackFunctionsButton.elModel = this.help.getObjectByCardId(el.id);
            trackFunctions = this.trackFunctionsButton;
        }
        var mouseMoveTrack = this.mouseMoveTracking.bindAsEventListener(this, trackFunctions);
        if (Object.isUndefined(this.trackEvents)) {
            this.trackEvents = (document.ontouchstart === undefined) ? this.mouseEvents : this.touchEvents;
        }
        el.observe(this.trackEvents.start, function (event) {

            if (event.stopped) return;
            if (trackFunctions.check(el, event)) {
                trackFunctions.activate(el);
                this.trackingButton = el;
                document.observe(this.trackEvents.move, mouseMoveTrack);
            }
        }.bind(this));
        document.observe(this.trackEvents.end, function (event) {
            trackFunctions.deactivate(el);
            document.stopObserving(this.trackEvents.move, mouseMoveTrack);
        }.bind(this));
    },

    mouseMoveTracking:function (e, trackFunctions) {
        var el = this.trackingButton;
        if (e.element() != el) {
            trackFunctions.deactivate(el);
            return;
        }
        else if (trackFunctions.check(el, e)) {
            trackFunctions.activate(el);
        }
        else {
            trackFunctions.deactivate(el);
        }
    },

    getCardElement:function (el) {
        var cardId = (Object.isElement($('contPane').firstDescendant().childElements()[1])) ? $('contPane').firstDescendant().childElements()[1].id : $('contPane').firstDescendant().id;
        //alert($('contPane').firstDescendant().childElements()[1].id);
        if (Object.isUndefined(el) || el == null || el.id == 'contPane' ||
            /* do not allow to look for elements above contPane element */
            Object.isUndefined(el.up('#contPane')) ||
            /* do not check main card background */
            el.id == cardId) {
            return null;
        }

        if (el.getAttribute('id') && el.getAttribute('id').include('cardObjects') && !el.getAttribute('id').include('textPane')) {
            return el;
        }

        return this.getCardElement(el.up());

    },

    forwardMouseEvent:function (el) {
        var eventName;
        if (Object.isFunction(el.observe)) {
            eventName = isTouchDevice() ? "touchstart" : "mousedown";
            el.observe(eventName, function (event) {
                var el = event.element(),
                    position;
                if (isTouchDevice() && !!event.touches) {
                    position = [event.touches[0].clientX, event.touches[0].clientY];
                } else {
                    position = [event.pointerX(), event.pointerY()];
                }
                this.makeFMECalculations(el, position, event);
            }.bind(this));
        }
    },

    makeFMECalculations:function (el, position, event) {
        var left = el.style.left;
        el.style.left = '-10000px';
        var underlayingElement = this.getCardElement(document.elementFromPoint(position[0], position[1]));
        el.style.left = left;
        if (underlayingElement == null)return;
        if ($(underlayingElement).readAttribute("passmeevt") == "true") {
            /* TODO fix for stop contenteditable="true", need to reimplement */
            /* check for content editable and selection existance */

            var isEditable = (true == event.target.getAttribute('contenteditable') || !Object.isUndefined(event.target.up('[contenteditable="true"]')) ||
                true == event.target.parentNode.getAttribute('contenteditable'));

            var isSelection = ( window.getSelection && !Prototype.Browser.Gecko && window.getSelection().rangeCount);
            if (!isEditable && !isSelection) {
                event.stop();
                event.preventDefault();

            }
            event.stopPropagation();
            if ($(underlayingElement).hasAttribute('isDraggable')) {
                $(underlayingElement).fire("e:mousedown", {position:position});
            } else {
                event.stop();
                event.preventDefault();
                var isOriginallyFromAction = $(underlayingElement).getAttribute("isfromaction");
                $(underlayingElement).setAttribute("isfromaction", 1);
                /* click on fixed el */
                $(underlayingElement).click();
                /* restore default value */
                if (isOriginallyFromAction == 1) {
                    $(underlayingElement).setAttribute("isfromaction", isOriginallyFromAction);
                } else {
                    $(underlayingElement).removeAttribute("isfromaction");
                }
            }

            return;
        }
        // old variand work bad on iPad, because firstDescendant may be sound, not a card.
        // else if(underlayingElement.id == $('contPane').firstDescendant().childElements()[1].id || underlayingElement.id =='contPane') return;
        // here we check, is underlayingElement are contpane or card background
        else if (/^Img[0-9]+$/.test(underlayingElement.id) || underlayingElement.id == 'contPane') {
            return;
        } else {
            var left = el.style.left;
            el.style.left = '-10000px';
            //el.hide();
            this.makeFMECalculations(underlayingElement, position, event);
            //el.show();
            el.style.left = left;
        }
    },

    template:{
        cardId:function (cId) {
            return new Template('Card#{cardId}').evaluate({cardId:cId});
        },

        newCardElementId:function (cId, eId) {
            return new Template('Card#{cardId}cardObjects#{objectId}').evaluate({cardId:cId, objectId:eId});
        },

        cardActionEventDone:function (eId, priority) {
            return new Template('card#{elementId}action#{actionPriority}:done').evaluate({elementId:eId, actionPriority:priority});
        },

        cardLoadActionEventDone:function (eId, priority) {
            return new Template('card#{elementId}loadAction#{actionPriority}:done').evaluate({elementId:eId, actionPriority:priority});
        },

        cardUnloadActionEventDone:function (eId, priority) {
            return new Template('card#{elementId}unloadAction#{actionPriority}:done').evaluate({elementId:eId, actionPriority:priority});
        },

        cardElementEventDone:function (cId, eId, priority) {
            return new Template('Card#{cardId}cardObjects#{elementId}action#{actionPriority}:done').evaluate({cardId:cId, elementId:eId, actionPriority:priority});
        },

        eventDone:function (eId, priority) {
            return new Template('#{cardId}#{actionPriority}:done').evaluate({elementId:eId, actionPriority:priority});
        },

        /** TODO: this function eval on mousemove over objects, find why and remove */
        cursorStyle:function (val, pointX, pointY) {
            var pointX = parseInt(pointX, 10) || 0,
                pointY = parseInt(pointY, 10) || 0;

            if (!Prototype.Browser.IE && (pointX || pointY)) {
                val = val.replace(")", ") " + pointX + " " + pointY);
            }
            return val.replace("url(", "url(" + prefix);
        }
    },

    playEffect:function (animateFrom, animateTo, effect) {
        try {
            /**if isset animateTo, we'll play
             * goto effect
             * -only for supported effects
             */
            if (animateTo) {
                var duration = (!Object.isUndefined(this.animationDuration)) ? this.animationDuration : 1.5;
                //alert(duration);
                new transitions({
                    currentElement:animateFrom,
                    nextElement:animateTo,
                    effect:effect,
                    durr:duration
                });

                if (!Object.isUndefined(this.moveToFrontObjects[0])) {
                    this.moveToFrontOnPreload(animateFrom, this.moveToFrontObjects);
                }

                return true;
            }
        } catch (err) {
            alert('player.js (playEffect) error: ' + err);
        }
    },

    finalUnload:function (event) {
        try {
            if (!event.stopped) {
                event.stop();
                document.stopObserving();
                this.draggableObjects.each(function (el) {
                    el.destroy();
                });
                delete this.objectsToActivate;
                delete this.trackingButton;
                this.preloadElements = [];
                /**Group objects handling*/
                if (!this.clearChangeFlag) {
                    this.saveGroupObjectsState();
                    this.saveDraggableObjectsState();
                    this.saveTextObjectsState();
                    this.clearChangeFlag = false;
                } else {
                    this.groupObjectsData = {};
                    this.draggableObjectsData = {};
                    this.textObjectsData = {};
                    this.clearChangeFlag = false;
                }
                /**EOF group objects handling*/
                /**AutomaticTimer clearing*/
                this.timerTimeouts.each(function (el) {
                    clearTimeout(el);
                });

                if ((!this.stackWasChanged || Object.isUndefined(this.destinationStack)) && this.where != "HSOpenStackAction") {
                    var animateFrom = $('Card' + cardsCollection.currentElement().id);
                    var animateTo = this.prepareGoto(this.where, this.no, this.effect);
                    if (!animateTo) return;
                    this.playEffect(animateFrom, animateTo, this.effect);
                    this.unloadAlerted = 0;
                }
            }
        } catch (err) {
            console.log(err);
        }
    },
    // Checking, is it allowed to go at some location
    // We need to be sure that animateGoto will work properly when fire cardLeave events (finalUnload) before.
    animateGotoCheck:function (where, no, effect, destinationStack) {
        switch (where) {
            case 'HSGoToLastMarkedCardAction':
                if (cardsCollection.getMarkedCardIndex() === null) {
                    new messageCreate({
                        image:"./data/engine/templates/img/info.png",
                        text:"<b>Cannot perform action</b><br/>You have not visited a marked card yet. To be able to use this action, visit a marked card first, and then try again.",
                        caption:"OK"
                    });
                    return false;
                }
                break;
        }

        return true;
    },

    animateGoto:function (where, no, effect, destinationStack) {
        try {
            this.where = where;
            this.no = no;
            this.effect = effect;
            if (this.where == 'HSOpenStackAction') {
                destinationStack = this.no;
                this.no = 0;
            }

            this.destinationStack = destinationStack;
            if ($('showedImg')) {
                /**fix for iBA card blinking*/
                //document.stopObserving();
                /**EOF*/
                var animateFrom = $('showedImg');
                var animateTo = this.prepareGoto(where, no, effect);
                this.playEffect(animateFrom, animateTo, effect);
            } else {
                var animateFrom = $('Card' + cardsCollection.currentElement().id);
                if (this.where == 'HSGoToSpecificCardAction' && (Object.isUndefined(destinationStack) || destinationStack == '')) {
                    var animateTo = this.prepareGoto(this.where, this.no, this.effect, true);
                    if (!animateTo) return;
                }
                else if (!Object.isUndefined(destinationStack) && destinationStack != '') {

                    setTimeout(function () {
                        this.changeStack(destinationStack, this.effect, false, this.no);
                    }.bind(this), 200);
                }
                if (this.unloadAlerted == 0) {
                    this.unloadAlerted = 1;
                    /**!!! We need to give some time for scripts to handle this right*/
                    setTimeout(function () {
                        document.fire('Card' + cardsCollection.currentElement().id + ':unloaded');
                    }, 200);
                }

            }
            document.observe('Card' + cardsCollection.currentElement().id + ':canUnload', this.finalUnload.bindAsEventListener(this));
        } catch (err) {
            alert('aimateGoto error' + console.log(err));
        }
    },

    prepareGoto:function (where, no, effect, test, destinationStack) {
        try {
            if (Object.isUndefined(test)) test = false;
            if (Object.isUndefined(destinationStack)) destinationStack = false;
            if (effect == 'LString') effect = "HSFadeTransition";

            switch (where) {
                case 'firstCard':
                    this.stackWasChanged = false;
                    cardsCollection.setPointer(0);
                    var newCard = cardsCollection.currentElement();
                    return this.injectCard(newCard, effect);
                    break;
                //anotherCard
                case 'HSGoToSpecificCardAction':
                    if (!Object.isUndefined(cardsCollection.elements()[no]) && !destinationStack) {
                        if (!test) {
                            this.stackWasChanged = false;
                            cardsCollection.setPointer(no);
                            var newCard = cardsCollection.currentElement();
                            return this.injectCard(newCard, effect);
                        }
                        else {
                            return true;
                        }
                    }
                    else if (destinationStack) {

                    }
                    else {
                        new messageCreate({image:"./data/engine/templates/img/info.png", text:"<b>Cannot go to specified card</b><br/>This card has been deleted.", caption:"OK"});
                        return false;
                    }
                    break;

                case 'HSOtherCardAction':
                    if (!Object.isUndefined(cardsCollection.elements()[no])) {
                        if (!test) {
                            this.stackWasChanged = false;
                            cardsCollection.setPointer(no);
                            var newCard = cardsCollection.currentElement();
                            return this.injectCard(newCard, effect);
                        }
                        else {
                            return true;
                        }
                    }
                    else if (destinationStack) {

                    }
                    else {
                        new messageCreate({image:"./data/engine/templates/img/info.png", text:"<b>Cannot go to specified card</b><br/>This card has been deleted.", caption:"OK"});
                        return false;
                    }
                    break;
                //nextCard
                case 'HSNextCardAction':
                    this.stackWasChanged = false;
                    var newCard = cardsCollection.nextElement();
                    return this.injectCard(newCard, effect);
                    break;

                //previous card
                case 'HSPreviousCardAction':
                    this.stackWasChanged = false;
                    var newCard = cardsCollection.prevElement();
                    return this.injectCard(newCard, effect);
                    break;

                //back
                case 'HSBackAction':
                    if (this.stackWasChanged) {
                        this.changeStack(this.lastSeenStackLink, effect, false, this.globalData.HSCardNumber, true);
                    }
                    else {
                        cardsCollection.setPointer(cardsCollection.lastSeenElement().id);
                        var newCard = cardsCollection.currentElement();
                        return this.injectCard(newCard, effect);
                    }
                    break;

                //another stack
                case 'HSOpenStackAction':
                    this.changeStack(no, effect, false, destinationStack);
                    break;

                //home stack
                case 'HSGoToHomeStackAction':
                    this.changeStack(this.homeStackPrefix + 'stack.json', effect, true, no);
                    break;

                case 'HSGoToLastMarkedCardAction':
                    var markedCardIndex = cardsCollection.getMarkedCardIndex();

                    /** TODO remove this: if no marked cards, fire change event on current card
                     * bug(?): if return false, other card change actions do not fire
                     * if marked card is not visited show message(text from HS win version)
                     * NOTICE: it is possible to preload marked card index - check stack.js('push' method)
                     */
                    if (null == markedCardIndex) {
                        //return false;
                        new messageCreate({
                            image:"./data/engine/templates/img/info.png",
                            text:"<b>Cannot perform action</b><br/>You have not visited a marked card yet. To be able to use this action, visit a marked card first, and then try again.",
                            caption:"OK"
                        });
                        markedCardIndex = cardsCollection.getPointer();
                    }

                    this.stackWasChanged = false;
                    cardsCollection.setPointer(markedCardIndex);
                    var newCard = cardsCollection.currentElement();
                    return this.injectCard(newCard, effect);
                    break;

                //default, should be broken before this point
                default:
                    throw new exception('hello');
                    break;
            }

        } catch (err) {
            alert('prepareGoto error:' + console.log(err));
        }
    },

    setTransformation:function (el, model, horizontalFlip, verticalFlip) {
        var scope = {
            el:el,
            model:model,
            getTransformationRule:this.getTransformationRule
        };

        verticalFlip = (verticalFlip == "1") ? -1 : 1;
        horizontalFlip = (horizontalFlip == "1") ? -1 : 1;

        if (!Object.isFunction(el.setStyle)) {
            return;
        }

        if (Object.isUndefined(scope.model)) {
            scope.model = {
                'width':+scope.el.style.width.replace('px', ''),
                'height':+scope.el.style.height.replace('px', ''),
                'angle':'0'
            };
        }

        function transformate(scope, verticalFlip, horizontalFlip) {
            var transformation = [];
            //el.setStyle('visibility: hidden;');
            /* check angle is set */
            if (parseInt(scope.model.angle) != 0) {
                transformation.push("rotate(" + scope.model.angle + "deg)");
            }

            /* get real video proportions */
            if (!Object.isUndefined(scope.el.videoWidth)) {
                if (scope.el.videoWidth != 0) {
                    var dimensions = {'width':scope.el.videoWidth, 'height':scope.el.videoHeight};
                } else {
                    var dimensions = {'width':parseInt(scope.el.style.width.replace('px', '')), 'height':parseInt(scope.el.style.height.replace('px', ''))};
                }
            } else {
                var dimensions = {'width':parseInt(scope.el.style.width.replace('px', '')), 'height':parseInt(scope.el.style.height.replace('px', ''))};
            }
            var xScale = scope.model.width / dimensions.width;
            var yScale = scope.model.height / dimensions.height;
            var origProportions = dimensions.width / dimensions.height;
            var appProportions = scope.model.width / scope.model.height;
            var transform = '';
            scope.el.transform = [xScale, yScale, transformation];
            if (Math.abs(origProportions - appProportions) < 0.02) {
                transformation.push("scale(" + horizontalFlip + "," + verticalFlip + ")");
                /** Do nothing */
            } else {
                scope.el.setStyle('width: ' + dimensions.width + 'px;');
                scope.el.setStyle('height: ' + dimensions.height + 'px;');
                transformation.push("scale(" + horizontalFlip * xScale + "," + verticalFlip * yScale + ")");
            }

            scope.el.setStyle(
                scope.getTransformationRule(transformation)
            );
            var origHeight = parseInt(scope.el.getStyle('height'), 10) || 0;
            var topDelta = parseInt(scope.el.getStyle('top') || 0, 10) - ((origHeight - scope.model.height) / 2);
            scope.el.setStyle('top: ' + topDelta + 'px;');
            var origWidth = parseInt(scope.el.getStyle('width'), 10) || 0;
            var leftDelta = parseInt(scope.el.getStyle('left') || 0, 10) - ((origWidth - scope.model.width) / 2);
            scope.el.setStyle('left: ' + leftDelta + 'px;');
            scope.el.setStyle('visibility: visible;');
        }

        transformate(scope, verticalFlip, horizontalFlip);
    },

    getTransformationRule:function (transformations) {
        if (!Object.isArray(transformations) || transformations.length == 0) {
            return '';
        }
        var transformationString = transformations.join(' ');

        return  "-webkit-transform:" + transformationString + ";" +
            "-moz-transform:" + transformationString + ";" +
            "-ms-transform:" + transformationString + ";" +
            "-o-transform:" + transformationString + ";" +
            "transform:" + transformationString + ";";
    },

    injectCard:function (newCard, effect) {
        try {
            /**construct new object**/
            var cardObject = new Element('div', {id:'Card' + newCard.id,
                style:'position:absolute;left:0px;visibility:hidden;display:block;width:' + this.globalData.stacks[0].xSize + 'px;height:' + this.globalData.stacks[0].ySize + 'px;float:left;overflow:hidden !important;cursor:' + newCard.cursor.replace(/Resources/, prefix + "Resources")});

            var cardPreview = new Element('img', {src:prefix + "Previews/" + newCard.images.preview,
                id:'Preview' + newCard.id,
                style:'display:none;height:' + this.globalData.stacks[0].ySize + 'px;cursor:' + cardObject.style.cursor});

            var cardObjectImage = new Element('img', {src:prefix + "Previews/" + newCard.images.background,
                id:'Img' + newCard.id,
                style:'height:' + this.globalData.stacks[0].ySize + 'px;cursor:' + cardObject.style.cursor});
            cardObjectImage.observe("mousedown", function (e) {
                e.preventDefault();
            });
            cardObject.insert(cardPreview).insert(cardObjectImage);

            /** Add hyper text links on each card*/
            linksObjects.each(function (lObj) {
                if (newCard.objects.indexOf(lObj) == -1) {
                    lObj.isLinkObject = "1";
                    newCard.objects.push(lObj);
                }
            }.bind(this));
            /**EOF*/
            /**Add marked card index*/
            if ("1" == newCard.isMarkedCard) {
                cardsCollection.setMarkedCardIndex();
            }
            /**EOF Add marked card index*/
            for (var j = 0, newCardObj, newCardElement,  l = newCard.objects.length; j < l; j++) {
                newCardObj = newCard.objects[j];
                /**for different objects we'll use different constructors*/
                switch (newCardObj.type) {
                    case "video":
                        newCardElement = this.createVideoElement(newCard, j);
                        cardObject.insert(newCardElement);
                        if (this.help.checkForGroupObjectData(newCard, this, j)) {
                            var style = "top:" + this.groupObjectsData[newCardObj.id].top + ";" +
                                "left:" + this.groupObjectsData[newCardObj.id].left + ";" +
                                "height:" + this.groupObjectsData[newCardObj.id].height + ";" +
                                "width:" + this.groupObjectsData[newCardObj.id].width + ";" +
                                "z-index:" + this.groupObjectsData[newCardObj.id].zIndex + ";";
                            newCardElement.setStyle(style);
                        }

                        if (this.help.checkForDraggableObjectData(newCardObj.id, this)) {
                            this.appendDragableVideoStyle(newCard, this, j, this.template.newCardElementId(newCard.id, newCardObj.id));
                        }

                        /**transform movie dimensions*/
                        newCardElement.modelParams = {
                            width:parseInt(newCardObj.xSize, 10) || 0,
                            height:parseInt(newCardObj.ySize, 10) || 0,
                            angle:newCardObj.rotationAngle || 0
                        };
                        newCardElement.verticalFlip = false;
                        newCardElement.horizontalFlip = false;
                        newCard.objects.each(function (el, num) {
                            if (!Object.isUndefined(el.actions)) {
                                for (var i in el.actions) {
                                    el.actions[i].each(function (elem, numb) {
                                        if (elem.object == newCardObj.id) {
                                            if (!Object.isUndefined(elem.isFlippedHorizontally)) {
                                                newCardElement.verticalFlip = elem.isFlippedVertically;
                                                newCardElement.horizontalFlip = elem.isFlippedHorizontally;
                                            }
                                        }
                                    });
                                }
                            }
                        });

                        this.setTransformation(newCardElement, newCardElement.modelParams, newCardElement.horizontalFlip, newCardElement.verticalFlip);

                        if (false === Object.isUndefined(newCardElement.style)
                            && true === Object.isFunction(newCardElement.setStyle)) {
                            var element = newCardElement;
                            if (newCardObj.isVisible === "1") {
                                if (false === Object.isUndefined(newCardObj.isShowFirstFrame)
                                    && newCardObj.isShowFirstFrame === "0") {
                                    newCardElement.setStyle({
                                        'display':'none',
                                        'visibility':'hidden'
                                    });
                                } else {
                                    newCardElement.setStyle({
                                        'display':'block',
                                        'visibility':'visible'
                                    });
                                }
                            } else {
                                newCardElement.setStyle({
                                    'display':'none',
                                    'visibility':'hidden'
                                });
                            }
                        }

                        if (newCardObj.hasController == 1) {
                            this.createVideoControls(newCardElement);
                        }
                        newCardElement.isVisible = newCardObj.isVisible;
                        /**TODO: handle this*/
                        newCardElement.paused = true;
                        if (!Object.isUndefined(newCardObj.stopOtherMovies)) {
                            newCardElement.stopOtherMovies = newCardObj.stopOtherMovies;
                            newCardElement.stopOtherSounds = newCardObj.stopOtherSounds;
                        }
                        if (newCardObj.movieClicking == 1) {
                            if (Object.isFunction(newCardElement.observe)) {

                                /**Fixing pause event*/
                                var eventName = (newCardObj.isDraggable == "1") ? "draggable:click" : ((isTouchDevice())
                                    ? "touchstart"
                                    : "mousedown");
                                newCardElement.observe(eventName, function (e) {
                                    if (e.element().paused) {
                                        if (isTouchDevice()) {
                                            $$('video').invoke('pause');
                                            if (isNaN(e.element().duration)) {
                                                e.element().load();
                                            }
                                            e.element().isactive = 'isactive';
                                        }

                                        if (!Object.isUndefined(e.element().stopOtherMovies)) {
                                            if (e.element().stopOtherMovies == 1) this.help.stopAllMovies();
                                            if (e.element().stopOtherSounds == 1) this.help.stopAllSounds();
                                        }
                                        e.element().paused = false;
                                        e.element().play();
                                    } else {
                                        e.element().paused = true;
                                        e.element().pause();
                                    }
                                }.bind(this));
                            }
                            //for firefox (flash) video
                            else if (!Object.isFunction(newCardElement.observe)) {
                                /**Fixing pause event*/
                                //lak:no onend vidio method this.help.observeAfterCardLoaded(cardsCollection.currentElement().id, this.template.newCardElementId(newCard.id, newCardObj.id), "ended", onVideoEnd);
                                /**EOF*/

                                this.help.observeAfterCardLoaded(cardsCollection.currentElement().id, this.template.newCardElementId(newCard.id, newCardObj.id), "mousedown", function (e) {
                                    if (e.element().paused) {
                                        if (!Object.isUndefined(e.element().stopOtherMovies)) {
                                            if (e.element().stopOtherMovies == 1) {
                                                this.help.stopAllMovies();
                                            }
                                            if (e.element().stopOtherSounds == 1) {
                                                this.help.stopAllSounds();
                                            }
                                        }
                                        e.element().play();
                                    } else {
                                        e.element().pause();
                                    }
                                }.bind(this), this);
                            }
                        }

                        if ((!newCardObj.actions || Object.isUndefined(newCardObj.actions.click)) && Object.isFunction(newCardElement.observe)) {
                            newCardElement.observe("click", function (e) {
                                e.stop();
                            });
                        }
                        break;

                    case "imageSequence":
                        newCardElement = new Element("img",
                            {src:prefix + newCardObj.frames[0].src,
                                id:this.template.newCardElementId(newCard.id, newCardObj.id),
                                style:'position:absolute;z-index:5;display:none;top:' + newCardObj.yCoord + 'px;left:' + newCardObj.xCoord + 'px;height:' + newCardObj.ySize + 'px;width:' + newCardObj.xSize + 'px;'});
                        newCardElement.verticalFlip = 0;
                        newCardElement.horizontalFlip = 0;
                        newCardElement.modelParams = {
                            width:newCardObj.xSize,
                            height:newCardObj.ySize,
                            angle:newCardObj.rotationAngle
                        };
                        newCard.objects.each(function (el, num) {
                            if (!Object.isUndefined(el.actions)) {
                                for (var i in el.actions) {
                                    el.actions[i].each(function (elem, numb) {
                                        if (elem.object == newCardObj.id) {
                                            if (!Object.isUndefined(elem.isFlippedHorizontally)) {
                                                newCardElement.verticalFlip = elem.isFlippedVertically;
                                                newCardElement.horizontalFlip = elem.isFlippedHorizontally;
                                            }
                                        }
                                    });
                                }
                            }
                        });
                        newCardElement.setStyle('visibility: hidden;');
                        this.setTransformation(newCardElement, newCardElement.modelParams, newCardElement.horizontalFlip, newCardElement.verticalFlip);

                        cardObject.insert(newCardElement);
                        if (newCardObj.isVisible != 0)newCardElement.show();
                        var itemObjectActions = new Action.playSequenceAnimation({
                            imgElement:newCardElement,
                            imagesTemplate:newCardObj.frames,
                            info:newCardObj,
                            fps:newCardObj.fps/*,
                             imagesCount: newCardObj.imagesCount*/
                        });
                        cardObject.insert(newCardElement);

                        Object.extend(newCardElement, itemObjectActions);
                        if (newCardObj.isVisible == 0) newCardElement.hide();
                        break;

                    case "sound":
                        newCardElement = createElements.sound(newCard, j, this);

                        if (cardObject.select('#' + newCardElement.id).length == 0) {  // no element with same id
                            if (this.mobileSafariMedia[newCardElement.id] === undefined) {  // element not cached by mobileSafariMedia
                                cardObject.insert(newCardElement);
                            }
                        }
                        break;

                    case "img":
                        newCardElement = new Element(newCardObj.type,
                            {src:prefix + newCardObj.src,
                                id:this.template.newCardElementId(newCard.id, j),
                                style:'position:absolute;z-index:' + this.help.getZIndexValue(parseFloat(newCardObj.order)) + ';display:none;top:' + newCardObj.yCoord + 'px;left:' + newCardObj.xCoord + 'px;height:' + newCardObj.ySize + 'px;width:' + newCardObj.xSize + 'px;'});

                        if (newCardObj.rotationAngle != 0) {
                            newCardElement.setStyle("-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                                "-moz-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);");
                        }

                        cardObject.insert(newCardElement);
                        if (newCardObj.isVisible != 0) newCardElement.appear();

                        break;
                    case "image":

                        var isHighlighted = newCardObj.shapeFile && newCardObj.isHighlight == 1 && newCardObj.isNoClick != 1;

                        if (isHighlighted) {
                            newCardElement = createElements.image(newCard, j, this, '_image');
                        } else {
                            newCardElement = createElements.image(newCard, j, this);
                        }

                        cardObject.insert(newCardElement);

                        /** Images preloading*/
                        this.preloadElements.push(newCardElement.src);

                        if (isHighlighted) {
                            var butImage = newCardElement;
                            newCardElement= createElements.shape(newCard, j, this);
                            newCardElement.butImage = butImage;
                            cardObject.insert(newCardElement);
                            this.help.drawShape(newCardElement, newCardObj);
                            this.help.changeCursor(newCardElement, newCardObj);
                            this.enableTracking(newCardElement);
                        }

                        break;
                    case "button":
                        newCardElement = createElements.button(newCard, j, this);
                        cardObject.insert(newCardElement);
                        this.help.drawShape(newCardElement, newCardObj);
                        this.help.changeCursor(newCardElement, newCardObj);
                        if (!!newCardObj.shapeFile && newCardObj.isHighlight == 1 && newCardObj.isDropOffOnly != 1 && newCardObj.isNoClick != 1) {
                            this.enableTracking(newCardElement); // Highligh
                        }
                        if (newCardObj.src != '') {
                            var butImage = newCardElement.butImage = createElements.src(newCard, j, this);
                            cardObject.insert(butImage);
                        }

                        break;
                    case "text":
                        newCardElement = createElements.text(newCard, j, this);
                        var textPane = new Element("div", {id:newCardElement.id + 'textPane',
                            style:"z-index:auto;text-align:left;"});
                        if (!Object.isUndefined(newCardObj.textImage) && newCardObj.textImage != '') {
                            cardObject.insert(newCardElement.insert(textPane.update(new Element("img", {src:prefix + newCardObj.textImage}))));
                            textPane.setStyle("overflow:visible;");
                        } else {
                            //textPane.setStyle("margin: 0 6px 0 5px;");
                            textPane.setStyle("margin: 0 0 0 0;");
                            if (this.help.checkForTextObjectData(newCard, this, j)) {
                                var text = this.help.getTextObjectData(newCard, this, j);
                            } else {
                                var text = newCardObj.text;
                            }
                            cardObject.insert(newCardElement.insert(textPane.update(text)));
                        }

                        if (!Object.isUndefined(newCardObj.background))    newCardElement.setStyle("background:url(" + prefix + newCardObj.background + ") repeat;");
                        if (newCardObj.isVisible != 0) newCardElement.show();

                        if (newCardObj.isReadOnly == '0') {
                            textPane.setAttribute("contenteditable", "true");
                            textPane.setAttribute("spellcheck", "false");
                            textPane.setStyle("-moz-user-select: text;-moz-user-modify: read-write;" +
                                "-o-user-select: text;-khtml-user-select: text;" +
                                "-webkit-user-select: text;" +
                                "line-height:inherit;");
                            this.help.fixEditableText(textPane);
                            this.help.normalizeFonts(textPane);
                            if (newCardObj.cursor == 'pointer') {
                                textPane.setStyle("cursor: text;");
                            }
                        } else {
                            this.help.normalizeFonts(textPane);
                        }
                        var textAlignProperty = "";

                        textPane.childElements().each(function (el) {
                            /**NEXT IE FIX FOR text-shadow*/
                            if (Prototype.Browser.IE) {

                                if (Object.isArray(newCardObj.text.match(/text-shadow:(.*)/i)) && !Object.isUndefined(newCardObj.text.match(/text-shadow:(.*)/i)[1])) {
                                    var str = newCardObj.text.match(/text-shadow:(.*)/i)[1];
                                    var ch = str.indexOf(";");

                                    if (!Object.isUndefined(str.substr(0, ch))) {
                                        var shadowarray = str.substr(0, ch).split(" ");
                                        var sradi = parseInt(shadowarray[3], 10);

                                        var padding = {
                                            left:parseInt(el.getStyle("padding-left"), 10),
                                            top:parseInt(el.getStyle("padding-top"), 10)
                                        };

                                        var options = {
                                            color:shadowarray[0],
                                            radius:sradi,
                                            xoffset:parseInt(shadowarray[1], 10) - 1 + (padding.left - sradi) + "px",
                                            yoffset:parseInt(shadowarray[2], 10) - 1 + (padding.top - sradi) + "px",
                                            opacity:50
                                        };

                                        options.color = (options.color.length == 4) ? options.color.replace(/#([0-9A-f])([0-9A-f])([0-9A-f])/i, '#$1$1$2$2$3$3') : options.color;
                                        //var filtertext = "progid:DXImageTransform.Microsoft.Glow(Color="+options.color+",Strength="+(options.radius/6)+") progid:DXImageTransform.Microsoft.Blur(pixelradius="+options.radius+", enabled='true') progid:DXImageTransform.Microsoft.Alpha(opacity="+options.opacity+")";
                                        // var filtertext = "progid:DXImageTransform.Microsoft.DropShadow(OffX="+shadowarray[1]+", OffY="+shadowarray[2]+", Color=#cccccc)  progid:DXImageTransform.Microsoft.Blur(pixelradius=1, enabled='true')";

                                        el.setStyle({"position":"relative", "zoom":"1"});
                                        el.setStyle({
                                            "position":"absolute",
                                            "z-index":"-1",
                                            "zoom":"1",
                                            "left":options.xoffset,
                                            "top":options.yoffset,
                                            "color":options.color//,
                                            //"filter":filtertext,
                                            //"-ms-filter":filtertext
                                        });

                                    }
                                }
                            }
                            /**EOF*/

                            if (el.tagName.toLowerCase() == "br") return;
                            if (textAlignProperty != el.style.textAlign && !(el.childNodes.length == 1 && (el.childElements()[0]) && el.childElements()[0].tagName.toLowerCase() == "br")) {
                                if (!Object.isUndefined(el.previous()) && el.previous().tagName.toLowerCase() == "br") {
                                    el.parentNode.removeChild(el.previous());
                                    return;
                                }

                                textAlignProperty = el.style.textAlign;
                                el.parentNode.insertBefore(new Element("div", {style:"height:0px;overflow:hidden;line-height:1px;width:100%;"}), el);
                                //el.parentNode.style.textAlign = el.style.textAlign;

                            } else if (el.childNodes.length == 1 && (el.childNodes[0].tagName) && el.childNodes[0].tagName.toLowerCase() == "br") {
                                textAlignProperty = "";
                                el.style.width = "";
                                var prev = $(el).previous();
                                if (!Object.isUndefined(prev) && !Object.isUndefined(prev.style))prev.style.width = "100%";
                                if (!Object.isUndefined(prev) && prev.childNodes.length > 1)el.style.width = "100%";

                            } else {
                                el.style.width = "";
                                var prev = $(el).previous();
                                if (!Object.isUndefined(prev) && !Object.isUndefined(prev.style))prev.style.width = "";
                            }

                            if (el.style.textAlign == "justify") {
                                el.style.wordSpacing = "3px";
                                el.style.whiteSpace = "pre-line";
                            }

                            if (newCardObj.isReadOnly == '0') {
                                el.setStyle(
                                    "-moz-user-select: text; " +
                                        "-moz-user-modify: read-write;" +
                                        "-webkit-user-select: text;" +
                                        "-khtml-user-select: text;" +
                                        "-o-user-select: text;");
                            }
                        }.bind(this));

                        if (newCardObj.drawScrollBar != '1') {
                            if (isTouchDevice()) {
                                newCardElement.setStyle("-webkit-overflow-scrolling: auto;");  // allow to scroll but don't show scrollbar
                            }
                            newCardElement.setStyle("overflow:visible;");// fix X2IBA-1363

                        }

                        if (parseInt(newCardObj.rotationAngle) != 0) {
                            newCardElement.setStyle("-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                                "-moz-transform:rotate(" + (newCardObj.rotationAngle) + "deg);" +
                                "-ms-transform:rotate(" + (newCardObj.rotationAngle) + "deg);" +
                                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);");
                        }

                        var someChildHasProperties = $A(textPane.childNodes).find(function (el) {
                            if (el !== undefined && el.hasOwnProperty("style")) {
                                return (el.style.font || el.style.fontFamily || el.style.fontStyle || el.style.fontWeight);
                            }
                        });
                        // nobody inherit our style properties, so we can copy lastChild style, without any visual difference
                        if (someChildHasProperties) {
                            var lastChild = textPane.childNodes[textPane.childNodes.length - 1];
                            if (Object.isElement(lastChild)) {
                                [textPane, newCardElement].invoke(
                                    'setStyle', {
                                        'font-family':lastChild.style.fontFamily,
                                        'font-style':lastChild.style.fontStyle,
                                        'font-weight':lastChild.style.fontWeight,
                                        'font-size':lastChild.style.fontSize,
                                        'font':lastChild.style.font
                                    });
                            }
                        }

                        if (newCardObj.isVisible != 0) newCardElement.show();
                        newCardElement.observe("click", function (e) {
                            e.stopPropagation();
                        });
                        if (newCardObj.isScrollable === "0") {
                            textPane.observe("keydown", function (e) {
                                var charCode = (e.which) ? e.which : e.keyCode;
                                if ([play.help.getKeyCode("up"), play.help.getKeyCode("down"), play.help.getKeyCode("left"), play.help.getKeyCode("right")].indexOf(charCode) != -1) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    e.stop();
                                    return false;
                                }
                                var el = e.element();
                                el.scrollTop = 0;
                                el.parentNode.scrollTop = 0;
                            });
                            if (newCardObj.isScrollable === "0") {
                                textPane.observe("touchstart", function (event) {
                                    event.preventDefault();
                                });
                            }

                        }
                        break;
                    case "youtube":
                        newCardElement = createElements.youtube(newCard, j, this);
                        cardObject.insert(newCardElement);
                        if (newCardObj.isVisible != 0) newCardElement.show();
                        break;

                    default:
                        break;

                }

                if(newCardObj.isDropOffOnly === "1" && newCardObj.isVisible === "0"){
                    newCardElement.style.visibility = "hidden";
                    newCardElement.style.display = "block";
                }

                if (newCardObj.isDraggable == 1) {
                    var curId = this.template.newCardElementId(newCard.id, newCardObj.id)
                        , dragOptions = {};

                    if (!!newCardObj.actions && !!newCardObj.actions.click && newCardObj.actions.click.length > 0) {
                        dragOptions.manualDropOff = true;
                    }

                    var playSnapSoundFunc;

                    var changeCanvas = function(e){
                        var drag = e.element;
                        var butImage = drag.butImage;

                        butImage.style.left = drag.style.left;
                        butImage.style.top = drag.style.top;
                    };
                    var changeSnapping = function(e){
                        var drag = e.element
                            ,target = drag.snapTarget;

                        if (!target) {
                            target = $(play.template.newCardElementId(cardsCollection.currentElement().id, drag.snapping.target));
                            drag.snapTarget = target;
                        }

                        var dragPosition = {top:parseInt(drag.style.top), left:parseInt(drag.style.left)}
                            , targetPosition = {top:parseInt(target.style.top), left:parseInt(target.style.left)};

                        drag.aboveTarget = false;

                        if ((Math.abs(Math.abs(dragPosition.top) - Math.abs(targetPosition.top)) < drag.snapping.delta)
                            && (Math.abs(Math.abs(dragPosition.left) - Math.abs(targetPosition.left)) < drag.snapping.delta)) {
                            drag.style.left = target.style.left;
                            drag.style.top = target.style.top;
                            drag.aboveTarget = true;
                            // fix bug X2IBA-1264 begin
                            if (!!playSnapSoundFunc) {
                                $('Card' + cardsCollection.currentElement().id + 'cardObjects' + drag.snapping.target).fire("event:stopDroppedSound");
                                playSnapSoundFunc(drag.snapping.rewardSound);
                                playSnapSoundFunc = null;
                            }
                            // fix bug X2IBA-1264 end
                            if (isTouchDevice()) {
                                drag.setOpacity(0.99);
                                setTimeout(function () {
                                    drag.setOpacity(1);
                                }.bind(this), 100);
                            }
                        } else {
                            playSnapSoundFunc = this.playSnapSound;	// fix bug X2IBA-1264
                        }
                    }

                    //-- Canvas
                    var canvasChangeHandler = function(e){
                        changeCanvas(e);
                    };
                    var canvasChangeSnappingHandler = function(e){
                        changeSnapping(e);
                        changeCanvas(e);
                    };

                    //--  Handler
                    //dragOptions.onStart = function(e){ };
                    dragOptions.change = function(e){ };
                    dragOptions.onEnd = function(e, event){
                        var draggableElement = e.element;
                        var htmlObjects = play.help.getElementsFromPointWithSnapping(event);
                        htmlObjects.forEach(function (el) {
                            var object = play.help.getObjectByCardId(el.id);
                            if(object.id != draggableElement.id && object.isDropOffOnly === "1" && object.isVisible === "1"){
                                $(play.template.newCardElementId(cardsCollection.currentElement().id, object.id)).fire("element:dropOff");
                            }
                        });
                    }

                    //--  Snapping
                    var changeSnappingHandler = function(e){
                        changeSnapping(e);
                    }.bind(this);
                    var endSnappingHandler = function(e, event){
                        var draggableElement = e.element;
                        var htmlObjects = this.help.getElementsFromPointWithSnapping(event);
                        var objects = htmlObjects.map(function (element) {
                            return play.help.getObjectByCardId(element.id);
                        }).select(function (element) {
                                return element.id != draggableElement.id && element.isDropOffOnly === "1";
                            });

                        if (draggableElement.snapping) {
                            if(!draggableElement.snapping.delta || draggableElement.snapping.delta === "0"){
                                draggableElement.aboveTarget = true;
                            }

                            var snapTarget = objects.find(function (element) {
                                return element.id == draggableElement.snapping.target && !!draggableElement.aboveTarget;
                            });

                            if (snapTarget) {
                                $(play.template.newCardElementId(cardsCollection.currentElement().id, snapTarget.id)).fire("element:dropOff");
                            } else {

                                var noSnapObjects = objects.select(function (element) {
                                    return element.id != draggableElement.snapping.target && element.isVisible === "1";
                                });

                                noSnapObjects.forEach(function (object) {
                                    $(play.template.newCardElementId(cardsCollection.currentElement().id, object.id)).fire("element:dropOff");
                                });
                            }
                        }
                        $(draggableElement.id).fire("element:dropOff");
                    }.bind(this);

                    var isCanvasHasImage = newCardElement.tagName.toLowerCase() === 'canvas' && Object.isElement(newCardElement.butImage);

                    if(isCanvasHasImage){
                        dragOptions.change = canvasChangeHandler;
                    }

                    if (!!newCardObj.snapping) {
                        newCardElement.snapping = newCardObj.snapping;

                        dragOptions.change = changeSnappingHandler;
                        dragOptions.onEnd = endSnappingHandler;
                    }

                    if(!!newCardObj.snapping && isCanvasHasImage) {
                        dragOptions.change = canvasChangeSnappingHandler;
                    }

                    this.makeElementDraggable(curId, dragOptions);

                } else {
                    if (newCardObj.type != "video" && newCardObj.type != "sound"){
                        if(!newCardObj.actions || !newCardObj.actions.click || !newCardObj.actions.click.length
                            || (newCardObj.isDropOffOnly === "1" && newCardObj.isVisible === "1")) {
                            this.forwardMouseEvent(newCardElement);
                        }
                    }
                }

                if ((!!newCardObj.actions && !!newCardObj.actions.click && newCardObj.actions.click.length > 0) || newCardObj.type === "video") {
                    $(newCardElement).setAttribute("passmeevt", "true");
                }

                if (Object.isFunction(newCardElement.observe) && newCardElement.tagName.toLowerCase() !== "video") {
                    if (newCardObj.type != "text" && newCardObj.type != "video") {
                        newCardElement.observe("mousedown", function (e) {
                            e.preventDefault();
                            e.stop();
                            return false;
                        });
                    }
                }

                if (newCardObj.isLinkObject == "1") {
                    newCardElement.hide();
                }
            }

            new imgPreloader({images:this.preloadElements});

            /**Move to front objects, that was moved to front from another cards*/
            if (!!this.moveToFrontObjects[0]) {
                this.moveToFrontOnPreload(cardObject, this.moveToFrontObjects);
            }
            /**EOF*/
            $('contPane').insert(cardObject);
            this.saveGroupObjectsState();
            this.saveDraggableObjectsState();
            /**EOF**/

            if (isTouchDevice()) {
                if(this.help.isNeedMobileMediaActivation(newCard)){ //return true in isset movie or sound in newCard.actions.arrive or newCard.actions.timer actions
                    this.mobileMediaActivation = function(){
                        new playButtonMessage({
                            okCallback:function () {
                                document.fire('Card' + cardsCollection.currentElement().id + ':loaded');
                            }.bind(this)
                        });
                        delete this.mobileMediaActivation;
                        this.suspendEventLoadCard = true;
                    }
                }
            }

            /**Adding event listeners*/
            document.observe('Card' + cardsCollection.currentElement().id + ':loaded', function (e) {

                if(Object.isFunction(this.mobileMediaActivation)){
                    this.mobileMediaActivation();
                }

                if(this.suspendEventLoadCard){
                    console.log("Suspend observe card :loaded");
                    this.suspendEventLoadCard = false;
                    return false;
                }

                /** restore slideShow after card change */
                if (this.slideShowObserver && !Object.isString(this.slideShowObserver)) {
                    this.slideShowObserver.run();
                }
                // fix for Mobile Safari bug
                $$("video").each(function (e) {
                    e.style.position = "absolute";
                })
                /** EOF */
                /** wrap matched text in hypertext format */
                this.hypertextObserver.createElementsOnCardInject();
                this.hypertextObserver.run();
                /**EOF*/

                var clickTouchstart = (document.ontouchstart === undefined) ? 'click' : 'touchstart';

                this.eventObserver(newCard, cardObject, clickTouchstart);

                for (var i = 0, obj, objId; i < newCard.objects.length; i++) {

                    obj = newCard.objects[i];

                    if (!obj.actions) {
                        continue;
                    }

                    objId = 'Card' + newCard.id + 'cardObjects' + obj.id;

                    if (obj.isDropOffOnly != 1 && obj.isNoClick != 1) {
                        if (obj.isDraggable == '1') {
                            this.elementEventObserver(obj, $(objId), 'drag:endDragging');
                            continue;
                        }
                        this.elementEventObserver(obj, $(objId), clickTouchstart);
                        continue;
                    }
                    if (obj.isNoClick == 1) {
                        this.elementEventObserver(obj, $(objId), 'mouseenter');
                        this.elementEventObserver(obj, $(objId), objId + ':mouseenter');
                        if (obj.isDraggable == '1') {
                            $(objId).observe('click', Droppables.runDelayedDropOffs);
                        }
                        continue;
                    }
                    this.elementEventObserver(obj, $(objId), 'element:dropOff');
                }

                /**Mobile safari hack, media activation*/
                if (isTouchDevice()) {
                    if (!Object.isUndefined(this.objectsToActivate) && this.objectsToActivate.length > 0) {
                        this.objectsToActivate.each(function (obj) {
                            if (obj.readyState == 0) {
                                obj.load();
                            }
                        }, this);
                    }
                    /**FIXING MOVIE FIRSTFRAME*/
                    /*if(!Object.isUndefined(obj.currentTime)){
                     obj.poster = posterFrame;
                     obj.currentTime=0.1;
                     }*/
                }
                /**EOF mobile safari fix*/
                /**EOF*/
            }.bind(this));

            return cardObject;
        } catch (err) {
            if (this.options.test) {
                alert('injectCard error:' + err + console.log(err));
            } else {
                new messageCreate({image:"./data/engine/templates/img/info.png", text:"Resource not found, please ensure all resources were exported!", caption:"OK"});
            }
            //new Action.playShowMessage({text:"Resource not found, please ensure all resources were exported."}); 
        }
    },

    playSnapSound:function (rewardSound) {
        $('Card' + cardsCollection.currentElement().id).fire("event:dropObject"); // fix bug X2IBA-1405

        var snd = new Element("audio", {src:(prefix + rewardSound), style:"z-index:0;"});
        if (isTouchDevice()) {
            snd.play(); // I don't know why "canplaythrough" event is not dispatched on iPad... guys, fogive me:)
        } else {
            snd.observe("canplaythrough", function (e) {
                e.element().play();
            });
        }

        ["event:dropObject", "event:stopDroppedSound"].each(function (event) {
            $(document).observe(event, function (e) {
                switch (event) {
                    case "event:dropObject"         :
                    {
                        //snd.pause(); fix bug X2IBA-1697
                        break;
                    }
                    case "event:stopDroppedSound"   :
                    {
                        $$("audio").each(function (el) {
                            el.pause();
                        });
                        break;
                    }
                }
            });
        }, this);

        ["paused", "stopped"].each(function (event) {
            snd.observe(event, function (e) {
                var element = e.element();
                element.parentNode.removeChild(element);
            });
        }, this);
    },

    testSnappedObjectDrop:function (drag, dragPosition, targetPosition, rewardSound) {
        try {
            if ((Math.abs(Math.abs(dragPosition.top) - Math.abs(targetPosition.top)) < drag.snapping.delta)
                && (Math.abs(Math.abs(dragPosition.left) - Math.abs(targetPosition.left)) < drag.snapping.delta)) {
                var snd = new Element("audio", {src:(prefix + rewardSound), style:"z-index:0;"});

                snd.observe("canplaythrough", function (e) {
                    e.element().play();
                });

                ["paused", "stopped"].each(function (event) {
                    snd.observe(event, function (e) {
                        var element = e.element();
                        element.parentNode.removeChild(element);
                    });
                }, this);
            }
        } catch (e) {
            if (this.options.test) {
                console.log(e);
            }
        }
    },

    eventObserver:function (newCard, cardObject, event) {
        try {
            var cardClkTimerEvents = []
                , cardClk = []
                , cardLoad = []
                , cardUnload = [];

            if (newCard.actions) {
                if (!Object.isUndefined(newCard.actions.click) && Object.isArray(newCard.actions.click)) {
                    newCard.actions.click.each(function (act) {
                        if (Object.isString(act)) {
                            typE = act;
                        } else if (!Object.isFunction(act) && !Object.isString(act)) {
                            act.creator = "cardClick";

                            if (!Object.isUndefined(newCard['timer'])) {
                                var timerAct = {};
                                Object.extend(timerAct, act);
                                timerAct.timer = newCard['timer'];
                                cardClkTimerEvents.push(timerAct);
                            }

                            cardClk.push(act);
                            /**Mobile safari hack, media activation*/
                            if (isTouchDevice()) {
                                var elementObject = $('Card' + cardsCollection.currentElement().id);

                                if (act.type == "HSPlayMovieAction") {
                                    var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, act.movies[0].object));

                                    elementObject.observe(event, function () {
                                        if (Object.isUndefined(obj.isactive) || obj.isactive != "isactive") {
                                            obj.isactive = "isactive";
                                        }
                                        if (obj.readyState == 0) {
                                            obj.load();
                                        }
                                    }.bind(this));
                                }

                                if (act.type == "HSPlaySoundAction") {
                                    var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, act.sounds[0].object));
                                    elementObject.observe(event, function () {
                                        if (obj !== null) {
                                            if (Object.isUndefined(obj.isactive) || obj.isactive != "isactive") {
                                                obj.isactive = "isactive";
                                            }
                                            if (obj.readyState == 0) {
                                                obj.load();
                                            }

                                        }
                                    }.bind(this));
                                }

                                //this.mobileSafariGetMediaFromAction(act, 1);
                            }
                            /**EOF mobile safari fix*/
                        }
                    }, this);
                }
                if (!Object.isUndefined(newCard.actions.arrive) && Object.isArray(newCard.actions.arrive)) {
                    newCard.actions.arrive.each(function (act) {
                        if (!Object.isFunction(act) && !Object.isString(act)) {
                            act.creator = "cardLoad";
                            if (!Object.isUndefined(newCard['arrive-timer'])) {
                                act.automaticTimer = newCard['arrive-timer'];
                            }
                            cardLoad.push(act);
                            /**Mobile safari hack, media activation*/
                            if (isTouchDevice()) {
                                this.mobileSafariGetMediaFromAction(act, 0);
                            }
                            /**EOF*/
                            var browser = new browserDetect();
                            if(browser.browserName === 'Safari' && !isTouchDevice() && act.type === "HSPlayMovieAction"){ // fix X2IBA-2238
                                $('Img' + newCard.id).style.zIndex = 'auto';
                            }
                        }
                    }, this);
                }

                if (!Object.isUndefined(newCard.actions.leave) && Object.isArray(newCard.actions.leave)) {
                    newCard.actions.leave.each(function (act) {
                        if (!Object.isFunction(act) && !Object.isString(act)) {
                            act.creator = "cardUnload";
                            cardUnload.push(act);
                            /**Mobile safari hack, media activation*/
                            /*if(isTouchDevice()){
                             this.mobileSafariGetMediaFromAction(act,1);
                             }*/
                            /**EOF*/
                        }
                    }, this);
                }
            }

            /**click events*/
            cardObject.observe('click', function (e) {
                if (!Object.isUndefined(e.target) && e.target.readAttribute('isdraggable') == 'true')return;
                if (!Object.isUndefined(e.detail) && e.detail == 1) {  // don't react on double/tiple clicks
                    this.setEffectsChain(cardsCollection.currentElement(), cardClk);
                }
            }.bind(this));
            cardObject.observe(cardObject.id + ':clickFake', function (e) {
                if (!Object.isUndefined(e.detail) && e.detail == 1) {  // don't react on double/tiple clicks
                    this.setEffectsChain(cardsCollection.currentElement(), cardClk);
                }
            }.bind(this));
            /**eof*/

            /**Load events*/
            if(/Android/.test(navigator.userAgent)){ // fixed arrive media X2IBA-2725
                this.setEffectsChain(cardsCollection.currentElement(), cardClkTimerEvents);
                this.setLoadEffectsChain(cardsCollection.currentElement(), cardLoad);
            } else {
                setTimeout(function () {
                    this.setEffectsChain(cardsCollection.currentElement(), cardClkTimerEvents);
                    this.setLoadEffectsChain(cardsCollection.currentElement(), cardLoad);
                }.bind(this), 500);
            }
            /**eof*/

            /**unLoad events*/
            document.observe('Card' + cardsCollection.currentElement().id + ':unloaded', function (e) {
                this.setUnloadEffectsChain(cardsCollection.currentElement(), cardUnload);
            }.bind(this));
            /**EOF*/
        } catch (err) {
            alert('player.js (eventObserver) error:' + console.log(err));
        }
    },

    elementEventObserver:function (newCard, elementObject, event) {
        try {
            /**If there's no actions, we'll break this method*/
            if (Object.isUndefined(newCard.actions)
                || Object.isUndefined(newCard.actions.click)
                || newCard.actions.click.length == 0) {
                return;
            }

            var elClk = []
                , elId = elementObject.id;
            newCard.actions.click.each(function (act) {
                if (!Object.isFunction(act) && !Object.isString(act)) {
                    act.creator = (elId != null) ? elId : "unknown";
                    elClk.push(act);
                    /**Mobile safari hack, media activation*/
                    if (isTouchDevice()) {
                        var needToStop = Object.isUndefined(newCard.timer) ? 1 : 0;
                        var obj;
                        if (act.type == "HSPlayMovieAction") {
                            obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, act.movies[0].object));
                        } else if (act.type == "HSPlaySoundAction" && !act.stopAllSounds && (act.soundsToStop === undefined || act.soundsToStop.length == 0)) {
                            obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, act.sounds[0].object));
                            //obj = $(act.sounds[0].object);
                        } else if (act.type == "HSAnimationAction") {
                            obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, act.object));
                        }
                        this.mobileSafariGetMediaFromAction(act, needToStop);

                        if (obj && obj.load && obj.play) {

                            elementObject.observe("element:dropOff", function (e) {
                                if (obj.tagName == "AUDIO" || obj.tagName == "VIDEO") {
                                    if (obj.readyState == 0) {
                                        e.target.triggerEvent("touchstart");
                                    }
                                }
                            }.bind(this));
                            elementObject.observe("click", function (e) {
                                if (obj.tagName == "AUDIO" || obj.tagName == "VIDEO") {
                                    if (obj.readyState == 0) {
                                        e.target.triggerEvent("touchstart");
                                    }
                                }
                            }.bind(this));
                            elementObject.observe("touchstart", function (e) {
                                if (obj.tagName == "AUDIO" || obj.tagName == "VIDEO") {
                                    if (obj.readyState == 0) {
                                        obj.load();
                                    }
                                }
                            }.bind(this));

                            obj.isactive = "isactive";
                        }
                    }
                    /**EOF mobile safari fix*/
                }
            }.bind(this));
            if (!Object.isUndefined(newCard.timer)) {
                this.setElementsEffectsChain(elementObject, elClk, newCard);
            }
            if (elementObject.tagName.toLowerCase() == 'video' && isTouchDevice()) {
                elementObject.observe(event, function (event) {
                    this.setElementsEffectsChain(elementObject, elClk);
                    event.stop();
                    event.stopPropagation();
                    event.preventDefault();
                }.bind(this));
                /**INTERRUPTING THE PROGRAM FROM HERE*/
                return;
            }

            elementObject.observe(event, function (event) {
                elementObject.fire("event:dropObject");
                if (['', 'object'].include(event.element().tagName.toLowerCase())) {
                    event.stop();
                }

                /**Checking if the opacity object was clicked on non-opacity area*/
                if (elementObject.tagName.toLowerCase() == 'canvas') {
                    if (newCard.isDropOffOnly == 1 || elementObject.readAttribute("isfromaction") == 1 || this.help.checkIfShapeClicked(elementObject, event)) {
                        this.setElementsEffectsChain(elementObject, elClk);
                    } else {
                        var elements = this.help.getElementsFromPoint(event);
                        var found = false;
                        for (var i = 0; i < elements.length; i++) {
                            var elementModel = this.help.getObjectByCardId(elements[i].id);
                            this.setElementsEffectsChain(elementObject, elClk);
                            found = true;
                        }

                        if (!found) {
                            elementObject.up().fire(elementObject.up().id + ':clickFake');
                        }
                    }
                } else {
                    this.setElementsEffectsChain(elementObject, elClk);
                }
                if (isTouchDevice()&& newCard.type == "text" && newCard.isScrollable == "1") {
                    $(event.currentTarget.id + 'textPane').focus();
                }

                event.stop();
                event.stopPropagation();
                event.preventDefault();
            }.bind(this));
        } catch (err) {
            alert('player.js (elementEventObserver) error:' + err + console.log(err));
        }
    },

    /**
     * This function detects which action should be played
     * and delegates playing that action to proper object
     */
    bfx:function (event, objA, actions, element, eventType) {
        try {
            var gt = 'goto';
            if (!Object.isUndefined(objA.effect)) {
                //if(!Object.isUndefined(objA.creator)&&Object.isElement($(objA.creator)))$(objA.creator).stopObserving();
                if (Object.isUndefined(objA.cardNum))objA.cardNum = 0;
                if (!objA[gt]) objA[gt] = objA.type;
                if (!Object.isUndefined(objA.duration)) play.animationDuration = objA.duration;
                if (this.animateGotoCheck(objA.type, objA[gt], objA.effect, objA.destinationStack)) {
                    if (!Object.isUndefined(objA.creator) && Object.isElement($(objA.creator))) {
                        $(objA.creator).stopObserving();
                    }
                    this.animateGoto(objA.type, objA[gt], objA.effect, objA.destinationStack);
                }
            }
            switch (objA.type) {
                case 'HSSequencerAction':
                    new Action.playSequencer({
                        items:objA.sequenceItems,
                        creator:objA.creator,
                        priority:objA.priority
                    });
                    break;

                case 'HSSetVolumeAction':
                    new Action.playSetCardVolume({
                        volume:objA.volumeLevel,
                        creator:objA.creator,
                        priority:objA.priority
                    });
                    break;

                case 'HSStarFieldAction':
                    new Action.playStarField({
                        item:objA
                    });
                    break;

                case 'HSAnimationAction':
                    if (objA.points) {
                        var type = eventType || 'other'
                            , sequence = Boolean(objA.template)
                            , len = play.help.getCountTypeActions(actions, objA.priority)
                            , curCard = cardsCollection.currentElement();

                        new Action.playItemAnimation({
                            item:objA,
                            length:len,
                            cardId:element.id,
                            type:type,
                            sequence:sequence,
                            interval:curCard.hasOwnProperty("interval") ? curCard.interval : null
                        });
                    }
                    break;

                case 'HSHideShowAction':
                    var modes = {
                        "1":"playShow",
                        "2":"playHide",
                        "3":"playToggle"
                    };
                    objA.objects.each(function (obj) {
                        obj.creator = objA.creator;
                        obj.priority = objA.priority;

                        var isAnotherCard = !Object.isElement($('Card' + cardsCollection.currentElement().id + 'cardObjects' + obj.object)),
                            actionName = modes[obj.mode];

                        /* check action mode exist */
                        if (Object.isUndefined(actionName) || !Object.isFunction(Action[actionName])) {
                            return;
                        }

                        /* fire action */
                        new Action[actionName]({
                            item:obj,
                            anotherCard:isAnotherCard
                        });
                    }, this);
                    break;

                case 'HSMakeHomeStackAction':
                    new Action.playImaHomeStack({
                        item:objA
                    });
                    break;

                case 'HSMoveToFrontAction':
                    new Action.playMoveToFront({
                        item:objA
                    });
                    break;

                case 'HSButtonListerAction':
                    new Action.playButtonLister({
                        item:objA
                    });
                    break;

                case 'HSButtonScannerAction':
                    new Action.playButtonScanner({
                        item:objA
                    });
                    break;

                case 'HSButtonStepperAction':
                    new Action.playButtonStepper({
                        item:objA
                    });
                    break;

                case 'HSPlaySoundAction':
                    var curCard = cardsCollection.currentElement();
                    new Action.playSound({
                        info:objA,
                        interval:curCard.hasOwnProperty("interval") ? curCard.interval : null
                    });

                    break;

                case 'HSPlayMovieAction':
                    var curCard = cardsCollection.currentElement();
                    new Action.playVideo({
                        item:objA,
                        interval:curCard.hasOwnProperty("interval") ? curCard.interval : null,
                        objects:curCard.objects
                    });
                    break;

                case 'HSOpenWebPageAction':
                    /**opening window*/
                    new Action.playWebPage({
                        item:objA
                    });
                    break;

                case 'HSSendMailAction':
                    /**sending email*/
                    new Action.playSendMail({//TODO: need to fix in safari
                        item:objA
                    });
                    break;

                case 'HSPrintCardAction':
                    /**printing card*/
                    new Action.playPrintCard({
                        creator:objA.creator,
                        priority:objA.priority
                    });
                    break;

                case 'HSGhostWriterAction':
                    new Action.playGhostWriter({
                        creator:objA.creator,
                        priority:objA.priority,
                        item:play.template.newCardElementId(cardsCollection.currentElement().id, objA.object),
                        data:objA.data
                    });
                    break;

                case 'HSMovieControllerAction':
                    new Action.playMovieController({
                        item:objA
                    });
                    break;

                case 'HSMoveTextAction':
                    new Action.playTextMover({
                        creator:objA.creator,
                        priority:objA.priority,
                        sourceDataType:objA.sourceDataType,
                        source:'Card' + cardsCollection.currentElement().id + 'cardObjects' + objA.src,
                        destination:'Card' + cardsCollection.currentElement().id + 'cardObjects' + objA.dest,
                        sourceAction:objA.sourceAction,
                        destinationAction:objA.destinationAction
                    });
                    break;

                case 'HSCompareTextAction':
                    new Action.playTextCompare({
                        creator:objA.creator,
                        priority:objA.priority,
                        source:objA.responseTextUID,
                        destination:objA.textToMatchUID,
                        condition:objA.compareSelector,
                        ignoreCase:('1' == objA.isCaseSensitiveComparison) ? false : true,
                        customText:objA.customText,
                        successActionEl:'Card' + cardsCollection.currentElement().id + 'cardObjects' + objA.rightAnswerUID,
                        failActionEl:'Card' + cardsCollection.currentElement().id + 'cardObjects' + objA.wrongAnswerUID
                    });
                    break;

                case 'HSAutoScrollAction':
                    new Action.playRollCredits({
                        creator:objA.creator,
                        priority:objA.priority,
                        item:'Card' + cardsCollection.currentElement().id + 'cardObjects' + objA.object,
                        mode:objA.scrollingSetup, //pixels
                        nOfPixels:objA.pixelsAmount,
                        nOfSteps:objA.numberOfSteps,
                        speed:objA.stepsPerSecond,
                        direction:objA.scrollDirection,
                        ignoreClick:!!(parseInt(objA.isIgnoreMouseClicks || 0, 10))
                    });
                    break;

                /*	case 'HSPlaySoundAction':
                 /*new Action.playRollCredits({
                 item:   	'Card'+ cardsCollection.currentElement().id + 'cardObjects'+ objA.object,
                 mode:		objA.mode,//pixels
                 nOfPixels:	objA.nOfPixels,
                 nOfSteps:	objA.nOfSteps,
                 speed:		objA.speed,
                 direction:	objA.direction

                 });
                 break;*/

                case 'HSShowMessageAction':
                    new Action.playShowMessage({
                        creator:objA.creator,
                        priority:objA.priority,
                        icon:objA.src,
                        text:objA.messageString,
                        buttonText:objA.buttonTitle

                    });
                    break;
                //scrollCard
                case 'HSScrollCardAction':
                    new Action.playScrollCard({
                        xCoord:objA.xCoord,
                        yCoord:objA.yCoord,
                        duration:'1.0'

                    });
                    break;

                case 'HSRestoreStackAction':
                    new Action.playClearChangeFlag(objA.creator, objA.priority);
                    break;

                case "HSShowHideCursorAction":
                    switch (objA.cursorVisibility) {
                        case "0":
                            objA.mode = "show";
                            break;

                        case "1":
                            objA.mode = "hide";
                            break;

                        case "2":
                            objA.mode = "hideUntil";
                            break;

                    }

                    new Action.playHideCursor({mode:objA.mode});
                    break;

                case "HSCardShufflerAction":
                    new Action.playCardShuffler({
                        creator:objA.creator,
                        priority:objA.priority,
                        from:objA.startingCardIndex,
                        to:objA.endingCardIndex
                    });
                    break;

                case "HSKeyMapperAction":
                    new Action.playKeyMapper({
                        creator:objA.creator,
                        priority:objA.priority,
                        items:objA.mappings
                    });
                    break;

                case 'HSSequencerAction':
                    new Action.playSequencer({ items:objA.sequenceItems });
                    break;

                case 'HSSlideShowAction':
                    new Action.playSlideShow({
                        creator:objA.creator,
                        priority:objA.priority,
                        returnToOriginal:!!(+objA.returnsToOriginalCard),
                        duration:parseFloat(objA.slideDuration),
                        stopOnClick:!!(+objA.useClickOnExitCard),
                        isLoop:!!(+objA.loopSlideShow),
                        transition:objA.slideTransitionName,
                        transitionDuration:parseFloat(objA.slideTransitionDuration)
                    });
                    break;

            /** TODO need proper action name and objA keys */
                case 'HSGoogleEarthAction':
                    new Action.playGoogleEarth({
                        creator:objA.creator,
                        priority:objA.priority,
                        lat:objA.Placemark.latitude,
                        lon:objA.Placemark.longitude,
                        name:objA.Placemark.name,
                        toFront:!!(+objA.toFront),
                        isQuit:!!(+objA.isQuit)
                    });
                    break;

                default:
                    if (!objA[gt]) {
                        new messageCreate({image:"./data/engine/templates/img/info.png", text:"Unsupported action.", caption:"OK"});
                    }
                    break;

            }

        }
        catch (err) {
            alert('error in player.js (bfx):' + console.log(err));
        }

    },

    setLoadEffectsChain:function (element, actions) {
        /**TODO:
         * to allow parallel actions
         **/
        try {
            chain = this.makeChain(actions);
            if (Object.isUndefined(this.timerTimeouts)) this.timerTimeouts = [];
            delete this.gtaction;
            delete this.isFirstActionPassed;
            delete this.gtactionPriority;
            this.gtaction = play.help.isGoToActionPresent(chain);

            chain.each(function (objA, counter) {
                /**FIXME!!!*/
                if (objA.type == "HSOtherCardAction")objA.type = "HSGoToSpecificCardAction";
                if ((objA.type == "HSGoToSpecificCardAction" || !Object.isUndefined(objA.effect)) && play.help.getCountObjectActions(actions) > 1) {
                    objA.priority = (play.help.getCountObjectActions(actions) - 1);
                    this.gtactionPriority = objA.priority;
                }
                else if (!Object.isUndefined(this.gtaction) && this.gtaction) {
                    var priority = (Object.isUndefined(this.isFirstActionPassed)) ? 0 : (play.help.getCountObjectActions(actions) - (counter + 1));
                    objA.priority = priority;
                }
                else {

                    objA.priority = counter;
                }
                this.isFirstActionPassed = 1;
                /**EOF*/

                /**if isset timer, playing action after timeout*/
                timer = 'automaticTimer';
                if (objA[timer]) {
                    try {
                        if(/Android/.test(navigator.userAgent)){ // fixed arrive media X2IBA-2725
                            document.observe(this.template.cardLoadActionEventDone(element.id, objA.priority), function () {
                                this.bfx(this, objA, actions, element);
                            }.bind(this));
                        } else {
                            document.observe(this.template.cardLoadActionEventDone(element.id, objA.priority), function () {
                                setTimeout(
                                    function () {
                                        this.bfx(this, objA, actions, element);
                                    }.bind(this), objA[timer] * 1000);
                            }.bind(this));
                        }
                    } catch (err) {
                        console.log(err);
                    }
                }
                /**else using common onload event*/
                else {
                    document.observe(this.template.cardLoadActionEventDone(element.id, objA.priority), play.bfx.bindAsEventListener(play, objA, actions, element, 'load'));
                    firstCardEvent = this.template.cardLoadActionEventDone(element.id, objA.priority);
                }
            }.bind(this));

            document.fire(this.template.cardLoadActionEventDone(element.id, 0));
            document.stopObserving(this.template.cardLoadActionEventDone(element.id, 0));
            delete this.gtaction;

        }
        catch (err) {
            alert('error in player.js (setEffectsChain):' + console.log(err));
        }
    },

    setEffectsChain:function (element, actions) {
        /**TODO:
         * generating internal priority
         **/
        try {
            chain = this.makeChain(actions);
            //(chain.length).times(function(i){document.stopObserving(this.template.cardElementEventDone(cardsCollection.currentElement().id,element.id,i));}.bind(this));
            if (Object.isUndefined(this.timerTimeouts)) this.timerTimeouts = [];
            delete this.gtaction;
            delete this.isFirstActionPassed;
            delete this.gtactionPriority;
            this.gtaction = play.help.isGoToActionPresent(chain);

            chain.each(function (objA, counter) {
                if (objA.type == "HSOtherCardAction")objA.type = "HSGoToSpecificCardAction";
                if ((objA.type == "HSGoToSpecificCardAction" || !Object.isUndefined(objA.effect)) && play.help.getCountObjectActions(actions) > 1) {
                    objA.priority = (play.help.getCountObjectActions(actions) - 1);
                    this.gtactionPriority = objA.priority;
                }
                else if (!Object.isUndefined(this.gtaction) && this.gtaction) {
                    var priority = (Object.isUndefined(this.isFirstActionPassed)) ? 0 : (play.help.getCountObjectActions(actions) - (counter + 1));
                    objA.priority = priority;
                }
                else {

                    objA.priority = counter;
                }
                this.isFirstActionPassed = 1;

                /**if isset timer, plaing action after timeout*/
                timer = 'timer';

                /**FIX for events observers*/
                var registry = Element.retrieve(document, 'prototype_event_registry');

                /**responders = registry.get(eventName); */
                var responders = registry.get(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, objA.priority));

                if (Object.isUndefined(registry) || Object.isUndefined(responders) || Object.isUndefined(responders[0])) {

                    if (objA[timer]) {
                        try {
                            if (parseFloat(objA[timer]) < 0.1)objA[timer] = 0.1;
                            setTimeout(function () {
                                this.bfx(this, objA, actions, element);
                            }.bind(this), objA[timer] * 1000);
                        } catch (err) {
                            console.log(err);
                        }
                    }
                    /**else using common onload event*/
                    else {

                        document.observe(this.template.cardActionEventDone(element.id, objA.priority), play.bfx.bindAsEventListener(play, objA, actions, element));

                        firstCardEvent = this.template.cardActionEventDone(element.id, objA.priority);
                    }
                }
            }.bind(this));

            document.fire(this.template.cardActionEventDone(element.id, 0));
            document.stopObserving(this.template.cardActionEventDone(element.id, 0));
        } catch (err) {
            alert('error in player.js (setEffectsChain):' + console.log(err));
        }
    },

    setUnloadEffectsChain:function (element, actions) {
        try {
            chain = this.makeChain(actions);
            //(chain.length).times(function(i){document.stopObserving(this.template.cardElementEventDone(cardsCollection.currentElement().id,element.id,i));}.bind(this));
            if (Object.isUndefined(this.timerTimeouts)) this.timerTimeouts = [];
            delete this.gtaction;
            delete this.isFirstActionPassed;
            delete this.gtactionPriority;
            this.gtaction = play.help.isGoToActionPresent(chain);

            chain.each(function (objA, counter) {
                if (objA.type == "HSOtherCardAction")objA.type = "HSGoToSpecificCardAction";
                if ((objA.type == "HSGoToSpecificCardAction" || !Object.isUndefined(objA.effect)) && play.help.getCountObjectActions(actions) > 1) {
                    objA.priority = (play.help.getCountObjectActions(actions) - 1);
                    this.gtactionPriority = objA.priority;
                }
                else if (!Object.isUndefined(this.gtaction) && this.gtaction) {
                    var priority = (Object.isUndefined(this.isFirstActionPassed)) ? 0 : (play.help.getCountObjectActions(actions) - (counter + 1));
                    objA.priority = priority;
                }
                else {

                    objA.priority = counter;
                }
                this.isFirstActionPassed = 1;

                timer = 'timer';

                /**FIX for events observers*/
                var registry = Element.retrieve(document, 'prototype_event_registry');

                /**responders = registry.get(eventName); */
                var responders = registry.get(this.template.cardUnloadActionEventDone(element.id, objA.priority));
                if (Object.isUndefined(registry) || Object.isUndefined(responders) || Object.isUndefined(responders[0])) {
                    /**if isset timer, playing action after timeout*/
                    document.observe(this.template.cardUnloadActionEventDone(element.id, objA.priority), play.bfx.bindAsEventListener(play, objA, actions, element, 'unload'));
                }
                if (objA.priority == '0') {
                    firstObjectEvent = this.template.cardUnloadActionEventDone(element.id, objA.priority);
                }


            }.bind(this));

            document.fire(this.template.cardUnloadActionEventDone(element.id, 0));

            var lastIndex = chain.length - 1;
            if (chain[lastIndex]) {
                var lastPriority = chain[lastIndex].priority + 1;
                document.observe(this.template.cardUnloadActionEventDone(element.id, lastPriority), function (e) {
                    document.fire('Card' + cardsCollection.currentElement().id + ':canUnload');
                });
            } else {
                document.fire('Card' + cardsCollection.currentElement().id + ':canUnload');
            }
        } catch (err) {
            alert('error in player.js (seUnloadtEffectsChain):' + console.log(err));
        }
    },

    setElementsEffectsChain:function (element, actions, elementObject) {
        try {
            chain = this.makeChain(actions);
            (chain.length).times(function (i) {
                document.stopObserving(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, i));
            }.bind(this));

            if (Object.isUndefined(this.timerTimeouts)) this.timerTimeouts = [];
            delete this.gtaction;
            delete this.hideShowAction;
            delete this.isFirstActionPassed;
            delete this.gtactionPriority;
            //this.gtaction = play.help.isGoToActionPresent(chain);
            //this.hideShowAction = play.help.isHideShowActionPresent(chain);

            chain.sort(play.help.effectsChainSorter);
            chain.each(function (objA, counter) {
                /**MAC-WIN compatiblity fix!!!*/
                if (objA.type == "HSOtherCardAction")objA.type = "HSGoToSpecificCardAction";
                /**EOF*/

                objA.priority = counter;
                timer = 'timer';
                /**FIX for events observers*/
                var registry = Element.retrieve(document, 'prototype_event_registry');

                /**responders = registry.get(eventName); */
                var responders = registry.get(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, objA.priority));

                if (Object.isUndefined(registry) || Object.isUndefined(responders) || Object.isUndefined(responders[0])) {
                    /**if isset timer, playing action after timeout*/
                    if (!Object.isUndefined(elementObject) && !Object.isUndefined(elementObject[timer])) {
                        document.observe(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, objA.priority), function () {

                            /* cache timeout function */
                            if (parseFloat(elementObject[timer]) < 0.1) {
                                elementObject[timer] = 0.1;
                            }

                            if ("0.00" === elementObject.interval) {
                                elementObject.interval = 0.1;
                            }

                            if (!Object.isUndefined(elementObject.interval) && parseFloat(elementObject.interval) > 0) {
                                /** autorepeatable variant*/
                                var timerF = function () {
                                    setTimeout(function () {
                                        this.bfx(this, objA, actions, element);
                                    }.bind(this), elementObject[timer] * 1000);

                                    elementObject[timer] = 0;
                                    document.observe(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, (parseInt(objA.priority) + 1)),
                                        function () {
                                            this.timerTimeouts.push(setTimeout(timerF, elementObject.interval * 1000));
                                        }.bind(this)
                                    );
                                }.bind(this);
                                /**EOF*/
                            } else {
                                var timerF = function () {
                                    return setTimeout(
                                        function () {
                                            this.bfx(this, objA, actions, element);
                                        }.bind(this),
                                        elementObject[timer] * 1000
                                    );
                                }.bind(this);
                            }

                            if (element.visible()) {
                                /* prevent duplicate fire(simple, but lame) */
                                /*if (!element.loadedOnce) {
                                 timerF = false;
                                 }
                                 element.loadedOnce = true;*/
                                var tempTimeout = timerF && timerF();
                                this.timerTimeouts.push(tempTimeout);
                            } else {
                                /* fire delayedTimer on playShow action */
                                element.delayedTimer = timerF;
                            }
                        }.bind(this));
                    } else {
                        document.observe(this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, objA.priority), play.bfx.bindAsEventListener(play, objA, actions, element));
                    }
                }
            }.bind(this));

            var firstObjectEvent = this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, 0)
                , lastObjectEvent = this.template.cardElementEventDone(cardsCollection.currentElement().id, element.id, chain.length);

            document.observe(lastObjectEvent, Droppables.runDelayedDropOffs);  // used when hide/show action run before dropoff raised
            document.fire(firstObjectEvent/*this.template.cardElementEventDone(cardsCollection.currentElement().id,element.id,0)*/);
            //document.stopObserving(this.template.cardElementEventDone(cardsCollection.currentElement().id,element.id,0));
            //if (cardsCollection.lastSeenElement().id != cardsCollection.currentElement().id) {
            //setTimeout(function(){document.stopObserving(this.template.cardElementEventDone(cardsCollection.lastSeenElement().id,element.id,0));}.bind(this),500);
            //}
        } catch (err) {
            alert('error in player.js (setEffectsChain):' + console.log(err));
        }
    },

    makeChain:function (actions) {
        return actions;
    }
});

var createElements = {
    sound:function (newCard, j, play) {
        var newCardObj = newCard.objects[j];
        var audioId = play.template.newCardElementId(newCard.id, newCardObj.id);

        if (!play.flashAudio) {
            var mediaKey = newCardObj.id;

            if (play.mobileSafariMedia[mediaKey] !== undefined) {
                var cardElement = play.mobileSafariMedia[mediaKey];
            } else {
                var cardElement = new Element("audio",
                    {src:prefix + newCardObj.src /*+'?' +  new Date().getTime()*/,
                        id:audioId,
                        style:"position:absolute;" +
                            "z-index:0;" +
                            "display:block;" +
                            "width:0px;" +
                            "height:0px;"
                    });
            }
        } else {
            /**flash mediaplayer goes here*/
            var local = (/file\:/.test(window.location.href)) ? "_local" : "";

            var cardElement = '<object type="application/x-shockwave-flash" data="data/engine/templates/flash/mediaplayer' + local + '.swf" id="' + audioId + '"' +
                ' style="position:absolute;background:none;z-index:-9;width:10px;height:10px;">' +
                '<param name="allowNetworking" value="all">' +
                '<param name="allowFullScreen" value="true">' +
                '<param name="allowScriptAccess" value="always">' +
                '<param name="wmode" value="transparent">' +
                '<param name="movie" value="data/engine/templates/flash/mediaplayer.swf">' +
                '<param name="flashvars" value="src=../../../../' + prefix + newCardObj.src + '&id=' + audioId + '">' +
                '</object>';
            /**EOF*/
        }

        return cardElement;
    },

    image:function (newCard, j, play, suffixId) {

        var newCardObj = newCard.objects[j];
        var style = "";

        var cardElement = new Element("img",
            {src:prefix + newCardObj.src /*+'?' +  new Date().getTime()*/,
                id:play.template.newCardElementId(newCard.id, newCardObj.id),
                style:"position:absolute;" +
                    "z-index:auto;" +
                    "display:" + (newCardObj.isVisible != 0 ? 'block' : 'none') + ";" +
                    "cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";"
            });

        if (!!suffixId) {
            cardElement.id += suffixId;
        }

        if (play.help.checkForGroupObjectData(newCard, play, j)) {
            style = "top:" +   play.groupObjectsData[newCardObj.id].top + ";" +
                "left:" +   play.groupObjectsData[newCardObj.id].left + ";" +
                "height:" + play.groupObjectsData[newCardObj.id].height + ";" +
                "width:" +  play.groupObjectsData[newCardObj.id].width + ";" +
                "z-index:" +play.groupObjectsData[newCardObj.id].zIndex + ";";
        }

        if (play.help.checkForDraggableObjectData(newCardObj.id, play)) {
            style += play.help.getDraggableObjectStyle(newCard, play, j);
        } else {
            style += "top:" +    newCardObj.yCoord + "px;" +
                "left:" +   newCardObj.xCoord + "px;" +
                "height:" + newCardObj.ySize + "px;" +
                "width:" +  newCardObj.xSize + "px;" +
                "z-index:" + play.help.getZIndexValue(newCardObj.order, 1) + ";";
        }

        if (newCardObj.rotationAngle != 0) {
            style += "-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);";
        }

        cardElement.setStyle(style);

        if (newCardObj.opacity != "1.0") {
            cardElement.setOpacity(newCardObj.opacity);
        }

        return cardElement;
    },

    shape:function (newCard, j, play) {
        var newCardObj = newCard.objects[j];
        var cardElement = new Element("canvas",
            {id:play.template.newCardElementId(newCard.id, newCardObj.id),
                style:"position:absolute;" +
                    "z-index:" + (play.help.getZIndexValue(newCardObj.order, 1)) + ";" + // other drawShape() anyway set this to 999
                    "display:" + (newCardObj.isVisible == 0 ? "none" : "block") + ";" +
                    "cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";" +
                    "overflow:hidden;",
                height:newCardObj.ySize,
                width:newCardObj.xSize});


        if (play.help.checkForGroupObjectData(newCard, play, j)) {
            var style = "top:" + play.groupObjectsData[newCardObj.id].top + ";" +
                "left:" + play.groupObjectsData[newCardObj.id].left + ";" +
                "height:" + play.groupObjectsData[newCardObj.id].height + ";" +
                "width:" + play.groupObjectsData[newCardObj.id].width + ";"/* +
             "z-index:" + play.groupObjectsData[newCardObj.id].zIndex + ";"*/;
            cardElement.setStyle(style);
        } else if (play.help.checkForDraggableObjectData(newCardObj.id, play)) {
            var style = play.help.getDraggableObjectStyle(newCard, play, j);
            cardElement.setStyle(style);
        } else {
            cardElement.setStyle(/*"z-index:" + newCardObj.order + ";" +*/
                "top:" + newCardObj.yCoord + "px;" +
                    "left:" + newCardObj.xCoord + "px;" +
                    "height:" + newCardObj.ySize + "px;" +
                    "width:" + newCardObj.xSize + "px;"
            );
        }

        play.help.rotateElement(cardElement, newCardObj.rotationAngle);

        return cardElement;
    },


    /**Sounds realization
     *  - check if can be played;
     *  - play sound with video;
     *  - stop sound with video;
     *  - pause sound with video;
     *  - check sychro;
     *
     */
    pngMapVideosSound:Class.create({
        soundCheck:function () {
            this.soundElement.observe("canplay", function () {
                this.canPlaySound = true;
            }.bind(this));
        },

        play:function () {
            this.soundElement.play();
        },

        stop:function () {
            this.soundElement.stop();
        },

        pause:function () {
            this.soundElement.pause();
        },

        checkSyncro:function () {
            if (this.soundElement.currentTime() < (this.playbackTime - 250)) {
                return false;
            } else {
                return true;
            }
        },

        setLoop:function (val) {
            this.loop = val;
        },

        getLoop:function () {
            return this.loop;
        },

        setVolume:function (val) {
            this.volume = val * play.globalVolume;
        },

        getVolume:function () {
            return this.volume;
        }
    }),

    pngMapVideo:Class.create({
        initialize:function (options) {
            this.options = {
                id:'id',
                object:{}
            };

            Object.extend(this.options, options || { });
            this.interval = [];
            this.container = document.createElement("div");
            this.frameCount = 0;
            this.options.object.mapData.forEach(function (map) {
                this.frameCount += parseInt(map.length);
            }.bind(this));
            this.container.setAttribute("id", this.options.id);
            this.container.setAttribute("style",
                "position:absolute;" +
                    "top:" + this.options.object.yCoord + "px;" +
                    "left: " + this.options.object.xCoord + "px;" +
                    "width:" + this.options.object.xSize + "px; " +
                    "height: " + this.options.object.ySize + "px;" +
                    "z-index:" + this.options.help.getZIndexValue(this.options.object.order) + ";" +
                    "-webkit-transform:rotate(" + (this.options.object.rotationAngle ) + "deg);" +
                    "-moz-transform:rotate(" + (this.options.object.rotationAngle ) + "deg);" +
                    "-ms-transform:rotate(" + (this.options.object.rotationAngle ) + "deg);" +
                    "-o-transform:rotate(" + (this.options.object.rotationAngle ) + "deg);"
            );
            this.loadBackground();
            this.reset();
            Object.extend(this.container, this);

        },
        loadBackground: function(){
            var bckArray = [];
            this.options.object.mapData.forEach(function (map) {
                var temp = "url(" + prefix + map.src + ") -9999px -9999px no-repeat";
                bckArray.push(temp);
            });
            this.container.style.background = bckArray.join(",");
        },
        setMap:function (index) {
            this.counter = 0;
            this.currentMap = index;
            this.currentMapFrames = parseInt(this.options.object.mapData[index].length);
        },
        play:function () {
            if (this.playing) {
                return;
            }
            this.container.fire(this.container.id + ":ready");
            this.reset();
            this.playing = true;
            this.paused = false;
            var changeFrame = function () {
                //console.log("total  " , this.totalCounter, " counter ",this.counter," map ",this.currentMap);
                if (this.totalCounter < this.frameCount - 1) {
                    if (this.counter < this.currentMapFrames - 1) {
                        this.setFrame(this.currentMap, this.counter);
                        this.counter++;
                    } else {
                        this.setMap(this.currentMap + 1);
                        this.setFrame(this.currentMap, this.counter);
                    }
                    this.totalCounter++;
                } else {
                    this.stop();
                }
            }.bind(this);
            this.interval.push(setInterval(changeFrame, parseInt(1000 / this.options.object.mapFPS)));
            this.container.triggerEvent('playing');
        },
        setFrame:function (mapIndex, frameIndex) {
            var bckArray = [];
            this.options.object.mapData.forEach(function (map, index) {
                var position = "";
                if (index != mapIndex) {
                    position = "-9999px -9999px ";
                } else {
                    var row = parseInt(frameIndex * this.options.object.xSize / map.xSize);
                    var col = (frameIndex * this.options.object.xSize % map.xSize) / this.options.object.xSize;
                    position = "-" + col * this.options.object.xSize + "px -" + row * this.options.object.ySize + "px";
                }
                bckArray.push(position);
            }.bind(this));
            this.container.style.backgroundPosition = bckArray.join(",");
        },

        stop:function () {
            this.pause();
            this.reset();
            this.container.triggerEvent("ended");
        },

        reset:function () {
            this.totalCounter = 0;
            this.setMap(0);
            this.setFrame(0, 0);
        },

        pause:function () {
            this.playing = false;
            this.paused = true;
            this.interval.forEach(function (interval) {
                clearInterval(interval);
            });
            this.container.triggerEvent('pause');

        },


        nextFrame:function () {
            var bgPos = this.getCurrentFramePos();
            this.setFrame(this.element, -bgPos.x, -bgPos.y);
            ++this.counter;
            this.totalCounter++;
        },

        previousFrame:function () {
            var bgPos = this.getCurrentFramePosForPrevFrame();
            this.setFrame(this.element, -bgPos.x, -bgPos.y);
            --this.counter;
            if (this.counter < 0) {
                this.counter = 25;
            }
            this.totalCounter--;
        },

        prevFrame:function () {
            --this.counter;
            this.currentTime = t;
            $(this.imgElement.id).src = this.images[this.counter];
        },

        loadMap:function (element, src) {
            element.style.backgroundImage = "url(" + prefix + src + ")";
        },

        load:function () {
        },

        resetFrame:function (element) {
            element.style.backgroundPosition = "0px  0px";
        },
        setRate:function (r) {
            this.rate = r;
        },

        getRate:function () {
            return this.rate;
        },

        duration:function () {
            return this.totalDuration;
        }
    }),

    button:function (newCard, j, play) {

        var newCardObj = newCard.objects[j];
        var style = "";

        var cardElement = new Element("canvas",
            {id:play.template.newCardElementId(newCard.id, newCardObj.id),
                style:"position:absolute;" +
                    "z-index:" + (play.help.getZIndexValue(newCardObj.order, 1)) + ";" +
                    "opacity:0;" +
                    "cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";" +
                    "overflow:hidden;",
                height:newCardObj.ySize,
                width:newCardObj.xSize});

        if (play.help.checkForGroupObjectData(newCard, play, j)) {
            style = "top:" + play.groupObjectsData[newCardObj.id].top + ";" +
                "left:" + play.groupObjectsData[newCardObj.id].left + ";" +
                "height:" + play.groupObjectsData[newCardObj.id].height + ";" +
                "width:" + play.groupObjectsData[newCardObj.id].width + ";"/* +
             "z-index:" + play.groupObjectsData[newCardObj.id].zIndex + ";"*/;
        } else if (play.help.checkForDraggableObjectData(newCardObj.id, play)) {
            style = play.help.getDraggableObjectStyle(newCard, play, j);
        } else {
            style = "top:" + newCardObj.yCoord + "px;" +
                "left:" + newCardObj.xCoord + "px;" +
                "height:" + newCardObj.ySize + "px;" +
                "width:" + newCardObj.xSize + "px;";
        }

        if (newCardObj.rotationAngle != 0) {
            style += "-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (newCardObj.rotationAngle) + "deg);" +
                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);";
        }

        if (newCardObj.isVisible != 1) {
            style += "display:none;";
        }

        cardElement.setStyle(style);

        return cardElement;
    },

    src:function (newCard, j, play) {
        var newCardObj = newCard.objects[j];
        var butImage = new Element("img", {
            id:play.template.newCardElementId(newCard.id, newCardObj.id) + "_image",
            src:prefix + newCardObj.src,
            style:"position:absolute;z-index:" + (play.help.getZIndexValue(newCardObj.order)) + ";" +
                "display:block;cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";" +
                "top:" + newCardObj.yCoord + "px;" +
                "left:" + newCardObj.xCoord + "px;" +
                "overflow:hidden;"});

        if (newCardObj.isVisible != 1) {
            butImage.style.display = "none";
        }

        if (newCardObj.rotationAngle != 0) {
            butImage.setStyle("-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (newCardObj.rotationAngle) + "deg);" +
                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);");
        }

        return butImage;
    },

    text:function (newCard, j, play) {
        var newCardObj = newCard.objects[j];
        var textBackground = (!Object.isUndefined(newCardObj.src)) ? newCardObj.src : newCardObj.backgroundColor;
        var textElement = new Element("div",
            {    id:play.template.newCardElementId(newCard.id, newCardObj.id),
                style:"position:absolute;" +
                    "z-index:" + (play.help.getZIndexValue(newCardObj.order)) + ";" +
                    "display:none;" +
                    "background:" + textBackground + " repeat;" +
                    "top:" + newCardObj.yCoord + "px;" +
                    "left:" + newCardObj.xCoord + "px;" +
                    "height:" + play.help.getScrollBoxSize(newCardObj.ySize, newCardObj.drawFrame) + "px;" +
                    "width:" + play.help.getScrollBoxSize(newCardObj.xSize, newCardObj.drawFrame, newCardObj.isReadOnly) + "px;" +
                    "cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";" +
                    "overflow-y:scroll;" +
                    "overflow-x:hidden;" +
                    "-webkit-overflow-scrolling: auto;" +
                    "white-space:pre-wrap;" +
                    "word-wrap: break-word;"});

        if (newCardObj.hasShadow == 1) {
            textElement.setStyle("-ms-text-shadow:" + newCardObj.shadow.xOffset + "px " + newCardObj.shadow.yOffset + "px " + newCardObj.shadow.blur + "px #000;" +
                "text-shadow:" + newCardObj.shadow.yOffset + "px " + newCardObj.shadow.xOffset + "px " + newCardObj.shadow.blur + "px #000");
        }

        if (!Object.isUndefined(newCardObj.cssString) && newCardObj.cssString != "") {
            textElement.setStyle(newCardObj.cssString);
        }

        if (newCardObj.textType == "scrollable") {
            textElement.setStyle("overflow-y:hidden!");
        }

        if (play.help.checkForGroupObjectData(newCard, play, j)) {
            var style = "top:" + play.groupObjectsData[newCardObj.id].top + ";" +
                "left:" + play.groupObjectsData[newCardObj.id].left + ";" +
                "height:" + play.groupObjectsData[newCardObj.id].height + ";" +
                "width:" + play.groupObjectsData[newCardObj.id].width + ";"/* +
             "z-index:" + play.groupObjectsData[newCardObj.id].zIndex + ";"*/;
            textElement.setStyle(style);

        } else if (play.help.checkForDraggableObjectData(newCardObj.id, play)) {
            var style = play.help.getDraggableObjectStyle(newCard, play, j);
            textElement.setStyle(style);
        }

        if (newCardObj.rotationAngle != 0) {
            textElement.setStyle("-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (newCardObj.rotationAngle) + "deg);" +
                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);");
        }

        if (newCardObj.drawScrollBar != '1') {
            if (isTouchDevice()) {
                textElement.setStyle("overflow-y: scroll!important; -webkit-overflow-scrolling: auto!important;");  // allow to scroll but don't show scrollbar
            } else {
                textElement.setStyle("overflow:hidden!important;");
            }
        } else {
            if (isTouchDevice()) {
                textElement.setStyle("overflow-y: scroll!important; -webkit-overflow-scrolling: touch!important;");  // allow to scroll but show scrollbar
            }
        }

        if (newCardObj.drawFrame == '1') {
            textElement.setStyle("border:1px #111 solid;");
        }

        return textElement;
    },

    youtube:function (newCard, j, play) {
        var newCardObj = newCard.objects[j];
        var ytVideoId = newCardObj.url.toQueryParams().v;
        var ytUrl = "http://www.youtube.com/embed/" + ytVideoId;
        var elementStyle =
            "position:absolute;" +
                "z-index:auto;" +
                "display:none;" +
                "background:url(" + prefix + newCardObj.posterFrame + ") no-repeat;" +
                "cursor:" + play.template.cursorStyle(newCardObj.cursor, newCardObj.hotSpotX, newCardObj.hotSpotY) + ";";

        if (newCardObj.hasShadow) {
            elementStyle += play.help.getBoxShadowStyle(newCardObj.shadow, newCardObj.rotationAngle);
        }

        var cardElement = new Element("div",
            {id:play.template.newCardElementId(newCard.id, newCardObj.id),
                style:elementStyle
            });
        var isShieldEnabled = (!Object.isUndefined(newCardObj.actions)
            && !Object.isUndefined(newCardObj.actions.click)
            && newCardObj.actions.click.length > 0);
        var ytFrame = new Element("iframe", {
            id:"frm",
            height:newCardObj.ySize,
            width:newCardObj.xSize,
            frameborder:0,
            allowfullscreen:"",
            passmeevt:"true",
            style:"position:absolute;top:0px;left:0px;",
            src:ytUrl});

        if (isShieldEnabled) {
            var shield = new Element("div", {style:"position:absolute;" +
                "top:0px;" +
                "left:0px;" +
                "width:100%;" +
                "height:100%;" +
                "background:url(" + prefix + newCardObj.posterFrame + ") no-repeat;"
            });
            shield.observe("click", function (e) {
                e.element().hide();
            });
        }

        cardElement.insert(ytFrame);

        if (isShieldEnabled) {
            cardElement.insert(shield);
        }

        if (play.help.checkForGroupObjectData(newCard, play, j)) {
            var style = "top:" + play.groupObjectsData[newCardObj.id].top + ";" +
                "left:" + play.groupObjectsData[newCardObj.id].left + ";" +
                "height:" + play.groupObjectsData[newCardObj.id].height + ";" +
                "width:" + play.groupObjectsData[newCardObj.id].width + ";" +
                "z-index:" + play.groupObjectsData[newCardObj.id].zIndex + ";";
            cardElement.setStyle(style);
        }

        if (play.help.checkForDraggableObjectData(newCardObj.id, play)) {
            var style = play.help.getDraggableObjectStyle(newCard, play, j);
            cardElement.setStyle(style);
        } else {
            cardElement.setStyle("top:" + newCardObj.yCoord + "px;" +
                "left:" + newCardObj.xCoord + "px;" +
                "height:" + newCardObj.ySize + "px;" +
                "width:" + newCardObj.xSize + "px;" +
                "z-index:" + play.help.getZIndexValue(newCardObj.order) + ";"
            );
        }

        if (newCardObj.rotationAngle != 0) {
            cardElement.setStyle("-webkit-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-moz-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-ms-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);" +
                "-o-transform:rotate(" + (newCardObj.rotationAngle ) + "deg);");
        }

        if (newCardObj.opacity != "1.0") {
            cardElement.setOpacity(newCardObj.opacity);
        }

        return cardElement;
    }
};

var Action = {
    finishAction:function (creator, priority) {
        switch (creator) {
            case "cardUnload":
                return function () {
                    document.fire(play.template.cardUnloadActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                    document.stopObserving(play.template.cardUnloadActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                }.bind(this).delay(0.1);
                break;

            case "cardLoad":
                return function () {
                    document.fire(play.template.cardLoadActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                    document.stopObserving(play.template.cardLoadActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                }.bind(this).delay(0.1);
                break;

            case "cardClick":
                return function () {
                    document.fire(play.template.cardActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                    document.stopObserving(play.template.cardActionEventDone(cardsCollection.currentElement().id, (priority + 1)));
                }.bind(this).delay(0.1);
                break;

            default:
                return function () {
                    document.fire(play.template.cardElementEventDone(cardsCollection.currentElement().id, creator, (priority + 1)));
                    document.stopObserving(play.template.cardElementEventDone(cardsCollection.currentElement().id, creator, (priority + 1)));
                }.bind(this).delay(0.1);
                break;
        }
    }
};
/**
 * Here comes actions objects.
 * To add new action we need:
 * 1. Create new object at the bottom;
 * 2. Add initialization for it in bfx function.
 */
/**
 * hypertext links observer
 * @param links array of global 'linksCollection'
 * NOTICE: implemented only for scrollText objects
 * TODO:
 * - implement consistent link support for nested tags
 *  (ex. "some <b>text</b>" should map on whole phrase if link "some text" defined )
 * - implement UoF(Unit of Work, transaction) to ensure
 *   new keyup event modify scrollBox only if previous finish pane update
 */
Action.hypertextObserver = Class.create({
    initialize:function (links) {
        try {
            /** some sort of "singletone" ) */
            this.isInit = false;

            /** prevent content mess on fast typing in scrollBox */
                //this.eventProcessing = false;

            this.links = [];
            /* wrapped html elements for each card */
            /* this.elements = []; */
            this.paneTexts = {};

            /** buffer element to prevent loop on "expensive" textPane update operation */
            //this.virtualFragment = new Element('div');

            /** node to rememeber cursor position */
            /* this.refNode = new Element('code', {'id' : 'refNode'}); */
            this.refNode = document.createElement("code");
            $(this.refNode).setAttribute("id", "refNode");
            this.refNodeString = $(this.refNode).inspect() + '</code>';

            this.setLinks(links);

            this.run();
        } catch (err) {
            alert('hypertextObserver: initialize error:' + console.log(err));
        }
    },

    /** create initial set of hyperlinks on card inject */
    createElementsOnCardInject:function () {
        this.isInit = false;

        /** no links, nothing to inject */
        if (!this.links.length) {
            return;
        }

        var textPanes = $$('[id$="textPane"]');

        /** text panes not found, no sources for injection */
        if (Object.isUndefined(textPanes) || !textPanes.length) {
            return;
        }

        textPanes.each(function (pane, index) {
            this.removeHTMLLinks(pane);
            this.addHTMLLinks(pane);
        }.bind(this));
    },

    updateHTMLLinks:function (pane) {
        //this.eventProcessing = true;
        this.setSelectionMarker(pane);
        this.removeHTMLLinks(pane);
        this.addHTMLLinks(pane);
        this.restoreCursor(pane);
    },

    createExprWithTag:function (title) {
        var spanString = '(?:' + this.refNodeString + ')?';
        title = title.split('').join(spanString);

        return '(<span class="hplink" linknumber="\\d+"(\.??)>)?(' + spanString + title + spanString + ')(</span>)?';
    },
    hideLinkActionObjects:function (link) {
        link.click.forEach(function (object) {
            if (object.object) {
                var temp = $(play.template.newCardElementId(cardsCollection.currentElement().id, object.object));
                temp.hide();
            }
            if (object.movies) {
                object.movies.forEach(function (movie) {
                    var temp = $(play.template.newCardElementId(cardsCollection.currentElement().id, movie.object));
                    temp.hide();
                });
            }
        });
    },
    showLinkActionObjects:function (link) {
        link.click.forEach(function (object) {
            if (object.object) {
                var temp = $(play.template.newCardElementId(cardsCollection.currentElement().id, object.object));
                temp.show();
            }
            if (object.movies) {
                object.movies.forEach(function (movie) {
                    var temp = $(play.template.newCardElementId(cardsCollection.currentElement().id, movie.object));
                    temp.show();
                });
            }
        });
    },
    addHTMLLinks:function (pane) {

        var innerElements = pane.descendants() || [];
        var innerText = pane.innerHTML.stripTags() || '';

        /** save pane text to compare it with new state in setSelectionMarker */
        this.paneTexts[pane.id] = innerText;

        /** pane is empty */
        if (!innerElements && !innerElements.length && !innerText.length) {
            return;
        }

        /** textPane can contain text without wrapping element, so check it too */

        innerElements.unshift(pane);
        /** bubble to top (textPane)*/
        innerElements.reverse();

        this.links.each(function (link) {
            /** apply this field only */
            if (!Object.isUndefined(link.object) && pane.up().id != play.template.newCardElementId(cardsCollection.currentElement().id, link.object)) {
                return;
            }
            var expr = new RegExp(link.title, 'm'),
                exprWithTag = new RegExp(this.createExprWithTag(link.title), 'm'),
                /** find "visual" hp match */
                    matches = innerText.match(expr);

            /** potential links not found */
            if (!matches || !matches.length) {
                this.hideLinkActionObjects(link);
                return;
            } else {
                this.showLinkActionObjects(link);
            }

            innerElements.each(function (element, j) {
                /** prevent recursive nesting */
                if (element.hasClassName('hplink') || element.innerHTML.stripTags() == '') {
                    return;
                }

                for (var i = 0, len = element.childNodes.length; i < len; ++i) {
                    /** use Node.TEXT_NODE instead of "3" for modern browsers  */
                    if (3 != element.childNodes[i].nodeType) {
                        continue;
                    }

                    var parent = element.childNodes[i].parentNode;

                    var frag = document.createDocumentFragment(),
                        div = new Element('div');

                    div.innerHTML = element.childNodes[i].nodeValue.gsub(exprWithTag,
                        function (match) {
                            /** check if text already wrapped in hplink */
                            if (match[(match.length - 2)] != match[0]) {
                                return match[0];
                            }
                            return this.createElementWrapper(link, match[(match.length - 2)]);
                        }.bind(this));

                    for (var k = 0, len2 = div.childNodes.length; k < len2; ++k) {
                        frag.appendChild(div.childNodes[k].cloneNode(true));
                    }

                    /** only text nodes here */

                    parent.insertBefore(frag, element.childNodes[i]);
                    parent.removeChild(element.childNodes[i + div.childNodes.length]);
                    delete div;
                }

            }.bind(this));

        }.bind(this));

        this.bindEvents(pane);
    },

    removeHTMLLinks:function (pane) {
        /** NOTICE do not add `g` flag, (\.+?) in opposite to (\.??) in addLinks means that all links have id after create */
        var exprWithTag = new RegExp('<span(?:\.??)class="hplink"(?:\.+?)>((\.+?)?(?:' + this.refNodeString + ')?)</span>', 'm');

        /** remove links, but preserve inner text */
        pane.innerHTML = pane.innerHTML.gsub(exprWithTag,
            function (match) {
                /* match.each(function(item,index) { 
                 if(Object.isUndefined(item)) { 
                 return;
                 }
                 }.bind(this)); */

                return match[match.length - 2];
            }.bind(this));

        /** write resulting html once per pane */
        //pane.update( pane.innerHTML );
    },

    bindEvents:function (pane) {
        pane.select('.hplink').each(function (link) {
            var number = parseInt(link.getAttribute('linknumber'), 10) || 0,
                events = this.links[number].click;

            /** set id if not set */
            link.identify();

            var carddto = {
                actions:{
                    click:this.links[number].click
                }
            };

            play.elementEventObserver(carddto, link, 'click');
            play.elementEventObserver(carddto, link, 'touchstart');
        }.bind(this));
    },

    /** set new links stack change */
    setLinks:function (links) {
        this.links = links || [];
    },

    /** define how text elements should be wrapped for particular hypertext link */
    createElementWrapper:function (link, text) {
        var resultSet = [];

        /** remember position of separator if catch */
        var position = text.indexOf(this.refNodeString);
        text = text.replace(this.refNodeString, '');

        text.toArray().each(function (letter, index) {
            resultSet.push('<span class="hplink" linknumber="' + this.links.indexOf(link) + '">' + letter + '</span>');

            /** push separator back to text */
            if (index == (position - 1)) {
                resultSet.push(this.refNodeString);
            }
        }.bind(this));

        return resultSet.join('');
    },

    /** set up global events to observe links change */
    run:function () {
        if (this.isInit) {
            return;
        }

        this.isInit = true;

        /** if scrollBox changed, need to mark pane for updater */
        document.observe("keyup", function (e) {
            if (!this.links.length) {
                return;
            }

            var targetPane = Event.element(e);

            /** if target is not a textPane look in parents*/
            if (!targetPane.match('[id$="textPane"]')) {
                var parents = targetPane.up('[id$="textPane"]');

                return;
                /** no textPane found in parents, break update */
                if (!parents || 0 == parents.length) {
                    return;
                }

                targetPane = parents[0];
            }

            targetPane.setAttribute('panechanged', 'true');
        }.bind(this));

        /** link updater */
        clearInterval(this.interval);
        this.interval = setInterval(function () {
            if (!this.links.length) {
                return;
            }

            $$('[panechanged="true"]').each(function (pane) {
                this.updateHTMLLinks(pane);
                pane.setAttribute('panechanged', 'false');
            }.bind(this));
        }.bind(this), 3000);
    },

    /** most of code stealed from ghostWriter.setItemFromSelection, branch:XIIMAC-19665(ghostWriter) */
    setSelectionMarker:function (pane) {
        var isSelection = ( window.getSelection && !Prototype.Browser.Gecko && window.getSelection().rangeCount);

        if (!isSelection) {
            return 0;
        }

        var selection = window.getSelection(),
            range = selection.getRangeAt(0),
            selectionElement = $(range.startContainer.parentNode),
            selectionElementID = selectionElement.identify(),
            selectionEditableAncestors, editableElement, text, offset;

        selectionEditableAncestors = selectionElement.up('[contenteditable="true"]');

        /** is selection editable? */
        editableElement = ('true' == selectionElement.readAttribute('contenteditable')) ? selectionElement : '';

        /** is selection ancestors editable(look for textPane)? */
        if (!editableElement) {
            editableElement = (!Object.isUndefined(selectionEditableAncestors)) ? selectionEditableAncestors : '';
        }

        /** if card is completely blank selectionElement is card itself */
        if (!editableElement) {
            editableElement = (!Object.isUndefined(selectionElement.down('[contenteditable="true"]'))) ? selectionElement.down('[contenteditable="true"]') : '';
            selectionElement = editableElement;
        }

        /** element not found or selection is set in other textPane */
        if (!editableElement || editableElement != pane) {
            return 0;
        }

        range.insertNode(this.refNode);
    },

    restoreCursor:function (pane) {
        var element = $('refNode');

        if (Object.isUndefined(element) || null == element) {
            return;
        }

        var range = document.createRange();
        range.selectNodeContents(pane);

        try {
            range.setStart(element, 0);
            range.setEnd(element, 0);
        } catch (e) {
        }

        range.collapse(false);

        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        $('refNode').remove();

        //this.eventProcessing = false;
    }
});


Action.textComparator = {};

Action.textComparator.base = Class.create({
    initialize:function (condition) {
        this.initFlags();

        /** define how to compare in run function  */
        switch (condition) {
            case this.IS_GREATER_THAN:
                this.action = 'isGreaterThan';
                break;

            case this.IS_GREATER_THAN_OR_EQUAL_TO:
                this.action = 'isGreaterThanOrEqualTo';
                break;

            case this.IS_NOT_EQUAL_TO:
                this.action = 'isNotEqualTo';
                break;

            case this.IS_EQUAL_TO:
                this.action = 'isEqualTo';
                break;

            case this.IS_LESS_THAN_OR_EQUAL_TO:
                this.action = 'isLessThanOrEqualTo';
                break;

            case this.IS_LESS_THAN:
                this.action = 'isLessThan';
                break;

        /** contains is default */
            default:
                this.action = 'isContains';
        }
    },

    initFlags:function () {
        this.CONTAINS = 'HSCompareTextAction_contains:options:';
        this.IS_LESS_THAN = 'HSCompareTextAction_isLessThan:options:';
        this.IS_LESS_THAN_OR_EQUAL_TO = 'HSCompareTextAction_isLessThanOrEqualTo:options:';
        this.IS_EQUAL_TO = 'HSCompareTextAction_isEqualTo:options:';
        this.IS_NOT_EQUAL_TO = 'HSCompareTextAction_isNotEqualTo:options:';
        this.IS_GREATER_THAN_OR_EQUAL_TO = 'HSCompareTextAction_isGreaterThanOrEqualTo:options:';
        this.IS_GREATER_THAN = 'HSCompareTextAction_isGreaterThan:options:';
    },

    /* basic actions */
    isContains:function (a, b) {
        return false;
    },
    isLessThan:function (a, b) {
        return false;
    },
    isEqualTo:function (a, b) {
        return false;
    },
    /* and basic actions */

    isGreaterThan:function (a, b) {
        return !(this.isEqualTo(a, b) || this.isLessThan(a, b));
    },

    isLessThanOrEqualTo:function (a, b) {
        return !!(this.isEqualTo(a, b) || this.isLessThan(a, b));
    },

    isNotEqualTo:function (a, b) {
        return !this.isEqualTo(a, b);
    },

    isGreaterThanOrEqualTo:function (a, b) {
        return !this.isLessThan(a, b);
    },

    /**
     * force strings for comparison
     * @notice fix that if number(array, object) comparison should be implemented
     */
    run:function (a, b) {
        if (!this.action || !Object.isFunction(this[this.action])) {
            return false;
        }

        return this[this.action](a + '', b + '');
    }
});

Action.textComparator.ignoreCase = Class.create(Action.textComparator.base, {
    initialize:function ($super, condition) {
        try {
            $super(condition);
        } catch (err) {
            alert('textComparator.simple: initialize error:' + console.log(err));
        }
    },

    isContains:function (a, b) {
        return a.toLowerCase().include(b.toLowerCase());
    },

    isLessThan:function (a, b) {
        return a.toLowerCase() < b.toLowerCase();
    },

    isEqualTo:function (a, b) {
        return !!(a.toLowerCase() == b.toLowerCase());
    }
});

Action.textComparator.sensitive = Class.create(Action.textComparator.base, {
    initialize:function ($super, condition) {
        try {
            $super(condition);
        } catch (err) {
            alert('textComparator.sensitive: initialize error:' + console.log(err));
        }
    },

    isContains:function (a, b) {
        return a.include(b);
    },

    isLessThan:function (a, b) {
        return a < b;
    },

    isEqualTo:function (a, b) {
        return !!(a == b);
    }
});

/**
 * @notice numeric isLessThan, isEqualTo the same methods of textComparator.sensitive
 */
Action.textComparator.numeric = Class.create(Action.textComparator.sensitive, {
    initialize:function ($super, condition) {
        try {
            $super(condition);
        } catch (err) {
            alert('textComparator.numeric: initialize error:' + console.log(err));
        }
    },

    /* force string comparison */
    isContains:function (a, b) {
        return (a + '').include(b);
    },

    run:function (a, b) {
        if (!this.action || !Object.isFunction(this[this.action])) {
            return false;
        }

        return this[this.action](parseInt(a, 10), parseInt(b, 10));
    }
});

Action.playSound = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                info:'info'
            };

            Object.extend(this.options, options || {});
            $$("audio").each(function (el) {
                el.pause();
            });
            this.playHTMLSound(this.options.info);
        } catch (err) {
            alert('actions.Play sound: initialize error:' + console.log(err));
        }
    },

    playSound:function (info) {
        try {
            Sound.enable();
            info.sounds.each(function (sound) {
                Sound.play($(play.template.newCardElementId(cardsCollection.currentElement().id, sound.object)).src, {replace:true});
            });
        } catch (e) {
            console.log(e);
        }

        if (info.creator == 'cardUnload') setTimeout(function () {
            document.fire(play.template.cardUnloadActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else if (info.creator == 'cardLoad') setTimeout(function () {
            document.fire(play.template.cardLoadActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else if (info.creator == 'cardClick') setTimeout(function () {
            document.fire(play.template.cardActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else {
            setTimeout(function () {
                document.fire(play.template.cardElementEventDone(cardsCollection.currentElement().id, info.creator, (info.priority + 1)));
            }.bind(this), 100);
        }
    },

    stopAll:function (info) {
        if (true === info.hasOwnProperty("fadeOutTimeForStopAllSounds")) {
            $$("audio").each(function (el) {
                play.help.stopMedia(el, info.fadeOutTimeForStopAllSounds);
            });
        }

        if (info.creator == 'cardUnload') setTimeout(function () {
            document.fire(play.template.cardUnloadActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else if (info.creator == 'cardLoad') setTimeout(function () {
            document.fire(play.template.cardLoadActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else if (info.creator == 'cardClick') setTimeout(function () {
            document.fire(play.template.cardActionEventDone(cardsCollection.currentElement().id, (info.priority + 1)));
        }.bind(this), 100);
        else setTimeout(function () {
                document.fire(play.template.cardElementEventDone(cardsCollection.currentElement().id, info.creator, (info.priority + 1)));
            }.bind(this), 100);
    },

    onEnd:function (e) {
        /** arguments[0] - event, arguments[1] - info.creator, arguments[2] - info.priority*/
        var obj = e.element();
        obj.pause();
        mediaParams.setVolume(obj, parseInt(obj.volume, 10));

        if (play.lastActiveSound == obj.id) {
            // this allow to smartAudioActivator to load other sounds
            delete play.lastActiveSound;
        }

        play.help.seekMedia(obj, 'audio', obj.playStartTime);
        obj.isFadeOutStarted = false;

        if (--obj.playCountLeft > 0 && !obj.isLooped) {
            play.help.playMedia(obj, 'audio');
        } else if (obj.isLooped) {
            play.help.playMedia(obj, 'audio');
            Action.finishAction(arguments[1], parseInt(arguments[2]));
        } else {
            obj.stopOldObservers();
            Action.finishAction(arguments[1], parseInt(arguments[2]));
        }

        obj.fire("event:HSPlaySoundAction:end");
    },

    onPause:function (e) {
        if (Object.isUndefined(e.memo) || Object.isUndefined(e.memo.fromEndedEvent) || e.memo.fromEndedEvent != 1) {
            Action.finishAction(arguments[1], parseInt((arguments[2])));
        }
    },

    playHTMLSound:function (info) {
        try {
            /**For action with only sounds to stop*/
            if (Object.isUndefined(info.sounds)) {
                info.sounds = [];
            }
            /**EOF*/
            info.sounds.each(function (sound) {
                var obj = (play.mobileSafariMedia[sound.object] !== undefined)
                    ? play.mobileSafariMedia[sound.object]
                    : $(play.template.newCardElementId(cardsCollection.currentElement().id, sound.object));

                obj.playStartTime = parseFloat(sound.startTime);
                obj.playCountLeft = parseInt(sound.playCount);
                obj.mediaType = 'audio';

                if (!Object.isFunction(obj.play)) {
                    play.extendObject();
                }

                sound.isLooped = (sound.playCount == 0) ? 1 : 0;
                obj.isLooped = sound.isLooped;
                obj.isFadeOutStarted = false;

                // prepare obj event handlers
                var onEnd = this.onEnd.bindAsEventListener(info, info.creator, info.priority)
                    , onPause = this.onPause.bindAsEventListener(info, info.creator, info.priority)
                    , onStalled = function () {
                        if (!obj.paused && obj.id == play.lastActiveSound) {
                            obj.play();
                        }
                    }
                    , onWaiting = onStalled
                    , playEndTime = obj.playStartTime + parseFloat(sound.length)
                    , playLength = parseFloat(sound.length)
                    , fadeOutTime = parseFloat(sound.fadeOutTime);

                if (fadeOutTime > playLength) {
                    fadeOutTime = playLength;
                }

                if (fadeOutTime) {
                    playEndTime -= fadeOutTime;
                }

                var onTimeUpdate = function (e) {
                    if (obj.currentTime >= (playEndTime + 0.1) && !obj.isFadeOutStarted) {
                        if (--obj.playCountLeft > 0 && !obj.isLooped) {
                            play.help.seekMedia(obj, 'audio', obj.playStartTime);
                        } else if (obj.isLooped) {
                            play.help.seekMedia(obj, 'audio', obj.playStartTime);
                        } else {
                            play.help.stopMedia(obj, fadeOutTime);
                        }
                    }
                };

                mediaParams.setVolume(obj, sound.volume);

                obj.observe("event:HSPlaySoundAction:end", function (event) {
                    if (this.interval != null) {
                        var that = this;
                        window.setTimeout(function () {
                            that.playHTMLSound(info);
                        }, parseInt(this.interval) * 1000);
                    }
                }.bind(this));

                if (obj.stopOldObservers) {
                    obj.stopOldObservers();
                }

                if (obj.fadeOutInterval) {
                    clearInterval(obj.fadeOutInterval);
                }
                if (!isNaN(obj.duration) && parseInt(obj.duration) < 2) {
                    // simple player for tiny sounds
                    obj.stopOldObservers = function () {
                        obj.stopObserving("ended", onEnd);
                        obj.stopObserving("pause", onPause);
                        obj.stopObserving("stalled", onStalled);
                        obj.stopObserving("waiting", onWaiting);
                        obj.stopObserving("timeupdate", onTimeUpdate);

                        delete obj.stopOldObservers;
                    };

                    obj.observe("ended", onEnd);
                    obj.observe("pause", onPause);
                    obj.observe("stalled", onStalled);
                    obj.observe("waiting", onWaiting);
                    obj.observe("timeupdate", onTimeUpdate);

                    play.help.seekMedia(obj, 'audio', obj.playStartTime);
                    play.help.playMedia(obj, 'audio');
                    Action.finishAction(info.creator, parseInt((info.priority)));
                } else {
                    // not simple player
                    obj.stopOldObservers = function () {
                        obj.stopObserving("ended", onEnd);
                        obj.stopObserving("pause", onPause);
                        obj.stopObserving("stalled", onStalled);
                        obj.stopObserving("waiting", onWaiting);
                        obj.stopObserving("timeupdate", onTimeUpdate);

                        delete obj.stopOldObservers;

                        if (play.flashAudio) {
                            clearInterval(soundInterval);
                        }
                    };

                    obj.observe(obj.id + ":ready", function () {

                        if (!play.flashAudio) {
                            obj.observe("stalled", onStalled);
                            obj.observe("waiting", onWaiting);
                            obj.observe("timeupdate", onTimeUpdate);
                        } else {
                            var soundInterval = setInterval(function () {
                                var currentPlayTime = obj.currentTime();

                                if (Object.isUndefined(obj.playing)) {
                                    obj.playing = true;
                                }

                                if (currentPlayTime >= playEndTime && obj.playing && !obj.isFadeOutStarted) {
                                    play.help.stopMedia(obj, fadeOutTime);
                                }
                            }, 500);
                        }

                        obj.observe("ended", onEnd);
                        obj.observe("pause", onPause);
                        obj.stopObserving(obj.id + ":ready");
                    }.bind(this));

                    Action.finishAction(info.creator, info.priority);
                    /** fix bug X2IBA-1339 */

                    play.help.prepareAndPlayMedia(obj, 'audio', obj.playStartTime);
                }
            }.bind(this));
            //if(!isTouchDevice()){
            if (Object.isUndefined(info.soundsToStop)) {
                info.soundsToStop = [];
            }

            info.soundsToStop.each(function (sound) {
                var obj = (play.mobileSafariMedia[sound.id] !== undefined)
                    ? play.mobileSafariMedia[sound.id]
                    : $(play.template.newCardElementId(cardsCollection.currentElement().id, sound.id));

                var fadeOutTime = parseInt(sound.fadeOutTime);

                if (Object.isUndefined(obj.playing)) {
                    obj.playing = false;
                }

                if (!obj.paused || obj.playing) {
                    play.help.stopMedia(obj, fadeOutTime);
                }
            });
            //}
            // dropoff events don't want to wait sounds, so we run finishAction immediately (X2IBA-318)
            if (Droppables.haveDelayedDropOffs()) {
                Action.finishAction(info.creator, parseInt(info.priority));
            }
        } catch (e) {
            console.log(e);
        }
    }
});

Action.playVideo = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:"info"
            };
            Object.extend(this.options, options || {});

            this.options.item.movies.each(function (movie) {
                var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, movie.object));
                var objModel = play.help.getObjectByCardId(obj.id);

                if (!Object.isElement(obj)) {
                    return;
                }

                obj.setAttribute("data-length", Number(objModel.length) * 1000);

                if (obj.hasAttribute("isvisible")) {
                    obj.isVisible = obj.readAttribute("isvisible");
                    //obj.removeAttribute("isvisible");
                }
                if (obj.isVisible != 1) {
                    obj.pause();
                    obj.paused = true;
                    obj.isPausedFromHideAction = true;
                    Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
                    Element.store(obj, 'playVideoOptions', options);
                } else {
                    this.setOptions(movie);
                    var that = this;
                    obj.observe("event:HSPlayMovieAction:end", function (event) {
                        if (parseInt(movie.playCount, 10) === 0) {
                            obj.play();
                        } else if (that.options.interval !== null) {
                            window.setTimeout(function () {
                                obj.currentTime = movie.startTime;
                                obj.play();
                            }, parseInt(that.options.interval) * 1000);
                        } else if (objModel.hasOwnProperty("interval")) {
                            window.setTimeout(function () {
                                obj.currentTime = movie.startTime;
                                obj.play();
                            }, parseInt(objModel.interval) * 1000);
                        }
                    });

                    this.playVideo(movie);
                }
            }.bind(this));

            if (this.options.item.creator === "cardLoad") {
                this.options.item.movies.each(function (info) {
                    obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, info.object));

                    if (!Object.isElement(obj)) {
                        return;
                    }

                    obj.setAttribute("playonstart", "playonstart");
                });
            }
        } catch (err) {
            alert('playerObj: initialize error: ' + console.log(err));
        }
    },

    onEnd:function (e) {
        var obj = e.element();
        obj.pause();
        obj.isFadeOutStarted = false;
        if (--obj.playCountLeft > 0) {
            if (!play.flashVideo) {
                obj.observe("timeupdate", obj.htmlTimeUpdate);
            }
            obj.currentTime = obj.playStartTime;
            play.help.playMedia(obj, 'video');
        } else {
            if (play.flashVideo) {
                clearInterval(obj.videoInterval);
            }

            obj.stopObserving("timeupdate", obj.htmlTimeUpdate);

            if (obj.isEraseWhenDone == 1 && !obj.isLooped) {
                setTimeout(function () {
                    obj.hide();
                }.bind(this), 300);
            }

            Action.finishAction(arguments[1], parseInt(arguments[2]));
        }

        obj.fire("event:HSPlayMovieAction:end");
        Action.finishAction(this.options.item.creator, this.options.item.priority);
        /** fix bug X2IBA-1339 */
    },

    onPause:function (e) {//alert(arguments.callee);
        if (Object.isUndefined(e.memo) || Object.isUndefined(e.memo.fromEndedEvent) || e.memo.fromEndedEvent != 1) {
            Action.finishAction(arguments[1], parseInt(arguments[2]));
        }
    },

    playVideo:function (info) {
        var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, info.object));
        obj.playStartTime = parseFloat(info.startTime);

        var playLength = parseFloat(info.length),
            playEndTime = obj.playStartTime + playLength,
            fadeOutTime = parseInt(info.fadeOutTime);

        if (fadeOutTime > playLength) {
            fadeOutTime = playLength;
        }

        if (fadeOutTime) {
            playEndTime -= fadeOutTime;
        }

        obj.mediaType = 'video';

        var onEnd = this.onEnd.bindAsEventListener(this, this.options.item.creator, this.options.item.priority)
            , onPause = this.onPause.bindAsEventListener(this, this.options.item.creator, this.options.item.priority);

        if (!Object.isElement(obj) || obj.isVisible != 1) {
            Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));

            return;
        }

        if (obj.tagName.toLowerCase() == 'div') {
            obj.isPng = true;
            Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));

            if (obj.playing) {
                obj.stop();
            }
        }
        /**
         * XIIMAC-21401 fix
         * (dont need this fix now)
         if(Prototype.Browser.WebKit&&!Object.isUndefined(obj.currentTime)&&!Object.isUndefined(obj.duration)&&(obj.duration==obj.currentTime)){
			obj.currentTime = 0;
		}
         /**
         * EOF XIIMAC-21401 fix
         */
        /* On second playing the movie we probably dont want to run this functions twicy */

        if (obj.cleanupOldObservers) {
            obj.cleanupOldObservers();
        }

        obj.htmlTimeUpdate = function (e) {
            if (obj.currentTime >= playEndTime + 0.01) {
                play.help.stopMedia(obj, fadeOutTime);
            }
            /* var cTime = obj.currentTime,
             timeRange = cTime - obj.tmpTimeUpdate;

             if (!obj.isFadeOutStarted && (cTime >= playEndTime || (timeRange <= 0.25 && (cTime + timeRange >= playEndTime)))) {
             play.help.stopMedia(obj, fadeOutTime);
             }

             obj.tmpTimeUpdate = cTime; fix 2090 */
        };
        obj.observe(obj.id + ":ready", function () {
            if (play.flashVideo) {
                /*obj.videoInterval = setInterval(function () {
                 var currentPlayTime = obj.currentTime();

                 if (currentPlayTime >= playEndTime && obj.playing && !obj.isFadeOutStarted) {
                 play.help.stopMedia(obj, fadeOutTime);
                 }
                 }, 500);*/
            } else {
                //init current time to calc timeupdate inerval
                obj.tmpTimeUpdate = obj.currentTime;
                obj.observe("timeupdate", obj.htmlTimeUpdate);
            }
            obj.observe("ended", onEnd);
            obj.observe("pause", onPause);
            obj.stopObserving(obj.id + ":ready");
        });

        obj.cleanupOldObservers = function () {
            obj.stopObserving("ended", onEnd);
            obj.stopObserving("pause", onPause);
            obj.stopObserving("timeupdate", obj.htmlTimeUpdate);
            delete obj.tmpTimeUpdate;
            if (play.flashVideo) {
                clearInterval(obj.videoInterval);
            }
        };

        // next line was commented by Lepekha E. (fix bug X2IBA-642) and moved to this.onEnd() method
        //Action.finishAction(this.options.item.creator, this.options.item.priority);
        /** fix bug X2IBA-1339 */
        play.help.prepareAndPlayMedia(obj, 'video', obj.playStartTime);
    },

    setOptions:function (info) {
        var obj = $(play.template.newCardElementId(cardsCollection.currentElement().id, info.object));
        mediaParams.setVolume(obj, info.volume);
        if (!Object.isElement(obj) || obj.isVisible != 1) {
            return;
        }

        obj.style.visibility = "visible";
        /** fix bug X2IBA-1339 */
        /** fix bug X2IBA-1323 */
        if (this['options']['item']['creator'] == "cardLoad" && info.isShowFirstFrame == "0") {
            obj.showVideo = false;
        } else {
            obj.show();
        }

        /**Bug XIIMAC-19773 FIX*/
        if (!Object.isUndefined(obj.stopOtherMovies) && obj.stopOtherMovies == 1) {
            setTimeout(function () {
                play.help.stopAllMovies();
                this.playVideo(info);
            }.bind(this), 50);
        }
        if (!Object.isUndefined(obj.stopOtherSounds) && obj.stopOtherSounds == 1) {
            setTimeout(function () {
                play.help.stopAllSounds();
            }.bind(this), 50);
        }
        /**EOF Bug XIIMAC-19773 FIX*/
        if (info.isPlayOnTop == 1) {
            obj.style.zIndex = 9999;
        } else {
            /**X2iBA-310 FIX*/
            //obj.style.zIndex = 0;
            /**EOF*/
        }
        info.isLooped = (info.playCount == 0) ? 1 : 0;
        obj.isLooped = info.isLooped;
        //else obj.style.zIndex = 0;
        //alert(info.isLooped);
        obj.playCountLeft = (info.playCount >= 1) ? parseInt(info.playCount) : 0;
        obj.isEraseWhenDone = info.isEraseWhenDone;
        obj.isFadeOutStarted = false;
        /*
         if(info.isLooped == 1){
         mediaParams.setLoop(obj,info.isLooped);
         }
         */
        if (info.useMovieController == 1) {
            play.createVideoControls(obj);
        }
    }
});

Action.playVideoSequence = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                imgElement:$('imgElement'),
                imagesTemplate:Array(),
                imagesCount:10
            };
            Object.extend(this.options, options || { });
            this.counter = 0;
            this.imgElement = this.options.imgElement;
            this.imagesCount = this.options.imagesCount;

            /***/
            this.setRate(r);
            this.playbackRate = this.getRate();

            this.playing = false;
            this.duration = t;
            /***/

            /**here we'll populate our apositions array*/
            for (var i = 0; i <= this.options.imagesCount; i++) {
                (i < 10) ? i = '0' + i : '';
                this.images.push(this.template.evaluate({num:i}));
            }
        } catch (err) {
            console.log(err);
        }
    },

    play:function () {
        this.playing = true;
        var i = this.counter + 1;
        this.imgInterval = setInterval(function () {
            if (!$(this.imgElement.id) || $(this.imgElement.id) == 'undefined' || $(this.imgElement.id) == 'null') {

                this.stopSequence();
            }
            else {
                if (i > this.imagesCount) i = 0;
                $(this.imgElement.id).src = this.images[i];
                i++;
            }

        }.bind(this), 33);
    },

    stop:function () {
        this.playing = false;
        clearInterval(this.imgInterval);
        this.counter = 0;
    },

    pause:function () {
        this.playing = false;
        this.paused = true;
        clearInterval(this.imgInterval);
    },

    nextFrame:function () {
        ++this.counter;
        this.currentTime = t;
        $(this.imgElement.id).src = this.images[this.counter];
    },

    prevFrame:function () {
        --this.counter;
        this.currentTime = t;
        $(this.imgElement.id).src = this.images[this.counter];
    },

    load:function (src) {
        this.frameSprite = src;
        this.currentFrame = [0, 0];
    },

    setRate:function (r) {
        this.rate = r;
    },

    getRate:function () {
        return this.rate;
    }
});

Action.playItemAnimation = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item',
                length:'0',
                cardId:'cardId',
                type:'other',
                sequence:false
            };

            Object.extend(this.options, options || {});

            this.type = this.options.type;
            this.pointsLength = this.options.item.points.length;
            this.length = this.options.length;
            this.sequence = this.options.sequence;
            this.counter = 0;
            this.repeats = 0;
            this.animationDirection = 0;
            this.speedMode = this.options.item.speedMode;
            this.animateObjectsArray = [];
            var timingModifier = 0;

            switch (this.speedMode) {
                case '1':
                    timingModifier = +this.options.item.clampedDuration;
                    break;
                case '2':
                    timingModifier = +this.options.item.timesPerSecond;
                    break;
                case '0':
                    timingModifier = +this.options.item.speedMultiplier;
                    break;
                default:
                    timingModifier = +this.options.item.clampedDuration;
                    break;
            }

            var animatedItem = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.options.item.object))
                , itemInProcess = animatedItem.inProcess;

            if (this.length > 1) {
                this.sync = this.options.item.creator;
            }
            if (Object.isUndefined(this.options.item.reverseOnStart)) {
                this.options.item.reverseOnStart = this.options.item.playbackDirection;
            } else {
                this.options.item.reverseOnStart = 0;
            }
            var points = this.preparePoints(this.options.item.points, this.options.item.reverseOnStart);
            this.options.item.koeff = this.getSpeedModificator(points, this.speedMode, timingModifier);
            if (!itemInProcess) {
                if (this.options.interval !== null) {
                    var that = this
                        , interval = window.setInterval(function () {
                            that.playItemAnimation(that.options.item, that.length, that.options.cardId, points, that.options.item.playbackDirection, that.options.item.koeff, that.speedMode);
                        }, parseInt(this.options.interval) * 1000);
                } else {
                    this.playItemAnimation(this.options.item, this.length, this.options.cardId, points, this.options.item.playbackDirection, this.options.item.koeff, this.speedMode);
                }
            }
            $(play.template.cardId(cardsCollection.currentElement().id)).observe("event:restoreStack", function () {
                this.effects.forEach(function (effect) {
                    effect.cancel();
                });
                animatedItem.inProcess = false;
            }.bind(this));
        } catch (err) {
            alert('playerObj: playItemAnimation error:' + console.log(err));
        }
    },

    state:'inactive',

    key:'',

    type:'',

    sequence:false,
    effects:[],

    getSpeedModificator:function (points, speedMode, timingModifier) {
        var duration = points[points.length - 1].t;

        switch (speedMode) {
            case '0':
                var koeff = timingModifier;
                break;
            case '1':
                var koeff = duration / timingModifier;//timingModifier / duration;
                break;
            case '2':
                var koeff = 1 / timingModifier;
                break;
            default:
                var koeff = timingModifier;
                break;
        }

        return koeff;
    },

    playItemAnimation:function (item, length, cardId, points, playbackDirection, speedMultiplier, speedMode) {
        item.id = play.template.newCardElementId(cardsCollection.currentElement().id, item.object);
        var itemElement = $(item.id);

        if (!Object.isElement($(item.id))) {
            return;
        }
        if (Object.isElement($(itemElement.id + "_image"))) {
            itemElement = $(itemElement.id + "_image");
        }
        itemElement.inProcess = true;
        /**cloning element at start*/
        if (this.options.playbackDirection != 1) {
            this.objectInitialPosition = {x:itemElement.style.left, y:itemElement.style.top};
            this.setNoFlip(itemElement);
        }
        /**EOF*/

        /**Checking if the animated object is images  sequence*/
        var itemObject = itemElement
            , duration = (this.sequence) ? 0.045 : 0.5;

        this.animateObject = itemObject;
        if (parseInt(this.options.item.hideMode) == 1) {
            this.animateObjectsArray = [];
        }
        var scopeName = cardId + 'goto' + item.id;
        counterJ = {};
        var _this = this;

        if (!_this.sync) {
            _this.sync = item.id;
        }

        counterJ[_this.sync] = 0;
        /***/

        if (this.options.playbackDirection == 1) {
            if (this.options.item.horizontalFlipAtFinish == 1 && this.options.item.verticalFlipAtFinish == 0) {
                this.setHorizontalFlip(itemObject);
            } else if (this.options.item.verticalFlipAtFinish == 1 && this.options.item.horizontalFlipAtFinish == 0) {
                this.setVerticalFlip(itemObject);
            } else if (this.options.item.verticalFlipAtFinish == 1 && this.options.item.horizontalFlipAtFinish == 1) {
                this.setFullFlip(itemObject);
            } else if (this.options.item.horizontalFlipAtStart == 1 && this.options.item.verticalFlipAtStart == 0) {
                this.setHorizontalFlip(itemObject);
            } else if (this.options.item.verticalFlipAtStart == 1 && this.options.item.horizontalFlipAtStart == 0) {
                this.setVerticalFlip(itemObject);
            } else if (this.options.item.verticalFlipAtStart == 1 && this.options.item.horizontalFlipAtStart == 1) {
                this.setFullFlip(itemObject);
            }
        }

        if (itemObject.play) {
            itemObject.play();
        }

        itemElement.setStyle("top:" + points[0].y + "px;" +
            "left:" + points[0].x + "px;" +
            "display:block;");

        points.each(function (point, itemNumber) {
            try {
                var nextPoint = ++itemNumber;
                if (!Object.isUndefined(item.points[nextPoint])) {
                    var iterationDurr = Math.abs(item.points[nextPoint].t - point.t) / speedMultiplier;//parseFloat(this.options.item.speedMultiplier);

                    if (speedMode == 2) {
                        iterationDurr = speedMultiplier;
                    }
                    var ef = new Effect.Move(this.animateObject, {x:item.points[nextPoint].x, y:item.points[nextPoint].y,
                        mode:'absolute', transition:Effect.Transitions.linear,
                        duration:iterationDurr, queue:{ scope:scopeName, position:'end'},
                        beforeUpdate:function (effect) {
                            if (itemObject.paused || itemObject.ended) {
                                console.log("start  ");
                                itemObject.play();
                            }
                            /**Layers handling*/
                            this.animateObject.style.zIndex = play.help.getAnimationZIndex(this.animationDirection, this.options.item);

                            /**EOF*/
                            if (this.animationDirection == 0) {
                                /**dont erase going*/
                                if (this.options.item.eraseGoing == 0) {
                                    this.animateObject = this.cloneElement(this.animateObject, point);
                                    this.animateObjectsArray.push(this.animateObject);
                                    this.animateObject.show();
                                }
                                /**EOF*/
                            } else if (this.animationDirection == 1) {
                                /**dont erase returning*/
                                if (this.options.item.eraseReturning == 0) {
                                    this.animateObject = this.cloneElement(this.animateObject, point);
                                    this.animateObjectsArray.push(this.animateObject);
                                    this.animateObject.show();
                                }
                                /**EOF*/
                            }
                        }.bind(this),
                        afterFinish:function (effect) {
                            _this.counter++;
                            if (_this.counter >= parseInt(_this.pointsLength - 1)) {
                                ++counterJ[_this.sync];

                                if (counterJ[_this.sync] >= length || Object.isUndefined(counterJ[_this.sync]) || !counterJ[_this.sync]) {
                                    try {
                                        /**Finishing Action*/
                                        itemObject.inProcess = false;
                                        Try.these(function () {
                                            console.log("pause 1");
                                            itemObject.pause();
                                        }.bind(this));

                                        if (this.repeats < 1 && this.checkAutoReverse()) {
                                            this.repeats++;
                                            return;
                                        }
                                        var timer = 'automaticTimer';

                                        Action.finishAction(this.options.item.creator, this.options.item.priority);
                                        Try.these(
                                            function () {
                                                console.log("pause 2");
                                                itemObject.pause();
                                            }) || '';

                                        if (this.options.item.autoReverse == 1) {
                                            this.options.item.points.reverse();
                                        }
                                        /**XIIMAC-19820, X2IBA-257 FIX*/
                                        if ([2, 3].include(parseInt(this.options.item.hideMode))) {
                                            itemObject.hide();
                                            this.animateObjectsArray.each(function (el) {
                                                el.parentNode.removeChild(el);
                                            });
                                        }
                                        /**EOF*/
                                        /**EOF*/

                                        /**Loop Mode*/
                                        if (this.options.item.loopMode == 1) {
                                            if (!Object.isUndefined(this.objectInitialPosition)) {
                                                this.animateObject.setStyle("top:" + this.objectInitialPosition.y + ";left:" + this.objectInitialPosition.x + ";");
                                            }
                                            new Action.playItemAnimation(this.options);
                                        }
                                        if (this.options.item.loopMode == 2 && item.loopPathRepeats > 1) {
                                            var nextLoopOptions = Object.clone(this.options);
                                            nextLoopOptions.item = Object.clone(this.options.item);
                                            nextLoopOptions.item.loopPathRepeats--;

                                            if (!Object.isUndefined(this.objectInitialPosition)) {
                                                this.animateObject.setStyle("top:" + this.objectInitialPosition.y + ";left:" + this.objectInitialPosition.x + ";");
                                            }
                                            new Action.playItemAnimation(nextLoopOptions);
                                        }
                                        /**EOF*/
                                    } catch (err) {
                                        if (play.options.test) {
                                            alert(err);
                                        }
                                    }
                                }
                            }
                        }.bind(this)
                    });
                    this.effects.push(ef);
                }
            } catch (err) {
                console.log(err);
                return;
            }
        }.bind(this));
    },

    preparePoints:function (points, direction) {
        if (direction == 1) {
            points = points.reverse();
        }

        return points;
    },

    cloneElement:function (item, point) {
        if (!Object.isUndefined(item)) {
            if (!this.cloneElement.original) {
                this.cloneElement.original = item;
            }
            if (!this.cloneElement.originalModel) {
                this.cloneElement.originalModel = play.help.getObjectByCardId(item.id);
            }

            var original = this.cloneElement.original;
            var originalModel = this.cloneElement.originalModel;

            var object = original.clone();
            if (!Object.isUndefined(point)) object = this.setPosition(object, point);
            object.style.zIndex = "1";
            object.id = object.id + "clone" + new Date().getTime();

            if (originalModel.type == "video" && originalModel.isPNGMap == "1") {
                object.style.backgroundPosition = original.style.backgroundPosition;
            }

            $(play.template.cardId(cardsCollection.currentElement().id)).insert(object);
            return object;
        }
    },

    setPosition:function (object, point) {
        object.style.top = point.y + "px";
        object.style.left = point.x + "px";
        object.hide();

        return object;
    },

    checkAutoReverse:function () {
        if (this.options.item.autoReverse == 1) {
            this.counter = 0;
            this.options.playbackDirection = 1;
            this.animationDirection = (this.animationDirection == 1) ? 0 : 1;
            var points = this.preparePoints(this.options.item.points, 1);

            if (this.options.interval !== null) {
                var that = this
                    , interval = window.setInterval(function () {
                        that.playItemAnimation(that.options.item, that.length, that.options.cardId, points, that.options.playbackDirection, that.options.item.koeff, that.speedMode);
                    }, parseInt(this.options.interval) * 1000);
            } else {
                this.playItemAnimation(this.options.item, this.length, this.options.cardId, points, this.options.playbackDirection, this.options.item.koeff, this.speedMode);
            }

            return true;
        } else {
            return false;
        }
    },

    setNoFlip:function (itemElement) {
        if (!Object.isUndefined(itemElement.modelParams)) {
            play.setTransformation(itemElement, itemElement.modelParams, itemElement.horizontalFlip, itemElement.verticalFlip);
        } else {
            itemElement.setStyle(play.getTransformationRule(['scale(1,1)']));
        }
    },

    setVerticalFlip:function (itemElement) {
        var obj = new WebKitCSSMatrix();
        obj.setMatrixValue(itemElement.style.webkitTransform);

        if (!Object.isUndefined(itemElement.modelParams)) {
            play.setTransformation(itemElement, itemElement.modelParams, itemElement.horizontalFlip, (obj.d == 1));
        } else {
            itemElement.setStyle(play.getTransformationRule(['scaleY(' + (obj.d * -1) + ')']));
        }
    },

    setHorizontalFlip:function (itemElement) {
        var obj = new WebKitCSSMatrix();
        obj.setMatrixValue(itemElement.style.webkitTransform);

        if (!Object.isUndefined(itemElement.modelParams)) {
            play.setTransformation(itemElement, itemElement.modelParams, (obj.a == 1), itemElement.verticalFlip);
        } else {
            itemElement.setStyle(play.getTransformationRule(['scaleX(' + (-(obj.a)) + ')']));
        }
    },

    setFullFlip:function (itemElement) {
        var obj = new WebKitCSSMatrix();
        obj.setMatrixValue(itemElement.style.webkitTransform);

        if (!Object.isUndefined(itemElement.modelParams)) {
            play.setTransformation(itemElement, itemElement.modelParams, (obj.a == 1), (obj.d == 1));
        } else {
            itemElement.setStyle(play.getTransformationRule(['scale(' + (obj.a * -1) + ',' + (obj.d * -1) + ')']));
        }
    }
});

Action.playImaHomeStack = Class.create({
    initialize:function (options) {
        this.options = {
            item:'item'
        };
        Object.extend(this.options, options || { });
        play.homeStackPrefix = prefix;
        Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
        return true;
    }
});

Action.playHide = Class.create({

    initialize:function (options) {
        try {
            this.options = {
                item:'item',
                anotherCard:false
            };

            Object.extend(this.options, options || { });
            if (this.options.anotherCard) {
                play.help.setCardObjectVisibilityFlag(this.options.item.object, "hide");
                Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
                return;
            }
            else {
                cardsCollection.currentElement().objects.each(function (el) { // TODO needs to be refactored!!!
                    if (el.id == this.options.item.object) {
                        //el.isVisible = '0';
                        throw $break;
                    }
                    ;
                }, this);
            }
            this.hide(this.options.item);
        }
        catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    hide:function (item) {
        var obj = $('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object),
            canvObj = $('TransitionCanvasCard' + cardsCollection.currentElement().id + 'cardObjects' + item.object);

        if (!Object.isElement(obj) || Object.isElement(canvObj)) {
            return;
        }
        if (obj.tagName.toLowerCase() == "canvas") {
            obj.hide();
            Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
        }
        else {
            if (obj.getStyle('display') != "none"/*&&obj.isVisible!=0*/) {
                new transitions({
                    currentElement:obj,
                    nextElement:obj,
                    effect:item.hideEffect,
                    durr:item.hideDuration,
                    mode:'hide'
                });
            }
            setTimeout(function () {
                Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
            }.bind(this), item.hideDuration * 1000);
        }

        if (typeof($('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image')) != 'null' && Object.isElement($('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'))) {
            new transitions({
                currentElement:$('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'),
                nextElement:$('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'),
                effect:item.hideEffect,
                durr:item.hideDuration,
                mode:'hide'
            });
            setTimeout(function () {
                Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
            }.bind(this), item.hideDuration * 1000);
        }

        $('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object).isVisible = 0;

        Try.these(function () {
            var obj = $('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object);
            /**FOR 20435*/
            if (!obj.paused && !obj.ended) {
                obj.pause();
                obj.paused = true;
                obj.isPausedFromHideAction = true;
            }
            /**EOF*/
        }.bind(this));
    }
});

Action.playShow = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item',
                anotherCard:false
            };

            Object.extend(this.options, options || { });
            if (this.options.anotherCard) {
                play.help.setCardObjectVisibilityFlag(this.options.item.object, "show");
                Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
                return;
            }
            else {
                cardsCollection.currentElement().objects.each(function (el) { // TODO needs to be refactored!!!
                    if (el.id == this.options.item.object) {
                        //el.isVisible = '1';
                        throw $break;
                    }
                    ;
                }, this);
            }
            if (!Object.isUndefined(this.options.item.showDuration)) {
                this.duration = (this.options.item.showDuration);
            }
            else this.duration = 0;

            this.show(this.options.item);
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    show:function (item) {
        var obj = $('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object),
            canvObj = $('TransitionCanvasCard' + cardsCollection.currentElement().id + 'cardObjects' + item.object);


        if (!Object.isElement(obj) || Object.isElement(canvObj)) {
            return;
        }

        if (obj.tagName.toLowerCase() == "canvas") {
            obj.show();
            Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
        } else {
            if (obj.getStyle('display') == "none"/* && obj.isVisible!='1'*/) {

                new transitions({
                    currentElement:obj,
                    nextElement:obj,
                    effect:item.showEffect,
                    durr:item.showDuration,
                    mode:'show'
                });
                setTimeout(function () {
                    Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
                }.bind(this), item.showDuration * 1000);

            }
        }
        if (typeof($('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image')) != 'null' && Object.isElement($('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'))) {
            new transitions({
                currentElement:$('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'),
                nextElement:$('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image'),
                effect:item.showEffect,
                durr:item.showDuration,
                mode:'show'
            });
            setTimeout(function () {
                Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
            }.bind(this), item.showDuration * 1000);
            //$('Card'+cardsCollection.currentElement().id + 'cardObjects' + item.object + '_image')[this.effect]({duration:this.duration});
        }

        //obj.isVisible = 1;
        /**FOR 20435*/
        Try.these(function () {
            if (obj.isPausedFromHideAction == true) {
                obj.isPausedFromHideAction = false;
                obj.isVisible = 1;
                //fix bug X2IBA-1699
                var tmpGetOption = Element.retrieve(obj, 'playVideoOptions');
                if (Object.isUndefined(tmpGetOption)) {
                    obj.play();
                }
                else {
                    new Action.playVideo(tmpGetOption);
                }
            } else {
                obj.isVisible = 1;
            }
        }.bind(this));
        /**EOF*/
        /**FOR 20483*/
        if (Prototype.Browser.IE && obj.tagName.toLowerCase() == 'video' && obj.paused == true) {
            obj.load();
        }
        /**EOF*/

        /* if automatic timer is set on hidden object, run it after show and clear property */
        obj.delayedTimer && obj.delayedTimer() && delete obj.delayedTimer;
        //Action.finishAction(item.creator,(item.priority));
    }
});

/** show/hide wrapper */
Action.playToggle = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item',
                anotherCard:false
            };

            Object.extend(this.options, options || { });

            if (this.options.anotherCard) {
                play.help.setCardObjectVisibilityFlag(this.options.item.object, "toggle");
                return;
            }

            this.toggle(this.options.item);
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    toggle:function (item) {
        /* if object is visible - hide it */
        if ($('Card' + cardsCollection.currentElement().id + 'cardObjects' + item.object).style.display != "none") {
            return new Action.playHide({
                item:item,
                anotherCard:this.options.anotherCard
            });
        }

        /* otherwise show it */
        return new Action.playShow({
            item:item,
            anotherCard:this.options.anotherCard
        });
    }
});

Action.playWebPage = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };

            Object.extend(this.options, options || {});
            this.openWebPage(this.options.item);
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    openWebPage:function (item) {
        try {
            var a = document.createElement("a");
            a.setAttribute("href", item.href);
            a.setAttribute("target", "_blank");

            var event = document.createEvent("HTMLEvents");
            event.initEvent("click", true, true);
            a.dispatchEvent(event);

            //window.document.location.href = item.href;

            Action.finishAction(item.creator, item.priority);
        } catch (err) {
            console.log(err);
        }
    }
});

Action.playSendMail = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };

            Object.extend(this.options, options || { });
            this.addr = "";
            this.subject = this.options.item.subject;

            if (this.options.item.addresses.length > 1) {
                this.options.item.addresses.each(function (el) {
                    this.addr += el.email + ';';
                }.bind(this));
            } else {
                this.addr += this.options.item.addresses[0].email;
            }

            this.sendMail(this.item);
        } catch (err) {
            alert('Action.playSendMail: initialize error:' + console.log(err));
        }
    },

    sendMail:function (item) {
        try {
            var url = "mailto:" + this.addr + "?subject=" + this.subject + '&body=';

            new Action.playWebPage({
                item:{"href":url}
            });
        } catch (err) {
            console.log(err);
        }
    }
});

Action.playPrintCard = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0
            };
            Object.extend(this.options, options || { });
            this.printCard();
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    printCard:function () {
        // window.print pause js execution on Safari.
        setTimeout(function () {
            window.print();
        }, 200);
        Action.finishAction(this.options.creator, this.options.priority);

    }
});

/**
 * @NOTICE ghostWriter prepend data if no selection found
 */
Action.playGhostWriter = Class.create({
    initialize:function (options) {
        try {
            this.initFlags();

            this.options = {
                creator:'',
                priority:0,
                item:'item',
                data:'data',
                speed:this.DEFAULT_SPEED
            };

            Object.extend(this.options, options || { });

            /** main element to work with */
            this.selectionElement = null;
            this.testEl = new Element('div');
            /** no selection api - no dancing */
            if (!window.getSelection) {
                return;
            }

            /** if some writer was set, trigger finish action on it */
            if (Object.isFunction(play.ghostWriterFinishObserver)) {
                play.ghostWriterFinishObserver();
                play.ghostWriterFinishObserver = '';
            }

            var isSelection = (!Prototype.Browser.Gecko &&
                window.getSelection().rangeCount &&
                /*IE9 bug*/window.getSelection().getRangeAt(0).startContainer.parentNode.tagName.toLowerCase() != 'body');
            this.item = (isSelection) ? this.findItemFromSelection() : this.findBottomItem();

            if (Object.isUndefined(this.item) || false == this.item || null == $(this.item)) {
                return false;
            }

            this.contPane = $(this.item.id + 'textPane');
            this.findSelectionElement();

            //return;
            this.data = this.transformGhostData(this.options.data);
            this.run(this.data, this.options.speed);

            /** stop event on any click */
            this.stopObserver = this.finishAction.bindAsEventListener(this);
            document.observe(play.trackEvents.start, this.stopObserver);
            play.ghostWriterFinishObserver = this.stopObserver;
        } catch (err) {
            alert('Action.playGhostWriter: initialize error:' + console.log(err));
        }
    },

    initFlags:function () {
        this.ACTIONS = $H({ 'erase':'erase', 'backspace':'backspace',
            'move left':'moveLeft', 'move right':'moveRight'
        });

        this.GOTO_ACTION = 'goto';

        this.SPEEDS = [ /* never used */'10', '10', '50', '100',
            '200', '500', '1000', '3000'];

        /* default speed is normal(4th index -> 200ms) */
        this.DEFAULT_SPEED = this.SPEEDS[4];

        this.STRING_DEVIDER = '[<[[--devider--]]>]';
        this.POINTER_TO_ACTION = '[<[[--action--]]>]';
        this.POINTER_TO_SPEED = '[<[[--speed--]]>]';
        this.POINTER_TO_GOTO = '[<[[--goto--]]>]';
        this.CURSOR = 'text';//'url(data/engine/templates/img/bb.png), pointer';
    },

    findSelectionElement:function () {
        /** check this out */
        if (Prototype.Browser.Gecko) {
            return;
        }
        this.contPane.removeAttribute("contenteditable");
        /** selection is 'live' object */
        var selection = window.getSelection();

        if (this.contPane.children.length > 0) {
            selection.extend(this.contPane.children[0], 0);
        }
        this.findSelectionElementFromPane();
        this.offset = this.contPane.firstChild.textContent.length;

        this.contPane.setAttribute("contenteditable", "true");
    },

    findSelectionElementFromPane:function (selection) {

        selection = selection || window.getSelection();

        /* if contentPane totally blank, append empty textNode */
        if (!this.contPane.childNodes.length) {
            this.contPane.appendChild(document.createTextNode(''));
        }

        var range = document.createRange();
        range.setStart(this.contPane.firstChild, 0);
        range.setEnd(this.contPane.firstChild, 0);
        range.collapse(false);

        selection.removeAllRanges();
        selection.addRange(range);
        this.selection = selection;
        this.range = range;
        this.setSelectionElement();
        this.offset = 0;
    },

    setSelectionElement:function () {
        this.selectionElement = (this.range.startContainer && 3 == this.range.startContainer.nodeType) ? this.range.startContainer : /*IE fix*/this.getFirstTextFromElement(this.range.startContainer);
    },

    /** IE get HTMLElement entity if selection is "handmade" */
    getFirstTextFromElement:function (el) {
        var textNode = '';

        /** TODO what if no element here? */
        if (!el || !el.childNodes.length) {
            el.appendChild(document.createTextNode(''));
            return el.firstChild;
        }

        for (var i = 0, len = el.childNodes.length; i < len; ++i) {
            if (3 == el.childNodes[i].nodeType) {
                textNode = el.childNodes[i];
                break;
            }
        }

        /** @NOTICE element can contain only <br> for example, need additional check */
        if (!textNode) {
            textNode = el.insertBefore(document.createTextNode(''), el.firstChild);
        }

        return textNode;
    },

    /**
     *  find text field with lowest z-index
     */
    findBottomItem:function () {
        var item = false,
            zIndex = 10000,
            curZIndex = 10000,
            card;

        /* otherwise look for first editable area */
        $$('[contenteditable="true"]').each(function (el) {
            card = el.up();
            curZIndex = parseInt(card.getStyle('z-index') || 0, 10);
            /* find first element -> order is (z-index+1) */
            /* check only visible elements */
            if (curZIndex < zIndex && curZIndex > -1 && card.visible()) {
                item = card;
                zIndex = curZIndex;
            }
        });

        return item;
    },


    findItemFromSelection:function () {
        if (!window.getSelection || Prototype.Browser.Gecko || !window.getSelection().rangeCount) {
            return false;
        }

        var selection = window.getSelection(),
            selectionElement = $(selection.getRangeAt(0).startContainer.parentNode),
            selectionEditableAncestors, editableElement;

        /** TODO why so precise? */
        selectionEditableAncestors = selectionElement.up('[contenteditable="true"]');

        /* is selection editable? */
        editableElement = ('true' == selectionElement.readAttribute('contenteditable')) ? selectionElement : '';

        /* is selection ancestors editable(look for textPane)? */
        if (!editableElement) {
            editableElement = (!Object.isUndefined(selectionEditableAncestors)) ? selectionEditableAncestors : '';
        }

        /* if card is completely blank selectionElement is card itself */
        if (!editableElement) {
            editableElement = (!Object.isUndefined(selectionElement.down('[contenteditable="true"]'))) ? selectionElement.down('[contenteditable="true"]') : '';
            selectionElement = editableElement;
        }

        if (!editableElement) {
            return false;
        }
        /** end TODO why so precise? */

        /* editableElement is textPane, card element is parent for textPane*/
        return editableElement.up();
    },

    /**
     * goto another field
     */
    setItem:function (item) {
        /*if already inside element, do not procceed*/
        if (item && this.item && $(item) == this.item) {
            return false;
        }

        /* if move to another text object remove cursor */
        if (item) {
            this.selection.removeAllRanges();
        }

        this.item = $(item);
        if (Object.isUndefined(this.item) || null == this.item) {
            /** no scroll box on the card */
            return;
        }

        this.contPane = $(this.item.id + 'textPane');

        this.findSelectionElementFromPane();

        return true;
    },

    updateRangeOffset:function (position) {
        this.range.setStart(this.selectionElement, position);
        this.range.setEnd(this.selectionElement, position);

        this.selection.removeAllRanges();
        this.selection.addRange(this.range);
    },

    setSiblingLeftText:function () {
        var textNodes = this.findTextFields(this.contPane) || [],
            nodeIndex = textNodes.indexOf(this.selectionElement);

        /** if not found or firstChild - nothing to return */
        if (-1 == nodeIndex || 0 == nodeIndex) {
            return false;
        }

        this.selectionElement = textNodes[nodeIndex - 1];
        /** @NOTICE set offset poiner in the end of previos node */
        this.offset = this.selectionElement.nodeValue.length + 1;

        return true;
    },

    setSiblingRightText:function () {
        var textNodes = this.findTextFields(this.contPane) || [],
            nodeIndex = textNodes.indexOf(this.selectionElement);

        /** if not found or lastChild - nothing to return */
        if (-1 == nodeIndex || (textNodes.length - 1) == nodeIndex) {
            return false;
        }

        this.selectionElement = textNodes[nodeIndex + 1];
        /** @NOTICE set offset poiner to beginning of next node */
        this.offset = -1;

        return true;
    },

    findTextFields:function (el, arr) {
        arr = arr || [];
        for (var k = 0, len = el.childNodes.length; k < len; ++k) {

            if (3 == el.childNodes[k].nodeType) {
                /** @NOTICE do not collect empty textNodes, since we use "human-vision" text navigation */
                    //if (el.childNodes[k].nodeValue.length) {
                arr.push(el.childNodes[k]);
                //}
            } else {
                this.findTextFields(el.childNodes[k], arr);
            }
        }

        return arr;
    },

    /** main METHODS */
    addSymbol:function (char) {
        this.findSelectionElement();
        if (this.selectionElement && 3 == this.selectionElement.nodeType) {
            var val = this.selectionElement.nodeValue;
            /* update node val */
            this.selectionElement.nodeValue = val.substr(0, this.offset) + char + val.substr(this.offset);

            this.updateRangeOffset(++this.offset);
        }
    },

    erase:function () {
        /** assume all elements have it's own styles, get first one and insert after erase */
        var elementsWithStyles = this.contPane.childElements().filter(function (el) {
            return !Object.isUndefined(el.innerHTML);
        });

        if (elementsWithStyles && elementsWithStyles.length) {
            elementsWithStyles = elementsWithStyles[0].cloneNode(true);
            elementsWithStyles.innerHTML = '<br>';
        } else {
            elementsWithStyles = '';
        }

        this.contPane.update(elementsWithStyles);

        if (!elementsWithStyles) {
            this.contPane.appendChild(document.createTextNode(''));
        }

        this.selectionElement = this.contPane.firstChild;
        /** offset increment in updateRange */
        this.offset = 0;

        this.updateRangeOffset(this.offset);
    },

    backspace:function () {
        /* TODO implement siblings node move */
        if (!this.offset && !this.setSiblingLeftText()) {
            return;
        }

        if (this.selectionElement && 3 == this.selectionElement.nodeType) {
            var val = this.selectionElement.nodeValue;

            /* update node val */
            this.selectionElement.nodeValue = val.substr(0, this.offset - 1) + val.substr(this.offset);

            this.updateRangeOffset(--this.offset);
        }
    },

    moveLeft:function () {
        /* TODO implement siblings node move */
        if (!this.offset && !this.setSiblingLeftText()) {
            return;
        }

        if (this.selectionElement && 3 == this.selectionElement.nodeType) {
            this.updateRangeOffset(--this.offset);
        }
    },

    moveRight:function () {
        var nodeValue = this.selectionElement.nodeValue;
        /* TODO implement siblings node move */
        if (nodeValue && this.offset == nodeValue.length && !this.setSiblingRightText()) {
            return;
        }

        if (this.selectionElement && 3 == this.selectionElement.nodeType) {
            this.updateRangeOffset(++this.offset);
        }
    },

    changeSpeed:function (speed) {
        clearInterval(this.writeInterval);
        this.run(this.data, speed);
    },
    /** end main METHODS */

    updateContent:function () {
        this.contPane.style.cursor = this.CURSOR;

        var newTop = $(this.item).getHeight() - this.contPane.getHeight();
        //if(newTop>0)newTop=0;
        $(this.contPane).setStyle('top: ' + (-newTop) + 'px;');
    },

    transformGhostData:function (data) {
        /* map back actions to front ghostWriter actions */
        this.ACTIONS.each(function (pair) {
            data = data.gsub('{' + pair.key + '}', this.STRING_DEVIDER + this.POINTER_TO_ACTION + pair.value + this.STRING_DEVIDER);
        }.bind(this));

        this.SPEEDS.each(function (speed, key) {
            data = data.gsub('{' + key + '}', this.STRING_DEVIDER + this.POINTER_TO_SPEED + speed + this.STRING_DEVIDER);
        }.bind(this));

        data = data.gsub(new RegExp('{' + this.GOTO_ACTION + ' ([\\s\\S]*?)}', 'mi'),
            function (match) {
                return this.STRING_DEVIDER +
                    this.POINTER_TO_GOTO +
                    play.template.newCardElementId(cardsCollection.currentElement().id, match[1]) +
                    this.STRING_DEVIDER;
            }.bind(this)
        );

        data = data.split(this.STRING_DEVIDER);

        var tempData = [];
        data.each(function (string, key) {
            if (string.startsWith('|')) {
                string = string.substr(1);
            }

            if (string.endsWith('|')) {
                string = string.substr(0, (string.length - 1));
            }

            /* don't add empty steps */
            if (!string) {
                return;
            }

            /* check if string is speed or action */
            if (string.startsWith(this.POINTER_TO_SPEED) ||
                string.startsWith(this.POINTER_TO_ACTION) ||
                string.startsWith(this.POINTER_TO_GOTO)
                ) {
                string = [string];
            } else {
                /* each symbol of a text is a separate step */
                string = string.toArray();
            }

            tempData.push(string);
        }.bind(this));

        return tempData.flatten();
    },

    finishAction:function () {
        clearInterval(this.writeInterval);
        //this.updateContent( true );
        document.stopObserving(play.trackEvents.start, this.stopObserver);

        /** clear observer when action is done */
        if (Object.isFunction(play.ghostWriterFinishObserver)) {
            play.ghostWriterFinishObserver = '';
        }

        Action.finishAction(this.options.creator, parseInt((this.options.priority)));
    },

    run:function (data, speed) {
        var stepString = '';

        if (!speed) speed = this.DEFAULT_SPEED;
        if (Object.isUndefined(this.i)) this.i = 0;
        var countIterations = data.length;
        this.writeInterval = setInterval(function (el) {
            stepString = data[this.i];
            if (stepString.startsWith(this.POINTER_TO_SPEED)) {
                /* change speed */
                this.changeSpeed(stepString.substr(this.POINTER_TO_SPEED.length));
            } else if (stepString.startsWith(this.POINTER_TO_ACTION)) {
                /* fire simple action */
                this[ stepString.substr(this.POINTER_TO_ACTION.length) ]();
                this.updateContent();
            } else if (stepString.startsWith(this.POINTER_TO_GOTO)) {
                /* set new element to continue animation  */
                //this.isSelection = false;
                this.setItem(stepString.substr(this.POINTER_TO_GOTO.length));
            } else {
                /* add new character */
                this.addSymbol(stepString);
                this.updateContent();
            }
            ;

            this.i++;
            if (this.i >= countIterations) {
                this.finishAction();
                return;
            }

        }.bind(this), speed);
    }
});

Action.playRollCredits = Class.create({
    initialize:function (options) {
        try {
            this.initFlags();

            var defOptions = {
                item:'item',
                creator:'',
                priority:0,
                mode:this.PIXEL_MODE,
                nOfPixels:3,
                nOfSteps:0,
                speed:10,
                direction:this.VERTICAL_SCROLL,
                ignoreClick:false
            };

            /* rewrite default options */
            Object.extend(defOptions, options || { });

            if (Object.isUndefined(Action.rollCredits)) Action.rollCredits = [];

            /**defining elements and text containers, cache DOM elements */
            this.item = defOptions.item;
            this.itemElement = $(this.item);
            this.itemContPane = $(this.itemElement.id + 'textPane');
            this.ignoreClick = defOptions.ignoreClick;
            /**eof*/

            /** if itemElement is not a DOM element, nothing to scroll */
            if (!Object.isElement(this.itemElement)) {
                return;
            }

            /* create cpecific animation object */
            this.animationOptions = this.mapAnimationOptions(defOptions);

            if (defOptions.direction == this.VERTICAL_SCROLL) {
                this.animation = new Action.roll.vertical(this.animationOptions);
            } else {
                this.animation = new Action.roll.horizontal(this.animationOptions);
            }

            /**launching rollCredits*/
            if (!Object.isUndefined(Action.rollCredits[this.item])) {
                clearInterval(Action.rollCredits[this.item].inter);
                this.animation.prepareElementsToScroll();
            }
            ;
            /**eof*/

            this.playRollCredits();
            Action.rollCredits[this.item] = this;
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    initFlags:function () {
        this.VERTICAL_SCROLL = 0;
        this.PIXEL_MODE = 0;
    },

    mapAnimationOptions:function (defOptions) {
        return {
            element:this.itemElement,
            creator:defOptions.creator,
            priority:defOptions.priority,
            textPane:this.itemContPane,
            mode:defOptions.mode,
            nOfPixels:defOptions.nOfPixels,
            nOfSteps:defOptions.nOfSteps,
            speed:defOptions.speed
        };
    },

    playRollCredits:function () {
        try {
            var i = 0, observer;

            /* restore scroll values, and set textPane left position to 0 */
            if (this.animation.needReset) this.animation.prepareElementsToScroll();
            this.itemContPane.addClassName("inactive");

            this.inter = setInterval(function () {
                this.animation.run();
                if (i++ >= this.animation.intervalSteps) {
                    clearInterval(this.inter);
                    this.itemContPane.removeClassName("inactive");
                    Action.finishAction(this.animationOptions.creator, parseInt(this.animationOptions.priority));
                    this.stopObserver && this.itemElement.stopObserving("click", this.stopObserver);
                    delete Action.rollCredits[this.item];
                }
            }.bind(this), this.animation.intervalTime);
            /* stop on click inside element */
            if (!this.ignoreClick) {
                observer = function (e) {
                    clearInterval(this.inter);
                    this.itemContPane.removeClassName("inactive");
                    Action.finishAction(this.animationOptions.creator, parseInt(this.animationOptions.priority));
                    this.stopObserver && this.itemElement.stopObserving("click", this.stopObserver);
                    delete Action.rollCredits[this.item];
                }.bind(this);

                this.stopObserver = observer.bindAsEventListener(this);
                this.itemElement.observe(play.trackEvents["start"], this.stopObserver);
            }
        } catch (err) {
            console.log('error in rollCredits.playRollCredits', err);
        }
    }
});

/** playRollCredits animations */
Action.roll = {};

Action.roll.base = Class.create({
    initialize:function (options) {
        try {
            this.initFlags();

            var defOptions = {
                pixelsToScroll:3,
                totalPixelScroll:0,
                viewport:0,
                intervalSteps:0,
                intervalTime:33.3
            };

            /* rewrite default options */
            Object.extend(defOptions, options || { });
            /* extend object */
            Object.extend(this, defOptions);

            this.calcEffectOptions();
        } catch (err) {
            alert('roll.base: initialize error:' + console.log(err));
        }
    },

    /* abstract methods */
    resetTextPane:Prototype.emptyFunction,
    /**
     * set viewport/totalPixelScroll options
     */
    setMaxScrollOptions:Prototype.emptyFunction,
    /**
     * set new scroll position
     */
    setPosition:Prototype.emptyFunction,
    /**
     * get current scroll position
     */
    getPosition:Prototype.emptyFunction,
    /**
     * set maximum scroll value depends on effect
     */
    getEffectiveTotalScroll:Prototype.emptyFunction,
    preventScroll:Prototype.emptyFunction,
    /**
     *  check rounding error and scroll pixel to pixel in the end of animation
     */
    calcStepValue:Prototype.emptyFunction,
    /* end abstract methods  */

    initFlags:function () {
        this.PIXEL_MODE = 0;
    },

    /**
     * actual change of element position
     */
    run:function () {
        this.preventScroll();
        var calcStepValue = this.calcStepValue();
        if((/x-ibooks-th:/gi).test(window.location.protocol) && /Mac/i.test(navigator.platform)){ // Fix of X2IBA-284
            calcStepValue *= 2;
        }
        this.setPosition(calcStepValue);
    },

    /**
     *  reset values from previous animations
     *  @notice reset cssLeft(textPane) and scrollTop(element)
     */
    prepareElementsToScroll:function () {
        this.element.scrollTop = 0;
        this.resetTextPane();
    },

    /**
     *  match studio effect params to pixel values, depends on effect time interval
     *  @notice set real values for [pixelsToScroll, intervalSteps, totalPixelScroll, viewport]
     */
    calcEffectOptions:function () {
        try {
            /* cache maximum width/height of element(textPane) depends on animation type */
            this.calcMaxScrollOptions();

            /* scroll by line or number of pixels */
            var stepObject = (this.mode != this.PIXEL_MODE) ? this.getLineHeight() : this.nOfPixels;

            this.pixelsToScroll = (parseInt(stepObject, 10) * parseInt(this.speed, 10) / this.intervalTime ).round();

            /* min value for scroll effect is 1 */
            if (this.pixelsToScroll < 1 || isNaN(this.pixelsToScroll)) this.pixelsToScroll = 1;

            if (this.nOfSteps == 0) {
                /* play animation from beginning to the end */
                this.intervalSteps = ( this.getEffectiveTotalScroll() / this.pixelsToScroll ).round();
            } else {
                /* play only defined number of steps */
                this.intervalSteps = ( (parseInt(this.nOfSteps, 10) * this.intervalTime) / parseInt(this.speed, 10) ).round();
            }
        } catch (err) {
            alert('error in roll.base.calcEffectOptions ' + console.log(err));
        }
    },

    /**
     * check is element scrolled to the end
     */
    checkMaxScroll:function () {
        return !!(this.getEffectiveTotalScroll() <= this.getPosition());
    },

    /**
     *  calc viewport/totalPixelScroll options
     */
    calcMaxScrollOptions:function () {
        var styles = this.textPane.getDimensions(),
            actualDimensions;

        /* let textPane wrap inner content */
        this.textPane.setStyle('height: auto;');
        actualDimensions = this.textPane.getDimensions();

        /* restore default styles */
        this.textPane.setStyle('height:' + styles.height + 'px;');

        this.setMaxScrollOptions(actualDimensions);
    },

    /**
     *  define maximum lineHeight for effect
     *  TODO need more precise implementation
     */
    getLineHeight:function () {
        try {
            var height = 0;

            /* try line-height of element */
            height = parseInt(this.element.getStyle('lineHeight'));
            if (!isNaN(height) && height > 0) {
                return height;
            }

            /* try line-height of textPane */
            height = parseInt(this.textPane.getStyle('lineHeight'));
            if (!isNaN(height) && height > 0) {
                return height;
            }

            /* check max numeric lineHeight inside textPane elements */
            height = this.textPane.descendants().max(function (el) {
                return parseInt(document.defaultView.getComputedStyle(el, null)['lineHeight']) || 0;
            });
            if (!isNaN(height) && height > 0) {
                return height;
            }
            /* check max numeric fontSize inside textPane elements */
            height = this.textPane.descendants().max(function (el) {
                return parseInt(document.defaultView.getComputedStyle(el, null)['fontSize']) || 0;
            });

            if (!isNaN(height) && height > 0) {
                return height * 1.2;
            }

            /* try font-size of element and assume line-height is normal */
            height = parseInt(this.element.getStyle('fontSize'));
            if (!isNaN(height) && height > 0) {
                return height * 1.2;
            }

            /* try font-size of textPane and assume line-height is normal */
            height = parseInt(this.textPane.getStyle('fontSize'));
            if (!isNaN(height) && height > 0) {
                return height * 1.2;
            }

            /* default browser styles */
            return 16 * 1.2;
        } catch (err) {
            alert('error in roll.base.getLineHeight' + console.log(err));
        }
    }
});

Action.roll.vertical = Class.create(Action.roll.base, {
    initialize:function ($super, options) {
        try {
            $super(options);

            /* if multiple step event continue animation from current position */
            this.needReset = this.checkMaxScroll();
        } catch (err) {
            alert('roll.vertical: initialize error:' + console.log(err));
        }
    },

    calcStepValue:function () {
        var currentPosition = this.getPosition(),
            pixelsLeft = this.totalPixelScroll - currentPosition;

        return (pixelsLeft < this.pixelsToScroll ) ? pixelsLeft : this.pixelsToScroll;
    },

    getEffectiveTotalScroll:function () {
        return (this.totalPixelScroll - this.viewport);
        ;
    },

    resetTextPane:function () {
        this.textPane.setStyle({
            'left':'0px'
        });
    },

    setMaxScrollOptions:function (actualDimensions) {
        this.totalPixelScroll = actualDimensions.height;
        this.viewport = this.element.getHeight();
    },

    getPosition:function () {
        return this.element.scrollTop;
    },

    setPosition:function (addValue) {
        this.element.scrollTop += addValue;
    }
});

Action.roll.horizontal = Class.create(Action.roll.base, {
    initialize:function ($super, options) {
        try {
            $super(options);

            /* check left property is set for textPane */
            if (isNaN(parseInt(this.textPane.getStyle('left'), 10))) {
                this.textPane.setStyle({
                    'position':'relative',
                    'left':'0px'
                });
            }

            /* if multiple step event continue animation from current position */
            this.needReset = this.checkMaxScroll() || (this.getPosition() == 0);
        } catch (err) {
            alert('roll.horizontal: initialize error:' + console.log(err));
        }
    },

    calcStepValue:function () {
        var currentPosition = this.getPosition();

        return (currentPosition < this.pixelsToScroll) ? currentPosition : this.pixelsToScroll;
    },

    preventScroll:function () {
        this.element.scrollLeft = 0;
    },

    getEffectiveTotalScroll:function () {
        return this.totalPixelScroll;
    },

    resetTextPane:function () {
        this.textPane.setStyle({
            'left':this.totalPixelScroll + 'px'
        });
    },

    setMaxScrollOptions:function (actualDimensions) {
        this.totalPixelScroll = actualDimensions.width;
        this.viewport = this.element.getWidth();
    },

    getPosition:function () {
        return parseInt(this.textPane.getStyle('left'), 10);
    },

    setPosition:function (addValue) {
        this.textPane.setStyle('left:' + (parseInt(this.textPane.getStyle('left'), 10) - addValue) + 'px');
    }
});

Action.playShowMessage = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:'',
                icon:'/templates/img/ui/trashBox.png',
                text:'item',
                buttonText:'copy'
            };
            Object.extend(this.options, options || { });
            /**defining elements*/
            this.icon = this.options.icon;
            this.text = this.options.text;
            this.buttonText = this.options.buttonText;
            /**eof*/
            /**launching showMessage*/
            this.playShowMessage();
            /**eof*/
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    playShowMessage:function () {
        Action.finishAction(this.options.creator, this.options.priority);
        return new messageCreate({image:prefix + this.icon, text:this.text, caption:this.buttonText});
    }
});

Action.playScrollCard = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                xCoord:'100',
                yCoord:'100',
                creator:'creator',
                duration:'0.2'

            };
            Object.extend(this.options, options || { });
            /**defining elements*/
            var screenSize = document.viewport.getDimensions();

            this.xCoord = parseInt(this.options.xCoord) - (screenSize.width / 2 - 10);
            this.yCoord = parseInt(this.options.yCoord) - (screenSize.height / 2 - 20);
            /**eof*/
            /**launching showMessage*/
            this.playScrollCard();
            /**eof*/
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    createElement:function () {
        var element = new Element('div', {
            style:"width:1px;" +
                "height:1px;" +
                "position:absolute;" +
                "top:" + this.yCoord + "px;" +
                "left:" + this.xCoord + "px;" +
                "overflow:hidden;" +
                "z-index:99999;" +
                "background:transparent",
            id:"scrollDiv" + this.options.creator + Math.random()
        });
        this.object = element;
        document.body.insert(element);
        return element;
    },

    playScrollCard:function () {
        //var element = this.createElement();
        scrollOffsets = document.viewport.getScrollOffsets(),
            elementOffsets = [this.xCoord, this.yCoord];

        new Effect.Tween(null,
            scrollOffsets.top,
            elementOffsets[1],
            {duration:this.options.duration},
            //"scrollTop"
            function (p) {
                var left = this.offsetLeft || scrollOffsets.left;
                this.offsetTop = p.round();
                scrollTo(left, this.offsetTop);
            }.bind(this)
        );
        new Effect.Tween(null,
            scrollOffsets.left,
            elementOffsets[0],
            {duration:this.options.duration},
            //"scrollLeft"
            function (p) {
                var top = this.offsetTop || scrollOffsets.top;
                this.offsetLeft = p.round();
                scrollTo(this.offsetLeft, top);
            }.bind(this)
        );

        //new Effect.ScrollTo($(element),{duration:this.options.duration});

        setTimeout(function () {
            //	document.body.removeChild(this.object);
        }.bind(this), this.options.duration * 1000);

        return true;
    }
});

Action.playSequenceAnimation = Class.create({

    initialize:function (options) {
        try {
            this.options = {
                imgElement:$('imgElement'),
                imagesTemplate:Array(),
                imagesCount:10,
                info:{},
                fps:25
            };
            Object.extend(this.options, options || { });
            this.playing = false;
            this.imgInterval = {};
            this.counter = 0;
            this.imgElement = this.options.imgElement;
            this.imagesCount = this.options.imagesTemplate.length;
            this.template = new Template(prefix + this.options.imagesTemplate);
            this.images = Array();

            this.options.imagesTemplate.each(function (el) {
                this.images.push(prefix + el.src);
            }.bind(this));

            this.startSequence();
        } catch (err) {
            console.log(err);
        }
    },


    startSequence:function () {
        try {
            //	return $(this.imgElement);
        } catch (err) {
            console.log(err);
        }
    },

    playSequence:function () {
        this.playing = true;
        var i = this.counter + 1;
        clearInterval(this.imgInterval);
        this.imgInterval = setInterval(function () {
            if (!$(this.imgElement.id) || $(this.imgElement.id) == 'undefined' || $(this.imgElement.id) == 'null') {

                this.stopSequence();
            }
            else {
                if (i > (this.imagesCount - 1)) i = 0;
                $(this.imgElement.id).src = this.images[i];
                i++;
            }

        }.bind(this), (1000 / this.options.fps));
    },


    stopSequence:function () {
        this.playing = false;
        clearInterval(this.imgInterval);
        this.counter = 0;
    },

    pauseSequence:function () {
        this.playing = false;
        clearInterval(this.imgInterval);
    },

    play:function () {
        return this.playSequence();
    },

    stop:function () {
        return this.stopSequence();
    },

    pause:function () {
        return this.pauseSequence();
    },

    nextFrame:function () {
        ++this.counter;
        $(this.imgElement.id).src = this.images[this.counter];
    }
});

Action.playMovieController = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:{}
            };

            Object.extend(this.options, options || { });

            this.currentCard = $(play.template.cardId(cardsCollection.currentElement().id));
            this.item = this.currentCard.select('video, object[mediatype="video"]')[0];
            this.timeStep = 0.1;

            if (this.item == undefined) this.item = this.currentCard.select('div').find(function (el) {
                return (el.play && el.pause);
            });

            switch (this.options.item.command) {
                case '0':
                    this.commandPlay();
                    break;
                case '1':
                    this.commandPause();
                    break;
                case '2':
                    this.commandStepForward();
                    break;
                case '3':
                    this.commandStepBack();
                    break;
                case '4':
                    this.commandReset();
                    break;
                case '5':
                    this.commandPlayPause();
                    break;
                default:
                    break;
            }

            Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
        } catch (err) {
            console.log(err);
        }
    },

    commandPlay:function () {
        try {
            this.item.play();

            return true;
        } catch (err) {
            console.log(err);
        }
    },

    commandPause:function () {
        try {
            this.item.pause();
            return true;
        } catch (err) {
            console.log(err);
        }
    },

    commandPlayPause:function () {
        try {
            if (this.item.paused) {
                this.commandPlay();
            } else {
                this.commandPause();
            }
        } catch (err) {
            console.log(err);
        }
    },

    commandReset:function () {
        try {
            this.item.pause();

            if (this.item.hasOwnProperty("isPng") && this.item.isPng === true) {
                this.item.element.style.backgroundImage = this.item.maps[1].src;
                this.item.resetFrame(this.item.element);

                this.item.element2.style.backgroundImage = this.item.maps[0].src;
                this.item.resetFrame(this.item.element2);
            } else {
                this.item.currentTime = 0;
            }
        } catch (err) {
            console.log(err);
        }
    },

    commandStepForward:function () {
        try {
            this.item.pause();

            if (this.item.hasOwnProperty("isPng") && this.item.isPng === true) {
                this.item.nextFrame();
            } else {
                this.item.currentTime += this.timeStep;
            }
        } catch (err) {
            console.log(err);
        }
    },

    commandStepBack:function () {
        try {
            this.item.pause();

            if (this.item.hasOwnProperty("isPng") && this.item.isPng === true) {
                //this.item.previousFrame();
            } else {
                this.item.currentTime -= this.timeStep;
            }
        } catch (err) {
            console.log(err);
        }
    }
});

Action.playHideCursor = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                mode:'hide'
            };

            Object.extend(this.options, options || { });
            this.shield = (Object.isElement($('cursorShield'))) ? $('cursorShield') : "";
            switch (this.options.mode) {
                case "hide":
                    this.hideCursor();
                    break;

                case "show":
                    this.showCursor();
                    break;

                case "hideUntil":
                    this.hideUntilMoved();
                    break;
            }
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    hideCursor:function () {
        if (!Object.isElement(this.shield))$('contPane').insert({
            top:this.createShield()
        });
        this.shield.setStyle({
            cursor:this.returnEmptyCursor()
        });

        this.shield.observe(this.eventName(), function (event) {
            var position;
            if (isTouchDevice() && !Object.isUndefined(event.touches)) {
                position = [event.touches[0].clientX, event.touches[0].clientY];
            } else {
                position = [event.pointerX(), event.pointerY()];
            }
            this.hide();
            var el = document.elementFromPoint(position[0], position[1]);
            this.show();
            el.triggerEvent("click");
        });

    },


    createShield:function () {
        this.shield = new Element("div", {id:"cursorShield", style:"position:absolute;" +
            "top:0px;z-index:99999;" +
            "left:0px;height:100%;" +
            "width:100%;" +
            "background-color: rgba(0,0,0,0);"});
        this.shield.insert(" ");
        return this.shield;
    },

    eventName:function () {
        if (isTouchDevice()) {
            return "touchstart";
        }
        return "mousedown";
    },

    showCursor:function () {
        try {
            if (Object.isElement(this.shield)) {
                this.shield.stopObserving(this.eventName());
                $('contPane').removeChild(this.shield);
                this.shield = "";
            }
        } catch (err) {
            console.log(err);
        }
    },

    hideUntilMoved:function () {
        if (!Object.isElement(this.shield))$('contPane').insert({
            top:this.createShield()
        });
        /*document.body.setStyle({ 
         cursor: this.returnEmptyCursor()
         }); */

        this.shield.setStyle({
            cursor:this.returnEmptyCursor()
        });
        this.bindObserverFunction = this.observerFunction.bindAsEventListener(this);
        document.observe("mousemove", this.bindObserverFunction);
    },

    returnEmptyCursor:function () {
        return "url(" + /*prefix+*/"data/engine/templates/img/empty.cur), none";
    },

    observerFunction:function () {
        document.stopObserving("mousemove", this.bindObserverFunction);
        if (Object.isElement(this.shield))$('contPane').removeChild(this.shield);
        this.showCursor();
        delete this;
    }
});

Action.playCardShuffler = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0
            };
            Object.extend(this.options, options || { });
            this.shuffleCards(options.from, options.to);
        } catch (err) {
            alert('cardShuffler: initialize error:' + console.log(err));
        }
    },

    shuffleCards:function (from, to) {
        cardsCollection.generateShuffleIndex(parseInt(from), parseInt(to));
        Action.finishAction(this.options.creator, this.options.priority);
    }
});

Action.playMoveToFront = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };

            Object.extend(this.options, options || { });
            play.moveToFrontObjects.each(function (el, num) {
                if (el.item.object == this.options.item.object) {
                    play.moveToFrontObjects.splice(num, 1);
                    throw $break;
                }
            }.bind(this));
            play.moveToFrontObjects.push(this.options);
            if (Object.isElement($(play.template.newCardElementId(cardsCollection.currentElement().id, this.options.item.object)))) {
                this.moveToFront(this.options.item);
            }
            setTimeout(function () {
                Action.finishAction(this.options.item.creator, parseInt((this.options.item.priority)));
            }.bind(this), 33);
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));

        }
    },

    maxZIndex:function () {
        var zIndexArray = $$('#contPane > div > *').collect(function (elem) {
            return parseInt(elem.getStyle('z-index'));
        });

        return zIndexArray.collect(function (e) {
            return e > 0 ? e : 0;
        }).max();
    },

    moveToFront:function (item) {
        var cardElementId = play.template.newCardElementId(cardsCollection.currentElement().id, item.object);
        var maxZindex = this.maxZIndex();
        $(cardElementId).setStyle({
            zIndex:maxZindex + 2
        });

        if (Object.isElement($(cardElementId + '_image'))) {
            $(cardElementId + '_image').setStyle({
                zIndex:maxZindex + 1
            });
        }
    }
});

Action.playClearChangeFlag = Class.create({
    initialize:function (creator, priority) {
        try {
            var currentCard = cardsCollection.currentElement()
                , otherElements = {};

            currentCard.objects.select(function (e) {
                return ((e.type == "text" && e.textType == "scrollable")
                    || e.type == "image" || e.type == "button"
                    || e.type == "video" || e.type == "audio");
            }).each(function (e) {
                    otherElements[e.id] = e;
                }, this);

            [play.groupObjectsData, play.draggableObjectsData, otherElements].each(function (el) {
                Object.keys(el).each(function (e) {
                    var cardObject = currentCard.objects.find(function (obj) {
                        return e == obj.id;
                    }, this);

                    if (!Object.isUndefined(cardObject)) {
                        this.restoreObject(cardObject);
                    }
                }, this);
            }, this);
            play.hypertextObserver.createElementsOnCardInject();
            play.hypertextObserver.run();
            $(play.template.cardId(currentCard.id)).fire("event:restoreStack");
            play.clearChangeFlag = true;
            play.moveToFrontObjects = [];

            Action.finishAction(creator, priority);
        } catch (err) {
            alert('playerObj: action clearChangeFlag error error:' + console.log(err));
        }
    },

    restoreObject:function (element) {
        var domElement = $(play.template.newCardElementId(cardsCollection.currentElement().id, element.id));
        if (Object.isElement(domElement)) {
            var styleDisplay = element.isVisible === "1" ? "block" : "none";

            domElement.setStyle("width:" + element.xSize + "px;" +
                "height:" + element.ySize + "px;" +
                "top:" + element.yCoord + "px;" +
                "left:" + element.xCoord + "px;" +
                "display:" + styleDisplay + ";" +
                "z-index:" + play.help.getZIndexValue(element.order, 1) + ";");

            // fix for restore buttons and images highlight
            var imgEl = $(domElement.id + "_image");
            if (!!imgEl) {
                imgEl.style.display = styleDisplay;
                imgEl.style.zIndex = play.help.getZIndexValue(element.order);
            }

            if (element.type == 'text') {
                $(domElement.id + "textPane").update(element.text);

                if (element.isReadOnly == 0) {
                    $(domElement.id + "textPane").descendants().invoke('setStyle', "-webkit-user-select:text;-moz-user-select:text;");
                }
            }

            play.help.stopAllSounds(); // fix bug X2IBA-1941
            play.help.stopAllMovies(); // fix bug X2IBA-1941

            Try.these(function () {
                domElement.stop();
            }.bind(this), function () {
                domElement.pause();
            }.bind(this));
        }
    }
});

/*
 * @NOTICE 'lock' and 'break/print' groups are not used
 * @NOTICE 'insert' key not represented in win version
 * @NOTICE 91,92,116(F5 in Safari win), 112(F1 in IE9) fire nonpreventable events
 * @NOTICE 91 is "Meta" key on Mac, so the only difference between 91("Win") in Windows and 91("Meta") on Mac is event.keyIdentifier
 * 
 * winKeys = {
 * 		'winLeft':91, 'winRight':92, 'list':93
 * }
 * 
 * controlKeys = {
 * 		'shift':16, 'control':17, 'alt':18
 * }
 * 
 */
Action.keyMapperObserver = Class.create({
    initialize:function (options) {
        try {
            this.isInit = false;
            this.keyActions = {};

            this.isMac = (navigator.appVersion.indexOf("Mac") != -1) || false;

            this.ignoreKeys = [
            /** control keys */
                16, 17, 18,
            /** win keys */
                91, 92, 93,
            /** 'lock' and 'break/print' groups */
                144, 145, 20,
                19,
            /** 'insert' key (bug?) */
                45
            ];

            /** @NOTICE space is ' ' in mac exported stack */
            this.specialKeys = $H({
                'F1':112, 'F2':113, 'F3':114, 'F4':115, 'F5':116, 'F6':117, 'F7':118,
                'F8':119, 'F9':120, 'F10':121, 'F11':122, 'F12':123,
                'Left':37, 'Up':38, 'Right':39, 'Down':40,
                'PageUp':33, 'PageDown':34, 'End':35, 'Home':36, 'Delete':46,
                'Return':8, 'Tab':9, 'Enter':13, 'Escape':27,
                'Clear':0, 'Help':0, ' ':32
            });

            this.specialKeyCodes = this.specialKeys.values();
        }
        catch (err) {
            alert('KeyMapperObserver: initialize error:' + console.log(err));
        }
    },

    createKeyCodeFromModel:function (item) {
        var code = (Object.isUndefined(this.specialKeys.get(item.HSKeyMapperActionCharacterKey))) ? play.help.getKeyCode(item.HSKeyMapperActionCharacterKey) : this.specialKeys.get(item.HSKeyMapperActionCharacterKey);

        var object = {
            keyCode:code,
            //commandKey : item.HSKeyMapperActionUseCommandKeyKey || false,
            ctrlKey:item.HSKeyMapperActionUseCommandKeyKey || false
        };

        return this.getID(object);
    },

    createKeyCodeFromEvent:function (event) {
        var code = (event.which) ? event.which : event.keyCode,
            object = {
                keyCode:code,
                //commandKey : event.commandKey || false,
                ctrlKey:(event.ctrlKey && !this.isMac) || event.metaKey || false
            };

        return this.getID(object);
    },

    /** TODO this is really ugly! */
    getID:function (object) {
        return object.keyCode + '_' +
            /* (("1" == object.commandKey)?1:0) + '_' + */
            (("1" == object.ctrlKey) ? 1 : 0);
    },

    add:function (key, object) {
        if (!this.keyActions[key]) {
            this.keyActions[key] = $H();
        }

        var event = this.createEventFunction(object);

        if (-1 == this.keyActions[key].keys().indexOf(object)) {
            this.keyActions[key].set(object, event);
        }
    },

    createEventFunction:function (object) {
        var actionButton = $(play.template.newCardElementId(cardsCollection.currentElement().id, object));

        /**@NOTICE hmmm, actionButton can be null?*/
        if (null == actionButton) {
            return false;
        }

        return function () {
            actionButton.setAttribute("isfromaction", 1);
            actionButton.click();
            actionButton.setAttribute("isfromaction", 0);
        }.bind(object);
    },

    clear:function () {
        this.keyActions = {};
        this.isInit = false;
    },

    run:function () {
        if (this.isInit) {
            return;
        }

        this.isInit = true;

        document.observe("keydown", function (e) {
            var code = (event.which) ? event.which : event.keyCode;

            /** see NOTICE about 91 key in function description */
            if (-1 != this.ignoreKeys.indexOf(code) && !(91 == code && this.isMac)) {
                return;
            }


            var charCode = this.createKeyCodeFromEvent(e);

            if (this.keyActions[charCode]) {
                /** prevent native event on special keys */
                /** NOTICE for now prevent event on all mapped keys */
                /** TODO think about how to add to this.specialKeyCodes browser key combinations(such as CTRL+R) and stop event only for this list  */
                /* if (-1 != this.specialKeyCodes.indexOf(code)) {*/
                e.preventDefault();
                e.stopPropagation();
                e.stop();
                /* } */

                /** fire events assigned to current charCode */
                this.keyActions[charCode].each(function (pair) {
                    /** if actionButton is not created can be false, so check before call */
                    pair.value && pair.value();
                });
            }

        }.bind(this));
    }
});

Action.playKeyMapper = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0,
                items:'item'
            };

            /** create key observer if not set */
            if (Object.isUndefined(play.keyMapperObserver) || !Object.isFunction(play.keyMapperObserver)) {
                play.keyMapperObserver = new Action.keyMapperObserver();
            }
            ;

            Object.extend(this.options, options || { });
            this.options.items.each(function (item) {
                this.observeKey(item);
            }.bind(this));

            Action.finishAction(this.options.creator, parseInt((this.options.priority)));
        } catch (err) {
            alert('playerObj: playKeyMapper initialize error:' + console.log(err));
        }
    },

    observeKey:function (item) {
        var mappedCode = play.keyMapperObserver.createKeyCodeFromModel(item);

        play.keyMapperObserver.add(mappedCode, item.HSKeyMapperActionObjectUIDKey);
        play.keyMapperObserver.run();

    }
});

Action.playButtonLister = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };
            Object.extend(this.options, options || { });
            this.run();
        } catch (err) {
            alert('Action.playButtonLister: initialize error:' + console.log(err));
        }
    },

    run:function () {
        this.hideCursor();
        this.switchButtons("forward");
        this.setObservers();
    },

    hideCursor:function () {
        new Action.playHideCursor({mode:"hide"});
    },

    highlightButton:function (button) {
        setTimeout(function () {
            $(button).setOpacity(0.3);
        }.bind(this), 50);
    },

    removeHighlightButton:function (button) {
        $(button).setOpacity(0);
    },

    setPointer:function (dir) {
        var cnt = this.options.item.objects.length;
        if (Object.isUndefined(this.pointer)) {
            this.pointer = 0;
        }
        else {
            (dir == "forward") ? this.pointer++ : this.pointer--;
        }
        if (this.pointer >= cnt) this.pointer = 0;
        if (this.pointer < 0) this.pointer = --cnt;
    },

    switchButtons:function (dir) {

        if (!Object.isUndefined(this.activeButton)) this.removeHighlightButton(this.activeButton);
        this.setPointer(dir);
        this.activeButton = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.options.item.objects[this.pointer].id));
        this.highlightButton(this.activeButton);
        this.timeout = setTimeout(function () {
            this.activeButton.setAttribute("isfromaction", 1);
            $(this.activeButton).click();
            this.activeButton.setAttribute("isfromaction", 0);
            delete this.timeout;
        }.bind(this), this.options.item.timer * 1000);
    },

    setObservers:function () {
        document.observe("mouseup", function (e) {
            e.preventDefault();
            e.stop();
            this.switchButtons("forward");
        }.bind(this));
        document.observe("keydown", function (e) {
            e.preventDefault();
            e.stop();
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode == play.help.getKeyCode("1") || charCode == play.help.getKeyCode("space")) {
                if (!Object.isUndefined(this.timeout))clearTimeout(this.timeout);
                this.switchButtons("forward");
            }
            else if (charCode == play.help.getKeyCode("2")) {
                if (!Object.isUndefined(this.timeout))clearTimeout(this.timeout);
                this.switchButtons("backward");
            }
            else if (charCode == play.help.getKeyCode("escape") || charCode == play.help.getKeyCode("del")) {
                this.destruct();
            }
        }.bind(this));

    },

    destruct:function () {
        document.stopObserving("keydown");
        this.removeHighlightButton(this.activeButton);
        new Action.playHideCursor({mode:"show"});
        delete this;
    }
});

Action.playButtonScanner = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };

            Object.extend(this.options, options || { });
            this.options.item.objects = [];
            cardsCollection.currentElement().objects.each(function (el) {
                if (el.type == "button") this.options.item.objects.push(el);
            }.bind(this));

            this.run();
        } catch (err) {
            alert('Action.playButtonScanner: initialize error:' + console.log(err));
        }
    },

    run:function () {
        if (this.options.hideCursor == 1)this.hideCursor();
        this.interval = setInterval(function () {
            this.switchButtons();
        }.bind(this), this.options.item.scanDelay * 1000);
        this.setObservers();
    },

    hideCursor:function () {
        new Action.playHideCursor({mode:"hideUntil"});
    },

    highlightButton:function (button) {
        button.setOpacity(0.3);
    },
    removeHighlightButton:function (button) {
        $(button).setOpacity(0);
    },

    setPointer:function () {
        var cnt = this.options.item.objects.length;
        if (Object.isUndefined(this.pointer)) {
            this.pointer = 0;
        }
        else {
            this.pointer--;
        }
        if (this.pointer >= cnt) this.pointer = 0;
        if (this.pointer < 0) this.pointer = --cnt;
    },

    switchButtons:function () {
        if (!Object.isUndefined(this.activeButton)) this.removeHighlightButton(this.activeButton);
        this.setPointer();
        this.activeButton = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.options.item.objects[this.pointer].id));
        this.highlightButton(this.activeButton);

    },

    setObservers:function () {
        document.observe("keydown", function (e) {
            e.preventDefault();
            e.stop();
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode == play.help.getKeyCode("enter") || charCode == play.help.getKeyCode("space")) {
                this.activeButton.setAttribute("isfromaction", 1);
                $(this.activeButton).click();
                this.activeButton.setAttribute("isfromaction", 0);
                this.destruct();
            }
            else if (charCode == play.help.getKeyCode("escape")) {
                this.destruct();
            }
        }.bind(this));

    },

    destruct:function () {
        clearInterval(this.interval);
        document.stopObserving("keydown");
        this.removeHighlightButton(this.activeButton);
        new Action.playHideCursor({mode:"show"});
        delete this;
    }
});


Action.playButtonStepper = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };
            Object.extend(this.options, options || { });
            this.run();
        } catch (err) {
            alert('Action.playButtonLister: initialize error:' + console.log(err));
        }
    },

    run:function () {
        this.hideCursor();
        this.switchButtons("forward");
        this.setObservers();
    },

    hideCursor:function () {
        new Action.playHideCursor({mode:"hide"});
    },

    highlightButton:function (button) {
        this.hightlightInt = setInterval(function () {
            if ($(button).getOpacity != 0.3)$(button).setOpacity(0.3);
        }.bind(this), 33);
        //setTimeout(function(){$(button).setOpacity(0.3);}.bind(this),70);
    },

    removeHighlightButton:function (button) {
        $(button).setOpacity(0);
        clearInterval(this.hightlightInt);
    },

    setPointer:function (dir) {
        var cnt = this.options.item.objects.length;
        if (Object.isUndefined(this.pointer)) {
            this.pointer = 0;
        }
        else {
            (dir == "forward") ? this.pointer++ : this.pointer--;
        }
        if (this.pointer >= cnt) this.pointer = 0;
        if (this.pointer < 0) this.pointer = --cnt;
    },

    switchButtons:function (dir) {

        if (!Object.isUndefined(this.activeButton)) this.removeHighlightButton(this.activeButton);
        this.setPointer(dir);
        this.activeButton = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.options.item.objects[this.pointer].id));
        this.highlightButton(this.activeButton);

    },

    setObservers:function () {
        this.mouseObserver = this.observeMouseEvent.bindAsEventListener(this);
        document.observe("mousedown", this.mouseObserver);

        document.observe("keydown", function (e) {
            e.preventDefault();
            e.stop();
            var charCode = (e.which) ? e.which : e.keyCode;
            if (charCode == play.help.getKeyCode("1") || charCode == play.help.getKeyCode("space")) {
                if (!Object.isUndefined(this.timeout))clearTimeout(this.timeout);
                this.switchButtons("forward");
            }
            else if (charCode == play.help.getKeyCode("2")) {
                if (!Object.isUndefined(this.timeout))clearTimeout(this.timeout);
                this.switchButtons("backward");
            }
            else if (charCode == play.help.getKeyCode("enter")) {
                this.activeButton.setAttribute("isfromaction", 1);
                $(this.activeButton).click();
                this.activeButton.setAttribute("isfromaction", 0);
            }
            else if (charCode == play.help.getKeyCode("escape") || charCode == play.help.getKeyCode("del")) {
                this.destruct();
            }
        }.bind(this));

    },

    observeMouseEvent:function () {
        this.activeButton.setAttribute("isfromaction", 1);
        $(this.activeButton).click();
        this.activeButton.setAttribute("isfromaction", 0);
    },

    destruct:function () {
        document.stopObserving("keydown");
        document.stopObserving("mousedown", this.mouseObserver);
        this.removeHighlightButton(this.activeButton);
        new Action.playHideCursor({mode:"show"});
        delete this;
    }
});

Action.playSequencer = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                items:'item'
            };
            Object.extend(this.options, options || { });
            this.timeouts = {};
            this.run();
        } catch (err) {
            alert('Action.playSequencer: initialize error:' + console.log(err));
        }
    },

    run:function () {
        /* check sequence is not empty */
        if (!this.options.items || !this.options.items.length) {
            return;
        }

        this.options.items.each(function (el) {
            this.addToSequence(el);
        }.bind(this));
    },

    addToSequence:function (el) {
        this.timeouts[el.object] = setTimeout(function () {
            var cardElement = $(play.template.newCardElementId(cardsCollection.currentElement().id, el.object));
            /** TODO think about delayed events on another card */
            if (!Object.isUndefined(cardElement) && null != cardElement) {
                cardElement.setAttribute("isfromaction", 1);
                cardElement.click();
                cardElement.setAttribute("isfromaction", 0);
            }

            delete this.timeouts[el.object];
            if (this.timeouts.length == 0) {
                Action.finishAction(this.options.creator, parseInt((this.options.priority)));
            }
        }.bind(this), parseFloat(el.delay) * 1000);
    }
});


Action.playTextCompare = Class.create({
    initialize:function (options) {
        try {
            this.initFlags();

            this.options = {
                creator:'',
                priority:0,
                source:'source',
                destination:'destination',
                condition:this.CONTAINS,
                ignoreCase:true,
                mode:this.MODE_CUSTOM_TEXT,
                customText:'',
                successActionEl:'',
                failActionEl:''
            };

            Object.extend(this.options, options || { });

            /* if customText is not set, assume element comparison */
            if (Object.isUndefined(this.options.customText)) {
                this.options.mode = this.MODE_ELEMENT;
            }

            if (!this.checkElementsExist()) {
                return;
            }
            this.sourceContPane = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.source) + 'textPane');
            this.destinationContPane = $(play.template.newCardElementId(cardsCollection.currentElement().id, this.destination) + 'textPane');

            this.sourceText = this.getText(this.sourceContPane);
            this.destinationText = (this.options.mode == this.MODE_CUSTOM_TEXT) ? this.options.customText : this.getText(this.destinationContPane);
            /* if both text are numbers invoke numeric comparison */
            if (this.sourceText == parseInt(this.sourceText, 10) && this.destinationText == parseInt(this.destinationText, 10)) {
                this.comparator = new Action.textComparator.numeric(this.options.condition);
            } else if (this.options.ignoreCase) {
                this.comparator = new Action.textComparator.ignoreCase(this.options.condition);
            } else {
                this.comparator = new Action.textComparator.sensitive(this.options.condition);
            }

            this.run();

            Action.finishAction(this.options.creator, parseInt((this.options.priority)));
        } catch (err) {
            alert('Action.playTextCompare: initialize error:' + console.log(err));
        }
    },

    initFlags:function () {
        /* default codition constant, look others in abstractComparator */
        this.CONTAINS = 'HSCompareTextAction_contains:options:';

        this.MODE_CUSTOM_TEXT = 0;
        this.MODE_ELEMENT = 1;
    },

    checkElementsExist:function () {
        /**defining elements and text containers*/
        this.source = this.options.source;
        this.destination = this.options.destination;
        var isExist = {'source':false, 'destination':false};
        /**eof*/
        /** source is always mandatory */
        if (Object.isElement($(this.source))) {
            this.sourceContPane = $($(this.source).id + 'textPane');
            isExist.source = true;
        } else {
            for (i in play.textObjectsData) {
                if (i.indexOf(this.source) !== -1) {
                    isExist.source = true;
                    this.sourceContPane = play.textObjectsData[i];
                }
            }
        }

        if (this.options.mode == this.MODE_ELEMENT) {
            /** destination is mandatory for elements comparison */
            if (!this.destination) return false;
            if (Object.isElement($(this.destination))) {
                this.destinationContPane = $($(this.destination).id + 'textPane');
                isExist.destination = true;
            } else {
                for (i in play.textObjectsData) {
                    if (i.indexOf(this.destination) !== -1) {
                        isExist.destination = true;
                        this.destinationContPane = play.textObjectsData[i];
                    }
                }
            }
        } else {
            isExist.destination = true;
        }

        if (isExist.source == true && isExist.destination == true) {
            return true;
        } else {
            return false;
        }

    },

    run:function () {
        var isSuccessful = this.comparator.run(this.sourceText, this.destinationText);
        this.activateElement(isSuccessful);
    },

    getText:function (el) {
        var text = "";
        if (Object.isElement(el)) {
            text = el.innerHTML;
        } else {
            text = el;
        }
        return text.stripTags();
    },

    activateElement:function (isSuccessful) {
        var el = isSuccessful ? this.options.successActionEl : this.options.failActionEl;

        /* elements can be empty or null */
        if (!el || Object.isUndefined($(el)) || null == $(el)) return;

        /** TODO checkIfShapeClicked return false in IE9, Safari
         * so click does not fire in elementEventObserver
         * workaround: set isfromaction param
         */
        var isOriginallyFromAction = $(el).getAttribute("isfromaction");

        $(el).setAttribute("isfromaction", 1);

        /* click on fixed el */
        $(el).click();

        /* restore default value */
        if (isOriginallyFromAction == 1) {
            $(el).setAttribute("isfromaction", isOriginallyFromAction);
        } else {
            $(el).removeAttribute("isfromaction");
        }
    }
});


Action.playTextMover = Class.create({
    initialize:function (options) {
        try {
            this.initFlags();

            this.options = {
                creator:'',
                priority:0,
                /** set different source text(comments on stack, card, object)*/
                sourceDataType:0,
                source:'source',
                destination:'destination',
                sourceAction:this.SRC_COPY,
                destinationAction:this.DEST_APPEND
            };

            Object.extend(this.options, options || { });

            /**defining elements and text containers*/
            /** source element can be undefined if sourceDataType is set */
            this.options.sourceDataType = parseInt(this.options.sourceDataType, 10);
            // alert(this.options.sourceDataType);
            if (0 == this.options.sourceDataType) {
                this.source = this.options.source;
                if ($(this.source)) {
                    this.sourceContPane = $($(this.source).id + 'textPane');
                } else {
                    this.sourceContPane = new this.otherCardElement(this.source);
                }

            }

            /** destination element can be undefined if erase source action is set */
            if (!(null == $(this.options.destination) && this.options.sourceAction == this.SRC_ERASE)) {
                this.destination = this.options.destination;
                if ($(this.destination)) {
                    this.destinationContPane = $($(this.destination).id + 'textPane');
                } else {
                    this.destinationContPane = new this.otherCardElement(this.destination);
                }

            }
            /**eof*/

            /** elements not found */
            if ((Object.isUndefined(this.sourceContPane) && 0 == this.options.sourceDataType) || (Object.isUndefined(this.destinationContPane) && this.options.sourceAction != this.SRC_ERASE)) {
                return;
            }
            this.sourceText = this.getSourceText();
            this.playTextMover();
            Action.finishAction(this.options.creator, parseInt((this.options.priority)));
        } catch (err) {
            alert('playTextMover: initialize error:' + console.log(err));
        }
    },
    otherCardElement:function (id) {
        var _id = id.slice(-36);
        var model = null;
        var card = 0;
        for (var i = 0; i < play.globalData.stacks[0].cards.length; i++) {
            for (var j = 0; j < play.globalData.stacks[0].cards[i].objects.length; j++) {
                if (play.globalData.stacks[0].cards[i].objects[j].id == _id) {
                    model = play.globalData.stacks[0].cards[i].objects[j];
                    card = i;
                    break;
                }
            }
        }
        this.id = model.id + "textPane";
        this.update = function (value) {
            this.innerHTML = value ? value : "";
        }
        this.insert = function (value) {
            this.innerHTML = this.innerHTML + (value ? value : "");
        }
        Object.defineProperty(this, "innerHTML", {
            enumerable:true,
            configurable:false,
            get:function () {
                return play.textObjectsData[play.template.newCardElementId(card, _id)];
            },
            set:function (value) {
                play.textObjectsData[play.template.newCardElementId(card, _id)] = value;
            }
        });

    },
    initFlags:function () {
        this.SRC_MOVE = 0;
        this.SRC_COPY = 1;
        this.SRC_ERASE = 2;

        this.DEST_REPLACE = 0;
        this.DEST_APPEND = 1;
        this.DEST_AT_POSITION = 2;

        this.SRC_IS_OBJECT_COMMENT = 1;
        this.SRC_IS_CARD_COMMENT = 2;
        this.SRC_IS_STACK_COMMENT = 3;
        this.SRC_ALL_CARD_COMMENTS = 4;
    },

    getSourceText:function () {
        var text = '';

        switch (this.options.sourceDataType) {
            case this.SRC_IS_OBJECT_COMMENT:
                cardsCollection.currentElement().objects.each(function (el) {
                    if (Object.isUndefined(el.id) || !el.id) {
                        return;
                    }

                    if (play.template.newCardElementId(cardsCollection.currentElement().id, el.id) == this.options.creator) {
                        text = el.comments || '';
                        throw $break;
                    }
                }.bind(this));
                break;

            case this.SRC_IS_CARD_COMMENT:
                text = cardsCollection.currentElement().comments || '';
                break;

            case this.SRC_IS_STACK_COMMENT:
                text = cardsCollection.options.comments || '';
                break;

            case this.SRC_ALL_CARD_COMMENTS:
                text = this.collectCardComments();
                break;

        /** another text field is default */
            default:
                text = this.sourceContPane.innerHTML;
        }

        return text;
    },

    collectCardComments:function () {
        var res = $A();

        res.push('Card ' + (cardsCollection.pointer + 1) + ':');

        if (cardsCollection.currentElement().comments) {
            res.push(cardsCollection.currentElement().comments);
        }

        cardsCollection.currentElement().objects.each(function (el) {
            if (Object.isUndefined(el.id) || !el.id) {
                return;
            }

            if (el.comments) {
                res.push(el.comments);
            }
        }.bind(this));

        return res.join('<br><br>') || '';
    },

    eraseSource:function () {
        this.sourceContPane.update();
    },

    getPlainSource:function () {
        return this.sourceText.stripTags();
    },

    appendData:function () {
        this.destinationContPane.insert(this.sourceText);
    },

    replaceData:function () {
        this.destinationContPane.update(this.sourceText);
    },

    insertDataAtPosition:function () {
        try {
            if (window.getSelection && !Prototype.Browser.Gecko) {
                var selection = window.getSelection();

                /* no selection */
                if (!selection.rangeCount) {
                    return this.appendData();
                }

                var selectionElement = $(selection.getRangeAt(0).startContainer.parentNode);
                /* if selected smth out of destination skip */
                if (this.destinationContPane.id != selectionElement.id &&
                    Object.isUndefined(selectionElement.up('#' + this.destinationContPane.id))) {
                    return;
                }
                ;

                var text = document.createTextNode(this.getPlainSource());
                var range = selection.getRangeAt(0);
                range.insertNode(text);
                range.setStartAfter(text);
                range.setEndAfter(text);
                range.collapse(false);

                selection.removeAllRanges();
                selection.addRange(range);
                return;
            }

            /* fallback */
            this.appendData();
        } catch (err) {
            alert('playTextMover.insertDataAtPosition: selection error:' + console.log(err));
        }
    },

    playTextMover:function () {
        if (this.options.sourceAction == this.SRC_ERASE) {
            this.eraseSource();
            return;
        }

        /** copy/move actions */
        switch (parseInt(this.options.destinationAction, 10)) {
            case this.DEST_REPLACE:
                this.replaceData();
                break;

            case this.DEST_AT_POSITION:
                if (this.destinationContPane instanceof this.otherCardElement === false) {
                    this.insertDataAtPosition();
                } else {
                    this.appendData();
                }
                break;

        /** append is default */
            default:
                this.appendData();
        }
        /** end copy/move actions */

        /** if move option is set, erase source after copy/move actions */
        if (this.options.sourceAction == this.SRC_MOVE) {
            this.eraseSource();
        }
    }
});


Action.playPictureShow = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                item:'item'
            };
            Object.extend(this.options, options || { });
            this.counter = 0;
            this.run();
        } catch (err) {
            alert('Action.playPictureShow: initialize error:' + console.log(err));
        }
    },

    run:function () {
        this.showImage();

    },

    showImage:function () {
        var img = this.getImage(this.counter);
        img.observe("load", function () {
            if (!Object.isUndefined(this.img))document.body.removeChild(this.img);
            this.img = img;
            this.insertElement();
            this.addTimeout();
        }.bind(this));
    },

    getElement:function (id) {
        var img = new Image();
        img.src = prefix + this.options.item.elements[id];
        this.preloadImage(id);
        return img;
    },

    preloadImage:function (id) {
        var img = new Image();
        img.src = prefix + this.options.item.elements[++id];
    },

    insertElement:function () {
        document.body.insert(this.img);
    },

    addTimeout:function () {
        this.timeout = setTimeout(function () {
            this.counter++;
            this.showImage();
        }.bind(this), this.options.item.timeout * 1000);
    }
});

Action.playResizeWindow = function (x, y) {
    /**Can Also add MoveTo here*/
    var yCoef = window.outerHeight - window.innerHeight;
    new Effect.Tween(null,
        window.outerWidth,
        x,
        {duration:1.0, afterFinish:function () {
            window.resizeTo(window.outerWidth, y);
        }.bind(this)},
        function (p) {
            var height = this.height || window.outerHeight;
            this.width = p.round();
            window.resizeTo(this.width, height);
        }.bind(this)
    );
    /*new Effect.Tween(null,
     window.outerHeight,
     y,
     {duration:1.0,fps:1},
     function(p){ 
     var width = this.width||window.outerWidth;
     this.height = p.round();
     window.resizeTo(window.outerWidth, this.height); 
     }.bind(this)
     );*/

};

Action.playStarField = Class.create({
    stars:[],
    preDrawedStars:$H(),
    cleanupCount:0,
    initialize:function (options) {
        try {
            this.options = {};

            Object.extend(this.options, options || { });

            this.card = $('Card' + cardsCollection.currentElement().id);
            this.dimX = this.card.getWidth();
            this.dimY = this.card.getHeight();
            this.stars = [];
            this.createCanvas();

            if (options.item.starFieldDurationMode === "HSLimitedDurationMode") {
                setTimeout(this.stopAnimation.bind(this), options.item.starFieldDuration * 1000);
            } else {
                $(this.canvas.id).observe("click", this.stopAnimation.bind(this));
            }

            this.startAnimation();
        } catch (err) {
            alert('playerObj: initialize error:' + console.log(err));
        }
    },

    startAnimation:function () {
        $(window.document).observe("keyup", this.stopAnimation.bind(this));

        this.animInterval = setInterval(function () {
            this.ctx.clearRect(0, 0, this.dimX, this.dimY);
            if (Math.random() > 0.2) {
                this.addStar();
            }
            if (this.cleanupCount > 300) {
                this.stars = this.stars.reject(function (item) {
                    return (item.ttl < 0);
                });
                this.cleanupCount = 0;
            }
            this.stars.each(function (item) {
                if (item.ttl < 0) {
                    this.cleanupCount++;
                    return;
                }
                item.size += item.speedS;
                item.x += item.speedX;
                item.y += item.speedY;
                item.ttl--;
                var sizeDivider = 4;
                var size = Math.round(item.size * sizeDivider) / sizeDivider;
                var correction = (item.size - size) * 1.2;
                var starImg = this.makeStarImage(size);
                this.ctx.drawImage(starImg, item.x + correction, item.y + correction);
            }, this);
        }.bind(this), 50);
    },

    stopAnimation:function () {
        $(window.document).stopObserving("keyup");
        clearInterval(this.animInterval);
        this.card.parentNode.removeChild(this.canvas);
        Action.finishAction(this.options.item.creator, parseInt(this.options.item.priority));
    },

    createCanvas:function () {
        this.canvas = new Element('canvas', {
            width:this.dimX,
            height:this.dimY,
            style:'position:absolute;z-index:999;top:0px;left:0px;',
            id:'starFieldCanvas'
        });
        this.card.parentNode.insert(this.canvas);
        this.ctx = this.canvas.getContext('2d');
    },

    addStar:function () {
        var angle = 2 * Math.PI * Math.random();
        var startSpeed = 2 + 10 * Math.random();
        var size = 9 + 13 * Math.random();
        this.stars.push({
            ttl:100,
            x:this.dimX / 2 - size * 1.5,
            y:this.dimY / 2 - size * 1.5,
            speedS:0.2 * Math.random(),
            speedX:startSpeed * Math.sin(angle),
            speedY:startSpeed * Math.cos(angle),
            size:size
        });
    },
    makeStarImage:function (size) {
        var star = this.preDrawedStars.get(size);
        if (star == undefined) {
            var canvaSize = size * 3.1;
            star = new Element('canvas', {width:canvaSize, height:canvaSize});
            var ctx = star.getContext('2d');
            var x = canvaSize / 2;
            var y = canvaSize / 2;
            var r = size * 1.4;

            // dark shadow
            ctx.globalAlpha = 0.04;
            ctx.fillStyle = '#000';
            for (var i = 0.3; i < 1.2; i += 0.1) {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x - r * i, y);
                ctx.arc(x, y, r * i, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // orange shadow
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#e8caac';
            for (var i = 0.7; i < 1.5; i += 0.1) {
                var r = (10 + r) / 4 / i;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x - r, y);
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }

            // white part
            ctx.fillStyle = '#fff';
            ctx.globalAlpha = 0.4;
            this.drawWhiteShape(ctx, x, y, size / 2);
            ctx.globalAlpha = 0.9;
            this.drawWhiteShape(ctx, x, y, size / 2.4);

            // save in cache
            this.preDrawedStars.set(size, star);
        }
        return star;
    },
    drawWhiteShape:function (ctx, x, y, h) {
        // this constants define angle and size of stars
        var a = 1.2, b = 2;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x - h * b, y + h * a);
        // this define star distortion
        var c = 1.7;
        ctx.quadraticCurveTo(x + a * c, y + b * c / 2, x - h * a, y - h * b);
        ctx.quadraticCurveTo(x - b * c / 2, y + a * c, x + h * b, y - h * a);
        ctx.quadraticCurveTo(x - a * c, y - b * c / 2, x + h * a, y + h * b);
        ctx.quadraticCurveTo(x + b * c / 2, y - a * c, x - h * b, y + h * a);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }
});


Action.playSetCardVolume = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0,
                volume:0
            };
            Object.extend(this.options, options || { });

            this.run();

            Action.finishAction(this.options.creator, parseInt((this.options.priority)));
        } catch (err) {
            alert('Action.playSetCardVolume: initialize error:' + console.log(err));
        }
    },

    run:function () {
        /* check volume is within the range */
        if (this.options.volume < 0 || this.options.volume > 1) {
            return;
        }
        play.globalVolume = parseFloat(this.options.volume);
        play.help.setCardVolume();
    }
});

Action.playSlideShow = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0,
                returnToOriginal:true,
                duration:3,
                stopOnClick:false,
                isLoop:true,
                transition:'No_Transition',
                transitionDuration:0
            };

            this.cardCounter = 0;
            this.startCardIndex = cardsCollection.getPointer();

            Object.extend(this.options, options || {});

            this.fixOptionsMismatch();

            this.appendTestOptions();

            /** clear previous slideShow if set */
            if (!Object.isUndefined(play.slideShowObserver) && !Object.isString(play.slideShowObserver)) {
                play.slideShowObserver.resetHandler();
            }

            this.run();
        } catch (err) {
            alert('playerObj: playSlideShow initialize error:' + console.log(err));
        }
    },

    /** comment return statement and set proper options for test */
    appendTestOptions:function () {
        return;

        this.options.isLoop = false;
        this.options.stopOnClick = true;
        this.options.returnToOriginal = false;
        this.options.transitionDuration = 2;
        this.options.transition = "Slide_Remove_Left";
    },

    fixOptionsMismatch:function () {
        /** fix for default animation speed
         * if 0 we set 1.5 seconds
         */
        if (0 == this.options.transitionDuration) {
            this.options.transitionDuration = 0.01;
        }

        /** fix 'No Transition' option*/
        if ('No Transition' == this.options.transition) {
            this.options.transition = 'No_Transition';
        }
    },

    run:function () {
        play.slideShowObserver = this;

        /** reset after one full loop if !isLoop*/
        if (++this.cardCounter > cardsCollection.els.length && !this.options.isLoop) {
            this.resetHandler();
            return;
        }
        ;

        this.addClickObserver();
        this.timeOut = this.setMainTimeout();
    },

    setMainTimeout:function (immediate) {
        return setTimeout(function () {
            /** TODO this is really shity, remove this */
            play.animationDuration = this.options.transitionDuration;

            /** if last card -> first card */
            if (cardsCollection.getPointer() >= (cardsCollection.els.length - 1)) {
                play.animateGoto("HSGoToSpecificCardAction", 0, this.options.transition);
                delete play.animationDuration;
                return;
            }

            /** otherwise ->  next card */
            play.animateGoto("HSNextCardAction", 0, this.options.transition);
            delete play.animationDuration;

        }.bind(this), ((immediate) ? 0.001 : (this.options.duration) ) * 1000);
    },

    resetHandler:function () {
        /** clear interval */
        clearTimeout(play.slideShowObserver.timeOut);
        play.slideShowObserver.removeClickObserver();

        Action.finishAction(this.options.creator, parseInt((this.options.priority)));
        play.slideShowObserver = '';
    },

    removeClickObserver:function () {
        this.clickObserver && document.stopObserving("click", this.clickObserver) && delete this.clickObserver;
    },

    addClickObserver:function () {
        /** since all event handlers on document destroyed on card change, no need to check if clickObserver is set*/
        if (this.options.stopOnClick) {
            this.clickObserver = this.stopSlideShowOnClick;
        } else {
            this.clickObserver = this.nextCardOnClick;
        }

        setTimeout(function () {
            document.observe("click", this.clickObserver);
        }.bind(this), 100);
    },

    /** this is event handlers, use play.slideShowObserver instead of this */
    stopSlideShowOnClick:function (e) {
        e.preventDefault();
        clearTimeout(play.slideShowObserver.timeOut);
        play.slideShowObserver.removeClickObserver();

        /** fast reset to base card if stop on other card */
        if (play.slideShowObserver.options.returnToOriginal && play.slideShowObserver.startCardIndex != cardsCollection.getPointer()) {
            play.animationDuration = 0.1;
            play.animateGoto("HSGoToSpecificCardAction", play.slideShowObserver.startCardIndex, play.slideShowObserver.options.transition);
            delete play.animationDuration;
        }

        Action.finishAction(play.slideShowObserver.options.creator, parseInt((play.slideShowObserver.options.priority)));
        play.slideShowObserver = '';
    },

    nextCardOnClick:function (e) {
        e.preventDefault();
        !Object.isString(play.slideShowObserver) && play.slideShowObserver.timeOut && clearTimeout(play.slideShowObserver.timeOut);
        play.slideShowObserver.removeClickObserver();
        play.slideShowObserver.setMainTimeout(true);
    }
});

Action.playGoogleEarth = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                creator:'',
                priority:0,
                lat:0,
                lon:0,
                name:"",
                toFront:true,
                isQuit:false
            };

            Object.extend(this.options, options || {});

            this.run();

            Action.finishAction(this.options.creator, parseInt(this.options.priority, 10));
        } catch (err) {
            alert('playerObj: playGoogleEarth initialize error:' + console.log(err));
        }
    },

    run:function () {
        var targetURL = 'http://google.com/maps/m?q=';
        if (isTouchDevice()) {
            targetURL = 'http://maps.google.com/?q=';
            if (navigator.userAgent.indexOf('iPad; CPU OS 6') >= 0) {
                targetURL = 'maps://maps.google.com/?q=';
            }
        }
        targetURL += this.options.name + "@" + this.options.lat + ',' + this.options.lon + '&ui=maps';
        new Action.playWebPage({
            item:{"href":targetURL}
        });
    }
});