"use strict";
exports.__esModule = true;
exports.omitString = void 0;
var omitString = function (str, headerLen, tailLen) {
    if (headerLen === void 0) { headerLen = 6; }
    if (tailLen === void 0) { tailLen = 4; }
    var minLength = headerLen + tailLen;
    if (str.length <= minLength)
        return str;
    var startStr = str.substring(0, headerLen);
    var endStr = str.substring(str.length - tailLen, str.length);
    return "".concat(startStr, "...").concat(endStr);
};
exports.omitString = omitString;
