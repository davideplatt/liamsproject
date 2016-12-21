// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com

/**preferences object
 * keeps all userPrefs info
 */

var prefObj = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                contPane:'content'
            };
            Object.extend(this.options, options || { });
            //this.windowFadeOnDrag = false;
            //qconsole.log(localStorage);
        }
        catch (err) {
            alert('preferences: initialize error:' + console.log(err));
        }
    },

    desktopBackground:/*(!Object.isUndefined(localStorage["desktopBackground"])&&localStorage["desktopBackground"] !='null'&&localStorage["desktopBackground"]!='')?localStorage["desktopBackground"]:*/"/templates/img/admin/Copenhagen.jpg",

    windowFadeOnDrag:/*(!Object.isUndefined(localStorage["windowFadeOnDrag"])&&localStorage["windowFadeOnDrag"] !='null')?localStorage["windowFadeOnDrag"]:*/false,

    ui:function () {
        var backgrounds = new Array("/templates/img/admin/Copenhagen_thumb.jpg",
            "/templates/img/admin/Bryce_thumb.jpg",
            "/templates/img/admin/Flowers_thumb.jpg"
        );

        var container = new Element("div", {style:"padding-left:20px;" +
            "padding-top:20px;" +
            "padding-right:15px;" +
            "background-color:#E8E8E8;" +
            "height:100%;"});

        var backContainer = new Element("div", {style:"height:200px;" +
            "margin:9px;" +
            "padding-left:20px;" +
            "min-width:660px;" +
            "border:1px #ccc solid;" +
            "background-color:#E1E1E1;" +
            "-moz-border-radius:10px;" +
            "-o-border-radius:10px;" +
            "-webkit-border-radius:10px;"});

        var othersContainer = new Element("div", {style:"height:200px;" +
            "margin:9px;" +
            "padding-left:20px;" +
            "border:1px #ccc solid;" +
            "background-color:#E1E1E1;" +
            "margin-top:20px;" +
            "-moz-border-radius:10px;" +
            "-o-border-radius:10px;" +
            "-webkit-border-radius:10px;"});
        backContainer.insert(this.showTitle("Backgrounds:"));


        backgrounds.each(function (back) {
            var img = new Element("img", {
                style:"width:200px;float:left;margin-right:20px;margin-top:20px;",
                width:200,
                src:back,
                onclick:"preferences.setDesktopBackground(this);"
            });
            backContainer.insert(img);
        }.bind(this));

        if (this.windowFadeOnDrag != 'false') {
            var fodText = "enabled";
            var fodValue = "true";
        }

        else {
            var fodText = "disabled";
            var fodValue = "false";
        }
        var fadeOnDragButton = new Element("button", {value:fodValue, onclick:"preferences.setDragTransitions(this);"});
        fadeOnDragButton.update(fodText);
        var otherTbl = new Element("table");
        var tr = new Element("tr");
        var left = new Element("td");
        var right = new Element("td");

        left.insert("Widows drag transitions:");
        right.insert(fadeOnDragButton);
        otherTbl.insert(tr.insert(left).insert(right));
        othersContainer.insert(this.showTitle("Other preferences:"));
        othersContainer.insert(otherTbl);
        container.insert(backContainer).insert(othersContainer);
        return container;
    },

    setDragTransitions:function (el) {
        if (el.value == "false") {
            this.windowFadeOnDrag = true;
            localStorage["windowFadeOnDrag"] = true;
            el.value = "true";
            $(el).update("enabled");
        }
        else {
            this.windowFadeOnDrag = false;
            localStorage["windowFadeOnDrag"] = false;
            el.value = "false";
            $(el).update("disabled");
        }
    },

    setDesktopBackground:function (el) {
        this.loading = new loadingBox();
        this.desktopBackround = el.src.substr(0, (el.src.length - 10)) + el.src.substr((el.src.length - 4), el.src.length);
        localStorage["desktopBackground"] = this.desktopBackround;
        $('content').style.background = 'url(' + this.desktopBackround + ') no-repeat';
        setTimeout(function () {
            this.loading.removeBox();
        }.bind(this), 1000);
    },

    showTitle:function (text) {
        return "<div style='width:150px;padding-left:10px;" +
            "font-weight:bold;margin-top:-10px;" +
            "background-color:#E8E8E8;" +
            "border:1px #ccc solid;" +
            "-moz-border-radius:5px;" +
            "-o-border-radius:5px;" +
            "-webkit-border-radius:5px;'>" + text + "</div>";
    }
});

//preferences = new prefObj();
/**desktop object creates the desktop itself,
 * with icons and "start-up" windows;
 *
 */
var desktop = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                showClock:true,
                elements:{},
                contPane:'content'
            };
            Object.extend(this.options, options || { });
            this.elements = this.options.elements;
            //this.tabs = new stackObj;
            document.observe("contextmenu", function (e) {
                //e.stop();
                //	e.stopPropagation();
                e.preventDefault();
                return false;
            }.bind(this));

            document.observe("mousedown", function (e) {

                if (!Object.isUndefined($('context')) && $('context') != null)$('context').hide();//fade({duration:0.3});
                if (e.isRightClick() || e.button == 2) {
                    e.stop();
                    e.stopPropagation();
                    e.preventDefault();
                    e.returnValue = false;
                    if (e.element().className == 'icon' || e.element().parentNode.className == 'icon')this.showIconContext(e);
                    else this.showContext(e);
                    return false;
                }
            }.bind(this));
            setTimeout(function () {
                this.createDesktop();
            }.bind(this), 100);
        }
        catch (err) {
            alert('dock: initialize error:' + console.log(err));
        }
    },
    createDesktop:function () {
        /**info container message*/
        var infoText = "<div style='text-align:justify;padding:10px;'><br/>" +
            "<b>Welcome to system administration area!</b><br/><br/>" +
            "<p>The admin area based on WEBdesktop + windows interface.</p>" +
            "<p>You can see icons on the left side of desktop." +
            "Each icon starts it's application as simple as double click.</p>" +
            "<p>We tried to make your work with this interface as easy as possible," +
            "and designed system that incorporates years of experience " +
            "and introduces new level of usability and funtionality.</p></div>";
        /**eof*/

        //$(this.options.contPane).style.height =document.viewport.getHeight() + 'px';
        //$(this.options.contPane).style.width ="100%";
        //$(this.options.contPane).style.backgroundImage = "url("+preferences.desktopBackground+")";
        //$(this.options.contPane).setStyle({"\-moz\-background-\size":"100% auto"});
        //$(this.options.contPane).style['-moz-background-size']= "100% auto";


        /**Dancing around FF bug, setting styles
         * with setAttribute method;
         */
        $(this.options.contPane).setAttribute("style", "-moz-background-size:100% auto;" +
            "-khtml-background-size:100% auto," +
            "-o-background-size:100% auto;" +
            "-webkit-background-size:100% auto;" +
            "background-image:url(" + preferences.desktopBackground + ");" +
            "min-height:" + document.viewport.getHeight() + "px;" +
            "height:100%;");


        document.body.style.overflow = 'hidden';
        document.body.style.cursor = 'progress';
        this.loading = new loadingBox();
        Dock = new dock;
        appWindowsStack = null;
        new windowCreate({
            title:'about SMKadmin',
            scale:false,
            content:infoText,
            withTopMenu:false,
            withScrollBars:false,
            withControls:true,
            width:'350',
            height:'400',
            contPane:'content'});


        /**pages manager*/
        var pagesList = new tableObj({table:'page', columns:Array({name:'id', type:'text'},
            {name:'title', type:'text'},
            {name:'text', type:'textarea'})});

        var nodesList = new tableObj({table:'node', columns:Array({name:'id', type:'text'},
            {name:'name', type:'text'},
            {name:'module', type:'text'},
            {name:'params', type:'textarea'})});

        var collateralList = new tableObj({table:'collateral',
            columns:Array({name:'id', type:'text'},
                {name:'title', type:'text'},
                {name:'cat', type:'text'},
                {name:'preview', type:'text'},
                {name:'active', type:'text'},
                {name:'image', type:'file'}),
            addButton:true});

        var collateralCatsList = new tableObj({table:'collateral_cats',
            columns:Array({name:'id', type:'text'},
                {name:'title', type:'text'},
                {name:'image', type:'file'},
                {name:'infolink', type:'text'},
                {name:'bgcolor', type:'text'},
                {name:'active', type:'text'}),
            addButton:true});

        //var editPage = new editorObj({table:'page',columns:Array('id','title','text'), id:1});


        setTimeout(function () {

            new iconCreate({
                title:'Pages manager',
                content:pagesList.table,
                xPos:20,
                yPos:20,
                width:600,
                height:400,
                className:'icon',
                src:"/templates/img/ui/icons/pages.png",
                contPane:'content'});

            new iconCreate({
                title:'Structure manager',
                content:nodesList.table,
                xPos:20,
                yPos:100,
                className:'icon',
                src:"/templates/img/ui/icons/structureMan.png",
                contPane:'content'});

            new iconCreate({
                title:'Collateral manager',
                content:collateralList.table,
                xPos:20,
                yPos:190,
                className:'icon',
                src:"/templates/img/ui/icons/collateral.png",
                contPane:'content'});

            new iconCreate({
                title:'Collateral categories manager',
                content:collateralCatsList.table,
                xPos:20,
                yPos:280,
                width:500,
                className:'icon',
                src:"/templates/img/ui/icons/collateral.png",
                contPane:'content'});

            new iconCreate({
                title:'System preferences',
                content:preferences.ui(),
                id:'sysPrefs',
                xPos:20,
                yPos:370,
                width:740,
                height:400,
                className:'icon',
                src:"/templates/img/ui/icons/PrefIco.png",
                contPane:'content'});

            document.body.style.cursor = 'default';
            this.loading.removeBox();
            Droppables.add(this.options.contPane, {
                onDrop:function (drag, drop, perc) {
                    //alert('hi');
                    //drag.style.zIndex='9999999';
                }
            });
        }.bind(this), 1500);
        /**EOF pages manager*/

    },

    showContext:function (e) {
        if (!Object.isUndefined($('context')) && $('context') != null) {
            if ($('context').childNodes.length > 1) {
                $('context').removeChild($('context').childNodes[0]);
            }
            $('context').show();
            $('context').setStyle({
                top:e.pointerY() + 'px',
                left:e.pointerX() + 'px'
            });
        }
        else {
            var div = new Element("div", {
                id:"context",
                style:"background-color:#F9F9F9;" +
                    "width:250px;" +
                    "height:100px;" +
                    "top:" + e.pointerY() + "px;" +
                    "left:" + e.pointerX() + "px;" +
                    "position:absolute;" +
                    "z-index:999;" +
                    "-moz-border-radius:7px;" +
                    "-webkit-border-radius:7px;" +
                    "-khtml-border-radius:7px;" +
                    "padding-top:5px;"
            });
            var item = new Element("div",
                {style:"font-size:15px;" +
                    "padding:3px 3px 3px 20px;" +
                    "height:15px;"});
            item.update("Change Desktop Background...");
            div.insert(item);
            document.body.insert(div);
            div.setOpacity(0.9);
            item.setOpacity(1);
            this.setCDBObserver(item);
        }
    },

    showIconContext:function (e) {
        //console.log(e.element());
        if (!Object.isUndefined($('context')) && $('context') != null) {
            //if($('context').childNodes.length<2){
            $('context').update();
            var cdb = this.createDesktopContextContents();
            var mtt = this.createIconContextContents();
            $('context').insert(mtt);
            $('context').insert(cdb);
            this.setCDBObserver(cdb);
            this.setMTTObserver(mtt, e.element());


            //}

            $('context').show();
            $('context').setStyle({
                top:e.pointerY() + 'px',
                left:e.pointerX() + 'px'
            });
        }
        else {
            var div = new Element("div", {
                id:"context",
                style:"background-color:#F9F9F9;" +
                    "width:250px;" +
                    "height:100px;" +
                    "top:" + e.pointerY() + "px;" +
                    "left:" + e.pointerX() + "px;" +
                    "position:absolute;" +
                    "z-index:999;" +
                    "-moz-border-radius:7px;" +
                    "-webkit-border-radius:7px;" +
                    "-khtml-border-radius:7px;" +
                    "padding-top:5px;"
            });
            var item = new Element("div",
                {style:"font-size:15px;" +
                    "padding:3px 3px 3px 20px;" +
                    "height:15px;"});
            var item2 = new Element("div",
                {style:"font-size:15px;" +
                    "padding:3px 3px 3px 20px;" +
                    "height:15px;"});
            item.update("Change Desktop Background...");
            item2.update("Move To Trash");
            div.insert(item);
            div.insert(item2);
            document.body.insert(div);
            div.setOpacity(0.9);
            item.setOpacity(1);
            this.setCDBObserver(item);
            this.setMTTObserver(item2, e.element());
        }
    },

    createDesktopContextContents:function () {
        var item = new Element("div",
            {style:"font-size:15px;" +
                "padding:3px 3px 3px 20px;" +
                "height:15px;"});
        item.update("Change Desktop Background...");
        return item;
    },

    createIconContextContents:function () {
        var item2 = new Element("div",
            {style:"font-size:15px;" +
                "padding:3px 3px 3px 20px;" +
                "height:15px;"});
        item2.update("Move To Trash");

        return item2;

    },

    setCDBObserver:function (el) {
        el.observe("mousedown", function (e) {
            /**Creating prefs Window*/
            new windowCreate({
                title:'System preferences',
                scale:false,
                content:preferences.ui(),
                withTopMenu:false,
                withScrollBars:false,
                withControls:true,
                width:740,
                height:400,
                contPane:'content'});
            /**eof*/
        }.bind(this));
        el.observe("mouseover", function () {
            el.setStyle("font-size:15px;" +
                "padding:3px 3px 3px 20px;" +
                "height:15px;" +
                "background:#0E37E7;" +
                "background:-moz-linear-gradient(top, #4A6AF5, #0E37E7);" +
                "background:-webkit-gradient(linear, left top, left bottom, from(#4A6AF5), to(#0E37E7));");
            /*	el.style.background="#0E37E7," +
             "-moz-linear-gradient(top, #4A6AF5, #0E37E7)," +
             "-webkit-gradient(linear, left top, left bottom, from(#4A6AF5), to(#0E37E7))";*/
        }.bind(this));
        el.observe("mouseout", function () {
            el.style.background = "transparent";
        }.bind(this));

    },

    setMTTObserver:function (el, target) {
        try {
            el.observe("mousedown", function (e) {
                /**Moving Item To Trash*/
                try {
                    if (target.parentNode.className == 'icon') var delme = target.parentNode;
                    else console.log(target);
                    Dock.trashElements.push(target.parentNode);
                    target.parentNode.fade();
                }
                catch (err) {
                    console.log(err);
                }
                /**eof*/
            }.bind(this));
            el.observe("mouseover", function () {
                el.setStyle("font-size:15px;" +
                    "padding:3px 3px 3px 20px;" +
                    "height:15px;" +
                    "background:#0E37E7;" +
                    "background:-moz-linear-gradient(top, #4A6AF5, #0E37E7);" +
                    "background:-webkit-gradient(linear, left top, left bottom, from(#4A6AF5), to(#0E37E7));");
            }.bind(this));
            el.observe("mouseout", function () {
                el.style.background = "transparent";
            }.bind(this));
        }
        catch (err) {
            console.log(err);
        }
    }
});

/**Top menu object introduces
 * realization of windows top menu
 */
var topMenu = Class.create({

    initialize:function (options) {
        try {
            this.options = {
                parentElement:"",
                items:new Array()
            };
            Object.extend(this.options, options || { });
            this.items = this.options.items;
        }
        catch (err) {
            alert('topMenu: initialize error:' + console.log(err));
        }
    },

    items:new Array(),

    parentElement:$('content'),

    createMenuArea:function () {

    },

    createMenuItem:function () {

    },

    createSubMenu:function () {

    }

});

/**dock object creates dock,
 * trashbox, clock and other "widgets".
 * It also handles collapsed windows
 */
var dock = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                height:'60',
                showClock:true,
                elements:{},
                contPane:'content'
            };
            Object.extend(this.options, options || { });
            this.elements = this.options.elements;
            //this.tabs = new stackObj;
            setTimeout(function () {
                this.createDock();
            }.bind(this), 10);
        }
        catch (err) {
            alert('dock: initialize error:' + console.log(err));
        }
    },

    elements:{},

    tabsPane:'',

    trashBox:'',

    trashElements:Array(),

    tabs:{},

    createDock:function () {
        try {
            var dockBox = new Element('div', {id:'dock',
                style:"height:" + this.options.height + "px;" +
                    "width:100%;" +
                    "background:#ffbbcc;" +
                    "position:absolute;" +
                    "bottom:0px;" +
                    "z-index:1100;"});
            dockBox.setOpacity(0.8);
            if (this.options.showClock) {
                dockBox.insert(this.createClock());
            }
            dockBox.insert(this.createTrashBox());

            var dockTable = new Element('table', {style:"width:40%;"});
            var dockTabsPane = new Element('tr', {id:"dockTabsPane"});

            dockBox.insert(dockTable.insert(dockTabsPane));

            $(this.options.contPane).insert(dockBox);
            this.tabsPane = $('dockTabsPane');

            /**trash actions*/
            Droppables.add(this.trashBox.id, {
                /*onHover: function(drag, drop, perc){
                 drop.style.backgroundColor = '#ccffcc';
                 }*/
                hoverclass:'trashHover',
                onDrop:function (drag, drop, perc) {
                    this.trashElements.push(drag);
                    drag.fade();
                }.bind(this)
            });

            $(this.trashBox.id).observe("dblclick", function (event) {
                event.stop();
                var cont = new Element('div');
                this.trashElements.each(function (el) {
                    el.style.display = 'block';
                    el.style.position = 'static';
                    cont.insert(el);
                });
                new windowCreate({
                    title:'trash',
                    scale:false,
                    content:cont,
                    withTopMenu:false,
                    withScrollBars:false,
                    withControls:true,
                    width:'300',
                    height:'300',
                    contPane:'content'});

            }.bind(this));
        }
        catch (err) {
            console.log(err);
        }
    },

    insertTab:function (element) {
        try {
            this.tabs[element.id] = element;
            var tabBox = new Element('td', {id:"dockTab" + element.id,
                width:"120",
                style:"border:1px #ccc solid;" +
                    "width:120px;" +
                    "max-width:200px;" +
                    "cursor:pointer;" +
                    "display:none;" +
                    "background:#0077dd"});
            tabBox.insert(element.title);

            this.tabsPane.insert(tabBox);
            new Effect.Grow(tabBox);
            tabBox.observe("click", function (event) {
                new Effect.Grow($(tabBox.id.substr(7, tabBox.id.length)));
                new Effect.Fade(tabBox, {duration:'0.8'});
                setTimeout(function () {
                    tabBox.parentNode.removeChild(tabBox);
                }.bind(this), 800);

                delete this.tabs[tabBox.id.substr(7, tabBox.id.length)];
            }.bind(this));
        }
        catch (err) {
            alert('dock. insertTab error' + console.log(err));
        }
    },

    createTrashBox:function () {
        var trashBox = new Element('div', {id:"trashBox",
            style:"float:right;" +
                "width:60px;" +
                "height:60px;" +
                "font-size:14px;" +
                "font-family:Comic Sans MS,Herculanum;" +
                "background:url(/templates/img/ui/trashBox.png) center no-repeat;"});
        this.trashBox = trashBox;
        return trashBox;
    },

    createClock:function () {
        var date = new Date();
        var hours = date.getUTCHours() + 2;
        var minutes = date.getUTCMinutes();
        //alert((""+minutes).length);
        if (("" + minutes).length == 1) minutes = '0' + minutes;
        var dateBox = new Element('div', {style:"float:right;" +
            "width:90px;" +
            "font-size:30px;" +
            "font-family:Comic Sans MS,Herculanum"});
        var hoursBox = new Element("span", {id:'hoursBox'});
        var minutesBox = new Element("span", {id:'minutesBox'});
        hoursBox.insert(hours);
        minutesBox.insert(minutes);
        dateBox.insert(hoursBox).insert(':').insert(minutesBox);

        setInterval(function () {
            this.updateTime();
        }.bind(this), 5000);
        return dateBox;
    },

    updateTime:function () {
        var date = new Date();
        var hours = date.getUTCHours() + 2;
        var minutes = date.getUTCMinutes();
        if (("" + minutes).length == 1) minutes = '0' + minutes;
        $('hoursBox').update(hours);
        $('minutesBox').update(minutes);

    }
});

/**Icons class handling
 * creation of icons and assigning
 * actions that will perform
 * on icon click.
 */
var iconCreate = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                title:'',
                src:'/templates/img/admin/pages.gif',
                contPane:'content',
                xPos:20,
                yPos:20,
                id:'',
                className:'icon',
                width:350,
                height:350,
                color:'#ffe',
                content:''
            };
            Object.extend(this.options, options || { });
            this.title = this.options.title;

            this.createIcon();
        }
        catch (err) {
            alert('window: initialize error:' + console.log(err));
        }
    },

    icon:{},

    edit:'',

    destroyEdit:function () {
        //this.edit.destroy();
        this.icon.childNodes[2].style.backgroundColor = "transparent";
        //this.edit='';
    },

    createIcon:function () {
        var icon = new Element('div', {style:"width:98px;" +
            "text-align:center;" +
            "position:absolute;" +
            "color:" + this.options.color + ";" +
            "top:" + this.options.yPos + "px;" +
            "left:" + this.options.xPos + "px;"});
        icon.addClassName(this.options.className);
        if (this.options.id != '')icon.id = this.options.id;
        var img = new Element('img', {style:"width:48px;",
            src:this.options.src});
        var text = new Element('span', {style:"width:98px;" +
            "display:inline-block;" +
            "font-family:arial,tahoma,verdana;" +
            "font-size:13px;" +
            "font-weight:100;" +
            "text-shadow:#333 2px 2px;" +
            "-moz-border-radius:10px;" +
            "-o-border-radius:10px;" +
            "-webkit-border-radius:10px;" +
            "border-radius:10px;" +
            "padding:3px;"}).update(this.options.title);
        icon.insert(img).insert('<br/>').insert(text);
        $(this.options.contPane).insert(icon);
        new Draggable(icon, {
            ghosting:true
        });

        this.icon = icon;

        icon.observe('mousedown', function (event) {

            if (icon.childNodes[2].style.backgroundColor != "#7788ff" && icon.childNodes[2].style.backgroundColor != "rgb(119, 136, 255)") {
                //alert(icon.childNodes[2].style.backgroundColor);
                icon.childNodes[2].style.backgroundColor = "#7788ff";
            }
            else {
                if (this.edit == '') {
                    this.edit = new Ajax.InPlaceEditor(icon.childNodes[2], '/ui.php', {
                        cancelControl:false,
                        okControl:false,
                        highlightcolor:'none',
                        externalControl:'elementNotExists',
                        externalControlOnly:true,
                        highlightendcolor:'none',
                        hoverClassName:'',
                        submitOnBlur:true,
                        onLeaveEditMode:function (form, value) {
                            //console.log(this.edit);
                            //this.destroyEdit();
                            //console.log(icon.childNodes[2]);
                            icon.childNodes[2].style.backgroundColor = 'transparent';
                        }.bind(this)
                    });

                    //alert(icon.childNodes[2].style.backgroundColor);
                    //icon.childNodes[2].style.backgroundColor='transparent';
                    //console.log(icon.childNodes[2]);
                    /*setTimeout(function(){
                     icon.childNodes[3].style.backgroundColor='transparent';
                     }.bind(this),300);*/
                }
                else icon.childNodes[2].style.backgroundColor = 'transparent';
                //this.edit.enterEditMode('click');

            }


        }.bind(this));

        icon.observe('dblclick', function () {
            icon.childNodes[2].style.backgroundColor = 'transparent';
            new windowCreate({
                title:this.options.title,
                scale:false,
                content:this.options.content,
                withTopMenu:false,
                withScrollBars:false,
                withControls:true,
                width:this.options.width,
                height:this.options.height,
                contPane:'content'});
        }.bind(this));

    }
});

/**Window object
 * handles windows creation,
 * widows controlls,
 * resizing, and creates
 * new stack of windows
 * to perform focusing, position restoring, etc.
 */
var windowCreate = Class.create({

    initialize:function (options) {
        try {
            this.options = {
                title:'',
                scale:false,
                content:{},
                withTopMenu:false,
                withScrollBars:false,
                withControls:true,
                width:'300',
                height:'300',
                contPane:'content'
            };
            Object.extend(this.options, options || { });
            // alert(this.options.content);
            this.title = this.options.title;
            this.content = this.options.content;
            this.createWindow();
        }
        catch (err) {
            alert('window: initialize error:' + console.log(err));
        }
    },

    id:'',

    title:'',

    content:{},

    scrollbars:'',

    topMenu:'',

    controls:'',

    window:'',

    resizer:'',

    state:{},

    createWindow:function () {
        try {
            this.checkStack();
            this.id = 'appWindow' + appWindowsStack.elements().length;
            this.window = {
                id:this.id,
                title:this.title,
                content:this.content,
                scrollbars:this.scrollbars,
                topMenu:this.topMenu,
                controls:this.controls
            },

                this.addToStack(this.window);

            var windowBox = new Element('div', {
                id:this.id,
                width:this.options.width,
                height:this.options.height,
                style:"overflow:hidden;" +
                    "position:absolute;" +
                    "height:" + this.options.height + 'px;' +
                    "width:" + this.options.width + 'px;' +
                    "z-index:" + appWindowsStack.elements().length + ";" });

            var windowHeader = this.createHeader();
            if (this.options.withControls) windowHeader.insert(this.createControls());
            windowHeader.insert(this.title);

            var contentBox = new Element('div', {id:windowBox.id + 'contentBox',
                style:"width:" + (this.options.width - 2) + "px;" +
                    "height:" + (this.options.height - 25 - 13) + "px;" +
                    "overflow:hidden;" +
                    "border:1px #ccc solid;" +
                    "background-color:#FFFFFF;"});
            var windowFooter = new Element('div', {
                style:"width:100%;" +
                    "height:13px;" +
                    "background-color:#ededed;" +
                    "text-align:right;"
            });
            var resizer = new Element('img', {
                style:"" +
                    "cursor:nwse-resize;",
                src:"/templates/img/ui/window/windowResize.png",
                id:windowBox.id + 'resizer'
            });
            this.resizer = resizer;
            //alert(this.content);
            windowBox.insert(windowHeader);
            $(contentBox).insert(this.content);
            if (this.options.withTopMenu) contentBox.insert(this.createMenuArea());
            if (this.options.withScrollBars) this.createScrollBars();
            windowBox.insert(contentBox);
            windowFooter.insert(resizer);
            windowBox.insert(windowFooter);


            this.injectWindow(windowBox);
            this.addObservers();
        }
        catch (err) {
            alert('Window: create window error ' + console.log(err));
        }

    },

    checkStack:function () {
        //	alert(appWindowsStack);
        if (!appWindowsStack || appWindowsStack === null || Object.isUndefined(appWindowsStack)) appWindowsStack = new stackObj();
        return true;
    },

    addToStack:function () {
        appWindowsStack.push(this.window);
    },

    removeFromStack:function (id) {
        appWindowsStack.unsetById(id);
    },

    changeZIndex:function (active) {
        var i = 0;
        appWindowsStack.elements().each(function (el) {
            $(el.id).style.zIndex = i;
            i++;
        });
        setTimeout(function () {
            active.style.zIndex = appWindowsStack.elements().length + 1;
        }.bind(this), 10);
    },
    createHeader:function () {
        var headContainer = new Element('div', {'class':'handle',
            width:this.options.width,
            style:"background:url(/templates/img/ui/window/headerBack.png);" +
                "height:23px;" +
                "color:#222;" +
                "text-shadow: 0 1px 0 #ffffff;" +
                "cursor:move default;" +
                "text-align:left;" +
                "font-family: Arial, Tahoma;" +
                "font-size:15px;" +
                "line-height:22px;" +
                "-moz-border-radius:5px 5px 0 0;" +
                "-o-border-radius:5px 5px 0 0;" +
                "-webkit-border-radius:5px 5px 0 0;"});
        var leftCorner = new Element('div', {style:"background:url(/templates/img/ui/window/headerLC.png);" +
            "float:left;" +
            "width:5px;" +
            "height:23px;" +
            "-moz-border-radius:10px 0 0 0;" +
            "-o-border-radius:10px 0 0 0;" +
            "-webkit-border-radius:10px 0 0 0;"});
        var rightCorner = new Element('div', {style:"background:url(/templates/img/ui/window/headerRC.png);" +
            "float:right;" +
            "width:5px;" +
            "height:23px;" +
            "-moz-border-radius:0 10px 0 0;" +
            "-o-border-radius:0 10px 0 0;" +
            "-webkit-border-radius:0 10px 0 0;"});
        headContainer.insert(leftCorner);
        headContainer.insert(rightCorner);
        return headContainer;
    },
    createMenuArea:function () {

    },

    createScrollBars:function () {

    },

    createControls:function () {
        var closeButton = new Element('div', {id:this.id + "closeButton",
            style:"width:14px;" +
                "height:14px;" +
                "float:left;" +
                "margin-top:4px;" +
                "margin-left:3px;" +
                "cursor:pointer;" +
                "background:url(/templates/img/ui/window/headerCloseBut.png);"});
        var collapseButton = new Element('div', {id:this.id + "collapseButton",
            style:"width:14px;" +
                "height:14px;" +
                "float:left;" +
                "margin-top:4px;" +
                "margin-left:7px;" +
                "cursor:pointer;" +
                "background:url(/templates/img/ui/window/headerCollapseBut.png);"});
        var expandButton = new Element('div', {id:this.id + "expandButton",
            style:"width:14px;" +
                "height:14px;" +
                "float:left;" +
                "margin-top:4px;" +
                "margin-left:7px;" +
                "cursor:pointer;" +
                "background:url(/templates/img/ui/window/headerExpandBut.png);"});
        var buttonsContainer = new Element('div', {style:"width:70px;" +
            "float:left;"

        });
        buttonsContainer.insert(closeButton);
        buttonsContainer.insert(collapseButton);
        buttonsContainer.insert(expandButton);
        return buttonsContainer;
    },

    injectWindow:function (domWindow) {
        if (!this.options.contPane)
            var contPane = $('contPane');
        else var contPane = $(this.options.contPane);
        domWindow.style.display = 'none';
        contPane.insert(domWindow);
        domWindow.appear();
        if (preferences.windowFadeOnDrag != 'false') {
            var stEff = function (element) {
                new Effect.Opacity(element, { from:1, to:0.8, duration:0.5 });
            };
            var endEff = function (element) {
                new Effect.Opacity(element, { from:0.8, to:1, duration:0.5 });
            };
        }
        else {
            var stEff = false;
            var endEff = false;
        }
        new Draggable($(domWindow.id), {handle:'handle',
            starteffect:stEff,
            endeffect:endEff,
            onEnd:function (element) {
                //this.changeZIndex();
                var i = 0;
                appWindowsStack.elements().each(function (el) {
                    $(el.id).style.zIndex = i;
                    i++;
                });
                setTimeout(function () {
                    element.element.style.zIndex = appWindowsStack.elements().length + 1;
                }.bind(this), 10);
                //alert(appWindowsStack.elements().length);
            } });
        var qwe = domWindow.id;
        $(domWindow.id).observe("mousedown", function (event) {
            var i = 0;
            appWindowsStack.elements().each(function (el) {
                $(el.id).style.zIndex = i;
                i++;
            });
            setTimeout(function () {
                $(this.id).style.zIndex = appWindowsStack.elements().length + 1;
            }.bind(this), 10);
        }.bind(this));
    },

    addObservers:function () {
        $(this.id + 'closeButton').observe('click', function () {
            new Effect.Fade(this.id);
            setTimeout(function () {
                $(this.id).parentNode.removeChild($(this.id));
            }.bind(this), 1000);
            this.removeFromStack(this.id.substr(9, this.id.length));

        }.bind(this));

        $(this.id + 'collapseButton').observe('click', function () {
            var pos = $(this.id).cumulativeOffset();
            this.state.xPos = pos.left;
            this.state.yPos = pos.top;
            this.state.height = $(this.id).getHeight();
            this.state.width = $(this.id).getWidth();

            new Effect.DropOut(this.id, {duration:'0.8'});
            Dock.insertTab(this);
            /*setTimeout(function(){//new Effect.Move($(this.id),{x:this.state.xPos,y:this.state.yPos+1000,mode:'absolute'});
             $(this.id).fade();
             }.bind(this),250);*/
            //Effect.Puff($(this.id));
            //this.removeFromStack(this.id);

        }.bind(this));

        $(this.id + 'expandButton').observe('click', function (event) {
            //new Effect.Grow(this.id);
            if (this.state.expanded != 1) {
                //alert('his');
                this.state.expanded = 1;
                var pos = $(this.id).cumulativeOffset();
                this.state.xPos = pos.left;
                this.state.yPos = pos.top;
                this.state.height = $(this.id).getHeight();
                this.state.width = $(this.id).getWidth();
                new Effect.Scale($(this.id), 100, {scaleContent:false,
                    scaleMode:{originalHeight:document.body.getHeight() - 60,
                        originalWidth:document.body.getWidth()
                    }});
                new Effect.Scale($(this.id + 'contentBox'), 100, {scaleContent:false,
                    scaleMode:{originalHeight:document.body.getHeight() - 60 - 25 - 13,
                        originalWidth:document.body.getWidth() - 2
                    }});
                new Effect.Move($(this.id), {x:0, y:0, mode:'absolute'});
                this.changeZIndex(event.element().parentNode.parentNode.parentNode);

            }
            else {

                new Effect.Scale($(this.id), 100, {scaleContent:false,
                    scaleMode:{originalHeight:this.state.height,
                        originalWidth:this.state.width
                    }});
                new Effect.Scale($(this.id + 'contentBox'), 100, {scaleContent:false,
                    scaleMode:{originalHeight:this.state.height - 25 - 13,
                        originalWidth:this.state.width - 2
                    }});
                new Effect.Move($(this.id), {x:this.state.xPos, y:this.state.yPos, mode:'absolute'});
                this.changeZIndex(event.element().parentNode.parentNode.parentNode);
                this.state.expanded = 0;
            }
        }.bind(this));

        new Draggable($(this.resizer), {
            starteffect:false,
            endeffect:false,
            onDrag:function (object, event) {
                try {
                    //event.pointerX;	
                    //event.pointerY;
                    var offs = $(this.id).cumulativeOffset();
                    //object.delta[1];
                    if ((event.pointerX() - offs.left + 7 > 150 && event.pointerY() - offs.top + 13 > 90) || (object.delta[0] > 0 && object.delta[1] > 0)) {
                        $(this.id).style.width = event.pointerX() - offs.left + 7 + 'px';
                        $(this.id).style.height = event.pointerY() - offs.top + 13 + 'px';

                        $(this.id + 'contentBox').style.width = event.pointerX() - offs.left - 2 + 7 + 'px';
                        $(this.id + 'contentBox').style.height = event.pointerY() - offs.top - 10 - 25 + 'px';


                        object.element.style.position = "static";
                    }
                    else object.element.style.position = "static";
                }
                catch (err) {
                    alert('window.add resize observer error' + console.log(err));
                }
            }.bind(this)
        });

    }

});

/**Table object
 * generates simple table structure
 * commonly used to view content list
 */
var tableObj = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                table:'pages',
                columns:Array(),
                addButton:false
            };
            Object.extend(this.options, options || { });
            // this.title = this.options.title;

            this.getData();
        }
        catch (err) {
            alert('window: initialize error:' + console.log(err));
        }
    },

    data:'',

    table:'',

    createTable:function () {
        var data = this.getData();


    },

    setEditObserver:function (el, id) {
        el.observe("click", function () {
            var editPage = new editorObj({table:this.options.table, columns:this.options.columns, id:id});
            setTimeout(function () {
                new windowCreate({
                    title:this.options.table + ' - edit',
                    scale:false,
                    content:editPage.table,
                    withTopMenu:false,
                    withScrollBars:false,
                    withControls:true,
                    width:'650',
                    height:'400',
                    contPane:'content'});
                nicEditors.allTextAreas({iconsPath:'/templates/js/lib/nicEditorIcons.gif',
                    width:'100%',
                    fullPanel:true});
            }.bind(this), 160);

        }.bind(this));
    },

    setAddObserver:function (el, id) {
        el.observe("click", function () {
            var editPage = new editorObj({table:this.options.table, columns:this.options.columns, id:''});
            setTimeout(function () {
                new windowCreate({
                    title:this.options.table + ' - edit',
                    scale:false,
                    content:editPage.table,
                    withTopMenu:false,
                    withScrollBars:false,
                    withControls:true,
                    width:'650',
                    height:'300',
                    contPane:'content'});
                nicEditors.allTextAreas({iconsPath:'/templates/js/lib/nicEditorIcons.gif',
                    width:'100%',
                    fullPanel:true});
            }.bind(this), 160);

        }.bind(this));
    },

    getData:function () {
        try {
            //	alert(this.options.table + '/');
            var req = new Ajax.Request(this.options.table + '/', {
                onSuccess:function (responce) {
                    this.data = responce.responseJSON;
                    var table = new Element('table', {width:"100%", cellspacing:0, style:"margin:0px;padding:0px;"});
                    var tr = new Element('tr');

                    this.options.columns.each(function (col) {
                        var td = new Element('td', {style:"border:1px #ccc solid;"}).update(col.name);
                        tr.insert(td);
                    }.bind(this));
                    tr.insert(new Element('td', {style:"border:1px #ccc solid;"}).update('edit'));
                    table.insert(tr);

                    var i = 0;
                    this.data.each(function (el) {
                        if (i % 2 == 0) var tr = new Element('tr', {style:"background:#efefef;"});
                        else var tr = new Element('tr', {style:"background:#e1e1e1;"});
                        //{style:"border:1px #ccc solid;"}
                        //var tr = new Element('tr');
                        this.options.columns.each(function (col) {
                            var td = new Element('td', {style:"border:1px #ccc solid;"}).update(el[col.name]);
                            tr.insert(td);
                        }.bind(this));
                        var edit = new Element("input", {type:"submit", value:"edit"});
                        var td = new Element('td', {style:"border:1px #ccc solid;"}).update(edit);
                        tr.insert(td);
                        this.setEditObserver(edit, el.id);
                        table.insert(tr);
                        i++;
                    }.bind(this));
                    var tableContainer = new Element("div", {style:"width:100%;height:100%;background-color:#E8E8E8;"});
                    tableContainer.insert(table);
                    if (this.options.addButton) {
                        var addButton = new Element("button", {value:'add', style:"float:right;"});
                        addButton.update("add");
                        tableContainer.insert(addButton);
                        this.setAddObserver(addButton);
                    }
                    this.table = tableContainer;

                }.bind(this)
            });

            setTimeout(function () {
                return this.table;
            }.bind(this), 1000);
        }
        catch (err) {
            alert("error in tableObj: getData" + console.log(err));
        }
    }

});

/**Editor object
 * creates forms for adding
 * and editing content
 */
var editorObj = Class.create({
    initialize:function (options) {
        try {
            this.options = {
                table:'pages',
                columns:Array(),
                id:'1'
            };
            Object.extend(this.options, options || { });
            if (this.options.id != '')
                this.getData();
            else
                this.createEmptyForm();
        }
        catch (err) {
            alert('window: initialize error:' + console.log(err));
        }
    },

    data:'',

    table:'',

    loading:{},

    createTable:function () {
        var data = this.getData();


    },

    submitFile:function (form) {
        var iframe = new Element("iframe", {    id:"submitFrame",
            name:"submitFrame",
            style:"width:1px;" +
                "height:1px;" +
                "border:none;"});
        document.body.insert(iframe);
        form.target = iframe.name;
        form.submit();
        var loader = new loadingBox();
        iframe.observe("load", function (event) {
            setTimeout(function () {
                document.body.removeChild(iframe);
                loader.removeBox();
                document.fire('load');
            }.bind(this), 500);
        });


    },

    setEditObserver:function (edit) {
        if (!Object.isUndefined($('dropfile'))) {

            /*document.getElementById('dropfile').addEventListener("drop", upload, false);
             document.getElementById('dropfile').addEventListener('dragover', function(event) { 
             event.returnValue = false; 
             }, false);
             function upload(event){
             alert('hello');
             console.log(event.dataTransfer);
             event.stopPropagation();

             }*/


            setTimeout(function () {
                console.log($('dropfile').up().firstDescendant());
                $('dropfile').addEventListener('dragover', function (event) {
                    event.returnValue = false;
                }, false);


                $('dropfile').observe('drop', function (event) {
                    console.log(event.dataTransfer.types);
                    console.log(event.dataTransfer.getData('dyn.agk86rexuqu2u'));
                    console.log(event.dataTransfer.getData('text/uri-list'));
                    event.stop();
                    $('dropfile').up().firstDescendant().value = files[0];
                }.bind(this));
            }.bind(this), 2000);
        }
        edit.observe("click", function () {
            //	try{
            var data = {};
            var form = $(this.options.table + 'form' + this.options.id);
            /*console.log(form.image);
             $(this.options.table + 'form'+this.options.id).request({
             method:"POST",
             onCreate: function(){
             this.loading = new loadingBox();
             }.bind(this),
             onSuccess: function(){
             setTimeout(function(){this.loading.removeBox();}.bind(this),500);
             }.bind(this)
             });
             }
             catch(err){
             console.log(err);
             }*/

            if (form.getInputs('file').size() != 0 && form.getInputs('file')[0].value != '') this.submitFile(form);
            else {
                this.options.columns.each(function (col) {
                    data[col.name] = $(this.options.table + col.name + this.options.id).value;
                }.bind(this));

                new Ajax.Request(form.action, {
                    method:'post',
                    parameters:data,

                    onCreate:function () {
                        this.loading = new loadingBox();
                    }.bind(this),

                    onSuccess:function () {

                        setTimeout(function () {
                            this.loading.removeBox();
                        }.bind(this), 500);
                    }.bind(this)
                });
                return false;
            }
        }.bind(this));
    },

    createEmptyForm:function () {
        var form = new Element("form", {
            action:this.options.table + '/subm/' + this.options.id,
            enctype:'multipart/form-data',
            id:this.options.table + 'form' + this.options.id,
            method:'post',
            onsubmit:"return false;"});

        var table = new Element('table', {width:"100%", cellspacing:0, style:"margin:0px;padding:0px;"});
        var i = 0;
        this.options.columns.each(function (col) {
            if (i % 2 == 0) var tr = new Element('tr', {style:"background:#efefef;"});
            else var tr = new Element('tr');
            var tdTitle = new Element('td', {style:"border:1px #ccc solid;"}).update(col.name);

            switch (col.type) {
                case "textarea":
                    var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                        "<textarea name='" + col.name + "' style='width:100%;height:100%;' id='" + this.options.table + col.name + this.options.id + "'></textarea>");
                    break;
                case "text":
                    var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                        "<input name='" + col.name + "' type='text' style='width:100%;height:100%;' " +
                            "id='" + this.options.table + col.name + this.options.id + "' value=''/>");
                    break;
                case "file":
                    var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                        "<input name='" + col.name + "' type='file' style='width:100%;height:100%;' " +
                            "id='" + this.options.table + col.name + this.options.id + "' value=''/>");
                    break;
                default:
                    var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                        "<input name='" + col.name + "' type='text' style='width:100%;height:100%;' " +
                            "id='" + this.options.table + col.name + this.options.id + "' value=''/>");
                    break;
            }


            tr.insert(tdTitle).insert(tdCont);
            table.insert(tr);
        }.bind(this));
        var edit = new Element("input", {type:"submit", value:"save"});
        var td = new Element('td', {style:"border:1px #ccc solid;"}).update(edit);
        var tr = new Element('tr');
        tr.insert(td);
        table.insert(tr);
        i++;

        this.table = form.insert(table);
        this.setEditObserver(edit);
        return this.table;

    },

    getData:function () {
        try {
            var req = new Ajax.Request(this.options.table + '/edit/' + this.options.id, {
                onSuccess:function (responce) {

                    var form = new Element("form", {
                        action:this.options.table + '/subm/' + this.options.id,
                        id:this.options.table + 'form' + this.options.id,
                        method:'post',
                        enctype:'multipart/form-data',
                        onsubmit:"return false;"});
                    this.data = responce.responseJSON;
                    var table = new Element('table', {width:"100%", cellspacing:0, style:"margin:0px;padding:0px;"});
                    //var tr = new Element('tr');
                    console.log(this.data);


                    var i = 0;
                    var el = this.data;
                    this.options.columns.each(function (col) {
                        if (i % 2 == 0) var tr = new Element('tr', {style:"background:#efefef;"});
                        else var tr = new Element('tr');
                        var tdTitle = new Element('td', {style:"border:1px #ccc solid;"}).update(col.name);
                        /**Here goes input types switching*/
                        switch (col.type) {
                            case "textarea":
                                var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                                    "<textarea name='" + col.name + "' style='width:100%;height:100%;' id='" + this.options.table + col.name + this.options.id + "'>" + el[col.name] + "</textarea>");
                                break;
                            case "text":
                                var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                                    "<input name='" + col.name + "' type='text' style='width:100%;height:100%;' " +
                                        "id='" + this.options.table + col.name + this.options.id + "' value='" + el[col.name] + "'/>");
                                break;
                            case "file":
                                var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                                    "<input name='" + col.name + "' type='file' style='width:100%;height:100%;' " +
                                        "id='" + this.options.table + col.name + this.options.id + "' value='" + el[col.name] + "'/>" +
                                        "<div id='dropfile' style='border:1px #ccc solid;height:200px;' onmouseover='this.style.border=\"1px #000 solid\"'><span>or drop file here(experimental)</span></div>");
                                break;
                            default:
                                var tdCont = new Element('td', {style:"border:1px #ccc solid;"}).update(
                                    "<input name='" + col.name + "' type='text' style='width:100%;height:100%;' " +
                                        "id='" + this.options.table + col.name + this.options.id + "' value='" + el[col.name] + "'/>");
                                break;
                        }
                        tr.insert(tdTitle).insert(tdCont);
                        table.insert(tr);
                    }.bind(this));
                    var edit = new Element("input", {type:"submit", value:"save"});
                    var td = new Element('td', {style:"border:1px #ccc solid;", colspan:2}).update(edit);
                    var tr = new Element('tr');
                    tr.insert(td);
                    table.insert(tr);
                    i++;
                    //}.bind(this));
                    this.table = form.insert(table);
                    this.setEditObserver(edit);
                    return this.table;
                }.bind(this)
            });

        }
        catch (err) {
            alert("error in tableObj: getData" + console.log(err));
        }
    }

});

/**Loading box
 * This object was developed to visualize
 * data transfer and calculation processes.
 */
var loadingBox = Class.create({
    initialize:function (options) {
        try {
            this.createBox();
        }
        catch (err) {
            alert('loadingBox: initialize error:' + console.log(err));
        }
    },

    container:{},

    createBox:function () {
        try {
            var overlay = new Element("div", {
                id:"overlay",
                style:"position:absolute;" +
                    "z-index:9998;" +
                    "width:100%;" +
                    "height:100%;" +
                    "background:#000000;" +
                    "top:0px;" +
                    "left:0px"
            });
            /*var container = new Element("div",{
             id:		"loading",
             style:"position:absolute;" +
             "z-index:9999;" +
             "width:100px;" +
             "height:100px;" +
             "background:#77ccff;" +
             "top:"+(document.viewport.getHeight()/2) + "px;" +
             "left:"+(document.viewport.getWidth()/2 - 50) + "px"
             });*/
            var container = new Element("img", {
                src:"/templates/img/ui/loading.gif",
                id:"loading",
                style:"position:absolute;" +
                    "z-index:9999;" +
                    "top:" + (document.viewport.getHeight() / 2) + "px;" +
                    "left:" + (document.viewport.getWidth() / 2 - 25) + "px"
            });
            overlay.setOpacity(0.1);
            //container.setOpacity(0.85);
            overlay.insert(container);
            this.container = overlay;
            document.body.insert(overlay);
            new Effect.Opacity(this.container, {from:0.1, to:0.8, duration:0.5});
        }
        catch (err) {
            alert('loadingBox: createBox error:' + console.log(err));
        }
    },

    removeBox:function () {
        try {
            document.body.removeChild(this.container);
        }
        catch (err) {
            alert('loadingBox: removeBox error:' + console.log(err));
        }
    }

});

var cMenu = Class.create({

    initialize:function (options) {
        try {

            this.options = {
                element:'document',
                items:[]
            };
            Object.extend(this.options, options || { });


            this.options.element.observe("contextmenu", function (e) {
                e.preventDefault();
                return false;
            }.bind(this));

            this.options.element.observe("mousedown", function (e) {

                if (!Object.isUndefined($('context')) && $('context') != null)$('context').hide();//fade({duration:0.3});
                if (e.isRightClick() || e.button == 2) {
                    e.stop();
                    e.stopPropagation();
                    e.preventDefault();
                    e.returnValue = false;
                    this.showContext(e);
                    return false;
                }
            }.bind(this));
        }
        catch (err) {
            alert('loadingBox: initialize error:' + console.log(err));
        }
    },


    showContext:function (e) {
        if (!Object.isUndefined($('context')) && $('context') != null) {

            $('context').show();
            $('context').setStyle({
                top:e.pointerY() + 'px',
                left:e.pointerX() + 'px'
            });
        }
        else {
            var div = new Element("div", {
                id:"context",
                style:"background-color:#F9F9F9;" +
                    "width:250px;" +
                    "height:100px;" +
                    "top:" + e.pointerY() + "px;" +
                    "left:" + e.pointerX() + "px;" +
                    "position:absolute;" +
                    "z-index:999;" +
                    "-moz-border-radius:7px;" +
                    "-webkit-border-radius:7px;" +
                    "-khtml-border-radius:7px;" +
                    "padding-top:5px;"
            });
            var els = [];
            this.options.items.each(function (it) {
                var item = new Element("div",
                    {style:"font-size:15px;" +
                        "padding:3px 3px 3px 20px;" +
                        "height:15px;"});
                item.update(it.text);
                div.insert(item);
                els.push(item);
            }.bind(this));
            document.body.insert(div);
            div.setOpacity(0.9);
            //item.setOpacity(1);
            this.setItemsObserver(els);
        }
    },

    setItemsObserver:function (els) {
        els.each(function (el, index) {
            try {

                el.observe("mousedown", function (e) {
                    /**Calling item's click fuction*/
                    try {

                        this.options.items[index].func();
                    }
                    catch (err) {
                        console.log(err);
                    }
                    /**eof*/
                }.bind(this));

                el.observe("mouseover", function () {
                    el.setStyle("font-size:15px;" +
                        "padding:3px 3px 3px 20px;" +
                        "height:15px;" +
                        "background:#0E37E7;" +
                        "background:-moz-linear-gradient(top, #4A6AF5, #0E37E7);" +
                        "background:-webkit-gradient(linear, left top, left bottom, from(#4A6AF5), to(#0E37E7));");
                }.bind(this));
                el.observe("mouseout", function () {
                    el.style.background = "transparent";
                }.bind(this));
            }
            catch (err) {
                console.log(err);
            }
        }.bind(this));
    }

});


var messageCreate = Class.create({
    initialize:function (options) {
        this.options = {
            image:"",
            text:"",
            caption:""
        };
        Object.extend(this.options, options);
        this.run();
    },

    run:function () {
        this.overlay = this.showOverlay();
        this.messageBox = this.createMessageBox();
        this.overlay.insert(this.messageBox);

        document.body.insert(this.overlay);

        setTimeout(function () {
            if (this.overlay.getHeight() < document.body.getHeight())this.overlay.setStyle({'height':document.body.getHeight() + 'px'});
            this.messageBox.setStyle({'top':(this.overlay.getHeight() / 2 - 50) + "px"});

        }.bind(this), 200);
        new Effect.Opacity(this.messageBox, {from:0, to:1.0, duration:1.1});
        new Effect.Opacity(this.overlay, {from:0, to:0.9, duration:1.0});
        new Draggable(this.messageBox, {starteffect:false, endeffect:false});
        this.setObserver(this.button);
    },

    showOverlay:function () {
        var overlay = new Element("div", {
            id:"overlay",
            style:"position:absolute;" +
                "z-index:9999998;" +
                "width:" + document.body.getWidth() + "px;" +
                "height:100%;" +
                "background:#000000;" +
                "top:0px;" +
                "left:0px;" +
                "text-align:center;" +
                "opacity: 0;"
        });

        return overlay;

    },


    createMessageBox:function () {
        var messageBox = new Element("div", {id: "createMessageBox", className: "messageBoxContainer1"});
        var imgContainer = this.createImgContainer();
        var imgElement = this.createImgElement();
        var textContainer = new Element("div", {id: "createMessageBox", className: "textContainer1"});
        this.button = this.createButton();
        if (imgContainer != "" && imgElement != "")messageBox.insert(imgContainer.insert(imgElement));
        messageBox.insert(textContainer.insert(this.options.text)).insert(this.button);

        return messageBox;
    },

    createImgContainer:function () {
        return new Element("div", {style:"" +
            "float:left;" +
            "width:80px;" +
            "height:100px;" +
            "text-align:center;"
        });
    },

    createImgElement:function () {
        return new Element("img", {src:this.options.image});
    },

    createButton:function () {
        var buttonElement = new Element("button", {style:"" +
            "min-width:63px;height:24px;" +
            "text-align:center;" +
            "font-size:12px;" +
            "font-family: Arial, helvetica sans-serif;" +
            "font-weight: bold;" +
            "text-shadow: 1px 1px #eee;" +
            "color: #6a696d;" +
            "display: inline-block;" +
            "border: 1px solid #d6d6d6;" +
            "padding: 0px 5px;" +
            "cursor:pointer;" +
            "-moz-border-radius:8px;" +
            "-webkit-border-radius:8px;" +
            "-o-border-radius:8px;" +
            "-khtml-border-radius:8px;" +
            "border-radius:8px 8px 8px 8px;" +
            "background: #dcdcdc;" +
            "background:-moz-linear-gradient(top, #f1f1f1, #d3d3d3);" +
            "background:-webkit-gradient(linear, left top, left bottom, from(#f1f1f1), to(#d3d3d3));"
        });

        buttonElement.update(this.options.caption);
        if (Prototype.Browser.IE) {
            buttonElement.setStyle("" +
                "background:url(data/engine/templates/img/msg_but.png) repeat-x transparent;"
            );
        }
        return buttonElement;
    },

    hideMessage:function () {
        this.overlay.fade({
            afterFinish:function () {
                document.body.removeChild(this.overlay);
            }.bind(this)
        });
    },

    setObserver:function (element) {
        element.observe('mousedown', function (e) {
            this.button.setStyle(
                'border-color: #d6d6d6;' +
                    'outline: 0px;' +
                    'background: #dddddd;' +
                    'background: -moz-linear-gradient(top, #dadada, #e3e3e3);' +
                    'background: -webkit-gradient(linear, left top, left bottom, from(#dadada), to(#e3e3e3));'
            );
            if (Prototype.Browser.IE) {
                this.button.setStyle("" +
                    "background:url(data/engine/templates/img/msg_but_press.png) repeat-x transparent;"
                );
            }
        }.bind(this));
        element.observe("click", function (e) {
            this.hideMessage();
        }.bind(this));
    }
});


var mobileMessageCreate = Class.create({
    initialize:function (options) {
        this.options = {
            text:"",
            captionOk:"",
            captionCancel:"",
            okCallback:Prototype.emptyFunction,
            cancelCallback:Prototype.emptyFunction
        };
        Object.extend(this.options, options);
        this.run();
    },

    run:function () {
        this.overlay = this.showOverlay();
        this.messageBox = this.createMessageBox();
        this.overlay.insert(this.messageBox);

        document.body.insert(this.overlay);
        //new Effect.Opacity(this.messageBox,{from:0,to:1.0,duration:1.1});
        //new Effect.Opacity(this.overlay,{from:0,to:0.9,duration:1.0});
        new Draggable(this.messageBox, {starteffect:false, endeffect:false});
        this.setObserver(this.button, this.options.okCallback);
        this.setObserver(this.cancelButton, this.options.cancelCallback);
    },

    showOverlay:function () {
        var overlay = new Element("div", {
            id:"overlay",
            style:"position:absolute;" +
                "z-index:9999998;" +
                "width:" + document.body.getWidth() + "px;" +
                "height:" + document.body.getHeight() + "px;" +
                "background:transparent;" +
                "top:0px;" +
                "left:0px"
        });

        //overlay.setOpacity(0.3);
        return overlay;

    },

    createMessageBox:function () {
        var messageBox = new Element("div", {id: "createMessageBox", className: "messageBoxContainer2"});
        var textContainer = new Element("div", {id: "createMessageBox", className: "textContainer2"});
        var cleaner = new Element("div", {style: "height:1px;overflow:hidden;clear:both;"});
        this.cancelButton = this.createCancelButton(this.options.captionCancel);
        this.button = this.createButton(this.options.captionOk);

        messageBox.insert(textContainer.insert(this.options.text)).insert(cleaner).insert(this.button).insert(this.cancelButton);
        return messageBox;
    },

    createButton:function (capt) {
        var buttonElement = new Element("button", {className:"alert-button", style:""});
        buttonElement.update(capt);
        return buttonElement;
    },

    createCancelButton:function (capt) {
        var buttonElement = new Element("button", {className:"alert-cancel-button", style:""});
        buttonElement.update(capt);
        return buttonElement;

    },

    hideMessage:function () {
        this.overlay.fade({
                afterFinish:function () {
                document.body.removeChild(this.overlay);
            }.bind(this)
        });
    },

    setObserver:function (element, callback) {
        element.observe("click", function (e) {
            this.hideMessage();
            callback();
        }.bind(this));
    }
});

var askUserCreate = Class.create(messageCreate, {
    initialize:function (options) {
        this.options = {
            image:"",
            text:"",
            caption:""
        };
        Object.extend(this.options, options);
        this.run();
    },

    run:function () {
        this.options.text = this.options.text + '<br/><input type="text" id="askUserCreateInput" ' +
            'name="askUserCreateInput" ' +
            'style="width:100%;-webkit-user-select:text;"/>';
        this.overlay = this.showOverlay();
        this.messageBox = this.createMessageBox();
        this.overlay.insert(this.messageBox);

        document.body.insert(this.overlay);
        new Effect.Opacity(this.messageBox, {from:0, to:1.0, duration:1.1});
        new Effect.Opacity(this.overlay, {from:0, to:0.9, duration:1.0});
        new Draggable(this.messageBox, {starteffect:false, endeffect:false});
        this.setObserver(this.button);
    },

    createImgContainer:function () {
        return "";
    },

    createImgElement:function () {
        return "";
    }
});


var tapToPlayMessage = Class.create({
    initialize:function (options) {
        this.options = {
            text:"",
            okCallback:Prototype.emptyFunction
        };
        Object.extend(this.options, options);
        this.run();
    },

    run:function () {
        this.overlay = this.showOverlay();
        this.messageBox = this.createMessageBox();
        this.overlay.insert(this.messageBox);
        document.body.insert(this.overlay);
        new Draggable(this.messageBox, {starteffect:false, endeffect:false});
        this.setObserver(this.button, this.options.okCallback);

    },

    showOverlay:function () {
        var overlay = new Element("div", {
            id:"overlay",
            style:"position:absolute;" +
                "z-index:9999998;" +
                "width:" + document.body.getWidth() + "px;" +
                "height:" + document.body.getHeight() + "px;" +
                "background:transparent;" +
                "top:0px;" +
                "left:0px"
        });
        return overlay;

    },

    createMessageBox:function () {
        var messageBox = new Element("div", {id: "createMessageBox", className: "messageBoxContainer3", style:""});
        var textContainer = new Element("div", {id: "createMessageBox", className: "textContainer3"});
        var cleaner = new Element("div", {style:"height:1px;overflow:hidden;clear:both;"});
        this.button = this.createButton(this.options.captionOk);

        messageBox.insert(this.button).insert(textContainer.insert(this.options.text)).insert(cleaner);
        return messageBox;
    },

    createButton:function (capt) {
        var buttonElement = new Element("button", {className:"play-button", style:""});
        buttonElement.update(capt);
        return buttonElement;
    },


    hideMessage:function () {
        this.overlay.fade({
            afterFinish:function () {
                document.body.removeChild(this.overlay);
            }.bind(this)
        });
    },

    setObserver:function (element, callback) {
        element.observe("click", function (e) {
            this.hideMessage();
            callback();
        }.bind(this));
    }
});

var playButtonMessage = Class.create({
    initialize:function (options) {
        this.options = {
            text:"",
            okCallback:Prototype.emptyFunction
        };
        Object.extend(this.options, options);
        this.run();
    },

    run:function () {
        this.overlay = this.createOverlay();
        this.button = this.createButton();
        this.overlay.insert(this.button);
        $('contPane').insert(this.overlay);
        this.setObserver(this.button, this.options.okCallback);

    },

    createOverlay:function () {
        var overlay = new Element("div", {
            id:"overlay",
            style:"position:absolute;" +
                "z-index:9999998;" +
                "width:" + $('contPane').getWidth() + "px;" +
                "height:" + $('contPane').getHeight() + "px;" +
                "background-color:#171212;" +
                "opacity:0.85;" +
                "top:0px;" +
                "left:0px"
        });
        return overlay;

    },

    createButton:function () {
        var buttonElement = new Element("button", {    id:"messageBoxContainer",
            className:"media-play-button",
            style:""});
        return buttonElement;
    },

    hideMessage:function () {
        this.overlay.fade({
            afterFinish:function () {
                $('contPane').removeChild(this.overlay);
            }.bind(this)
        });
    },

    setObserver:function (element, callback) {
        element.observe("click", function (e) {
            this.hideMessage();
            callback();
        }.bind(this));
    }
});


var addHomeScreenInfo = Class.create({
    initialize:function (options) {
        this.options = {
            text:"",
            okCallback:Prototype.emptyFunction,

            startDelay: 2000,			// 2 seconds from page load before the balloon appears
            bottomOffset: 9,			// Distance of the balloon from bottom
            message: '',
            iterations: 100,			// Internal/debug use
            animationIn: 'bubble',      // drop || bubble || fade
            animationOut: 'drop',       // drop || bubble || fade
            lifespan:5000,           // 15 seconds before it is automatically destroyed
            expire:2                    // Minutes to wait before showing the popup again (0 = always displayed)
        };
        Object.extend(this.options, options);

        this.nav = window.navigator;
        this.isIDevice = 'platform' in this.nav && (/iphone|ipod|ipad/gi).test(this.nav.platform);
        this.isIPad;
        this.isRetina;
        this.isSafari;
        this.isStandalone;
        this.OSVersion;
        this.isAndroid;

        this.startX = 0;
        this.startY = 0;
        this.balloon;
        this.positionInterval;
        this.closeTimeout;

        this.intl = {
            //en_us: 'Install this Web App on your %device: tap %icon and then choose <strong>"Add to Home Screen". </strong>', //<a href="#">Learn more...</a>
           // en_us_android: 'Add a bookmark to home screen and<br> use this Web app offline.'
            //en_us: 'Place this bookmark on your %device\'s Home Screen: tap %icon and then choose <strong>"Add to Home Screen".</strong>',
            en_us: 'Install this Web App on your %device: tap %icon and then choose <strong>"Add to Home Screen".</strong>',
            en_us_android: 'Add a bookmark and place it as this<br>icon to home screen.'
        };

        this.init();
    },
    init:function () {
        this.isIPad = (/ipad/gi).test(this.nav.platform);
        this.isIPhone = (/iphone/gi).test(this.nav.platform);
        this.isRetina = window.devicePixelRatio && window.devicePixelRatio > 1;
        this.isSafari = (/Safari/i).test(this.nav.appVersion) && !(/CriOS/i).test(this.nav.appVersion);
        this.isStandalone = this.nav.standalone;
        this.OSVersion = this.nav.appVersion.match(/OS (\d+_\d+)/i);
        this.OSVersion = this.OSVersion && this.OSVersion[1] ? +this.OSVersion[1].replace('_', '.') : 0;
        this.isIBooks =  (/x-ibooks-th:/gi).test(window.location.protocol);
        this.isAndroid = /Android/.test(this.nav.userAgent);
        if ( !this.isIDevice || this.isIBooks ) return;

        this.loaded();
    },
    loaded:function () {

        if (!this.isSafari &&  !this.isAndroid && this.isStandalone ) return;

        var touchIcon = '',
            platform = this.nav.platform.split(' ')[0],
            language = this.nav.language.replace('-', '_');

        this.balloon = document.createElement('div');
        this.balloon.id = 'addToHomeScreen';

        this.balloon.style.cssText += 'left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:' + (this.OSVersion < 5 || this.isAndroid ? 'absolute' : 'fixed');

        this.options.message = this.intl['en_us'];

        touchIcon = this.isRetina ?
            document.querySelector('head link[rel^=apple-touch-icon][sizes="114x114"],head link[rel^=apple-touch-icon][sizes="144x144"],head link[rel^=apple-touch-icon]') :
            document.querySelector('head link[rel^=apple-touch-icon][sizes="57x57"],head link[rel^=apple-touch-icon]');

        if ( touchIcon ) {
            touchIcon = '<span style="background-image:url(' + touchIcon.href + ');margin-right: 16px;" class="addToHomeTouchIcon"></span>';
        }

        if(this.isAndroid) {

            this.options.message = this.intl['en_us_android'];

            this.balloon.className = 'addToHomeAndroid' + (touchIcon ? ' addToHomeWide' : '');
            this.balloon.innerHTML = touchIcon +
                '<div >' +
                this.options.message +
                '<span class="addToHomeArrow"></span>' +
                '<span class="addToHomeClose"></span>' +
                '</div>';

        } else {

            this.balloon.className = (this.isIPad ? 'addToHomeIpad' : 'addToHomeIphone') + (touchIcon ? ' addToHomeWide' : '');
            this.balloon.innerHTML = touchIcon +
                '<div>' +
                this.options.message.replace('%device', platform).replace('%icon', this.OSVersion >= 4.2 ? '<span class="addToHomeShare' + (this.OSVersion >= 7 ? ' addToHomeShareOS7' : '') + '"></span>' : '<span class="addToHomePlus">+</span>') +
                '<span class="addToHomeArrow"></span>' +
                '<span class="addToHomeClose"></span>' +
                '</div>';

        }

        document.body.appendChild(this.balloon);

        // Add the close action
        this.balloon.addEventListener('click', this.clicked.bind(this), false);

        if (this.OSVersion >= 6 ) window.addEventListener('orientationchange', this.orientationCheck.bind(this), false);

        setTimeout(this.show.bind(this), this.options.startDelay);
    },

    show:function(){

        var duration, iPadXShift = 276;

        // Set the initial position
        if ( this.isAndroid ) {

            try{
                /*  //- samsung S3
                 this.balloon.style.width = "965px";
                 this.balloon.style.padding = "20px 20px 20px 20px";
                 this.balloon.style.lineHeight = "150%";
                 this.balloon.style.letterSpacing  = "-1.5px";
                 this.balloon.style.webkitBorderRadius  = "18px";
                 this.balloon.style.fontSize  = "40px";

                 var sizeIcon = 220;
                 $$('.addToHomeTouchIcon')[0].setStyle("width: "+sizeIcon+"px; height: "+sizeIcon+"px;background-size: "+sizeIcon+"px "+sizeIcon+"px;margin-right: 30px;-webkit-border-radius: 12px; border-radius: 12px;");

                 this.options.bottomOffset = 41;

                 var sizeClose = 50;
                 $$('.addToHomeClose')[0].setStyle("width: "+sizeClose+"px; height: "+sizeClose+"px;background-size: "+sizeClose+"px "+sizeClose +"px; top:8px;right:8px");
                 */
                //- fro asus nexus 7
                this.balloon.style.width = "353px";
                var sizeClose = 13;
                $$('.addToHomeArrow')[0].setStyle("width: "+sizeClose+"px; height: "+sizeClose+"px;background-size: "+sizeClose+"px "+sizeClose +"px;top:-8px;");
                $$('#addToHomeScreen > div')[0].setStyle("padding-top: 16px;");

            }catch(e){}


            this.startY = window.innerHeight + window.scrollY;

            this.balloon.style.left = '';
            this.balloon.style.right = '10px';

            this.balloon.style.top = this.options.bottomOffset + 'px';

            switch (this.options.animationIn) {
                case 'drop':
                    duration = '1s';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + -(this.startY + this.options.bottomOffset) + 'px,0)';
                    break;
                case 'bubble':
                    duration = '0.6s';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + -300 + 'px,0)';
                    break;
                default:
                    duration = '1s';
                    this.balloon.style.opacity = '0';
            }

        } else if( this.isIPad ) {

            if ( this.OSVersion < 5 ) {
                this.startY = window.scrollY;
                this.startX = window.scrollX;
            } else if ( this.OSVersion < 6 ) {
                iPadXShift = 160;
            } else if(this.OSVersion < 7){
                iPadXShift = window.orientation%180 ? 276  : 320;
            }

            // this.balloon.style.width = "378px";

            this.balloon.style.top = this.startY + this.options.bottomOffset + 'px';
            this.balloon.style.left = this.startX + iPadXShift - Math.round(this.balloon.offsetWidth / 2) + 'px';

            switch ( this.options.animationIn ) {
                case 'drop':
                    duration = '0.6s';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + -(window.scrollY + this.options.bottomOffset + this.balloon.offsetHeight) + 'px,0)';
                    break;
                case 'bubble':
                    duration = '0.6s';
                    this.balloon.style.opacity = '0';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + (this.startY + 50) + 'px,0)';
                    break;
                default:
                    duration = '1s';
                    this.balloon.style.opacity = '0';
            }
        } else {

            try{
                this.balloon.style.width = "965px";
                this.balloon.style.padding = "38px 30px 38px 38px";
                this.balloon.style.lineHeight = "150%";
                this.balloon.style.letterSpacing  = "-1.5px";
                this.balloon.style.webkitBorderRadius  = "18px";
                this.balloon.style.fontSize  = "40px";

                $$('.addToHomeArrow')[0].setStyle("bottom: -27px;height: 60px; width: 60px;");

                var sizeIcon = 190;
                $$('.addToHomeTouchIcon')[0].setStyle("width: "+sizeIcon+"px; height: "+sizeIcon+"px;background-size: "+sizeIcon+"px "+sizeIcon+"px;margin-right: 30px;-webkit-border-radius: 30px; border-radius: 30px;");

                var sizeShare = 50;
                var sizeShareH = sizeShare;
                if(this.OSVersion >= 7){
                    sizeShareH = 80;
                    $$('#addToHomeScreen > div')[0].innerHTML = $$('#addToHomeScreen > div')[0].innerHTML.replace(": tap ", ': tap <span style="padding:0 17px">&#160;&#160;</span>');
                    $$('.addToHomeShare')[0].setStyle("position: absolute;top: 93px;left: 319px;");
                }
                $$('.addToHomeShare')[0].setStyle("width: "+sizeShare+"px; height: "+sizeShareH+"px;background-size: "+sizeShare+"px "+sizeShareH +"px;margin: 0px 8px;");
                this.options.bottomOffset = 37;

                var sizeClose = 51;
                $$('.addToHomeClose')[0].setStyle("width: "+sizeClose+"px; height: "+sizeClose+"px;background-size: "+sizeClose+"px "+sizeClose +"px; top:8px;right:8px");

            }catch(e){}
            //--

            this.startY = window.innerHeight + window.scrollY;

            if ( this.OSVersion < 5 ) {
                this.startX = Math.round((window.innerWidth - this.balloon.offsetWidth) / 2) + window.scrollX;
                this.balloon.style.left = this.startX + 'px';
                this.balloon.style.top = this.startY - this.balloon.offsetHeight - this.options.bottomOffset + 'px';
            } else {
                this.balloon.style.left = '50%';
                this.balloon.style.marginLeft = -Math.round(this.balloon.offsetWidth / 2) - ( window.orientation%180 && this.OSVersion >= 6 ? 40 : 0 ) + 'px';
                this.balloon.style.bottom = this.options.bottomOffset + 'px';
            }

            switch (this.options.animationIn) {
                case 'drop':
                    duration = '1s';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + -(this.startY + this.options.bottomOffset) + 'px,0)';
                    break;
                case 'bubble':
                    duration = '0.6s';
                    this.balloon.style.webkitTransform = 'translate3d(0,' + (this.balloon.offsetHeight + this.options.bottomOffset + 50) + 'px,0)';
                    break;
                default:
                    duration = '1s';
                    this.balloon.style.opacity = '0';
            }
        }

        this.balloon.offsetHeight;	// repaint trick
        this.balloon.style.webkitTransitionDuration = duration;
        this.balloon.style.opacity = '1';
        this.balloon.style.webkitTransform = 'translate3d(0,0,0)';
        this.balloon.addEventListener('webkitTransitionEnd', this.transitionEnd.bind(this), false);

        this.closeTimeout = setTimeout(this.close.bind(this), this.options.lifespan);
    },


    close: function (){
        clearInterval( this.positionInterval );
        clearTimeout( this.closeTimeout );
        this.closeTimeout = null;

        if ( !this.balloon ) return;

        var posY = 0,
            posX = 0,
            opacity = '1',
            duration = '0';

        this.balloon.removeEventListener('click', this.clicked.bind(this), false);
        if ( !this.isIPad && this.OSVersion >= 6 ) window.removeEventListener('orientationchange', this.orientationCheck.bind(this), false);

        if ( this.OSVersion < 5 && !this.isAndroid) {
            posY = this.isIPad ? window.scrollY - this.startY : window.scrollY + window.innerHeight - this.startY;
            posX = this.isIPad ? window.scrollX - this.startX : window.scrollX + Math.round((window.innerWidth - this.balloon.offsetWidth)/2) - this.startX;
        }

        this.balloon.style.webkitTransitionProperty = '-webkit-transform,opacity';

        switch ( this.options.animationOut ) {
            case 'drop':
                if ( this.isIPad || this.isAndroid) {
                    duration = '0.4s';
                    opacity = '0';
                    posY += 50;
                } else {
                    duration = '0.6s';
                    posY += this.balloon.offsetHeight + this.options.bottomOffset + 50;
                }
                break;
            case 'bubble':
                if ( this.isIPad ) {
                    duration = '0.8s';
                    posY -= this.balloon.offsetHeight + this.options.bottomOffset + 50;
                } else {
                    duration = '0.4s';
                    opacity = '0';
                    posY -= 50;
                }
                break;
            default:
                duration = '0.8s';
                opacity = '0';
        }

        this.balloon.addEventListener('webkitTransitionEnd', this.transitionEnd.bind(this), false);
        this.balloon.style.opacity = opacity;
        this.balloon.style.webkitTransitionDuration = duration;
        this.balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
    },

    clicked:function(){
        this.close();
    },

    transitionEnd:function(e){

        if(!this.balloon) return;
        this.balloon.removeEventListener('webkitTransitionEnd', this.transitionEnd.bind(this), false);

        this.balloon.style.webkitTransitionProperty = '-webkit-transform';
        this.balloon.style.webkitTransitionDuration = '0.2s';

        if ( !this.closeTimeout ) {
            this.balloon.parentNode.removeChild(this.balloon);
            this.balloon = null;
            return;
        }

        // On iOS 4 we start checking the element position
        if ( this.OSVersion < 5 && !this.isAndroid && this.closeTimeout  ){
            this.positionInterval = setInterval(this.setPosition.bind(this), this.options.iterations);
        }
    },

    setPosition:function(){
        var matrix = new WebKitCSSMatrix(window.getComputedStyle(this.balloon, null).webkitTransform),
            posY = this.isIPad ? window.scrollY - this.startY : window.scrollY + window.innerHeight - this.startY,
            posX = this.isIPad ? window.scrollX - this.startX : window.scrollX + Math.round((window.innerWidth - this.balloon.offsetWidth) / 2) - this.startX;

        // Screen didn't move
        if ( posY == matrix.m42 && posX == matrix.m41 ) return;

        this.balloon.style.webkitTransform = 'translate3d(' + posX + 'px,' + posY + 'px,0)';
    },

    orientationCheck:function(){
        if(this.isIPad){
            var iPadXShift = window.orientation%180 ? 276  : 320;
            this.balloon.style.left = this.startX + iPadXShift - Math.round(this.balloon.offsetWidth / 2) + 'px';
        } else {
            this.balloon.style.marginLeft = -Math.round(this.balloon.offsetWidth / 2) - ( window.orientation%180 && this.OSVersion >= 6 ? 40 : 0 ) + 'px';
        }
    }

});
