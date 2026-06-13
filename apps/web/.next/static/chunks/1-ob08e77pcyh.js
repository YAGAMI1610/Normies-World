(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,658765,995062,e=>{"use strict";var t=e.i(831095),r=e.i(147526),o=e.i(401319),n=e.i(675107);e.s(["hashMessage",0,function(e,s){let i,a;return(0,t.keccak256)((i="string"==typeof e?(0,n.stringToHex)(e):"string"==typeof e.raw?e.raw:(0,n.bytesToHex)(e.raw),a=(0,n.stringToHex)(`\x19Ethereum Signed Message:
${(0,o.size)(i)}`),(0,r.concat)([a,i])),s)}],658765);var s=e.i(704434),i=e.i(70204),a=e.i(608861),c=e.i(34888),l=e.i(569934);class u extends l.BaseError{constructor({domain:e}){super(`Invalid domain "${(0,c.stringify)(e)}".`,{metaMessages:["Must be a valid EIP-712 domain."]})}}class p extends l.BaseError{constructor({primaryType:e,types:t}){super(`Invalid primary type \`${e}\` must be one of \`${JSON.stringify(Object.keys(t))}\`.`,{docsPath:"/api/glossary/Errors#typeddatainvalidprimarytypeerror",metaMessages:["Check that the primary type is a key in `types`."]})}}class h extends l.BaseError{constructor({type:e}){super(`Struct type "${e}" is invalid.`,{metaMessages:["Struct type must not be a Solidity type."],name:"InvalidStructTypeError"})}}var d=e.i(796516),y=e.i(342692);function f({data:e,primaryType:r,types:o}){let i=function e({data:r,primaryType:o,types:i}){let a=[{type:"bytes32"}],c=[function({primaryType:e,types:r}){let o=(0,n.toHex)(function({primaryType:e,types:t}){let r="",o=function e({primaryType:t,types:r},o=new Set){let n=t.match(/^\w*/u),s=n?.[0];if(o.has(s)||void 0===r[s])return o;for(let t of(o.add(s),r[s]))e({primaryType:t.type,types:r},o);return o}({primaryType:e,types:t});for(let n of(o.delete(e),[e,...Array.from(o).sort()]))r+=`${n}(${t[n].map(({name:e,type:t})=>`${t} ${e}`).join(",")})`;return r}({primaryType:e,types:r}));return(0,t.keccak256)(o)}({primaryType:o,types:i})];for(let l of i[o]){let[o,u]=function r({types:o,name:i,type:a,value:c}){if(void 0!==o[a])return[{type:"bytes32"},(0,t.keccak256)(e({data:c,primaryType:a,types:o}))];if("bytes"===a)return[{type:"bytes32"},(0,t.keccak256)(c)];if("string"===a)return[{type:"bytes32"},(0,t.keccak256)((0,n.toHex)(c))];if(a.lastIndexOf("]")===a.length-1){let e=a.slice(0,a.lastIndexOf("[")),n=c.map(t=>r({name:i,type:e,types:o,value:t}));return[{type:"bytes32"},(0,t.keccak256)((0,s.encodeAbiParameters)(n.map(([e])=>e),n.map(([,e])=>e)))]}return[{type:a},c]}({types:i,name:l.name,type:l.type,value:r[l.name]});a.push(o),c.push(u)}return(0,s.encodeAbiParameters)(a,c)}({data:e,primaryType:r,types:o});return(0,t.keccak256)(i)}e.s(["hashTypedData",0,function(e){let{domain:s={},message:c,primaryType:l}=e,m={EIP712Domain:function({domain:e}){return["string"==typeof e?.name&&{name:"name",type:"string"},e?.version&&{name:"version",type:"string"},("number"==typeof e?.chainId||"bigint"==typeof e?.chainId)&&{name:"chainId",type:"uint256"},e?.verifyingContract&&{name:"verifyingContract",type:"address"},e?.salt&&{name:"salt",type:"bytes32"}].filter(Boolean)}({domain:s}),...e.types};!function(e){let{domain:t,message:r,primaryType:s,types:c}=e,l=(e,t)=>{for(let r of e){let{name:e,type:s}=r,u=t[e],p=s.match(y.integerRegex);if(p&&("number"==typeof u||"bigint"==typeof u)){let[e,t,r]=p;(0,n.numberToHex)(u,{signed:"int"===t,size:Number.parseInt(r,10)/8})}if("address"===s&&"string"==typeof u&&!(0,d.isAddress)(u))throw new a.InvalidAddressError({address:u});let f=s.match(y.bytesRegex);if(f){let[e,t]=f;if(t&&(0,o.size)(u)!==Number.parseInt(t,10))throw new i.BytesSizeMismatchError({expectedSize:Number.parseInt(t,10),givenSize:(0,o.size)(u)})}let m=c[s];m&&(function(e){if("address"===e||"bool"===e||"string"===e||e.startsWith("bytes")||e.startsWith("uint")||e.startsWith("int"))throw new h({type:e})}(s),l(m,u))}};if(c.EIP712Domain&&t){if("object"!=typeof t)throw new u({domain:t});l(c.EIP712Domain,t)}if("EIP712Domain"!==s)if(c[s])l(c[s],r);else throw new p({primaryType:s,types:c})}({domain:s,message:c,primaryType:l,types:m});let w=["0x1901"];return s&&w.push(function({domain:e,types:t}){return f({data:e,primaryType:"EIP712Domain",types:t})}({domain:s,types:m})),"EIP712Domain"!==l&&w.push(f({data:c,primaryType:l,types:m})),(0,t.keccak256)((0,r.concat)(w))}],995062)},619273,180166,e=>{"use strict";e.i(247167);var t={setTimeout:(e,t)=>setTimeout(e,t),clearTimeout:e=>clearTimeout(e),setInterval:(e,t)=>setInterval(e,t),clearInterval:e=>clearInterval(e)},r=new class{#e=t;#t=!1;setTimeoutProvider(e){this.#e=e}setTimeout(e,t){return this.#e.setTimeout(e,t)}clearTimeout(e){this.#e.clearTimeout(e)}setInterval(e,t){return this.#e.setInterval(e,t)}clearInterval(e){this.#e.clearInterval(e)}};e.s(["systemSetTimeoutZero",0,function(e){setTimeout(e,0)},"timeoutManager",0,r],180166);var o="u"<typeof window||"Deno"in globalThis;function n(e,t){return(t?.queryKeyHashFn||s)(e)}function s(e){return JSON.stringify(e,(e,t)=>l(t)?Object.keys(t).sort().reduce((e,r)=>(e[r]=t[r],e),{}):t)}function i(e,t){return e===t||typeof e==typeof t&&!!e&&!!t&&"object"==typeof e&&"object"==typeof t&&Object.keys(t).every(r=>i(e[r],t[r]))}var a=Object.prototype.hasOwnProperty;function c(e){return Array.isArray(e)&&e.length===Object.keys(e).length}function l(e){if(!u(e))return!1;let t=e.constructor;if(void 0===t)return!0;let r=t.prototype;return!!u(r)&&!!r.hasOwnProperty("isPrototypeOf")&&Object.getPrototypeOf(e)===Object.prototype}function u(e){return"[object Object]"===Object.prototype.toString.call(e)}var p=Symbol();e.s(["addConsumeAwareSignal",0,function(e,t,r){let o,n=!1;return Object.defineProperty(e,"signal",{enumerable:!0,get:()=>(o??=t(),n||(n=!0,o.aborted?r():o.addEventListener("abort",r,{once:!0})),o)}),e},"addToEnd",0,function(e,t,r=0){let o=[...e,t];return r&&o.length>r?o.slice(1):o},"addToStart",0,function(e,t,r=0){let o=[t,...e];return r&&o.length>r?o.slice(0,-1):o},"ensureQueryFn",0,function(e,t){return!e.queryFn&&t?.initialPromise?()=>t.initialPromise:e.queryFn&&e.queryFn!==p?e.queryFn:()=>Promise.reject(Error(`Missing queryFn: '${e.queryHash}'`))},"functionalUpdate",0,function(e,t){return"function"==typeof e?e(t):e},"hashKey",0,s,"hashQueryKeyByOptions",0,n,"isServer",0,o,"isValidTimeout",0,function(e){return"number"==typeof e&&e>=0&&e!==1/0},"matchMutation",0,function(e,t){let{exact:r,status:o,predicate:n,mutationKey:a}=e;if(a){if(!t.options.mutationKey)return!1;if(r){if(s(t.options.mutationKey)!==s(a))return!1}else if(!i(t.options.mutationKey,a))return!1}return(!o||t.state.status===o)&&(!n||!!n(t))},"matchQuery",0,function(e,t){let{type:r="all",exact:o,fetchStatus:s,predicate:a,queryKey:c,stale:l}=e;if(c){if(o){if(t.queryHash!==n(c,t.options))return!1}else if(!i(t.queryKey,c))return!1}if("all"!==r){let e=t.isActive();if("active"===r&&!e||"inactive"===r&&e)return!1}return("boolean"!=typeof l||t.isStale()===l)&&(!s||s===t.state.fetchStatus)&&(!a||!!a(t))},"noop",0,function(){},"partialMatchKey",0,i,"replaceData",0,function(e,t,r){return"function"==typeof r.structuralSharing?r.structuralSharing(e,t):!1!==r.structuralSharing?function e(t,r,o=0){if(t===r)return t;if(o>500)return r;let n=c(t)&&c(r);if(!n&&!(l(t)&&l(r)))return r;let s=(n?t:Object.keys(t)).length,i=n?r:Object.keys(r),u=i.length,p=n?Array(u):{},h=0;for(let c=0;c<u;c++){let l=n?c:i[c],u=t[l],d=r[l];if(u===d){p[l]=u,(n?c<s:a.call(t,l))&&h++;continue}if(null===u||null===d||"object"!=typeof u||"object"!=typeof d){p[l]=d;continue}let y=e(u,d,o+1);p[l]=y,y===u&&h++}return s===u&&h===s?t:p}(e,t):t},"resolveQueryBoolean",0,function(e,t){return"function"==typeof e?e(t):e},"resolveStaleTime",0,function(e,t){return"function"==typeof e?e(t):e},"shallowEqualObjects",0,function(e,t){if(!t||Object.keys(e).length!==Object.keys(t).length)return!1;for(let r in e)if(e[r]!==t[r])return!1;return!0},"shouldThrowError",0,function(e,t){return"function"==typeof e?e(...t):!!e},"skipToken",0,p,"sleep",0,function(e){return new Promise(t=>{r.setTimeout(t,e)})},"timeUntilStale",0,function(e,t){return Math.max(e+(t||0)-Date.now(),0)}],619273)},540143,e=>{"use strict";let t,r,o,n,s,i;var a=e.i(180166).systemSetTimeoutZero,c=(t=[],r=0,o=e=>{e()},n=e=>{e()},s=a,{batch:e=>{let i;r++;try{i=e()}finally{let e;--r||(e=t,t=[],e.length&&s(()=>{n(()=>{e.forEach(e=>{o(e)})})}))}return i},batchCalls:e=>(...t)=>{i(()=>{e(...t)})},schedule:i=e=>{r?t.push(e):s(()=>{o(e)})},setNotifyFunction:e=>{o=e},setBatchNotifyFunction:e=>{n=e},setScheduler:e=>{s=e}});e.s(["notifyManager",0,c])},175555,915823,e=>{"use strict";var t=class{constructor(){this.listeners=new Set,this.subscribe=this.subscribe.bind(this)}subscribe(e){return this.listeners.add(e),this.onSubscribe(),()=>{this.listeners.delete(e),this.onUnsubscribe()}}hasListeners(){return this.listeners.size>0}onSubscribe(){}onUnsubscribe(){}};e.s(["Subscribable",0,t],915823);var r=new class extends t{#r;#o;#n;constructor(){super(),this.#n=e=>{if("u">typeof window&&window.addEventListener){let t=()=>e();return window.addEventListener("visibilitychange",t,!1),()=>{window.removeEventListener("visibilitychange",t)}}}}onSubscribe(){this.#o||this.setEventListener(this.#n)}onUnsubscribe(){this.hasListeners()||(this.#o?.(),this.#o=void 0)}setEventListener(e){this.#n=e,this.#o?.(),this.#o=e(e=>{"boolean"==typeof e?this.setFocused(e):this.onFocus()})}setFocused(e){this.#r!==e&&(this.#r=e,this.onFocus())}onFocus(){let e=this.isFocused();this.listeners.forEach(t=>{t(e)})}isFocused(){return"boolean"==typeof this.#r?this.#r:globalThis.document?.visibilityState!=="hidden"}};e.s(["focusManager",0,r],175555)},814448,793803,e=>{"use strict";var t=e.i(915823),r=new class extends t.Subscribable{#s=!0;#o;#n;constructor(){super(),this.#n=e=>{if("u">typeof window&&window.addEventListener){let t=()=>e(!0),r=()=>e(!1);return window.addEventListener("online",t,!1),window.addEventListener("offline",r,!1),()=>{window.removeEventListener("online",t),window.removeEventListener("offline",r)}}}}onSubscribe(){this.#o||this.setEventListener(this.#n)}onUnsubscribe(){this.hasListeners()||(this.#o?.(),this.#o=void 0)}setEventListener(e){this.#n=e,this.#o?.(),this.#o=e(this.setOnline.bind(this))}setOnline(e){this.#s!==e&&(this.#s=e,this.listeners.forEach(t=>{t(e)}))}isOnline(){return this.#s}};e.s(["onlineManager",0,r],814448),e.i(619273),e.s(["pendingThenable",0,function(){let e,t,r=new Promise((r,o)=>{e=r,t=o});function o(e){Object.assign(r,e),delete r.resolve,delete r.reject}return r.status="pending",r.catch(()=>{}),r.resolve=t=>{o({status:"fulfilled",value:t}),e(t)},r.reject=e=>{o({status:"rejected",reason:e}),t(e)},r}],793803)},273911,e=>{"use strict";let t;var r=e.i(619273),o=(t=()=>r.isServer,{isServer:()=>t(),setIsServer(e){t=e}});e.s(["environmentManager",0,o])},286491,936553,88587,e=>{"use strict";e.i(247167);var t=e.i(619273),r=e.i(540143),o=e.i(175555),n=e.i(814448),s=e.i(793803),i=e.i(273911);function a(e){return Math.min(1e3*2**e,3e4)}function c(e){return(e??"online")!=="online"||n.onlineManager.isOnline()}var l=class extends Error{constructor(e){super("CancelledError"),this.revert=e?.revert,this.silent=e?.silent}};function u(e){let r,u=!1,p=0,h=(0,s.pendingThenable)(),d=()=>o.focusManager.isFocused()&&("always"===e.networkMode||n.onlineManager.isOnline())&&e.canRun(),y=()=>c(e.networkMode)&&e.canRun(),f=e=>{"pending"===h.status&&(r?.(),h.resolve(e))},m=e=>{"pending"===h.status&&(r?.(),h.reject(e))},w=()=>new Promise(t=>{r=e=>{("pending"!==h.status||d())&&t(e)},e.onPause?.()}).then(()=>{r=void 0,"pending"===h.status&&e.onContinue?.()}),b=()=>{let r;if("pending"!==h.status)return;let o=0===p?e.initialPromise:void 0;try{r=o??e.fn()}catch(e){r=Promise.reject(e)}Promise.resolve(r).then(f).catch(r=>{if("pending"!==h.status)return;let o=e.retry??3*!i.environmentManager.isServer(),n=e.retryDelay??a,s="function"==typeof n?n(p,r):n,c=!0===o||"number"==typeof o&&p<o||"function"==typeof o&&o(p,r);u||!c?m(r):(p++,e.onFail?.(p,r),(0,t.sleep)(s).then(()=>d()?void 0:w()).then(()=>{u?m(r):b()}))})};return{promise:h,status:()=>h.status,cancel:t=>{if("pending"===h.status){let r=new l(t);m(r),e.onCancel?.(r)}},continue:()=>(r?.(),h),cancelRetry:()=>{u=!0},continueRetry:()=>{u=!1},canStart:y,start:()=>(y()?b():w().then(b),h)}}e.s(["CancelledError",0,l,"canFetch",0,c,"createRetryer",0,u],936553);var p=e.i(180166),h=class{#i;destroy(){this.clearGcTimeout()}scheduleGc(){this.clearGcTimeout(),(0,t.isValidTimeout)(this.gcTime)&&(this.#i=p.timeoutManager.setTimeout(()=>{this.optionalRemove()},this.gcTime))}updateGcTime(e){this.gcTime=Math.max(this.gcTime||0,e??(i.environmentManager.isServer()?1/0:3e5))}clearGcTimeout(){void 0!==this.#i&&(p.timeoutManager.clearTimeout(this.#i),this.#i=void 0)}};function d(e,{pages:t,pageParams:r}){let o=t.length-1;return t.length>0?e.getNextPageParam(t[o],t,r[o],r):void 0}e.s(["Removable",0,h],88587);var y=class extends h{#a;#c;#l;#u;#p;#h;#d;#y;constructor(e){super(),this.#y=!1,this.#d=e.defaultOptions,this.setOptions(e.options),this.observers=[],this.#p=e.client,this.#u=this.#p.getQueryCache(),this.queryKey=e.queryKey,this.queryHash=e.queryHash,this.#c=w(this.options),this.state=e.state??this.#c,this.scheduleGc()}get meta(){return this.options.meta}get queryType(){return this.#a}get promise(){return this.#h?.promise}setOptions(e){if(this.options={...this.#d,...e},e?._type&&(this.#a=e._type),this.updateGcTime(this.options.gcTime),this.state&&void 0===this.state.data){let e=w(this.options);void 0!==e.data&&(this.setState(m(e.data,e.dataUpdatedAt)),this.#c=e)}}optionalRemove(){this.observers.length||"idle"!==this.state.fetchStatus||this.#u.remove(this)}setData(e,r){let o=(0,t.replaceData)(this.state.data,e,this.options);return this.#f({data:o,type:"success",dataUpdatedAt:r?.updatedAt,manual:r?.manual}),o}setState(e){this.#f({type:"setState",state:e})}cancel(e){let r=this.#h?.promise;return this.#h?.cancel(e),r?r.then(t.noop).catch(t.noop):Promise.resolve()}destroy(){super.destroy(),this.cancel({silent:!0})}get resetState(){return this.#c}reset(){this.destroy(),this.setState(this.resetState)}isActive(){return this.observers.some(e=>!1!==(0,t.resolveQueryBoolean)(e.options.enabled,this))}isDisabled(){return this.getObserversCount()>0?!this.isActive():this.options.queryFn===t.skipToken||!this.isFetched()}isFetched(){return this.state.dataUpdateCount+this.state.errorUpdateCount>0}isStatic(){return this.getObserversCount()>0&&this.observers.some(e=>"static"===(0,t.resolveStaleTime)(e.options.staleTime,this))}isStale(){return this.getObserversCount()>0?this.observers.some(e=>e.getCurrentResult().isStale):void 0===this.state.data||this.state.isInvalidated}isStaleByTime(e=0){return void 0===this.state.data||"static"!==e&&(!!this.state.isInvalidated||!(0,t.timeUntilStale)(this.state.dataUpdatedAt,e))}onFocus(){let e=this.observers.find(e=>e.shouldFetchOnWindowFocus());e?.refetch({cancelRefetch:!1}),this.#h?.continue()}onOnline(){let e=this.observers.find(e=>e.shouldFetchOnReconnect());e?.refetch({cancelRefetch:!1}),this.#h?.continue()}addObserver(e){this.observers.includes(e)||(this.observers.push(e),this.clearGcTimeout(),this.#u.notify({type:"observerAdded",query:this,observer:e}))}removeObserver(e){this.observers.includes(e)&&(this.observers=this.observers.filter(t=>t!==e),this.observers.length||(this.#h&&(this.#y||this.#m()?this.#h.cancel({revert:!0}):this.#h.cancelRetry()),this.scheduleGc()),this.#u.notify({type:"observerRemoved",query:this,observer:e}))}getObserversCount(){return this.observers.length}#m(){return"paused"===this.state.fetchStatus&&"pending"===this.state.status}invalidate(){this.state.isInvalidated||this.#f({type:"invalidate"})}async fetch(e,r){var o;let n;if("idle"!==this.state.fetchStatus&&this.#h?.status()!=="rejected"){if(void 0!==this.state.data&&r?.cancelRefetch)this.cancel({silent:!0});else if(this.#h)return this.#h.continueRetry(),this.#h.promise}if(e&&this.setOptions(e),!this.options.queryFn){let e=this.observers.find(e=>e.options.queryFn);e&&this.setOptions(e.options)}let s=new AbortController,i=e=>{Object.defineProperty(e,"signal",{enumerable:!0,get:()=>(this.#y=!0,s.signal)})},a=()=>{let e,o=(0,t.ensureQueryFn)(this.options,r),n=(i(e={client:this.#p,queryKey:this.queryKey,meta:this.meta}),e);return(this.#y=!1,this.options.persister)?this.options.persister(o,n,this):o(n)},c=(i(n={fetchOptions:r,options:this.options,queryKey:this.queryKey,client:this.#p,state:this.state,fetchFn:a}),n),p="infinite"===this.#a?(o=this.options.pages,{onFetch:(e,r)=>{let n=e.options,s=e.fetchOptions?.meta?.fetchMore?.direction,i=e.state.data?.pages||[],a=e.state.data?.pageParams||[],c={pages:[],pageParams:[]},l=0,u=async()=>{let r=!1,u=(0,t.ensureQueryFn)(e.options,e.fetchOptions),p=async(o,n,s)=>{let i;if(r)return Promise.reject(e.signal.reason);if(null==n&&o.pages.length)return Promise.resolve(o);let a=(i={client:e.client,queryKey:e.queryKey,pageParam:n,direction:s?"backward":"forward",meta:e.options.meta},(0,t.addConsumeAwareSignal)(i,()=>e.signal,()=>r=!0),i),c=await u(a),{maxPages:l}=e.options,p=s?t.addToStart:t.addToEnd;return{pages:p(o.pages,c,l),pageParams:p(o.pageParams,n,l)}};if(s&&i.length){let e="backward"===s,t={pages:i,pageParams:a},r=(e?function(e,{pages:t,pageParams:r}){return t.length>0?e.getPreviousPageParam?.(t[0],t,r[0],r):void 0}:d)(n,t);c=await p(t,r,e)}else{let e=o??i.length;do{let e=0===l?a[0]??n.initialPageParam:d(n,c);if(l>0&&null==e)break;c=await p(c,e),l++}while(l<e)}return c};e.options.persister?e.fetchFn=()=>e.options.persister?.(u,{client:e.client,queryKey:e.queryKey,meta:e.options.meta,signal:e.signal},r):e.fetchFn=u}}):this.options.behavior;p?.onFetch(c,this),this.#l=this.state,("idle"===this.state.fetchStatus||this.state.fetchMeta!==c.fetchOptions?.meta)&&this.#f({type:"fetch",meta:c.fetchOptions?.meta}),this.#h=u({initialPromise:r?.initialPromise,fn:c.fetchFn,onCancel:e=>{e instanceof l&&e.revert&&this.setState({...this.#l,fetchStatus:"idle"}),s.abort()},onFail:(e,t)=>{this.#f({type:"failed",failureCount:e,error:t})},onPause:()=>{this.#f({type:"pause"})},onContinue:()=>{this.#f({type:"continue"})},retry:c.options.retry,retryDelay:c.options.retryDelay,networkMode:c.options.networkMode,canRun:()=>!0});try{let e=await this.#h.start();if(void 0===e)throw Error(`${this.queryHash} data is undefined`);return this.setData(e),this.#u.config.onSuccess?.(e,this),this.#u.config.onSettled?.(e,this.state.error,this),e}catch(e){if(e instanceof l){if(e.silent)return this.#h.promise;else if(e.revert){if(void 0===this.state.data)throw e;return this.state.data}}throw this.#f({type:"error",error:e}),this.#u.config.onError?.(e,this),this.#u.config.onSettled?.(this.state.data,e,this),e}finally{this.scheduleGc()}}#f(e){let t=t=>{switch(e.type){case"failed":return{...t,fetchFailureCount:e.failureCount,fetchFailureReason:e.error};case"pause":return{...t,fetchStatus:"paused"};case"continue":return{...t,fetchStatus:"fetching"};case"fetch":return{...t,...f(t.data,this.options),fetchMeta:e.meta??null};case"success":let r={...t,...m(e.data,e.dataUpdatedAt),dataUpdateCount:t.dataUpdateCount+1,...!e.manual&&{fetchStatus:"idle",fetchFailureCount:0,fetchFailureReason:null}};return this.#l=e.manual?r:void 0,r;case"error":let o=e.error;return{...t,error:o,errorUpdateCount:t.errorUpdateCount+1,errorUpdatedAt:Date.now(),fetchFailureCount:t.fetchFailureCount+1,fetchFailureReason:o,fetchStatus:"idle",status:"error",isInvalidated:!0};case"invalidate":return{...t,isInvalidated:!0};case"setState":return{...t,...e.state}}};this.state=t(this.state),r.notifyManager.batch(()=>{this.observers.forEach(e=>{e.onQueryUpdate()}),this.#u.notify({query:this,type:"updated",action:e})})}};function f(e,t){return{fetchFailureCount:0,fetchFailureReason:null,fetchStatus:c(t.networkMode)?"fetching":"paused",...void 0===e&&{error:null,status:"pending"}}}function m(e,t){return{data:e,dataUpdatedAt:t??Date.now(),error:null,isInvalidated:!1,status:"success"}}function w(e){let t="function"==typeof e.initialData?e.initialData():e.initialData,r=void 0!==t,o=r?"function"==typeof e.initialDataUpdatedAt?e.initialDataUpdatedAt():e.initialDataUpdatedAt:0;return{data:t,dataUpdateCount:0,dataUpdatedAt:r?o??Date.now():0,error:null,errorUpdateCount:0,errorUpdatedAt:0,fetchFailureCount:0,fetchFailureReason:null,fetchMeta:null,isInvalidated:!1,status:r?"success":"pending",fetchStatus:"idle"}}e.s(["Query",0,y,"fetchState",0,f],286491)},912598,e=>{"use strict";var t=e.i(271645),r=e.i(843476),o=t.createContext(void 0);e.s(["QueryClientProvider",0,({client:e,children:n})=>(t.useEffect(()=>(e.mount(),()=>{e.unmount()}),[e]),(0,r.jsx)(o.Provider,{value:e,children:n})),"useQueryClient",0,e=>{let r=t.useContext(o);if(e)return e;if(!r)throw Error("No QueryClient set, use QueryClientProvider to set one");return r}])},869230,e=>{"use strict";var t=e.i(175555),r=e.i(273911),o=e.i(540143),n=e.i(286491),s=e.i(915823),i=e.i(793803),a=e.i(619273),c=e.i(180166),l=class extends s.Subscribable{constructor(e,t){super(),this.options=t,this.#p=e,this.#w=null,this.#b=(0,i.pendingThenable)(),this.bindMethods(),this.setOptions(t)}#p;#g=void 0;#v=void 0;#k=void 0;#C;#W;#b;#w;#O;#x;#R;#I;#S;#T;#q=new Set;bindMethods(){this.refetch=this.refetch.bind(this)}onSubscribe(){1===this.listeners.size&&(this.#g.addObserver(this),u(this.#g,this.options)?this.#P():this.updateResult(),this.#E())}onUnsubscribe(){this.hasListeners()||this.destroy()}shouldFetchOnReconnect(){return p(this.#g,this.options,this.options.refetchOnReconnect)}shouldFetchOnWindowFocus(){return p(this.#g,this.options,this.options.refetchOnWindowFocus)}destroy(){this.listeners=new Set,this.#M(),this.#_(),this.#g.removeObserver(this)}setOptions(e){let t=this.options,r=this.#g;if(this.options=this.#p.defaultQueryOptions(e),void 0!==this.options.enabled&&"boolean"!=typeof this.options.enabled&&"function"!=typeof this.options.enabled&&"boolean"!=typeof(0,a.resolveQueryBoolean)(this.options.enabled,this.#g))throw Error("Expected enabled to be a boolean or a callback that returns a boolean");this.#Q(),this.#g.setOptions(this.options),t._defaulted&&!(0,a.shallowEqualObjects)(this.options,t)&&this.#p.getQueryCache().notify({type:"observerOptionsUpdated",query:this.#g,observer:this});let o=this.hasListeners();o&&h(this.#g,r,this.options,t)&&this.#P(),this.updateResult(),o&&(this.#g!==r||(0,a.resolveQueryBoolean)(this.options.enabled,this.#g)!==(0,a.resolveQueryBoolean)(t.enabled,this.#g)||(0,a.resolveStaleTime)(this.options.staleTime,this.#g)!==(0,a.resolveStaleTime)(t.staleTime,this.#g))&&this.#A();let n=this.#B();o&&(this.#g!==r||(0,a.resolveQueryBoolean)(this.options.enabled,this.#g)!==(0,a.resolveQueryBoolean)(t.enabled,this.#g)||n!==this.#T)&&this.#F(n)}getOptimisticResult(e){var t,r;let o=this.#p.getQueryCache().build(this.#p,e),n=this.createResult(o,e);return t=this,r=n,(0,a.shallowEqualObjects)(t.getCurrentResult(),r)||(this.#k=n,this.#W=this.options,this.#C=this.#g.state),n}getCurrentResult(){return this.#k}trackResult(e,t){return new Proxy(e,{get:(e,r)=>(this.trackProp(r),t?.(r),"promise"===r&&(this.trackProp("data"),this.options.experimental_prefetchInRender||"pending"!==this.#b.status||this.#b.reject(Error("experimental_prefetchInRender feature flag is not enabled"))),Reflect.get(e,r))})}trackProp(e){this.#q.add(e)}getCurrentQuery(){return this.#g}refetch({...e}={}){return this.fetch({...e})}fetchOptimistic(e){let t=this.#p.defaultQueryOptions(e),r=this.#p.getQueryCache().build(this.#p,t);return r.fetch().then(()=>this.createResult(r,t))}fetch(e){return this.#P({...e,cancelRefetch:e.cancelRefetch??!0}).then(()=>(this.updateResult(),this.#k))}#P(e){this.#Q();let t=this.#g.fetch(this.options,e);return e?.throwOnError||(t=t.catch(a.noop)),t}#A(){this.#M();let e=(0,a.resolveStaleTime)(this.options.staleTime,this.#g);if(r.environmentManager.isServer()||this.#k.isStale||!(0,a.isValidTimeout)(e))return;let t=(0,a.timeUntilStale)(this.#k.dataUpdatedAt,e);this.#I=c.timeoutManager.setTimeout(()=>{this.#k.isStale||this.updateResult()},t+1)}#B(){return("function"==typeof this.options.refetchInterval?this.options.refetchInterval(this.#g):this.options.refetchInterval)??!1}#F(e){this.#_(),this.#T=e,!r.environmentManager.isServer()&&!1!==(0,a.resolveQueryBoolean)(this.options.enabled,this.#g)&&(0,a.isValidTimeout)(this.#T)&&0!==this.#T&&(this.#S=c.timeoutManager.setInterval(()=>{(this.options.refetchIntervalInBackground||t.focusManager.isFocused())&&this.#P()},this.#T))}#E(){this.#A(),this.#F(this.#B())}#M(){void 0!==this.#I&&(c.timeoutManager.clearTimeout(this.#I),this.#I=void 0)}#_(){void 0!==this.#S&&(c.timeoutManager.clearInterval(this.#S),this.#S=void 0)}createResult(e,t){let r,o=this.#g,s=this.options,c=this.#k,l=this.#C,p=this.#W,y=e!==o?e.state:this.#v,{state:f}=e,m={...f},w=!1;if(t._optimisticResults){let r=this.hasListeners(),i=!r&&u(e,t),a=r&&h(e,o,t,s);(i||a)&&(m={...m,...(0,n.fetchState)(f.data,e.options)}),"isRestoring"===t._optimisticResults&&(m.fetchStatus="idle")}let{error:b,errorUpdatedAt:g,status:v}=m;r=m.data;let k=!1;if(void 0!==t.placeholderData&&void 0===r&&"pending"===v){let e;c?.isPlaceholderData&&t.placeholderData===p?.placeholderData?(e=c.data,k=!0):e="function"==typeof t.placeholderData?t.placeholderData(this.#R?.state.data,this.#R):t.placeholderData,void 0!==e&&(v="success",r=(0,a.replaceData)(c?.data,e,t),w=!0)}if(t.select&&void 0!==r&&!k)if(c&&r===l?.data&&t.select===this.#O)r=this.#x;else try{this.#O=t.select,r=t.select(r),r=(0,a.replaceData)(c?.data,r,t),this.#x=r,this.#w=null}catch(e){this.#w=e}this.#w&&(b=this.#w,r=this.#x,g=Date.now(),v="error");let C="fetching"===m.fetchStatus,W="pending"===v,O="error"===v,x=W&&C,R=void 0!==r,I={status:v,fetchStatus:m.fetchStatus,isPending:W,isSuccess:"success"===v,isError:O,isInitialLoading:x,isLoading:x,data:r,dataUpdatedAt:m.dataUpdatedAt,error:b,errorUpdatedAt:g,failureCount:m.fetchFailureCount,failureReason:m.fetchFailureReason,errorUpdateCount:m.errorUpdateCount,isFetched:e.isFetched(),isFetchedAfterMount:m.dataUpdateCount>y.dataUpdateCount||m.errorUpdateCount>y.errorUpdateCount,isFetching:C,isRefetching:C&&!W,isLoadingError:O&&!R,isPaused:"paused"===m.fetchStatus,isPlaceholderData:w,isRefetchError:O&&R,isStale:d(e,t),refetch:this.refetch,promise:this.#b,isEnabled:!1!==(0,a.resolveQueryBoolean)(t.enabled,e)};if(this.options.experimental_prefetchInRender){let t=void 0!==I.data,r="error"===I.status&&!t,n=e=>{r?e.reject(I.error):t&&e.resolve(I.data)},s=()=>{n(this.#b=I.promise=(0,i.pendingThenable)())},a=this.#b;switch(a.status){case"pending":e.queryHash===o.queryHash&&n(a);break;case"fulfilled":(r||I.data!==a.value)&&s();break;case"rejected":r&&I.error===a.reason||s()}}return I}updateResult(){let e=this.#k,t=this.createResult(this.#g,this.options);if(this.#C=this.#g.state,this.#W=this.options,void 0!==this.#C.data&&(this.#R=this.#g),(0,a.shallowEqualObjects)(t,e))return;this.#k=t;let r=()=>{if(!e)return!0;let{notifyOnChangeProps:t}=this.options,r="function"==typeof t?t():t;if("all"===r||!r&&!this.#q.size)return!0;let o=new Set(r??this.#q);return this.options.throwOnError&&o.add("error"),Object.keys(this.#k).some(t=>this.#k[t]!==e[t]&&o.has(t))};this.#j({listeners:r()})}#Q(){let e=this.#p.getQueryCache().build(this.#p,this.options);if(e===this.#g)return;let t=this.#g;this.#g=e,this.#v=e.state,this.hasListeners()&&(t?.removeObserver(this),e.addObserver(this))}onQueryUpdate(){this.updateResult(),this.hasListeners()&&this.#E()}#j(e){o.notifyManager.batch(()=>{e.listeners&&this.listeners.forEach(e=>{e(this.#k)}),this.#p.getQueryCache().notify({query:this.#g,type:"observerResultsUpdated"})})}};function u(e,t){return!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&void 0===e.state.data&&("error"!==e.state.status||!1!==(0,a.resolveQueryBoolean)(t.retryOnMount,e))||void 0!==e.state.data&&p(e,t,t.refetchOnMount)}function p(e,t,r){if(!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&"static"!==(0,a.resolveStaleTime)(t.staleTime,e)){let o="function"==typeof r?r(e):r;return"always"===o||!1!==o&&d(e,t)}return!1}function h(e,t,r,o){return(e!==t||!1===(0,a.resolveQueryBoolean)(o.enabled,e))&&(!r.suspense||"error"!==e.state.status)&&d(e,r)}function d(e,t){return!1!==(0,a.resolveQueryBoolean)(t.enabled,e)&&e.isStaleByTime((0,a.resolveStaleTime)(t.staleTime,e))}e.s(["QueryObserver",0,l])},266027,e=>{"use strict";let t;var r=e.i(869230);e.i(247167);var o=e.i(271645),n=e.i(273911),s=e.i(619273),i=e.i(540143),a=e.i(912598);e.i(843476);var c=o.createContext((t=!1,{clearReset:()=>{t=!1},reset:()=>{t=!0},isReset:()=>t})),l=o.createContext(!1);l.Provider;var u=(e,t,r)=>t.fetchOptimistic(e).catch(()=>{r.clearReset()});e.s(["useQuery",0,function(e,t){return function(e,t,r){let p,h=o.useContext(l),d=o.useContext(c),y=(0,a.useQueryClient)(r),f=y.defaultQueryOptions(e);y.getDefaultOptions().queries?._experimental_beforeQuery?.(f);let m=y.getQueryCache().get(f.queryHash),w=!1!==e.subscribed;if(f._optimisticResults=h?"isRestoring":w?"optimistic":void 0,f.suspense){let e=e=>"static"===e?e:Math.max(e??1e3,1e3),t=f.staleTime;f.staleTime="function"==typeof t?(...r)=>e(t(...r)):e(t),"number"==typeof f.gcTime&&(f.gcTime=Math.max(f.gcTime,1e3))}p=m?.state.error&&"function"==typeof f.throwOnError?(0,s.shouldThrowError)(f.throwOnError,[m.state.error,m]):f.throwOnError,(f.suspense||f.experimental_prefetchInRender||p)&&!d.isReset()&&(f.retryOnMount=!1),o.useEffect(()=>{d.clearReset()},[d]);let b=!y.getQueryCache().get(f.queryHash),[g]=o.useState(()=>new t(y,f)),v=g.getOptimisticResult(f),k=!h&&w;if(o.useSyncExternalStore(o.useCallback(e=>{let t=k?g.subscribe(i.notifyManager.batchCalls(e)):s.noop;return g.updateResult(),t},[g,k]),()=>g.getCurrentResult(),()=>g.getCurrentResult()),o.useEffect(()=>{g.setOptions(f)},[f,g]),f?.suspense&&v.isPending)throw u(f,g,d);if((({result:e,errorResetBoundary:t,throwOnError:r,query:o,suspense:n})=>e.isError&&!t.isReset()&&!e.isFetching&&o&&(n&&void 0===e.data||(0,s.shouldThrowError)(r,[e.error,o])))({result:v,errorResetBoundary:d,throwOnError:f.throwOnError,query:m,suspense:f.suspense}))throw v.error;if(y.getDefaultOptions().queries?._experimental_afterQuery?.(f,v),f.experimental_prefetchInRender&&!n.environmentManager.isServer()&&v.isLoading&&v.isFetching&&!h){let e=b?u(f,g,d):m?.promise;e?.catch(s.noop).finally(()=>{g.updateResult()})}return f.notifyOnChangeProps?v:g.trackResult(v)}(e,r.QueryObserver,t)}],266027)},207670,e=>{"use strict";e.s(["default",0,function(){for(var e,t,r=0,o="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=function e(t){var r,o,n="";if("string"==typeof t||"number"==typeof t)n+=t;else if("object"==typeof t)if(Array.isArray(t)){var s=t.length;for(r=0;r<s;r++)t[r]&&(o=e(t[r]))&&(n&&(n+=" "),n+=o)}else for(o in t)t[o]&&(n&&(n+=" "),n+=o);return n}(e))&&(o&&(o+=" "),o+=t);return o}])},356836,e=>{"use strict";var t=`{
  "connect_wallet": {
    "label": "Connect Wallet",
    "wrong_network": {
      "label": "Wrong network"
    }
  },

  "intro": {
    "title": "What is a Wallet?",
    "description": "A wallet is used to send, receive, store, and display digital assets. It's also a new way to log in, without needing to create new accounts and passwords on every website.",
    "digital_asset": {
      "title": "A Home for your Digital Assets",
      "description": "Wallets are used to send, receive, store, and display digital assets like Ethereum and NFTs."
    },
    "login": {
      "title": "A New Way to Log In",
      "description": "Instead of creating new accounts and passwords on every website, just connect your wallet."
    },
    "get": {
      "label": "Get a Wallet"
    },
    "learn_more": {
      "label": "Learn More"
    }
  },

  "sign_in": {
    "label": "Verify your account",
    "description": "To finish connecting, you must sign a message in your wallet to verify that you are the owner of this account.",
    "message": {
      "send": "Sign message",
      "preparing": "Preparing message...",
      "cancel": "Cancel",
      "preparing_error": "Error preparing message, please retry!"
    },
    "signature": {
      "waiting": "Waiting for signature...",
      "verifying": "Verifying signature...",
      "signing_error": "Error signing message, please retry!",
      "verifying_error": "Error verifying signature, please retry!",
      "oops_error": "Oops, something went wrong!"
    }
  },

  "connect": {
    "label": "Connect",
    "title": "Connect a Wallet",
    "new_to_ethereum": {
      "description": "New to Ethereum wallets?",
      "learn_more": {
        "label": "Learn More"
      }
    },
    "learn_more": {
      "label": "Learn more"
    },
    "recent": "Recent",
    "status": {
      "opening": "Opening %{wallet}...",
      "connecting": "Connecting",
      "connect_mobile": "Continue in %{wallet}",
      "not_installed": "%{wallet} is not installed",
      "not_available": "%{wallet} is not available",
      "confirm": "Confirm connection in the extension",
      "confirm_mobile": "Accept connection request in the wallet"
    },
    "secondary_action": {
      "get": {
        "description": "Don't have %{wallet}?",
        "label": "GET"
      },
      "install": {
        "label": "INSTALL"
      },
      "retry": {
        "label": "RETRY"
      }
    },
    "walletconnect": {
      "description": {
        "full": "Need the official WalletConnect modal?",
        "compact": "Need the WalletConnect modal?"
      },
      "open": {
        "label": "OPEN"
      }
    }
  },

  "connect_scan": {
    "title": "Scan with %{wallet}",
    "fallback_title": "Scan with your phone"
  },

  "connector_group": {
    "installed": "Installed",
    "recommended": "Recommended",
    "other": "Other",
    "popular": "Popular",
    "more": "More",
    "others": "Others"
  },

  "get": {
    "title": "Get a Wallet",
    "action": {
      "label": "GET"
    },
    "mobile": {
      "description": "Mobile Wallet"
    },
    "extension": {
      "description": "Browser Extension"
    },
    "mobile_and_extension": {
      "description": "Mobile Wallet and Extension"
    },
    "mobile_and_desktop": {
      "description": "Mobile and Desktop Wallet"
    },
    "looking_for": {
      "title": "Not what you're looking for?",
      "mobile": {
        "description": "Select a wallet on the main screen to get started with a different wallet provider."
      },
      "desktop": {
        "compact_description": "Select a wallet on the main screen to get started with a different wallet provider.",
        "wide_description": "Select a wallet on the left to get started with a different wallet provider."
      }
    }
  },

  "get_options": {
    "title": "Get started with %{wallet}",
    "short_title": "Get %{wallet}",
    "mobile": {
      "title": "%{wallet} for Mobile",
      "description": "Use the mobile wallet to explore the world of Ethereum.",
      "download": {
        "label": "Get the app"
      }
    },
    "extension": {
      "title": "%{wallet} for %{browser}",
      "description": "Access your wallet right from your favorite web browser.",
      "download": {
        "label": "Add to %{browser}"
      }
    },
    "desktop": {
      "title": "%{wallet} for %{platform}",
      "description": "Access your wallet natively from your powerful desktop.",
      "download": {
        "label": "Add to %{platform}"
      }
    }
  },

  "get_mobile": {
    "title": "Install %{wallet}",
    "description": "Scan with your phone to download on iOS or Android",
    "continue": {
      "label": "Continue"
    }
  },

  "get_instructions": {
    "mobile": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "extension": {
      "refresh": {
        "label": "Refresh"
      },
      "learn_more": {
        "label": "Learn More"
      }
    },
    "desktop": {
      "connect": {
        "label": "Connect"
      },
      "learn_more": {
        "label": "Learn More"
      }
    }
  },

  "chains": {
    "title": "Switch Networks",
    "wrong_network": "Wrong network detected, switch or disconnect to continue.",
    "confirm": "Confirm in Wallet",
    "switching_not_supported": "Your wallet does not support switching networks from %{appName}. Try switching networks from within your wallet instead.",
    "switching_not_supported_fallback": "Your wallet does not support switching networks from this app. Try switching networks from within your wallet instead.",
    "disconnect": "Disconnect",
    "connected": "Connected"
  },

  "profile": {
    "disconnect": {
      "label": "Disconnect"
    },
    "copy_address": {
      "label": "Copy Address",
      "copied": "Copied!"
    },
    "explorer": {
      "label": "View more on explorer"
    },
    "transactions": {
      "description": "%{appName} transactions will appear here...",
      "description_fallback": "Your transactions will appear here...",
      "recent": {
        "title": "Recent Transactions"
      },
      "clear": {
        "label": "Clear All"
      }
    }
  },

  "wallet_connectors": {
    "ready": {
      "qr_code": {
        "step1": {
          "description": "Add Ready to your home screen for faster access to your wallet.",
          "title": "Open the Ready app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "berasig": {
      "extension": {
        "step1": {
          "title": "Install the BeraSig extension",
          "description": "We recommend pinning BeraSig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "best": {
      "qr_code": {
        "step1": {
          "title": "Open the Best Wallet app",
          "description": "Add Best Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bifrost": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bifrost Wallet on your home screen for quicker access.",
          "title": "Open the Bifrost Wallet app"
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "bitget": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bitget Wallet on your home screen for quicker access.",
          "title": "Open the Bitget Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Bitget Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitget Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitski": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Bitski to your taskbar for quicker access to your wallet.",
          "title": "Install the Bitski extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "bitverse": {
      "qr_code": {
        "step1": {
          "title": "Open the Bitverse Wallet app",
          "description": "Add Bitverse Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "bloom": {
      "desktop": {
        "step1": {
          "title": "Open the Bloom Wallet app",
          "description": "We recommend putting Bloom Wallet on your home screen for quicker access."
        },
        "step2": {
          "description": "Create or import a wallet using your recovery phrase.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you have a wallet, click on Connect to connect via Bloom. A connection prompt in the app will appear for you to confirm the connection.",
          "title": "Click on Connect"
        }
      }
    },

    "bybit": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Bybit on your home screen for faster access to your wallet.",
          "title": "Open the Bybit app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Bybit Wallet for easy access.",
          "title": "Install the Bybit Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Bybit Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "binance": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Binance on your home screen for faster access to your wallet.",
          "title": "Open the Binance app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Binance Wallet extension",
          "description": "We recommend pinning Binance Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "coin98": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coin98 Wallet on your home screen for faster access to your wallet.",
          "title": "Open the Coin98 Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "Click at the top right of your browser and pin Coin98 Wallet for easy access.",
          "title": "Install the Coin98 Wallet extension"
        },
        "step2": {
          "description": "Create a new wallet or import an existing one.",
          "title": "Create or Import a wallet"
        },
        "step3": {
          "description": "Once you set up Coin98 Wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "coinbase": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Coinbase Wallet on your home screen for quicker access.",
          "title": "Open the Coinbase Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Coinbase Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Coinbase Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "compass": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Compass Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Compass Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "core": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Core on your home screen for faster access to your wallet.",
          "title": "Open the Core app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Core to your taskbar for quicker access to your wallet.",
          "title": "Install the Core extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "fox": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting FoxWallet on your home screen for quicker access.",
          "title": "Open the FoxWallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "frontier": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Frontier Wallet on your home screen for quicker access.",
          "title": "Open the Frontier Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Frontier Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Frontier Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "im_token": {
      "qr_code": {
        "step1": {
          "title": "Open the imToken app",
          "description": "Put imToken app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "iopay": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting ioPay on your home screen for faster access to your wallet.",
          "title": "Open the ioPay app"
        },
        "step2": {
          "description": "You can easily backup your wallet using our backup feature on your phone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the WalletConnect button"
        }
      }
    },

    "kaikas": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaikas to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaikas extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaikas app",
          "description": "Put Kaikas app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kaia": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Kaia to your taskbar for quicker access to your wallet.",
          "title": "Install the Kaia extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Kaia app",
          "description": "Put Kaia app on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap Scanner Icon in top right corner",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "kraken": {
      "qr_code": {
        "step1": {
          "title": "Open the Kraken Wallet app",
          "description": "Add Kraken Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "kresus": {
      "qr_code": {
        "step1": {
          "title": "Open the Kresus Wallet app",
          "description": "Add Kresus Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "magicEden": {
      "extension": {
        "step1": {
          "title": "Install the Magic Eden extension",
          "description": "We recommend pinning Magic Eden to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "metamask": {
      "qr_code": {
        "step1": {
          "title": "Open the MetaMask app",
          "description": "We recommend putting MetaMask on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the MetaMask extension",
          "description": "We recommend pinning MetaMask to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "nestwallet": {
      "extension": {
        "step1": {
          "title": "Install the NestWallet extension",
          "description": "We recommend pinning NestWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "okx": {
      "qr_code": {
        "step1": {
          "title": "Open the OKX Wallet app",
          "description": "We recommend putting OKX Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the OKX Wallet extension",
          "description": "We recommend pinning OKX Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "omni": {
      "qr_code": {
        "step1": {
          "title": "Open the Omni app",
          "description": "Add Omni to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your home screen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "1inch": {
      "qr_code": {
        "step1": {
          "description": "Put 1inch Wallet on your home screen for faster access to your wallet.",
          "title": "Open the 1inch Wallet app"
        },
        "step2": {
          "description": "Create a wallet and username, or import an existing wallet.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "token_pocket": {
      "qr_code": {
        "step1": {
          "title": "Open the TokenPocket app",
          "description": "We recommend putting TokenPocket on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the TokenPocket extension",
          "description": "We recommend pinning TokenPocket to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "trust": {
      "qr_code": {
        "step1": {
          "title": "Open the Trust Wallet app",
          "description": "Put Trust Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Trust Wallet extension",
          "description": "Click at the top right of your browser and pin Trust Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up Trust Wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "uniswap": {
      "qr_code": {
        "step1": {
          "title": "Open the Uniswap app",
          "description": "Add Uniswap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "zerion": {
      "qr_code": {
        "step1": {
          "title": "Open the Zerion app",
          "description": "We recommend putting Zerion on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },

      "extension": {
        "step1": {
          "title": "Install the Zerion extension",
          "description": "We recommend pinning Zerion to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rainbow": {
      "qr_code": {
        "step1": {
          "title": "Open the Rainbow app",
          "description": "We recommend putting Rainbow on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "You can easily backup your wallet using our backup feature on your phone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "enkrypt": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Enkrypt Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Enkrypt Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "frame": {
      "extension": {
        "step1": {
          "description": "We recommend pinning Frame to your taskbar for quicker access to your wallet.",
          "title": "Install Frame & the companion extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "one_key": {
      "extension": {
        "step1": {
          "title": "Install the OneKey Wallet extension",
          "description": "We recommend pinning OneKey Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "paraswap": {
      "qr_code": {
        "step1": {
          "title": "Open the ParaSwap app",
          "description": "Add ParaSwap Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      }
    },

    "phantom": {
      "extension": {
        "step1": {
          "title": "Install the Phantom extension",
          "description": "We recommend pinning Phantom to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "rabby": {
      "extension": {
        "step1": {
          "title": "Install the Rabby extension",
          "description": "We recommend pinning Rabby to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ronin": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting Ronin Wallet on your home screen for quicker access.",
          "title": "Open the Ronin Wallet app"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      },

      "extension": {
        "step1": {
          "description": "We recommend pinning Ronin Wallet to your taskbar for quicker access to your wallet.",
          "title": "Install the Ronin Wallet extension"
        },
        "step2": {
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension.",
          "title": "Refresh your browser"
        }
      }
    },

    "ramper": {
      "extension": {
        "step1": {
          "title": "Install the Ramper extension",
          "description": "We recommend pinning Ramper to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safeheron": {
      "extension": {
        "step1": {
          "title": "Install the Core extension",
          "description": "We recommend pinning Safeheron to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "taho": {
      "extension": {
        "step1": {
          "title": "Install the Taho extension",
          "description": "We recommend pinning Taho to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "wigwam": {
      "extension": {
        "step1": {
          "title": "Install the Wigwam extension",
          "description": "We recommend pinning Wigwam to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "talisman": {
      "extension": {
        "step1": {
          "title": "Install the Talisman extension",
          "description": "We recommend pinning Talisman to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import an Ethereum Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "ctrl": {
      "extension": {
        "step1": {
          "title": "Install the CTRL Wallet extension",
          "description": "We recommend pinning CTRL Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "zeal": {
      "qr_code": {
        "step1": {
          "title": "Open the Zeal app",
          "description": "Add Zeal Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the QR icon and scan",
          "description": "Tap the QR icon on your homescreen, scan the code and confirm the prompt to connect."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Zeal extension",
          "description": "We recommend pinning Zeal to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "safepal": {
      "extension": {
        "step1": {
          "title": "Install the SafePal Wallet extension",
          "description": "Click at the top right of your browser and pin SafePal Wallet for easy access."
        },
        "step2": {
          "title": "Create or Import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up SafePal Wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SafePal Wallet app",
          "description": "Put SafePal Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Choose New Connection, then scan the QR code and confirm the prompt to connect."
        }
      }
    },

    "desig": {
      "extension": {
        "step1": {
          "title": "Install the Desig extension",
          "description": "We recommend pinning Desig to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "subwallet": {
      "extension": {
        "step1": {
          "title": "Install the SubWallet extension",
          "description": "We recommend pinning SubWallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the SubWallet app",
          "description": "We recommend putting SubWallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "clv": {
      "extension": {
        "step1": {
          "title": "Install the CLV Wallet extension",
          "description": "We recommend pinning CLV Wallet to your taskbar for quicker access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the CLV Wallet app",
          "description": "We recommend putting CLV Wallet on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "okto": {
      "qr_code": {
        "step1": {
          "title": "Open the Okto app",
          "description": "Add Okto to your home screen for quick access"
        },
        "step2": {
          "title": "Create an MPC Wallet",
          "description": "Create an account and generate a wallet"
        },
        "step3": {
          "title": "Tap WalletConnect in Settings",
          "description": "Tap the Scan QR icon at the top right and confirm the prompt to connect."
        }
      }
    },

    "ledger": {
      "desktop": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "Set up a new Ledger or connect to an existing one."
        },
        "step3": {
          "title": "Connect",
          "description": "A connection prompt will appear for you to connect your wallet."
        }
      },
      "qr_code": {
        "step1": {
          "title": "Open the Ledger Live app",
          "description": "We recommend putting Ledger Live on your home screen for quicker access."
        },
        "step2": {
          "title": "Set up your Ledger",
          "description": "You can either sync with the desktop app or connect your Ledger."
        },
        "step3": {
          "title": "Scan the code",
          "description": "Tap WalletConnect then Switch to Scanner. After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "valora": {
      "qr_code": {
        "step1": {
          "title": "Open the Valora app",
          "description": "We recommend putting Valora on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or import a wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "gate": {
      "qr_code": {
        "step1": {
          "title": "Open the Gate app",
          "description": "We recommend putting Gate on your home screen for quicker access."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      },
      "extension": {
        "step1": {
          "title": "Install the Gate extension",
          "description": "We recommend pinning Gate to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Be sure to back up your wallet using a secure method. Never share your secret recovery phrase with anyone."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you set up your wallet, click below to refresh the browser and load up the extension."
        }
      }
    },

    "gemini": {
      "qr_code": {
        "step1": {
          "title": "Open keys.gemini.com",
          "description": "Visit keys.gemini.com on your mobile browser - no app download required."
        },
        "step2": {
          "title": "Create Your Wallet Instantly",
          "description": "Set up your smart wallet in seconds using your device's built-in authentication."
        },
        "step3": {
          "title": "Scan to Connect",
          "description": "Scan the QR code to instantly connect your wallet - it just works."
        }
      },
      "extension": {
        "step1": {
          "title": "Go to keys.gemini.com",
          "description": "No extensions or downloads needed - your wallet lives securely in the browser."
        },
        "step2": {
          "title": "One-Click Setup",
          "description": "Create your smart wallet instantly with passkey authentication - easier than any wallet out there."
        },
        "step3": {
          "title": "Connect and Go",
          "description": "Approve the connection and you're ready - the unopinionated wallet that just works."
        }
      }
    },

    "xportal": {
      "qr_code": {
        "step1": {
          "description": "Put xPortal on your home screen for faster access to your wallet.",
          "title": "Open the xPortal app"
        },
        "step2": {
          "description": "Create a wallet or import an existing one.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the Scan QR button"
        }
      }
    },

    "mew": {
      "qr_code": {
        "step1": {
          "description": "We recommend putting MEW Wallet on your home screen for quicker access.",
          "title": "Open the MEW Wallet app"
        },
        "step2": {
          "description": "You can easily backup your wallet using the cloud backup feature.",
          "title": "Create or Import a Wallet"
        },
        "step3": {
          "description": "After you scan, a connection prompt will appear for you to connect your wallet.",
          "title": "Tap the scan button"
        }
      }
    },

    "zilpay": {
      "qr_code": {
        "step1": {
          "title": "Open the ZilPay app",
          "description": "Add ZilPay to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "nova": {
      "qr_code": {
        "step1": {
          "title": "Open the Nova Wallet app",
          "description": "Add Nova Wallet to your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "meco": {
      "qr_code": {
        "step1": {
          "title": "Open the MeCo Wallet app",
          "description": "Put MeCo Wallet on your home screen for faster access to your wallet."
        },
        "step2": {
          "title": "Create or Import a Wallet",
          "description": "Create a new wallet or import an existing one."
        },
        "step3": {
          "title": "Tap the scan button",
          "description": "After you scan, a connection prompt will appear for you to connect your wallet."
        }
      }
    },

    "anchorage_digital": {
      "extension": {
        "step1": {
          "title": "Install the Anchorage Digital extension",
          "description": "We recommend pinning Anchorage Digital to your taskbar for easier access to your wallet."
        },
        "step2": {
          "title": "Scan the QR code to login",
          "description": "Securely connect your organization's wallets to dApps with institutional-grade security."
        },
        "step3": {
          "title": "Refresh your browser",
          "description": "Once you log in, click below to refresh the browser and load up the extension."
        }
      }
    }
  }
}
`;e.s(["en_US_default",0,t])},954616,114272,e=>{"use strict";var t=e.i(271645),r=e.i(540143),o=e.i(88587),n=e.i(936553),s=class extends o.Removable{#p;#N;#D;#h;constructor(e){super(),this.#p=e.client,this.mutationId=e.mutationId,this.#D=e.mutationCache,this.#N=[],this.state=e.state||i(),this.setOptions(e.options),this.scheduleGc()}setOptions(e){this.options=e,this.updateGcTime(this.options.gcTime)}get meta(){return this.options.meta}addObserver(e){this.#N.includes(e)||(this.#N.push(e),this.clearGcTimeout(),this.#D.notify({type:"observerAdded",mutation:this,observer:e}))}removeObserver(e){this.#N=this.#N.filter(t=>t!==e),this.scheduleGc(),this.#D.notify({type:"observerRemoved",mutation:this,observer:e})}optionalRemove(){this.#N.length||("pending"===this.state.status?this.scheduleGc():this.#D.remove(this))}continue(){return this.#h?.continue()??this.execute(this.state.variables)}async execute(e){let t=()=>{this.#f({type:"continue"})},r={client:this.#p,meta:this.options.meta,mutationKey:this.options.mutationKey};this.#h=(0,n.createRetryer)({fn:()=>this.options.mutationFn?this.options.mutationFn(e,r):Promise.reject(Error("No mutationFn found")),onFail:(e,t)=>{this.#f({type:"failed",failureCount:e,error:t})},onPause:()=>{this.#f({type:"pause"})},onContinue:t,retry:this.options.retry??0,retryDelay:this.options.retryDelay,networkMode:this.options.networkMode,canRun:()=>this.#D.canRun(this)});let o="pending"===this.state.status,s=!this.#h.canStart();try{if(o)t();else{this.#f({type:"pending",variables:e,isPaused:s}),this.#D.config.onMutate&&await this.#D.config.onMutate(e,this,r);let t=await this.options.onMutate?.(e,r);t!==this.state.context&&this.#f({type:"pending",context:t,variables:e,isPaused:s})}let n=await this.#h.start();return await this.#D.config.onSuccess?.(n,e,this.state.context,this,r),await this.options.onSuccess?.(n,e,this.state.context,r),await this.#D.config.onSettled?.(n,null,this.state.variables,this.state.context,this,r),await this.options.onSettled?.(n,null,e,this.state.context,r),this.#f({type:"success",data:n}),n}catch(t){try{await this.#D.config.onError?.(t,e,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onError?.(t,e,this.state.context,r)}catch(e){Promise.reject(e)}try{await this.#D.config.onSettled?.(void 0,t,this.state.variables,this.state.context,this,r)}catch(e){Promise.reject(e)}try{await this.options.onSettled?.(void 0,t,e,this.state.context,r)}catch(e){Promise.reject(e)}throw this.#f({type:"error",error:t}),t}finally{this.#D.runNext(this)}}#f(e){this.state=(t=>{switch(e.type){case"failed":return{...t,failureCount:e.failureCount,failureReason:e.error};case"pause":return{...t,isPaused:!0};case"continue":return{...t,isPaused:!1};case"pending":return{...t,context:e.context,data:void 0,failureCount:0,failureReason:null,error:null,isPaused:e.isPaused,status:"pending",variables:e.variables,submittedAt:Date.now()};case"success":return{...t,data:e.data,failureCount:0,failureReason:null,error:null,status:"success",isPaused:!1};case"error":return{...t,data:void 0,error:e.error,failureCount:t.failureCount+1,failureReason:e.error,isPaused:!1,status:"error"}}})(this.state),r.notifyManager.batch(()=>{this.#N.forEach(t=>{t.onMutationUpdate(e)}),this.#D.notify({mutation:this,type:"updated",action:e})})}};function i(){return{context:void 0,data:void 0,error:null,failureCount:0,failureReason:null,isPaused:!1,status:"idle",variables:void 0,submittedAt:0}}e.s(["Mutation",0,s,"getDefaultState",0,i],114272);var a=e.i(915823),c=e.i(619273),l=class extends a.Subscribable{#p;#k=void 0;#L;#U;constructor(e,t){super(),this.#p=e,this.setOptions(t),this.bindMethods(),this.#K()}bindMethods(){this.mutate=this.mutate.bind(this),this.reset=this.reset.bind(this)}setOptions(e){let t=this.options;this.options=this.#p.defaultMutationOptions(e),(0,c.shallowEqualObjects)(this.options,t)||this.#p.getMutationCache().notify({type:"observerOptionsUpdated",mutation:this.#L,observer:this}),t?.mutationKey&&this.options.mutationKey&&(0,c.hashKey)(t.mutationKey)!==(0,c.hashKey)(this.options.mutationKey)?this.reset():this.#L?.state.status==="pending"&&this.#L.setOptions(this.options)}onUnsubscribe(){this.hasListeners()||this.#L?.removeObserver(this)}onMutationUpdate(e){this.#K(),this.#j(e)}getCurrentResult(){return this.#k}reset(){this.#L?.removeObserver(this),this.#L=void 0,this.#K(),this.#j()}mutate(e,t){return this.#U=t,this.#L?.removeObserver(this),this.#L=this.#p.getMutationCache().build(this.#p,this.options),this.#L.addObserver(this),this.#L.execute(e)}#K(){let e=this.#L?.state??i();this.#k={...e,isPending:"pending"===e.status,isSuccess:"success"===e.status,isError:"error"===e.status,isIdle:"idle"===e.status,mutate:this.mutate,reset:this.reset}}#j(e){r.notifyManager.batch(()=>{if(this.#U&&this.hasListeners()){let t=this.#k.variables,r=this.#k.context,o={client:this.#p,meta:this.options.meta,mutationKey:this.options.mutationKey};if(e?.type==="success"){try{this.#U.onSuccess?.(e.data,t,r,o)}catch(e){Promise.reject(e)}try{this.#U.onSettled?.(e.data,null,t,r,o)}catch(e){Promise.reject(e)}}else if(e?.type==="error"){try{this.#U.onError?.(e.error,t,r,o)}catch(e){Promise.reject(e)}try{this.#U.onSettled?.(void 0,e.error,t,r,o)}catch(e){Promise.reject(e)}}}this.listeners.forEach(e=>{e(this.#k)})})}},u=e.i(912598);e.s(["useMutation",0,function(e,o){let n=(0,u.useQueryClient)(o),[s]=t.useState(()=>new l(n,e));t.useEffect(()=>{s.setOptions(e)},[s,e]);let i=t.useSyncExternalStore(t.useCallback(e=>s.subscribe(r.notifyManager.batchCalls(e)),[s]),()=>s.getCurrentResult(),()=>s.getCurrentResult()),a=t.useCallback((e,t)=>{s.mutate(e,t).catch(c.noop)},[s]);if(i.error&&(0,c.shouldThrowError)(s.options.throwOnError,[i.error]))throw i.error;return{...i,mutate:a,mutateAsync:i.mutate}}],954616)},574983,e=>{"use strict";var t=e.i(271645);let r=!1;async function o(e,t={}){let n;if(r)return[];r=!0,e.setState(e=>({...e,status:e.current?"reconnecting":"connecting"}));let s=[];if(t.connectors?.length)for(let r of t.connectors){let t;t="function"==typeof r?e._internal.connectors.setup(r):r,s.push(t)}else s.push(...e.connectors);try{n=await e.storage?.getItem("recentConnectorId")}catch{}let i={};for(let[,t]of e.state.connections)i[t.connector.id]=1;n&&(i[n]=0);let a=Object.keys(i).length>0?[...s].sort((e,t)=>(i[e.id]??10)-(i[t.id]??10)):s,c=!1,l=[],u=[];for(let t of a){let r=await t.getProvider().catch(()=>void 0);if(!r||u.some(e=>e===r)||!await t.isAuthorized())continue;let o=await t.connect({isReconnecting:!0}).catch(()=>null);o&&(t.emitter.off("connect",e._internal.events.connect),t.emitter.on("change",e._internal.events.change),t.emitter.on("disconnect",e._internal.events.disconnect),e.setState(e=>{let r=new Map(c?e.connections:new Map).set(t.uid,{accounts:o.accounts,chainId:o.chainId,connector:t});return{...e,current:c?e.current:t.uid,connections:r}}),l.push({accounts:o.accounts,chainId:o.chainId,connector:t}),u.push(r),c=!0)}return("reconnecting"===e.state.status||"connecting"===e.state.status)&&(c?e.setState(e=>({...e,status:"connected"})):e.setState(e=>({...e,connections:new Map,current:null,status:"disconnected"}))),r=!1,l}function n(e){let{children:r,config:n,initialState:s,reconnectOnMount:i=!0}=e,{onMount:a}=function(e,t){let{initialState:r,reconnectOnMount:n}=t;return r&&!e._internal.store.persist.hasHydrated()&&e.setState({...r,chainId:e.chains.some(e=>e.id===r.chainId)?r.chainId:e.chains[0].id,connections:n?r.connections:new Map,status:n?"reconnecting":"disconnected"}),{async onMount(){e._internal.ssr&&(await e._internal.store.persist.rehydrate(),e._internal.mipd&&e._internal.connectors.setState(t=>{let r=new Set;for(let e of t??[])if(e.rdns)for(let t of Array.isArray(e.rdns)?e.rdns:[e.rdns])r.add(t);let o=[];for(let t of e._internal.mipd?.getProviders()??[]){if(r.has(t.info.rdns))continue;let n=e._internal.connectors.providerDetailToConnector(t),s=e._internal.connectors.setup(n);o.push(s)}return[...t,...o]})),n?o(e):e.storage&&e.setState(e=>({...e,connections:new Map}))}}}(n,{initialState:s,reconnectOnMount:i});n._internal.ssr||a();let c=(0,t.useRef)(!0);return(0,t.useEffect)(()=>{if(c.current&&n._internal.ssr)return a(),()=>{c.current=!1}},[]),r}let s=(0,t.createContext)(void 0);e.s(["WagmiContext",0,s,"WagmiProvider",0,function(e){let{children:r,config:o}=e;return(0,t.createElement)(n,e,(0,t.createElement)(s.Provider,{value:o},r))}],574983)},828646,365087,909744,e=>{"use strict";function t(e){let t=e.state.current,r=e.state.connections.get(t),o=r?.accounts,n=o?.[0],s=e.chains.find(e=>e.id===r?.chainId),i=e.state.status;switch(i){case"connected":return{address:n,addresses:o,chain:s,chainId:r?.chainId,connector:r?.connector,isConnected:!0,isConnecting:!1,isDisconnected:!1,isReconnecting:!1,status:i};case"reconnecting":return{address:n,addresses:o,chain:s,chainId:r?.chainId,connector:r?.connector,isConnected:!!n,isConnecting:!1,isDisconnected:!1,isReconnecting:!0,status:i};case"connecting":return{address:n,addresses:o,chain:s,chainId:r?.chainId,connector:r?.connector,isConnected:!1,isConnecting:!0,isDisconnected:!1,isReconnecting:!1,status:i};case"disconnected":return{address:void 0,addresses:void 0,chain:void 0,chainId:void 0,connector:void 0,isConnected:!1,isConnecting:!1,isDisconnected:!0,isReconnecting:!1,status:i}}}function r(e,t){if(e===t)return!0;if(e&&t&&"object"==typeof e&&"object"==typeof t){let o,n;if(e.constructor!==t.constructor)return!1;if(Array.isArray(e)&&Array.isArray(t)){if((o=e.length)!==t.length)return!1;for(n=o;0!=n--;)if(!r(e[n],t[n]))return!1;return!0}if("function"==typeof e.valueOf&&e.valueOf!==Object.prototype.valueOf)return e.valueOf()===t.valueOf();if("function"==typeof e.toString&&e.toString!==Object.prototype.toString)return e.toString()===t.toString();let s=Object.keys(e);if((o=s.length)!==Object.keys(t).length)return!1;for(n=o;0!=n--;)if(!Object.hasOwn(t,s[n]))return!1;for(n=o;0!=n--;){let o=s[n];if(o&&!r(e[o],t[o]))return!1}return!0}return e!=e&&t!=t}e.s(["getAccount",0,t],828646),e.s(["deepEqual",0,r],365087),e.s(["watchAccount",0,function(e,o){let{onChange:n}=o;return e.subscribe(()=>t(e),n,{equalityFn(e,t){let{connector:o,...n}=e,{connector:s,...i}=t;return r(n,i)&&o?.id===s?.id&&o?.uid===s?.uid}})}],909744)},755838,(e,t,r)=>{"use strict";var o=e.r(271645),n="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},s=o.useState,i=o.useEffect,a=o.useLayoutEffect,c=o.useDebugValue;function l(e){var t=e.getSnapshot;e=e.value;try{var r=t();return!n(e,r)}catch(e){return!0}}var u="u"<typeof window||void 0===window.document||void 0===window.document.createElement?function(e,t){return t()}:function(e,t){var r=t(),o=s({inst:{value:r,getSnapshot:t}}),n=o[0].inst,u=o[1];return a(function(){n.value=r,n.getSnapshot=t,l(n)&&u({inst:n})},[e,r,t]),i(function(){return l(n)&&u({inst:n}),e(function(){l(n)&&u({inst:n})})},[e]),c(r),r};r.useSyncExternalStore=void 0!==o.useSyncExternalStore?o.useSyncExternalStore:u},802239,(e,t,r)=>{"use strict";t.exports=e.r(755838)},752822,(e,t,r)=>{"use strict";var o=e.r(271645),n=e.r(802239),s="function"==typeof Object.is?Object.is:function(e,t){return e===t&&(0!==e||1/e==1/t)||e!=e&&t!=t},i=n.useSyncExternalStore,a=o.useRef,c=o.useEffect,l=o.useMemo,u=o.useDebugValue;r.useSyncExternalStoreWithSelector=function(e,t,r,o,n){var p=a(null);if(null===p.current){var h={hasValue:!1,value:null};p.current=h}else h=p.current;var d=i(e,(p=l(function(){function e(e){if(!c){if(c=!0,i=e,e=o(e),void 0!==n&&h.hasValue){var t=h.value;if(n(t,e))return a=t}return a=e}if(t=a,s(i,e))return t;var r=o(e);return void 0!==n&&n(t,r)?(i=e,t):(i=e,a=r)}var i,a,c=!1,l=void 0===r?null:r;return[function(){return e(t())},null===l?void 0:function(){return e(l())}]},[t,r,o,n]))[0],p[1]);return c(function(){h.hasValue=!0,h.value=d},[d]),u(d),d}},430224,(e,t,r)=>{"use strict";t.exports=e.r(752822)},982615,296247,191346,210920,e=>{"use strict";var t,r,o=e.i(828646),n=e.i(909744),s=e.i(271645),i=e.i(574983);let a="2.22.1";e.s(["version",0,a],296247);var c=function(e,t,r,o){if("a"===r&&!o)throw TypeError("Private accessor was defined without a getter");if("function"==typeof t?e!==t||!o:!t.has(e))throw TypeError("Cannot read private member from an object whose class did not declare it");return"m"===r?o:"a"===r?o.call(e):o?o.value:t.get(e)};class l extends Error{get docsBaseUrl(){return"https://wagmi.sh/core"}get version(){return`@wagmi/core@${a}`}constructor(e,r={}){super(),t.add(this),Object.defineProperty(this,"details",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"docsPath",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"metaMessages",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"shortMessage",{enumerable:!0,configurable:!0,writable:!0,value:void 0}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiCoreError"});const o=r.cause instanceof l?r.cause.details:r.cause?.message?r.cause.message:r.details,n=r.cause instanceof l&&r.cause.docsPath||r.docsPath;this.message=[e||"An error occurred.","",...r.metaMessages?[...r.metaMessages,""]:[],...n?[`Docs: ${this.docsBaseUrl}${n}.html${r.docsSlug?`#${r.docsSlug}`:""}`]:[],...o?[`Details: ${o}`]:[],`Version: ${this.version}`].join("\n"),r.cause&&(this.cause=r.cause),this.details=o,this.docsPath=n,this.metaMessages=r.metaMessages,this.shortMessage=e}walk(e){return c(this,t,"m",r).call(this,this,e)}}t=new WeakSet,r=function e(r,o){return o?.(r)?r:r.cause?c(this,t,"m",e).call(this,r.cause,o):r},e.s(["BaseError",0,l],191346);class u extends l{constructor(){super(...arguments),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiError"})}get docsBaseUrl(){return"https://wagmi.sh/react"}get version(){return"wagmi@2.19.5"}}class p extends u{constructor(){super("`useConfig` must be used within `WagmiProvider`.",{docsPath:"/api/WagmiProvider"}),Object.defineProperty(this,"name",{enumerable:!0,configurable:!0,writable:!0,value:"WagmiProviderNotFoundError"})}}function h(e={}){let t=e.config??(0,s.useContext)(i.WagmiContext);if(!t)throw new p;return t}e.s(["useConfig",0,h],210920);var d=e.i(365087),y=e.i(430224);let f=e=>"object"==typeof e&&!Array.isArray(e);e.s(["useAccount",0,function(e={}){let t=h(e);return function(e,t,r=t,o=d.deepEqual){let n=(0,s.useRef)([]),i=(0,y.useSyncExternalStoreWithSelector)(e,t,r,e=>e,(e,t)=>{if(f(e)&&f(t)&&n.current.length){for(let r of n.current)if(!o(e[r],t[r]))return!1;return!0}return o(e,t)});return(0,s.useMemo)(()=>{if(f(i)){let e={...i},t={};for(let[r,o]of Object.entries(e))t={...t,[r]:{configurable:!1,enumerable:!0,get:()=>(n.current.includes(r)||n.current.push(r),o)}};return Object.defineProperties(e,t),e}return i},[i])}(e=>(0,n.watchAccount)(t,{onChange:e}),()=>(0,o.getAccount)(t))}],982615)}]);