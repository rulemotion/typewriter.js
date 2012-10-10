/**
 * A jquery text animation effect that imitates typewriter machines.
 */
(function ($) {

    $.fn.typewrite = function (settings, callback) {

        settings = $.extend({
            speed: 60,
            blink: 200,
            cursor: "_"
        }, settings);

        /**
         * Performs a deep scan and returns an array of text nodes found under the designated element.
         * @param el {Object} a DOM element.
         * @return {Array.<Object>}.
         */
        function getTextNodes(el) {
            var textNodes = [];
            function traverse(node) {
                var children, i;
                if (node.nodeType === 3 && !/^\s*$/.test(node.nodeValue)) {
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
         * Blinks the cursor at the end of the string.
         * @param node {Object} the cursor node.
         * @return {number} the id of the blinking interval.
         */
        function blink(node) {
            var hidden = true;
            return setInterval(function() {
                node.nodeValue = hidden ? " " : settings.cursor;
                hidden = !hidden;
                console.log(hidden, node.nodeValue);
            }, settings.blink);
        }

        /**
         * Typewrites the given string in the specified text node.
         * @param node {Object} a DOM TextNode.
         * @param str {string} the string to type.
         * @param i {number=} position of character currently typing (optional).
         * @param callback {function=} (optional).
         */
        function type(node, str, i, callback) {
            i = i || 0;
            if (i < str.length) {
                node.nodeValue = str.substr(0, ++i);
                setTimeout(function () {
                    type(node, str, i, callback);
                }, settings.speed);
            } else if (typeof callback === "function") {
                callback.call(node);
            }
        }

        this.each(function () {
            var textNodes, i, node;
            textNodes = getTextNodes(this);
            for (i = 0; i < textNodes.length; i++) {
                node = textNodes[i];
                node._data = node.nodeValue;
                node.nodeValue = "";
            }
            function traverse(textNodes, i) {
                var node, blinking;
                i = i || 0;
                if (i < textNodes.length) {
                    node = textNodes[i];
                    cursor = document.createTextNode(settings.cursor);
                    $(node).after(cursor);
                    blinking = blink(cursor);
                    console.log(i, blinking, node, cursor);
                    type(node, node._data, 0, function () {
                        clearInterval(blinking);
                        cursor.nodeValue = " ";
                        delete node._data;//delete extra data
                        traverse(textNodes, i + 1);
                    });
                }
            }
            traverse(textNodes);
        });

    };
}(jQuery));
