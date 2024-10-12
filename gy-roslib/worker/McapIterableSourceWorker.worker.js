var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var __accessCheck = (obj, member, msg) => {
  if (!member.has(obj))
    throw TypeError("Cannot " + msg);
};
var __privateGet = (obj, member, getter) => {
  __accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};
var __privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};
var __privateSet = (obj, member, value, setter) => {
  __accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};
var __privateMethod = (obj, member, method2) => {
  __accessCheck(obj, member, "access private method");
  return method2;
};
var require_McapIterableSourceWorker_worker = __commonJS({
  "worker/McapIterableSourceWorker.worker.js"(exports, module) {
    var _iter, _lastIteratorResult, _abort, _view, _relevantChannels, _startTime, _endTime, _reverse, _messageIndexCursors, _getSortTime, getSortTime_fn, _readable, _decompressHandlers, _messageStartTime, _messageEndTime, _attachmentStartTime, _attachmentEndTime, _errorWithLibrary, errorWithLibrary_fn, _loadChunkData, loadChunkData_fn, _buffer, _buffer2, _decompressHandlers2, _includeChunks, _validateCrcs, _noMagicPrefix, _doneReading, _generator, _channelsById, _read, read_fn, _reader, _channelInfoById, _start, _end, _messageSizeEstimateByHash, _estimateMessageSize, estimateMessageSize_fn, _options, _msgEventsByChannel, _start2, _end2, _source, _sourceImpl;
    /**
     * @license
     * Copyright 2019 Google LLC
     * SPDX-License-Identifier: Apache-2.0
     */
    const proxyMarker = Symbol("Comlink.proxy");
    const createEndpoint = Symbol("Comlink.endpoint");
    const releaseProxy = Symbol("Comlink.releaseProxy");
    const finalizer = Symbol("Comlink.finalizer");
    const throwMarker = Symbol("Comlink.thrown");
    const isObject$1 = (val) => typeof val === "object" && val !== null || typeof val === "function";
    const proxyTransferHandler = {
      canHandle: (val) => isObject$1(val) && val[proxyMarker],
      serialize(obj) {
        const { port1, port2 } = new MessageChannel();
        expose(obj, port1);
        return [port2, [port2]];
      },
      deserialize(port) {
        port.start();
        return wrap(port);
      }
    };
    const throwTransferHandler = {
      canHandle: (value) => isObject$1(value) && throwMarker in value,
      serialize({ value }) {
        let serialized;
        if (value instanceof Error) {
          serialized = {
            isError: true,
            value: {
              message: value.message,
              name: value.name,
              stack: value.stack
            }
          };
        } else {
          serialized = { isError: false, value };
        }
        return [serialized, []];
      },
      deserialize(serialized) {
        if (serialized.isError) {
          throw Object.assign(new Error(serialized.value.message), serialized.value);
        }
        throw serialized.value;
      }
    };
    const transferHandlers = /* @__PURE__ */ new Map([
      ["proxy", proxyTransferHandler],
      ["throw", throwTransferHandler]
    ]);
    function isAllowedOrigin(allowedOrigins, origin) {
      for (const allowedOrigin of allowedOrigins) {
        if (origin === allowedOrigin || allowedOrigin === "*") {
          return true;
        }
        if (allowedOrigin instanceof RegExp && allowedOrigin.test(origin)) {
          return true;
        }
      }
      return false;
    }
    function expose(obj, ep = globalThis, allowedOrigins = ["*"]) {
      ep.addEventListener("message", function callback(ev) {
        if (!ev || !ev.data) {
          return;
        }
        if (!isAllowedOrigin(allowedOrigins, ev.origin)) {
          console.warn(`Invalid origin '${ev.origin}' for comlink proxy`);
          return;
        }
        const { id, type: type2, path: path2 } = Object.assign({ path: [] }, ev.data);
        const argumentList = (ev.data.argumentList || []).map(fromWireValue);
        let returnValue;
        try {
          const parent = path2.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
          const rawValue = path2.reduce((obj2, prop) => obj2[prop], obj);
          switch (type2) {
            case "GET":
              {
                returnValue = rawValue;
              }
              break;
            case "SET":
              {
                parent[path2.slice(-1)[0]] = fromWireValue(ev.data.value);
                returnValue = true;
              }
              break;
            case "APPLY":
              {
                returnValue = rawValue.apply(parent, argumentList);
              }
              break;
            case "CONSTRUCT":
              {
                const value = new rawValue(...argumentList);
                returnValue = proxy(value);
              }
              break;
            case "ENDPOINT":
              {
                const { port1, port2 } = new MessageChannel();
                expose(obj, port2);
                returnValue = transfer(port1, [port1]);
              }
              break;
            case "RELEASE":
              {
                returnValue = void 0;
              }
              break;
            default:
              return;
          }
        } catch (value) {
          returnValue = { value, [throwMarker]: 0 };
        }
        Promise.resolve(returnValue).catch((value) => {
          return { value, [throwMarker]: 0 };
        }).then((returnValue2) => {
          const [wireValue, transferables] = toWireValue(returnValue2);
          ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
          if (type2 === "RELEASE") {
            ep.removeEventListener("message", callback);
            closeEndPoint(ep);
            if (finalizer in obj && typeof obj[finalizer] === "function") {
              obj[finalizer]();
            }
          }
        }).catch((error) => {
          const [wireValue, transferables] = toWireValue({
            value: new TypeError("Unserializable return value"),
            [throwMarker]: 0
          });
          ep.postMessage(Object.assign(Object.assign({}, wireValue), { id }), transferables);
        });
      });
      if (ep.start) {
        ep.start();
      }
    }
    function isMessagePort(endpoint) {
      return endpoint.constructor.name === "MessagePort";
    }
    function closeEndPoint(endpoint) {
      if (isMessagePort(endpoint))
        endpoint.close();
    }
    function wrap(ep, target) {
      return createProxy(ep, [], target);
    }
    function throwIfProxyReleased(isReleased) {
      if (isReleased) {
        throw new Error("Proxy has been released and is not useable");
      }
    }
    function releaseEndpoint(ep) {
      return requestResponseMessage(ep, {
        type: "RELEASE"
      }).then(() => {
        closeEndPoint(ep);
      });
    }
    const proxyCounter = /* @__PURE__ */ new WeakMap();
    const proxyFinalizers = "FinalizationRegistry" in globalThis && new FinalizationRegistry((ep) => {
      const newCount = (proxyCounter.get(ep) || 0) - 1;
      proxyCounter.set(ep, newCount);
      if (newCount === 0) {
        releaseEndpoint(ep);
      }
    });
    function registerProxy(proxy2, ep) {
      const newCount = (proxyCounter.get(ep) || 0) + 1;
      proxyCounter.set(ep, newCount);
      if (proxyFinalizers) {
        proxyFinalizers.register(proxy2, ep, proxy2);
      }
    }
    function unregisterProxy(proxy2) {
      if (proxyFinalizers) {
        proxyFinalizers.unregister(proxy2);
      }
    }
    function createProxy(ep, path2 = [], target = function() {
    }) {
      let isProxyReleased = false;
      const proxy2 = new Proxy(target, {
        get(_target, prop) {
          throwIfProxyReleased(isProxyReleased);
          if (prop === releaseProxy) {
            return () => {
              unregisterProxy(proxy2);
              releaseEndpoint(ep);
              isProxyReleased = true;
            };
          }
          if (prop === "then") {
            if (path2.length === 0) {
              return { then: () => proxy2 };
            }
            const r = requestResponseMessage(ep, {
              type: "GET",
              path: path2.map((p) => p.toString())
            }).then(fromWireValue);
            return r.then.bind(r);
          }
          return createProxy(ep, [...path2, prop]);
        },
        set(_target, prop, rawValue) {
          throwIfProxyReleased(isProxyReleased);
          const [value, transferables] = toWireValue(rawValue);
          return requestResponseMessage(ep, {
            type: "SET",
            path: [...path2, prop].map((p) => p.toString()),
            value
          }, transferables).then(fromWireValue);
        },
        apply(_target, _thisArg, rawArgumentList) {
          throwIfProxyReleased(isProxyReleased);
          const last = path2[path2.length - 1];
          if (last === createEndpoint) {
            return requestResponseMessage(ep, {
              type: "ENDPOINT"
            }).then(fromWireValue);
          }
          if (last === "bind") {
            return createProxy(ep, path2.slice(0, -1));
          }
          const [argumentList, transferables] = processArguments(rawArgumentList);
          return requestResponseMessage(ep, {
            type: "APPLY",
            path: path2.map((p) => p.toString()),
            argumentList
          }, transferables).then(fromWireValue);
        },
        construct(_target, rawArgumentList) {
          throwIfProxyReleased(isProxyReleased);
          const [argumentList, transferables] = processArguments(rawArgumentList);
          return requestResponseMessage(ep, {
            type: "CONSTRUCT",
            path: path2.map((p) => p.toString()),
            argumentList
          }, transferables).then(fromWireValue);
        }
      });
      registerProxy(proxy2, ep);
      return proxy2;
    }
    function myFlat(arr) {
      return Array.prototype.concat.apply([], arr);
    }
    function processArguments(argumentList) {
      const processed = argumentList.map(toWireValue);
      return [processed.map((v) => v[0]), myFlat(processed.map((v) => v[1]))];
    }
    const transferCache = /* @__PURE__ */ new WeakMap();
    function transfer(obj, transfers) {
      transferCache.set(obj, transfers);
      return obj;
    }
    function proxy(obj) {
      return Object.assign(obj, { [proxyMarker]: true });
    }
    function toWireValue(value) {
      for (const [name, handler] of transferHandlers) {
        if (handler.canHandle(value)) {
          const [serializedValue, transferables] = handler.serialize(value);
          return [
            {
              type: "HANDLER",
              name,
              value: serializedValue
            },
            transferables
          ];
        }
      }
      return [
        {
          type: "RAW",
          value
        },
        transferCache.get(value) || []
      ];
    }
    function fromWireValue(value) {
      switch (value.type) {
        case "HANDLER":
          return transferHandlers.get(value.name).deserialize(value.value);
        case "RAW":
          return value.value;
      }
    }
    function requestResponseMessage(ep, msg, transfers) {
      return new Promise((resolve) => {
        const id = generateUUID();
        ep.addEventListener("message", function l(ev) {
          if (!ev.data || !ev.data.id || ev.data.id !== id) {
            return;
          }
          ep.removeEventListener("message", l);
          resolve(ev.data);
        });
        if (ep.start) {
          ep.start();
        }
        ep.postMessage(Object.assign({ id }, msg), transfers);
      });
    }
    function generateUUID() {
      return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
    }
    const isAbortSignal = (val) => val instanceof AbortSignal;
    const abortSignalTransferHandler = {
      canHandle: isAbortSignal,
      deserialize: ([aborted, msgPort]) => {
        const controller = new AbortController();
        if (aborted) {
          controller.abort();
        } else {
          msgPort.onmessage = () => {
            controller.abort();
          };
        }
        return controller.signal;
      },
      serialize: (abortSignal) => {
        const { port1, port2 } = new MessageChannel();
        abortSignal.addEventListener("abort", () => {
          port1.postMessage("aborted");
        });
        return [[abortSignal.aborted, port2], [port2]];
      }
    };
    var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
    function getDefaultExportFromCjs(x) {
      return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, "default") ? x["default"] : x;
    }
    var dist$7 = {};
    var Time = {};
    Object.defineProperty(Time, "__esModule", { value: true });
    var timeUtils = {};
    Object.defineProperty(timeUtils, "__esModule", { value: true });
    timeUtils.areEqual = timeUtils.isGreaterThan = timeUtils.isLessThan = timeUtils.compare = timeUtils.isTimeInRangeInclusive = timeUtils.clampTime = timeUtils.fromMicros = timeUtils.fromMillis = timeUtils.toMillis = timeUtils.fromNanoSec = timeUtils.fromSec = timeUtils.toSec = timeUtils.toMicroSec = timeUtils.toNanoSec = timeUtils.subtract = timeUtils.add = timeUtils.fixTime = timeUtils.interpolate = timeUtils.percentOf = timeUtils.fromDate = timeUtils.toDate = timeUtils.fromRFC3339String = timeUtils.toRFC3339String = timeUtils.fromString = timeUtils.toString = timeUtils.isTime = void 0;
    function isTime(obj) {
      return typeof obj === "object" && !!obj && "sec" in obj && "nsec" in obj && Object.getOwnPropertyNames(obj).length === 2;
    }
    timeUtils.isTime = isTime;
    function toString(stamp, allowNegative = false) {
      if (!allowNegative && (stamp.sec < 0 || stamp.nsec < 0)) {
        throw new Error(`Invalid negative time { sec: ${stamp.sec}, nsec: ${stamp.nsec} }`);
      }
      const sec = Math.floor(stamp.sec);
      const nsec = Math.floor(stamp.nsec);
      return `${sec}.${nsec.toFixed().padStart(9, "0")}`;
    }
    timeUtils.toString = toString;
    function parseNanoseconds(digits) {
      const digitsShort = 9 - digits.length;
      return Math.round(parseInt(digits, 10) * 10 ** digitsShort);
    }
    function fromString(stamp) {
      if (/^\d+\.?$/.test(stamp)) {
        const sec2 = parseInt(stamp, 10);
        return { sec: isNaN(sec2) ? 0 : sec2, nsec: 0 };
      }
      if (!/^\d+\.\d+$/.test(stamp)) {
        return void 0;
      }
      const partials = stamp.split(".");
      if (partials.length === 0) {
        return void 0;
      }
      const [first, second] = partials;
      if (first == void 0 || second == void 0) {
        return void 0;
      }
      const sec = parseInt(first, 10);
      const nsec = parseNanoseconds(second);
      return fixTime({ sec: isNaN(sec) ? 0 : sec, nsec });
    }
    timeUtils.fromString = fromString;
    function toRFC3339String(stamp) {
      if (stamp.sec < 0 || stamp.nsec < 0) {
        throw new Error(`Invalid negative time { sec: ${stamp.sec}, nsec: ${stamp.nsec} }`);
      }
      if (stamp.nsec >= 1e9) {
        throw new Error(`Invalid nanosecond value ${stamp.nsec}`);
      }
      const date = new Date(stamp.sec * 1e3);
      const year = date.getUTCFullYear();
      const month = (date.getUTCMonth() + 1).toFixed().padStart(2, "0");
      const day = date.getUTCDate().toFixed().padStart(2, "0");
      const hour = date.getUTCHours().toFixed().padStart(2, "0");
      const minute = date.getUTCMinutes().toFixed().padStart(2, "0");
      const second = date.getUTCSeconds().toFixed().padStart(2, "0");
      const nanosecond = stamp.nsec.toFixed().padStart(9, "0");
      return `${year}-${month}-${day}T${hour}:${minute}:${second}.${nanosecond}Z`;
    }
    timeUtils.toRFC3339String = toRFC3339String;
    function fromRFC3339String(stamp) {
      const match = /^(\d{4,})-(\d\d)-(\d\d)[Tt](\d\d):(\d\d):(\d\d)(?:\.(\d+))?(?:[Zz]|([+-])(\d\d):(\d\d))$/.exec(stamp);
      if (match == null) {
        return void 0;
      }
      const [, year, month, day, hour, minute, second, frac, plusMinus, offHours, offMinutes] = match;
      const offSign = plusMinus === "-" ? -1 : 1;
      const utcMillis = Date.UTC(+year, +month - 1, +day, +hour - offSign * +(offHours ?? 0), +minute - offSign * +(offMinutes ?? 0), +second);
      if (utcMillis % 1e3 !== 0) {
        return void 0;
      }
      return fixTime({
        sec: utcMillis / 1e3,
        nsec: frac != void 0 ? parseNanoseconds(frac) : 0
      });
    }
    timeUtils.fromRFC3339String = fromRFC3339String;
    function toDate(stamp) {
      const { sec, nsec } = stamp;
      return new Date(sec * 1e3 + nsec / 1e6);
    }
    timeUtils.toDate = toDate;
    function fromDate(date) {
      const millis = date.getTime();
      const remainder = millis % 1e3;
      return { sec: Math.floor(millis / 1e3), nsec: remainder * 1e6 };
    }
    timeUtils.fromDate = fromDate;
    function percentOf(start, end, target) {
      const totalDuration = subtract(end, start);
      const targetDuration = subtract(target, start);
      return toSec(targetDuration) / toSec(totalDuration);
    }
    timeUtils.percentOf = percentOf;
    function interpolate(start, end, fraction) {
      const duration = subtract(end, start);
      return add(start, fromSec(fraction * toSec(duration)));
    }
    timeUtils.interpolate = interpolate;
    function fixTime(t, allowNegative = false) {
      const durationNanos = t.nsec;
      const secsFromNanos = Math.floor(durationNanos / 1e9);
      const newSecs = t.sec + secsFromNanos;
      const remainingDurationNanos = durationNanos % 1e9;
      const newNanos = Math.abs(Math.sign(remainingDurationNanos) === -1 ? 1e9 + remainingDurationNanos : remainingDurationNanos);
      const result = { sec: newSecs, nsec: newNanos };
      if (!allowNegative && result.sec < 0 || result.nsec < 0) {
        throw new Error(`Cannot normalize invalid time ${toString(result, true)}`);
      }
      return result;
    }
    timeUtils.fixTime = fixTime;
    function add({ sec: sec1, nsec: nsec1 }, { sec: sec2, nsec: nsec2 }) {
      return fixTime({ sec: sec1 + sec2, nsec: nsec1 + nsec2 });
    }
    timeUtils.add = add;
    function subtract({ sec: sec1, nsec: nsec1 }, { sec: sec2, nsec: nsec2 }) {
      return fixTime({ sec: sec1 - sec2, nsec: nsec1 - nsec2 }, true);
    }
    timeUtils.subtract = subtract;
    function toNanoSec({ sec, nsec }) {
      return BigInt(sec) * 1000000000n + BigInt(nsec);
    }
    timeUtils.toNanoSec = toNanoSec;
    function toMicroSec({ sec, nsec }) {
      return (sec * 1e9 + nsec) / 1e3;
    }
    timeUtils.toMicroSec = toMicroSec;
    function toSec({ sec, nsec }) {
      return sec + nsec * 1e-9;
    }
    timeUtils.toSec = toSec;
    function fromSec(value) {
      let sec = Math.trunc(value);
      let nsec = Math.round((value - sec) * 1e9);
      sec += Math.trunc(nsec / 1e9);
      nsec %= 1e9;
      return { sec, nsec };
    }
    timeUtils.fromSec = fromSec;
    function fromNanoSec(nsec) {
      return { sec: Number(nsec / 1000000000n), nsec: Number(nsec % 1000000000n) };
    }
    timeUtils.fromNanoSec = fromNanoSec;
    function toMillis(time2, roundUp = true) {
      const secondsMillis = time2.sec * 1e3;
      const nsecMillis = time2.nsec / 1e6;
      return roundUp ? secondsMillis + Math.ceil(nsecMillis) : secondsMillis + Math.floor(nsecMillis);
    }
    timeUtils.toMillis = toMillis;
    function fromMillis(value) {
      let sec = Math.trunc(value / 1e3);
      let nsec = Math.round((value - sec * 1e3) * 1e6);
      sec += Math.trunc(nsec / 1e9);
      nsec %= 1e9;
      return { sec, nsec };
    }
    timeUtils.fromMillis = fromMillis;
    function fromMicros(value) {
      let sec = Math.trunc(value / 1e6);
      let nsec = Math.round((value - sec * 1e6) * 1e3);
      sec += Math.trunc(nsec / 1e9);
      nsec %= 1e9;
      return { sec, nsec };
    }
    timeUtils.fromMicros = fromMicros;
    function clampTime(time2, start, end) {
      if (compare(start, time2) > 0) {
        return { sec: start.sec, nsec: start.nsec };
      }
      if (compare(end, time2) < 0) {
        return { sec: end.sec, nsec: end.nsec };
      }
      return { sec: time2.sec, nsec: time2.nsec };
    }
    timeUtils.clampTime = clampTime;
    function isTimeInRangeInclusive(time2, start, end) {
      if (compare(start, time2) > 0 || compare(end, time2) < 0) {
        return false;
      }
      return true;
    }
    timeUtils.isTimeInRangeInclusive = isTimeInRangeInclusive;
    function compare(left, right) {
      const secDiff = left.sec - right.sec;
      return secDiff !== 0 ? secDiff : left.nsec - right.nsec;
    }
    timeUtils.compare = compare;
    function isLessThan(left, right) {
      return compare(left, right) < 0;
    }
    timeUtils.isLessThan = isLessThan;
    function isGreaterThan(left, right) {
      return compare(left, right) > 0;
    }
    timeUtils.isGreaterThan = isGreaterThan;
    function areEqual(left, right) {
      return left.sec === right.sec && left.nsec === right.nsec;
    }
    timeUtils.areEqual = areEqual;
    (function(exports2) {
      var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      __exportStar(Time, exports2);
      __exportStar(timeUtils, exports2);
    })(dist$7);
    const TIME_ZERO = Object.freeze({ sec: 0, nsec: 0 });
    class IteratorCursor {
      constructor(iterator, abort) {
        __privateAdd(this, _iter, void 0);
        __privateAdd(this, _lastIteratorResult, void 0);
        __privateAdd(this, _abort, void 0);
        __privateSet(this, _iter, iterator);
        __privateSet(this, _abort, abort);
      }
      async next() {
        if (__privateGet(this, _abort)?.aborted === true) {
          return void 0;
        }
        const result = await __privateGet(this, _iter).next();
        return result.value;
      }
      async nextBatch(durationMs) {
        const firstResult = await this.next();
        if (!firstResult) {
          return void 0;
        }
        if (firstResult.type === "problem") {
          return [firstResult];
        }
        const results = [firstResult];
        let cutoffTime = TIME_ZERO;
        switch (firstResult.type) {
          case "stamp":
            cutoffTime = dist$7.add(firstResult.stamp, { sec: 0, nsec: durationMs * 1e6 });
            break;
          case "message-event":
            cutoffTime = dist$7.add(firstResult.msgEvent.receiveTime, { sec: 0, nsec: durationMs * 1e6 });
            break;
        }
        for (; ; ) {
          const result = await this.next();
          if (!result) {
            return results;
          }
          results.push(result);
          if (result.type === "problem") {
            break;
          }
          if (result.type === "stamp" && dist$7.compare(result.stamp, cutoffTime) > 0) {
            break;
          }
          if (result.type === "message-event" && dist$7.compare(result.msgEvent.receiveTime, cutoffTime) > 0) {
            break;
          }
        }
        return results;
      }
      async readUntil(end) {
        const isAborted = __privateGet(this, _abort)?.aborted;
        if (isAborted === true) {
          return void 0;
        }
        const results = [];
        if (__privateGet(this, _lastIteratorResult)?.type === "stamp" && dist$7.compare(__privateGet(this, _lastIteratorResult).stamp, end) >= 0) {
          return results;
        }
        if (__privateGet(this, _lastIteratorResult)?.type === "message-event" && dist$7.compare(__privateGet(this, _lastIteratorResult).msgEvent.receiveTime, end) > 0) {
          return results;
        }
        if (__privateGet(this, _lastIteratorResult)) {
          results.push(__privateGet(this, _lastIteratorResult));
          __privateSet(this, _lastIteratorResult, void 0);
        }
        for (; ; ) {
          const result = await __privateGet(this, _iter).next();
          if (__privateGet(this, _abort)?.aborted === true) {
            return void 0;
          }
          if (result.done === true) {
            break;
          }
          const value = result.value;
          if (value.type === "stamp" && dist$7.compare(value.stamp, end) >= 0) {
            __privateSet(this, _lastIteratorResult, value);
            break;
          }
          if (value.type === "message-event" && dist$7.compare(value.msgEvent.receiveTime, end) > 0) {
            __privateSet(this, _lastIteratorResult, value);
            break;
          }
          results.push(value);
        }
        return results;
      }
      async end() {
        await __privateGet(this, _iter).return?.();
      }
    }
    _iter = new WeakMap();
    _lastIteratorResult = new WeakMap();
    _abort = new WeakMap();
    class WorkerIterableSourceWorker {
      constructor(source) {
        __publicField(this, "_source");
        this._source = source;
      }
      async initialize() {
        return await this._source.initialize();
      }
      messageIterator(args) {
        return proxy(this._source.messageIterator(args));
      }
      async getBackfillMessages(args, abortSignal) {
        return await this._source.getBackfillMessages({
          ...args,
          abortSignal
        });
      }
      getMessageCursor(args, abort) {
        const iter = this._source.messageIterator(args);
        const cursor = new IteratorCursor(iter, abort);
        return proxy(cursor);
      }
    }
    transferHandlers.set("abortsignal", abortSignalTransferHandler);
    function crc32GenerateTables({ polynomial, numTables }) {
      const table = new Uint32Array(256 * numTables);
      for (let i = 0; i < 256; i++) {
        let r = i;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        r = (r & 1) * polynomial ^ r >>> 1;
        table[i] = r;
      }
      for (let i = 256; i < table.length; i++) {
        const value = table[i - 256];
        table[i] = table[value & 255] ^ value >>> 8;
      }
      return table;
    }
    const CRC32_TABLE = crc32GenerateTables({ polynomial: 3988292384, numTables: 8 });
    function crc32Init() {
      return ~0;
    }
    function crc32Update(prev, data) {
      const byteLength = data.byteLength;
      const view = new DataView(data.buffer, data.byteOffset, byteLength);
      let r = prev;
      let offset = 0;
      const toAlign = -view.byteOffset & 3;
      for (; offset < toAlign && offset < byteLength; offset++) {
        r = CRC32_TABLE[(r ^ view.getUint8(offset)) & 255] ^ r >>> 8;
      }
      if (offset === byteLength) {
        return r;
      }
      offset = toAlign;
      let remainingBytes = byteLength - offset;
      for (; remainingBytes >= 8; offset += 8, remainingBytes -= 8) {
        r ^= view.getUint32(offset, true);
        const r2 = view.getUint32(offset + 4, true);
        r = CRC32_TABLE[0 * 256 + (r2 >>> 24 & 255)] ^ CRC32_TABLE[1 * 256 + (r2 >>> 16 & 255)] ^ CRC32_TABLE[2 * 256 + (r2 >>> 8 & 255)] ^ CRC32_TABLE[3 * 256 + (r2 >>> 0 & 255)] ^ CRC32_TABLE[4 * 256 + (r >>> 24 & 255)] ^ CRC32_TABLE[5 * 256 + (r >>> 16 & 255)] ^ CRC32_TABLE[6 * 256 + (r >>> 8 & 255)] ^ CRC32_TABLE[7 * 256 + (r >>> 0 & 255)];
      }
      for (let i = offset; i < byteLength; i++) {
        r = CRC32_TABLE[(r ^ view.getUint8(i)) & 255] ^ r >>> 8;
      }
      return r;
    }
    function crc32Final(prev) {
      return (prev ^ ~0) >>> 0;
    }
    function crc32(data) {
      return crc32Final(crc32Update(crc32Init(), data));
    }
    var __awaiter = function(thisArg, _arguments, P, generator) {
      function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
          resolve(value);
        });
      }
      return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var __generator$1 = function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    var __read$1 = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray$1 = function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    var __values = function(o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m)
        return m.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function() {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    (function() {
      function HeapAsync(compare2) {
        if (compare2 === void 0) {
          compare2 = HeapAsync.minComparator;
        }
        var _this = this;
        this.compare = compare2;
        this.heapArray = [];
        this._limit = 0;
        this.offer = this.add;
        this.element = this.peek;
        this.poll = this.pop;
        this._invertedCompare = function(a, b) {
          return _this.compare(a, b).then(function(res) {
            return -1 * res;
          });
        };
      }
      HeapAsync.getChildrenIndexOf = function(idx) {
        return [idx * 2 + 1, idx * 2 + 2];
      };
      HeapAsync.getParentIndexOf = function(idx) {
        if (idx <= 0) {
          return -1;
        }
        var whichChildren = idx % 2 ? 1 : 2;
        return Math.floor((idx - whichChildren) / 2);
      };
      HeapAsync.getSiblingIndexOf = function(idx) {
        if (idx <= 0) {
          return -1;
        }
        var whichChildren = idx % 2 ? 1 : -1;
        return idx + whichChildren;
      };
      HeapAsync.minComparator = function(a, b) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            if (a > b) {
              return [2, 1];
            } else if (a < b) {
              return [2, -1];
            } else {
              return [2, 0];
            }
          });
        });
      };
      HeapAsync.maxComparator = function(a, b) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            if (b > a) {
              return [2, 1];
            } else if (b < a) {
              return [2, -1];
            } else {
              return [2, 0];
            }
          });
        });
      };
      HeapAsync.minComparatorNumber = function(a, b) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            return [2, a - b];
          });
        });
      };
      HeapAsync.maxComparatorNumber = function(a, b) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            return [2, b - a];
          });
        });
      };
      HeapAsync.defaultIsEqual = function(a, b) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            return [2, a === b];
          });
        });
      };
      HeapAsync.print = function(heap) {
        function deep(i2) {
          var pi = HeapAsync.getParentIndexOf(i2);
          return Math.floor(Math.log2(pi + 1));
        }
        function repeat(str, times) {
          var out = "";
          for (; times > 0; --times) {
            out += str;
          }
          return out;
        }
        var node = 0;
        var lines = [];
        var maxLines = deep(heap.length - 1) + 2;
        var maxLength = 0;
        while (node < heap.length) {
          var i = deep(node) + 1;
          if (node === 0) {
            i = 0;
          }
          var nodeText = String(heap.get(node));
          if (nodeText.length > maxLength) {
            maxLength = nodeText.length;
          }
          lines[i] = lines[i] || [];
          lines[i].push(nodeText);
          node += 1;
        }
        return lines.map(function(line, i2) {
          var times = Math.pow(2, maxLines - i2) - 1;
          return repeat(" ", Math.floor(times / 2) * maxLength) + line.map(function(el) {
            var half = (maxLength - el.length) / 2;
            return repeat(" ", Math.ceil(half)) + el + repeat(" ", Math.floor(half));
          }).join(repeat(" ", times * maxLength));
        }).join("\n");
      };
      HeapAsync.heapify = function(arr, compare2) {
        return __awaiter(this, void 0, void 0, function() {
          var heap;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heap = new HeapAsync(compare2);
                heap.heapArray = arr;
                return [4, heap.init()];
              case 1:
                _a.sent();
                return [2, heap];
            }
          });
        });
      };
      HeapAsync.heappop = function(heapArr, compare2) {
        var heap = new HeapAsync(compare2);
        heap.heapArray = heapArr;
        return heap.pop();
      };
      HeapAsync.heappush = function(heapArr, item, compare2) {
        return __awaiter(this, void 0, void 0, function() {
          var heap;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heap = new HeapAsync(compare2);
                heap.heapArray = heapArr;
                return [4, heap.push(item)];
              case 1:
                _a.sent();
                return [2];
            }
          });
        });
      };
      HeapAsync.heappushpop = function(heapArr, item, compare2) {
        var heap = new HeapAsync(compare2);
        heap.heapArray = heapArr;
        return heap.pushpop(item);
      };
      HeapAsync.heapreplace = function(heapArr, item, compare2) {
        var heap = new HeapAsync(compare2);
        heap.heapArray = heapArr;
        return heap.replace(item);
      };
      HeapAsync.heaptop = function(heapArr, n, compare2) {
        if (n === void 0) {
          n = 1;
        }
        var heap = new HeapAsync(compare2);
        heap.heapArray = heapArr;
        return heap.top(n);
      };
      HeapAsync.heapbottom = function(heapArr, n, compare2) {
        if (n === void 0) {
          n = 1;
        }
        var heap = new HeapAsync(compare2);
        heap.heapArray = heapArr;
        return heap.bottom(n);
      };
      HeapAsync.nlargest = function(n, iterable, compare2) {
        return __awaiter(this, void 0, void 0, function() {
          var heap;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heap = new HeapAsync(compare2);
                heap.heapArray = __spreadArray$1([], __read$1(iterable), false);
                return [4, heap.init()];
              case 1:
                _a.sent();
                return [2, heap.top(n)];
            }
          });
        });
      };
      HeapAsync.nsmallest = function(n, iterable, compare2) {
        return __awaiter(this, void 0, void 0, function() {
          var heap;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heap = new HeapAsync(compare2);
                heap.heapArray = __spreadArray$1([], __read$1(iterable), false);
                return [4, heap.init()];
              case 1:
                _a.sent();
                return [2, heap.bottom(n)];
            }
          });
        });
      };
      HeapAsync.prototype.add = function(element) {
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                return [4, this._sortNodeUp(this.heapArray.push(element) - 1)];
              case 1:
                _a.sent();
                this._applyLimit();
                return [2, true];
            }
          });
        });
      };
      HeapAsync.prototype.addAll = function(elements) {
        return __awaiter(this, void 0, void 0, function() {
          var i, l;
          var _a;
          return __generator$1(this, function(_b) {
            switch (_b.label) {
              case 0:
                i = this.length;
                (_a = this.heapArray).push.apply(_a, __spreadArray$1([], __read$1(elements), false));
                l = this.length;
                _b.label = 1;
              case 1:
                if (!(i < l))
                  return [3, 4];
                return [4, this._sortNodeUp(i)];
              case 2:
                _b.sent();
                _b.label = 3;
              case 3:
                ++i;
                return [3, 1];
              case 4:
                this._applyLimit();
                return [2, true];
            }
          });
        });
      };
      HeapAsync.prototype.bottom = function(n) {
        if (n === void 0) {
          n = 1;
        }
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            if (this.heapArray.length === 0 || n <= 0) {
              return [2, []];
            } else if (this.heapArray.length === 1) {
              return [2, [this.heapArray[0]]];
            } else if (n >= this.heapArray.length) {
              return [2, __spreadArray$1([], __read$1(this.heapArray), false)];
            } else {
              return [2, this._bottomN_push(~~n)];
            }
          });
        });
      };
      HeapAsync.prototype.check = function() {
        return __awaiter(this, void 0, void 0, function() {
          var j, el, children, children_1, children_1_1, ch, e_1_1;
          var e_1, _a;
          return __generator$1(this, function(_b) {
            switch (_b.label) {
              case 0:
                j = 0;
                _b.label = 1;
              case 1:
                if (!(j < this.heapArray.length))
                  return [3, 10];
                el = this.heapArray[j];
                children = this.getChildrenOf(j);
                _b.label = 2;
              case 2:
                _b.trys.push([2, 7, 8, 9]);
                children_1 = (e_1 = void 0, __values(children)), children_1_1 = children_1.next();
                _b.label = 3;
              case 3:
                if (!!children_1_1.done)
                  return [3, 6];
                ch = children_1_1.value;
                return [4, this.compare(el, ch)];
              case 4:
                if (_b.sent() > 0) {
                  return [2, el];
                }
                _b.label = 5;
              case 5:
                children_1_1 = children_1.next();
                return [3, 3];
              case 6:
                return [3, 9];
              case 7:
                e_1_1 = _b.sent();
                e_1 = { error: e_1_1 };
                return [3, 9];
              case 8:
                try {
                  if (children_1_1 && !children_1_1.done && (_a = children_1.return))
                    _a.call(children_1);
                } finally {
                  if (e_1)
                    throw e_1.error;
                }
                return [7];
              case 9:
                ++j;
                return [3, 1];
              case 10:
                return [2];
            }
          });
        });
      };
      HeapAsync.prototype.clear = function() {
        this.heapArray = [];
      };
      HeapAsync.prototype.clone = function() {
        var cloned = new HeapAsync(this.comparator());
        cloned.heapArray = this.toArray();
        cloned._limit = this._limit;
        return cloned;
      };
      HeapAsync.prototype.comparator = function() {
        return this.compare;
      };
      HeapAsync.prototype.contains = function(o, fn) {
        if (fn === void 0) {
          fn = HeapAsync.defaultIsEqual;
        }
        return __awaiter(this, void 0, void 0, function() {
          var _a, _b, el, e_2_1;
          var e_2, _c;
          return __generator$1(this, function(_d) {
            switch (_d.label) {
              case 0:
                _d.trys.push([0, 5, 6, 7]);
                _a = __values(this.heapArray), _b = _a.next();
                _d.label = 1;
              case 1:
                if (!!_b.done)
                  return [3, 4];
                el = _b.value;
                return [4, fn(el, o)];
              case 2:
                if (_d.sent()) {
                  return [2, true];
                }
                _d.label = 3;
              case 3:
                _b = _a.next();
                return [3, 1];
              case 4:
                return [3, 7];
              case 5:
                e_2_1 = _d.sent();
                e_2 = { error: e_2_1 };
                return [3, 7];
              case 6:
                try {
                  if (_b && !_b.done && (_c = _a.return))
                    _c.call(_a);
                } finally {
                  if (e_2)
                    throw e_2.error;
                }
                return [7];
              case 7:
                return [2, false];
            }
          });
        });
      };
      HeapAsync.prototype.init = function(array) {
        return __awaiter(this, void 0, void 0, function() {
          var i;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (array) {
                  this.heapArray = __spreadArray$1([], __read$1(array), false);
                }
                i = Math.floor(this.heapArray.length);
                _a.label = 1;
              case 1:
                if (!(i >= 0))
                  return [3, 4];
                return [4, this._sortNodeDown(i)];
              case 2:
                _a.sent();
                _a.label = 3;
              case 3:
                --i;
                return [3, 1];
              case 4:
                this._applyLimit();
                return [2];
            }
          });
        });
      };
      HeapAsync.prototype.isEmpty = function() {
        return this.length === 0;
      };
      HeapAsync.prototype.leafs = function() {
        if (this.heapArray.length === 0) {
          return [];
        }
        var pi = HeapAsync.getParentIndexOf(this.heapArray.length - 1);
        return this.heapArray.slice(pi + 1);
      };
      Object.defineProperty(HeapAsync.prototype, "length", {
        get: function() {
          return this.heapArray.length;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(HeapAsync.prototype, "limit", {
        get: function() {
          return this._limit;
        },
        set: function(_l) {
          this._limit = ~~_l;
          this._applyLimit();
        },
        enumerable: false,
        configurable: true
      });
      HeapAsync.prototype.peek = function() {
        return this.heapArray[0];
      };
      HeapAsync.prototype.pop = function() {
        return __awaiter(this, void 0, void 0, function() {
          var last;
          return __generator$1(this, function(_a) {
            last = this.heapArray.pop();
            if (this.length > 0 && last !== void 0) {
              return [2, this.replace(last)];
            }
            return [2, last];
          });
        });
      };
      HeapAsync.prototype.push = function() {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          elements[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            if (elements.length < 1) {
              return [2, false];
            } else if (elements.length === 1) {
              return [2, this.add(elements[0])];
            } else {
              return [2, this.addAll(elements)];
            }
          });
        });
      };
      HeapAsync.prototype.pushpop = function(element) {
        return __awaiter(this, void 0, void 0, function() {
          var _a;
          return __generator$1(this, function(_b) {
            switch (_b.label) {
              case 0:
                return [4, this.compare(this.heapArray[0], element)];
              case 1:
                if (!(_b.sent() < 0))
                  return [3, 3];
                _a = __read$1([this.heapArray[0], element], 2), element = _a[0], this.heapArray[0] = _a[1];
                return [4, this._sortNodeDown(0)];
              case 2:
                _b.sent();
                _b.label = 3;
              case 3:
                return [2, element];
            }
          });
        });
      };
      HeapAsync.prototype.remove = function(o, fn) {
        if (fn === void 0) {
          fn = HeapAsync.defaultIsEqual;
        }
        return __awaiter(this, void 0, void 0, function() {
          var idx, i;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (!(this.length > 0))
                  return [3, 13];
                if (!(o === void 0))
                  return [3, 2];
                return [4, this.pop()];
              case 1:
                _a.sent();
                return [2, true];
              case 2:
                idx = -1;
                i = 0;
                _a.label = 3;
              case 3:
                if (!(i < this.heapArray.length))
                  return [3, 6];
                return [4, fn(this.heapArray[i], o)];
              case 4:
                if (_a.sent()) {
                  idx = i;
                  return [3, 6];
                }
                _a.label = 5;
              case 5:
                ++i;
                return [3, 3];
              case 6:
                if (!(idx >= 0))
                  return [3, 13];
                if (!(idx === 0))
                  return [3, 8];
                return [4, this.pop()];
              case 7:
                _a.sent();
                return [3, 12];
              case 8:
                if (!(idx === this.length - 1))
                  return [3, 9];
                this.heapArray.pop();
                return [3, 12];
              case 9:
                this.heapArray.splice(idx, 1, this.heapArray.pop());
                return [4, this._sortNodeUp(idx)];
              case 10:
                _a.sent();
                return [4, this._sortNodeDown(idx)];
              case 11:
                _a.sent();
                _a.label = 12;
              case 12:
                return [2, true];
              case 13:
                return [2, false];
            }
          });
        });
      };
      HeapAsync.prototype.replace = function(element) {
        return __awaiter(this, void 0, void 0, function() {
          var peek;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                peek = this.heapArray[0];
                this.heapArray[0] = element;
                return [4, this._sortNodeDown(0)];
              case 1:
                _a.sent();
                return [2, peek];
            }
          });
        });
      };
      HeapAsync.prototype.size = function() {
        return this.length;
      };
      HeapAsync.prototype.top = function(n) {
        if (n === void 0) {
          n = 1;
        }
        return __awaiter(this, void 0, void 0, function() {
          return __generator$1(this, function(_a) {
            if (this.heapArray.length === 0 || n <= 0) {
              return [2, []];
            } else if (this.heapArray.length === 1 || n === 1) {
              return [2, [this.heapArray[0]]];
            } else if (n >= this.heapArray.length) {
              return [2, __spreadArray$1([], __read$1(this.heapArray), false)];
            } else {
              return [2, this._topN_push(~~n)];
            }
          });
        });
      };
      HeapAsync.prototype.toArray = function() {
        return __spreadArray$1([], __read$1(this.heapArray), false);
      };
      HeapAsync.prototype.toString = function() {
        return this.heapArray.toString();
      };
      HeapAsync.prototype.get = function(i) {
        return this.heapArray[i];
      };
      HeapAsync.prototype.getChildrenOf = function(idx) {
        var _this = this;
        return HeapAsync.getChildrenIndexOf(idx).map(function(i) {
          return _this.heapArray[i];
        }).filter(function(e) {
          return e !== void 0;
        });
      };
      HeapAsync.prototype.getParentOf = function(idx) {
        var pi = HeapAsync.getParentIndexOf(idx);
        return this.heapArray[pi];
      };
      HeapAsync.prototype[Symbol.iterator] = function() {
        return __generator$1(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (!this.length)
                return [3, 2];
              return [4, this.pop()];
            case 1:
              _a.sent();
              return [3, 0];
            case 2:
              return [2];
          }
        });
      };
      HeapAsync.prototype.iterator = function() {
        return this;
      };
      HeapAsync.prototype._applyLimit = function() {
        if (this._limit && this._limit < this.heapArray.length) {
          var rm = this.heapArray.length - this._limit;
          while (rm) {
            this.heapArray.pop();
            --rm;
          }
        }
      };
      HeapAsync.prototype._bottomN_push = function(n) {
        return __awaiter(this, void 0, void 0, function() {
          var bottomHeap, startAt, parentStartAt, indices, i, arr, i;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                bottomHeap = new HeapAsync(this.compare);
                bottomHeap.limit = n;
                bottomHeap.heapArray = this.heapArray.slice(-n);
                return [4, bottomHeap.init()];
              case 1:
                _a.sent();
                startAt = this.heapArray.length - 1 - n;
                parentStartAt = HeapAsync.getParentIndexOf(startAt);
                indices = [];
                for (i = startAt; i > parentStartAt; --i) {
                  indices.push(i);
                }
                arr = this.heapArray;
                _a.label = 2;
              case 2:
                if (!indices.length)
                  return [3, 6];
                i = indices.shift();
                return [4, this.compare(arr[i], bottomHeap.peek())];
              case 3:
                if (!(_a.sent() > 0))
                  return [3, 5];
                return [4, bottomHeap.replace(arr[i])];
              case 4:
                _a.sent();
                if (i % 2) {
                  indices.push(HeapAsync.getParentIndexOf(i));
                }
                _a.label = 5;
              case 5:
                return [3, 2];
              case 6:
                return [2, bottomHeap.toArray()];
            }
          });
        });
      };
      HeapAsync.prototype._moveNode = function(j, k) {
        var _a;
        _a = __read$1([this.heapArray[k], this.heapArray[j]], 2), this.heapArray[j] = _a[0], this.heapArray[k] = _a[1];
      };
      HeapAsync.prototype._sortNodeDown = function(i) {
        return __awaiter(this, void 0, void 0, function() {
          var moveIt, self2, getPotentialParent, childrenIdx, bestChildIndex, j, bestChild, _a;
          var _this = this;
          return __generator$1(this, function(_b) {
            switch (_b.label) {
              case 0:
                moveIt = i < this.heapArray.length - 1;
                self2 = this.heapArray[i];
                getPotentialParent = function(best, j2) {
                  return __awaiter(_this, void 0, void 0, function() {
                    var _a2;
                    return __generator$1(this, function(_b2) {
                      switch (_b2.label) {
                        case 0:
                          _a2 = this.heapArray.length > j2;
                          if (!_a2)
                            return [3, 2];
                          return [4, this.compare(this.heapArray[j2], this.heapArray[best])];
                        case 1:
                          _a2 = _b2.sent() < 0;
                          _b2.label = 2;
                        case 2:
                          if (_a2) {
                            best = j2;
                          }
                          return [2, best];
                      }
                    });
                  });
                };
                _b.label = 1;
              case 1:
                if (!moveIt)
                  return [3, 8];
                childrenIdx = HeapAsync.getChildrenIndexOf(i);
                bestChildIndex = childrenIdx[0];
                j = 1;
                _b.label = 2;
              case 2:
                if (!(j < childrenIdx.length))
                  return [3, 5];
                return [4, getPotentialParent(bestChildIndex, childrenIdx[j])];
              case 3:
                bestChildIndex = _b.sent();
                _b.label = 4;
              case 4:
                ++j;
                return [3, 2];
              case 5:
                bestChild = this.heapArray[bestChildIndex];
                _a = typeof bestChild !== "undefined";
                if (!_a)
                  return [3, 7];
                return [4, this.compare(self2, bestChild)];
              case 6:
                _a = _b.sent() > 0;
                _b.label = 7;
              case 7:
                if (_a) {
                  this._moveNode(i, bestChildIndex);
                  i = bestChildIndex;
                } else {
                  moveIt = false;
                }
                return [3, 1];
              case 8:
                return [2];
            }
          });
        });
      };
      HeapAsync.prototype._sortNodeUp = function(i) {
        return __awaiter(this, void 0, void 0, function() {
          var moveIt, pi, _a;
          return __generator$1(this, function(_b) {
            switch (_b.label) {
              case 0:
                moveIt = i > 0;
                _b.label = 1;
              case 1:
                if (!moveIt)
                  return [3, 4];
                pi = HeapAsync.getParentIndexOf(i);
                _a = pi >= 0;
                if (!_a)
                  return [3, 3];
                return [4, this.compare(this.heapArray[pi], this.heapArray[i])];
              case 2:
                _a = _b.sent() > 0;
                _b.label = 3;
              case 3:
                if (_a) {
                  this._moveNode(i, pi);
                  i = pi;
                } else {
                  moveIt = false;
                }
                return [3, 1];
              case 4:
                return [2];
            }
          });
        });
      };
      HeapAsync.prototype._topN_push = function(n) {
        return __awaiter(this, void 0, void 0, function() {
          var topHeap, indices, arr, i;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                topHeap = new HeapAsync(this._invertedCompare);
                topHeap.limit = n;
                indices = [0];
                arr = this.heapArray;
                _a.label = 1;
              case 1:
                if (!indices.length)
                  return [3, 7];
                i = indices.shift();
                if (!(i < arr.length))
                  return [3, 6];
                if (!(topHeap.length < n))
                  return [3, 3];
                return [4, topHeap.push(arr[i])];
              case 2:
                _a.sent();
                indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync.getChildrenIndexOf(i)), false));
                return [3, 6];
              case 3:
                return [4, this.compare(arr[i], topHeap.peek())];
              case 4:
                if (!(_a.sent() < 0))
                  return [3, 6];
                return [4, topHeap.replace(arr[i])];
              case 5:
                _a.sent();
                indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync.getChildrenIndexOf(i)), false));
                _a.label = 6;
              case 6:
                return [3, 1];
              case 7:
                return [2, topHeap.toArray()];
            }
          });
        });
      };
      HeapAsync.prototype._topN_fill = function(n) {
        return __awaiter(this, void 0, void 0, function() {
          var heapArray, topHeap, branch, indices, i, i;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heapArray = this.heapArray;
                topHeap = new HeapAsync(this._invertedCompare);
                topHeap.limit = n;
                topHeap.heapArray = heapArray.slice(0, n);
                return [4, topHeap.init()];
              case 1:
                _a.sent();
                branch = HeapAsync.getParentIndexOf(n - 1) + 1;
                indices = [];
                for (i = branch; i < n; ++i) {
                  indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync.getChildrenIndexOf(i).filter(function(l) {
                    return l < heapArray.length;
                  })), false));
                }
                if ((n - 1) % 2) {
                  indices.push(n);
                }
                _a.label = 2;
              case 2:
                if (!indices.length)
                  return [3, 6];
                i = indices.shift();
                if (!(i < heapArray.length))
                  return [3, 5];
                return [4, this.compare(heapArray[i], topHeap.peek())];
              case 3:
                if (!(_a.sent() < 0))
                  return [3, 5];
                return [4, topHeap.replace(heapArray[i])];
              case 4:
                _a.sent();
                indices.push.apply(indices, __spreadArray$1([], __read$1(HeapAsync.getChildrenIndexOf(i)), false));
                _a.label = 5;
              case 5:
                return [3, 2];
              case 6:
                return [2, topHeap.toArray()];
            }
          });
        });
      };
      HeapAsync.prototype._topN_heap = function(n) {
        return __awaiter(this, void 0, void 0, function() {
          var topHeap, result, i, _a, _b;
          return __generator$1(this, function(_c) {
            switch (_c.label) {
              case 0:
                topHeap = this.clone();
                result = [];
                i = 0;
                _c.label = 1;
              case 1:
                if (!(i < n))
                  return [3, 4];
                _b = (_a = result).push;
                return [4, topHeap.pop()];
              case 2:
                _b.apply(_a, [_c.sent()]);
                _c.label = 3;
              case 3:
                ++i;
                return [3, 1];
              case 4:
                return [2, result];
            }
          });
        });
      };
      HeapAsync.prototype._topIdxOf = function(list) {
        return __awaiter(this, void 0, void 0, function() {
          var idx, top, i, comp;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                if (!list.length) {
                  return [2, -1];
                }
                idx = 0;
                top = list[idx];
                i = 1;
                _a.label = 1;
              case 1:
                if (!(i < list.length))
                  return [3, 4];
                return [4, this.compare(list[i], top)];
              case 2:
                comp = _a.sent();
                if (comp < 0) {
                  idx = i;
                  top = list[i];
                }
                _a.label = 3;
              case 3:
                ++i;
                return [3, 1];
              case 4:
                return [2, idx];
            }
          });
        });
      };
      HeapAsync.prototype._topOf = function() {
        var list = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          list[_i] = arguments[_i];
        }
        return __awaiter(this, void 0, void 0, function() {
          var heap;
          return __generator$1(this, function(_a) {
            switch (_a.label) {
              case 0:
                heap = new HeapAsync(this.compare);
                return [4, heap.init(list)];
              case 1:
                _a.sent();
                return [2, heap.peek()];
            }
          });
        });
      };
      return HeapAsync;
    })();
    var __generator = function(thisArg, body) {
      var _ = { label: 0, sent: function() {
        if (t[0] & 1)
          throw t[1];
        return t[1];
      }, trys: [], ops: [] }, f, y, t, g;
      return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
      }), g;
      function verb(n) {
        return function(v) {
          return step([n, v]);
        };
      }
      function step(op) {
        if (f)
          throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _)
          try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done)
              return t;
            if (y = 0, t)
              op = [op[0] & 2, t.value];
            switch (op[0]) {
              case 0:
              case 1:
                t = op;
                break;
              case 4:
                _.label++;
                return { value: op[1], done: false };
              case 5:
                _.label++;
                y = op[1];
                op = [0];
                continue;
              case 7:
                op = _.ops.pop();
                _.trys.pop();
                continue;
              default:
                if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                  _ = 0;
                  continue;
                }
                if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                  _.label = op[1];
                  break;
                }
                if (op[0] === 6 && _.label < t[1]) {
                  _.label = t[1];
                  t = op;
                  break;
                }
                if (t && _.label < t[2]) {
                  _.label = t[2];
                  _.ops.push(op);
                  break;
                }
                if (t[2])
                  _.ops.pop();
                _.trys.pop();
                continue;
            }
            op = body.call(thisArg, _);
          } catch (e) {
            op = [6, e];
            y = 0;
          } finally {
            f = t = 0;
          }
        if (op[0] & 5)
          throw op[1];
        return { value: op[0] ? op[1] : void 0, done: true };
      }
    };
    var __read = function(o, n) {
      var m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m)
        return o;
      var i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m = i["return"]))
            m.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    var __spreadArray = function(to, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l = from.length, ar; i < l; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to.concat(ar || Array.prototype.slice.call(from));
    };
    var Heap = function() {
      function Heap2(compare2) {
        if (compare2 === void 0) {
          compare2 = Heap2.minComparator;
        }
        var _this = this;
        this.compare = compare2;
        this.heapArray = [];
        this._limit = 0;
        this.offer = this.add;
        this.element = this.peek;
        this.poll = this.pop;
        this._invertedCompare = function(a, b) {
          return -1 * _this.compare(a, b);
        };
      }
      Heap2.getChildrenIndexOf = function(idx) {
        return [idx * 2 + 1, idx * 2 + 2];
      };
      Heap2.getParentIndexOf = function(idx) {
        if (idx <= 0) {
          return -1;
        }
        var whichChildren = idx % 2 ? 1 : 2;
        return Math.floor((idx - whichChildren) / 2);
      };
      Heap2.getSiblingIndexOf = function(idx) {
        if (idx <= 0) {
          return -1;
        }
        var whichChildren = idx % 2 ? 1 : -1;
        return idx + whichChildren;
      };
      Heap2.minComparator = function(a, b) {
        if (a > b) {
          return 1;
        } else if (a < b) {
          return -1;
        } else {
          return 0;
        }
      };
      Heap2.maxComparator = function(a, b) {
        if (b > a) {
          return 1;
        } else if (b < a) {
          return -1;
        } else {
          return 0;
        }
      };
      Heap2.minComparatorNumber = function(a, b) {
        return a - b;
      };
      Heap2.maxComparatorNumber = function(a, b) {
        return b - a;
      };
      Heap2.defaultIsEqual = function(a, b) {
        return a === b;
      };
      Heap2.print = function(heap) {
        function deep(i2) {
          var pi = Heap2.getParentIndexOf(i2);
          return Math.floor(Math.log2(pi + 1));
        }
        function repeat(str, times) {
          var out = "";
          for (; times > 0; --times) {
            out += str;
          }
          return out;
        }
        var node = 0;
        var lines = [];
        var maxLines = deep(heap.length - 1) + 2;
        var maxLength = 0;
        while (node < heap.length) {
          var i = deep(node) + 1;
          if (node === 0) {
            i = 0;
          }
          var nodeText = String(heap.get(node));
          if (nodeText.length > maxLength) {
            maxLength = nodeText.length;
          }
          lines[i] = lines[i] || [];
          lines[i].push(nodeText);
          node += 1;
        }
        return lines.map(function(line, i2) {
          var times = Math.pow(2, maxLines - i2) - 1;
          return repeat(" ", Math.floor(times / 2) * maxLength) + line.map(function(el) {
            var half = (maxLength - el.length) / 2;
            return repeat(" ", Math.ceil(half)) + el + repeat(" ", Math.floor(half));
          }).join(repeat(" ", times * maxLength));
        }).join("\n");
      };
      Heap2.heapify = function(arr, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = arr;
        heap.init();
        return heap;
      };
      Heap2.heappop = function(heapArr, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        return heap.pop();
      };
      Heap2.heappush = function(heapArr, item, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        heap.push(item);
      };
      Heap2.heappushpop = function(heapArr, item, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        return heap.pushpop(item);
      };
      Heap2.heapreplace = function(heapArr, item, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        return heap.replace(item);
      };
      Heap2.heaptop = function(heapArr, n, compare2) {
        if (n === void 0) {
          n = 1;
        }
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        return heap.top(n);
      };
      Heap2.heapbottom = function(heapArr, n, compare2) {
        if (n === void 0) {
          n = 1;
        }
        var heap = new Heap2(compare2);
        heap.heapArray = heapArr;
        return heap.bottom(n);
      };
      Heap2.nlargest = function(n, iterable, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = __spreadArray([], __read(iterable), false);
        heap.init();
        return heap.top(n);
      };
      Heap2.nsmallest = function(n, iterable, compare2) {
        var heap = new Heap2(compare2);
        heap.heapArray = __spreadArray([], __read(iterable), false);
        heap.init();
        return heap.bottom(n);
      };
      Heap2.prototype.add = function(element) {
        this._sortNodeUp(this.heapArray.push(element) - 1);
        this._applyLimit();
        return true;
      };
      Heap2.prototype.addAll = function(elements) {
        var _a;
        var i = this.length;
        (_a = this.heapArray).push.apply(_a, __spreadArray([], __read(elements), false));
        for (var l = this.length; i < l; ++i) {
          this._sortNodeUp(i);
        }
        this._applyLimit();
        return true;
      };
      Heap2.prototype.bottom = function(n) {
        if (n === void 0) {
          n = 1;
        }
        if (this.heapArray.length === 0 || n <= 0) {
          return [];
        } else if (this.heapArray.length === 1) {
          return [this.heapArray[0]];
        } else if (n >= this.heapArray.length) {
          return __spreadArray([], __read(this.heapArray), false);
        } else {
          return this._bottomN_push(~~n);
        }
      };
      Heap2.prototype.check = function() {
        var _this = this;
        return this.heapArray.find(function(el, j) {
          return !!_this.getChildrenOf(j).find(function(ch) {
            return _this.compare(el, ch) > 0;
          });
        });
      };
      Heap2.prototype.clear = function() {
        this.heapArray = [];
      };
      Heap2.prototype.clone = function() {
        var cloned = new Heap2(this.comparator());
        cloned.heapArray = this.toArray();
        cloned._limit = this._limit;
        return cloned;
      };
      Heap2.prototype.comparator = function() {
        return this.compare;
      };
      Heap2.prototype.contains = function(o, fn) {
        if (fn === void 0) {
          fn = Heap2.defaultIsEqual;
        }
        return this.heapArray.findIndex(function(el) {
          return fn(el, o);
        }) >= 0;
      };
      Heap2.prototype.init = function(array) {
        if (array) {
          this.heapArray = __spreadArray([], __read(array), false);
        }
        for (var i = Math.floor(this.heapArray.length); i >= 0; --i) {
          this._sortNodeDown(i);
        }
        this._applyLimit();
      };
      Heap2.prototype.isEmpty = function() {
        return this.length === 0;
      };
      Heap2.prototype.leafs = function() {
        if (this.heapArray.length === 0) {
          return [];
        }
        var pi = Heap2.getParentIndexOf(this.heapArray.length - 1);
        return this.heapArray.slice(pi + 1);
      };
      Object.defineProperty(Heap2.prototype, "length", {
        get: function() {
          return this.heapArray.length;
        },
        enumerable: false,
        configurable: true
      });
      Object.defineProperty(Heap2.prototype, "limit", {
        get: function() {
          return this._limit;
        },
        set: function(_l) {
          this._limit = ~~_l;
          this._applyLimit();
        },
        enumerable: false,
        configurable: true
      });
      Heap2.prototype.peek = function() {
        return this.heapArray[0];
      };
      Heap2.prototype.pop = function() {
        var last = this.heapArray.pop();
        if (this.length > 0 && last !== void 0) {
          return this.replace(last);
        }
        return last;
      };
      Heap2.prototype.push = function() {
        var elements = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          elements[_i] = arguments[_i];
        }
        if (elements.length < 1) {
          return false;
        } else if (elements.length === 1) {
          return this.add(elements[0]);
        } else {
          return this.addAll(elements);
        }
      };
      Heap2.prototype.pushpop = function(element) {
        var _a;
        if (this.compare(this.heapArray[0], element) < 0) {
          _a = __read([this.heapArray[0], element], 2), element = _a[0], this.heapArray[0] = _a[1];
          this._sortNodeDown(0);
        }
        return element;
      };
      Heap2.prototype.remove = function(o, fn) {
        if (fn === void 0) {
          fn = Heap2.defaultIsEqual;
        }
        if (this.length > 0) {
          if (o === void 0) {
            this.pop();
            return true;
          } else {
            var idx = this.heapArray.findIndex(function(el) {
              return fn(el, o);
            });
            if (idx >= 0) {
              if (idx === 0) {
                this.pop();
              } else if (idx === this.length - 1) {
                this.heapArray.pop();
              } else {
                this.heapArray.splice(idx, 1, this.heapArray.pop());
                this._sortNodeUp(idx);
                this._sortNodeDown(idx);
              }
              return true;
            }
          }
        }
        return false;
      };
      Heap2.prototype.replace = function(element) {
        var peek = this.heapArray[0];
        this.heapArray[0] = element;
        this._sortNodeDown(0);
        return peek;
      };
      Heap2.prototype.size = function() {
        return this.length;
      };
      Heap2.prototype.top = function(n) {
        if (n === void 0) {
          n = 1;
        }
        if (this.heapArray.length === 0 || n <= 0) {
          return [];
        } else if (this.heapArray.length === 1 || n === 1) {
          return [this.heapArray[0]];
        } else if (n >= this.heapArray.length) {
          return __spreadArray([], __read(this.heapArray), false);
        } else {
          return this._topN_push(~~n);
        }
      };
      Heap2.prototype.toArray = function() {
        return __spreadArray([], __read(this.heapArray), false);
      };
      Heap2.prototype.toString = function() {
        return this.heapArray.toString();
      };
      Heap2.prototype.get = function(i) {
        return this.heapArray[i];
      };
      Heap2.prototype.getChildrenOf = function(idx) {
        var _this = this;
        return Heap2.getChildrenIndexOf(idx).map(function(i) {
          return _this.heapArray[i];
        }).filter(function(e) {
          return e !== void 0;
        });
      };
      Heap2.prototype.getParentOf = function(idx) {
        var pi = Heap2.getParentIndexOf(idx);
        return this.heapArray[pi];
      };
      Heap2.prototype[Symbol.iterator] = function() {
        return __generator(this, function(_a) {
          switch (_a.label) {
            case 0:
              if (!this.length)
                return [3, 2];
              return [4, this.pop()];
            case 1:
              _a.sent();
              return [3, 0];
            case 2:
              return [2];
          }
        });
      };
      Heap2.prototype.iterator = function() {
        return this.toArray();
      };
      Heap2.prototype._applyLimit = function() {
        if (this._limit && this._limit < this.heapArray.length) {
          var rm = this.heapArray.length - this._limit;
          while (rm) {
            this.heapArray.pop();
            --rm;
          }
        }
      };
      Heap2.prototype._bottomN_push = function(n) {
        var bottomHeap = new Heap2(this.compare);
        bottomHeap.limit = n;
        bottomHeap.heapArray = this.heapArray.slice(-n);
        bottomHeap.init();
        var startAt = this.heapArray.length - 1 - n;
        var parentStartAt = Heap2.getParentIndexOf(startAt);
        var indices = [];
        for (var i = startAt; i > parentStartAt; --i) {
          indices.push(i);
        }
        var arr = this.heapArray;
        while (indices.length) {
          var i = indices.shift();
          if (this.compare(arr[i], bottomHeap.peek()) > 0) {
            bottomHeap.replace(arr[i]);
            if (i % 2) {
              indices.push(Heap2.getParentIndexOf(i));
            }
          }
        }
        return bottomHeap.toArray();
      };
      Heap2.prototype._moveNode = function(j, k) {
        var _a;
        _a = __read([this.heapArray[k], this.heapArray[j]], 2), this.heapArray[j] = _a[0], this.heapArray[k] = _a[1];
      };
      Heap2.prototype._sortNodeDown = function(i) {
        var _this = this;
        var moveIt = i < this.heapArray.length - 1;
        var self2 = this.heapArray[i];
        var getPotentialParent = function(best, j) {
          if (_this.heapArray.length > j && _this.compare(_this.heapArray[j], _this.heapArray[best]) < 0) {
            best = j;
          }
          return best;
        };
        while (moveIt) {
          var childrenIdx = Heap2.getChildrenIndexOf(i);
          var bestChildIndex = childrenIdx.reduce(getPotentialParent, childrenIdx[0]);
          var bestChild = this.heapArray[bestChildIndex];
          if (typeof bestChild !== "undefined" && this.compare(self2, bestChild) > 0) {
            this._moveNode(i, bestChildIndex);
            i = bestChildIndex;
          } else {
            moveIt = false;
          }
        }
      };
      Heap2.prototype._sortNodeUp = function(i) {
        var moveIt = i > 0;
        while (moveIt) {
          var pi = Heap2.getParentIndexOf(i);
          if (pi >= 0 && this.compare(this.heapArray[pi], this.heapArray[i]) > 0) {
            this._moveNode(i, pi);
            i = pi;
          } else {
            moveIt = false;
          }
        }
      };
      Heap2.prototype._topN_push = function(n) {
        var topHeap = new Heap2(this._invertedCompare);
        topHeap.limit = n;
        var indices = [0];
        var arr = this.heapArray;
        while (indices.length) {
          var i = indices.shift();
          if (i < arr.length) {
            if (topHeap.length < n) {
              topHeap.push(arr[i]);
              indices.push.apply(indices, __spreadArray([], __read(Heap2.getChildrenIndexOf(i)), false));
            } else if (this.compare(arr[i], topHeap.peek()) < 0) {
              topHeap.replace(arr[i]);
              indices.push.apply(indices, __spreadArray([], __read(Heap2.getChildrenIndexOf(i)), false));
            }
          }
        }
        return topHeap.toArray();
      };
      Heap2.prototype._topN_fill = function(n) {
        var heapArray = this.heapArray;
        var topHeap = new Heap2(this._invertedCompare);
        topHeap.limit = n;
        topHeap.heapArray = heapArray.slice(0, n);
        topHeap.init();
        var branch = Heap2.getParentIndexOf(n - 1) + 1;
        var indices = [];
        for (var i = branch; i < n; ++i) {
          indices.push.apply(indices, __spreadArray([], __read(Heap2.getChildrenIndexOf(i).filter(function(l) {
            return l < heapArray.length;
          })), false));
        }
        if ((n - 1) % 2) {
          indices.push(n);
        }
        while (indices.length) {
          var i = indices.shift();
          if (i < heapArray.length) {
            if (this.compare(heapArray[i], topHeap.peek()) < 0) {
              topHeap.replace(heapArray[i]);
              indices.push.apply(indices, __spreadArray([], __read(Heap2.getChildrenIndexOf(i)), false));
            }
          }
        }
        return topHeap.toArray();
      };
      Heap2.prototype._topN_heap = function(n) {
        var topHeap = this.clone();
        var result = [];
        for (var i = 0; i < n; ++i) {
          result.push(topHeap.pop());
        }
        return result;
      };
      Heap2.prototype._topIdxOf = function(list) {
        if (!list.length) {
          return -1;
        }
        var idx = 0;
        var top = list[idx];
        for (var i = 1; i < list.length; ++i) {
          var comp = this.compare(list[i], top);
          if (comp < 0) {
            idx = i;
            top = list[i];
          }
        }
        return idx;
      };
      Heap2.prototype._topOf = function() {
        var list = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          list[_i] = arguments[_i];
        }
        var heap = new Heap2(this.compare);
        heap.init(list);
        return heap.peek();
      };
      return Heap2;
    }();
    const getBigUint64 = typeof DataView.prototype.getBigUint64 === "function" ? DataView.prototype.getBigUint64 : function(offset, littleEndian) {
      const lo = littleEndian === true ? this.getUint32(offset, littleEndian) : this.getUint32(offset + 4, littleEndian);
      const hi = littleEndian === true ? this.getUint32(offset + 4, littleEndian) : this.getUint32(offset, littleEndian);
      return BigInt(hi) << 32n | BigInt(lo);
    };
    const textDecoder$1 = new TextDecoder();
    class Reader$2 {
      constructor(view, offset = 0) {
        __privateAdd(this, _view, void 0);
        __publicField(this, "offset");
        __privateSet(this, _view, view);
        this.offset = offset;
      }
      uint8() {
        const value = __privateGet(this, _view).getUint8(this.offset);
        this.offset += 1;
        return value;
      }
      uint16() {
        const value = __privateGet(this, _view).getUint16(this.offset, true);
        this.offset += 2;
        return value;
      }
      uint32() {
        const value = __privateGet(this, _view).getUint32(this.offset, true);
        this.offset += 4;
        return value;
      }
      uint64() {
        const value = getBigUint64.call(__privateGet(this, _view), this.offset, true);
        this.offset += 8;
        return value;
      }
      string() {
        const length = this.uint32();
        if (this.offset + length > __privateGet(this, _view).byteLength) {
          throw new Error(`String length ${length} exceeds bounds of buffer`);
        }
        const value = textDecoder$1.decode(new Uint8Array(__privateGet(this, _view).buffer, __privateGet(this, _view).byteOffset + this.offset, length));
        this.offset += length;
        return value;
      }
      keyValuePairs(readKey, readValue) {
        const length = this.uint32();
        if (this.offset + length > __privateGet(this, _view).byteLength) {
          throw new Error(`Key-value pairs length ${length} exceeds bounds of buffer`);
        }
        const result = [];
        const endOffset = this.offset + length;
        try {
          while (this.offset < endOffset) {
            result.push([readKey(this), readValue(this)]);
          }
        } catch (err) {
          throw new Error(`Error reading key-value pairs: ${err.message}`);
        }
        if (this.offset !== endOffset) {
          throw new Error(`Key-value pairs length (${this.offset - endOffset + length}) greater than expected (${length})`);
        }
        return result;
      }
      map(readKey, readValue) {
        const length = this.uint32();
        if (this.offset + length > __privateGet(this, _view).byteLength) {
          throw new Error(`Map length ${length} exceeds bounds of buffer`);
        }
        const result = /* @__PURE__ */ new Map();
        const endOffset = this.offset + length;
        try {
          while (this.offset < endOffset) {
            const key = readKey(this);
            const value = readValue(this);
            const existingValue = result.get(key);
            if (existingValue != void 0) {
              throw new Error(`Duplicate key ${String(key)} (${String(existingValue)} vs ${String(value)})`);
            }
            result.set(key, value);
          }
        } catch (err) {
          throw new Error(`Error reading map: ${err.message}`);
        }
        if (this.offset !== endOffset) {
          throw new Error(`Map length (${this.offset - endOffset + length}) greater than expected (${length})`);
        }
        return result;
      }
    }
    _view = new WeakMap();
    const MCAP_MAGIC = Object.freeze([137, 77, 67, 65, 80, 48, 13, 10]);
    var Opcode;
    (function(Opcode2) {
      Opcode2[Opcode2["MIN"] = 1] = "MIN";
      Opcode2[Opcode2["HEADER"] = 1] = "HEADER";
      Opcode2[Opcode2["FOOTER"] = 2] = "FOOTER";
      Opcode2[Opcode2["SCHEMA"] = 3] = "SCHEMA";
      Opcode2[Opcode2["CHANNEL"] = 4] = "CHANNEL";
      Opcode2[Opcode2["MESSAGE"] = 5] = "MESSAGE";
      Opcode2[Opcode2["CHUNK"] = 6] = "CHUNK";
      Opcode2[Opcode2["MESSAGE_INDEX"] = 7] = "MESSAGE_INDEX";
      Opcode2[Opcode2["CHUNK_INDEX"] = 8] = "CHUNK_INDEX";
      Opcode2[Opcode2["ATTACHMENT"] = 9] = "ATTACHMENT";
      Opcode2[Opcode2["ATTACHMENT_INDEX"] = 10] = "ATTACHMENT_INDEX";
      Opcode2[Opcode2["STATISTICS"] = 11] = "STATISTICS";
      Opcode2[Opcode2["METADATA"] = 12] = "METADATA";
      Opcode2[Opcode2["METADATA_INDEX"] = 13] = "METADATA_INDEX";
      Opcode2[Opcode2["SUMMARY_OFFSET"] = 14] = "SUMMARY_OFFSET";
      Opcode2[Opcode2["DATA_END"] = 15] = "DATA_END";
      Opcode2[Opcode2["MAX"] = 15] = "MAX";
    })(Opcode || (Opcode = {}));
    function isKnownOpcode(opcode) {
      return opcode >= Opcode.MIN && opcode <= Opcode.MAX;
    }
    function parseMagic(view, startOffset) {
      if (startOffset + MCAP_MAGIC.length > view.byteLength) {
        return { usedBytes: 0 };
      }
      if (!MCAP_MAGIC.every((val, i) => val === view.getUint8(startOffset + i))) {
        throw new Error(`Expected MCAP magic '${MCAP_MAGIC.map((val) => val.toString(16).padStart(2, "0")).join(" ")}', found '${Array.from(MCAP_MAGIC, (_, i) => view.getUint8(startOffset + i).toString(16).padStart(2, "0")).join(" ")}'`);
      }
      return {
        magic: { specVersion: "0" },
        usedBytes: MCAP_MAGIC.length
      };
    }
    function parseRecord({ view, startOffset, validateCrcs }) {
      if (startOffset + 1 + 8 >= view.byteLength) {
        return { usedBytes: 0 };
      }
      const headerReader = new Reader$2(view, startOffset);
      const opcode = headerReader.uint8();
      const recordLength = headerReader.uint64();
      if (recordLength > Number.MAX_SAFE_INTEGER) {
        throw new Error(`Record content length ${recordLength} is too large`);
      }
      const recordLengthNum = Number(recordLength);
      const recordEndOffset = headerReader.offset + recordLengthNum;
      if (recordEndOffset > view.byteLength) {
        return { usedBytes: 0 };
      }
      if (!isKnownOpcode(opcode)) {
        const record = {
          type: "Unknown",
          opcode,
          data: new Uint8Array(view.buffer, view.byteOffset + headerReader.offset, recordLengthNum)
        };
        return { record, usedBytes: recordEndOffset - startOffset };
      }
      const recordView = new DataView(view.buffer, view.byteOffset + headerReader.offset, recordLengthNum);
      const reader2 = new Reader$2(recordView);
      switch (opcode) {
        case Opcode.HEADER: {
          const profile = reader2.string();
          const library = reader2.string();
          const record = { type: "Header", profile, library };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.FOOTER: {
          const summaryStart = reader2.uint64();
          const summaryOffsetStart = reader2.uint64();
          const summaryCrc = reader2.uint32();
          const record = {
            type: "Footer",
            summaryStart,
            summaryOffsetStart,
            summaryCrc
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.SCHEMA: {
          const id = reader2.uint16();
          const name = reader2.string();
          const encoding = reader2.string();
          const dataLen = reader2.uint32();
          if (reader2.offset + dataLen > recordView.byteLength) {
            throw new Error(`Schema data length ${dataLen} exceeds bounds of record`);
          }
          const data = new Uint8Array(recordView.buffer.slice(recordView.byteOffset + reader2.offset, recordView.byteOffset + reader2.offset + dataLen));
          reader2.offset += dataLen;
          const record = {
            type: "Schema",
            id,
            encoding,
            name,
            data
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.CHANNEL: {
          const channelId = reader2.uint16();
          const schemaId = reader2.uint16();
          const topicName = reader2.string();
          const messageEncoding = reader2.string();
          const metadata = reader2.map((r) => r.string(), (r) => r.string());
          const record = {
            type: "Channel",
            id: channelId,
            schemaId,
            topic: topicName,
            messageEncoding,
            metadata
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.MESSAGE: {
          const channelId = reader2.uint16();
          const sequence = reader2.uint32();
          const logTime = reader2.uint64();
          const publishTime = reader2.uint64();
          const data = new Uint8Array(recordView.buffer.slice(recordView.byteOffset + reader2.offset, recordView.byteOffset + recordView.byteLength));
          const record = {
            type: "Message",
            channelId,
            sequence,
            logTime,
            publishTime,
            data
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.CHUNK: {
          const startTime = reader2.uint64();
          const endTime = reader2.uint64();
          const uncompressedSize = reader2.uint64();
          const uncompressedCrc = reader2.uint32();
          const compression = reader2.string();
          const recordByteLength = Number(reader2.uint64());
          if (recordByteLength + reader2.offset > recordView.byteLength) {
            throw new Error("Chunk records length exceeds remaining record size");
          }
          const records = new Uint8Array(recordView.buffer.slice(recordView.byteOffset + reader2.offset, recordView.byteOffset + reader2.offset + recordByteLength));
          const record = {
            type: "Chunk",
            messageStartTime: startTime,
            messageEndTime: endTime,
            compression,
            uncompressedSize,
            uncompressedCrc,
            records
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.MESSAGE_INDEX: {
          const channelId = reader2.uint16();
          const records = reader2.keyValuePairs((r) => r.uint64(), (r) => r.uint64());
          const record = {
            type: "MessageIndex",
            channelId,
            records
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.CHUNK_INDEX: {
          const messageStartTime = reader2.uint64();
          const messageEndTime = reader2.uint64();
          const chunkStartOffset = reader2.uint64();
          const chunkLength = reader2.uint64();
          const messageIndexOffsets = reader2.map((r) => r.uint16(), (r) => r.uint64());
          const messageIndexLength = reader2.uint64();
          const compression = reader2.string();
          const compressedSize = reader2.uint64();
          const uncompressedSize = reader2.uint64();
          const record = {
            type: "ChunkIndex",
            messageStartTime,
            messageEndTime,
            chunkStartOffset,
            chunkLength,
            messageIndexOffsets,
            messageIndexLength,
            compression,
            compressedSize,
            uncompressedSize
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.ATTACHMENT: {
          const logTime = reader2.uint64();
          const createTime = reader2.uint64();
          const name = reader2.string();
          const mediaType = reader2.string();
          const dataLen = reader2.uint64();
          if (BigInt(recordView.byteOffset + reader2.offset) + dataLen > Number.MAX_SAFE_INTEGER) {
            throw new Error(`Attachment too large: ${dataLen}`);
          }
          if (reader2.offset + Number(dataLen) + 4 > recordView.byteLength) {
            throw new Error(`Attachment data length ${dataLen} exceeds bounds of record`);
          }
          const data = new Uint8Array(recordView.buffer.slice(recordView.byteOffset + reader2.offset, recordView.byteOffset + reader2.offset + Number(dataLen)));
          reader2.offset += Number(dataLen);
          const crcLength = reader2.offset;
          const expectedCrc = reader2.uint32();
          if (validateCrcs && expectedCrc !== 0) {
            const actualCrc = crc32(new DataView(recordView.buffer, recordView.byteOffset, crcLength));
            if (actualCrc !== expectedCrc) {
              throw new Error(`Attachment CRC32 mismatch: expected ${expectedCrc}, actual ${actualCrc}`);
            }
          }
          const record = {
            type: "Attachment",
            logTime,
            createTime,
            name,
            mediaType,
            data
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.ATTACHMENT_INDEX: {
          const offset = reader2.uint64();
          const length = reader2.uint64();
          const logTime = reader2.uint64();
          const createTime = reader2.uint64();
          const dataSize = reader2.uint64();
          const name = reader2.string();
          const mediaType = reader2.string();
          const record = {
            type: "AttachmentIndex",
            offset,
            length,
            logTime,
            createTime,
            dataSize,
            name,
            mediaType
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.STATISTICS: {
          const messageCount = reader2.uint64();
          const schemaCount = reader2.uint16();
          const channelCount = reader2.uint32();
          const attachmentCount = reader2.uint32();
          const metadataCount = reader2.uint32();
          const chunkCount = reader2.uint32();
          const messageStartTime = reader2.uint64();
          const messageEndTime = reader2.uint64();
          const channelMessageCounts = reader2.map((r) => r.uint16(), (r) => r.uint64());
          const record = {
            type: "Statistics",
            messageCount,
            schemaCount,
            channelCount,
            attachmentCount,
            metadataCount,
            chunkCount,
            messageStartTime,
            messageEndTime,
            channelMessageCounts
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.METADATA: {
          const name = reader2.string();
          const metadata = reader2.map((r) => r.string(), (r) => r.string());
          const record = { type: "Metadata", metadata, name };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.METADATA_INDEX: {
          const offset = reader2.uint64();
          const length = reader2.uint64();
          const name = reader2.string();
          const record = {
            type: "MetadataIndex",
            offset,
            length,
            name
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.SUMMARY_OFFSET: {
          const groupOpcode = reader2.uint8();
          const groupStart = reader2.uint64();
          const groupLength = reader2.uint64();
          const record = {
            type: "SummaryOffset",
            groupOpcode,
            groupStart,
            groupLength
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
        case Opcode.DATA_END: {
          const dataSectionCrc = reader2.uint32();
          const record = {
            type: "DataEnd",
            dataSectionCrc
          };
          return { record, usedBytes: recordEndOffset - startOffset };
        }
      }
    }
    function sortedIndexBy(array, value, iteratee) {
      let low = 0;
      let high = array.length;
      if (high === 0) {
        return 0;
      }
      const computedValue = iteratee(value);
      while (low < high) {
        const mid = low + high >>> 1;
        const curComputedValue = iteratee(array[mid][0]);
        if (curComputedValue < computedValue) {
          low = mid + 1;
        } else {
          high = mid;
        }
      }
      return high;
    }
    class ChunkCursor {
      constructor(params) {
        __privateAdd(this, _getSortTime);
        __publicField(this, "chunkIndex");
        __privateAdd(this, _relevantChannels, void 0);
        __privateAdd(this, _startTime, void 0);
        __privateAdd(this, _endTime, void 0);
        __privateAdd(this, _reverse, void 0);
        __privateAdd(this, _messageIndexCursors, void 0);
        this.chunkIndex = params.chunkIndex;
        __privateSet(this, _relevantChannels, params.relevantChannels);
        __privateSet(this, _startTime, params.startTime);
        __privateSet(this, _endTime, params.endTime);
        __privateSet(this, _reverse, params.reverse);
        if (this.chunkIndex.messageIndexLength === 0n) {
          throw new Error(`Chunks without message indexes are not currently supported`);
        }
      }
      compare(other) {
        var _a;
        if (__privateGet(this, _reverse) !== __privateGet(other, _reverse)) {
          throw new Error("Cannot compare a reversed ChunkCursor to a non-reversed ChunkCursor");
        }
        let diff = Number(__privateMethod(this, _getSortTime, getSortTime_fn).call(this) - __privateMethod(_a = other, _getSortTime, getSortTime_fn).call(_a));
        if (diff === 0) {
          diff = Number(this.chunkIndex.chunkStartOffset - other.chunkIndex.chunkStartOffset);
        }
        return __privateGet(this, _reverse) ? -diff : diff;
      }
      hasMoreMessages() {
        if (!__privateGet(this, _messageIndexCursors)) {
          throw new Error("loadMessageIndexes() must be called before hasMore()");
        }
        return __privateGet(this, _messageIndexCursors).size() > 0;
      }
      popMessage() {
        if (!__privateGet(this, _messageIndexCursors)) {
          throw new Error("loadMessageIndexes() must be called before popMessage()");
        }
        const cursor = __privateGet(this, _messageIndexCursors).peek();
        if (!cursor) {
          throw new Error(`Unexpected popMessage() call when no more messages are available, in chunk at offset ${this.chunkIndex.chunkStartOffset}`);
        }
        const record = cursor.records[cursor.index];
        const [logTime] = record;
        if (__privateGet(this, _startTime) != void 0 && logTime < __privateGet(this, _startTime)) {
          throw new Error(`Encountered message with logTime (${logTime}) prior to startTime (${__privateGet(this, _startTime)}) in chunk at offset ${this.chunkIndex.chunkStartOffset}`);
        }
        if (__privateGet(this, _endTime) != void 0 && logTime > __privateGet(this, _endTime)) {
          throw new Error(`Encountered message with logTime (${logTime}) after endTime (${__privateGet(this, _endTime)}) in chunk at offset ${this.chunkIndex.chunkStartOffset}`);
        }
        const nextRecord = cursor.records[cursor.index + 1];
        if (nextRecord && __privateGet(this, _reverse)) {
          if (__privateGet(this, _startTime) == void 0 || nextRecord[0] >= __privateGet(this, _startTime)) {
            cursor.index++;
            __privateGet(this, _messageIndexCursors).replace(cursor);
            return record;
          }
        } else if (nextRecord) {
          if (__privateGet(this, _endTime) == void 0 || nextRecord[0] <= __privateGet(this, _endTime)) {
            cursor.index++;
            __privateGet(this, _messageIndexCursors).replace(cursor);
            return record;
          }
        }
        __privateGet(this, _messageIndexCursors).pop();
        return record;
      }
      hasMessageIndexes() {
        return __privateGet(this, _messageIndexCursors) != void 0;
      }
      async loadMessageIndexes(readable) {
        const reverse = __privateGet(this, _reverse);
        __privateSet(this, _messageIndexCursors, new Heap((a, b) => {
          const logTimeA = a.records[a.index]?.[0];
          const logTimeB = b.records[b.index]?.[0];
          if (reverse) {
            if (logTimeA == void 0) {
              return -1;
            } else if (logTimeB == void 0) {
              return 1;
            }
            return Number(logTimeB - logTimeA);
          } else {
            if (logTimeA == void 0) {
              return 1;
            } else if (logTimeB == void 0) {
              return -1;
            }
            return Number(logTimeA - logTimeB);
          }
        }));
        let messageIndexStartOffset;
        let relevantMessageIndexStartOffset;
        for (const [channelId, offset2] of this.chunkIndex.messageIndexOffsets) {
          if (messageIndexStartOffset == void 0 || offset2 < messageIndexStartOffset) {
            messageIndexStartOffset = offset2;
          }
          if (!__privateGet(this, _relevantChannels) || __privateGet(this, _relevantChannels).has(channelId)) {
            if (relevantMessageIndexStartOffset == void 0 || offset2 < relevantMessageIndexStartOffset) {
              relevantMessageIndexStartOffset = offset2;
            }
          }
        }
        if (messageIndexStartOffset == void 0 || relevantMessageIndexStartOffset == void 0) {
          return;
        }
        const messageIndexEndOffset = messageIndexStartOffset + this.chunkIndex.messageIndexLength;
        const messageIndexes = await readable.read(relevantMessageIndexStartOffset, messageIndexEndOffset - relevantMessageIndexStartOffset);
        const messageIndexesView = new DataView(messageIndexes.buffer, messageIndexes.byteOffset, messageIndexes.byteLength);
        let offset = 0;
        for (let result; result = parseRecord({ view: messageIndexesView, startOffset: offset, validateCrcs: true }), result.record; offset += result.usedBytes) {
          if (result.record.type !== "MessageIndex") {
            continue;
          }
          if (result.record.records.length === 0 || __privateGet(this, _relevantChannels) && !__privateGet(this, _relevantChannels).has(result.record.channelId)) {
            continue;
          }
          result.record.records.sort(([logTimeA], [logTimeB]) => Number(logTimeA - logTimeB));
          if (reverse) {
            result.record.records.reverse();
          }
          for (const [logTime] of result.record.records) {
            if (logTime < this.chunkIndex.messageStartTime) {
              throw new Error(`Encountered message index entry in channel ${result.record.channelId} with logTime (${logTime}) earlier than chunk messageStartTime (${this.chunkIndex.messageStartTime}) in chunk at offset ${this.chunkIndex.chunkStartOffset}`);
            }
            if (logTime > this.chunkIndex.messageEndTime) {
              throw new Error(`Encountered message index entry in channel ${result.record.channelId} with logTime (${logTime}) later than chunk messageEndTime (${this.chunkIndex.messageEndTime}) in chunk at offset ${this.chunkIndex.chunkStartOffset}`);
            }
          }
          let startIndex = 0;
          if (reverse) {
            if (__privateGet(this, _endTime) != void 0) {
              startIndex = sortedIndexBy(result.record.records, __privateGet(this, _endTime), (logTime) => -logTime);
            }
          } else {
            if (__privateGet(this, _startTime) != void 0) {
              startIndex = sortedIndexBy(result.record.records, __privateGet(this, _startTime), (logTime) => logTime);
            }
          }
          if (startIndex >= result.record.records.length) {
            continue;
          }
          if (reverse) {
            if (__privateGet(this, _startTime) != void 0 && result.record.records[startIndex][0] < __privateGet(this, _startTime)) {
              continue;
            }
          } else {
            if (__privateGet(this, _endTime) != void 0 && result.record.records[startIndex][0] > __privateGet(this, _endTime)) {
              continue;
            }
          }
          __privateGet(this, _messageIndexCursors).push({
            index: startIndex,
            channelId: result.record.channelId,
            records: result.record.records
          });
        }
        if (offset !== messageIndexesView.byteLength) {
          throw new Error(`${messageIndexesView.byteLength - offset} bytes remaining in message index section`);
        }
      }
    }
    _relevantChannels = new WeakMap();
    _startTime = new WeakMap();
    _endTime = new WeakMap();
    _reverse = new WeakMap();
    _messageIndexCursors = new WeakMap();
    _getSortTime = new WeakSet();
    getSortTime_fn = function() {
      if (!__privateGet(this, _messageIndexCursors)) {
        return __privateGet(this, _reverse) ? this.chunkIndex.messageEndTime : this.chunkIndex.messageStartTime;
      }
      const cursor = __privateGet(this, _messageIndexCursors).peek();
      if (!cursor) {
        throw new Error(`Unexpected empty cursor for chunk at offset ${this.chunkIndex.chunkStartOffset}`);
      }
      return cursor.records[cursor.index][0];
    };
    const _McapIndexedReader = class {
      constructor(args) {
        __privateAdd(this, _errorWithLibrary);
        __privateAdd(this, _loadChunkData);
        __publicField(this, "chunkIndexes");
        __publicField(this, "attachmentIndexes");
        __publicField(this, "metadataIndexes", []);
        __publicField(this, "channelsById");
        __publicField(this, "schemasById");
        __publicField(this, "statistics");
        __publicField(this, "summaryOffsetsByOpcode");
        __publicField(this, "header");
        __publicField(this, "footer");
        __privateAdd(this, _readable, void 0);
        __privateAdd(this, _decompressHandlers, void 0);
        __privateAdd(this, _messageStartTime, void 0);
        __privateAdd(this, _messageEndTime, void 0);
        __privateAdd(this, _attachmentStartTime, void 0);
        __privateAdd(this, _attachmentEndTime, void 0);
        __privateSet(this, _readable, args.readable);
        this.chunkIndexes = args.chunkIndexes;
        this.attachmentIndexes = args.attachmentIndexes;
        this.metadataIndexes = args.metadataIndexes;
        this.statistics = args.statistics;
        __privateSet(this, _decompressHandlers, args.decompressHandlers);
        this.channelsById = args.channelsById;
        this.schemasById = args.schemasById;
        this.summaryOffsetsByOpcode = args.summaryOffsetsByOpcode;
        this.header = args.header;
        this.footer = args.footer;
        for (const chunk of args.chunkIndexes) {
          if (__privateGet(this, _messageStartTime) == void 0 || chunk.messageStartTime < __privateGet(this, _messageStartTime)) {
            __privateSet(this, _messageStartTime, chunk.messageStartTime);
          }
          if (__privateGet(this, _messageEndTime) == void 0 || chunk.messageEndTime > __privateGet(this, _messageEndTime)) {
            __privateSet(this, _messageEndTime, chunk.messageEndTime);
          }
        }
        for (const attachment of args.attachmentIndexes) {
          if (__privateGet(this, _attachmentStartTime) == void 0 || attachment.logTime < __privateGet(this, _attachmentStartTime)) {
            __privateSet(this, _attachmentStartTime, attachment.logTime);
          }
          if (__privateGet(this, _attachmentEndTime) == void 0 || attachment.logTime > __privateGet(this, _attachmentEndTime)) {
            __privateSet(this, _attachmentEndTime, attachment.logTime);
          }
        }
      }
      static async Initialize({ readable, decompressHandlers }) {
        const size = await readable.size();
        let header;
        {
          const headerPrefix = await readable.read(0n, BigInt(MCAP_MAGIC.length + 1 + 8));
          const headerPrefixView = new DataView(headerPrefix.buffer, headerPrefix.byteOffset, headerPrefix.byteLength);
          void parseMagic(headerPrefixView, 0);
          const headerLength = headerPrefixView.getBigUint64(MCAP_MAGIC.length + 1, true);
          const headerRecord = await readable.read(
            BigInt(MCAP_MAGIC.length),
            1n + 8n + headerLength
          );
          const headerResult = parseRecord({
            view: new DataView(headerRecord.buffer, headerRecord.byteOffset, headerRecord.byteLength),
            startOffset: 0,
            validateCrcs: true
          });
          if (headerResult.record?.type !== "Header") {
            throw new Error(`Unable to read header at beginning of file; found ${headerResult.record?.type ?? "nothing"}`);
          }
          if (headerResult.usedBytes !== headerRecord.byteLength) {
            throw new Error(`${headerRecord.byteLength - headerResult.usedBytes} bytes remaining after parsing header`);
          }
          header = headerResult.record;
        }
        function errorWithLibrary(message2) {
          return new Error(`${message2} [library=${header.library}]`);
        }
        let footerOffset;
        let footerAndMagicView;
        {
          const headerLengthLowerBound = BigInt(MCAP_MAGIC.length + 1 + 8 + 4 + 4);
          const footerAndMagicReadLength = BigInt(
            1 + 8 + 8 + 8 + 4 + MCAP_MAGIC.length
          );
          if (size < headerLengthLowerBound + footerAndMagicReadLength) {
            throw errorWithLibrary(`File size (${size}) is too small to be valid MCAP`);
          }
          footerOffset = size - footerAndMagicReadLength;
          const footerBuffer = await readable.read(footerOffset, footerAndMagicReadLength);
          footerAndMagicView = new DataView(footerBuffer.buffer, footerBuffer.byteOffset, footerBuffer.byteLength);
        }
        try {
          void parseMagic(footerAndMagicView, footerAndMagicView.byteLength - MCAP_MAGIC.length);
        } catch (error) {
          throw errorWithLibrary(error.message);
        }
        let footer;
        {
          const footerResult = parseRecord({
            view: footerAndMagicView,
            startOffset: 0,
            validateCrcs: true
          });
          if (footerResult.record?.type !== "Footer") {
            throw errorWithLibrary(`Unable to read footer from end of file (offset ${footerOffset}); found ${footerResult.record?.type ?? "nothing"}`);
          }
          if (footerResult.usedBytes !== footerAndMagicView.byteLength - MCAP_MAGIC.length) {
            throw errorWithLibrary(`${footerAndMagicView.byteLength - MCAP_MAGIC.length - footerResult.usedBytes} bytes remaining after parsing footer`);
          }
          footer = footerResult.record;
        }
        if (footer.summaryStart === 0n) {
          throw errorWithLibrary("File is not indexed");
        }
        const footerPrefix = new Uint8Array(
          1 + 8 + 8 + 8
        );
        footerPrefix.set(new Uint8Array(footerAndMagicView.buffer, footerAndMagicView.byteOffset, footerPrefix.byteLength));
        const allSummaryData = await readable.read(footer.summaryStart, footerOffset - footer.summaryStart);
        if (footer.summaryCrc !== 0) {
          let summaryCrc = crc32Init();
          summaryCrc = crc32Update(summaryCrc, allSummaryData);
          summaryCrc = crc32Update(summaryCrc, footerPrefix);
          summaryCrc = crc32Final(summaryCrc);
          if (summaryCrc !== footer.summaryCrc) {
            throw errorWithLibrary(`Incorrect summary CRC ${summaryCrc} (expected ${footer.summaryCrc})`);
          }
        }
        const indexView = new DataView(allSummaryData.buffer, allSummaryData.byteOffset, allSummaryData.byteLength);
        const channelsById = /* @__PURE__ */ new Map();
        const schemasById = /* @__PURE__ */ new Map();
        const chunkIndexes = [];
        const attachmentIndexes = [];
        const metadataIndexes = [];
        const summaryOffsetsByOpcode = /* @__PURE__ */ new Map();
        let statistics;
        let offset = 0;
        for (let result; result = parseRecord({ view: indexView, startOffset: offset, validateCrcs: true }), result.record; offset += result.usedBytes) {
          switch (result.record.type) {
            case "Schema":
              schemasById.set(result.record.id, result.record);
              break;
            case "Channel":
              channelsById.set(result.record.id, result.record);
              break;
            case "ChunkIndex":
              chunkIndexes.push(result.record);
              break;
            case "AttachmentIndex":
              attachmentIndexes.push(result.record);
              break;
            case "MetadataIndex":
              metadataIndexes.push(result.record);
              break;
            case "Statistics":
              if (statistics) {
                throw errorWithLibrary("Duplicate Statistics record");
              }
              statistics = result.record;
              break;
            case "SummaryOffset":
              summaryOffsetsByOpcode.set(result.record.groupOpcode, result.record);
              break;
            case "Header":
            case "Footer":
            case "Message":
            case "Chunk":
            case "MessageIndex":
            case "Attachment":
            case "Metadata":
            case "DataEnd":
              throw errorWithLibrary(`${result.record.type} record not allowed in index section`);
          }
        }
        if (offset !== indexView.byteLength) {
          throw errorWithLibrary(`${indexView.byteLength - offset} bytes remaining in index section`);
        }
        return new _McapIndexedReader({
          readable,
          chunkIndexes,
          attachmentIndexes,
          metadataIndexes,
          statistics,
          decompressHandlers,
          channelsById,
          schemasById,
          summaryOffsetsByOpcode,
          header,
          footer
        });
      }
      async *readMessages(args = {}) {
        const { topics, startTime = __privateGet(this, _messageStartTime), endTime = __privateGet(this, _messageEndTime), reverse = false, validateCrcs } = args;
        if (startTime == void 0 || endTime == void 0) {
          return;
        }
        let relevantChannels;
        if (topics) {
          relevantChannels = /* @__PURE__ */ new Set();
          for (const channel of this.channelsById.values()) {
            if (topics.includes(channel.topic)) {
              relevantChannels.add(channel.id);
            }
          }
        }
        const chunkCursors = new Heap((a, b) => a.compare(b));
        let chunksOrdered = true;
        let prevChunkEndTime;
        for (const chunkIndex of this.chunkIndexes) {
          if (chunkIndex.messageStartTime <= endTime && chunkIndex.messageEndTime >= startTime) {
            chunkCursors.push(new ChunkCursor({ chunkIndex, relevantChannels, startTime, endTime, reverse }));
            if (chunksOrdered && prevChunkEndTime != void 0) {
              chunksOrdered = chunkIndex.messageStartTime >= prevChunkEndTime;
            }
            prevChunkEndTime = chunkIndex.messageEndTime;
          }
        }
        const chunkViewCache = /* @__PURE__ */ new Map();
        for (let cursor; cursor = chunkCursors.peek(); ) {
          if (!cursor.hasMessageIndexes()) {
            await cursor.loadMessageIndexes(__privateGet(this, _readable));
            if (cursor.hasMoreMessages()) {
              chunkCursors.replace(cursor);
            } else {
              chunkCursors.pop();
            }
            continue;
          }
          let chunkView = chunkViewCache.get(cursor.chunkIndex.chunkStartOffset);
          if (!chunkView) {
            chunkView = await __privateMethod(this, _loadChunkData, loadChunkData_fn).call(this, cursor.chunkIndex, {
              validateCrcs: validateCrcs ?? true
            });
            chunkViewCache.set(cursor.chunkIndex.chunkStartOffset, chunkView);
          }
          const [logTime, offset] = cursor.popMessage();
          if (offset >= BigInt(chunkView.byteLength)) {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Message offset beyond chunk bounds (log time ${logTime}, offset ${offset}, chunk data length ${chunkView.byteLength}) in chunk at offset ${cursor.chunkIndex.chunkStartOffset}`);
          }
          const result = parseRecord({
            view: chunkView,
            startOffset: Number(offset),
            validateCrcs: validateCrcs ?? true
          });
          if (!result.record) {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Unable to parse record at offset ${offset} in chunk at offset ${cursor.chunkIndex.chunkStartOffset}`);
          }
          if (result.record.type !== "Message") {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Unexpected record type ${result.record.type} in message index (time ${logTime}, offset ${offset} in chunk at offset ${cursor.chunkIndex.chunkStartOffset})`);
          }
          if (result.record.logTime !== logTime) {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Message log time ${result.record.logTime} did not match message index entry (${logTime} at offset ${offset} in chunk at offset ${cursor.chunkIndex.chunkStartOffset})`);
          }
          yield result.record;
          if (cursor.hasMoreMessages()) {
            if (!chunksOrdered) {
              chunkCursors.replace(cursor);
            }
          } else {
            chunkCursors.pop();
            chunkViewCache.delete(cursor.chunkIndex.chunkStartOffset);
          }
        }
      }
      async *readMetadata(args = {}) {
        const { name } = args;
        for (const metadataIndex of this.metadataIndexes) {
          if (name != void 0 && metadataIndex.name !== name) {
            continue;
          }
          const metadataData = await __privateGet(this, _readable).read(metadataIndex.offset, metadataIndex.length);
          const metadataResult = parseRecord({
            view: new DataView(metadataData.buffer, metadataData.byteOffset, metadataData.byteLength),
            startOffset: 0,
            validateCrcs: false
          });
          if (metadataResult.record?.type !== "Metadata") {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Metadata data at offset ${metadataIndex.offset} does not point to metadata record (found ${String(metadataResult.record?.type)})`);
          }
          yield metadataResult.record;
        }
      }
      async *readAttachments(args = {}) {
        const { name, mediaType, startTime = __privateGet(this, _attachmentStartTime), endTime = __privateGet(this, _attachmentEndTime), validateCrcs } = args;
        if (startTime == void 0 || endTime == void 0) {
          return;
        }
        for (const attachmentIndex of this.attachmentIndexes) {
          if (name != void 0 && attachmentIndex.name !== name) {
            continue;
          }
          if (mediaType != void 0 && attachmentIndex.mediaType !== mediaType) {
            continue;
          }
          if (attachmentIndex.logTime > endTime || attachmentIndex.logTime < startTime) {
            continue;
          }
          const attachmentData = await __privateGet(this, _readable).read(attachmentIndex.offset, attachmentIndex.length);
          const attachmentResult = parseRecord({
            view: new DataView(attachmentData.buffer, attachmentData.byteOffset, attachmentData.byteLength),
            startOffset: 0,
            validateCrcs: validateCrcs ?? true
          });
          if (attachmentResult.record?.type !== "Attachment") {
            throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Attachment data at offset ${attachmentIndex.offset} does not point to attachment record (found ${String(attachmentResult.record?.type)})`);
          }
          yield attachmentResult.record;
        }
      }
    };
    let McapIndexedReader = _McapIndexedReader;
    _readable = new WeakMap();
    _decompressHandlers = new WeakMap();
    _messageStartTime = new WeakMap();
    _messageEndTime = new WeakMap();
    _attachmentStartTime = new WeakMap();
    _attachmentEndTime = new WeakMap();
    _errorWithLibrary = new WeakSet();
    errorWithLibrary_fn = function(message2) {
      return new Error(`${message2} [library=${this.header.library}]`);
    };
    _loadChunkData = new WeakSet();
    loadChunkData_fn = async function(chunkIndex, options) {
      const chunkData = await __privateGet(this, _readable).read(chunkIndex.chunkStartOffset, chunkIndex.chunkLength);
      const chunkResult = parseRecord({
        view: new DataView(chunkData.buffer, chunkData.byteOffset, chunkData.byteLength),
        startOffset: 0,
        validateCrcs: options?.validateCrcs ?? true
      });
      if (chunkResult.record?.type !== "Chunk") {
        throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Chunk start offset ${chunkIndex.chunkStartOffset} does not point to chunk record (found ${String(chunkResult.record?.type)})`);
      }
      const chunk = chunkResult.record;
      let buffer = chunk.records;
      if (chunk.compression !== "" && buffer.byteLength > 0) {
        const decompress = __privateGet(this, _decompressHandlers)?.[chunk.compression];
        if (!decompress) {
          throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Unsupported compression ${chunk.compression}`);
        }
        buffer = decompress(buffer, chunk.uncompressedSize);
      }
      if (chunk.uncompressedCrc !== 0 && options?.validateCrcs !== false) {
        const chunkCrc = crc32(buffer);
        if (chunkCrc !== chunk.uncompressedCrc) {
          throw __privateMethod(this, _errorWithLibrary, errorWithLibrary_fn).call(this, `Incorrect chunk CRC ${chunkCrc} (expected ${chunk.uncompressedCrc})`);
        }
      }
      return new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    };
    class StreamBuffer {
      constructor(initialCapacity = 0) {
        __privateAdd(this, _buffer, void 0);
        __publicField(this, "view");
        __privateSet(this, _buffer, new ArrayBuffer(initialCapacity));
        this.view = new DataView(__privateGet(this, _buffer), 0, 0);
      }
      bytesRemaining() {
        return this.view.byteLength;
      }
      consume(count) {
        this.view = new DataView(__privateGet(this, _buffer), this.view.byteOffset + count, this.view.byteLength - count);
      }
      append(data) {
        if (this.view.byteOffset + this.view.byteLength + data.byteLength <= __privateGet(this, _buffer).byteLength) {
          const array = new Uint8Array(this.view.buffer, this.view.byteOffset);
          array.set(data, this.view.byteLength);
          this.view = new DataView(__privateGet(this, _buffer), this.view.byteOffset, this.view.byteLength + data.byteLength);
        } else if (this.view.byteLength + data.byteLength <= __privateGet(this, _buffer).byteLength) {
          const oldData = new Uint8Array(__privateGet(this, _buffer), this.view.byteOffset, this.view.byteLength);
          const array = new Uint8Array(__privateGet(this, _buffer));
          array.set(oldData, 0);
          array.set(data, oldData.byteLength);
          this.view = new DataView(__privateGet(this, _buffer), 0, this.view.byteLength + data.byteLength);
        } else {
          const oldData = new Uint8Array(__privateGet(this, _buffer), this.view.byteOffset, this.view.byteLength);
          __privateSet(this, _buffer, new ArrayBuffer((this.view.byteLength + data.byteLength) * 2));
          const array = new Uint8Array(__privateGet(this, _buffer));
          array.set(oldData, 0);
          array.set(data, oldData.byteLength);
          this.view = new DataView(__privateGet(this, _buffer), 0, this.view.byteLength + data.byteLength);
        }
      }
    }
    _buffer = new WeakMap();
    class McapStreamReader {
      constructor({ includeChunks = false, decompressHandlers = {}, validateCrcs = true, noMagicPrefix = false } = {}) {
        __privateAdd(this, _read);
        __privateAdd(this, _buffer2, new StreamBuffer(MCAP_MAGIC.length * 2));
        __privateAdd(this, _decompressHandlers2, void 0);
        __privateAdd(this, _includeChunks, void 0);
        __privateAdd(this, _validateCrcs, void 0);
        __privateAdd(this, _noMagicPrefix, void 0);
        __privateAdd(this, _doneReading, false);
        __privateAdd(this, _generator, __privateMethod(this, _read, read_fn).call(this));
        __privateAdd(this, _channelsById, /* @__PURE__ */ new Map());
        __privateSet(this, _includeChunks, includeChunks);
        __privateSet(this, _decompressHandlers2, decompressHandlers);
        __privateSet(this, _validateCrcs, validateCrcs);
        __privateSet(this, _noMagicPrefix, noMagicPrefix);
      }
      done() {
        return __privateGet(this, _doneReading);
      }
      bytesRemaining() {
        return __privateGet(this, _buffer2).bytesRemaining();
      }
      append(data) {
        if (__privateGet(this, _doneReading)) {
          throw new Error("Already done reading");
        }
        __privateGet(this, _buffer2).append(data);
      }
      nextRecord() {
        if (__privateGet(this, _doneReading)) {
          return void 0;
        }
        const result = __privateGet(this, _generator).next();
        if (result.value?.type === "Channel") {
          const existing = __privateGet(this, _channelsById).get(result.value.id);
          __privateGet(this, _channelsById).set(result.value.id, result.value);
          if (existing && !isChannelEqual(existing, result.value)) {
            throw new Error(`Channel record for id ${result.value.id} (topic: ${result.value.topic}) differs from previous channel record of the same id.`);
          }
        } else if (result.value?.type === "Message") {
          const channelId = result.value.channelId;
          const existing = __privateGet(this, _channelsById).get(channelId);
          if (!existing) {
            throw new Error(`Encountered message on channel ${channelId} without prior channel record`);
          }
        }
        if (result.done === true) {
          __privateSet(this, _doneReading, true);
        }
        return result.value;
      }
    }
    _buffer2 = new WeakMap();
    _decompressHandlers2 = new WeakMap();
    _includeChunks = new WeakMap();
    _validateCrcs = new WeakMap();
    _noMagicPrefix = new WeakMap();
    _doneReading = new WeakMap();
    _generator = new WeakMap();
    _channelsById = new WeakMap();
    _read = new WeakSet();
    read_fn = function* () {
      if (!__privateGet(this, _noMagicPrefix)) {
        let magic, usedBytes;
        while ({ magic, usedBytes } = parseMagic(__privateGet(this, _buffer2).view, 0), !magic) {
          yield;
        }
        __privateGet(this, _buffer2).consume(usedBytes);
      }
      let header;
      function errorWithLibrary(message2) {
        return new Error(`${message2} ${header ? `[library=${header.library}]` : "[no header]"}`);
      }
      for (; ; ) {
        let record;
        {
          let usedBytes;
          while ({ record, usedBytes } = parseRecord({
            view: __privateGet(this, _buffer2).view,
            startOffset: 0,
            validateCrcs: __privateGet(this, _validateCrcs)
          }), !record) {
            yield;
          }
          __privateGet(this, _buffer2).consume(usedBytes);
        }
        switch (record.type) {
          case "Unknown":
            break;
          case "Header":
            if (header) {
              throw new Error(`Duplicate Header record: library=${header.library} profile=${header.profile} vs. library=${record.library} profile=${record.profile}`);
            }
            header = record;
            yield record;
            break;
          case "Schema":
          case "Channel":
          case "Message":
          case "MessageIndex":
          case "ChunkIndex":
          case "Attachment":
          case "AttachmentIndex":
          case "Statistics":
          case "Metadata":
          case "MetadataIndex":
          case "SummaryOffset":
          case "DataEnd":
            yield record;
            break;
          case "Chunk": {
            if (__privateGet(this, _includeChunks)) {
              yield record;
            }
            let buffer = record.records;
            if (record.compression !== "" && buffer.byteLength > 0) {
              const decompress = __privateGet(this, _decompressHandlers2)[record.compression];
              if (!decompress) {
                throw errorWithLibrary(`Unsupported compression ${record.compression}`);
              }
              buffer = decompress(buffer, record.uncompressedSize);
            }
            if (__privateGet(this, _validateCrcs) && record.uncompressedCrc !== 0) {
              const chunkCrc = crc32(buffer);
              if (chunkCrc !== record.uncompressedCrc) {
                throw errorWithLibrary(`Incorrect chunk CRC ${chunkCrc} (expected ${record.uncompressedCrc})`);
              }
            }
            const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
            let chunkOffset = 0;
            for (let chunkResult; chunkResult = parseRecord({
              view,
              startOffset: chunkOffset,
              validateCrcs: __privateGet(this, _validateCrcs)
            }), chunkResult.record; chunkOffset += chunkResult.usedBytes) {
              switch (chunkResult.record.type) {
                case "Unknown":
                  break;
                case "Header":
                case "Footer":
                case "Chunk":
                case "MessageIndex":
                case "ChunkIndex":
                case "Attachment":
                case "AttachmentIndex":
                case "Statistics":
                case "Metadata":
                case "MetadataIndex":
                case "SummaryOffset":
                case "DataEnd":
                  throw errorWithLibrary(`${chunkResult.record.type} record not allowed inside a chunk`);
                case "Schema":
                case "Channel":
                case "Message":
                  yield chunkResult.record;
                  break;
              }
            }
            if (chunkOffset !== buffer.byteLength) {
              throw errorWithLibrary(`${buffer.byteLength - chunkOffset} bytes remaining in chunk`);
            }
            break;
          }
          case "Footer":
            try {
              let magic, usedBytes;
              while ({ magic, usedBytes } = parseMagic(__privateGet(this, _buffer2).view, 0), !magic) {
                yield;
              }
              __privateGet(this, _buffer2).consume(usedBytes);
            } catch (error) {
              throw errorWithLibrary(error.message);
            }
            if (__privateGet(this, _buffer2).bytesRemaining() !== 0) {
              throw errorWithLibrary(`${__privateGet(this, _buffer2).bytesRemaining()} bytes remaining after MCAP footer and trailing magic`);
            }
            return record;
        }
      }
    };
    function isChannelEqual(a, b) {
      if (!(a.id === b.id && a.messageEncoding === b.messageEncoding && a.schemaId === b.schemaId && a.topic === b.topic && a.metadata.size === b.metadata.size)) {
        return false;
      }
      for (const [keyA, valueA] of a.metadata.entries()) {
        const valueB = b.metadata.get(keyA);
        if (valueA !== valueB) {
          return false;
        }
      }
      return true;
    }
    var base64$1 = {};
    (function(exports2) {
      var base642 = exports2;
      base642.length = function length(string2) {
        var p = string2.length;
        if (!p)
          return 0;
        var n = 0;
        while (--p % 4 > 1 && string2.charAt(p) === "=")
          ++n;
        return Math.ceil(string2.length * 3) / 4 - n;
      };
      var b64 = new Array(64);
      var s64 = new Array(123);
      for (var i = 0; i < 64; )
        s64[b64[i] = i < 26 ? i + 65 : i < 52 ? i + 71 : i < 62 ? i - 4 : i - 59 | 43] = i++;
      base642.encode = function encode(buffer, start, end) {
        var parts = null, chunk = [];
        var i2 = 0, j = 0, t;
        while (start < end) {
          var b = buffer[start++];
          switch (j) {
            case 0:
              chunk[i2++] = b64[b >> 2];
              t = (b & 3) << 4;
              j = 1;
              break;
            case 1:
              chunk[i2++] = b64[t | b >> 4];
              t = (b & 15) << 2;
              j = 2;
              break;
            case 2:
              chunk[i2++] = b64[t | b >> 6];
              chunk[i2++] = b64[b & 63];
              j = 0;
              break;
          }
          if (i2 > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i2 = 0;
          }
        }
        if (j) {
          chunk[i2++] = b64[t];
          chunk[i2++] = 61;
          if (j === 1)
            chunk[i2++] = 61;
        }
        if (parts) {
          if (i2)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i2)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i2));
      };
      var invalidEncoding = "invalid encoding";
      base642.decode = function decode(string2, buffer, offset) {
        var start = offset;
        var j = 0, t;
        for (var i2 = 0; i2 < string2.length; ) {
          var c = string2.charCodeAt(i2++);
          if (c === 61 && j > 1)
            break;
          if ((c = s64[c]) === void 0)
            throw Error(invalidEncoding);
          switch (j) {
            case 0:
              t = c;
              j = 1;
              break;
            case 1:
              buffer[offset++] = t << 2 | (c & 48) >> 4;
              t = c;
              j = 2;
              break;
            case 2:
              buffer[offset++] = (t & 15) << 4 | (c & 60) >> 2;
              t = c;
              j = 3;
              break;
            case 3:
              buffer[offset++] = (t & 3) << 6 | c;
              j = 0;
              break;
          }
        }
        if (j === 1)
          throw Error(invalidEncoding);
        return offset - start;
      };
      base642.test = function test(string2) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(string2);
      };
    })(base64$1);
    function parseJsonSchema(rootJsonSchema, rootTypeName) {
      const datatypes = /* @__PURE__ */ new Map();
      function addFieldsRecursive(schema, typeName, keyPath) {
        let postprocessObject = (value) => value;
        const fields = [];
        if (schema.type !== "object") {
          throw new Error(
            `Expected "type": "object" for schema ${typeName}, got ${JSON.stringify(schema.type)}`
          );
        }
        const properties = schema.properties ?? {};
        for (const [fieldName, fieldSchema] of Object.entries(properties)) {
          if (Array.isArray(fieldSchema.oneOf)) {
            if (fieldSchema.oneOf.every((alternative) => typeof alternative.const === "number")) {
              for (const alternative of fieldSchema.oneOf) {
                fields.push({
                  name: alternative.title,
                  type: "uint32",
                  isConstant: true,
                  value: alternative.const
                });
              }
              fields.push({ name: fieldName, type: "uint32" });
              continue;
            } else {
              throw new Error(
                `Unsupported type for ${keyPath.concat(fieldName).join(".")}: oneOf alternatives must have number values`
              );
            }
          }
          switch (fieldSchema.type) {
            case "boolean":
              fields.push({ name: fieldName, type: "bool" });
              break;
            case "string":
              switch (fieldSchema.contentEncoding) {
                case void 0:
                  fields.push({ name: fieldName, type: "string" });
                  break;
                case "base64": {
                  fields.push({ name: fieldName, type: "uint8", isArray: true });
                  const prevPostprocess = postprocessObject;
                  postprocessObject = (value) => {
                    const str = value[fieldName];
                    if (typeof str === "string") {
                      const decoded = new Uint8Array(base64$1.length(str));
                      if (base64$1.decode(str, decoded, 0) !== decoded.byteLength) {
                        throw new Error(
                          `Failed to decode base64 data for ${keyPath.concat(fieldName).join(".")}`
                        );
                      }
                      value[fieldName] = decoded;
                    }
                    return prevPostprocess(value);
                  };
                  break;
                }
                default:
                  throw new Error(
                    `Unsupported contentEncoding ${JSON.stringify(
                      fieldSchema.contentEncoding
                    )} in ${keyPath.concat(fieldName).join(".")}`
                  );
              }
              break;
            case "number":
              fields.push({ name: fieldName, type: "float64" });
              break;
            case "integer":
              fields.push({
                name: fieldName,
                type: typeof fieldSchema.minimum === "number" && fieldSchema.minimum >= 0 || typeof fieldSchema.exclusiveMinimum === "number" && fieldSchema.exclusiveMinimum >= 0 ? "uint32" : "int32"
              });
              break;
            case "object": {
              const nestedTypeName = `${typeName}.${fieldName}`;
              const postprocessNestedObject = addFieldsRecursive(
                fieldSchema,
                nestedTypeName,
                keyPath.concat(fieldName)
              );
              const prevPostprocess = postprocessObject;
              postprocessObject = (value) => {
                const fieldValue = value[fieldName];
                if (fieldValue != void 0 && typeof fieldValue === "object") {
                  value[fieldName] = postprocessNestedObject(fieldValue);
                }
                return prevPostprocess(value);
              };
              fields.push({ name: fieldName, type: nestedTypeName, isComplex: true });
              break;
            }
            case "array": {
              const itemSchema = fieldSchema.items;
              switch (itemSchema.type) {
                case "boolean":
                  fields.push({ name: fieldName, type: "bool", isArray: true });
                  break;
                case "string":
                  if (itemSchema.contentEncoding != void 0) {
                    throw new Error(
                      `Unsupported contentEncoding ${JSON.stringify(
                        itemSchema.contentEncoding
                      )} for array item ${keyPath.concat(fieldName).join(".")}`
                    );
                  }
                  fields.push({ name: fieldName, type: "string", isArray: true });
                  break;
                case "number":
                  fields.push({ name: fieldName, type: "float64", isArray: true });
                  break;
                case "integer":
                  fields.push({
                    name: fieldName,
                    type: typeof itemSchema.minimum === "number" && itemSchema.minimum >= 0 || typeof itemSchema.exclusiveMinimum === "number" && itemSchema.exclusiveMinimum >= 0 ? "uint32" : "int32",
                    isArray: true
                  });
                  break;
                case "object": {
                  const nestedTypeName = `${typeName}.${fieldName}`;
                  const postprocessArrayItem = addFieldsRecursive(
                    fieldSchema.items,
                    nestedTypeName,
                    keyPath.concat(fieldName)
                  );
                  const prevPostprocess = postprocessObject;
                  postprocessObject = (value) => {
                    const arr = value[fieldName];
                    if (Array.isArray(arr)) {
                      value[fieldName] = arr.map(postprocessArrayItem);
                    }
                    return prevPostprocess(value);
                  };
                  fields.push({
                    name: fieldName,
                    type: nestedTypeName,
                    isComplex: true,
                    isArray: true
                  });
                  break;
                }
                default:
                  throw new Error(
                    `Unsupported type ${JSON.stringify(itemSchema.type)} for array item ${keyPath.concat(fieldName).join(".")}`
                  );
              }
              break;
            }
            case "null":
            default:
              throw new Error(
                `Unsupported type ${JSON.stringify(fieldSchema.type)} for ${keyPath.concat(fieldName).join(".")}`
              );
          }
        }
        datatypes.set(typeName, { definitions: fields });
        return postprocessObject;
      }
      const postprocessValue = addFieldsRecursive(rootJsonSchema, rootTypeName, []);
      return { datatypes, postprocessValue };
    }
    var protobufjs$1 = { exports: {} };
    var src = { exports: {} };
    var indexLight = { exports: {} };
    var indexMinimal = {};
    var minimal = {};
    var aspromise = asPromise$1;
    function asPromise$1(fn, ctx) {
      var params = new Array(arguments.length - 1), offset = 0, index = 2, pending = true;
      while (index < arguments.length)
        params[offset++] = arguments[index++];
      return new Promise(function executor(resolve, reject) {
        params[offset] = function callback(err) {
          if (pending) {
            pending = false;
            if (err)
              reject(err);
            else {
              var params2 = new Array(arguments.length - 1), offset2 = 0;
              while (offset2 < params2.length)
                params2[offset2++] = arguments[offset2];
              resolve.apply(null, params2);
            }
          }
        };
        try {
          fn.apply(ctx || null, params);
        } catch (err) {
          if (pending) {
            pending = false;
            reject(err);
          }
        }
      });
    }
    var eventemitter = EventEmitter;
    function EventEmitter() {
      this._listeners = {};
    }
    EventEmitter.prototype.on = function on(evt, fn, ctx) {
      (this._listeners[evt] || (this._listeners[evt] = [])).push({
        fn,
        ctx: ctx || this
      });
      return this;
    };
    EventEmitter.prototype.off = function off(evt, fn) {
      if (evt === void 0)
        this._listeners = {};
      else {
        if (fn === void 0)
          this._listeners[evt] = [];
        else {
          var listeners = this._listeners[evt];
          for (var i = 0; i < listeners.length; )
            if (listeners[i].fn === fn)
              listeners.splice(i, 1);
            else
              ++i;
        }
      }
      return this;
    };
    EventEmitter.prototype.emit = function emit(evt) {
      var listeners = this._listeners[evt];
      if (listeners) {
        var args = [], i = 1;
        for (; i < arguments.length; )
          args.push(arguments[i++]);
        for (i = 0; i < listeners.length; )
          listeners[i].fn.apply(listeners[i++].ctx, args);
      }
      return this;
    };
    var float = factory(factory);
    function factory(exports2) {
      if (typeof Float32Array !== "undefined")
        (function() {
          var f32 = new Float32Array([-0]), f8b = new Uint8Array(f32.buffer), le = f8b[3] === 128;
          function writeFloat_f32_cpy(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
          }
          function writeFloat_f32_rev(val, buf, pos) {
            f32[0] = val;
            buf[pos] = f8b[3];
            buf[pos + 1] = f8b[2];
            buf[pos + 2] = f8b[1];
            buf[pos + 3] = f8b[0];
          }
          exports2.writeFloatLE = le ? writeFloat_f32_cpy : writeFloat_f32_rev;
          exports2.writeFloatBE = le ? writeFloat_f32_rev : writeFloat_f32_cpy;
          function readFloat_f32_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            return f32[0];
          }
          function readFloat_f32_rev(buf, pos) {
            f8b[3] = buf[pos];
            f8b[2] = buf[pos + 1];
            f8b[1] = buf[pos + 2];
            f8b[0] = buf[pos + 3];
            return f32[0];
          }
          exports2.readFloatLE = le ? readFloat_f32_cpy : readFloat_f32_rev;
          exports2.readFloatBE = le ? readFloat_f32_rev : readFloat_f32_cpy;
        })();
      else
        (function() {
          function writeFloat_ieee754(writeUint, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0)
              writeUint(1 / val > 0 ? 0 : 2147483648, buf, pos);
            else if (isNaN(val))
              writeUint(2143289344, buf, pos);
            else if (val > 34028234663852886e22)
              writeUint((sign << 31 | 2139095040) >>> 0, buf, pos);
            else if (val < 11754943508222875e-54)
              writeUint((sign << 31 | Math.round(val / 1401298464324817e-60)) >>> 0, buf, pos);
            else {
              var exponent = Math.floor(Math.log(val) / Math.LN2), mantissa = Math.round(val * Math.pow(2, -exponent) * 8388608) & 8388607;
              writeUint((sign << 31 | exponent + 127 << 23 | mantissa) >>> 0, buf, pos);
            }
          }
          exports2.writeFloatLE = writeFloat_ieee754.bind(null, writeUintLE);
          exports2.writeFloatBE = writeFloat_ieee754.bind(null, writeUintBE);
          function readFloat_ieee754(readUint, buf, pos) {
            var uint = readUint(buf, pos), sign = (uint >> 31) * 2 + 1, exponent = uint >>> 23 & 255, mantissa = uint & 8388607;
            return exponent === 255 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 1401298464324817e-60 * mantissa : sign * Math.pow(2, exponent - 150) * (mantissa + 8388608);
          }
          exports2.readFloatLE = readFloat_ieee754.bind(null, readUintLE);
          exports2.readFloatBE = readFloat_ieee754.bind(null, readUintBE);
        })();
      if (typeof Float64Array !== "undefined")
        (function() {
          var f64 = new Float64Array([-0]), f8b = new Uint8Array(f64.buffer), le = f8b[7] === 128;
          function writeDouble_f64_cpy(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[0];
            buf[pos + 1] = f8b[1];
            buf[pos + 2] = f8b[2];
            buf[pos + 3] = f8b[3];
            buf[pos + 4] = f8b[4];
            buf[pos + 5] = f8b[5];
            buf[pos + 6] = f8b[6];
            buf[pos + 7] = f8b[7];
          }
          function writeDouble_f64_rev(val, buf, pos) {
            f64[0] = val;
            buf[pos] = f8b[7];
            buf[pos + 1] = f8b[6];
            buf[pos + 2] = f8b[5];
            buf[pos + 3] = f8b[4];
            buf[pos + 4] = f8b[3];
            buf[pos + 5] = f8b[2];
            buf[pos + 6] = f8b[1];
            buf[pos + 7] = f8b[0];
          }
          exports2.writeDoubleLE = le ? writeDouble_f64_cpy : writeDouble_f64_rev;
          exports2.writeDoubleBE = le ? writeDouble_f64_rev : writeDouble_f64_cpy;
          function readDouble_f64_cpy(buf, pos) {
            f8b[0] = buf[pos];
            f8b[1] = buf[pos + 1];
            f8b[2] = buf[pos + 2];
            f8b[3] = buf[pos + 3];
            f8b[4] = buf[pos + 4];
            f8b[5] = buf[pos + 5];
            f8b[6] = buf[pos + 6];
            f8b[7] = buf[pos + 7];
            return f64[0];
          }
          function readDouble_f64_rev(buf, pos) {
            f8b[7] = buf[pos];
            f8b[6] = buf[pos + 1];
            f8b[5] = buf[pos + 2];
            f8b[4] = buf[pos + 3];
            f8b[3] = buf[pos + 4];
            f8b[2] = buf[pos + 5];
            f8b[1] = buf[pos + 6];
            f8b[0] = buf[pos + 7];
            return f64[0];
          }
          exports2.readDoubleLE = le ? readDouble_f64_cpy : readDouble_f64_rev;
          exports2.readDoubleBE = le ? readDouble_f64_rev : readDouble_f64_cpy;
        })();
      else
        (function() {
          function writeDouble_ieee754(writeUint, off0, off1, val, buf, pos) {
            var sign = val < 0 ? 1 : 0;
            if (sign)
              val = -val;
            if (val === 0) {
              writeUint(0, buf, pos + off0);
              writeUint(1 / val > 0 ? 0 : 2147483648, buf, pos + off1);
            } else if (isNaN(val)) {
              writeUint(0, buf, pos + off0);
              writeUint(2146959360, buf, pos + off1);
            } else if (val > 17976931348623157e292) {
              writeUint(0, buf, pos + off0);
              writeUint((sign << 31 | 2146435072) >>> 0, buf, pos + off1);
            } else {
              var mantissa;
              if (val < 22250738585072014e-324) {
                mantissa = val / 5e-324;
                writeUint(mantissa >>> 0, buf, pos + off0);
                writeUint((sign << 31 | mantissa / 4294967296) >>> 0, buf, pos + off1);
              } else {
                var exponent = Math.floor(Math.log(val) / Math.LN2);
                if (exponent === 1024)
                  exponent = 1023;
                mantissa = val * Math.pow(2, -exponent);
                writeUint(mantissa * 4503599627370496 >>> 0, buf, pos + off0);
                writeUint((sign << 31 | exponent + 1023 << 20 | mantissa * 1048576 & 1048575) >>> 0, buf, pos + off1);
              }
            }
          }
          exports2.writeDoubleLE = writeDouble_ieee754.bind(null, writeUintLE, 0, 4);
          exports2.writeDoubleBE = writeDouble_ieee754.bind(null, writeUintBE, 4, 0);
          function readDouble_ieee754(readUint, off0, off1, buf, pos) {
            var lo = readUint(buf, pos + off0), hi = readUint(buf, pos + off1);
            var sign = (hi >> 31) * 2 + 1, exponent = hi >>> 20 & 2047, mantissa = 4294967296 * (hi & 1048575) + lo;
            return exponent === 2047 ? mantissa ? NaN : sign * Infinity : exponent === 0 ? sign * 5e-324 * mantissa : sign * Math.pow(2, exponent - 1075) * (mantissa + 4503599627370496);
          }
          exports2.readDoubleLE = readDouble_ieee754.bind(null, readUintLE, 0, 4);
          exports2.readDoubleBE = readDouble_ieee754.bind(null, readUintBE, 4, 0);
        })();
      return exports2;
    }
    function writeUintLE(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    function writeUintBE(val, buf, pos) {
      buf[pos] = val >>> 24;
      buf[pos + 1] = val >>> 16 & 255;
      buf[pos + 2] = val >>> 8 & 255;
      buf[pos + 3] = val & 255;
    }
    function readUintLE(buf, pos) {
      return (buf[pos] | buf[pos + 1] << 8 | buf[pos + 2] << 16 | buf[pos + 3] << 24) >>> 0;
    }
    function readUintBE(buf, pos) {
      return (buf[pos] << 24 | buf[pos + 1] << 16 | buf[pos + 2] << 8 | buf[pos + 3]) >>> 0;
    }
    var inquire_1 = inquire$1;
    function inquire$1(moduleName) {
      try {
        var mod = eval("quire".replace(/^/, "re"))(moduleName);
        if (mod && (mod.length || Object.keys(mod).length))
          return mod;
      } catch (e) {
      }
      return null;
    }
    var utf8$2 = {};
    (function(exports2) {
      var utf82 = exports2;
      utf82.length = function utf8_length(string2) {
        var len = 0, c = 0;
        for (var i = 0; i < string2.length; ++i) {
          c = string2.charCodeAt(i);
          if (c < 128)
            len += 1;
          else if (c < 2048)
            len += 2;
          else if ((c & 64512) === 55296 && (string2.charCodeAt(i + 1) & 64512) === 56320) {
            ++i;
            len += 4;
          } else
            len += 3;
        }
        return len;
      };
      utf82.read = function utf8_read(buffer, start, end) {
        var len = end - start;
        if (len < 1)
          return "";
        var parts = null, chunk = [], i = 0, t;
        while (start < end) {
          t = buffer[start++];
          if (t < 128)
            chunk[i++] = t;
          else if (t > 191 && t < 224)
            chunk[i++] = (t & 31) << 6 | buffer[start++] & 63;
          else if (t > 239 && t < 365) {
            t = ((t & 7) << 18 | (buffer[start++] & 63) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63) - 65536;
            chunk[i++] = 55296 + (t >> 10);
            chunk[i++] = 56320 + (t & 1023);
          } else
            chunk[i++] = (t & 15) << 12 | (buffer[start++] & 63) << 6 | buffer[start++] & 63;
          if (i > 8191) {
            (parts || (parts = [])).push(String.fromCharCode.apply(String, chunk));
            i = 0;
          }
        }
        if (parts) {
          if (i)
            parts.push(String.fromCharCode.apply(String, chunk.slice(0, i)));
          return parts.join("");
        }
        return String.fromCharCode.apply(String, chunk.slice(0, i));
      };
      utf82.write = function utf8_write(string2, buffer, offset) {
        var start = offset, c1, c2;
        for (var i = 0; i < string2.length; ++i) {
          c1 = string2.charCodeAt(i);
          if (c1 < 128) {
            buffer[offset++] = c1;
          } else if (c1 < 2048) {
            buffer[offset++] = c1 >> 6 | 192;
            buffer[offset++] = c1 & 63 | 128;
          } else if ((c1 & 64512) === 55296 && ((c2 = string2.charCodeAt(i + 1)) & 64512) === 56320) {
            c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
            ++i;
            buffer[offset++] = c1 >> 18 | 240;
            buffer[offset++] = c1 >> 12 & 63 | 128;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
          } else {
            buffer[offset++] = c1 >> 12 | 224;
            buffer[offset++] = c1 >> 6 & 63 | 128;
            buffer[offset++] = c1 & 63 | 128;
          }
        }
        return offset - start;
      };
    })(utf8$2);
    var pool_1 = pool;
    function pool(alloc, slice, size) {
      var SIZE = size || 8192;
      var MAX = SIZE >>> 1;
      var slab = null;
      var offset = SIZE;
      return function pool_alloc(size2) {
        if (size2 < 1 || size2 > MAX)
          return alloc(size2);
        if (offset + size2 > SIZE) {
          slab = alloc(SIZE);
          offset = 0;
        }
        var buf = slice.call(slab, offset, offset += size2);
        if (offset & 7)
          offset = (offset | 7) + 1;
        return buf;
      };
    }
    var longbits;
    var hasRequiredLongbits;
    function requireLongbits() {
      if (hasRequiredLongbits)
        return longbits;
      hasRequiredLongbits = 1;
      longbits = LongBits2;
      var util2 = requireMinimal();
      function LongBits2(lo, hi) {
        this.lo = lo >>> 0;
        this.hi = hi >>> 0;
      }
      var zero = LongBits2.zero = new LongBits2(0, 0);
      zero.toNumber = function() {
        return 0;
      };
      zero.zzEncode = zero.zzDecode = function() {
        return this;
      };
      zero.length = function() {
        return 1;
      };
      var zeroHash = LongBits2.zeroHash = "\0\0\0\0\0\0\0\0";
      LongBits2.fromNumber = function fromNumber(value) {
        if (value === 0)
          return zero;
        var sign = value < 0;
        if (sign)
          value = -value;
        var lo = value >>> 0, hi = (value - lo) / 4294967296 >>> 0;
        if (sign) {
          hi = ~hi >>> 0;
          lo = ~lo >>> 0;
          if (++lo > 4294967295) {
            lo = 0;
            if (++hi > 4294967295)
              hi = 0;
          }
        }
        return new LongBits2(lo, hi);
      };
      LongBits2.from = function from(value) {
        if (typeof value === "number")
          return LongBits2.fromNumber(value);
        if (util2.isString(value)) {
          if (util2.Long)
            value = util2.Long.fromString(value);
          else
            return LongBits2.fromNumber(parseInt(value, 10));
        }
        return value.low || value.high ? new LongBits2(value.low >>> 0, value.high >>> 0) : zero;
      };
      LongBits2.prototype.toNumber = function toNumber(unsigned) {
        if (!unsigned && this.hi >>> 31) {
          var lo = ~this.lo + 1 >>> 0, hi = ~this.hi >>> 0;
          if (!lo)
            hi = hi + 1 >>> 0;
          return -(lo + hi * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      LongBits2.prototype.toLong = function toLong(unsigned) {
        return util2.Long ? new util2.Long(this.lo | 0, this.hi | 0, Boolean(unsigned)) : { low: this.lo | 0, high: this.hi | 0, unsigned: Boolean(unsigned) };
      };
      var charCodeAt = String.prototype.charCodeAt;
      LongBits2.fromHash = function fromHash(hash) {
        if (hash === zeroHash)
          return zero;
        return new LongBits2(
          (charCodeAt.call(hash, 0) | charCodeAt.call(hash, 1) << 8 | charCodeAt.call(hash, 2) << 16 | charCodeAt.call(hash, 3) << 24) >>> 0,
          (charCodeAt.call(hash, 4) | charCodeAt.call(hash, 5) << 8 | charCodeAt.call(hash, 6) << 16 | charCodeAt.call(hash, 7) << 24) >>> 0
        );
      };
      LongBits2.prototype.toHash = function toHash() {
        return String.fromCharCode(
          this.lo & 255,
          this.lo >>> 8 & 255,
          this.lo >>> 16 & 255,
          this.lo >>> 24,
          this.hi & 255,
          this.hi >>> 8 & 255,
          this.hi >>> 16 & 255,
          this.hi >>> 24
        );
      };
      LongBits2.prototype.zzEncode = function zzEncode() {
        var mask = this.hi >> 31;
        this.hi = ((this.hi << 1 | this.lo >>> 31) ^ mask) >>> 0;
        this.lo = (this.lo << 1 ^ mask) >>> 0;
        return this;
      };
      LongBits2.prototype.zzDecode = function zzDecode() {
        var mask = -(this.lo & 1);
        this.lo = ((this.lo >>> 1 | this.hi << 31) ^ mask) >>> 0;
        this.hi = (this.hi >>> 1 ^ mask) >>> 0;
        return this;
      };
      LongBits2.prototype.length = function length() {
        var part0 = this.lo, part1 = (this.lo >>> 28 | this.hi << 4) >>> 0, part2 = this.hi >>> 24;
        return part2 === 0 ? part1 === 0 ? part0 < 16384 ? part0 < 128 ? 1 : 2 : part0 < 2097152 ? 3 : 4 : part1 < 16384 ? part1 < 128 ? 5 : 6 : part1 < 2097152 ? 7 : 8 : part2 < 128 ? 9 : 10;
      };
      return longbits;
    }
    var hasRequiredMinimal;
    function requireMinimal() {
      if (hasRequiredMinimal)
        return minimal;
      hasRequiredMinimal = 1;
      (function(exports2) {
        var util2 = exports2;
        util2.asPromise = aspromise;
        util2.base64 = base64$1;
        util2.EventEmitter = eventemitter;
        util2.float = float;
        util2.inquire = inquire_1;
        util2.utf8 = utf8$2;
        util2.pool = pool_1;
        util2.LongBits = requireLongbits();
        util2.isNode = Boolean(typeof commonjsGlobal !== "undefined" && commonjsGlobal && commonjsGlobal.process && commonjsGlobal.process.versions && commonjsGlobal.process.versions.node);
        util2.global = util2.isNode && commonjsGlobal || typeof window !== "undefined" && window || typeof self !== "undefined" && self || commonjsGlobal;
        util2.emptyArray = Object.freeze ? Object.freeze([]) : [];
        util2.emptyObject = Object.freeze ? Object.freeze({}) : {};
        util2.isInteger = Number.isInteger || function isInteger(value) {
          return typeof value === "number" && isFinite(value) && Math.floor(value) === value;
        };
        util2.isString = function isString(value) {
          return typeof value === "string" || value instanceof String;
        };
        util2.isObject = function isObject2(value) {
          return value && typeof value === "object";
        };
        util2.isset = util2.isSet = function isSet(obj, prop) {
          var value = obj[prop];
          if (value != null && obj.hasOwnProperty(prop))
            return typeof value !== "object" || (Array.isArray(value) ? value.length : Object.keys(value).length) > 0;
          return false;
        };
        util2.Buffer = function() {
          try {
            var Buffer2 = util2.inquire("buffer").Buffer;
            return Buffer2.prototype.utf8Write ? Buffer2 : null;
          } catch (e) {
            return null;
          }
        }();
        util2._Buffer_from = null;
        util2._Buffer_allocUnsafe = null;
        util2.newBuffer = function newBuffer(sizeOrArray) {
          return typeof sizeOrArray === "number" ? util2.Buffer ? util2._Buffer_allocUnsafe(sizeOrArray) : new util2.Array(sizeOrArray) : util2.Buffer ? util2._Buffer_from(sizeOrArray) : typeof Uint8Array === "undefined" ? sizeOrArray : new Uint8Array(sizeOrArray);
        };
        util2.Array = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
        util2.Long = util2.global.dcodeIO && util2.global.dcodeIO.Long || util2.global.Long || util2.inquire("long");
        util2.key2Re = /^true|false|0|1$/;
        util2.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
        util2.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
        util2.longToHash = function longToHash(value) {
          return value ? util2.LongBits.from(value).toHash() : util2.LongBits.zeroHash;
        };
        util2.longFromHash = function longFromHash(hash, unsigned) {
          var bits = util2.LongBits.fromHash(hash);
          if (util2.Long)
            return util2.Long.fromBits(bits.lo, bits.hi, unsigned);
          return bits.toNumber(Boolean(unsigned));
        };
        function merge(dst, src2, ifNotSet) {
          for (var keys2 = Object.keys(src2), i = 0; i < keys2.length; ++i)
            if (dst[keys2[i]] === void 0 || !ifNotSet)
              dst[keys2[i]] = src2[keys2[i]];
          return dst;
        }
        util2.merge = merge;
        util2.lcFirst = function lcFirst(str) {
          return str.charAt(0).toLowerCase() + str.substring(1);
        };
        function newError(name) {
          function CustomError(message2, properties) {
            if (!(this instanceof CustomError))
              return new CustomError(message2, properties);
            Object.defineProperty(this, "message", { get: function() {
              return message2;
            } });
            if (Error.captureStackTrace)
              Error.captureStackTrace(this, CustomError);
            else
              Object.defineProperty(this, "stack", { value: new Error().stack || "" });
            if (properties)
              merge(this, properties);
          }
          CustomError.prototype = Object.create(Error.prototype, {
            constructor: {
              value: CustomError,
              writable: true,
              enumerable: false,
              configurable: true
            },
            name: {
              get: function get() {
                return name;
              },
              set: void 0,
              enumerable: false,
              configurable: true
            },
            toString: {
              value: function value() {
                return this.name + ": " + this.message;
              },
              writable: true,
              enumerable: false,
              configurable: true
            }
          });
          return CustomError;
        }
        util2.newError = newError;
        util2.ProtocolError = newError("ProtocolError");
        util2.oneOfGetter = function getOneOf(fieldNames) {
          var fieldMap = {};
          for (var i = 0; i < fieldNames.length; ++i)
            fieldMap[fieldNames[i]] = 1;
          return function() {
            for (var keys2 = Object.keys(this), i2 = keys2.length - 1; i2 > -1; --i2)
              if (fieldMap[keys2[i2]] === 1 && this[keys2[i2]] !== void 0 && this[keys2[i2]] !== null)
                return keys2[i2];
          };
        };
        util2.oneOfSetter = function setOneOf(fieldNames) {
          return function(name) {
            for (var i = 0; i < fieldNames.length; ++i)
              if (fieldNames[i] !== name)
                delete this[fieldNames[i]];
          };
        };
        util2.toJSONOptions = {
          longs: String,
          enums: String,
          bytes: String,
          json: true
        };
        util2._configure = function() {
          var Buffer2 = util2.Buffer;
          if (!Buffer2) {
            util2._Buffer_from = util2._Buffer_allocUnsafe = null;
            return;
          }
          util2._Buffer_from = Buffer2.from !== Uint8Array.from && Buffer2.from || function Buffer_from(value, encoding) {
            return new Buffer2(value, encoding);
          };
          util2._Buffer_allocUnsafe = Buffer2.allocUnsafe || function Buffer_allocUnsafe(size) {
            return new Buffer2(size);
          };
        };
      })(minimal);
      return minimal;
    }
    var writer = Writer$1;
    var util$7 = requireMinimal();
    var BufferWriter$1;
    var LongBits$1 = util$7.LongBits, base64 = util$7.base64, utf8$1 = util$7.utf8;
    function Op(fn, len, val) {
      this.fn = fn;
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    function noop() {
    }
    function State(writer2) {
      this.head = writer2.head;
      this.tail = writer2.tail;
      this.len = writer2.len;
      this.next = writer2.states;
    }
    function Writer$1() {
      this.len = 0;
      this.head = new Op(noop, 0, 0);
      this.tail = this.head;
      this.states = null;
    }
    var create$1 = function create2() {
      return util$7.Buffer ? function create_buffer_setup() {
        return (Writer$1.create = function create_buffer() {
          return new BufferWriter$1();
        })();
      } : function create_array2() {
        return new Writer$1();
      };
    };
    Writer$1.create = create$1();
    Writer$1.alloc = function alloc(size) {
      return new util$7.Array(size);
    };
    if (util$7.Array !== Array)
      Writer$1.alloc = util$7.pool(Writer$1.alloc, util$7.Array.prototype.subarray);
    Writer$1.prototype._push = function push(fn, len, val) {
      this.tail = this.tail.next = new Op(fn, len, val);
      this.len += len;
      return this;
    };
    function writeByte(val, buf, pos) {
      buf[pos] = val & 255;
    }
    function writeVarint32(val, buf, pos) {
      while (val > 127) {
        buf[pos++] = val & 127 | 128;
        val >>>= 7;
      }
      buf[pos] = val;
    }
    function VarintOp(len, val) {
      this.len = len;
      this.next = void 0;
      this.val = val;
    }
    VarintOp.prototype = Object.create(Op.prototype);
    VarintOp.prototype.fn = writeVarint32;
    Writer$1.prototype.uint32 = function write_uint32(value) {
      this.len += (this.tail = this.tail.next = new VarintOp(
        (value = value >>> 0) < 128 ? 1 : value < 16384 ? 2 : value < 2097152 ? 3 : value < 268435456 ? 4 : 5,
        value
      )).len;
      return this;
    };
    Writer$1.prototype.int32 = function write_int32(value) {
      return value < 0 ? this._push(writeVarint64, 10, LongBits$1.fromNumber(value)) : this.uint32(value);
    };
    Writer$1.prototype.sint32 = function write_sint32(value) {
      return this.uint32((value << 1 ^ value >> 31) >>> 0);
    };
    function writeVarint64(val, buf, pos) {
      while (val.hi) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = (val.lo >>> 7 | val.hi << 25) >>> 0;
        val.hi >>>= 7;
      }
      while (val.lo > 127) {
        buf[pos++] = val.lo & 127 | 128;
        val.lo = val.lo >>> 7;
      }
      buf[pos++] = val.lo;
    }
    Writer$1.prototype.uint64 = function write_uint64(value) {
      var bits = LongBits$1.from(value);
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer$1.prototype.int64 = Writer$1.prototype.uint64;
    Writer$1.prototype.sint64 = function write_sint64(value) {
      var bits = LongBits$1.from(value).zzEncode();
      return this._push(writeVarint64, bits.length(), bits);
    };
    Writer$1.prototype.bool = function write_bool(value) {
      return this._push(writeByte, 1, value ? 1 : 0);
    };
    function writeFixed32(val, buf, pos) {
      buf[pos] = val & 255;
      buf[pos + 1] = val >>> 8 & 255;
      buf[pos + 2] = val >>> 16 & 255;
      buf[pos + 3] = val >>> 24;
    }
    Writer$1.prototype.fixed32 = function write_fixed32(value) {
      return this._push(writeFixed32, 4, value >>> 0);
    };
    Writer$1.prototype.sfixed32 = Writer$1.prototype.fixed32;
    Writer$1.prototype.fixed64 = function write_fixed64(value) {
      var bits = LongBits$1.from(value);
      return this._push(writeFixed32, 4, bits.lo)._push(writeFixed32, 4, bits.hi);
    };
    Writer$1.prototype.sfixed64 = Writer$1.prototype.fixed64;
    Writer$1.prototype.float = function write_float(value) {
      return this._push(util$7.float.writeFloatLE, 4, value);
    };
    Writer$1.prototype.double = function write_double(value) {
      return this._push(util$7.float.writeDoubleLE, 8, value);
    };
    var writeBytes = util$7.Array.prototype.set ? function writeBytes_set(val, buf, pos) {
      buf.set(val, pos);
    } : function writeBytes_for(val, buf, pos) {
      for (var i = 0; i < val.length; ++i)
        buf[pos + i] = val[i];
    };
    Writer$1.prototype.bytes = function write_bytes(value) {
      var len = value.length >>> 0;
      if (!len)
        return this._push(writeByte, 1, 0);
      if (util$7.isString(value)) {
        var buf = Writer$1.alloc(len = base64.length(value));
        base64.decode(value, buf, 0);
        value = buf;
      }
      return this.uint32(len)._push(writeBytes, len, value);
    };
    Writer$1.prototype.string = function write_string(value) {
      var len = utf8$1.length(value);
      return len ? this.uint32(len)._push(utf8$1.write, len, value) : this._push(writeByte, 1, 0);
    };
    Writer$1.prototype.fork = function fork() {
      this.states = new State(this);
      this.head = this.tail = new Op(noop, 0, 0);
      this.len = 0;
      return this;
    };
    Writer$1.prototype.reset = function reset() {
      if (this.states) {
        this.head = this.states.head;
        this.tail = this.states.tail;
        this.len = this.states.len;
        this.states = this.states.next;
      } else {
        this.head = this.tail = new Op(noop, 0, 0);
        this.len = 0;
      }
      return this;
    };
    Writer$1.prototype.ldelim = function ldelim() {
      var head = this.head, tail = this.tail, len = this.len;
      this.reset().uint32(len);
      if (len) {
        this.tail.next = head.next;
        this.tail = tail;
        this.len += len;
      }
      return this;
    };
    Writer$1.prototype.finish = function finish() {
      var head = this.head.next, buf = this.constructor.alloc(this.len), pos = 0;
      while (head) {
        head.fn(head.val, buf, pos);
        pos += head.len;
        head = head.next;
      }
      return buf;
    };
    Writer$1._configure = function(BufferWriter_) {
      BufferWriter$1 = BufferWriter_;
      Writer$1.create = create$1();
      BufferWriter$1._configure();
    };
    var writer_buffer = BufferWriter;
    var Writer = writer;
    (BufferWriter.prototype = Object.create(Writer.prototype)).constructor = BufferWriter;
    var util$6 = requireMinimal();
    function BufferWriter() {
      Writer.call(this);
    }
    BufferWriter._configure = function() {
      BufferWriter.alloc = util$6._Buffer_allocUnsafe;
      BufferWriter.writeBytesBuffer = util$6.Buffer && util$6.Buffer.prototype instanceof Uint8Array && util$6.Buffer.prototype.set.name === "set" ? function writeBytesBuffer_set(val, buf, pos) {
        buf.set(val, pos);
      } : function writeBytesBuffer_copy(val, buf, pos) {
        if (val.copy)
          val.copy(buf, pos, 0, val.length);
        else
          for (var i = 0; i < val.length; )
            buf[pos++] = val[i++];
      };
    };
    BufferWriter.prototype.bytes = function write_bytes_buffer(value) {
      if (util$6.isString(value))
        value = util$6._Buffer_from(value, "base64");
      var len = value.length >>> 0;
      this.uint32(len);
      if (len)
        this._push(BufferWriter.writeBytesBuffer, len, value);
      return this;
    };
    function writeStringBuffer(val, buf, pos) {
      if (val.length < 40)
        util$6.utf8.write(val, buf, pos);
      else if (buf.utf8Write)
        buf.utf8Write(val, pos);
      else
        buf.write(val, pos);
    }
    BufferWriter.prototype.string = function write_string_buffer(value) {
      var len = util$6.Buffer.byteLength(value);
      this.uint32(len);
      if (len)
        this._push(writeStringBuffer, len, value);
      return this;
    };
    BufferWriter._configure();
    var reader = Reader$1;
    var util$5 = requireMinimal();
    var BufferReader$1;
    var LongBits = util$5.LongBits, utf8 = util$5.utf8;
    function indexOutOfRange(reader2, writeLength) {
      return RangeError("index out of range: " + reader2.pos + " + " + (writeLength || 1) + " > " + reader2.len);
    }
    function Reader$1(buffer) {
      this.buf = buffer;
      this.pos = 0;
      this.len = buffer.length;
    }
    var create_array = typeof Uint8Array !== "undefined" ? function create_typed_array(buffer) {
      if (buffer instanceof Uint8Array || Array.isArray(buffer))
        return new Reader$1(buffer);
      throw Error("illegal buffer");
    } : function create_array2(buffer) {
      if (Array.isArray(buffer))
        return new Reader$1(buffer);
      throw Error("illegal buffer");
    };
    var create = function create2() {
      return util$5.Buffer ? function create_buffer_setup(buffer) {
        return (Reader$1.create = function create_buffer(buffer2) {
          return util$5.Buffer.isBuffer(buffer2) ? new BufferReader$1(buffer2) : create_array(buffer2);
        })(buffer);
      } : create_array;
    };
    Reader$1.create = create();
    Reader$1.prototype._slice = util$5.Array.prototype.subarray || util$5.Array.prototype.slice;
    Reader$1.prototype.uint32 = function read_uint32_setup() {
      var value = 4294967295;
      return function read_uint32() {
        value = (this.buf[this.pos] & 127) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 7) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 14) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 127) << 21) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        value = (value | (this.buf[this.pos] & 15) << 28) >>> 0;
        if (this.buf[this.pos++] < 128)
          return value;
        if ((this.pos += 5) > this.len) {
          this.pos = this.len;
          throw indexOutOfRange(this, 10);
        }
        return value;
      };
    }();
    Reader$1.prototype.int32 = function read_int32() {
      return this.uint32() | 0;
    };
    Reader$1.prototype.sint32 = function read_sint32() {
      var value = this.uint32();
      return value >>> 1 ^ -(value & 1) | 0;
    };
    function readLongVarint() {
      var bits = new LongBits(0, 0);
      var i = 0;
      if (this.len - this.pos > 4) {
        for (; i < 4; ++i) {
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos] & 127) << 28) >>> 0;
        bits.hi = (bits.hi | (this.buf[this.pos] & 127) >> 4) >>> 0;
        if (this.buf[this.pos++] < 128)
          return bits;
        i = 0;
      } else {
        for (; i < 3; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.lo = (bits.lo | (this.buf[this.pos] & 127) << i * 7) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
        bits.lo = (bits.lo | (this.buf[this.pos++] & 127) << i * 7) >>> 0;
        return bits;
      }
      if (this.len - this.pos > 4) {
        for (; i < 5; ++i) {
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      } else {
        for (; i < 5; ++i) {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
          bits.hi = (bits.hi | (this.buf[this.pos] & 127) << i * 7 + 3) >>> 0;
          if (this.buf[this.pos++] < 128)
            return bits;
        }
      }
      throw Error("invalid varint encoding");
    }
    Reader$1.prototype.bool = function read_bool() {
      return this.uint32() !== 0;
    };
    function readFixed32_end(buf, end) {
      return (buf[end - 4] | buf[end - 3] << 8 | buf[end - 2] << 16 | buf[end - 1] << 24) >>> 0;
    }
    Reader$1.prototype.fixed32 = function read_fixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4);
    };
    Reader$1.prototype.sfixed32 = function read_sfixed32() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      return readFixed32_end(this.buf, this.pos += 4) | 0;
    };
    function readFixed64() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 8);
      return new LongBits(readFixed32_end(this.buf, this.pos += 4), readFixed32_end(this.buf, this.pos += 4));
    }
    Reader$1.prototype.float = function read_float() {
      if (this.pos + 4 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util$5.float.readFloatLE(this.buf, this.pos);
      this.pos += 4;
      return value;
    };
    Reader$1.prototype.double = function read_double() {
      if (this.pos + 8 > this.len)
        throw indexOutOfRange(this, 4);
      var value = util$5.float.readDoubleLE(this.buf, this.pos);
      this.pos += 8;
      return value;
    };
    Reader$1.prototype.bytes = function read_bytes() {
      var length = this.uint32(), start = this.pos, end = this.pos + length;
      if (end > this.len)
        throw indexOutOfRange(this, length);
      this.pos += length;
      if (Array.isArray(this.buf))
        return this.buf.slice(start, end);
      if (start === end) {
        var nativeBuffer = util$5.Buffer;
        return nativeBuffer ? nativeBuffer.alloc(0) : new this.buf.constructor(0);
      }
      return this._slice.call(this.buf, start, end);
    };
    Reader$1.prototype.string = function read_string() {
      var bytes = this.bytes();
      return utf8.read(bytes, 0, bytes.length);
    };
    Reader$1.prototype.skip = function skip(length) {
      if (typeof length === "number") {
        if (this.pos + length > this.len)
          throw indexOutOfRange(this, length);
        this.pos += length;
      } else {
        do {
          if (this.pos >= this.len)
            throw indexOutOfRange(this);
        } while (this.buf[this.pos++] & 128);
      }
      return this;
    };
    Reader$1.prototype.skipType = function(wireType) {
      switch (wireType) {
        case 0:
          this.skip();
          break;
        case 1:
          this.skip(8);
          break;
        case 2:
          this.skip(this.uint32());
          break;
        case 3:
          while ((wireType = this.uint32() & 7) !== 4) {
            this.skipType(wireType);
          }
          break;
        case 5:
          this.skip(4);
          break;
        default:
          throw Error("invalid wire type " + wireType + " at offset " + this.pos);
      }
      return this;
    };
    Reader$1._configure = function(BufferReader_) {
      BufferReader$1 = BufferReader_;
      Reader$1.create = create();
      BufferReader$1._configure();
      var fn = util$5.Long ? "toLong" : "toNumber";
      util$5.merge(Reader$1.prototype, {
        int64: function read_int64() {
          return readLongVarint.call(this)[fn](false);
        },
        uint64: function read_uint64() {
          return readLongVarint.call(this)[fn](true);
        },
        sint64: function read_sint64() {
          return readLongVarint.call(this).zzDecode()[fn](false);
        },
        fixed64: function read_fixed64() {
          return readFixed64.call(this)[fn](true);
        },
        sfixed64: function read_sfixed64() {
          return readFixed64.call(this)[fn](false);
        }
      });
    };
    var reader_buffer = BufferReader;
    var Reader = reader;
    (BufferReader.prototype = Object.create(Reader.prototype)).constructor = BufferReader;
    var util$4 = requireMinimal();
    function BufferReader(buffer) {
      Reader.call(this, buffer);
    }
    BufferReader._configure = function() {
      if (util$4.Buffer)
        BufferReader.prototype._slice = util$4.Buffer.prototype.slice;
    };
    BufferReader.prototype.string = function read_string_buffer() {
      var len = this.uint32();
      return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + len, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + len, this.len));
    };
    BufferReader._configure();
    var rpc = {};
    var service$2 = Service$2;
    var util$3 = requireMinimal();
    (Service$2.prototype = Object.create(util$3.EventEmitter.prototype)).constructor = Service$2;
    function Service$2(rpcImpl, requestDelimited, responseDelimited) {
      if (typeof rpcImpl !== "function")
        throw TypeError("rpcImpl must be a function");
      util$3.EventEmitter.call(this);
      this.rpcImpl = rpcImpl;
      this.requestDelimited = Boolean(requestDelimited);
      this.responseDelimited = Boolean(responseDelimited);
    }
    Service$2.prototype.rpcCall = function rpcCall(method2, requestCtor, responseCtor, request, callback) {
      if (!request)
        throw TypeError("request must be specified");
      var self2 = this;
      if (!callback)
        return util$3.asPromise(rpcCall, self2, method2, requestCtor, responseCtor, request);
      if (!self2.rpcImpl) {
        setTimeout(function() {
          callback(Error("already ended"));
        }, 0);
        return void 0;
      }
      try {
        return self2.rpcImpl(
          method2,
          requestCtor[self2.requestDelimited ? "encodeDelimited" : "encode"](request).finish(),
          function rpcCallback(err, response) {
            if (err) {
              self2.emit("error", err, method2);
              return callback(err);
            }
            if (response === null) {
              self2.end(true);
              return void 0;
            }
            if (!(response instanceof responseCtor)) {
              try {
                response = responseCtor[self2.responseDelimited ? "decodeDelimited" : "decode"](response);
              } catch (err2) {
                self2.emit("error", err2, method2);
                return callback(err2);
              }
            }
            self2.emit("data", response, method2);
            return callback(null, response);
          }
        );
      } catch (err) {
        self2.emit("error", err, method2);
        setTimeout(function() {
          callback(err);
        }, 0);
        return void 0;
      }
    };
    Service$2.prototype.end = function end(endedByRPC) {
      if (this.rpcImpl) {
        if (!endedByRPC)
          this.rpcImpl(null, null, null);
        this.rpcImpl = null;
        this.emit("end").off();
      }
      return this;
    };
    (function(exports2) {
      var rpc2 = exports2;
      rpc2.Service = service$2;
    })(rpc);
    var roots = {};
    (function(exports2) {
      var protobuf = exports2;
      protobuf.build = "minimal";
      protobuf.Writer = writer;
      protobuf.BufferWriter = writer_buffer;
      protobuf.Reader = reader;
      protobuf.BufferReader = reader_buffer;
      protobuf.util = requireMinimal();
      protobuf.rpc = rpc;
      protobuf.roots = roots;
      protobuf.configure = configure;
      function configure() {
        protobuf.util._configure();
        protobuf.Writer._configure(protobuf.BufferWriter);
        protobuf.Reader._configure(protobuf.BufferReader);
      }
      configure();
    })(indexMinimal);
    var util$2 = { exports: {} };
    var codegen_1 = codegen;
    function codegen(functionParams, functionName) {
      if (typeof functionParams === "string") {
        functionName = functionParams;
        functionParams = void 0;
      }
      var body = [];
      function Codegen(formatStringOrScope) {
        if (typeof formatStringOrScope !== "string") {
          var source = toString2();
          if (codegen.verbose)
            console.log("codegen: " + source);
          source = "return " + source;
          if (formatStringOrScope) {
            var scopeKeys = Object.keys(formatStringOrScope), scopeParams = new Array(scopeKeys.length + 1), scopeValues = new Array(scopeKeys.length), scopeOffset = 0;
            while (scopeOffset < scopeKeys.length) {
              scopeParams[scopeOffset] = scopeKeys[scopeOffset];
              scopeValues[scopeOffset] = formatStringOrScope[scopeKeys[scopeOffset++]];
            }
            scopeParams[scopeOffset] = source;
            return Function.apply(null, scopeParams).apply(null, scopeValues);
          }
          return Function(source)();
        }
        var formatParams = new Array(arguments.length - 1), formatOffset = 0;
        while (formatOffset < formatParams.length)
          formatParams[formatOffset] = arguments[++formatOffset];
        formatOffset = 0;
        formatStringOrScope = formatStringOrScope.replace(/%([%dfijs])/g, function replace($0, $1) {
          var value = formatParams[formatOffset++];
          switch ($1) {
            case "d":
            case "f":
              return String(Number(value));
            case "i":
              return String(Math.floor(value));
            case "j":
              return JSON.stringify(value);
            case "s":
              return String(value);
          }
          return "%";
        });
        if (formatOffset !== formatParams.length)
          throw Error("parameter count mismatch");
        body.push(formatStringOrScope);
        return Codegen;
      }
      function toString2(functionNameOverride) {
        return "function " + (functionNameOverride || functionName || "") + "(" + (functionParams && functionParams.join(",") || "") + "){\n  " + body.join("\n  ") + "\n}";
      }
      Codegen.toString = toString2;
      return Codegen;
    }
    codegen.verbose = false;
    var fetch_1 = fetch;
    var asPromise = aspromise, inquire = inquire_1;
    var fs = inquire("fs");
    function fetch(filename, options, callback) {
      if (typeof options === "function") {
        callback = options;
        options = {};
      } else if (!options)
        options = {};
      if (!callback)
        return asPromise(fetch, this, filename, options);
      if (!options.xhr && fs && fs.readFile)
        return fs.readFile(filename, function fetchReadFileCallback(err, contents) {
          return err && typeof XMLHttpRequest !== "undefined" ? fetch.xhr(filename, options, callback) : err ? callback(err) : callback(null, options.binary ? contents : contents.toString("utf8"));
        });
      return fetch.xhr(filename, options, callback);
    }
    fetch.xhr = function fetch_xhr(filename, options, callback) {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function fetchOnReadyStateChange() {
        if (xhr.readyState !== 4)
          return void 0;
        if (xhr.status !== 0 && xhr.status !== 200)
          return callback(Error("status " + xhr.status));
        if (options.binary) {
          var buffer = xhr.response;
          if (!buffer) {
            buffer = [];
            for (var i = 0; i < xhr.responseText.length; ++i)
              buffer.push(xhr.responseText.charCodeAt(i) & 255);
          }
          return callback(null, typeof Uint8Array !== "undefined" ? new Uint8Array(buffer) : buffer);
        }
        return callback(null, xhr.responseText);
      };
      if (options.binary) {
        if ("overrideMimeType" in xhr)
          xhr.overrideMimeType("text/plain; charset=x-user-defined");
        xhr.responseType = "arraybuffer";
      }
      xhr.open("GET", filename);
      xhr.send();
    };
    var path = {};
    (function(exports2) {
      var path2 = exports2;
      var isAbsolute = path2.isAbsolute = function isAbsolute2(path3) {
        return /^(?:\/|\w+:)/.test(path3);
      };
      var normalize = path2.normalize = function normalize2(path3) {
        path3 = path3.replace(/\\/g, "/").replace(/\/{2,}/g, "/");
        var parts = path3.split("/"), absolute = isAbsolute(path3), prefix = "";
        if (absolute)
          prefix = parts.shift() + "/";
        for (var i = 0; i < parts.length; ) {
          if (parts[i] === "..") {
            if (i > 0 && parts[i - 1] !== "..")
              parts.splice(--i, 2);
            else if (absolute)
              parts.splice(i, 1);
            else
              ++i;
          } else if (parts[i] === ".")
            parts.splice(i, 1);
          else
            ++i;
        }
        return prefix + parts.join("/");
      };
      path2.resolve = function resolve(originPath, includePath, alreadyNormalized) {
        if (!alreadyNormalized)
          includePath = normalize(includePath);
        if (isAbsolute(includePath))
          return includePath;
        if (!alreadyNormalized)
          originPath = normalize(originPath);
        return (originPath = originPath.replace(/(?:\/|^)[^/]+$/, "")).length ? normalize(originPath + "/" + includePath) : includePath;
      };
    })(path);
    var types$1 = {};
    var hasRequiredTypes;
    function requireTypes() {
      if (hasRequiredTypes)
        return types$1;
      hasRequiredTypes = 1;
      (function(exports2) {
        var types2 = exports2;
        var util2 = requireUtil();
        var s = [
          "double",
          "float",
          "int32",
          "uint32",
          "sint32",
          "fixed32",
          "sfixed32",
          "int64",
          "uint64",
          "sint64",
          "fixed64",
          "sfixed64",
          "bool",
          "string",
          "bytes"
        ];
        function bake(values, offset) {
          var i = 0, o = {};
          offset |= 0;
          while (i < values.length)
            o[s[i + offset]] = values[i++];
          return o;
        }
        types2.basic = bake([
          1,
          5,
          0,
          0,
          0,
          5,
          5,
          0,
          0,
          0,
          1,
          1,
          0,
          2,
          2
        ]);
        types2.defaults = bake([
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          false,
          "",
          util2.emptyArray,
          null
        ]);
        types2.long = bake([
          0,
          0,
          0,
          1,
          1
        ], 7);
        types2.mapKey = bake([
          0,
          0,
          0,
          5,
          5,
          0,
          0,
          0,
          1,
          1,
          0,
          2
        ], 2);
        types2.packed = bake([
          1,
          5,
          0,
          0,
          0,
          5,
          5,
          0,
          0,
          0,
          1,
          1,
          0
        ]);
      })(types$1);
      return types$1;
    }
    var field;
    var hasRequiredField;
    function requireField() {
      if (hasRequiredField)
        return field;
      hasRequiredField = 1;
      field = Field2;
      var ReflectionObject = requireObject();
      ((Field2.prototype = Object.create(ReflectionObject.prototype)).constructor = Field2).className = "Field";
      var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
      var Type2;
      var ruleRe = /^required|optional|repeated$/;
      Field2.fromJSON = function fromJSON(name, json) {
        return new Field2(name, json.id, json.type, json.rule, json.extend, json.options, json.comment);
      };
      function Field2(name, id, type2, rule, extend, options, comment2) {
        if (util2.isObject(rule)) {
          comment2 = extend;
          options = rule;
          rule = extend = void 0;
        } else if (util2.isObject(extend)) {
          comment2 = options;
          options = extend;
          extend = void 0;
        }
        ReflectionObject.call(this, name, options);
        if (!util2.isInteger(id) || id < 0)
          throw TypeError("id must be a non-negative integer");
        if (!util2.isString(type2))
          throw TypeError("type must be a string");
        if (rule !== void 0 && !ruleRe.test(rule = rule.toString().toLowerCase()))
          throw TypeError("rule must be a string rule");
        if (extend !== void 0 && !util2.isString(extend))
          throw TypeError("extend must be a string");
        if (rule === "proto3_optional") {
          rule = "optional";
        }
        this.rule = rule && rule !== "optional" ? rule : void 0;
        this.type = type2;
        this.id = id;
        this.extend = extend || void 0;
        this.required = rule === "required";
        this.optional = !this.required;
        this.repeated = rule === "repeated";
        this.map = false;
        this.message = null;
        this.partOf = null;
        this.typeDefault = null;
        this.defaultValue = null;
        this.long = util2.Long ? types2.long[type2] !== void 0 : false;
        this.bytes = type2 === "bytes";
        this.resolvedType = null;
        this.extensionField = null;
        this.declaringField = null;
        this._packed = null;
        this.comment = comment2;
      }
      Object.defineProperty(Field2.prototype, "packed", {
        get: function() {
          if (this._packed === null)
            this._packed = this.getOption("packed") !== false;
          return this._packed;
        }
      });
      Field2.prototype.setOption = function setOption(name, value, ifNotSet) {
        if (name === "packed")
          this._packed = null;
        return ReflectionObject.prototype.setOption.call(this, name, value, ifNotSet);
      };
      Field2.prototype.toJSON = function toJSON(toJSONOptions) {
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "rule",
          this.rule !== "optional" && this.rule || void 0,
          "type",
          this.type,
          "id",
          this.id,
          "extend",
          this.extend,
          "options",
          this.options,
          "comment",
          keepComments ? this.comment : void 0
        ]);
      };
      Field2.prototype.resolve = function resolve() {
        if (this.resolved)
          return this;
        if ((this.typeDefault = types2.defaults[this.type]) === void 0) {
          this.resolvedType = (this.declaringField ? this.declaringField.parent : this.parent).lookupTypeOrEnum(this.type);
          if (this.resolvedType instanceof Type2)
            this.typeDefault = null;
          else
            this.typeDefault = this.resolvedType.values[Object.keys(this.resolvedType.values)[0]];
        } else if (this.options && this.options.proto3_optional) {
          this.typeDefault = null;
        }
        if (this.options && this.options["default"] != null) {
          this.typeDefault = this.options["default"];
          if (this.resolvedType instanceof Enum2 && typeof this.typeDefault === "string")
            this.typeDefault = this.resolvedType.values[this.typeDefault];
        }
        if (this.options) {
          if (this.options.packed === true || this.options.packed !== void 0 && this.resolvedType && !(this.resolvedType instanceof Enum2))
            delete this.options.packed;
          if (!Object.keys(this.options).length)
            this.options = void 0;
        }
        if (this.long) {
          this.typeDefault = util2.Long.fromNumber(this.typeDefault, this.type.charAt(0) === "u");
          if (Object.freeze)
            Object.freeze(this.typeDefault);
        } else if (this.bytes && typeof this.typeDefault === "string") {
          var buf;
          if (util2.base64.test(this.typeDefault))
            util2.base64.decode(this.typeDefault, buf = util2.newBuffer(util2.base64.length(this.typeDefault)), 0);
          else
            util2.utf8.write(this.typeDefault, buf = util2.newBuffer(util2.utf8.length(this.typeDefault)), 0);
          this.typeDefault = buf;
        }
        if (this.map)
          this.defaultValue = util2.emptyObject;
        else if (this.repeated)
          this.defaultValue = util2.emptyArray;
        else
          this.defaultValue = this.typeDefault;
        if (this.parent instanceof Type2)
          this.parent.ctor.prototype[this.name] = this.defaultValue;
        return ReflectionObject.prototype.resolve.call(this);
      };
      Field2.d = function decorateField(fieldId, fieldType, fieldRule, defaultValue) {
        if (typeof fieldType === "function")
          fieldType = util2.decorateType(fieldType).name;
        else if (fieldType && typeof fieldType === "object")
          fieldType = util2.decorateEnum(fieldType).name;
        return function fieldDecorator(prototype, fieldName) {
          util2.decorateType(prototype.constructor).add(new Field2(fieldName, fieldId, fieldType, fieldRule, { "default": defaultValue }));
        };
      };
      Field2._configure = function configure(Type_) {
        Type2 = Type_;
      };
      return field;
    }
    var oneof;
    var hasRequiredOneof;
    function requireOneof() {
      if (hasRequiredOneof)
        return oneof;
      hasRequiredOneof = 1;
      oneof = OneOf2;
      var ReflectionObject = requireObject();
      ((OneOf2.prototype = Object.create(ReflectionObject.prototype)).constructor = OneOf2).className = "OneOf";
      var Field2 = requireField(), util2 = requireUtil();
      function OneOf2(name, fieldNames, options, comment2) {
        if (!Array.isArray(fieldNames)) {
          options = fieldNames;
          fieldNames = void 0;
        }
        ReflectionObject.call(this, name, options);
        if (!(fieldNames === void 0 || Array.isArray(fieldNames)))
          throw TypeError("fieldNames must be an Array");
        this.oneof = fieldNames || [];
        this.fieldsArray = [];
        this.comment = comment2;
      }
      OneOf2.fromJSON = function fromJSON(name, json) {
        return new OneOf2(name, json.oneof, json.options, json.comment);
      };
      OneOf2.prototype.toJSON = function toJSON(toJSONOptions) {
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "options",
          this.options,
          "oneof",
          this.oneof,
          "comment",
          keepComments ? this.comment : void 0
        ]);
      };
      function addFieldsToParent(oneof2) {
        if (oneof2.parent) {
          for (var i = 0; i < oneof2.fieldsArray.length; ++i)
            if (!oneof2.fieldsArray[i].parent)
              oneof2.parent.add(oneof2.fieldsArray[i]);
        }
      }
      OneOf2.prototype.add = function add2(field2) {
        if (!(field2 instanceof Field2))
          throw TypeError("field must be a Field");
        if (field2.parent && field2.parent !== this.parent)
          field2.parent.remove(field2);
        this.oneof.push(field2.name);
        this.fieldsArray.push(field2);
        field2.partOf = this;
        addFieldsToParent(this);
        return this;
      };
      OneOf2.prototype.remove = function remove(field2) {
        if (!(field2 instanceof Field2))
          throw TypeError("field must be a Field");
        var index = this.fieldsArray.indexOf(field2);
        if (index < 0)
          throw Error(field2 + " is not a member of " + this);
        this.fieldsArray.splice(index, 1);
        index = this.oneof.indexOf(field2.name);
        if (index > -1)
          this.oneof.splice(index, 1);
        field2.partOf = null;
        return this;
      };
      OneOf2.prototype.onAdd = function onAdd(parent) {
        ReflectionObject.prototype.onAdd.call(this, parent);
        var self2 = this;
        for (var i = 0; i < this.oneof.length; ++i) {
          var field2 = parent.get(this.oneof[i]);
          if (field2 && !field2.partOf) {
            field2.partOf = self2;
            self2.fieldsArray.push(field2);
          }
        }
        addFieldsToParent(this);
      };
      OneOf2.prototype.onRemove = function onRemove(parent) {
        for (var i = 0, field2; i < this.fieldsArray.length; ++i)
          if ((field2 = this.fieldsArray[i]).parent)
            field2.parent.remove(field2);
        ReflectionObject.prototype.onRemove.call(this, parent);
      };
      OneOf2.d = function decorateOneOf() {
        var fieldNames = new Array(arguments.length), index = 0;
        while (index < arguments.length)
          fieldNames[index] = arguments[index++];
        return function oneOfDecorator(prototype, oneofName) {
          util2.decorateType(prototype.constructor).add(new OneOf2(oneofName, fieldNames));
          Object.defineProperty(prototype, oneofName, {
            get: util2.oneOfGetter(fieldNames),
            set: util2.oneOfSetter(fieldNames)
          });
        };
      };
      return oneof;
    }
    var namespace;
    var hasRequiredNamespace;
    function requireNamespace() {
      if (hasRequiredNamespace)
        return namespace;
      hasRequiredNamespace = 1;
      namespace = Namespace;
      var ReflectionObject = requireObject();
      ((Namespace.prototype = Object.create(ReflectionObject.prototype)).constructor = Namespace).className = "Namespace";
      var Field2 = requireField(), util2 = requireUtil(), OneOf2 = requireOneof();
      var Type2, Service2, Enum2;
      Namespace.fromJSON = function fromJSON(name, json) {
        return new Namespace(name, json.options).addJSON(json.nested);
      };
      function arrayToJSON(array, toJSONOptions) {
        if (!(array && array.length))
          return void 0;
        var obj = {};
        for (var i = 0; i < array.length; ++i)
          obj[array[i].name] = array[i].toJSON(toJSONOptions);
        return obj;
      }
      Namespace.arrayToJSON = arrayToJSON;
      Namespace.isReservedId = function isReservedId(reserved, id) {
        if (reserved) {
          for (var i = 0; i < reserved.length; ++i)
            if (typeof reserved[i] !== "string" && reserved[i][0] <= id && reserved[i][1] > id)
              return true;
        }
        return false;
      };
      Namespace.isReservedName = function isReservedName(reserved, name) {
        if (reserved) {
          for (var i = 0; i < reserved.length; ++i)
            if (reserved[i] === name)
              return true;
        }
        return false;
      };
      function Namespace(name, options) {
        ReflectionObject.call(this, name, options);
        this.nested = void 0;
        this._nestedArray = null;
      }
      function clearCache(namespace2) {
        namespace2._nestedArray = null;
        return namespace2;
      }
      Object.defineProperty(Namespace.prototype, "nestedArray", {
        get: function() {
          return this._nestedArray || (this._nestedArray = util2.toArray(this.nested));
        }
      });
      Namespace.prototype.toJSON = function toJSON(toJSONOptions) {
        return util2.toObject([
          "options",
          this.options,
          "nested",
          arrayToJSON(this.nestedArray, toJSONOptions)
        ]);
      };
      Namespace.prototype.addJSON = function addJSON(nestedJson) {
        var ns = this;
        if (nestedJson) {
          for (var names = Object.keys(nestedJson), i = 0, nested2; i < names.length; ++i) {
            nested2 = nestedJson[names[i]];
            ns.add(
              (nested2.fields !== void 0 ? Type2.fromJSON : nested2.values !== void 0 ? Enum2.fromJSON : nested2.methods !== void 0 ? Service2.fromJSON : nested2.id !== void 0 ? Field2.fromJSON : Namespace.fromJSON)(names[i], nested2)
            );
          }
        }
        return this;
      };
      Namespace.prototype.get = function get(name) {
        return this.nested && this.nested[name] || null;
      };
      Namespace.prototype.getEnum = function getEnum(name) {
        if (this.nested && this.nested[name] instanceof Enum2)
          return this.nested[name].values;
        throw Error("no such enum: " + name);
      };
      Namespace.prototype.add = function add2(object2) {
        if (!(object2 instanceof Field2 && object2.extend !== void 0 || object2 instanceof Type2 || object2 instanceof OneOf2 || object2 instanceof Enum2 || object2 instanceof Service2 || object2 instanceof Namespace))
          throw TypeError("object must be a valid nested object");
        if (!this.nested)
          this.nested = {};
        else {
          var prev = this.get(object2.name);
          if (prev) {
            if (prev instanceof Namespace && object2 instanceof Namespace && !(prev instanceof Type2 || prev instanceof Service2)) {
              var nested2 = prev.nestedArray;
              for (var i = 0; i < nested2.length; ++i)
                object2.add(nested2[i]);
              this.remove(prev);
              if (!this.nested)
                this.nested = {};
              object2.setOptions(prev.options, true);
            } else
              throw Error("duplicate name '" + object2.name + "' in " + this);
          }
        }
        this.nested[object2.name] = object2;
        object2.onAdd(this);
        return clearCache(this);
      };
      Namespace.prototype.remove = function remove(object2) {
        if (!(object2 instanceof ReflectionObject))
          throw TypeError("object must be a ReflectionObject");
        if (object2.parent !== this)
          throw Error(object2 + " is not a member of " + this);
        delete this.nested[object2.name];
        if (!Object.keys(this.nested).length)
          this.nested = void 0;
        object2.onRemove(this);
        return clearCache(this);
      };
      Namespace.prototype.define = function define(path2, json) {
        if (util2.isString(path2))
          path2 = path2.split(".");
        else if (!Array.isArray(path2))
          throw TypeError("illegal path");
        if (path2 && path2.length && path2[0] === "")
          throw Error("path must be relative");
        var ptr = this;
        while (path2.length > 0) {
          var part = path2.shift();
          if (ptr.nested && ptr.nested[part]) {
            ptr = ptr.nested[part];
            if (!(ptr instanceof Namespace))
              throw Error("path conflicts with non-namespace objects");
          } else
            ptr.add(ptr = new Namespace(part));
        }
        if (json)
          ptr.addJSON(json);
        return ptr;
      };
      Namespace.prototype.resolveAll = function resolveAll() {
        var nested2 = this.nestedArray, i = 0;
        while (i < nested2.length)
          if (nested2[i] instanceof Namespace)
            nested2[i++].resolveAll();
          else
            nested2[i++].resolve();
        return this.resolve();
      };
      Namespace.prototype.lookup = function lookup(path2, filterTypes, parentAlreadyChecked) {
        if (typeof filterTypes === "boolean") {
          parentAlreadyChecked = filterTypes;
          filterTypes = void 0;
        } else if (filterTypes && !Array.isArray(filterTypes))
          filterTypes = [filterTypes];
        if (util2.isString(path2) && path2.length) {
          if (path2 === ".")
            return this.root;
          path2 = path2.split(".");
        } else if (!path2.length)
          return this;
        if (path2[0] === "")
          return this.root.lookup(path2.slice(1), filterTypes);
        var found = this.get(path2[0]);
        if (found) {
          if (path2.length === 1) {
            if (!filterTypes || filterTypes.indexOf(found.constructor) > -1)
              return found;
          } else if (found instanceof Namespace && (found = found.lookup(path2.slice(1), filterTypes, true)))
            return found;
        } else
          for (var i = 0; i < this.nestedArray.length; ++i)
            if (this._nestedArray[i] instanceof Namespace && (found = this._nestedArray[i].lookup(path2, filterTypes, true)))
              return found;
        if (this.parent === null || parentAlreadyChecked)
          return null;
        return this.parent.lookup(path2, filterTypes);
      };
      Namespace.prototype.lookupType = function lookupType(path2) {
        var found = this.lookup(path2, [Type2]);
        if (!found)
          throw Error("no such type: " + path2);
        return found;
      };
      Namespace.prototype.lookupEnum = function lookupEnum(path2) {
        var found = this.lookup(path2, [Enum2]);
        if (!found)
          throw Error("no such Enum '" + path2 + "' in " + this);
        return found;
      };
      Namespace.prototype.lookupTypeOrEnum = function lookupTypeOrEnum(path2) {
        var found = this.lookup(path2, [Type2, Enum2]);
        if (!found)
          throw Error("no such Type or Enum '" + path2 + "' in " + this);
        return found;
      };
      Namespace.prototype.lookupService = function lookupService(path2) {
        var found = this.lookup(path2, [Service2]);
        if (!found)
          throw Error("no such Service '" + path2 + "' in " + this);
        return found;
      };
      Namespace._configure = function(Type_, Service_, Enum_) {
        Type2 = Type_;
        Service2 = Service_;
        Enum2 = Enum_;
      };
      return namespace;
    }
    var mapfield;
    var hasRequiredMapfield;
    function requireMapfield() {
      if (hasRequiredMapfield)
        return mapfield;
      hasRequiredMapfield = 1;
      mapfield = MapField2;
      var Field2 = requireField();
      ((MapField2.prototype = Object.create(Field2.prototype)).constructor = MapField2).className = "MapField";
      var types2 = requireTypes(), util2 = requireUtil();
      function MapField2(name, id, keyType, type2, options, comment2) {
        Field2.call(this, name, id, type2, void 0, void 0, options, comment2);
        if (!util2.isString(keyType))
          throw TypeError("keyType must be a string");
        this.keyType = keyType;
        this.resolvedKeyType = null;
        this.map = true;
      }
      MapField2.fromJSON = function fromJSON(name, json) {
        return new MapField2(name, json.id, json.keyType, json.type, json.options, json.comment);
      };
      MapField2.prototype.toJSON = function toJSON(toJSONOptions) {
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "keyType",
          this.keyType,
          "type",
          this.type,
          "id",
          this.id,
          "extend",
          this.extend,
          "options",
          this.options,
          "comment",
          keepComments ? this.comment : void 0
        ]);
      };
      MapField2.prototype.resolve = function resolve() {
        if (this.resolved)
          return this;
        if (types2.mapKey[this.keyType] === void 0)
          throw Error("invalid key type: " + this.keyType);
        return Field2.prototype.resolve.call(this);
      };
      MapField2.d = function decorateMapField(fieldId, fieldKeyType, fieldValueType) {
        if (typeof fieldValueType === "function")
          fieldValueType = util2.decorateType(fieldValueType).name;
        else if (fieldValueType && typeof fieldValueType === "object")
          fieldValueType = util2.decorateEnum(fieldValueType).name;
        return function mapFieldDecorator(prototype, fieldName) {
          util2.decorateType(prototype.constructor).add(new MapField2(fieldName, fieldId, fieldKeyType, fieldValueType));
        };
      };
      return mapfield;
    }
    var method;
    var hasRequiredMethod;
    function requireMethod() {
      if (hasRequiredMethod)
        return method;
      hasRequiredMethod = 1;
      method = Method2;
      var ReflectionObject = requireObject();
      ((Method2.prototype = Object.create(ReflectionObject.prototype)).constructor = Method2).className = "Method";
      var util2 = requireUtil();
      function Method2(name, type2, requestType, responseType, requestStream, responseStream, options, comment2, parsedOptions) {
        if (util2.isObject(requestStream)) {
          options = requestStream;
          requestStream = responseStream = void 0;
        } else if (util2.isObject(responseStream)) {
          options = responseStream;
          responseStream = void 0;
        }
        if (!(type2 === void 0 || util2.isString(type2)))
          throw TypeError("type must be a string");
        if (!util2.isString(requestType))
          throw TypeError("requestType must be a string");
        if (!util2.isString(responseType))
          throw TypeError("responseType must be a string");
        ReflectionObject.call(this, name, options);
        this.type = type2 || "rpc";
        this.requestType = requestType;
        this.requestStream = requestStream ? true : void 0;
        this.responseType = responseType;
        this.responseStream = responseStream ? true : void 0;
        this.resolvedRequestType = null;
        this.resolvedResponseType = null;
        this.comment = comment2;
        this.parsedOptions = parsedOptions;
      }
      Method2.fromJSON = function fromJSON(name, json) {
        return new Method2(name, json.type, json.requestType, json.responseType, json.requestStream, json.responseStream, json.options, json.comment, json.parsedOptions);
      };
      Method2.prototype.toJSON = function toJSON(toJSONOptions) {
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "type",
          this.type !== "rpc" && this.type || void 0,
          "requestType",
          this.requestType,
          "requestStream",
          this.requestStream,
          "responseType",
          this.responseType,
          "responseStream",
          this.responseStream,
          "options",
          this.options,
          "comment",
          keepComments ? this.comment : void 0,
          "parsedOptions",
          this.parsedOptions
        ]);
      };
      Method2.prototype.resolve = function resolve() {
        if (this.resolved)
          return this;
        this.resolvedRequestType = this.parent.lookupType(this.requestType);
        this.resolvedResponseType = this.parent.lookupType(this.responseType);
        return ReflectionObject.prototype.resolve.call(this);
      };
      return method;
    }
    var service$1;
    var hasRequiredService;
    function requireService() {
      if (hasRequiredService)
        return service$1;
      hasRequiredService = 1;
      service$1 = Service2;
      var Namespace = requireNamespace();
      ((Service2.prototype = Object.create(Namespace.prototype)).constructor = Service2).className = "Service";
      var Method2 = requireMethod(), util2 = requireUtil(), rpc$1 = rpc;
      function Service2(name, options) {
        Namespace.call(this, name, options);
        this.methods = {};
        this._methodsArray = null;
      }
      Service2.fromJSON = function fromJSON(name, json) {
        var service2 = new Service2(name, json.options);
        if (json.methods)
          for (var names = Object.keys(json.methods), i = 0; i < names.length; ++i)
            service2.add(Method2.fromJSON(names[i], json.methods[names[i]]));
        if (json.nested)
          service2.addJSON(json.nested);
        service2.comment = json.comment;
        return service2;
      };
      Service2.prototype.toJSON = function toJSON(toJSONOptions) {
        var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "options",
          inherited && inherited.options || void 0,
          "methods",
          Namespace.arrayToJSON(this.methodsArray, toJSONOptions) || {},
          "nested",
          inherited && inherited.nested || void 0,
          "comment",
          keepComments ? this.comment : void 0
        ]);
      };
      Object.defineProperty(Service2.prototype, "methodsArray", {
        get: function() {
          return this._methodsArray || (this._methodsArray = util2.toArray(this.methods));
        }
      });
      function clearCache(service2) {
        service2._methodsArray = null;
        return service2;
      }
      Service2.prototype.get = function get(name) {
        return this.methods[name] || Namespace.prototype.get.call(this, name);
      };
      Service2.prototype.resolveAll = function resolveAll() {
        var methods = this.methodsArray;
        for (var i = 0; i < methods.length; ++i)
          methods[i].resolve();
        return Namespace.prototype.resolve.call(this);
      };
      Service2.prototype.add = function add2(object2) {
        if (this.get(object2.name))
          throw Error("duplicate name '" + object2.name + "' in " + this);
        if (object2 instanceof Method2) {
          this.methods[object2.name] = object2;
          object2.parent = this;
          return clearCache(this);
        }
        return Namespace.prototype.add.call(this, object2);
      };
      Service2.prototype.remove = function remove(object2) {
        if (object2 instanceof Method2) {
          if (this.methods[object2.name] !== object2)
            throw Error(object2 + " is not a member of " + this);
          delete this.methods[object2.name];
          object2.parent = null;
          return clearCache(this);
        }
        return Namespace.prototype.remove.call(this, object2);
      };
      Service2.prototype.create = function create2(rpcImpl, requestDelimited, responseDelimited) {
        var rpcService = new rpc$1.Service(rpcImpl, requestDelimited, responseDelimited);
        for (var i = 0, method2; i < this.methodsArray.length; ++i) {
          var methodName = util2.lcFirst((method2 = this._methodsArray[i]).resolve().name).replace(/[^$\w_]/g, "");
          rpcService[methodName] = util2.codegen(["r", "c"], util2.isReserved(methodName) ? methodName + "_" : methodName)("return this.rpcCall(m,q,s,r,c)")({
            m: method2,
            q: method2.resolvedRequestType.ctor,
            s: method2.resolvedResponseType.ctor
          });
        }
        return rpcService;
      };
      return service$1;
    }
    var message = Message;
    var util$1 = requireMinimal();
    function Message(properties) {
      if (properties)
        for (var keys2 = Object.keys(properties), i = 0; i < keys2.length; ++i)
          this[keys2[i]] = properties[keys2[i]];
    }
    Message.create = function create2(properties) {
      return this.$type.create(properties);
    };
    Message.encode = function encode(message2, writer2) {
      return this.$type.encode(message2, writer2);
    };
    Message.encodeDelimited = function encodeDelimited(message2, writer2) {
      return this.$type.encodeDelimited(message2, writer2);
    };
    Message.decode = function decode(reader2) {
      return this.$type.decode(reader2);
    };
    Message.decodeDelimited = function decodeDelimited(reader2) {
      return this.$type.decodeDelimited(reader2);
    };
    Message.verify = function verify(message2) {
      return this.$type.verify(message2);
    };
    Message.fromObject = function fromObject(object2) {
      return this.$type.fromObject(object2);
    };
    Message.toObject = function toObject(message2, options) {
      return this.$type.toObject(message2, options);
    };
    Message.prototype.toJSON = function toJSON() {
      return this.$type.toObject(this, util$1.toJSONOptions);
    };
    var decoder_1;
    var hasRequiredDecoder;
    function requireDecoder() {
      if (hasRequiredDecoder)
        return decoder_1;
      hasRequiredDecoder = 1;
      decoder_1 = decoder2;
      var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
      function missing(field2) {
        return "missing required '" + field2.name + "'";
      }
      function decoder2(mtype) {
        var gen = util2.codegen(["r", "l"], mtype.name + "$decode")("if(!(r instanceof Reader))")("r=Reader.create(r)")("var c=l===undefined?r.len:r.pos+l,m=new this.ctor" + (mtype.fieldsArray.filter(function(field3) {
          return field3.map;
        }).length ? ",k,value" : ""))("while(r.pos<c){")("var t=r.uint32()");
        if (mtype.group)
          gen("if((t&7)===4)")("break");
        gen("switch(t>>>3){");
        var i = 0;
        for (; i < mtype.fieldsArray.length; ++i) {
          var field2 = mtype._fieldsArray[i].resolve(), type2 = field2.resolvedType instanceof Enum2 ? "int32" : field2.type, ref = "m" + util2.safeProp(field2.name);
          gen("case %i: {", field2.id);
          if (field2.map) {
            gen("if(%s===util.emptyObject)", ref)("%s={}", ref)("var c2 = r.uint32()+r.pos");
            if (types2.defaults[field2.keyType] !== void 0)
              gen("k=%j", types2.defaults[field2.keyType]);
            else
              gen("k=null");
            if (types2.defaults[type2] !== void 0)
              gen("value=%j", types2.defaults[type2]);
            else
              gen("value=null");
            gen("while(r.pos<c2){")("var tag2=r.uint32()")("switch(tag2>>>3){")("case 1: k=r.%s(); break", field2.keyType)("case 2:");
            if (types2.basic[type2] === void 0)
              gen("value=types[%i].decode(r,r.uint32())", i);
            else
              gen("value=r.%s()", type2);
            gen("break")("default:")("r.skipType(tag2&7)")("break")("}")("}");
            if (types2.long[field2.keyType] !== void 0)
              gen('%s[typeof k==="object"?util.longToHash(k):k]=value', ref);
            else
              gen("%s[k]=value", ref);
          } else if (field2.repeated) {
            gen("if(!(%s&&%s.length))", ref, ref)("%s=[]", ref);
            if (types2.packed[type2] !== void 0)
              gen("if((t&7)===2){")("var c2=r.uint32()+r.pos")("while(r.pos<c2)")("%s.push(r.%s())", ref, type2)("}else");
            if (types2.basic[type2] === void 0)
              gen(field2.resolvedType.group ? "%s.push(types[%i].decode(r))" : "%s.push(types[%i].decode(r,r.uint32()))", ref, i);
            else
              gen("%s.push(r.%s())", ref, type2);
          } else if (types2.basic[type2] === void 0)
            gen(field2.resolvedType.group ? "%s=types[%i].decode(r)" : "%s=types[%i].decode(r,r.uint32())", ref, i);
          else
            gen("%s=r.%s()", ref, type2);
          gen("break")("}");
        }
        gen("default:")("r.skipType(t&7)")("break")("}")("}");
        for (i = 0; i < mtype._fieldsArray.length; ++i) {
          var rfield = mtype._fieldsArray[i];
          if (rfield.required)
            gen("if(!m.hasOwnProperty(%j))", rfield.name)("throw util.ProtocolError(%j,{instance:m})", missing(rfield));
        }
        return gen("return m");
      }
      return decoder_1;
    }
    var verifier_1;
    var hasRequiredVerifier;
    function requireVerifier() {
      if (hasRequiredVerifier)
        return verifier_1;
      hasRequiredVerifier = 1;
      verifier_1 = verifier;
      var Enum2 = require_enum(), util2 = requireUtil();
      function invalid(field2, expected) {
        return field2.name + ": " + expected + (field2.repeated && expected !== "array" ? "[]" : field2.map && expected !== "object" ? "{k:" + field2.keyType + "}" : "") + " expected";
      }
      function genVerifyValue(gen, field2, fieldIndex, ref) {
        if (field2.resolvedType) {
          if (field2.resolvedType instanceof Enum2) {
            gen("switch(%s){", ref)("default:")("return%j", invalid(field2, "enum value"));
            for (var keys2 = Object.keys(field2.resolvedType.values), j = 0; j < keys2.length; ++j)
              gen("case %i:", field2.resolvedType.values[keys2[j]]);
            gen("break")("}");
          } else {
            gen("{")("var e=types[%i].verify(%s);", fieldIndex, ref)("if(e)")("return%j+e", field2.name + ".")("}");
          }
        } else {
          switch (field2.type) {
            case "int32":
            case "uint32":
            case "sint32":
            case "fixed32":
            case "sfixed32":
              gen("if(!util.isInteger(%s))", ref)("return%j", invalid(field2, "integer"));
              break;
            case "int64":
            case "uint64":
            case "sint64":
            case "fixed64":
            case "sfixed64":
              gen("if(!util.isInteger(%s)&&!(%s&&util.isInteger(%s.low)&&util.isInteger(%s.high)))", ref, ref, ref, ref)("return%j", invalid(field2, "integer|Long"));
              break;
            case "float":
            case "double":
              gen('if(typeof %s!=="number")', ref)("return%j", invalid(field2, "number"));
              break;
            case "bool":
              gen('if(typeof %s!=="boolean")', ref)("return%j", invalid(field2, "boolean"));
              break;
            case "string":
              gen("if(!util.isString(%s))", ref)("return%j", invalid(field2, "string"));
              break;
            case "bytes":
              gen('if(!(%s&&typeof %s.length==="number"||util.isString(%s)))', ref, ref, ref)("return%j", invalid(field2, "buffer"));
              break;
          }
        }
        return gen;
      }
      function genVerifyKey(gen, field2, ref) {
        switch (field2.keyType) {
          case "int32":
          case "uint32":
          case "sint32":
          case "fixed32":
          case "sfixed32":
            gen("if(!util.key32Re.test(%s))", ref)("return%j", invalid(field2, "integer key"));
            break;
          case "int64":
          case "uint64":
          case "sint64":
          case "fixed64":
          case "sfixed64":
            gen("if(!util.key64Re.test(%s))", ref)("return%j", invalid(field2, "integer|Long key"));
            break;
          case "bool":
            gen("if(!util.key2Re.test(%s))", ref)("return%j", invalid(field2, "boolean key"));
            break;
        }
        return gen;
      }
      function verifier(mtype) {
        var gen = util2.codegen(["m"], mtype.name + "$verify")('if(typeof m!=="object"||m===null)')("return%j", "object expected");
        var oneofs = mtype.oneofsArray, seenFirstField = {};
        if (oneofs.length)
          gen("var p={}");
        for (var i = 0; i < mtype.fieldsArray.length; ++i) {
          var field2 = mtype._fieldsArray[i].resolve(), ref = "m" + util2.safeProp(field2.name);
          if (field2.optional)
            gen("if(%s!=null&&m.hasOwnProperty(%j)){", ref, field2.name);
          if (field2.map) {
            gen("if(!util.isObject(%s))", ref)("return%j", invalid(field2, "object"))("var k=Object.keys(%s)", ref)("for(var i=0;i<k.length;++i){");
            genVerifyKey(gen, field2, "k[i]");
            genVerifyValue(gen, field2, i, ref + "[k[i]]")("}");
          } else if (field2.repeated) {
            gen("if(!Array.isArray(%s))", ref)("return%j", invalid(field2, "array"))("for(var i=0;i<%s.length;++i){", ref);
            genVerifyValue(gen, field2, i, ref + "[i]")("}");
          } else {
            if (field2.partOf) {
              var oneofProp = util2.safeProp(field2.partOf.name);
              if (seenFirstField[field2.partOf.name] === 1)
                gen("if(p%s===1)", oneofProp)("return%j", field2.partOf.name + ": multiple values");
              seenFirstField[field2.partOf.name] = 1;
              gen("p%s=1", oneofProp);
            }
            genVerifyValue(gen, field2, i, ref);
          }
          if (field2.optional)
            gen("}");
        }
        return gen("return null");
      }
      return verifier_1;
    }
    var converter = {};
    var hasRequiredConverter;
    function requireConverter() {
      if (hasRequiredConverter)
        return converter;
      hasRequiredConverter = 1;
      (function(exports2) {
        var converter2 = exports2;
        var Enum2 = require_enum(), util2 = requireUtil();
        function genValuePartial_fromObject(gen, field2, fieldIndex, prop) {
          var defaultAlreadyEmitted = false;
          if (field2.resolvedType) {
            if (field2.resolvedType instanceof Enum2) {
              gen("switch(d%s){", prop);
              for (var values = field2.resolvedType.values, keys2 = Object.keys(values), i = 0; i < keys2.length; ++i) {
                if (values[keys2[i]] === field2.typeDefault && !defaultAlreadyEmitted) {
                  gen("default:")('if(typeof(d%s)==="number"){m%s=d%s;break}', prop, prop, prop);
                  if (!field2.repeated)
                    gen("break");
                  defaultAlreadyEmitted = true;
                }
                gen("case%j:", keys2[i])("case %i:", values[keys2[i]])("m%s=%j", prop, values[keys2[i]])("break");
              }
              gen("}");
            } else
              gen('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field2.fullName + ": object expected")("m%s=types[%i].fromObject(d%s)", prop, fieldIndex, prop);
          } else {
            var isUnsigned = false;
            switch (field2.type) {
              case "double":
              case "float":
                gen("m%s=Number(d%s)", prop, prop);
                break;
              case "uint32":
              case "fixed32":
                gen("m%s=d%s>>>0", prop, prop);
                break;
              case "int32":
              case "sint32":
              case "sfixed32":
                gen("m%s=d%s|0", prop, prop);
                break;
              case "uint64":
                isUnsigned = true;
              case "int64":
              case "sint64":
              case "fixed64":
              case "sfixed64":
                gen("if(util.Long)")("(m%s=util.Long.fromValue(d%s)).unsigned=%j", prop, prop, isUnsigned)('else if(typeof d%s==="string")', prop)("m%s=parseInt(d%s,10)", prop, prop)('else if(typeof d%s==="number")', prop)("m%s=d%s", prop, prop)('else if(typeof d%s==="object")', prop)("m%s=new util.LongBits(d%s.low>>>0,d%s.high>>>0).toNumber(%s)", prop, prop, prop, isUnsigned ? "true" : "");
                break;
              case "bytes":
                gen('if(typeof d%s==="string")', prop)("util.base64.decode(d%s,m%s=util.newBuffer(util.base64.length(d%s)),0)", prop, prop, prop)("else if(d%s.length >= 0)", prop)("m%s=d%s", prop, prop);
                break;
              case "string":
                gen("m%s=String(d%s)", prop, prop);
                break;
              case "bool":
                gen("m%s=Boolean(d%s)", prop, prop);
                break;
            }
          }
          return gen;
        }
        converter2.fromObject = function fromObject(mtype) {
          var fields = mtype.fieldsArray;
          var gen = util2.codegen(["d"], mtype.name + "$fromObject")("if(d instanceof this.ctor)")("return d");
          if (!fields.length)
            return gen("return new this.ctor");
          gen("var m=new this.ctor");
          for (var i = 0; i < fields.length; ++i) {
            var field2 = fields[i].resolve(), prop = util2.safeProp(field2.name);
            if (field2.map) {
              gen("if(d%s){", prop)('if(typeof d%s!=="object")', prop)("throw TypeError(%j)", field2.fullName + ": object expected")("m%s={}", prop)("for(var ks=Object.keys(d%s),i=0;i<ks.length;++i){", prop);
              genValuePartial_fromObject(gen, field2, i, prop + "[ks[i]]")("}")("}");
            } else if (field2.repeated) {
              gen("if(d%s){", prop)("if(!Array.isArray(d%s))", prop)("throw TypeError(%j)", field2.fullName + ": array expected")("m%s=[]", prop)("for(var i=0;i<d%s.length;++i){", prop);
              genValuePartial_fromObject(gen, field2, i, prop + "[i]")("}")("}");
            } else {
              if (!(field2.resolvedType instanceof Enum2))
                gen("if(d%s!=null){", prop);
              genValuePartial_fromObject(gen, field2, i, prop);
              if (!(field2.resolvedType instanceof Enum2))
                gen("}");
            }
          }
          return gen("return m");
        };
        function genValuePartial_toObject(gen, field2, fieldIndex, prop) {
          if (field2.resolvedType) {
            if (field2.resolvedType instanceof Enum2)
              gen("d%s=o.enums===String?(types[%i].values[m%s]===undefined?m%s:types[%i].values[m%s]):m%s", prop, fieldIndex, prop, prop, fieldIndex, prop, prop);
            else
              gen("d%s=types[%i].toObject(m%s,o)", prop, fieldIndex, prop);
          } else {
            var isUnsigned = false;
            switch (field2.type) {
              case "double":
              case "float":
                gen("d%s=o.json&&!isFinite(m%s)?String(m%s):m%s", prop, prop, prop, prop);
                break;
              case "uint64":
                isUnsigned = true;
              case "int64":
              case "sint64":
              case "fixed64":
              case "sfixed64":
                gen('if(typeof m%s==="number")', prop)("d%s=o.longs===String?String(m%s):m%s", prop, prop, prop)("else")("d%s=o.longs===String?util.Long.prototype.toString.call(m%s):o.longs===Number?new util.LongBits(m%s.low>>>0,m%s.high>>>0).toNumber(%s):m%s", prop, prop, prop, prop, isUnsigned ? "true" : "", prop);
                break;
              case "bytes":
                gen("d%s=o.bytes===String?util.base64.encode(m%s,0,m%s.length):o.bytes===Array?Array.prototype.slice.call(m%s):m%s", prop, prop, prop, prop, prop);
                break;
              default:
                gen("d%s=m%s", prop, prop);
                break;
            }
          }
          return gen;
        }
        converter2.toObject = function toObject(mtype) {
          var fields = mtype.fieldsArray.slice().sort(util2.compareFieldsById);
          if (!fields.length)
            return util2.codegen()("return {}");
          var gen = util2.codegen(["m", "o"], mtype.name + "$toObject")("if(!o)")("o={}")("var d={}");
          var repeatedFields = [], mapFields = [], normalFields = [], i = 0;
          for (; i < fields.length; ++i)
            if (!fields[i].partOf)
              (fields[i].resolve().repeated ? repeatedFields : fields[i].map ? mapFields : normalFields).push(fields[i]);
          if (repeatedFields.length) {
            gen("if(o.arrays||o.defaults){");
            for (i = 0; i < repeatedFields.length; ++i)
              gen("d%s=[]", util2.safeProp(repeatedFields[i].name));
            gen("}");
          }
          if (mapFields.length) {
            gen("if(o.objects||o.defaults){");
            for (i = 0; i < mapFields.length; ++i)
              gen("d%s={}", util2.safeProp(mapFields[i].name));
            gen("}");
          }
          if (normalFields.length) {
            gen("if(o.defaults){");
            for (i = 0; i < normalFields.length; ++i) {
              var field2 = normalFields[i], prop = util2.safeProp(field2.name);
              if (field2.resolvedType instanceof Enum2)
                gen("d%s=o.enums===String?%j:%j", prop, field2.resolvedType.valuesById[field2.typeDefault], field2.typeDefault);
              else if (field2.long)
                gen("if(util.Long){")("var n=new util.Long(%i,%i,%j)", field2.typeDefault.low, field2.typeDefault.high, field2.typeDefault.unsigned)("d%s=o.longs===String?n.toString():o.longs===Number?n.toNumber():n", prop)("}else")("d%s=o.longs===String?%j:%i", prop, field2.typeDefault.toString(), field2.typeDefault.toNumber());
              else if (field2.bytes) {
                var arrayDefault = "[" + Array.prototype.slice.call(field2.typeDefault).join(",") + "]";
                gen("if(o.bytes===String)d%s=%j", prop, String.fromCharCode.apply(String, field2.typeDefault))("else{")("d%s=%s", prop, arrayDefault)("if(o.bytes!==Array)d%s=util.newBuffer(d%s)", prop, prop)("}");
              } else
                gen("d%s=%j", prop, field2.typeDefault);
            }
            gen("}");
          }
          var hasKs2 = false;
          for (i = 0; i < fields.length; ++i) {
            var field2 = fields[i], index = mtype._fieldsArray.indexOf(field2), prop = util2.safeProp(field2.name);
            if (field2.map) {
              if (!hasKs2) {
                hasKs2 = true;
                gen("var ks2");
              }
              gen("if(m%s&&(ks2=Object.keys(m%s)).length){", prop, prop)("d%s={}", prop)("for(var j=0;j<ks2.length;++j){");
              genValuePartial_toObject(gen, field2, index, prop + "[ks2[j]]")("}");
            } else if (field2.repeated) {
              gen("if(m%s&&m%s.length){", prop, prop)("d%s=[]", prop)("for(var j=0;j<m%s.length;++j){", prop);
              genValuePartial_toObject(gen, field2, index, prop + "[j]")("}");
            } else {
              gen("if(m%s!=null&&m.hasOwnProperty(%j)){", prop, field2.name);
              genValuePartial_toObject(gen, field2, index, prop);
              if (field2.partOf)
                gen("if(o.oneofs)")("d%s=%j", util2.safeProp(field2.partOf.name), field2.name);
            }
            gen("}");
          }
          return gen("return d");
        };
      })(converter);
      return converter;
    }
    var wrappers = {};
    (function(exports2) {
      var wrappers2 = exports2;
      var Message2 = message;
      wrappers2[".google.protobuf.Any"] = {
        fromObject: function(object2) {
          if (object2 && object2["@type"]) {
            var name = object2["@type"].substring(object2["@type"].lastIndexOf("/") + 1);
            var type2 = this.lookup(name);
            if (type2) {
              var type_url = object2["@type"].charAt(0) === "." ? object2["@type"].slice(1) : object2["@type"];
              if (type_url.indexOf("/") === -1) {
                type_url = "/" + type_url;
              }
              return this.create({
                type_url,
                value: type2.encode(type2.fromObject(object2)).finish()
              });
            }
          }
          return this.fromObject(object2);
        },
        toObject: function(message2, options) {
          var googleApi = "type.googleapis.com/";
          var prefix = "";
          var name = "";
          if (options && options.json && message2.type_url && message2.value) {
            name = message2.type_url.substring(message2.type_url.lastIndexOf("/") + 1);
            prefix = message2.type_url.substring(0, message2.type_url.lastIndexOf("/") + 1);
            var type2 = this.lookup(name);
            if (type2)
              message2 = type2.decode(message2.value);
          }
          if (!(message2 instanceof this.ctor) && message2 instanceof Message2) {
            var object2 = message2.$type.toObject(message2, options);
            var messageName = message2.$type.fullName[0] === "." ? message2.$type.fullName.slice(1) : message2.$type.fullName;
            if (prefix === "") {
              prefix = googleApi;
            }
            name = prefix + messageName;
            object2["@type"] = name;
            return object2;
          }
          return this.toObject(message2, options);
        }
      };
    })(wrappers);
    var type;
    var hasRequiredType;
    function requireType() {
      if (hasRequiredType)
        return type;
      hasRequiredType = 1;
      type = Type2;
      var Namespace = requireNamespace();
      ((Type2.prototype = Object.create(Namespace.prototype)).constructor = Type2).className = "Type";
      var Enum2 = require_enum(), OneOf2 = requireOneof(), Field2 = requireField(), MapField2 = requireMapfield(), Service2 = requireService(), Message2 = message, Reader2 = reader, Writer2 = writer, util2 = requireUtil(), encoder = requireEncoder(), decoder2 = requireDecoder(), verifier = requireVerifier(), converter2 = requireConverter(), wrappers$1 = wrappers;
      function Type2(name, options) {
        Namespace.call(this, name, options);
        this.fields = {};
        this.oneofs = void 0;
        this.extensions = void 0;
        this.reserved = void 0;
        this.group = void 0;
        this._fieldsById = null;
        this._fieldsArray = null;
        this._oneofsArray = null;
        this._ctor = null;
      }
      Object.defineProperties(Type2.prototype, {
        fieldsById: {
          get: function() {
            if (this._fieldsById)
              return this._fieldsById;
            this._fieldsById = {};
            for (var names = Object.keys(this.fields), i = 0; i < names.length; ++i) {
              var field2 = this.fields[names[i]], id = field2.id;
              if (this._fieldsById[id])
                throw Error("duplicate id " + id + " in " + this);
              this._fieldsById[id] = field2;
            }
            return this._fieldsById;
          }
        },
        fieldsArray: {
          get: function() {
            return this._fieldsArray || (this._fieldsArray = util2.toArray(this.fields));
          }
        },
        oneofsArray: {
          get: function() {
            return this._oneofsArray || (this._oneofsArray = util2.toArray(this.oneofs));
          }
        },
        ctor: {
          get: function() {
            return this._ctor || (this.ctor = Type2.generateConstructor(this)());
          },
          set: function(ctor) {
            var prototype = ctor.prototype;
            if (!(prototype instanceof Message2)) {
              (ctor.prototype = new Message2()).constructor = ctor;
              util2.merge(ctor.prototype, prototype);
            }
            ctor.$type = ctor.prototype.$type = this;
            util2.merge(ctor, Message2, true);
            this._ctor = ctor;
            var i = 0;
            for (; i < this.fieldsArray.length; ++i)
              this._fieldsArray[i].resolve();
            var ctorProperties = {};
            for (i = 0; i < this.oneofsArray.length; ++i)
              ctorProperties[this._oneofsArray[i].resolve().name] = {
                get: util2.oneOfGetter(this._oneofsArray[i].oneof),
                set: util2.oneOfSetter(this._oneofsArray[i].oneof)
              };
            if (i)
              Object.defineProperties(ctor.prototype, ctorProperties);
          }
        }
      });
      Type2.generateConstructor = function generateConstructor(mtype) {
        var gen = util2.codegen(["p"], mtype.name);
        for (var i = 0, field2; i < mtype.fieldsArray.length; ++i)
          if ((field2 = mtype._fieldsArray[i]).map)
            gen("this%s={}", util2.safeProp(field2.name));
          else if (field2.repeated)
            gen("this%s=[]", util2.safeProp(field2.name));
        return gen("if(p)for(var ks=Object.keys(p),i=0;i<ks.length;++i)if(p[ks[i]]!=null)")("this[ks[i]]=p[ks[i]]");
      };
      function clearCache(type2) {
        type2._fieldsById = type2._fieldsArray = type2._oneofsArray = null;
        delete type2.encode;
        delete type2.decode;
        delete type2.verify;
        return type2;
      }
      Type2.fromJSON = function fromJSON(name, json) {
        var type2 = new Type2(name, json.options);
        type2.extensions = json.extensions;
        type2.reserved = json.reserved;
        var names = Object.keys(json.fields), i = 0;
        for (; i < names.length; ++i)
          type2.add(
            (typeof json.fields[names[i]].keyType !== "undefined" ? MapField2.fromJSON : Field2.fromJSON)(names[i], json.fields[names[i]])
          );
        if (json.oneofs)
          for (names = Object.keys(json.oneofs), i = 0; i < names.length; ++i)
            type2.add(OneOf2.fromJSON(names[i], json.oneofs[names[i]]));
        if (json.nested)
          for (names = Object.keys(json.nested), i = 0; i < names.length; ++i) {
            var nested2 = json.nested[names[i]];
            type2.add(
              (nested2.id !== void 0 ? Field2.fromJSON : nested2.fields !== void 0 ? Type2.fromJSON : nested2.values !== void 0 ? Enum2.fromJSON : nested2.methods !== void 0 ? Service2.fromJSON : Namespace.fromJSON)(names[i], nested2)
            );
          }
        if (json.extensions && json.extensions.length)
          type2.extensions = json.extensions;
        if (json.reserved && json.reserved.length)
          type2.reserved = json.reserved;
        if (json.group)
          type2.group = true;
        if (json.comment)
          type2.comment = json.comment;
        return type2;
      };
      Type2.prototype.toJSON = function toJSON(toJSONOptions) {
        var inherited = Namespace.prototype.toJSON.call(this, toJSONOptions);
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "options",
          inherited && inherited.options || void 0,
          "oneofs",
          Namespace.arrayToJSON(this.oneofsArray, toJSONOptions),
          "fields",
          Namespace.arrayToJSON(this.fieldsArray.filter(function(obj) {
            return !obj.declaringField;
          }), toJSONOptions) || {},
          "extensions",
          this.extensions && this.extensions.length ? this.extensions : void 0,
          "reserved",
          this.reserved && this.reserved.length ? this.reserved : void 0,
          "group",
          this.group || void 0,
          "nested",
          inherited && inherited.nested || void 0,
          "comment",
          keepComments ? this.comment : void 0
        ]);
      };
      Type2.prototype.resolveAll = function resolveAll() {
        var fields = this.fieldsArray, i = 0;
        while (i < fields.length)
          fields[i++].resolve();
        var oneofs = this.oneofsArray;
        i = 0;
        while (i < oneofs.length)
          oneofs[i++].resolve();
        return Namespace.prototype.resolveAll.call(this);
      };
      Type2.prototype.get = function get(name) {
        return this.fields[name] || this.oneofs && this.oneofs[name] || this.nested && this.nested[name] || null;
      };
      Type2.prototype.add = function add2(object2) {
        if (this.get(object2.name))
          throw Error("duplicate name '" + object2.name + "' in " + this);
        if (object2 instanceof Field2 && object2.extend === void 0) {
          if (this._fieldsById ? this._fieldsById[object2.id] : this.fieldsById[object2.id])
            throw Error("duplicate id " + object2.id + " in " + this);
          if (this.isReservedId(object2.id))
            throw Error("id " + object2.id + " is reserved in " + this);
          if (this.isReservedName(object2.name))
            throw Error("name '" + object2.name + "' is reserved in " + this);
          if (object2.parent)
            object2.parent.remove(object2);
          this.fields[object2.name] = object2;
          object2.message = this;
          object2.onAdd(this);
          return clearCache(this);
        }
        if (object2 instanceof OneOf2) {
          if (!this.oneofs)
            this.oneofs = {};
          this.oneofs[object2.name] = object2;
          object2.onAdd(this);
          return clearCache(this);
        }
        return Namespace.prototype.add.call(this, object2);
      };
      Type2.prototype.remove = function remove(object2) {
        if (object2 instanceof Field2 && object2.extend === void 0) {
          if (!this.fields || this.fields[object2.name] !== object2)
            throw Error(object2 + " is not a member of " + this);
          delete this.fields[object2.name];
          object2.parent = null;
          object2.onRemove(this);
          return clearCache(this);
        }
        if (object2 instanceof OneOf2) {
          if (!this.oneofs || this.oneofs[object2.name] !== object2)
            throw Error(object2 + " is not a member of " + this);
          delete this.oneofs[object2.name];
          object2.parent = null;
          object2.onRemove(this);
          return clearCache(this);
        }
        return Namespace.prototype.remove.call(this, object2);
      };
      Type2.prototype.isReservedId = function isReservedId(id) {
        return Namespace.isReservedId(this.reserved, id);
      };
      Type2.prototype.isReservedName = function isReservedName(name) {
        return Namespace.isReservedName(this.reserved, name);
      };
      Type2.prototype.create = function create2(properties) {
        return new this.ctor(properties);
      };
      Type2.prototype.setup = function setup() {
        var fullName = this.fullName, types2 = [];
        for (var i = 0; i < this.fieldsArray.length; ++i)
          types2.push(this._fieldsArray[i].resolve().resolvedType);
        this.encode = encoder(this)({
          Writer: Writer2,
          types: types2,
          util: util2
        });
        this.decode = decoder2(this)({
          Reader: Reader2,
          types: types2,
          util: util2
        });
        this.verify = verifier(this)({
          types: types2,
          util: util2
        });
        this.fromObject = converter2.fromObject(this)({
          types: types2,
          util: util2
        });
        this.toObject = converter2.toObject(this)({
          types: types2,
          util: util2
        });
        var wrapper = wrappers$1[fullName];
        if (wrapper) {
          var originalThis = Object.create(this);
          originalThis.fromObject = this.fromObject;
          this.fromObject = wrapper.fromObject.bind(originalThis);
          originalThis.toObject = this.toObject;
          this.toObject = wrapper.toObject.bind(originalThis);
        }
        return this;
      };
      Type2.prototype.encode = function encode_setup(message2, writer2) {
        return this.setup().encode(message2, writer2);
      };
      Type2.prototype.encodeDelimited = function encodeDelimited(message2, writer2) {
        return this.encode(message2, writer2 && writer2.len ? writer2.fork() : writer2).ldelim();
      };
      Type2.prototype.decode = function decode_setup(reader2, length) {
        return this.setup().decode(reader2, length);
      };
      Type2.prototype.decodeDelimited = function decodeDelimited(reader2) {
        if (!(reader2 instanceof Reader2))
          reader2 = Reader2.create(reader2);
        return this.decode(reader2, reader2.uint32());
      };
      Type2.prototype.verify = function verify_setup(message2) {
        return this.setup().verify(message2);
      };
      Type2.prototype.fromObject = function fromObject(object2) {
        return this.setup().fromObject(object2);
      };
      Type2.prototype.toObject = function toObject(message2, options) {
        return this.setup().toObject(message2, options);
      };
      Type2.d = function decorateType(typeName) {
        return function typeDecorator(target) {
          util2.decorateType(target, typeName);
        };
      };
      return type;
    }
    var root$2;
    var hasRequiredRoot;
    function requireRoot() {
      if (hasRequiredRoot)
        return root$2;
      hasRequiredRoot = 1;
      root$2 = Root2;
      var Namespace = requireNamespace();
      ((Root2.prototype = Object.create(Namespace.prototype)).constructor = Root2).className = "Root";
      var Field2 = requireField(), Enum2 = require_enum(), OneOf2 = requireOneof(), util2 = requireUtil();
      var Type2, parse2, common2;
      function Root2(options) {
        Namespace.call(this, "", options);
        this.deferred = [];
        this.files = [];
      }
      Root2.fromJSON = function fromJSON(json, root2) {
        if (!root2)
          root2 = new Root2();
        if (json.options)
          root2.setOptions(json.options);
        return root2.addJSON(json.nested);
      };
      Root2.prototype.resolvePath = util2.path.resolve;
      Root2.prototype.fetch = util2.fetch;
      function SYNC() {
      }
      Root2.prototype.load = function load(filename, options, callback) {
        if (typeof options === "function") {
          callback = options;
          options = void 0;
        }
        var self2 = this;
        if (!callback)
          return util2.asPromise(load, self2, filename, options);
        var sync = callback === SYNC;
        function finish(err, root2) {
          if (!callback)
            return;
          var cb = callback;
          callback = null;
          if (sync)
            throw err;
          cb(err, root2);
        }
        function getBundledFileName(filename2) {
          var idx = filename2.lastIndexOf("google/protobuf/");
          if (idx > -1) {
            var altname = filename2.substring(idx);
            if (altname in common2)
              return altname;
          }
          return null;
        }
        function process(filename2, source) {
          try {
            if (util2.isString(source) && source.charAt(0) === "{")
              source = JSON.parse(source);
            if (!util2.isString(source))
              self2.setOptions(source.options).addJSON(source.nested);
            else {
              parse2.filename = filename2;
              var parsed = parse2(source, self2, options), resolved2, i2 = 0;
              if (parsed.imports) {
                for (; i2 < parsed.imports.length; ++i2)
                  if (resolved2 = getBundledFileName(parsed.imports[i2]) || self2.resolvePath(filename2, parsed.imports[i2]))
                    fetch2(resolved2);
              }
              if (parsed.weakImports) {
                for (i2 = 0; i2 < parsed.weakImports.length; ++i2)
                  if (resolved2 = getBundledFileName(parsed.weakImports[i2]) || self2.resolvePath(filename2, parsed.weakImports[i2]))
                    fetch2(resolved2, true);
              }
            }
          } catch (err) {
            finish(err);
          }
          if (!sync && !queued)
            finish(null, self2);
        }
        function fetch2(filename2, weak) {
          filename2 = getBundledFileName(filename2) || filename2;
          if (self2.files.indexOf(filename2) > -1)
            return;
          self2.files.push(filename2);
          if (filename2 in common2) {
            if (sync)
              process(filename2, common2[filename2]);
            else {
              ++queued;
              setTimeout(function() {
                --queued;
                process(filename2, common2[filename2]);
              });
            }
            return;
          }
          if (sync) {
            var source;
            try {
              source = util2.fs.readFileSync(filename2).toString("utf8");
            } catch (err) {
              if (!weak)
                finish(err);
              return;
            }
            process(filename2, source);
          } else {
            ++queued;
            self2.fetch(filename2, function(err, source2) {
              --queued;
              if (!callback)
                return;
              if (err) {
                if (!weak)
                  finish(err);
                else if (!queued)
                  finish(null, self2);
                return;
              }
              process(filename2, source2);
            });
          }
        }
        var queued = 0;
        if (util2.isString(filename))
          filename = [filename];
        for (var i = 0, resolved; i < filename.length; ++i)
          if (resolved = self2.resolvePath("", filename[i]))
            fetch2(resolved);
        if (sync)
          return self2;
        if (!queued)
          finish(null, self2);
        return void 0;
      };
      Root2.prototype.loadSync = function loadSync(filename, options) {
        if (!util2.isNode)
          throw Error("not supported");
        return this.load(filename, options, SYNC);
      };
      Root2.prototype.resolveAll = function resolveAll() {
        if (this.deferred.length)
          throw Error("unresolvable extensions: " + this.deferred.map(function(field2) {
            return "'extend " + field2.extend + "' in " + field2.parent.fullName;
          }).join(", "));
        return Namespace.prototype.resolveAll.call(this);
      };
      var exposeRe = /^[A-Z]/;
      function tryHandleExtension(root2, field2) {
        var extendedType = field2.parent.lookup(field2.extend);
        if (extendedType) {
          var sisterField = new Field2(field2.fullName, field2.id, field2.type, field2.rule, void 0, field2.options);
          if (extendedType.get(sisterField.name)) {
            return true;
          }
          sisterField.declaringField = field2;
          field2.extensionField = sisterField;
          extendedType.add(sisterField);
          return true;
        }
        return false;
      }
      Root2.prototype._handleAdd = function _handleAdd(object2) {
        if (object2 instanceof Field2) {
          if (object2.extend !== void 0 && !object2.extensionField) {
            if (!tryHandleExtension(this, object2))
              this.deferred.push(object2);
          }
        } else if (object2 instanceof Enum2) {
          if (exposeRe.test(object2.name))
            object2.parent[object2.name] = object2.values;
        } else if (!(object2 instanceof OneOf2)) {
          if (object2 instanceof Type2)
            for (var i = 0; i < this.deferred.length; )
              if (tryHandleExtension(this, this.deferred[i]))
                this.deferred.splice(i, 1);
              else
                ++i;
          for (var j = 0; j < object2.nestedArray.length; ++j)
            this._handleAdd(object2._nestedArray[j]);
          if (exposeRe.test(object2.name))
            object2.parent[object2.name] = object2;
        }
      };
      Root2.prototype._handleRemove = function _handleRemove(object2) {
        if (object2 instanceof Field2) {
          if (object2.extend !== void 0) {
            if (object2.extensionField) {
              object2.extensionField.parent.remove(object2.extensionField);
              object2.extensionField = null;
            } else {
              var index = this.deferred.indexOf(object2);
              if (index > -1)
                this.deferred.splice(index, 1);
            }
          }
        } else if (object2 instanceof Enum2) {
          if (exposeRe.test(object2.name))
            delete object2.parent[object2.name];
        } else if (object2 instanceof Namespace) {
          for (var i = 0; i < object2.nestedArray.length; ++i)
            this._handleRemove(object2._nestedArray[i]);
          if (exposeRe.test(object2.name))
            delete object2.parent[object2.name];
        }
      };
      Root2._configure = function(Type_, parse_, common_) {
        Type2 = Type_;
        parse2 = parse_;
        common2 = common_;
      };
      return root$2;
    }
    var hasRequiredUtil;
    function requireUtil() {
      if (hasRequiredUtil)
        return util$2.exports;
      hasRequiredUtil = 1;
      (function(module2) {
        var util2 = module2.exports = requireMinimal();
        var roots$1 = roots;
        var Type2, Enum2;
        util2.codegen = codegen_1;
        util2.fetch = fetch_1;
        util2.path = path;
        util2.fs = util2.inquire("fs");
        util2.toArray = function toArray(object2) {
          if (object2) {
            var keys2 = Object.keys(object2), array = new Array(keys2.length), index = 0;
            while (index < keys2.length)
              array[index] = object2[keys2[index++]];
            return array;
          }
          return [];
        };
        util2.toObject = function toObject(array) {
          var object2 = {}, index = 0;
          while (index < array.length) {
            var key = array[index++], val = array[index++];
            if (val !== void 0)
              object2[key] = val;
          }
          return object2;
        };
        var safePropBackslashRe = /\\/g, safePropQuoteRe = /"/g;
        util2.isReserved = function isReserved(name) {
          return /^(?:do|if|in|for|let|new|try|var|case|else|enum|eval|false|null|this|true|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|function|arguments|interface|protected|implements|instanceof)$/.test(name);
        };
        util2.safeProp = function safeProp(prop) {
          if (!/^[$\w_]+$/.test(prop) || util2.isReserved(prop))
            return '["' + prop.replace(safePropBackslashRe, "\\\\").replace(safePropQuoteRe, '\\"') + '"]';
          return "." + prop;
        };
        util2.ucFirst = function ucFirst(str) {
          return str.charAt(0).toUpperCase() + str.substring(1);
        };
        var camelCaseRe = /_([a-z])/g;
        util2.camelCase = function camelCase(str) {
          return str.substring(0, 1) + str.substring(1).replace(camelCaseRe, function($0, $1) {
            return $1.toUpperCase();
          });
        };
        util2.compareFieldsById = function compareFieldsById(a, b) {
          return a.id - b.id;
        };
        util2.decorateType = function decorateType(ctor, typeName) {
          if (ctor.$type) {
            if (typeName && ctor.$type.name !== typeName) {
              util2.decorateRoot.remove(ctor.$type);
              ctor.$type.name = typeName;
              util2.decorateRoot.add(ctor.$type);
            }
            return ctor.$type;
          }
          if (!Type2)
            Type2 = requireType();
          var type2 = new Type2(typeName || ctor.name);
          util2.decorateRoot.add(type2);
          type2.ctor = ctor;
          Object.defineProperty(ctor, "$type", { value: type2, enumerable: false });
          Object.defineProperty(ctor.prototype, "$type", { value: type2, enumerable: false });
          return type2;
        };
        var decorateEnumIndex = 0;
        util2.decorateEnum = function decorateEnum(object2) {
          if (object2.$type)
            return object2.$type;
          if (!Enum2)
            Enum2 = require_enum();
          var enm = new Enum2("Enum" + decorateEnumIndex++, object2);
          util2.decorateRoot.add(enm);
          Object.defineProperty(object2, "$type", { value: enm, enumerable: false });
          return enm;
        };
        util2.setProperty = function setProperty(dst, path2, value) {
          function setProp(dst2, path3, value2) {
            var part = path3.shift();
            if (part === "__proto__" || part === "prototype") {
              return dst2;
            }
            if (path3.length > 0) {
              dst2[part] = setProp(dst2[part] || {}, path3, value2);
            } else {
              var prevValue = dst2[part];
              if (prevValue)
                value2 = [].concat(prevValue).concat(value2);
              dst2[part] = value2;
            }
            return dst2;
          }
          if (typeof dst !== "object")
            throw TypeError("dst must be an object");
          if (!path2)
            throw TypeError("path must be specified");
          path2 = path2.split(".");
          return setProp(dst, path2, value);
        };
        Object.defineProperty(util2, "decorateRoot", {
          get: function() {
            return roots$1["decorated"] || (roots$1["decorated"] = new (requireRoot())());
          }
        });
      })(util$2);
      return util$2.exports;
    }
    var object;
    var hasRequiredObject;
    function requireObject() {
      if (hasRequiredObject)
        return object;
      hasRequiredObject = 1;
      object = ReflectionObject;
      ReflectionObject.className = "ReflectionObject";
      var util2 = requireUtil();
      var Root2;
      function ReflectionObject(name, options) {
        if (!util2.isString(name))
          throw TypeError("name must be a string");
        if (options && !util2.isObject(options))
          throw TypeError("options must be an object");
        this.options = options;
        this.parsedOptions = null;
        this.name = name;
        this.parent = null;
        this.resolved = false;
        this.comment = null;
        this.filename = null;
      }
      Object.defineProperties(ReflectionObject.prototype, {
        root: {
          get: function() {
            var ptr = this;
            while (ptr.parent !== null)
              ptr = ptr.parent;
            return ptr;
          }
        },
        fullName: {
          get: function() {
            var path2 = [this.name], ptr = this.parent;
            while (ptr) {
              path2.unshift(ptr.name);
              ptr = ptr.parent;
            }
            return path2.join(".");
          }
        }
      });
      ReflectionObject.prototype.toJSON = function toJSON() {
        throw Error();
      };
      ReflectionObject.prototype.onAdd = function onAdd(parent) {
        if (this.parent && this.parent !== parent)
          this.parent.remove(this);
        this.parent = parent;
        this.resolved = false;
        var root2 = parent.root;
        if (root2 instanceof Root2)
          root2._handleAdd(this);
      };
      ReflectionObject.prototype.onRemove = function onRemove(parent) {
        var root2 = parent.root;
        if (root2 instanceof Root2)
          root2._handleRemove(this);
        this.parent = null;
        this.resolved = false;
      };
      ReflectionObject.prototype.resolve = function resolve() {
        if (this.resolved)
          return this;
        if (this.root instanceof Root2)
          this.resolved = true;
        return this;
      };
      ReflectionObject.prototype.getOption = function getOption(name) {
        if (this.options)
          return this.options[name];
        return void 0;
      };
      ReflectionObject.prototype.setOption = function setOption(name, value, ifNotSet) {
        if (!ifNotSet || !this.options || this.options[name] === void 0)
          (this.options || (this.options = {}))[name] = value;
        return this;
      };
      ReflectionObject.prototype.setParsedOption = function setParsedOption(name, value, propName) {
        if (!this.parsedOptions) {
          this.parsedOptions = [];
        }
        var parsedOptions = this.parsedOptions;
        if (propName) {
          var opt = parsedOptions.find(function(opt2) {
            return Object.prototype.hasOwnProperty.call(opt2, name);
          });
          if (opt) {
            var newValue = opt[name];
            util2.setProperty(newValue, propName, value);
          } else {
            opt = {};
            opt[name] = util2.setProperty({}, propName, value);
            parsedOptions.push(opt);
          }
        } else {
          var newOpt = {};
          newOpt[name] = value;
          parsedOptions.push(newOpt);
        }
        return this;
      };
      ReflectionObject.prototype.setOptions = function setOptions(options, ifNotSet) {
        if (options)
          for (var keys2 = Object.keys(options), i = 0; i < keys2.length; ++i)
            this.setOption(keys2[i], options[keys2[i]], ifNotSet);
        return this;
      };
      ReflectionObject.prototype.toString = function toString2() {
        var className = this.constructor.className, fullName = this.fullName;
        if (fullName.length)
          return className + " " + fullName;
        return className;
      };
      ReflectionObject._configure = function(Root_) {
        Root2 = Root_;
      };
      return object;
    }
    var _enum;
    var hasRequired_enum;
    function require_enum() {
      if (hasRequired_enum)
        return _enum;
      hasRequired_enum = 1;
      _enum = Enum2;
      var ReflectionObject = requireObject();
      ((Enum2.prototype = Object.create(ReflectionObject.prototype)).constructor = Enum2).className = "Enum";
      var Namespace = requireNamespace(), util2 = requireUtil();
      function Enum2(name, values, options, comment2, comments, valuesOptions) {
        ReflectionObject.call(this, name, options);
        if (values && typeof values !== "object")
          throw TypeError("values must be an object");
        this.valuesById = {};
        this.values = Object.create(this.valuesById);
        this.comment = comment2;
        this.comments = comments || {};
        this.valuesOptions = valuesOptions;
        this.reserved = void 0;
        if (values) {
          for (var keys2 = Object.keys(values), i = 0; i < keys2.length; ++i)
            if (typeof values[keys2[i]] === "number")
              this.valuesById[this.values[keys2[i]] = values[keys2[i]]] = keys2[i];
        }
      }
      Enum2.fromJSON = function fromJSON(name, json) {
        var enm = new Enum2(name, json.values, json.options, json.comment, json.comments);
        enm.reserved = json.reserved;
        return enm;
      };
      Enum2.prototype.toJSON = function toJSON(toJSONOptions) {
        var keepComments = toJSONOptions ? Boolean(toJSONOptions.keepComments) : false;
        return util2.toObject([
          "options",
          this.options,
          "valuesOptions",
          this.valuesOptions,
          "values",
          this.values,
          "reserved",
          this.reserved && this.reserved.length ? this.reserved : void 0,
          "comment",
          keepComments ? this.comment : void 0,
          "comments",
          keepComments ? this.comments : void 0
        ]);
      };
      Enum2.prototype.add = function add2(name, id, comment2, options) {
        if (!util2.isString(name))
          throw TypeError("name must be a string");
        if (!util2.isInteger(id))
          throw TypeError("id must be an integer");
        if (this.values[name] !== void 0)
          throw Error("duplicate name '" + name + "' in " + this);
        if (this.isReservedId(id))
          throw Error("id " + id + " is reserved in " + this);
        if (this.isReservedName(name))
          throw Error("name '" + name + "' is reserved in " + this);
        if (this.valuesById[id] !== void 0) {
          if (!(this.options && this.options.allow_alias))
            throw Error("duplicate id " + id + " in " + this);
          this.values[name] = id;
        } else
          this.valuesById[this.values[name] = id] = name;
        if (options) {
          if (this.valuesOptions === void 0)
            this.valuesOptions = {};
          this.valuesOptions[name] = options || null;
        }
        this.comments[name] = comment2 || null;
        return this;
      };
      Enum2.prototype.remove = function remove(name) {
        if (!util2.isString(name))
          throw TypeError("name must be a string");
        var val = this.values[name];
        if (val == null)
          throw Error("name '" + name + "' does not exist in " + this);
        delete this.valuesById[val];
        delete this.values[name];
        delete this.comments[name];
        if (this.valuesOptions)
          delete this.valuesOptions[name];
        return this;
      };
      Enum2.prototype.isReservedId = function isReservedId(id) {
        return Namespace.isReservedId(this.reserved, id);
      };
      Enum2.prototype.isReservedName = function isReservedName(name) {
        return Namespace.isReservedName(this.reserved, name);
      };
      return _enum;
    }
    var encoder_1;
    var hasRequiredEncoder;
    function requireEncoder() {
      if (hasRequiredEncoder)
        return encoder_1;
      hasRequiredEncoder = 1;
      encoder_1 = encoder;
      var Enum2 = require_enum(), types2 = requireTypes(), util2 = requireUtil();
      function genTypePartial(gen, field2, fieldIndex, ref) {
        return field2.resolvedType.group ? gen("types[%i].encode(%s,w.uint32(%i)).uint32(%i)", fieldIndex, ref, (field2.id << 3 | 3) >>> 0, (field2.id << 3 | 4) >>> 0) : gen("types[%i].encode(%s,w.uint32(%i).fork()).ldelim()", fieldIndex, ref, (field2.id << 3 | 2) >>> 0);
      }
      function encoder(mtype) {
        var gen = util2.codegen(["m", "w"], mtype.name + "$encode")("if(!w)")("w=Writer.create()");
        var i, ref;
        var fields = mtype.fieldsArray.slice().sort(util2.compareFieldsById);
        for (var i = 0; i < fields.length; ++i) {
          var field2 = fields[i].resolve(), index = mtype._fieldsArray.indexOf(field2), type2 = field2.resolvedType instanceof Enum2 ? "int32" : field2.type, wireType = types2.basic[type2];
          ref = "m" + util2.safeProp(field2.name);
          if (field2.map) {
            gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j)){", ref, field2.name)("for(var ks=Object.keys(%s),i=0;i<ks.length;++i){", ref)("w.uint32(%i).fork().uint32(%i).%s(ks[i])", (field2.id << 3 | 2) >>> 0, 8 | types2.mapKey[field2.keyType], field2.keyType);
            if (wireType === void 0)
              gen("types[%i].encode(%s[ks[i]],w.uint32(18).fork()).ldelim().ldelim()", index, ref);
            else
              gen(".uint32(%i).%s(%s[ks[i]]).ldelim()", 16 | wireType, type2, ref);
            gen("}")("}");
          } else if (field2.repeated) {
            gen("if(%s!=null&&%s.length){", ref, ref);
            if (field2.packed && types2.packed[type2] !== void 0) {
              gen("w.uint32(%i).fork()", (field2.id << 3 | 2) >>> 0)("for(var i=0;i<%s.length;++i)", ref)("w.%s(%s[i])", type2, ref)("w.ldelim()");
            } else {
              gen("for(var i=0;i<%s.length;++i)", ref);
              if (wireType === void 0)
                genTypePartial(gen, field2, index, ref + "[i]");
              else
                gen("w.uint32(%i).%s(%s[i])", (field2.id << 3 | wireType) >>> 0, type2, ref);
            }
            gen("}");
          } else {
            if (field2.optional)
              gen("if(%s!=null&&Object.hasOwnProperty.call(m,%j))", ref, field2.name);
            if (wireType === void 0)
              genTypePartial(gen, field2, index, ref);
            else
              gen("w.uint32(%i).%s(%s)", (field2.id << 3 | wireType) >>> 0, type2, ref);
          }
        }
        return gen("return w");
      }
      return encoder_1;
    }
    (function(module2) {
      var protobuf = module2.exports = indexMinimal;
      protobuf.build = "light";
      function load(filename, root2, callback) {
        if (typeof root2 === "function") {
          callback = root2;
          root2 = new protobuf.Root();
        } else if (!root2)
          root2 = new protobuf.Root();
        return root2.load(filename, callback);
      }
      protobuf.load = load;
      function loadSync(filename, root2) {
        if (!root2)
          root2 = new protobuf.Root();
        return root2.loadSync(filename);
      }
      protobuf.loadSync = loadSync;
      protobuf.encoder = requireEncoder();
      protobuf.decoder = requireDecoder();
      protobuf.verifier = requireVerifier();
      protobuf.converter = requireConverter();
      protobuf.ReflectionObject = requireObject();
      protobuf.Namespace = requireNamespace();
      protobuf.Root = requireRoot();
      protobuf.Enum = require_enum();
      protobuf.Type = requireType();
      protobuf.Field = requireField();
      protobuf.OneOf = requireOneof();
      protobuf.MapField = requireMapfield();
      protobuf.Service = requireService();
      protobuf.Method = requireMethod();
      protobuf.Message = message;
      protobuf.wrappers = wrappers;
      protobuf.types = requireTypes();
      protobuf.util = requireUtil();
      protobuf.ReflectionObject._configure(protobuf.Root);
      protobuf.Namespace._configure(protobuf.Type, protobuf.Service, protobuf.Enum);
      protobuf.Root._configure(protobuf.Type);
      protobuf.Field._configure(protobuf.Type);
    })(indexLight);
    var tokenize_1 = tokenize$1;
    var delimRe = /[\s{}=;:[\],'"()<>]/g, stringDoubleRe = /(?:"([^"\\]*(?:\\.[^"\\]*)*)")/g, stringSingleRe = /(?:'([^'\\]*(?:\\.[^'\\]*)*)')/g;
    var setCommentRe = /^ *[*/]+ */, setCommentAltRe = /^\s*\*?\/*/, setCommentSplitRe = /\n/g, whitespaceRe = /\s/, unescapeRe = /\\(.?)/g;
    var unescapeMap = {
      "0": "\0",
      "r": "\r",
      "n": "\n",
      "t": "	"
    };
    function unescape(str) {
      return str.replace(unescapeRe, function($0, $1) {
        switch ($1) {
          case "\\":
          case "":
            return $1;
          default:
            return unescapeMap[$1] || "";
        }
      });
    }
    tokenize$1.unescape = unescape;
    function tokenize$1(source, alternateCommentMode) {
      source = source.toString();
      var offset = 0, length = source.length, line = 1, lastCommentLine = 0, comments = {};
      var stack = [];
      var stringDelim = null;
      function illegal(subject) {
        return Error("illegal " + subject + " (line " + line + ")");
      }
      function readString() {
        var re = stringDelim === "'" ? stringSingleRe : stringDoubleRe;
        re.lastIndex = offset - 1;
        var match = re.exec(source);
        if (!match)
          throw illegal("string");
        offset = re.lastIndex;
        push(stringDelim);
        stringDelim = null;
        return unescape(match[1]);
      }
      function charAt(pos) {
        return source.charAt(pos);
      }
      function setComment(start, end, isLeading) {
        var comment2 = {
          type: source.charAt(start++),
          lineEmpty: false,
          leading: isLeading
        };
        var lookback;
        if (alternateCommentMode) {
          lookback = 2;
        } else {
          lookback = 3;
        }
        var commentOffset = start - lookback, c;
        do {
          if (--commentOffset < 0 || (c = source.charAt(commentOffset)) === "\n") {
            comment2.lineEmpty = true;
            break;
          }
        } while (c === " " || c === "	");
        var lines = source.substring(start, end).split(setCommentSplitRe);
        for (var i = 0; i < lines.length; ++i)
          lines[i] = lines[i].replace(alternateCommentMode ? setCommentAltRe : setCommentRe, "").trim();
        comment2.text = lines.join("\n").trim();
        comments[line] = comment2;
        lastCommentLine = line;
      }
      function isDoubleSlashCommentLine(startOffset) {
        var endOffset = findEndOfLine(startOffset);
        var lineText = source.substring(startOffset, endOffset);
        var isComment = /^\s*\/\//.test(lineText);
        return isComment;
      }
      function findEndOfLine(cursor) {
        var endOffset = cursor;
        while (endOffset < length && charAt(endOffset) !== "\n") {
          endOffset++;
        }
        return endOffset;
      }
      function next() {
        if (stack.length > 0)
          return stack.shift();
        if (stringDelim)
          return readString();
        var repeat, prev, curr, start, isDoc, isLeadingComment = offset === 0;
        do {
          if (offset === length)
            return null;
          repeat = false;
          while (whitespaceRe.test(curr = charAt(offset))) {
            if (curr === "\n") {
              isLeadingComment = true;
              ++line;
            }
            if (++offset === length)
              return null;
          }
          if (charAt(offset) === "/") {
            if (++offset === length) {
              throw illegal("comment");
            }
            if (charAt(offset) === "/") {
              if (!alternateCommentMode) {
                isDoc = charAt(start = offset + 1) === "/";
                while (charAt(++offset) !== "\n") {
                  if (offset === length) {
                    return null;
                  }
                }
                ++offset;
                if (isDoc) {
                  setComment(start, offset - 1, isLeadingComment);
                  isLeadingComment = true;
                }
                ++line;
                repeat = true;
              } else {
                start = offset;
                isDoc = false;
                if (isDoubleSlashCommentLine(offset - 1)) {
                  isDoc = true;
                  do {
                    offset = findEndOfLine(offset);
                    if (offset === length) {
                      break;
                    }
                    offset++;
                    if (!isLeadingComment) {
                      break;
                    }
                  } while (isDoubleSlashCommentLine(offset));
                } else {
                  offset = Math.min(length, findEndOfLine(offset) + 1);
                }
                if (isDoc) {
                  setComment(start, offset, isLeadingComment);
                  isLeadingComment = true;
                }
                line++;
                repeat = true;
              }
            } else if ((curr = charAt(offset)) === "*") {
              start = offset + 1;
              isDoc = alternateCommentMode || charAt(start) === "*";
              do {
                if (curr === "\n") {
                  ++line;
                }
                if (++offset === length) {
                  throw illegal("comment");
                }
                prev = curr;
                curr = charAt(offset);
              } while (prev !== "*" || curr !== "/");
              ++offset;
              if (isDoc) {
                setComment(start, offset - 2, isLeadingComment);
                isLeadingComment = true;
              }
              repeat = true;
            } else {
              return "/";
            }
          }
        } while (repeat);
        var end = offset;
        delimRe.lastIndex = 0;
        var delim = delimRe.test(charAt(end++));
        if (!delim)
          while (end < length && !delimRe.test(charAt(end)))
            ++end;
        var token = source.substring(offset, offset = end);
        if (token === '"' || token === "'")
          stringDelim = token;
        return token;
      }
      function push(token) {
        stack.push(token);
      }
      function peek() {
        if (!stack.length) {
          var token = next();
          if (token === null)
            return null;
          push(token);
        }
        return stack[0];
      }
      function skip(expected, optional) {
        var actual = peek(), equals = actual === expected;
        if (equals) {
          next();
          return true;
        }
        if (!optional)
          throw illegal("token '" + actual + "', '" + expected + "' expected");
        return false;
      }
      function cmnt(trailingLine) {
        var ret = null;
        var comment2;
        if (trailingLine === void 0) {
          comment2 = comments[line - 1];
          delete comments[line - 1];
          if (comment2 && (alternateCommentMode || comment2.type === "*" || comment2.lineEmpty)) {
            ret = comment2.leading ? comment2.text : null;
          }
        } else {
          if (lastCommentLine < trailingLine) {
            peek();
          }
          comment2 = comments[trailingLine];
          delete comments[trailingLine];
          if (comment2 && !comment2.lineEmpty && (alternateCommentMode || comment2.type === "/")) {
            ret = comment2.leading ? null : comment2.text;
          }
        }
        return ret;
      }
      return Object.defineProperty({
        next,
        peek,
        push,
        skip,
        cmnt
      }, "line", {
        get: function() {
          return line;
        }
      });
    }
    var parse_1 = parse;
    parse.filename = null;
    parse.defaults = { keepCase: false };
    var tokenize = tokenize_1, Root = requireRoot(), Type$1 = requireType(), Field$1 = requireField(), MapField = requireMapfield(), OneOf = requireOneof(), Enum$1 = require_enum(), Service$1 = requireService(), Method = requireMethod(), types = requireTypes(), util = requireUtil();
    var base10Re = /^[1-9][0-9]*$/, base10NegRe = /^-?[1-9][0-9]*$/, base16Re = /^0[x][0-9a-fA-F]+$/, base16NegRe = /^-?0[x][0-9a-fA-F]+$/, base8Re = /^0[0-7]+$/, base8NegRe = /^-?0[0-7]+$/, numberRe = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/, nameRe = /^[a-zA-Z_][a-zA-Z_0-9]*$/, typeRefRe = /^(?:\.?[a-zA-Z_][a-zA-Z_0-9]*)(?:\.[a-zA-Z_][a-zA-Z_0-9]*)*$/, fqTypeRefRe = /^(?:\.[a-zA-Z_][a-zA-Z_0-9]*)+$/;
    function parse(source, root2, options) {
      if (!(root2 instanceof Root)) {
        options = root2;
        root2 = new Root();
      }
      if (!options)
        options = parse.defaults;
      var preferTrailingComment = options.preferTrailingComment || false;
      var tn = tokenize(source, options.alternateCommentMode || false), next = tn.next, push = tn.push, peek = tn.peek, skip = tn.skip, cmnt = tn.cmnt;
      var head = true, pkg, imports, weakImports, syntax, isProto3 = false;
      var ptr = root2;
      var applyCase = options.keepCase ? function(name) {
        return name;
      } : util.camelCase;
      function illegal(token2, name, insideTryCatch) {
        var filename = parse.filename;
        if (!insideTryCatch)
          parse.filename = null;
        return Error("illegal " + (name || "token") + " '" + token2 + "' (" + (filename ? filename + ", " : "") + "line " + tn.line + ")");
      }
      function readString() {
        var values = [], token2;
        do {
          if ((token2 = next()) !== '"' && token2 !== "'")
            throw illegal(token2);
          values.push(next());
          skip(token2);
          token2 = peek();
        } while (token2 === '"' || token2 === "'");
        return values.join("");
      }
      function readValue(acceptTypeRef) {
        var token2 = next();
        switch (token2) {
          case "'":
          case '"':
            push(token2);
            return readString();
          case "true":
          case "TRUE":
            return true;
          case "false":
          case "FALSE":
            return false;
        }
        try {
          return parseNumber(token2, true);
        } catch (e) {
          if (acceptTypeRef && typeRefRe.test(token2))
            return token2;
          throw illegal(token2, "value");
        }
      }
      function readRanges(target, acceptStrings) {
        var token2, start;
        do {
          if (acceptStrings && ((token2 = peek()) === '"' || token2 === "'"))
            target.push(readString());
          else
            target.push([start = parseId(next()), skip("to", true) ? parseId(next()) : start]);
        } while (skip(",", true));
        skip(";");
      }
      function parseNumber(token2, insideTryCatch) {
        var sign = 1;
        if (token2.charAt(0) === "-") {
          sign = -1;
          token2 = token2.substring(1);
        }
        switch (token2) {
          case "inf":
          case "INF":
          case "Inf":
            return sign * Infinity;
          case "nan":
          case "NAN":
          case "Nan":
          case "NaN":
            return NaN;
          case "0":
            return 0;
        }
        if (base10Re.test(token2))
          return sign * parseInt(token2, 10);
        if (base16Re.test(token2))
          return sign * parseInt(token2, 16);
        if (base8Re.test(token2))
          return sign * parseInt(token2, 8);
        if (numberRe.test(token2))
          return sign * parseFloat(token2);
        throw illegal(token2, "number", insideTryCatch);
      }
      function parseId(token2, acceptNegative) {
        switch (token2) {
          case "max":
          case "MAX":
          case "Max":
            return 536870911;
          case "0":
            return 0;
        }
        if (!acceptNegative && token2.charAt(0) === "-")
          throw illegal(token2, "id");
        if (base10NegRe.test(token2))
          return parseInt(token2, 10);
        if (base16NegRe.test(token2))
          return parseInt(token2, 16);
        if (base8NegRe.test(token2))
          return parseInt(token2, 8);
        throw illegal(token2, "id");
      }
      function parsePackage() {
        if (pkg !== void 0)
          throw illegal("package");
        pkg = next();
        if (!typeRefRe.test(pkg))
          throw illegal(pkg, "name");
        ptr = ptr.define(pkg);
        skip(";");
      }
      function parseImport() {
        var token2 = peek();
        var whichImports;
        switch (token2) {
          case "weak":
            whichImports = weakImports || (weakImports = []);
            next();
            break;
          case "public":
            next();
          default:
            whichImports = imports || (imports = []);
            break;
        }
        token2 = readString();
        skip(";");
        whichImports.push(token2);
      }
      function parseSyntax() {
        skip("=");
        syntax = readString();
        isProto3 = syntax === "proto3";
        if (!isProto3 && syntax !== "proto2")
          throw illegal(syntax, "syntax");
        skip(";");
      }
      function parseCommon(parent, token2) {
        switch (token2) {
          case "option":
            parseOption(parent, token2);
            skip(";");
            return true;
          case "message":
            parseType(parent, token2);
            return true;
          case "enum":
            parseEnum(parent, token2);
            return true;
          case "service":
            parseService(parent, token2);
            return true;
          case "extend":
            parseExtension(parent, token2);
            return true;
        }
        return false;
      }
      function ifBlock(obj, fnIf, fnElse) {
        var trailingLine = tn.line;
        if (obj) {
          if (typeof obj.comment !== "string") {
            obj.comment = cmnt();
          }
          obj.filename = parse.filename;
        }
        if (skip("{", true)) {
          var token2;
          while ((token2 = next()) !== "}")
            fnIf(token2);
          skip(";", true);
        } else {
          if (fnElse)
            fnElse();
          skip(";");
          if (obj && (typeof obj.comment !== "string" || preferTrailingComment))
            obj.comment = cmnt(trailingLine) || obj.comment;
        }
      }
      function parseType(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "type name");
        var type2 = new Type$1(token2);
        ifBlock(type2, function parseType_block(token3) {
          if (parseCommon(type2, token3))
            return;
          switch (token3) {
            case "map":
              parseMapField(type2);
              break;
            case "required":
            case "repeated":
              parseField(type2, token3);
              break;
            case "optional":
              if (isProto3) {
                parseField(type2, "proto3_optional");
              } else {
                parseField(type2, "optional");
              }
              break;
            case "oneof":
              parseOneOf(type2, token3);
              break;
            case "extensions":
              readRanges(type2.extensions || (type2.extensions = []));
              break;
            case "reserved":
              readRanges(type2.reserved || (type2.reserved = []), true);
              break;
            default:
              if (!isProto3 || !typeRefRe.test(token3))
                throw illegal(token3);
              push(token3);
              parseField(type2, "optional");
              break;
          }
        });
        parent.add(type2);
      }
      function parseField(parent, rule, extend) {
        var type2 = next();
        if (type2 === "group") {
          parseGroup(parent, rule);
          return;
        }
        while (type2.endsWith(".") || peek().startsWith(".")) {
          type2 += next();
        }
        if (!typeRefRe.test(type2))
          throw illegal(type2, "type");
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        name = applyCase(name);
        skip("=");
        var field2 = new Field$1(name, parseId(next()), type2, rule, extend);
        ifBlock(field2, function parseField_block(token2) {
          if (token2 === "option") {
            parseOption(field2, token2);
            skip(";");
          } else
            throw illegal(token2);
        }, function parseField_line() {
          parseInlineOptions(field2);
        });
        if (rule === "proto3_optional") {
          var oneof2 = new OneOf("_" + name);
          field2.setOption("proto3_optional", true);
          oneof2.add(field2);
          parent.add(oneof2);
        } else {
          parent.add(field2);
        }
        if (!isProto3 && field2.repeated && (types.packed[type2] !== void 0 || types.basic[type2] === void 0))
          field2.setOption("packed", false, true);
      }
      function parseGroup(parent, rule) {
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        var fieldName = util.lcFirst(name);
        if (name === fieldName)
          name = util.ucFirst(name);
        skip("=");
        var id = parseId(next());
        var type2 = new Type$1(name);
        type2.group = true;
        var field2 = new Field$1(fieldName, id, name, rule);
        field2.filename = parse.filename;
        ifBlock(type2, function parseGroup_block(token2) {
          switch (token2) {
            case "option":
              parseOption(type2, token2);
              skip(";");
              break;
            case "required":
            case "repeated":
              parseField(type2, token2);
              break;
            case "optional":
              if (isProto3) {
                parseField(type2, "proto3_optional");
              } else {
                parseField(type2, "optional");
              }
              break;
            case "message":
              parseType(type2, token2);
              break;
            case "enum":
              parseEnum(type2, token2);
              break;
            default:
              throw illegal(token2);
          }
        });
        parent.add(type2).add(field2);
      }
      function parseMapField(parent) {
        skip("<");
        var keyType = next();
        if (types.mapKey[keyType] === void 0)
          throw illegal(keyType, "type");
        skip(",");
        var valueType = next();
        if (!typeRefRe.test(valueType))
          throw illegal(valueType, "type");
        skip(">");
        var name = next();
        if (!nameRe.test(name))
          throw illegal(name, "name");
        skip("=");
        var field2 = new MapField(applyCase(name), parseId(next()), keyType, valueType);
        ifBlock(field2, function parseMapField_block(token2) {
          if (token2 === "option") {
            parseOption(field2, token2);
            skip(";");
          } else
            throw illegal(token2);
        }, function parseMapField_line() {
          parseInlineOptions(field2);
        });
        parent.add(field2);
      }
      function parseOneOf(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var oneof2 = new OneOf(applyCase(token2));
        ifBlock(oneof2, function parseOneOf_block(token3) {
          if (token3 === "option") {
            parseOption(oneof2, token3);
            skip(";");
          } else {
            push(token3);
            parseField(oneof2, "optional");
          }
        });
        parent.add(oneof2);
      }
      function parseEnum(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var enm = new Enum$1(token2);
        ifBlock(enm, function parseEnum_block(token3) {
          switch (token3) {
            case "option":
              parseOption(enm, token3);
              skip(";");
              break;
            case "reserved":
              readRanges(enm.reserved || (enm.reserved = []), true);
              break;
            default:
              parseEnumValue(enm, token3);
          }
        });
        parent.add(enm);
      }
      function parseEnumValue(parent, token2) {
        if (!nameRe.test(token2))
          throw illegal(token2, "name");
        skip("=");
        var value = parseId(next(), true), dummy = {
          options: void 0
        };
        dummy.setOption = function(name, value2) {
          if (this.options === void 0)
            this.options = {};
          this.options[name] = value2;
        };
        ifBlock(dummy, function parseEnumValue_block(token3) {
          if (token3 === "option") {
            parseOption(dummy, token3);
            skip(";");
          } else
            throw illegal(token3);
        }, function parseEnumValue_line() {
          parseInlineOptions(dummy);
        });
        parent.add(token2, value, dummy.comment, dummy.options);
      }
      function parseOption(parent, token2) {
        var isCustom = skip("(", true);
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2, "name");
        var name = token2;
        var option = name;
        var propName;
        if (isCustom) {
          skip(")");
          name = "(" + name + ")";
          option = name;
          token2 = peek();
          if (fqTypeRefRe.test(token2)) {
            propName = token2.slice(1);
            name += token2;
            next();
          }
        }
        skip("=");
        var optionValue = parseOptionValue(parent, name);
        setParsedOption(parent, option, optionValue, propName);
      }
      function parseOptionValue(parent, name) {
        if (skip("{", true)) {
          var objectResult = {};
          while (!skip("}", true)) {
            if (!nameRe.test(token = next())) {
              throw illegal(token, "name");
            }
            if (token === null) {
              throw illegal(token, "end of input");
            }
            var value;
            var propName = token;
            skip(":", true);
            if (peek() === "{")
              value = parseOptionValue(parent, name + "." + token);
            else if (peek() === "[") {
              value = [];
              var lastValue;
              if (skip("[", true)) {
                do {
                  lastValue = readValue(true);
                  value.push(lastValue);
                } while (skip(",", true));
                skip("]");
                if (typeof lastValue !== "undefined") {
                  setOption(parent, name + "." + token, lastValue);
                }
              }
            } else {
              value = readValue(true);
              setOption(parent, name + "." + token, value);
            }
            var prevValue = objectResult[propName];
            if (prevValue)
              value = [].concat(prevValue).concat(value);
            objectResult[propName] = value;
            skip(",", true);
            skip(";", true);
          }
          return objectResult;
        }
        var simpleValue = readValue(true);
        setOption(parent, name, simpleValue);
        return simpleValue;
      }
      function setOption(parent, name, value) {
        if (parent.setOption)
          parent.setOption(name, value);
      }
      function setParsedOption(parent, name, value, propName) {
        if (parent.setParsedOption)
          parent.setParsedOption(name, value, propName);
      }
      function parseInlineOptions(parent) {
        if (skip("[", true)) {
          do {
            parseOption(parent, "option");
          } while (skip(",", true));
          skip("]");
        }
        return parent;
      }
      function parseService(parent, token2) {
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "service name");
        var service2 = new Service$1(token2);
        ifBlock(service2, function parseService_block(token3) {
          if (parseCommon(service2, token3))
            return;
          if (token3 === "rpc")
            parseMethod(service2, token3);
          else
            throw illegal(token3);
        });
        parent.add(service2);
      }
      function parseMethod(parent, token2) {
        var commentText = cmnt();
        var type2 = token2;
        if (!nameRe.test(token2 = next()))
          throw illegal(token2, "name");
        var name = token2, requestType, requestStream, responseType, responseStream;
        skip("(");
        if (skip("stream", true))
          requestStream = true;
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2);
        requestType = token2;
        skip(")");
        skip("returns");
        skip("(");
        if (skip("stream", true))
          responseStream = true;
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2);
        responseType = token2;
        skip(")");
        var method2 = new Method(name, type2, requestType, responseType, requestStream, responseStream);
        method2.comment = commentText;
        ifBlock(method2, function parseMethod_block(token3) {
          if (token3 === "option") {
            parseOption(method2, token3);
            skip(";");
          } else
            throw illegal(token3);
        });
        parent.add(method2);
      }
      function parseExtension(parent, token2) {
        if (!typeRefRe.test(token2 = next()))
          throw illegal(token2, "reference");
        var reference = token2;
        ifBlock(null, function parseExtension_block(token3) {
          switch (token3) {
            case "required":
            case "repeated":
              parseField(parent, token3, reference);
              break;
            case "optional":
              if (isProto3) {
                parseField(parent, "proto3_optional", reference);
              } else {
                parseField(parent, "optional", reference);
              }
              break;
            default:
              if (!isProto3 || !typeRefRe.test(token3))
                throw illegal(token3);
              push(token3);
              parseField(parent, "optional", reference);
              break;
          }
        });
      }
      var token;
      while ((token = next()) !== null) {
        switch (token) {
          case "package":
            if (!head)
              throw illegal(token);
            parsePackage();
            break;
          case "import":
            if (!head)
              throw illegal(token);
            parseImport();
            break;
          case "syntax":
            if (!head)
              throw illegal(token);
            parseSyntax();
            break;
          case "option":
            parseOption(ptr, token);
            skip(";");
            break;
          default:
            if (parseCommon(ptr, token)) {
              head = false;
              continue;
            }
            throw illegal(token);
        }
      }
      parse.filename = null;
      return {
        "package": pkg,
        "imports": imports,
        weakImports,
        syntax,
        root: root2
      };
    }
    var common_1 = common;
    var commonRe = /\/|\./;
    function common(name, json) {
      if (!commonRe.test(name)) {
        name = "google/protobuf/" + name + ".proto";
        json = { nested: { google: { nested: { protobuf: { nested: json } } } } };
      }
      common[name] = json;
    }
    common("any", {
      Any: {
        fields: {
          type_url: {
            type: "string",
            id: 1
          },
          value: {
            type: "bytes",
            id: 2
          }
        }
      }
    });
    var timeType;
    common("duration", {
      Duration: timeType = {
        fields: {
          seconds: {
            type: "int64",
            id: 1
          },
          nanos: {
            type: "int32",
            id: 2
          }
        }
      }
    });
    common("timestamp", {
      Timestamp: timeType
    });
    common("empty", {
      Empty: {
        fields: {}
      }
    });
    common("struct", {
      Struct: {
        fields: {
          fields: {
            keyType: "string",
            type: "Value",
            id: 1
          }
        }
      },
      Value: {
        oneofs: {
          kind: {
            oneof: [
              "nullValue",
              "numberValue",
              "stringValue",
              "boolValue",
              "structValue",
              "listValue"
            ]
          }
        },
        fields: {
          nullValue: {
            type: "NullValue",
            id: 1
          },
          numberValue: {
            type: "double",
            id: 2
          },
          stringValue: {
            type: "string",
            id: 3
          },
          boolValue: {
            type: "bool",
            id: 4
          },
          structValue: {
            type: "Struct",
            id: 5
          },
          listValue: {
            type: "ListValue",
            id: 6
          }
        }
      },
      NullValue: {
        values: {
          NULL_VALUE: 0
        }
      },
      ListValue: {
        fields: {
          values: {
            rule: "repeated",
            type: "Value",
            id: 1
          }
        }
      }
    });
    common("wrappers", {
      DoubleValue: {
        fields: {
          value: {
            type: "double",
            id: 1
          }
        }
      },
      FloatValue: {
        fields: {
          value: {
            type: "float",
            id: 1
          }
        }
      },
      Int64Value: {
        fields: {
          value: {
            type: "int64",
            id: 1
          }
        }
      },
      UInt64Value: {
        fields: {
          value: {
            type: "uint64",
            id: 1
          }
        }
      },
      Int32Value: {
        fields: {
          value: {
            type: "int32",
            id: 1
          }
        }
      },
      UInt32Value: {
        fields: {
          value: {
            type: "uint32",
            id: 1
          }
        }
      },
      BoolValue: {
        fields: {
          value: {
            type: "bool",
            id: 1
          }
        }
      },
      StringValue: {
        fields: {
          value: {
            type: "string",
            id: 1
          }
        }
      },
      BytesValue: {
        fields: {
          value: {
            type: "bytes",
            id: 1
          }
        }
      }
    });
    common("field_mask", {
      FieldMask: {
        fields: {
          paths: {
            rule: "repeated",
            type: "string",
            id: 1
          }
        }
      }
    });
    common.get = function get(file) {
      return common[file] || null;
    };
    (function(module2) {
      var protobuf = module2.exports = indexLight.exports;
      protobuf.build = "full";
      protobuf.tokenize = tokenize_1;
      protobuf.parse = parse_1;
      protobuf.common = common_1;
      protobuf.Root._configure(protobuf.Type, protobuf.parse, protobuf.common);
    })(src);
    (function(module2) {
      module2.exports = src.exports;
    })(protobufjs$1);
    var protobufjs = /* @__PURE__ */ getDefaultExportFromCjs(protobufjs$1.exports);
    function protobufScalarToRosPrimitive(type2) {
      switch (type2) {
        case "double":
          return "float64";
        case "float":
          return "float32";
        case "int32":
        case "sint32":
        case "sfixed32":
          return "int32";
        case "uint32":
        case "fixed32":
          return "uint32";
        case "int64":
        case "sint64":
        case "sfixed64":
          return "int64";
        case "uint64":
        case "fixed64":
          return "uint64";
        case "bool":
          return "bool";
        case "string":
          return "string";
      }
      throw new Error(`Expected protobuf scalar type, got ${type2}`);
    }
    function stripLeadingDot(typeName) {
      return typeName.replace(/^\./, "");
    }
    function protobufDefinitionsToDatatypes(datatypes, type2) {
      const definitions = [];
      datatypes.set(stripLeadingDot(type2.fullName), { definitions });
      for (const field2 of type2.fieldsArray) {
        if (field2.resolvedType instanceof protobufjs.Enum) {
          for (const [name, value] of Object.entries(field2.resolvedType.values)) {
            definitions.push({ name, type: "int32", isConstant: true, value });
          }
          definitions.push({ type: "int32", name: field2.name });
        } else if (field2.resolvedType) {
          const fullName = stripLeadingDot(field2.resolvedType.fullName);
          definitions.push({
            type: fullName,
            name: field2.name,
            isComplex: true,
            isArray: field2.repeated
          });
          if (!datatypes.has(fullName)) {
            protobufDefinitionsToDatatypes(datatypes, field2.resolvedType);
          }
        } else if (field2.type === "bytes") {
          if (field2.repeated) {
            throw new Error("Repeated bytes are not currently supported");
          }
          definitions.push({ type: "uint8", name: field2.name, isArray: true });
        } else if (type2.fullName === ".google.protobuf.Timestamp" || type2.fullName === ".google.protobuf.Duration") {
          definitions.push({
            type: "int32",
            name: field2.name === "seconds" ? "sec" : "nsec",
            isArray: field2.repeated
          });
        } else {
          definitions.push({
            type: protobufScalarToRosPrimitive(field2.type),
            name: field2.name,
            isArray: field2.repeated
          });
        }
      }
    }
    var dist$6 = { exports: {} };
    (function(module2) {
      (() => {
        var __webpack_modules__ = {
          569: function(module3, exports2) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
            (function(root2, factory2) {
              {
                !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory2, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module3.exports = __WEBPACK_AMD_DEFINE_RESULT__));
              }
            })(this, function() {
              var hasOwnProperty2 = Object.prototype.hasOwnProperty;
              var toString2 = Object.prototype.toString;
              var hasSticky = typeof new RegExp().sticky === "boolean";
              function isRegExp(o) {
                return o && toString2.call(o) === "[object RegExp]";
              }
              function isObject2(o) {
                return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
              }
              function reEscape(s) {
                return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
              }
              function reGroups(s) {
                var re = new RegExp("|" + s);
                return re.exec("").length - 1;
              }
              function reCapture(s) {
                return "(" + s + ")";
              }
              function reUnion(regexps) {
                if (!regexps.length)
                  return "(?!)";
                var source = regexps.map(function(s) {
                  return "(?:" + s + ")";
                }).join("|");
                return "(?:" + source + ")";
              }
              function regexpOrLiteral(obj) {
                if (typeof obj === "string") {
                  return "(?:" + reEscape(obj) + ")";
                } else if (isRegExp(obj)) {
                  if (obj.ignoreCase)
                    throw new Error("RegExp /i flag not allowed");
                  if (obj.global)
                    throw new Error("RegExp /g flag is implied");
                  if (obj.sticky)
                    throw new Error("RegExp /y flag is implied");
                  if (obj.multiline)
                    throw new Error("RegExp /m flag is implied");
                  return obj.source;
                } else {
                  throw new Error("Not a pattern: " + obj);
                }
              }
              function pad(s, length) {
                if (s.length > length) {
                  return s;
                }
                return Array(length - s.length + 1).join(" ") + s;
              }
              function lastNLines(string2, numLines) {
                var position = string2.length;
                var lineBreaks = 0;
                while (true) {
                  var idx = string2.lastIndexOf("\n", position - 1);
                  if (idx === -1) {
                    break;
                  } else {
                    lineBreaks++;
                  }
                  position = idx;
                  if (lineBreaks === numLines) {
                    break;
                  }
                  if (position === 0) {
                    break;
                  }
                }
                var startPosition = lineBreaks < numLines ? 0 : position + 1;
                return string2.substring(startPosition).split("\n");
              }
              function objectToRules(object2) {
                var keys2 = Object.getOwnPropertyNames(object2);
                var result = [];
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  var thing = object2[key];
                  var rules = [].concat(thing);
                  if (key === "include") {
                    for (var j = 0; j < rules.length; j++) {
                      result.push({ include: rules[j] });
                    }
                    continue;
                  }
                  var match = [];
                  rules.forEach(function(rule) {
                    if (isObject2(rule)) {
                      if (match.length)
                        result.push(ruleOptions(key, match));
                      result.push(ruleOptions(key, rule));
                      match = [];
                    } else {
                      match.push(rule);
                    }
                  });
                  if (match.length)
                    result.push(ruleOptions(key, match));
                }
                return result;
              }
              function arrayToRules(array) {
                var result = [];
                for (var i = 0; i < array.length; i++) {
                  var obj = array[i];
                  if (obj.include) {
                    var include = [].concat(obj.include);
                    for (var j = 0; j < include.length; j++) {
                      result.push({ include: include[j] });
                    }
                    continue;
                  }
                  if (!obj.type) {
                    throw new Error("Rule has no type: " + JSON.stringify(obj));
                  }
                  result.push(ruleOptions(obj.type, obj));
                }
                return result;
              }
              function ruleOptions(type2, obj) {
                if (!isObject2(obj)) {
                  obj = { match: obj };
                }
                if (obj.include) {
                  throw new Error("Matching rules cannot also include states");
                }
                var options = {
                  defaultType: type2,
                  lineBreaks: !!obj.error || !!obj.fallback,
                  pop: false,
                  next: null,
                  push: null,
                  error: false,
                  fallback: false,
                  value: null,
                  type: null,
                  shouldThrow: false
                };
                for (var key in obj) {
                  if (hasOwnProperty2.call(obj, key)) {
                    options[key] = obj[key];
                  }
                }
                if (typeof options.type === "string" && type2 !== options.type) {
                  throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type2 + "')");
                }
                var match = options.match;
                options.match = Array.isArray(match) ? match : match ? [match] : [];
                options.match.sort(function(a, b) {
                  return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
                });
                return options;
              }
              function toRules(spec) {
                return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
              }
              var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
              function compileRules(rules, hasStates) {
                var errorRule = null;
                var fast = /* @__PURE__ */ Object.create(null);
                var fastAllowed = true;
                var unicodeFlag = null;
                var groups = [];
                var parts = [];
                for (var i = 0; i < rules.length; i++) {
                  if (rules[i].fallback) {
                    fastAllowed = false;
                  }
                }
                for (var i = 0; i < rules.length; i++) {
                  var options = rules[i];
                  if (options.include) {
                    throw new Error("Inheritance is not allowed in stateless lexers");
                  }
                  if (options.error || options.fallback) {
                    if (errorRule) {
                      if (!options.fallback === !errorRule.fallback) {
                        throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
                      } else {
                        throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
                      }
                    }
                    errorRule = options;
                  }
                  var match = options.match.slice();
                  if (fastAllowed) {
                    while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                      var word = match.shift();
                      fast[word.charCodeAt(0)] = options;
                    }
                  }
                  if (options.pop || options.push || options.next) {
                    if (!hasStates) {
                      throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
                    }
                    if (options.fallback) {
                      throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
                    }
                  }
                  if (match.length === 0) {
                    continue;
                  }
                  fastAllowed = false;
                  groups.push(options);
                  for (var j = 0; j < match.length; j++) {
                    var obj = match[j];
                    if (!isRegExp(obj)) {
                      continue;
                    }
                    if (unicodeFlag === null) {
                      unicodeFlag = obj.unicode;
                    } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                      throw new Error("If one rule is /u then all must be");
                    }
                  }
                  var pat = reUnion(match.map(regexpOrLiteral));
                  var regexp = new RegExp(pat);
                  if (regexp.test("")) {
                    throw new Error("RegExp matches empty string: " + regexp);
                  }
                  var groupCount = reGroups(pat);
                  if (groupCount > 0) {
                    throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
                  }
                  if (!options.lineBreaks && regexp.test("\n")) {
                    throw new Error("Rule should declare lineBreaks: " + regexp);
                  }
                  parts.push(reCapture(pat));
                }
                var fallbackRule = errorRule && errorRule.fallback;
                var flags = hasSticky && !fallbackRule ? "ym" : "gm";
                var suffix = hasSticky || fallbackRule ? "" : "|";
                if (unicodeFlag === true)
                  flags += "u";
                var combined = new RegExp(reUnion(parts) + suffix, flags);
                return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
              }
              function compile(rules) {
                var result = compileRules(toRules(rules));
                return new Lexer({ start: result }, "start");
              }
              function checkStateGroup(g, name, map) {
                var state = g && (g.push || g.next);
                if (state && !map[state]) {
                  throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
                }
                if (g && g.pop && +g.pop !== 1) {
                  throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
                }
              }
              function compileStates(states, start) {
                var all = states.$all ? toRules(states.$all) : [];
                delete states.$all;
                var keys2 = Object.getOwnPropertyNames(states);
                if (!start)
                  start = keys2[0];
                var ruleMap = /* @__PURE__ */ Object.create(null);
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  ruleMap[key] = toRules(states[key]).concat(all);
                }
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  var rules = ruleMap[key];
                  var included = /* @__PURE__ */ Object.create(null);
                  for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    if (!rule.include)
                      continue;
                    var splice2 = [j, 1];
                    if (rule.include !== key && !included[rule.include]) {
                      included[rule.include] = true;
                      var newRules = ruleMap[rule.include];
                      if (!newRules) {
                        throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
                      }
                      for (var k = 0; k < newRules.length; k++) {
                        var newRule = newRules[k];
                        if (rules.indexOf(newRule) !== -1)
                          continue;
                        splice2.push(newRule);
                      }
                    }
                    rules.splice.apply(rules, splice2);
                    j--;
                  }
                }
                var map = /* @__PURE__ */ Object.create(null);
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  map[key] = compileRules(ruleMap[key], true);
                }
                for (var i = 0; i < keys2.length; i++) {
                  var name = keys2[i];
                  var state = map[name];
                  var groups = state.groups;
                  for (var j = 0; j < groups.length; j++) {
                    checkStateGroup(groups[j], name, map);
                  }
                  var fastKeys = Object.getOwnPropertyNames(state.fast);
                  for (var j = 0; j < fastKeys.length; j++) {
                    checkStateGroup(state.fast[fastKeys[j]], name, map);
                  }
                }
                return new Lexer(map, start);
              }
              function keywordTransform(map) {
                var isMap = typeof Map !== "undefined";
                var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
                var types2 = Object.getOwnPropertyNames(map);
                for (var i = 0; i < types2.length; i++) {
                  var tokenType = types2[i];
                  var item = map[tokenType];
                  var keywordList = Array.isArray(item) ? item : [item];
                  keywordList.forEach(function(keyword) {
                    if (typeof keyword !== "string") {
                      throw new Error("keyword must be string (in keyword '" + tokenType + "')");
                    }
                    if (isMap) {
                      reverseMap.set(keyword, tokenType);
                    } else {
                      reverseMap[keyword] = tokenType;
                    }
                  });
                }
                return function(k) {
                  return isMap ? reverseMap.get(k) : reverseMap[k];
                };
              }
              var Lexer = function(states, state) {
                this.startState = state;
                this.states = states;
                this.buffer = "";
                this.stack = [];
                this.reset();
              };
              Lexer.prototype.reset = function(data, info) {
                this.buffer = data || "";
                this.index = 0;
                this.line = info ? info.line : 1;
                this.col = info ? info.col : 1;
                this.queuedToken = info ? info.queuedToken : null;
                this.queuedText = info ? info.queuedText : "";
                this.queuedThrow = info ? info.queuedThrow : null;
                this.setState(info ? info.state : this.startState);
                this.stack = info && info.stack ? info.stack.slice() : [];
                return this;
              };
              Lexer.prototype.save = function() {
                return {
                  line: this.line,
                  col: this.col,
                  state: this.state,
                  stack: this.stack.slice(),
                  queuedToken: this.queuedToken,
                  queuedText: this.queuedText,
                  queuedThrow: this.queuedThrow
                };
              };
              Lexer.prototype.setState = function(state) {
                if (!state || this.state === state)
                  return;
                this.state = state;
                var info = this.states[state];
                this.groups = info.groups;
                this.error = info.error;
                this.re = info.regexp;
                this.fast = info.fast;
              };
              Lexer.prototype.popState = function() {
                this.setState(this.stack.pop());
              };
              Lexer.prototype.pushState = function(state) {
                this.stack.push(this.state);
                this.setState(state);
              };
              var eat = hasSticky ? function(re, buffer) {
                return re.exec(buffer);
              } : function(re, buffer) {
                var match = re.exec(buffer);
                if (match[0].length === 0) {
                  return null;
                }
                return match;
              };
              Lexer.prototype._getGroup = function(match) {
                var groupCount = this.groups.length;
                for (var i = 0; i < groupCount; i++) {
                  if (match[i + 1] !== void 0) {
                    return this.groups[i];
                  }
                }
                throw new Error("Cannot find token type for matched text");
              };
              function tokenToString() {
                return this.value;
              }
              Lexer.prototype.next = function() {
                var index = this.index;
                if (this.queuedGroup) {
                  var token = this._token(this.queuedGroup, this.queuedText, index);
                  this.queuedGroup = null;
                  this.queuedText = "";
                  return token;
                }
                var buffer = this.buffer;
                if (index === buffer.length) {
                  return;
                }
                var group = this.fast[buffer.charCodeAt(index)];
                if (group) {
                  return this._token(group, buffer.charAt(index), index);
                }
                var re = this.re;
                re.lastIndex = index;
                var match = eat(re, buffer);
                var error = this.error;
                if (match == null) {
                  return this._token(error, buffer.slice(index, buffer.length), index);
                }
                var group = this._getGroup(match);
                var text = match[0];
                if (error.fallback && match.index !== index) {
                  this.queuedGroup = group;
                  this.queuedText = text;
                  return this._token(error, buffer.slice(index, match.index), index);
                }
                return this._token(group, text, index);
              };
              Lexer.prototype._token = function(group, text, offset) {
                var lineBreaks = 0;
                if (group.lineBreaks) {
                  var matchNL = /\n/g;
                  var nl = 1;
                  if (text === "\n") {
                    lineBreaks = 1;
                  } else {
                    while (matchNL.exec(text)) {
                      lineBreaks++;
                      nl = matchNL.lastIndex;
                    }
                  }
                }
                var token = {
                  type: typeof group.type === "function" && group.type(text) || group.defaultType,
                  value: typeof group.value === "function" ? group.value(text) : text,
                  text,
                  toString: tokenToString,
                  offset,
                  lineBreaks,
                  line: this.line,
                  col: this.col
                };
                var size = text.length;
                this.index += size;
                this.line += lineBreaks;
                if (lineBreaks !== 0) {
                  this.col = size - nl + 1;
                } else {
                  this.col += size;
                }
                if (group.shouldThrow) {
                  var err = new Error(this.formatError(token, "invalid syntax"));
                  throw err;
                }
                if (group.pop)
                  this.popState();
                else if (group.push)
                  this.pushState(group.push);
                else if (group.next)
                  this.setState(group.next);
                return token;
              };
              if (typeof Symbol !== "undefined" && Symbol.iterator) {
                var LexerIterator = function(lexer) {
                  this.lexer = lexer;
                };
                LexerIterator.prototype.next = function() {
                  var token = this.lexer.next();
                  return { value: token, done: !token };
                };
                LexerIterator.prototype[Symbol.iterator] = function() {
                  return this;
                };
                Lexer.prototype[Symbol.iterator] = function() {
                  return new LexerIterator(this);
                };
              }
              Lexer.prototype.formatError = function(token, message2) {
                if (token == null) {
                  var text = this.buffer.slice(this.index);
                  var token = {
                    text,
                    offset: this.index,
                    lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
                    line: this.line,
                    col: this.col
                  };
                }
                var numLinesAround = 2;
                var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
                var lastDisplayedLine = token.line + numLinesAround;
                var lastLineDigits = String(lastDisplayedLine).length;
                var displayedLines = lastNLines(
                  this.buffer,
                  this.line - token.line + numLinesAround + 1
                ).slice(0, 5);
                var errorLines = [];
                errorLines.push(message2 + " at line " + token.line + " col " + token.col + ":");
                errorLines.push("");
                for (var i = 0; i < displayedLines.length; i++) {
                  var line = displayedLines[i];
                  var lineNo = firstDisplayedLine + i;
                  errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
                  if (lineNo === token.line) {
                    errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
                  }
                }
                return errorLines.join("\n");
              };
              Lexer.prototype.clone = function() {
                return new Lexer(this.states, this.state);
              };
              Lexer.prototype.has = function(tokenType) {
                return true;
              };
              return {
                compile,
                states: compileStates,
                error: Object.freeze({ error: true }),
                fallback: Object.freeze({ fallback: true }),
                keywords: keywordTransform
              };
            });
          },
          461: (module3, __unused_webpack_exports, __webpack_require__2) => {
            (function() {
              function id(x) {
                return x[0];
              }
              const keywords = [
                ,
                "struct",
                "module",
                "enum",
                "const",
                "include",
                "typedef",
                "union",
                "switch",
                "case",
                "boolean",
                "wstring",
                "string",
                "sequence",
                "TRUE",
                "FALSE",
                "byte",
                "octet",
                "wchar",
                "char",
                "double",
                "float",
                "int8",
                "uint8",
                "int16",
                "uint16",
                "int32",
                "uint32",
                "int64",
                "uint64",
                "unsigned",
                "short",
                "long"
              ];
              const kwObject = keywords.reduce((obj, w) => {
                obj[w] = w;
                return obj;
              }, {});
              const moo = __webpack_require__2(569);
              const lexer = moo.compile({
                SPACE: { match: /\s+/, lineBreaks: true },
                DECIMALEXP: /(?:(?:\d+\.\d*)|(?:\d*\.\d+)|(?:[0-9]+))[eE](?:[+|-])?[0-9]+/,
                DECIMAL: /(?:(?:\d+\.\d*)|(?:\d*\.\d+))/,
                INTEGER: /\d+/,
                COMMENT: /(?:\/\/[^\n]*)|(?:\/\*(?:.|\n)+?\*\/)/,
                HEX_LITERAL: /0x(?:[0-9a-fA-F])+?/,
                STRING: { match: /"(?:\\["\\rnu]|[^"\\])*"/, value: (x) => x.slice(1, -1) },
                LCBR: "{",
                RCBR: "}",
                LBR: "[",
                RBR: "]",
                LT: "<",
                GT: ">",
                LPAR: "(",
                RPAR: ")",
                ":": ":",
                ";": ";",
                ",": ",",
                AT: "@",
                PND: "#",
                PT: ".",
                "/": "/",
                SIGN: /[+-]/,
                EQ: /=[^\n]*?/,
                NAME: { match: /[a-zA-Z_][a-zA-Z0-9_]*(?:\:\:[a-zA-Z][a-zA-Z0-9_]*)*/, type: moo.keywords(kwObject) }
              });
              const tokensToIgnore = ["SPACE", "COMMENT"];
              lexer.next = ((next) => () => {
                let token;
                while ((token = next.call(lexer)) && tokensToIgnore.includes(token.type)) {
                }
                return token;
              })(lexer.next);
              function join(d) {
                return d.join("");
              }
              function extend(objs) {
                return objs.filter(Boolean).reduce((r, p) => ({ ...r, ...p }), {});
              }
              function noop2() {
                return null;
              }
              function getIntOrConstantValue(d) {
                const int = parseInt(d);
                if (!isNaN(int)) {
                  return int;
                }
                return d?.value ? { usesConstant: true, name: d.value } : void 0;
              }
              var grammar = {
                Lexer: lexer,
                ParserRules: [
                  { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": [] },
                  { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1$ebnf$1", "importDcl"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "main$ebnf$1$subexpression$1", "symbols": ["main$ebnf$1$subexpression$1$ebnf$1", "definition"] },
                  { "name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"] },
                  { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": [] },
                  { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": ["main$ebnf$1$subexpression$2$ebnf$1", "importDcl"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "main$ebnf$1$subexpression$2", "symbols": ["main$ebnf$1$subexpression$2$ebnf$1", "definition"] },
                  { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  {
                    "name": "main",
                    "symbols": ["main$ebnf$1"],
                    "postprocess": (d) => {
                      return d[0].flatMap((inner) => inner[1]);
                    }
                  },
                  { "name": "importDcl$subexpression$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
                  { "name": "importDcl$subexpression$1$ebnf$1", "symbols": [] },
                  { "name": "importDcl$subexpression$1$ebnf$1$subexpression$1", "symbols": [{ "literal": "/" }, lexer.has("NAME") ? { type: "NAME" } : NAME] },
                  { "name": "importDcl$subexpression$1$ebnf$1", "symbols": ["importDcl$subexpression$1$ebnf$1", "importDcl$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "importDcl$subexpression$1", "symbols": [{ "literal": "<" }, lexer.has("NAME") ? { type: "NAME" } : NAME, "importDcl$subexpression$1$ebnf$1", { "literal": "." }, { "literal": "idl" }, { "literal": ">" }] },
                  { "name": "importDcl", "symbols": [{ "literal": "#" }, { "literal": "include" }, "importDcl$subexpression$1"], "postprocess": noop2 },
                  { "name": "moduleDcl$ebnf$1$subexpression$1", "symbols": ["definition"] },
                  { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1$subexpression$1"] },
                  { "name": "moduleDcl$ebnf$1$subexpression$2", "symbols": ["definition"] },
                  { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1", "moduleDcl$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  {
                    "name": "moduleDcl",
                    "symbols": [{ "literal": "module" }, "fieldName", { "literal": "{" }, "moduleDcl$ebnf$1", { "literal": "}" }],
                    "postprocess": function processModule(d) {
                      const moduleName2 = d[1].name;
                      const defs = d[3];
                      return {
                        declarator: "module",
                        name: moduleName2,
                        definitions: defs.flat(1)
                      };
                    }
                  },
                  { "name": "definition$subexpression$1", "symbols": ["typeDcl"] },
                  { "name": "definition$subexpression$1", "symbols": ["constantDcl"] },
                  { "name": "definition$subexpression$1", "symbols": ["moduleDcl"] },
                  { "name": "definition$subexpression$1", "symbols": ["union"] },
                  { "name": "definition", "symbols": ["multiAnnotations", "definition$subexpression$1", "semi"], "postprocess": (d) => {
                    const annotations = d[0];
                    const declaration = d[1][0];
                    return extend([annotations, declaration]);
                  } },
                  { "name": "typeDcl$subexpression$1", "symbols": ["struct"] },
                  { "name": "typeDcl$subexpression$1", "symbols": ["typedef"] },
                  { "name": "typeDcl$subexpression$1", "symbols": ["enum"] },
                  { "name": "typeDcl", "symbols": ["typeDcl$subexpression$1"], "postprocess": (d) => d[0][0] },
                  {
                    "name": "union",
                    "symbols": [{ "literal": "union" }, "fieldName", { "literal": "switch" }, { "literal": "(" }, "switchTypedef", { "literal": ")" }, { "literal": "{" }, "switchBody", { "literal": "}" }],
                    "postprocess": (d) => {
                      const name = d[1].name;
                      const switchType = d[4].type;
                      const switchBody = d[7];
                      const allCases = switchBody;
                      const defaultCase = allCases.find((c) => "default" in c);
                      const cases = allCases.filter((c) => "predicates" in c);
                      const unionNode = {
                        declarator: "union",
                        name,
                        switchType,
                        cases
                      };
                      if (defaultCase) {
                        unionNode.defaultCase = defaultCase.default;
                      }
                      return unionNode;
                    }
                  },
                  { "name": "switchTypedef$subexpression$1", "symbols": ["customType"] },
                  { "name": "switchTypedef$subexpression$1", "symbols": ["numericType"] },
                  { "name": "switchTypedef$subexpression$1", "symbols": ["booleanType"] },
                  { "name": "switchTypedef", "symbols": ["switchTypedef$subexpression$1"], "postprocess": (d) => d[0][0] },
                  { "name": "switchBody$ebnf$1", "symbols": ["case"] },
                  { "name": "switchBody$ebnf$1", "symbols": ["switchBody$ebnf$1", "case"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "switchBody", "symbols": ["switchBody$ebnf$1"], "postprocess": (d) => d.flat(2) },
                  { "name": "case$ebnf$1", "symbols": ["caseLabel"] },
                  { "name": "case$ebnf$1", "symbols": ["case$ebnf$1", "caseLabel"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "case", "symbols": ["case$ebnf$1", "elementSpec", { "literal": ";" }], "postprocess": (d) => {
                    const cases = d[0];
                    const type2 = d[1];
                    const nonDefaultCases = cases.filter((casePredicate) => casePredicate !== "default");
                    const isDefault = cases.length !== nonDefaultCases.length;
                    const caseArray = [];
                    if (isDefault) {
                      caseArray.push({ default: type2 });
                    }
                    if (nonDefaultCases.length > 0) {
                      caseArray.push({
                        predicates: nonDefaultCases,
                        type: type2
                      });
                    }
                    return caseArray;
                  } },
                  { "name": "caseLabel$subexpression$1", "symbols": [{ "literal": "case" }, "constExpression", { "literal": ":" }] },
                  { "name": "caseLabel", "symbols": ["caseLabel$subexpression$1"], "postprocess": (d) => d[0][1] },
                  { "name": "caseLabel$subexpression$2", "symbols": [{ "literal": "default" }, { "literal": ":" }] },
                  { "name": "caseLabel", "symbols": ["caseLabel$subexpression$2"], "postprocess": () => "default" },
                  { "name": "elementSpec", "symbols": ["typeDeclarator"], "postprocess": (d) => d[0] },
                  { "name": "enum$ebnf$1", "symbols": [] },
                  { "name": "enum$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "enumFieldName"] },
                  { "name": "enum$ebnf$1", "symbols": ["enum$ebnf$1", "enum$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "enum", "symbols": [{ "literal": "enum" }, "fieldName", { "literal": "{" }, "enumFieldName", "enum$ebnf$1", { "literal": "}" }], "postprocess": (d) => {
                    const name = d[1].name;
                    const firstMember = d[3];
                    const members = d[4].flat(2).filter((item) => Boolean(item) && item.type !== ",");
                    return {
                      declarator: "enum",
                      name,
                      enumerators: [firstMember, ...members]
                    };
                  } },
                  { "name": "enumFieldName", "symbols": ["multiAnnotations", "fieldName"], "postprocess": (d) => {
                    const annotations = d[0];
                    const name = d[1];
                    return extend([annotations, name]);
                  } },
                  { "name": "struct$ebnf$1$subexpression$1", "symbols": ["member"] },
                  { "name": "struct$ebnf$1", "symbols": ["struct$ebnf$1$subexpression$1"] },
                  { "name": "struct$ebnf$1$subexpression$2", "symbols": ["member"] },
                  { "name": "struct$ebnf$1", "symbols": ["struct$ebnf$1", "struct$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "struct", "symbols": [{ "literal": "struct" }, "fieldName", { "literal": "{" }, "struct$ebnf$1", { "literal": "}" }], "postprocess": (d) => {
                    const name = d[1].name;
                    const definitions = d[3].flat(2).filter((def) => def !== null);
                    return {
                      declarator: "struct",
                      name,
                      definitions
                    };
                  } },
                  { "name": "typedef", "symbols": [{ "literal": "typedef" }, "typeDeclarator"], "postprocess": ([_, definition]) => ({ declarator: "typedef", ...definition }) },
                  { "name": "typeDeclarator$subexpression$1", "symbols": ["allTypes", "fieldName", "arrayLengths"] },
                  { "name": "typeDeclarator$subexpression$1", "symbols": ["allTypes", "fieldName"] },
                  { "name": "typeDeclarator$subexpression$1", "symbols": ["sequenceType", "fieldName"] },
                  { "name": "typeDeclarator", "symbols": ["typeDeclarator$subexpression$1"], "postprocess": (d) => extend(d[0]) },
                  { "name": "constantDcl", "symbols": ["constType"], "postprocess": (d) => d[0] },
                  { "name": "member", "symbols": ["fieldWithAnnotation", "semi"], "postprocess": (d) => d[0] },
                  { "name": "fieldWithAnnotation", "symbols": ["multiAnnotations", "fieldDcl"], "postprocess": (d) => {
                    const annotations = d[0];
                    const fields = d[1];
                    const finalDefs = fields.map(
                      (def) => extend([annotations, def])
                    );
                    return finalDefs;
                  } },
                  { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames", "arrayLengths"] },
                  { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames"] },
                  { "name": "fieldDcl$subexpression$1", "symbols": ["sequenceType", "multiFieldNames"] },
                  { "name": "fieldDcl", "symbols": ["fieldDcl$subexpression$1"], "postprocess": (d) => {
                    const names = d[0].splice(1, 1)[0];
                    const defs = names.map((nameObj) => ({
                      ...extend([...d[0], nameObj]),
                      declarator: "struct-member"
                    }));
                    return defs;
                  } },
                  { "name": "multiFieldNames$ebnf$1", "symbols": [] },
                  { "name": "multiFieldNames$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "fieldName"] },
                  { "name": "multiFieldNames$ebnf$1", "symbols": ["multiFieldNames$ebnf$1", "multiFieldNames$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "multiFieldNames", "symbols": ["fieldName", "multiFieldNames$ebnf$1"], "postprocess": (d) => {
                    const fieldNames = d.flat(2).filter((d2) => d2 !== null && d2.name);
                    return fieldNames;
                  } },
                  { "name": "multiAnnotations$ebnf$1", "symbols": [] },
                  { "name": "multiAnnotations$ebnf$1", "symbols": ["multiAnnotations$ebnf$1", "annotation"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  {
                    "name": "multiAnnotations",
                    "symbols": ["multiAnnotations$ebnf$1"],
                    "postprocess": (d) => {
                      return d[0].length > 0 ? { annotations: d[0].reduce((record, annotation) => {
                        record[annotation.name] = annotation;
                        return record;
                      }, {}) } : null;
                    }
                  },
                  { "name": "annotation$ebnf$1$subexpression$1", "symbols": [{ "literal": "(" }, "annotationParams", { "literal": ")" }] },
                  { "name": "annotation$ebnf$1", "symbols": ["annotation$ebnf$1$subexpression$1"], "postprocess": id },
                  { "name": "annotation$ebnf$1", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "annotation", "symbols": ["at", lexer.has("NAME") ? { type: "NAME" } : NAME, "annotation$ebnf$1"], "postprocess": (d) => {
                    const annotationName = d[1].value;
                    const params = d[2] ? d[2][1] : void 0;
                    if (params == void 0) {
                      return { type: "no-params", name: annotationName };
                    }
                    if (Array.isArray(params)) {
                      const namedParamsRecord = extend(params);
                      return {
                        type: "named-params",
                        name: annotationName,
                        namedParams: namedParamsRecord
                      };
                    }
                    return { type: "const-param", value: params, name: annotationName };
                  } },
                  { "name": "annotationParams$subexpression$1", "symbols": ["multipleNamedAnnotationParams"] },
                  { "name": "annotationParams$subexpression$1", "symbols": ["constExpression"] },
                  { "name": "annotationParams", "symbols": ["annotationParams$subexpression$1"], "postprocess": (d) => d[0][0] },
                  { "name": "multipleNamedAnnotationParams$ebnf$1", "symbols": [] },
                  { "name": "multipleNamedAnnotationParams$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "namedAnnotationParam"] },
                  { "name": "multipleNamedAnnotationParams$ebnf$1", "symbols": ["multipleNamedAnnotationParams$ebnf$1", "multipleNamedAnnotationParams$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  {
                    "name": "multipleNamedAnnotationParams",
                    "symbols": ["namedAnnotationParam", "multipleNamedAnnotationParams$ebnf$1"],
                    "postprocess": (d) => [d[0], ...d[1].flatMap(([, param]) => param)]
                  },
                  {
                    "name": "constExpression",
                    "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME],
                    "postprocess": (d) => ({ usesConstant: true, name: d[0].value })
                  },
                  { "name": "constExpression", "symbols": ["literal"], "postprocess": (d) => d[0].value },
                  { "name": "namedAnnotationParam$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME, "assignment"] },
                  { "name": "namedAnnotationParam", "symbols": ["namedAnnotationParam$subexpression$1"], "postprocess": (d) => ({ [d[0][0].value]: d[0][1].value }) },
                  { "name": "at", "symbols": [{ "literal": "@" }], "postprocess": noop2 },
                  { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "floatAssignment", "simple"] },
                  { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "intAssignment", "simple"] },
                  { "name": "constType$subexpression$1", "symbols": ["constKeyword", "stringType", "fieldName", "stringAssignment", "simple"] },
                  { "name": "constType$subexpression$1", "symbols": ["constKeyword", "booleanType", "fieldName", "booleanAssignment", "simple"] },
                  { "name": "constType$subexpression$1", "symbols": ["constKeyword", "customType", "fieldName", "variableAssignment", "simple"] },
                  { "name": "constType", "symbols": ["constType$subexpression$1"], "postprocess": (d) => {
                    return extend(d[0]);
                  } },
                  { "name": "constKeyword", "symbols": [{ "literal": "const" }], "postprocess": (d) => ({ isConstant: true, declarator: "const" }) },
                  { "name": "fieldName", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": (d) => ({ name: d[0].value }) },
                  { "name": "sequenceType$ebnf$1$subexpression$1$subexpression$1", "symbols": ["INT"] },
                  { "name": "sequenceType$ebnf$1$subexpression$1$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                  { "name": "sequenceType$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "sequenceType$ebnf$1$subexpression$1$subexpression$1"] },
                  { "name": "sequenceType$ebnf$1", "symbols": ["sequenceType$ebnf$1$subexpression$1"], "postprocess": id },
                  { "name": "sequenceType$ebnf$1", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "sequenceType", "symbols": [{ "literal": "sequence" }, { "literal": "<" }, "allTypes", "sequenceType$ebnf$1", { "literal": ">" }], "postprocess": (d) => {
                    const arrayUpperBound = d[3] !== null ? getIntOrConstantValue(d[3][1][0]) : void 0;
                    const typeObj = d[2];
                    return {
                      ...typeObj,
                      isArray: true,
                      arrayUpperBound
                    };
                  } },
                  { "name": "arrayLengths$ebnf$1", "symbols": ["arrayLength"] },
                  { "name": "arrayLengths$ebnf$1", "symbols": ["arrayLengths$ebnf$1", "arrayLength"], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  {
                    "name": "arrayLengths",
                    "symbols": ["arrayLengths$ebnf$1"],
                    "postprocess": (d) => {
                      const arrInfo = { isArray: true };
                      const arrLengthList = d.flat(2).filter((num) => num != void 0);
                      arrInfo.arrayLengths = arrLengthList;
                      return arrInfo;
                    }
                  },
                  { "name": "arrayLength$subexpression$1", "symbols": ["INT"] },
                  { "name": "arrayLength$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                  {
                    "name": "arrayLength",
                    "symbols": [{ "literal": "[" }, "arrayLength$subexpression$1", { "literal": "]" }],
                    "postprocess": ([, intOrName]) => getIntOrConstantValue(intOrName ? intOrName[0] : void 0)
                  },
                  { "name": "assignment$subexpression$1", "symbols": ["floatAssignment"] },
                  { "name": "assignment$subexpression$1", "symbols": ["intAssignment"] },
                  { "name": "assignment$subexpression$1", "symbols": ["stringAssignment"] },
                  { "name": "assignment$subexpression$1", "symbols": ["booleanAssignment"] },
                  { "name": "assignment$subexpression$1", "symbols": ["variableAssignment"] },
                  { "name": "assignment", "symbols": ["assignment$subexpression$1"], "postprocess": (d) => d[0][0] },
                  { "name": "floatAssignment$subexpression$1", "symbols": ["SIGNED_FLOAT"] },
                  { "name": "floatAssignment$subexpression$1", "symbols": ["FLOAT"] },
                  { "name": "floatAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "floatAssignment$subexpression$1"], "postprocess": ([, num]) => ({ valueText: num[0], value: parseFloat(num[0]) }) },
                  { "name": "intAssignment$subexpression$1", "symbols": ["SIGNED_INT"] },
                  { "name": "intAssignment$subexpression$1", "symbols": ["INT"] },
                  { "name": "intAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "intAssignment$subexpression$1"], "postprocess": ([, num]) => ({ valueText: num[0], value: parseInt(num[0]) }) },
                  { "name": "stringAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "STR"], "postprocess": ([, str]) => ({ valueText: str, value: str }) },
                  { "name": "booleanAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "BOOLEAN"], "postprocess": ([, bool2]) => ({ valueText: bool2, value: bool2 === "TRUE" }) },
                  {
                    "name": "variableAssignment",
                    "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, lexer.has("NAME") ? { type: "NAME" } : NAME],
                    "postprocess": ([, name]) => ({
                      valueText: name.value,
                      value: {
                        usesConstant: true,
                        name: name.value
                      }
                    })
                  },
                  { "name": "allTypes$subexpression$1", "symbols": ["primitiveTypes"] },
                  { "name": "allTypes$subexpression$1", "symbols": ["customType"] },
                  { "name": "allTypes", "symbols": ["allTypes$subexpression$1"], "postprocess": (d) => d[0][0] },
                  { "name": "primitiveTypes$subexpression$1", "symbols": ["stringType"] },
                  { "name": "primitiveTypes$subexpression$1", "symbols": ["numericType"] },
                  { "name": "primitiveTypes$subexpression$1", "symbols": ["booleanType"] },
                  { "name": "primitiveTypes", "symbols": ["primitiveTypes$subexpression$1"], "postprocess": (d) => ({ ...d[0][0], isComplex: false }) },
                  { "name": "customType", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": (d) => {
                    const typeName = d[0].value;
                    return { type: typeName };
                  } },
                  { "name": "stringType$subexpression$1", "symbols": [{ "literal": "string" }] },
                  { "name": "stringType$subexpression$1", "symbols": [{ "literal": "wstring" }] },
                  { "name": "stringType$ebnf$1$subexpression$1$subexpression$1", "symbols": ["INT"] },
                  { "name": "stringType$ebnf$1$subexpression$1$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                  { "name": "stringType$ebnf$1$subexpression$1", "symbols": [{ "literal": "<" }, "stringType$ebnf$1$subexpression$1$subexpression$1", { "literal": ">" }] },
                  { "name": "stringType$ebnf$1", "symbols": ["stringType$ebnf$1$subexpression$1"], "postprocess": id },
                  { "name": "stringType$ebnf$1", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "stringType", "symbols": ["stringType$subexpression$1", "stringType$ebnf$1"], "postprocess": (d) => {
                    const stringKind = d[0][0].value;
                    let strLength = void 0;
                    if (d[1] !== null) {
                      strLength = getIntOrConstantValue(d[1][1] ? d[1][1][0] : void 0);
                    }
                    return { type: stringKind, upperBound: strLength };
                  } },
                  { "name": "booleanType", "symbols": [{ "literal": "boolean" }], "postprocess": (d) => ({ type: "bool" }) },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "byte" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "octet" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "wchar" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "char" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }, { "literal": "double" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "double" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "float" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int8" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint8" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int16" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint16" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int32" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint32" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int64" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint64" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "short" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "short" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "long" }, { "literal": "long" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }, { "literal": "long" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "long" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }] },
                  {
                    "name": "numericType",
                    "symbols": ["numericType$subexpression$1"],
                    "postprocess": (d) => {
                      const typeString = d[0].map((t) => t?.value).filter((t) => !!t).join(" ");
                      return { type: typeString };
                    }
                  },
                  { "name": "literal$subexpression$1", "symbols": ["booleanLiteral"] },
                  { "name": "literal$subexpression$1", "symbols": ["strLiteral"] },
                  { "name": "literal$subexpression$1", "symbols": ["floatLiteral"] },
                  { "name": "literal$subexpression$1", "symbols": ["intLiteral"] },
                  { "name": "literal", "symbols": ["literal$subexpression$1"], "postprocess": (d) => d[0][0] },
                  { "name": "booleanLiteral", "symbols": ["BOOLEAN"], "postprocess": (d) => ({ value: d[0] === "TRUE" }) },
                  { "name": "strLiteral", "symbols": ["STR"], "postprocess": (d) => ({ value: d[0] }) },
                  { "name": "floatLiteral$subexpression$1", "symbols": ["SIGNED_FLOAT"] },
                  { "name": "floatLiteral$subexpression$1", "symbols": ["FLOAT"] },
                  { "name": "floatLiteral", "symbols": ["floatLiteral$subexpression$1"], "postprocess": (d) => ({ value: parseFloat(d[0][0]) }) },
                  { "name": "intLiteral$subexpression$1", "symbols": ["SIGNED_INT"] },
                  { "name": "intLiteral$subexpression$1", "symbols": ["INT"] },
                  { "name": "intLiteral", "symbols": ["intLiteral$subexpression$1"], "postprocess": (d) => ({ value: parseInt(d[0][0]) }) },
                  { "name": "BOOLEAN$subexpression$1", "symbols": [{ "literal": "TRUE" }] },
                  { "name": "BOOLEAN$subexpression$1", "symbols": [{ "literal": "FALSE" }] },
                  { "name": "BOOLEAN", "symbols": ["BOOLEAN$subexpression$1"], "postprocess": join },
                  { "name": "STR$ebnf$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
                  { "name": "STR$ebnf$1", "symbols": ["STR$ebnf$1", lexer.has("STRING") ? { type: "STRING" } : STRING], "postprocess": function arrpush(d) {
                    return d[0].concat([d[1]]);
                  } },
                  { "name": "STR", "symbols": ["STR$ebnf$1"], "postprocess": (d) => {
                    return join(d.flat(1).filter((d2) => d2 !== null));
                  } },
                  { "name": "SIGNED_FLOAT$subexpression$1", "symbols": [{ "literal": "+" }] },
                  { "name": "SIGNED_FLOAT$subexpression$1", "symbols": [{ "literal": "-" }] },
                  { "name": "SIGNED_FLOAT", "symbols": ["SIGNED_FLOAT$subexpression$1", "FLOAT"], "postprocess": join },
                  { "name": "FLOAT$subexpression$1", "symbols": [lexer.has("DECIMAL") ? { type: "DECIMAL" } : DECIMAL] },
                  { "name": "FLOAT$subexpression$1", "symbols": [lexer.has("DECIMALEXP") ? { type: "DECIMALEXP" } : DECIMALEXP] },
                  { "name": "FLOAT", "symbols": ["FLOAT$subexpression$1"], "postprocess": join },
                  { "name": "FLOAT$subexpression$2", "symbols": [lexer.has("DECIMAL") ? { type: "DECIMAL" } : DECIMAL, { "literal": "d" }] },
                  { "name": "FLOAT", "symbols": ["FLOAT$subexpression$2"], "postprocess": (d) => d[0][0].value },
                  { "name": "FLOAT$subexpression$3", "symbols": ["INT", { "literal": "d" }] },
                  { "name": "FLOAT", "symbols": ["FLOAT$subexpression$3"], "postprocess": (d) => d[0][0] },
                  { "name": "SIGNED_INT$subexpression$1", "symbols": [{ "literal": "+" }] },
                  { "name": "SIGNED_INT$subexpression$1", "symbols": [{ "literal": "-" }] },
                  { "name": "SIGNED_INT", "symbols": ["SIGNED_INT$subexpression$1", "INT"], "postprocess": join },
                  { "name": "INT", "symbols": [lexer.has("INTEGER") ? { type: "INTEGER" } : INTEGER], "postprocess": join },
                  { "name": "semi", "symbols": [{ "literal": ";" }], "postprocess": noop2 },
                  { "name": "simple", "symbols": [], "postprocess": () => ({ isComplex: false }) }
                ],
                ParserStart: "main"
              };
              if (typeof module3.exports !== "undefined") {
                module3.exports = grammar;
              } else {
                window.grammar = grammar;
              }
            })();
          },
          614: function(module3) {
            (function(root2, factory2) {
              if (module3.exports) {
                module3.exports = factory2();
              } else {
                root2.nearley = factory2();
              }
            })(this, function() {
              function Rule(name, symbols, postprocess) {
                this.id = ++Rule.highestId;
                this.name = name;
                this.symbols = symbols;
                this.postprocess = postprocess;
                return this;
              }
              Rule.highestId = 0;
              Rule.prototype.toString = function(withCursorAt) {
                var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
                return this.name + " \u2192 " + symbolSequence;
              };
              function State2(rule, dot, reference, wantedBy) {
                this.rule = rule;
                this.dot = dot;
                this.reference = reference;
                this.data = [];
                this.wantedBy = wantedBy;
                this.isComplete = this.dot === rule.symbols.length;
              }
              State2.prototype.toString = function() {
                return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
              };
              State2.prototype.nextState = function(child) {
                var state = new State2(this.rule, this.dot + 1, this.reference, this.wantedBy);
                state.left = this;
                state.right = child;
                if (state.isComplete) {
                  state.data = state.build();
                  state.right = void 0;
                }
                return state;
              };
              State2.prototype.build = function() {
                var children = [];
                var node = this;
                do {
                  children.push(node.right.data);
                  node = node.left;
                } while (node.left);
                children.reverse();
                return children;
              };
              State2.prototype.finish = function() {
                if (this.rule.postprocess) {
                  this.data = this.rule.postprocess(this.data, this.reference, Parser2.fail);
                }
              };
              function Column(grammar, index) {
                this.grammar = grammar;
                this.index = index;
                this.states = [];
                this.wants = {};
                this.scannable = [];
                this.completed = {};
              }
              Column.prototype.process = function(nextColumn) {
                var states = this.states;
                var wants = this.wants;
                var completed = this.completed;
                for (var w = 0; w < states.length; w++) {
                  var state = states[w];
                  if (state.isComplete) {
                    state.finish();
                    if (state.data !== Parser2.fail) {
                      var wantedBy = state.wantedBy;
                      for (var i = wantedBy.length; i--; ) {
                        var left = wantedBy[i];
                        this.complete(left, state);
                      }
                      if (state.reference === this.index) {
                        var exp = state.rule.name;
                        (this.completed[exp] = this.completed[exp] || []).push(state);
                      }
                    }
                  } else {
                    var exp = state.rule.symbols[state.dot];
                    if (typeof exp !== "string") {
                      this.scannable.push(state);
                      continue;
                    }
                    if (wants[exp]) {
                      wants[exp].push(state);
                      if (completed.hasOwnProperty(exp)) {
                        var nulls = completed[exp];
                        for (var i = 0; i < nulls.length; i++) {
                          var right = nulls[i];
                          this.complete(state, right);
                        }
                      }
                    } else {
                      wants[exp] = [state];
                      this.predict(exp);
                    }
                  }
                }
              };
              Column.prototype.predict = function(exp) {
                var rules = this.grammar.byName[exp] || [];
                for (var i = 0; i < rules.length; i++) {
                  var r = rules[i];
                  var wantedBy = this.wants[exp];
                  var s = new State2(r, 0, this.index, wantedBy);
                  this.states.push(s);
                }
              };
              Column.prototype.complete = function(left, right) {
                var copy = left.nextState(right);
                this.states.push(copy);
              };
              function Grammar(rules, start) {
                this.rules = rules;
                this.start = start || this.rules[0].name;
                var byName = this.byName = {};
                this.rules.forEach(function(rule) {
                  if (!byName.hasOwnProperty(rule.name)) {
                    byName[rule.name] = [];
                  }
                  byName[rule.name].push(rule);
                });
              }
              Grammar.fromCompiled = function(rules, start) {
                var lexer = rules.Lexer;
                if (rules.ParserStart) {
                  start = rules.ParserStart;
                  rules = rules.ParserRules;
                }
                var rules = rules.map(function(r) {
                  return new Rule(r.name, r.symbols, r.postprocess);
                });
                var g = new Grammar(rules, start);
                g.lexer = lexer;
                return g;
              };
              function StreamLexer() {
                this.reset("");
              }
              StreamLexer.prototype.reset = function(data, state) {
                this.buffer = data;
                this.index = 0;
                this.line = state ? state.line : 1;
                this.lastLineBreak = state ? -state.col : 0;
              };
              StreamLexer.prototype.next = function() {
                if (this.index < this.buffer.length) {
                  var ch = this.buffer[this.index++];
                  if (ch === "\n") {
                    this.line += 1;
                    this.lastLineBreak = this.index;
                  }
                  return { value: ch };
                }
              };
              StreamLexer.prototype.save = function() {
                return {
                  line: this.line,
                  col: this.index - this.lastLineBreak
                };
              };
              StreamLexer.prototype.formatError = function(token, message2) {
                var buffer = this.buffer;
                if (typeof buffer === "string") {
                  var lines = buffer.split("\n").slice(
                    Math.max(0, this.line - 5),
                    this.line
                  );
                  var nextLineBreak = buffer.indexOf("\n", this.index);
                  if (nextLineBreak === -1)
                    nextLineBreak = buffer.length;
                  var col = this.index - this.lastLineBreak;
                  var lastLineDigits = String(this.line).length;
                  message2 += " at line " + this.line + " col " + col + ":\n\n";
                  message2 += lines.map(function(line, i) {
                    return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
                  }, this).join("\n");
                  message2 += "\n" + pad("", lastLineDigits + col) + "^\n";
                  return message2;
                } else {
                  return message2 + " at index " + (this.index - 1);
                }
                function pad(n, length) {
                  var s = String(n);
                  return Array(length - s.length + 1).join(" ") + s;
                }
              };
              function Parser2(rules, start, options) {
                if (rules instanceof Grammar) {
                  var grammar = rules;
                  var options = start;
                } else {
                  var grammar = Grammar.fromCompiled(rules, start);
                }
                this.grammar = grammar;
                this.options = {
                  keepHistory: false,
                  lexer: grammar.lexer || new StreamLexer()
                };
                for (var key in options || {}) {
                  this.options[key] = options[key];
                }
                this.lexer = this.options.lexer;
                this.lexerState = void 0;
                var column = new Column(grammar, 0);
                this.table = [column];
                column.wants[grammar.start] = [];
                column.predict(grammar.start);
                column.process();
                this.current = 0;
              }
              Parser2.fail = {};
              Parser2.prototype.feed = function(chunk) {
                var lexer = this.lexer;
                lexer.reset(chunk, this.lexerState);
                var token;
                while (true) {
                  try {
                    token = lexer.next();
                    if (!token) {
                      break;
                    }
                  } catch (e) {
                    var nextColumn = new Column(this.grammar, this.current + 1);
                    this.table.push(nextColumn);
                    var err = new Error(this.reportLexerError(e));
                    err.offset = this.current;
                    err.token = e.token;
                    throw err;
                  }
                  var column = this.table[this.current];
                  if (!this.options.keepHistory) {
                    delete this.table[this.current - 1];
                  }
                  var n = this.current + 1;
                  var nextColumn = new Column(this.grammar, n);
                  this.table.push(nextColumn);
                  var literal = token.text !== void 0 ? token.text : token.value;
                  var value = lexer.constructor === StreamLexer ? token.value : token;
                  var scannable = column.scannable;
                  for (var w = scannable.length; w--; ) {
                    var state = scannable[w];
                    var expect = state.rule.symbols[state.dot];
                    if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                      var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
                      nextColumn.states.push(next);
                    }
                  }
                  nextColumn.process();
                  if (nextColumn.states.length === 0) {
                    var err = new Error(this.reportError(token));
                    err.offset = this.current;
                    err.token = token;
                    throw err;
                  }
                  if (this.options.keepHistory) {
                    column.lexerState = lexer.save();
                  }
                  this.current++;
                }
                if (column) {
                  this.lexerState = lexer.save();
                }
                this.results = this.finish();
                return this;
              };
              Parser2.prototype.reportLexerError = function(lexerError) {
                var tokenDisplay, lexerMessage;
                var token = lexerError.token;
                if (token) {
                  tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
                  lexerMessage = this.lexer.formatError(token, "Syntax error");
                } else {
                  tokenDisplay = "input (lexer error)";
                  lexerMessage = lexerError.message;
                }
                return this.reportErrorCommon(lexerMessage, tokenDisplay);
              };
              Parser2.prototype.reportError = function(token) {
                var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
                var lexerMessage = this.lexer.formatError(token, "Syntax error");
                return this.reportErrorCommon(lexerMessage, tokenDisplay);
              };
              Parser2.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
                var lines = [];
                lines.push(lexerMessage);
                var lastColumnIndex = this.table.length - 2;
                var lastColumn = this.table[lastColumnIndex];
                var expectantStates = lastColumn.states.filter(function(state) {
                  var nextSymbol = state.rule.symbols[state.dot];
                  return nextSymbol && typeof nextSymbol !== "string";
                });
                if (expectantStates.length === 0) {
                  lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
                  this.displayStateStack(lastColumn.states, lines);
                } else {
                  lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
                  var stateStacks = expectantStates.map(function(state) {
                    return this.buildFirstStateStack(state, []) || [state];
                  }, this);
                  stateStacks.forEach(function(stateStack) {
                    var state = stateStack[0];
                    var nextSymbol = state.rule.symbols[state.dot];
                    var symbolDisplay = this.getSymbolDisplay(nextSymbol);
                    lines.push("A " + symbolDisplay + " based on:");
                    this.displayStateStack(stateStack, lines);
                  }, this);
                }
                lines.push("");
                return lines.join("\n");
              };
              Parser2.prototype.displayStateStack = function(stateStack, lines) {
                var lastDisplay;
                var sameDisplayCount = 0;
                for (var j = 0; j < stateStack.length; j++) {
                  var state = stateStack[j];
                  var display = state.rule.toString(state.dot);
                  if (display === lastDisplay) {
                    sameDisplayCount++;
                  } else {
                    if (sameDisplayCount > 0) {
                      lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
                    }
                    sameDisplayCount = 0;
                    lines.push("    " + display);
                  }
                  lastDisplay = display;
                }
              };
              Parser2.prototype.getSymbolDisplay = function(symbol) {
                return getSymbolLongDisplay(symbol);
              };
              Parser2.prototype.buildFirstStateStack = function(state, visited) {
                if (visited.indexOf(state) !== -1) {
                  return null;
                }
                if (state.wantedBy.length === 0) {
                  return [state];
                }
                var prevState = state.wantedBy[0];
                var childVisited = [state].concat(visited);
                var childResult = this.buildFirstStateStack(prevState, childVisited);
                if (childResult === null) {
                  return null;
                }
                return [state].concat(childResult);
              };
              Parser2.prototype.save = function() {
                var column = this.table[this.current];
                column.lexerState = this.lexerState;
                return column;
              };
              Parser2.prototype.restore = function(column) {
                var index = column.index;
                this.current = index;
                this.table[index] = column;
                this.table.splice(index + 1);
                this.lexerState = column.lexerState;
                this.results = this.finish();
              };
              Parser2.prototype.rewind = function(index) {
                if (!this.options.keepHistory) {
                  throw new Error("set option `keepHistory` to enable rewinding");
                }
                this.restore(this.table[index]);
              };
              Parser2.prototype.finish = function() {
                var considerations = [];
                var start = this.grammar.start;
                var column = this.table[this.table.length - 1];
                column.states.forEach(function(t) {
                  if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser2.fail) {
                    considerations.push(t);
                  }
                });
                return considerations.map(function(c) {
                  return c.data;
                });
              };
              function getSymbolLongDisplay(symbol) {
                var type2 = typeof symbol;
                if (type2 === "string") {
                  return symbol;
                } else if (type2 === "object") {
                  if (symbol.literal) {
                    return JSON.stringify(symbol.literal);
                  } else if (symbol instanceof RegExp) {
                    return "character matching " + symbol;
                  } else if (symbol.type) {
                    return symbol.type + " token";
                  } else if (symbol.test) {
                    return "token matching " + String(symbol.test);
                  } else {
                    throw new Error("Unknown symbol type: " + symbol);
                  }
                }
              }
              function getSymbolShortDisplay(symbol) {
                var type2 = typeof symbol;
                if (type2 === "string") {
                  return symbol;
                } else if (type2 === "object") {
                  if (symbol.literal) {
                    return JSON.stringify(symbol.literal);
                  } else if (symbol instanceof RegExp) {
                    return symbol.toString();
                  } else if (symbol.type) {
                    return "%" + symbol.type;
                  } else if (symbol.test) {
                    return "<" + String(symbol.test) + ">";
                  } else {
                    throw new Error("Unknown symbol type: " + symbol);
                  }
                }
              }
              return {
                Parser: Parser2,
                Grammar,
                Rule
              };
            });
          },
          549: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.ConstantIDLNode = void 0;
            const EnumIDLNode_1 = __webpack_require__2(561);
            const IDLNode_1 = __webpack_require__2(76);
            const primitiveTypes_1 = __webpack_require__2(205);
            class ConstantIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
                __publicField(this, "typeNeedsResolution", false);
                __publicField(this, "referencedEnumNode");
                if (!primitiveTypes_1.SIMPLE_TYPES.has(astNode.type)) {
                  this.typeNeedsResolution = true;
                }
              }
              get type() {
                if (this.typeNeedsResolution) {
                  return this.getReferencedEnumNode().type;
                }
                return this.astNode.type;
              }
              getReferencedEnumNode() {
                if (this.referencedEnumNode == void 0) {
                  const maybeEnumNode = this.getNode(this.scopePath, this.astNode.type);
                  if (!(maybeEnumNode instanceof EnumIDLNode_1.EnumIDLNode)) {
                    throw new Error(`Expected ${this.astNode.type} to be an enum in ${this.scopedIdentifier}`);
                  }
                  this.referencedEnumNode = maybeEnumNode;
                }
                return this.referencedEnumNode;
              }
              get isConstant() {
                return true;
              }
              get value() {
                if (typeof this.astNode.value === "object") {
                  return this.getConstantNode(this.astNode.value.name).value;
                }
                return this.astNode.value;
              }
              toIDLMessageDefinitionField() {
                return {
                  name: this.name,
                  type: (0, primitiveTypes_1.normalizeType)(this.type),
                  value: this.value,
                  isConstant: true,
                  isComplex: false,
                  ...this.astNode.valueText != void 0 ? { valueText: this.astNode.valueText } : void 0
                };
              }
            }
            exports2.ConstantIDLNode = ConstantIDLNode;
          },
          561: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.EnumIDLNode = void 0;
            const IDLNode_1 = __webpack_require__2(76);
            class EnumIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
              }
              get type() {
                return "uint32";
              }
              enumeratorNodes() {
                return this.astNode.enumerators.map((enumerator) => this.getConstantNode((0, IDLNode_1.toScopedIdentifier)([...this.scopePath, this.name, enumerator.name])));
              }
              toIDLMessageDefinition() {
                const definitions = this.enumeratorNodes().map((enumerator) => enumerator.toIDLMessageDefinitionField());
                return {
                  name: (0, IDLNode_1.toScopedIdentifier)([...this.scopePath, this.name]),
                  definitions,
                  aggregatedKind: "module"
                };
              }
            }
            exports2.EnumIDLNode = EnumIDLNode;
          },
          76: (__unused_webpack_module, exports2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.toScopedIdentifier = exports2.IDLNode = void 0;
            class IDLNode {
              constructor(scopePath, astNode, idlMap) {
                __publicField(this, "map");
                __publicField(this, "astNode");
                __publicField(this, "scopePath");
                this.scopePath = scopePath;
                this.astNode = astNode;
                this.map = idlMap;
              }
              get declarator() {
                return this.astNode.declarator;
              }
              get name() {
                return this.astNode.name;
              }
              get annotations() {
                return this.astNode.annotations;
              }
              get scopedIdentifier() {
                return toScopedIdentifier([...this.scopePath, this.name]);
              }
              getNode(scopePath, name) {
                const maybeNode = resolveScopedOrLocalNodeReference({
                  usedIdentifier: name,
                  scopeOfUsage: scopePath,
                  definitionMap: this.map
                });
                if (maybeNode == void 0) {
                  throw new Error(`Could not find node ${name} in ${scopePath.join("::")} referenced by ${this.scopedIdentifier}`);
                }
                return maybeNode;
              }
              getConstantNode(identifier, scopePath = this.scopePath) {
                const maybeConstantNode = this.getNode(scopePath, identifier);
                if (maybeConstantNode.declarator !== "const") {
                  throw new Error(`Expected ${this.name} to be a constant in ${this.scopedIdentifier}`);
                }
                return maybeConstantNode;
              }
            }
            exports2.IDLNode = IDLNode;
            function resolveScopedOrLocalNodeReference({ usedIdentifier, scopeOfUsage, definitionMap }) {
              let referencedNode = void 0;
              const namespacePrefixes = [...scopeOfUsage];
              const currPrefix = [];
              for (; ; ) {
                const identifierToTry = toScopedIdentifier([...currPrefix, usedIdentifier]);
                referencedNode = definitionMap.get(identifierToTry);
                if (referencedNode != void 0) {
                  break;
                }
                if (namespacePrefixes.length === 0) {
                  break;
                }
                currPrefix.push(namespacePrefixes.shift());
              }
              return referencedNode;
            }
            function toScopedIdentifier(path2) {
              return path2.join("::");
            }
            exports2.toScopedIdentifier = toScopedIdentifier;
          },
          667: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.ModuleIDLNode = void 0;
            const ConstantIDLNode_1 = __webpack_require__2(549);
            const IDLNode_1 = __webpack_require__2(76);
            class ModuleIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
              }
              toIDLMessageDefinition() {
                const definitions = this.definitions.flatMap((def) => {
                  if (def instanceof ConstantIDLNode_1.ConstantIDLNode) {
                    return [def.toIDLMessageDefinitionField()];
                  }
                  return [];
                });
                if (definitions.length === 0) {
                  return void 0;
                }
                return {
                  name: this.scopedIdentifier,
                  definitions,
                  aggregatedKind: "module"
                };
              }
              get definitions() {
                return this.astNode.definitions.map((def) => this.getNode([...this.scopePath, this.name], def.name));
              }
            }
            exports2.ModuleIDLNode = ModuleIDLNode;
          },
          212: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.ReferenceTypeIDLNode = void 0;
            const IDLNode_1 = __webpack_require__2(76);
            const primitiveTypes_1 = __webpack_require__2(205);
            class ReferenceTypeIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
                __publicField(this, "typeNeedsResolution", false);
                __publicField(this, "typeRefNode");
                if (!primitiveTypes_1.SIMPLE_TYPES.has(astNode.type)) {
                  this.typeNeedsResolution = true;
                }
              }
              get type() {
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef" || parent.declarator === "enum") {
                    return parent.type;
                  }
                  return parent.scopedIdentifier;
                }
                return this.astNode.type;
              }
              get isComplex() {
                if (!this.typeNeedsResolution) {
                  return false;
                }
                const parent = this.typeRef();
                if (parent.declarator === "typedef") {
                  return parent.isComplex;
                }
                return parent.declarator === "struct" || parent.declarator === "union";
              }
              get isArray() {
                let isArray2 = this.astNode.isArray;
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef") {
                    isArray2 || (isArray2 = parent.isArray);
                  }
                }
                return isArray2;
              }
              get arrayLengths() {
                const arrayLengths = this.astNode.arrayLengths ? [...this.astNode.arrayLengths] : [];
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef" && parent.arrayLengths) {
                    arrayLengths.push(...parent.arrayLengths);
                  }
                }
                const finalArrayLengths = [];
                for (const arrayLength of arrayLengths) {
                  const resolvedArrayLength = this.resolvePossibleNumericConstantUsage(arrayLength);
                  if (resolvedArrayLength != void 0) {
                    finalArrayLengths.push(resolvedArrayLength);
                  }
                }
                return finalArrayLengths.length > 0 ? finalArrayLengths : void 0;
              }
              get arrayUpperBound() {
                let arrayUpperBound = void 0;
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef") {
                    arrayUpperBound = parent.arrayUpperBound;
                  }
                }
                if (this.astNode.arrayUpperBound != void 0) {
                  arrayUpperBound = this.astNode.arrayUpperBound;
                }
                return this.resolvePossibleNumericConstantUsage(arrayUpperBound);
              }
              get upperBound() {
                let upperBound = void 0;
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef") {
                    upperBound = parent.upperBound;
                  }
                }
                if (this.astNode.upperBound != void 0) {
                  upperBound = this.astNode.upperBound;
                }
                return this.resolvePossibleNumericConstantUsage(upperBound);
              }
              get annotations() {
                let annotations = void 0;
                if (this.typeNeedsResolution) {
                  const parent = this.typeRef();
                  if (parent.declarator === "typedef" && parent.annotations != void 0) {
                    annotations = { ...parent.annotations };
                  }
                }
                if (this.astNode.annotations != void 0) {
                  annotations = { ...annotations, ...this.astNode.annotations };
                }
                return annotations;
              }
              resolvePossibleNumericConstantUsage(astValue) {
                if (typeof astValue === "number" || astValue == void 0) {
                  return astValue;
                }
                const constantNodeIdentifier = astValue.name;
                const constantNodeValue = this.getConstantNode(constantNodeIdentifier).value;
                if (typeof constantNodeValue !== "number") {
                  throw Error(`Expected constant value ${constantNodeIdentifier} in ${this.scopedIdentifier} to be a number, but got ${constantNodeValue.toString()}`);
                }
                return constantNodeValue;
              }
              getValidTypeReference(typeName) {
                const maybeValidParent = this.getNode(this.scopePath, typeName);
                if (!(maybeValidParent.declarator === "struct") && !(maybeValidParent.declarator === "typedef") && !(maybeValidParent.declarator === "union") && !(maybeValidParent.declarator === "enum")) {
                  throw new Error(`Expected ${typeName} to be non-module, non-constant type in ${this.scopedIdentifier}`);
                }
                return maybeValidParent;
              }
              typeRef() {
                if (this.typeRefNode == void 0) {
                  this.typeRefNode = this.getValidTypeReference(this.astNode.type);
                }
                if (!(this.typeRefNode instanceof ReferenceTypeIDLNode)) {
                  return this.typeRefNode;
                }
                if (this.astNode.isArray === true && this.typeRefNode.isArray === true) {
                  const thisNodeIsFixedSize = this.astNode.arrayLengths != void 0;
                  const parentNodeIsFixedSize = this.typeRefNode.arrayLengths != void 0;
                  if (!thisNodeIsFixedSize || !parentNodeIsFixedSize) {
                    throw new Error(`We do not support composing variable length arrays with typedefs: ${this.scopedIdentifier} referencing ${this.typeRefNode.scopedIdentifier}`);
                  }
                }
                return this.typeRefNode;
              }
            }
            exports2.ReferenceTypeIDLNode = ReferenceTypeIDLNode;
          },
          801: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.StructIDLNode = void 0;
            const IDLNode_1 = __webpack_require__2(76);
            class StructIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
              }
              get type() {
                return this.astNode.name;
              }
              get definitions() {
                return this.astNode.definitions.map((def) => this.getStructMemberNode(def.name));
              }
              toIDLMessageDefinition() {
                const definitions = this.definitions.map((def) => def.toIDLMessageDefinitionField());
                return {
                  name: this.scopedIdentifier,
                  definitions,
                  aggregatedKind: "struct",
                  ...this.astNode.annotations ? { annotations: this.astNode.annotations } : void 0
                };
              }
              getStructMemberNode(name) {
                const maybeStructMember = this.getNode([...this.scopePath, this.name], name);
                if (maybeStructMember.declarator !== "struct-member") {
                  throw new Error(`Expected ${name} to be a struct member in ${this.scopedIdentifier}`);
                }
                return maybeStructMember;
              }
            }
            exports2.StructIDLNode = StructIDLNode;
          },
          605: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.StructMemberIDLNode = void 0;
            const ReferenceTypeIDLNode_1 = __webpack_require__2(212);
            const primitiveTypes_1 = __webpack_require__2(205);
            class StructMemberIDLNode extends ReferenceTypeIDLNode_1.ReferenceTypeIDLNode {
              constructor(scopePath, node, idlMap) {
                super(scopePath, node, idlMap);
              }
              toIDLMessageDefinitionField() {
                const msgDefinitionField = {
                  name: this.name,
                  type: (0, primitiveTypes_1.normalizeType)(this.type),
                  isComplex: this.isComplex
                };
                if (this.arrayLengths != void 0) {
                  msgDefinitionField.arrayLengths = this.arrayLengths;
                }
                if (this.arrayUpperBound != void 0) {
                  msgDefinitionField.arrayUpperBound = this.arrayUpperBound;
                }
                if (this.upperBound != void 0) {
                  msgDefinitionField.upperBound = this.upperBound;
                }
                if (this.annotations != void 0) {
                  msgDefinitionField.annotations = this.annotations;
                }
                if (this.isArray != void 0) {
                  msgDefinitionField.isArray = this.isArray;
                }
                const maybeDefault = this.annotations?.default;
                if (maybeDefault && maybeDefault.type !== "no-params") {
                  const defaultValue = maybeDefault.type === "const-param" ? maybeDefault.value : maybeDefault.namedParams.value;
                  if (typeof defaultValue !== "object") {
                    msgDefinitionField.defaultValue = defaultValue;
                  } else {
                    msgDefinitionField.defaultValue = this.getConstantNode(defaultValue.name).value;
                  }
                }
                return msgDefinitionField;
              }
            }
            exports2.StructMemberIDLNode = StructMemberIDLNode;
          },
          647: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.TypedefIDLNode = void 0;
            const ReferenceTypeIDLNode_1 = __webpack_require__2(212);
            class TypedefIDLNode extends ReferenceTypeIDLNode_1.ReferenceTypeIDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
              }
            }
            exports2.TypedefIDLNode = TypedefIDLNode;
          },
          57: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.UnionIDLNode = void 0;
            const IDLNode_1 = __webpack_require__2(76);
            const StructMemberIDLNode_1 = __webpack_require__2(605);
            const primitiveTypes_1 = __webpack_require__2(205);
            class UnionIDLNode extends IDLNode_1.IDLNode {
              constructor(scopePath, astNode, idlMap) {
                super(scopePath, astNode, idlMap);
                __publicField(this, "switchTypeNeedsResolution", false);
                __publicField(this, "_switchTypeNode");
                if (!primitiveTypes_1.SIMPLE_TYPES.has(this.astNode.switchType)) {
                  this.switchTypeNeedsResolution = true;
                }
              }
              get type() {
                return this.astNode.name;
              }
              get isComplex() {
                return true;
              }
              switchTypeNode() {
                if (this._switchTypeNode) {
                  return this._switchTypeNode;
                }
                const typeNode = this.getNode(this.scopePath, this.astNode.switchType);
                if (typeNode.declarator !== "enum" && typeNode.declarator !== "typedef") {
                  throw new Error(`Invalid switch type "${typeNode.scopedIdentifier}" ${this.astNode.switchType} in ${this.scopedIdentifier}`);
                }
                this._switchTypeNode = typeNode;
                return typeNode;
              }
              get switchType() {
                let switchType = this.astNode.switchType;
                if (this.switchTypeNeedsResolution) {
                  switchType = this.switchTypeNode().type;
                }
                if (!isValidSwitchType(switchType)) {
                  throw new Error(`Invalid resolved switch type ${switchType} in ${this.scopedIdentifier}`);
                }
                return switchType;
              }
              get cases() {
                const isEnumSwitchType = this.switchTypeNeedsResolution && this.switchTypeNode().declarator === "enum";
                const predicateScopePath = isEnumSwitchType ? this.switchTypeNode().scopedIdentifier.split("::") : this.scopePath;
                return this.astNode.cases.map((def) => {
                  const typeNode = new StructMemberIDLNode_1.StructMemberIDLNode(
                    [...this.scopePath, this.name],
                    { ...def.type, declarator: "struct-member" },
                    this.map
                  );
                  const resolvedPredicates = def.predicates.map((predicate) => {
                    if (typeof predicate === "object") {
                      return this.getConstantNode(predicate.name, predicateScopePath).value;
                    }
                    return predicate;
                  });
                  const resolvedType = typeNode.toIDLMessageDefinitionField();
                  return {
                    type: resolvedType,
                    predicates: resolvedPredicates
                  };
                });
              }
              get defaultCase() {
                if (!this.astNode.defaultCase) {
                  return void 0;
                }
                const typeNode = new StructMemberIDLNode_1.StructMemberIDLNode(
                  [...this.scopePath, this.name],
                  { ...this.astNode.defaultCase, declarator: "struct-member" },
                  this.map
                );
                return typeNode.toIDLMessageDefinitionField();
              }
              toIDLMessageDefinition() {
                const annotations = this.annotations;
                return {
                  name: this.scopedIdentifier,
                  switchType: (0, primitiveTypes_1.normalizeType)(this.switchType),
                  cases: this.cases,
                  aggregatedKind: "union",
                  ...this.astNode.defaultCase ? { defaultCase: this.defaultCase } : void 0,
                  ...annotations ? { annotations } : void 0
                };
              }
            }
            exports2.UnionIDLNode = UnionIDLNode;
            function isValidSwitchType(type2) {
              return primitiveTypes_1.INTEGER_TYPES.has(type2) || type2 === "bool";
            }
          },
          732: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = { enumerable: true, get: function() {
                  return m[k];
                } };
              }
              Object.defineProperty(o, k2, desc);
            } : function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function(m, exports3) {
              for (var p in m)
                if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                  __createBinding(exports3, m, p);
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            __exportStar(__webpack_require__2(549), exports2);
            __exportStar(__webpack_require__2(561), exports2);
            __exportStar(__webpack_require__2(76), exports2);
            __exportStar(__webpack_require__2(667), exports2);
            __exportStar(__webpack_require__2(801), exports2);
            __exportStar(__webpack_require__2(605), exports2);
            __exportStar(__webpack_require__2(647), exports2);
          },
          654: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __importDefault = this && this.__importDefault || function(mod2) {
              return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.IDL_GRAMMAR = void 0;
            const nearley_1 = __webpack_require__2(614);
            const idl_ne_1 = __importDefault(__webpack_require__2(461));
            exports2.IDL_GRAMMAR = nearley_1.Grammar.fromCompiled(idl_ne_1.default);
          },
          715: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = { enumerable: true, get: function() {
                  return m[k];
                } };
              }
              Object.defineProperty(o, k2, desc);
            } : function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function(m, exports3) {
              for (var p in m)
                if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                  __createBinding(exports3, m, p);
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            __exportStar(__webpack_require__2(494), exports2);
            __exportStar(__webpack_require__2(862), exports2);
          },
          494: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.parseIDL = void 0;
            const parseIDLToAST_1 = __webpack_require__2(171);
            const processIDL_1 = __webpack_require__2(940);
            function parseIDL(messageDefinition) {
              const rawIDLDefinitions = (0, parseIDLToAST_1.parseIDLToAST)(messageDefinition);
              const idlMap = (0, processIDL_1.buildMap)(rawIDLDefinitions);
              return (0, processIDL_1.toIDLMessageDefinitions)(idlMap);
            }
            exports2.parseIDL = parseIDL;
          },
          171: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.parseIDLToAST = void 0;
            const nearley_1 = __webpack_require__2(614);
            const grammar_1 = __webpack_require__2(654);
            function parseIDLToAST(definition) {
              const parser = new nearley_1.Parser(grammar_1.IDL_GRAMMAR);
              parser.feed(definition);
              parser.finish();
              const results = parser.results;
              if (results.length === 0) {
                throw new Error(`Could not parse message definition (unexpected end of input): '${definition}'`);
              }
              if (results.length > 1) {
                throw new Error(`Ambiguous grammar: '${definition}'`);
              }
              return results[0];
            }
            exports2.parseIDLToAST = parseIDLToAST;
          },
          205: (__unused_webpack_module, exports2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.normalizeType = exports2.SIMPLE_TYPES = exports2.INTEGER_TYPES = void 0;
            const numericTypeMap = {
              "unsigned short": "uint16",
              "unsigned long": "uint32",
              "unsigned long long": "uint64",
              short: "int16",
              long: "int32",
              "long long": "int64",
              double: "float64",
              float: "float32",
              octet: "uint8",
              char: "uint8",
              byte: "int8"
            };
            exports2.INTEGER_TYPES = /* @__PURE__ */ new Set([
              "int8",
              "uint8",
              "int16",
              "uint16",
              "int32",
              "uint32",
              "int64",
              "uint64",
              "byte",
              "octet",
              "unsigned short",
              "unsigned long",
              "unsigned long long",
              "short",
              "long",
              "long long"
            ]);
            exports2.SIMPLE_TYPES = /* @__PURE__ */ new Set([
              "bool",
              "string",
              "wstring",
              "int8",
              "uint8",
              "int16",
              "uint16",
              "int32",
              "uint32",
              "int64",
              "uint64",
              "wchar",
              ...Object.keys(numericTypeMap)
            ]);
            function normalizeType(type2) {
              const toType = numericTypeMap[type2];
              if (toType != void 0) {
                return toType;
              }
              return type2;
            }
            exports2.normalizeType = normalizeType;
          },
          940: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.toIDLMessageDefinitions = exports2.buildMap = void 0;
            const IDLNodes_1 = __webpack_require__2(732);
            const UnionIDLNode_1 = __webpack_require__2(57);
            function buildMap(definitions) {
              const idlMap = /* @__PURE__ */ new Map();
              for (const definition of definitions) {
                traverseIDL([definition], (path2) => {
                  const node = path2[path2.length - 1];
                  const namePath = path2.map((n) => n.name);
                  const scopePath = namePath.slice(0, -1);
                  const newNode = makeIDLNode(scopePath, node, idlMap);
                  idlMap.set(newNode.scopedIdentifier, newNode);
                  if (node.declarator === "enum") {
                    let nextImplicitIEnumValue = 0;
                    const enumConstants = node.enumerators.map((m) => ({
                      declarator: "const",
                      isConstant: true,
                      name: m.name,
                      type: "unsigned long",
                      value: getValueAnnotation(m.annotations) ?? nextImplicitIEnumValue++,
                      isComplex: false
                    }));
                    for (const constant of enumConstants) {
                      const idlConstantNode = new IDLNodes_1.ConstantIDLNode(namePath, constant, idlMap);
                      idlMap.set(idlConstantNode.scopedIdentifier, idlConstantNode);
                    }
                  }
                });
              }
              return idlMap;
            }
            exports2.buildMap = buildMap;
            function getValueAnnotation(annotations) {
              if (!annotations) {
                return void 0;
              }
              const valueAnnotation = annotations["value"];
              if (valueAnnotation && valueAnnotation.type === "const-param") {
                return valueAnnotation.value;
              }
              return void 0;
            }
            function toIDLMessageDefinitions(map) {
              const messageDefinitions = [];
              const topLevelConstantDefinitions = [];
              for (const node of map.values()) {
                if (node.declarator === "struct") {
                  messageDefinitions.push(node.toIDLMessageDefinition());
                } else if (node.declarator === "module") {
                  const def = node.toIDLMessageDefinition();
                  if (def != void 0) {
                    messageDefinitions.push(def);
                  }
                } else if (node.declarator === "const") {
                  if (node.scopePath.length === 0) {
                    topLevelConstantDefinitions.push(node.toIDLMessageDefinitionField());
                  }
                } else if (node.declarator === "enum") {
                  messageDefinitions.push(node.toIDLMessageDefinition());
                } else if (node.declarator === "union") {
                  messageDefinitions.push(node.toIDLMessageDefinition());
                }
              }
              if (topLevelConstantDefinitions.length > 0) {
                messageDefinitions.push({
                  name: "",
                  definitions: topLevelConstantDefinitions,
                  aggregatedKind: "module"
                });
              }
              return messageDefinitions;
            }
            exports2.toIDLMessageDefinitions = toIDLMessageDefinitions;
            const makeIDLNode = (scopePath, node, idlMap) => {
              switch (node.declarator) {
                case "module":
                  return new IDLNodes_1.ModuleIDLNode(scopePath, node, idlMap);
                case "enum":
                  return new IDLNodes_1.EnumIDLNode(scopePath, node, idlMap);
                case "const":
                  return new IDLNodes_1.ConstantIDLNode(scopePath, node, idlMap);
                case "struct":
                  return new IDLNodes_1.StructIDLNode(scopePath, node, idlMap);
                case "struct-member":
                  return new IDLNodes_1.StructMemberIDLNode(scopePath, node, idlMap);
                case "typedef":
                  return new IDLNodes_1.TypedefIDLNode(scopePath, node, idlMap);
                case "union":
                  return new UnionIDLNode_1.UnionIDLNode(scopePath, node, idlMap);
              }
            };
            function traverseIDL(path2, processNode) {
              const currNode = path2[path2.length - 1];
              if ("definitions" in currNode) {
                currNode.definitions.forEach((n) => traverseIDL([...path2, n], processNode));
              }
              processNode(path2);
            }
          },
          862: (__unused_webpack_module, exports2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
          }
        };
        var __webpack_module_cache__ = {};
        function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (cachedModule !== void 0) {
            return cachedModule.exports;
          }
          var module3 = __webpack_module_cache__[moduleId] = {
            exports: {}
          };
          __webpack_modules__[moduleId].call(module3.exports, module3, module3.exports, __webpack_require__);
          return module3.exports;
        }
        var __webpack_exports__ = __webpack_require__(715);
        module2.exports = __webpack_exports__;
      })();
    })(dist$6);
    var dist$5 = {};
    var MessageReader$4 = {};
    var dist$4 = {};
    var CdrReader$3 = {};
    var getEncapsulationKindInfo$3 = {};
    var EncapsulationKind$1 = {};
    (function(exports2) {
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.EncapsulationKind = void 0;
      (function(EncapsulationKind2) {
        EncapsulationKind2[EncapsulationKind2["CDR_BE"] = 0] = "CDR_BE";
        EncapsulationKind2[EncapsulationKind2["CDR_LE"] = 1] = "CDR_LE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR_BE"] = 2] = "PL_CDR_BE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR_LE"] = 3] = "PL_CDR_LE";
        EncapsulationKind2[EncapsulationKind2["CDR2_BE"] = 16] = "CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["CDR2_LE"] = 17] = "CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR2_BE"] = 18] = "PL_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR2_LE"] = 19] = "PL_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["DELIMITED_CDR2_BE"] = 20] = "DELIMITED_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["DELIMITED_CDR2_LE"] = 21] = "DELIMITED_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_CDR2_BE"] = 6] = "RTPS_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_CDR2_LE"] = 7] = "RTPS_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_DELIMITED_CDR2_BE"] = 8] = "RTPS_DELIMITED_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_DELIMITED_CDR2_LE"] = 9] = "RTPS_DELIMITED_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_PL_CDR2_BE"] = 10] = "RTPS_PL_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_PL_CDR2_LE"] = 11] = "RTPS_PL_CDR2_LE";
      })(exports2.EncapsulationKind || (exports2.EncapsulationKind = {}));
    })(EncapsulationKind$1);
    Object.defineProperty(getEncapsulationKindInfo$3, "__esModule", { value: true });
    getEncapsulationKindInfo$3.getEncapsulationKindInfo = void 0;
    const EncapsulationKind_1$3 = EncapsulationKind$1;
    const getEncapsulationKindInfo$2 = (kind) => {
      const isCDR2 = kind > EncapsulationKind_1$3.EncapsulationKind.PL_CDR_LE;
      const littleEndian = kind === EncapsulationKind_1$3.EncapsulationKind.CDR_LE || kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR_LE || kind === EncapsulationKind_1$3.EncapsulationKind.CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.DELIMITED_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_PL_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_DELIMITED_CDR2_LE;
      const isDelimitedCDR2 = kind === EncapsulationKind_1$3.EncapsulationKind.DELIMITED_CDR2_BE || kind === EncapsulationKind_1$3.EncapsulationKind.DELIMITED_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_DELIMITED_CDR2_BE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_DELIMITED_CDR2_LE;
      const isPLCDR2 = kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR2_BE || kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR2_LE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_PL_CDR2_BE || kind === EncapsulationKind_1$3.EncapsulationKind.RTPS_PL_CDR2_LE;
      const isPLCDR1 = kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR_BE || kind === EncapsulationKind_1$3.EncapsulationKind.PL_CDR_LE;
      const usesDelimiterHeader = isDelimitedCDR2 || isPLCDR2;
      const usesMemberHeader = isPLCDR2 || isPLCDR1;
      return {
        isCDR2,
        littleEndian,
        usesDelimiterHeader,
        usesMemberHeader
      };
    };
    getEncapsulationKindInfo$3.getEncapsulationKindInfo = getEncapsulationKindInfo$2;
    var isBigEndian$4 = {};
    Object.defineProperty(isBigEndian$4, "__esModule", { value: true });
    isBigEndian$4.isBigEndian = void 0;
    const endianTestArray$1 = new Uint8Array(4);
    const endianTestView$1 = new Uint32Array(endianTestArray$1.buffer);
    endianTestView$1[0] = 1;
    function isBigEndian$3() {
      return endianTestArray$1[3] === 1;
    }
    isBigEndian$4.isBigEndian = isBigEndian$3;
    var lengthCodes$1 = {};
    Object.defineProperty(lengthCodes$1, "__esModule", { value: true });
    lengthCodes$1.lengthCodeToObjectSizes = lengthCodes$1.getLengthCodeForObjectSize = void 0;
    function getLengthCodeForObjectSize$1(objectSize) {
      let defaultLengthCode;
      switch (objectSize) {
        case 1:
          defaultLengthCode = 0;
          break;
        case 2:
          defaultLengthCode = 1;
          break;
        case 4:
          defaultLengthCode = 2;
          break;
        case 8:
          defaultLengthCode = 3;
          break;
      }
      if (defaultLengthCode == void 0) {
        if (objectSize > 4294967295) {
          throw Error(`Object size ${objectSize} for EMHEADER too large without specifying length code. Max size is ${4294967295}`);
        }
        defaultLengthCode = 4;
      }
      return defaultLengthCode;
    }
    lengthCodes$1.getLengthCodeForObjectSize = getLengthCodeForObjectSize$1;
    lengthCodes$1.lengthCodeToObjectSizes = {
      0: 1,
      1: 2,
      2: 4,
      3: 8
    };
    var reservedPIDs$1 = {};
    Object.defineProperty(reservedPIDs$1, "__esModule", { value: true });
    reservedPIDs$1.SENTINEL_PID = reservedPIDs$1.EXTENDED_PID = void 0;
    reservedPIDs$1.EXTENDED_PID = 16129;
    reservedPIDs$1.SENTINEL_PID = 16130;
    Object.defineProperty(CdrReader$3, "__esModule", { value: true });
    CdrReader$3.CdrReader = void 0;
    const getEncapsulationKindInfo_1$3 = getEncapsulationKindInfo$3;
    const isBigEndian_1$3 = isBigEndian$4;
    const lengthCodes_1$3 = lengthCodes$1;
    const reservedPIDs_1$3 = reservedPIDs$1;
    class CdrReader$2 {
      constructor(data) {
        this.textDecoder = new TextDecoder("utf8");
        this.origin = 0;
        if (data.byteLength < 4) {
          throw new Error(`Invalid CDR data size ${data.byteLength}, must contain at least a 4-byte header`);
        }
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        const kind = this.kind;
        const { isCDR2, littleEndian, usesDelimiterHeader, usesMemberHeader } = (0, getEncapsulationKindInfo_1$3.getEncapsulationKindInfo)(kind);
        this.usesDelimiterHeader = usesDelimiterHeader;
        this.usesMemberHeader = usesMemberHeader;
        this.littleEndian = littleEndian;
        this.hostLittleEndian = !(0, isBigEndian_1$3.isBigEndian)();
        this.isCDR2 = isCDR2;
        this.eightByteAlignment = isCDR2 ? 4 : 8;
        this.origin = 4;
        this.offset = 4;
      }
      get kind() {
        return this.view.getUint8(1);
      }
      get decodedBytes() {
        return this.offset;
      }
      get byteLength() {
        return this.view.byteLength;
      }
      int8() {
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
      }
      uint8() {
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
      }
      int16() {
        this.align(2);
        const value = this.view.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
      }
      uint16() {
        this.align(2);
        const value = this.view.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
      }
      int32() {
        this.align(4);
        const value = this.view.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      uint32() {
        this.align(4);
        const value = this.view.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      int64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigInt64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      uint64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigUint64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      uint16BE() {
        this.align(2);
        const value = this.view.getUint16(this.offset, false);
        this.offset += 2;
        return value;
      }
      uint32BE() {
        this.align(4);
        const value = this.view.getUint32(this.offset, false);
        this.offset += 4;
        return value;
      }
      uint64BE() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigUint64(this.offset, false);
        this.offset += 8;
        return value;
      }
      float32() {
        this.align(4);
        const value = this.view.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      float64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      string(prereadLength) {
        const length = prereadLength ?? this.uint32();
        if (length <= 1) {
          this.offset += length;
          return "";
        }
        const data = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length - 1);
        const value = this.textDecoder.decode(data);
        this.offset += length;
        return value;
      }
      dHeader() {
        const header = this.uint32();
        return header;
      }
      emHeader() {
        if (this.isCDR2) {
          return this.memberHeaderV2();
        } else {
          return this.memberHeaderV1();
        }
      }
      memberHeaderV1() {
        this.align(4);
        const idHeader = this.uint16();
        const mustUnderstandFlag = (idHeader & 16384) >> 14 === 1;
        const implementationSpecificFlag = (idHeader & 32768) >> 15 === 1;
        const extendedPIDFlag = (idHeader & 16383) === reservedPIDs_1$3.EXTENDED_PID;
        const sentinelPIDFlag = (idHeader & 16383) === reservedPIDs_1$3.SENTINEL_PID;
        if (sentinelPIDFlag) {
          throw Error("Expected Member Header but got SENTINEL_PID Flag");
        }
        const usesReservedParameterId = (idHeader & 16383) > reservedPIDs_1$3.SENTINEL_PID;
        if (usesReservedParameterId || implementationSpecificFlag) {
          throw new Error(`Unsupported parameter ID header ${idHeader.toString(16)}`);
        }
        if (extendedPIDFlag) {
          this.uint16();
        }
        const id = extendedPIDFlag ? this.uint32() : idHeader & 16383;
        const objectSize = extendedPIDFlag ? this.uint32() : this.uint16();
        this.resetOrigin();
        return { id, objectSize, mustUnderstand: mustUnderstandFlag };
      }
      resetOrigin() {
        this.origin = this.offset;
      }
      sentinelHeader() {
        if (!this.isCDR2) {
          this.align(4);
          const header = this.uint16();
          const sentinelPIDFlag = (header & 16383) === reservedPIDs_1$3.SENTINEL_PID;
          if (!sentinelPIDFlag) {
            throw Error(`Expected SENTINEL_PID (${reservedPIDs_1$3.SENTINEL_PID.toString(16)}) flag, but got ${header.toString(16)}`);
          }
          this.uint16();
        }
      }
      memberHeaderV2() {
        const header = this.uint32();
        const mustUnderstand = Math.abs((header & 2147483648) >> 31) === 1;
        const lengthCode = (header & 1879048192) >> 28;
        const id = header & 268435455;
        const objectSize = this.emHeaderObjectSize(lengthCode);
        return { mustUnderstand, id, objectSize, lengthCode };
      }
      emHeaderObjectSize(lengthCode) {
        switch (lengthCode) {
          case 0:
          case 1:
          case 2:
          case 3:
            return lengthCodes_1$3.lengthCodeToObjectSizes[lengthCode];
          case 4:
          case 5:
            return this.uint32();
          case 6:
            return 4 * this.uint32();
          case 7:
            return 8 * this.uint32();
          default:
            throw new Error(
              `Invalid length code ${lengthCode} in EMHEADER at offset ${this.offset - 4}`
            );
        }
      }
      sequenceLength() {
        return this.uint32();
      }
      int8Array(count = this.sequenceLength()) {
        const array = new Int8Array(this.view.buffer, this.view.byteOffset + this.offset, count);
        this.offset += count;
        return array;
      }
      uint8Array(count = this.sequenceLength()) {
        const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, count);
        this.offset += count;
        return array;
      }
      int16Array(count = this.sequenceLength()) {
        return this.typedArray(Int16Array, "getInt16", count);
      }
      uint16Array(count = this.sequenceLength()) {
        return this.typedArray(Uint16Array, "getUint16", count);
      }
      int32Array(count = this.sequenceLength()) {
        return this.typedArray(Int32Array, "getInt32", count);
      }
      uint32Array(count = this.sequenceLength()) {
        return this.typedArray(Uint32Array, "getUint32", count);
      }
      int64Array(count = this.sequenceLength()) {
        return this.typedArray(BigInt64Array, "getBigInt64", count, this.eightByteAlignment);
      }
      uint64Array(count = this.sequenceLength()) {
        return this.typedArray(BigUint64Array, "getBigUint64", count, this.eightByteAlignment);
      }
      float32Array(count = this.sequenceLength()) {
        return this.typedArray(Float32Array, "getFloat32", count);
      }
      float64Array(count = this.sequenceLength()) {
        return this.typedArray(Float64Array, "getFloat64", count, this.eightByteAlignment);
      }
      stringArray(count = this.sequenceLength()) {
        const output = [];
        for (let i = 0; i < count; i++) {
          output.push(this.string());
        }
        return output;
      }
      seek(relativeOffset) {
        const newOffset = this.offset + relativeOffset;
        if (newOffset < 4 || newOffset >= this.view.byteLength) {
          throw new Error(`seek(${relativeOffset}) failed, ${newOffset} is outside the data range`);
        }
        this.offset = newOffset;
      }
      seekTo(offset) {
        if (offset < 4 || offset >= this.view.byteLength) {
          throw new Error(`seekTo(${offset}) failed, value is outside the data range`);
        }
        this.offset = offset;
      }
      align(size) {
        const alignment = (this.offset - this.origin) % size;
        if (alignment > 0) {
          this.offset += size - alignment;
        }
      }
      typedArray(TypedArrayConstructor, getter, count, alignment = TypedArrayConstructor.BYTES_PER_ELEMENT) {
        if (count === 0) {
          return new TypedArrayConstructor();
        }
        this.align(alignment);
        const totalOffset = this.view.byteOffset + this.offset;
        if (this.littleEndian !== this.hostLittleEndian) {
          return this.typedArraySlow(TypedArrayConstructor, getter, count);
        } else if (totalOffset % TypedArrayConstructor.BYTES_PER_ELEMENT === 0) {
          const array = new TypedArrayConstructor(this.view.buffer, totalOffset, count);
          this.offset += TypedArrayConstructor.BYTES_PER_ELEMENT * count;
          return array;
        } else {
          return this.typedArrayUnaligned(TypedArrayConstructor, getter, count);
        }
      }
      typedArrayUnaligned(TypedArrayConstructor, getter, count) {
        if (count < 10) {
          return this.typedArraySlow(TypedArrayConstructor, getter, count);
        }
        const byteLength = TypedArrayConstructor.BYTES_PER_ELEMENT * count;
        const copy = new Uint8Array(byteLength);
        copy.set(new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, byteLength));
        this.offset += byteLength;
        return new TypedArrayConstructor(copy.buffer, copy.byteOffset, count);
      }
      typedArraySlow(TypedArrayConstructor, getter, count) {
        const array = new TypedArrayConstructor(count);
        let offset = this.offset;
        for (let i = 0; i < count; i++) {
          array[i] = this.view[getter](offset, this.littleEndian);
          offset += TypedArrayConstructor.BYTES_PER_ELEMENT;
        }
        this.offset = offset;
        return array;
      }
    }
    CdrReader$3.CdrReader = CdrReader$2;
    var CdrSizeCalculator$3 = {};
    Object.defineProperty(CdrSizeCalculator$3, "__esModule", { value: true });
    CdrSizeCalculator$3.CdrSizeCalculator = void 0;
    class CdrSizeCalculator$2 {
      constructor() {
        this.offset = 4;
      }
      get size() {
        return this.offset;
      }
      int8() {
        return this.incrementAndReturn(1);
      }
      uint8() {
        return this.incrementAndReturn(1);
      }
      int16() {
        return this.incrementAndReturn(2);
      }
      uint16() {
        return this.incrementAndReturn(2);
      }
      int32() {
        return this.incrementAndReturn(4);
      }
      uint32() {
        return this.incrementAndReturn(4);
      }
      int64() {
        return this.incrementAndReturn(8);
      }
      uint64() {
        return this.incrementAndReturn(8);
      }
      float32() {
        return this.incrementAndReturn(4);
      }
      float64() {
        return this.incrementAndReturn(8);
      }
      string(length) {
        this.uint32();
        this.offset += length + 1;
        return this.offset;
      }
      sequenceLength() {
        return this.uint32();
      }
      incrementAndReturn(byteCount) {
        const alignment = (this.offset - 4) % byteCount;
        if (alignment > 0) {
          this.offset += byteCount - alignment;
        }
        this.offset += byteCount;
        return this.offset;
      }
    }
    CdrSizeCalculator$3.CdrSizeCalculator = CdrSizeCalculator$2;
    var CdrWriter$3 = {};
    Object.defineProperty(CdrWriter$3, "__esModule", { value: true });
    CdrWriter$3.CdrWriter = void 0;
    const EncapsulationKind_1$2 = EncapsulationKind$1;
    const getEncapsulationKindInfo_1$2 = getEncapsulationKindInfo$3;
    const isBigEndian_1$2 = isBigEndian$4;
    const lengthCodes_1$2 = lengthCodes$1;
    const reservedPIDs_1$2 = reservedPIDs$1;
    class CdrWriter$2 {
      constructor(options = {}) {
        this.textEncoder = new TextEncoder();
        if (options.buffer != void 0) {
          this.buffer = options.buffer;
        } else if (options.size != void 0) {
          this.buffer = new ArrayBuffer(options.size);
        } else {
          this.buffer = new ArrayBuffer(CdrWriter$2.DEFAULT_CAPACITY);
        }
        const kind = options.kind ?? EncapsulationKind_1$2.EncapsulationKind.CDR_LE;
        const { isCDR2, littleEndian } = (0, getEncapsulationKindInfo_1$2.getEncapsulationKindInfo)(kind);
        this.isCDR2 = isCDR2;
        this.littleEndian = littleEndian;
        this.hostLittleEndian = !(0, isBigEndian_1$2.isBigEndian)();
        this.eightByteAlignment = isCDR2 ? 4 : 8;
        this.array = new Uint8Array(this.buffer);
        this.view = new DataView(this.buffer);
        this.resizeIfNeeded(4);
        this.view.setUint8(0, 0);
        this.view.setUint8(1, kind);
        this.view.setUint16(2, 0, false);
        this.offset = 4;
        this.origin = 4;
      }
      get data() {
        return new Uint8Array(this.buffer, 0, this.offset);
      }
      get size() {
        return this.offset;
      }
      get kind() {
        return this.view.getUint8(1);
      }
      int8(value) {
        this.resizeIfNeeded(1);
        this.view.setInt8(this.offset, value);
        this.offset += 1;
        return this;
      }
      uint8(value) {
        this.resizeIfNeeded(1);
        this.view.setUint8(this.offset, value);
        this.offset += 1;
        return this;
      }
      int16(value) {
        this.align(2);
        this.view.setInt16(this.offset, value, this.littleEndian);
        this.offset += 2;
        return this;
      }
      uint16(value) {
        this.align(2);
        this.view.setUint16(this.offset, value, this.littleEndian);
        this.offset += 2;
        return this;
      }
      int32(value) {
        this.align(4);
        this.view.setInt32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      uint32(value) {
        this.align(4);
        this.view.setUint32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      int64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigInt64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      uint64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigUint64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      uint16BE(value) {
        this.align(2);
        this.view.setUint16(this.offset, value, false);
        this.offset += 2;
        return this;
      }
      uint32BE(value) {
        this.align(4);
        this.view.setUint32(this.offset, value, false);
        this.offset += 4;
        return this;
      }
      uint64BE(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigUint64(this.offset, value, false);
        this.offset += 8;
        return this;
      }
      float32(value) {
        this.align(4);
        this.view.setFloat32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      float64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setFloat64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      string(value, writeLength = true) {
        const strlen = value.length;
        if (writeLength) {
          this.uint32(strlen + 1);
        }
        this.resizeIfNeeded(strlen + 1);
        this.textEncoder.encodeInto(value, new Uint8Array(this.buffer, this.offset, strlen));
        this.view.setUint8(this.offset + strlen, 0);
        this.offset += strlen + 1;
        return this;
      }
      dHeader(objectSize) {
        const header = objectSize;
        this.uint32(header);
        return this;
      }
      emHeader(mustUnderstand, id, objectSize, lengthCode) {
        return this.isCDR2 ? this.memberHeaderV2(mustUnderstand, id, objectSize, lengthCode) : this.memberHeaderV1(mustUnderstand, id, objectSize);
      }
      memberHeaderV1(mustUnderstand, id, objectSize) {
        this.align(4);
        const mustUnderstandFlag = mustUnderstand ? 1 << 14 : 0;
        const shouldUseExtendedPID = id > 16128 || objectSize > 65535;
        if (!shouldUseExtendedPID) {
          const idHeader = mustUnderstandFlag | id;
          this.uint16(idHeader);
          const objectSizeHeader = objectSize & 65535;
          this.uint16(objectSizeHeader);
        } else {
          const extendedHeader = mustUnderstandFlag | reservedPIDs_1$2.EXTENDED_PID;
          this.uint16(extendedHeader);
          this.uint16(8);
          this.uint32(id);
          this.uint32(objectSize);
        }
        this.resetOrigin();
        return this;
      }
      resetOrigin() {
        this.origin = this.offset;
      }
      sentinelHeader() {
        if (!this.isCDR2) {
          this.align(4);
          this.uint16(reservedPIDs_1$2.SENTINEL_PID);
          this.uint16(0);
        }
        return this;
      }
      memberHeaderV2(mustUnderstand, id, objectSize, lengthCode) {
        if (id > 268435455) {
          throw Error(`Member ID ${id} is too large. Max value is ${268435455}`);
        }
        const mustUnderstandFlag = mustUnderstand ? 1 << 31 : 0;
        const finalLengthCode = lengthCode ?? (0, lengthCodes_1$2.getLengthCodeForObjectSize)(objectSize);
        const header = mustUnderstandFlag | finalLengthCode << 28 | id;
        this.uint32(header);
        switch (finalLengthCode) {
          case 0:
          case 1:
          case 2:
          case 3: {
            const shouldBeSize = lengthCodes_1$2.lengthCodeToObjectSizes[finalLengthCode];
            if (objectSize !== shouldBeSize) {
              throw new Error(`Cannot write a length code ${finalLengthCode} header with an object size not equal to ${shouldBeSize}`);
            }
            break;
          }
          case 4:
          case 5:
            this.uint32(objectSize);
            break;
          case 6:
            if (objectSize % 4 !== 0) {
              throw new Error("Cannot write a length code 6 header with an object size that is not a multiple of 4");
            }
            this.uint32(objectSize >> 2);
            break;
          case 7:
            if (objectSize % 8 !== 0) {
              throw new Error("Cannot write a length code 7 header with an object size that is not a multiple of 8");
            }
            this.uint32(objectSize >> 3);
            break;
          default:
            throw new Error(`Unexpected length code ${finalLengthCode}`);
        }
        return this;
      }
      sequenceLength(value) {
        return this.uint32(value);
      }
      int8Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        this.resizeIfNeeded(value.length);
        this.array.set(value, this.offset);
        this.offset += value.length;
        return this;
      }
      uint8Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        this.resizeIfNeeded(value.length);
        this.array.set(value, this.offset);
        this.offset += value.length;
        return this;
      }
      int16Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Int16Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int16(entry);
          }
        }
        return this;
      }
      uint16Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Uint16Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint16(entry);
          }
        }
        return this;
      }
      int32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Int32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int32(entry);
          }
        }
        return this;
      }
      uint32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Uint32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint32(entry);
          }
        }
        return this;
      }
      int64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof BigInt64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int64(BigInt(entry));
          }
        }
        return this;
      }
      uint64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof BigUint64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint64(BigInt(entry));
          }
        }
        return this;
      }
      float32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Float32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.float32(entry);
          }
        }
        return this;
      }
      float64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Float64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter$2.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.float64(entry);
          }
        }
        return this;
      }
      align(size, bytesToWrite = size) {
        const alignment = (this.offset - this.origin) % size;
        const padding2 = alignment > 0 ? size - alignment : 0;
        this.resizeIfNeeded(padding2 + bytesToWrite);
        this.array.fill(0, this.offset, this.offset + padding2);
        this.offset += padding2;
      }
      resizeIfNeeded(additionalBytes) {
        const capacity = this.offset + additionalBytes;
        if (this.buffer.byteLength < capacity) {
          const doubled = this.buffer.byteLength * 2;
          const newCapacity = doubled > capacity ? doubled : capacity;
          this.resize(newCapacity);
        }
      }
      resize(capacity) {
        if (this.buffer.byteLength >= capacity) {
          return;
        }
        const buffer = new ArrayBuffer(capacity);
        const array = new Uint8Array(buffer);
        array.set(this.array);
        this.buffer = buffer;
        this.array = array;
        this.view = new DataView(buffer);
      }
    }
    CdrWriter$3.CdrWriter = CdrWriter$2;
    CdrWriter$2.DEFAULT_CAPACITY = 16;
    CdrWriter$2.BUFFER_COPY_THRESHOLD = 10;
    (function(exports2) {
      var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      __exportStar(CdrReader$3, exports2);
      __exportStar(CdrSizeCalculator$3, exports2);
      __exportStar(CdrWriter$3, exports2);
      __exportStar(EncapsulationKind$1, exports2);
    })(dist$4);
    Object.defineProperty(MessageReader$4, "__esModule", { value: true });
    MessageReader$4.MessageReader = void 0;
    const cdr_1$3 = dist$4;
    class MessageReader$3 {
      constructor(rootDefinitionName, definitions) {
        const rootDefinition = definitions.find((def) => def.name === rootDefinitionName);
        if (rootDefinition == void 0) {
          throw new Error(`Root definition name "${rootDefinitionName}" not found in schema definitions.`);
        }
        this.rootDefinition = rootDefinition;
        this.definitions = new Map(definitions.map((def) => [def.name ?? "", def]));
      }
      readMessage(buffer) {
        const reader2 = new cdr_1$3.CdrReader(buffer);
        const usesDelimiterHeader = reader2.usesDelimiterHeader;
        const usesMemberHeader = reader2.usesMemberHeader;
        return this.readAggregatedType(this.rootDefinition, reader2, {
          usesDelimiterHeader,
          usesMemberHeader
        });
      }
      readAggregatedType(aggregatedDef, reader2, options, knownTypeSize) {
        const { usesDelimiterHeader, usesMemberHeader } = options;
        const { typeUsesDelimiterHeader, typeUsesMemberHeader } = getHeaderNeeds(aggregatedDef);
        const readDelimiterHeader = usesDelimiterHeader && typeUsesDelimiterHeader;
        const readMemberHeader = usesMemberHeader && typeUsesMemberHeader;
        if (knownTypeSize == void 0 && readDelimiterHeader) {
          reader2.dHeader();
        }
        let msg;
        switch (aggregatedDef.aggregatedKind) {
          case "struct":
            msg = this.readStructType(aggregatedDef, reader2, options);
            break;
          case "union":
            msg = this.readUnionType(aggregatedDef, reader2, options);
            break;
          case "module":
          default:
            throw Error(`Modules are not used in serialization`);
        }
        if (readMemberHeader) {
          reader2.sentinelHeader();
        }
        return msg;
      }
      readStructType(complexDef, reader2, options) {
        const msg = {};
        const { usesMemberHeader } = options;
        const { typeUsesMemberHeader } = getHeaderNeeds(complexDef);
        const readMemberHeader = usesMemberHeader && typeUsesMemberHeader;
        for (const field2 of complexDef.definitions) {
          if (field2.isConstant === true) {
            continue;
          }
          msg[field2.name] = this.readMemberFieldValue(field2, reader2, { readMemberHeader, parentName: complexDef.name }, options);
        }
        return msg;
      }
      readUnionType(unionDef, reader2, options) {
        const { usesMemberHeader } = options;
        const { typeUsesMemberHeader } = getHeaderNeeds(unionDef);
        const readMemberHeader = usesMemberHeader && typeUsesMemberHeader;
        const switchTypeDeser = deserializers$2.get(unionDef.switchType);
        if (switchTypeDeser == void 0) {
          throw new Error(`Unrecognized switch discriminator type ${unionDef.switchType}`);
        }
        if (readMemberHeader) {
          const { objectSize: objectSizeBytes } = reader2.emHeader();
          const switchTypeLength = typeToByteLength(unionDef.switchType);
          if (switchTypeLength != void 0 && objectSizeBytes !== switchTypeLength) {
            throw new Error(`Expected switchType length of ${switchTypeLength} but got ${objectSizeBytes} for ${unionDef.name ?? ""}`);
          }
        }
        const discriminatorValue = switchTypeDeser(reader2);
        const caseDefType = getCaseForDiscriminator(unionDef, discriminatorValue);
        if (!caseDefType) {
          throw new Error(`No matching case found in ${unionDef.name ?? ""} for discriminator value ${discriminatorValue.toString()}`);
        }
        const msg = {};
        msg[caseDefType.name] = this.readMemberFieldValue(caseDefType, reader2, { readMemberHeader, parentName: unionDef.name }, options);
        return msg;
      }
      readMemberFieldValue(field2, reader2, emHeaderOptions, childOptions) {
        const { readMemberHeader, parentName } = emHeaderOptions;
        const definitionId = getDefinitionId(field2);
        let emHeaderSizeBytes;
        if (readMemberHeader) {
          const { id, objectSize: objectSizeBytes, lengthCode } = reader2.emHeader();
          emHeaderSizeBytes = useEmHeaderAsLength(lengthCode) ? objectSizeBytes : void 0;
          if (definitionId != void 0 && id !== definitionId) {
            throw Error(`CDR message deserializer error. Expected ${definitionId} but EMHEADER contained ${id} for field "${field2.name}" in ${parentName ?? "unknown"}`);
          }
        }
        if (field2.isComplex === true) {
          const nestedComplexDef = this.definitions.get(field2.type);
          if (nestedComplexDef == void 0) {
            throw new Error(`Unrecognized complex type ${field2.type}`);
          }
          if (field2.isArray === true) {
            const arrayLengths = field2.arrayLengths ?? [reader2.sequenceLength()];
            const complexDeserializer = () => {
              return this.readAggregatedType(nestedComplexDef, reader2, childOptions, void 0);
            };
            const array = readNestedArray(complexDeserializer, arrayLengths, 0);
            return array;
          } else {
            return this.readAggregatedType(nestedComplexDef, reader2, childOptions, emHeaderSizeBytes);
          }
        } else {
          if (field2.type === "wchar" || field2.type === "wstring") {
            throw new Error(`'wchar' and 'wstring' types are not supported because they are implementation dependent`);
          }
          const typeLength = typeToByteLength(field2.type);
          if (typeLength == void 0) {
            throw new Error(`Unrecognized primitive type ${field2.type}`);
          }
          const headerSpecifiedLength = emHeaderSizeBytes != void 0 ? Math.floor(emHeaderSizeBytes / typeLength) : void 0;
          if (field2.isArray === true) {
            const deser = typedArrayDeserializers$1.get(field2.type);
            if (deser == void 0) {
              throw new Error(`Unrecognized primitive array type ${field2.type}[]`);
            }
            const arrayLengths = field2.arrayLengths ?? (field2.type === "string" ? [reader2.sequenceLength()] : [headerSpecifiedLength ?? reader2.sequenceLength()]);
            if (arrayLengths.length > 1) {
              const typedArrayDeserializer = () => {
                return deser(reader2, arrayLengths[arrayLengths.length - 1]);
              };
              return readNestedArray(typedArrayDeserializer, arrayLengths.slice(0, -1), 0);
            } else {
              return deser(reader2, arrayLengths[0]);
            }
          } else {
            const deser = deserializers$2.get(field2.type);
            if (deser == void 0) {
              throw new Error(`Unrecognized primitive type ${field2.type}`);
            }
            return deser(reader2, headerSpecifiedLength);
          }
        }
      }
    }
    MessageReader$4.MessageReader = MessageReader$3;
    function readNestedArray(deser, arrayLengths, depth) {
      if (depth > arrayLengths.length - 1 || depth < 0) {
        throw Error(`Invalid depth ${depth} for array of length ${arrayLengths.length}`);
      }
      const array = [];
      for (let i = 0; i < arrayLengths[depth]; i++) {
        if (depth === arrayLengths.length - 1) {
          array.push(deser());
        } else {
          array.push(readNestedArray(deser, arrayLengths, depth + 1));
        }
      }
      return array;
    }
    function typeToByteLength(type2) {
      switch (type2) {
        case "bool":
        case "int8":
        case "uint8":
        case "string":
          return 1;
        case "int16":
        case "uint16":
          return 2;
        case "int32":
        case "uint32":
        case "float32":
          return 4;
        case "int64":
        case "uint64":
        case "float64":
          return 8;
        default:
          return void 0;
      }
    }
    const deserializers$2 = /* @__PURE__ */ new Map([
      ["bool", (reader2) => Boolean(reader2.int8())],
      ["int8", (reader2) => reader2.int8()],
      ["uint8", (reader2) => reader2.uint8()],
      ["int16", (reader2) => reader2.int16()],
      ["uint16", (reader2) => reader2.uint16()],
      ["int32", (reader2) => reader2.int32()],
      ["uint32", (reader2) => reader2.uint32()],
      ["int64", (reader2) => reader2.int64()],
      ["uint64", (reader2) => reader2.uint64()],
      ["float32", (reader2) => reader2.float32()],
      ["float64", (reader2) => reader2.float64()],
      ["string", (reader2, length) => reader2.string(length)]
    ]);
    const typedArrayDeserializers$1 = /* @__PURE__ */ new Map([
      ["bool", readBoolArray$1],
      ["int8", (reader2, count) => reader2.int8Array(count)],
      ["uint8", (reader2, count) => reader2.uint8Array(count)],
      ["int16", (reader2, count) => reader2.int16Array(count)],
      ["uint16", (reader2, count) => reader2.uint16Array(count)],
      ["int32", (reader2, count) => reader2.int32Array(count)],
      ["uint32", (reader2, count) => reader2.uint32Array(count)],
      ["int64", (reader2, count) => reader2.int64Array(count)],
      ["uint64", (reader2, count) => reader2.uint64Array(count)],
      ["float32", (reader2, count) => reader2.float32Array(count)],
      ["float64", (reader2, count) => reader2.float64Array(count)],
      ["string", readStringArray$1]
    ]);
    function readBoolArray$1(reader2, count) {
      const array = new Array(count);
      for (let i = 0; i < count; i++) {
        array[i] = Boolean(reader2.int8());
      }
      return array;
    }
    function readStringArray$1(reader2, count) {
      const array = new Array(count);
      for (let i = 0; i < count; i++) {
        array[i] = reader2.string();
      }
      return array;
    }
    function getHeaderNeeds(definition) {
      const { annotations } = definition;
      if (!annotations) {
        return { typeUsesDelimiterHeader: false, typeUsesMemberHeader: false };
      }
      if ("mutable" in annotations) {
        return { typeUsesDelimiterHeader: true, typeUsesMemberHeader: true };
      }
      if ("appendable" in annotations) {
        return { typeUsesDelimiterHeader: true, typeUsesMemberHeader: false };
      }
      return { typeUsesDelimiterHeader: false, typeUsesMemberHeader: false };
    }
    function getDefinitionId(definition) {
      const { annotations } = definition;
      if (!annotations) {
        return void 0;
      }
      if (!("id" in annotations)) {
        return void 0;
      }
      const id = annotations.id;
      if (id != void 0 && id.type === "const-param" && typeof id.value === "number") {
        return id.value;
      }
      return void 0;
    }
    function getCaseForDiscriminator(unionDef, discriminatorValue) {
      for (const caseDef of unionDef.cases) {
        for (const predicate of caseDef.predicates) {
          if (predicate === discriminatorValue) {
            return caseDef.type;
          }
        }
      }
      return unionDef.defaultCase;
    }
    function useEmHeaderAsLength(lengthCode) {
      return lengthCode != void 0 && lengthCode >= 5;
    }
    var MessageWriter$3 = {};
    Object.defineProperty(MessageWriter$3, "__esModule", { value: true });
    MessageWriter$3.MessageWriter = void 0;
    const cdr_1$2 = dist$4;
    const PRIMITIVE_SIZES$1 = /* @__PURE__ */ new Map([
      ["bool", 1],
      ["int8", 1],
      ["uint8", 1],
      ["int16", 2],
      ["uint16", 2],
      ["int32", 4],
      ["uint32", 4],
      ["int64", 8],
      ["uint64", 8],
      ["float32", 4],
      ["float64", 8]
    ]);
    const PRIMITIVE_WRITERS$1 = /* @__PURE__ */ new Map([
      ["bool", bool$1],
      ["int8", int8$1],
      ["uint8", uint8$1],
      ["int16", int16$1],
      ["uint16", uint16$1],
      ["int32", int32$2],
      ["uint32", uint32$1],
      ["int64", int64$1],
      ["uint64", uint64$1],
      ["float32", float32$2],
      ["float64", float64$2],
      ["string", string$1]
    ]);
    const PRIMITIVE_ARRAY_WRITERS$1 = /* @__PURE__ */ new Map([
      ["bool", boolArray$1],
      ["int8", int8Array$1],
      ["uint8", uint8Array$1],
      ["int16", int16Array$1],
      ["uint16", uint16Array$1],
      ["int32", int32Array$1],
      ["uint32", uint32Array$1],
      ["int64", int64Array$1],
      ["uint64", uint64Array$1],
      ["float32", float32Array$1],
      ["float64", float64Array$1],
      ["string", stringArray$1]
    ]);
    class MessageWriter$2 {
      constructor(rootDefinitionName, definitions, cdrOptions) {
        const rootDefinition = definitions.find((def) => def.name === rootDefinitionName);
        if (rootDefinition == void 0) {
          throw new Error(`Root definition name "${rootDefinitionName}" not found in schema definitions.`);
        }
        if (rootDefinition.aggregatedKind === "union") {
          throw new Error(`Unions are not yet supported by MessageWriter`);
        }
        this.rootDefinition = rootDefinition.definitions;
        this.definitions = new Map(definitions.flatMap((def) => def.aggregatedKind !== "union" ? [[def.name ?? "", def.definitions]] : []));
        this.cdrOptions = cdrOptions ?? {};
      }
      calculateByteSize(message2) {
        return this.byteSize(this.rootDefinition, message2, 4);
      }
      writeMessage(message2, output) {
        const writer2 = new cdr_1$2.CdrWriter({
          ...this.cdrOptions,
          buffer: output,
          size: output ? void 0 : this.calculateByteSize(message2)
        });
        this.write(this.rootDefinition, message2, writer2);
        return writer2.data;
      }
      byteSize(definition, message2, offset) {
        const messageObj = message2;
        let newOffset = offset;
        for (const field2 of definition) {
          if (field2.isConstant === true) {
            continue;
          }
          const nestedMessage = messageObj?.[field2.name];
          if (field2.isArray === true) {
            const arrayLength = field2.arrayLengths ? field2.arrayLengths[0] : fieldLength$1(nestedMessage);
            const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
            const dataArray = dataIsArray ? nestedMessage : [];
            if (field2.arrayLengths == void 0) {
              newOffset += padding$1(newOffset, 4);
              newOffset += 4;
            }
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? {};
                newOffset = this.byteSize(nestedDefinition, entry, newOffset);
              }
            } else if (field2.type === "string") {
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? "";
                newOffset += padding$1(newOffset, 4);
                newOffset += 4 + entry.length + 1;
              }
            } else {
              const entrySize = this.getPrimitiveSize(field2.type);
              const alignment = entrySize;
              newOffset += padding$1(newOffset, alignment);
              newOffset += entrySize * arrayLength;
            }
          } else {
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              const entry = nestedMessage ?? {};
              newOffset = this.byteSize(nestedDefinition, entry, newOffset);
            } else if (field2.type === "string") {
              const entry = typeof nestedMessage === "string" ? nestedMessage : "";
              newOffset += padding$1(newOffset, 4);
              newOffset += 4 + entry.length + 1;
            } else {
              const entrySize = this.getPrimitiveSize(field2.type);
              const alignment = entrySize;
              newOffset += padding$1(newOffset, alignment);
              newOffset += entrySize;
            }
          }
        }
        return newOffset;
      }
      write(definition, message2, writer2) {
        const messageObj = message2;
        for (const field2 of definition) {
          if (field2.isConstant === true) {
            continue;
          }
          const nestedMessage = messageObj?.[field2.name];
          if (field2.isArray === true) {
            const arrayLength = field2.arrayLengths ? field2.arrayLengths[0] : fieldLength$1(nestedMessage);
            const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
            const dataArray = dataIsArray ? nestedMessage : [];
            if (field2.arrayLengths == void 0) {
              writer2.sequenceLength(arrayLength);
            }
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? {};
                this.write(nestedDefinition, entry, writer2);
              }
            } else {
              const arrayWriter = this.getPrimitiveArrayWriter(field2.type);
              arrayWriter(nestedMessage, field2.defaultValue, writer2);
            }
          } else {
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              const entry = nestedMessage ?? {};
              this.write(nestedDefinition, entry, writer2);
            } else {
              const primitiveWriter = this.getPrimitiveWriter(field2.type);
              primitiveWriter(nestedMessage, field2.defaultValue, writer2);
            }
          }
        }
      }
      getDefinition(datatype) {
        const nestedDefinition = this.definitions.get(datatype);
        if (nestedDefinition == void 0) {
          throw new Error(`Unrecognized complex type ${datatype}`);
        }
        return nestedDefinition;
      }
      getPrimitiveSize(primitiveType) {
        const size = PRIMITIVE_SIZES$1.get(primitiveType);
        if (size == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}`);
        }
        return size;
      }
      getPrimitiveWriter(primitiveType) {
        const writer2 = PRIMITIVE_WRITERS$1.get(primitiveType);
        if (writer2 == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}`);
        }
        return writer2;
      }
      getPrimitiveArrayWriter(primitiveType) {
        const writer2 = PRIMITIVE_ARRAY_WRITERS$1.get(primitiveType);
        if (writer2 == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}[]`);
        }
        return writer2;
      }
    }
    MessageWriter$3.MessageWriter = MessageWriter$2;
    function fieldLength$1(value) {
      const length = value?.length;
      return typeof length === "number" ? length : 0;
    }
    function bool$1(value, defaultValue, writer2) {
      const boolValue = typeof value === "boolean" ? value : defaultValue ?? false;
      writer2.int8(boolValue ? 1 : 0);
    }
    function int8$1(value, defaultValue, writer2) {
      writer2.int8(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint8$1(value, defaultValue, writer2) {
      writer2.uint8(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int16$1(value, defaultValue, writer2) {
      writer2.int16(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint16$1(value, defaultValue, writer2) {
      writer2.uint16(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int32$2(value, defaultValue, writer2) {
      writer2.int32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint32$1(value, defaultValue, writer2) {
      writer2.uint32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int64$1(value, defaultValue, writer2) {
      if (typeof value === "bigint") {
        writer2.int64(value);
      } else if (typeof value === "number") {
        writer2.int64(BigInt(value));
      } else {
        writer2.int64(defaultValue ?? 0n);
      }
    }
    function uint64$1(value, defaultValue, writer2) {
      if (typeof value === "bigint") {
        writer2.uint64(value);
      } else if (typeof value === "number") {
        writer2.uint64(BigInt(value));
      } else {
        writer2.uint64(defaultValue ?? 0n);
      }
    }
    function float32$2(value, defaultValue, writer2) {
      writer2.float32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function float64$2(value, defaultValue, writer2) {
      writer2.float64(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function string$1(value, defaultValue, writer2) {
      writer2.string(typeof value === "string" ? value : defaultValue ?? "");
    }
    function boolArray$1(value, defaultValue, writer2) {
      if (Array.isArray(value)) {
        const array = new Int8Array(value);
        writer2.int8Array(array);
      } else {
        writer2.int8Array(defaultValue ?? []);
      }
    }
    function int8Array$1(value, defaultValue, writer2) {
      if (value instanceof Int8Array) {
        writer2.int8Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int8Array(value);
        writer2.int8Array(array);
      } else {
        writer2.int8Array(defaultValue ?? []);
      }
    }
    function uint8Array$1(value, defaultValue, writer2) {
      if (value instanceof Uint8Array) {
        writer2.uint8Array(value);
      } else if (value instanceof Uint8ClampedArray) {
        writer2.uint8Array(new Uint8Array(value));
      } else if (Array.isArray(value)) {
        const array = new Uint8Array(value);
        writer2.uint8Array(array);
      } else {
        writer2.uint8Array(defaultValue ?? []);
      }
    }
    function int16Array$1(value, defaultValue, writer2) {
      if (value instanceof Int16Array) {
        writer2.int16Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int16Array(value);
        writer2.int16Array(array);
      } else {
        writer2.int16Array(defaultValue ?? []);
      }
    }
    function uint16Array$1(value, defaultValue, writer2) {
      if (value instanceof Uint16Array) {
        writer2.uint16Array(value);
      } else if (Array.isArray(value)) {
        const array = new Uint16Array(value);
        writer2.uint16Array(array);
      } else {
        writer2.uint16Array(defaultValue ?? []);
      }
    }
    function int32Array$1(value, defaultValue, writer2) {
      if (value instanceof Int32Array) {
        writer2.int32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int32Array(value);
        writer2.int32Array(array);
      } else {
        writer2.int32Array(defaultValue ?? []);
      }
    }
    function uint32Array$1(value, defaultValue, writer2) {
      if (value instanceof Uint32Array) {
        writer2.uint32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Uint32Array(value);
        writer2.uint32Array(array);
      } else {
        writer2.uint32Array(defaultValue ?? []);
      }
    }
    function int64Array$1(value, defaultValue, writer2) {
      if (value instanceof BigInt64Array) {
        writer2.int64Array(value);
      } else if (Array.isArray(value)) {
        const array = new BigInt64Array(value);
        writer2.int64Array(array);
      } else {
        writer2.int64Array(defaultValue ?? []);
      }
    }
    function uint64Array$1(value, defaultValue, writer2) {
      if (value instanceof BigUint64Array) {
        writer2.uint64Array(value);
      } else if (Array.isArray(value)) {
        const array = new BigUint64Array(value);
        writer2.uint64Array(array);
      } else {
        writer2.uint64Array(defaultValue ?? []);
      }
    }
    function float32Array$1(value, defaultValue, writer2) {
      if (value instanceof Float32Array) {
        writer2.float32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Float32Array(value);
        writer2.float32Array(array);
      } else {
        writer2.float32Array(defaultValue ?? []);
      }
    }
    function float64Array$1(value, defaultValue, writer2) {
      if (value instanceof Float64Array) {
        writer2.float64Array(value);
      } else if (Array.isArray(value)) {
        const array = new Float64Array(value);
        writer2.float64Array(array);
      } else {
        writer2.float64Array(defaultValue ?? []);
      }
    }
    function stringArray$1(value, defaultValue, writer2) {
      if (Array.isArray(value)) {
        for (const item of value) {
          writer2.string(typeof item === "string" ? item : "");
        }
      } else {
        const array = defaultValue ?? [];
        for (const item of array) {
          writer2.string(item);
        }
      }
    }
    function padding$1(offset, byteWidth) {
      const alignment = (offset - 4) % byteWidth;
      return alignment > 0 ? byteWidth - alignment : 0;
    }
    (function(exports2) {
      var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      __exportStar(MessageReader$4, exports2);
      __exportStar(MessageWriter$3, exports2);
    })(dist$5);
    var dist$3 = { exports: {} };
    (function(module2) {
      (() => {
        var __webpack_modules__ = {
          27: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = { enumerable: true, get: function() {
                  return m[k];
                } };
              }
              Object.defineProperty(o, k2, desc);
            } : function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function(m, exports3) {
              for (var p in m)
                if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                  __createBinding(exports3, m, p);
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            __exportStar(__webpack_require__2(526), exports2);
          },
          526: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.parseRos2idl = void 0;
            const omgidl_parser_1 = __webpack_require__2(394);
            function parseRos2idl(messageDefinition) {
              const idlConformedDef = messageDefinition.replaceAll(ROS2IDL_HEADER, "");
              const idlMessageDefinitions = (0, omgidl_parser_1.parseIDL)(idlConformedDef);
              const messageDefinitions = idlMessageDefinitions.map(toMessageDefinition);
              for (const def of messageDefinitions) {
                def.name = normalizeName(def.name);
                for (const field2 of def.definitions) {
                  field2.type = normalizeName(field2.type);
                }
                if (def.name === "builtin_interfaces/msg/Time" || def.name === "builtin_interfaces/msg/Duration") {
                  for (const field2 of def.definitions) {
                    if (field2.name === "nanosec") {
                      field2.name = "nsec";
                    }
                  }
                }
              }
              return messageDefinitions;
            }
            exports2.parseRos2idl = parseRos2idl;
            function toMessageDefinition(idlMsgDef) {
              if (idlMsgDef.aggregatedKind === "union") {
                throw new Error(`Unions are not supported in MessageDefinition type`);
              }
              const { definitions, annotations: _a, aggregatedKind: _ak, ...partialDef } = idlMsgDef;
              const fieldDefinitions = definitions.map((def) => {
                const { annotations: _an, arrayLengths, ...partialFieldDef } = def;
                const fieldDef = { ...partialFieldDef };
                if (arrayLengths != void 0) {
                  if (arrayLengths.length > 1) {
                    throw new Error(`Multi-dimensional arrays are not supported in MessageDefinition type`);
                  }
                  const [arrayLength] = arrayLengths;
                  fieldDef.arrayLength = arrayLength;
                }
                return fieldDef;
              });
              return { ...partialDef, definitions: fieldDefinitions };
            }
            const ROS2IDL_HEADER = /={80}\nIDL: [a-zA-Z][\w]+(?:\/[a-zA-Z][\w]+)*/g;
            function toRos2ResourceName(name) {
              return name.replaceAll("::", "/");
            }
            function normalizeName(name) {
              if (name.includes("::")) {
                return toRos2ResourceName(name);
              }
              return name;
            }
          },
          394: (module3) => {
            (() => {
              var __webpack_modules__2 = {
                569: function(module4, exports2) {
                  var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
                  (function(root2, factory2) {
                    {
                      !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory2, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module4.exports = __WEBPACK_AMD_DEFINE_RESULT__));
                    }
                  })(this, function() {
                    var hasOwnProperty2 = Object.prototype.hasOwnProperty;
                    var toString2 = Object.prototype.toString;
                    var hasSticky = typeof new RegExp().sticky === "boolean";
                    function isRegExp(o) {
                      return o && toString2.call(o) === "[object RegExp]";
                    }
                    function isObject2(o) {
                      return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
                    }
                    function reEscape(s) {
                      return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                    }
                    function reGroups(s) {
                      var re = new RegExp("|" + s);
                      return re.exec("").length - 1;
                    }
                    function reCapture(s) {
                      return "(" + s + ")";
                    }
                    function reUnion(regexps) {
                      if (!regexps.length)
                        return "(?!)";
                      var source = regexps.map(function(s) {
                        return "(?:" + s + ")";
                      }).join("|");
                      return "(?:" + source + ")";
                    }
                    function regexpOrLiteral(obj) {
                      if (typeof obj === "string") {
                        return "(?:" + reEscape(obj) + ")";
                      } else if (isRegExp(obj)) {
                        if (obj.ignoreCase)
                          throw new Error("RegExp /i flag not allowed");
                        if (obj.global)
                          throw new Error("RegExp /g flag is implied");
                        if (obj.sticky)
                          throw new Error("RegExp /y flag is implied");
                        if (obj.multiline)
                          throw new Error("RegExp /m flag is implied");
                        return obj.source;
                      } else {
                        throw new Error("Not a pattern: " + obj);
                      }
                    }
                    function pad(s, length) {
                      if (s.length > length) {
                        return s;
                      }
                      return Array(length - s.length + 1).join(" ") + s;
                    }
                    function lastNLines(string2, numLines) {
                      var position = string2.length;
                      var lineBreaks = 0;
                      while (true) {
                        var idx = string2.lastIndexOf("\n", position - 1);
                        if (idx === -1) {
                          break;
                        } else {
                          lineBreaks++;
                        }
                        position = idx;
                        if (lineBreaks === numLines) {
                          break;
                        }
                        if (position === 0) {
                          break;
                        }
                      }
                      var startPosition = lineBreaks < numLines ? 0 : position + 1;
                      return string2.substring(startPosition).split("\n");
                    }
                    function objectToRules(object2) {
                      var keys2 = Object.getOwnPropertyNames(object2);
                      var result = [];
                      for (var i = 0; i < keys2.length; i++) {
                        var key = keys2[i];
                        var thing = object2[key];
                        var rules = [].concat(thing);
                        if (key === "include") {
                          for (var j = 0; j < rules.length; j++) {
                            result.push({ include: rules[j] });
                          }
                          continue;
                        }
                        var match = [];
                        rules.forEach(function(rule) {
                          if (isObject2(rule)) {
                            if (match.length)
                              result.push(ruleOptions(key, match));
                            result.push(ruleOptions(key, rule));
                            match = [];
                          } else {
                            match.push(rule);
                          }
                        });
                        if (match.length)
                          result.push(ruleOptions(key, match));
                      }
                      return result;
                    }
                    function arrayToRules(array) {
                      var result = [];
                      for (var i = 0; i < array.length; i++) {
                        var obj = array[i];
                        if (obj.include) {
                          var include = [].concat(obj.include);
                          for (var j = 0; j < include.length; j++) {
                            result.push({ include: include[j] });
                          }
                          continue;
                        }
                        if (!obj.type) {
                          throw new Error("Rule has no type: " + JSON.stringify(obj));
                        }
                        result.push(ruleOptions(obj.type, obj));
                      }
                      return result;
                    }
                    function ruleOptions(type2, obj) {
                      if (!isObject2(obj)) {
                        obj = { match: obj };
                      }
                      if (obj.include) {
                        throw new Error("Matching rules cannot also include states");
                      }
                      var options = {
                        defaultType: type2,
                        lineBreaks: !!obj.error || !!obj.fallback,
                        pop: false,
                        next: null,
                        push: null,
                        error: false,
                        fallback: false,
                        value: null,
                        type: null,
                        shouldThrow: false
                      };
                      for (var key in obj) {
                        if (hasOwnProperty2.call(obj, key)) {
                          options[key] = obj[key];
                        }
                      }
                      if (typeof options.type === "string" && type2 !== options.type) {
                        throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type2 + "')");
                      }
                      var match = options.match;
                      options.match = Array.isArray(match) ? match : match ? [match] : [];
                      options.match.sort(function(a, b) {
                        return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
                      });
                      return options;
                    }
                    function toRules(spec) {
                      return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
                    }
                    var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
                    function compileRules(rules, hasStates) {
                      var errorRule = null;
                      var fast = /* @__PURE__ */ Object.create(null);
                      var fastAllowed = true;
                      var unicodeFlag = null;
                      var groups = [];
                      var parts = [];
                      for (var i = 0; i < rules.length; i++) {
                        if (rules[i].fallback) {
                          fastAllowed = false;
                        }
                      }
                      for (var i = 0; i < rules.length; i++) {
                        var options = rules[i];
                        if (options.include) {
                          throw new Error("Inheritance is not allowed in stateless lexers");
                        }
                        if (options.error || options.fallback) {
                          if (errorRule) {
                            if (!options.fallback === !errorRule.fallback) {
                              throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
                            } else {
                              throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
                            }
                          }
                          errorRule = options;
                        }
                        var match = options.match.slice();
                        if (fastAllowed) {
                          while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                            var word = match.shift();
                            fast[word.charCodeAt(0)] = options;
                          }
                        }
                        if (options.pop || options.push || options.next) {
                          if (!hasStates) {
                            throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
                          }
                          if (options.fallback) {
                            throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
                          }
                        }
                        if (match.length === 0) {
                          continue;
                        }
                        fastAllowed = false;
                        groups.push(options);
                        for (var j = 0; j < match.length; j++) {
                          var obj = match[j];
                          if (!isRegExp(obj)) {
                            continue;
                          }
                          if (unicodeFlag === null) {
                            unicodeFlag = obj.unicode;
                          } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                            throw new Error("If one rule is /u then all must be");
                          }
                        }
                        var pat = reUnion(match.map(regexpOrLiteral));
                        var regexp = new RegExp(pat);
                        if (regexp.test("")) {
                          throw new Error("RegExp matches empty string: " + regexp);
                        }
                        var groupCount = reGroups(pat);
                        if (groupCount > 0) {
                          throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
                        }
                        if (!options.lineBreaks && regexp.test("\n")) {
                          throw new Error("Rule should declare lineBreaks: " + regexp);
                        }
                        parts.push(reCapture(pat));
                      }
                      var fallbackRule = errorRule && errorRule.fallback;
                      var flags = hasSticky && !fallbackRule ? "ym" : "gm";
                      var suffix = hasSticky || fallbackRule ? "" : "|";
                      if (unicodeFlag === true)
                        flags += "u";
                      var combined = new RegExp(reUnion(parts) + suffix, flags);
                      return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
                    }
                    function compile(rules) {
                      var result = compileRules(toRules(rules));
                      return new Lexer({ start: result }, "start");
                    }
                    function checkStateGroup(g, name, map) {
                      var state = g && (g.push || g.next);
                      if (state && !map[state]) {
                        throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
                      }
                      if (g && g.pop && +g.pop !== 1) {
                        throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
                      }
                    }
                    function compileStates(states, start) {
                      var all = states.$all ? toRules(states.$all) : [];
                      delete states.$all;
                      var keys2 = Object.getOwnPropertyNames(states);
                      if (!start)
                        start = keys2[0];
                      var ruleMap = /* @__PURE__ */ Object.create(null);
                      for (var i = 0; i < keys2.length; i++) {
                        var key = keys2[i];
                        ruleMap[key] = toRules(states[key]).concat(all);
                      }
                      for (var i = 0; i < keys2.length; i++) {
                        var key = keys2[i];
                        var rules = ruleMap[key];
                        var included = /* @__PURE__ */ Object.create(null);
                        for (var j = 0; j < rules.length; j++) {
                          var rule = rules[j];
                          if (!rule.include)
                            continue;
                          var splice2 = [j, 1];
                          if (rule.include !== key && !included[rule.include]) {
                            included[rule.include] = true;
                            var newRules = ruleMap[rule.include];
                            if (!newRules) {
                              throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
                            }
                            for (var k = 0; k < newRules.length; k++) {
                              var newRule = newRules[k];
                              if (rules.indexOf(newRule) !== -1)
                                continue;
                              splice2.push(newRule);
                            }
                          }
                          rules.splice.apply(rules, splice2);
                          j--;
                        }
                      }
                      var map = /* @__PURE__ */ Object.create(null);
                      for (var i = 0; i < keys2.length; i++) {
                        var key = keys2[i];
                        map[key] = compileRules(ruleMap[key], true);
                      }
                      for (var i = 0; i < keys2.length; i++) {
                        var name = keys2[i];
                        var state = map[name];
                        var groups = state.groups;
                        for (var j = 0; j < groups.length; j++) {
                          checkStateGroup(groups[j], name, map);
                        }
                        var fastKeys = Object.getOwnPropertyNames(state.fast);
                        for (var j = 0; j < fastKeys.length; j++) {
                          checkStateGroup(state.fast[fastKeys[j]], name, map);
                        }
                      }
                      return new Lexer(map, start);
                    }
                    function keywordTransform(map) {
                      var isMap = typeof Map !== "undefined";
                      var reverseMap = isMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
                      var types2 = Object.getOwnPropertyNames(map);
                      for (var i = 0; i < types2.length; i++) {
                        var tokenType = types2[i];
                        var item = map[tokenType];
                        var keywordList = Array.isArray(item) ? item : [item];
                        keywordList.forEach(function(keyword) {
                          if (typeof keyword !== "string") {
                            throw new Error("keyword must be string (in keyword '" + tokenType + "')");
                          }
                          if (isMap) {
                            reverseMap.set(keyword, tokenType);
                          } else {
                            reverseMap[keyword] = tokenType;
                          }
                        });
                      }
                      return function(k) {
                        return isMap ? reverseMap.get(k) : reverseMap[k];
                      };
                    }
                    var Lexer = function(states, state) {
                      this.startState = state;
                      this.states = states;
                      this.buffer = "";
                      this.stack = [];
                      this.reset();
                    };
                    Lexer.prototype.reset = function(data, info) {
                      this.buffer = data || "";
                      this.index = 0;
                      this.line = info ? info.line : 1;
                      this.col = info ? info.col : 1;
                      this.queuedToken = info ? info.queuedToken : null;
                      this.queuedText = info ? info.queuedText : "";
                      this.queuedThrow = info ? info.queuedThrow : null;
                      this.setState(info ? info.state : this.startState);
                      this.stack = info && info.stack ? info.stack.slice() : [];
                      return this;
                    };
                    Lexer.prototype.save = function() {
                      return {
                        line: this.line,
                        col: this.col,
                        state: this.state,
                        stack: this.stack.slice(),
                        queuedToken: this.queuedToken,
                        queuedText: this.queuedText,
                        queuedThrow: this.queuedThrow
                      };
                    };
                    Lexer.prototype.setState = function(state) {
                      if (!state || this.state === state)
                        return;
                      this.state = state;
                      var info = this.states[state];
                      this.groups = info.groups;
                      this.error = info.error;
                      this.re = info.regexp;
                      this.fast = info.fast;
                    };
                    Lexer.prototype.popState = function() {
                      this.setState(this.stack.pop());
                    };
                    Lexer.prototype.pushState = function(state) {
                      this.stack.push(this.state);
                      this.setState(state);
                    };
                    var eat = hasSticky ? function(re, buffer) {
                      return re.exec(buffer);
                    } : function(re, buffer) {
                      var match = re.exec(buffer);
                      if (match[0].length === 0) {
                        return null;
                      }
                      return match;
                    };
                    Lexer.prototype._getGroup = function(match) {
                      var groupCount = this.groups.length;
                      for (var i = 0; i < groupCount; i++) {
                        if (match[i + 1] !== void 0) {
                          return this.groups[i];
                        }
                      }
                      throw new Error("Cannot find token type for matched text");
                    };
                    function tokenToString() {
                      return this.value;
                    }
                    Lexer.prototype.next = function() {
                      var index = this.index;
                      if (this.queuedGroup) {
                        var token = this._token(this.queuedGroup, this.queuedText, index);
                        this.queuedGroup = null;
                        this.queuedText = "";
                        return token;
                      }
                      var buffer = this.buffer;
                      if (index === buffer.length) {
                        return;
                      }
                      var group = this.fast[buffer.charCodeAt(index)];
                      if (group) {
                        return this._token(group, buffer.charAt(index), index);
                      }
                      var re = this.re;
                      re.lastIndex = index;
                      var match = eat(re, buffer);
                      var error = this.error;
                      if (match == null) {
                        return this._token(error, buffer.slice(index, buffer.length), index);
                      }
                      var group = this._getGroup(match);
                      var text = match[0];
                      if (error.fallback && match.index !== index) {
                        this.queuedGroup = group;
                        this.queuedText = text;
                        return this._token(error, buffer.slice(index, match.index), index);
                      }
                      return this._token(group, text, index);
                    };
                    Lexer.prototype._token = function(group, text, offset) {
                      var lineBreaks = 0;
                      if (group.lineBreaks) {
                        var matchNL = /\n/g;
                        var nl = 1;
                        if (text === "\n") {
                          lineBreaks = 1;
                        } else {
                          while (matchNL.exec(text)) {
                            lineBreaks++;
                            nl = matchNL.lastIndex;
                          }
                        }
                      }
                      var token = {
                        type: typeof group.type === "function" && group.type(text) || group.defaultType,
                        value: typeof group.value === "function" ? group.value(text) : text,
                        text,
                        toString: tokenToString,
                        offset,
                        lineBreaks,
                        line: this.line,
                        col: this.col
                      };
                      var size = text.length;
                      this.index += size;
                      this.line += lineBreaks;
                      if (lineBreaks !== 0) {
                        this.col = size - nl + 1;
                      } else {
                        this.col += size;
                      }
                      if (group.shouldThrow) {
                        var err = new Error(this.formatError(token, "invalid syntax"));
                        throw err;
                      }
                      if (group.pop)
                        this.popState();
                      else if (group.push)
                        this.pushState(group.push);
                      else if (group.next)
                        this.setState(group.next);
                      return token;
                    };
                    if (typeof Symbol !== "undefined" && Symbol.iterator) {
                      var LexerIterator = function(lexer) {
                        this.lexer = lexer;
                      };
                      LexerIterator.prototype.next = function() {
                        var token = this.lexer.next();
                        return { value: token, done: !token };
                      };
                      LexerIterator.prototype[Symbol.iterator] = function() {
                        return this;
                      };
                      Lexer.prototype[Symbol.iterator] = function() {
                        return new LexerIterator(this);
                      };
                    }
                    Lexer.prototype.formatError = function(token, message2) {
                      if (token == null) {
                        var text = this.buffer.slice(this.index);
                        var token = {
                          text,
                          offset: this.index,
                          lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
                          line: this.line,
                          col: this.col
                        };
                      }
                      var numLinesAround = 2;
                      var firstDisplayedLine = Math.max(token.line - numLinesAround, 1);
                      var lastDisplayedLine = token.line + numLinesAround;
                      var lastLineDigits = String(lastDisplayedLine).length;
                      var displayedLines = lastNLines(
                        this.buffer,
                        this.line - token.line + numLinesAround + 1
                      ).slice(0, 5);
                      var errorLines = [];
                      errorLines.push(message2 + " at line " + token.line + " col " + token.col + ":");
                      errorLines.push("");
                      for (var i = 0; i < displayedLines.length; i++) {
                        var line = displayedLines[i];
                        var lineNo = firstDisplayedLine + i;
                        errorLines.push(pad(String(lineNo), lastLineDigits) + "  " + line);
                        if (lineNo === token.line) {
                          errorLines.push(pad("", lastLineDigits + token.col + 1) + "^");
                        }
                      }
                      return errorLines.join("\n");
                    };
                    Lexer.prototype.clone = function() {
                      return new Lexer(this.states, this.state);
                    };
                    Lexer.prototype.has = function(tokenType) {
                      return true;
                    };
                    return {
                      compile,
                      states: compileStates,
                      error: Object.freeze({ error: true }),
                      fallback: Object.freeze({ fallback: true }),
                      keywords: keywordTransform
                    };
                  });
                },
                461: (module4, __unused_webpack_exports, __nested_webpack_require_19084__) => {
                  (function() {
                    function id(x) {
                      return x[0];
                    }
                    const keywords = [
                      ,
                      "struct",
                      "module",
                      "enum",
                      "const",
                      "include",
                      "typedef",
                      "union",
                      "switch",
                      "case",
                      "boolean",
                      "wstring",
                      "string",
                      "sequence",
                      "TRUE",
                      "FALSE",
                      "byte",
                      "octet",
                      "wchar",
                      "char",
                      "double",
                      "float",
                      "int8",
                      "uint8",
                      "int16",
                      "uint16",
                      "int32",
                      "uint32",
                      "int64",
                      "uint64",
                      "unsigned",
                      "short",
                      "long"
                    ];
                    const kwObject = keywords.reduce((obj, w) => {
                      obj[w] = w;
                      return obj;
                    }, {});
                    const moo = __nested_webpack_require_19084__(569);
                    const lexer = moo.compile({
                      SPACE: { match: /\s+/, lineBreaks: true },
                      DECIMALEXP: /(?:(?:\d+\.\d*)|(?:\d*\.\d+)|(?:[0-9]+))[eE](?:[+|-])?[0-9]+/,
                      DECIMAL: /(?:(?:\d+\.\d*)|(?:\d*\.\d+))/,
                      INTEGER: /\d+/,
                      COMMENT: /(?:\/\/[^\n]*)|(?:\/\*(?:.|\n)+?\*\/)/,
                      HEX_LITERAL: /0x(?:[0-9a-fA-F])+?/,
                      STRING: { match: /"(?:\\["\\rnu]|[^"\\])*"/, value: (x) => x.slice(1, -1) },
                      LCBR: "{",
                      RCBR: "}",
                      LBR: "[",
                      RBR: "]",
                      LT: "<",
                      GT: ">",
                      LPAR: "(",
                      RPAR: ")",
                      ":": ":",
                      ";": ";",
                      ",": ",",
                      AT: "@",
                      PND: "#",
                      PT: ".",
                      "/": "/",
                      SIGN: /[+-]/,
                      EQ: /=[^\n]*?/,
                      NAME: { match: /[a-zA-Z_][a-zA-Z0-9_]*(?:\:\:[a-zA-Z][a-zA-Z0-9_]*)*/, type: moo.keywords(kwObject) }
                    });
                    const tokensToIgnore = ["SPACE", "COMMENT"];
                    lexer.next = ((next) => () => {
                      let token;
                      while ((token = next.call(lexer)) && tokensToIgnore.includes(token.type)) {
                      }
                      return token;
                    })(lexer.next);
                    function join(d) {
                      return d.join("");
                    }
                    function extend(objs) {
                      return objs.filter(Boolean).reduce((r, p) => ({ ...r, ...p }), {});
                    }
                    function noop2() {
                      return null;
                    }
                    function getIntOrConstantValue(d) {
                      const int = parseInt(d);
                      if (!isNaN(int)) {
                        return int;
                      }
                      return d?.value ? { usesConstant: true, name: d.value } : void 0;
                    }
                    var grammar = {
                      Lexer: lexer,
                      ParserRules: [
                        { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": [] },
                        { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1$ebnf$1", "importDcl"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "main$ebnf$1$subexpression$1", "symbols": ["main$ebnf$1$subexpression$1$ebnf$1", "definition"] },
                        { "name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"] },
                        { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": [] },
                        { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": ["main$ebnf$1$subexpression$2$ebnf$1", "importDcl"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "main$ebnf$1$subexpression$2", "symbols": ["main$ebnf$1$subexpression$2$ebnf$1", "definition"] },
                        { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        {
                          "name": "main",
                          "symbols": ["main$ebnf$1"],
                          "postprocess": (d) => {
                            return d[0].flatMap((inner) => inner[1]);
                          }
                        },
                        { "name": "importDcl$subexpression$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
                        { "name": "importDcl$subexpression$1$ebnf$1", "symbols": [] },
                        { "name": "importDcl$subexpression$1$ebnf$1$subexpression$1", "symbols": [{ "literal": "/" }, lexer.has("NAME") ? { type: "NAME" } : NAME] },
                        { "name": "importDcl$subexpression$1$ebnf$1", "symbols": ["importDcl$subexpression$1$ebnf$1", "importDcl$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "importDcl$subexpression$1", "symbols": [{ "literal": "<" }, lexer.has("NAME") ? { type: "NAME" } : NAME, "importDcl$subexpression$1$ebnf$1", { "literal": "." }, { "literal": "idl" }, { "literal": ">" }] },
                        { "name": "importDcl", "symbols": [{ "literal": "#" }, { "literal": "include" }, "importDcl$subexpression$1"], "postprocess": noop2 },
                        { "name": "moduleDcl$ebnf$1$subexpression$1", "symbols": ["definition"] },
                        { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1$subexpression$1"] },
                        { "name": "moduleDcl$ebnf$1$subexpression$2", "symbols": ["definition"] },
                        { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1", "moduleDcl$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        {
                          "name": "moduleDcl",
                          "symbols": [{ "literal": "module" }, "fieldName", { "literal": "{" }, "moduleDcl$ebnf$1", { "literal": "}" }],
                          "postprocess": function processModule(d) {
                            const moduleName2 = d[1].name;
                            const defs = d[3];
                            return {
                              declarator: "module",
                              name: moduleName2,
                              definitions: defs.flat(1)
                            };
                          }
                        },
                        { "name": "definition$subexpression$1", "symbols": ["typeDcl"] },
                        { "name": "definition$subexpression$1", "symbols": ["constantDcl"] },
                        { "name": "definition$subexpression$1", "symbols": ["moduleDcl"] },
                        { "name": "definition$subexpression$1", "symbols": ["union"] },
                        { "name": "definition", "symbols": ["multiAnnotations", "definition$subexpression$1", "semi"], "postprocess": (d) => {
                          const annotations = d[0];
                          const declaration = d[1][0];
                          return extend([annotations, declaration]);
                        } },
                        { "name": "typeDcl$subexpression$1", "symbols": ["struct"] },
                        { "name": "typeDcl$subexpression$1", "symbols": ["typedef"] },
                        { "name": "typeDcl$subexpression$1", "symbols": ["enum"] },
                        { "name": "typeDcl", "symbols": ["typeDcl$subexpression$1"], "postprocess": (d) => d[0][0] },
                        {
                          "name": "union",
                          "symbols": [{ "literal": "union" }, "fieldName", { "literal": "switch" }, { "literal": "(" }, "switchTypedef", { "literal": ")" }, { "literal": "{" }, "switchBody", { "literal": "}" }],
                          "postprocess": (d) => {
                            const name = d[1].name;
                            const switchType = d[4].type;
                            const switchBody = d[7];
                            const allCases = switchBody;
                            const defaultCase = allCases.find((c) => "default" in c);
                            const cases = allCases.filter((c) => "predicates" in c);
                            const unionNode = {
                              declarator: "union",
                              name,
                              switchType,
                              cases
                            };
                            if (defaultCase) {
                              unionNode.defaultCase = defaultCase.default;
                            }
                            return unionNode;
                          }
                        },
                        { "name": "switchTypedef$subexpression$1", "symbols": ["customType"] },
                        { "name": "switchTypedef$subexpression$1", "symbols": ["numericType"] },
                        { "name": "switchTypedef$subexpression$1", "symbols": ["booleanType"] },
                        { "name": "switchTypedef", "symbols": ["switchTypedef$subexpression$1"], "postprocess": (d) => d[0][0] },
                        { "name": "switchBody$ebnf$1", "symbols": ["case"] },
                        { "name": "switchBody$ebnf$1", "symbols": ["switchBody$ebnf$1", "case"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "switchBody", "symbols": ["switchBody$ebnf$1"], "postprocess": (d) => d.flat(2) },
                        { "name": "case$ebnf$1", "symbols": ["caseLabel"] },
                        { "name": "case$ebnf$1", "symbols": ["case$ebnf$1", "caseLabel"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "case", "symbols": ["case$ebnf$1", "elementSpec", { "literal": ";" }], "postprocess": (d) => {
                          const cases = d[0];
                          const type2 = d[1];
                          const nonDefaultCases = cases.filter((casePredicate) => casePredicate !== "default");
                          const isDefault = cases.length !== nonDefaultCases.length;
                          const caseArray = [];
                          if (isDefault) {
                            caseArray.push({ default: type2 });
                          }
                          if (nonDefaultCases.length > 0) {
                            caseArray.push({
                              predicates: nonDefaultCases,
                              type: type2
                            });
                          }
                          return caseArray;
                        } },
                        { "name": "caseLabel$subexpression$1", "symbols": [{ "literal": "case" }, "constExpression", { "literal": ":" }] },
                        { "name": "caseLabel", "symbols": ["caseLabel$subexpression$1"], "postprocess": (d) => d[0][1] },
                        { "name": "caseLabel$subexpression$2", "symbols": [{ "literal": "default" }, { "literal": ":" }] },
                        { "name": "caseLabel", "symbols": ["caseLabel$subexpression$2"], "postprocess": () => "default" },
                        { "name": "elementSpec", "symbols": ["typeDeclarator"], "postprocess": (d) => d[0] },
                        { "name": "enum$ebnf$1", "symbols": [] },
                        { "name": "enum$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "enumFieldName"] },
                        { "name": "enum$ebnf$1", "symbols": ["enum$ebnf$1", "enum$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "enum", "symbols": [{ "literal": "enum" }, "fieldName", { "literal": "{" }, "enumFieldName", "enum$ebnf$1", { "literal": "}" }], "postprocess": (d) => {
                          const name = d[1].name;
                          const firstMember = d[3];
                          const members = d[4].flat(2).filter((item) => Boolean(item) && item.type !== ",");
                          return {
                            declarator: "enum",
                            name,
                            enumerators: [firstMember, ...members]
                          };
                        } },
                        { "name": "enumFieldName", "symbols": ["multiAnnotations", "fieldName"], "postprocess": (d) => {
                          const annotations = d[0];
                          const name = d[1];
                          return extend([annotations, name]);
                        } },
                        { "name": "struct$ebnf$1$subexpression$1", "symbols": ["member"] },
                        { "name": "struct$ebnf$1", "symbols": ["struct$ebnf$1$subexpression$1"] },
                        { "name": "struct$ebnf$1$subexpression$2", "symbols": ["member"] },
                        { "name": "struct$ebnf$1", "symbols": ["struct$ebnf$1", "struct$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "struct", "symbols": [{ "literal": "struct" }, "fieldName", { "literal": "{" }, "struct$ebnf$1", { "literal": "}" }], "postprocess": (d) => {
                          const name = d[1].name;
                          const definitions = d[3].flat(2).filter((def) => def !== null);
                          return {
                            declarator: "struct",
                            name,
                            definitions
                          };
                        } },
                        { "name": "typedef", "symbols": [{ "literal": "typedef" }, "typeDeclarator"], "postprocess": ([_, definition]) => ({ declarator: "typedef", ...definition }) },
                        { "name": "typeDeclarator$subexpression$1", "symbols": ["allTypes", "fieldName", "arrayLengths"] },
                        { "name": "typeDeclarator$subexpression$1", "symbols": ["allTypes", "fieldName"] },
                        { "name": "typeDeclarator$subexpression$1", "symbols": ["sequenceType", "fieldName"] },
                        { "name": "typeDeclarator", "symbols": ["typeDeclarator$subexpression$1"], "postprocess": (d) => extend(d[0]) },
                        { "name": "constantDcl", "symbols": ["constType"], "postprocess": (d) => d[0] },
                        { "name": "member", "symbols": ["fieldWithAnnotation", "semi"], "postprocess": (d) => d[0] },
                        { "name": "fieldWithAnnotation", "symbols": ["multiAnnotations", "fieldDcl"], "postprocess": (d) => {
                          const annotations = d[0];
                          const fields = d[1];
                          const finalDefs = fields.map(
                            (def) => extend([annotations, def])
                          );
                          return finalDefs;
                        } },
                        { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames", "arrayLengths"] },
                        { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames"] },
                        { "name": "fieldDcl$subexpression$1", "symbols": ["sequenceType", "multiFieldNames"] },
                        { "name": "fieldDcl", "symbols": ["fieldDcl$subexpression$1"], "postprocess": (d) => {
                          const names = d[0].splice(1, 1)[0];
                          const defs = names.map((nameObj) => ({
                            ...extend([...d[0], nameObj]),
                            declarator: "struct-member"
                          }));
                          return defs;
                        } },
                        { "name": "multiFieldNames$ebnf$1", "symbols": [] },
                        { "name": "multiFieldNames$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "fieldName"] },
                        { "name": "multiFieldNames$ebnf$1", "symbols": ["multiFieldNames$ebnf$1", "multiFieldNames$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "multiFieldNames", "symbols": ["fieldName", "multiFieldNames$ebnf$1"], "postprocess": (d) => {
                          const fieldNames = d.flat(2).filter((d2) => d2 !== null && d2.name);
                          return fieldNames;
                        } },
                        { "name": "multiAnnotations$ebnf$1", "symbols": [] },
                        { "name": "multiAnnotations$ebnf$1", "symbols": ["multiAnnotations$ebnf$1", "annotation"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        {
                          "name": "multiAnnotations",
                          "symbols": ["multiAnnotations$ebnf$1"],
                          "postprocess": (d) => {
                            return d[0].length > 0 ? { annotations: d[0].reduce((record, annotation) => {
                              record[annotation.name] = annotation;
                              return record;
                            }, {}) } : null;
                          }
                        },
                        { "name": "annotation$ebnf$1$subexpression$1", "symbols": [{ "literal": "(" }, "annotationParams", { "literal": ")" }] },
                        { "name": "annotation$ebnf$1", "symbols": ["annotation$ebnf$1$subexpression$1"], "postprocess": id },
                        { "name": "annotation$ebnf$1", "symbols": [], "postprocess": function(d) {
                          return null;
                        } },
                        { "name": "annotation", "symbols": ["at", lexer.has("NAME") ? { type: "NAME" } : NAME, "annotation$ebnf$1"], "postprocess": (d) => {
                          const annotationName = d[1].value;
                          const params = d[2] ? d[2][1] : void 0;
                          if (params == void 0) {
                            return { type: "no-params", name: annotationName };
                          }
                          if (Array.isArray(params)) {
                            const namedParamsRecord = extend(params);
                            return {
                              type: "named-params",
                              name: annotationName,
                              namedParams: namedParamsRecord
                            };
                          }
                          return { type: "const-param", value: params, name: annotationName };
                        } },
                        { "name": "annotationParams$subexpression$1", "symbols": ["multipleNamedAnnotationParams"] },
                        { "name": "annotationParams$subexpression$1", "symbols": ["constExpression"] },
                        { "name": "annotationParams", "symbols": ["annotationParams$subexpression$1"], "postprocess": (d) => d[0][0] },
                        { "name": "multipleNamedAnnotationParams$ebnf$1", "symbols": [] },
                        { "name": "multipleNamedAnnotationParams$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "namedAnnotationParam"] },
                        { "name": "multipleNamedAnnotationParams$ebnf$1", "symbols": ["multipleNamedAnnotationParams$ebnf$1", "multipleNamedAnnotationParams$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        {
                          "name": "multipleNamedAnnotationParams",
                          "symbols": ["namedAnnotationParam", "multipleNamedAnnotationParams$ebnf$1"],
                          "postprocess": (d) => [d[0], ...d[1].flatMap(([, param]) => param)]
                        },
                        {
                          "name": "constExpression",
                          "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME],
                          "postprocess": (d) => ({ usesConstant: true, name: d[0].value })
                        },
                        { "name": "constExpression", "symbols": ["literal"], "postprocess": (d) => d[0].value },
                        { "name": "namedAnnotationParam$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME, "assignment"] },
                        { "name": "namedAnnotationParam", "symbols": ["namedAnnotationParam$subexpression$1"], "postprocess": (d) => ({ [d[0][0].value]: d[0][1].value }) },
                        { "name": "at", "symbols": [{ "literal": "@" }], "postprocess": noop2 },
                        { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "floatAssignment", "simple"] },
                        { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "intAssignment", "simple"] },
                        { "name": "constType$subexpression$1", "symbols": ["constKeyword", "stringType", "fieldName", "stringAssignment", "simple"] },
                        { "name": "constType$subexpression$1", "symbols": ["constKeyword", "booleanType", "fieldName", "booleanAssignment", "simple"] },
                        { "name": "constType$subexpression$1", "symbols": ["constKeyword", "customType", "fieldName", "variableAssignment", "simple"] },
                        { "name": "constType", "symbols": ["constType$subexpression$1"], "postprocess": (d) => {
                          return extend(d[0]);
                        } },
                        { "name": "constKeyword", "symbols": [{ "literal": "const" }], "postprocess": (d) => ({ isConstant: true, declarator: "const" }) },
                        { "name": "fieldName", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": (d) => ({ name: d[0].value }) },
                        { "name": "sequenceType$ebnf$1$subexpression$1$subexpression$1", "symbols": ["INT"] },
                        { "name": "sequenceType$ebnf$1$subexpression$1$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                        { "name": "sequenceType$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "sequenceType$ebnf$1$subexpression$1$subexpression$1"] },
                        { "name": "sequenceType$ebnf$1", "symbols": ["sequenceType$ebnf$1$subexpression$1"], "postprocess": id },
                        { "name": "sequenceType$ebnf$1", "symbols": [], "postprocess": function(d) {
                          return null;
                        } },
                        { "name": "sequenceType", "symbols": [{ "literal": "sequence" }, { "literal": "<" }, "allTypes", "sequenceType$ebnf$1", { "literal": ">" }], "postprocess": (d) => {
                          const arrayUpperBound = d[3] !== null ? getIntOrConstantValue(d[3][1][0]) : void 0;
                          const typeObj = d[2];
                          return {
                            ...typeObj,
                            isArray: true,
                            arrayUpperBound
                          };
                        } },
                        { "name": "arrayLengths$ebnf$1", "symbols": ["arrayLength"] },
                        { "name": "arrayLengths$ebnf$1", "symbols": ["arrayLengths$ebnf$1", "arrayLength"], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        {
                          "name": "arrayLengths",
                          "symbols": ["arrayLengths$ebnf$1"],
                          "postprocess": (d) => {
                            const arrInfo = { isArray: true };
                            const arrLengthList = d.flat(2).filter((num) => num != void 0);
                            arrInfo.arrayLengths = arrLengthList;
                            return arrInfo;
                          }
                        },
                        { "name": "arrayLength$subexpression$1", "symbols": ["INT"] },
                        { "name": "arrayLength$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                        {
                          "name": "arrayLength",
                          "symbols": [{ "literal": "[" }, "arrayLength$subexpression$1", { "literal": "]" }],
                          "postprocess": ([, intOrName]) => getIntOrConstantValue(intOrName ? intOrName[0] : void 0)
                        },
                        { "name": "assignment$subexpression$1", "symbols": ["floatAssignment"] },
                        { "name": "assignment$subexpression$1", "symbols": ["intAssignment"] },
                        { "name": "assignment$subexpression$1", "symbols": ["stringAssignment"] },
                        { "name": "assignment$subexpression$1", "symbols": ["booleanAssignment"] },
                        { "name": "assignment$subexpression$1", "symbols": ["variableAssignment"] },
                        { "name": "assignment", "symbols": ["assignment$subexpression$1"], "postprocess": (d) => d[0][0] },
                        { "name": "floatAssignment$subexpression$1", "symbols": ["SIGNED_FLOAT"] },
                        { "name": "floatAssignment$subexpression$1", "symbols": ["FLOAT"] },
                        { "name": "floatAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "floatAssignment$subexpression$1"], "postprocess": ([, num]) => ({ valueText: num[0], value: parseFloat(num[0]) }) },
                        { "name": "intAssignment$subexpression$1", "symbols": ["SIGNED_INT"] },
                        { "name": "intAssignment$subexpression$1", "symbols": ["INT"] },
                        { "name": "intAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "intAssignment$subexpression$1"], "postprocess": ([, num]) => ({ valueText: num[0], value: parseInt(num[0]) }) },
                        { "name": "stringAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "STR"], "postprocess": ([, str]) => ({ valueText: str, value: str }) },
                        { "name": "booleanAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "BOOLEAN"], "postprocess": ([, bool2]) => ({ valueText: bool2, value: bool2 === "TRUE" }) },
                        {
                          "name": "variableAssignment",
                          "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, lexer.has("NAME") ? { type: "NAME" } : NAME],
                          "postprocess": ([, name]) => ({
                            valueText: name.value,
                            value: {
                              usesConstant: true,
                              name: name.value
                            }
                          })
                        },
                        { "name": "allTypes$subexpression$1", "symbols": ["primitiveTypes"] },
                        { "name": "allTypes$subexpression$1", "symbols": ["customType"] },
                        { "name": "allTypes", "symbols": ["allTypes$subexpression$1"], "postprocess": (d) => d[0][0] },
                        { "name": "primitiveTypes$subexpression$1", "symbols": ["stringType"] },
                        { "name": "primitiveTypes$subexpression$1", "symbols": ["numericType"] },
                        { "name": "primitiveTypes$subexpression$1", "symbols": ["booleanType"] },
                        { "name": "primitiveTypes", "symbols": ["primitiveTypes$subexpression$1"], "postprocess": (d) => ({ ...d[0][0], isComplex: false }) },
                        { "name": "customType", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": (d) => {
                          const typeName = d[0].value;
                          return { type: typeName };
                        } },
                        { "name": "stringType$subexpression$1", "symbols": [{ "literal": "string" }] },
                        { "name": "stringType$subexpression$1", "symbols": [{ "literal": "wstring" }] },
                        { "name": "stringType$ebnf$1$subexpression$1$subexpression$1", "symbols": ["INT"] },
                        { "name": "stringType$ebnf$1$subexpression$1$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
                        { "name": "stringType$ebnf$1$subexpression$1", "symbols": [{ "literal": "<" }, "stringType$ebnf$1$subexpression$1$subexpression$1", { "literal": ">" }] },
                        { "name": "stringType$ebnf$1", "symbols": ["stringType$ebnf$1$subexpression$1"], "postprocess": id },
                        { "name": "stringType$ebnf$1", "symbols": [], "postprocess": function(d) {
                          return null;
                        } },
                        { "name": "stringType", "symbols": ["stringType$subexpression$1", "stringType$ebnf$1"], "postprocess": (d) => {
                          const stringKind = d[0][0].value;
                          let strLength = void 0;
                          if (d[1] !== null) {
                            strLength = getIntOrConstantValue(d[1][1] ? d[1][1][0] : void 0);
                          }
                          return { type: stringKind, upperBound: strLength };
                        } },
                        { "name": "booleanType", "symbols": [{ "literal": "boolean" }], "postprocess": (d) => ({ type: "bool" }) },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "byte" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "octet" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "wchar" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "char" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }, { "literal": "double" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "double" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "float" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int8" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint8" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int16" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint16" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int32" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint32" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int64" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint64" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "short" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "short" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "long" }, { "literal": "long" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }, { "literal": "long" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "unsigned" }, { "literal": "long" }] },
                        { "name": "numericType$subexpression$1", "symbols": [{ "literal": "long" }] },
                        {
                          "name": "numericType",
                          "symbols": ["numericType$subexpression$1"],
                          "postprocess": (d) => {
                            const typeString = d[0].map((t) => t?.value).filter((t) => !!t).join(" ");
                            return { type: typeString };
                          }
                        },
                        { "name": "literal$subexpression$1", "symbols": ["booleanLiteral"] },
                        { "name": "literal$subexpression$1", "symbols": ["strLiteral"] },
                        { "name": "literal$subexpression$1", "symbols": ["floatLiteral"] },
                        { "name": "literal$subexpression$1", "symbols": ["intLiteral"] },
                        { "name": "literal", "symbols": ["literal$subexpression$1"], "postprocess": (d) => d[0][0] },
                        { "name": "booleanLiteral", "symbols": ["BOOLEAN"], "postprocess": (d) => ({ value: d[0] === "TRUE" }) },
                        { "name": "strLiteral", "symbols": ["STR"], "postprocess": (d) => ({ value: d[0] }) },
                        { "name": "floatLiteral$subexpression$1", "symbols": ["SIGNED_FLOAT"] },
                        { "name": "floatLiteral$subexpression$1", "symbols": ["FLOAT"] },
                        { "name": "floatLiteral", "symbols": ["floatLiteral$subexpression$1"], "postprocess": (d) => ({ value: parseFloat(d[0][0]) }) },
                        { "name": "intLiteral$subexpression$1", "symbols": ["SIGNED_INT"] },
                        { "name": "intLiteral$subexpression$1", "symbols": ["INT"] },
                        { "name": "intLiteral", "symbols": ["intLiteral$subexpression$1"], "postprocess": (d) => ({ value: parseInt(d[0][0]) }) },
                        { "name": "BOOLEAN$subexpression$1", "symbols": [{ "literal": "TRUE" }] },
                        { "name": "BOOLEAN$subexpression$1", "symbols": [{ "literal": "FALSE" }] },
                        { "name": "BOOLEAN", "symbols": ["BOOLEAN$subexpression$1"], "postprocess": join },
                        { "name": "STR$ebnf$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
                        { "name": "STR$ebnf$1", "symbols": ["STR$ebnf$1", lexer.has("STRING") ? { type: "STRING" } : STRING], "postprocess": function arrpush(d) {
                          return d[0].concat([d[1]]);
                        } },
                        { "name": "STR", "symbols": ["STR$ebnf$1"], "postprocess": (d) => {
                          return join(d.flat(1).filter((d2) => d2 !== null));
                        } },
                        { "name": "SIGNED_FLOAT$subexpression$1", "symbols": [{ "literal": "+" }] },
                        { "name": "SIGNED_FLOAT$subexpression$1", "symbols": [{ "literal": "-" }] },
                        { "name": "SIGNED_FLOAT", "symbols": ["SIGNED_FLOAT$subexpression$1", "FLOAT"], "postprocess": join },
                        { "name": "FLOAT$subexpression$1", "symbols": [lexer.has("DECIMAL") ? { type: "DECIMAL" } : DECIMAL] },
                        { "name": "FLOAT$subexpression$1", "symbols": [lexer.has("DECIMALEXP") ? { type: "DECIMALEXP" } : DECIMALEXP] },
                        { "name": "FLOAT", "symbols": ["FLOAT$subexpression$1"], "postprocess": join },
                        { "name": "FLOAT$subexpression$2", "symbols": [lexer.has("DECIMAL") ? { type: "DECIMAL" } : DECIMAL, { "literal": "d" }] },
                        { "name": "FLOAT", "symbols": ["FLOAT$subexpression$2"], "postprocess": (d) => d[0][0].value },
                        { "name": "FLOAT$subexpression$3", "symbols": ["INT", { "literal": "d" }] },
                        { "name": "FLOAT", "symbols": ["FLOAT$subexpression$3"], "postprocess": (d) => d[0][0] },
                        { "name": "SIGNED_INT$subexpression$1", "symbols": [{ "literal": "+" }] },
                        { "name": "SIGNED_INT$subexpression$1", "symbols": [{ "literal": "-" }] },
                        { "name": "SIGNED_INT", "symbols": ["SIGNED_INT$subexpression$1", "INT"], "postprocess": join },
                        { "name": "INT", "symbols": [lexer.has("INTEGER") ? { type: "INTEGER" } : INTEGER], "postprocess": join },
                        { "name": "semi", "symbols": [{ "literal": ";" }], "postprocess": noop2 },
                        { "name": "simple", "symbols": [], "postprocess": () => ({ isComplex: false }) }
                      ],
                      ParserStart: "main"
                    };
                    if (typeof module4.exports !== "undefined") {
                      module4.exports = grammar;
                    } else {
                      window.grammar = grammar;
                    }
                  })();
                },
                614: function(module4) {
                  (function(root2, factory2) {
                    if (module4.exports) {
                      module4.exports = factory2();
                    } else {
                      root2.nearley = factory2();
                    }
                  })(this, function() {
                    function Rule(name, symbols, postprocess) {
                      this.id = ++Rule.highestId;
                      this.name = name;
                      this.symbols = symbols;
                      this.postprocess = postprocess;
                      return this;
                    }
                    Rule.highestId = 0;
                    Rule.prototype.toString = function(withCursorAt) {
                      var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
                      return this.name + " \u2192 " + symbolSequence;
                    };
                    function State2(rule, dot, reference, wantedBy) {
                      this.rule = rule;
                      this.dot = dot;
                      this.reference = reference;
                      this.data = [];
                      this.wantedBy = wantedBy;
                      this.isComplete = this.dot === rule.symbols.length;
                    }
                    State2.prototype.toString = function() {
                      return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
                    };
                    State2.prototype.nextState = function(child) {
                      var state = new State2(this.rule, this.dot + 1, this.reference, this.wantedBy);
                      state.left = this;
                      state.right = child;
                      if (state.isComplete) {
                        state.data = state.build();
                        state.right = void 0;
                      }
                      return state;
                    };
                    State2.prototype.build = function() {
                      var children = [];
                      var node = this;
                      do {
                        children.push(node.right.data);
                        node = node.left;
                      } while (node.left);
                      children.reverse();
                      return children;
                    };
                    State2.prototype.finish = function() {
                      if (this.rule.postprocess) {
                        this.data = this.rule.postprocess(this.data, this.reference, Parser2.fail);
                      }
                    };
                    function Column(grammar, index) {
                      this.grammar = grammar;
                      this.index = index;
                      this.states = [];
                      this.wants = {};
                      this.scannable = [];
                      this.completed = {};
                    }
                    Column.prototype.process = function(nextColumn) {
                      var states = this.states;
                      var wants = this.wants;
                      var completed = this.completed;
                      for (var w = 0; w < states.length; w++) {
                        var state = states[w];
                        if (state.isComplete) {
                          state.finish();
                          if (state.data !== Parser2.fail) {
                            var wantedBy = state.wantedBy;
                            for (var i = wantedBy.length; i--; ) {
                              var left = wantedBy[i];
                              this.complete(left, state);
                            }
                            if (state.reference === this.index) {
                              var exp = state.rule.name;
                              (this.completed[exp] = this.completed[exp] || []).push(state);
                            }
                          }
                        } else {
                          var exp = state.rule.symbols[state.dot];
                          if (typeof exp !== "string") {
                            this.scannable.push(state);
                            continue;
                          }
                          if (wants[exp]) {
                            wants[exp].push(state);
                            if (completed.hasOwnProperty(exp)) {
                              var nulls = completed[exp];
                              for (var i = 0; i < nulls.length; i++) {
                                var right = nulls[i];
                                this.complete(state, right);
                              }
                            }
                          } else {
                            wants[exp] = [state];
                            this.predict(exp);
                          }
                        }
                      }
                    };
                    Column.prototype.predict = function(exp) {
                      var rules = this.grammar.byName[exp] || [];
                      for (var i = 0; i < rules.length; i++) {
                        var r = rules[i];
                        var wantedBy = this.wants[exp];
                        var s = new State2(r, 0, this.index, wantedBy);
                        this.states.push(s);
                      }
                    };
                    Column.prototype.complete = function(left, right) {
                      var copy = left.nextState(right);
                      this.states.push(copy);
                    };
                    function Grammar(rules, start) {
                      this.rules = rules;
                      this.start = start || this.rules[0].name;
                      var byName = this.byName = {};
                      this.rules.forEach(function(rule) {
                        if (!byName.hasOwnProperty(rule.name)) {
                          byName[rule.name] = [];
                        }
                        byName[rule.name].push(rule);
                      });
                    }
                    Grammar.fromCompiled = function(rules, start) {
                      var lexer = rules.Lexer;
                      if (rules.ParserStart) {
                        start = rules.ParserStart;
                        rules = rules.ParserRules;
                      }
                      var rules = rules.map(function(r) {
                        return new Rule(r.name, r.symbols, r.postprocess);
                      });
                      var g = new Grammar(rules, start);
                      g.lexer = lexer;
                      return g;
                    };
                    function StreamLexer() {
                      this.reset("");
                    }
                    StreamLexer.prototype.reset = function(data, state) {
                      this.buffer = data;
                      this.index = 0;
                      this.line = state ? state.line : 1;
                      this.lastLineBreak = state ? -state.col : 0;
                    };
                    StreamLexer.prototype.next = function() {
                      if (this.index < this.buffer.length) {
                        var ch = this.buffer[this.index++];
                        if (ch === "\n") {
                          this.line += 1;
                          this.lastLineBreak = this.index;
                        }
                        return { value: ch };
                      }
                    };
                    StreamLexer.prototype.save = function() {
                      return {
                        line: this.line,
                        col: this.index - this.lastLineBreak
                      };
                    };
                    StreamLexer.prototype.formatError = function(token, message2) {
                      var buffer = this.buffer;
                      if (typeof buffer === "string") {
                        var lines = buffer.split("\n").slice(
                          Math.max(0, this.line - 5),
                          this.line
                        );
                        var nextLineBreak = buffer.indexOf("\n", this.index);
                        if (nextLineBreak === -1)
                          nextLineBreak = buffer.length;
                        var col = this.index - this.lastLineBreak;
                        var lastLineDigits = String(this.line).length;
                        message2 += " at line " + this.line + " col " + col + ":\n\n";
                        message2 += lines.map(function(line, i) {
                          return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
                        }, this).join("\n");
                        message2 += "\n" + pad("", lastLineDigits + col) + "^\n";
                        return message2;
                      } else {
                        return message2 + " at index " + (this.index - 1);
                      }
                      function pad(n, length) {
                        var s = String(n);
                        return Array(length - s.length + 1).join(" ") + s;
                      }
                    };
                    function Parser2(rules, start, options) {
                      if (rules instanceof Grammar) {
                        var grammar = rules;
                        var options = start;
                      } else {
                        var grammar = Grammar.fromCompiled(rules, start);
                      }
                      this.grammar = grammar;
                      this.options = {
                        keepHistory: false,
                        lexer: grammar.lexer || new StreamLexer()
                      };
                      for (var key in options || {}) {
                        this.options[key] = options[key];
                      }
                      this.lexer = this.options.lexer;
                      this.lexerState = void 0;
                      var column = new Column(grammar, 0);
                      this.table = [column];
                      column.wants[grammar.start] = [];
                      column.predict(grammar.start);
                      column.process();
                      this.current = 0;
                    }
                    Parser2.fail = {};
                    Parser2.prototype.feed = function(chunk) {
                      var lexer = this.lexer;
                      lexer.reset(chunk, this.lexerState);
                      var token;
                      while (true) {
                        try {
                          token = lexer.next();
                          if (!token) {
                            break;
                          }
                        } catch (e) {
                          var nextColumn = new Column(this.grammar, this.current + 1);
                          this.table.push(nextColumn);
                          var err = new Error(this.reportLexerError(e));
                          err.offset = this.current;
                          err.token = e.token;
                          throw err;
                        }
                        var column = this.table[this.current];
                        if (!this.options.keepHistory) {
                          delete this.table[this.current - 1];
                        }
                        var n = this.current + 1;
                        var nextColumn = new Column(this.grammar, n);
                        this.table.push(nextColumn);
                        var literal = token.text !== void 0 ? token.text : token.value;
                        var value = lexer.constructor === StreamLexer ? token.value : token;
                        var scannable = column.scannable;
                        for (var w = scannable.length; w--; ) {
                          var state = scannable[w];
                          var expect = state.rule.symbols[state.dot];
                          if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                            var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
                            nextColumn.states.push(next);
                          }
                        }
                        nextColumn.process();
                        if (nextColumn.states.length === 0) {
                          var err = new Error(this.reportError(token));
                          err.offset = this.current;
                          err.token = token;
                          throw err;
                        }
                        if (this.options.keepHistory) {
                          column.lexerState = lexer.save();
                        }
                        this.current++;
                      }
                      if (column) {
                        this.lexerState = lexer.save();
                      }
                      this.results = this.finish();
                      return this;
                    };
                    Parser2.prototype.reportLexerError = function(lexerError) {
                      var tokenDisplay, lexerMessage;
                      var token = lexerError.token;
                      if (token) {
                        tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
                        lexerMessage = this.lexer.formatError(token, "Syntax error");
                      } else {
                        tokenDisplay = "input (lexer error)";
                        lexerMessage = lexerError.message;
                      }
                      return this.reportErrorCommon(lexerMessage, tokenDisplay);
                    };
                    Parser2.prototype.reportError = function(token) {
                      var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
                      var lexerMessage = this.lexer.formatError(token, "Syntax error");
                      return this.reportErrorCommon(lexerMessage, tokenDisplay);
                    };
                    Parser2.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
                      var lines = [];
                      lines.push(lexerMessage);
                      var lastColumnIndex = this.table.length - 2;
                      var lastColumn = this.table[lastColumnIndex];
                      var expectantStates = lastColumn.states.filter(function(state) {
                        var nextSymbol = state.rule.symbols[state.dot];
                        return nextSymbol && typeof nextSymbol !== "string";
                      });
                      if (expectantStates.length === 0) {
                        lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
                        this.displayStateStack(lastColumn.states, lines);
                      } else {
                        lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
                        var stateStacks = expectantStates.map(function(state) {
                          return this.buildFirstStateStack(state, []) || [state];
                        }, this);
                        stateStacks.forEach(function(stateStack) {
                          var state = stateStack[0];
                          var nextSymbol = state.rule.symbols[state.dot];
                          var symbolDisplay = this.getSymbolDisplay(nextSymbol);
                          lines.push("A " + symbolDisplay + " based on:");
                          this.displayStateStack(stateStack, lines);
                        }, this);
                      }
                      lines.push("");
                      return lines.join("\n");
                    };
                    Parser2.prototype.displayStateStack = function(stateStack, lines) {
                      var lastDisplay;
                      var sameDisplayCount = 0;
                      for (var j = 0; j < stateStack.length; j++) {
                        var state = stateStack[j];
                        var display = state.rule.toString(state.dot);
                        if (display === lastDisplay) {
                          sameDisplayCount++;
                        } else {
                          if (sameDisplayCount > 0) {
                            lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
                          }
                          sameDisplayCount = 0;
                          lines.push("    " + display);
                        }
                        lastDisplay = display;
                      }
                    };
                    Parser2.prototype.getSymbolDisplay = function(symbol) {
                      return getSymbolLongDisplay(symbol);
                    };
                    Parser2.prototype.buildFirstStateStack = function(state, visited) {
                      if (visited.indexOf(state) !== -1) {
                        return null;
                      }
                      if (state.wantedBy.length === 0) {
                        return [state];
                      }
                      var prevState = state.wantedBy[0];
                      var childVisited = [state].concat(visited);
                      var childResult = this.buildFirstStateStack(prevState, childVisited);
                      if (childResult === null) {
                        return null;
                      }
                      return [state].concat(childResult);
                    };
                    Parser2.prototype.save = function() {
                      var column = this.table[this.current];
                      column.lexerState = this.lexerState;
                      return column;
                    };
                    Parser2.prototype.restore = function(column) {
                      var index = column.index;
                      this.current = index;
                      this.table[index] = column;
                      this.table.splice(index + 1);
                      this.lexerState = column.lexerState;
                      this.results = this.finish();
                    };
                    Parser2.prototype.rewind = function(index) {
                      if (!this.options.keepHistory) {
                        throw new Error("set option `keepHistory` to enable rewinding");
                      }
                      this.restore(this.table[index]);
                    };
                    Parser2.prototype.finish = function() {
                      var considerations = [];
                      var start = this.grammar.start;
                      var column = this.table[this.table.length - 1];
                      column.states.forEach(function(t) {
                        if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser2.fail) {
                          considerations.push(t);
                        }
                      });
                      return considerations.map(function(c) {
                        return c.data;
                      });
                    };
                    function getSymbolLongDisplay(symbol) {
                      var type2 = typeof symbol;
                      if (type2 === "string") {
                        return symbol;
                      } else if (type2 === "object") {
                        if (symbol.literal) {
                          return JSON.stringify(symbol.literal);
                        } else if (symbol instanceof RegExp) {
                          return "character matching " + symbol;
                        } else if (symbol.type) {
                          return symbol.type + " token";
                        } else if (symbol.test) {
                          return "token matching " + String(symbol.test);
                        } else {
                          throw new Error("Unknown symbol type: " + symbol);
                        }
                      }
                    }
                    function getSymbolShortDisplay(symbol) {
                      var type2 = typeof symbol;
                      if (type2 === "string") {
                        return symbol;
                      } else if (type2 === "object") {
                        if (symbol.literal) {
                          return JSON.stringify(symbol.literal);
                        } else if (symbol instanceof RegExp) {
                          return symbol.toString();
                        } else if (symbol.type) {
                          return "%" + symbol.type;
                        } else if (symbol.test) {
                          return "<" + String(symbol.test) + ">";
                        } else {
                          throw new Error("Unknown symbol type: " + symbol);
                        }
                      }
                    }
                    return {
                      Parser: Parser2,
                      Grammar,
                      Rule
                    };
                  });
                },
                549: (__unused_webpack_module, exports2, __nested_webpack_require_67853__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.ConstantIDLNode = void 0;
                  const EnumIDLNode_1 = __nested_webpack_require_67853__(561);
                  const IDLNode_1 = __nested_webpack_require_67853__(76);
                  const primitiveTypes_1 = __nested_webpack_require_67853__(205);
                  class ConstantIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                      __publicField(this, "typeNeedsResolution", false);
                      __publicField(this, "referencedEnumNode");
                      if (!primitiveTypes_1.SIMPLE_TYPES.has(astNode.type)) {
                        this.typeNeedsResolution = true;
                      }
                    }
                    get type() {
                      if (this.typeNeedsResolution) {
                        return this.getReferencedEnumNode().type;
                      }
                      return this.astNode.type;
                    }
                    getReferencedEnumNode() {
                      if (this.referencedEnumNode == void 0) {
                        const maybeEnumNode = this.getNode(this.scopePath, this.astNode.type);
                        if (!(maybeEnumNode instanceof EnumIDLNode_1.EnumIDLNode)) {
                          throw new Error(`Expected ${this.astNode.type} to be an enum in ${this.scopedIdentifier}`);
                        }
                        this.referencedEnumNode = maybeEnumNode;
                      }
                      return this.referencedEnumNode;
                    }
                    get isConstant() {
                      return true;
                    }
                    get value() {
                      if (typeof this.astNode.value === "object") {
                        return this.getConstantNode(this.astNode.value.name).value;
                      }
                      return this.astNode.value;
                    }
                    toIDLMessageDefinitionField() {
                      return {
                        name: this.name,
                        type: (0, primitiveTypes_1.normalizeType)(this.type),
                        value: this.value,
                        isConstant: true,
                        isComplex: false,
                        ...this.astNode.valueText != void 0 ? { valueText: this.astNode.valueText } : void 0
                      };
                    }
                  }
                  exports2.ConstantIDLNode = ConstantIDLNode;
                },
                561: (__unused_webpack_module, exports2, __nested_webpack_require_70384__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.EnumIDLNode = void 0;
                  const IDLNode_1 = __nested_webpack_require_70384__(76);
                  class EnumIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                    }
                    get type() {
                      return "uint32";
                    }
                    enumeratorNodes() {
                      return this.astNode.enumerators.map((enumerator) => this.getConstantNode((0, IDLNode_1.toScopedIdentifier)([...this.scopePath, this.name, enumerator.name])));
                    }
                    toIDLMessageDefinition() {
                      const definitions = this.enumeratorNodes().map((enumerator) => enumerator.toIDLMessageDefinitionField());
                      return {
                        name: (0, IDLNode_1.toScopedIdentifier)([...this.scopePath, this.name]),
                        definitions,
                        aggregatedKind: "module"
                      };
                    }
                  }
                  exports2.EnumIDLNode = EnumIDLNode;
                },
                76: (__unused_webpack_module, exports2) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.toScopedIdentifier = exports2.IDLNode = void 0;
                  class IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      __publicField(this, "map");
                      __publicField(this, "astNode");
                      __publicField(this, "scopePath");
                      this.scopePath = scopePath;
                      this.astNode = astNode;
                      this.map = idlMap;
                    }
                    get declarator() {
                      return this.astNode.declarator;
                    }
                    get name() {
                      return this.astNode.name;
                    }
                    get annotations() {
                      return this.astNode.annotations;
                    }
                    get scopedIdentifier() {
                      return toScopedIdentifier([...this.scopePath, this.name]);
                    }
                    getNode(scopePath, name) {
                      const maybeNode = resolveScopedOrLocalNodeReference({
                        usedIdentifier: name,
                        scopeOfUsage: scopePath,
                        definitionMap: this.map
                      });
                      if (maybeNode == void 0) {
                        throw new Error(`Could not find node ${name} in ${scopePath.join("::")} referenced by ${this.scopedIdentifier}`);
                      }
                      return maybeNode;
                    }
                    getConstantNode(identifier, scopePath = this.scopePath) {
                      const maybeConstantNode = this.getNode(scopePath, identifier);
                      if (maybeConstantNode.declarator !== "const") {
                        throw new Error(`Expected ${this.name} to be a constant in ${this.scopedIdentifier}`);
                      }
                      return maybeConstantNode;
                    }
                  }
                  exports2.IDLNode = IDLNode;
                  function resolveScopedOrLocalNodeReference({ usedIdentifier, scopeOfUsage, definitionMap }) {
                    let referencedNode = void 0;
                    const namespacePrefixes = [...scopeOfUsage];
                    const currPrefix = [];
                    for (; ; ) {
                      const identifierToTry = toScopedIdentifier([...currPrefix, usedIdentifier]);
                      referencedNode = definitionMap.get(identifierToTry);
                      if (referencedNode != void 0) {
                        break;
                      }
                      if (namespacePrefixes.length === 0) {
                        break;
                      }
                      currPrefix.push(namespacePrefixes.shift());
                    }
                    return referencedNode;
                  }
                  function toScopedIdentifier(path2) {
                    return path2.join("::");
                  }
                  exports2.toScopedIdentifier = toScopedIdentifier;
                },
                667: (__unused_webpack_module, exports2, __nested_webpack_require_75077__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.ModuleIDLNode = void 0;
                  const ConstantIDLNode_1 = __nested_webpack_require_75077__(549);
                  const IDLNode_1 = __nested_webpack_require_75077__(76);
                  class ModuleIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                    }
                    toIDLMessageDefinition() {
                      const definitions = this.definitions.flatMap((def) => {
                        if (def instanceof ConstantIDLNode_1.ConstantIDLNode) {
                          return [def.toIDLMessageDefinitionField()];
                        }
                        return [];
                      });
                      if (definitions.length === 0) {
                        return void 0;
                      }
                      return {
                        name: this.scopedIdentifier,
                        definitions,
                        aggregatedKind: "module"
                      };
                    }
                    get definitions() {
                      return this.astNode.definitions.map((def) => this.getNode([...this.scopePath, this.name], def.name));
                    }
                  }
                  exports2.ModuleIDLNode = ModuleIDLNode;
                },
                212: (__unused_webpack_module, exports2, __nested_webpack_require_76306__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.ReferenceTypeIDLNode = void 0;
                  const IDLNode_1 = __nested_webpack_require_76306__(76);
                  const primitiveTypes_1 = __nested_webpack_require_76306__(205);
                  class ReferenceTypeIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                      __publicField(this, "typeNeedsResolution", false);
                      __publicField(this, "typeRefNode");
                      if (!primitiveTypes_1.SIMPLE_TYPES.has(astNode.type)) {
                        this.typeNeedsResolution = true;
                      }
                    }
                    get type() {
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef" || parent.declarator === "enum") {
                          return parent.type;
                        }
                        return parent.scopedIdentifier;
                      }
                      return this.astNode.type;
                    }
                    get isComplex() {
                      if (!this.typeNeedsResolution) {
                        return false;
                      }
                      const parent = this.typeRef();
                      if (parent.declarator === "typedef") {
                        return parent.isComplex;
                      }
                      return parent.declarator === "struct" || parent.declarator === "union";
                    }
                    get isArray() {
                      let isArray2 = this.astNode.isArray;
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef") {
                          isArray2 || (isArray2 = parent.isArray);
                        }
                      }
                      return isArray2;
                    }
                    get arrayLengths() {
                      const arrayLengths = this.astNode.arrayLengths ? [...this.astNode.arrayLengths] : [];
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef" && parent.arrayLengths) {
                          arrayLengths.push(...parent.arrayLengths);
                        }
                      }
                      const finalArrayLengths = [];
                      for (const arrayLength of arrayLengths) {
                        const resolvedArrayLength = this.resolvePossibleNumericConstantUsage(arrayLength);
                        if (resolvedArrayLength != void 0) {
                          finalArrayLengths.push(resolvedArrayLength);
                        }
                      }
                      return finalArrayLengths.length > 0 ? finalArrayLengths : void 0;
                    }
                    get arrayUpperBound() {
                      let arrayUpperBound = void 0;
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef") {
                          arrayUpperBound = parent.arrayUpperBound;
                        }
                      }
                      if (this.astNode.arrayUpperBound != void 0) {
                        arrayUpperBound = this.astNode.arrayUpperBound;
                      }
                      return this.resolvePossibleNumericConstantUsage(arrayUpperBound);
                    }
                    get upperBound() {
                      let upperBound = void 0;
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef") {
                          upperBound = parent.upperBound;
                        }
                      }
                      if (this.astNode.upperBound != void 0) {
                        upperBound = this.astNode.upperBound;
                      }
                      return this.resolvePossibleNumericConstantUsage(upperBound);
                    }
                    get annotations() {
                      let annotations = void 0;
                      if (this.typeNeedsResolution) {
                        const parent = this.typeRef();
                        if (parent.declarator === "typedef" && parent.annotations != void 0) {
                          annotations = { ...parent.annotations };
                        }
                      }
                      if (this.astNode.annotations != void 0) {
                        annotations = { ...annotations, ...this.astNode.annotations };
                      }
                      return annotations;
                    }
                    resolvePossibleNumericConstantUsage(astValue) {
                      if (typeof astValue === "number" || astValue == void 0) {
                        return astValue;
                      }
                      const constantNodeIdentifier = astValue.name;
                      const constantNodeValue = this.getConstantNode(constantNodeIdentifier).value;
                      if (typeof constantNodeValue !== "number") {
                        throw Error(`Expected constant value ${constantNodeIdentifier} in ${this.scopedIdentifier} to be a number, but got ${constantNodeValue.toString()}`);
                      }
                      return constantNodeValue;
                    }
                    getValidTypeReference(typeName) {
                      const maybeValidParent = this.getNode(this.scopePath, typeName);
                      if (!(maybeValidParent.declarator === "struct") && !(maybeValidParent.declarator === "typedef") && !(maybeValidParent.declarator === "union") && !(maybeValidParent.declarator === "enum")) {
                        throw new Error(`Expected ${typeName} to be non-module, non-constant type in ${this.scopedIdentifier}`);
                      }
                      return maybeValidParent;
                    }
                    typeRef() {
                      if (this.typeRefNode == void 0) {
                        this.typeRefNode = this.getValidTypeReference(this.astNode.type);
                      }
                      if (!(this.typeRefNode instanceof ReferenceTypeIDLNode)) {
                        return this.typeRefNode;
                      }
                      if (this.astNode.isArray === true && this.typeRefNode.isArray === true) {
                        const thisNodeIsFixedSize = this.astNode.arrayLengths != void 0;
                        const parentNodeIsFixedSize = this.typeRefNode.arrayLengths != void 0;
                        if (!thisNodeIsFixedSize || !parentNodeIsFixedSize) {
                          throw new Error(`We do not support composing variable length arrays with typedefs: ${this.scopedIdentifier} referencing ${this.typeRefNode.scopedIdentifier}`);
                        }
                      }
                      return this.typeRefNode;
                    }
                  }
                  exports2.ReferenceTypeIDLNode = ReferenceTypeIDLNode;
                },
                801: (__unused_webpack_module, exports2, __nested_webpack_require_83762__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.StructIDLNode = void 0;
                  const IDLNode_1 = __nested_webpack_require_83762__(76);
                  class StructIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                    }
                    get type() {
                      return this.astNode.name;
                    }
                    get definitions() {
                      return this.astNode.definitions.map((def) => this.getStructMemberNode(def.name));
                    }
                    toIDLMessageDefinition() {
                      const definitions = this.definitions.map((def) => def.toIDLMessageDefinitionField());
                      return {
                        name: this.scopedIdentifier,
                        definitions,
                        aggregatedKind: "struct",
                        ...this.astNode.annotations ? { annotations: this.astNode.annotations } : void 0
                      };
                    }
                    getStructMemberNode(name) {
                      const maybeStructMember = this.getNode([...this.scopePath, this.name], name);
                      if (maybeStructMember.declarator !== "struct-member") {
                        throw new Error(`Expected ${name} to be a struct member in ${this.scopedIdentifier}`);
                      }
                      return maybeStructMember;
                    }
                  }
                  exports2.StructIDLNode = StructIDLNode;
                },
                605: (__unused_webpack_module, exports2, __nested_webpack_require_85219__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.StructMemberIDLNode = void 0;
                  const ReferenceTypeIDLNode_1 = __nested_webpack_require_85219__(212);
                  const primitiveTypes_1 = __nested_webpack_require_85219__(205);
                  class StructMemberIDLNode extends ReferenceTypeIDLNode_1.ReferenceTypeIDLNode {
                    constructor(scopePath, node, idlMap) {
                      super(scopePath, node, idlMap);
                    }
                    toIDLMessageDefinitionField() {
                      const msgDefinitionField = {
                        name: this.name,
                        type: (0, primitiveTypes_1.normalizeType)(this.type),
                        isComplex: this.isComplex
                      };
                      if (this.arrayLengths != void 0) {
                        msgDefinitionField.arrayLengths = this.arrayLengths;
                      }
                      if (this.arrayUpperBound != void 0) {
                        msgDefinitionField.arrayUpperBound = this.arrayUpperBound;
                      }
                      if (this.upperBound != void 0) {
                        msgDefinitionField.upperBound = this.upperBound;
                      }
                      if (this.annotations != void 0) {
                        msgDefinitionField.annotations = this.annotations;
                      }
                      if (this.isArray != void 0) {
                        msgDefinitionField.isArray = this.isArray;
                      }
                      const maybeDefault = this.annotations?.default;
                      if (maybeDefault && maybeDefault.type !== "no-params") {
                        const defaultValue = maybeDefault.type === "const-param" ? maybeDefault.value : maybeDefault.namedParams.value;
                        if (typeof defaultValue !== "object") {
                          msgDefinitionField.defaultValue = defaultValue;
                        } else {
                          msgDefinitionField.defaultValue = this.getConstantNode(defaultValue.name).value;
                        }
                      }
                      return msgDefinitionField;
                    }
                  }
                  exports2.StructMemberIDLNode = StructMemberIDLNode;
                },
                647: (__unused_webpack_module, exports2, __nested_webpack_require_87197__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.TypedefIDLNode = void 0;
                  const ReferenceTypeIDLNode_1 = __nested_webpack_require_87197__(212);
                  class TypedefIDLNode extends ReferenceTypeIDLNode_1.ReferenceTypeIDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                    }
                  }
                  exports2.TypedefIDLNode = TypedefIDLNode;
                },
                57: (__unused_webpack_module, exports2, __nested_webpack_require_87672__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.UnionIDLNode = void 0;
                  const IDLNode_1 = __nested_webpack_require_87672__(76);
                  const StructMemberIDLNode_1 = __nested_webpack_require_87672__(605);
                  const primitiveTypes_1 = __nested_webpack_require_87672__(205);
                  class UnionIDLNode extends IDLNode_1.IDLNode {
                    constructor(scopePath, astNode, idlMap) {
                      super(scopePath, astNode, idlMap);
                      __publicField(this, "switchTypeNeedsResolution", false);
                      __publicField(this, "_switchTypeNode");
                      if (!primitiveTypes_1.SIMPLE_TYPES.has(this.astNode.switchType)) {
                        this.switchTypeNeedsResolution = true;
                      }
                    }
                    get type() {
                      return this.astNode.name;
                    }
                    get isComplex() {
                      return true;
                    }
                    switchTypeNode() {
                      if (this._switchTypeNode) {
                        return this._switchTypeNode;
                      }
                      const typeNode = this.getNode(this.scopePath, this.astNode.switchType);
                      if (typeNode.declarator !== "enum" && typeNode.declarator !== "typedef") {
                        throw new Error(`Invalid switch type "${typeNode.scopedIdentifier}" ${this.astNode.switchType} in ${this.scopedIdentifier}`);
                      }
                      this._switchTypeNode = typeNode;
                      return typeNode;
                    }
                    get switchType() {
                      let switchType = this.astNode.switchType;
                      if (this.switchTypeNeedsResolution) {
                        switchType = this.switchTypeNode().type;
                      }
                      if (!isValidSwitchType(switchType)) {
                        throw new Error(`Invalid resolved switch type ${switchType} in ${this.scopedIdentifier}`);
                      }
                      return switchType;
                    }
                    get cases() {
                      const isEnumSwitchType = this.switchTypeNeedsResolution && this.switchTypeNode().declarator === "enum";
                      const predicateScopePath = isEnumSwitchType ? this.switchTypeNode().scopedIdentifier.split("::") : this.scopePath;
                      return this.astNode.cases.map((def) => {
                        const typeNode = new StructMemberIDLNode_1.StructMemberIDLNode(
                          [...this.scopePath, this.name],
                          { ...def.type, declarator: "struct-member" },
                          this.map
                        );
                        const resolvedPredicates = def.predicates.map((predicate) => {
                          if (typeof predicate === "object") {
                            return this.getConstantNode(predicate.name, predicateScopePath).value;
                          }
                          return predicate;
                        });
                        const resolvedType = typeNode.toIDLMessageDefinitionField();
                        return {
                          type: resolvedType,
                          predicates: resolvedPredicates
                        };
                      });
                    }
                    get defaultCase() {
                      if (!this.astNode.defaultCase) {
                        return void 0;
                      }
                      const typeNode = new StructMemberIDLNode_1.StructMemberIDLNode(
                        [...this.scopePath, this.name],
                        { ...this.astNode.defaultCase, declarator: "struct-member" },
                        this.map
                      );
                      return typeNode.toIDLMessageDefinitionField();
                    }
                    toIDLMessageDefinition() {
                      const annotations = this.annotations;
                      return {
                        name: this.scopedIdentifier,
                        switchType: this.switchType,
                        cases: this.cases,
                        aggregatedKind: "union",
                        ...this.astNode.defaultCase ? { defaultCase: this.defaultCase } : void 0,
                        ...annotations ? { annotations } : void 0
                      };
                    }
                  }
                  exports2.UnionIDLNode = UnionIDLNode;
                  function isValidSwitchType(type2) {
                    return primitiveTypes_1.INTEGER_TYPES.has(type2) || type2 === "bool";
                  }
                },
                732: function(__unused_webpack_module, exports2, __nested_webpack_require_91640__) {
                  var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                    if (k2 === void 0)
                      k2 = k;
                    var desc = Object.getOwnPropertyDescriptor(m, k);
                    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                      desc = { enumerable: true, get: function() {
                        return m[k];
                      } };
                    }
                    Object.defineProperty(o, k2, desc);
                  } : function(o, m, k, k2) {
                    if (k2 === void 0)
                      k2 = k;
                    o[k2] = m[k];
                  });
                  var __exportStar = this && this.__exportStar || function(m, exports3) {
                    for (var p in m)
                      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                        __createBinding(exports3, m, p);
                  };
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  __exportStar(__nested_webpack_require_91640__(549), exports2);
                  __exportStar(__nested_webpack_require_91640__(561), exports2);
                  __exportStar(__nested_webpack_require_91640__(76), exports2);
                  __exportStar(__nested_webpack_require_91640__(667), exports2);
                  __exportStar(__nested_webpack_require_91640__(801), exports2);
                  __exportStar(__nested_webpack_require_91640__(605), exports2);
                  __exportStar(__nested_webpack_require_91640__(647), exports2);
                },
                654: function(__unused_webpack_module, exports2, __nested_webpack_require_92840__) {
                  var __importDefault = this && this.__importDefault || function(mod2) {
                    return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
                  };
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.IDL_GRAMMAR = void 0;
                  const nearley_1 = __nested_webpack_require_92840__(614);
                  const idl_ne_1 = __importDefault(__nested_webpack_require_92840__(461));
                  exports2.IDL_GRAMMAR = nearley_1.Grammar.fromCompiled(idl_ne_1.default);
                },
                715: function(__unused_webpack_module, exports2, __nested_webpack_require_93363__) {
                  var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
                    if (k2 === void 0)
                      k2 = k;
                    var desc = Object.getOwnPropertyDescriptor(m, k);
                    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                      desc = { enumerable: true, get: function() {
                        return m[k];
                      } };
                    }
                    Object.defineProperty(o, k2, desc);
                  } : function(o, m, k, k2) {
                    if (k2 === void 0)
                      k2 = k;
                    o[k2] = m[k];
                  });
                  var __exportStar = this && this.__exportStar || function(m, exports3) {
                    for (var p in m)
                      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                        __createBinding(exports3, m, p);
                  };
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  __exportStar(__nested_webpack_require_93363__(494), exports2);
                  __exportStar(__nested_webpack_require_93363__(862), exports2);
                },
                494: (__unused_webpack_module, exports2, __nested_webpack_require_94311__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.parseIDL = void 0;
                  const parseIDLToAST_1 = __nested_webpack_require_94311__(171);
                  const processIDL_1 = __nested_webpack_require_94311__(940);
                  function parseIDL(messageDefinition) {
                    const rawIDLDefinitions = (0, parseIDLToAST_1.parseIDLToAST)(messageDefinition);
                    const idlMap = (0, processIDL_1.buildMap)(rawIDLDefinitions);
                    return (0, processIDL_1.toIDLMessageDefinitions)(idlMap);
                  }
                  exports2.parseIDL = parseIDL;
                },
                171: (__unused_webpack_module, exports2, __nested_webpack_require_95131__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.parseIDLToAST = void 0;
                  const nearley_1 = __nested_webpack_require_95131__(614);
                  const grammar_1 = __nested_webpack_require_95131__(654);
                  function parseIDLToAST(definition) {
                    const parser = new nearley_1.Parser(grammar_1.IDL_GRAMMAR);
                    parser.feed(definition);
                    parser.finish();
                    const results = parser.results;
                    if (results.length === 0) {
                      throw new Error(`Could not parse message definition (unexpected end of input): '${definition}'`);
                    }
                    if (results.length > 1) {
                      throw new Error(`Ambiguous grammar: '${definition}'`);
                    }
                    return results[0];
                  }
                  exports2.parseIDLToAST = parseIDLToAST;
                },
                205: (__unused_webpack_module, exports2) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.normalizeType = exports2.SIMPLE_TYPES = exports2.INTEGER_TYPES = void 0;
                  const numericTypeMap = {
                    "unsigned short": "uint16",
                    "unsigned long": "uint32",
                    "unsigned long long": "uint64",
                    short: "int16",
                    long: "int32",
                    "long long": "int64",
                    double: "float64",
                    float: "float32",
                    octet: "uint8",
                    char: "uint8",
                    byte: "int8"
                  };
                  exports2.INTEGER_TYPES = /* @__PURE__ */ new Set([
                    "int8",
                    "uint8",
                    "int16",
                    "uint16",
                    "int32",
                    "uint32",
                    "int64",
                    "uint64",
                    "byte",
                    "octet",
                    "unsigned short",
                    "unsigned long",
                    "unsigned long long",
                    "short",
                    "long",
                    "long long"
                  ]);
                  exports2.SIMPLE_TYPES = /* @__PURE__ */ new Set([
                    "bool",
                    "string",
                    "wstring",
                    "int8",
                    "uint8",
                    "int16",
                    "uint16",
                    "int32",
                    "uint32",
                    "int64",
                    "uint64",
                    "wchar",
                    ...Object.keys(numericTypeMap)
                  ]);
                  function normalizeType(type2) {
                    const toType = numericTypeMap[type2];
                    if (toType != void 0) {
                      return toType;
                    }
                    return type2;
                  }
                  exports2.normalizeType = normalizeType;
                },
                940: (__unused_webpack_module, exports2, __nested_webpack_require_97338__) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                  exports2.toIDLMessageDefinitions = exports2.buildMap = void 0;
                  const IDLNodes_1 = __nested_webpack_require_97338__(732);
                  const UnionIDLNode_1 = __nested_webpack_require_97338__(57);
                  function buildMap(definitions) {
                    const idlMap = /* @__PURE__ */ new Map();
                    for (const definition of definitions) {
                      traverseIDL([definition], (path2) => {
                        const node = path2[path2.length - 1];
                        const namePath = path2.map((n) => n.name);
                        const scopePath = namePath.slice(0, -1);
                        const newNode = makeIDLNode(scopePath, node, idlMap);
                        idlMap.set(newNode.scopedIdentifier, newNode);
                        if (node.declarator === "enum") {
                          let nextImplicitIEnumValue = 0;
                          const enumConstants = node.enumerators.map((m) => ({
                            declarator: "const",
                            isConstant: true,
                            name: m.name,
                            type: "unsigned long",
                            value: getValueAnnotation(m.annotations) ?? nextImplicitIEnumValue++,
                            isComplex: false
                          }));
                          for (const constant of enumConstants) {
                            const idlConstantNode = new IDLNodes_1.ConstantIDLNode(namePath, constant, idlMap);
                            idlMap.set(idlConstantNode.scopedIdentifier, idlConstantNode);
                          }
                        }
                      });
                    }
                    return idlMap;
                  }
                  exports2.buildMap = buildMap;
                  function getValueAnnotation(annotations) {
                    if (!annotations) {
                      return void 0;
                    }
                    const valueAnnotation = annotations["value"];
                    if (valueAnnotation && valueAnnotation.type === "const-param") {
                      return valueAnnotation.value;
                    }
                    return void 0;
                  }
                  function toIDLMessageDefinitions(map) {
                    const messageDefinitions = [];
                    const topLevelConstantDefinitions = [];
                    for (const node of map.values()) {
                      if (node.declarator === "struct") {
                        messageDefinitions.push(node.toIDLMessageDefinition());
                      } else if (node.declarator === "module") {
                        const def = node.toIDLMessageDefinition();
                        if (def != void 0) {
                          messageDefinitions.push(def);
                        }
                      } else if (node.declarator === "const") {
                        if (node.scopePath.length === 0) {
                          topLevelConstantDefinitions.push(node.toIDLMessageDefinitionField());
                        }
                      } else if (node.declarator === "enum") {
                        messageDefinitions.push(node.toIDLMessageDefinition());
                      } else if (node.declarator === "union") {
                        messageDefinitions.push(node.toIDLMessageDefinition());
                      }
                    }
                    if (topLevelConstantDefinitions.length > 0) {
                      messageDefinitions.push({
                        name: "",
                        definitions: topLevelConstantDefinitions,
                        aggregatedKind: "module"
                      });
                    }
                    return messageDefinitions;
                  }
                  exports2.toIDLMessageDefinitions = toIDLMessageDefinitions;
                  const makeIDLNode = (scopePath, node, idlMap) => {
                    switch (node.declarator) {
                      case "module":
                        return new IDLNodes_1.ModuleIDLNode(scopePath, node, idlMap);
                      case "enum":
                        return new IDLNodes_1.EnumIDLNode(scopePath, node, idlMap);
                      case "const":
                        return new IDLNodes_1.ConstantIDLNode(scopePath, node, idlMap);
                      case "struct":
                        return new IDLNodes_1.StructIDLNode(scopePath, node, idlMap);
                      case "struct-member":
                        return new IDLNodes_1.StructMemberIDLNode(scopePath, node, idlMap);
                      case "typedef":
                        return new IDLNodes_1.TypedefIDLNode(scopePath, node, idlMap);
                      case "union":
                        return new UnionIDLNode_1.UnionIDLNode(scopePath, node, idlMap);
                    }
                  };
                  function traverseIDL(path2, processNode) {
                    const currNode = path2[path2.length - 1];
                    if ("definitions" in currNode) {
                      currNode.definitions.forEach((n) => traverseIDL([...path2, n], processNode));
                    }
                    processNode(path2);
                  }
                },
                862: (__unused_webpack_module, exports2) => {
                  Object.defineProperty(exports2, "__esModule", { value: true });
                }
              };
              var __webpack_module_cache__2 = {};
              function __nested_webpack_require_102400__(moduleId) {
                var cachedModule = __webpack_module_cache__2[moduleId];
                if (cachedModule !== void 0) {
                  return cachedModule.exports;
                }
                var module4 = __webpack_module_cache__2[moduleId] = {
                  exports: {}
                };
                __webpack_modules__2[moduleId].call(module4.exports, module4, module4.exports, __nested_webpack_require_102400__);
                return module4.exports;
              }
              var __nested_webpack_exports__ = __nested_webpack_require_102400__(715);
              module3.exports = __nested_webpack_exports__;
            })();
          }
        };
        var __webpack_module_cache__ = {};
        function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (cachedModule !== void 0) {
            return cachedModule.exports;
          }
          var module3 = __webpack_module_cache__[moduleId] = {
            exports: {}
          };
          __webpack_modules__[moduleId].call(module3.exports, module3, module3.exports, __webpack_require__);
          return module3.exports;
        }
        var __webpack_exports__ = __webpack_require__(27);
        module2.exports = __webpack_exports__;
      })();
    })(dist$3);
    var dist$2 = { exports: {} };
    (function(module2) {
      (() => {
        var __webpack_modules__ = {
          417: (__unused_webpack_module, __webpack_exports__2, __webpack_require__2) => {
            __webpack_require__2.r(__webpack_exports__2);
            __webpack_require__2.d(__webpack_exports__2, {
              "Md5": () => Md5
            });
            var Md5 = function() {
              function Md52() {
              }
              Md52.AddUnsigned = function(lX, lY) {
                var lX4, lY4, lX8, lY8, lResult;
                lX8 = lX & 2147483648;
                lY8 = lY & 2147483648;
                lX4 = lX & 1073741824;
                lY4 = lY & 1073741824;
                lResult = (lX & 1073741823) + (lY & 1073741823);
                if (!!(lX4 & lY4)) {
                  return lResult ^ 2147483648 ^ lX8 ^ lY8;
                }
                if (!!(lX4 | lY4)) {
                  if (!!(lResult & 1073741824)) {
                    return lResult ^ 3221225472 ^ lX8 ^ lY8;
                  } else {
                    return lResult ^ 1073741824 ^ lX8 ^ lY8;
                  }
                } else {
                  return lResult ^ lX8 ^ lY8;
                }
              };
              Md52.FF = function(a, b, c, d, x, s, ac) {
                a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.F(b, c, d), x), ac));
                return this.AddUnsigned(this.RotateLeft(a, s), b);
              };
              Md52.GG = function(a, b, c, d, x, s, ac) {
                a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.G(b, c, d), x), ac));
                return this.AddUnsigned(this.RotateLeft(a, s), b);
              };
              Md52.HH = function(a, b, c, d, x, s, ac) {
                a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.H(b, c, d), x), ac));
                return this.AddUnsigned(this.RotateLeft(a, s), b);
              };
              Md52.II = function(a, b, c, d, x, s, ac) {
                a = this.AddUnsigned(a, this.AddUnsigned(this.AddUnsigned(this.I(b, c, d), x), ac));
                return this.AddUnsigned(this.RotateLeft(a, s), b);
              };
              Md52.ConvertToWordArray = function(string2) {
                var lWordCount, lMessageLength = string2.length, lNumberOfWords_temp1 = lMessageLength + 8, lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64, lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16, lWordArray = Array(lNumberOfWords - 1), lBytePosition = 0, lByteCount = 0;
                while (lByteCount < lMessageLength) {
                  lWordCount = (lByteCount - lByteCount % 4) / 4;
                  lBytePosition = lByteCount % 4 * 8;
                  lWordArray[lWordCount] = lWordArray[lWordCount] | string2.charCodeAt(lByteCount) << lBytePosition;
                  lByteCount++;
                }
                lWordCount = (lByteCount - lByteCount % 4) / 4;
                lBytePosition = lByteCount % 4 * 8;
                lWordArray[lWordCount] = lWordArray[lWordCount] | 128 << lBytePosition;
                lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
                lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
                return lWordArray;
              };
              Md52.WordToHex = function(lValue) {
                var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
                for (lCount = 0; lCount <= 3; lCount++) {
                  lByte = lValue >>> lCount * 8 & 255;
                  WordToHexValue_temp = "0" + lByte.toString(16);
                  WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
                }
                return WordToHexValue;
              };
              Md52.Utf8Encode = function(string2) {
                var utftext = "", c;
                string2 = string2.replace(/\r\n/g, "\n");
                for (var n = 0; n < string2.length; n++) {
                  c = string2.charCodeAt(n);
                  if (c < 128) {
                    utftext += String.fromCharCode(c);
                  } else if (c > 127 && c < 2048) {
                    utftext += String.fromCharCode(c >> 6 | 192);
                    utftext += String.fromCharCode(c & 63 | 128);
                  } else {
                    utftext += String.fromCharCode(c >> 12 | 224);
                    utftext += String.fromCharCode(c >> 6 & 63 | 128);
                    utftext += String.fromCharCode(c & 63 | 128);
                  }
                }
                return utftext;
              };
              Md52.init = function(string2) {
                var temp;
                if (typeof string2 !== "string")
                  string2 = JSON.stringify(string2);
                this._string = this.Utf8Encode(string2);
                this.x = this.ConvertToWordArray(this._string);
                this.a = 1732584193;
                this.b = 4023233417;
                this.c = 2562383102;
                this.d = 271733878;
                for (this.k = 0; this.k < this.x.length; this.k += 16) {
                  this.AA = this.a;
                  this.BB = this.b;
                  this.CC = this.c;
                  this.DD = this.d;
                  this.a = this.FF(this.a, this.b, this.c, this.d, this.x[this.k], this.S11, 3614090360);
                  this.d = this.FF(this.d, this.a, this.b, this.c, this.x[this.k + 1], this.S12, 3905402710);
                  this.c = this.FF(this.c, this.d, this.a, this.b, this.x[this.k + 2], this.S13, 606105819);
                  this.b = this.FF(this.b, this.c, this.d, this.a, this.x[this.k + 3], this.S14, 3250441966);
                  this.a = this.FF(this.a, this.b, this.c, this.d, this.x[this.k + 4], this.S11, 4118548399);
                  this.d = this.FF(this.d, this.a, this.b, this.c, this.x[this.k + 5], this.S12, 1200080426);
                  this.c = this.FF(this.c, this.d, this.a, this.b, this.x[this.k + 6], this.S13, 2821735955);
                  this.b = this.FF(this.b, this.c, this.d, this.a, this.x[this.k + 7], this.S14, 4249261313);
                  this.a = this.FF(this.a, this.b, this.c, this.d, this.x[this.k + 8], this.S11, 1770035416);
                  this.d = this.FF(this.d, this.a, this.b, this.c, this.x[this.k + 9], this.S12, 2336552879);
                  this.c = this.FF(this.c, this.d, this.a, this.b, this.x[this.k + 10], this.S13, 4294925233);
                  this.b = this.FF(this.b, this.c, this.d, this.a, this.x[this.k + 11], this.S14, 2304563134);
                  this.a = this.FF(this.a, this.b, this.c, this.d, this.x[this.k + 12], this.S11, 1804603682);
                  this.d = this.FF(this.d, this.a, this.b, this.c, this.x[this.k + 13], this.S12, 4254626195);
                  this.c = this.FF(this.c, this.d, this.a, this.b, this.x[this.k + 14], this.S13, 2792965006);
                  this.b = this.FF(this.b, this.c, this.d, this.a, this.x[this.k + 15], this.S14, 1236535329);
                  this.a = this.GG(this.a, this.b, this.c, this.d, this.x[this.k + 1], this.S21, 4129170786);
                  this.d = this.GG(this.d, this.a, this.b, this.c, this.x[this.k + 6], this.S22, 3225465664);
                  this.c = this.GG(this.c, this.d, this.a, this.b, this.x[this.k + 11], this.S23, 643717713);
                  this.b = this.GG(this.b, this.c, this.d, this.a, this.x[this.k], this.S24, 3921069994);
                  this.a = this.GG(this.a, this.b, this.c, this.d, this.x[this.k + 5], this.S21, 3593408605);
                  this.d = this.GG(this.d, this.a, this.b, this.c, this.x[this.k + 10], this.S22, 38016083);
                  this.c = this.GG(this.c, this.d, this.a, this.b, this.x[this.k + 15], this.S23, 3634488961);
                  this.b = this.GG(this.b, this.c, this.d, this.a, this.x[this.k + 4], this.S24, 3889429448);
                  this.a = this.GG(this.a, this.b, this.c, this.d, this.x[this.k + 9], this.S21, 568446438);
                  this.d = this.GG(this.d, this.a, this.b, this.c, this.x[this.k + 14], this.S22, 3275163606);
                  this.c = this.GG(this.c, this.d, this.a, this.b, this.x[this.k + 3], this.S23, 4107603335);
                  this.b = this.GG(this.b, this.c, this.d, this.a, this.x[this.k + 8], this.S24, 1163531501);
                  this.a = this.GG(this.a, this.b, this.c, this.d, this.x[this.k + 13], this.S21, 2850285829);
                  this.d = this.GG(this.d, this.a, this.b, this.c, this.x[this.k + 2], this.S22, 4243563512);
                  this.c = this.GG(this.c, this.d, this.a, this.b, this.x[this.k + 7], this.S23, 1735328473);
                  this.b = this.GG(this.b, this.c, this.d, this.a, this.x[this.k + 12], this.S24, 2368359562);
                  this.a = this.HH(this.a, this.b, this.c, this.d, this.x[this.k + 5], this.S31, 4294588738);
                  this.d = this.HH(this.d, this.a, this.b, this.c, this.x[this.k + 8], this.S32, 2272392833);
                  this.c = this.HH(this.c, this.d, this.a, this.b, this.x[this.k + 11], this.S33, 1839030562);
                  this.b = this.HH(this.b, this.c, this.d, this.a, this.x[this.k + 14], this.S34, 4259657740);
                  this.a = this.HH(this.a, this.b, this.c, this.d, this.x[this.k + 1], this.S31, 2763975236);
                  this.d = this.HH(this.d, this.a, this.b, this.c, this.x[this.k + 4], this.S32, 1272893353);
                  this.c = this.HH(this.c, this.d, this.a, this.b, this.x[this.k + 7], this.S33, 4139469664);
                  this.b = this.HH(this.b, this.c, this.d, this.a, this.x[this.k + 10], this.S34, 3200236656);
                  this.a = this.HH(this.a, this.b, this.c, this.d, this.x[this.k + 13], this.S31, 681279174);
                  this.d = this.HH(this.d, this.a, this.b, this.c, this.x[this.k], this.S32, 3936430074);
                  this.c = this.HH(this.c, this.d, this.a, this.b, this.x[this.k + 3], this.S33, 3572445317);
                  this.b = this.HH(this.b, this.c, this.d, this.a, this.x[this.k + 6], this.S34, 76029189);
                  this.a = this.HH(this.a, this.b, this.c, this.d, this.x[this.k + 9], this.S31, 3654602809);
                  this.d = this.HH(this.d, this.a, this.b, this.c, this.x[this.k + 12], this.S32, 3873151461);
                  this.c = this.HH(this.c, this.d, this.a, this.b, this.x[this.k + 15], this.S33, 530742520);
                  this.b = this.HH(this.b, this.c, this.d, this.a, this.x[this.k + 2], this.S34, 3299628645);
                  this.a = this.II(this.a, this.b, this.c, this.d, this.x[this.k], this.S41, 4096336452);
                  this.d = this.II(this.d, this.a, this.b, this.c, this.x[this.k + 7], this.S42, 1126891415);
                  this.c = this.II(this.c, this.d, this.a, this.b, this.x[this.k + 14], this.S43, 2878612391);
                  this.b = this.II(this.b, this.c, this.d, this.a, this.x[this.k + 5], this.S44, 4237533241);
                  this.a = this.II(this.a, this.b, this.c, this.d, this.x[this.k + 12], this.S41, 1700485571);
                  this.d = this.II(this.d, this.a, this.b, this.c, this.x[this.k + 3], this.S42, 2399980690);
                  this.c = this.II(this.c, this.d, this.a, this.b, this.x[this.k + 10], this.S43, 4293915773);
                  this.b = this.II(this.b, this.c, this.d, this.a, this.x[this.k + 1], this.S44, 2240044497);
                  this.a = this.II(this.a, this.b, this.c, this.d, this.x[this.k + 8], this.S41, 1873313359);
                  this.d = this.II(this.d, this.a, this.b, this.c, this.x[this.k + 15], this.S42, 4264355552);
                  this.c = this.II(this.c, this.d, this.a, this.b, this.x[this.k + 6], this.S43, 2734768916);
                  this.b = this.II(this.b, this.c, this.d, this.a, this.x[this.k + 13], this.S44, 1309151649);
                  this.a = this.II(this.a, this.b, this.c, this.d, this.x[this.k + 4], this.S41, 4149444226);
                  this.d = this.II(this.d, this.a, this.b, this.c, this.x[this.k + 11], this.S42, 3174756917);
                  this.c = this.II(this.c, this.d, this.a, this.b, this.x[this.k + 2], this.S43, 718787259);
                  this.b = this.II(this.b, this.c, this.d, this.a, this.x[this.k + 9], this.S44, 3951481745);
                  this.a = this.AddUnsigned(this.a, this.AA);
                  this.b = this.AddUnsigned(this.b, this.BB);
                  this.c = this.AddUnsigned(this.c, this.CC);
                  this.d = this.AddUnsigned(this.d, this.DD);
                }
                temp = this.WordToHex(this.a) + this.WordToHex(this.b) + this.WordToHex(this.c) + this.WordToHex(this.d);
                return temp.toLowerCase();
              };
              Md52.x = Array();
              Md52.S11 = 7;
              Md52.S12 = 12;
              Md52.S13 = 17;
              Md52.S14 = 22;
              Md52.S21 = 5;
              Md52.S22 = 9;
              Md52.S23 = 14;
              Md52.S24 = 20;
              Md52.S31 = 4;
              Md52.S32 = 11;
              Md52.S33 = 16;
              Md52.S34 = 23;
              Md52.S41 = 6;
              Md52.S42 = 10;
              Md52.S43 = 15;
              Md52.S44 = 21;
              Md52.RotateLeft = function(lValue, iShiftBits) {
                return lValue << iShiftBits | lValue >>> 32 - iShiftBits;
              };
              Md52.F = function(x, y, z) {
                return x & y | ~x & z;
              };
              Md52.G = function(x, y, z) {
                return x & z | y & ~z;
              };
              Md52.H = function(x, y, z) {
                return x ^ y ^ z;
              };
              Md52.I = function(x, y, z) {
                return y ^ (x | ~z);
              };
              return Md52;
            }();
          },
          271: function(module3, exports2) {
            var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
            (function(root2, factory2) {
              {
                !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory2, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports2, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module3.exports = __WEBPACK_AMD_DEFINE_RESULT__));
              }
            })(this, function() {
              var hasOwnProperty2 = Object.prototype.hasOwnProperty;
              var toString2 = Object.prototype.toString;
              var hasSticky = typeof new RegExp().sticky === "boolean";
              function isRegExp(o) {
                return o && toString2.call(o) === "[object RegExp]";
              }
              function isObject2(o) {
                return o && typeof o === "object" && !isRegExp(o) && !Array.isArray(o);
              }
              function reEscape(s) {
                return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
              }
              function reGroups(s) {
                var re = new RegExp("|" + s);
                return re.exec("").length - 1;
              }
              function reCapture(s) {
                return "(" + s + ")";
              }
              function reUnion(regexps) {
                if (!regexps.length)
                  return "(?!)";
                var source = regexps.map(function(s) {
                  return "(?:" + s + ")";
                }).join("|");
                return "(?:" + source + ")";
              }
              function regexpOrLiteral(obj) {
                if (typeof obj === "string") {
                  return "(?:" + reEscape(obj) + ")";
                } else if (isRegExp(obj)) {
                  if (obj.ignoreCase)
                    throw new Error("RegExp /i flag not allowed");
                  if (obj.global)
                    throw new Error("RegExp /g flag is implied");
                  if (obj.sticky)
                    throw new Error("RegExp /y flag is implied");
                  if (obj.multiline)
                    throw new Error("RegExp /m flag is implied");
                  return obj.source;
                } else {
                  throw new Error("Not a pattern: " + obj);
                }
              }
              function objectToRules(object2) {
                var keys2 = Object.getOwnPropertyNames(object2);
                var result = [];
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  var thing = object2[key];
                  var rules = [].concat(thing);
                  if (key === "include") {
                    for (var j = 0; j < rules.length; j++) {
                      result.push({ include: rules[j] });
                    }
                    continue;
                  }
                  var match = [];
                  rules.forEach(function(rule) {
                    if (isObject2(rule)) {
                      if (match.length)
                        result.push(ruleOptions(key, match));
                      result.push(ruleOptions(key, rule));
                      match = [];
                    } else {
                      match.push(rule);
                    }
                  });
                  if (match.length)
                    result.push(ruleOptions(key, match));
                }
                return result;
              }
              function arrayToRules(array) {
                var result = [];
                for (var i = 0; i < array.length; i++) {
                  var obj = array[i];
                  if (obj.include) {
                    var include = [].concat(obj.include);
                    for (var j = 0; j < include.length; j++) {
                      result.push({ include: include[j] });
                    }
                    continue;
                  }
                  if (!obj.type) {
                    throw new Error("Rule has no type: " + JSON.stringify(obj));
                  }
                  result.push(ruleOptions(obj.type, obj));
                }
                return result;
              }
              function ruleOptions(type2, obj) {
                if (!isObject2(obj)) {
                  obj = { match: obj };
                }
                if (obj.include) {
                  throw new Error("Matching rules cannot also include states");
                }
                var options = {
                  defaultType: type2,
                  lineBreaks: !!obj.error || !!obj.fallback,
                  pop: false,
                  next: null,
                  push: null,
                  error: false,
                  fallback: false,
                  value: null,
                  type: null,
                  shouldThrow: false
                };
                for (var key in obj) {
                  if (hasOwnProperty2.call(obj, key)) {
                    options[key] = obj[key];
                  }
                }
                if (typeof options.type === "string" && type2 !== options.type) {
                  throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type2 + "')");
                }
                var match = options.match;
                options.match = Array.isArray(match) ? match : match ? [match] : [];
                options.match.sort(function(a, b) {
                  return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
                });
                return options;
              }
              function toRules(spec) {
                return Array.isArray(spec) ? arrayToRules(spec) : objectToRules(spec);
              }
              var defaultErrorRule = ruleOptions("error", { lineBreaks: true, shouldThrow: true });
              function compileRules(rules, hasStates) {
                var errorRule = null;
                var fast = /* @__PURE__ */ Object.create(null);
                var fastAllowed = true;
                var unicodeFlag = null;
                var groups = [];
                var parts = [];
                for (var i = 0; i < rules.length; i++) {
                  if (rules[i].fallback) {
                    fastAllowed = false;
                  }
                }
                for (var i = 0; i < rules.length; i++) {
                  var options = rules[i];
                  if (options.include) {
                    throw new Error("Inheritance is not allowed in stateless lexers");
                  }
                  if (options.error || options.fallback) {
                    if (errorRule) {
                      if (!options.fallback === !errorRule.fallback) {
                        throw new Error("Multiple " + (options.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options.defaultType + "')");
                      } else {
                        throw new Error("fallback and error are mutually exclusive (for token '" + options.defaultType + "')");
                      }
                    }
                    errorRule = options;
                  }
                  var match = options.match.slice();
                  if (fastAllowed) {
                    while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                      var word = match.shift();
                      fast[word.charCodeAt(0)] = options;
                    }
                  }
                  if (options.pop || options.push || options.next) {
                    if (!hasStates) {
                      throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options.defaultType + "')");
                    }
                    if (options.fallback) {
                      throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options.defaultType + "')");
                    }
                  }
                  if (match.length === 0) {
                    continue;
                  }
                  fastAllowed = false;
                  groups.push(options);
                  for (var j = 0; j < match.length; j++) {
                    var obj = match[j];
                    if (!isRegExp(obj)) {
                      continue;
                    }
                    if (unicodeFlag === null) {
                      unicodeFlag = obj.unicode;
                    } else if (unicodeFlag !== obj.unicode && options.fallback === false) {
                      throw new Error("If one rule is /u then all must be");
                    }
                  }
                  var pat = reUnion(match.map(regexpOrLiteral));
                  var regexp = new RegExp(pat);
                  if (regexp.test("")) {
                    throw new Error("RegExp matches empty string: " + regexp);
                  }
                  var groupCount = reGroups(pat);
                  if (groupCount > 0) {
                    throw new Error("RegExp has capture groups: " + regexp + "\nUse (?: \u2026 ) instead");
                  }
                  if (!options.lineBreaks && regexp.test("\n")) {
                    throw new Error("Rule should declare lineBreaks: " + regexp);
                  }
                  parts.push(reCapture(pat));
                }
                var fallbackRule = errorRule && errorRule.fallback;
                var flags = hasSticky && !fallbackRule ? "ym" : "gm";
                var suffix = hasSticky || fallbackRule ? "" : "|";
                if (unicodeFlag === true)
                  flags += "u";
                var combined = new RegExp(reUnion(parts) + suffix, flags);
                return { regexp: combined, groups, fast, error: errorRule || defaultErrorRule };
              }
              function compile(rules) {
                var result = compileRules(toRules(rules));
                return new Lexer({ start: result }, "start");
              }
              function checkStateGroup(g, name, map) {
                var state = g && (g.push || g.next);
                if (state && !map[state]) {
                  throw new Error("Missing state '" + state + "' (in token '" + g.defaultType + "' of state '" + name + "')");
                }
                if (g && g.pop && +g.pop !== 1) {
                  throw new Error("pop must be 1 (in token '" + g.defaultType + "' of state '" + name + "')");
                }
              }
              function compileStates(states, start) {
                var all = states.$all ? toRules(states.$all) : [];
                delete states.$all;
                var keys2 = Object.getOwnPropertyNames(states);
                if (!start)
                  start = keys2[0];
                var ruleMap = /* @__PURE__ */ Object.create(null);
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  ruleMap[key] = toRules(states[key]).concat(all);
                }
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  var rules = ruleMap[key];
                  var included = /* @__PURE__ */ Object.create(null);
                  for (var j = 0; j < rules.length; j++) {
                    var rule = rules[j];
                    if (!rule.include)
                      continue;
                    var splice2 = [j, 1];
                    if (rule.include !== key && !included[rule.include]) {
                      included[rule.include] = true;
                      var newRules = ruleMap[rule.include];
                      if (!newRules) {
                        throw new Error("Cannot include nonexistent state '" + rule.include + "' (in state '" + key + "')");
                      }
                      for (var k = 0; k < newRules.length; k++) {
                        var newRule = newRules[k];
                        if (rules.indexOf(newRule) !== -1)
                          continue;
                        splice2.push(newRule);
                      }
                    }
                    rules.splice.apply(rules, splice2);
                    j--;
                  }
                }
                var map = /* @__PURE__ */ Object.create(null);
                for (var i = 0; i < keys2.length; i++) {
                  var key = keys2[i];
                  map[key] = compileRules(ruleMap[key], true);
                }
                for (var i = 0; i < keys2.length; i++) {
                  var name = keys2[i];
                  var state = map[name];
                  var groups = state.groups;
                  for (var j = 0; j < groups.length; j++) {
                    checkStateGroup(groups[j], name, map);
                  }
                  var fastKeys = Object.getOwnPropertyNames(state.fast);
                  for (var j = 0; j < fastKeys.length; j++) {
                    checkStateGroup(state.fast[fastKeys[j]], name, map);
                  }
                }
                return new Lexer(map, start);
              }
              function keywordTransform(map) {
                var reverseMap = /* @__PURE__ */ Object.create(null);
                var byLength = /* @__PURE__ */ Object.create(null);
                var types2 = Object.getOwnPropertyNames(map);
                for (var i = 0; i < types2.length; i++) {
                  var tokenType = types2[i];
                  var item = map[tokenType];
                  var keywordList = Array.isArray(item) ? item : [item];
                  keywordList.forEach(function(keyword) {
                    (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword);
                    if (typeof keyword !== "string") {
                      throw new Error("keyword must be string (in keyword '" + tokenType + "')");
                    }
                    reverseMap[keyword] = tokenType;
                  });
                }
                function str(x) {
                  return JSON.stringify(x);
                }
                var source = "";
                source += "switch (value.length) {\n";
                for (var length in byLength) {
                  var keywords = byLength[length];
                  source += "case " + length + ":\n";
                  source += "switch (value) {\n";
                  keywords.forEach(function(keyword) {
                    var tokenType2 = reverseMap[keyword];
                    source += "case " + str(keyword) + ": return " + str(tokenType2) + "\n";
                  });
                  source += "}\n";
                }
                source += "}\n";
                return Function("value", source);
              }
              var Lexer = function(states, state) {
                this.startState = state;
                this.states = states;
                this.buffer = "";
                this.stack = [];
                this.reset();
              };
              Lexer.prototype.reset = function(data, info) {
                this.buffer = data || "";
                this.index = 0;
                this.line = info ? info.line : 1;
                this.col = info ? info.col : 1;
                this.queuedToken = info ? info.queuedToken : null;
                this.queuedThrow = info ? info.queuedThrow : null;
                this.setState(info ? info.state : this.startState);
                this.stack = info && info.stack ? info.stack.slice() : [];
                return this;
              };
              Lexer.prototype.save = function() {
                return {
                  line: this.line,
                  col: this.col,
                  state: this.state,
                  stack: this.stack.slice(),
                  queuedToken: this.queuedToken,
                  queuedThrow: this.queuedThrow
                };
              };
              Lexer.prototype.setState = function(state) {
                if (!state || this.state === state)
                  return;
                this.state = state;
                var info = this.states[state];
                this.groups = info.groups;
                this.error = info.error;
                this.re = info.regexp;
                this.fast = info.fast;
              };
              Lexer.prototype.popState = function() {
                this.setState(this.stack.pop());
              };
              Lexer.prototype.pushState = function(state) {
                this.stack.push(this.state);
                this.setState(state);
              };
              var eat = hasSticky ? function(re, buffer) {
                return re.exec(buffer);
              } : function(re, buffer) {
                var match = re.exec(buffer);
                if (match[0].length === 0) {
                  return null;
                }
                return match;
              };
              Lexer.prototype._getGroup = function(match) {
                var groupCount = this.groups.length;
                for (var i = 0; i < groupCount; i++) {
                  if (match[i + 1] !== void 0) {
                    return this.groups[i];
                  }
                }
                throw new Error("Cannot find token type for matched text");
              };
              function tokenToString() {
                return this.value;
              }
              Lexer.prototype.next = function() {
                var index = this.index;
                if (this.queuedGroup) {
                  var token = this._token(this.queuedGroup, this.queuedText, index);
                  this.queuedGroup = null;
                  this.queuedText = "";
                  return token;
                }
                var buffer = this.buffer;
                if (index === buffer.length) {
                  return;
                }
                var group = this.fast[buffer.charCodeAt(index)];
                if (group) {
                  return this._token(group, buffer.charAt(index), index);
                }
                var re = this.re;
                re.lastIndex = index;
                var match = eat(re, buffer);
                var error = this.error;
                if (match == null) {
                  return this._token(error, buffer.slice(index, buffer.length), index);
                }
                var group = this._getGroup(match);
                var text = match[0];
                if (error.fallback && match.index !== index) {
                  this.queuedGroup = group;
                  this.queuedText = text;
                  return this._token(error, buffer.slice(index, match.index), index);
                }
                return this._token(group, text, index);
              };
              Lexer.prototype._token = function(group, text, offset) {
                var lineBreaks = 0;
                if (group.lineBreaks) {
                  var matchNL = /\n/g;
                  var nl = 1;
                  if (text === "\n") {
                    lineBreaks = 1;
                  } else {
                    while (matchNL.exec(text)) {
                      lineBreaks++;
                      nl = matchNL.lastIndex;
                    }
                  }
                }
                var token = {
                  type: typeof group.type === "function" && group.type(text) || group.defaultType,
                  value: typeof group.value === "function" ? group.value(text) : text,
                  text,
                  toString: tokenToString,
                  offset,
                  lineBreaks,
                  line: this.line,
                  col: this.col
                };
                var size = text.length;
                this.index += size;
                this.line += lineBreaks;
                if (lineBreaks !== 0) {
                  this.col = size - nl + 1;
                } else {
                  this.col += size;
                }
                if (group.shouldThrow) {
                  throw new Error(this.formatError(token, "invalid syntax"));
                }
                if (group.pop)
                  this.popState();
                else if (group.push)
                  this.pushState(group.push);
                else if (group.next)
                  this.setState(group.next);
                return token;
              };
              if (typeof Symbol !== "undefined" && Symbol.iterator) {
                var LexerIterator = function(lexer) {
                  this.lexer = lexer;
                };
                LexerIterator.prototype.next = function() {
                  var token = this.lexer.next();
                  return { value: token, done: !token };
                };
                LexerIterator.prototype[Symbol.iterator] = function() {
                  return this;
                };
                Lexer.prototype[Symbol.iterator] = function() {
                  return new LexerIterator(this);
                };
              }
              Lexer.prototype.formatError = function(token, message2) {
                if (token == null) {
                  var text = this.buffer.slice(this.index);
                  var token = {
                    text,
                    offset: this.index,
                    lineBreaks: text.indexOf("\n") === -1 ? 0 : 1,
                    line: this.line,
                    col: this.col
                  };
                }
                var start = Math.max(0, token.offset - token.col + 1);
                var eol = token.lineBreaks ? token.text.indexOf("\n") : token.text.length;
                var firstLine = this.buffer.substring(start, token.offset + eol);
                message2 += " at line " + token.line + " col " + token.col + ":\n\n";
                message2 += "  " + firstLine + "\n";
                message2 += "  " + Array(token.col).join(" ") + "^";
                return message2;
              };
              Lexer.prototype.clone = function() {
                return new Lexer(this.states, this.state);
              };
              Lexer.prototype.has = function(tokenType) {
                return true;
              };
              return {
                compile,
                states: compileStates,
                error: Object.freeze({ error: true }),
                fallback: Object.freeze({ fallback: true }),
                keywords: keywordTransform
              };
            });
          },
          558: (module3, __unused_webpack_exports, __webpack_require__2) => {
            (function() {
              function id(x) {
                return x[0];
              }
              const moo = __webpack_require__2(271);
              const lexer = moo.compile({
                space: { match: /\s+/, lineBreaks: true },
                number: /-?(?:[0-9]|[1-9][0-9]+)(?:\.[0-9]+)?(?:[eE][-+]?[0-9]+)?\b/,
                comment: /#[^\n]*/,
                "[": "[",
                "]": "]",
                assignment: /=[^\n]*/,
                fieldOrType: /[a-zA-Z_][a-zA-Z0-9_]*(?:\/[a-zA-Z][a-zA-Z0-9_]*)?/
              });
              function extend(objs) {
                return objs.reduce((r, p) => ({ ...r, ...p }), {});
              }
              var grammar = {
                Lexer: lexer,
                ParserRules: [
                  { "name": "main$ebnf$1", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$1", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "boolType", "arrayType", "__", "field", "_", "main$ebnf$1", "simple"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$2", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$2", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "bigintType", "arrayType", "__", "field", "_", "main$ebnf$2", "simple"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$3", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$3", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "numericType", "arrayType", "__", "field", "_", "main$ebnf$3", "simple"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$4", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$4", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "stringType", "arrayType", "__", "field", "_", "main$ebnf$4", "simple"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$5", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$5", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "timeType", "arrayType", "__", "field", "_", "main$ebnf$5", "simple"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$6", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$6", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "customType", "arrayType", "__", "field", "_", "main$ebnf$6", "complex"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$7", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$7", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "boolType", "__", "constantField", "_", "boolConstantValue", "_", "main$ebnf$7"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$8", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$8", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "bigintType", "__", "constantField", "_", "bigintConstantValue", "_", "main$ebnf$8"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$9", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$9", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "numericType", "__", "constantField", "_", "numericConstantValue", "_", "main$ebnf$9"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main$ebnf$10", "symbols": ["comment"], "postprocess": id },
                  { "name": "main$ebnf$10", "symbols": [], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["_", "stringType", "__", "constantField", "_", "stringConstantValue", "_", "main$ebnf$10"], "postprocess": function(d) {
                    return extend(d);
                  } },
                  { "name": "main", "symbols": ["comment"], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "main", "symbols": ["blankLine"], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "boolType", "symbols": [{ "literal": "bool" }], "postprocess": function(d) {
                    return { type: d[0].value };
                  } },
                  { "name": "bigintType$subexpression$1", "symbols": [{ "literal": "int64" }] },
                  { "name": "bigintType$subexpression$1", "symbols": [{ "literal": "uint64" }] },
                  { "name": "bigintType", "symbols": ["bigintType$subexpression$1"], "postprocess": function(d) {
                    return { type: d[0][0].value };
                  } },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "byte" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "char" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "float32" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "float64" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int8" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint8" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int16" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint16" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "int32" }] },
                  { "name": "numericType$subexpression$1", "symbols": [{ "literal": "uint32" }] },
                  { "name": "numericType", "symbols": ["numericType$subexpression$1"], "postprocess": function(d) {
                    return { type: d[0][0].value };
                  } },
                  { "name": "stringType", "symbols": [{ "literal": "string" }], "postprocess": function(d) {
                    return { type: d[0].value };
                  } },
                  { "name": "timeType$subexpression$1", "symbols": [{ "literal": "time" }] },
                  { "name": "timeType$subexpression$1", "symbols": [{ "literal": "duration" }] },
                  { "name": "timeType", "symbols": ["timeType$subexpression$1"], "postprocess": function(d) {
                    return { type: d[0][0].value };
                  } },
                  { "name": "customType", "symbols": [lexer.has("fieldOrType") ? { type: "fieldOrType" } : fieldOrType], "postprocess": function(d, _, reject) {
                    const PRIMITIVE_TYPES = ["bool", "byte", "char", "float32", "float64", "int8", "uint8", "int16", "uint16", "int32", "uint32", "int64", "uint64", "string", "time", "duration"];
                    const type2 = d[0].value;
                    if (PRIMITIVE_TYPES.includes(type2))
                      return reject;
                    return { type: type2 };
                  } },
                  { "name": "arrayType", "symbols": [{ "literal": "[" }, "_", { "literal": "]" }], "postprocess": function(d) {
                    return { isArray: true };
                  } },
                  { "name": "arrayType", "symbols": [{ "literal": "[" }, "_", "number", "_", { "literal": "]" }], "postprocess": function(d) {
                    return { isArray: true, arrayLength: d[2] };
                  } },
                  { "name": "arrayType", "symbols": ["_"], "postprocess": function(d) {
                    return { isArray: false };
                  } },
                  { "name": "field", "symbols": [lexer.has("fieldOrType") ? { type: "fieldOrType" } : fieldOrType], "postprocess": function(d, _, reject) {
                    const name = d[0].value;
                    if (name.match(/^[a-zA-Z][a-zA-Z0-9_]*$/) == void 0)
                      return reject;
                    return { name };
                  } },
                  { "name": "constantField", "symbols": [lexer.has("fieldOrType") ? { type: "fieldOrType" } : fieldOrType], "postprocess": function(d, _, reject) {
                    const name = d[0].value;
                    if (name.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/) == void 0)
                      return reject;
                    return { name, isConstant: true };
                  } },
                  { "name": "boolConstantValue", "symbols": ["assignment"], "postprocess": function(d, _, reject) {
                    const valueText = d[0].split("#")[0].trim();
                    if (valueText === "True" || valueText === "1")
                      return { value: true, valueText };
                    if (valueText === "False" || valueText === "0")
                      return { value: false, valueText };
                    return reject;
                  } },
                  { "name": "numericConstantValue", "symbols": ["assignment"], "postprocess": function(d, _, reject) {
                    const valueText = d[0].split("#")[0].trim();
                    const value = parseFloat(valueText);
                    return !isNaN(value) ? { value, valueText } : reject;
                  } },
                  { "name": "bigintConstantValue", "symbols": ["assignment"], "postprocess": function(d, _, reject) {
                    const valueText = d[0].split("#")[0].trim();
                    try {
                      const value = BigInt(valueText);
                      return { value, valueText };
                    } catch {
                      return reject;
                    }
                  } },
                  { "name": "stringConstantValue", "symbols": ["assignment"], "postprocess": function(d) {
                    return { value: d[0], valueText: d[0] };
                  } },
                  { "name": "bool$subexpression$1", "symbols": [{ "literal": "True" }] },
                  { "name": "bool$subexpression$1", "symbols": [{ "literal": "1" }] },
                  { "name": "bool", "symbols": ["bool$subexpression$1"], "postprocess": function(d) {
                    return true;
                  } },
                  { "name": "bool$subexpression$2", "symbols": [{ "literal": "False" }] },
                  { "name": "bool$subexpression$2", "symbols": [{ "literal": "0" }] },
                  { "name": "bool", "symbols": ["bool$subexpression$2"], "postprocess": function(d) {
                    return false;
                  } },
                  { "name": "number", "symbols": [lexer.has("number") ? { type: "number" } : number], "postprocess": function(d) {
                    return parseFloat(d[0].value);
                  } },
                  { "name": "assignment", "symbols": [lexer.has("assignment") ? { type: "assignment" } : assignment], "postprocess": function(d) {
                    return d[0].value.substr(1).trim();
                  } },
                  { "name": "comment", "symbols": [lexer.has("comment") ? { type: "comment" } : comment], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "blankLine", "symbols": ["_"], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "_$subexpression$1", "symbols": [] },
                  { "name": "_$subexpression$1", "symbols": [lexer.has("space") ? { type: "space" } : space] },
                  { "name": "_", "symbols": ["_$subexpression$1"], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "__", "symbols": [lexer.has("space") ? { type: "space" } : space], "postprocess": function(d) {
                    return null;
                  } },
                  { "name": "simple", "symbols": [], "postprocess": function() {
                    return { isComplex: false };
                  } },
                  { "name": "complex", "symbols": [], "postprocess": function() {
                    return { isComplex: true };
                  } }
                ],
                ParserStart: "main"
              };
              if (typeof module3.exports !== "undefined") {
                module3.exports = grammar;
              } else {
                window.grammar = grammar;
              }
            })();
          },
          654: function(module3) {
            (function(root2, factory2) {
              if (module3.exports) {
                module3.exports = factory2();
              } else {
                root2.nearley = factory2();
              }
            })(this, function() {
              function Rule(name, symbols, postprocess) {
                this.id = ++Rule.highestId;
                this.name = name;
                this.symbols = symbols;
                this.postprocess = postprocess;
                return this;
              }
              Rule.highestId = 0;
              Rule.prototype.toString = function(withCursorAt) {
                var symbolSequence = typeof withCursorAt === "undefined" ? this.symbols.map(getSymbolShortDisplay).join(" ") : this.symbols.slice(0, withCursorAt).map(getSymbolShortDisplay).join(" ") + " \u25CF " + this.symbols.slice(withCursorAt).map(getSymbolShortDisplay).join(" ");
                return this.name + " \u2192 " + symbolSequence;
              };
              function State2(rule, dot, reference, wantedBy) {
                this.rule = rule;
                this.dot = dot;
                this.reference = reference;
                this.data = [];
                this.wantedBy = wantedBy;
                this.isComplete = this.dot === rule.symbols.length;
              }
              State2.prototype.toString = function() {
                return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
              };
              State2.prototype.nextState = function(child) {
                var state = new State2(this.rule, this.dot + 1, this.reference, this.wantedBy);
                state.left = this;
                state.right = child;
                if (state.isComplete) {
                  state.data = state.build();
                  state.right = void 0;
                }
                return state;
              };
              State2.prototype.build = function() {
                var children = [];
                var node = this;
                do {
                  children.push(node.right.data);
                  node = node.left;
                } while (node.left);
                children.reverse();
                return children;
              };
              State2.prototype.finish = function() {
                if (this.rule.postprocess) {
                  this.data = this.rule.postprocess(this.data, this.reference, Parser2.fail);
                }
              };
              function Column(grammar, index) {
                this.grammar = grammar;
                this.index = index;
                this.states = [];
                this.wants = {};
                this.scannable = [];
                this.completed = {};
              }
              Column.prototype.process = function(nextColumn) {
                var states = this.states;
                var wants = this.wants;
                var completed = this.completed;
                for (var w = 0; w < states.length; w++) {
                  var state = states[w];
                  if (state.isComplete) {
                    state.finish();
                    if (state.data !== Parser2.fail) {
                      var wantedBy = state.wantedBy;
                      for (var i = wantedBy.length; i--; ) {
                        var left = wantedBy[i];
                        this.complete(left, state);
                      }
                      if (state.reference === this.index) {
                        var exp = state.rule.name;
                        (this.completed[exp] = this.completed[exp] || []).push(state);
                      }
                    }
                  } else {
                    var exp = state.rule.symbols[state.dot];
                    if (typeof exp !== "string") {
                      this.scannable.push(state);
                      continue;
                    }
                    if (wants[exp]) {
                      wants[exp].push(state);
                      if (completed.hasOwnProperty(exp)) {
                        var nulls = completed[exp];
                        for (var i = 0; i < nulls.length; i++) {
                          var right = nulls[i];
                          this.complete(state, right);
                        }
                      }
                    } else {
                      wants[exp] = [state];
                      this.predict(exp);
                    }
                  }
                }
              };
              Column.prototype.predict = function(exp) {
                var rules = this.grammar.byName[exp] || [];
                for (var i = 0; i < rules.length; i++) {
                  var r = rules[i];
                  var wantedBy = this.wants[exp];
                  var s = new State2(r, 0, this.index, wantedBy);
                  this.states.push(s);
                }
              };
              Column.prototype.complete = function(left, right) {
                var copy = left.nextState(right);
                this.states.push(copy);
              };
              function Grammar(rules, start) {
                this.rules = rules;
                this.start = start || this.rules[0].name;
                var byName = this.byName = {};
                this.rules.forEach(function(rule) {
                  if (!byName.hasOwnProperty(rule.name)) {
                    byName[rule.name] = [];
                  }
                  byName[rule.name].push(rule);
                });
              }
              Grammar.fromCompiled = function(rules, start) {
                var lexer = rules.Lexer;
                if (rules.ParserStart) {
                  start = rules.ParserStart;
                  rules = rules.ParserRules;
                }
                var rules = rules.map(function(r) {
                  return new Rule(r.name, r.symbols, r.postprocess);
                });
                var g = new Grammar(rules, start);
                g.lexer = lexer;
                return g;
              };
              function StreamLexer() {
                this.reset("");
              }
              StreamLexer.prototype.reset = function(data, state) {
                this.buffer = data;
                this.index = 0;
                this.line = state ? state.line : 1;
                this.lastLineBreak = state ? -state.col : 0;
              };
              StreamLexer.prototype.next = function() {
                if (this.index < this.buffer.length) {
                  var ch = this.buffer[this.index++];
                  if (ch === "\n") {
                    this.line += 1;
                    this.lastLineBreak = this.index;
                  }
                  return { value: ch };
                }
              };
              StreamLexer.prototype.save = function() {
                return {
                  line: this.line,
                  col: this.index - this.lastLineBreak
                };
              };
              StreamLexer.prototype.formatError = function(token, message2) {
                var buffer = this.buffer;
                if (typeof buffer === "string") {
                  var lines = buffer.split("\n").slice(
                    Math.max(0, this.line - 5),
                    this.line
                  );
                  var nextLineBreak = buffer.indexOf("\n", this.index);
                  if (nextLineBreak === -1)
                    nextLineBreak = buffer.length;
                  var col = this.index - this.lastLineBreak;
                  var lastLineDigits = String(this.line).length;
                  message2 += " at line " + this.line + " col " + col + ":\n\n";
                  message2 += lines.map(function(line, i) {
                    return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
                  }, this).join("\n");
                  message2 += "\n" + pad("", lastLineDigits + col) + "^\n";
                  return message2;
                } else {
                  return message2 + " at index " + (this.index - 1);
                }
                function pad(n, length) {
                  var s = String(n);
                  return Array(length - s.length + 1).join(" ") + s;
                }
              };
              function Parser2(rules, start, options) {
                if (rules instanceof Grammar) {
                  var grammar = rules;
                  var options = start;
                } else {
                  var grammar = Grammar.fromCompiled(rules, start);
                }
                this.grammar = grammar;
                this.options = {
                  keepHistory: false,
                  lexer: grammar.lexer || new StreamLexer()
                };
                for (var key in options || {}) {
                  this.options[key] = options[key];
                }
                this.lexer = this.options.lexer;
                this.lexerState = void 0;
                var column = new Column(grammar, 0);
                this.table = [column];
                column.wants[grammar.start] = [];
                column.predict(grammar.start);
                column.process();
                this.current = 0;
              }
              Parser2.fail = {};
              Parser2.prototype.feed = function(chunk) {
                var lexer = this.lexer;
                lexer.reset(chunk, this.lexerState);
                var token;
                while (true) {
                  try {
                    token = lexer.next();
                    if (!token) {
                      break;
                    }
                  } catch (e) {
                    var nextColumn = new Column(this.grammar, this.current + 1);
                    this.table.push(nextColumn);
                    var err = new Error(this.reportLexerError(e));
                    err.offset = this.current;
                    err.token = e.token;
                    throw err;
                  }
                  var column = this.table[this.current];
                  if (!this.options.keepHistory) {
                    delete this.table[this.current - 1];
                  }
                  var n = this.current + 1;
                  var nextColumn = new Column(this.grammar, n);
                  this.table.push(nextColumn);
                  var literal = token.text !== void 0 ? token.text : token.value;
                  var value = lexer.constructor === StreamLexer ? token.value : token;
                  var scannable = column.scannable;
                  for (var w = scannable.length; w--; ) {
                    var state = scannable[w];
                    var expect = state.rule.symbols[state.dot];
                    if (expect.test ? expect.test(value) : expect.type ? expect.type === token.type : expect.literal === literal) {
                      var next = state.nextState({ data: value, token, isToken: true, reference: n - 1 });
                      nextColumn.states.push(next);
                    }
                  }
                  nextColumn.process();
                  if (nextColumn.states.length === 0) {
                    var err = new Error(this.reportError(token));
                    err.offset = this.current;
                    err.token = token;
                    throw err;
                  }
                  if (this.options.keepHistory) {
                    column.lexerState = lexer.save();
                  }
                  this.current++;
                }
                if (column) {
                  this.lexerState = lexer.save();
                }
                this.results = this.finish();
                return this;
              };
              Parser2.prototype.reportLexerError = function(lexerError) {
                var tokenDisplay, lexerMessage;
                var token = lexerError.token;
                if (token) {
                  tokenDisplay = "input " + JSON.stringify(token.text[0]) + " (lexer error)";
                  lexerMessage = this.lexer.formatError(token, "Syntax error");
                } else {
                  tokenDisplay = "input (lexer error)";
                  lexerMessage = lexerError.message;
                }
                return this.reportErrorCommon(lexerMessage, tokenDisplay);
              };
              Parser2.prototype.reportError = function(token) {
                var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
                var lexerMessage = this.lexer.formatError(token, "Syntax error");
                return this.reportErrorCommon(lexerMessage, tokenDisplay);
              };
              Parser2.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
                var lines = [];
                lines.push(lexerMessage);
                var lastColumnIndex = this.table.length - 2;
                var lastColumn = this.table[lastColumnIndex];
                var expectantStates = lastColumn.states.filter(function(state) {
                  var nextSymbol = state.rule.symbols[state.dot];
                  return nextSymbol && typeof nextSymbol !== "string";
                });
                if (expectantStates.length === 0) {
                  lines.push("Unexpected " + tokenDisplay + ". I did not expect any more input. Here is the state of my parse table:\n");
                  this.displayStateStack(lastColumn.states, lines);
                } else {
                  lines.push("Unexpected " + tokenDisplay + ". Instead, I was expecting to see one of the following:\n");
                  var stateStacks = expectantStates.map(function(state) {
                    return this.buildFirstStateStack(state, []) || [state];
                  }, this);
                  stateStacks.forEach(function(stateStack) {
                    var state = stateStack[0];
                    var nextSymbol = state.rule.symbols[state.dot];
                    var symbolDisplay = this.getSymbolDisplay(nextSymbol);
                    lines.push("A " + symbolDisplay + " based on:");
                    this.displayStateStack(stateStack, lines);
                  }, this);
                }
                lines.push("");
                return lines.join("\n");
              };
              Parser2.prototype.displayStateStack = function(stateStack, lines) {
                var lastDisplay;
                var sameDisplayCount = 0;
                for (var j = 0; j < stateStack.length; j++) {
                  var state = stateStack[j];
                  var display = state.rule.toString(state.dot);
                  if (display === lastDisplay) {
                    sameDisplayCount++;
                  } else {
                    if (sameDisplayCount > 0) {
                      lines.push("    ^ " + sameDisplayCount + " more lines identical to this");
                    }
                    sameDisplayCount = 0;
                    lines.push("    " + display);
                  }
                  lastDisplay = display;
                }
              };
              Parser2.prototype.getSymbolDisplay = function(symbol) {
                return getSymbolLongDisplay(symbol);
              };
              Parser2.prototype.buildFirstStateStack = function(state, visited) {
                if (visited.indexOf(state) !== -1) {
                  return null;
                }
                if (state.wantedBy.length === 0) {
                  return [state];
                }
                var prevState = state.wantedBy[0];
                var childVisited = [state].concat(visited);
                var childResult = this.buildFirstStateStack(prevState, childVisited);
                if (childResult === null) {
                  return null;
                }
                return [state].concat(childResult);
              };
              Parser2.prototype.save = function() {
                var column = this.table[this.current];
                column.lexerState = this.lexerState;
                return column;
              };
              Parser2.prototype.restore = function(column) {
                var index = column.index;
                this.current = index;
                this.table[index] = column;
                this.table.splice(index + 1);
                this.lexerState = column.lexerState;
                this.results = this.finish();
              };
              Parser2.prototype.rewind = function(index) {
                if (!this.options.keepHistory) {
                  throw new Error("set option `keepHistory` to enable rewinding");
                }
                this.restore(this.table[index]);
              };
              Parser2.prototype.finish = function() {
                var considerations = [];
                var start = this.grammar.start;
                var column = this.table[this.table.length - 1];
                column.states.forEach(function(t) {
                  if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser2.fail) {
                    considerations.push(t);
                  }
                });
                return considerations.map(function(c) {
                  return c.data;
                });
              };
              function getSymbolLongDisplay(symbol) {
                var type2 = typeof symbol;
                if (type2 === "string") {
                  return symbol;
                } else if (type2 === "object") {
                  if (symbol.literal) {
                    return JSON.stringify(symbol.literal);
                  } else if (symbol instanceof RegExp) {
                    return "character matching " + symbol;
                  } else if (symbol.type) {
                    return symbol.type + " token";
                  } else if (symbol.test) {
                    return "token matching " + String(symbol.test);
                  } else {
                    throw new Error("Unknown symbol type: " + symbol);
                  }
                }
              }
              function getSymbolShortDisplay(symbol) {
                var type2 = typeof symbol;
                if (type2 === "string") {
                  return symbol;
                } else if (type2 === "object") {
                  if (symbol.literal) {
                    return JSON.stringify(symbol.literal);
                  } else if (symbol instanceof RegExp) {
                    return symbol.toString();
                  } else if (symbol.type) {
                    return "%" + symbol.type;
                  } else if (symbol.test) {
                    return "<" + String(symbol.test) + ">";
                  } else {
                    throw new Error("Unknown symbol type: " + symbol);
                  }
                }
              }
              return {
                Parser: Parser2,
                Grammar,
                Rule
              };
            });
          },
          515: (__unused_webpack_module, exports2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.buildRos2Type = void 0;
            const TYPE = String.raw`(?<type>[a-zA-Z0-9_/]+)`;
            const STRING_BOUND = String.raw`(?:<=(?<stringBound>\d+))`;
            const ARRAY_BOUND = String.raw`(?:(?<unboundedArray>\[\])|\[(?<arrayLength>\d+)\]|\[<=(?<arrayBound>\d+)\])`;
            const NAME2 = String.raw`(?<name>[a-zA-Z0-9_]+)`;
            const QUOTED_STRING = String.raw`'(?:\\.|[^'\\])*'|"(?:\\.|[^"\\])*"`;
            const COMMENT_TERMINATED_LITERAL = String.raw`(?:${QUOTED_STRING}|(?:\\.|[^\s'"#\\])(?:\\.|[^#\\])*)`;
            const ARRAY_TERMINATED_LITERAL = String.raw`(?:${QUOTED_STRING}|(?:\\.|[^\s'"\],#\\])(?:\\.|[^\],#\\])*)`;
            const CONSTANT_ASSIGNMENT = String.raw`\s*=\s*(?<constantValue>${COMMENT_TERMINATED_LITERAL}?)`;
            const DEFAULT_VALUE_ARRAY = String.raw`\[(?:${ARRAY_TERMINATED_LITERAL},)*${ARRAY_TERMINATED_LITERAL}?\]`;
            const DEFAULT_VALUE = String.raw`(?<defaultValue>${DEFAULT_VALUE_ARRAY}|${COMMENT_TERMINATED_LITERAL})`;
            const COMMENT = String.raw`(?:#.*)`;
            const DEFINITION_LINE_REGEX = new RegExp(String.raw`^${TYPE}${STRING_BOUND}?${ARRAY_BOUND}?\s+${NAME2}(?:${CONSTANT_ASSIGNMENT}|\s+${DEFAULT_VALUE})?\s*${COMMENT}?$`);
            const STRING_ESCAPES = String.raw`\\(?<char>['"abfnrtv\\])|\\(?<oct>[0-7]{1,3})|\\x(?<hex2>[a-fA-F0-9]{2})|\\u(?<hex4>[a-fA-F0-9]{4})|\\U(?<hex8>[a-fA-F0-9]{8})`;
            const BUILTIN_TYPES = [
              "bool",
              "byte",
              "char",
              "float32",
              "float64",
              "int8",
              "uint8",
              "int16",
              "uint16",
              "int32",
              "uint32",
              "int64",
              "uint64",
              "string",
              "wstring",
              "time",
              "duration",
              "builtin_interfaces/Time",
              "builtin_interfaces/Duration",
              "builtin_interfaces/msg/Time",
              "builtin_interfaces/msg/Duration"
            ];
            function parseBigIntLiteral(str, min, max) {
              const value = BigInt(str);
              if (value < min || value > max) {
                throw new Error(`Number ${str} out of range [${min}, ${max}]`);
              }
              return value;
            }
            function parseNumberLiteral(str, min, max) {
              const value = parseInt(str);
              if (Number.isNaN(value)) {
                throw new Error(`Invalid numeric literal: ${str}`);
              }
              if (value < min || value > max) {
                throw new Error(`Number ${str} out of range [${min}, ${max}]`);
              }
              return value;
            }
            const LITERAL_REGEX = new RegExp(ARRAY_TERMINATED_LITERAL, "y");
            const COMMA_OR_END_REGEX = /\s*(,)\s*|\s*$/y;
            function parseArrayLiteral(type2, rawStr) {
              if (!rawStr.startsWith("[") || !rawStr.endsWith("]")) {
                throw new Error("Array must start with [ and end with ]");
              }
              const str = rawStr.substring(1, rawStr.length - 1);
              if (type2 === "string" || type2 === "wstring") {
                const results = [];
                let offset = 0;
                while (offset < str.length) {
                  if (str[offset] === ",") {
                    throw new Error("Expected array element before comma");
                  }
                  LITERAL_REGEX.lastIndex = offset;
                  let match = LITERAL_REGEX.exec(str);
                  if (match) {
                    results.push(parseStringLiteral(match[0]));
                    offset = LITERAL_REGEX.lastIndex;
                  }
                  COMMA_OR_END_REGEX.lastIndex = offset;
                  match = COMMA_OR_END_REGEX.exec(str);
                  if (!match) {
                    throw new Error("Expected comma or end of array");
                  }
                  if (!match[1]) {
                    break;
                  }
                  offset = COMMA_OR_END_REGEX.lastIndex;
                }
                return results;
              }
              return str.split(",").map((part) => parsePrimitiveLiteral(type2, part.trim()));
            }
            function parseStringLiteral(maybeQuotedStr) {
              let quoteThatMustBeEscaped = "";
              let str = maybeQuotedStr;
              for (const quote of ["'", '"']) {
                if (maybeQuotedStr.startsWith(quote)) {
                  if (!maybeQuotedStr.endsWith(quote)) {
                    throw new Error(`Expected terminating ${quote} in string literal: ${maybeQuotedStr}`);
                  }
                  quoteThatMustBeEscaped = quote;
                  str = maybeQuotedStr.substring(quote.length, maybeQuotedStr.length - quote.length);
                  break;
                }
              }
              if (!new RegExp(String.raw`^(?:[^\\${quoteThatMustBeEscaped}]|${STRING_ESCAPES})*$`).test(str) == void 0) {
                throw new Error(`Invalid string literal: ${str}`);
              }
              return str.replace(new RegExp(STRING_ESCAPES, "g"), (...args) => {
                const { char, oct, hex2, hex4, hex8 } = args[args.length - 1];
                const hex = hex2 ?? hex4 ?? hex8;
                if (char != void 0) {
                  return {
                    "'": "'",
                    '"': '"',
                    a: "\x07",
                    b: "\b",
                    f: "\f",
                    n: "\n",
                    r: "\r",
                    t: "	",
                    v: "\v",
                    "\\": "\\"
                  }[char];
                } else if (oct != void 0) {
                  return String.fromCodePoint(parseInt(oct, 8));
                } else if (hex != void 0) {
                  return String.fromCodePoint(parseInt(hex, 16));
                } else {
                  throw new Error("Expected exactly one matched group");
                }
              });
            }
            function parsePrimitiveLiteral(type2, str) {
              switch (type2) {
                case "bool":
                  if (["true", "True", "1"].includes(str)) {
                    return true;
                  } else if (["false", "False", "0"].includes(str)) {
                    return false;
                  }
                  break;
                case "float32":
                case "float64": {
                  const value = parseFloat(str);
                  if (!Number.isNaN(value)) {
                    return value;
                  }
                  break;
                }
                case "int8":
                  return parseNumberLiteral(str, ~127, 127);
                case "uint8":
                  return parseNumberLiteral(str, 0, 255);
                case "int16":
                  return parseNumberLiteral(str, ~32767, 32767);
                case "uint16":
                  return parseNumberLiteral(str, 0, 65535);
                case "int32":
                  return parseNumberLiteral(str, ~2147483647, 2147483647);
                case "uint32":
                  return parseNumberLiteral(str, 0, 4294967295);
                case "int64":
                  return parseBigIntLiteral(str, ~0x7fffffffffffffffn, 0x7fffffffffffffffn);
                case "uint64":
                  return parseBigIntLiteral(str, 0n, 0xffffffffffffffffn);
                case "string":
                case "wstring":
                  return parseStringLiteral(str);
              }
              throw new Error(`Invalid literal of type ${type2}: ${str}`);
            }
            function normalizeType(type2) {
              switch (type2) {
                case "char":
                  return "uint8";
                case "byte":
                  return "int8";
                case "builtin_interfaces/Time":
                case "builtin_interfaces/msg/Time":
                  return "time";
                case "builtin_interfaces/Duration":
                case "builtin_interfaces/msg/Duration":
                  return "duration";
              }
              return type2;
            }
            function buildRos2Type(lines) {
              const definitions = [];
              let complexTypeName;
              for (const { line } of lines) {
                let match;
                if (line.startsWith("#")) {
                  continue;
                } else if (match = /^MSG: ([^ ]+)\s*(?:#.+)?$/.exec(line)) {
                  complexTypeName = match[1];
                  continue;
                } else if (match = DEFINITION_LINE_REGEX.exec(line)) {
                  const { type: rawType, stringBound, unboundedArray, arrayLength, arrayBound, name, constantValue, defaultValue } = match.groups;
                  const type2 = normalizeType(rawType);
                  if (stringBound != void 0 && type2 !== "string" && type2 !== "wstring") {
                    throw new Error(`Invalid string bound for type ${type2}`);
                  }
                  if (constantValue != void 0) {
                    if (!/^[A-Z](?:_?[A-Z0-9]+)*$/.test(name)) {
                      throw new Error(`Invalid constant name: ${name}`);
                    }
                  } else {
                    if (!/^[a-z](?:_?[a-z0-9]+)*$/.test(name)) {
                      throw new Error(`Invalid field name: ${name}`);
                    }
                  }
                  const isComplex = !BUILTIN_TYPES.includes(type2);
                  const isArray2 = unboundedArray != void 0 || arrayLength != void 0 || arrayBound != void 0;
                  definitions.push({
                    name,
                    type: type2,
                    isComplex: constantValue != void 0 ? isComplex || void 0 : isComplex,
                    isConstant: constantValue != void 0 || void 0,
                    isArray: constantValue != void 0 ? isArray2 || void 0 : isArray2,
                    arrayLength: arrayLength != void 0 ? parseInt(arrayLength) : void 0,
                    arrayUpperBound: arrayBound != void 0 ? parseInt(arrayBound) : void 0,
                    upperBound: stringBound != void 0 ? parseInt(stringBound) : void 0,
                    defaultValue: defaultValue != void 0 ? isArray2 ? parseArrayLiteral(type2, defaultValue.trim()) : parsePrimitiveLiteral(type2, defaultValue.trim()) : void 0,
                    value: constantValue != void 0 ? parsePrimitiveLiteral(type2, constantValue.trim()) : void 0,
                    valueText: constantValue?.trim()
                  });
                } else {
                  throw new Error(`Could not parse line: '${line}'`);
                }
              }
              return { name: complexTypeName, definitions };
            }
            exports2.buildRos2Type = buildRos2Type;
          },
          715: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              var desc = Object.getOwnPropertyDescriptor(m, k);
              if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = { enumerable: true, get: function() {
                  return m[k];
                } };
              }
              Object.defineProperty(o, k2, desc);
            } : function(o, m, k, k2) {
              if (k2 === void 0)
                k2 = k;
              o[k2] = m[k];
            });
            var __exportStar = this && this.__exportStar || function(m, exports3) {
              for (var p in m)
                if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
                  __createBinding(exports3, m, p);
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            __exportStar(__webpack_require__2(322), exports2);
            __exportStar(__webpack_require__2(867), exports2);
            __exportStar(__webpack_require__2(210), exports2);
          },
          322: (__unused_webpack_module, exports2, __webpack_require__2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.md5 = void 0;
            const md5_typescript_1 = __webpack_require__2(417);
            const BUILTIN_TYPES = /* @__PURE__ */ new Set([
              "int8",
              "uint8",
              "int16",
              "uint16",
              "int32",
              "uint32",
              "int64",
              "uint64",
              "float32",
              "float64",
              "string",
              "bool",
              "char",
              "byte",
              "time",
              "duration"
            ]);
            function md5(msgDefs) {
              if (msgDefs.length === 0) {
                throw new Error(`Cannot produce md5sum for empty msgDefs`);
              }
              const subMsgDefs = /* @__PURE__ */ new Map();
              for (const msgDef of msgDefs) {
                if (msgDef.name != void 0) {
                  subMsgDefs.set(msgDef.name, msgDef);
                }
              }
              const first = msgDefs[0];
              return computeMessageMd5(first, subMsgDefs);
            }
            exports2.md5 = md5;
            function computeMessageMd5(msgDef, subMsgDefs) {
              let output = "";
              const constants = msgDef.definitions.filter(({ isConstant }) => isConstant);
              const variables = msgDef.definitions.filter(({ isConstant }) => isConstant == void 0 || !isConstant);
              for (const def of constants) {
                output += `${def.type} ${def.name}=${def.valueText ?? String(def.value)}
`;
              }
              for (const def of variables) {
                if (isBuiltin(def.type)) {
                  const arrayLength = def.arrayLength != void 0 ? String(def.arrayLength) : "";
                  const array = def.isArray === true ? `[${arrayLength}]` : "";
                  output += `${def.type}${array} ${def.name}
`;
                } else {
                  const subMsgDef = subMsgDefs.get(def.type);
                  if (subMsgDef == void 0) {
                    throw new Error(`Missing definition for submessage type "${def.type}"`);
                  }
                  const subMd5 = computeMessageMd5(subMsgDef, subMsgDefs);
                  output += `${subMd5} ${def.name}
`;
                }
              }
              output = output.trimEnd();
              return md5_typescript_1.Md5.init(output);
            }
            function isBuiltin(typeName) {
              return BUILTIN_TYPES.has(typeName);
            }
          },
          867: function(__unused_webpack_module, exports2, __webpack_require__2) {
            var __importDefault = this && this.__importDefault || function(mod2) {
              return mod2 && mod2.__esModule ? mod2 : { "default": mod2 };
            };
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.normalizeType = exports2.fixupTypes = exports2.parse = void 0;
            const nearley_1 = __webpack_require__2(654);
            const buildRos2Type_1 = __webpack_require__2(515);
            const ros1_ne_1 = __importDefault(__webpack_require__2(558));
            const ROS1_GRAMMAR = nearley_1.Grammar.fromCompiled(ros1_ne_1.default);
            function parse2(messageDefinition, options = {}) {
              const allLines = messageDefinition.split("\n").map((line) => line.trim()).filter((line) => line);
              let definitionLines = [];
              const types2 = [];
              allLines.forEach((line) => {
                if (line.startsWith("#")) {
                  return;
                }
                if (line.startsWith("==")) {
                  types2.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
                  definitionLines = [];
                } else {
                  definitionLines.push({ line });
                }
              });
              types2.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
              if (options.skipTypeFixup !== true) {
                fixupTypes(types2);
              }
              return types2;
            }
            exports2.parse = parse2;
            function fixupTypes(types2) {
              types2.forEach(({ definitions, name }) => {
                definitions.forEach((definition) => {
                  if (definition.isComplex === true) {
                    const typeNamespace = name?.split("/").slice(0, -1).join("/");
                    const foundName = findTypeByName2(types2, definition.type, typeNamespace).name;
                    if (foundName == void 0) {
                      throw new Error(`Missing type definition for ${definition.type}`);
                    }
                    definition.type = foundName;
                  }
                });
              });
            }
            exports2.fixupTypes = fixupTypes;
            function buildType(lines, grammar) {
              const definitions = [];
              let complexTypeName;
              lines.forEach(({ line }) => {
                if (line.startsWith("MSG:")) {
                  const [_, name] = simpleTokenization(line);
                  complexTypeName = name?.trim();
                  return;
                }
                const parser = new nearley_1.Parser(grammar);
                parser.feed(line);
                const results = parser.finish();
                if (results.length === 0) {
                  throw new Error(`Could not parse line: '${line}'`);
                } else if (results.length > 1) {
                  throw new Error(`Ambiguous line: '${line}'`);
                }
                const result = results[0];
                if (result != void 0) {
                  result.type = normalizeType(result.type);
                  definitions.push(result);
                }
              });
              return { name: complexTypeName, definitions };
            }
            function simpleTokenization(line) {
              return line.replace(/#.*/gi, "").split(" ").filter((word) => word);
            }
            function findTypeByName2(types2, name, typeNamespace) {
              const matches = types2.filter((type2) => {
                const typeName = type2.name ?? "";
                if (name.length === 0) {
                  return typeName.length === 0;
                }
                if (name.includes("/")) {
                  return typeName === name;
                } else if (name === "Header") {
                  return typeName === `std_msgs/Header`;
                } else if (typeNamespace) {
                  return typeName === `${typeNamespace}/${name}`;
                } else {
                  return typeName.endsWith(`/${name}`);
                }
              });
              if (matches[0] == void 0) {
                throw new Error(`Expected 1 top level type definition for '${name}' but found ${matches.length}`);
              }
              if (matches.length > 1) {
                throw new Error(`Cannot unambiguously determine fully-qualified type name for '${name}'`);
              }
              return matches[0];
            }
            function normalizeType(type2) {
              if (type2 === "char") {
                return "uint8";
              } else if (type2 === "byte") {
                return "int8";
              }
              return type2;
            }
            exports2.normalizeType = normalizeType;
          },
          210: (__unused_webpack_module, exports2) => {
            Object.defineProperty(exports2, "__esModule", { value: true });
            exports2.stringify = void 0;
            function stringify(msgDefs) {
              let output = "";
              for (let i = 0; i < msgDefs.length; i++) {
                const msgDef = msgDefs[i];
                const constants = msgDef.definitions.filter(({ isConstant }) => isConstant);
                const variables = msgDef.definitions.filter(({ isConstant }) => isConstant == void 0 || !isConstant);
                if (i > 0) {
                  output += "\n================================================================================\n";
                  output += `MSG: ${msgDef.name ?? ""}
`;
                }
                for (const def of constants) {
                  output += `${def.type} ${def.name} = ${def.valueText ?? String(def.value)}
`;
                }
                if (variables.length > 0) {
                  if (output.length > 0) {
                    output += "\n";
                  }
                  for (const def of variables) {
                    const upperBound = def.upperBound != void 0 ? `<=${def.upperBound}` : "";
                    const arrayLength = def.arrayLength != void 0 ? String(def.arrayLength) : def.arrayUpperBound != void 0 ? `<=${def.arrayUpperBound}` : "";
                    const array = def.isArray === true ? `[${arrayLength}]` : "";
                    const defaultValue = def.defaultValue != void 0 ? ` ${stringifyDefaultValue(def.defaultValue)}` : "";
                    output += `${def.type}${upperBound}${array} ${def.name}${defaultValue}
`;
                  }
                }
              }
              return output.trimEnd();
            }
            exports2.stringify = stringify;
            function stringifyDefaultValue(value) {
              if (Array.isArray(value)) {
                return `[${value.map((x) => typeof x === "bigint" ? x.toString() : JSON.stringify(x)).join(", ")}]`;
              }
              return typeof value === "bigint" ? value.toString() : JSON.stringify(value);
            }
          }
        };
        var __webpack_module_cache__ = {};
        function __webpack_require__(moduleId) {
          var cachedModule = __webpack_module_cache__[moduleId];
          if (cachedModule !== void 0) {
            return cachedModule.exports;
          }
          var module3 = __webpack_module_cache__[moduleId] = {
            exports: {}
          };
          __webpack_modules__[moduleId].call(module3.exports, module3, module3.exports, __webpack_require__);
          return module3.exports;
        }
        (() => {
          __webpack_require__.d = (exports2, definition) => {
            for (var key in definition) {
              if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports2, key)) {
                Object.defineProperty(exports2, key, { enumerable: true, get: definition[key] });
              }
            }
          };
        })();
        (() => {
          __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
        })();
        (() => {
          __webpack_require__.r = (exports2) => {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
              Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(exports2, "__esModule", { value: true });
          };
        })();
        var __webpack_exports__ = __webpack_require__(715);
        module2.exports = __webpack_exports__;
      })();
    })(dist$2);
    const decoder = new TextDecoder();
    function decodeString(data) {
      if (data.length >= 50) {
        return decoder.decode(data);
      }
      for (let i = 0; i < data.length; i++) {
        if (data[i] & 128) {
          return decoder.decode(data);
        }
      }
      return String.fromCharCode.apply(null, data);
    }
    function MakeTypedArrayDeserialze(TypedArrayConstructor, getter) {
      if (TypedArrayConstructor == void 0) {
        console.warn("bigint arrays are not supported in this environment");
      }
      return (view, offset, len) => {
        if (TypedArrayConstructor == void 0) {
          throw new Error("bigint arrays are not supported in this environment");
        }
        let currentOffset = offset;
        const totalOffset = view.byteOffset + currentOffset;
        const size = TypedArrayConstructor.BYTES_PER_ELEMENT * len;
        const maxSize = view.byteLength - offset;
        if (size < 0 || size > maxSize) {
          throw new RangeError(`Array(${getter}) deserialization error: size ${size}, maxSize ${maxSize}`);
        }
        if (totalOffset % TypedArrayConstructor.BYTES_PER_ELEMENT === 0) {
          return new TypedArrayConstructor(view.buffer, totalOffset, len);
        }
        if (len < 10) {
          const arr = new TypedArrayConstructor(len);
          for (let idx = 0; idx < len; ++idx) {
            arr[idx] = view[getter](currentOffset, true);
            currentOffset += TypedArrayConstructor.BYTES_PER_ELEMENT;
          }
          return arr;
        }
        const copy = new Uint8Array(size);
        copy.set(new Uint8Array(view.buffer, totalOffset, size));
        return new TypedArrayConstructor(copy.buffer, copy.byteOffset, len);
      };
    }
    const deserializers$1 = {
      bool: (view, offset) => view.getUint8(offset) !== 0,
      int8: (view, offset) => view.getInt8(offset),
      uint8: (view, offset) => view.getUint8(offset),
      int16: (view, offset) => view.getInt16(offset, true),
      uint16: (view, offset) => view.getUint16(offset, true),
      int32: (view, offset) => view.getInt32(offset, true),
      uint32: (view, offset) => view.getUint32(offset, true),
      int64: (view, offset) => view.getBigInt64(offset, true),
      uint64: (view, offset) => view.getBigUint64(offset, true),
      float32: (view, offset) => view.getFloat32(offset, true),
      float64: (view, offset) => view.getFloat64(offset, true),
      time: (view, offset) => {
        const sec = view.getUint32(offset, true);
        const nsec = view.getUint32(offset + 4, true);
        return { sec, nsec };
      },
      duration: (view, offset) => {
        const sec = view.getInt32(offset, true);
        const nsec = view.getInt32(offset + 4, true);
        return { sec, nsec };
      },
      string: (view, offset) => {
        const len = view.getUint32(offset, true);
        const totalOffset = view.byteOffset + offset + 4;
        const maxLen = view.byteLength - offset;
        if (len < 0 || len > maxLen) {
          throw new RangeError(`String deserialization error: length ${len}, maxLength ${maxLen}`);
        }
        const data = new Uint8Array(view.buffer, totalOffset, len);
        return decodeString(data);
      },
      boolArray: (view, offset, len) => {
        let currentOffset = offset;
        const arr = new Array(len);
        for (let idx = 0; idx < len; ++idx) {
          arr[idx] = deserializers$1.bool(view, currentOffset);
          currentOffset += 1;
        }
        return arr;
      },
      int8Array: MakeTypedArrayDeserialze(Int8Array, "getInt8"),
      uint8Array: MakeTypedArrayDeserialze(Uint8Array, "getUint8"),
      int16Array: MakeTypedArrayDeserialze(Int16Array, "getInt16"),
      uint16Array: MakeTypedArrayDeserialze(Uint16Array, "getUint16"),
      int32Array: MakeTypedArrayDeserialze(Int32Array, "getInt32"),
      uint32Array: MakeTypedArrayDeserialze(Uint32Array, "getUint32"),
      int64Array: MakeTypedArrayDeserialze(typeof BigInt64Array === "function" ? BigInt64Array : void 0, "getBigInt64"),
      uint64Array: MakeTypedArrayDeserialze(typeof BigUint64Array === "function" ? BigUint64Array : void 0, "getBigUint64"),
      float32Array: MakeTypedArrayDeserialze(Float32Array, "getFloat32"),
      float64Array: MakeTypedArrayDeserialze(Float64Array, "getFloat64"),
      timeArray: (view, offset, len) => {
        let currentOffset = offset;
        const timeArr = new Array(len);
        const totalOffset = view.byteOffset + currentOffset;
        if (totalOffset % Int32Array.BYTES_PER_ELEMENT === 0) {
          const intArr = new Int32Array(view.buffer, totalOffset, len * 2);
          for (let i = 0, j = 0; i < len; ++i, j = j + 2) {
            timeArr[i] = {
              sec: intArr[j],
              nsec: intArr[j + 1]
            };
          }
        } else {
          for (let idx = 0; idx < len; ++idx) {
            timeArr[idx] = {
              sec: view.getInt32(currentOffset, true),
              nsec: view.getInt32(currentOffset + 4, true)
            };
            currentOffset += 8;
          }
        }
        return timeArr;
      },
      durationArray: (view, offset, len) => deserializers$1.timeArray(view, offset, len),
      fixedArray: (view, offset, len, elementDeser, elementSize) => {
        let currentOffset = offset;
        const arr = new Array(len);
        for (let idx = 0; idx < len; ++idx) {
          arr[idx] = elementDeser(view, currentOffset);
          currentOffset += elementSize(view, currentOffset);
        }
        return arr;
      },
      dynamicArray: (view, offset, elementDeser, elementSize) => {
        const len = view.getUint32(offset, true);
        return deserializers$1.fixedArray(view, offset + 4, len, elementDeser, elementSize);
      }
    };
    function isBigEndian$2() {
      const array = new Uint8Array(4);
      const view = new Uint32Array(array.buffer);
      view[0] = 1;
      return array[3] === 1;
    }
    const isLittleEndian$1 = !isBigEndian$2();
    if (!isLittleEndian$1) {
      throw new Error("Only Little Endian architectures are supported");
    }
    class StandardTypeReader {
      constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
        this.view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      }
      json() {
        const resultString = this.string();
        try {
          return JSON.parse(resultString);
        } catch {
          return `Could not parse ${resultString}`;
        }
      }
      string() {
        const len = this.uint32();
        const totalOffset = this.view.byteOffset + this.offset;
        const maxLen = this.view.byteLength - this.offset;
        if (len < 0 || len > maxLen) {
          throw new RangeError(`String deserialization error: length ${len}, maxLength ${maxLen}`);
        }
        const data = new Uint8Array(this.view.buffer, totalOffset, len);
        this.offset += len;
        return decodeString(data);
      }
      bool() {
        return this.uint8() !== 0;
      }
      int8() {
        return this.view.getInt8(this.offset++);
      }
      uint8() {
        return this.view.getUint8(this.offset++);
      }
      typedArray(len, TypedArrayConstructor) {
        const arrayLength = len == void 0 ? this.uint32() : len;
        const view = this.view;
        const totalOffset = this.offset + view.byteOffset;
        this.offset += arrayLength * TypedArrayConstructor.BYTES_PER_ELEMENT;
        if (totalOffset % TypedArrayConstructor.BYTES_PER_ELEMENT === 0) {
          return new TypedArrayConstructor(view.buffer, totalOffset, arrayLength);
        }
        const size = TypedArrayConstructor.BYTES_PER_ELEMENT * arrayLength;
        const copy = new Uint8Array(size);
        copy.set(new Uint8Array(view.buffer, totalOffset, size));
        return new TypedArrayConstructor(copy.buffer, copy.byteOffset, arrayLength);
      }
      int16() {
        const result = this.view.getInt16(this.offset, true);
        this.offset += 2;
        return result;
      }
      uint16() {
        const result = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return result;
      }
      int32() {
        const result = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return result;
      }
      uint32() {
        const result = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return result;
      }
      float32() {
        const result = this.view.getFloat32(this.offset, true);
        this.offset += 4;
        return result;
      }
      float64() {
        const result = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return result;
      }
      int64() {
        const offset = this.offset;
        this.offset += 8;
        return this.view.getBigInt64(offset, true);
      }
      uint64() {
        const offset = this.offset;
        this.offset += 8;
        return this.view.getBigUint64(offset, true);
      }
      time() {
        const offset = this.offset;
        this.offset += 8;
        const sec = this.view.getUint32(offset, true);
        const nsec = this.view.getUint32(offset + 4, true);
        return { sec, nsec };
      }
      duration() {
        const offset = this.offset;
        this.offset += 8;
        const sec = this.view.getInt32(offset, true);
        const nsec = this.view.getInt32(offset + 4, true);
        return { sec, nsec };
      }
    }
    const findTypeByName = (types2, name = "") => {
      let foundName = "";
      const matches = types2.filter((type2) => {
        const typeName = type2.name ?? "";
        if (!name) {
          return !typeName;
        }
        const nameEnd = name.includes("/") ? name : `/${name}`;
        if (typeName.endsWith(nameEnd)) {
          foundName = typeName;
          return true;
        }
        return false;
      });
      if (matches.length !== 1) {
        throw new Error(`Expected 1 top level type definition for '${name}' but found ${matches.length}.`);
      }
      return { ...matches[0], name: foundName };
    };
    const friendlyName = (name) => name.replace(/\//g, "_");
    function toTypedArrayType(rosType) {
      switch (rosType) {
        case "int8":
          return "Int8Array";
        case "uint8":
          return "Uint8Array";
        case "int16":
          return "Int16Array";
        case "uint16":
          return "Uint16Array";
        case "int32":
          return "Int32Array";
        case "uint32":
          return "Uint32Array";
        case "int64":
          return "BigInt64Array";
        case "uint64":
          return "BigUint64Array";
        case "float32":
          return "Float32Array";
        case "float64":
          return "Float64Array";
        default:
          return void 0;
      }
    }
    const createParsers = ({ definitions, options = {}, topLevelReaderKey }) => {
      if (definitions.length === 0) {
        throw new Error(`no types given`);
      }
      const unnamedTypes = definitions.filter((type2) => !type2.name);
      if (unnamedTypes.length > 1) {
        throw new Error("multiple unnamed types");
      }
      const unnamedType = unnamedTypes.length > 0 ? unnamedTypes[0] : definitions[0];
      const namedTypes = definitions.filter((type2) => !!type2.name);
      const constructorBody = (type2) => {
        const readerLines = [];
        type2.definitions.forEach((def) => {
          if (def.isConstant === true) {
            return;
          }
          if (def.isArray === true) {
            const typedArrayType = toTypedArrayType(def.type);
            if (typedArrayType != void 0) {
              readerLines.push(`this.${def.name} = reader.typedArray(${String(def.arrayLength)}, ${typedArrayType});`);
              return;
            }
            const lenField = `length_${def.name}`;
            readerLines.push(`var ${lenField} = ${def.arrayLength != void 0 ? def.arrayLength : "reader.uint32();"}`);
            const arrayName = `this.${def.name}`;
            readerLines.push(`${arrayName} = new Array(${lenField})`);
            readerLines.push(`for (var i = 0; i < ${lenField}; i++) {`);
            if (def.isComplex === true) {
              const defType = findTypeByName(definitions, def.type);
              readerLines.push(`  ${arrayName}[i] = new Record.${friendlyName(defType.name)}(reader);`);
            } else {
              readerLines.push(`  ${arrayName}[i] = reader.${def.type}();`);
            }
            readerLines.push("}");
          } else if (def.isComplex === true) {
            const defType = findTypeByName(definitions, def.type);
            readerLines.push(`this.${def.name} = new Record.${friendlyName(defType.name)}(reader);`);
          } else {
            readerLines.push(`this.${def.name} = reader.${def.type}();`);
          }
        });
        if (options.freeze === true) {
          readerLines.push("Object.freeze(this);");
        }
        return readerLines.join("\n    ");
      };
      let js = `
  const builtReaders = new Map();
  var Record = function (reader) {
    ${constructorBody(unnamedType)}
  };
  builtReaders.set(topLevelReaderKey, Record);
  `;
      for (const type2 of namedTypes) {
        js += `
  Record.${friendlyName(type2.name)} = function(reader) {
    ${constructorBody(type2)}
  };
  builtReaders.set(${JSON.stringify(type2.name)}, Record.${friendlyName(type2.name)});
  `;
      }
      js += `return builtReaders;`;
      return new Function("topLevelReaderKey", js)(topLevelReaderKey);
    };
    class MessageReader$2 {
      constructor(definitions, options = {}) {
        this.reader = createParsers({ definitions, options, topLevelReaderKey: "<toplevel>" }).get("<toplevel>");
      }
      readMessage(buffer) {
        const standardReaders = new StandardTypeReader(buffer);
        return new this.reader(standardReaders);
      }
    }
    var dist$1 = {};
    var MessageReader$1 = {};
    var dist = {};
    var CdrReader$1 = {};
    var getEncapsulationKindInfo$1 = {};
    var EncapsulationKind = {};
    (function(exports2) {
      Object.defineProperty(exports2, "__esModule", { value: true });
      exports2.EncapsulationKind = void 0;
      (function(EncapsulationKind2) {
        EncapsulationKind2[EncapsulationKind2["CDR_BE"] = 0] = "CDR_BE";
        EncapsulationKind2[EncapsulationKind2["CDR_LE"] = 1] = "CDR_LE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR_BE"] = 2] = "PL_CDR_BE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR_LE"] = 3] = "PL_CDR_LE";
        EncapsulationKind2[EncapsulationKind2["CDR2_BE"] = 16] = "CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["CDR2_LE"] = 17] = "CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR2_BE"] = 18] = "PL_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["PL_CDR2_LE"] = 19] = "PL_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["DELIMITED_CDR2_BE"] = 20] = "DELIMITED_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["DELIMITED_CDR2_LE"] = 21] = "DELIMITED_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_CDR2_BE"] = 6] = "RTPS_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_CDR2_LE"] = 7] = "RTPS_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_DELIMITED_CDR2_BE"] = 8] = "RTPS_DELIMITED_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_DELIMITED_CDR2_LE"] = 9] = "RTPS_DELIMITED_CDR2_LE";
        EncapsulationKind2[EncapsulationKind2["RTPS_PL_CDR2_BE"] = 10] = "RTPS_PL_CDR2_BE";
        EncapsulationKind2[EncapsulationKind2["RTPS_PL_CDR2_LE"] = 11] = "RTPS_PL_CDR2_LE";
      })(exports2.EncapsulationKind || (exports2.EncapsulationKind = {}));
    })(EncapsulationKind);
    Object.defineProperty(getEncapsulationKindInfo$1, "__esModule", { value: true });
    getEncapsulationKindInfo$1.getEncapsulationKindInfo = void 0;
    const EncapsulationKind_1$1 = EncapsulationKind;
    const getEncapsulationKindInfo = (kind) => {
      const isCDR2 = kind > EncapsulationKind_1$1.EncapsulationKind.PL_CDR_LE;
      const littleEndian = kind === EncapsulationKind_1$1.EncapsulationKind.CDR_LE || kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR_LE || kind === EncapsulationKind_1$1.EncapsulationKind.CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.DELIMITED_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_PL_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_DELIMITED_CDR2_LE;
      const isDelimitedCDR2 = kind === EncapsulationKind_1$1.EncapsulationKind.DELIMITED_CDR2_BE || kind === EncapsulationKind_1$1.EncapsulationKind.DELIMITED_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_DELIMITED_CDR2_BE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_DELIMITED_CDR2_LE;
      const isPLCDR2 = kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR2_BE || kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR2_LE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_PL_CDR2_BE || kind === EncapsulationKind_1$1.EncapsulationKind.RTPS_PL_CDR2_LE;
      const isPLCDR1 = kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR_BE || kind === EncapsulationKind_1$1.EncapsulationKind.PL_CDR_LE;
      const usesDelimiterHeader = isDelimitedCDR2 || isPLCDR2;
      const usesMemberHeader = isPLCDR2 || isPLCDR1;
      return {
        isCDR2,
        littleEndian,
        usesDelimiterHeader,
        usesMemberHeader
      };
    };
    getEncapsulationKindInfo$1.getEncapsulationKindInfo = getEncapsulationKindInfo;
    var isBigEndian$1 = {};
    Object.defineProperty(isBigEndian$1, "__esModule", { value: true });
    isBigEndian$1.isBigEndian = void 0;
    const endianTestArray = new Uint8Array(4);
    const endianTestView = new Uint32Array(endianTestArray.buffer);
    endianTestView[0] = 1;
    function isBigEndian() {
      return endianTestArray[3] === 1;
    }
    isBigEndian$1.isBigEndian = isBigEndian;
    var lengthCodes = {};
    Object.defineProperty(lengthCodes, "__esModule", { value: true });
    lengthCodes.lengthCodeToObjectSizes = lengthCodes.getLengthCodeForObjectSize = void 0;
    function getLengthCodeForObjectSize(objectSize) {
      let defaultLengthCode;
      switch (objectSize) {
        case 1:
          defaultLengthCode = 0;
          break;
        case 2:
          defaultLengthCode = 1;
          break;
        case 4:
          defaultLengthCode = 2;
          break;
        case 8:
          defaultLengthCode = 3;
          break;
      }
      if (defaultLengthCode == void 0) {
        if (objectSize > 4294967295) {
          throw Error(`Object size ${objectSize} for EMHEADER too large without specifying length code. Max size is ${4294967295}`);
        }
        defaultLengthCode = 4;
      }
      return defaultLengthCode;
    }
    lengthCodes.getLengthCodeForObjectSize = getLengthCodeForObjectSize;
    lengthCodes.lengthCodeToObjectSizes = {
      0: 1,
      1: 2,
      2: 4,
      3: 8
    };
    var reservedPIDs = {};
    Object.defineProperty(reservedPIDs, "__esModule", { value: true });
    reservedPIDs.SENTINEL_PID = reservedPIDs.EXTENDED_PID = void 0;
    reservedPIDs.EXTENDED_PID = 16129;
    reservedPIDs.SENTINEL_PID = 16130;
    Object.defineProperty(CdrReader$1, "__esModule", { value: true });
    CdrReader$1.CdrReader = void 0;
    const getEncapsulationKindInfo_1$1 = getEncapsulationKindInfo$1;
    const isBigEndian_1$1 = isBigEndian$1;
    const lengthCodes_1$1 = lengthCodes;
    const reservedPIDs_1$1 = reservedPIDs;
    const textDecoder = new TextDecoder("utf8");
    class CdrReader {
      constructor(data) {
        this.origin = 0;
        if (data.byteLength < 4) {
          throw new Error(`Invalid CDR data size ${data.byteLength}, must contain at least a 4-byte header`);
        }
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        const kind = this.kind;
        const { isCDR2, littleEndian, usesDelimiterHeader, usesMemberHeader } = (0, getEncapsulationKindInfo_1$1.getEncapsulationKindInfo)(kind);
        this.usesDelimiterHeader = usesDelimiterHeader;
        this.usesMemberHeader = usesMemberHeader;
        this.littleEndian = littleEndian;
        this.hostLittleEndian = !(0, isBigEndian_1$1.isBigEndian)();
        this.isCDR2 = isCDR2;
        this.eightByteAlignment = isCDR2 ? 4 : 8;
        this.origin = 4;
        this.offset = 4;
      }
      get kind() {
        return this.view.getUint8(1);
      }
      get decodedBytes() {
        return this.offset;
      }
      get byteLength() {
        return this.view.byteLength;
      }
      int8() {
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
      }
      uint8() {
        const value = this.view.getUint8(this.offset);
        this.offset += 1;
        return value;
      }
      int16() {
        this.align(2);
        const value = this.view.getInt16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
      }
      uint16() {
        this.align(2);
        const value = this.view.getUint16(this.offset, this.littleEndian);
        this.offset += 2;
        return value;
      }
      int32() {
        this.align(4);
        const value = this.view.getInt32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      uint32() {
        this.align(4);
        const value = this.view.getUint32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      int64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigInt64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      uint64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigUint64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      uint16BE() {
        this.align(2);
        const value = this.view.getUint16(this.offset, false);
        this.offset += 2;
        return value;
      }
      uint32BE() {
        this.align(4);
        const value = this.view.getUint32(this.offset, false);
        this.offset += 4;
        return value;
      }
      uint64BE() {
        this.align(this.eightByteAlignment);
        const value = this.view.getBigUint64(this.offset, false);
        this.offset += 8;
        return value;
      }
      float32() {
        this.align(4);
        const value = this.view.getFloat32(this.offset, this.littleEndian);
        this.offset += 4;
        return value;
      }
      float64() {
        this.align(this.eightByteAlignment);
        const value = this.view.getFloat64(this.offset, this.littleEndian);
        this.offset += 8;
        return value;
      }
      string(prereadLength) {
        const length = prereadLength ?? this.uint32();
        if (length <= 1) {
          this.offset += length;
          return "";
        }
        const data = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, length - 1);
        const value = textDecoder.decode(data);
        this.offset += length;
        return value;
      }
      dHeader() {
        const header = this.uint32();
        return header;
      }
      emHeader() {
        if (this.isCDR2) {
          return this.memberHeaderV2();
        } else {
          return this.memberHeaderV1();
        }
      }
      memberHeaderV1() {
        this.align(4);
        const idHeader = this.uint16();
        const mustUnderstandFlag = (idHeader & 16384) >> 14 === 1;
        const implementationSpecificFlag = (idHeader & 32768) >> 15 === 1;
        const extendedPIDFlag = (idHeader & 16383) === reservedPIDs_1$1.EXTENDED_PID;
        const sentinelPIDFlag = (idHeader & 16383) === reservedPIDs_1$1.SENTINEL_PID;
        if (sentinelPIDFlag) {
          throw Error("Expected Member Header but got SENTINEL_PID Flag");
        }
        const usesReservedParameterId = (idHeader & 16383) > reservedPIDs_1$1.SENTINEL_PID;
        if (usesReservedParameterId || implementationSpecificFlag) {
          throw new Error(`Unsupported parameter ID header ${idHeader.toString(16)}`);
        }
        if (extendedPIDFlag) {
          this.uint16();
        }
        const id = extendedPIDFlag ? this.uint32() : idHeader & 16383;
        const objectSize = extendedPIDFlag ? this.uint32() : this.uint16();
        this.resetOrigin();
        return { id, objectSize, mustUnderstand: mustUnderstandFlag };
      }
      resetOrigin() {
        this.origin = this.offset;
      }
      sentinelHeader() {
        if (!this.isCDR2) {
          this.align(4);
          const header = this.uint16();
          const sentinelPIDFlag = (header & 16383) === reservedPIDs_1$1.SENTINEL_PID;
          if (!sentinelPIDFlag) {
            throw Error(`Expected SENTINEL_PID (${reservedPIDs_1$1.SENTINEL_PID.toString(16)}) flag, but got ${header.toString(16)}`);
          }
          this.uint16();
        }
      }
      memberHeaderV2() {
        const header = this.uint32();
        const mustUnderstand = Math.abs((header & 2147483648) >> 31) === 1;
        const lengthCode = (header & 1879048192) >> 28;
        const id = header & 268435455;
        const objectSize = this.emHeaderObjectSize(lengthCode);
        return { mustUnderstand, id, objectSize, lengthCode };
      }
      emHeaderObjectSize(lengthCode) {
        switch (lengthCode) {
          case 0:
          case 1:
          case 2:
          case 3:
            return lengthCodes_1$1.lengthCodeToObjectSizes[lengthCode];
          case 4:
          case 5:
            return this.uint32();
          case 6:
            return 4 * this.uint32();
          case 7:
            return 8 * this.uint32();
          default:
            throw new Error(
              `Invalid length code ${lengthCode} in EMHEADER at offset ${this.offset - 4}`
            );
        }
      }
      sequenceLength() {
        return this.uint32();
      }
      int8Array(count = this.sequenceLength()) {
        const array = new Int8Array(this.view.buffer, this.view.byteOffset + this.offset, count);
        this.offset += count;
        return array;
      }
      uint8Array(count = this.sequenceLength()) {
        const array = new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, count);
        this.offset += count;
        return array;
      }
      int16Array(count = this.sequenceLength()) {
        return this.typedArray(Int16Array, "getInt16", count);
      }
      uint16Array(count = this.sequenceLength()) {
        return this.typedArray(Uint16Array, "getUint16", count);
      }
      int32Array(count = this.sequenceLength()) {
        return this.typedArray(Int32Array, "getInt32", count);
      }
      uint32Array(count = this.sequenceLength()) {
        return this.typedArray(Uint32Array, "getUint32", count);
      }
      int64Array(count = this.sequenceLength()) {
        return this.typedArray(BigInt64Array, "getBigInt64", count, this.eightByteAlignment);
      }
      uint64Array(count = this.sequenceLength()) {
        return this.typedArray(BigUint64Array, "getBigUint64", count, this.eightByteAlignment);
      }
      float32Array(count = this.sequenceLength()) {
        return this.typedArray(Float32Array, "getFloat32", count);
      }
      float64Array(count = this.sequenceLength()) {
        return this.typedArray(Float64Array, "getFloat64", count, this.eightByteAlignment);
      }
      stringArray(count = this.sequenceLength()) {
        const output = [];
        for (let i = 0; i < count; i++) {
          output.push(this.string());
        }
        return output;
      }
      seek(relativeOffset) {
        const newOffset = this.offset + relativeOffset;
        if (newOffset < 4 || newOffset >= this.view.byteLength) {
          throw new Error(`seek(${relativeOffset}) failed, ${newOffset} is outside the data range`);
        }
        this.offset = newOffset;
      }
      seekTo(offset) {
        if (offset < 4 || offset >= this.view.byteLength) {
          throw new Error(`seekTo(${offset}) failed, value is outside the data range`);
        }
        this.offset = offset;
      }
      align(size) {
        const alignment = (this.offset - this.origin) % size;
        if (alignment > 0) {
          this.offset += size - alignment;
        }
      }
      typedArray(TypedArrayConstructor, getter, count, alignment = TypedArrayConstructor.BYTES_PER_ELEMENT) {
        if (count === 0) {
          return new TypedArrayConstructor();
        }
        this.align(alignment);
        const totalOffset = this.view.byteOffset + this.offset;
        if (this.littleEndian !== this.hostLittleEndian) {
          return this.typedArraySlow(TypedArrayConstructor, getter, count);
        } else if (totalOffset % TypedArrayConstructor.BYTES_PER_ELEMENT === 0) {
          const array = new TypedArrayConstructor(this.view.buffer, totalOffset, count);
          this.offset += TypedArrayConstructor.BYTES_PER_ELEMENT * count;
          return array;
        } else {
          return this.typedArrayUnaligned(TypedArrayConstructor, getter, count);
        }
      }
      typedArrayUnaligned(TypedArrayConstructor, getter, count) {
        if (count < 10) {
          return this.typedArraySlow(TypedArrayConstructor, getter, count);
        }
        const byteLength = TypedArrayConstructor.BYTES_PER_ELEMENT * count;
        const copy = new Uint8Array(byteLength);
        copy.set(new Uint8Array(this.view.buffer, this.view.byteOffset + this.offset, byteLength));
        this.offset += byteLength;
        return new TypedArrayConstructor(copy.buffer, copy.byteOffset, count);
      }
      typedArraySlow(TypedArrayConstructor, getter, count) {
        const array = new TypedArrayConstructor(count);
        let offset = this.offset;
        for (let i = 0; i < count; i++) {
          array[i] = this.view[getter](offset, this.littleEndian);
          offset += TypedArrayConstructor.BYTES_PER_ELEMENT;
        }
        this.offset = offset;
        return array;
      }
    }
    CdrReader$1.CdrReader = CdrReader;
    var CdrSizeCalculator$1 = {};
    Object.defineProperty(CdrSizeCalculator$1, "__esModule", { value: true });
    CdrSizeCalculator$1.CdrSizeCalculator = void 0;
    class CdrSizeCalculator {
      constructor() {
        this.offset = 4;
      }
      get size() {
        return this.offset;
      }
      int8() {
        return this.incrementAndReturn(1);
      }
      uint8() {
        return this.incrementAndReturn(1);
      }
      int16() {
        return this.incrementAndReturn(2);
      }
      uint16() {
        return this.incrementAndReturn(2);
      }
      int32() {
        return this.incrementAndReturn(4);
      }
      uint32() {
        return this.incrementAndReturn(4);
      }
      int64() {
        return this.incrementAndReturn(8);
      }
      uint64() {
        return this.incrementAndReturn(8);
      }
      float32() {
        return this.incrementAndReturn(4);
      }
      float64() {
        return this.incrementAndReturn(8);
      }
      string(length) {
        this.uint32();
        this.offset += length + 1;
        return this.offset;
      }
      sequenceLength() {
        return this.uint32();
      }
      incrementAndReturn(byteCount) {
        const alignment = (this.offset - 4) % byteCount;
        if (alignment > 0) {
          this.offset += byteCount - alignment;
        }
        this.offset += byteCount;
        return this.offset;
      }
    }
    CdrSizeCalculator$1.CdrSizeCalculator = CdrSizeCalculator;
    var CdrWriter$1 = {};
    Object.defineProperty(CdrWriter$1, "__esModule", { value: true });
    CdrWriter$1.CdrWriter = void 0;
    const EncapsulationKind_1 = EncapsulationKind;
    const getEncapsulationKindInfo_1 = getEncapsulationKindInfo$1;
    const isBigEndian_1 = isBigEndian$1;
    const lengthCodes_1 = lengthCodes;
    const reservedPIDs_1 = reservedPIDs;
    const textEncoder = new TextEncoder();
    class CdrWriter {
      constructor(options = {}) {
        if (options.buffer != void 0) {
          this.buffer = options.buffer;
        } else if (options.size != void 0) {
          this.buffer = new ArrayBuffer(options.size);
        } else {
          this.buffer = new ArrayBuffer(CdrWriter.DEFAULT_CAPACITY);
        }
        const kind = options.kind ?? EncapsulationKind_1.EncapsulationKind.CDR_LE;
        const { isCDR2, littleEndian } = (0, getEncapsulationKindInfo_1.getEncapsulationKindInfo)(kind);
        this.isCDR2 = isCDR2;
        this.littleEndian = littleEndian;
        this.hostLittleEndian = !(0, isBigEndian_1.isBigEndian)();
        this.eightByteAlignment = isCDR2 ? 4 : 8;
        this.array = new Uint8Array(this.buffer);
        this.view = new DataView(this.buffer);
        this.resizeIfNeeded(4);
        this.view.setUint8(0, 0);
        this.view.setUint8(1, kind);
        this.view.setUint16(2, 0, false);
        this.offset = 4;
        this.origin = 4;
      }
      get data() {
        return new Uint8Array(this.buffer, 0, this.offset);
      }
      get size() {
        return this.offset;
      }
      get kind() {
        return this.view.getUint8(1);
      }
      int8(value) {
        this.resizeIfNeeded(1);
        this.view.setInt8(this.offset, value);
        this.offset += 1;
        return this;
      }
      uint8(value) {
        this.resizeIfNeeded(1);
        this.view.setUint8(this.offset, value);
        this.offset += 1;
        return this;
      }
      int16(value) {
        this.align(2);
        this.view.setInt16(this.offset, value, this.littleEndian);
        this.offset += 2;
        return this;
      }
      uint16(value) {
        this.align(2);
        this.view.setUint16(this.offset, value, this.littleEndian);
        this.offset += 2;
        return this;
      }
      int32(value) {
        this.align(4);
        this.view.setInt32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      uint32(value) {
        this.align(4);
        this.view.setUint32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      int64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigInt64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      uint64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigUint64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      uint16BE(value) {
        this.align(2);
        this.view.setUint16(this.offset, value, false);
        this.offset += 2;
        return this;
      }
      uint32BE(value) {
        this.align(4);
        this.view.setUint32(this.offset, value, false);
        this.offset += 4;
        return this;
      }
      uint64BE(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setBigUint64(this.offset, value, false);
        this.offset += 8;
        return this;
      }
      float32(value) {
        this.align(4);
        this.view.setFloat32(this.offset, value, this.littleEndian);
        this.offset += 4;
        return this;
      }
      float64(value) {
        this.align(this.eightByteAlignment, 8);
        this.view.setFloat64(this.offset, value, this.littleEndian);
        this.offset += 8;
        return this;
      }
      string(value, writeLength = true) {
        const strlen = value.length;
        if (writeLength) {
          this.uint32(strlen + 1);
        }
        this.resizeIfNeeded(strlen + 1);
        textEncoder.encodeInto(value, new Uint8Array(this.buffer, this.offset, strlen));
        this.view.setUint8(this.offset + strlen, 0);
        this.offset += strlen + 1;
        return this;
      }
      dHeader(objectSize) {
        const header = objectSize;
        this.uint32(header);
        return this;
      }
      emHeader(mustUnderstand, id, objectSize, lengthCode) {
        return this.isCDR2 ? this.memberHeaderV2(mustUnderstand, id, objectSize, lengthCode) : this.memberHeaderV1(mustUnderstand, id, objectSize);
      }
      memberHeaderV1(mustUnderstand, id, objectSize) {
        this.align(4);
        const mustUnderstandFlag = mustUnderstand ? 1 << 14 : 0;
        const shouldUseExtendedPID = id > 16128 || objectSize > 65535;
        if (!shouldUseExtendedPID) {
          const idHeader = mustUnderstandFlag | id;
          this.uint16(idHeader);
          const objectSizeHeader = objectSize & 65535;
          this.uint16(objectSizeHeader);
        } else {
          const extendedHeader = mustUnderstandFlag | reservedPIDs_1.EXTENDED_PID;
          this.uint16(extendedHeader);
          this.uint16(8);
          this.uint32(id);
          this.uint32(objectSize);
        }
        this.resetOrigin();
        return this;
      }
      resetOrigin() {
        this.origin = this.offset;
      }
      sentinelHeader() {
        if (!this.isCDR2) {
          this.align(4);
          this.uint16(reservedPIDs_1.SENTINEL_PID);
          this.uint16(0);
        }
        return this;
      }
      memberHeaderV2(mustUnderstand, id, objectSize, lengthCode) {
        if (id > 268435455) {
          throw Error(`Member ID ${id} is too large. Max value is ${268435455}`);
        }
        const mustUnderstandFlag = mustUnderstand ? 1 << 31 : 0;
        const finalLengthCode = lengthCode ?? (0, lengthCodes_1.getLengthCodeForObjectSize)(objectSize);
        const header = mustUnderstandFlag | finalLengthCode << 28 | id;
        this.uint32(header);
        switch (finalLengthCode) {
          case 0:
          case 1:
          case 2:
          case 3: {
            const shouldBeSize = lengthCodes_1.lengthCodeToObjectSizes[finalLengthCode];
            if (objectSize !== shouldBeSize) {
              throw new Error(`Cannot write a length code ${finalLengthCode} header with an object size not equal to ${shouldBeSize}`);
            }
            break;
          }
          case 4:
          case 5:
            this.uint32(objectSize);
            break;
          case 6:
            if (objectSize % 4 !== 0) {
              throw new Error("Cannot write a length code 6 header with an object size that is not a multiple of 4");
            }
            this.uint32(objectSize >> 2);
            break;
          case 7:
            if (objectSize % 8 !== 0) {
              throw new Error("Cannot write a length code 7 header with an object size that is not a multiple of 8");
            }
            this.uint32(objectSize >> 3);
            break;
          default:
            throw new Error(`Unexpected length code ${finalLengthCode}`);
        }
        return this;
      }
      sequenceLength(value) {
        return this.uint32(value);
      }
      int8Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        this.resizeIfNeeded(value.length);
        this.array.set(value, this.offset);
        this.offset += value.length;
        return this;
      }
      uint8Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        this.resizeIfNeeded(value.length);
        this.array.set(value, this.offset);
        this.offset += value.length;
        return this;
      }
      int16Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Int16Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int16(entry);
          }
        }
        return this;
      }
      uint16Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Uint16Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint16(entry);
          }
        }
        return this;
      }
      int32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Int32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int32(entry);
          }
        }
        return this;
      }
      uint32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Uint32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint32(entry);
          }
        }
        return this;
      }
      int64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof BigInt64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.int64(BigInt(entry));
          }
        }
        return this;
      }
      uint64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof BigUint64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.uint64(BigInt(entry));
          }
        }
        return this;
      }
      float32Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Float32Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.float32(entry);
          }
        }
        return this;
      }
      float64Array(value, writeLength) {
        if (writeLength === true) {
          this.sequenceLength(value.length);
        }
        if (value instanceof Float64Array && this.littleEndian === this.hostLittleEndian && value.length >= CdrWriter.BUFFER_COPY_THRESHOLD) {
          this.align(value.BYTES_PER_ELEMENT, value.byteLength);
          this.array.set(new Uint8Array(value.buffer, value.byteOffset, value.byteLength), this.offset);
          this.offset += value.byteLength;
        } else {
          for (const entry of value) {
            this.float64(entry);
          }
        }
        return this;
      }
      align(size, bytesToWrite = size) {
        const alignment = (this.offset - this.origin) % size;
        const padding2 = alignment > 0 ? size - alignment : 0;
        this.resizeIfNeeded(padding2 + bytesToWrite);
        this.array.fill(0, this.offset, this.offset + padding2);
        this.offset += padding2;
      }
      resizeIfNeeded(additionalBytes) {
        const capacity = this.offset + additionalBytes;
        if (this.buffer.byteLength < capacity) {
          const doubled = this.buffer.byteLength * 2;
          const newCapacity = doubled > capacity ? doubled : capacity;
          this.resize(newCapacity);
        }
      }
      resize(capacity) {
        if (this.buffer.byteLength >= capacity) {
          return;
        }
        const buffer = new ArrayBuffer(capacity);
        const array = new Uint8Array(buffer);
        array.set(this.array);
        this.buffer = buffer;
        this.array = array;
        this.view = new DataView(buffer);
      }
    }
    CdrWriter$1.CdrWriter = CdrWriter;
    CdrWriter.DEFAULT_CAPACITY = 16;
    CdrWriter.BUFFER_COPY_THRESHOLD = 10;
    (function(exports2) {
      var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        Object.defineProperty(o, k2, { enumerable: true, get: function() {
          return m[k];
        } });
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      __exportStar(CdrReader$1, exports2);
      __exportStar(CdrSizeCalculator$1, exports2);
      __exportStar(CdrWriter$1, exports2);
      __exportStar(EncapsulationKind, exports2);
    })(dist);
    Object.defineProperty(MessageReader$1, "__esModule", { value: true });
    MessageReader$1.MessageReader = void 0;
    const cdr_1$1 = dist;
    class MessageReader {
      constructor(definitions) {
        const rootDefinition = definitions.find((def) => !isConstantModule$1(def));
        if (rootDefinition == void 0) {
          throw new Error("MessageReader initialized with no root MessageDefinition");
        }
        this.rootDefinition = rootDefinition.definitions;
        this.definitions = new Map(definitions.map((def) => [def.name ?? "", def.definitions]));
      }
      readMessage(buffer) {
        const reader2 = new cdr_1$1.CdrReader(buffer);
        return this.readComplexType(this.rootDefinition, reader2);
      }
      readComplexType(definition, reader2) {
        const msg = {};
        if (definition.length === 0) {
          reader2.uint8();
          return msg;
        }
        for (const field2 of definition) {
          if (field2.isConstant === true) {
            continue;
          }
          if (field2.isComplex === true) {
            const nestedDefinition = this.definitions.get(field2.type);
            if (nestedDefinition == void 0) {
              throw new Error(`Unrecognized complex type ${field2.type}`);
            }
            if (field2.isArray === true) {
              const arrayLength = field2.arrayLength ?? reader2.sequenceLength();
              const array = [];
              for (let i = 0; i < arrayLength; i++) {
                array.push(this.readComplexType(nestedDefinition, reader2));
              }
              msg[field2.name] = array;
            } else {
              msg[field2.name] = this.readComplexType(nestedDefinition, reader2);
            }
          } else {
            if (field2.isArray === true) {
              const deser = typedArrayDeserializers.get(field2.type);
              if (deser == void 0) {
                throw new Error(`Unrecognized primitive array type ${field2.type}[]`);
              }
              const arrayLength = field2.arrayLength ?? reader2.sequenceLength();
              msg[field2.name] = deser(reader2, arrayLength);
            } else {
              const deser = deserializers.get(field2.type);
              if (deser == void 0) {
                throw new Error(`Unrecognized primitive type ${field2.type}`);
              }
              msg[field2.name] = deser(reader2);
            }
          }
        }
        return msg;
      }
    }
    MessageReader$1.MessageReader = MessageReader;
    function isConstantModule$1(def) {
      return def.definitions.length > 0 && def.definitions.every((field2) => field2.isConstant);
    }
    const deserializers = /* @__PURE__ */ new Map([
      ["bool", (reader2) => Boolean(reader2.int8())],
      ["int8", (reader2) => reader2.int8()],
      ["uint8", (reader2) => reader2.uint8()],
      ["int16", (reader2) => reader2.int16()],
      ["uint16", (reader2) => reader2.uint16()],
      ["int32", (reader2) => reader2.int32()],
      ["uint32", (reader2) => reader2.uint32()],
      ["int64", (reader2) => reader2.int64()],
      ["uint64", (reader2) => reader2.uint64()],
      ["float32", (reader2) => reader2.float32()],
      ["float64", (reader2) => reader2.float64()],
      ["string", (reader2) => reader2.string()],
      ["time", (reader2) => ({ sec: reader2.int32(), nsec: reader2.uint32() })],
      ["duration", (reader2) => ({ sec: reader2.int32(), nsec: reader2.uint32() })]
    ]);
    const typedArrayDeserializers = /* @__PURE__ */ new Map([
      ["bool", readBoolArray],
      ["int8", (reader2, count) => reader2.int8Array(count)],
      ["uint8", (reader2, count) => reader2.uint8Array(count)],
      ["int16", (reader2, count) => reader2.int16Array(count)],
      ["uint16", (reader2, count) => reader2.uint16Array(count)],
      ["int32", (reader2, count) => reader2.int32Array(count)],
      ["uint32", (reader2, count) => reader2.uint32Array(count)],
      ["int64", (reader2, count) => reader2.int64Array(count)],
      ["uint64", (reader2, count) => reader2.uint64Array(count)],
      ["float32", (reader2, count) => reader2.float32Array(count)],
      ["float64", (reader2, count) => reader2.float64Array(count)],
      ["string", readStringArray],
      ["time", readTimeArray],
      ["duration", readTimeArray]
    ]);
    function readBoolArray(reader2, count) {
      const array = new Array(count);
      for (let i = 0; i < count; i++) {
        array[i] = Boolean(reader2.int8());
      }
      return array;
    }
    function readStringArray(reader2, count) {
      const array = new Array(count);
      for (let i = 0; i < count; i++) {
        array[i] = reader2.string();
      }
      return array;
    }
    function readTimeArray(reader2, count) {
      const array = new Array(count);
      for (let i = 0; i < count; i++) {
        const sec = reader2.int32();
        const nsec = reader2.uint32();
        array[i] = { sec, nsec };
      }
      return array;
    }
    var MessageWriter$1 = {};
    Object.defineProperty(MessageWriter$1, "__esModule", { value: true });
    MessageWriter$1.MessageWriter = void 0;
    const cdr_1 = dist;
    const PRIMITIVE_SIZES = /* @__PURE__ */ new Map([
      ["bool", 1],
      ["int8", 1],
      ["uint8", 1],
      ["int16", 2],
      ["uint16", 2],
      ["int32", 4],
      ["uint32", 4],
      ["int64", 8],
      ["uint64", 8],
      ["float32", 4],
      ["float64", 8],
      ["time", 8],
      ["duration", 8]
    ]);
    const PRIMITIVE_WRITERS = /* @__PURE__ */ new Map([
      ["bool", bool],
      ["int8", int8],
      ["uint8", uint8],
      ["int16", int16],
      ["uint16", uint16],
      ["int32", int32$1],
      ["uint32", uint32],
      ["int64", int64],
      ["uint64", uint64],
      ["float32", float32$1],
      ["float64", float64$1],
      ["string", string],
      ["time", time],
      ["duration", time]
    ]);
    const PRIMITIVE_ARRAY_WRITERS = /* @__PURE__ */ new Map([
      ["bool", boolArray],
      ["int8", int8Array],
      ["uint8", uint8Array],
      ["int16", int16Array],
      ["uint16", uint16Array],
      ["int32", int32Array],
      ["uint32", uint32Array],
      ["int64", int64Array],
      ["uint64", uint64Array],
      ["float32", float32Array],
      ["float64", float64Array],
      ["string", stringArray],
      ["time", timeArray],
      ["duration", timeArray]
    ]);
    class MessageWriter {
      constructor(definitions) {
        const rootDefinition = definitions.find((def) => !isConstantModule(def));
        if (rootDefinition == void 0) {
          throw new Error("MessageReader initialized with no root MessageDefinition");
        }
        this.rootDefinition = rootDefinition.definitions;
        this.definitions = new Map(definitions.map((def) => [def.name ?? "", def.definitions]));
      }
      calculateByteSize(message2) {
        return this.byteSize(this.rootDefinition, message2, 4);
      }
      writeMessage(message2, output) {
        const writer2 = new cdr_1.CdrWriter({
          buffer: output,
          size: output ? void 0 : this.calculateByteSize(message2)
        });
        this.write(this.rootDefinition, message2, writer2);
        return writer2.data;
      }
      byteSize(definition, message2, offset) {
        const messageObj = message2;
        let newOffset = offset;
        if (definition.length === 0) {
          return offset + this.getPrimitiveSize("uint8");
        }
        for (const field2 of definition) {
          if (field2.isConstant === true) {
            continue;
          }
          const nestedMessage = messageObj?.[field2.name];
          if (field2.isArray === true) {
            const arrayLength = field2.arrayLength ?? fieldLength(nestedMessage);
            const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
            const dataArray = dataIsArray ? nestedMessage : [];
            if (field2.arrayLength == void 0) {
              newOffset += padding(newOffset, 4);
              newOffset += 4;
            }
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? {};
                newOffset = this.byteSize(nestedDefinition, entry, newOffset);
              }
            } else if (field2.type === "string") {
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? "";
                newOffset += padding(newOffset, 4);
                newOffset += 4 + entry.length + 1;
              }
            } else {
              const entrySize = this.getPrimitiveSize(field2.type);
              const alignment = field2.type === "time" || field2.type === "duration" ? 4 : entrySize;
              newOffset += padding(newOffset, alignment);
              newOffset += entrySize * arrayLength;
            }
          } else {
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              const entry = nestedMessage ?? {};
              newOffset = this.byteSize(nestedDefinition, entry, newOffset);
            } else if (field2.type === "string") {
              const entry = typeof nestedMessage === "string" ? nestedMessage : "";
              newOffset += padding(newOffset, 4);
              newOffset += 4 + entry.length + 1;
            } else {
              const entrySize = this.getPrimitiveSize(field2.type);
              const alignment = field2.type === "time" || field2.type === "duration" ? 4 : entrySize;
              newOffset += padding(newOffset, alignment);
              newOffset += entrySize;
            }
          }
        }
        return newOffset;
      }
      write(definition, message2, writer2) {
        const messageObj = message2;
        if (definition.length === 0) {
          uint8(0, 0, writer2);
          return;
        }
        for (const field2 of definition) {
          if (field2.isConstant === true) {
            continue;
          }
          const nestedMessage = messageObj?.[field2.name];
          if (field2.isArray === true) {
            const arrayLength = field2.arrayLength ?? fieldLength(nestedMessage);
            const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
            const dataArray = dataIsArray ? nestedMessage : [];
            if (field2.arrayLength == void 0) {
              writer2.sequenceLength(arrayLength);
            }
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              for (let i = 0; i < arrayLength; i++) {
                const entry = dataArray[i] ?? {};
                this.write(nestedDefinition, entry, writer2);
              }
            } else {
              const arrayWriter = this.getPrimitiveArrayWriter(field2.type);
              arrayWriter(nestedMessage, field2.defaultValue, writer2);
            }
          } else {
            if (field2.isComplex === true) {
              const nestedDefinition = this.getDefinition(field2.type);
              const entry = nestedMessage ?? {};
              this.write(nestedDefinition, entry, writer2);
            } else {
              const primitiveWriter = this.getPrimitiveWriter(field2.type);
              primitiveWriter(nestedMessage, field2.defaultValue, writer2);
            }
          }
        }
      }
      getDefinition(datatype) {
        const nestedDefinition = this.definitions.get(datatype);
        if (nestedDefinition == void 0) {
          throw new Error(`Unrecognized complex type ${datatype}`);
        }
        return nestedDefinition;
      }
      getPrimitiveSize(primitiveType) {
        const size = PRIMITIVE_SIZES.get(primitiveType);
        if (size == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}`);
        }
        return size;
      }
      getPrimitiveWriter(primitiveType) {
        const writer2 = PRIMITIVE_WRITERS.get(primitiveType);
        if (writer2 == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}`);
        }
        return writer2;
      }
      getPrimitiveArrayWriter(primitiveType) {
        const writer2 = PRIMITIVE_ARRAY_WRITERS.get(primitiveType);
        if (writer2 == void 0) {
          throw new Error(`Unrecognized primitive type ${primitiveType}[]`);
        }
        return writer2;
      }
    }
    MessageWriter$1.MessageWriter = MessageWriter;
    function isConstantModule(def) {
      return def.definitions.length > 0 && def.definitions.every((field2) => field2.isConstant);
    }
    function fieldLength(value) {
      const length = value?.length;
      return typeof length === "number" ? length : 0;
    }
    function bool(value, defaultValue, writer2) {
      const boolValue = typeof value === "boolean" ? value : defaultValue ?? false;
      writer2.int8(boolValue ? 1 : 0);
    }
    function int8(value, defaultValue, writer2) {
      writer2.int8(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint8(value, defaultValue, writer2) {
      writer2.uint8(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int16(value, defaultValue, writer2) {
      writer2.int16(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint16(value, defaultValue, writer2) {
      writer2.uint16(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int32$1(value, defaultValue, writer2) {
      writer2.int32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function uint32(value, defaultValue, writer2) {
      writer2.uint32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function int64(value, defaultValue, writer2) {
      if (typeof value === "bigint") {
        writer2.int64(value);
      } else if (typeof value === "number") {
        writer2.int64(BigInt(value));
      } else {
        writer2.int64(defaultValue ?? 0n);
      }
    }
    function uint64(value, defaultValue, writer2) {
      if (typeof value === "bigint") {
        writer2.uint64(value);
      } else if (typeof value === "number") {
        writer2.uint64(BigInt(value));
      } else {
        writer2.uint64(defaultValue ?? 0n);
      }
    }
    function float32$1(value, defaultValue, writer2) {
      writer2.float32(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function float64$1(value, defaultValue, writer2) {
      writer2.float64(typeof value === "number" ? value : defaultValue ?? 0);
    }
    function string(value, defaultValue, writer2) {
      writer2.string(typeof value === "string" ? value : defaultValue ?? "");
    }
    function time(value, _defaultValue, writer2) {
      if (value == void 0) {
        writer2.int32(0);
        writer2.uint32(0);
        return;
      }
      const timeObj = value;
      writer2.int32(timeObj.sec ?? 0);
      writer2.uint32(timeObj.nsec ?? timeObj.nanosec ?? 0);
    }
    function boolArray(value, defaultValue, writer2) {
      if (Array.isArray(value)) {
        const array = new Int8Array(value);
        writer2.int8Array(array);
      } else {
        writer2.int8Array(defaultValue ?? []);
      }
    }
    function int8Array(value, defaultValue, writer2) {
      if (value instanceof Int8Array) {
        writer2.int8Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int8Array(value);
        writer2.int8Array(array);
      } else {
        writer2.int8Array(defaultValue ?? []);
      }
    }
    function uint8Array(value, defaultValue, writer2) {
      if (value instanceof Uint8Array) {
        writer2.uint8Array(value);
      } else if (value instanceof Uint8ClampedArray) {
        writer2.uint8Array(new Uint8Array(value));
      } else if (Array.isArray(value)) {
        const array = new Uint8Array(value);
        writer2.uint8Array(array);
      } else {
        writer2.uint8Array(defaultValue ?? []);
      }
    }
    function int16Array(value, defaultValue, writer2) {
      if (value instanceof Int16Array) {
        writer2.int16Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int16Array(value);
        writer2.int16Array(array);
      } else {
        writer2.int16Array(defaultValue ?? []);
      }
    }
    function uint16Array(value, defaultValue, writer2) {
      if (value instanceof Uint16Array) {
        writer2.uint16Array(value);
      } else if (Array.isArray(value)) {
        const array = new Uint16Array(value);
        writer2.uint16Array(array);
      } else {
        writer2.uint16Array(defaultValue ?? []);
      }
    }
    function int32Array(value, defaultValue, writer2) {
      if (value instanceof Int32Array) {
        writer2.int32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Int32Array(value);
        writer2.int32Array(array);
      } else {
        writer2.int32Array(defaultValue ?? []);
      }
    }
    function uint32Array(value, defaultValue, writer2) {
      if (value instanceof Uint32Array) {
        writer2.uint32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Uint32Array(value);
        writer2.uint32Array(array);
      } else {
        writer2.uint32Array(defaultValue ?? []);
      }
    }
    function int64Array(value, defaultValue, writer2) {
      if (value instanceof BigInt64Array) {
        writer2.int64Array(value);
      } else if (Array.isArray(value)) {
        const array = new BigInt64Array(value);
        writer2.int64Array(array);
      } else {
        writer2.int64Array(defaultValue ?? []);
      }
    }
    function uint64Array(value, defaultValue, writer2) {
      if (value instanceof BigUint64Array) {
        writer2.uint64Array(value);
      } else if (Array.isArray(value)) {
        const array = new BigUint64Array(value);
        writer2.uint64Array(array);
      } else {
        writer2.uint64Array(defaultValue ?? []);
      }
    }
    function float32Array(value, defaultValue, writer2) {
      if (value instanceof Float32Array) {
        writer2.float32Array(value);
      } else if (Array.isArray(value)) {
        const array = new Float32Array(value);
        writer2.float32Array(array);
      } else {
        writer2.float32Array(defaultValue ?? []);
      }
    }
    function float64Array(value, defaultValue, writer2) {
      if (value instanceof Float64Array) {
        writer2.float64Array(value);
      } else if (Array.isArray(value)) {
        const array = new Float64Array(value);
        writer2.float64Array(array);
      } else {
        writer2.float64Array(defaultValue ?? []);
      }
    }
    function stringArray(value, defaultValue, writer2) {
      if (Array.isArray(value)) {
        for (const item of value) {
          writer2.string(typeof item === "string" ? item : "");
        }
      } else {
        const array = defaultValue ?? [];
        for (const item of array) {
          writer2.string(item);
        }
      }
    }
    function timeArray(value, _defaultValue, writer2) {
      if (Array.isArray(value)) {
        for (const item of value) {
          time(item, void 0, writer2);
        }
      }
    }
    function padding(offset, byteWidth) {
      const alignment = (offset - 4) % byteWidth;
      return alignment > 0 ? byteWidth - alignment : 0;
    }
    (function(exports2) {
      var __createBinding = commonjsGlobal && commonjsGlobal.__createBinding || (Object.create ? function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = { enumerable: true, get: function() {
            return m[k];
          } };
        }
        Object.defineProperty(o, k2, desc);
      } : function(o, m, k, k2) {
        if (k2 === void 0)
          k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports3) {
        for (var p in m)
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
            __createBinding(exports3, m, p);
      };
      Object.defineProperty(exports2, "__esModule", { value: true });
      __exportStar(MessageReader$1, exports2);
      __exportStar(MessageWriter$1, exports2);
    })(dist$1);
    const SIZEOF_INT = 4;
    const FILE_IDENTIFIER_LENGTH = 4;
    const SIZE_PREFIX_LENGTH = 4;
    const int32 = new Int32Array(2);
    const float32 = new Float32Array(int32.buffer);
    const float64 = new Float64Array(int32.buffer);
    const isLittleEndian = new Uint16Array(new Uint8Array([1, 0]).buffer)[0] === 1;
    var Encoding;
    (function(Encoding2) {
      Encoding2[Encoding2["UTF8_BYTES"] = 1] = "UTF8_BYTES";
      Encoding2[Encoding2["UTF16_STRING"] = 2] = "UTF16_STRING";
    })(Encoding || (Encoding = {}));
    class ByteBuffer {
      constructor(bytes_) {
        this.bytes_ = bytes_;
        this.position_ = 0;
        this.text_decoder_ = new TextDecoder();
      }
      static allocate(byte_size) {
        return new ByteBuffer(new Uint8Array(byte_size));
      }
      clear() {
        this.position_ = 0;
      }
      bytes() {
        return this.bytes_;
      }
      position() {
        return this.position_;
      }
      setPosition(position) {
        this.position_ = position;
      }
      capacity() {
        return this.bytes_.length;
      }
      readInt8(offset) {
        return this.readUint8(offset) << 24 >> 24;
      }
      readUint8(offset) {
        return this.bytes_[offset];
      }
      readInt16(offset) {
        return this.readUint16(offset) << 16 >> 16;
      }
      readUint16(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8;
      }
      readInt32(offset) {
        return this.bytes_[offset] | this.bytes_[offset + 1] << 8 | this.bytes_[offset + 2] << 16 | this.bytes_[offset + 3] << 24;
      }
      readUint32(offset) {
        return this.readInt32(offset) >>> 0;
      }
      readInt64(offset) {
        return BigInt.asIntN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
      }
      readUint64(offset) {
        return BigInt.asUintN(64, BigInt(this.readUint32(offset)) + (BigInt(this.readUint32(offset + 4)) << BigInt(32)));
      }
      readFloat32(offset) {
        int32[0] = this.readInt32(offset);
        return float32[0];
      }
      readFloat64(offset) {
        int32[isLittleEndian ? 0 : 1] = this.readInt32(offset);
        int32[isLittleEndian ? 1 : 0] = this.readInt32(offset + 4);
        return float64[0];
      }
      writeInt8(offset, value) {
        this.bytes_[offset] = value;
      }
      writeUint8(offset, value) {
        this.bytes_[offset] = value;
      }
      writeInt16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
      }
      writeUint16(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
      }
      writeInt32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
      }
      writeUint32(offset, value) {
        this.bytes_[offset] = value;
        this.bytes_[offset + 1] = value >> 8;
        this.bytes_[offset + 2] = value >> 16;
        this.bytes_[offset + 3] = value >> 24;
      }
      writeInt64(offset, value) {
        this.writeInt32(offset, Number(BigInt.asIntN(32, value)));
        this.writeInt32(offset + 4, Number(BigInt.asIntN(32, value >> BigInt(32))));
      }
      writeUint64(offset, value) {
        this.writeUint32(offset, Number(BigInt.asUintN(32, value)));
        this.writeUint32(offset + 4, Number(BigInt.asUintN(32, value >> BigInt(32))));
      }
      writeFloat32(offset, value) {
        float32[0] = value;
        this.writeInt32(offset, int32[0]);
      }
      writeFloat64(offset, value) {
        float64[0] = value;
        this.writeInt32(offset, int32[isLittleEndian ? 0 : 1]);
        this.writeInt32(offset + 4, int32[isLittleEndian ? 1 : 0]);
      }
      getBufferIdentifier() {
        if (this.bytes_.length < this.position_ + SIZEOF_INT + FILE_IDENTIFIER_LENGTH) {
          throw new Error("FlatBuffers: ByteBuffer is too short to contain an identifier.");
        }
        let result = "";
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
          result += String.fromCharCode(this.readInt8(this.position_ + SIZEOF_INT + i));
        }
        return result;
      }
      __offset(bb_pos, vtable_offset) {
        const vtable = bb_pos - this.readInt32(bb_pos);
        return vtable_offset < this.readInt16(vtable) ? this.readInt16(vtable + vtable_offset) : 0;
      }
      __union(t, offset) {
        t.bb_pos = offset + this.readInt32(offset);
        t.bb = this;
        return t;
      }
      __string(offset, opt_encoding) {
        offset += this.readInt32(offset);
        const length = this.readInt32(offset);
        offset += SIZEOF_INT;
        const utf8bytes = this.bytes_.subarray(offset, offset + length);
        if (opt_encoding === Encoding.UTF8_BYTES)
          return utf8bytes;
        else
          return this.text_decoder_.decode(utf8bytes);
      }
      __union_with_string(o, offset) {
        if (typeof o === "string") {
          return this.__string(offset);
        }
        return this.__union(o, offset);
      }
      __indirect(offset) {
        return offset + this.readInt32(offset);
      }
      __vector(offset) {
        return offset + this.readInt32(offset) + SIZEOF_INT;
      }
      __vector_len(offset) {
        return this.readInt32(offset + this.readInt32(offset));
      }
      __has_identifier(ident) {
        if (ident.length != FILE_IDENTIFIER_LENGTH) {
          throw new Error("FlatBuffers: file identifier must be length " + FILE_IDENTIFIER_LENGTH);
        }
        for (let i = 0; i < FILE_IDENTIFIER_LENGTH; i++) {
          if (ident.charCodeAt(i) != this.readInt8(this.position() + SIZEOF_INT + i)) {
            return false;
          }
        }
        return true;
      }
      createScalarList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
          const val = listAccessor(i);
          if (val !== null) {
            ret.push(val);
          }
        }
        return ret;
      }
      createObjList(listAccessor, listLength) {
        const ret = [];
        for (let i = 0; i < listLength; ++i) {
          const val = listAccessor(i);
          if (val !== null) {
            ret.push(val.unpack());
          }
        }
        return ret;
      }
    }
    var BaseType;
    (function(BaseType2) {
      BaseType2[BaseType2["None"] = 0] = "None";
      BaseType2[BaseType2["UType"] = 1] = "UType";
      BaseType2[BaseType2["Bool"] = 2] = "Bool";
      BaseType2[BaseType2["Byte"] = 3] = "Byte";
      BaseType2[BaseType2["UByte"] = 4] = "UByte";
      BaseType2[BaseType2["Short"] = 5] = "Short";
      BaseType2[BaseType2["UShort"] = 6] = "UShort";
      BaseType2[BaseType2["Int"] = 7] = "Int";
      BaseType2[BaseType2["UInt"] = 8] = "UInt";
      BaseType2[BaseType2["Long"] = 9] = "Long";
      BaseType2[BaseType2["ULong"] = 10] = "ULong";
      BaseType2[BaseType2["Float"] = 11] = "Float";
      BaseType2[BaseType2["Double"] = 12] = "Double";
      BaseType2[BaseType2["String"] = 13] = "String";
      BaseType2[BaseType2["Vector"] = 14] = "Vector";
      BaseType2[BaseType2["Obj"] = 15] = "Obj";
      BaseType2[BaseType2["Union"] = 16] = "Union";
      BaseType2[BaseType2["Array"] = 17] = "Array";
      BaseType2[BaseType2["MaxBaseType"] = 18] = "MaxBaseType";
    })(BaseType || (BaseType = {}));
    var AdvancedFeatures;
    (function(AdvancedFeatures2) {
      AdvancedFeatures2["AdvancedArrayFeatures"] = "1";
      AdvancedFeatures2["AdvancedUnionFeatures"] = "2";
      AdvancedFeatures2["OptionalScalars"] = "4";
      AdvancedFeatures2["DefaultVectorsAndStrings"] = "8";
    })(AdvancedFeatures || (AdvancedFeatures = {}));
    class Type {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsType(bb, obj) {
        return (obj || new Type()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsType(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Type()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      baseType() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : BaseType.None;
      }
      mutate_base_type(value) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, value);
        return true;
      }
      element() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt8(this.bb_pos + offset) : BaseType.None;
      }
      mutate_element(value) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, value);
        return true;
      }
      index() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : -1;
      }
      mutate_index(value) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt32(this.bb_pos + offset, value);
        return true;
      }
      fixedLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 0;
      }
      mutate_fixed_length(value) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint16(this.bb_pos + offset, value);
        return true;
      }
      baseSize() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 4;
      }
      mutate_base_size(value) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint32(this.bb_pos + offset, value);
        return true;
      }
      elementSize() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readUint32(this.bb_pos + offset) : 0;
      }
      mutate_element_size(value) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint32(this.bb_pos + offset, value);
        return true;
      }
      static getFullyQualifiedName() {
        return "reflection.Type";
      }
      static startType(builder) {
        builder.startObject(6);
      }
      static addBaseType(builder, baseType) {
        builder.addFieldInt8(0, baseType, BaseType.None);
      }
      static addElement(builder, element) {
        builder.addFieldInt8(1, element, BaseType.None);
      }
      static addIndex(builder, index) {
        builder.addFieldInt32(2, index, -1);
      }
      static addFixedLength(builder, fixedLength) {
        builder.addFieldInt16(3, fixedLength, 0);
      }
      static addBaseSize(builder, baseSize) {
        builder.addFieldInt32(4, baseSize, 4);
      }
      static addElementSize(builder, elementSize) {
        builder.addFieldInt32(5, elementSize, 0);
      }
      static endType(builder) {
        const offset = builder.endObject();
        return offset;
      }
      static createType(builder, baseType, element, index, fixedLength, baseSize, elementSize) {
        Type.startType(builder);
        Type.addBaseType(builder, baseType);
        Type.addElement(builder, element);
        Type.addIndex(builder, index);
        Type.addFixedLength(builder, fixedLength);
        Type.addBaseSize(builder, baseSize);
        Type.addElementSize(builder, elementSize);
        return Type.endType(builder);
      }
      unpack() {
        return new TypeT(this.baseType(), this.element(), this.index(), this.fixedLength(), this.baseSize(), this.elementSize());
      }
      unpackTo(_o) {
        _o.baseType = this.baseType();
        _o.element = this.element();
        _o.index = this.index();
        _o.fixedLength = this.fixedLength();
        _o.baseSize = this.baseSize();
        _o.elementSize = this.elementSize();
      }
    }
    class TypeT {
      constructor(baseType = BaseType.None, element = BaseType.None, index = -1, fixedLength = 0, baseSize = 4, elementSize = 0) {
        __publicField(this, "baseType");
        __publicField(this, "element");
        __publicField(this, "index");
        __publicField(this, "fixedLength");
        __publicField(this, "baseSize");
        __publicField(this, "elementSize");
        this.baseType = baseType;
        this.element = element;
        this.index = index;
        this.fixedLength = fixedLength;
        this.baseSize = baseSize;
        this.elementSize = elementSize;
      }
      pack(builder) {
        return Type.createType(builder, this.baseType, this.element, this.index, this.fixedLength, this.baseSize, this.elementSize);
      }
    }
    class KeyValue {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsKeyValue(bb, obj) {
        return (obj || new KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsKeyValue(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new KeyValue()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      key(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      value(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      static getFullyQualifiedName() {
        return "reflection.KeyValue";
      }
      static startKeyValue(builder) {
        builder.startObject(2);
      }
      static addKey(builder, keyOffset) {
        builder.addFieldOffset(0, keyOffset, 0);
      }
      static addValue(builder, valueOffset) {
        builder.addFieldOffset(1, valueOffset, 0);
      }
      static endKeyValue(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        return offset;
      }
      static createKeyValue(builder, keyOffset, valueOffset) {
        KeyValue.startKeyValue(builder);
        KeyValue.addKey(builder, keyOffset);
        KeyValue.addValue(builder, valueOffset);
        return KeyValue.endKeyValue(builder);
      }
      unpack() {
        return new KeyValueT(this.key(), this.value());
      }
      unpackTo(_o) {
        _o.key = this.key();
        _o.value = this.value();
      }
    }
    class KeyValueT {
      constructor(key = null, value = null) {
        __publicField(this, "key");
        __publicField(this, "value");
        this.key = key;
        this.value = value;
      }
      pack(builder) {
        const key = this.key !== null ? builder.createString(this.key) : 0;
        const value = this.value !== null ? builder.createString(this.value) : 0;
        return KeyValue.createKeyValue(builder, key, value);
      }
    }
    class EnumVal {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsEnumVal(bb, obj) {
        return (obj || new EnumVal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsEnumVal(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new EnumVal()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      value() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
      }
      mutate_value(value) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt64(this.bb_pos + offset, value);
        return true;
      }
      unionType(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new Type()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      static getFullyQualifiedName() {
        return "reflection.EnumVal";
      }
      static startEnumVal(builder) {
        builder.startObject(5);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addValue(builder, value) {
        builder.addFieldInt64(1, value, BigInt("0"));
      }
      static addUnionType(builder, unionTypeOffset) {
        builder.addFieldOffset(3, unionTypeOffset, 0);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(4, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static endEnumVal(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        return offset;
      }
      unpack() {
        return new EnumValT(this.name(), this.value(), this.unionType() !== null ? this.unionType().unpack() : null, this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()));
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.value = this.value();
        _o.unionType = this.unionType() !== null ? this.unionType().unpack() : null;
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
      }
    }
    class EnumValT {
      constructor(name = null, value = BigInt("0"), unionType = null, documentation = []) {
        __publicField(this, "name");
        __publicField(this, "value");
        __publicField(this, "unionType");
        __publicField(this, "documentation");
        this.name = name;
        this.value = value;
        this.unionType = unionType;
        this.documentation = documentation;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const unionType = this.unionType !== null ? this.unionType.pack(builder) : 0;
        const documentation = EnumVal.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        EnumVal.startEnumVal(builder);
        EnumVal.addName(builder, name);
        EnumVal.addValue(builder, this.value);
        EnumVal.addUnionType(builder, unionType);
        EnumVal.addDocumentation(builder, documentation);
        return EnumVal.endEnumVal(builder);
      }
    }
    class Enum {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsEnum(bb, obj) {
        return (obj || new Enum()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsEnum(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Enum()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      values(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new EnumVal()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      valuesLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      isUnion() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_is_union(value) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      underlyingType(obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new Type()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      attributes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      attributesLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      declarationFile(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      static getFullyQualifiedName() {
        return "reflection.Enum";
      }
      static startEnum(builder) {
        builder.startObject(7);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addValues(builder, valuesOffset) {
        builder.addFieldOffset(1, valuesOffset, 0);
      }
      static createValuesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startValuesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addIsUnion(builder, isUnion) {
        builder.addFieldInt8(2, +isUnion, 0);
      }
      static addUnderlyingType(builder, underlyingTypeOffset) {
        builder.addFieldOffset(3, underlyingTypeOffset, 0);
      }
      static addAttributes(builder, attributesOffset) {
        builder.addFieldOffset(4, attributesOffset, 0);
      }
      static createAttributesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startAttributesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(5, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDeclarationFile(builder, declarationFileOffset) {
        builder.addFieldOffset(6, declarationFileOffset, 0);
      }
      static endEnum(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        builder.requiredField(offset, 6);
        builder.requiredField(offset, 10);
        return offset;
      }
      unpack() {
        return new EnumT(this.name(), this.bb.createObjList(this.values.bind(this), this.valuesLength()), this.isUnion(), this.underlyingType() !== null ? this.underlyingType().unpack() : null, this.bb.createObjList(this.attributes.bind(this), this.attributesLength()), this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()), this.declarationFile());
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.values = this.bb.createObjList(this.values.bind(this), this.valuesLength());
        _o.isUnion = this.isUnion();
        _o.underlyingType = this.underlyingType() !== null ? this.underlyingType().unpack() : null;
        _o.attributes = this.bb.createObjList(this.attributes.bind(this), this.attributesLength());
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
        _o.declarationFile = this.declarationFile();
      }
    }
    class EnumT {
      constructor(name = null, values = [], isUnion = false, underlyingType = null, attributes = [], documentation = [], declarationFile = null) {
        __publicField(this, "name");
        __publicField(this, "values");
        __publicField(this, "isUnion");
        __publicField(this, "underlyingType");
        __publicField(this, "attributes");
        __publicField(this, "documentation");
        __publicField(this, "declarationFile");
        this.name = name;
        this.values = values;
        this.isUnion = isUnion;
        this.underlyingType = underlyingType;
        this.attributes = attributes;
        this.documentation = documentation;
        this.declarationFile = declarationFile;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const values = Enum.createValuesVector(builder, builder.createObjectOffsetList(this.values));
        const underlyingType = this.underlyingType !== null ? this.underlyingType.pack(builder) : 0;
        const attributes = Enum.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));
        const documentation = Enum.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        const declarationFile = this.declarationFile !== null ? builder.createString(this.declarationFile) : 0;
        Enum.startEnum(builder);
        Enum.addName(builder, name);
        Enum.addValues(builder, values);
        Enum.addIsUnion(builder, this.isUnion);
        Enum.addUnderlyingType(builder, underlyingType);
        Enum.addAttributes(builder, attributes);
        Enum.addDocumentation(builder, documentation);
        Enum.addDeclarationFile(builder, declarationFile);
        return Enum.endEnum(builder);
      }
    }
    class Field {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsField(bb, obj) {
        return (obj || new Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsField(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Field()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      type(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Type()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      id() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 0;
      }
      mutate_id(value) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint16(this.bb_pos + offset, value);
        return true;
      }
      offset() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 0;
      }
      mutate_offset(value) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint16(this.bb_pos + offset, value);
        return true;
      }
      defaultInteger() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt64(this.bb_pos + offset) : BigInt("0");
      }
      mutate_default_integer(value) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt64(this.bb_pos + offset, value);
        return true;
      }
      defaultReal() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.readFloat64(this.bb_pos + offset) : 0;
      }
      mutate_default_real(value) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        if (offset === 0) {
          return false;
        }
        this.bb.writeFloat64(this.bb_pos + offset, value);
        return true;
      }
      deprecated() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_deprecated(value) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      required() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_required(value) {
        const offset = this.bb.__offset(this.bb_pos, 18);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      key() {
        const offset = this.bb.__offset(this.bb_pos, 20);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_key(value) {
        const offset = this.bb.__offset(this.bb_pos, 20);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      attributes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      attributesLength() {
        const offset = this.bb.__offset(this.bb_pos, 22);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 24);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      optional() {
        const offset = this.bb.__offset(this.bb_pos, 26);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_optional(value) {
        const offset = this.bb.__offset(this.bb_pos, 26);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      padding() {
        const offset = this.bb.__offset(this.bb_pos, 28);
        return offset ? this.bb.readUint16(this.bb_pos + offset) : 0;
      }
      mutate_padding(value) {
        const offset = this.bb.__offset(this.bb_pos, 28);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint16(this.bb_pos + offset, value);
        return true;
      }
      static getFullyQualifiedName() {
        return "reflection.Field";
      }
      static startField(builder) {
        builder.startObject(13);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addType(builder, typeOffset) {
        builder.addFieldOffset(1, typeOffset, 0);
      }
      static addId(builder, id) {
        builder.addFieldInt16(2, id, 0);
      }
      static addOffset(builder, offset) {
        builder.addFieldInt16(3, offset, 0);
      }
      static addDefaultInteger(builder, defaultInteger) {
        builder.addFieldInt64(4, defaultInteger, BigInt("0"));
      }
      static addDefaultReal(builder, defaultReal) {
        builder.addFieldFloat64(5, defaultReal, 0);
      }
      static addDeprecated(builder, deprecated) {
        builder.addFieldInt8(6, +deprecated, 0);
      }
      static addRequired(builder, required) {
        builder.addFieldInt8(7, +required, 0);
      }
      static addKey(builder, key) {
        builder.addFieldInt8(8, +key, 0);
      }
      static addAttributes(builder, attributesOffset) {
        builder.addFieldOffset(9, attributesOffset, 0);
      }
      static createAttributesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startAttributesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(10, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addOptional(builder, optional) {
        builder.addFieldInt8(11, +optional, 0);
      }
      static addPadding(builder, padding2) {
        builder.addFieldInt16(12, padding2, 0);
      }
      static endField(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        builder.requiredField(offset, 6);
        return offset;
      }
      unpack() {
        return new FieldT(this.name(), this.type() !== null ? this.type().unpack() : null, this.id(), this.offset(), this.defaultInteger(), this.defaultReal(), this.deprecated(), this.required(), this.key(), this.bb.createObjList(this.attributes.bind(this), this.attributesLength()), this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()), this.optional(), this.padding());
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.type = this.type() !== null ? this.type().unpack() : null;
        _o.id = this.id();
        _o.offset = this.offset();
        _o.defaultInteger = this.defaultInteger();
        _o.defaultReal = this.defaultReal();
        _o.deprecated = this.deprecated();
        _o.required = this.required();
        _o.key = this.key();
        _o.attributes = this.bb.createObjList(this.attributes.bind(this), this.attributesLength());
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
        _o.optional = this.optional();
        _o.padding = this.padding();
      }
    }
    class FieldT {
      constructor(name = null, type2 = null, id = 0, offset = 0, defaultInteger = BigInt("0"), defaultReal = 0, deprecated = false, required = false, key = false, attributes = [], documentation = [], optional = false, padding2 = 0) {
        __publicField(this, "name");
        __publicField(this, "type");
        __publicField(this, "id");
        __publicField(this, "offset");
        __publicField(this, "defaultInteger");
        __publicField(this, "defaultReal");
        __publicField(this, "deprecated");
        __publicField(this, "required");
        __publicField(this, "key");
        __publicField(this, "attributes");
        __publicField(this, "documentation");
        __publicField(this, "optional");
        __publicField(this, "padding");
        this.name = name;
        this.type = type2;
        this.id = id;
        this.offset = offset;
        this.defaultInteger = defaultInteger;
        this.defaultReal = defaultReal;
        this.deprecated = deprecated;
        this.required = required;
        this.key = key;
        this.attributes = attributes;
        this.documentation = documentation;
        this.optional = optional;
        this.padding = padding2;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const type2 = this.type !== null ? this.type.pack(builder) : 0;
        const attributes = Field.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));
        const documentation = Field.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        Field.startField(builder);
        Field.addName(builder, name);
        Field.addType(builder, type2);
        Field.addId(builder, this.id);
        Field.addOffset(builder, this.offset);
        Field.addDefaultInteger(builder, this.defaultInteger);
        Field.addDefaultReal(builder, this.defaultReal);
        Field.addDeprecated(builder, this.deprecated);
        Field.addRequired(builder, this.required);
        Field.addKey(builder, this.key);
        Field.addAttributes(builder, attributes);
        Field.addDocumentation(builder, documentation);
        Field.addOptional(builder, this.optional);
        Field.addPadding(builder, this.padding);
        return Field.endField(builder);
      }
    }
    class Object_ {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsObject(bb, obj) {
        return (obj || new Object_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsObject(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Object_()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      fields(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Field()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      fieldsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      isStruct() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? !!this.bb.readInt8(this.bb_pos + offset) : false;
      }
      mutate_is_struct(value) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt8(this.bb_pos + offset, +value);
        return true;
      }
      minalign() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
      }
      mutate_minalign(value) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt32(this.bb_pos + offset, value);
        return true;
      }
      bytesize() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.readInt32(this.bb_pos + offset) : 0;
      }
      mutate_bytesize(value) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        if (offset === 0) {
          return false;
        }
        this.bb.writeInt32(this.bb_pos + offset, value);
        return true;
      }
      attributes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      attributesLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      declarationFile(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      static getFullyQualifiedName() {
        return "reflection.Object";
      }
      static startObject(builder) {
        builder.startObject(8);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addFields(builder, fieldsOffset) {
        builder.addFieldOffset(1, fieldsOffset, 0);
      }
      static createFieldsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startFieldsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addIsStruct(builder, isStruct) {
        builder.addFieldInt8(2, +isStruct, 0);
      }
      static addMinalign(builder, minalign) {
        builder.addFieldInt32(3, minalign, 0);
      }
      static addBytesize(builder, bytesize) {
        builder.addFieldInt32(4, bytesize, 0);
      }
      static addAttributes(builder, attributesOffset) {
        builder.addFieldOffset(5, attributesOffset, 0);
      }
      static createAttributesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startAttributesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(6, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDeclarationFile(builder, declarationFileOffset) {
        builder.addFieldOffset(7, declarationFileOffset, 0);
      }
      static endObject(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        builder.requiredField(offset, 6);
        return offset;
      }
      static createObject(builder, nameOffset, fieldsOffset, isStruct, minalign, bytesize, attributesOffset, documentationOffset, declarationFileOffset) {
        Object_.startObject(builder);
        Object_.addName(builder, nameOffset);
        Object_.addFields(builder, fieldsOffset);
        Object_.addIsStruct(builder, isStruct);
        Object_.addMinalign(builder, minalign);
        Object_.addBytesize(builder, bytesize);
        Object_.addAttributes(builder, attributesOffset);
        Object_.addDocumentation(builder, documentationOffset);
        Object_.addDeclarationFile(builder, declarationFileOffset);
        return Object_.endObject(builder);
      }
      unpack() {
        return new ObjectT(this.name(), this.bb.createObjList(this.fields.bind(this), this.fieldsLength()), this.isStruct(), this.minalign(), this.bytesize(), this.bb.createObjList(this.attributes.bind(this), this.attributesLength()), this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()), this.declarationFile());
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.fields = this.bb.createObjList(this.fields.bind(this), this.fieldsLength());
        _o.isStruct = this.isStruct();
        _o.minalign = this.minalign();
        _o.bytesize = this.bytesize();
        _o.attributes = this.bb.createObjList(this.attributes.bind(this), this.attributesLength());
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
        _o.declarationFile = this.declarationFile();
      }
    }
    class ObjectT {
      constructor(name = null, fields = [], isStruct = false, minalign = 0, bytesize = 0, attributes = [], documentation = [], declarationFile = null) {
        __publicField(this, "name");
        __publicField(this, "fields");
        __publicField(this, "isStruct");
        __publicField(this, "minalign");
        __publicField(this, "bytesize");
        __publicField(this, "attributes");
        __publicField(this, "documentation");
        __publicField(this, "declarationFile");
        this.name = name;
        this.fields = fields;
        this.isStruct = isStruct;
        this.minalign = minalign;
        this.bytesize = bytesize;
        this.attributes = attributes;
        this.documentation = documentation;
        this.declarationFile = declarationFile;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const fields = Object_.createFieldsVector(builder, builder.createObjectOffsetList(this.fields));
        const attributes = Object_.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));
        const documentation = Object_.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        const declarationFile = this.declarationFile !== null ? builder.createString(this.declarationFile) : 0;
        return Object_.createObject(builder, name, fields, this.isStruct, this.minalign, this.bytesize, attributes, documentation, declarationFile);
      }
    }
    class RPCCall {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsRPCCall(bb, obj) {
        return (obj || new RPCCall()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsRPCCall(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new RPCCall()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      request(obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Object_()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      response(obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new Object_()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      attributes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      attributesLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      static getFullyQualifiedName() {
        return "reflection.RPCCall";
      }
      static startRPCCall(builder) {
        builder.startObject(5);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addRequest(builder, requestOffset) {
        builder.addFieldOffset(1, requestOffset, 0);
      }
      static addResponse(builder, responseOffset) {
        builder.addFieldOffset(2, responseOffset, 0);
      }
      static addAttributes(builder, attributesOffset) {
        builder.addFieldOffset(3, attributesOffset, 0);
      }
      static createAttributesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startAttributesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(4, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static endRPCCall(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        builder.requiredField(offset, 6);
        builder.requiredField(offset, 8);
        return offset;
      }
      unpack() {
        return new RPCCallT(this.name(), this.request() !== null ? this.request().unpack() : null, this.response() !== null ? this.response().unpack() : null, this.bb.createObjList(this.attributes.bind(this), this.attributesLength()), this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()));
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.request = this.request() !== null ? this.request().unpack() : null;
        _o.response = this.response() !== null ? this.response().unpack() : null;
        _o.attributes = this.bb.createObjList(this.attributes.bind(this), this.attributesLength());
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
      }
    }
    class RPCCallT {
      constructor(name = null, request = null, response = null, attributes = [], documentation = []) {
        __publicField(this, "name");
        __publicField(this, "request");
        __publicField(this, "response");
        __publicField(this, "attributes");
        __publicField(this, "documentation");
        this.name = name;
        this.request = request;
        this.response = response;
        this.attributes = attributes;
        this.documentation = documentation;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const request = this.request !== null ? this.request.pack(builder) : 0;
        const response = this.response !== null ? this.response.pack(builder) : 0;
        const attributes = RPCCall.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));
        const documentation = RPCCall.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        RPCCall.startRPCCall(builder);
        RPCCall.addName(builder, name);
        RPCCall.addRequest(builder, request);
        RPCCall.addResponse(builder, response);
        RPCCall.addAttributes(builder, attributes);
        RPCCall.addDocumentation(builder, documentation);
        return RPCCall.endRPCCall(builder);
      }
    }
    class Service {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsService(bb, obj) {
        return (obj || new Service()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsService(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Service()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      name(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      calls(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new RPCCall()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      callsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      attributes(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? (obj || new KeyValue()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      attributesLength() {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      documentation(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      documentationLength() {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      declarationFile(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      static getFullyQualifiedName() {
        return "reflection.Service";
      }
      static startService(builder) {
        builder.startObject(5);
      }
      static addName(builder, nameOffset) {
        builder.addFieldOffset(0, nameOffset, 0);
      }
      static addCalls(builder, callsOffset) {
        builder.addFieldOffset(1, callsOffset, 0);
      }
      static createCallsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startCallsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addAttributes(builder, attributesOffset) {
        builder.addFieldOffset(2, attributesOffset, 0);
      }
      static createAttributesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startAttributesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDocumentation(builder, documentationOffset) {
        builder.addFieldOffset(3, documentationOffset, 0);
      }
      static createDocumentationVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startDocumentationVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addDeclarationFile(builder, declarationFileOffset) {
        builder.addFieldOffset(4, declarationFileOffset, 0);
      }
      static endService(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        return offset;
      }
      static createService(builder, nameOffset, callsOffset, attributesOffset, documentationOffset, declarationFileOffset) {
        Service.startService(builder);
        Service.addName(builder, nameOffset);
        Service.addCalls(builder, callsOffset);
        Service.addAttributes(builder, attributesOffset);
        Service.addDocumentation(builder, documentationOffset);
        Service.addDeclarationFile(builder, declarationFileOffset);
        return Service.endService(builder);
      }
      unpack() {
        return new ServiceT(this.name(), this.bb.createObjList(this.calls.bind(this), this.callsLength()), this.bb.createObjList(this.attributes.bind(this), this.attributesLength()), this.bb.createScalarList(this.documentation.bind(this), this.documentationLength()), this.declarationFile());
      }
      unpackTo(_o) {
        _o.name = this.name();
        _o.calls = this.bb.createObjList(this.calls.bind(this), this.callsLength());
        _o.attributes = this.bb.createObjList(this.attributes.bind(this), this.attributesLength());
        _o.documentation = this.bb.createScalarList(this.documentation.bind(this), this.documentationLength());
        _o.declarationFile = this.declarationFile();
      }
    }
    class ServiceT {
      constructor(name = null, calls = [], attributes = [], documentation = [], declarationFile = null) {
        __publicField(this, "name");
        __publicField(this, "calls");
        __publicField(this, "attributes");
        __publicField(this, "documentation");
        __publicField(this, "declarationFile");
        this.name = name;
        this.calls = calls;
        this.attributes = attributes;
        this.documentation = documentation;
        this.declarationFile = declarationFile;
      }
      pack(builder) {
        const name = this.name !== null ? builder.createString(this.name) : 0;
        const calls = Service.createCallsVector(builder, builder.createObjectOffsetList(this.calls));
        const attributes = Service.createAttributesVector(builder, builder.createObjectOffsetList(this.attributes));
        const documentation = Service.createDocumentationVector(builder, builder.createObjectOffsetList(this.documentation));
        const declarationFile = this.declarationFile !== null ? builder.createString(this.declarationFile) : 0;
        return Service.createService(builder, name, calls, attributes, documentation, declarationFile);
      }
    }
    class SchemaFile {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsSchemaFile(bb, obj) {
        return (obj || new SchemaFile()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsSchemaFile(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new SchemaFile()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      filename(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      includedFilenames(index, optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__string(this.bb.__vector(this.bb_pos + offset) + index * 4, optionalEncoding) : null;
      }
      includedFilenamesLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      static getFullyQualifiedName() {
        return "reflection.SchemaFile";
      }
      static startSchemaFile(builder) {
        builder.startObject(2);
      }
      static addFilename(builder, filenameOffset) {
        builder.addFieldOffset(0, filenameOffset, 0);
      }
      static addIncludedFilenames(builder, includedFilenamesOffset) {
        builder.addFieldOffset(1, includedFilenamesOffset, 0);
      }
      static createIncludedFilenamesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startIncludedFilenamesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static endSchemaFile(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        return offset;
      }
      static createSchemaFile(builder, filenameOffset, includedFilenamesOffset) {
        SchemaFile.startSchemaFile(builder);
        SchemaFile.addFilename(builder, filenameOffset);
        SchemaFile.addIncludedFilenames(builder, includedFilenamesOffset);
        return SchemaFile.endSchemaFile(builder);
      }
      unpack() {
        return new SchemaFileT(this.filename(), this.bb.createScalarList(this.includedFilenames.bind(this), this.includedFilenamesLength()));
      }
      unpackTo(_o) {
        _o.filename = this.filename();
        _o.includedFilenames = this.bb.createScalarList(this.includedFilenames.bind(this), this.includedFilenamesLength());
      }
    }
    class SchemaFileT {
      constructor(filename = null, includedFilenames = []) {
        __publicField(this, "filename");
        __publicField(this, "includedFilenames");
        this.filename = filename;
        this.includedFilenames = includedFilenames;
      }
      pack(builder) {
        const filename = this.filename !== null ? builder.createString(this.filename) : 0;
        const includedFilenames = SchemaFile.createIncludedFilenamesVector(builder, builder.createObjectOffsetList(this.includedFilenames));
        return SchemaFile.createSchemaFile(builder, filename, includedFilenames);
      }
    }
    class Schema {
      constructor() {
        __publicField(this, "bb", null);
        __publicField(this, "bb_pos", 0);
      }
      __init(i, bb) {
        this.bb_pos = i;
        this.bb = bb;
        return this;
      }
      static getRootAsSchema(bb, obj) {
        return (obj || new Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static getSizePrefixedRootAsSchema(bb, obj) {
        bb.setPosition(bb.position() + SIZE_PREFIX_LENGTH);
        return (obj || new Schema()).__init(bb.readInt32(bb.position()) + bb.position(), bb);
      }
      static bufferHasIdentifier(bb) {
        return bb.__has_identifier("BFBS");
      }
      objects(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? (obj || new Object_()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      objectsLength() {
        const offset = this.bb.__offset(this.bb_pos, 4);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      enums(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? (obj || new Enum()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      enumsLength() {
        const offset = this.bb.__offset(this.bb_pos, 6);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      fileIdent(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 8);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      fileExt(optionalEncoding) {
        const offset = this.bb.__offset(this.bb_pos, 10);
        return offset ? this.bb.__string(this.bb_pos + offset, optionalEncoding) : null;
      }
      rootTable(obj) {
        const offset = this.bb.__offset(this.bb_pos, 12);
        return offset ? (obj || new Object_()).__init(this.bb.__indirect(this.bb_pos + offset), this.bb) : null;
      }
      services(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? (obj || new Service()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      servicesLength() {
        const offset = this.bb.__offset(this.bb_pos, 14);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      advancedFeatures() {
        const offset = this.bb.__offset(this.bb_pos, 16);
        return offset ? this.bb.readUint64(this.bb_pos + offset) : BigInt("0");
      }
      mutate_advanced_features(value) {
        const offset = this.bb.__offset(this.bb_pos, 16);
        if (offset === 0) {
          return false;
        }
        this.bb.writeUint64(this.bb_pos + offset, value);
        return true;
      }
      fbsFiles(index, obj) {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? (obj || new SchemaFile()).__init(this.bb.__indirect(this.bb.__vector(this.bb_pos + offset) + index * 4), this.bb) : null;
      }
      fbsFilesLength() {
        const offset = this.bb.__offset(this.bb_pos, 18);
        return offset ? this.bb.__vector_len(this.bb_pos + offset) : 0;
      }
      static getFullyQualifiedName() {
        return "reflection.Schema";
      }
      static startSchema(builder) {
        builder.startObject(8);
      }
      static addObjects(builder, objectsOffset) {
        builder.addFieldOffset(0, objectsOffset, 0);
      }
      static createObjectsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startObjectsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addEnums(builder, enumsOffset) {
        builder.addFieldOffset(1, enumsOffset, 0);
      }
      static createEnumsVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startEnumsVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addFileIdent(builder, fileIdentOffset) {
        builder.addFieldOffset(2, fileIdentOffset, 0);
      }
      static addFileExt(builder, fileExtOffset) {
        builder.addFieldOffset(3, fileExtOffset, 0);
      }
      static addRootTable(builder, rootTableOffset) {
        builder.addFieldOffset(4, rootTableOffset, 0);
      }
      static addServices(builder, servicesOffset) {
        builder.addFieldOffset(5, servicesOffset, 0);
      }
      static createServicesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startServicesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static addAdvancedFeatures(builder, advancedFeatures) {
        builder.addFieldInt64(6, advancedFeatures, BigInt("0"));
      }
      static addFbsFiles(builder, fbsFilesOffset) {
        builder.addFieldOffset(7, fbsFilesOffset, 0);
      }
      static createFbsFilesVector(builder, data) {
        builder.startVector(4, data.length, 4);
        for (let i = data.length - 1; i >= 0; i--) {
          builder.addOffset(data[i]);
        }
        return builder.endVector();
      }
      static startFbsFilesVector(builder, numElems) {
        builder.startVector(4, numElems, 4);
      }
      static endSchema(builder) {
        const offset = builder.endObject();
        builder.requiredField(offset, 4);
        builder.requiredField(offset, 6);
        return offset;
      }
      static finishSchemaBuffer(builder, offset) {
        builder.finish(offset, "BFBS");
      }
      static finishSizePrefixedSchemaBuffer(builder, offset) {
        builder.finish(offset, "BFBS", true);
      }
      unpack() {
        return new SchemaT(this.bb.createObjList(this.objects.bind(this), this.objectsLength()), this.bb.createObjList(this.enums.bind(this), this.enumsLength()), this.fileIdent(), this.fileExt(), this.rootTable() !== null ? this.rootTable().unpack() : null, this.bb.createObjList(this.services.bind(this), this.servicesLength()), this.advancedFeatures(), this.bb.createObjList(this.fbsFiles.bind(this), this.fbsFilesLength()));
      }
      unpackTo(_o) {
        _o.objects = this.bb.createObjList(this.objects.bind(this), this.objectsLength());
        _o.enums = this.bb.createObjList(this.enums.bind(this), this.enumsLength());
        _o.fileIdent = this.fileIdent();
        _o.fileExt = this.fileExt();
        _o.rootTable = this.rootTable() !== null ? this.rootTable().unpack() : null;
        _o.services = this.bb.createObjList(this.services.bind(this), this.servicesLength());
        _o.advancedFeatures = this.advancedFeatures();
        _o.fbsFiles = this.bb.createObjList(this.fbsFiles.bind(this), this.fbsFilesLength());
      }
    }
    class SchemaT {
      constructor(objects = [], enums = [], fileIdent = null, fileExt = null, rootTable = null, services = [], advancedFeatures = BigInt("0"), fbsFiles = []) {
        __publicField(this, "objects");
        __publicField(this, "enums");
        __publicField(this, "fileIdent");
        __publicField(this, "fileExt");
        __publicField(this, "rootTable");
        __publicField(this, "services");
        __publicField(this, "advancedFeatures");
        __publicField(this, "fbsFiles");
        this.objects = objects;
        this.enums = enums;
        this.fileIdent = fileIdent;
        this.fileExt = fileExt;
        this.rootTable = rootTable;
        this.services = services;
        this.advancedFeatures = advancedFeatures;
        this.fbsFiles = fbsFiles;
      }
      pack(builder) {
        const objects = Schema.createObjectsVector(builder, builder.createObjectOffsetList(this.objects));
        const enums = Schema.createEnumsVector(builder, builder.createObjectOffsetList(this.enums));
        const fileIdent = this.fileIdent !== null ? builder.createString(this.fileIdent) : 0;
        const fileExt = this.fileExt !== null ? builder.createString(this.fileExt) : 0;
        const rootTable = this.rootTable !== null ? this.rootTable.pack(builder) : 0;
        const services = Schema.createServicesVector(builder, builder.createObjectOffsetList(this.services));
        const fbsFiles = Schema.createFbsFilesVector(builder, builder.createObjectOffsetList(this.fbsFiles));
        Schema.startSchema(builder);
        Schema.addObjects(builder, objects);
        Schema.addEnums(builder, enums);
        Schema.addFileIdent(builder, fileIdent);
        Schema.addFileExt(builder, fileExt);
        Schema.addRootTable(builder, rootTable);
        Schema.addServices(builder, services);
        Schema.addAdvancedFeatures(builder, this.advancedFeatures);
        Schema.addFbsFiles(builder, fbsFiles);
        return Schema.endSchema(builder);
      }
    }
    function typeSize(baseType) {
      switch (baseType) {
        case BaseType.None:
        case BaseType.UType:
        case BaseType.Bool:
        case BaseType.Byte:
        case BaseType.UByte:
          return 1;
        case BaseType.Short:
        case BaseType.UShort:
          return 2;
        case BaseType.Int:
        case BaseType.UInt:
          return 4;
        case BaseType.Long:
        case BaseType.ULong:
          return 8;
        case BaseType.Float:
          return 4;
        case BaseType.Double:
          return 8;
        case BaseType.String:
        case BaseType.Vector:
        case BaseType.Obj:
        case BaseType.Union:
        case BaseType.Array:
          return 4;
      }
      return NaN;
    }
    function isScalar(baseType) {
      switch (baseType) {
        case BaseType.UType:
        case BaseType.Bool:
        case BaseType.Byte:
        case BaseType.UByte:
        case BaseType.Short:
        case BaseType.UShort:
        case BaseType.Int:
        case BaseType.UInt:
        case BaseType.Long:
        case BaseType.ULong:
        case BaseType.Float:
        case BaseType.Double:
          return true;
        case BaseType.None:
        case BaseType.String:
        case BaseType.Vector:
        case BaseType.Obj:
        case BaseType.Union:
        case BaseType.Array:
          return false;
      }
      return false;
    }
    class Table {
      constructor(bb, typeIndex, offset, isStruct) {
        __publicField(this, "bb");
        __publicField(this, "typeIndex");
        __publicField(this, "offset");
        __publicField(this, "isStruct");
        this.bb = bb;
        this.typeIndex = typeIndex;
        this.offset = offset;
        this.isStruct = isStruct;
        if (offset < 0 || offset + 4 > bb.capacity()) {
          throw new Error(`Attempt to construct Table with offset ${offset}, which would extend beyond ByteBuffer (capacity ${bb.capacity()})`);
        }
        if (isStruct) {
          return;
        }
        const offsetToVtable = bb.readInt32(offset);
        const vtableOffset = offset - offsetToVtable;
        const vtableMinSize = 2 * 2;
        if (vtableOffset < 0 || vtableOffset + vtableMinSize > bb.capacity()) {
          throw new Error(`Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`);
        }
        const vtableActualSize = bb.readUint16(vtableOffset);
        if (vtableActualSize < 4) {
          throw new Error(`Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies vtable size ${vtableActualSize}, which should be at least 4 (vtable size + object size)`);
        }
        if (vtableOffset + vtableActualSize > bb.capacity()) {
          throw new Error(`Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies vtable size ${vtableActualSize}, which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`);
        }
        const objectSize = bb.readUint16(vtableOffset + 2);
        if (objectSize < 4) {
          throw new Error(`Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies inline object size ${objectSize}, which should be at least 4 (vtable offset)`);
        }
        if (offset + objectSize > bb.capacity()) {
          throw new Error(`Table at offset ${offset} points to vtable at ${vtableOffset} (${offset} - ${offsetToVtable}), which specifies inline object size ${objectSize}, which would extend beyond the ByteBuffer (capacity ${bb.capacity()})`);
        }
      }
      static getRootTable(bb) {
        if (bb.position() + 4 > bb.capacity()) {
          throw new Error(`Attempt to parse root table offset from ${bb.position()}, which would extend beyond ByteBuffer (capacity ${bb.capacity()})`);
        }
        return new Table(bb, -1, bb.readUint32(bb.position()) + bb.position(), false);
      }
      static getNamedTable(bb, schema, type2, offset) {
        for (let ii = 0; ii < schema.objectsLength(); ++ii) {
          const schemaObject = schema.objects(ii);
          if (schemaObject !== null && schemaObject.name() === type2) {
            return new Table(bb, ii, offset === void 0 ? bb.readUint32(bb.position()) + bb.position() : offset, schemaObject.isStruct());
          }
        }
        throw new Error("Unable to find type " + type2 + " in schema.");
      }
      readScalar(fieldType, offset) {
        const size = typeSize(fieldType);
        if (offset < 0 || offset + size > this.bb.capacity()) {
          throw new Error(`Attempt to read scalar type ${fieldType} (size ${size}) at offset ${offset}, which would extend beyond ByteBuffer (capacity ${this.bb.capacity()})`);
        }
        switch (fieldType) {
          case BaseType.Bool:
            return this.bb.readUint8(offset) !== 0;
          case BaseType.Byte:
            return this.bb.readInt8(offset);
          case BaseType.UType:
          case BaseType.UByte:
            return this.bb.readUint8(offset);
          case BaseType.Short:
            return this.bb.readInt16(offset);
          case BaseType.UShort:
            return this.bb.readUint16(offset);
          case BaseType.Int:
            return this.bb.readInt32(offset);
          case BaseType.UInt:
            return this.bb.readUint32(offset);
          case BaseType.Long:
            return this.bb.readInt64(offset);
          case BaseType.ULong:
            return this.bb.readUint64(offset);
          case BaseType.Float:
            return this.bb.readFloat32(offset);
          case BaseType.Double:
            return this.bb.readFloat64(offset);
        }
        throw new Error(`Unsupported message type ${fieldType}`);
      }
    }
    class Parser {
      constructor(schema) {
        __publicField(this, "schema");
        this.schema = schema;
      }
      toObjectLambda(typeIndex, readDefaults = false) {
        const lambdas = {};
        const schema = this.getType(typeIndex);
        const numFields = schema.fieldsLength();
        for (let ii = 0; ii < numFields; ++ii) {
          const field2 = schema.fields(ii);
          if (field2 === null) {
            throw new Error("Malformed schema: field at index " + ii + " not populated.");
          }
          const fieldType = field2.type();
          if (fieldType === null) {
            throw new Error('Malformed schema: "type" field of Field not populated.');
          }
          const fieldName = field2.name();
          if (fieldName === null) {
            throw new Error('Malformed schema: "name" field of Field not populated.');
          }
          const baseType = fieldType.baseType();
          if (isScalar(baseType)) {
            lambdas[fieldName] = this.readScalarLambda(typeIndex, fieldName, readDefaults);
          } else if (baseType === BaseType.String) {
            lambdas[fieldName] = this.readStringLambda(typeIndex, fieldName);
          } else if (baseType === BaseType.Obj) {
            const rawLambda = this.readTableLambda(typeIndex, fieldName);
            const subTableLambda = this.toObjectLambda(fieldType.index(), readDefaults);
            lambdas[fieldName] = (t) => {
              const subTable = rawLambda(t);
              if (subTable === null) {
                return null;
              }
              return subTableLambda(subTable);
            };
          } else if (baseType === BaseType.Vector) {
            const elementType = fieldType.element();
            if (isScalar(elementType)) {
              lambdas[fieldName] = this.readVectorOfScalarsLambda(typeIndex, fieldName);
            } else if (elementType === BaseType.String) {
              lambdas[fieldName] = this.readVectorOfStringsLambda(typeIndex, fieldName);
            } else if (elementType === BaseType.Obj) {
              const vectorLambda = this.readVectorOfTablesLambda(typeIndex, fieldName);
              const subTableLambda = this.toObjectLambda(fieldType.index(), readDefaults);
              lambdas[fieldName] = (t) => {
                const vector = vectorLambda(t);
                if (vector === null) {
                  return null;
                }
                const result = [];
                for (const table of vector) {
                  result.push(subTableLambda(table));
                }
                return result;
              };
            } else {
              throw new Error("Vectors of Unions and Arrays are not supported.");
            }
          } else {
            throw new Error("Unions and Arrays are not supported in field " + field2.name());
          }
        }
        return (t) => {
          const obj = {};
          for (const field2 in lambdas) {
            const value = lambdas[field2](t);
            if (value !== null) {
              obj[field2] = value;
            }
          }
          return obj;
        };
      }
      toObject(table, readDefaults = false) {
        return this.toObjectLambda(table.typeIndex, readDefaults)(table);
      }
      getType(typeIndex) {
        if (typeIndex === -1) {
          const rootTable = this.schema.rootTable();
          if (rootTable === null) {
            throw new Error("Malformed schema: No root table.");
          }
          return rootTable;
        }
        if (typeIndex < 0 || typeIndex > this.schema.objectsLength()) {
          throw new Error("Type index out-of-range.");
        }
        const table = this.schema.objects(typeIndex);
        if (table === null) {
          throw new Error("Malformed schema: No object at index " + typeIndex + ".");
        }
        return table;
      }
      getField(fieldName, typeIndex) {
        const schema = this.getType(typeIndex);
        const numFields = schema.fieldsLength();
        for (let ii = 0; ii < numFields; ++ii) {
          const field2 = schema.fields(ii);
          if (field2 === null) {
            throw new Error("Malformed schema: Missing Field table at index " + ii + ".");
          }
          const name = field2.name();
          if (fieldName === name) {
            return field2;
          }
        }
        throw new Error("Couldn't find field " + fieldName + " in object " + schema.name() + ".");
      }
      readScalar(table, fieldName, readDefaults = false) {
        return this.readScalarLambda(table.typeIndex, fieldName, readDefaults)(table);
      }
      readScalarLambda(typeIndex, fieldName, readDefaults = false) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        const isStruct = this.getType(typeIndex).isStruct();
        if (!isScalar(fieldType.baseType())) {
          throw new Error("Field " + fieldName + " is not a scalar type.");
        }
        if (isStruct) {
          const baseType = fieldType.baseType();
          return (t) => {
            return t.readScalar(baseType, t.offset + field2.offset());
          };
        }
        return (t) => {
          const offset = t.offset + t.bb.__offset(t.offset, field2.offset());
          if (offset === t.offset) {
            if (!readDefaults) {
              return null;
            }
            switch (fieldType.baseType()) {
              case BaseType.Bool:
                return field2.defaultInteger() !== 0n;
              case BaseType.Long:
              case BaseType.ULong:
                return field2.defaultInteger();
              case BaseType.UType:
              case BaseType.Byte:
              case BaseType.UByte:
              case BaseType.Short:
              case BaseType.UShort:
              case BaseType.Int:
              case BaseType.UInt:
                return Number(field2.defaultInteger());
              case BaseType.Float:
              case BaseType.Double:
                return field2.defaultReal();
              default:
                throw new Error(`Expected scalar type, found ${fieldType.baseType()}`);
            }
          }
          return t.readScalar(fieldType.baseType(), offset);
        };
      }
      readString(table, fieldName) {
        return this.readStringLambda(table.typeIndex, fieldName)(table);
      }
      readStringLambda(typeIndex, fieldName) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        if (fieldType.baseType() !== BaseType.String) {
          throw new Error("Field " + fieldName + " is not a string.");
        }
        return (t) => {
          const offsetToOffset = t.offset + t.bb.__offset(t.offset, field2.offset());
          if (offsetToOffset === t.offset) {
            return null;
          }
          return t.bb.__string(offsetToOffset);
        };
      }
      readTable(table, fieldName) {
        return this.readTableLambda(table.typeIndex, fieldName)(table);
      }
      readTableLambda(typeIndex, fieldName) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        const parentIsStruct = this.getType(typeIndex).isStruct();
        if (fieldType.baseType() !== BaseType.Obj) {
          throw new Error("Field " + fieldName + " is not an object type.");
        }
        const elementIsStruct = this.getType(fieldType.index()).isStruct();
        if (parentIsStruct) {
          return (t) => {
            return new Table(t.bb, fieldType.index(), t.offset + field2.offset(), elementIsStruct);
          };
        }
        return (table) => {
          const offsetToOffset = table.offset + table.bb.__offset(table.offset, field2.offset());
          if (offsetToOffset === table.offset) {
            return null;
          }
          const objectStart = elementIsStruct ? offsetToOffset : table.bb.__indirect(offsetToOffset);
          return new Table(table.bb, fieldType.index(), objectStart, elementIsStruct);
        };
      }
      readVectorOfScalars(table, fieldName) {
        return this.readVectorOfScalarsLambda(table.typeIndex, fieldName)(table);
      }
      readVectorOfScalarsLambda(typeIndex, fieldName) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        if (fieldType.baseType() !== BaseType.Vector) {
          throw new Error("Field " + fieldName + " is not an vector.");
        }
        const elementType = fieldType.element();
        if (!isScalar(elementType)) {
          throw new Error("Field " + fieldName + " is not an vector of scalars.");
        }
        const isUByteVector = elementType === BaseType.UByte;
        return (table) => {
          const offsetToOffset = table.offset + table.bb.__offset(table.offset, field2.offset());
          if (offsetToOffset === table.offset) {
            return null;
          }
          const numElements = table.bb.__vector_len(offsetToOffset);
          const baseOffset = table.bb.__vector(offsetToOffset);
          const scalarSize = typeSize(fieldType.element());
          let result;
          if (isUByteVector) {
            result = new Uint8Array(table.bb.bytes().buffer, table.bb.bytes().byteOffset + baseOffset, numElements);
          } else {
            result = [];
            for (let ii = 0; ii < numElements; ++ii) {
              result.push(table.readScalar(fieldType.element(), baseOffset + scalarSize * ii));
            }
          }
          return result;
        };
      }
      readVectorOfTables(table, fieldName) {
        return this.readVectorOfTablesLambda(table.typeIndex, fieldName)(table);
      }
      readVectorOfTablesLambda(typeIndex, fieldName) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        if (fieldType.baseType() !== BaseType.Vector) {
          throw new Error("Field " + fieldName + " is not an vector.");
        }
        if (fieldType.element() !== BaseType.Obj) {
          throw new Error("Field " + fieldName + " is not an vector of objects.");
        }
        const elementSchema = this.getType(fieldType.index());
        const elementIsStruct = elementSchema.isStruct();
        const elementSize = elementIsStruct ? elementSchema.bytesize() : typeSize(fieldType.element());
        return (table) => {
          const offsetToOffset = table.offset + table.bb.__offset(table.offset, field2.offset());
          if (offsetToOffset === table.offset) {
            return null;
          }
          const numElements = table.bb.__vector_len(offsetToOffset);
          const result = [];
          const baseOffset = table.bb.__vector(offsetToOffset);
          for (let ii = 0; ii < numElements; ++ii) {
            const elementOffset = baseOffset + elementSize * ii;
            result.push(new Table(table.bb, fieldType.index(), elementIsStruct ? elementOffset : table.bb.__indirect(elementOffset), elementIsStruct));
          }
          return result;
        };
      }
      readVectorOfStrings(table, fieldName) {
        return this.readVectorOfStringsLambda(table.typeIndex, fieldName)(table);
      }
      readVectorOfStringsLambda(typeIndex, fieldName) {
        const field2 = this.getField(fieldName, typeIndex);
        const fieldType = field2.type();
        if (fieldType === null) {
          throw new Error('Malformed schema: "type" field of Field not populated.');
        }
        if (fieldType.baseType() !== BaseType.Vector) {
          throw new Error("Field " + fieldName + " is not an vector.");
        }
        if (fieldType.element() !== BaseType.String) {
          throw new Error("Field " + fieldName + " is not an vector of strings.");
        }
        return (table) => {
          const offsetToOffset = table.offset + table.bb.__offset(table.offset, field2.offset());
          if (offsetToOffset === table.offset) {
            return null;
          }
          const numElements = table.bb.__vector_len(offsetToOffset);
          const result = [];
          const baseOffset = table.bb.__vector(offsetToOffset);
          const offsetSize = typeSize(fieldType.element());
          for (let ii = 0; ii < numElements; ++ii) {
            result.push(table.bb.__string(baseOffset + offsetSize * ii));
          }
          return result;
        };
      }
    }
    function typeForSimpleField(type2) {
      switch (type2) {
        case BaseType.Bool:
          return "bool";
        case BaseType.Byte:
          return "int8";
        case BaseType.UType:
        case BaseType.UByte:
          return "uint8";
        case BaseType.Short:
          return "int16";
        case BaseType.UShort:
          return "uint16";
        case BaseType.Int:
          return "int32";
        case BaseType.UInt:
          return "uint32";
        case BaseType.Long:
          return "int64";
        case BaseType.ULong:
          return "uint64";
        case BaseType.Float:
          return "float32";
        case BaseType.Double:
          return "float64";
        case BaseType.String:
          return "string";
        case BaseType.Vector:
        case BaseType.Obj:
        case BaseType.Union:
        case BaseType.Array:
          throw new Error(`${type2} is not a simple type.`);
        case BaseType.None:
        case BaseType.MaxBaseType:
          throw new Error("None is not a valid type.");
      }
    }
    function flatbufferString(unchecked) {
      if (typeof unchecked === "string") {
        return unchecked;
      }
      throw new Error(`Expected string, found ${typeof unchecked}`);
    }
    function typeForField(schema, field2) {
      const fields = [];
      switch (field2.type?.baseType) {
        case BaseType.UType:
        case BaseType.Bool:
        case BaseType.Byte:
        case BaseType.UByte:
        case BaseType.Short:
        case BaseType.UShort:
        case BaseType.Int:
        case BaseType.UInt:
        case BaseType.Long:
        case BaseType.ULong:
        case BaseType.Float:
        case BaseType.Double:
        case BaseType.String:
        case BaseType.None: {
          const simpleType = typeForSimpleField(field2.type.baseType);
          if (field2.type.index !== -1) {
            const enums = schema.enums[field2.type.index]?.values;
            if (enums == void 0) {
              throw new Error(
                `Invalid schema, missing enum values for field type ${schema.enums[field2.type.index]?.name}`
              );
            }
            for (const enumVal of enums) {
              fields.push({
                name: flatbufferString(enumVal.name),
                type: simpleType,
                isConstant: true,
                value: enumVal.value
              });
            }
          }
          fields.push({ name: flatbufferString(field2.name), type: simpleType });
          break;
        }
        case BaseType.Vector:
          switch (field2.type.element) {
            case BaseType.Vector:
            case BaseType.Union:
            case BaseType.Array:
            case BaseType.None:
              throw new Error("Vectors of vectors, unions, arrays, and None's are unsupported.");
            case BaseType.Obj:
              fields.push({
                name: flatbufferString(field2.name),
                type: flatbufferString(schema.objects[field2.type.index]?.name),
                isComplex: true,
                isArray: true
              });
              break;
            default: {
              const type2 = typeForSimpleField(field2.type.element);
              if (field2.type.index !== -1) {
                const enums = schema.enums[field2.type.index]?.values;
                if (enums == void 0) {
                  throw new Error("Invalid schema");
                }
                for (const enumVal of enums) {
                  fields.push({
                    name: flatbufferString(enumVal.name),
                    type: type2,
                    isConstant: true,
                    value: enumVal.value
                  });
                }
              }
              fields.push({ name: flatbufferString(field2.name), type: type2, isArray: true });
              break;
            }
          }
          break;
        case BaseType.Obj:
          fields.push({
            name: flatbufferString(field2.name),
            type: flatbufferString(schema.objects[field2.type.index]?.name),
            isComplex: true
          });
          break;
        case BaseType.Union:
        case BaseType.Array:
        case BaseType.MaxBaseType:
        case void 0:
          throw new Error("Unions and Arrays are not supported in mcap-support currently.");
      }
      return fields;
    }
    function parseFlatbufferSchema(schemaName, schemaArray) {
      const datatypes = /* @__PURE__ */ new Map();
      const schemaBuffer = new ByteBuffer(schemaArray);
      const rawSchema = Schema.getRootAsSchema(schemaBuffer);
      const schema = rawSchema.unpack();
      let typeIndex = -1;
      for (let schemaIndex = 0; schemaIndex < schema.objects.length; ++schemaIndex) {
        const object2 = schema.objects[schemaIndex];
        if (object2?.name === schemaName) {
          typeIndex = schemaIndex;
        }
        let fields = [];
        if (object2?.fields == void 0) {
          continue;
        }
        for (const field2 of object2.fields) {
          fields = fields.concat(typeForField(schema, field2));
        }
        datatypes.set(flatbufferString(object2.name), { definitions: fields });
      }
      if (typeIndex === -1) {
        if (schema.rootTable?.name !== schemaName) {
          throw new Error(
            `Type "${schemaName}" is not available in the schema for "${schema.rootTable?.name}".`
          );
        }
      }
      const parser = new Parser(rawSchema);
      const toObject = parser.toObjectLambda(typeIndex, true);
      const deserialize = (buffer) => {
        const byteBuffer = new ByteBuffer(
          new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
        );
        const table = new Table(
          byteBuffer,
          typeIndex,
          byteBuffer.readInt32(byteBuffer.position()) + byteBuffer.position(),
          false
        );
        return toObject(table);
      };
      return { datatypes, deserialize };
    }
    var descriptor = { exports: {} };
    const nested = {
      google: {
        nested: {
          protobuf: {
            nested: {
              FileDescriptorSet: {
                fields: {
                  file: {
                    rule: "repeated",
                    type: "FileDescriptorProto",
                    id: 1
                  }
                }
              },
              FileDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  "package": {
                    type: "string",
                    id: 2
                  },
                  dependency: {
                    rule: "repeated",
                    type: "string",
                    id: 3
                  },
                  publicDependency: {
                    rule: "repeated",
                    type: "int32",
                    id: 10,
                    options: {
                      packed: false
                    }
                  },
                  weakDependency: {
                    rule: "repeated",
                    type: "int32",
                    id: 11,
                    options: {
                      packed: false
                    }
                  },
                  messageType: {
                    rule: "repeated",
                    type: "DescriptorProto",
                    id: 4
                  },
                  enumType: {
                    rule: "repeated",
                    type: "EnumDescriptorProto",
                    id: 5
                  },
                  service: {
                    rule: "repeated",
                    type: "ServiceDescriptorProto",
                    id: 6
                  },
                  extension: {
                    rule: "repeated",
                    type: "FieldDescriptorProto",
                    id: 7
                  },
                  options: {
                    type: "FileOptions",
                    id: 8
                  },
                  sourceCodeInfo: {
                    type: "SourceCodeInfo",
                    id: 9
                  },
                  syntax: {
                    type: "string",
                    id: 12
                  }
                }
              },
              DescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  field: {
                    rule: "repeated",
                    type: "FieldDescriptorProto",
                    id: 2
                  },
                  extension: {
                    rule: "repeated",
                    type: "FieldDescriptorProto",
                    id: 6
                  },
                  nestedType: {
                    rule: "repeated",
                    type: "DescriptorProto",
                    id: 3
                  },
                  enumType: {
                    rule: "repeated",
                    type: "EnumDescriptorProto",
                    id: 4
                  },
                  extensionRange: {
                    rule: "repeated",
                    type: "ExtensionRange",
                    id: 5
                  },
                  oneofDecl: {
                    rule: "repeated",
                    type: "OneofDescriptorProto",
                    id: 8
                  },
                  options: {
                    type: "MessageOptions",
                    id: 7
                  },
                  reservedRange: {
                    rule: "repeated",
                    type: "ReservedRange",
                    id: 9
                  },
                  reservedName: {
                    rule: "repeated",
                    type: "string",
                    id: 10
                  }
                },
                nested: {
                  ExtensionRange: {
                    fields: {
                      start: {
                        type: "int32",
                        id: 1
                      },
                      end: {
                        type: "int32",
                        id: 2
                      }
                    }
                  },
                  ReservedRange: {
                    fields: {
                      start: {
                        type: "int32",
                        id: 1
                      },
                      end: {
                        type: "int32",
                        id: 2
                      }
                    }
                  }
                }
              },
              FieldDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  number: {
                    type: "int32",
                    id: 3
                  },
                  label: {
                    type: "Label",
                    id: 4
                  },
                  type: {
                    type: "Type",
                    id: 5
                  },
                  typeName: {
                    type: "string",
                    id: 6
                  },
                  extendee: {
                    type: "string",
                    id: 2
                  },
                  defaultValue: {
                    type: "string",
                    id: 7
                  },
                  oneofIndex: {
                    type: "int32",
                    id: 9
                  },
                  jsonName: {
                    type: "string",
                    id: 10
                  },
                  options: {
                    type: "FieldOptions",
                    id: 8
                  }
                },
                nested: {
                  Type: {
                    values: {
                      TYPE_DOUBLE: 1,
                      TYPE_FLOAT: 2,
                      TYPE_INT64: 3,
                      TYPE_UINT64: 4,
                      TYPE_INT32: 5,
                      TYPE_FIXED64: 6,
                      TYPE_FIXED32: 7,
                      TYPE_BOOL: 8,
                      TYPE_STRING: 9,
                      TYPE_GROUP: 10,
                      TYPE_MESSAGE: 11,
                      TYPE_BYTES: 12,
                      TYPE_UINT32: 13,
                      TYPE_ENUM: 14,
                      TYPE_SFIXED32: 15,
                      TYPE_SFIXED64: 16,
                      TYPE_SINT32: 17,
                      TYPE_SINT64: 18
                    }
                  },
                  Label: {
                    values: {
                      LABEL_OPTIONAL: 1,
                      LABEL_REQUIRED: 2,
                      LABEL_REPEATED: 3
                    }
                  }
                }
              },
              OneofDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  options: {
                    type: "OneofOptions",
                    id: 2
                  }
                }
              },
              EnumDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  value: {
                    rule: "repeated",
                    type: "EnumValueDescriptorProto",
                    id: 2
                  },
                  options: {
                    type: "EnumOptions",
                    id: 3
                  }
                }
              },
              EnumValueDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  number: {
                    type: "int32",
                    id: 2
                  },
                  options: {
                    type: "EnumValueOptions",
                    id: 3
                  }
                }
              },
              ServiceDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  method: {
                    rule: "repeated",
                    type: "MethodDescriptorProto",
                    id: 2
                  },
                  options: {
                    type: "ServiceOptions",
                    id: 3
                  }
                }
              },
              MethodDescriptorProto: {
                fields: {
                  name: {
                    type: "string",
                    id: 1
                  },
                  inputType: {
                    type: "string",
                    id: 2
                  },
                  outputType: {
                    type: "string",
                    id: 3
                  },
                  options: {
                    type: "MethodOptions",
                    id: 4
                  },
                  clientStreaming: {
                    type: "bool",
                    id: 5
                  },
                  serverStreaming: {
                    type: "bool",
                    id: 6
                  }
                }
              },
              FileOptions: {
                fields: {
                  javaPackage: {
                    type: "string",
                    id: 1
                  },
                  javaOuterClassname: {
                    type: "string",
                    id: 8
                  },
                  javaMultipleFiles: {
                    type: "bool",
                    id: 10
                  },
                  javaGenerateEqualsAndHash: {
                    type: "bool",
                    id: 20,
                    options: {
                      deprecated: true
                    }
                  },
                  javaStringCheckUtf8: {
                    type: "bool",
                    id: 27
                  },
                  optimizeFor: {
                    type: "OptimizeMode",
                    id: 9,
                    options: {
                      "default": "SPEED"
                    }
                  },
                  goPackage: {
                    type: "string",
                    id: 11
                  },
                  ccGenericServices: {
                    type: "bool",
                    id: 16
                  },
                  javaGenericServices: {
                    type: "bool",
                    id: 17
                  },
                  pyGenericServices: {
                    type: "bool",
                    id: 18
                  },
                  deprecated: {
                    type: "bool",
                    id: 23
                  },
                  ccEnableArenas: {
                    type: "bool",
                    id: 31
                  },
                  objcClassPrefix: {
                    type: "string",
                    id: 36
                  },
                  csharpNamespace: {
                    type: "string",
                    id: 37
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ],
                reserved: [
                  [
                    38,
                    38
                  ]
                ],
                nested: {
                  OptimizeMode: {
                    values: {
                      SPEED: 1,
                      CODE_SIZE: 2,
                      LITE_RUNTIME: 3
                    }
                  }
                }
              },
              MessageOptions: {
                fields: {
                  messageSetWireFormat: {
                    type: "bool",
                    id: 1
                  },
                  noStandardDescriptorAccessor: {
                    type: "bool",
                    id: 2
                  },
                  deprecated: {
                    type: "bool",
                    id: 3
                  },
                  mapEntry: {
                    type: "bool",
                    id: 7
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ],
                reserved: [
                  [
                    8,
                    8
                  ]
                ]
              },
              FieldOptions: {
                fields: {
                  ctype: {
                    type: "CType",
                    id: 1,
                    options: {
                      "default": "STRING"
                    }
                  },
                  packed: {
                    type: "bool",
                    id: 2
                  },
                  jstype: {
                    type: "JSType",
                    id: 6,
                    options: {
                      "default": "JS_NORMAL"
                    }
                  },
                  lazy: {
                    type: "bool",
                    id: 5
                  },
                  deprecated: {
                    type: "bool",
                    id: 3
                  },
                  weak: {
                    type: "bool",
                    id: 10
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ],
                reserved: [
                  [
                    4,
                    4
                  ]
                ],
                nested: {
                  CType: {
                    values: {
                      STRING: 0,
                      CORD: 1,
                      STRING_PIECE: 2
                    }
                  },
                  JSType: {
                    values: {
                      JS_NORMAL: 0,
                      JS_STRING: 1,
                      JS_NUMBER: 2
                    }
                  }
                }
              },
              OneofOptions: {
                fields: {
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ]
              },
              EnumOptions: {
                fields: {
                  allowAlias: {
                    type: "bool",
                    id: 2
                  },
                  deprecated: {
                    type: "bool",
                    id: 3
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ]
              },
              EnumValueOptions: {
                fields: {
                  deprecated: {
                    type: "bool",
                    id: 1
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ]
              },
              ServiceOptions: {
                fields: {
                  deprecated: {
                    type: "bool",
                    id: 33
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ]
              },
              MethodOptions: {
                fields: {
                  deprecated: {
                    type: "bool",
                    id: 33
                  },
                  uninterpretedOption: {
                    rule: "repeated",
                    type: "UninterpretedOption",
                    id: 999
                  }
                },
                extensions: [
                  [
                    1e3,
                    536870911
                  ]
                ]
              },
              UninterpretedOption: {
                fields: {
                  name: {
                    rule: "repeated",
                    type: "NamePart",
                    id: 2
                  },
                  identifierValue: {
                    type: "string",
                    id: 3
                  },
                  positiveIntValue: {
                    type: "uint64",
                    id: 4
                  },
                  negativeIntValue: {
                    type: "int64",
                    id: 5
                  },
                  doubleValue: {
                    type: "double",
                    id: 6
                  },
                  stringValue: {
                    type: "bytes",
                    id: 7
                  },
                  aggregateValue: {
                    type: "string",
                    id: 8
                  }
                },
                nested: {
                  NamePart: {
                    fields: {
                      namePart: {
                        rule: "required",
                        type: "string",
                        id: 1
                      },
                      isExtension: {
                        rule: "required",
                        type: "bool",
                        id: 2
                      }
                    }
                  }
                }
              },
              SourceCodeInfo: {
                fields: {
                  location: {
                    rule: "repeated",
                    type: "Location",
                    id: 1
                  }
                },
                nested: {
                  Location: {
                    fields: {
                      path: {
                        rule: "repeated",
                        type: "int32",
                        id: 1
                      },
                      span: {
                        rule: "repeated",
                        type: "int32",
                        id: 2
                      },
                      leadingComments: {
                        type: "string",
                        id: 3
                      },
                      trailingComments: {
                        type: "string",
                        id: 4
                      },
                      leadingDetachedComments: {
                        rule: "repeated",
                        type: "string",
                        id: 6
                      }
                    }
                  }
                }
              },
              GeneratedCodeInfo: {
                fields: {
                  annotation: {
                    rule: "repeated",
                    type: "Annotation",
                    id: 1
                  }
                },
                nested: {
                  Annotation: {
                    fields: {
                      path: {
                        rule: "repeated",
                        type: "int32",
                        id: 1
                      },
                      sourceFile: {
                        type: "string",
                        id: 2
                      },
                      begin: {
                        type: "int32",
                        id: 3
                      },
                      end: {
                        type: "int32",
                        id: 4
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };
    var require$$1 = {
      nested
    };
    (function(module2, exports2) {
      var $protobuf = protobufjs$1.exports;
      module2.exports = exports2 = $protobuf.descriptor = $protobuf.Root.fromJSON(require$$1).lookup(".google.protobuf");
      var Namespace = $protobuf.Namespace, Root2 = $protobuf.Root, Enum2 = $protobuf.Enum, Type2 = $protobuf.Type, Field2 = $protobuf.Field, MapField2 = $protobuf.MapField, OneOf2 = $protobuf.OneOf, Service2 = $protobuf.Service, Method2 = $protobuf.Method;
      Root2.fromDescriptor = function fromDescriptor(descriptor2) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.FileDescriptorSet.decode(descriptor2);
        var root2 = new Root2();
        if (descriptor2.file) {
          var fileDescriptor, filePackage;
          for (var j = 0, i; j < descriptor2.file.length; ++j) {
            filePackage = root2;
            if ((fileDescriptor = descriptor2.file[j])["package"] && fileDescriptor["package"].length)
              filePackage = root2.define(fileDescriptor["package"]);
            if (fileDescriptor.name && fileDescriptor.name.length)
              root2.files.push(filePackage.filename = fileDescriptor.name);
            if (fileDescriptor.messageType)
              for (i = 0; i < fileDescriptor.messageType.length; ++i)
                filePackage.add(Type2.fromDescriptor(fileDescriptor.messageType[i], fileDescriptor.syntax));
            if (fileDescriptor.enumType)
              for (i = 0; i < fileDescriptor.enumType.length; ++i)
                filePackage.add(Enum2.fromDescriptor(fileDescriptor.enumType[i]));
            if (fileDescriptor.extension)
              for (i = 0; i < fileDescriptor.extension.length; ++i)
                filePackage.add(Field2.fromDescriptor(fileDescriptor.extension[i]));
            if (fileDescriptor.service)
              for (i = 0; i < fileDescriptor.service.length; ++i)
                filePackage.add(Service2.fromDescriptor(fileDescriptor.service[i]));
            var opts = fromDescriptorOptions(fileDescriptor.options, exports2.FileOptions);
            if (opts) {
              var ks = Object.keys(opts);
              for (i = 0; i < ks.length; ++i)
                filePackage.setOption(ks[i], opts[ks[i]]);
            }
          }
        }
        return root2;
      };
      Root2.prototype.toDescriptor = function toDescriptor(syntax) {
        var set = exports2.FileDescriptorSet.create();
        Root_toDescriptorRecursive(this, set.file, syntax);
        return set;
      };
      function Root_toDescriptorRecursive(ns, files, syntax) {
        var file = exports2.FileDescriptorProto.create({ name: ns.filename || (ns.fullName.substring(1).replace(/\./g, "_") || "root") + ".proto" });
        if (syntax)
          file.syntax = syntax;
        if (!(ns instanceof Root2))
          file["package"] = ns.fullName.substring(1);
        for (var i = 0, nested2; i < ns.nestedArray.length; ++i)
          if ((nested2 = ns._nestedArray[i]) instanceof Type2)
            file.messageType.push(nested2.toDescriptor(syntax));
          else if (nested2 instanceof Enum2)
            file.enumType.push(nested2.toDescriptor());
          else if (nested2 instanceof Field2)
            file.extension.push(nested2.toDescriptor(syntax));
          else if (nested2 instanceof Service2)
            file.service.push(nested2.toDescriptor());
          else if (nested2 instanceof Namespace)
            Root_toDescriptorRecursive(nested2, files, syntax);
        file.options = toDescriptorOptions(ns.options, exports2.FileOptions);
        if (file.messageType.length + file.enumType.length + file.extension.length + file.service.length)
          files.push(file);
      }
      var unnamedMessageIndex = 0;
      Type2.fromDescriptor = function fromDescriptor(descriptor2, syntax) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.DescriptorProto.decode(descriptor2);
        var type2 = new Type2(descriptor2.name.length ? descriptor2.name : "Type" + unnamedMessageIndex++, fromDescriptorOptions(descriptor2.options, exports2.MessageOptions)), i;
        if (descriptor2.oneofDecl)
          for (i = 0; i < descriptor2.oneofDecl.length; ++i)
            type2.add(OneOf2.fromDescriptor(descriptor2.oneofDecl[i]));
        if (descriptor2.field)
          for (i = 0; i < descriptor2.field.length; ++i) {
            var field2 = Field2.fromDescriptor(descriptor2.field[i], syntax);
            type2.add(field2);
            if (descriptor2.field[i].hasOwnProperty("oneofIndex"))
              type2.oneofsArray[descriptor2.field[i].oneofIndex].add(field2);
          }
        if (descriptor2.extension)
          for (i = 0; i < descriptor2.extension.length; ++i)
            type2.add(Field2.fromDescriptor(descriptor2.extension[i], syntax));
        if (descriptor2.nestedType)
          for (i = 0; i < descriptor2.nestedType.length; ++i) {
            type2.add(Type2.fromDescriptor(descriptor2.nestedType[i], syntax));
            if (descriptor2.nestedType[i].options && descriptor2.nestedType[i].options.mapEntry)
              type2.setOption("map_entry", true);
          }
        if (descriptor2.enumType)
          for (i = 0; i < descriptor2.enumType.length; ++i)
            type2.add(Enum2.fromDescriptor(descriptor2.enumType[i]));
        if (descriptor2.extensionRange && descriptor2.extensionRange.length) {
          type2.extensions = [];
          for (i = 0; i < descriptor2.extensionRange.length; ++i)
            type2.extensions.push([descriptor2.extensionRange[i].start, descriptor2.extensionRange[i].end]);
        }
        if (descriptor2.reservedRange && descriptor2.reservedRange.length || descriptor2.reservedName && descriptor2.reservedName.length) {
          type2.reserved = [];
          if (descriptor2.reservedRange)
            for (i = 0; i < descriptor2.reservedRange.length; ++i)
              type2.reserved.push([descriptor2.reservedRange[i].start, descriptor2.reservedRange[i].end]);
          if (descriptor2.reservedName)
            for (i = 0; i < descriptor2.reservedName.length; ++i)
              type2.reserved.push(descriptor2.reservedName[i]);
        }
        return type2;
      };
      Type2.prototype.toDescriptor = function toDescriptor(syntax) {
        var descriptor2 = exports2.DescriptorProto.create({ name: this.name }), i;
        for (i = 0; i < this.fieldsArray.length; ++i) {
          var fieldDescriptor;
          descriptor2.field.push(fieldDescriptor = this._fieldsArray[i].toDescriptor(syntax));
          if (this._fieldsArray[i] instanceof MapField2) {
            var keyType = toDescriptorType(this._fieldsArray[i].keyType, this._fieldsArray[i].resolvedKeyType), valueType = toDescriptorType(this._fieldsArray[i].type, this._fieldsArray[i].resolvedType), valueTypeName = valueType === 11 || valueType === 14 ? this._fieldsArray[i].resolvedType && shortname(this.parent, this._fieldsArray[i].resolvedType) || this._fieldsArray[i].type : void 0;
            descriptor2.nestedType.push(exports2.DescriptorProto.create({
              name: fieldDescriptor.typeName,
              field: [
                exports2.FieldDescriptorProto.create({ name: "key", number: 1, label: 1, type: keyType }),
                exports2.FieldDescriptorProto.create({ name: "value", number: 2, label: 1, type: valueType, typeName: valueTypeName })
              ],
              options: exports2.MessageOptions.create({ mapEntry: true })
            }));
          }
        }
        for (i = 0; i < this.oneofsArray.length; ++i)
          descriptor2.oneofDecl.push(this._oneofsArray[i].toDescriptor());
        for (i = 0; i < this.nestedArray.length; ++i) {
          if (this._nestedArray[i] instanceof Field2)
            descriptor2.field.push(this._nestedArray[i].toDescriptor(syntax));
          else if (this._nestedArray[i] instanceof Type2)
            descriptor2.nestedType.push(this._nestedArray[i].toDescriptor(syntax));
          else if (this._nestedArray[i] instanceof Enum2)
            descriptor2.enumType.push(this._nestedArray[i].toDescriptor());
        }
        if (this.extensions)
          for (i = 0; i < this.extensions.length; ++i)
            descriptor2.extensionRange.push(exports2.DescriptorProto.ExtensionRange.create({ start: this.extensions[i][0], end: this.extensions[i][1] }));
        if (this.reserved)
          for (i = 0; i < this.reserved.length; ++i)
            if (typeof this.reserved[i] === "string")
              descriptor2.reservedName.push(this.reserved[i]);
            else
              descriptor2.reservedRange.push(exports2.DescriptorProto.ReservedRange.create({ start: this.reserved[i][0], end: this.reserved[i][1] }));
        descriptor2.options = toDescriptorOptions(this.options, exports2.MessageOptions);
        return descriptor2;
      };
      var numberRe2 = /^(?![eE])[0-9]*(?:\.[0-9]*)?(?:[eE][+-]?[0-9]+)?$/;
      Field2.fromDescriptor = function fromDescriptor(descriptor2, syntax) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.DescriptorProto.decode(descriptor2);
        if (typeof descriptor2.number !== "number")
          throw Error("missing field id");
        var fieldType;
        if (descriptor2.typeName && descriptor2.typeName.length)
          fieldType = descriptor2.typeName;
        else
          fieldType = fromDescriptorType(descriptor2.type);
        var fieldRule;
        switch (descriptor2.label) {
          case 1:
            fieldRule = void 0;
            break;
          case 2:
            fieldRule = "required";
            break;
          case 3:
            fieldRule = "repeated";
            break;
          default:
            throw Error("illegal label: " + descriptor2.label);
        }
        var extendee = descriptor2.extendee;
        if (descriptor2.extendee !== void 0) {
          extendee = extendee.length ? extendee : void 0;
        }
        var field2 = new Field2(
          descriptor2.name.length ? descriptor2.name : "field" + descriptor2.number,
          descriptor2.number,
          fieldType,
          fieldRule,
          extendee
        );
        field2.options = fromDescriptorOptions(descriptor2.options, exports2.FieldOptions);
        if (descriptor2.defaultValue && descriptor2.defaultValue.length) {
          var defaultValue = descriptor2.defaultValue;
          switch (defaultValue) {
            case "true":
            case "TRUE":
              defaultValue = true;
              break;
            case "false":
            case "FALSE":
              defaultValue = false;
              break;
            default:
              var match = numberRe2.exec(defaultValue);
              if (match)
                defaultValue = parseInt(defaultValue);
              break;
          }
          field2.setOption("default", defaultValue);
        }
        if (packableDescriptorType(descriptor2.type)) {
          if (syntax === "proto3") {
            if (descriptor2.options && !descriptor2.options.packed)
              field2.setOption("packed", false);
          } else if (!(descriptor2.options && descriptor2.options.packed))
            field2.setOption("packed", false);
        }
        return field2;
      };
      Field2.prototype.toDescriptor = function toDescriptor(syntax) {
        var descriptor2 = exports2.FieldDescriptorProto.create({ name: this.name, number: this.id });
        if (this.map) {
          descriptor2.type = 11;
          descriptor2.typeName = $protobuf.util.ucFirst(this.name);
          descriptor2.label = 3;
        } else {
          switch (descriptor2.type = toDescriptorType(this.type, this.resolve().resolvedType)) {
            case 10:
            case 11:
            case 14:
              descriptor2.typeName = this.resolvedType ? shortname(this.parent, this.resolvedType) : this.type;
              break;
          }
          switch (this.rule) {
            case "repeated":
              descriptor2.label = 3;
              break;
            case "required":
              descriptor2.label = 2;
              break;
            default:
              descriptor2.label = 1;
              break;
          }
        }
        descriptor2.extendee = this.extensionField ? this.extensionField.parent.fullName : this.extend;
        if (this.partOf) {
          if ((descriptor2.oneofIndex = this.parent.oneofsArray.indexOf(this.partOf)) < 0)
            throw Error("missing oneof");
        }
        if (this.options) {
          descriptor2.options = toDescriptorOptions(this.options, exports2.FieldOptions);
          if (this.options["default"] != null)
            descriptor2.defaultValue = String(this.options["default"]);
        }
        if (syntax === "proto3") {
          if (!this.packed)
            (descriptor2.options || (descriptor2.options = exports2.FieldOptions.create())).packed = false;
        } else if (this.packed)
          (descriptor2.options || (descriptor2.options = exports2.FieldOptions.create())).packed = true;
        return descriptor2;
      };
      var unnamedEnumIndex = 0;
      Enum2.fromDescriptor = function fromDescriptor(descriptor2) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.EnumDescriptorProto.decode(descriptor2);
        var values = {};
        if (descriptor2.value)
          for (var i = 0; i < descriptor2.value.length; ++i) {
            var name = descriptor2.value[i].name, value = descriptor2.value[i].number || 0;
            values[name && name.length ? name : "NAME" + value] = value;
          }
        return new Enum2(
          descriptor2.name && descriptor2.name.length ? descriptor2.name : "Enum" + unnamedEnumIndex++,
          values,
          fromDescriptorOptions(descriptor2.options, exports2.EnumOptions)
        );
      };
      Enum2.prototype.toDescriptor = function toDescriptor() {
        var values = [];
        for (var i = 0, ks = Object.keys(this.values); i < ks.length; ++i)
          values.push(exports2.EnumValueDescriptorProto.create({ name: ks[i], number: this.values[ks[i]] }));
        return exports2.EnumDescriptorProto.create({
          name: this.name,
          value: values,
          options: toDescriptorOptions(this.options, exports2.EnumOptions)
        });
      };
      var unnamedOneofIndex = 0;
      OneOf2.fromDescriptor = function fromDescriptor(descriptor2) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.OneofDescriptorProto.decode(descriptor2);
        return new OneOf2(
          descriptor2.name && descriptor2.name.length ? descriptor2.name : "oneof" + unnamedOneofIndex++
        );
      };
      OneOf2.prototype.toDescriptor = function toDescriptor() {
        return exports2.OneofDescriptorProto.create({
          name: this.name
        });
      };
      var unnamedServiceIndex = 0;
      Service2.fromDescriptor = function fromDescriptor(descriptor2) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.ServiceDescriptorProto.decode(descriptor2);
        var service2 = new Service2(descriptor2.name && descriptor2.name.length ? descriptor2.name : "Service" + unnamedServiceIndex++, fromDescriptorOptions(descriptor2.options, exports2.ServiceOptions));
        if (descriptor2.method)
          for (var i = 0; i < descriptor2.method.length; ++i)
            service2.add(Method2.fromDescriptor(descriptor2.method[i]));
        return service2;
      };
      Service2.prototype.toDescriptor = function toDescriptor() {
        var methods = [];
        for (var i = 0; i < this.methodsArray.length; ++i)
          methods.push(this._methodsArray[i].toDescriptor());
        return exports2.ServiceDescriptorProto.create({
          name: this.name,
          method: methods,
          options: toDescriptorOptions(this.options, exports2.ServiceOptions)
        });
      };
      var unnamedMethodIndex = 0;
      Method2.fromDescriptor = function fromDescriptor(descriptor2) {
        if (typeof descriptor2.length === "number")
          descriptor2 = exports2.MethodDescriptorProto.decode(descriptor2);
        return new Method2(
          descriptor2.name && descriptor2.name.length ? descriptor2.name : "Method" + unnamedMethodIndex++,
          "rpc",
          descriptor2.inputType,
          descriptor2.outputType,
          Boolean(descriptor2.clientStreaming),
          Boolean(descriptor2.serverStreaming),
          fromDescriptorOptions(descriptor2.options, exports2.MethodOptions)
        );
      };
      Method2.prototype.toDescriptor = function toDescriptor() {
        return exports2.MethodDescriptorProto.create({
          name: this.name,
          inputType: this.resolvedRequestType ? this.resolvedRequestType.fullName : this.requestType,
          outputType: this.resolvedResponseType ? this.resolvedResponseType.fullName : this.responseType,
          clientStreaming: this.requestStream,
          serverStreaming: this.responseStream,
          options: toDescriptorOptions(this.options, exports2.MethodOptions)
        });
      };
      function fromDescriptorType(type2) {
        switch (type2) {
          case 1:
            return "double";
          case 2:
            return "float";
          case 3:
            return "int64";
          case 4:
            return "uint64";
          case 5:
            return "int32";
          case 6:
            return "fixed64";
          case 7:
            return "fixed32";
          case 8:
            return "bool";
          case 9:
            return "string";
          case 12:
            return "bytes";
          case 13:
            return "uint32";
          case 15:
            return "sfixed32";
          case 16:
            return "sfixed64";
          case 17:
            return "sint32";
          case 18:
            return "sint64";
        }
        throw Error("illegal type: " + type2);
      }
      function packableDescriptorType(type2) {
        switch (type2) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
          case 7:
          case 8:
          case 13:
          case 14:
          case 15:
          case 16:
          case 17:
          case 18:
            return true;
        }
        return false;
      }
      function toDescriptorType(type2, resolvedType) {
        switch (type2) {
          case "double":
            return 1;
          case "float":
            return 2;
          case "int64":
            return 3;
          case "uint64":
            return 4;
          case "int32":
            return 5;
          case "fixed64":
            return 6;
          case "fixed32":
            return 7;
          case "bool":
            return 8;
          case "string":
            return 9;
          case "bytes":
            return 12;
          case "uint32":
            return 13;
          case "sfixed32":
            return 15;
          case "sfixed64":
            return 16;
          case "sint32":
            return 17;
          case "sint64":
            return 18;
        }
        if (resolvedType instanceof Enum2)
          return 14;
        if (resolvedType instanceof Type2)
          return resolvedType.group ? 10 : 11;
        throw Error("illegal type: " + type2);
      }
      function fromDescriptorOptions(options, type2) {
        if (!options)
          return void 0;
        var out = [];
        for (var i = 0, field2, key, val; i < type2.fieldsArray.length; ++i)
          if ((key = (field2 = type2._fieldsArray[i]).name) !== "uninterpretedOption") {
            if (options.hasOwnProperty(key)) {
              val = options[key];
              if (field2.resolvedType instanceof Enum2 && typeof val === "number" && field2.resolvedType.valuesById[val] !== void 0)
                val = field2.resolvedType.valuesById[val];
              out.push(underScore(key), val);
            }
          }
        return out.length ? $protobuf.util.toObject(out) : void 0;
      }
      function toDescriptorOptions(options, type2) {
        if (!options)
          return void 0;
        var out = [];
        for (var i = 0, ks = Object.keys(options), key, val; i < ks.length; ++i) {
          val = options[key = ks[i]];
          if (key === "default")
            continue;
          var field2 = type2.fields[key];
          if (!field2 && !(field2 = type2.fields[key = $protobuf.util.camelCase(key)]))
            continue;
          out.push(key, val);
        }
        return out.length ? type2.fromObject($protobuf.util.toObject(out)) : void 0;
      }
      function shortname(from, to) {
        var fromPath = from.fullName.split("."), toPath = to.fullName.split("."), i = 0, j = 0, k = toPath.length - 1;
        if (!(from instanceof Root2) && to instanceof Namespace)
          while (i < fromPath.length && j < k && fromPath[i] === toPath[j]) {
            var other = to.lookup(fromPath[i++], true);
            if (other !== null && other !== to)
              break;
            ++j;
          }
        else
          for (; i < fromPath.length && j < k && fromPath[i] === toPath[j]; ++i, ++j)
            ;
        return toPath.slice(j).join(".");
      }
      function underScore(str) {
        return str.substring(0, 1) + str.substring(1).replace(/([A-Z])(?=[a-z]|$)/g, function($0, $1) {
          return "_" + $1.toLowerCase();
        });
      }
    })(descriptor, descriptor.exports);
    function parseProtobufSchema(schemaName, schemaData) {
      const descriptorSet = descriptor.exports.FileDescriptorSet.decode(schemaData);
      const root2 = protobufjs.Root.fromDescriptor(descriptorSet);
      root2.resolveAll();
      const rootType = root2.lookupType(schemaName);
      const fixTimeType = (type2) => {
        if (!type2 || !(type2 instanceof protobufjs.Type)) {
          return;
        }
        type2.setup();
        const prevToObject = type2.toObject;
        const newToObject = (message2, options) => {
          const result = prevToObject.call(type2, message2, options);
          const { seconds, nanos } = result;
          if (typeof seconds !== "bigint" || typeof nanos !== "number") {
            return result;
          }
          if (seconds > BigInt(Number.MAX_SAFE_INTEGER)) {
            throw new Error(
              `Timestamps with seconds greater than 2^53-1 are not supported (found seconds=${seconds}, nanos=${nanos})`
            );
          }
          return { sec: Number(seconds), nsec: nanos };
        };
        type2.toObject = newToObject;
      };
      fixTimeType(root2.lookup(".google.protobuf.Timestamp"));
      fixTimeType(root2.lookup(".google.protobuf.Duration"));
      const deserialize = (data) => {
        return rootType.toObject(
          rootType.decode(new Uint8Array(data.buffer, data.byteOffset, data.byteLength)),
          { defaults: true }
        );
      };
      const datatypes = /* @__PURE__ */ new Map();
      protobufDefinitionsToDatatypes(datatypes, rootType);
      if (!datatypes.has(schemaName)) {
        throw new Error(
          `Protobuf schema does not contain an entry for '${schemaName}'. The schema name should be fully-qualified, e.g. '${stripLeadingDot(
            rootType.fullName
          )}'.`
        );
      }
      return { deserialize, datatypes };
    }
    const KNOWN_EMPTY_SCHEMA_NAMES = ["std_msgs/Empty", "std_msgs/msg/Empty"];
    function parseIDLDefinitionsToDatatypes(parsedDefinitions, rootName) {
      const convertUnionToMessageDefinition = (definition) => {
        if (definition.aggregatedKind === "union") {
          const innerDefs = definition.cases.map((caseDefinition) => ({
            ...caseDefinition.type,
            predicates: caseDefinition.predicates
          }));
          if (definition.defaultCase != void 0) {
            innerDefs.push(definition.defaultCase);
          }
          const { name } = definition;
          return {
            name,
            definitions: innerDefs
          };
        }
        return definition;
      };
      const standardDefs = parsedDefinitions.map(convertUnionToMessageDefinition);
      return parsedDefinitionsToDatatypes(standardDefs, rootName);
    }
    function parsedDefinitionsToDatatypes(parsedDefinitions, rootName) {
      const datatypes = /* @__PURE__ */ new Map();
      parsedDefinitions.forEach(({ name, definitions }, index) => {
        if (rootName != void 0 && index === 0) {
          datatypes.set(rootName, { name: rootName, definitions });
        } else if (name != void 0) {
          datatypes.set(name, { name, definitions });
        }
      });
      return datatypes;
    }
    function parseChannel(channel, options) {
      if (options?.allowEmptySchema !== true && ["ros1msg", "ros2msg", "ros2idl"].includes(channel.schema?.encoding ?? "") && channel.schema?.data.length === 0 && !KNOWN_EMPTY_SCHEMA_NAMES.includes(channel.schema.name)) {
        throw new Error(`Schema for ${channel.schema.name} is empty`);
      }
      if (channel.messageEncoding === "json") {
        if (channel.schema != void 0 && channel.schema.encoding !== "jsonschema") {
          throw new Error(
            `Message encoding ${channel.messageEncoding} with schema encoding '${channel.schema.encoding}' is not supported (expected jsonschema or no schema)`
          );
        }
        const textDecoder2 = new TextDecoder();
        let datatypes = /* @__PURE__ */ new Map();
        let deserialize = (data) => JSON.parse(textDecoder2.decode(data));
        if (channel.schema != void 0) {
          const schema = channel.schema.data.length > 0 ? JSON.parse(textDecoder2.decode(channel.schema.data)) : void 0;
          if (schema != void 0) {
            if (typeof schema !== "object") {
              throw new Error(`Invalid schema, expected JSON object, got ${typeof schema}`);
            }
            const { datatypes: parsedDatatypes, postprocessValue } = parseJsonSchema(
              schema,
              channel.schema.name
            );
            datatypes = parsedDatatypes;
            deserialize = (data) => postprocessValue(JSON.parse(textDecoder2.decode(data)));
          }
        }
        return { deserialize, datatypes };
      }
      if (channel.messageEncoding === "flatbuffer") {
        if (channel.schema?.encoding !== "flatbuffer") {
          throw new Error(
            `Message encoding ${channel.messageEncoding} with ${channel.schema == void 0 ? "no encoding" : `schema encoding '${channel.schema.encoding}'`} is not supported (expected flatbuffer)`
          );
        }
        return parseFlatbufferSchema(channel.schema.name, channel.schema.data);
      }
      if (channel.messageEncoding === "protobuf") {
        if (channel.schema?.encoding !== "protobuf") {
          throw new Error(
            `Message encoding ${channel.messageEncoding} with ${channel.schema == void 0 ? "no encoding" : `schema encoding '${channel.schema.encoding}'`} is not supported (expected protobuf)`
          );
        }
        return parseProtobufSchema(channel.schema.name, channel.schema.data);
      }
      if (channel.messageEncoding === "ros1") {
        if (channel.schema?.encoding !== "ros1msg") {
          throw new Error(
            `Message encoding ${channel.messageEncoding} with ${channel.schema == void 0 ? "no encoding" : `schema encoding '${channel.schema.encoding}'`} is not supported (expected ros1msg)`
          );
        }
        const schema = new TextDecoder().decode(channel.schema.data);
        const parsedDefinitions = dist$2.exports.parse(schema);
        const reader2 = new MessageReader$2(parsedDefinitions);
        return {
          datatypes: parsedDefinitionsToDatatypes(parsedDefinitions, channel.schema.name),
          deserialize: (data) => reader2.readMessage(data)
        };
      }
      if (channel.messageEncoding === "cdr") {
        if (channel.schema?.encoding !== "ros2msg" && channel.schema?.encoding !== "ros2idl" && channel.schema?.encoding !== "omgidl") {
          throw new Error(
            `Message encoding ${channel.messageEncoding} with ${channel.schema == void 0 ? "no encoding" : `schema encoding '${channel.schema.encoding}'`} is not supported (expected "ros2msg" or "ros2idl")`
          );
        }
        const schema = new TextDecoder().decode(channel.schema.data);
        if (channel.schema.encoding === "omgidl") {
          const parsedDefinitions = dist$6.exports.parseIDL(schema);
          const reader2 = new dist$5.MessageReader(channel.schema.name, parsedDefinitions);
          const datatypes = parseIDLDefinitionsToDatatypes(parsedDefinitions);
          return {
            datatypes,
            deserialize: (data) => reader2.readMessage(data)
          };
        } else {
          const isIdl = channel.schema.encoding === "ros2idl";
          const parsedDefinitions = isIdl ? dist$3.exports.parseRos2idl(schema) : dist$2.exports.parse(schema, { ros2: true });
          const reader2 = new dist$1.MessageReader(parsedDefinitions);
          return {
            datatypes: parsedDefinitionsToDatatypes(parsedDefinitions, channel.schema.name),
            deserialize: (data) => reader2.readMessage(data)
          };
        }
      }
      throw new Error(`Unsupported encoding ${channel.messageEncoding}`);
    }
    async function _loadDecompressHandlers() {
      const [decompressZstd, decompressLZ4, bzip2] = await Promise.all([
        import("./index.js").then(async (mod2) => {
          await mod2.default.isLoaded;
          return mod2.default.decompress;
        }),
        import("./index2.js").then(async (mod2) => {
          await mod2.default.isLoaded;
          return mod2.default.decompress;
        }),
        import("./index3.js").then(async (mod2) => {
          await mod2.default.init();
          return mod2.default;
        })
      ]);
      return {
        lz4: (buffer, decompressedSize) => decompressLZ4(buffer, Number(decompressedSize)),
        bz2: (buffer, decompressedSize) => bzip2.decompress(buffer, Number(decompressedSize), { small: false }),
        zstd: (buffer, decompressedSize) => decompressZstd(buffer, Number(decompressedSize))
      };
    }
    let handlersPromise;
    async function loadDecompressHandlers() {
      return await (handlersPromise ?? (handlersPromise = _loadDecompressHandlers()));
    }
    class BlobReadable {
      constructor(file) {
        this.file = file;
      }
      async size() {
        return BigInt(this.file.size);
      }
      async read(offset, size) {
        if (offset + size > this.file.size) {
          throw new Error(
            `Read of ${size} bytes at offset ${offset} exceeds file size ${this.file.size}`
          );
        }
        return new Uint8Array(
          await this.file.slice(Number(offset), Number(offset + size)).arrayBuffer()
        );
      }
    }
    function pickFields(record, fields) {
      if (fields.length === 0) {
        return {};
      }
      const result = {};
      for (const field2 of fields) {
        if (field2 in record) {
          result[field2] = record[field2];
        }
      }
      return result;
    }
    const log$2 = console;
    const COMPRESSED_POINTER_SIZE = 4;
    const OBJECT_BASE_SIZE = 3 * COMPRESSED_POINTER_SIZE;
    const ARRAY_BASE_SIZE = OBJECT_BASE_SIZE + 3 * COMPRESSED_POINTER_SIZE;
    const TYPED_ARRAY_BASE_SIZE = 25 * COMPRESSED_POINTER_SIZE;
    const SMALL_INTEGER_SIZE = COMPRESSED_POINTER_SIZE;
    const HEAP_NUMBER_SIZE = 8 + 2 * COMPRESSED_POINTER_SIZE;
    const MAX_NUM_FAST_PROPERTIES = 1020;
    function estimateObjectSize(obj) {
      if (obj == void 0) {
        return SMALL_INTEGER_SIZE;
      }
      switch (typeof obj) {
        case "undefined":
        case "boolean": {
          return SMALL_INTEGER_SIZE;
        }
        case "number": {
          return Number.isInteger(obj) ? SMALL_INTEGER_SIZE : HEAP_NUMBER_SIZE;
        }
        case "bigint": {
          return HEAP_NUMBER_SIZE;
        }
        case "string": {
          return COMPRESSED_POINTER_SIZE + OBJECT_BASE_SIZE + Math.ceil(obj.length / 4) * 4;
        }
        case "object": {
          if (Array.isArray(obj)) {
            return COMPRESSED_POINTER_SIZE + ARRAY_BASE_SIZE + Object.values(obj).reduce((acc, val) => acc + estimateObjectSize(val), 0);
          } else if (ArrayBuffer.isView(obj)) {
            return TYPED_ARRAY_BASE_SIZE + obj.byteLength;
          } else if (obj instanceof Set) {
            return COMPRESSED_POINTER_SIZE + OBJECT_BASE_SIZE + Array.from(obj.values()).reduce((acc, val) => acc + estimateObjectSize(val), 0);
          } else if (obj instanceof Map) {
            return COMPRESSED_POINTER_SIZE + OBJECT_BASE_SIZE + Array.from(obj.entries()).reduce(
              (acc, [key, val]) => acc + estimateObjectSize(key) + estimateObjectSize(val),
              0
            );
          }
          let propertiesSize = 0;
          const numProps = Object.keys(obj).length;
          if (numProps > MAX_NUM_FAST_PROPERTIES) {
            const propertiesDictSize = 16 + 5 * 8 + 2 ** Math.ceil(Math.log2((numProps + 2) * 1.5)) * 3 * 4;
            propertiesSize = propertiesDictSize - numProps * COMPRESSED_POINTER_SIZE;
          }
          const valuesSize = Object.values(obj).reduce((acc, val) => acc + estimateObjectSize(val), 0);
          return OBJECT_BASE_SIZE + propertiesSize + valuesSize;
        }
        case "symbol":
        case "function": {
          throw new Error(`Can't estimate size of type '${typeof obj}'`);
        }
      }
      log$2.error(`Can't estimate size of type '${typeof obj}'`);
      return SMALL_INTEGER_SIZE;
    }
    const log$1 = console;
    class McapIndexedIterableSource {
      constructor(reader2) {
        __privateAdd(this, _estimateMessageSize);
        __privateAdd(this, _reader, void 0);
        __privateAdd(this, _channelInfoById, /* @__PURE__ */ new Map());
        __privateAdd(this, _start, void 0);
        __privateAdd(this, _end, void 0);
        __privateAdd(this, _messageSizeEstimateByHash, {});
        __privateSet(this, _reader, reader2);
      }
      async initialize() {
        let startTime;
        let endTime;
        for (const chunk of __privateGet(this, _reader).chunkIndexes) {
          if (startTime == void 0 || chunk.messageStartTime < startTime) {
            startTime = chunk.messageStartTime;
          }
          if (endTime == void 0 || chunk.messageEndTime > endTime) {
            endTime = chunk.messageEndTime;
          }
        }
        const topicStats = /* @__PURE__ */ new Map();
        const topicsByName = /* @__PURE__ */ new Map();
        const datatypes = /* @__PURE__ */ new Map();
        const problems = [];
        const publishersByTopic = /* @__PURE__ */ new Map();
        for (const channel of __privateGet(this, _reader).channelsById.values()) {
          const schema = __privateGet(this, _reader).schemasById.get(channel.schemaId);
          if (channel.schemaId !== 0 && schema == void 0) {
            problems.push({
              severity: "error",
              message: `Missing schema info for schema id ${channel.schemaId} (channel ${channel.id}, topic ${channel.topic})`
            });
            continue;
          }
          let parsedChannel;
          try {
            parsedChannel = parseChannel({ messageEncoding: channel.messageEncoding, schema });
          } catch (e) {
            let error = e;
            problems.push({
              severity: "error",
              message: `Error in topic ${channel.topic} (channel ${channel.id}): ${error.message}`,
              error
            });
            continue;
          }
          __privateGet(this, _channelInfoById).set(channel.id, {
            channel,
            parsedChannel,
            schemaName: schema?.name
          });
          let topic = topicsByName.get(channel.topic);
          if (!topic) {
            topic = { name: channel.topic, schemaName: schema?.name };
            topicsByName.set(channel.topic, topic);
            const numMessages = __privateGet(this, _reader).statistics?.channelMessageCounts.get(channel.id);
            if (numMessages != void 0) {
              topicStats.set(channel.topic, { numMessages: Number(numMessages) });
            }
          }
          const publisherId = channel.metadata.get("callerid") ?? String(channel.id);
          let publishers = publishersByTopic.get(channel.topic);
          if (!publishers) {
            publishers = /* @__PURE__ */ new Set();
            publishersByTopic.set(channel.topic, publishers);
          }
          publishers.add(publisherId);
          for (const [name, datatype] of parsedChannel.datatypes) {
            datatypes.set(name, datatype);
          }
        }
        __privateSet(this, _start, dist$7.fromNanoSec(startTime ?? 0n));
        __privateSet(this, _end, dist$7.fromNanoSec(endTime ?? startTime ?? 0n));
        return {
          start: __privateGet(this, _start),
          end: __privateGet(this, _end),
          topics: [...topicsByName.values()],
          datatypes,
          profile: __privateGet(this, _reader).header.profile,
          problems,
          publishersByTopic,
          topicStats
        };
      }
      async *messageIterator(args) {
        const topics = args.topics;
        const start = args.start ?? __privateGet(this, _start);
        const end = args.end ?? __privateGet(this, _end);
        if (topics.size === 0 || !start || !end) {
          return;
        }
        const topicsWithSubscriptionHash = new Map(
          Array.from(topics, ([topic, subscribePayload]) => [
            topic,
            {
              ...subscribePayload,
              subscriptionHash: computeSubscriptionHash(topic, subscribePayload)
            }
          ])
        );
        const topicNames = Array.from(topics.keys());
        for await (const message2 of __privateGet(this, _reader).readMessages({
          startTime: dist$7.toNanoSec(start),
          endTime: dist$7.toNanoSec(end),
          topics: topicNames,
          validateCrcs: false
        })) {
          const channelInfo = __privateGet(this, _channelInfoById).get(message2.channelId);
          if (!channelInfo) {
            yield {
              type: "problem",
              connectionId: message2.channelId,
              problem: {
                message: `Received message on channel ${message2.channelId} without prior channel info`,
                severity: "error"
              }
            };
            continue;
          }
          try {
            const msg = channelInfo.parsedChannel.deserialize(message2.data);
            const spec = topicsWithSubscriptionHash.get(channelInfo.channel.topic);
            const payload = spec?.fields != void 0 ? pickFields(msg, spec.fields) : msg;
            const estimatedMemorySize = __privateMethod(this, _estimateMessageSize, estimateMessageSize_fn).call(this, spec?.subscriptionHash ?? channelInfo.channel.topic, payload);
            const sizeInBytes = spec?.fields == void 0 ? Math.max(message2.data.byteLength, estimatedMemorySize) : estimatedMemorySize;
            yield {
              type: "message-event",
              msgEvent: {
                topic: channelInfo.channel.topic,
                receiveTime: dist$7.fromNanoSec(message2.logTime),
                publishTime: dist$7.fromNanoSec(message2.publishTime),
                message: payload,
                sizeInBytes,
                schemaName: channelInfo.schemaName ?? ""
              }
            };
          } catch (e) {
            let error = e;
            yield {
              type: "problem",
              connectionId: message2.channelId,
              problem: {
                message: `Error decoding message on ${channelInfo.channel.topic}`,
                error,
                severity: "error"
              }
            };
          }
        }
      }
      async getBackfillMessages(args) {
        const { topics, time: time2 } = args;
        const messages = [];
        for (const topic of topics.keys()) {
          for await (const message2 of __privateGet(this, _reader).readMessages({
            endTime: dist$7.toNanoSec(time2),
            topics: [topic],
            reverse: true,
            validateCrcs: false
          })) {
            const channelInfo = __privateGet(this, _channelInfoById).get(message2.channelId);
            if (!channelInfo) {
              log$1.error(`Missing channel info for channel: ${message2.channelId} on topic: ${topic}`);
              continue;
            }
            try {
              const deserializedMessage = channelInfo.parsedChannel.deserialize(message2.data);
              const sizeInBytes = Math.max(
                message2.data.byteLength,
                __privateMethod(this, _estimateMessageSize, estimateMessageSize_fn).call(this, channelInfo.channel.topic, deserializedMessage)
              );
              messages.push({
                topic: channelInfo.channel.topic,
                receiveTime: dist$7.fromNanoSec(message2.logTime),
                publishTime: dist$7.fromNanoSec(message2.publishTime),
                message: deserializedMessage,
                sizeInBytes,
                schemaName: channelInfo.schemaName ?? ""
              });
            } catch (err) {
              log$1.error(err);
            }
            break;
          }
        }
        messages.sort((a, b) => dist$7.compare(a.receiveTime, b.receiveTime));
        return messages;
      }
    }
    _reader = new WeakMap();
    _channelInfoById = new WeakMap();
    _start = new WeakMap();
    _end = new WeakMap();
    _messageSizeEstimateByHash = new WeakMap();
    _estimateMessageSize = new WeakSet();
    estimateMessageSize_fn = function(subscriptionHash, msg) {
      const cachedSize = __privateGet(this, _messageSizeEstimateByHash)[subscriptionHash];
      if (cachedSize != void 0) {
        return cachedSize;
      }
      const sizeEstimate = estimateObjectSize(msg);
      __privateGet(this, _messageSizeEstimateByHash)[subscriptionHash] = sizeEstimate;
      return sizeEstimate;
    };
    function computeSubscriptionHash(topic, subscribePayload) {
      return subscribePayload.fields ? topic + "+" + subscribePayload.fields.join("+") : topic;
    }
    var freeGlobal = typeof global == "object" && global && global.Object === Object && global;
    var freeGlobal$1 = freeGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal$1 || freeSelf || Function("return this")();
    var root$1 = root;
    var Symbol$1 = root$1.Symbol;
    var Symbol$2 = Symbol$1;
    var objectProto$b = Object.prototype;
    var hasOwnProperty$8 = objectProto$b.hasOwnProperty;
    var nativeObjectToString$1 = objectProto$b.toString;
    var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty$8.call(value, symToStringTag$1), tag = value[symToStringTag$1];
      try {
        value[symToStringTag$1] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString$1.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag$1] = tag;
        } else {
          delete value[symToStringTag$1];
        }
      }
      return result;
    }
    var objectProto$a = Object.prototype;
    var nativeObjectToString = objectProto$a.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    var nullTag = "[object Null]", undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    var isArray = Array.isArray;
    var isArray$1 = isArray;
    function isObject(value) {
      var type2 = typeof value;
      return value != null && (type2 == "object" || type2 == "function");
    }
    var asyncTag = "[object AsyncFunction]", funcTag$1 = "[object Function]", genTag = "[object GeneratorFunction]", proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag$1 || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    var coreJsData = root$1["__core-js_shared__"];
    var coreJsData$1 = coreJsData;
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData$1 && coreJsData$1.keys && coreJsData$1.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    var funcProto$1 = Function.prototype;
    var funcToString$1 = funcProto$1.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString$1.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype, objectProto$9 = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty$7 = objectProto$9.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty$7).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function getValue(object2, key) {
      return object2 == null ? void 0 : object2[key];
    }
    function getNative(object2, key) {
      var value = getValue(object2, key);
      return baseIsNative(value) ? value : void 0;
    }
    var WeakMap$1 = getNative(root$1, "WeakMap");
    var WeakMap$2 = WeakMap$1;
    var MAX_SAFE_INTEGER$1 = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type2 = typeof value;
      length = length == null ? MAX_SAFE_INTEGER$1 : length;
      return !!length && (type2 == "number" || type2 != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    var objectProto$8 = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto$8;
      return value === proto;
    }
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    var argsTag$2 = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag$2;
    }
    var objectProto$7 = Object.prototype;
    var hasOwnProperty$6 = objectProto$7.hasOwnProperty;
    var propertyIsEnumerable$1 = objectProto$7.propertyIsEnumerable;
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty$6.call(value, "callee") && !propertyIsEnumerable$1.call(value, "callee");
    };
    var isArguments$1 = isArguments;
    function stubFalse() {
      return false;
    }
    var freeExports$1 = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule$1 = freeExports$1 && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports$1 = freeModule$1 && freeModule$1.exports === freeExports$1;
    var Buffer = moduleExports$1 ? root$1.Buffer : void 0;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    var isBuffer$1 = isBuffer;
    var argsTag$1 = "[object Arguments]", arrayTag$1 = "[object Array]", boolTag$1 = "[object Boolean]", dateTag$1 = "[object Date]", errorTag$1 = "[object Error]", funcTag = "[object Function]", mapTag$2 = "[object Map]", numberTag$1 = "[object Number]", objectTag$2 = "[object Object]", regexpTag$1 = "[object RegExp]", setTag$2 = "[object Set]", stringTag$1 = "[object String]", weakMapTag$1 = "[object WeakMap]";
    var arrayBufferTag$1 = "[object ArrayBuffer]", dataViewTag$2 = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag$1] = typedArrayTags[arrayTag$1] = typedArrayTags[arrayBufferTag$1] = typedArrayTags[boolTag$1] = typedArrayTags[dataViewTag$2] = typedArrayTags[dateTag$1] = typedArrayTags[errorTag$1] = typedArrayTags[funcTag] = typedArrayTags[mapTag$2] = typedArrayTags[numberTag$1] = typedArrayTags[objectTag$2] = typedArrayTags[regexpTag$1] = typedArrayTags[setTag$2] = typedArrayTags[stringTag$1] = typedArrayTags[weakMapTag$1] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal$1.process;
    var nodeUtil = function() {
      try {
        var types2 = freeModule && freeModule.require && freeModule.require("util").types;
        if (types2) {
          return types2;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeUtil$1 = nodeUtil;
    var nodeIsTypedArray = nodeUtil$1 && nodeUtil$1.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    var isTypedArray$1 = isTypedArray;
    var objectProto$6 = Object.prototype;
    var hasOwnProperty$5 = objectProto$6.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray$1(value), isArg = !isArr && isArguments$1(value), isBuff = !isArr && !isArg && isBuffer$1(value), isType = !isArr && !isArg && !isBuff && isTypedArray$1(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty$5.call(value, key)) && !(skipIndexes && (key == "length" || isBuff && (key == "offset" || key == "parent") || isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var nativeKeys = overArg(Object.keys, Object);
    var nativeKeys$1 = nativeKeys;
    var objectProto$5 = Object.prototype;
    var hasOwnProperty$4 = objectProto$5.hasOwnProperty;
    function baseKeys(object2) {
      if (!isPrototype(object2)) {
        return nativeKeys$1(object2);
      }
      var result = [];
      for (var key in Object(object2)) {
        if (hasOwnProperty$4.call(object2, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    function keys(object2) {
      return isArrayLike(object2) ? arrayLikeKeys(object2) : baseKeys(object2);
    }
    var nativeCreate = getNative(Object, "create");
    var nativeCreate$1 = nativeCreate;
    function hashClear() {
      this.__data__ = nativeCreate$1 ? nativeCreate$1(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    var HASH_UNDEFINED$2 = "__lodash_hash_undefined__";
    var objectProto$4 = Object.prototype;
    var hasOwnProperty$3 = objectProto$4.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate$1) {
        var result = data[key];
        return result === HASH_UNDEFINED$2 ? void 0 : result;
      }
      return hasOwnProperty$3.call(data, key) ? data[key] : void 0;
    }
    var objectProto$3 = Object.prototype;
    var hasOwnProperty$2 = objectProto$3.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate$1 ? data[key] !== void 0 : hasOwnProperty$2.call(data, key);
    }
    var HASH_UNDEFINED$1 = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate$1 && value === void 0 ? HASH_UNDEFINED$1 : value;
      return this;
    }
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    var Map$1 = getNative(root$1, "Map");
    var Map$2 = Map$1;
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map$2 || ListCache)(),
        "string": new Hash()
      };
    }
    function isKeyable(value) {
      var type2 = typeof value;
      return type2 == "string" || type2 == "number" || type2 == "symbol" || type2 == "boolean" ? value !== "__proto__" : value === null;
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map$2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    function stubArray() {
      return [];
    }
    var objectProto$2 = Object.prototype;
    var propertyIsEnumerable = objectProto$2.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object2) {
      if (object2 == null) {
        return [];
      }
      object2 = Object(object2);
      return arrayFilter(nativeGetSymbols(object2), function(symbol) {
        return propertyIsEnumerable.call(object2, symbol);
      });
    };
    var getSymbols$1 = getSymbols;
    function baseGetAllKeys(object2, keysFunc, symbolsFunc) {
      var result = keysFunc(object2);
      return isArray$1(object2) ? result : arrayPush(result, symbolsFunc(object2));
    }
    function getAllKeys(object2) {
      return baseGetAllKeys(object2, keys, getSymbols$1);
    }
    var DataView$1 = getNative(root$1, "DataView");
    var DataView$2 = DataView$1;
    var Promise$1 = getNative(root$1, "Promise");
    var Promise$2 = Promise$1;
    var Set$1 = getNative(root$1, "Set");
    var Set$2 = Set$1;
    var mapTag$1 = "[object Map]", objectTag$1 = "[object Object]", promiseTag = "[object Promise]", setTag$1 = "[object Set]", weakMapTag = "[object WeakMap]";
    var dataViewTag$1 = "[object DataView]";
    var dataViewCtorString = toSource(DataView$2), mapCtorString = toSource(Map$2), promiseCtorString = toSource(Promise$2), setCtorString = toSource(Set$2), weakMapCtorString = toSource(WeakMap$2);
    var getTag = baseGetTag;
    if (DataView$2 && getTag(new DataView$2(new ArrayBuffer(1))) != dataViewTag$1 || Map$2 && getTag(new Map$2()) != mapTag$1 || Promise$2 && getTag(Promise$2.resolve()) != promiseTag || Set$2 && getTag(new Set$2()) != setTag$1 || WeakMap$2 && getTag(new WeakMap$2()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag$1 ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag$1;
            case mapCtorString:
              return mapTag$1;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag$1;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    var getTag$1 = getTag;
    var Uint8Array$1 = root$1.Uint8Array;
    var Uint8Array$2 = Uint8Array$1;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    var COMPARE_PARTIAL_FLAG$3 = 1, COMPARE_UNORDERED_FLAG$1 = 2;
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$3, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG$1 ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    var COMPARE_PARTIAL_FLAG$2 = 1, COMPARE_UNORDERED_FLAG = 2;
    var boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", mapTag = "[object Map]", numberTag = "[object Number]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]";
    var symbolProto = Symbol$2 ? Symbol$2.prototype : void 0, symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function equalByTag(object2, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object2.byteLength != other.byteLength || object2.byteOffset != other.byteOffset) {
            return false;
          }
          object2 = object2.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object2.byteLength != other.byteLength || !equalFunc(new Uint8Array$2(object2), new Uint8Array$2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object2, +other);
        case errorTag:
          return object2.name == other.name && object2.message == other.message;
        case regexpTag:
        case stringTag:
          return object2 == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG$2;
          convert || (convert = setToArray);
          if (object2.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object2);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object2, other);
          var result = equalArrays(convert(object2), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object2);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object2) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    var COMPARE_PARTIAL_FLAG$1 = 1;
    var objectProto$1 = Object.prototype;
    var hasOwnProperty$1 = objectProto$1.hasOwnProperty;
    function equalObjects(object2, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG$1, objProps = getAllKeys(object2), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty$1.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object2);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object2;
      }
      var result = true;
      stack.set(object2, other);
      stack.set(other, object2);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object2[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object2, stack) : customizer(objValue, othValue, key, object2, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object2.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object2 && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object2);
      stack["delete"](other);
      return result;
    }
    var COMPARE_PARTIAL_FLAG = 1;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", objectTag = "[object Object]";
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    function baseIsEqualDeep(object2, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray$1(object2), othIsArr = isArray$1(other), objTag = objIsArr ? arrayTag : getTag$1(object2), othTag = othIsArr ? arrayTag : getTag$1(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer$1(object2)) {
        if (!isBuffer$1(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray$1(object2) ? equalArrays(object2, other, bitmask, customizer, equalFunc, stack) : equalByTag(object2, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty.call(object2, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object2.value() : object2, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object2, other, bitmask, customizer, equalFunc, stack);
    }
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    const DURATION_YEAR_SEC = 365 * 24 * 60 * 60;
    class McapUnindexedIterableSource {
      constructor(options) {
        __privateAdd(this, _options, void 0);
        __privateAdd(this, _msgEventsByChannel, void 0);
        __privateAdd(this, _start2, void 0);
        __privateAdd(this, _end2, void 0);
        __privateSet(this, _options, options);
      }
      async initialize() {
        if (__privateGet(this, _options).size > 1024 * 1024 * 1024) {
          throw new Error("Unable to open unindexed MCAP file; unindexed files are limited to 1GB");
        }
        const decompressHandlers = await loadDecompressHandlers();
        const streamReader = __privateGet(this, _options).stream.getReader();
        const problems = [];
        const channelIdsWithErrors = /* @__PURE__ */ new Set();
        let messageCount = 0;
        const messagesByChannel = /* @__PURE__ */ new Map();
        const schemasById = /* @__PURE__ */ new Map();
        const channelInfoById = /* @__PURE__ */ new Map();
        const messageSizeEstimateByTopic = {};
        const estimateMessageSize = (topic, msg) => {
          const cachedSize = messageSizeEstimateByTopic[topic];
          if (cachedSize != void 0) {
            return cachedSize;
          }
          const sizeEstimate = estimateObjectSize(msg);
          messageSizeEstimateByTopic[topic] = sizeEstimate;
          return sizeEstimate;
        };
        let startTime;
        let endTime;
        let profile;
        function processRecord(record) {
          switch (record.type) {
            default:
              break;
            case "Header": {
              profile = record.profile;
              break;
            }
            case "Schema": {
              const existingSchema = schemasById.get(record.id);
              if (existingSchema) {
                if (!isEqual(existingSchema, record)) {
                  throw new Error(`differing schemas for id ${record.id}`);
                }
              }
              schemasById.set(record.id, record);
              break;
            }
            case "Channel": {
              const existingInfo = channelInfoById.get(record.id);
              if (existingInfo) {
                if (!isEqual(existingInfo.channel, record)) {
                  throw new Error(`differing channel infos for id ${record.id}`);
                }
                break;
              }
              if (channelIdsWithErrors.has(record.id)) {
                break;
              }
              const schema = schemasById.get(record.schemaId);
              if (record.schemaId !== 0 && !schema) {
                throw new Error(
                  `Encountered channel with schema id ${record.schemaId} but no prior schema`
                );
              }
              try {
                const parsedChannel = parseChannel({ messageEncoding: record.messageEncoding, schema });
                channelInfoById.set(record.id, {
                  channel: record,
                  parsedChannel,
                  schemaName: schema?.name
                });
                messagesByChannel.set(record.id, []);
              } catch (e) {
                let error = e;
                channelIdsWithErrors.add(record.id);
                problems.push({
                  severity: "error",
                  message: `Error in topic ${record.topic} (channel ${record.id}): ${error.message}`,
                  error
                });
              }
              break;
            }
            case "Message": {
              const channelId = record.channelId;
              const channelInfo = channelInfoById.get(channelId);
              const messages = messagesByChannel.get(channelId);
              if (!channelInfo || !messages) {
                if (channelIdsWithErrors.has(channelId)) {
                  break;
                }
                throw new Error(`message for channel ${channelId} with no prior channel info`);
              }
              ++messageCount;
              const receiveTime = dist$7.fromNanoSec(record.logTime);
              if (!startTime || dist$7.isLessThan(receiveTime, startTime)) {
                startTime = receiveTime;
              }
              if (!endTime || dist$7.isGreaterThan(receiveTime, endTime)) {
                endTime = receiveTime;
              }
              const deserializedMessage = channelInfo.parsedChannel.deserialize(record.data);
              const estimatedMemorySize = estimateMessageSize(
                channelInfo.channel.topic,
                deserializedMessage
              );
              messages.push({
                topic: channelInfo.channel.topic,
                receiveTime,
                publishTime: dist$7.fromNanoSec(record.publishTime),
                message: deserializedMessage,
                sizeInBytes: Math.max(record.data.byteLength, estimatedMemorySize),
                schemaName: channelInfo.schemaName ?? ""
              });
              break;
            }
          }
        }
        const reader2 = new McapStreamReader({ decompressHandlers });
        for (let result; result = await streamReader.read(), !result.done; ) {
          reader2.append(result.value);
          for (let record; record = reader2.nextRecord(); ) {
            processRecord(record);
          }
        }
        __privateSet(this, _msgEventsByChannel, messagesByChannel);
        const topics = [];
        const topicStats = /* @__PURE__ */ new Map();
        const datatypes = /* @__PURE__ */ new Map();
        const publishersByTopic = /* @__PURE__ */ new Map();
        for (const { channel, parsedChannel, schemaName } of channelInfoById.values()) {
          topics.push({ name: channel.topic, schemaName });
          const numMessages = messagesByChannel.get(channel.id)?.length;
          if (numMessages != void 0) {
            topicStats.set(channel.topic, { numMessages });
          }
          const publisherId = channel.metadata.get("callerid") ?? String(channel.id);
          let publishers = publishersByTopic.get(channel.topic);
          if (!publishers) {
            publishers = /* @__PURE__ */ new Set();
            publishersByTopic.set(channel.topic, publishers);
          }
          publishers.add(publisherId);
          for (const [name, datatype] of parsedChannel.datatypes) {
            datatypes.set(name, datatype);
          }
        }
        __privateSet(this, _start2, startTime ?? { sec: 0, nsec: 0 });
        __privateSet(this, _end2, endTime ?? { sec: 0, nsec: 0 });
        const fileDuration = dist$7.toSec(dist$7.subtract(__privateGet(this, _end2), __privateGet(this, _start2)));
        if (fileDuration > DURATION_YEAR_SEC) {
          const startRfc = dist$7.toRFC3339String(__privateGet(this, _start2));
          const endRfc = dist$7.toRFC3339String(__privateGet(this, _end2));
          problems.push({
            message: "This file has an abnormally long duration.",
            tip: `The start ${startRfc} and end ${endRfc} are greater than a year.`,
            severity: "warn"
          });
        }
        if (messageCount === 0) {
          problems.push({
            message: "This file contains no messages.",
            severity: "warn"
          });
        } else {
          problems.push({
            message: "This file is unindexed. Unindexed files may have degraded performance.",
            tip: "See the MCAP spec: https://mcap.dev/specification/index.html#summary-section",
            severity: "warn"
          });
        }
        return {
          start: __privateGet(this, _start2),
          end: __privateGet(this, _end2),
          topics,
          datatypes,
          profile,
          problems,
          publishersByTopic,
          topicStats
        };
      }
      async *messageIterator(args) {
        if (!__privateGet(this, _msgEventsByChannel)) {
          throw new Error("initialization not completed");
        }
        const topics = args.topics;
        const start = args.start ?? __privateGet(this, _start2);
        const end = args.end ?? __privateGet(this, _end2);
        if (topics.size === 0 || !start || !end) {
          return;
        }
        const topicsMap = new Map(topics);
        const resultMessages = [];
        for (const [channelId, msgEvents] of __privateGet(this, _msgEventsByChannel)) {
          for (const msgEvent of msgEvents) {
            if (dist$7.isTimeInRangeInclusive(msgEvent.receiveTime, start, end) && topicsMap.has(msgEvent.topic)) {
              resultMessages.push({
                type: "message-event",
                connectionId: channelId,
                msgEvent
              });
            }
          }
        }
        resultMessages.sort((a, b) => dist$7.compare(a.msgEvent.receiveTime, b.msgEvent.receiveTime));
        yield* resultMessages;
      }
      async getBackfillMessages(args) {
        if (!__privateGet(this, _msgEventsByChannel)) {
          throw new Error("initialization not completed");
        }
        const needTopics = args.topics;
        const msgEventsByTopic = /* @__PURE__ */ new Map();
        for (const [, msgEvents] of __privateGet(this, _msgEventsByChannel)) {
          for (const msgEvent of msgEvents) {
            if (dist$7.compare(msgEvent.receiveTime, args.time) <= 0 && needTopics.has(msgEvent.topic)) {
              msgEventsByTopic.set(msgEvent.topic, msgEvent);
            }
          }
        }
        return [...msgEventsByTopic.values()];
      }
    }
    _options = new WeakMap();
    _msgEventsByChannel = new WeakMap();
    _start2 = new WeakMap();
    _end2 = new WeakMap();
    const log = console;
    async function tryCreateIndexedReader(readable) {
      const decompressHandlers = await loadDecompressHandlers();
      try {
        const reader2 = await McapIndexedReader.Initialize({ readable, decompressHandlers });
        if (reader2.chunkIndexes.length === 0 || reader2.channelsById.size === 0) {
          return void 0;
        }
        return reader2;
      } catch (err) {
        log.error(err);
        return void 0;
      }
    }
    class McapIterableSource {
      constructor(source) {
        __privateAdd(this, _source, void 0);
        __privateAdd(this, _sourceImpl, void 0);
        __privateSet(this, _source, source);
      }
      async initialize() {
        const source = __privateGet(this, _source);
        await source.file.slice(0, 1).arrayBuffer();
        const readable = new BlobReadable(source.file);
        const reader2 = await tryCreateIndexedReader(readable);
        if (reader2) {
          __privateSet(this, _sourceImpl, new McapIndexedIterableSource(reader2));
        } else {
          __privateSet(this, _sourceImpl, new McapUnindexedIterableSource({
            size: source.file.size,
            stream: source.file.stream()
          }));
        }
        return await __privateGet(this, _sourceImpl).initialize();
      }
      messageIterator(opt) {
        if (!__privateGet(this, _sourceImpl)) {
          throw new Error("Invariant: uninitialized");
        }
        return __privateGet(this, _sourceImpl).messageIterator(opt);
      }
      async getBackfillMessages(args) {
        if (!__privateGet(this, _sourceImpl)) {
          throw new Error("Invariant: uninitialized");
        }
        return await __privateGet(this, _sourceImpl).getBackfillMessages(args);
      }
    }
    _source = new WeakMap();
    _sourceImpl = new WeakMap();
    function initialize(args) {
      if (args.file) {
        const source = new McapIterableSource({ type: "file", file: args.file });
        const wrapped = new WorkerIterableSourceWorker(source);
        return proxy(wrapped);
      }
      throw new Error("file or url required");
    }
    const service = {
      initialize
    };
    expose(service);
  }
});
export default require_McapIterableSourceWorker_worker();
