(function ($) {

    /**
     * Travels down the DOM tree of the designated element and returns an array of text nodes.
     * @param el {Object} a DOM element.
     * @return {Array.<Object>}.
     */
    function getTextNodes(el) {
        var textNodes = [];
        function traverse(node) {
            var children, i;
            if (node.nodeType === 3 && !/^\s*$/.test(node.nodeValue)) {//text node non empty
                textNodes.push(node);
            } else {
                children = node.childNodes;
                for (i = 0; i < children.length; i++) {
                    traverse(children[i]);
                }
            }
        }
        traverse(el);
        return textNodes;
    }

    /**
     * Progressively types the given string in the specified node.
     * @param node {Object} a DOM TextNode.
     * @param str {string} the string to type.
     * @param delay {number} time delay between character typings.
     * @param i {number} position of character currently typing.
     * @param callback {function=} (optional).
     */
    function type(node, str, delay, i, callback) {
        if (i < str.length) {
            node.nodeValue = str.substr(0, ++i);
            setTimeout(function () {
                type(node, str, delay, i, callback);
            }, delay);
        } else if (typeof callback === "function") {
            callback.call(node);
        }
    }

    /**
     * Blinks the cursor at the end of a string.
     * @param node {Object} a DOM text node containing the cursor.
     * @param delay {number} time delay between cursor blinks.
     * @return {number} the id of the blinking interval.
     */
    function blink(node, delay) {
        var hidden = true,
            cursor = node.nodeValue;
        if (cursor === "") {
            return -1;
        } else {
            return setInterval(function () {
                node.nodeValue = hidden ? "" : cursor;
                hidden = !hidden;
            }, delay);   
        }
    }

    /**
     * Performs a jQuery text animation effect that imitates typewriter machines.
     * @param settings {Object=}.
     * @param callback {function=}.
     */
    $.fn.typewrite = function (settings, callback) {
        var textNodes = [],
            values = [],
            i, node;
        //make sure settings are specified
        settings = $.extend({
            speed: 60,
            blink: 200,
            cursor: "_"
        }, settings);
        //retrieve all text nodes
        this.each(function () {
            textNodes = textNodes.concat(getTextNodes(this));
        });
        //empty the text nodes, store value in hidden property
        for (i = 0; i < textNodes.length; i++) {
            node = textNodes[i];
            values.push(node.nodeValue);
            node.nodeValue = "";
        }
        //create function to traverse the text nodes
        function traverse(textNodes, i) {
            var node, value, cursor, blinking;
            i = i || 0;
            if (i < textNodes.length) {
                node = textNodes[i];
                value = values[i];
                cursor = document.createTextNode(settings.cursor);
                $(node).after(cursor);
                blinking = blink(cursor, settings.blink);
                type(node, value, settings.speed, 0, function () {
                    clearInterval(blinking);
                    $(cursor).remove();
                    //delete node._data;//delete extra data
                    traverse(textNodes, i + 1);
                });
            } else if (typeof callback === "function") {
                callback.call(null);
            }
        }
        //traverse the text nodes
        traverse(textNodes);
    };
}(jQuery));
