var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
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
var __privateMethod = (obj, member, method) => {
  __accessCheck(obj, member, "access private method");
  return method;
};
var _iter, _lastIteratorResult, _abort, _source, _bag, _readersByConnectionId, _datatypesByConnectionId, _messageSizeEstimateByTopic, _messageIterator, messageIterator_fn;
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
const isObject = (val) => typeof val === "object" && val !== null || typeof val === "function";
const proxyTransferHandler = {
  canHandle: (val) => isObject(val) && val[proxyMarker],
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
  canHandle: (value) => isObject(value) && throwMarker in value,
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
    const { id, type, path } = Object.assign({ path: [] }, ev.data);
    const argumentList = (ev.data.argumentList || []).map(fromWireValue);
    let returnValue;
    try {
      const parent = path.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
      const rawValue = path.reduce((obj2, prop) => obj2[prop], obj);
      switch (type) {
        case "GET":
          {
            returnValue = rawValue;
          }
          break;
        case "SET":
          {
            parent[path.slice(-1)[0]] = fromWireValue(ev.data.value);
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
      if (type === "RELEASE") {
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
function createProxy(ep, path = [], target = function() {
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
        if (path.length === 0) {
          return { then: () => proxy2 };
        }
        const r = requestResponseMessage(ep, {
          type: "GET",
          path: path.map((p) => p.toString())
        }).then(fromWireValue);
        return r.then.bind(r);
      }
      return createProxy(ep, [...path, prop]);
    },
    set(_target, prop, rawValue) {
      throwIfProxyReleased(isProxyReleased);
      const [value, transferables] = toWireValue(rawValue);
      return requestResponseMessage(ep, {
        type: "SET",
        path: [...path, prop].map((p) => p.toString()),
        value
      }, transferables).then(fromWireValue);
    },
    apply(_target, _thisArg, rawArgumentList) {
      throwIfProxyReleased(isProxyReleased);
      const last = path[path.length - 1];
      if (last === createEndpoint) {
        return requestResponseMessage(ep, {
          type: "ENDPOINT"
        }).then(fromWireValue);
      }
      if (last === "bind") {
        return createProxy(ep, path.slice(0, -1));
      }
      const [argumentList, transferables] = processArguments(rawArgumentList);
      return requestResponseMessage(ep, {
        type: "APPLY",
        path: path.map((p) => p.toString()),
        argumentList
      }, transferables).then(fromWireValue);
    },
    construct(_target, rawArgumentList) {
      throwIfProxyReleased(isProxyReleased);
      const [argumentList, transferables] = processArguments(rawArgumentList);
      return requestResponseMessage(ep, {
        type: "CONSTRUCT",
        path: path.map((p) => p.toString()),
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
var dist$2 = {};
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
function toMillis(time, roundUp = true) {
  const secondsMillis = time.sec * 1e3;
  const nsecMillis = time.nsec / 1e6;
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
function clampTime(time, start, end) {
  if (compare(start, time) > 0) {
    return { sec: start.sec, nsec: start.nsec };
  }
  if (compare(end, time) < 0) {
    return { sec: end.sec, nsec: end.nsec };
  }
  return { sec: time.sec, nsec: time.nsec };
}
timeUtils.clampTime = clampTime;
function isTimeInRangeInclusive(time, start, end) {
  if (compare(start, time) > 0 || compare(end, time) < 0) {
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
(function(exports) {
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
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(Time, exports);
  __exportStar(timeUtils, exports);
})(dist$2);
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
        cutoffTime = dist$2.add(firstResult.stamp, { sec: 0, nsec: durationMs * 1e6 });
        break;
      case "message-event":
        cutoffTime = dist$2.add(firstResult.msgEvent.receiveTime, { sec: 0, nsec: durationMs * 1e6 });
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
      if (result.type === "stamp" && dist$2.compare(result.stamp, cutoffTime) > 0) {
        break;
      }
      if (result.type === "message-event" && dist$2.compare(result.msgEvent.receiveTime, cutoffTime) > 0) {
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
    if (__privateGet(this, _lastIteratorResult)?.type === "stamp" && dist$2.compare(__privateGet(this, _lastIteratorResult).stamp, end) >= 0) {
      return results;
    }
    if (__privateGet(this, _lastIteratorResult)?.type === "message-event" && dist$2.compare(__privateGet(this, _lastIteratorResult).msgEvent.receiveTime, end) > 0) {
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
      if (value.type === "stamp" && dist$2.compare(value.stamp, end) >= 0) {
        __privateSet(this, _lastIteratorResult, value);
        break;
      }
      if (value.type === "message-event" && dist$2.compare(value.msgEvent.receiveTime, end) > 0) {
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
var dist$1 = { exports: {} };
(function(module) {
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
          Md52.ConvertToWordArray = function(string) {
            var lWordCount, lMessageLength = string.length, lNumberOfWords_temp1 = lMessageLength + 8, lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64, lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16, lWordArray = Array(lNumberOfWords - 1), lBytePosition = 0, lByteCount = 0;
            while (lByteCount < lMessageLength) {
              lWordCount = (lByteCount - lByteCount % 4) / 4;
              lBytePosition = lByteCount % 4 * 8;
              lWordArray[lWordCount] = lWordArray[lWordCount] | string.charCodeAt(lByteCount) << lBytePosition;
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
          Md52.Utf8Encode = function(string) {
            var utftext = "", c;
            string = string.replace(/\r\n/g, "\n");
            for (var n = 0; n < string.length; n++) {
              c = string.charCodeAt(n);
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
          Md52.init = function(string) {
            var temp;
            if (typeof string !== "string")
              string = JSON.stringify(string);
            this._string = this.Utf8Encode(string);
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
      271: function(module2, exports) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        (function(root, factory) {
          {
            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          }
        })(this, function() {
          var hasOwnProperty = Object.prototype.hasOwnProperty;
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
          function objectToRules(object) {
            var keys = Object.getOwnPropertyNames(object);
            var result = [];
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var thing = object[key];
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
          function ruleOptions(type, obj) {
            if (!isObject2(obj)) {
              obj = { match: obj };
            }
            if (obj.include) {
              throw new Error("Matching rules cannot also include states");
            }
            var options = {
              defaultType: type,
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
              if (hasOwnProperty.call(obj, key)) {
                options[key] = obj[key];
              }
            }
            if (typeof options.type === "string" && type !== options.type) {
              throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')");
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
            var keys = Object.getOwnPropertyNames(states);
            if (!start)
              start = keys[0];
            var ruleMap = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              ruleMap[key] = toRules(states[key]).concat(all);
            }
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var rules = ruleMap[key];
              var included = /* @__PURE__ */ Object.create(null);
              for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                if (!rule.include)
                  continue;
                var splice = [j, 1];
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
                    splice.push(newRule);
                  }
                }
                rules.splice.apply(rules, splice);
                j--;
              }
            }
            var map = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              map[key] = compileRules(ruleMap[key], true);
            }
            for (var i = 0; i < keys.length; i++) {
              var name = keys[i];
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
            var types = Object.getOwnPropertyNames(map);
            for (var i = 0; i < types.length; i++) {
              var tokenType = types[i];
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
          Lexer.prototype.formatError = function(token, message) {
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
            message += " at line " + token.line + " col " + token.col + ":\n\n";
            message += "  " + firstLine + "\n";
            message += "  " + Array(token.col).join(" ") + "^";
            return message;
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
      558: (module2, __unused_webpack_exports, __webpack_require__2) => {
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
                const type = d[0].value;
                if (PRIMITIVE_TYPES.includes(type))
                  return reject;
                return { type };
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
          if (typeof module2.exports !== "undefined") {
            module2.exports = grammar;
          } else {
            window.grammar = grammar;
          }
        })();
      },
      568: (module2, __unused_webpack_exports, __webpack_require__2) => {
        (function() {
          function id(x) {
            return x[0];
          }
          const keywords = [
            ,
            "struct",
            "module",
            "const",
            "include",
            "typedef",
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
          const moo = __webpack_require__2(271);
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
            ";": ";",
            ",": ",",
            AT: "@",
            PND: "#",
            PT: ".",
            "/": "/",
            SIGN: /[+-]/,
            HEADER: /={80}\nIDL: [a-zA-Z][\w]+(?:\/[a-zA-Z][\w]+)*/,
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
          const numericTypeMap = {
            "unsigned short": "uint16",
            "unsigned long": "uint32",
            "unsigned long long": "uint64",
            "short": "int16",
            "long": "int32",
            "long long": "int64",
            "double": "float64",
            "float": "float32",
            "octet": "byte",
            "wchar": "char"
          };
          function join(d) {
            return d.join("");
          }
          function extend(objs) {
            return objs.reduce((r, p) => ({ ...r, ...p }), {});
          }
          function noop() {
            return null;
          }
          function getIntOrConstantValue(d) {
            const int = parseInt(d);
            if (!isNaN(int)) {
              return int;
            }
            return d?.value ? { usesConstant: true, name: d.value } : void 0;
          }
          function aggregateConstantUsage(dcl) {
            const entries = Object.entries(dcl).filter(
              ([key, value]) => value?.usesConstant === true
            ).map(([key, { name }]) => [key, name]);
            return {
              ...dcl,
              constantUsage: entries
            };
          }
          var grammar = {
            Lexer: lexer,
            ParserRules: [
              { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": ["header"], "postprocess": id },
              { "name": "main$ebnf$1$subexpression$1$ebnf$1", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main$ebnf$1$subexpression$1$ebnf$2", "symbols": [] },
              { "name": "main$ebnf$1$subexpression$1$ebnf$2", "symbols": ["main$ebnf$1$subexpression$1$ebnf$2", "importDcl"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              { "name": "main$ebnf$1$subexpression$1$ebnf$3", "symbols": ["definition"] },
              { "name": "main$ebnf$1$subexpression$1$ebnf$3", "symbols": ["main$ebnf$1$subexpression$1$ebnf$3", "definition"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              { "name": "main$ebnf$1$subexpression$1", "symbols": ["main$ebnf$1$subexpression$1$ebnf$1", "main$ebnf$1$subexpression$1$ebnf$2", "main$ebnf$1$subexpression$1$ebnf$3"] },
              { "name": "main$ebnf$1", "symbols": ["main$ebnf$1$subexpression$1"] },
              { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": ["header"], "postprocess": id },
              { "name": "main$ebnf$1$subexpression$2$ebnf$1", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main$ebnf$1$subexpression$2$ebnf$2", "symbols": [] },
              { "name": "main$ebnf$1$subexpression$2$ebnf$2", "symbols": ["main$ebnf$1$subexpression$2$ebnf$2", "importDcl"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              { "name": "main$ebnf$1$subexpression$2$ebnf$3", "symbols": ["definition"] },
              { "name": "main$ebnf$1$subexpression$2$ebnf$3", "symbols": ["main$ebnf$1$subexpression$2$ebnf$3", "definition"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              { "name": "main$ebnf$1$subexpression$2", "symbols": ["main$ebnf$1$subexpression$2$ebnf$1", "main$ebnf$1$subexpression$2$ebnf$2", "main$ebnf$1$subexpression$2$ebnf$3"] },
              { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", "main$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              {
                "name": "main",
                "symbols": ["main$ebnf$1"],
                "postprocess": (d) => {
                  return d[0].flatMap((inner) => inner[2].flat());
                }
              },
              { "name": "header", "symbols": [lexer.has("HEADER") ? { type: "HEADER" } : HEADER], "postprocess": noop },
              { "name": "importDcl$subexpression$1", "symbols": [lexer.has("STRING") ? { type: "STRING" } : STRING] },
              { "name": "importDcl$subexpression$1$ebnf$1", "symbols": [] },
              { "name": "importDcl$subexpression$1$ebnf$1$subexpression$1", "symbols": [{ "literal": "/" }, lexer.has("NAME") ? { type: "NAME" } : NAME] },
              { "name": "importDcl$subexpression$1$ebnf$1", "symbols": ["importDcl$subexpression$1$ebnf$1", "importDcl$subexpression$1$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              { "name": "importDcl$subexpression$1", "symbols": [{ "literal": "<" }, lexer.has("NAME") ? { type: "NAME" } : NAME, "importDcl$subexpression$1$ebnf$1", { "literal": "." }, { "literal": "idl" }, { "literal": ">" }] },
              { "name": "importDcl", "symbols": [{ "literal": "#" }, { "literal": "include" }, "importDcl$subexpression$1"], "postprocess": noop },
              { "name": "moduleDcl$ebnf$1$subexpression$1", "symbols": ["definition"] },
              { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1$subexpression$1"] },
              { "name": "moduleDcl$ebnf$1$subexpression$2", "symbols": ["definition"] },
              { "name": "moduleDcl$ebnf$1", "symbols": ["moduleDcl$ebnf$1", "moduleDcl$ebnf$1$subexpression$2"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              {
                "name": "moduleDcl",
                "symbols": ["multiAnnotations", { "literal": "module" }, "fieldName", { "literal": "{" }, "moduleDcl$ebnf$1", { "literal": "}" }],
                "postprocess": function processModule(d) {
                  const moduleName = d[2].name;
                  const defs = d[4];
                  return {
                    definitionType: "module",
                    name: moduleName,
                    definitions: defs.flat(1)
                  };
                }
              },
              { "name": "definition$subexpression$1", "symbols": ["typeDcl"] },
              { "name": "definition$subexpression$1", "symbols": ["constantDcl"] },
              { "name": "definition$subexpression$1", "symbols": ["moduleDcl"] },
              { "name": "definition", "symbols": ["definition$subexpression$1", "semi"], "postprocess": (d) => d[0][0] },
              { "name": "typeDcl$subexpression$1", "symbols": ["structWithAnnotations"] },
              { "name": "typeDcl$subexpression$1", "symbols": ["typedefWithAnnotations"] },
              { "name": "typeDcl", "symbols": ["typeDcl$subexpression$1"], "postprocess": (d) => d[0][0] },
              {
                "name": "structWithAnnotations",
                "symbols": ["multiAnnotations", "struct"],
                "postprocess": (d) => d[1]
              },
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
                  definitionType: "struct",
                  name,
                  definitions
                };
              } },
              { "name": "typedefWithAnnotations$subexpression$1", "symbols": ["typedef", "allTypes", "fieldName", "arrayLength"] },
              { "name": "typedefWithAnnotations$subexpression$1", "symbols": ["typedef", "allTypes", "fieldName"] },
              { "name": "typedefWithAnnotations$subexpression$1", "symbols": ["typedef", "sequenceType", "fieldName"] },
              { "name": "typedefWithAnnotations", "symbols": ["multiAnnotations", "typedefWithAnnotations$subexpression$1"], "postprocess": (d) => {
                const def = aggregateConstantUsage(extend(d.flat(1)));
                return {
                  definitionType: "typedef",
                  ...def
                };
              } },
              { "name": "typedef", "symbols": [{ "literal": "typedef" }], "postprocess": noop },
              { "name": "constantDcl", "symbols": ["multiAnnotations", "constType"], "postprocess": (d) => d[1] },
              { "name": "member", "symbols": ["fieldWithAnnotation", "semi"], "postprocess": (d) => d[0] },
              { "name": "fieldWithAnnotation", "symbols": ["multiAnnotations", "fieldDcl"], "postprocess": (d) => {
                let possibleAnnotations = [];
                if (d[0]) {
                  possibleAnnotations = d[0];
                }
                const fields = d[1];
                const finalDefs = fields.map(
                  (def) => aggregateConstantUsage(extend([...possibleAnnotations, def]))
                );
                return finalDefs;
              } },
              { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames", "arrayLength"] },
              { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames"] },
              { "name": "fieldDcl$subexpression$1", "symbols": ["sequenceType", "multiFieldNames"] },
              { "name": "fieldDcl", "symbols": ["fieldDcl$subexpression$1"], "postprocess": (d) => {
                const names = d[0].splice(1, 1)[0];
                const defs = names.map((nameObj) => extend([...d[0], nameObj]));
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
                  return d[0] ? d[0].filter((d2) => d2 !== null) : null;
                }
              },
              { "name": "annotation$ebnf$1$subexpression$1", "symbols": [{ "literal": "(" }, "multiAnnotationParams", { "literal": ")" }] },
              { "name": "annotation$ebnf$1", "symbols": ["annotation$ebnf$1$subexpression$1"], "postprocess": id },
              { "name": "annotation$ebnf$1", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "annotation", "symbols": ["at", lexer.has("NAME") ? { type: "NAME" } : NAME, "annotation$ebnf$1"], "postprocess": (d) => {
                const paramsMap = d[2] ? d[2][1] : {};
                if (d[1].value === "default") {
                  const defaultValue = paramsMap.value;
                  return { defaultValue };
                }
                return null;
              } },
              { "name": "multiAnnotationParams$ebnf$1", "symbols": [] },
              { "name": "multiAnnotationParams$ebnf$1$subexpression$1", "symbols": [{ "literal": "," }, "annotationParam"] },
              { "name": "multiAnnotationParams$ebnf$1", "symbols": ["multiAnnotationParams$ebnf$1", "multiAnnotationParams$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) {
                return d[0].concat([d[1]]);
              } },
              {
                "name": "multiAnnotationParams",
                "symbols": ["annotationParam", "multiAnnotationParams$ebnf$1"],
                "postprocess": (d) => extend([d[0], ...d[1].flatMap(([, param]) => param)])
              },
              { "name": "annotationParam$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME, "assignment"] },
              { "name": "annotationParam", "symbols": ["annotationParam$subexpression$1"], "postprocess": (d) => ({ [d[0][0].value]: d[0][1].value }) },
              { "name": "annotationParam$subexpression$2", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
              { "name": "annotationParam", "symbols": ["annotationParam$subexpression$2"], "postprocess": noop },
              { "name": "at", "symbols": [{ "literal": "@" }], "postprocess": noop },
              { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "floatAssignment", "simple"] },
              { "name": "constType$subexpression$1", "symbols": ["constKeyword", "numericType", "fieldName", "intAssignment", "simple"] },
              { "name": "constType$subexpression$1", "symbols": ["constKeyword", "stringType", "fieldName", "stringAssignment", "simple"] },
              { "name": "constType$subexpression$1", "symbols": ["constKeyword", "booleanType", "fieldName", "booleanAssignment", "simple"] },
              { "name": "constType", "symbols": ["constType$subexpression$1"], "postprocess": (d) => {
                const def = extend(d[0]);
                def.name;
                def.value;
                return def;
              } },
              { "name": "constKeyword", "symbols": [{ "literal": "const" }], "postprocess": (d) => ({ isConstant: true }) },
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
              { "name": "arrayLength$subexpression$1", "symbols": ["INT"] },
              { "name": "arrayLength$subexpression$1", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME] },
              {
                "name": "arrayLength",
                "symbols": [{ "literal": "[" }, "arrayLength$subexpression$1", { "literal": "]" }],
                "postprocess": ([, intOrName]) => ({ isArray: true, arrayLength: getIntOrConstantValue(intOrName ? intOrName[0] : void 0) })
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
              { "name": "booleanAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "BOOLEAN"], "postprocess": ([, bool]) => ({ valueText: bool, value: bool === "TRUE" }) },
              { "name": "variableAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": ([, name]) => ({ valueText: name.value, value: { usesConstant: true, name: name.value } }) },
              { "name": "allTypes$subexpression$1", "symbols": ["primitiveTypes"] },
              { "name": "allTypes$subexpression$1", "symbols": ["customType"] },
              { "name": "allTypes", "symbols": ["allTypes$subexpression$1"], "postprocess": (d) => d[0][0] },
              { "name": "primitiveTypes$subexpression$1", "symbols": ["stringType"] },
              { "name": "primitiveTypes$subexpression$1", "symbols": ["numericType"] },
              { "name": "primitiveTypes$subexpression$1", "symbols": ["booleanType"] },
              { "name": "primitiveTypes", "symbols": ["primitiveTypes$subexpression$1"], "postprocess": (d) => ({ ...d[0][0], isComplex: false }) },
              { "name": "customType", "symbols": [lexer.has("NAME") ? { type: "NAME" } : NAME], "postprocess": (d) => {
                const typeName = d[0].value;
                const isDefinitelyComplex = typeName.includes("::");
                return { type: typeName, isComplex: isDefinitelyComplex };
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
                let strLength = void 0;
                if (d[1] !== null) {
                  strLength = getIntOrConstantValue(d[1][1] ? d[1][1][0] : void 0);
                }
                return { type: "string", upperBound: strLength };
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
                  let type = numericTypeMap[typeString];
                  return { type: type ? type : typeString };
                }
              },
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
              { "name": "semi", "symbols": [{ "literal": ";" }], "postprocess": noop },
              { "name": "simple", "symbols": [], "postprocess": () => ({ isComplex: false }) }
            ],
            ParserStart: "main"
          };
          if (typeof module2.exports !== "undefined") {
            module2.exports = grammar;
          } else {
            window.grammar = grammar;
          }
        })();
      },
      654: function(module2) {
        (function(root, factory) {
          if (module2.exports) {
            module2.exports = factory();
          } else {
            root.nearley = factory();
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
          function State(rule, dot, reference, wantedBy) {
            this.rule = rule;
            this.dot = dot;
            this.reference = reference;
            this.data = [];
            this.wantedBy = wantedBy;
            this.isComplete = this.dot === rule.symbols.length;
          }
          State.prototype.toString = function() {
            return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
          };
          State.prototype.nextState = function(child) {
            var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
            state.left = this;
            state.right = child;
            if (state.isComplete) {
              state.data = state.build();
              state.right = void 0;
            }
            return state;
          };
          State.prototype.build = function() {
            var children = [];
            var node = this;
            do {
              children.push(node.right.data);
              node = node.left;
            } while (node.left);
            children.reverse();
            return children;
          };
          State.prototype.finish = function() {
            if (this.rule.postprocess) {
              this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
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
                if (state.data !== Parser.fail) {
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
              var s = new State(r, 0, this.index, wantedBy);
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
          StreamLexer.prototype.formatError = function(token, message) {
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
              message += " at line " + this.line + " col " + col + ":\n\n";
              message += lines.map(function(line, i) {
                return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
              }, this).join("\n");
              message += "\n" + pad("", lastLineDigits + col) + "^\n";
              return message;
            } else {
              return message + " at index " + (this.index - 1);
            }
            function pad(n, length) {
              var s = String(n);
              return Array(length - s.length + 1).join(" ") + s;
            }
          };
          function Parser(rules, start, options) {
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
          Parser.fail = {};
          Parser.prototype.feed = function(chunk) {
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
          Parser.prototype.reportLexerError = function(lexerError) {
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
          Parser.prototype.reportError = function(token) {
            var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
            var lexerMessage = this.lexer.formatError(token, "Syntax error");
            return this.reportErrorCommon(lexerMessage, tokenDisplay);
          };
          Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
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
          Parser.prototype.displayStateStack = function(stateStack, lines) {
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
          Parser.prototype.getSymbolDisplay = function(symbol) {
            return getSymbolLongDisplay(symbol);
          };
          Parser.prototype.buildFirstStateStack = function(state, visited) {
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
          Parser.prototype.save = function() {
            var column = this.table[this.current];
            column.lexerState = this.lexerState;
            return column;
          };
          Parser.prototype.restore = function(column) {
            var index = column.index;
            this.current = index;
            this.table[index] = column;
            this.table.splice(index + 1);
            this.lexerState = column.lexerState;
            this.results = this.finish();
          };
          Parser.prototype.rewind = function(index) {
            if (!this.options.keepHistory) {
              throw new Error("set option `keepHistory` to enable rewinding");
            }
            this.restore(this.table[index]);
          };
          Parser.prototype.finish = function() {
            var considerations = [];
            var start = this.grammar.start;
            var column = this.table[this.table.length - 1];
            column.states.forEach(function(t) {
              if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
                considerations.push(t);
              }
            });
            return considerations.map(function(c) {
              return c.data;
            });
          };
          function getSymbolLongDisplay(symbol) {
            var type = typeof symbol;
            if (type === "string") {
              return symbol;
            } else if (type === "object") {
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
            var type = typeof symbol;
            if (type === "string") {
              return symbol;
            } else if (type === "object") {
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
            Parser,
            Grammar,
            Rule
          };
        });
      },
      515: (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.buildRos2Type = void 0;
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
        function parseArrayLiteral(type, rawStr) {
          if (!rawStr.startsWith("[") || !rawStr.endsWith("]")) {
            throw new Error("Array must start with [ and end with ]");
          }
          const str = rawStr.substring(1, rawStr.length - 1);
          if (type === "string" || type === "wstring") {
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
          return str.split(",").map((part) => parsePrimitiveLiteral(type, part.trim()));
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
        function parsePrimitiveLiteral(type, str) {
          switch (type) {
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
          throw new Error(`Invalid literal of type ${type}: ${str}`);
        }
        function normalizeType(type) {
          switch (type) {
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
          return type;
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
              const type = normalizeType(rawType);
              if (stringBound != void 0 && type !== "string" && type !== "wstring") {
                throw new Error(`Invalid string bound for type ${type}`);
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
              const isComplex = !BUILTIN_TYPES.includes(type);
              const isArray = unboundedArray != void 0 || arrayLength != void 0 || arrayBound != void 0;
              definitions.push({
                name,
                type,
                isComplex: constantValue != void 0 ? isComplex || void 0 : isComplex,
                isConstant: constantValue != void 0 || void 0,
                isArray: constantValue != void 0 ? isArray || void 0 : isArray,
                arrayLength: arrayLength != void 0 ? parseInt(arrayLength) : void 0,
                arrayUpperBound: arrayBound != void 0 ? parseInt(arrayBound) : void 0,
                upperBound: stringBound != void 0 ? parseInt(stringBound) : void 0,
                defaultValue: defaultValue != void 0 ? isArray ? parseArrayLiteral(type, defaultValue.trim()) : parsePrimitiveLiteral(type, defaultValue.trim()) : void 0,
                value: constantValue != void 0 ? parsePrimitiveLiteral(type, constantValue.trim()) : void 0,
                valueText: constantValue?.trim()
              });
            } else {
              throw new Error(`Could not parse line: '${line}'`);
            }
          }
          return { name: complexTypeName, definitions };
        }
        exports.buildRos2Type = buildRos2Type;
      },
      715: function(__unused_webpack_module, exports, __webpack_require__2) {
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
        var __exportStar = this && this.__exportStar || function(m, exports2) {
          for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
              __createBinding(exports2, m, p);
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        __exportStar(__webpack_require__2(322), exports);
        __exportStar(__webpack_require__2(867), exports);
        __exportStar(__webpack_require__2(733), exports);
        __exportStar(__webpack_require__2(210), exports);
      },
      322: (__unused_webpack_module, exports, __webpack_require__2) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.md5 = void 0;
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
        exports.md5 = md5;
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
      867: function(__unused_webpack_module, exports, __webpack_require__2) {
        var __importDefault = this && this.__importDefault || function(mod) {
          return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.normalizeType = exports.fixupTypes = exports.parse = exports.ROS2IDL_GRAMMAR = void 0;
        const nearley_1 = __webpack_require__2(654);
        const buildRos2Type_1 = __webpack_require__2(515);
        const ros1_ne_1 = __importDefault(__webpack_require__2(558));
        const ros2idl_ne_1 = __importDefault(__webpack_require__2(568));
        const ROS1_GRAMMAR = nearley_1.Grammar.fromCompiled(ros1_ne_1.default);
        exports.ROS2IDL_GRAMMAR = nearley_1.Grammar.fromCompiled(ros2idl_ne_1.default);
        function parse(messageDefinition, options = {}) {
          const allLines = messageDefinition.split("\n").map((line) => line.trim()).filter((line) => line);
          let definitionLines = [];
          const types = [];
          allLines.forEach((line) => {
            if (line.startsWith("#")) {
              return;
            }
            if (line.startsWith("==")) {
              types.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
              definitionLines = [];
            } else {
              definitionLines.push({ line });
            }
          });
          types.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
          if (options.skipTypeFixup !== true) {
            fixupTypes(types);
          }
          return types;
        }
        exports.parse = parse;
        function fixupTypes(types) {
          types.forEach(({ definitions }) => {
            definitions.forEach((definition) => {
              if (definition.isComplex === true) {
                const foundName = findTypeByName2(types, definition.type).name;
                if (foundName == void 0) {
                  throw new Error(`Missing type definition for ${definition.type}`);
                }
                definition.type = foundName;
              }
            });
          });
        }
        exports.fixupTypes = fixupTypes;
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
        function findTypeByName2(types, name) {
          const matches = types.filter((type) => {
            const typeName = type.name ?? "";
            if (name.length === 0) {
              return typeName.length === 0;
            }
            const nameEnd = name.includes("/") ? name : `/${name}`;
            return typeName.endsWith(nameEnd);
          });
          if (matches[0] == void 0) {
            throw new Error(`Expected 1 top level type definition for '${name}' but found ${matches.length}`);
          }
          return matches[0];
        }
        function normalizeType(type) {
          if (type === "char") {
            return "uint8";
          } else if (type === "byte") {
            return "int8";
          }
          return type;
        }
        exports.normalizeType = normalizeType;
      },
      733: (__unused_webpack_module, exports, __webpack_require__2) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.parseRos2idl = void 0;
        const nearley_1 = __webpack_require__2(654);
        const parse_1 = __webpack_require__2(867);
        function parseRos2idl(messageDefinition) {
          return buildRos2idlType(messageDefinition, parse_1.ROS2IDL_GRAMMAR);
        }
        exports.parseRos2idl = parseRos2idl;
        function buildRos2idlType(messageDefinition, grammar) {
          const parser = new nearley_1.Parser(grammar);
          parser.feed(messageDefinition);
          const results = parser.finish();
          if (results.length === 0) {
            throw new Error(`Could not parse message definition (unexpected end of input): '${messageDefinition}'`);
          }
          const result = results[0];
          const processedResult = postProcessIdlDefinitions(result);
          for (const { definitions } of processedResult) {
            for (const definition of definitions) {
              definition.type = (0, parse_1.normalizeType)(definition.type);
            }
          }
          return processedResult;
        }
        function traverseIdl(path, processNode) {
          const currNode = path[path.length - 1];
          const children = currNode.definitions;
          if (children) {
            children.forEach((n) => traverseIdl([...path, n], processNode));
          }
          processNode(path);
        }
        function postProcessIdlDefinitions(definitions) {
          const finalDefs = [];
          for (const definition of definitions) {
            const typedefMap = /* @__PURE__ */ new Map();
            const constantValueMap = /* @__PURE__ */ new Map();
            traverseIdl([definition], (path) => {
              const node = path[path.length - 1];
              if (node.definitionType === "typedef") {
                const { definitionType: _definitionType, name: _name, ...partialDef } = node;
                typedefMap.set(node.name, partialDef);
              } else if (node.isConstant === true) {
                constantValueMap.set(node.name, node.value);
              }
            });
            traverseIdl([definition], (path) => {
              const node = path[path.length - 1];
              if (node.definitions != void 0) {
                return;
              }
              if (node.type && typedefMap.has(node.type)) {
                Object.assign(node, { ...typedefMap.get(node.type), name: node.name });
              }
              for (const [key, constantName] of node.constantUsage ?? []) {
                if (constantValueMap.has(constantName)) {
                  node[key] = constantValueMap.get(constantName);
                } else {
                  throw new Error(`Could not find constant <${constantName}> for field <${node.name ?? "undefined"}> in <${definition.name}>`);
                }
              }
              delete node.constantUsage;
              if (node.type != void 0) {
                node.type = node.type.replace(/::/g, "/");
              }
            });
            const flattened = flattenIdlNamespaces(definition);
            finalDefs.push(...flattened);
          }
          return finalDefs;
        }
        function flattenIdlNamespaces(definition) {
          const flattened = [];
          traverseIdl([definition], (path) => {
            const node = path[path.length - 1];
            if (node.definitionType === "module") {
              const moduleDefs = node.definitions.filter((d) => d.definitionType !== "typedef");
              if (moduleDefs.every((child) => child.isConstant)) {
                flattened.push({
                  name: path.map((n) => n.name).join("/"),
                  definitions: moduleDefs
                });
              }
            } else if (node.definitionType === "struct") {
              flattened.push({
                name: path.map((n) => n.name).join("/"),
                definitions: node.definitions
              });
            }
          });
          return flattened;
        }
      },
      210: (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.stringify = void 0;
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
        exports.stringify = stringify;
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
      var module2 = __webpack_module_cache__[moduleId] = {
        exports: {}
      };
      __webpack_modules__[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
      return module2.exports;
    }
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = (exports) => {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
    })();
    var __webpack_exports__ = __webpack_require__(715);
    module.exports = __webpack_exports__;
  })();
})(dist$1);
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
const deserializers = {
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
      arr[idx] = deserializers.bool(view, currentOffset);
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
  durationArray: (view, offset, len) => deserializers.timeArray(view, offset, len),
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
    return deserializers.fixedArray(view, offset + 4, len, elementDeser, elementSize);
  }
};
function isBigEndian() {
  const array = new Uint8Array(4);
  const view = new Uint32Array(array.buffer);
  view[0] = 1;
  return array[3] === 1;
}
const isLittleEndian = !isBigEndian();
if (!isLittleEndian) {
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
const findTypeByName = (types, name = "") => {
  let foundName = "";
  const matches = types.filter((type) => {
    const typeName = type.name ?? "";
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
  const unnamedTypes = definitions.filter((type) => !type.name);
  if (unnamedTypes.length > 1) {
    throw new Error("multiple unnamed types");
  }
  const unnamedType = unnamedTypes.length > 0 ? unnamedTypes[0] : definitions[0];
  const namedTypes = definitions.filter((type) => !!type.name);
  const constructorBody = (type) => {
    const readerLines = [];
    type.definitions.forEach((def) => {
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
  for (const type of namedTypes) {
    js += `
  Record.${friendlyName(type.name)} = function(reader) {
    ${constructorBody(type)}
  };
  builtReaders.set(${JSON.stringify(type.name)}, Record.${friendlyName(type.name)});
  `;
  }
  js += `return builtReaders;`;
  return new Function("topLevelReaderKey", js)(topLevelReaderKey);
};
class MessageReader {
  constructor(definitions, options = {}) {
    this.reader = createParsers({ definitions, options, topLevelReaderKey: "<toplevel>" }).get("<toplevel>");
  }
  readMessage(buffer) {
    const standardReaders = new StandardTypeReader(buffer);
    return new this.reader(standardReaders);
  }
}
const EQUALS_CHARCODE = "=".charCodeAt(0);
function extractFields(buffer) {
  if (buffer.length < 4) {
    throw new Error("fields are truncated.");
  }
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  let offset = 0;
  const fields = {};
  while (offset < buffer.length) {
    const length = view.getInt32(offset, true);
    offset += 4;
    if (offset + length > buffer.length) {
      throw new Error("Header fields are corrupt.");
    }
    const field = buffer.subarray(offset, offset + length);
    const index = field.indexOf(EQUALS_CHARCODE);
    if (index === -1) {
      throw new Error("Header field is missing equals sign.");
    }
    const fieldName = new TextDecoder().decode(field.subarray(0, index));
    fields[fieldName] = field.subarray(index + 1);
    offset += length;
  }
  return fields;
}
function extractTime(buffer, offset) {
  const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const sec = view.getUint32(offset, true);
  const nsec = view.getUint32(offset + 4, true);
  return { sec, nsec };
}
var heap$1 = { exports: {} };
var heap = { exports: {} };
(function(module, exports) {
  (function() {
    var Heap2, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;
    floor = Math.floor, min = Math.min;
    defaultCmp = function(x, y) {
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    };
    insort = function(a, x, lo, hi, cmp) {
      var mid;
      if (lo == null) {
        lo = 0;
      }
      if (cmp == null) {
        cmp = defaultCmp;
      }
      if (lo < 0) {
        throw new Error("lo must be non-negative");
      }
      if (hi == null) {
        hi = a.length;
      }
      while (lo < hi) {
        mid = floor((lo + hi) / 2);
        if (cmp(x, a[mid]) < 0) {
          hi = mid;
        } else {
          lo = mid + 1;
        }
      }
      return [].splice.apply(a, [lo, lo - lo].concat(x)), x;
    };
    heappush = function(array, item, cmp) {
      if (cmp == null) {
        cmp = defaultCmp;
      }
      array.push(item);
      return _siftdown(array, 0, array.length - 1, cmp);
    };
    heappop = function(array, cmp) {
      var lastelt, returnitem;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      lastelt = array.pop();
      if (array.length) {
        returnitem = array[0];
        array[0] = lastelt;
        _siftup(array, 0, cmp);
      } else {
        returnitem = lastelt;
      }
      return returnitem;
    };
    heapreplace = function(array, item, cmp) {
      var returnitem;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      returnitem = array[0];
      array[0] = item;
      _siftup(array, 0, cmp);
      return returnitem;
    };
    heappushpop = function(array, item, cmp) {
      var _ref;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      if (array.length && cmp(array[0], item) < 0) {
        _ref = [array[0], item], item = _ref[0], array[0] = _ref[1];
        _siftup(array, 0, cmp);
      }
      return item;
    };
    heapify = function(array, cmp) {
      var i, _i, _len, _ref1, _results, _results1;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      _ref1 = function() {
        _results1 = [];
        for (var _j = 0, _ref = floor(array.length / 2); 0 <= _ref ? _j < _ref : _j > _ref; 0 <= _ref ? _j++ : _j--) {
          _results1.push(_j);
        }
        return _results1;
      }.apply(this).reverse();
      _results = [];
      for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
        i = _ref1[_i];
        _results.push(_siftup(array, i, cmp));
      }
      return _results;
    };
    updateItem = function(array, item, cmp) {
      var pos;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      pos = array.indexOf(item);
      if (pos === -1) {
        return;
      }
      _siftdown(array, 0, pos, cmp);
      return _siftup(array, pos, cmp);
    };
    nlargest = function(array, n, cmp) {
      var elem, result, _i, _len, _ref;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      result = array.slice(0, n);
      if (!result.length) {
        return result;
      }
      heapify(result, cmp);
      _ref = array.slice(n);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        elem = _ref[_i];
        heappushpop(result, elem, cmp);
      }
      return result.sort(cmp).reverse();
    };
    nsmallest = function(array, n, cmp) {
      var elem, los, result, _i, _j, _len, _ref, _ref1, _results;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      if (n * 10 <= array.length) {
        result = array.slice(0, n).sort(cmp);
        if (!result.length) {
          return result;
        }
        los = result[result.length - 1];
        _ref = array.slice(n);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          elem = _ref[_i];
          if (cmp(elem, los) < 0) {
            insort(result, elem, 0, null, cmp);
            result.pop();
            los = result[result.length - 1];
          }
        }
        return result;
      }
      heapify(array, cmp);
      _results = [];
      for (_j = 0, _ref1 = min(n, array.length); 0 <= _ref1 ? _j < _ref1 : _j > _ref1; 0 <= _ref1 ? ++_j : --_j) {
        _results.push(heappop(array, cmp));
      }
      return _results;
    };
    _siftdown = function(array, startpos, pos, cmp) {
      var newitem, parent, parentpos;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      newitem = array[pos];
      while (pos > startpos) {
        parentpos = pos - 1 >> 1;
        parent = array[parentpos];
        if (cmp(newitem, parent) < 0) {
          array[pos] = parent;
          pos = parentpos;
          continue;
        }
        break;
      }
      return array[pos] = newitem;
    };
    _siftup = function(array, pos, cmp) {
      var childpos, endpos, newitem, rightpos, startpos;
      if (cmp == null) {
        cmp = defaultCmp;
      }
      endpos = array.length;
      startpos = pos;
      newitem = array[pos];
      childpos = 2 * pos + 1;
      while (childpos < endpos) {
        rightpos = childpos + 1;
        if (rightpos < endpos && !(cmp(array[childpos], array[rightpos]) < 0)) {
          childpos = rightpos;
        }
        array[pos] = array[childpos];
        pos = childpos;
        childpos = 2 * pos + 1;
      }
      array[pos] = newitem;
      return _siftdown(array, startpos, pos, cmp);
    };
    Heap2 = function() {
      Heap3.push = heappush;
      Heap3.pop = heappop;
      Heap3.replace = heapreplace;
      Heap3.pushpop = heappushpop;
      Heap3.heapify = heapify;
      Heap3.updateItem = updateItem;
      Heap3.nlargest = nlargest;
      Heap3.nsmallest = nsmallest;
      function Heap3(cmp) {
        this.cmp = cmp != null ? cmp : defaultCmp;
        this.nodes = [];
      }
      Heap3.prototype.push = function(x) {
        return heappush(this.nodes, x, this.cmp);
      };
      Heap3.prototype.pop = function() {
        return heappop(this.nodes, this.cmp);
      };
      Heap3.prototype.peek = function() {
        return this.nodes[0];
      };
      Heap3.prototype.contains = function(x) {
        return this.nodes.indexOf(x) !== -1;
      };
      Heap3.prototype.replace = function(x) {
        return heapreplace(this.nodes, x, this.cmp);
      };
      Heap3.prototype.pushpop = function(x) {
        return heappushpop(this.nodes, x, this.cmp);
      };
      Heap3.prototype.heapify = function() {
        return heapify(this.nodes, this.cmp);
      };
      Heap3.prototype.updateItem = function(x) {
        return updateItem(this.nodes, x, this.cmp);
      };
      Heap3.prototype.clear = function() {
        return this.nodes = [];
      };
      Heap3.prototype.empty = function() {
        return this.nodes.length === 0;
      };
      Heap3.prototype.size = function() {
        return this.nodes.length;
      };
      Heap3.prototype.clone = function() {
        var heap2;
        heap2 = new Heap3();
        heap2.nodes = this.nodes.slice(0);
        return heap2;
      };
      Heap3.prototype.toArray = function() {
        return this.nodes.slice(0);
      };
      Heap3.prototype.insert = Heap3.prototype.push;
      Heap3.prototype.top = Heap3.prototype.peek;
      Heap3.prototype.front = Heap3.prototype.peek;
      Heap3.prototype.has = Heap3.prototype.contains;
      Heap3.prototype.copy = Heap3.prototype.clone;
      return Heap3;
    }();
    (function(root, factory) {
      {
        return module.exports = factory();
      }
    })(this, function() {
      return Heap2;
    });
  }).call(commonjsGlobal);
})(heap);
(function(module) {
  module.exports = heap.exports;
})(heap$1);
var Heap = /* @__PURE__ */ getDefaultExportFromCjs(heap$1.exports);
function nmerge(key, ...iterables) {
  const heap2 = new Heap((a, b) => {
    return key(a.value, b.value);
  });
  for (let i = 0; i < iterables.length; i++) {
    const result = iterables[i].next();
    if (result.done !== true) {
      heap2.push({ i, value: result.value });
    }
  }
  return {
    next: () => {
      if (heap2.empty()) {
        return { done: true, value: void 0 };
      }
      const { i } = heap2.front();
      const next = iterables[i].next();
      if (next.done === true) {
        return { value: heap2.pop().value, done: false };
      }
      return { value: heap2.replace({ i, value: next.value }).value, done: false };
    }
  };
}
function readUint32(buff) {
  const view = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  return view.getUint32(0, true);
}
function readInt32(buff) {
  const view = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  return view.getInt32(0, true);
}
function readBigUInt64(buff) {
  const view = new DataView(buff.buffer, buff.byteOffset, buff.byteLength);
  const bigint = BigInt(view.getUint32(0, true)) | BigInt(view.getUint32(4, true)) << 32n;
  if (bigint > Number.MAX_SAFE_INTEGER) {
    throw new Error(`Read a bigint larger than 2**53: ${bigint}`);
  }
  return Number(bigint);
}
class Record {
  parseData(_buffer) {
  }
}
class BagHeader extends Record {
  constructor(fields) {
    super();
    this.indexPosition = readBigUInt64(fields.index_pos);
    this.connectionCount = readInt32(fields.conn_count);
    this.chunkCount = readInt32(fields.chunk_count);
  }
}
BagHeader.opcode = 3;
class Chunk extends Record {
  constructor(fields) {
    super();
    this.compression = new TextDecoder().decode(fields.compression);
    this.size = readUint32(fields.size);
  }
  parseData(buffer) {
    this.data = buffer;
  }
}
Chunk.opcode = 5;
const getField = (fields, key) => {
  if (fields[key] == void 0) {
    throw new Error(`Connection header is missing ${key}.`);
  }
  return new TextDecoder().decode(fields[key]);
};
class Connection extends Record {
  constructor(fields) {
    super();
    this.conn = readUint32(fields.conn);
    this.topic = new TextDecoder().decode(fields.topic);
    this.type = void 0;
    this.md5sum = void 0;
    this.messageDefinition = "";
  }
  parseData(buffer) {
    const fields = extractFields(buffer);
    this.type = getField(fields, "type");
    this.md5sum = getField(fields, "md5sum");
    this.messageDefinition = getField(fields, "message_definition");
    if (fields.callerid != void 0) {
      this.callerid = new TextDecoder().decode(fields.callerid);
    }
    if (fields.latching != void 0) {
      this.latching = new TextDecoder().decode(fields.latching) === "1";
    }
  }
}
Connection.opcode = 7;
class MessageData extends Record {
  constructor(fields) {
    super();
    this.conn = readUint32(fields.conn);
    this.time = extractTime(fields.time, 0);
  }
  parseData(buffer) {
    this.data = buffer;
  }
}
MessageData.opcode = 2;
class IndexData extends Record {
  constructor(fields) {
    super();
    this.ver = readUint32(fields.ver);
    this.conn = readUint32(fields.conn);
    this.count = readUint32(fields.count);
  }
  parseData(buffer) {
    this.indices = [];
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    for (let i = 0; i < this.count; i++) {
      this.indices.push({
        time: extractTime(buffer, i * 12),
        offset: view.getUint32(i * 12 + 8, true)
      });
    }
  }
}
IndexData.opcode = 4;
class ChunkInfo extends Record {
  constructor(fields) {
    super();
    this.connections = [];
    this.ver = readUint32(fields.ver);
    this.chunkPosition = readBigUInt64(fields.chunk_pos);
    this.startTime = extractTime(fields.start_time, 0);
    this.endTime = extractTime(fields.end_time, 0);
    this.count = readUint32(fields.count);
  }
  parseData(buffer) {
    this.connections = [];
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    for (let i = 0; i < this.count; i++) {
      this.connections.push({
        conn: view.getUint32(i * 8, true),
        count: view.getUint32(i * 8 + 4, true)
      });
    }
  }
}
ChunkInfo.opcode = 6;
const LITTLE_ENDIAN = true;
const HEADER_READAHEAD = 4096;
const HEADER_OFFSET = 13;
class BagReader {
  constructor(filelike) {
    this._file = filelike;
  }
  async verifyBagHeader() {
    const buffer = await this._file.read(0, HEADER_OFFSET);
    const magic = new TextDecoder().decode(buffer);
    if (magic !== "#ROSBAG V2.0\n") {
      throw new Error("Cannot identify bag format.");
    }
  }
  async readHeader() {
    await this.verifyBagHeader();
    const buffer = await this._file.read(HEADER_OFFSET, HEADER_READAHEAD);
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const read = buffer.length;
    if (read < 8) {
      throw new Error(`Record at position ${HEADER_OFFSET} is truncated.`);
    }
    const headerLength = view.getInt32(0, LITTLE_ENDIAN);
    if (read < headerLength + 8) {
      throw new Error(`Record at position ${HEADER_OFFSET} header too large: ${headerLength}.`);
    }
    return this.readRecordFromBuffer(buffer, HEADER_OFFSET, BagHeader);
  }
  async readConnectionsAndChunkInfo(fileOffset, connectionCount, chunkCount) {
    const buffer = await this._file.read(fileOffset, this._file.size() - fileOffset);
    if (connectionCount === 0) {
      return { connections: [], chunkInfos: [] };
    }
    const connections = this.readRecordsFromBuffer(buffer, connectionCount, fileOffset, Connection);
    const connectionBlockLength = connections[connectionCount - 1].end - connections[0].offset;
    const chunkInfos = this.readRecordsFromBuffer(buffer.subarray(connectionBlockLength), chunkCount, fileOffset + connectionBlockLength, ChunkInfo);
    if (chunkCount > 0) {
      for (let i = 0; i < chunkCount - 1; i++) {
        chunkInfos[i].nextChunk = chunkInfos[i + 1];
      }
      chunkInfos[chunkCount - 1].nextChunk = void 0;
    }
    return { connections, chunkInfos };
  }
  async readChunkMessages(chunkInfo, connections, startTime, endTime, decompress) {
    const start = startTime ?? { sec: 0, nsec: 0 };
    const end = endTime ?? { sec: Number.MAX_VALUE, nsec: Number.MAX_VALUE };
    const conns = connections ?? chunkInfo.connections.map((connection) => {
      return connection.conn;
    });
    const result = await this.readChunk(chunkInfo, decompress);
    const chunk = result.chunk;
    const indices = {};
    result.indices.forEach((index) => {
      indices[index.conn] = index;
    });
    const presentConnections = conns.filter((conn) => {
      return indices[conn] != void 0;
    });
    const iterables = presentConnections.map((conn) => {
      return indices[conn].indices[Symbol.iterator]();
    });
    const iter = nmerge((a, b) => dist$2.compare(a.time, b.time), ...iterables);
    const entries = [];
    let item = iter.next();
    while (item.done !== true) {
      const { value } = item;
      item = iter.next();
      if (value == null || dist$2.isGreaterThan(start, value.time)) {
        continue;
      }
      if (dist$2.isGreaterThan(value.time, end)) {
        break;
      }
      entries.push(value);
    }
    const messages = entries.map((entry) => {
      return this.readRecordFromBuffer(chunk.data.subarray(entry.offset), chunk.dataOffset, MessageData);
    });
    return messages;
  }
  async readChunk(chunkInfo, decompress) {
    if (chunkInfo === this._lastChunkInfo && this._lastReadResult != null) {
      return this._lastReadResult;
    }
    const { nextChunk } = chunkInfo;
    const readLength = nextChunk != null ? nextChunk.chunkPosition - chunkInfo.chunkPosition : this._file.size() - chunkInfo.chunkPosition;
    const buffer = await this._file.read(chunkInfo.chunkPosition, readLength);
    const chunk = this.readRecordFromBuffer(buffer, chunkInfo.chunkPosition, Chunk);
    const { compression } = chunk;
    if (compression !== "none") {
      const decompressFn = decompress[compression];
      if (decompressFn == null) {
        throw new Error(`Unsupported compression type ${chunk.compression}`);
      }
      const result = decompressFn(chunk.data, chunk.size);
      chunk.data = result;
    }
    const indices = this.readRecordsFromBuffer(buffer.subarray(chunk.length), chunkInfo.count, chunkInfo.chunkPosition + chunk.length, IndexData);
    this._lastChunkInfo = chunkInfo;
    this._lastReadResult = { chunk, indices };
    return this._lastReadResult;
  }
  readRecordsFromBuffer(buffer, count, fileOffset, cls) {
    const records = [];
    let bufferOffset = 0;
    for (let i = 0; i < count; i++) {
      const record = this.readRecordFromBuffer(buffer.subarray(bufferOffset), fileOffset + bufferOffset, cls);
      bufferOffset += record.end - record.offset;
      records.push(record);
    }
    return records;
  }
  readRecordFromBuffer(buffer, fileOffset, cls) {
    const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    const headerLength = view.getInt32(0, LITTLE_ENDIAN);
    const fields = extractFields(buffer.subarray(4, 4 + headerLength));
    if (fields.op == void 0) {
      throw new Error("Record is missing 'op' field.");
    }
    const opView = new DataView(fields.op.buffer, fields.op.byteOffset, fields.op.byteLength);
    const opcode = opView.getUint8(0);
    if (opcode !== cls.opcode) {
      throw new Error(`Expected ${cls.name} (${cls.opcode}) but found ${opcode}`);
    }
    const record = new cls(fields);
    const dataOffset = 4 + headerLength + 4;
    const dataLength = view.getInt32(4 + headerLength, LITTLE_ENDIAN);
    const data = new Uint8Array(buffer.buffer.slice(buffer.byteOffset + dataOffset, buffer.byteOffset + dataOffset + dataLength));
    record.parseData(data);
    record.offset = fileOffset;
    record.dataOffset = record.offset + 4 + headerLength + 4;
    record.end = record.dataOffset + dataLength;
    record.length = record.end - record.offset;
    return record;
  }
}
class BaseIterator {
  constructor(args, compare2) {
    this.cachedChunkReadResults = /* @__PURE__ */ new Map();
    this.connections = args.connections;
    this.reader = args.reader;
    this.position = args.position;
    this.decompress = args.decompress;
    this.reader = args.reader;
    this.chunkInfos = args.chunkInfos;
    this.heap = new Heap(compare2);
    this.parse = args.parse;
    if (args.topics) {
      const topics = args.topics;
      const connectionIds = this.connectionIds = /* @__PURE__ */ new Set();
      for (const [id, connection] of args.connections) {
        if (topics.includes(connection.topic)) {
          this.connectionIds.add(id);
        }
      }
      this.chunkInfos = args.chunkInfos.filter((info) => {
        return info.connections.find((conn) => {
          return connectionIds.has(conn.conn);
        });
      });
    }
  }
  async *[Symbol.asyncIterator]() {
    while (true) {
      if (!this.heap.front()) {
        await this.loadNext();
      }
      if (!this.heap.front()) {
        await this.loadNext();
      }
      const item = this.heap.pop();
      if (!item) {
        return;
      }
      const chunk = item.chunkReadResult.chunk;
      const messageData = this.reader.readRecordFromBuffer(chunk.data.subarray(item.offset), chunk.dataOffset, MessageData);
      const connection = this.connections.get(messageData.conn);
      if (!connection) {
        throw new Error(`Unable to find connection with id ${messageData.conn}`);
      }
      const { topic } = connection;
      const { data, time } = messageData;
      if (!data) {
        throw new Error(`No data in message for topic: ${topic}`);
      }
      const event = {
        topic,
        connectionId: messageData.conn,
        timestamp: time,
        data,
        message: this.parse?.(data, connection)
      };
      yield event;
    }
  }
}
class ForwardIterator extends BaseIterator {
  constructor(args) {
    super(args, (a, b) => {
      return dist$2.compare(a.time, b.time);
    });
    this.chunkInfos = this.chunkInfos.filter((info) => {
      return dist$2.compare(info.endTime, this.position) >= 0;
    });
    const chunkInfoHeap = new Heap((a, b) => {
      return dist$2.compare(a.startTime, b.startTime);
    });
    for (const info of this.chunkInfos) {
      chunkInfoHeap.insert(info);
    }
    this.remainingChunkInfos = [];
    while (chunkInfoHeap.size() > 0) {
      this.remainingChunkInfos.push(chunkInfoHeap.pop());
    }
  }
  async loadNext() {
    const stamp = this.position;
    const firstChunkInfo = this.remainingChunkInfos[0];
    if (!firstChunkInfo) {
      return;
    }
    this.remainingChunkInfos[0] = void 0;
    let end = firstChunkInfo.endTime;
    const chunksToLoad = [firstChunkInfo];
    for (let idx = 1; idx < this.remainingChunkInfos.length; ++idx) {
      const nextChunkInfo = this.remainingChunkInfos[idx];
      if (!nextChunkInfo) {
        continue;
      }
      if (dist$2.compare(nextChunkInfo.startTime, end) > 0) {
        break;
      }
      chunksToLoad.push(nextChunkInfo);
      const endCompare = dist$2.compare(nextChunkInfo.endTime, end);
      if (endCompare <= 0) {
        this.remainingChunkInfos[idx] = void 0;
      }
    }
    this.remainingChunkInfos = this.remainingChunkInfos.filter(Boolean);
    if (chunksToLoad.length === 0) {
      return;
    }
    this.position = end = dist$2.add(end, { sec: 0, nsec: 1 });
    const heap2 = this.heap;
    const newCache = /* @__PURE__ */ new Map();
    for (const chunkInfo of chunksToLoad) {
      let result = this.cachedChunkReadResults.get(chunkInfo.chunkPosition);
      if (!result) {
        result = await this.reader.readChunk(chunkInfo, this.decompress);
      }
      if (dist$2.compare(chunkInfo.startTime, end) <= 0 && dist$2.compare(chunkInfo.endTime, end) >= 0) {
        newCache.set(chunkInfo.chunkPosition, result);
      }
      for (const indexData of result.indices) {
        if (this.connectionIds && !this.connectionIds.has(indexData.conn)) {
          continue;
        }
        for (const indexEntry of indexData.indices ?? []) {
          if (dist$2.compare(indexEntry.time, stamp) < 0 || dist$2.compare(indexEntry.time, end) >= 0) {
            continue;
          }
          heap2.push({ time: indexEntry.time, offset: indexEntry.offset, chunkReadResult: result });
        }
      }
    }
    this.cachedChunkReadResults = newCache;
  }
}
class ReadResult {
  constructor(topic, message, timestamp, data, chunkOffset, totalChunks, freeze) {
    this.topic = topic;
    this.message = message;
    this.timestamp = timestamp;
    this.data = data;
    this.chunkOffset = chunkOffset;
    this.totalChunks = totalChunks;
    if (freeze === true) {
      Object.freeze(timestamp);
      Object.freeze(this);
    }
  }
}
class ReverseIterator extends BaseIterator {
  constructor(args) {
    super(args, (a, b) => {
      return dist$2.compare(b.time, a.time);
    });
    this.chunkInfos = this.chunkInfos.filter((info) => {
      return dist$2.compare(info.startTime, this.position) <= 0;
    });
    const chunkInfoHeap = new Heap((a, b) => {
      return dist$2.compare(b.endTime, a.endTime);
    });
    for (const info of this.chunkInfos) {
      chunkInfoHeap.insert(info);
    }
    this.remainingChunkInfos = [];
    while (chunkInfoHeap.size() > 0) {
      this.remainingChunkInfos.push(chunkInfoHeap.pop());
    }
  }
  async loadNext() {
    const stamp = this.position;
    const firstChunkInfo = this.remainingChunkInfos[0];
    if (!firstChunkInfo) {
      return;
    }
    this.remainingChunkInfos[0] = void 0;
    let start = firstChunkInfo.startTime;
    const chunksToLoad = [firstChunkInfo];
    for (let idx = 1; idx < this.remainingChunkInfos.length; ++idx) {
      const nextChunkInfo = this.remainingChunkInfos[idx];
      if (!nextChunkInfo) {
        continue;
      }
      if (dist$2.compare(nextChunkInfo.endTime, start) < 0) {
        break;
      }
      chunksToLoad.push(nextChunkInfo);
      const startCompare = dist$2.compare(nextChunkInfo.startTime, start);
      if (startCompare >= 0) {
        this.remainingChunkInfos[idx] = void 0;
      }
    }
    this.remainingChunkInfos = this.remainingChunkInfos.filter(Boolean);
    if (chunksToLoad.length === 0) {
      return;
    }
    this.position = start = dist$2.subtract(start, { sec: 0, nsec: 1 });
    const heap2 = this.heap;
    const newCache = /* @__PURE__ */ new Map();
    for (const chunkInfo of chunksToLoad) {
      let result = this.cachedChunkReadResults.get(chunkInfo.chunkPosition);
      if (!result) {
        result = await this.reader.readChunk(chunkInfo, this.decompress);
      }
      if (dist$2.compare(chunkInfo.startTime, start) <= 0 && dist$2.compare(chunkInfo.endTime, start) >= 0) {
        newCache.set(chunkInfo.chunkPosition, result);
      }
      for (const indexData of result.indices) {
        if (this.connectionIds && !this.connectionIds.has(indexData.conn)) {
          continue;
        }
        for (const indexEntry of indexData.indices ?? []) {
          if (dist$2.compare(indexEntry.time, start) <= 0 || dist$2.compare(indexEntry.time, stamp) > 0) {
            continue;
          }
          heap2.push({ time: indexEntry.time, offset: indexEntry.offset, chunkReadResult: result });
        }
      }
    }
    this.cachedChunkReadResults = newCache;
  }
}
class Bag {
  constructor(filelike, opt) {
    this.chunkInfos = [];
    this.reader = new BagReader(filelike);
    this.connections = /* @__PURE__ */ new Map();
    this.bagOpt = opt ?? {};
  }
  async open() {
    this.header = await this.reader.readHeader();
    const { connectionCount, chunkCount, indexPosition } = this.header;
    const result = await this.reader.readConnectionsAndChunkInfo(indexPosition, connectionCount, chunkCount);
    this.connections = /* @__PURE__ */ new Map();
    result.connections.forEach((connection) => {
      this.connections.set(connection.conn, connection);
    });
    this.chunkInfos = result.chunkInfos;
    if (chunkCount > 0) {
      this.startTime = this.chunkInfos[0].startTime;
      this.endTime = this.chunkInfos[chunkCount - 1].endTime;
    }
  }
  messageIterator(opt) {
    const topics = opt?.topics;
    let parse;
    if (this.bagOpt.parse !== false) {
      parse = (data, connection) => {
        connection.reader ?? (connection.reader = new MessageReader(dist$1.exports.parse(connection.messageDefinition)));
        return connection.reader.readMessage(data);
      };
    }
    if (opt?.reverse === true) {
      const position = opt?.start ?? this.endTime;
      if (!position) {
        throw new Error("no timestamp");
      }
      return new ReverseIterator({
        position,
        topics,
        reader: this.reader,
        connections: this.connections,
        chunkInfos: this.chunkInfos,
        decompress: this.bagOpt.decompress ?? {},
        parse
      });
    } else {
      const position = opt?.start ?? this.startTime;
      if (!position) {
        throw new Error("no timestamp");
      }
      return new ForwardIterator({
        position,
        topics,
        reader: this.reader,
        chunkInfos: this.chunkInfos,
        connections: this.connections,
        decompress: this.bagOpt.decompress ?? {},
        parse
      });
    }
  }
  async readMessages(opts, callback) {
    const connections = this.connections;
    const startTime = opts.startTime ?? { sec: 0, nsec: 0 };
    const endTime = opts.endTime ?? { sec: Number.MAX_VALUE, nsec: Number.MAX_VALUE };
    const topics = opts.topics ?? [...connections.values()].map((connection) => connection.topic);
    const filteredConnections = [...connections.values()].filter((connection) => {
      return topics.includes(connection.topic);
    }).map((connection) => connection.conn);
    const { decompress = {} } = opts;
    const chunkInfos = this.chunkInfos.filter((info) => {
      return dist$2.compare(info.startTime, endTime) <= 0 && dist$2.compare(startTime, info.endTime) <= 0;
    });
    function parseMsg(msg, chunkOffset) {
      const connection = connections.get(msg.conn);
      if (connection == null) {
        throw new Error(`Unable to find connection with id ${msg.conn}`);
      }
      const { topic } = connection;
      const { data, time: timestamp } = msg;
      if (data == null) {
        throw new Error(`No data in message for topic: ${topic}`);
      }
      let message = null;
      if (opts.noParse !== true) {
        connection.reader = connection.reader ?? new MessageReader(dist$1.exports.parse(connection.messageDefinition), {
          freeze: opts.freeze
        });
        message = connection.reader.readMessage(data);
      }
      return new ReadResult(topic, message, timestamp, data, chunkOffset, chunkInfos.length, opts.freeze);
    }
    for (let i = 0; i < chunkInfos.length; i++) {
      const info = chunkInfos[i];
      const messages = await this.reader.readChunkMessages(info, filteredConnections, startTime, endTime, decompress);
      messages.forEach((msg) => callback(parseMsg(msg, i)));
    }
  }
}
var BlobReader$2 = {};
Object.defineProperty(BlobReader$2, "__esModule", { value: true });
class BlobReader$1 {
  constructor(blob) {
    if (!(blob instanceof Blob)) {
      throw new Error("Expected file to be a File or Blob.");
    }
    this._blob = blob;
    this._size = blob.size;
  }
  async read(offset, length) {
    const arrBuf = await this._blob.slice(offset, offset + length).arrayBuffer();
    return new Uint8Array(arrBuf);
  }
  size() {
    return this._size;
  }
}
BlobReader$2.default = BlobReader$1;
const { default: BlobReader } = BlobReader$2;
var web = {
  BlobReader
};
var dist = { exports: {} };
(function(module) {
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
          Md52.ConvertToWordArray = function(string) {
            var lWordCount, lMessageLength = string.length, lNumberOfWords_temp1 = lMessageLength + 8, lNumberOfWords_temp2 = (lNumberOfWords_temp1 - lNumberOfWords_temp1 % 64) / 64, lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16, lWordArray = Array(lNumberOfWords - 1), lBytePosition = 0, lByteCount = 0;
            while (lByteCount < lMessageLength) {
              lWordCount = (lByteCount - lByteCount % 4) / 4;
              lBytePosition = lByteCount % 4 * 8;
              lWordArray[lWordCount] = lWordArray[lWordCount] | string.charCodeAt(lByteCount) << lBytePosition;
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
          Md52.Utf8Encode = function(string) {
            var utftext = "", c;
            string = string.replace(/\r\n/g, "\n");
            for (var n = 0; n < string.length; n++) {
              c = string.charCodeAt(n);
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
          Md52.init = function(string) {
            var temp;
            if (typeof string !== "string")
              string = JSON.stringify(string);
            this._string = this.Utf8Encode(string);
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
      271: function(module2, exports) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        (function(root, factory) {
          {
            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          }
        })(this, function() {
          var hasOwnProperty = Object.prototype.hasOwnProperty;
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
          function objectToRules(object) {
            var keys = Object.getOwnPropertyNames(object);
            var result = [];
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var thing = object[key];
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
          function ruleOptions(type, obj) {
            if (!isObject2(obj)) {
              obj = { match: obj };
            }
            if (obj.include) {
              throw new Error("Matching rules cannot also include states");
            }
            var options = {
              defaultType: type,
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
              if (hasOwnProperty.call(obj, key)) {
                options[key] = obj[key];
              }
            }
            if (typeof options.type === "string" && type !== options.type) {
              throw new Error("Type transform cannot be a string (type '" + options.type + "' for token '" + type + "')");
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
            var keys = Object.getOwnPropertyNames(states);
            if (!start)
              start = keys[0];
            var ruleMap = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              ruleMap[key] = toRules(states[key]).concat(all);
            }
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              var rules = ruleMap[key];
              var included = /* @__PURE__ */ Object.create(null);
              for (var j = 0; j < rules.length; j++) {
                var rule = rules[j];
                if (!rule.include)
                  continue;
                var splice = [j, 1];
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
                    splice.push(newRule);
                  }
                }
                rules.splice.apply(rules, splice);
                j--;
              }
            }
            var map = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              map[key] = compileRules(ruleMap[key], true);
            }
            for (var i = 0; i < keys.length; i++) {
              var name = keys[i];
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
            var types = Object.getOwnPropertyNames(map);
            for (var i = 0; i < types.length; i++) {
              var tokenType = types[i];
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
          Lexer.prototype.formatError = function(token, message) {
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
            message += " at line " + token.line + " col " + token.col + ":\n\n";
            message += "  " + firstLine + "\n";
            message += "  " + Array(token.col).join(" ") + "^";
            return message;
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
      558: (module2, __unused_webpack_exports, __webpack_require__2) => {
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
                const type = d[0].value;
                if (PRIMITIVE_TYPES.includes(type))
                  return reject;
                return { type };
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
          if (typeof module2.exports !== "undefined") {
            module2.exports = grammar;
          } else {
            window.grammar = grammar;
          }
        })();
      },
      654: function(module2) {
        (function(root, factory) {
          if (module2.exports) {
            module2.exports = factory();
          } else {
            root.nearley = factory();
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
          function State(rule, dot, reference, wantedBy) {
            this.rule = rule;
            this.dot = dot;
            this.reference = reference;
            this.data = [];
            this.wantedBy = wantedBy;
            this.isComplete = this.dot === rule.symbols.length;
          }
          State.prototype.toString = function() {
            return "{" + this.rule.toString(this.dot) + "}, from: " + (this.reference || 0);
          };
          State.prototype.nextState = function(child) {
            var state = new State(this.rule, this.dot + 1, this.reference, this.wantedBy);
            state.left = this;
            state.right = child;
            if (state.isComplete) {
              state.data = state.build();
              state.right = void 0;
            }
            return state;
          };
          State.prototype.build = function() {
            var children = [];
            var node = this;
            do {
              children.push(node.right.data);
              node = node.left;
            } while (node.left);
            children.reverse();
            return children;
          };
          State.prototype.finish = function() {
            if (this.rule.postprocess) {
              this.data = this.rule.postprocess(this.data, this.reference, Parser.fail);
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
                if (state.data !== Parser.fail) {
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
              var s = new State(r, 0, this.index, wantedBy);
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
          StreamLexer.prototype.formatError = function(token, message) {
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
              message += " at line " + this.line + " col " + col + ":\n\n";
              message += lines.map(function(line, i) {
                return pad(this.line - lines.length + i + 1, lastLineDigits) + " " + line;
              }, this).join("\n");
              message += "\n" + pad("", lastLineDigits + col) + "^\n";
              return message;
            } else {
              return message + " at index " + (this.index - 1);
            }
            function pad(n, length) {
              var s = String(n);
              return Array(length - s.length + 1).join(" ") + s;
            }
          };
          function Parser(rules, start, options) {
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
          Parser.fail = {};
          Parser.prototype.feed = function(chunk) {
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
          Parser.prototype.reportLexerError = function(lexerError) {
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
          Parser.prototype.reportError = function(token) {
            var tokenDisplay = (token.type ? token.type + " token: " : "") + JSON.stringify(token.value !== void 0 ? token.value : token);
            var lexerMessage = this.lexer.formatError(token, "Syntax error");
            return this.reportErrorCommon(lexerMessage, tokenDisplay);
          };
          Parser.prototype.reportErrorCommon = function(lexerMessage, tokenDisplay) {
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
          Parser.prototype.displayStateStack = function(stateStack, lines) {
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
          Parser.prototype.getSymbolDisplay = function(symbol) {
            return getSymbolLongDisplay(symbol);
          };
          Parser.prototype.buildFirstStateStack = function(state, visited) {
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
          Parser.prototype.save = function() {
            var column = this.table[this.current];
            column.lexerState = this.lexerState;
            return column;
          };
          Parser.prototype.restore = function(column) {
            var index = column.index;
            this.current = index;
            this.table[index] = column;
            this.table.splice(index + 1);
            this.lexerState = column.lexerState;
            this.results = this.finish();
          };
          Parser.prototype.rewind = function(index) {
            if (!this.options.keepHistory) {
              throw new Error("set option `keepHistory` to enable rewinding");
            }
            this.restore(this.table[index]);
          };
          Parser.prototype.finish = function() {
            var considerations = [];
            var start = this.grammar.start;
            var column = this.table[this.table.length - 1];
            column.states.forEach(function(t) {
              if (t.rule.name === start && t.dot === t.rule.symbols.length && t.reference === 0 && t.data !== Parser.fail) {
                considerations.push(t);
              }
            });
            return considerations.map(function(c) {
              return c.data;
            });
          };
          function getSymbolLongDisplay(symbol) {
            var type = typeof symbol;
            if (type === "string") {
              return symbol;
            } else if (type === "object") {
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
            var type = typeof symbol;
            if (type === "string") {
              return symbol;
            } else if (type === "object") {
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
            Parser,
            Grammar,
            Rule
          };
        });
      },
      515: (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.buildRos2Type = void 0;
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
        function parseArrayLiteral(type, rawStr) {
          if (!rawStr.startsWith("[") || !rawStr.endsWith("]")) {
            throw new Error("Array must start with [ and end with ]");
          }
          const str = rawStr.substring(1, rawStr.length - 1);
          if (type === "string" || type === "wstring") {
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
          return str.split(",").map((part) => parsePrimitiveLiteral(type, part.trim()));
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
        function parsePrimitiveLiteral(type, str) {
          switch (type) {
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
          throw new Error(`Invalid literal of type ${type}: ${str}`);
        }
        function normalizeType(type) {
          switch (type) {
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
          return type;
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
              const type = normalizeType(rawType);
              if (stringBound != void 0 && type !== "string" && type !== "wstring") {
                throw new Error(`Invalid string bound for type ${type}`);
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
              const isComplex = !BUILTIN_TYPES.includes(type);
              const isArray = unboundedArray != void 0 || arrayLength != void 0 || arrayBound != void 0;
              definitions.push({
                name,
                type,
                isComplex: constantValue != void 0 ? isComplex || void 0 : isComplex,
                isConstant: constantValue != void 0 || void 0,
                isArray: constantValue != void 0 ? isArray || void 0 : isArray,
                arrayLength: arrayLength != void 0 ? parseInt(arrayLength) : void 0,
                arrayUpperBound: arrayBound != void 0 ? parseInt(arrayBound) : void 0,
                upperBound: stringBound != void 0 ? parseInt(stringBound) : void 0,
                defaultValue: defaultValue != void 0 ? isArray ? parseArrayLiteral(type, defaultValue.trim()) : parsePrimitiveLiteral(type, defaultValue.trim()) : void 0,
                value: constantValue != void 0 ? parsePrimitiveLiteral(type, constantValue.trim()) : void 0,
                valueText: constantValue?.trim()
              });
            } else {
              throw new Error(`Could not parse line: '${line}'`);
            }
          }
          return { name: complexTypeName, definitions };
        }
        exports.buildRos2Type = buildRos2Type;
      },
      715: function(__unused_webpack_module, exports, __webpack_require__2) {
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
        var __exportStar = this && this.__exportStar || function(m, exports2) {
          for (var p in m)
            if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
              __createBinding(exports2, m, p);
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        __exportStar(__webpack_require__2(322), exports);
        __exportStar(__webpack_require__2(867), exports);
        __exportStar(__webpack_require__2(210), exports);
      },
      322: (__unused_webpack_module, exports, __webpack_require__2) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.md5 = void 0;
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
        exports.md5 = md5;
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
      867: function(__unused_webpack_module, exports, __webpack_require__2) {
        var __importDefault = this && this.__importDefault || function(mod) {
          return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.normalizeType = exports.fixupTypes = exports.parse = void 0;
        const nearley_1 = __webpack_require__2(654);
        const buildRos2Type_1 = __webpack_require__2(515);
        const ros1_ne_1 = __importDefault(__webpack_require__2(558));
        const ROS1_GRAMMAR = nearley_1.Grammar.fromCompiled(ros1_ne_1.default);
        function parse(messageDefinition, options = {}) {
          const allLines = messageDefinition.split("\n").map((line) => line.trim()).filter((line) => line);
          let definitionLines = [];
          const types = [];
          allLines.forEach((line) => {
            if (line.startsWith("#")) {
              return;
            }
            if (line.startsWith("==")) {
              types.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
              definitionLines = [];
            } else {
              definitionLines.push({ line });
            }
          });
          types.push(options.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
          if (options.skipTypeFixup !== true) {
            fixupTypes(types);
          }
          return types;
        }
        exports.parse = parse;
        function fixupTypes(types) {
          types.forEach(({ definitions, name }) => {
            definitions.forEach((definition) => {
              if (definition.isComplex === true) {
                const typeNamespace = name?.split("/").slice(0, -1).join("/");
                const foundName = findTypeByName2(types, definition.type, typeNamespace).name;
                if (foundName == void 0) {
                  throw new Error(`Missing type definition for ${definition.type}`);
                }
                definition.type = foundName;
              }
            });
          });
        }
        exports.fixupTypes = fixupTypes;
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
        function findTypeByName2(types, name, typeNamespace) {
          const matches = types.filter((type) => {
            const typeName = type.name ?? "";
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
        function normalizeType(type) {
          if (type === "char") {
            return "uint8";
          } else if (type === "byte") {
            return "int8";
          }
          return type;
        }
        exports.normalizeType = normalizeType;
      },
      210: (__unused_webpack_module, exports) => {
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.stringify = void 0;
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
        exports.stringify = stringify;
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
      var module2 = __webpack_module_cache__[moduleId] = {
        exports: {}
      };
      __webpack_modules__[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
      return module2.exports;
    }
    (() => {
      __webpack_require__.d = (exports, definition) => {
        for (var key in definition) {
          if (__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
            Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
          }
        }
      };
    })();
    (() => {
      __webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    })();
    (() => {
      __webpack_require__.r = (exports) => {
        if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
          Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
        }
        Object.defineProperty(exports, "__esModule", { value: true });
      };
    })();
    var __webpack_exports__ = __webpack_require__(715);
    module.exports = __webpack_exports__;
  })();
})(dist);
const log = console;
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
  log.error(`Can't estimate size of type '${typeof obj}'`);
  return SMALL_INTEGER_SIZE;
}
function getBagChunksOverlapCount(chunkInfos) {
  const sorted = chunkInfos.slice().sort((left, right) => dist$2.compare(left.startTime, right.startTime));
  let maxEndTime = { sec: -Infinity, nsec: 0 };
  let overlaps = 0;
  sorted.forEach(({ startTime, endTime }) => {
    if (dist$2.isLessThan(startTime, maxEndTime)) {
      overlaps += 1;
    }
    if (dist$2.isGreaterThan(endTime, maxEndTime)) {
      maxEndTime = endTime;
    }
  });
  return overlaps;
}
async function _loadDecompressHandlers() {
  const [decompressZstd, decompressLZ4, bzip2] = await Promise.all([
    import("./index.js").then(async (mod) => {
      await mod.default.isLoaded;
      return mod.default.decompress;
    }),
    import("./index2.js").then(async (mod) => {
      await mod.default.isLoaded;
      return mod.default.decompress;
    }),
    import("./index3.js").then(async (mod) => {
      await mod.default.init();
      return mod.default;
    })
  ]);
  return {
    lz4: (buffer, decompressedSize) => decompressLZ4(buffer, Number(decompressedSize)),
    bz2: (buffer, decompressedSize) => bzip2.decompress(buffer, Number(decompressedSize), { small: false }),
    zstd: (buffer, decompressedSize) => decompressZstd(buffer, Number(decompressedSize))
  };
}
class BagIterableSource {
  constructor(source) {
    __privateAdd(this, _messageIterator);
    __privateAdd(this, _source, void 0);
    __privateAdd(this, _bag, void 0);
    __privateAdd(this, _readersByConnectionId, /* @__PURE__ */ new Map());
    __privateAdd(this, _datatypesByConnectionId, /* @__PURE__ */ new Map());
    __privateAdd(this, _messageSizeEstimateByTopic, {});
    __privateSet(this, _source, source);
  }
  async initialize() {
    let fileLike;
    fileLike = new web.BlobReader(__privateGet(this, _source).file);
    let decompress = await _loadDecompressHandlers();
    __privateSet(this, _bag, new Bag(fileLike, {
      parse: false,
      decompress
    }));
    await __privateGet(this, _bag).open();
    const problems = [];
    const chunksOverlapCount = getBagChunksOverlapCount(__privateGet(this, _bag).chunkInfos);
    if (chunksOverlapCount > __privateGet(this, _bag).chunkInfos.length * 0.25) {
      const message = `This bag has many overlapping chunks (${chunksOverlapCount} out of ${__privateGet(this, _bag).chunkInfos.length}). This results in more memory use during playback.`;
      const tip = "Re-sort the messages in your bag by receive time.";
      problems.push({
        severity: "warn",
        message,
        tip
      });
    }
    const numMessagesByConnectionIndex = new Array(__privateGet(this, _bag).connections.size).fill(0);
    __privateGet(this, _bag).chunkInfos.forEach((info) => {
      info.connections.forEach(({ conn, count }) => {
        numMessagesByConnectionIndex[conn] += count;
      });
    });
    const datatypes = /* @__PURE__ */ new Map();
    const topics = /* @__PURE__ */ new Map();
    const topicStats = /* @__PURE__ */ new Map();
    const publishersByTopic = /* @__PURE__ */ new Map();
    for (const [id, connection] of __privateGet(this, _bag).connections) {
      const schemaName = connection.type;
      if (!schemaName) {
        continue;
      }
      let publishers = publishersByTopic.get(connection.topic);
      if (!publishers) {
        publishers = /* @__PURE__ */ new Set();
        publishersByTopic.set(connection.topic, publishers);
      }
      publishers.add(connection.callerid ?? String(connection.conn));
      const existingTopic = topics.get(connection.topic);
      if (existingTopic && existingTopic.schemaName !== schemaName) {
        problems.push({
          severity: "warn",
          message: `Conflicting datatypes on topic (${connection.topic}): ${schemaName}, ${existingTopic.schemaName}`,
          tip: `Studio requires all connections on a topic to have the same datatype. Make sure all your nodes are publishing the same message on ${connection.topic}.`
        });
      }
      if (!existingTopic) {
        topics.set(connection.topic, { name: connection.topic, schemaName });
      }
      const numMessages = (topicStats.get(connection.topic)?.numMessages ?? 0) + (numMessagesByConnectionIndex[connection.conn] ?? 0);
      topicStats.set(connection.topic, { numMessages });
      const parsedDefinition = dist.exports.parse(connection.messageDefinition);
      const reader = new MessageReader(parsedDefinition);
      __privateGet(this, _readersByConnectionId).set(id, reader);
      for (const definition of parsedDefinition) {
        if (!definition.name) {
          datatypes.set(schemaName, definition);
        } else {
          datatypes.set(definition.name, definition);
        }
      }
      __privateGet(this, _datatypesByConnectionId).set(id, schemaName);
    }
    return {
      topics: Array.from(topics.values()),
      topicStats,
      start: __privateGet(this, _bag).startTime ?? { sec: 0, nsec: 0 },
      end: __privateGet(this, _bag).endTime ?? { sec: 0, nsec: 0 },
      problems,
      profile: "ros1",
      datatypes,
      publishersByTopic
    };
  }
  async *messageIterator(opt) {
    yield* __privateMethod(this, _messageIterator, messageIterator_fn).call(this, { ...opt, reverse: false });
  }
  async getBackfillMessages({
    topics,
    time
  }) {
    const messages = [];
    for (const entry of topics.entries()) {
      for await (const result of __privateMethod(this, _messageIterator, messageIterator_fn).call(this, {
        topics: new Map([entry]),
        start: time,
        reverse: true
      })) {
        if (result.type === "message-event") {
          messages.push(result.msgEvent);
        }
        break;
      }
    }
    messages.sort((a, b) => dist$2.compare(a.receiveTime, b.receiveTime));
    return messages;
  }
}
_source = new WeakMap();
_bag = new WeakMap();
_readersByConnectionId = new WeakMap();
_datatypesByConnectionId = new WeakMap();
_messageSizeEstimateByTopic = new WeakMap();
_messageIterator = new WeakSet();
messageIterator_fn = async function* (opt) {
  if (!__privateGet(this, _bag)) {
    throw new Error("Invariant: uninitialized");
  }
  const end = opt.end;
  const iterator = __privateGet(this, _bag).messageIterator({
    topics: Array.from(opt.topics.keys()),
    reverse: opt.reverse,
    start: opt.start
  });
  const readersByConnectionId = __privateGet(this, _readersByConnectionId);
  for await (const bagMsgEvent of iterator) {
    const connectionId = bagMsgEvent.connectionId;
    const reader = readersByConnectionId.get(connectionId);
    if (end && dist$2.compare(bagMsgEvent.timestamp, end) > 0) {
      return;
    }
    const schemaName = __privateGet(this, _datatypesByConnectionId).get(connectionId);
    if (!schemaName) {
      yield {
        type: "problem",
        connectionId,
        problem: {
          severity: "error",
          message: `Cannot missing datatype for connection id ${connectionId}`,
          tip: `Check that your bag file is well-formed. It should have a connection record for every connection id referenced from a message record.`
        }
      };
      return;
    }
    if (reader) {
      const dataCopy = bagMsgEvent.data.slice();
      const parsedMessage = reader.readMessage(dataCopy);
      let msgSizeEstimate = __privateGet(this, _messageSizeEstimateByTopic)[bagMsgEvent.topic];
      if (msgSizeEstimate == void 0) {
        msgSizeEstimate = estimateObjectSize(parsedMessage);
        __privateGet(this, _messageSizeEstimateByTopic)[bagMsgEvent.topic] = msgSizeEstimate;
      }
      yield {
        type: "message-event",
        msgEvent: {
          topic: bagMsgEvent.topic,
          receiveTime: bagMsgEvent.timestamp,
          sizeInBytes: Math.max(bagMsgEvent.data.byteLength, msgSizeEstimate),
          message: parsedMessage,
          schemaName
        }
      };
    } else {
      yield {
        type: "problem",
        connectionId,
        problem: {
          severity: "error",
          message: `Cannot deserialize message for missing connection id ${connectionId}`,
          tip: `Check that your bag file is well-formed. It should have a connection record for every connection id referenced from a message record.`
        }
      };
    }
  }
};
function initialize(args) {
  if (args.file) {
    const source = new BagIterableSource({ type: "file", file: args.file });
    const wrapped = new WorkerIterableSourceWorker(source);
    return proxy(wrapped);
  }
  throw new Error("file required");
}
const service = {
  initialize
};
expose(service);
