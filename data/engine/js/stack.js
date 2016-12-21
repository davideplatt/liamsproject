// Copyright (c) 2014 The Software MacKiev Company. All rights reserved.
// For details, see us at www.hyperstudio.com
var stackObj = Class.create({
    initialize:function (options) {
        try {
            this.pointer = -1;
            this.lastSeenCardPointer = 0;
            this.markedCardIndex = null;
            this.options = {
                comments:''
            };
            Object.extend(this.options, options || { });
            this.els = Array();
        }
        catch (err) {
            alert('Error in stack.js (stackObj.initialize):' + err);
        }
    },

    shuffleIndex:[],

    push:function (item) {
        try {
            this.els.push(item);
            ++this.pointer;
        }
        catch (err) {
            alert('Error in stack.js (stackObj.push):' + err);
        }
    },

    pop:function () {
        try {
            if ((this.pointer + 1) == this.els.length) this.pointer -= 1;
            this.els.pop();
        }
        catch (err) {
            alert('Error in stack.js (stackObj.pop):' + err);
        }
    },

    unset:function () {
        try {
            delete this.els[this.pointer];
            this.setPointer(this.lastSeenCardPointer);
        }
        catch (err) {
            alert('Error in stack.js (stackObj.setPointer):' + console.log(err));
        }
    },

    unsetById:function (id) {
        try {
            if (this.getPointer() == id) {
                this.setPointer(this.lastSeenCardPointer);
            }
            delete this.els[id];

        }
        catch (err) {
            alert('Error in stack.js (stackObj.setPointer):' + console.log(err));
        }
    },

    setPointer:function (intVar) {
        try {
            this.lastSeenCardPointer = this.pointer;
            this.pointer = parseInt(intVar);
        }
        catch (err) {
            alert('Error in stack.js (stackObj.setPointer):' + err);
        }
    },

    getPointer:function () {
        try {
            return this.pointer;
        }
        catch (err) {
            alert('Error in stack.js (stackObj.getPointer):' + err);
        }
    },

    currentElement:function () {
        try {
            return this.els[this.pointer];
        }
        catch (err) {
            alert('Error in stack.js (stackObj.currentElement):' + err);
        }
    },

    lastSeenElement:function () {
        try {
            //this.lastSeenCardPointer = this.pointer;
            return this.els[this.lastSeenCardPointer];
        }
        catch (err) {
            alert('Error in stack.js (stackObj.currentElement):' + err);
        }
    },

    nextElement:function () {
        try {
            this.lastSeenCardPointer = this.pointer;
            this.pointer = this.findNeighbors(this.pointer).nextElement;
            return this.els[this.pointer];
        }
        catch (err) {
            alert('Error in stack.js (stackObj.currentElement):' + err);
        }
    },

    prevElement:function () {
        try {
            this.lastSeenCardPointer = this.pointer;
            this.pointer = this.findNeighbors(this.pointer).prevElement;
            return this.els[this.pointer];
        }
        catch (err) {
            alert('Error in stack.js (stackObj.currentElement):' + err);
        }
    },

    shuffleElements:function () {
        var tempElements = this.els;
        var newElements = Array();
        var currentId = this.currentElement().id;

        this.els.each(function () {
            var rand = Math.random(0, tempElements.length - 1);
            var Length = newElements.length;
            if (tempElements[rand].id == currentId) currentNewId = Length;
            tempElements[rand].id = Length;
            newElements.push(tempElements[rand]);
            delete tempElements[rand];
        }.bind(this));

        this.els = newElements;
        this.setPointer(currentNewId);
    },

    shuffleElementsInRange:function (from, to) {
        var currentId = this.currentElement().id;
        var newId = currentId;
        var suffixElements = this.els.splice(to + 1, this.els.length - 1);
        var prefixElements = this.els.splice(0, from).reverse();
        var shuffledElements = Array();
        while (this.els.length) {
            var rand = Math.random() * this.els.length >> 0;
            var el = this.els.splice(rand, 1)[0];
            if (currentId == el.id) {
                newId = shuffledElements.length + prefixElements.length;
            }
            shuffledElements.push(el);
        }
        prefixElements.each(function (el) {
            shuffledElements.unshift(el);
        });
        suffixElements.each(function (el) {
            shuffledElements.push(el);
        });
        this.els = shuffledElements;
        this.setPointer(newId);
    },

    generateShuffleIndex:function (from, to) {
        this.shuffleIndex = [];
        for (var i = 0; i < from; i++) {
            this.shuffleIndex.push(i);
        }
        var notShuffled = [];
        for (var i = from; i < to; i++) {
            notShuffled.push(i);
        }
        while (notShuffled.length) {
            var rand = Math.random() * notShuffled.length >> 0;
            var el = notShuffled.splice(rand, 1)[0];
            this.shuffleIndex.push(el);
        }
        for (var i = to; i < this.els.length; i++) {
            this.shuffleIndex.push(i);
        }
        //console.log('shuffleIndex generated: ', this.els.length, this.shuffleIndex);
        //console.log('neibohors for cur card', this.pointer, this.findNeighbors(this.pointer));
    },

    findNeighbors:function (id) {
        var ans = {nextElement:id, prevElement:id};
        if (this.shuffleIndex.length) {
            var index = this.shuffleIndex.indexOf(id);
            if (index !== -1) {
                ans.nextElement = (!Object.isUndefined(this.shuffleIndex[index + 1])) ? this.shuffleIndex[index + 1] : this.shuffleIndex[0];
                ans.prevElement = (!Object.isUndefined(this.shuffleIndex[index - 1])) ? this.shuffleIndex[index - 1] : this.shuffleIndex[this.shuffleIndex.length - 1];
            }
        } else {
            // not shuffled stack
            var index = this.pointer;
            ans.nextElement = (!Object.isUndefined(this.els[index + 1])) ? index + 1 : 0;
            ans.prevElement = (!Object.isUndefined(this.els[index - 1])) ? index - 1 : this.els.length - 1;
        }
        return ans;
    },

    elements:function () {
        try {
            return this.els;
        }
        catch (err) {
            alert('Error in stack.js (stackObj.elements):' + err);
        }
    },

    setMarkedCardIndex:function () {
        this.markedCardIndex = this.getPointer();
    },

    getMarkedCardIndex:function () {
        return this.markedCardIndex;
    }

});

