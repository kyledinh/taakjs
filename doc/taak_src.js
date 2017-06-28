// TAAK.JS
(function () {
    "use strict";

    // EXPORT

    if (typeof exports === 'undefined') {
        this.taak = taak;
    } else {
        taak.extend(exports, taak);
    }

}).call(this);
