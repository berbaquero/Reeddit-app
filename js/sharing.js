var sharing = (function() {

    var scriptString = 'tell application "Safari" to add reading list item "{{URL}}"',
        applescript,
        clipboard;

    var getAppleScript = function() {
        if (!applescript) {
            applescript = require('applescript');
        }
        return applescript;
    };

    var getClipboard = function() {
        if (!clipboard) {
            var gui = require('nw.gui');
            clipboard = gui.Clipboard.get();
        }
        return clipboard;
    };

    var addToReadingList = function(url, next) {
        var script = scriptString.replace('{{URL}}', url);
        getAppleScript().execString(script, function(err, succ) {
            if (next) next();
        });
    };

    var copyToClipboard = function(url) {
        getClipboard().set(url, 'text');
    };

    return {
        readingList: addToReadingList,
        clipboard: copyToClipboard
    };

})();