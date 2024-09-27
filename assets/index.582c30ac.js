var yg=Object.defineProperty;var Sg=(i,t,e)=>t in i?yg(i,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):i[t]=e;var ie=(i,t,e)=>(Sg(i,typeof t!="symbol"?t+"":t,e),e),Eg=(i,t,e)=>{if(!t.has(i))throw TypeError("Cannot "+e)};var Dn=(i,t,e)=>{if(t.has(i))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(i):t.set(i,e)};var cn=(i,t,e)=>(Eg(i,t,"access private method"),e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const s of r)if(s.type==="childList")for(const o of s.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(r){const s={};return r.integrity&&(s.integrity=r.integrity),r.referrerpolicy&&(s.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?s.credentials="include":r.crossorigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function n(r){if(r.ep)return;r.ep=!0;const s=e(r);fetch(r.href,s)}})();/**
* @vue/shared v3.5.8
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**//*! #__NO_SIDE_EFFECTS__ */function qh(i){const t=Object.create(null);for(const e of i.split(","))t[e]=1;return e=>e in t}const oe={},ds=[],Bn=()=>{},bg=()=>!1,_l=i=>i.charCodeAt(0)===111&&i.charCodeAt(1)===110&&(i.charCodeAt(2)>122||i.charCodeAt(2)<97),jh=i=>i.startsWith("onUpdate:"),Be=Object.assign,Kh=(i,t)=>{const e=i.indexOf(t);e>-1&&i.splice(e,1)},Tg=Object.prototype.hasOwnProperty,Qt=(i,t)=>Tg.call(i,t),zt=Array.isArray,ps=i=>gl(i)==="[object Map]",_p=i=>gl(i)==="[object Set]",kt=i=>typeof i=="function",Ce=i=>typeof i=="string",Ki=i=>typeof i=="symbol",ve=i=>i!==null&&typeof i=="object",gp=i=>(ve(i)||kt(i))&&kt(i.then)&&kt(i.catch),vp=Object.prototype.toString,gl=i=>vp.call(i),Ag=i=>gl(i).slice(8,-1),xp=i=>gl(i)==="[object Object]",$h=i=>Ce(i)&&i!=="NaN"&&i[0]!=="-"&&""+parseInt(i,10)===i,eo=qh(",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"),vl=i=>{const t=Object.create(null);return e=>t[e]||(t[e]=i(e))},wg=/-(\w)/g,Tr=vl(i=>i.replace(wg,(t,e)=>e?e.toUpperCase():"")),Cg=/\B([A-Z])/g,Ur=vl(i=>i.replace(Cg,"-$1").toLowerCase()),Mp=vl(i=>i.charAt(0).toUpperCase()+i.slice(1)),kl=vl(i=>i?`on${Mp(i)}`:""),Ar=(i,t)=>!Object.is(i,t),Hl=(i,...t)=>{for(let e=0;e<i.length;e++)i[e](...t)},yp=(i,t,e,n=!1)=>{Object.defineProperty(i,t,{configurable:!0,enumerable:!1,writable:n,value:e})},Rg=i=>{const t=parseFloat(i);return isNaN(t)?i:t};let cf;const Zh=()=>cf||(cf=typeof globalThis<"u"?globalThis:typeof self<"u"?self:typeof window<"u"?window:typeof global<"u"?global:{});function Jh(i){if(zt(i)){const t={};for(let e=0;e<i.length;e++){const n=i[e],r=Ce(n)?Ig(n):Jh(n);if(r)for(const s in r)t[s]=r[s]}return t}else if(Ce(i)||ve(i))return i}const Pg=/;(?![^(]*\))/g,Lg=/:([^]+)/,Dg=/\/\*[^]*?\*\//g;function Ig(i){const t={};return i.replace(Dg,"").split(Pg).forEach(e=>{if(e){const n=e.split(Lg);n.length>1&&(t[n[0].trim()]=n[1].trim())}}),t}function Qh(i){let t="";if(Ce(i))t=i;else if(zt(i))for(let e=0;e<i.length;e++){const n=Qh(i[e]);n&&(t+=n+" ")}else if(ve(i))for(const e in i)i[e]&&(t+=e+" ");return t.trim()}const Ug="itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly",Ng=qh(Ug);function Sp(i){return!!i||i===""}const Ep=i=>!!(i&&i.__v_isRef===!0),bp=i=>Ce(i)?i:i==null?"":zt(i)||ve(i)&&(i.toString===vp||!kt(i.toString))?Ep(i)?bp(i.value):JSON.stringify(i,Tp,2):String(i),Tp=(i,t)=>Ep(t)?Tp(i,t.value):ps(t)?{[`Map(${t.size})`]:[...t.entries()].reduce((e,[n,r],s)=>(e[Vl(n,s)+" =>"]=r,e),{})}:_p(t)?{[`Set(${t.size})`]:[...t.values()].map(e=>Vl(e))}:Ki(t)?Vl(t):ve(t)&&!zt(t)&&!xp(t)?String(t):t,Vl=(i,t="")=>{var e;return Ki(i)?`Symbol(${(e=i.description)!=null?e:t})`:i};/**
* @vue/reactivity v3.5.8
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let dn;class Og{constructor(t=!1){this.detached=t,this._active=!0,this.effects=[],this.cleanups=[],this._isPaused=!1,this.parent=dn,!t&&dn&&(this.index=(dn.scopes||(dn.scopes=[])).push(this)-1)}get active(){return this._active}pause(){if(this._active){this._isPaused=!0;let t,e;if(this.scopes)for(t=0,e=this.scopes.length;t<e;t++)this.scopes[t].pause();for(t=0,e=this.effects.length;t<e;t++)this.effects[t].pause()}}resume(){if(this._active&&this._isPaused){this._isPaused=!1;let t,e;if(this.scopes)for(t=0,e=this.scopes.length;t<e;t++)this.scopes[t].resume();for(t=0,e=this.effects.length;t<e;t++)this.effects[t].resume()}}run(t){if(this._active){const e=dn;try{return dn=this,t()}finally{dn=e}}}on(){dn=this}off(){dn=this.parent}stop(t){if(this._active){let e,n;for(e=0,n=this.effects.length;e<n;e++)this.effects[e].stop();for(e=0,n=this.cleanups.length;e<n;e++)this.cleanups[e]();if(this.scopes)for(e=0,n=this.scopes.length;e<n;e++)this.scopes[e].stop(!0);if(!this.detached&&this.parent&&!t){const r=this.parent.scopes.pop();r&&r!==this&&(this.parent.scopes[this.index]=r,r.index=this.index)}this.parent=void 0,this._active=!1}}}function Fg(){return dn}let se;const Gl=new WeakSet;class Ap{constructor(t){this.fn=t,this.deps=void 0,this.depsTail=void 0,this.flags=5,this.next=void 0,this.cleanup=void 0,this.scheduler=void 0,dn&&dn.active&&dn.effects.push(this)}pause(){this.flags|=64}resume(){this.flags&64&&(this.flags&=-65,Gl.has(this)&&(Gl.delete(this),this.trigger()))}notify(){this.flags&2&&!(this.flags&32)||this.flags&8||Cp(this)}run(){if(!(this.flags&1))return this.fn();this.flags|=2,hf(this),Rp(this);const t=se,e=zn;se=this,zn=!0;try{return this.fn()}finally{Pp(this),se=t,zn=e,this.flags&=-3}}stop(){if(this.flags&1){for(let t=this.deps;t;t=t.nextDep)nu(t);this.deps=this.depsTail=void 0,hf(this),this.onStop&&this.onStop(),this.flags&=-2}}trigger(){this.flags&64?Gl.add(this):this.scheduler?this.scheduler():this.runIfDirty()}runIfDirty(){Bc(this)&&this.run()}get dirty(){return Bc(this)}}let wp=0,no;function Cp(i){i.flags|=8,i.next=no,no=i}function tu(){wp++}function eu(){if(--wp>0)return;let i;for(;no;){let t=no;for(no=void 0;t;){const e=t.next;if(t.next=void 0,t.flags&=-9,t.flags&1)try{t.trigger()}catch(n){i||(i=n)}t=e}}if(i)throw i}function Rp(i){for(let t=i.deps;t;t=t.nextDep)t.version=-1,t.prevActiveLink=t.dep.activeLink,t.dep.activeLink=t}function Pp(i,t=!1){let e,n=i.depsTail,r=n;for(;r;){const s=r.prevDep;r.version===-1?(r===n&&(n=s),nu(r,t),Bg(r)):e=r,r.dep.activeLink=r.prevActiveLink,r.prevActiveLink=void 0,r=s}i.deps=e,i.depsTail=n}function Bc(i){for(let t=i.deps;t;t=t.nextDep)if(t.dep.version!==t.version||t.dep.computed&&(Lp(t.dep.computed)||t.dep.version!==t.version))return!0;return!!i._dirty}function Lp(i){if(i.flags&4&&!(i.flags&16)||(i.flags&=-17,i.globalVersion===go))return;i.globalVersion=go;const t=i.dep;if(i.flags|=2,t.version>0&&!i.isSSR&&i.deps&&!Bc(i)){i.flags&=-3;return}const e=se,n=zn;se=i,zn=!0;try{Rp(i);const r=i.fn(i._value);(t.version===0||Ar(r,i._value))&&(i._value=r,t.version++)}catch(r){throw t.version++,r}finally{se=e,zn=n,Pp(i,!0),i.flags&=-3}}function nu(i,t=!1){const{dep:e,prevSub:n,nextSub:r}=i;if(n&&(n.nextSub=r,i.prevSub=void 0),r&&(r.prevSub=n,i.nextSub=void 0),e.subs===i&&(e.subs=n),!e.subs)if(e.computed){e.computed.flags&=-5;for(let s=e.computed.deps;s;s=s.nextDep)nu(s,!0)}else e.map&&!t&&(e.map.delete(e.key),e.map.size||Ha.delete(e.target))}function Bg(i){const{prevDep:t,nextDep:e}=i;t&&(t.nextDep=e,i.prevDep=void 0),e&&(e.prevDep=t,i.nextDep=void 0)}let zn=!0;const Dp=[];function $i(){Dp.push(zn),zn=!1}function Zi(){const i=Dp.pop();zn=i===void 0?!0:i}function hf(i){const{cleanup:t}=i;if(i.cleanup=void 0,t){const e=se;se=void 0;try{t()}finally{se=e}}}let go=0;class zg{constructor(t,e){this.sub=t,this.dep=e,this.version=e.version,this.nextDep=this.prevDep=this.nextSub=this.prevSub=this.prevActiveLink=void 0}}class Ip{constructor(t){this.computed=t,this.version=0,this.activeLink=void 0,this.subs=void 0,this.target=void 0,this.map=void 0,this.key=void 0}track(t){if(!se||!zn||se===this.computed)return;let e=this.activeLink;if(e===void 0||e.sub!==se)e=this.activeLink=new zg(se,this),se.deps?(e.prevDep=se.depsTail,se.depsTail.nextDep=e,se.depsTail=e):se.deps=se.depsTail=e,se.flags&4&&Up(e);else if(e.version===-1&&(e.version=this.version,e.nextDep)){const n=e.nextDep;n.prevDep=e.prevDep,e.prevDep&&(e.prevDep.nextDep=n),e.prevDep=se.depsTail,e.nextDep=void 0,se.depsTail.nextDep=e,se.depsTail=e,se.deps===e&&(se.deps=n)}return e}trigger(t){this.version++,go++,this.notify(t)}notify(t){tu();try{for(let e=this.subs;e;e=e.prevSub)e.sub.notify()&&e.sub.dep.notify()}finally{eu()}}}function Up(i){const t=i.dep.computed;if(t&&!i.dep.subs){t.flags|=20;for(let n=t.deps;n;n=n.nextDep)Up(n)}const e=i.dep.subs;e!==i&&(i.prevSub=e,e&&(e.nextSub=i)),i.dep.subs=i}const Ha=new WeakMap,xr=Symbol(""),zc=Symbol(""),vo=Symbol("");function We(i,t,e){if(zn&&se){let n=Ha.get(i);n||Ha.set(i,n=new Map);let r=n.get(e);r||(n.set(e,r=new Ip),r.target=i,r.map=n,r.key=e),r.track()}}function xi(i,t,e,n,r,s){const o=Ha.get(i);if(!o){go++;return}const a=l=>{l&&l.trigger()};if(tu(),t==="clear")o.forEach(a);else{const l=zt(i),c=l&&$h(e);if(l&&e==="length"){const h=Number(n);o.forEach((u,f)=>{(f==="length"||f===vo||!Ki(f)&&f>=h)&&a(u)})}else switch(e!==void 0&&a(o.get(e)),c&&a(o.get(vo)),t){case"add":l?c&&a(o.get("length")):(a(o.get(xr)),ps(i)&&a(o.get(zc)));break;case"delete":l||(a(o.get(xr)),ps(i)&&a(o.get(zc)));break;case"set":ps(i)&&a(o.get(xr));break}}eu()}function kr(i){const t=ne(i);return t===i?t:(We(t,"iterate",vo),Qn(i)?t:t.map(mn))}function iu(i){return We(i=ne(i),"iterate",vo),i}const kg={__proto__:null,[Symbol.iterator](){return Wl(this,Symbol.iterator,mn)},concat(...i){return kr(this).concat(...i.map(t=>zt(t)?kr(t):t))},entries(){return Wl(this,"entries",i=>(i[1]=mn(i[1]),i))},every(i,t){return oi(this,"every",i,t,void 0,arguments)},filter(i,t){return oi(this,"filter",i,t,e=>e.map(mn),arguments)},find(i,t){return oi(this,"find",i,t,mn,arguments)},findIndex(i,t){return oi(this,"findIndex",i,t,void 0,arguments)},findLast(i,t){return oi(this,"findLast",i,t,mn,arguments)},findLastIndex(i,t){return oi(this,"findLastIndex",i,t,void 0,arguments)},forEach(i,t){return oi(this,"forEach",i,t,void 0,arguments)},includes(...i){return Xl(this,"includes",i)},indexOf(...i){return Xl(this,"indexOf",i)},join(i){return kr(this).join(i)},lastIndexOf(...i){return Xl(this,"lastIndexOf",i)},map(i,t){return oi(this,"map",i,t,void 0,arguments)},pop(){return Hs(this,"pop")},push(...i){return Hs(this,"push",i)},reduce(i,...t){return uf(this,"reduce",i,t)},reduceRight(i,...t){return uf(this,"reduceRight",i,t)},shift(){return Hs(this,"shift")},some(i,t){return oi(this,"some",i,t,void 0,arguments)},splice(...i){return Hs(this,"splice",i)},toReversed(){return kr(this).toReversed()},toSorted(i){return kr(this).toSorted(i)},toSpliced(...i){return kr(this).toSpliced(...i)},unshift(...i){return Hs(this,"unshift",i)},values(){return Wl(this,"values",mn)}};function Wl(i,t,e){const n=iu(i),r=n[t]();return n!==i&&!Qn(i)&&(r._next=r.next,r.next=()=>{const s=r._next();return s.value&&(s.value=e(s.value)),s}),r}const Hg=Array.prototype;function oi(i,t,e,n,r,s){const o=iu(i),a=o!==i&&!Qn(i),l=o[t];if(l!==Hg[t]){const u=l.apply(i,s);return a?mn(u):u}let c=e;o!==i&&(a?c=function(u,f){return e.call(this,mn(u),f,i)}:e.length>2&&(c=function(u,f){return e.call(this,u,f,i)}));const h=l.call(o,c,n);return a&&r?r(h):h}function uf(i,t,e,n){const r=iu(i);let s=e;return r!==i&&(Qn(i)?e.length>3&&(s=function(o,a,l){return e.call(this,o,a,l,i)}):s=function(o,a,l){return e.call(this,o,mn(a),l,i)}),r[t](s,...n)}function Xl(i,t,e){const n=ne(i);We(n,"iterate",vo);const r=n[t](...e);return(r===-1||r===!1)&&au(e[0])?(e[0]=ne(e[0]),n[t](...e)):r}function Hs(i,t,e=[]){$i(),tu();const n=ne(i)[t].apply(i,e);return eu(),Zi(),n}const Vg=qh("__proto__,__v_isRef,__isVue"),Np=new Set(Object.getOwnPropertyNames(Symbol).filter(i=>i!=="arguments"&&i!=="caller").map(i=>Symbol[i]).filter(Ki));function Gg(i){Ki(i)||(i=String(i));const t=ne(this);return We(t,"has",i),t.hasOwnProperty(i)}class Op{constructor(t=!1,e=!1){this._isReadonly=t,this._isShallow=e}get(t,e,n){const r=this._isReadonly,s=this._isShallow;if(e==="__v_isReactive")return!r;if(e==="__v_isReadonly")return r;if(e==="__v_isShallow")return s;if(e==="__v_raw")return n===(r?s?n0:kp:s?zp:Bp).get(t)||Object.getPrototypeOf(t)===Object.getPrototypeOf(n)?t:void 0;const o=zt(t);if(!r){let l;if(o&&(l=kg[e]))return l;if(e==="hasOwnProperty")return Gg}const a=Reflect.get(t,e,Ze(t)?t:n);return(Ki(e)?Np.has(e):Vg(e))||(r||We(t,"get",e),s)?a:Ze(a)?o&&$h(e)?a:a.value:ve(a)?r?Hp(a):Ml(a):a}}class Fp extends Op{constructor(t=!1){super(!1,t)}set(t,e,n,r){let s=t[e];if(!this._isShallow){const l=Ts(s);if(!Qn(n)&&!Ts(n)&&(s=ne(s),n=ne(n)),!zt(t)&&Ze(s)&&!Ze(n))return l?!1:(s.value=n,!0)}const o=zt(t)&&$h(e)?Number(e)<t.length:Qt(t,e),a=Reflect.set(t,e,n,Ze(t)?t:r);return t===ne(r)&&(o?Ar(n,s)&&xi(t,"set",e,n):xi(t,"add",e,n)),a}deleteProperty(t,e){const n=Qt(t,e);t[e];const r=Reflect.deleteProperty(t,e);return r&&n&&xi(t,"delete",e,void 0),r}has(t,e){const n=Reflect.has(t,e);return(!Ki(e)||!Np.has(e))&&We(t,"has",e),n}ownKeys(t){return We(t,"iterate",zt(t)?"length":xr),Reflect.ownKeys(t)}}class Wg extends Op{constructor(t=!1){super(!0,t)}set(t,e){return!0}deleteProperty(t,e){return!0}}const Xg=new Fp,Yg=new Wg,qg=new Fp(!0);const ru=i=>i,xl=i=>Reflect.getPrototypeOf(i);function Yo(i,t,e=!1,n=!1){i=i.__v_raw;const r=ne(i),s=ne(t);e||(Ar(t,s)&&We(r,"get",t),We(r,"get",s));const{has:o}=xl(r),a=n?ru:e?lu:mn;if(o.call(r,t))return a(i.get(t));if(o.call(r,s))return a(i.get(s));i!==r&&i.get(t)}function qo(i,t=!1){const e=this.__v_raw,n=ne(e),r=ne(i);return t||(Ar(i,r)&&We(n,"has",i),We(n,"has",r)),i===r?e.has(i):e.has(i)||e.has(r)}function jo(i,t=!1){return i=i.__v_raw,!t&&We(ne(i),"iterate",xr),Reflect.get(i,"size",i)}function ff(i,t=!1){!t&&!Qn(i)&&!Ts(i)&&(i=ne(i));const e=ne(this);return xl(e).has.call(e,i)||(e.add(i),xi(e,"add",i,i)),this}function df(i,t,e=!1){!e&&!Qn(t)&&!Ts(t)&&(t=ne(t));const n=ne(this),{has:r,get:s}=xl(n);let o=r.call(n,i);o||(i=ne(i),o=r.call(n,i));const a=s.call(n,i);return n.set(i,t),o?Ar(t,a)&&xi(n,"set",i,t):xi(n,"add",i,t),this}function pf(i){const t=ne(this),{has:e,get:n}=xl(t);let r=e.call(t,i);r||(i=ne(i),r=e.call(t,i)),n&&n.call(t,i);const s=t.delete(i);return r&&xi(t,"delete",i,void 0),s}function mf(){const i=ne(this),t=i.size!==0,e=i.clear();return t&&xi(i,"clear",void 0,void 0),e}function Ko(i,t){return function(n,r){const s=this,o=s.__v_raw,a=ne(o),l=t?ru:i?lu:mn;return!i&&We(a,"iterate",xr),o.forEach((c,h)=>n.call(r,l(c),l(h),s))}}function $o(i,t,e){return function(...n){const r=this.__v_raw,s=ne(r),o=ps(s),a=i==="entries"||i===Symbol.iterator&&o,l=i==="keys"&&o,c=r[i](...n),h=e?ru:t?lu:mn;return!t&&We(s,"iterate",l?zc:xr),{next(){const{value:u,done:f}=c.next();return f?{value:u,done:f}:{value:a?[h(u[0]),h(u[1])]:h(u),done:f}},[Symbol.iterator](){return this}}}}function Ti(i){return function(...t){return i==="delete"?!1:i==="clear"?void 0:this}}function jg(){const i={get(s){return Yo(this,s)},get size(){return jo(this)},has:qo,add:ff,set:df,delete:pf,clear:mf,forEach:Ko(!1,!1)},t={get(s){return Yo(this,s,!1,!0)},get size(){return jo(this)},has:qo,add(s){return ff.call(this,s,!0)},set(s,o){return df.call(this,s,o,!0)},delete:pf,clear:mf,forEach:Ko(!1,!0)},e={get(s){return Yo(this,s,!0)},get size(){return jo(this,!0)},has(s){return qo.call(this,s,!0)},add:Ti("add"),set:Ti("set"),delete:Ti("delete"),clear:Ti("clear"),forEach:Ko(!0,!1)},n={get(s){return Yo(this,s,!0,!0)},get size(){return jo(this,!0)},has(s){return qo.call(this,s,!0)},add:Ti("add"),set:Ti("set"),delete:Ti("delete"),clear:Ti("clear"),forEach:Ko(!0,!0)};return["keys","values","entries",Symbol.iterator].forEach(s=>{i[s]=$o(s,!1,!1),e[s]=$o(s,!0,!1),t[s]=$o(s,!1,!0),n[s]=$o(s,!0,!0)}),[i,e,t,n]}const[Kg,$g,Zg,Jg]=jg();function su(i,t){const e=t?i?Jg:Zg:i?$g:Kg;return(n,r,s)=>r==="__v_isReactive"?!i:r==="__v_isReadonly"?i:r==="__v_raw"?n:Reflect.get(Qt(e,r)&&r in n?e:n,r,s)}const Qg={get:su(!1,!1)},t0={get:su(!1,!0)},e0={get:su(!0,!1)};const Bp=new WeakMap,zp=new WeakMap,kp=new WeakMap,n0=new WeakMap;function i0(i){switch(i){case"Object":case"Array":return 1;case"Map":case"Set":case"WeakMap":case"WeakSet":return 2;default:return 0}}function r0(i){return i.__v_skip||!Object.isExtensible(i)?0:i0(Ag(i))}function Ml(i){return Ts(i)?i:ou(i,!1,Xg,Qg,Bp)}function s0(i){return ou(i,!1,qg,t0,zp)}function Hp(i){return ou(i,!0,Yg,e0,kp)}function ou(i,t,e,n,r){if(!ve(i)||i.__v_raw&&!(t&&i.__v_isReactive))return i;const s=r.get(i);if(s)return s;const o=r0(i);if(o===0)return i;const a=new Proxy(i,o===2?n:e);return r.set(i,a),a}function io(i){return Ts(i)?io(i.__v_raw):!!(i&&i.__v_isReactive)}function Ts(i){return!!(i&&i.__v_isReadonly)}function Qn(i){return!!(i&&i.__v_isShallow)}function au(i){return i?!!i.__v_raw:!1}function ne(i){const t=i&&i.__v_raw;return t?ne(t):i}function o0(i){return!Qt(i,"__v_skip")&&Object.isExtensible(i)&&yp(i,"__v_skip",!0),i}const mn=i=>ve(i)?Ml(i):i,lu=i=>ve(i)?Hp(i):i;function Ze(i){return i?i.__v_isRef===!0:!1}function Vp(i){return Ze(i)?i.value:i}const a0={get:(i,t,e)=>t==="__v_raw"?i:Vp(Reflect.get(i,t,e)),set:(i,t,e,n)=>{const r=i[t];return Ze(r)&&!Ze(e)?(r.value=e,!0):Reflect.set(i,t,e,n)}};function Gp(i){return io(i)?i:new Proxy(i,a0)}class l0{constructor(t,e,n){this.fn=t,this.setter=e,this._value=void 0,this.dep=new Ip(this),this.__v_isRef=!0,this.deps=void 0,this.depsTail=void 0,this.flags=16,this.globalVersion=go-1,this.effect=this,this.__v_isReadonly=!e,this.isSSR=n}notify(){if(this.flags|=16,!(this.flags&8)&&se!==this)return Cp(this),!0}get value(){const t=this.dep.track();return Lp(this),t&&(t.version=this.dep.version),this._value}set value(t){this.setter&&this.setter(t)}}function c0(i,t,e=!1){let n,r;return kt(i)?n=i:(n=i.get,r=i.set),new l0(n,r,e)}const Zo={},Va=new WeakMap;let ur;function h0(i,t=!1,e=ur){if(e){let n=Va.get(e);n||Va.set(e,n=[]),n.push(i)}}function u0(i,t,e=oe){const{immediate:n,deep:r,once:s,scheduler:o,augmentJob:a,call:l}=e,c=M=>r?M:Qn(M)||r===!1||r===0?Ni(M,1):Ni(M);let h,u,f,d,g=!1,_=!1;if(Ze(i)?(u=()=>i.value,g=Qn(i)):io(i)?(u=()=>c(i),g=!0):zt(i)?(_=!0,g=i.some(M=>io(M)||Qn(M)),u=()=>i.map(M=>{if(Ze(M))return M.value;if(io(M))return c(M);if(kt(M))return l?l(M,2):M()})):kt(i)?t?u=l?()=>l(i,2):i:u=()=>{if(f){$i();try{f()}finally{Zi()}}const M=ur;ur=h;try{return l?l(i,3,[d]):i(d)}finally{ur=M}}:u=Bn,t&&r){const M=u,L=r===!0?1/0:r;u=()=>Ni(M(),L)}const m=Fg(),p=()=>{h.stop(),m&&Kh(m.effects,h)};if(s&&t){const M=t;t=(...L)=>{M(...L),p()}}let y=_?new Array(i.length).fill(Zo):Zo;const v=M=>{if(!(!(h.flags&1)||!h.dirty&&!M))if(t){const L=h.run();if(r||g||(_?L.some((w,C)=>Ar(w,y[C])):Ar(L,y))){f&&f();const w=ur;ur=h;try{const C=[L,y===Zo?void 0:_&&y[0]===Zo?[]:y,d];l?l(t,3,C):t(...C),y=L}finally{ur=w}}}else h.run()};return a&&a(v),h=new Ap(u),h.scheduler=o?()=>o(v,!1):v,d=M=>h0(M,!1,h),f=h.onStop=()=>{const M=Va.get(h);if(M){if(l)l(M,4);else for(const L of M)L();Va.delete(h)}},t?n?v(!0):y=h.run():o?o(v.bind(null,!0),!0):h.run(),p.pause=h.pause.bind(h),p.resume=h.resume.bind(h),p.stop=p,p}function Ni(i,t=1/0,e){if(t<=0||!ve(i)||i.__v_skip||(e=e||new Set,e.has(i)))return i;if(e.add(i),t--,Ze(i))Ni(i.value,t,e);else if(zt(i))for(let n=0;n<i.length;n++)Ni(i[n],t,e);else if(_p(i)||ps(i))i.forEach(n=>{Ni(n,t,e)});else if(xp(i)){for(const n in i)Ni(i[n],t,e);for(const n of Object.getOwnPropertySymbols(i))Object.prototype.propertyIsEnumerable.call(i,n)&&Ni(i[n],t,e)}return i}/**
* @vue/runtime-core v3.5.8
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/function Fo(i,t,e,n){try{return n?i(...n):i()}catch(r){yl(r,t,e)}}function ni(i,t,e,n){if(kt(i)){const r=Fo(i,t,e,n);return r&&gp(r)&&r.catch(s=>{yl(s,t,e)}),r}if(zt(i)){const r=[];for(let s=0;s<i.length;s++)r.push(ni(i[s],t,e,n));return r}}function yl(i,t,e,n=!0){const r=t?t.vnode:null,{errorHandler:s,throwUnhandledErrorInProduction:o}=t&&t.appContext.config||oe;if(t){let a=t.parent;const l=t.proxy,c=`https://vuejs.org/error-reference/#runtime-${e}`;for(;a;){const h=a.ec;if(h){for(let u=0;u<h.length;u++)if(h[u](i,l,c)===!1)return}a=a.parent}if(s){$i(),Fo(s,null,10,[i,l,c]),Zi();return}}f0(i,e,r,n,o)}function f0(i,t,e,n=!0,r=!1){if(r)throw i;console.error(i)}let xo=!1,kc=!1;const je=[];let Gn=0;const ms=[];let Di=null,ss=0;const Wp=Promise.resolve();let cu=null;function d0(i){const t=cu||Wp;return i?t.then(this?i.bind(this):i):t}function p0(i){let t=xo?Gn+1:0,e=je.length;for(;t<e;){const n=t+e>>>1,r=je[n],s=Mo(r);s<i||s===i&&r.flags&2?t=n+1:e=n}return t}function hu(i){if(!(i.flags&1)){const t=Mo(i),e=je[je.length-1];!e||!(i.flags&2)&&t>=Mo(e)?je.push(i):je.splice(p0(t),0,i),i.flags|=1,Xp()}}function Xp(){!xo&&!kc&&(kc=!0,cu=Wp.then(qp))}function m0(i){zt(i)?ms.push(...i):Di&&i.id===-1?Di.splice(ss+1,0,i):i.flags&1||(ms.push(i),i.flags|=1),Xp()}function _f(i,t,e=xo?Gn+1:0){for(;e<je.length;e++){const n=je[e];if(n&&n.flags&2){if(i&&n.id!==i.uid)continue;je.splice(e,1),e--,n.flags&4&&(n.flags&=-2),n(),n.flags&4||(n.flags&=-2)}}}function Yp(i){if(ms.length){const t=[...new Set(ms)].sort((e,n)=>Mo(e)-Mo(n));if(ms.length=0,Di){Di.push(...t);return}for(Di=t,ss=0;ss<Di.length;ss++){const e=Di[ss];e.flags&4&&(e.flags&=-2),e.flags&8||e(),e.flags&=-2}Di=null,ss=0}}const Mo=i=>i.id==null?i.flags&2?-1:1/0:i.id;function qp(i){kc=!1,xo=!0;const t=Bn;try{for(Gn=0;Gn<je.length;Gn++){const e=je[Gn];e&&!(e.flags&8)&&(e.flags&4&&(e.flags&=-2),Fo(e,e.i,e.i?15:14),e.flags&4||(e.flags&=-2))}}finally{for(;Gn<je.length;Gn++){const e=je[Gn];e&&(e.flags&=-2)}Gn=0,je.length=0,Yp(),xo=!1,cu=null,(je.length||ms.length)&&qp()}}let Zn=null,jp=null;function Ga(i){const t=Zn;return Zn=i,jp=i&&i.type.__scopeId||null,t}function _0(i,t=Zn,e){if(!t||i._n)return i;const n=(...r)=>{n._d&&bf(-1);const s=Ga(t);let o;try{o=i(...r)}finally{Ga(s),n._d&&bf(1)}return o};return n._n=!0,n._c=!0,n._d=!0,n}function er(i,t,e,n){const r=i.dirs,s=t&&t.dirs;for(let o=0;o<r.length;o++){const a=r[o];s&&(a.oldValue=s[o].value);let l=a.dir[n];l&&($i(),ni(l,e,8,[i.el,a,i,t]),Zi())}}const g0=Symbol("_vte"),v0=i=>i.__isTeleport;function uu(i,t){i.shapeFlag&6&&i.component?(i.transition=t,uu(i.component.subTree,t)):i.shapeFlag&128?(i.ssContent.transition=t.clone(i.ssContent),i.ssFallback.transition=t.clone(i.ssFallback)):i.transition=t}/*! #__NO_SIDE_EFFECTS__ */function x0(i,t){return kt(i)?(()=>Be({name:i.name},t,{setup:i}))():i}function Kp(i){i.ids=[i.ids[0]+i.ids[2]+++"-",0,0]}function Hc(i,t,e,n,r=!1){if(zt(i)){i.forEach((g,_)=>Hc(g,t&&(zt(t)?t[_]:t),e,n,r));return}if(ro(n)&&!r)return;const s=n.shapeFlag&4?mu(n.component):n.el,o=r?null:s,{i:a,r:l}=i,c=t&&t.r,h=a.refs===oe?a.refs={}:a.refs,u=a.setupState,f=ne(u),d=u===oe?()=>!1:g=>Qt(f,g);if(c!=null&&c!==l&&(Ce(c)?(h[c]=null,d(c)&&(u[c]=null)):Ze(c)&&(c.value=null)),kt(l))Fo(l,a,12,[o,h]);else{const g=Ce(l),_=Ze(l);if(g||_){const m=()=>{if(i.f){const p=g?d(l)?u[l]:h[l]:l.value;r?zt(p)&&Kh(p,s):zt(p)?p.includes(s)||p.push(s):g?(h[l]=[s],d(l)&&(u[l]=h[l])):(l.value=[s],i.k&&(h[i.k]=l.value))}else g?(h[l]=o,d(l)&&(u[l]=o)):_&&(l.value=o,i.k&&(h[i.k]=o))};o?(m.id=-1,fn(m,e)):m()}}}const ro=i=>!!i.type.__asyncLoader,$p=i=>i.type.__isKeepAlive;function M0(i,t){Zp(i,"a",t)}function y0(i,t){Zp(i,"da",t)}function Zp(i,t,e=Ke){const n=i.__wdc||(i.__wdc=()=>{let r=e;for(;r;){if(r.isDeactivated)return;r=r.parent}return i()});if(Sl(t,n,e),e){let r=e.parent;for(;r&&r.parent;)$p(r.parent.vnode)&&S0(n,t,e,r),r=r.parent}}function S0(i,t,e,n){const r=Sl(t,i,n,!0);Qp(()=>{Kh(n[t],r)},e)}function Sl(i,t,e=Ke,n=!1){if(e){const r=e[i]||(e[i]=[]),s=t.__weh||(t.__weh=(...o)=>{$i();const a=Bo(e),l=ni(t,e,i,o);return a(),Zi(),l});return n?r.unshift(s):r.push(s),s}}const Ei=i=>(t,e=Ke)=>{(!Tl||i==="sp")&&Sl(i,(...n)=>t(...n),e)},E0=Ei("bm"),Jp=Ei("m"),b0=Ei("bu"),T0=Ei("u"),A0=Ei("bum"),Qp=Ei("um"),w0=Ei("sp"),C0=Ei("rtg"),R0=Ei("rtc");function P0(i,t=Ke){Sl("ec",i,t)}const L0=Symbol.for("v-ndc"),Vc=i=>i?Mm(i)?mu(i):Vc(i.parent):null,so=Be(Object.create(null),{$:i=>i,$el:i=>i.vnode.el,$data:i=>i.data,$props:i=>i.props,$attrs:i=>i.attrs,$slots:i=>i.slots,$refs:i=>i.refs,$parent:i=>Vc(i.parent),$root:i=>Vc(i.root),$host:i=>i.ce,$emit:i=>i.emit,$options:i=>fu(i),$forceUpdate:i=>i.f||(i.f=()=>{hu(i.update)}),$nextTick:i=>i.n||(i.n=d0.bind(i.proxy)),$watch:i=>tv.bind(i)}),Yl=(i,t)=>i!==oe&&!i.__isScriptSetup&&Qt(i,t),D0={get({_:i},t){if(t==="__v_skip")return!0;const{ctx:e,setupState:n,data:r,props:s,accessCache:o,type:a,appContext:l}=i;let c;if(t[0]!=="$"){const d=o[t];if(d!==void 0)switch(d){case 1:return n[t];case 2:return r[t];case 4:return e[t];case 3:return s[t]}else{if(Yl(n,t))return o[t]=1,n[t];if(r!==oe&&Qt(r,t))return o[t]=2,r[t];if((c=i.propsOptions[0])&&Qt(c,t))return o[t]=3,s[t];if(e!==oe&&Qt(e,t))return o[t]=4,e[t];Gc&&(o[t]=0)}}const h=so[t];let u,f;if(h)return t==="$attrs"&&We(i.attrs,"get",""),h(i);if((u=a.__cssModules)&&(u=u[t]))return u;if(e!==oe&&Qt(e,t))return o[t]=4,e[t];if(f=l.config.globalProperties,Qt(f,t))return f[t]},set({_:i},t,e){const{data:n,setupState:r,ctx:s}=i;return Yl(r,t)?(r[t]=e,!0):n!==oe&&Qt(n,t)?(n[t]=e,!0):Qt(i.props,t)||t[0]==="$"&&t.slice(1)in i?!1:(s[t]=e,!0)},has({_:{data:i,setupState:t,accessCache:e,ctx:n,appContext:r,propsOptions:s}},o){let a;return!!e[o]||i!==oe&&Qt(i,o)||Yl(t,o)||(a=s[0])&&Qt(a,o)||Qt(n,o)||Qt(so,o)||Qt(r.config.globalProperties,o)},defineProperty(i,t,e){return e.get!=null?i._.accessCache[t]=0:Qt(e,"value")&&this.set(i,t,e.value,null),Reflect.defineProperty(i,t,e)}};function gf(i){return zt(i)?i.reduce((t,e)=>(t[e]=null,t),{}):i}let Gc=!0;function I0(i){const t=fu(i),e=i.proxy,n=i.ctx;Gc=!1,t.beforeCreate&&vf(t.beforeCreate,i,"bc");const{data:r,computed:s,methods:o,watch:a,provide:l,inject:c,created:h,beforeMount:u,mounted:f,beforeUpdate:d,updated:g,activated:_,deactivated:m,beforeDestroy:p,beforeUnmount:y,destroyed:v,unmounted:M,render:L,renderTracked:w,renderTriggered:C,errorCaptured:D,serverPrefetch:S,expose:E,inheritAttrs:I,components:G,directives:H,filters:Z}=t;if(c&&U0(c,n,null),o)for(const $ in o){const Y=o[$];kt(Y)&&(n[$]=Y.bind(e))}if(r){const $=r.call(e,e);ve($)&&(i.data=Ml($))}if(Gc=!0,s)for(const $ in s){const Y=s[$],ft=kt(Y)?Y.bind(e,e):kt(Y.get)?Y.get.bind(e,e):Bn,vt=!kt(Y)&&kt(Y.set)?Y.set.bind(e):Bn,mt=Tv({get:ft,set:vt});Object.defineProperty(n,$,{enumerable:!0,configurable:!0,get:()=>mt.value,set:wt=>mt.value=wt})}if(a)for(const $ in a)tm(a[$],n,e,$);if(l){const $=kt(l)?l.call(e):l;Reflect.ownKeys($).forEach(Y=>{k0(Y,$[Y])})}h&&vf(h,i,"c");function X($,Y){zt(Y)?Y.forEach(ft=>$(ft.bind(e))):Y&&$(Y.bind(e))}if(X(E0,u),X(Jp,f),X(b0,d),X(T0,g),X(M0,_),X(y0,m),X(P0,D),X(R0,w),X(C0,C),X(A0,y),X(Qp,M),X(w0,S),zt(E))if(E.length){const $=i.exposed||(i.exposed={});E.forEach(Y=>{Object.defineProperty($,Y,{get:()=>e[Y],set:ft=>e[Y]=ft})})}else i.exposed||(i.exposed={});L&&i.render===Bn&&(i.render=L),I!=null&&(i.inheritAttrs=I),G&&(i.components=G),H&&(i.directives=H),S&&Kp(i)}function U0(i,t,e=Bn){zt(i)&&(i=Wc(i));for(const n in i){const r=i[n];let s;ve(r)?"default"in r?s=Ca(r.from||n,r.default,!0):s=Ca(r.from||n):s=Ca(r),Ze(s)?Object.defineProperty(t,n,{enumerable:!0,configurable:!0,get:()=>s.value,set:o=>s.value=o}):t[n]=s}}function vf(i,t,e){ni(zt(i)?i.map(n=>n.bind(t.proxy)):i.bind(t.proxy),t,e)}function tm(i,t,e,n){let r=n.includes(".")?pm(e,n):()=>e[n];if(Ce(i)){const s=t[i];kt(s)&&gs(r,s)}else if(kt(i))gs(r,i.bind(e));else if(ve(i))if(zt(i))i.forEach(s=>tm(s,t,e,n));else{const s=kt(i.handler)?i.handler.bind(e):t[i.handler];kt(s)&&gs(r,s,i)}}function fu(i){const t=i.type,{mixins:e,extends:n}=t,{mixins:r,optionsCache:s,config:{optionMergeStrategies:o}}=i.appContext,a=s.get(t);let l;return a?l=a:!r.length&&!e&&!n?l=t:(l={},r.length&&r.forEach(c=>Wa(l,c,o,!0)),Wa(l,t,o)),ve(t)&&s.set(t,l),l}function Wa(i,t,e,n=!1){const{mixins:r,extends:s}=t;s&&Wa(i,s,e,!0),r&&r.forEach(o=>Wa(i,o,e,!0));for(const o in t)if(!(n&&o==="expose")){const a=N0[o]||e&&e[o];i[o]=a?a(i[o],t[o]):t[o]}return i}const N0={data:xf,props:Mf,emits:Mf,methods:Zs,computed:Zs,beforeCreate:Xe,created:Xe,beforeMount:Xe,mounted:Xe,beforeUpdate:Xe,updated:Xe,beforeDestroy:Xe,beforeUnmount:Xe,destroyed:Xe,unmounted:Xe,activated:Xe,deactivated:Xe,errorCaptured:Xe,serverPrefetch:Xe,components:Zs,directives:Zs,watch:F0,provide:xf,inject:O0};function xf(i,t){return t?i?function(){return Be(kt(i)?i.call(this,this):i,kt(t)?t.call(this,this):t)}:t:i}function O0(i,t){return Zs(Wc(i),Wc(t))}function Wc(i){if(zt(i)){const t={};for(let e=0;e<i.length;e++)t[i[e]]=i[e];return t}return i}function Xe(i,t){return i?[...new Set([].concat(i,t))]:t}function Zs(i,t){return i?Be(Object.create(null),i,t):t}function Mf(i,t){return i?zt(i)&&zt(t)?[...new Set([...i,...t])]:Be(Object.create(null),gf(i),gf(t!=null?t:{})):t}function F0(i,t){if(!i)return t;if(!t)return i;const e=Be(Object.create(null),i);for(const n in t)e[n]=Xe(i[n],t[n]);return e}function em(){return{app:null,config:{isNativeTag:bg,performance:!1,globalProperties:{},optionMergeStrategies:{},errorHandler:void 0,warnHandler:void 0,compilerOptions:{}},mixins:[],components:{},directives:{},provides:Object.create(null),optionsCache:new WeakMap,propsCache:new WeakMap,emitsCache:new WeakMap}}let B0=0;function z0(i,t){return function(n,r=null){kt(n)||(n=Be({},n)),r!=null&&!ve(r)&&(r=null);const s=em(),o=new WeakSet,a=[];let l=!1;const c=s.app={_uid:B0++,_component:n,_props:r,_container:null,_context:s,_instance:null,version:Av,get config(){return s.config},set config(h){},use(h,...u){return o.has(h)||(h&&kt(h.install)?(o.add(h),h.install(c,...u)):kt(h)&&(o.add(h),h(c,...u))),c},mixin(h){return s.mixins.includes(h)||s.mixins.push(h),c},component(h,u){return u?(s.components[h]=u,c):s.components[h]},directive(h,u){return u?(s.directives[h]=u,c):s.directives[h]},mount(h,u,f){if(!l){const d=c._ceVNode||ki(n,r);return d.appContext=s,f===!0?f="svg":f===!1&&(f=void 0),u&&t?t(d,h):i(d,h,f),l=!0,c._container=h,h.__vue_app__=c,mu(d.component)}},onUnmount(h){a.push(h)},unmount(){l&&(ni(a,c._instance,16),i(null,c._container),delete c._container.__vue_app__)},provide(h,u){return s.provides[h]=u,c},runWithContext(h){const u=_s;_s=c;try{return h()}finally{_s=u}}};return c}}let _s=null;function k0(i,t){if(Ke){let e=Ke.provides;const n=Ke.parent&&Ke.parent.provides;n===e&&(e=Ke.provides=Object.create(n)),e[i]=t}}function Ca(i,t,e=!1){const n=Ke||Zn;if(n||_s){const r=_s?_s._context.provides:n?n.parent==null?n.vnode.appContext&&n.vnode.appContext.provides:n.parent.provides:void 0;if(r&&i in r)return r[i];if(arguments.length>1)return e&&kt(t)?t.call(n&&n.proxy):t}}const nm={},im=()=>Object.create(nm),rm=i=>Object.getPrototypeOf(i)===nm;function H0(i,t,e,n=!1){const r={},s=im();i.propsDefaults=Object.create(null),sm(i,t,r,s);for(const o in i.propsOptions[0])o in r||(r[o]=void 0);e?i.props=n?r:s0(r):i.type.props?i.props=r:i.props=s,i.attrs=s}function V0(i,t,e,n){const{props:r,attrs:s,vnode:{patchFlag:o}}=i,a=ne(r),[l]=i.propsOptions;let c=!1;if((n||o>0)&&!(o&16)){if(o&8){const h=i.vnode.dynamicProps;for(let u=0;u<h.length;u++){let f=h[u];if(El(i.emitsOptions,f))continue;const d=t[f];if(l)if(Qt(s,f))d!==s[f]&&(s[f]=d,c=!0);else{const g=Tr(f);r[g]=Xc(l,a,g,d,i,!1)}else d!==s[f]&&(s[f]=d,c=!0)}}}else{sm(i,t,r,s)&&(c=!0);let h;for(const u in a)(!t||!Qt(t,u)&&((h=Ur(u))===u||!Qt(t,h)))&&(l?e&&(e[u]!==void 0||e[h]!==void 0)&&(r[u]=Xc(l,a,u,void 0,i,!0)):delete r[u]);if(s!==a)for(const u in s)(!t||!Qt(t,u)&&!0)&&(delete s[u],c=!0)}c&&xi(i.attrs,"set","")}function sm(i,t,e,n){const[r,s]=i.propsOptions;let o=!1,a;if(t)for(let l in t){if(eo(l))continue;const c=t[l];let h;r&&Qt(r,h=Tr(l))?!s||!s.includes(h)?e[h]=c:(a||(a={}))[h]=c:El(i.emitsOptions,l)||(!(l in n)||c!==n[l])&&(n[l]=c,o=!0)}if(s){const l=ne(e),c=a||oe;for(let h=0;h<s.length;h++){const u=s[h];e[u]=Xc(r,l,u,c[u],i,!Qt(c,u))}}return o}function Xc(i,t,e,n,r,s){const o=i[e];if(o!=null){const a=Qt(o,"default");if(a&&n===void 0){const l=o.default;if(o.type!==Function&&!o.skipFactory&&kt(l)){const{propsDefaults:c}=r;if(e in c)n=c[e];else{const h=Bo(r);n=c[e]=l.call(null,t),h()}}else n=l;r.ce&&r.ce._setProp(e,n)}o[0]&&(s&&!a?n=!1:o[1]&&(n===""||n===Ur(e))&&(n=!0))}return n}const G0=new WeakMap;function om(i,t,e=!1){const n=e?G0:t.propsCache,r=n.get(i);if(r)return r;const s=i.props,o={},a=[];let l=!1;if(!kt(i)){const h=u=>{l=!0;const[f,d]=om(u,t,!0);Be(o,f),d&&a.push(...d)};!e&&t.mixins.length&&t.mixins.forEach(h),i.extends&&h(i.extends),i.mixins&&i.mixins.forEach(h)}if(!s&&!l)return ve(i)&&n.set(i,ds),ds;if(zt(s))for(let h=0;h<s.length;h++){const u=Tr(s[h]);yf(u)&&(o[u]=oe)}else if(s)for(const h in s){const u=Tr(h);if(yf(u)){const f=s[h],d=o[u]=zt(f)||kt(f)?{type:f}:Be({},f),g=d.type;let _=!1,m=!0;if(zt(g))for(let p=0;p<g.length;++p){const y=g[p],v=kt(y)&&y.name;if(v==="Boolean"){_=!0;break}else v==="String"&&(m=!1)}else _=kt(g)&&g.name==="Boolean";d[0]=_,d[1]=m,(_||Qt(d,"default"))&&a.push(u)}}const c=[o,a];return ve(i)&&n.set(i,c),c}function yf(i){return i[0]!=="$"&&!eo(i)}const am=i=>i[0]==="_"||i==="$stable",du=i=>zt(i)?i.map(Yn):[Yn(i)],W0=(i,t,e)=>{if(t._n)return t;const n=_0((...r)=>du(t(...r)),e);return n._c=!1,n},lm=(i,t,e)=>{const n=i._ctx;for(const r in i){if(am(r))continue;const s=i[r];if(kt(s))t[r]=W0(r,s,n);else if(s!=null){const o=du(s);t[r]=()=>o}}},cm=(i,t)=>{const e=du(t);i.slots.default=()=>e},hm=(i,t,e)=>{for(const n in t)(e||n!=="_")&&(i[n]=t[n])},X0=(i,t,e)=>{const n=i.slots=im();if(i.vnode.shapeFlag&32){const r=t._;r?(hm(n,t,e),e&&yp(n,"_",r,!0)):lm(t,n)}else t&&cm(i,t)},Y0=(i,t,e)=>{const{vnode:n,slots:r}=i;let s=!0,o=oe;if(n.shapeFlag&32){const a=t._;a?e&&a===1?s=!1:hm(r,t,e):(s=!t.$stable,lm(t,r)),o=t}else t&&(cm(i,t),o={default:1});if(s)for(const a in r)!am(a)&&o[a]==null&&delete r[a]};function q0(){typeof __VUE_PROD_HYDRATION_MISMATCH_DETAILS__!="boolean"&&(Zh().__VUE_PROD_HYDRATION_MISMATCH_DETAILS__=!1)}const fn=av;function j0(i){return K0(i)}function K0(i,t){q0();const e=Zh();e.__VUE__=!0;const{insert:n,remove:r,patchProp:s,createElement:o,createText:a,createComment:l,setText:c,setElementText:h,parentNode:u,nextSibling:f,setScopeId:d=Bn,insertStaticContent:g}=i,_=(A,R,F,N=null,K=null,V=null,tt=void 0,b=null,x=!!R.dynamicChildren)=>{if(A===R)return;A&&!Vs(A,R)&&(N=_t(A),wt(A,K,V,!0),A=null),R.patchFlag===-2&&(x=!1,R.dynamicChildren=null);const{type:U,ref:j,shapeFlag:z}=R;switch(U){case bl:m(A,R,F,N);break;case yo:p(A,R,F,N);break;case Ra:A==null&&y(R,F,N,tt);break;case mi:G(A,R,F,N,K,V,tt,b,x);break;default:z&1?L(A,R,F,N,K,V,tt,b,x):z&6?H(A,R,F,N,K,V,tt,b,x):(z&64||z&128)&&U.process(A,R,F,N,K,V,tt,b,x,Lt)}j!=null&&K&&Hc(j,A&&A.ref,V,R||A,!R)},m=(A,R,F,N)=>{if(A==null)n(R.el=a(R.children),F,N);else{const K=R.el=A.el;R.children!==A.children&&c(K,R.children)}},p=(A,R,F,N)=>{A==null?n(R.el=l(R.children||""),F,N):R.el=A.el},y=(A,R,F,N)=>{[A.el,A.anchor]=g(A.children,R,F,N,A.el,A.anchor)},v=({el:A,anchor:R},F,N)=>{let K;for(;A&&A!==R;)K=f(A),n(A,F,N),A=K;n(R,F,N)},M=({el:A,anchor:R})=>{let F;for(;A&&A!==R;)F=f(A),r(A),A=F;r(R)},L=(A,R,F,N,K,V,tt,b,x)=>{R.type==="svg"?tt="svg":R.type==="math"&&(tt="mathml"),A==null?w(R,F,N,K,V,tt,b,x):S(A,R,K,V,tt,b,x)},w=(A,R,F,N,K,V,tt,b)=>{let x,U;const{props:j,shapeFlag:z,transition:q,dirs:at}=A;if(x=A.el=o(A.type,V,j&&j.is,j),z&8?h(x,A.children):z&16&&D(A.children,x,null,N,K,ql(A,V),tt,b),at&&er(A,null,N,"created"),C(x,A,A.scopeId,tt,N),j){for(const ct in j)ct!=="value"&&!eo(ct)&&s(x,ct,null,j[ct],V,N);"value"in j&&s(x,"value",null,j.value,V),(U=j.onVnodeBeforeMount)&&Vn(U,N,A)}at&&er(A,null,N,"beforeMount");const it=$0(K,q);it&&q.beforeEnter(x),n(x,R,F),((U=j&&j.onVnodeMounted)||it||at)&&fn(()=>{U&&Vn(U,N,A),it&&q.enter(x),at&&er(A,null,N,"mounted")},K)},C=(A,R,F,N,K)=>{if(F&&d(A,F),N)for(let V=0;V<N.length;V++)d(A,N[V]);if(K){let V=K.subTree;if(R===V||_m(V.type)&&(V.ssContent===R||V.ssFallback===R)){const tt=K.vnode;C(A,tt,tt.scopeId,tt.slotScopeIds,K.parent)}}},D=(A,R,F,N,K,V,tt,b,x=0)=>{for(let U=x;U<A.length;U++){const j=A[U]=b?Ii(A[U]):Yn(A[U]);_(null,j,R,F,N,K,V,tt,b)}},S=(A,R,F,N,K,V,tt)=>{const b=R.el=A.el;let{patchFlag:x,dynamicChildren:U,dirs:j}=R;x|=A.patchFlag&16;const z=A.props||oe,q=R.props||oe;let at;if(F&&nr(F,!1),(at=q.onVnodeBeforeUpdate)&&Vn(at,F,R,A),j&&er(R,A,F,"beforeUpdate"),F&&nr(F,!0),(z.innerHTML&&q.innerHTML==null||z.textContent&&q.textContent==null)&&h(b,""),U?E(A.dynamicChildren,U,b,F,N,ql(R,K),V):tt||Y(A,R,b,null,F,N,ql(R,K),V,!1),x>0){if(x&16)I(b,z,q,F,K);else if(x&2&&z.class!==q.class&&s(b,"class",null,q.class,K),x&4&&s(b,"style",z.style,q.style,K),x&8){const it=R.dynamicProps;for(let ct=0;ct<it.length;ct++){const Mt=it[ct],ot=z[Mt],ut=q[Mt];(ut!==ot||Mt==="value")&&s(b,Mt,ot,ut,K,F)}}x&1&&A.children!==R.children&&h(b,R.children)}else!tt&&U==null&&I(b,z,q,F,K);((at=q.onVnodeUpdated)||j)&&fn(()=>{at&&Vn(at,F,R,A),j&&er(R,A,F,"updated")},N)},E=(A,R,F,N,K,V,tt)=>{for(let b=0;b<R.length;b++){const x=A[b],U=R[b],j=x.el&&(x.type===mi||!Vs(x,U)||x.shapeFlag&70)?u(x.el):F;_(x,U,j,null,N,K,V,tt,!0)}},I=(A,R,F,N,K)=>{if(R!==F){if(R!==oe)for(const V in R)!eo(V)&&!(V in F)&&s(A,V,R[V],null,K,N);for(const V in F){if(eo(V))continue;const tt=F[V],b=R[V];tt!==b&&V!=="value"&&s(A,V,b,tt,K,N)}"value"in F&&s(A,"value",R.value,F.value,K)}},G=(A,R,F,N,K,V,tt,b,x)=>{const U=R.el=A?A.el:a(""),j=R.anchor=A?A.anchor:a("");let{patchFlag:z,dynamicChildren:q,slotScopeIds:at}=R;at&&(b=b?b.concat(at):at),A==null?(n(U,F,N),n(j,F,N),D(R.children||[],F,j,K,V,tt,b,x)):z>0&&z&64&&q&&A.dynamicChildren?(E(A.dynamicChildren,q,F,K,V,tt,b),(R.key!=null||K&&R===K.subTree)&&um(A,R,!0)):Y(A,R,F,j,K,V,tt,b,x)},H=(A,R,F,N,K,V,tt,b,x)=>{R.slotScopeIds=b,A==null?R.shapeFlag&512?K.ctx.activate(R,F,N,tt,x):Z(R,F,N,K,V,tt,x):et(A,R,x)},Z=(A,R,F,N,K,V,tt)=>{const b=A.component=xv(A,N,K);if($p(A)&&(b.ctx.renderer=Lt),Mv(b,!1,tt),b.asyncDep){if(K&&K.registerDep(b,X,tt),!A.el){const x=b.subTree=ki(yo);p(null,x,R,F)}}else X(b,A,R,F,K,V,tt)},et=(A,R,F)=>{const N=R.component=A.component;if(sv(A,R,F))if(N.asyncDep&&!N.asyncResolved){$(N,R,F);return}else N.next=R,N.update();else R.el=A.el,N.vnode=R},X=(A,R,F,N,K,V,tt)=>{const b=()=>{if(A.isMounted){let{next:z,bu:q,u:at,parent:it,vnode:ct}=A;{const At=fm(A);if(At){z&&(z.el=ct.el,$(A,z,tt)),At.asyncDep.then(()=>{A.isUnmounted||b()});return}}let Mt=z,ot;nr(A,!1),z?(z.el=ct.el,$(A,z,tt)):z=ct,q&&Hl(q),(ot=z.props&&z.props.onVnodeBeforeUpdate)&&Vn(ot,it,z,ct),nr(A,!0);const ut=jl(A),Ot=A.subTree;A.subTree=ut,_(Ot,ut,u(Ot.el),_t(Ot),A,K,V),z.el=ut.el,Mt===null&&ov(A,ut.el),at&&fn(at,K),(ot=z.props&&z.props.onVnodeUpdated)&&fn(()=>Vn(ot,it,z,ct),K)}else{let z;const{el:q,props:at}=R,{bm:it,m:ct,parent:Mt,root:ot,type:ut}=A,Ot=ro(R);if(nr(A,!1),it&&Hl(it),!Ot&&(z=at&&at.onVnodeBeforeMount)&&Vn(z,Mt,R),nr(A,!0),q&&P){const At=()=>{A.subTree=jl(A),P(q,A.subTree,A,K,null)};Ot&&ut.__asyncHydrate?ut.__asyncHydrate(q,A,At):At()}else{ot.ce&&ot.ce._injectChildStyle(ut);const At=A.subTree=jl(A);_(null,At,F,N,A,K,V),R.el=At.el}if(ct&&fn(ct,K),!Ot&&(z=at&&at.onVnodeMounted)){const At=R;fn(()=>Vn(z,Mt,At),K)}(R.shapeFlag&256||Mt&&ro(Mt.vnode)&&Mt.vnode.shapeFlag&256)&&A.a&&fn(A.a,K),A.isMounted=!0,R=F=N=null}};A.scope.on();const x=A.effect=new Ap(b);A.scope.off();const U=A.update=x.run.bind(x),j=A.job=x.runIfDirty.bind(x);j.i=A,j.id=A.uid,x.scheduler=()=>hu(j),nr(A,!0),U()},$=(A,R,F)=>{R.component=A;const N=A.vnode.props;A.vnode=R,A.next=null,V0(A,R.props,N,F),Y0(A,R.children,F),$i(),_f(A),Zi()},Y=(A,R,F,N,K,V,tt,b,x=!1)=>{const U=A&&A.children,j=A?A.shapeFlag:0,z=R.children,{patchFlag:q,shapeFlag:at}=R;if(q>0){if(q&128){vt(U,z,F,N,K,V,tt,b,x);return}else if(q&256){ft(U,z,F,N,K,V,tt,b,x);return}}at&8?(j&16&&yt(U,K,V),z!==U&&h(F,z)):j&16?at&16?vt(U,z,F,N,K,V,tt,b,x):yt(U,K,V,!0):(j&8&&h(F,""),at&16&&D(z,F,N,K,V,tt,b,x))},ft=(A,R,F,N,K,V,tt,b,x)=>{A=A||ds,R=R||ds;const U=A.length,j=R.length,z=Math.min(U,j);let q;for(q=0;q<z;q++){const at=R[q]=x?Ii(R[q]):Yn(R[q]);_(A[q],at,F,null,K,V,tt,b,x)}U>j?yt(A,K,V,!0,!1,z):D(R,F,N,K,V,tt,b,x,z)},vt=(A,R,F,N,K,V,tt,b,x)=>{let U=0;const j=R.length;let z=A.length-1,q=j-1;for(;U<=z&&U<=q;){const at=A[U],it=R[U]=x?Ii(R[U]):Yn(R[U]);if(Vs(at,it))_(at,it,F,null,K,V,tt,b,x);else break;U++}for(;U<=z&&U<=q;){const at=A[z],it=R[q]=x?Ii(R[q]):Yn(R[q]);if(Vs(at,it))_(at,it,F,null,K,V,tt,b,x);else break;z--,q--}if(U>z){if(U<=q){const at=q+1,it=at<j?R[at].el:N;for(;U<=q;)_(null,R[U]=x?Ii(R[U]):Yn(R[U]),F,it,K,V,tt,b,x),U++}}else if(U>q)for(;U<=z;)wt(A[U],K,V,!0),U++;else{const at=U,it=U,ct=new Map;for(U=it;U<=q;U++){const Dt=R[U]=x?Ii(R[U]):Yn(R[U]);Dt.key!=null&&ct.set(Dt.key,U)}let Mt,ot=0;const ut=q-it+1;let Ot=!1,At=0;const St=new Array(ut);for(U=0;U<ut;U++)St[U]=0;for(U=at;U<=z;U++){const Dt=A[U];if(ot>=ut){wt(Dt,K,V,!0);continue}let qt;if(Dt.key!=null)qt=ct.get(Dt.key);else for(Mt=it;Mt<=q;Mt++)if(St[Mt-it]===0&&Vs(Dt,R[Mt])){qt=Mt;break}qt===void 0?wt(Dt,K,V,!0):(St[qt-it]=U+1,qt>=At?At=qt:Ot=!0,_(Dt,R[qt],F,null,K,V,tt,b,x),ot++)}const Ft=Ot?Z0(St):ds;for(Mt=Ft.length-1,U=ut-1;U>=0;U--){const Dt=it+U,qt=R[Dt],B=Dt+1<j?R[Dt+1].el:N;St[U]===0?_(null,qt,F,B,K,V,tt,b,x):Ot&&(Mt<0||U!==Ft[Mt]?mt(qt,F,B,2):Mt--)}}},mt=(A,R,F,N,K=null)=>{const{el:V,type:tt,transition:b,children:x,shapeFlag:U}=A;if(U&6){mt(A.component.subTree,R,F,N);return}if(U&128){A.suspense.move(R,F,N);return}if(U&64){tt.move(A,R,F,Lt);return}if(tt===mi){n(V,R,F);for(let z=0;z<x.length;z++)mt(x[z],R,F,N);n(A.anchor,R,F);return}if(tt===Ra){v(A,R,F);return}if(N!==2&&U&1&&b)if(N===0)b.beforeEnter(V),n(V,R,F),fn(()=>b.enter(V),K);else{const{leave:z,delayLeave:q,afterLeave:at}=b,it=()=>n(V,R,F),ct=()=>{z(V,()=>{it(),at&&at()})};q?q(V,it,ct):ct()}else n(V,R,F)},wt=(A,R,F,N=!1,K=!1)=>{const{type:V,props:tt,ref:b,children:x,dynamicChildren:U,shapeFlag:j,patchFlag:z,dirs:q,cacheIndex:at}=A;if(z===-2&&(K=!1),b!=null&&Hc(b,null,F,A,!0),at!=null&&(R.renderCache[at]=void 0),j&256){R.ctx.deactivate(A);return}const it=j&1&&q,ct=!ro(A);let Mt;if(ct&&(Mt=tt&&tt.onVnodeBeforeUnmount)&&Vn(Mt,R,A),j&6)lt(A.component,F,N);else{if(j&128){A.suspense.unmount(F,N);return}it&&er(A,null,R,"beforeUnmount"),j&64?A.type.remove(A,R,F,Lt,N):U&&!U.hasOnce&&(V!==mi||z>0&&z&64)?yt(U,R,F,!1,!0):(V===mi&&z&384||!K&&j&16)&&yt(x,R,F),N&&Wt(A)}(ct&&(Mt=tt&&tt.onVnodeUnmounted)||it)&&fn(()=>{Mt&&Vn(Mt,R,A),it&&er(A,null,R,"unmounted")},F)},Wt=A=>{const{type:R,el:F,anchor:N,transition:K}=A;if(R===mi){nt(F,N);return}if(R===Ra){M(A);return}const V=()=>{r(F),K&&!K.persisted&&K.afterLeave&&K.afterLeave()};if(A.shapeFlag&1&&K&&!K.persisted){const{leave:tt,delayLeave:b}=K,x=()=>tt(F,V);b?b(A.el,V,x):x()}else V()},nt=(A,R)=>{let F;for(;A!==R;)F=f(A),r(A),A=F;r(R)},lt=(A,R,F)=>{const{bum:N,scope:K,job:V,subTree:tt,um:b,m:x,a:U}=A;Sf(x),Sf(U),N&&Hl(N),K.stop(),V&&(V.flags|=8,wt(tt,A,R,F)),b&&fn(b,R),fn(()=>{A.isUnmounted=!0},R),R&&R.pendingBranch&&!R.isUnmounted&&A.asyncDep&&!A.asyncResolved&&A.suspenseId===R.pendingId&&(R.deps--,R.deps===0&&R.resolve())},yt=(A,R,F,N=!1,K=!1,V=0)=>{for(let tt=V;tt<A.length;tt++)wt(A[tt],R,F,N,K)},_t=A=>{if(A.shapeFlag&6)return _t(A.component.subTree);if(A.shapeFlag&128)return A.suspense.next();const R=f(A.anchor||A.el),F=R&&R[g0];return F?f(F):R};let Rt=!1;const It=(A,R,F)=>{A==null?R._vnode&&wt(R._vnode,null,null,!0):_(R._vnode||null,A,R,null,null,null,F),R._vnode=A,Rt||(Rt=!0,_f(),Yp(),Rt=!1)},Lt={p:_,um:wt,m:mt,r:Wt,mt:Z,mc:D,pc:Y,pbc:E,n:_t,o:i};let Xt,P;return t&&([Xt,P]=t(Lt)),{render:It,hydrate:Xt,createApp:z0(It,Xt)}}function ql({type:i,props:t},e){return e==="svg"&&i==="foreignObject"||e==="mathml"&&i==="annotation-xml"&&t&&t.encoding&&t.encoding.includes("html")?void 0:e}function nr({effect:i,job:t},e){e?(i.flags|=32,t.flags|=4):(i.flags&=-33,t.flags&=-5)}function $0(i,t){return(!i||i&&!i.pendingBranch)&&t&&!t.persisted}function um(i,t,e=!1){const n=i.children,r=t.children;if(zt(n)&&zt(r))for(let s=0;s<n.length;s++){const o=n[s];let a=r[s];a.shapeFlag&1&&!a.dynamicChildren&&((a.patchFlag<=0||a.patchFlag===32)&&(a=r[s]=Ii(r[s]),a.el=o.el),!e&&a.patchFlag!==-2&&um(o,a)),a.type===bl&&(a.el=o.el)}}function Z0(i){const t=i.slice(),e=[0];let n,r,s,o,a;const l=i.length;for(n=0;n<l;n++){const c=i[n];if(c!==0){if(r=e[e.length-1],i[r]<c){t[n]=r,e.push(n);continue}for(s=0,o=e.length-1;s<o;)a=s+o>>1,i[e[a]]<c?s=a+1:o=a;c<i[e[s]]&&(s>0&&(t[n]=e[s-1]),e[s]=n)}}for(s=e.length,o=e[s-1];s-- >0;)e[s]=o,o=t[o];return e}function fm(i){const t=i.subTree.component;if(t)return t.asyncDep&&!t.asyncResolved?t:fm(t)}function Sf(i){if(i)for(let t=0;t<i.length;t++)i[t].flags|=8}const J0=Symbol.for("v-scx"),Q0=()=>Ca(J0);function gs(i,t,e){return dm(i,t,e)}function dm(i,t,e=oe){const{immediate:n,deep:r,flush:s,once:o}=e,a=Be({},e);let l;if(Tl)if(s==="sync"){const f=Q0();l=f.__watcherHandles||(f.__watcherHandles=[])}else if(!t||n)a.once=!0;else{const f=()=>{};return f.stop=Bn,f.resume=Bn,f.pause=Bn,f}const c=Ke;a.call=(f,d,g)=>ni(f,c,d,g);let h=!1;s==="post"?a.scheduler=f=>{fn(f,c&&c.suspense)}:s!=="sync"&&(h=!0,a.scheduler=(f,d)=>{d?f():hu(f)}),a.augmentJob=f=>{t&&(f.flags|=4),h&&(f.flags|=2,c&&(f.id=c.uid,f.i=c))};const u=u0(i,t,a);return l&&l.push(u),u}function tv(i,t,e){const n=this.proxy,r=Ce(i)?i.includes(".")?pm(n,i):()=>n[i]:i.bind(n,n);let s;kt(t)?s=t:(s=t.handler,e=t);const o=Bo(this),a=dm(r,s.bind(n),e);return o(),a}function pm(i,t){const e=t.split(".");return()=>{let n=i;for(let r=0;r<e.length&&n;r++)n=n[e[r]];return n}}const ev=(i,t)=>t==="modelValue"||t==="model-value"?i.modelModifiers:i[`${t}Modifiers`]||i[`${Tr(t)}Modifiers`]||i[`${Ur(t)}Modifiers`];function nv(i,t,...e){if(i.isUnmounted)return;const n=i.vnode.props||oe;let r=e;const s=t.startsWith("update:"),o=s&&ev(n,t.slice(7));o&&(o.trim&&(r=e.map(h=>Ce(h)?h.trim():h)),o.number&&(r=e.map(Rg)));let a,l=n[a=kl(t)]||n[a=kl(Tr(t))];!l&&s&&(l=n[a=kl(Ur(t))]),l&&ni(l,i,6,r);const c=n[a+"Once"];if(c){if(!i.emitted)i.emitted={};else if(i.emitted[a])return;i.emitted[a]=!0,ni(c,i,6,r)}}function mm(i,t,e=!1){const n=t.emitsCache,r=n.get(i);if(r!==void 0)return r;const s=i.emits;let o={},a=!1;if(!kt(i)){const l=c=>{const h=mm(c,t,!0);h&&(a=!0,Be(o,h))};!e&&t.mixins.length&&t.mixins.forEach(l),i.extends&&l(i.extends),i.mixins&&i.mixins.forEach(l)}return!s&&!a?(ve(i)&&n.set(i,null),null):(zt(s)?s.forEach(l=>o[l]=null):Be(o,s),ve(i)&&n.set(i,o),o)}function El(i,t){return!i||!_l(t)?!1:(t=t.slice(2).replace(/Once$/,""),Qt(i,t[0].toLowerCase()+t.slice(1))||Qt(i,Ur(t))||Qt(i,t))}function jl(i){const{type:t,vnode:e,proxy:n,withProxy:r,propsOptions:[s],slots:o,attrs:a,emit:l,render:c,renderCache:h,props:u,data:f,setupState:d,ctx:g,inheritAttrs:_}=i,m=Ga(i);let p,y;try{if(e.shapeFlag&4){const M=r||n,L=M;p=Yn(c.call(L,M,h,u,d,f,g)),y=a}else{const M=t;p=Yn(M.length>1?M(u,{attrs:a,slots:o,emit:l}):M(u,null)),y=t.props?a:iv(a)}}catch(M){oo.length=0,yl(M,i,1),p=ki(yo)}let v=p;if(y&&_!==!1){const M=Object.keys(y),{shapeFlag:L}=v;M.length&&L&7&&(s&&M.some(jh)&&(y=rv(y,s)),v=As(v,y,!1,!0))}return e.dirs&&(v=As(v,null,!1,!0),v.dirs=v.dirs?v.dirs.concat(e.dirs):e.dirs),e.transition&&uu(v,e.transition),p=v,Ga(m),p}const iv=i=>{let t;for(const e in i)(e==="class"||e==="style"||_l(e))&&((t||(t={}))[e]=i[e]);return t},rv=(i,t)=>{const e={};for(const n in i)(!jh(n)||!(n.slice(9)in t))&&(e[n]=i[n]);return e};function sv(i,t,e){const{props:n,children:r,component:s}=i,{props:o,children:a,patchFlag:l}=t,c=s.emitsOptions;if(t.dirs||t.transition)return!0;if(e&&l>=0){if(l&1024)return!0;if(l&16)return n?Ef(n,o,c):!!o;if(l&8){const h=t.dynamicProps;for(let u=0;u<h.length;u++){const f=h[u];if(o[f]!==n[f]&&!El(c,f))return!0}}}else return(r||a)&&(!a||!a.$stable)?!0:n===o?!1:n?o?Ef(n,o,c):!0:!!o;return!1}function Ef(i,t,e){const n=Object.keys(t);if(n.length!==Object.keys(i).length)return!0;for(let r=0;r<n.length;r++){const s=n[r];if(t[s]!==i[s]&&!El(e,s))return!0}return!1}function ov({vnode:i,parent:t},e){for(;t;){const n=t.subTree;if(n.suspense&&n.suspense.activeBranch===i&&(n.el=i.el),n===i)(i=t.vnode).el=e,t=t.parent;else break}}const _m=i=>i.__isSuspense;function av(i,t){t&&t.pendingBranch?zt(i)?t.effects.push(...i):t.effects.push(i):m0(i)}const mi=Symbol.for("v-fgt"),bl=Symbol.for("v-txt"),yo=Symbol.for("v-cmt"),Ra=Symbol.for("v-stc"),oo=[];let vn=null;function lv(i=!1){oo.push(vn=i?null:[])}function cv(){oo.pop(),vn=oo[oo.length-1]||null}let So=1;function bf(i){So+=i,i<0&&vn&&(vn.hasOnce=!0)}function hv(i){return i.dynamicChildren=So>0?vn||ds:null,cv(),So>0&&vn&&vn.push(i),i}function uv(i,t,e,n,r,s){return hv(vm(i,t,e,n,r,s,!0))}function fv(i){return i?i.__v_isVNode===!0:!1}function Vs(i,t){return i.type===t.type&&i.key===t.key}const gm=({key:i})=>i!=null?i:null,Pa=({ref:i,ref_key:t,ref_for:e})=>(typeof i=="number"&&(i=""+i),i!=null?Ce(i)||Ze(i)||kt(i)?{i:Zn,r:i,k:t,f:!!e}:i:null);function vm(i,t=null,e=null,n=0,r=null,s=i===mi?0:1,o=!1,a=!1){const l={__v_isVNode:!0,__v_skip:!0,type:i,props:t,key:t&&gm(t),ref:t&&Pa(t),scopeId:jp,slotScopeIds:null,children:e,component:null,suspense:null,ssContent:null,ssFallback:null,dirs:null,transition:null,el:null,anchor:null,target:null,targetStart:null,targetAnchor:null,staticCount:0,shapeFlag:s,patchFlag:n,dynamicProps:r,dynamicChildren:null,appContext:null,ctx:Zn};return a?(pu(l,e),s&128&&i.normalize(l)):e&&(l.shapeFlag|=Ce(e)?8:16),So>0&&!o&&vn&&(l.patchFlag>0||s&6)&&l.patchFlag!==32&&vn.push(l),l}const ki=dv;function dv(i,t=null,e=null,n=0,r=null,s=!1){if((!i||i===L0)&&(i=yo),fv(i)){const a=As(i,t,!0);return e&&pu(a,e),So>0&&!s&&vn&&(a.shapeFlag&6?vn[vn.indexOf(i)]=a:vn.push(a)),a.patchFlag=-2,a}if(bv(i)&&(i=i.__vccOpts),t){t=pv(t);let{class:a,style:l}=t;a&&!Ce(a)&&(t.class=Qh(a)),ve(l)&&(au(l)&&!zt(l)&&(l=Be({},l)),t.style=Jh(l))}const o=Ce(i)?1:_m(i)?128:v0(i)?64:ve(i)?4:kt(i)?2:0;return vm(i,t,e,n,r,o,s,!0)}function pv(i){return i?au(i)||rm(i)?Be({},i):i:null}function As(i,t,e=!1,n=!1){const{props:r,ref:s,patchFlag:o,children:a,transition:l}=i,c=t?_v(r||{},t):r,h={__v_isVNode:!0,__v_skip:!0,type:i.type,props:c,key:c&&gm(c),ref:t&&t.ref?e&&s?zt(s)?s.concat(Pa(t)):[s,Pa(t)]:Pa(t):s,scopeId:i.scopeId,slotScopeIds:i.slotScopeIds,children:a,target:i.target,targetStart:i.targetStart,targetAnchor:i.targetAnchor,staticCount:i.staticCount,shapeFlag:i.shapeFlag,patchFlag:t&&i.type!==mi?o===-1?16:o|16:o,dynamicProps:i.dynamicProps,dynamicChildren:i.dynamicChildren,appContext:i.appContext,dirs:i.dirs,transition:l,component:i.component,suspense:i.suspense,ssContent:i.ssContent&&As(i.ssContent),ssFallback:i.ssFallback&&As(i.ssFallback),el:i.el,anchor:i.anchor,ctx:i.ctx,ce:i.ce};return l&&n&&uu(h,l.clone(h)),h}function xm(i=" ",t=0){return ki(bl,null,i,t)}function mv(i,t){const e=ki(Ra,null,i);return e.staticCount=t,e}function Yn(i){return i==null||typeof i=="boolean"?ki(yo):zt(i)?ki(mi,null,i.slice()):typeof i=="object"?Ii(i):ki(bl,null,String(i))}function Ii(i){return i.el===null&&i.patchFlag!==-1||i.memo?i:As(i)}function pu(i,t){let e=0;const{shapeFlag:n}=i;if(t==null)t=null;else if(zt(t))e=16;else if(typeof t=="object")if(n&65){const r=t.default;r&&(r._c&&(r._d=!1),pu(i,r()),r._c&&(r._d=!0));return}else{e=32;const r=t._;!r&&!rm(t)?t._ctx=Zn:r===3&&Zn&&(Zn.slots._===1?t._=1:(t._=2,i.patchFlag|=1024))}else kt(t)?(t={default:t,_ctx:Zn},e=32):(t=String(t),n&64?(e=16,t=[xm(t)]):e=8);i.children=t,i.shapeFlag|=e}function _v(...i){const t={};for(let e=0;e<i.length;e++){const n=i[e];for(const r in n)if(r==="class")t.class!==n.class&&(t.class=Qh([t.class,n.class]));else if(r==="style")t.style=Jh([t.style,n.style]);else if(_l(r)){const s=t[r],o=n[r];o&&s!==o&&!(zt(s)&&s.includes(o))&&(t[r]=s?[].concat(s,o):o)}else r!==""&&(t[r]=n[r])}return t}function Vn(i,t,e,n=null){ni(i,t,7,[e,n])}const gv=em();let vv=0;function xv(i,t,e){const n=i.type,r=(t?t.appContext:i.appContext)||gv,s={uid:vv++,vnode:i,type:n,parent:t,appContext:r,root:null,next:null,subTree:null,effect:null,update:null,job:null,scope:new Og(!0),render:null,proxy:null,exposed:null,exposeProxy:null,withProxy:null,provides:t?t.provides:Object.create(r.provides),ids:t?t.ids:["",0,0],accessCache:null,renderCache:[],components:null,directives:null,propsOptions:om(n,r),emitsOptions:mm(n,r),emit:null,emitted:null,propsDefaults:oe,inheritAttrs:n.inheritAttrs,ctx:oe,data:oe,props:oe,attrs:oe,slots:oe,refs:oe,setupState:oe,setupContext:null,suspense:e,suspenseId:e?e.pendingId:0,asyncDep:null,asyncResolved:!1,isMounted:!1,isUnmounted:!1,isDeactivated:!1,bc:null,c:null,bm:null,m:null,bu:null,u:null,um:null,bum:null,da:null,a:null,rtg:null,rtc:null,ec:null,sp:null};return s.ctx={_:s},s.root=t?t.root:s,s.emit=nv.bind(null,s),i.ce&&i.ce(s),s}let Ke=null,Xa,Yc;{const i=Zh(),t=(e,n)=>{let r;return(r=i[e])||(r=i[e]=[]),r.push(n),s=>{r.length>1?r.forEach(o=>o(s)):r[0](s)}};Xa=t("__VUE_INSTANCE_SETTERS__",e=>Ke=e),Yc=t("__VUE_SSR_SETTERS__",e=>Tl=e)}const Bo=i=>{const t=Ke;return Xa(i),i.scope.on(),()=>{i.scope.off(),Xa(t)}},Tf=()=>{Ke&&Ke.scope.off(),Xa(null)};function Mm(i){return i.vnode.shapeFlag&4}let Tl=!1;function Mv(i,t=!1,e=!1){t&&Yc(t);const{props:n,children:r}=i.vnode,s=Mm(i);H0(i,n,s,t),X0(i,r,e);const o=s?yv(i,t):void 0;return t&&Yc(!1),o}function yv(i,t){const e=i.type;i.accessCache=Object.create(null),i.proxy=new Proxy(i.ctx,D0);const{setup:n}=e;if(n){const r=i.setupContext=n.length>1?Ev(i):null,s=Bo(i);$i();const o=Fo(n,i,0,[i.props,r]);if(Zi(),s(),gp(o)){if(ro(i)||Kp(i),o.then(Tf,Tf),t)return o.then(a=>{Af(i,a,t)}).catch(a=>{yl(a,i,0)});i.asyncDep=o}else Af(i,o,t)}else ym(i,t)}function Af(i,t,e){kt(t)?i.type.__ssrInlineRender?i.ssrRender=t:i.render=t:ve(t)&&(i.setupState=Gp(t)),ym(i,e)}let wf;function ym(i,t,e){const n=i.type;if(!i.render){if(!t&&wf&&!n.render){const r=n.template||fu(i).template;if(r){const{isCustomElement:s,compilerOptions:o}=i.appContext.config,{delimiters:a,compilerOptions:l}=n,c=Be(Be({isCustomElement:s,delimiters:a},o),l);n.render=wf(r,c)}}i.render=n.render||Bn}{const r=Bo(i);$i();try{I0(i)}finally{Zi(),r()}}}const Sv={get(i,t){return We(i,"get",""),i[t]}};function Ev(i){const t=e=>{i.exposed=e||{}};return{attrs:new Proxy(i.attrs,Sv),slots:i.slots,emit:i.emit,expose:t}}function mu(i){return i.exposed?i.exposeProxy||(i.exposeProxy=new Proxy(Gp(o0(i.exposed)),{get(t,e){if(e in t)return t[e];if(e in so)return so[e](i)},has(t,e){return e in t||e in so}})):i.proxy}function bv(i){return kt(i)&&"__vccOpts"in i}const Tv=(i,t)=>c0(i,t,Tl),Av="3.5.8";/**
* @vue/runtime-dom v3.5.8
* (c) 2018-present Yuxi (Evan) You and Vue contributors
* @license MIT
**/let qc;const Cf=typeof window<"u"&&window.trustedTypes;if(Cf)try{qc=Cf.createPolicy("vue",{createHTML:i=>i})}catch{}const Sm=qc?i=>qc.createHTML(i):i=>i,wv="http://www.w3.org/2000/svg",Cv="http://www.w3.org/1998/Math/MathML",di=typeof document<"u"?document:null,Rf=di&&di.createElement("template"),Rv={insert:(i,t,e)=>{t.insertBefore(i,e||null)},remove:i=>{const t=i.parentNode;t&&t.removeChild(i)},createElement:(i,t,e,n)=>{const r=t==="svg"?di.createElementNS(wv,i):t==="mathml"?di.createElementNS(Cv,i):e?di.createElement(i,{is:e}):di.createElement(i);return i==="select"&&n&&n.multiple!=null&&r.setAttribute("multiple",n.multiple),r},createText:i=>di.createTextNode(i),createComment:i=>di.createComment(i),setText:(i,t)=>{i.nodeValue=t},setElementText:(i,t)=>{i.textContent=t},parentNode:i=>i.parentNode,nextSibling:i=>i.nextSibling,querySelector:i=>di.querySelector(i),setScopeId(i,t){i.setAttribute(t,"")},insertStaticContent(i,t,e,n,r,s){const o=e?e.previousSibling:t.lastChild;if(r&&(r===s||r.nextSibling))for(;t.insertBefore(r.cloneNode(!0),e),!(r===s||!(r=r.nextSibling)););else{Rf.innerHTML=Sm(n==="svg"?`<svg>${i}</svg>`:n==="mathml"?`<math>${i}</math>`:i);const a=Rf.content;if(n==="svg"||n==="mathml"){const l=a.firstChild;for(;l.firstChild;)a.appendChild(l.firstChild);a.removeChild(l)}t.insertBefore(a,e)}return[o?o.nextSibling:t.firstChild,e?e.previousSibling:t.lastChild]}},Pv=Symbol("_vtc");function Lv(i,t,e){const n=i[Pv];n&&(t=(t?[t,...n]:[...n]).join(" ")),t==null?i.removeAttribute("class"):e?i.setAttribute("class",t):i.className=t}const Pf=Symbol("_vod"),Dv=Symbol("_vsh"),Iv=Symbol(""),Uv=/(^|;)\s*display\s*:/;function Nv(i,t,e){const n=i.style,r=Ce(e);let s=!1;if(e&&!r){if(t)if(Ce(t))for(const o of t.split(";")){const a=o.slice(0,o.indexOf(":")).trim();e[a]==null&&La(n,a,"")}else for(const o in t)e[o]==null&&La(n,o,"");for(const o in e)o==="display"&&(s=!0),La(n,o,e[o])}else if(r){if(t!==e){const o=n[Iv];o&&(e+=";"+o),n.cssText=e,s=Uv.test(e)}}else t&&i.removeAttribute("style");Pf in i&&(i[Pf]=s?n.display:"",i[Dv]&&(n.display="none"))}const Lf=/\s*!important$/;function La(i,t,e){if(zt(e))e.forEach(n=>La(i,t,n));else if(e==null&&(e=""),t.startsWith("--"))i.setProperty(t,e);else{const n=Ov(i,t);Lf.test(e)?i.setProperty(Ur(n),e.replace(Lf,""),"important"):i[n]=e}}const Df=["Webkit","Moz","ms"],Kl={};function Ov(i,t){const e=Kl[t];if(e)return e;let n=Tr(t);if(n!=="filter"&&n in i)return Kl[t]=n;n=Mp(n);for(let r=0;r<Df.length;r++){const s=Df[r]+n;if(s in i)return Kl[t]=s}return t}const If="http://www.w3.org/1999/xlink";function Uf(i,t,e,n,r,s=Ng(t)){n&&t.startsWith("xlink:")?e==null?i.removeAttributeNS(If,t.slice(6,t.length)):i.setAttributeNS(If,t,e):e==null||s&&!Sp(e)?i.removeAttribute(t):i.setAttribute(t,s?"":Ki(e)?String(e):e)}function Fv(i,t,e,n){if(t==="innerHTML"||t==="textContent"){e!=null&&(i[t]=t==="innerHTML"?Sm(e):e);return}const r=i.tagName;if(t==="value"&&r!=="PROGRESS"&&!r.includes("-")){const o=r==="OPTION"?i.getAttribute("value")||"":i.value,a=e==null?i.type==="checkbox"?"on":"":String(e);(o!==a||!("_value"in i))&&(i.value=a),e==null&&i.removeAttribute(t),i._value=e;return}let s=!1;if(e===""||e==null){const o=typeof i[t];o==="boolean"?e=Sp(e):e==null&&o==="string"?(e="",s=!0):o==="number"&&(e=0,s=!0)}try{i[t]=e}catch{}s&&i.removeAttribute(t)}function Bv(i,t,e,n){i.addEventListener(t,e,n)}function zv(i,t,e,n){i.removeEventListener(t,e,n)}const Nf=Symbol("_vei");function kv(i,t,e,n,r=null){const s=i[Nf]||(i[Nf]={}),o=s[t];if(n&&o)o.value=n;else{const[a,l]=Hv(t);if(n){const c=s[t]=Wv(n,r);Bv(i,a,c,l)}else o&&(zv(i,a,o,l),s[t]=void 0)}}const Of=/(?:Once|Passive|Capture)$/;function Hv(i){let t;if(Of.test(i)){t={};let n;for(;n=i.match(Of);)i=i.slice(0,i.length-n[0].length),t[n[0].toLowerCase()]=!0}return[i[2]===":"?i.slice(3):Ur(i.slice(2)),t]}let $l=0;const Vv=Promise.resolve(),Gv=()=>$l||(Vv.then(()=>$l=0),$l=Date.now());function Wv(i,t){const e=n=>{if(!n._vts)n._vts=Date.now();else if(n._vts<=e.attached)return;ni(Xv(n,e.value),t,5,[n])};return e.value=i,e.attached=Gv(),e}function Xv(i,t){if(zt(t)){const e=i.stopImmediatePropagation;return i.stopImmediatePropagation=()=>{e.call(i),i._stopped=!0},t.map(n=>r=>!r._stopped&&n&&n(r))}else return t}const Ff=i=>i.charCodeAt(0)===111&&i.charCodeAt(1)===110&&i.charCodeAt(2)>96&&i.charCodeAt(2)<123,Yv=(i,t,e,n,r,s)=>{const o=r==="svg";t==="class"?Lv(i,n,o):t==="style"?Nv(i,e,n):_l(t)?jh(t)||kv(i,t,e,n,s):(t[0]==="."?(t=t.slice(1),!0):t[0]==="^"?(t=t.slice(1),!1):qv(i,t,n,o))?(Fv(i,t,n),!i.tagName.includes("-")&&(t==="value"||t==="checked"||t==="selected")&&Uf(i,t,n,o,s,t!=="value")):(t==="true-value"?i._trueValue=n:t==="false-value"&&(i._falseValue=n),Uf(i,t,n,o))};function qv(i,t,e,n){if(n)return!!(t==="innerHTML"||t==="textContent"||t in i&&Ff(t)&&kt(e));if(t==="spellcheck"||t==="draggable"||t==="translate"||t==="form"||t==="list"&&i.tagName==="INPUT"||t==="type"&&i.tagName==="TEXTAREA")return!1;if(t==="width"||t==="height"){const r=i.tagName;if(r==="IMG"||r==="VIDEO"||r==="CANVAS"||r==="SOURCE")return!1}return Ff(t)&&Ce(e)?!1:!!(t in i||i._isVueCE&&(/[A-Z]/.test(t)||!Ce(e)))}const jv=Be({patchProp:Yv},Rv);let Bf;function Kv(){return Bf||(Bf=j0(jv))}const $v=(...i)=>{const t=Kv().createApp(...i),{mount:e}=t;return t.mount=n=>{const r=Jv(n);if(!r)return;const s=t._component;!kt(s)&&!s.render&&!s.template&&(s.template=r.innerHTML),r.nodeType===1&&(r.textContent="");const o=e(r,!1,Zv(r));return r instanceof Element&&(r.removeAttribute("v-cloak"),r.setAttribute("data-v-app","")),o},t};function Zv(i){if(i instanceof SVGElement)return"svg";if(typeof MathMLElement=="function"&&i instanceof MathMLElement)return"mathml"}function Jv(i){return Ce(i)?document.querySelector(i):i}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const _u="168",vs={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},as={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Qv=0,zf=1,tx=2,Em=1,ex=2,fi=3,Xi=0,Qe=1,jn=2,Hi=0,xs=1,kf=2,Hf=3,Vf=4,nx=5,pr=100,ix=101,rx=102,sx=103,ox=104,ax=200,lx=201,cx=202,hx=203,jc=204,Kc=205,ux=206,fx=207,dx=208,px=209,mx=210,_x=211,gx=212,vx=213,xx=214,Mx=0,yx=1,Sx=2,Ya=3,Ex=4,bx=5,Tx=6,Ax=7,gu=0,wx=1,Cx=2,Vi=0,Rx=1,Px=2,Lx=3,Dx=4,Ix=5,Ux=6,Nx=7,bm=300,ws=301,Cs=302,$c=303,Zc=304,Al=306,Jc=1e3,_r=1001,Qc=1002,wn=1003,Ox=1004,Jo=1005,On=1006,Zl=1007,gr=1008,Mi=1009,Tm=1010,Am=1011,Eo=1012,vu=1013,wr=1014,gi=1015,zo=1016,xu=1017,Mu=1018,Rs=1020,wm=35902,Cm=1021,Rm=1022,Fn=1023,Pm=1024,Lm=1025,Ms=1026,Ps=1027,Dm=1028,yu=1029,Im=1030,Su=1031,Eu=1033,Da=33776,Ia=33777,Ua=33778,Na=33779,th=35840,eh=35841,nh=35842,ih=35843,rh=36196,sh=37492,oh=37496,ah=37808,lh=37809,ch=37810,hh=37811,uh=37812,fh=37813,dh=37814,ph=37815,mh=37816,_h=37817,gh=37818,vh=37819,xh=37820,Mh=37821,Oa=36492,yh=36494,Sh=36495,Um=36283,Eh=36284,bh=36285,Th=36286,Fx=3200,Bx=3201,bu=0,zx=1,Oi="",Wn="srgb",Ji="srgb-linear",Tu="display-p3",wl="display-p3-linear",qa="linear",le="srgb",ja="rec709",Ka="p3",Hr=7680,Gf=519,kx=512,Hx=513,Vx=514,Nm=515,Gx=516,Wx=517,Xx=518,Yx=519,Wf=35044,Xf="300 es",vi=2e3,$a=2001;class Nr{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const r=this._listeners[t];if(r!==void 0){const s=r.indexOf(e);s!==-1&&r.splice(s,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const r=n.slice(0);for(let s=0,o=r.length;s<o;s++)r[s].call(this,t);t.target=null}}}const ze=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Yf=1234567;const ao=Math.PI/180,Ls=180/Math.PI;function Or(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(ze[i&255]+ze[i>>8&255]+ze[i>>16&255]+ze[i>>24&255]+"-"+ze[t&255]+ze[t>>8&255]+"-"+ze[t>>16&15|64]+ze[t>>24&255]+"-"+ze[e&63|128]+ze[e>>8&255]+"-"+ze[e>>16&255]+ze[e>>24&255]+ze[n&255]+ze[n>>8&255]+ze[n>>16&255]+ze[n>>24&255]).toLowerCase()}function De(i,t,e){return Math.max(t,Math.min(e,i))}function Au(i,t){return(i%t+t)%t}function qx(i,t,e,n,r){return n+(i-t)*(r-n)/(e-t)}function jx(i,t,e){return i!==t?(e-i)/(t-i):0}function lo(i,t,e){return(1-e)*i+e*t}function Kx(i,t,e,n){return lo(i,t,1-Math.exp(-e*n))}function $x(i,t=1){return t-Math.abs(Au(i,t*2)-t)}function Zx(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Jx(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Qx(i,t){return i+Math.floor(Math.random()*(t-i+1))}function tM(i,t){return i+Math.random()*(t-i)}function eM(i){return i*(.5-Math.random())}function nM(i){i!==void 0&&(Yf=i);let t=Yf+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function iM(i){return i*ao}function rM(i){return i*Ls}function sM(i){return(i&i-1)===0&&i!==0}function oM(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function aM(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function lM(i,t,e,n,r){const s=Math.cos,o=Math.sin,a=s(e/2),l=o(e/2),c=s((t+n)/2),h=o((t+n)/2),u=s((t-n)/2),f=o((t-n)/2),d=s((n-t)/2),g=o((n-t)/2);switch(r){case"XYX":i.set(a*h,l*u,l*f,a*c);break;case"YZY":i.set(l*f,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*f,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*d,a*c);break;case"YXY":i.set(l*d,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*d,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+r)}}function os(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Ye(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const cM={DEG2RAD:ao,RAD2DEG:Ls,generateUUID:Or,clamp:De,euclideanModulo:Au,mapLinear:qx,inverseLerp:jx,lerp:lo,damp:Kx,pingpong:$x,smoothstep:Zx,smootherstep:Jx,randInt:Qx,randFloat:tM,randFloatSpread:eM,seededRandom:nM,degToRad:iM,radToDeg:rM,isPowerOfTwo:sM,ceilPowerOfTwo:oM,floorPowerOfTwo:aM,setQuaternionFromProperEuler:lM,normalize:Ye,denormalize:os};class ht{constructor(t=0,e=0){ht.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6],this.y=r[1]*e+r[4]*n+r[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(De(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),r=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*n-o*r+t.x,this.y=s*r+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Vt{constructor(t,e,n,r,s,o,a,l,c){Vt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,r,s,o,a,l,c)}set(t,e,n,r,s,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=r,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,r=e.elements,s=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],d=n[5],g=n[8],_=r[0],m=r[3],p=r[6],y=r[1],v=r[4],M=r[7],L=r[2],w=r[5],C=r[8];return s[0]=o*_+a*y+l*L,s[3]=o*m+a*v+l*w,s[6]=o*p+a*M+l*C,s[1]=c*_+h*y+u*L,s[4]=c*m+h*v+u*w,s[7]=c*p+h*M+u*C,s[2]=f*_+d*y+g*L,s[5]=f*m+d*v+g*w,s[8]=f*p+d*M+g*C,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],r=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*s*h+n*a*l+r*s*c-r*o*l}invert(){const t=this.elements,e=t[0],n=t[1],r=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,f=a*l-h*s,d=c*s-o*l,g=e*u+n*f+r*d;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(r*c-h*n)*_,t[2]=(a*n-r*o)*_,t[3]=f*_,t[4]=(h*e-r*l)*_,t[5]=(r*s-a*e)*_,t[6]=d*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*s)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,r,s,o,a){const l=Math.cos(s),c=Math.sin(s);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-r*c,r*l,-r*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Jl.makeScale(t,e)),this}rotate(t){return this.premultiply(Jl.makeRotation(-t)),this}translate(t,e){return this.premultiply(Jl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let r=0;r<9;r++)if(e[r]!==n[r])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Jl=new Vt;function Om(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Za(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function hM(){const i=Za("canvas");return i.style.display="block",i}const qf={};function co(i){i in qf||(qf[i]=!0,console.warn(i))}function uM(i,t,e){return new Promise(function(n,r){function s(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:r();break;case i.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:n()}}setTimeout(s,e)})}const jf=new Vt().set(.8224621,.177538,0,.0331941,.9668058,0,.0170827,.0723974,.9105199),Kf=new Vt().set(1.2249401,-.2249404,0,-.0420569,1.0420571,0,-.0196376,-.0786361,1.0982735),Gs={[Ji]:{transfer:qa,primaries:ja,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i,fromReference:i=>i},[Wn]:{transfer:le,primaries:ja,luminanceCoefficients:[.2126,.7152,.0722],toReference:i=>i.convertSRGBToLinear(),fromReference:i=>i.convertLinearToSRGB()},[wl]:{transfer:qa,primaries:Ka,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.applyMatrix3(Kf),fromReference:i=>i.applyMatrix3(jf)},[Tu]:{transfer:le,primaries:Ka,luminanceCoefficients:[.2289,.6917,.0793],toReference:i=>i.convertSRGBToLinear().applyMatrix3(Kf),fromReference:i=>i.applyMatrix3(jf).convertLinearToSRGB()}},fM=new Set([Ji,wl]),te={enabled:!0,_workingColorSpace:Ji,get workingColorSpace(){return this._workingColorSpace},set workingColorSpace(i){if(!fM.has(i))throw new Error(`Unsupported working color space, "${i}".`);this._workingColorSpace=i},convert:function(i,t,e){if(this.enabled===!1||t===e||!t||!e)return i;const n=Gs[t].toReference,r=Gs[e].fromReference;return r(n(i))},fromWorkingColorSpace:function(i,t){return this.convert(i,this._workingColorSpace,t)},toWorkingColorSpace:function(i,t){return this.convert(i,t,this._workingColorSpace)},getPrimaries:function(i){return Gs[i].primaries},getTransfer:function(i){return i===Oi?qa:Gs[i].transfer},getLuminanceCoefficients:function(i,t=this._workingColorSpace){return i.fromArray(Gs[t].luminanceCoefficients)}};function ys(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ql(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let Vr;class dM{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Vr===void 0&&(Vr=Za("canvas")),Vr.width=t.width,Vr.height=t.height;const n=Vr.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Vr}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Za("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const r=n.getImageData(0,0,t.width,t.height),s=r.data;for(let o=0;o<s.length;o++)s[o]=ys(s[o]/255)*255;return n.putImageData(r,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ys(e[n]/255)*255):e[n]=ys(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let pM=0;class Fm{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:pM++}),this.uuid=Or(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},r=this.data;if(r!==null){let s;if(Array.isArray(r)){s=[];for(let o=0,a=r.length;o<a;o++)r[o].isDataTexture?s.push(tc(r[o].image)):s.push(tc(r[o]))}else s=tc(r);n.url=s}return e||(t.images[this.uuid]=n),n}}function tc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?dM.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let mM=0;class tn extends Nr{constructor(t=tn.DEFAULT_IMAGE,e=tn.DEFAULT_MAPPING,n=_r,r=_r,s=On,o=gr,a=Fn,l=Mi,c=tn.DEFAULT_ANISOTROPY,h=Oi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:mM++}),this.uuid=Or(),this.name="",this.source=new Fm(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=r,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ht(0,0),this.repeat=new ht(1,1),this.center=new ht(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Vt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==bm)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Jc:t.x=t.x-Math.floor(t.x);break;case _r:t.x=t.x<0?0:1;break;case Qc:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Jc:t.y=t.y-Math.floor(t.y);break;case _r:t.y=t.y<0?0:1;break;case Qc:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}tn.DEFAULT_IMAGE=null;tn.DEFAULT_MAPPING=bm;tn.DEFAULT_ANISOTROPY=1;class Ae{constructor(t=0,e=0,n=0,r=1){Ae.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=r}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,r){return this.x=t,this.y=e,this.z=n,this.w=r,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,r=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*r+o[12]*s,this.y=o[1]*e+o[5]*n+o[9]*r+o[13]*s,this.z=o[2]*e+o[6]*n+o[10]*r+o[14]*s,this.w=o[3]*e+o[7]*n+o[11]*r+o[15]*s,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,r,s;const l=t.elements,c=l[0],h=l[4],u=l[8],f=l[1],d=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+d+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const v=(c+1)/2,M=(d+1)/2,L=(p+1)/2,w=(h+f)/4,C=(u+_)/4,D=(g+m)/4;return v>M&&v>L?v<.01?(n=0,r=.707106781,s=.707106781):(n=Math.sqrt(v),r=w/n,s=C/n):M>L?M<.01?(n=.707106781,r=0,s=.707106781):(r=Math.sqrt(M),n=w/r,s=D/r):L<.01?(n=.707106781,r=.707106781,s=0):(s=Math.sqrt(L),n=C/s,r=D/s),this.set(n,r,s,e),this}let y=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(u-_)/y,this.z=(f-h)/y,this.w=Math.acos((c+d+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class _M extends Nr{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new Ae(0,0,t,e),this.scissorTest=!1,this.viewport=new Ae(0,0,t,e);const r={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:On,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const s=new tn(r,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);s.flipY=!1,s.generateMipmaps=n.generateMipmaps,s.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let r=0,s=this.textures.length;r<s;r++)this.textures[r].image.width=t,this.textures[r].image.height=e,this.textures[r].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,r=t.textures.length;n<r;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new Fm(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Cr extends _M{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class Bm extends tn{constructor(t=null,e=1,n=1,r=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:r},this.magFilter=wn,this.minFilter=wn,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class gM extends tn{constructor(t=null,e=1,n=1,r=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:r},this.magFilter=wn,this.minFilter=wn,this.wrapR=_r,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Rr{constructor(t=0,e=0,n=0,r=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=r}static slerpFlat(t,e,n,r,s,o,a){let l=n[r+0],c=n[r+1],h=n[r+2],u=n[r+3];const f=s[o+0],d=s[o+1],g=s[o+2],_=s[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u;return}if(a===1){t[e+0]=f,t[e+1]=d,t[e+2]=g,t[e+3]=_;return}if(u!==_||l!==f||c!==d||h!==g){let m=1-a;const p=l*f+c*d+h*g+u*_,y=p>=0?1:-1,v=1-p*p;if(v>Number.EPSILON){const L=Math.sqrt(v),w=Math.atan2(L,p*y);m=Math.sin(m*w)/L,a=Math.sin(a*w)/L}const M=a*y;if(l=l*m+f*M,c=c*m+d*M,h=h*m+g*M,u=u*m+_*M,m===1-a){const L=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=L,c*=L,h*=L,u*=L}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,r,s,o){const a=n[r],l=n[r+1],c=n[r+2],h=n[r+3],u=s[o],f=s[o+1],d=s[o+2],g=s[o+3];return t[e]=a*g+h*u+l*d-c*f,t[e+1]=l*g+h*f+c*u-a*d,t[e+2]=c*g+h*d+a*f-l*u,t[e+3]=h*g-a*u-l*f-c*d,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,r){return this._x=t,this._y=e,this._z=n,this._w=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,r=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(r/2),u=a(s/2),f=l(n/2),d=l(r/2),g=l(s/2);switch(o){case"XYZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"YXZ":this._x=f*h*u+c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"ZXY":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u-f*d*g;break;case"ZYX":this._x=f*h*u-c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u+f*d*g;break;case"YZX":this._x=f*h*u+c*d*g,this._y=c*d*u+f*h*g,this._z=c*h*g-f*d*u,this._w=c*h*u-f*d*g;break;case"XZY":this._x=f*h*u-c*d*g,this._y=c*d*u-f*h*g,this._z=c*h*g+f*d*u,this._w=c*h*u+f*d*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,r=Math.sin(n);return this._x=t.x*r,this._y=t.y*r,this._z=t.z*r,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],r=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],f=n+a+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-l)*d,this._y=(s-c)*d,this._z=(o-r)*d}else if(n>a&&n>u){const d=2*Math.sqrt(1+n-a-u);this._w=(h-l)/d,this._x=.25*d,this._y=(r+o)/d,this._z=(s+c)/d}else if(a>u){const d=2*Math.sqrt(1+a-n-u);this._w=(s-c)/d,this._x=(r+o)/d,this._y=.25*d,this._z=(l+h)/d}else{const d=2*Math.sqrt(1+u-n-a);this._w=(o-r)/d,this._x=(s+c)/d,this._y=(l+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(De(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const r=Math.min(1,e/n);return this.slerp(t,r),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,r=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+r*c-s*l,this._y=r*h+o*l+s*a-n*c,this._z=s*h+o*c+n*l-r*a,this._w=o*h-n*a-r*l-s*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,r=this._y,s=this._z,o=this._w;let a=o*t._w+n*t._x+r*t._y+s*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=r,this._z=s,this;const l=1-a*a;if(l<=Number.EPSILON){const d=1-e;return this._w=d*o+e*this._w,this._x=d*n+e*this._x,this._y=d*r+e*this._y,this._z=d*s+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-e)*h)/c,f=Math.sin(e*h)/c;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=r*u+this._y*f,this._z=s*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),r=Math.sqrt(1-n),s=Math.sqrt(n);return this.set(r*Math.sin(t),r*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(t=0,e=0,n=0){O.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion($f.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion($f.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6]*r,this.y=s[1]*e+s[4]*n+s[7]*r,this.z=s[2]*e+s[5]*n+s[8]*r,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,r=this.z,s=t.elements,o=1/(s[3]*e+s[7]*n+s[11]*r+s[15]);return this.x=(s[0]*e+s[4]*n+s[8]*r+s[12])*o,this.y=(s[1]*e+s[5]*n+s[9]*r+s[13])*o,this.z=(s[2]*e+s[6]*n+s[10]*r+s[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,r=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*r-a*n),h=2*(a*e-s*r),u=2*(s*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-s*u,this.z=r+l*u+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,r=this.z,s=t.elements;return this.x=s[0]*e+s[4]*n+s[8]*r,this.y=s[1]*e+s[5]*n+s[9]*r,this.z=s[2]*e+s[6]*n+s[10]*r,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,r=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=r*l-s*a,this.y=s*o-n*l,this.z=n*a-r*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ec.copy(this).projectOnVector(t),this.sub(ec)}reflect(t){return this.sub(ec.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(De(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,r=this.z-t.z;return e*e+n*n+r*r}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const r=Math.sin(e)*t;return this.x=r*Math.sin(n),this.y=Math.cos(e)*t,this.z=r*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),r=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=r,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const ec=new O,$f=new Rr;class ko{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(In.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(In.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=In.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const s=n.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,In):In.fromBufferAttribute(s,o),In.applyMatrix4(t.matrixWorld),this.expandByPoint(In);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Qo.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qo.copy(n.boundingBox)),Qo.applyMatrix4(t.matrixWorld),this.union(Qo)}const r=t.children;for(let s=0,o=r.length;s<o;s++)this.expandByObject(r[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,In),In.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ws),ta.subVectors(this.max,Ws),Gr.subVectors(t.a,Ws),Wr.subVectors(t.b,Ws),Xr.subVectors(t.c,Ws),Ai.subVectors(Wr,Gr),wi.subVectors(Xr,Wr),ir.subVectors(Gr,Xr);let e=[0,-Ai.z,Ai.y,0,-wi.z,wi.y,0,-ir.z,ir.y,Ai.z,0,-Ai.x,wi.z,0,-wi.x,ir.z,0,-ir.x,-Ai.y,Ai.x,0,-wi.y,wi.x,0,-ir.y,ir.x,0];return!nc(e,Gr,Wr,Xr,ta)||(e=[1,0,0,0,1,0,0,0,1],!nc(e,Gr,Wr,Xr,ta))?!1:(ea.crossVectors(Ai,wi),e=[ea.x,ea.y,ea.z],nc(e,Gr,Wr,Xr,ta))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,In).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(In).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ai),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const ai=[new O,new O,new O,new O,new O,new O,new O,new O],In=new O,Qo=new ko,Gr=new O,Wr=new O,Xr=new O,Ai=new O,wi=new O,ir=new O,Ws=new O,ta=new O,ea=new O,rr=new O;function nc(i,t,e,n,r){for(let s=0,o=i.length-3;s<=o;s+=3){rr.fromArray(i,s);const a=r.x*Math.abs(rr.x)+r.y*Math.abs(rr.y)+r.z*Math.abs(rr.z),l=t.dot(rr),c=e.dot(rr),h=n.dot(rr);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const vM=new ko,Xs=new O,ic=new O;class Cl{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):vM.setFromPoints(t).getCenter(n);let r=0;for(let s=0,o=t.length;s<o;s++)r=Math.max(r,n.distanceToSquared(t[s]));return this.radius=Math.sqrt(r),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xs.subVectors(t,this.center);const e=Xs.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),r=(n-this.radius)*.5;this.center.addScaledVector(Xs,r/n),this.radius+=r}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ic.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xs.copy(t.center).add(ic)),this.expandByPoint(Xs.copy(t.center).sub(ic))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const li=new O,rc=new O,na=new O,Ci=new O,sc=new O,ia=new O,oc=new O;class wu{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,li)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=li.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(li.copy(this.origin).addScaledVector(this.direction,e),li.distanceToSquared(t))}distanceSqToSegment(t,e,n,r){rc.copy(t).add(e).multiplyScalar(.5),na.copy(e).sub(t).normalize(),Ci.copy(this.origin).sub(rc);const s=t.distanceTo(e)*.5,o=-this.direction.dot(na),a=Ci.dot(this.direction),l=-Ci.dot(na),c=Ci.lengthSq(),h=Math.abs(1-o*o);let u,f,d,g;if(h>0)if(u=o*l-a,f=o*a-l,g=s*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,d=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=s,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f=-s,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-o*s+a)),f=u>0?-s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-s,-l),s),d=f*(f+2*l)+c):(u=Math.max(0,-(o*s+a)),f=u>0?s:Math.min(Math.max(-s,-l),s),d=-u*u+f*(f+2*l)+c);else f=o>0?-s:s,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),r&&r.copy(rc).addScaledVector(na,f),d}intersectSphere(t,e){li.subVectors(t.center,this.origin);const n=li.dot(this.direction),r=li.dot(li)-n*n,s=t.radius*t.radius;if(r>s)return null;const o=Math.sqrt(s-r),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,r,s,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(t.min.x-f.x)*c,r=(t.max.x-f.x)*c):(n=(t.max.x-f.x)*c,r=(t.min.x-f.x)*c),h>=0?(s=(t.min.y-f.y)*h,o=(t.max.y-f.y)*h):(s=(t.max.y-f.y)*h,o=(t.min.y-f.y)*h),n>o||s>r||((s>n||isNaN(n))&&(n=s),(o<r||isNaN(r))&&(r=o),u>=0?(a=(t.min.z-f.z)*u,l=(t.max.z-f.z)*u):(a=(t.max.z-f.z)*u,l=(t.min.z-f.z)*u),n>l||a>r)||((a>n||n!==n)&&(n=a),(l<r||r!==r)&&(r=l),r<0)?null:this.at(n>=0?n:r,e)}intersectsBox(t){return this.intersectBox(t,li)!==null}intersectTriangle(t,e,n,r,s){sc.subVectors(e,t),ia.subVectors(n,t),oc.crossVectors(sc,ia);let o=this.direction.dot(oc),a;if(o>0){if(r)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Ci.subVectors(this.origin,t);const l=a*this.direction.dot(ia.crossVectors(Ci,ia));if(l<0)return null;const c=a*this.direction.dot(sc.cross(Ci));if(c<0||l+c>o)return null;const h=-a*Ci.dot(oc);return h<0?null:this.at(h/o,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class de{constructor(t,e,n,r,s,o,a,l,c,h,u,f,d,g,_,m){de.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,r,s,o,a,l,c,h,u,f,d,g,_,m)}set(t,e,n,r,s,o,a,l,c,h,u,f,d,g,_,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=r,p[1]=s,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=f,p[3]=d,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new de().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,r=1/Yr.setFromMatrixColumn(t,0).length(),s=1/Yr.setFromMatrixColumn(t,1).length(),o=1/Yr.setFromMatrixColumn(t,2).length();return e[0]=n[0]*r,e[1]=n[1]*r,e[2]=n[2]*r,e[3]=0,e[4]=n[4]*s,e[5]=n[5]*s,e[6]=n[6]*s,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,r=t.y,s=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(r),c=Math.sin(r),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){const f=o*h,d=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=d+g*c,e[5]=f-_*c,e[9]=-a*l,e[2]=_-f*c,e[6]=g+d*c,e[10]=o*l}else if(t.order==="YXZ"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f+_*a,e[4]=g*a-d,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=d*a-g,e[6]=_+f*a,e[10]=o*l}else if(t.order==="ZXY"){const f=l*h,d=l*u,g=c*h,_=c*u;e[0]=f-_*a,e[4]=-o*u,e[8]=g+d*a,e[1]=d+g*a,e[5]=o*h,e[9]=_-f*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const f=o*h,d=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=g*c-d,e[8]=f*c+_,e[1]=l*u,e[5]=_*c+f,e[9]=d*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const f=o*l,d=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-f*u,e[8]=g*u+d,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=d*u+g,e[10]=f-_*u}else if(t.order==="XZY"){const f=o*l,d=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=f*u+_,e[5]=o*h,e[9]=d*u-g,e[2]=g*u-d,e[6]=a*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(xM,t,MM)}lookAt(t,e,n){const r=this.elements;return hn.subVectors(t,e),hn.lengthSq()===0&&(hn.z=1),hn.normalize(),Ri.crossVectors(n,hn),Ri.lengthSq()===0&&(Math.abs(n.z)===1?hn.x+=1e-4:hn.z+=1e-4,hn.normalize(),Ri.crossVectors(n,hn)),Ri.normalize(),ra.crossVectors(hn,Ri),r[0]=Ri.x,r[4]=ra.x,r[8]=hn.x,r[1]=Ri.y,r[5]=ra.y,r[9]=hn.y,r[2]=Ri.z,r[6]=ra.z,r[10]=hn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,r=e.elements,s=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],d=n[13],g=n[2],_=n[6],m=n[10],p=n[14],y=n[3],v=n[7],M=n[11],L=n[15],w=r[0],C=r[4],D=r[8],S=r[12],E=r[1],I=r[5],G=r[9],H=r[13],Z=r[2],et=r[6],X=r[10],$=r[14],Y=r[3],ft=r[7],vt=r[11],mt=r[15];return s[0]=o*w+a*E+l*Z+c*Y,s[4]=o*C+a*I+l*et+c*ft,s[8]=o*D+a*G+l*X+c*vt,s[12]=o*S+a*H+l*$+c*mt,s[1]=h*w+u*E+f*Z+d*Y,s[5]=h*C+u*I+f*et+d*ft,s[9]=h*D+u*G+f*X+d*vt,s[13]=h*S+u*H+f*$+d*mt,s[2]=g*w+_*E+m*Z+p*Y,s[6]=g*C+_*I+m*et+p*ft,s[10]=g*D+_*G+m*X+p*vt,s[14]=g*S+_*H+m*$+p*mt,s[3]=y*w+v*E+M*Z+L*Y,s[7]=y*C+v*I+M*et+L*ft,s[11]=y*D+v*G+M*X+L*vt,s[15]=y*S+v*H+M*$+L*mt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],r=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],f=t[10],d=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+s*l*u-r*c*u-s*a*f+n*c*f+r*a*d-n*l*d)+_*(+e*l*d-e*c*f+s*o*f-r*o*d+r*c*h-s*l*h)+m*(+e*c*u-e*a*d-s*o*u+n*o*d+s*a*h-n*c*h)+p*(-r*a*h-e*l*u+e*a*f+r*o*u-n*o*f+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const r=this.elements;return t.isVector3?(r[12]=t.x,r[13]=t.y,r[14]=t.z):(r[12]=t,r[13]=e,r[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],r=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],f=t[10],d=t[11],g=t[12],_=t[13],m=t[14],p=t[15],y=u*m*c-_*f*c+_*l*d-a*m*d-u*l*p+a*f*p,v=g*f*c-h*m*c-g*l*d+o*m*d+h*l*p-o*f*p,M=h*_*c-g*u*c+g*a*d-o*_*d-h*a*p+o*u*p,L=g*u*l-h*_*l-g*a*f+o*_*f+h*a*m-o*u*m,w=e*y+n*v+r*M+s*L;if(w===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const C=1/w;return t[0]=y*C,t[1]=(_*f*s-u*m*s-_*r*d+n*m*d+u*r*p-n*f*p)*C,t[2]=(a*m*s-_*l*s+_*r*c-n*m*c-a*r*p+n*l*p)*C,t[3]=(u*l*s-a*f*s-u*r*c+n*f*c+a*r*d-n*l*d)*C,t[4]=v*C,t[5]=(h*m*s-g*f*s+g*r*d-e*m*d-h*r*p+e*f*p)*C,t[6]=(g*l*s-o*m*s-g*r*c+e*m*c+o*r*p-e*l*p)*C,t[7]=(o*f*s-h*l*s+h*r*c-e*f*c-o*r*d+e*l*d)*C,t[8]=M*C,t[9]=(g*u*s-h*_*s-g*n*d+e*_*d+h*n*p-e*u*p)*C,t[10]=(o*_*s-g*a*s+g*n*c-e*_*c-o*n*p+e*a*p)*C,t[11]=(h*a*s-o*u*s-h*n*c+e*u*c+o*n*d-e*a*d)*C,t[12]=L*C,t[13]=(h*_*r-g*u*r+g*n*f-e*_*f-h*n*m+e*u*m)*C,t[14]=(g*a*r-o*_*r-g*n*l+e*_*l+o*n*m-e*a*m)*C,t[15]=(o*u*r-h*a*r+h*n*l-e*u*l-o*n*f+e*a*f)*C,this}scale(t){const e=this.elements,n=t.x,r=t.y,s=t.z;return e[0]*=n,e[4]*=r,e[8]*=s,e[1]*=n,e[5]*=r,e[9]*=s,e[2]*=n,e[6]*=r,e[10]*=s,e[3]*=n,e[7]*=r,e[11]*=s,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],r=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,r))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),r=Math.sin(e),s=1-n,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+n,c*a-r*l,c*l+r*a,0,c*a+r*l,h*a+n,h*l-r*o,0,c*l-r*a,h*l+r*o,s*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,r,s,o){return this.set(1,n,s,0,t,1,o,0,e,r,1,0,0,0,0,1),this}compose(t,e,n){const r=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,u=a+a,f=s*c,d=s*h,g=s*u,_=o*h,m=o*u,p=a*u,y=l*c,v=l*h,M=l*u,L=n.x,w=n.y,C=n.z;return r[0]=(1-(_+p))*L,r[1]=(d+M)*L,r[2]=(g-v)*L,r[3]=0,r[4]=(d-M)*w,r[5]=(1-(f+p))*w,r[6]=(m+y)*w,r[7]=0,r[8]=(g+v)*C,r[9]=(m-y)*C,r[10]=(1-(f+_))*C,r[11]=0,r[12]=t.x,r[13]=t.y,r[14]=t.z,r[15]=1,this}decompose(t,e,n){const r=this.elements;let s=Yr.set(r[0],r[1],r[2]).length();const o=Yr.set(r[4],r[5],r[6]).length(),a=Yr.set(r[8],r[9],r[10]).length();this.determinant()<0&&(s=-s),t.x=r[12],t.y=r[13],t.z=r[14],Un.copy(this);const c=1/s,h=1/o,u=1/a;return Un.elements[0]*=c,Un.elements[1]*=c,Un.elements[2]*=c,Un.elements[4]*=h,Un.elements[5]*=h,Un.elements[6]*=h,Un.elements[8]*=u,Un.elements[9]*=u,Un.elements[10]*=u,e.setFromRotationMatrix(Un),n.x=s,n.y=o,n.z=a,this}makePerspective(t,e,n,r,s,o,a=vi){const l=this.elements,c=2*s/(e-t),h=2*s/(n-r),u=(e+t)/(e-t),f=(n+r)/(n-r);let d,g;if(a===vi)d=-(o+s)/(o-s),g=-2*o*s/(o-s);else if(a===$a)d=-o/(o-s),g=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=h,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=d,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,r,s,o,a=vi){const l=this.elements,c=1/(e-t),h=1/(n-r),u=1/(o-s),f=(e+t)*c,d=(n+r)*h;let g,_;if(a===vi)g=(o+s)*u,_=-2*u;else if(a===$a)g=s*u,_=-1*u;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-f,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-d,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let r=0;r<16;r++)if(e[r]!==n[r])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Yr=new O,Un=new de,xM=new O(0,0,0),MM=new O(1,1,1),Ri=new O,ra=new O,hn=new O,Zf=new de,Jf=new Rr;class kn{constructor(t=0,e=0,n=0,r=kn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=r}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,r=this._order){return this._x=t,this._y=e,this._z=n,this._order=r,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const r=t.elements,s=r[0],o=r[4],a=r[8],l=r[1],c=r[5],h=r[9],u=r[2],f=r[6],d=r[10];switch(e){case"XYZ":this._y=Math.asin(De(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-De(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(De(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-De(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(De(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-De(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,d),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Zf.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Zf,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Jf.setFromEuler(this),this.setFromQuaternion(Jf,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}kn.DEFAULT_ORDER="XYZ";class zm{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let yM=0;const Qf=new O,qr=new Rr,ci=new de,sa=new O,Ys=new O,SM=new O,EM=new Rr,td=new O(1,0,0),ed=new O(0,1,0),nd=new O(0,0,1),id={type:"added"},bM={type:"removed"},jr={type:"childadded",child:null},ac={type:"childremoved",child:null};class we extends Nr{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:yM++}),this.uuid=Or(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=we.DEFAULT_UP.clone();const t=new O,e=new kn,n=new Rr,r=new O(1,1,1);function s(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(s),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:r},modelViewMatrix:{value:new de},normalMatrix:{value:new Vt}}),this.matrix=new de,this.matrixWorld=new de,this.matrixAutoUpdate=we.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new zm,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return qr.setFromAxisAngle(t,e),this.quaternion.multiply(qr),this}rotateOnWorldAxis(t,e){return qr.setFromAxisAngle(t,e),this.quaternion.premultiply(qr),this}rotateX(t){return this.rotateOnAxis(td,t)}rotateY(t){return this.rotateOnAxis(ed,t)}rotateZ(t){return this.rotateOnAxis(nd,t)}translateOnAxis(t,e){return Qf.copy(t).applyQuaternion(this.quaternion),this.position.add(Qf.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(td,t)}translateY(t){return this.translateOnAxis(ed,t)}translateZ(t){return this.translateOnAxis(nd,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ci.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?sa.copy(t):sa.set(t,e,n);const r=this.parent;this.updateWorldMatrix(!0,!1),Ys.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ci.lookAt(Ys,sa,this.up):ci.lookAt(sa,Ys,this.up),this.quaternion.setFromRotationMatrix(ci),r&&(ci.extractRotation(r.matrixWorld),qr.setFromRotationMatrix(ci),this.quaternion.premultiply(qr.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(id),jr.child=t,this.dispatchEvent(jr),jr.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(bM),ac.child=t,this.dispatchEvent(ac),ac.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ci.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ci.multiply(t.parent.matrixWorld)),t.applyMatrix4(ci),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(id),jr.child=t,this.dispatchEvent(jr),jr.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,r=this.children.length;n<r;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,t,SM),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ys,EM,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,r=e.length;n<r;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,r=e.length;n<r;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,r=e.length;n<r;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const r=this.children;for(let s=0,o=r.length;s<o;s++)r[s].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const r={};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.castShadow===!0&&(r.castShadow=!0),this.receiveShadow===!0&&(r.receiveShadow=!0),this.visible===!1&&(r.visible=!1),this.frustumCulled===!1&&(r.frustumCulled=!1),this.renderOrder!==0&&(r.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(r.userData=this.userData),r.layers=this.layers.mask,r.matrix=this.matrix.toArray(),r.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(r.matrixAutoUpdate=!1),this.isInstancedMesh&&(r.type="InstancedMesh",r.count=this.count,r.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(r.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(r.type="BatchedMesh",r.perObjectFrustumCulled=this.perObjectFrustumCulled,r.sortObjects=this.sortObjects,r.drawRanges=this._drawRanges,r.reservedRanges=this._reservedRanges,r.visibility=this._visibility,r.active=this._active,r.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),r.maxInstanceCount=this._maxInstanceCount,r.maxVertexCount=this._maxVertexCount,r.maxIndexCount=this._maxIndexCount,r.geometryInitialized=this._geometryInitialized,r.geometryCount=this._geometryCount,r.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(r.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(r.boundingSphere={center:r.boundingSphere.center.toArray(),radius:r.boundingSphere.radius}),this.boundingBox!==null&&(r.boundingBox={min:r.boundingBox.min.toArray(),max:r.boundingBox.max.toArray()}));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?r.background=this.background.toJSON():this.background.isTexture&&(r.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(r.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){r.geometry=s(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];s(t.shapes,u)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(r.bindMode=this.bindMode,r.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),r.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));r.material=a}else r.material=s(t.materials,this.material);if(this.children.length>0){r.children=[];for(let a=0;a<this.children.length;a++)r.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){r.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];r.animations.push(s(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),f=o(t.skeletons),d=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),g.length>0&&(n.nodes=g)}return n.object=r,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const r=t.children[n];this.add(r.clone())}return this}}we.DEFAULT_UP=new O(0,1,0);we.DEFAULT_MATRIX_AUTO_UPDATE=!0;we.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Nn=new O,hi=new O,lc=new O,ui=new O,Kr=new O,$r=new O,rd=new O,cc=new O,hc=new O,uc=new O;class Kn{constructor(t=new O,e=new O,n=new O){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,r){r.subVectors(n,e),Nn.subVectors(t,e),r.cross(Nn);const s=r.lengthSq();return s>0?r.multiplyScalar(1/Math.sqrt(s)):r.set(0,0,0)}static getBarycoord(t,e,n,r,s){Nn.subVectors(r,e),hi.subVectors(n,e),lc.subVectors(t,e);const o=Nn.dot(Nn),a=Nn.dot(hi),l=Nn.dot(lc),c=hi.dot(hi),h=hi.dot(lc),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;const f=1/u,d=(c*l-a*h)*f,g=(o*h-a*l)*f;return s.set(1-d-g,g,d)}static containsPoint(t,e,n,r){return this.getBarycoord(t,e,n,r,ui)===null?!1:ui.x>=0&&ui.y>=0&&ui.x+ui.y<=1}static getInterpolation(t,e,n,r,s,o,a,l){return this.getBarycoord(t,e,n,r,ui)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,ui.x),l.addScaledVector(o,ui.y),l.addScaledVector(a,ui.z),l)}static isFrontFacing(t,e,n,r){return Nn.subVectors(n,e),hi.subVectors(t,e),Nn.cross(hi).dot(r)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,r){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[r]),this}setFromAttributeAndIndices(t,e,n,r){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,r),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Nn.subVectors(this.c,this.b),hi.subVectors(this.a,this.b),Nn.cross(hi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return Kn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return Kn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,r,s){return Kn.getInterpolation(t,this.a,this.b,this.c,e,n,r,s)}containsPoint(t){return Kn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return Kn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,r=this.b,s=this.c;let o,a;Kr.subVectors(r,n),$r.subVectors(s,n),cc.subVectors(t,n);const l=Kr.dot(cc),c=$r.dot(cc);if(l<=0&&c<=0)return e.copy(n);hc.subVectors(t,r);const h=Kr.dot(hc),u=$r.dot(hc);if(h>=0&&u<=h)return e.copy(r);const f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Kr,o);uc.subVectors(t,s);const d=Kr.dot(uc),g=$r.dot(uc);if(g>=0&&d<=g)return e.copy(s);const _=d*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector($r,a);const m=h*g-d*u;if(m<=0&&u-h>=0&&d-g>=0)return rd.subVectors(s,r),a=(u-h)/(u-h+(d-g)),e.copy(r).addScaledVector(rd,a);const p=1/(m+_+f);return o=_*p,a=f*p,e.copy(n).addScaledVector(Kr,o).addScaledVector($r,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const km={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pi={h:0,s:0,l:0},oa={h:0,s:0,l:0};function fc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class Gt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const r=t;r&&r.isColor?this.copy(r):typeof r=="number"?this.setHex(r):typeof r=="string"&&this.setStyle(r)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Wn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,te.toWorkingColorSpace(this,e),this}setRGB(t,e,n,r=te.workingColorSpace){return this.r=t,this.g=e,this.b=n,te.toWorkingColorSpace(this,r),this}setHSL(t,e,n,r=te.workingColorSpace){if(t=Au(t,1),e=De(e,0,1),n=De(n,0,1),e===0)this.r=this.g=this.b=n;else{const s=n<=.5?n*(1+e):n+e-n*e,o=2*n-s;this.r=fc(o,s,t+1/3),this.g=fc(o,s,t),this.b=fc(o,s,t-1/3)}return te.toWorkingColorSpace(this,r),this}setStyle(t,e=Wn){function n(s){s!==void 0&&parseFloat(s)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let r;if(r=/^(\w+)\(([^\)]*)\)/.exec(t)){let s;const o=r[1],a=r[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(r=/^\#([A-Fa-f\d]+)$/.exec(t)){const s=r[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Wn){const n=km[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ys(t.r),this.g=ys(t.g),this.b=ys(t.b),this}copyLinearToSRGB(t){return this.r=Ql(t.r),this.g=Ql(t.g),this.b=Ql(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Wn){return te.fromWorkingColorSpace(ke.copy(this),t),Math.round(De(ke.r*255,0,255))*65536+Math.round(De(ke.g*255,0,255))*256+Math.round(De(ke.b*255,0,255))}getHexString(t=Wn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=te.workingColorSpace){te.fromWorkingColorSpace(ke.copy(this),e);const n=ke.r,r=ke.g,s=ke.b,o=Math.max(n,r,s),a=Math.min(n,r,s);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(r-s)/u+(r<s?6:0);break;case r:l=(s-n)/u+2;break;case s:l=(n-r)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=te.workingColorSpace){return te.fromWorkingColorSpace(ke.copy(this),e),t.r=ke.r,t.g=ke.g,t.b=ke.b,t}getStyle(t=Wn){te.fromWorkingColorSpace(ke.copy(this),t);const e=ke.r,n=ke.g,r=ke.b;return t!==Wn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${r.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(r*255)})`}offsetHSL(t,e,n){return this.getHSL(Pi),this.setHSL(Pi.h+t,Pi.s+e,Pi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Pi),t.getHSL(oa);const n=lo(Pi.h,oa.h,e),r=lo(Pi.s,oa.s,e),s=lo(Pi.l,oa.l,e);return this.setHSL(n,r,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,r=this.b,s=t.elements;return this.r=s[0]*e+s[3]*n+s[6]*r,this.g=s[1]*e+s[4]*n+s[7]*r,this.b=s[2]*e+s[5]*n+s[8]*r,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const ke=new Gt;Gt.NAMES=km;let TM=0;class Fr extends Nr{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:TM++}),this.uuid=Or(),this.name="",this.type="Material",this.blending=xs,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=jc,this.blendDst=Kc,this.blendEquation=pr,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Gt(0,0,0),this.blendAlpha=0,this.depthFunc=Ya,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gf,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Hr,this.stencilZFail=Hr,this.stencilZPass=Hr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const r=this[e];if(r===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}r&&r.isColor?r.set(n):r&&r.isVector3&&n&&n.isVector3?r.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==xs&&(n.blending=this.blending),this.side!==Xi&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==jc&&(n.blendSrc=this.blendSrc),this.blendDst!==Kc&&(n.blendDst=this.blendDst),this.blendEquation!==pr&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Ya&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Gf&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Hr&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Hr&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Hr&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function r(s){const o=[];for(const a in s){const l=s[a];delete l.metadata,o.push(l)}return o}if(e){const s=r(t.textures),o=r(t.images);s.length>0&&(n.textures=s),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const r=e.length;n=new Array(r);for(let s=0;s!==r;++s)n[s]=e[s].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class Rl extends Fr{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Gt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.combine=gu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Se=new O,aa=new ht;class ti{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Wf,this._updateRange={offset:0,count:-1},this.updateRanges=[],this.gpuType=gi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}get updateRange(){return co("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."),this._updateRange}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let r=0,s=this.itemSize;r<s;r++)this.array[t+r]=e.array[n+r];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)aa.fromBufferAttribute(this,e),aa.applyMatrix3(t),this.setXY(e,aa.x,aa.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix3(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyMatrix4(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.applyNormalMatrix(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Se.fromBufferAttribute(this,e),Se.transformDirection(t),this.setXYZ(e,Se.x,Se.y,Se.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=os(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Ye(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=os(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ye(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=os(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ye(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=os(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ye(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=os(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ye(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Ye(e,this.array),n=Ye(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,r){return t*=this.itemSize,this.normalized&&(e=Ye(e,this.array),n=Ye(n,this.array),r=Ye(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=r,this}setXYZW(t,e,n,r,s){return t*=this.itemSize,this.normalized&&(e=Ye(e,this.array),n=Ye(n,this.array),r=Ye(r,this.array),s=Ye(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=r,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Wf&&(t.usage=this.usage),t}}class Hm extends ti{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class Vm extends ti{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class ge extends ti{constructor(t,e,n){super(new Float32Array(t),e,n)}}let AM=0;const bn=new de,dc=new we,Zr=new O,un=new ko,qs=new ko,Le=new O;class Sn extends Nr{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:AM++}),this.uuid=Or(),this.name="",this.type="BufferGeometry",this.index=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Om(t)?Vm:Hm)(t,1):this.index=t,this}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const s=new Vt().getNormalMatrix(t);n.applyNormalMatrix(s),n.needsUpdate=!0}const r=this.attributes.tangent;return r!==void 0&&(r.transformDirection(t),r.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return bn.makeRotationFromQuaternion(t),this.applyMatrix4(bn),this}rotateX(t){return bn.makeRotationX(t),this.applyMatrix4(bn),this}rotateY(t){return bn.makeRotationY(t),this.applyMatrix4(bn),this}rotateZ(t){return bn.makeRotationZ(t),this.applyMatrix4(bn),this}translate(t,e,n){return bn.makeTranslation(t,e,n),this.applyMatrix4(bn),this}scale(t,e,n){return bn.makeScale(t,e,n),this.applyMatrix4(bn),this}lookAt(t){return dc.lookAt(t),dc.updateMatrix(),this.applyMatrix4(dc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Zr).negate(),this.translate(Zr.x,Zr.y,Zr.z),this}setFromPoints(t){const e=[];for(let n=0,r=t.length;n<r;n++){const s=t[n];e.push(s.x,s.y,s.z||0)}return this.setAttribute("position",new ge(e,3)),this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ko);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,r=e.length;n<r;n++){const s=e[n];un.setFromBufferAttribute(s),this.morphTargetsRelative?(Le.addVectors(this.boundingBox.min,un.min),this.boundingBox.expandByPoint(Le),Le.addVectors(this.boundingBox.max,un.max),this.boundingBox.expandByPoint(Le)):(this.boundingBox.expandByPoint(un.min),this.boundingBox.expandByPoint(un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Cl);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){const n=this.boundingSphere.center;if(un.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){const a=e[s];qs.setFromBufferAttribute(a),this.morphTargetsRelative?(Le.addVectors(un.min,qs.min),un.expandByPoint(Le),Le.addVectors(un.max,qs.max),un.expandByPoint(Le)):(un.expandByPoint(qs.min),un.expandByPoint(qs.max))}un.getCenter(n);let r=0;for(let s=0,o=t.count;s<o;s++)Le.fromBufferAttribute(t,s),r=Math.max(r,n.distanceToSquared(Le));if(e)for(let s=0,o=e.length;s<o;s++){const a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Le.fromBufferAttribute(a,c),l&&(Zr.fromBufferAttribute(t,c),Le.add(Zr)),r=Math.max(r,n.distanceToSquared(Le))}this.boundingSphere.radius=Math.sqrt(r),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,r=e.normal,s=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new ti(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let D=0;D<n.count;D++)a[D]=new O,l[D]=new O;const c=new O,h=new O,u=new O,f=new ht,d=new ht,g=new ht,_=new O,m=new O;function p(D,S,E){c.fromBufferAttribute(n,D),h.fromBufferAttribute(n,S),u.fromBufferAttribute(n,E),f.fromBufferAttribute(s,D),d.fromBufferAttribute(s,S),g.fromBufferAttribute(s,E),h.sub(c),u.sub(c),d.sub(f),g.sub(f);const I=1/(d.x*g.y-g.x*d.y);!isFinite(I)||(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-d.y).multiplyScalar(I),m.copy(u).multiplyScalar(d.x).addScaledVector(h,-g.x).multiplyScalar(I),a[D].add(_),a[S].add(_),a[E].add(_),l[D].add(m),l[S].add(m),l[E].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let D=0,S=y.length;D<S;++D){const E=y[D],I=E.start,G=E.count;for(let H=I,Z=I+G;H<Z;H+=3)p(t.getX(H+0),t.getX(H+1),t.getX(H+2))}const v=new O,M=new O,L=new O,w=new O;function C(D){L.fromBufferAttribute(r,D),w.copy(L);const S=a[D];v.copy(S),v.sub(L.multiplyScalar(L.dot(S))).normalize(),M.crossVectors(w,S);const I=M.dot(l[D])<0?-1:1;o.setXYZW(D,v.x,v.y,v.z,I)}for(let D=0,S=y.length;D<S;++D){const E=y[D],I=E.start,G=E.count;for(let H=I,Z=I+G;H<Z;H+=3)C(t.getX(H+0)),C(t.getX(H+1)),C(t.getX(H+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new ti(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const r=new O,s=new O,o=new O,a=new O,l=new O,c=new O,h=new O,u=new O;if(t)for(let f=0,d=t.count;f<d;f+=3){const g=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);r.fromBufferAttribute(e,g),s.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,d=e.count;f<d;f+=3)r.fromBufferAttribute(e,f+0),s.fromBufferAttribute(e,f+1),o.fromBufferAttribute(e,f+2),h.subVectors(o,s),u.subVectors(r,s),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Le.fromBufferAttribute(t,e),Le.normalize(),t.setXYZ(e,Le.x,Le.y,Le.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h);let d=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?d=l[_]*a.data.stride+a.offset:d=l[_]*h;for(let p=0;p<h;p++)f[g++]=c[d++]}return new ti(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Sn,n=this.index.array,r=this.attributes;for(const a in r){const l=r[a],c=t(l,n);e.setAttribute(a,c)}const s=this.morphAttributes;for(const a in s){const l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){const f=c[h],d=t(f,n);l.push(d)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const r={};let s=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){const d=c[u];h.push(d.toJSON(t.data))}h.length>0&&(r[l]=h,s=!0)}s&&(t.data.morphAttributes=r,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const r=t.attributes;for(const c in r){const h=r[c];this.setAttribute(c,h.clone(e))}const s=t.morphAttributes;for(const c in s){const h=[],u=s[c];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const sd=new de,sr=new wu,la=new Cl,od=new O,Jr=new O,Qr=new O,ts=new O,pc=new O,ca=new O,ha=new ht,ua=new ht,fa=new ht,ad=new O,ld=new O,cd=new O,da=new O,pa=new O;class be extends we{constructor(t=new Sn,e=new Rl){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const r=e[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){const n=this.geometry,r=n.attributes.position,s=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(r,t);const a=this.morphTargetInfluences;if(s&&a){ca.set(0,0,0);for(let l=0,c=s.length;l<c;l++){const h=a[l],u=s[l];h!==0&&(pc.fromBufferAttribute(u,t),o?ca.addScaledVector(pc,h):ca.addScaledVector(pc.sub(e),h))}e.add(ca)}return e}raycast(t,e){const n=this.geometry,r=this.material,s=this.matrixWorld;r!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),la.copy(n.boundingSphere),la.applyMatrix4(s),sr.copy(t.ray).recast(t.near),!(la.containsPoint(sr.origin)===!1&&(sr.intersectSphere(la,od)===null||sr.origin.distanceToSquared(od)>(t.far-t.near)**2))&&(sd.copy(s).invert(),sr.copy(t.ray).applyMatrix4(sd),!(n.boundingBox!==null&&sr.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,sr)))}_computeIntersections(t,e,n){let r;const s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,f=s.groups,d=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),v=Math.min(a.count,Math.min(m.start+m.count,d.start+d.count));for(let M=y,L=v;M<L;M+=3){const w=a.getX(M),C=a.getX(M+1),D=a.getX(M+2);r=ma(this,p,t,n,c,h,u,w,C,D),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,e.push(r))}}else{const g=Math.max(0,d.start),_=Math.min(a.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=a.getX(m),v=a.getX(m+1),M=a.getX(m+2);r=ma(this,o,t,n,c,h,u,y,v,M),r&&(r.faceIndex=Math.floor(m/3),e.push(r))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){const m=f[g],p=o[m.materialIndex],y=Math.max(m.start,d.start),v=Math.min(l.count,Math.min(m.start+m.count,d.start+d.count));for(let M=y,L=v;M<L;M+=3){const w=M,C=M+1,D=M+2;r=ma(this,p,t,n,c,h,u,w,C,D),r&&(r.faceIndex=Math.floor(M/3),r.face.materialIndex=m.materialIndex,e.push(r))}}else{const g=Math.max(0,d.start),_=Math.min(l.count,d.start+d.count);for(let m=g,p=_;m<p;m+=3){const y=m,v=m+1,M=m+2;r=ma(this,o,t,n,c,h,u,y,v,M),r&&(r.faceIndex=Math.floor(m/3),e.push(r))}}}}function wM(i,t,e,n,r,s,o,a){let l;if(t.side===Qe?l=n.intersectTriangle(o,s,r,!0,a):l=n.intersectTriangle(r,s,o,t.side===Xi,a),l===null)return null;pa.copy(a),pa.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(pa);return c<e.near||c>e.far?null:{distance:c,point:pa.clone(),object:i}}function ma(i,t,e,n,r,s,o,a,l,c){i.getVertexPosition(a,Jr),i.getVertexPosition(l,Qr),i.getVertexPosition(c,ts);const h=wM(i,t,e,n,Jr,Qr,ts,da);if(h){r&&(ha.fromBufferAttribute(r,a),ua.fromBufferAttribute(r,l),fa.fromBufferAttribute(r,c),h.uv=Kn.getInterpolation(da,Jr,Qr,ts,ha,ua,fa,new ht)),s&&(ha.fromBufferAttribute(s,a),ua.fromBufferAttribute(s,l),fa.fromBufferAttribute(s,c),h.uv1=Kn.getInterpolation(da,Jr,Qr,ts,ha,ua,fa,new ht)),o&&(ad.fromBufferAttribute(o,a),ld.fromBufferAttribute(o,l),cd.fromBufferAttribute(o,c),h.normal=Kn.getInterpolation(da,Jr,Qr,ts,ad,ld,cd,new O),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new O,materialIndex:0};Kn.getNormal(Jr,Qr,ts,u.normal),h.face=u}return h}class Bs extends Sn{constructor(t=1,e=1,n=1,r=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:r,heightSegments:s,depthSegments:o};const a=this;r=Math.floor(r),s=Math.floor(s),o=Math.floor(o);const l=[],c=[],h=[],u=[];let f=0,d=0;g("z","y","x",-1,-1,n,e,t,o,s,0),g("z","y","x",1,-1,n,e,-t,o,s,1),g("x","z","y",1,1,t,n,e,r,o,2),g("x","z","y",1,-1,t,n,-e,r,o,3),g("x","y","z",1,-1,t,e,n,r,s,4),g("x","y","z",-1,-1,t,e,-n,r,s,5),this.setIndex(l),this.setAttribute("position",new ge(c,3)),this.setAttribute("normal",new ge(h,3)),this.setAttribute("uv",new ge(u,2));function g(_,m,p,y,v,M,L,w,C,D,S){const E=M/C,I=L/D,G=M/2,H=L/2,Z=w/2,et=C+1,X=D+1;let $=0,Y=0;const ft=new O;for(let vt=0;vt<X;vt++){const mt=vt*I-H;for(let wt=0;wt<et;wt++){const Wt=wt*E-G;ft[_]=Wt*y,ft[m]=mt*v,ft[p]=Z,c.push(ft.x,ft.y,ft.z),ft[_]=0,ft[m]=0,ft[p]=w>0?1:-1,h.push(ft.x,ft.y,ft.z),u.push(wt/C),u.push(1-vt/D),$+=1}}for(let vt=0;vt<D;vt++)for(let mt=0;mt<C;mt++){const wt=f+mt+et*vt,Wt=f+mt+et*(vt+1),nt=f+(mt+1)+et*(vt+1),lt=f+(mt+1)+et*vt;l.push(wt,Wt,lt),l.push(Wt,nt,lt),Y+=6}a.addGroup(d,Y,S),d+=Y,f+=$}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Bs(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ds(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const r=i[e][n];r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)?r.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=r.clone():Array.isArray(r)?t[e][n]=r.slice():t[e][n]=r}}return t}function qe(i){const t={};for(let e=0;e<i.length;e++){const n=Ds(i[e]);for(const r in n)t[r]=n[r]}return t}function CM(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Gm(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:te.workingColorSpace}const RM={clone:Ds,merge:qe};var PM=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,LM=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Yi extends Fr{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=PM,this.fragmentShader=LM,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ds(t.uniforms),this.uniformsGroups=CM(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const r in this.uniforms){const o=this.uniforms[r].value;o&&o.isTexture?e.uniforms[r]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[r]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[r]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[r]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[r]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[r]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[r]={type:"m4",value:o.toArray()}:e.uniforms[r]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const r in this.extensions)this.extensions[r]===!0&&(n[r]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Wm extends we{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new de,this.projectionMatrix=new de,this.projectionMatrixInverse=new de,this.coordinateSystem=vi}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const Li=new O,hd=new ht,ud=new ht;class _n extends Wm{constructor(t=50,e=1,n=.1,r=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=r,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ls*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(ao*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ls*2*Math.atan(Math.tan(ao*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Li.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Li.x,Li.y).multiplyScalar(-t/Li.z),Li.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Li.x,Li.y).multiplyScalar(-t/Li.z)}getViewSize(t,e){return this.getViewBounds(t,hd,ud),e.subVectors(ud,hd)}setViewOffset(t,e,n,r,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(ao*.5*this.fov)/this.zoom,n=2*e,r=this.aspect*n,s=-.5*r;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*r/l,e-=o.offsetY*n/c,r*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+r,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const es=-90,ns=1;class DM extends we{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const r=new _n(es,ns,t,e);r.layers=this.layers,this.add(r);const s=new _n(es,ns,t,e);s.layers=this.layers,this.add(s);const o=new _n(es,ns,t,e);o.layers=this.layers,this.add(o);const a=new _n(es,ns,t,e);a.layers=this.layers,this.add(a);const l=new _n(es,ns,t,e);l.layers=this.layers,this.add(l);const c=new _n(es,ns,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,r,s,o,a,l]=e;for(const c of e)this.remove(c);if(t===vi)n.up.set(0,1,0),n.lookAt(1,0,0),r.up.set(0,1,0),r.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===$a)n.up.set(0,-1,0),n.lookAt(-1,0,0),r.up.set(0,-1,0),r.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:r}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[s,o,a,l,c,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),d=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,r),t.render(e,s),t.setRenderTarget(n,1,r),t.render(e,o),t.setRenderTarget(n,2,r),t.render(e,a),t.setRenderTarget(n,3,r),t.render(e,l),t.setRenderTarget(n,4,r),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,r),t.render(e,h),t.setRenderTarget(u,f,d),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Xm extends tn{constructor(t,e,n,r,s,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:ws,super(t,e,n,r,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class IM extends Cr{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},r=[n,n,n,n,n,n];this.texture=new Xm(r,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:On}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},r=new Bs(5,5,5),s=new Yi({name:"CubemapFromEquirect",uniforms:Ds(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Qe,blending:Hi});s.uniforms.tEquirect.value=e;const o=new be(r,s),a=e.minFilter;return e.minFilter===gr&&(e.minFilter=On),new DM(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,r){const s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,r);t.setRenderTarget(s)}}const mc=new O,UM=new O,NM=new Vt;class Ui{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,r){return this.normal.set(t,e,n),this.constant=r,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const r=mc.subVectors(n,e).cross(UM.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(r,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(mc),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const s=-(t.start.dot(this.normal)+this.constant)/r;return s<0||s>1?null:e.copy(t.start).addScaledVector(n,s)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||NM.getNormalMatrix(t),r=this.coplanarPoint(mc).applyMatrix4(t),s=this.normal.applyMatrix3(n).normalize();return this.constant=-r.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const or=new Cl,_a=new O;class Cu{constructor(t=new Ui,e=new Ui,n=new Ui,r=new Ui,s=new Ui,o=new Ui){this.planes=[t,e,n,r,s,o]}set(t,e,n,r,s,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(r),a[4].copy(s),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=vi){const n=this.planes,r=t.elements,s=r[0],o=r[1],a=r[2],l=r[3],c=r[4],h=r[5],u=r[6],f=r[7],d=r[8],g=r[9],_=r[10],m=r[11],p=r[12],y=r[13],v=r[14],M=r[15];if(n[0].setComponents(l-s,f-c,m-d,M-p).normalize(),n[1].setComponents(l+s,f+c,m+d,M+p).normalize(),n[2].setComponents(l+o,f+h,m+g,M+y).normalize(),n[3].setComponents(l-o,f-h,m-g,M-y).normalize(),n[4].setComponents(l-a,f-u,m-_,M-v).normalize(),e===vi)n[5].setComponents(l+a,f+u,m+_,M+v).normalize();else if(e===$a)n[5].setComponents(a,u,_,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),or.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),or.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(or)}intersectsSprite(t){return or.center.set(0,0,0),or.radius=.7071067811865476,or.applyMatrix4(t.matrixWorld),this.intersectsSphere(or)}intersectsSphere(t){const e=this.planes,n=t.center,r=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(n)<r)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const r=e[n];if(_a.x=r.normal.x>0?t.max.x:t.min.x,_a.y=r.normal.y>0?t.max.y:t.min.y,_a.z=r.normal.z>0?t.max.z:t.min.z,r.distanceToPoint(_a)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function Ym(){let i=null,t=!1,e=null,n=null;function r(s,o){e(s,o),n=i.requestAnimationFrame(r)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(r),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){i=s}}}function OM(i){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),a.onUploadCallback();let d;if(c instanceof Float32Array)d=i.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)d=i.SHORT;else if(c instanceof Uint32Array)d=i.UNSIGNED_INT;else if(c instanceof Int32Array)d=i.INT;else if(c instanceof Int8Array)d=i.BYTE;else if(c instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:d,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l._updateRange,f=l.updateRanges;if(i.bindBuffer(c,a),u.count===-1&&f.length===0&&i.bufferSubData(c,0,h),f.length!==0){for(let d=0,g=f.length;d<g;d++){const _=f[d];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}u.count!==-1&&(i.bufferSubData(c,u.offset*h.BYTES_PER_ELEMENT,h,u.offset,u.count),u.count=-1),l.onUploadCallback()}function r(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:r,remove:s,update:o}}class Ho extends Sn{constructor(t=1,e=1,n=1,r=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:r};const s=t/2,o=e/2,a=Math.floor(n),l=Math.floor(r),c=a+1,h=l+1,u=t/a,f=e/l,d=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const y=p*f-o;for(let v=0;v<c;v++){const M=v*u-s;g.push(M,-y,0),_.push(0,0,1),m.push(v/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){const v=y+c*p,M=y+c*(p+1),L=y+1+c*(p+1),w=y+1+c*p;d.push(v,M,w),d.push(M,L,w)}this.setIndex(d),this.setAttribute("position",new ge(g,3)),this.setAttribute("normal",new ge(_,3)),this.setAttribute("uv",new ge(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ho(t.width,t.height,t.widthSegments,t.heightSegments)}}var FM=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,BM=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,zM=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,kM=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,HM=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,VM=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,GM=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,WM=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,XM=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,YM=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,qM=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jM=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,KM=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,$M=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,ZM=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,JM=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,QM=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,ty=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ey=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ny=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,iy=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,ry=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,sy=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,oy=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,ay=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,ly=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,cy=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,hy=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uy=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,fy=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dy="gl_FragColor = linearToOutputTexel( gl_FragColor );",py=`
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);
vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}
vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}
vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,my=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,_y=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,gy=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,vy=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xy=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,My=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,yy=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Sy=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ey=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,by=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Ty=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ay=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,wy=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Cy=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Ry=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Py=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Ly=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Dy=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Iy=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Uy=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Ny=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Oy=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Fy=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,By=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,zy=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ky=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Hy=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vy=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Gy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Yy=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,qy=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,jy=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Ky=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,$y=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Zy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jy=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Qy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tS=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,eS=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,nS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,iS=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rS=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,sS=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,oS=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,aS=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,lS=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,cS=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,hS=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,uS=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,fS=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,dS=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pS=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mS=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,_S=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,gS=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,vS=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,xS=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,MS=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,yS=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,SS=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ES=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,bS=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,TS=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,AS=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,wS=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,CS=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,RS=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,PS=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,LS=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,DS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,IS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,US=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,NS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const OS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,FS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,BS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,kS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,HS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,VS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,GS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,WS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,XS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,YS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,qS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jS=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,KS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$S=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ZS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,JS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,QS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,tE=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,eE=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,nE=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,iE=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,rE=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,sE=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,oE=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,aE=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lE=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cE=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hE=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,uE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,fE=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,dE=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,pE=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,mE=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ht={alphahash_fragment:FM,alphahash_pars_fragment:BM,alphamap_fragment:zM,alphamap_pars_fragment:kM,alphatest_fragment:HM,alphatest_pars_fragment:VM,aomap_fragment:GM,aomap_pars_fragment:WM,batching_pars_vertex:XM,batching_vertex:YM,begin_vertex:qM,beginnormal_vertex:jM,bsdfs:KM,iridescence_fragment:$M,bumpmap_pars_fragment:ZM,clipping_planes_fragment:JM,clipping_planes_pars_fragment:QM,clipping_planes_pars_vertex:ty,clipping_planes_vertex:ey,color_fragment:ny,color_pars_fragment:iy,color_pars_vertex:ry,color_vertex:sy,common:oy,cube_uv_reflection_fragment:ay,defaultnormal_vertex:ly,displacementmap_pars_vertex:cy,displacementmap_vertex:hy,emissivemap_fragment:uy,emissivemap_pars_fragment:fy,colorspace_fragment:dy,colorspace_pars_fragment:py,envmap_fragment:my,envmap_common_pars_fragment:_y,envmap_pars_fragment:gy,envmap_pars_vertex:vy,envmap_physical_pars_fragment:Ry,envmap_vertex:xy,fog_vertex:My,fog_pars_vertex:yy,fog_fragment:Sy,fog_pars_fragment:Ey,gradientmap_pars_fragment:by,lightmap_pars_fragment:Ty,lights_lambert_fragment:Ay,lights_lambert_pars_fragment:wy,lights_pars_begin:Cy,lights_toon_fragment:Py,lights_toon_pars_fragment:Ly,lights_phong_fragment:Dy,lights_phong_pars_fragment:Iy,lights_physical_fragment:Uy,lights_physical_pars_fragment:Ny,lights_fragment_begin:Oy,lights_fragment_maps:Fy,lights_fragment_end:By,logdepthbuf_fragment:zy,logdepthbuf_pars_fragment:ky,logdepthbuf_pars_vertex:Hy,logdepthbuf_vertex:Vy,map_fragment:Gy,map_pars_fragment:Wy,map_particle_fragment:Xy,map_particle_pars_fragment:Yy,metalnessmap_fragment:qy,metalnessmap_pars_fragment:jy,morphinstance_vertex:Ky,morphcolor_vertex:$y,morphnormal_vertex:Zy,morphtarget_pars_vertex:Jy,morphtarget_vertex:Qy,normal_fragment_begin:tS,normal_fragment_maps:eS,normal_pars_fragment:nS,normal_pars_vertex:iS,normal_vertex:rS,normalmap_pars_fragment:sS,clearcoat_normal_fragment_begin:oS,clearcoat_normal_fragment_maps:aS,clearcoat_pars_fragment:lS,iridescence_pars_fragment:cS,opaque_fragment:hS,packing:uS,premultiplied_alpha_fragment:fS,project_vertex:dS,dithering_fragment:pS,dithering_pars_fragment:mS,roughnessmap_fragment:_S,roughnessmap_pars_fragment:gS,shadowmap_pars_fragment:vS,shadowmap_pars_vertex:xS,shadowmap_vertex:MS,shadowmask_pars_fragment:yS,skinbase_vertex:SS,skinning_pars_vertex:ES,skinning_vertex:bS,skinnormal_vertex:TS,specularmap_fragment:AS,specularmap_pars_fragment:wS,tonemapping_fragment:CS,tonemapping_pars_fragment:RS,transmission_fragment:PS,transmission_pars_fragment:LS,uv_pars_fragment:DS,uv_pars_vertex:IS,uv_vertex:US,worldpos_vertex:NS,background_vert:OS,background_frag:FS,backgroundCube_vert:BS,backgroundCube_frag:zS,cube_vert:kS,cube_frag:HS,depth_vert:VS,depth_frag:GS,distanceRGBA_vert:WS,distanceRGBA_frag:XS,equirect_vert:YS,equirect_frag:qS,linedashed_vert:jS,linedashed_frag:KS,meshbasic_vert:$S,meshbasic_frag:ZS,meshlambert_vert:JS,meshlambert_frag:QS,meshmatcap_vert:tE,meshmatcap_frag:eE,meshnormal_vert:nE,meshnormal_frag:iE,meshphong_vert:rE,meshphong_frag:sE,meshphysical_vert:oE,meshphysical_frag:aE,meshtoon_vert:lE,meshtoon_frag:cE,points_vert:hE,points_frag:uE,shadow_vert:fE,shadow_frag:dE,sprite_vert:pE,sprite_frag:mE},xt={common:{diffuse:{value:new Gt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Vt}},envmap:{envMap:{value:null},envMapRotation:{value:new Vt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Vt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Vt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Vt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Vt},normalScale:{value:new ht(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Vt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Vt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Vt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Vt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Gt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Gt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0},uvTransform:{value:new Vt}},sprite:{diffuse:{value:new Gt(16777215)},opacity:{value:1},center:{value:new ht(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Vt},alphaMap:{value:null},alphaMapTransform:{value:new Vt},alphaTest:{value:0}}},qn={basic:{uniforms:qe([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.fog]),vertexShader:Ht.meshbasic_vert,fragmentShader:Ht.meshbasic_frag},lambert:{uniforms:qe([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Ht.meshlambert_vert,fragmentShader:Ht.meshlambert_frag},phong:{uniforms:qe([xt.common,xt.specularmap,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,xt.lights,{emissive:{value:new Gt(0)},specular:{value:new Gt(1118481)},shininess:{value:30}}]),vertexShader:Ht.meshphong_vert,fragmentShader:Ht.meshphong_frag},standard:{uniforms:qe([xt.common,xt.envmap,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.roughnessmap,xt.metalnessmap,xt.fog,xt.lights,{emissive:{value:new Gt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag},toon:{uniforms:qe([xt.common,xt.aomap,xt.lightmap,xt.emissivemap,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.gradientmap,xt.fog,xt.lights,{emissive:{value:new Gt(0)}}]),vertexShader:Ht.meshtoon_vert,fragmentShader:Ht.meshtoon_frag},matcap:{uniforms:qe([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,xt.fog,{matcap:{value:null}}]),vertexShader:Ht.meshmatcap_vert,fragmentShader:Ht.meshmatcap_frag},points:{uniforms:qe([xt.points,xt.fog]),vertexShader:Ht.points_vert,fragmentShader:Ht.points_frag},dashed:{uniforms:qe([xt.common,xt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ht.linedashed_vert,fragmentShader:Ht.linedashed_frag},depth:{uniforms:qe([xt.common,xt.displacementmap]),vertexShader:Ht.depth_vert,fragmentShader:Ht.depth_frag},normal:{uniforms:qe([xt.common,xt.bumpmap,xt.normalmap,xt.displacementmap,{opacity:{value:1}}]),vertexShader:Ht.meshnormal_vert,fragmentShader:Ht.meshnormal_frag},sprite:{uniforms:qe([xt.sprite,xt.fog]),vertexShader:Ht.sprite_vert,fragmentShader:Ht.sprite_frag},background:{uniforms:{uvTransform:{value:new Vt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ht.background_vert,fragmentShader:Ht.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Vt}},vertexShader:Ht.backgroundCube_vert,fragmentShader:Ht.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ht.cube_vert,fragmentShader:Ht.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ht.equirect_vert,fragmentShader:Ht.equirect_frag},distanceRGBA:{uniforms:qe([xt.common,xt.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ht.distanceRGBA_vert,fragmentShader:Ht.distanceRGBA_frag},shadow:{uniforms:qe([xt.lights,xt.fog,{color:{value:new Gt(0)},opacity:{value:1}}]),vertexShader:Ht.shadow_vert,fragmentShader:Ht.shadow_frag}};qn.physical={uniforms:qe([qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Vt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Vt},clearcoatNormalScale:{value:new ht(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Vt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Vt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Vt},sheen:{value:0},sheenColor:{value:new Gt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Vt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Vt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Vt},transmissionSamplerSize:{value:new ht},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Vt},attenuationDistance:{value:0},attenuationColor:{value:new Gt(0)},specularColor:{value:new Gt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Vt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Vt},anisotropyVector:{value:new ht},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Vt}}]),vertexShader:Ht.meshphysical_vert,fragmentShader:Ht.meshphysical_frag};const ga={r:0,b:0,g:0},ar=new kn,_E=new de;function gE(i,t,e,n,r,s,o){const a=new Gt(0);let l=s===!0?0:1,c,h,u=null,f=0,d=null;function g(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?e:t).get(v)),v}function _(y){let v=!1;const M=g(y);M===null?p(a,l):M&&M.isColor&&(p(M,1),v=!0);const L=i.xr.getEnvironmentBlendMode();L==="additive"?n.buffers.color.setClear(0,0,0,1,o):L==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(y,v){const M=g(v);M&&(M.isCubeTexture||M.mapping===Al)?(h===void 0&&(h=new be(new Bs(1,1,1),new Yi({name:"BackgroundCubeMaterial",uniforms:Ds(qn.backgroundCube.uniforms),vertexShader:qn.backgroundCube.vertexShader,fragmentShader:qn.backgroundCube.fragmentShader,side:Qe,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(L,w,C){this.matrixWorld.copyPosition(C.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),r.update(h)),ar.copy(v.backgroundRotation),ar.x*=-1,ar.y*=-1,ar.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(ar.y*=-1,ar.z*=-1),h.material.uniforms.envMap.value=M,h.material.uniforms.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(_E.makeRotationFromEuler(ar)),h.material.toneMapped=te.getTransfer(M.colorSpace)!==le,(u!==M||f!==M.version||d!==i.toneMapping)&&(h.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):M&&M.isTexture&&(c===void 0&&(c=new be(new Ho(2,2),new Yi({name:"BackgroundMaterial",uniforms:Ds(qn.background.uniforms),vertexShader:qn.background.vertexShader,fragmentShader:qn.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),r.update(c)),c.material.uniforms.t2D.value=M,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=te.getTransfer(M.colorSpace)!==le,M.matrixAutoUpdate===!0&&M.updateMatrix(),c.material.uniforms.uvTransform.value.copy(M.matrix),(u!==M||f!==M.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,u=M,f=M.version,d=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,v){y.getRGB(ga,Gm(i)),n.buffers.color.setClear(ga.r,ga.g,ga.b,v,o)}return{getClearColor:function(){return a},setClearColor:function(y,v=1){a.set(y),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:_,addToRenderList:m}}function vE(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},r=f(null);let s=r,o=!1;function a(E,I,G,H,Z){let et=!1;const X=u(H,G,I);s!==X&&(s=X,c(s.object)),et=d(E,H,G,Z),et&&g(E,H,G,Z),Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(et||o)&&(o=!1,M(E,I,G,H),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function l(){return i.createVertexArray()}function c(E){return i.bindVertexArray(E)}function h(E){return i.deleteVertexArray(E)}function u(E,I,G){const H=G.wireframe===!0;let Z=n[E.id];Z===void 0&&(Z={},n[E.id]=Z);let et=Z[I.id];et===void 0&&(et={},Z[I.id]=et);let X=et[H];return X===void 0&&(X=f(l()),et[H]=X),X}function f(E){const I=[],G=[],H=[];for(let Z=0;Z<e;Z++)I[Z]=0,G[Z]=0,H[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:G,attributeDivisors:H,object:E,attributes:{},index:null}}function d(E,I,G,H){const Z=s.attributes,et=I.attributes;let X=0;const $=G.getAttributes();for(const Y in $)if($[Y].location>=0){const vt=Z[Y];let mt=et[Y];if(mt===void 0&&(Y==="instanceMatrix"&&E.instanceMatrix&&(mt=E.instanceMatrix),Y==="instanceColor"&&E.instanceColor&&(mt=E.instanceColor)),vt===void 0||vt.attribute!==mt||mt&&vt.data!==mt.data)return!0;X++}return s.attributesNum!==X||s.index!==H}function g(E,I,G,H){const Z={},et=I.attributes;let X=0;const $=G.getAttributes();for(const Y in $)if($[Y].location>=0){let vt=et[Y];vt===void 0&&(Y==="instanceMatrix"&&E.instanceMatrix&&(vt=E.instanceMatrix),Y==="instanceColor"&&E.instanceColor&&(vt=E.instanceColor));const mt={};mt.attribute=vt,vt&&vt.data&&(mt.data=vt.data),Z[Y]=mt,X++}s.attributes=Z,s.attributesNum=X,s.index=H}function _(){const E=s.newAttributes;for(let I=0,G=E.length;I<G;I++)E[I]=0}function m(E){p(E,0)}function p(E,I){const G=s.newAttributes,H=s.enabledAttributes,Z=s.attributeDivisors;G[E]=1,H[E]===0&&(i.enableVertexAttribArray(E),H[E]=1),Z[E]!==I&&(i.vertexAttribDivisor(E,I),Z[E]=I)}function y(){const E=s.newAttributes,I=s.enabledAttributes;for(let G=0,H=I.length;G<H;G++)I[G]!==E[G]&&(i.disableVertexAttribArray(G),I[G]=0)}function v(E,I,G,H,Z,et,X){X===!0?i.vertexAttribIPointer(E,I,G,Z,et):i.vertexAttribPointer(E,I,G,H,Z,et)}function M(E,I,G,H){_();const Z=H.attributes,et=G.getAttributes(),X=I.defaultAttributeValues;for(const $ in et){const Y=et[$];if(Y.location>=0){let ft=Z[$];if(ft===void 0&&($==="instanceMatrix"&&E.instanceMatrix&&(ft=E.instanceMatrix),$==="instanceColor"&&E.instanceColor&&(ft=E.instanceColor)),ft!==void 0){const vt=ft.normalized,mt=ft.itemSize,wt=t.get(ft);if(wt===void 0)continue;const Wt=wt.buffer,nt=wt.type,lt=wt.bytesPerElement,yt=nt===i.INT||nt===i.UNSIGNED_INT||ft.gpuType===vu;if(ft.isInterleavedBufferAttribute){const _t=ft.data,Rt=_t.stride,It=ft.offset;if(_t.isInstancedInterleavedBuffer){for(let Lt=0;Lt<Y.locationSize;Lt++)p(Y.location+Lt,_t.meshPerAttribute);E.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=_t.meshPerAttribute*_t.count)}else for(let Lt=0;Lt<Y.locationSize;Lt++)m(Y.location+Lt);i.bindBuffer(i.ARRAY_BUFFER,Wt);for(let Lt=0;Lt<Y.locationSize;Lt++)v(Y.location+Lt,mt/Y.locationSize,nt,vt,Rt*lt,(It+mt/Y.locationSize*Lt)*lt,yt)}else{if(ft.isInstancedBufferAttribute){for(let _t=0;_t<Y.locationSize;_t++)p(Y.location+_t,ft.meshPerAttribute);E.isInstancedMesh!==!0&&H._maxInstanceCount===void 0&&(H._maxInstanceCount=ft.meshPerAttribute*ft.count)}else for(let _t=0;_t<Y.locationSize;_t++)m(Y.location+_t);i.bindBuffer(i.ARRAY_BUFFER,Wt);for(let _t=0;_t<Y.locationSize;_t++)v(Y.location+_t,mt/Y.locationSize,nt,vt,mt*lt,mt/Y.locationSize*_t*lt,yt)}}else if(X!==void 0){const vt=X[$];if(vt!==void 0)switch(vt.length){case 2:i.vertexAttrib2fv(Y.location,vt);break;case 3:i.vertexAttrib3fv(Y.location,vt);break;case 4:i.vertexAttrib4fv(Y.location,vt);break;default:i.vertexAttrib1fv(Y.location,vt)}}}}y()}function L(){D();for(const E in n){const I=n[E];for(const G in I){const H=I[G];for(const Z in H)h(H[Z].object),delete H[Z];delete I[G]}delete n[E]}}function w(E){if(n[E.id]===void 0)return;const I=n[E.id];for(const G in I){const H=I[G];for(const Z in H)h(H[Z].object),delete H[Z];delete I[G]}delete n[E.id]}function C(E){for(const I in n){const G=n[I];if(G[E.id]===void 0)continue;const H=G[E.id];for(const Z in H)h(H[Z].object),delete H[Z];delete G[E.id]}}function D(){S(),o=!0,s!==r&&(s=r,c(s.object))}function S(){r.geometry=null,r.program=null,r.wireframe=!1}return{setup:a,reset:D,resetDefaultState:S,dispose:L,releaseStatesOfGeometry:w,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function xE(i,t,e){let n;function r(c){n=c}function s(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),e.update(h,n,u))}function a(c,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let d=0;for(let g=0;g<u;g++)d+=h[g];e.update(d,n,1)}function l(c,h,u,f){if(u===0)return;const d=t.get("WEBGL_multi_draw");if(d===null)for(let g=0;g<c.length;g++)o(c[g],h[g],f[g]);else{d.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_];for(let _=0;_<f.length;_++)e.update(g,n,f[_])}}this.setMode=r,this.render=s,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function ME(i,t,e,n){let r;function s(){if(r!==void 0)return r;if(t.has("EXT_texture_filter_anisotropic")===!0){const w=t.get("EXT_texture_filter_anisotropic");r=i.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else r=0;return r}function o(w){return!(w!==Fn&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const C=w===zo&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==Mi&&n.convert(w)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==gi&&!C)}function l(w){if(w==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=e.logarithmicDepthBuffer===!0,f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),d=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_TEXTURE_SIZE),_=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),p=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=d>0,L=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,maxTextures:f,maxVertexTextures:d,maxTextureSize:g,maxCubemapSize:_,maxAttributes:m,maxVertexUniforms:p,maxVaryings:y,maxFragmentUniforms:v,vertexTextures:M,maxSamples:L}}function yE(i){const t=this;let e=null,n=0,r=!1,s=!1;const o=new Ui,a=new Vt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||r;return r=f,n=u.length,d},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,d){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!r||g===null||g.length===0||s&&!m)s?h(null):c();else{const y=s?0:n,v=y*4;let M=p.clippingState||null;l.value=M,M=h(g,f,v,d);for(let L=0;L!==v;++L)M[L]=e[L];p.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,f,d,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=d+_*4,y=f.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let v=0,M=d;v!==_;++v,M+=4)o.copy(u[v]).applyMatrix4(y,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function SE(i){let t=new WeakMap;function e(o,a){return a===$c?o.mapping=ws:a===Zc&&(o.mapping=Cs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===$c||a===Zc)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new IM(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",r),e(c.texture,o.mapping)}else return null}}return o}function r(o){const a=o.target;a.removeEventListener("dispose",r);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function s(){t=new WeakMap}return{get:n,dispose:s}}class qm extends Wm{constructor(t=-1,e=1,n=1,r=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=r,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,r,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=r,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,r=(this.top+this.bottom)/2;let s=n-t,o=n+t,a=r+e,l=r-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const ls=4,fd=[.125,.215,.35,.446,.526,.582],mr=20,_c=new qm,dd=new Gt;let gc=null,vc=0,xc=0,Mc=!1;const fr=(1+Math.sqrt(5))/2,is=1/fr,pd=[new O(-fr,is,0),new O(fr,is,0),new O(-is,0,fr),new O(is,0,fr),new O(0,fr,-is),new O(0,fr,is),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)];class md{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,r=100){gc=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),xc=this._renderer.getActiveMipmapLevel(),Mc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const s=this._allocateTargets();return s.depthBuffer=!0,this._sceneToCubeUV(t,n,r,s),e>0&&this._blur(s,0,0,e),this._applyPMREM(s),this._cleanup(s),s}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=gd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(gc,vc,xc),this._renderer.xr.enabled=Mc,t.scissorTest=!1,va(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ws||t.mapping===Cs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),gc=this._renderer.getRenderTarget(),vc=this._renderer.getActiveCubeFace(),xc=this._renderer.getActiveMipmapLevel(),Mc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:On,minFilter:On,generateMipmaps:!1,type:zo,format:Fn,colorSpace:Ji,depthBuffer:!1},r=_d(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=_d(t,e,n);const{_lodMax:s}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=EE(s)),this._blurMaterial=bE(s,t,e)}return r}_compileMaterial(t){const e=new be(this._lodPlanes[0],t);this._renderer.compile(e,_c)}_sceneToCubeUV(t,e,n,r){const a=new _n(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,u=h.autoClear,f=h.toneMapping;h.getClearColor(dd),h.toneMapping=Vi,h.autoClear=!1;const d=new Rl({name:"PMREM.Background",side:Qe,depthWrite:!1,depthTest:!1}),g=new be(new Bs,d);let _=!1;const m=t.background;m?m.isColor&&(d.color.copy(m),t.background=null,_=!0):(d.color.copy(dd),_=!0);for(let p=0;p<6;p++){const y=p%3;y===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):y===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const v=this._cubeSize;va(r,y*v,p>2?v:0,v,v),h.setRenderTarget(r),_&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=f,h.autoClear=u,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,r=t.mapping===ws||t.mapping===Cs;r?(this._cubemapMaterial===null&&(this._cubemapMaterial=vd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=gd());const s=r?this._cubemapMaterial:this._equirectMaterial,o=new be(this._lodPlanes[0],s),a=s.uniforms;a.envMap.value=t;const l=this._cubeSize;va(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,_c)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const r=this._lodPlanes.length;for(let s=1;s<r;s++){const o=Math.sqrt(this._sigmas[s]*this._sigmas[s]-this._sigmas[s-1]*this._sigmas[s-1]),a=pd[(r-s-1)%pd.length];this._blur(t,s-1,s,o,a)}e.autoClear=n}_blur(t,e,n,r,s){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,r,"latitudinal",s),this._halfBlur(o,t,n,n,r,"longitudinal",s)}_halfBlur(t,e,n,r,s,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new be(this._lodPlanes[r],c),f=c.uniforms,d=this._sizeLods[n]-1,g=isFinite(s)?Math.PI/(2*d):2*Math.PI/(2*mr-1),_=s/g,m=isFinite(s)?1+Math.floor(h*_):mr;m>mr&&console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${mr}`);const p=[];let y=0;for(let C=0;C<mr;++C){const D=C/_,S=Math.exp(-D*D/2);p.push(S),C===0?y+=S:C<m&&(y+=2*S)}for(let C=0;C<p.length;C++)p[C]=p[C]/y;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=p,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:v}=this;f.dTheta.value=g,f.mipInt.value=v-n;const M=this._sizeLods[r],L=3*M*(r>v-ls?r-v+ls:0),w=4*(this._cubeSize-M);va(e,L,w,3*M,2*M),l.setRenderTarget(e),l.render(u,_c)}}function EE(i){const t=[],e=[],n=[];let r=i;const s=i-ls+1+fd.length;for(let o=0;o<s;o++){const a=Math.pow(2,r);e.push(a);let l=1/a;o>i-ls?l=fd[o-i+ls-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,g=6,_=3,m=2,p=1,y=new Float32Array(_*g*d),v=new Float32Array(m*g*d),M=new Float32Array(p*g*d);for(let w=0;w<d;w++){const C=w%3*2/3-1,D=w>2?0:-1,S=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];y.set(S,_*g*w),v.set(f,m*g*w);const E=[w,w,w,w,w,w];M.set(E,p*g*w)}const L=new Sn;L.setAttribute("position",new ti(y,_)),L.setAttribute("uv",new ti(v,m)),L.setAttribute("faceIndex",new ti(M,p)),t.push(L),r>ls&&r--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function _d(i,t,e){const n=new Cr(i,t,e);return n.texture.mapping=Al,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function va(i,t,e,n,r){i.viewport.set(t,e,n,r),i.scissor.set(t,e,n,r)}function bE(i,t,e){const n=new Float32Array(mr),r=new O(0,1,0);return new Yi({name:"SphericalGaussianBlur",defines:{n:mr,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:r}},vertexShader:Ru(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Hi,depthTest:!1,depthWrite:!1})}function gd(){return new Yi({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ru(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Hi,depthTest:!1,depthWrite:!1})}function vd(){return new Yi({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ru(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Hi,depthTest:!1,depthWrite:!1})}function Ru(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function TE(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===$c||l===Zc,h=l===ws||l===Cs;if(c||h){let u=t.get(a);const f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return e===null&&(e=new md(i)),u=c?e.fromEquirectangular(a,u):e.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),u.texture;if(u!==void 0)return u.texture;{const d=a.image;return c&&d&&d.height>0||h&&d&&r(d)?(e===null&&(e=new md(i)),u=c?e.fromEquirectangular(a):e.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,t.set(a,u),a.addEventListener("dispose",s),u.texture):null}}}return a}function r(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function s(a){const l=a.target;l.removeEventListener("dispose",s);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function AE(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let r;switch(n){case"WEBGL_depth_texture":r=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":r=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":r=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":r=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:r=i.getExtension(n)}return t[n]=r,r}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const r=e(n);return r===null&&co("THREE.WebGLRenderer: "+n+" extension not supported."),r}}}function wE(i,t,e,n){const r={},s=new WeakMap;function o(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);for(const g in f.morphAttributes){const _=f.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)t.remove(_[m])}f.removeEventListener("dispose",o),delete r[f.id];const d=s.get(f);d&&(t.remove(d),s.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function a(u,f){return r[f.id]===!0||(f.addEventListener("dispose",o),r[f.id]=!0,e.memory.geometries++),f}function l(u){const f=u.attributes;for(const g in f)t.update(f[g],i.ARRAY_BUFFER);const d=u.morphAttributes;for(const g in d){const _=d[g];for(let m=0,p=_.length;m<p;m++)t.update(_[m],i.ARRAY_BUFFER)}}function c(u){const f=[],d=u.index,g=u.attributes.position;let _=0;if(d!==null){const y=d.array;_=d.version;for(let v=0,M=y.length;v<M;v+=3){const L=y[v+0],w=y[v+1],C=y[v+2];f.push(L,w,w,C,C,L)}}else if(g!==void 0){const y=g.array;_=g.version;for(let v=0,M=y.length/3-1;v<M;v+=3){const L=v+0,w=v+1,C=v+2;f.push(L,w,w,C,C,L)}}else return;const m=new(Om(f)?Vm:Hm)(f,1);m.version=_;const p=s.get(u);p&&t.remove(p),s.set(u,m)}function h(u){const f=s.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function CE(i,t,e){let n;function r(f){n=f}let s,o;function a(f){s=f.type,o=f.bytesPerElement}function l(f,d){i.drawElements(n,d,s,f*o),e.update(d,n,1)}function c(f,d,g){g!==0&&(i.drawElementsInstanced(n,d,s,f*o,g),e.update(d,n,g))}function h(f,d,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,s,f,0,g);let m=0;for(let p=0;p<g;p++)m+=d[p];e.update(m,n,1)}function u(f,d,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<f.length;p++)c(f[p]/o,d[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,d,0,s,f,0,_,0,g);let p=0;for(let y=0;y<g;y++)p+=d[y];for(let y=0;y<_.length;y++)e.update(p,n,_[y])}}this.setMode=r,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function RE(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(s,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(s/3);break;case i.LINES:e.lines+=a*(s/2);break;case i.LINE_STRIP:e.lines+=a*(s-1);break;case i.LINE_LOOP:e.lines+=a*s;break;case i.POINTS:e.points+=a*s;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function r(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:r,update:n}}function PE(i,t,e){const n=new WeakMap,r=new Ae;function s(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(a);if(f===void 0||f.count!==u){let E=function(){D.dispose(),n.delete(a),a.removeEventListener("dispose",E)};var d=E;f!==void 0&&f.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let M=0;g===!0&&(M=1),_===!0&&(M=2),m===!0&&(M=3);let L=a.attributes.position.count*M,w=1;L>t.maxTextureSize&&(w=Math.ceil(L/t.maxTextureSize),L=t.maxTextureSize);const C=new Float32Array(L*w*4*u),D=new Bm(C,L,w,u);D.type=gi,D.needsUpdate=!0;const S=M*4;for(let I=0;I<u;I++){const G=p[I],H=y[I],Z=v[I],et=L*w*4*I;for(let X=0;X<G.count;X++){const $=X*S;g===!0&&(r.fromBufferAttribute(G,X),C[et+$+0]=r.x,C[et+$+1]=r.y,C[et+$+2]=r.z,C[et+$+3]=0),_===!0&&(r.fromBufferAttribute(H,X),C[et+$+4]=r.x,C[et+$+5]=r.y,C[et+$+6]=r.z,C[et+$+7]=0),m===!0&&(r.fromBufferAttribute(Z,X),C[et+$+8]=r.x,C[et+$+9]=r.y,C[et+$+10]=r.z,C[et+$+11]=Z.itemSize===4?r.w:1)}}f={count:u,texture:D,size:new ht(L,w)},n.set(a,f),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:s}}function LE(i,t,e,n){let r=new WeakMap;function s(l){const c=n.render.frame,h=l.geometry,u=t.get(l,h);if(r.get(u)!==c&&(t.update(u),r.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),r.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,c))),l.isSkinnedMesh){const f=l.skeleton;r.get(f)!==c&&(f.update(),r.set(f,c))}return u}function o(){r=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:s,dispose:o}}class jm extends tn{constructor(t,e,n,r,s,o,a,l,c,h=Ms){if(h!==Ms&&h!==Ps)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===Ms&&(n=wr),n===void 0&&h===Ps&&(n=Rs),super(null,r,s,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:wn,this.minFilter=l!==void 0?l:wn,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Km=new tn,xd=new jm(1,1),$m=new Bm,Zm=new gM,Jm=new Xm,Md=[],yd=[],Sd=new Float32Array(16),Ed=new Float32Array(9),bd=new Float32Array(4);function zs(i,t,e){const n=i[0];if(n<=0||n>0)return i;const r=t*e;let s=Md[r];if(s===void 0&&(s=new Float32Array(r),Md[r]=s),t!==0){n.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(s,a)}return s}function Re(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Pe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Pl(i,t){let e=yd[t];e===void 0&&(e=new Int32Array(t),yd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function DE(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function IE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2fv(this.addr,t),Pe(e,t)}}function UE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Re(e,t))return;i.uniform3fv(this.addr,t),Pe(e,t)}}function NE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4fv(this.addr,t),Pe(e,t)}}function OE(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Pe(e,t)}else{if(Re(e,n))return;bd.set(n),i.uniformMatrix2fv(this.addr,!1,bd),Pe(e,n)}}function FE(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Pe(e,t)}else{if(Re(e,n))return;Ed.set(n),i.uniformMatrix3fv(this.addr,!1,Ed),Pe(e,n)}}function BE(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Pe(e,t)}else{if(Re(e,n))return;Sd.set(n),i.uniformMatrix4fv(this.addr,!1,Sd),Pe(e,n)}}function zE(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function kE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2iv(this.addr,t),Pe(e,t)}}function HE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Re(e,t))return;i.uniform3iv(this.addr,t),Pe(e,t)}}function VE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4iv(this.addr,t),Pe(e,t)}}function GE(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function WE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2uiv(this.addr,t),Pe(e,t)}}function XE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Re(e,t))return;i.uniform3uiv(this.addr,t),Pe(e,t)}}function YE(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4uiv(this.addr,t),Pe(e,t)}}function qE(i,t,e){const n=this.cache,r=e.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r);let s;this.type===i.SAMPLER_2D_SHADOW?(xd.compareFunction=Nm,s=xd):s=Km,e.setTexture2D(t||s,r)}function jE(i,t,e){const n=this.cache,r=e.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),e.setTexture3D(t||Zm,r)}function KE(i,t,e){const n=this.cache,r=e.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),e.setTextureCube(t||Jm,r)}function $E(i,t,e){const n=this.cache,r=e.allocateTextureUnit();n[0]!==r&&(i.uniform1i(this.addr,r),n[0]=r),e.setTexture2DArray(t||$m,r)}function ZE(i){switch(i){case 5126:return DE;case 35664:return IE;case 35665:return UE;case 35666:return NE;case 35674:return OE;case 35675:return FE;case 35676:return BE;case 5124:case 35670:return zE;case 35667:case 35671:return kE;case 35668:case 35672:return HE;case 35669:case 35673:return VE;case 5125:return GE;case 36294:return WE;case 36295:return XE;case 36296:return YE;case 35678:case 36198:case 36298:case 36306:case 35682:return qE;case 35679:case 36299:case 36307:return jE;case 35680:case 36300:case 36308:case 36293:return KE;case 36289:case 36303:case 36311:case 36292:return $E}}function JE(i,t){i.uniform1fv(this.addr,t)}function QE(i,t){const e=zs(t,this.size,2);i.uniform2fv(this.addr,e)}function tb(i,t){const e=zs(t,this.size,3);i.uniform3fv(this.addr,e)}function eb(i,t){const e=zs(t,this.size,4);i.uniform4fv(this.addr,e)}function nb(i,t){const e=zs(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function ib(i,t){const e=zs(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function rb(i,t){const e=zs(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function sb(i,t){i.uniform1iv(this.addr,t)}function ob(i,t){i.uniform2iv(this.addr,t)}function ab(i,t){i.uniform3iv(this.addr,t)}function lb(i,t){i.uniform4iv(this.addr,t)}function cb(i,t){i.uniform1uiv(this.addr,t)}function hb(i,t){i.uniform2uiv(this.addr,t)}function ub(i,t){i.uniform3uiv(this.addr,t)}function fb(i,t){i.uniform4uiv(this.addr,t)}function db(i,t,e){const n=this.cache,r=t.length,s=Pl(e,r);Re(n,s)||(i.uniform1iv(this.addr,s),Pe(n,s));for(let o=0;o!==r;++o)e.setTexture2D(t[o]||Km,s[o])}function pb(i,t,e){const n=this.cache,r=t.length,s=Pl(e,r);Re(n,s)||(i.uniform1iv(this.addr,s),Pe(n,s));for(let o=0;o!==r;++o)e.setTexture3D(t[o]||Zm,s[o])}function mb(i,t,e){const n=this.cache,r=t.length,s=Pl(e,r);Re(n,s)||(i.uniform1iv(this.addr,s),Pe(n,s));for(let o=0;o!==r;++o)e.setTextureCube(t[o]||Jm,s[o])}function _b(i,t,e){const n=this.cache,r=t.length,s=Pl(e,r);Re(n,s)||(i.uniform1iv(this.addr,s),Pe(n,s));for(let o=0;o!==r;++o)e.setTexture2DArray(t[o]||$m,s[o])}function gb(i){switch(i){case 5126:return JE;case 35664:return QE;case 35665:return tb;case 35666:return eb;case 35674:return nb;case 35675:return ib;case 35676:return rb;case 5124:case 35670:return sb;case 35667:case 35671:return ob;case 35668:case 35672:return ab;case 35669:case 35673:return lb;case 5125:return cb;case 36294:return hb;case 36295:return ub;case 36296:return fb;case 35678:case 36198:case 36298:case 36306:case 35682:return db;case 35679:case 36299:case 36307:return pb;case 35680:case 36300:case 36308:case 36293:return mb;case 36289:case 36303:case 36311:case 36292:return _b}}class vb{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=ZE(e.type)}}class xb{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=gb(e.type)}}class Mb{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const r=this.seq;for(let s=0,o=r.length;s!==o;++s){const a=r[s];a.setValue(t,e[a.id],n)}}}const yc=/(\w+)(\])?(\[|\.)?/g;function Td(i,t){i.seq.push(t),i.map[t.id]=t}function yb(i,t,e){const n=i.name,r=n.length;for(yc.lastIndex=0;;){const s=yc.exec(n),o=yc.lastIndex;let a=s[1];const l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===r){Td(e,c===void 0?new vb(a,i,t):new xb(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new Mb(a),Td(e,u)),e=u}}}class Fa{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let r=0;r<n;++r){const s=t.getActiveUniform(e,r),o=t.getUniformLocation(e,s.name);yb(s,o,this)}}setValue(t,e,n,r){const s=this.map[e];s!==void 0&&s.setValue(t,n,r)}setOptional(t,e,n){const r=e[n];r!==void 0&&this.setValue(t,n,r)}static upload(t,e,n,r){for(let s=0,o=e.length;s!==o;++s){const a=e[s],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,r)}}static seqWithValue(t,e){const n=[];for(let r=0,s=t.length;r!==s;++r){const o=t[r];o.id in e&&n.push(o)}return n}}function Ad(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const Sb=37297;let Eb=0;function bb(i,t){const e=i.split(`
`),n=[],r=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=r;o<s;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}function Tb(i){const t=te.getPrimaries(te.workingColorSpace),e=te.getPrimaries(i);let n;switch(t===e?n="":t===Ka&&e===ja?n="LinearDisplayP3ToLinearSRGB":t===ja&&e===Ka&&(n="LinearSRGBToLinearDisplayP3"),i){case Ji:case wl:return[n,"LinearTransferOETF"];case Wn:case Tu:return[n,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space:",i),[n,"LinearTransferOETF"]}}function wd(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=i.getShaderInfoLog(t).trim();if(n&&r==="")return"";const s=/ERROR: 0:(\d+)/.exec(r);if(s){const o=parseInt(s[1]);return e.toUpperCase()+`

`+r+`

`+bb(i.getShaderSource(t),o)}else return r}function Ab(i,t){const e=Tb(t);return`vec4 ${i}( vec4 value ) { return ${e[0]}( ${e[1]}( value ) ); }`}function wb(i,t){let e;switch(t){case Rx:e="Linear";break;case Px:e="Reinhard";break;case Lx:e="Cineon";break;case Dx:e="ACESFilmic";break;case Ux:e="AgX";break;case Nx:e="Neutral";break;case Ix:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const xa=new O;function Cb(){te.getLuminanceCoefficients(xa);const i=xa.x.toFixed(4),t=xa.y.toFixed(4),e=xa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Rb(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Js).join(`
`)}function Pb(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function Lb(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let r=0;r<n;r++){const s=i.getActiveAttrib(t,r),o=s.name;let a=1;s.type===i.FLOAT_MAT2&&(a=2),s.type===i.FLOAT_MAT3&&(a=3),s.type===i.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Js(i){return i!==""}function Cd(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Rd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const Db=/^[ \t]*#include +<([\w\d./]+)>/gm;function Ah(i){return i.replace(Db,Ub)}const Ib=new Map;function Ub(i,t){let e=Ht[t];if(e===void 0){const n=Ib.get(t);if(n!==void 0)e=Ht[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Ah(e)}const Nb=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Pd(i){return i.replace(Nb,Ob)}function Ob(i,t,e,n){let r="";for(let s=parseInt(t);s<parseInt(e);s++)r+=n.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return r}function Ld(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Fb(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===Em?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===ex?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===fi&&(t="SHADOWMAP_TYPE_VSM"),t}function Bb(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case ws:case Cs:t="ENVMAP_TYPE_CUBE";break;case Al:t="ENVMAP_TYPE_CUBE_UV";break}return t}function zb(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Cs:t="ENVMAP_MODE_REFRACTION";break}return t}function kb(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case gu:t="ENVMAP_BLENDING_MULTIPLY";break;case wx:t="ENVMAP_BLENDING_MIX";break;case Cx:t="ENVMAP_BLENDING_ADD";break}return t}function Hb(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),7*16)),texelHeight:n,maxMip:e}}function Vb(i,t,e,n){const r=i.getContext(),s=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=Fb(e),c=Bb(e),h=zb(e),u=kb(e),f=Hb(e),d=Rb(e),g=Pb(s),_=r.createProgram();let m,p,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Js).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Js).join(`
`),p.length>0&&(p+=`
`)):(m=[Ld(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Js).join(`
`),p=[Ld(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Vi?"#define TONE_MAPPING":"",e.toneMapping!==Vi?Ht.tonemapping_pars_fragment:"",e.toneMapping!==Vi?wb("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Ht.colorspace_pars_fragment,Ab("linearToOutputTexel",e.outputColorSpace),Cb(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Js).join(`
`)),o=Ah(o),o=Cd(o,e),o=Rd(o,e),a=Ah(a),a=Cd(a,e),a=Rd(a,e),o=Pd(o),a=Pd(a),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Xf?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Xf?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const v=y+m+o,M=y+p+a,L=Ad(r,r.VERTEX_SHADER,v),w=Ad(r,r.FRAGMENT_SHADER,M);r.attachShader(_,L),r.attachShader(_,w),e.index0AttributeName!==void 0?r.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&r.bindAttribLocation(_,0,"position"),r.linkProgram(_);function C(I){if(i.debug.checkShaderErrors){const G=r.getProgramInfoLog(_).trim(),H=r.getShaderInfoLog(L).trim(),Z=r.getShaderInfoLog(w).trim();let et=!0,X=!0;if(r.getProgramParameter(_,r.LINK_STATUS)===!1)if(et=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(r,_,L,w);else{const $=wd(r,L,"vertex"),Y=wd(r,w,"fragment");console.error("THREE.WebGLProgram: Shader Error "+r.getError()+" - VALIDATE_STATUS "+r.getProgramParameter(_,r.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+G+`
`+$+`
`+Y)}else G!==""?console.warn("THREE.WebGLProgram: Program Info Log:",G):(H===""||Z==="")&&(X=!1);X&&(I.diagnostics={runnable:et,programLog:G,vertexShader:{log:H,prefix:m},fragmentShader:{log:Z,prefix:p}})}r.deleteShader(L),r.deleteShader(w),D=new Fa(r,_),S=Lb(r,_)}let D;this.getUniforms=function(){return D===void 0&&C(this),D};let S;this.getAttributes=function(){return S===void 0&&C(this),S};let E=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return E===!1&&(E=r.getProgramParameter(_,Sb)),E},this.destroy=function(){n.releaseStatesOfProgram(this),r.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Eb++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=L,this.fragmentShader=w,this}let Gb=0;class Wb{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,r=this._getShaderStage(e),s=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(r)===!1&&(o.add(r),r.usedTimes++),o.has(s)===!1&&(o.add(s),s.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Xb(t),e.set(t,n)),n}}class Xb{constructor(t){this.id=Gb++,this.code=t,this.usedTimes=0}}function Yb(i,t,e,n,r,s,o){const a=new zm,l=new Wb,c=new Set,h=[],u=r.logarithmicDepthBuffer,f=r.vertexTextures;let d=r.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,E,I,G,H){const Z=G.fog,et=H.geometry,X=S.isMeshStandardMaterial?G.environment:null,$=(S.isMeshStandardMaterial?e:t).get(S.envMap||X),Y=!!$&&$.mapping===Al?$.image.height:null,ft=g[S.type];S.precision!==null&&(d=r.getMaxPrecision(S.precision),d!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",d,"instead."));const vt=et.morphAttributes.position||et.morphAttributes.normal||et.morphAttributes.color,mt=vt!==void 0?vt.length:0;let wt=0;et.morphAttributes.position!==void 0&&(wt=1),et.morphAttributes.normal!==void 0&&(wt=2),et.morphAttributes.color!==void 0&&(wt=3);let Wt,nt,lt,yt;if(ft){const Kt=qn[ft];Wt=Kt.vertexShader,nt=Kt.fragmentShader}else Wt=S.vertexShader,nt=S.fragmentShader,l.update(S),lt=l.getVertexShaderID(S),yt=l.getFragmentShaderID(S);const _t=i.getRenderTarget(),Rt=H.isInstancedMesh===!0,It=H.isBatchedMesh===!0,Lt=!!S.map,Xt=!!S.matcap,P=!!$,A=!!S.aoMap,R=!!S.lightMap,F=!!S.bumpMap,N=!!S.normalMap,K=!!S.displacementMap,V=!!S.emissiveMap,tt=!!S.metalnessMap,b=!!S.roughnessMap,x=S.anisotropy>0,U=S.clearcoat>0,j=S.dispersion>0,z=S.iridescence>0,q=S.sheen>0,at=S.transmission>0,it=x&&!!S.anisotropyMap,ct=U&&!!S.clearcoatMap,Mt=U&&!!S.clearcoatNormalMap,ot=U&&!!S.clearcoatRoughnessMap,ut=z&&!!S.iridescenceMap,Ot=z&&!!S.iridescenceThicknessMap,At=q&&!!S.sheenColorMap,St=q&&!!S.sheenRoughnessMap,Ft=!!S.specularMap,Dt=!!S.specularColorMap,qt=!!S.specularIntensityMap,B=at&&!!S.transmissionMap,dt=at&&!!S.thicknessMap,rt=!!S.gradientMap,st=!!S.alphaMap,gt=S.alphaTest>0,Ut=!!S.alphaHash,jt=!!S.extensions;let Me=Vi;S.toneMapped&&(_t===null||_t.isXRRenderTarget===!0)&&(Me=i.toneMapping);const Ne={shaderID:ft,shaderType:S.type,shaderName:S.name,vertexShader:Wt,fragmentShader:nt,defines:S.defines,customVertexShaderID:lt,customFragmentShaderID:yt,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:d,batching:It,batchingColor:It&&H._colorsTexture!==null,instancing:Rt,instancingColor:Rt&&H.instanceColor!==null,instancingMorph:Rt&&H.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:_t===null?i.outputColorSpace:_t.isXRRenderTarget===!0?_t.texture.colorSpace:Ji,alphaToCoverage:!!S.alphaToCoverage,map:Lt,matcap:Xt,envMap:P,envMapMode:P&&$.mapping,envMapCubeUVHeight:Y,aoMap:A,lightMap:R,bumpMap:F,normalMap:N,displacementMap:f&&K,emissiveMap:V,normalMapObjectSpace:N&&S.normalMapType===zx,normalMapTangentSpace:N&&S.normalMapType===bu,metalnessMap:tt,roughnessMap:b,anisotropy:x,anisotropyMap:it,clearcoat:U,clearcoatMap:ct,clearcoatNormalMap:Mt,clearcoatRoughnessMap:ot,dispersion:j,iridescence:z,iridescenceMap:ut,iridescenceThicknessMap:Ot,sheen:q,sheenColorMap:At,sheenRoughnessMap:St,specularMap:Ft,specularColorMap:Dt,specularIntensityMap:qt,transmission:at,transmissionMap:B,thicknessMap:dt,gradientMap:rt,opaque:S.transparent===!1&&S.blending===xs&&S.alphaToCoverage===!1,alphaMap:st,alphaTest:gt,alphaHash:Ut,combine:S.combine,mapUv:Lt&&_(S.map.channel),aoMapUv:A&&_(S.aoMap.channel),lightMapUv:R&&_(S.lightMap.channel),bumpMapUv:F&&_(S.bumpMap.channel),normalMapUv:N&&_(S.normalMap.channel),displacementMapUv:K&&_(S.displacementMap.channel),emissiveMapUv:V&&_(S.emissiveMap.channel),metalnessMapUv:tt&&_(S.metalnessMap.channel),roughnessMapUv:b&&_(S.roughnessMap.channel),anisotropyMapUv:it&&_(S.anisotropyMap.channel),clearcoatMapUv:ct&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Mt&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ot&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:ut&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Ot&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:At&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:St&&_(S.sheenRoughnessMap.channel),specularMapUv:Ft&&_(S.specularMap.channel),specularColorMapUv:Dt&&_(S.specularColorMap.channel),specularIntensityMapUv:qt&&_(S.specularIntensityMap.channel),transmissionMapUv:B&&_(S.transmissionMap.channel),thicknessMapUv:dt&&_(S.thicknessMap.channel),alphaMapUv:st&&_(S.alphaMap.channel),vertexTangents:!!et.attributes.tangent&&(N||x),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!et.attributes.color&&et.attributes.color.itemSize===4,pointsUvs:H.isPoints===!0&&!!et.attributes.uv&&(Lt||st),fog:!!Z,useFog:S.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:u,skinning:H.isSkinnedMesh===!0,morphTargets:et.morphAttributes.position!==void 0,morphNormals:et.morphAttributes.normal!==void 0,morphColors:et.morphAttributes.color!==void 0,morphTargetsCount:mt,morphTextureStride:wt,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:i.shadowMap.enabled&&I.length>0,shadowMapType:i.shadowMap.type,toneMapping:Me,decodeVideoTexture:Lt&&S.map.isVideoTexture===!0&&te.getTransfer(S.map.colorSpace)===le,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===jn,flipSided:S.side===Qe,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:jt&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(jt&&S.extensions.multiDraw===!0||It)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return Ne.vertexUv1s=c.has(1),Ne.vertexUv2s=c.has(2),Ne.vertexUv3s=c.has(3),c.clear(),Ne}function p(S){const E=[];if(S.shaderID?E.push(S.shaderID):(E.push(S.customVertexShaderID),E.push(S.customFragmentShaderID)),S.defines!==void 0)for(const I in S.defines)E.push(I),E.push(S.defines[I]);return S.isRawShaderMaterial===!1&&(y(E,S),v(E,S),E.push(i.outputColorSpace)),E.push(S.customProgramCacheKey),E.join()}function y(S,E){S.push(E.precision),S.push(E.outputColorSpace),S.push(E.envMapMode),S.push(E.envMapCubeUVHeight),S.push(E.mapUv),S.push(E.alphaMapUv),S.push(E.lightMapUv),S.push(E.aoMapUv),S.push(E.bumpMapUv),S.push(E.normalMapUv),S.push(E.displacementMapUv),S.push(E.emissiveMapUv),S.push(E.metalnessMapUv),S.push(E.roughnessMapUv),S.push(E.anisotropyMapUv),S.push(E.clearcoatMapUv),S.push(E.clearcoatNormalMapUv),S.push(E.clearcoatRoughnessMapUv),S.push(E.iridescenceMapUv),S.push(E.iridescenceThicknessMapUv),S.push(E.sheenColorMapUv),S.push(E.sheenRoughnessMapUv),S.push(E.specularMapUv),S.push(E.specularColorMapUv),S.push(E.specularIntensityMapUv),S.push(E.transmissionMapUv),S.push(E.thicknessMapUv),S.push(E.combine),S.push(E.fogExp2),S.push(E.sizeAttenuation),S.push(E.morphTargetsCount),S.push(E.morphAttributeCount),S.push(E.numDirLights),S.push(E.numPointLights),S.push(E.numSpotLights),S.push(E.numSpotLightMaps),S.push(E.numHemiLights),S.push(E.numRectAreaLights),S.push(E.numDirLightShadows),S.push(E.numPointLightShadows),S.push(E.numSpotLightShadows),S.push(E.numSpotLightShadowsWithMaps),S.push(E.numLightProbes),S.push(E.shadowMapType),S.push(E.toneMapping),S.push(E.numClippingPlanes),S.push(E.numClipIntersection),S.push(E.depthPacking)}function v(S,E){a.disableAll(),E.supportsVertexTextures&&a.enable(0),E.instancing&&a.enable(1),E.instancingColor&&a.enable(2),E.instancingMorph&&a.enable(3),E.matcap&&a.enable(4),E.envMap&&a.enable(5),E.normalMapObjectSpace&&a.enable(6),E.normalMapTangentSpace&&a.enable(7),E.clearcoat&&a.enable(8),E.iridescence&&a.enable(9),E.alphaTest&&a.enable(10),E.vertexColors&&a.enable(11),E.vertexAlphas&&a.enable(12),E.vertexUv1s&&a.enable(13),E.vertexUv2s&&a.enable(14),E.vertexUv3s&&a.enable(15),E.vertexTangents&&a.enable(16),E.anisotropy&&a.enable(17),E.alphaHash&&a.enable(18),E.batching&&a.enable(19),E.dispersion&&a.enable(20),E.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),E.fog&&a.enable(0),E.useFog&&a.enable(1),E.flatShading&&a.enable(2),E.logarithmicDepthBuffer&&a.enable(3),E.skinning&&a.enable(4),E.morphTargets&&a.enable(5),E.morphNormals&&a.enable(6),E.morphColors&&a.enable(7),E.premultipliedAlpha&&a.enable(8),E.shadowMapEnabled&&a.enable(9),E.doubleSided&&a.enable(10),E.flipSided&&a.enable(11),E.useDepthPacking&&a.enable(12),E.dithering&&a.enable(13),E.transmission&&a.enable(14),E.sheen&&a.enable(15),E.opaque&&a.enable(16),E.pointsUvs&&a.enable(17),E.decodeVideoTexture&&a.enable(18),E.alphaToCoverage&&a.enable(19),S.push(a.mask)}function M(S){const E=g[S.type];let I;if(E){const G=qn[E];I=RM.clone(G.uniforms)}else I=S.uniforms;return I}function L(S,E){let I;for(let G=0,H=h.length;G<H;G++){const Z=h[G];if(Z.cacheKey===E){I=Z,++I.usedTimes;break}}return I===void 0&&(I=new Vb(i,E,S,s),h.push(I)),I}function w(S){if(--S.usedTimes===0){const E=h.indexOf(S);h[E]=h[h.length-1],h.pop(),S.destroy()}}function C(S){l.remove(S)}function D(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:L,releaseProgram:w,releaseShaderCache:C,programs:h,dispose:D}}function qb(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function r(o,a,l){i.get(o)[a]=l}function s(){i=new WeakMap}return{has:t,get:e,remove:n,update:r,dispose:s}}function jb(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Dd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Id(){const i=[];let t=0;const e=[],n=[],r=[];function s(){t=0,e.length=0,n.length=0,r.length=0}function o(u,f,d,g,_,m){let p=i[t];return p===void 0?(p={id:u.id,object:u,geometry:f,material:d,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[t]=p):(p.id=u.id,p.object=u,p.geometry=f,p.material=d,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=_,p.group=m),t++,p}function a(u,f,d,g,_,m){const p=o(u,f,d,g,_,m);d.transmission>0?n.push(p):d.transparent===!0?r.push(p):e.push(p)}function l(u,f,d,g,_,m){const p=o(u,f,d,g,_,m);d.transmission>0?n.unshift(p):d.transparent===!0?r.unshift(p):e.unshift(p)}function c(u,f){e.length>1&&e.sort(u||jb),n.length>1&&n.sort(f||Dd),r.length>1&&r.sort(f||Dd)}function h(){for(let u=t,f=i.length;u<f;u++){const d=i[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:e,transmissive:n,transparent:r,init:s,push:a,unshift:l,finish:h,sort:c}}function Kb(){let i=new WeakMap;function t(n,r){const s=i.get(n);let o;return s===void 0?(o=new Id,i.set(n,[o])):r>=s.length?(o=new Id,s.push(o)):o=s[r],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function $b(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new O,color:new Gt};break;case"SpotLight":e={position:new O,direction:new O,color:new Gt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new Gt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new Gt,groundColor:new Gt};break;case"RectAreaLight":e={color:new Gt,position:new O,halfWidth:new O,halfHeight:new O};break}return i[t.id]=e,e}}}function Zb(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ht,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Jb=0;function Qb(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function tT(i){const t=new $b,e=Zb(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const r=new O,s=new de,o=new de;function a(c){let h=0,u=0,f=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let d=0,g=0,_=0,m=0,p=0,y=0,v=0,M=0,L=0,w=0,C=0;c.sort(Qb);for(let S=0,E=c.length;S<E;S++){const I=c[S],G=I.color,H=I.intensity,Z=I.distance,et=I.shadow&&I.shadow.map?I.shadow.map.texture:null;if(I.isAmbientLight)h+=G.r*H,u+=G.g*H,f+=G.b*H;else if(I.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(I.sh.coefficients[X],H);C++}else if(I.isDirectionalLight){const X=t.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const $=I.shadow,Y=e.get(I);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,n.directionalShadow[d]=Y,n.directionalShadowMap[d]=et,n.directionalShadowMatrix[d]=I.shadow.matrix,y++}n.directional[d]=X,d++}else if(I.isSpotLight){const X=t.get(I);X.position.setFromMatrixPosition(I.matrixWorld),X.color.copy(G).multiplyScalar(H),X.distance=Z,X.coneCos=Math.cos(I.angle),X.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),X.decay=I.decay,n.spot[_]=X;const $=I.shadow;if(I.map&&(n.spotLightMap[L]=I.map,L++,$.updateMatrices(I),I.castShadow&&w++),n.spotLightMatrix[_]=$.matrix,I.castShadow){const Y=e.get(I);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,n.spotShadow[_]=Y,n.spotShadowMap[_]=et,M++}_++}else if(I.isRectAreaLight){const X=t.get(I);X.color.copy(G).multiplyScalar(H),X.halfWidth.set(I.width*.5,0,0),X.halfHeight.set(0,I.height*.5,0),n.rectArea[m]=X,m++}else if(I.isPointLight){const X=t.get(I);if(X.color.copy(I.color).multiplyScalar(I.intensity),X.distance=I.distance,X.decay=I.decay,I.castShadow){const $=I.shadow,Y=e.get(I);Y.shadowIntensity=$.intensity,Y.shadowBias=$.bias,Y.shadowNormalBias=$.normalBias,Y.shadowRadius=$.radius,Y.shadowMapSize=$.mapSize,Y.shadowCameraNear=$.camera.near,Y.shadowCameraFar=$.camera.far,n.pointShadow[g]=Y,n.pointShadowMap[g]=et,n.pointShadowMatrix[g]=I.shadow.matrix,v++}n.point[g]=X,g++}else if(I.isHemisphereLight){const X=t.get(I);X.skyColor.copy(I.color).multiplyScalar(H),X.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[p]=X,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=xt.LTC_FLOAT_1,n.rectAreaLTC2=xt.LTC_FLOAT_2):(n.rectAreaLTC1=xt.LTC_HALF_1,n.rectAreaLTC2=xt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const D=n.hash;(D.directionalLength!==d||D.pointLength!==g||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==p||D.numDirectionalShadows!==y||D.numPointShadows!==v||D.numSpotShadows!==M||D.numSpotMaps!==L||D.numLightProbes!==C)&&(n.directional.length=d,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=M+L-w,n.spotLightMap.length=L,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,D.directionalLength=d,D.pointLength=g,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=p,D.numDirectionalShadows=y,D.numPointShadows=v,D.numSpotShadows=M,D.numSpotMaps=L,D.numLightProbes=C,n.version=Jb++)}function l(c,h){let u=0,f=0,d=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,y=c.length;p<y;p++){const v=c[p];if(v.isDirectionalLight){const M=n.directional[u];M.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),u++}else if(v.isSpotLight){const M=n.spot[d];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(v.matrixWorld),r.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(r),M.direction.transformDirection(m),d++}else if(v.isRectAreaLight){const M=n.rectArea[g];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),o.identity(),s.copy(v.matrixWorld),s.premultiply(m),o.extractRotation(s),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){const M=n.point[f];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){const M=n.hemi[_];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function Ud(i){const t=new tT(i),e=[],n=[];function r(h){c.camera=h,e.length=0,n.length=0}function s(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:r,state:c,setupLights:a,setupLightsView:l,pushLight:s,pushShadow:o}}function eT(i){let t=new WeakMap;function e(r,s=0){const o=t.get(r);let a;return o===void 0?(a=new Ud(i),t.set(r,[a])):s>=o.length?(a=new Ud(i),o.push(a)):a=o[s],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class nT extends Fr{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Fx,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class iT extends Fr{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const rT=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,sT=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function oT(i,t,e){let n=new Cu;const r=new ht,s=new ht,o=new Ae,a=new nT({depthPacking:Bx}),l=new iT,c={},h=e.maxTextureSize,u={[Xi]:Qe,[Qe]:Xi,[jn]:jn},f=new Yi({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ht},radius:{value:4}},vertexShader:rT,fragmentShader:sT}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const g=new Sn;g.setAttribute("position",new ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new be(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Em;let p=this.type;this.render=function(w,C,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||w.length===0)return;const S=i.getRenderTarget(),E=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),G=i.state;G.setBlending(Hi),G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);const H=p!==fi&&this.type===fi,Z=p===fi&&this.type!==fi;for(let et=0,X=w.length;et<X;et++){const $=w[et],Y=$.shadow;if(Y===void 0){console.warn("THREE.WebGLShadowMap:",$,"has no shadow.");continue}if(Y.autoUpdate===!1&&Y.needsUpdate===!1)continue;r.copy(Y.mapSize);const ft=Y.getFrameExtents();if(r.multiply(ft),s.copy(Y.mapSize),(r.x>h||r.y>h)&&(r.x>h&&(s.x=Math.floor(h/ft.x),r.x=s.x*ft.x,Y.mapSize.x=s.x),r.y>h&&(s.y=Math.floor(h/ft.y),r.y=s.y*ft.y,Y.mapSize.y=s.y)),Y.map===null||H===!0||Z===!0){const mt=this.type!==fi?{minFilter:wn,magFilter:wn}:{};Y.map!==null&&Y.map.dispose(),Y.map=new Cr(r.x,r.y,mt),Y.map.texture.name=$.name+".shadowMap",Y.camera.updateProjectionMatrix()}i.setRenderTarget(Y.map),i.clear();const vt=Y.getViewportCount();for(let mt=0;mt<vt;mt++){const wt=Y.getViewport(mt);o.set(s.x*wt.x,s.y*wt.y,s.x*wt.z,s.y*wt.w),G.viewport(o),Y.updateMatrices($,mt),n=Y.getFrustum(),M(C,D,Y.camera,$,this.type)}Y.isPointLightShadow!==!0&&this.type===fi&&y(Y,D),Y.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(S,E,I)};function y(w,C){const D=t.update(_);f.defines.VSM_SAMPLES!==w.blurSamples&&(f.defines.VSM_SAMPLES=w.blurSamples,d.defines.VSM_SAMPLES=w.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),w.mapPass===null&&(w.mapPass=new Cr(r.x,r.y)),f.uniforms.shadow_pass.value=w.map.texture,f.uniforms.resolution.value=w.mapSize,f.uniforms.radius.value=w.radius,i.setRenderTarget(w.mapPass),i.clear(),i.renderBufferDirect(C,null,D,f,_,null),d.uniforms.shadow_pass.value=w.mapPass.texture,d.uniforms.resolution.value=w.mapSize,d.uniforms.radius.value=w.radius,i.setRenderTarget(w.map),i.clear(),i.renderBufferDirect(C,null,D,d,_,null)}function v(w,C,D,S){let E=null;const I=D.isPointLight===!0?w.customDistanceMaterial:w.customDepthMaterial;if(I!==void 0)E=I;else if(E=D.isPointLight===!0?l:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0){const G=E.uuid,H=C.uuid;let Z=c[G];Z===void 0&&(Z={},c[G]=Z);let et=Z[H];et===void 0&&(et=E.clone(),Z[H]=et,C.addEventListener("dispose",L)),E=et}if(E.visible=C.visible,E.wireframe=C.wireframe,S===fi?E.side=C.shadowSide!==null?C.shadowSide:C.side:E.side=C.shadowSide!==null?C.shadowSide:u[C.side],E.alphaMap=C.alphaMap,E.alphaTest=C.alphaTest,E.map=C.map,E.clipShadows=C.clipShadows,E.clippingPlanes=C.clippingPlanes,E.clipIntersection=C.clipIntersection,E.displacementMap=C.displacementMap,E.displacementScale=C.displacementScale,E.displacementBias=C.displacementBias,E.wireframeLinewidth=C.wireframeLinewidth,E.linewidth=C.linewidth,D.isPointLight===!0&&E.isMeshDistanceMaterial===!0){const G=i.properties.get(E);G.light=D}return E}function M(w,C,D,S,E){if(w.visible===!1)return;if(w.layers.test(C.layers)&&(w.isMesh||w.isLine||w.isPoints)&&(w.castShadow||w.receiveShadow&&E===fi)&&(!w.frustumCulled||n.intersectsObject(w))){w.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,w.matrixWorld);const H=t.update(w),Z=w.material;if(Array.isArray(Z)){const et=H.groups;for(let X=0,$=et.length;X<$;X++){const Y=et[X],ft=Z[Y.materialIndex];if(ft&&ft.visible){const vt=v(w,ft,S,E);w.onBeforeShadow(i,w,C,D,H,vt,Y),i.renderBufferDirect(D,null,H,vt,w,Y),w.onAfterShadow(i,w,C,D,H,vt,Y)}}}else if(Z.visible){const et=v(w,Z,S,E);w.onBeforeShadow(i,w,C,D,H,et,null),i.renderBufferDirect(D,null,H,et,w,null),w.onAfterShadow(i,w,C,D,H,et,null)}}const G=w.children;for(let H=0,Z=G.length;H<Z;H++)M(G[H],C,D,S,E)}function L(w){w.target.removeEventListener("dispose",L);for(const D in c){const S=c[D],E=w.target.uuid;E in S&&(S[E].dispose(),delete S[E])}}}function aT(i){function t(){let B=!1;const dt=new Ae;let rt=null;const st=new Ae(0,0,0,0);return{setMask:function(gt){rt!==gt&&!B&&(i.colorMask(gt,gt,gt,gt),rt=gt)},setLocked:function(gt){B=gt},setClear:function(gt,Ut,jt,Me,Ne){Ne===!0&&(gt*=Me,Ut*=Me,jt*=Me),dt.set(gt,Ut,jt,Me),st.equals(dt)===!1&&(i.clearColor(gt,Ut,jt,Me),st.copy(dt))},reset:function(){B=!1,rt=null,st.set(-1,0,0,0)}}}function e(){let B=!1,dt=null,rt=null,st=null;return{setTest:function(gt){gt?yt(i.DEPTH_TEST):_t(i.DEPTH_TEST)},setMask:function(gt){dt!==gt&&!B&&(i.depthMask(gt),dt=gt)},setFunc:function(gt){if(rt!==gt){switch(gt){case Mx:i.depthFunc(i.NEVER);break;case yx:i.depthFunc(i.ALWAYS);break;case Sx:i.depthFunc(i.LESS);break;case Ya:i.depthFunc(i.LEQUAL);break;case Ex:i.depthFunc(i.EQUAL);break;case bx:i.depthFunc(i.GEQUAL);break;case Tx:i.depthFunc(i.GREATER);break;case Ax:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}rt=gt}},setLocked:function(gt){B=gt},setClear:function(gt){st!==gt&&(i.clearDepth(gt),st=gt)},reset:function(){B=!1,dt=null,rt=null,st=null}}}function n(){let B=!1,dt=null,rt=null,st=null,gt=null,Ut=null,jt=null,Me=null,Ne=null;return{setTest:function(Kt){B||(Kt?yt(i.STENCIL_TEST):_t(i.STENCIL_TEST))},setMask:function(Kt){dt!==Kt&&!B&&(i.stencilMask(Kt),dt=Kt)},setFunc:function(Kt,si,Hn){(rt!==Kt||st!==si||gt!==Hn)&&(i.stencilFunc(Kt,si,Hn),rt=Kt,st=si,gt=Hn)},setOp:function(Kt,si,Hn){(Ut!==Kt||jt!==si||Me!==Hn)&&(i.stencilOp(Kt,si,Hn),Ut=Kt,jt=si,Me=Hn)},setLocked:function(Kt){B=Kt},setClear:function(Kt){Ne!==Kt&&(i.clearStencil(Kt),Ne=Kt)},reset:function(){B=!1,dt=null,rt=null,st=null,gt=null,Ut=null,jt=null,Me=null,Ne=null}}}const r=new t,s=new e,o=new n,a=new WeakMap,l=new WeakMap;let c={},h={},u=new WeakMap,f=[],d=null,g=!1,_=null,m=null,p=null,y=null,v=null,M=null,L=null,w=new Gt(0,0,0),C=0,D=!1,S=null,E=null,I=null,G=null,H=null;const Z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let et=!1,X=0;const $=i.getParameter(i.VERSION);$.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec($)[1]),et=X>=1):$.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec($)[1]),et=X>=2);let Y=null,ft={};const vt=i.getParameter(i.SCISSOR_BOX),mt=i.getParameter(i.VIEWPORT),wt=new Ae().fromArray(vt),Wt=new Ae().fromArray(mt);function nt(B,dt,rt,st){const gt=new Uint8Array(4),Ut=i.createTexture();i.bindTexture(B,Ut),i.texParameteri(B,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(B,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let jt=0;jt<rt;jt++)B===i.TEXTURE_3D||B===i.TEXTURE_2D_ARRAY?i.texImage3D(dt,0,i.RGBA,1,1,st,0,i.RGBA,i.UNSIGNED_BYTE,gt):i.texImage2D(dt+jt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,gt);return Ut}const lt={};lt[i.TEXTURE_2D]=nt(i.TEXTURE_2D,i.TEXTURE_2D,1),lt[i.TEXTURE_CUBE_MAP]=nt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),lt[i.TEXTURE_2D_ARRAY]=nt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),lt[i.TEXTURE_3D]=nt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),s.setClear(1),o.setClear(0),yt(i.DEPTH_TEST),s.setFunc(Ya),F(!1),N(zf),yt(i.CULL_FACE),A(Hi);function yt(B){c[B]!==!0&&(i.enable(B),c[B]=!0)}function _t(B){c[B]!==!1&&(i.disable(B),c[B]=!1)}function Rt(B,dt){return h[B]!==dt?(i.bindFramebuffer(B,dt),h[B]=dt,B===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=dt),B===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=dt),!0):!1}function It(B,dt){let rt=f,st=!1;if(B){rt=u.get(dt),rt===void 0&&(rt=[],u.set(dt,rt));const gt=B.textures;if(rt.length!==gt.length||rt[0]!==i.COLOR_ATTACHMENT0){for(let Ut=0,jt=gt.length;Ut<jt;Ut++)rt[Ut]=i.COLOR_ATTACHMENT0+Ut;rt.length=gt.length,st=!0}}else rt[0]!==i.BACK&&(rt[0]=i.BACK,st=!0);st&&i.drawBuffers(rt)}function Lt(B){return d!==B?(i.useProgram(B),d=B,!0):!1}const Xt={[pr]:i.FUNC_ADD,[ix]:i.FUNC_SUBTRACT,[rx]:i.FUNC_REVERSE_SUBTRACT};Xt[sx]=i.MIN,Xt[ox]=i.MAX;const P={[ax]:i.ZERO,[lx]:i.ONE,[cx]:i.SRC_COLOR,[jc]:i.SRC_ALPHA,[mx]:i.SRC_ALPHA_SATURATE,[dx]:i.DST_COLOR,[ux]:i.DST_ALPHA,[hx]:i.ONE_MINUS_SRC_COLOR,[Kc]:i.ONE_MINUS_SRC_ALPHA,[px]:i.ONE_MINUS_DST_COLOR,[fx]:i.ONE_MINUS_DST_ALPHA,[_x]:i.CONSTANT_COLOR,[gx]:i.ONE_MINUS_CONSTANT_COLOR,[vx]:i.CONSTANT_ALPHA,[xx]:i.ONE_MINUS_CONSTANT_ALPHA};function A(B,dt,rt,st,gt,Ut,jt,Me,Ne,Kt){if(B===Hi){g===!0&&(_t(i.BLEND),g=!1);return}if(g===!1&&(yt(i.BLEND),g=!0),B!==nx){if(B!==_||Kt!==D){if((m!==pr||v!==pr)&&(i.blendEquation(i.FUNC_ADD),m=pr,v=pr),Kt)switch(B){case xs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case kf:i.blendFunc(i.ONE,i.ONE);break;case Hf:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Vf:i.blendFuncSeparate(i.ZERO,i.SRC_COLOR,i.ZERO,i.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case xs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case kf:i.blendFunc(i.SRC_ALPHA,i.ONE);break;case Hf:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Vf:i.blendFunc(i.ZERO,i.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}p=null,y=null,M=null,L=null,w.set(0,0,0),C=0,_=B,D=Kt}return}gt=gt||dt,Ut=Ut||rt,jt=jt||st,(dt!==m||gt!==v)&&(i.blendEquationSeparate(Xt[dt],Xt[gt]),m=dt,v=gt),(rt!==p||st!==y||Ut!==M||jt!==L)&&(i.blendFuncSeparate(P[rt],P[st],P[Ut],P[jt]),p=rt,y=st,M=Ut,L=jt),(Me.equals(w)===!1||Ne!==C)&&(i.blendColor(Me.r,Me.g,Me.b,Ne),w.copy(Me),C=Ne),_=B,D=!1}function R(B,dt){B.side===jn?_t(i.CULL_FACE):yt(i.CULL_FACE);let rt=B.side===Qe;dt&&(rt=!rt),F(rt),B.blending===xs&&B.transparent===!1?A(Hi):A(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),s.setFunc(B.depthFunc),s.setTest(B.depthTest),s.setMask(B.depthWrite),r.setMask(B.colorWrite);const st=B.stencilWrite;o.setTest(st),st&&(o.setMask(B.stencilWriteMask),o.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),o.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),V(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?yt(i.SAMPLE_ALPHA_TO_COVERAGE):_t(i.SAMPLE_ALPHA_TO_COVERAGE)}function F(B){S!==B&&(B?i.frontFace(i.CW):i.frontFace(i.CCW),S=B)}function N(B){B!==Qv?(yt(i.CULL_FACE),B!==E&&(B===zf?i.cullFace(i.BACK):B===tx?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):_t(i.CULL_FACE),E=B}function K(B){B!==I&&(et&&i.lineWidth(B),I=B)}function V(B,dt,rt){B?(yt(i.POLYGON_OFFSET_FILL),(G!==dt||H!==rt)&&(i.polygonOffset(dt,rt),G=dt,H=rt)):_t(i.POLYGON_OFFSET_FILL)}function tt(B){B?yt(i.SCISSOR_TEST):_t(i.SCISSOR_TEST)}function b(B){B===void 0&&(B=i.TEXTURE0+Z-1),Y!==B&&(i.activeTexture(B),Y=B)}function x(B,dt,rt){rt===void 0&&(Y===null?rt=i.TEXTURE0+Z-1:rt=Y);let st=ft[rt];st===void 0&&(st={type:void 0,texture:void 0},ft[rt]=st),(st.type!==B||st.texture!==dt)&&(Y!==rt&&(i.activeTexture(rt),Y=rt),i.bindTexture(B,dt||lt[B]),st.type=B,st.texture=dt)}function U(){const B=ft[Y];B!==void 0&&B.type!==void 0&&(i.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function j(){try{i.compressedTexImage2D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function z(){try{i.compressedTexImage3D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function q(){try{i.texSubImage2D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function at(){try{i.texSubImage3D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function it(){try{i.compressedTexSubImage2D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ct(){try{i.compressedTexSubImage3D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Mt(){try{i.texStorage2D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ot(){try{i.texStorage3D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ut(){try{i.texImage2D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Ot(){try{i.texImage3D.apply(i,arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function At(B){wt.equals(B)===!1&&(i.scissor(B.x,B.y,B.z,B.w),wt.copy(B))}function St(B){Wt.equals(B)===!1&&(i.viewport(B.x,B.y,B.z,B.w),Wt.copy(B))}function Ft(B,dt){let rt=l.get(dt);rt===void 0&&(rt=new WeakMap,l.set(dt,rt));let st=rt.get(B);st===void 0&&(st=i.getUniformBlockIndex(dt,B.name),rt.set(B,st))}function Dt(B,dt){const st=l.get(dt).get(B);a.get(dt)!==st&&(i.uniformBlockBinding(dt,st,B.__bindingPointIndex),a.set(dt,st))}function qt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),c={},Y=null,ft={},h={},u=new WeakMap,f=[],d=null,g=!1,_=null,m=null,p=null,y=null,v=null,M=null,L=null,w=new Gt(0,0,0),C=0,D=!1,S=null,E=null,I=null,G=null,H=null,wt.set(0,0,i.canvas.width,i.canvas.height),Wt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),s.reset(),o.reset()}return{buffers:{color:r,depth:s,stencil:o},enable:yt,disable:_t,bindFramebuffer:Rt,drawBuffers:It,useProgram:Lt,setBlending:A,setMaterial:R,setFlipSided:F,setCullFace:N,setLineWidth:K,setPolygonOffset:V,setScissorTest:tt,activeTexture:b,bindTexture:x,unbindTexture:U,compressedTexImage2D:j,compressedTexImage3D:z,texImage2D:ut,texImage3D:Ot,updateUBOMapping:Ft,uniformBlockBinding:Dt,texStorage2D:Mt,texStorage3D:ot,texSubImage2D:q,texSubImage3D:at,compressedTexSubImage2D:it,compressedTexSubImage3D:ct,scissor:At,viewport:St,reset:qt}}function Nd(i,t,e,n){const r=lT(n);switch(e){case Cm:return i*t;case Pm:return i*t;case Lm:return i*t*2;case Dm:return i*t/r.components*r.byteLength;case yu:return i*t/r.components*r.byteLength;case Im:return i*t*2/r.components*r.byteLength;case Su:return i*t*2/r.components*r.byteLength;case Rm:return i*t*3/r.components*r.byteLength;case Fn:return i*t*4/r.components*r.byteLength;case Eu:return i*t*4/r.components*r.byteLength;case Da:case Ia:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ua:case Na:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case eh:case ih:return Math.max(i,16)*Math.max(t,8)/4;case th:case nh:return Math.max(i,8)*Math.max(t,8)/2;case rh:case sh:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case oh:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ah:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case lh:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case ch:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case hh:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case uh:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case fh:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case dh:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case ph:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case mh:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case _h:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case gh:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case vh:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case xh:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Mh:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Oa:case yh:case Sh:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Um:case Eh:return Math.ceil(i/4)*Math.ceil(t/4)*8;case bh:case Th:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function lT(i){switch(i){case Mi:case Tm:return{byteLength:1,components:1};case Eo:case Am:case zo:return{byteLength:2,components:1};case xu:case Mu:return{byteLength:2,components:4};case wr:case vu:case gi:return{byteLength:4,components:1};case wm:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}function cT(i,t,e,n,r,s,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ht,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,x){return d?new OffscreenCanvas(b,x):Za("canvas")}function _(b,x,U){let j=1;const z=tt(b);if((z.width>U||z.height>U)&&(j=U/Math.max(z.width,z.height)),j<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const q=Math.floor(j*z.width),at=Math.floor(j*z.height);u===void 0&&(u=g(q,at));const it=x?g(q,at):u;return it.width=q,it.height=at,it.getContext("2d").drawImage(b,0,0,q,at),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+z.width+"x"+z.height+") to ("+q+"x"+at+")."),it}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+z.width+"x"+z.height+")."),b;return b}function m(b){return b.generateMipmaps&&b.minFilter!==wn&&b.minFilter!==On}function p(b){i.generateMipmap(b)}function y(b,x,U,j,z=!1){if(b!==null){if(i[b]!==void 0)return i[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let q=x;if(x===i.RED&&(U===i.FLOAT&&(q=i.R32F),U===i.HALF_FLOAT&&(q=i.R16F),U===i.UNSIGNED_BYTE&&(q=i.R8)),x===i.RED_INTEGER&&(U===i.UNSIGNED_BYTE&&(q=i.R8UI),U===i.UNSIGNED_SHORT&&(q=i.R16UI),U===i.UNSIGNED_INT&&(q=i.R32UI),U===i.BYTE&&(q=i.R8I),U===i.SHORT&&(q=i.R16I),U===i.INT&&(q=i.R32I)),x===i.RG&&(U===i.FLOAT&&(q=i.RG32F),U===i.HALF_FLOAT&&(q=i.RG16F),U===i.UNSIGNED_BYTE&&(q=i.RG8)),x===i.RG_INTEGER&&(U===i.UNSIGNED_BYTE&&(q=i.RG8UI),U===i.UNSIGNED_SHORT&&(q=i.RG16UI),U===i.UNSIGNED_INT&&(q=i.RG32UI),U===i.BYTE&&(q=i.RG8I),U===i.SHORT&&(q=i.RG16I),U===i.INT&&(q=i.RG32I)),x===i.RGB&&U===i.UNSIGNED_INT_5_9_9_9_REV&&(q=i.RGB9_E5),x===i.RGBA){const at=z?qa:te.getTransfer(j);U===i.FLOAT&&(q=i.RGBA32F),U===i.HALF_FLOAT&&(q=i.RGBA16F),U===i.UNSIGNED_BYTE&&(q=at===le?i.SRGB8_ALPHA8:i.RGBA8),U===i.UNSIGNED_SHORT_4_4_4_4&&(q=i.RGBA4),U===i.UNSIGNED_SHORT_5_5_5_1&&(q=i.RGB5_A1)}return(q===i.R16F||q===i.R32F||q===i.RG16F||q===i.RG32F||q===i.RGBA16F||q===i.RGBA32F)&&t.get("EXT_color_buffer_float"),q}function v(b,x){let U;return b?x===null||x===wr||x===Rs?U=i.DEPTH24_STENCIL8:x===gi?U=i.DEPTH32F_STENCIL8:x===Eo&&(U=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===wr||x===Rs?U=i.DEPTH_COMPONENT24:x===gi?U=i.DEPTH_COMPONENT32F:x===Eo&&(U=i.DEPTH_COMPONENT16),U}function M(b,x){return m(b)===!0||b.isFramebufferTexture&&b.minFilter!==wn&&b.minFilter!==On?Math.log2(Math.max(x.width,x.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?x.mipmaps.length:1}function L(b){const x=b.target;x.removeEventListener("dispose",L),C(x),x.isVideoTexture&&h.delete(x)}function w(b){const x=b.target;x.removeEventListener("dispose",w),S(x)}function C(b){const x=n.get(b);if(x.__webglInit===void 0)return;const U=b.source,j=f.get(U);if(j){const z=j[x.__cacheKey];z.usedTimes--,z.usedTimes===0&&D(b),Object.keys(j).length===0&&f.delete(U)}n.remove(b)}function D(b){const x=n.get(b);i.deleteTexture(x.__webglTexture);const U=b.source,j=f.get(U);delete j[x.__cacheKey],o.memory.textures--}function S(b){const x=n.get(b);if(b.depthTexture&&b.depthTexture.dispose(),b.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(x.__webglFramebuffer[j]))for(let z=0;z<x.__webglFramebuffer[j].length;z++)i.deleteFramebuffer(x.__webglFramebuffer[j][z]);else i.deleteFramebuffer(x.__webglFramebuffer[j]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[j])}else{if(Array.isArray(x.__webglFramebuffer))for(let j=0;j<x.__webglFramebuffer.length;j++)i.deleteFramebuffer(x.__webglFramebuffer[j]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let j=0;j<x.__webglColorRenderbuffer.length;j++)x.__webglColorRenderbuffer[j]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[j]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const U=b.textures;for(let j=0,z=U.length;j<z;j++){const q=n.get(U[j]);q.__webglTexture&&(i.deleteTexture(q.__webglTexture),o.memory.textures--),n.remove(U[j])}n.remove(b)}let E=0;function I(){E=0}function G(){const b=E;return b>=r.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+r.maxTextures),E+=1,b}function H(b){const x=[];return x.push(b.wrapS),x.push(b.wrapT),x.push(b.wrapR||0),x.push(b.magFilter),x.push(b.minFilter),x.push(b.anisotropy),x.push(b.internalFormat),x.push(b.format),x.push(b.type),x.push(b.generateMipmaps),x.push(b.premultiplyAlpha),x.push(b.flipY),x.push(b.unpackAlignment),x.push(b.colorSpace),x.join()}function Z(b,x){const U=n.get(b);if(b.isVideoTexture&&K(b),b.isRenderTargetTexture===!1&&b.version>0&&U.__version!==b.version){const j=b.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Wt(U,b,x);return}}e.bindTexture(i.TEXTURE_2D,U.__webglTexture,i.TEXTURE0+x)}function et(b,x){const U=n.get(b);if(b.version>0&&U.__version!==b.version){Wt(U,b,x);return}e.bindTexture(i.TEXTURE_2D_ARRAY,U.__webglTexture,i.TEXTURE0+x)}function X(b,x){const U=n.get(b);if(b.version>0&&U.__version!==b.version){Wt(U,b,x);return}e.bindTexture(i.TEXTURE_3D,U.__webglTexture,i.TEXTURE0+x)}function $(b,x){const U=n.get(b);if(b.version>0&&U.__version!==b.version){nt(U,b,x);return}e.bindTexture(i.TEXTURE_CUBE_MAP,U.__webglTexture,i.TEXTURE0+x)}const Y={[Jc]:i.REPEAT,[_r]:i.CLAMP_TO_EDGE,[Qc]:i.MIRRORED_REPEAT},ft={[wn]:i.NEAREST,[Ox]:i.NEAREST_MIPMAP_NEAREST,[Jo]:i.NEAREST_MIPMAP_LINEAR,[On]:i.LINEAR,[Zl]:i.LINEAR_MIPMAP_NEAREST,[gr]:i.LINEAR_MIPMAP_LINEAR},vt={[kx]:i.NEVER,[Yx]:i.ALWAYS,[Hx]:i.LESS,[Nm]:i.LEQUAL,[Vx]:i.EQUAL,[Xx]:i.GEQUAL,[Gx]:i.GREATER,[Wx]:i.NOTEQUAL};function mt(b,x){if(x.type===gi&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===On||x.magFilter===Zl||x.magFilter===Jo||x.magFilter===gr||x.minFilter===On||x.minFilter===Zl||x.minFilter===Jo||x.minFilter===gr)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(b,i.TEXTURE_WRAP_S,Y[x.wrapS]),i.texParameteri(b,i.TEXTURE_WRAP_T,Y[x.wrapT]),(b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY)&&i.texParameteri(b,i.TEXTURE_WRAP_R,Y[x.wrapR]),i.texParameteri(b,i.TEXTURE_MAG_FILTER,ft[x.magFilter]),i.texParameteri(b,i.TEXTURE_MIN_FILTER,ft[x.minFilter]),x.compareFunction&&(i.texParameteri(b,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(b,i.TEXTURE_COMPARE_FUNC,vt[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===wn||x.minFilter!==Jo&&x.minFilter!==gr||x.type===gi&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){const U=t.get("EXT_texture_filter_anisotropic");i.texParameterf(b,U.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,r.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function wt(b,x){let U=!1;b.__webglInit===void 0&&(b.__webglInit=!0,x.addEventListener("dispose",L));const j=x.source;let z=f.get(j);z===void 0&&(z={},f.set(j,z));const q=H(x);if(q!==b.__cacheKey){z[q]===void 0&&(z[q]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,U=!0),z[q].usedTimes++;const at=z[b.__cacheKey];at!==void 0&&(z[b.__cacheKey].usedTimes--,at.usedTimes===0&&D(x)),b.__cacheKey=q,b.__webglTexture=z[q].texture}return U}function Wt(b,x,U){let j=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(j=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(j=i.TEXTURE_3D);const z=wt(b,x),q=x.source;e.bindTexture(j,b.__webglTexture,i.TEXTURE0+U);const at=n.get(q);if(q.version!==at.__version||z===!0){e.activeTexture(i.TEXTURE0+U);const it=te.getPrimaries(te.workingColorSpace),ct=x.colorSpace===Oi?null:te.getPrimaries(x.colorSpace),Mt=x.colorSpace===Oi||it===ct?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);let ot=_(x.image,!1,r.maxTextureSize);ot=V(x,ot);const ut=s.convert(x.format,x.colorSpace),Ot=s.convert(x.type);let At=y(x.internalFormat,ut,Ot,x.colorSpace,x.isVideoTexture);mt(j,x);let St;const Ft=x.mipmaps,Dt=x.isVideoTexture!==!0,qt=at.__version===void 0||z===!0,B=q.dataReady,dt=M(x,ot);if(x.isDepthTexture)At=v(x.format===Ps,x.type),qt&&(Dt?e.texStorage2D(i.TEXTURE_2D,1,At,ot.width,ot.height):e.texImage2D(i.TEXTURE_2D,0,At,ot.width,ot.height,0,ut,Ot,null));else if(x.isDataTexture)if(Ft.length>0){Dt&&qt&&e.texStorage2D(i.TEXTURE_2D,dt,At,Ft[0].width,Ft[0].height);for(let rt=0,st=Ft.length;rt<st;rt++)St=Ft[rt],Dt?B&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,St.width,St.height,ut,Ot,St.data):e.texImage2D(i.TEXTURE_2D,rt,At,St.width,St.height,0,ut,Ot,St.data);x.generateMipmaps=!1}else Dt?(qt&&e.texStorage2D(i.TEXTURE_2D,dt,At,ot.width,ot.height),B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ot.width,ot.height,ut,Ot,ot.data)):e.texImage2D(i.TEXTURE_2D,0,At,ot.width,ot.height,0,ut,Ot,ot.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){Dt&&qt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,At,Ft[0].width,Ft[0].height,ot.depth);for(let rt=0,st=Ft.length;rt<st;rt++)if(St=Ft[rt],x.format!==Fn)if(ut!==null)if(Dt){if(B)if(x.layerUpdates.size>0){const gt=Nd(St.width,St.height,x.format,x.type);for(const Ut of x.layerUpdates){const jt=St.data.subarray(Ut*gt/St.data.BYTES_PER_ELEMENT,(Ut+1)*gt/St.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,Ut,St.width,St.height,1,ut,jt,0,0)}x.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,0,St.width,St.height,ot.depth,ut,St.data,0,0)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,rt,At,St.width,St.height,ot.depth,0,St.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Dt?B&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,rt,0,0,0,St.width,St.height,ot.depth,ut,Ot,St.data):e.texImage3D(i.TEXTURE_2D_ARRAY,rt,At,St.width,St.height,ot.depth,0,ut,Ot,St.data)}else{Dt&&qt&&e.texStorage2D(i.TEXTURE_2D,dt,At,Ft[0].width,Ft[0].height);for(let rt=0,st=Ft.length;rt<st;rt++)St=Ft[rt],x.format!==Fn?ut!==null?Dt?B&&e.compressedTexSubImage2D(i.TEXTURE_2D,rt,0,0,St.width,St.height,ut,St.data):e.compressedTexImage2D(i.TEXTURE_2D,rt,At,St.width,St.height,0,St.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Dt?B&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,St.width,St.height,ut,Ot,St.data):e.texImage2D(i.TEXTURE_2D,rt,At,St.width,St.height,0,ut,Ot,St.data)}else if(x.isDataArrayTexture)if(Dt){if(qt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,At,ot.width,ot.height,ot.depth),B)if(x.layerUpdates.size>0){const rt=Nd(ot.width,ot.height,x.format,x.type);for(const st of x.layerUpdates){const gt=ot.data.subarray(st*rt/ot.data.BYTES_PER_ELEMENT,(st+1)*rt/ot.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,st,ot.width,ot.height,1,ut,Ot,gt)}x.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ot.width,ot.height,ot.depth,ut,Ot,ot.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,At,ot.width,ot.height,ot.depth,0,ut,Ot,ot.data);else if(x.isData3DTexture)Dt?(qt&&e.texStorage3D(i.TEXTURE_3D,dt,At,ot.width,ot.height,ot.depth),B&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ot.width,ot.height,ot.depth,ut,Ot,ot.data)):e.texImage3D(i.TEXTURE_3D,0,At,ot.width,ot.height,ot.depth,0,ut,Ot,ot.data);else if(x.isFramebufferTexture){if(qt)if(Dt)e.texStorage2D(i.TEXTURE_2D,dt,At,ot.width,ot.height);else{let rt=ot.width,st=ot.height;for(let gt=0;gt<dt;gt++)e.texImage2D(i.TEXTURE_2D,gt,At,rt,st,0,ut,Ot,null),rt>>=1,st>>=1}}else if(Ft.length>0){if(Dt&&qt){const rt=tt(Ft[0]);e.texStorage2D(i.TEXTURE_2D,dt,At,rt.width,rt.height)}for(let rt=0,st=Ft.length;rt<st;rt++)St=Ft[rt],Dt?B&&e.texSubImage2D(i.TEXTURE_2D,rt,0,0,ut,Ot,St):e.texImage2D(i.TEXTURE_2D,rt,At,ut,Ot,St);x.generateMipmaps=!1}else if(Dt){if(qt){const rt=tt(ot);e.texStorage2D(i.TEXTURE_2D,dt,At,rt.width,rt.height)}B&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,ut,Ot,ot)}else e.texImage2D(i.TEXTURE_2D,0,At,ut,Ot,ot);m(x)&&p(j),at.__version=q.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function nt(b,x,U){if(x.image.length!==6)return;const j=wt(b,x),z=x.source;e.bindTexture(i.TEXTURE_CUBE_MAP,b.__webglTexture,i.TEXTURE0+U);const q=n.get(z);if(z.version!==q.__version||j===!0){e.activeTexture(i.TEXTURE0+U);const at=te.getPrimaries(te.workingColorSpace),it=x.colorSpace===Oi?null:te.getPrimaries(x.colorSpace),ct=x.colorSpace===Oi||at===it?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ct);const Mt=x.isCompressedTexture||x.image[0].isCompressedTexture,ot=x.image[0]&&x.image[0].isDataTexture,ut=[];for(let st=0;st<6;st++)!Mt&&!ot?ut[st]=_(x.image[st],!0,r.maxCubemapSize):ut[st]=ot?x.image[st].image:x.image[st],ut[st]=V(x,ut[st]);const Ot=ut[0],At=s.convert(x.format,x.colorSpace),St=s.convert(x.type),Ft=y(x.internalFormat,At,St,x.colorSpace),Dt=x.isVideoTexture!==!0,qt=q.__version===void 0||j===!0,B=z.dataReady;let dt=M(x,Ot);mt(i.TEXTURE_CUBE_MAP,x);let rt;if(Mt){Dt&&qt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,Ft,Ot.width,Ot.height);for(let st=0;st<6;st++){rt=ut[st].mipmaps;for(let gt=0;gt<rt.length;gt++){const Ut=rt[gt];x.format!==Fn?At!==null?Dt?B&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt,0,0,Ut.width,Ut.height,At,Ut.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt,Ft,Ut.width,Ut.height,0,Ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Dt?B&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt,0,0,Ut.width,Ut.height,At,St,Ut.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt,Ft,Ut.width,Ut.height,0,At,St,Ut.data)}}}else{if(rt=x.mipmaps,Dt&&qt){rt.length>0&&dt++;const st=tt(ut[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,dt,Ft,st.width,st.height)}for(let st=0;st<6;st++)if(ot){Dt?B&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,ut[st].width,ut[st].height,At,St,ut[st].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Ft,ut[st].width,ut[st].height,0,At,St,ut[st].data);for(let gt=0;gt<rt.length;gt++){const jt=rt[gt].image[st].image;Dt?B&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt+1,0,0,jt.width,jt.height,At,St,jt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt+1,Ft,jt.width,jt.height,0,At,St,jt.data)}}else{Dt?B&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,0,0,At,St,ut[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0,Ft,At,St,ut[st]);for(let gt=0;gt<rt.length;gt++){const Ut=rt[gt];Dt?B&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt+1,0,0,At,St,Ut.image[st]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+st,gt+1,Ft,At,St,Ut.image[st])}}}m(x)&&p(i.TEXTURE_CUBE_MAP),q.__version=z.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function lt(b,x,U,j,z,q){const at=s.convert(U.format,U.colorSpace),it=s.convert(U.type),ct=y(U.internalFormat,at,it,U.colorSpace);if(!n.get(x).__hasExternalTextures){const ot=Math.max(1,x.width>>q),ut=Math.max(1,x.height>>q);z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY?e.texImage3D(z,q,ct,ot,ut,x.depth,0,at,it,null):e.texImage2D(z,q,ct,ot,ut,0,at,it,null)}e.bindFramebuffer(i.FRAMEBUFFER,b),N(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,j,z,n.get(U).__webglTexture,0,F(x)):(z===i.TEXTURE_2D||z>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&z<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,j,z,n.get(U).__webglTexture,q),e.bindFramebuffer(i.FRAMEBUFFER,null)}function yt(b,x,U){if(i.bindRenderbuffer(i.RENDERBUFFER,b),x.depthBuffer){const j=x.depthTexture,z=j&&j.isDepthTexture?j.type:null,q=v(x.stencilBuffer,z),at=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,it=F(x);N(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,it,q,x.width,x.height):U?i.renderbufferStorageMultisample(i.RENDERBUFFER,it,q,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,q,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,at,i.RENDERBUFFER,b)}else{const j=x.textures;for(let z=0;z<j.length;z++){const q=j[z],at=s.convert(q.format,q.colorSpace),it=s.convert(q.type),ct=y(q.internalFormat,at,it,q.colorSpace),Mt=F(x);U&&N(x)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,ct,x.width,x.height):N(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Mt,ct,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ct,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function _t(b,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,b),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");(!n.get(x.depthTexture).__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),Z(x.depthTexture,0);const j=n.get(x.depthTexture).__webglTexture,z=F(x);if(x.depthTexture.format===Ms)N(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0,z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,j,0);else if(x.depthTexture.format===Ps)N(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0,z):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Rt(b){const x=n.get(b),U=b.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==b.depthTexture){const j=b.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),j){const z=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,j.removeEventListener("dispose",z)};j.addEventListener("dispose",z),x.__depthDisposeCallback=z}x.__boundDepthTexture=j}if(b.depthTexture&&!x.__autoAllocateDepthBuffer){if(U)throw new Error("target.depthTexture not supported in Cube render targets");_t(x.__webglFramebuffer,b)}else if(U){x.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[j]),x.__webglDepthbuffer[j]===void 0)x.__webglDepthbuffer[j]=i.createRenderbuffer(),yt(x.__webglDepthbuffer[j],b,!1);else{const z=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,q=x.__webglDepthbuffer[j];i.bindRenderbuffer(i.RENDERBUFFER,q),i.framebufferRenderbuffer(i.FRAMEBUFFER,z,i.RENDERBUFFER,q)}}else if(e.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),yt(x.__webglDepthbuffer,b,!1);else{const j=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,z=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,z),i.framebufferRenderbuffer(i.FRAMEBUFFER,j,i.RENDERBUFFER,z)}e.bindFramebuffer(i.FRAMEBUFFER,null)}function It(b,x,U){const j=n.get(b);x!==void 0&&lt(j.__webglFramebuffer,b,b.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),U!==void 0&&Rt(b)}function Lt(b){const x=b.texture,U=n.get(b),j=n.get(x);b.addEventListener("dispose",w);const z=b.textures,q=b.isWebGLCubeRenderTarget===!0,at=z.length>1;if(at||(j.__webglTexture===void 0&&(j.__webglTexture=i.createTexture()),j.__version=x.version,o.memory.textures++),q){U.__webglFramebuffer=[];for(let it=0;it<6;it++)if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer[it]=[];for(let ct=0;ct<x.mipmaps.length;ct++)U.__webglFramebuffer[it][ct]=i.createFramebuffer()}else U.__webglFramebuffer[it]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){U.__webglFramebuffer=[];for(let it=0;it<x.mipmaps.length;it++)U.__webglFramebuffer[it]=i.createFramebuffer()}else U.__webglFramebuffer=i.createFramebuffer();if(at)for(let it=0,ct=z.length;it<ct;it++){const Mt=n.get(z[it]);Mt.__webglTexture===void 0&&(Mt.__webglTexture=i.createTexture(),o.memory.textures++)}if(b.samples>0&&N(b)===!1){U.__webglMultisampledFramebuffer=i.createFramebuffer(),U.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,U.__webglMultisampledFramebuffer);for(let it=0;it<z.length;it++){const ct=z[it];U.__webglColorRenderbuffer[it]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,U.__webglColorRenderbuffer[it]);const Mt=s.convert(ct.format,ct.colorSpace),ot=s.convert(ct.type),ut=y(ct.internalFormat,Mt,ot,ct.colorSpace,b.isXRRenderTarget===!0),Ot=F(b);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ot,ut,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+it,i.RENDERBUFFER,U.__webglColorRenderbuffer[it])}i.bindRenderbuffer(i.RENDERBUFFER,null),b.depthBuffer&&(U.__webglDepthRenderbuffer=i.createRenderbuffer(),yt(U.__webglDepthRenderbuffer,b,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(q){e.bindTexture(i.TEXTURE_CUBE_MAP,j.__webglTexture),mt(i.TEXTURE_CUBE_MAP,x);for(let it=0;it<6;it++)if(x.mipmaps&&x.mipmaps.length>0)for(let ct=0;ct<x.mipmaps.length;ct++)lt(U.__webglFramebuffer[it][ct],b,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+it,ct);else lt(U.__webglFramebuffer[it],b,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+it,0);m(x)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(at){for(let it=0,ct=z.length;it<ct;it++){const Mt=z[it],ot=n.get(Mt);e.bindTexture(i.TEXTURE_2D,ot.__webglTexture),mt(i.TEXTURE_2D,Mt),lt(U.__webglFramebuffer,b,Mt,i.COLOR_ATTACHMENT0+it,i.TEXTURE_2D,0),m(Mt)&&p(i.TEXTURE_2D)}e.unbindTexture()}else{let it=i.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(it=b.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(it,j.__webglTexture),mt(it,x),x.mipmaps&&x.mipmaps.length>0)for(let ct=0;ct<x.mipmaps.length;ct++)lt(U.__webglFramebuffer[ct],b,x,i.COLOR_ATTACHMENT0,it,ct);else lt(U.__webglFramebuffer,b,x,i.COLOR_ATTACHMENT0,it,0);m(x)&&p(it),e.unbindTexture()}b.depthBuffer&&Rt(b)}function Xt(b){const x=b.textures;for(let U=0,j=x.length;U<j;U++){const z=x[U];if(m(z)){const q=b.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:i.TEXTURE_2D,at=n.get(z).__webglTexture;e.bindTexture(q,at),p(q),e.unbindTexture()}}}const P=[],A=[];function R(b){if(b.samples>0){if(N(b)===!1){const x=b.textures,U=b.width,j=b.height;let z=i.COLOR_BUFFER_BIT;const q=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,at=n.get(b),it=x.length>1;if(it)for(let ct=0;ct<x.length;ct++)e.bindFramebuffer(i.FRAMEBUFFER,at.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,at.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,at.__webglMultisampledFramebuffer),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,at.__webglFramebuffer);for(let ct=0;ct<x.length;ct++){if(b.resolveDepthBuffer&&(b.depthBuffer&&(z|=i.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&(z|=i.STENCIL_BUFFER_BIT)),it){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,at.__webglColorRenderbuffer[ct]);const Mt=n.get(x[ct]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Mt,0)}i.blitFramebuffer(0,0,U,j,0,0,U,j,z,i.NEAREST),l===!0&&(P.length=0,A.length=0,P.push(i.COLOR_ATTACHMENT0+ct),b.depthBuffer&&b.resolveDepthBuffer===!1&&(P.push(q),A.push(q),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,A)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,P))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),it)for(let ct=0;ct<x.length;ct++){e.bindFramebuffer(i.FRAMEBUFFER,at.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.RENDERBUFFER,at.__webglColorRenderbuffer[ct]);const Mt=n.get(x[ct]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,at.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+ct,i.TEXTURE_2D,Mt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,at.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&l){const x=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function F(b){return Math.min(r.maxSamples,b.samples)}function N(b){const x=n.get(b);return b.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function K(b){const x=o.render.frame;h.get(b)!==x&&(h.set(b,x),b.update())}function V(b,x){const U=b.colorSpace,j=b.format,z=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||U!==Ji&&U!==Oi&&(te.getTransfer(U)===le?(j!==Fn||z!==Mi)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",U)),x}function tt(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(c.width=b.naturalWidth||b.width,c.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(c.width=b.displayWidth,c.height=b.displayHeight):(c.width=b.width,c.height=b.height),c}this.allocateTextureUnit=G,this.resetTextureUnits=I,this.setTexture2D=Z,this.setTexture2DArray=et,this.setTexture3D=X,this.setTextureCube=$,this.rebindTextures=It,this.setupRenderTarget=Lt,this.updateRenderTargetMipmap=Xt,this.updateMultisampleRenderTarget=R,this.setupDepthRenderbuffer=Rt,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=N}function hT(i,t){function e(n,r=Oi){let s;const o=te.getTransfer(r);if(n===Mi)return i.UNSIGNED_BYTE;if(n===xu)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Mu)return i.UNSIGNED_SHORT_5_5_5_1;if(n===wm)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Tm)return i.BYTE;if(n===Am)return i.SHORT;if(n===Eo)return i.UNSIGNED_SHORT;if(n===vu)return i.INT;if(n===wr)return i.UNSIGNED_INT;if(n===gi)return i.FLOAT;if(n===zo)return i.HALF_FLOAT;if(n===Cm)return i.ALPHA;if(n===Rm)return i.RGB;if(n===Fn)return i.RGBA;if(n===Pm)return i.LUMINANCE;if(n===Lm)return i.LUMINANCE_ALPHA;if(n===Ms)return i.DEPTH_COMPONENT;if(n===Ps)return i.DEPTH_STENCIL;if(n===Dm)return i.RED;if(n===yu)return i.RED_INTEGER;if(n===Im)return i.RG;if(n===Su)return i.RG_INTEGER;if(n===Eu)return i.RGBA_INTEGER;if(n===Da||n===Ia||n===Ua||n===Na)if(o===le)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(n===Da)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ia)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ua)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Na)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(n===Da)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ia)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ua)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Na)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===th||n===eh||n===nh||n===ih)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(n===th)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===eh)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===nh)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ih)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===rh||n===sh||n===oh)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(n===rh||n===sh)return o===le?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(n===oh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ah||n===lh||n===ch||n===hh||n===uh||n===fh||n===dh||n===ph||n===mh||n===_h||n===gh||n===vh||n===xh||n===Mh)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(n===ah)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===lh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ch)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===hh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===uh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===dh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ph)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===mh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===_h)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===gh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===vh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===xh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Mh)return o===le?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Oa||n===yh||n===Sh)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(n===Oa)return o===le?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===yh)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Sh)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Um||n===Eh||n===bh||n===Th)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(n===Oa)return s.COMPRESSED_RED_RGTC1_EXT;if(n===Eh)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===bh)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Th)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}class uT extends _n{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Ma extends we{constructor(){super(),this.isGroup=!0,this.type="Group"}}const fT={type:"move"};class Sc{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ma,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ma,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ma,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let r=null,s=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,g=.005;c.inputState.pinching&&f>d+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&f<=d-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,n),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(r=e.getPose(t.targetRaySpace,n),r===null&&s!==null&&(r=s),r!==null&&(a.matrix.fromArray(r.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,r.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(r.linearVelocity)):a.hasLinearVelocity=!1,r.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(r.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(fT)))}return a!==null&&(a.visible=r!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Ma;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const dT=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,pT=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class mT{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const r=new tn,s=t.properties.get(r);s.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=r}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Yi({vertexShader:dT,fragmentShader:pT,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new be(new Ho(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class _T extends Nr{constructor(t,e){super();const n=this;let r=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,d=null,g=null;const _=new mT,m=e.getContextAttributes();let p=null,y=null;const v=[],M=[],L=new ht;let w=null;const C=new _n;C.layers.enable(1),C.viewport=new Ae;const D=new _n;D.layers.enable(2),D.viewport=new Ae;const S=[C,D],E=new uT;E.layers.enable(1),E.layers.enable(2);let I=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(nt){let lt=v[nt];return lt===void 0&&(lt=new Sc,v[nt]=lt),lt.getTargetRaySpace()},this.getControllerGrip=function(nt){let lt=v[nt];return lt===void 0&&(lt=new Sc,v[nt]=lt),lt.getGripSpace()},this.getHand=function(nt){let lt=v[nt];return lt===void 0&&(lt=new Sc,v[nt]=lt),lt.getHandSpace()};function H(nt){const lt=M.indexOf(nt.inputSource);if(lt===-1)return;const yt=v[lt];yt!==void 0&&(yt.update(nt.inputSource,nt.frame,c||o),yt.dispatchEvent({type:nt.type,data:nt.inputSource}))}function Z(){r.removeEventListener("select",H),r.removeEventListener("selectstart",H),r.removeEventListener("selectend",H),r.removeEventListener("squeeze",H),r.removeEventListener("squeezestart",H),r.removeEventListener("squeezeend",H),r.removeEventListener("end",Z),r.removeEventListener("inputsourceschange",et);for(let nt=0;nt<v.length;nt++){const lt=M[nt];lt!==null&&(M[nt]=null,v[nt].disconnect(lt))}I=null,G=null,_.reset(),t.setRenderTarget(p),d=null,f=null,u=null,r=null,y=null,Wt.stop(),n.isPresenting=!1,t.setPixelRatio(w),t.setSize(L.width,L.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(nt){s=nt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(nt){a=nt,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(nt){c=nt},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u},this.getFrame=function(){return g},this.getSession=function(){return r},this.setSession=async function(nt){if(r=nt,r!==null){if(p=t.getRenderTarget(),r.addEventListener("select",H),r.addEventListener("selectstart",H),r.addEventListener("selectend",H),r.addEventListener("squeeze",H),r.addEventListener("squeezestart",H),r.addEventListener("squeezeend",H),r.addEventListener("end",Z),r.addEventListener("inputsourceschange",et),m.xrCompatible!==!0&&await e.makeXRCompatible(),w=t.getPixelRatio(),t.getSize(L),r.renderState.layers===void 0){const lt={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:s};d=new XRWebGLLayer(r,e,lt),r.updateRenderState({baseLayer:d}),t.setPixelRatio(1),t.setSize(d.framebufferWidth,d.framebufferHeight,!1),y=new Cr(d.framebufferWidth,d.framebufferHeight,{format:Fn,type:Mi,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let lt=null,yt=null,_t=null;m.depth&&(_t=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,lt=m.stencil?Ps:Ms,yt=m.stencil?Rs:wr);const Rt={colorFormat:e.RGBA8,depthFormat:_t,scaleFactor:s};u=new XRWebGLBinding(r,e),f=u.createProjectionLayer(Rt),r.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),y=new Cr(f.textureWidth,f.textureHeight,{format:Fn,type:Mi,depthTexture:new jm(f.textureWidth,f.textureHeight,yt,void 0,void 0,void 0,void 0,void 0,void 0,lt),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await r.requestReferenceSpace(a),Wt.setContext(r),Wt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(r!==null)return r.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function et(nt){for(let lt=0;lt<nt.removed.length;lt++){const yt=nt.removed[lt],_t=M.indexOf(yt);_t>=0&&(M[_t]=null,v[_t].disconnect(yt))}for(let lt=0;lt<nt.added.length;lt++){const yt=nt.added[lt];let _t=M.indexOf(yt);if(_t===-1){for(let It=0;It<v.length;It++)if(It>=M.length){M.push(yt),_t=It;break}else if(M[It]===null){M[It]=yt,_t=It;break}if(_t===-1)break}const Rt=v[_t];Rt&&Rt.connect(yt)}}const X=new O,$=new O;function Y(nt,lt,yt){X.setFromMatrixPosition(lt.matrixWorld),$.setFromMatrixPosition(yt.matrixWorld);const _t=X.distanceTo($),Rt=lt.projectionMatrix.elements,It=yt.projectionMatrix.elements,Lt=Rt[14]/(Rt[10]-1),Xt=Rt[14]/(Rt[10]+1),P=(Rt[9]+1)/Rt[5],A=(Rt[9]-1)/Rt[5],R=(Rt[8]-1)/Rt[0],F=(It[8]+1)/It[0],N=Lt*R,K=Lt*F,V=_t/(-R+F),tt=V*-R;if(lt.matrixWorld.decompose(nt.position,nt.quaternion,nt.scale),nt.translateX(tt),nt.translateZ(V),nt.matrixWorld.compose(nt.position,nt.quaternion,nt.scale),nt.matrixWorldInverse.copy(nt.matrixWorld).invert(),Rt[10]===-1)nt.projectionMatrix.copy(lt.projectionMatrix),nt.projectionMatrixInverse.copy(lt.projectionMatrixInverse);else{const b=Lt+V,x=Xt+V,U=N-tt,j=K+(_t-tt),z=P*Xt/x*b,q=A*Xt/x*b;nt.projectionMatrix.makePerspective(U,j,z,q,b,x),nt.projectionMatrixInverse.copy(nt.projectionMatrix).invert()}}function ft(nt,lt){lt===null?nt.matrixWorld.copy(nt.matrix):nt.matrixWorld.multiplyMatrices(lt.matrixWorld,nt.matrix),nt.matrixWorldInverse.copy(nt.matrixWorld).invert()}this.updateCamera=function(nt){if(r===null)return;let lt=nt.near,yt=nt.far;_.texture!==null&&(_.depthNear>0&&(lt=_.depthNear),_.depthFar>0&&(yt=_.depthFar)),E.near=D.near=C.near=lt,E.far=D.far=C.far=yt,(I!==E.near||G!==E.far)&&(r.updateRenderState({depthNear:E.near,depthFar:E.far}),I=E.near,G=E.far);const _t=nt.parent,Rt=E.cameras;ft(E,_t);for(let It=0;It<Rt.length;It++)ft(Rt[It],_t);Rt.length===2?Y(E,C,D):E.projectionMatrix.copy(C.projectionMatrix),vt(nt,E,_t)};function vt(nt,lt,yt){yt===null?nt.matrix.copy(lt.matrixWorld):(nt.matrix.copy(yt.matrixWorld),nt.matrix.invert(),nt.matrix.multiply(lt.matrixWorld)),nt.matrix.decompose(nt.position,nt.quaternion,nt.scale),nt.updateMatrixWorld(!0),nt.projectionMatrix.copy(lt.projectionMatrix),nt.projectionMatrixInverse.copy(lt.projectionMatrixInverse),nt.isPerspectiveCamera&&(nt.fov=Ls*2*Math.atan(1/nt.projectionMatrix.elements[5]),nt.zoom=1)}this.getCamera=function(){return E},this.getFoveation=function(){if(!(f===null&&d===null))return l},this.setFoveation=function(nt){l=nt,f!==null&&(f.fixedFoveation=nt),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=nt)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(E)};let mt=null;function wt(nt,lt){if(h=lt.getViewerPose(c||o),g=lt,h!==null){const yt=h.views;d!==null&&(t.setRenderTargetFramebuffer(y,d.framebuffer),t.setRenderTarget(y));let _t=!1;yt.length!==E.cameras.length&&(E.cameras.length=0,_t=!0);for(let It=0;It<yt.length;It++){const Lt=yt[It];let Xt=null;if(d!==null)Xt=d.getViewport(Lt);else{const A=u.getViewSubImage(f,Lt);Xt=A.viewport,It===0&&(t.setRenderTargetTextures(y,A.colorTexture,f.ignoreDepthValues?void 0:A.depthStencilTexture),t.setRenderTarget(y))}let P=S[It];P===void 0&&(P=new _n,P.layers.enable(It),P.viewport=new Ae,S[It]=P),P.matrix.fromArray(Lt.transform.matrix),P.matrix.decompose(P.position,P.quaternion,P.scale),P.projectionMatrix.fromArray(Lt.projectionMatrix),P.projectionMatrixInverse.copy(P.projectionMatrix).invert(),P.viewport.set(Xt.x,Xt.y,Xt.width,Xt.height),It===0&&(E.matrix.copy(P.matrix),E.matrix.decompose(E.position,E.quaternion,E.scale)),_t===!0&&E.cameras.push(P)}const Rt=r.enabledFeatures;if(Rt&&Rt.includes("depth-sensing")){const It=u.getDepthInformation(yt[0]);It&&It.isValid&&It.texture&&_.init(t,It,r.renderState)}}for(let yt=0;yt<v.length;yt++){const _t=M[yt],Rt=v[yt];_t!==null&&Rt!==void 0&&Rt.update(_t,lt,c||o)}mt&&mt(nt,lt),lt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:lt}),g=null}const Wt=new Ym;Wt.setAnimationLoop(wt),this.setAnimationLoop=function(nt){mt=nt},this.dispose=function(){}}}const lr=new kn,gT=new de;function vT(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Gm(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function r(m,p,y,v,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?s(m,p):p.isMeshToonMaterial?(s(m,p),u(m,p)):p.isMeshPhongMaterial?(s(m,p),h(m,p)):p.isMeshStandardMaterial?(s(m,p),f(m,p),p.isMeshPhysicalMaterial&&d(m,p,M)):p.isMeshMatcapMaterial?(s(m,p),g(m,p)):p.isMeshDepthMaterial?s(m,p):p.isMeshDistanceMaterial?(s(m,p),_(m,p)):p.isMeshNormalMaterial?s(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,v):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function s(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Qe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Qe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=t.get(p),v=y.envMap,M=y.envMapRotation;v&&(m.envMap.value=v,lr.copy(M),lr.x*=-1,lr.y*=-1,lr.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(lr.y*=-1,lr.z*=-1),m.envMapRotation.value.setFromMatrix4(gT.makeRotationFromEuler(lr)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,v){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=v*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function f(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function d(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Qe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const y=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:r}}function xT(i,t,e,n){let r={},s={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,v){const M=v.program;n.uniformBlockBinding(y,M)}function c(y,v){let M=r[y.id];M===void 0&&(g(y),M=h(y),r[y.id]=M,y.addEventListener("dispose",m));const L=v.program;n.updateUBOMapping(y,L);const w=t.render.frame;s[y.id]!==w&&(f(y),s[y.id]=w)}function h(y){const v=u();y.__bindingPointIndex=v;const M=i.createBuffer(),L=y.__size,w=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,L,w),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,M),M}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(y){const v=r[y.id],M=y.uniforms,L=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let w=0,C=M.length;w<C;w++){const D=Array.isArray(M[w])?M[w]:[M[w]];for(let S=0,E=D.length;S<E;S++){const I=D[S];if(d(I,w,S,L)===!0){const G=I.__offset,H=Array.isArray(I.value)?I.value:[I.value];let Z=0;for(let et=0;et<H.length;et++){const X=H[et],$=_(X);typeof X=="number"||typeof X=="boolean"?(I.__data[0]=X,i.bufferSubData(i.UNIFORM_BUFFER,G+Z,I.__data)):X.isMatrix3?(I.__data[0]=X.elements[0],I.__data[1]=X.elements[1],I.__data[2]=X.elements[2],I.__data[3]=0,I.__data[4]=X.elements[3],I.__data[5]=X.elements[4],I.__data[6]=X.elements[5],I.__data[7]=0,I.__data[8]=X.elements[6],I.__data[9]=X.elements[7],I.__data[10]=X.elements[8],I.__data[11]=0):(X.toArray(I.__data,Z),Z+=$.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,G,I.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function d(y,v,M,L){const w=y.value,C=v+"_"+M;if(L[C]===void 0)return typeof w=="number"||typeof w=="boolean"?L[C]=w:L[C]=w.clone(),!0;{const D=L[C];if(typeof w=="number"||typeof w=="boolean"){if(D!==w)return L[C]=w,!0}else if(D.equals(w)===!1)return D.copy(w),!0}return!1}function g(y){const v=y.uniforms;let M=0;const L=16;for(let C=0,D=v.length;C<D;C++){const S=Array.isArray(v[C])?v[C]:[v[C]];for(let E=0,I=S.length;E<I;E++){const G=S[E],H=Array.isArray(G.value)?G.value:[G.value];for(let Z=0,et=H.length;Z<et;Z++){const X=H[Z],$=_(X),Y=M%L,ft=Y%$.boundary,vt=Y+ft;M+=ft,vt!==0&&L-vt<$.storage&&(M+=L-vt),G.__data=new Float32Array($.storage/Float32Array.BYTES_PER_ELEMENT),G.__offset=M,M+=$.storage}}}const w=M%L;return w>0&&(M+=L-w),y.__size=M,y.__cache={},this}function _(y){const v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=48,v.storage=48):y.isMatrix4?(v.boundary=64,v.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),v}function m(y){const v=y.target;v.removeEventListener("dispose",m);const M=o.indexOf(v.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(r[v.id]),delete r[v.id],delete s[v.id]}function p(){for(const y in r)i.deleteBuffer(r[y]);o=[],r={},s={}}return{bind:l,update:c,dispose:p}}class MT{constructor(t={}){const{canvas:e=hM(),context:n=null,depth:r=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const d=new Uint32Array(4),g=new Int32Array(4);let _=null,m=null;const p=[],y=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Wn,this.toneMapping=Vi,this.toneMappingExposure=1;const v=this;let M=!1,L=0,w=0,C=null,D=-1,S=null;const E=new Ae,I=new Ae;let G=null;const H=new Gt(0);let Z=0,et=e.width,X=e.height,$=1,Y=null,ft=null;const vt=new Ae(0,0,et,X),mt=new Ae(0,0,et,X);let wt=!1;const Wt=new Cu;let nt=!1,lt=!1;const yt=new de,_t=new O,Rt=new Ae,It={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Lt=!1;function Xt(){return C===null?$:1}let P=n;function A(T,k){return e.getContext(T,k)}try{const T={alpha:!0,depth:r,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${_u}`),e.addEventListener("webglcontextlost",rt,!1),e.addEventListener("webglcontextrestored",st,!1),e.addEventListener("webglcontextcreationerror",gt,!1),P===null){const k="webgl2";if(P=A(k,T),P===null)throw A(k)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(T){throw console.error("THREE.WebGLRenderer: "+T.message),T}let R,F,N,K,V,tt,b,x,U,j,z,q,at,it,ct,Mt,ot,ut,Ot,At,St,Ft,Dt,qt;function B(){R=new AE(P),R.init(),Ft=new hT(P,R),F=new ME(P,R,t,Ft),N=new aT(P),K=new RE(P),V=new qb,tt=new cT(P,R,N,V,F,Ft,K),b=new SE(v),x=new TE(v),U=new OM(P),Dt=new vE(P,U),j=new wE(P,U,K,Dt),z=new LE(P,j,U,K),Ot=new PE(P,F,tt),Mt=new yE(V),q=new Yb(v,b,x,R,F,Dt,Mt),at=new vT(v,V),it=new Kb,ct=new eT(R),ut=new gE(v,b,x,N,z,f,l),ot=new oT(v,z,F),qt=new xT(P,K,F,N),At=new xE(P,R,K),St=new CE(P,R,K),K.programs=q.programs,v.capabilities=F,v.extensions=R,v.properties=V,v.renderLists=it,v.shadowMap=ot,v.state=N,v.info=K}B();const dt=new _T(v,P);this.xr=dt,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const T=R.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){const T=R.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return $},this.setPixelRatio=function(T){T!==void 0&&($=T,this.setSize(et,X,!1))},this.getSize=function(T){return T.set(et,X)},this.setSize=function(T,k,J=!0){if(dt.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}et=T,X=k,e.width=Math.floor(T*$),e.height=Math.floor(k*$),J===!0&&(e.style.width=T+"px",e.style.height=k+"px"),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(et*$,X*$).floor()},this.setDrawingBufferSize=function(T,k,J){et=T,X=k,$=J,e.width=Math.floor(T*J),e.height=Math.floor(k*J),this.setViewport(0,0,T,k)},this.getCurrentViewport=function(T){return T.copy(E)},this.getViewport=function(T){return T.copy(vt)},this.setViewport=function(T,k,J,Q){T.isVector4?vt.set(T.x,T.y,T.z,T.w):vt.set(T,k,J,Q),N.viewport(E.copy(vt).multiplyScalar($).round())},this.getScissor=function(T){return T.copy(mt)},this.setScissor=function(T,k,J,Q){T.isVector4?mt.set(T.x,T.y,T.z,T.w):mt.set(T,k,J,Q),N.scissor(I.copy(mt).multiplyScalar($).round())},this.getScissorTest=function(){return wt},this.setScissorTest=function(T){N.setScissorTest(wt=T)},this.setOpaqueSort=function(T){Y=T},this.setTransparentSort=function(T){ft=T},this.getClearColor=function(T){return T.copy(ut.getClearColor())},this.setClearColor=function(){ut.setClearColor.apply(ut,arguments)},this.getClearAlpha=function(){return ut.getClearAlpha()},this.setClearAlpha=function(){ut.setClearAlpha.apply(ut,arguments)},this.clear=function(T=!0,k=!0,J=!0){let Q=0;if(T){let W=!1;if(C!==null){const pt=C.texture.format;W=pt===Eu||pt===Su||pt===yu}if(W){const pt=C.texture.type,Et=pt===Mi||pt===wr||pt===Eo||pt===Rs||pt===xu||pt===Mu,bt=ut.getClearColor(),Tt=ut.getClearAlpha(),Nt=bt.r,Bt=bt.g,Ct=bt.b;Et?(d[0]=Nt,d[1]=Bt,d[2]=Ct,d[3]=Tt,P.clearBufferuiv(P.COLOR,0,d)):(g[0]=Nt,g[1]=Bt,g[2]=Ct,g[3]=Tt,P.clearBufferiv(P.COLOR,0,g))}else Q|=P.COLOR_BUFFER_BIT}k&&(Q|=P.DEPTH_BUFFER_BIT),J&&(Q|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(Q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",rt,!1),e.removeEventListener("webglcontextrestored",st,!1),e.removeEventListener("webglcontextcreationerror",gt,!1),it.dispose(),ct.dispose(),V.dispose(),b.dispose(),x.dispose(),z.dispose(),Dt.dispose(),qt.dispose(),q.dispose(),dt.dispose(),dt.removeEventListener("sessionstart",Hn),dt.removeEventListener("sessionend",ef),tr.stop()};function rt(T){T.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),M=!0}function st(){console.log("THREE.WebGLRenderer: Context Restored."),M=!1;const T=K.autoReset,k=ot.enabled,J=ot.autoUpdate,Q=ot.needsUpdate,W=ot.type;B(),K.autoReset=T,ot.enabled=k,ot.autoUpdate=J,ot.needsUpdate=Q,ot.type=W}function gt(T){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Ut(T){const k=T.target;k.removeEventListener("dispose",Ut),jt(k)}function jt(T){Me(T),V.remove(T)}function Me(T){const k=V.get(T).programs;k!==void 0&&(k.forEach(function(J){q.releaseProgram(J)}),T.isShaderMaterial&&q.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,J,Q,W,pt){k===null&&(k=It);const Et=W.isMesh&&W.matrixWorld.determinant()<0,bt=gg(T,k,J,Q,W);N.setMaterial(Q,Et);let Tt=J.index,Nt=1;if(Q.wireframe===!0){if(Tt=j.getWireframeAttribute(J),Tt===void 0)return;Nt=2}const Bt=J.drawRange,Ct=J.attributes.position;let $t=Bt.start*Nt,pe=(Bt.start+Bt.count)*Nt;pt!==null&&($t=Math.max($t,pt.start*Nt),pe=Math.min(pe,(pt.start+pt.count)*Nt)),Tt!==null?($t=Math.max($t,0),pe=Math.min(pe,Tt.count)):Ct!=null&&($t=Math.max($t,0),pe=Math.min(pe,Ct.count));const me=pe-$t;if(me<0||me===1/0)return;Dt.setup(W,Q,bt,J,Tt);let an,Zt=At;if(Tt!==null&&(an=U.get(Tt),Zt=St,Zt.setIndex(an)),W.isMesh)Q.wireframe===!0?(N.setLineWidth(Q.wireframeLinewidth*Xt()),Zt.setMode(P.LINES)):Zt.setMode(P.TRIANGLES);else if(W.isLine){let Pt=Q.linewidth;Pt===void 0&&(Pt=1),N.setLineWidth(Pt*Xt()),W.isLineSegments?Zt.setMode(P.LINES):W.isLineLoop?Zt.setMode(P.LINE_LOOP):Zt.setMode(P.LINE_STRIP)}else W.isPoints?Zt.setMode(P.POINTS):W.isSprite&&Zt.setMode(P.TRIANGLES);if(W.isBatchedMesh)if(W._multiDrawInstances!==null)Zt.renderMultiDrawInstances(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount,W._multiDrawInstances);else if(R.get("WEBGL_multi_draw"))Zt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{const Pt=W._multiDrawStarts,Oe=W._multiDrawCounts,Jt=W._multiDrawCount,Ln=Tt?U.get(Tt).bytesPerElement:1,zr=V.get(Q).currentProgram.getUniforms();for(let ln=0;ln<Jt;ln++)zr.setValue(P,"_gl_DrawID",ln),Zt.render(Pt[ln]/Ln,Oe[ln])}else if(W.isInstancedMesh)Zt.renderInstances($t,me,W.count);else if(J.isInstancedBufferGeometry){const Pt=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,Oe=Math.min(J.instanceCount,Pt);Zt.renderInstances($t,me,Oe)}else Zt.render($t,me)};function Ne(T,k,J){T.transparent===!0&&T.side===jn&&T.forceSinglePass===!1?(T.side=Qe,T.needsUpdate=!0,Xo(T,k,J),T.side=Xi,T.needsUpdate=!0,Xo(T,k,J),T.side=jn):Xo(T,k,J)}this.compile=function(T,k,J=null){J===null&&(J=T),m=ct.get(J),m.init(k),y.push(m),J.traverseVisible(function(W){W.isLight&&W.layers.test(k.layers)&&(m.pushLight(W),W.castShadow&&m.pushShadow(W))}),T!==J&&T.traverseVisible(function(W){W.isLight&&W.layers.test(k.layers)&&(m.pushLight(W),W.castShadow&&m.pushShadow(W))}),m.setupLights();const Q=new Set;return T.traverse(function(W){const pt=W.material;if(pt)if(Array.isArray(pt))for(let Et=0;Et<pt.length;Et++){const bt=pt[Et];Ne(bt,J,W),Q.add(bt)}else Ne(pt,J,W),Q.add(pt)}),y.pop(),m=null,Q},this.compileAsync=function(T,k,J=null){const Q=this.compile(T,k,J);return new Promise(W=>{function pt(){if(Q.forEach(function(Et){V.get(Et).currentProgram.isReady()&&Q.delete(Et)}),Q.size===0){W(T);return}setTimeout(pt,10)}R.get("KHR_parallel_shader_compile")!==null?pt():setTimeout(pt,10)})};let Kt=null;function si(T){Kt&&Kt(T)}function Hn(){tr.stop()}function ef(){tr.start()}const tr=new Ym;tr.setAnimationLoop(si),typeof self<"u"&&tr.setContext(self),this.setAnimationLoop=function(T){Kt=T,dt.setAnimationLoop(T),T===null?tr.stop():tr.start()},dt.addEventListener("sessionstart",Hn),dt.addEventListener("sessionend",ef),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(M===!0)return;if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),dt.enabled===!0&&dt.isPresenting===!0&&(dt.cameraAutoUpdate===!0&&dt.updateCamera(k),k=dt.getCamera()),T.isScene===!0&&T.onBeforeRender(v,T,k,C),m=ct.get(T,y.length),m.init(k),y.push(m),yt.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Wt.setFromProjectionMatrix(yt),lt=this.localClippingEnabled,nt=Mt.init(this.clippingPlanes,lt),_=it.get(T,p.length),_.init(),p.push(_),dt.enabled===!0&&dt.isPresenting===!0){const pt=v.xr.getDepthSensingMesh();pt!==null&&Ol(pt,k,-1/0,v.sortObjects)}Ol(T,k,0,v.sortObjects),_.finish(),v.sortObjects===!0&&_.sort(Y,ft),Lt=dt.enabled===!1||dt.isPresenting===!1||dt.hasDepthSensing()===!1,Lt&&ut.addToRenderList(_,T),this.info.render.frame++,nt===!0&&Mt.beginShadows();const J=m.state.shadowsArray;ot.render(J,T,k),nt===!0&&Mt.endShadows(),this.info.autoReset===!0&&this.info.reset();const Q=_.opaque,W=_.transmissive;if(m.setupLights(),k.isArrayCamera){const pt=k.cameras;if(W.length>0)for(let Et=0,bt=pt.length;Et<bt;Et++){const Tt=pt[Et];rf(Q,W,T,Tt)}Lt&&ut.render(T);for(let Et=0,bt=pt.length;Et<bt;Et++){const Tt=pt[Et];nf(_,T,Tt,Tt.viewport)}}else W.length>0&&rf(Q,W,T,k),Lt&&ut.render(T),nf(_,T,k);C!==null&&(tt.updateMultisampleRenderTarget(C),tt.updateRenderTargetMipmap(C)),T.isScene===!0&&T.onAfterRender(v,T,k),Dt.resetDefaultState(),D=-1,S=null,y.pop(),y.length>0?(m=y[y.length-1],nt===!0&&Mt.setGlobalState(v.clippingPlanes,m.state.camera)):m=null,p.pop(),p.length>0?_=p[p.length-1]:_=null};function Ol(T,k,J,Q){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)J=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLight)m.pushLight(T),T.castShadow&&m.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||Wt.intersectsSprite(T)){Q&&Rt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(yt);const Et=z.update(T),bt=T.material;bt.visible&&_.push(T,Et,bt,J,Rt.z,null)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||Wt.intersectsObject(T))){const Et=z.update(T),bt=T.material;if(Q&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Rt.copy(T.boundingSphere.center)):(Et.boundingSphere===null&&Et.computeBoundingSphere(),Rt.copy(Et.boundingSphere.center)),Rt.applyMatrix4(T.matrixWorld).applyMatrix4(yt)),Array.isArray(bt)){const Tt=Et.groups;for(let Nt=0,Bt=Tt.length;Nt<Bt;Nt++){const Ct=Tt[Nt],$t=bt[Ct.materialIndex];$t&&$t.visible&&_.push(T,Et,$t,J,Rt.z,Ct)}}else bt.visible&&_.push(T,Et,bt,J,Rt.z,null)}}const pt=T.children;for(let Et=0,bt=pt.length;Et<bt;Et++)Ol(pt[Et],k,J,Q)}function nf(T,k,J,Q){const W=T.opaque,pt=T.transmissive,Et=T.transparent;m.setupLightsView(J),nt===!0&&Mt.setGlobalState(v.clippingPlanes,J),Q&&N.viewport(E.copy(Q)),W.length>0&&Wo(W,k,J),pt.length>0&&Wo(pt,k,J),Et.length>0&&Wo(Et,k,J),N.buffers.depth.setTest(!0),N.buffers.depth.setMask(!0),N.buffers.color.setMask(!0),N.setPolygonOffset(!1)}function rf(T,k,J,Q){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;m.state.transmissionRenderTarget[Q.id]===void 0&&(m.state.transmissionRenderTarget[Q.id]=new Cr(1,1,{generateMipmaps:!0,type:R.has("EXT_color_buffer_half_float")||R.has("EXT_color_buffer_float")?zo:Mi,minFilter:gr,samples:4,stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:te.workingColorSpace}));const pt=m.state.transmissionRenderTarget[Q.id],Et=Q.viewport||E;pt.setSize(Et.z,Et.w);const bt=v.getRenderTarget();v.setRenderTarget(pt),v.getClearColor(H),Z=v.getClearAlpha(),Z<1&&v.setClearColor(16777215,.5),v.clear(),Lt&&ut.render(J);const Tt=v.toneMapping;v.toneMapping=Vi;const Nt=Q.viewport;if(Q.viewport!==void 0&&(Q.viewport=void 0),m.setupLightsView(Q),nt===!0&&Mt.setGlobalState(v.clippingPlanes,Q),Wo(T,J,Q),tt.updateMultisampleRenderTarget(pt),tt.updateRenderTargetMipmap(pt),R.has("WEBGL_multisampled_render_to_texture")===!1){let Bt=!1;for(let Ct=0,$t=k.length;Ct<$t;Ct++){const pe=k[Ct],me=pe.object,an=pe.geometry,Zt=pe.material,Pt=pe.group;if(Zt.side===jn&&me.layers.test(Q.layers)){const Oe=Zt.side;Zt.side=Qe,Zt.needsUpdate=!0,sf(me,J,Q,an,Zt,Pt),Zt.side=Oe,Zt.needsUpdate=!0,Bt=!0}}Bt===!0&&(tt.updateMultisampleRenderTarget(pt),tt.updateRenderTargetMipmap(pt))}v.setRenderTarget(bt),v.setClearColor(H,Z),Nt!==void 0&&(Q.viewport=Nt),v.toneMapping=Tt}function Wo(T,k,J){const Q=k.isScene===!0?k.overrideMaterial:null;for(let W=0,pt=T.length;W<pt;W++){const Et=T[W],bt=Et.object,Tt=Et.geometry,Nt=Q===null?Et.material:Q,Bt=Et.group;bt.layers.test(J.layers)&&sf(bt,k,J,Tt,Nt,Bt)}}function sf(T,k,J,Q,W,pt){T.onBeforeRender(v,k,J,Q,W,pt),T.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),W.onBeforeRender(v,k,J,Q,T,pt),W.transparent===!0&&W.side===jn&&W.forceSinglePass===!1?(W.side=Qe,W.needsUpdate=!0,v.renderBufferDirect(J,k,Q,W,T,pt),W.side=Xi,W.needsUpdate=!0,v.renderBufferDirect(J,k,Q,W,T,pt),W.side=jn):v.renderBufferDirect(J,k,Q,W,T,pt),T.onAfterRender(v,k,J,Q,W,pt)}function Xo(T,k,J){k.isScene!==!0&&(k=It);const Q=V.get(T),W=m.state.lights,pt=m.state.shadowsArray,Et=W.state.version,bt=q.getParameters(T,W.state,pt,k,J),Tt=q.getProgramCacheKey(bt);let Nt=Q.programs;Q.environment=T.isMeshStandardMaterial?k.environment:null,Q.fog=k.fog,Q.envMap=(T.isMeshStandardMaterial?x:b).get(T.envMap||Q.environment),Q.envMapRotation=Q.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,Nt===void 0&&(T.addEventListener("dispose",Ut),Nt=new Map,Q.programs=Nt);let Bt=Nt.get(Tt);if(Bt!==void 0){if(Q.currentProgram===Bt&&Q.lightsStateVersion===Et)return af(T,bt),Bt}else bt.uniforms=q.getUniforms(T),T.onBeforeCompile(bt,v),Bt=q.acquireProgram(bt,Tt),Nt.set(Tt,Bt),Q.uniforms=bt.uniforms;const Ct=Q.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Ct.clippingPlanes=Mt.uniform),af(T,bt),Q.needsLights=xg(T),Q.lightsStateVersion=Et,Q.needsLights&&(Ct.ambientLightColor.value=W.state.ambient,Ct.lightProbe.value=W.state.probe,Ct.directionalLights.value=W.state.directional,Ct.directionalLightShadows.value=W.state.directionalShadow,Ct.spotLights.value=W.state.spot,Ct.spotLightShadows.value=W.state.spotShadow,Ct.rectAreaLights.value=W.state.rectArea,Ct.ltc_1.value=W.state.rectAreaLTC1,Ct.ltc_2.value=W.state.rectAreaLTC2,Ct.pointLights.value=W.state.point,Ct.pointLightShadows.value=W.state.pointShadow,Ct.hemisphereLights.value=W.state.hemi,Ct.directionalShadowMap.value=W.state.directionalShadowMap,Ct.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Ct.spotShadowMap.value=W.state.spotShadowMap,Ct.spotLightMatrix.value=W.state.spotLightMatrix,Ct.spotLightMap.value=W.state.spotLightMap,Ct.pointShadowMap.value=W.state.pointShadowMap,Ct.pointShadowMatrix.value=W.state.pointShadowMatrix),Q.currentProgram=Bt,Q.uniformsList=null,Bt}function of(T){if(T.uniformsList===null){const k=T.currentProgram.getUniforms();T.uniformsList=Fa.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function af(T,k){const J=V.get(T);J.outputColorSpace=k.outputColorSpace,J.batching=k.batching,J.batchingColor=k.batchingColor,J.instancing=k.instancing,J.instancingColor=k.instancingColor,J.instancingMorph=k.instancingMorph,J.skinning=k.skinning,J.morphTargets=k.morphTargets,J.morphNormals=k.morphNormals,J.morphColors=k.morphColors,J.morphTargetsCount=k.morphTargetsCount,J.numClippingPlanes=k.numClippingPlanes,J.numIntersection=k.numClipIntersection,J.vertexAlphas=k.vertexAlphas,J.vertexTangents=k.vertexTangents,J.toneMapping=k.toneMapping}function gg(T,k,J,Q,W){k.isScene!==!0&&(k=It),tt.resetTextureUnits();const pt=k.fog,Et=Q.isMeshStandardMaterial?k.environment:null,bt=C===null?v.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Ji,Tt=(Q.isMeshStandardMaterial?x:b).get(Q.envMap||Et),Nt=Q.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,Bt=!!J.attributes.tangent&&(!!Q.normalMap||Q.anisotropy>0),Ct=!!J.morphAttributes.position,$t=!!J.morphAttributes.normal,pe=!!J.morphAttributes.color;let me=Vi;Q.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(me=v.toneMapping);const an=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Zt=an!==void 0?an.length:0,Pt=V.get(Q),Oe=m.state.lights;if(nt===!0&&(lt===!0||T!==S)){const En=T===S&&Q.id===D;Mt.setState(Q,T,En)}let Jt=!1;Q.version===Pt.__version?(Pt.needsLights&&Pt.lightsStateVersion!==Oe.state.version||Pt.outputColorSpace!==bt||W.isBatchedMesh&&Pt.batching===!1||!W.isBatchedMesh&&Pt.batching===!0||W.isBatchedMesh&&Pt.batchingColor===!0&&W.colorTexture===null||W.isBatchedMesh&&Pt.batchingColor===!1&&W.colorTexture!==null||W.isInstancedMesh&&Pt.instancing===!1||!W.isInstancedMesh&&Pt.instancing===!0||W.isSkinnedMesh&&Pt.skinning===!1||!W.isSkinnedMesh&&Pt.skinning===!0||W.isInstancedMesh&&Pt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Pt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Pt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Pt.instancingMorph===!1&&W.morphTexture!==null||Pt.envMap!==Tt||Q.fog===!0&&Pt.fog!==pt||Pt.numClippingPlanes!==void 0&&(Pt.numClippingPlanes!==Mt.numPlanes||Pt.numIntersection!==Mt.numIntersection)||Pt.vertexAlphas!==Nt||Pt.vertexTangents!==Bt||Pt.morphTargets!==Ct||Pt.morphNormals!==$t||Pt.morphColors!==pe||Pt.toneMapping!==me||Pt.morphTargetsCount!==Zt)&&(Jt=!0):(Jt=!0,Pt.__version=Q.version);let Ln=Pt.currentProgram;Jt===!0&&(Ln=Xo(Q,k,W));let zr=!1,ln=!1,Fl=!1;const ye=Ln.getUniforms(),bi=Pt.uniforms;if(N.useProgram(Ln.program)&&(zr=!0,ln=!0,Fl=!0),Q.id!==D&&(D=Q.id,ln=!0),zr||S!==T){ye.setValue(P,"projectionMatrix",T.projectionMatrix),ye.setValue(P,"viewMatrix",T.matrixWorldInverse);const En=ye.map.cameraPosition;En!==void 0&&En.setValue(P,_t.setFromMatrixPosition(T.matrixWorld)),F.logarithmicDepthBuffer&&ye.setValue(P,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(Q.isMeshPhongMaterial||Q.isMeshToonMaterial||Q.isMeshLambertMaterial||Q.isMeshBasicMaterial||Q.isMeshStandardMaterial||Q.isShaderMaterial)&&ye.setValue(P,"isOrthographic",T.isOrthographicCamera===!0),S!==T&&(S=T,ln=!0,Fl=!0)}if(W.isSkinnedMesh){ye.setOptional(P,W,"bindMatrix"),ye.setOptional(P,W,"bindMatrixInverse");const En=W.skeleton;En&&(En.boneTexture===null&&En.computeBoneTexture(),ye.setValue(P,"boneTexture",En.boneTexture,tt))}W.isBatchedMesh&&(ye.setOptional(P,W,"batchingTexture"),ye.setValue(P,"batchingTexture",W._matricesTexture,tt),ye.setOptional(P,W,"batchingIdTexture"),ye.setValue(P,"batchingIdTexture",W._indirectTexture,tt),ye.setOptional(P,W,"batchingColorTexture"),W._colorsTexture!==null&&ye.setValue(P,"batchingColorTexture",W._colorsTexture,tt));const Bl=J.morphAttributes;if((Bl.position!==void 0||Bl.normal!==void 0||Bl.color!==void 0)&&Ot.update(W,J,Ln),(ln||Pt.receiveShadow!==W.receiveShadow)&&(Pt.receiveShadow=W.receiveShadow,ye.setValue(P,"receiveShadow",W.receiveShadow)),Q.isMeshGouraudMaterial&&Q.envMap!==null&&(bi.envMap.value=Tt,bi.flipEnvMap.value=Tt.isCubeTexture&&Tt.isRenderTargetTexture===!1?-1:1),Q.isMeshStandardMaterial&&Q.envMap===null&&k.environment!==null&&(bi.envMapIntensity.value=k.environmentIntensity),ln&&(ye.setValue(P,"toneMappingExposure",v.toneMappingExposure),Pt.needsLights&&vg(bi,Fl),pt&&Q.fog===!0&&at.refreshFogUniforms(bi,pt),at.refreshMaterialUniforms(bi,Q,$,X,m.state.transmissionRenderTarget[T.id]),Fa.upload(P,of(Pt),bi,tt)),Q.isShaderMaterial&&Q.uniformsNeedUpdate===!0&&(Fa.upload(P,of(Pt),bi,tt),Q.uniformsNeedUpdate=!1),Q.isSpriteMaterial&&ye.setValue(P,"center",W.center),ye.setValue(P,"modelViewMatrix",W.modelViewMatrix),ye.setValue(P,"normalMatrix",W.normalMatrix),ye.setValue(P,"modelMatrix",W.matrixWorld),Q.isShaderMaterial||Q.isRawShaderMaterial){const En=Q.uniformsGroups;for(let zl=0,Mg=En.length;zl<Mg;zl++){const lf=En[zl];qt.update(lf,Ln),qt.bind(lf,Ln)}}return Ln}function vg(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function xg(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return w},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(T,k,J){V.get(T.texture).__webglTexture=k,V.get(T.depthTexture).__webglTexture=J;const Q=V.get(T);Q.__hasExternalTextures=!0,Q.__autoAllocateDepthBuffer=J===void 0,Q.__autoAllocateDepthBuffer||R.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Q.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(T,k){const J=V.get(T);J.__webglFramebuffer=k,J.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(T,k=0,J=0){C=T,L=k,w=J;let Q=!0,W=null,pt=!1,Et=!1;if(T){const Tt=V.get(T);if(Tt.__useDefaultFramebuffer!==void 0)N.bindFramebuffer(P.FRAMEBUFFER,null),Q=!1;else if(Tt.__webglFramebuffer===void 0)tt.setupRenderTarget(T);else if(Tt.__hasExternalTextures)tt.rebindTextures(T,V.get(T.texture).__webglTexture,V.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){const Ct=T.depthTexture;if(Tt.__boundDepthTexture!==Ct){if(Ct!==null&&V.has(Ct)&&(T.width!==Ct.image.width||T.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");tt.setupDepthRenderbuffer(T)}}const Nt=T.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(Et=!0);const Bt=V.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Bt[k])?W=Bt[k][J]:W=Bt[k],pt=!0):T.samples>0&&tt.useMultisampledRTT(T)===!1?W=V.get(T).__webglMultisampledFramebuffer:Array.isArray(Bt)?W=Bt[J]:W=Bt,E.copy(T.viewport),I.copy(T.scissor),G=T.scissorTest}else E.copy(vt).multiplyScalar($).floor(),I.copy(mt).multiplyScalar($).floor(),G=wt;if(N.bindFramebuffer(P.FRAMEBUFFER,W)&&Q&&N.drawBuffers(T,W),N.viewport(E),N.scissor(I),N.setScissorTest(G),pt){const Tt=V.get(T.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+k,Tt.__webglTexture,J)}else if(Et){const Tt=V.get(T.texture),Nt=k||0;P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,Tt.__webglTexture,J||0,Nt)}D=-1},this.readRenderTargetPixels=function(T,k,J,Q,W,pt,Et){if(!(T&&T.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let bt=V.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Et!==void 0&&(bt=bt[Et]),bt){N.bindFramebuffer(P.FRAMEBUFFER,bt);try{const Tt=T.texture,Nt=Tt.format,Bt=Tt.type;if(!F.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!F.textureTypeReadable(Bt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-Q&&J>=0&&J<=T.height-W&&P.readPixels(k,J,Q,W,Ft.convert(Nt),Ft.convert(Bt),pt)}finally{const Tt=C!==null?V.get(C).__webglFramebuffer:null;N.bindFramebuffer(P.FRAMEBUFFER,Tt)}}},this.readRenderTargetPixelsAsync=async function(T,k,J,Q,W,pt,Et){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let bt=V.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Et!==void 0&&(bt=bt[Et]),bt){N.bindFramebuffer(P.FRAMEBUFFER,bt);try{const Tt=T.texture,Nt=Tt.format,Bt=Tt.type;if(!F.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!F.textureTypeReadable(Bt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(k>=0&&k<=T.width-Q&&J>=0&&J<=T.height-W){const Ct=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Ct),P.bufferData(P.PIXEL_PACK_BUFFER,pt.byteLength,P.STREAM_READ),P.readPixels(k,J,Q,W,Ft.convert(Nt),Ft.convert(Bt),0),P.flush();const $t=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);await uM(P,$t,4);try{P.bindBuffer(P.PIXEL_PACK_BUFFER,Ct),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,pt)}finally{P.deleteBuffer(Ct),P.deleteSync($t)}return pt}}finally{const Tt=C!==null?V.get(C).__webglFramebuffer:null;N.bindFramebuffer(P.FRAMEBUFFER,Tt)}}},this.copyFramebufferToTexture=function(T,k=null,J=0){T.isTexture!==!0&&(co("WebGLRenderer: copyFramebufferToTexture function signature has changed."),k=arguments[0]||null,T=arguments[1]);const Q=Math.pow(2,-J),W=Math.floor(T.image.width*Q),pt=Math.floor(T.image.height*Q),Et=k!==null?k.x:0,bt=k!==null?k.y:0;tt.setTexture2D(T,0),P.copyTexSubImage2D(P.TEXTURE_2D,J,0,0,Et,bt,W,pt),N.unbindTexture()},this.copyTextureToTexture=function(T,k,J=null,Q=null,W=0){T.isTexture!==!0&&(co("WebGLRenderer: copyTextureToTexture function signature has changed."),Q=arguments[0]||null,T=arguments[1],k=arguments[2],W=arguments[3]||0,J=null);let pt,Et,bt,Tt,Nt,Bt;J!==null?(pt=J.max.x-J.min.x,Et=J.max.y-J.min.y,bt=J.min.x,Tt=J.min.y):(pt=T.image.width,Et=T.image.height,bt=0,Tt=0),Q!==null?(Nt=Q.x,Bt=Q.y):(Nt=0,Bt=0);const Ct=Ft.convert(k.format),$t=Ft.convert(k.type);tt.setTexture2D(k,0),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const pe=P.getParameter(P.UNPACK_ROW_LENGTH),me=P.getParameter(P.UNPACK_IMAGE_HEIGHT),an=P.getParameter(P.UNPACK_SKIP_PIXELS),Zt=P.getParameter(P.UNPACK_SKIP_ROWS),Pt=P.getParameter(P.UNPACK_SKIP_IMAGES),Oe=T.isCompressedTexture?T.mipmaps[W]:T.image;P.pixelStorei(P.UNPACK_ROW_LENGTH,Oe.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Oe.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,bt),P.pixelStorei(P.UNPACK_SKIP_ROWS,Tt),T.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,W,Nt,Bt,pt,Et,Ct,$t,Oe.data):T.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,W,Nt,Bt,Oe.width,Oe.height,Ct,Oe.data):P.texSubImage2D(P.TEXTURE_2D,W,Nt,Bt,pt,Et,Ct,$t,Oe),P.pixelStorei(P.UNPACK_ROW_LENGTH,pe),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,me),P.pixelStorei(P.UNPACK_SKIP_PIXELS,an),P.pixelStorei(P.UNPACK_SKIP_ROWS,Zt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Pt),W===0&&k.generateMipmaps&&P.generateMipmap(P.TEXTURE_2D),N.unbindTexture()},this.copyTextureToTexture3D=function(T,k,J=null,Q=null,W=0){T.isTexture!==!0&&(co("WebGLRenderer: copyTextureToTexture3D function signature has changed."),J=arguments[0]||null,Q=arguments[1]||null,T=arguments[2],k=arguments[3],W=arguments[4]||0);let pt,Et,bt,Tt,Nt,Bt,Ct,$t,pe;const me=T.isCompressedTexture?T.mipmaps[W]:T.image;J!==null?(pt=J.max.x-J.min.x,Et=J.max.y-J.min.y,bt=J.max.z-J.min.z,Tt=J.min.x,Nt=J.min.y,Bt=J.min.z):(pt=me.width,Et=me.height,bt=me.depth,Tt=0,Nt=0,Bt=0),Q!==null?(Ct=Q.x,$t=Q.y,pe=Q.z):(Ct=0,$t=0,pe=0);const an=Ft.convert(k.format),Zt=Ft.convert(k.type);let Pt;if(k.isData3DTexture)tt.setTexture3D(k,0),Pt=P.TEXTURE_3D;else if(k.isDataArrayTexture||k.isCompressedArrayTexture)tt.setTexture2DArray(k,0),Pt=P.TEXTURE_2D_ARRAY;else{console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");return}P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,k.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,k.unpackAlignment);const Oe=P.getParameter(P.UNPACK_ROW_LENGTH),Jt=P.getParameter(P.UNPACK_IMAGE_HEIGHT),Ln=P.getParameter(P.UNPACK_SKIP_PIXELS),zr=P.getParameter(P.UNPACK_SKIP_ROWS),ln=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,me.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,me.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Tt),P.pixelStorei(P.UNPACK_SKIP_ROWS,Nt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Bt),T.isDataTexture||T.isData3DTexture?P.texSubImage3D(Pt,W,Ct,$t,pe,pt,Et,bt,an,Zt,me.data):k.isCompressedArrayTexture?P.compressedTexSubImage3D(Pt,W,Ct,$t,pe,pt,Et,bt,an,me.data):P.texSubImage3D(Pt,W,Ct,$t,pe,pt,Et,bt,an,Zt,me),P.pixelStorei(P.UNPACK_ROW_LENGTH,Oe),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Jt),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Ln),P.pixelStorei(P.UNPACK_SKIP_ROWS,zr),P.pixelStorei(P.UNPACK_SKIP_IMAGES,ln),W===0&&k.generateMipmaps&&P.generateMipmap(Pt),N.unbindTexture()},this.initRenderTarget=function(T){V.get(T).__webglFramebuffer===void 0&&tt.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?tt.setTextureCube(T,0):T.isData3DTexture?tt.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?tt.setTexture2DArray(T,0):tt.setTexture2D(T,0),N.unbindTexture()},this.resetState=function(){L=0,w=0,C=null,N.reset(),Dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=t===Tu?"display-p3":"srgb",e.unpackColorSpace=te.workingColorSpace===wl?"display-p3":"srgb"}}class yT extends we{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new kn,this.environmentIntensity=1,this.environmentRotation=new kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class Qm extends Fr{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Gt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const Ja=new O,Qa=new O,Od=new de,js=new wu,ya=new Cl,Ec=new O,Fd=new O;class ST extends we{constructor(t=new Sn,e=new Qm){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let r=1,s=e.count;r<s;r++)Ja.fromBufferAttribute(e,r-1),Qa.fromBufferAttribute(e,r),n[r]=n[r-1],n[r]+=Ja.distanceTo(Qa);t.setAttribute("lineDistance",new ge(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,r=this.matrixWorld,s=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ya.copy(n.boundingSphere),ya.applyMatrix4(r),ya.radius+=s,t.ray.intersectsSphere(ya)===!1)return;Od.copy(r).invert(),js.copy(t.ray).applyMatrix4(Od);const a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=d,m=g-1;_<m;_+=c){const p=h.getX(_),y=h.getX(_+1),v=Sa(this,t,js,l,p,y);v&&e.push(v)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(d),p=Sa(this,t,js,l,_,m);p&&e.push(p)}}else{const d=Math.max(0,o.start),g=Math.min(f.count,o.start+o.count);for(let _=d,m=g-1;_<m;_+=c){const p=Sa(this,t,js,l,_,_+1);p&&e.push(p)}if(this.isLineLoop){const _=Sa(this,t,js,l,g-1,d);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const r=e[n[0]];if(r!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=r.length;s<o;s++){const a=r[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}}function Sa(i,t,e,n,r,s){const o=i.geometry.attributes.position;if(Ja.fromBufferAttribute(o,r),Qa.fromBufferAttribute(o,s),e.distanceSqToSegment(Ja,Qa,Ec,Fd)>n)return;Ec.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Ec);if(!(l<t.near||l>t.far))return{distance:l,point:Fd.clone().applyMatrix4(i.matrixWorld),index:r,face:null,faceIndex:null,object:i}}const Bd=new O,zd=new O;class ET extends ST{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let r=0,s=e.count;r<s;r+=2)Bd.fromBufferAttribute(e,r),zd.fromBufferAttribute(e,r+1),n[r]=r===0?0:n[r-1],n[r+1]=n[r]+Bd.distanceTo(zd);t.setAttribute("lineDistance",new ge(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class ri{constructor(){this.type="Curve",this.arcLengthDivisions=200}getPoint(){return console.warn("THREE.Curve: .getPoint() not implemented."),null}getPointAt(t,e){const n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){const e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){const t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const e=[];let n,r=this.getPoint(0),s=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),s+=n.distanceTo(r),e.push(s),r=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e){const n=this.getLengths();let r=0;const s=n.length;let o;e?o=e:o=t*n[s-1];let a=0,l=s-1,c;for(;a<=l;)if(r=Math.floor(a+(l-a)/2),c=n[r]-o,c<0)a=r+1;else if(c>0)l=r-1;else{l=r;break}if(r=l,n[r]===o)return r/(s-1);const h=n[r],f=n[r+1]-h,d=(o-h)/f;return(r+d)/(s-1)}getTangent(t,e){let r=t-1e-4,s=t+1e-4;r<0&&(r=0),s>1&&(s=1);const o=this.getPoint(r),a=this.getPoint(s),l=e||(o.isVector2?new ht:new O);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){const n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e){const n=new O,r=[],s=[],o=[],a=new O,l=new de;for(let d=0;d<=t;d++){const g=d/t;r[d]=this.getTangentAt(g,new O)}s[0]=new O,o[0]=new O;let c=Number.MAX_VALUE;const h=Math.abs(r[0].x),u=Math.abs(r[0].y),f=Math.abs(r[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(r[0],n).normalize(),s[0].crossVectors(r[0],a),o[0].crossVectors(r[0],s[0]);for(let d=1;d<=t;d++){if(s[d]=s[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(r[d-1],r[d]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(De(r[d-1].dot(r[d]),-1,1));s[d].applyMatrix4(l.makeRotationAxis(a,g))}o[d].crossVectors(r[d],s[d])}if(e===!0){let d=Math.acos(De(s[0].dot(s[t]),-1,1));d/=t,r[0].dot(a.crossVectors(s[0],s[t]))>0&&(d=-d);for(let g=1;g<=t;g++)s[g].applyMatrix4(l.makeRotationAxis(r[g],d*g)),o[g].crossVectors(r[g],s[g])}return{tangents:r,normals:s,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){const t={metadata:{version:4.6,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}}class Pu extends ri{constructor(t=0,e=0,n=1,r=1,s=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=r,this.aStartAngle=s,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new ht){const n=e,r=Math.PI*2;let s=this.aEndAngle-this.aStartAngle;const o=Math.abs(s)<Number.EPSILON;for(;s<0;)s+=r;for(;s>r;)s-=r;s<Number.EPSILON&&(o?s=0:s=r),this.aClockwise===!0&&!o&&(s===r?s=-r:s=s-r);const a=this.aStartAngle+t*s;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,d=c-this.aY;l=f*h-d*u+this.aX,c=f*u+d*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){const t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}}class bT extends Pu{constructor(t,e,n,r,s,o){super(t,e,n,n,r,s,o),this.isArcCurve=!0,this.type="ArcCurve"}}function Lu(){let i=0,t=0,e=0,n=0;function r(s,o,a,l){i=s,t=a,e=-3*s+3*o-2*a-l,n=2*s-2*o+a+l}return{initCatmullRom:function(s,o,a,l,c){r(o,a,c*(a-s),c*(l-o))},initNonuniformCatmullRom:function(s,o,a,l,c,h,u){let f=(o-s)/c-(a-s)/(c+h)+(a-o)/h,d=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,d*=h,r(o,a,f,d)},calc:function(s){const o=s*s,a=o*s;return i+t*s+e*o+n*a}}}const Ea=new O,bc=new Lu,Tc=new Lu,Ac=new Lu;class TT extends ri{constructor(t=[],e=!1,n="centripetal",r=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=r}getPoint(t,e=new O){const n=e,r=this.points,s=r.length,o=(s-(this.closed?0:1))*t;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/s)+1)*s:l===0&&a===s-1&&(a=s-2,l=1);let c,h;this.closed||a>0?c=r[(a-1)%s]:(Ea.subVectors(r[0],r[1]).add(r[0]),c=Ea);const u=r[a%s],f=r[(a+1)%s];if(this.closed||a+2<s?h=r[(a+2)%s]:(Ea.subVectors(r[s-1],r[s-2]).add(r[s-1]),h=Ea),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),d),_=Math.pow(u.distanceToSquared(f),d),m=Math.pow(f.distanceToSquared(h),d);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),bc.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,g,_,m),Tc.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,g,_,m),Ac.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(bc.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),Tc.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),Ac.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(bc.calc(l),Tc.calc(l),Ac.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const r=t.points[e];this.points.push(r.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const r=this.points[e];t.points.push(r.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const r=t.points[e];this.points.push(new O().fromArray(r))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}}function kd(i,t,e,n,r){const s=(n-t)*.5,o=(r-e)*.5,a=i*i,l=i*a;return(2*e-2*n+s+o)*l+(-3*e+3*n-2*s-o)*a+s*i+e}function AT(i,t){const e=1-i;return e*e*t}function wT(i,t){return 2*(1-i)*i*t}function CT(i,t){return i*i*t}function ho(i,t,e,n){return AT(i,t)+wT(i,e)+CT(i,n)}function RT(i,t){const e=1-i;return e*e*e*t}function PT(i,t){const e=1-i;return 3*e*e*i*t}function LT(i,t){return 3*(1-i)*i*i*t}function DT(i,t){return i*i*i*t}function uo(i,t,e,n,r){return RT(i,t)+PT(i,e)+LT(i,n)+DT(i,r)}class t_ extends ri{constructor(t=new ht,e=new ht,n=new ht,r=new ht){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=r}getPoint(t,e=new ht){const n=e,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(uo(t,r.x,s.x,o.x,a.x),uo(t,r.y,s.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class IT extends ri{constructor(t=new O,e=new O,n=new O,r=new O){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=r}getPoint(t,e=new O){const n=e,r=this.v0,s=this.v1,o=this.v2,a=this.v3;return n.set(uo(t,r.x,s.x,o.x,a.x),uo(t,r.y,s.y,o.y,a.y),uo(t,r.z,s.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}}class e_ extends ri{constructor(t=new ht,e=new ht){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ht){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ht){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class UT extends ri{constructor(t=new O,e=new O){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new O){const n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new O){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class n_ extends ri{constructor(t=new ht,e=new ht,n=new ht){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ht){const n=e,r=this.v0,s=this.v1,o=this.v2;return n.set(ho(t,r.x,s.x,o.x),ho(t,r.y,s.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class NT extends ri{constructor(t=new O,e=new O,n=new O){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new O){const n=e,r=this.v0,s=this.v1,o=this.v2;return n.set(ho(t,r.x,s.x,o.x),ho(t,r.y,s.y,o.y),ho(t,r.z,s.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){const t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}}class i_ extends ri{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ht){const n=e,r=this.points,s=(r.length-1)*t,o=Math.floor(s),a=s-o,l=r[o===0?o:o-1],c=r[o],h=r[o>r.length-2?r.length-1:o+1],u=r[o>r.length-3?r.length-1:o+2];return n.set(kd(a,l.x,c.x,h.x,u.x),kd(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const r=t.points[e];this.points.push(r.clone())}return this}toJSON(){const t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){const r=this.points[e];t.points.push(r.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){const r=t.points[e];this.points.push(new ht().fromArray(r))}return this}}var wh=Object.freeze({__proto__:null,ArcCurve:bT,CatmullRomCurve3:TT,CubicBezierCurve:t_,CubicBezierCurve3:IT,EllipseCurve:Pu,LineCurve:e_,LineCurve3:UT,QuadraticBezierCurve:n_,QuadraticBezierCurve3:NT,SplineCurve:i_});class OT extends ri{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){const t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){const n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new wh[n](e,t))}return this}getPoint(t,e){const n=t*this.getLength(),r=this.getCurveLengths();let s=0;for(;s<r.length;){if(r[s]>=n){const o=r[s]-n,a=this.curves[s],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}s++}return null}getLength(){const t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const t=[];let e=0;for(let n=0,r=this.curves.length;n<r;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){const e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){const e=[];let n;for(let r=0,s=this.curves;r<s.length;r++){const o=s[r],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){const h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const r=t.curves[e];this.curves.push(r.clone())}return this.autoClose=t.autoClose,this}toJSON(){const t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){const r=this.curves[e];t.curves.push(r.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){const r=t.curves[e];this.curves.push(new wh[r.type]().fromJSON(r))}return this}}class Hd extends OT{constructor(t){super(),this.type="Path",this.currentPoint=new ht,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){const n=new e_(this.currentPoint.clone(),new ht(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,r){const s=new n_(this.currentPoint.clone(),new ht(t,e),new ht(n,r));return this.curves.push(s),this.currentPoint.set(n,r),this}bezierCurveTo(t,e,n,r,s,o){const a=new t_(this.currentPoint.clone(),new ht(t,e),new ht(n,r),new ht(s,o));return this.curves.push(a),this.currentPoint.set(s,o),this}splineThru(t){const e=[this.currentPoint.clone()].concat(t),n=new i_(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,r,s,o){const a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,r,s,o),this}absarc(t,e,n,r,s,o){return this.absellipse(t,e,n,n,r,s,o),this}ellipse(t,e,n,r,s,o,a,l){const c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,r,s,o,a,l),this}absellipse(t,e,n,r,s,o,a,l){const c=new Pu(t,e,n,r,s,o,a,l);if(this.curves.length>0){const u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);const h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){const t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}}class Ll extends Sn{constructor(t=1,e=1,n=1,r=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:r,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};const c=this;r=Math.floor(r),s=Math.floor(s);const h=[],u=[],f=[],d=[];let g=0;const _=[],m=n/2;let p=0;y(),o===!1&&(t>0&&v(!0),e>0&&v(!1)),this.setIndex(h),this.setAttribute("position",new ge(u,3)),this.setAttribute("normal",new ge(f,3)),this.setAttribute("uv",new ge(d,2));function y(){const M=new O,L=new O;let w=0;const C=(e-t)/n;for(let D=0;D<=s;D++){const S=[],E=D/s,I=E*(e-t)+t;for(let G=0;G<=r;G++){const H=G/r,Z=H*l+a,et=Math.sin(Z),X=Math.cos(Z);L.x=I*et,L.y=-E*n+m,L.z=I*X,u.push(L.x,L.y,L.z),M.set(et,C,X).normalize(),f.push(M.x,M.y,M.z),d.push(H,1-E),S.push(g++)}_.push(S)}for(let D=0;D<r;D++)for(let S=0;S<s;S++){const E=_[S][D],I=_[S+1][D],G=_[S+1][D+1],H=_[S][D+1];h.push(E,I,H),h.push(I,G,H),w+=6}c.addGroup(p,w,0),p+=w}function v(M){const L=g,w=new ht,C=new O;let D=0;const S=M===!0?t:e,E=M===!0?1:-1;for(let G=1;G<=r;G++)u.push(0,m*E,0),f.push(0,E,0),d.push(.5,.5),g++;const I=g;for(let G=0;G<=r;G++){const Z=G/r*l+a,et=Math.cos(Z),X=Math.sin(Z);C.x=S*X,C.y=m*E,C.z=S*et,u.push(C.x,C.y,C.z),f.push(0,E,0),w.x=et*.5+.5,w.y=X*.5*E+.5,d.push(w.x,w.y),g++}for(let G=0;G<r;G++){const H=L+G,Z=I+G;M===!0?h.push(Z,Z+1,H):h.push(Z+1,Z,H),D+=3}c.addGroup(p,D,M===!0?1:2),p+=D}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ll(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Du extends Ll{constructor(t=1,e=1,n=32,r=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,n,r,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:r,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Du(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Iu extends Sn{constructor(t=[],e=[],n=1,r=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:r};const s=[],o=[];a(r),c(n),h(),this.setAttribute("position",new ge(s,3)),this.setAttribute("normal",new ge(s.slice(),3)),this.setAttribute("uv",new ge(o,2)),r===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const v=new O,M=new O,L=new O;for(let w=0;w<e.length;w+=3)d(e[w+0],v),d(e[w+1],M),d(e[w+2],L),l(v,M,L,y)}function l(y,v,M,L){const w=L+1,C=[];for(let D=0;D<=w;D++){C[D]=[];const S=y.clone().lerp(M,D/w),E=v.clone().lerp(M,D/w),I=w-D;for(let G=0;G<=I;G++)G===0&&D===w?C[D][G]=S:C[D][G]=S.clone().lerp(E,G/I)}for(let D=0;D<w;D++)for(let S=0;S<2*(w-D)-1;S++){const E=Math.floor(S/2);S%2===0?(f(C[D][E+1]),f(C[D+1][E]),f(C[D][E])):(f(C[D][E+1]),f(C[D+1][E+1]),f(C[D+1][E]))}}function c(y){const v=new O;for(let M=0;M<s.length;M+=3)v.x=s[M+0],v.y=s[M+1],v.z=s[M+2],v.normalize().multiplyScalar(y),s[M+0]=v.x,s[M+1]=v.y,s[M+2]=v.z}function h(){const y=new O;for(let v=0;v<s.length;v+=3){y.x=s[v+0],y.y=s[v+1],y.z=s[v+2];const M=m(y)/2/Math.PI+.5,L=p(y)/Math.PI+.5;o.push(M,1-L)}g(),u()}function u(){for(let y=0;y<o.length;y+=6){const v=o[y+0],M=o[y+2],L=o[y+4],w=Math.max(v,M,L),C=Math.min(v,M,L);w>.9&&C<.1&&(v<.2&&(o[y+0]+=1),M<.2&&(o[y+2]+=1),L<.2&&(o[y+4]+=1))}}function f(y){s.push(y.x,y.y,y.z)}function d(y,v){const M=y*3;v.x=t[M+0],v.y=t[M+1],v.z=t[M+2]}function g(){const y=new O,v=new O,M=new O,L=new O,w=new ht,C=new ht,D=new ht;for(let S=0,E=0;S<s.length;S+=9,E+=6){y.set(s[S+0],s[S+1],s[S+2]),v.set(s[S+3],s[S+4],s[S+5]),M.set(s[S+6],s[S+7],s[S+8]),w.set(o[E+0],o[E+1]),C.set(o[E+2],o[E+3]),D.set(o[E+4],o[E+5]),L.copy(y).add(v).add(M).divideScalar(3);const I=m(L);_(w,E+0,y,I),_(C,E+2,v,I),_(D,E+4,M,I)}}function _(y,v,M,L){L<0&&y.x===1&&(o[v]=y.x-1),M.x===0&&M.z===0&&(o[v]=L/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Iu(t.vertices,t.indices,t.radius,t.details)}}class r_ extends Hd{constructor(t){super(t),this.uuid=Or(),this.type="Shape",this.holes=[]}getPointsHoles(t){const e=[];for(let n=0,r=this.holes.length;n<r;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const r=t.holes[e];this.holes.push(r.clone())}return this}toJSON(){const t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){const r=this.holes[e];t.holes.push(r.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){const r=t.holes[e];this.holes.push(new Hd().fromJSON(r))}return this}}const FT={triangulate:function(i,t,e=2){const n=t&&t.length,r=n?t[0]*e:i.length;let s=s_(i,0,r,e,!0);const o=[];if(!s||s.next===s.prev)return o;let a,l,c,h,u,f,d;if(n&&(s=VT(i,t,s,e)),i.length>80*e){a=c=i[0],l=h=i[1];for(let g=e;g<r;g+=e)u=i[g],f=i[g+1],u<a&&(a=u),f<l&&(l=f),u>c&&(c=u),f>h&&(h=f);d=Math.max(c-a,h-l),d=d!==0?32767/d:0}return bo(s,o,e,a,l,d,0),o}};function s_(i,t,e,n,r){let s,o;if(r===QT(i,t,e,n)>0)for(s=t;s<e;s+=n)o=Vd(s,i[s],i[s+1],o);else for(s=e-n;s>=t;s-=n)o=Vd(s,i[s],i[s+1],o);return o&&Dl(o,o.next)&&(Ao(o),o=o.next),o}function Pr(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Dl(e,e.next)||ue(e.prev,e,e.next)===0)){if(Ao(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function bo(i,t,e,n,r,s,o){if(!i)return;!o&&s&&qT(i,n,r,s);let a=i,l,c;for(;i.prev!==i.next;){if(l=i.prev,c=i.next,s?zT(i,n,r,s):BT(i)){t.push(l.i/e|0),t.push(i.i/e|0),t.push(c.i/e|0),Ao(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=kT(Pr(i),t,e),bo(i,t,e,n,r,s,2)):o===2&&HT(i,t,e,n,r,s):bo(Pr(i),t,e,n,r,s,1);break}}}function BT(i){const t=i.prev,e=i,n=i.next;if(ue(t,e,n)>=0)return!1;const r=t.x,s=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=r<s?r<o?r:o:s<o?s:o,u=a<l?a<c?a:c:l<c?l:c,f=r>s?r>o?r:o:s>o?s:o,d=a>l?a>c?a:c:l>c?l:c;let g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=d&&cs(r,a,s,l,o,c,g.x,g.y)&&ue(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function zT(i,t,e,n){const r=i.prev,s=i,o=i.next;if(ue(r,s,o)>=0)return!1;const a=r.x,l=s.x,c=o.x,h=r.y,u=s.y,f=o.y,d=a<l?a<c?a:c:l<c?l:c,g=h<u?h<f?h:f:u<f?u:f,_=a>l?a>c?a:c:l>c?l:c,m=h>u?h>f?h:f:u>f?u:f,p=Ch(d,g,t,e,n),y=Ch(_,m,t,e,n);let v=i.prevZ,M=i.nextZ;for(;v&&v.z>=p&&M&&M.z<=y;){if(v.x>=d&&v.x<=_&&v.y>=g&&v.y<=m&&v!==r&&v!==o&&cs(a,h,l,u,c,f,v.x,v.y)&&ue(v.prev,v,v.next)>=0||(v=v.prevZ,M.x>=d&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&cs(a,h,l,u,c,f,M.x,M.y)&&ue(M.prev,M,M.next)>=0))return!1;M=M.nextZ}for(;v&&v.z>=p;){if(v.x>=d&&v.x<=_&&v.y>=g&&v.y<=m&&v!==r&&v!==o&&cs(a,h,l,u,c,f,v.x,v.y)&&ue(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;M&&M.z<=y;){if(M.x>=d&&M.x<=_&&M.y>=g&&M.y<=m&&M!==r&&M!==o&&cs(a,h,l,u,c,f,M.x,M.y)&&ue(M.prev,M,M.next)>=0)return!1;M=M.nextZ}return!0}function kT(i,t,e){let n=i;do{const r=n.prev,s=n.next.next;!Dl(r,s)&&o_(r,n,n.next,s)&&To(r,s)&&To(s,r)&&(t.push(r.i/e|0),t.push(n.i/e|0),t.push(s.i/e|0),Ao(n),Ao(n.next),n=i=s),n=n.next}while(n!==i);return Pr(n)}function HT(i,t,e,n,r,s){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&$T(o,a)){let l=a_(o,a);o=Pr(o,o.next),l=Pr(l,l.next),bo(o,t,e,n,r,s,0),bo(l,t,e,n,r,s,0);return}a=a.next}o=o.next}while(o!==i)}function VT(i,t,e,n){const r=[];let s,o,a,l,c;for(s=0,o=t.length;s<o;s++)a=t[s]*n,l=s<o-1?t[s+1]*n:i.length,c=s_(i,a,l,n,!1),c===c.next&&(c.steiner=!0),r.push(KT(c));for(r.sort(GT),s=0;s<r.length;s++)e=WT(r[s],e);return e}function GT(i,t){return i.x-t.x}function WT(i,t){const e=XT(i,t);if(!e)return t;const n=a_(e,i);return Pr(n,n.next),Pr(e,e.next)}function XT(i,t){let e=t,n=-1/0,r;const s=i.x,o=i.y;do{if(o<=e.y&&o>=e.next.y&&e.next.y!==e.y){const f=e.x+(o-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(f<=s&&f>n&&(n=f,r=e.x<e.next.x?e:e.next,f===s))return r}e=e.next}while(e!==t);if(!r)return null;const a=r,l=r.x,c=r.y;let h=1/0,u;e=r;do s>=e.x&&e.x>=l&&s!==e.x&&cs(o<c?s:n,o,l,c,o<c?n:s,o,e.x,e.y)&&(u=Math.abs(o-e.y)/(s-e.x),To(e,i)&&(u<h||u===h&&(e.x>r.x||e.x===r.x&&YT(r,e)))&&(r=e,h=u)),e=e.next;while(e!==a);return r}function YT(i,t){return ue(i.prev,i,t.prev)<0&&ue(t.next,i,i.next)<0}function qT(i,t,e,n){let r=i;do r.z===0&&(r.z=Ch(r.x,r.y,t,e,n)),r.prevZ=r.prev,r.nextZ=r.next,r=r.next;while(r!==i);r.prevZ.nextZ=null,r.prevZ=null,jT(r)}function jT(i){let t,e,n,r,s,o,a,l,c=1;do{for(e=i,i=null,s=null,o=0;e;){for(o++,n=e,a=0,t=0;t<c&&(a++,n=n.nextZ,!!n);t++);for(l=c;a>0||l>0&&n;)a!==0&&(l===0||!n||e.z<=n.z)?(r=e,e=e.nextZ,a--):(r=n,n=n.nextZ,l--),s?s.nextZ=r:i=r,r.prevZ=s,s=r;e=n}s.nextZ=null,c*=2}while(o>1);return i}function Ch(i,t,e,n,r){return i=(i-e)*r|0,t=(t-n)*r|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function KT(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function cs(i,t,e,n,r,s,o,a){return(r-o)*(t-a)>=(i-o)*(s-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(s-a)>=(r-o)*(n-a)}function $T(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!ZT(i,t)&&(To(i,t)&&To(t,i)&&JT(i,t)&&(ue(i.prev,i,t.prev)||ue(i,t.prev,t))||Dl(i,t)&&ue(i.prev,i,i.next)>0&&ue(t.prev,t,t.next)>0)}function ue(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Dl(i,t){return i.x===t.x&&i.y===t.y}function o_(i,t,e,n){const r=Ta(ue(i,t,e)),s=Ta(ue(i,t,n)),o=Ta(ue(e,n,i)),a=Ta(ue(e,n,t));return!!(r!==s&&o!==a||r===0&&ba(i,e,t)||s===0&&ba(i,n,t)||o===0&&ba(e,i,n)||a===0&&ba(e,t,n))}function ba(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Ta(i){return i>0?1:i<0?-1:0}function ZT(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&o_(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function To(i,t){return ue(i.prev,i,i.next)<0?ue(i,t,i.next)>=0&&ue(i,i.prev,t)>=0:ue(i,t,i.prev)<0||ue(i,i.next,t)<0}function JT(i,t){let e=i,n=!1;const r=(i.x+t.x)/2,s=(i.y+t.y)/2;do e.y>s!=e.next.y>s&&e.next.y!==e.y&&r<(e.next.x-e.x)*(s-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function a_(i,t){const e=new Rh(i.i,i.x,i.y),n=new Rh(t.i,t.x,t.y),r=i.next,s=t.prev;return i.next=t,t.prev=i,e.next=r,r.prev=e,n.next=e,e.prev=n,s.next=n,n.prev=s,n}function Vd(i,t,e,n){const r=new Rh(i,t,e);return n?(r.next=n.next,r.prev=n,n.next.prev=r,n.next=r):(r.prev=r,r.next=r),r}function Ao(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Rh(i,t,e){this.i=i,this.x=t,this.y=e,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}function QT(i,t,e,n){let r=0;for(let s=t,o=e-n;s<e;s+=n)r+=(i[o]-i[s])*(i[s+1]+i[o+1]),o=s;return r}class fo{static area(t){const e=t.length;let n=0;for(let r=e-1,s=0;s<e;r=s++)n+=t[r].x*t[s].y-t[s].x*t[r].y;return n*.5}static isClockWise(t){return fo.area(t)<0}static triangulateShape(t,e){const n=[],r=[],s=[];Gd(t),Wd(n,t);let o=t.length;e.forEach(Gd);for(let l=0;l<e.length;l++)r.push(o),o+=e[l].length,Wd(n,e[l]);const a=FT.triangulate(n,r);for(let l=0;l<a.length;l+=3)s.push(a.slice(l,l+3));return s}}function Gd(i){const t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Wd(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}class Uu extends Sn{constructor(t=new r_([new ht(.5,.5),new ht(-.5,.5),new ht(-.5,-.5),new ht(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];const n=this,r=[],s=[];for(let a=0,l=t.length;a<l;a++){const c=t[a];o(c)}this.setAttribute("position",new ge(r,3)),this.setAttribute("uv",new ge(s,2)),this.computeVertexNormals();function o(a){const l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1;let f=e.bevelEnabled!==void 0?e.bevelEnabled:!0,d=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:d-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3;const p=e.extrudePath,y=e.UVGenerator!==void 0?e.UVGenerator:tA;let v,M=!1,L,w,C,D;p&&(v=p.getSpacedPoints(h),M=!0,f=!1,L=p.computeFrenetFrames(h,!1),w=new O,C=new O,D=new O),f||(m=0,d=0,g=0,_=0);const S=a.extractPoints(c);let E=S.shape;const I=S.holes;if(!fo.isClockWise(E)){E=E.reverse();for(let P=0,A=I.length;P<A;P++){const R=I[P];fo.isClockWise(R)&&(I[P]=R.reverse())}}const H=fo.triangulateShape(E,I),Z=E;for(let P=0,A=I.length;P<A;P++){const R=I[P];E=E.concat(R)}function et(P,A,R){return A||console.error("THREE.ExtrudeGeometry: vec does not exist"),P.clone().addScaledVector(A,R)}const X=E.length,$=H.length;function Y(P,A,R){let F,N,K;const V=P.x-A.x,tt=P.y-A.y,b=R.x-P.x,x=R.y-P.y,U=V*V+tt*tt,j=V*x-tt*b;if(Math.abs(j)>Number.EPSILON){const z=Math.sqrt(U),q=Math.sqrt(b*b+x*x),at=A.x-tt/z,it=A.y+V/z,ct=R.x-x/q,Mt=R.y+b/q,ot=((ct-at)*x-(Mt-it)*b)/(V*x-tt*b);F=at+V*ot-P.x,N=it+tt*ot-P.y;const ut=F*F+N*N;if(ut<=2)return new ht(F,N);K=Math.sqrt(ut/2)}else{let z=!1;V>Number.EPSILON?b>Number.EPSILON&&(z=!0):V<-Number.EPSILON?b<-Number.EPSILON&&(z=!0):Math.sign(tt)===Math.sign(x)&&(z=!0),z?(F=-tt,N=V,K=Math.sqrt(U)):(F=V,N=tt,K=Math.sqrt(U/2))}return new ht(F/K,N/K)}const ft=[];for(let P=0,A=Z.length,R=A-1,F=P+1;P<A;P++,R++,F++)R===A&&(R=0),F===A&&(F=0),ft[P]=Y(Z[P],Z[R],Z[F]);const vt=[];let mt,wt=ft.concat();for(let P=0,A=I.length;P<A;P++){const R=I[P];mt=[];for(let F=0,N=R.length,K=N-1,V=F+1;F<N;F++,K++,V++)K===N&&(K=0),V===N&&(V=0),mt[F]=Y(R[F],R[K],R[V]);vt.push(mt),wt=wt.concat(mt)}for(let P=0;P<m;P++){const A=P/m,R=d*Math.cos(A*Math.PI/2),F=g*Math.sin(A*Math.PI/2)+_;for(let N=0,K=Z.length;N<K;N++){const V=et(Z[N],ft[N],F);_t(V.x,V.y,-R)}for(let N=0,K=I.length;N<K;N++){const V=I[N];mt=vt[N];for(let tt=0,b=V.length;tt<b;tt++){const x=et(V[tt],mt[tt],F);_t(x.x,x.y,-R)}}}const Wt=g+_;for(let P=0;P<X;P++){const A=f?et(E[P],wt[P],Wt):E[P];M?(C.copy(L.normals[0]).multiplyScalar(A.x),w.copy(L.binormals[0]).multiplyScalar(A.y),D.copy(v[0]).add(C).add(w),_t(D.x,D.y,D.z)):_t(A.x,A.y,0)}for(let P=1;P<=h;P++)for(let A=0;A<X;A++){const R=f?et(E[A],wt[A],Wt):E[A];M?(C.copy(L.normals[P]).multiplyScalar(R.x),w.copy(L.binormals[P]).multiplyScalar(R.y),D.copy(v[P]).add(C).add(w),_t(D.x,D.y,D.z)):_t(R.x,R.y,u/h*P)}for(let P=m-1;P>=0;P--){const A=P/m,R=d*Math.cos(A*Math.PI/2),F=g*Math.sin(A*Math.PI/2)+_;for(let N=0,K=Z.length;N<K;N++){const V=et(Z[N],ft[N],F);_t(V.x,V.y,u+R)}for(let N=0,K=I.length;N<K;N++){const V=I[N];mt=vt[N];for(let tt=0,b=V.length;tt<b;tt++){const x=et(V[tt],mt[tt],F);M?_t(x.x,x.y+v[h-1].y,v[h-1].x+R):_t(x.x,x.y,u+R)}}}nt(),lt();function nt(){const P=r.length/3;if(f){let A=0,R=X*A;for(let F=0;F<$;F++){const N=H[F];Rt(N[2]+R,N[1]+R,N[0]+R)}A=h+m*2,R=X*A;for(let F=0;F<$;F++){const N=H[F];Rt(N[0]+R,N[1]+R,N[2]+R)}}else{for(let A=0;A<$;A++){const R=H[A];Rt(R[2],R[1],R[0])}for(let A=0;A<$;A++){const R=H[A];Rt(R[0]+X*h,R[1]+X*h,R[2]+X*h)}}n.addGroup(P,r.length/3-P,0)}function lt(){const P=r.length/3;let A=0;yt(Z,A),A+=Z.length;for(let R=0,F=I.length;R<F;R++){const N=I[R];yt(N,A),A+=N.length}n.addGroup(P,r.length/3-P,1)}function yt(P,A){let R=P.length;for(;--R>=0;){const F=R;let N=R-1;N<0&&(N=P.length-1);for(let K=0,V=h+m*2;K<V;K++){const tt=X*K,b=X*(K+1),x=A+F+tt,U=A+N+tt,j=A+N+b,z=A+F+b;It(x,U,j,z)}}}function _t(P,A,R){l.push(P),l.push(A),l.push(R)}function Rt(P,A,R){Lt(P),Lt(A),Lt(R);const F=r.length/3,N=y.generateTopUV(n,r,F-3,F-2,F-1);Xt(N[0]),Xt(N[1]),Xt(N[2])}function It(P,A,R,F){Lt(P),Lt(A),Lt(F),Lt(A),Lt(R),Lt(F);const N=r.length/3,K=y.generateSideWallUV(n,r,N-6,N-3,N-2,N-1);Xt(K[0]),Xt(K[1]),Xt(K[3]),Xt(K[1]),Xt(K[2]),Xt(K[3])}function Lt(P){r.push(l[P*3+0]),r.push(l[P*3+1]),r.push(l[P*3+2])}function Xt(P){s.push(P.x),s.push(P.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){const t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return eA(e,n,t)}static fromJSON(t,e){const n=[];for(let s=0,o=t.shapes.length;s<o;s++){const a=e[t.shapes[s]];n.push(a)}const r=t.options.extrudePath;return r!==void 0&&(t.options.extrudePath=new wh[r.type]().fromJSON(r)),new Uu(n,t.options)}}const tA={generateTopUV:function(i,t,e,n,r){const s=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[r*3],h=t[r*3+1];return[new ht(s,o),new ht(a,l),new ht(c,h)]},generateSideWallUV:function(i,t,e,n,r,s){const o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],f=t[r*3],d=t[r*3+1],g=t[r*3+2],_=t[s*3],m=t[s*3+1],p=t[s*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new ht(o,1-l),new ht(c,1-u),new ht(f,1-g),new ht(_,1-p)]:[new ht(a,1-l),new ht(h,1-u),new ht(d,1-g),new ht(m,1-p)]}};function eA(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,r=i.length;n<r;n++){const s=i[n];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}class tl extends Sn{constructor(t=1,e=32,n=16,r=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:r,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new O,f=new O,d=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const y=[],v=p/n;let M=0;p===0&&o===0?M=.5/e:p===n&&l===Math.PI&&(M=-.5/e);for(let L=0;L<=e;L++){const w=L/e;u.x=-t*Math.cos(r+w*s)*Math.sin(o+v*a),u.y=t*Math.cos(o+v*a),u.z=t*Math.sin(r+w*s)*Math.sin(o+v*a),g.push(u.x,u.y,u.z),f.copy(u).normalize(),_.push(f.x,f.y,f.z),m.push(w+M,1-v),y.push(c++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<e;y++){const v=h[p][y+1],M=h[p][y],L=h[p+1][y],w=h[p+1][y+1];(p!==0||o>0)&&d.push(v,M,w),(p!==n-1||l<Math.PI)&&d.push(M,L,w)}this.setIndex(d),this.setAttribute("position",new ge(g,3)),this.setAttribute("normal",new ge(_,3)),this.setAttribute("uv",new ge(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new tl(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class Mr extends Fr{constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.type="MeshStandardMaterial",this.color=new Gt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bu,this.normalScale=new ht(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class nA extends Fr{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new Gt(16777215),this.specular=new Gt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Gt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=bu,this.normalScale=new ht(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new kn,this.combine=gu,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Nu extends we{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Gt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}const wc=new de,Xd=new O,Yd=new O;class l_{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ht(512,512),this.map=null,this.mapPass=null,this.matrix=new de,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Cu,this._frameExtents=new ht(1,1),this._viewportCount=1,this._viewports=[new Ae(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;Xd.setFromMatrixPosition(t.matrixWorld),e.position.copy(Xd),Yd.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Yd),e.updateMatrixWorld(),wc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(wc),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(wc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class iA extends l_{constructor(){super(new _n(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(t){const e=this.camera,n=Ls*2*t.angle*this.focus,r=this.mapSize.width/this.mapSize.height,s=t.distance||e.far;(n!==e.fov||r!==e.aspect||s!==e.far)&&(e.fov=n,e.aspect=r,e.far=s,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this}}class rA extends Nu{constructor(t,e,n=0,r=Math.PI/3,s=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.target=new we,this.distance=n,this.angle=r,this.penumbra=s,this.decay=o,this.map=null,this.shadow=new iA}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class sA extends l_{constructor(){super(new qm(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class oA extends Nu{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(we.DEFAULT_UP),this.updateMatrix(),this.target=new we,this.shadow=new sA}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class aA extends Nu{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class lA{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=qd(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const e=qd();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}}function qd(){return(typeof performance>"u"?Date:performance).now()}class jd{constructor(t=1,e=0,n=0){return this.radius=t,this.phi=e,this.theta=n,this}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Math.max(1e-6,Math.min(Math.PI-1e-6,this.phi)),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(De(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}}class cA extends ET{constructor(t=10,e=10,n=4473924,r=8947848){n=new Gt(n),r=new Gt(r);const s=e/2,o=t/e,a=t/2,l=[],c=[];for(let f=0,d=0,g=-a;f<=e;f++,g+=o){l.push(-a,0,g,a,0,g),l.push(g,0,-a,g,0,a);const _=f===s?n:r;_.toArray(c,d),d+=3,_.toArray(c,d),d+=3,_.toArray(c,d),d+=3,_.toArray(c,d),d+=3}const h=new Sn;h.setAttribute("position",new ge(l,3)),h.setAttribute("color",new ge(c,3));const u=new Qm({vertexColors:!0,toneMapped:!1});super(h,u),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}}class hA extends Nr{constructor(t,e){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(){}disconnect(){}dispose(){}update(){}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:_u}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=_u);const Kd={type:"change"},Ou={type:"start"},c_={type:"end"},Aa=new wu,$d=new Ui,uA=Math.cos(70*cM.DEG2RAD),Te=new O,Je=2*Math.PI,ee={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Cc=1e-6;class fA extends hA{constructor(t,e=null){super(t,e),this.state=ee.NONE,this.enabled=!0,this.target=new O,this.cursor=new O,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:vs.ROTATE,MIDDLE:vs.DOLLY,RIGHT:vs.PAN},this.touches={ONE:as.ROTATE,TWO:as.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new O,this._lastQuaternion=new Rr,this._lastTargetPosition=new O,this._quat=new Rr().setFromUnitVectors(t.up,new O(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new jd,this._sphericalDelta=new jd,this._scale=1,this._panOffset=new O,this._rotateStart=new ht,this._rotateEnd=new ht,this._rotateDelta=new ht,this._panStart=new ht,this._panEnd=new ht,this._panDelta=new ht,this._dollyStart=new ht,this._dollyEnd=new ht,this._dollyDelta=new ht,this._dollyDirection=new O,this._mouse=new ht,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=pA.bind(this),this._onPointerDown=dA.bind(this),this._onPointerUp=mA.bind(this),this._onContextMenu=SA.bind(this),this._onMouseWheel=vA.bind(this),this._onKeyDown=xA.bind(this),this._onTouchStart=MA.bind(this),this._onTouchMove=yA.bind(this),this._onMouseDown=_A.bind(this),this._onMouseMove=gA.bind(this),this._interceptControlDown=EA.bind(this),this._interceptControlUp=bA.bind(this),this.domElement!==null&&this.connect(),this.update()}connect(){this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Kd),this.update(),this.state=ee.NONE}update(t=null){const e=this.object.position;Te.copy(e).sub(this.target),Te.applyQuaternion(this._quat),this._spherical.setFromVector3(Te),this.autoRotate&&this.state===ee.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,r=this.maxAzimuthAngle;isFinite(n)&&isFinite(r)&&(n<-Math.PI?n+=Je:n>Math.PI&&(n-=Je),r<-Math.PI?r+=Je:r>Math.PI&&(r-=Je),n<=r?this._spherical.theta=Math.max(n,Math.min(r,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+r)/2?Math.max(n,this._spherical.theta):Math.min(r,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let s=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{const o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),s=o!=this._spherical.radius}if(Te.setFromSpherical(this._spherical),Te.applyQuaternion(this._quatInverse),e.copy(this.target).add(Te),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){const a=Te.length();o=this._clampDistance(a*this._scale);const l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),s=!!l}else if(this.object.isOrthographicCamera){const a=new O(this._mouse.x,this._mouse.y,0);a.unproject(this.object);const l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),s=l!==this.object.zoom;const c=new O(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Te.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Aa.origin.copy(this.object.position),Aa.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Aa.direction))<uA?this.object.lookAt(this.target):($d.setFromNormalAndCoplanarPoint(this.object.up,this.target),Aa.intersectPlane($d,this.target))))}else if(this.object.isOrthographicCamera){const o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),s=!0)}return this._scale=1,this._performCursorZoom=!1,s||this._lastPosition.distanceToSquared(this.object.position)>Cc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Cc||this._lastTargetPosition.distanceToSquared(this.target)>Cc?(this.dispatchEvent(Kd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?Je/60*this.autoRotateSpeed*t:Je/60/60*this.autoRotateSpeed}_getZoomScale(t){const e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Te.setFromMatrixColumn(e,0),Te.multiplyScalar(-t),this._panOffset.add(Te)}_panUp(t,e){this.screenSpacePanning===!0?Te.setFromMatrixColumn(e,1):(Te.setFromMatrixColumn(e,0),Te.crossVectors(this.object.up,Te)),Te.multiplyScalar(t),this._panOffset.add(Te)}_pan(t,e){const n=this.domElement;if(this.object.isPerspectiveCamera){const r=this.object.position;Te.copy(r).sub(this.target);let s=Te.length();s*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*s/n.clientHeight,this.object.matrix),this._panUp(2*e*s/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;const n=this.domElement.getBoundingClientRect(),r=t-n.left,s=e-n.top,o=n.width,a=n.height;this._mouse.x=r/o*2-1,this._mouse.y=-(s/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Je*this._rotateDelta.x/e.clientHeight),this._rotateUp(Je*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(Je*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateUp(-Je*this.rotateSpeed/this.domElement.clientHeight):this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(Je*this.rotateSpeed/this.domElement.clientHeight):this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this._rotateLeft(-Je*this.rotateSpeed/this.domElement.clientHeight):this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._rotateStart.set(n,r)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._panStart.set(n,r)}}_handleTouchStartDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,r=t.pageY-e.y,s=Math.sqrt(n*n+r*r);this._dollyStart.set(0,s)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{const n=this._getSecondPointerPosition(t),r=.5*(t.pageX+n.x),s=.5*(t.pageY+n.y);this._rotateEnd.set(r,s)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);const e=this.domElement;this._rotateLeft(Je*this._rotateDelta.x/e.clientHeight),this._rotateUp(Je*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{const e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),r=.5*(t.pageY+e.y);this._panEnd.set(n,r)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){const e=this._getSecondPointerPosition(t),n=t.pageX-e.x,r=t.pageY-e.y,s=Math.sqrt(n*n+r*r);this._dollyEnd.set(0,s),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);const o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new ht,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){const e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){const e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}}function dA(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function pA(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function mA(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(c_),this.state=ee.NONE;break;case 1:const t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function _A(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case vs.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ee.DOLLY;break;case vs.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ee.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ee.ROTATE}break;case vs.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ee.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ee.PAN}break;default:this.state=ee.NONE}this.state!==ee.NONE&&this.dispatchEvent(Ou)}function gA(i){switch(this.state){case ee.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ee.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ee.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function vA(i){this.enabled===!1||this.enableZoom===!1||this.state!==ee.NONE||(i.preventDefault(),this.dispatchEvent(Ou),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(c_))}function xA(i){this.enabled===!1||this.enablePan===!1||this._handleKeyDown(i)}function MA(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case as.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ee.TOUCH_ROTATE;break;case as.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ee.TOUCH_PAN;break;default:this.state=ee.NONE}break;case 2:switch(this.touches.TWO){case as.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ee.TOUCH_DOLLY_PAN;break;case as.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ee.TOUCH_DOLLY_ROTATE;break;default:this.state=ee.NONE}break;default:this.state=ee.NONE}this.state!==ee.NONE&&this.dispatchEvent(Ou)}function yA(i){switch(this._trackPointer(i),this.state){case ee.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ee.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ee.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ee.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ee.NONE}}function SA(i){this.enabled!==!1&&i.preventDefault()}function EA(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function bA(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}const Fe=Ml({containerId:"three-con",ambientLightColor:"#505050",ambientLightIntensity:1,directionalLightColor:"#ffffff",directionalLightIntensity:2.5,isDisabledControls:!1,groundHeight:-.4,conBackgroundColor:"#ca6b35",groundColor:"#f88443",personColor:"#ff470a",addGroundWireframe:!0,levelStart:11,levelStep:10,levelSplitNum:10,startPoint:[0,1]});gs(()=>Fe.isDisabledControls,()=>{Go.changeDisableControls(Fe.isDisabledControls)});gs([()=>Fe.ambientLightColor,()=>Fe.ambientLightIntensity],()=>{Go.changeAmbientLight(Fe.ambientLightColor,Fe.ambientLightIntensity)});gs([()=>Fe.directionalLightColor,()=>Fe.directionalLightIntensity],()=>{Go.changeDirLight(Fe.directionalLightColor,Fe.directionalLightIntensity)});function pi(i){if(i===void 0)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return i}function h_(i,t){i.prototype=Object.create(t.prototype),i.prototype.constructor=i,i.__proto__=t}/*!
 * GSAP 3.12.5
 * https://gsap.com
 *
 * @license Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var Mn={autoSleep:120,force3D:"auto",nullTargetWarn:1,units:{lineHeight:""}},Is={duration:.5,overwrite:!1,delay:0},Fu,Ve,ce,Cn=1e8,ae=1/Cn,Ph=Math.PI*2,TA=Ph/4,AA=0,u_=Math.sqrt,wA=Math.cos,CA=Math.sin,Ue=function(t){return typeof t=="string"},_e=function(t){return typeof t=="function"},yi=function(t){return typeof t=="number"},Bu=function(t){return typeof t>"u"},ii=function(t){return typeof t=="object"},en=function(t){return t!==!1},zu=function(){return typeof window<"u"},wa=function(t){return _e(t)||Ue(t)},f_=typeof ArrayBuffer=="function"&&ArrayBuffer.isView||function(){},Ge=Array.isArray,Lh=/(?:-?\.?\d|\.)+/gi,d_=/[-+=.]*\d+[.e\-+]*\d*[e\-+]*\d*/g,hs=/[-+=.]*\d+[.e-]*\d*[a-z%]*/g,Rc=/[-+=.]*\d+\.?\d*(?:e-|e\+)?\d*/gi,p_=/[+-]=-?[.\d]+/,m_=/[^,'"\[\]\s]+/gi,RA=/^[+\-=e\s\d]*\d+[.\d]*([a-z]*|%)\s*$/i,he,Xn,Dh,ku,yn={},el={},__,g_=function(t){return(el=Lr(t,yn))&&on},Hu=function(t,e){return console.warn("Invalid property",t,"set to",e,"Missing plugin? gsap.registerPlugin()")},wo=function(t,e){return!e&&console.warn(t)},v_=function(t,e){return t&&(yn[t]=e)&&el&&(el[t]=e)||yn},Co=function(){return 0},PA={suppressEvents:!0,isStart:!0,kill:!1},Ba={suppressEvents:!0,kill:!1},LA={suppressEvents:!0},Vu={},Gi=[],Ih={},x_,pn={},Pc={},Zd=30,za=[],Gu="",Wu=function(t){var e=t[0],n,r;if(ii(e)||_e(e)||(t=[t]),!(n=(e._gsap||{}).harness)){for(r=za.length;r--&&!za[r].targetTest(e););n=za[r]}for(r=t.length;r--;)t[r]&&(t[r]._gsap||(t[r]._gsap=new G_(t[r],n)))||t.splice(r,1);return t},yr=function(t){return t._gsap||Wu(Rn(t))[0]._gsap},M_=function(t,e,n){return(n=t[e])&&_e(n)?t[e]():Bu(n)&&t.getAttribute&&t.getAttribute(e)||n},nn=function(t,e){return(t=t.split(",")).forEach(e)||t},xe=function(t){return Math.round(t*1e5)/1e5||0},Ie=function(t){return Math.round(t*1e7)/1e7||0},Ss=function(t,e){var n=e.charAt(0),r=parseFloat(e.substr(2));return t=parseFloat(t),n==="+"?t+r:n==="-"?t-r:n==="*"?t*r:t/r},DA=function(t,e){for(var n=e.length,r=0;t.indexOf(e[r])<0&&++r<n;);return r<n},nl=function(){var t=Gi.length,e=Gi.slice(0),n,r;for(Ih={},Gi.length=0,n=0;n<t;n++)r=e[n],r&&r._lazy&&(r.render(r._lazy[0],r._lazy[1],!0)._lazy=0)},y_=function(t,e,n,r){Gi.length&&!Ve&&nl(),t.render(e,n,r||Ve&&e<0&&(t._initted||t._startAt)),Gi.length&&!Ve&&nl()},S_=function(t){var e=parseFloat(t);return(e||e===0)&&(t+"").match(m_).length<2?e:Ue(t)?t.trim():t},E_=function(t){return t},Pn=function(t,e){for(var n in e)n in t||(t[n]=e[n]);return t},IA=function(t){return function(e,n){for(var r in n)r in e||r==="duration"&&t||r==="ease"||(e[r]=n[r])}},Lr=function(t,e){for(var n in e)t[n]=e[n];return t},Jd=function i(t,e){for(var n in e)n!=="__proto__"&&n!=="constructor"&&n!=="prototype"&&(t[n]=ii(e[n])?i(t[n]||(t[n]={}),e[n]):e[n]);return t},il=function(t,e){var n={},r;for(r in t)r in e||(n[r]=t[r]);return n},po=function(t){var e=t.parent||he,n=t.keyframes?IA(Ge(t.keyframes)):Pn;if(en(t.inherit))for(;e;)n(t,e.vars.defaults),e=e.parent||e._dp;return t},UA=function(t,e){for(var n=t.length,r=n===e.length;r&&n--&&t[n]===e[n];);return n<0},b_=function(t,e,n,r,s){n===void 0&&(n="_first"),r===void 0&&(r="_last");var o=t[r],a;if(s)for(a=e[s];o&&o[s]>a;)o=o._prev;return o?(e._next=o._next,o._next=e):(e._next=t[n],t[n]=e),e._next?e._next._prev=e:t[r]=e,e._prev=o,e.parent=e._dp=t,e},Il=function(t,e,n,r){n===void 0&&(n="_first"),r===void 0&&(r="_last");var s=e._prev,o=e._next;s?s._next=o:t[n]===e&&(t[n]=o),o?o._prev=s:t[r]===e&&(t[r]=s),e._next=e._prev=e.parent=null},qi=function(t,e){t.parent&&(!e||t.parent.autoRemoveChildren)&&t.parent.remove&&t.parent.remove(t),t._act=0},Sr=function(t,e){if(t&&(!e||e._end>t._dur||e._start<0))for(var n=t;n;)n._dirty=1,n=n.parent;return t},NA=function(t){for(var e=t.parent;e&&e.parent;)e._dirty=1,e.totalDuration(),e=e.parent;return t},Uh=function(t,e,n,r){return t._startAt&&(Ve?t._startAt.revert(Ba):t.vars.immediateRender&&!t.vars.autoRevert||t._startAt.render(e,!0,r))},OA=function i(t){return!t||t._ts&&i(t.parent)},Qd=function(t){return t._repeat?Us(t._tTime,t=t.duration()+t._rDelay)*t:0},Us=function(t,e){var n=Math.floor(t/=e);return t&&n===t?n-1:n},rl=function(t,e){return(t-e._start)*e._ts+(e._ts>=0?0:e._dirty?e.totalDuration():e._tDur)},Ul=function(t){return t._end=Ie(t._start+(t._tDur/Math.abs(t._ts||t._rts||ae)||0))},Nl=function(t,e){var n=t._dp;return n&&n.smoothChildTiming&&t._ts&&(t._start=Ie(n._time-(t._ts>0?e/t._ts:((t._dirty?t.totalDuration():t._tDur)-e)/-t._ts)),Ul(t),n._dirty||Sr(n,t)),t},T_=function(t,e){var n;if((e._time||!e._dur&&e._initted||e._start<t._time&&(e._dur||!e.add))&&(n=rl(t.rawTime(),e),(!e._dur||Vo(0,e.totalDuration(),n)-e._tTime>ae)&&e.render(n,!0)),Sr(t,e)._dp&&t._initted&&t._time>=t._dur&&t._ts){if(t._dur<t.duration())for(n=t;n._dp;)n.rawTime()>=0&&n.totalTime(n._tTime),n=n._dp;t._zTime=-ae}},$n=function(t,e,n,r){return e.parent&&qi(e),e._start=Ie((yi(n)?n:n||t!==he?An(t,n,e):t._time)+e._delay),e._end=Ie(e._start+(e.totalDuration()/Math.abs(e.timeScale())||0)),b_(t,e,"_first","_last",t._sort?"_start":0),Nh(e)||(t._recent=e),r||T_(t,e),t._ts<0&&Nl(t,t._tTime),t},A_=function(t,e){return(yn.ScrollTrigger||Hu("scrollTrigger",e))&&yn.ScrollTrigger.create(e,t)},w_=function(t,e,n,r,s){if(Yu(t,e,s),!t._initted)return 1;if(!n&&t._pt&&!Ve&&(t._dur&&t.vars.lazy!==!1||!t._dur&&t.vars.lazy)&&x_!==gn.frame)return Gi.push(t),t._lazy=[s,r],1},FA=function i(t){var e=t.parent;return e&&e._ts&&e._initted&&!e._lock&&(e.rawTime()<0||i(e))},Nh=function(t){var e=t.data;return e==="isFromStart"||e==="isStart"},BA=function(t,e,n,r){var s=t.ratio,o=e<0||!e&&(!t._start&&FA(t)&&!(!t._initted&&Nh(t))||(t._ts<0||t._dp._ts<0)&&!Nh(t))?0:1,a=t._rDelay,l=0,c,h,u;if(a&&t._repeat&&(l=Vo(0,t._tDur,e),h=Us(l,a),t._yoyo&&h&1&&(o=1-o),h!==Us(t._tTime,a)&&(s=1-o,t.vars.repeatRefresh&&t._initted&&t.invalidate())),o!==s||Ve||r||t._zTime===ae||!e&&t._zTime){if(!t._initted&&w_(t,e,r,n,l))return;for(u=t._zTime,t._zTime=e||(n?ae:0),n||(n=e&&!u),t.ratio=o,t._from&&(o=1-o),t._time=0,t._tTime=l,c=t._pt;c;)c.r(o,c.d),c=c._next;e<0&&Uh(t,e,n,!0),t._onUpdate&&!n&&xn(t,"onUpdate"),l&&t._repeat&&!n&&t.parent&&xn(t,"onRepeat"),(e>=t._tDur||e<0)&&t.ratio===o&&(o&&qi(t,1),!n&&!Ve&&(xn(t,o?"onComplete":"onReverseComplete",!0),t._prom&&t._prom()))}else t._zTime||(t._zTime=e)},zA=function(t,e,n){var r;if(n>e)for(r=t._first;r&&r._start<=n;){if(r.data==="isPause"&&r._start>e)return r;r=r._next}else for(r=t._last;r&&r._start>=n;){if(r.data==="isPause"&&r._start<e)return r;r=r._prev}},Ns=function(t,e,n,r){var s=t._repeat,o=Ie(e)||0,a=t._tTime/t._tDur;return a&&!r&&(t._time*=o/t._dur),t._dur=o,t._tDur=s?s<0?1e10:Ie(o*(s+1)+t._rDelay*s):o,a>0&&!r&&Nl(t,t._tTime=t._tDur*a),t.parent&&Ul(t),n||Sr(t.parent,t),t},tp=function(t){return t instanceof $e?Sr(t):Ns(t,t._dur)},kA={_start:0,endTime:Co,totalDuration:Co},An=function i(t,e,n){var r=t.labels,s=t._recent||kA,o=t.duration()>=Cn?s.endTime(!1):t._dur,a,l,c;return Ue(e)&&(isNaN(e)||e in r)?(l=e.charAt(0),c=e.substr(-1)==="%",a=e.indexOf("="),l==="<"||l===">"?(a>=0&&(e=e.replace(/=/,"")),(l==="<"?s._start:s.endTime(s._repeat>=0))+(parseFloat(e.substr(1))||0)*(c?(a<0?s:n).totalDuration()/100:1)):a<0?(e in r||(r[e]=o),r[e]):(l=parseFloat(e.charAt(a-1)+e.substr(a+1)),c&&n&&(l=l/100*(Ge(n)?n[0]:n).totalDuration()),a>1?i(t,e.substr(0,a-1),n)+l:o+l)):e==null?o:+e},mo=function(t,e,n){var r=yi(e[1]),s=(r?2:1)+(t<2?0:1),o=e[s],a,l;if(r&&(o.duration=e[1]),o.parent=n,t){for(a=o,l=n;l&&!("immediateRender"in a);)a=l.vars.defaults||{},l=en(l.vars.inherit)&&l.parent;o.immediateRender=en(a.immediateRender),t<2?o.runBackwards=1:o.startAt=e[s-1]}return new Ee(e[0],o,e[s+1])},Qi=function(t,e){return t||t===0?e(t):e},Vo=function(t,e,n){return n<t?t:n>e?e:n},He=function(t,e){return!Ue(t)||!(e=RA.exec(t))?"":e[1]},HA=function(t,e,n){return Qi(n,function(r){return Vo(t,e,r)})},Oh=[].slice,C_=function(t,e){return t&&ii(t)&&"length"in t&&(!e&&!t.length||t.length-1 in t&&ii(t[0]))&&!t.nodeType&&t!==Xn},VA=function(t,e,n){return n===void 0&&(n=[]),t.forEach(function(r){var s;return Ue(r)&&!e||C_(r,1)?(s=n).push.apply(s,Rn(r)):n.push(r)})||n},Rn=function(t,e,n){return ce&&!e&&ce.selector?ce.selector(t):Ue(t)&&!n&&(Dh||!Os())?Oh.call((e||ku).querySelectorAll(t),0):Ge(t)?VA(t,n):C_(t)?Oh.call(t,0):t?[t]:[]},Fh=function(t){return t=Rn(t)[0]||wo("Invalid scope")||{},function(e){var n=t.current||t.nativeElement||t;return Rn(e,n.querySelectorAll?n:n===t?wo("Invalid scope")||ku.createElement("div"):t)}},R_=function(t){return t.sort(function(){return .5-Math.random()})},P_=function(t){if(_e(t))return t;var e=ii(t)?t:{each:t},n=Er(e.ease),r=e.from||0,s=parseFloat(e.base)||0,o={},a=r>0&&r<1,l=isNaN(r)||a,c=e.axis,h=r,u=r;return Ue(r)?h=u={center:.5,edges:.5,end:1}[r]||0:!a&&l&&(h=r[0],u=r[1]),function(f,d,g){var _=(g||e).length,m=o[_],p,y,v,M,L,w,C,D,S;if(!m){if(S=e.grid==="auto"?0:(e.grid||[1,Cn])[1],!S){for(C=-Cn;C<(C=g[S++].getBoundingClientRect().left)&&S<_;);S<_&&S--}for(m=o[_]=[],p=l?Math.min(S,_)*h-.5:r%S,y=S===Cn?0:l?_*u/S-.5:r/S|0,C=0,D=Cn,w=0;w<_;w++)v=w%S-p,M=y-(w/S|0),m[w]=L=c?Math.abs(c==="y"?M:v):u_(v*v+M*M),L>C&&(C=L),L<D&&(D=L);r==="random"&&R_(m),m.max=C-D,m.min=D,m.v=_=(parseFloat(e.amount)||parseFloat(e.each)*(S>_?_-1:c?c==="y"?_/S:S:Math.max(S,_/S))||0)*(r==="edges"?-1:1),m.b=_<0?s-_:s,m.u=He(e.amount||e.each)||0,n=n&&_<0?k_(n):n}return _=(m[f]-m.min)/m.max||0,Ie(m.b+(n?n(_):_)*m.v)+m.u}},Bh=function(t){var e=Math.pow(10,((t+"").split(".")[1]||"").length);return function(n){var r=Ie(Math.round(parseFloat(n)/t)*t*e);return(r-r%1)/e+(yi(n)?0:He(n))}},L_=function(t,e){var n=Ge(t),r,s;return!n&&ii(t)&&(r=n=t.radius||Cn,t.values?(t=Rn(t.values),(s=!yi(t[0]))&&(r*=r)):t=Bh(t.increment)),Qi(e,n?_e(t)?function(o){return s=t(o),Math.abs(s-o)<=r?s:o}:function(o){for(var a=parseFloat(s?o.x:o),l=parseFloat(s?o.y:0),c=Cn,h=0,u=t.length,f,d;u--;)s?(f=t[u].x-a,d=t[u].y-l,f=f*f+d*d):f=Math.abs(t[u]-a),f<c&&(c=f,h=u);return h=!r||c<=r?t[h]:o,s||h===o||yi(o)?h:h+He(o)}:Bh(t))},D_=function(t,e,n,r){return Qi(Ge(t)?!e:n===!0?!!(n=0):!r,function(){return Ge(t)?t[~~(Math.random()*t.length)]:(n=n||1e-5)&&(r=n<1?Math.pow(10,(n+"").length-2):1)&&Math.floor(Math.round((t-n/2+Math.random()*(e-t+n*.99))/n)*n*r)/r})},GA=function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];return function(r){return e.reduce(function(s,o){return o(s)},r)}},WA=function(t,e){return function(n){return t(parseFloat(n))+(e||He(n))}},XA=function(t,e,n){return U_(t,e,0,1,n)},I_=function(t,e,n){return Qi(n,function(r){return t[~~e(r)]})},YA=function i(t,e,n){var r=e-t;return Ge(t)?I_(t,i(0,t.length),e):Qi(n,function(s){return(r+(s-t)%r)%r+t})},qA=function i(t,e,n){var r=e-t,s=r*2;return Ge(t)?I_(t,i(0,t.length-1),e):Qi(n,function(o){return o=(s+(o-t)%s)%s||0,t+(o>r?s-o:o)})},Ro=function(t){for(var e=0,n="",r,s,o,a;~(r=t.indexOf("random(",e));)o=t.indexOf(")",r),a=t.charAt(r+7)==="[",s=t.substr(r+7,o-r-7).match(a?m_:Lh),n+=t.substr(e,r-e)+D_(a?s:+s[0],a?0:+s[1],+s[2]||1e-5),e=o+1;return n+t.substr(e,t.length-e)},U_=function(t,e,n,r,s){var o=e-t,a=r-n;return Qi(s,function(l){return n+((l-t)/o*a||0)})},jA=function i(t,e,n,r){var s=isNaN(t+e)?0:function(d){return(1-d)*t+d*e};if(!s){var o=Ue(t),a={},l,c,h,u,f;if(n===!0&&(r=1)&&(n=null),o)t={p:t},e={p:e};else if(Ge(t)&&!Ge(e)){for(h=[],u=t.length,f=u-2,c=1;c<u;c++)h.push(i(t[c-1],t[c]));u--,s=function(g){g*=u;var _=Math.min(f,~~g);return h[_](g-_)},n=e}else r||(t=Lr(Ge(t)?[]:{},t));if(!h){for(l in e)Xu.call(a,t,l,"get",e[l]);s=function(g){return Ku(g,a)||(o?t.p:t)}}}return Qi(n,s)},ep=function(t,e,n){var r=t.labels,s=Cn,o,a,l;for(o in r)a=r[o]-e,a<0==!!n&&a&&s>(a=Math.abs(a))&&(l=o,s=a);return l},xn=function(t,e,n){var r=t.vars,s=r[e],o=ce,a=t._ctx,l,c,h;if(!!s)return l=r[e+"Params"],c=r.callbackScope||t,n&&Gi.length&&nl(),a&&(ce=a),h=l?s.apply(c,l):s.call(c),ce=o,h},Qs=function(t){return qi(t),t.scrollTrigger&&t.scrollTrigger.kill(!!Ve),t.progress()<1&&xn(t,"onInterrupt"),t},us,N_=[],O_=function(t){if(!!t)if(t=!t.name&&t.default||t,zu()||t.headless){var e=t.name,n=_e(t),r=e&&!n&&t.init?function(){this._props=[]}:t,s={init:Co,render:Ku,add:Xu,kill:h1,modifier:c1,rawVars:0},o={targetTest:0,get:0,getSetter:ju,aliases:{},register:0};if(Os(),t!==r){if(pn[e])return;Pn(r,Pn(il(t,s),o)),Lr(r.prototype,Lr(s,il(t,o))),pn[r.prop=e]=r,t.targetTest&&(za.push(r),Vu[e]=1),e=(e==="css"?"CSS":e.charAt(0).toUpperCase()+e.substr(1))+"Plugin"}v_(e,r),t.register&&t.register(on,r,rn)}else N_.push(t)},re=255,to={aqua:[0,re,re],lime:[0,re,0],silver:[192,192,192],black:[0,0,0],maroon:[128,0,0],teal:[0,128,128],blue:[0,0,re],navy:[0,0,128],white:[re,re,re],olive:[128,128,0],yellow:[re,re,0],orange:[re,165,0],gray:[128,128,128],purple:[128,0,128],green:[0,128,0],red:[re,0,0],pink:[re,192,203],cyan:[0,re,re],transparent:[re,re,re,0]},Lc=function(t,e,n){return t+=t<0?1:t>1?-1:0,(t*6<1?e+(n-e)*t*6:t<.5?n:t*3<2?e+(n-e)*(2/3-t)*6:e)*re+.5|0},F_=function(t,e,n){var r=t?yi(t)?[t>>16,t>>8&re,t&re]:0:to.black,s,o,a,l,c,h,u,f,d,g;if(!r){if(t.substr(-1)===","&&(t=t.substr(0,t.length-1)),to[t])r=to[t];else if(t.charAt(0)==="#"){if(t.length<6&&(s=t.charAt(1),o=t.charAt(2),a=t.charAt(3),t="#"+s+s+o+o+a+a+(t.length===5?t.charAt(4)+t.charAt(4):"")),t.length===9)return r=parseInt(t.substr(1,6),16),[r>>16,r>>8&re,r&re,parseInt(t.substr(7),16)/255];t=parseInt(t.substr(1),16),r=[t>>16,t>>8&re,t&re]}else if(t.substr(0,3)==="hsl"){if(r=g=t.match(Lh),!e)l=+r[0]%360/360,c=+r[1]/100,h=+r[2]/100,o=h<=.5?h*(c+1):h+c-h*c,s=h*2-o,r.length>3&&(r[3]*=1),r[0]=Lc(l+1/3,s,o),r[1]=Lc(l,s,o),r[2]=Lc(l-1/3,s,o);else if(~t.indexOf("="))return r=t.match(d_),n&&r.length<4&&(r[3]=1),r}else r=t.match(Lh)||to.transparent;r=r.map(Number)}return e&&!g&&(s=r[0]/re,o=r[1]/re,a=r[2]/re,u=Math.max(s,o,a),f=Math.min(s,o,a),h=(u+f)/2,u===f?l=c=0:(d=u-f,c=h>.5?d/(2-u-f):d/(u+f),l=u===s?(o-a)/d+(o<a?6:0):u===o?(a-s)/d+2:(s-o)/d+4,l*=60),r[0]=~~(l+.5),r[1]=~~(c*100+.5),r[2]=~~(h*100+.5)),n&&r.length<4&&(r[3]=1),r},B_=function(t){var e=[],n=[],r=-1;return t.split(Wi).forEach(function(s){var o=s.match(hs)||[];e.push.apply(e,o),n.push(r+=o.length+1)}),e.c=n,e},np=function(t,e,n){var r="",s=(t+r).match(Wi),o=e?"hsla(":"rgba(",a=0,l,c,h,u;if(!s)return t;if(s=s.map(function(f){return(f=F_(f,e,1))&&o+(e?f[0]+","+f[1]+"%,"+f[2]+"%,"+f[3]:f.join(","))+")"}),n&&(h=B_(t),l=n.c,l.join(r)!==h.c.join(r)))for(c=t.replace(Wi,"1").split(hs),u=c.length-1;a<u;a++)r+=c[a]+(~l.indexOf(a)?s.shift()||o+"0,0,0,0)":(h.length?h:s.length?s:n).shift());if(!c)for(c=t.split(Wi),u=c.length-1;a<u;a++)r+=c[a]+s[a];return r+c[u]},Wi=function(){var i="(?:\\b(?:(?:rgb|rgba|hsl|hsla)\\(.+?\\))|\\B#(?:[0-9a-f]{3,4}){1,2}\\b",t;for(t in to)i+="|"+t+"\\b";return new RegExp(i+")","gi")}(),KA=/hsl[a]?\(/,z_=function(t){var e=t.join(" "),n;if(Wi.lastIndex=0,Wi.test(e))return n=KA.test(e),t[1]=np(t[1],n),t[0]=np(t[0],n,B_(t[1])),!0},Po,gn=function(){var i=Date.now,t=500,e=33,n=i(),r=n,s=1e3/240,o=s,a=[],l,c,h,u,f,d,g=function _(m){var p=i()-r,y=m===!0,v,M,L,w;if((p>t||p<0)&&(n+=p-e),r+=p,L=r-n,v=L-o,(v>0||y)&&(w=++u.frame,f=L-u.time*1e3,u.time=L=L/1e3,o+=v+(v>=s?4:s-v),M=1),y||(l=c(_)),M)for(d=0;d<a.length;d++)a[d](L,f,w,m)};return u={time:0,frame:0,tick:function(){g(!0)},deltaRatio:function(m){return f/(1e3/(m||60))},wake:function(){__&&(!Dh&&zu()&&(Xn=Dh=window,ku=Xn.document||{},yn.gsap=on,(Xn.gsapVersions||(Xn.gsapVersions=[])).push(on.version),g_(el||Xn.GreenSockGlobals||!Xn.gsap&&Xn||{}),N_.forEach(O_)),h=typeof requestAnimationFrame<"u"&&requestAnimationFrame,l&&u.sleep(),c=h||function(m){return setTimeout(m,o-u.time*1e3+1|0)},Po=1,g(2))},sleep:function(){(h?cancelAnimationFrame:clearTimeout)(l),Po=0,c=Co},lagSmoothing:function(m,p){t=m||1/0,e=Math.min(p||33,t)},fps:function(m){s=1e3/(m||240),o=u.time*1e3+s},add:function(m,p,y){var v=p?function(M,L,w,C){m(M,L,w,C),u.remove(v)}:m;return u.remove(m),a[y?"unshift":"push"](v),Os(),v},remove:function(m,p){~(p=a.indexOf(m))&&a.splice(p,1)&&d>=p&&d--},_listeners:a},u}(),Os=function(){return!Po&&gn.wake()},Yt={},$A=/^[\d.\-M][\d.\-,\s]/,ZA=/["']/g,JA=function(t){for(var e={},n=t.substr(1,t.length-3).split(":"),r=n[0],s=1,o=n.length,a,l,c;s<o;s++)l=n[s],a=s!==o-1?l.lastIndexOf(","):l.length,c=l.substr(0,a),e[r]=isNaN(c)?c.replace(ZA,"").trim():+c,r=l.substr(a+1).trim();return e},QA=function(t){var e=t.indexOf("(")+1,n=t.indexOf(")"),r=t.indexOf("(",e);return t.substring(e,~r&&r<n?t.indexOf(")",n+1):n)},t1=function(t){var e=(t+"").split("("),n=Yt[e[0]];return n&&e.length>1&&n.config?n.config.apply(null,~t.indexOf("{")?[JA(e[1])]:QA(t).split(",").map(S_)):Yt._CE&&$A.test(t)?Yt._CE("",t):n},k_=function(t){return function(e){return 1-t(1-e)}},H_=function i(t,e){for(var n=t._first,r;n;)n instanceof $e?i(n,e):n.vars.yoyoEase&&(!n._yoyo||!n._repeat)&&n._yoyo!==e&&(n.timeline?i(n.timeline,e):(r=n._ease,n._ease=n._yEase,n._yEase=r,n._yoyo=e)),n=n._next},Er=function(t,e){return t&&(_e(t)?t:Yt[t]||t1(t))||e},Br=function(t,e,n,r){n===void 0&&(n=function(l){return 1-e(1-l)}),r===void 0&&(r=function(l){return l<.5?e(l*2)/2:1-e((1-l)*2)/2});var s={easeIn:e,easeOut:n,easeInOut:r},o;return nn(t,function(a){Yt[a]=yn[a]=s,Yt[o=a.toLowerCase()]=n;for(var l in s)Yt[o+(l==="easeIn"?".in":l==="easeOut"?".out":".inOut")]=Yt[a+"."+l]=s[l]}),s},V_=function(t){return function(e){return e<.5?(1-t(1-e*2))/2:.5+t((e-.5)*2)/2}},Dc=function i(t,e,n){var r=e>=1?e:1,s=(n||(t?.3:.45))/(e<1?e:1),o=s/Ph*(Math.asin(1/r)||0),a=function(h){return h===1?1:r*Math.pow(2,-10*h)*CA((h-o)*s)+1},l=t==="out"?a:t==="in"?function(c){return 1-a(1-c)}:V_(a);return s=Ph/s,l.config=function(c,h){return i(t,c,h)},l},Ic=function i(t,e){e===void 0&&(e=1.70158);var n=function(o){return o?--o*o*((e+1)*o+e)+1:0},r=t==="out"?n:t==="in"?function(s){return 1-n(1-s)}:V_(n);return r.config=function(s){return i(t,s)},r};nn("Linear,Quad,Cubic,Quart,Quint,Strong",function(i,t){var e=t<5?t+1:t;Br(i+",Power"+(e-1),t?function(n){return Math.pow(n,e)}:function(n){return n},function(n){return 1-Math.pow(1-n,e)},function(n){return n<.5?Math.pow(n*2,e)/2:1-Math.pow((1-n)*2,e)/2})});Yt.Linear.easeNone=Yt.none=Yt.Linear.easeIn;Br("Elastic",Dc("in"),Dc("out"),Dc());(function(i,t){var e=1/t,n=2*e,r=2.5*e,s=function(a){return a<e?i*a*a:a<n?i*Math.pow(a-1.5/t,2)+.75:a<r?i*(a-=2.25/t)*a+.9375:i*Math.pow(a-2.625/t,2)+.984375};Br("Bounce",function(o){return 1-s(1-o)},s)})(7.5625,2.75);Br("Expo",function(i){return i?Math.pow(2,10*(i-1)):0});Br("Circ",function(i){return-(u_(1-i*i)-1)});Br("Sine",function(i){return i===1?1:-wA(i*TA)+1});Br("Back",Ic("in"),Ic("out"),Ic());Yt.SteppedEase=Yt.steps=yn.SteppedEase={config:function(t,e){t===void 0&&(t=1);var n=1/t,r=t+(e?0:1),s=e?1:0,o=1-ae;return function(a){return((r*Vo(0,o,a)|0)+s)*n}}};Is.ease=Yt["quad.out"];nn("onComplete,onUpdate,onStart,onRepeat,onReverseComplete,onInterrupt",function(i){return Gu+=i+","+i+"Params,"});var G_=function(t,e){this.id=AA++,t._gsap=this,this.target=t,this.harness=e,this.get=e?e.get:M_,this.set=e?e.getSetter:ju},Lo=function(){function i(e){this.vars=e,this._delay=+e.delay||0,(this._repeat=e.repeat===1/0?-2:e.repeat||0)&&(this._rDelay=e.repeatDelay||0,this._yoyo=!!e.yoyo||!!e.yoyoEase),this._ts=1,Ns(this,+e.duration,1,1),this.data=e.data,ce&&(this._ctx=ce,ce.data.push(this)),Po||gn.wake()}var t=i.prototype;return t.delay=function(n){return n||n===0?(this.parent&&this.parent.smoothChildTiming&&this.startTime(this._start+n-this._delay),this._delay=n,this):this._delay},t.duration=function(n){return arguments.length?this.totalDuration(this._repeat>0?n+(n+this._rDelay)*this._repeat:n):this.totalDuration()&&this._dur},t.totalDuration=function(n){return arguments.length?(this._dirty=0,Ns(this,this._repeat<0?n:(n-this._repeat*this._rDelay)/(this._repeat+1))):this._tDur},t.totalTime=function(n,r){if(Os(),!arguments.length)return this._tTime;var s=this._dp;if(s&&s.smoothChildTiming&&this._ts){for(Nl(this,n),!s._dp||s.parent||T_(s,this);s&&s.parent;)s.parent._time!==s._start+(s._ts>=0?s._tTime/s._ts:(s.totalDuration()-s._tTime)/-s._ts)&&s.totalTime(s._tTime,!0),s=s.parent;!this.parent&&this._dp.autoRemoveChildren&&(this._ts>0&&n<this._tDur||this._ts<0&&n>0||!this._tDur&&!n)&&$n(this._dp,this,this._start-this._delay)}return(this._tTime!==n||!this._dur&&!r||this._initted&&Math.abs(this._zTime)===ae||!n&&!this._initted&&(this.add||this._ptLookup))&&(this._ts||(this._pTime=n),y_(this,n,r)),this},t.time=function(n,r){return arguments.length?this.totalTime(Math.min(this.totalDuration(),n+Qd(this))%(this._dur+this._rDelay)||(n?this._dur:0),r):this._time},t.totalProgress=function(n,r){return arguments.length?this.totalTime(this.totalDuration()*n,r):this.totalDuration()?Math.min(1,this._tTime/this._tDur):this.rawTime()>0?1:0},t.progress=function(n,r){return arguments.length?this.totalTime(this.duration()*(this._yoyo&&!(this.iteration()&1)?1-n:n)+Qd(this),r):this.duration()?Math.min(1,this._time/this._dur):this.rawTime()>0?1:0},t.iteration=function(n,r){var s=this.duration()+this._rDelay;return arguments.length?this.totalTime(this._time+(n-1)*s,r):this._repeat?Us(this._tTime,s)+1:1},t.timeScale=function(n,r){if(!arguments.length)return this._rts===-ae?0:this._rts;if(this._rts===n)return this;var s=this.parent&&this._ts?rl(this.parent._time,this):this._tTime;return this._rts=+n||0,this._ts=this._ps||n===-ae?0:this._rts,this.totalTime(Vo(-Math.abs(this._delay),this._tDur,s),r!==!1),Ul(this),NA(this)},t.paused=function(n){return arguments.length?(this._ps!==n&&(this._ps=n,n?(this._pTime=this._tTime||Math.max(-this._delay,this.rawTime()),this._ts=this._act=0):(Os(),this._ts=this._rts,this.totalTime(this.parent&&!this.parent.smoothChildTiming?this.rawTime():this._tTime||this._pTime,this.progress()===1&&Math.abs(this._zTime)!==ae&&(this._tTime-=ae)))),this):this._ps},t.startTime=function(n){if(arguments.length){this._start=n;var r=this.parent||this._dp;return r&&(r._sort||!this.parent)&&$n(r,this,n-this._delay),this}return this._start},t.endTime=function(n){return this._start+(en(n)?this.totalDuration():this.duration())/Math.abs(this._ts||1)},t.rawTime=function(n){var r=this.parent||this._dp;return r?n&&(!this._ts||this._repeat&&this._time&&this.totalProgress()<1)?this._tTime%(this._dur+this._rDelay):this._ts?rl(r.rawTime(n),this):this._tTime:this._tTime},t.revert=function(n){n===void 0&&(n=LA);var r=Ve;return Ve=n,(this._initted||this._startAt)&&(this.timeline&&this.timeline.revert(n),this.totalTime(-.01,n.suppressEvents)),this.data!=="nested"&&n.kill!==!1&&this.kill(),Ve=r,this},t.globalTime=function(n){for(var r=this,s=arguments.length?n:r.rawTime();r;)s=r._start+s/(Math.abs(r._ts)||1),r=r._dp;return!this.parent&&this._sat?this._sat.globalTime(n):s},t.repeat=function(n){return arguments.length?(this._repeat=n===1/0?-2:n,tp(this)):this._repeat===-2?1/0:this._repeat},t.repeatDelay=function(n){if(arguments.length){var r=this._time;return this._rDelay=n,tp(this),r?this.time(r):this}return this._rDelay},t.yoyo=function(n){return arguments.length?(this._yoyo=n,this):this._yoyo},t.seek=function(n,r){return this.totalTime(An(this,n),en(r))},t.restart=function(n,r){return this.play().totalTime(n?-this._delay:0,en(r))},t.play=function(n,r){return n!=null&&this.seek(n,r),this.reversed(!1).paused(!1)},t.reverse=function(n,r){return n!=null&&this.seek(n||this.totalDuration(),r),this.reversed(!0).paused(!1)},t.pause=function(n,r){return n!=null&&this.seek(n,r),this.paused(!0)},t.resume=function(){return this.paused(!1)},t.reversed=function(n){return arguments.length?(!!n!==this.reversed()&&this.timeScale(-this._rts||(n?-ae:0)),this):this._rts<0},t.invalidate=function(){return this._initted=this._act=0,this._zTime=-ae,this},t.isActive=function(){var n=this.parent||this._dp,r=this._start,s;return!!(!n||this._ts&&this._initted&&n.isActive()&&(s=n.rawTime(!0))>=r&&s<this.endTime(!0)-ae)},t.eventCallback=function(n,r,s){var o=this.vars;return arguments.length>1?(r?(o[n]=r,s&&(o[n+"Params"]=s),n==="onUpdate"&&(this._onUpdate=r)):delete o[n],this):o[n]},t.then=function(n){var r=this;return new Promise(function(s){var o=_e(n)?n:E_,a=function(){var c=r.then;r.then=null,_e(o)&&(o=o(r))&&(o.then||o===r)&&(r.then=c),s(o),r.then=c};r._initted&&r.totalProgress()===1&&r._ts>=0||!r._tTime&&r._ts<0?a():r._prom=a})},t.kill=function(){Qs(this)},i}();Pn(Lo.prototype,{_time:0,_start:0,_end:0,_tTime:0,_tDur:0,_dirty:0,_repeat:0,_yoyo:!1,parent:null,_initted:!1,_rDelay:0,_ts:1,_dp:0,ratio:0,_zTime:-ae,_prom:0,_ps:!1,_rts:1});var $e=function(i){h_(t,i);function t(n,r){var s;return n===void 0&&(n={}),s=i.call(this,n)||this,s.labels={},s.smoothChildTiming=!!n.smoothChildTiming,s.autoRemoveChildren=!!n.autoRemoveChildren,s._sort=en(n.sortChildren),he&&$n(n.parent||he,pi(s),r),n.reversed&&s.reverse(),n.paused&&s.paused(!0),n.scrollTrigger&&A_(pi(s),n.scrollTrigger),s}var e=t.prototype;return e.to=function(r,s,o){return mo(0,arguments,this),this},e.from=function(r,s,o){return mo(1,arguments,this),this},e.fromTo=function(r,s,o,a){return mo(2,arguments,this),this},e.set=function(r,s,o){return s.duration=0,s.parent=this,po(s).repeatDelay||(s.repeat=0),s.immediateRender=!!s.immediateRender,new Ee(r,s,An(this,o),1),this},e.call=function(r,s,o){return $n(this,Ee.delayedCall(0,r,s),o)},e.staggerTo=function(r,s,o,a,l,c,h){return o.duration=s,o.stagger=o.stagger||a,o.onComplete=c,o.onCompleteParams=h,o.parent=this,new Ee(r,o,An(this,l)),this},e.staggerFrom=function(r,s,o,a,l,c,h){return o.runBackwards=1,po(o).immediateRender=en(o.immediateRender),this.staggerTo(r,s,o,a,l,c,h)},e.staggerFromTo=function(r,s,o,a,l,c,h,u){return a.startAt=o,po(a).immediateRender=en(a.immediateRender),this.staggerTo(r,s,a,l,c,h,u)},e.render=function(r,s,o){var a=this._time,l=this._dirty?this.totalDuration():this._tDur,c=this._dur,h=r<=0?0:Ie(r),u=this._zTime<0!=r<0&&(this._initted||!c),f,d,g,_,m,p,y,v,M,L,w,C;if(this!==he&&h>l&&r>=0&&(h=l),h!==this._tTime||o||u){if(a!==this._time&&c&&(h+=this._time-a,r+=this._time-a),f=h,M=this._start,v=this._ts,p=!v,u&&(c||(a=this._zTime),(r||!s)&&(this._zTime=r)),this._repeat){if(w=this._yoyo,m=c+this._rDelay,this._repeat<-1&&r<0)return this.totalTime(m*100+r,s,o);if(f=Ie(h%m),h===l?(_=this._repeat,f=c):(_=~~(h/m),_&&_===h/m&&(f=c,_--),f>c&&(f=c)),L=Us(this._tTime,m),!a&&this._tTime&&L!==_&&this._tTime-L*m-this._dur<=0&&(L=_),w&&_&1&&(f=c-f,C=1),_!==L&&!this._lock){var D=w&&L&1,S=D===(w&&_&1);if(_<L&&(D=!D),a=D?0:h%c?c:h,this._lock=1,this.render(a||(C?0:Ie(_*m)),s,!c)._lock=0,this._tTime=h,!s&&this.parent&&xn(this,"onRepeat"),this.vars.repeatRefresh&&!C&&(this.invalidate()._lock=1),a&&a!==this._time||p!==!this._ts||this.vars.onRepeat&&!this.parent&&!this._act)return this;if(c=this._dur,l=this._tDur,S&&(this._lock=2,a=D?c:-1e-4,this.render(a,!0),this.vars.repeatRefresh&&!C&&this.invalidate()),this._lock=0,!this._ts&&!p)return this;H_(this,C)}}if(this._hasPause&&!this._forcing&&this._lock<2&&(y=zA(this,Ie(a),Ie(f)),y&&(h-=f-(f=y._start))),this._tTime=h,this._time=f,this._act=!v,this._initted||(this._onUpdate=this.vars.onUpdate,this._initted=1,this._zTime=r,a=0),!a&&f&&!s&&!_&&(xn(this,"onStart"),this._tTime!==h))return this;if(f>=a&&r>=0)for(d=this._first;d;){if(g=d._next,(d._act||f>=d._start)&&d._ts&&y!==d){if(d.parent!==this)return this.render(r,s,o);if(d.render(d._ts>0?(f-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(f-d._start)*d._ts,s,o),f!==this._time||!this._ts&&!p){y=0,g&&(h+=this._zTime=-ae);break}}d=g}else{d=this._last;for(var E=r<0?r:f;d;){if(g=d._prev,(d._act||E<=d._end)&&d._ts&&y!==d){if(d.parent!==this)return this.render(r,s,o);if(d.render(d._ts>0?(E-d._start)*d._ts:(d._dirty?d.totalDuration():d._tDur)+(E-d._start)*d._ts,s,o||Ve&&(d._initted||d._startAt)),f!==this._time||!this._ts&&!p){y=0,g&&(h+=this._zTime=E?-ae:ae);break}}d=g}}if(y&&!s&&(this.pause(),y.render(f>=a?0:-ae)._zTime=f>=a?1:-1,this._ts))return this._start=M,Ul(this),this.render(r,s,o);this._onUpdate&&!s&&xn(this,"onUpdate",!0),(h===l&&this._tTime>=this.totalDuration()||!h&&a)&&(M===this._start||Math.abs(v)!==Math.abs(this._ts))&&(this._lock||((r||!c)&&(h===l&&this._ts>0||!h&&this._ts<0)&&qi(this,1),!s&&!(r<0&&!a)&&(h||a||!l)&&(xn(this,h===l&&r>=0?"onComplete":"onReverseComplete",!0),this._prom&&!(h<l&&this.timeScale()>0)&&this._prom())))}return this},e.add=function(r,s){var o=this;if(yi(s)||(s=An(this,s,r)),!(r instanceof Lo)){if(Ge(r))return r.forEach(function(a){return o.add(a,s)}),this;if(Ue(r))return this.addLabel(r,s);if(_e(r))r=Ee.delayedCall(0,r);else return this}return this!==r?$n(this,r,s):this},e.getChildren=function(r,s,o,a){r===void 0&&(r=!0),s===void 0&&(s=!0),o===void 0&&(o=!0),a===void 0&&(a=-Cn);for(var l=[],c=this._first;c;)c._start>=a&&(c instanceof Ee?s&&l.push(c):(o&&l.push(c),r&&l.push.apply(l,c.getChildren(!0,s,o)))),c=c._next;return l},e.getById=function(r){for(var s=this.getChildren(1,1,1),o=s.length;o--;)if(s[o].vars.id===r)return s[o]},e.remove=function(r){return Ue(r)?this.removeLabel(r):_e(r)?this.killTweensOf(r):(Il(this,r),r===this._recent&&(this._recent=this._last),Sr(this))},e.totalTime=function(r,s){return arguments.length?(this._forcing=1,!this._dp&&this._ts&&(this._start=Ie(gn.time-(this._ts>0?r/this._ts:(this.totalDuration()-r)/-this._ts))),i.prototype.totalTime.call(this,r,s),this._forcing=0,this):this._tTime},e.addLabel=function(r,s){return this.labels[r]=An(this,s),this},e.removeLabel=function(r){return delete this.labels[r],this},e.addPause=function(r,s,o){var a=Ee.delayedCall(0,s||Co,o);return a.data="isPause",this._hasPause=1,$n(this,a,An(this,r))},e.removePause=function(r){var s=this._first;for(r=An(this,r);s;)s._start===r&&s.data==="isPause"&&qi(s),s=s._next},e.killTweensOf=function(r,s,o){for(var a=this.getTweensOf(r,o),l=a.length;l--;)Fi!==a[l]&&a[l].kill(r,s);return this},e.getTweensOf=function(r,s){for(var o=[],a=Rn(r),l=this._first,c=yi(s),h;l;)l instanceof Ee?DA(l._targets,a)&&(c?(!Fi||l._initted&&l._ts)&&l.globalTime(0)<=s&&l.globalTime(l.totalDuration())>s:!s||l.isActive())&&o.push(l):(h=l.getTweensOf(a,s)).length&&o.push.apply(o,h),l=l._next;return o},e.tweenTo=function(r,s){s=s||{};var o=this,a=An(o,r),l=s,c=l.startAt,h=l.onStart,u=l.onStartParams,f=l.immediateRender,d,g=Ee.to(o,Pn({ease:s.ease||"none",lazy:!1,immediateRender:!1,time:a,overwrite:"auto",duration:s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale())||ae,onStart:function(){if(o.pause(),!d){var m=s.duration||Math.abs((a-(c&&"time"in c?c.time:o._time))/o.timeScale());g._dur!==m&&Ns(g,m,0,1).render(g._time,!0,!0),d=1}h&&h.apply(g,u||[])}},s));return f?g.render(0):g},e.tweenFromTo=function(r,s,o){return this.tweenTo(s,Pn({startAt:{time:An(this,r)}},o))},e.recent=function(){return this._recent},e.nextLabel=function(r){return r===void 0&&(r=this._time),ep(this,An(this,r))},e.previousLabel=function(r){return r===void 0&&(r=this._time),ep(this,An(this,r),1)},e.currentLabel=function(r){return arguments.length?this.seek(r,!0):this.previousLabel(this._time+ae)},e.shiftChildren=function(r,s,o){o===void 0&&(o=0);for(var a=this._first,l=this.labels,c;a;)a._start>=o&&(a._start+=r,a._end+=r),a=a._next;if(s)for(c in l)l[c]>=o&&(l[c]+=r);return Sr(this)},e.invalidate=function(r){var s=this._first;for(this._lock=0;s;)s.invalidate(r),s=s._next;return i.prototype.invalidate.call(this,r)},e.clear=function(r){r===void 0&&(r=!0);for(var s=this._first,o;s;)o=s._next,this.remove(s),s=o;return this._dp&&(this._time=this._tTime=this._pTime=0),r&&(this.labels={}),Sr(this)},e.totalDuration=function(r){var s=0,o=this,a=o._last,l=Cn,c,h,u;if(arguments.length)return o.timeScale((o._repeat<0?o.duration():o.totalDuration())/(o.reversed()?-r:r));if(o._dirty){for(u=o.parent;a;)c=a._prev,a._dirty&&a.totalDuration(),h=a._start,h>l&&o._sort&&a._ts&&!o._lock?(o._lock=1,$n(o,a,h-a._delay,1)._lock=0):l=h,h<0&&a._ts&&(s-=h,(!u&&!o._dp||u&&u.smoothChildTiming)&&(o._start+=h/o._ts,o._time-=h,o._tTime-=h),o.shiftChildren(-h,!1,-1/0),l=0),a._end>s&&a._ts&&(s=a._end),a=c;Ns(o,o===he&&o._time>s?o._time:s,1,1),o._dirty=0}return o._tDur},t.updateRoot=function(r){if(he._ts&&(y_(he,rl(r,he)),x_=gn.frame),gn.frame>=Zd){Zd+=Mn.autoSleep||120;var s=he._first;if((!s||!s._ts)&&Mn.autoSleep&&gn._listeners.length<2){for(;s&&!s._ts;)s=s._next;s||gn.sleep()}}},t}(Lo);Pn($e.prototype,{_lock:0,_hasPause:0,_forcing:0});var e1=function(t,e,n,r,s,o,a){var l=new rn(this._pt,t,e,0,1,K_,null,s),c=0,h=0,u,f,d,g,_,m,p,y;for(l.b=n,l.e=r,n+="",r+="",(p=~r.indexOf("random("))&&(r=Ro(r)),o&&(y=[n,r],o(y,t,e),n=y[0],r=y[1]),f=n.match(Rc)||[];u=Rc.exec(r);)g=u[0],_=r.substring(c,u.index),d?d=(d+1)%5:_.substr(-5)==="rgba("&&(d=1),g!==f[h++]&&(m=parseFloat(f[h-1])||0,l._pt={_next:l._pt,p:_||h===1?_:",",s:m,c:g.charAt(1)==="="?Ss(m,g)-m:parseFloat(g)-m,m:d&&d<4?Math.round:0},c=Rc.lastIndex);return l.c=c<r.length?r.substring(c,r.length):"",l.fp=a,(p_.test(r)||p)&&(l.e=0),this._pt=l,l},Xu=function(t,e,n,r,s,o,a,l,c,h){_e(r)&&(r=r(s||0,t,o));var u=t[e],f=n!=="get"?n:_e(u)?c?t[e.indexOf("set")||!_e(t["get"+e.substr(3)])?e:"get"+e.substr(3)](c):t[e]():u,d=_e(u)?c?o1:q_:qu,g;if(Ue(r)&&(~r.indexOf("random(")&&(r=Ro(r)),r.charAt(1)==="="&&(g=Ss(f,r)+(He(f)||0),(g||g===0)&&(r=g))),!h||f!==r||zh)return!isNaN(f*r)&&r!==""?(g=new rn(this._pt,t,e,+f||0,r-(f||0),typeof u=="boolean"?l1:j_,0,d),c&&(g.fp=c),a&&g.modifier(a,this,t),this._pt=g):(!u&&!(e in t)&&Hu(e,r),e1.call(this,t,e,f,r,d,l||Mn.stringFilter,c))},n1=function(t,e,n,r,s){if(_e(t)&&(t=_o(t,s,e,n,r)),!ii(t)||t.style&&t.nodeType||Ge(t)||f_(t))return Ue(t)?_o(t,s,e,n,r):t;var o={},a;for(a in t)o[a]=_o(t[a],s,e,n,r);return o},W_=function(t,e,n,r,s,o){var a,l,c,h;if(pn[t]&&(a=new pn[t]).init(s,a.rawVars?e[t]:n1(e[t],r,s,o,n),n,r,o)!==!1&&(n._pt=l=new rn(n._pt,s,t,0,1,a.render,a,0,a.priority),n!==us))for(c=n._ptLookup[n._targets.indexOf(s)],h=a._props.length;h--;)c[a._props[h]]=l;return a},Fi,zh,Yu=function i(t,e,n){var r=t.vars,s=r.ease,o=r.startAt,a=r.immediateRender,l=r.lazy,c=r.onUpdate,h=r.runBackwards,u=r.yoyoEase,f=r.keyframes,d=r.autoRevert,g=t._dur,_=t._startAt,m=t._targets,p=t.parent,y=p&&p.data==="nested"?p.vars.targets:m,v=t._overwrite==="auto"&&!Fu,M=t.timeline,L,w,C,D,S,E,I,G,H,Z,et,X,$;if(M&&(!f||!s)&&(s="none"),t._ease=Er(s,Is.ease),t._yEase=u?k_(Er(u===!0?s:u,Is.ease)):0,u&&t._yoyo&&!t._repeat&&(u=t._yEase,t._yEase=t._ease,t._ease=u),t._from=!M&&!!r.runBackwards,!M||f&&!r.stagger){if(G=m[0]?yr(m[0]).harness:0,X=G&&r[G.prop],L=il(r,Vu),_&&(_._zTime<0&&_.progress(1),e<0&&h&&a&&!d?_.render(-1,!0):_.revert(h&&g?Ba:PA),_._lazy=0),o){if(qi(t._startAt=Ee.set(m,Pn({data:"isStart",overwrite:!1,parent:p,immediateRender:!0,lazy:!_&&en(l),startAt:null,delay:0,onUpdate:c&&function(){return xn(t,"onUpdate")},stagger:0},o))),t._startAt._dp=0,t._startAt._sat=t,e<0&&(Ve||!a&&!d)&&t._startAt.revert(Ba),a&&g&&e<=0&&n<=0){e&&(t._zTime=e);return}}else if(h&&g&&!_){if(e&&(a=!1),C=Pn({overwrite:!1,data:"isFromStart",lazy:a&&!_&&en(l),immediateRender:a,stagger:0,parent:p},L),X&&(C[G.prop]=X),qi(t._startAt=Ee.set(m,C)),t._startAt._dp=0,t._startAt._sat=t,e<0&&(Ve?t._startAt.revert(Ba):t._startAt.render(-1,!0)),t._zTime=e,!a)i(t._startAt,ae,ae);else if(!e)return}for(t._pt=t._ptCache=0,l=g&&en(l)||l&&!g,w=0;w<m.length;w++){if(S=m[w],I=S._gsap||Wu(m)[w]._gsap,t._ptLookup[w]=Z={},Ih[I.id]&&Gi.length&&nl(),et=y===m?w:y.indexOf(S),G&&(H=new G).init(S,X||L,t,et,y)!==!1&&(t._pt=D=new rn(t._pt,S,H.name,0,1,H.render,H,0,H.priority),H._props.forEach(function(Y){Z[Y]=D}),H.priority&&(E=1)),!G||X)for(C in L)pn[C]&&(H=W_(C,L,t,et,S,y))?H.priority&&(E=1):Z[C]=D=Xu.call(t,S,C,"get",L[C],et,y,0,r.stringFilter);t._op&&t._op[w]&&t.kill(S,t._op[w]),v&&t._pt&&(Fi=t,he.killTweensOf(S,Z,t.globalTime(e)),$=!t.parent,Fi=0),t._pt&&l&&(Ih[I.id]=1)}E&&$_(t),t._onInit&&t._onInit(t)}t._onUpdate=c,t._initted=(!t._op||t._pt)&&!$,f&&e<=0&&M.render(Cn,!0,!0)},i1=function(t,e,n,r,s,o,a,l){var c=(t._pt&&t._ptCache||(t._ptCache={}))[e],h,u,f,d;if(!c)for(c=t._ptCache[e]=[],f=t._ptLookup,d=t._targets.length;d--;){if(h=f[d][e],h&&h.d&&h.d._pt)for(h=h.d._pt;h&&h.p!==e&&h.fp!==e;)h=h._next;if(!h)return zh=1,t.vars[e]="+=0",Yu(t,a),zh=0,l?wo(e+" not eligible for reset"):1;c.push(h)}for(d=c.length;d--;)u=c[d],h=u._pt||u,h.s=(r||r===0)&&!s?r:h.s+(r||0)+o*h.c,h.c=n-h.s,u.e&&(u.e=xe(n)+He(u.e)),u.b&&(u.b=h.s+He(u.b))},r1=function(t,e){var n=t[0]?yr(t[0]).harness:0,r=n&&n.aliases,s,o,a,l;if(!r)return e;s=Lr({},e);for(o in r)if(o in s)for(l=r[o].split(","),a=l.length;a--;)s[l[a]]=s[o];return s},s1=function(t,e,n,r){var s=e.ease||r||"power1.inOut",o,a;if(Ge(e))a=n[t]||(n[t]=[]),e.forEach(function(l,c){return a.push({t:c/(e.length-1)*100,v:l,e:s})});else for(o in e)a=n[o]||(n[o]=[]),o==="ease"||a.push({t:parseFloat(t),v:e[o],e:s})},_o=function(t,e,n,r,s){return _e(t)?t.call(e,n,r,s):Ue(t)&&~t.indexOf("random(")?Ro(t):t},X_=Gu+"repeat,repeatDelay,yoyo,repeatRefresh,yoyoEase,autoRevert",Y_={};nn(X_+",id,stagger,delay,duration,paused,scrollTrigger",function(i){return Y_[i]=1});var Ee=function(i){h_(t,i);function t(n,r,s,o){var a;typeof r=="number"&&(s.duration=r,r=s,s=null),a=i.call(this,o?r:po(r))||this;var l=a.vars,c=l.duration,h=l.delay,u=l.immediateRender,f=l.stagger,d=l.overwrite,g=l.keyframes,_=l.defaults,m=l.scrollTrigger,p=l.yoyoEase,y=r.parent||he,v=(Ge(n)||f_(n)?yi(n[0]):"length"in r)?[n]:Rn(n),M,L,w,C,D,S,E,I;if(a._targets=v.length?Wu(v):wo("GSAP target "+n+" not found. https://gsap.com",!Mn.nullTargetWarn)||[],a._ptLookup=[],a._overwrite=d,g||f||wa(c)||wa(h)){if(r=a.vars,M=a.timeline=new $e({data:"nested",defaults:_||{},targets:y&&y.data==="nested"?y.vars.targets:v}),M.kill(),M.parent=M._dp=pi(a),M._start=0,f||wa(c)||wa(h)){if(C=v.length,E=f&&P_(f),ii(f))for(D in f)~X_.indexOf(D)&&(I||(I={}),I[D]=f[D]);for(L=0;L<C;L++)w=il(r,Y_),w.stagger=0,p&&(w.yoyoEase=p),I&&Lr(w,I),S=v[L],w.duration=+_o(c,pi(a),L,S,v),w.delay=(+_o(h,pi(a),L,S,v)||0)-a._delay,!f&&C===1&&w.delay&&(a._delay=h=w.delay,a._start+=h,w.delay=0),M.to(S,w,E?E(L,S,v):0),M._ease=Yt.none;M.duration()?c=h=0:a.timeline=0}else if(g){po(Pn(M.vars.defaults,{ease:"none"})),M._ease=Er(g.ease||r.ease||"none");var G=0,H,Z,et;if(Ge(g))g.forEach(function(X){return M.to(v,X,">")}),M.duration();else{w={};for(D in g)D==="ease"||D==="easeEach"||s1(D,g[D],w,g.easeEach);for(D in w)for(H=w[D].sort(function(X,$){return X.t-$.t}),G=0,L=0;L<H.length;L++)Z=H[L],et={ease:Z.e,duration:(Z.t-(L?H[L-1].t:0))/100*c},et[D]=Z.v,M.to(v,et,G),G+=et.duration;M.duration()<c&&M.to({},{duration:c-M.duration()})}}c||a.duration(c=M.duration())}else a.timeline=0;return d===!0&&!Fu&&(Fi=pi(a),he.killTweensOf(v),Fi=0),$n(y,pi(a),s),r.reversed&&a.reverse(),r.paused&&a.paused(!0),(u||!c&&!g&&a._start===Ie(y._time)&&en(u)&&OA(pi(a))&&y.data!=="nested")&&(a._tTime=-ae,a.render(Math.max(0,-h)||0)),m&&A_(pi(a),m),a}var e=t.prototype;return e.render=function(r,s,o){var a=this._time,l=this._tDur,c=this._dur,h=r<0,u=r>l-ae&&!h?l:r<ae?0:r,f,d,g,_,m,p,y,v,M;if(!c)BA(this,r,s,o);else if(u!==this._tTime||!r||o||!this._initted&&this._tTime||this._startAt&&this._zTime<0!==h){if(f=u,v=this.timeline,this._repeat){if(_=c+this._rDelay,this._repeat<-1&&h)return this.totalTime(_*100+r,s,o);if(f=Ie(u%_),u===l?(g=this._repeat,f=c):(g=~~(u/_),g&&g===Ie(u/_)&&(f=c,g--),f>c&&(f=c)),p=this._yoyo&&g&1,p&&(M=this._yEase,f=c-f),m=Us(this._tTime,_),f===a&&!o&&this._initted&&g===m)return this._tTime=u,this;g!==m&&(v&&this._yEase&&H_(v,p),this.vars.repeatRefresh&&!p&&!this._lock&&this._time!==_&&this._initted&&(this._lock=o=1,this.render(Ie(_*g),!0).invalidate()._lock=0))}if(!this._initted){if(w_(this,h?r:f,o,s,u))return this._tTime=0,this;if(a!==this._time&&!(o&&this.vars.repeatRefresh&&g!==m))return this;if(c!==this._dur)return this.render(r,s,o)}if(this._tTime=u,this._time=f,!this._act&&this._ts&&(this._act=1,this._lazy=0),this.ratio=y=(M||this._ease)(f/c),this._from&&(this.ratio=y=1-y),f&&!a&&!s&&!g&&(xn(this,"onStart"),this._tTime!==u))return this;for(d=this._pt;d;)d.r(y,d.d),d=d._next;v&&v.render(r<0?r:v._dur*v._ease(f/this._dur),s,o)||this._startAt&&(this._zTime=r),this._onUpdate&&!s&&(h&&Uh(this,r,s,o),xn(this,"onUpdate")),this._repeat&&g!==m&&this.vars.onRepeat&&!s&&this.parent&&xn(this,"onRepeat"),(u===this._tDur||!u)&&this._tTime===u&&(h&&!this._onUpdate&&Uh(this,r,!0,!0),(r||!c)&&(u===this._tDur&&this._ts>0||!u&&this._ts<0)&&qi(this,1),!s&&!(h&&!a)&&(u||a||p)&&(xn(this,u===l?"onComplete":"onReverseComplete",!0),this._prom&&!(u<l&&this.timeScale()>0)&&this._prom()))}return this},e.targets=function(){return this._targets},e.invalidate=function(r){return(!r||!this.vars.runBackwards)&&(this._startAt=0),this._pt=this._op=this._onUpdate=this._lazy=this.ratio=0,this._ptLookup=[],this.timeline&&this.timeline.invalidate(r),i.prototype.invalidate.call(this,r)},e.resetTo=function(r,s,o,a,l){Po||gn.wake(),this._ts||this.play();var c=Math.min(this._dur,(this._dp._time-this._start)*this._ts),h;return this._initted||Yu(this,c),h=this._ease(c/this._dur),i1(this,r,s,o,a,h,c,l)?this.resetTo(r,s,o,a,1):(Nl(this,0),this.parent||b_(this._dp,this,"_first","_last",this._dp._sort?"_start":0),this.render(0))},e.kill=function(r,s){if(s===void 0&&(s="all"),!r&&(!s||s==="all"))return this._lazy=this._pt=0,this.parent?Qs(this):this;if(this.timeline){var o=this.timeline.totalDuration();return this.timeline.killTweensOf(r,s,Fi&&Fi.vars.overwrite!==!0)._first||Qs(this),this.parent&&o!==this.timeline.totalDuration()&&Ns(this,this._dur*this.timeline._tDur/o,0,1),this}var a=this._targets,l=r?Rn(r):a,c=this._ptLookup,h=this._pt,u,f,d,g,_,m,p;if((!s||s==="all")&&UA(a,l))return s==="all"&&(this._pt=0),Qs(this);for(u=this._op=this._op||[],s!=="all"&&(Ue(s)&&(_={},nn(s,function(y){return _[y]=1}),s=_),s=r1(a,s)),p=a.length;p--;)if(~l.indexOf(a[p])){f=c[p],s==="all"?(u[p]=s,g=f,d={}):(d=u[p]=u[p]||{},g=s);for(_ in g)m=f&&f[_],m&&((!("kill"in m.d)||m.d.kill(_)===!0)&&Il(this,m,"_pt"),delete f[_]),d!=="all"&&(d[_]=1)}return this._initted&&!this._pt&&h&&Qs(this),this},t.to=function(r,s){return new t(r,s,arguments[2])},t.from=function(r,s){return mo(1,arguments)},t.delayedCall=function(r,s,o,a){return new t(s,0,{immediateRender:!1,lazy:!1,overwrite:!1,delay:r,onComplete:s,onReverseComplete:s,onCompleteParams:o,onReverseCompleteParams:o,callbackScope:a})},t.fromTo=function(r,s,o){return mo(2,arguments)},t.set=function(r,s){return s.duration=0,s.repeatDelay||(s.repeat=0),new t(r,s)},t.killTweensOf=function(r,s,o){return he.killTweensOf(r,s,o)},t}(Lo);Pn(Ee.prototype,{_targets:[],_lazy:0,_startAt:0,_op:0,_onInit:0});nn("staggerTo,staggerFrom,staggerFromTo",function(i){Ee[i]=function(){var t=new $e,e=Oh.call(arguments,0);return e.splice(i==="staggerFromTo"?5:4,0,0),t[i].apply(t,e)}});var qu=function(t,e,n){return t[e]=n},q_=function(t,e,n){return t[e](n)},o1=function(t,e,n,r){return t[e](r.fp,n)},a1=function(t,e,n){return t.setAttribute(e,n)},ju=function(t,e){return _e(t[e])?q_:Bu(t[e])&&t.setAttribute?a1:qu},j_=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e6)/1e6,e)},l1=function(t,e){return e.set(e.t,e.p,!!(e.s+e.c*t),e)},K_=function(t,e){var n=e._pt,r="";if(!t&&e.b)r=e.b;else if(t===1&&e.e)r=e.e;else{for(;n;)r=n.p+(n.m?n.m(n.s+n.c*t):Math.round((n.s+n.c*t)*1e4)/1e4)+r,n=n._next;r+=e.c}e.set(e.t,e.p,r,e)},Ku=function(t,e){for(var n=e._pt;n;)n.r(t,n.d),n=n._next},c1=function(t,e,n,r){for(var s=this._pt,o;s;)o=s._next,s.p===r&&s.modifier(t,e,n),s=o},h1=function(t){for(var e=this._pt,n,r;e;)r=e._next,e.p===t&&!e.op||e.op===t?Il(this,e,"_pt"):e.dep||(n=1),e=r;return!n},u1=function(t,e,n,r){r.mSet(t,e,r.m.call(r.tween,n,r.mt),r)},$_=function(t){for(var e=t._pt,n,r,s,o;e;){for(n=e._next,r=s;r&&r.pr>e.pr;)r=r._next;(e._prev=r?r._prev:o)?e._prev._next=e:s=e,(e._next=r)?r._prev=e:o=e,e=n}t._pt=s},rn=function(){function i(e,n,r,s,o,a,l,c,h){this.t=n,this.s=s,this.c=o,this.p=r,this.r=a||j_,this.d=l||this,this.set=c||qu,this.pr=h||0,this._next=e,e&&(e._prev=this)}var t=i.prototype;return t.modifier=function(n,r,s){this.mSet=this.mSet||this.set,this.set=u1,this.m=n,this.mt=s,this.tween=r},i}();nn(Gu+"parent,duration,ease,delay,overwrite,runBackwards,startAt,yoyo,immediateRender,repeat,repeatDelay,data,paused,reversed,lazy,callbackScope,stringFilter,id,yoyoEase,stagger,inherit,repeatRefresh,keyframes,autoRevert,scrollTrigger",function(i){return Vu[i]=1});yn.TweenMax=yn.TweenLite=Ee;yn.TimelineLite=yn.TimelineMax=$e;he=new $e({sortChildren:!1,defaults:Is,autoRemoveChildren:!0,id:"root",smoothChildTiming:!0});Mn.stringFilter=z_;var br=[],ka={},f1=[],ip=0,d1=0,Uc=function(t){return(ka[t]||f1).map(function(e){return e()})},kh=function(){var t=Date.now(),e=[];t-ip>2&&(Uc("matchMediaInit"),br.forEach(function(n){var r=n.queries,s=n.conditions,o,a,l,c;for(a in r)o=Xn.matchMedia(r[a]).matches,o&&(l=1),o!==s[a]&&(s[a]=o,c=1);c&&(n.revert(),l&&e.push(n))}),Uc("matchMediaRevert"),e.forEach(function(n){return n.onMatch(n,function(r){return n.add(null,r)})}),ip=t,Uc("matchMedia"))},Z_=function(){function i(e,n){this.selector=n&&Fh(n),this.data=[],this._r=[],this.isReverted=!1,this.id=d1++,e&&this.add(e)}var t=i.prototype;return t.add=function(n,r,s){_e(n)&&(s=r,r=n,n=_e);var o=this,a=function(){var c=ce,h=o.selector,u;return c&&c!==o&&c.data.push(o),s&&(o.selector=Fh(s)),ce=o,u=r.apply(o,arguments),_e(u)&&o._r.push(u),ce=c,o.selector=h,o.isReverted=!1,u};return o.last=a,n===_e?a(o,function(l){return o.add(null,l)}):n?o[n]=a:a},t.ignore=function(n){var r=ce;ce=null,n(this),ce=r},t.getTweens=function(){var n=[];return this.data.forEach(function(r){return r instanceof i?n.push.apply(n,r.getTweens()):r instanceof Ee&&!(r.parent&&r.parent.data==="nested")&&n.push(r)}),n},t.clear=function(){this._r.length=this.data.length=0},t.kill=function(n,r){var s=this;if(n?function(){for(var a=s.getTweens(),l=s.data.length,c;l--;)c=s.data[l],c.data==="isFlip"&&(c.revert(),c.getChildren(!0,!0,!1).forEach(function(h){return a.splice(a.indexOf(h),1)}));for(a.map(function(h){return{g:h._dur||h._delay||h._sat&&!h._sat.vars.immediateRender?h.globalTime(0):-1/0,t:h}}).sort(function(h,u){return u.g-h.g||-1/0}).forEach(function(h){return h.t.revert(n)}),l=s.data.length;l--;)c=s.data[l],c instanceof $e?c.data!=="nested"&&(c.scrollTrigger&&c.scrollTrigger.revert(),c.kill()):!(c instanceof Ee)&&c.revert&&c.revert(n);s._r.forEach(function(h){return h(n,s)}),s.isReverted=!0}():this.data.forEach(function(a){return a.kill&&a.kill()}),this.clear(),r)for(var o=br.length;o--;)br[o].id===this.id&&br.splice(o,1)},t.revert=function(n){this.kill(n||{})},i}(),p1=function(){function i(e){this.contexts=[],this.scope=e,ce&&ce.data.push(this)}var t=i.prototype;return t.add=function(n,r,s){ii(n)||(n={matches:n});var o=new Z_(0,s||this.scope),a=o.conditions={},l,c,h;ce&&!o.selector&&(o.selector=ce.selector),this.contexts.push(o),r=o.add("onMatch",r),o.queries=n;for(c in n)c==="all"?h=1:(l=Xn.matchMedia(n[c]),l&&(br.indexOf(o)<0&&br.push(o),(a[c]=l.matches)&&(h=1),l.addListener?l.addListener(kh):l.addEventListener("change",kh)));return h&&r(o,function(u){return o.add(null,u)}),this},t.revert=function(n){this.kill(n||{})},t.kill=function(n){this.contexts.forEach(function(r){return r.kill(n,!0)})},i}(),sl={registerPlugin:function(){for(var t=arguments.length,e=new Array(t),n=0;n<t;n++)e[n]=arguments[n];e.forEach(function(r){return O_(r)})},timeline:function(t){return new $e(t)},getTweensOf:function(t,e){return he.getTweensOf(t,e)},getProperty:function(t,e,n,r){Ue(t)&&(t=Rn(t)[0]);var s=yr(t||{}).get,o=n?E_:S_;return n==="native"&&(n=""),t&&(e?o((pn[e]&&pn[e].get||s)(t,e,n,r)):function(a,l,c){return o((pn[a]&&pn[a].get||s)(t,a,l,c))})},quickSetter:function(t,e,n){if(t=Rn(t),t.length>1){var r=t.map(function(h){return on.quickSetter(h,e,n)}),s=r.length;return function(h){for(var u=s;u--;)r[u](h)}}t=t[0]||{};var o=pn[e],a=yr(t),l=a.harness&&(a.harness.aliases||{})[e]||e,c=o?function(h){var u=new o;us._pt=0,u.init(t,n?h+n:h,us,0,[t]),u.render(1,u),us._pt&&Ku(1,us)}:a.set(t,l);return o?c:function(h){return c(t,l,n?h+n:h,a,1)}},quickTo:function(t,e,n){var r,s=on.to(t,Lr((r={},r[e]="+=0.1",r.paused=!0,r),n||{})),o=function(l,c,h){return s.resetTo(e,l,c,h)};return o.tween=s,o},isTweening:function(t){return he.getTweensOf(t,!0).length>0},defaults:function(t){return t&&t.ease&&(t.ease=Er(t.ease,Is.ease)),Jd(Is,t||{})},config:function(t){return Jd(Mn,t||{})},registerEffect:function(t){var e=t.name,n=t.effect,r=t.plugins,s=t.defaults,o=t.extendTimeline;(r||"").split(",").forEach(function(a){return a&&!pn[a]&&!yn[a]&&wo(e+" effect requires "+a+" plugin.")}),Pc[e]=function(a,l,c){return n(Rn(a),Pn(l||{},s),c)},o&&($e.prototype[e]=function(a,l,c){return this.add(Pc[e](a,ii(l)?l:(c=l)&&{},this),c)})},registerEase:function(t,e){Yt[t]=Er(e)},parseEase:function(t,e){return arguments.length?Er(t,e):Yt},getById:function(t){return he.getById(t)},exportRoot:function(t,e){t===void 0&&(t={});var n=new $e(t),r,s;for(n.smoothChildTiming=en(t.smoothChildTiming),he.remove(n),n._dp=0,n._time=n._tTime=he._time,r=he._first;r;)s=r._next,(e||!(!r._dur&&r instanceof Ee&&r.vars.onComplete===r._targets[0]))&&$n(n,r,r._start-r._delay),r=s;return $n(he,n,0),n},context:function(t,e){return t?new Z_(t,e):ce},matchMedia:function(t){return new p1(t)},matchMediaRefresh:function(){return br.forEach(function(t){var e=t.conditions,n,r;for(r in e)e[r]&&(e[r]=!1,n=1);n&&t.revert()})||kh()},addEventListener:function(t,e){var n=ka[t]||(ka[t]=[]);~n.indexOf(e)||n.push(e)},removeEventListener:function(t,e){var n=ka[t],r=n&&n.indexOf(e);r>=0&&n.splice(r,1)},utils:{wrap:YA,wrapYoyo:qA,distribute:P_,random:D_,snap:L_,normalize:XA,getUnit:He,clamp:HA,splitColor:F_,toArray:Rn,selector:Fh,mapRange:U_,pipe:GA,unitize:WA,interpolate:jA,shuffle:R_},install:g_,effects:Pc,ticker:gn,updateRoot:$e.updateRoot,plugins:pn,globalTimeline:he,core:{PropTween:rn,globals:v_,Tween:Ee,Timeline:$e,Animation:Lo,getCache:yr,_removeLinkedListItem:Il,reverting:function(){return Ve},context:function(t){return t&&ce&&(ce.data.push(t),t._ctx=ce),ce},suppressOverwrites:function(t){return Fu=t}}};nn("to,from,fromTo,delayedCall,set,killTweensOf",function(i){return sl[i]=Ee[i]});gn.add($e.updateRoot);us=sl.to({},{duration:0});var m1=function(t,e){for(var n=t._pt;n&&n.p!==e&&n.op!==e&&n.fp!==e;)n=n._next;return n},_1=function(t,e){var n=t._targets,r,s,o;for(r in e)for(s=n.length;s--;)o=t._ptLookup[s][r],o&&(o=o.d)&&(o._pt&&(o=m1(o,r)),o&&o.modifier&&o.modifier(e[r],t,n[s],r))},Nc=function(t,e){return{name:t,rawVars:1,init:function(r,s,o){o._onInit=function(a){var l,c;if(Ue(s)&&(l={},nn(s,function(h){return l[h]=1}),s=l),e){l={};for(c in s)l[c]=e(s[c]);s=l}_1(a,s)}}}},on=sl.registerPlugin({name:"attr",init:function(t,e,n,r,s){var o,a,l;this.tween=n;for(o in e)l=t.getAttribute(o)||"",a=this.add(t,"setAttribute",(l||0)+"",e[o],r,s,0,0,o),a.op=o,a.b=l,this._props.push(o)},render:function(t,e){for(var n=e._pt;n;)Ve?n.set(n.t,n.p,n.b,n):n.r(t,n.d),n=n._next}},{name:"endArray",init:function(t,e){for(var n=e.length;n--;)this.add(t,n,t[n]||0,e[n],0,0,0,0,0,1)}},Nc("roundProps",Bh),Nc("modifiers"),Nc("snap",L_))||sl;Ee.version=$e.version=on.version="3.12.5";__=1;zu()&&Os();Yt.Power0;Yt.Power1;Yt.Power2;Yt.Power3;Yt.Power4;Yt.Linear;Yt.Quad;Yt.Cubic;Yt.Quart;Yt.Quint;Yt.Strong;Yt.Elastic;Yt.Back;Yt.SteppedEase;Yt.Bounce;Yt.Sine;Yt.Expo;Yt.Circ;/*!
 * CSSPlugin 3.12.5
 * https://gsap.com
 *
 * Copyright 2008-2024, GreenSock. All rights reserved.
 * Subject to the terms at https://gsap.com/standard-license or for
 * Club GSAP members, the agreement issued with that membership.
 * @author: Jack Doyle, jack@greensock.com
*/var rp,Bi,Es,$u,vr,sp,Zu,g1=function(){return typeof window<"u"},Si={},dr=180/Math.PI,bs=Math.PI/180,rs=Math.atan2,op=1e8,Ju=/([A-Z])/g,v1=/(left|right|width|margin|padding|x)/i,x1=/[\s,\(]\S/,Jn={autoAlpha:"opacity,visibility",scale:"scaleX,scaleY",alpha:"opacity"},Hh=function(t,e){return e.set(e.t,e.p,Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},M1=function(t,e){return e.set(e.t,e.p,t===1?e.e:Math.round((e.s+e.c*t)*1e4)/1e4+e.u,e)},y1=function(t,e){return e.set(e.t,e.p,t?Math.round((e.s+e.c*t)*1e4)/1e4+e.u:e.b,e)},S1=function(t,e){var n=e.s+e.c*t;e.set(e.t,e.p,~~(n+(n<0?-.5:.5))+e.u,e)},J_=function(t,e){return e.set(e.t,e.p,t?e.e:e.b,e)},Q_=function(t,e){return e.set(e.t,e.p,t!==1?e.b:e.e,e)},E1=function(t,e,n){return t.style[e]=n},b1=function(t,e,n){return t.style.setProperty(e,n)},T1=function(t,e,n){return t._gsap[e]=n},A1=function(t,e,n){return t._gsap.scaleX=t._gsap.scaleY=n},w1=function(t,e,n,r,s){var o=t._gsap;o.scaleX=o.scaleY=n,o.renderTransform(s,o)},C1=function(t,e,n,r,s){var o=t._gsap;o[e]=n,o.renderTransform(s,o)},fe="transform",sn=fe+"Origin",R1=function i(t,e){var n=this,r=this.target,s=r.style,o=r._gsap;if(t in Si&&s){if(this.tfm=this.tfm||{},t!=="transform")t=Jn[t]||t,~t.indexOf(",")?t.split(",").forEach(function(a){return n.tfm[a]=_i(r,a)}):this.tfm[t]=o.x?o[t]:_i(r,t),t===sn&&(this.tfm.zOrigin=o.zOrigin);else return Jn.transform.split(",").forEach(function(a){return i.call(n,a,e)});if(this.props.indexOf(fe)>=0)return;o.svg&&(this.svgo=r.getAttribute("data-svg-origin"),this.props.push(sn,e,"")),t=fe}(s||e)&&this.props.push(t,e,s[t])},tg=function(t){t.translate&&(t.removeProperty("translate"),t.removeProperty("scale"),t.removeProperty("rotate"))},P1=function(){var t=this.props,e=this.target,n=e.style,r=e._gsap,s,o;for(s=0;s<t.length;s+=3)t[s+1]?e[t[s]]=t[s+2]:t[s+2]?n[t[s]]=t[s+2]:n.removeProperty(t[s].substr(0,2)==="--"?t[s]:t[s].replace(Ju,"-$1").toLowerCase());if(this.tfm){for(o in this.tfm)r[o]=this.tfm[o];r.svg&&(r.renderTransform(),e.setAttribute("data-svg-origin",this.svgo||"")),s=Zu(),(!s||!s.isStart)&&!n[fe]&&(tg(n),r.zOrigin&&n[sn]&&(n[sn]+=" "+r.zOrigin+"px",r.zOrigin=0,r.renderTransform()),r.uncache=1)}},eg=function(t,e){var n={target:t,props:[],revert:P1,save:R1};return t._gsap||on.core.getCache(t),e&&e.split(",").forEach(function(r){return n.save(r)}),n},ng,Vh=function(t,e){var n=Bi.createElementNS?Bi.createElementNS((e||"http://www.w3.org/1999/xhtml").replace(/^https/,"http"),t):Bi.createElement(t);return n&&n.style?n:Bi.createElement(t)},ei=function i(t,e,n){var r=getComputedStyle(t);return r[e]||r.getPropertyValue(e.replace(Ju,"-$1").toLowerCase())||r.getPropertyValue(e)||!n&&i(t,Fs(e)||e,1)||""},ap="O,Moz,ms,Ms,Webkit".split(","),Fs=function(t,e,n){var r=e||vr,s=r.style,o=5;if(t in s&&!n)return t;for(t=t.charAt(0).toUpperCase()+t.substr(1);o--&&!(ap[o]+t in s););return o<0?null:(o===3?"ms":o>=0?ap[o]:"")+t},Gh=function(){g1()&&window.document&&(rp=window,Bi=rp.document,Es=Bi.documentElement,vr=Vh("div")||{style:{}},Vh("div"),fe=Fs(fe),sn=fe+"Origin",vr.style.cssText="border-width:0;line-height:0;position:absolute;padding:0",ng=!!Fs("perspective"),Zu=on.core.reverting,$u=1)},Oc=function i(t){var e=Vh("svg",this.ownerSVGElement&&this.ownerSVGElement.getAttribute("xmlns")||"http://www.w3.org/2000/svg"),n=this.parentNode,r=this.nextSibling,s=this.style.cssText,o;if(Es.appendChild(e),e.appendChild(this),this.style.display="block",t)try{o=this.getBBox(),this._gsapBBox=this.getBBox,this.getBBox=i}catch{}else this._gsapBBox&&(o=this._gsapBBox());return n&&(r?n.insertBefore(this,r):n.appendChild(this)),Es.removeChild(e),this.style.cssText=s,o},lp=function(t,e){for(var n=e.length;n--;)if(t.hasAttribute(e[n]))return t.getAttribute(e[n])},ig=function(t){var e;try{e=t.getBBox()}catch{e=Oc.call(t,!0)}return e&&(e.width||e.height)||t.getBBox===Oc||(e=Oc.call(t,!0)),e&&!e.width&&!e.x&&!e.y?{x:+lp(t,["x","cx","x1"])||0,y:+lp(t,["y","cy","y1"])||0,width:0,height:0}:e},rg=function(t){return!!(t.getCTM&&(!t.parentNode||t.ownerSVGElement)&&ig(t))},Dr=function(t,e){if(e){var n=t.style,r;e in Si&&e!==sn&&(e=fe),n.removeProperty?(r=e.substr(0,2),(r==="ms"||e.substr(0,6)==="webkit")&&(e="-"+e),n.removeProperty(r==="--"?e:e.replace(Ju,"-$1").toLowerCase())):n.removeAttribute(e)}},zi=function(t,e,n,r,s,o){var a=new rn(t._pt,e,n,0,1,o?Q_:J_);return t._pt=a,a.b=r,a.e=s,t._props.push(n),a},cp={deg:1,rad:1,turn:1},L1={grid:1,flex:1},ji=function i(t,e,n,r){var s=parseFloat(n)||0,o=(n+"").trim().substr((s+"").length)||"px",a=vr.style,l=v1.test(e),c=t.tagName.toLowerCase()==="svg",h=(c?"client":"offset")+(l?"Width":"Height"),u=100,f=r==="px",d=r==="%",g,_,m,p;if(r===o||!s||cp[r]||cp[o])return s;if(o!=="px"&&!f&&(s=i(t,e,n,"px")),p=t.getCTM&&rg(t),(d||o==="%")&&(Si[e]||~e.indexOf("adius")))return g=p?t.getBBox()[l?"width":"height"]:t[h],xe(d?s/g*u:s/100*g);if(a[l?"width":"height"]=u+(f?o:r),_=~e.indexOf("adius")||r==="em"&&t.appendChild&&!c?t:t.parentNode,p&&(_=(t.ownerSVGElement||{}).parentNode),(!_||_===Bi||!_.appendChild)&&(_=Bi.body),m=_._gsap,m&&d&&m.width&&l&&m.time===gn.time&&!m.uncache)return xe(s/m.width*u);if(d&&(e==="height"||e==="width")){var y=t.style[e];t.style[e]=u+r,g=t[h],y?t.style[e]=y:Dr(t,e)}else(d||o==="%")&&!L1[ei(_,"display")]&&(a.position=ei(t,"position")),_===t&&(a.position="static"),_.appendChild(vr),g=vr[h],_.removeChild(vr),a.position="absolute";return l&&d&&(m=yr(_),m.time=gn.time,m.width=_[h]),xe(f?g*s/u:g&&s?u/g*s:0)},_i=function(t,e,n,r){var s;return $u||Gh(),e in Jn&&e!=="transform"&&(e=Jn[e],~e.indexOf(",")&&(e=e.split(",")[0])),Si[e]&&e!=="transform"?(s=Io(t,r),s=e!=="transformOrigin"?s[e]:s.svg?s.origin:al(ei(t,sn))+" "+s.zOrigin+"px"):(s=t.style[e],(!s||s==="auto"||r||~(s+"").indexOf("calc("))&&(s=ol[e]&&ol[e](t,e,n)||ei(t,e)||M_(t,e)||(e==="opacity"?1:0))),n&&!~(s+"").trim().indexOf(" ")?ji(t,e,s,n)+n:s},D1=function(t,e,n,r){if(!n||n==="none"){var s=Fs(e,t,1),o=s&&ei(t,s,1);o&&o!==n?(e=s,n=o):e==="borderColor"&&(n=ei(t,"borderTopColor"))}var a=new rn(this._pt,t.style,e,0,1,K_),l=0,c=0,h,u,f,d,g,_,m,p,y,v,M,L;if(a.b=n,a.e=r,n+="",r+="",r==="auto"&&(_=t.style[e],t.style[e]=r,r=ei(t,e)||r,_?t.style[e]=_:Dr(t,e)),h=[n,r],z_(h),n=h[0],r=h[1],f=n.match(hs)||[],L=r.match(hs)||[],L.length){for(;u=hs.exec(r);)m=u[0],y=r.substring(l,u.index),g?g=(g+1)%5:(y.substr(-5)==="rgba("||y.substr(-5)==="hsla(")&&(g=1),m!==(_=f[c++]||"")&&(d=parseFloat(_)||0,M=_.substr((d+"").length),m.charAt(1)==="="&&(m=Ss(d,m)+M),p=parseFloat(m),v=m.substr((p+"").length),l=hs.lastIndex-v.length,v||(v=v||Mn.units[e]||M,l===r.length&&(r+=v,a.e+=v)),M!==v&&(d=ji(t,e,_,v)||0),a._pt={_next:a._pt,p:y||c===1?y:",",s:d,c:p-d,m:g&&g<4||e==="zIndex"?Math.round:0});a.c=l<r.length?r.substring(l,r.length):""}else a.r=e==="display"&&r==="none"?Q_:J_;return p_.test(r)&&(a.e=0),this._pt=a,a},hp={top:"0%",bottom:"100%",left:"0%",right:"100%",center:"50%"},I1=function(t){var e=t.split(" "),n=e[0],r=e[1]||"50%";return(n==="top"||n==="bottom"||r==="left"||r==="right")&&(t=n,n=r,r=t),e[0]=hp[n]||n,e[1]=hp[r]||r,e.join(" ")},U1=function(t,e){if(e.tween&&e.tween._time===e.tween._dur){var n=e.t,r=n.style,s=e.u,o=n._gsap,a,l,c;if(s==="all"||s===!0)r.cssText="",l=1;else for(s=s.split(","),c=s.length;--c>-1;)a=s[c],Si[a]&&(l=1,a=a==="transformOrigin"?sn:fe),Dr(n,a);l&&(Dr(n,fe),o&&(o.svg&&n.removeAttribute("transform"),Io(n,1),o.uncache=1,tg(r)))}},ol={clearProps:function(t,e,n,r,s){if(s.data!=="isFromStart"){var o=t._pt=new rn(t._pt,e,n,0,0,U1);return o.u=r,o.pr=-10,o.tween=s,t._props.push(n),1}}},Do=[1,0,0,1,0,0],sg={},og=function(t){return t==="matrix(1, 0, 0, 1, 0, 0)"||t==="none"||!t},up=function(t){var e=ei(t,fe);return og(e)?Do:e.substr(7).match(d_).map(xe)},Qu=function(t,e){var n=t._gsap||yr(t),r=t.style,s=up(t),o,a,l,c;return n.svg&&t.getAttribute("transform")?(l=t.transform.baseVal.consolidate().matrix,s=[l.a,l.b,l.c,l.d,l.e,l.f],s.join(",")==="1,0,0,1,0,0"?Do:s):(s===Do&&!t.offsetParent&&t!==Es&&!n.svg&&(l=r.display,r.display="block",o=t.parentNode,(!o||!t.offsetParent)&&(c=1,a=t.nextElementSibling,Es.appendChild(t)),s=up(t),l?r.display=l:Dr(t,"display"),c&&(a?o.insertBefore(t,a):o?o.appendChild(t):Es.removeChild(t))),e&&s.length>6?[s[0],s[1],s[4],s[5],s[12],s[13]]:s)},Wh=function(t,e,n,r,s,o){var a=t._gsap,l=s||Qu(t,!0),c=a.xOrigin||0,h=a.yOrigin||0,u=a.xOffset||0,f=a.yOffset||0,d=l[0],g=l[1],_=l[2],m=l[3],p=l[4],y=l[5],v=e.split(" "),M=parseFloat(v[0])||0,L=parseFloat(v[1])||0,w,C,D,S;n?l!==Do&&(C=d*m-g*_)&&(D=M*(m/C)+L*(-_/C)+(_*y-m*p)/C,S=M*(-g/C)+L*(d/C)-(d*y-g*p)/C,M=D,L=S):(w=ig(t),M=w.x+(~v[0].indexOf("%")?M/100*w.width:M),L=w.y+(~(v[1]||v[0]).indexOf("%")?L/100*w.height:L)),r||r!==!1&&a.smooth?(p=M-c,y=L-h,a.xOffset=u+(p*d+y*_)-p,a.yOffset=f+(p*g+y*m)-y):a.xOffset=a.yOffset=0,a.xOrigin=M,a.yOrigin=L,a.smooth=!!r,a.origin=e,a.originIsAbsolute=!!n,t.style[sn]="0px 0px",o&&(zi(o,a,"xOrigin",c,M),zi(o,a,"yOrigin",h,L),zi(o,a,"xOffset",u,a.xOffset),zi(o,a,"yOffset",f,a.yOffset)),t.setAttribute("data-svg-origin",M+" "+L)},Io=function(t,e){var n=t._gsap||new G_(t);if("x"in n&&!e&&!n.uncache)return n;var r=t.style,s=n.scaleX<0,o="px",a="deg",l=getComputedStyle(t),c=ei(t,sn)||"0",h,u,f,d,g,_,m,p,y,v,M,L,w,C,D,S,E,I,G,H,Z,et,X,$,Y,ft,vt,mt,wt,Wt,nt,lt;return h=u=f=_=m=p=y=v=M=0,d=g=1,n.svg=!!(t.getCTM&&rg(t)),l.translate&&((l.translate!=="none"||l.scale!=="none"||l.rotate!=="none")&&(r[fe]=(l.translate!=="none"?"translate3d("+(l.translate+" 0 0").split(" ").slice(0,3).join(", ")+") ":"")+(l.rotate!=="none"?"rotate("+l.rotate+") ":"")+(l.scale!=="none"?"scale("+l.scale.split(" ").join(",")+") ":"")+(l[fe]!=="none"?l[fe]:"")),r.scale=r.rotate=r.translate="none"),C=Qu(t,n.svg),n.svg&&(n.uncache?(Y=t.getBBox(),c=n.xOrigin-Y.x+"px "+(n.yOrigin-Y.y)+"px",$=""):$=!e&&t.getAttribute("data-svg-origin"),Wh(t,$||c,!!$||n.originIsAbsolute,n.smooth!==!1,C)),L=n.xOrigin||0,w=n.yOrigin||0,C!==Do&&(I=C[0],G=C[1],H=C[2],Z=C[3],h=et=C[4],u=X=C[5],C.length===6?(d=Math.sqrt(I*I+G*G),g=Math.sqrt(Z*Z+H*H),_=I||G?rs(G,I)*dr:0,y=H||Z?rs(H,Z)*dr+_:0,y&&(g*=Math.abs(Math.cos(y*bs))),n.svg&&(h-=L-(L*I+w*H),u-=w-(L*G+w*Z))):(lt=C[6],Wt=C[7],vt=C[8],mt=C[9],wt=C[10],nt=C[11],h=C[12],u=C[13],f=C[14],D=rs(lt,wt),m=D*dr,D&&(S=Math.cos(-D),E=Math.sin(-D),$=et*S+vt*E,Y=X*S+mt*E,ft=lt*S+wt*E,vt=et*-E+vt*S,mt=X*-E+mt*S,wt=lt*-E+wt*S,nt=Wt*-E+nt*S,et=$,X=Y,lt=ft),D=rs(-H,wt),p=D*dr,D&&(S=Math.cos(-D),E=Math.sin(-D),$=I*S-vt*E,Y=G*S-mt*E,ft=H*S-wt*E,nt=Z*E+nt*S,I=$,G=Y,H=ft),D=rs(G,I),_=D*dr,D&&(S=Math.cos(D),E=Math.sin(D),$=I*S+G*E,Y=et*S+X*E,G=G*S-I*E,X=X*S-et*E,I=$,et=Y),m&&Math.abs(m)+Math.abs(_)>359.9&&(m=_=0,p=180-p),d=xe(Math.sqrt(I*I+G*G+H*H)),g=xe(Math.sqrt(X*X+lt*lt)),D=rs(et,X),y=Math.abs(D)>2e-4?D*dr:0,M=nt?1/(nt<0?-nt:nt):0),n.svg&&($=t.getAttribute("transform"),n.forceCSS=t.setAttribute("transform","")||!og(ei(t,fe)),$&&t.setAttribute("transform",$))),Math.abs(y)>90&&Math.abs(y)<270&&(s?(d*=-1,y+=_<=0?180:-180,_+=_<=0?180:-180):(g*=-1,y+=y<=0?180:-180)),e=e||n.uncache,n.x=h-((n.xPercent=h&&(!e&&n.xPercent||(Math.round(t.offsetWidth/2)===Math.round(-h)?-50:0)))?t.offsetWidth*n.xPercent/100:0)+o,n.y=u-((n.yPercent=u&&(!e&&n.yPercent||(Math.round(t.offsetHeight/2)===Math.round(-u)?-50:0)))?t.offsetHeight*n.yPercent/100:0)+o,n.z=f+o,n.scaleX=xe(d),n.scaleY=xe(g),n.rotation=xe(_)+a,n.rotationX=xe(m)+a,n.rotationY=xe(p)+a,n.skewX=y+a,n.skewY=v+a,n.transformPerspective=M+o,(n.zOrigin=parseFloat(c.split(" ")[2])||!e&&n.zOrigin||0)&&(r[sn]=al(c)),n.xOffset=n.yOffset=0,n.force3D=Mn.force3D,n.renderTransform=n.svg?O1:ng?ag:N1,n.uncache=0,n},al=function(t){return(t=t.split(" "))[0]+" "+t[1]},Fc=function(t,e,n){var r=He(e);return xe(parseFloat(e)+parseFloat(ji(t,"x",n+"px",r)))+r},N1=function(t,e){e.z="0px",e.rotationY=e.rotationX="0deg",e.force3D=0,ag(t,e)},cr="0deg",Ks="0px",hr=") ",ag=function(t,e){var n=e||this,r=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.z,c=n.rotation,h=n.rotationY,u=n.rotationX,f=n.skewX,d=n.skewY,g=n.scaleX,_=n.scaleY,m=n.transformPerspective,p=n.force3D,y=n.target,v=n.zOrigin,M="",L=p==="auto"&&t&&t!==1||p===!0;if(v&&(u!==cr||h!==cr)){var w=parseFloat(h)*bs,C=Math.sin(w),D=Math.cos(w),S;w=parseFloat(u)*bs,S=Math.cos(w),o=Fc(y,o,C*S*-v),a=Fc(y,a,-Math.sin(w)*-v),l=Fc(y,l,D*S*-v+v)}m!==Ks&&(M+="perspective("+m+hr),(r||s)&&(M+="translate("+r+"%, "+s+"%) "),(L||o!==Ks||a!==Ks||l!==Ks)&&(M+=l!==Ks||L?"translate3d("+o+", "+a+", "+l+") ":"translate("+o+", "+a+hr),c!==cr&&(M+="rotate("+c+hr),h!==cr&&(M+="rotateY("+h+hr),u!==cr&&(M+="rotateX("+u+hr),(f!==cr||d!==cr)&&(M+="skew("+f+", "+d+hr),(g!==1||_!==1)&&(M+="scale("+g+", "+_+hr),y.style[fe]=M||"translate(0, 0)"},O1=function(t,e){var n=e||this,r=n.xPercent,s=n.yPercent,o=n.x,a=n.y,l=n.rotation,c=n.skewX,h=n.skewY,u=n.scaleX,f=n.scaleY,d=n.target,g=n.xOrigin,_=n.yOrigin,m=n.xOffset,p=n.yOffset,y=n.forceCSS,v=parseFloat(o),M=parseFloat(a),L,w,C,D,S;l=parseFloat(l),c=parseFloat(c),h=parseFloat(h),h&&(h=parseFloat(h),c+=h,l+=h),l||c?(l*=bs,c*=bs,L=Math.cos(l)*u,w=Math.sin(l)*u,C=Math.sin(l-c)*-f,D=Math.cos(l-c)*f,c&&(h*=bs,S=Math.tan(c-h),S=Math.sqrt(1+S*S),C*=S,D*=S,h&&(S=Math.tan(h),S=Math.sqrt(1+S*S),L*=S,w*=S)),L=xe(L),w=xe(w),C=xe(C),D=xe(D)):(L=u,D=f,w=C=0),(v&&!~(o+"").indexOf("px")||M&&!~(a+"").indexOf("px"))&&(v=ji(d,"x",o,"px"),M=ji(d,"y",a,"px")),(g||_||m||p)&&(v=xe(v+g-(g*L+_*C)+m),M=xe(M+_-(g*w+_*D)+p)),(r||s)&&(S=d.getBBox(),v=xe(v+r/100*S.width),M=xe(M+s/100*S.height)),S="matrix("+L+","+w+","+C+","+D+","+v+","+M+")",d.setAttribute("transform",S),y&&(d.style[fe]=S)},F1=function(t,e,n,r,s){var o=360,a=Ue(s),l=parseFloat(s)*(a&&~s.indexOf("rad")?dr:1),c=l-r,h=r+c+"deg",u,f;return a&&(u=s.split("_")[1],u==="short"&&(c%=o,c!==c%(o/2)&&(c+=c<0?o:-o)),u==="cw"&&c<0?c=(c+o*op)%o-~~(c/o)*o:u==="ccw"&&c>0&&(c=(c-o*op)%o-~~(c/o)*o)),t._pt=f=new rn(t._pt,e,n,r,c,M1),f.e=h,f.u="deg",t._props.push(n),f},fp=function(t,e){for(var n in e)t[n]=e[n];return t},B1=function(t,e,n){var r=fp({},n._gsap),s="perspective,force3D,transformOrigin,svgOrigin",o=n.style,a,l,c,h,u,f,d,g;r.svg?(c=n.getAttribute("transform"),n.setAttribute("transform",""),o[fe]=e,a=Io(n,1),Dr(n,fe),n.setAttribute("transform",c)):(c=getComputedStyle(n)[fe],o[fe]=e,a=Io(n,1),o[fe]=c);for(l in Si)c=r[l],h=a[l],c!==h&&s.indexOf(l)<0&&(d=He(c),g=He(h),u=d!==g?ji(n,l,c,g):parseFloat(c),f=parseFloat(h),t._pt=new rn(t._pt,a,l,u,f-u,Hh),t._pt.u=g||0,t._props.push(l));fp(a,r)};nn("padding,margin,Width,Radius",function(i,t){var e="Top",n="Right",r="Bottom",s="Left",o=(t<3?[e,n,r,s]:[e+s,e+n,r+n,r+s]).map(function(a){return t<2?i+a:"border"+a+i});ol[t>1?"border"+i:i]=function(a,l,c,h,u){var f,d;if(arguments.length<4)return f=o.map(function(g){return _i(a,g,c)}),d=f.join(" "),d.split(f[0]).length===5?f[0]:d;f=(h+"").split(" "),d={},o.forEach(function(g,_){return d[g]=f[_]=f[_]||f[(_-1)/2|0]}),a.init(l,d,u)}});var lg={name:"css",register:Gh,targetTest:function(t){return t.style&&t.nodeType},init:function(t,e,n,r,s){var o=this._props,a=t.style,l=n.vars.startAt,c,h,u,f,d,g,_,m,p,y,v,M,L,w,C,D;$u||Gh(),this.styles=this.styles||eg(t),D=this.styles.props,this.tween=n;for(_ in e)if(_!=="autoRound"&&(h=e[_],!(pn[_]&&W_(_,e,n,r,t,s)))){if(d=typeof h,g=ol[_],d==="function"&&(h=h.call(n,r,t,s),d=typeof h),d==="string"&&~h.indexOf("random(")&&(h=Ro(h)),g)g(this,t,_,h,n)&&(C=1);else if(_.substr(0,2)==="--")c=(getComputedStyle(t).getPropertyValue(_)+"").trim(),h+="",Wi.lastIndex=0,Wi.test(c)||(m=He(c),p=He(h)),p?m!==p&&(c=ji(t,_,c,p)+p):m&&(h+=m),this.add(a,"setProperty",c,h,r,s,0,0,_),o.push(_),D.push(_,0,a[_]);else if(d!=="undefined"){if(l&&_ in l?(c=typeof l[_]=="function"?l[_].call(n,r,t,s):l[_],Ue(c)&&~c.indexOf("random(")&&(c=Ro(c)),He(c+"")||c==="auto"||(c+=Mn.units[_]||He(_i(t,_))||""),(c+"").charAt(1)==="="&&(c=_i(t,_))):c=_i(t,_),f=parseFloat(c),y=d==="string"&&h.charAt(1)==="="&&h.substr(0,2),y&&(h=h.substr(2)),u=parseFloat(h),_ in Jn&&(_==="autoAlpha"&&(f===1&&_i(t,"visibility")==="hidden"&&u&&(f=0),D.push("visibility",0,a.visibility),zi(this,a,"visibility",f?"inherit":"hidden",u?"inherit":"hidden",!u)),_!=="scale"&&_!=="transform"&&(_=Jn[_],~_.indexOf(",")&&(_=_.split(",")[0]))),v=_ in Si,v){if(this.styles.save(_),M||(L=t._gsap,L.renderTransform&&!e.parseTransform||Io(t,e.parseTransform),w=e.smoothOrigin!==!1&&L.smooth,M=this._pt=new rn(this._pt,a,fe,0,1,L.renderTransform,L,0,-1),M.dep=1),_==="scale")this._pt=new rn(this._pt,L,"scaleY",L.scaleY,(y?Ss(L.scaleY,y+u):u)-L.scaleY||0,Hh),this._pt.u=0,o.push("scaleY",_),_+="X";else if(_==="transformOrigin"){D.push(sn,0,a[sn]),h=I1(h),L.svg?Wh(t,h,0,w,0,this):(p=parseFloat(h.split(" ")[2])||0,p!==L.zOrigin&&zi(this,L,"zOrigin",L.zOrigin,p),zi(this,a,_,al(c),al(h)));continue}else if(_==="svgOrigin"){Wh(t,h,1,w,0,this);continue}else if(_ in sg){F1(this,L,_,f,y?Ss(f,y+h):h);continue}else if(_==="smoothOrigin"){zi(this,L,"smooth",L.smooth,h);continue}else if(_==="force3D"){L[_]=h;continue}else if(_==="transform"){B1(this,h,t);continue}}else _ in a||(_=Fs(_)||_);if(v||(u||u===0)&&(f||f===0)&&!x1.test(h)&&_ in a)m=(c+"").substr((f+"").length),u||(u=0),p=He(h)||(_ in Mn.units?Mn.units[_]:m),m!==p&&(f=ji(t,_,c,p)),this._pt=new rn(this._pt,v?L:a,_,f,(y?Ss(f,y+u):u)-f,!v&&(p==="px"||_==="zIndex")&&e.autoRound!==!1?S1:Hh),this._pt.u=p||0,m!==p&&p!=="%"&&(this._pt.b=c,this._pt.r=y1);else if(_ in a)D1.call(this,t,_,c,y?y+h:h);else if(_ in t)this.add(t,_,c||t[_],y?y+h:h,r,s);else if(_!=="parseTransform"){Hu(_,h);continue}v||(_ in a?D.push(_,0,a[_]):D.push(_,1,c||t[_])),o.push(_)}}C&&$_(this)},render:function(t,e){if(e.tween._time||!Zu())for(var n=e._pt;n;)n.r(t,n.d),n=n._next;else e.styles.revert()},get:_i,aliases:Jn,getSetter:function(t,e,n){var r=Jn[e];return r&&r.indexOf(",")<0&&(e=r),e in Si&&e!==sn&&(t._gsap.x||_i(t,"x"))?n&&sp===n?e==="scale"?A1:T1:(sp=n||{})&&(e==="scale"?w1:C1):t.style&&!Bu(t.style[e])?E1:~e.indexOf("-")?b1:ju(t,e)},core:{_removeProperty:Dr,_getMatrix:Qu}};on.utils.checkPrefix=Fs;on.core.getStyleSaver=eg;(function(i,t,e,n){var r=nn(i+","+t+","+e,function(s){Si[s]=1});nn(t,function(s){Mn.units[s]="deg",sg[s]=1}),Jn[r[13]]=i+","+t,nn(n,function(s){var o=s.split(":");Jn[o[1]]=r[o[0]]})})("x,y,z,scale,scaleX,scaleY,xPercent,yPercent","rotation,rotationX,rotationY,skewX,skewY","transform,transformOrigin,svgOrigin,force3D,smoothOrigin,transformPerspective","0:translateX,1:translateY,2:translateZ,8:rotate,8:rotationZ,8:rotateZ,9:rotateX,10:rotateY");nn("x,y,z,top,right,bottom,left,width,height,fontSize,padding,margin,perspective",function(i){Mn.units[i]="px"});on.registerPlugin(lg);var Ir=on.registerPlugin(lg)||on;Ir.core.Tween;const dp=(i,t)=>{let e,n,r;try{e=i.toString().split(".")[1].length}catch{e=0}try{n=t.toString().split(".")[1].length}catch{n=0}return r=Math.pow(10,Math.max(e,n)),Math.round(i*r+t*r)/r},pp=(i,t)=>{let e,n,r;try{e=i.toString().split(".")[1].length}catch{e=0}try{n=t.toString().split(".")[1].length}catch{n=0}r=Math.pow(10,Math.max(e,n));let s=e>=n?e:n;return Number((Math.round(i*r-t*r)/r).toFixed(s))},fs=i=>document.getElementById(i),{containerId:z1,ambientLightColor:k1,ambientLightIntensity:H1,directionalLightColor:V1,directionalLightIntensity:G1,conBackgroundColor:W1}=Fe;var ll,cg,cl,hg,hl,ug,ul,fg,fl,dg,No,Xh,dl,pg;class X1{constructor(){Dn(this,ll);Dn(this,cl);Dn(this,hl);Dn(this,ul);Dn(this,fl);Dn(this,No);Dn(this,dl);ie(this,"scene");ie(this,"camera");ie(this,"container");ie(this,"controls");ie(this,"renderer");ie(this,"ambientLight");ie(this,"dirLight");ie(this,"isInit");ie(this,"clock");this.isInit=!1,this.clock=new lA}init(){this.isInit||(this.isInit=!0,this.container=fs(z1),cn(this,ll,cg).call(this),cn(this,cl,hg).call(this),cn(this,hl,ug).call(this),cn(this,ul,fg).call(this),cn(this,No,Xh).call(this),window.addEventListener("resize",()=>{cn(this,dl,pg).call(this,this)}))}changeCamera(t,e){return new Promise(n=>{let r=0;t&&(r++,Ir.to(this.camera.position,{x:t[0],y:t[1],z:t[2],duration:.5,onComplete(){r--,r===0&&n(!0)}})),e&&(r++,Ir.to(this.controls.target,{x:e[0],y:e[1],z:e[2],duration:.5,onComplete(){r--,r===0&&n(!0)}}))})}changeDirLightShadowSize(t){}changeAmbientLight(t,e){this.ambientLight.color=new Gt(t),this.ambientLight.intensity=e}changeDirLight(t,e){this.dirLight.color=new Gt(t),this.dirLight.intensity=e}addAnimate(){}changeDisableControls(t){cn(this,No,Xh).call(this,t)}}ll=new WeakSet,cg=function(){let t=new _n(60,this.container.clientWidth/this.container.clientHeight,.1,3e6);t.position.set(10,5,20),this.camera=t},cl=new WeakSet,hg=function(){this.scene=new yT,this.scene.background=new Gt(W1),this.scene.add(this.camera)},hl=new WeakSet,ug=function(){this.ambientLight=new aA(k1,H1),this.scene.add(this.ambientLight);const t=new oA(V1,G1);t.position.set(-3,5,3),t.castShadow=!0,t.shadow.camera.near=1,t.shadow.camera.far=10,t.shadow.camera.right=9,t.shadow.camera.left=-9,t.shadow.camera.top=9,t.shadow.camera.bottom=-9,t.shadow.mapSize.width=1024,t.shadow.mapSize.height=1024,this.dirLight=t,this.scene.add(this.dirLight);const e=new rA("#fff",10);e.angle=Math.PI/5,e.penumbra=.2,e.position.set(1,5,1),e.shadow.camera.near=1,e.shadow.camera.far=1e3,e.shadow.mapSize.width=1024,e.shadow.mapSize.height=1024,this.scene.add(e)},ul=new WeakSet,fg=function(){let t=new MT({antialias:!0,alpha:!0});t.localClippingEnabled=!0,this.renderer=t,t.setClearAlpha(0),t.setPixelRatio(window.devicePixelRatio),t.setSize(this.container.clientWidth,this.container.clientHeight),t.shadowMap.enabled=!0,this.container.appendChild(t.domElement),this.renderer.render(this.scene,this.camera),this.renderer.setAnimationLoop(()=>{cn(this,fl,dg).call(this,{self:this})})},fl=new WeakSet,dg=function({self:t}){var n;let e=this.clock.getDelta();t.renderer.render(t.scene,t.camera),(n=t.controls)==null||n.update(e)},No=new WeakSet,Xh=function(t=!1){let e;this.controls?e=this.controls:e=new fA(this.camera,this.renderer.domElement),e.minDistance=1,e.maxDistance=2e5,e.minPolarAngle=.25,e.maxPolarAngle=Math.PI/2,e.enableZoom=!t,e.enableDamping=!t,e.enableRotate=!t,e.dampingFactor=.25,e.screenSpacePanning=!1,e.enablePan=!t,this.controls=e},dl=new WeakSet,pg=function(t){t.camera.aspect=t.container.clientWidth/t.container.clientHeight,t.camera.updateProjectionMatrix(),t.renderer.setSize(t.container.clientWidth,t.container.clientHeight)};const Go=new X1;class ks{constructor(t){ie(this,"mesh");this.mesh=t,t.castShadow=!0,t.receiveShadow=!0}get position(){return this.mesh.position}dispose(){var e;(e=this.mesh.geometry)==null||e.dispose();let t=this.mesh.material;Array.isArray(t)||(t=[t]),t.forEach(n=>{n.dispose()})}}const{levelStep:Y1,levelStart:q1,levelSplitNum:j1,startPoint:K1}=Fe;class $1{constructor(){ie(this,"cusArr");this.cusArr=[]}push(t){this.cusArr.push(t)}pop(){let t=Math.floor(Math.random()*this.cusArr.length),e=this.cusArr[0];return this.cusArr[0]=this.cusArr[t],this.cusArr[t]=e,this.cusArr.shift()}empty(){return!this.cusArr.length}}class Z1{constructor(){ie(this,"historyLevelMaze");this.historyLevelMaze=[]}getSize(t){let e=Math.floor(t/j1),n=Y1*e;return q1+n}getLevelMaze(t){if(this.historyLevelMaze[t])return this.historyLevelMaze[t];let e=this.getSize(t),n=e,r=e,s=[],o=[],a=K1,l=[n-2,r-1];for(let g=0;g<n;g++){s.push(new Array(r).fill("wall")),o.push(new Array(r).fill(!1));for(let _=0;_<r;_++)g%2===1&&_%2===1&&(s[g][_]="road")}s[a[0]][a[1]]="start",s[l[0]][l[1]]="end";function c(g,_){return g>=0&&g<n&&_>=0&&_<r}let h=[[-1,0],[0,1],[1,0],[0,-1]],u=new $1,f=a[0]+1,d=a[1];for(u.push([f,d]),o[f][d]=!0;!u.empty();){let g=u.pop();for(let _=0;_<4;_++){let m=g[0]+h[_][0]*2,p=g[1]+h[_][1]*2;c(m,p)&&!o[m][p]&&(s[(m+g[0])/2][(p+g[1])/2]="road",u.push([m,p]),o[m][p]=!0)}}return this.historyLevelMaze[t]=s,s}}const Uo=new Z1;class mp extends ks{constructor(t){const e=Uo.getSize(t),n=new be(new Ho(e*10,e*10,1,1),new nA({color:Fe.groundColor,shininess:150,side:jn}));n.rotation.x=-Math.PI/2,n.name="ground",n.position.y=Fe.groundHeight,super(n),n.castShadow=!1}}class J1 extends ks{constructor(t){const e=Uo.getSize(t),n=new cA(e,e,16777215,16777215);n.position.y=Fe.groundHeight,super(n)}}const $s=new O;function Tn(i,t,e,n,r,s){const o=2*Math.PI*r/4,a=Math.max(s-2*r,0),l=Math.PI/4;$s.copy(t),$s[n]=0,$s.normalize();const c=.5*o/(o+a),h=1-$s.angleTo(i)/l;return Math.sign($s[e])===1?h*c:a/(o+a)+c+c*(1-h)}class tf extends Bs{constructor(t=1,e=1,n=1,r=2,s=.1){if(r=r*2+1,s=Math.min(t/2,e/2,n/2,s),super(1,1,1,r,r,r),r===1)return;const o=this.toNonIndexed();this.index=null,this.attributes.position=o.attributes.position,this.attributes.normal=o.attributes.normal,this.attributes.uv=o.attributes.uv;const a=new O,l=new O,c=new O(t,e,n).divideScalar(2).subScalar(s),h=this.attributes.position.array,u=this.attributes.normal.array,f=this.attributes.uv.array,d=h.length/6,g=new O,_=.5/r;for(let m=0,p=0;m<h.length;m+=3,p+=2)switch(a.fromArray(h,m),l.copy(a),l.x-=Math.sign(l.x)*_,l.y-=Math.sign(l.y)*_,l.z-=Math.sign(l.z)*_,l.normalize(),h[m+0]=c.x*Math.sign(a.x)+l.x*s,h[m+1]=c.y*Math.sign(a.y)+l.y*s,h[m+2]=c.z*Math.sign(a.z)+l.z*s,u[m+0]=l.x,u[m+1]=l.y,u[m+2]=l.z,Math.floor(m/d)){case 0:g.set(1,0,0),f[p+0]=Tn(g,l,"z","y",s,n),f[p+1]=1-Tn(g,l,"y","z",s,e);break;case 1:g.set(-1,0,0),f[p+0]=1-Tn(g,l,"z","y",s,n),f[p+1]=1-Tn(g,l,"y","z",s,e);break;case 2:g.set(0,1,0),f[p+0]=1-Tn(g,l,"x","z",s,t),f[p+1]=Tn(g,l,"z","x",s,n);break;case 3:g.set(0,-1,0),f[p+0]=1-Tn(g,l,"x","z",s,t),f[p+1]=1-Tn(g,l,"z","x",s,n);break;case 4:g.set(0,0,1),f[p+0]=1-Tn(g,l,"x","y",s,t),f[p+1]=1-Tn(g,l,"y","x",s,e);break;case 5:g.set(0,0,-1),f[p+0]=Tn(g,l,"x","y",s,t),f[p+1]=1-Tn(g,l,"y","x",s,e);break}}}class Q1 extends ks{constructor(){const e=new be(new tf(.8,.8,.8,5,.1),new Mr({color:Fe.personColor}));e.name="personHeader";const n=new be(new tl(.1,10,10),new Mr({color:16777215}));n.scale.z=.1,n.position.x=.2,n.position.y=.16,n.position.z=.4;const r=new be(new tl(.07,100,100),new Mr({color:3355443}));r.position.z+=.08,n.add(r);const s=n.clone();s.position.x=-.2;const o=new r_;o.moveTo(-.15,.15),o.quadraticCurveTo(0,-.1,.15,.15);const a=new Uu(o,{steps:1,depth:.02,bevelEnabled:!1}),l=new Rl({color:6236109}),c=new be(a,l);c.position.set(0,-.2,.4),e.add(n,s,c),e.lookAt(e.position.clone().add(new O(0,0,1)));super(e);ie(this,"isMove");this.isMove=!1}setMeshPosition(e){this.mesh.position.set(e[0],0,e[1])}addMoveEvent(e){if(this.isMove)return;this.isMove=!0;let n=this.mesh,r=n.position.clone(),s=(r.x+e[0])/2,o=(r.z+e[1])/2,a=.1;n.lookAt(n.position.clone().add(new O(e[0]-r.x,0,e[1]-r.z))),Ir.to(n.position,{x:s,y:.5,z:o,duration:a,ease:"power2.in",onComplete:()=>{Ir.to(n.position,{x:e[0],y:0,z:e[1],duration:a,ease:"power2.out",onComplete:()=>{this.isMove=!1}})}})}}class tw extends ks{constructor(){const t=new be(new tf(.8,.6,.3,5,.1),new Mr({color:"#d1d8e0"}));t.name="wall",super(t),t.castShadow=!1}}class ew extends ks{constructor(){const t=[-1,-1,-1,1,-1,-1,1,1,-1,-1,1,-1,-1,-1,1,1,-1,1,1,1,1,-1,1,1],e=[2,1,0,0,3,2,0,4,7,7,3,0,0,1,5,5,4,0,1,2,6,6,5,1,2,3,7,7,6,2,4,5,6,6,7,4],n=new Iu(t,e,.26,1),r=new Mr({color:"#d1d8e0",flatShading:!0}),s=new be(n,r);s.scale.set(1.3,3.5,1.3),s.rotation.z=Math.random()-.5,super(s),s.castShadow=!1}}class nw extends ks{constructor(){const t=new be;let e;if(Math.random()>.5){const o=new Ll(.3,.2,.8,4),a=new Mr({flatShading:!0,color:10734392});e=new be(o,a),e.position.y=.2,e.rotation.y=Math.PI/4,e.castShadow=!0,e.receiveShadow=!0}else{const o=new Du(.3,1,8),a=new Rl({color:10734392});e=new be(o,a),e.position.y=.8,e.castShadow=!0,e.receiveShadow=!0}const n=new tf(.1,1.35,.1,5,.02),r=new Mr({flatShading:!0,color:7951688}),s=new be(n,r);s.position.y=-.35,s.castShadow=!0,s.receiveShadow=!0,t.add(s,e),t.scale.setScalar(.6+Math.random()*.6),t.rotation.y=Math.random()*Math.PI*2,t.castShadow=!1,super(t)}}class iw{constructor(t){ie(this,"level",1);ie(this,"threeObj");ie(this,"mazeArr",[]);ie(this,"personObj",null);ie(this,"removeObjArr",[]);ie(this,"options");ie(this,"isInit",!1);ie(this,"isUpLevel",!1);ie(this,"treePosArr",[]);ie(this,"size",0);this.threeObj=Go,this.options=t,this.addPersonMoveEvent()}isArea(t,e){return t>=0&&t<this.size&&e>=0&&e<this.size}isWall(t,e){let n=[[-1,0],[0,1],[1,0],[0,-1]],r=[];for(let s=0;s<4;s++){let o=n[s],a=t+o[0],l=e+o[1];this.isArea(a,l)&&this.mazeArr[a][l]==="wall"&&r.push([a,l])}if(r.length!==2)return!1;{let s=r[0],o=r[1];return s[0]===o[0]?"x":s[1]===o[1]?"y":!1}}getTreePos(){let t=Math.floor(this.size/2)+1,e=Math.floor(Math.random()*t+t);Math.random()>.5&&(e*=-1);let n=Math.floor(Math.random()*t);Math.random()>.5&&(n*=-1),Math.random()>.5&&([e,n]=[n,e]);let r=e+"_"+n;return this.treePosArr.includes(r)?this.getTreePos():(this.treePosArr.push(r),[e,n])}drawTree(){let t=Math.floor(this.size/2);const e=Math.floor(t*t*2);console.log(e);for(let n=0;n<e;n++){let r=new nw,[s,o]=this.getTreePos();r.mesh.position.set(s,0,o),this.removeObjArr.push(r),this.threeObj.scene.add(r.mesh)}}initOne(t,e){this.mazeArr=t,this.level=e;let n=Uo.getSize(this.level);this.size=n;let r=new mp(this.level);this.threeObj.scene.add(r.mesh)}init(t,e){if(this.isInit)return;if(this.isUpLevel=!1,this.isInit=!0,this.level=e,e===1){let s=new mp(this.level);this.threeObj.scene.add(s.mesh)}let n=Uo.getSize(this.level);this.size=n,this.mazeArr=t;let r=t.length;for(let s=0;s<r;s++){let o=t[s],a=o.length;for(let l=0;l<a;l++){let c=o[l],h=pp(s,Math.floor(this.size/2)),u=pp(l,Math.floor(this.size/2));switch(c){case"start":if(this.personObj)this.personObj.setMeshPosition([h,u]);else{let d=new Q1;d.setMeshPosition([h,u]),this.threeObj.scene.add(d.mesh),this.personObj=d}break;case"end":case"road":break;case"wall":let f=this.isWall(s,l);if(f){let d=new tw;d.mesh.position.set(h,-.15,u),f==="x"&&(d.mesh.rotation.y=-Math.PI/2),this.threeObj.scene.add(d.mesh),this.removeObjArr.push(d)}else{let d=new ew;d.mesh.position.set(h,-.5,u),this.threeObj.scene.add(d.mesh),this.removeObjArr.push(d)}break}}}if(this.drawTree(),this.entityShow(this.removeObjArr.map(s=>s.mesh)).then(()=>{}),Fe.addGroundWireframe){let s=new J1(this.level);this.threeObj.scene.add(s.mesh)}this.isInit=!1}entityShow(t){Array.isArray(t)||(t=[t]);const e=t;return new Promise(n=>{Ir.from(e.map(r=>r.scale),{x:0,y:0,z:0,duration:1,ease:"elastic.out(1.1, 0.8)",stagger:{grid:[10,10],amount:1.2},onComplete:()=>{n(t)}})})}entityHide(t){Array.isArray(t)||(t=[t]);const e=t;return new Promise(n=>{Ir.to(e.map(r=>r.scale),{x:0,y:0,z:0,duration:1,ease:"elastic.out(0.8, 1.1)",stagger:{grid:[10,10],amount:1.2},onComplete:()=>{n(t)}})})}addPersonMoveFun(t){let e=[[0,-1],[0,1],[-1,0],[1,0]],n=0;switch(t){case"ArrowUp":case"w":n=0;break;case"ArrowDown":case"s":n=1;break;case"ArrowLeft":case"a":n=2;break;case"ArrowRight":case"d":n=3;break}this.movePerson(e[n])}addPersonMoveEvent(){fs("btnW").addEventListener("click",()=>{this.addPersonMoveFun("w")}),fs("btnA").addEventListener("click",()=>{this.addPersonMoveFun("a")}),fs("btnS").addEventListener("click",()=>{this.addPersonMoveFun("s")}),fs("btnD").addEventListener("click",()=>{this.addPersonMoveFun("d")}),window.addEventListener("keydown",s=>{this.personObj&&this.addPersonMoveFun(s.key)})}movePerson(t){if(this.personObj&&!this.personObj.isMove&&!this.isInit&&!this.isUpLevel){let e=this.personObj.mesh.position.clone(),n=Math.floor(e.x+t[0]),r=Math.floor(e.z+t[1]),s=this.size,o=dp(n,Math.floor(s/2)),a=dp(r,Math.floor(s/2));this.isArea(o,a)&&(this.mazeArr[o][a]==="road"||this.mazeArr[o][a]==="start"?this.personObj.addMoveEvent([n,r]):this.mazeArr[o][a]==="end"&&(this.isUpLevel=!0,this.personObj.addMoveEvent([n,r]),this.entityHide(this.removeObjArr.map(l=>l.mesh)).then(()=>{this.level++,this.removeObjArr.forEach(l=>{l.dispose(),this.threeObj.scene.remove(l.mesh)}),this.removeObjArr=[],this.treePosArr=[],this.options.upgradeLevel&&this.options.upgradeLevel()})))}}}var pl,mg,Oo,Yh,ml,_g;class rw{constructor(){Dn(this,pl);Dn(this,Oo);Dn(this,ml);ie(this,"threeObj");ie(this,"level");ie(this,"drawMaze");this.level=1,this.threeObj=Go,this.threeObj.init(),this.drawMaze=new iw({upgradeLevel:()=>{cn(this,pl,mg).call(this)}}),cn(this,Oo,Yh).call(this)}getCameraMsg(){console.log(this.threeObj.camera.position),console.log(this.threeObj.controls.target)}}pl=new WeakSet,mg=function(){this.level++,fs("levelCon").innerHTML=`\u5F53\u524D\u5173\u5361\uFF1A${this.level}`,cn(this,Oo,Yh).call(this)},Oo=new WeakSet,Yh=function(){cn(this,ml,_g).call(this).then(()=>{const t=Uo.getLevelMaze(this.level);this.drawMaze.init(t,this.level)})},ml=new WeakSet,_g=function(){return new Promise(t=>{let e=Math.floor(this.level/10);this.threeObj.changeCamera([-3.575202802800737-10*e*.5,11.116745335949188+10*e*.8,8.59618775968135+10*e*.2],[-.5382067615242148,2397269431096525e-33,1.1530877707380645]).then(()=>{t(!0)})})};const sw={class:"con",id:"three-con"},ow=x0({__name:"App",setup(i){let t;return Jp(()=>{t=new rw}),(e,n)=>{var r;return lv(),uv("div",sw,[n[0]||(n[0]=mv('<div class="con-level" id="levelCon" data-v-179184c5>\u5F53\u524D\u5173\u5361\uFF1A1</div><div class="con-btn-list" data-v-179184c5><div class="con-btn-list-item" data-v-179184c5><div class="btn" id="btnW" data-v-179184c5>W</div></div><div class="con-btn-list-item" data-v-179184c5><div class="btn" id="btnA" data-v-179184c5>A</div><div class="btn" id="btnS" data-v-179184c5>S</div><div class="btn" id="btnD" data-v-179184c5>D</div></div></div>',2)),xm(" "+bp((r=Vp(t))==null?void 0:r.level),1)])}}});const aw=(i,t)=>{const e=i.__vccOpts||i;for(const[n,r]of t)e[n]=r;return e},lw=aw(ow,[["__scopeId","data-v-179184c5"]]);let cw=$v(lw);cw.mount("#app");
