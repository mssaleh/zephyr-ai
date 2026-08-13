#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var Ql=Object.create;var Es=Object.defineProperty;var ed=Object.getOwnPropertyDescriptor;var td=Object.getOwnPropertyNames;var nd=Object.getPrototypeOf,rd=Object.prototype.hasOwnProperty;var Bt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var S=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var id=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of td(e))!rd.call(n,i)&&i!==t&&Es(n,i,{get:()=>e[i],enumerable:!(r=ed(e,i))||r.enumerable});return n};var lr=(n,e,t)=>(t=n!=null?Ql(nd(n)):{},id(e||!n||!n.__esModule?Es(t,"default",{value:n,enumerable:!0}):t,n));var x=S(V=>{"use strict";var mr=Symbol.for("yaml.alias"),Us=Symbol.for("yaml.document"),Gt=Symbol.for("yaml.map"),Fs=Symbol.for("yaml.pair"),hr=Symbol.for("yaml.scalar"),Jt=Symbol.for("yaml.seq"),he=Symbol.for("yaml.node.type"),Md=n=>!!n&&typeof n=="object"&&n[he]===mr,Ud=n=>!!n&&typeof n=="object"&&n[he]===Us,Fd=n=>!!n&&typeof n=="object"&&n[he]===Gt,Bd=n=>!!n&&typeof n=="object"&&n[he]===Fs,Bs=n=>!!n&&typeof n=="object"&&n[he]===hr,jd=n=>!!n&&typeof n=="object"&&n[he]===Jt;function js(n){if(n&&typeof n=="object")switch(n[he]){case Gt:case Jt:return!0}return!1}function Kd(n){if(n&&typeof n=="object")switch(n[he]){case mr:case Gt:case hr:case Jt:return!0}return!1}var Xd=n=>(Bs(n)||js(n))&&!!n.anchor;V.ALIAS=mr;V.DOC=Us;V.MAP=Gt;V.NODE_TYPE=he;V.PAIR=Fs;V.SCALAR=hr;V.SEQ=Jt;V.hasAnchor=Xd;V.isAlias=Md;V.isCollection=js;V.isDocument=Ud;V.isMap=Fd;V.isNode=Kd;V.isPair=Bd;V.isScalar=Bs;V.isSeq=jd});var st=S(gr=>{"use strict";var K=x(),Q=Symbol("break visit"),Ks=Symbol("skip children"),ue=Symbol("remove node");function Ht(n,e){let t=Xs(e);K.isDocument(n)?Ke(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):Ke(null,n,t,Object.freeze([]))}Ht.BREAK=Q;Ht.SKIP=Ks;Ht.REMOVE=ue;function Ke(n,e,t,r){let i=zs(n,e,t,r);if(K.isNode(i)||K.isPair(i))return Ys(n,r,i),Ke(n,i,t,r);if(typeof i!="symbol"){if(K.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=Ke(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===Q)return Q;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(K.isPair(e)){r=Object.freeze(r.concat(e));let s=Ke("key",e.key,t,r);if(s===Q)return Q;s===ue&&(e.key=null);let o=Ke("value",e.value,t,r);if(o===Q)return Q;o===ue&&(e.value=null)}}return i}async function Wt(n,e){let t=Xs(e);K.isDocument(n)?await Xe(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):await Xe(null,n,t,Object.freeze([]))}Wt.BREAK=Q;Wt.SKIP=Ks;Wt.REMOVE=ue;async function Xe(n,e,t,r){let i=await zs(n,e,t,r);if(K.isNode(i)||K.isPair(i))return Ys(n,r,i),Xe(n,i,t,r);if(typeof i!="symbol"){if(K.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=await Xe(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===Q)return Q;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(K.isPair(e)){r=Object.freeze(r.concat(e));let s=await Xe("key",e.key,t,r);if(s===Q)return Q;s===ue&&(e.key=null);let o=await Xe("value",e.value,t,r);if(o===Q)return Q;o===ue&&(e.value=null)}}return i}function Xs(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function zs(n,e,t,r){if(typeof t=="function")return t(n,e,r);if(K.isMap(e))return t.Map?.(n,e,r);if(K.isSeq(e))return t.Seq?.(n,e,r);if(K.isPair(e))return t.Pair?.(n,e,r);if(K.isScalar(e))return t.Scalar?.(n,e,r);if(K.isAlias(e))return t.Alias?.(n,e,r)}function Ys(n,e,t){let r=e[e.length-1];if(K.isCollection(r))r.items[n]=t;else if(K.isPair(r))n==="key"?r.key=t:r.value=t;else if(K.isDocument(r))r.contents=t;else{let i=K.isAlias(r)?"alias":"scalar";throw new Error(`Cannot replace node with ${i} parent`)}}gr.visit=Ht;gr.visitAsync=Wt});var yr=S(Gs=>{"use strict";var Vs=x(),zd=st(),Yd={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Vd=n=>n.replace(/[!,[\]{}]/g,e=>Yd[e]),ot=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let r=e.trim().split(/[ \t]+/),i=r.shift();switch(i){case"%TAG":{if(r.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),r.length<2))return!1;let[s,o]=r;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,r.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=r;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${i}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,r,i]=e.match(/^(.*!)([^!]*)$/s);i||t(`The ${e} tag has no suffix`);let s=this.tags[r];if(s)try{return s+decodeURIComponent(i)}catch(o){return t(String(o)),null}return r==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,r]of Object.entries(this.tags))if(e.startsWith(r))return t+Vd(e.substring(r.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],r=Object.entries(this.tags),i;if(e&&r.length>0&&Vs.isNode(e.contents)){let s={};zd.visit(e.contents,(o,a)=>{Vs.isNode(a)&&a.tag&&(s[a.tag]=!0)}),i=Object.keys(s)}else i=[];for(let[s,o]of r)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||i.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};ot.defaultYaml={explicit:!1,version:"1.2"};ot.defaultTags={"!!":"tag:yaml.org,2002:"};Gs.Directives=ot});var Zt=S(at=>{"use strict";var Js=x(),Gd=st();function Jd(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function Hs(n){let e=new Set;return Gd.visit(n,{Value(t,r){r.anchor&&e.add(r.anchor)}}),e}function Ws(n,e){for(let t=1;;++t){let r=`${n}${t}`;if(!e.has(r))return r}}function Hd(n,e){let t=[],r=new Map,i=null;return{onAnchor:s=>{t.push(s),i??(i=Hs(n));let o=Ws(e,i);return i.add(o),o},setAnchors:()=>{for(let s of t){let o=r.get(s);if(typeof o=="object"&&o.anchor&&(Js.isScalar(o.node)||Js.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:r}}at.anchorIsValid=Jd;at.anchorNames=Hs;at.createNodeAnchors=Hd;at.findNewAnchor=Ws});var br=S(Zs=>{"use strict";function ct(n,e,t,r){if(r&&typeof r=="object")if(Array.isArray(r))for(let i=0,s=r.length;i<s;++i){let o=r[i],a=ct(n,r,String(i),o);a===void 0?delete r[i]:a!==o&&(r[i]=a)}else if(r instanceof Map)for(let i of Array.from(r.keys())){let s=r.get(i),o=ct(n,r,i,s);o===void 0?r.delete(i):o!==s&&r.set(i,o)}else if(r instanceof Set)for(let i of Array.from(r)){let s=ct(n,r,i,i);s===void 0?r.delete(i):s!==i&&(r.delete(i),r.add(s))}else for(let[i,s]of Object.entries(r)){let o=ct(n,r,i,s);o===void 0?delete r[i]:o!==s&&(r[i]=o)}return n.call(e,t,r)}Zs.applyReviver=ct});var _e=S(eo=>{"use strict";var Wd=x();function Qs(n,e,t){if(Array.isArray(n))return n.map((r,i)=>Qs(r,String(i),t));if(n&&typeof n.toJSON=="function"){if(!t||!Wd.hasAnchor(n))return n.toJSON(e,t);let r={aliasCount:0,count:1,res:void 0};t.anchors.set(n,r),t.onCreate=s=>{r.res=s,delete t.onCreate};let i=n.toJSON(e,t);return t.onCreate&&t.onCreate(i),i}return typeof n=="bigint"&&!t?.keep?Number(n):n}eo.toJS=Qs});var Qt=S(no=>{"use strict";var Zd=br(),to=x(),Qd=_e(),Er=class{constructor(e){Object.defineProperty(this,to.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:r,onAnchor:i,reviver:s}={}){if(!to.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},a=Qd.toJS(this,"",o);if(typeof i=="function")for(let{count:c,res:l}of o.anchors.values())i(l,c);return typeof s=="function"?Zd.applyReviver(s,{"":a},"",a):a}};no.NodeBase=Er});var lt=S(ro=>{"use strict";var eu=Zt(),tu=st(),ze=x(),nu=Qt(),ru=_e(),_r=class extends nu.NodeBase{constructor(e){super(ze.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let r;t?.aliasResolveCache?r=t.aliasResolveCache:(r=[],tu.visit(e,{Node:(s,o)=>{(ze.isAlias(o)||ze.hasAnchor(o))&&r.push(o)}}),t&&(t.aliasResolveCache=r));let i;for(let s of r){if(s===this)break;s.anchor===this.source&&(i=s)}return i}toJSON(e,t){if(!t)return{source:this.source};let{anchors:r,doc:i,maxAliasCount:s}=t,o=this.resolve(i,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=r.get(o);if(a||(ru.toJS(o,null,t),a=r.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=en(i,o,r)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,r){let i=`*${this.source}`;if(e){if(eu.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${i} `}return i}};function en(n,e,t){if(ze.isAlias(e)){let r=e.resolve(n),i=t&&r&&t.get(r);return i?i.count*i.aliasCount:0}else if(ze.isCollection(e)){let r=0;for(let i of e.items){let s=en(n,i,t);s>r&&(r=s)}return r}else if(ze.isPair(e)){let r=en(n,e.key,t),i=en(n,e.value,t);return Math.max(r,i)}return 1}ro.Alias=_r});var B=S(Tr=>{"use strict";var iu=x(),su=Qt(),ou=_e(),au=n=>!n||typeof n!="function"&&typeof n!="object",Te=class extends su.NodeBase{constructor(e){super(iu.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:ou.toJS(this.value,e,t)}toString(){return String(this.value)}};Te.BLOCK_FOLDED="BLOCK_FOLDED";Te.BLOCK_LITERAL="BLOCK_LITERAL";Te.PLAIN="PLAIN";Te.QUOTE_DOUBLE="QUOTE_DOUBLE";Te.QUOTE_SINGLE="QUOTE_SINGLE";Tr.Scalar=Te;Tr.isScalarValue=au});var dt=S(so=>{"use strict";var cu=lt(),Ie=x(),io=B(),lu="tag:yaml.org,2002:";function du(n,e,t){if(e){let r=t.filter(s=>s.tag===e),i=r.find(s=>!s.format)??r[0];if(!i)throw new Error(`Tag ${e} not found`);return i}return t.find(r=>r.identify?.(n)&&!r.format)}function uu(n,e,t){if(Ie.isDocument(n)&&(n=n.contents),Ie.isNode(n))return n;if(Ie.isPair(n)){let p=t.schema[Ie.MAP].createNode?.(t.schema,null,t);return p.items.push(n),p}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:r,onAnchor:i,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(r&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=i(n)),new cu.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=lu+e.slice(2));let l=du(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let p=new io.Scalar(n);return c&&(c.node=p),p}l=n instanceof Map?o[Ie.MAP]:Symbol.iterator in Object(n)?o[Ie.SEQ]:o[Ie.MAP]}s&&(s(l),delete t.onTagObj);let u=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new io.Scalar(n);return e?u.tag=e:l.default||(u.tag=l.tag),c&&(c.node=u),u}so.createNode=uu});var nn=S(tn=>{"use strict";var fu=dt(),fe=x(),pu=Qt();function Nr(n,e,t){let r=t;for(let i=e.length-1;i>=0;--i){let s=e[i];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=r,r=o}else r=new Map([[s,r]])}return fu.createNode(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var oo=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,Sr=class extends pu.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(r=>fe.isNode(r)||fe.isPair(r)?r.clone(e):r),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(oo(e))this.add(t);else{let[r,...i]=e,s=this.get(r,!0);if(fe.isCollection(s))s.addIn(i,t);else if(s===void 0&&this.schema)this.set(r,Nr(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}deleteIn(e){let[t,...r]=e;if(r.length===0)return this.delete(t);let i=this.get(t,!0);if(fe.isCollection(i))return i.deleteIn(r);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${r}`)}getIn(e,t){let[r,...i]=e,s=this.get(r,!0);return i.length===0?!t&&fe.isScalar(s)?s.value:s:fe.isCollection(s)?s.getIn(i,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!fe.isPair(t))return!1;let r=t.value;return r==null||e&&fe.isScalar(r)&&r.value==null&&!r.commentBefore&&!r.comment&&!r.tag})}hasIn(e){let[t,...r]=e;if(r.length===0)return this.has(t);let i=this.get(t,!0);return fe.isCollection(i)?i.hasIn(r):!1}setIn(e,t){let[r,...i]=e;if(i.length===0)this.set(r,t);else{let s=this.get(r,!0);if(fe.isCollection(s))s.setIn(i,t);else if(s===void 0&&this.schema)this.set(r,Nr(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}};tn.Collection=Sr;tn.collectionFromPath=Nr;tn.isEmptyPath=oo});var ut=S(rn=>{"use strict";var mu=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function wr(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var hu=(n,e,t)=>n.endsWith(`
`)?wr(t,e):t.includes(`
`)?`
`+wr(t,e):(n.endsWith(" ")?"":" ")+t;rn.indentComment=wr;rn.lineComment=hu;rn.stringifyComment=mu});var co=S(ft=>{"use strict";var gu="flow",vr="block",sn="quoted";function yu(n,e,t="flow",{indentAtStart:r,lineWidth:i=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!i||i<0)return n;i<s&&(s=0);let c=Math.max(1+s,1+i-e.length);if(n.length<=c)return n;let l=[],u={},p=i-e.length;typeof r=="number"&&(r>i-Math.max(2,s)?l.push(0):p=i-r);let d,m,h=!1,f=-1,g=-1,E=-1;t===vr&&(f=ao(n,f,e.length),f!==-1&&(p=f+c));for(let _;_=n[f+=1];){if(t===sn&&_==="\\"){switch(g=f,n[f+1]){case"x":f+=3;break;case"u":f+=5;break;case"U":f+=9;break;default:f+=1}E=f}if(_===`
`)t===vr&&(f=ao(n,f,e.length)),p=f+e.length+c,d=void 0;else{if(_===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let T=n[f+1];T&&T!==" "&&T!==`
`&&T!=="	"&&(d=f)}if(f>=p)if(d)l.push(d),p=d+c,d=void 0;else if(t===sn){for(;m===" "||m==="	";)m=_,_=n[f+=1],h=!0;let T=f>E+1?f-2:g-1;if(u[T])return n;l.push(T),u[T]=!0,p=T+c,d=void 0}else h=!0}m=_}if(h&&a&&a(),l.length===0)return n;o&&o();let b=n.slice(0,l[0]);for(let _=0;_<l.length;++_){let T=l[_],w=l[_+1]||n.length;T===0?b=`
${e}${n.slice(0,w)}`:(t===sn&&u[T]&&(b+=`${n[T]}\\`),b+=`
${e}${n.slice(T+1,w)}`)}return b}function ao(n,e,t){let r=e,i=e+1,s=n[i];for(;s===" "||s==="	";)if(e<i+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);r=e,i=e+1,s=n[i]}return r}ft.FOLD_BLOCK=vr;ft.FOLD_FLOW=gu;ft.FOLD_QUOTED=sn;ft.foldFlowLines=yu});var mt=S(lo=>{"use strict";var ae=B(),Ne=co(),an=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),cn=n=>/^(%|---|\.\.\.)/m.test(n);function bu(n,e,t){if(!e||e<0)return!1;let r=e-t,i=n.length;if(i<=r)return!1;for(let s=0,o=0;s<i;++s)if(n[s]===`
`){if(s-o>r)return!0;if(o=s+1,i-o<=r)return!1}return!0}function pt(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:r}=e,i=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(cn(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let u=t.substr(c+2,4);switch(u){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:u.substr(0,2)==="00"?o+="\\x"+u.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(r||t[c+2]==='"'||t.length<i)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,r?o:Ne.foldFlowLines(o,s,Ne.FOLD_QUOTED,an(e,!1))}function kr(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return pt(n,e);let t=e.indent||(cn(n)?"  ":""),r="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?r:Ne.foldFlowLines(r,t,Ne.FOLD_FLOW,an(e,!1))}function Ye(n,e){let{singleQuote:t}=e.options,r;if(t===!1)r=pt;else{let i=n.includes('"'),s=n.includes("'");i&&!s?r=kr:s&&!i?r=pt:r=t?kr:pt}return r(n,e)}var Ar;try{Ar=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{Ar=/\n+(?!\n|$)/g}function on({comment:n,type:e,value:t},r,i,s){let{blockQuote:o,commentString:a,lineWidth:c}=r.options;if(!o||/\n[\t ]+$/.test(t))return Ye(t,r);let l=r.indent||(r.forceBlockIndent||cn(t)?"  ":""),u=o==="literal"?!0:o==="folded"||e===ae.Scalar.BLOCK_FOLDED?!1:e===ae.Scalar.BLOCK_LITERAL?!0:!bu(t,c,l.length);if(!t)return u?`|
`:`>
`;let p,d;for(d=t.length;d>0;--d){let w=t[d-1];if(w!==`
`&&w!=="	"&&w!==" ")break}let m=t.substring(d),h=m.indexOf(`
`);h===-1?p="-":t===m||h!==m.length-1?(p="+",s&&s()):p="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(Ar,`$&${l}`));let f=!1,g,E=-1;for(g=0;g<t.length;++g){let w=t[g];if(w===" ")f=!0;else if(w===`
`)E=g;else break}let b=t.substring(0,E<g?E+1:g);b&&(t=t.substring(b.length),b=b.replace(/\n+/g,`$&${l}`));let T=(f?l?"2":"1":"")+p;if(n&&(T+=" "+a(n.replace(/ ?[\r\n]+/g," ")),i&&i()),!u){let w=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),k=!1,O=an(r,!0);o!=="folded"&&e!==ae.Scalar.BLOCK_FOLDED&&(O.onOverflow=()=>{k=!0});let N=Ne.foldFlowLines(`${b}${w}${m}`,l,Ne.FOLD_BLOCK,O);if(!k)return`>${T}
${l}${N}`}return t=t.replace(/\n+/g,`$&${l}`),`|${T}
${l}${b}${t}${m}`}function Eu(n,e,t,r){let{type:i,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:u}=e;if(a&&s.includes(`
`)||u&&/[[\]{},]/.test(s))return Ye(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||u||!s.includes(`
`)?Ye(s,e):on(n,e,t,r);if(!a&&!u&&i!==ae.Scalar.PLAIN&&s.includes(`
`))return on(n,e,t,r);if(cn(s)){if(c==="")return e.forceBlockIndent=!0,on(n,e,t,r);if(a&&c===l)return Ye(s,e)}let p=s.replace(/\n+/g,`$&
${c}`);if(o){let d=f=>f.default&&f.tag!=="tag:yaml.org,2002:str"&&f.test?.test(p),{compat:m,tags:h}=e.doc.schema;if(h.some(d)||m?.some(d))return Ye(s,e)}return a?p:Ne.foldFlowLines(p,c,Ne.FOLD_FLOW,an(e,!1))}function _u(n,e,t,r){let{implicitKey:i,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==ae.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=ae.Scalar.QUOTE_DOUBLE);let c=u=>{switch(u){case ae.Scalar.BLOCK_FOLDED:case ae.Scalar.BLOCK_LITERAL:return i||s?Ye(o.value,e):on(o,e,t,r);case ae.Scalar.QUOTE_DOUBLE:return pt(o.value,e);case ae.Scalar.QUOTE_SINGLE:return kr(o.value,e);case ae.Scalar.PLAIN:return Eu(o,e,t,r);default:return null}},l=c(a);if(l===null){let{defaultKeyType:u,defaultStringType:p}=e.options,d=i&&u||p;if(l=c(d),l===null)throw new Error(`Unsupported default string type ${d}`)}return l}lo.stringifyString=_u});var ht=S(Lr=>{"use strict";var Tu=Zt(),Se=x(),Nu=ut(),Su=mt();function wu(n,e){let t=Object.assign({blockQuote:!0,commentString:Nu.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),r;switch(t.collectionStyle){case"block":r=!1;break;case"flow":r=!0;break;default:r=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:r,options:t}}function vu(n,e){if(e.tag){let i=n.filter(s=>s.tag===e.tag);if(i.length>0)return i.find(s=>s.format===e.format)??i[0]}let t,r;if(Se.isScalar(e)){r=e.value;let i=n.filter(s=>s.identify?.(r));if(i.length>1){let s=i.filter(o=>o.test);s.length>0&&(i=s)}t=i.find(s=>s.format===e.format)??i.find(s=>!s.format)}else r=e,t=n.find(i=>i.nodeClass&&r instanceof i.nodeClass);if(!t){let i=r?.constructor?.name??(r===null?"null":typeof r);throw new Error(`Tag not resolved for ${i} value`)}return t}function ku(n,e,{anchors:t,doc:r}){if(!r.directives)return"";let i=[],s=(Se.isScalar(n)||Se.isCollection(n))&&n.anchor;s&&Tu.anchorIsValid(s)&&(t.add(s),i.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&i.push(r.directives.tagString(o)),i.join(" ")}function Au(n,e,t,r){if(Se.isPair(n))return n.toString(e,t,r);if(Se.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let i,s=Se.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>i=c});i??(i=vu(e.doc.schema.tags,s));let o=ku(s,i,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof i.stringify=="function"?i.stringify(s,e,t,r):Se.isScalar(s)?Su.stringifyString(s,e,t,r):s.toString(e,t,r);return o?Se.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}Lr.createStringifyContext=wu;Lr.stringify=Au});var mo=S(po=>{"use strict";var ge=x(),uo=B(),fo=ht(),gt=ut();function Lu({key:n,value:e},t,r,i){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:u,simpleKeys:p}}=t,d=ge.isNode(n)&&n.comment||null;if(p){if(d)throw new Error("With simple keys, key nodes cannot have comments");if(ge.isCollection(n)||!ge.isNode(n)&&typeof n=="object"){let O="With simple keys, collection cannot be used as a key value";throw new Error(O)}}let m=!p&&(!n||d&&e==null&&!t.inFlow||ge.isCollection(n)||(ge.isScalar(n)?n.type===uo.Scalar.BLOCK_FOLDED||n.type===uo.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(p||!s),indent:a+c});let h=!1,f=!1,g=fo.stringify(n,t,()=>h=!0,()=>f=!0);if(!m&&!t.inFlow&&g.length>1024){if(p)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return h&&r&&r(),g===""?"?":m?`? ${g}`:g}else if(s&&!p||e==null&&m)return g=`? ${g}`,d&&!h?g+=gt.lineComment(g,t.indent,l(d)):f&&i&&i(),g;h&&(d=null),m?(d&&(g+=gt.lineComment(g,t.indent,l(d))),g=`? ${g}
${a}:`):(g=`${g}:`,d&&(g+=gt.lineComment(g,t.indent,l(d))));let E,b,_;ge.isNode(e)?(E=!!e.spaceBefore,b=e.commentBefore,_=e.comment):(E=!1,b=null,_=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!d&&ge.isScalar(e)&&(t.indentAtStart=g.length+1),f=!1,!u&&c.length>=2&&!t.inFlow&&!m&&ge.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let T=!1,w=fo.stringify(e,t,()=>T=!0,()=>f=!0),k=" ";if(d||E||b){if(k=E?`
`:"",b){let O=l(b);k+=`
${gt.indentComment(O,t.indent)}`}w===""&&!t.inFlow?k===`
`&&_&&(k=`

`):k+=`
${t.indent}`}else if(!m&&ge.isCollection(e)){let O=w[0],N=w.indexOf(`
`),v=N!==-1,C=t.inFlow??e.flow??e.items.length===0;if(v||!C){let z=!1;if(v&&(O==="&"||O==="!")){let D=w.indexOf(" ");O==="&"&&D!==-1&&D<N&&w[D+1]==="!"&&(D=w.indexOf(" ",D+1)),(D===-1||N<D)&&(z=!0)}z||(k=`
${t.indent}`)}}else(w===""||w[0]===`
`)&&(k="");return g+=k+w,t.inFlow?T&&r&&r():_&&!T?g+=gt.lineComment(g,t.indent,l(_)):f&&i&&i(),g}po.stringifyPair=Lu});var Or=S(Rr=>{"use strict";var ho=Bt("process");function Ru(n,...e){n==="debug"&&console.log(...e)}function Ou(n,e){(n==="debug"||n==="warn")&&(typeof ho.emitWarning=="function"?ho.emitWarning(e):console.warn(e))}Rr.debug=Ru;Rr.warn=Ou});var pn=S(fn=>{"use strict";var un=x(),go=B(),ln="<<",dn={identify:n=>n===ln||typeof n=="symbol"&&n.description===ln,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new go.Scalar(Symbol(ln)),{addToJSMap:yo}),stringify:()=>ln},Iu=(n,e)=>(dn.identify(e)||un.isScalar(e)&&(!e.type||e.type===go.Scalar.PLAIN)&&dn.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===dn.tag&&t.default);function yo(n,e,t){let r=bo(n,t);if(un.isSeq(r))for(let i of r.items)Ir(n,e,i);else if(Array.isArray(r))for(let i of r)Ir(n,e,i);else Ir(n,e,r)}function Ir(n,e,t){let r=bo(n,t);if(!un.isMap(r))throw new Error("Merge sources must be maps or map aliases");let i=r.toJSON(null,n,Map);for(let[s,o]of i)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function bo(n,e){return n&&un.isAlias(e)?e.resolve(n.doc,n):e}fn.addMergeToJSMap=yo;fn.isMergeKey=Iu;fn.merge=dn});var Cr=S(To=>{"use strict";var xu=Or(),Eo=pn(),Cu=ht(),_o=x(),xr=_e();function Du(n,e,{key:t,value:r}){if(_o.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,r);else if(Eo.isMergeKey(n,t))Eo.addMergeToJSMap(n,e,r);else{let i=xr.toJS(t,"",n);if(e instanceof Map)e.set(i,xr.toJS(r,i,n));else if(e instanceof Set)e.add(i);else{let s=Pu(t,i,n),o=xr.toJS(r,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function Pu(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(_o.isNode(n)&&t?.doc){let r=Cu.createStringifyContext(t.doc,{});r.anchors=new Set;for(let s of t.anchors.keys())r.anchors.add(s.anchor);r.inFlow=!0,r.inStringifyKey=!0;let i=n.toString(r);if(!t.mapKeyWarned){let s=JSON.stringify(i);s.length>40&&(s=s.substring(0,36)+'..."'),xu.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return i}return JSON.stringify(e)}To.addPairToJSMap=Du});var we=S(Dr=>{"use strict";var No=dt(),$u=mo(),qu=Cr(),mn=x();function Mu(n,e,t){let r=No.createNode(n,void 0,t),i=No.createNode(e,void 0,t);return new hn(r,i)}var hn=class n{constructor(e,t=null){Object.defineProperty(this,mn.NODE_TYPE,{value:mn.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:r}=this;return mn.isNode(t)&&(t=t.clone(e)),mn.isNode(r)&&(r=r.clone(e)),new n(t,r)}toJSON(e,t){let r=t?.mapAsMap?new Map:{};return qu.addPairToJSMap(t,r,this)}toString(e,t,r){return e?.doc?$u.stringifyPair(this,e,t,r):JSON.stringify(this)}};Dr.Pair=hn;Dr.createPair=Mu});var Pr=S(wo=>{"use strict";var xe=x(),So=ht(),gn=ut();function Uu(n,e,t){return(e.inFlow??n.flow?Bu:Fu)(n,e,t)}function Fu({comment:n,items:e},t,{blockItemPrefix:r,flowChars:i,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,u=Object.assign({},t,{indent:s,type:null}),p=!1,d=[];for(let h=0;h<e.length;++h){let f=e[h],g=null;if(xe.isNode(f))!p&&f.spaceBefore&&d.push(""),yn(t,d,f.commentBefore,p),f.comment&&(g=f.comment);else if(xe.isPair(f)){let b=xe.isNode(f.key)?f.key:null;b&&(!p&&b.spaceBefore&&d.push(""),yn(t,d,b.commentBefore,p))}p=!1;let E=So.stringify(f,u,()=>g=null,()=>p=!0);g&&(E+=gn.lineComment(E,s,l(g))),p&&g&&(p=!1),d.push(r+E)}let m;if(d.length===0)m=i.start+i.end;else{m=d[0];for(let h=1;h<d.length;++h){let f=d[h];m+=f?`
${c}${f}`:`
`}}return n?(m+=`
`+gn.indentComment(l(n),c),a&&a()):p&&o&&o(),m}function Bu({items:n},e,{flowChars:t,itemIndent:r}){let{indent:i,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;r+=s;let c=Object.assign({},e,{indent:r,inFlow:!0,type:null}),l=!1,u=0,p=[];for(let h=0;h<n.length;++h){let f=n[h],g=null;if(xe.isNode(f))f.spaceBefore&&p.push(""),yn(e,p,f.commentBefore,!1),f.comment&&(g=f.comment);else if(xe.isPair(f)){let b=xe.isNode(f.key)?f.key:null;b&&(b.spaceBefore&&p.push(""),yn(e,p,b.commentBefore,!1),b.comment&&(l=!0));let _=xe.isNode(f.value)?f.value:null;_?(_.comment&&(g=_.comment),_.commentBefore&&(l=!0)):f.value==null&&b?.comment&&(g=b.comment)}g&&(l=!0);let E=So.stringify(f,c,()=>g=null);l||(l=p.length>u||E.includes(`
`)),h<n.length-1?E+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=p.reduce((b,_)=>b+_.length+2,2)+(E.length+2)>e.options.lineWidth)),l&&(E+=",")),g&&(E+=gn.lineComment(E,r,a(g))),p.push(E),u=p.length}let{start:d,end:m}=t;if(p.length===0)return d+m;if(!l){let h=p.reduce((f,g)=>f+g.length+2,2);l=e.options.lineWidth>0&&h>e.options.lineWidth}if(l){let h=d;for(let f of p)h+=f?`
${s}${i}${f}`:`
`;return`${h}
${i}${m}`}else return`${d}${o}${p.join(" ")}${o}${m}`}function yn({indent:n,options:{commentString:e}},t,r,i){if(r&&i&&(r=r.replace(/^\n+/,"")),r){let s=gn.indentComment(e(r),n);t.push(s.trimStart())}}wo.stringifyCollection=Uu});var ke=S(qr=>{"use strict";var ju=Pr(),Ku=Cr(),Xu=nn(),ve=x(),bn=we(),zu=B();function yt(n,e){let t=ve.isScalar(e)?e.value:e;for(let r of n)if(ve.isPair(r)&&(r.key===e||r.key===t||ve.isScalar(r.key)&&r.key.value===t))return r}var $r=class extends Xu.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ve.MAP,e),this.items=[]}static from(e,t,r){let{keepUndefined:i,replacer:s}=r,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||i)&&o.items.push(bn.createPair(c,l,r))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let r;ve.isPair(e)?r=e:!e||typeof e!="object"||!("key"in e)?r=new bn.Pair(e,e?.value):r=new bn.Pair(e.key,e.value);let i=yt(this.items,r.key),s=this.schema?.sortMapEntries;if(i){if(!t)throw new Error(`Key ${r.key} already set`);ve.isScalar(i.value)&&zu.isScalarValue(r.value)?i.value.value=r.value:i.value=r.value}else if(s){let o=this.items.findIndex(a=>s(r,a)<0);o===-1?this.items.push(r):this.items.splice(o,0,r)}else this.items.push(r)}delete(e){let t=yt(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let i=yt(this.items,e)?.value;return(!t&&ve.isScalar(i)?i.value:i)??void 0}has(e){return!!yt(this.items,e)}set(e,t){this.add(new bn.Pair(e,t),!0)}toJSON(e,t,r){let i=r?new r:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(i);for(let s of this.items)Ku.addPairToJSMap(t,i,s);return i}toString(e,t,r){if(!e)return JSON.stringify(this);for(let i of this.items)if(!ve.isPair(i))throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),ju.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:r,onComment:t})}};qr.YAMLMap=$r;qr.findPair=yt});var Ve=S(ko=>{"use strict";var Yu=x(),vo=ke(),Vu={collection:"map",default:!0,nodeClass:vo.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return Yu.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>vo.YAMLMap.from(n,e,t)};ko.map=Vu});var Ae=S(Ao=>{"use strict";var Gu=dt(),Ju=Pr(),Hu=nn(),_n=x(),Wu=B(),Zu=_e(),Mr=class extends Hu.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(_n.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=En(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let r=En(e);if(typeof r!="number")return;let i=this.items[r];return!t&&_n.isScalar(i)?i.value:i}has(e){let t=En(e);return typeof t=="number"&&t<this.items.length}set(e,t){let r=En(e);if(typeof r!="number")throw new Error(`Expected a valid index, not ${e}.`);let i=this.items[r];_n.isScalar(i)&&Wu.isScalarValue(t)?i.value=t:this.items[r]=t}toJSON(e,t){let r=[];t?.onCreate&&t.onCreate(r);let i=0;for(let s of this.items)r.push(Zu.toJS(s,String(i++),t));return r}toString(e,t,r){return e?Ju.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:r,onComment:t}):JSON.stringify(this)}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof i=="function"){let c=t instanceof Set?a:String(o++);a=i.call(t,c,a)}s.items.push(Gu.createNode(a,void 0,r))}}return s}};function En(n){let e=_n.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}Ao.YAMLSeq=Mr});var Ge=S(Ro=>{"use strict";var Qu=x(),Lo=Ae(),ef={collection:"seq",default:!0,nodeClass:Lo.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Qu.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>Lo.YAMLSeq.from(n,e,t)};Ro.seq=ef});var bt=S(Oo=>{"use strict";var tf=mt(),nf={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,r){return e=Object.assign({actualString:!0},e),tf.stringifyString(n,e,t,r)}};Oo.string=nf});var Tn=S(Co=>{"use strict";var Io=B(),xo={identify:n=>n==null,createNode:()=>new Io.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new Io.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&xo.test.test(n)?n:e.options.nullStr};Co.nullTag=xo});var Ur=S(Po=>{"use strict";var rf=B(),Do={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new rf.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&Do.test.test(n)){let r=n[0]==="t"||n[0]==="T";if(e===r)return n}return e?t.options.trueStr:t.options.falseStr}};Po.boolTag=Do});var Je=S($o=>{"use strict";function sf({format:n,minFractionDigits:e,tag:t,value:r}){if(typeof r=="bigint")return String(r);let i=typeof r=="number"?r:Number(r);if(!isFinite(i))return isNaN(i)?".nan":i<0?"-.inf":".inf";let s=Object.is(r,-0)?"-0":JSON.stringify(r);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}$o.stringifyNumber=sf});var Br=S(Nn=>{"use strict";var of=B(),Fr=Je(),af={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Fr.stringifyNumber},cf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Fr.stringifyNumber(n)}},lf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new of.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:Fr.stringifyNumber};Nn.float=lf;Nn.floatExp=cf;Nn.floatNaN=af});var Kr=S(wn=>{"use strict";var qo=Je(),Sn=n=>typeof n=="bigint"||Number.isInteger(n),jr=(n,e,t,{intAsBigInt:r})=>r?BigInt(n):parseInt(n.substring(e),t);function Mo(n,e,t){let{value:r}=n;return Sn(r)&&r>=0?t+r.toString(e):qo.stringifyNumber(n)}var df={identify:n=>Sn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>jr(n,2,8,t),stringify:n=>Mo(n,8,"0o")},uf={identify:Sn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>jr(n,0,10,t),stringify:qo.stringifyNumber},ff={identify:n=>Sn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>jr(n,2,16,t),stringify:n=>Mo(n,16,"0x")};wn.int=uf;wn.intHex=ff;wn.intOct=df});var Fo=S(Uo=>{"use strict";var pf=Ve(),mf=Tn(),hf=Ge(),gf=bt(),yf=Ur(),Xr=Br(),zr=Kr(),bf=[pf.map,hf.seq,gf.string,mf.nullTag,yf.boolTag,zr.intOct,zr.int,zr.intHex,Xr.floatNaN,Xr.floatExp,Xr.float];Uo.schema=bf});var Ko=S(jo=>{"use strict";var Ef=B(),_f=Ve(),Tf=Ge();function Bo(n){return typeof n=="bigint"||Number.isInteger(n)}var vn=({value:n})=>JSON.stringify(n),Nf=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:vn},{identify:n=>n==null,createNode:()=>new Ef.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:vn},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:vn},{identify:Bo,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Bo(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:vn}],Sf={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},wf=[_f.map,Tf.seq].concat(Nf,Sf);jo.schema=wf});var Vr=S(Xo=>{"use strict";var Et=Bt("buffer"),Yr=B(),vf=mt(),kf={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof Et.Buffer=="function")return Et.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),r=new Uint8Array(t.length);for(let i=0;i<t.length;++i)r[i]=t.charCodeAt(i);return r}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},r,i,s){if(!t)return"";let o=t,a;if(typeof Et.Buffer=="function")a=o instanceof Et.Buffer?o.toString("base64"):Et.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Yr.Scalar.BLOCK_LITERAL),e!==Yr.Scalar.QUOTE_DOUBLE){let c=Math.max(r.options.lineWidth-r.indent.length,r.options.minContentWidth),l=Math.ceil(a.length/c),u=new Array(l);for(let p=0,d=0;p<l;++p,d+=c)u[p]=a.substr(d,c);a=u.join(e===Yr.Scalar.BLOCK_LITERAL?`
`:" ")}return vf.stringifyString({comment:n,type:e,value:a},r,i,s)}};Xo.binary=kf});var Ln=S(An=>{"use strict";var kn=x(),Gr=we(),Af=B(),Lf=Ae();function zo(n,e){if(kn.isSeq(n))for(let t=0;t<n.items.length;++t){let r=n.items[t];if(!kn.isPair(r)){if(kn.isMap(r)){r.items.length>1&&e("Each pair must have its own sequence indicator");let i=r.items[0]||new Gr.Pair(new Af.Scalar(null));if(r.commentBefore&&(i.key.commentBefore=i.key.commentBefore?`${r.commentBefore}
${i.key.commentBefore}`:r.commentBefore),r.comment){let s=i.value??i.key;s.comment=s.comment?`${r.comment}
${s.comment}`:r.comment}r=i}n.items[t]=kn.isPair(r)?r:new Gr.Pair(r)}}else e("Expected a sequence for this tag");return n}function Yo(n,e,t){let{replacer:r}=t,i=new Lf.YAMLSeq(n);i.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof r=="function"&&(o=r.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;i.items.push(Gr.createPair(a,c,t))}return i}var Rf={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:zo,createNode:Yo};An.createPairs=Yo;An.pairs=Rf;An.resolvePairs=zo});var Wr=S(Hr=>{"use strict";var Vo=x(),Jr=_e(),_t=ke(),Of=Ae(),Go=Ln(),Ce=class n extends Of.YAMLSeq{constructor(){super(),this.add=_t.YAMLMap.prototype.add.bind(this),this.delete=_t.YAMLMap.prototype.delete.bind(this),this.get=_t.YAMLMap.prototype.get.bind(this),this.has=_t.YAMLMap.prototype.has.bind(this),this.set=_t.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let r=new Map;t?.onCreate&&t.onCreate(r);for(let i of this.items){let s,o;if(Vo.isPair(i)?(s=Jr.toJS(i.key,"",t),o=Jr.toJS(i.value,s,t)):s=Jr.toJS(i,"",t),r.has(s))throw new Error("Ordered maps must not include duplicate keys");r.set(s,o)}return r}static from(e,t,r){let i=Go.createPairs(e,t,r),s=new this;return s.items=i.items,s}};Ce.tag="tag:yaml.org,2002:omap";var If={collection:"seq",identify:n=>n instanceof Map,nodeClass:Ce,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=Go.resolvePairs(n,e),r=[];for(let{key:i}of t.items)Vo.isScalar(i)&&(r.includes(i.value)?e(`Ordered maps must not include duplicate keys: ${i.value}`):r.push(i.value));return Object.assign(new Ce,t)},createNode:(n,e,t)=>Ce.from(n,e,t)};Hr.YAMLOMap=Ce;Hr.omap=If});var Qo=S(Zr=>{"use strict";var Jo=B();function Ho({value:n,source:e},t){return e&&(n?Wo:Zo).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var Wo={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new Jo.Scalar(!0),stringify:Ho},Zo={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new Jo.Scalar(!1),stringify:Ho};Zr.falseTag=Zo;Zr.trueTag=Wo});var ea=S(Rn=>{"use strict";var xf=B(),Qr=Je(),Cf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Qr.stringifyNumber},Df={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Qr.stringifyNumber(n)}},Pf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new xf.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let r=n.substring(t+1).replace(/_/g,"");r[r.length-1]==="0"&&(e.minFractionDigits=r.length)}return e},stringify:Qr.stringifyNumber};Rn.float=Pf;Rn.floatExp=Df;Rn.floatNaN=Cf});var na=S(Nt=>{"use strict";var ta=Je(),Tt=n=>typeof n=="bigint"||Number.isInteger(n);function On(n,e,t,{intAsBigInt:r}){let i=n[0];if((i==="-"||i==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),r){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return i==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return i==="-"?-1*s:s}function ei(n,e,t){let{value:r}=n;if(Tt(r)){let i=r.toString(e);return r<0?"-"+t+i.substr(1):t+i}return ta.stringifyNumber(n)}var $f={identify:Tt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>On(n,2,2,t),stringify:n=>ei(n,2,"0b")},qf={identify:Tt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>On(n,1,8,t),stringify:n=>ei(n,8,"0")},Mf={identify:Tt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>On(n,0,10,t),stringify:ta.stringifyNumber},Uf={identify:Tt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>On(n,2,16,t),stringify:n=>ei(n,16,"0x")};Nt.int=Mf;Nt.intBin=$f;Nt.intHex=Uf;Nt.intOct=qf});var ni=S(ti=>{"use strict";var Cn=x(),In=we(),xn=ke(),De=class n extends xn.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;Cn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new In.Pair(e.key,null):t=new In.Pair(e,null),xn.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let r=xn.findPair(this.items,e);return!t&&Cn.isPair(r)?Cn.isScalar(r.key)?r.key.value:r.key:r}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let r=xn.findPair(this.items,e);r&&!t?this.items.splice(this.items.indexOf(r),1):!r&&t&&this.items.push(new In.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,r){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,r);throw new Error("Set items must all have null values")}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof i=="function"&&(o=i.call(t,o,o)),s.items.push(In.createPair(o,null,r));return s}};De.tag="tag:yaml.org,2002:set";var Ff={collection:"map",identify:n=>n instanceof Set,nodeClass:De,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>De.from(n,e,t),resolve(n,e){if(Cn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new De,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};ti.YAMLSet=De;ti.set=Ff});var ii=S(Dn=>{"use strict";var Bf=Je();function ri(n,e){let t=n[0],r=t==="-"||t==="+"?n.substring(1):n,i=o=>e?BigInt(o):Number(o),s=r.replace(/_/g,"").split(":").reduce((o,a)=>o*i(60)+i(a),i(0));return t==="-"?i(-1)*s:s}function ra(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return Bf.stringifyNumber(n);let r="";e<0&&(r="-",e*=t(-1));let i=t(60),s=[e%i];return e<60?s.unshift(0):(e=(e-s[0])/i,s.unshift(e%i),e>=60&&(e=(e-s[0])/i,s.unshift(e))),r+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var jf={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>ri(n,t),stringify:ra},Kf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>ri(n,!1),stringify:ra},ia={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(ia.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,r,i,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,r-1,i,s||0,o||0,a||0,c),u=e[8];if(u&&u!=="Z"){let p=ri(u,!1);Math.abs(p)<30&&(p*=60),l-=6e4*p}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};Dn.floatTime=Kf;Dn.intTime=jf;Dn.timestamp=ia});var aa=S(oa=>{"use strict";var Xf=Ve(),zf=Tn(),Yf=Ge(),Vf=bt(),Gf=Vr(),sa=Qo(),si=ea(),Pn=na(),Jf=pn(),Hf=Wr(),Wf=Ln(),Zf=ni(),oi=ii(),Qf=[Xf.map,Yf.seq,Vf.string,zf.nullTag,sa.trueTag,sa.falseTag,Pn.intBin,Pn.intOct,Pn.int,Pn.intHex,si.floatNaN,si.floatExp,si.float,Gf.binary,Jf.merge,Hf.omap,Wf.pairs,Zf.set,oi.intTime,oi.floatTime,oi.timestamp];oa.schema=Qf});var ya=S(li=>{"use strict";var ua=Ve(),ep=Tn(),fa=Ge(),tp=bt(),np=Ur(),ai=Br(),ci=Kr(),rp=Fo(),ip=Ko(),pa=Vr(),St=pn(),ma=Wr(),ha=Ln(),ca=aa(),ga=ni(),$n=ii(),la=new Map([["core",rp.schema],["failsafe",[ua.map,fa.seq,tp.string]],["json",ip.schema],["yaml11",ca.schema],["yaml-1.1",ca.schema]]),da={binary:pa.binary,bool:np.boolTag,float:ai.float,floatExp:ai.floatExp,floatNaN:ai.floatNaN,floatTime:$n.floatTime,int:ci.int,intHex:ci.intHex,intOct:ci.intOct,intTime:$n.intTime,map:ua.map,merge:St.merge,null:ep.nullTag,omap:ma.omap,pairs:ha.pairs,seq:fa.seq,set:ga.set,timestamp:$n.timestamp},sp={"tag:yaml.org,2002:binary":pa.binary,"tag:yaml.org,2002:merge":St.merge,"tag:yaml.org,2002:omap":ma.omap,"tag:yaml.org,2002:pairs":ha.pairs,"tag:yaml.org,2002:set":ga.set,"tag:yaml.org,2002:timestamp":$n.timestamp};function op(n,e,t){let r=la.get(e);if(r&&!n)return t&&!r.includes(St.merge)?r.concat(St.merge):r.slice();let i=r;if(!i)if(Array.isArray(n))i=[];else{let s=Array.from(la.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)i=i.concat(s);else typeof n=="function"&&(i=n(i.slice()));return t&&(i=i.concat(St.merge)),i.reduce((s,o)=>{let a=typeof o=="string"?da[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(da).map(u=>JSON.stringify(u)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}li.coreKnownTags=sp;li.getTags=op});var fi=S(ba=>{"use strict";var di=x(),ap=Ve(),cp=Ge(),lp=bt(),qn=ya(),dp=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,ui=class n{constructor({compat:e,customTags:t,merge:r,resolveKnownTags:i,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?qn.getTags(e,"compat"):e?qn.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=i?qn.coreKnownTags:{},this.tags=qn.getTags(t,this.name,r),this.toStringOptions=a??null,Object.defineProperty(this,di.MAP,{value:ap.map}),Object.defineProperty(this,di.SCALAR,{value:lp.string}),Object.defineProperty(this,di.SEQ,{value:cp.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?dp:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};ba.Schema=ui});var _a=S(Ea=>{"use strict";var up=x(),pi=ht(),wt=ut();function fp(n,e){let t=[],r=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),r=!0):n.directives.docStart&&(r=!0)}r&&t.push("---");let i=pi.createStringifyContext(n,e),{commentString:s}=i.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(wt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(up.isNode(n.contents)){if(n.contents.spaceBefore&&r&&t.push(""),n.contents.commentBefore){let u=s(n.contents.commentBefore);t.push(wt.indentComment(u,""))}i.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=pi.stringify(n.contents,i,()=>a=null,c);a&&(l+=wt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(pi.stringify(n.contents,i));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(wt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(wt.indentComment(s(c),"")))}return t.join(`
`)+`
`}Ea.stringifyDocument=fp});var vt=S(Ta=>{"use strict";var pp=lt(),He=nn(),se=x(),mp=we(),hp=_e(),gp=fi(),yp=_a(),mi=Zt(),bp=br(),Ep=dt(),hi=yr(),gi=class n{constructor(e,t,r){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,se.NODE_TYPE,{value:se.DOC});let i=null;typeof t=="function"||Array.isArray(t)?i=t:r===void 0&&t&&(r=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},r);this.options=s;let{version:o}=s;r?._directives?(this.directives=r._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new hi.Directives({version:o}),this.setSchema(o,r),this.contents=e===void 0?null:this.createNode(e,i,r)}clone(){let e=Object.create(n.prototype,{[se.NODE_TYPE]:{value:se.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=se.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){We(this.contents)&&this.contents.add(e)}addIn(e,t){We(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let r=mi.anchorNames(this);e.anchor=!t||r.has(t)?mi.findNewAnchor(t||"a",r):t}return new pp.Alias(e.anchor)}createNode(e,t,r){let i;if(typeof t=="function")e=t.call({"":e},"",e),i=t;else if(Array.isArray(t)){let g=b=>typeof b=="number"||b instanceof String||b instanceof Number,E=t.filter(g).map(String);E.length>0&&(t=t.concat(E)),i=t}else r===void 0&&t&&(r=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:u}=r??{},{onAnchor:p,setAnchors:d,sourceObjects:m}=mi.createNodeAnchors(this,o||"a"),h={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:p,onTagObj:l,replacer:i,schema:this.schema,sourceObjects:m},f=Ep.createNode(e,u,h);return a&&se.isCollection(f)&&(f.flow=!0),d(),f}createPair(e,t,r={}){let i=this.createNode(e,null,r),s=this.createNode(t,null,r);return new mp.Pair(i,s)}delete(e){return We(this.contents)?this.contents.delete(e):!1}deleteIn(e){return He.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):We(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return se.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return He.isEmptyPath(e)?!t&&se.isScalar(this.contents)?this.contents.value:this.contents:se.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return se.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return He.isEmptyPath(e)?this.contents!==void 0:se.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=He.collectionFromPath(this.schema,[e],t):We(this.contents)&&this.contents.set(e,t)}setIn(e,t){He.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=He.collectionFromPath(this.schema,Array.from(e),t):We(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let r;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new hi.Directives({version:"1.1"}),r={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new hi.Directives({version:e}),r={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,r=null;break;default:{let i=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(r)this.schema=new gp.Schema(Object.assign(r,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:r,maxAliasCount:i,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:r===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},c=hp.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:u}of a.anchors.values())s(u,l);return typeof o=="function"?bp.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return yp.stringifyDocument(this,e)}};function We(n){if(se.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}Ta.Document=gi});var Lt=S(At=>{"use strict";var kt=class extends Error{constructor(e,t,r,i){super(),this.name=e,this.code=r,this.message=i,this.pos=t}},yi=class extends kt{constructor(e,t,r){super("YAMLParseError",e,t,r)}},bi=class extends kt{constructor(e,t,r){super("YAMLWarning",e,t,r)}},_p=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:r,col:i}=t.linePos[0];t.message+=` at line ${r}, column ${i}`;let s=i-1,o=n.substring(e.lineStarts[r-1],e.lineStarts[r]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),r>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[r-2],e.lineStarts[r-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===r&&c.col>i&&(a=Math.max(1,Math.min(c.col-i,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};At.YAMLError=kt;At.YAMLParseError=yi;At.YAMLWarning=bi;At.prettifyError=_p});var Rt=S(Na=>{"use strict";function Tp(n,{flow:e,indicator:t,next:r,offset:i,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,u=a,p="",d="",m=!1,h=!1,f=null,g=null,E=null,b=null,_=null,T=null,w=null;for(let N of n)switch(h&&(N.type!=="space"&&N.type!=="newline"&&N.type!=="comma"&&s(N.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),h=!1),f&&(l&&N.type!=="comment"&&N.type!=="newline"&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),f=null),N.type){case"space":!e&&(t!=="doc-start"||r?.type!=="flow-collection")&&N.source.includes("	")&&(f=N),u=!0;break;case"comment":{u||s(N,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let v=N.source.substring(1)||" ";p?p+=d+v:p=v,d="",l=!1;break}case"newline":l?p?p+=N.source:(!T||t!=="seq-item-ind")&&(c=!0):d+=N.source,l=!0,m=!0,(g||E)&&(b=N),u=!0;break;case"anchor":g&&s(N,"MULTIPLE_ANCHORS","A node can have at most one anchor"),N.source.endsWith(":")&&s(N.offset+N.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),g=N,w??(w=N.offset),l=!1,u=!1,h=!0;break;case"tag":{E&&s(N,"MULTIPLE_TAGS","A node can have at most one tag"),E=N,w??(w=N.offset),l=!1,u=!1,h=!0;break}case t:(g||E)&&s(N,"BAD_PROP_ORDER",`Anchors and tags must be after the ${N.source} indicator`),T&&s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.source} in ${e??"collection"}`),T=N,l=t==="seq-item-ind"||t==="explicit-key-ind",u=!1;break;case"comma":if(e){_&&s(N,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),_=N,l=!1,u=!1;break}default:s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.type} token`),l=!1,u=!1}let k=n[n.length-1],O=k?k.offset+k.source.length:i;return h&&r&&r.type!=="space"&&r.type!=="newline"&&r.type!=="comma"&&(r.type!=="scalar"||r.source!=="")&&s(r.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),f&&(l&&f.indent<=o||r?.type==="block-map"||r?.type==="block-seq")&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:_,found:T,spaceBefore:c,comment:p,hasNewline:m,anchor:g,tag:E,newlineAfterProp:b,end:O,start:w??O}}Na.resolveProps=Tp});var Mn=S(Sa=>{"use strict";function Ei(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(Ei(e.key)||Ei(e.value))return!0}return!1;default:return!0}}Sa.containsNewline=Ei});var _i=S(wa=>{"use strict";var Np=Mn();function Sp(n,e,t){if(e?.type==="flow-collection"){let r=e.end[0];r.indent===n&&(r.source==="]"||r.source==="}")&&Np.containsNewline(e)&&t(r,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}wa.flowIndentCheck=Sp});var Ti=S(ka=>{"use strict";var va=x();function wp(n,e,t){let{uniqueKeys:r}=n.options;if(r===!1)return!1;let i=typeof r=="function"?r:(s,o)=>s===o||va.isScalar(s)&&va.isScalar(o)&&s.value===o.value;return e.some(s=>i(s.key,t))}ka.mapIncludes=wp});var xa=S(Ia=>{"use strict";var Aa=we(),vp=ke(),La=Rt(),kp=Mn(),Ra=_i(),Ap=Ti(),Oa="All mapping items must start at the same column";function Lp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??vp.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=r.offset,l=null;for(let u of r.items){let{start:p,key:d,sep:m,value:h}=u,f=La.resolveProps(p,{indicator:"explicit-key-ind",next:d??m?.[0],offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0}),g=!f.found;if(g){if(d&&(d.type==="block-seq"?i(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in d&&d.indent!==r.indent&&i(c,"BAD_INDENT",Oa)),!f.anchor&&!f.tag&&!m){l=f.end,f.comment&&(a.comment?a.comment+=`
`+f.comment:a.comment=f.comment);continue}(f.newlineAfterProp||kp.containsNewline(d))&&i(d??p[p.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else f.found?.indent!==r.indent&&i(c,"BAD_INDENT",Oa);t.atKey=!0;let E=f.end,b=d?n(t,d,f,i):e(t,E,p,null,f,i);t.schema.compat&&Ra.flowIndentCheck(r.indent,d,i),t.atKey=!1,Ap.mapIncludes(t,a.items,b)&&i(E,"DUPLICATE_KEY","Map keys must be unique");let _=La.resolveProps(m??[],{indicator:"map-value-ind",next:h,offset:b.range[2],onError:i,parentIndent:r.indent,startOnNewline:!d||d.type==="block-scalar"});if(c=_.end,_.found){g&&(h?.type==="block-map"&&!_.hasNewline&&i(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&f.start<_.found.offset-1024&&i(b.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let T=h?n(t,h,_,i):e(t,c,m,null,_,i);t.schema.compat&&Ra.flowIndentCheck(r.indent,h,i),c=T.range[2];let w=new Aa.Pair(b,T);t.options.keepSourceTokens&&(w.srcToken=u),a.items.push(w)}else{g&&i(b.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),_.comment&&(b.comment?b.comment+=`
`+_.comment:b.comment=_.comment);let T=new Aa.Pair(b);t.options.keepSourceTokens&&(T.srcToken=u),a.items.push(T)}}return l&&l<c&&i(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[r.offset,c,l??c],a}Ia.resolveBlockMap=Lp});var Da=S(Ca=>{"use strict";var Rp=Ae(),Op=Rt(),Ip=_i();function xp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??Rp.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=r.offset,l=null;for(let{start:u,value:p}of r.items){let d=Op.resolveProps(u,{indicator:"seq-item-ind",next:p,offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0});if(!d.found)if(d.anchor||d.tag||p)p?.type==="block-seq"?i(d.end,"BAD_INDENT","All sequence items must start at the same column"):i(c,"MISSING_CHAR","Sequence item without - indicator");else{l=d.end,d.comment&&(a.comment=d.comment);continue}let m=p?n(t,p,d,i):e(t,d.end,u,null,d,i);t.schema.compat&&Ip.flowIndentCheck(r.indent,p,i),c=m.range[2],a.items.push(m)}return a.range=[r.offset,c,l??c],a}Ca.resolveBlockSeq=xp});var Ze=S(Pa=>{"use strict";function Cp(n,e,t,r){let i="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&r(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let u=c.substring(1)||" ";i?i+=o+u:i=u,o="";break}case"newline":i&&(o+=c),s=!0;break;default:r(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:i,offset:e}}Pa.resolveEnd=Cp});var Ua=S(Ma=>{"use strict";var Dp=x(),Pp=we(),$a=ke(),$p=Ae(),qp=Ze(),qa=Rt(),Mp=Mn(),Up=Ti(),Ni="Block collections are not allowed within flow collections",Si=n=>n&&(n.type==="block-map"||n.type==="block-seq");function Fp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=r.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?$a.YAMLMap:$p.YAMLSeq),l=new c(t.schema);l.flow=!0;let u=t.atRoot;u&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let p=r.offset+r.start.source.length;for(let g=0;g<r.items.length;++g){let E=r.items[g],{start:b,key:_,sep:T,value:w}=E,k=qa.resolveProps(b,{flow:a,indicator:"explicit-key-ind",next:_??T?.[0],offset:p,onError:i,parentIndent:r.indent,startOnNewline:!1});if(!k.found){if(!k.anchor&&!k.tag&&!T&&!w){g===0&&k.comma?i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):g<r.items.length-1&&i(k.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),k.comment&&(l.comment?l.comment+=`
`+k.comment:l.comment=k.comment),p=k.end;continue}!o&&t.options.strict&&Mp.containsNewline(_)&&i(_,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(g===0)k.comma&&i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(k.comma||i(k.start,"MISSING_CHAR",`Missing , between ${a} items`),k.comment){let O="";e:for(let N of b)switch(N.type){case"comma":case"space":break;case"comment":O=N.source.substring(1);break e;default:break e}if(O){let N=l.items[l.items.length-1];Dp.isPair(N)&&(N=N.value??N.key),N.comment?N.comment+=`
`+O:N.comment=O,k.comment=k.comment.substring(O.length+1)}}if(!o&&!T&&!k.found){let O=w?n(t,w,k,i):e(t,k.end,T,null,k,i);l.items.push(O),p=O.range[2],Si(w)&&i(O.range,"BLOCK_IN_FLOW",Ni)}else{t.atKey=!0;let O=k.end,N=_?n(t,_,k,i):e(t,O,b,null,k,i);Si(_)&&i(N.range,"BLOCK_IN_FLOW",Ni),t.atKey=!1;let v=qa.resolveProps(T??[],{flow:a,indicator:"map-value-ind",next:w,offset:N.range[2],onError:i,parentIndent:r.indent,startOnNewline:!1});if(v.found){if(!o&&!k.found&&t.options.strict){if(T)for(let D of T){if(D===v.found)break;if(D.type==="newline"){i(D,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}k.start<v.found.offset-1024&&i(v.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else w&&("source"in w&&w.source?.[0]===":"?i(w,"MISSING_CHAR",`Missing space after : in ${a}`):i(v.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let C=w?n(t,w,v,i):v.found?e(t,v.end,T,null,v,i):null;C?Si(w)&&i(C.range,"BLOCK_IN_FLOW",Ni):v.comment&&(N.comment?N.comment+=`
`+v.comment:N.comment=v.comment);let z=new Pp.Pair(N,C);if(t.options.keepSourceTokens&&(z.srcToken=E),o){let D=l;Up.mapIncludes(t,D.items,N)&&i(O,"DUPLICATE_KEY","Map keys must be unique"),D.items.push(z)}else{let D=new $a.YAMLMap(t.schema);D.flow=!0,D.items.push(z);let L=(C??N).range;D.range=[N.range[0],L[1],L[2]],l.items.push(D)}p=C?C.range[2]:v.end}}let d=o?"}":"]",[m,...h]=r.end,f=p;if(m?.source===d)f=m.offset+m.source.length;else{let g=a[0].toUpperCase()+a.substring(1),E=u?`${g} must end with a ${d}`:`${g} in block collection must be sufficiently indented and end with a ${d}`;i(p,u?"MISSING_CHAR":"BAD_INDENT",E),m&&m.source.length!==1&&h.unshift(m)}if(h.length>0){let g=qp.resolveEnd(h,f,t.options.strict,i);g.comment&&(l.comment?l.comment+=`
`+g.comment:l.comment=g.comment),l.range=[r.offset,f,g.offset]}else l.range=[r.offset,f,f];return l}Ma.resolveFlowCollection=Fp});var Ba=S(Fa=>{"use strict";var Bp=x(),jp=B(),Kp=ke(),Xp=Ae(),zp=xa(),Yp=Da(),Vp=Ua();function wi(n,e,t,r,i,s){let o=t.type==="block-map"?zp.resolveBlockMap(n,e,t,r,s):t.type==="block-seq"?Yp.resolveBlockSeq(n,e,t,r,s):Vp.resolveFlowCollection(n,e,t,r,s),a=o.constructor;return i==="!"||i===a.tagName?(o.tag=a.tagName,o):(i&&(o.tag=i),o)}function Gp(n,e,t,r,i){let s=r.tag,o=s?e.directives.tagName(s.source,d=>i(s,"TAG_RESOLVE_FAILED",d)):null;if(t.type==="block-seq"){let{anchor:d,newlineAfterProp:m}=r,h=d&&s?d.offset>s.offset?d:s:d??s;h&&(!m||m.offset<h.offset)&&i(h,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===Kp.YAMLMap.tagName&&a==="map"||o===Xp.YAMLSeq.tagName&&a==="seq")return wi(n,e,t,i,o);let c=e.schema.tags.find(d=>d.tag===o&&d.collection===a);if(!c){let d=e.schema.knownTags[o];if(d?.collection===a)e.schema.tags.push(Object.assign({},d,{default:!1})),c=d;else return d?i(s,"BAD_COLLECTION_TYPE",`${d.tag} used for ${a} collection, but expects ${d.collection??"scalar"}`,!0):i(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),wi(n,e,t,i,o)}let l=wi(n,e,t,i,o,c),u=c.resolve?.(l,d=>i(s,"TAG_RESOLVE_FAILED",d),e.options)??l,p=Bp.isNode(u)?u:new jp.Scalar(u);return p.range=l.range,p.tag=o,c?.format&&(p.format=c.format),p}Fa.composeCollection=Gp});var ki=S(ja=>{"use strict";var vi=B();function Jp(n,e,t){let r=e.offset,i=Hp(e,n.options.strict,t);if(!i)return{value:"",type:null,comment:"",range:[r,r,r]};let s=i.mode===">"?vi.Scalar.BLOCK_FOLDED:vi.Scalar.BLOCK_LITERAL,o=e.source?Wp(e.source):[],a=o.length;for(let f=o.length-1;f>=0;--f){let g=o[f][1];if(g===""||g==="\r")a=f;else break}if(a===0){let f=i.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",g=r+i.length;return e.source&&(g+=e.source.length),{value:f,type:s,comment:i.comment,range:[r,g,g]}}let c=e.indent+i.indent,l=e.offset+i.length,u=0;for(let f=0;f<a;++f){let[g,E]=o[f];if(E===""||E==="\r")i.indent===0&&g.length>c&&(c=g.length);else{g.length<c&&t(l+g.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),i.indent===0&&(c=g.length),u=f,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=g.length+E.length+1}for(let f=o.length-1;f>=a;--f)o[f][0].length>c&&(a=f+1);let p="",d="",m=!1;for(let f=0;f<u;++f)p+=o[f][0].slice(c)+`
`;for(let f=u;f<a;++f){let[g,E]=o[f];l+=g.length+E.length+1;let b=E[E.length-1]==="\r";if(b&&(E=E.slice(0,-1)),E&&g.length<c){let T=`Block scalar lines must not be less indented than their ${i.indent?"explicit indentation indicator":"first line"}`;t(l-E.length-(b?2:1),"BAD_INDENT",T),g=""}s===vi.Scalar.BLOCK_LITERAL?(p+=d+g.slice(c)+E,d=`
`):g.length>c||E[0]==="	"?(d===" "?d=`
`:!m&&d===`
`&&(d=`

`),p+=d+g.slice(c)+E,d=`
`,m=!0):E===""?d===`
`?p+=`
`:d=`
`:(p+=d+E,d=" ",m=!1)}switch(i.chomp){case"-":break;case"+":for(let f=a;f<o.length;++f)p+=`
`+o[f][0].slice(c);p[p.length-1]!==`
`&&(p+=`
`);break;default:p+=`
`}let h=r+i.length+e.source.length;return{value:p,type:s,comment:i.comment,range:[r,h,h]}}function Hp({offset:n,props:e},t,r){if(e[0].type!=="block-scalar-header")return r(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:i}=e[0],s=i[0],o=0,a="",c=-1;for(let d=1;d<i.length;++d){let m=i[d];if(!a&&(m==="-"||m==="+"))a=m;else{let h=Number(m);!o&&h?o=h:c===-1&&(c=n+d)}}c!==-1&&r(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${i}`);let l=!1,u="",p=i.length;for(let d=1;d<e.length;++d){let m=e[d];switch(m.type){case"space":l=!0;case"newline":p+=m.source.length;break;case"comment":t&&!l&&r(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),p+=m.source.length,u=m.source.substring(1);break;case"error":r(m,"UNEXPECTED_TOKEN",m.message),p+=m.source.length;break;default:{let h=`Unexpected token in block scalar header: ${m.type}`;r(m,"UNEXPECTED_TOKEN",h);let f=m.source;f&&typeof f=="string"&&(p+=f.length)}}}return{mode:s,indent:o,chomp:a,comment:u,length:p}}function Wp(n){let e=n.split(/\n( *)/),t=e[0],r=t.match(/^( *)/),s=[r?.[1]?[r[1],t.slice(r[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}ja.resolveBlockScalar=Jp});var Li=S(Xa=>{"use strict";var Ai=B(),Zp=Ze();function Qp(n,e,t){let{offset:r,type:i,source:s,end:o}=n,a,c,l=(d,m,h)=>t(r+d,m,h);switch(i){case"scalar":a=Ai.Scalar.PLAIN,c=em(s,l);break;case"single-quoted-scalar":a=Ai.Scalar.QUOTE_SINGLE,c=tm(s,l);break;case"double-quoted-scalar":a=Ai.Scalar.QUOTE_DOUBLE,c=nm(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${i}`),{value:"",type:null,comment:"",range:[r,r+s.length,r+s.length]}}let u=r+s.length,p=Zp.resolveEnd(o,u,e,t);return{value:c,type:a,comment:p.comment,range:[r,u,p.offset]}}function em(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),Ka(n)}function tm(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),Ka(n.slice(1,-1)).replace(/''/g,"'")}function Ka(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let r=e.exec(n);if(!r)return n;let i=r[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;r=t.exec(n);)r[1]===""?s===`
`?i+=s:s=`
`:(i+=s+r[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,r=a.exec(n),i+s+(r?.[1]??"")}function nm(n,e){let t="";for(let r=1;r<n.length-1;++r){let i=n[r];if(!(i==="\r"&&n[r+1]===`
`))if(i===`
`){let{fold:s,offset:o}=rm(n,r);t+=s,r=o}else if(i==="\\"){let s=n[++r],o=im[s];if(o)t+=o;else if(s===`
`)for(s=n[r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="\r"&&n[r+1]===`
`)for(s=n[++r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=sm(n,r+1,a,e),r+=a}else{let a=n.substr(r-1,2);e(r-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(i===" "||i==="	"){let s=r,o=n[r+1];for(;o===" "||o==="	";)o=n[++r+1];o!==`
`&&!(o==="\r"&&n[r+2]===`
`)&&(t+=r>s?n.slice(s,r+1):i)}else t+=i}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function rm(n,e){let t="",r=n[e+1];for(;(r===" "||r==="	"||r===`
`||r==="\r")&&!(r==="\r"&&n[e+2]!==`
`);)r===`
`&&(t+=`
`),e+=1,r=n[e+1];return t||(t=" "),{fold:t,offset:e}}var im={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function sm(n,e,t,r){let i=n.substr(e,t),o=i.length===t&&/^[0-9a-fA-F]+$/.test(i)?parseInt(i,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return r(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Xa.resolveFlowScalar=Qp});var Va=S(Ya=>{"use strict";var Pe=x(),za=B(),om=ki(),am=Li();function cm(n,e,t,r){let{value:i,type:s,comment:o,range:a}=e.type==="block-scalar"?om.resolveBlockScalar(n,e,r):am.resolveFlowScalar(e,n.options.strict,r),c=t?n.directives.tagName(t.source,p=>r(t,"TAG_RESOLVE_FAILED",p)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Pe.SCALAR]:c?l=lm(n.schema,i,c,t,r):e.type==="scalar"?l=dm(n,i,e,r):l=n.schema[Pe.SCALAR];let u;try{let p=l.resolve(i,d=>r(t??e,"TAG_RESOLVE_FAILED",d),n.options);u=Pe.isScalar(p)?p:new za.Scalar(p)}catch(p){let d=p instanceof Error?p.message:String(p);r(t??e,"TAG_RESOLVE_FAILED",d),u=new za.Scalar(i)}return u.range=a,u.source=i,s&&(u.type=s),c&&(u.tag=c),l.format&&(u.format=l.format),o&&(u.comment=o),u}function lm(n,e,t,r,i){if(t==="!")return n[Pe.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(i(r,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Pe.SCALAR])}function dm({atKey:n,directives:e,schema:t},r,i,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(r))||t[Pe.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(r))??t[Pe.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),u=`Value may be parsed as either ${c} or ${l}`;s(i,"TAG_RESOLVE_FAILED",u,!0)}}return o}Ya.composeScalar=cm});var Ja=S(Ga=>{"use strict";function um(n,e,t){if(e){t??(t=e.length);for(let r=t-1;r>=0;--r){let i=e[r];switch(i.type){case"space":case"comment":case"newline":n-=i.source.length;continue}for(i=e[++r];i?.type==="space";)n+=i.source.length,i=e[++r];break}}return n}Ga.emptyScalarPosition=um});var Za=S(Oi=>{"use strict";var fm=lt(),pm=x(),mm=Ba(),Ha=Va(),hm=Ze(),gm=Ja(),ym={composeNode:Wa,composeEmptyNode:Ri};function Wa(n,e,t,r){let i=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,u=!0;switch(e.type){case"alias":l=bm(n,e,r),(a||c)&&r(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=Ha.composeScalar(n,e,c,r),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=mm.composeCollection(ym,n,e,t,r),a&&(l.anchor=a.source.substring(1))}catch(p){let d=p instanceof Error?p.message:String(p);r(e,"RESOURCE_EXHAUSTION",d)}break;default:{let p=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;r(e,"UNEXPECTED_TOKEN",p),u=!1}}return l??(l=Ri(n,e.offset,void 0,null,t,r)),a&&l.anchor===""&&r(a,"BAD_ALIAS","Anchor cannot be an empty string"),i&&n.options.stringKeys&&(!pm.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&r(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&u&&(l.srcToken=e),l}function Ri(n,e,t,r,{spaceBefore:i,comment:s,anchor:o,tag:a,end:c},l){let u={type:"scalar",offset:gm.emptyScalarPosition(e,t,r),indent:-1,source:""},p=Ha.composeScalar(n,u,a,l);return o&&(p.anchor=o.source.substring(1),p.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),i&&(p.spaceBefore=!0),s&&(p.comment=s,p.range[2]=c),p}function bm({options:n},{offset:e,source:t,end:r},i){let s=new fm.Alias(t.substring(1));s.source===""&&i(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&i(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=hm.resolveEnd(r,o,n.strict,i);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}Oi.composeEmptyNode=Ri;Oi.composeNode=Wa});var tc=S(ec=>{"use strict";var Em=vt(),Qa=Za(),_m=Ze(),Tm=Rt();function Nm(n,e,{offset:t,start:r,value:i,end:s},o){let a=Object.assign({_directives:e},n),c=new Em.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},u=Tm.resolveProps(r,{indicator:"doc-start",next:i??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});u.found&&(c.directives.docStart=!0,i&&(i.type==="block-map"||i.type==="block-seq")&&!u.hasNewline&&o(u.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=i?Qa.composeNode(l,i,u,o):Qa.composeEmptyNode(l,u.end,r,null,u,o);let p=c.contents.range[2],d=_m.resolveEnd(s,p,!1,o);return d.comment&&(c.comment=d.comment),c.range=[t,p,d.offset],c}ec.composeDoc=Nm});var xi=S(ic=>{"use strict";var Sm=Bt("process"),wm=yr(),vm=vt(),Ot=Lt(),nc=x(),km=tc(),Am=Ze();function It(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function rc(n){let e="",t=!1,r=!1;for(let i=0;i<n.length;++i){let s=n[i];switch(s[0]){case"#":e+=(e===""?"":r?`

`:`
`)+(s.substring(1)||" "),t=!0,r=!1;break;case"%":n[i+1]?.[0]!=="#"&&(i+=1),t=!1;break;default:t||(r=!0),t=!1}}return{comment:e,afterEmptyLine:r}}var Ii=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,r,i,s)=>{let o=It(t);s?this.warnings.push(new Ot.YAMLWarning(o,r,i)):this.errors.push(new Ot.YAMLParseError(o,r,i))},this.directives=new wm.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:r,afterEmptyLine:i}=rc(this.prelude);if(r){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${r}`:r;else if(i||e.directives.docStart||!s)e.commentBefore=r;else if(nc.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];nc.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${r}
${a}`:r}else{let o=s.commentBefore;s.commentBefore=o?`${r}
${o}`:r}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:rc(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,r=-1){for(let i of e)yield*this.next(i);yield*this.end(t,r)}*next(e){switch(Sm.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,r,i)=>{let s=It(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",r,i)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=km.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,r=new Ot.YAMLParseError(It(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(r):this.doc.errors.push(r);break}case"doc-end":{if(!this.doc){let r="Unexpected doc-end without preceding document";this.errors.push(new Ot.YAMLParseError(It(e),"UNEXPECTED_TOKEN",r));break}this.doc.directives.docEnd=!0;let t=Am.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let r=this.doc.comment;this.doc.comment=r?`${r}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new Ot.YAMLParseError(It(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let r=Object.assign({_directives:this.directives},this.options),i=new vm.Document(void 0,r);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),i.range=[0,t,t],this.decorate(i,!1),yield i}}};ic.Composer=Ii});var ac=S(Un=>{"use strict";var Lm=ki(),Rm=Li(),Om=Lt(),sc=mt();function Im(n,e=!0,t){if(n){let r=(i,s,o)=>{let a=typeof i=="number"?i:Array.isArray(i)?i[0]:i.offset;if(t)t(a,s,o);else throw new Om.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return Rm.resolveFlowScalar(n,e,r);case"block-scalar":return Lm.resolveBlockScalar({options:{strict:e}},n,r)}}return null}function xm(n,e){let{implicitKey:t=!1,indent:r,inFlow:i=!1,offset:s=-1,type:o="PLAIN"}=e,a=sc.stringifyString({type:o,value:n},{implicitKey:t,indent:r>0?" ".repeat(r):"",inFlow:i,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:r,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),u=a.substring(0,l),p=a.substring(l+1)+`
`,d=[{type:"block-scalar-header",offset:s,indent:r,source:u}];return oc(d,c)||d.push({type:"newline",offset:-1,indent:r,source:`
`}),{type:"block-scalar",offset:s,indent:r,props:d,source:p}}case'"':return{type:"double-quoted-scalar",offset:s,indent:r,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:r,source:a,end:c};default:return{type:"scalar",offset:s,indent:r,source:a,end:c}}}function Cm(n,e,t={}){let{afterKey:r=!1,implicitKey:i=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(r&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=sc.stringifyString({type:o,value:e},{implicitKey:i||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Dm(n,c);break;case'"':Ci(n,c,"double-quoted-scalar");break;case"'":Ci(n,c,"single-quoted-scalar");break;default:Ci(n,c,"scalar")}}function Dm(n,e){let t=e.indexOf(`
`),r=e.substring(0,t),i=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=r,n.source=i}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:r}];oc(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:i})}}function oc(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function Ci(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let r=n.props.slice(1),i=e.length;n.props[0].type==="block-scalar-header"&&(i-=n.props[0].source.length);for(let s of r)s.offset+=i;delete n.props,Object.assign(n,{type:t,source:e,end:r});break}case"block-map":case"block-seq":{let i={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[i]});break}default:{let r="indent"in n?n.indent:-1,i="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:r,source:e,end:i})}}}Un.createScalarToken=xm;Un.resolveAsScalar=Im;Un.setScalarValue=Cm});var lc=S(cc=>{"use strict";var Pm=n=>"type"in n?Bn(n):Fn(n);function Bn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Bn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=Fn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=Fn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=Fn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function Fn({start:n,key:e,sep:t,value:r}){let i="";for(let s of n)i+=s.source;if(e&&(i+=Bn(e)),t)for(let s of t)i+=s.source;return r&&(i+=Bn(r)),i}cc.stringify=Pm});var pc=S(fc=>{"use strict";var Di=Symbol("break visit"),$m=Symbol("skip children"),dc=Symbol("remove item");function $e(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),uc(Object.freeze([]),n,e)}$e.BREAK=Di;$e.SKIP=$m;$e.REMOVE=dc;$e.itemAtPath=(n,e)=>{let t=n;for(let[r,i]of e){let s=t?.[r];if(s&&"items"in s)t=s.items[i];else return}return t};$e.parentCollection=(n,e)=>{let t=$e.itemAtPath(n,e.slice(0,-1)),r=e[e.length-1][0],i=t?.[r];if(i&&"items"in i)return i;throw new Error("Parent collection not found")};function uc(n,e,t){let r=t(e,n);if(typeof r=="symbol")return r;for(let i of["key","value"]){let s=e[i];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=uc(Object.freeze(n.concat([[i,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===Di)return Di;a===dc&&(s.items.splice(o,1),o-=1)}}typeof r=="function"&&i==="key"&&(r=r(e,n))}}return typeof r=="function"?r(e,n):r}fc.visit=$e});var jn=S(ee=>{"use strict";var Pi=ac(),qm=lc(),Mm=pc(),$i="\uFEFF",qi="",Mi="",Ui="",Um=n=>!!n&&"items"in n,Fm=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function Bm(n){switch(n){case $i:return"<BOM>";case qi:return"<DOC>";case Mi:return"<FLOW_END>";case Ui:return"<SCALAR>";default:return JSON.stringify(n)}}function jm(n){switch(n){case $i:return"byte-order-mark";case qi:return"doc-mode";case Mi:return"flow-error-end";case Ui:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}ee.createScalarToken=Pi.createScalarToken;ee.resolveAsScalar=Pi.resolveAsScalar;ee.setScalarValue=Pi.setScalarValue;ee.stringify=qm.stringify;ee.visit=Mm.visit;ee.BOM=$i;ee.DOCUMENT=qi;ee.FLOW_END=Mi;ee.SCALAR=Ui;ee.isCollection=Um;ee.isScalar=Fm;ee.prettyToken=Bm;ee.tokenType=jm});var ji=S(hc=>{"use strict";var xt=jn();function ce(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var mc=new Set("0123456789ABCDEFabcdef"),Km=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),Kn=new Set(",[]{}"),Xm=new Set(` ,[]{}
\r	`),Fi=n=>!n||Xm.has(n),Bi=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let r=this.next??"stream";for(;r&&(t||this.hasChars(1));)r=yield*this.parseNext(r)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let r=0;for(;t===" ";)t=this.buffer[++r+e];if(t==="\r"){let i=this.buffer[r+e+1];if(i===`
`||!i&&!this.atEnd)return e+r+1}return t===`
`||r>=this.indentNext||!t&&!this.atEnd?e+r:-1}if(t==="-"||t==="."){let r=this.buffer.substr(e,3);if((r==="---"||r==="...")&&ce(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===xt.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,r=e.indexOf("#");for(;r!==-1;){let s=e[r-1];if(s===" "||s==="	"){t=r-1;break}else r=e.indexOf("#",r+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let i=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-i),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield xt.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ce(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ce(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ce(t)){let r=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=r,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(Fi),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,r=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=r=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let i=this.getLine();if(i===null)return this.setNext("flow");if((r!==-1&&r<this.indentNext&&i[0]!=="#"||r===0&&(i.startsWith("---")||i.startsWith("..."))&&ce(i[3]))&&!(r===this.indentNext-1&&this.flowLevel===1&&(i[0]==="]"||i[0]==="}")))return this.flowLevel=0,yield xt.FLOW_END,yield*this.parseLineStart();let s=0;for(;i[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),i[s]){case void 0:return"flow";case"#":return yield*this.pushCount(i.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(Fi),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ce(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let r=this.buffer.substring(0,t),i=r.indexOf(`
`,this.pos);if(i!==-1){for(;i!==-1;){let s=this.continueScalar(i+1);if(s===-1)break;i=r.indexOf(`
`,s)}i!==-1&&(t=i-(r[i-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ce(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,r;e:for(let s=this.pos;r=this.buffer[s];++s)switch(r){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!r&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let i=e+1;for(r=this.buffer[i];r===" ";)r=this.buffer[++i];if(r==="	"){for(;r==="	"||r===" "||r==="\r"||r===`
`;)r=this.buffer[++i];e=i-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield xt.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,r=this.pos-1,i;for(;i=this.buffer[++r];)if(i===":"){let s=this.buffer[r+1];if(ce(s)||e&&Kn.has(s))break;t=r}else if(ce(i)){let s=this.buffer[r+1];if(i==="\r"&&(s===`
`?(r+=1,i=`
`,s=this.buffer[r+1]):t=r),s==="#"||e&&Kn.has(s))break;if(i===`
`){let o=this.continueScalar(r+1);if(o===-1)break;r=Math.max(r,o-2)}}else{if(e&&Kn.has(i))break;t=r}return!i&&!this.atEnd?this.setNext("plain-scalar"):(yield xt.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let r=this.buffer.slice(this.pos,e);return r?(yield r,this.pos+=r.length,r.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(Fi),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,r=this.charAt(1);if(ce(r)||t&&Kn.has(r)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ce(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(Km.has(t))t=this.buffer[++e];else if(t==="%"&&mc.has(this.buffer[e+1])&&mc.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,r;do r=this.buffer[++t];while(r===" "||e&&r==="	");let i=t-this.pos;return i>0&&(yield this.buffer.substr(this.pos,i),this.pos=t),i}*pushUntil(e){let t=this.pos,r=this.buffer[t];for(;!e(r);)r=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};hc.Lexer=Bi});var Xi=S(gc=>{"use strict";var Ki=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,r=this.lineStarts.length;for(;t<r;){let s=t+r>>1;this.lineStarts[s]<e?t=s+1:r=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let i=this.lineStarts[t-1];return{line:t,col:e-i+1}}}};gc.LineCounter=Ki});var Yi=S(Tc=>{"use strict";var zm=Bt("process"),yc=jn(),Ym=ji();function Le(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function bc(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function _c(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function Xn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function Qe(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function zn(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function Ec(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Le(e.start,"explicit-key-ind")&&!Le(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,_c(e.value)?e.value.end?zn(e.value.end,e.sep):e.value.end=e.sep:zn(e.start,e.sep),delete e.sep)}var zi=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new Ym.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let r of this.lexer.lex(e,t))yield*this.next(r);t||(yield*this.end())}*next(e){if(this.source=e,zm.env.LOG_TOKENS&&console.log("|",yc.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=yc.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let r=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:r,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let r=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in r?r.indent:0:t.type==="flow-collection"&&r.type==="document"&&(t.indent=0),t.type==="flow-collection"&&Ec(t),r.type){case"document":r.value=t;break;case"block-scalar":r.props.push(t);break;case"block-map":{let i=r.items[r.items.length-1];if(i.value){r.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(i.sep)i.value=t;else{Object.assign(i,{key:t,sep:[]}),this.onKeyLine=!i.explicitKey;return}break}case"block-seq":{let i=r.items[r.items.length-1];i.value?r.items.push({start:[],value:t}):i.value=t;break}case"flow-collection":{let i=r.items[r.items.length-1];!i||i.value?r.items.push({start:[],key:t,sep:[]}):i.sep?i.value=t:Object.assign(i,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((r.type==="document"||r.type==="block-map"||r.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let i=t.items[t.items.length-1];i&&!i.sep&&!i.value&&i.start.length>0&&bc(i.start)===-1&&(t.indent===0||i.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(r.type==="document"?r.end=i.start:r.items.push({start:i.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{bc(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=Xn(this.peek(2)),r=Qe(t),i;e.end?(i=e.end,i.push(this.sourceToken),delete e.end):i=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:r,key:e,sep:i}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){zn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let r=!this.onKeyLine&&this.indent===e.indent,i=r&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(i&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":i||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):i||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Le(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(_c(t.key)&&!Le(t.sep,"newline")){let o=Qe(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Le(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=Qe(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||i?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Le(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);i||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Le(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else r&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){zn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Le(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let r=this.startBlockValue(e);if(r){this.stack.push(r);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let r;do yield*this.pop(),r=this.peek(1);while(r?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let i=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:i,sep:[]}):t.sep?this.stack.push(i):Object.assign(t,{key:i,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let r=this.startBlockValue(e);r?this.stack.push(r):(yield*this.pop(),yield*this.step())}else{let r=this.peek(2);if(r.type==="block-map"&&(this.type==="map-value-ind"&&r.indent===e.indent||this.type==="newline"&&!r.items[r.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&r.type!=="flow-collection"){let i=Xn(r),s=Qe(i);Ec(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=Xn(e),r=Qe(t);return r.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=Xn(e),r=Qe(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(r=>r.type==="newline"||r.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};Tc.Parser=zi});var kc=S(Dt=>{"use strict";var Nc=xi(),Vm=vt(),Ct=Lt(),Gm=Or(),Jm=x(),Hm=Xi(),Sc=Yi();function wc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new Hm.LineCounter||null,prettyErrors:e}}function Wm(n,e={}){let{lineCounter:t,prettyErrors:r}=wc(e),i=new Sc.Parser(t?.addNewLine),s=new Nc.Composer(e),o=Array.from(s.compose(i.parse(n)));if(r&&t)for(let a of o)a.errors.forEach(Ct.prettifyError(n,t)),a.warnings.forEach(Ct.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function vc(n,e={}){let{lineCounter:t,prettyErrors:r}=wc(e),i=new Sc.Parser(t?.addNewLine),s=new Nc.Composer(e),o=null;for(let a of s.compose(i.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new Ct.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return r&&t&&(o.errors.forEach(Ct.prettifyError(n,t)),o.warnings.forEach(Ct.prettifyError(n,t))),o}function Zm(n,e,t){let r;typeof e=="function"?r=e:t===void 0&&e&&typeof e=="object"&&(t=e);let i=vc(n,t);if(!i)return null;if(i.warnings.forEach(s=>Gm.warn(i.options.logLevel,s)),i.errors.length>0){if(i.options.logLevel!=="silent")throw i.errors[0];i.errors=[]}return i.toJS(Object.assign({reviver:r},t))}function Qm(n,e,t){let r=null;if(typeof e=="function"||Array.isArray(e)?r=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let i=Math.round(t);t=i<1?void 0:i>8?{indent:8}:{indent:i}}if(n===void 0){let{keepUndefined:i}=t??e??{};if(!i)return}return Jm.isDocument(n)&&!r?n.toString(t):new Vm.Document(n,r,t).toString(t)}Dt.parse=Zm;Dt.parseAllDocuments=Wm;Dt.parseDocument=vc;Dt.stringify=Qm});var Vn=S(q=>{"use strict";var eh=xi(),th=vt(),nh=fi(),Vi=Lt(),rh=lt(),Re=x(),ih=we(),sh=B(),oh=ke(),ah=Ae(),ch=jn(),lh=ji(),dh=Xi(),uh=Yi(),Yn=kc(),Ac=st();q.Composer=eh.Composer;q.Document=th.Document;q.Schema=nh.Schema;q.YAMLError=Vi.YAMLError;q.YAMLParseError=Vi.YAMLParseError;q.YAMLWarning=Vi.YAMLWarning;q.Alias=rh.Alias;q.isAlias=Re.isAlias;q.isCollection=Re.isCollection;q.isDocument=Re.isDocument;q.isMap=Re.isMap;q.isNode=Re.isNode;q.isPair=Re.isPair;q.isScalar=Re.isScalar;q.isSeq=Re.isSeq;q.Pair=ih.Pair;q.Scalar=sh.Scalar;q.YAMLMap=oh.YAMLMap;q.YAMLSeq=ah.YAMLSeq;q.CST=ch;q.Lexer=lh.Lexer;q.LineCounter=dh.LineCounter;q.Parser=uh.Parser;q.parse=Yn.parse;q.parseAllDocuments=Yn.parseAllDocuments;q.parseDocument=Yn.parseDocument;q.stringify=Yn.stringify;q.visit=Ac.visit;q.visitAsync=Ac.visitAsync});import{closeSync as Xg,existsSync as Ut,fsyncSync as zg,mkdirSync as Yg,openSync as Vg,readFileSync as _l,readdirSync as Gg,renameSync as yl,rmSync as ls,statSync as Tl,writeFileSync as Jg}from"node:fs";import{createHash as Hg,randomUUID as bl}from"node:crypto";import{dirname as Mt,join as G,resolve as de}from"node:path";import{spawnSync as Wg}from"node:child_process";import{DatabaseSync as Nl}from"node:sqlite";import{createHash as sd}from"node:crypto";function it(n,e){return n<e?-1:n>e?1:0}function ie(n){return(e,t)=>it(n(e),n(t))}var jt=9,_s=2,Ts="0.7.0";function Z(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,r])=>r!==void 0).sort(([r],[i])=>it(r,i)).map(([r,i])=>[r,e(i)])):t;return JSON.stringify(e(n))}function me(n){return sd("sha256").update(Z(n)).digest("hex")}function Ns(n){return me({projectRoot:n}).slice(0,24)}function Ss(n){let{zephyrRoot:e,projectRoot:t,producer:r,...i}=n;return me(i)}var ws=jt,vs=`
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
  doc_path         TEXT
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
`,ks=`
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
`;import{existsSync as Cs,mkdtempSync as wd,realpathSync as vd,rmSync as kd,writeFileSync as Ad}from"node:fs";import{tmpdir as Ld}from"node:os";import{join as Yt,resolve as fr}from"node:path";import{spawnSync as Rd}from"node:child_process";var Kt=`#!/usr/bin/env python3
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
`;function As(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function Ls(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),r=[],i={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(i.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=i.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:r.push(a)}};for(let o of t){let a=o.trim();if(a===""){i.kind==="brief"?i={kind:"detail"}:i.kind==="detail"&&r.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",u=""]=c,p=l.toLowerCase(),d=u.trim();switch(p){case"brief":case"short":i={kind:"brief"},s(d);break;case"param":{let m=d.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let h={name:m[2],description:(m[3]??"").trim()};m[1]&&(h.direction=m[1].replace(/\s+/g,"")),e.params.push(h),i={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(d),i={kind:"return",index:e.returns.length-1};break;case"retval":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),i={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),i={kind:"detail"};break}case"addtogroup":e.addtogroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"ingroup":e.ingroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"since":e.since=d,i={kind:"detail"};break;case"deprecated":e.deprecated=!0,i={kind:"detail"},s(d);break;case"note":case"warning":case"details":case"remark":i={kind:"detail"},s(`${l.toUpperCase()}: ${d}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":i={kind:"detail"};break;default:i={kind:"detail"},s(d);break}}e.detail=r.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=Be(e.brief)),e.detail=Be(e.detail),e.returns=e.returns.map(Be);for(let o of e.params)o.description=Be(o.description);for(let o of e.retvals)o.description=Be(o.description);return e}function Be(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function ad(n){let e=[];for(let t of n.split(`
`)){let r=t.trim(),i=r.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(i){e.push({kind:"define",id:i[1],title:(i[2]??"").trim()});continue}let s=r.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of r.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function je(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var cd=["z_impl_"];function ld(n){for(let e of cd)if(n.startsWith(e))return n.slice(e.length);return n}var dd=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,ud=new RegExp(String.raw`^(struct|union|enum)\s+${dd}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),fd=/^[^(]*\(\s*\*/;function pd(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=je(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let r=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(r)return{kind:"typedef",name:r[1],signature:je(e)};let i=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(i)return{kind:"typedef",name:i[1],signature:je(e)};let s=e.match(ud);if(s)return{kind:s[1],name:s[2],signature:je(e.replace(/\{[\s\S]*$/,"").trim())};if(fd.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:ld(a),signature:je(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function md(n,e){let t=0,r=!1,i=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(i){l==="*"&&a[c+1]==="/"&&(i=!1,c++);continue}if(l==="/"&&a[c+1]==="*")i=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,r=!0):l==="}"&&t--}}if(r&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),u=c.lastIndexOf("}");return l<0||u<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,u),line:e,endLine:o}}}return null}function hd(n,e){let t=n.split(`
`).map(f=>/^\s*#/.test(f)?"":f).join(`
`),r=[],i="",s=[],o=[],a=[],c=0,l=e,u=e,p=()=>{r.push({code:i,before:s,trailingPrevious:o,trailingOwn:a,line:u}),i="",s=[],o=[],a=[]};for(let f=0;f<t.length;f++){let g=t[f];if(g===`
`){l++,i+=" ";continue}if(g==="/"&&t[f+1]==="*"){let E=t.indexOf("*/",f+2),b=E<0?t.length:E+2,_=t.slice(f,b);/^\/\*[*!]</.test(_)?(i.trim()?a:o).push(_):/^\/\*[*!]/.test(_)&&s.push(_);for(let T of _)T===`
`&&l++;f=b-1;continue}if(g==="/"&&t[f+1]==="/"){let E=t.indexOf(`
`,f);f=(E<0?t.length:E)-1;continue}if(g==="("||g==="[")c++;else if(g===")"||g==="]")c--;else if(g===","&&c<=0){p();continue}!i.trim()&&g.trim()&&(u=l),i+=g}p();let d=f=>As(f.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],h=(f,g)=>{f&&g&&!f.brief&&(f.brief=Be(d(g)))};for(let f of r){h(m[m.length-1],f.trailingPrevious[0]);let g=f.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!g)continue;let E=f.before[f.before.length-1],b=E?Ls(d(E)):void 0,_=b?.brief??b?.detail??"",T={name:g[1],value:je(g[2]??""),brief:_,detail:b?.brief?b.detail??"":"",line:f.line};m.push(T),h(T,f.trailingOwn[0])}return m}function gd(n,e){let t=e,r=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||r.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let i=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];i.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:i.join(`
`),line:t}}function Rs(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=[],i=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,u=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){u=!0;break}if(!u)continue;let p=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),d={text:As(p),endLine:l},m=Ls(d.text),h=ad(d.text);if(h.length>0){let _;for(let T of h)switch(T.kind){case"define":{let w={id:T.id,title:T.title,header:e},k=m.ingroup??s[s.length-1];k&&(w.parent=k),i.push(w),_=T.id;break}case"add":_=T.id;break;case"open":s.push(_??s[s.length-1]??""),_=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let f=gd(t,l+1);if(!f){o=l;continue}let g=pd(f.text);if(!g){o=l;continue}let E=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],b={name:g.name,kind:g.kind,signature:g.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:f.line+1,deprecated:m.deprecated};if(m.brief&&(b.brief=m.brief),m.detail&&(b.detail=m.detail),E&&(b.group=E),m.since&&(b.since=m.since),r.push(b),o=l,g.kind==="enum"&&f.text.includes("{")){let _=md(t,f.line);if(_){for(let T of hd(_.body,_.line)){let w={name:T.name,kind:"enumvalue",signature:T.value?`${T.name} = ${T.value}`:T.name,params:[],returns:[],retvals:[],header:e,line:T.line+1,deprecated:!1,parentSymbol:g.name};T.brief&&(w.brief=T.brief),T.detail&&(w.detail=T.detail),E&&(w.group=E),r.push(w)}o=_.endLine}}}return{symbols:r,groups:i}}import{existsSync as Sd}from"node:fs";import{join as Xt}from"node:path";import{spawnSync as xs}from"node:child_process";import{existsSync as dr,readFileSync as yd,realpathSync as bd}from"node:fs";import{delimiter as Ed,join as _d,resolve as Td}from"node:path";function Os(n,e){if(n.includes("/")||n.includes("\\"))return dr(n)?Td(n):void 0;for(let t of(e??"").split(Ed).filter(Boolean)){let r=_d(t,n);if(dr(r))return r}}function Nd(n){let e=Os("west",n.PATH);if(e)try{let r=(yd(bd(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return r?r[1]?.endsWith("/env")&&r[2]?Os(r[2].trim().split(/\s+/,1)[0],n.PATH):r[1]&&dr(r[1])?r[1]:void 0:void 0}catch{return}}function ur(n){return[n.PYTHON_EXECUTABLE,Nd(n),"python3","python"].filter((e,t,r)=>!!e&&r.indexOf(e)===t)}function Is(n){let e=new Map;for(let t of n.split(/\r?\n/)){let r=t.split("#")[0].trim();if(r===""||r.startsWith("-"))continue;let[i,...s]=r.split(";"),o=i.split("[")[0].split(/[<>=!~]/)[0].trim();if(o==="")continue;let a=s.join(";").trim();e.has(o)||e.set(o,{name:o,...a?{marker:a}:{}})}return[...e.values()]}function zt(n=process.env){for(let e of ur(n))if(xs(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function Oe(n,e=process.env){let t=Xt(n,"scripts","kconfig"),r=Xt(n,"scripts","dts","python-devicetree","src");if([Xt(t,"kconfiglib.py"),Xt(r,"devicetree","edtlib.py")].filter(a=>!Sd(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=ur(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(r)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(xs(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}function Ds(n){let e=fr(n),t=e;try{t=vd(e)}catch{}return[...new Set([e,t])].flatMap(r=>[fr(r,"..","doxygen","xml"),fr(r,"doc","_build","doxygen","xml")]).find(r=>Cs(Yt(r,"index.xml")))}function Od(n,e){if(!Cs(Yt(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=wd(Yt(Ld(),"zephyr-ai-api-")),r=Yt(t,"api-export.py");try{Ad(r,Kt,{mode:384});let i=Rd(zt(),[r,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(i.status!==0){let o=i.stderr?.trim()??"";try{let a=JSON.parse(i.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(u=>`- ${u.code}: ${u.message}${u.path?` (${u.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(i.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s.symbols.sort(ie(o=>[o.name,o.header,String(o.line).padStart(9,"0"),o.kind,o.doxygenId??""].join("\0"))),s.groups.sort(ie(o=>`${o.id}\0${o.title??""}`)),s}finally{kd(t,{recursive:!0,force:!0})}}function Ps(n,e){if(e)return Od(n.root,e);let t=[],r=[],i=[],s=n.select({under:"include/zephyr",skip:["include/zephyr/internal","include/zephyr/arch/arm/internal"],match:a=>a.endsWith(".h")});for(let a of s){let c=a.slice(15),l;try{l=n.read(a)}catch(d){throw new Error(`Cannot read public API header ${a}: ${d instanceof Error?d.message:String(d)}`)}let u=`include/zephyr/${c}`,p=Rs(l,u);for(let d of p.symbols){if(d.kind==="function"&&d.signature.includes("=")){i.push({path:`${u}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let m=d.signature.indexOf("["),h=d.signature.indexOf("(");if(d.kind==="function"&&m>=0&&(h<0||m<h)){i.push({path:`${u}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){i.push({path:`${u}:${d.line}`,reason:"fallback-include-guard"});continue}t.push(d)}r.push(...p.groups)}t.sort(ie(a=>a.name));let o=new Map;for(let a of r)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:t,groups:[...o.values()],mode:"header-fallback",report:{discovered:t.length+o.size+i.length+1,indexed:t.length+o.size,intentionallyExcluded:[...i,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as xd,mkdtempSync as Cd,rmSync as Dd,writeFileSync as Pd}from"node:fs";import{tmpdir as $d}from"node:os";import{dirname as $s,join as pr}from"node:path";import{spawnSync as qd}from"node:child_process";var Vt=`#!/usr/bin/env python3
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
`;var qs=new Map;function Ms(n){let e=JSON.stringify(n),t=qs.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let r=$s($s(n[0])),i=pr(r,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!xd(i))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=Cd(pr($d(),"zephyr-ai-bindings-")),o=pr(s,"binding-export.py");try{Pd(o,Vt,{mode:384});let a=[o,"--zephyr",r];for(let u of n)a.push("--root",u);let c=qd(Oe(r),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let u="";try{u=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let p=u||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${p}`)}let l=JSON.parse(c.stdout);return qs.set(e,l),l}finally{Dd(s,{recursive:!0,force:!0})}}var Rc=lr(Vn(),1);import{existsSync as fh}from"node:fs";import{join as Lc}from"node:path";import{spawnSync as ph}from"node:child_process";function Gi(n,e){try{let t=(0,Rc.parse)(n.read(e),{logLevel:"silent"});if(!t||typeof t!="object"||Array.isArray(t))throw new Error("expected a YAML mapping");return t}catch(t){throw new Error(`Failed to parse board/SoC metadata ${e}: ${t.message}`)}}function le(n){return Array.isArray(n)?n:[]}function Pt(n){return le(n).filter(e=>typeof e=="string")}function mh(n){let e=Lc(n,"scripts","list_boards.py");if(!fh(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let i of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(i&&(t=ph(i,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let r=new Map;for(let i of t.stdout.split(`
`).filter(Boolean)){let s=i.split("@@").filter(Boolean).map(u=>u.split(";")),o=u=>s.find(([p])=>p===u)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),r.set(a,c)}return r}function hh(n,e){let t=[],r=n.select({under:e,match:i=>(i.endsWith(".yaml")||i.endsWith(".yml"))&&i!=="board.yml"&&i!=="board.yaml"});for(let i of r){if(i.slice(e.length+1).includes("/"))continue;let s=Gi(n,i),o={toolchains:Pt(s.toolchain),supported:Pt(s.supported),...typeof s.name=="string"?{name:s.name}:{},...typeof s.arch=="string"?{arch:s.arch}:{},...typeof s.type=="string"?{type:s.type}:{},...typeof s.ram=="number"?{ram:s.ram}:{},...typeof s.flash=="number"?{flash:s.flash}:{},...typeof s.vendor=="string"?{vendor:s.vendor}:{}};typeof s.identifier=="string"&&t.push({identifier:s.identifier,...o});let a=s.variants&&typeof s.variants=="object"&&!Array.isArray(s.variants)?s.variants:{};for(let[c,l]of Object.entries(a)){let u=l&&typeof l=="object"&&!Array.isArray(l)?l:{};t.push({identifier:c,...o,toolchains:Pt(u.toolchain).length?Pt(u.toolchain):o.toolchains,supported:[...new Set([...o.supported,...Pt(u.supported)])]})}}return t.sort(ie(i=>i.identifier)),t}function Oc(n){let e=[],t=n.root,r=mh(t);for(let i of n.select({under:"boards",match:s=>s==="board.yml"||s==="board.yaml"})){let s=Lc(t,i),o=Gi(n,i),a=[],c=o.board;c&&typeof c=="object"&&!Array.isArray(c)&&a.push(c);for(let h of le(o.boards))h&&typeof h=="object"&&!Array.isArray(h)&&a.push(h);if(a.length===0)continue;let l=i.slice(0,i.lastIndexOf("/")),u=hh(n,l),p=n.select({under:`${l}/doc`,match:h=>h.endsWith(".rst")}).map(h=>h.slice(l.length+5)),d=p.includes("index.rst")?"index.rst":p[0],m=d?`${l}/doc/${d}`:void 0;for(let h of a){if(typeof h.name!="string")continue;let f=h.name,g=le(h.socs).flatMap(L=>{if(!L||typeof L!="object")return[];let Y=L;return typeof Y.name!="string"?[]:[{name:Y.name,variants:le(Y.variants).flatMap(oe=>oe&&typeof oe=="object"&&typeof oe.name=="string"?[oe.name]:[]),cpuclusters:le(Y.cpuclusters).flatMap(oe=>oe&&typeof oe=="object"&&typeof oe.name=="string"?[oe.name]:[])}]}),E=u.filter(L=>L.identifier===f||L.identifier.startsWith(`${f}/`)),b=r.get(f);if(!b)throw new Error(`Zephyr's board model did not enumerate ${f}.`);let _=b.qualifiers.length>0?b.qualifiers:[""],T=_.map(L=>L?`${f}/${L}`:f);for(let L of b.revisions)T.push(..._.map(Y=>Y?`${f}@${L}/${Y}`:`${f}@${L}`));let w=T.map(L=>({identifier:L,toolchains:[],supported:[]})),k=E.length>0?E:a.length===1?u:[],O=new Map(w.map(L=>[L.identifier,L]));for(let L of k){let Y=O.get(L.identifier);O.set(L.identifier,Y?{...Y,...L}:L)}let N=[...O.values()].sort((L,Y)=>it(L.identifier,Y.identifier)),v={name:f,dir:l,socs:g,targets:N,revisions:b.revisions,supported:[...new Set(N.flatMap(L=>L.supported))].sort()};typeof h.full_name=="string"&&(v.fullName=h.full_name),typeof h.vendor=="string"&&(v.vendor=h.vendor),b.defaultRevision&&(v.defaultRevision=b.defaultRevision),m&&(v.docPath=m);let C=N.find(L=>L.arch)?.arch;C&&(v.arch=C);let z=N.find(L=>L.ram!==void 0)?.ram;z!==void 0&&(v.ram=z);let D=N.find(L=>L.flash!==void 0)?.flash;D!==void 0&&(v.flash=D),e.push(v)}}return e.sort(ie(i=>i.name)),e}function Ic(n){let e=n.root,t=[];for(let r of n.select({under:"soc",match:i=>i==="soc.yml"||i==="soc.yaml"})){let i=Gi(n,r),s=r.slice(0,r.lastIndexOf("/")),o=r.slice(4),a=o.includes("/")?o.split("/")[0]:void 0,c=(u,p,d)=>{if(typeof u.name!="string")return;let m={name:u.name,dir:s,cpuclusters:le(u.cpuclusters).flatMap(h=>h&&typeof h=="object"&&typeof h.name=="string"?[h.name]:[])};p&&(m.family=p),d&&(m.series=d),a&&(m.vendor=a),t.push(m)};(u=>{for(let p of u){if(!p||typeof p!="object")continue;let d=p,m=typeof d.name=="string"?d.name:void 0;for(let h of le(d.socs))h&&typeof h=="object"&&c(h,m);for(let h of le(d.series)){if(!h||typeof h!="object")continue;let f=h,g=typeof f.name=="string"?f.name:void 0;for(let E of le(f.socs))E&&typeof E=="object"&&c(E,m,g)}}})(le(i.family));for(let u of le(i.socs))u&&typeof u=="object"&&c(u)}return t.sort(ie(r=>r.name)),t}import{existsSync as Th,lstatSync as Nh,realpathSync as Wi}from"node:fs";import{dirname as Sh,extname as wh,join as vh,relative as Jn,resolve as kh,sep as Zi}from"node:path";var gh="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function Gn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!gh.includes(t))return null;for(let r of e)if(r!==t)return null;return{char:t,length:e.length}}function yh(n){let e=[];for(let t=0;t<n.length;t++){let r=Gn(n[t]);if(!r)continue;let i=n[t-1];if(i===void 0)continue;let s=i.trim();if(s===""||r.length<s.length)continue;if(Gn(i)){if(Gn(n[t-2]??""))continue;continue}let o=Gn(n[t-2]??""),a=o!==null&&o.char===r.char;e.push({line:t-1,text:s,char:r.char,overlined:a})}return e}function bh(n){let e=[];return n.map(t=>{let r=t.overlined?`over:${t.char}`:t.char,i=e.indexOf(r);return i===-1&&(i=e.length,e.push(r)),i})}var Hi=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function xc(n){let e=n.split(`
`),t=[],r=s=>t.push({code:!1,text:s}),i=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(Hi.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",u=""]=a,p=c.length,d=l.toLowerCase(),m=[],h=s+1;for(;h<e.length;h++){let f=e[h];if(f.trim()===""){m.push("");continue}if(f.match(/^\s*/)[0].length<=p)break;m.push(f)}if(i.has(d)){s=h-1;continue}if(d==="code-block"||d==="code"||d==="literalinclude"){let f=u.trim(),g=Ji(m).join(`
`).replace(/^\n+|\n+$/g,"");g&&t.push({code:!0,text:`\`\`\`${f}
${g}
\`\`\``}),s=h-1;continue}if(d==="note"||d==="warning"||d==="important"||d==="tip"){let f=Ji(m).join(`
`).trim();f&&r(`${l.toUpperCase()}: ${f}`),s=h-1;continue}u.trim()&&r(u.trim());for(let f of Ji(m))r(f);s=h-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||r(o)}return t.map(s=>s.code?s.text:Eh(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function Ji(n){let e=n.filter(r=>r.trim()!=="").map(r=>r.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(r=>r.trim()===""?"":r.slice(t))}function Eh(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function Cc(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),r=[];for(let l of t){let u=l.match(Hi);u&&r.push(u[1].trim())}let i=yh(t),s=bh(i);if(i.length===0){let l=xc(e);return{title:"",labels:r,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=i[0].text,a=[],c=[];for(let l=0;l<i.length;l++){let u=i[l],p=s[l],d=i[l+1];for(;c.length>0&&c[c.length-1].level>=p;)c.pop();c.push({level:p,text:u.text});let m=u.line+2,h=d?d.line-(d.overlined?1:0):t.length,f=t.slice(m,Math.max(m,h)).join(`
`),g=xc(f),E=_h(t,u.line-(u.overlined?1:0));(g||l===0)&&a.push({...E?{anchor:E}:{},heading:u.text,headingPath:c.map(b=>b.text),ord:a.length,body:g})}return{title:o,labels:r,chunks:a}}function _h(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let r=n[t];if(r.trim()==="")continue;let i=r.match(Hi);return i?i[1].trim():void 0}}var Ah=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function Lh(n,e){let t=n.replace(/\.rst$/,""),r=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${r}.html`}function Dc(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function Rh(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function Oh(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let r=0;r<e.length;r++){let i=e[r].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!i)continue;let s=i[1].length;for(r+=1;r<e.length;r++){let o=e[r];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){r-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),u=(l?.[2]??c).replace(/\.rst$/,""),p=l?.[1]?.trim()||u.split("/").filter(Boolean).at(-1)?.replace(/^index$/,u.split("/").at(-2)??"index").replace(/[_-]/g," ");u&&p&&t.push(`${p} (${u})`)}}return[...new Set(t)]}function Ih(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function xh(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=1,i=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(r=s),Number.isInteger(o)&&o>=r&&(i=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(u=>u.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);r=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((u,p)=>p>=r-1&&u.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);i=l+(e["end-at"]?1:0)}return t=t.slice(r-1,i),{text:t.join(`
`),start:r,end:i}}function Qi(n,e,t,r,i=[]){let s=n.root,o=Wi(e);if(i.includes(o))throw new Error(`include cycle: ${[...i,o].map(u=>Jn(s,u)).join(" -> ")}`);let a=[...i,o],c=t.replace(/\r\n?/g,`
`).split(`
`),l=[];for(let u=0;u<c.length;u++){let p=c[u],d=p.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){l.push(p);continue}let m=d[1].length,h=d[2],f=d[3].trim(),g=[],E=u+1;for(;E<c.length;E++){let v=c[E];if(v.trim()===""){g.push(v);continue}if(v.match(/^\s*/)[0].length<=m)break;g.push(v)}if(u=E-1,h==="only"){if(/\bhtml\b/.test(f)){let v=g.map(z=>z.trim()?z.slice(Math.min(z.length,m+3)):""),C=Qi(n,o,v.join(`
`),r,i);l.push(...C.split(`
`).map(z=>`${" ".repeat(m)}${z}`))}continue}let b=Ih(g),_=kh(Sh(o),f);if(!Th(_))throw new Error(`include target not found: ${f}`);if(Nh(_).isSymbolicLink())throw new Error(`include target is a symbolic link: ${f}`);let T=Wi(s),w=Wi(_),k=Jn(T,w);if(k===".."||k.startsWith(`..${Zi}`))throw new Error(`include escapes the Zephyr tree: ${f}`);let O=Jn(T,w).replaceAll(Zi,"/"),N=xh(n.read(O),b);if(r.push({path:Jn(T,w).replaceAll(Zi,"/"),startLine:N.start,endLine:N.end,directive:h}),h==="literalinclude"){let v=b.language??wh(_).slice(1);l.push(`${" ".repeat(m)}.. code-block:: ${v}`,"",...N.text.split(`
`).map(C=>`${" ".repeat(m+3)}${C}`))}else{let v=Qi(n,w,N.text,r,a);l.push(...v.split(`
`).map(C=>`${" ".repeat(m)}${C}`))}}return l.join(`
`)}function Pc(n,e,t,r){let i=[];for(let s of n.select({under:e,skipSegments:Ah,match:o=>o.endsWith(".rst")})){let o=vh(n.root,s);r.discovered++;try{let a=n.read(s),c=[{path:s,startLine:1,endLine:a.split(/\r?\n/).length,directive:"page"}],l=Qi(n,o,a,c),u=Cc(l),p=u.chunks.filter(d=>d.body.trim()!=="").map((d,m)=>({...d,ord:m}));if(p.length===0){let d=Oh(l);if(d.length>0){let m=u.title||Dc(s);p=[{heading:m,headingPath:[m],ord:0,body:`Contained documentation pages:
${d.map(h=>`- ${h}`).join(`
`)}`}]}}if(p.length===0){r.intentionallyExcluded.push({path:s,reason:"no-retrievable-content"});continue}i.push({path:s,url:Lh(s,t),title:u.title||Dc(s),area:Rh(s),labels:u.labels,chunks:p,origins:c}),r.indexed++}catch(a){r.errors.push({path:s,code:"rst-preprocess",message:a.message})}}return i}function $c(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},r=[...Pc(n,"doc",e,t),...Pc(n,"boards",e,t)];if(t.errors.length>0){let i=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${i}`)}return{pages:r,report:t}}import{existsSync as Dh,mkdtempSync as Ph,rmSync as $h,writeFileSync as qh}from"node:fs";import{tmpdir as Mh}from"node:os";import{join as Wn}from"node:path";import{spawnSync as Uh}from"node:child_process";var Hn=`#!/usr/bin/env python3
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
`;var qc=new Map,Fh={zephyr:"Kconfig",sysbuild:"share/sysbuild/Kconfig"};function es(n,e=[],t="zephyr"){let r=JSON.stringify([n,[...e].sort(),t]),i=qc.get(r);if(i)return i;let s=Wn(n,"scripts","kconfig","kconfiglib.py");if(!Dh(s))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let o=Ph(Wn(Mh(),"zephyr-ai-kconfig-")),a=Wn(o,"kconfig-export.py"),c=Wn(o,"generated");try{qh(a,Hn,{mode:384});let l=[a,"--zephyr",n,"--build-dir",c,"--root",Fh[t]];for(let m of e)l.push("--module",m);let u=Uh(Oe(n),l,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(u.status!==0){let m=u.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${m}`)}let p=JSON.parse(u.stdout),d={symbols:p.symbols,choices:p.choices,filesScanned:p.files.length,warnings:p.warnings};return qc.set(r,d),d}finally{$h(o,{recursive:!0,force:!0})}}var Fc=lr(Vn(),1);import{statSync as Bh}from"node:fs";import{join as Uc}from"node:path";var jh=64*1024,Kh=160*1024;function Bc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var Mc={"sample.yaml":"sample","testcase.yaml":"test"};function Xh(n,e,t){let r=[],i=[],s=Kh;for(let o of t){if(!Bc(o))continue;let a=Uc(n.root,e,o);try{if(Bh(a).size>jh){i.push({path:o,reason:"file-size-limit"});continue}let c=n.read(`${e}/${o}`);if(Buffer.byteLength(c)>s){i.push({path:o,reason:"sample-size-budget"});continue}s-=Buffer.byteLength(c),r.push({path:o,text:c})}catch(c){throw new Error(`Failed to capture sample file ${a}: ${c.message}`)}}return{contents:r,exclusions:i}}function zh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function Zn(n){return zh(n).filter(e=>typeof e=="string")}function Yh(n,e){let t=[],r=i=>{n.has(`${e}/${i}`)&&t.push(i)};for(let i of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])r(i);for(let i of["src","boards","snippets"])t.push(...n.select({under:`${e}/${i}`,match:s=>Bc(`${i}/${s}`)}).map(s=>s.slice(e.length+1)));return t}function jc(n){let e=[],t=new Set,r=n.root;for(let i of["samples","snippets","tests"])for(let s of n.select({under:i,match:o=>Object.hasOwn(Mc,o)})){let o=Uc(r,s),a=s.slice(s.lastIndexOf("/")+1),c=Mc[a],l=null;try{let v=(0,Fc.parse)(n.read(s),{logLevel:"silent"});if(!v||typeof v!="object"||Array.isArray(v))throw new Error("expected a YAML mapping");l=v}catch(v){throw new Error(`Failed to parse ${a} metadata ${s}: ${v.message}`)}let u=s.slice(0,s.lastIndexOf("/")),p=u;if(t.has(u))continue;t.add(u);let d=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},h=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},f=new Set,g=new Set,E=new Set,b=new Set,_=v=>{for(let C of Zn(v.tags))f.add(C);if(typeof v.tags=="string")for(let C of v.tags.split(/\s+/).filter(Boolean))f.add(C);for(let C of Zn(v.depends_on))g.add(C);for(let C of Zn(v.integration_platforms))E.add(C);for(let C of Zn(v.platform_allow))b.add(C)};_(h);for(let v of Object.values(m))!v||typeof v!="object"||_({...h,...v});let T=Yh(n,p),{contents:w,exclusions:k}=Xh(n,p,T),O=w.map(v=>v.path),N={path:u,kind:c,name:typeof d.name=="string"?d.name:u.split("/").pop(),tags:[...f].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...g].sort(),integrationPlatforms:[...E].sort(),platformAllow:[...b].sort(),files:O,contents:w,exclusions:k};typeof d.description=="string"&&(N.description=d.description),n.has(`${p}/README.rst`)&&(N.docPath=`${u}/README.rst`),e.push(N)}return e.sort(ie(i=>i.path)),e}var Yc=lr(Vn(),1);import{existsSync as zc,mkdtempSync as Gh,readFileSync as Jh,rmSync as Hh,writeFileSync as Wh}from"node:fs";import{tmpdir as Zh}from"node:os";import{join as er}from"node:path";import{spawnSync as Qh}from"node:child_process";var Qn=`#!/usr/bin/env python3
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
`;function eg(n){let e="",t=!1;for(let r=0;r<n.length;r++){let i=n[r];if(t){e+=i,i==="\\"?(e+=n[r+1]??"",r++):i==='"'&&(t=!1);continue}if(i==='"'){t=!0,e+=i;continue}if(i==="#"){for(;r<n.length&&n[r]!==`
`;)r++;e+=`
`;continue}e+=i}return e}function tg(n){let e=[],t="",r=!1,i=!1;for(let s=0;s<n.length;s++){let o=n[s];if(r){o==="\\"?(t+=n[s+1]??"",s++):o==='"'?r=!1:t+=o;continue}if(o==='"'){r=!0,i=!0;continue}if(/\s/.test(o)){i&&e.push(t),t="",i=!1;continue}t+=o,i=!0}return i&&e.push(t),e}function Kc(n){return n.replace(/\s+/g," ").trim()}function ng(n){return n.predicate}function Vc(n){let e=eg(n),t=[],r=[],i=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,s;for(;(s=i.exec(e))!==null;){let o=s[1].toLowerCase(),a=1,c=s.index+s[0].length,l=!1;for(;c<e.length&&a>0;c++){let d=e[c];if(l){d==="\\"?c++:d==='"'&&(l=!1);continue}d==='"'?l=!0:d==="("?a++:d===")"&&a--}if(a!==0)break;let u=e.slice(s.index+s[0].length,c-1);if(i.lastIndex=c,o==="if"){let d=Kc(u);r.push({taken:[d],predicate:d});continue}if(o==="elseif"||o==="else"){let d=r[r.length-1];if(!d)continue;let m=Kc(u),h=d.taken.map(f=>`NOT (${f})`).join(" AND ");d.predicate=o==="else"?h||null:h?`(${m}) AND ${h}`:m,o==="elseif"&&d.taken.push(m);continue}if(o==="endif"){r.pop();continue}let p=r.map(ng).filter(d=>!!d);t.push({name:o,args:tg(u),...p.length>0?{guard:p.join(" AND ")}:{}})}return t}function qe(n,e,t){let r=n.declaredIn.get(e);r?r.add(t):n.declaredIn.set(e,new Set([t]))}function Xc(n,e,t,r){let i=n.args.get(e)??[];for(let s of t)i.push({value:s,...r?{guard:r}:{},unresolved:s.includes("${")});n.args.set(e,i)}function Gc(n,e,t,r,i){if(r.has(e))return;r.add(e);let s=er(n,e);if(!zc(s))return;let o;try{o=Vc(Jh(s,"utf8"))}catch(a){i.push({path:e,code:"cmake-parse",message:a.message});return}for(let a of o){let[c,...l]=a.args;switch(a.name){case"include":{if(!c)break;let u=c.startsWith("${ZEPHYR_BASE}/")?c.slice(15):null;u&&Gc(n,u,t,r,i);break}case"board_finalize_runner_args":{if(!c)break;t.finalized.add(c),qe(t,c,e),Xc(t,c,l,a.guard);break}case"board_runner_args":{if(!c)break;qe(t,c,e),Xc(t,c,l,a.guard);break}case"board_set_flasher_ifnset":{c&&t.flashDefault===void 0&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger_ifnset":{c&&t.debugDefault===void 0&&(t.debugDefault=c,qe(t,c,e));break}case"board_set_flasher":{c&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger":{c&&(t.debugDefault=c,qe(t,c,e));break}default:break}}}function rg(n,e){let t=[];for(let r of n.select({under:"soc",match:i=>i==="CMakeLists.txt"||i.endsWith(".cmake")})){let i=n.read(r);if(!i.includes("board_finalize_runner_args"))continue;let s;try{s=Vc(i)}catch(o){e.push({path:r,code:"cmake-parse",message:o.message});continue}for(let o of s){if(o.name!=="board_finalize_runner_args")continue;let[a,...c]=o.args;a&&t.push({path:r,runner:a,args:c.map(l=>({value:l,...o.guard?{guard:o.guard}:{},unresolved:l.includes("${")}))})}}return t}function Jc(n){let e=Gh(er(Zh(),"zephyr-ai-runners-")),t=er(e,"runner-export.py");try{Wh(t,Qn,{mode:384});let r=Qh(zt(),[t,"--zephyr",n],{encoding:"utf8",maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let i=r.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`The west runner catalogue could not be exported:
${i}`)}return JSON.parse(r.stdout)}finally{Hh(e,{recursive:!0,force:!0})}}function Hc(n){let e="scripts/west-commands.yml";if(!n.has(e))return[];let t=(0,Yc.parse)(n.read(e),{logLevel:"silent"});if(!t||typeof t!="object")return[];let r=t["west-commands"];if(!Array.isArray(r))return[];let i=[];for(let s of r){if(!s||typeof s!="object")continue;let o=s,a=typeof o.file=="string"?o.file:"";for(let c of Array.isArray(o.commands)?o.commands:[]){if(!c||typeof c!="object")continue;let l=c;typeof l.name=="string"&&i.push({name:l.name,className:typeof l.class=="string"?l.class:"",file:a,...typeof l.help=="string"?{help:l.help}:{}})}}return i.sort(ie(s=>s.name))}function Wc(n,e){let t=n.root,r=[],i=rg(n,r),s=[],o=0;for(let u of e){let p=`${u.dir}/board.cmake`,d={finalized:new Set,args:new Map,declaredIn:new Map};zc(er(t,p))?Gc(t,p,d,new Set,r):o++;for(let h of i){if(!u.socDirs.some(g=>g&&h.path.startsWith(`${g}/`)))continue;d.finalized.add(h.runner),qe(d,h.runner,h.path);let f=d.args.get(h.runner)??[];f.push(...h.args),d.args.set(h.runner,f)}let m=new Set(d.finalized);d.flashDefault&&m.add(d.flashDefault),d.debugDefault&&m.add(d.debugDefault);for(let h of[...m].sort())s.push({board:u.name,runner:h,available:d.finalized.has(h),flashDefault:d.flashDefault===h,debugDefault:d.debugDefault===h,args:d.args.get(h)??[],declaredIn:[...d.declaredIn.get(h)??[]].sort()})}let a=new Set(s.map(u=>u.board)),c=e.filter(u=>!a.has(u.name)).length,l=[];return o>0&&l.push({path:"boards",code:"no-board-cmake",message:`${o} boards ship no board.cmake`}),c>0&&l.push({path:"boards",code:"no-runner-declared",message:`${c} boards declare no runner; report this as undeclared, never as unsupported`}),{boardRunners:s,report:{discovered:s.length,indexed:s.length,intentionallyExcluded:[],warnings:l,errors:r}}}import{createHash as ns}from"node:crypto";import{existsSync as nr,readFileSync as tr,realpathSync as $t,statSync as fg}from"node:fs";import{basename as Qc,dirname as pg,join as Me,relative as mg,resolve as hg}from"node:path";import{spawnSync as tl}from"node:child_process";import{createHash as ig}from"node:crypto";import{existsSync as sg,lstatSync as og,readFileSync as ag,readlinkSync as cg,realpathSync as lg}from"node:fs";import{join as dg}from"node:path";import{spawnSync as ug}from"node:child_process";function ts(n,e){let t=ug("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function Zc(n){let e=lg(n),t=ts(e,["rev-parse","HEAD"]);if(!t)return null;let r=ts(e,["diff","--binary","HEAD"])??"",i=(ts(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=dg(e,s);if(!sg(o))return{path:s,missing:!0};try{let a=og(o);return a.isSymbolicLink()?{path:s,symlink:cg(o)}:a.isFile()?{path:s,sha256:ig("sha256").update(ag(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(r||i.length),stateFingerprint:me({commit:t,diff:r,untracked:i})}}function gg(n,e){let t=tl("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function yg(n){let e=tr(Me(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",r=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),i=t("EXTRAVERSION");return i?`${r}-${i}`:r}function bg(n){let e=hg(n);for(;;){if(nr(Me(e,".west","config")))return e;let t=pg(e);if(t===e)return;e=t}}function Eg(n){if(!n)return;let e=tl("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return ns("sha256").update(e.stdout).digest("hex");let t="",r="west.yml";try{let o=tr(Me(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",r=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??r}catch{}let s=[...t?[Me(n,t,r)]:[],Me(n,"west.yml"),Me(n,"west.yaml")].find(nr);return s?ns("sha256").update(tr(s)).digest("hex"):void 0}function el(n){let e=$t(n),t=Zc(e);if(t)return{name:Qc(e),...t};let r=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(i=>Me(e,i)).filter(nr).map(i=>{let s=fg(i);return{path:mg(e,i),bytes:s.size,sha256:ns("sha256").update(tr(i)).digest("hex")}});return{name:Qc(e),markers:r}}function nl(n){let e=$t(n.zephyrRoot),t=n.projectRoot&&nr(n.projectRoot)?$t(n.projectRoot):void 0,r=gg(e,["rev-parse","HEAD"]);if(!r)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let i=bg(t??e),s=Eg(i),o=n.modules.map(d=>el(d)),a=me(o),c=el(e),l=String(c.stateFingerprint??me(c)),u=n.pinnedCommit===r&&c.dirty===!1?"pinned-upstream":i?"west-workspace":"explicit-tree",p={descriptorVersion:_s,schemaVersion:jt,builderVersion:Ts,sourceKind:u,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:yg(e),zephyrCommit:r,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:$t(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:$t(n.buildDirectory)}:{},...n.producer?{producer:n.producer}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index covering the application and sysbuild namespaces; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},west:{complete:!!n.westComplete,note:n.westComplete?void 0:"The west package was not importable when this index was built, so runners that import it \u2014 openocd among them \u2014 carry no capabilities."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...p,createdAt:new Date().toISOString(),contextFingerprint:Ss(p)}}import{createHash as rl}from"node:crypto";var _g=new Set(["built_at","index_descriptor","context_fingerprint","source_path","ingest_version","content_hash","table_hashes","input_hash"]);function Tg(n){return/_fts(_|$)/.test(n)||n.startsWith("sqlite_")}function rs(n){let r=n.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map(s=>s.name).filter(s=>!Tg(s)),i={};for(let s of r){let o=rl("sha256");if(s==="meta"){let a=n.prepare("SELECT key, value FROM meta ORDER BY key").all();for(let c of a)_g.has(c.key)||o.update(`${c.key}\0${c.value}`)}else for(let a of n.prepare(`SELECT * FROM "${s}" ORDER BY rowid`).all()){for(let c of Object.values(a))o.update(c===null?"\0null":String(c)),o.update("\0");o.update("")}i[s]=o.digest("hex")}return i}function il(n){let e=rl("sha256");for(let[t,r]of Object.entries(rs(n)))e.update(`${t}\0${r}`);return e.digest("hex")}import{createHash as ol}from"node:crypto";import{existsSync as Ng,readFileSync as is,readdirSync as Sg,statSync as wg}from"node:fs";import{join as rr,relative as vg,sep as kg}from"node:path";import{spawnSync as Ag}from"node:child_process";function ss(n){return ol("sha1").update(`blob ${n.length}\0`).update(n).digest("hex")}function al(n,e){let t=Ag("git",["-C",n,...e],{encoding:"utf8",maxBuffer:536870912,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout:null}var Lg=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function Rg(n){let e=[],t=[n];for(;t.length>0;){let r=t.pop();for(let i of Sg(r,{withFileTypes:!0})){let s=rr(r,i.name);i.isDirectory()?Lg.has(i.name)||t.push(s):i.isFile()&&e.push(vg(n,s).split(kg).join("/"))}}return e.sort()}function Og(n){let e=al(n,["ls-files","-s","-z"]);if(e===null)return null;let t=[];for(let r of e.split("\0")){if(r==="")continue;let i=r.indexOf("	");if(i<0)continue;let[s,o]=r.slice(0,i).split(/\s+/);s!=="100644"&&s!=="100755"||t.push({path:r.slice(i+1),hash:o})}return t}var et=class n{root;addressed;entries;#e;constructor(e,t,r){this.root=e,this.addressed=t,this.entries=r,this.#e=new Map(r.map(i=>[i.path,i.hash]))}static forRoot(e){let t=Og(e);if(t===null){let c=Rg(e).map(l=>({path:l,hash:ss(is(rr(e,l)))}));return new n(e,!1,c)}let r=al(e,["status","--porcelain","-z","--untracked-files=all"])??"",i=new Set,s=r.split("\0");for(let c=0;c<s.length;c++){let l=s[c];if(l.length<4)continue;let u=l.slice(3);l[0]==="R"&&c++,i.add(u)}let o=new Map(t.map(c=>[c.path,c]));for(let c of i){if(c===""||c===sl)continue;let l=rr(e,c);if(!Ng(l)||!wg(l).isFile()){o.delete(c);continue}o.set(c,{path:c,hash:ss(is(l))})}o.delete(sl);let a=[...o.values()].sort((c,l)=>c.path<l.path?-1:c.path>l.path?1:0);return new n(e,!0,a)}fingerprint(){let e=ol("sha256");e.update(this.addressed?"addressed":"unaddressed");for(let t of this.entries)e.update(`${t.path}\0${t.hash}`);return e.digest("hex")}select(e){let t=e.under?`${e.under.replace(/\/+$/,"")}/`:"",r=(e.skip??[]).map(s=>`${s.replace(/\/+$/,"")}/`),i=[];for(let s of this.entries){if(t&&!s.path.startsWith(t)||r.some(c=>s.path.startsWith(c)))continue;let o=s.path.split("/");if(e.skipSegments&&o.slice(0,-1).some(c=>e.skipSegments.has(c)))continue;let a=o[o.length-1];e.match(a)&&i.push(s.path)}return i}has(e){return this.#e.has(e)}readBinary(e){let t=this.#e.get(e);if(t===void 0)throw new Error(`${e} is not a declared input of ${this.root}`);let r=is(rr(this.root,e)),i=ss(r);if(i!==t)throw new Error(`${e} changed while the index was being built (declared ${t}, read ${i})`);return r}read(e){return this.readBinary(e).toString("utf8")}},sl=".zephyr-ai-managed.json";import{spawnSync as Ig}from"node:child_process";var xg=["PATH","HOME","USERPROFILE","SYSTEMROOT","TMPDIR","TEMP","TMP","PYTHON_EXECUTABLE","ZEPHYR_BASE","ZEPHYR_AI_PROJECT_ROOT","ZEPHYR_AI_PLUGIN_DATA","CLAUDE_PROJECT_DIR","CLAUDE_PLUGIN_DATA"],Cg={LC_ALL:"C",LANG:"C",LC_COLLATE:"C",TZ:"UTC",PYTHONHASHSEED:"0",PYTHONDONTWRITEBYTECODE:"1",PYTHONNOUSERSITE:"1",GIT_CONFIG_NOSYSTEM:"1",SOURCE_DATE_EPOCH:"0"},cl="ZEPHYR_AI_HERMETIC";function os(n){let e={...Cg,[cl]:"1"};for(let t of xg){let r=n[t];r!==void 0&&(e[t]=r)}return e}function ll(n){let e=new Set(["PATH","HOME","USERPROFILE","SYSTEMROOT","TMPDIR","TEMP","TMP"]);return Object.fromEntries(Object.entries(n).filter(([t])=>!e.has(t)).sort(([t],[r])=>t<r?-1:t>r?1:0))}function dl(n=process.env){return n[cl]==="1"}function ul(n){let e=Ig(process.execPath,n,{env:os(process.env),stdio:"inherit"});e.error&&(process.stderr.write(`zephyr-ai-ingest: could not re-exec hermetically: ${e.error.message}
`),process.exit(1)),process.exit(e.status??1)}import{spawnSync as Pg}from"node:child_process";import{existsSync as as,mkdirSync as $g,mkdtempSync as qg,renameSync as Mg,rmSync as Ug,writeFileSync as Fg}from"node:fs";import{dirname as fl,join as qt,resolve as Bg}from"node:path";var H={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var pl=H,ml=".zephyr-ai-managed.json";function ir(n,e){return Pg("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function jg(n){if(!as(qt(n,".git"))||!as(qt(n,"VERSION")))return!1;let e=ir(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==H.commit)return!1;let t=ir(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(r=>r.endsWith(` ${ml}`))}function hl(n,e){let t=Bg(n,"sources",`zephyr-${H.version}-${H.commit.slice(0,12)}`);if(jg(t))return e(`Using pinned Zephyr ${H.version} checkout at ${t}`),t;if(as(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${H.version}.`);$g(fl(t),{recursive:!0});let r=qg(qt(fl(t),".zephyr-ai-fetch-")),i=qt(r,"zephyr");try{e(`Cloning pinned Zephyr ${H.version}; this requires network access and may take several minutes.`);let s=ir(["clone","--depth","1","--branch",H.tag,"--single-branch",H.repository,i]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=ir(["rev-parse","HEAD"],i);if(o.status!==0||o.stdout.trim()!==H.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${H.commit}.`);return Fg(qt(i,ml),`${JSON.stringify({owner:"zephyr-ai",repository:H.repository,tag:H.tag,commit:H.commit},null,2)}
`,{flag:"wx"}),Mg(i,t),e(`Pinned Zephyr ${H.version} is ready at ${t}`),t}finally{Ug(r,{recursive:!0,force:!0})}}var gl={name:"@zephyr-ai/ingest",version:"0.7.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function Zg(n){let e=de(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??G(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requireWest:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let r=0;r<n.length;r++){let i=n[r];switch(i){case"--zephyr":t.zephyr=de(n[++r]);break;case"--out":t.out=de(n[++r]);break;case"--project-root":t.projectRoot=de(n[++r]);break;case"--plugin-data":t.pluginData=de(n[++r]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++r];break;case"--application":t.applicationRoot=de(n[++r]);break;case"--build-dir":t.buildDirectory=de(n[++r]);break;case"--api-xml":t.apiXml=de(n[++r]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-west":t.requireWest=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(de(n[++r]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${i}`)}}return t.zephyr=de(t.zephyr),t}function Qg(){for(let n of[G(import.meta.dirname,"..","..","..","zephyr.lock.json"),G(import.meta.dirname,"..","..","zephyr.lock.json"),G(import.meta.dirname,"..","zephyr.lock.json")])try{return JSON.parse(_l(n,"utf8"))}catch{}return{}}function cs(n){return n==null?null:JSON.stringify(n)}function ey(n){return me({tree:{fingerprint:n.tree.fingerprint(),addressed:n.tree.addressed},modules:n.modules.map(e=>({fingerprint:e.fingerprint(),addressed:e.addressed})),apiXml:n.apiXml?{fingerprint:n.apiXml.fingerprint(),addressed:n.apiXml.addressed}:null,adapters:n.adapters.map(e=>Hg("sha256").update(e).digest("hex")),lock:n.lock,producer:n.producer,environment:n.environment})}function ty(n){let e=G(n,"scripts","requirements-base.txt");return Ut(e)?Is(_l(e,"utf8")):[]}function ny(n,e){let t=(i,s)=>{let o=Wg(i,s,{encoding:"utf8",timeout:5e3});if(o.status===0)return`${o.stdout}${o.stderr}`.trim().split(`
`)[0]??void 0},r;try{r=t(Oe(n),["--version"])}catch{}return{node:process.version,sqlite:String(new Nl(":memory:").prepare("SELECT sqlite_version() AS v").get()?.v??""),...r?{python:r}:{},...e?{doxygen:t("doxygen",["--version"])??"unknown"}:{},collator:new Intl.Collator().resolvedOptions().locale}}function ds(n){let e=Vg(n,"r");try{zg(e)}finally{Xg(e)}}function El(n){try{ds(n)}catch{}}function ry(n,e){let t=Gg(n,{withFileTypes:!0}).filter(i=>i.isDirectory()&&/^[a-f0-9]{64}$/.test(i.name)).flatMap(i=>{let s=G(n,i.name),o=G(s,"zephyr.db");if(!Ut(o))return[];let a=G(s,"last-used");return[{fingerprint:i.name,directory:s,usedAt:Tl(Ut(a)?a:o).mtimeMs}]}).sort((i,s)=>s.usedAt-i.usedAt),r=new Set([e,...t.filter(i=>i.fingerprint!==e).slice(0,4).map(i=>i.fingerprint)]);for(let i of t)r.has(i.fingerprint)||ls(i.directory,{recursive:!0,force:!0})}function iy(){let n=Zg(process.argv.slice(2)),e=P=>{n.quiet||process.stderr.write(`${P}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=hl(n.pluginData,e)}if(!Ut(G(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(Oe(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let P=Ds(n.zephyr);P&&(n.apiXml=P,e(`Using auto-detected Doxygen XML from ${P}`))}let t=n.fetchPinned?pl:Qg();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let r=Jc(n.zephyr);if(n.requireWest&&!r.complete)throw new Error("The west runner catalogue is incomplete: the selected interpreter cannot import the west package, which openocd needs, and hundreds of boards select openocd. An index built here would omit it without saying so. Install the tree's requirements (python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.");let i=ny(n.zephyr,n.apiXml),s=nl({zephyrRoot:n.zephyr,westComplete:r.complete,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml,producer:i}),o=s.zephyrVersion;if(n.requirePinned&&(!t.commit||s.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${s.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let a=`https://docs.zephyrproject.org/${o}/`,c,l=n.out;if(!l&&n.pluginData)if(s.projectRoot){let P=G(n.pluginData,"indexes","projects",Ns(s.projectRoot));l=G(P,s.contextFingerprint,"zephyr.db"),c=G(P,"active.json")}else l=G(n.pluginData,"indexes","defaults",s.zephyrCommit,String(s.schemaVersion),"zephyr.db");l??=G(de(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${o} from ${n.zephyr}`);let u=Date.now(),p=Date.now(),d=et.forRoot(n.zephyr);e(`  manifest  ${d.entries.length} files, ${d.addressed?"content-addressed":"UNADDRESSED"} (${Date.now()-p} ms)`);let m=Date.now(),{pages:h,report:f}=$c(d,a),g=h.reduce((P,te)=>P+te.chunks.length,0);e(`  docs      ${h.length} pages, ${g} sections (${Date.now()-m} ms)`);let E=Date.now(),b=new Map([["zephyr",es(n.zephyr,n.modules,"zephyr")],["sysbuild",es(n.zephyr,[],"sysbuild")]]),_=b.get("zephyr");e(`  kconfig   ${_.symbols.length} symbols from ${_.filesScanned} files, ${b.get("sysbuild").symbols.length} sysbuild (${Date.now()-E} ms)`);let T=Date.now(),w=[G(n.zephyr,"dts","bindings"),...n.modules.map(P=>G(P,"dts","bindings")).filter(Ut)],{bindings:k,fragments:O,report:N}=Ms(w),v=P=>P.properties.length+P.children.reduce((te,sr)=>te+v(sr),0),C=k.reduce((P,te)=>P+v(te),0);e(`  bindings  ${k.length} compatibles, ${C} properties, ${O} fragments (${Date.now()-T} ms)`);let z=Date.now(),D=Oc(d),L=Ic(d),Y=D.reduce((P,te)=>P+te.targets.length,0);e(`  boards    ${D.length} boards, ${Y} targets, ${L.length} SoCs (${Date.now()-z} ms)`);let oe=Date.now(),Sl=new Map(L.map(P=>[P.name,P.dir])),wl=Hc(d),tt=Wc(d,D.map(P=>({name:P.name,dir:P.dir,socDirs:[...new Set(P.socs.map(te=>Sl.get(te.name)).filter(te=>!!te))]}))),ne={runners:r.runners,commands:wl,boardRunners:tt.boardRunners};e(`  west      ${ne.runners.length} runners, ${ne.commands.length} commands, ${ne.boardRunners.length} board bindings${r.complete?"":", incomplete"} (${Date.now()-oe} ms)`);let vl=Date.now(),ye=jc(d);e(`  samples   ${ye.length} (${Date.now()-vl} ms)`);let kl=Date.now(),be=Ps(d,n.apiXml),Al=n.apiXml?et.forRoot(n.apiXml):null,us=ey({tree:d,modules:n.modules.map(P=>et.forRoot(P)),apiXml:Al,adapters:[Hn,Vt,Kt,Qn],lock:t,producer:i,environment:ll(os(process.env))});e(`  api       ${be.symbols.length} symbols, ${be.groups.length} groups, ${be.mode} (${Date.now()-kl} ms)`),Yg(Mt(l),{recursive:!0});let nt=G(Mt(l),`.${bl()}.zephyr.db.tmp`),A,fs=!1;try{A=new Nl(nt),A.exec(vs);let P=Date.now();A.exec("BEGIN");let te=A.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),sr=A.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),Ll=A.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let y of h){let R=te.run(y.path,y.url,y.title,y.area,JSON.stringify(y.labels)),U=Number(R.lastInsertRowid);for(let M of y.origins)Ll.run(U,M.path,M.startLine,M.endLine,M.directive);for(let M of y.chunks)sr.run(U,M.anchor??null,M.heading,M.headingPath.join(" > "),M.ord,y.title,M.body)}for(let[y,R]of b){let U=A.prepare(`INSERT INTO kconfig
         (name, scope, type, prompt, help, defaults, depends, selects, implies, ranges,
          defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),M=A.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind, scope) VALUES (?, ?, ?, ?)"),Ue=new Map;for(let I of R.symbols){let Ee=I.definitions.flatMap($=>$.defaults.map(F=>({value:F.value.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),j=I.definitions.map($=>$.condition.display).filter(($,F,Zl)=>$!=="y"&&Zl.indexOf($)===F),re=I.definitions.flatMap($=>$.selects.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),J=I.definitions.flatMap($=>$.implies.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),cr=I.definitions.flatMap($=>$.ranges.map(F=>({low:F.low.display,high:F.high.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),Fe=I.definitions.find($=>$.prompt)?.prompt??"",Hl=I.definitions.find($=>$.menuPath.length>0)?.menuPath.join(" > ")??"",Wl=U.run(I.name,y,I.type??null,Fe,I.help??"",JSON.stringify(Ee),JSON.stringify(j),JSON.stringify(re),JSON.stringify(J),JSON.stringify(cr),JSON.stringify(I.definitions.map($=>({file:$.file,line:$.line}))),Hl,I.choice?1:0,I.choice??null,I.definitions.length,I.hasPrompt?1:0);Ue.set(I.name,Number(Wl.lastInsertRowid));for(let $ of re)M.run(I.name,$.value,"select",y);for(let $ of J)M.run(I.name,$.value,"imply",y);let bs=$=>[...$.kind==="symbol"&&$.value?[$.value]:[],...($.children??[]).flatMap(bs)];for(let $ of I.definitions)for(let F of bs($.condition))M.run(I.name,F,"depends",y)}let ar=A.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),pe=new Map,W=I=>{if(!I)return null;let Ee=Z(I),j=pe.get(Ee);if(j!==void 0)return j;let re=I.children??[],J=Number(ar.run(I.kind,I.value??null,I.display,W(re[0]??null),W(re[1]??null)).lastInsertRowid);return pe.set(Ee,J),J},X=A.prepare(`INSERT INTO kconfig_definition
         (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
          is_menuconfig, is_configdefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),rt=A.prepare(`INSERT INTO kconfig_default
         (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),Ft=A.prepare(`INSERT INTO kconfig_relation
         (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?, ?)`),Vl=A.prepare(`INSERT INTO kconfig_range
         (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?)`);for(let I of R.symbols){let Ee=Ue.get(I.name);for(let j of I.definitions){let re=Number(X.run(Ee,j.file,j.line,j.prompt,JSON.stringify(j.menuPath),W(j.condition),W(j.promptCondition),j.isMenuconfig?1:0,j.isConfigDefault?1:0).lastInsertRowid);for(let J of j.defaults)rt.run(re,W(J.value),W(J.condition),J.order);for(let[J,cr]of[["select",j.selects],["imply",j.implies]])for(let Fe of cr)Ft.run(re,J,Fe.target,Ue.get(Fe.target)??null,W(Fe.condition),Fe.order);for(let J of j.ranges)Vl.run(re,W(J.low),W(J.high),W(J.condition),J.order)}}let Gl=A.prepare("INSERT INTO kconfig_choice (stable_id, scope, name, type, definitions) VALUES (?, ?, ?, ?, ?)"),Jl=A.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let I of R.choices){let Ee=Number(Gl.run(I.id,y,I.name,I.type,JSON.stringify(I.definitions)).lastInsertRowid);for(let j of new Set(I.members)){let re=Ue.get(j);re!==void 0&&Jl.run(Ee,re)}}}let Rl=A.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Ol=A.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Il=A.prepare("INSERT INTO text_pool (text) VALUES (?)"),ps=new Map,xl=y=>{if(!y)return null;let R=ps.get(y);if(R!==void 0)return R;let U=Number(Il.run(y).lastInsertRowid);return ps.set(y,U),U};for(let y of k){let R=y.compatible,U=(pe,W=0,X="")=>[...pe.properties.map(rt=>({level:W,childPath:X,property:rt})),...pe.children.flatMap((rt,Ft)=>U(rt,W+1,X?`${X}/${Ft}`:String(Ft)))],M=U(y),Ue=Rl.run(R,y.path,y.description??"",y.bus===void 0||y.bus===null?null:typeof y.bus=="string"?y.bus:JSON.stringify(y.bus),y.onBus??null,JSON.stringify(y.cells),JSON.stringify(y.includes),M.map(({property:pe})=>pe.name).join(" "),M.length,R.includes(",")?R.split(",")[0]:null),ar=Number(Ue.lastInsertRowid);for(let{level:pe,childPath:W,property:X}of M)Ol.run(ar,pe,X.name,X.type??null,X.required?1:0,xl(X.description),cs(X.default),cs(X.enum),cs(X.const),X.deprecated?1:0,X.specifierSpace??null,X.inheritedFrom??null,JSON.stringify(X.provenance??{}),JSON.stringify(X.constraints??{}),W)}let Cl=A.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let y of D){let R=y.socs.map(U=>U.name);Cl.run(y.name,y.fullName??"",y.vendor??"",y.dir,y.arch??null,y.ram??null,y.flash??null,JSON.stringify(y.socs),R.join(" "),JSON.stringify(y.targets),y.targets.map(U=>U.identifier).join(" "),JSON.stringify(y.revisions),y.defaultRevision??null,JSON.stringify(y.supported),y.supported.join(" "),y.docPath??null)}let Dl=A.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let y of L)Dl.run(y.name,y.series??null,y.family??null,y.vendor??null,y.dir,JSON.stringify(y.cpuclusters));let Pl=A.prepare("INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)");for(let y of ne.runners)Pl.run(y.name,y.module,y.description??null,Z(y.capabilities),JSON.stringify(y.capabilities.commands??[]));let $l=A.prepare("INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)");for(let y of ne.commands)$l.run(y.name,y.className,y.file,y.help??null);let ql=A.prepare(`INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`);for(let y of ne.boardRunners)ql.run(y.board,y.runner,y.available?1:0,y.flashDefault?1:0,y.debugDefault?1:0,JSON.stringify(y.args),JSON.stringify(y.declaredIn));let Ml=A.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Ul=A.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),ms=A.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let y of ye){let R=Ml.run(y.path,y.kind,y.name,y.description??"",JSON.stringify(y.tags),y.tags.join(" "),JSON.stringify(y.scenarios),JSON.stringify(y.dependsOn),JSON.stringify(y.integrationPlatforms),JSON.stringify(y.platformAllow),JSON.stringify(y.files),y.docPath??null),U=Number(R.lastInsertRowid);for(let M of y.contents)Ul.run(U,M.path,M.text);for(let M of y.integrationPlatforms)ms.run(U,M,"integration");for(let M of y.platformAllow)ms.run(U,M,"allowlist")}let Fl=A.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let y of be.symbols)Fl.run(y.name,y.kind,y.signature,y.brief??"",y.detail??"",JSON.stringify(y.params),JSON.stringify(y.returns),JSON.stringify(y.retvals),y.group??null,y.since??null,y.deprecated?1:0,y.header,y.line,y.doxygenId??null,y.compoundId??null,y.docAnchor??null,y.parentSymbol??null);let Bl=A.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let y of be.groups)Bl.run(y.id,y.title,y.parent??null,y.header);let jl=A.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),Kl={schema_version:String(ws),zephyr_version:o,zephyr_commit:s.zephyrCommit,zephyr_tag:s.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:s.sourceKind,index_descriptor:Z(s),context_fingerprint:s.contextFingerprint,module_fingerprint:s.moduleFingerprint,doc_base_url:a,built_at:new Date().toISOString(),ingest_version:gl.version,count_docs:String(h.length),count_doc_chunks:String(g),report_docs:Z(f),count_kconfig:String(_.symbols.length),count_kconfig_sysbuild:String(b.get("sysbuild").symbols.length),report_kconfig:Z({discovered:[...b.values()].reduce((y,R)=>y+R.symbols.length+R.choices.length,0),indexed:[...b.values()].reduce((y,R)=>y+R.symbols.length+R.choices.length,0),intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts cover both Kconfig namespaces: the application tree and sysbuild."},...[...b].map(([y,R])=>({code:"source-files",message:`Kconfiglib evaluated ${R.filesScanned} source files for the ${y} namespace.`})),...[...b].flatMap(([y,R])=>R.warnings.map(U=>({code:"kconfiglib",message:`${y}: ${U}`})))],errors:[]}),count_bindings:String(k.length),count_dt_properties:String(C),report_bindings:Z(N),count_boards:String(D.length),count_board_targets:String(Y),count_socs:String(L.length),report_boards:Z({discovered:D.length+Y+L.length,indexed:D.length+Y+L.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),python_requirements:Z(ty(n.zephyr)),count_runners:String(ne.runners.length),count_west_commands:String(ne.commands.length),count_board_runners:String(ne.boardRunners.length),report_west:Z({discovered:r.report.discovered+ne.commands.length+tt.report.discovered,indexed:ne.runners.length+ne.commands.length+tt.report.indexed,intentionallyExcluded:r.report.intentionallyExcluded,warnings:[...r.report.warnings,...tt.report.warnings,{code:"report-units",message:"Counts include runner classes, west commands, and board-runner pairings."}],errors:[...r.report.errors,...tt.report.errors]}),count_samples:String(ye.length),report_samples:Z({discovered:ye.length+ye.reduce((y,R)=>y+R.contents.length+R.exclusions.length,0),indexed:ye.length+ye.reduce((y,R)=>y+R.contents.length,0),intentionallyExcluded:ye.flatMap(y=>y.exclusions.map(R=>({path:`${y.path}/${R.path}`,reason:R.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(be.symbols.length),api_ingest_mode:be.mode,report_api:Z(be.report)};for(let[y,R]of Object.entries(Kl))jl.run(y,R);A.exec("COMMIT"),e(`  written   (${Date.now()-P} ms)`);let Xl=rs(A),hs=il(A),or=A.prepare("INSERT INTO meta (key, value) VALUES (?, ?)");or.run("table_hashes",Z(Xl)),or.run("input_hash",us),or.run("content_hash",hs),e(`  inputs    ${us.slice(0,16)}\u2026`),e(`  content   ${hs.slice(0,16)}\u2026`);let zl=Date.now();A.exec(ks),e(`  indexed   full-text (${Date.now()-zl} ms)`),A.exec("VACUUM"),A.exec("PRAGMA optimize");let gs=String(A.prepare("PRAGMA integrity_check").get()?.integrity_check??""),ys=A.prepare("PRAGMA foreign_key_check").all();if(gs!=="ok"||ys.length>0)throw new Error(`Index verification failed (integrity=${gs}, foreign-key violations=${ys.length}).`);for(let[y,R]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let U=Number(A.prepare(`SELECT COUNT(*) AS n FROM ${y}`).get()?.n),M=Number(A.prepare(`SELECT COUNT(*) AS n FROM ${R}`).get()?.n);if(U!==M)throw new Error(`Index verification failed: ${y} has ${U} rows; ${R} has ${M}.`)}if(A.close(),A=void 0,ds(nt),yl(nt,l),El(Mt(l)),fs=!0,c){let y=`${c}.${bl()}.tmp`;Jg(y,`${Z({contextFingerprint:s.contextFingerprint,relativePath:`${s.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),ds(y),yl(y,c),El(Mt(c)),ry(Mt(c),s.contextFingerprint)}let Yl=Tl(l).size;e(`Done in ${((Date.now()-u)/1e3).toFixed(1)} s -> ${l} (${(Yl/1024/1024).toFixed(1)} MiB)`)}finally{try{A?.close()}catch{}fs||(ls(nt,{force:!0}),ls(`${nt}-journal`,{force:!0}))}}dl()||ul(process.argv.slice(1));try{iy()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
