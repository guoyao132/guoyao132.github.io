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
var _iter, _lastIteratorResult, _abort, _options, _ulog, _start, _end;
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
var dist$1 = {};
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
})(dist$1);
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
        cutoffTime = dist$1.add(firstResult.stamp, { sec: 0, nsec: durationMs * 1e6 });
        break;
      case "message-event":
        cutoffTime = dist$1.add(firstResult.msgEvent.receiveTime, { sec: 0, nsec: durationMs * 1e6 });
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
      if (result.type === "stamp" && dist$1.compare(result.stamp, cutoffTime) > 0) {
        break;
      }
      if (result.type === "message-event" && dist$1.compare(result.msgEvent.receiveTime, cutoffTime) > 0) {
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
    if (__privateGet(this, _lastIteratorResult)?.type === "stamp" && dist$1.compare(__privateGet(this, _lastIteratorResult).stamp, end) >= 0) {
      return results;
    }
    if (__privateGet(this, _lastIteratorResult)?.type === "message-event" && dist$1.compare(__privateGet(this, _lastIteratorResult).msgEvent.receiveTime, end) > 0) {
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
      if (value.type === "stamp" && dist$1.compare(value.stamp, end) >= 0) {
        __privateSet(this, _lastIteratorResult, value);
        break;
      }
      if (value.type === "message-event" && dist$1.compare(value.msgEvent.receiveTime, end) > 0) {
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
const ros1Definitions = {
  "actionlib_msgs/GoalStatusArray": {
    name: "actionlib_msgs/GoalStatusArray",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "actionlib_msgs/GoalStatus", isArray: true, name: "status_list", isComplex: true }
    ]
  },
  "std_msgs/Header": {
    name: "std_msgs/Header",
    definitions: [
      { type: "uint32", isArray: false, name: "seq", isComplex: false },
      { type: "time", isArray: false, name: "stamp", isComplex: false },
      { type: "string", isArray: false, name: "frame_id", isComplex: false }
    ]
  },
  "actionlib_msgs/GoalStatus": {
    name: "actionlib_msgs/GoalStatus",
    definitions: [
      { type: "actionlib_msgs/GoalID", isArray: false, name: "goal_id", isComplex: true },
      { type: "uint8", isArray: false, name: "status", isComplex: false },
      { type: "uint8", name: "PENDING", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "ACTIVE", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "PREEMPTED", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "SUCCEEDED", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "ABORTED", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", name: "REJECTED", isConstant: true, value: 5, valueText: "5" },
      { type: "uint8", name: "PREEMPTING", isConstant: true, value: 6, valueText: "6" },
      { type: "uint8", name: "RECALLING", isConstant: true, value: 7, valueText: "7" },
      { type: "uint8", name: "RECALLED", isConstant: true, value: 8, valueText: "8" },
      { type: "uint8", name: "LOST", isConstant: true, value: 9, valueText: "9" },
      { type: "string", isArray: false, name: "text", isComplex: false }
    ]
  },
  "actionlib_msgs/GoalID": {
    name: "actionlib_msgs/GoalID",
    definitions: [
      { type: "time", isArray: false, name: "stamp", isComplex: false },
      { type: "string", isArray: false, name: "id", isComplex: false }
    ]
  },
  "diagnostic_msgs/DiagnosticArray": {
    name: "diagnostic_msgs/DiagnosticArray",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "diagnostic_msgs/DiagnosticStatus", isArray: true, name: "status", isComplex: true }
    ]
  },
  "diagnostic_msgs/DiagnosticStatus": {
    name: "diagnostic_msgs/DiagnosticStatus",
    definitions: [
      { type: "int8", name: "OK", isConstant: true, value: 0, valueText: "0" },
      { type: "int8", name: "WARN", isConstant: true, value: 1, valueText: "1" },
      { type: "int8", name: "ERROR", isConstant: true, value: 2, valueText: "2" },
      { type: "int8", name: "STALE", isConstant: true, value: 3, valueText: "3" },
      { type: "int8", isArray: false, name: "level", isComplex: false },
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "string", isArray: false, name: "message", isComplex: false },
      { type: "string", isArray: false, name: "hardware_id", isComplex: false },
      { type: "diagnostic_msgs/KeyValue", isArray: true, name: "values", isComplex: true }
    ]
  },
  "diagnostic_msgs/KeyValue": {
    name: "diagnostic_msgs/KeyValue",
    definitions: [
      { type: "string", isArray: false, name: "key", isComplex: false },
      { type: "string", isArray: false, name: "value", isComplex: false }
    ]
  },
  "geometry_msgs/AccelStamped": {
    name: "geometry_msgs/AccelStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Accel", isArray: false, name: "accel", isComplex: true }
    ]
  },
  "geometry_msgs/Accel": {
    name: "geometry_msgs/Accel",
    definitions: [
      { type: "geometry_msgs/Vector3", isArray: false, name: "linear", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "angular", isComplex: true }
    ]
  },
  "geometry_msgs/Vector3": {
    name: "geometry_msgs/Vector3",
    definitions: [
      { type: "float64", isArray: false, name: "x", isComplex: false },
      { type: "float64", isArray: false, name: "y", isComplex: false },
      { type: "float64", isArray: false, name: "z", isComplex: false }
    ]
  },
  "geometry_msgs/AccelWithCovarianceStamped": {
    name: "geometry_msgs/AccelWithCovarianceStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/AccelWithCovariance", isArray: false, name: "accel", isComplex: true }
    ]
  },
  "geometry_msgs/AccelWithCovariance": {
    name: "geometry_msgs/AccelWithCovariance",
    definitions: [
      { type: "geometry_msgs/Accel", isArray: false, name: "accel", isComplex: true },
      { type: "float64", isArray: true, arrayLength: 36, name: "covariance", isComplex: false }
    ]
  },
  "geometry_msgs/InertiaStamped": {
    name: "geometry_msgs/InertiaStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Inertia", isArray: false, name: "inertia", isComplex: true }
    ]
  },
  "geometry_msgs/Inertia": {
    name: "geometry_msgs/Inertia",
    definitions: [
      { type: "float64", isArray: false, name: "m", isComplex: false },
      { type: "geometry_msgs/Vector3", isArray: false, name: "com", isComplex: true },
      { type: "float64", isArray: false, name: "ixx", isComplex: false },
      { type: "float64", isArray: false, name: "ixy", isComplex: false },
      { type: "float64", isArray: false, name: "ixz", isComplex: false },
      { type: "float64", isArray: false, name: "iyy", isComplex: false },
      { type: "float64", isArray: false, name: "iyz", isComplex: false },
      { type: "float64", isArray: false, name: "izz", isComplex: false }
    ]
  },
  "geometry_msgs/Point32": {
    name: "geometry_msgs/Point32",
    definitions: [
      { type: "float32", isArray: false, name: "x", isComplex: false },
      { type: "float32", isArray: false, name: "y", isComplex: false },
      { type: "float32", isArray: false, name: "z", isComplex: false }
    ]
  },
  "geometry_msgs/PointStamped": {
    name: "geometry_msgs/PointStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Point", isArray: false, name: "point", isComplex: true }
    ]
  },
  "geometry_msgs/Point": {
    name: "geometry_msgs/Point",
    definitions: [
      { type: "float64", isArray: false, name: "x", isComplex: false },
      { type: "float64", isArray: false, name: "y", isComplex: false },
      { type: "float64", isArray: false, name: "z", isComplex: false }
    ]
  },
  "geometry_msgs/PolygonStamped": {
    name: "geometry_msgs/PolygonStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Polygon", isArray: false, name: "polygon", isComplex: true }
    ]
  },
  "geometry_msgs/Polygon": {
    name: "geometry_msgs/Polygon",
    definitions: [
      { type: "geometry_msgs/Point32", isArray: true, name: "points", isComplex: true }
    ]
  },
  "geometry_msgs/PoseArray": {
    name: "geometry_msgs/PoseArray",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Pose", isArray: true, name: "poses", isComplex: true }
    ]
  },
  "geometry_msgs/Pose": {
    name: "geometry_msgs/Pose",
    definitions: [
      { type: "geometry_msgs/Point", isArray: false, name: "position", isComplex: true },
      { type: "geometry_msgs/Quaternion", isArray: false, name: "orientation", isComplex: true }
    ]
  },
  "geometry_msgs/Quaternion": {
    name: "geometry_msgs/Quaternion",
    definitions: [
      { type: "float64", isArray: false, name: "x", isComplex: false },
      { type: "float64", isArray: false, name: "y", isComplex: false },
      { type: "float64", isArray: false, name: "z", isComplex: false },
      { type: "float64", isArray: false, name: "w", isComplex: false }
    ]
  },
  "geometry_msgs/PoseStamped": {
    name: "geometry_msgs/PoseStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Pose", isArray: false, name: "pose", isComplex: true }
    ]
  },
  "geometry_msgs/PoseWithCovarianceStamped": {
    name: "geometry_msgs/PoseWithCovarianceStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/PoseWithCovariance", isArray: false, name: "pose", isComplex: true }
    ]
  },
  "geometry_msgs/PoseWithCovariance": {
    name: "geometry_msgs/PoseWithCovariance",
    definitions: [
      { type: "geometry_msgs/Pose", isArray: false, name: "pose", isComplex: true },
      { type: "float64", isArray: true, arrayLength: 36, name: "covariance", isComplex: false }
    ]
  },
  "geometry_msgs/QuaternionStamped": {
    name: "geometry_msgs/QuaternionStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Quaternion", isArray: false, name: "quaternion", isComplex: true }
    ]
  },
  "geometry_msgs/TransformStamped": {
    name: "geometry_msgs/TransformStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: false, name: "child_frame_id", isComplex: false },
      { type: "geometry_msgs/Transform", isArray: false, name: "transform", isComplex: true }
    ]
  },
  "geometry_msgs/Transform": {
    name: "geometry_msgs/Transform",
    definitions: [
      { type: "geometry_msgs/Vector3", isArray: false, name: "translation", isComplex: true },
      { type: "geometry_msgs/Quaternion", isArray: false, name: "rotation", isComplex: true }
    ]
  },
  "geometry_msgs/TwistStamped": {
    name: "geometry_msgs/TwistStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Twist", isArray: false, name: "twist", isComplex: true }
    ]
  },
  "geometry_msgs/Twist": {
    name: "geometry_msgs/Twist",
    definitions: [
      { type: "geometry_msgs/Vector3", isArray: false, name: "linear", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "angular", isComplex: true }
    ]
  },
  "geometry_msgs/TwistWithCovarianceStamped": {
    name: "geometry_msgs/TwistWithCovarianceStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/TwistWithCovariance", isArray: false, name: "twist", isComplex: true }
    ]
  },
  "geometry_msgs/TwistWithCovariance": {
    name: "geometry_msgs/TwistWithCovariance",
    definitions: [
      { type: "geometry_msgs/Twist", isArray: false, name: "twist", isComplex: true },
      { type: "float64", isArray: true, arrayLength: 36, name: "covariance", isComplex: false }
    ]
  },
  "geometry_msgs/Vector3Stamped": {
    name: "geometry_msgs/Vector3Stamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "vector", isComplex: true }
    ]
  },
  "geometry_msgs/WrenchStamped": {
    name: "geometry_msgs/WrenchStamped",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Wrench", isArray: false, name: "wrench", isComplex: true }
    ]
  },
  "geometry_msgs/Wrench": {
    name: "geometry_msgs/Wrench",
    definitions: [
      { type: "geometry_msgs/Vector3", isArray: false, name: "force", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "torque", isComplex: true }
    ]
  },
  "nav_msgs/OccupancyGrid": {
    name: "nav_msgs/OccupancyGrid",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "nav_msgs/MapMetaData", isArray: false, name: "info", isComplex: true },
      { type: "int8", isArray: true, name: "data", isComplex: false }
    ]
  },
  "nav_msgs/MapMetaData": {
    name: "nav_msgs/MapMetaData",
    definitions: [
      { type: "time", isArray: false, name: "map_load_time", isComplex: false },
      { type: "float32", isArray: false, name: "resolution", isComplex: false },
      { type: "uint32", isArray: false, name: "width", isComplex: false },
      { type: "uint32", isArray: false, name: "height", isComplex: false },
      { type: "geometry_msgs/Pose", isArray: false, name: "origin", isComplex: true }
    ]
  },
  "nav_msgs/Odometry": {
    name: "nav_msgs/Odometry",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: false, name: "child_frame_id", isComplex: false },
      { type: "geometry_msgs/PoseWithCovariance", isArray: false, name: "pose", isComplex: true },
      { type: "geometry_msgs/TwistWithCovariance", isArray: false, name: "twist", isComplex: true }
    ]
  },
  "nav_msgs/Path": {
    name: "nav_msgs/Path",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/PoseStamped", isArray: true, name: "poses", isComplex: true }
    ]
  },
  "rcl_interfaces/Log": {
    name: "rcl_interfaces/Log",
    definitions: [
      { type: "int8", name: "DEBUG", isConstant: true, value: 10, valueText: "10" },
      { type: "int8", name: "INFO", isConstant: true, value: 20, valueText: "20" },
      { type: "int8", name: "WARN", isConstant: true, value: 30, valueText: "30" },
      { type: "int8", name: "ERROR", isConstant: true, value: 40, valueText: "40" },
      { type: "int8", name: "FATAL", isConstant: true, value: 50, valueText: "50" },
      { type: "time", isArray: false, name: "stamp", isComplex: false },
      { type: "uint8", isArray: false, name: "level", isComplex: false },
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "string", isArray: false, name: "msg", isComplex: false },
      { type: "string", isArray: false, name: "file", isComplex: false },
      { type: "string", isArray: false, name: "function", isComplex: false },
      { type: "uint32", isArray: false, name: "line", isComplex: false }
    ]
  },
  "rosgraph_msgs/Clock": {
    name: "rosgraph_msgs/Clock",
    definitions: [{ type: "time", isArray: false, name: "clock", isComplex: false }]
  },
  "rosgraph_msgs/Log": {
    name: "rosgraph_msgs/Log",
    definitions: [
      { type: "int8", name: "DEBUG", isConstant: true, value: 1, valueText: "1" },
      { type: "int8", name: "INFO", isConstant: true, value: 2, valueText: "2" },
      { type: "int8", name: "WARN", isConstant: true, value: 4, valueText: "4" },
      { type: "int8", name: "ERROR", isConstant: true, value: 8, valueText: "8" },
      { type: "int8", name: "FATAL", isConstant: true, value: 16, valueText: "16" },
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "int8", isArray: false, name: "level", isComplex: false },
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "string", isArray: false, name: "msg", isComplex: false },
      { type: "string", isArray: false, name: "file", isComplex: false },
      { type: "string", isArray: false, name: "function", isComplex: false },
      { type: "uint32", isArray: false, name: "line", isComplex: false },
      { type: "string", isArray: true, name: "topics", isComplex: false }
    ]
  },
  "rosgraph_msgs/TopicStatistics": {
    name: "rosgraph_msgs/TopicStatistics",
    definitions: [
      { type: "string", isArray: false, name: "topic", isComplex: false },
      { type: "string", isArray: false, name: "node_pub", isComplex: false },
      { type: "string", isArray: false, name: "node_sub", isComplex: false },
      { type: "time", isArray: false, name: "window_start", isComplex: false },
      { type: "time", isArray: false, name: "window_stop", isComplex: false },
      { type: "int32", isArray: false, name: "delivered_msgs", isComplex: false },
      { type: "int32", isArray: false, name: "dropped_msgs", isComplex: false },
      { type: "int32", isArray: false, name: "traffic", isComplex: false },
      { type: "duration", isArray: false, name: "period_mean", isComplex: false },
      { type: "duration", isArray: false, name: "period_stddev", isComplex: false },
      { type: "duration", isArray: false, name: "period_max", isComplex: false },
      { type: "duration", isArray: false, name: "stamp_age_mean", isComplex: false },
      { type: "duration", isArray: false, name: "stamp_age_stddev", isComplex: false },
      { type: "duration", isArray: false, name: "stamp_age_max", isComplex: false }
    ]
  },
  "sensor_msgs/BatteryState": {
    name: "sensor_msgs/BatteryState",
    definitions: [
      {
        type: "uint8",
        name: "POWER_SUPPLY_STATUS_UNKNOWN",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_STATUS_CHARGING",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_STATUS_DISCHARGING",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_STATUS_NOT_CHARGING",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_STATUS_FULL",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_UNKNOWN",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_GOOD",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_OVERHEAT",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_DEAD",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_OVERVOLTAGE",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_UNSPEC_FAILURE",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_COLD",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_WATCHDOG_TIMER_EXPIRE",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_HEALTH_SAFETY_TIMER_EXPIRE",
        isConstant: true,
        value: 8,
        valueText: "8"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_UNKNOWN",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_NIMH",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_LION",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_LIPO",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_LIFE",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_NICD",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        type: "uint8",
        name: "POWER_SUPPLY_TECHNOLOGY_LIMN",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float32", isArray: false, name: "voltage", isComplex: false },
      { type: "float32", isArray: false, name: "temperature", isComplex: false },
      { type: "float32", isArray: false, name: "current", isComplex: false },
      { type: "float32", isArray: false, name: "charge", isComplex: false },
      { type: "float32", isArray: false, name: "capacity", isComplex: false },
      { type: "float32", isArray: false, name: "design_capacity", isComplex: false },
      { type: "float32", isArray: false, name: "percentage", isComplex: false },
      { type: "uint8", isArray: false, name: "power_supply_status", isComplex: false },
      { type: "uint8", isArray: false, name: "power_supply_health", isComplex: false },
      { type: "uint8", isArray: false, name: "power_supply_technology", isComplex: false },
      { type: "bool", isArray: false, name: "present", isComplex: false },
      { type: "float32", isArray: true, name: "cell_voltage", isComplex: false },
      { type: "float32", isArray: true, name: "cell_temperature", isComplex: false },
      { type: "string", isArray: false, name: "location", isComplex: false },
      { type: "string", isArray: false, name: "serial_number", isComplex: false }
    ]
  },
  "sensor_msgs/CameraInfo": {
    name: "sensor_msgs/CameraInfo",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "uint32", isArray: false, name: "height", isComplex: false },
      { type: "uint32", isArray: false, name: "width", isComplex: false },
      { type: "string", isArray: false, name: "distortion_model", isComplex: false },
      { type: "float64", isArray: true, name: "D", isComplex: false },
      { type: "float64", isArray: true, arrayLength: 9, name: "K", isComplex: false },
      { type: "float64", isArray: true, arrayLength: 9, name: "R", isComplex: false },
      { type: "float64", isArray: true, arrayLength: 12, name: "P", isComplex: false },
      { type: "uint32", isArray: false, name: "binning_x", isComplex: false },
      { type: "uint32", isArray: false, name: "binning_y", isComplex: false },
      { type: "sensor_msgs/RegionOfInterest", isArray: false, name: "roi", isComplex: true }
    ]
  },
  "sensor_msgs/RegionOfInterest": {
    name: "sensor_msgs/RegionOfInterest",
    definitions: [
      { type: "uint32", isArray: false, name: "x_offset", isComplex: false },
      { type: "uint32", isArray: false, name: "y_offset", isComplex: false },
      { type: "uint32", isArray: false, name: "height", isComplex: false },
      { type: "uint32", isArray: false, name: "width", isComplex: false },
      { type: "bool", isArray: false, name: "do_rectify", isComplex: false }
    ]
  },
  "sensor_msgs/CompressedImage": {
    name: "sensor_msgs/CompressedImage",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: false, name: "format", isComplex: false },
      { type: "uint8", isArray: true, name: "data", isComplex: false }
    ]
  },
  "sensor_msgs/FluidPressure": {
    name: "sensor_msgs/FluidPressure",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float64", isArray: false, name: "fluid_pressure", isComplex: false },
      { type: "float64", isArray: false, name: "variance", isComplex: false }
    ]
  },
  "sensor_msgs/Illuminance": {
    name: "sensor_msgs/Illuminance",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float64", isArray: false, name: "illuminance", isComplex: false },
      { type: "float64", isArray: false, name: "variance", isComplex: false }
    ]
  },
  "sensor_msgs/Image": {
    name: "sensor_msgs/Image",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "uint32", isArray: false, name: "height", isComplex: false },
      { type: "uint32", isArray: false, name: "width", isComplex: false },
      { type: "string", isArray: false, name: "encoding", isComplex: false },
      { type: "uint8", isArray: false, name: "is_bigendian", isComplex: false },
      { type: "uint32", isArray: false, name: "step", isComplex: false },
      { type: "uint8", isArray: true, name: "data", isComplex: false }
    ]
  },
  "sensor_msgs/Imu": {
    name: "sensor_msgs/Imu",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Quaternion", isArray: false, name: "orientation", isComplex: true },
      {
        type: "float64",
        isArray: true,
        arrayLength: 9,
        name: "orientation_covariance",
        isComplex: false
      },
      { type: "geometry_msgs/Vector3", isArray: false, name: "angular_velocity", isComplex: true },
      {
        type: "float64",
        isArray: true,
        arrayLength: 9,
        name: "angular_velocity_covariance",
        isComplex: false
      },
      {
        type: "geometry_msgs/Vector3",
        isArray: false,
        name: "linear_acceleration",
        isComplex: true
      },
      {
        type: "float64",
        isArray: true,
        arrayLength: 9,
        name: "linear_acceleration_covariance",
        isComplex: false
      }
    ]
  },
  "sensor_msgs/JointState": {
    name: "sensor_msgs/JointState",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: true, name: "name", isComplex: false },
      { type: "float64", isArray: true, name: "position", isComplex: false },
      { type: "float64", isArray: true, name: "velocity", isComplex: false },
      { type: "float64", isArray: true, name: "effort", isComplex: false }
    ]
  },
  "sensor_msgs/Joy": {
    name: "sensor_msgs/Joy",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float32", isArray: true, name: "axes", isComplex: false },
      { type: "int32", isArray: true, name: "buttons", isComplex: false }
    ]
  },
  "sensor_msgs/JoyFeedbackArray": {
    name: "sensor_msgs/JoyFeedbackArray",
    definitions: [
      { type: "sensor_msgs/JoyFeedback", isArray: true, name: "array", isComplex: true }
    ]
  },
  "sensor_msgs/JoyFeedback": {
    name: "sensor_msgs/JoyFeedback",
    definitions: [
      { type: "uint8", name: "TYPE_LED", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "TYPE_RUMBLE", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "TYPE_BUZZER", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", isArray: false, name: "type", isComplex: false },
      { type: "uint8", isArray: false, name: "id", isComplex: false },
      { type: "float32", isArray: false, name: "intensity", isComplex: false }
    ]
  },
  "sensor_msgs/LaserScan": {
    name: "sensor_msgs/LaserScan",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float32", isArray: false, name: "angle_min", isComplex: false },
      { type: "float32", isArray: false, name: "angle_max", isComplex: false },
      { type: "float32", isArray: false, name: "angle_increment", isComplex: false },
      { type: "float32", isArray: false, name: "time_increment", isComplex: false },
      { type: "float32", isArray: false, name: "scan_time", isComplex: false },
      { type: "float32", isArray: false, name: "range_min", isComplex: false },
      { type: "float32", isArray: false, name: "range_max", isComplex: false },
      { type: "float32", isArray: true, name: "ranges", isComplex: false },
      { type: "float32", isArray: true, name: "intensities", isComplex: false }
    ]
  },
  "sensor_msgs/MagneticField": {
    name: "sensor_msgs/MagneticField",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "magnetic_field", isComplex: true },
      {
        type: "float64",
        isArray: true,
        arrayLength: 9,
        name: "magnetic_field_covariance",
        isComplex: false
      }
    ]
  },
  "sensor_msgs/MultiDOFJointState": {
    name: "sensor_msgs/MultiDOFJointState",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: true, name: "joint_names", isComplex: false },
      { type: "geometry_msgs/Transform", isArray: true, name: "transforms", isComplex: true },
      { type: "geometry_msgs/Twist", isArray: true, name: "twist", isComplex: true },
      { type: "geometry_msgs/Wrench", isArray: true, name: "wrench", isComplex: true }
    ]
  },
  "sensor_msgs/MultiEchoLaserScan": {
    name: "sensor_msgs/MultiEchoLaserScan",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float32", isArray: false, name: "angle_min", isComplex: false },
      { type: "float32", isArray: false, name: "angle_max", isComplex: false },
      { type: "float32", isArray: false, name: "angle_increment", isComplex: false },
      { type: "float32", isArray: false, name: "time_increment", isComplex: false },
      { type: "float32", isArray: false, name: "scan_time", isComplex: false },
      { type: "float32", isArray: false, name: "range_min", isComplex: false },
      { type: "float32", isArray: false, name: "range_max", isComplex: false },
      { type: "sensor_msgs/LaserEcho", isArray: true, name: "ranges", isComplex: true },
      { type: "sensor_msgs/LaserEcho", isArray: true, name: "intensities", isComplex: true }
    ]
  },
  "sensor_msgs/LaserEcho": {
    name: "sensor_msgs/LaserEcho",
    definitions: [{ type: "float32", isArray: true, name: "echoes", isComplex: false }]
  },
  "sensor_msgs/NavSatFix": {
    name: "sensor_msgs/NavSatFix",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "sensor_msgs/NavSatStatus", isArray: false, name: "status", isComplex: true },
      { type: "float64", isArray: false, name: "latitude", isComplex: false },
      { type: "float64", isArray: false, name: "longitude", isComplex: false },
      { type: "float64", isArray: false, name: "altitude", isComplex: false },
      {
        type: "float64",
        isArray: true,
        arrayLength: 9,
        name: "position_covariance",
        isComplex: false
      },
      {
        type: "uint8",
        name: "COVARIANCE_TYPE_UNKNOWN",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        type: "uint8",
        name: "COVARIANCE_TYPE_APPROXIMATED",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        type: "uint8",
        name: "COVARIANCE_TYPE_DIAGONAL_KNOWN",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      { type: "uint8", name: "COVARIANCE_TYPE_KNOWN", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", isArray: false, name: "position_covariance_type", isComplex: false }
    ]
  },
  "sensor_msgs/NavSatStatus": {
    name: "sensor_msgs/NavSatStatus",
    definitions: [
      { type: "int8", name: "STATUS_NO_FIX", isConstant: true, value: -1, valueText: "-1" },
      { type: "int8", name: "STATUS_FIX", isConstant: true, value: 0, valueText: "0" },
      { type: "int8", name: "STATUS_SBAS_FIX", isConstant: true, value: 1, valueText: "1" },
      { type: "int8", name: "STATUS_GBAS_FIX", isConstant: true, value: 2, valueText: "2" },
      { type: "int8", isArray: false, name: "status", isComplex: false },
      { type: "uint16", name: "SERVICE_GPS", isConstant: true, value: 1, valueText: "1" },
      { type: "uint16", name: "SERVICE_GLONASS", isConstant: true, value: 2, valueText: "2" },
      { type: "uint16", name: "SERVICE_COMPASS", isConstant: true, value: 4, valueText: "4" },
      { type: "uint16", name: "SERVICE_GALILEO", isConstant: true, value: 8, valueText: "8" },
      { type: "uint16", isArray: false, name: "service", isComplex: false }
    ]
  },
  "sensor_msgs/PointCloud2": {
    name: "sensor_msgs/PointCloud2",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "uint32", isArray: false, name: "height", isComplex: false },
      { type: "uint32", isArray: false, name: "width", isComplex: false },
      { type: "sensor_msgs/PointField", isArray: true, name: "fields", isComplex: true },
      { type: "bool", isArray: false, name: "is_bigendian", isComplex: false },
      { type: "uint32", isArray: false, name: "point_step", isComplex: false },
      { type: "uint32", isArray: false, name: "row_step", isComplex: false },
      { type: "uint8", isArray: true, name: "data", isComplex: false },
      { type: "bool", isArray: false, name: "is_dense", isComplex: false }
    ]
  },
  "sensor_msgs/PointField": {
    name: "sensor_msgs/PointField",
    definitions: [
      { type: "uint8", name: "INT8", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "UINT8", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "INT16", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "UINT16", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", name: "INT32", isConstant: true, value: 5, valueText: "5" },
      { type: "uint8", name: "UINT32", isConstant: true, value: 6, valueText: "6" },
      { type: "uint8", name: "FLOAT32", isConstant: true, value: 7, valueText: "7" },
      { type: "uint8", name: "FLOAT64", isConstant: true, value: 8, valueText: "8" },
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "uint32", isArray: false, name: "offset", isComplex: false },
      { type: "uint8", isArray: false, name: "datatype", isComplex: false },
      { type: "uint32", isArray: false, name: "count", isComplex: false }
    ]
  },
  "sensor_msgs/Range": {
    name: "sensor_msgs/Range",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "uint8", name: "ULTRASOUND", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "INFRARED", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", isArray: false, name: "radiation_type", isComplex: false },
      { type: "float32", isArray: false, name: "field_of_view", isComplex: false },
      { type: "float32", isArray: false, name: "min_range", isComplex: false },
      { type: "float32", isArray: false, name: "max_range", isComplex: false },
      { type: "float32", isArray: false, name: "range", isComplex: false }
    ]
  },
  "sensor_msgs/RelativeHumidity": {
    name: "sensor_msgs/RelativeHumidity",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float64", isArray: false, name: "relative_humidity", isComplex: false },
      { type: "float64", isArray: false, name: "variance", isComplex: false }
    ]
  },
  "sensor_msgs/Temperature": {
    name: "sensor_msgs/Temperature",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "float64", isArray: false, name: "temperature", isComplex: false },
      { type: "float64", isArray: false, name: "variance", isComplex: false }
    ]
  },
  "sensor_msgs/TimeReference": {
    name: "sensor_msgs/TimeReference",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "time", isArray: false, name: "time_ref", isComplex: false },
      { type: "string", isArray: false, name: "source", isComplex: false }
    ]
  },
  "shape_msgs/Mesh": {
    name: "shape_msgs/Mesh",
    definitions: [
      { type: "shape_msgs/MeshTriangle", isArray: true, name: "triangles", isComplex: true },
      { type: "geometry_msgs/Point", isArray: true, name: "vertices", isComplex: true }
    ]
  },
  "shape_msgs/MeshTriangle": {
    name: "shape_msgs/MeshTriangle",
    definitions: [
      { type: "uint32", isArray: true, arrayLength: 3, name: "vertex_indices", isComplex: false }
    ]
  },
  "shape_msgs/Plane": {
    name: "shape_msgs/Plane",
    definitions: [
      { type: "float64", isArray: true, arrayLength: 4, name: "coef", isComplex: false }
    ]
  },
  "shape_msgs/SolidPrimitive": {
    name: "shape_msgs/SolidPrimitive",
    definitions: [
      { type: "uint8", name: "BOX", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "SPHERE", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "CYLINDER", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "CONE", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", isArray: false, name: "type", isComplex: false },
      { type: "float64", isArray: true, name: "dimensions", isComplex: false },
      { type: "uint8", name: "BOX_X", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "BOX_Y", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "BOX_Z", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "SPHERE_RADIUS", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "CYLINDER_HEIGHT", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "CYLINDER_RADIUS", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "CONE_HEIGHT", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "CONE_RADIUS", isConstant: true, value: 1, valueText: "1" }
    ]
  },
  "std_msgs/Bool": {
    name: "std_msgs/Bool",
    definitions: [{ type: "bool", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Byte": {
    name: "std_msgs/Byte",
    definitions: [{ type: "int8", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/ByteMultiArray": {
    name: "std_msgs/ByteMultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "int8", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/MultiArrayLayout": {
    name: "std_msgs/MultiArrayLayout",
    definitions: [
      { type: "std_msgs/MultiArrayDimension", isArray: true, name: "dim", isComplex: true },
      { type: "uint32", isArray: false, name: "data_offset", isComplex: false }
    ]
  },
  "std_msgs/MultiArrayDimension": {
    name: "std_msgs/MultiArrayDimension",
    definitions: [
      { type: "string", isArray: false, name: "label", isComplex: false },
      { type: "uint32", isArray: false, name: "size", isComplex: false },
      { type: "uint32", isArray: false, name: "stride", isComplex: false }
    ]
  },
  "std_msgs/Char": {
    name: "std_msgs/Char",
    definitions: [{ type: "uint8", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/ColorRGBA": {
    name: "std_msgs/ColorRGBA",
    definitions: [
      { type: "float32", isArray: false, name: "r", isComplex: false },
      { type: "float32", isArray: false, name: "g", isComplex: false },
      { type: "float32", isArray: false, name: "b", isComplex: false },
      { type: "float32", isArray: false, name: "a", isComplex: false }
    ]
  },
  "std_msgs/Duration": {
    name: "std_msgs/Duration",
    definitions: [{ type: "duration", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Empty": { name: "std_msgs/Empty", definitions: [] },
  "std_msgs/Float32": {
    name: "std_msgs/Float32",
    definitions: [{ type: "float32", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Float32MultiArray": {
    name: "std_msgs/Float32MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "float32", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/Float64": {
    name: "std_msgs/Float64",
    definitions: [{ type: "float64", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Float64MultiArray": {
    name: "std_msgs/Float64MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "float64", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/Int16": {
    name: "std_msgs/Int16",
    definitions: [{ type: "int16", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Int16MultiArray": {
    name: "std_msgs/Int16MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "int16", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/Int32": {
    name: "std_msgs/Int32",
    definitions: [{ type: "int32", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Int32MultiArray": {
    name: "std_msgs/Int32MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "int32", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/Int64": {
    name: "std_msgs/Int64",
    definitions: [{ type: "int64", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Int64MultiArray": {
    name: "std_msgs/Int64MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "int64", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/Int8": {
    name: "std_msgs/Int8",
    definitions: [{ type: "int8", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Int8MultiArray": {
    name: "std_msgs/Int8MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "int8", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/String": {
    name: "std_msgs/String",
    definitions: [{ type: "string", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/Time": {
    name: "std_msgs/Time",
    definitions: [{ type: "time", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/UInt16": {
    name: "std_msgs/UInt16",
    definitions: [{ type: "uint16", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/UInt16MultiArray": {
    name: "std_msgs/UInt16MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "uint16", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/UInt32": {
    name: "std_msgs/UInt32",
    definitions: [{ type: "uint32", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/UInt32MultiArray": {
    name: "std_msgs/UInt32MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "uint32", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/UInt64": {
    name: "std_msgs/UInt64",
    definitions: [{ type: "uint64", isArray: false, name: "data", isComplex: false }]
  },
  "std_msgs/UInt64MultiArray": {
    name: "std_msgs/UInt64MultiArray",
    definitions: [
      { type: "std_msgs/MultiArrayLayout", isArray: false, name: "layout", isComplex: true },
      { type: "uint64", isArray: true, name: "data", isComplex: false }
    ]
  },
  "std_msgs/UInt8": {
    name: "std_msgs/UInt8",
    definitions: [{ type: "uint8", isArray: false, name: "data", isComplex: false }]
  },
  "stereo_msgs/DisparityImage": {
    name: "stereo_msgs/DisparityImage",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "sensor_msgs/Image", isArray: false, name: "image", isComplex: true },
      { type: "float32", isArray: false, name: "f", isComplex: false },
      { type: "float32", isArray: false, name: "T", isComplex: false },
      {
        type: "sensor_msgs/RegionOfInterest",
        isArray: false,
        name: "valid_window",
        isComplex: true
      },
      { type: "float32", isArray: false, name: "min_disparity", isComplex: false },
      { type: "float32", isArray: false, name: "max_disparity", isComplex: false },
      { type: "float32", isArray: false, name: "delta_d", isComplex: false }
    ]
  },
  "tf2_msgs/TFMessage": {
    name: "tf2_msgs/TFMessage",
    definitions: [
      {
        type: "geometry_msgs/TransformStamped",
        isArray: true,
        name: "transforms",
        isComplex: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectory": {
    name: "trajectory_msgs/JointTrajectory",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: true, name: "joint_names", isComplex: false },
      {
        type: "trajectory_msgs/JointTrajectoryPoint",
        isArray: true,
        name: "points",
        isComplex: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectoryPoint": {
    name: "trajectory_msgs/JointTrajectoryPoint",
    definitions: [
      { type: "float64", isArray: true, name: "positions", isComplex: false },
      { type: "float64", isArray: true, name: "velocities", isComplex: false },
      { type: "float64", isArray: true, name: "accelerations", isComplex: false },
      { type: "float64", isArray: true, name: "effort", isComplex: false },
      { type: "duration", isArray: false, name: "time_from_start", isComplex: false }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectory": {
    name: "trajectory_msgs/MultiDOFJointTrajectory",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: true, name: "joint_names", isComplex: false },
      {
        type: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
        isArray: true,
        name: "points",
        isComplex: true
      }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectoryPoint": {
    name: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
    definitions: [
      { type: "geometry_msgs/Transform", isArray: true, name: "transforms", isComplex: true },
      { type: "geometry_msgs/Twist", isArray: true, name: "velocities", isComplex: true },
      { type: "geometry_msgs/Twist", isArray: true, name: "accelerations", isComplex: true },
      { type: "duration", isArray: false, name: "time_from_start", isComplex: false }
    ]
  },
  "velodyne_msgs/VelodynePacket": {
    name: "velodyne_msgs/VelodynePacket",
    definitions: [
      { type: "time", isArray: false, name: "stamp", isComplex: false },
      { type: "uint8", isArray: true, arrayLength: 1206, name: "data", isComplex: false }
    ]
  },
  "velodyne_msgs/VelodyneScan": {
    name: "velodyne_msgs/VelodyneScan",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "velodyne_msgs/VelodynePacket", isArray: true, name: "packets", isComplex: true }
    ]
  },
  "visualization_msgs/ImageMarker": {
    name: "visualization_msgs/ImageMarker",
    definitions: [
      { type: "uint8", name: "CIRCLE", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "LINE_STRIP", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "LINE_LIST", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "POLYGON", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "POINTS", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", name: "ADD", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "REMOVE", isConstant: true, value: 1, valueText: "1" },
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: false, name: "ns", isComplex: false },
      { type: "int32", isArray: false, name: "id", isComplex: false },
      { type: "int32", isArray: false, name: "type", isComplex: false },
      { type: "int32", isArray: false, name: "action", isComplex: false },
      { type: "geometry_msgs/Point", isArray: false, name: "position", isComplex: true },
      { type: "float32", isArray: false, name: "scale", isComplex: false },
      { type: "std_msgs/ColorRGBA", isArray: false, name: "outline_color", isComplex: true },
      { type: "uint8", isArray: false, name: "filled", isComplex: false },
      { type: "std_msgs/ColorRGBA", isArray: false, name: "fill_color", isComplex: true },
      { type: "duration", isArray: false, name: "lifetime", isComplex: false },
      { type: "geometry_msgs/Point", isArray: true, name: "points", isComplex: true },
      { type: "std_msgs/ColorRGBA", isArray: true, name: "outline_colors", isComplex: true }
    ]
  },
  "visualization_msgs/InteractiveMarker": {
    name: "visualization_msgs/InteractiveMarker",
    definitions: [
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "geometry_msgs/Pose", isArray: false, name: "pose", isComplex: true },
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "string", isArray: false, name: "description", isComplex: false },
      { type: "float32", isArray: false, name: "scale", isComplex: false },
      {
        type: "visualization_msgs/MenuEntry",
        isArray: true,
        name: "menu_entries",
        isComplex: true
      },
      {
        type: "visualization_msgs/InteractiveMarkerControl",
        isArray: true,
        name: "controls",
        isComplex: true
      }
    ]
  },
  "visualization_msgs/MenuEntry": {
    name: "visualization_msgs/MenuEntry",
    definitions: [
      { type: "uint32", isArray: false, name: "id", isComplex: false },
      { type: "uint32", isArray: false, name: "parent_id", isComplex: false },
      { type: "string", isArray: false, name: "title", isComplex: false },
      { type: "string", isArray: false, name: "command", isComplex: false },
      { type: "uint8", name: "FEEDBACK", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "ROSRUN", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "ROSLAUNCH", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", isArray: false, name: "command_type", isComplex: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerControl": {
    name: "visualization_msgs/InteractiveMarkerControl",
    definitions: [
      { type: "string", isArray: false, name: "name", isComplex: false },
      { type: "geometry_msgs/Quaternion", isArray: false, name: "orientation", isComplex: true },
      { type: "uint8", name: "INHERIT", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "FIXED", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "VIEW_FACING", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", isArray: false, name: "orientation_mode", isComplex: false },
      { type: "uint8", name: "NONE", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "MENU", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "BUTTON", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "MOVE_AXIS", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "MOVE_PLANE", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", name: "ROTATE_AXIS", isConstant: true, value: 5, valueText: "5" },
      { type: "uint8", name: "MOVE_ROTATE", isConstant: true, value: 6, valueText: "6" },
      { type: "uint8", name: "MOVE_3D", isConstant: true, value: 7, valueText: "7" },
      { type: "uint8", name: "ROTATE_3D", isConstant: true, value: 8, valueText: "8" },
      { type: "uint8", name: "MOVE_ROTATE_3D", isConstant: true, value: 9, valueText: "9" },
      { type: "uint8", isArray: false, name: "interaction_mode", isComplex: false },
      { type: "bool", isArray: false, name: "always_visible", isComplex: false },
      { type: "visualization_msgs/Marker", isArray: true, name: "markers", isComplex: true },
      { type: "bool", isArray: false, name: "independent_marker_orientation", isComplex: false },
      { type: "string", isArray: false, name: "description", isComplex: false }
    ]
  },
  "visualization_msgs/Marker": {
    name: "visualization_msgs/Marker",
    definitions: [
      { type: "uint8", name: "ARROW", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "CUBE", isConstant: true, value: 1, valueText: "1" },
      { type: "uint8", name: "SPHERE", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "CYLINDER", isConstant: true, value: 3, valueText: "3" },
      { type: "uint8", name: "LINE_STRIP", isConstant: true, value: 4, valueText: "4" },
      { type: "uint8", name: "LINE_LIST", isConstant: true, value: 5, valueText: "5" },
      { type: "uint8", name: "CUBE_LIST", isConstant: true, value: 6, valueText: "6" },
      { type: "uint8", name: "SPHERE_LIST", isConstant: true, value: 7, valueText: "7" },
      { type: "uint8", name: "POINTS", isConstant: true, value: 8, valueText: "8" },
      { type: "uint8", name: "TEXT_VIEW_FACING", isConstant: true, value: 9, valueText: "9" },
      { type: "uint8", name: "MESH_RESOURCE", isConstant: true, value: 10, valueText: "10" },
      { type: "uint8", name: "TRIANGLE_LIST", isConstant: true, value: 11, valueText: "11" },
      { type: "uint8", name: "ADD", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "MODIFY", isConstant: true, value: 0, valueText: "0" },
      { type: "uint8", name: "DELETE", isConstant: true, value: 2, valueText: "2" },
      { type: "uint8", name: "DELETEALL", isConstant: true, value: 3, valueText: "3" },
      { type: "std_msgs/Header", isArray: false, name: "header", isComplex: true },
      { type: "string", isArray: false, name: "ns", isComplex: false },
      { type: "int32", isArray: false, name: "id", isComplex: false },
      { type: "int32", isArray: false, name: "type", isComplex: false },
      { type: "int32", isArray: false, name: "action", isComplex: false },
      { type: "geometry_msgs/Pose", isArray: false, name: "pose", isComplex: true },
      { type: "geometry_msgs/Vector3", isArray: false, name: "scale", isComplex: true },
      { type: "std_msgs/ColorRGBA", isArray: false, name: "color", isComplex: true },
      { type: "duration", isArray: false, name: "lifetime", isComplex: false },
      { type: "bool", isArray: false, name: "frame_locked", isComplex: false },
      { type: "geometry_msgs/Point", isArray: true, name: "points", isComplex: true },
      { type: "std_msgs/ColorRGBA", isArray: true, name: "colors", isComplex: true },
      { type: "string", isArray: false, name: "text", isComplex: false },
      { type: "string", isArray: false, name: "mesh_resource", isComplex: false },
      { type: "bool", isArray: false, name: "mesh_use_embedded_materials", isComplex: false }
    ]
  },
  "visualization_msgs/MarkerArray": {
    name: "visualization_msgs/MarkerArray",
    definitions: [
      { type: "visualization_msgs/Marker", isArray: true, name: "markers", isComplex: true }
    ]
  }
};
var dist = {};
var ChunkedReader$1 = {};
Object.defineProperty(ChunkedReader$1, "__esModule", { value: true });
ChunkedReader$1.ChunkedReader = void 0;
const CHUNK_SIZE$1 = 256 * 1024;
class ChunkedReader {
  constructor(filelike, chunkSize = CHUNK_SIZE$1) {
    this._fileCursor = 0;
    this._chunkCursor = 0;
    this._textDecoder = new TextDecoder();
    this._file = filelike;
    this.chunkSize = chunkSize;
  }
  async open() {
    return await this._file.open();
  }
  view() {
    return this._view;
  }
  position() {
    return this._fileCursor - (this._chunk?.byteLength ?? 0) + this._chunkCursor;
  }
  size() {
    return this._file.size();
  }
  remaining() {
    return this.size() - (this._fileCursor - (this._chunk?.byteLength ?? 0) + this._chunkCursor);
  }
  seek(relativeByteOffset) {
    const byteOffset = this.position() + relativeByteOffset;
    if (byteOffset < 0 || byteOffset > this.size()) {
      throw new Error(`Cannot seek to ${byteOffset}`);
    }
    this._fileCursor = byteOffset;
    this._chunkCursor = 0;
    this._chunk = void 0;
    this._view = void 0;
  }
  seekTo(byteOffset) {
    if (byteOffset < 0 || byteOffset > this.size()) {
      throw new Error(`Cannot seek to ${byteOffset}`);
    }
    this._fileCursor = byteOffset;
    this._chunkCursor = 0;
    this._chunk = void 0;
    this._view = void 0;
  }
  async skip(count) {
    const byteOffset = this._chunkCursor + count;
    if (count < 0 || byteOffset < 0 || byteOffset > this.size()) {
      throw new Error(`Cannot skip ${count} bytes`);
    }
    await this.fetch(count);
    this._chunkCursor += count;
  }
  async peekUint8(offset) {
    const view = await this.fetch(offset + 1);
    return view.getUint8(this._chunkCursor + offset);
  }
  async readBytes(count) {
    const view = await this.fetch(count);
    const data = new Uint8Array(view.buffer, view.byteOffset + this._chunkCursor, count);
    this._chunkCursor += count;
    return data;
  }
  async readUint8() {
    const view = await this.fetch(1);
    return view.getUint8(this._chunkCursor++);
  }
  async readInt16() {
    const view = await this.fetch(2);
    const data = view.getInt16(this._chunkCursor, true);
    this._chunkCursor += 2;
    return data;
  }
  async readUint16() {
    const view = await this.fetch(2);
    const data = view.getUint16(this._chunkCursor, true);
    this._chunkCursor += 2;
    return data;
  }
  async readInt32() {
    const view = await this.fetch(4);
    const data = view.getInt32(this._chunkCursor, true);
    this._chunkCursor += 4;
    return data;
  }
  async readUint32() {
    const view = await this.fetch(4);
    const data = view.getUint32(this._chunkCursor, true);
    this._chunkCursor += 4;
    return data;
  }
  async readFloat32() {
    const view = await this.fetch(4);
    const data = view.getFloat32(this._chunkCursor, true);
    this._chunkCursor += 4;
    return data;
  }
  async readFloat64() {
    const view = await this.fetch(8);
    const data = view.getFloat64(this._chunkCursor, true);
    this._chunkCursor += 8;
    return data;
  }
  async readInt64() {
    const view = await this.fetch(8);
    const data = view.getBigInt64(this._chunkCursor, true);
    this._chunkCursor += 8;
    return data;
  }
  async readUint64() {
    const view = await this.fetch(8);
    const data = view.getBigUint64(this._chunkCursor, true);
    this._chunkCursor += 8;
    return data;
  }
  async readString(length) {
    const view = await this.fetch(length);
    const data = this._textDecoder.decode(view.buffer.slice(view.byteOffset + this._chunkCursor, view.byteOffset + this._chunkCursor + length));
    this._chunkCursor += length;
    return data;
  }
  async fetch(bytesRequired) {
    if (bytesRequired > this.remaining()) {
      throw new Error(`Cannot read ${bytesRequired} bytes from ${this.size()} byte source, ${this.remaining()} bytes remaining`);
    }
    if (!this._chunk || this._chunkCursor === this._chunk.byteLength) {
      const fileRemaining = this.size() - this._fileCursor;
      this._chunk = await this._file.read(this._fileCursor, clamp(this.chunkSize, bytesRequired, fileRemaining));
      this._view = new DataView(this._chunk.buffer, this._chunk.byteOffset, this._chunk.byteLength);
      this._chunkCursor = 0;
      this._fileCursor += this._chunk.byteLength;
    }
    let bytesAvailable = this._chunk.byteLength - this._chunkCursor;
    const bytesNeeded = bytesRequired - bytesAvailable;
    if (bytesAvailable < bytesRequired) {
      const fileRemaining = this.size() - this._fileCursor;
      const curChunk = this._chunk;
      const nextChunk = await this._file.read(this._fileCursor, clamp(this.chunkSize, bytesNeeded, fileRemaining));
      this._chunk = concat(curChunk.slice(this._chunkCursor), nextChunk);
      this._view = new DataView(this._chunk.buffer, this._chunk.byteOffset, this._chunk.byteLength);
      this._chunkCursor = 0;
      this._fileCursor += nextChunk.byteLength;
      bytesAvailable = this._chunk.byteLength - this._chunkCursor;
      if (bytesAvailable < bytesRequired) {
        throw new Error(`Requested ${bytesRequired} bytes but ${bytesAvailable} bytes available`);
      }
    }
    return this._view;
  }
}
ChunkedReader$1.ChunkedReader = ChunkedReader;
function concat(a, b) {
  const c = new Uint8Array(a.byteLength + b.byteLength);
  c.set(a);
  c.set(b, a.byteLength);
  return c;
}
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
var DataReader$1 = {};
Object.defineProperty(DataReader$1, "__esModule", { value: true });
DataReader$1.DataReader = void 0;
class DataReader {
  constructor(data) {
    this._data = data;
  }
  async open() {
    return this._data.byteLength;
  }
  async close() {
  }
  async read(offset, length) {
    return new Uint8Array(this._data, offset, length);
  }
  size() {
    return this._data.byteLength;
  }
}
DataReader$1.DataReader = DataReader;
var definition = {};
Object.defineProperty(definition, "__esModule", { value: true });
definition.parseFieldDefinition = definition.parseMessageDefinition = void 0;
const BUILTIN_TYPES = /* @__PURE__ */ new Set([
  "int8_t",
  "uint8_t",
  "int16_t",
  "uint16_t",
  "int32_t",
  "uint32_t",
  "int64_t",
  "uint64_t",
  "float",
  "double",
  "bool",
  "char"
]);
function parseMessageDefinition(format) {
  const [name, fieldStrings] = format.split(":");
  if (!name || !fieldStrings) {
    return void 0;
  }
  const fields = [];
  for (const fieldString of fieldStrings.split(";")) {
    const trimmed = fieldString.trim();
    if (!trimmed) {
      continue;
    }
    const definition2 = parseFieldDefinition(trimmed);
    if (!definition2) {
      return void 0;
    }
    fields.push(definition2);
  }
  return { name, fields, format };
}
definition.parseMessageDefinition = parseMessageDefinition;
function parseFieldDefinition(fieldString) {
  const [typeAndArray, name] = fieldString.split(" ");
  if (!typeAndArray || !name) {
    return void 0;
  }
  const arrayMatch = /([^[]+)\[(\d+)\]/.exec(typeAndArray);
  if (arrayMatch) {
    const type2 = arrayMatch[1];
    const arrayLength = parseInt(arrayMatch[2]);
    if (isNaN(arrayLength) || arrayLength <= 0) {
      return void 0;
    }
    return { type: type2, name, arrayLength, isComplex: !BUILTIN_TYPES.has(type2) };
  }
  const type = typeAndArray;
  return { type, name, isComplex: !BUILTIN_TYPES.has(type) };
}
definition.parseFieldDefinition = parseFieldDefinition;
var enums = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.LogLevel = exports.ParameterDefaultFlags = exports.IncompatibleFlags = exports.CompatibleFlags = exports.MessageType = void 0;
  (function(MessageType) {
    MessageType[MessageType["Unknown"] = 0] = "Unknown";
    MessageType[MessageType["FlagBits"] = 66] = "FlagBits";
    MessageType[MessageType["Information"] = 73] = "Information";
    MessageType[MessageType["FormatDefinition"] = 70] = "FormatDefinition";
    MessageType[MessageType["InformationMulti"] = 77] = "InformationMulti";
    MessageType[MessageType["Parameter"] = 80] = "Parameter";
    MessageType[MessageType["ParameterDefault"] = 81] = "ParameterDefault";
    MessageType[MessageType["AddLogged"] = 65] = "AddLogged";
    MessageType[MessageType["RemoveLogged"] = 82] = "RemoveLogged";
    MessageType[MessageType["Data"] = 68] = "Data";
    MessageType[MessageType["Log"] = 76] = "Log";
    MessageType[MessageType["LogTagged"] = 67] = "LogTagged";
    MessageType[MessageType["Synchronization"] = 83] = "Synchronization";
    MessageType[MessageType["Dropout"] = 79] = "Dropout";
  })(exports.MessageType || (exports.MessageType = {}));
  (function(CompatibleFlags) {
    CompatibleFlags[CompatibleFlags["DefaultParameters"] = 1] = "DefaultParameters";
  })(exports.CompatibleFlags || (exports.CompatibleFlags = {}));
  (function(IncompatibleFlags) {
    IncompatibleFlags[IncompatibleFlags["AppendedData"] = 1] = "AppendedData";
  })(exports.IncompatibleFlags || (exports.IncompatibleFlags = {}));
  (function(ParameterDefaultFlags) {
    ParameterDefaultFlags[ParameterDefaultFlags["SystemWide"] = 1] = "SystemWide";
    ParameterDefaultFlags[ParameterDefaultFlags["CurrentConfigurationDefault"] = 2] = "CurrentConfigurationDefault";
  })(exports.ParameterDefaultFlags || (exports.ParameterDefaultFlags = {}));
  (function(LogLevel) {
    LogLevel[LogLevel["Emerg"] = 0] = "Emerg";
    LogLevel[LogLevel["Alert"] = 1] = "Alert";
    LogLevel[LogLevel["Crit"] = 2] = "Crit";
    LogLevel[LogLevel["Err"] = 3] = "Err";
    LogLevel[LogLevel["Warning"] = 4] = "Warning";
    LogLevel[LogLevel["Notice"] = 5] = "Notice";
    LogLevel[LogLevel["Info"] = 6] = "Info";
    LogLevel[LogLevel["Debug"] = 7] = "Debug";
  })(exports.LogLevel || (exports.LogLevel = {}));
})(enums);
var file = {};
Object.defineProperty(file, "__esModule", { value: true });
var messages = {};
Object.defineProperty(messages, "__esModule", { value: true });
var parse = {};
Object.defineProperty(parse, "__esModule", { value: true });
parse.fieldSize = parse.messageSize = parse.parseBasicFieldValue = parse.parseFieldValue = parse.parseMessage = void 0;
const BASIC_PARSERS = {
  bool: (view, offset) => view.getUint8(offset) !== 0,
  int8_t: (view, offset) => view.getInt8(offset),
  uint8_t: (view, offset) => view.getUint8(offset),
  int16_t: (view, offset) => view.getInt16(offset, true),
  uint16_t: (view, offset) => view.getUint16(offset, true),
  int32_t: (view, offset) => view.getInt32(offset, true),
  uint32_t: (view, offset) => view.getUint32(offset, true),
  int64_t: (view, offset) => view.getBigInt64(offset, true),
  uint64_t: (view, offset) => view.getBigUint64(offset, true),
  float: (view, offset) => view.getFloat32(offset, true),
  double: (view, offset) => view.getFloat64(offset, true),
  char: (view, offset) => String.fromCharCode(view.getUint8(offset))
};
const BASIC_SIZES = {
  bool: 1,
  int8_t: 1,
  uint8_t: 1,
  int16_t: 2,
  uint16_t: 2,
  int32_t: 4,
  uint32_t: 4,
  int64_t: 8,
  uint64_t: 8,
  float: 4,
  double: 8,
  char: 1
};
const textDecoder = new TextDecoder();
function parseMessage(definition2, definitions, view, offset = 0) {
  const output = {};
  let curOffset = offset;
  for (const field of definition2.fields) {
    if (field.name.startsWith("_")) {
      continue;
    }
    output[field.name] = parseFieldValue(field, definitions, view, curOffset);
    curOffset += fieldSize(field, definitions) * (field.arrayLength ?? 1);
  }
  if (typeof output.timestamp !== "bigint") {
    throw new Error(`Message "${definition2.name}" is missing a timestamp field`);
  }
  return output;
}
parse.parseMessage = parseMessage;
function parseFieldValue(field, definitions, view, offset = 0) {
  if (field.isComplex) {
    const definition2 = definitions.get(field.type);
    if (!definition2) {
      throw new Error(`Unknown type ${field.type}, searched ${definitions.size} definitions`);
    }
    if (field.arrayLength != void 0) {
      const size = fieldSize(field, definitions);
      const output = new Array(field.arrayLength);
      for (let i = 0; i < field.arrayLength; i++) {
        output[i] = parseMessage(definition2, definitions, view, offset + i * size);
      }
      return output;
    }
    return parseMessage(definition2, definitions, view, offset);
  }
  return parseBasicFieldValue(field, view, offset);
}
parse.parseFieldValue = parseFieldValue;
function parseBasicFieldValue(field, view, offset = 0) {
  const basicType = field.type;
  const parser = BASIC_PARSERS[basicType];
  if (field.arrayLength != void 0) {
    if (field.type === "char") {
      const len = Math.min(field.arrayLength, view.byteLength - offset);
      const byteOffset = view.byteOffset + offset;
      return textDecoder.decode(new Uint8Array(view.buffer, byteOffset, len));
    }
    const basicSize = BASIC_SIZES[basicType];
    const output = new Array(field.arrayLength);
    for (let i = 0; i < field.arrayLength; i++) {
      output[i] = parser(view, offset + i * basicSize);
    }
    return output;
  }
  return parser(view, offset);
}
parse.parseBasicFieldValue = parseBasicFieldValue;
function messageSize(definition2, definitions) {
  return definition2.fields.reduce((size, f) => size + fieldSize(f, definitions), 0);
}
parse.messageSize = messageSize;
function fieldSize(field, definitions) {
  if (field.size != void 0) {
    return field.size;
  }
  if (field.isComplex) {
    const definition2 = definitions.get(field.type);
    if (!definition2) {
      throw new Error(`Unknown type ${field.type}, searched ${definitions.size} definitions`);
    }
    field.size = messageSize(definition2, definitions);
  } else {
    field.size = BASIC_SIZES[field.type];
  }
  return field.size;
}
parse.fieldSize = fieldSize;
var ULog$1 = {};
var findRange$1 = {};
Object.defineProperty(findRange$1, "__esModule", { value: true });
findRange$1.findRange = void 0;
function findRange(entries, minValue, maxValue) {
  let low = 0;
  let high = entries.length - 1;
  let startIndex = -1;
  while (low <= high) {
    const mid = Math.floor((high - low) / 2) + low;
    const curValue = entries[mid][0];
    if (curValue >= minValue) {
      startIndex = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  let endIndex = -1;
  low = 0;
  high = entries.length - 1;
  while (low <= high) {
    const mid = Math.floor((high - low) / 2) + low;
    if (entries[mid][0] <= maxValue) {
      endIndex = mid;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }
  if (startIndex !== -1 && endIndex !== -1) {
    return [startIndex, endIndex];
  }
  return void 0;
}
findRange$1.findRange = findRange;
var hex = {};
Object.defineProperty(hex, "__esModule", { value: true });
hex.toHex = hex.fromHex = void 0;
const LUT_HEX_4b = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
const LUT_HEX_8b = new Array(256);
for (let n = 0; n < 256; n++) {
  LUT_HEX_8b[n] = `${LUT_HEX_4b[n >>> 4 & 15]}${LUT_HEX_4b[n & 15]}`;
}
function fromHex(hex2) {
  const match = hex2.match(/.{1,2}/g) ?? [];
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
}
hex.fromHex = fromHex;
function toHex(data) {
  let out = "";
  for (let idx = 0, edx = data.length; idx < edx; idx++) {
    out += LUT_HEX_8b[data[idx]];
  }
  return out;
}
hex.toHex = toHex;
var readMessage = {};
Object.defineProperty(readMessage, "__esModule", { value: true });
readMessage.readMessageUnknown = readMessage.readMessageDropout = readMessage.readMessageSynchronization = readMessage.readMessageLogTagged = readMessage.readMessageLog = readMessage.readMessageData = readMessage.readMessageRemoveLogged = readMessage.readMessageAddLogged = readMessage.readMessageParameterDefault = readMessage.readMessageParameter = readMessage.readMessageFormatDefinition = readMessage.readMessageInformationMulti = readMessage.readMessageInformation = readMessage.readMessageFlagBits = readMessage.readRawMessage = readMessage.readMessageHeader = void 0;
const enums_1$1 = enums;
const hex_1$1 = hex;
const SYNC_MAGIC = [47, 115, 19, 32, 37, 12, 187, 18];
async function readMessageHeader(reader) {
  const size = await reader.readUint16();
  const type = await reader.readUint8();
  return { size, type };
}
readMessage.readMessageHeader = readMessageHeader;
async function readRawMessage(reader, dataEnd) {
  if (dataEnd != void 0) {
    if (dataEnd - reader.position() < 3) {
      return void 0;
    }
  } else if (reader.remaining() < 3) {
    return void 0;
  }
  try {
    const header = await readMessageHeader(reader);
    switch (header.type) {
      case enums_1$1.MessageType.FlagBits:
        return await readMessageFlagBits(reader, header);
      case enums_1$1.MessageType.Information:
        return await readMessageInformation(reader, header);
      case enums_1$1.MessageType.InformationMulti:
        return await readMessageInformationMulti(reader, header);
      case enums_1$1.MessageType.FormatDefinition:
        return await readMessageFormatDefinition(reader, header);
      case enums_1$1.MessageType.Parameter:
        return await readMessageParameter(reader, header);
      case enums_1$1.MessageType.ParameterDefault:
        return await readMessageParameterDefault(reader, header);
      case enums_1$1.MessageType.AddLogged:
        return await readMessageAddLogged(reader, header);
      case enums_1$1.MessageType.RemoveLogged:
        return await readMessageRemoveLogged(reader, header);
      case enums_1$1.MessageType.Data:
        return await readMessageData(reader, header);
      case enums_1$1.MessageType.Log:
        return await readMessageLog(reader, header);
      case enums_1$1.MessageType.LogTagged:
        return await readMessageLogTagged(reader, header);
      case enums_1$1.MessageType.Synchronization:
        return await readMessageSynchronization(reader, header);
      case enums_1$1.MessageType.Dropout:
        return await readMessageDropout(reader, header);
      default:
        return await readMessageUnknown(reader, header);
    }
  } catch (err) {
    return void 0;
  }
}
readMessage.readRawMessage = readRawMessage;
async function readMessageFlagBits(reader, header) {
  if (header.size < 40) {
    throw new Error(`Invalid 'B' message, expected 40 bytes but got ${header.size}`);
  }
  const compatFlags = await reader.readBytes(8);
  const incompatFlags = await reader.readBytes(8);
  for (let i = 0; i < 8; i++) {
    if (i === 0 && incompatFlags[i] > 1 || i !== 0 && incompatFlags[i] !== 0) {
      throw new Error(`Incompatible flag bit: ${i} is ${incompatFlags[i]}`);
    }
  }
  return {
    size: header.size,
    type: header.type,
    compatibleFlags: Array.from(compatFlags),
    incompatibleFlags: Array.from(incompatFlags),
    appendedOffsets: [
      await reader.readUint64(),
      await reader.readUint64(),
      await reader.readUint64()
    ]
  };
}
readMessage.readMessageFlagBits = readMessageFlagBits;
async function readMessageInformation(reader, header) {
  const keyLen = await reader.readUint8();
  if (keyLen > header.size - 1) {
    throw new Error(`Invalid 'I' message, size is ${header.size} but key_len is ${keyLen}`);
  }
  return {
    size: header.size,
    type: header.type,
    key: await reader.readString(keyLen),
    value: await reader.readBytes(header.size - 1 - keyLen)
  };
}
readMessage.readMessageInformation = readMessageInformation;
async function readMessageInformationMulti(reader, header) {
  const isContinued = Boolean(await reader.readUint8());
  const keyLen = await reader.readUint8();
  if (keyLen > header.size - 1) {
    throw new Error(`Invalid 'I' message, size is ${header.size} but key_len is ${keyLen}`);
  }
  const key = await reader.readString(keyLen);
  const value = await reader.readBytes(header.size - 2 - keyLen);
  return { size: header.size, type: header.type, isContinued, key, value };
}
readMessage.readMessageInformationMulti = readMessageInformationMulti;
async function readMessageFormatDefinition(reader, header) {
  const format = await reader.readString(header.size);
  return { size: header.size, type: header.type, format };
}
readMessage.readMessageFormatDefinition = readMessageFormatDefinition;
async function readMessageParameter(reader, header) {
  const keyLen = await reader.readUint8();
  if (keyLen > header.size - 1) {
    throw new Error(`Invalid 'P' message, size is ${header.size} but key_len is ${keyLen}`);
  }
  const key = await reader.readString(keyLen);
  const value = await reader.readBytes(header.size - 1 - keyLen);
  return { size: header.size, type: header.type, key, value };
}
readMessage.readMessageParameter = readMessageParameter;
async function readMessageParameterDefault(reader, header) {
  const defaultTypes = await reader.readUint8();
  const keyLen = await reader.readUint8();
  if (keyLen > header.size - 2) {
    throw new Error(`Invalid 'Q' message, size is ${header.size} but key_len is ${keyLen}`);
  }
  const key = await reader.readString(keyLen);
  const value = await reader.readBytes(header.size - 2 - keyLen);
  return { size: header.size, type: header.type, defaultTypes, key, value };
}
readMessage.readMessageParameterDefault = readMessageParameterDefault;
async function readMessageAddLogged(reader, header) {
  if (header.size < 3) {
    throw new Error(`Invalid 'A' message, size is ${header.size} but expected at least 3`);
  }
  const multiId = await reader.readUint8();
  const msgId = await reader.readUint16();
  const messageName = await reader.readString(header.size - 3);
  return { size: header.size, type: header.type, multiId, msgId, messageName };
}
readMessage.readMessageAddLogged = readMessageAddLogged;
async function readMessageRemoveLogged(reader, header) {
  if (header.size < 1) {
    throw new Error(`Invalid 'R' message, size is ${header.size} but expected at least 1`);
  }
  const msgId = await reader.readUint8();
  return { size: header.size, type: header.type, msgId };
}
readMessage.readMessageRemoveLogged = readMessageRemoveLogged;
async function readMessageData(reader, header) {
  if (header.size < 2) {
    throw new Error(`Invalid 'D' message, size is ${header.size} but expected at least 2`);
  }
  const msgId = await reader.readUint16();
  const data = await reader.readBytes(header.size - 2);
  return { size: header.size, type: header.type, msgId, data };
}
readMessage.readMessageData = readMessageData;
async function readMessageLog(reader, header) {
  if (header.size < 9) {
    throw new Error(`Invalid 'L' message, size is ${header.size} but expected at least 9`);
  }
  const logLevel = await reader.readUint8();
  const timestamp = await reader.readUint64();
  const message = await reader.readString(header.size - 9);
  return { size: header.size, type: header.type, logLevel, timestamp, message };
}
readMessage.readMessageLog = readMessageLog;
async function readMessageLogTagged(reader, header) {
  if (header.size < 11) {
    throw new Error(`Invalid 'T' message, size is ${header.size} but expected at least 11`);
  }
  const logLevel = await reader.readUint8();
  const tag = await reader.readUint16();
  const timestamp = await reader.readUint64();
  const message = await reader.readString(header.size - 11);
  return { size: header.size, type: header.type, logLevel, tag, timestamp, message };
}
readMessage.readMessageLogTagged = readMessageLogTagged;
async function readMessageSynchronization(reader, header) {
  if (header.size !== 8) {
    throw new Error(`Invalid 'S' message, size is ${header.size} but expected 8`);
  }
  const syncMagic = await reader.readBytes(8);
  for (let i = 0; i < 8; i++) {
    if (syncMagic[i] !== SYNC_MAGIC[i]) {
      throw new Error(`Invalid 'S' message: ${(0, hex_1$1.toHex)(syncMagic)}`);
    }
  }
  return { size: header.size, type: header.type, syncMagic: SYNC_MAGIC };
}
readMessage.readMessageSynchronization = readMessageSynchronization;
async function readMessageDropout(reader, header) {
  if (header.size < 2) {
    throw new Error(`Invalid 'O' message, size is ${header.size} but expected at least 2`);
  }
  const duration = await reader.readUint16();
  return { size: header.size, type: header.type, duration };
}
readMessage.readMessageDropout = readMessageDropout;
async function readMessageUnknown(reader, header) {
  const data = await reader.readBytes(header.size);
  return { size: header.size, type: enums_1$1.MessageType.Unknown, unknownType: header.type, data };
}
readMessage.readMessageUnknown = readMessageUnknown;
Object.defineProperty(ULog$1, "__esModule", { value: true });
ULog$1.ULog = void 0;
const ChunkedReader_1 = ChunkedReader$1;
const definition_1 = definition;
const enums_1 = enums;
const findRange_1 = findRange$1;
const hex_1 = hex;
const parse_1 = parse;
const readMessage_1 = readMessage;
const MAGIC = [85, 76, 111, 103, 1, 18, 53];
class ULog {
  constructor(filelike, opts = {}) {
    this._subscriptions = /* @__PURE__ */ new Map();
    this._reader = new ChunkedReader_1.ChunkedReader(filelike, opts.chunkSize);
  }
  get header() {
    return this._header;
  }
  get subscriptions() {
    return this._subscriptions;
  }
  async open() {
    await this._reader.open();
    const data = await this._reader.readBytes(8);
    for (let i = 0; i < MAGIC.length; i++) {
      if (data[i] !== MAGIC[i]) {
        throw new Error(`Invalid ULog header: ${(0, hex_1.toHex)(data)}`);
      }
    }
    const version = data[7];
    const timestamp = await this._reader.readUint64();
    const information = /* @__PURE__ */ new Map();
    const parameters = /* @__PURE__ */ new Map();
    const definitions = /* @__PURE__ */ new Map();
    let flagBits;
    while (!await isDataSectionStart(this._reader)) {
      const message = await (0, readMessage_1.readRawMessage)(this._reader, this._dataEnd);
      if (!message) {
        break;
      }
      switch (message.type) {
        case enums_1.MessageType.FlagBits: {
          flagBits = message;
          break;
        }
        case enums_1.MessageType.Information: {
          const infoMsg = message;
          const field = (0, definition_1.parseFieldDefinition)(infoMsg.key);
          if (isValidInfoField(field)) {
            const value = infoMsg.value;
            const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
            const parsed = (0, parse_1.parseBasicFieldValue)(field, view);
            information.set(field.name, parsed);
          }
          break;
        }
        case enums_1.MessageType.InformationMulti: {
          const infoMultiMsg = message;
          const field = (0, definition_1.parseFieldDefinition)(infoMultiMsg.key);
          if (isValidInfoField(field)) {
            let array = information.get(infoMultiMsg.key);
            if (!Array.isArray(array)) {
              array = [];
              information.set(infoMultiMsg.key, array);
            }
            const value = infoMultiMsg.value;
            const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
            const parsed = (0, parse_1.parseBasicFieldValue)(field, view);
            array.push(parsed);
          }
          break;
        }
        case enums_1.MessageType.FormatDefinition: {
          const formatMsg = message;
          const msgdef = (0, definition_1.parseMessageDefinition)(formatMsg.format);
          if (msgdef) {
            definitions.set(msgdef.name, msgdef);
          } else {
            throw new Error(`oops: ${formatMsg.format}`);
          }
          break;
        }
        case enums_1.MessageType.Parameter: {
          const paramMsg = message;
          const field = (0, definition_1.parseFieldDefinition)(paramMsg.key);
          if (isValidParameter(field)) {
            const value = paramMsg.value;
            const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
            const parsed = (0, parse_1.parseBasicFieldValue)(field, view);
            parameters.set(field.name, { value: parsed, defaultTypes: 0 });
          }
          break;
        }
        case enums_1.MessageType.ParameterDefault: {
          const paramMsg = message;
          const field = (0, definition_1.parseFieldDefinition)(paramMsg.key);
          if (isValidParameter(field)) {
            const value = paramMsg.value;
            const view = new DataView(value.buffer, value.byteOffset, value.byteLength);
            const parsed = (0, parse_1.parseBasicFieldValue)(field, view);
            if (parsed != void 0) {
              parameters.set(field.name, { value: parsed, defaultTypes: paramMsg.defaultTypes });
            }
          }
          break;
        }
        default:
          throw new Error(`Unrecognized message type ${message.type}`);
      }
    }
    const appendedOffsets = flagBits?.appendedOffsets ?? [0n, 0n, 0n];
    this._appendedOffsets = appendedOffsets.map((n) => Number(n));
    const firstOffset = this._appendedOffsets[0];
    this._dataStart = this._reader.position();
    this._dataEnd = this._reader.size();
    if (firstOffset > 0 && firstOffset < this._dataEnd) {
      this._dataEnd = firstOffset;
    }
    this._header = { version, timestamp, flagBits, information, parameters, definitions };
    if (this._dataStart == void 0 || this._dataEnd == void 0) {
      throw new Error(`Cannot create index before open`);
    }
    await this.createIndex();
  }
  async *readMessages(opts = {}) {
    const sortedMessages = this._timeIndex;
    if (sortedMessages == void 0) {
      throw new Error(`Cannot readMessages before createIndex`);
    }
    if (sortedMessages.length === 0) {
      return;
    }
    const startTime = opts.startTime ?? sortedMessages[0][0];
    const endTime = opts.endTime ?? sortedMessages[sortedMessages.length - 1][0];
    const range = (0, findRange_1.findRange)(sortedMessages, startTime, endTime);
    if (range == void 0) {
      return;
    }
    for (let i = range[0]; i <= range[1]; i++) {
      yield sortedMessages[i][2];
    }
  }
  messageCount() {
    return this._timeIndex?.length;
  }
  dataMessageCounts() {
    return this._dataMessageCounts;
  }
  logCount() {
    return this._logMessageCount;
  }
  timeRange() {
    if (!this._timeIndex || this._timeIndex.length === 0) {
      return void 0;
    }
    const start = this._timeIndex[0][0];
    const end = this._timeIndex[this._timeIndex.length - 1][0];
    return [start, end];
  }
  async createIndex() {
    const timeIndex = [];
    const dataCounts = /* @__PURE__ */ new Map();
    let maxTimestamp = 0n;
    let logMessageCount = 0;
    let i = 0;
    let message;
    while (message = await this.readParsedMessage()) {
      if (message.type === enums_1.MessageType.Data) {
        if (message.value.timestamp > maxTimestamp) {
          maxTimestamp = message.value.timestamp;
        }
        timeIndex.push([message.value.timestamp, i++, message]);
        dataCounts.set(message.msgId, (dataCounts.get(message.msgId) ?? 0) + 1);
      } else if (message.type === enums_1.MessageType.Log || message.type === enums_1.MessageType.LogTagged) {
        if (message.timestamp > maxTimestamp) {
          maxTimestamp = message.timestamp;
        }
        timeIndex.push([message.timestamp, i++, message]);
        logMessageCount++;
      } else {
        timeIndex.push([maxTimestamp, i++, message]);
      }
    }
    this._timeIndex = timeIndex.sort(sortTimeIndex);
    this._dataMessageCounts = dataCounts;
    this._logMessageCount = logMessageCount;
  }
  async readParsedMessage() {
    if (!this._header) {
      throw new Error(`Cannot read before open`);
    }
    const rawMessage = await (0, readMessage_1.readRawMessage)(this._reader, this._dataEnd);
    if (!rawMessage) {
      return void 0;
    }
    if (rawMessage.type === enums_1.MessageType.AddLogged) {
      this.handleSubscription(rawMessage);
    }
    if (rawMessage.type !== enums_1.MessageType.Data) {
      return rawMessage;
    }
    const dataMsg = rawMessage;
    const definition2 = this._subscriptions.get(dataMsg.msgId);
    if (!definition2) {
      const msgPos = this._reader.position() - rawMessage.size - 3;
      throw new Error(`Unknown msg_id ${dataMsg.msgId} for ${rawMessage.size} byte 'D' message at offset ${msgPos}`);
    }
    const data = dataMsg.data;
    const value = (0, parse_1.parseMessage)(definition2, this._header.definitions, this._reader.view(), data.byteOffset);
    const parsed = {
      size: dataMsg.size,
      type: enums_1.MessageType.Data,
      msgId: dataMsg.msgId,
      data,
      value
    };
    return parsed;
  }
  handleSubscription(subscribe) {
    const definition2 = this._header?.definitions.get(subscribe.messageName);
    if (!definition2) {
      throw new Error(`AddLogged unknown message_name: ${subscribe.messageName}`);
    }
    this._subscriptions.set(subscribe.msgId, definition2);
  }
}
ULog$1.ULog = ULog;
async function isDataSectionStart(reader) {
  const type = await reader.peekUint8(2);
  switch (type) {
    case enums_1.MessageType.AddLogged:
    case enums_1.MessageType.RemoveLogged:
    case enums_1.MessageType.Data:
    case enums_1.MessageType.Log:
    case enums_1.MessageType.LogTagged:
    case enums_1.MessageType.Synchronization:
    case enums_1.MessageType.Dropout:
      return true;
    default:
      return false;
  }
}
function isValidInfoField(field) {
  return field?.isComplex === false;
}
function isValidParameter(field) {
  return Boolean(field && (field.type === "int32_t" || field.type === "float") && field.arrayLength == void 0);
}
function sortTimeIndex(a, b) {
  const timestampA = a[0];
  const timestampB = b[0];
  if (timestampA === timestampB) {
    const indexA = a[1];
    const indexB = b[1];
    return indexA - indexB;
  }
  return Number(timestampA - timestampB);
}
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
  __exportStar(ChunkedReader$1, exports);
  __exportStar(DataReader$1, exports);
  __exportStar(definition, exports);
  __exportStar(enums, exports);
  __exportStar(file, exports);
  __exportStar(messages, exports);
  __exportStar(parse, exports);
  __exportStar(ULog$1, exports);
})(dist);
var BlobReader$2 = {};
Object.defineProperty(BlobReader$2, "__esModule", { value: true });
BlobReader$2.BlobReader = void 0;
class BlobReader$1 {
  constructor(blob) {
    if (!(blob instanceof Blob)) {
      throw new Error("Expected file to be a File or Blob.");
    }
    this._blob = blob;
    this._size = blob.size;
  }
  async open() {
    return this._size;
  }
  async read(offset, length) {
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        reader.onload = null;
        reader.onerror = null;
        if (reader.result == void 0 || !(reader.result instanceof ArrayBuffer)) {
          return reject("Unsupported format for BlobReader");
        }
        resolve(new Uint8Array(reader.result));
      };
      reader.onerror = function() {
        reader.onload = null;
        reader.onerror = null;
        reject(reader.error ?? new Error("Unknown FileReader error"));
      };
      reader.readAsArrayBuffer(this._blob.slice(offset, offset + length));
    });
  }
  size() {
    return this._size;
  }
}
BlobReader$2.BlobReader = BlobReader$1;
const { BlobReader } = BlobReader$2;
var web = { BlobReader };
function messageIdToTopic(msgId, ulog) {
  return ulog.subscriptions.get(msgId)?.name;
}
function messageDefinitionToRos(msgDef) {
  const definitions = [];
  for (const field of msgDef.fields) {
    const isString = field.type === "char";
    definitions.push({
      name: field.name,
      type: typeToRos(field.type),
      isArray: field.arrayLength != void 0 && !isString,
      arrayLength: isString ? void 0 : field.arrayLength,
      upperBound: isString ? field.arrayLength ?? 1 : void 0,
      isComplex: field.isComplex
    });
  }
  return { name: msgDef.name, definitions };
}
function logLevelToRosout(level) {
  switch (level) {
    case dist.LogLevel.Emerg:
    case dist.LogLevel.Alert:
    case dist.LogLevel.Crit:
      return 16;
    case dist.LogLevel.Err:
      return 8;
    case dist.LogLevel.Warning:
      return 4;
    case dist.LogLevel.Notice:
    case dist.LogLevel.Info:
      return 2;
    case dist.LogLevel.Debug:
    default:
      return 1;
  }
}
function typeToRos(type) {
  switch (type) {
    case "int8_t":
      return "int8";
    case "uint8_t":
      return "uint8";
    case "int16_t":
      return "int16";
    case "uint16_t":
      return "uint16";
    case "int32_t":
      return "int32";
    case "uint32_t":
      return "uint32";
    case "int64_t":
      return "int64";
    case "uint64_t":
      return "uint64";
    case "float":
      return "float32";
    case "double":
      return "float64";
    case "bool":
      return "bool";
    case "char":
      return "string";
    default:
      return type;
  }
}
const CHUNK_SIZE = 1024 * 1024;
const LOG_TOPIC = "Log";
const log = console;
class UlogIterableSource {
  constructor(options) {
    __privateAdd(this, _options, void 0);
    __privateAdd(this, _ulog, void 0);
    __privateAdd(this, _start, void 0);
    __privateAdd(this, _end, void 0);
    __privateSet(this, _options, options);
  }
  async initialize() {
    const file2 = __privateGet(this, _options).file;
    const bytes = __privateGet(this, _options).file.size;
    log.debug(`initialize(${bytes} bytes)`);
    const startTime = performance.now();
    __privateSet(this, _ulog, new dist.ULog(new web.BlobReader(file2), { chunkSize: CHUNK_SIZE }));
    await __privateGet(this, _ulog).open();
    const durationMs = performance.now() - startTime;
    log.debug(`opened in ${durationMs.toFixed(2)}ms`);
    const counts = __privateGet(this, _ulog).dataMessageCounts();
    const timeRange = __privateGet(this, _ulog).timeRange() ?? [0n, 0n];
    const start = dist$1.fromMicros(Number(timeRange[0]));
    const end = dist$1.fromMicros(Number(timeRange[1]));
    const problems = [];
    const topics = [];
    const topicStats = /* @__PURE__ */ new Map();
    const datatypes = /* @__PURE__ */ new Map();
    const header = __privateGet(this, _ulog).header;
    topics.push({ name: LOG_TOPIC, schemaName: "rosgraph_msgs/Log" });
    topicStats.set(LOG_TOPIC, { numMessages: __privateGet(this, _ulog).logCount() ?? 0 });
    datatypes.set("rosgraph_msgs/Log", ros1Definitions["rosgraph_msgs/Log"]);
    for (const msgDef of header.definitions.values()) {
      datatypes.set(msgDef.name, messageDefinitionToRos(msgDef));
    }
    const topicNames = /* @__PURE__ */ new Set();
    for (const [msgId, msgDef] of __privateGet(this, _ulog).subscriptions.entries()) {
      const count = counts.get(msgId);
      if (count == void 0 || count === 0) {
        continue;
      }
      const name = messageIdToTopic(msgId, __privateGet(this, _ulog));
      if (name && !topicNames.has(name)) {
        topicNames.add(name);
        topics.push({ name, schemaName: msgDef.name });
        topicStats.set(name, { numMessages: count });
        msgDef.format;
        datatypes.get(msgDef.name);
      }
    }
    const parameters = /* @__PURE__ */ new Map();
    for (const [key, entry] of header.parameters.entries()) {
      parameters.set(key, entry.value);
    }
    log.debug(`message definitions parsed`);
    __privateSet(this, _start, start);
    __privateSet(this, _end, end);
    return {
      start,
      end,
      topics,
      datatypes,
      profile: "ulog",
      problems,
      publishersByTopic: /* @__PURE__ */ new Map(),
      topicStats
    };
  }
  async *messageIterator(args) {
    if (__privateGet(this, _ulog) == void 0) {
      throw new Error(`UlogDataProvider is not initialized`);
    }
    const topics = args.topics;
    const start = args.start ?? __privateGet(this, _start);
    const end = args.end ?? __privateGet(this, _end);
    if (!start || !end) {
      throw new Error(`UlogDataProvider is not initialized`);
    }
    if (topics.size === 0) {
      return;
    }
    const startTime = BigInt(Math.floor(dist$1.toMicroSec(start)));
    const endTime = BigInt(Math.floor(dist$1.toMicroSec(end)));
    for await (const msg of __privateGet(this, _ulog).readMessages({ startTime, endTime })) {
      if (msg.type === dist.MessageType.Data) {
        const timestamp = msg.value.timestamp;
        const receiveTime = dist$1.fromMicros(Number(timestamp));
        const sub = __privateGet(this, _ulog).subscriptions.get(msg.msgId);
        const topic = sub?.name;
        if (topic && topics.has(topic) && dist$1.isTimeInRangeInclusive(receiveTime, start, end)) {
          yield {
            type: "message-event",
            msgEvent: {
              topic,
              receiveTime,
              message: msg.value,
              sizeInBytes: msg.data.byteLength,
              schemaName: sub.name
            }
          };
        }
      } else if (msg.type === dist.MessageType.Log || msg.type === dist.MessageType.LogTagged) {
        const receiveTime = dist$1.fromMicros(Number(msg.timestamp));
        if (topics.has(LOG_TOPIC) && dist$1.isTimeInRangeInclusive(receiveTime, start, end)) {
          yield {
            type: "message-event",
            msgEvent: {
              topic: LOG_TOPIC,
              receiveTime,
              message: {
                file: "",
                function: "",
                header: { stamp: receiveTime },
                level: logLevelToRosout(msg.logLevel),
                line: 0,
                msg: msg.message,
                name: ""
              },
              schemaName: "rosgraph_msgs/Log",
              sizeInBytes: msg.size
            }
          };
        }
      }
    }
  }
  async getBackfillMessages(_args) {
    return [];
  }
}
_options = new WeakMap();
_ulog = new WeakMap();
_start = new WeakMap();
_end = new WeakMap();
function initialize(args) {
  if (!args.file) {
    throw new Error("file required");
  }
  const source = new UlogIterableSource({ type: "file", file: args.file });
  const wrapped = new WorkerIterableSourceWorker(source);
  return proxy(wrapped);
}
const service = {
  initialize
};
expose(service);
