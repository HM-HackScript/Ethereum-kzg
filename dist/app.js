"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var axios_1 = __importDefault(require("axios"));
var ethers_1 = require("ethers");
var moment_1 = __importDefault(require("moment"));
var puppeteer_1 = __importDefault(require("puppeteer"));
var cookie_1 = __importDefault(require("cookie"));
var ini_1 = __importDefault(require("ini"));
var fs_1 = __importDefault(require("fs"));
var path_1 = __importDefault(require("path"));
var utils_1 = require("./utils/utils");
var _a = ini_1["default"].parse(fs_1["default"].readFileSync(path_1["default"].join(process.cwd(), 'config.ini'), 'utf-8')), privateKeys = _a.account_config.privateKeys, _b = _a.environment, proxy = _b.proxy, chrome_path = _b.chrome_path, debug_chrome = _b.debug_chrome, system = _b.system, complete_close = _b.complete_close, cmdProxys = _b.cmdProxys;
var getProxySetting = function (proxyStr) {
    if (!(/(\S+):\/\/(\S+):(\d+)/.test(proxyStr))) {
        return false;
    }
    var matchs = proxyStr.match(/(\S+):\/\/(\S+):(\d+)/);
    return {
        protocol: matchs === null || matchs === void 0 ? void 0 : matchs[1],
        host: matchs === null || matchs === void 0 ? void 0 : matchs[2],
        port: Number(matchs === null || matchs === void 0 ? void 0 : matchs[3])
    };
};
var getSignatureSiwe = function (privateKey, nonce) { return __awaiter(void 0, void 0, void 0, function () {
    var signer, address, nowTime, start, end, raw, signature;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                signer = new ethers_1.ethers.Wallet(privateKey);
                address = signer.address;
                nowTime = Date.now();
                start = (0, moment_1["default"])(nowTime).utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
                end = (0, moment_1["default"])(nowTime + 3600 * 24 * 1000).utc().format('YYYY-MM-DDTHH:mm:ss.SSS') + 'Z';
                raw = "oidc.signinwithethereum.org wants you to sign in with your Ethereum account:\n".concat(address, "\n\nYou are signing-in to seq.ceremony.ethereum.org.\n\nURI: https://oidc.signinwithethereum.org\nVersion: 1\nChain ID: 1\nNonce: ").concat(nonce, "\nIssued At: ").concat(start, "\nExpiration Time: ").concat(end, "\nResources:\n- https://seq.ceremony.ethereum.org/auth/callback/eth");
                return [4 /*yield*/, signer.signMessage(raw)];
            case 1:
                signature = _a.sent();
                return [2 /*return*/, {
                        address: address,
                        signature: signature,
                        siwe: {
                            "message": {
                                "domain": "oidc.signinwithethereum.org",
                                "address": address,
                                "statement": "You are signing-in to seq.ceremony.ethereum.org.",
                                "uri": "https://oidc.signinwithethereum.org",
                                "version": "1",
                                "nonce": nonce,
                                "issuedAt": start,
                                "expirationTime": end,
                                "chainId": 1,
                                "resources": ["https://seq.ceremony.ethereum.org/auth/callback/eth"]
                            },
                            "raw": "oidc.signinwithethereum.org wants you to sign in with your Ethereum account:\n".concat(address, "\n\nYou are signing-in to seq.ceremony.ethereum.org.\n\nURI: https://oidc.signinwithethereum.org\nVersion: 1\nChain ID: 1\nNonce: ").concat(nonce, "\nIssued At: ").concat(start, "\nExpiration Time: ").concat(end, "\nResources:\n- https://seq.ceremony.ethereum.org/auth/callback/eth"),
                            "signature": signature,
                            "ens": null
                        }
                    }];
        }
    });
}); };
var getSessionId = function (privateKey, cmdProxy, cmdProxyIndex) { return __awaiter(void 0, void 0, void 0, function () {
    var executablePath, browser, page, cookie, matches, nonce, session, _a, address, siwe;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                console.log('open browser ...');
                executablePath = chrome_path;
                console.log('browser route: ', executablePath);
                return [4 /*yield*/, puppeteer_1["default"].launch({
                        headless: !debug_chrome,
                        executablePath: executablePath,
                        args: ['--disable-gpu', '--disable-setuid-sandbox', '--no-sandbox', '--no-zygote']
                    })];
            case 1:
                browser = _b.sent();
                return [4 /*yield*/, browser.newPage()];
            case 2:
                page = _b.sent();
                return [4 /*yield*/, page.deleteCookie()];
            case 3:
                _b.sent();
                console.log('open ethereum sign website ...');
                return [4 /*yield*/, page.goto("https://oidc.signinwithethereum.org/authorize?response_type=code&client_id=5aeae9f0-56a3-41dd-beea-a6c456ad1c5f&state=eyJyZWRpcmVjdCI6bnVsbH0&redirect_uri=https%3A%2F%2Fseq.ceremony.ethereum.org%2Fauth%2Fcallback%2Feth&scope=openid")];
            case 4:
                _b.sent();
                return [4 /*yield*/, page.cookies()];
            case 5:
                cookie = _b.sent();
                matches = page.url().match(/nonce=(\S+)&domain/ig);
                nonce = matches === null || matches === void 0 ? void 0 : matches[0].slice(0, -7).split('=')[1];
                if (!nonce)
                    throw new Error("nonce undified");
                return [4 /*yield*/, page.close()];
            case 6:
                _b.sent();
                session = cookie[0].value;
                return [4 /*yield*/, getSignatureSiwe(privateKey[1], nonce)];
            case 7:
                _a = _b.sent(), address = _a.address, siwe = _a.siwe;
                console.log('wallet sign message ...');
                return [2 /*return*/, new Promise(function (resovle, reject) {
                        axios_1["default"].get("https://oidc.signinwithethereum.org/sign_in?redirect_uri=https://seq.ceremony.ethereum.org/auth/callback/eth&state=eyJyZWRpcmVjdCI6bnVsbH0&client_id=5aeae9f0-56a3-41dd-beea-a6c456ad1c5f", {
                            headers: {
                                cookie: "".concat(cookie_1["default"].serialize('session', session), "; ").concat(cookie_1["default"].serialize('siwe', JSON.stringify(siwe)))
                            },
                            proxy: getProxySetting(proxy)
                        }).then(function (res) {
                            if (res.status === 200) {
                                if (!res.data.session_id) {
                                    console.log(res);
                                }
                                else {
                                    console.log("<".concat(address, "> get session success => ").concat(res.data.session_id));
                                    if (system !== 'mac') {
                                        console.log('Only Windows: generate bat in cli ...');
                                        fs_1["default"].writeFileSync(path_1["default"].join(process.cwd(), "cli/\u3010".concat(privateKey[0], "#").concat(cmdProxyIndex + 1, "\u3011").concat((0, utils_1.omitString)(address), ".bat")), "@echo off\ntitle=[ID#".concat(privateKey[0], " IP#").concat(cmdProxyIndex + 1, "]- ").concat((0, utils_1.omitString)(address), " \nset http_proxy=").concat(cmdProxy, "\nset https_proxy=").concat(cmdProxy, "\ncurl ipinfo.io\nkzgcli-win.exe contribute --session-id ").concat(res.data.session_id, "\npause"), { flag: 'w' });
                                    }
                                    console.log('write record to session.txt success!');
                                    fs_1["default"].writeFileSync(path_1["default"].join(process.cwd(), 'session.txt'), "\u3010".concat((0, moment_1["default"])().format('YYYY-MM-DD HH:mm:ss'), "\u3011- ADSID: ").concat(privateKey[0], "  |  ").concat(address, "  |  ").concat(res.data.session_id, "\n"), { flag: 'a' });
                                }
                            }
                            resovle(res);
                        })["catch"](function (err) {
                            var _a, _b, _c;
                            console.error("<".concat(address, "> get session error"));
                            // 贡献已成功
                            if ((_b = (_a = err.response.data) === null || _a === void 0 ? void 0 : _a.code) === null || _b === void 0 ? void 0 : _b.includes('AuthErrorPayload')) {
                                console.log("<".concat(address, "> user already contributed"));
                                var successText = fs_1["default"].readFileSync(path_1["default"].join(process.cwd(), 'success.txt'), 'utf-8');
                                if (!successText.includes(address)) {
                                    fs_1["default"].writeFileSync(path_1["default"].join(process.cwd(), 'success.txt'), "\u3010".concat((0, moment_1["default"])().format('YYYY-MM-DD HH:mm:ss'), "\u3011- ADSID: ").concat(privateKey[0], "  |  ").concat(address, "  |  ").concat((0, utils_1.omitString)(privateKey[0], 8, 4), "\n"), { flag: 'a' });
                                }
                                console.log("Recorded by contributed account <".concat(address, ">"));
                                resovle({});
                            }
                            else {
                                (_c = err.response.data) !== null && _c !== void 0 ? _c : console.log(err.response.data);
                            }
                            // if (JSON.stringify(err).includes('AuthErrorPayload::UserCreatedAfterDeadline')) {
                            //     console.log({
                            //         status: 'ERR_BAD_REQUEST',
                            //         code: 'AuthErrorPayload::UserCreatedAfterDeadline',
                            //         error: 'user created after deadline'
                            //     })
                            // }
                            reject(err);
                        });
                    })];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var pks, index, privateKey, cmdProxyIndex, useProxy, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pks = privateKeys || [];
                console.log("=====  Total Wallet Count: ".concat(pks.length, "  ====="));
                pks = pks.map(function (item) { return item.split(',').map(function (i) { return i.trim(); }); });
                index = 0;
                _a.label = 1;
            case 1:
                if (!(index < pks.length)) return [3 /*break*/, 7];
                privateKey = pks[index];
                cmdProxyIndex = index % cmdProxys.length;
                useProxy = cmdProxys[cmdProxyIndex];
                console.log("---> start ".concat(index + 1, " of ").concat(pks.length, " <---"));
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, , 5]);
                return [4 /*yield*/, getSessionId(privateKey, useProxy, cmdProxyIndex)];
            case 3:
                _a.sent();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.log(error_1.message);
                return [3 /*break*/, 5];
            case 5:
                console.log("---> end ".concat(index + 1, " of ").concat(pks.length, " <---\n"));
                _a.label = 6;
            case 6:
                index++;
                return [3 /*break*/, 1];
            case 7:
                fs_1["default"].writeFileSync(path_1["default"].join(process.cwd(), 'session.txt'), "===============================================================\n", { flag: 'a' });
                if (complete_close) {
                    console.log("script execution completed\uFF0Cauto shutdown after 30s ...");
                    setTimeout(function () { process.exit(); }, 30000);
                }
                else {
                    console.log("script execution completed .");
                }
                return [2 /*return*/];
        }
    });
}); })();
