#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var Ld=Object.create;var Ls=Object.defineProperty;var Rd=Object.getOwnPropertyDescriptor;var Od=Object.getOwnPropertyNames;var xd=Object.getPrototypeOf,Id=Object.prototype.hasOwnProperty;var Gt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var k=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Cd=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Od(e))!Id.call(n,i)&&i!==t&&Ls(n,i,{get:()=>e[i],enumerable:!(r=Rd(e,i))||r.enumerable});return n};var Vt=(n,e,t)=>(t=n!=null?Ld(xd(n)):{},Cd(e||!n||!n.__esModule?Ls(t,"default",{value:n,enumerable:!0}):t,n));var C=k(J=>{"use strict";var Tr=Symbol.for("yaml.alias"),Vs=Symbol.for("yaml.document"),tn=Symbol.for("yaml.map"),Js=Symbol.for("yaml.pair"),_r=Symbol.for("yaml.scalar"),nn=Symbol.for("yaml.seq"),he=Symbol.for("yaml.node.type"),pu=n=>!!n&&typeof n=="object"&&n[he]===Tr,mu=n=>!!n&&typeof n=="object"&&n[he]===Vs,hu=n=>!!n&&typeof n=="object"&&n[he]===tn,gu=n=>!!n&&typeof n=="object"&&n[he]===Js,Hs=n=>!!n&&typeof n=="object"&&n[he]===_r,yu=n=>!!n&&typeof n=="object"&&n[he]===nn;function Ws(n){if(n&&typeof n=="object")switch(n[he]){case tn:case nn:return!0}return!1}function bu(n){if(n&&typeof n=="object")switch(n[he]){case Tr:case tn:case _r:case nn:return!0}return!1}var Eu=n=>(Hs(n)||Ws(n))&&!!n.anchor;J.ALIAS=Tr;J.DOC=Vs;J.MAP=tn;J.NODE_TYPE=he;J.PAIR=Js;J.SCALAR=_r;J.SEQ=nn;J.hasAnchor=Eu;J.isAlias=pu;J.isCollection=Ws;J.isDocument=mu;J.isMap=hu;J.isNode=bu;J.isPair=gu;J.isScalar=Hs;J.isSeq=yu});var lt=k(Nr=>{"use strict";var X=C(),te=Symbol("break visit"),Zs=Symbol("skip children"),ue=Symbol("remove node");function rn(n,e){let t=Qs(e);X.isDocument(n)?ze(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):ze(null,n,t,Object.freeze([]))}rn.BREAK=te;rn.SKIP=Zs;rn.REMOVE=ue;function ze(n,e,t,r){let i=eo(n,e,t,r);if(X.isNode(i)||X.isPair(i))return to(n,r,i),ze(n,i,t,r);if(typeof i!="symbol"){if(X.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=ze(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===te)return te;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(X.isPair(e)){r=Object.freeze(r.concat(e));let s=ze("key",e.key,t,r);if(s===te)return te;s===ue&&(e.key=null);let o=ze("value",e.value,t,r);if(o===te)return te;o===ue&&(e.value=null)}}return i}async function sn(n,e){let t=Qs(e);X.isDocument(n)?await Ye(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):await Ye(null,n,t,Object.freeze([]))}sn.BREAK=te;sn.SKIP=Zs;sn.REMOVE=ue;async function Ye(n,e,t,r){let i=await eo(n,e,t,r);if(X.isNode(i)||X.isPair(i))return to(n,r,i),Ye(n,i,t,r);if(typeof i!="symbol"){if(X.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=await Ye(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===te)return te;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(X.isPair(e)){r=Object.freeze(r.concat(e));let s=await Ye("key",e.key,t,r);if(s===te)return te;s===ue&&(e.key=null);let o=await Ye("value",e.value,t,r);if(o===te)return te;o===ue&&(e.value=null)}}return i}function Qs(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function eo(n,e,t,r){if(typeof t=="function")return t(n,e,r);if(X.isMap(e))return t.Map?.(n,e,r);if(X.isSeq(e))return t.Seq?.(n,e,r);if(X.isPair(e))return t.Pair?.(n,e,r);if(X.isScalar(e))return t.Scalar?.(n,e,r);if(X.isAlias(e))return t.Alias?.(n,e,r)}function to(n,e,t){let r=e[e.length-1];if(X.isCollection(r))r.items[n]=t;else if(X.isPair(r))n==="key"?r.key=t:r.value=t;else if(X.isDocument(r))r.contents=t;else{let i=X.isAlias(r)?"alias":"scalar";throw new Error(`Cannot replace node with ${i} parent`)}}Nr.visit=rn;Nr.visitAsync=sn});var Sr=k(ro=>{"use strict";var no=C(),Tu=lt(),_u={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Nu=n=>n.replace(/[!,[\]{}]/g,e=>_u[e]),dt=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let r=e.trim().split(/[ \t]+/),i=r.shift();switch(i){case"%TAG":{if(r.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),r.length<2))return!1;let[s,o]=r;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,r.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=r;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${i}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,r,i]=e.match(/^(.*!)([^!]*)$/s);i||t(`The ${e} tag has no suffix`);let s=this.tags[r];if(s)try{return s+decodeURIComponent(i)}catch(o){return t(String(o)),null}return r==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,r]of Object.entries(this.tags))if(e.startsWith(r))return t+Nu(e.substring(r.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],r=Object.entries(this.tags),i;if(e&&r.length>0&&no.isNode(e.contents)){let s={};Tu.visit(e.contents,(o,a)=>{no.isNode(a)&&a.tag&&(s[a.tag]=!0)}),i=Object.keys(s)}else i=[];for(let[s,o]of r)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||i.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};dt.defaultYaml={explicit:!1,version:"1.2"};dt.defaultTags={"!!":"tag:yaml.org,2002:"};ro.Directives=dt});var on=k(ut=>{"use strict";var io=C(),Su=lt();function wu(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function so(n){let e=new Set;return Su.visit(n,{Value(t,r){r.anchor&&e.add(r.anchor)}}),e}function oo(n,e){for(let t=1;;++t){let r=`${n}${t}`;if(!e.has(r))return r}}function vu(n,e){let t=[],r=new Map,i=null;return{onAnchor:s=>{t.push(s),i??(i=so(n));let o=oo(e,i);return i.add(o),o},setAnchors:()=>{for(let s of t){let o=r.get(s);if(typeof o=="object"&&o.anchor&&(io.isScalar(o.node)||io.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:r}}ut.anchorIsValid=wu;ut.anchorNames=so;ut.createNodeAnchors=vu;ut.findNewAnchor=oo});var wr=k(ao=>{"use strict";function ft(n,e,t,r){if(r&&typeof r=="object")if(Array.isArray(r))for(let i=0,s=r.length;i<s;++i){let o=r[i],a=ft(n,r,String(i),o);a===void 0?delete r[i]:a!==o&&(r[i]=a)}else if(r instanceof Map)for(let i of Array.from(r.keys())){let s=r.get(i),o=ft(n,r,i,s);o===void 0?r.delete(i):o!==s&&r.set(i,o)}else if(r instanceof Set)for(let i of Array.from(r)){let s=ft(n,r,i,i);s===void 0?r.delete(i):s!==i&&(r.delete(i),r.add(s))}else for(let[i,s]of Object.entries(r)){let o=ft(n,r,i,s);o===void 0?delete r[i]:o!==s&&(r[i]=o)}return n.call(e,t,r)}ao.applyReviver=ft});var _e=k(lo=>{"use strict";var ku=C();function co(n,e,t){if(Array.isArray(n))return n.map((r,i)=>co(r,String(i),t));if(n&&typeof n.toJSON=="function"){if(!t||!ku.hasAnchor(n))return n.toJSON(e,t);let r={aliasCount:0,count:1,res:void 0};t.anchors.set(n,r),t.onCreate=s=>{r.res=s,delete t.onCreate};let i=n.toJSON(e,t);return t.onCreate&&t.onCreate(i),i}return typeof n=="bigint"&&!t?.keep?Number(n):n}lo.toJS=co});var an=k(fo=>{"use strict";var Au=wr(),uo=C(),Lu=_e(),vr=class{constructor(e){Object.defineProperty(this,uo.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:r,onAnchor:i,reviver:s}={}){if(!uo.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},a=Lu.toJS(this,"",o);if(typeof i=="function")for(let{count:c,res:l}of o.anchors.values())i(l,c);return typeof s=="function"?Au.applyReviver(s,{"":a},"",a):a}};fo.NodeBase=vr});var pt=k(po=>{"use strict";var Ru=on(),Ou=lt(),Ge=C(),xu=an(),Iu=_e(),kr=class extends xu.NodeBase{constructor(e){super(Ge.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let r;t?.aliasResolveCache?r=t.aliasResolveCache:(r=[],Ou.visit(e,{Node:(s,o)=>{(Ge.isAlias(o)||Ge.hasAnchor(o))&&r.push(o)}}),t&&(t.aliasResolveCache=r));let i;for(let s of r){if(s===this)break;s.anchor===this.source&&(i=s)}return i}toJSON(e,t){if(!t)return{source:this.source};let{anchors:r,doc:i,maxAliasCount:s}=t,o=this.resolve(i,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=r.get(o);if(a||(Iu.toJS(o,null,t),a=r.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=cn(i,o,r)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,r){let i=`*${this.source}`;if(e){if(Ru.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${i} `}return i}};function cn(n,e,t){if(Ge.isAlias(e)){let r=e.resolve(n),i=t&&r&&t.get(r);return i?i.count*i.aliasCount:0}else if(Ge.isCollection(e)){let r=0;for(let i of e.items){let s=cn(n,i,t);s>r&&(r=s)}return r}else if(Ge.isPair(e)){let r=cn(n,e.key,t),i=cn(n,e.value,t);return Math.max(r,i)}return 1}po.Alias=kr});var K=k(Ar=>{"use strict";var Cu=C(),Du=an(),$u=_e(),Pu=n=>!n||typeof n!="function"&&typeof n!="object",Ne=class extends Du.NodeBase{constructor(e){super(Cu.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:$u.toJS(this.value,e,t)}toString(){return String(this.value)}};Ne.BLOCK_FOLDED="BLOCK_FOLDED";Ne.BLOCK_LITERAL="BLOCK_LITERAL";Ne.PLAIN="PLAIN";Ne.QUOTE_DOUBLE="QUOTE_DOUBLE";Ne.QUOTE_SINGLE="QUOTE_SINGLE";Ar.Scalar=Ne;Ar.isScalarValue=Pu});var mt=k(ho=>{"use strict";var Mu=pt(),Ie=C(),mo=K(),qu="tag:yaml.org,2002:";function Uu(n,e,t){if(e){let r=t.filter(s=>s.tag===e),i=r.find(s=>!s.format)??r[0];if(!i)throw new Error(`Tag ${e} not found`);return i}return t.find(r=>r.identify?.(n)&&!r.format)}function Fu(n,e,t){if(Ie.isDocument(n)&&(n=n.contents),Ie.isNode(n))return n;if(Ie.isPair(n)){let f=t.schema[Ie.MAP].createNode?.(t.schema,null,t);return f.items.push(n),f}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:r,onAnchor:i,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(r&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=i(n)),new Mu.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=qu+e.slice(2));let l=Uu(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let f=new mo.Scalar(n);return c&&(c.node=f),f}l=n instanceof Map?o[Ie.MAP]:Symbol.iterator in Object(n)?o[Ie.SEQ]:o[Ie.MAP]}s&&(s(l),delete t.onTagObj);let u=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new mo.Scalar(n);return e?u.tag=e:l.default||(u.tag=l.tag),c&&(c.node=u),u}ho.createNode=Fu});var dn=k(ln=>{"use strict";var Bu=mt(),fe=C(),Ku=an();function Lr(n,e,t){let r=t;for(let i=e.length-1;i>=0;--i){let s=e[i];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=r,r=o}else r=new Map([[s,r]])}return Bu.createNode(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var go=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,Rr=class extends Ku.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(r=>fe.isNode(r)||fe.isPair(r)?r.clone(e):r),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(go(e))this.add(t);else{let[r,...i]=e,s=this.get(r,!0);if(fe.isCollection(s))s.addIn(i,t);else if(s===void 0&&this.schema)this.set(r,Lr(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}deleteIn(e){let[t,...r]=e;if(r.length===0)return this.delete(t);let i=this.get(t,!0);if(fe.isCollection(i))return i.deleteIn(r);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${r}`)}getIn(e,t){let[r,...i]=e,s=this.get(r,!0);return i.length===0?!t&&fe.isScalar(s)?s.value:s:fe.isCollection(s)?s.getIn(i,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!fe.isPair(t))return!1;let r=t.value;return r==null||e&&fe.isScalar(r)&&r.value==null&&!r.commentBefore&&!r.comment&&!r.tag})}hasIn(e){let[t,...r]=e;if(r.length===0)return this.has(t);let i=this.get(t,!0);return fe.isCollection(i)?i.hasIn(r):!1}setIn(e,t){let[r,...i]=e;if(i.length===0)this.set(r,t);else{let s=this.get(r,!0);if(fe.isCollection(s))s.setIn(i,t);else if(s===void 0&&this.schema)this.set(r,Lr(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}};ln.Collection=Rr;ln.collectionFromPath=Lr;ln.isEmptyPath=go});var ht=k(un=>{"use strict";var ju=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function Or(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var Xu=(n,e,t)=>n.endsWith(`
`)?Or(t,e):t.includes(`
`)?`
`+Or(t,e):(n.endsWith(" ")?"":" ")+t;un.indentComment=Or;un.lineComment=Xu;un.stringifyComment=ju});var bo=k(gt=>{"use strict";var zu="flow",xr="block",fn="quoted";function Yu(n,e,t="flow",{indentAtStart:r,lineWidth:i=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!i||i<0)return n;i<s&&(s=0);let c=Math.max(1+s,1+i-e.length);if(n.length<=c)return n;let l=[],u={},f=i-e.length;typeof r=="number"&&(r>i-Math.max(2,s)?l.push(0):f=i-r);let d,m,h=!1,p=-1,y=-1,b=-1;t===xr&&(p=yo(n,p,e.length),p!==-1&&(f=p+c));for(let _;_=n[p+=1];){if(t===fn&&_==="\\"){switch(y=p,n[p+1]){case"x":p+=3;break;case"u":p+=5;break;case"U":p+=9;break;default:p+=1}b=p}if(_===`
`)t===xr&&(p=yo(n,p,e.length)),f=p+e.length+c,d=void 0;else{if(_===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let w=n[p+1];w&&w!==" "&&w!==`
`&&w!=="	"&&(d=p)}if(p>=f)if(d)l.push(d),f=d+c,d=void 0;else if(t===fn){for(;m===" "||m==="	";)m=_,_=n[p+=1],h=!0;let w=p>b+1?p-2:y-1;if(u[w])return n;l.push(w),u[w]=!0,f=w+c,d=void 0}else h=!0}m=_}if(h&&a&&a(),l.length===0)return n;o&&o();let T=n.slice(0,l[0]);for(let _=0;_<l.length;++_){let w=l[_],E=l[_+1]||n.length;w===0?T=`
${e}${n.slice(0,E)}`:(t===fn&&u[w]&&(T+=`${n[w]}\\`),T+=`
${e}${n.slice(w+1,E)}`)}return T}function yo(n,e,t){let r=e,i=e+1,s=n[i];for(;s===" "||s==="	";)if(e<i+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);r=e,i=e+1,s=n[i]}return r}gt.FOLD_BLOCK=xr;gt.FOLD_FLOW=zu;gt.FOLD_QUOTED=fn;gt.foldFlowLines=Yu});var bt=k(Eo=>{"use strict";var ae=K(),Se=bo(),mn=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),hn=n=>/^(%|---|\.\.\.)/m.test(n);function Gu(n,e,t){if(!e||e<0)return!1;let r=e-t,i=n.length;if(i<=r)return!1;for(let s=0,o=0;s<i;++s)if(n[s]===`
`){if(s-o>r)return!0;if(o=s+1,i-o<=r)return!1}return!0}function yt(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:r}=e,i=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(hn(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let u=t.substr(c+2,4);switch(u){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:u.substr(0,2)==="00"?o+="\\x"+u.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(r||t[c+2]==='"'||t.length<i)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,r?o:Se.foldFlowLines(o,s,Se.FOLD_QUOTED,mn(e,!1))}function Ir(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return yt(n,e);let t=e.indent||(hn(n)?"  ":""),r="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?r:Se.foldFlowLines(r,t,Se.FOLD_FLOW,mn(e,!1))}function Ve(n,e){let{singleQuote:t}=e.options,r;if(t===!1)r=yt;else{let i=n.includes('"'),s=n.includes("'");i&&!s?r=Ir:s&&!i?r=yt:r=t?Ir:yt}return r(n,e)}var Cr;try{Cr=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{Cr=/\n+(?!\n|$)/g}function pn({comment:n,type:e,value:t},r,i,s){let{blockQuote:o,commentString:a,lineWidth:c}=r.options;if(!o||/\n[\t ]+$/.test(t))return Ve(t,r);let l=r.indent||(r.forceBlockIndent||hn(t)?"  ":""),u=o==="literal"?!0:o==="folded"||e===ae.Scalar.BLOCK_FOLDED?!1:e===ae.Scalar.BLOCK_LITERAL?!0:!Gu(t,c,l.length);if(!t)return u?`|
`:`>
`;let f,d;for(d=t.length;d>0;--d){let E=t[d-1];if(E!==`
`&&E!=="	"&&E!==" ")break}let m=t.substring(d),h=m.indexOf(`
`);h===-1?f="-":t===m||h!==m.length-1?(f="+",s&&s()):f="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(Cr,`$&${l}`));let p=!1,y,b=-1;for(y=0;y<t.length;++y){let E=t[y];if(E===" ")p=!0;else if(E===`
`)b=y;else break}let T=t.substring(0,b<y?b+1:y);T&&(t=t.substring(T.length),T=T.replace(/\n+/g,`$&${l}`));let w=(p?l?"2":"1":"")+f;if(n&&(w+=" "+a(n.replace(/ ?[\r\n]+/g," ")),i&&i()),!u){let E=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),S=!1,A=mn(r,!0);o!=="folded"&&e!==ae.Scalar.BLOCK_FOLDED&&(A.onOverflow=()=>{S=!0});let N=Se.foldFlowLines(`${T}${E}${m}`,l,Se.FOLD_BLOCK,A);if(!S)return`>${w}
${l}${N}`}return t=t.replace(/\n+/g,`$&${l}`),`|${w}
${l}${T}${t}${m}`}function Vu(n,e,t,r){let{type:i,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:u}=e;if(a&&s.includes(`
`)||u&&/[[\]{},]/.test(s))return Ve(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||u||!s.includes(`
`)?Ve(s,e):pn(n,e,t,r);if(!a&&!u&&i!==ae.Scalar.PLAIN&&s.includes(`
`))return pn(n,e,t,r);if(hn(s)){if(c==="")return e.forceBlockIndent=!0,pn(n,e,t,r);if(a&&c===l)return Ve(s,e)}let f=s.replace(/\n+/g,`$&
${c}`);if(o){let d=p=>p.default&&p.tag!=="tag:yaml.org,2002:str"&&p.test?.test(f),{compat:m,tags:h}=e.doc.schema;if(h.some(d)||m?.some(d))return Ve(s,e)}return a?f:Se.foldFlowLines(f,c,Se.FOLD_FLOW,mn(e,!1))}function Ju(n,e,t,r){let{implicitKey:i,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==ae.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=ae.Scalar.QUOTE_DOUBLE);let c=u=>{switch(u){case ae.Scalar.BLOCK_FOLDED:case ae.Scalar.BLOCK_LITERAL:return i||s?Ve(o.value,e):pn(o,e,t,r);case ae.Scalar.QUOTE_DOUBLE:return yt(o.value,e);case ae.Scalar.QUOTE_SINGLE:return Ir(o.value,e);case ae.Scalar.PLAIN:return Vu(o,e,t,r);default:return null}},l=c(a);if(l===null){let{defaultKeyType:u,defaultStringType:f}=e.options,d=i&&u||f;if(l=c(d),l===null)throw new Error(`Unsupported default string type ${d}`)}return l}Eo.stringifyString=Ju});var Et=k(Dr=>{"use strict";var Hu=on(),we=C(),Wu=ht(),Zu=bt();function Qu(n,e){let t=Object.assign({blockQuote:!0,commentString:Wu.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),r;switch(t.collectionStyle){case"block":r=!1;break;case"flow":r=!0;break;default:r=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:r,options:t}}function ef(n,e){if(e.tag){let i=n.filter(s=>s.tag===e.tag);if(i.length>0)return i.find(s=>s.format===e.format)??i[0]}let t,r;if(we.isScalar(e)){r=e.value;let i=n.filter(s=>s.identify?.(r));if(i.length>1){let s=i.filter(o=>o.test);s.length>0&&(i=s)}t=i.find(s=>s.format===e.format)??i.find(s=>!s.format)}else r=e,t=n.find(i=>i.nodeClass&&r instanceof i.nodeClass);if(!t){let i=r?.constructor?.name??(r===null?"null":typeof r);throw new Error(`Tag not resolved for ${i} value`)}return t}function tf(n,e,{anchors:t,doc:r}){if(!r.directives)return"";let i=[],s=(we.isScalar(n)||we.isCollection(n))&&n.anchor;s&&Hu.anchorIsValid(s)&&(t.add(s),i.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&i.push(r.directives.tagString(o)),i.join(" ")}function nf(n,e,t,r){if(we.isPair(n))return n.toString(e,t,r);if(we.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let i,s=we.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>i=c});i??(i=ef(e.doc.schema.tags,s));let o=tf(s,i,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof i.stringify=="function"?i.stringify(s,e,t,r):we.isScalar(s)?Zu.stringifyString(s,e,t,r):s.toString(e,t,r);return o?we.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}Dr.createStringifyContext=Qu;Dr.stringify=nf});var So=k(No=>{"use strict";var ge=C(),To=K(),_o=Et(),Tt=ht();function rf({key:n,value:e},t,r,i){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:u,simpleKeys:f}}=t,d=ge.isNode(n)&&n.comment||null;if(f){if(d)throw new Error("With simple keys, key nodes cannot have comments");if(ge.isCollection(n)||!ge.isNode(n)&&typeof n=="object"){let A="With simple keys, collection cannot be used as a key value";throw new Error(A)}}let m=!f&&(!n||d&&e==null&&!t.inFlow||ge.isCollection(n)||(ge.isScalar(n)?n.type===To.Scalar.BLOCK_FOLDED||n.type===To.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(f||!s),indent:a+c});let h=!1,p=!1,y=_o.stringify(n,t,()=>h=!0,()=>p=!0);if(!m&&!t.inFlow&&y.length>1024){if(f)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return h&&r&&r(),y===""?"?":m?`? ${y}`:y}else if(s&&!f||e==null&&m)return y=`? ${y}`,d&&!h?y+=Tt.lineComment(y,t.indent,l(d)):p&&i&&i(),y;h&&(d=null),m?(d&&(y+=Tt.lineComment(y,t.indent,l(d))),y=`? ${y}
${a}:`):(y=`${y}:`,d&&(y+=Tt.lineComment(y,t.indent,l(d))));let b,T,_;ge.isNode(e)?(b=!!e.spaceBefore,T=e.commentBefore,_=e.comment):(b=!1,T=null,_=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!d&&ge.isScalar(e)&&(t.indentAtStart=y.length+1),p=!1,!u&&c.length>=2&&!t.inFlow&&!m&&ge.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let w=!1,E=_o.stringify(e,t,()=>w=!0,()=>p=!0),S=" ";if(d||b||T){if(S=b?`
`:"",T){let A=l(T);S+=`
${Tt.indentComment(A,t.indent)}`}E===""&&!t.inFlow?S===`
`&&_&&(S=`

`):S+=`
${t.indent}`}else if(!m&&ge.isCollection(e)){let A=E[0],N=E.indexOf(`
`),v=N!==-1,D=t.inFlow??e.flow??e.items.length===0;if(v||!D){let G=!1;if(v&&(A==="&"||A==="!")){let $=E.indexOf(" ");A==="&"&&$!==-1&&$<N&&E[$+1]==="!"&&($=E.indexOf(" ",$+1)),($===-1||N<$)&&(G=!0)}G||(S=`
${t.indent}`)}}else(E===""||E[0]===`
`)&&(S="");return y+=S+E,t.inFlow?w&&r&&r():_&&!w?y+=Tt.lineComment(y,t.indent,l(_)):p&&i&&i(),y}No.stringifyPair=rf});var Pr=k($r=>{"use strict";var wo=Gt("process");function sf(n,...e){n==="debug"&&console.log(...e)}function of(n,e){(n==="debug"||n==="warn")&&(typeof wo.emitWarning=="function"?wo.emitWarning(e):console.warn(e))}$r.debug=sf;$r.warn=of});var Tn=k(En=>{"use strict";var bn=C(),vo=K(),gn="<<",yn={identify:n=>n===gn||typeof n=="symbol"&&n.description===gn,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new vo.Scalar(Symbol(gn)),{addToJSMap:ko}),stringify:()=>gn},af=(n,e)=>(yn.identify(e)||bn.isScalar(e)&&(!e.type||e.type===vo.Scalar.PLAIN)&&yn.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===yn.tag&&t.default);function ko(n,e,t){let r=Ao(n,t);if(bn.isSeq(r))for(let i of r.items)Mr(n,e,i);else if(Array.isArray(r))for(let i of r)Mr(n,e,i);else Mr(n,e,r)}function Mr(n,e,t){let r=Ao(n,t);if(!bn.isMap(r))throw new Error("Merge sources must be maps or map aliases");let i=r.toJSON(null,n,Map);for(let[s,o]of i)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function Ao(n,e){return n&&bn.isAlias(e)?e.resolve(n.doc,n):e}En.addMergeToJSMap=ko;En.isMergeKey=af;En.merge=yn});var Ur=k(Oo=>{"use strict";var cf=Pr(),Lo=Tn(),lf=Et(),Ro=C(),qr=_e();function df(n,e,{key:t,value:r}){if(Ro.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,r);else if(Lo.isMergeKey(n,t))Lo.addMergeToJSMap(n,e,r);else{let i=qr.toJS(t,"",n);if(e instanceof Map)e.set(i,qr.toJS(r,i,n));else if(e instanceof Set)e.add(i);else{let s=uf(t,i,n),o=qr.toJS(r,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function uf(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(Ro.isNode(n)&&t?.doc){let r=lf.createStringifyContext(t.doc,{});r.anchors=new Set;for(let s of t.anchors.keys())r.anchors.add(s.anchor);r.inFlow=!0,r.inStringifyKey=!0;let i=n.toString(r);if(!t.mapKeyWarned){let s=JSON.stringify(i);s.length>40&&(s=s.substring(0,36)+'..."'),cf.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return i}return JSON.stringify(e)}Oo.addPairToJSMap=df});var ve=k(Fr=>{"use strict";var xo=mt(),ff=So(),pf=Ur(),_n=C();function mf(n,e,t){let r=xo.createNode(n,void 0,t),i=xo.createNode(e,void 0,t);return new Nn(r,i)}var Nn=class n{constructor(e,t=null){Object.defineProperty(this,_n.NODE_TYPE,{value:_n.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:r}=this;return _n.isNode(t)&&(t=t.clone(e)),_n.isNode(r)&&(r=r.clone(e)),new n(t,r)}toJSON(e,t){let r=t?.mapAsMap?new Map:{};return pf.addPairToJSMap(t,r,this)}toString(e,t,r){return e?.doc?ff.stringifyPair(this,e,t,r):JSON.stringify(this)}};Fr.Pair=Nn;Fr.createPair=mf});var Br=k(Co=>{"use strict";var Ce=C(),Io=Et(),Sn=ht();function hf(n,e,t){return(e.inFlow??n.flow?yf:gf)(n,e,t)}function gf({comment:n,items:e},t,{blockItemPrefix:r,flowChars:i,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,u=Object.assign({},t,{indent:s,type:null}),f=!1,d=[];for(let h=0;h<e.length;++h){let p=e[h],y=null;if(Ce.isNode(p))!f&&p.spaceBefore&&d.push(""),wn(t,d,p.commentBefore,f),p.comment&&(y=p.comment);else if(Ce.isPair(p)){let T=Ce.isNode(p.key)?p.key:null;T&&(!f&&T.spaceBefore&&d.push(""),wn(t,d,T.commentBefore,f))}f=!1;let b=Io.stringify(p,u,()=>y=null,()=>f=!0);y&&(b+=Sn.lineComment(b,s,l(y))),f&&y&&(f=!1),d.push(r+b)}let m;if(d.length===0)m=i.start+i.end;else{m=d[0];for(let h=1;h<d.length;++h){let p=d[h];m+=p?`
${c}${p}`:`
`}}return n?(m+=`
`+Sn.indentComment(l(n),c),a&&a()):f&&o&&o(),m}function yf({items:n},e,{flowChars:t,itemIndent:r}){let{indent:i,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;r+=s;let c=Object.assign({},e,{indent:r,inFlow:!0,type:null}),l=!1,u=0,f=[];for(let h=0;h<n.length;++h){let p=n[h],y=null;if(Ce.isNode(p))p.spaceBefore&&f.push(""),wn(e,f,p.commentBefore,!1),p.comment&&(y=p.comment);else if(Ce.isPair(p)){let T=Ce.isNode(p.key)?p.key:null;T&&(T.spaceBefore&&f.push(""),wn(e,f,T.commentBefore,!1),T.comment&&(l=!0));let _=Ce.isNode(p.value)?p.value:null;_?(_.comment&&(y=_.comment),_.commentBefore&&(l=!0)):p.value==null&&T?.comment&&(y=T.comment)}y&&(l=!0);let b=Io.stringify(p,c,()=>y=null);l||(l=f.length>u||b.includes(`
`)),h<n.length-1?b+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=f.reduce((T,_)=>T+_.length+2,2)+(b.length+2)>e.options.lineWidth)),l&&(b+=",")),y&&(b+=Sn.lineComment(b,r,a(y))),f.push(b),u=f.length}let{start:d,end:m}=t;if(f.length===0)return d+m;if(!l){let h=f.reduce((p,y)=>p+y.length+2,2);l=e.options.lineWidth>0&&h>e.options.lineWidth}if(l){let h=d;for(let p of f)h+=p?`
${s}${i}${p}`:`
`;return`${h}
${i}${m}`}else return`${d}${o}${f.join(" ")}${o}${m}`}function wn({indent:n,options:{commentString:e}},t,r,i){if(r&&i&&(r=r.replace(/^\n+/,"")),r){let s=Sn.indentComment(e(r),n);t.push(s.trimStart())}}Co.stringifyCollection=hf});var Ae=k(jr=>{"use strict";var bf=Br(),Ef=Ur(),Tf=dn(),ke=C(),vn=ve(),_f=K();function _t(n,e){let t=ke.isScalar(e)?e.value:e;for(let r of n)if(ke.isPair(r)&&(r.key===e||r.key===t||ke.isScalar(r.key)&&r.key.value===t))return r}var Kr=class extends Tf.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ke.MAP,e),this.items=[]}static from(e,t,r){let{keepUndefined:i,replacer:s}=r,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||i)&&o.items.push(vn.createPair(c,l,r))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let r;ke.isPair(e)?r=e:!e||typeof e!="object"||!("key"in e)?r=new vn.Pair(e,e?.value):r=new vn.Pair(e.key,e.value);let i=_t(this.items,r.key),s=this.schema?.sortMapEntries;if(i){if(!t)throw new Error(`Key ${r.key} already set`);ke.isScalar(i.value)&&_f.isScalarValue(r.value)?i.value.value=r.value:i.value=r.value}else if(s){let o=this.items.findIndex(a=>s(r,a)<0);o===-1?this.items.push(r):this.items.splice(o,0,r)}else this.items.push(r)}delete(e){let t=_t(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let i=_t(this.items,e)?.value;return(!t&&ke.isScalar(i)?i.value:i)??void 0}has(e){return!!_t(this.items,e)}set(e,t){this.add(new vn.Pair(e,t),!0)}toJSON(e,t,r){let i=r?new r:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(i);for(let s of this.items)Ef.addPairToJSMap(t,i,s);return i}toString(e,t,r){if(!e)return JSON.stringify(this);for(let i of this.items)if(!ke.isPair(i))throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),bf.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:r,onComment:t})}};jr.YAMLMap=Kr;jr.findPair=_t});var Je=k($o=>{"use strict";var Nf=C(),Do=Ae(),Sf={collection:"map",default:!0,nodeClass:Do.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return Nf.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>Do.YAMLMap.from(n,e,t)};$o.map=Sf});var Le=k(Po=>{"use strict";var wf=mt(),vf=Br(),kf=dn(),An=C(),Af=K(),Lf=_e(),Xr=class extends kf.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(An.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=kn(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let r=kn(e);if(typeof r!="number")return;let i=this.items[r];return!t&&An.isScalar(i)?i.value:i}has(e){let t=kn(e);return typeof t=="number"&&t<this.items.length}set(e,t){let r=kn(e);if(typeof r!="number")throw new Error(`Expected a valid index, not ${e}.`);let i=this.items[r];An.isScalar(i)&&Af.isScalarValue(t)?i.value=t:this.items[r]=t}toJSON(e,t){let r=[];t?.onCreate&&t.onCreate(r);let i=0;for(let s of this.items)r.push(Lf.toJS(s,String(i++),t));return r}toString(e,t,r){return e?vf.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:r,onComment:t}):JSON.stringify(this)}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof i=="function"){let c=t instanceof Set?a:String(o++);a=i.call(t,c,a)}s.items.push(wf.createNode(a,void 0,r))}}return s}};function kn(n){let e=An.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}Po.YAMLSeq=Xr});var He=k(qo=>{"use strict";var Rf=C(),Mo=Le(),Of={collection:"seq",default:!0,nodeClass:Mo.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Rf.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>Mo.YAMLSeq.from(n,e,t)};qo.seq=Of});var Nt=k(Uo=>{"use strict";var xf=bt(),If={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,r){return e=Object.assign({actualString:!0},e),xf.stringifyString(n,e,t,r)}};Uo.string=If});var Ln=k(Ko=>{"use strict";var Fo=K(),Bo={identify:n=>n==null,createNode:()=>new Fo.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new Fo.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&Bo.test.test(n)?n:e.options.nullStr};Ko.nullTag=Bo});var zr=k(Xo=>{"use strict";var Cf=K(),jo={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new Cf.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&jo.test.test(n)){let r=n[0]==="t"||n[0]==="T";if(e===r)return n}return e?t.options.trueStr:t.options.falseStr}};Xo.boolTag=jo});var We=k(zo=>{"use strict";function Df({format:n,minFractionDigits:e,tag:t,value:r}){if(typeof r=="bigint")return String(r);let i=typeof r=="number"?r:Number(r);if(!isFinite(i))return isNaN(i)?".nan":i<0?"-.inf":".inf";let s=Object.is(r,-0)?"-0":JSON.stringify(r);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}zo.stringifyNumber=Df});var Gr=k(Rn=>{"use strict";var $f=K(),Yr=We(),Pf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Yr.stringifyNumber},Mf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Yr.stringifyNumber(n)}},qf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new $f.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:Yr.stringifyNumber};Rn.float=qf;Rn.floatExp=Mf;Rn.floatNaN=Pf});var Jr=k(xn=>{"use strict";var Yo=We(),On=n=>typeof n=="bigint"||Number.isInteger(n),Vr=(n,e,t,{intAsBigInt:r})=>r?BigInt(n):parseInt(n.substring(e),t);function Go(n,e,t){let{value:r}=n;return On(r)&&r>=0?t+r.toString(e):Yo.stringifyNumber(n)}var Uf={identify:n=>On(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>Vr(n,2,8,t),stringify:n=>Go(n,8,"0o")},Ff={identify:On,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>Vr(n,0,10,t),stringify:Yo.stringifyNumber},Bf={identify:n=>On(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>Vr(n,2,16,t),stringify:n=>Go(n,16,"0x")};xn.int=Ff;xn.intHex=Bf;xn.intOct=Uf});var Jo=k(Vo=>{"use strict";var Kf=Je(),jf=Ln(),Xf=He(),zf=Nt(),Yf=zr(),Hr=Gr(),Wr=Jr(),Gf=[Kf.map,Xf.seq,zf.string,jf.nullTag,Yf.boolTag,Wr.intOct,Wr.int,Wr.intHex,Hr.floatNaN,Hr.floatExp,Hr.float];Vo.schema=Gf});var Zo=k(Wo=>{"use strict";var Vf=K(),Jf=Je(),Hf=He();function Ho(n){return typeof n=="bigint"||Number.isInteger(n)}var In=({value:n})=>JSON.stringify(n),Wf=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:In},{identify:n=>n==null,createNode:()=>new Vf.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:In},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:In},{identify:Ho,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Ho(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:In}],Zf={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},Qf=[Jf.map,Hf.seq].concat(Wf,Zf);Wo.schema=Qf});var Qr=k(Qo=>{"use strict";var St=Gt("buffer"),Zr=K(),ep=bt(),tp={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof St.Buffer=="function")return St.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),r=new Uint8Array(t.length);for(let i=0;i<t.length;++i)r[i]=t.charCodeAt(i);return r}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},r,i,s){if(!t)return"";let o=t,a;if(typeof St.Buffer=="function")a=o instanceof St.Buffer?o.toString("base64"):St.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Zr.Scalar.BLOCK_LITERAL),e!==Zr.Scalar.QUOTE_DOUBLE){let c=Math.max(r.options.lineWidth-r.indent.length,r.options.minContentWidth),l=Math.ceil(a.length/c),u=new Array(l);for(let f=0,d=0;f<l;++f,d+=c)u[f]=a.substr(d,c);a=u.join(e===Zr.Scalar.BLOCK_LITERAL?`
`:" ")}return ep.stringifyString({comment:n,type:e,value:a},r,i,s)}};Qo.binary=tp});var $n=k(Dn=>{"use strict";var Cn=C(),ei=ve(),np=K(),rp=Le();function ea(n,e){if(Cn.isSeq(n))for(let t=0;t<n.items.length;++t){let r=n.items[t];if(!Cn.isPair(r)){if(Cn.isMap(r)){r.items.length>1&&e("Each pair must have its own sequence indicator");let i=r.items[0]||new ei.Pair(new np.Scalar(null));if(r.commentBefore&&(i.key.commentBefore=i.key.commentBefore?`${r.commentBefore}
${i.key.commentBefore}`:r.commentBefore),r.comment){let s=i.value??i.key;s.comment=s.comment?`${r.comment}
${s.comment}`:r.comment}r=i}n.items[t]=Cn.isPair(r)?r:new ei.Pair(r)}}else e("Expected a sequence for this tag");return n}function ta(n,e,t){let{replacer:r}=t,i=new rp.YAMLSeq(n);i.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof r=="function"&&(o=r.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;i.items.push(ei.createPair(a,c,t))}return i}var ip={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:ea,createNode:ta};Dn.createPairs=ta;Dn.pairs=ip;Dn.resolvePairs=ea});var ri=k(ni=>{"use strict";var na=C(),ti=_e(),wt=Ae(),sp=Le(),ra=$n(),De=class n extends sp.YAMLSeq{constructor(){super(),this.add=wt.YAMLMap.prototype.add.bind(this),this.delete=wt.YAMLMap.prototype.delete.bind(this),this.get=wt.YAMLMap.prototype.get.bind(this),this.has=wt.YAMLMap.prototype.has.bind(this),this.set=wt.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let r=new Map;t?.onCreate&&t.onCreate(r);for(let i of this.items){let s,o;if(na.isPair(i)?(s=ti.toJS(i.key,"",t),o=ti.toJS(i.value,s,t)):s=ti.toJS(i,"",t),r.has(s))throw new Error("Ordered maps must not include duplicate keys");r.set(s,o)}return r}static from(e,t,r){let i=ra.createPairs(e,t,r),s=new this;return s.items=i.items,s}};De.tag="tag:yaml.org,2002:omap";var op={collection:"seq",identify:n=>n instanceof Map,nodeClass:De,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=ra.resolvePairs(n,e),r=[];for(let{key:i}of t.items)na.isScalar(i)&&(r.includes(i.value)?e(`Ordered maps must not include duplicate keys: ${i.value}`):r.push(i.value));return Object.assign(new De,t)},createNode:(n,e,t)=>De.from(n,e,t)};ni.YAMLOMap=De;ni.omap=op});var ca=k(ii=>{"use strict";var ia=K();function sa({value:n,source:e},t){return e&&(n?oa:aa).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var oa={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new ia.Scalar(!0),stringify:sa},aa={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new ia.Scalar(!1),stringify:sa};ii.falseTag=aa;ii.trueTag=oa});var la=k(Pn=>{"use strict";var ap=K(),si=We(),cp={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:si.stringifyNumber},lp={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():si.stringifyNumber(n)}},dp={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new ap.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let r=n.substring(t+1).replace(/_/g,"");r[r.length-1]==="0"&&(e.minFractionDigits=r.length)}return e},stringify:si.stringifyNumber};Pn.float=dp;Pn.floatExp=lp;Pn.floatNaN=cp});var ua=k(kt=>{"use strict";var da=We(),vt=n=>typeof n=="bigint"||Number.isInteger(n);function Mn(n,e,t,{intAsBigInt:r}){let i=n[0];if((i==="-"||i==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),r){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return i==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return i==="-"?-1*s:s}function oi(n,e,t){let{value:r}=n;if(vt(r)){let i=r.toString(e);return r<0?"-"+t+i.substr(1):t+i}return da.stringifyNumber(n)}var up={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>Mn(n,2,2,t),stringify:n=>oi(n,2,"0b")},fp={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>Mn(n,1,8,t),stringify:n=>oi(n,8,"0")},pp={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>Mn(n,0,10,t),stringify:da.stringifyNumber},mp={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>Mn(n,2,16,t),stringify:n=>oi(n,16,"0x")};kt.int=pp;kt.intBin=up;kt.intHex=mp;kt.intOct=fp});var ci=k(ai=>{"use strict";var Fn=C(),qn=ve(),Un=Ae(),$e=class n extends Un.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;Fn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new qn.Pair(e.key,null):t=new qn.Pair(e,null),Un.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let r=Un.findPair(this.items,e);return!t&&Fn.isPair(r)?Fn.isScalar(r.key)?r.key.value:r.key:r}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let r=Un.findPair(this.items,e);r&&!t?this.items.splice(this.items.indexOf(r),1):!r&&t&&this.items.push(new qn.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,r){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,r);throw new Error("Set items must all have null values")}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof i=="function"&&(o=i.call(t,o,o)),s.items.push(qn.createPair(o,null,r));return s}};$e.tag="tag:yaml.org,2002:set";var hp={collection:"map",identify:n=>n instanceof Set,nodeClass:$e,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>$e.from(n,e,t),resolve(n,e){if(Fn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new $e,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};ai.YAMLSet=$e;ai.set=hp});var di=k(Bn=>{"use strict";var gp=We();function li(n,e){let t=n[0],r=t==="-"||t==="+"?n.substring(1):n,i=o=>e?BigInt(o):Number(o),s=r.replace(/_/g,"").split(":").reduce((o,a)=>o*i(60)+i(a),i(0));return t==="-"?i(-1)*s:s}function fa(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return gp.stringifyNumber(n);let r="";e<0&&(r="-",e*=t(-1));let i=t(60),s=[e%i];return e<60?s.unshift(0):(e=(e-s[0])/i,s.unshift(e%i),e>=60&&(e=(e-s[0])/i,s.unshift(e))),r+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var yp={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>li(n,t),stringify:fa},bp={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>li(n,!1),stringify:fa},pa={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(pa.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,r,i,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,r-1,i,s||0,o||0,a||0,c),u=e[8];if(u&&u!=="Z"){let f=li(u,!1);Math.abs(f)<30&&(f*=60),l-=6e4*f}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};Bn.floatTime=bp;Bn.intTime=yp;Bn.timestamp=pa});var ga=k(ha=>{"use strict";var Ep=Je(),Tp=Ln(),_p=He(),Np=Nt(),Sp=Qr(),ma=ca(),ui=la(),Kn=ua(),wp=Tn(),vp=ri(),kp=$n(),Ap=ci(),fi=di(),Lp=[Ep.map,_p.seq,Np.string,Tp.nullTag,ma.trueTag,ma.falseTag,Kn.intBin,Kn.intOct,Kn.int,Kn.intHex,ui.floatNaN,ui.floatExp,ui.float,Sp.binary,wp.merge,vp.omap,kp.pairs,Ap.set,fi.intTime,fi.floatTime,fi.timestamp];ha.schema=Lp});var ka=k(hi=>{"use strict";var Ta=Je(),Rp=Ln(),_a=He(),Op=Nt(),xp=zr(),pi=Gr(),mi=Jr(),Ip=Jo(),Cp=Zo(),Na=Qr(),At=Tn(),Sa=ri(),wa=$n(),ya=ga(),va=ci(),jn=di(),ba=new Map([["core",Ip.schema],["failsafe",[Ta.map,_a.seq,Op.string]],["json",Cp.schema],["yaml11",ya.schema],["yaml-1.1",ya.schema]]),Ea={binary:Na.binary,bool:xp.boolTag,float:pi.float,floatExp:pi.floatExp,floatNaN:pi.floatNaN,floatTime:jn.floatTime,int:mi.int,intHex:mi.intHex,intOct:mi.intOct,intTime:jn.intTime,map:Ta.map,merge:At.merge,null:Rp.nullTag,omap:Sa.omap,pairs:wa.pairs,seq:_a.seq,set:va.set,timestamp:jn.timestamp},Dp={"tag:yaml.org,2002:binary":Na.binary,"tag:yaml.org,2002:merge":At.merge,"tag:yaml.org,2002:omap":Sa.omap,"tag:yaml.org,2002:pairs":wa.pairs,"tag:yaml.org,2002:set":va.set,"tag:yaml.org,2002:timestamp":jn.timestamp};function $p(n,e,t){let r=ba.get(e);if(r&&!n)return t&&!r.includes(At.merge)?r.concat(At.merge):r.slice();let i=r;if(!i)if(Array.isArray(n))i=[];else{let s=Array.from(ba.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)i=i.concat(s);else typeof n=="function"&&(i=n(i.slice()));return t&&(i=i.concat(At.merge)),i.reduce((s,o)=>{let a=typeof o=="string"?Ea[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(Ea).map(u=>JSON.stringify(u)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}hi.coreKnownTags=Dp;hi.getTags=$p});var bi=k(Aa=>{"use strict";var gi=C(),Pp=Je(),Mp=He(),qp=Nt(),Xn=ka(),Up=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,yi=class n{constructor({compat:e,customTags:t,merge:r,resolveKnownTags:i,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?Xn.getTags(e,"compat"):e?Xn.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=i?Xn.coreKnownTags:{},this.tags=Xn.getTags(t,this.name,r),this.toStringOptions=a??null,Object.defineProperty(this,gi.MAP,{value:Pp.map}),Object.defineProperty(this,gi.SCALAR,{value:qp.string}),Object.defineProperty(this,gi.SEQ,{value:Mp.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?Up:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};Aa.Schema=yi});var Ra=k(La=>{"use strict";var Fp=C(),Ei=Et(),Lt=ht();function Bp(n,e){let t=[],r=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),r=!0):n.directives.docStart&&(r=!0)}r&&t.push("---");let i=Ei.createStringifyContext(n,e),{commentString:s}=i.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(Lt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(Fp.isNode(n.contents)){if(n.contents.spaceBefore&&r&&t.push(""),n.contents.commentBefore){let u=s(n.contents.commentBefore);t.push(Lt.indentComment(u,""))}i.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=Ei.stringify(n.contents,i,()=>a=null,c);a&&(l+=Lt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(Ei.stringify(n.contents,i));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(Lt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(Lt.indentComment(s(c),"")))}return t.join(`
`)+`
`}La.stringifyDocument=Bp});var Rt=k(Oa=>{"use strict";var Kp=pt(),Ze=dn(),se=C(),jp=ve(),Xp=_e(),zp=bi(),Yp=Ra(),Ti=on(),Gp=wr(),Vp=mt(),_i=Sr(),Ni=class n{constructor(e,t,r){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,se.NODE_TYPE,{value:se.DOC});let i=null;typeof t=="function"||Array.isArray(t)?i=t:r===void 0&&t&&(r=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},r);this.options=s;let{version:o}=s;r?._directives?(this.directives=r._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new _i.Directives({version:o}),this.setSchema(o,r),this.contents=e===void 0?null:this.createNode(e,i,r)}clone(){let e=Object.create(n.prototype,{[se.NODE_TYPE]:{value:se.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=se.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){Qe(this.contents)&&this.contents.add(e)}addIn(e,t){Qe(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let r=Ti.anchorNames(this);e.anchor=!t||r.has(t)?Ti.findNewAnchor(t||"a",r):t}return new Kp.Alias(e.anchor)}createNode(e,t,r){let i;if(typeof t=="function")e=t.call({"":e},"",e),i=t;else if(Array.isArray(t)){let y=T=>typeof T=="number"||T instanceof String||T instanceof Number,b=t.filter(y).map(String);b.length>0&&(t=t.concat(b)),i=t}else r===void 0&&t&&(r=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:u}=r??{},{onAnchor:f,setAnchors:d,sourceObjects:m}=Ti.createNodeAnchors(this,o||"a"),h={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:f,onTagObj:l,replacer:i,schema:this.schema,sourceObjects:m},p=Vp.createNode(e,u,h);return a&&se.isCollection(p)&&(p.flow=!0),d(),p}createPair(e,t,r={}){let i=this.createNode(e,null,r),s=this.createNode(t,null,r);return new jp.Pair(i,s)}delete(e){return Qe(this.contents)?this.contents.delete(e):!1}deleteIn(e){return Ze.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):Qe(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return se.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return Ze.isEmptyPath(e)?!t&&se.isScalar(this.contents)?this.contents.value:this.contents:se.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return se.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return Ze.isEmptyPath(e)?this.contents!==void 0:se.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=Ze.collectionFromPath(this.schema,[e],t):Qe(this.contents)&&this.contents.set(e,t)}setIn(e,t){Ze.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=Ze.collectionFromPath(this.schema,Array.from(e),t):Qe(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let r;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new _i.Directives({version:"1.1"}),r={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new _i.Directives({version:e}),r={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,r=null;break;default:{let i=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(r)this.schema=new zp.Schema(Object.assign(r,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:r,maxAliasCount:i,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:r===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},c=Xp.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:u}of a.anchors.values())s(u,l);return typeof o=="function"?Gp.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return Yp.stringifyDocument(this,e)}};function Qe(n){if(se.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}Oa.Document=Ni});var It=k(xt=>{"use strict";var Ot=class extends Error{constructor(e,t,r,i){super(),this.name=e,this.code=r,this.message=i,this.pos=t}},Si=class extends Ot{constructor(e,t,r){super("YAMLParseError",e,t,r)}},wi=class extends Ot{constructor(e,t,r){super("YAMLWarning",e,t,r)}},Jp=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:r,col:i}=t.linePos[0];t.message+=` at line ${r}, column ${i}`;let s=i-1,o=n.substring(e.lineStarts[r-1],e.lineStarts[r]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),r>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[r-2],e.lineStarts[r-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===r&&c.col>i&&(a=Math.max(1,Math.min(c.col-i,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};xt.YAMLError=Ot;xt.YAMLParseError=Si;xt.YAMLWarning=wi;xt.prettifyError=Jp});var Ct=k(xa=>{"use strict";function Hp(n,{flow:e,indicator:t,next:r,offset:i,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,u=a,f="",d="",m=!1,h=!1,p=null,y=null,b=null,T=null,_=null,w=null,E=null;for(let N of n)switch(h&&(N.type!=="space"&&N.type!=="newline"&&N.type!=="comma"&&s(N.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),h=!1),p&&(l&&N.type!=="comment"&&N.type!=="newline"&&s(p,"TAB_AS_INDENT","Tabs are not allowed as indentation"),p=null),N.type){case"space":!e&&(t!=="doc-start"||r?.type!=="flow-collection")&&N.source.includes("	")&&(p=N),u=!0;break;case"comment":{u||s(N,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let v=N.source.substring(1)||" ";f?f+=d+v:f=v,d="",l=!1;break}case"newline":l?f?f+=N.source:(!w||t!=="seq-item-ind")&&(c=!0):d+=N.source,l=!0,m=!0,(y||b)&&(T=N),u=!0;break;case"anchor":y&&s(N,"MULTIPLE_ANCHORS","A node can have at most one anchor"),N.source.endsWith(":")&&s(N.offset+N.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),y=N,E??(E=N.offset),l=!1,u=!1,h=!0;break;case"tag":{b&&s(N,"MULTIPLE_TAGS","A node can have at most one tag"),b=N,E??(E=N.offset),l=!1,u=!1,h=!0;break}case t:(y||b)&&s(N,"BAD_PROP_ORDER",`Anchors and tags must be after the ${N.source} indicator`),w&&s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.source} in ${e??"collection"}`),w=N,l=t==="seq-item-ind"||t==="explicit-key-ind",u=!1;break;case"comma":if(e){_&&s(N,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),_=N,l=!1,u=!1;break}default:s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.type} token`),l=!1,u=!1}let S=n[n.length-1],A=S?S.offset+S.source.length:i;return h&&r&&r.type!=="space"&&r.type!=="newline"&&r.type!=="comma"&&(r.type!=="scalar"||r.source!=="")&&s(r.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),p&&(l&&p.indent<=o||r?.type==="block-map"||r?.type==="block-seq")&&s(p,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:_,found:w,spaceBefore:c,comment:f,hasNewline:m,anchor:y,tag:b,newlineAfterProp:T,end:A,start:E??A}}xa.resolveProps=Hp});var zn=k(Ia=>{"use strict";function vi(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(vi(e.key)||vi(e.value))return!0}return!1;default:return!0}}Ia.containsNewline=vi});var ki=k(Ca=>{"use strict";var Wp=zn();function Zp(n,e,t){if(e?.type==="flow-collection"){let r=e.end[0];r.indent===n&&(r.source==="]"||r.source==="}")&&Wp.containsNewline(e)&&t(r,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}Ca.flowIndentCheck=Zp});var Ai=k($a=>{"use strict";var Da=C();function Qp(n,e,t){let{uniqueKeys:r}=n.options;if(r===!1)return!1;let i=typeof r=="function"?r:(s,o)=>s===o||Da.isScalar(s)&&Da.isScalar(o)&&s.value===o.value;return e.some(s=>i(s.key,t))}$a.mapIncludes=Qp});var Ba=k(Fa=>{"use strict";var Pa=ve(),em=Ae(),Ma=Ct(),tm=zn(),qa=ki(),nm=Ai(),Ua="All mapping items must start at the same column";function rm({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??em.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=r.offset,l=null;for(let u of r.items){let{start:f,key:d,sep:m,value:h}=u,p=Ma.resolveProps(f,{indicator:"explicit-key-ind",next:d??m?.[0],offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0}),y=!p.found;if(y){if(d&&(d.type==="block-seq"?i(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in d&&d.indent!==r.indent&&i(c,"BAD_INDENT",Ua)),!p.anchor&&!p.tag&&!m){l=p.end,p.comment&&(a.comment?a.comment+=`
`+p.comment:a.comment=p.comment);continue}(p.newlineAfterProp||tm.containsNewline(d))&&i(d??f[f.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else p.found?.indent!==r.indent&&i(c,"BAD_INDENT",Ua);t.atKey=!0;let b=p.end,T=d?n(t,d,p,i):e(t,b,f,null,p,i);t.schema.compat&&qa.flowIndentCheck(r.indent,d,i),t.atKey=!1,nm.mapIncludes(t,a.items,T)&&i(b,"DUPLICATE_KEY","Map keys must be unique");let _=Ma.resolveProps(m??[],{indicator:"map-value-ind",next:h,offset:T.range[2],onError:i,parentIndent:r.indent,startOnNewline:!d||d.type==="block-scalar"});if(c=_.end,_.found){y&&(h?.type==="block-map"&&!_.hasNewline&&i(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&p.start<_.found.offset-1024&&i(T.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let w=h?n(t,h,_,i):e(t,c,m,null,_,i);t.schema.compat&&qa.flowIndentCheck(r.indent,h,i),c=w.range[2];let E=new Pa.Pair(T,w);t.options.keepSourceTokens&&(E.srcToken=u),a.items.push(E)}else{y&&i(T.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),_.comment&&(T.comment?T.comment+=`
`+_.comment:T.comment=_.comment);let w=new Pa.Pair(T);t.options.keepSourceTokens&&(w.srcToken=u),a.items.push(w)}}return l&&l<c&&i(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[r.offset,c,l??c],a}Fa.resolveBlockMap=rm});var ja=k(Ka=>{"use strict";var im=Le(),sm=Ct(),om=ki();function am({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??im.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=r.offset,l=null;for(let{start:u,value:f}of r.items){let d=sm.resolveProps(u,{indicator:"seq-item-ind",next:f,offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0});if(!d.found)if(d.anchor||d.tag||f)f?.type==="block-seq"?i(d.end,"BAD_INDENT","All sequence items must start at the same column"):i(c,"MISSING_CHAR","Sequence item without - indicator");else{l=d.end,d.comment&&(a.comment=d.comment);continue}let m=f?n(t,f,d,i):e(t,d.end,u,null,d,i);t.schema.compat&&om.flowIndentCheck(r.indent,f,i),c=m.range[2],a.items.push(m)}return a.range=[r.offset,c,l??c],a}Ka.resolveBlockSeq=am});var et=k(Xa=>{"use strict";function cm(n,e,t,r){let i="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&r(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let u=c.substring(1)||" ";i?i+=o+u:i=u,o="";break}case"newline":i&&(o+=c),s=!0;break;default:r(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:i,offset:e}}Xa.resolveEnd=cm});var Va=k(Ga=>{"use strict";var lm=C(),dm=ve(),za=Ae(),um=Le(),fm=et(),Ya=Ct(),pm=zn(),mm=Ai(),Li="Block collections are not allowed within flow collections",Ri=n=>n&&(n.type==="block-map"||n.type==="block-seq");function hm({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=r.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?za.YAMLMap:um.YAMLSeq),l=new c(t.schema);l.flow=!0;let u=t.atRoot;u&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let f=r.offset+r.start.source.length;for(let y=0;y<r.items.length;++y){let b=r.items[y],{start:T,key:_,sep:w,value:E}=b,S=Ya.resolveProps(T,{flow:a,indicator:"explicit-key-ind",next:_??w?.[0],offset:f,onError:i,parentIndent:r.indent,startOnNewline:!1});if(!S.found){if(!S.anchor&&!S.tag&&!w&&!E){y===0&&S.comma?i(S.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):y<r.items.length-1&&i(S.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),S.comment&&(l.comment?l.comment+=`
`+S.comment:l.comment=S.comment),f=S.end;continue}!o&&t.options.strict&&pm.containsNewline(_)&&i(_,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(y===0)S.comma&&i(S.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(S.comma||i(S.start,"MISSING_CHAR",`Missing , between ${a} items`),S.comment){let A="";e:for(let N of T)switch(N.type){case"comma":case"space":break;case"comment":A=N.source.substring(1);break e;default:break e}if(A){let N=l.items[l.items.length-1];lm.isPair(N)&&(N=N.value??N.key),N.comment?N.comment+=`
`+A:N.comment=A,S.comment=S.comment.substring(A.length+1)}}if(!o&&!w&&!S.found){let A=E?n(t,E,S,i):e(t,S.end,w,null,S,i);l.items.push(A),f=A.range[2],Ri(E)&&i(A.range,"BLOCK_IN_FLOW",Li)}else{t.atKey=!0;let A=S.end,N=_?n(t,_,S,i):e(t,A,T,null,S,i);Ri(_)&&i(N.range,"BLOCK_IN_FLOW",Li),t.atKey=!1;let v=Ya.resolveProps(w??[],{flow:a,indicator:"map-value-ind",next:E,offset:N.range[2],onError:i,parentIndent:r.indent,startOnNewline:!1});if(v.found){if(!o&&!S.found&&t.options.strict){if(w)for(let $ of w){if($===v.found)break;if($.type==="newline"){i($,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}S.start<v.found.offset-1024&&i(v.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else E&&("source"in E&&E.source?.[0]===":"?i(E,"MISSING_CHAR",`Missing space after : in ${a}`):i(v.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let D=E?n(t,E,v,i):v.found?e(t,v.end,w,null,v,i):null;D?Ri(E)&&i(D.range,"BLOCK_IN_FLOW",Li):v.comment&&(N.comment?N.comment+=`
`+v.comment:N.comment=v.comment);let G=new dm.Pair(N,D);if(t.options.keepSourceTokens&&(G.srcToken=b),o){let $=l;mm.mapIncludes(t,$.items,N)&&i(A,"DUPLICATE_KEY","Map keys must be unique"),$.items.push(G)}else{let $=new za.YAMLMap(t.schema);$.flow=!0,$.items.push(G);let R=(D??N).range;$.range=[N.range[0],R[1],R[2]],l.items.push($)}f=D?D.range[2]:v.end}}let d=o?"}":"]",[m,...h]=r.end,p=f;if(m?.source===d)p=m.offset+m.source.length;else{let y=a[0].toUpperCase()+a.substring(1),b=u?`${y} must end with a ${d}`:`${y} in block collection must be sufficiently indented and end with a ${d}`;i(f,u?"MISSING_CHAR":"BAD_INDENT",b),m&&m.source.length!==1&&h.unshift(m)}if(h.length>0){let y=fm.resolveEnd(h,p,t.options.strict,i);y.comment&&(l.comment?l.comment+=`
`+y.comment:l.comment=y.comment),l.range=[r.offset,p,y.offset]}else l.range=[r.offset,p,p];return l}Ga.resolveFlowCollection=hm});var Ha=k(Ja=>{"use strict";var gm=C(),ym=K(),bm=Ae(),Em=Le(),Tm=Ba(),_m=ja(),Nm=Va();function Oi(n,e,t,r,i,s){let o=t.type==="block-map"?Tm.resolveBlockMap(n,e,t,r,s):t.type==="block-seq"?_m.resolveBlockSeq(n,e,t,r,s):Nm.resolveFlowCollection(n,e,t,r,s),a=o.constructor;return i==="!"||i===a.tagName?(o.tag=a.tagName,o):(i&&(o.tag=i),o)}function Sm(n,e,t,r,i){let s=r.tag,o=s?e.directives.tagName(s.source,d=>i(s,"TAG_RESOLVE_FAILED",d)):null;if(t.type==="block-seq"){let{anchor:d,newlineAfterProp:m}=r,h=d&&s?d.offset>s.offset?d:s:d??s;h&&(!m||m.offset<h.offset)&&i(h,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===bm.YAMLMap.tagName&&a==="map"||o===Em.YAMLSeq.tagName&&a==="seq")return Oi(n,e,t,i,o);let c=e.schema.tags.find(d=>d.tag===o&&d.collection===a);if(!c){let d=e.schema.knownTags[o];if(d?.collection===a)e.schema.tags.push(Object.assign({},d,{default:!1})),c=d;else return d?i(s,"BAD_COLLECTION_TYPE",`${d.tag} used for ${a} collection, but expects ${d.collection??"scalar"}`,!0):i(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),Oi(n,e,t,i,o)}let l=Oi(n,e,t,i,o,c),u=c.resolve?.(l,d=>i(s,"TAG_RESOLVE_FAILED",d),e.options)??l,f=gm.isNode(u)?u:new ym.Scalar(u);return f.range=l.range,f.tag=o,c?.format&&(f.format=c.format),f}Ja.composeCollection=Sm});var Ii=k(Wa=>{"use strict";var xi=K();function wm(n,e,t){let r=e.offset,i=vm(e,n.options.strict,t);if(!i)return{value:"",type:null,comment:"",range:[r,r,r]};let s=i.mode===">"?xi.Scalar.BLOCK_FOLDED:xi.Scalar.BLOCK_LITERAL,o=e.source?km(e.source):[],a=o.length;for(let p=o.length-1;p>=0;--p){let y=o[p][1];if(y===""||y==="\r")a=p;else break}if(a===0){let p=i.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",y=r+i.length;return e.source&&(y+=e.source.length),{value:p,type:s,comment:i.comment,range:[r,y,y]}}let c=e.indent+i.indent,l=e.offset+i.length,u=0;for(let p=0;p<a;++p){let[y,b]=o[p];if(b===""||b==="\r")i.indent===0&&y.length>c&&(c=y.length);else{y.length<c&&t(l+y.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),i.indent===0&&(c=y.length),u=p,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=y.length+b.length+1}for(let p=o.length-1;p>=a;--p)o[p][0].length>c&&(a=p+1);let f="",d="",m=!1;for(let p=0;p<u;++p)f+=o[p][0].slice(c)+`
`;for(let p=u;p<a;++p){let[y,b]=o[p];l+=y.length+b.length+1;let T=b[b.length-1]==="\r";if(T&&(b=b.slice(0,-1)),b&&y.length<c){let w=`Block scalar lines must not be less indented than their ${i.indent?"explicit indentation indicator":"first line"}`;t(l-b.length-(T?2:1),"BAD_INDENT",w),y=""}s===xi.Scalar.BLOCK_LITERAL?(f+=d+y.slice(c)+b,d=`
`):y.length>c||b[0]==="	"?(d===" "?d=`
`:!m&&d===`
`&&(d=`

`),f+=d+y.slice(c)+b,d=`
`,m=!0):b===""?d===`
`?f+=`
`:d=`
`:(f+=d+b,d=" ",m=!1)}switch(i.chomp){case"-":break;case"+":for(let p=a;p<o.length;++p)f+=`
`+o[p][0].slice(c);f[f.length-1]!==`
`&&(f+=`
`);break;default:f+=`
`}let h=r+i.length+e.source.length;return{value:f,type:s,comment:i.comment,range:[r,h,h]}}function vm({offset:n,props:e},t,r){if(e[0].type!=="block-scalar-header")return r(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:i}=e[0],s=i[0],o=0,a="",c=-1;for(let d=1;d<i.length;++d){let m=i[d];if(!a&&(m==="-"||m==="+"))a=m;else{let h=Number(m);!o&&h?o=h:c===-1&&(c=n+d)}}c!==-1&&r(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${i}`);let l=!1,u="",f=i.length;for(let d=1;d<e.length;++d){let m=e[d];switch(m.type){case"space":l=!0;case"newline":f+=m.source.length;break;case"comment":t&&!l&&r(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),f+=m.source.length,u=m.source.substring(1);break;case"error":r(m,"UNEXPECTED_TOKEN",m.message),f+=m.source.length;break;default:{let h=`Unexpected token in block scalar header: ${m.type}`;r(m,"UNEXPECTED_TOKEN",h);let p=m.source;p&&typeof p=="string"&&(f+=p.length)}}}return{mode:s,indent:o,chomp:a,comment:u,length:f}}function km(n){let e=n.split(/\n( *)/),t=e[0],r=t.match(/^( *)/),s=[r?.[1]?[r[1],t.slice(r[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}Wa.resolveBlockScalar=wm});var Di=k(Qa=>{"use strict";var Ci=K(),Am=et();function Lm(n,e,t){let{offset:r,type:i,source:s,end:o}=n,a,c,l=(d,m,h)=>t(r+d,m,h);switch(i){case"scalar":a=Ci.Scalar.PLAIN,c=Rm(s,l);break;case"single-quoted-scalar":a=Ci.Scalar.QUOTE_SINGLE,c=Om(s,l);break;case"double-quoted-scalar":a=Ci.Scalar.QUOTE_DOUBLE,c=xm(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${i}`),{value:"",type:null,comment:"",range:[r,r+s.length,r+s.length]}}let u=r+s.length,f=Am.resolveEnd(o,u,e,t);return{value:c,type:a,comment:f.comment,range:[r,u,f.offset]}}function Rm(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),Za(n)}function Om(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),Za(n.slice(1,-1)).replace(/''/g,"'")}function Za(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let r=e.exec(n);if(!r)return n;let i=r[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;r=t.exec(n);)r[1]===""?s===`
`?i+=s:s=`
`:(i+=s+r[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,r=a.exec(n),i+s+(r?.[1]??"")}function xm(n,e){let t="";for(let r=1;r<n.length-1;++r){let i=n[r];if(!(i==="\r"&&n[r+1]===`
`))if(i===`
`){let{fold:s,offset:o}=Im(n,r);t+=s,r=o}else if(i==="\\"){let s=n[++r],o=Cm[s];if(o)t+=o;else if(s===`
`)for(s=n[r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="\r"&&n[r+1]===`
`)for(s=n[++r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=Dm(n,r+1,a,e),r+=a}else{let a=n.substr(r-1,2);e(r-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(i===" "||i==="	"){let s=r,o=n[r+1];for(;o===" "||o==="	";)o=n[++r+1];o!==`
`&&!(o==="\r"&&n[r+2]===`
`)&&(t+=r>s?n.slice(s,r+1):i)}else t+=i}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function Im(n,e){let t="",r=n[e+1];for(;(r===" "||r==="	"||r===`
`||r==="\r")&&!(r==="\r"&&n[e+2]!==`
`);)r===`
`&&(t+=`
`),e+=1,r=n[e+1];return t||(t=" "),{fold:t,offset:e}}var Cm={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function Dm(n,e,t,r){let i=n.substr(e,t),o=i.length===t&&/^[0-9a-fA-F]+$/.test(i)?parseInt(i,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return r(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Qa.resolveFlowScalar=Lm});var nc=k(tc=>{"use strict";var Pe=C(),ec=K(),$m=Ii(),Pm=Di();function Mm(n,e,t,r){let{value:i,type:s,comment:o,range:a}=e.type==="block-scalar"?$m.resolveBlockScalar(n,e,r):Pm.resolveFlowScalar(e,n.options.strict,r),c=t?n.directives.tagName(t.source,f=>r(t,"TAG_RESOLVE_FAILED",f)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Pe.SCALAR]:c?l=qm(n.schema,i,c,t,r):e.type==="scalar"?l=Um(n,i,e,r):l=n.schema[Pe.SCALAR];let u;try{let f=l.resolve(i,d=>r(t??e,"TAG_RESOLVE_FAILED",d),n.options);u=Pe.isScalar(f)?f:new ec.Scalar(f)}catch(f){let d=f instanceof Error?f.message:String(f);r(t??e,"TAG_RESOLVE_FAILED",d),u=new ec.Scalar(i)}return u.range=a,u.source=i,s&&(u.type=s),c&&(u.tag=c),l.format&&(u.format=l.format),o&&(u.comment=o),u}function qm(n,e,t,r,i){if(t==="!")return n[Pe.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(i(r,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Pe.SCALAR])}function Um({atKey:n,directives:e,schema:t},r,i,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(r))||t[Pe.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(r))??t[Pe.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),u=`Value may be parsed as either ${c} or ${l}`;s(i,"TAG_RESOLVE_FAILED",u,!0)}}return o}tc.composeScalar=Mm});var ic=k(rc=>{"use strict";function Fm(n,e,t){if(e){t??(t=e.length);for(let r=t-1;r>=0;--r){let i=e[r];switch(i.type){case"space":case"comment":case"newline":n-=i.source.length;continue}for(i=e[++r];i?.type==="space";)n+=i.source.length,i=e[++r];break}}return n}rc.emptyScalarPosition=Fm});var ac=k(Pi=>{"use strict";var Bm=pt(),Km=C(),jm=Ha(),sc=nc(),Xm=et(),zm=ic(),Ym={composeNode:oc,composeEmptyNode:$i};function oc(n,e,t,r){let i=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,u=!0;switch(e.type){case"alias":l=Gm(n,e,r),(a||c)&&r(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=sc.composeScalar(n,e,c,r),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=jm.composeCollection(Ym,n,e,t,r),a&&(l.anchor=a.source.substring(1))}catch(f){let d=f instanceof Error?f.message:String(f);r(e,"RESOURCE_EXHAUSTION",d)}break;default:{let f=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;r(e,"UNEXPECTED_TOKEN",f),u=!1}}return l??(l=$i(n,e.offset,void 0,null,t,r)),a&&l.anchor===""&&r(a,"BAD_ALIAS","Anchor cannot be an empty string"),i&&n.options.stringKeys&&(!Km.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&r(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&u&&(l.srcToken=e),l}function $i(n,e,t,r,{spaceBefore:i,comment:s,anchor:o,tag:a,end:c},l){let u={type:"scalar",offset:zm.emptyScalarPosition(e,t,r),indent:-1,source:""},f=sc.composeScalar(n,u,a,l);return o&&(f.anchor=o.source.substring(1),f.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),i&&(f.spaceBefore=!0),s&&(f.comment=s,f.range[2]=c),f}function Gm({options:n},{offset:e,source:t,end:r},i){let s=new Bm.Alias(t.substring(1));s.source===""&&i(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&i(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=Xm.resolveEnd(r,o,n.strict,i);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}Pi.composeEmptyNode=$i;Pi.composeNode=oc});var dc=k(lc=>{"use strict";var Vm=Rt(),cc=ac(),Jm=et(),Hm=Ct();function Wm(n,e,{offset:t,start:r,value:i,end:s},o){let a=Object.assign({_directives:e},n),c=new Vm.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},u=Hm.resolveProps(r,{indicator:"doc-start",next:i??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});u.found&&(c.directives.docStart=!0,i&&(i.type==="block-map"||i.type==="block-seq")&&!u.hasNewline&&o(u.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=i?cc.composeNode(l,i,u,o):cc.composeEmptyNode(l,u.end,r,null,u,o);let f=c.contents.range[2],d=Jm.resolveEnd(s,f,!1,o);return d.comment&&(c.comment=d.comment),c.range=[t,f,d.offset],c}lc.composeDoc=Wm});var qi=k(pc=>{"use strict";var Zm=Gt("process"),Qm=Sr(),eh=Rt(),Dt=It(),uc=C(),th=dc(),nh=et();function $t(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function fc(n){let e="",t=!1,r=!1;for(let i=0;i<n.length;++i){let s=n[i];switch(s[0]){case"#":e+=(e===""?"":r?`

`:`
`)+(s.substring(1)||" "),t=!0,r=!1;break;case"%":n[i+1]?.[0]!=="#"&&(i+=1),t=!1;break;default:t||(r=!0),t=!1}}return{comment:e,afterEmptyLine:r}}var Mi=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,r,i,s)=>{let o=$t(t);s?this.warnings.push(new Dt.YAMLWarning(o,r,i)):this.errors.push(new Dt.YAMLParseError(o,r,i))},this.directives=new Qm.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:r,afterEmptyLine:i}=fc(this.prelude);if(r){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${r}`:r;else if(i||e.directives.docStart||!s)e.commentBefore=r;else if(uc.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];uc.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${r}
${a}`:r}else{let o=s.commentBefore;s.commentBefore=o?`${r}
${o}`:r}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:fc(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,r=-1){for(let i of e)yield*this.next(i);yield*this.end(t,r)}*next(e){switch(Zm.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,r,i)=>{let s=$t(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",r,i)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=th.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,r=new Dt.YAMLParseError($t(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(r):this.doc.errors.push(r);break}case"doc-end":{if(!this.doc){let r="Unexpected doc-end without preceding document";this.errors.push(new Dt.YAMLParseError($t(e),"UNEXPECTED_TOKEN",r));break}this.doc.directives.docEnd=!0;let t=nh.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let r=this.doc.comment;this.doc.comment=r?`${r}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new Dt.YAMLParseError($t(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let r=Object.assign({_directives:this.directives},this.options),i=new eh.Document(void 0,r);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),i.range=[0,t,t],this.decorate(i,!1),yield i}}};pc.Composer=Mi});var gc=k(Yn=>{"use strict";var rh=Ii(),ih=Di(),sh=It(),mc=bt();function oh(n,e=!0,t){if(n){let r=(i,s,o)=>{let a=typeof i=="number"?i:Array.isArray(i)?i[0]:i.offset;if(t)t(a,s,o);else throw new sh.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return ih.resolveFlowScalar(n,e,r);case"block-scalar":return rh.resolveBlockScalar({options:{strict:e}},n,r)}}return null}function ah(n,e){let{implicitKey:t=!1,indent:r,inFlow:i=!1,offset:s=-1,type:o="PLAIN"}=e,a=mc.stringifyString({type:o,value:n},{implicitKey:t,indent:r>0?" ".repeat(r):"",inFlow:i,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:r,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),u=a.substring(0,l),f=a.substring(l+1)+`
`,d=[{type:"block-scalar-header",offset:s,indent:r,source:u}];return hc(d,c)||d.push({type:"newline",offset:-1,indent:r,source:`
`}),{type:"block-scalar",offset:s,indent:r,props:d,source:f}}case'"':return{type:"double-quoted-scalar",offset:s,indent:r,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:r,source:a,end:c};default:return{type:"scalar",offset:s,indent:r,source:a,end:c}}}function ch(n,e,t={}){let{afterKey:r=!1,implicitKey:i=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(r&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=mc.stringifyString({type:o,value:e},{implicitKey:i||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":lh(n,c);break;case'"':Ui(n,c,"double-quoted-scalar");break;case"'":Ui(n,c,"single-quoted-scalar");break;default:Ui(n,c,"scalar")}}function lh(n,e){let t=e.indexOf(`
`),r=e.substring(0,t),i=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=r,n.source=i}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:r}];hc(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:i})}}function hc(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function Ui(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let r=n.props.slice(1),i=e.length;n.props[0].type==="block-scalar-header"&&(i-=n.props[0].source.length);for(let s of r)s.offset+=i;delete n.props,Object.assign(n,{type:t,source:e,end:r});break}case"block-map":case"block-seq":{let i={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[i]});break}default:{let r="indent"in n?n.indent:-1,i="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:r,source:e,end:i})}}}Yn.createScalarToken=ah;Yn.resolveAsScalar=oh;Yn.setScalarValue=ch});var bc=k(yc=>{"use strict";var dh=n=>"type"in n?Vn(n):Gn(n);function Vn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Vn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=Gn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=Gn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=Gn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function Gn({start:n,key:e,sep:t,value:r}){let i="";for(let s of n)i+=s.source;if(e&&(i+=Vn(e)),t)for(let s of t)i+=s.source;return r&&(i+=Vn(r)),i}yc.stringify=dh});var Nc=k(_c=>{"use strict";var Fi=Symbol("break visit"),uh=Symbol("skip children"),Ec=Symbol("remove item");function Me(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),Tc(Object.freeze([]),n,e)}Me.BREAK=Fi;Me.SKIP=uh;Me.REMOVE=Ec;Me.itemAtPath=(n,e)=>{let t=n;for(let[r,i]of e){let s=t?.[r];if(s&&"items"in s)t=s.items[i];else return}return t};Me.parentCollection=(n,e)=>{let t=Me.itemAtPath(n,e.slice(0,-1)),r=e[e.length-1][0],i=t?.[r];if(i&&"items"in i)return i;throw new Error("Parent collection not found")};function Tc(n,e,t){let r=t(e,n);if(typeof r=="symbol")return r;for(let i of["key","value"]){let s=e[i];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=Tc(Object.freeze(n.concat([[i,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===Fi)return Fi;a===Ec&&(s.items.splice(o,1),o-=1)}}typeof r=="function"&&i==="key"&&(r=r(e,n))}}return typeof r=="function"?r(e,n):r}_c.visit=Me});var Jn=k(ne=>{"use strict";var Bi=gc(),fh=bc(),ph=Nc(),Ki="\uFEFF",ji="",Xi="",zi="",mh=n=>!!n&&"items"in n,hh=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function gh(n){switch(n){case Ki:return"<BOM>";case ji:return"<DOC>";case Xi:return"<FLOW_END>";case zi:return"<SCALAR>";default:return JSON.stringify(n)}}function yh(n){switch(n){case Ki:return"byte-order-mark";case ji:return"doc-mode";case Xi:return"flow-error-end";case zi:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}ne.createScalarToken=Bi.createScalarToken;ne.resolveAsScalar=Bi.resolveAsScalar;ne.setScalarValue=Bi.setScalarValue;ne.stringify=fh.stringify;ne.visit=ph.visit;ne.BOM=Ki;ne.DOCUMENT=ji;ne.FLOW_END=Xi;ne.SCALAR=zi;ne.isCollection=mh;ne.isScalar=hh;ne.prettyToken=gh;ne.tokenType=yh});var Vi=k(wc=>{"use strict";var Pt=Jn();function ce(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var Sc=new Set("0123456789ABCDEFabcdef"),bh=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),Hn=new Set(",[]{}"),Eh=new Set(` ,[]{}
\r	`),Yi=n=>!n||Eh.has(n),Gi=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let r=this.next??"stream";for(;r&&(t||this.hasChars(1));)r=yield*this.parseNext(r)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let r=0;for(;t===" ";)t=this.buffer[++r+e];if(t==="\r"){let i=this.buffer[r+e+1];if(i===`
`||!i&&!this.atEnd)return e+r+1}return t===`
`||r>=this.indentNext||!t&&!this.atEnd?e+r:-1}if(t==="-"||t==="."){let r=this.buffer.substr(e,3);if((r==="---"||r==="...")&&ce(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===Pt.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,r=e.indexOf("#");for(;r!==-1;){let s=e[r-1];if(s===" "||s==="	"){t=r-1;break}else r=e.indexOf("#",r+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let i=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-i),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield Pt.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ce(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ce(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ce(t)){let r=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=r,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(Yi),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,r=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=r=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let i=this.getLine();if(i===null)return this.setNext("flow");if((r!==-1&&r<this.indentNext&&i[0]!=="#"||r===0&&(i.startsWith("---")||i.startsWith("..."))&&ce(i[3]))&&!(r===this.indentNext-1&&this.flowLevel===1&&(i[0]==="]"||i[0]==="}")))return this.flowLevel=0,yield Pt.FLOW_END,yield*this.parseLineStart();let s=0;for(;i[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),i[s]){case void 0:return"flow";case"#":return yield*this.pushCount(i.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(Yi),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ce(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let r=this.buffer.substring(0,t),i=r.indexOf(`
`,this.pos);if(i!==-1){for(;i!==-1;){let s=this.continueScalar(i+1);if(s===-1)break;i=r.indexOf(`
`,s)}i!==-1&&(t=i-(r[i-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ce(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,r;e:for(let s=this.pos;r=this.buffer[s];++s)switch(r){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!r&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let i=e+1;for(r=this.buffer[i];r===" ";)r=this.buffer[++i];if(r==="	"){for(;r==="	"||r===" "||r==="\r"||r===`
`;)r=this.buffer[++i];e=i-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield Pt.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,r=this.pos-1,i;for(;i=this.buffer[++r];)if(i===":"){let s=this.buffer[r+1];if(ce(s)||e&&Hn.has(s))break;t=r}else if(ce(i)){let s=this.buffer[r+1];if(i==="\r"&&(s===`
`?(r+=1,i=`
`,s=this.buffer[r+1]):t=r),s==="#"||e&&Hn.has(s))break;if(i===`
`){let o=this.continueScalar(r+1);if(o===-1)break;r=Math.max(r,o-2)}}else{if(e&&Hn.has(i))break;t=r}return!i&&!this.atEnd?this.setNext("plain-scalar"):(yield Pt.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let r=this.buffer.slice(this.pos,e);return r?(yield r,this.pos+=r.length,r.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(Yi),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,r=this.charAt(1);if(ce(r)||t&&Hn.has(r)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ce(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(bh.has(t))t=this.buffer[++e];else if(t==="%"&&Sc.has(this.buffer[e+1])&&Sc.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,r;do r=this.buffer[++t];while(r===" "||e&&r==="	");let i=t-this.pos;return i>0&&(yield this.buffer.substr(this.pos,i),this.pos=t),i}*pushUntil(e){let t=this.pos,r=this.buffer[t];for(;!e(r);)r=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};wc.Lexer=Gi});var Hi=k(vc=>{"use strict";var Ji=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,r=this.lineStarts.length;for(;t<r;){let s=t+r>>1;this.lineStarts[s]<e?t=s+1:r=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let i=this.lineStarts[t-1];return{line:t,col:e-i+1}}}};vc.LineCounter=Ji});var Zi=k(Oc=>{"use strict";var Th=Gt("process"),kc=Jn(),_h=Vi();function Re(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function Ac(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function Rc(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function Wn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function tt(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function Zn(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function Lc(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Re(e.start,"explicit-key-ind")&&!Re(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,Rc(e.value)?e.value.end?Zn(e.value.end,e.sep):e.value.end=e.sep:Zn(e.start,e.sep),delete e.sep)}var Wi=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new _h.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let r of this.lexer.lex(e,t))yield*this.next(r);t||(yield*this.end())}*next(e){if(this.source=e,Th.env.LOG_TOKENS&&console.log("|",kc.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=kc.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let r=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:r,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let r=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in r?r.indent:0:t.type==="flow-collection"&&r.type==="document"&&(t.indent=0),t.type==="flow-collection"&&Lc(t),r.type){case"document":r.value=t;break;case"block-scalar":r.props.push(t);break;case"block-map":{let i=r.items[r.items.length-1];if(i.value){r.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(i.sep)i.value=t;else{Object.assign(i,{key:t,sep:[]}),this.onKeyLine=!i.explicitKey;return}break}case"block-seq":{let i=r.items[r.items.length-1];i.value?r.items.push({start:[],value:t}):i.value=t;break}case"flow-collection":{let i=r.items[r.items.length-1];!i||i.value?r.items.push({start:[],key:t,sep:[]}):i.sep?i.value=t:Object.assign(i,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((r.type==="document"||r.type==="block-map"||r.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let i=t.items[t.items.length-1];i&&!i.sep&&!i.value&&i.start.length>0&&Ac(i.start)===-1&&(t.indent===0||i.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(r.type==="document"?r.end=i.start:r.items.push({start:i.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{Ac(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=Wn(this.peek(2)),r=tt(t),i;e.end?(i=e.end,i.push(this.sourceToken),delete e.end):i=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:r,key:e,sep:i}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Zn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let r=!this.onKeyLine&&this.indent===e.indent,i=r&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(i&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":i||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):i||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Re(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(Rc(t.key)&&!Re(t.sep,"newline")){let o=tt(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Re(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=tt(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||i?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Re(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);i||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Re(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else r&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Zn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Re(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let r=this.startBlockValue(e);if(r){this.stack.push(r);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let r;do yield*this.pop(),r=this.peek(1);while(r?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let i=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:i,sep:[]}):t.sep?this.stack.push(i):Object.assign(t,{key:i,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let r=this.startBlockValue(e);r?this.stack.push(r):(yield*this.pop(),yield*this.step())}else{let r=this.peek(2);if(r.type==="block-map"&&(this.type==="map-value-ind"&&r.indent===e.indent||this.type==="newline"&&!r.items[r.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&r.type!=="flow-collection"){let i=Wn(r),s=tt(i);Lc(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=Wn(e),r=tt(t);return r.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=Wn(e),r=tt(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(r=>r.type==="newline"||r.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};Oc.Parser=Wi});var $c=k(qt=>{"use strict";var xc=qi(),Nh=Rt(),Mt=It(),Sh=Pr(),wh=C(),vh=Hi(),Ic=Zi();function Cc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new vh.LineCounter||null,prettyErrors:e}}function kh(n,e={}){let{lineCounter:t,prettyErrors:r}=Cc(e),i=new Ic.Parser(t?.addNewLine),s=new xc.Composer(e),o=Array.from(s.compose(i.parse(n)));if(r&&t)for(let a of o)a.errors.forEach(Mt.prettifyError(n,t)),a.warnings.forEach(Mt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function Dc(n,e={}){let{lineCounter:t,prettyErrors:r}=Cc(e),i=new Ic.Parser(t?.addNewLine),s=new xc.Composer(e),o=null;for(let a of s.compose(i.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new Mt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return r&&t&&(o.errors.forEach(Mt.prettifyError(n,t)),o.warnings.forEach(Mt.prettifyError(n,t))),o}function Ah(n,e,t){let r;typeof e=="function"?r=e:t===void 0&&e&&typeof e=="object"&&(t=e);let i=Dc(n,t);if(!i)return null;if(i.warnings.forEach(s=>Sh.warn(i.options.logLevel,s)),i.errors.length>0){if(i.options.logLevel!=="silent")throw i.errors[0];i.errors=[]}return i.toJS(Object.assign({reviver:r},t))}function Lh(n,e,t){let r=null;if(typeof e=="function"||Array.isArray(e)?r=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let i=Math.round(t);t=i<1?void 0:i>8?{indent:8}:{indent:i}}if(n===void 0){let{keepUndefined:i}=t??e??{};if(!i)return}return wh.isDocument(n)&&!r?n.toString(t):new Nh.Document(n,r,t).toString(t)}qt.parse=Ah;qt.parseAllDocuments=kh;qt.parseDocument=Dc;qt.stringify=Lh});var Ut=k(M=>{"use strict";var Rh=qi(),Oh=Rt(),xh=bi(),Qi=It(),Ih=pt(),Oe=C(),Ch=ve(),Dh=K(),$h=Ae(),Ph=Le(),Mh=Jn(),qh=Vi(),Uh=Hi(),Fh=Zi(),Qn=$c(),Pc=lt();M.Composer=Rh.Composer;M.Document=Oh.Document;M.Schema=xh.Schema;M.YAMLError=Qi.YAMLError;M.YAMLParseError=Qi.YAMLParseError;M.YAMLWarning=Qi.YAMLWarning;M.Alias=Ih.Alias;M.isAlias=Oe.isAlias;M.isCollection=Oe.isCollection;M.isDocument=Oe.isDocument;M.isMap=Oe.isMap;M.isNode=Oe.isNode;M.isPair=Oe.isPair;M.isScalar=Oe.isScalar;M.isSeq=Oe.isSeq;M.Pair=Ch.Pair;M.Scalar=Dh.Scalar;M.YAMLMap=$h.YAMLMap;M.YAMLSeq=Ph.YAMLSeq;M.CST=Mh;M.Lexer=qh.Lexer;M.LineCounter=Uh.LineCounter;M.Parser=Fh.Parser;M.parse=Qn.parse;M.parseAllDocuments=Qn.parseAllDocuments;M.parseDocument=Qn.parseDocument;M.stringify=Qn.stringify;M.visit=Pc.visit;M.visitAsync=Pc.visitAsync});import{closeSync as Cy,existsSync as zt,fsyncSync as Dy,mkdirSync as $y,openSync as Py,readFileSync as Fl,readdirSync as My,renameSync as Ml,rmSync as bs,statSync as Bl,writeFileSync as qy}from"node:fs";import{createHash as Uy,randomUUID as ql}from"node:crypto";import{dirname as Xt,join as H,resolve as de}from"node:path";import{spawnSync as Fy}from"node:child_process";import{DatabaseSync as Kl}from"node:sqlite";import{createHash as Dd}from"node:crypto";function ct(n,e){return n<e?-1:n>e?1:0}function F(n){return(e,t)=>ct(n(e),n(t))}var Jt=10,Rs=2,Os="0.8.0";function Y(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,r])=>r!==void 0).sort(([r],[i])=>ct(r,i)).map(([r,i])=>[r,e(i)])):t;return JSON.stringify(e(n))}function me(n){return Dd("sha256").update(Y(n)).digest("hex")}function xs(n){return me({projectRoot:n}).slice(0,24)}function Is(n){let{zephyrRoot:e,projectRoot:t,producer:r,...i}=n;return me(i)}var Cs=Jt,Ds=`
PRAGMA journal_mode = OFF;
PRAGMA synchronous = OFF;
PRAGMA temp_store = MEMORY;

CREATE TABLE meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Interned strings. Devicetree property descriptions are inherited through
-- include chains, so the same text is attached to thousands of bindings:
-- 20.7 MB of description text across 119 718 properties is only 0.8 MB of
-- distinct strings. Storing them once cuts roughly a quarter off the index.
CREATE TABLE text_pool (
  id   INTEGER PRIMARY KEY,
  text TEXT NOT NULL
);

-- ---------------------------------------------------------------- docs -----
CREATE TABLE doc (
  id     INTEGER PRIMARY KEY,
  path   TEXT NOT NULL UNIQUE,
  url    TEXT NOT NULL,
  title  TEXT NOT NULL,
  area   TEXT NOT NULL,
  labels TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX doc_area_idx ON doc(area);

CREATE TABLE doc_chunk (
  id           INTEGER PRIMARY KEY,
  doc_id       INTEGER NOT NULL REFERENCES doc(id),
  anchor       TEXT,
  heading      TEXT NOT NULL DEFAULT '',
  heading_path TEXT NOT NULL DEFAULT '',
  ord          INTEGER NOT NULL DEFAULT 0,
  title        TEXT NOT NULL DEFAULT '',
  body         TEXT NOT NULL DEFAULT ''
);
CREATE INDEX doc_chunk_doc_idx ON doc_chunk(doc_id, ord);

CREATE TABLE doc_origin (
  id         INTEGER PRIMARY KEY,
  doc_id     INTEGER NOT NULL REFERENCES doc(id),
  path       TEXT NOT NULL,
  start_line INTEGER NOT NULL,
  end_line   INTEGER NOT NULL,
  directive  TEXT NOT NULL
);
CREATE INDEX doc_origin_doc_idx ON doc_origin(doc_id);

CREATE VIRTUAL TABLE doc_fts USING fts5(
  title, heading_path, body,
  content='doc_chunk', content_rowid='id',
  tokenize='porter unicode61 remove_diacritics 2'
);

-- ------------------------------------------------------------- kconfig -----
-- A symbol is identified by name *and* namespace. The application tree and the
-- sysbuild tree share 2876 of their 2909 symbol names while meaning different
-- things by some of them, so a bare name is not an identity here.
CREATE TABLE kconfig (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  scope      TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild')),
  type       TEXT,
  prompt     TEXT NOT NULL DEFAULT '',
  help       TEXT NOT NULL DEFAULT '',
  defaults   TEXT NOT NULL DEFAULT '[]',
  depends    TEXT NOT NULL DEFAULT '[]',
  selects    TEXT NOT NULL DEFAULT '[]',
  implies    TEXT NOT NULL DEFAULT '[]',
  ranges     TEXT NOT NULL DEFAULT '[]',
  defined_in TEXT NOT NULL DEFAULT '[]',
  menu_path  TEXT NOT NULL DEFAULT '',
  is_choice  INTEGER NOT NULL DEFAULT 0,
  choice     TEXT,
  n_defs     INTEGER NOT NULL DEFAULT 1,
  has_prompt INTEGER NOT NULL DEFAULT 0,
  UNIQUE(name, scope)
);
CREATE INDEX kconfig_scope_idx ON kconfig(scope);

-- Semantic Kconfig graph exported by the target tree's own Kconfiglib. The
-- legacy JSON columns above are a denormalised search/read projection only.
-- Symbols reachable only once an SoC is selected. Zephyr sources a series'
-- Kconfig from inside a conditional on that series, so a catalogue index -- which
-- has selected no SoC -- cannot see them, while Kconfig.soc next door is sourced
-- unconditionally and is fully indexed. That asymmetry is why the catalogue knows
-- SOC_STM32N657XX and cannot resolve STM32N6_BOOT_SERIAL, the symbol that board's
-- flash arguments are guarded on.
--
-- These come from the fallback parser rather than the tree's own Kconfiglib, so
-- they carry a declaration and not an evaluated dependency graph. The separate
-- table is what keeps the weaker claim from being read as the stronger one.
CREATE TABLE soc_kconfig (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  series TEXT NOT NULL,
  file   TEXT NOT NULL,
  line   INTEGER NOT NULL DEFAULT 0,
  type   TEXT NOT NULL DEFAULT '',
  prompt TEXT NOT NULL DEFAULT '',
  help   TEXT NOT NULL DEFAULT '',
  UNIQUE(name, series)
);
CREATE INDEX soc_kconfig_name_idx ON soc_kconfig(name);

-- What one build actually resolved to, layered over the catalogue rather than
-- replacing it. The catalogue says what a symbol is and what it depends on; this
-- says what it came out as, for one board, one application, one moment.
CREATE TABLE resolved_config (
  id    INTEGER PRIMARY KEY,
  name  TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  -- 0 records an explicitly unset symbol, which is a resolved value and not an
  -- absence: "I set this and it did not take" is unanswerable without it.
  is_set INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE resolved_node (
  id         INTEGER PRIMARY KEY,
  path       TEXT NOT NULL,
  label      TEXT NOT NULL DEFAULT '',
  compatible TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT ''
);
CREATE INDEX resolved_node_path_idx ON resolved_node(path);
CREATE INDEX resolved_node_label_idx ON resolved_node(label);

CREATE TABLE kconfig_expr (
  id       INTEGER PRIMARY KEY,
  kind     TEXT NOT NULL,
  value    TEXT,
  display  TEXT NOT NULL,
  left_id  INTEGER REFERENCES kconfig_expr(id),
  right_id INTEGER REFERENCES kconfig_expr(id)
);

CREATE TABLE kconfig_definition (
  id                    INTEGER PRIMARY KEY,
  symbol_id             INTEGER NOT NULL REFERENCES kconfig(id),
  file                  TEXT NOT NULL,
  line                  INTEGER NOT NULL,
  prompt                TEXT,
  menu_path             TEXT NOT NULL DEFAULT '[]',
  condition_expr_id     INTEGER REFERENCES kconfig_expr(id),
  prompt_condition_id   INTEGER REFERENCES kconfig_expr(id),
  is_menuconfig         INTEGER NOT NULL DEFAULT 0,
  is_configdefault      INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX kconfig_definition_symbol_idx ON kconfig_definition(symbol_id);

CREATE TABLE kconfig_default (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  value_expr_id     INTEGER NOT NULL REFERENCES kconfig_expr(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);
CREATE INDEX kconfig_default_definition_idx ON kconfig_default(definition_id, ord);

CREATE TABLE kconfig_relation (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  kind              TEXT NOT NULL CHECK(kind IN ('select', 'imply')),
  target_name       TEXT NOT NULL,
  target_symbol_id  INTEGER REFERENCES kconfig(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);
CREATE INDEX kconfig_relation_target_idx ON kconfig_relation(target_name, kind);

CREATE TABLE kconfig_range (
  id                INTEGER PRIMARY KEY,
  definition_id     INTEGER NOT NULL REFERENCES kconfig_definition(id),
  low_expr_id       INTEGER NOT NULL REFERENCES kconfig_expr(id),
  high_expr_id      INTEGER NOT NULL REFERENCES kconfig_expr(id),
  condition_expr_id INTEGER REFERENCES kconfig_expr(id),
  ord               INTEGER NOT NULL
);

CREATE TABLE kconfig_choice (
  id                INTEGER PRIMARY KEY,
  stable_id         TEXT NOT NULL,
  scope             TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild')),
  name              TEXT,
  type              TEXT,
  definitions       TEXT NOT NULL DEFAULT '[]',
  -- A named choice yields its own name as the stable id, and BOOTLOADER exists
  -- in both trees, so the namespace is part of the identity here too.
  UNIQUE(stable_id, scope)
);

CREATE TABLE kconfig_choice_member (
  choice_id INTEGER NOT NULL REFERENCES kconfig_choice(id),
  symbol_id INTEGER NOT NULL REFERENCES kconfig(id),
  PRIMARY KEY(choice_id, symbol_id)
);

-- Reverse dependency graph: answers "what turns this symbol on?", which is the
-- question you actually have when a config silently fails to take effect.
CREATE TABLE kconfig_edge (
  from_sym TEXT NOT NULL,
  to_sym   TEXT NOT NULL,
  kind     TEXT NOT NULL,
  -- Edges join symbols by name, so they must not cross a namespace boundary.
  scope    TEXT NOT NULL DEFAULT 'zephyr' CHECK(scope IN ('zephyr', 'sysbuild'))
);
CREATE INDEX kconfig_edge_to_idx ON kconfig_edge(to_sym, kind, scope);
CREATE INDEX kconfig_edge_from_idx ON kconfig_edge(from_sym, kind, scope);

CREATE VIRTUAL TABLE kconfig_fts USING fts5(
  name, prompt, help,
  content='kconfig', content_rowid='id',
  tokenize='unicode61 tokenchars ''_'''
);

-- -------------------------------------------------------- dt bindings ------
CREATE TABLE dt_binding (
  id          INTEGER PRIMARY KEY,
  compatible  TEXT NOT NULL,
  path        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  bus         TEXT,
  on_bus      TEXT,
  cells       TEXT NOT NULL DEFAULT '{}',
  includes    TEXT NOT NULL DEFAULT '[]',
  prop_names  TEXT NOT NULL DEFAULT '',
  n_props     INTEGER NOT NULL DEFAULT 0,
  vendor      TEXT
);
CREATE INDEX dt_binding_compat_idx ON dt_binding(compatible);
CREATE INDEX dt_binding_vendor_idx ON dt_binding(vendor);

CREATE TABLE dt_property (
  id              INTEGER PRIMARY KEY,
  binding_id      INTEGER NOT NULL REFERENCES dt_binding(id),
  child_level     INTEGER NOT NULL DEFAULT 0,
  name            TEXT NOT NULL,
  type            TEXT,
  required        INTEGER NOT NULL DEFAULT 0,
  description_id  INTEGER REFERENCES text_pool(id),
  default_value   TEXT,
  enum_values     TEXT,
  const_value     TEXT,
  deprecated      INTEGER NOT NULL DEFAULT 0,
  specifier_space TEXT,
  inherited_from  TEXT,
  provenance      TEXT NOT NULL DEFAULT '{}',
  constraints     TEXT NOT NULL DEFAULT '{}',
  child_path      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX dt_property_binding_idx ON dt_property(binding_id, child_level);
CREATE INDEX dt_property_name_idx ON dt_property(name);

-- Hides the interning from every consumer: query this, not dt_property.
-- Where the tree *uses* a compatible, as against where it declares one. A
-- binding cannot say whether a driver fits your silicon; the set of boards and
-- SoC devicetree files upstream instantiates it on is the strongest signal that
-- exists, and answering it by grepping a vendor header costs a dozen calls.
CREATE TABLE dt_instance (
  id         INTEGER PRIMARY KEY,
  compatible TEXT NOT NULL,
  file       TEXT NOT NULL,
  -- Empty when the file is SoC or shared devicetree rather than a board's.
  board      TEXT NOT NULL DEFAULT ''
);
CREATE INDEX dt_instance_compatible_idx ON dt_instance(compatible);
CREATE INDEX dt_instance_board_idx ON dt_instance(board);

CREATE VIEW dt_property_v AS
  SELECT p.id, p.binding_id, p.child_level, p.name, p.type, p.required,
         COALESCE(t.text, '') AS description,
         p.default_value, p.enum_values, p.const_value, p.deprecated,
         p.specifier_space, p.inherited_from, p.provenance, p.constraints,
         p.child_path
  FROM dt_property p
  LEFT JOIN text_pool t ON t.id = p.description_id;

CREATE VIRTUAL TABLE dt_fts USING fts5(
  compatible, description, prop_names,
  content='dt_binding', content_rowid='id',
  tokenize='unicode61 tokenchars ''_,-'''
);

-- -------------------------------------------------------------- boards -----
CREATE TABLE board (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  full_name        TEXT NOT NULL DEFAULT '',
  vendor           TEXT NOT NULL DEFAULT '',
  dir              TEXT NOT NULL,
  arch             TEXT,
  ram              INTEGER,
  flash            INTEGER,
  socs             TEXT NOT NULL DEFAULT '[]',
  socs_text        TEXT NOT NULL DEFAULT '',
  targets          TEXT NOT NULL DEFAULT '[]',
  targets_text     TEXT NOT NULL DEFAULT '',
  revisions        TEXT NOT NULL DEFAULT '[]',
  default_revision TEXT,
  supported        TEXT NOT NULL DEFAULT '[]',
  supported_text   TEXT NOT NULL DEFAULT '',
  doc_path         TEXT,
  -- Build targets whose _defconfig sets CONFIG_XIP=n. ram and flash above
  -- are Twister metadata, not a memory budget, and on a target that does not
  -- execute in place the flash figure describes no internal part at all.
  no_xip_targets   TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX board_vendor_idx ON board(vendor);
CREATE INDEX board_arch_idx ON board(arch);

CREATE TABLE soc (
  id          INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  series      TEXT,
  family      TEXT,
  vendor      TEXT,
  dir         TEXT NOT NULL,
  cpuclusters TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX soc_name_idx ON soc(name);
CREATE INDEX soc_series_idx ON soc(series);

CREATE VIRTUAL TABLE board_fts USING fts5(
  name, full_name, vendor, socs_text, supported_text, targets_text,
  content='board', content_rowid='id',
  tokenize='unicode61 tokenchars ''_-/'''
);

-- ---------------------------------------------------------------- west ------
-- The runner catalogue comes from the tree's own runner classes, so capabilities
-- are whatever this Zephyr implements rather than whatever a table once said.
CREATE TABLE runner (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  module       TEXT NOT NULL,
  description  TEXT,
  -- The RunnerCaps dataclass, verbatim. Held whole because Zephyr adds fields to
  -- it between releases and a fixed column set would silently drop the new ones.
  capabilities TEXT NOT NULL DEFAULT '{}',
  commands     TEXT NOT NULL DEFAULT '[]'
);

CREATE TABLE board_runner (
  id            INTEGER PRIMARY KEY,
  board_id      INTEGER NOT NULL REFERENCES board(id),
  runner        TEXT NOT NULL,
  -- Registered on ZEPHYR_RUNNERS by board_finalize_runner_args. A row can exist
  -- without this: upstream names a debug default it never registers on some boards.
  available     INTEGER NOT NULL DEFAULT 0,
  flash_default INTEGER NOT NULL DEFAULT 0,
  debug_default INTEGER NOT NULL DEFAULT 0,
  args          TEXT NOT NULL DEFAULT '[]',
  declared_in   TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX board_runner_board_idx ON board_runner(board_id);
CREATE INDEX board_runner_runner_idx ON board_runner(runner);

CREATE TABLE west_command (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
  class_name TEXT NOT NULL DEFAULT '',
  file       TEXT NOT NULL DEFAULT '',
  help       TEXT
);

-- The modules the manifest declares, and how much of each this index actually
-- read. Two questions depend on the distinction and both were answered wrongly
-- without it.
--
-- Zephyr keeps in-tree glue for many modules under modules/, and the shape of
-- the path says who owns the symbols. modules/Kconfig.stm32 is upstream's own
-- file: it declares USE_STM32_HAL_* outright and hal_stm32 ships no Kconfig at
-- all, so nothing outside the tree can ever give those symbols a prompt.
-- modules/lvgl/Kconfig is a directory named after the lvgl module, and it
-- mirrors symbols that the module's own Kconfig declares *with* prompts. Reading
-- only the tree, the mirror looks promptless and an assignment to it looks like
-- an error \u2014 which is why glue_dir is stored per module rather than guessed
-- from the modules/ prefix, and why kconfig_ingested records whether the
-- module's own Kconfig was actually read.
CREATE TABLE west_module (
  id               INTEGER PRIMARY KEY,
  name             TEXT NOT NULL UNIQUE,
  -- Workspace-relative, as the manifest declares it: modules/hal/stm32.
  path             TEXT NOT NULL DEFAULT '',
  revision         TEXT NOT NULL DEFAULT '',
  -- The single path segment Zephyr's in-tree glue uses for this module, when it
  -- has one: modules/<glue_dir>/Kconfig. Empty when the tree carries no glue
  -- directory for it.
  glue_dir         TEXT NOT NULL DEFAULT '',
  -- 1 when this index evaluated the module's own Kconfig, so prompt status for
  -- its symbols is settled rather than a mirror of it.
  kconfig_ingested INTEGER NOT NULL DEFAULT 0,
  -- 1 when get_source can read files from this module's tree.
  source_ingested  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX west_module_glue_idx ON west_module(glue_dir);

-- ------------------------------------------------------------- samples -----
-- Samples and Twister test suites share one table because upstream validates
-- sample.yaml and testcase.yaml against a single schema; kind keeps them
-- separable for callers who want one or the other.
CREATE TABLE sample (
  id                    INTEGER PRIMARY KEY,
  path                  TEXT NOT NULL UNIQUE,
  kind                  TEXT NOT NULL DEFAULT 'sample' CHECK(kind IN ('sample', 'test')),
  name                  TEXT NOT NULL DEFAULT '',
  description           TEXT NOT NULL DEFAULT '',
  tags                  TEXT NOT NULL DEFAULT '[]',
  tags_text             TEXT NOT NULL DEFAULT '',
  scenarios             TEXT NOT NULL DEFAULT '[]',
  depends_on            TEXT NOT NULL DEFAULT '[]',
  integration_platforms TEXT NOT NULL DEFAULT '[]',
  platform_allow        TEXT NOT NULL DEFAULT '[]',
  files                 TEXT NOT NULL DEFAULT '[]',
  doc_path              TEXT
);
CREATE INDEX sample_kind_idx ON sample(kind);

-- Contents of a sample's small, high-value files (prj.conf, overlays, sources),
-- so the server can hand back a working configuration without needing a
-- Zephyr checkout on the user's machine.
CREATE TABLE sample_file (
  id        INTEGER PRIMARY KEY,
  sample_id INTEGER NOT NULL REFERENCES sample(id),
  path      TEXT NOT NULL,
  text      TEXT NOT NULL
);
CREATE INDEX sample_file_sample_idx ON sample_file(sample_id, path);

CREATE TABLE sample_platform (
  sample_id INTEGER NOT NULL REFERENCES sample(id),
  platform  TEXT NOT NULL,
  evidence  TEXT NOT NULL CHECK(evidence IN ('integration', 'allowlist')),
  PRIMARY KEY(sample_id, platform, evidence)
);
CREATE INDEX sample_platform_lookup_idx ON sample_platform(platform, evidence);

CREATE VIRTUAL TABLE sample_fts USING fts5(
  name, path, description, tags_text,
  content='sample', content_rowid='id',
  tokenize='porter unicode61 tokenchars ''_-/'''
);

-- ----------------------------------------------------------------- api -----
CREATE TABLE api_symbol (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  kind       TEXT NOT NULL,
  signature  TEXT NOT NULL DEFAULT '',
  brief      TEXT NOT NULL DEFAULT '',
  detail     TEXT NOT NULL DEFAULT '',
  params     TEXT NOT NULL DEFAULT '[]',
  returns    TEXT NOT NULL DEFAULT '[]',
  retvals    TEXT NOT NULL DEFAULT '[]',
  api_group  TEXT,
  since      TEXT,
  deprecated INTEGER NOT NULL DEFAULT 0,
  header     TEXT NOT NULL,
  line       INTEGER NOT NULL DEFAULT 0,
  doxygen_id TEXT,
  compound_id TEXT,
  doc_anchor TEXT,
  -- The owning symbol's name: for an enumvalue, its enum. compound_id cannot
  -- serve this. In Doxygen XML it names the containing group or file, which
  -- every sibling symbol in that compound shares.
  parent_symbol TEXT
);
CREATE INDEX api_symbol_name_idx ON api_symbol(name);
CREATE INDEX api_symbol_parent_idx ON api_symbol(parent_symbol, header);
CREATE INDEX api_symbol_doxygen_idx ON api_symbol(doxygen_id);
CREATE INDEX api_symbol_group_idx ON api_symbol(api_group);
CREATE INDEX api_symbol_header_idx ON api_symbol(header);

CREATE TABLE api_group (
  id     INTEGER PRIMARY KEY,
  gid    TEXT NOT NULL UNIQUE,
  title  TEXT NOT NULL DEFAULT '',
  parent TEXT,
  header TEXT NOT NULL DEFAULT ''
);

CREATE VIRTUAL TABLE api_fts USING fts5(
  name, brief, detail,
  content='api_symbol', content_rowid='id',
  tokenize='unicode61 tokenchars ''_'''
);
`,$s=`
INSERT INTO doc_fts(rowid, title, heading_path, body)
  SELECT id, title, heading_path, body FROM doc_chunk;
INSERT INTO kconfig_fts(rowid, name, prompt, help)
  SELECT id, name, prompt, help FROM kconfig;
INSERT INTO dt_fts(rowid, compatible, description, prop_names)
  SELECT id, compatible, description, prop_names FROM dt_binding;
INSERT INTO board_fts(rowid, name, full_name, vendor, socs_text, supported_text, targets_text)
  SELECT id, name, full_name, vendor, socs_text, supported_text, targets_text FROM board;
INSERT INTO sample_fts(rowid, name, path, description, tags_text)
  SELECT id, name, path, description, tags_text FROM sample;
INSERT INTO api_fts(rowid, name, brief, detail)
  SELECT id, name, brief, detail FROM api_symbol;

INSERT INTO doc_fts(doc_fts)         VALUES('optimize');
INSERT INTO kconfig_fts(kconfig_fts) VALUES('optimize');
INSERT INTO dt_fts(dt_fts)           VALUES('optimize');
INSERT INTO board_fts(board_fts)     VALUES('optimize');
INSERT INTO sample_fts(sample_fts)   VALUES('optimize');
INSERT INTO api_fts(api_fts)         VALUES('optimize');
`;import{existsSync as Ks,mkdtempSync as Qd,realpathSync as eu,rmSync as tu,writeFileSync as nu}from"node:fs";import{tmpdir as ru}from"node:os";import{join as Qt,resolve as br}from"node:path";import{spawnSync as iu}from"node:child_process";var Ht=`#!/usr/bin/env python3
"""Export Doxygen XML into stable, typed Zephyr public-API records.

Only Python's standard library is used. Doxygen owns C parsing; this adapter
only maps its XML model into the index contract.
"""

import argparse
import json
import os
import sys
import xml.etree.ElementTree as ET


KINDS = {"function", "define", "typedef", "enum", "variable"}
KIND_MAP = {"define": "macro", "variable": "variable"}


def text(node):
    if node is None:
        return ""
    return " ".join("".join(node.itertext()).split())


def location(member, compound):
    loc = member.find("location")
    compound_loc = compound.find("location")
    path = (loc.get("file") if loc is not None else None) or (
        compound_loc.get("file") if compound_loc is not None else ""
    )
    try:
        line = int((loc.get("line") if loc is not None else "0") or "0")
    except ValueError:
        line = 0
    return path.replace(os.sep, "/"), line


def description(member, kind):
    return text(member.find(kind))


def parameter_docs(member):
    by_name = {}
    for item in member.findall(".//parameterlist[@kind='param']/parameteritem"):
        desc = text(item.find("parameterdescription"))
        for name_node in item.findall("./parameternamelist/parametername"):
            name = text(name_node)
            if name:
                record = {"name": name, "description": desc}
                direction = name_node.get("direction")
                if direction:
                    record["direction"] = direction
                by_name[name] = record

    result = []
    for param in member.findall("param"):
        name = text(param.find("declname")) or text(param.find("defname"))
        record = by_name.get(name, {"name": name, "description": ""})
        record["type"] = text(param.find("type"))
        result.append(record)
    return result


def simple_sections(member, kind):
    return [text(node) for node in member.findall(".//simplesect[@kind='%s']" % kind) if text(node)]


def signatures(member, kind, name):
    definition = text(member.find("definition"))
    args = text(member.find("argsstring"))
    if kind == "define":
        params = [text(node.find("defname")) for node in member.findall("param")]
        suffix = "(%s)" % ", ".join(params) if params else ""
        initializer = text(member.find("initializer"))
        return "#define %s%s%s" % (name, suffix, (" " + initializer) if initializer else "")
    return (definition + (" " + args if args else "")).strip()


def member_record(member, compound, compound_id, compound_kind, group=None):
    kind = member.get("kind", "")
    name = text(member.find("name"))
    header, line = location(member, compound)
    member_id = member.get("id", "")
    ingroup = member.find("ingroup")
    api_group = ingroup.get("refid") if ingroup is not None else group
    detail = description(member, "detaileddescription")
    xref_titles = [text(node).lower() for node in member.findall(".//xrefsect/xreftitle")]
    since = simple_sections(member, "version")
    record = {
        "name": name,
        "kind": KIND_MAP.get(kind, kind),
        "signature": signatures(member, kind, name),
        "brief": description(member, "briefdescription"),
        "detail": detail,
        "params": parameter_docs(member),
        "returns": simple_sections(member, "return"),
        "retvals": [],
        "group": api_group,
        "since": since[0] if since else None,
        "deprecated": any("deprecated" in title for title in xref_titles),
        "header": header,
        "line": line,
        "doxygenId": member_id,
        "compoundId": compound_id,
        "docAnchor": "%s.html#%s" % (compound_id, member_id) if member_id else "%s.html" % compound_id,
        "parentSymbol": None,
    }
    for item in member.findall(".//parameterlist[@kind='retval']/parameteritem"):
        desc = text(item.find("parameterdescription"))
        for value in item.findall("./parameternamelist/parametername"):
            record["retvals"].append({"value": text(value), "description": desc})
    return record


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--xml", required=True)
    args = parser.parse_args()
    index_path = os.path.join(args.xml, "index.xml")
    if not os.path.isfile(index_path):
        raise RuntimeError("Doxygen XML directory has no index.xml: %s" % args.xml)

    index = ET.parse(index_path).getroot()
    # Sorted, because index.xml lists compounds in Doxygen's own traversal order.
    # The merge above resolves a member seen twice, so the order compounds are
    # visited decides which record is kept and which is merged into it.
    compound_refs = sorted(
        (c.get("refid", ""), c.get("kind", "")) for c in index.findall("compound")
    )
    symbols_by_id = {}
    groups = []
    group_parents = {}
    discovered = 0
    excluded = []
    excluded_ids = set()
    errors = []

    def add_symbol(record):
        nonlocal discovered
        stable_id = record.get("doxygenId") or "{}:{}:{}:{}".format(
            record.get("compoundId", ""), record.get("kind", ""),
            record.get("name", ""), record.get("line", 0)
        )
        previous = symbols_by_id.get(stable_id)
        if previous is None:
            symbols_by_id[stable_id] = record
            discovered += 1
            return
        # The same Doxygen member can be referenced by file and group
        # compounds. Keep one stable record and prefer its group/richer prose.
        if not previous.get("group") and record.get("group"):
            previous["group"] = record["group"]
        for field in ("brief", "detail"):
            candidate, held = record.get(field, ""), previous.get(field, "")
            # Longest wins, and equal lengths break lexicographically rather than
            # by which compound Doxygen happened to emit first. Whichever member
            # of a tie is kept must not depend on traversal, because the file and
            # group compounds that carry the same member are visited in index.xml
            # order and that order is not the same on every machine.
            if len(candidate) > len(held) or (len(candidate) == len(held) and candidate < held):
                previous[field] = candidate

    for compound_id, indexed_kind in compound_refs:
        source = os.path.join(args.xml, compound_id + ".xml")
        # Reported relative to the XML directory. The absolute path is this
        # machine's Doxygen output directory, and writing it into the index makes
        # two machines' reports differ for a reason that has nothing to do with
        # the catalogue -- and puts a home directory in a file users may share.
        reported = compound_id + ".xml"
        if not os.path.isfile(source):
            discovered += 1
            errors.append({"path": reported, "code": "missing-compound", "message": "Referenced by index.xml"})
            continue
        root = ET.parse(source).getroot()
        compound = root.find("compounddef")
        if compound is None:
            discovered += 1
            errors.append({"path": reported, "code": "missing-compounddef", "message": "No compounddef element"})
            continue
        compound_kind = compound.get("kind", indexed_kind)
        compound_name = text(compound.find("compoundname"))
        group = compound_id if compound_kind == "group" else None
        if compound_kind == "group":
            header, _line = location(compound, compound)
            groups.append({
                "id": compound_id,
                "title": text(compound.find("title")) or compound_name,
                "parent": None,
                "header": header,
                "doxygenId": compound_id,
                "docAnchor": compound_id + ".html",
            })
            for child in compound.findall("innergroup"):
                if child.get("refid"):
                    group_parents[child.get("refid")] = compound_id

        # Structs and unions are public symbols in their own right.
        if compound_kind in ("struct", "union"):
            header, line = location(compound, compound)
            brief = description(compound, "briefdescription")
            detail = description(compound, "detaileddescription")
            add_symbol({
                "name": compound_name.split("::")[-1], "kind": compound_kind,
                "signature": compound_kind + " " + compound_name,
                "brief": brief, "detail": detail, "params": [], "returns": [], "retvals": [],
                "group": None, "since": None, "deprecated": False, "header": header, "line": line,
                "doxygenId": compound_id, "compoundId": compound_id, "docAnchor": compound_id + ".html",
            })

        for member in compound.findall(".//memberdef"):
            kind = member.get("kind", "")
            if kind not in KINDS:
                exclusion_id = member.get("id", "") or reported + ":" + kind
                if exclusion_id not in excluded_ids:
                    excluded_ids.add(exclusion_id)
                    discovered += 1
                    excluded.append({
                        "id": exclusion_id,
                        "path": reported,
                        "reason": "unsupported-doxygen-kind:" + (kind or "unknown"),
                    })
                continue
            record = member_record(member, compound, compound_id, compound_kind, group)
            if not record["name"]:
                # Anonymous unions and structs are ordinary C11 and appear across
                # the tree (for example the anonymous union in acpi_reg_base).
                # They carry no name to look up, so they are excluded by rule
                # rather than reported as a defect in the source.
                discovered += 1
                excluded.append({"path": reported, "reason": "unnamed-member"})
                continue
            add_symbol(record)
            if kind == "enum":
                for enum_value in member.findall("enumvalue"):
                    enum_record = member_record(enum_value, compound, compound_id, compound_kind, group)
                    enum_record["kind"] = "enumvalue"
                    # \`compoundId\` is the containing group or file, shared with
                    # every sibling, so the owning enum is recorded by name.
                    enum_record["parentSymbol"] = record["name"]
                    # An <enumvalue> carries no <location>, so it would inherit
                    # the compound's \u2014 empty for a group. The member is declared
                    # inside its enum, making the enum's file the true answer
                    # and its line the closest available one.
                    enum_record["header"] = record["header"]
                    enum_record["line"] = record["line"]
                    initializer = text(enum_value.find("initializer"))
                    enum_record["signature"] = (
                        "%s %s" % (enum_record["name"], initializer)
                        if initializer
                        else enum_record["name"]
                    )
                    add_symbol(enum_record)

    for group in groups:
        group["parent"] = group_parents.get(group["id"])

    symbols = list(symbols_by_id.values())
    # Groups are first-class indexed records, so source accounting includes
    # them in the same way as symbols. Errors and exclusions already increment
    # \`\`discovered\`\` at the point where their candidate is encountered.
    discovered_with_groups = discovered + len(groups)
    indexed_with_groups = len(symbols) + len(groups)
    for item in excluded:
        item.pop("id", None)

    if errors:
        print(json.dumps({"report": {"discovered": discovered_with_groups, "indexed": indexed_with_groups,
            "intentionallyExcluded": excluded, "warnings": [], "errors": errors}}))
        return 2
    print(json.dumps({
        "symbols": symbols,
        "groups": groups,
        "mode": "doxygen-xml",
        "report": {"discovered": discovered_with_groups, "indexed": indexed_with_groups,
                   "intentionallyExcluded": excluded, "warnings": [], "errors": []},
    }, separators=(",", ":")))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:
        print("api-export: %s" % exc, file=sys.stderr)
        sys.exit(2)
`;function Ps(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function Ms(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),r=[],i={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(i.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=i.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:r.push(a)}};for(let o of t){let a=o.trim();if(a===""){i.kind==="brief"?i={kind:"detail"}:i.kind==="detail"&&r.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",u=""]=c,f=l.toLowerCase(),d=u.trim();switch(f){case"brief":case"short":i={kind:"brief"},s(d);break;case"param":{let m=d.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let h={name:m[2],description:(m[3]??"").trim()};m[1]&&(h.direction=m[1].replace(/\s+/g,"")),e.params.push(h),i={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(d),i={kind:"return",index:e.returns.length-1};break;case"retval":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),i={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),i={kind:"detail"};break}case"addtogroup":e.addtogroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"ingroup":e.ingroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"since":e.since=d,i={kind:"detail"};break;case"deprecated":e.deprecated=!0,i={kind:"detail"},s(d);break;case"note":case"warning":case"details":case"remark":i={kind:"detail"},s(`${l.toUpperCase()}: ${d}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":i={kind:"detail"};break;default:i={kind:"detail"},s(d);break}}e.detail=r.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=je(e.brief)),e.detail=je(e.detail),e.returns=e.returns.map(je);for(let o of e.params)o.description=je(o.description);for(let o of e.retvals)o.description=je(o.description);return e}function je(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function Pd(n){let e=[];for(let t of n.split(`
`)){let r=t.trim(),i=r.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(i){e.push({kind:"define",id:i[1],title:(i[2]??"").trim()});continue}let s=r.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of r.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Xe(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var Md=["z_impl_"];function qd(n){for(let e of Md)if(n.startsWith(e))return n.slice(e.length);return n}var Ud=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,Fd=new RegExp(String.raw`^(struct|union|enum)\s+${Ud}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),Bd=/^[^(]*\(\s*\*/;function Kd(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Xe(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let r=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(r)return{kind:"typedef",name:r[1],signature:Xe(e)};let i=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(i)return{kind:"typedef",name:i[1],signature:Xe(e)};let s=e.match(Fd);if(s)return{kind:s[1],name:s[2],signature:Xe(e.replace(/\{[\s\S]*$/,"").trim())};if(Bd.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:qd(a),signature:Xe(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function jd(n,e){let t=0,r=!1,i=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(i){l==="*"&&a[c+1]==="/"&&(i=!1,c++);continue}if(l==="/"&&a[c+1]==="*")i=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,r=!0):l==="}"&&t--}}if(r&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),u=c.lastIndexOf("}");return l<0||u<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,u),line:e,endLine:o}}}return null}function Xd(n,e){let t=n.split(`
`).map(p=>/^\s*#/.test(p)?"":p).join(`
`),r=[],i="",s=[],o=[],a=[],c=0,l=e,u=e,f=()=>{r.push({code:i,before:s,trailingPrevious:o,trailingOwn:a,line:u}),i="",s=[],o=[],a=[]};for(let p=0;p<t.length;p++){let y=t[p];if(y===`
`){l++,i+=" ";continue}if(y==="/"&&t[p+1]==="*"){let b=t.indexOf("*/",p+2),T=b<0?t.length:b+2,_=t.slice(p,T);/^\/\*[*!]</.test(_)?(i.trim()?a:o).push(_):/^\/\*[*!]/.test(_)&&s.push(_);for(let w of _)w===`
`&&l++;p=T-1;continue}if(y==="/"&&t[p+1]==="/"){let b=t.indexOf(`
`,p);p=(b<0?t.length:b)-1;continue}if(y==="("||y==="[")c++;else if(y===")"||y==="]")c--;else if(y===","&&c<=0){f();continue}!i.trim()&&y.trim()&&(u=l),i+=y}f();let d=p=>Ps(p.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],h=(p,y)=>{p&&y&&!p.brief&&(p.brief=je(d(y)))};for(let p of r){h(m[m.length-1],p.trailingPrevious[0]);let y=p.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!y)continue;let b=p.before[p.before.length-1],T=b?Ms(d(b)):void 0,_=T?.brief??T?.detail??"",w={name:y[1],value:Xe(y[2]??""),brief:_,detail:T?.brief?T.detail??"":"",line:p.line};m.push(w),h(w,p.trailingOwn[0])}return m}function zd(n,e){let t=e,r=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||r.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let i=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];i.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:i.join(`
`),line:t}}function qs(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=[],i=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,u=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){u=!0;break}if(!u)continue;let f=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),d={text:Ps(f),endLine:l},m=Ms(d.text),h=Pd(d.text);if(h.length>0){let _;for(let w of h)switch(w.kind){case"define":{let E={id:w.id,title:w.title,header:e},S=m.ingroup??s[s.length-1];S&&(E.parent=S),i.push(E),_=w.id;break}case"add":_=w.id;break;case"open":s.push(_??s[s.length-1]??""),_=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let p=zd(t,l+1);if(!p){o=l;continue}let y=Kd(p.text);if(!y){o=l;continue}let b=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],T={name:y.name,kind:y.kind,signature:y.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:p.line+1,deprecated:m.deprecated};if(m.brief&&(T.brief=m.brief),m.detail&&(T.detail=m.detail),b&&(T.group=b),m.since&&(T.since=m.since),r.push(T),o=l,y.kind==="enum"&&p.text.includes("{")){let _=jd(t,p.line);if(_){for(let w of Xd(_.body,_.line)){let E={name:w.name,kind:"enumvalue",signature:w.value?`${w.name} = ${w.value}`:w.name,params:[],returns:[],retvals:[],header:e,line:w.line+1,deprecated:!1,parentSymbol:y.name};w.brief&&(E.brief=w.brief),w.detail&&(E.detail=w.detail),b&&(E.group=b),r.push(E)}o=_.endLine}}}return{symbols:r,groups:i}}import{existsSync as Zd}from"node:fs";import{join as Wt}from"node:path";import{spawnSync as Bs}from"node:child_process";import{existsSync as gr,readFileSync as Yd,realpathSync as Gd}from"node:fs";import{delimiter as Vd,join as Jd,resolve as Hd}from"node:path";function Us(n,e){if(n.includes("/")||n.includes("\\"))return gr(n)?Hd(n):void 0;for(let t of(e??"").split(Vd).filter(Boolean)){let r=Jd(t,n);if(gr(r))return r}}function Wd(n){let e=Us("west",n.PATH);if(e)try{let r=(Yd(Gd(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return r?r[1]?.endsWith("/env")&&r[2]?Us(r[2].trim().split(/\s+/,1)[0],n.PATH):r[1]&&gr(r[1])?r[1]:void 0:void 0}catch{return}}function yr(n){return[n.PYTHON_EXECUTABLE,Wd(n),"python3","python"].filter((e,t,r)=>!!e&&r.indexOf(e)===t)}function Fs(n){let e=new Map;for(let t of n.split(/\r?\n/)){let r=t.split("#")[0].trim();if(r===""||r.startsWith("-"))continue;let[i,...s]=r.split(";"),o=i.split("[")[0].split(/[<>=!~]/)[0].trim();if(o==="")continue;let a=s.join(";").trim();e.has(o)||e.set(o,{name:o,...a?{marker:a}:{}})}return[...e.values()]}function Zt(n=process.env){for(let e of yr(n))if(Bs(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function xe(n,e=process.env){let t=Wt(n,"scripts","kconfig"),r=Wt(n,"scripts","dts","python-devicetree","src");if([Wt(t,"kconfiglib.py"),Wt(r,"devicetree","edtlib.py")].filter(a=>!Zd(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=yr(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(r)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(Bs(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}function js(n){let e=br(n),t=e;try{t=eu(e)}catch{}return[...new Set([e,t])].flatMap(r=>[br(r,"..","doxygen","xml"),br(r,"doc","_build","doxygen","xml")]).find(r=>Ks(Qt(r,"index.xml")))}function su(n,e){if(!Ks(Qt(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=Qd(Qt(ru(),"zephyr-ai-api-")),r=Qt(t,"api-export.py");try{nu(r,Ht,{mode:384});let i=iu(Zt(),[r,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(i.status!==0){let o=i.stderr?.trim()??"";try{let a=JSON.parse(i.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(u=>`- ${u.code}: ${u.message}${u.path?` (${u.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(i.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s.symbols.sort(F(o=>[o.name,o.header,String(o.line).padStart(9,"0"),o.kind,o.doxygenId??""].join("\0"))),s.groups.sort(F(o=>`${o.id}\0${o.title??""}`)),s}finally{tu(t,{recursive:!0,force:!0})}}function Xs(n,e){if(e)return su(n.root,e);let t=[],r=[],i=[],s=n.select({under:"include/zephyr",skip:["include/zephyr/internal","include/zephyr/arch/arm/internal"],match:a=>a.endsWith(".h")});for(let a of s){let c=a.slice(15),l;try{l=n.read(a)}catch(d){throw new Error(`Cannot read public API header ${a}: ${d instanceof Error?d.message:String(d)}`)}let u=`include/zephyr/${c}`,f=qs(l,u);for(let d of f.symbols){if(d.kind==="function"&&d.signature.includes("=")){i.push({path:`${u}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let m=d.signature.indexOf("["),h=d.signature.indexOf("(");if(d.kind==="function"&&m>=0&&(h<0||m<h)){i.push({path:`${u}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){i.push({path:`${u}:${d.line}`,reason:"fallback-include-guard"});continue}t.push(d)}r.push(...f.groups)}t.sort(F(a=>a.name));let o=new Map;for(let a of r)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:t,groups:[...o.values()],mode:"header-fallback",report:{discovered:t.length+o.size+i.length+1,indexed:t.length+o.size,intentionallyExcluded:[...i,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as au,mkdtempSync as cu,rmSync as lu,writeFileSync as du}from"node:fs";import{tmpdir as uu}from"node:os";import{dirname as zs,join as Er}from"node:path";import{spawnSync as fu}from"node:child_process";var en=`#!/usr/bin/env python3
"""Resolve a Zephyr binding catalogue with the target tree's edtlib."""

import argparse
import copy
import json
import os
from pathlib import Path
import sys
import yaml


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zephyr", required=True)
    parser.add_argument("--root", action="append", required=True)
    return parser.parse_args()


def relative_path(path, roots):
    resolved = Path(path).resolve()
    for prefix, root in roots:
        try:
            return prefix + resolved.relative_to(root).as_posix()
        except ValueError:
            pass
    return "external/{}".format(resolved.name)


def include_specs(raw):
    value = raw.get("include") if isinstance(raw, dict) else None
    if isinstance(value, str):
        return [(value, None, None, None)]
    if not isinstance(value, list):
        return []
    output = []
    for item in value:
        if isinstance(item, str):
            output.append((item, None, None, None))
        elif isinstance(item, dict) and isinstance(item.get("name"), str):
            output.append(
                (
                    item["name"],
                    item.get("property-allowlist"),
                    item.get("property-blocklist"),
                    item.get("child-binding"),
                )
            )
    return output


def property_origins(path, raw_by_path, fname2path, level=0, stack=None):
    stack = list(stack or [])
    if path in stack:
        raise RuntimeError("binding include cycle: {}".format(" -> ".join(stack + [path])))
    stack.append(path)
    raw = raw_by_path[path]
    node = raw
    for _ in range(level):
        node = node.get("child-binding") if isinstance(node, dict) else None
        if not isinstance(node, dict):
            node = {}
            break

    origins = {}
    for name, allow, block, child_filter in include_specs(raw):
        included = fname2path.get(name)
        if not included:
            raise RuntimeError("{} includes missing {}".format(path, name))
        nested_allow, nested_block = allow, block
        filter_value = child_filter
        for _ in range(level):
            if isinstance(filter_value, dict):
                nested_allow = filter_value.get("property-allowlist")
                nested_block = filter_value.get("property-blocklist")
                filter_value = filter_value.get("child-binding")
            else:
                nested_allow = nested_block = None
        inherited = property_origins(included, raw_by_path, fname2path, level, stack)
        for prop, provenance in inherited.items():
            if nested_allow is not None and prop not in nested_allow:
                continue
            if nested_block is not None and prop in nested_block:
                continue
            origins[prop] = {
                **provenance,
                "includeChain": [path] + provenance["includeChain"],
            }

    properties = node.get("properties") if isinstance(node, dict) else None
    if isinstance(properties, dict):
        for prop in properties:
            origins[prop] = {"declaredIn": path, "includeChain": [path]}
    return origins


def compat_from_raw(raw):
    compatible = raw.get("compatible") if isinstance(raw, dict) else None
    if isinstance(compatible, str):
        return [compatible]
    properties = raw.get("properties") if isinstance(raw, dict) else None
    compatible_spec = properties.get("compatible") if isinstance(properties, dict) else None
    if isinstance(compatible_spec, dict):
        if isinstance(compatible_spec.get("const"), str):
            return [compatible_spec["const"]]
        if isinstance(compatible_spec.get("enum"), list):
            return [item for item in compatible_spec["enum"] if isinstance(item, str)]
    return []


def translate_dt_schema(raw, compatible):
    translated = {
        key: copy.deepcopy(value)
        for key, value in raw.items()
        if key in {"title", "description", "include", "bus", "on-bus", "examples", "child-binding"}
        or key.endswith("-cells")
    }
    translated["compatible"] = compatible
    required = set(raw.get("required", []))
    properties = {}
    for name, value in raw.get("properties", {}).items():
        if name == "compatible":
            # The legacy Zephyr binding format carries this at the top level;
            # base.yaml already supplies the compatible property specification.
            continue
        spec = value if isinstance(value, dict) else {}
        converted = {
            key: copy.deepcopy(item)
            for key, item in spec.items()
            if key in {"description", "type", "enum", "const", "default", "deprecated", "specifier-space"}
        }
        if name in required:
            converted["required"] = True
        properties[name] = converted
    translated["properties"] = properties
    return translated


def binding_depth(binding):
    depth = 0
    child = binding.child_binding
    while child is not None:
        depth += 1
        child = child.child_binding
    return depth


def main():
    args = parse_args()
    zephyr = Path(args.zephyr).resolve()
    sys.path.insert(0, str(zephyr / "scripts" / "dts" / "python-devicetree" / "src"))
    from devicetree.edtlib import Binding, EDTError

    roots = []
    paths = []
    for index, value in enumerate(args.root):
        root = Path(value).resolve()
        roots.append(("" if index == 0 else "modules/{}/".format(root.parent.name), root))
        candidates = [*root.rglob("*.yaml"), *root.rglob("*.yml")]
        symbolic = [path for path in candidates if path.is_symlink()]
        if symbolic:
            raise RuntimeError(
                "binding roots contain symbolic links: {}".format(
                    ", ".join(str(path) for path in sorted(symbolic))
                )
            )
        paths.extend(sorted(str(path.resolve()) for path in candidates))
    paths = sorted(set(paths))

    names = {}
    duplicate_names = {}
    for path in paths:
        name = os.path.basename(path)
        if name in names and names[name] != path:
            duplicate_names.setdefault(name, [names[name]]).append(path)
        else:
            names[name] = path
    if duplicate_names:
        details = "; ".join("{}: {}".format(name, values) for name, values in duplicate_names.items())
        raise RuntimeError("ambiguous binding include basenames: {}".format(details))

    raw_by_path = {}
    errors = []
    for path in paths:
        try:
            with open(path, encoding="utf-8") as stream:
                raw = yaml.safe_load(stream)
            if not isinstance(raw, dict):
                raise RuntimeError("expected a YAML mapping")
            raw_by_path[path] = raw
        except Exception as error:
            errors.append({"path": relative_path(path, roots), "code": "yaml-parse", "message": str(error)})

    bindings = []
    exclusions = []
    warnings = []
    for path in paths:
        raw = raw_by_path.get(path)
        if raw is None:
            continue
        compatibles = compat_from_raw(raw)
        if not compatibles:
            exclusions.append({"path": relative_path(path, roots), "reason": "include-fragment"})
            # Still instantiate fragments so bad include syntax fails the catalogue build.
            try:
                Binding(path, names, raw=copy.deepcopy(raw), require_compatible=False, require_description=False)
            except Exception as error:
                errors.append({"path": relative_path(path, roots), "code": "binding-parse", "message": str(error)})
            continue

        for compatible in compatibles:
            source = copy.deepcopy(raw)
            adapter = None
            if "compatible" not in source:
                source = translate_dt_schema(source, compatible)
                adapter = "dt-schema-compatibility"
                warnings.append(
                    {
                        "path": relative_path(path, roots),
                        "code": adapter,
                        "message": "Converted properties.compatible form for the edtlib catalogue adapter.",
                    }
                )
            try:
                resolved = Binding(
                    path,
                    names,
                    raw=source,
                    require_compatible=True,
                    require_description=False,
                )
                origins_by_level = {}
                for level in range(binding_depth(resolved) + 1):
                    origins_by_level[level] = property_origins(path, raw_by_path, names, level)

                def encode(binding, level=0):
                    origins = origins_by_level.get(level, {})
                    properties = []
                    raw_props = binding.raw.get("properties", {})
                    for name, spec in sorted(binding.prop2specs.items()):
                        provenance = origins.get(name, {"declaredIn": path, "includeChain": [path]})
                        original = raw_props.get(name, {}) if isinstance(raw_props, dict) else {}
                        if adapter and level == 0 and isinstance(raw.get("properties"), dict):
                            original = raw["properties"].get(name, original)
                        if not isinstance(original, dict):
                            original = {}
                        constraints = {
                            key: value
                            for key, value in original.items()
                            if key not in {
                                "type", "description", "required", "enum", "const", "default",
                                "deprecated", "specifier-space"
                            }
                        }
                        properties.append(
                            {
                                "name": name,
                                "type": spec.type,
                                "required": spec.required,
                                "description": spec.description,
                                "default": spec.default,
                                "enum": spec.enum,
                                "const": spec.const,
                                "deprecated": spec.deprecated,
                                "specifierSpace": spec.specifier_space,
                                "inheritedFrom": relative_path(provenance["declaredIn"], roots),
                                "provenance": {
                                    "declaredIn": relative_path(provenance["declaredIn"], roots),
                                    "includeChain": [relative_path(item, roots) for item in provenance["includeChain"]],
                                },
                                "constraints": constraints,
                            }
                        )
                    child = encode(binding.child_binding, level + 1) if binding.child_binding else None
                    return {
                        "path": relative_path(path, roots) + ("#child/{}".format(level) if level else ""),
                        "compatible": compatible if level == 0 else None,
                        "description": binding.description,
                        "title": binding.title,
                        "bus": binding.bus,
                        "onBus": binding.on_bus,
                        "cells": {"{}-cells".format(key): value for key, value in binding.specifier2cells.items()},
                        "includes": [relative_path(names[name], roots) for name, *_ in include_specs(raw) if name in names],
                        "properties": properties,
                        "children": [child] if child else [],
                        "examples": binding.examples,
                        "adapter": adapter,
                    }

                bindings.append(encode(resolved))
            except (EDTError, RuntimeError, yaml.YAMLError) as error:
                errors.append({"path": relative_path(path, roots), "code": "binding-resolve", "message": str(error)})

    report = {
        "discovered": len(paths),
        "indexed": len(bindings),
        "intentionallyExcluded": exclusions,
        "warnings": warnings,
        "errors": errors,
    }
    json.dump({"bindings": bindings, "fragments": len(exclusions), "report": report}, sys.stdout, separators=(",", ":"))
    if errors:
        sys.exit(2)


if __name__ == "__main__":
    main()
`;var Ys=new Map;function Gs(n){let e=JSON.stringify(n),t=Ys.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let r=zs(zs(n[0])),i=Er(r,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!au(i))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=cu(Er(uu(),"zephyr-ai-bindings-")),o=Er(s,"binding-export.py");try{du(o,en,{mode:384});let a=[o,"--zephyr",r];for(let u of n)a.push("--root",u);let c=fu(xe(r),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let u="";try{u=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let f=u||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${f}`)}let l=JSON.parse(c.stdout);return Ys.set(e,l),l}finally{lu(s,{recursive:!0,force:!0})}}var Uc=Vt(Ut(),1);import{existsSync as Kh}from"node:fs";import{join as qc}from"node:path";import{spawnSync as jh}from"node:child_process";function Bh(n){let[e="",...t]=n.split("/"),r=e.indexOf("@");return{board:r<0?e:e.slice(0,r),revision:r<0?"":e.slice(r+1),qualifiers:t.filter(Boolean)}}function Mc(n){let{board:e,revision:t,qualifiers:r}=Bh(n);if(!e)return[];let i=[],s=o=>{o&&!i.includes(o)&&i.push(o)};s(e);for(let o=1;o<=r.length;o++)s([e,...r.slice(0,o)].join("_"));if(t){let o=`${e}_${t.replace(/\./g,"_")}`;s(o);for(let a=1;a<=r.length;a++)s([o,...r.slice(0,a)].join("_"))}return i}function es(n,e){try{let t=(0,Uc.parse)(n.read(e),{logLevel:"silent"});if(!t||typeof t!="object"||Array.isArray(t))throw new Error("expected a YAML mapping");return t}catch(t){throw new Error(`Failed to parse board/SoC metadata ${e}: ${t.message}`)}}function le(n){return Array.isArray(n)?n:[]}function Ft(n){return le(n).filter(e=>typeof e=="string")}function Xh(n){let e=qc(n,"scripts","list_boards.py");if(!Kh(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let i of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(i&&(t=jh(i,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let r=new Map;for(let i of t.stdout.split(`
`).filter(Boolean)){let s=i.split("@@").filter(Boolean).map(u=>u.split(";")),o=u=>s.find(([f])=>f===u)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),r.set(a,c)}return r}function zh(n,e){let t=[],r=n.select({under:e,match:i=>(i.endsWith(".yaml")||i.endsWith(".yml"))&&i!=="board.yml"&&i!=="board.yaml"});for(let i of r){if(i.slice(e.length+1).includes("/"))continue;let s=es(n,i),o={toolchains:Ft(s.toolchain),supported:Ft(s.supported),...typeof s.name=="string"?{name:s.name}:{},...typeof s.arch=="string"?{arch:s.arch}:{},...typeof s.type=="string"?{type:s.type}:{},...typeof s.ram=="number"?{ram:s.ram}:{},...typeof s.flash=="number"?{flash:s.flash}:{},...typeof s.vendor=="string"?{vendor:s.vendor}:{}};typeof s.identifier=="string"&&t.push({identifier:s.identifier,...o});let a=s.variants&&typeof s.variants=="object"&&!Array.isArray(s.variants)?s.variants:{};for(let[c,l]of Object.entries(a)){let u=l&&typeof l=="object"&&!Array.isArray(l)?l:{};t.push({identifier:c,...o,toolchains:Ft(u.toolchain).length?Ft(u.toolchain):o.toolchains,supported:[...new Set([...o.supported,...Ft(u.supported)])]})}}return t.sort(F(i=>i.identifier)),t}function Yh(n,e,t){let r=null;for(let i of Mc(t)){let s=`${e}/${i}_defconfig`;if(n.has(s))for(let o of n.read(s).split(`
`)){let a=/^\s*CONFIG_XIP\s*=\s*(\S)/.exec(o);a?r=a[1]==="y":/^\s*#\s*CONFIG_XIP\s+is\s+not\s+set\s*$/.test(o)&&(r=!1)}}return r}function Fc(n){let e=[],t=n.root,r=Xh(t);for(let i of n.select({under:"boards",match:s=>s==="board.yml"||s==="board.yaml"})){let s=qc(t,i),o=es(n,i),a=[],c=o.board;c&&typeof c=="object"&&!Array.isArray(c)&&a.push(c);for(let h of le(o.boards))h&&typeof h=="object"&&!Array.isArray(h)&&a.push(h);if(a.length===0)continue;let l=i.slice(0,i.lastIndexOf("/")),u=zh(n,l),f=n.select({under:`${l}/doc`,match:h=>h.endsWith(".rst")}).map(h=>h.slice(l.length+5)),d=f.includes("index.rst")?"index.rst":f[0],m=d?`${l}/doc/${d}`:void 0;for(let h of a){if(typeof h.name!="string")continue;let p=h.name,y=le(h.socs).flatMap(R=>{if(!R||typeof R!="object")return[];let V=R;return typeof V.name!="string"?[]:[{name:V.name,variants:le(V.variants).flatMap(oe=>oe&&typeof oe=="object"&&typeof oe.name=="string"?[oe.name]:[]),cpuclusters:le(V.cpuclusters).flatMap(oe=>oe&&typeof oe=="object"&&typeof oe.name=="string"?[oe.name]:[])}]}),b=u.filter(R=>R.identifier===p||R.identifier.startsWith(`${p}/`)),T=r.get(p);if(!T)throw new Error(`Zephyr's board model did not enumerate ${p}.`);let _=T.qualifiers.length>0?T.qualifiers:[""],w=_.map(R=>R?`${p}/${R}`:p);for(let R of T.revisions)w.push(..._.map(V=>V?`${p}@${R}/${V}`:`${p}@${R}`));let E=w.map(R=>({identifier:R,toolchains:[],supported:[]})),S=b.length>0?b:a.length===1?u:[],A=new Map(E.map(R=>[R.identifier,R]));for(let R of S){let V=A.get(R.identifier);A.set(R.identifier,V?{...V,...R}:R)}let N=[...A.values()].sort((R,V)=>ct(R.identifier,V.identifier)),v={name:p,dir:l,socs:y,targets:N,revisions:T.revisions,supported:[...new Set(N.flatMap(R=>R.supported))].sort(),noXipTargets:N.filter(R=>Yh(n,l,R.identifier)===!1).map(R=>R.identifier)};typeof h.full_name=="string"&&(v.fullName=h.full_name),typeof h.vendor=="string"&&(v.vendor=h.vendor),T.defaultRevision&&(v.defaultRevision=T.defaultRevision),m&&(v.docPath=m);let D=N.find(R=>R.arch)?.arch;D&&(v.arch=D);let G=N.find(R=>R.ram!==void 0)?.ram;G!==void 0&&(v.ram=G);let $=N.find(R=>R.flash!==void 0)?.flash;$!==void 0&&(v.flash=$),e.push(v)}}return e.sort(F(i=>i.name)),e}function Bc(n){let e=n.root,t=[];for(let r of n.select({under:"soc",match:i=>i==="soc.yml"||i==="soc.yaml"})){let i=es(n,r),s=r.slice(0,r.lastIndexOf("/")),o=r.slice(4),a=o.includes("/")?o.split("/")[0]:void 0,c=(u,f,d)=>{if(typeof u.name!="string")return;let m={name:u.name,dir:s,cpuclusters:le(u.cpuclusters).flatMap(h=>h&&typeof h=="object"&&typeof h.name=="string"?[h.name]:[])};f&&(m.family=f),d&&(m.series=d),a&&(m.vendor=a),t.push(m)};(u=>{for(let f of u){if(!f||typeof f!="object")continue;let d=f,m=typeof d.name=="string"?d.name:void 0;for(let h of le(d.socs))h&&typeof h=="object"&&c(h,m);for(let h of le(d.series)){if(!h||typeof h!="object")continue;let p=h,y=typeof p.name=="string"?p.name:void 0;for(let b of le(p.socs))b&&typeof b=="object"&&c(b,m,y)}}})(le(i.family));for(let u of le(i.socs))u&&typeof u=="object"&&c(u)}return t.sort(F(r=>r.name)),t}import{existsSync as Zh,lstatSync as Qh,realpathSync as rs}from"node:fs";import{dirname as eg,extname as tg,join as ng,relative as tr,resolve as rg,sep as is}from"node:path";var Gh="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function er(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!Gh.includes(t))return null;for(let r of e)if(r!==t)return null;return{char:t,length:e.length}}function Vh(n){let e=[];for(let t=0;t<n.length;t++){let r=er(n[t]);if(!r)continue;let i=n[t-1];if(i===void 0)continue;let s=i.trim();if(s===""||r.length<s.length)continue;if(er(i)){if(er(n[t-2]??""))continue;continue}let o=er(n[t-2]??""),a=o!==null&&o.char===r.char;e.push({line:t-1,text:s,char:r.char,overlined:a})}return e}function Jh(n){let e=[];return n.map(t=>{let r=t.overlined?`over:${t.char}`:t.char,i=e.indexOf(r);return i===-1&&(i=e.length,e.push(r)),i})}var ns=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function Kc(n){let e=n.split(`
`),t=[],r=s=>t.push({code:!1,text:s}),i=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(ns.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",u=""]=a,f=c.length,d=l.toLowerCase(),m=[],h=s+1;for(;h<e.length;h++){let p=e[h];if(p.trim()===""){m.push("");continue}if(p.match(/^\s*/)[0].length<=f)break;m.push(p)}if(i.has(d)){s=h-1;continue}if(d==="code-block"||d==="code"||d==="literalinclude"){let p=u.trim(),y=ts(m).join(`
`).replace(/^\n+|\n+$/g,"");y&&t.push({code:!0,text:`\`\`\`${p}
${y}
\`\`\``}),s=h-1;continue}if(d==="note"||d==="warning"||d==="important"||d==="tip"){let p=ts(m).join(`
`).trim();p&&r(`${l.toUpperCase()}: ${p}`),s=h-1;continue}u.trim()&&r(u.trim());for(let p of ts(m))r(p);s=h-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||r(o)}return t.map(s=>s.code?s.text:Hh(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function ts(n){let e=n.filter(r=>r.trim()!=="").map(r=>r.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(r=>r.trim()===""?"":r.slice(t))}function Hh(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function jc(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),r=[];for(let l of t){let u=l.match(ns);u&&r.push(u[1].trim())}let i=Vh(t),s=Jh(i);if(i.length===0){let l=Kc(e);return{title:"",labels:r,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=i[0].text,a=[],c=[];for(let l=0;l<i.length;l++){let u=i[l],f=s[l],d=i[l+1];for(;c.length>0&&c[c.length-1].level>=f;)c.pop();c.push({level:f,text:u.text});let m=u.line+2,h=d?d.line-(d.overlined?1:0):t.length,p=t.slice(m,Math.max(m,h)).join(`
`),y=Kc(p),b=Wh(t,u.line-(u.overlined?1:0));(y||l===0)&&a.push({...b?{anchor:b}:{},heading:u.text,headingPath:c.map(T=>T.text),ord:a.length,body:y})}return{title:o,labels:r,chunks:a}}function Wh(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let r=n[t];if(r.trim()==="")continue;let i=r.match(ns);return i?i[1].trim():void 0}}var ig=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function sg(n,e){let t=n.replace(/\.rst$/,""),r=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${r}.html`}function Xc(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function og(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function ag(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let r=0;r<e.length;r++){let i=e[r].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!i)continue;let s=i[1].length;for(r+=1;r<e.length;r++){let o=e[r];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){r-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),u=(l?.[2]??c).replace(/\.rst$/,""),f=l?.[1]?.trim()||u.split("/").filter(Boolean).at(-1)?.replace(/^index$/,u.split("/").at(-2)??"index").replace(/[_-]/g," ");u&&f&&t.push(`${f} (${u})`)}}return[...new Set(t)]}function cg(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function lg(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=1,i=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(r=s),Number.isInteger(o)&&o>=r&&(i=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(u=>u.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);r=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((u,f)=>f>=r-1&&u.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);i=l+(e["end-at"]?1:0)}return t=t.slice(r-1,i),{text:t.join(`
`),start:r,end:i}}function ss(n,e,t,r,i=[]){let s=n.root,o=rs(e);if(i.includes(o))throw new Error(`include cycle: ${[...i,o].map(u=>tr(s,u)).join(" -> ")}`);let a=[...i,o],c=t.replace(/\r\n?/g,`
`).split(`
`),l=[];for(let u=0;u<c.length;u++){let f=c[u],d=f.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){l.push(f);continue}let m=d[1].length,h=d[2],p=d[3].trim(),y=[],b=u+1;for(;b<c.length;b++){let v=c[b];if(v.trim()===""){y.push(v);continue}if(v.match(/^\s*/)[0].length<=m)break;y.push(v)}if(u=b-1,h==="only"){if(/\bhtml\b/.test(p)){let v=y.map(G=>G.trim()?G.slice(Math.min(G.length,m+3)):""),D=ss(n,o,v.join(`
`),r,i);l.push(...D.split(`
`).map(G=>`${" ".repeat(m)}${G}`))}continue}let T=cg(y),_=rg(eg(o),p);if(!Zh(_))throw new Error(`include target not found: ${p}`);if(Qh(_).isSymbolicLink())throw new Error(`include target is a symbolic link: ${p}`);let w=rs(s),E=rs(_),S=tr(w,E);if(S===".."||S.startsWith(`..${is}`))throw new Error(`include escapes the Zephyr tree: ${p}`);let A=tr(w,E).replaceAll(is,"/"),N=lg(n.read(A),T);if(r.push({path:tr(w,E).replaceAll(is,"/"),startLine:N.start,endLine:N.end,directive:h}),h==="literalinclude"){let v=T.language??tg(_).slice(1);l.push(`${" ".repeat(m)}.. code-block:: ${v}`,"",...N.text.split(`
`).map(D=>`${" ".repeat(m+3)}${D}`))}else{let v=ss(n,E,N.text,r,a);l.push(...v.split(`
`).map(D=>`${" ".repeat(m)}${D}`))}}return l.join(`
`)}function zc(n,e,t,r){let i=[];for(let s of n.select({under:e,skipSegments:ig,match:o=>o.endsWith(".rst")})){let o=ng(n.root,s);r.discovered++;try{let a=n.read(s),c=[{path:s,startLine:1,endLine:a.split(/\r?\n/).length,directive:"page"}],l=ss(n,o,a,c),u=jc(l),f=u.chunks.filter(d=>d.body.trim()!=="").map((d,m)=>({...d,ord:m}));if(f.length===0){let d=ag(l);if(d.length>0){let m=u.title||Xc(s);f=[{heading:m,headingPath:[m],ord:0,body:`Contained documentation pages:
${d.map(h=>`- ${h}`).join(`
`)}`}]}}if(f.length===0){r.intentionallyExcluded.push({path:s,reason:"no-retrievable-content"});continue}i.push({path:s,url:sg(s,t),title:u.title||Xc(s),area:og(s),labels:u.labels,chunks:f,origins:c}),r.indexed++}catch(a){r.errors.push({path:s,code:"rst-preprocess",message:a.message})}}return i}function Yc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},r=[...zc(n,"doc",e,t),...zc(n,"boards",e,t)];if(t.errors.length>0){let i=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${i}`)}return{pages:r,report:t}}import{existsSync as ug,mkdtempSync as fg,rmSync as pg,writeFileSync as mg}from"node:fs";import{tmpdir as hg}from"node:os";import{join as rr}from"node:path";import{spawnSync as gg}from"node:child_process";var nr=`#!/usr/bin/env python3
"""Export Zephyr's evaluated Kconfig declaration graph as deterministic JSON."""

import argparse
import glob
import json
import os
from pathlib import Path
import re
import sys


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zephyr", required=True)
    parser.add_argument("--build-dir", required=True)
    parser.add_argument("--module", action="append", default=[])
    # The tree carries two independent Kconfig namespaces. share/sysbuild/Kconfig is
    # the root of the one written as SB_CONFIG_ in sysbuild.conf, and it declares
    # symbols that collide by name with the application tree while meaning something
    # else, so it is exported as its own run rather than merged.
    parser.add_argument("--root", default="Kconfig")
    return parser.parse_args()


def write_sources(path, paths):
    Path(path).parent.mkdir(parents=True, exist_ok=True)
    with open(path, "w", encoding="utf-8") as stream:
        for source in sorted(set(paths)):
            stream.write('source "{}"\\n'.format(source.replace("\\\\", "/")))


def module_kconfig(root):
    module_yml = Path(root, "zephyr", "module.yml")
    if module_yml.is_file():
        text = module_yml.read_text(encoding="utf-8")
        match = re.search(r"^\\s*kconfig:\\s*([^#\\n]+)", text, re.MULTILINE)
        if match:
            configured = match.group(1).strip().strip('"\\'')
            candidate = Path(root, configured)
            if candidate.is_file():
                return str(candidate.resolve())
    for relative_path in ("zephyr/Kconfig", "Kconfig"):
        candidate = Path(root, relative_path)
        if candidate.is_file():
            return str(candidate.resolve())
    return None


def prepare_environment(args):
    zephyr = str(Path(args.zephyr).resolve())
    build = str(Path(args.build_dir).resolve())
    Path(build, "soc").mkdir(parents=True, exist_ok=True)
    Path(build, "arch").mkdir(parents=True, exist_ok=True)
    Path(build, "toolchain").mkdir(parents=True, exist_ok=True)

    write_sources(
        Path(build, "soc", "Kconfig.soc"),
        glob.glob(str(Path(zephyr, "soc", "**", "Kconfig.soc")), recursive=True),
    )
    write_sources(
        Path(build, "soc", "Kconfig.defconfig"),
        glob.glob(str(Path(zephyr, "soc", "**", "Kconfig.defconfig")), recursive=True),
    )
    write_sources(
        Path(build, "arch", "Kconfig"),
        glob.glob(str(Path(zephyr, "arch", "*", "Kconfig"))),
    )
    write_sources(
        Path(build, "Kconfig.modules"),
        [path for path in (module_kconfig(root) for root in args.module) if path],
    )
    # modules/Kconfig.sysbuild sources this unconditionally, and CMake writes it
    # during a real sysbuild. Nothing sources module sysbuild Kconfig here because
    # --module roots extend the application namespace, not this one.
    write_sources(Path(build, "Kconfig.sysbuild.modules"), [])

    os.environ.update(
        srctree=zephyr,
        ZEPHYR_BASE=zephyr,
        CMAKE_BINARY_DIR=build,
        KCONFIG_BINARY_DIR=build,
        KCONFIG_DOC_MODE="1",
        SOC_DIR="soc",
        ARCH_DIR="arch",
        KCONFIG_BOARD_DIR="boards/*/*",
        ARCH="*",
        APPLICATION_SOURCE_DIR=zephyr,
        TOOLCHAIN_KCONFIG_DIR=str(Path(build, "toolchain")),
        TOOLCHAIN_HAS_NEWLIB="n",
        TOOLCHAIN_HAS_PICOLIBC="n",
        TOOLCHAIN_HAS_GLIBCXX="n",
        TOOLCHAIN_HAS_LIBCXX="n",
    )
    sys.path.insert(0, str(Path(zephyr, "scripts", "kconfig")))
    return zephyr


def main():
    args = parse_args()
    zephyr = prepare_environment(args)

    import kconfiglib as kc

    kconf = kc.Kconfig(
        str(Path(zephyr, args.root)), warn_to_stderr=False, suppress_traceback=True
    )

    allowed_source_roots = [Path(zephyr).resolve(), Path(args.build_dir).resolve()]
    allowed_source_roots.extend(Path(root).resolve() for root in args.module)
    for filename in kconf.kconfig_filenames:
        source = Path(filename).resolve()
        if not any(source.is_relative_to(root) for root in allowed_source_roots):
            raise RuntimeError("Kconfig source escapes declared roots: {}".format(source))

    operators = {
        kc.AND: "and",
        kc.OR: "or",
        kc.NOT: "not",
        kc.EQUAL: "equal",
        kc.UNEQUAL: "unequal",
        kc.LESS: "less",
        kc.LESS_EQUAL: "less_equal",
        kc.GREATER: "greater",
        kc.GREATER_EQUAL: "greater_equal",
    }

    def unexpand(text):
        """Restore $(ZEPHYR_BASE) in a value kconfiglib expanded to an absolute path.

        Upstream writes \`default "$(ZEPHYR_BASE)/boards/qemu/x86/qemu_x86_tiny.ld"\`.
        Kconfiglib resolves that against this machine's tree, so storing the result
        put a home directory into an answer get_kconfig renders, and made two
        machines' catalogues differ over nothing. Un-expanding restores what the
        Kconfig source actually says.
        """
        return text.replace(zephyr, "$(ZEPHYR_BASE)") if zephyr in text else text

    def expression(value):
        if value is None:
            return None
        if isinstance(value, tuple):
            op = operators.get(value[0], "unknown")
            children = [expression(child) for child in value[1:]]
            return {"kind": op, "children": children, "display": unexpand(kc.expr_str(value))}
        if isinstance(value, kc.Symbol):
            return {
                "kind": "constant" if value.is_constant else "symbol",
                "value": unexpand(value.name),
                "display": unexpand(kc.expr_str(value)),
            }
        if isinstance(value, kc.Choice):
            return {"kind": "choice", "value": choice_id(value), "display": kc.expr_str(value)}
        return {"kind": "literal", "value": unexpand(str(value)), "display": unexpand(str(value))}

    roots = [(Path(zephyr), "")]
    roots.extend((Path(root).resolve(), "modules/{}/".format(Path(root).name)) for root in args.module)

    def source_path(filename):
        path = Path(filename).resolve()
        for root, prefix in roots:
            try:
                return prefix + path.relative_to(root).as_posix()
            except ValueError:
                pass
        return "external/{}".format(path.name)

    def choice_id(choice):
        if choice.name:
            return choice.name
        node = choice.nodes[0]
        return "choice@{}:{}".format(source_path(node.filename), node.linenr)

    def menu_path(node):
        entries = []
        parent = node.parent
        while parent:
            if parent.prompt and not isinstance(parent.item, kc.Symbol):
                entries.append(parent.prompt[0])
            parent = parent.parent
        entries.reverse()
        return entries

    types = {
        kc.BOOL: "bool",
        kc.TRISTATE: "tristate",
        kc.INT: "int",
        kc.HEX: "hex",
        kc.STRING: "string",
        kc.UNKNOWN: None,
    }

    symbols = []
    for sym in kconf.unique_defined_syms:
        if not sym.name:
            continue
        definitions = []
        for node in sym.nodes:
            prompt = node.prompt[0] if node.prompt else None
            definitions.append(
                {
                    "file": source_path(node.filename),
                    "line": node.linenr,
                    "prompt": prompt,
                    "promptCondition": expression(node.prompt[1]) if node.prompt else None,
                    "menuPath": menu_path(node),
                    "condition": expression(node.dep),
                    "defaults": [
                        {"value": expression(value), "condition": expression(condition), "order": order}
                        for order, (value, condition, *_location) in enumerate(node.defaults)
                    ],
                    "selects": [
                        {"target": target.name, "condition": expression(condition), "order": order}
                        for order, (target, condition, *_location) in enumerate(node.selects)
                    ],
                    "implies": [
                        {"target": target.name, "condition": expression(condition), "order": order}
                        for order, (target, condition, *_location) in enumerate(node.implies)
                    ],
                    "ranges": [
                        {
                            "low": expression(low),
                            "high": expression(high),
                            "condition": expression(condition),
                            "order": order,
                        }
                        for order, (low, high, condition, *_location) in enumerate(node.ranges)
                    ],
                    "isMenuconfig": bool(node.is_menuconfig),
                    "isConfigDefault": bool(getattr(node, "is_configdefault", False)),
                }
            )
        symbols.append(
            {
                "name": sym.name,
                "type": types.get(sym.orig_type),
                "help": next((node.help for node in sym.nodes if node.help), None),
                "hasPrompt": any(node.prompt for node in sym.nodes),
                "choice": choice_id(sym.choice) if sym.choice else None,
                "definitions": definitions,
            }
        )

    choices = []
    for choice in kconf.unique_choices:
        definitions = []
        for node in choice.nodes:
            definitions.append(
                {
                    "file": source_path(node.filename),
                    "line": node.linenr,
                    "prompt": node.prompt[0] if node.prompt else None,
                    "condition": expression(node.dep),
                }
            )
        choices.append(
            {
                "id": choice_id(choice),
                "name": choice.name,
                "type": types.get(choice.orig_type),
                "definitions": definitions,
                "members": [symbol.name for symbol in choice.syms],
            }
        )

    merged_choices = {}
    for choice in choices:
        previous = merged_choices.get(choice["id"])
        if previous is None:
            merged_choices[choice["id"]] = choice
        else:
            previous["definitions"].extend(choice["definitions"])
            previous["members"] = sorted(set(previous["members"] + choice["members"]))

    files = sorted(source_path(path) for path in kconf.kconfig_filenames)
    json.dump(
        {
            "symbols": sorted(symbols, key=lambda symbol: symbol["name"]),
            "choices": sorted(merged_choices.values(), key=lambda choice: choice["id"]),
            "files": files,
            "warnings": kconf.warnings,
        },
        sys.stdout,
        separators=(",", ":"),
    )


if __name__ == "__main__":
    main()
`;var Gc=new Map,yg={zephyr:"Kconfig",sysbuild:"share/sysbuild/Kconfig"};function os(n,e=[],t="zephyr"){let r=JSON.stringify([n,[...e].sort(),t]),i=Gc.get(r);if(i)return i;let s=rr(n,"scripts","kconfig","kconfiglib.py");if(!ug(s))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let o=fg(rr(hg(),"zephyr-ai-kconfig-")),a=rr(o,"kconfig-export.py"),c=rr(o,"generated");try{mg(a,nr,{mode:384});let l=[a,"--zephyr",n,"--build-dir",c,"--root",yg[t]];for(let m of e)l.push("--module",m);let u=gg(xe(n),l,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(u.status!==0){let m=u.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${m}`)}let f=JSON.parse(u.stdout),d={symbols:f.symbols,choices:f.choices,filesScanned:f.files.length,warnings:f.warnings};return Gc.set(r,d),d}finally{pg(o,{recursive:!0,force:!0})}}var Hc=Vt(Ut(),1);import{statSync as bg}from"node:fs";import{join as Jc}from"node:path";var Eg=64*1024,Tg=160*1024;function Wc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var Vc={"sample.yaml":"sample","testcase.yaml":"test"};function _g(n,e,t){let r=[],i=[],s=Tg;for(let o of t){if(!Wc(o))continue;let a=Jc(n.root,e,o);try{if(bg(a).size>Eg){i.push({path:o,reason:"file-size-limit"});continue}let c=n.read(`${e}/${o}`);if(Buffer.byteLength(c)>s){i.push({path:o,reason:"sample-size-budget"});continue}s-=Buffer.byteLength(c),r.push({path:o,text:c})}catch(c){throw new Error(`Failed to capture sample file ${a}: ${c.message}`)}}return{contents:r,exclusions:i}}function Ng(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function ir(n){return Ng(n).filter(e=>typeof e=="string")}function Sg(n,e){let t=[],r=i=>{n.has(`${e}/${i}`)&&t.push(i)};for(let i of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])r(i);for(let i of["src","boards","snippets"])t.push(...n.select({under:`${e}/${i}`,match:s=>Wc(`${i}/${s}`)}).map(s=>s.slice(e.length+1)));return t}function Zc(n){let e=[],t=new Set,r=n.root;for(let i of["samples","snippets","tests"])for(let s of n.select({under:i,match:o=>Object.hasOwn(Vc,o)})){let o=Jc(r,s),a=s.slice(s.lastIndexOf("/")+1),c=Vc[a],l=null;try{let v=(0,Hc.parse)(n.read(s),{logLevel:"silent"});if(!v||typeof v!="object"||Array.isArray(v))throw new Error("expected a YAML mapping");l=v}catch(v){throw new Error(`Failed to parse ${a} metadata ${s}: ${v.message}`)}let u=s.slice(0,s.lastIndexOf("/")),f=u;if(t.has(u))continue;t.add(u);let d=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},h=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},p=new Set,y=new Set,b=new Set,T=new Set,_=v=>{for(let D of ir(v.tags))p.add(D);if(typeof v.tags=="string")for(let D of v.tags.split(/\s+/).filter(Boolean))p.add(D);for(let D of ir(v.depends_on))y.add(D);for(let D of ir(v.integration_platforms))b.add(D);for(let D of ir(v.platform_allow))T.add(D)};_(h);for(let v of Object.values(m))!v||typeof v!="object"||_({...h,...v});let w=Sg(n,f),{contents:E,exclusions:S}=_g(n,f,w),A=E.map(v=>v.path),N={path:u,kind:c,name:typeof d.name=="string"?d.name:u.split("/").pop(),tags:[...p].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...y].sort(),integrationPlatforms:[...b].sort(),platformAllow:[...T].sort(),files:A,contents:E,exclusions:S};typeof d.description=="string"&&(N.description=d.description),n.has(`${f}/README.rst`)&&(N.docPath=`${u}/README.rst`),e.push(N)}return e.sort(F(i=>i.path)),e}var nl=Vt(Ut(),1);import{existsSync as tl,mkdtempSync as vg,readFileSync as kg,rmSync as Ag,writeFileSync as Lg}from"node:fs";import{tmpdir as Rg}from"node:os";import{join as or}from"node:path";import{spawnSync as Og}from"node:child_process";var sr=`#!/usr/bin/env python3
"""Export the west runner catalogue from the target tree's own runner classes."""

import argparse
import dataclasses
import json
import logging
from pathlib import Path
import sys


def parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--zephyr", required=True)
    return parser.parse_args()


def encode(value):
    """Capability values are JSON-safe apart from the command set, which is unordered."""
    if isinstance(value, (set, frozenset)):
        return sorted(value)
    return value


def summary(cls):
    doc = (cls.__doc__ or "").strip()
    return doc.split("\\n", 1)[0].strip() or None


def main():
    args = parse_args()
    zephyr = Path(args.zephyr).resolve()
    commands = zephyr / "scripts" / "west_commands"
    if not (commands / "runners" / "core.py").is_file():
        raise RuntimeError("the selected Zephyr tree ships no west runner package")
    sys.path.insert(0, str(commands))

    # runners/__init__.py imports every runner module and downgrades an ImportError to
    # a warning, so one runner missing a third-party dependency still leaves the rest
    # of the catalogue intact. That silent partial success is the danger: openocd,
    # which 328 boards select, imports zephyr_ext_common and so needs the west package
    # importable. An interpreter without it yields a catalogue missing the commonest
    # runner in Zephyr and says nothing. Import each module separately and report what
    # failed, so the caller can refuse an incomplete catalogue instead of shipping one.
    logging.disable(logging.WARNING)
    import importlib

    import runners
    from runners.core import ZephyrBinaryRunner

    # Completeness is pinned to the west package rather than to a clean import of
    # every module. Zephyr declares west in requirements-base, so an environment that
    # can build Zephyr can import it, and it is what openocd needs. Some runners
    # depend on packages no Zephyr requirements file names at all -- rtsflash wants
    # pyusb -- so demanding zero failures would refuse every environment that exists.
    try:
        importlib.import_module("west")
        west_importable = True
    except Exception:
        west_importable = False

    excluded = []
    notes = []
    for module in getattr(runners, "_names", []):
        try:
            importlib.import_module("runners.{}".format(module))
        except Exception as error:
            excluded.append(
                {
                    "path": "scripts/west_commands/runners/{}.py".format(module),
                    "reason": "runner-import",
                }
            )
            notes.append(
                {
                    "path": "scripts/west_commands/runners/{}.py".format(module),
                    "code": "runner-import",
                    "message": "{}: {}".format(type(error).__name__, error),
                }
            )

    entries = []
    errors = []
    for cls in sorted(ZephyrBinaryRunner.get_runners(), key=lambda item: item.name()):
        try:
            caps = dataclasses.asdict(cls.capabilities())
        except Exception as error:
            errors.append(
                {
                    "path": cls.__module__,
                    "code": "runner-capabilities",
                    "message": str(error),
                }
            )
            continue
        entries.append(
            {
                "name": cls.name(),
                # __module__ is "runners.<file>"; the tree path is what get_source takes.
                "module": "scripts/west_commands/{}.py".format(cls.__module__.replace(".", "/")),
                "description": summary(cls),
                "capabilities": {key: encode(value) for key, value in caps.items()},
            }
        )

    report = {
        # Runner classes, not modules: mdb.py registers two and nsim.py renames its
        # one, so the two counts do not agree and the exclusions are per module.
        "discovered": len(entries) + len(excluded) + len(errors),
        "indexed": len(entries),
        "intentionallyExcluded": excluded,
        "warnings": notes,
        "errors": errors,
    }
    json.dump(
        {"runners": entries, "complete": west_importable, "report": report},
        sys.stdout,
        separators=(",", ":"),
    )
    if errors:
        sys.exit(2)


if __name__ == "__main__":
    main()
`;function xg(n){let e="",t=!1;for(let r=0;r<n.length;r++){let i=n[r];if(t){e+=i,i==="\\"?(e+=n[r+1]??"",r++):i==='"'&&(t=!1);continue}if(i==='"'){t=!0,e+=i;continue}if(i==="#"){for(;r<n.length&&n[r]!==`
`;)r++;e+=`
`;continue}e+=i}return e}function Ig(n){let e=[],t="",r=!1,i=!1;for(let s=0;s<n.length;s++){let o=n[s];if(r){o==="\\"?(t+=n[s+1]??"",s++):o==='"'?r=!1:t+=o;continue}if(o==='"'){r=!0,i=!0;continue}if(/\s/.test(o)){i&&e.push(t),t="",i=!1;continue}t+=o,i=!0}return i&&e.push(t),e}function Qc(n){return n.replace(/\s+/g," ").trim()}function Cg(n){return n.predicate}function rl(n){let e=xg(n),t=[],r=[],i=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,s;for(;(s=i.exec(e))!==null;){let o=s[1].toLowerCase(),a=1,c=s.index+s[0].length,l=!1;for(;c<e.length&&a>0;c++){let d=e[c];if(l){d==="\\"?c++:d==='"'&&(l=!1);continue}d==='"'?l=!0:d==="("?a++:d===")"&&a--}if(a!==0)break;let u=e.slice(s.index+s[0].length,c-1);if(i.lastIndex=c,o==="if"){let d=Qc(u);r.push({taken:[d],predicate:d});continue}if(o==="elseif"||o==="else"){let d=r[r.length-1];if(!d)continue;let m=Qc(u),h=d.taken.map(p=>`NOT (${p})`).join(" AND ");d.predicate=o==="else"?h||null:h?`(${m}) AND ${h}`:m,o==="elseif"&&d.taken.push(m);continue}if(o==="endif"){r.pop();continue}let f=r.map(Cg).filter(d=>!!d);t.push({name:o,args:Ig(u),...f.length>0?{guard:f.join(" AND ")}:{}})}return t}function qe(n,e,t){let r=n.declaredIn.get(e);r?r.add(t):n.declaredIn.set(e,new Set([t]))}function el(n,e,t,r){let i=n.args.get(e)??[];for(let s of t)i.push({value:s,...r?{guard:r}:{},unresolved:s.includes("${")});n.args.set(e,i)}function il(n,e,t,r,i){if(r.has(e))return;r.add(e);let s=or(n,e);if(!tl(s))return;let o;try{o=rl(kg(s,"utf8"))}catch(a){i.push({path:e,code:"cmake-parse",message:a.message});return}for(let a of o){let[c,...l]=a.args;switch(a.name){case"include":{if(!c)break;let u=c.startsWith("${ZEPHYR_BASE}/")?c.slice(15):null;u&&il(n,u,t,r,i);break}case"board_finalize_runner_args":{if(!c)break;t.finalized.add(c),qe(t,c,e),el(t,c,l,a.guard);break}case"board_runner_args":{if(!c)break;qe(t,c,e),el(t,c,l,a.guard);break}case"board_set_flasher_ifnset":{c&&t.flashDefault===void 0&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger_ifnset":{c&&t.debugDefault===void 0&&(t.debugDefault=c,qe(t,c,e));break}case"board_set_flasher":{c&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger":{c&&(t.debugDefault=c,qe(t,c,e));break}default:break}}}function Dg(n,e){let t=[];for(let r of n.select({under:"soc",match:i=>i==="CMakeLists.txt"||i.endsWith(".cmake")})){let i=n.read(r);if(!i.includes("board_finalize_runner_args"))continue;let s;try{s=rl(i)}catch(o){e.push({path:r,code:"cmake-parse",message:o.message});continue}for(let o of s){if(o.name!=="board_finalize_runner_args")continue;let[a,...c]=o.args;a&&t.push({path:r,runner:a,args:c.map(l=>({value:l,...o.guard?{guard:o.guard}:{},unresolved:l.includes("${")}))})}}return t}function sl(n){let e=vg(or(Rg(),"zephyr-ai-runners-")),t=or(e,"runner-export.py");try{Lg(t,sr,{mode:384});let r=Og(Zt(),[t,"--zephyr",n],{encoding:"utf8",maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let i=r.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`The west runner catalogue could not be exported:
${i}`)}return JSON.parse(r.stdout)}finally{Ag(e,{recursive:!0,force:!0})}}function ol(n){let e="scripts/west-commands.yml";if(!n.has(e))return[];let t=(0,nl.parse)(n.read(e),{logLevel:"silent"});if(!t||typeof t!="object")return[];let r=t["west-commands"];if(!Array.isArray(r))return[];let i=[];for(let s of r){if(!s||typeof s!="object")continue;let o=s,a=typeof o.file=="string"?o.file:"";for(let c of Array.isArray(o.commands)?o.commands:[]){if(!c||typeof c!="object")continue;let l=c;typeof l.name=="string"&&i.push({name:l.name,className:typeof l.class=="string"?l.class:"",file:a,...typeof l.help=="string"?{help:l.help}:{}})}}return i.sort(F(s=>s.name))}function al(n,e){let t=n.root,r=[],i=Dg(n,r),s=[],o=0;for(let u of e){let f=`${u.dir}/board.cmake`,d={finalized:new Set,args:new Map,declaredIn:new Map};tl(or(t,f))?il(t,f,d,new Set,r):o++;for(let h of i){if(!u.socDirs.some(y=>y&&h.path.startsWith(`${y}/`)))continue;d.finalized.add(h.runner),qe(d,h.runner,h.path);let p=d.args.get(h.runner)??[];p.push(...h.args),d.args.set(h.runner,p)}let m=new Set(d.finalized);d.flashDefault&&m.add(d.flashDefault),d.debugDefault&&m.add(d.debugDefault);for(let h of[...m].sort())s.push({board:u.name,runner:h,available:d.finalized.has(h),flashDefault:d.flashDefault===h,debugDefault:d.debugDefault===h,args:d.args.get(h)??[],declaredIn:[...d.declaredIn.get(h)??[]].sort()})}let a=new Set(s.map(u=>u.board)),c=e.filter(u=>!a.has(u.name)).length,l=[];return o>0&&l.push({path:"boards",code:"no-board-cmake",message:`${o} boards ship no board.cmake`}),c>0&&l.push({path:"boards",code:"no-runner-declared",message:`${c} boards declare no runner; report this as undeclared, never as unsupported`}),{boardRunners:s,report:{discovered:s.length,indexed:s.length,intentionallyExcluded:[],warnings:l,errors:r}}}var ll=Vt(Ut(),1);var cl="west.yml";function $g(n){let e=new Set;for(let t of n.select({under:"modules/",match:r=>r.startsWith("Kconfig")})){let r=t.split("/");r.length>2&&e.add(r[1])}return e}function as(n,e=[]){if(!n.has(cl))return[];let t;try{t=(0,ll.parse)(n.read(cl),{logLevel:"silent"})}catch{return[]}let r=t?.manifest?.projects;if(!Array.isArray(r))return[];let i=$g(n),s=new Map(e.map(a=>[a.name,a])),o=[];for(let a of r){if(!a||typeof a!="object")continue;let c=a,l=typeof c.name=="string"?c.name:"";if(!l)continue;let u=typeof c.path=="string"?c.path:"",f=typeof c.revision=="string"?c.revision:"",d=u.split("/").filter(Boolean).pop()??"",m=[l,d].find(p=>p&&i.has(p))??"",h=s.get(l);o.push({name:l,path:u,revision:f,glueDir:m,kconfigIngested:h?.kconfig??!1,sourceIngested:h?.source??!1})}return o.sort(F(a=>a.name))}function dl(n,e){let t=o=>o.replace(/\\/g,"/").replace(/\/+$/,""),r=t(n),i=null;for(let o of e){let a=t(o.path);a&&(r===a||r.endsWith(`/${a}`))&&(!i||a.length>i.length)&&(i={name:o.name,length:a.length})}if(i)return i.name;let s=r.split("/").pop()??"";return e.find(o=>o.name===s)?.name??null}var Pg=["boards/","dts/","soc/"];function Mg(n){return n.replace(/\/\*[\s\S]*?\*\//g,e=>e.replace(/[^\n]/g," ")).replace(/\/\/[^\n]*/g,e=>" ".repeat(e.length))}function ul(n,e){let t=[...e].filter(a=>a.dir).sort((a,c)=>c.dir.length-a.dir.length),r=[],i=new Set,s=[],o=0;for(let a of Pg)for(let c of n.select({under:a,match:l=>l.endsWith(".dts")||l.endsWith(".dtsi")||l.endsWith(".overlay")})){let l;try{l=n.read(c)}catch(d){r.push({path:c,code:"dts-read",message:d.message});continue}o++;let u=t.find(d=>c.startsWith(`${d.dir}/`))?.name??"",f=Mg(l);for(let d of f.matchAll(/(?:^|[\s;{}])compatible\s*=\s*([^;{}]*);/g))for(let m of d[1].matchAll(/"([^"]*)"/g)){let h=m[1].trim();if(!h)continue;let p=`${h}\0${c}\0${u}`;i.has(p)||(i.add(p),s.push({compatible:h,file:c,board:u}))}}return s.sort(F(a=>`${a.compatible}\0${a.file}\0${a.board}`)),{instances:s,report:{discovered:o,indexed:s.length,intentionallyExcluded:[],warnings:[],errors:r}}}var qg=new Set(["bool","tristate","int","hex","string"]),Ug={def_bool:"bool",def_tristate:"tristate",def_int:"int",def_hex:"hex",def_string:"string"};function Fg(n,e,t,r){return{name:n,defaults:[],depends:[],selects:[],implies:[],ranges:[],file:e,line:t,menuPath:[],isMenuconfig:r}}function Ue(n){let e=n.trimStart(),t=e[0];if(t==='"'||t==="'"){let i="",s=1;for(;s<e.length;){let o=e[s];if(o==="\\"&&s+1<e.length){i+=e[s+1],s+=2;continue}if(o===t){s++;break}i+=o,s++}return{value:i,rest:e.slice(s)}}let r=e.match(/^(\S+)/);return r?{value:r[1],rest:e.slice(r[1].length)}:{value:"",rest:""}}function Bt(n){let e=0,t=null;for(let r=0;r<n.length;r++){let i=n[r];if(t){i==="\\"?r++:i===t&&(t=null);continue}if(i==='"'||i==="'"){t=i;continue}if(i==="(")e++;else if(i===")")e--;else if(e===0&&n.startsWith("if",r)){let s=r===0?" ":n[r-1],o=n[r+2]??" ";if(/\s/.test(s)&&/\s/.test(o))return{head:n.slice(0,r).trim(),cond:n.slice(r+2).trim()}}}return{head:n.trim()}}function Bg(n){let e=null;for(let t=0;t<n.length;t++){let r=n[t];if(e){r==="\\"?t++:r===e&&(e=null);continue}if(r==='"'||r==="'")e=r;else if(r==="#")return n.slice(0,t)}return n}function Kg(n){let e=0;for(let t of n)if(t===" ")e+=1;else if(t==="	")e+=8-e%8;else break;return e}function fl(n,e){let t=n.split(/\r?\n/),r=[];for(let m=0;m<t.length;m++){let h=t[m],p=m+1;for(;h.endsWith("\\")&&m+1<t.length;)h=`${h.slice(0,-1)} ${t[++m].trim()}`;r.push({text:h,line:p})}let i=[],s=[],o=[],a=null,c=null,l=()=>o.flatMap(m=>m.kind!=="menu"&&m.cond?[m.cond]:[]),u=()=>o.flatMap(m=>m.kind==="menu"&&m.title?[m.title]:[]),f=()=>{for(let m=o.length-1;m>=0;m--){let h=o[m];if(h.kind==="choice")return h.choiceName??"<unnamed>"}},d=()=>{a&&(i.push(a),a=null)};for(let m=0;m<r.length;m++){let h=r[m],y=Bg(h.text).trim();if(y==="")continue;let[b="",...T]=y.split(/\s+/),_=T.join(" ");if(b==="help"||b==="---help---"){let E=[],S=-1,A=m+1;for(;A<r.length;A++){let v=r[A].text;if(v.trim()===""){E.push("");continue}let D=Kg(v);if(S===-1)S=D;else if(D<S)break;E.push(v.slice(Math.min(v.length,jg(v,S))))}m=A-1;let N=E.join(`
`).replace(/\n{3,}/g,`

`).trim();a?a.help=N:c&&(c.help=N);continue}switch(b){case"config":case"menuconfig":{d();let{value:E}=Ue(_);if(!E)continue;a=Fg(E,e,h.line,b==="menuconfig"),a.menuPath=u(),a.depends.push(...l());let S=f();if(S){a.choice=S;let A=s.find(N=>(N.name??"<unnamed>")===S);A&&A.options.push(E)}continue}case"choice":{d();let{value:E}=Ue(_);c={name:E||void 0,options:[],file:e,line:h.line},s.push(c),o.push({kind:"choice",choiceName:E||"<unnamed>"});continue}case"endchoice":{d(),c=null,cs(o,"choice");continue}case"menu":{d();let{value:E}=Ue(_);o.push({kind:"menu",title:E});continue}case"endmenu":{d(),cs(o,"menu");continue}case"if":{d(),o.push({kind:"if",cond:_.trim()});continue}case"endif":{d(),cs(o,"if");continue}case"source":case"rsource":case"osource":case"orsource":case"gsource":case"grsource":case"mainmenu":case"comment":{d();continue}default:break}if(!a&&!c)continue;if(qg.has(b)){let{value:E}=Ue(_),S=a??null;S?(S.type=b,E&&_.trimStart().startsWith('"')&&(S.prompt=E)):c&&E&&(c.prompt=E);continue}let w=Ug[b];if(w&&a){a.type=w;let{head:E,cond:S}=Bt(_);E&&a.defaults.push(S?{value:E,cond:S}:{value:E});continue}switch(b){case"prompt":{let{value:E,rest:S}=Ue(_),{cond:A}=Bt(S);a?(a.prompt=E,A&&a.depends.push(A)):c&&(c.prompt=E);break}case"default":{if(!a)break;let{head:E,cond:S}=Bt(_),{value:A}=Ue(E),v=E.trimStart().startsWith('"')?A:E;v&&a.defaults.push(S?{value:v,cond:S}:{value:v});break}case"depends":{let E=_.replace(/^on\s+/,"").trim();E&&a&&a.depends.push(E);break}case"select":case"imply":{if(!a)break;let{head:E,cond:S}=Bt(_),{value:A}=Ue(E);if(!A)break;let N=S?{value:A,cond:S}:{value:A};b==="select"?a.selects.push(N):a.implies.push(N);break}case"range":{if(!a)break;let{head:E,cond:S}=Bt(_),A=E.split(/\s+/).filter(Boolean);A.length>=2&&a.ranges.push(S?{low:A[0],high:A[1],cond:S}:{low:A[0],high:A[1]});break}case"visible":case"option":case"optional":case"modules":break;default:break}}return d(),{defs:i,choices:s}}function jg(n,e){let t=0,r=0;for(;t<n.length&&r<e;){let i=n[t];if(i===" ")r+=1;else if(i==="	")r+=8-r%8;else break;t++}return t}function cs(n,e){for(let t=n.length-1;t>=0;t--)if(n[t].kind===e){n.splice(t,1);return}}function ar(n,e){let t=new Set,r=[];for(let i of n){let s=e(i);t.has(s)||(t.add(s),r.push(i))}return r}function pl(n,e){let t=new Map;for(let s of n){let o=t.get(s.name);o?o.push(s):t.set(s.name,[s])}let r=new Set(e.map(s=>s.name).filter(Boolean)),i=[];for(let[s,o]of t){let a=o.find(l=>l.help&&l.prompt&&l.type)??o.find(l=>l.help)??o.find(l=>l.prompt)??o.find(l=>l.type)??o[0],c={name:s,type:o.find(l=>l.type)?.type,prompt:o.find(l=>l.prompt)?.prompt,help:o.find(l=>l.help)?.help,defaults:ar(o.flatMap(l=>l.defaults),l=>`${l.value}|${l.cond??""}`),depends:[...new Set(o.flatMap(l=>l.depends))],selects:ar(o.flatMap(l=>l.selects),l=>`${l.value}|${l.cond??""}`),implies:ar(o.flatMap(l=>l.implies),l=>`${l.value}|${l.cond??""}`),ranges:ar(o.flatMap(l=>l.ranges),l=>`${l.low}|${l.high}|${l.cond??""}`),definedIn:o.map(l=>({file:l.file,line:l.line})),menuPath:a.menuPath.join(" > "),isChoice:r.has(s),choice:o.find(l=>l.choice)?.choice,nDefs:o.length};i.push(c)}return i.sort(F(s=>s.name)),i}function ml(n,e,t){let r=[...new Set(e.map(c=>c.series).filter(c=>!!c))].sort((c,l)=>l.length-c.length),i=[],s=new Set,o=[],a=0;for(let c of n.select({under:"soc/",match:l=>l==="Kconfig"||l.startsWith("Kconfig.")&&!l.startsWith("Kconfig.defconfig")&&l!=="Kconfig.soc"})){let l=c.split("/"),u=r.find(d=>l.includes(d));if(!u)continue;a++;let f;try{f=fl(n.read(c),c)}catch(d){i.push({path:c,code:"kconfig-parse",message:d.message});continue}for(let d of pl(f.defs,f.choices)){if(t.has(d.name))continue;let m=`${d.name}\0${u}`;if(s.has(m))continue;s.add(m);let h=d.definedIn[0];o.push({name:d.name,series:u,file:h?.file??c,line:h?.line??0,type:d.type??"",prompt:d.prompt??"",help:d.help??""})}}return o.sort(F(c=>`${c.name} ${c.series}`)),{symbols:o,report:{discovered:a,indexed:o.length,intentionallyExcluded:[],warnings:[],errors:i}}}import{existsSync as ls,readFileSync as gl,statSync as Xg}from"node:fs";import{join as hl}from"node:path";function zg(n,e){let t;try{t=gl(n,"utf8")}catch(s){return e.push({path:n,code:"config-read",message:s.message}),[]}let r=[],i=new Set;for(let s of t.split(`
`)){let o=/^\s*#\s*(?:SB_)?CONFIG_([A-Za-z0-9_]+)\s+is not set\s*$/.exec(s);if(o){let l=o[1];i.has(l)||(i.add(l),r.push({name:l,value:"",set:!1}));continue}let a=/^\s*(?:SB_)?CONFIG_([A-Za-z0-9_]+)\s*=\s*(.*)$/.exec(s);if(!a)continue;let c=a[1];i.has(c)||(i.add(c),r.push({name:c,value:a[2].trim(),set:!0}))}return r.sort(F(s=>s.name))}function Yg(n,e){let t;try{t=gl(n,"utf8")}catch(l){return e.push({path:n,code:"dts-read",message:l.message}),[]}let r=t.replace(/\/\*[\s\S]*?\*\//g,l=>l.replace(/[^\n]/g," ")).replace(/\/\/[^\n]*/g,""),i=[],s=[],o=null,a=null,c=()=>{a&&i.push({...a}),a=null};for(let l of r.split(`
`)){let u=l.trim();if(u==="")continue;let f=/^(?:([A-Za-z_][\w-]*)\s*:\s*)?([^\s{};]+)\s*\{$/.exec(u);if(f){c(),o={label:f[1]??"",name:f[2]},s.push(o.name),a={path:`/${s.filter(h=>h!=="/").join("/")}`,label:o.label,compatible:"",status:""};continue}if(u.startsWith("}")){c(),s.pop();continue}if(!a)continue;let d=/^compatible\s*=\s*(.+);$/.exec(u);if(d){a.compatible=[...d[1].matchAll(/"([^"]*)"/g)].map(h=>h[1]).join(" ");continue}let m=/^status\s*=\s*"([^"]*)"\s*;$/.exec(u);m&&(a.status=m[1])}return c(),i.filter(l=>l.compatible||l.status||l.label).sort(F(l=>`${l.path} ${l.label}`))}function yl(n){let e=[],t=[],r=hl(n,"zephyr",".config"),i=hl(n,"zephyr","zephyr.dts"),s=[];for(let c of[r,i])ls(c)&&s.push({path:c,bytes:Xg(c).size});s.length===0&&t.push({path:n,code:"no-resolved-output",message:"the build directory holds neither zephyr/.config nor zephyr/zephyr.dts; run a build there before indexing it as a resolved build"});let o=ls(r)?zg(r,e):[],a=ls(i)?Yg(i,e):[];return{configs:o,nodes:a,files:s,report:{discovered:s.length,indexed:o.length+a.length,intentionallyExcluded:[],warnings:t,errors:e}}}import{createHash as us}from"node:crypto";import{existsSync as lr,readFileSync as cr,realpathSync as Kt,statSync as ty}from"node:fs";import{basename as El,dirname as ny,join as Fe,relative as ry,resolve as iy}from"node:path";import{spawnSync as _l}from"node:child_process";import{createHash as Gg}from"node:crypto";import{existsSync as Vg,lstatSync as Jg,readFileSync as Hg,readlinkSync as Wg,realpathSync as Zg}from"node:fs";import{join as Qg}from"node:path";import{spawnSync as ey}from"node:child_process";function ds(n,e){let t=ey("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function bl(n){let e=Zg(n),t=ds(e,["rev-parse","HEAD"]);if(!t)return null;let r=ds(e,["diff","--binary","HEAD"])??"",i=(ds(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=Qg(e,s);if(!Vg(o))return{path:s,missing:!0};try{let a=Jg(o);return a.isSymbolicLink()?{path:s,symlink:Wg(o)}:a.isFile()?{path:s,sha256:Gg("sha256").update(Hg(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(r||i.length),stateFingerprint:me({commit:t,diff:r,untracked:i})}}function sy(n,e){let t=_l("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function oy(n){let e=cr(Fe(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",r=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),i=t("EXTRAVERSION");return i?`${r}-${i}`:r}function ay(n){let e=iy(n);for(;;){if(lr(Fe(e,".west","config")))return e;let t=ny(e);if(t===e)return;e=t}}function cy(n){if(!n)return;let e=_l("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return us("sha256").update(e.stdout).digest("hex");let t="",r="west.yml";try{let o=cr(Fe(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",r=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??r}catch{}let s=[...t?[Fe(n,t,r)]:[],Fe(n,"west.yml"),Fe(n,"west.yaml")].find(lr);return s?us("sha256").update(cr(s)).digest("hex"):void 0}function Tl(n){let e=Kt(n),t=bl(e);if(t)return{name:El(e),...t};let r=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(i=>Fe(e,i)).filter(lr).map(i=>{let s=ty(i);return{path:ry(e,i),bytes:s.size,sha256:us("sha256").update(cr(i)).digest("hex")}});return{name:El(e),markers:r}}function Nl(n){let e=Kt(n.zephyrRoot),t=n.projectRoot&&lr(n.projectRoot)?Kt(n.projectRoot):void 0,r=sy(e,["rev-parse","HEAD"]);if(!r)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let i=ay(t??e),s=cy(i),o=n.modules.map(d=>Tl(d)),a=me(o),c=Tl(e),l=String(c.stateFingerprint??me(c)),u=n.pinnedCommit===r&&c.dirty===!1?"pinned-upstream":i?"west-workspace":"explicit-tree",f={descriptorVersion:Rs,schemaVersion:Jt,builderVersion:Os,sourceKind:u,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:oy(e),zephyrCommit:r,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:Kt(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:Kt(n.buildDirectory)}:{},...n.producer?{producer:n.producer}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index covering the application and sysbuild namespaces; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},west:{complete:!!n.westComplete,note:n.westComplete?void 0:"The west package was not importable when this index was built, so runners that import it \u2014 openocd among them \u2014 carry no capabilities."},resolvedBuild:{complete:!!n.buildDirectory,note:n.buildDirectory?"Resolved .config values and merged devicetree nodes are ingested from the named build directory; they describe that one build, not the tree.":"No resolved build output was supplied or ingested, so questions about what a build actually resolved to are answered from the tree rather than from the build."},modules:{complete:n.modules.length>0,note:n.modules.length>0?"Module sources are readable at their manifest revisions; Kconfig and bindings were evaluated only for the module roots passed to the indexer.":"Module sources are readable at their manifest revisions, but no module Kconfig or bindings were evaluated, so a symbol a module redeclares is not judged."}}};return{...f,createdAt:new Date().toISOString(),contextFingerprint:Is(f)}}import{createHash as Sl}from"node:crypto";var ly=new Set(["built_at","index_descriptor","context_fingerprint","source_path","ingest_version","content_hash","table_hashes","input_hash"]);function dy(n){return/_fts(_|$)/.test(n)||n.startsWith("sqlite_")}function fs(n){let r=n.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map(s=>s.name).filter(s=>!dy(s)),i={};for(let s of r){let o=Sl("sha256");if(s==="meta"){let a=n.prepare("SELECT key, value FROM meta ORDER BY key").all();for(let c of a)ly.has(c.key)||o.update(`${c.key}\0${c.value}`)}else for(let a of n.prepare(`SELECT * FROM "${s}" ORDER BY rowid`).all()){for(let c of Object.values(a))o.update(c===null?"\0null":String(c)),o.update("\0");o.update("")}i[s]=o.digest("hex")}return i}function wl(n){let e=Sl("sha256");for(let[t,r]of Object.entries(fs(n)))e.update(`${t}\0${r}`);return e.digest("hex")}import{createHash as kl}from"node:crypto";import{existsSync as uy,readFileSync as ps,readdirSync as fy,statSync as py}from"node:fs";import{join as dr,relative as my,sep as hy}from"node:path";import{spawnSync as gy}from"node:child_process";function ms(n){return kl("sha1").update(`blob ${n.length}\0`).update(n).digest("hex")}function Al(n,e){let t=gy("git",["-C",n,...e],{encoding:"utf8",maxBuffer:536870912,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout:null}var yy=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function by(n){let e=[],t=[n];for(;t.length>0;){let r=t.pop();for(let i of fy(r,{withFileTypes:!0})){let s=dr(r,i.name);i.isDirectory()?yy.has(i.name)||t.push(s):i.isFile()&&e.push(my(n,s).split(hy).join("/"))}}return e.sort()}function Ey(n){let e=Al(n,["ls-files","-s","-z"]);if(e===null)return null;let t=[];for(let r of e.split("\0")){if(r==="")continue;let i=r.indexOf("	");if(i<0)continue;let[s,o]=r.slice(0,i).split(/\s+/);s!=="100644"&&s!=="100755"||t.push({path:r.slice(i+1),hash:o})}return t}var nt=class n{root;addressed;entries;#e;constructor(e,t,r){this.root=e,this.addressed=t,this.entries=r,this.#e=new Map(r.map(i=>[i.path,i.hash]))}static forRoot(e){let t=Ey(e);if(t===null){let c=by(e).map(l=>({path:l,hash:ms(ps(dr(e,l)))}));return new n(e,!1,c)}let r=Al(e,["status","--porcelain","-z","--untracked-files=all"])??"",i=new Set,s=r.split("\0");for(let c=0;c<s.length;c++){let l=s[c];if(l.length<4)continue;let u=l.slice(3);l[0]==="R"&&c++,i.add(u)}let o=new Map(t.map(c=>[c.path,c]));for(let c of i){if(c===""||c===vl)continue;let l=dr(e,c);if(!uy(l)||!py(l).isFile()){o.delete(c);continue}o.set(c,{path:c,hash:ms(ps(l))})}o.delete(vl);let a=[...o.values()].sort((c,l)=>c.path<l.path?-1:c.path>l.path?1:0);return new n(e,!0,a)}fingerprint(){let e=kl("sha256");e.update(this.addressed?"addressed":"unaddressed");for(let t of this.entries)e.update(`${t.path}\0${t.hash}`);return e.digest("hex")}select(e){let t=e.under?`${e.under.replace(/\/+$/,"")}/`:"",r=(e.skip??[]).map(s=>`${s.replace(/\/+$/,"")}/`),i=[];for(let s of this.entries){if(t&&!s.path.startsWith(t)||r.some(c=>s.path.startsWith(c)))continue;let o=s.path.split("/");if(e.skipSegments&&o.slice(0,-1).some(c=>e.skipSegments.has(c)))continue;let a=o[o.length-1];e.match(a)&&i.push(s.path)}return i}has(e){return this.#e.has(e)}readBinary(e){let t=this.#e.get(e);if(t===void 0)throw new Error(`${e} is not a declared input of ${this.root}`);let r=ps(dr(this.root,e)),i=ms(r);if(i!==t)throw new Error(`${e} changed while the index was being built (declared ${t}, read ${i})`);return r}read(e){return this.readBinary(e).toString("utf8")}},vl=".zephyr-ai-managed.json";import{spawnSync as Ty}from"node:child_process";var _y=["PATH","HOME","USERPROFILE","SYSTEMROOT","TMPDIR","TEMP","TMP","PYTHON_EXECUTABLE","ZEPHYR_BASE","ZEPHYR_AI_PROJECT_ROOT","ZEPHYR_AI_PLUGIN_DATA","CLAUDE_PROJECT_DIR","CLAUDE_PLUGIN_DATA"],Ny={LC_ALL:"C",LANG:"C",LC_COLLATE:"C",TZ:"UTC",PYTHONHASHSEED:"0",PYTHONDONTWRITEBYTECODE:"1",PYTHONNOUSERSITE:"1",GIT_CONFIG_NOSYSTEM:"1",SOURCE_DATE_EPOCH:"0"},Ll="ZEPHYR_AI_HERMETIC";function hs(n){let e={...Ny,[Ll]:"1"};for(let t of _y){let r=n[t];r!==void 0&&(e[t]=r)}return e}function Rl(n){let e=new Set(["PATH","HOME","USERPROFILE","SYSTEMROOT","TMPDIR","TEMP","TMP"]);return Object.fromEntries(Object.entries(n).filter(([t])=>!e.has(t)).sort(([t],[r])=>t<r?-1:t>r?1:0))}function Ol(n=process.env){return n[Ll]==="1"}function xl(n){let e=Ty(process.execPath,n,{env:hs(process.env),stdio:"inherit"});e.error&&(process.stderr.write(`zephyr-ai-ingest: could not re-exec hermetically: ${e.error.message}
`),process.exit(1)),process.exit(e.status??1)}import{spawnSync as wy}from"node:child_process";import{existsSync as gs,mkdirSync as vy,mkdtempSync as ky,renameSync as Ay,rmSync as Ly,writeFileSync as Ry}from"node:fs";import{dirname as Il,join as jt,resolve as Oy}from"node:path";var Q={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var Cl=Q,Dl=".zephyr-ai-managed.json";function ur(n,e){return wy("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function xy(n){if(!gs(jt(n,".git"))||!gs(jt(n,"VERSION")))return!1;let e=ur(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==Q.commit)return!1;let t=ur(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(r=>r.endsWith(` ${Dl}`))}function $l(n,e){let t=Oy(n,"sources",`zephyr-${Q.version}-${Q.commit.slice(0,12)}`);if(xy(t))return e(`Using pinned Zephyr ${Q.version} checkout at ${t}`),t;if(gs(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${Q.version}.`);vy(Il(t),{recursive:!0});let r=ky(jt(Il(t),".zephyr-ai-fetch-")),i=jt(r,"zephyr");try{e(`Cloning pinned Zephyr ${Q.version}; this requires network access and may take several minutes.`);let s=ur(["clone","--depth","1","--branch",Q.tag,"--single-branch",Q.repository,i]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=ur(["rev-parse","HEAD"],i);if(o.status!==0||o.stdout.trim()!==Q.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${Q.commit}.`);return Ry(jt(i,Dl),`${JSON.stringify({owner:"zephyr-ai",repository:Q.repository,tag:Q.tag,commit:Q.commit},null,2)}
`,{flag:"wx"}),Ay(i,t),e(`Pinned Zephyr ${Q.version} is ready at ${t}`),t}finally{Ly(r,{recursive:!0,force:!0})}}var Pl={name:"@zephyr-ai/ingest",version:"0.8.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function By(n){let e=de(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??H(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requireWest:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let r=0;r<n.length;r++){let i=n[r];switch(i){case"--zephyr":t.zephyr=de(n[++r]);break;case"--out":t.out=de(n[++r]);break;case"--project-root":t.projectRoot=de(n[++r]);break;case"--plugin-data":t.pluginData=de(n[++r]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++r];break;case"--application":t.applicationRoot=de(n[++r]);break;case"--build-dir":t.buildDirectory=de(n[++r]);break;case"--api-xml":t.apiXml=de(n[++r]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-west":t.requireWest=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(de(n[++r]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${i}`)}}return t.zephyr=de(t.zephyr),t}function Ky(){for(let n of[H(import.meta.dirname,"..","..","..","zephyr.lock.json"),H(import.meta.dirname,"..","..","zephyr.lock.json"),H(import.meta.dirname,"..","zephyr.lock.json")])try{return JSON.parse(Fl(n,"utf8"))}catch{}return{}}function ys(n){return n==null?null:JSON.stringify(n)}function jy(n){return me({tree:{fingerprint:n.tree.fingerprint(),addressed:n.tree.addressed},modules:n.modules.map(e=>({fingerprint:e.fingerprint(),addressed:e.addressed})),apiXml:n.apiXml?{fingerprint:n.apiXml.fingerprint(),addressed:n.apiXml.addressed}:null,adapters:n.adapters.map(e=>Uy("sha256").update(e).digest("hex")),lock:n.lock,producer:n.producer,environment:n.environment})}function Xy(n){let e=H(n,"scripts","requirements-base.txt");return zt(e)?Fs(Fl(e,"utf8")):[]}function zy(n,e){let t=(i,s)=>{let o=Fy(i,s,{encoding:"utf8",timeout:5e3});if(o.status===0)return`${o.stdout}${o.stderr}`.trim().split(`
`)[0]??void 0},r;try{r=t(xe(n),["--version"])}catch{}return{node:process.version,sqlite:String(new Kl(":memory:").prepare("SELECT sqlite_version() AS v").get()?.v??""),...r?{python:r}:{},...e?{doxygen:t("doxygen",["--version"])??"unknown"}:{},collator:new Intl.Collator().resolvedOptions().locale}}function Es(n){let e=Py(n,"r");try{Dy(e)}finally{Cy(e)}}function Ul(n){try{Es(n)}catch{}}function Yy(n,e){let t=My(n,{withFileTypes:!0}).filter(i=>i.isDirectory()&&/^[a-f0-9]{64}$/.test(i.name)).flatMap(i=>{let s=H(n,i.name),o=H(s,"zephyr.db");if(!zt(o))return[];let a=H(s,"last-used");return[{fingerprint:i.name,directory:s,usedAt:Bl(zt(a)?a:o).mtimeMs}]}).sort((i,s)=>s.usedAt-i.usedAt),r=new Set([e,...t.filter(i=>i.fingerprint!==e).slice(0,4).map(i=>i.fingerprint)]);for(let i of t)r.has(i.fingerprint)||bs(i.directory,{recursive:!0,force:!0})}function Gy(){let n=By(process.argv.slice(2)),e=O=>{n.quiet||process.stderr.write(`${O}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=$l(n.pluginData,e)}if(!zt(H(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(xe(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let O=js(n.zephyr);O&&(n.apiXml=O,e(`Using auto-detected Doxygen XML from ${O}`))}let t=n.fetchPinned?Cl:Ky();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let r=sl(n.zephyr);if(n.requireWest&&!r.complete)throw new Error("The west runner catalogue is incomplete: the selected interpreter cannot import the west package, which openocd needs, and hundreds of boards select openocd. An index built here would omit it without saying so. Install the tree's requirements (python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.");let i=zy(n.zephyr,n.apiXml),s=Nl({zephyrRoot:n.zephyr,westComplete:r.complete,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml,producer:i}),o=s.zephyrVersion;if(n.requirePinned&&(!t.commit||s.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${s.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let a=`https://docs.zephyrproject.org/${o}/`,c,l=n.out;if(!l&&n.pluginData)if(s.projectRoot){let O=H(n.pluginData,"indexes","projects",xs(s.projectRoot));l=H(O,s.contextFingerprint,"zephyr.db"),c=H(O,"active.json")}else l=H(n.pluginData,"indexes","defaults",s.zephyrCommit,String(s.schemaVersion),"zephyr.db");l??=H(de(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${o} from ${n.zephyr}`);let u=Date.now(),f=Date.now(),d=nt.forRoot(n.zephyr);e(`  manifest  ${d.entries.length} files, ${d.addressed?"content-addressed":"UNADDRESSED"} (${Date.now()-f} ms)`);let m=Date.now(),{pages:h,report:p}=Yc(d,a),y=h.reduce((O,re)=>O+re.chunks.length,0);e(`  docs      ${h.length} pages, ${y} sections (${Date.now()-m} ms)`);let b=Date.now(),T=new Map([["zephyr",os(n.zephyr,n.modules,"zephyr")],["sysbuild",os(n.zephyr,[],"sysbuild")]]),_=T.get("zephyr");e(`  kconfig   ${_.symbols.length} symbols from ${_.filesScanned} files, ${T.get("sysbuild").symbols.length} sysbuild (${Date.now()-b} ms)`);let w=Date.now(),E=[H(n.zephyr,"dts","bindings"),...n.modules.map(O=>H(O,"dts","bindings")).filter(zt)],{bindings:S,fragments:A,report:N}=Gs(E),v=O=>O.properties.length+O.children.reduce((re,fr)=>re+v(fr),0),D=S.reduce((O,re)=>O+v(re),0);e(`  bindings  ${S.length} compatibles, ${D} properties, ${A} fragments (${Date.now()-w} ms)`);let G=Date.now(),$=Fc(d),R=Bc(d),V=$.reduce((O,re)=>O+re.targets.length,0);e(`  boards    ${$.length} boards, ${V} targets, ${R.length} SoCs (${Date.now()-G} ms)`);let oe=Date.now(),rt=ml(d,R,new Set(_.symbols.map(O=>O.name)));e(`  soc kconf ${rt.symbols.length} series-scoped symbols from ${rt.report.discovered} files (${Date.now()-oe} ms)`);let ye=n.buildDirectory?yl(n.buildDirectory):{configs:[],nodes:[],files:[],report:{discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]}};n.buildDirectory&&e(`  resolved  ${ye.configs.length} config values, ${ye.nodes.length} devicetree nodes from ${ye.files.length} build artefact(s)`);let jl=Date.now(),it=ul(d,$.map(O=>({name:O.name,dir:O.dir})));e(`  dt uses   ${it.instances.length} instantiations across ${it.report.discovered} devicetree files (${Date.now()-jl} ms)`);let Xl=Date.now(),zl=new Map(R.map(O=>[O.name,O.dir])),Yl=ol(d),st=al(d,$.map(O=>({name:O.name,dir:O.dir,socDirs:[...new Set(O.socs.map(re=>zl.get(re.name)).filter(re=>!!re))]}))),Gl=as(d,[]),Vl=as(d,n.modules.map(O=>dl(O,Gl)).filter(O=>!!O).map(O=>({name:O,kconfig:!0,source:!0}))),W={runners:r.runners,commands:Yl,boardRunners:st.boardRunners,modules:Vl};e(`  west      ${W.runners.length} runners, ${W.commands.length} commands, ${W.boardRunners.length} board bindings, ${W.modules.length} modules (${W.modules.filter(O=>O.kconfigIngested).length} resolved)${r.complete?"":", incomplete"} (${Date.now()-Xl} ms)`);let Jl=Date.now(),be=Zc(d);e(`  samples   ${be.length} (${Date.now()-Jl} ms)`);let Hl=Date.now(),Ee=Xs(d,n.apiXml),Wl=n.apiXml?nt.forRoot(n.apiXml):null,Ts=jy({tree:d,modules:n.modules.map(O=>nt.forRoot(O)),apiXml:Wl,adapters:[nr,en,Ht,sr],lock:t,producer:i,environment:Rl(hs(process.env))});e(`  api       ${Ee.symbols.length} symbols, ${Ee.groups.length} groups, ${Ee.mode} (${Date.now()-Hl} ms)`),$y(Xt(l),{recursive:!0});let ot=H(Xt(l),`.${ql()}.zephyr.db.tmp`),L,_s=!1;try{L=new Kl(ot),L.exec(Ds);let O=Date.now();L.exec("BEGIN");let re=L.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),fr=L.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),Zl=L.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let g of h){let x=re.run(g.path,g.url,g.title,g.area,JSON.stringify(g.labels)),U=Number(x.lastInsertRowid);for(let q of g.origins)Zl.run(U,q.path,q.startLine,q.endLine,q.directive);for(let q of g.chunks)fr.run(U,q.anchor??null,q.heading,q.headingPath.join(" > "),q.ord,g.title,q.body)}for(let[g,x]of T){let U=L.prepare(`INSERT INTO kconfig
         (name, scope, type, prompt, help, defaults, depends, selects, implies, ranges,
          defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),q=L.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind, scope) VALUES (?, ?, ?, ?)"),Be=new Map;for(let I of x.symbols){let Te=I.definitions.flatMap(P=>P.defaults.map(B=>({value:B.value.display,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),j=I.definitions.map(P=>P.condition.display).filter((P,B,Ad)=>P!=="y"&&Ad.indexOf(P)===B),ie=I.definitions.flatMap(P=>P.selects.map(B=>({value:B.target,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),Z=I.definitions.flatMap(P=>P.implies.map(B=>({value:B.target,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),hr=I.definitions.flatMap(P=>P.ranges.map(B=>({low:B.low.display,high:B.high.display,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),Ke=I.definitions.find(P=>P.prompt)?.prompt??"",vd=I.definitions.find(P=>P.menuPath.length>0)?.menuPath.join(" > ")??"",kd=U.run(I.name,g,I.type??null,Ke,I.help??"",JSON.stringify(Te),JSON.stringify(j),JSON.stringify(ie),JSON.stringify(Z),JSON.stringify(hr),JSON.stringify(I.definitions.map(P=>({file:P.file,line:P.line}))),vd,I.choice?1:0,I.choice??null,I.definitions.length,I.hasPrompt?1:0);Be.set(I.name,Number(kd.lastInsertRowid));for(let P of ie)q.run(I.name,P.value,"select",g);for(let P of Z)q.run(I.name,P.value,"imply",g);let As=P=>[...P.kind==="symbol"&&P.value?[P.value]:[],...(P.children??[]).flatMap(As)];for(let P of I.definitions)for(let B of As(P.condition))q.run(I.name,B,"depends",g)}let mr=L.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),pe=new Map,ee=I=>{if(!I)return null;let Te=Y(I),j=pe.get(Te);if(j!==void 0)return j;let ie=I.children??[],Z=Number(mr.run(I.kind,I.value??null,I.display,ee(ie[0]??null),ee(ie[1]??null)).lastInsertRowid);return pe.set(Te,Z),Z},z=L.prepare(`INSERT INTO kconfig_definition
         (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
          is_menuconfig, is_configdefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),at=L.prepare(`INSERT INTO kconfig_default
         (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),Yt=L.prepare(`INSERT INTO kconfig_relation
         (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?, ?)`),Nd=L.prepare(`INSERT INTO kconfig_range
         (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?)`);for(let I of x.symbols){let Te=Be.get(I.name);for(let j of I.definitions){let ie=Number(z.run(Te,j.file,j.line,j.prompt,JSON.stringify(j.menuPath),ee(j.condition),ee(j.promptCondition),j.isMenuconfig?1:0,j.isConfigDefault?1:0).lastInsertRowid);for(let Z of j.defaults)at.run(ie,ee(Z.value),ee(Z.condition),Z.order);for(let[Z,hr]of[["select",j.selects],["imply",j.implies]])for(let Ke of hr)Yt.run(ie,Z,Ke.target,Be.get(Ke.target)??null,ee(Ke.condition),Ke.order);for(let Z of j.ranges)Nd.run(ie,ee(Z.low),ee(Z.high),ee(Z.condition),Z.order)}}let Sd=L.prepare("INSERT INTO kconfig_choice (stable_id, scope, name, type, definitions) VALUES (?, ?, ?, ?, ?)"),wd=L.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let I of x.choices){let Te=Number(Sd.run(I.id,g,I.name,I.type,JSON.stringify(I.definitions)).lastInsertRowid);for(let j of new Set(I.members)){let ie=Be.get(j);ie!==void 0&&wd.run(Te,ie)}}}let Ql=L.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),ed=L.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),td=L.prepare(`INSERT INTO soc_kconfig (name, series, file, line, type, prompt, help)
     VALUES (?, ?, ?, ?, ?, ?, ?)`);for(let g of rt.symbols)td.run(g.name,g.series,g.file,g.line,g.type,g.prompt,g.help);let nd=L.prepare("INSERT INTO resolved_config (name, value, is_set) VALUES (?, ?, ?)");for(let g of ye.configs)nd.run(g.name,g.value,g.set?1:0);let rd=L.prepare("INSERT INTO resolved_node (path, label, compatible, status) VALUES (?, ?, ?, ?)");for(let g of ye.nodes)rd.run(g.path,g.label,g.compatible,g.status);let id=L.prepare("INSERT INTO dt_instance (compatible, file, board) VALUES (?, ?, ?)");for(let g of it.instances)id.run(g.compatible,g.file,g.board);let sd=L.prepare("INSERT INTO text_pool (text) VALUES (?)"),Ns=new Map,od=g=>{if(!g)return null;let x=Ns.get(g);if(x!==void 0)return x;let U=Number(sd.run(g).lastInsertRowid);return Ns.set(g,U),U};for(let g of S){let x=g.compatible,U=(pe,ee=0,z="")=>[...pe.properties.map(at=>({level:ee,childPath:z,property:at})),...pe.children.flatMap((at,Yt)=>U(at,ee+1,z?`${z}/${Yt}`:String(Yt)))],q=U(g),Be=Ql.run(x,g.path,g.description??"",g.bus===void 0||g.bus===null?null:typeof g.bus=="string"?g.bus:JSON.stringify(g.bus),g.onBus??null,JSON.stringify(g.cells),JSON.stringify(g.includes),q.map(({property:pe})=>pe.name).join(" "),q.length,x.includes(",")?x.split(",")[0]:null),mr=Number(Be.lastInsertRowid);for(let{level:pe,childPath:ee,property:z}of q)ed.run(mr,pe,z.name,z.type??null,z.required?1:0,od(z.description),ys(z.default),ys(z.enum),ys(z.const),z.deprecated?1:0,z.specifierSpace??null,z.inheritedFrom??null,JSON.stringify(z.provenance??{}),JSON.stringify(z.constraints??{}),ee)}let ad=L.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path,
        no_xip_targets)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of $){let x=g.socs.map(U=>U.name);ad.run(g.name,g.fullName??"",g.vendor??"",g.dir,g.arch??null,g.ram??null,g.flash??null,JSON.stringify(g.socs),x.join(" "),JSON.stringify(g.targets),g.targets.map(U=>U.identifier).join(" "),JSON.stringify(g.revisions),g.defaultRevision??null,JSON.stringify(g.supported),g.supported.join(" "),g.docPath??null,JSON.stringify(g.noXipTargets))}let cd=L.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let g of R)cd.run(g.name,g.series??null,g.family??null,g.vendor??null,g.dir,JSON.stringify(g.cpuclusters));let ld=L.prepare("INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)");for(let g of W.runners)ld.run(g.name,g.module,g.description??null,Y(g.capabilities),JSON.stringify(g.capabilities.commands??[]));let dd=L.prepare("INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)");for(let g of W.commands)dd.run(g.name,g.className,g.file,g.help??null);let ud=L.prepare(`INSERT INTO west_module (name, path, revision, glue_dir, kconfig_ingested, source_ingested)
     VALUES (?, ?, ?, ?, ?, ?)`);for(let g of W.modules)ud.run(g.name,g.path,g.revision,g.glueDir,g.kconfigIngested?1:0,g.sourceIngested?1:0);let fd=L.prepare(`INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`);for(let g of W.boardRunners)fd.run(g.board,g.runner,g.available?1:0,g.flashDefault?1:0,g.debugDefault?1:0,JSON.stringify(g.args),JSON.stringify(g.declaredIn));let pd=L.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),md=L.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),Ss=L.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let g of be){let x=pd.run(g.path,g.kind,g.name,g.description??"",JSON.stringify(g.tags),g.tags.join(" "),JSON.stringify(g.scenarios),JSON.stringify(g.dependsOn),JSON.stringify(g.integrationPlatforms),JSON.stringify(g.platformAllow),JSON.stringify(g.files),g.docPath??null),U=Number(x.lastInsertRowid);for(let q of g.contents)md.run(U,q.path,q.text);for(let q of g.integrationPlatforms)Ss.run(U,q,"integration");for(let q of g.platformAllow)Ss.run(U,q,"allowlist")}let hd=L.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of Ee.symbols)hd.run(g.name,g.kind,g.signature,g.brief??"",g.detail??"",JSON.stringify(g.params),JSON.stringify(g.returns),JSON.stringify(g.retvals),g.group??null,g.since??null,g.deprecated?1:0,g.header,g.line,g.doxygenId??null,g.compoundId??null,g.docAnchor??null,g.parentSymbol??null);let gd=L.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let g of Ee.groups)gd.run(g.id,g.title,g.parent??null,g.header);let yd=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),bd={schema_version:String(Cs),zephyr_version:o,zephyr_commit:s.zephyrCommit,zephyr_tag:s.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:s.sourceKind,index_descriptor:Y(s),context_fingerprint:s.contextFingerprint,module_fingerprint:s.moduleFingerprint,doc_base_url:a,built_at:new Date().toISOString(),ingest_version:Pl.version,count_docs:String(h.length),count_doc_chunks:String(y),report_docs:Y(p),count_kconfig:String(_.symbols.length),count_kconfig_sysbuild:String(T.get("sysbuild").symbols.length),report_kconfig:Y({discovered:[...T.values()].reduce((g,x)=>g+x.symbols.length+x.choices.length,0),indexed:[...T.values()].reduce((g,x)=>g+x.symbols.length+x.choices.length,0),intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts cover both Kconfig namespaces: the application tree and sysbuild."},...[...T].map(([g,x])=>({code:"source-files",message:`Kconfiglib evaluated ${x.filesScanned} source files for the ${g} namespace.`})),...[...T].flatMap(([g,x])=>x.warnings.map(U=>({code:"kconfiglib",message:`${g}: ${U}`})))],errors:[]}),count_bindings:String(S.length),count_dt_instances:String(it.instances.length),report_dt_instances:Y(it.report),count_soc_kconfig:String(rt.symbols.length),report_soc_kconfig:Y(rt.report),count_resolved_configs:String(ye.configs.length),count_resolved_nodes:String(ye.nodes.length),report_resolved_build:Y(ye.report),count_dt_properties:String(D),report_bindings:Y(N),count_boards:String($.length),count_board_targets:String(V),count_socs:String(R.length),report_boards:Y({discovered:$.length+V+R.length,indexed:$.length+V+R.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),python_requirements:Y(Xy(n.zephyr)),count_runners:String(W.runners.length),count_west_commands:String(W.commands.length),count_board_runners:String(W.boardRunners.length),count_west_modules:String(W.modules.length),report_west:Y({discovered:r.report.discovered+W.commands.length+st.report.discovered,indexed:W.runners.length+W.commands.length+st.report.indexed,intentionallyExcluded:r.report.intentionallyExcluded,warnings:[...r.report.warnings,...st.report.warnings,{code:"report-units",message:"Counts include runner classes, west commands, and board-runner pairings."}],errors:[...r.report.errors,...st.report.errors]}),count_samples:String(be.length),report_samples:Y({discovered:be.length+be.reduce((g,x)=>g+x.contents.length+x.exclusions.length,0),indexed:be.length+be.reduce((g,x)=>g+x.contents.length,0),intentionallyExcluded:be.flatMap(g=>g.exclusions.map(x=>({path:`${g.path}/${x.path}`,reason:x.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(Ee.symbols.length),api_ingest_mode:Ee.mode,report_api:Y(Ee.report)};for(let[g,x]of Object.entries(bd))yd.run(g,x);L.exec("COMMIT"),e(`  written   (${Date.now()-O} ms)`);let Ed=fs(L),ws=wl(L),pr=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");pr.run("table_hashes",Y(Ed)),pr.run("input_hash",Ts),pr.run("content_hash",ws),e(`  inputs    ${Ts.slice(0,16)}\u2026`),e(`  content   ${ws.slice(0,16)}\u2026`);let Td=Date.now();L.exec($s),e(`  indexed   full-text (${Date.now()-Td} ms)`),L.exec("VACUUM"),L.exec("PRAGMA optimize");let vs=String(L.prepare("PRAGMA integrity_check").get()?.integrity_check??""),ks=L.prepare("PRAGMA foreign_key_check").all();if(vs!=="ok"||ks.length>0)throw new Error(`Index verification failed (integrity=${vs}, foreign-key violations=${ks.length}).`);for(let[g,x]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let U=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${g}`).get()?.n),q=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${x}`).get()?.n);if(U!==q)throw new Error(`Index verification failed: ${g} has ${U} rows; ${x} has ${q}.`)}if(L.close(),L=void 0,Es(ot),Ml(ot,l),Ul(Xt(l)),_s=!0,c){let g=`${c}.${ql()}.tmp`;qy(g,`${Y({contextFingerprint:s.contextFingerprint,relativePath:`${s.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),Es(g),Ml(g,c),Ul(Xt(c)),Yy(Xt(c),s.contextFingerprint)}let _d=Bl(l).size;e(`Done in ${((Date.now()-u)/1e3).toFixed(1)} s -> ${l} (${(_d/1024/1024).toFixed(1)} MiB)`)}finally{try{L?.close()}catch{}_s||(bs(ot,{force:!0}),bs(`${ot}-journal`,{force:!0}))}}Ol()||xl(process.argv.slice(1));try{Gy()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
