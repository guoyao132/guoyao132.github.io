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
var _iter, _lastIteratorResult, _abort, _files, _bag, _start, _end, _messageSizeEstimateByTopic;
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
    const { id, type: type2, path } = Object.assign({ path: [] }, ev.data);
    const argumentList = (ev.data.argumentList || []).map(fromWireValue);
    let returnValue;
    try {
      const parent = path.slice(0, -1).reduce((obj2, prop) => obj2[prop], obj);
      const rawValue = path.reduce((obj2, prop) => obj2[prop], obj);
      switch (type2) {
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
function getAugmentedNamespace(n) {
  var f = n.default;
  if (typeof f == "function") {
    var a = function() {
      return f.apply(this, arguments);
    };
    a.prototype = f.prototype;
  } else
    a = {};
  Object.defineProperty(a, "__esModule", { value: true });
  Object.keys(n).forEach(function(k) {
    var d = Object.getOwnPropertyDescriptor(n, k);
    Object.defineProperty(a, k, d.get ? d : {
      enumerable: true,
      get: function() {
        return n[k];
      }
    });
  });
  return a;
}
var dist$6 = {};
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
})(dist$6);
const TIME_ZERO$1 = Object.freeze({ sec: 0, nsec: 0 });
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
    let cutoffTime = TIME_ZERO$1;
    switch (firstResult.type) {
      case "stamp":
        cutoffTime = dist$6.add(firstResult.stamp, { sec: 0, nsec: durationMs * 1e6 });
        break;
      case "message-event":
        cutoffTime = dist$6.add(firstResult.msgEvent.receiveTime, { sec: 0, nsec: durationMs * 1e6 });
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
      if (result.type === "stamp" && dist$6.compare(result.stamp, cutoffTime) > 0) {
        break;
      }
      if (result.type === "message-event" && dist$6.compare(result.msgEvent.receiveTime, cutoffTime) > 0) {
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
    if (__privateGet(this, _lastIteratorResult)?.type === "stamp" && dist$6.compare(__privateGet(this, _lastIteratorResult).stamp, end) >= 0) {
      return results;
    }
    if (__privateGet(this, _lastIteratorResult)?.type === "message-event" && dist$6.compare(__privateGet(this, _lastIteratorResult).msgEvent.receiveTime, end) > 0) {
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
      if (value.type === "stamp" && dist$6.compare(value.stamp, end) >= 0) {
        __privateSet(this, _lastIteratorResult, value);
        break;
      }
      if (value.type === "message-event" && dist$6.compare(value.msgEvent.receiveTime, end) > 0) {
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
var dist$5 = {};
var dist$4 = {};
var MessageIterator$1 = {};
Object.defineProperty(MessageIterator$1, "__esModule", { value: true });
MessageIterator$1.MessageIterator = void 0;
class MessageIterator {
  constructor(rowIterators, decoder2) {
    this.rowIterators = rowIterators;
    this.decoder = decoder2;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  async next() {
    while (this.rowIterators.length > 0) {
      const front = this.rowIterators[0];
      const res = await front.next();
      if (res.done === true) {
        this.rowIterators.shift();
        continue;
      }
      const rawMessage = res.value;
      const { topic, timestamp: timestamp2, data } = rawMessage;
      if (this.decoder == void 0) {
        return { value: { topic, timestamp: timestamp2, data, value: void 0 }, done: false };
      }
      const value = { topic, timestamp: timestamp2, data, value: this.decoder(rawMessage) };
      return { value, done: false };
    }
    return { value: void 0, done: true };
  }
}
MessageIterator$1.MessageIterator = MessageIterator;
var metadata = {};
var types$1 = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.QosPolicyReliability = exports.QosPolicyLiveliness = exports.QosPolicyHistory = exports.QosPolicyDurability = void 0;
  (function(QosPolicyDurability) {
    QosPolicyDurability[QosPolicyDurability["SystemDefault"] = 0] = "SystemDefault";
    QosPolicyDurability[QosPolicyDurability["TransientLocal"] = 1] = "TransientLocal";
    QosPolicyDurability[QosPolicyDurability["Volatile"] = 2] = "Volatile";
    QosPolicyDurability[QosPolicyDurability["Unknown"] = 3] = "Unknown";
  })(exports.QosPolicyDurability || (exports.QosPolicyDurability = {}));
  (function(QosPolicyHistory) {
    QosPolicyHistory[QosPolicyHistory["SystemDefault"] = 0] = "SystemDefault";
    QosPolicyHistory[QosPolicyHistory["KeepLast"] = 1] = "KeepLast";
    QosPolicyHistory[QosPolicyHistory["KeepAll"] = 2] = "KeepAll";
    QosPolicyHistory[QosPolicyHistory["Unknown"] = 3] = "Unknown";
  })(exports.QosPolicyHistory || (exports.QosPolicyHistory = {}));
  (function(QosPolicyLiveliness) {
    QosPolicyLiveliness[QosPolicyLiveliness["SystemDefault"] = 0] = "SystemDefault";
    QosPolicyLiveliness[QosPolicyLiveliness["Automatic"] = 1] = "Automatic";
    QosPolicyLiveliness[QosPolicyLiveliness["ManualByTopic"] = 3] = "ManualByTopic";
    QosPolicyLiveliness[QosPolicyLiveliness["Unknown"] = 4] = "Unknown";
  })(exports.QosPolicyLiveliness || (exports.QosPolicyLiveliness = {}));
  (function(QosPolicyReliability) {
    QosPolicyReliability[QosPolicyReliability["SystemDefault"] = 0] = "SystemDefault";
    QosPolicyReliability[QosPolicyReliability["Reliable"] = 1] = "Reliable";
    QosPolicyReliability[QosPolicyReliability["BestEffort"] = 2] = "BestEffort";
    QosPolicyReliability[QosPolicyReliability["Unknown"] = 3] = "Unknown";
  })(exports.QosPolicyReliability || (exports.QosPolicyReliability = {}));
})(types$1);
var yaml = {};
var jsYaml = {};
var loader$1 = {};
var common$5 = {};
function isNothing(subject) {
  return typeof subject === "undefined" || subject === null;
}
function isObject(subject) {
  return typeof subject === "object" && subject !== null;
}
function toArray(sequence) {
  if (Array.isArray(sequence))
    return sequence;
  else if (isNothing(sequence))
    return [];
  return [sequence];
}
function extend(target, source) {
  var index, length, key, sourceKeys;
  if (source) {
    sourceKeys = Object.keys(source);
    for (index = 0, length = sourceKeys.length; index < length; index += 1) {
      key = sourceKeys[index];
      target[key] = source[key];
    }
  }
  return target;
}
function repeat(string2, count) {
  var result = "", cycle;
  for (cycle = 0; cycle < count; cycle += 1) {
    result += string2;
  }
  return result;
}
function isNegativeZero(number2) {
  return number2 === 0 && Number.NEGATIVE_INFINITY === 1 / number2;
}
common$5.isNothing = isNothing;
common$5.isObject = isObject;
common$5.toArray = toArray;
common$5.repeat = repeat;
common$5.isNegativeZero = isNegativeZero;
common$5.extend = extend;
function formatError(exception2, compact) {
  var where = "", message = exception2.reason || "(unknown reason)";
  if (!exception2.mark)
    return message;
  if (exception2.mark.name) {
    where += 'in "' + exception2.mark.name + '" ';
  }
  where += "(" + (exception2.mark.line + 1) + ":" + (exception2.mark.column + 1) + ")";
  if (!compact && exception2.mark.snippet) {
    where += "\n\n" + exception2.mark.snippet;
  }
  return message + " " + where;
}
function YAMLException$4(reason, mark) {
  Error.call(this);
  this.name = "YAMLException";
  this.reason = reason;
  this.mark = mark;
  this.message = formatError(this, false);
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this, this.constructor);
  } else {
    this.stack = new Error().stack || "";
  }
}
YAMLException$4.prototype = Object.create(Error.prototype);
YAMLException$4.prototype.constructor = YAMLException$4;
YAMLException$4.prototype.toString = function toString2(compact) {
  return this.name + ": " + formatError(this, compact);
};
var exception = YAMLException$4;
var common$4 = common$5;
function getLine(buffer, lineStart, lineEnd, position, maxLineLength) {
  var head = "";
  var tail = "";
  var maxHalfLength = Math.floor(maxLineLength / 2) - 1;
  if (position - lineStart > maxHalfLength) {
    head = " ... ";
    lineStart = position - maxHalfLength + head.length;
  }
  if (lineEnd - position > maxHalfLength) {
    tail = " ...";
    lineEnd = position + maxHalfLength - tail.length;
  }
  return {
    str: head + buffer.slice(lineStart, lineEnd).replace(/\t/g, "\u2192") + tail,
    pos: position - lineStart + head.length
  };
}
function padStart(string2, max) {
  return common$4.repeat(" ", max - string2.length) + string2;
}
function makeSnippet$1(mark, options2) {
  options2 = Object.create(options2 || null);
  if (!mark.buffer)
    return null;
  if (!options2.maxLength)
    options2.maxLength = 79;
  if (typeof options2.indent !== "number")
    options2.indent = 1;
  if (typeof options2.linesBefore !== "number")
    options2.linesBefore = 3;
  if (typeof options2.linesAfter !== "number")
    options2.linesAfter = 2;
  var re = /\r?\n|\r|\0/g;
  var lineStarts = [0];
  var lineEnds = [];
  var match;
  var foundLineNo = -1;
  while (match = re.exec(mark.buffer)) {
    lineEnds.push(match.index);
    lineStarts.push(match.index + match[0].length);
    if (mark.position <= match.index && foundLineNo < 0) {
      foundLineNo = lineStarts.length - 2;
    }
  }
  if (foundLineNo < 0)
    foundLineNo = lineStarts.length - 1;
  var result = "", i, line;
  var lineNoLength = Math.min(mark.line + options2.linesAfter, lineEnds.length).toString().length;
  var maxLineLength = options2.maxLength - (options2.indent + lineNoLength + 3);
  for (i = 1; i <= options2.linesBefore; i++) {
    if (foundLineNo - i < 0)
      break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo - i],
      lineEnds[foundLineNo - i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo - i]),
      maxLineLength
    );
    result = common$4.repeat(" ", options2.indent) + padStart((mark.line - i + 1).toString(), lineNoLength) + " | " + line.str + "\n" + result;
  }
  line = getLine(mark.buffer, lineStarts[foundLineNo], lineEnds[foundLineNo], mark.position, maxLineLength);
  result += common$4.repeat(" ", options2.indent) + padStart((mark.line + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  result += common$4.repeat("-", options2.indent + lineNoLength + 3 + line.pos) + "^\n";
  for (i = 1; i <= options2.linesAfter; i++) {
    if (foundLineNo + i >= lineEnds.length)
      break;
    line = getLine(
      mark.buffer,
      lineStarts[foundLineNo + i],
      lineEnds[foundLineNo + i],
      mark.position - (lineStarts[foundLineNo] - lineStarts[foundLineNo + i]),
      maxLineLength
    );
    result += common$4.repeat(" ", options2.indent) + padStart((mark.line + i + 1).toString(), lineNoLength) + " | " + line.str + "\n";
  }
  return result.replace(/\n$/, "");
}
var snippet = makeSnippet$1;
var core = { exports: {} };
var YAMLException$3 = exception;
var TYPE_CONSTRUCTOR_OPTIONS = [
  "kind",
  "multi",
  "resolve",
  "construct",
  "instanceOf",
  "predicate",
  "represent",
  "representName",
  "defaultStyle",
  "styleAliases"
];
var YAML_NODE_KINDS = [
  "scalar",
  "sequence",
  "mapping"
];
function compileStyleAliases(map2) {
  var result = {};
  if (map2 !== null) {
    Object.keys(map2).forEach(function(style) {
      map2[style].forEach(function(alias) {
        result[String(alias)] = style;
      });
    });
  }
  return result;
}
function Type$e(tag, options2) {
  options2 = options2 || {};
  Object.keys(options2).forEach(function(name) {
    if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
      throw new YAMLException$3('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
    }
  });
  this.options = options2;
  this.tag = tag;
  this.kind = options2["kind"] || null;
  this.resolve = options2["resolve"] || function() {
    return true;
  };
  this.construct = options2["construct"] || function(data) {
    return data;
  };
  this.instanceOf = options2["instanceOf"] || null;
  this.predicate = options2["predicate"] || null;
  this.represent = options2["represent"] || null;
  this.representName = options2["representName"] || null;
  this.defaultStyle = options2["defaultStyle"] || null;
  this.multi = options2["multi"] || false;
  this.styleAliases = compileStyleAliases(options2["styleAliases"] || null);
  if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
    throw new YAMLException$3('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
  }
}
var type = Type$e;
var YAMLException$2 = exception;
var Type$d = type;
function compileList(schema2, name) {
  var result = [];
  schema2[name].forEach(function(currentType) {
    var newIndex = result.length;
    result.forEach(function(previousType, previousIndex) {
      if (previousType.tag === currentType.tag && previousType.kind === currentType.kind && previousType.multi === currentType.multi) {
        newIndex = previousIndex;
      }
    });
    result[newIndex] = currentType;
  });
  return result;
}
function compileMap() {
  var result = {
    scalar: {},
    sequence: {},
    mapping: {},
    fallback: {},
    multi: {
      scalar: [],
      sequence: [],
      mapping: [],
      fallback: []
    }
  }, index, length;
  function collectType(type2) {
    if (type2.multi) {
      result.multi[type2.kind].push(type2);
      result.multi["fallback"].push(type2);
    } else {
      result[type2.kind][type2.tag] = result["fallback"][type2.tag] = type2;
    }
  }
  for (index = 0, length = arguments.length; index < length; index += 1) {
    arguments[index].forEach(collectType);
  }
  return result;
}
function Schema$1(definition) {
  return this.extend(definition);
}
Schema$1.prototype.extend = function extend2(definition) {
  var implicit = [];
  var explicit = [];
  if (definition instanceof Type$d) {
    explicit.push(definition);
  } else if (Array.isArray(definition)) {
    explicit = explicit.concat(definition);
  } else if (definition && (Array.isArray(definition.implicit) || Array.isArray(definition.explicit))) {
    if (definition.implicit)
      implicit = implicit.concat(definition.implicit);
    if (definition.explicit)
      explicit = explicit.concat(definition.explicit);
  } else {
    throw new YAMLException$2("Schema.extend argument should be a Type, [ Type ], or a schema definition ({ implicit: [...], explicit: [...] })");
  }
  implicit.forEach(function(type2) {
    if (!(type2 instanceof Type$d)) {
      throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
    if (type2.loadKind && type2.loadKind !== "scalar") {
      throw new YAMLException$2("There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.");
    }
    if (type2.multi) {
      throw new YAMLException$2("There is a multi type in the implicit list of a schema. Multi tags can only be listed as explicit.");
    }
  });
  explicit.forEach(function(type2) {
    if (!(type2 instanceof Type$d)) {
      throw new YAMLException$2("Specified list of YAML types (or a single Type object) contains a non-Type object.");
    }
  });
  var result = Object.create(Schema$1.prototype);
  result.implicit = (this.implicit || []).concat(implicit);
  result.explicit = (this.explicit || []).concat(explicit);
  result.compiledImplicit = compileList(result, "implicit");
  result.compiledExplicit = compileList(result, "explicit");
  result.compiledTypeMap = compileMap(result.compiledImplicit, result.compiledExplicit);
  return result;
};
var schema = Schema$1;
var Type$c = type;
var str = new Type$c("tag:yaml.org,2002:str", {
  kind: "scalar",
  construct: function(data) {
    return data !== null ? data : "";
  }
});
var Type$b = type;
var seq = new Type$b("tag:yaml.org,2002:seq", {
  kind: "sequence",
  construct: function(data) {
    return data !== null ? data : [];
  }
});
var Type$a = type;
var map = new Type$a("tag:yaml.org,2002:map", {
  kind: "mapping",
  construct: function(data) {
    return data !== null ? data : {};
  }
});
var Schema = schema;
var failsafe = new Schema({
  explicit: [
    str,
    seq,
    map
  ]
});
var Type$9 = type;
function resolveYamlNull(data) {
  if (data === null)
    return true;
  var max = data.length;
  return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
  return null;
}
function isNull(object) {
  return object === null;
}
var _null = new Type$9("tag:yaml.org,2002:null", {
  kind: "scalar",
  resolve: resolveYamlNull,
  construct: constructYamlNull,
  predicate: isNull,
  represent: {
    canonical: function() {
      return "~";
    },
    lowercase: function() {
      return "null";
    },
    uppercase: function() {
      return "NULL";
    },
    camelcase: function() {
      return "Null";
    },
    empty: function() {
      return "";
    }
  },
  defaultStyle: "lowercase"
});
var Type$8 = type;
function resolveYamlBoolean(data) {
  if (data === null)
    return false;
  var max = data.length;
  return max === 4 && (data === "true" || data === "True" || data === "TRUE") || max === 5 && (data === "false" || data === "False" || data === "FALSE");
}
function constructYamlBoolean(data) {
  return data === "true" || data === "True" || data === "TRUE";
}
function isBoolean(object) {
  return Object.prototype.toString.call(object) === "[object Boolean]";
}
var bool$1 = new Type$8("tag:yaml.org,2002:bool", {
  kind: "scalar",
  resolve: resolveYamlBoolean,
  construct: constructYamlBoolean,
  predicate: isBoolean,
  represent: {
    lowercase: function(object) {
      return object ? "true" : "false";
    },
    uppercase: function(object) {
      return object ? "TRUE" : "FALSE";
    },
    camelcase: function(object) {
      return object ? "True" : "False";
    }
  },
  defaultStyle: "lowercase"
});
var common$3 = common$5;
var Type$7 = type;
function isHexCode(c) {
  return 48 <= c && c <= 57 || 65 <= c && c <= 70 || 97 <= c && c <= 102;
}
function isOctCode(c) {
  return 48 <= c && c <= 55;
}
function isDecCode(c) {
  return 48 <= c && c <= 57;
}
function resolveYamlInteger(data) {
  if (data === null)
    return false;
  var max = data.length, index = 0, hasDigits = false, ch;
  if (!max)
    return false;
  ch = data[index];
  if (ch === "-" || ch === "+") {
    ch = data[++index];
  }
  if (ch === "0") {
    if (index + 1 === max)
      return true;
    ch = data[++index];
    if (ch === "b") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (ch !== "0" && ch !== "1")
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "x") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isHexCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
    if (ch === "o") {
      index++;
      for (; index < max; index++) {
        ch = data[index];
        if (ch === "_")
          continue;
        if (!isOctCode(data.charCodeAt(index)))
          return false;
        hasDigits = true;
      }
      return hasDigits && ch !== "_";
    }
  }
  if (ch === "_")
    return false;
  for (; index < max; index++) {
    ch = data[index];
    if (ch === "_")
      continue;
    if (!isDecCode(data.charCodeAt(index))) {
      return false;
    }
    hasDigits = true;
  }
  if (!hasDigits || ch === "_")
    return false;
  return true;
}
function constructYamlInteger(data) {
  var value = data, sign = 1, ch;
  if (value.indexOf("_") !== -1) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-")
      sign = -1;
    value = value.slice(1);
    ch = value[0];
  }
  if (value === "0")
    return 0;
  if (ch === "0") {
    if (value[1] === "b")
      return sign * parseInt(value.slice(2), 2);
    if (value[1] === "x")
      return sign * parseInt(value.slice(2), 16);
    if (value[1] === "o")
      return sign * parseInt(value.slice(2), 8);
  }
  return sign * parseInt(value, 10);
}
function isInteger(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 === 0 && !common$3.isNegativeZero(object));
}
var int = new Type$7("tag:yaml.org,2002:int", {
  kind: "scalar",
  resolve: resolveYamlInteger,
  construct: constructYamlInteger,
  predicate: isInteger,
  represent: {
    binary: function(obj) {
      return obj >= 0 ? "0b" + obj.toString(2) : "-0b" + obj.toString(2).slice(1);
    },
    octal: function(obj) {
      return obj >= 0 ? "0o" + obj.toString(8) : "-0o" + obj.toString(8).slice(1);
    },
    decimal: function(obj) {
      return obj.toString(10);
    },
    hexadecimal: function(obj) {
      return obj >= 0 ? "0x" + obj.toString(16).toUpperCase() : "-0x" + obj.toString(16).toUpperCase().slice(1);
    }
  },
  defaultStyle: "decimal",
  styleAliases: {
    binary: [2, "bin"],
    octal: [8, "oct"],
    decimal: [10, "dec"],
    hexadecimal: [16, "hex"]
  }
});
var common$2 = common$5;
var Type$6 = type;
var YAML_FLOAT_PATTERN = new RegExp(
  "^(?:[-+]?(?:[0-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?|[-+]?\\.(?:inf|Inf|INF)|\\.(?:nan|NaN|NAN))$"
);
function resolveYamlFloat(data) {
  if (data === null)
    return false;
  if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === "_") {
    return false;
  }
  return true;
}
function constructYamlFloat(data) {
  var value, sign;
  value = data.replace(/_/g, "").toLowerCase();
  sign = value[0] === "-" ? -1 : 1;
  if ("+-".indexOf(value[0]) >= 0) {
    value = value.slice(1);
  }
  if (value === ".inf") {
    return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
  } else if (value === ".nan") {
    return NaN;
  }
  return sign * parseFloat(value, 10);
}
var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
  var res;
  if (isNaN(object)) {
    switch (style) {
      case "lowercase":
        return ".nan";
      case "uppercase":
        return ".NAN";
      case "camelcase":
        return ".NaN";
    }
  } else if (Number.POSITIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return ".inf";
      case "uppercase":
        return ".INF";
      case "camelcase":
        return ".Inf";
    }
  } else if (Number.NEGATIVE_INFINITY === object) {
    switch (style) {
      case "lowercase":
        return "-.inf";
      case "uppercase":
        return "-.INF";
      case "camelcase":
        return "-.Inf";
    }
  } else if (common$2.isNegativeZero(object)) {
    return "-0.0";
  }
  res = object.toString(10);
  return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
  return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || common$2.isNegativeZero(object));
}
var float = new Type$6("tag:yaml.org,2002:float", {
  kind: "scalar",
  resolve: resolveYamlFloat,
  construct: constructYamlFloat,
  predicate: isFloat,
  represent: representYamlFloat,
  defaultStyle: "lowercase"
});
var json = failsafe.extend({
  implicit: [
    _null,
    bool$1,
    int,
    float
  ]
});
(function(module) {
  module.exports = json;
})(core);
var Type$5 = type;
var YAML_DATE_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])$"
);
var YAML_TIMESTAMP_REGEXP = new RegExp(
  "^([0-9][0-9][0-9][0-9])-([0-9][0-9]?)-([0-9][0-9]?)(?:[Tt]|[ \\t]+)([0-9][0-9]?):([0-9][0-9]):([0-9][0-9])(?:\\.([0-9]*))?(?:[ \\t]*(Z|([-+])([0-9][0-9]?)(?::([0-9][0-9]))?))?$"
);
function resolveYamlTimestamp(data) {
  if (data === null)
    return false;
  if (YAML_DATE_REGEXP.exec(data) !== null)
    return true;
  if (YAML_TIMESTAMP_REGEXP.exec(data) !== null)
    return true;
  return false;
}
function constructYamlTimestamp(data) {
  var match, year, month, day, hour, minute, second, fraction = 0, delta = null, tz_hour, tz_minute, date;
  match = YAML_DATE_REGEXP.exec(data);
  if (match === null)
    match = YAML_TIMESTAMP_REGEXP.exec(data);
  if (match === null)
    throw new Error("Date resolve error");
  year = +match[1];
  month = +match[2] - 1;
  day = +match[3];
  if (!match[4]) {
    return new Date(Date.UTC(year, month, day));
  }
  hour = +match[4];
  minute = +match[5];
  second = +match[6];
  if (match[7]) {
    fraction = match[7].slice(0, 3);
    while (fraction.length < 3) {
      fraction += "0";
    }
    fraction = +fraction;
  }
  if (match[9]) {
    tz_hour = +match[10];
    tz_minute = +(match[11] || 0);
    delta = (tz_hour * 60 + tz_minute) * 6e4;
    if (match[9] === "-")
      delta = -delta;
  }
  date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
  if (delta)
    date.setTime(date.getTime() - delta);
  return date;
}
function representYamlTimestamp(object) {
  return object.toISOString();
}
var timestamp = new Type$5("tag:yaml.org,2002:timestamp", {
  kind: "scalar",
  resolve: resolveYamlTimestamp,
  construct: constructYamlTimestamp,
  instanceOf: Date,
  represent: representYamlTimestamp
});
var Type$4 = type;
function resolveYamlMerge(data) {
  return data === "<<" || data === null;
}
var merge = new Type$4("tag:yaml.org,2002:merge", {
  kind: "scalar",
  resolve: resolveYamlMerge
});
var Type$3 = type;
var BASE64_MAP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r";
function resolveYamlBinary(data) {
  if (data === null)
    return false;
  var code, idx, bitlen = 0, max = data.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    code = map2.indexOf(data.charAt(idx));
    if (code > 64)
      continue;
    if (code < 0)
      return false;
    bitlen += 6;
  }
  return bitlen % 8 === 0;
}
function constructYamlBinary(data) {
  var idx, tailbits, input = data.replace(/[\r\n=]/g, ""), max = input.length, map2 = BASE64_MAP, bits = 0, result = [];
  for (idx = 0; idx < max; idx++) {
    if (idx % 4 === 0 && idx) {
      result.push(bits >> 16 & 255);
      result.push(bits >> 8 & 255);
      result.push(bits & 255);
    }
    bits = bits << 6 | map2.indexOf(input.charAt(idx));
  }
  tailbits = max % 4 * 6;
  if (tailbits === 0) {
    result.push(bits >> 16 & 255);
    result.push(bits >> 8 & 255);
    result.push(bits & 255);
  } else if (tailbits === 18) {
    result.push(bits >> 10 & 255);
    result.push(bits >> 2 & 255);
  } else if (tailbits === 12) {
    result.push(bits >> 4 & 255);
  }
  return new Uint8Array(result);
}
function representYamlBinary(object) {
  var result = "", bits = 0, idx, tail, max = object.length, map2 = BASE64_MAP;
  for (idx = 0; idx < max; idx++) {
    if (idx % 3 === 0 && idx) {
      result += map2[bits >> 18 & 63];
      result += map2[bits >> 12 & 63];
      result += map2[bits >> 6 & 63];
      result += map2[bits & 63];
    }
    bits = (bits << 8) + object[idx];
  }
  tail = max % 3;
  if (tail === 0) {
    result += map2[bits >> 18 & 63];
    result += map2[bits >> 12 & 63];
    result += map2[bits >> 6 & 63];
    result += map2[bits & 63];
  } else if (tail === 2) {
    result += map2[bits >> 10 & 63];
    result += map2[bits >> 4 & 63];
    result += map2[bits << 2 & 63];
    result += map2[64];
  } else if (tail === 1) {
    result += map2[bits >> 2 & 63];
    result += map2[bits << 4 & 63];
    result += map2[64];
    result += map2[64];
  }
  return result;
}
function isBinary(obj) {
  return Object.prototype.toString.call(obj) === "[object Uint8Array]";
}
var binary = new Type$3("tag:yaml.org,2002:binary", {
  kind: "scalar",
  resolve: resolveYamlBinary,
  construct: constructYamlBinary,
  predicate: isBinary,
  represent: representYamlBinary
});
var Type$2 = type;
var _hasOwnProperty$3 = Object.prototype.hasOwnProperty;
var _toString$2 = Object.prototype.toString;
function resolveYamlOmap(data) {
  if (data === null)
    return true;
  var objectKeys = [], index, length, pair, pairKey, pairHasKey, object = data;
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    pairHasKey = false;
    if (_toString$2.call(pair) !== "[object Object]")
      return false;
    for (pairKey in pair) {
      if (_hasOwnProperty$3.call(pair, pairKey)) {
        if (!pairHasKey)
          pairHasKey = true;
        else
          return false;
      }
    }
    if (!pairHasKey)
      return false;
    if (objectKeys.indexOf(pairKey) === -1)
      objectKeys.push(pairKey);
    else
      return false;
  }
  return true;
}
function constructYamlOmap(data) {
  return data !== null ? data : [];
}
var omap = new Type$2("tag:yaml.org,2002:omap", {
  kind: "sequence",
  resolve: resolveYamlOmap,
  construct: constructYamlOmap
});
var Type$1 = type;
var _toString$1 = Object.prototype.toString;
function resolveYamlPairs(data) {
  if (data === null)
    return true;
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    if (_toString$1.call(pair) !== "[object Object]")
      return false;
    keys = Object.keys(pair);
    if (keys.length !== 1)
      return false;
    result[index] = [keys[0], pair[keys[0]]];
  }
  return true;
}
function constructYamlPairs(data) {
  if (data === null)
    return [];
  var index, length, pair, keys, result, object = data;
  result = new Array(object.length);
  for (index = 0, length = object.length; index < length; index += 1) {
    pair = object[index];
    keys = Object.keys(pair);
    result[index] = [keys[0], pair[keys[0]]];
  }
  return result;
}
var pairs = new Type$1("tag:yaml.org,2002:pairs", {
  kind: "sequence",
  resolve: resolveYamlPairs,
  construct: constructYamlPairs
});
var Type = type;
var _hasOwnProperty$2 = Object.prototype.hasOwnProperty;
function resolveYamlSet(data) {
  if (data === null)
    return true;
  var key, object = data;
  for (key in object) {
    if (_hasOwnProperty$2.call(object, key)) {
      if (object[key] !== null)
        return false;
    }
  }
  return true;
}
function constructYamlSet(data) {
  return data !== null ? data : {};
}
var set = new Type("tag:yaml.org,2002:set", {
  kind: "mapping",
  resolve: resolveYamlSet,
  construct: constructYamlSet
});
var _default = core.exports.extend({
  implicit: [
    timestamp,
    merge
  ],
  explicit: [
    binary,
    omap,
    pairs,
    set
  ]
});
var common$1 = common$5;
var YAMLException$1 = exception;
var makeSnippet = snippet;
var DEFAULT_SCHEMA$1 = _default;
var _hasOwnProperty$1 = Object.prototype.hasOwnProperty;
var CONTEXT_FLOW_IN = 1;
var CONTEXT_FLOW_OUT = 2;
var CONTEXT_BLOCK_IN = 3;
var CONTEXT_BLOCK_OUT = 4;
var CHOMPING_CLIP = 1;
var CHOMPING_STRIP = 2;
var CHOMPING_KEEP = 3;
var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
function _class(obj) {
  return Object.prototype.toString.call(obj);
}
function is_EOL(c) {
  return c === 10 || c === 13;
}
function is_WHITE_SPACE(c) {
  return c === 9 || c === 32;
}
function is_WS_OR_EOL(c) {
  return c === 9 || c === 32 || c === 10 || c === 13;
}
function is_FLOW_INDICATOR(c) {
  return c === 44 || c === 91 || c === 93 || c === 123 || c === 125;
}
function fromHexCode(c) {
  var lc;
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  lc = c | 32;
  if (97 <= lc && lc <= 102) {
    return lc - 97 + 10;
  }
  return -1;
}
function escapedHexLen(c) {
  if (c === 120) {
    return 2;
  }
  if (c === 117) {
    return 4;
  }
  if (c === 85) {
    return 8;
  }
  return 0;
}
function fromDecimalCode(c) {
  if (48 <= c && c <= 57) {
    return c - 48;
  }
  return -1;
}
function simpleEscapeSequence(c) {
  return c === 48 ? "\0" : c === 97 ? "\x07" : c === 98 ? "\b" : c === 116 ? "	" : c === 9 ? "	" : c === 110 ? "\n" : c === 118 ? "\v" : c === 102 ? "\f" : c === 114 ? "\r" : c === 101 ? "\x1B" : c === 32 ? " " : c === 34 ? '"' : c === 47 ? "/" : c === 92 ? "\\" : c === 78 ? "\x85" : c === 95 ? "\xA0" : c === 76 ? "\u2028" : c === 80 ? "\u2029" : "";
}
function charFromCodepoint(c) {
  if (c <= 65535) {
    return String.fromCharCode(c);
  }
  return String.fromCharCode(
    (c - 65536 >> 10) + 55296,
    (c - 65536 & 1023) + 56320
  );
}
var simpleEscapeCheck = new Array(256);
var simpleEscapeMap = new Array(256);
for (var i = 0; i < 256; i++) {
  simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
  simpleEscapeMap[i] = simpleEscapeSequence(i);
}
function State$1(input, options2) {
  this.input = input;
  this.filename = options2["filename"] || null;
  this.schema = options2["schema"] || DEFAULT_SCHEMA$1;
  this.onWarning = options2["onWarning"] || null;
  this.legacy = options2["legacy"] || false;
  this.json = options2["json"] || false;
  this.listener = options2["listener"] || null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.typeMap = this.schema.compiledTypeMap;
  this.length = input.length;
  this.position = 0;
  this.line = 0;
  this.lineStart = 0;
  this.lineIndent = 0;
  this.firstTabInLine = -1;
  this.documents = [];
}
function generateError(state, message) {
  var mark = {
    name: state.filename,
    buffer: state.input.slice(0, -1),
    position: state.position,
    line: state.line,
    column: state.position - state.lineStart
  };
  mark.snippet = makeSnippet(mark);
  return new YAMLException$1(message, mark);
}
function throwError(state, message) {
  throw generateError(state, message);
}
function throwWarning(state, message) {
  if (state.onWarning) {
    state.onWarning.call(null, generateError(state, message));
  }
}
var directiveHandlers = {
  YAML: function handleYamlDirective(state, name, args) {
    var match, major, minor;
    if (state.version !== null) {
      throwError(state, "duplication of %YAML directive");
    }
    if (args.length !== 1) {
      throwError(state, "YAML directive accepts exactly one argument");
    }
    match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
    if (match === null) {
      throwError(state, "ill-formed argument of the YAML directive");
    }
    major = parseInt(match[1], 10);
    minor = parseInt(match[2], 10);
    if (major !== 1) {
      throwError(state, "unacceptable YAML version of the document");
    }
    state.version = args[0];
    state.checkLineBreaks = minor < 2;
    if (minor !== 1 && minor !== 2) {
      throwWarning(state, "unsupported YAML version of the document");
    }
  },
  TAG: function handleTagDirective(state, name, args) {
    var handle, prefix;
    if (args.length !== 2) {
      throwError(state, "TAG directive accepts exactly two arguments");
    }
    handle = args[0];
    prefix = args[1];
    if (!PATTERN_TAG_HANDLE.test(handle)) {
      throwError(state, "ill-formed tag handle (first argument) of the TAG directive");
    }
    if (_hasOwnProperty$1.call(state.tagMap, handle)) {
      throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
    }
    if (!PATTERN_TAG_URI.test(prefix)) {
      throwError(state, "ill-formed tag prefix (second argument) of the TAG directive");
    }
    try {
      prefix = decodeURIComponent(prefix);
    } catch (err) {
      throwError(state, "tag prefix is malformed: " + prefix);
    }
    state.tagMap[handle] = prefix;
  }
};
function captureSegment(state, start, end, checkJson) {
  var _position, _length, _character, _result;
  if (start < end) {
    _result = state.input.slice(start, end);
    if (checkJson) {
      for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
        _character = _result.charCodeAt(_position);
        if (!(_character === 9 || 32 <= _character && _character <= 1114111)) {
          throwError(state, "expected valid JSON character");
        }
      }
    } else if (PATTERN_NON_PRINTABLE.test(_result)) {
      throwError(state, "the stream contains non-printable characters");
    }
    state.result += _result;
  }
}
function mergeMappings(state, destination, source, overridableKeys) {
  var sourceKeys, key, index, quantity;
  if (!common$1.isObject(source)) {
    throwError(state, "cannot merge mappings; the provided source object is unacceptable");
  }
  sourceKeys = Object.keys(source);
  for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
    key = sourceKeys[index];
    if (!_hasOwnProperty$1.call(destination, key)) {
      destination[key] = source[key];
      overridableKeys[key] = true;
    }
  }
}
function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startLineStart, startPos) {
  var index, quantity;
  if (Array.isArray(keyNode)) {
    keyNode = Array.prototype.slice.call(keyNode);
    for (index = 0, quantity = keyNode.length; index < quantity; index += 1) {
      if (Array.isArray(keyNode[index])) {
        throwError(state, "nested arrays are not supported inside keys");
      }
      if (typeof keyNode === "object" && _class(keyNode[index]) === "[object Object]") {
        keyNode[index] = "[object Object]";
      }
    }
  }
  if (typeof keyNode === "object" && _class(keyNode) === "[object Object]") {
    keyNode = "[object Object]";
  }
  keyNode = String(keyNode);
  if (_result === null) {
    _result = {};
  }
  if (keyTag === "tag:yaml.org,2002:merge") {
    if (Array.isArray(valueNode)) {
      for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
        mergeMappings(state, _result, valueNode[index], overridableKeys);
      }
    } else {
      mergeMappings(state, _result, valueNode, overridableKeys);
    }
  } else {
    if (!state.json && !_hasOwnProperty$1.call(overridableKeys, keyNode) && _hasOwnProperty$1.call(_result, keyNode)) {
      state.line = startLine || state.line;
      state.lineStart = startLineStart || state.lineStart;
      state.position = startPos || state.position;
      throwError(state, "duplicated mapping key");
    }
    if (keyNode === "__proto__") {
      Object.defineProperty(_result, keyNode, {
        configurable: true,
        enumerable: true,
        writable: true,
        value: valueNode
      });
    } else {
      _result[keyNode] = valueNode;
    }
    delete overridableKeys[keyNode];
  }
  return _result;
}
function readLineBreak(state) {
  var ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 10) {
    state.position++;
  } else if (ch === 13) {
    state.position++;
    if (state.input.charCodeAt(state.position) === 10) {
      state.position++;
    }
  } else {
    throwError(state, "a line break is expected");
  }
  state.line += 1;
  state.lineStart = state.position;
  state.firstTabInLine = -1;
}
function skipSeparationSpace(state, allowComments, checkIndent) {
  var lineBreaks = 0, ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    while (is_WHITE_SPACE(ch)) {
      if (ch === 9 && state.firstTabInLine === -1) {
        state.firstTabInLine = state.position;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    if (allowComments && ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 10 && ch !== 13 && ch !== 0);
    }
    if (is_EOL(ch)) {
      readLineBreak(state);
      ch = state.input.charCodeAt(state.position);
      lineBreaks++;
      state.lineIndent = 0;
      while (ch === 32) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
    } else {
      break;
    }
  }
  if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
    throwWarning(state, "deficient indentation");
  }
  return lineBreaks;
}
function testDocumentSeparator(state) {
  var _position = state.position, ch;
  ch = state.input.charCodeAt(_position);
  if ((ch === 45 || ch === 46) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
    _position += 3;
    ch = state.input.charCodeAt(_position);
    if (ch === 0 || is_WS_OR_EOL(ch)) {
      return true;
    }
  }
  return false;
}
function writeFoldedLines(state, count) {
  if (count === 1) {
    state.result += " ";
  } else if (count > 1) {
    state.result += common$1.repeat("\n", count - 1);
  }
}
function readPlainScalar(state, nodeIndent, withinFlowCollection) {
  var preceding, following, captureStart, captureEnd, hasPendingContent, _line, _lineStart, _lineIndent, _kind = state.kind, _result = state.result, ch;
  ch = state.input.charCodeAt(state.position);
  if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 35 || ch === 38 || ch === 42 || ch === 33 || ch === 124 || ch === 62 || ch === 39 || ch === 34 || ch === 37 || ch === 64 || ch === 96) {
    return false;
  }
  if (ch === 63 || ch === 45) {
    following = state.input.charCodeAt(state.position + 1);
    if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
      return false;
    }
  }
  state.kind = "scalar";
  state.result = "";
  captureStart = captureEnd = state.position;
  hasPendingContent = false;
  while (ch !== 0) {
    if (ch === 58) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        break;
      }
    } else if (ch === 35) {
      preceding = state.input.charCodeAt(state.position - 1);
      if (is_WS_OR_EOL(preceding)) {
        break;
      }
    } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
      break;
    } else if (is_EOL(ch)) {
      _line = state.line;
      _lineStart = state.lineStart;
      _lineIndent = state.lineIndent;
      skipSeparationSpace(state, false, -1);
      if (state.lineIndent >= nodeIndent) {
        hasPendingContent = true;
        ch = state.input.charCodeAt(state.position);
        continue;
      } else {
        state.position = captureEnd;
        state.line = _line;
        state.lineStart = _lineStart;
        state.lineIndent = _lineIndent;
        break;
      }
    }
    if (hasPendingContent) {
      captureSegment(state, captureStart, captureEnd, false);
      writeFoldedLines(state, state.line - _line);
      captureStart = captureEnd = state.position;
      hasPendingContent = false;
    }
    if (!is_WHITE_SPACE(ch)) {
      captureEnd = state.position + 1;
    }
    ch = state.input.charCodeAt(++state.position);
  }
  captureSegment(state, captureStart, captureEnd, false);
  if (state.result) {
    return true;
  }
  state.kind = _kind;
  state.result = _result;
  return false;
}
function readSingleQuotedScalar(state, nodeIndent) {
  var ch, captureStart, captureEnd;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 39) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 39) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (ch === 39) {
        captureStart = state.position;
        state.position++;
        captureEnd = state.position;
      } else {
        return true;
      }
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a single quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a single quoted scalar");
}
function readDoubleQuotedScalar(state, nodeIndent) {
  var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 34) {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  state.position++;
  captureStart = captureEnd = state.position;
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    if (ch === 34) {
      captureSegment(state, captureStart, state.position, true);
      state.position++;
      return true;
    } else if (ch === 92) {
      captureSegment(state, captureStart, state.position, true);
      ch = state.input.charCodeAt(++state.position);
      if (is_EOL(ch)) {
        skipSeparationSpace(state, false, nodeIndent);
      } else if (ch < 256 && simpleEscapeCheck[ch]) {
        state.result += simpleEscapeMap[ch];
        state.position++;
      } else if ((tmp = escapedHexLen(ch)) > 0) {
        hexLength = tmp;
        hexResult = 0;
        for (; hexLength > 0; hexLength--) {
          ch = state.input.charCodeAt(++state.position);
          if ((tmp = fromHexCode(ch)) >= 0) {
            hexResult = (hexResult << 4) + tmp;
          } else {
            throwError(state, "expected hexadecimal character");
          }
        }
        state.result += charFromCodepoint(hexResult);
        state.position++;
      } else {
        throwError(state, "unknown escape sequence");
      }
      captureStart = captureEnd = state.position;
    } else if (is_EOL(ch)) {
      captureSegment(state, captureStart, captureEnd, true);
      writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
      captureStart = captureEnd = state.position;
    } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
      throwError(state, "unexpected end of the document within a double quoted scalar");
    } else {
      state.position++;
      captureEnd = state.position;
    }
  }
  throwError(state, "unexpected end of the stream within a double quoted scalar");
}
function readFlowCollection(state, nodeIndent) {
  var readNext = true, _line, _lineStart, _pos, _tag = state.tag, _result, _anchor = state.anchor, following, terminator, isPair, isExplicitPair, isMapping, overridableKeys = /* @__PURE__ */ Object.create(null), keyNode, keyTag, valueNode, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 91) {
    terminator = 93;
    isMapping = false;
    _result = [];
  } else if (ch === 123) {
    terminator = 125;
    isMapping = true;
    _result = {};
  } else {
    return false;
  }
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(++state.position);
  while (ch !== 0) {
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === terminator) {
      state.position++;
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = isMapping ? "mapping" : "sequence";
      state.result = _result;
      return true;
    } else if (!readNext) {
      throwError(state, "missed comma between flow collection entries");
    } else if (ch === 44) {
      throwError(state, "expected the node content, but found ','");
    }
    keyTag = keyNode = valueNode = null;
    isPair = isExplicitPair = false;
    if (ch === 63) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following)) {
        isPair = isExplicitPair = true;
        state.position++;
        skipSeparationSpace(state, true, nodeIndent);
      }
    }
    _line = state.line;
    _lineStart = state.lineStart;
    _pos = state.position;
    composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
    keyTag = state.tag;
    keyNode = state.result;
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if ((isExplicitPair || state.line === _line) && ch === 58) {
      isPair = true;
      ch = state.input.charCodeAt(++state.position);
      skipSeparationSpace(state, true, nodeIndent);
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      valueNode = state.result;
    }
    if (isMapping) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos);
    } else if (isPair) {
      _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode, _line, _lineStart, _pos));
    } else {
      _result.push(keyNode);
    }
    skipSeparationSpace(state, true, nodeIndent);
    ch = state.input.charCodeAt(state.position);
    if (ch === 44) {
      readNext = true;
      ch = state.input.charCodeAt(++state.position);
    } else {
      readNext = false;
    }
  }
  throwError(state, "unexpected end of the stream within a flow collection");
}
function readBlockScalar(state, nodeIndent) {
  var captureStart, folding, chomping = CHOMPING_CLIP, didReadContent = false, detectedIndent = false, textIndent = nodeIndent, emptyLines = 0, atMoreIndented = false, tmp, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch === 124) {
    folding = false;
  } else if (ch === 62) {
    folding = true;
  } else {
    return false;
  }
  state.kind = "scalar";
  state.result = "";
  while (ch !== 0) {
    ch = state.input.charCodeAt(++state.position);
    if (ch === 43 || ch === 45) {
      if (CHOMPING_CLIP === chomping) {
        chomping = ch === 43 ? CHOMPING_KEEP : CHOMPING_STRIP;
      } else {
        throwError(state, "repeat of a chomping mode identifier");
      }
    } else if ((tmp = fromDecimalCode(ch)) >= 0) {
      if (tmp === 0) {
        throwError(state, "bad explicit indentation width of a block scalar; it cannot be less than one");
      } else if (!detectedIndent) {
        textIndent = nodeIndent + tmp - 1;
        detectedIndent = true;
      } else {
        throwError(state, "repeat of an indentation width identifier");
      }
    } else {
      break;
    }
  }
  if (is_WHITE_SPACE(ch)) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (is_WHITE_SPACE(ch));
    if (ch === 35) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (!is_EOL(ch) && ch !== 0);
    }
  }
  while (ch !== 0) {
    readLineBreak(state);
    state.lineIndent = 0;
    ch = state.input.charCodeAt(state.position);
    while ((!detectedIndent || state.lineIndent < textIndent) && ch === 32) {
      state.lineIndent++;
      ch = state.input.charCodeAt(++state.position);
    }
    if (!detectedIndent && state.lineIndent > textIndent) {
      textIndent = state.lineIndent;
    }
    if (is_EOL(ch)) {
      emptyLines++;
      continue;
    }
    if (state.lineIndent < textIndent) {
      if (chomping === CHOMPING_KEEP) {
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (chomping === CHOMPING_CLIP) {
        if (didReadContent) {
          state.result += "\n";
        }
      }
      break;
    }
    if (folding) {
      if (is_WHITE_SPACE(ch)) {
        atMoreIndented = true;
        state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
      } else if (atMoreIndented) {
        atMoreIndented = false;
        state.result += common$1.repeat("\n", emptyLines + 1);
      } else if (emptyLines === 0) {
        if (didReadContent) {
          state.result += " ";
        }
      } else {
        state.result += common$1.repeat("\n", emptyLines);
      }
    } else {
      state.result += common$1.repeat("\n", didReadContent ? 1 + emptyLines : emptyLines);
    }
    didReadContent = true;
    detectedIndent = true;
    emptyLines = 0;
    captureStart = state.position;
    while (!is_EOL(ch) && ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, state.position, false);
  }
  return true;
}
function readBlockSequence(state, nodeIndent) {
  var _line, _tag = state.tag, _anchor = state.anchor, _result = [], following, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    if (ch !== 45) {
      break;
    }
    following = state.input.charCodeAt(state.position + 1);
    if (!is_WS_OR_EOL(following)) {
      break;
    }
    detected = true;
    state.position++;
    if (skipSeparationSpace(state, true, -1)) {
      if (state.lineIndent <= nodeIndent) {
        _result.push(null);
        ch = state.input.charCodeAt(state.position);
        continue;
      }
    }
    _line = state.line;
    composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
    _result.push(state.result);
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a sequence entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "sequence";
    state.result = _result;
    return true;
  }
  return false;
}
function readBlockMapping(state, nodeIndent, flowIndent) {
  var following, allowCompact, _line, _keyLine, _keyLineStart, _keyPos, _tag = state.tag, _anchor = state.anchor, _result = {}, overridableKeys = /* @__PURE__ */ Object.create(null), keyTag = null, keyNode = null, valueNode = null, atExplicitKey = false, detected = false, ch;
  if (state.firstTabInLine !== -1)
    return false;
  if (state.anchor !== null) {
    state.anchorMap[state.anchor] = _result;
  }
  ch = state.input.charCodeAt(state.position);
  while (ch !== 0) {
    if (!atExplicitKey && state.firstTabInLine !== -1) {
      state.position = state.firstTabInLine;
      throwError(state, "tab characters must not be used in indentation");
    }
    following = state.input.charCodeAt(state.position + 1);
    _line = state.line;
    if ((ch === 63 || ch === 58) && is_WS_OR_EOL(following)) {
      if (ch === 63) {
        if (atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
          keyTag = keyNode = valueNode = null;
        }
        detected = true;
        atExplicitKey = true;
        allowCompact = true;
      } else if (atExplicitKey) {
        atExplicitKey = false;
        allowCompact = true;
      } else {
        throwError(state, "incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line");
      }
      state.position += 1;
      ch = following;
    } else {
      _keyLine = state.line;
      _keyLineStart = state.lineStart;
      _keyPos = state.position;
      if (!composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        break;
      }
      if (state.line === _line) {
        ch = state.input.charCodeAt(state.position);
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 58) {
          ch = state.input.charCodeAt(++state.position);
          if (!is_WS_OR_EOL(ch)) {
            throwError(state, "a whitespace character is expected after the key-value separator within a block mapping");
          }
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = false;
          allowCompact = false;
          keyTag = state.tag;
          keyNode = state.result;
        } else if (detected) {
          throwError(state, "can not read an implicit mapping pair; a colon is missed");
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else if (detected) {
        throwError(state, "can not read a block mapping entry; a multiline key may not be an implicit key");
      } else {
        state.tag = _tag;
        state.anchor = _anchor;
        return true;
      }
    }
    if (state.line === _line || state.lineIndent > nodeIndent) {
      if (atExplicitKey) {
        _keyLine = state.line;
        _keyLineStart = state.lineStart;
        _keyPos = state.position;
      }
      if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
        if (atExplicitKey) {
          keyNode = state.result;
        } else {
          valueNode = state.result;
        }
      }
      if (!atExplicitKey) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _keyLine, _keyLineStart, _keyPos);
        keyTag = keyNode = valueNode = null;
      }
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
    }
    if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
      throwError(state, "bad indentation of a mapping entry");
    } else if (state.lineIndent < nodeIndent) {
      break;
    }
  }
  if (atExplicitKey) {
    storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null, _keyLine, _keyLineStart, _keyPos);
  }
  if (detected) {
    state.tag = _tag;
    state.anchor = _anchor;
    state.kind = "mapping";
    state.result = _result;
  }
  return detected;
}
function readTagProperty(state) {
  var _position, isVerbatim = false, isNamed = false, tagHandle, tagName, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 33)
    return false;
  if (state.tag !== null) {
    throwError(state, "duplication of a tag property");
  }
  ch = state.input.charCodeAt(++state.position);
  if (ch === 60) {
    isVerbatim = true;
    ch = state.input.charCodeAt(++state.position);
  } else if (ch === 33) {
    isNamed = true;
    tagHandle = "!!";
    ch = state.input.charCodeAt(++state.position);
  } else {
    tagHandle = "!";
  }
  _position = state.position;
  if (isVerbatim) {
    do {
      ch = state.input.charCodeAt(++state.position);
    } while (ch !== 0 && ch !== 62);
    if (state.position < state.length) {
      tagName = state.input.slice(_position, state.position);
      ch = state.input.charCodeAt(++state.position);
    } else {
      throwError(state, "unexpected end of the stream within a verbatim tag");
    }
  } else {
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      if (ch === 33) {
        if (!isNamed) {
          tagHandle = state.input.slice(_position - 1, state.position + 1);
          if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
            throwError(state, "named tag handle cannot contain such characters");
          }
          isNamed = true;
          _position = state.position + 1;
        } else {
          throwError(state, "tag suffix cannot contain exclamation marks");
        }
      }
      ch = state.input.charCodeAt(++state.position);
    }
    tagName = state.input.slice(_position, state.position);
    if (PATTERN_FLOW_INDICATORS.test(tagName)) {
      throwError(state, "tag suffix cannot contain flow indicator characters");
    }
  }
  if (tagName && !PATTERN_TAG_URI.test(tagName)) {
    throwError(state, "tag name cannot contain such characters: " + tagName);
  }
  try {
    tagName = decodeURIComponent(tagName);
  } catch (err) {
    throwError(state, "tag name is malformed: " + tagName);
  }
  if (isVerbatim) {
    state.tag = tagName;
  } else if (_hasOwnProperty$1.call(state.tagMap, tagHandle)) {
    state.tag = state.tagMap[tagHandle] + tagName;
  } else if (tagHandle === "!") {
    state.tag = "!" + tagName;
  } else if (tagHandle === "!!") {
    state.tag = "tag:yaml.org,2002:" + tagName;
  } else {
    throwError(state, 'undeclared tag handle "' + tagHandle + '"');
  }
  return true;
}
function readAnchorProperty(state) {
  var _position, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 38)
    return false;
  if (state.anchor !== null) {
    throwError(state, "duplication of an anchor property");
  }
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an anchor node must contain at least one character");
  }
  state.anchor = state.input.slice(_position, state.position);
  return true;
}
function readAlias(state) {
  var _position, alias, ch;
  ch = state.input.charCodeAt(state.position);
  if (ch !== 42)
    return false;
  ch = state.input.charCodeAt(++state.position);
  _position = state.position;
  while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
    ch = state.input.charCodeAt(++state.position);
  }
  if (state.position === _position) {
    throwError(state, "name of an alias node must contain at least one character");
  }
  alias = state.input.slice(_position, state.position);
  if (!_hasOwnProperty$1.call(state.anchorMap, alias)) {
    throwError(state, 'unidentified alias "' + alias + '"');
  }
  state.result = state.anchorMap[alias];
  skipSeparationSpace(state, true, -1);
  return true;
}
function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
  var allowBlockStyles, allowBlockScalars, allowBlockCollections, indentStatus = 1, atNewLine = false, hasContent = false, typeIndex, typeQuantity, typeList, type2, flowIndent, blockIndent;
  if (state.listener !== null) {
    state.listener("open", state);
  }
  state.tag = null;
  state.anchor = null;
  state.kind = null;
  state.result = null;
  allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
  if (allowToSeek) {
    if (skipSeparationSpace(state, true, -1)) {
      atNewLine = true;
      if (state.lineIndent > parentIndent) {
        indentStatus = 1;
      } else if (state.lineIndent === parentIndent) {
        indentStatus = 0;
      } else if (state.lineIndent < parentIndent) {
        indentStatus = -1;
      }
    }
  }
  if (indentStatus === 1) {
    while (readTagProperty(state) || readAnchorProperty(state)) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        allowBlockCollections = allowBlockStyles;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      } else {
        allowBlockCollections = false;
      }
    }
  }
  if (allowBlockCollections) {
    allowBlockCollections = atNewLine || allowCompact;
  }
  if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
    if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
      flowIndent = parentIndent;
    } else {
      flowIndent = parentIndent + 1;
    }
    blockIndent = state.position - state.lineStart;
    if (indentStatus === 1) {
      if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
        hasContent = true;
      } else {
        if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
          hasContent = true;
        } else if (readAlias(state)) {
          hasContent = true;
          if (state.tag !== null || state.anchor !== null) {
            throwError(state, "alias node should not have any properties");
          }
        } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
          hasContent = true;
          if (state.tag === null) {
            state.tag = "?";
          }
        }
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
      }
    } else if (indentStatus === 0) {
      hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
    }
  }
  if (state.tag === null) {
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = state.result;
    }
  } else if (state.tag === "?") {
    if (state.result !== null && state.kind !== "scalar") {
      throwError(state, 'unacceptable node kind for !<?> tag; it should be "scalar", not "' + state.kind + '"');
    }
    for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
      type2 = state.implicitTypes[typeIndex];
      if (type2.resolve(state.result)) {
        state.result = type2.construct(state.result);
        state.tag = type2.tag;
        if (state.anchor !== null) {
          state.anchorMap[state.anchor] = state.result;
        }
        break;
      }
    }
  } else if (state.tag !== "!") {
    if (_hasOwnProperty$1.call(state.typeMap[state.kind || "fallback"], state.tag)) {
      type2 = state.typeMap[state.kind || "fallback"][state.tag];
    } else {
      type2 = null;
      typeList = state.typeMap.multi[state.kind || "fallback"];
      for (typeIndex = 0, typeQuantity = typeList.length; typeIndex < typeQuantity; typeIndex += 1) {
        if (state.tag.slice(0, typeList[typeIndex].tag.length) === typeList[typeIndex].tag) {
          type2 = typeList[typeIndex];
          break;
        }
      }
    }
    if (!type2) {
      throwError(state, "unknown tag !<" + state.tag + ">");
    }
    if (state.result !== null && type2.kind !== state.kind) {
      throwError(state, "unacceptable node kind for !<" + state.tag + '> tag; it should be "' + type2.kind + '", not "' + state.kind + '"');
    }
    if (!type2.resolve(state.result, state.tag)) {
      throwError(state, "cannot resolve a node with !<" + state.tag + "> explicit tag");
    } else {
      state.result = type2.construct(state.result, state.tag);
      if (state.anchor !== null) {
        state.anchorMap[state.anchor] = state.result;
      }
    }
  }
  if (state.listener !== null) {
    state.listener("close", state);
  }
  return state.tag !== null || state.anchor !== null || hasContent;
}
function readDocument(state) {
  var documentStart = state.position, _position, directiveName, directiveArgs, hasDirectives = false, ch;
  state.version = null;
  state.checkLineBreaks = state.legacy;
  state.tagMap = /* @__PURE__ */ Object.create(null);
  state.anchorMap = /* @__PURE__ */ Object.create(null);
  while ((ch = state.input.charCodeAt(state.position)) !== 0) {
    skipSeparationSpace(state, true, -1);
    ch = state.input.charCodeAt(state.position);
    if (state.lineIndent > 0 || ch !== 37) {
      break;
    }
    hasDirectives = true;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    directiveName = state.input.slice(_position, state.position);
    directiveArgs = [];
    if (directiveName.length < 1) {
      throwError(state, "directive name must not be less than one character in length");
    }
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (ch === 35) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0 && !is_EOL(ch));
        break;
      }
      if (is_EOL(ch))
        break;
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveArgs.push(state.input.slice(_position, state.position));
    }
    if (ch !== 0)
      readLineBreak(state);
    if (_hasOwnProperty$1.call(directiveHandlers, directiveName)) {
      directiveHandlers[directiveName](state, directiveName, directiveArgs);
    } else {
      throwWarning(state, 'unknown document directive "' + directiveName + '"');
    }
  }
  skipSeparationSpace(state, true, -1);
  if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 45 && state.input.charCodeAt(state.position + 1) === 45 && state.input.charCodeAt(state.position + 2) === 45) {
    state.position += 3;
    skipSeparationSpace(state, true, -1);
  } else if (hasDirectives) {
    throwError(state, "directives end mark is expected");
  }
  composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
  skipSeparationSpace(state, true, -1);
  if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
    throwWarning(state, "non-ASCII line breaks are interpreted as content");
  }
  state.documents.push(state.result);
  if (state.position === state.lineStart && testDocumentSeparator(state)) {
    if (state.input.charCodeAt(state.position) === 46) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    }
    return;
  }
  if (state.position < state.length - 1) {
    throwError(state, "end of the stream or a document separator is expected");
  } else {
    return;
  }
}
function loadDocuments(input, options2) {
  input = String(input);
  options2 = options2 || {};
  if (input.length !== 0) {
    if (input.charCodeAt(input.length - 1) !== 10 && input.charCodeAt(input.length - 1) !== 13) {
      input += "\n";
    }
    if (input.charCodeAt(0) === 65279) {
      input = input.slice(1);
    }
  }
  var state = new State$1(input, options2);
  var nullpos = input.indexOf("\0");
  if (nullpos !== -1) {
    state.position = nullpos;
    throwError(state, "null byte is not allowed in input");
  }
  state.input += "\0";
  while (state.input.charCodeAt(state.position) === 32) {
    state.lineIndent += 1;
    state.position += 1;
  }
  while (state.position < state.length - 1) {
    readDocument(state);
  }
  return state.documents;
}
function loadAll(input, iterator, options2) {
  if (iterator !== null && typeof iterator === "object" && typeof options2 === "undefined") {
    options2 = iterator;
    iterator = null;
  }
  var documents = loadDocuments(input, options2);
  if (typeof iterator !== "function") {
    return documents;
  }
  for (var index = 0, length = documents.length; index < length; index += 1) {
    iterator(documents[index]);
  }
}
function load(input, options2) {
  var documents = loadDocuments(input, options2);
  if (documents.length === 0) {
    return void 0;
  } else if (documents.length === 1) {
    return documents[0];
  }
  throw new YAMLException$1("expected a single document in the stream, but found more");
}
loader$1.loadAll = loadAll;
loader$1.load = load;
var dumper$1 = {};
var common = common$5;
var YAMLException = exception;
var DEFAULT_SCHEMA = _default;
var _toString = Object.prototype.toString;
var _hasOwnProperty = Object.prototype.hasOwnProperty;
var CHAR_BOM = 65279;
var CHAR_TAB = 9;
var CHAR_LINE_FEED = 10;
var CHAR_CARRIAGE_RETURN = 13;
var CHAR_SPACE = 32;
var CHAR_EXCLAMATION = 33;
var CHAR_DOUBLE_QUOTE = 34;
var CHAR_SHARP = 35;
var CHAR_PERCENT = 37;
var CHAR_AMPERSAND = 38;
var CHAR_SINGLE_QUOTE = 39;
var CHAR_ASTERISK = 42;
var CHAR_COMMA = 44;
var CHAR_MINUS = 45;
var CHAR_COLON = 58;
var CHAR_EQUALS = 61;
var CHAR_GREATER_THAN = 62;
var CHAR_QUESTION = 63;
var CHAR_COMMERCIAL_AT = 64;
var CHAR_LEFT_SQUARE_BRACKET = 91;
var CHAR_RIGHT_SQUARE_BRACKET = 93;
var CHAR_GRAVE_ACCENT = 96;
var CHAR_LEFT_CURLY_BRACKET = 123;
var CHAR_VERTICAL_LINE = 124;
var CHAR_RIGHT_CURLY_BRACKET = 125;
var ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0] = "\\0";
ESCAPE_SEQUENCES[7] = "\\a";
ESCAPE_SEQUENCES[8] = "\\b";
ESCAPE_SEQUENCES[9] = "\\t";
ESCAPE_SEQUENCES[10] = "\\n";
ESCAPE_SEQUENCES[11] = "\\v";
ESCAPE_SEQUENCES[12] = "\\f";
ESCAPE_SEQUENCES[13] = "\\r";
ESCAPE_SEQUENCES[27] = "\\e";
ESCAPE_SEQUENCES[34] = '\\"';
ESCAPE_SEQUENCES[92] = "\\\\";
ESCAPE_SEQUENCES[133] = "\\N";
ESCAPE_SEQUENCES[160] = "\\_";
ESCAPE_SEQUENCES[8232] = "\\L";
ESCAPE_SEQUENCES[8233] = "\\P";
var DEPRECATED_BOOLEANS_SYNTAX = [
  "y",
  "Y",
  "yes",
  "Yes",
  "YES",
  "on",
  "On",
  "ON",
  "n",
  "N",
  "no",
  "No",
  "NO",
  "off",
  "Off",
  "OFF"
];
var DEPRECATED_BASE60_SYNTAX = /^[-+]?[0-9_]+(?::[0-9_]+)+(?:\.[0-9_]*)?$/;
function compileStyleMap(schema2, map2) {
  var result, keys, index, length, tag, style, type2;
  if (map2 === null)
    return {};
  result = {};
  keys = Object.keys(map2);
  for (index = 0, length = keys.length; index < length; index += 1) {
    tag = keys[index];
    style = String(map2[tag]);
    if (tag.slice(0, 2) === "!!") {
      tag = "tag:yaml.org,2002:" + tag.slice(2);
    }
    type2 = schema2.compiledTypeMap["fallback"][tag];
    if (type2 && _hasOwnProperty.call(type2.styleAliases, style)) {
      style = type2.styleAliases[style];
    }
    result[tag] = style;
  }
  return result;
}
function encodeHex(character) {
  var string2, handle, length;
  string2 = character.toString(16).toUpperCase();
  if (character <= 255) {
    handle = "x";
    length = 2;
  } else if (character <= 65535) {
    handle = "u";
    length = 4;
  } else if (character <= 4294967295) {
    handle = "U";
    length = 8;
  } else {
    throw new YAMLException("code point within a string may not be greater than 0xFFFFFFFF");
  }
  return "\\" + handle + common.repeat("0", length - string2.length) + string2;
}
var QUOTING_TYPE_SINGLE = 1, QUOTING_TYPE_DOUBLE = 2;
function State(options2) {
  this.schema = options2["schema"] || DEFAULT_SCHEMA;
  this.indent = Math.max(1, options2["indent"] || 2);
  this.noArrayIndent = options2["noArrayIndent"] || false;
  this.skipInvalid = options2["skipInvalid"] || false;
  this.flowLevel = common.isNothing(options2["flowLevel"]) ? -1 : options2["flowLevel"];
  this.styleMap = compileStyleMap(this.schema, options2["styles"] || null);
  this.sortKeys = options2["sortKeys"] || false;
  this.lineWidth = options2["lineWidth"] || 80;
  this.noRefs = options2["noRefs"] || false;
  this.noCompatMode = options2["noCompatMode"] || false;
  this.condenseFlow = options2["condenseFlow"] || false;
  this.quotingType = options2["quotingType"] === '"' ? QUOTING_TYPE_DOUBLE : QUOTING_TYPE_SINGLE;
  this.forceQuotes = options2["forceQuotes"] || false;
  this.replacer = typeof options2["replacer"] === "function" ? options2["replacer"] : null;
  this.implicitTypes = this.schema.compiledImplicit;
  this.explicitTypes = this.schema.compiledExplicit;
  this.tag = null;
  this.result = "";
  this.duplicates = [];
  this.usedDuplicates = null;
}
function indentString(string2, spaces) {
  var ind = common.repeat(" ", spaces), position = 0, next = -1, result = "", line, length = string2.length;
  while (position < length) {
    next = string2.indexOf("\n", position);
    if (next === -1) {
      line = string2.slice(position);
      position = length;
    } else {
      line = string2.slice(position, next + 1);
      position = next + 1;
    }
    if (line.length && line !== "\n")
      result += ind;
    result += line;
  }
  return result;
}
function generateNextLine(state, level) {
  return "\n" + common.repeat(" ", state.indent * level);
}
function testImplicitResolving(state, str2) {
  var index, length, type2;
  for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
    type2 = state.implicitTypes[index];
    if (type2.resolve(str2)) {
      return true;
    }
  }
  return false;
}
function isWhitespace(c) {
  return c === CHAR_SPACE || c === CHAR_TAB;
}
function isPrintable(c) {
  return 32 <= c && c <= 126 || 161 <= c && c <= 55295 && c !== 8232 && c !== 8233 || 57344 <= c && c <= 65533 && c !== CHAR_BOM || 65536 <= c && c <= 1114111;
}
function isNsCharOrWhitespace(c) {
  return isPrintable(c) && c !== CHAR_BOM && c !== CHAR_CARRIAGE_RETURN && c !== CHAR_LINE_FEED;
}
function isPlainSafe(c, prev, inblock) {
  var cIsNsCharOrWhitespace = isNsCharOrWhitespace(c);
  var cIsNsChar = cIsNsCharOrWhitespace && !isWhitespace(c);
  return (inblock ? cIsNsCharOrWhitespace : cIsNsCharOrWhitespace && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET) && c !== CHAR_SHARP && !(prev === CHAR_COLON && !cIsNsChar) || isNsCharOrWhitespace(prev) && !isWhitespace(prev) && c === CHAR_SHARP || prev === CHAR_COLON && cIsNsChar;
}
function isPlainSafeFirst(c) {
  return isPrintable(c) && c !== CHAR_BOM && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_EQUALS && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
function isPlainSafeLast(c) {
  return !isWhitespace(c) && c !== CHAR_COLON;
}
function codePointAt(string2, pos) {
  var first = string2.charCodeAt(pos), second;
  if (first >= 55296 && first <= 56319 && pos + 1 < string2.length) {
    second = string2.charCodeAt(pos + 1);
    if (second >= 56320 && second <= 57343) {
      return (first - 55296) * 1024 + second - 56320 + 65536;
    }
  }
  return first;
}
function needIndentIndicator(string2) {
  var leadingSpaceRe = /^\n* /;
  return leadingSpaceRe.test(string2);
}
var STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
function chooseScalarStyle(string2, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType, quotingType, forceQuotes, inblock) {
  var i;
  var char = 0;
  var prevChar = null;
  var hasLineBreak = false;
  var hasFoldableLine = false;
  var shouldTrackWidth = lineWidth !== -1;
  var previousLineBreak = -1;
  var plain = isPlainSafeFirst(codePointAt(string2, 0)) && isPlainSafeLast(codePointAt(string2, string2.length - 1));
  if (singleLineOnly || forceQuotes) {
    for (i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string2, i);
      if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
  } else {
    for (i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
      char = codePointAt(string2, i);
      if (char === CHAR_LINE_FEED) {
        hasLineBreak = true;
        if (shouldTrackWidth) {
          hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ";
          previousLineBreak = i;
        }
      } else if (!isPrintable(char)) {
        return STYLE_DOUBLE;
      }
      plain = plain && isPlainSafe(char, prevChar, inblock);
      prevChar = char;
    }
    hasFoldableLine = hasFoldableLine || shouldTrackWidth && (i - previousLineBreak - 1 > lineWidth && string2[previousLineBreak + 1] !== " ");
  }
  if (!hasLineBreak && !hasFoldableLine) {
    if (plain && !forceQuotes && !testAmbiguousType(string2)) {
      return STYLE_PLAIN;
    }
    return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
  }
  if (indentPerLevel > 9 && needIndentIndicator(string2)) {
    return STYLE_DOUBLE;
  }
  if (!forceQuotes) {
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  return quotingType === QUOTING_TYPE_DOUBLE ? STYLE_DOUBLE : STYLE_SINGLE;
}
function writeScalar(state, string2, level, iskey, inblock) {
  state.dump = function() {
    if (string2.length === 0) {
      return state.quotingType === QUOTING_TYPE_DOUBLE ? '""' : "''";
    }
    if (!state.noCompatMode) {
      if (DEPRECATED_BOOLEANS_SYNTAX.indexOf(string2) !== -1 || DEPRECATED_BASE60_SYNTAX.test(string2)) {
        return state.quotingType === QUOTING_TYPE_DOUBLE ? '"' + string2 + '"' : "'" + string2 + "'";
      }
    }
    var indent = state.indent * Math.max(1, level);
    var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
    var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
    function testAmbiguity(string3) {
      return testImplicitResolving(state, string3);
    }
    switch (chooseScalarStyle(
      string2,
      singleLineOnly,
      state.indent,
      lineWidth,
      testAmbiguity,
      state.quotingType,
      state.forceQuotes && !iskey,
      inblock
    )) {
      case STYLE_PLAIN:
        return string2;
      case STYLE_SINGLE:
        return "'" + string2.replace(/'/g, "''") + "'";
      case STYLE_LITERAL:
        return "|" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(string2, indent));
      case STYLE_FOLDED:
        return ">" + blockHeader(string2, state.indent) + dropEndingNewline(indentString(foldString(string2, lineWidth), indent));
      case STYLE_DOUBLE:
        return '"' + escapeString(string2) + '"';
      default:
        throw new YAMLException("impossible error: invalid scalar style");
    }
  }();
}
function blockHeader(string2, indentPerLevel) {
  var indentIndicator = needIndentIndicator(string2) ? String(indentPerLevel) : "";
  var clip = string2[string2.length - 1] === "\n";
  var keep = clip && (string2[string2.length - 2] === "\n" || string2 === "\n");
  var chomp = keep ? "+" : clip ? "" : "-";
  return indentIndicator + chomp + "\n";
}
function dropEndingNewline(string2) {
  return string2[string2.length - 1] === "\n" ? string2.slice(0, -1) : string2;
}
function foldString(string2, width) {
  var lineRe = /(\n+)([^\n]*)/g;
  var result = function() {
    var nextLF = string2.indexOf("\n");
    nextLF = nextLF !== -1 ? nextLF : string2.length;
    lineRe.lastIndex = nextLF;
    return foldLine(string2.slice(0, nextLF), width);
  }();
  var prevMoreIndented = string2[0] === "\n" || string2[0] === " ";
  var moreIndented;
  var match;
  while (match = lineRe.exec(string2)) {
    var prefix = match[1], line = match[2];
    moreIndented = line[0] === " ";
    result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
    prevMoreIndented = moreIndented;
  }
  return result;
}
function foldLine(line, width) {
  if (line === "" || line[0] === " ")
    return line;
  var breakRe = / [^ ]/g;
  var match;
  var start = 0, end, curr = 0, next = 0;
  var result = "";
  while (match = breakRe.exec(line)) {
    next = match.index;
    if (next - start > width) {
      end = curr > start ? curr : next;
      result += "\n" + line.slice(start, end);
      start = end + 1;
    }
    curr = next;
  }
  result += "\n";
  if (line.length - start > width && curr > start) {
    result += line.slice(start, curr) + "\n" + line.slice(curr + 1);
  } else {
    result += line.slice(start);
  }
  return result.slice(1);
}
function escapeString(string2) {
  var result = "";
  var char = 0;
  var escapeSeq;
  for (var i = 0; i < string2.length; char >= 65536 ? i += 2 : i++) {
    char = codePointAt(string2, i);
    escapeSeq = ESCAPE_SEQUENCES[char];
    if (!escapeSeq && isPrintable(char)) {
      result += string2[i];
      if (char >= 65536)
        result += string2[i + 1];
    } else {
      result += escapeSeq || encodeHex(char);
    }
  }
  return result;
}
function writeFlowSequence(state, level, object) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level, value, false, false) || typeof value === "undefined" && writeNode(state, level, null, false, false)) {
      if (_result !== "")
        _result += "," + (!state.condenseFlow ? " " : "");
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = "[" + _result + "]";
}
function writeBlockSequence(state, level, object, compact) {
  var _result = "", _tag = state.tag, index, length, value;
  for (index = 0, length = object.length; index < length; index += 1) {
    value = object[index];
    if (state.replacer) {
      value = state.replacer.call(object, String(index), value);
    }
    if (writeNode(state, level + 1, value, true, true, false, true) || typeof value === "undefined" && writeNode(state, level + 1, null, true, true, false, true)) {
      if (!compact || _result !== "") {
        _result += generateNextLine(state, level);
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        _result += "-";
      } else {
        _result += "- ";
      }
      _result += state.dump;
    }
  }
  state.tag = _tag;
  state.dump = _result || "[]";
}
function writeFlowMapping(state, level, object) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, pairBuffer;
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (_result !== "")
      pairBuffer += ", ";
    if (state.condenseFlow)
      pairBuffer += '"';
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level, objectKey, false, false)) {
      continue;
    }
    if (state.dump.length > 1024)
      pairBuffer += "? ";
    pairBuffer += state.dump + (state.condenseFlow ? '"' : "") + ":" + (state.condenseFlow ? "" : " ");
    if (!writeNode(state, level, objectValue, false, false)) {
      continue;
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = "{" + _result + "}";
}
function writeBlockMapping(state, level, object, compact) {
  var _result = "", _tag = state.tag, objectKeyList = Object.keys(object), index, length, objectKey, objectValue, explicitPair, pairBuffer;
  if (state.sortKeys === true) {
    objectKeyList.sort();
  } else if (typeof state.sortKeys === "function") {
    objectKeyList.sort(state.sortKeys);
  } else if (state.sortKeys) {
    throw new YAMLException("sortKeys must be a boolean or a function");
  }
  for (index = 0, length = objectKeyList.length; index < length; index += 1) {
    pairBuffer = "";
    if (!compact || _result !== "") {
      pairBuffer += generateNextLine(state, level);
    }
    objectKey = objectKeyList[index];
    objectValue = object[objectKey];
    if (state.replacer) {
      objectValue = state.replacer.call(object, objectKey, objectValue);
    }
    if (!writeNode(state, level + 1, objectKey, true, true, true)) {
      continue;
    }
    explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
    if (explicitPair) {
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += "?";
      } else {
        pairBuffer += "? ";
      }
    }
    pairBuffer += state.dump;
    if (explicitPair) {
      pairBuffer += generateNextLine(state, level);
    }
    if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
      continue;
    }
    if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
      pairBuffer += ":";
    } else {
      pairBuffer += ": ";
    }
    pairBuffer += state.dump;
    _result += pairBuffer;
  }
  state.tag = _tag;
  state.dump = _result || "{}";
}
function detectType(state, object, explicit) {
  var _result, typeList, index, length, type2, style;
  typeList = explicit ? state.explicitTypes : state.implicitTypes;
  for (index = 0, length = typeList.length; index < length; index += 1) {
    type2 = typeList[index];
    if ((type2.instanceOf || type2.predicate) && (!type2.instanceOf || typeof object === "object" && object instanceof type2.instanceOf) && (!type2.predicate || type2.predicate(object))) {
      if (explicit) {
        if (type2.multi && type2.representName) {
          state.tag = type2.representName(object);
        } else {
          state.tag = type2.tag;
        }
      } else {
        state.tag = "?";
      }
      if (type2.represent) {
        style = state.styleMap[type2.tag] || type2.defaultStyle;
        if (_toString.call(type2.represent) === "[object Function]") {
          _result = type2.represent(object, style);
        } else if (_hasOwnProperty.call(type2.represent, style)) {
          _result = type2.represent[style](object, style);
        } else {
          throw new YAMLException("!<" + type2.tag + '> tag resolver accepts not "' + style + '" style');
        }
        state.dump = _result;
      }
      return true;
    }
  }
  return false;
}
function writeNode(state, level, object, block, compact, iskey, isblockseq) {
  state.tag = null;
  state.dump = object;
  if (!detectType(state, object, false)) {
    detectType(state, object, true);
  }
  var type2 = _toString.call(state.dump);
  var inblock = block;
  var tagStr;
  if (block) {
    block = state.flowLevel < 0 || state.flowLevel > level;
  }
  var objectOrArray = type2 === "[object Object]" || type2 === "[object Array]", duplicateIndex, duplicate;
  if (objectOrArray) {
    duplicateIndex = state.duplicates.indexOf(object);
    duplicate = duplicateIndex !== -1;
  }
  if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
    compact = false;
  }
  if (duplicate && state.usedDuplicates[duplicateIndex]) {
    state.dump = "*ref_" + duplicateIndex;
  } else {
    if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
      state.usedDuplicates[duplicateIndex] = true;
    }
    if (type2 === "[object Object]") {
      if (block && Object.keys(state.dump).length !== 0) {
        writeBlockMapping(state, level, state.dump, compact);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowMapping(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object Array]") {
      if (block && state.dump.length !== 0) {
        if (state.noArrayIndent && !isblockseq && level > 0) {
          writeBlockSequence(state, level - 1, state.dump, compact);
        } else {
          writeBlockSequence(state, level, state.dump, compact);
        }
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + state.dump;
        }
      } else {
        writeFlowSequence(state, level, state.dump);
        if (duplicate) {
          state.dump = "&ref_" + duplicateIndex + " " + state.dump;
        }
      }
    } else if (type2 === "[object String]") {
      if (state.tag !== "?") {
        writeScalar(state, state.dump, level, iskey, inblock);
      }
    } else if (type2 === "[object Undefined]") {
      return false;
    } else {
      if (state.skipInvalid)
        return false;
      throw new YAMLException("unacceptable kind of an object to dump " + type2);
    }
    if (state.tag !== null && state.tag !== "?") {
      tagStr = encodeURI(
        state.tag[0] === "!" ? state.tag.slice(1) : state.tag
      ).replace(/!/g, "%21");
      if (state.tag[0] === "!") {
        tagStr = "!" + tagStr;
      } else if (tagStr.slice(0, 18) === "tag:yaml.org,2002:") {
        tagStr = "!!" + tagStr.slice(18);
      } else {
        tagStr = "!<" + tagStr + ">";
      }
      state.dump = tagStr + " " + state.dump;
    }
  }
  return true;
}
function getDuplicateReferences(object, state) {
  var objects = [], duplicatesIndexes = [], index, length;
  inspectNode(object, objects, duplicatesIndexes);
  for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
    state.duplicates.push(objects[duplicatesIndexes[index]]);
  }
  state.usedDuplicates = new Array(length);
}
function inspectNode(object, objects, duplicatesIndexes) {
  var objectKeyList, index, length;
  if (object !== null && typeof object === "object") {
    index = objects.indexOf(object);
    if (index !== -1) {
      if (duplicatesIndexes.indexOf(index) === -1) {
        duplicatesIndexes.push(index);
      }
    } else {
      objects.push(object);
      if (Array.isArray(object)) {
        for (index = 0, length = object.length; index < length; index += 1) {
          inspectNode(object[index], objects, duplicatesIndexes);
        }
      } else {
        objectKeyList = Object.keys(object);
        for (index = 0, length = objectKeyList.length; index < length; index += 1) {
          inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
        }
      }
    }
  }
}
function dump(input, options2) {
  options2 = options2 || {};
  var state = new State(options2);
  if (!state.noRefs)
    getDuplicateReferences(input, state);
  var value = input;
  if (state.replacer) {
    value = state.replacer.call({ "": value }, "", value);
  }
  if (writeNode(state, 0, value, true, true))
    return state.dump + "\n";
  return "";
}
dumper$1.dump = dump;
var loader = loader$1;
var dumper = dumper$1;
function renamed(from, to) {
  return function() {
    throw new Error("Function yaml." + from + " is removed in js-yaml 4. Use yaml." + to + " instead, which is now safe by default.");
  };
}
jsYaml.Type = type;
jsYaml.Schema = schema;
jsYaml.FAILSAFE_SCHEMA = failsafe;
jsYaml.JSON_SCHEMA = json;
jsYaml.CORE_SCHEMA = core.exports;
jsYaml.DEFAULT_SCHEMA = _default;
jsYaml.load = loader.load;
jsYaml.loadAll = loader.loadAll;
jsYaml.dump = dumper.dump;
jsYaml.YAMLException = exception;
jsYaml.types = {
  binary,
  float,
  map,
  null: _null,
  pairs,
  set,
  timestamp,
  bool: bool$1,
  int,
  merge,
  omap,
  seq,
  str
};
jsYaml.safeLoad = renamed("safeLoad", "load");
jsYaml.safeLoadAll = renamed("safeLoadAll", "loadAll");
jsYaml.safeDump = renamed("safeDump", "dump");
var __importDefault$1 = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(yaml, "__esModule", { value: true });
yaml.parseYaml = void 0;
const js_yaml_1 = __importDefault$1(jsYaml);
const options = Object.assign({}, js_yaml_1.default.types.int.options);
options.construct = (data) => {
  let value = data, sign = 1n, ch;
  if (value.includes("_")) {
    value = value.replace(/_/g, "");
  }
  ch = value[0];
  if (ch === "-" || ch === "+") {
    if (ch === "-") {
      sign = -1n;
    }
    value = value.slice(1);
    ch = value[0];
  }
  return sign * BigInt(value);
};
options.predicate = (object) => {
  const isBigInt = Object.prototype.toString.call(object) === "[object BigInt]";
  return isBigInt || js_yaml_1.default.types.int.options.predicate(object);
};
const BigIntType = new js_yaml_1.default.Type("tag:yaml.org,2002:int", options);
const SCHEMA = js_yaml_1.default.DEFAULT_SCHEMA.extend({ implicit: [BigIntType] });
function parseYaml(yamlString) {
  return js_yaml_1.default.load(yamlString, { schema: SCHEMA });
}
yaml.parseYaml = parseYaml;
Object.defineProperty(metadata, "__esModule", { value: true });
metadata.parseQosProfiles = void 0;
const rostime_1$2 = dist$6;
const types_1 = types$1;
const yaml_1 = yaml;
const TIME_ZERO = { sec: 0, nsec: 0 };
const DURATION_INFINITY = { sec: 2147483647, nsec: 4294967295 };
function parseQosProfiles(data) {
  const parsed = (0, yaml_1.parseYaml)(data);
  return Array.isArray(parsed) ? getQosProfiles(parsed) : [];
}
metadata.parseQosProfiles = parseQosProfiles;
function getQosProfiles(array) {
  const profiles = [];
  for (const entryMaybe of array) {
    if (entryMaybe == void 0) {
      continue;
    }
    profiles.push(getQosProfile(entryMaybe));
  }
  return profiles;
}
function getQosProfile(obj) {
  const history = getNumber(obj, "history") ?? -1;
  const reliability = getNumber(obj, "reliability") ?? -1;
  const durability = getNumber(obj, "durability") ?? -1;
  const liveliness = getNumber(obj, "liveliness") ?? -1;
  return {
    history: history in types_1.QosPolicyHistory ? history : types_1.QosPolicyHistory.KeepLast,
    depth: getNumber(obj, "depth") ?? 10,
    reliability: reliability in types_1.QosPolicyReliability ? reliability : types_1.QosPolicyReliability.Reliable,
    durability: durability in types_1.QosPolicyDurability ? durability : types_1.QosPolicyDurability.Volatile,
    deadline: getDuration(obj, "deadline"),
    lifespan: getDuration(obj, "lifespan"),
    liveliness: liveliness in types_1.QosPolicyLiveliness ? liveliness : types_1.QosPolicyLiveliness.SystemDefault,
    livelinessLeaseDuration: getDuration(obj, "liveliness_lease_duration"),
    avoidRosNamespaceConventions: getBoolean(obj, "avoid_ros_namespace_conventions") ?? false
  };
}
function getNumber(obj, field) {
  const value = obj[field];
  return typeof value === "bigint" ? Number(value) : typeof value === "number" ? value : void 0;
}
function getBoolean(obj, field) {
  const value = obj[field];
  return typeof value === "boolean" ? value : typeof value === "bigint" || typeof value === "number" ? Boolean(value) : void 0;
}
function getDuration(obj, field) {
  const value = obj[field];
  if (value == void 0) {
    return void 0;
  }
  const duration = { sec: Number(value["sec"]), nsec: Number(value["nsec"]) };
  if (isNaN(duration.sec) || isNaN(duration.nsec) || (0, rostime_1$2.areEqual)(duration, TIME_ZERO) || (0, rostime_1$2.areEqual)(duration, DURATION_INFINITY)) {
    return void 0;
  }
  return duration;
}
var RawMessageIterator$1 = {};
Object.defineProperty(RawMessageIterator$1, "__esModule", { value: true });
RawMessageIterator$1.RawMessageIterator = void 0;
const rostime_1$1 = dist$6;
class RawMessageIterator {
  constructor(dbIterator, topicsMap) {
    this.dbIterator = dbIterator;
    this.topicsMap = topicsMap;
  }
  [Symbol.asyncIterator]() {
    return this;
  }
  async next() {
    const res = this.dbIterator.next();
    if (res.done === true) {
      return { value: void 0, done: true };
    } else {
      const row = res.value;
      const topic = this.topicsMap.get(row.topic_id);
      if (topic == void 0) {
        throw new Error(`Cannot find topic_id ${row.topic_id} in ${this.topicsMap.size} topics`);
      }
      const timestamp2 = (0, rostime_1$1.fromNanoSec)(row.timestamp);
      const value = { topic, timestamp: timestamp2, data: row.data };
      return { value, done: false };
    }
  }
}
RawMessageIterator$1.RawMessageIterator = RawMessageIterator;
var Rosbag2 = {};
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
const ros2galacticDefinitions = {
  "action_msgs/GoalInfo": {
    name: "action_msgs/GoalInfo",
    definitions: [
      { name: "goal_id", type: "unique_identifier_msgs/UUID", isComplex: true, isArray: false },
      { name: "stamp", type: "time", isComplex: false, isArray: false }
    ]
  },
  "unique_identifier_msgs/UUID": {
    name: "unique_identifier_msgs/UUID",
    definitions: [
      { name: "uuid", type: "uint8", isComplex: false, isArray: true, arrayLength: 16 }
    ]
  },
  "action_msgs/GoalStatus": {
    name: "action_msgs/GoalStatus",
    definitions: [
      { name: "STATUS_UNKNOWN", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "STATUS_ACCEPTED", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "STATUS_EXECUTING", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "STATUS_CANCELING", type: "int8", isConstant: true, value: 3, valueText: "3" },
      { name: "STATUS_SUCCEEDED", type: "int8", isConstant: true, value: 4, valueText: "4" },
      { name: "STATUS_CANCELED", type: "int8", isConstant: true, value: 5, valueText: "5" },
      { name: "STATUS_ABORTED", type: "int8", isConstant: true, value: 6, valueText: "6" },
      { name: "goal_info", type: "action_msgs/GoalInfo", isComplex: true, isArray: false },
      { name: "status", type: "int8", isComplex: false, isArray: false }
    ]
  },
  "action_msgs/GoalStatusArray": {
    name: "action_msgs/GoalStatusArray",
    definitions: [
      { name: "status_list", type: "action_msgs/GoalStatus", isComplex: true, isArray: true }
    ]
  },
  "actionlib_msgs/GoalID": {
    name: "actionlib_msgs/GoalID",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "id", type: "string", isComplex: false, isArray: false }
    ]
  },
  "actionlib_msgs/GoalStatus": {
    name: "actionlib_msgs/GoalStatus",
    definitions: [
      { name: "goal_id", type: "actionlib_msgs/GoalID", isComplex: true, isArray: false },
      { name: "status", type: "uint8", isComplex: false, isArray: false },
      { name: "PENDING", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "ACTIVE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "PREEMPTED", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "SUCCEEDED", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "ABORTED", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "REJECTED", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "PREEMPTING", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "RECALLING", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "RECALLED", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "LOST", type: "uint8", isConstant: true, value: 9, valueText: "9" },
      { name: "text", type: "string", isComplex: false, isArray: false }
    ]
  },
  "actionlib_msgs/GoalStatusArray": {
    name: "actionlib_msgs/GoalStatusArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status_list", type: "actionlib_msgs/GoalStatus", isComplex: true, isArray: true }
    ]
  },
  "std_msgs/Header": {
    name: "std_msgs/Header",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "frame_id", type: "string", isComplex: false, isArray: false }
    ]
  },
  "builtin_interfaces/Duration": {
    name: "builtin_interfaces/Duration",
    definitions: [
      { name: "sec", type: "int32", isComplex: false, isArray: false },
      { name: "nanosec", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "builtin_interfaces/Time": {
    name: "builtin_interfaces/Time",
    definitions: [
      { name: "sec", type: "int32", isComplex: false, isArray: false },
      { name: "nanosec", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "diagnostic_msgs/DiagnosticArray": {
    name: "diagnostic_msgs/DiagnosticArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status", type: "diagnostic_msgs/DiagnosticStatus", isComplex: true, isArray: true }
    ]
  },
  "diagnostic_msgs/DiagnosticStatus": {
    name: "diagnostic_msgs/DiagnosticStatus",
    definitions: [
      { name: "OK", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "WARN", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "ERROR", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "STALE", type: "int8", isConstant: true, value: 3, valueText: "3" },
      { name: "level", type: "int8", isComplex: false, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "message", type: "string", isComplex: false, isArray: false },
      { name: "hardware_id", type: "string", isComplex: false, isArray: false },
      { name: "values", type: "diagnostic_msgs/KeyValue", isComplex: true, isArray: true }
    ]
  },
  "diagnostic_msgs/KeyValue": {
    name: "diagnostic_msgs/KeyValue",
    definitions: [
      { name: "key", type: "string", isComplex: false, isArray: false },
      { name: "value", type: "string", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/Accel": {
    name: "geometry_msgs/Accel",
    definitions: [
      { name: "linear", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "angular", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Vector3": {
    name: "geometry_msgs/Vector3",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "z", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/AccelStamped": {
    name: "geometry_msgs/AccelStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "accel", type: "geometry_msgs/Accel", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/AccelWithCovariance": {
    name: "geometry_msgs/AccelWithCovariance",
    definitions: [
      { name: "accel", type: "geometry_msgs/Accel", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/AccelWithCovarianceStamped": {
    name: "geometry_msgs/AccelWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "accel", type: "geometry_msgs/AccelWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Inertia": {
    name: "geometry_msgs/Inertia",
    definitions: [
      { name: "m", type: "float64", isComplex: false, isArray: false },
      { name: "com", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "ixx", type: "float64", isComplex: false, isArray: false },
      { name: "ixy", type: "float64", isComplex: false, isArray: false },
      { name: "ixz", type: "float64", isComplex: false, isArray: false },
      { name: "iyy", type: "float64", isComplex: false, isArray: false },
      { name: "iyz", type: "float64", isComplex: false, isArray: false },
      { name: "izz", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/InertiaStamped": {
    name: "geometry_msgs/InertiaStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "inertia", type: "geometry_msgs/Inertia", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Point": {
    name: "geometry_msgs/Point",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "z", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/Point32": {
    name: "geometry_msgs/Point32",
    definitions: [
      { name: "x", type: "float32", isComplex: false, isArray: false },
      { name: "y", type: "float32", isComplex: false, isArray: false },
      { name: "z", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/PointStamped": {
    name: "geometry_msgs/PointStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "point", type: "geometry_msgs/Point", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Polygon": {
    name: "geometry_msgs/Polygon",
    definitions: [
      { name: "points", type: "geometry_msgs/Point32", isComplex: true, isArray: true }
    ]
  },
  "geometry_msgs/PolygonStamped": {
    name: "geometry_msgs/PolygonStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "polygon", type: "geometry_msgs/Polygon", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Pose": {
    name: "geometry_msgs/Pose",
    definitions: [
      { name: "position", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Quaternion": {
    name: "geometry_msgs/Quaternion",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "y", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "z", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "w", type: "float64", isComplex: false, isArray: false, defaultValue: 1 }
    ]
  },
  "geometry_msgs/Pose2D": {
    name: "geometry_msgs/Pose2D",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "theta", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/PoseArray": {
    name: "geometry_msgs/PoseArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "poses", type: "geometry_msgs/Pose", isComplex: true, isArray: true }
    ]
  },
  "geometry_msgs/PoseStamped": {
    name: "geometry_msgs/PoseStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/PoseWithCovariance": {
    name: "geometry_msgs/PoseWithCovariance",
    definitions: [
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/PoseWithCovarianceStamped": {
    name: "geometry_msgs/PoseWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/PoseWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/QuaternionStamped": {
    name: "geometry_msgs/QuaternionStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "quaternion", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Transform": {
    name: "geometry_msgs/Transform",
    definitions: [
      { name: "translation", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "rotation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TransformStamped": {
    name: "geometry_msgs/TransformStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "child_frame_id", type: "string", isComplex: false, isArray: false },
      { name: "transform", type: "geometry_msgs/Transform", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Twist": {
    name: "geometry_msgs/Twist",
    definitions: [
      { name: "linear", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "angular", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TwistStamped": {
    name: "geometry_msgs/TwistStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TwistWithCovariance": {
    name: "geometry_msgs/TwistWithCovariance",
    definitions: [
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/TwistWithCovarianceStamped": {
    name: "geometry_msgs/TwistWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/TwistWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Vector3Stamped": {
    name: "geometry_msgs/Vector3Stamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "vector", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Wrench": {
    name: "geometry_msgs/Wrench",
    definitions: [
      { name: "force", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "torque", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/WrenchStamped": {
    name: "geometry_msgs/WrenchStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "wrench", type: "geometry_msgs/Wrench", isComplex: true, isArray: false }
    ]
  },
  "lifecycle_msgs/State": {
    name: "lifecycle_msgs/State",
    definitions: [
      { name: "PRIMARY_STATE_UNKNOWN", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      {
        name: "PRIMARY_STATE_UNCONFIGURED",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      { name: "PRIMARY_STATE_INACTIVE", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "PRIMARY_STATE_ACTIVE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      {
        name: "PRIMARY_STATE_FINALIZED",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "TRANSITION_STATE_CONFIGURING",
        type: "uint8",
        isConstant: true,
        value: 10,
        valueText: "10"
      },
      {
        name: "TRANSITION_STATE_CLEANINGUP",
        type: "uint8",
        isConstant: true,
        value: 11,
        valueText: "11"
      },
      {
        name: "TRANSITION_STATE_SHUTTINGDOWN",
        type: "uint8",
        isConstant: true,
        value: 12,
        valueText: "12"
      },
      {
        name: "TRANSITION_STATE_ACTIVATING",
        type: "uint8",
        isConstant: true,
        value: 13,
        valueText: "13"
      },
      {
        name: "TRANSITION_STATE_DEACTIVATING",
        type: "uint8",
        isConstant: true,
        value: 14,
        valueText: "14"
      },
      {
        name: "TRANSITION_STATE_ERRORPROCESSING",
        type: "uint8",
        isConstant: true,
        value: 15,
        valueText: "15"
      },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "label", type: "string", isComplex: false, isArray: false }
    ]
  },
  "lifecycle_msgs/Transition": {
    name: "lifecycle_msgs/Transition",
    definitions: [
      { name: "TRANSITION_CREATE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "TRANSITION_CONFIGURE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "TRANSITION_CLEANUP", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "TRANSITION_ACTIVATE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "TRANSITION_DEACTIVATE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      {
        name: "TRANSITION_UNCONFIGURED_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "TRANSITION_INACTIVE_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      {
        name: "TRANSITION_ACTIVE_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      { name: "TRANSITION_DESTROY", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      {
        name: "TRANSITION_ON_CONFIGURE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 10,
        valueText: "10"
      },
      {
        name: "TRANSITION_ON_CONFIGURE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 11,
        valueText: "11"
      },
      {
        name: "TRANSITION_ON_CONFIGURE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 12,
        valueText: "12"
      },
      {
        name: "TRANSITION_ON_CLEANUP_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 20,
        valueText: "20"
      },
      {
        name: "TRANSITION_ON_CLEANUP_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 21,
        valueText: "21"
      },
      {
        name: "TRANSITION_ON_CLEANUP_ERROR",
        type: "uint8",
        isConstant: true,
        value: 22,
        valueText: "22"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 30,
        valueText: "30"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 31,
        valueText: "31"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 32,
        valueText: "32"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 40,
        valueText: "40"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 41,
        valueText: "41"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 42,
        valueText: "42"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 50,
        valueText: "50"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 51,
        valueText: "51"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_ERROR",
        type: "uint8",
        isConstant: true,
        value: 52,
        valueText: "52"
      },
      {
        name: "TRANSITION_ON_ERROR_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 60,
        valueText: "60"
      },
      {
        name: "TRANSITION_ON_ERROR_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 61,
        valueText: "61"
      },
      {
        name: "TRANSITION_ON_ERROR_ERROR",
        type: "uint8",
        isConstant: true,
        value: 62,
        valueText: "62"
      },
      {
        name: "TRANSITION_CALLBACK_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 97,
        valueText: "97"
      },
      {
        name: "TRANSITION_CALLBACK_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 98,
        valueText: "98"
      },
      {
        name: "TRANSITION_CALLBACK_ERROR",
        type: "uint8",
        isConstant: true,
        value: 99,
        valueText: "99"
      },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "label", type: "string", isComplex: false, isArray: false }
    ]
  },
  "lifecycle_msgs/TransitionDescription": {
    name: "lifecycle_msgs/TransitionDescription",
    definitions: [
      { name: "transition", type: "lifecycle_msgs/Transition", isComplex: true, isArray: false },
      { name: "start_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false },
      { name: "goal_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false }
    ]
  },
  "lifecycle_msgs/TransitionEvent": {
    name: "lifecycle_msgs/TransitionEvent",
    definitions: [
      { name: "timestamp", type: "uint64", isComplex: false, isArray: false },
      { name: "transition", type: "lifecycle_msgs/Transition", isComplex: true, isArray: false },
      { name: "start_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false },
      { name: "goal_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/GridCells": {
    name: "nav_msgs/GridCells",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "cell_width", type: "float32", isComplex: false, isArray: false },
      { name: "cell_height", type: "float32", isComplex: false, isArray: false },
      { name: "cells", type: "geometry_msgs/Point", isComplex: true, isArray: true }
    ]
  },
  "nav_msgs/MapMetaData": {
    name: "nav_msgs/MapMetaData",
    definitions: [
      { name: "map_load_time", type: "time", isComplex: false, isArray: false },
      { name: "resolution", type: "float32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "origin", type: "geometry_msgs/Pose", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/OccupancyGrid": {
    name: "nav_msgs/OccupancyGrid",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "info", type: "nav_msgs/MapMetaData", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "nav_msgs/Odometry": {
    name: "nav_msgs/Odometry",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "child_frame_id", type: "string", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/PoseWithCovariance", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/TwistWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/Path": {
    name: "nav_msgs/Path",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "poses", type: "geometry_msgs/PoseStamped", isComplex: true, isArray: true }
    ]
  },
  "rcl_interfaces/FloatingPointRange": {
    name: "rcl_interfaces/FloatingPointRange",
    definitions: [
      { name: "from_value", type: "float64", isComplex: false, isArray: false },
      { name: "to_value", type: "float64", isComplex: false, isArray: false },
      { name: "step", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/IntegerRange": {
    name: "rcl_interfaces/IntegerRange",
    definitions: [
      { name: "from_value", type: "int64", isComplex: false, isArray: false },
      { name: "to_value", type: "int64", isComplex: false, isArray: false },
      { name: "step", type: "uint64", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/ListParametersResult": {
    name: "rcl_interfaces/ListParametersResult",
    definitions: [
      { name: "names", type: "string", isComplex: false, isArray: true },
      { name: "prefixes", type: "string", isComplex: false, isArray: true }
    ]
  },
  "rcl_interfaces/Log": {
    name: "rcl_interfaces/Log",
    definitions: [
      { name: "DEBUG", type: "int8", isConstant: true, value: 10, valueText: "10" },
      { name: "INFO", type: "int8", isConstant: true, value: 20, valueText: "20" },
      { name: "WARN", type: "int8", isConstant: true, value: 30, valueText: "30" },
      { name: "ERROR", type: "int8", isConstant: true, value: 40, valueText: "40" },
      { name: "FATAL", type: "int8", isConstant: true, value: 50, valueText: "50" },
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "level", type: "uint8", isComplex: false, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "msg", type: "string", isComplex: false, isArray: false },
      { name: "file", type: "string", isComplex: false, isArray: false },
      { name: "function", type: "string", isComplex: false, isArray: false },
      { name: "line", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/Parameter": {
    name: "rcl_interfaces/Parameter",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "value", type: "rcl_interfaces/ParameterValue", isComplex: true, isArray: false }
    ]
  },
  "rcl_interfaces/ParameterValue": {
    name: "rcl_interfaces/ParameterValue",
    definitions: [
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "bool_value", type: "bool", isComplex: false, isArray: false },
      { name: "integer_value", type: "int64", isComplex: false, isArray: false },
      { name: "double_value", type: "float64", isComplex: false, isArray: false },
      { name: "string_value", type: "string", isComplex: false, isArray: false },
      { name: "byte_array_value", type: "int8", isComplex: false, isArray: true },
      { name: "bool_array_value", type: "bool", isComplex: false, isArray: true },
      { name: "integer_array_value", type: "int64", isComplex: false, isArray: true },
      { name: "double_array_value", type: "float64", isComplex: false, isArray: true },
      { name: "string_array_value", type: "string", isComplex: false, isArray: true }
    ]
  },
  "rcl_interfaces/ParameterDescriptor": {
    name: "rcl_interfaces/ParameterDescriptor",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false },
      { name: "additional_constraints", type: "string", isComplex: false, isArray: false },
      { name: "read_only", type: "bool", isComplex: false, isArray: false, defaultValue: false },
      {
        name: "dynamic_typing",
        type: "bool",
        isComplex: false,
        isArray: false,
        defaultValue: false
      },
      {
        name: "floating_point_range",
        type: "rcl_interfaces/FloatingPointRange",
        isComplex: true,
        isArray: true,
        arrayUpperBound: 1
      },
      {
        name: "integer_range",
        type: "rcl_interfaces/IntegerRange",
        isComplex: true,
        isArray: true,
        arrayUpperBound: 1
      }
    ]
  },
  "rcl_interfaces/ParameterEvent": {
    name: "rcl_interfaces/ParameterEvent",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "node", type: "string", isComplex: false, isArray: false },
      { name: "new_parameters", type: "rcl_interfaces/Parameter", isComplex: true, isArray: true },
      {
        name: "changed_parameters",
        type: "rcl_interfaces/Parameter",
        isComplex: true,
        isArray: true
      },
      {
        name: "deleted_parameters",
        type: "rcl_interfaces/Parameter",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "rcl_interfaces/ParameterEventDescriptors": {
    name: "rcl_interfaces/ParameterEventDescriptors",
    definitions: [
      {
        name: "new_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      },
      {
        name: "changed_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      },
      {
        name: "deleted_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "rcl_interfaces/ParameterType": {
    name: "rcl_interfaces/ParameterType",
    definitions: [
      { name: "PARAMETER_NOT_SET", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "PARAMETER_BOOL", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "PARAMETER_INTEGER", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "PARAMETER_DOUBLE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "PARAMETER_STRING", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "PARAMETER_BYTE_ARRAY", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "PARAMETER_BOOL_ARRAY", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      {
        name: "PARAMETER_INTEGER_ARRAY",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      { name: "PARAMETER_DOUBLE_ARRAY", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "PARAMETER_STRING_ARRAY", type: "uint8", isConstant: true, value: 9, valueText: "9" }
    ]
  },
  "rcl_interfaces/SetParametersResult": {
    name: "rcl_interfaces/SetParametersResult",
    definitions: [
      { name: "successful", type: "bool", isComplex: false, isArray: false },
      { name: "reason", type: "string", isComplex: false, isArray: false }
    ]
  },
  "rosgraph_msgs/Clock": {
    name: "rosgraph_msgs/Clock",
    definitions: [{ name: "clock", type: "time", isComplex: false, isArray: false }]
  },
  "sensor_msgs/BatteryState": {
    name: "sensor_msgs/BatteryState",
    definitions: [
      {
        name: "POWER_SUPPLY_STATUS_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_STATUS_CHARGING",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_STATUS_DISCHARGING",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_STATUS_NOT_CHARGING",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_STATUS_FULL",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_HEALTH_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_HEALTH_GOOD",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_HEALTH_OVERHEAT",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_HEALTH_DEAD",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_HEALTH_OVERVOLTAGE",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_HEALTH_UNSPEC_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "POWER_SUPPLY_HEALTH_COLD",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      {
        name: "POWER_SUPPLY_HEALTH_WATCHDOG_TIMER_EXPIRE",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      {
        name: "POWER_SUPPLY_HEALTH_SAFETY_TIMER_EXPIRE",
        type: "uint8",
        isConstant: true,
        value: 8,
        valueText: "8"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_NIMH",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LION",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIPO",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIFE",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_NICD",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIMN",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "voltage", type: "float32", isComplex: false, isArray: false },
      { name: "temperature", type: "float32", isComplex: false, isArray: false },
      { name: "current", type: "float32", isComplex: false, isArray: false },
      { name: "charge", type: "float32", isComplex: false, isArray: false },
      { name: "capacity", type: "float32", isComplex: false, isArray: false },
      { name: "design_capacity", type: "float32", isComplex: false, isArray: false },
      { name: "percentage", type: "float32", isComplex: false, isArray: false },
      { name: "power_supply_status", type: "uint8", isComplex: false, isArray: false },
      { name: "power_supply_health", type: "uint8", isComplex: false, isArray: false },
      { name: "power_supply_technology", type: "uint8", isComplex: false, isArray: false },
      { name: "present", type: "bool", isComplex: false, isArray: false },
      { name: "cell_voltage", type: "float32", isComplex: false, isArray: true },
      { name: "cell_temperature", type: "float32", isComplex: false, isArray: true },
      { name: "location", type: "string", isComplex: false, isArray: false },
      { name: "serial_number", type: "string", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/CameraInfo": {
    name: "sensor_msgs/CameraInfo",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "distortion_model", type: "string", isComplex: false, isArray: false },
      { name: "d", type: "float64", isComplex: false, isArray: true },
      { name: "k", type: "float64", isComplex: false, isArray: true, arrayLength: 9 },
      { name: "r", type: "float64", isComplex: false, isArray: true, arrayLength: 9 },
      { name: "p", type: "float64", isComplex: false, isArray: true, arrayLength: 12 },
      { name: "binning_x", type: "uint32", isComplex: false, isArray: false },
      { name: "binning_y", type: "uint32", isComplex: false, isArray: false },
      { name: "roi", type: "sensor_msgs/RegionOfInterest", isComplex: true, isArray: false }
    ]
  },
  "sensor_msgs/RegionOfInterest": {
    name: "sensor_msgs/RegionOfInterest",
    definitions: [
      { name: "x_offset", type: "uint32", isComplex: false, isArray: false },
      { name: "y_offset", type: "uint32", isComplex: false, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "do_rectify", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/ChannelFloat32": {
    name: "sensor_msgs/ChannelFloat32",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "values", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/CompressedImage": {
    name: "sensor_msgs/CompressedImage",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "format", type: "string", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/FluidPressure": {
    name: "sensor_msgs/FluidPressure",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "fluid_pressure", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Illuminance": {
    name: "sensor_msgs/Illuminance",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "illuminance", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Image": {
    name: "sensor_msgs/Image",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "encoding", type: "string", isComplex: false, isArray: false },
      { name: "is_bigendian", type: "uint8", isComplex: false, isArray: false },
      { name: "step", type: "uint32", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/Imu": {
    name: "sensor_msgs/Imu",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false },
      {
        name: "orientation_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      { name: "angular_velocity", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      {
        name: "angular_velocity_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      {
        name: "linear_acceleration",
        type: "geometry_msgs/Vector3",
        isComplex: true,
        isArray: false
      },
      {
        name: "linear_acceleration_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      }
    ]
  },
  "sensor_msgs/JointState": {
    name: "sensor_msgs/JointState",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: true },
      { name: "position", type: "float64", isComplex: false, isArray: true },
      { name: "velocity", type: "float64", isComplex: false, isArray: true },
      { name: "effort", type: "float64", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/Joy": {
    name: "sensor_msgs/Joy",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "axes", type: "float32", isComplex: false, isArray: true },
      { name: "buttons", type: "int32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/JoyFeedback": {
    name: "sensor_msgs/JoyFeedback",
    definitions: [
      { name: "TYPE_LED", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "TYPE_RUMBLE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "TYPE_BUZZER", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "intensity", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/JoyFeedbackArray": {
    name: "sensor_msgs/JoyFeedbackArray",
    definitions: [
      { name: "array", type: "sensor_msgs/JoyFeedback", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/LaserEcho": {
    name: "sensor_msgs/LaserEcho",
    definitions: [{ name: "echoes", type: "float32", isComplex: false, isArray: true }]
  },
  "sensor_msgs/LaserScan": {
    name: "sensor_msgs/LaserScan",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "angle_min", type: "float32", isComplex: false, isArray: false },
      { name: "angle_max", type: "float32", isComplex: false, isArray: false },
      { name: "angle_increment", type: "float32", isComplex: false, isArray: false },
      { name: "time_increment", type: "float32", isComplex: false, isArray: false },
      { name: "scan_time", type: "float32", isComplex: false, isArray: false },
      { name: "range_min", type: "float32", isComplex: false, isArray: false },
      { name: "range_max", type: "float32", isComplex: false, isArray: false },
      { name: "ranges", type: "float32", isComplex: false, isArray: true },
      { name: "intensities", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/MagneticField": {
    name: "sensor_msgs/MagneticField",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "magnetic_field", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      {
        name: "magnetic_field_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      }
    ]
  },
  "sensor_msgs/MultiDOFJointState": {
    name: "sensor_msgs/MultiDOFJointState",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      { name: "transforms", type: "geometry_msgs/Transform", isComplex: true, isArray: true },
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "wrench", type: "geometry_msgs/Wrench", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/MultiEchoLaserScan": {
    name: "sensor_msgs/MultiEchoLaserScan",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "angle_min", type: "float32", isComplex: false, isArray: false },
      { name: "angle_max", type: "float32", isComplex: false, isArray: false },
      { name: "angle_increment", type: "float32", isComplex: false, isArray: false },
      { name: "time_increment", type: "float32", isComplex: false, isArray: false },
      { name: "scan_time", type: "float32", isComplex: false, isArray: false },
      { name: "range_min", type: "float32", isComplex: false, isArray: false },
      { name: "range_max", type: "float32", isComplex: false, isArray: false },
      { name: "ranges", type: "sensor_msgs/LaserEcho", isComplex: true, isArray: true },
      { name: "intensities", type: "sensor_msgs/LaserEcho", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/NavSatFix": {
    name: "sensor_msgs/NavSatFix",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status", type: "sensor_msgs/NavSatStatus", isComplex: true, isArray: false },
      { name: "latitude", type: "float64", isComplex: false, isArray: false },
      { name: "longitude", type: "float64", isComplex: false, isArray: false },
      { name: "altitude", type: "float64", isComplex: false, isArray: false },
      {
        name: "position_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      {
        name: "COVARIANCE_TYPE_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "COVARIANCE_TYPE_APPROXIMATED",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "COVARIANCE_TYPE_DIAGONAL_KNOWN",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      { name: "COVARIANCE_TYPE_KNOWN", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "position_covariance_type", type: "uint8", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/NavSatStatus": {
    name: "sensor_msgs/NavSatStatus",
    definitions: [
      { name: "STATUS_NO_FIX", type: "int8", isConstant: true, value: -1, valueText: "-1" },
      { name: "STATUS_FIX", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "STATUS_SBAS_FIX", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "STATUS_GBAS_FIX", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "status", type: "int8", isComplex: false, isArray: false },
      { name: "SERVICE_GPS", type: "uint16", isConstant: true, value: 1, valueText: "1" },
      { name: "SERVICE_GLONASS", type: "uint16", isConstant: true, value: 2, valueText: "2" },
      { name: "SERVICE_COMPASS", type: "uint16", isConstant: true, value: 4, valueText: "4" },
      { name: "SERVICE_GALILEO", type: "uint16", isConstant: true, value: 8, valueText: "8" },
      { name: "service", type: "uint16", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/PointCloud": {
    name: "sensor_msgs/PointCloud",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "points", type: "geometry_msgs/Point32", isComplex: true, isArray: true },
      { name: "channels", type: "sensor_msgs/ChannelFloat32", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/PointCloud2": {
    name: "sensor_msgs/PointCloud2",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "fields", type: "sensor_msgs/PointField", isComplex: true, isArray: true },
      { name: "is_bigendian", type: "bool", isComplex: false, isArray: false },
      { name: "point_step", type: "uint32", isComplex: false, isArray: false },
      { name: "row_step", type: "uint32", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true },
      { name: "is_dense", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/PointField": {
    name: "sensor_msgs/PointField",
    definitions: [
      { name: "INT8", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "UINT8", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "INT16", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "UINT16", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "INT32", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "UINT32", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "FLOAT32", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "FLOAT64", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "offset", type: "uint32", isComplex: false, isArray: false },
      { name: "datatype", type: "uint8", isComplex: false, isArray: false },
      { name: "count", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Range": {
    name: "sensor_msgs/Range",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ULTRASOUND", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "INFRARED", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "radiation_type", type: "uint8", isComplex: false, isArray: false },
      { name: "field_of_view", type: "float32", isComplex: false, isArray: false },
      { name: "min_range", type: "float32", isComplex: false, isArray: false },
      { name: "max_range", type: "float32", isComplex: false, isArray: false },
      { name: "range", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/RelativeHumidity": {
    name: "sensor_msgs/RelativeHumidity",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "relative_humidity", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Temperature": {
    name: "sensor_msgs/Temperature",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "temperature", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/TimeReference": {
    name: "sensor_msgs/TimeReference",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "time_ref", type: "time", isComplex: false, isArray: false },
      { name: "source", type: "string", isComplex: false, isArray: false }
    ]
  },
  "shape_msgs/Mesh": {
    name: "shape_msgs/Mesh",
    definitions: [
      { name: "triangles", type: "shape_msgs/MeshTriangle", isComplex: true, isArray: true },
      { name: "vertices", type: "geometry_msgs/Point", isComplex: true, isArray: true }
    ]
  },
  "shape_msgs/MeshTriangle": {
    name: "shape_msgs/MeshTriangle",
    definitions: [
      { name: "vertex_indices", type: "uint32", isComplex: false, isArray: true, arrayLength: 3 }
    ]
  },
  "shape_msgs/Plane": {
    name: "shape_msgs/Plane",
    definitions: [
      { name: "coef", type: "float64", isComplex: false, isArray: true, arrayLength: 4 }
    ]
  },
  "shape_msgs/SolidPrimitive": {
    name: "shape_msgs/SolidPrimitive",
    definitions: [
      { name: "BOX", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "SPHERE", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "CYLINDER", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "CONE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "dimensions", type: "float64", isComplex: false, isArray: true, arrayUpperBound: 3 },
      { name: "BOX_X", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "BOX_Y", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "BOX_Z", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "SPHERE_RADIUS", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CYLINDER_HEIGHT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CYLINDER_RADIUS", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "CONE_HEIGHT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CONE_RADIUS", type: "uint8", isConstant: true, value: 1, valueText: "1" }
    ]
  },
  "statistics_msgs/MetricsMessage": {
    name: "statistics_msgs/MetricsMessage",
    definitions: [
      { name: "measurement_source_name", type: "string", isComplex: false, isArray: false },
      { name: "metrics_source", type: "string", isComplex: false, isArray: false },
      { name: "unit", type: "string", isComplex: false, isArray: false },
      { name: "window_start", type: "time", isComplex: false, isArray: false },
      { name: "window_stop", type: "time", isComplex: false, isArray: false },
      {
        name: "statistics",
        type: "statistics_msgs/StatisticDataPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "statistics_msgs/StatisticDataPoint": {
    name: "statistics_msgs/StatisticDataPoint",
    definitions: [
      { name: "data_type", type: "uint8", isComplex: false, isArray: false },
      { name: "data", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "statistics_msgs/StatisticDataType": {
    name: "statistics_msgs/StatisticDataType",
    definitions: [
      {
        name: "STATISTICS_DATA_TYPE_UNINITIALIZED",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "STATISTICS_DATA_TYPE_AVERAGE",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "STATISTICS_DATA_TYPE_MINIMUM",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "STATISTICS_DATA_TYPE_MAXIMUM",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "STATISTICS_DATA_TYPE_STDDEV",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "STATISTICS_DATA_TYPE_SAMPLE_COUNT",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      }
    ]
  },
  "std_msgs/Bool": {
    name: "std_msgs/Bool",
    definitions: [{ name: "data", type: "bool", isComplex: false, isArray: false }]
  },
  "std_msgs/Byte": {
    name: "std_msgs/Byte",
    definitions: [{ name: "data", type: "int8", isComplex: false, isArray: false }]
  },
  "std_msgs/ByteMultiArray": {
    name: "std_msgs/ByteMultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/MultiArrayLayout": {
    name: "std_msgs/MultiArrayLayout",
    definitions: [
      { name: "dim", type: "std_msgs/MultiArrayDimension", isComplex: true, isArray: true },
      { name: "data_offset", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/MultiArrayDimension": {
    name: "std_msgs/MultiArrayDimension",
    definitions: [
      { name: "label", type: "string", isComplex: false, isArray: false },
      { name: "size", type: "uint32", isComplex: false, isArray: false },
      { name: "stride", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/Char": {
    name: "std_msgs/Char",
    definitions: [{ name: "data", type: "uint8", isComplex: false, isArray: false }]
  },
  "std_msgs/ColorRGBA": {
    name: "std_msgs/ColorRGBA",
    definitions: [
      { name: "r", type: "float32", isComplex: false, isArray: false },
      { name: "g", type: "float32", isComplex: false, isArray: false },
      { name: "b", type: "float32", isComplex: false, isArray: false },
      { name: "a", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/Empty": { name: "std_msgs/Empty", definitions: [] },
  "std_msgs/Float32": {
    name: "std_msgs/Float32",
    definitions: [{ name: "data", type: "float32", isComplex: false, isArray: false }]
  },
  "std_msgs/Float32MultiArray": {
    name: "std_msgs/Float32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Float64": {
    name: "std_msgs/Float64",
    definitions: [{ name: "data", type: "float64", isComplex: false, isArray: false }]
  },
  "std_msgs/Float64MultiArray": {
    name: "std_msgs/Float64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "float64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int16": {
    name: "std_msgs/Int16",
    definitions: [{ name: "data", type: "int16", isComplex: false, isArray: false }]
  },
  "std_msgs/Int16MultiArray": {
    name: "std_msgs/Int16MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int16", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int32": {
    name: "std_msgs/Int32",
    definitions: [{ name: "data", type: "int32", isComplex: false, isArray: false }]
  },
  "std_msgs/Int32MultiArray": {
    name: "std_msgs/Int32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int64": {
    name: "std_msgs/Int64",
    definitions: [{ name: "data", type: "int64", isComplex: false, isArray: false }]
  },
  "std_msgs/Int64MultiArray": {
    name: "std_msgs/Int64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int8": {
    name: "std_msgs/Int8",
    definitions: [{ name: "data", type: "int8", isComplex: false, isArray: false }]
  },
  "std_msgs/Int8MultiArray": {
    name: "std_msgs/Int8MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/String": {
    name: "std_msgs/String",
    definitions: [{ name: "data", type: "string", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt16": {
    name: "std_msgs/UInt16",
    definitions: [{ name: "data", type: "uint16", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt16MultiArray": {
    name: "std_msgs/UInt16MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint16", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt32": {
    name: "std_msgs/UInt32",
    definitions: [{ name: "data", type: "uint32", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt32MultiArray": {
    name: "std_msgs/UInt32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt64": {
    name: "std_msgs/UInt64",
    definitions: [{ name: "data", type: "uint64", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt64MultiArray": {
    name: "std_msgs/UInt64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt8": {
    name: "std_msgs/UInt8",
    definitions: [{ name: "data", type: "uint8", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt8MultiArray": {
    name: "std_msgs/UInt8MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "stereo_msgs/DisparityImage": {
    name: "stereo_msgs/DisparityImage",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "image", type: "sensor_msgs/Image", isComplex: true, isArray: false },
      { name: "f", type: "float32", isComplex: false, isArray: false },
      { name: "t", type: "float32", isComplex: false, isArray: false },
      {
        name: "valid_window",
        type: "sensor_msgs/RegionOfInterest",
        isComplex: true,
        isArray: false
      },
      { name: "min_disparity", type: "float32", isComplex: false, isArray: false },
      { name: "max_disparity", type: "float32", isComplex: false, isArray: false },
      { name: "delta_d", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "test_msgs/Builtins": {
    name: "test_msgs/Builtins",
    definitions: [
      { name: "duration_value", type: "duration", isComplex: false, isArray: false },
      { name: "time_value", type: "time", isComplex: false, isArray: false }
    ]
  },
  "tf2_msgs/TF2Error": {
    name: "tf2_msgs/TF2Error",
    definitions: [
      { name: "NO_ERROR", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "LOOKUP_ERROR", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "CONNECTIVITY_ERROR", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "EXTRAPOLATION_ERROR", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "INVALID_ARGUMENT_ERROR", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "TIMEOUT_ERROR", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "TRANSFORM_ERROR", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "error", type: "uint8", isComplex: false, isArray: false },
      { name: "error_string", type: "string", isComplex: false, isArray: false }
    ]
  },
  "tf2_msgs/TFMessage": {
    name: "tf2_msgs/TFMessage",
    definitions: [
      {
        name: "transforms",
        type: "geometry_msgs/TransformStamped",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectory": {
    name: "trajectory_msgs/JointTrajectory",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      {
        name: "points",
        type: "trajectory_msgs/JointTrajectoryPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectoryPoint": {
    name: "trajectory_msgs/JointTrajectoryPoint",
    definitions: [
      { name: "positions", type: "float64", isComplex: false, isArray: true },
      { name: "velocities", type: "float64", isComplex: false, isArray: true },
      { name: "accelerations", type: "float64", isComplex: false, isArray: true },
      { name: "effort", type: "float64", isComplex: false, isArray: true },
      { name: "time_from_start", type: "duration", isComplex: false, isArray: false }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectory": {
    name: "trajectory_msgs/MultiDOFJointTrajectory",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      {
        name: "points",
        type: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectoryPoint": {
    name: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
    definitions: [
      { name: "transforms", type: "geometry_msgs/Transform", isComplex: true, isArray: true },
      { name: "velocities", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "accelerations", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "time_from_start", type: "duration", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/ImageMarker": {
    name: "visualization_msgs/ImageMarker",
    definitions: [
      { name: "CIRCLE", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "LINE_STRIP", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "LINE_LIST", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "POLYGON", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "POINTS", type: "int32", isConstant: true, value: 4, valueText: "4" },
      { name: "ADD", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "REMOVE", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ns", type: "string", isComplex: false, isArray: false },
      { name: "id", type: "int32", isComplex: false, isArray: false },
      { name: "type", type: "int32", isComplex: false, isArray: false },
      { name: "action", type: "int32", isComplex: false, isArray: false },
      { name: "position", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "scale", type: "float32", isComplex: false, isArray: false },
      { name: "outline_color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "filled", type: "uint8", isComplex: false, isArray: false },
      { name: "fill_color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "lifetime", type: "duration", isComplex: false, isArray: false },
      { name: "points", type: "geometry_msgs/Point", isComplex: true, isArray: true },
      { name: "outline_colors", type: "std_msgs/ColorRGBA", isComplex: true, isArray: true }
    ]
  },
  "visualization_msgs/InteractiveMarker": {
    name: "visualization_msgs/InteractiveMarker",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false },
      { name: "scale", type: "float32", isComplex: false, isArray: false },
      {
        name: "menu_entries",
        type: "visualization_msgs/MenuEntry",
        isComplex: true,
        isArray: true
      },
      {
        name: "controls",
        type: "visualization_msgs/InteractiveMarkerControl",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "visualization_msgs/MenuEntry": {
    name: "visualization_msgs/MenuEntry",
    definitions: [
      { name: "id", type: "uint32", isComplex: false, isArray: false },
      { name: "parent_id", type: "uint32", isComplex: false, isArray: false },
      { name: "title", type: "string", isComplex: false, isArray: false },
      { name: "command", type: "string", isComplex: false, isArray: false },
      { name: "FEEDBACK", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "ROSRUN", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "ROSLAUNCH", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "command_type", type: "uint8", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerControl": {
    name: "visualization_msgs/InteractiveMarkerControl",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false },
      { name: "INHERIT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "FIXED", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "VIEW_FACING", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "orientation_mode", type: "uint8", isComplex: false, isArray: false },
      { name: "NONE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "MENU", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "BUTTON", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "MOVE_AXIS", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "MOVE_PLANE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "ROTATE_AXIS", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "MOVE_ROTATE", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "MOVE_3D", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "ROTATE_3D", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "MOVE_ROTATE_3D", type: "uint8", isConstant: true, value: 9, valueText: "9" },
      { name: "interaction_mode", type: "uint8", isComplex: false, isArray: false },
      { name: "always_visible", type: "bool", isComplex: false, isArray: false },
      { name: "markers", type: "visualization_msgs/Marker", isComplex: true, isArray: true },
      { name: "independent_marker_orientation", type: "bool", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/Marker": {
    name: "visualization_msgs/Marker",
    definitions: [
      { name: "ARROW", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "CUBE", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "SPHERE", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "CYLINDER", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "LINE_STRIP", type: "int32", isConstant: true, value: 4, valueText: "4" },
      { name: "LINE_LIST", type: "int32", isConstant: true, value: 5, valueText: "5" },
      { name: "CUBE_LIST", type: "int32", isConstant: true, value: 6, valueText: "6" },
      { name: "SPHERE_LIST", type: "int32", isConstant: true, value: 7, valueText: "7" },
      { name: "POINTS", type: "int32", isConstant: true, value: 8, valueText: "8" },
      { name: "TEXT_VIEW_FACING", type: "int32", isConstant: true, value: 9, valueText: "9" },
      { name: "MESH_RESOURCE", type: "int32", isConstant: true, value: 10, valueText: "10" },
      { name: "TRIANGLE_LIST", type: "int32", isConstant: true, value: 11, valueText: "11" },
      { name: "ADD", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "MODIFY", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "DELETE", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "DELETEALL", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ns", type: "string", isComplex: false, isArray: false },
      { name: "id", type: "int32", isComplex: false, isArray: false },
      { name: "type", type: "int32", isComplex: false, isArray: false },
      { name: "action", type: "int32", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "scale", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "lifetime", type: "duration", isComplex: false, isArray: false },
      { name: "frame_locked", type: "bool", isComplex: false, isArray: false },
      { name: "points", type: "geometry_msgs/Point", isComplex: true, isArray: true },
      { name: "colors", type: "std_msgs/ColorRGBA", isComplex: true, isArray: true },
      { name: "text", type: "string", isComplex: false, isArray: false },
      { name: "mesh_resource", type: "string", isComplex: false, isArray: false },
      { name: "mesh_use_embedded_materials", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerFeedback": {
    name: "visualization_msgs/InteractiveMarkerFeedback",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "client_id", type: "string", isComplex: false, isArray: false },
      { name: "marker_name", type: "string", isComplex: false, isArray: false },
      { name: "control_name", type: "string", isComplex: false, isArray: false },
      { name: "KEEP_ALIVE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "POSE_UPDATE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "MENU_SELECT", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "BUTTON_CLICK", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "MOUSE_DOWN", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "MOUSE_UP", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "event_type", type: "uint8", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "menu_entry_id", type: "uint32", isComplex: false, isArray: false },
      { name: "mouse_point", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "mouse_point_valid", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerInit": {
    name: "visualization_msgs/InteractiveMarkerInit",
    definitions: [
      { name: "server_id", type: "string", isComplex: false, isArray: false },
      { name: "seq_num", type: "uint64", isComplex: false, isArray: false },
      {
        name: "markers",
        type: "visualization_msgs/InteractiveMarker",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "visualization_msgs/InteractiveMarkerPose": {
    name: "visualization_msgs/InteractiveMarkerPose",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerUpdate": {
    name: "visualization_msgs/InteractiveMarkerUpdate",
    definitions: [
      { name: "server_id", type: "string", isComplex: false, isArray: false },
      { name: "seq_num", type: "uint64", isComplex: false, isArray: false },
      { name: "KEEP_ALIVE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "UPDATE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      {
        name: "markers",
        type: "visualization_msgs/InteractiveMarker",
        isComplex: true,
        isArray: true
      },
      {
        name: "poses",
        type: "visualization_msgs/InteractiveMarkerPose",
        isComplex: true,
        isArray: true
      },
      { name: "erases", type: "string", isComplex: false, isArray: true }
    ]
  },
  "visualization_msgs/MarkerArray": {
    name: "visualization_msgs/MarkerArray",
    definitions: [
      { name: "markers", type: "visualization_msgs/Marker", isComplex: true, isArray: true }
    ]
  }
};
const ros2humbleDefinitions = {
  "action_msgs/GoalInfo": {
    name: "action_msgs/GoalInfo",
    definitions: [
      { name: "goal_id", type: "unique_identifier_msgs/UUID", isComplex: true, isArray: false },
      { name: "stamp", type: "time", isComplex: false, isArray: false }
    ]
  },
  "unique_identifier_msgs/UUID": {
    name: "unique_identifier_msgs/UUID",
    definitions: [
      { name: "uuid", type: "uint8", isComplex: false, isArray: true, arrayLength: 16 }
    ]
  },
  "action_msgs/GoalStatus": {
    name: "action_msgs/GoalStatus",
    definitions: [
      { name: "STATUS_UNKNOWN", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "STATUS_ACCEPTED", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "STATUS_EXECUTING", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "STATUS_CANCELING", type: "int8", isConstant: true, value: 3, valueText: "3" },
      { name: "STATUS_SUCCEEDED", type: "int8", isConstant: true, value: 4, valueText: "4" },
      { name: "STATUS_CANCELED", type: "int8", isConstant: true, value: 5, valueText: "5" },
      { name: "STATUS_ABORTED", type: "int8", isConstant: true, value: 6, valueText: "6" },
      { name: "goal_info", type: "action_msgs/GoalInfo", isComplex: true, isArray: false },
      { name: "status", type: "int8", isComplex: false, isArray: false }
    ]
  },
  "action_msgs/GoalStatusArray": {
    name: "action_msgs/GoalStatusArray",
    definitions: [
      { name: "status_list", type: "action_msgs/GoalStatus", isComplex: true, isArray: true }
    ]
  },
  "actionlib_msgs/GoalID": {
    name: "actionlib_msgs/GoalID",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "id", type: "string", isComplex: false, isArray: false }
    ]
  },
  "actionlib_msgs/GoalStatus": {
    name: "actionlib_msgs/GoalStatus",
    definitions: [
      { name: "goal_id", type: "actionlib_msgs/GoalID", isComplex: true, isArray: false },
      { name: "status", type: "uint8", isComplex: false, isArray: false },
      { name: "PENDING", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "ACTIVE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "PREEMPTED", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "SUCCEEDED", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "ABORTED", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "REJECTED", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "PREEMPTING", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "RECALLING", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "RECALLED", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "LOST", type: "uint8", isConstant: true, value: 9, valueText: "9" },
      { name: "text", type: "string", isComplex: false, isArray: false }
    ]
  },
  "actionlib_msgs/GoalStatusArray": {
    name: "actionlib_msgs/GoalStatusArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status_list", type: "actionlib_msgs/GoalStatus", isComplex: true, isArray: true }
    ]
  },
  "std_msgs/Header": {
    name: "std_msgs/Header",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "frame_id", type: "string", isComplex: false, isArray: false }
    ]
  },
  "builtin_interfaces/Duration": {
    name: "builtin_interfaces/Duration",
    definitions: [
      { name: "sec", type: "int32", isComplex: false, isArray: false },
      { name: "nanosec", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "builtin_interfaces/Time": {
    name: "builtin_interfaces/Time",
    definitions: [
      { name: "sec", type: "int32", isComplex: false, isArray: false },
      { name: "nanosec", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "diagnostic_msgs/DiagnosticArray": {
    name: "diagnostic_msgs/DiagnosticArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status", type: "diagnostic_msgs/DiagnosticStatus", isComplex: true, isArray: true }
    ]
  },
  "diagnostic_msgs/DiagnosticStatus": {
    name: "diagnostic_msgs/DiagnosticStatus",
    definitions: [
      { name: "OK", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "WARN", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "ERROR", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "STALE", type: "int8", isConstant: true, value: 3, valueText: "3" },
      { name: "level", type: "int8", isComplex: false, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "message", type: "string", isComplex: false, isArray: false },
      { name: "hardware_id", type: "string", isComplex: false, isArray: false },
      { name: "values", type: "diagnostic_msgs/KeyValue", isComplex: true, isArray: true }
    ]
  },
  "diagnostic_msgs/KeyValue": {
    name: "diagnostic_msgs/KeyValue",
    definitions: [
      { name: "key", type: "string", isComplex: false, isArray: false },
      { name: "value", type: "string", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/Accel": {
    name: "geometry_msgs/Accel",
    definitions: [
      { name: "linear", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "angular", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Vector3": {
    name: "geometry_msgs/Vector3",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "z", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/AccelStamped": {
    name: "geometry_msgs/AccelStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "accel", type: "geometry_msgs/Accel", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/AccelWithCovariance": {
    name: "geometry_msgs/AccelWithCovariance",
    definitions: [
      { name: "accel", type: "geometry_msgs/Accel", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/AccelWithCovarianceStamped": {
    name: "geometry_msgs/AccelWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "accel", type: "geometry_msgs/AccelWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Inertia": {
    name: "geometry_msgs/Inertia",
    definitions: [
      { name: "m", type: "float64", isComplex: false, isArray: false },
      { name: "com", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "ixx", type: "float64", isComplex: false, isArray: false },
      { name: "ixy", type: "float64", isComplex: false, isArray: false },
      { name: "ixz", type: "float64", isComplex: false, isArray: false },
      { name: "iyy", type: "float64", isComplex: false, isArray: false },
      { name: "iyz", type: "float64", isComplex: false, isArray: false },
      { name: "izz", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/InertiaStamped": {
    name: "geometry_msgs/InertiaStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "inertia", type: "geometry_msgs/Inertia", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Point": {
    name: "geometry_msgs/Point",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "z", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/Point32": {
    name: "geometry_msgs/Point32",
    definitions: [
      { name: "x", type: "float32", isComplex: false, isArray: false },
      { name: "y", type: "float32", isComplex: false, isArray: false },
      { name: "z", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/PointStamped": {
    name: "geometry_msgs/PointStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "point", type: "geometry_msgs/Point", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Polygon": {
    name: "geometry_msgs/Polygon",
    definitions: [
      { name: "points", type: "geometry_msgs/Point32", isComplex: true, isArray: true }
    ]
  },
  "geometry_msgs/PolygonStamped": {
    name: "geometry_msgs/PolygonStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "polygon", type: "geometry_msgs/Polygon", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Pose": {
    name: "geometry_msgs/Pose",
    definitions: [
      { name: "position", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Quaternion": {
    name: "geometry_msgs/Quaternion",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "y", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "z", type: "float64", isComplex: false, isArray: false, defaultValue: 0 },
      { name: "w", type: "float64", isComplex: false, isArray: false, defaultValue: 1 }
    ]
  },
  "geometry_msgs/Pose2D": {
    name: "geometry_msgs/Pose2D",
    definitions: [
      { name: "x", type: "float64", isComplex: false, isArray: false },
      { name: "y", type: "float64", isComplex: false, isArray: false },
      { name: "theta", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "geometry_msgs/PoseArray": {
    name: "geometry_msgs/PoseArray",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "poses", type: "geometry_msgs/Pose", isComplex: true, isArray: true }
    ]
  },
  "geometry_msgs/PoseStamped": {
    name: "geometry_msgs/PoseStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/PoseWithCovariance": {
    name: "geometry_msgs/PoseWithCovariance",
    definitions: [
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/PoseWithCovarianceStamped": {
    name: "geometry_msgs/PoseWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/PoseWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/QuaternionStamped": {
    name: "geometry_msgs/QuaternionStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "quaternion", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Transform": {
    name: "geometry_msgs/Transform",
    definitions: [
      { name: "translation", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "rotation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TransformStamped": {
    name: "geometry_msgs/TransformStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "child_frame_id", type: "string", isComplex: false, isArray: false },
      { name: "transform", type: "geometry_msgs/Transform", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Twist": {
    name: "geometry_msgs/Twist",
    definitions: [
      { name: "linear", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "angular", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TwistStamped": {
    name: "geometry_msgs/TwistStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/TwistWithCovariance": {
    name: "geometry_msgs/TwistWithCovariance",
    definitions: [
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: false },
      { name: "covariance", type: "float64", isComplex: false, isArray: true, arrayLength: 36 }
    ]
  },
  "geometry_msgs/TwistWithCovarianceStamped": {
    name: "geometry_msgs/TwistWithCovarianceStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/TwistWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Vector3Stamped": {
    name: "geometry_msgs/Vector3Stamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "vector", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/Wrench": {
    name: "geometry_msgs/Wrench",
    definitions: [
      { name: "force", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "torque", type: "geometry_msgs/Vector3", isComplex: true, isArray: false }
    ]
  },
  "geometry_msgs/WrenchStamped": {
    name: "geometry_msgs/WrenchStamped",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "wrench", type: "geometry_msgs/Wrench", isComplex: true, isArray: false }
    ]
  },
  "lifecycle_msgs/State": {
    name: "lifecycle_msgs/State",
    definitions: [
      { name: "PRIMARY_STATE_UNKNOWN", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      {
        name: "PRIMARY_STATE_UNCONFIGURED",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      { name: "PRIMARY_STATE_INACTIVE", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "PRIMARY_STATE_ACTIVE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      {
        name: "PRIMARY_STATE_FINALIZED",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "TRANSITION_STATE_CONFIGURING",
        type: "uint8",
        isConstant: true,
        value: 10,
        valueText: "10"
      },
      {
        name: "TRANSITION_STATE_CLEANINGUP",
        type: "uint8",
        isConstant: true,
        value: 11,
        valueText: "11"
      },
      {
        name: "TRANSITION_STATE_SHUTTINGDOWN",
        type: "uint8",
        isConstant: true,
        value: 12,
        valueText: "12"
      },
      {
        name: "TRANSITION_STATE_ACTIVATING",
        type: "uint8",
        isConstant: true,
        value: 13,
        valueText: "13"
      },
      {
        name: "TRANSITION_STATE_DEACTIVATING",
        type: "uint8",
        isConstant: true,
        value: 14,
        valueText: "14"
      },
      {
        name: "TRANSITION_STATE_ERRORPROCESSING",
        type: "uint8",
        isConstant: true,
        value: 15,
        valueText: "15"
      },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "label", type: "string", isComplex: false, isArray: false }
    ]
  },
  "lifecycle_msgs/Transition": {
    name: "lifecycle_msgs/Transition",
    definitions: [
      { name: "TRANSITION_CREATE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "TRANSITION_CONFIGURE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "TRANSITION_CLEANUP", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "TRANSITION_ACTIVATE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "TRANSITION_DEACTIVATE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      {
        name: "TRANSITION_UNCONFIGURED_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "TRANSITION_INACTIVE_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      {
        name: "TRANSITION_ACTIVE_SHUTDOWN",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      { name: "TRANSITION_DESTROY", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      {
        name: "TRANSITION_ON_CONFIGURE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 10,
        valueText: "10"
      },
      {
        name: "TRANSITION_ON_CONFIGURE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 11,
        valueText: "11"
      },
      {
        name: "TRANSITION_ON_CONFIGURE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 12,
        valueText: "12"
      },
      {
        name: "TRANSITION_ON_CLEANUP_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 20,
        valueText: "20"
      },
      {
        name: "TRANSITION_ON_CLEANUP_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 21,
        valueText: "21"
      },
      {
        name: "TRANSITION_ON_CLEANUP_ERROR",
        type: "uint8",
        isConstant: true,
        value: 22,
        valueText: "22"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 30,
        valueText: "30"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 31,
        valueText: "31"
      },
      {
        name: "TRANSITION_ON_ACTIVATE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 32,
        valueText: "32"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 40,
        valueText: "40"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 41,
        valueText: "41"
      },
      {
        name: "TRANSITION_ON_DEACTIVATE_ERROR",
        type: "uint8",
        isConstant: true,
        value: 42,
        valueText: "42"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 50,
        valueText: "50"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 51,
        valueText: "51"
      },
      {
        name: "TRANSITION_ON_SHUTDOWN_ERROR",
        type: "uint8",
        isConstant: true,
        value: 52,
        valueText: "52"
      },
      {
        name: "TRANSITION_ON_ERROR_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 60,
        valueText: "60"
      },
      {
        name: "TRANSITION_ON_ERROR_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 61,
        valueText: "61"
      },
      {
        name: "TRANSITION_ON_ERROR_ERROR",
        type: "uint8",
        isConstant: true,
        value: 62,
        valueText: "62"
      },
      {
        name: "TRANSITION_CALLBACK_SUCCESS",
        type: "uint8",
        isConstant: true,
        value: 97,
        valueText: "97"
      },
      {
        name: "TRANSITION_CALLBACK_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 98,
        valueText: "98"
      },
      {
        name: "TRANSITION_CALLBACK_ERROR",
        type: "uint8",
        isConstant: true,
        value: 99,
        valueText: "99"
      },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "label", type: "string", isComplex: false, isArray: false }
    ]
  },
  "lifecycle_msgs/TransitionDescription": {
    name: "lifecycle_msgs/TransitionDescription",
    definitions: [
      { name: "transition", type: "lifecycle_msgs/Transition", isComplex: true, isArray: false },
      { name: "start_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false },
      { name: "goal_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false }
    ]
  },
  "lifecycle_msgs/TransitionEvent": {
    name: "lifecycle_msgs/TransitionEvent",
    definitions: [
      { name: "timestamp", type: "uint64", isComplex: false, isArray: false },
      { name: "transition", type: "lifecycle_msgs/Transition", isComplex: true, isArray: false },
      { name: "start_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false },
      { name: "goal_state", type: "lifecycle_msgs/State", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/GridCells": {
    name: "nav_msgs/GridCells",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "cell_width", type: "float32", isComplex: false, isArray: false },
      { name: "cell_height", type: "float32", isComplex: false, isArray: false },
      { name: "cells", type: "geometry_msgs/Point", isComplex: true, isArray: true }
    ]
  },
  "nav_msgs/MapMetaData": {
    name: "nav_msgs/MapMetaData",
    definitions: [
      { name: "map_load_time", type: "time", isComplex: false, isArray: false },
      { name: "resolution", type: "float32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "origin", type: "geometry_msgs/Pose", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/OccupancyGrid": {
    name: "nav_msgs/OccupancyGrid",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "info", type: "nav_msgs/MapMetaData", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "nav_msgs/Odometry": {
    name: "nav_msgs/Odometry",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "child_frame_id", type: "string", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/PoseWithCovariance", isComplex: true, isArray: false },
      { name: "twist", type: "geometry_msgs/TwistWithCovariance", isComplex: true, isArray: false }
    ]
  },
  "nav_msgs/Path": {
    name: "nav_msgs/Path",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "poses", type: "geometry_msgs/PoseStamped", isComplex: true, isArray: true }
    ]
  },
  "rcl_interfaces/FloatingPointRange": {
    name: "rcl_interfaces/FloatingPointRange",
    definitions: [
      { name: "from_value", type: "float64", isComplex: false, isArray: false },
      { name: "to_value", type: "float64", isComplex: false, isArray: false },
      { name: "step", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/IntegerRange": {
    name: "rcl_interfaces/IntegerRange",
    definitions: [
      { name: "from_value", type: "int64", isComplex: false, isArray: false },
      { name: "to_value", type: "int64", isComplex: false, isArray: false },
      { name: "step", type: "uint64", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/ListParametersResult": {
    name: "rcl_interfaces/ListParametersResult",
    definitions: [
      { name: "names", type: "string", isComplex: false, isArray: true },
      { name: "prefixes", type: "string", isComplex: false, isArray: true }
    ]
  },
  "rcl_interfaces/Log": {
    name: "rcl_interfaces/Log",
    definitions: [
      { name: "DEBUG", type: "int8", isConstant: true, value: 10, valueText: "10" },
      { name: "INFO", type: "int8", isConstant: true, value: 20, valueText: "20" },
      { name: "WARN", type: "int8", isConstant: true, value: 30, valueText: "30" },
      { name: "ERROR", type: "int8", isConstant: true, value: 40, valueText: "40" },
      { name: "FATAL", type: "int8", isConstant: true, value: 50, valueText: "50" },
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "level", type: "uint8", isComplex: false, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "msg", type: "string", isComplex: false, isArray: false },
      { name: "file", type: "string", isComplex: false, isArray: false },
      { name: "function", type: "string", isComplex: false, isArray: false },
      { name: "line", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "rcl_interfaces/Parameter": {
    name: "rcl_interfaces/Parameter",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "value", type: "rcl_interfaces/ParameterValue", isComplex: true, isArray: false }
    ]
  },
  "rcl_interfaces/ParameterValue": {
    name: "rcl_interfaces/ParameterValue",
    definitions: [
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "bool_value", type: "bool", isComplex: false, isArray: false },
      { name: "integer_value", type: "int64", isComplex: false, isArray: false },
      { name: "double_value", type: "float64", isComplex: false, isArray: false },
      { name: "string_value", type: "string", isComplex: false, isArray: false },
      { name: "byte_array_value", type: "int8", isComplex: false, isArray: true },
      { name: "bool_array_value", type: "bool", isComplex: false, isArray: true },
      { name: "integer_array_value", type: "int64", isComplex: false, isArray: true },
      { name: "double_array_value", type: "float64", isComplex: false, isArray: true },
      { name: "string_array_value", type: "string", isComplex: false, isArray: true }
    ]
  },
  "rcl_interfaces/ParameterDescriptor": {
    name: "rcl_interfaces/ParameterDescriptor",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false },
      { name: "additional_constraints", type: "string", isComplex: false, isArray: false },
      { name: "read_only", type: "bool", isComplex: false, isArray: false, defaultValue: false },
      {
        name: "dynamic_typing",
        type: "bool",
        isComplex: false,
        isArray: false,
        defaultValue: false
      },
      {
        name: "floating_point_range",
        type: "rcl_interfaces/FloatingPointRange",
        isComplex: true,
        isArray: true,
        arrayUpperBound: 1
      },
      {
        name: "integer_range",
        type: "rcl_interfaces/IntegerRange",
        isComplex: true,
        isArray: true,
        arrayUpperBound: 1
      }
    ]
  },
  "rcl_interfaces/ParameterEvent": {
    name: "rcl_interfaces/ParameterEvent",
    definitions: [
      { name: "stamp", type: "time", isComplex: false, isArray: false },
      { name: "node", type: "string", isComplex: false, isArray: false },
      { name: "new_parameters", type: "rcl_interfaces/Parameter", isComplex: true, isArray: true },
      {
        name: "changed_parameters",
        type: "rcl_interfaces/Parameter",
        isComplex: true,
        isArray: true
      },
      {
        name: "deleted_parameters",
        type: "rcl_interfaces/Parameter",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "rcl_interfaces/ParameterEventDescriptors": {
    name: "rcl_interfaces/ParameterEventDescriptors",
    definitions: [
      {
        name: "new_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      },
      {
        name: "changed_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      },
      {
        name: "deleted_parameters",
        type: "rcl_interfaces/ParameterDescriptor",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "rcl_interfaces/ParameterType": {
    name: "rcl_interfaces/ParameterType",
    definitions: [
      { name: "PARAMETER_NOT_SET", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "PARAMETER_BOOL", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "PARAMETER_INTEGER", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "PARAMETER_DOUBLE", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "PARAMETER_STRING", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "PARAMETER_BYTE_ARRAY", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "PARAMETER_BOOL_ARRAY", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      {
        name: "PARAMETER_INTEGER_ARRAY",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      { name: "PARAMETER_DOUBLE_ARRAY", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "PARAMETER_STRING_ARRAY", type: "uint8", isConstant: true, value: 9, valueText: "9" }
    ]
  },
  "rcl_interfaces/SetParametersResult": {
    name: "rcl_interfaces/SetParametersResult",
    definitions: [
      { name: "successful", type: "bool", isComplex: false, isArray: false },
      { name: "reason", type: "string", isComplex: false, isArray: false }
    ]
  },
  "rosgraph_msgs/Clock": {
    name: "rosgraph_msgs/Clock",
    definitions: [{ name: "clock", type: "time", isComplex: false, isArray: false }]
  },
  "sensor_msgs/BatteryState": {
    name: "sensor_msgs/BatteryState",
    definitions: [
      {
        name: "POWER_SUPPLY_STATUS_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_STATUS_CHARGING",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_STATUS_DISCHARGING",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_STATUS_NOT_CHARGING",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_STATUS_FULL",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_HEALTH_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_HEALTH_GOOD",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_HEALTH_OVERHEAT",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_HEALTH_DEAD",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_HEALTH_OVERVOLTAGE",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_HEALTH_UNSPEC_FAILURE",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "POWER_SUPPLY_HEALTH_COLD",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      {
        name: "POWER_SUPPLY_HEALTH_WATCHDOG_TIMER_EXPIRE",
        type: "uint8",
        isConstant: true,
        value: 7,
        valueText: "7"
      },
      {
        name: "POWER_SUPPLY_HEALTH_SAFETY_TIMER_EXPIRE",
        type: "uint8",
        isConstant: true,
        value: 8,
        valueText: "8"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_NIMH",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LION",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIPO",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIFE",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_NICD",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      },
      {
        name: "POWER_SUPPLY_TECHNOLOGY_LIMN",
        type: "uint8",
        isConstant: true,
        value: 6,
        valueText: "6"
      },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "voltage", type: "float32", isComplex: false, isArray: false },
      { name: "temperature", type: "float32", isComplex: false, isArray: false },
      { name: "current", type: "float32", isComplex: false, isArray: false },
      { name: "charge", type: "float32", isComplex: false, isArray: false },
      { name: "capacity", type: "float32", isComplex: false, isArray: false },
      { name: "design_capacity", type: "float32", isComplex: false, isArray: false },
      { name: "percentage", type: "float32", isComplex: false, isArray: false },
      { name: "power_supply_status", type: "uint8", isComplex: false, isArray: false },
      { name: "power_supply_health", type: "uint8", isComplex: false, isArray: false },
      { name: "power_supply_technology", type: "uint8", isComplex: false, isArray: false },
      { name: "present", type: "bool", isComplex: false, isArray: false },
      { name: "cell_voltage", type: "float32", isComplex: false, isArray: true },
      { name: "cell_temperature", type: "float32", isComplex: false, isArray: true },
      { name: "location", type: "string", isComplex: false, isArray: false },
      { name: "serial_number", type: "string", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/CameraInfo": {
    name: "sensor_msgs/CameraInfo",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "distortion_model", type: "string", isComplex: false, isArray: false },
      { name: "d", type: "float64", isComplex: false, isArray: true },
      { name: "k", type: "float64", isComplex: false, isArray: true, arrayLength: 9 },
      { name: "r", type: "float64", isComplex: false, isArray: true, arrayLength: 9 },
      { name: "p", type: "float64", isComplex: false, isArray: true, arrayLength: 12 },
      { name: "binning_x", type: "uint32", isComplex: false, isArray: false },
      { name: "binning_y", type: "uint32", isComplex: false, isArray: false },
      { name: "roi", type: "sensor_msgs/RegionOfInterest", isComplex: true, isArray: false }
    ]
  },
  "sensor_msgs/RegionOfInterest": {
    name: "sensor_msgs/RegionOfInterest",
    definitions: [
      { name: "x_offset", type: "uint32", isComplex: false, isArray: false },
      { name: "y_offset", type: "uint32", isComplex: false, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "do_rectify", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/ChannelFloat32": {
    name: "sensor_msgs/ChannelFloat32",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "values", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/CompressedImage": {
    name: "sensor_msgs/CompressedImage",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "format", type: "string", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/FluidPressure": {
    name: "sensor_msgs/FluidPressure",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "fluid_pressure", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Illuminance": {
    name: "sensor_msgs/Illuminance",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "illuminance", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Image": {
    name: "sensor_msgs/Image",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "encoding", type: "string", isComplex: false, isArray: false },
      { name: "is_bigendian", type: "uint8", isComplex: false, isArray: false },
      { name: "step", type: "uint32", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/Imu": {
    name: "sensor_msgs/Imu",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false },
      {
        name: "orientation_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      { name: "angular_velocity", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      {
        name: "angular_velocity_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      {
        name: "linear_acceleration",
        type: "geometry_msgs/Vector3",
        isComplex: true,
        isArray: false
      },
      {
        name: "linear_acceleration_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      }
    ]
  },
  "sensor_msgs/JointState": {
    name: "sensor_msgs/JointState",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: true },
      { name: "position", type: "float64", isComplex: false, isArray: true },
      { name: "velocity", type: "float64", isComplex: false, isArray: true },
      { name: "effort", type: "float64", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/Joy": {
    name: "sensor_msgs/Joy",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "axes", type: "float32", isComplex: false, isArray: true },
      { name: "buttons", type: "int32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/JoyFeedback": {
    name: "sensor_msgs/JoyFeedback",
    definitions: [
      { name: "TYPE_LED", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "TYPE_RUMBLE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "TYPE_BUZZER", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "id", type: "uint8", isComplex: false, isArray: false },
      { name: "intensity", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/JoyFeedbackArray": {
    name: "sensor_msgs/JoyFeedbackArray",
    definitions: [
      { name: "array", type: "sensor_msgs/JoyFeedback", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/LaserEcho": {
    name: "sensor_msgs/LaserEcho",
    definitions: [{ name: "echoes", type: "float32", isComplex: false, isArray: true }]
  },
  "sensor_msgs/LaserScan": {
    name: "sensor_msgs/LaserScan",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "angle_min", type: "float32", isComplex: false, isArray: false },
      { name: "angle_max", type: "float32", isComplex: false, isArray: false },
      { name: "angle_increment", type: "float32", isComplex: false, isArray: false },
      { name: "time_increment", type: "float32", isComplex: false, isArray: false },
      { name: "scan_time", type: "float32", isComplex: false, isArray: false },
      { name: "range_min", type: "float32", isComplex: false, isArray: false },
      { name: "range_max", type: "float32", isComplex: false, isArray: false },
      { name: "ranges", type: "float32", isComplex: false, isArray: true },
      { name: "intensities", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "sensor_msgs/MagneticField": {
    name: "sensor_msgs/MagneticField",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "magnetic_field", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      {
        name: "magnetic_field_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      }
    ]
  },
  "sensor_msgs/MultiDOFJointState": {
    name: "sensor_msgs/MultiDOFJointState",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      { name: "transforms", type: "geometry_msgs/Transform", isComplex: true, isArray: true },
      { name: "twist", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "wrench", type: "geometry_msgs/Wrench", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/MultiEchoLaserScan": {
    name: "sensor_msgs/MultiEchoLaserScan",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "angle_min", type: "float32", isComplex: false, isArray: false },
      { name: "angle_max", type: "float32", isComplex: false, isArray: false },
      { name: "angle_increment", type: "float32", isComplex: false, isArray: false },
      { name: "time_increment", type: "float32", isComplex: false, isArray: false },
      { name: "scan_time", type: "float32", isComplex: false, isArray: false },
      { name: "range_min", type: "float32", isComplex: false, isArray: false },
      { name: "range_max", type: "float32", isComplex: false, isArray: false },
      { name: "ranges", type: "sensor_msgs/LaserEcho", isComplex: true, isArray: true },
      { name: "intensities", type: "sensor_msgs/LaserEcho", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/NavSatFix": {
    name: "sensor_msgs/NavSatFix",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "status", type: "sensor_msgs/NavSatStatus", isComplex: true, isArray: false },
      { name: "latitude", type: "float64", isComplex: false, isArray: false },
      { name: "longitude", type: "float64", isComplex: false, isArray: false },
      { name: "altitude", type: "float64", isComplex: false, isArray: false },
      {
        name: "position_covariance",
        type: "float64",
        isComplex: false,
        isArray: true,
        arrayLength: 9
      },
      {
        name: "COVARIANCE_TYPE_UNKNOWN",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "COVARIANCE_TYPE_APPROXIMATED",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "COVARIANCE_TYPE_DIAGONAL_KNOWN",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      { name: "COVARIANCE_TYPE_KNOWN", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "position_covariance_type", type: "uint8", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/NavSatStatus": {
    name: "sensor_msgs/NavSatStatus",
    definitions: [
      { name: "STATUS_NO_FIX", type: "int8", isConstant: true, value: -1, valueText: "-1" },
      { name: "STATUS_FIX", type: "int8", isConstant: true, value: 0, valueText: "0" },
      { name: "STATUS_SBAS_FIX", type: "int8", isConstant: true, value: 1, valueText: "1" },
      { name: "STATUS_GBAS_FIX", type: "int8", isConstant: true, value: 2, valueText: "2" },
      { name: "status", type: "int8", isComplex: false, isArray: false },
      { name: "SERVICE_GPS", type: "uint16", isConstant: true, value: 1, valueText: "1" },
      { name: "SERVICE_GLONASS", type: "uint16", isConstant: true, value: 2, valueText: "2" },
      { name: "SERVICE_COMPASS", type: "uint16", isConstant: true, value: 4, valueText: "4" },
      { name: "SERVICE_GALILEO", type: "uint16", isConstant: true, value: 8, valueText: "8" },
      { name: "service", type: "uint16", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/PointCloud": {
    name: "sensor_msgs/PointCloud",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "points", type: "geometry_msgs/Point32", isComplex: true, isArray: true },
      { name: "channels", type: "sensor_msgs/ChannelFloat32", isComplex: true, isArray: true }
    ]
  },
  "sensor_msgs/PointCloud2": {
    name: "sensor_msgs/PointCloud2",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "height", type: "uint32", isComplex: false, isArray: false },
      { name: "width", type: "uint32", isComplex: false, isArray: false },
      { name: "fields", type: "sensor_msgs/PointField", isComplex: true, isArray: true },
      { name: "is_bigendian", type: "bool", isComplex: false, isArray: false },
      { name: "point_step", type: "uint32", isComplex: false, isArray: false },
      { name: "row_step", type: "uint32", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true },
      { name: "is_dense", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/PointField": {
    name: "sensor_msgs/PointField",
    definitions: [
      { name: "INT8", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "UINT8", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "INT16", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "UINT16", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "INT32", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "UINT32", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "FLOAT32", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "FLOAT64", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "offset", type: "uint32", isComplex: false, isArray: false },
      { name: "datatype", type: "uint8", isComplex: false, isArray: false },
      { name: "count", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Range": {
    name: "sensor_msgs/Range",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ULTRASOUND", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "INFRARED", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "radiation_type", type: "uint8", isComplex: false, isArray: false },
      { name: "field_of_view", type: "float32", isComplex: false, isArray: false },
      { name: "min_range", type: "float32", isComplex: false, isArray: false },
      { name: "max_range", type: "float32", isComplex: false, isArray: false },
      { name: "range", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/RelativeHumidity": {
    name: "sensor_msgs/RelativeHumidity",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "relative_humidity", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/Temperature": {
    name: "sensor_msgs/Temperature",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "temperature", type: "float64", isComplex: false, isArray: false },
      { name: "variance", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "sensor_msgs/TimeReference": {
    name: "sensor_msgs/TimeReference",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "time_ref", type: "time", isComplex: false, isArray: false },
      { name: "source", type: "string", isComplex: false, isArray: false }
    ]
  },
  "shape_msgs/Mesh": {
    name: "shape_msgs/Mesh",
    definitions: [
      { name: "triangles", type: "shape_msgs/MeshTriangle", isComplex: true, isArray: true },
      { name: "vertices", type: "geometry_msgs/Point", isComplex: true, isArray: true }
    ]
  },
  "shape_msgs/MeshTriangle": {
    name: "shape_msgs/MeshTriangle",
    definitions: [
      { name: "vertex_indices", type: "uint32", isComplex: false, isArray: true, arrayLength: 3 }
    ]
  },
  "shape_msgs/Plane": {
    name: "shape_msgs/Plane",
    definitions: [
      { name: "coef", type: "float64", isComplex: false, isArray: true, arrayLength: 4 }
    ]
  },
  "shape_msgs/SolidPrimitive": {
    name: "shape_msgs/SolidPrimitive",
    definitions: [
      { name: "BOX", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "SPHERE", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "CYLINDER", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "CONE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "PRISM", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      { name: "dimensions", type: "float64", isComplex: false, isArray: true, arrayUpperBound: 3 },
      { name: "BOX_X", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "BOX_Y", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "BOX_Z", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "SPHERE_RADIUS", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CYLINDER_HEIGHT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CYLINDER_RADIUS", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "CONE_HEIGHT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "CONE_RADIUS", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "PRISM_HEIGHT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "polygon", type: "geometry_msgs/Polygon", isComplex: true, isArray: false }
    ]
  },
  "statistics_msgs/MetricsMessage": {
    name: "statistics_msgs/MetricsMessage",
    definitions: [
      { name: "measurement_source_name", type: "string", isComplex: false, isArray: false },
      { name: "metrics_source", type: "string", isComplex: false, isArray: false },
      { name: "unit", type: "string", isComplex: false, isArray: false },
      { name: "window_start", type: "time", isComplex: false, isArray: false },
      { name: "window_stop", type: "time", isComplex: false, isArray: false },
      {
        name: "statistics",
        type: "statistics_msgs/StatisticDataPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "statistics_msgs/StatisticDataPoint": {
    name: "statistics_msgs/StatisticDataPoint",
    definitions: [
      { name: "data_type", type: "uint8", isComplex: false, isArray: false },
      { name: "data", type: "float64", isComplex: false, isArray: false }
    ]
  },
  "statistics_msgs/StatisticDataType": {
    name: "statistics_msgs/StatisticDataType",
    definitions: [
      {
        name: "STATISTICS_DATA_TYPE_UNINITIALIZED",
        type: "uint8",
        isConstant: true,
        value: 0,
        valueText: "0"
      },
      {
        name: "STATISTICS_DATA_TYPE_AVERAGE",
        type: "uint8",
        isConstant: true,
        value: 1,
        valueText: "1"
      },
      {
        name: "STATISTICS_DATA_TYPE_MINIMUM",
        type: "uint8",
        isConstant: true,
        value: 2,
        valueText: "2"
      },
      {
        name: "STATISTICS_DATA_TYPE_MAXIMUM",
        type: "uint8",
        isConstant: true,
        value: 3,
        valueText: "3"
      },
      {
        name: "STATISTICS_DATA_TYPE_STDDEV",
        type: "uint8",
        isConstant: true,
        value: 4,
        valueText: "4"
      },
      {
        name: "STATISTICS_DATA_TYPE_SAMPLE_COUNT",
        type: "uint8",
        isConstant: true,
        value: 5,
        valueText: "5"
      }
    ]
  },
  "std_msgs/Bool": {
    name: "std_msgs/Bool",
    definitions: [{ name: "data", type: "bool", isComplex: false, isArray: false }]
  },
  "std_msgs/Byte": {
    name: "std_msgs/Byte",
    definitions: [{ name: "data", type: "int8", isComplex: false, isArray: false }]
  },
  "std_msgs/ByteMultiArray": {
    name: "std_msgs/ByteMultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/MultiArrayLayout": {
    name: "std_msgs/MultiArrayLayout",
    definitions: [
      { name: "dim", type: "std_msgs/MultiArrayDimension", isComplex: true, isArray: true },
      { name: "data_offset", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/MultiArrayDimension": {
    name: "std_msgs/MultiArrayDimension",
    definitions: [
      { name: "label", type: "string", isComplex: false, isArray: false },
      { name: "size", type: "uint32", isComplex: false, isArray: false },
      { name: "stride", type: "uint32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/Char": {
    name: "std_msgs/Char",
    definitions: [{ name: "data", type: "uint8", isComplex: false, isArray: false }]
  },
  "std_msgs/ColorRGBA": {
    name: "std_msgs/ColorRGBA",
    definitions: [
      { name: "r", type: "float32", isComplex: false, isArray: false },
      { name: "g", type: "float32", isComplex: false, isArray: false },
      { name: "b", type: "float32", isComplex: false, isArray: false },
      { name: "a", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "std_msgs/Empty": { name: "std_msgs/Empty", definitions: [] },
  "std_msgs/Float32": {
    name: "std_msgs/Float32",
    definitions: [{ name: "data", type: "float32", isComplex: false, isArray: false }]
  },
  "std_msgs/Float32MultiArray": {
    name: "std_msgs/Float32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "float32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Float64": {
    name: "std_msgs/Float64",
    definitions: [{ name: "data", type: "float64", isComplex: false, isArray: false }]
  },
  "std_msgs/Float64MultiArray": {
    name: "std_msgs/Float64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "float64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int16": {
    name: "std_msgs/Int16",
    definitions: [{ name: "data", type: "int16", isComplex: false, isArray: false }]
  },
  "std_msgs/Int16MultiArray": {
    name: "std_msgs/Int16MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int16", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int32": {
    name: "std_msgs/Int32",
    definitions: [{ name: "data", type: "int32", isComplex: false, isArray: false }]
  },
  "std_msgs/Int32MultiArray": {
    name: "std_msgs/Int32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int64": {
    name: "std_msgs/Int64",
    definitions: [{ name: "data", type: "int64", isComplex: false, isArray: false }]
  },
  "std_msgs/Int64MultiArray": {
    name: "std_msgs/Int64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/Int8": {
    name: "std_msgs/Int8",
    definitions: [{ name: "data", type: "int8", isComplex: false, isArray: false }]
  },
  "std_msgs/Int8MultiArray": {
    name: "std_msgs/Int8MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "int8", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/String": {
    name: "std_msgs/String",
    definitions: [{ name: "data", type: "string", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt16": {
    name: "std_msgs/UInt16",
    definitions: [{ name: "data", type: "uint16", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt16MultiArray": {
    name: "std_msgs/UInt16MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint16", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt32": {
    name: "std_msgs/UInt32",
    definitions: [{ name: "data", type: "uint32", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt32MultiArray": {
    name: "std_msgs/UInt32MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint32", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt64": {
    name: "std_msgs/UInt64",
    definitions: [{ name: "data", type: "uint64", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt64MultiArray": {
    name: "std_msgs/UInt64MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint64", isComplex: false, isArray: true }
    ]
  },
  "std_msgs/UInt8": {
    name: "std_msgs/UInt8",
    definitions: [{ name: "data", type: "uint8", isComplex: false, isArray: false }]
  },
  "std_msgs/UInt8MultiArray": {
    name: "std_msgs/UInt8MultiArray",
    definitions: [
      { name: "layout", type: "std_msgs/MultiArrayLayout", isComplex: true, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "stereo_msgs/DisparityImage": {
    name: "stereo_msgs/DisparityImage",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "image", type: "sensor_msgs/Image", isComplex: true, isArray: false },
      { name: "f", type: "float32", isComplex: false, isArray: false },
      { name: "t", type: "float32", isComplex: false, isArray: false },
      {
        name: "valid_window",
        type: "sensor_msgs/RegionOfInterest",
        isComplex: true,
        isArray: false
      },
      { name: "min_disparity", type: "float32", isComplex: false, isArray: false },
      { name: "max_disparity", type: "float32", isComplex: false, isArray: false },
      { name: "delta_d", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "test_msgs/Builtins": {
    name: "test_msgs/Builtins",
    definitions: [
      { name: "duration_value", type: "duration", isComplex: false, isArray: false },
      { name: "time_value", type: "time", isComplex: false, isArray: false }
    ]
  },
  "tf2_msgs/TF2Error": {
    name: "tf2_msgs/TF2Error",
    definitions: [
      { name: "NO_ERROR", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "LOOKUP_ERROR", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "CONNECTIVITY_ERROR", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "EXTRAPOLATION_ERROR", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "INVALID_ARGUMENT_ERROR", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "TIMEOUT_ERROR", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "TRANSFORM_ERROR", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "error", type: "uint8", isComplex: false, isArray: false },
      { name: "error_string", type: "string", isComplex: false, isArray: false }
    ]
  },
  "tf2_msgs/TFMessage": {
    name: "tf2_msgs/TFMessage",
    definitions: [
      {
        name: "transforms",
        type: "geometry_msgs/TransformStamped",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectory": {
    name: "trajectory_msgs/JointTrajectory",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      {
        name: "points",
        type: "trajectory_msgs/JointTrajectoryPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/JointTrajectoryPoint": {
    name: "trajectory_msgs/JointTrajectoryPoint",
    definitions: [
      { name: "positions", type: "float64", isComplex: false, isArray: true },
      { name: "velocities", type: "float64", isComplex: false, isArray: true },
      { name: "accelerations", type: "float64", isComplex: false, isArray: true },
      { name: "effort", type: "float64", isComplex: false, isArray: true },
      { name: "time_from_start", type: "duration", isComplex: false, isArray: false }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectory": {
    name: "trajectory_msgs/MultiDOFJointTrajectory",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "joint_names", type: "string", isComplex: false, isArray: true },
      {
        name: "points",
        type: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "trajectory_msgs/MultiDOFJointTrajectoryPoint": {
    name: "trajectory_msgs/MultiDOFJointTrajectoryPoint",
    definitions: [
      { name: "transforms", type: "geometry_msgs/Transform", isComplex: true, isArray: true },
      { name: "velocities", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "accelerations", type: "geometry_msgs/Twist", isComplex: true, isArray: true },
      { name: "time_from_start", type: "duration", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/ImageMarker": {
    name: "visualization_msgs/ImageMarker",
    definitions: [
      { name: "CIRCLE", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "LINE_STRIP", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "LINE_LIST", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "POLYGON", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "POINTS", type: "int32", isConstant: true, value: 4, valueText: "4" },
      { name: "ADD", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "REMOVE", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ns", type: "string", isComplex: false, isArray: false },
      { name: "id", type: "int32", isComplex: false, isArray: false },
      { name: "type", type: "int32", isComplex: false, isArray: false },
      { name: "action", type: "int32", isComplex: false, isArray: false },
      { name: "position", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "scale", type: "float32", isComplex: false, isArray: false },
      { name: "outline_color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "filled", type: "uint8", isComplex: false, isArray: false },
      { name: "fill_color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "lifetime", type: "duration", isComplex: false, isArray: false },
      { name: "points", type: "geometry_msgs/Point", isComplex: true, isArray: true },
      { name: "outline_colors", type: "std_msgs/ColorRGBA", isComplex: true, isArray: true }
    ]
  },
  "visualization_msgs/InteractiveMarker": {
    name: "visualization_msgs/InteractiveMarker",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false },
      { name: "scale", type: "float32", isComplex: false, isArray: false },
      {
        name: "menu_entries",
        type: "visualization_msgs/MenuEntry",
        isComplex: true,
        isArray: true
      },
      {
        name: "controls",
        type: "visualization_msgs/InteractiveMarkerControl",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "visualization_msgs/MenuEntry": {
    name: "visualization_msgs/MenuEntry",
    definitions: [
      { name: "id", type: "uint32", isComplex: false, isArray: false },
      { name: "parent_id", type: "uint32", isComplex: false, isArray: false },
      { name: "title", type: "string", isComplex: false, isArray: false },
      { name: "command", type: "string", isComplex: false, isArray: false },
      { name: "FEEDBACK", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "ROSRUN", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "ROSLAUNCH", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "command_type", type: "uint8", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerControl": {
    name: "visualization_msgs/InteractiveMarkerControl",
    definitions: [
      { name: "name", type: "string", isComplex: false, isArray: false },
      { name: "orientation", type: "geometry_msgs/Quaternion", isComplex: true, isArray: false },
      { name: "INHERIT", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "FIXED", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "VIEW_FACING", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "orientation_mode", type: "uint8", isComplex: false, isArray: false },
      { name: "NONE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "MENU", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "BUTTON", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "MOVE_AXIS", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "MOVE_PLANE", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "ROTATE_AXIS", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "MOVE_ROTATE", type: "uint8", isConstant: true, value: 6, valueText: "6" },
      { name: "MOVE_3D", type: "uint8", isConstant: true, value: 7, valueText: "7" },
      { name: "ROTATE_3D", type: "uint8", isConstant: true, value: 8, valueText: "8" },
      { name: "MOVE_ROTATE_3D", type: "uint8", isConstant: true, value: 9, valueText: "9" },
      { name: "interaction_mode", type: "uint8", isComplex: false, isArray: false },
      { name: "always_visible", type: "bool", isComplex: false, isArray: false },
      { name: "markers", type: "visualization_msgs/Marker", isComplex: true, isArray: true },
      { name: "independent_marker_orientation", type: "bool", isComplex: false, isArray: false },
      { name: "description", type: "string", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/Marker": {
    name: "visualization_msgs/Marker",
    definitions: [
      { name: "ARROW", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "CUBE", type: "int32", isConstant: true, value: 1, valueText: "1" },
      { name: "SPHERE", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "CYLINDER", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "LINE_STRIP", type: "int32", isConstant: true, value: 4, valueText: "4" },
      { name: "LINE_LIST", type: "int32", isConstant: true, value: 5, valueText: "5" },
      { name: "CUBE_LIST", type: "int32", isConstant: true, value: 6, valueText: "6" },
      { name: "SPHERE_LIST", type: "int32", isConstant: true, value: 7, valueText: "7" },
      { name: "POINTS", type: "int32", isConstant: true, value: 8, valueText: "8" },
      { name: "TEXT_VIEW_FACING", type: "int32", isConstant: true, value: 9, valueText: "9" },
      { name: "MESH_RESOURCE", type: "int32", isConstant: true, value: 10, valueText: "10" },
      { name: "TRIANGLE_LIST", type: "int32", isConstant: true, value: 11, valueText: "11" },
      { name: "ADD", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "MODIFY", type: "int32", isConstant: true, value: 0, valueText: "0" },
      { name: "DELETE", type: "int32", isConstant: true, value: 2, valueText: "2" },
      { name: "DELETEALL", type: "int32", isConstant: true, value: 3, valueText: "3" },
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "ns", type: "string", isComplex: false, isArray: false },
      { name: "id", type: "int32", isComplex: false, isArray: false },
      { name: "type", type: "int32", isComplex: false, isArray: false },
      { name: "action", type: "int32", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "scale", type: "geometry_msgs/Vector3", isComplex: true, isArray: false },
      { name: "color", type: "std_msgs/ColorRGBA", isComplex: true, isArray: false },
      { name: "lifetime", type: "duration", isComplex: false, isArray: false },
      { name: "frame_locked", type: "bool", isComplex: false, isArray: false },
      { name: "points", type: "geometry_msgs/Point", isComplex: true, isArray: true },
      { name: "colors", type: "std_msgs/ColorRGBA", isComplex: true, isArray: true },
      { name: "texture_resource", type: "string", isComplex: false, isArray: false },
      { name: "texture", type: "sensor_msgs/CompressedImage", isComplex: true, isArray: false },
      {
        name: "uv_coordinates",
        type: "visualization_msgs/UVCoordinate",
        isComplex: true,
        isArray: true
      },
      { name: "text", type: "string", isComplex: false, isArray: false },
      { name: "mesh_resource", type: "string", isComplex: false, isArray: false },
      { name: "mesh_file", type: "visualization_msgs/MeshFile", isComplex: true, isArray: false },
      { name: "mesh_use_embedded_materials", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/UVCoordinate": {
    name: "visualization_msgs/UVCoordinate",
    definitions: [
      { name: "u", type: "float32", isComplex: false, isArray: false },
      { name: "v", type: "float32", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/MeshFile": {
    name: "visualization_msgs/MeshFile",
    definitions: [
      { name: "filename", type: "string", isComplex: false, isArray: false },
      { name: "data", type: "uint8", isComplex: false, isArray: true }
    ]
  },
  "visualization_msgs/InteractiveMarkerFeedback": {
    name: "visualization_msgs/InteractiveMarkerFeedback",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "client_id", type: "string", isComplex: false, isArray: false },
      { name: "marker_name", type: "string", isComplex: false, isArray: false },
      { name: "control_name", type: "string", isComplex: false, isArray: false },
      { name: "KEEP_ALIVE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "POSE_UPDATE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "MENU_SELECT", type: "uint8", isConstant: true, value: 2, valueText: "2" },
      { name: "BUTTON_CLICK", type: "uint8", isConstant: true, value: 3, valueText: "3" },
      { name: "MOUSE_DOWN", type: "uint8", isConstant: true, value: 4, valueText: "4" },
      { name: "MOUSE_UP", type: "uint8", isConstant: true, value: 5, valueText: "5" },
      { name: "event_type", type: "uint8", isComplex: false, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "menu_entry_id", type: "uint32", isComplex: false, isArray: false },
      { name: "mouse_point", type: "geometry_msgs/Point", isComplex: true, isArray: false },
      { name: "mouse_point_valid", type: "bool", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerInit": {
    name: "visualization_msgs/InteractiveMarkerInit",
    definitions: [
      { name: "server_id", type: "string", isComplex: false, isArray: false },
      { name: "seq_num", type: "uint64", isComplex: false, isArray: false },
      {
        name: "markers",
        type: "visualization_msgs/InteractiveMarker",
        isComplex: true,
        isArray: true
      }
    ]
  },
  "visualization_msgs/InteractiveMarkerPose": {
    name: "visualization_msgs/InteractiveMarkerPose",
    definitions: [
      { name: "header", type: "std_msgs/Header", isComplex: true, isArray: false },
      { name: "pose", type: "geometry_msgs/Pose", isComplex: true, isArray: false },
      { name: "name", type: "string", isComplex: false, isArray: false }
    ]
  },
  "visualization_msgs/InteractiveMarkerUpdate": {
    name: "visualization_msgs/InteractiveMarkerUpdate",
    definitions: [
      { name: "server_id", type: "string", isComplex: false, isArray: false },
      { name: "seq_num", type: "uint64", isComplex: false, isArray: false },
      { name: "KEEP_ALIVE", type: "uint8", isConstant: true, value: 0, valueText: "0" },
      { name: "UPDATE", type: "uint8", isConstant: true, value: 1, valueText: "1" },
      { name: "type", type: "uint8", isComplex: false, isArray: false },
      {
        name: "markers",
        type: "visualization_msgs/InteractiveMarker",
        isComplex: true,
        isArray: true
      },
      {
        name: "poses",
        type: "visualization_msgs/InteractiveMarkerPose",
        isComplex: true,
        isArray: true
      },
      { name: "erases", type: "string", isComplex: false, isArray: true }
    ]
  },
  "visualization_msgs/MarkerArray": {
    name: "visualization_msgs/MarkerArray",
    definitions: [
      { name: "markers", type: "visualization_msgs/Marker", isComplex: true, isArray: true }
    ]
  }
};
var index_esm = {
  ros1: ros1Definitions,
  ros2galactic: ros2galacticDefinitions,
  ros2humble: ros2humbleDefinitions
};
var index_esm$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  ros1: ros1Definitions,
  ros2galactic: ros2galacticDefinitions,
  ros2humble: ros2humbleDefinitions,
  "default": index_esm
});
var require$$0 = /* @__PURE__ */ getAugmentedNamespace(index_esm$1);
var dist$3 = {};
var MessageReader$1 = {};
var dist$2 = {};
var CdrReader$1 = {};
var getEncapsulationKindInfo$1 = {};
var EncapsulationKind = {};
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.EncapsulationKind = void 0;
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
  })(exports.EncapsulationKind || (exports.EncapsulationKind = {}));
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
var isBigEndian$2 = {};
Object.defineProperty(isBigEndian$2, "__esModule", { value: true });
isBigEndian$2.isBigEndian = void 0;
const endianTestArray = new Uint8Array(4);
const endianTestView = new Uint32Array(endianTestArray.buffer);
endianTestView[0] = 1;
function isBigEndian$1() {
  return endianTestArray[3] === 1;
}
isBigEndian$2.isBigEndian = isBigEndian$1;
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
const isBigEndian_1$1 = isBigEndian$2;
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
const isBigEndian_1 = isBigEndian$2;
const lengthCodes_1 = lengthCodes;
const reservedPIDs_1 = reservedPIDs;
const textEncoder = new TextEncoder();
class CdrWriter {
  constructor(options2 = {}) {
    if (options2.buffer != void 0) {
      this.buffer = options2.buffer;
    } else if (options2.size != void 0) {
      this.buffer = new ArrayBuffer(options2.size);
    } else {
      this.buffer = new ArrayBuffer(CdrWriter.DEFAULT_CAPACITY);
    }
    const kind = options2.kind ?? EncapsulationKind_1.EncapsulationKind.CDR_LE;
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
  __exportStar(CdrReader$1, exports);
  __exportStar(CdrSizeCalculator$1, exports);
  __exportStar(CdrWriter$1, exports);
  __exportStar(EncapsulationKind, exports);
})(dist$2);
Object.defineProperty(MessageReader$1, "__esModule", { value: true });
MessageReader$1.MessageReader = void 0;
const cdr_1$1 = dist$2;
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
    const reader = new cdr_1$1.CdrReader(buffer);
    return this.readComplexType(this.rootDefinition, reader);
  }
  readComplexType(definition, reader) {
    const msg = {};
    if (definition.length === 0) {
      reader.uint8();
      return msg;
    }
    for (const field of definition) {
      if (field.isConstant === true) {
        continue;
      }
      if (field.isComplex === true) {
        const nestedDefinition = this.definitions.get(field.type);
        if (nestedDefinition == void 0) {
          throw new Error(`Unrecognized complex type ${field.type}`);
        }
        if (field.isArray === true) {
          const arrayLength = field.arrayLength ?? reader.sequenceLength();
          const array = [];
          for (let i = 0; i < arrayLength; i++) {
            array.push(this.readComplexType(nestedDefinition, reader));
          }
          msg[field.name] = array;
        } else {
          msg[field.name] = this.readComplexType(nestedDefinition, reader);
        }
      } else {
        if (field.isArray === true) {
          const deser = typedArrayDeserializers.get(field.type);
          if (deser == void 0) {
            throw new Error(`Unrecognized primitive array type ${field.type}[]`);
          }
          const arrayLength = field.arrayLength ?? reader.sequenceLength();
          msg[field.name] = deser(reader, arrayLength);
        } else {
          const deser = deserializers$1.get(field.type);
          if (deser == void 0) {
            throw new Error(`Unrecognized primitive type ${field.type}`);
          }
          msg[field.name] = deser(reader);
        }
      }
    }
    return msg;
  }
}
MessageReader$1.MessageReader = MessageReader;
function isConstantModule$1(def) {
  return def.definitions.length > 0 && def.definitions.every((field) => field.isConstant);
}
const deserializers$1 = /* @__PURE__ */ new Map([
  ["bool", (reader) => Boolean(reader.int8())],
  ["int8", (reader) => reader.int8()],
  ["uint8", (reader) => reader.uint8()],
  ["int16", (reader) => reader.int16()],
  ["uint16", (reader) => reader.uint16()],
  ["int32", (reader) => reader.int32()],
  ["uint32", (reader) => reader.uint32()],
  ["int64", (reader) => reader.int64()],
  ["uint64", (reader) => reader.uint64()],
  ["float32", (reader) => reader.float32()],
  ["float64", (reader) => reader.float64()],
  ["string", (reader) => reader.string()],
  ["time", (reader) => ({ sec: reader.int32(), nsec: reader.uint32() })],
  ["duration", (reader) => ({ sec: reader.int32(), nsec: reader.uint32() })]
]);
const typedArrayDeserializers = /* @__PURE__ */ new Map([
  ["bool", readBoolArray],
  ["int8", (reader, count) => reader.int8Array(count)],
  ["uint8", (reader, count) => reader.uint8Array(count)],
  ["int16", (reader, count) => reader.int16Array(count)],
  ["uint16", (reader, count) => reader.uint16Array(count)],
  ["int32", (reader, count) => reader.int32Array(count)],
  ["uint32", (reader, count) => reader.uint32Array(count)],
  ["int64", (reader, count) => reader.int64Array(count)],
  ["uint64", (reader, count) => reader.uint64Array(count)],
  ["float32", (reader, count) => reader.float32Array(count)],
  ["float64", (reader, count) => reader.float64Array(count)],
  ["string", readStringArray],
  ["time", readTimeArray],
  ["duration", readTimeArray]
]);
function readBoolArray(reader, count) {
  const array = new Array(count);
  for (let i = 0; i < count; i++) {
    array[i] = Boolean(reader.int8());
  }
  return array;
}
function readStringArray(reader, count) {
  const array = new Array(count);
  for (let i = 0; i < count; i++) {
    array[i] = reader.string();
  }
  return array;
}
function readTimeArray(reader, count) {
  const array = new Array(count);
  for (let i = 0; i < count; i++) {
    const sec = reader.int32();
    const nsec = reader.uint32();
    array[i] = { sec, nsec };
  }
  return array;
}
var MessageWriter$1 = {};
Object.defineProperty(MessageWriter$1, "__esModule", { value: true });
MessageWriter$1.MessageWriter = void 0;
const cdr_1 = dist$2;
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
  ["int32", int32],
  ["uint32", uint32],
  ["int64", int64],
  ["uint64", uint64],
  ["float32", float32],
  ["float64", float64],
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
  calculateByteSize(message) {
    return this.byteSize(this.rootDefinition, message, 4);
  }
  writeMessage(message, output) {
    const writer = new cdr_1.CdrWriter({
      buffer: output,
      size: output ? void 0 : this.calculateByteSize(message)
    });
    this.write(this.rootDefinition, message, writer);
    return writer.data;
  }
  byteSize(definition, message, offset) {
    const messageObj = message;
    let newOffset = offset;
    if (definition.length === 0) {
      return offset + this.getPrimitiveSize("uint8");
    }
    for (const field of definition) {
      if (field.isConstant === true) {
        continue;
      }
      const nestedMessage = messageObj?.[field.name];
      if (field.isArray === true) {
        const arrayLength = field.arrayLength ?? fieldLength(nestedMessage);
        const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
        const dataArray = dataIsArray ? nestedMessage : [];
        if (field.arrayLength == void 0) {
          newOffset += padding(newOffset, 4);
          newOffset += 4;
        }
        if (field.isComplex === true) {
          const nestedDefinition = this.getDefinition(field.type);
          for (let i = 0; i < arrayLength; i++) {
            const entry = dataArray[i] ?? {};
            newOffset = this.byteSize(nestedDefinition, entry, newOffset);
          }
        } else if (field.type === "string") {
          for (let i = 0; i < arrayLength; i++) {
            const entry = dataArray[i] ?? "";
            newOffset += padding(newOffset, 4);
            newOffset += 4 + entry.length + 1;
          }
        } else {
          const entrySize = this.getPrimitiveSize(field.type);
          const alignment = field.type === "time" || field.type === "duration" ? 4 : entrySize;
          newOffset += padding(newOffset, alignment);
          newOffset += entrySize * arrayLength;
        }
      } else {
        if (field.isComplex === true) {
          const nestedDefinition = this.getDefinition(field.type);
          const entry = nestedMessage ?? {};
          newOffset = this.byteSize(nestedDefinition, entry, newOffset);
        } else if (field.type === "string") {
          const entry = typeof nestedMessage === "string" ? nestedMessage : "";
          newOffset += padding(newOffset, 4);
          newOffset += 4 + entry.length + 1;
        } else {
          const entrySize = this.getPrimitiveSize(field.type);
          const alignment = field.type === "time" || field.type === "duration" ? 4 : entrySize;
          newOffset += padding(newOffset, alignment);
          newOffset += entrySize;
        }
      }
    }
    return newOffset;
  }
  write(definition, message, writer) {
    const messageObj = message;
    if (definition.length === 0) {
      uint8(0, 0, writer);
      return;
    }
    for (const field of definition) {
      if (field.isConstant === true) {
        continue;
      }
      const nestedMessage = messageObj?.[field.name];
      if (field.isArray === true) {
        const arrayLength = field.arrayLength ?? fieldLength(nestedMessage);
        const dataIsArray = Array.isArray(nestedMessage) || ArrayBuffer.isView(nestedMessage);
        const dataArray = dataIsArray ? nestedMessage : [];
        if (field.arrayLength == void 0) {
          writer.sequenceLength(arrayLength);
        }
        if (field.isComplex === true) {
          const nestedDefinition = this.getDefinition(field.type);
          for (let i = 0; i < arrayLength; i++) {
            const entry = dataArray[i] ?? {};
            this.write(nestedDefinition, entry, writer);
          }
        } else {
          const arrayWriter = this.getPrimitiveArrayWriter(field.type);
          arrayWriter(nestedMessage, field.defaultValue, writer);
        }
      } else {
        if (field.isComplex === true) {
          const nestedDefinition = this.getDefinition(field.type);
          const entry = nestedMessage ?? {};
          this.write(nestedDefinition, entry, writer);
        } else {
          const primitiveWriter = this.getPrimitiveWriter(field.type);
          primitiveWriter(nestedMessage, field.defaultValue, writer);
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
    const writer = PRIMITIVE_WRITERS.get(primitiveType);
    if (writer == void 0) {
      throw new Error(`Unrecognized primitive type ${primitiveType}`);
    }
    return writer;
  }
  getPrimitiveArrayWriter(primitiveType) {
    const writer = PRIMITIVE_ARRAY_WRITERS.get(primitiveType);
    if (writer == void 0) {
      throw new Error(`Unrecognized primitive type ${primitiveType}[]`);
    }
    return writer;
  }
}
MessageWriter$1.MessageWriter = MessageWriter;
function isConstantModule(def) {
  return def.definitions.length > 0 && def.definitions.every((field) => field.isConstant);
}
function fieldLength(value) {
  const length = value?.length;
  return typeof length === "number" ? length : 0;
}
function bool(value, defaultValue, writer) {
  const boolValue = typeof value === "boolean" ? value : defaultValue ?? false;
  writer.int8(boolValue ? 1 : 0);
}
function int8(value, defaultValue, writer) {
  writer.int8(typeof value === "number" ? value : defaultValue ?? 0);
}
function uint8(value, defaultValue, writer) {
  writer.uint8(typeof value === "number" ? value : defaultValue ?? 0);
}
function int16(value, defaultValue, writer) {
  writer.int16(typeof value === "number" ? value : defaultValue ?? 0);
}
function uint16(value, defaultValue, writer) {
  writer.uint16(typeof value === "number" ? value : defaultValue ?? 0);
}
function int32(value, defaultValue, writer) {
  writer.int32(typeof value === "number" ? value : defaultValue ?? 0);
}
function uint32(value, defaultValue, writer) {
  writer.uint32(typeof value === "number" ? value : defaultValue ?? 0);
}
function int64(value, defaultValue, writer) {
  if (typeof value === "bigint") {
    writer.int64(value);
  } else if (typeof value === "number") {
    writer.int64(BigInt(value));
  } else {
    writer.int64(defaultValue ?? 0n);
  }
}
function uint64(value, defaultValue, writer) {
  if (typeof value === "bigint") {
    writer.uint64(value);
  } else if (typeof value === "number") {
    writer.uint64(BigInt(value));
  } else {
    writer.uint64(defaultValue ?? 0n);
  }
}
function float32(value, defaultValue, writer) {
  writer.float32(typeof value === "number" ? value : defaultValue ?? 0);
}
function float64(value, defaultValue, writer) {
  writer.float64(typeof value === "number" ? value : defaultValue ?? 0);
}
function string(value, defaultValue, writer) {
  writer.string(typeof value === "string" ? value : defaultValue ?? "");
}
function time(value, _defaultValue, writer) {
  if (value == void 0) {
    writer.int32(0);
    writer.uint32(0);
    return;
  }
  const timeObj = value;
  writer.int32(timeObj.sec ?? 0);
  writer.uint32(timeObj.nsec ?? timeObj.nanosec ?? 0);
}
function boolArray(value, defaultValue, writer) {
  if (Array.isArray(value)) {
    const array = new Int8Array(value);
    writer.int8Array(array);
  } else {
    writer.int8Array(defaultValue ?? []);
  }
}
function int8Array(value, defaultValue, writer) {
  if (value instanceof Int8Array) {
    writer.int8Array(value);
  } else if (Array.isArray(value)) {
    const array = new Int8Array(value);
    writer.int8Array(array);
  } else {
    writer.int8Array(defaultValue ?? []);
  }
}
function uint8Array(value, defaultValue, writer) {
  if (value instanceof Uint8Array) {
    writer.uint8Array(value);
  } else if (value instanceof Uint8ClampedArray) {
    writer.uint8Array(new Uint8Array(value));
  } else if (Array.isArray(value)) {
    const array = new Uint8Array(value);
    writer.uint8Array(array);
  } else {
    writer.uint8Array(defaultValue ?? []);
  }
}
function int16Array(value, defaultValue, writer) {
  if (value instanceof Int16Array) {
    writer.int16Array(value);
  } else if (Array.isArray(value)) {
    const array = new Int16Array(value);
    writer.int16Array(array);
  } else {
    writer.int16Array(defaultValue ?? []);
  }
}
function uint16Array(value, defaultValue, writer) {
  if (value instanceof Uint16Array) {
    writer.uint16Array(value);
  } else if (Array.isArray(value)) {
    const array = new Uint16Array(value);
    writer.uint16Array(array);
  } else {
    writer.uint16Array(defaultValue ?? []);
  }
}
function int32Array(value, defaultValue, writer) {
  if (value instanceof Int32Array) {
    writer.int32Array(value);
  } else if (Array.isArray(value)) {
    const array = new Int32Array(value);
    writer.int32Array(array);
  } else {
    writer.int32Array(defaultValue ?? []);
  }
}
function uint32Array(value, defaultValue, writer) {
  if (value instanceof Uint32Array) {
    writer.uint32Array(value);
  } else if (Array.isArray(value)) {
    const array = new Uint32Array(value);
    writer.uint32Array(array);
  } else {
    writer.uint32Array(defaultValue ?? []);
  }
}
function int64Array(value, defaultValue, writer) {
  if (value instanceof BigInt64Array) {
    writer.int64Array(value);
  } else if (Array.isArray(value)) {
    const array = new BigInt64Array(value);
    writer.int64Array(array);
  } else {
    writer.int64Array(defaultValue ?? []);
  }
}
function uint64Array(value, defaultValue, writer) {
  if (value instanceof BigUint64Array) {
    writer.uint64Array(value);
  } else if (Array.isArray(value)) {
    const array = new BigUint64Array(value);
    writer.uint64Array(array);
  } else {
    writer.uint64Array(defaultValue ?? []);
  }
}
function float32Array(value, defaultValue, writer) {
  if (value instanceof Float32Array) {
    writer.float32Array(value);
  } else if (Array.isArray(value)) {
    const array = new Float32Array(value);
    writer.float32Array(array);
  } else {
    writer.float32Array(defaultValue ?? []);
  }
}
function float64Array(value, defaultValue, writer) {
  if (value instanceof Float64Array) {
    writer.float64Array(value);
  } else if (Array.isArray(value)) {
    const array = new Float64Array(value);
    writer.float64Array(array);
  } else {
    writer.float64Array(defaultValue ?? []);
  }
}
function stringArray(value, defaultValue, writer) {
  if (Array.isArray(value)) {
    for (const item of value) {
      writer.string(typeof item === "string" ? item : "");
    }
  } else {
    const array = defaultValue ?? [];
    for (const item of array) {
      writer.string(item);
    }
  }
}
function timeArray(value, _defaultValue, writer) {
  if (Array.isArray(value)) {
    for (const item of value) {
      time(item, void 0, writer);
    }
  }
}
function padding(offset, byteWidth) {
  const alignment = (offset - 4) % byteWidth;
  return alignment > 0 ? byteWidth - alignment : 0;
}
(function(exports) {
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
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(MessageReader$1, exports);
  __exportStar(MessageWriter$1, exports);
})(dist$3);
var internal = {};
var tslib = { exports: {} };
(function(module) {
  var __extends;
  var __assign;
  var __rest;
  var __decorate;
  var __param;
  var __esDecorate;
  var __runInitializers;
  var __propKey;
  var __setFunctionName;
  var __metadata;
  var __awaiter;
  var __generator;
  var __exportStar;
  var __values;
  var __read;
  var __spread;
  var __spreadArrays;
  var __spreadArray;
  var __await;
  var __asyncGenerator;
  var __asyncDelegator;
  var __asyncValues;
  var __makeTemplateObject;
  var __importStar;
  var __importDefault2;
  var __classPrivateFieldGet;
  var __classPrivateFieldSet;
  var __classPrivateFieldIn;
  var __createBinding;
  var __addDisposableResource;
  var __disposeResources;
  (function(factory) {
    var root = typeof commonjsGlobal === "object" ? commonjsGlobal : typeof self === "object" ? self : typeof this === "object" ? this : {};
    {
      factory(createExporter(root, createExporter(module.exports)));
    }
    function createExporter(exports, previous) {
      if (exports !== root) {
        if (typeof Object.create === "function") {
          Object.defineProperty(exports, "__esModule", { value: true });
        } else {
          exports.__esModule = true;
        }
      }
      return function(id, v) {
        return exports[id] = previous ? previous(id, v) : v;
      };
    }
  })(function(exporter) {
    var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(d, b) {
      d.__proto__ = b;
    } || function(d, b) {
      for (var p in b)
        if (Object.prototype.hasOwnProperty.call(b, p))
          d[p] = b[p];
    };
    __extends = function(d, b) {
      if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() {
        this.constructor = d;
      }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
    __assign = Object.assign || function(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s)
          if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
      }
      return t;
    };
    __rest = function(s, e) {
      var t = {};
      for (var p in s)
        if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
          t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    };
    __decorate = function(decorators, target, key, desc) {
      var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
        r = Reflect.decorate(decorators, target, key, desc);
      else
        for (var i = decorators.length - 1; i >= 0; i--)
          if (d = decorators[i])
            r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    __param = function(paramIndex, decorator) {
      return function(target, key) {
        decorator(target, key, paramIndex);
      };
    };
    __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
      function accept(f) {
        if (f !== void 0 && typeof f !== "function")
          throw new TypeError("Function expected");
        return f;
      }
      var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
      var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
      var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
      var _, done = false;
      for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn)
          context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access)
          context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
          if (done)
            throw new TypeError("Cannot add initializers after decoration has completed");
          extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
          if (result === void 0)
            continue;
          if (result === null || typeof result !== "object")
            throw new TypeError("Object expected");
          if (_ = accept(result.get))
            descriptor.get = _;
          if (_ = accept(result.set))
            descriptor.set = _;
          if (_ = accept(result.init))
            initializers.unshift(_);
        } else if (_ = accept(result)) {
          if (kind === "field")
            initializers.unshift(_);
          else
            descriptor[key] = _;
        }
      }
      if (target)
        Object.defineProperty(target, contextIn.name, descriptor);
      done = true;
    };
    __runInitializers = function(thisArg, initializers, value) {
      var useValue = arguments.length > 2;
      for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
      }
      return useValue ? value : void 0;
    };
    __propKey = function(x) {
      return typeof x === "symbol" ? x : "".concat(x);
    };
    __setFunctionName = function(f, name, prefix) {
      if (typeof name === "symbol")
        name = name.description ? "[".concat(name.description, "]") : "";
      return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };
    __metadata = function(metadataKey, metadataValue) {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
        return Reflect.metadata(metadataKey, metadataValue);
    };
    __awaiter = function(thisArg, _arguments, P, generator) {
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
    __generator = function(thisArg, body) {
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
    __exportStar = function(m, o) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p))
          __createBinding(o, m, p);
    };
    __createBinding = Object.create ? function(o, m, k, k2) {
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
    };
    __values = function(o) {
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
    __read = function(o, n) {
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
    __spread = function() {
      for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(__read(arguments[i]));
      return ar;
    };
    __spreadArrays = function() {
      for (var s = 0, i = 0, il = arguments.length; i < il; i++)
        s += arguments[i].length;
      for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
      return r;
    };
    __spreadArray = function(to, from, pack) {
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
    __await = function(v) {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };
    __asyncGenerator = function(thisArg, _arguments, generator) {
      if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
      var g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i;
      function verb(n) {
        if (g[n])
          i[n] = function(v) {
            return new Promise(function(a, b) {
              q.push([n, v, a, b]) > 1 || resume(n, v);
            });
          };
      }
      function resume(n, v) {
        try {
          step(g[n](v));
        } catch (e) {
          settle(q[0][3], e);
        }
      }
      function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
      }
      function fulfill(value) {
        resume("next", value);
      }
      function reject(value) {
        resume("throw", value);
      }
      function settle(f, v) {
        if (f(v), q.shift(), q.length)
          resume(q[0][0], q[0][1]);
      }
    };
    __asyncDelegator = function(o) {
      var i, p;
      return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
      }), verb("return"), i[Symbol.iterator] = function() {
        return this;
      }, i;
      function verb(n, f) {
        i[n] = o[n] ? function(v) {
          return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v;
        } : f;
      }
    };
    __asyncValues = function(o) {
      if (!Symbol.asyncIterator)
        throw new TypeError("Symbol.asyncIterator is not defined.");
      var m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
      }, i);
      function verb(n) {
        i[n] = o[n] && function(v) {
          return new Promise(function(resolve, reject) {
            v = o[n](v), settle(resolve, reject, v.done, v.value);
          });
        };
      }
      function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v2) {
          resolve({ value: v2, done: d });
        }, reject);
      }
    };
    __makeTemplateObject = function(cooked, raw) {
      if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", { value: raw });
      } else {
        cooked.raw = raw;
      }
      return cooked;
    };
    var __setModuleDefault = Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    };
    __importStar = function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding(result, mod, k);
      }
      __setModuleDefault(result, mod);
      return result;
    };
    __importDefault2 = function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    __classPrivateFieldGet = function(receiver, state, kind, f) {
      if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };
    __classPrivateFieldSet = function(receiver, state, value, kind, f) {
      if (kind === "m")
        throw new TypeError("Private method is not writable");
      if (kind === "a" && !f)
        throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver))
        throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
    };
    __classPrivateFieldIn = function(state, receiver) {
      if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function")
        throw new TypeError("Cannot use 'in' operator on non-object");
      return typeof state === "function" ? receiver === state : state.has(receiver);
    };
    __addDisposableResource = function(env, value, async) {
      if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function")
          throw new TypeError("Object expected.");
        var dispose;
        if (async) {
          if (!Symbol.asyncDispose)
            throw new TypeError("Symbol.asyncDispose is not defined.");
          dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
          if (!Symbol.dispose)
            throw new TypeError("Symbol.dispose is not defined.");
          dispose = value[Symbol.dispose];
        }
        if (typeof dispose !== "function")
          throw new TypeError("Object not disposable.");
        env.stack.push({ value, dispose, async });
      } else if (async) {
        env.stack.push({ async: true });
      }
      return value;
    };
    var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
      var e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };
    __disposeResources = function(env) {
      function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      function next() {
        while (env.stack.length) {
          var rec = env.stack.pop();
          try {
            var result = rec.dispose && rec.dispose.call(rec.value);
            if (rec.async)
              return Promise.resolve(result).then(next, function(e) {
                fail(e);
                return next();
              });
          } catch (e) {
            fail(e);
          }
        }
        if (env.hasError)
          throw env.error;
      }
      return next();
    };
    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__esDecorate", __esDecorate);
    exporter("__runInitializers", __runInitializers);
    exporter("__propKey", __propKey);
    exporter("__setFunctionName", __setFunctionName);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault2);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
    exporter("__addDisposableResource", __addDisposableResource);
    exporter("__disposeResources", __disposeResources);
  });
})(tslib);
var exportTypeScriptSchemas = {};
var generateTypeScript = {};
var hasRequiredGenerateTypeScript;
function requireGenerateTypeScript() {
  if (hasRequiredGenerateTypeScript)
    return generateTypeScript;
  hasRequiredGenerateTypeScript = 1;
  Object.defineProperty(generateTypeScript, "__esModule", { value: true });
  generateTypeScript.generateTypeScript = generateTypeScript.DURATION_TS = generateTypeScript.TIME_TS = void 0;
  function primitiveToTypeScript(type2) {
    switch (type2) {
      case "bytes":
        return "Uint8Array";
      case "string":
        return "string";
      case "boolean":
        return "boolean";
      case "float64":
      case "uint32":
        return "number";
    }
  }
  function primitiveToTypedArray(type2) {
    switch (type2) {
      case "time":
      case "duration":
      case "bytes":
      case "string":
      case "boolean":
        return [];
      case "float64":
        return ["Float32Array", "Float64Array"];
      case "uint32":
        return ["Uint32Array"];
    }
  }
  generateTypeScript.TIME_TS = `export type Time = {
  sec: number;
  nsec: number;
};
`;
  generateTypeScript.DURATION_TS = `export type Duration = {
  sec: number;
  nsec: number;
};
`;
  function generateTypeScript$1(schema2, options2 = {}) {
    const imports = /* @__PURE__ */ new Set();
    let definition;
    switch (schema2.type) {
      case "enum": {
        const fields = schema2.values.map(({ name, value, description }) => {
          if (description != void 0) {
            return `/** ${description} */
  ${name} = ${value},`;
          } else {
            return `${name} = ${value},`;
          }
        });
        definition = `/** ${schema2.description} */
export enum ${schema2.name} {
  ${fields.join("\n\n  ")}
}`;
        break;
      }
      case "message": {
        const fields = schema2.fields.map((field) => {
          let fieldType;
          switch (field.type.type) {
            case "enum":
              fieldType = field.type.enum.name;
              imports.add(field.type.enum.name);
              break;
            case "nested":
              fieldType = field.type.schema.name;
              imports.add(field.type.schema.name);
              break;
            case "primitive":
              if (field.type.name === "time") {
                fieldType = "Time";
                imports.add("Time");
              } else if (field.type.name === "duration") {
                fieldType = "Duration";
                imports.add("Duration");
              } else {
                fieldType = primitiveToTypeScript(field.type.name);
              }
              break;
          }
          if (typeof field.array === "number") {
            fieldType = `[${new Array(field.array).fill(fieldType).join(", ")}]`;
          } else if (field.array != void 0) {
            fieldType = `${fieldType}[]`;
          }
          if (field.array != void 0 && options2.includeTypedArrays === true && field.type.type === "primitive") {
            fieldType = [fieldType, ...primitiveToTypedArray(field.type.name)].join(" | ");
          }
          let comment2;
          const descriptionLines = field.description.trim().split("\n");
          if (descriptionLines.length === 1) {
            comment2 = `/** ${field.description} */`;
          } else {
            comment2 = `/**
  ${descriptionLines.map((line) => ` * ${line}`).join("\n  ")}
   */`;
          }
          return `${comment2}
  ${field.name}: ${fieldType};`;
        });
        definition = `/** ${schema2.description} */
export type ${schema2.name} = {
  ${fields.join("\n\n  ")}
};`;
        break;
      }
    }
    const outputSections = [
      `// Generated by https://github.com/foxglove/schemas
// Options: ${JSON.stringify(options2)}`,
      Array.from(imports).sort().map((name) => `import { ${name} } from "./${name}";`).join("\n"),
      definition
    ].filter(Boolean);
    return outputSections.join("\n\n") + "\n";
  }
  generateTypeScript.generateTypeScript = generateTypeScript$1;
  return generateTypeScript;
}
var schemas = {};
var hasRequiredSchemas;
function requireSchemas() {
  if (hasRequiredSchemas)
    return schemas;
  hasRequiredSchemas = 1;
  Object.defineProperty(schemas, "__esModule", { value: true });
  schemas.foxgloveEnumSchemas = schemas.foxgloveMessageSchemas = void 0;
  const Color = {
    type: "message",
    name: "Color",
    description: "A color in RGBA format",
    fields: [
      {
        name: "r",
        type: { type: "primitive", name: "float64" },
        description: "Red value between 0 and 1",
        defaultValue: 1
      },
      {
        name: "g",
        type: { type: "primitive", name: "float64" },
        description: "Green value between 0 and 1",
        defaultValue: 1
      },
      {
        name: "b",
        type: { type: "primitive", name: "float64" },
        description: "Blue value between 0 and 1",
        defaultValue: 1
      },
      {
        name: "a",
        type: { type: "primitive", name: "float64" },
        description: "Alpha value between 0 and 1",
        defaultValue: 1
      }
    ]
  };
  const Vector2 = {
    type: "message",
    name: "Vector2",
    description: "A vector in 2D space that represents a direction only",
    fields: [
      {
        name: "x",
        type: { type: "primitive", name: "float64" },
        description: "x coordinate length",
        defaultValue: 1
      },
      {
        name: "y",
        type: { type: "primitive", name: "float64" },
        description: "y coordinate length",
        defaultValue: 1
      }
    ]
  };
  const Vector3 = {
    type: "message",
    name: "Vector3",
    description: "A vector in 3D space that represents a direction only",
    rosEquivalent: "geometry_msgs/Vector3",
    fields: [
      {
        name: "x",
        type: { type: "primitive", name: "float64" },
        description: "x coordinate length",
        defaultValue: 1
      },
      {
        name: "y",
        type: { type: "primitive", name: "float64" },
        description: "y coordinate length",
        defaultValue: 1
      },
      {
        name: "z",
        type: { type: "primitive", name: "float64" },
        description: "z coordinate length",
        defaultValue: 1
      }
    ]
  };
  const Point2 = {
    type: "message",
    name: "Point2",
    description: "A point representing a position in 2D space",
    fields: [
      {
        name: "x",
        type: { type: "primitive", name: "float64" },
        description: "x coordinate position"
      },
      {
        name: "y",
        type: { type: "primitive", name: "float64" },
        description: "y coordinate position"
      }
    ]
  };
  const Point3 = {
    type: "message",
    name: "Point3",
    description: "A point representing a position in 3D space",
    rosEquivalent: "geometry_msgs/Point",
    fields: [
      {
        name: "x",
        type: { type: "primitive", name: "float64" },
        description: "x coordinate position"
      },
      {
        name: "y",
        type: { type: "primitive", name: "float64" },
        description: "y coordinate position"
      },
      {
        name: "z",
        type: { type: "primitive", name: "float64" },
        description: "z coordinate position"
      }
    ]
  };
  const Quaternion = {
    type: "message",
    name: "Quaternion",
    description: "A [quaternion](https://eater.net/quaternions) representing a rotation in 3D space",
    rosEquivalent: "geometry_msgs/Quaternion",
    fields: [
      {
        name: "x",
        type: { type: "primitive", name: "float64" },
        description: "x value"
      },
      {
        name: "y",
        type: { type: "primitive", name: "float64" },
        description: "y value"
      },
      {
        name: "z",
        type: { type: "primitive", name: "float64" },
        description: "z value"
      },
      {
        name: "w",
        type: { type: "primitive", name: "float64" },
        description: "w value",
        defaultValue: 1
      }
    ]
  };
  const Pose = {
    type: "message",
    name: "Pose",
    description: "A position and orientation for an object or reference frame in 3D space",
    rosEquivalent: "geometry_msgs/Pose",
    fields: [
      {
        name: "position",
        type: { type: "nested", schema: Vector3 },
        description: "Point denoting position in 3D space"
      },
      {
        name: "orientation",
        type: { type: "nested", schema: Quaternion },
        description: "Quaternion denoting orientation in 3D space"
      }
    ]
  };
  const KeyValuePair = {
    type: "message",
    name: "KeyValuePair",
    description: "A key with its associated value",
    fields: [
      {
        name: "key",
        type: { type: "primitive", name: "string" },
        description: "Key"
      },
      {
        name: "value",
        type: { type: "primitive", name: "string" },
        description: "Value"
      }
    ]
  };
  const SceneEntityDeletionType = {
    type: "enum",
    name: "SceneEntityDeletionType",
    parentSchemaName: "SceneEntityDeletion",
    protobufEnumName: "Type",
    description: "An enumeration indicating which entities should match a SceneEntityDeletion command",
    values: [
      {
        value: 0,
        name: "MATCHING_ID",
        description: "Delete the existing entity on the same topic that has the provided `id`"
      },
      { value: 1, name: "ALL", description: "Delete all existing entities on the same topic" }
    ]
  };
  const SceneEntityDeletion = {
    type: "message",
    name: "SceneEntityDeletion",
    description: "Command to remove previously published entities",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of the deletion. Only matching entities earlier than this timestamp will be deleted."
      },
      {
        name: "type",
        type: { type: "enum", enum: SceneEntityDeletionType },
        description: "Type of deletion action to perform"
      },
      {
        name: "id",
        type: { type: "primitive", name: "string" },
        description: "Identifier which must match if `type` is `MATCHING_ID`."
      }
    ]
  };
  const ArrowPrimitive = {
    type: "message",
    name: "ArrowPrimitive",
    description: "A primitive representing an arrow",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Position of the arrow's tail and orientation of the arrow. Identity orientation means the arrow points in the +x direction."
      },
      {
        name: "shaft_length",
        type: { type: "primitive", name: "float64" },
        description: "Length of the arrow shaft"
      },
      {
        name: "shaft_diameter",
        type: { type: "primitive", name: "float64" },
        description: "Diameter of the arrow shaft"
      },
      {
        name: "head_length",
        type: { type: "primitive", name: "float64" },
        description: "Length of the arrow head"
      },
      {
        name: "head_diameter",
        type: { type: "primitive", name: "float64" },
        description: "Diameter of the arrow head"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Color of the arrow"
      }
    ]
  };
  const CubePrimitive = {
    type: "message",
    name: "CubePrimitive",
    description: "A primitive representing a cube or rectangular prism",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Position of the center of the cube and orientation of the cube"
      },
      {
        name: "size",
        type: { type: "nested", schema: Vector3 },
        description: "Size of the cube along each axis"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Color of the cube"
      }
    ]
  };
  const SpherePrimitive = {
    type: "message",
    name: "SpherePrimitive",
    description: "A primitive representing a sphere or ellipsoid",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Position of the center of the sphere and orientation of the sphere"
      },
      {
        name: "size",
        type: { type: "nested", schema: Vector3 },
        description: "Size (diameter) of the sphere along each axis"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Color of the sphere"
      }
    ]
  };
  const CylinderPrimitive = {
    type: "message",
    name: "CylinderPrimitive",
    description: "A primitive representing a cylinder, elliptic cylinder, or truncated cone",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Position of the center of the cylinder and orientation of the cylinder. The flat face(s) are perpendicular to the z-axis."
      },
      {
        name: "size",
        type: { type: "nested", schema: Vector3 },
        description: "Size of the cylinder's bounding box"
      },
      {
        name: "bottom_scale",
        type: { type: "primitive", name: "float64" },
        description: "0-1, ratio of the diameter of the cylinder's bottom face (min z) to the bottom of the bounding box"
      },
      {
        name: "top_scale",
        type: { type: "primitive", name: "float64" },
        description: "0-1, ratio of the diameter of the cylinder's top face (max z) to the top of the bounding box"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Color of the cylinder"
      }
    ]
  };
  const LineType = {
    type: "enum",
    name: "LineType",
    parentSchemaName: "LinePrimitive",
    protobufEnumName: "Type",
    description: "An enumeration indicating how input points should be interpreted to create lines",
    values: [
      {
        value: 0,
        name: "LINE_STRIP",
        description: "Connected line segments: 0-1, 1-2, ..., (n-1)-n"
      },
      { value: 1, name: "LINE_LOOP", description: "Closed polygon: 0-1, 1-2, ..., (n-1)-n, n-0" },
      { value: 2, name: "LINE_LIST", description: "Individual line segments: 0-1, 2-3, 4-5, ..." }
    ]
  };
  const LinePrimitive = {
    type: "message",
    name: "LinePrimitive",
    description: "A primitive representing a series of points connected by lines",
    fields: [
      {
        name: "type",
        type: { type: "enum", enum: LineType },
        description: "Drawing primitive to use for lines"
      },
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Origin of lines relative to reference frame"
      },
      {
        name: "thickness",
        type: { type: "primitive", name: "float64" },
        description: "Line thickness"
      },
      {
        name: "scale_invariant",
        type: { type: "primitive", name: "boolean" },
        description: "Indicates whether `thickness` is a fixed size in screen pixels (true), or specified in world coordinates and scales with distance from the camera (false)"
      },
      {
        name: "points",
        type: { type: "nested", schema: Point3 },
        array: true,
        description: "Points along the line"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Solid color to use for the whole line. One of `color` or `colors` must be provided."
      },
      {
        name: "colors",
        type: { type: "nested", schema: Color },
        array: true,
        description: "Per-point colors (if specified, must have the same length as `points`). One of `color` or `colors` must be provided."
      },
      {
        name: "indices",
        type: { type: "primitive", name: "uint32" },
        array: true,
        description: "Indices into the `points` and `colors` attribute arrays, which can be used to avoid duplicating attribute data.\n\nIf omitted or empty, indexing will not be used. This default behavior is equivalent to specifying [0, 1, ..., N-1] for the indices (where N is the number of `points` provided)."
      }
    ]
  };
  const TextPrimitive = {
    type: "message",
    name: "TextPrimitive",
    description: "A primitive representing a text label",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Position of the center of the text box and orientation of the text. Identity orientation means the text is oriented in the xy-plane and flows from -x to +x."
      },
      {
        name: "billboard",
        type: { type: "primitive", name: "boolean" },
        description: "Whether the text should respect `pose.orientation` (false) or always face the camera (true)"
      },
      {
        name: "font_size",
        type: { type: "primitive", name: "float64" },
        description: "Font size (height of one line of text)"
      },
      {
        name: "scale_invariant",
        type: { type: "primitive", name: "boolean" },
        description: "Indicates whether `font_size` is a fixed size in screen pixels (true), or specified in world coordinates and scales with distance from the camera (false)"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Color of the text"
      },
      {
        name: "text",
        type: { type: "primitive", name: "string" },
        description: "Text"
      }
    ]
  };
  const TriangleListPrimitive = {
    type: "message",
    name: "TriangleListPrimitive",
    description: "A primitive representing a set of triangles or a surface tiled by triangles",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Origin of triangles relative to reference frame"
      },
      {
        name: "points",
        type: { type: "nested", schema: Point3 },
        array: true,
        description: "Vertices to use for triangles, interpreted as a list of triples (0-1-2, 3-4-5, ...)"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Solid color to use for the whole shape. One of `color` or `colors` must be provided."
      },
      {
        name: "colors",
        type: { type: "nested", schema: Color },
        array: true,
        description: "Per-vertex colors (if specified, must have the same length as `points`). One of `color` or `colors` must be provided."
      },
      {
        name: "indices",
        type: { type: "primitive", name: "uint32" },
        array: true,
        description: "Indices into the `points` and `colors` attribute arrays, which can be used to avoid duplicating attribute data.\n\nIf omitted or empty, indexing will not be used. This default behavior is equivalent to specifying [0, 1, ..., N-1] for the indices (where N is the number of `points` provided)."
      }
    ]
  };
  const ModelPrimitive = {
    type: "message",
    name: "ModelPrimitive",
    description: "A primitive representing a 3D model file loaded from an external URL or embedded data",
    fields: [
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Origin of model relative to reference frame"
      },
      {
        name: "scale",
        type: { type: "nested", schema: Vector3 },
        description: "Scale factor to apply to the model along each axis"
      },
      {
        name: "color",
        type: { type: "nested", schema: Color },
        description: "Solid color to use for the whole model if `override_color` is true."
      },
      {
        name: "override_color",
        type: { type: "primitive", name: "boolean" },
        description: "Whether to use the color specified in `color` instead of any materials embedded in the original model."
      },
      {
        name: "url",
        type: { type: "primitive", name: "string" },
        description: "URL pointing to model file. One of `url` or `data` should be provided."
      },
      {
        name: "media_type",
        type: { type: "primitive", name: "string" },
        description: "[Media type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types) of embedded model (e.g. `model/gltf-binary`). Required if `data` is provided instead of `url`. Overrides the inferred media type if `url` is provided."
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Embedded model. One of `url` or `data` should be provided. If `data` is provided, `media_type` must be set to indicate the type of the data."
      }
    ]
  };
  const SceneEntity = {
    type: "message",
    name: "SceneEntity",
    description: "A visual element in a 3D scene. An entity may be composed of multiple primitives which all share the same frame of reference.",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of the entity"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference"
      },
      {
        name: "id",
        type: { type: "primitive", name: "string" },
        description: "Identifier for the entity. A entity will replace any prior entity on the same topic with the same `id`."
      },
      {
        name: "lifetime",
        type: { type: "primitive", name: "duration" },
        description: "Length of time (relative to `timestamp`) after which the entity should be automatically removed. Zero value indicates the entity should remain visible until it is replaced or deleted."
      },
      {
        name: "frame_locked",
        type: { type: "primitive", name: "boolean" },
        description: "Whether the entity should keep its location in the fixed frame (false) or follow the frame specified in `frame_id` as it moves relative to the fixed frame (true)"
      },
      {
        name: "metadata",
        type: { type: "nested", schema: KeyValuePair },
        array: true,
        description: "Additional user-provided metadata associated with the entity. Keys must be unique."
      },
      {
        name: "arrows",
        type: { type: "nested", schema: ArrowPrimitive },
        array: true,
        description: "Arrow primitives"
      },
      {
        name: "cubes",
        type: { type: "nested", schema: CubePrimitive },
        array: true,
        description: "Cube primitives"
      },
      {
        name: "spheres",
        type: { type: "nested", schema: SpherePrimitive },
        array: true,
        description: "Sphere primitives"
      },
      {
        name: "cylinders",
        type: { type: "nested", schema: CylinderPrimitive },
        array: true,
        description: "Cylinder primitives"
      },
      {
        name: "lines",
        type: { type: "nested", schema: LinePrimitive },
        array: true,
        description: "Line primitives"
      },
      {
        name: "triangles",
        type: { type: "nested", schema: TriangleListPrimitive },
        array: true,
        description: "Triangle list primitives"
      },
      {
        name: "texts",
        type: { type: "nested", schema: TextPrimitive },
        array: true,
        description: "Text primitives"
      },
      {
        name: "models",
        type: { type: "nested", schema: ModelPrimitive },
        array: true,
        description: "Model primitives"
      }
    ]
  };
  const SceneUpdate = {
    type: "message",
    name: "SceneUpdate",
    description: "An update to the entities displayed in a 3D scene",
    fields: [
      {
        name: "deletions",
        type: { type: "nested", schema: SceneEntityDeletion },
        array: true,
        description: "Scene entities to delete"
      },
      {
        name: "entities",
        type: { type: "nested", schema: SceneEntity },
        array: true,
        description: "Scene entities to add or replace"
      }
    ]
  };
  const CameraCalibration = {
    type: "message",
    name: "CameraCalibration",
    description: "Camera calibration parameters",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of calibration data"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for the camera. The origin of the frame is the optical center of the camera. +x points to the right in the image, +y points down, and +z points into the plane of the image.",
        protobufFieldNumber: 9
      },
      {
        name: "width",
        type: { type: "primitive", name: "uint32" },
        description: "Image width"
      },
      {
        name: "height",
        type: { type: "primitive", name: "uint32" },
        description: "Image height"
      },
      {
        name: "distortion_model",
        type: { type: "primitive", name: "string" },
        description: "Name of distortion model\n\nSupported values: `plumb_bob` and `rational_polynomial`"
      },
      {
        name: "D",
        type: { type: "primitive", name: "float64" },
        description: "Distortion parameters",
        array: true
      },
      {
        name: "K",
        type: { type: "primitive", name: "float64" },
        array: 9,
        description: `Intrinsic camera matrix (3x3 row-major matrix)

A 3x3 row-major matrix for the raw (distorted) image.

Projects 3D points in the camera coordinate frame to 2D pixel coordinates using the focal lengths (fx, fy) and principal point (cx, cy).

\`\`\`
    [fx  0 cx]
K = [ 0 fy cy]
    [ 0  0  1]
\`\`\`
`
      },
      {
        name: "R",
        type: { type: "primitive", name: "float64" },
        array: 9,
        description: `Rectification matrix (stereo cameras only, 3x3 row-major matrix)

A rotation matrix aligning the camera coordinate system to the ideal stereo image plane so that epipolar lines in both stereo images are parallel.`
      },
      {
        name: "P",
        type: { type: "primitive", name: "float64" },
        array: 12,
        description: `Projection/camera matrix (3x4 row-major matrix)

\`\`\`
    [fx'  0  cx' Tx]
P = [ 0  fy' cy' Ty]
    [ 0   0   1   0]
\`\`\`

By convention, this matrix specifies the intrinsic (camera) matrix of the processed (rectified) image. That is, the left 3x3 portion is the normal camera intrinsic matrix for the rectified image.

It projects 3D points in the camera coordinate frame to 2D pixel coordinates using the focal lengths (fx', fy') and principal point (cx', cy') - these may differ from the values in K.

For monocular cameras, Tx = Ty = 0. Normally, monocular cameras will also have R = the identity and P[1:3,1:3] = K.

For a stereo pair, the fourth column [Tx Ty 0]' is related to the position of the optical center of the second camera in the first camera's frame. We assume Tz = 0 so both cameras are in the same stereo image plane. The first camera always has Tx = Ty = 0. For the right (second) camera of a horizontal stereo pair, Ty = 0 and Tx = -fx' * B, where B is the baseline between the cameras.

Given a 3D point [X Y Z]', the projection (x, y) of the point onto the rectified image is given by:

\`\`\`
[u v w]' = P * [X Y Z 1]'
       x = u / w
       y = v / w
\`\`\`

This holds for both images of a stereo pair.
`
      }
    ]
  };
  const CompressedImage = {
    type: "message",
    name: "CompressedImage",
    description: "A compressed image",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of image"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for the image. The origin of the frame is the optical center of the camera. +x points to the right in the image, +y points down, and +z points into the plane of the image.",
        protobufFieldNumber: 4
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Compressed image data"
      },
      {
        name: "format",
        type: { type: "primitive", name: "string" },
        description: "Image format\n\nSupported values: image media types supported by Chrome, such as `webp`, `jpeg`, `png`"
      }
    ]
  };
  const CompressedVideo = {
    type: "message",
    name: "CompressedVideo",
    description: "A single frame of a compressed video bitstream",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of video frame"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for the video.\n\nThe origin of the frame is the optical center of the camera. +x points to the right in the video, +y points down, and +z points into the plane of the video."
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Compressed video frame data.\n\nFor packet-based video codecs this data must begin and end on packet boundaries (no partial packets), and must contain enough video packets to decode exactly one image (either a keyframe or delta frame). Note: Foxglove Studio does not support video streams that include B frames because they require lookahead."
      },
      {
        name: "format",
        type: { type: "primitive", name: "string" },
        description: "Video format.\n\nSupported values: `h264` (Annex B formatted data only)"
      }
    ]
  };
  const RawImage = {
    type: "message",
    name: "RawImage",
    description: "A raw image",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of image"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for the image. The origin of the frame is the optical center of the camera. +x points to the right in the image, +y points down, and +z points into the plane of the image.",
        protobufFieldNumber: 7
      },
      {
        name: "width",
        type: { type: "primitive", name: "uint32" },
        description: "Image width"
      },
      {
        name: "height",
        type: { type: "primitive", name: "uint32" },
        description: "Image height"
      },
      {
        name: "encoding",
        type: { type: "primitive", name: "string" },
        description: "Encoding of the raw image data\n\nSupported values: `8UC1`, `8UC3`, `16UC1`, `32FC1`, `bayer_bggr8`, `bayer_gbrg8`, `bayer_grbg8`, `bayer_rggb8`, `bgr8`, `bgra8`, `mono8`, `mono16`, `rgb8`, `rgba8`, `uyvy` or `yuv422`, `yuyv` or `yuv422_yuy2`"
      },
      {
        name: "step",
        type: { type: "primitive", name: "uint32" },
        description: "Byte length of a single row"
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Raw image data"
      }
    ]
  };
  const FrameTransform = {
    type: "message",
    name: "FrameTransform",
    description: "A transform between two reference frames in 3D space",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of transform"
      },
      {
        name: "parent_frame_id",
        type: { type: "primitive", name: "string" },
        description: "Name of the parent frame"
      },
      {
        name: "child_frame_id",
        type: { type: "primitive", name: "string" },
        description: "Name of the child frame"
      },
      {
        name: "translation",
        type: { type: "nested", schema: Vector3 },
        description: "Translation component of the transform"
      },
      {
        name: "rotation",
        type: { type: "nested", schema: Quaternion },
        description: "Rotation component of the transform"
      }
    ]
  };
  const FrameTransforms = {
    type: "message",
    name: "FrameTransforms",
    description: "An array of FrameTransform messages",
    fields: [
      {
        name: "transforms",
        type: { type: "nested", schema: FrameTransform },
        array: true,
        description: "Array of transforms"
      }
    ]
  };
  const PoseInFrame = {
    type: "message",
    name: "PoseInFrame",
    description: "A timestamped pose for an object or reference frame in 3D space",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of pose"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for pose position and orientation"
      },
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Pose in 3D space"
      }
    ]
  };
  const PosesInFrame = {
    type: "message",
    name: "PosesInFrame",
    description: "An array of timestamped poses for an object or reference frame in 3D space",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of pose"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference for pose position and orientation"
      },
      {
        name: "poses",
        type: { type: "nested", schema: Pose },
        description: "Poses in 3D space",
        array: true
      }
    ]
  };
  const GeoJSON = {
    type: "message",
    name: "GeoJSON",
    description: "GeoJSON data for annotating maps",
    fields: [
      {
        name: "geojson",
        type: { type: "primitive", name: "string" },
        description: "GeoJSON data encoded as a UTF-8 string"
      }
    ]
  };
  const NumericType = {
    type: "enum",
    name: "NumericType",
    description: "Numeric type",
    parentSchemaName: "PackedElementField",
    protobufEnumName: "NumericType",
    values: [
      { name: "UNKNOWN", value: 0 },
      { name: "UINT8", value: 1 },
      { name: "INT8", value: 2 },
      { name: "UINT16", value: 3 },
      { name: "INT16", value: 4 },
      { name: "UINT32", value: 5 },
      { name: "INT32", value: 6 },
      { name: "FLOAT32", value: 7 },
      { name: "FLOAT64", value: 8 }
    ]
  };
  const PackedElementField = {
    type: "message",
    name: "PackedElementField",
    description: "A field present within each element in a byte array of packed elements.",
    fields: [
      {
        name: "name",
        type: { type: "primitive", name: "string" },
        description: "Name of the field"
      },
      {
        name: "offset",
        type: { type: "primitive", name: "uint32" },
        description: "Byte offset from start of data buffer"
      },
      {
        name: "type",
        type: { type: "enum", enum: NumericType },
        description: "Type of data in the field. Integers are stored using little-endian byte order."
      }
    ]
  };
  const Grid = {
    type: "message",
    name: "Grid",
    description: "A 2D grid of data",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of grid"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference"
      },
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Origin of grid's corner relative to frame of reference; grid is positioned in the x-y plane relative to this origin"
      },
      {
        name: "column_count",
        type: { type: "primitive", name: "uint32" },
        description: "Number of grid columns"
      },
      {
        name: "cell_size",
        type: { type: "nested", schema: Vector2 },
        description: "Size of single grid cell along x and y axes, relative to `pose`"
      },
      {
        name: "row_stride",
        type: { type: "primitive", name: "uint32" },
        description: "Number of bytes between rows in `data`"
      },
      {
        name: "cell_stride",
        type: { type: "primitive", name: "uint32" },
        description: "Number of bytes between cells within a row in `data`"
      },
      {
        name: "fields",
        type: { type: "nested", schema: PackedElementField },
        array: true,
        description: "Fields in `data`. `red`, `green`, `blue`, and `alpha` are optional for customizing the grid's color."
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Grid cell data, interpreted using `fields`, in row-major (y-major) order"
      }
    ]
  };
  const CircleAnnotation = {
    type: "message",
    name: "CircleAnnotation",
    description: "A circle annotation on a 2D image",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of circle"
      },
      {
        name: "position",
        type: { type: "nested", schema: Point2 },
        description: "Center of the circle in 2D image coordinates (pixels)"
      },
      {
        name: "diameter",
        type: { type: "primitive", name: "float64" },
        description: "Circle diameter in pixels"
      },
      {
        name: "thickness",
        type: { type: "primitive", name: "float64" },
        description: "Line thickness in pixels"
      },
      {
        name: "fill_color",
        type: { type: "nested", schema: Color },
        description: "Fill color"
      },
      {
        name: "outline_color",
        type: { type: "nested", schema: Color },
        description: "Outline color"
      }
    ]
  };
  const PointsAnnotationType = {
    type: "enum",
    name: "PointsAnnotationType",
    description: "Type of points annotation",
    parentSchemaName: "PointsAnnotation",
    protobufEnumName: "Type",
    values: [
      { name: "UNKNOWN", value: 0 },
      { name: "POINTS", value: 1, description: "Individual points: 0, 1, 2, ..." },
      { name: "LINE_LOOP", value: 2, description: "Closed polygon: 0-1, 1-2, ..., (n-1)-n, n-0" },
      {
        name: "LINE_STRIP",
        value: 3,
        description: "Connected line segments: 0-1, 1-2, ..., (n-1)-n"
      },
      { name: "LINE_LIST", value: 4, description: "Individual line segments: 0-1, 2-3, 4-5, ..." }
    ]
  };
  const PointsAnnotation = {
    type: "message",
    name: "PointsAnnotation",
    description: "An array of points on a 2D image",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of annotation"
      },
      {
        name: "type",
        type: { type: "enum", enum: PointsAnnotationType },
        description: "Type of points annotation to draw"
      },
      {
        name: "points",
        type: { type: "nested", schema: Point2 },
        description: "Points in 2D image coordinates (pixels)",
        array: true
      },
      {
        name: "outline_color",
        type: { type: "nested", schema: Color },
        description: "Outline color"
      },
      {
        name: "outline_colors",
        type: { type: "nested", schema: Color },
        description: "Per-point colors, if `type` is `POINTS`, or per-segment stroke colors, if `type` is `LINE_LIST`, `LINE_STRIP` or `LINE_LOOP`.",
        array: true
      },
      {
        name: "fill_color",
        type: { type: "nested", schema: Color },
        description: "Fill color"
      },
      {
        name: "thickness",
        type: { type: "primitive", name: "float64" },
        description: "Stroke thickness in pixels"
      }
    ]
  };
  const TextAnnotation = {
    type: "message",
    name: "TextAnnotation",
    description: "A text label on a 2D image",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of annotation"
      },
      {
        name: "position",
        type: { type: "nested", schema: Point2 },
        description: "Bottom-left origin of the text label in 2D image coordinates (pixels)"
      },
      {
        name: "text",
        type: { type: "primitive", name: "string" },
        description: "Text to display"
      },
      {
        name: "font_size",
        type: { type: "primitive", name: "float64" },
        description: "Font size in pixels",
        defaultValue: 12
      },
      {
        name: "text_color",
        type: { type: "nested", schema: Color },
        description: "Text color"
      },
      {
        name: "background_color",
        type: { type: "nested", schema: Color },
        description: "Background fill color"
      }
    ]
  };
  const ImageAnnotations = {
    type: "message",
    name: "ImageAnnotations",
    description: "Array of annotations for a 2D image",
    fields: [
      {
        name: "circles",
        type: { type: "nested", schema: CircleAnnotation },
        description: "Circle annotations",
        array: true
      },
      {
        name: "points",
        type: { type: "nested", schema: PointsAnnotation },
        description: "Points annotations",
        array: true
      },
      {
        name: "texts",
        type: { type: "nested", schema: TextAnnotation },
        description: "Text annotations",
        array: true
      }
    ]
  };
  const PositionCovarianceType = {
    type: "enum",
    name: "PositionCovarianceType",
    description: "Type of position covariance",
    parentSchemaName: "LocationFix",
    protobufEnumName: "PositionCovarianceType",
    values: [
      { name: "UNKNOWN", value: 0 },
      { name: "APPROXIMATED", value: 1 },
      { name: "DIAGONAL_KNOWN", value: 2 },
      { name: "KNOWN", value: 3 }
    ]
  };
  const LocationFix = {
    type: "message",
    name: "LocationFix",
    description: "A navigation satellite fix for any Global Navigation Satellite System",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of the message",
        protobufFieldNumber: 6
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame for the sensor. Latitude and longitude readings are at the origin of the frame.",
        protobufFieldNumber: 7
      },
      {
        name: "latitude",
        type: { type: "primitive", name: "float64" },
        description: "Latitude in degrees",
        protobufFieldNumber: 1
      },
      {
        name: "longitude",
        type: { type: "primitive", name: "float64" },
        description: "Longitude in degrees",
        protobufFieldNumber: 2
      },
      {
        name: "altitude",
        type: { type: "primitive", name: "float64" },
        description: "Altitude in meters",
        protobufFieldNumber: 3
      },
      {
        name: "position_covariance",
        type: { type: "primitive", name: "float64" },
        description: "Position covariance (m^2) defined relative to a tangential plane through the reported position. The components are East, North, and Up (ENU), in row-major order.",
        array: 9,
        protobufFieldNumber: 4
      },
      {
        name: "position_covariance_type",
        type: { type: "enum", enum: PositionCovarianceType },
        description: "If `position_covariance` is available, `position_covariance_type` must be set to indicate the type of covariance.",
        protobufFieldNumber: 5
      }
    ]
  };
  const LogLevel = {
    type: "enum",
    name: "LogLevel",
    description: "Log level",
    parentSchemaName: "Log",
    protobufEnumName: "Level",
    values: [
      { name: "UNKNOWN", value: 0 },
      { name: "DEBUG", value: 1 },
      { name: "INFO", value: 2 },
      { name: "WARNING", value: 3 },
      { name: "ERROR", value: 4 },
      { name: "FATAL", value: 5 }
    ]
  };
  const Log = {
    type: "message",
    name: "Log",
    description: "A log message",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of log message"
      },
      {
        name: "level",
        type: { type: "enum", enum: LogLevel },
        description: "Log level"
      },
      {
        name: "message",
        type: { type: "primitive", name: "string" },
        description: "Log message"
      },
      {
        name: "name",
        type: { type: "primitive", name: "string" },
        description: "Process or node name"
      },
      {
        name: "file",
        type: { type: "primitive", name: "string" },
        description: "Filename"
      },
      {
        name: "line",
        type: { type: "primitive", name: "uint32" },
        description: "Line number in the file"
      }
    ]
  };
  const PointCloud = {
    type: "message",
    name: "PointCloud",
    description: "A collection of N-dimensional points, which may contain additional fields with information like normals, intensity, etc.",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of point cloud"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference"
      },
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "The origin of the point cloud relative to the frame of reference"
      },
      {
        name: "point_stride",
        type: { type: "primitive", name: "uint32" },
        description: "Number of bytes between points in the `data`"
      },
      {
        name: "fields",
        type: { type: "nested", schema: PackedElementField },
        array: true,
        description: "Fields in `data`. At least 2 coordinate fields from `x`, `y`, and `z` are required for each point's position; `red`, `green`, `blue`, and `alpha` are optional for customizing each point's color."
      },
      {
        name: "data",
        type: { type: "primitive", name: "bytes" },
        description: "Point data, interpreted using `fields`"
      }
    ]
  };
  const LaserScan = {
    type: "message",
    name: "LaserScan",
    description: "A single scan from a planar laser range-finder",
    fields: [
      {
        name: "timestamp",
        type: { type: "primitive", name: "time" },
        description: "Timestamp of scan"
      },
      {
        name: "frame_id",
        type: { type: "primitive", name: "string" },
        description: "Frame of reference"
      },
      {
        name: "pose",
        type: { type: "nested", schema: Pose },
        description: "Origin of scan relative to frame of reference; points are positioned in the x-y plane relative to this origin; angles are interpreted as counterclockwise rotations around the z axis with 0 rad being in the +x direction"
      },
      {
        name: "start_angle",
        type: { type: "primitive", name: "float64" },
        description: "Bearing of first point, in radians"
      },
      {
        name: "end_angle",
        type: { type: "primitive", name: "float64" },
        description: "Bearing of last point, in radians"
      },
      {
        name: "ranges",
        type: { type: "primitive", name: "float64" },
        description: "Distance of detections from origin; assumed to be at equally-spaced angles between `start_angle` and `end_angle`",
        array: true
      },
      {
        name: "intensities",
        type: { type: "primitive", name: "float64" },
        description: "Intensity of detections",
        array: true
      }
    ]
  };
  schemas.foxgloveMessageSchemas = {
    ArrowPrimitive,
    CameraCalibration,
    CircleAnnotation,
    Color,
    CompressedImage,
    CompressedVideo,
    CylinderPrimitive,
    CubePrimitive,
    FrameTransform,
    FrameTransforms,
    GeoJSON,
    Grid,
    ImageAnnotations,
    KeyValuePair,
    LaserScan,
    LinePrimitive,
    LocationFix,
    Log,
    SceneEntityDeletion,
    SceneEntity,
    SceneUpdate,
    ModelPrimitive,
    PackedElementField,
    Point2,
    Point3,
    PointCloud,
    PointsAnnotation,
    Pose,
    PoseInFrame,
    PosesInFrame,
    Quaternion,
    RawImage,
    SpherePrimitive,
    TextAnnotation,
    TextPrimitive,
    TriangleListPrimitive,
    Vector2,
    Vector3
  };
  schemas.foxgloveEnumSchemas = {
    LineType,
    LogLevel,
    SceneEntityDeletionType,
    NumericType,
    PointsAnnotationType,
    PositionCovarianceType
  };
  return schemas;
}
var hasRequiredExportTypeScriptSchemas;
function requireExportTypeScriptSchemas() {
  if (hasRequiredExportTypeScriptSchemas)
    return exportTypeScriptSchemas;
  hasRequiredExportTypeScriptSchemas = 1;
  Object.defineProperty(exportTypeScriptSchemas, "__esModule", { value: true });
  exportTypeScriptSchemas.exportTypeScriptSchemas = void 0;
  const generateTypeScript_1 = requireGenerateTypeScript();
  const schemas_1 = requireSchemas();
  function exportTypeScriptSchemas$1(options2 = {}) {
    const schemas2 = /* @__PURE__ */ new Map();
    for (const schema2 of Object.values(schemas_1.foxgloveMessageSchemas)) {
      schemas2.set(schema2.name, (0, generateTypeScript_1.generateTypeScript)(schema2, options2));
    }
    for (const schema2 of Object.values(schemas_1.foxgloveEnumSchemas)) {
      schemas2.set(schema2.name, (0, generateTypeScript_1.generateTypeScript)(schema2, options2));
    }
    schemas2.set("Duration", generateTypeScript_1.DURATION_TS);
    schemas2.set("Time", generateTypeScript_1.TIME_TS);
    const allSchemaNames = [
      ...Object.values(schemas_1.foxgloveMessageSchemas),
      ...Object.values(schemas_1.foxgloveEnumSchemas)
    ].sort((a, b) => a.name.localeCompare(b.name));
    let indexTS = "";
    for (const schema2 of allSchemaNames) {
      indexTS += `export * from "./${schema2.name}";
`;
    }
    schemas2.set("index", indexTS);
    return schemas2;
  }
  exportTypeScriptSchemas.exportTypeScriptSchemas = exportTypeScriptSchemas$1;
  return exportTypeScriptSchemas;
}
var generateJsonSchema = {};
var hasRequiredGenerateJsonSchema;
function requireGenerateJsonSchema() {
  if (hasRequiredGenerateJsonSchema)
    return generateJsonSchema;
  hasRequiredGenerateJsonSchema = 1;
  Object.defineProperty(generateJsonSchema, "__esModule", { value: true });
  generateJsonSchema.generateJsonSchema = void 0;
  function primitiveToJsonSchema(type2) {
    switch (type2) {
      case "string":
        return { type: "string" };
      case "boolean":
        return { type: "boolean" };
      case "float64":
        return { type: "number" };
      case "uint32":
        return { type: "integer", minimum: 0 };
      case "time":
        return {
          type: "object",
          title: "time",
          properties: {
            sec: { type: "integer", minimum: 0 },
            nsec: { type: "integer", minimum: 0, maximum: 999999999 }
          }
        };
      case "duration":
        return {
          type: "object",
          title: "duration",
          properties: {
            sec: { type: "integer" },
            nsec: { type: "integer", minimum: 0, maximum: 999999999 }
          }
        };
    }
  }
  function generateJsonSchema$1(schema2) {
    const properties = {};
    for (const field of schema2.fields) {
      let fieldType;
      switch (field.type.type) {
        case "primitive":
          if (field.type.name === "bytes") {
            fieldType = { type: "string", contentEncoding: "base64" };
          } else {
            fieldType = primitiveToJsonSchema(field.type.name);
          }
          break;
        case "nested":
          fieldType = generateJsonSchema$1(field.type.schema);
          delete fieldType.$comment;
          break;
        case "enum":
          fieldType = {
            title: `foxglove.${field.type.enum.name}`,
            description: field.description,
            oneOf: field.type.enum.values.map(({ name, value, description }) => ({
              title: name,
              const: value,
              description
            }))
          };
          break;
      }
      if (typeof field.array === "number") {
        fieldType = {
          type: "array",
          items: fieldType,
          minItems: field.array,
          maxItems: field.array
        };
      } else if (field.array === true) {
        fieldType = { type: "array", items: fieldType };
      }
      fieldType.description = field.description;
      properties[field.name] = fieldType;
    }
    return {
      title: `foxglove.${schema2.name}`,
      description: schema2.description,
      $comment: "Generated by https://github.com/foxglove/schemas",
      type: "object",
      properties
    };
  }
  generateJsonSchema.generateJsonSchema = generateJsonSchema$1;
  return generateJsonSchema;
}
var generateProto = {};
var hasRequiredGenerateProto;
function requireGenerateProto() {
  if (hasRequiredGenerateProto)
    return generateProto;
  hasRequiredGenerateProto = 1;
  Object.defineProperty(generateProto, "__esModule", { value: true });
  generateProto.generateProto = void 0;
  function primitiveToProto(type2) {
    switch (type2) {
      case "uint32":
        return "fixed32";
      case "bytes":
        return "bytes";
      case "string":
        return "string";
      case "boolean":
        return "bool";
      case "float64":
        return "double";
    }
  }
  function generateProto$1(schema2, nestedEnums) {
    const enumDefinitions = [];
    for (const enumSchema of nestedEnums) {
      const fields2 = enumSchema.values.map(({ name, value, description }) => {
        if (description != void 0) {
          return `// ${description}
    ${name} = ${value};`;
        } else {
          return `${name} = ${value};`;
        }
      });
      enumDefinitions.push(`  // ${enumSchema.description}
  enum ${enumSchema.protobufEnumName} {
    ${fields2.join("\n\n    ")}
  }
`);
    }
    const explicitFieldNumbers = /* @__PURE__ */ new Set();
    for (const field of schema2.fields) {
      if (field.protobufFieldNumber != void 0) {
        if (explicitFieldNumbers.has(field.protobufFieldNumber)) {
          throw new Error(`More than one field with protobufFieldNumber ${field.protobufFieldNumber}`);
        }
        explicitFieldNumbers.add(field.protobufFieldNumber);
      }
    }
    let nextFieldNumber = 1;
    const numberedFields = schema2.fields.map((field) => {
      if (field.protobufFieldNumber != void 0) {
        return { ...field, protobufFieldNumber: field.protobufFieldNumber };
      }
      while (explicitFieldNumbers.has(nextFieldNumber)) {
        ++nextFieldNumber;
      }
      return { ...field, protobufFieldNumber: nextFieldNumber++ };
    });
    const imports = /* @__PURE__ */ new Set();
    const fields = numberedFields.map((field) => {
      const lineComments = [];
      const qualifiers = [];
      if (field.array != void 0) {
        qualifiers.push("repeated");
      }
      if (typeof field.array === "number") {
        lineComments.push(`length ${field.array}`);
      }
      switch (field.type.type) {
        case "enum":
          qualifiers.push(field.type.enum.protobufEnumName);
          break;
        case "nested":
          qualifiers.push(`foxglove.${field.type.schema.name}`);
          imports.add(`foxglove/${field.type.schema.name}`);
          break;
        case "primitive":
          if (field.type.name === "time") {
            qualifiers.push("google.protobuf.Timestamp");
            imports.add(`google/protobuf/timestamp`);
          } else if (field.type.name === "duration") {
            qualifiers.push("google.protobuf.Duration");
            imports.add(`google/protobuf/duration`);
          } else {
            qualifiers.push(primitiveToProto(field.type.name));
          }
          break;
      }
      return `${field.description.trim().split("\n").map((line) => `  // ${line}
`).join("")}  ${qualifiers.join(" ")} ${field.name} = ${field.protobufFieldNumber};${lineComments.length > 0 ? " // " + lineComments.join(", ") : ""}`;
    });
    const definition = `// ${schema2.description}
message ${schema2.name} {
${enumDefinitions.join("\n\n")}${fields.join("\n\n")}
}`;
    const outputSections = [
      `// Generated by https://github.com/foxglove/schemas`,
      'syntax = "proto3";',
      Array.from(imports).sort().map((name) => `import "${name}.proto";`).join("\n"),
      `package foxglove;`,
      definition
    ].filter(Boolean);
    return outputSections.join("\n\n") + "\n";
  }
  generateProto.generateProto = generateProto$1;
  return generateProto;
}
var generateRos = {};
var hasRequiredGenerateRos;
function requireGenerateRos() {
  if (hasRequiredGenerateRos)
    return generateRos;
  hasRequiredGenerateRos = 1;
  Object.defineProperty(generateRos, "__esModule", { value: true });
  generateRos.generateRosMsgMergedSchema = generateRos.generateRosMsgDefinition = generateRos.generateRosMsg = void 0;
  const rosmsg_msgs_common_1 = require$$0;
  function primitiveToRos(type2) {
    switch (type2) {
      case "string":
        return "string";
      case "boolean":
        return "bool";
      case "float64":
        return "float64";
    }
  }
  function timeDurationToRos(type2, { rosVersion }) {
    if (type2 === "time") {
      return rosVersion === 2 ? "builtin_interfaces/Time" : "time";
    } else {
      return rosVersion === 2 ? "builtin_interfaces/Duration" : "duration";
    }
  }
  function generateRosMsg(def, { rosVersion }) {
    let source = "";
    source += `# ${def.rosFullInterfaceName}
`;
    if (def.description != void 0) {
      source += `# ${def.description}
`;
    }
    source += `
# Generated by https://github.com/foxglove/schemas
`;
    let prevFieldHadComment = true;
    for (const field of def.fields) {
      if (prevFieldHadComment || field.description != void 0) {
        source += "\n";
      }
      prevFieldHadComment = false;
      if (field.description != void 0) {
        source += field.description.trim().split("\n").map((line) => `# ${line}
`).join("");
        prevFieldHadComment = true;
      }
      let constant = "";
      if (field.isConstant === true) {
        if (field.valueText == void 0) {
          throw new Error(`Constant ${field.name} has no valueText`);
        }
        constant = `=${field.valueText}`;
      }
      let type2 = field.type;
      if (type2 === "time" || type2 === "duration") {
        type2 = timeDurationToRos(type2, { rosVersion });
      }
      source += `${type2}${field.isArray === true ? `[${field.arrayLength ?? ""}]` : ""} ${field.name}${constant}
`;
    }
    return source;
  }
  generateRos.generateRosMsg = generateRosMsg;
  function dependenciesEqual(a, b) {
    return a.type === "foxglove" && b.type === "foxglove" && a.schema.name === b.schema.name || a.type === "ros" && b.type === "ros" && a.name === b.name;
  }
  function* getSchemaDependencies(schema2) {
    for (const field of schema2.fields) {
      if (field.type.type === "nested") {
        if (field.type.schema.rosEquivalent != void 0) {
          yield { type: "ros", name: field.type.schema.rosEquivalent };
          yield* getRosDependencies(rosmsg_msgs_common_1.ros1[field.type.schema.rosEquivalent]);
        } else {
          yield { type: "foxglove", schema: field.type.schema };
          yield* getSchemaDependencies(field.type.schema);
        }
      }
    }
  }
  function* getRosDependencies(schema2) {
    for (const field of schema2.definitions) {
      if (field.isComplex === true) {
        yield { type: "ros", name: field.type };
        yield* getRosDependencies(rosmsg_msgs_common_1.ros1[field.type]);
      }
    }
  }
  function generateRosMsgDefinition(schema2, { rosVersion }) {
    const enumFieldNames = /* @__PURE__ */ new Set();
    const seenEnumNames = /* @__PURE__ */ new Set();
    const fields = [];
    for (const field of schema2.fields) {
      let isArray = field.array != void 0;
      const arrayLength = typeof field.array === "number" ? field.array : void 0;
      let fieldType;
      switch (field.type.type) {
        case "enum": {
          const enumName = field.type.enum.name;
          const valueType = "uint8";
          fieldType = valueType;
          if (seenEnumNames.has(enumName)) {
            break;
          }
          const enumFields = [];
          for (const { name, value, description } of field.type.enum.values) {
            if (enumFieldNames.has(name)) {
              throw new Error(`Enum value ${name} occurs in more than one enum referenced by ${schema2.name}, this is not supported in ROS msg files`);
            }
            if (value < 0 || value > 255 || !Number.isInteger(value)) {
              throw new Error(`Only uint8 enums are currently supported; value ${name}=${value} is out of range`);
            }
            enumFieldNames.add(name);
            enumFields.push({
              name,
              value,
              isConstant: true,
              valueText: value.toString(),
              type: valueType,
              description
            });
          }
          fields.push(...enumFields);
          seenEnumNames.add(enumName);
          break;
        }
        case "nested":
          if (field.type.schema.rosEquivalent != void 0) {
            fieldType = field.type.schema.rosEquivalent;
          } else {
            fieldType = `foxglove_msgs/${field.type.schema.name}`;
          }
          break;
        case "primitive":
          if (field.type.name === "bytes") {
            fieldType = "uint8";
            if (isArray) {
              throw new Error("Array of bytes is not supported in ROS msg");
            }
            isArray = true;
          } else if (field.type.name === "uint32") {
            fieldType = "uint32";
          } else if (field.type.name === "time") {
            fieldType = "time";
          } else if (field.type.name === "duration") {
            fieldType = "duration";
          } else {
            fieldType = primitiveToRos(field.type.name);
          }
          break;
      }
      fields.push({
        name: rosVersion === 2 ? field.name.toLowerCase() : field.name,
        type: fieldType,
        isComplex: field.type.type === "nested",
        isArray,
        arrayLength,
        description: field.description
      });
    }
    return {
      originalName: schema2.name,
      rosMsgInterfaceName: `foxglove_msgs/${schema2.name}`,
      rosFullInterfaceName: rosVersion === 2 ? `foxglove_msgs/msg/${schema2.name}` : `foxglove_msgs/${schema2.name}`,
      description: schema2.description,
      fields
    };
  }
  generateRos.generateRosMsgDefinition = generateRosMsgDefinition;
  function generateRosMsgMergedSchema(schema2, { rosVersion }) {
    const dependencies = [];
    for (const dep of getSchemaDependencies(schema2)) {
      if (!dependencies.some((existing) => dependenciesEqual(existing, dep))) {
        dependencies.push(dep);
      }
    }
    let result = generateRosMsg(generateRosMsgDefinition(schema2, { rosVersion }), { rosVersion });
    for (const dep of dependencies) {
      let name;
      let source;
      if (dep.type === "ros") {
        name = dep.name;
        source = generateRosMsg({
          originalName: dep.name,
          rosMsgInterfaceName: dep.name,
          rosFullInterfaceName: dep.name,
          fields: rosmsg_msgs_common_1.ros1[dep.name].definitions
        }, { rosVersion });
      } else {
        const definition = generateRosMsgDefinition(dep.schema, { rosVersion });
        name = definition.rosMsgInterfaceName;
        source = generateRosMsg(definition, { rosVersion });
      }
      result += `================================================================================
MSG: ${name}
${source}`;
    }
    return result;
  }
  generateRos.generateRosMsgMergedSchema = generateRosMsgMergedSchema;
  return generateRos;
}
var types = {};
var hasRequiredTypes;
function requireTypes() {
  if (hasRequiredTypes)
    return types;
  hasRequiredTypes = 1;
  Object.defineProperty(types, "__esModule", { value: true });
  return types;
}
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  const tslib_1 = tslib.exports;
  tslib_1.__exportStar(requireExportTypeScriptSchemas(), exports);
  tslib_1.__exportStar(requireGenerateTypeScript(), exports);
  tslib_1.__exportStar(requireGenerateJsonSchema(), exports);
  tslib_1.__exportStar(requireGenerateProto(), exports);
  tslib_1.__exportStar(requireGenerateRos(), exports);
  tslib_1.__exportStar(requireSchemas(), exports);
  tslib_1.__exportStar(requireTypes(), exports);
})(internal);
(function(exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Rosbag2 = exports.ROS2_DEFINITIONS_ARRAY = exports.ROS2_TO_DEFINITIONS = void 0;
  const rosmsg_msgs_common_1 = require$$0;
  const rosmsg2_serialization_1 = dist$3;
  const rostime_12 = dist$6;
  const internal_1 = internal;
  const MessageIterator_1 = MessageIterator$1;
  exports.ROS2_TO_DEFINITIONS = /* @__PURE__ */ new Map();
  exports.ROS2_DEFINITIONS_ARRAY = [];
  for (const [dataType, msgdef] of Object.entries(rosmsg_msgs_common_1.ros2galactic)) {
    exports.ROS2_DEFINITIONS_ARRAY.push(msgdef);
    exports.ROS2_TO_DEFINITIONS.set(dataTypeToFullName(dataType), msgdef);
  }
  for (const schema2 of Object.values(internal_1.foxgloveMessageSchemas)) {
    const { rosMsgInterfaceName, rosFullInterfaceName, fields } = (0, internal_1.generateRosMsgDefinition)(schema2, {
      rosVersion: 2
    });
    const msgdef = { name: rosMsgInterfaceName, definitions: fields };
    if (!exports.ROS2_TO_DEFINITIONS.has(rosFullInterfaceName)) {
      exports.ROS2_DEFINITIONS_ARRAY.push(msgdef);
      exports.ROS2_TO_DEFINITIONS.set(rosFullInterfaceName, msgdef);
    }
  }
  const imageMarkerArray = {
    name: "foxglove_msgs/ImageMarkerArray",
    definitions: [
      { type: "visualization_msgs/ImageMarker", isArray: true, name: "markers", isComplex: true }
    ]
  };
  exports.ROS2_DEFINITIONS_ARRAY.push(imageMarkerArray);
  exports.ROS2_TO_DEFINITIONS.set("foxglove_msgs/msg/ImageMarkerArray", imageMarkerArray);
  class Rosbag22 {
    constructor(files) {
      this.messageReaders_ = /* @__PURE__ */ new Map();
      this.decodeMessage = (rawMessage) => {
        let reader = this.messageReaders_.get(rawMessage.topic.type);
        if (reader == void 0) {
          const msgdef = exports.ROS2_TO_DEFINITIONS.get(rawMessage.topic.type);
          if (msgdef == void 0) {
            throw new Error(`Unknown message type: ${rawMessage.topic.type}`);
          }
          reader = new rosmsg2_serialization_1.MessageReader([msgdef, ...exports.ROS2_DEFINITIONS_ARRAY]);
          this.messageReaders_.set(rawMessage.topic.type, reader);
        }
        return reader.readMessage(rawMessage.data);
      };
      this.databases_ = files;
    }
    async open() {
      for (const db of this.databases_) {
        await db.open();
      }
    }
    async close() {
      if (this.databases_ != void 0) {
        for (const db of this.databases_) {
          await db.close();
        }
      }
      this.databases_ = [];
    }
    async readTopics() {
      if (this.databases_ == void 0) {
        throw new Error("Cannot read topics before opening rosbag");
      }
      if (this.databases_.length === 0) {
        return [];
      }
      const firstDb = this.databases_[0];
      return await firstDb.readTopics();
    }
    readMessages(opts = {}) {
      if (this.databases_ == void 0) {
        throw new Error("Cannot read messages before opening rosbag");
      }
      if (this.databases_.length === 0) {
        return new MessageIterator_1.MessageIterator([]);
      }
      const rowIterators = this.databases_.map((db) => db.readMessages(opts));
      return new MessageIterator_1.MessageIterator(rowIterators, opts.rawMessages !== true ? this.decodeMessage : void 0);
    }
    async timeRange() {
      if (this.databases_ == void 0) {
        throw new Error("Cannot read time range before opening rosbag");
      }
      if (this.databases_.length === 0) {
        return [
          { sec: 0, nsec: 0 },
          { sec: 0, nsec: 0 }
        ];
      }
      let min = { sec: Number.MAX_SAFE_INTEGER, nsec: 0 };
      let max = { sec: Number.MIN_SAFE_INTEGER, nsec: 0 };
      for (const db of this.databases_) {
        const [curMin, curMax] = await db.timeRange();
        min = minTime(min, curMin);
        max = maxTime(max, curMax);
      }
      return [min, max];
    }
    async messageCounts() {
      if (this.databases_ == void 0) {
        throw new Error("Cannot read message counts before opening rosbag");
      }
      const allCounts = /* @__PURE__ */ new Map();
      if (this.databases_.length === 0) {
        return allCounts;
      }
      for (const db of this.databases_) {
        const counts = await db.messageCounts();
        for (const [topic, count] of counts) {
          allCounts.set(topic, (allCounts.get(topic) ?? 0) + count);
        }
      }
      return allCounts;
    }
  }
  exports.Rosbag2 = Rosbag22;
  function minTime(a, b) {
    return (0, rostime_12.isLessThan)(a, b) ? a : b;
  }
  function maxTime(a, b) {
    return (0, rostime_12.isLessThan)(a, b) ? b : a;
  }
  function dataTypeToFullName(dataType) {
    const parts = dataType.split("/");
    if (parts.length === 2) {
      return `${parts[0]}/msg/${parts[1]}`;
    }
    return dataType;
  }
})(Rosbag2);
(function(exports) {
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
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(MessageIterator$1, exports);
  __exportStar(metadata, exports);
  __exportStar(RawMessageIterator$1, exports);
  __exportStar(Rosbag2, exports);
  __exportStar(types$1, exports);
  __exportStar(yaml, exports);
})(dist$4);
var SqliteSqljs$1 = {};
var sqlWasm = { exports: {} };
var __viteBrowserExternal = {};
var __viteBrowserExternal$1 = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  "default": __viteBrowserExternal
});
var require$$2 = /* @__PURE__ */ getAugmentedNamespace(__viteBrowserExternal$1);
(function(module, exports) {
  var initSqlJsPromise = void 0;
  var initSqlJs = function(moduleConfig) {
    if (initSqlJsPromise) {
      return initSqlJsPromise;
    }
    initSqlJsPromise = new Promise(function(resolveModule, reject) {
      var Module = typeof moduleConfig !== "undefined" ? moduleConfig : {};
      var originalOnAbortFunction = Module["onAbort"];
      Module["onAbort"] = function(errorThatCausedAbort) {
        reject(new Error(errorThatCausedAbort));
        if (originalOnAbortFunction) {
          originalOnAbortFunction(errorThatCausedAbort);
        }
      };
      Module["postRun"] = Module["postRun"] || [];
      Module["postRun"].push(function() {
        resolveModule(Module);
      });
      module = void 0;
      var f;
      f || (f = typeof Module !== "undefined" ? Module : {});
      f.onRuntimeInitialized = function() {
        function a(h, m) {
          this.Qa = h;
          this.db = m;
          this.Oa = 1;
          this.nb = [];
        }
        function b(h, m) {
          this.db = m;
          m = aa(h) + 1;
          this.eb = da(m);
          if (null === this.eb)
            throw Error("Unable to allocate memory for the SQL string");
          ea(h, k, this.eb, m);
          this.kb = this.eb;
          this.$a = this.rb = null;
        }
        function c(h) {
          h = h || {};
          this.filename = "dbfile_" + (4294967295 * Math.random() >>> 0);
          null != h.data ? fa(this.filename, h.data) : h.file ? (h = h.file, n.gb || (n.gb = new FileReaderSync()), n.createNode(ha, this.filename, n.Za, 0, h, h.lastModifiedDate)) : (h instanceof Array || h instanceof Uint8Array) && fa(this.filename, h);
          this.handleError(g(this.filename, d));
          this.db = q(d, "i32");
          jc(this.db);
          this.hb = {};
          this.Wa = {};
        }
        var d = v(4), e = f.cwrap, g = e("sqlite3_open", "number", ["string", "number"]), l = e("sqlite3_close_v2", "number", ["number"]), p = e("sqlite3_exec", "number", ["number", "string", "number", "number", "number"]), w = e("sqlite3_changes", "number", ["number"]), u = e("sqlite3_prepare_v2", "number", ["number", "string", "number", "number", "number"]), D = e("sqlite3_sql", "string", ["number"]), J = e(
          "sqlite3_normalized_sql",
          "string",
          ["number"]
        ), ba = e("sqlite3_prepare_v2", "number", ["number", "number", "number", "number", "number"]), kc = e("sqlite3_bind_text", "number", ["number", "number", "number", "number", "number"]), rb = e("sqlite3_bind_blob", "number", ["number", "number", "number", "number", "number"]), lc = e("sqlite3_bind_double", "number", ["number", "number", "number"]), mc = e("sqlite3_bind_int", "number", ["number", "number", "number"]), nc = e("sqlite3_bind_parameter_index", "number", ["number", "string"]), oc = e("sqlite3_step", "number", ["number"]), pc = e("sqlite3_errmsg", "string", ["number"]), qc = e("sqlite3_column_count", "number", ["number"]), rc = e("sqlite3_data_count", "number", ["number"]), sc = e("sqlite3_column_double", "number", ["number", "number"]), sb = e("sqlite3_column_text", "string", ["number", "number"]), tc = e("sqlite3_column_blob", "number", ["number", "number"]), uc = e("sqlite3_column_bytes", "number", ["number", "number"]), vc = e("sqlite3_column_type", "number", ["number", "number"]), wc = e("sqlite3_column_name", "string", ["number", "number"]), xc = e(
          "sqlite3_reset",
          "number",
          ["number"]
        ), yc = e("sqlite3_clear_bindings", "number", ["number"]), zc = e("sqlite3_finalize", "number", ["number"]), Ac = e("sqlite3_create_function_v2", "number", "number string number number number number number number number".split(" ")), Bc = e("sqlite3_value_type", "number", ["number"]), Cc = e("sqlite3_value_bytes", "number", ["number"]), Dc = e("sqlite3_value_text", "string", ["number"]), Ec = e("sqlite3_value_blob", "number", ["number"]), Fc = e("sqlite3_value_double", "number", ["number"]), Gc = e(
          "sqlite3_result_double",
          "",
          ["number", "number"]
        ), tb = e("sqlite3_result_null", "", ["number"]), Hc = e("sqlite3_result_text", "", ["number", "string", "number", "number"]), Ic = e("sqlite3_result_blob", "", ["number", "number", "number", "number"]), Jc = e("sqlite3_result_int", "", ["number", "number"]), ub = e("sqlite3_result_error", "", ["number", "string", "number"]), jc = e("RegisterExtensionFunctions", "number", ["number"]);
        a.prototype.bind = function(h) {
          if (!this.Qa)
            throw "Statement closed";
          this.reset();
          return Array.isArray(h) ? this.Hb(h) : null != h && "object" === typeof h ? this.Ib(h) : true;
        };
        a.prototype.step = function() {
          if (!this.Qa)
            throw "Statement closed";
          this.Oa = 1;
          var h = oc(this.Qa);
          switch (h) {
            case 100:
              return true;
            case 101:
              return false;
            default:
              throw this.db.handleError(h);
          }
        };
        a.prototype.Db = function(h) {
          null == h && (h = this.Oa, this.Oa += 1);
          return sc(this.Qa, h);
        };
        a.prototype.Kb = function(h) {
          null == h && (h = this.Oa, this.Oa += 1);
          h = sb(this.Qa, h);
          if ("function" !== typeof BigInt)
            throw Error("BigInt is not supported");
          return BigInt(h);
        };
        a.prototype.Lb = function(h) {
          null == h && (h = this.Oa, this.Oa += 1);
          return sb(this.Qa, h);
        };
        a.prototype.getBlob = function(h) {
          null == h && (h = this.Oa, this.Oa += 1);
          var m = uc(this.Qa, h);
          h = tc(this.Qa, h);
          for (var t = new Uint8Array(m), r = 0; r < m; r += 1)
            t[r] = x[h + r];
          return t;
        };
        a.prototype.get = function(h, m) {
          m = m || {};
          null != h && this.bind(h) && this.step();
          h = [];
          for (var t = rc(this.Qa), r = 0; r < t; r += 1)
            switch (vc(this.Qa, r)) {
              case 1:
                var C = m.useBigInt ? this.Kb(r) : this.Db(r);
                h.push(C);
                break;
              case 2:
                h.push(this.Db(r));
                break;
              case 3:
                h.push(this.Lb(r));
                break;
              case 4:
                h.push(this.getBlob(r));
                break;
              default:
                h.push(null);
            }
          return h;
        };
        a.prototype.getColumnNames = function() {
          for (var h = [], m = qc(this.Qa), t = 0; t < m; t += 1)
            h.push(wc(this.Qa, t));
          return h;
        };
        a.prototype.getAsObject = function(h, m) {
          h = this.get(h, m);
          m = this.getColumnNames();
          for (var t = {}, r = 0; r < m.length; r += 1)
            t[m[r]] = h[r];
          return t;
        };
        a.prototype.getSQL = function() {
          return D(this.Qa);
        };
        a.prototype.getNormalizedSQL = function() {
          return J(this.Qa);
        };
        a.prototype.run = function(h) {
          null != h && this.bind(h);
          this.step();
          return this.reset();
        };
        a.prototype.xb = function(h, m) {
          null == m && (m = this.Oa, this.Oa += 1);
          h = ia(h);
          var t = ja(h);
          this.nb.push(t);
          this.db.handleError(kc(this.Qa, m, t, h.length - 1, 0));
        };
        a.prototype.Gb = function(h, m) {
          null == m && (m = this.Oa, this.Oa += 1);
          var t = ja(h);
          this.nb.push(t);
          this.db.handleError(rb(this.Qa, m, t, h.length, 0));
        };
        a.prototype.wb = function(h, m) {
          null == m && (m = this.Oa, this.Oa += 1);
          this.db.handleError((h === (h | 0) ? mc : lc)(this.Qa, m, h));
        };
        a.prototype.Jb = function(h) {
          null == h && (h = this.Oa, this.Oa += 1);
          rb(this.Qa, h, 0, 0, 0);
        };
        a.prototype.yb = function(h, m) {
          null == m && (m = this.Oa, this.Oa += 1);
          switch (typeof h) {
            case "string":
              this.xb(
                h,
                m
              );
              return;
            case "number":
              this.wb(h, m);
              return;
            case "bigint":
              this.xb(h.toString(), m);
              return;
            case "boolean":
              this.wb(h + 0, m);
              return;
            case "object":
              if (null === h) {
                this.Jb(m);
                return;
              }
              if (null != h.length) {
                this.Gb(h, m);
                return;
              }
          }
          throw "Wrong API use : tried to bind a value of an unknown type (" + h + ").";
        };
        a.prototype.Ib = function(h) {
          var m = this;
          Object.keys(h).forEach(function(t) {
            var r = nc(m.Qa, t);
            0 !== r && m.yb(h[t], r);
          });
          return true;
        };
        a.prototype.Hb = function(h) {
          for (var m = 0; m < h.length; m += 1)
            this.yb(h[m], m + 1);
          return true;
        };
        a.prototype.reset = function() {
          this.freemem();
          return 0 === yc(this.Qa) && 0 === xc(this.Qa);
        };
        a.prototype.freemem = function() {
          for (var h; void 0 !== (h = this.nb.pop()); )
            la(h);
        };
        a.prototype.free = function() {
          this.freemem();
          var h = 0 === zc(this.Qa);
          delete this.db.hb[this.Qa];
          this.Qa = 0;
          return h;
        };
        b.prototype.next = function() {
          if (null === this.eb)
            return { done: true };
          null !== this.$a && (this.$a.free(), this.$a = null);
          if (!this.db.db)
            throw this.pb(), Error("Database closed");
          var h = ma(), m = v(4);
          na(d);
          na(m);
          try {
            this.db.handleError(ba(this.db.db, this.kb, -1, d, m));
            this.kb = q(m, "i32");
            var t = q(d, "i32");
            if (0 === t)
              return this.pb(), { done: true };
            this.$a = new a(t, this.db);
            this.db.hb[t] = this.$a;
            return { value: this.$a, done: false };
          } catch (r) {
            throw this.rb = y(this.kb), this.pb(), r;
          } finally {
            oa(h);
          }
        };
        b.prototype.pb = function() {
          la(this.eb);
          this.eb = null;
        };
        b.prototype.getRemainingSQL = function() {
          return null !== this.rb ? this.rb : y(this.kb);
        };
        "function" === typeof Symbol && "symbol" === typeof Symbol.iterator && (b.prototype[Symbol.iterator] = function() {
          return this;
        });
        c.prototype.run = function(h, m) {
          if (!this.db)
            throw "Database closed";
          if (m) {
            h = this.prepare(h, m);
            try {
              h.step();
            } finally {
              h.free();
            }
          } else
            this.handleError(p(this.db, h, 0, 0, d));
          return this;
        };
        c.prototype.exec = function(h, m, t) {
          if (!this.db)
            throw "Database closed";
          var r = ma(), C = null;
          try {
            var V = aa(h) + 1, H = v(V);
            ea(h, x, H, V);
            var ka = H;
            var ca = v(4);
            for (h = []; 0 !== q(ka, "i8"); ) {
              na(d);
              na(ca);
              this.handleError(ba(this.db, ka, -1, d, ca));
              var E = q(d, "i32");
              ka = q(ca, "i32");
              if (0 !== E) {
                V = null;
                C = new a(E, this);
                for (null != m && C.bind(m); C.step(); )
                  null === V && (V = { columns: C.getColumnNames(), values: [] }, h.push(V)), V.values.push(C.get(
                    null,
                    t
                  ));
                C.free();
              }
            }
            return h;
          } catch (O) {
            throw C && C.free(), O;
          } finally {
            oa(r);
          }
        };
        c.prototype.each = function(h, m, t, r, C) {
          "function" === typeof m && (r = t, t = m, m = void 0);
          h = this.prepare(h, m);
          try {
            for (; h.step(); )
              t(h.getAsObject(null, C));
          } finally {
            h.free();
          }
          if ("function" === typeof r)
            return r();
        };
        c.prototype.prepare = function(h, m) {
          na(d);
          this.handleError(u(this.db, h, -1, d, 0));
          h = q(d, "i32");
          if (0 === h)
            throw "Nothing to prepare";
          var t = new a(h, this);
          null != m && t.bind(m);
          return this.hb[h] = t;
        };
        c.prototype.iterateStatements = function(h) {
          return new b(
            h,
            this
          );
        };
        c.prototype["export"] = function() {
          Object.values(this.hb).forEach(function(m) {
            m.free();
          });
          Object.values(this.Wa).forEach(pa);
          this.Wa = {};
          this.handleError(l(this.db));
          var h = qa(this.filename);
          this.handleError(g(this.filename, d));
          this.db = q(d, "i32");
          return h;
        };
        c.prototype.close = function() {
          null !== this.db && (Object.values(this.hb).forEach(function(h) {
            h.free();
          }), Object.values(this.Wa).forEach(pa), this.Wa = {}, this.handleError(l(this.db)), ra("/" + this.filename), this.db = null);
        };
        c.prototype.handleError = function(h) {
          if (0 === h)
            return null;
          h = pc(this.db);
          throw Error(h);
        };
        c.prototype.getRowsModified = function() {
          return w(this.db);
        };
        c.prototype.create_function = function(h, m) {
          Object.prototype.hasOwnProperty.call(this.Wa, h) && (pa(this.Wa[h]), delete this.Wa[h]);
          var t = sa(function(r, C, V) {
            for (var H, ka = [], ca = 0; ca < C; ca += 1) {
              var E = q(V + 4 * ca, "i32"), O = Bc(E);
              if (1 === O || 2 === O)
                E = Fc(E);
              else if (3 === O)
                E = Dc(E);
              else if (4 === O) {
                O = E;
                E = Cc(O);
                O = Ec(O);
                for (var xb = new Uint8Array(E), Aa = 0; Aa < E; Aa += 1)
                  xb[Aa] = x[O + Aa];
                E = xb;
              } else
                E = null;
              ka.push(E);
            }
            try {
              H = m.apply(
                null,
                ka
              );
            } catch (Mc) {
              ub(r, Mc, -1);
              return;
            }
            switch (typeof H) {
              case "boolean":
                Jc(r, H ? 1 : 0);
                break;
              case "number":
                Gc(r, H);
                break;
              case "string":
                Hc(r, H, -1, -1);
                break;
              case "object":
                null === H ? tb(r) : null != H.length ? (C = ja(H), Ic(r, C, H.length, -1), la(C)) : ub(r, "Wrong API use : tried to return a value of an unknown type (" + H + ").", -1);
                break;
              default:
                tb(r);
            }
          });
          this.Wa[h] = t;
          this.handleError(Ac(this.db, h, m.length, 1, 0, t, 0, 0, 0));
          return this;
        };
        f.Database = c;
      };
      var ta = {}, z;
      for (z in f)
        f.hasOwnProperty(z) && (ta[z] = f[z]);
      var ua = "./this.program", va = "object" === typeof window, wa = "function" === typeof importScripts, xa = "object" === typeof process && "object" === typeof process.versions && "string" === typeof process.versions.node, A = "", ya, za, Ba, Ca, Da;
      if (xa)
        A = wa ? require$$2.dirname(A) + "/" : __dirname + "/", ya = function(a, b) {
          Ca || (Ca = require$$2);
          Da || (Da = require$$2);
          a = Da.normalize(a);
          return Ca.readFileSync(a, b ? null : "utf8");
        }, Ba = function(a) {
          a = ya(a, true);
          a.buffer || (a = new Uint8Array(a));
          assert(a.buffer);
          return a;
        }, za = function(a, b, c) {
          Ca || (Ca = require$$2);
          Da || (Da = require$$2);
          a = Da.normalize(a);
          Ca.readFile(a, function(d, e) {
            d ? c(d) : b(e.buffer);
          });
        }, 1 < process.argv.length && (ua = process.argv[1].replace(/\\/g, "/")), process.argv.slice(2), module.exports = f, f.inspect = function() {
          return "[Emscripten Module object]";
        };
      else if (va || wa)
        wa ? A = self.location.href : "undefined" !== typeof document && document.currentScript && (A = document.currentScript.src), A = 0 !== A.indexOf("blob:") ? A.substr(0, A.lastIndexOf("/") + 1) : "", ya = function(a) {
          var b = new XMLHttpRequest();
          b.open("GET", a, false);
          b.send(null);
          return b.responseText;
        }, wa && (Ba = function(a) {
          var b = new XMLHttpRequest();
          b.open("GET", a, false);
          b.responseType = "arraybuffer";
          b.send(null);
          return new Uint8Array(b.response);
        }), za = function(a, b, c) {
          var d = new XMLHttpRequest();
          d.open("GET", a, true);
          d.responseType = "arraybuffer";
          d.onload = function() {
            200 == d.status || 0 == d.status && d.response ? b(d.response) : c();
          };
          d.onerror = c;
          d.send(null);
        };
      var Ea = f.print || console.log.bind(console), B = f.printErr || console.warn.bind(console);
      for (z in ta)
        ta.hasOwnProperty(z) && (f[z] = ta[z]);
      ta = null;
      f.thisProgram && (ua = f.thisProgram);
      var Fa = [], Ga;
      function pa(a) {
        Ga.delete(F.get(a));
        Fa.push(a);
      }
      function sa(a) {
        if (!Ga) {
          Ga = /* @__PURE__ */ new WeakMap();
          for (var b = 0; b < F.length; b++) {
            var c = F.get(b);
            c && Ga.set(c, b);
          }
        }
        if (Ga.has(a))
          a = Ga.get(a);
        else {
          if (Fa.length)
            b = Fa.pop();
          else {
            try {
              F.grow(1);
            } catch (g) {
              if (!(g instanceof RangeError))
                throw g;
              throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
            }
            b = F.length - 1;
          }
          try {
            F.set(b, a);
          } catch (g) {
            if (!(g instanceof TypeError))
              throw g;
            if ("function" === typeof WebAssembly.Function) {
              var d = { i: "i32", j: "i64", f: "f32", d: "f64" }, e = { parameters: [], results: [] };
              for (c = 1; 4 > c; ++c)
                e.parameters.push(d["viii"[c]]);
              c = new WebAssembly.Function(e, a);
            } else {
              d = [1, 0, 1, 96];
              e = { i: 127, j: 126, f: 125, d: 124 };
              d.push(3);
              for (c = 0; 3 > c; ++c)
                d.push(e["iii"[c]]);
              d.push(0);
              d[1] = d.length - 2;
              c = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0].concat(d, [2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0]));
              c = new WebAssembly.Module(c);
              c = new WebAssembly.Instance(c, { e: { f: a } }).exports.f;
            }
            F.set(b, c);
          }
          Ga.set(a, b);
          a = b;
        }
        return a;
      }
      var Ha;
      f.wasmBinary && (Ha = f.wasmBinary);
      f.noExitRuntime || true;
      "object" !== typeof WebAssembly && G("no native wasm support detected");
      function na(a) {
        var b = "i32";
        "*" === b.charAt(b.length - 1) && (b = "i32");
        switch (b) {
          case "i1":
            x[a >> 0] = 0;
            break;
          case "i8":
            x[a >> 0] = 0;
            break;
          case "i16":
            Ia[a >> 1] = 0;
            break;
          case "i32":
            I[a >> 2] = 0;
            break;
          case "i64":
            K = [0, (L = 0, 1 <= +Math.abs(L) ? 0 < L ? (Math.min(+Math.floor(L / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((L - +(~~L >>> 0)) / 4294967296) >>> 0 : 0)];
            I[a >> 2] = K[0];
            I[a + 4 >> 2] = K[1];
            break;
          case "float":
            Ja[a >> 2] = 0;
            break;
          case "double":
            Ka[a >> 3] = 0;
            break;
          default:
            G("invalid type for setValue: " + b);
        }
      }
      function q(a, b) {
        b = b || "i8";
        "*" === b.charAt(b.length - 1) && (b = "i32");
        switch (b) {
          case "i1":
            return x[a >> 0];
          case "i8":
            return x[a >> 0];
          case "i16":
            return Ia[a >> 1];
          case "i32":
            return I[a >> 2];
          case "i64":
            return I[a >> 2];
          case "float":
            return Ja[a >> 2];
          case "double":
            return Ka[a >> 3];
          default:
            G("invalid type for getValue: " + b);
        }
        return null;
      }
      var La, Ma = false;
      function assert(a, b) {
        a || G("Assertion failed: " + b);
      }
      function Na(a) {
        var b = f["_" + a];
        assert(b, "Cannot call unknown function " + a + ", make sure it is exported");
        return b;
      }
      function Oa(a, b, c, d) {
        var e = { string: function(u) {
          var D = 0;
          if (null !== u && void 0 !== u && 0 !== u) {
            var J = (u.length << 2) + 1;
            D = v(J);
            ea(u, k, D, J);
          }
          return D;
        }, array: function(u) {
          var D = v(u.length);
          x.set(u, D);
          return D;
        } };
        a = Na(a);
        var g = [], l = 0;
        if (d)
          for (var p = 0; p < d.length; p++) {
            var w = e[c[p]];
            w ? (0 === l && (l = ma()), g[p] = w(d[p])) : g[p] = d[p];
          }
        c = a.apply(null, g);
        return c = function(u) {
          0 !== l && oa(l);
          return "string" === b ? y(u) : "boolean" === b ? !!u : u;
        }(c);
      }
      function ja(a) {
        var b = da(a.length);
        a.subarray || a.slice ? k.set(a, b) : k.set(new Uint8Array(a), b);
        return b;
      }
      var Ra = "undefined" !== typeof TextDecoder ? new TextDecoder("utf8") : void 0;
      function Sa(a, b, c) {
        var d = b + c;
        for (c = b; a[c] && !(c >= d); )
          ++c;
        if (16 < c - b && a.subarray && Ra)
          return Ra.decode(a.subarray(b, c));
        for (d = ""; b < c; ) {
          var e = a[b++];
          if (e & 128) {
            var g = a[b++] & 63;
            if (192 == (e & 224))
              d += String.fromCharCode((e & 31) << 6 | g);
            else {
              var l = a[b++] & 63;
              e = 224 == (e & 240) ? (e & 15) << 12 | g << 6 | l : (e & 7) << 18 | g << 12 | l << 6 | a[b++] & 63;
              65536 > e ? d += String.fromCharCode(e) : (e -= 65536, d += String.fromCharCode(55296 | e >> 10, 56320 | e & 1023));
            }
          } else
            d += String.fromCharCode(e);
        }
        return d;
      }
      function y(a, b) {
        return a ? Sa(k, a, b) : "";
      }
      function ea(a, b, c, d) {
        if (!(0 < d))
          return 0;
        var e = c;
        d = c + d - 1;
        for (var g = 0; g < a.length; ++g) {
          var l = a.charCodeAt(g);
          if (55296 <= l && 57343 >= l) {
            var p = a.charCodeAt(++g);
            l = 65536 + ((l & 1023) << 10) | p & 1023;
          }
          if (127 >= l) {
            if (c >= d)
              break;
            b[c++] = l;
          } else {
            if (2047 >= l) {
              if (c + 1 >= d)
                break;
              b[c++] = 192 | l >> 6;
            } else {
              if (65535 >= l) {
                if (c + 2 >= d)
                  break;
                b[c++] = 224 | l >> 12;
              } else {
                if (c + 3 >= d)
                  break;
                b[c++] = 240 | l >> 18;
                b[c++] = 128 | l >> 12 & 63;
              }
              b[c++] = 128 | l >> 6 & 63;
            }
            b[c++] = 128 | l & 63;
          }
        }
        b[c] = 0;
        return c - e;
      }
      function aa(a) {
        for (var b = 0, c = 0; c < a.length; ++c) {
          var d = a.charCodeAt(c);
          55296 <= d && 57343 >= d && (d = 65536 + ((d & 1023) << 10) | a.charCodeAt(++c) & 1023);
          127 >= d ? ++b : b = 2047 >= d ? b + 2 : 65535 >= d ? b + 3 : b + 4;
        }
        return b;
      }
      function Ta(a) {
        var b = aa(a) + 1, c = da(b);
        c && ea(a, x, c, b);
        return c;
      }
      var Ua, x, k, Ia, I, Ja, Ka;
      function Va() {
        var a = La.buffer;
        Ua = a;
        f.HEAP8 = x = new Int8Array(a);
        f.HEAP16 = Ia = new Int16Array(a);
        f.HEAP32 = I = new Int32Array(a);
        f.HEAPU8 = k = new Uint8Array(a);
        f.HEAPU16 = new Uint16Array(a);
        f.HEAPU32 = new Uint32Array(a);
        f.HEAPF32 = Ja = new Float32Array(a);
        f.HEAPF64 = Ka = new Float64Array(a);
      }
      var F, Wa = [], Xa = [], Ya = [];
      function Za() {
        var a = f.preRun.shift();
        Wa.unshift(a);
      }
      var $a = 0, bb = null;
      f.preloadedImages = {};
      f.preloadedAudios = {};
      function G(a) {
        if (f.onAbort)
          f.onAbort(a);
        B(a);
        Ma = true;
        throw new WebAssembly.RuntimeError("abort(" + a + "). Build with -s ASSERTIONS=1 for more info.");
      }
      function cb() {
        return M.startsWith("data:application/octet-stream;base64,");
      }
      var M;
      M = "sql-wasm.wasm";
      if (!cb()) {
        var db = M;
        M = f.locateFile ? f.locateFile(db, A) : A + db;
      }
      function eb() {
        var a = M;
        try {
          if (a == M && Ha)
            return new Uint8Array(Ha);
          if (Ba)
            return Ba(a);
          throw "both async and sync fetching of the wasm failed";
        } catch (b) {
          G(b);
        }
      }
      function fb() {
        if (!Ha && (va || wa)) {
          if ("function" === typeof fetch && !M.startsWith("file://"))
            return fetch(M, { credentials: "same-origin" }).then(function(a) {
              if (!a.ok)
                throw "failed to load wasm binary file at '" + M + "'";
              return a.arrayBuffer();
            }).catch(function() {
              return eb();
            });
          if (za)
            return new Promise(function(a, b) {
              za(M, function(c) {
                a(new Uint8Array(c));
              }, b);
            });
        }
        return Promise.resolve().then(function() {
          return eb();
        });
      }
      var L, K;
      function gb(a) {
        for (; 0 < a.length; ) {
          var b = a.shift();
          if ("function" == typeof b)
            b(f);
          else {
            var c = b.Ub;
            "number" === typeof c ? void 0 === b.ob ? F.get(c)() : F.get(c)(b.ob) : c(void 0 === b.ob ? null : b.ob);
          }
        }
      }
      function hb(a) {
        return a.replace(/\b_Z[\w\d_]+/g, function(b) {
          return b === b ? b : b + " [" + b + "]";
        });
      }
      function ib() {
        function a(l) {
          return (l = l.toTimeString().match(/\(([A-Za-z ]+)\)$/)) ? l[1] : "GMT";
        }
        var b = new Date().getFullYear(), c = new Date(b, 0, 1), d = new Date(b, 6, 1);
        b = c.getTimezoneOffset();
        var e = d.getTimezoneOffset(), g = Math.max(b, e);
        I[jb() >> 2] = 60 * g;
        I[kb() >> 2] = Number(b != e);
        c = a(c);
        d = a(d);
        c = Ta(c);
        d = Ta(d);
        e < b ? (I[lb() >> 2] = c, I[lb() + 4 >> 2] = d) : (I[lb() >> 2] = d, I[lb() + 4 >> 2] = c);
      }
      var mb;
      function nb(a, b) {
        for (var c = 0, d = a.length - 1; 0 <= d; d--) {
          var e = a[d];
          "." === e ? a.splice(d, 1) : ".." === e ? (a.splice(d, 1), c++) : c && (a.splice(d, 1), c--);
        }
        if (b)
          for (; c; c--)
            a.unshift("..");
        return a;
      }
      function N(a) {
        var b = "/" === a.charAt(0), c = "/" === a.substr(-1);
        (a = nb(a.split("/").filter(function(d) {
          return !!d;
        }), !b).join("/")) || b || (a = ".");
        a && c && (a += "/");
        return (b ? "/" : "") + a;
      }
      function ob(a) {
        var b = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/.exec(a).slice(1);
        a = b[0];
        b = b[1];
        if (!a && !b)
          return ".";
        b && (b = b.substr(0, b.length - 1));
        return a + b;
      }
      function pb(a) {
        if ("/" === a)
          return "/";
        a = N(a);
        a = a.replace(/\/$/, "");
        var b = a.lastIndexOf("/");
        return -1 === b ? a : a.substr(b + 1);
      }
      function qb() {
        if ("object" === typeof crypto && "function" === typeof crypto.getRandomValues) {
          var a = new Uint8Array(1);
          return function() {
            crypto.getRandomValues(a);
            return a[0];
          };
        }
        if (xa)
          try {
            var b = require$$2;
            return function() {
              return b.randomBytes(1)[0];
            };
          } catch (c) {
          }
        return function() {
          G("randomDevice");
        };
      }
      function vb() {
        for (var a = "", b = false, c = arguments.length - 1; -1 <= c && !b; c--) {
          b = 0 <= c ? arguments[c] : "/";
          if ("string" !== typeof b)
            throw new TypeError("Arguments to path.resolve must be strings");
          if (!b)
            return "";
          a = b + "/" + a;
          b = "/" === b.charAt(0);
        }
        a = nb(a.split("/").filter(function(d) {
          return !!d;
        }), !b).join("/");
        return (b ? "/" : "") + a || ".";
      }
      var wb = [];
      function yb(a, b) {
        wb[a] = { input: [], output: [], cb: b };
        zb(a, Ab);
      }
      var Ab = { open: function(a) {
        var b = wb[a.node.rdev];
        if (!b)
          throw new P(43);
        a.tty = b;
        a.seekable = false;
      }, close: function(a) {
        a.tty.cb.flush(a.tty);
      }, flush: function(a) {
        a.tty.cb.flush(a.tty);
      }, read: function(a, b, c, d) {
        if (!a.tty || !a.tty.cb.Eb)
          throw new P(60);
        for (var e = 0, g = 0; g < d; g++) {
          try {
            var l = a.tty.cb.Eb(a.tty);
          } catch (p) {
            throw new P(29);
          }
          if (void 0 === l && 0 === e)
            throw new P(6);
          if (null === l || void 0 === l)
            break;
          e++;
          b[c + g] = l;
        }
        e && (a.node.timestamp = Date.now());
        return e;
      }, write: function(a, b, c, d) {
        if (!a.tty || !a.tty.cb.tb)
          throw new P(60);
        try {
          for (var e = 0; e < d; e++)
            a.tty.cb.tb(a.tty, b[c + e]);
        } catch (g) {
          throw new P(29);
        }
        d && (a.node.timestamp = Date.now());
        return e;
      } }, Bb = { Eb: function(a) {
        if (!a.input.length) {
          var b = null;
          if (xa) {
            var c = Buffer.alloc(256), d = 0;
            try {
              d = Ca.readSync(process.stdin.fd, c, 0, 256, null);
            } catch (e) {
              if (e.toString().includes("EOF"))
                d = 0;
              else
                throw e;
            }
            0 < d ? b = c.slice(0, d).toString("utf-8") : b = null;
          } else
            "undefined" != typeof window && "function" == typeof window.prompt ? (b = window.prompt("Input: "), null !== b && (b += "\n")) : "function" == typeof readline && (b = readline(), null !== b && (b += "\n"));
          if (!b)
            return null;
          a.input = ia(b, true);
        }
        return a.input.shift();
      }, tb: function(a, b) {
        null === b || 10 === b ? (Ea(Sa(a.output, 0)), a.output = []) : 0 != b && a.output.push(b);
      }, flush: function(a) {
        a.output && 0 < a.output.length && (Ea(Sa(a.output, 0)), a.output = []);
      } }, Cb = { tb: function(a, b) {
        null === b || 10 === b ? (B(Sa(a.output, 0)), a.output = []) : 0 != b && a.output.push(b);
      }, flush: function(a) {
        a.output && 0 < a.output.length && (B(Sa(a.output, 0)), a.output = []);
      } };
      function Db(a) {
        a = 65536 * Math.ceil(a / 65536);
        var b = Eb(65536, a);
        if (!b)
          return 0;
        k.fill(0, b, b + a);
        return b;
      }
      var Q = { Va: null, Ua: function() {
        return Q.createNode(null, "/", 16895, 0);
      }, createNode: function(a, b, c, d) {
        if (24576 === (c & 61440) || 4096 === (c & 61440))
          throw new P(63);
        Q.Va || (Q.Va = { dir: { node: { Ta: Q.La.Ta, Sa: Q.La.Sa, lookup: Q.La.lookup, fb: Q.La.fb, rename: Q.La.rename, unlink: Q.La.unlink, rmdir: Q.La.rmdir, readdir: Q.La.readdir, symlink: Q.La.symlink }, stream: { Xa: Q.Ma.Xa } }, file: { node: { Ta: Q.La.Ta, Sa: Q.La.Sa }, stream: { Xa: Q.Ma.Xa, read: Q.Ma.read, write: Q.Ma.write, vb: Q.Ma.vb, ib: Q.Ma.ib, jb: Q.Ma.jb } }, link: { node: {
          Ta: Q.La.Ta,
          Sa: Q.La.Sa,
          readlink: Q.La.readlink
        }, stream: {} }, Ab: { node: { Ta: Q.La.Ta, Sa: Q.La.Sa }, stream: Fb } });
        c = Gb(a, b, c, d);
        R(c.mode) ? (c.La = Q.Va.dir.node, c.Ma = Q.Va.dir.stream, c.Na = {}) : 32768 === (c.mode & 61440) ? (c.La = Q.Va.file.node, c.Ma = Q.Va.file.stream, c.Ra = 0, c.Na = null) : 40960 === (c.mode & 61440) ? (c.La = Q.Va.link.node, c.Ma = Q.Va.link.stream) : 8192 === (c.mode & 61440) && (c.La = Q.Va.Ab.node, c.Ma = Q.Va.Ab.stream);
        c.timestamp = Date.now();
        a && (a.Na[b] = c, a.timestamp = c.timestamp);
        return c;
      }, Vb: function(a) {
        return a.Na ? a.Na.subarray ? a.Na.subarray(0, a.Ra) : new Uint8Array(a.Na) : new Uint8Array(0);
      }, Bb: function(a, b) {
        var c = a.Na ? a.Na.length : 0;
        c >= b || (b = Math.max(b, c * (1048576 > c ? 2 : 1.125) >>> 0), 0 != c && (b = Math.max(b, 256)), c = a.Na, a.Na = new Uint8Array(b), 0 < a.Ra && a.Na.set(c.subarray(0, a.Ra), 0));
      }, Rb: function(a, b) {
        if (a.Ra != b)
          if (0 == b)
            a.Na = null, a.Ra = 0;
          else {
            var c = a.Na;
            a.Na = new Uint8Array(b);
            c && a.Na.set(c.subarray(0, Math.min(b, a.Ra)));
            a.Ra = b;
          }
      }, La: {
        Ta: function(a) {
          var b = {};
          b.dev = 8192 === (a.mode & 61440) ? a.id : 1;
          b.ino = a.id;
          b.mode = a.mode;
          b.nlink = 1;
          b.uid = 0;
          b.gid = 0;
          b.rdev = a.rdev;
          R(a.mode) ? b.size = 4096 : 32768 === (a.mode & 61440) ? b.size = a.Ra : 40960 === (a.mode & 61440) ? b.size = a.link.length : b.size = 0;
          b.atime = new Date(a.timestamp);
          b.mtime = new Date(a.timestamp);
          b.ctime = new Date(a.timestamp);
          b.zb = 4096;
          b.blocks = Math.ceil(b.size / b.zb);
          return b;
        },
        Sa: function(a, b) {
          void 0 !== b.mode && (a.mode = b.mode);
          void 0 !== b.timestamp && (a.timestamp = b.timestamp);
          void 0 !== b.size && Q.Rb(a, b.size);
        },
        lookup: function() {
          throw Hb[44];
        },
        fb: function(a, b, c, d) {
          return Q.createNode(a, b, c, d);
        },
        rename: function(a, b, c) {
          if (R(a.mode)) {
            try {
              var d = Ib(b, c);
            } catch (g) {
            }
            if (d)
              for (var e in d.Na)
                throw new P(55);
          }
          delete a.parent.Na[a.name];
          a.parent.timestamp = Date.now();
          a.name = c;
          b.Na[c] = a;
          b.timestamp = a.parent.timestamp;
          a.parent = b;
        },
        unlink: function(a, b) {
          delete a.Na[b];
          a.timestamp = Date.now();
        },
        rmdir: function(a, b) {
          var c = Ib(a, b), d;
          for (d in c.Na)
            throw new P(55);
          delete a.Na[b];
          a.timestamp = Date.now();
        },
        readdir: function(a) {
          var b = [".", ".."], c;
          for (c in a.Na)
            a.Na.hasOwnProperty(c) && b.push(c);
          return b;
        },
        symlink: function(a, b, c) {
          a = Q.createNode(a, b, 41471, 0);
          a.link = c;
          return a;
        },
        readlink: function(a) {
          if (40960 !== (a.mode & 61440))
            throw new P(28);
          return a.link;
        }
      }, Ma: { read: function(a, b, c, d, e) {
        var g = a.node.Na;
        if (e >= a.node.Ra)
          return 0;
        a = Math.min(a.node.Ra - e, d);
        if (8 < a && g.subarray)
          b.set(g.subarray(e, e + a), c);
        else
          for (d = 0; d < a; d++)
            b[c + d] = g[e + d];
        return a;
      }, write: function(a, b, c, d, e, g) {
        b.buffer === x.buffer && (g = false);
        if (!d)
          return 0;
        a = a.node;
        a.timestamp = Date.now();
        if (b.subarray && (!a.Na || a.Na.subarray)) {
          if (g)
            return a.Na = b.subarray(c, c + d), a.Ra = d;
          if (0 === a.Ra && 0 === e)
            return a.Na = b.slice(c, c + d), a.Ra = d;
          if (e + d <= a.Ra)
            return a.Na.set(b.subarray(c, c + d), e), d;
        }
        Q.Bb(a, e + d);
        if (a.Na.subarray && b.subarray)
          a.Na.set(b.subarray(c, c + d), e);
        else
          for (g = 0; g < d; g++)
            a.Na[e + g] = b[c + g];
        a.Ra = Math.max(a.Ra, e + d);
        return d;
      }, Xa: function(a, b, c) {
        1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.Ra);
        if (0 > b)
          throw new P(28);
        return b;
      }, vb: function(a, b, c) {
        Q.Bb(a.node, b + c);
        a.node.Ra = Math.max(a.node.Ra, b + c);
      }, ib: function(a, b, c, d, e, g) {
        if (0 !== b)
          throw new P(28);
        if (32768 !== (a.node.mode & 61440))
          throw new P(43);
        a = a.node.Na;
        if (g & 2 || a.buffer !== Ua) {
          if (0 < d || d + c < a.length)
            a.subarray ? a = a.subarray(d, d + c) : a = Array.prototype.slice.call(a, d, d + c);
          d = true;
          c = Db(c);
          if (!c)
            throw new P(48);
          x.set(a, c);
        } else
          d = false, c = a.byteOffset;
        return { Qb: c, mb: d };
      }, jb: function(a, b, c, d, e) {
        if (32768 !== (a.node.mode & 61440))
          throw new P(43);
        if (e & 2)
          return 0;
        Q.Ma.write(a, b, 0, d, c, false);
        return 0;
      } } }, n = { lb: 16895, Za: 33279, gb: null, Ua: function(a) {
        function b(g) {
          g = g.split("/");
          for (var l = d, p = 0; p < g.length - 1; p++) {
            var w = g.slice(0, p + 1).join("/");
            e[w] || (e[w] = n.createNode(l, g[p], n.lb, 0));
            l = e[w];
          }
          return l;
        }
        function c(g) {
          g = g.split("/");
          return g[g.length - 1];
        }
        assert(wa);
        n.gb || (n.gb = new FileReaderSync());
        var d = n.createNode(null, "/", n.lb, 0), e = {};
        Array.prototype.forEach.call(a.sb.files || [], function(g) {
          n.createNode(b(g.name), c(g.name), n.Za, 0, g, g.lastModifiedDate);
        });
        (a.sb.blobs || []).forEach(function(g) {
          n.createNode(b(g.name), c(g.name), n.Za, 0, g.data);
        });
        (a.sb.packages || []).forEach(function(g) {
          g.metadata.files.forEach(function(l) {
            var p = l.filename.substr(1);
            n.createNode(b(p), c(p), n.Za, 0, g.blob.slice(
              l.start,
              l.end
            ));
          });
        });
        return d;
      }, createNode: function(a, b, c, d, e, g) {
        d = Gb(a, b, c);
        d.mode = c;
        d.La = n.La;
        d.Ma = n.Ma;
        d.timestamp = (g || new Date()).getTime();
        assert(n.Za !== n.lb);
        c === n.Za ? (d.size = e.size, d.Na = e) : (d.size = 4096, d.Na = {});
        a && (a.Na[b] = d);
        return d;
      }, La: { Ta: function(a) {
        return { dev: 1, ino: a.id, mode: a.mode, nlink: 1, uid: 0, gid: 0, rdev: void 0, size: a.size, atime: new Date(a.timestamp), mtime: new Date(a.timestamp), ctime: new Date(a.timestamp), zb: 4096, blocks: Math.ceil(a.size / 4096) };
      }, Sa: function(a, b) {
        void 0 !== b.mode && (a.mode = b.mode);
        void 0 !== b.timestamp && (a.timestamp = b.timestamp);
      }, lookup: function() {
        throw new P(44);
      }, fb: function() {
        throw new P(63);
      }, rename: function() {
        throw new P(63);
      }, unlink: function() {
        throw new P(63);
      }, rmdir: function() {
        throw new P(63);
      }, readdir: function(a) {
        var b = [".", ".."], c;
        for (c in a.Na)
          a.Na.hasOwnProperty(c) && b.push(c);
        return b;
      }, symlink: function() {
        throw new P(63);
      }, readlink: function() {
        throw new P(63);
      } }, Ma: { read: function(a, b, c, d, e) {
        if (e >= a.node.size)
          return 0;
        a = a.node.Na.slice(e, e + d);
        d = n.gb.readAsArrayBuffer(a);
        b.set(new Uint8Array(d), c);
        return a.size;
      }, write: function() {
        throw new P(29);
      }, Xa: function(a, b, c) {
        1 === c ? b += a.position : 2 === c && 32768 === (a.node.mode & 61440) && (b += a.node.size);
        if (0 > b)
          throw new P(28);
        return b;
      } } }, ha = null, Jb = {}, S = [], Kb = 1, T = null, Lb = true, U = {}, P = null, Hb = {};
      function W(a, b) {
        a = vb("/", a);
        b = b || {};
        if (!a)
          return { path: "", node: null };
        var c = { Cb: true, ub: 0 }, d;
        for (d in c)
          void 0 === b[d] && (b[d] = c[d]);
        if (8 < b.ub)
          throw new P(32);
        a = nb(a.split("/").filter(function(l) {
          return !!l;
        }), false);
        var e = ha;
        c = "/";
        for (d = 0; d < a.length; d++) {
          var g = d === a.length - 1;
          if (g && b.parent)
            break;
          e = Ib(e, a[d]);
          c = N(c + "/" + a[d]);
          e.ab && (!g || g && b.Cb) && (e = e.ab.root);
          if (!g || b.Ya) {
            for (g = 0; 40960 === (e.mode & 61440); )
              if (e = Mb(c), c = vb(ob(c), e), e = W(c, { ub: b.ub }).node, 40 < g++)
                throw new P(32);
          }
        }
        return { path: c, node: e };
      }
      function Nb(a) {
        for (var b; ; ) {
          if (a === a.parent)
            return a = a.Ua.Fb, b ? "/" !== a[a.length - 1] ? a + "/" + b : a + b : a;
          b = b ? a.name + "/" + b : a.name;
          a = a.parent;
        }
      }
      function Ob(a, b) {
        for (var c = 0, d = 0; d < b.length; d++)
          c = (c << 5) - c + b.charCodeAt(d) | 0;
        return (a + c >>> 0) % T.length;
      }
      function Pb(a) {
        var b = Ob(a.parent.id, a.name);
        if (T[b] === a)
          T[b] = a.bb;
        else
          for (b = T[b]; b; ) {
            if (b.bb === a) {
              b.bb = a.bb;
              break;
            }
            b = b.bb;
          }
      }
      function Ib(a, b) {
        var c;
        if (c = (c = Qb(a, "x")) ? c : a.La.lookup ? 0 : 2)
          throw new P(c, a);
        for (c = T[Ob(a.id, b)]; c; c = c.bb) {
          var d = c.name;
          if (c.parent.id === a.id && d === b)
            return c;
        }
        return a.La.lookup(a, b);
      }
      function Gb(a, b, c, d) {
        a = new Rb(a, b, c, d);
        b = Ob(a.parent.id, a.name);
        a.bb = T[b];
        return T[b] = a;
      }
      function R(a) {
        return 16384 === (a & 61440);
      }
      var Sb = { r: 0, "r+": 2, w: 577, "w+": 578, a: 1089, "a+": 1090 };
      function Tb(a) {
        var b = ["r", "w", "rw"][a & 3];
        a & 512 && (b += "w");
        return b;
      }
      function Qb(a, b) {
        if (Lb)
          return 0;
        if (!b.includes("r") || a.mode & 292) {
          if (b.includes("w") && !(a.mode & 146) || b.includes("x") && !(a.mode & 73))
            return 2;
        } else
          return 2;
        return 0;
      }
      function Ub(a, b) {
        try {
          return Ib(a, b), 20;
        } catch (c) {
        }
        return Qb(a, "wx");
      }
      function Vb(a, b, c) {
        try {
          var d = Ib(a, b);
        } catch (e) {
          return e.Pa;
        }
        if (a = Qb(a, "wx"))
          return a;
        if (c) {
          if (!R(d.mode))
            return 54;
          if (d === d.parent || "/" === Nb(d))
            return 10;
        } else if (R(d.mode))
          return 31;
        return 0;
      }
      function Wb(a) {
        var b = 4096;
        for (a = a || 0; a <= b; a++)
          if (!S[a])
            return a;
        throw new P(33);
      }
      function Xb(a, b) {
        Yb || (Yb = function() {
        }, Yb.prototype = {});
        var c = new Yb(), d;
        for (d in a)
          c[d] = a[d];
        a = c;
        b = Wb(b);
        a.fd = b;
        return S[b] = a;
      }
      var Fb = { open: function(a) {
        a.Ma = Jb[a.node.rdev].Ma;
        a.Ma.open && a.Ma.open(a);
      }, Xa: function() {
        throw new P(70);
      } };
      function zb(a, b) {
        Jb[a] = { Ma: b };
      }
      function Zb(a, b) {
        var c = "/" === b, d = !b;
        if (c && ha)
          throw new P(10);
        if (!c && !d) {
          var e = W(b, { Cb: false });
          b = e.path;
          e = e.node;
          if (e.ab)
            throw new P(10);
          if (!R(e.mode))
            throw new P(54);
        }
        b = { type: a, sb: {}, Fb: b, Ob: [] };
        a = a.Ua(b);
        a.Ua = b;
        b.root = a;
        c ? ha = a : e && (e.ab = b, e.Ua && e.Ua.Ob.push(b));
      }
      function $b(a, b, c) {
        var d = W(a, { parent: true }).node;
        a = pb(a);
        if (!a || "." === a || ".." === a)
          throw new P(28);
        var e = Ub(d, a);
        if (e)
          throw new P(e);
        if (!d.La.fb)
          throw new P(63);
        return d.La.fb(d, a, b, c);
      }
      function X(a, b) {
        return $b(a, (void 0 !== b ? b : 511) & 1023 | 16384, 0);
      }
      function ac(a, b, c) {
        "undefined" === typeof c && (c = b, b = 438);
        $b(a, b | 8192, c);
      }
      function bc(a, b) {
        if (!vb(a))
          throw new P(44);
        var c = W(b, { parent: true }).node;
        if (!c)
          throw new P(44);
        b = pb(b);
        var d = Ub(c, b);
        if (d)
          throw new P(d);
        if (!c.La.symlink)
          throw new P(63);
        c.La.symlink(c, b, a);
      }
      function ra(a) {
        var b = W(a, { parent: true }).node, c = pb(a), d = Ib(b, c), e = Vb(b, c, false);
        if (e)
          throw new P(e);
        if (!b.La.unlink)
          throw new P(63);
        if (d.ab)
          throw new P(10);
        try {
          U.willDeletePath && U.willDeletePath(a);
        } catch (g) {
          B("FS.trackingDelegate['willDeletePath']('" + a + "') threw an exception: " + g.message);
        }
        b.La.unlink(b, c);
        Pb(d);
        try {
          if (U.onDeletePath)
            U.onDeletePath(a);
        } catch (g) {
          B("FS.trackingDelegate['onDeletePath']('" + a + "') threw an exception: " + g.message);
        }
      }
      function Mb(a) {
        a = W(a).node;
        if (!a)
          throw new P(44);
        if (!a.La.readlink)
          throw new P(28);
        return vb(Nb(a.parent), a.La.readlink(a));
      }
      function cc(a, b) {
        a = W(a, { Ya: !b }).node;
        if (!a)
          throw new P(44);
        if (!a.La.Ta)
          throw new P(63);
        return a.La.Ta(a);
      }
      function dc(a) {
        return cc(a, true);
      }
      function ec(a, b) {
        a = "string" === typeof a ? W(a, { Ya: true }).node : a;
        if (!a.La.Sa)
          throw new P(63);
        a.La.Sa(a, { mode: b & 4095 | a.mode & -4096, timestamp: Date.now() });
      }
      function fc(a) {
        a = "string" === typeof a ? W(a, { Ya: true }).node : a;
        if (!a.La.Sa)
          throw new P(63);
        a.La.Sa(a, { timestamp: Date.now() });
      }
      function gc(a, b) {
        if (0 > b)
          throw new P(28);
        a = "string" === typeof a ? W(a, { Ya: true }).node : a;
        if (!a.La.Sa)
          throw new P(63);
        if (R(a.mode))
          throw new P(31);
        if (32768 !== (a.mode & 61440))
          throw new P(28);
        var c = Qb(a, "w");
        if (c)
          throw new P(c);
        a.La.Sa(a, { size: b, timestamp: Date.now() });
      }
      function hc(a, b, c, d) {
        if ("" === a)
          throw new P(44);
        if ("string" === typeof b) {
          var e = Sb[b];
          if ("undefined" === typeof e)
            throw Error("Unknown file open mode: " + b);
          b = e;
        }
        c = b & 64 ? ("undefined" === typeof c ? 438 : c) & 4095 | 32768 : 0;
        if ("object" === typeof a)
          var g = a;
        else {
          a = N(a);
          try {
            g = W(a, { Ya: !(b & 131072) }).node;
          } catch (l) {
          }
        }
        e = false;
        if (b & 64)
          if (g) {
            if (b & 128)
              throw new P(20);
          } else
            g = $b(a, c, 0), e = true;
        if (!g)
          throw new P(44);
        8192 === (g.mode & 61440) && (b &= -513);
        if (b & 65536 && !R(g.mode))
          throw new P(54);
        if (!e && (c = g ? 40960 === (g.mode & 61440) ? 32 : R(g.mode) && ("r" !== Tb(b) || b & 512) ? 31 : Qb(g, Tb(b)) : 44))
          throw new P(c);
        b & 512 && gc(g, 0);
        b &= -131713;
        d = Xb({ node: g, path: Nb(g), flags: b, seekable: true, position: 0, Ma: g.Ma, Tb: [], error: false }, d);
        d.Ma.open && d.Ma.open(d);
        !f.logReadFiles || b & 1 || (ic || (ic = {}), a in ic || (ic[a] = 1, B("FS.trackingDelegate error on read file: " + a)));
        try {
          U.onOpenFile && (g = 0, 1 !== (b & 2097155) && (g |= 1), 0 !== (b & 2097155) && (g |= 2), U.onOpenFile(a, g));
        } catch (l) {
          B("FS.trackingDelegate['onOpenFile']('" + a + "', flags) threw an exception: " + l.message);
        }
        return d;
      }
      function Kc(a) {
        if (null === a.fd)
          throw new P(8);
        a.qb && (a.qb = null);
        try {
          a.Ma.close && a.Ma.close(a);
        } catch (b) {
          throw b;
        } finally {
          S[a.fd] = null;
        }
        a.fd = null;
      }
      function Lc(a, b, c) {
        if (null === a.fd)
          throw new P(8);
        if (!a.seekable || !a.Ma.Xa)
          throw new P(70);
        if (0 != c && 1 != c && 2 != c)
          throw new P(28);
        a.position = a.Ma.Xa(a, b, c);
        a.Tb = [];
      }
      function Nc(a, b, c, d, e) {
        if (0 > d || 0 > e)
          throw new P(28);
        if (null === a.fd)
          throw new P(8);
        if (1 === (a.flags & 2097155))
          throw new P(8);
        if (R(a.node.mode))
          throw new P(31);
        if (!a.Ma.read)
          throw new P(28);
        var g = "undefined" !== typeof e;
        if (!g)
          e = a.position;
        else if (!a.seekable)
          throw new P(70);
        b = a.Ma.read(a, b, c, d, e);
        g || (a.position += b);
        return b;
      }
      function Oc(a, b, c, d, e, g) {
        if (0 > d || 0 > e)
          throw new P(28);
        if (null === a.fd)
          throw new P(8);
        if (0 === (a.flags & 2097155))
          throw new P(8);
        if (R(a.node.mode))
          throw new P(31);
        if (!a.Ma.write)
          throw new P(28);
        a.seekable && a.flags & 1024 && Lc(a, 0, 2);
        var l = "undefined" !== typeof e;
        if (!l)
          e = a.position;
        else if (!a.seekable)
          throw new P(70);
        b = a.Ma.write(a, b, c, d, e, g);
        l || (a.position += b);
        try {
          if (a.path && U.onWriteToFile)
            U.onWriteToFile(a.path);
        } catch (p) {
          B("FS.trackingDelegate['onWriteToFile']('" + a.path + "') threw an exception: " + p.message);
        }
        return b;
      }
      function qa(a) {
        var b = { encoding: "binary" };
        b = b || {};
        b.flags = b.flags || 0;
        b.encoding = b.encoding || "binary";
        if ("utf8" !== b.encoding && "binary" !== b.encoding)
          throw Error('Invalid encoding type "' + b.encoding + '"');
        var c, d = hc(a, b.flags);
        a = cc(a).size;
        var e = new Uint8Array(a);
        Nc(d, e, 0, a, 0);
        "utf8" === b.encoding ? c = Sa(e, 0) : "binary" === b.encoding && (c = e);
        Kc(d);
        return c;
      }
      function Pc() {
        P || (P = function(a, b) {
          this.node = b;
          this.Sb = function(c) {
            this.Pa = c;
          };
          this.Sb(a);
          this.message = "FS error";
        }, P.prototype = Error(), P.prototype.constructor = P, [44].forEach(function(a) {
          Hb[a] = new P(a);
          Hb[a].stack = "<generic error, no stack>";
        }));
      }
      var Qc;
      function Rc(a, b) {
        var c = 0;
        a && (c |= 365);
        b && (c |= 146);
        return c;
      }
      function fa(a, b) {
        var c = a ? N("//" + a) : "/";
        a = Rc(true, true);
        c = $b(c, (void 0 !== a ? a : 438) & 4095 | 32768, 0);
        if (b) {
          if ("string" === typeof b) {
            for (var d = Array(b.length), e = 0, g = b.length; e < g; ++e)
              d[e] = b.charCodeAt(e);
            b = d;
          }
          ec(c, a | 146);
          d = hc(c, 577);
          Oc(d, b, 0, b.length, 0, void 0);
          Kc(d);
          ec(c, a);
        }
      }
      function Sc(a, b, c) {
        a = N("/dev/" + a);
        var d = Rc(!!b, !!c);
        Tc || (Tc = 64);
        var e = Tc++ << 8 | 0;
        zb(e, { open: function(g) {
          g.seekable = false;
        }, close: function() {
          c && c.buffer && c.buffer.length && c(10);
        }, read: function(g, l, p, w) {
          for (var u = 0, D = 0; D < w; D++) {
            try {
              var J = b();
            } catch (ba) {
              throw new P(29);
            }
            if (void 0 === J && 0 === u)
              throw new P(6);
            if (null === J || void 0 === J)
              break;
            u++;
            l[p + D] = J;
          }
          u && (g.node.timestamp = Date.now());
          return u;
        }, write: function(g, l, p, w) {
          for (var u = 0; u < w; u++)
            try {
              c(l[p + u]);
            } catch (D) {
              throw new P(29);
            }
          w && (g.node.timestamp = Date.now());
          return u;
        } });
        ac(a, d, e);
      }
      var Tc, Y = {}, Yb, ic, Uc = {};
      function Vc(a, b, c) {
        try {
          var d = a(b);
        } catch (e) {
          if (e && e.node && N(b) !== N(Nb(e.node)))
            return -54;
          throw e;
        }
        I[c >> 2] = d.dev;
        I[c + 4 >> 2] = 0;
        I[c + 8 >> 2] = d.ino;
        I[c + 12 >> 2] = d.mode;
        I[c + 16 >> 2] = d.nlink;
        I[c + 20 >> 2] = d.uid;
        I[c + 24 >> 2] = d.gid;
        I[c + 28 >> 2] = d.rdev;
        I[c + 32 >> 2] = 0;
        K = [d.size >>> 0, (L = d.size, 1 <= +Math.abs(L) ? 0 < L ? (Math.min(+Math.floor(L / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((L - +(~~L >>> 0)) / 4294967296) >>> 0 : 0)];
        I[c + 40 >> 2] = K[0];
        I[c + 44 >> 2] = K[1];
        I[c + 48 >> 2] = 4096;
        I[c + 52 >> 2] = d.blocks;
        I[c + 56 >> 2] = d.atime.getTime() / 1e3 | 0;
        I[c + 60 >> 2] = 0;
        I[c + 64 >> 2] = d.mtime.getTime() / 1e3 | 0;
        I[c + 68 >> 2] = 0;
        I[c + 72 >> 2] = d.ctime.getTime() / 1e3 | 0;
        I[c + 76 >> 2] = 0;
        K = [d.ino >>> 0, (L = d.ino, 1 <= +Math.abs(L) ? 0 < L ? (Math.min(+Math.floor(L / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((L - +(~~L >>> 0)) / 4294967296) >>> 0 : 0)];
        I[c + 80 >> 2] = K[0];
        I[c + 84 >> 2] = K[1];
        return 0;
      }
      var Wc = void 0;
      function Xc() {
        Wc += 4;
        return I[Wc - 4 >> 2];
      }
      function Z(a) {
        a = S[a];
        if (!a)
          throw new P(8);
        return a;
      }
      var Yc;
      Yc = xa ? function() {
        var a = process.hrtime();
        return 1e3 * a[0] + a[1] / 1e6;
      } : function() {
        return performance.now();
      };
      var Zc = {};
      function $c() {
        if (!ad) {
          var a = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" === typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: ua || "./this.program" }, b;
          for (b in Zc)
            void 0 === Zc[b] ? delete a[b] : a[b] = Zc[b];
          var c = [];
          for (b in a)
            c.push(b + "=" + a[b]);
          ad = c;
        }
        return ad;
      }
      var ad;
      function Rb(a, b, c, d) {
        a || (a = this);
        this.parent = a;
        this.Ua = a.Ua;
        this.ab = null;
        this.id = Kb++;
        this.name = b;
        this.mode = c;
        this.La = {};
        this.Ma = {};
        this.rdev = d;
      }
      Object.defineProperties(Rb.prototype, { read: { get: function() {
        return 365 === (this.mode & 365);
      }, set: function(a) {
        a ? this.mode |= 365 : this.mode &= -366;
      } }, write: { get: function() {
        return 146 === (this.mode & 146);
      }, set: function(a) {
        a ? this.mode |= 146 : this.mode &= -147;
      } } });
      Pc();
      T = Array(4096);
      Zb(Q, "/");
      X("/tmp");
      X("/home");
      X("/home/web_user");
      (function() {
        X("/dev");
        zb(259, { read: function() {
          return 0;
        }, write: function(b, c, d, e) {
          return e;
        } });
        ac("/dev/null", 259);
        yb(1280, Bb);
        yb(1536, Cb);
        ac("/dev/tty", 1280);
        ac("/dev/tty1", 1536);
        var a = qb();
        Sc("random", a);
        Sc("urandom", a);
        X("/dev/shm");
        X("/dev/shm/tmp");
      })();
      (function() {
        X("/proc");
        var a = X("/proc/self");
        X("/proc/self/fd");
        Zb({ Ua: function() {
          var b = Gb(a, "fd", 16895, 73);
          b.La = { lookup: function(c, d) {
            var e = S[+d];
            if (!e)
              throw new P(8);
            c = { parent: null, Ua: { Fb: "fake" }, La: { readlink: function() {
              return e.path;
            } } };
            return c.parent = c;
          } };
          return b;
        } }, "/proc/self/fd");
      })();
      function ia(a, b) {
        var c = Array(aa(a) + 1);
        a = ea(a, c, 0, c.length);
        b && (c.length = a);
        return c;
      }
      var cd = {
        a: function(a, b, c, d) {
          G("Assertion failed: " + y(a) + ", at: " + [b ? y(b) : "unknown filename", c, d ? y(d) : "unknown function"]);
        },
        r: function(a, b) {
          mb || (mb = true, ib());
          a = new Date(1e3 * I[a >> 2]);
          I[b >> 2] = a.getSeconds();
          I[b + 4 >> 2] = a.getMinutes();
          I[b + 8 >> 2] = a.getHours();
          I[b + 12 >> 2] = a.getDate();
          I[b + 16 >> 2] = a.getMonth();
          I[b + 20 >> 2] = a.getFullYear() - 1900;
          I[b + 24 >> 2] = a.getDay();
          var c = new Date(a.getFullYear(), 0, 1);
          I[b + 28 >> 2] = (a.getTime() - c.getTime()) / 864e5 | 0;
          I[b + 36 >> 2] = -(60 * a.getTimezoneOffset());
          var d = new Date(
            a.getFullYear(),
            6,
            1
          ).getTimezoneOffset();
          c = c.getTimezoneOffset();
          a = (d != c && a.getTimezoneOffset() == Math.min(c, d)) | 0;
          I[b + 32 >> 2] = a;
          a = I[lb() + (a ? 4 : 0) >> 2];
          I[b + 40 >> 2] = a;
          return b;
        },
        D: function(a, b) {
          try {
            a = y(a);
            if (b & -8)
              var c = -28;
            else {
              var d;
              (d = W(a, { Ya: true }).node) ? (a = "", b & 4 && (a += "r"), b & 2 && (a += "w"), b & 1 && (a += "x"), c = a && Qb(d, a) ? -2 : 0) : c = -44;
            }
            return c;
          } catch (e) {
            return "undefined" !== typeof Y && e instanceof P || G(e), -e.Pa;
          }
        },
        I: function(a, b) {
          try {
            return a = y(a), ec(a, b), 0;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        x: function(a) {
          try {
            return a = y(a), fc(a), 0;
          } catch (b) {
            return "undefined" !== typeof Y && b instanceof P || G(b), -b.Pa;
          }
        },
        J: function(a, b) {
          try {
            var c = S[a];
            if (!c)
              throw new P(8);
            ec(c.node, b);
            return 0;
          } catch (d) {
            return "undefined" !== typeof Y && d instanceof P || G(d), -d.Pa;
          }
        },
        y: function(a) {
          try {
            var b = S[a];
            if (!b)
              throw new P(8);
            fc(b.node);
            return 0;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        b: function(a, b, c) {
          Wc = c;
          try {
            var d = Z(a);
            switch (b) {
              case 0:
                var e = Xc();
                return 0 > e ? -28 : hc(d.path, d.flags, 0, e).fd;
              case 1:
              case 2:
                return 0;
              case 3:
                return d.flags;
              case 4:
                return e = Xc(), d.flags |= e, 0;
              case 12:
                return e = Xc(), Ia[e + 0 >> 1] = 2, 0;
              case 13:
              case 14:
                return 0;
              case 16:
              case 8:
                return -28;
              case 9:
                return I[bd() >> 2] = 28, -1;
              default:
                return -28;
            }
          } catch (g) {
            return "undefined" !== typeof Y && g instanceof P || G(g), -g.Pa;
          }
        },
        G: function(a, b) {
          try {
            var c = Z(a);
            return Vc(cc, c.path, b);
          } catch (d) {
            return "undefined" !== typeof Y && d instanceof P || G(d), -d.Pa;
          }
        },
        E: function(a, b, c) {
          try {
            var d = S[a];
            if (!d)
              throw new P(8);
            if (0 === (d.flags & 2097155))
              throw new P(28);
            gc(d.node, c);
            return 0;
          } catch (e) {
            return "undefined" !== typeof Y && e instanceof P || G(e), -e.Pa;
          }
        },
        B: function(a, b) {
          try {
            if (0 === b)
              return -28;
            if (b < aa("/") + 1)
              return -68;
            ea("/", k, a, b);
            return a;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        F: function() {
          return 0;
        },
        d: function() {
          return 42;
        },
        H: function(a, b) {
          try {
            return a = y(a), Vc(dc, a, b);
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        h: function(a, b) {
          try {
            return a = y(a), a = N(a), "/" === a[a.length - 1] && (a = a.substr(0, a.length - 1)), X(a, b), 0;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        k: function(a, b, c, d, e, g) {
          try {
            a: {
              g <<= 12;
              var l = false;
              if (0 !== (d & 16) && 0 !== a % 65536)
                var p = -28;
              else {
                if (0 !== (d & 32)) {
                  var w = Db(b);
                  if (!w) {
                    p = -48;
                    break a;
                  }
                  l = true;
                } else {
                  var u = S[e];
                  if (!u) {
                    p = -8;
                    break a;
                  }
                  var D = g;
                  if (0 !== (c & 2) && 0 === (d & 2) && 2 !== (u.flags & 2097155))
                    throw new P(2);
                  if (1 === (u.flags & 2097155))
                    throw new P(2);
                  if (!u.Ma.ib)
                    throw new P(43);
                  var J = u.Ma.ib(u, a, b, D, c, d);
                  w = J.Qb;
                  l = J.mb;
                }
                Uc[w] = { Nb: w, Mb: b, mb: l, fd: e, Pb: c, flags: d, offset: g };
                p = w;
              }
            }
            return p;
          } catch (ba) {
            return "undefined" !== typeof Y && ba instanceof P || G(ba), -ba.Pa;
          }
        },
        j: function(a, b) {
          try {
            var c = Uc[a];
            if (0 !== b && c) {
              if (b === c.Mb) {
                var d = S[c.fd];
                if (d && c.Pb & 2) {
                  var e = c.flags, g = c.offset, l = k.slice(a, a + b);
                  d && d.Ma.jb && d.Ma.jb(d, l, g, b, e);
                }
                Uc[a] = null;
                c.mb && la(c.Nb);
              }
              var p = 0;
            } else
              p = -28;
            return p;
          } catch (w) {
            return "undefined" !== typeof Y && w instanceof P || G(w), -w.Pa;
          }
        },
        i: function(a, b, c) {
          Wc = c;
          try {
            var d = y(a), e = c ? Xc() : 0;
            return hc(d, b, e).fd;
          } catch (g) {
            return "undefined" !== typeof Y && g instanceof P || G(g), -g.Pa;
          }
        },
        u: function(a, b, c) {
          try {
            a = y(a);
            if (0 >= c)
              var d = -28;
            else {
              var e = Mb(a), g = Math.min(c, aa(e)), l = x[b + g];
              ea(e, k, b, c + 1);
              x[b + g] = l;
              d = g;
            }
            return d;
          } catch (p) {
            return "undefined" !== typeof Y && p instanceof P || G(p), -p.Pa;
          }
        },
        v: function(a) {
          try {
            a = y(a);
            var b = W(a, { parent: true }).node, c = pb(a), d = Ib(b, c), e = Vb(b, c, true);
            if (e)
              throw new P(e);
            if (!b.La.rmdir)
              throw new P(63);
            if (d.ab)
              throw new P(10);
            try {
              U.willDeletePath && U.willDeletePath(a);
            } catch (g) {
              B("FS.trackingDelegate['willDeletePath']('" + a + "') threw an exception: " + g.message);
            }
            b.La.rmdir(b, c);
            Pb(d);
            try {
              if (U.onDeletePath)
                U.onDeletePath(a);
            } catch (g) {
              B("FS.trackingDelegate['onDeletePath']('" + a + "') threw an exception: " + g.message);
            }
            return 0;
          } catch (g) {
            return "undefined" !== typeof Y && g instanceof P || G(g), -g.Pa;
          }
        },
        f: function(a, b) {
          try {
            return a = y(a), Vc(cc, a, b);
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), -c.Pa;
          }
        },
        w: function(a) {
          try {
            return a = y(a), ra(a), 0;
          } catch (b) {
            return "undefined" !== typeof Y && b instanceof P || G(b), -b.Pa;
          }
        },
        s: function() {
          return 2147483648;
        },
        m: function(a, b, c) {
          k.copyWithin(a, b, b + c);
        },
        c: function(a) {
          var b = k.length;
          a >>>= 0;
          if (2147483648 < a)
            return false;
          for (var c = 1; 4 >= c; c *= 2) {
            var d = b * (1 + 0.2 / c);
            d = Math.min(d, a + 100663296);
            d = Math.max(a, d);
            0 < d % 65536 && (d += 65536 - d % 65536);
            a: {
              try {
                La.grow(Math.min(2147483648, d) - Ua.byteLength + 65535 >>> 16);
                Va();
                var e = 1;
                break a;
              } catch (g) {
              }
              e = void 0;
            }
            if (e)
              return true;
          }
          return false;
        },
        q: function(a) {
          for (var b = Yc(); Yc() - b < a; )
            ;
        },
        o: function(a, b) {
          var c = 0;
          $c().forEach(function(d, e) {
            var g = b + c;
            e = I[a + 4 * e >> 2] = g;
            for (g = 0; g < d.length; ++g)
              x[e++ >> 0] = d.charCodeAt(g);
            x[e >> 0] = 0;
            c += d.length + 1;
          });
          return 0;
        },
        p: function(a, b) {
          var c = $c();
          I[a >> 2] = c.length;
          var d = 0;
          c.forEach(function(e) {
            d += e.length + 1;
          });
          I[b >> 2] = d;
          return 0;
        },
        e: function(a) {
          try {
            var b = Z(a);
            Kc(b);
            return 0;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), c.Pa;
          }
        },
        n: function(a, b) {
          try {
            var c = Z(a);
            x[b >> 0] = c.tty ? 2 : R(c.mode) ? 3 : 40960 === (c.mode & 61440) ? 7 : 4;
            return 0;
          } catch (d) {
            return "undefined" !== typeof Y && d instanceof P || G(d), d.Pa;
          }
        },
        C: function(a, b, c, d) {
          try {
            a: {
              for (var e = Z(a), g = a = 0; g < c; g++) {
                var l = I[b + (8 * g + 4) >> 2], p = Nc(e, x, I[b + 8 * g >> 2], l, void 0);
                if (0 > p) {
                  var w = -1;
                  break a;
                }
                a += p;
                if (p < l)
                  break;
              }
              w = a;
            }
            I[d >> 2] = w;
            return 0;
          } catch (u) {
            return "undefined" !== typeof Y && u instanceof P || G(u), u.Pa;
          }
        },
        l: function(a, b, c, d, e) {
          try {
            var g = Z(a);
            a = 4294967296 * c + (b >>> 0);
            if (-9007199254740992 >= a || 9007199254740992 <= a)
              return -61;
            Lc(g, a, d);
            K = [g.position >>> 0, (L = g.position, 1 <= +Math.abs(L) ? 0 < L ? (Math.min(+Math.floor(L / 4294967296), 4294967295) | 0) >>> 0 : ~~+Math.ceil((L - +(~~L >>> 0)) / 4294967296) >>> 0 : 0)];
            I[e >> 2] = K[0];
            I[e + 4 >> 2] = K[1];
            g.qb && 0 === a && 0 === d && (g.qb = null);
            return 0;
          } catch (l) {
            return "undefined" !== typeof Y && l instanceof P || G(l), l.Pa;
          }
        },
        z: function(a) {
          try {
            var b = Z(a);
            return b.Ma && b.Ma.fsync ? -b.Ma.fsync(b) : 0;
          } catch (c) {
            return "undefined" !== typeof Y && c instanceof P || G(c), c.Pa;
          }
        },
        t: function(a, b, c, d) {
          try {
            a: {
              for (var e = Z(a), g = a = 0; g < c; g++) {
                var l = Oc(e, x, I[b + 8 * g >> 2], I[b + (8 * g + 4) >> 2], void 0);
                if (0 > l) {
                  var p = -1;
                  break a;
                }
                a += l;
              }
              p = a;
            }
            I[d >> 2] = p;
            return 0;
          } catch (w) {
            return "undefined" !== typeof Y && w instanceof P || G(w), w.Pa;
          }
        },
        g: function(a) {
          var b = Date.now();
          I[a >> 2] = b / 1e3 | 0;
          I[a + 4 >> 2] = b % 1e3 * 1e3 | 0;
          return 0;
        },
        K: function(a) {
          var b = Date.now() / 1e3 | 0;
          a && (I[a >> 2] = b);
          return b;
        },
        A: function(a, b) {
          if (b) {
            var c = b + 8;
            b = 1e3 * I[c >> 2];
            b += I[c + 4 >> 2] / 1e3;
          } else
            b = Date.now();
          a = y(a);
          try {
            var d = W(a, { Ya: true }).node;
            d.La.Sa(d, { timestamp: Math.max(b, b) });
            var e = 0;
          } catch (g) {
            if (!(g instanceof P)) {
              b: {
                e = Error();
                if (!e.stack) {
                  try {
                    throw Error();
                  } catch (l) {
                    e = l;
                  }
                  if (!e.stack) {
                    e = "(no stack trace available)";
                    break b;
                  }
                }
                e = e.stack.toString();
              }
              f.extraStackTrace && (e += "\n" + f.extraStackTrace());
              e = hb(e);
              throw g + " : " + e;
            }
            e = g.Pa;
            I[bd() >> 2] = e;
            e = -1;
          }
          return e;
        }
      };
      (function() {
        function a(e) {
          f.asm = e.exports;
          La = f.asm.L;
          Va();
          F = f.asm.Ca;
          Xa.unshift(f.asm.M);
          $a--;
          f.monitorRunDependencies && f.monitorRunDependencies($a);
          0 == $a && (bb && (e = bb, bb = null, e()));
        }
        function b(e) {
          a(e.instance);
        }
        function c(e) {
          return fb().then(function(g) {
            return WebAssembly.instantiate(g, d);
          }).then(function(g) {
            return g;
          }).then(e, function(g) {
            B("failed to asynchronously prepare wasm: " + g);
            G(g);
          });
        }
        var d = { a: cd };
        $a++;
        f.monitorRunDependencies && f.monitorRunDependencies($a);
        if (f.instantiateWasm)
          try {
            return f.instantiateWasm(d, a);
          } catch (e) {
            return B("Module.instantiateWasm callback failed with error: " + e), false;
          }
        (function() {
          return Ha || "function" !== typeof WebAssembly.instantiateStreaming || cb() || M.startsWith("file://") || "function" !== typeof fetch ? c(b) : fetch(M, { credentials: "same-origin" }).then(function(e) {
            return WebAssembly.instantiateStreaming(e, d).then(b, function(g) {
              B("wasm streaming compile failed: " + g);
              B("falling back to ArrayBuffer instantiation");
              return c(b);
            });
          });
        })();
        return {};
      })();
      f.___wasm_call_ctors = function() {
        return (f.___wasm_call_ctors = f.asm.M).apply(null, arguments);
      };
      f._sqlite3_free = function() {
        return (f._sqlite3_free = f.asm.N).apply(null, arguments);
      };
      var bd = f.___errno_location = function() {
        return (bd = f.___errno_location = f.asm.O).apply(null, arguments);
      };
      f._sqlite3_step = function() {
        return (f._sqlite3_step = f.asm.P).apply(null, arguments);
      };
      f._sqlite3_finalize = function() {
        return (f._sqlite3_finalize = f.asm.Q).apply(null, arguments);
      };
      f._sqlite3_prepare_v2 = function() {
        return (f._sqlite3_prepare_v2 = f.asm.R).apply(null, arguments);
      };
      f._sqlite3_reset = function() {
        return (f._sqlite3_reset = f.asm.S).apply(null, arguments);
      };
      f._sqlite3_clear_bindings = function() {
        return (f._sqlite3_clear_bindings = f.asm.T).apply(null, arguments);
      };
      f._sqlite3_value_blob = function() {
        return (f._sqlite3_value_blob = f.asm.U).apply(null, arguments);
      };
      f._sqlite3_value_text = function() {
        return (f._sqlite3_value_text = f.asm.V).apply(null, arguments);
      };
      f._sqlite3_value_bytes = function() {
        return (f._sqlite3_value_bytes = f.asm.W).apply(null, arguments);
      };
      f._sqlite3_value_double = function() {
        return (f._sqlite3_value_double = f.asm.X).apply(null, arguments);
      };
      f._sqlite3_value_int = function() {
        return (f._sqlite3_value_int = f.asm.Y).apply(null, arguments);
      };
      f._sqlite3_value_type = function() {
        return (f._sqlite3_value_type = f.asm.Z).apply(null, arguments);
      };
      f._sqlite3_result_blob = function() {
        return (f._sqlite3_result_blob = f.asm._).apply(null, arguments);
      };
      f._sqlite3_result_double = function() {
        return (f._sqlite3_result_double = f.asm.$).apply(null, arguments);
      };
      f._sqlite3_result_error = function() {
        return (f._sqlite3_result_error = f.asm.aa).apply(null, arguments);
      };
      f._sqlite3_result_int = function() {
        return (f._sqlite3_result_int = f.asm.ba).apply(null, arguments);
      };
      f._sqlite3_result_int64 = function() {
        return (f._sqlite3_result_int64 = f.asm.ca).apply(null, arguments);
      };
      f._sqlite3_result_null = function() {
        return (f._sqlite3_result_null = f.asm.da).apply(null, arguments);
      };
      f._sqlite3_result_text = function() {
        return (f._sqlite3_result_text = f.asm.ea).apply(null, arguments);
      };
      f._sqlite3_column_count = function() {
        return (f._sqlite3_column_count = f.asm.fa).apply(null, arguments);
      };
      f._sqlite3_data_count = function() {
        return (f._sqlite3_data_count = f.asm.ga).apply(null, arguments);
      };
      f._sqlite3_column_blob = function() {
        return (f._sqlite3_column_blob = f.asm.ha).apply(null, arguments);
      };
      f._sqlite3_column_bytes = function() {
        return (f._sqlite3_column_bytes = f.asm.ia).apply(null, arguments);
      };
      f._sqlite3_column_double = function() {
        return (f._sqlite3_column_double = f.asm.ja).apply(null, arguments);
      };
      f._sqlite3_column_text = function() {
        return (f._sqlite3_column_text = f.asm.ka).apply(null, arguments);
      };
      f._sqlite3_column_type = function() {
        return (f._sqlite3_column_type = f.asm.la).apply(null, arguments);
      };
      f._sqlite3_column_name = function() {
        return (f._sqlite3_column_name = f.asm.ma).apply(null, arguments);
      };
      f._sqlite3_bind_blob = function() {
        return (f._sqlite3_bind_blob = f.asm.na).apply(null, arguments);
      };
      f._sqlite3_bind_double = function() {
        return (f._sqlite3_bind_double = f.asm.oa).apply(null, arguments);
      };
      f._sqlite3_bind_int = function() {
        return (f._sqlite3_bind_int = f.asm.pa).apply(null, arguments);
      };
      f._sqlite3_bind_text = function() {
        return (f._sqlite3_bind_text = f.asm.qa).apply(null, arguments);
      };
      f._sqlite3_bind_parameter_index = function() {
        return (f._sqlite3_bind_parameter_index = f.asm.ra).apply(null, arguments);
      };
      f._sqlite3_sql = function() {
        return (f._sqlite3_sql = f.asm.sa).apply(null, arguments);
      };
      f._sqlite3_normalized_sql = function() {
        return (f._sqlite3_normalized_sql = f.asm.ta).apply(null, arguments);
      };
      f._sqlite3_errmsg = function() {
        return (f._sqlite3_errmsg = f.asm.ua).apply(null, arguments);
      };
      f._sqlite3_exec = function() {
        return (f._sqlite3_exec = f.asm.va).apply(null, arguments);
      };
      f._sqlite3_changes = function() {
        return (f._sqlite3_changes = f.asm.wa).apply(null, arguments);
      };
      f._sqlite3_close_v2 = function() {
        return (f._sqlite3_close_v2 = f.asm.xa).apply(null, arguments);
      };
      f._sqlite3_create_function_v2 = function() {
        return (f._sqlite3_create_function_v2 = f.asm.ya).apply(null, arguments);
      };
      f._sqlite3_open = function() {
        return (f._sqlite3_open = f.asm.za).apply(null, arguments);
      };
      var da = f._malloc = function() {
        return (da = f._malloc = f.asm.Aa).apply(null, arguments);
      }, la = f._free = function() {
        return (la = f._free = f.asm.Ba).apply(null, arguments);
      };
      f._RegisterExtensionFunctions = function() {
        return (f._RegisterExtensionFunctions = f.asm.Da).apply(null, arguments);
      };
      var lb = f.__get_tzname = function() {
        return (lb = f.__get_tzname = f.asm.Ea).apply(null, arguments);
      }, kb = f.__get_daylight = function() {
        return (kb = f.__get_daylight = f.asm.Fa).apply(null, arguments);
      }, jb = f.__get_timezone = function() {
        return (jb = f.__get_timezone = f.asm.Ga).apply(null, arguments);
      }, ma = f.stackSave = function() {
        return (ma = f.stackSave = f.asm.Ha).apply(null, arguments);
      }, oa = f.stackRestore = function() {
        return (oa = f.stackRestore = f.asm.Ia).apply(null, arguments);
      }, v = f.stackAlloc = function() {
        return (v = f.stackAlloc = f.asm.Ja).apply(
          null,
          arguments
        );
      }, Eb = f._memalign = function() {
        return (Eb = f._memalign = f.asm.Ka).apply(null, arguments);
      };
      f.cwrap = function(a, b, c, d) {
        c = c || [];
        var e = c.every(function(g) {
          return "number" === g;
        });
        return "string" !== b && e && !d ? Na(a) : function() {
          return Oa(a, b, c, arguments);
        };
      };
      f.UTF8ToString = y;
      f.stackSave = ma;
      f.stackRestore = oa;
      f.stackAlloc = v;
      var dd;
      bb = function ed() {
        dd || fd();
        dd || (bb = ed);
      };
      function fd() {
        function a() {
          if (!dd && (dd = true, f.calledRun = true, !Ma)) {
            f.noFSInit || Qc || (Qc = true, Pc(), f.stdin = f.stdin, f.stdout = f.stdout, f.stderr = f.stderr, f.stdin ? Sc("stdin", f.stdin) : bc("/dev/tty", "/dev/stdin"), f.stdout ? Sc("stdout", null, f.stdout) : bc("/dev/tty", "/dev/stdout"), f.stderr ? Sc("stderr", null, f.stderr) : bc("/dev/tty1", "/dev/stderr"), hc("/dev/stdin", 0), hc("/dev/stdout", 1), hc("/dev/stderr", 1));
            Lb = false;
            gb(Xa);
            if (f.onRuntimeInitialized)
              f.onRuntimeInitialized();
            if (f.postRun)
              for ("function" == typeof f.postRun && (f.postRun = [f.postRun]); f.postRun.length; ) {
                var b = f.postRun.shift();
                Ya.unshift(b);
              }
            gb(Ya);
          }
        }
        if (!(0 < $a)) {
          if (f.preRun)
            for ("function" == typeof f.preRun && (f.preRun = [f.preRun]); f.preRun.length; )
              Za();
          gb(Wa);
          0 < $a || (f.setStatus ? (f.setStatus("Running..."), setTimeout(function() {
            setTimeout(function() {
              f.setStatus("");
            }, 1);
            a();
          }, 1)) : a());
        }
      }
      f.run = fd;
      if (f.preInit)
        for ("function" == typeof f.preInit && (f.preInit = [f.preInit]); 0 < f.preInit.length; )
          f.preInit.pop()();
      fd();
      return Module;
    });
    return initSqlJsPromise;
  };
  {
    module.exports = initSqlJs;
    module.exports.default = initSqlJs;
  }
})(sqlWasm);
var __importDefault = commonjsGlobal && commonjsGlobal.__importDefault || function(mod) {
  return mod && mod.__esModule ? mod : { "default": mod };
};
Object.defineProperty(SqliteSqljs$1, "__esModule", { value: true });
SqliteSqljs$1.SqliteSqljs = void 0;
const rosbag2_1 = dist$4;
const rostime_1 = dist$6;
const sql_js_1 = __importDefault(sqlWasm.exports);
class SqliteSqljs {
  static async Initialize(config) {
    if (SqliteSqljs.SqlInitialization) {
      return await SqliteSqljs.SqlInitialization;
    }
    SqliteSqljs.SqlInitialization = (0, sql_js_1.default)(config);
    return await SqliteSqljs.SqlInitialization;
  }
  constructor(data) {
    if (data instanceof File) {
      this.file = data;
    } else if (data instanceof Uint8Array) {
      this.data = data;
    }
  }
  async open() {
    const SQL = await SqliteSqljs.Initialize();
    let db;
    if (this.file) {
      db = new SQL.Database({ file: this.file });
    } else if (this.data) {
      db = new SQL.Database({ data: this.data });
    } else {
      db = new SQL.Database();
    }
    const idToTopic = /* @__PURE__ */ new Map();
    const topicNameToId = /* @__PURE__ */ new Map();
    const topicRows = db.exec("select * from topics")[0]?.values ?? [];
    for (const row of topicRows) {
      const [id, name, type2, serializationFormat, qosProfilesStr] = row;
      const offeredQosProfiles = (0, rosbag2_1.parseQosProfiles)(qosProfilesStr ?? "[]");
      const topic = { name, type: type2, serializationFormat, offeredQosProfiles };
      const bigintId = BigInt(id);
      idToTopic.set(bigintId, topic);
      topicNameToId.set(name, bigintId);
    }
    this.context = { db, idToTopic, topicNameToId };
  }
  async close() {
    if (this.context != void 0) {
      this.context.db.close();
      this.context = void 0;
    }
  }
  async readTopics() {
    if (this.context == void 0) {
      throw new Error(`Call open() before reading topics`);
    }
    return Array.from(this.context.idToTopic.values());
  }
  readMessages(opts = {}) {
    if (this.context == void 0) {
      throw new Error(`Call open() before reading messages`);
    }
    const db = this.context.db;
    const topicNameToId = this.context.topicNameToId;
    let args = [];
    let query = `select topic_id,cast(timestamp as TEXT) as timestamp,data from messages`;
    if (opts.startTime != void 0) {
      query += ` where timestamp >= cast(? as INTEGER)`;
      args.push((0, rostime_1.toNanoSec)(opts.startTime).toString());
    }
    if (opts.endTime != void 0) {
      if (args.length === 0) {
        query += ` where timestamp < cast(? as INTEGER)`;
      } else {
        query += ` and timestamp < cast(? as INTEGER)`;
      }
      args.push((0, rostime_1.toNanoSec)(opts.endTime).toString());
    }
    if (opts.topics != void 0) {
      const topicIds = [];
      for (const topicName of opts.topics) {
        const topicId = topicNameToId.get(topicName);
        if (topicId != void 0) {
          topicIds.push(Number(topicId));
        }
      }
      if (topicIds.length === 0) {
        if (args.length === 0) {
          query += ` where topic_id = NULL`;
        } else {
          query += ` and topic_id = NULL`;
        }
      } else if (topicIds.length === 1) {
        if (args.length === 0) {
          query += ` where topic_id = ?`;
        } else {
          query += ` and topic_id = ?`;
        }
        args.push(topicIds[0]);
      } else {
        if (args.length === 0) {
          query += ` where topic_id in (${topicIds.map(() => "?").join(",")})`;
        } else {
          query += ` and topic_id in (${topicIds.map(() => "?").join(",")})`;
        }
        args = args.concat(topicIds);
      }
    }
    const statement = db.prepare(query, args);
    const dbIterator = new SqlJsMessageRowIterator(statement);
    return new rosbag2_1.RawMessageIterator(dbIterator, this.context.idToTopic);
  }
  async timeRange() {
    if (this.context == void 0) {
      throw new Error(`Call open() before retrieving the time range`);
    }
    const db = this.context.db;
    const res = db.exec("select cast(min(timestamp) as TEXT), cast(max(timestamp) as TEXT) from messages")[0]?.values[0] ?? ["0", "0"];
    const [minNsec, maxNsec] = res;
    return [(0, rostime_1.fromNanoSec)(BigInt(minNsec ?? 0n)), (0, rostime_1.fromNanoSec)(BigInt(maxNsec ?? 0n))];
  }
  async messageCounts() {
    if (this.context == void 0) {
      throw new Error(`Call open() before retrieving message counts`);
    }
    const db = this.context.db;
    const rows = db.exec(`
    select topics.name,count(*)
    from messages
    inner join topics on messages.topic_id = topics.id
    group by topics.id`)[0]?.values ?? [];
    const counts = /* @__PURE__ */ new Map();
    for (const [topicName, count] of rows) {
      counts.set(topicName, count);
    }
    return counts;
  }
}
SqliteSqljs$1.SqliteSqljs = SqliteSqljs;
class SqlJsMessageRowIterator {
  constructor(statement) {
    this.statement = statement;
  }
  [Symbol.iterator]() {
    return this;
  }
  next() {
    if (!this.statement.step()) {
      return { value: void 0, done: true };
    }
    const [topic_id, timestamp2, data] = this.statement.get();
    return {
      value: { topic_id: BigInt(topic_id), timestamp: BigInt(timestamp2), data },
      done: false
    };
  }
  return() {
    this.statement.freemem();
    this.statement.free();
    return { value: void 0, done: true };
  }
}
(function(exports) {
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
  var __exportStar = commonjsGlobal && commonjsGlobal.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(dist$4, exports);
  __exportStar(SqliteSqljs$1, exports);
})(dist$5);
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
      271: function(module2, exports) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        (function(root, factory) {
          {
            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          }
        })(this, function() {
          var hasOwnProperty = Object.prototype.hasOwnProperty;
          var toString3 = Object.prototype.toString;
          var hasSticky = typeof new RegExp().sticky === "boolean";
          function isRegExp(o) {
            return o && toString3.call(o) === "[object RegExp]";
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
          function ruleOptions(type2, obj) {
            if (!isObject2(obj)) {
              obj = { match: obj };
            }
            if (obj.include) {
              throw new Error("Matching rules cannot also include states");
            }
            var options2 = {
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
              if (hasOwnProperty.call(obj, key)) {
                options2[key] = obj[key];
              }
            }
            if (typeof options2.type === "string" && type2 !== options2.type) {
              throw new Error("Type transform cannot be a string (type '" + options2.type + "' for token '" + type2 + "')");
            }
            var match = options2.match;
            options2.match = Array.isArray(match) ? match : match ? [match] : [];
            options2.match.sort(function(a, b) {
              return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
            });
            return options2;
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
              var options2 = rules[i];
              if (options2.include) {
                throw new Error("Inheritance is not allowed in stateless lexers");
              }
              if (options2.error || options2.fallback) {
                if (errorRule) {
                  if (!options2.fallback === !errorRule.fallback) {
                    throw new Error("Multiple " + (options2.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options2.defaultType + "')");
                  } else {
                    throw new Error("fallback and error are mutually exclusive (for token '" + options2.defaultType + "')");
                  }
                }
                errorRule = options2;
              }
              var match = options2.match.slice();
              if (fastAllowed) {
                while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                  var word = match.shift();
                  fast[word.charCodeAt(0)] = options2;
                }
              }
              if (options2.pop || options2.push || options2.next) {
                if (!hasStates) {
                  throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options2.defaultType + "')");
                }
                if (options2.fallback) {
                  throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options2.defaultType + "')");
                }
              }
              if (match.length === 0) {
                continue;
              }
              fastAllowed = false;
              groups.push(options2);
              for (var j = 0; j < match.length; j++) {
                var obj = match[j];
                if (!isRegExp(obj)) {
                  continue;
                }
                if (unicodeFlag === null) {
                  unicodeFlag = obj.unicode;
                } else if (unicodeFlag !== obj.unicode && options2.fallback === false) {
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
              if (!options2.lineBreaks && regexp.test("\n")) {
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
          function checkStateGroup(g, name, map2) {
            var state = g && (g.push || g.next);
            if (state && !map2[state]) {
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
            var map2 = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              map2[key] = compileRules(ruleMap[key], true);
            }
            for (var i = 0; i < keys.length; i++) {
              var name = keys[i];
              var state = map2[name];
              var groups = state.groups;
              for (var j = 0; j < groups.length; j++) {
                checkStateGroup(groups[j], name, map2);
              }
              var fastKeys = Object.getOwnPropertyNames(state.fast);
              for (var j = 0; j < fastKeys.length; j++) {
                checkStateGroup(state.fast[fastKeys[j]], name, map2);
              }
            }
            return new Lexer(map2, start);
          }
          function keywordTransform(map2) {
            var reverseMap = /* @__PURE__ */ Object.create(null);
            var byLength = /* @__PURE__ */ Object.create(null);
            var types2 = Object.getOwnPropertyNames(map2);
            for (var i = 0; i < types2.length; i++) {
              var tokenType = types2[i];
              var item = map2[tokenType];
              var keywordList = Array.isArray(item) ? item : [item];
              keywordList.forEach(function(keyword) {
                (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword);
                if (typeof keyword !== "string") {
                  throw new Error("keyword must be string (in keyword '" + tokenType + "')");
                }
                reverseMap[keyword] = tokenType;
              });
            }
            function str2(x) {
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
                source += "case " + str2(keyword) + ": return " + str2(tokenType2) + "\n";
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
          function extend3(objs) {
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
                return extend3(d);
              } },
              { "name": "main$ebnf$2", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$2", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "bigintType", "arrayType", "__", "field", "_", "main$ebnf$2", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$3", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$3", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "numericType", "arrayType", "__", "field", "_", "main$ebnf$3", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$4", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$4", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "stringType", "arrayType", "__", "field", "_", "main$ebnf$4", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$5", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$5", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "timeType", "arrayType", "__", "field", "_", "main$ebnf$5", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$6", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$6", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "customType", "arrayType", "__", "field", "_", "main$ebnf$6", "complex"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$7", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$7", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "boolType", "__", "constantField", "_", "boolConstantValue", "_", "main$ebnf$7"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$8", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$8", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "bigintType", "__", "constantField", "_", "bigintConstantValue", "_", "main$ebnf$8"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$9", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$9", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "numericType", "__", "constantField", "_", "numericConstantValue", "_", "main$ebnf$9"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$10", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$10", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "stringType", "__", "constantField", "_", "stringConstantValue", "_", "main$ebnf$10"], "postprocess": function(d) {
                return extend3(d);
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
          function Parser(rules, start, options2) {
            if (rules instanceof Grammar) {
              var grammar = rules;
              var options2 = start;
            } else {
              var grammar = Grammar.fromCompiled(rules, start);
            }
            this.grammar = grammar;
            this.options = {
              keepHistory: false,
              lexer: grammar.lexer || new StreamLexer()
            };
            for (var key in options2 || {}) {
              this.options[key] = options2[key];
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
        function parseBigIntLiteral(str2, min, max) {
          const value = BigInt(str2);
          if (value < min || value > max) {
            throw new Error(`Number ${str2} out of range [${min}, ${max}]`);
          }
          return value;
        }
        function parseNumberLiteral(str2, min, max) {
          const value = parseInt(str2);
          if (Number.isNaN(value)) {
            throw new Error(`Invalid numeric literal: ${str2}`);
          }
          if (value < min || value > max) {
            throw new Error(`Number ${str2} out of range [${min}, ${max}]`);
          }
          return value;
        }
        const LITERAL_REGEX = new RegExp(ARRAY_TERMINATED_LITERAL, "y");
        const COMMA_OR_END_REGEX = /\s*(,)\s*|\s*$/y;
        function parseArrayLiteral(type2, rawStr) {
          if (!rawStr.startsWith("[") || !rawStr.endsWith("]")) {
            throw new Error("Array must start with [ and end with ]");
          }
          const str2 = rawStr.substring(1, rawStr.length - 1);
          if (type2 === "string" || type2 === "wstring") {
            const results = [];
            let offset = 0;
            while (offset < str2.length) {
              if (str2[offset] === ",") {
                throw new Error("Expected array element before comma");
              }
              LITERAL_REGEX.lastIndex = offset;
              let match = LITERAL_REGEX.exec(str2);
              if (match) {
                results.push(parseStringLiteral(match[0]));
                offset = LITERAL_REGEX.lastIndex;
              }
              COMMA_OR_END_REGEX.lastIndex = offset;
              match = COMMA_OR_END_REGEX.exec(str2);
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
          return str2.split(",").map((part) => parsePrimitiveLiteral(type2, part.trim()));
        }
        function parseStringLiteral(maybeQuotedStr) {
          let quoteThatMustBeEscaped = "";
          let str2 = maybeQuotedStr;
          for (const quote of ["'", '"']) {
            if (maybeQuotedStr.startsWith(quote)) {
              if (!maybeQuotedStr.endsWith(quote)) {
                throw new Error(`Expected terminating ${quote} in string literal: ${maybeQuotedStr}`);
              }
              quoteThatMustBeEscaped = quote;
              str2 = maybeQuotedStr.substring(quote.length, maybeQuotedStr.length - quote.length);
              break;
            }
          }
          if (!new RegExp(String.raw`^(?:[^\\${quoteThatMustBeEscaped}]|${STRING_ESCAPES})*$`).test(str2) == void 0) {
            throw new Error(`Invalid string literal: ${str2}`);
          }
          return str2.replace(new RegExp(STRING_ESCAPES, "g"), (...args) => {
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
        function parsePrimitiveLiteral(type2, str2) {
          switch (type2) {
            case "bool":
              if (["true", "True", "1"].includes(str2)) {
                return true;
              } else if (["false", "False", "0"].includes(str2)) {
                return false;
              }
              break;
            case "float32":
            case "float64": {
              const value = parseFloat(str2);
              if (!Number.isNaN(value)) {
                return value;
              }
              break;
            }
            case "int8":
              return parseNumberLiteral(str2, ~127, 127);
            case "uint8":
              return parseNumberLiteral(str2, 0, 255);
            case "int16":
              return parseNumberLiteral(str2, ~32767, 32767);
            case "uint16":
              return parseNumberLiteral(str2, 0, 65535);
            case "int32":
              return parseNumberLiteral(str2, ~2147483647, 2147483647);
            case "uint32":
              return parseNumberLiteral(str2, 0, 4294967295);
            case "int64":
              return parseBigIntLiteral(str2, ~0x7fffffffffffffffn, 0x7fffffffffffffffn);
            case "uint64":
              return parseBigIntLiteral(str2, 0n, 0xffffffffffffffffn);
            case "string":
            case "wstring":
              return parseStringLiteral(str2);
          }
          throw new Error(`Invalid literal of type ${type2}: ${str2}`);
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
              const isArray = unboundedArray != void 0 || arrayLength != void 0 || arrayBound != void 0;
              definitions.push({
                name,
                type: type2,
                isComplex: constantValue != void 0 ? isComplex || void 0 : isComplex,
                isConstant: constantValue != void 0 || void 0,
                isArray: constantValue != void 0 ? isArray || void 0 : isArray,
                arrayLength: arrayLength != void 0 ? parseInt(arrayLength) : void 0,
                arrayUpperBound: arrayBound != void 0 ? parseInt(arrayBound) : void 0,
                upperBound: stringBound != void 0 ? parseInt(stringBound) : void 0,
                defaultValue: defaultValue != void 0 ? isArray ? parseArrayLiteral(type2, defaultValue.trim()) : parsePrimitiveLiteral(type2, defaultValue.trim()) : void 0,
                value: constantValue != void 0 ? parsePrimitiveLiteral(type2, constantValue.trim()) : void 0,
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
        var __importDefault2 = this && this.__importDefault || function(mod) {
          return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.normalizeType = exports.fixupTypes = exports.parse = void 0;
        const nearley_1 = __webpack_require__2(654);
        const buildRos2Type_1 = __webpack_require__2(515);
        const ros1_ne_1 = __importDefault2(__webpack_require__2(558));
        const ROS1_GRAMMAR = nearley_1.Grammar.fromCompiled(ros1_ne_1.default);
        function parse(messageDefinition, options2 = {}) {
          const allLines = messageDefinition.split("\n").map((line) => line.trim()).filter((line) => line);
          let definitionLines = [];
          const types2 = [];
          allLines.forEach((line) => {
            if (line.startsWith("#")) {
              return;
            }
            if (line.startsWith("==")) {
              types2.push(options2.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
              definitionLines = [];
            } else {
              definitionLines.push({ line });
            }
          });
          types2.push(options2.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
          if (options2.skipTypeFixup !== true) {
            fixupTypes(types2);
          }
          return types2;
        }
        exports.parse = parse;
        function fixupTypes(types2) {
          types2.forEach(({ definitions, name }) => {
            definitions.forEach((definition) => {
              if (definition.isComplex === true) {
                const typeNamespace = name?.split("/").slice(0, -1).join("/");
                const foundName = findTypeByName(types2, definition.type, typeNamespace).name;
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
        function findTypeByName(types2, name, typeNamespace) {
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
})(dist$1);
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
      271: function(module2, exports) {
        var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;
        (function(root, factory) {
          {
            !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_FACTORY__ = factory, __WEBPACK_AMD_DEFINE_RESULT__ = typeof __WEBPACK_AMD_DEFINE_FACTORY__ === "function" ? __WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__) : __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__ !== void 0 && (module2.exports = __WEBPACK_AMD_DEFINE_RESULT__));
          }
        })(this, function() {
          var hasOwnProperty = Object.prototype.hasOwnProperty;
          var toString3 = Object.prototype.toString;
          var hasSticky = typeof new RegExp().sticky === "boolean";
          function isRegExp(o) {
            return o && toString3.call(o) === "[object RegExp]";
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
          function ruleOptions(type2, obj) {
            if (!isObject2(obj)) {
              obj = { match: obj };
            }
            if (obj.include) {
              throw new Error("Matching rules cannot also include states");
            }
            var options2 = {
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
              if (hasOwnProperty.call(obj, key)) {
                options2[key] = obj[key];
              }
            }
            if (typeof options2.type === "string" && type2 !== options2.type) {
              throw new Error("Type transform cannot be a string (type '" + options2.type + "' for token '" + type2 + "')");
            }
            var match = options2.match;
            options2.match = Array.isArray(match) ? match : match ? [match] : [];
            options2.match.sort(function(a, b) {
              return isRegExp(a) && isRegExp(b) ? 0 : isRegExp(b) ? -1 : isRegExp(a) ? 1 : b.length - a.length;
            });
            return options2;
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
              var options2 = rules[i];
              if (options2.include) {
                throw new Error("Inheritance is not allowed in stateless lexers");
              }
              if (options2.error || options2.fallback) {
                if (errorRule) {
                  if (!options2.fallback === !errorRule.fallback) {
                    throw new Error("Multiple " + (options2.fallback ? "fallback" : "error") + " rules not allowed (for token '" + options2.defaultType + "')");
                  } else {
                    throw new Error("fallback and error are mutually exclusive (for token '" + options2.defaultType + "')");
                  }
                }
                errorRule = options2;
              }
              var match = options2.match.slice();
              if (fastAllowed) {
                while (match.length && typeof match[0] === "string" && match[0].length === 1) {
                  var word = match.shift();
                  fast[word.charCodeAt(0)] = options2;
                }
              }
              if (options2.pop || options2.push || options2.next) {
                if (!hasStates) {
                  throw new Error("State-switching options are not allowed in stateless lexers (for token '" + options2.defaultType + "')");
                }
                if (options2.fallback) {
                  throw new Error("State-switching options are not allowed on fallback tokens (for token '" + options2.defaultType + "')");
                }
              }
              if (match.length === 0) {
                continue;
              }
              fastAllowed = false;
              groups.push(options2);
              for (var j = 0; j < match.length; j++) {
                var obj = match[j];
                if (!isRegExp(obj)) {
                  continue;
                }
                if (unicodeFlag === null) {
                  unicodeFlag = obj.unicode;
                } else if (unicodeFlag !== obj.unicode && options2.fallback === false) {
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
              if (!options2.lineBreaks && regexp.test("\n")) {
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
          function checkStateGroup(g, name, map2) {
            var state = g && (g.push || g.next);
            if (state && !map2[state]) {
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
            var map2 = /* @__PURE__ */ Object.create(null);
            for (var i = 0; i < keys.length; i++) {
              var key = keys[i];
              map2[key] = compileRules(ruleMap[key], true);
            }
            for (var i = 0; i < keys.length; i++) {
              var name = keys[i];
              var state = map2[name];
              var groups = state.groups;
              for (var j = 0; j < groups.length; j++) {
                checkStateGroup(groups[j], name, map2);
              }
              var fastKeys = Object.getOwnPropertyNames(state.fast);
              for (var j = 0; j < fastKeys.length; j++) {
                checkStateGroup(state.fast[fastKeys[j]], name, map2);
              }
            }
            return new Lexer(map2, start);
          }
          function keywordTransform(map2) {
            var reverseMap = /* @__PURE__ */ Object.create(null);
            var byLength = /* @__PURE__ */ Object.create(null);
            var types2 = Object.getOwnPropertyNames(map2);
            for (var i = 0; i < types2.length; i++) {
              var tokenType = types2[i];
              var item = map2[tokenType];
              var keywordList = Array.isArray(item) ? item : [item];
              keywordList.forEach(function(keyword) {
                (byLength[keyword.length] = byLength[keyword.length] || []).push(keyword);
                if (typeof keyword !== "string") {
                  throw new Error("keyword must be string (in keyword '" + tokenType + "')");
                }
                reverseMap[keyword] = tokenType;
              });
            }
            function str2(x) {
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
                source += "case " + str2(keyword) + ": return " + str2(tokenType2) + "\n";
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
          function extend3(objs) {
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
                return extend3(d);
              } },
              { "name": "main$ebnf$2", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$2", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "bigintType", "arrayType", "__", "field", "_", "main$ebnf$2", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$3", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$3", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "numericType", "arrayType", "__", "field", "_", "main$ebnf$3", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$4", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$4", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "stringType", "arrayType", "__", "field", "_", "main$ebnf$4", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$5", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$5", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "timeType", "arrayType", "__", "field", "_", "main$ebnf$5", "simple"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$6", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$6", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "customType", "arrayType", "__", "field", "_", "main$ebnf$6", "complex"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$7", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$7", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "boolType", "__", "constantField", "_", "boolConstantValue", "_", "main$ebnf$7"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$8", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$8", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "bigintType", "__", "constantField", "_", "bigintConstantValue", "_", "main$ebnf$8"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$9", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$9", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "numericType", "__", "constantField", "_", "numericConstantValue", "_", "main$ebnf$9"], "postprocess": function(d) {
                return extend3(d);
              } },
              { "name": "main$ebnf$10", "symbols": ["comment"], "postprocess": id },
              { "name": "main$ebnf$10", "symbols": [], "postprocess": function(d) {
                return null;
              } },
              { "name": "main", "symbols": ["_", "stringType", "__", "constantField", "_", "stringConstantValue", "_", "main$ebnf$10"], "postprocess": function(d) {
                return extend3(d);
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
          function extend3(objs) {
            return objs.reduce((r, p) => ({ ...r, ...p }), {});
          }
          function noop() {
            return null;
          }
          function getIntOrConstantValue(d) {
            const int2 = parseInt(d);
            if (!isNaN(int2)) {
              return int2;
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
                const def = aggregateConstantUsage(extend3(d.flat(1)));
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
                  (def) => aggregateConstantUsage(extend3([...possibleAnnotations, def]))
                );
                return finalDefs;
              } },
              { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames", "arrayLength"] },
              { "name": "fieldDcl$subexpression$1", "symbols": ["allTypes", "multiFieldNames"] },
              { "name": "fieldDcl$subexpression$1", "symbols": ["sequenceType", "multiFieldNames"] },
              { "name": "fieldDcl", "symbols": ["fieldDcl$subexpression$1"], "postprocess": (d) => {
                const names = d[0].splice(1, 1)[0];
                const defs = names.map((nameObj) => extend3([...d[0], nameObj]));
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
                "postprocess": (d) => extend3([d[0], ...d[1].flatMap(([, param]) => param)])
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
                const def = extend3(d[0]);
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
              { "name": "stringAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "STR"], "postprocess": ([, str2]) => ({ valueText: str2, value: str2 }) },
              { "name": "booleanAssignment", "symbols": [lexer.has("EQ") ? { type: "EQ" } : EQ, "BOOLEAN"], "postprocess": ([, bool2]) => ({ valueText: bool2, value: bool2 === "TRUE" }) },
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
                  let type2 = numericTypeMap[typeString];
                  return { type: type2 ? type2 : typeString };
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
          function Parser(rules, start, options2) {
            if (rules instanceof Grammar) {
              var grammar = rules;
              var options2 = start;
            } else {
              var grammar = Grammar.fromCompiled(rules, start);
            }
            this.grammar = grammar;
            this.options = {
              keepHistory: false,
              lexer: grammar.lexer || new StreamLexer()
            };
            for (var key in options2 || {}) {
              this.options[key] = options2[key];
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
        function parseBigIntLiteral(str2, min, max) {
          const value = BigInt(str2);
          if (value < min || value > max) {
            throw new Error(`Number ${str2} out of range [${min}, ${max}]`);
          }
          return value;
        }
        function parseNumberLiteral(str2, min, max) {
          const value = parseInt(str2);
          if (Number.isNaN(value)) {
            throw new Error(`Invalid numeric literal: ${str2}`);
          }
          if (value < min || value > max) {
            throw new Error(`Number ${str2} out of range [${min}, ${max}]`);
          }
          return value;
        }
        const LITERAL_REGEX = new RegExp(ARRAY_TERMINATED_LITERAL, "y");
        const COMMA_OR_END_REGEX = /\s*(,)\s*|\s*$/y;
        function parseArrayLiteral(type2, rawStr) {
          if (!rawStr.startsWith("[") || !rawStr.endsWith("]")) {
            throw new Error("Array must start with [ and end with ]");
          }
          const str2 = rawStr.substring(1, rawStr.length - 1);
          if (type2 === "string" || type2 === "wstring") {
            const results = [];
            let offset = 0;
            while (offset < str2.length) {
              if (str2[offset] === ",") {
                throw new Error("Expected array element before comma");
              }
              LITERAL_REGEX.lastIndex = offset;
              let match = LITERAL_REGEX.exec(str2);
              if (match) {
                results.push(parseStringLiteral(match[0]));
                offset = LITERAL_REGEX.lastIndex;
              }
              COMMA_OR_END_REGEX.lastIndex = offset;
              match = COMMA_OR_END_REGEX.exec(str2);
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
          return str2.split(",").map((part) => parsePrimitiveLiteral(type2, part.trim()));
        }
        function parseStringLiteral(maybeQuotedStr) {
          let quoteThatMustBeEscaped = "";
          let str2 = maybeQuotedStr;
          for (const quote of ["'", '"']) {
            if (maybeQuotedStr.startsWith(quote)) {
              if (!maybeQuotedStr.endsWith(quote)) {
                throw new Error(`Expected terminating ${quote} in string literal: ${maybeQuotedStr}`);
              }
              quoteThatMustBeEscaped = quote;
              str2 = maybeQuotedStr.substring(quote.length, maybeQuotedStr.length - quote.length);
              break;
            }
          }
          if (!new RegExp(String.raw`^(?:[^\\${quoteThatMustBeEscaped}]|${STRING_ESCAPES})*$`).test(str2) == void 0) {
            throw new Error(`Invalid string literal: ${str2}`);
          }
          return str2.replace(new RegExp(STRING_ESCAPES, "g"), (...args) => {
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
        function parsePrimitiveLiteral(type2, str2) {
          switch (type2) {
            case "bool":
              if (["true", "True", "1"].includes(str2)) {
                return true;
              } else if (["false", "False", "0"].includes(str2)) {
                return false;
              }
              break;
            case "float32":
            case "float64": {
              const value = parseFloat(str2);
              if (!Number.isNaN(value)) {
                return value;
              }
              break;
            }
            case "int8":
              return parseNumberLiteral(str2, ~127, 127);
            case "uint8":
              return parseNumberLiteral(str2, 0, 255);
            case "int16":
              return parseNumberLiteral(str2, ~32767, 32767);
            case "uint16":
              return parseNumberLiteral(str2, 0, 65535);
            case "int32":
              return parseNumberLiteral(str2, ~2147483647, 2147483647);
            case "uint32":
              return parseNumberLiteral(str2, 0, 4294967295);
            case "int64":
              return parseBigIntLiteral(str2, ~0x7fffffffffffffffn, 0x7fffffffffffffffn);
            case "uint64":
              return parseBigIntLiteral(str2, 0n, 0xffffffffffffffffn);
            case "string":
            case "wstring":
              return parseStringLiteral(str2);
          }
          throw new Error(`Invalid literal of type ${type2}: ${str2}`);
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
              const isArray = unboundedArray != void 0 || arrayLength != void 0 || arrayBound != void 0;
              definitions.push({
                name,
                type: type2,
                isComplex: constantValue != void 0 ? isComplex || void 0 : isComplex,
                isConstant: constantValue != void 0 || void 0,
                isArray: constantValue != void 0 ? isArray || void 0 : isArray,
                arrayLength: arrayLength != void 0 ? parseInt(arrayLength) : void 0,
                arrayUpperBound: arrayBound != void 0 ? parseInt(arrayBound) : void 0,
                upperBound: stringBound != void 0 ? parseInt(stringBound) : void 0,
                defaultValue: defaultValue != void 0 ? isArray ? parseArrayLiteral(type2, defaultValue.trim()) : parsePrimitiveLiteral(type2, defaultValue.trim()) : void 0,
                value: constantValue != void 0 ? parsePrimitiveLiteral(type2, constantValue.trim()) : void 0,
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
        var __importDefault2 = this && this.__importDefault || function(mod) {
          return mod && mod.__esModule ? mod : { "default": mod };
        };
        Object.defineProperty(exports, "__esModule", { value: true });
        exports.normalizeType = exports.fixupTypes = exports.parse = exports.ROS2IDL_GRAMMAR = void 0;
        const nearley_1 = __webpack_require__2(654);
        const buildRos2Type_1 = __webpack_require__2(515);
        const ros1_ne_1 = __importDefault2(__webpack_require__2(558));
        const ros2idl_ne_1 = __importDefault2(__webpack_require__2(568));
        const ROS1_GRAMMAR = nearley_1.Grammar.fromCompiled(ros1_ne_1.default);
        exports.ROS2IDL_GRAMMAR = nearley_1.Grammar.fromCompiled(ros2idl_ne_1.default);
        function parse(messageDefinition, options2 = {}) {
          const allLines = messageDefinition.split("\n").map((line) => line.trim()).filter((line) => line);
          let definitionLines = [];
          const types2 = [];
          allLines.forEach((line) => {
            if (line.startsWith("#")) {
              return;
            }
            if (line.startsWith("==")) {
              types2.push(options2.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
              definitionLines = [];
            } else {
              definitionLines.push({ line });
            }
          });
          types2.push(options2.ros2 === true ? (0, buildRos2Type_1.buildRos2Type)(definitionLines) : buildType(definitionLines, ROS1_GRAMMAR));
          if (options2.skipTypeFixup !== true) {
            fixupTypes(types2);
          }
          return types2;
        }
        exports.parse = parse;
        function fixupTypes(types2) {
          types2.forEach(({ definitions }) => {
            definitions.forEach((definition) => {
              if (definition.isComplex === true) {
                const foundName = findTypeByName(types2, definition.type).name;
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
        function findTypeByName(types2, name) {
          const matches = types2.filter((type2) => {
            const typeName = type2.name ?? "";
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
        function normalizeType(type2) {
          if (type2 === "char") {
            return "uint8";
          } else if (type2 === "byte") {
            return "int8";
          }
          return type2;
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
})(dist);
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
var heap$1 = { exports: {} };
var heap = { exports: {} };
(function(module, exports) {
  (function() {
    var Heap, defaultCmp, floor, heapify, heappop, heappush, heappushpop, heapreplace, insort, min, nlargest, nsmallest, updateItem, _siftdown, _siftup;
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
    Heap = function() {
      Heap2.push = heappush;
      Heap2.pop = heappop;
      Heap2.replace = heapreplace;
      Heap2.pushpop = heappushpop;
      Heap2.heapify = heapify;
      Heap2.updateItem = updateItem;
      Heap2.nlargest = nlargest;
      Heap2.nsmallest = nsmallest;
      function Heap2(cmp) {
        this.cmp = cmp != null ? cmp : defaultCmp;
        this.nodes = [];
      }
      Heap2.prototype.push = function(x) {
        return heappush(this.nodes, x, this.cmp);
      };
      Heap2.prototype.pop = function() {
        return heappop(this.nodes, this.cmp);
      };
      Heap2.prototype.peek = function() {
        return this.nodes[0];
      };
      Heap2.prototype.contains = function(x) {
        return this.nodes.indexOf(x) !== -1;
      };
      Heap2.prototype.replace = function(x) {
        return heapreplace(this.nodes, x, this.cmp);
      };
      Heap2.prototype.pushpop = function(x) {
        return heappushpop(this.nodes, x, this.cmp);
      };
      Heap2.prototype.heapify = function() {
        return heapify(this.nodes, this.cmp);
      };
      Heap2.prototype.updateItem = function(x) {
        return updateItem(this.nodes, x, this.cmp);
      };
      Heap2.prototype.clear = function() {
        return this.nodes = [];
      };
      Heap2.prototype.empty = function() {
        return this.nodes.length === 0;
      };
      Heap2.prototype.size = function() {
        return this.nodes.length;
      };
      Heap2.prototype.clone = function() {
        var heap2;
        heap2 = new Heap2();
        heap2.nodes = this.nodes.slice(0);
        return heap2;
      };
      Heap2.prototype.toArray = function() {
        return this.nodes.slice(0);
      };
      Heap2.prototype.insert = Heap2.prototype.push;
      Heap2.prototype.top = Heap2.prototype.peek;
      Heap2.prototype.front = Heap2.prototype.peek;
      Heap2.prototype.has = Heap2.prototype.contains;
      Heap2.prototype.copy = Heap2.prototype.clone;
      return Heap2;
    }();
    (function(root, factory) {
      {
        return module.exports = factory();
      }
    })(this, function() {
      return Heap;
    });
  }).call(commonjsGlobal);
})(heap);
(function(module) {
  module.exports = heap.exports;
})(heap$1);
var BlobReader$1 = {};
Object.defineProperty(BlobReader$1, "__esModule", { value: true });
class BlobReader {
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
BlobReader$1.default = BlobReader;
const basicDatatypes = /* @__PURE__ */ new Map();
class RosDb3IterableSource {
  constructor(files) {
    __privateAdd(this, _files, void 0);
    __privateAdd(this, _bag, void 0);
    __privateAdd(this, _start, { sec: 0, nsec: 0 });
    __privateAdd(this, _end, { sec: 0, nsec: 0 });
    __privateAdd(this, _messageSizeEstimateByTopic, {});
    __privateSet(this, _files, files);
  }
  async initialize() {
    console.log("db3 initialize");
    const url = await import("./sql-wasm.js");
    const res = await fetch(
      url.default
    );
    const sqlWasm2 = await (await res.blob()).arrayBuffer();
    console.log("sqlWasm", sqlWasm2);
    await dist$5.SqliteSqljs.Initialize({ wasmBinary: sqlWasm2 });
    const dbs = __privateGet(this, _files).map((file) => {
      let trueFile2;
      if (file instanceof Blob) {
        trueFile2 = new File([file], "a.db3");
      } else {
        trueFile2 = file;
      }
      return new dist$5.SqliteSqljs(trueFile2);
    });
    const bag = new dist$5.Rosbag2(dbs);
    await bag.open();
    __privateSet(this, _bag, bag);
    const [start, end] = await __privateGet(this, _bag).timeRange();
    const topicDefs = await __privateGet(this, _bag).readTopics();
    const messageCounts = await __privateGet(this, _bag).messageCounts();
    let hasAnyMessages = false;
    for (const count of messageCounts.values()) {
      if (count > 0) {
        hasAnyMessages = true;
        break;
      }
    }
    if (!hasAnyMessages) {
      throw new Error("Bag contains no messages");
    }
    const problems = [];
    const topics = [];
    const topicStats = /* @__PURE__ */ new Map();
    const datatypes = new Map([...dist$5.ROS2_TO_DEFINITIONS, ...basicDatatypes]);
    const messageDefinitionsByTopic = {};
    const parsedMessageDefinitionsByTopic = {};
    for (const topicDef of topicDefs) {
      const numMessages = messageCounts.get(topicDef.name);
      topics.push({ name: topicDef.name, schemaName: topicDef.type });
      if (numMessages != void 0) {
        topicStats.set(topicDef.name, { numMessages });
      }
      const parsedMsgdef = datatypes.get(topicDef.type);
      if (parsedMsgdef == void 0) {
        problems.push({
          severity: "warn",
          message: `Topic "${topicDef.name}" has unsupported datatype "${topicDef.type}"`,
          tip: "ROS 2 .db3 files do not contain message definitions, so only well-known ROS types are supported. As a workaround, you can convert the db3 file to mcap using the mcap CLI."
        });
        continue;
      }
      const fullParsedMessageDefinitions = [parsedMsgdef];
      const messageDefinition = dist$1.exports.stringify(fullParsedMessageDefinitions);
      datatypes.set(topicDef.type, { name: topicDef.type, definitions: parsedMsgdef.definitions });
      messageDefinitionsByTopic[topicDef.name] = messageDefinition;
      parsedMessageDefinitionsByTopic[topicDef.name] = fullParsedMessageDefinitions;
    }
    __privateSet(this, _start, start);
    __privateSet(this, _end, end);
    return {
      topics: Array.from(topics.values()),
      topicStats,
      start,
      end,
      problems,
      profile: "ros2",
      datatypes,
      publishersByTopic: /* @__PURE__ */ new Map()
    };
  }
  async *messageIterator(opt) {
    if (__privateGet(this, _bag) == void 0) {
      throw new Error(`Rosbag2DataProvider is not initialized`);
    }
    const topics = opt.topics;
    if (topics.size === 0) {
      return;
    }
    const start = opt.start ?? __privateGet(this, _start);
    const end = opt.end ?? __privateGet(this, _end);
    const inclusiveEndTime = dist$6.add(end, { sec: 0, nsec: 1 });
    const msgIterator = __privateGet(this, _bag).readMessages({
      startTime: start,
      endTime: inclusiveEndTime,
      topics: Array.from(topics.keys())
    });
    for await (const msg of msgIterator) {
      let msgSizeEstimate = __privateGet(this, _messageSizeEstimateByTopic)[msg.topic.name];
      if (msgSizeEstimate == void 0) {
        msgSizeEstimate = estimateObjectSize(msg.value);
        __privateGet(this, _messageSizeEstimateByTopic)[msg.topic.name] = msgSizeEstimate;
      }
      yield {
        type: "message-event",
        msgEvent: {
          topic: msg.topic.name,
          receiveTime: msg.timestamp,
          message: msg.value,
          sizeInBytes: Math.max(msg.data.byteLength, msgSizeEstimate),
          schemaName: msg.topic.type
        }
      };
    }
  }
  async getBackfillMessages(_args) {
    return [];
  }
}
_files = new WeakMap();
_bag = new WeakMap();
_start = new WeakMap();
_end = new WeakMap();
_messageSizeEstimateByTopic = new WeakMap();
function initialize(args) {
  const files = args.file ? [args.file] : args.files;
  if (!files) {
    throw new Error("files required");
  }
  const source = new RosDb3IterableSource(files);
  const wrapped = new WorkerIterableSourceWorker(source);
  return proxy(wrapped);
}
const service = {
  initialize
};
expose(service);
