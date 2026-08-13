#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var Kl=Object.create;var ps=Object.defineProperty;var jl=Object.getOwnPropertyDescriptor;var Xl=Object.getOwnPropertyNames;var zl=Object.getPrototypeOf,Yl=Object.prototype.hasOwnProperty;var zt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var w=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Vl=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of Xl(e))!Yl.call(n,i)&&i!==t&&ps(n,i,{get:()=>e[i],enumerable:!(r=jl(e,i))||r.enumerable});return n};var or=(n,e,t)=>(t=n!=null?Kl(zl(n)):{},Vl(e||!n||!n.__esModule?ps(t,"default",{value:n,enumerable:!0}):t,n));var I=w(z=>{"use strict";var ur=Symbol.for("yaml.alias"),$s=Symbol.for("yaml.document"),Jt=Symbol.for("yaml.map"),qs=Symbol.for("yaml.pair"),fr=Symbol.for("yaml.scalar"),Ht=Symbol.for("yaml.seq"),he=Symbol.for("yaml.node.type"),Cd=n=>!!n&&typeof n=="object"&&n[he]===ur,Dd=n=>!!n&&typeof n=="object"&&n[he]===$s,Pd=n=>!!n&&typeof n=="object"&&n[he]===Jt,$d=n=>!!n&&typeof n=="object"&&n[he]===qs,Us=n=>!!n&&typeof n=="object"&&n[he]===fr,qd=n=>!!n&&typeof n=="object"&&n[he]===Ht;function Ms(n){if(n&&typeof n=="object")switch(n[he]){case Jt:case Ht:return!0}return!1}function Ud(n){if(n&&typeof n=="object")switch(n[he]){case ur:case Jt:case fr:case Ht:return!0}return!1}var Md=n=>(Us(n)||Ms(n))&&!!n.anchor;z.ALIAS=ur;z.DOC=$s;z.MAP=Jt;z.NODE_TYPE=he;z.PAIR=qs;z.SCALAR=fr;z.SEQ=Ht;z.hasAnchor=Md;z.isAlias=Cd;z.isCollection=Ms;z.isDocument=Dd;z.isMap=Pd;z.isNode=Ud;z.isPair=$d;z.isScalar=Us;z.isSeq=qd});var lt=w(pr=>{"use strict";var j=I(),ee=Symbol("break visit"),Fs=Symbol("skip children"),fe=Symbol("remove node");function Wt(n,e){let t=Bs(e);j.isDocument(n)?Je(null,n.contents,t,Object.freeze([n]))===fe&&(n.contents=null):Je(null,n,t,Object.freeze([]))}Wt.BREAK=ee;Wt.SKIP=Fs;Wt.REMOVE=fe;function Je(n,e,t,r){let i=Ks(n,e,t,r);if(j.isNode(i)||j.isPair(i))return js(n,r,i),Je(n,i,t,r);if(typeof i!="symbol"){if(j.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=Je(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===ee)return ee;o===fe&&(e.items.splice(s,1),s-=1)}}}else if(j.isPair(e)){r=Object.freeze(r.concat(e));let s=Je("key",e.key,t,r);if(s===ee)return ee;s===fe&&(e.key=null);let o=Je("value",e.value,t,r);if(o===ee)return ee;o===fe&&(e.value=null)}}return i}async function Zt(n,e){let t=Bs(e);j.isDocument(n)?await He(null,n.contents,t,Object.freeze([n]))===fe&&(n.contents=null):await He(null,n,t,Object.freeze([]))}Zt.BREAK=ee;Zt.SKIP=Fs;Zt.REMOVE=fe;async function He(n,e,t,r){let i=await Ks(n,e,t,r);if(j.isNode(i)||j.isPair(i))return js(n,r,i),He(n,i,t,r);if(typeof i!="symbol"){if(j.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=await He(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===ee)return ee;o===fe&&(e.items.splice(s,1),s-=1)}}}else if(j.isPair(e)){r=Object.freeze(r.concat(e));let s=await He("key",e.key,t,r);if(s===ee)return ee;s===fe&&(e.key=null);let o=await He("value",e.value,t,r);if(o===ee)return ee;o===fe&&(e.value=null)}}return i}function Bs(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function Ks(n,e,t,r){if(typeof t=="function")return t(n,e,r);if(j.isMap(e))return t.Map?.(n,e,r);if(j.isSeq(e))return t.Seq?.(n,e,r);if(j.isPair(e))return t.Pair?.(n,e,r);if(j.isScalar(e))return t.Scalar?.(n,e,r);if(j.isAlias(e))return t.Alias?.(n,e,r)}function js(n,e,t){let r=e[e.length-1];if(j.isCollection(r))r.items[n]=t;else if(j.isPair(r))n==="key"?r.key=t:r.value=t;else if(j.isDocument(r))r.contents=t;else{let i=j.isAlias(r)?"alias":"scalar";throw new Error(`Cannot replace node with ${i} parent`)}}pr.visit=Wt;pr.visitAsync=Zt});var mr=w(zs=>{"use strict";var Xs=I(),Fd=lt(),Bd={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Kd=n=>n.replace(/[!,[\]{}]/g,e=>Bd[e]),dt=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let r=e.trim().split(/[ \t]+/),i=r.shift();switch(i){case"%TAG":{if(r.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),r.length<2))return!1;let[s,o]=r;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,r.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=r;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${i}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,r,i]=e.match(/^(.*!)([^!]*)$/s);i||t(`The ${e} tag has no suffix`);let s=this.tags[r];if(s)try{return s+decodeURIComponent(i)}catch(o){return t(String(o)),null}return r==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,r]of Object.entries(this.tags))if(e.startsWith(r))return t+Kd(e.substring(r.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],r=Object.entries(this.tags),i;if(e&&r.length>0&&Xs.isNode(e.contents)){let s={};Fd.visit(e.contents,(o,a)=>{Xs.isNode(a)&&a.tag&&(s[a.tag]=!0)}),i=Object.keys(s)}else i=[];for(let[s,o]of r)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||i.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};dt.defaultYaml={explicit:!1,version:"1.2"};dt.defaultTags={"!!":"tag:yaml.org,2002:"};zs.Directives=dt});var Qt=w(ut=>{"use strict";var Ys=I(),jd=lt();function Xd(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function Vs(n){let e=new Set;return jd.visit(n,{Value(t,r){r.anchor&&e.add(r.anchor)}}),e}function Gs(n,e){for(let t=1;;++t){let r=`${n}${t}`;if(!e.has(r))return r}}function zd(n,e){let t=[],r=new Map,i=null;return{onAnchor:s=>{t.push(s),i??(i=Vs(n));let o=Gs(e,i);return i.add(o),o},setAnchors:()=>{for(let s of t){let o=r.get(s);if(typeof o=="object"&&o.anchor&&(Ys.isScalar(o.node)||Ys.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:r}}ut.anchorIsValid=Xd;ut.anchorNames=Vs;ut.createNodeAnchors=zd;ut.findNewAnchor=Gs});var hr=w(Js=>{"use strict";function ft(n,e,t,r){if(r&&typeof r=="object")if(Array.isArray(r))for(let i=0,s=r.length;i<s;++i){let o=r[i],a=ft(n,r,String(i),o);a===void 0?delete r[i]:a!==o&&(r[i]=a)}else if(r instanceof Map)for(let i of Array.from(r.keys())){let s=r.get(i),o=ft(n,r,i,s);o===void 0?r.delete(i):o!==s&&r.set(i,o)}else if(r instanceof Set)for(let i of Array.from(r)){let s=ft(n,r,i,i);s===void 0?r.delete(i):s!==i&&(r.delete(i),r.add(s))}else for(let[i,s]of Object.entries(r)){let o=ft(n,r,i,s);o===void 0?delete r[i]:o!==s&&(r[i]=o)}return n.call(e,t,r)}Js.applyReviver=ft});var Ne=w(Ws=>{"use strict";var Yd=I();function Hs(n,e,t){if(Array.isArray(n))return n.map((r,i)=>Hs(r,String(i),t));if(n&&typeof n.toJSON=="function"){if(!t||!Yd.hasAnchor(n))return n.toJSON(e,t);let r={aliasCount:0,count:1,res:void 0};t.anchors.set(n,r),t.onCreate=s=>{r.res=s,delete t.onCreate};let i=n.toJSON(e,t);return t.onCreate&&t.onCreate(i),i}return typeof n=="bigint"&&!t?.keep?Number(n):n}Ws.toJS=Hs});var en=w(Qs=>{"use strict";var Vd=hr(),Zs=I(),Gd=Ne(),gr=class{constructor(e){Object.defineProperty(this,Zs.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:r,onAnchor:i,reviver:s}={}){if(!Zs.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},a=Gd.toJS(this,"",o);if(typeof i=="function")for(let{count:c,res:l}of o.anchors.values())i(l,c);return typeof s=="function"?Vd.applyReviver(s,{"":a},"",a):a}};Qs.NodeBase=gr});var pt=w(eo=>{"use strict";var Jd=Qt(),Hd=lt(),We=I(),Wd=en(),Zd=Ne(),yr=class extends Wd.NodeBase{constructor(e){super(We.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let r;t?.aliasResolveCache?r=t.aliasResolveCache:(r=[],Hd.visit(e,{Node:(s,o)=>{(We.isAlias(o)||We.hasAnchor(o))&&r.push(o)}}),t&&(t.aliasResolveCache=r));let i;for(let s of r){if(s===this)break;s.anchor===this.source&&(i=s)}return i}toJSON(e,t){if(!t)return{source:this.source};let{anchors:r,doc:i,maxAliasCount:s}=t,o=this.resolve(i,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=r.get(o);if(a||(Zd.toJS(o,null,t),a=r.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=tn(i,o,r)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,r){let i=`*${this.source}`;if(e){if(Jd.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${i} `}return i}};function tn(n,e,t){if(We.isAlias(e)){let r=e.resolve(n),i=t&&r&&t.get(r);return i?i.count*i.aliasCount:0}else if(We.isCollection(e)){let r=0;for(let i of e.items){let s=tn(n,i,t);s>r&&(r=s)}return r}else if(We.isPair(e)){let r=tn(n,e.key,t),i=tn(n,e.value,t);return Math.max(r,i)}return 1}eo.Alias=yr});var B=w(br=>{"use strict";var Qd=I(),eu=en(),tu=Ne(),nu=n=>!n||typeof n!="function"&&typeof n!="object",we=class extends eu.NodeBase{constructor(e){super(Qd.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:tu.toJS(this.value,e,t)}toString(){return String(this.value)}};we.BLOCK_FOLDED="BLOCK_FOLDED";we.BLOCK_LITERAL="BLOCK_LITERAL";we.PLAIN="PLAIN";we.QUOTE_DOUBLE="QUOTE_DOUBLE";we.QUOTE_SINGLE="QUOTE_SINGLE";br.Scalar=we;br.isScalarValue=nu});var mt=w(no=>{"use strict";var ru=pt(),$e=I(),to=B(),iu="tag:yaml.org,2002:";function su(n,e,t){if(e){let r=t.filter(s=>s.tag===e),i=r.find(s=>!s.format)??r[0];if(!i)throw new Error(`Tag ${e} not found`);return i}return t.find(r=>r.identify?.(n)&&!r.format)}function ou(n,e,t){if($e.isDocument(n)&&(n=n.contents),$e.isNode(n))return n;if($e.isPair(n)){let u=t.schema[$e.MAP].createNode?.(t.schema,null,t);return u.items.push(n),u}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:r,onAnchor:i,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(r&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=i(n)),new ru.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=iu+e.slice(2));let l=su(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let u=new to.Scalar(n);return c&&(c.node=u),u}l=n instanceof Map?o[$e.MAP]:Symbol.iterator in Object(n)?o[$e.SEQ]:o[$e.MAP]}s&&(s(l),delete t.onTagObj);let p=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new to.Scalar(n);return e?p.tag=e:l.default||(p.tag=l.tag),c&&(c.node=p),p}no.createNode=ou});var rn=w(nn=>{"use strict";var au=mt(),pe=I(),cu=en();function Er(n,e,t){let r=t;for(let i=e.length-1;i>=0;--i){let s=e[i];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=r,r=o}else r=new Map([[s,r]])}return au.createNode(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var ro=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,_r=class extends cu.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(r=>pe.isNode(r)||pe.isPair(r)?r.clone(e):r),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(ro(e))this.add(t);else{let[r,...i]=e,s=this.get(r,!0);if(pe.isCollection(s))s.addIn(i,t);else if(s===void 0&&this.schema)this.set(r,Er(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}deleteIn(e){let[t,...r]=e;if(r.length===0)return this.delete(t);let i=this.get(t,!0);if(pe.isCollection(i))return i.deleteIn(r);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${r}`)}getIn(e,t){let[r,...i]=e,s=this.get(r,!0);return i.length===0?!t&&pe.isScalar(s)?s.value:s:pe.isCollection(s)?s.getIn(i,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!pe.isPair(t))return!1;let r=t.value;return r==null||e&&pe.isScalar(r)&&r.value==null&&!r.commentBefore&&!r.comment&&!r.tag})}hasIn(e){let[t,...r]=e;if(r.length===0)return this.has(t);let i=this.get(t,!0);return pe.isCollection(i)?i.hasIn(r):!1}setIn(e,t){let[r,...i]=e;if(i.length===0)this.set(r,t);else{let s=this.get(r,!0);if(pe.isCollection(s))s.setIn(i,t);else if(s===void 0&&this.schema)this.set(r,Er(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}};nn.Collection=_r;nn.collectionFromPath=Er;nn.isEmptyPath=ro});var ht=w(sn=>{"use strict";var lu=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function Tr(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var du=(n,e,t)=>n.endsWith(`
`)?Tr(t,e):t.includes(`
`)?`
`+Tr(t,e):(n.endsWith(" ")?"":" ")+t;sn.indentComment=Tr;sn.lineComment=du;sn.stringifyComment=lu});var so=w(gt=>{"use strict";var uu="flow",Nr="block",on="quoted";function fu(n,e,t="flow",{indentAtStart:r,lineWidth:i=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!i||i<0)return n;i<s&&(s=0);let c=Math.max(1+s,1+i-e.length);if(n.length<=c)return n;let l=[],p={},u=i-e.length;typeof r=="number"&&(r>i-Math.max(2,s)?l.push(0):u=i-r);let d,m,y=!1,f=-1,h=-1,E=-1;t===Nr&&(f=io(n,f,e.length),f!==-1&&(u=f+c));for(let _;_=n[f+=1];){if(t===on&&_==="\\"){switch(h=f,n[f+1]){case"x":f+=3;break;case"u":f+=5;break;case"U":f+=9;break;default:f+=1}E=f}if(_===`
`)t===Nr&&(f=io(n,f,e.length)),u=f+e.length+c,d=void 0;else{if(_===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let T=n[f+1];T&&T!==" "&&T!==`
`&&T!=="	"&&(d=f)}if(f>=u)if(d)l.push(d),u=d+c,d=void 0;else if(t===on){for(;m===" "||m==="	";)m=_,_=n[f+=1],y=!0;let T=f>E+1?f-2:h-1;if(p[T])return n;l.push(T),p[T]=!0,u=T+c,d=void 0}else y=!0}m=_}if(y&&a&&a(),l.length===0)return n;o&&o();let b=n.slice(0,l[0]);for(let _=0;_<l.length;++_){let T=l[_],v=l[_+1]||n.length;T===0?b=`
${e}${n.slice(0,v)}`:(t===on&&p[T]&&(b+=`${n[T]}\\`),b+=`
${e}${n.slice(T+1,v)}`)}return b}function io(n,e,t){let r=e,i=e+1,s=n[i];for(;s===" "||s==="	";)if(e<i+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);r=e,i=e+1,s=n[i]}return r}gt.FOLD_BLOCK=Nr;gt.FOLD_FLOW=uu;gt.FOLD_QUOTED=on;gt.foldFlowLines=fu});var bt=w(oo=>{"use strict";var ae=B(),Se=so(),cn=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),ln=n=>/^(%|---|\.\.\.)/m.test(n);function pu(n,e,t){if(!e||e<0)return!1;let r=e-t,i=n.length;if(i<=r)return!1;for(let s=0,o=0;s<i;++s)if(n[s]===`
`){if(s-o>r)return!0;if(o=s+1,i-o<=r)return!1}return!0}function yt(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:r}=e,i=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(ln(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let p=t.substr(c+2,4);switch(p){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:p.substr(0,2)==="00"?o+="\\x"+p.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(r||t[c+2]==='"'||t.length<i)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,r?o:Se.foldFlowLines(o,s,Se.FOLD_QUOTED,cn(e,!1))}function wr(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return yt(n,e);let t=e.indent||(ln(n)?"  ":""),r="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?r:Se.foldFlowLines(r,t,Se.FOLD_FLOW,cn(e,!1))}function Ze(n,e){let{singleQuote:t}=e.options,r;if(t===!1)r=yt;else{let i=n.includes('"'),s=n.includes("'");i&&!s?r=wr:s&&!i?r=yt:r=t?wr:yt}return r(n,e)}var Sr;try{Sr=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{Sr=/\n+(?!\n|$)/g}function an({comment:n,type:e,value:t},r,i,s){let{blockQuote:o,commentString:a,lineWidth:c}=r.options;if(!o||/\n[\t ]+$/.test(t))return Ze(t,r);let l=r.indent||(r.forceBlockIndent||ln(t)?"  ":""),p=o==="literal"?!0:o==="folded"||e===ae.Scalar.BLOCK_FOLDED?!1:e===ae.Scalar.BLOCK_LITERAL?!0:!pu(t,c,l.length);if(!t)return p?`|
`:`>
`;let u,d;for(d=t.length;d>0;--d){let v=t[d-1];if(v!==`
`&&v!=="	"&&v!==" ")break}let m=t.substring(d),y=m.indexOf(`
`);y===-1?u="-":t===m||y!==m.length-1?(u="+",s&&s()):u="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(Sr,`$&${l}`));let f=!1,h,E=-1;for(h=0;h<t.length;++h){let v=t[h];if(v===" ")f=!0;else if(v===`
`)E=h;else break}let b=t.substring(0,E<h?E+1:h);b&&(t=t.substring(b.length),b=b.replace(/\n+/g,`$&${l}`));let T=(f?l?"2":"1":"")+u;if(n&&(T+=" "+a(n.replace(/ ?[\r\n]+/g," ")),i&&i()),!p){let v=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),k=!1,A=cn(r,!0);o!=="folded"&&e!==ae.Scalar.BLOCK_FOLDED&&(A.onOverflow=()=>{k=!0});let N=Se.foldFlowLines(`${b}${v}${m}`,l,Se.FOLD_BLOCK,A);if(!k)return`>${T}
${l}${N}`}return t=t.replace(/\n+/g,`$&${l}`),`|${T}
${l}${b}${t}${m}`}function mu(n,e,t,r){let{type:i,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:p}=e;if(a&&s.includes(`
`)||p&&/[[\]{},]/.test(s))return Ze(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||p||!s.includes(`
`)?Ze(s,e):an(n,e,t,r);if(!a&&!p&&i!==ae.Scalar.PLAIN&&s.includes(`
`))return an(n,e,t,r);if(ln(s)){if(c==="")return e.forceBlockIndent=!0,an(n,e,t,r);if(a&&c===l)return Ze(s,e)}let u=s.replace(/\n+/g,`$&
${c}`);if(o){let d=f=>f.default&&f.tag!=="tag:yaml.org,2002:str"&&f.test?.test(u),{compat:m,tags:y}=e.doc.schema;if(y.some(d)||m?.some(d))return Ze(s,e)}return a?u:Se.foldFlowLines(u,c,Se.FOLD_FLOW,cn(e,!1))}function hu(n,e,t,r){let{implicitKey:i,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==ae.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=ae.Scalar.QUOTE_DOUBLE);let c=p=>{switch(p){case ae.Scalar.BLOCK_FOLDED:case ae.Scalar.BLOCK_LITERAL:return i||s?Ze(o.value,e):an(o,e,t,r);case ae.Scalar.QUOTE_DOUBLE:return yt(o.value,e);case ae.Scalar.QUOTE_SINGLE:return wr(o.value,e);case ae.Scalar.PLAIN:return mu(o,e,t,r);default:return null}},l=c(a);if(l===null){let{defaultKeyType:p,defaultStringType:u}=e.options,d=i&&p||u;if(l=c(d),l===null)throw new Error(`Unsupported default string type ${d}`)}return l}oo.stringifyString=hu});var Et=w(vr=>{"use strict";var gu=Qt(),ve=I(),yu=ht(),bu=bt();function Eu(n,e){let t=Object.assign({blockQuote:!0,commentString:yu.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),r;switch(t.collectionStyle){case"block":r=!1;break;case"flow":r=!0;break;default:r=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:r,options:t}}function _u(n,e){if(e.tag){let i=n.filter(s=>s.tag===e.tag);if(i.length>0)return i.find(s=>s.format===e.format)??i[0]}let t,r;if(ve.isScalar(e)){r=e.value;let i=n.filter(s=>s.identify?.(r));if(i.length>1){let s=i.filter(o=>o.test);s.length>0&&(i=s)}t=i.find(s=>s.format===e.format)??i.find(s=>!s.format)}else r=e,t=n.find(i=>i.nodeClass&&r instanceof i.nodeClass);if(!t){let i=r?.constructor?.name??(r===null?"null":typeof r);throw new Error(`Tag not resolved for ${i} value`)}return t}function Tu(n,e,{anchors:t,doc:r}){if(!r.directives)return"";let i=[],s=(ve.isScalar(n)||ve.isCollection(n))&&n.anchor;s&&gu.anchorIsValid(s)&&(t.add(s),i.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&i.push(r.directives.tagString(o)),i.join(" ")}function Nu(n,e,t,r){if(ve.isPair(n))return n.toString(e,t,r);if(ve.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let i,s=ve.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>i=c});i??(i=_u(e.doc.schema.tags,s));let o=Tu(s,i,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof i.stringify=="function"?i.stringify(s,e,t,r):ve.isScalar(s)?bu.stringifyString(s,e,t,r):s.toString(e,t,r);return o?ve.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}vr.createStringifyContext=Eu;vr.stringify=Nu});var uo=w(lo=>{"use strict";var ge=I(),ao=B(),co=Et(),_t=ht();function wu({key:n,value:e},t,r,i){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:p,simpleKeys:u}}=t,d=ge.isNode(n)&&n.comment||null;if(u){if(d)throw new Error("With simple keys, key nodes cannot have comments");if(ge.isCollection(n)||!ge.isNode(n)&&typeof n=="object"){let A="With simple keys, collection cannot be used as a key value";throw new Error(A)}}let m=!u&&(!n||d&&e==null&&!t.inFlow||ge.isCollection(n)||(ge.isScalar(n)?n.type===ao.Scalar.BLOCK_FOLDED||n.type===ao.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(u||!s),indent:a+c});let y=!1,f=!1,h=co.stringify(n,t,()=>y=!0,()=>f=!0);if(!m&&!t.inFlow&&h.length>1024){if(u)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return y&&r&&r(),h===""?"?":m?`? ${h}`:h}else if(s&&!u||e==null&&m)return h=`? ${h}`,d&&!y?h+=_t.lineComment(h,t.indent,l(d)):f&&i&&i(),h;y&&(d=null),m?(d&&(h+=_t.lineComment(h,t.indent,l(d))),h=`? ${h}
${a}:`):(h=`${h}:`,d&&(h+=_t.lineComment(h,t.indent,l(d))));let E,b,_;ge.isNode(e)?(E=!!e.spaceBefore,b=e.commentBefore,_=e.comment):(E=!1,b=null,_=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!d&&ge.isScalar(e)&&(t.indentAtStart=h.length+1),f=!1,!p&&c.length>=2&&!t.inFlow&&!m&&ge.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let T=!1,v=co.stringify(e,t,()=>T=!0,()=>f=!0),k=" ";if(d||E||b){if(k=E?`
`:"",b){let A=l(b);k+=`
${_t.indentComment(A,t.indent)}`}v===""&&!t.inFlow?k===`
`&&_&&(k=`

`):k+=`
${t.indent}`}else if(!m&&ge.isCollection(e)){let A=v[0],N=v.indexOf(`
`),S=N!==-1,P=t.inFlow??e.flow??e.items.length===0;if(S||!P){let W=!1;if(S&&(A==="&"||A==="!")){let U=v.indexOf(" ");A==="&"&&U!==-1&&U<N&&v[U+1]==="!"&&(U=v.indexOf(" ",U+1)),(U===-1||N<U)&&(W=!0)}W||(k=`
${t.indent}`)}}else(v===""||v[0]===`
`)&&(k="");return h+=k+v,t.inFlow?T&&r&&r():_&&!T?h+=_t.lineComment(h,t.indent,l(_)):f&&i&&i(),h}lo.stringifyPair=wu});var Ar=w(kr=>{"use strict";var fo=zt("process");function Su(n,...e){n==="debug"&&console.log(...e)}function vu(n,e){(n==="debug"||n==="warn")&&(typeof fo.emitWarning=="function"?fo.emitWarning(e):console.warn(e))}kr.debug=Su;kr.warn=vu});var mn=w(pn=>{"use strict";var fn=I(),po=B(),dn="<<",un={identify:n=>n===dn||typeof n=="symbol"&&n.description===dn,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new po.Scalar(Symbol(dn)),{addToJSMap:mo}),stringify:()=>dn},ku=(n,e)=>(un.identify(e)||fn.isScalar(e)&&(!e.type||e.type===po.Scalar.PLAIN)&&un.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===un.tag&&t.default);function mo(n,e,t){let r=ho(n,t);if(fn.isSeq(r))for(let i of r.items)Lr(n,e,i);else if(Array.isArray(r))for(let i of r)Lr(n,e,i);else Lr(n,e,r)}function Lr(n,e,t){let r=ho(n,t);if(!fn.isMap(r))throw new Error("Merge sources must be maps or map aliases");let i=r.toJSON(null,n,Map);for(let[s,o]of i)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function ho(n,e){return n&&fn.isAlias(e)?e.resolve(n.doc,n):e}pn.addMergeToJSMap=mo;pn.isMergeKey=ku;pn.merge=un});var Rr=w(bo=>{"use strict";var Au=Ar(),go=mn(),Lu=Et(),yo=I(),Or=Ne();function Ou(n,e,{key:t,value:r}){if(yo.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,r);else if(go.isMergeKey(n,t))go.addMergeToJSMap(n,e,r);else{let i=Or.toJS(t,"",n);if(e instanceof Map)e.set(i,Or.toJS(r,i,n));else if(e instanceof Set)e.add(i);else{let s=Ru(t,i,n),o=Or.toJS(r,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function Ru(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(yo.isNode(n)&&t?.doc){let r=Lu.createStringifyContext(t.doc,{});r.anchors=new Set;for(let s of t.anchors.keys())r.anchors.add(s.anchor);r.inFlow=!0,r.inStringifyKey=!0;let i=n.toString(r);if(!t.mapKeyWarned){let s=JSON.stringify(i);s.length>40&&(s=s.substring(0,36)+'..."'),Au.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return i}return JSON.stringify(e)}bo.addPairToJSMap=Ou});var ke=w(xr=>{"use strict";var Eo=mt(),xu=uo(),Iu=Rr(),hn=I();function Cu(n,e,t){let r=Eo.createNode(n,void 0,t),i=Eo.createNode(e,void 0,t);return new gn(r,i)}var gn=class n{constructor(e,t=null){Object.defineProperty(this,hn.NODE_TYPE,{value:hn.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:r}=this;return hn.isNode(t)&&(t=t.clone(e)),hn.isNode(r)&&(r=r.clone(e)),new n(t,r)}toJSON(e,t){let r=t?.mapAsMap?new Map:{};return Iu.addPairToJSMap(t,r,this)}toString(e,t,r){return e?.doc?xu.stringifyPair(this,e,t,r):JSON.stringify(this)}};xr.Pair=gn;xr.createPair=Cu});var Ir=w(To=>{"use strict";var qe=I(),_o=Et(),yn=ht();function Du(n,e,t){return(e.inFlow??n.flow?$u:Pu)(n,e,t)}function Pu({comment:n,items:e},t,{blockItemPrefix:r,flowChars:i,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,p=Object.assign({},t,{indent:s,type:null}),u=!1,d=[];for(let y=0;y<e.length;++y){let f=e[y],h=null;if(qe.isNode(f))!u&&f.spaceBefore&&d.push(""),bn(t,d,f.commentBefore,u),f.comment&&(h=f.comment);else if(qe.isPair(f)){let b=qe.isNode(f.key)?f.key:null;b&&(!u&&b.spaceBefore&&d.push(""),bn(t,d,b.commentBefore,u))}u=!1;let E=_o.stringify(f,p,()=>h=null,()=>u=!0);h&&(E+=yn.lineComment(E,s,l(h))),u&&h&&(u=!1),d.push(r+E)}let m;if(d.length===0)m=i.start+i.end;else{m=d[0];for(let y=1;y<d.length;++y){let f=d[y];m+=f?`
${c}${f}`:`
`}}return n?(m+=`
`+yn.indentComment(l(n),c),a&&a()):u&&o&&o(),m}function $u({items:n},e,{flowChars:t,itemIndent:r}){let{indent:i,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;r+=s;let c=Object.assign({},e,{indent:r,inFlow:!0,type:null}),l=!1,p=0,u=[];for(let y=0;y<n.length;++y){let f=n[y],h=null;if(qe.isNode(f))f.spaceBefore&&u.push(""),bn(e,u,f.commentBefore,!1),f.comment&&(h=f.comment);else if(qe.isPair(f)){let b=qe.isNode(f.key)?f.key:null;b&&(b.spaceBefore&&u.push(""),bn(e,u,b.commentBefore,!1),b.comment&&(l=!0));let _=qe.isNode(f.value)?f.value:null;_?(_.comment&&(h=_.comment),_.commentBefore&&(l=!0)):f.value==null&&b?.comment&&(h=b.comment)}h&&(l=!0);let E=_o.stringify(f,c,()=>h=null);l||(l=u.length>p||E.includes(`
`)),y<n.length-1?E+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=u.reduce((b,_)=>b+_.length+2,2)+(E.length+2)>e.options.lineWidth)),l&&(E+=",")),h&&(E+=yn.lineComment(E,r,a(h))),u.push(E),p=u.length}let{start:d,end:m}=t;if(u.length===0)return d+m;if(!l){let y=u.reduce((f,h)=>f+h.length+2,2);l=e.options.lineWidth>0&&y>e.options.lineWidth}if(l){let y=d;for(let f of u)y+=f?`
${s}${i}${f}`:`
`;return`${y}
${i}${m}`}else return`${d}${o}${u.join(" ")}${o}${m}`}function bn({indent:n,options:{commentString:e}},t,r,i){if(r&&i&&(r=r.replace(/^\n+/,"")),r){let s=yn.indentComment(e(r),n);t.push(s.trimStart())}}To.stringifyCollection=Du});var Le=w(Dr=>{"use strict";var qu=Ir(),Uu=Rr(),Mu=rn(),Ae=I(),En=ke(),Fu=B();function Tt(n,e){let t=Ae.isScalar(e)?e.value:e;for(let r of n)if(Ae.isPair(r)&&(r.key===e||r.key===t||Ae.isScalar(r.key)&&r.key.value===t))return r}var Cr=class extends Mu.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(Ae.MAP,e),this.items=[]}static from(e,t,r){let{keepUndefined:i,replacer:s}=r,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||i)&&o.items.push(En.createPair(c,l,r))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let r;Ae.isPair(e)?r=e:!e||typeof e!="object"||!("key"in e)?r=new En.Pair(e,e?.value):r=new En.Pair(e.key,e.value);let i=Tt(this.items,r.key),s=this.schema?.sortMapEntries;if(i){if(!t)throw new Error(`Key ${r.key} already set`);Ae.isScalar(i.value)&&Fu.isScalarValue(r.value)?i.value.value=r.value:i.value=r.value}else if(s){let o=this.items.findIndex(a=>s(r,a)<0);o===-1?this.items.push(r):this.items.splice(o,0,r)}else this.items.push(r)}delete(e){let t=Tt(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let i=Tt(this.items,e)?.value;return(!t&&Ae.isScalar(i)?i.value:i)??void 0}has(e){return!!Tt(this.items,e)}set(e,t){this.add(new En.Pair(e,t),!0)}toJSON(e,t,r){let i=r?new r:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(i);for(let s of this.items)Uu.addPairToJSMap(t,i,s);return i}toString(e,t,r){if(!e)return JSON.stringify(this);for(let i of this.items)if(!Ae.isPair(i))throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),qu.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:r,onComment:t})}};Dr.YAMLMap=Cr;Dr.findPair=Tt});var Qe=w(wo=>{"use strict";var Bu=I(),No=Le(),Ku={collection:"map",default:!0,nodeClass:No.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return Bu.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>No.YAMLMap.from(n,e,t)};wo.map=Ku});var Oe=w(So=>{"use strict";var ju=mt(),Xu=Ir(),zu=rn(),Tn=I(),Yu=B(),Vu=Ne(),Pr=class extends zu.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(Tn.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=_n(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let r=_n(e);if(typeof r!="number")return;let i=this.items[r];return!t&&Tn.isScalar(i)?i.value:i}has(e){let t=_n(e);return typeof t=="number"&&t<this.items.length}set(e,t){let r=_n(e);if(typeof r!="number")throw new Error(`Expected a valid index, not ${e}.`);let i=this.items[r];Tn.isScalar(i)&&Yu.isScalarValue(t)?i.value=t:this.items[r]=t}toJSON(e,t){let r=[];t?.onCreate&&t.onCreate(r);let i=0;for(let s of this.items)r.push(Vu.toJS(s,String(i++),t));return r}toString(e,t,r){return e?Xu.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:r,onComment:t}):JSON.stringify(this)}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof i=="function"){let c=t instanceof Set?a:String(o++);a=i.call(t,c,a)}s.items.push(ju.createNode(a,void 0,r))}}return s}};function _n(n){let e=Tn.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}So.YAMLSeq=Pr});var et=w(ko=>{"use strict";var Gu=I(),vo=Oe(),Ju={collection:"seq",default:!0,nodeClass:vo.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Gu.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>vo.YAMLSeq.from(n,e,t)};ko.seq=Ju});var Nt=w(Ao=>{"use strict";var Hu=bt(),Wu={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,r){return e=Object.assign({actualString:!0},e),Hu.stringifyString(n,e,t,r)}};Ao.string=Wu});var Nn=w(Ro=>{"use strict";var Lo=B(),Oo={identify:n=>n==null,createNode:()=>new Lo.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new Lo.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&Oo.test.test(n)?n:e.options.nullStr};Ro.nullTag=Oo});var $r=w(Io=>{"use strict";var Zu=B(),xo={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new Zu.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&xo.test.test(n)){let r=n[0]==="t"||n[0]==="T";if(e===r)return n}return e?t.options.trueStr:t.options.falseStr}};Io.boolTag=xo});var tt=w(Co=>{"use strict";function Qu({format:n,minFractionDigits:e,tag:t,value:r}){if(typeof r=="bigint")return String(r);let i=typeof r=="number"?r:Number(r);if(!isFinite(i))return isNaN(i)?".nan":i<0?"-.inf":".inf";let s=Object.is(r,-0)?"-0":JSON.stringify(r);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}Co.stringifyNumber=Qu});var Ur=w(wn=>{"use strict";var ef=B(),qr=tt(),tf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:qr.stringifyNumber},nf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():qr.stringifyNumber(n)}},rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new ef.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:qr.stringifyNumber};wn.float=rf;wn.floatExp=nf;wn.floatNaN=tf});var Fr=w(vn=>{"use strict";var Do=tt(),Sn=n=>typeof n=="bigint"||Number.isInteger(n),Mr=(n,e,t,{intAsBigInt:r})=>r?BigInt(n):parseInt(n.substring(e),t);function Po(n,e,t){let{value:r}=n;return Sn(r)&&r>=0?t+r.toString(e):Do.stringifyNumber(n)}var sf={identify:n=>Sn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>Mr(n,2,8,t),stringify:n=>Po(n,8,"0o")},of={identify:Sn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>Mr(n,0,10,t),stringify:Do.stringifyNumber},af={identify:n=>Sn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>Mr(n,2,16,t),stringify:n=>Po(n,16,"0x")};vn.int=of;vn.intHex=af;vn.intOct=sf});var qo=w($o=>{"use strict";var cf=Qe(),lf=Nn(),df=et(),uf=Nt(),ff=$r(),Br=Ur(),Kr=Fr(),pf=[cf.map,df.seq,uf.string,lf.nullTag,ff.boolTag,Kr.intOct,Kr.int,Kr.intHex,Br.floatNaN,Br.floatExp,Br.float];$o.schema=pf});var Fo=w(Mo=>{"use strict";var mf=B(),hf=Qe(),gf=et();function Uo(n){return typeof n=="bigint"||Number.isInteger(n)}var kn=({value:n})=>JSON.stringify(n),yf=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:kn},{identify:n=>n==null,createNode:()=>new mf.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:kn},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:kn},{identify:Uo,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Uo(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:kn}],bf={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},Ef=[hf.map,gf.seq].concat(yf,bf);Mo.schema=Ef});var Xr=w(Bo=>{"use strict";var wt=zt("buffer"),jr=B(),_f=bt(),Tf={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof wt.Buffer=="function")return wt.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),r=new Uint8Array(t.length);for(let i=0;i<t.length;++i)r[i]=t.charCodeAt(i);return r}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},r,i,s){if(!t)return"";let o=t,a;if(typeof wt.Buffer=="function")a=o instanceof wt.Buffer?o.toString("base64"):wt.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=jr.Scalar.BLOCK_LITERAL),e!==jr.Scalar.QUOTE_DOUBLE){let c=Math.max(r.options.lineWidth-r.indent.length,r.options.minContentWidth),l=Math.ceil(a.length/c),p=new Array(l);for(let u=0,d=0;u<l;++u,d+=c)p[u]=a.substr(d,c);a=p.join(e===jr.Scalar.BLOCK_LITERAL?`
`:" ")}return _f.stringifyString({comment:n,type:e,value:a},r,i,s)}};Bo.binary=Tf});var On=w(Ln=>{"use strict";var An=I(),zr=ke(),Nf=B(),wf=Oe();function Ko(n,e){if(An.isSeq(n))for(let t=0;t<n.items.length;++t){let r=n.items[t];if(!An.isPair(r)){if(An.isMap(r)){r.items.length>1&&e("Each pair must have its own sequence indicator");let i=r.items[0]||new zr.Pair(new Nf.Scalar(null));if(r.commentBefore&&(i.key.commentBefore=i.key.commentBefore?`${r.commentBefore}
${i.key.commentBefore}`:r.commentBefore),r.comment){let s=i.value??i.key;s.comment=s.comment?`${r.comment}
${s.comment}`:r.comment}r=i}n.items[t]=An.isPair(r)?r:new zr.Pair(r)}}else e("Expected a sequence for this tag");return n}function jo(n,e,t){let{replacer:r}=t,i=new wf.YAMLSeq(n);i.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof r=="function"&&(o=r.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;i.items.push(zr.createPair(a,c,t))}return i}var Sf={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:Ko,createNode:jo};Ln.createPairs=jo;Ln.pairs=Sf;Ln.resolvePairs=Ko});var Gr=w(Vr=>{"use strict";var Xo=I(),Yr=Ne(),St=Le(),vf=Oe(),zo=On(),Ue=class n extends vf.YAMLSeq{constructor(){super(),this.add=St.YAMLMap.prototype.add.bind(this),this.delete=St.YAMLMap.prototype.delete.bind(this),this.get=St.YAMLMap.prototype.get.bind(this),this.has=St.YAMLMap.prototype.has.bind(this),this.set=St.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let r=new Map;t?.onCreate&&t.onCreate(r);for(let i of this.items){let s,o;if(Xo.isPair(i)?(s=Yr.toJS(i.key,"",t),o=Yr.toJS(i.value,s,t)):s=Yr.toJS(i,"",t),r.has(s))throw new Error("Ordered maps must not include duplicate keys");r.set(s,o)}return r}static from(e,t,r){let i=zo.createPairs(e,t,r),s=new this;return s.items=i.items,s}};Ue.tag="tag:yaml.org,2002:omap";var kf={collection:"seq",identify:n=>n instanceof Map,nodeClass:Ue,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=zo.resolvePairs(n,e),r=[];for(let{key:i}of t.items)Xo.isScalar(i)&&(r.includes(i.value)?e(`Ordered maps must not include duplicate keys: ${i.value}`):r.push(i.value));return Object.assign(new Ue,t)},createNode:(n,e,t)=>Ue.from(n,e,t)};Vr.YAMLOMap=Ue;Vr.omap=kf});var Ho=w(Jr=>{"use strict";var Yo=B();function Vo({value:n,source:e},t){return e&&(n?Go:Jo).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var Go={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new Yo.Scalar(!0),stringify:Vo},Jo={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new Yo.Scalar(!1),stringify:Vo};Jr.falseTag=Jo;Jr.trueTag=Go});var Wo=w(Rn=>{"use strict";var Af=B(),Hr=tt(),Lf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Hr.stringifyNumber},Of={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Hr.stringifyNumber(n)}},Rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new Af.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let r=n.substring(t+1).replace(/_/g,"");r[r.length-1]==="0"&&(e.minFractionDigits=r.length)}return e},stringify:Hr.stringifyNumber};Rn.float=Rf;Rn.floatExp=Of;Rn.floatNaN=Lf});var Qo=w(kt=>{"use strict";var Zo=tt(),vt=n=>typeof n=="bigint"||Number.isInteger(n);function xn(n,e,t,{intAsBigInt:r}){let i=n[0];if((i==="-"||i==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),r){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return i==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return i==="-"?-1*s:s}function Wr(n,e,t){let{value:r}=n;if(vt(r)){let i=r.toString(e);return r<0?"-"+t+i.substr(1):t+i}return Zo.stringifyNumber(n)}var xf={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>xn(n,2,2,t),stringify:n=>Wr(n,2,"0b")},If={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>xn(n,1,8,t),stringify:n=>Wr(n,8,"0")},Cf={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>xn(n,0,10,t),stringify:Zo.stringifyNumber},Df={identify:vt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>xn(n,2,16,t),stringify:n=>Wr(n,16,"0x")};kt.int=Cf;kt.intBin=xf;kt.intHex=Df;kt.intOct=If});var Qr=w(Zr=>{"use strict";var Dn=I(),In=ke(),Cn=Le(),Me=class n extends Cn.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;Dn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new In.Pair(e.key,null):t=new In.Pair(e,null),Cn.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let r=Cn.findPair(this.items,e);return!t&&Dn.isPair(r)?Dn.isScalar(r.key)?r.key.value:r.key:r}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let r=Cn.findPair(this.items,e);r&&!t?this.items.splice(this.items.indexOf(r),1):!r&&t&&this.items.push(new In.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,r){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,r);throw new Error("Set items must all have null values")}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof i=="function"&&(o=i.call(t,o,o)),s.items.push(In.createPair(o,null,r));return s}};Me.tag="tag:yaml.org,2002:set";var Pf={collection:"map",identify:n=>n instanceof Set,nodeClass:Me,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>Me.from(n,e,t),resolve(n,e){if(Dn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new Me,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};Zr.YAMLSet=Me;Zr.set=Pf});var ti=w(Pn=>{"use strict";var $f=tt();function ei(n,e){let t=n[0],r=t==="-"||t==="+"?n.substring(1):n,i=o=>e?BigInt(o):Number(o),s=r.replace(/_/g,"").split(":").reduce((o,a)=>o*i(60)+i(a),i(0));return t==="-"?i(-1)*s:s}function ea(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return $f.stringifyNumber(n);let r="";e<0&&(r="-",e*=t(-1));let i=t(60),s=[e%i];return e<60?s.unshift(0):(e=(e-s[0])/i,s.unshift(e%i),e>=60&&(e=(e-s[0])/i,s.unshift(e))),r+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var qf={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>ei(n,t),stringify:ea},Uf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>ei(n,!1),stringify:ea},ta={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(ta.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,r,i,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,r-1,i,s||0,o||0,a||0,c),p=e[8];if(p&&p!=="Z"){let u=ei(p,!1);Math.abs(u)<30&&(u*=60),l-=6e4*u}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};Pn.floatTime=Uf;Pn.intTime=qf;Pn.timestamp=ta});var ia=w(ra=>{"use strict";var Mf=Qe(),Ff=Nn(),Bf=et(),Kf=Nt(),jf=Xr(),na=Ho(),ni=Wo(),$n=Qo(),Xf=mn(),zf=Gr(),Yf=On(),Vf=Qr(),ri=ti(),Gf=[Mf.map,Bf.seq,Kf.string,Ff.nullTag,na.trueTag,na.falseTag,$n.intBin,$n.intOct,$n.int,$n.intHex,ni.floatNaN,ni.floatExp,ni.float,jf.binary,Xf.merge,zf.omap,Yf.pairs,Vf.set,ri.intTime,ri.floatTime,ri.timestamp];ra.schema=Gf});var ma=w(oi=>{"use strict";var ca=Qe(),Jf=Nn(),la=et(),Hf=Nt(),Wf=$r(),ii=Ur(),si=Fr(),Zf=qo(),Qf=Fo(),da=Xr(),At=mn(),ua=Gr(),fa=On(),sa=ia(),pa=Qr(),qn=ti(),oa=new Map([["core",Zf.schema],["failsafe",[ca.map,la.seq,Hf.string]],["json",Qf.schema],["yaml11",sa.schema],["yaml-1.1",sa.schema]]),aa={binary:da.binary,bool:Wf.boolTag,float:ii.float,floatExp:ii.floatExp,floatNaN:ii.floatNaN,floatTime:qn.floatTime,int:si.int,intHex:si.intHex,intOct:si.intOct,intTime:qn.intTime,map:ca.map,merge:At.merge,null:Jf.nullTag,omap:ua.omap,pairs:fa.pairs,seq:la.seq,set:pa.set,timestamp:qn.timestamp},ep={"tag:yaml.org,2002:binary":da.binary,"tag:yaml.org,2002:merge":At.merge,"tag:yaml.org,2002:omap":ua.omap,"tag:yaml.org,2002:pairs":fa.pairs,"tag:yaml.org,2002:set":pa.set,"tag:yaml.org,2002:timestamp":qn.timestamp};function tp(n,e,t){let r=oa.get(e);if(r&&!n)return t&&!r.includes(At.merge)?r.concat(At.merge):r.slice();let i=r;if(!i)if(Array.isArray(n))i=[];else{let s=Array.from(oa.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)i=i.concat(s);else typeof n=="function"&&(i=n(i.slice()));return t&&(i=i.concat(At.merge)),i.reduce((s,o)=>{let a=typeof o=="string"?aa[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(aa).map(p=>JSON.stringify(p)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}oi.coreKnownTags=ep;oi.getTags=tp});var li=w(ha=>{"use strict";var ai=I(),np=Qe(),rp=et(),ip=Nt(),Un=ma(),sp=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,ci=class n{constructor({compat:e,customTags:t,merge:r,resolveKnownTags:i,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?Un.getTags(e,"compat"):e?Un.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=i?Un.coreKnownTags:{},this.tags=Un.getTags(t,this.name,r),this.toStringOptions=a??null,Object.defineProperty(this,ai.MAP,{value:np.map}),Object.defineProperty(this,ai.SCALAR,{value:ip.string}),Object.defineProperty(this,ai.SEQ,{value:rp.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?sp:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};ha.Schema=ci});var ya=w(ga=>{"use strict";var op=I(),di=Et(),Lt=ht();function ap(n,e){let t=[],r=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),r=!0):n.directives.docStart&&(r=!0)}r&&t.push("---");let i=di.createStringifyContext(n,e),{commentString:s}=i.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(Lt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(op.isNode(n.contents)){if(n.contents.spaceBefore&&r&&t.push(""),n.contents.commentBefore){let p=s(n.contents.commentBefore);t.push(Lt.indentComment(p,""))}i.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=di.stringify(n.contents,i,()=>a=null,c);a&&(l+=Lt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(di.stringify(n.contents,i));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(Lt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(Lt.indentComment(s(c),"")))}return t.join(`
`)+`
`}ga.stringifyDocument=ap});var Ot=w(ba=>{"use strict";var cp=pt(),nt=rn(),oe=I(),lp=ke(),dp=Ne(),up=li(),fp=ya(),ui=Qt(),pp=hr(),mp=mt(),fi=mr(),pi=class n{constructor(e,t,r){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,oe.NODE_TYPE,{value:oe.DOC});let i=null;typeof t=="function"||Array.isArray(t)?i=t:r===void 0&&t&&(r=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},r);this.options=s;let{version:o}=s;r?._directives?(this.directives=r._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new fi.Directives({version:o}),this.setSchema(o,r),this.contents=e===void 0?null:this.createNode(e,i,r)}clone(){let e=Object.create(n.prototype,{[oe.NODE_TYPE]:{value:oe.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=oe.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){rt(this.contents)&&this.contents.add(e)}addIn(e,t){rt(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let r=ui.anchorNames(this);e.anchor=!t||r.has(t)?ui.findNewAnchor(t||"a",r):t}return new cp.Alias(e.anchor)}createNode(e,t,r){let i;if(typeof t=="function")e=t.call({"":e},"",e),i=t;else if(Array.isArray(t)){let h=b=>typeof b=="number"||b instanceof String||b instanceof Number,E=t.filter(h).map(String);E.length>0&&(t=t.concat(E)),i=t}else r===void 0&&t&&(r=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:p}=r??{},{onAnchor:u,setAnchors:d,sourceObjects:m}=ui.createNodeAnchors(this,o||"a"),y={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:u,onTagObj:l,replacer:i,schema:this.schema,sourceObjects:m},f=mp.createNode(e,p,y);return a&&oe.isCollection(f)&&(f.flow=!0),d(),f}createPair(e,t,r={}){let i=this.createNode(e,null,r),s=this.createNode(t,null,r);return new lp.Pair(i,s)}delete(e){return rt(this.contents)?this.contents.delete(e):!1}deleteIn(e){return nt.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):rt(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return oe.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return nt.isEmptyPath(e)?!t&&oe.isScalar(this.contents)?this.contents.value:this.contents:oe.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return oe.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return nt.isEmptyPath(e)?this.contents!==void 0:oe.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=nt.collectionFromPath(this.schema,[e],t):rt(this.contents)&&this.contents.set(e,t)}setIn(e,t){nt.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=nt.collectionFromPath(this.schema,Array.from(e),t):rt(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let r;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new fi.Directives({version:"1.1"}),r={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new fi.Directives({version:e}),r={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,r=null;break;default:{let i=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(r)this.schema=new up.Schema(Object.assign(r,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:r,maxAliasCount:i,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:r===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},c=dp.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:p}of a.anchors.values())s(p,l);return typeof o=="function"?pp.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return fp.stringifyDocument(this,e)}};function rt(n){if(oe.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}ba.Document=pi});var It=w(xt=>{"use strict";var Rt=class extends Error{constructor(e,t,r,i){super(),this.name=e,this.code=r,this.message=i,this.pos=t}},mi=class extends Rt{constructor(e,t,r){super("YAMLParseError",e,t,r)}},hi=class extends Rt{constructor(e,t,r){super("YAMLWarning",e,t,r)}},hp=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:r,col:i}=t.linePos[0];t.message+=` at line ${r}, column ${i}`;let s=i-1,o=n.substring(e.lineStarts[r-1],e.lineStarts[r]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),r>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[r-2],e.lineStarts[r-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===r&&c.col>i&&(a=Math.max(1,Math.min(c.col-i,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};xt.YAMLError=Rt;xt.YAMLParseError=mi;xt.YAMLWarning=hi;xt.prettifyError=hp});var Ct=w(Ea=>{"use strict";function gp(n,{flow:e,indicator:t,next:r,offset:i,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,p=a,u="",d="",m=!1,y=!1,f=null,h=null,E=null,b=null,_=null,T=null,v=null;for(let N of n)switch(y&&(N.type!=="space"&&N.type!=="newline"&&N.type!=="comma"&&s(N.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),y=!1),f&&(l&&N.type!=="comment"&&N.type!=="newline"&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),f=null),N.type){case"space":!e&&(t!=="doc-start"||r?.type!=="flow-collection")&&N.source.includes("	")&&(f=N),p=!0;break;case"comment":{p||s(N,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let S=N.source.substring(1)||" ";u?u+=d+S:u=S,d="",l=!1;break}case"newline":l?u?u+=N.source:(!T||t!=="seq-item-ind")&&(c=!0):d+=N.source,l=!0,m=!0,(h||E)&&(b=N),p=!0;break;case"anchor":h&&s(N,"MULTIPLE_ANCHORS","A node can have at most one anchor"),N.source.endsWith(":")&&s(N.offset+N.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),h=N,v??(v=N.offset),l=!1,p=!1,y=!0;break;case"tag":{E&&s(N,"MULTIPLE_TAGS","A node can have at most one tag"),E=N,v??(v=N.offset),l=!1,p=!1,y=!0;break}case t:(h||E)&&s(N,"BAD_PROP_ORDER",`Anchors and tags must be after the ${N.source} indicator`),T&&s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.source} in ${e??"collection"}`),T=N,l=t==="seq-item-ind"||t==="explicit-key-ind",p=!1;break;case"comma":if(e){_&&s(N,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),_=N,l=!1,p=!1;break}default:s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.type} token`),l=!1,p=!1}let k=n[n.length-1],A=k?k.offset+k.source.length:i;return y&&r&&r.type!=="space"&&r.type!=="newline"&&r.type!=="comma"&&(r.type!=="scalar"||r.source!=="")&&s(r.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),f&&(l&&f.indent<=o||r?.type==="block-map"||r?.type==="block-seq")&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:_,found:T,spaceBefore:c,comment:u,hasNewline:m,anchor:h,tag:E,newlineAfterProp:b,end:A,start:v??A}}Ea.resolveProps=gp});var Mn=w(_a=>{"use strict";function gi(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(gi(e.key)||gi(e.value))return!0}return!1;default:return!0}}_a.containsNewline=gi});var yi=w(Ta=>{"use strict";var yp=Mn();function bp(n,e,t){if(e?.type==="flow-collection"){let r=e.end[0];r.indent===n&&(r.source==="]"||r.source==="}")&&yp.containsNewline(e)&&t(r,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}Ta.flowIndentCheck=bp});var bi=w(wa=>{"use strict";var Na=I();function Ep(n,e,t){let{uniqueKeys:r}=n.options;if(r===!1)return!1;let i=typeof r=="function"?r:(s,o)=>s===o||Na.isScalar(s)&&Na.isScalar(o)&&s.value===o.value;return e.some(s=>i(s.key,t))}wa.mapIncludes=Ep});var Oa=w(La=>{"use strict";var Sa=ke(),_p=Le(),va=Ct(),Tp=Mn(),ka=yi(),Np=bi(),Aa="All mapping items must start at the same column";function wp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??_p.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=r.offset,l=null;for(let p of r.items){let{start:u,key:d,sep:m,value:y}=p,f=va.resolveProps(u,{indicator:"explicit-key-ind",next:d??m?.[0],offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0}),h=!f.found;if(h){if(d&&(d.type==="block-seq"?i(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in d&&d.indent!==r.indent&&i(c,"BAD_INDENT",Aa)),!f.anchor&&!f.tag&&!m){l=f.end,f.comment&&(a.comment?a.comment+=`
`+f.comment:a.comment=f.comment);continue}(f.newlineAfterProp||Tp.containsNewline(d))&&i(d??u[u.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else f.found?.indent!==r.indent&&i(c,"BAD_INDENT",Aa);t.atKey=!0;let E=f.end,b=d?n(t,d,f,i):e(t,E,u,null,f,i);t.schema.compat&&ka.flowIndentCheck(r.indent,d,i),t.atKey=!1,Np.mapIncludes(t,a.items,b)&&i(E,"DUPLICATE_KEY","Map keys must be unique");let _=va.resolveProps(m??[],{indicator:"map-value-ind",next:y,offset:b.range[2],onError:i,parentIndent:r.indent,startOnNewline:!d||d.type==="block-scalar"});if(c=_.end,_.found){h&&(y?.type==="block-map"&&!_.hasNewline&&i(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&f.start<_.found.offset-1024&&i(b.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let T=y?n(t,y,_,i):e(t,c,m,null,_,i);t.schema.compat&&ka.flowIndentCheck(r.indent,y,i),c=T.range[2];let v=new Sa.Pair(b,T);t.options.keepSourceTokens&&(v.srcToken=p),a.items.push(v)}else{h&&i(b.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),_.comment&&(b.comment?b.comment+=`
`+_.comment:b.comment=_.comment);let T=new Sa.Pair(b);t.options.keepSourceTokens&&(T.srcToken=p),a.items.push(T)}}return l&&l<c&&i(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[r.offset,c,l??c],a}La.resolveBlockMap=wp});var xa=w(Ra=>{"use strict";var Sp=Oe(),vp=Ct(),kp=yi();function Ap({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??Sp.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=r.offset,l=null;for(let{start:p,value:u}of r.items){let d=vp.resolveProps(p,{indicator:"seq-item-ind",next:u,offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0});if(!d.found)if(d.anchor||d.tag||u)u?.type==="block-seq"?i(d.end,"BAD_INDENT","All sequence items must start at the same column"):i(c,"MISSING_CHAR","Sequence item without - indicator");else{l=d.end,d.comment&&(a.comment=d.comment);continue}let m=u?n(t,u,d,i):e(t,d.end,p,null,d,i);t.schema.compat&&kp.flowIndentCheck(r.indent,u,i),c=m.range[2],a.items.push(m)}return a.range=[r.offset,c,l??c],a}Ra.resolveBlockSeq=Ap});var it=w(Ia=>{"use strict";function Lp(n,e,t,r){let i="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&r(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let p=c.substring(1)||" ";i?i+=o+p:i=p,o="";break}case"newline":i&&(o+=c),s=!0;break;default:r(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:i,offset:e}}Ia.resolveEnd=Lp});var $a=w(Pa=>{"use strict";var Op=I(),Rp=ke(),Ca=Le(),xp=Oe(),Ip=it(),Da=Ct(),Cp=Mn(),Dp=bi(),Ei="Block collections are not allowed within flow collections",_i=n=>n&&(n.type==="block-map"||n.type==="block-seq");function Pp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=r.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?Ca.YAMLMap:xp.YAMLSeq),l=new c(t.schema);l.flow=!0;let p=t.atRoot;p&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let u=r.offset+r.start.source.length;for(let h=0;h<r.items.length;++h){let E=r.items[h],{start:b,key:_,sep:T,value:v}=E,k=Da.resolveProps(b,{flow:a,indicator:"explicit-key-ind",next:_??T?.[0],offset:u,onError:i,parentIndent:r.indent,startOnNewline:!1});if(!k.found){if(!k.anchor&&!k.tag&&!T&&!v){h===0&&k.comma?i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):h<r.items.length-1&&i(k.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),k.comment&&(l.comment?l.comment+=`
`+k.comment:l.comment=k.comment),u=k.end;continue}!o&&t.options.strict&&Cp.containsNewline(_)&&i(_,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(h===0)k.comma&&i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(k.comma||i(k.start,"MISSING_CHAR",`Missing , between ${a} items`),k.comment){let A="";e:for(let N of b)switch(N.type){case"comma":case"space":break;case"comment":A=N.source.substring(1);break e;default:break e}if(A){let N=l.items[l.items.length-1];Op.isPair(N)&&(N=N.value??N.key),N.comment?N.comment+=`
`+A:N.comment=A,k.comment=k.comment.substring(A.length+1)}}if(!o&&!T&&!k.found){let A=v?n(t,v,k,i):e(t,k.end,T,null,k,i);l.items.push(A),u=A.range[2],_i(v)&&i(A.range,"BLOCK_IN_FLOW",Ei)}else{t.atKey=!0;let A=k.end,N=_?n(t,_,k,i):e(t,A,b,null,k,i);_i(_)&&i(N.range,"BLOCK_IN_FLOW",Ei),t.atKey=!1;let S=Da.resolveProps(T??[],{flow:a,indicator:"map-value-ind",next:v,offset:N.range[2],onError:i,parentIndent:r.indent,startOnNewline:!1});if(S.found){if(!o&&!k.found&&t.options.strict){if(T)for(let U of T){if(U===S.found)break;if(U.type==="newline"){i(U,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}k.start<S.found.offset-1024&&i(S.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else v&&("source"in v&&v.source?.[0]===":"?i(v,"MISSING_CHAR",`Missing space after : in ${a}`):i(S.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let P=v?n(t,v,S,i):S.found?e(t,S.end,T,null,S,i):null;P?_i(v)&&i(P.range,"BLOCK_IN_FLOW",Ei):S.comment&&(N.comment?N.comment+=`
`+S.comment:N.comment=S.comment);let W=new Rp.Pair(N,P);if(t.options.keepSourceTokens&&(W.srcToken=E),o){let U=l;Dp.mapIncludes(t,U.items,N)&&i(A,"DUPLICATE_KEY","Map keys must be unique"),U.items.push(W)}else{let U=new Ca.YAMLMap(t.schema);U.flow=!0,U.items.push(W);let R=(P??N).range;U.range=[N.range[0],R[1],R[2]],l.items.push(U)}u=P?P.range[2]:S.end}}let d=o?"}":"]",[m,...y]=r.end,f=u;if(m?.source===d)f=m.offset+m.source.length;else{let h=a[0].toUpperCase()+a.substring(1),E=p?`${h} must end with a ${d}`:`${h} in block collection must be sufficiently indented and end with a ${d}`;i(u,p?"MISSING_CHAR":"BAD_INDENT",E),m&&m.source.length!==1&&y.unshift(m)}if(y.length>0){let h=Ip.resolveEnd(y,f,t.options.strict,i);h.comment&&(l.comment?l.comment+=`
`+h.comment:l.comment=h.comment),l.range=[r.offset,f,h.offset]}else l.range=[r.offset,f,f];return l}Pa.resolveFlowCollection=Pp});var Ua=w(qa=>{"use strict";var $p=I(),qp=B(),Up=Le(),Mp=Oe(),Fp=Oa(),Bp=xa(),Kp=$a();function Ti(n,e,t,r,i,s){let o=t.type==="block-map"?Fp.resolveBlockMap(n,e,t,r,s):t.type==="block-seq"?Bp.resolveBlockSeq(n,e,t,r,s):Kp.resolveFlowCollection(n,e,t,r,s),a=o.constructor;return i==="!"||i===a.tagName?(o.tag=a.tagName,o):(i&&(o.tag=i),o)}function jp(n,e,t,r,i){let s=r.tag,o=s?e.directives.tagName(s.source,d=>i(s,"TAG_RESOLVE_FAILED",d)):null;if(t.type==="block-seq"){let{anchor:d,newlineAfterProp:m}=r,y=d&&s?d.offset>s.offset?d:s:d??s;y&&(!m||m.offset<y.offset)&&i(y,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===Up.YAMLMap.tagName&&a==="map"||o===Mp.YAMLSeq.tagName&&a==="seq")return Ti(n,e,t,i,o);let c=e.schema.tags.find(d=>d.tag===o&&d.collection===a);if(!c){let d=e.schema.knownTags[o];if(d?.collection===a)e.schema.tags.push(Object.assign({},d,{default:!1})),c=d;else return d?i(s,"BAD_COLLECTION_TYPE",`${d.tag} used for ${a} collection, but expects ${d.collection??"scalar"}`,!0):i(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),Ti(n,e,t,i,o)}let l=Ti(n,e,t,i,o,c),p=c.resolve?.(l,d=>i(s,"TAG_RESOLVE_FAILED",d),e.options)??l,u=$p.isNode(p)?p:new qp.Scalar(p);return u.range=l.range,u.tag=o,c?.format&&(u.format=c.format),u}qa.composeCollection=jp});var wi=w(Ma=>{"use strict";var Ni=B();function Xp(n,e,t){let r=e.offset,i=zp(e,n.options.strict,t);if(!i)return{value:"",type:null,comment:"",range:[r,r,r]};let s=i.mode===">"?Ni.Scalar.BLOCK_FOLDED:Ni.Scalar.BLOCK_LITERAL,o=e.source?Yp(e.source):[],a=o.length;for(let f=o.length-1;f>=0;--f){let h=o[f][1];if(h===""||h==="\r")a=f;else break}if(a===0){let f=i.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",h=r+i.length;return e.source&&(h+=e.source.length),{value:f,type:s,comment:i.comment,range:[r,h,h]}}let c=e.indent+i.indent,l=e.offset+i.length,p=0;for(let f=0;f<a;++f){let[h,E]=o[f];if(E===""||E==="\r")i.indent===0&&h.length>c&&(c=h.length);else{h.length<c&&t(l+h.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),i.indent===0&&(c=h.length),p=f,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=h.length+E.length+1}for(let f=o.length-1;f>=a;--f)o[f][0].length>c&&(a=f+1);let u="",d="",m=!1;for(let f=0;f<p;++f)u+=o[f][0].slice(c)+`
`;for(let f=p;f<a;++f){let[h,E]=o[f];l+=h.length+E.length+1;let b=E[E.length-1]==="\r";if(b&&(E=E.slice(0,-1)),E&&h.length<c){let T=`Block scalar lines must not be less indented than their ${i.indent?"explicit indentation indicator":"first line"}`;t(l-E.length-(b?2:1),"BAD_INDENT",T),h=""}s===Ni.Scalar.BLOCK_LITERAL?(u+=d+h.slice(c)+E,d=`
`):h.length>c||E[0]==="	"?(d===" "?d=`
`:!m&&d===`
`&&(d=`

`),u+=d+h.slice(c)+E,d=`
`,m=!0):E===""?d===`
`?u+=`
`:d=`
`:(u+=d+E,d=" ",m=!1)}switch(i.chomp){case"-":break;case"+":for(let f=a;f<o.length;++f)u+=`
`+o[f][0].slice(c);u[u.length-1]!==`
`&&(u+=`
`);break;default:u+=`
`}let y=r+i.length+e.source.length;return{value:u,type:s,comment:i.comment,range:[r,y,y]}}function zp({offset:n,props:e},t,r){if(e[0].type!=="block-scalar-header")return r(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:i}=e[0],s=i[0],o=0,a="",c=-1;for(let d=1;d<i.length;++d){let m=i[d];if(!a&&(m==="-"||m==="+"))a=m;else{let y=Number(m);!o&&y?o=y:c===-1&&(c=n+d)}}c!==-1&&r(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${i}`);let l=!1,p="",u=i.length;for(let d=1;d<e.length;++d){let m=e[d];switch(m.type){case"space":l=!0;case"newline":u+=m.source.length;break;case"comment":t&&!l&&r(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),u+=m.source.length,p=m.source.substring(1);break;case"error":r(m,"UNEXPECTED_TOKEN",m.message),u+=m.source.length;break;default:{let y=`Unexpected token in block scalar header: ${m.type}`;r(m,"UNEXPECTED_TOKEN",y);let f=m.source;f&&typeof f=="string"&&(u+=f.length)}}}return{mode:s,indent:o,chomp:a,comment:p,length:u}}function Yp(n){let e=n.split(/\n( *)/),t=e[0],r=t.match(/^( *)/),s=[r?.[1]?[r[1],t.slice(r[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}Ma.resolveBlockScalar=Xp});var vi=w(Ba=>{"use strict";var Si=B(),Vp=it();function Gp(n,e,t){let{offset:r,type:i,source:s,end:o}=n,a,c,l=(d,m,y)=>t(r+d,m,y);switch(i){case"scalar":a=Si.Scalar.PLAIN,c=Jp(s,l);break;case"single-quoted-scalar":a=Si.Scalar.QUOTE_SINGLE,c=Hp(s,l);break;case"double-quoted-scalar":a=Si.Scalar.QUOTE_DOUBLE,c=Wp(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${i}`),{value:"",type:null,comment:"",range:[r,r+s.length,r+s.length]}}let p=r+s.length,u=Vp.resolveEnd(o,p,e,t);return{value:c,type:a,comment:u.comment,range:[r,p,u.offset]}}function Jp(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),Fa(n)}function Hp(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),Fa(n.slice(1,-1)).replace(/''/g,"'")}function Fa(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let r=e.exec(n);if(!r)return n;let i=r[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;r=t.exec(n);)r[1]===""?s===`
`?i+=s:s=`
`:(i+=s+r[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,r=a.exec(n),i+s+(r?.[1]??"")}function Wp(n,e){let t="";for(let r=1;r<n.length-1;++r){let i=n[r];if(!(i==="\r"&&n[r+1]===`
`))if(i===`
`){let{fold:s,offset:o}=Zp(n,r);t+=s,r=o}else if(i==="\\"){let s=n[++r],o=Qp[s];if(o)t+=o;else if(s===`
`)for(s=n[r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="\r"&&n[r+1]===`
`)for(s=n[++r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=em(n,r+1,a,e),r+=a}else{let a=n.substr(r-1,2);e(r-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(i===" "||i==="	"){let s=r,o=n[r+1];for(;o===" "||o==="	";)o=n[++r+1];o!==`
`&&!(o==="\r"&&n[r+2]===`
`)&&(t+=r>s?n.slice(s,r+1):i)}else t+=i}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function Zp(n,e){let t="",r=n[e+1];for(;(r===" "||r==="	"||r===`
`||r==="\r")&&!(r==="\r"&&n[e+2]!==`
`);)r===`
`&&(t+=`
`),e+=1,r=n[e+1];return t||(t=" "),{fold:t,offset:e}}var Qp={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function em(n,e,t,r){let i=n.substr(e,t),o=i.length===t&&/^[0-9a-fA-F]+$/.test(i)?parseInt(i,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return r(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Ba.resolveFlowScalar=Gp});var Xa=w(ja=>{"use strict";var Fe=I(),Ka=B(),tm=wi(),nm=vi();function rm(n,e,t,r){let{value:i,type:s,comment:o,range:a}=e.type==="block-scalar"?tm.resolveBlockScalar(n,e,r):nm.resolveFlowScalar(e,n.options.strict,r),c=t?n.directives.tagName(t.source,u=>r(t,"TAG_RESOLVE_FAILED",u)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Fe.SCALAR]:c?l=im(n.schema,i,c,t,r):e.type==="scalar"?l=sm(n,i,e,r):l=n.schema[Fe.SCALAR];let p;try{let u=l.resolve(i,d=>r(t??e,"TAG_RESOLVE_FAILED",d),n.options);p=Fe.isScalar(u)?u:new Ka.Scalar(u)}catch(u){let d=u instanceof Error?u.message:String(u);r(t??e,"TAG_RESOLVE_FAILED",d),p=new Ka.Scalar(i)}return p.range=a,p.source=i,s&&(p.type=s),c&&(p.tag=c),l.format&&(p.format=l.format),o&&(p.comment=o),p}function im(n,e,t,r,i){if(t==="!")return n[Fe.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(i(r,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Fe.SCALAR])}function sm({atKey:n,directives:e,schema:t},r,i,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(r))||t[Fe.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(r))??t[Fe.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),p=`Value may be parsed as either ${c} or ${l}`;s(i,"TAG_RESOLVE_FAILED",p,!0)}}return o}ja.composeScalar=rm});var Ya=w(za=>{"use strict";function om(n,e,t){if(e){t??(t=e.length);for(let r=t-1;r>=0;--r){let i=e[r];switch(i.type){case"space":case"comment":case"newline":n-=i.source.length;continue}for(i=e[++r];i?.type==="space";)n+=i.source.length,i=e[++r];break}}return n}za.emptyScalarPosition=om});var Ja=w(Ai=>{"use strict";var am=pt(),cm=I(),lm=Ua(),Va=Xa(),dm=it(),um=Ya(),fm={composeNode:Ga,composeEmptyNode:ki};function Ga(n,e,t,r){let i=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,p=!0;switch(e.type){case"alias":l=pm(n,e,r),(a||c)&&r(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=Va.composeScalar(n,e,c,r),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=lm.composeCollection(fm,n,e,t,r),a&&(l.anchor=a.source.substring(1))}catch(u){let d=u instanceof Error?u.message:String(u);r(e,"RESOURCE_EXHAUSTION",d)}break;default:{let u=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;r(e,"UNEXPECTED_TOKEN",u),p=!1}}return l??(l=ki(n,e.offset,void 0,null,t,r)),a&&l.anchor===""&&r(a,"BAD_ALIAS","Anchor cannot be an empty string"),i&&n.options.stringKeys&&(!cm.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&r(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&p&&(l.srcToken=e),l}function ki(n,e,t,r,{spaceBefore:i,comment:s,anchor:o,tag:a,end:c},l){let p={type:"scalar",offset:um.emptyScalarPosition(e,t,r),indent:-1,source:""},u=Va.composeScalar(n,p,a,l);return o&&(u.anchor=o.source.substring(1),u.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),i&&(u.spaceBefore=!0),s&&(u.comment=s,u.range[2]=c),u}function pm({options:n},{offset:e,source:t,end:r},i){let s=new am.Alias(t.substring(1));s.source===""&&i(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&i(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=dm.resolveEnd(r,o,n.strict,i);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}Ai.composeEmptyNode=ki;Ai.composeNode=Ga});var Za=w(Wa=>{"use strict";var mm=Ot(),Ha=Ja(),hm=it(),gm=Ct();function ym(n,e,{offset:t,start:r,value:i,end:s},o){let a=Object.assign({_directives:e},n),c=new mm.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},p=gm.resolveProps(r,{indicator:"doc-start",next:i??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});p.found&&(c.directives.docStart=!0,i&&(i.type==="block-map"||i.type==="block-seq")&&!p.hasNewline&&o(p.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=i?Ha.composeNode(l,i,p,o):Ha.composeEmptyNode(l,p.end,r,null,p,o);let u=c.contents.range[2],d=hm.resolveEnd(s,u,!1,o);return d.comment&&(c.comment=d.comment),c.range=[t,u,d.offset],c}Wa.composeDoc=ym});var Oi=w(tc=>{"use strict";var bm=zt("process"),Em=mr(),_m=Ot(),Dt=It(),Qa=I(),Tm=Za(),Nm=it();function Pt(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function ec(n){let e="",t=!1,r=!1;for(let i=0;i<n.length;++i){let s=n[i];switch(s[0]){case"#":e+=(e===""?"":r?`

`:`
`)+(s.substring(1)||" "),t=!0,r=!1;break;case"%":n[i+1]?.[0]!=="#"&&(i+=1),t=!1;break;default:t||(r=!0),t=!1}}return{comment:e,afterEmptyLine:r}}var Li=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,r,i,s)=>{let o=Pt(t);s?this.warnings.push(new Dt.YAMLWarning(o,r,i)):this.errors.push(new Dt.YAMLParseError(o,r,i))},this.directives=new Em.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:r,afterEmptyLine:i}=ec(this.prelude);if(r){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${r}`:r;else if(i||e.directives.docStart||!s)e.commentBefore=r;else if(Qa.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];Qa.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${r}
${a}`:r}else{let o=s.commentBefore;s.commentBefore=o?`${r}
${o}`:r}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:ec(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,r=-1){for(let i of e)yield*this.next(i);yield*this.end(t,r)}*next(e){switch(bm.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,r,i)=>{let s=Pt(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",r,i)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=Tm.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,r=new Dt.YAMLParseError(Pt(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(r):this.doc.errors.push(r);break}case"doc-end":{if(!this.doc){let r="Unexpected doc-end without preceding document";this.errors.push(new Dt.YAMLParseError(Pt(e),"UNEXPECTED_TOKEN",r));break}this.doc.directives.docEnd=!0;let t=Nm.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let r=this.doc.comment;this.doc.comment=r?`${r}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new Dt.YAMLParseError(Pt(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let r=Object.assign({_directives:this.directives},this.options),i=new _m.Document(void 0,r);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),i.range=[0,t,t],this.decorate(i,!1),yield i}}};tc.Composer=Li});var ic=w(Fn=>{"use strict";var wm=wi(),Sm=vi(),vm=It(),nc=bt();function km(n,e=!0,t){if(n){let r=(i,s,o)=>{let a=typeof i=="number"?i:Array.isArray(i)?i[0]:i.offset;if(t)t(a,s,o);else throw new vm.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return Sm.resolveFlowScalar(n,e,r);case"block-scalar":return wm.resolveBlockScalar({options:{strict:e}},n,r)}}return null}function Am(n,e){let{implicitKey:t=!1,indent:r,inFlow:i=!1,offset:s=-1,type:o="PLAIN"}=e,a=nc.stringifyString({type:o,value:n},{implicitKey:t,indent:r>0?" ".repeat(r):"",inFlow:i,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:r,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),p=a.substring(0,l),u=a.substring(l+1)+`
`,d=[{type:"block-scalar-header",offset:s,indent:r,source:p}];return rc(d,c)||d.push({type:"newline",offset:-1,indent:r,source:`
`}),{type:"block-scalar",offset:s,indent:r,props:d,source:u}}case'"':return{type:"double-quoted-scalar",offset:s,indent:r,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:r,source:a,end:c};default:return{type:"scalar",offset:s,indent:r,source:a,end:c}}}function Lm(n,e,t={}){let{afterKey:r=!1,implicitKey:i=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(r&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=nc.stringifyString({type:o,value:e},{implicitKey:i||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Om(n,c);break;case'"':Ri(n,c,"double-quoted-scalar");break;case"'":Ri(n,c,"single-quoted-scalar");break;default:Ri(n,c,"scalar")}}function Om(n,e){let t=e.indexOf(`
`),r=e.substring(0,t),i=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=r,n.source=i}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:r}];rc(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:i})}}function rc(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function Ri(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let r=n.props.slice(1),i=e.length;n.props[0].type==="block-scalar-header"&&(i-=n.props[0].source.length);for(let s of r)s.offset+=i;delete n.props,Object.assign(n,{type:t,source:e,end:r});break}case"block-map":case"block-seq":{let i={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[i]});break}default:{let r="indent"in n?n.indent:-1,i="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:r,source:e,end:i})}}}Fn.createScalarToken=Am;Fn.resolveAsScalar=km;Fn.setScalarValue=Lm});var oc=w(sc=>{"use strict";var Rm=n=>"type"in n?Kn(n):Bn(n);function Kn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Kn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=Bn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=Bn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=Bn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function Bn({start:n,key:e,sep:t,value:r}){let i="";for(let s of n)i+=s.source;if(e&&(i+=Kn(e)),t)for(let s of t)i+=s.source;return r&&(i+=Kn(r)),i}sc.stringify=Rm});var dc=w(lc=>{"use strict";var xi=Symbol("break visit"),xm=Symbol("skip children"),ac=Symbol("remove item");function Be(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),cc(Object.freeze([]),n,e)}Be.BREAK=xi;Be.SKIP=xm;Be.REMOVE=ac;Be.itemAtPath=(n,e)=>{let t=n;for(let[r,i]of e){let s=t?.[r];if(s&&"items"in s)t=s.items[i];else return}return t};Be.parentCollection=(n,e)=>{let t=Be.itemAtPath(n,e.slice(0,-1)),r=e[e.length-1][0],i=t?.[r];if(i&&"items"in i)return i;throw new Error("Parent collection not found")};function cc(n,e,t){let r=t(e,n);if(typeof r=="symbol")return r;for(let i of["key","value"]){let s=e[i];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=cc(Object.freeze(n.concat([[i,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===xi)return xi;a===ac&&(s.items.splice(o,1),o-=1)}}typeof r=="function"&&i==="key"&&(r=r(e,n))}}return typeof r=="function"?r(e,n):r}lc.visit=Be});var jn=w(te=>{"use strict";var Ii=ic(),Im=oc(),Cm=dc(),Ci="\uFEFF",Di="",Pi="",$i="",Dm=n=>!!n&&"items"in n,Pm=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function $m(n){switch(n){case Ci:return"<BOM>";case Di:return"<DOC>";case Pi:return"<FLOW_END>";case $i:return"<SCALAR>";default:return JSON.stringify(n)}}function qm(n){switch(n){case Ci:return"byte-order-mark";case Di:return"doc-mode";case Pi:return"flow-error-end";case $i:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}te.createScalarToken=Ii.createScalarToken;te.resolveAsScalar=Ii.resolveAsScalar;te.setScalarValue=Ii.setScalarValue;te.stringify=Im.stringify;te.visit=Cm.visit;te.BOM=Ci;te.DOCUMENT=Di;te.FLOW_END=Pi;te.SCALAR=$i;te.isCollection=Dm;te.isScalar=Pm;te.prettyToken=$m;te.tokenType=qm});var Mi=w(fc=>{"use strict";var $t=jn();function ce(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var uc=new Set("0123456789ABCDEFabcdef"),Um=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),Xn=new Set(",[]{}"),Mm=new Set(` ,[]{}
\r	`),qi=n=>!n||Mm.has(n),Ui=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let r=this.next??"stream";for(;r&&(t||this.hasChars(1));)r=yield*this.parseNext(r)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let r=0;for(;t===" ";)t=this.buffer[++r+e];if(t==="\r"){let i=this.buffer[r+e+1];if(i===`
`||!i&&!this.atEnd)return e+r+1}return t===`
`||r>=this.indentNext||!t&&!this.atEnd?e+r:-1}if(t==="-"||t==="."){let r=this.buffer.substr(e,3);if((r==="---"||r==="...")&&ce(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===$t.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,r=e.indexOf("#");for(;r!==-1;){let s=e[r-1];if(s===" "||s==="	"){t=r-1;break}else r=e.indexOf("#",r+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let i=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-i),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield $t.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ce(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ce(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ce(t)){let r=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=r,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(qi),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,r=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=r=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let i=this.getLine();if(i===null)return this.setNext("flow");if((r!==-1&&r<this.indentNext&&i[0]!=="#"||r===0&&(i.startsWith("---")||i.startsWith("..."))&&ce(i[3]))&&!(r===this.indentNext-1&&this.flowLevel===1&&(i[0]==="]"||i[0]==="}")))return this.flowLevel=0,yield $t.FLOW_END,yield*this.parseLineStart();let s=0;for(;i[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),i[s]){case void 0:return"flow";case"#":return yield*this.pushCount(i.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(qi),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ce(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let r=this.buffer.substring(0,t),i=r.indexOf(`
`,this.pos);if(i!==-1){for(;i!==-1;){let s=this.continueScalar(i+1);if(s===-1)break;i=r.indexOf(`
`,s)}i!==-1&&(t=i-(r[i-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ce(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,r;e:for(let s=this.pos;r=this.buffer[s];++s)switch(r){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!r&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let i=e+1;for(r=this.buffer[i];r===" ";)r=this.buffer[++i];if(r==="	"){for(;r==="	"||r===" "||r==="\r"||r===`
`;)r=this.buffer[++i];e=i-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield $t.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,r=this.pos-1,i;for(;i=this.buffer[++r];)if(i===":"){let s=this.buffer[r+1];if(ce(s)||e&&Xn.has(s))break;t=r}else if(ce(i)){let s=this.buffer[r+1];if(i==="\r"&&(s===`
`?(r+=1,i=`
`,s=this.buffer[r+1]):t=r),s==="#"||e&&Xn.has(s))break;if(i===`
`){let o=this.continueScalar(r+1);if(o===-1)break;r=Math.max(r,o-2)}}else{if(e&&Xn.has(i))break;t=r}return!i&&!this.atEnd?this.setNext("plain-scalar"):(yield $t.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let r=this.buffer.slice(this.pos,e);return r?(yield r,this.pos+=r.length,r.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(qi),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,r=this.charAt(1);if(ce(r)||t&&Xn.has(r)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ce(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(Um.has(t))t=this.buffer[++e];else if(t==="%"&&uc.has(this.buffer[e+1])&&uc.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,r;do r=this.buffer[++t];while(r===" "||e&&r==="	");let i=t-this.pos;return i>0&&(yield this.buffer.substr(this.pos,i),this.pos=t),i}*pushUntil(e){let t=this.pos,r=this.buffer[t];for(;!e(r);)r=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};fc.Lexer=Ui});var Bi=w(pc=>{"use strict";var Fi=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,r=this.lineStarts.length;for(;t<r;){let s=t+r>>1;this.lineStarts[s]<e?t=s+1:r=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let i=this.lineStarts[t-1];return{line:t,col:e-i+1}}}};pc.LineCounter=Fi});var ji=w(bc=>{"use strict";var Fm=zt("process"),mc=jn(),Bm=Mi();function Re(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function hc(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function yc(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function zn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function st(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function Yn(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function gc(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Re(e.start,"explicit-key-ind")&&!Re(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,yc(e.value)?e.value.end?Yn(e.value.end,e.sep):e.value.end=e.sep:Yn(e.start,e.sep),delete e.sep)}var Ki=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new Bm.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let r of this.lexer.lex(e,t))yield*this.next(r);t||(yield*this.end())}*next(e){if(this.source=e,Fm.env.LOG_TOKENS&&console.log("|",mc.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=mc.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let r=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:r,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let r=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in r?r.indent:0:t.type==="flow-collection"&&r.type==="document"&&(t.indent=0),t.type==="flow-collection"&&gc(t),r.type){case"document":r.value=t;break;case"block-scalar":r.props.push(t);break;case"block-map":{let i=r.items[r.items.length-1];if(i.value){r.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(i.sep)i.value=t;else{Object.assign(i,{key:t,sep:[]}),this.onKeyLine=!i.explicitKey;return}break}case"block-seq":{let i=r.items[r.items.length-1];i.value?r.items.push({start:[],value:t}):i.value=t;break}case"flow-collection":{let i=r.items[r.items.length-1];!i||i.value?r.items.push({start:[],key:t,sep:[]}):i.sep?i.value=t:Object.assign(i,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((r.type==="document"||r.type==="block-map"||r.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let i=t.items[t.items.length-1];i&&!i.sep&&!i.value&&i.start.length>0&&hc(i.start)===-1&&(t.indent===0||i.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(r.type==="document"?r.end=i.start:r.items.push({start:i.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{hc(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=zn(this.peek(2)),r=st(t),i;e.end?(i=e.end,i.push(this.sourceToken),delete e.end):i=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:r,key:e,sep:i}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Yn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let r=!this.onKeyLine&&this.indent===e.indent,i=r&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(i&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":i||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):i||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Re(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(yc(t.key)&&!Re(t.sep,"newline")){let o=st(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Re(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=st(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||i?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Re(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);i||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Re(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else r&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Yn(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Re(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let r=this.startBlockValue(e);if(r){this.stack.push(r);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let r;do yield*this.pop(),r=this.peek(1);while(r?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let i=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:i,sep:[]}):t.sep?this.stack.push(i):Object.assign(t,{key:i,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let r=this.startBlockValue(e);r?this.stack.push(r):(yield*this.pop(),yield*this.step())}else{let r=this.peek(2);if(r.type==="block-map"&&(this.type==="map-value-ind"&&r.indent===e.indent||this.type==="newline"&&!r.items[r.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&r.type!=="flow-collection"){let i=zn(r),s=st(i);gc(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=zn(e),r=st(t);return r.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=zn(e),r=st(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(r=>r.type==="newline"||r.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};bc.Parser=Ki});var wc=w(Ut=>{"use strict";var Ec=Oi(),Km=Ot(),qt=It(),jm=Ar(),Xm=I(),zm=Bi(),_c=ji();function Tc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new zm.LineCounter||null,prettyErrors:e}}function Ym(n,e={}){let{lineCounter:t,prettyErrors:r}=Tc(e),i=new _c.Parser(t?.addNewLine),s=new Ec.Composer(e),o=Array.from(s.compose(i.parse(n)));if(r&&t)for(let a of o)a.errors.forEach(qt.prettifyError(n,t)),a.warnings.forEach(qt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function Nc(n,e={}){let{lineCounter:t,prettyErrors:r}=Tc(e),i=new _c.Parser(t?.addNewLine),s=new Ec.Composer(e),o=null;for(let a of s.compose(i.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new qt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return r&&t&&(o.errors.forEach(qt.prettifyError(n,t)),o.warnings.forEach(qt.prettifyError(n,t))),o}function Vm(n,e,t){let r;typeof e=="function"?r=e:t===void 0&&e&&typeof e=="object"&&(t=e);let i=Nc(n,t);if(!i)return null;if(i.warnings.forEach(s=>jm.warn(i.options.logLevel,s)),i.errors.length>0){if(i.options.logLevel!=="silent")throw i.errors[0];i.errors=[]}return i.toJS(Object.assign({reviver:r},t))}function Gm(n,e,t){let r=null;if(typeof e=="function"||Array.isArray(e)?r=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let i=Math.round(t);t=i<1?void 0:i>8?{indent:8}:{indent:i}}if(n===void 0){let{keepUndefined:i}=t??e??{};if(!i)return}return Xm.isDocument(n)&&!r?n.toString(t):new Km.Document(n,r,t).toString(t)}Ut.parse=Vm;Ut.parseAllDocuments=Ym;Ut.parseDocument=Nc;Ut.stringify=Gm});var Gn=w(D=>{"use strict";var Jm=Oi(),Hm=Ot(),Wm=li(),Xi=It(),Zm=pt(),xe=I(),Qm=ke(),eh=B(),th=Le(),nh=Oe(),rh=jn(),ih=Mi(),sh=Bi(),oh=ji(),Vn=wc(),Sc=lt();D.Composer=Jm.Composer;D.Document=Hm.Document;D.Schema=Wm.Schema;D.YAMLError=Xi.YAMLError;D.YAMLParseError=Xi.YAMLParseError;D.YAMLWarning=Xi.YAMLWarning;D.Alias=Zm.Alias;D.isAlias=xe.isAlias;D.isCollection=xe.isCollection;D.isDocument=xe.isDocument;D.isMap=xe.isMap;D.isNode=xe.isNode;D.isPair=xe.isPair;D.isScalar=xe.isScalar;D.isSeq=xe.isSeq;D.Pair=Qm.Pair;D.Scalar=eh.Scalar;D.YAMLMap=th.YAMLMap;D.YAMLSeq=nh.YAMLSeq;D.CST=rh;D.Lexer=ih.Lexer;D.LineCounter=sh.LineCounter;D.Parser=oh.Parser;D.parse=Vn.parse;D.parseAllDocuments=Vn.parseAllDocuments;D.parseDocument=Vn.parseDocument;D.stringify=Vn.stringify;D.visit=Sc.visit;D.visitAsync=Sc.visitAsync});import{closeSync as Lg,existsSync as jt,fsyncSync as Og,mkdirSync as Rg,openSync as xg,readFileSync as pl,readdirSync as Ig,renameSync as dl,rmSync as is,statSync as ml,writeFileSync as Cg}from"node:fs";import{randomUUID as ul}from"node:crypto";import{dirname as Kt,join as G,resolve as de}from"node:path";import{spawnSync as Dg}from"node:child_process";import{DatabaseSync as hl}from"node:sqlite";import{createHash as Gl}from"node:crypto";function ct(n,e){return n<e?-1:n>e?1:0}function ue(n){return(e,t)=>ct(n(e),n(t))}var Yt=9,ms=2,hs="0.7.0";function Q(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,r])=>r!==void 0).sort(([r],[i])=>ct(r,i)).map(([r,i])=>[r,e(i)])):t;return JSON.stringify(e(n))}function Ce(n){return Gl("sha256").update(Q(n)).digest("hex")}function gs(n){return Ce({projectRoot:n}).slice(0,24)}function ys(n){let{zephyrRoot:e,projectRoot:t,producer:r,...i}=n;return Ce(i)}var bs=Yt,Es=`
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
`,_s=`
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
`;import{existsSync as Os,mkdtempSync as bd,readFileSync as Ed,realpathSync as _d,rmSync as Td,writeFileSync as Nd}from"node:fs";import{tmpdir as wd}from"node:os";import{join as Pe,resolve as lr}from"node:path";import{spawnSync as Sd}from"node:child_process";var Ts=`#!/usr/bin/env python3
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
    compound_refs = [(c.get("refid", ""), c.get("kind", "")) for c in index.findall("compound")]
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
            if len(record.get(field, "")) > len(previous.get(field, "")):
                previous[field] = record[field]

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
`;function Ns(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function ws(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),r=[],i={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(i.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=i.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:r.push(a)}};for(let o of t){let a=o.trim();if(a===""){i.kind==="brief"?i={kind:"detail"}:i.kind==="detail"&&r.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",p=""]=c,u=l.toLowerCase(),d=p.trim();switch(u){case"brief":case"short":i={kind:"brief"},s(d);break;case"param":{let m=d.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let y={name:m[2],description:(m[3]??"").trim()};m[1]&&(y.direction=m[1].replace(/\s+/g,"")),e.params.push(y),i={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(d),i={kind:"return",index:e.returns.length-1};break;case"retval":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),i={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=d.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),i={kind:"detail"};break}case"addtogroup":e.addtogroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"ingroup":e.ingroup=d.split(/\s+/)[0],i={kind:"detail"};break;case"since":e.since=d,i={kind:"detail"};break;case"deprecated":e.deprecated=!0,i={kind:"detail"},s(d);break;case"note":case"warning":case"details":case"remark":i={kind:"detail"},s(`${l.toUpperCase()}: ${d}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":i={kind:"detail"};break;default:i={kind:"detail"},s(d);break}}e.detail=r.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=Ve(e.brief)),e.detail=Ve(e.detail),e.returns=e.returns.map(Ve);for(let o of e.params)o.description=Ve(o.description);for(let o of e.retvals)o.description=Ve(o.description);return e}function Ve(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function Hl(n){let e=[];for(let t of n.split(`
`)){let r=t.trim(),i=r.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(i){e.push({kind:"define",id:i[1],title:(i[2]??"").trim()});continue}let s=r.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of r.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Ge(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var Wl=["z_impl_"];function Zl(n){for(let e of Wl)if(n.startsWith(e))return n.slice(e.length);return n}var Ql=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,ed=new RegExp(String.raw`^(struct|union|enum)\s+${Ql}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),td=/^[^(]*\(\s*\*/;function nd(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Ge(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let r=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(r)return{kind:"typedef",name:r[1],signature:Ge(e)};let i=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(i)return{kind:"typedef",name:i[1],signature:Ge(e)};let s=e.match(ed);if(s)return{kind:s[1],name:s[2],signature:Ge(e.replace(/\{[\s\S]*$/,"").trim())};if(td.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:Zl(a),signature:Ge(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function rd(n,e){let t=0,r=!1,i=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(i){l==="*"&&a[c+1]==="/"&&(i=!1,c++);continue}if(l==="/"&&a[c+1]==="*")i=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,r=!0):l==="}"&&t--}}if(r&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),p=c.lastIndexOf("}");return l<0||p<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,p),line:e,endLine:o}}}return null}function id(n,e){let t=n.split(`
`).map(f=>/^\s*#/.test(f)?"":f).join(`
`),r=[],i="",s=[],o=[],a=[],c=0,l=e,p=e,u=()=>{r.push({code:i,before:s,trailingPrevious:o,trailingOwn:a,line:p}),i="",s=[],o=[],a=[]};for(let f=0;f<t.length;f++){let h=t[f];if(h===`
`){l++,i+=" ";continue}if(h==="/"&&t[f+1]==="*"){let E=t.indexOf("*/",f+2),b=E<0?t.length:E+2,_=t.slice(f,b);/^\/\*[*!]</.test(_)?(i.trim()?a:o).push(_):/^\/\*[*!]/.test(_)&&s.push(_);for(let T of _)T===`
`&&l++;f=b-1;continue}if(h==="/"&&t[f+1]==="/"){let E=t.indexOf(`
`,f);f=(E<0?t.length:E)-1;continue}if(h==="("||h==="[")c++;else if(h===")"||h==="]")c--;else if(h===","&&c<=0){u();continue}!i.trim()&&h.trim()&&(p=l),i+=h}u();let d=f=>Ns(f.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],y=(f,h)=>{f&&h&&!f.brief&&(f.brief=Ve(d(h)))};for(let f of r){y(m[m.length-1],f.trailingPrevious[0]);let h=f.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!h)continue;let E=f.before[f.before.length-1],b=E?ws(d(E)):void 0,_=b?.brief??b?.detail??"",T={name:h[1],value:Ge(h[2]??""),brief:_,detail:b?.brief?b.detail??"":"",line:f.line};m.push(T),y(T,f.trailingOwn[0])}return m}function sd(n,e){let t=e,r=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||r.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let i=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];i.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:i.join(`
`),line:t}}function Ss(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=[],i=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,p=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){p=!0;break}if(!p)continue;let u=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),d={text:Ns(u),endLine:l},m=ws(d.text),y=Hl(d.text);if(y.length>0){let _;for(let T of y)switch(T.kind){case"define":{let v={id:T.id,title:T.title,header:e},k=m.ingroup??s[s.length-1];k&&(v.parent=k),i.push(v),_=T.id;break}case"add":_=T.id;break;case"open":s.push(_??s[s.length-1]??""),_=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let f=sd(t,l+1);if(!f){o=l;continue}let h=nd(f.text);if(!h){o=l;continue}let E=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],b={name:h.name,kind:h.kind,signature:h.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:f.line+1,deprecated:m.deprecated};if(m.brief&&(b.brief=m.brief),m.detail&&(b.detail=m.detail),E&&(b.group=E),m.since&&(b.since=m.since),r.push(b),o=l,h.kind==="enum"&&f.text.includes("{")){let _=rd(t,f.line);if(_){for(let T of id(_.body,_.line)){let v={name:T.name,kind:"enumvalue",signature:T.value?`${T.name} = ${T.value}`:T.name,params:[],returns:[],retvals:[],header:e,line:T.line+1,deprecated:!1,parentSymbol:h.name};T.brief&&(v.brief=T.brief),T.detail&&(v.detail=T.detail),E&&(v.group=E),r.push(v)}o=_.endLine}}}return{symbols:r,groups:i}}import{existsSync as fd}from"node:fs";import{join as Vt}from"node:path";import{spawnSync as As}from"node:child_process";import{existsSync as ar,readFileSync as od,realpathSync as ad}from"node:fs";import{delimiter as cd,join as ld,resolve as dd}from"node:path";function vs(n,e){if(n.includes("/")||n.includes("\\"))return ar(n)?dd(n):void 0;for(let t of(e??"").split(cd).filter(Boolean)){let r=ld(t,n);if(ar(r))return r}}function ud(n){let e=vs("west",n.PATH);if(e)try{let r=(od(ad(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return r?r[1]?.endsWith("/env")&&r[2]?vs(r[2].trim().split(/\s+/,1)[0],n.PATH):r[1]&&ar(r[1])?r[1]:void 0:void 0}catch{return}}function cr(n){return[n.PYTHON_EXECUTABLE,ud(n),"python3","python"].filter((e,t,r)=>!!e&&r.indexOf(e)===t)}function ks(n){let e=new Map;for(let t of n.split(/\r?\n/)){let r=t.split("#")[0].trim();if(r===""||r.startsWith("-"))continue;let[i,...s]=r.split(";"),o=i.split("[")[0].split(/[<>=!~]/)[0].trim();if(o==="")continue;let a=s.join(";").trim();e.has(o)||e.set(o,{name:o,...a?{marker:a}:{}})}return[...e.values()]}function Gt(n=process.env){for(let e of cr(n))if(As(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function De(n,e=process.env){let t=Vt(n,"scripts","kconfig"),r=Vt(n,"scripts","dts","python-devicetree","src");if([Vt(t,"kconfiglib.py"),Vt(r,"devicetree","edtlib.py")].filter(a=>!fd(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=cr(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(r)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(As(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}import{existsSync as pd,readdirSync as md}from"node:fs";import{join as hd,relative as gd,sep as Ls}from"node:path";var yd=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function*re(n,e={}){if(!pd(n))return;let t=e.skipDirs??yd,r=e.skipPrefixes??[],i=[n];for(;i.length>0;){let s=i.pop(),o;try{o=md(s,{withFileTypes:!0})}catch(a){throw new Error(`Failed to read source directory ${s}: ${a instanceof Error?a.message:String(a)}`)}for(let a of o){let c=hd(s,a.name),l=Te(gd(n,c));if(a.isDirectory()){if(t.has(a.name)||r.some(p=>l===p||l.startsWith(`${p}/`)))continue;i.push(c)}else if(a.isFile()){if(r.some(p=>l.startsWith(`${p}/`))||e.match&&!e.match(a.name))continue;yield l}else if(a.isSymbolicLink())throw new Error(`Refusing symbolic link in indexed source tree: ${c}`)}}}function Te(n){return Ls==="/"?n:n.split(Ls).join("/")}function Rs(n){let e=lr(n),t=e;try{t=_d(e)}catch{}return[...new Set([e,t])].flatMap(r=>[lr(r,"..","doxygen","xml"),lr(r,"doc","_build","doxygen","xml")]).find(r=>Os(Pe(r,"index.xml")))}function vd(n,e){if(!Os(Pe(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=bd(Pe(wd(),"zephyr-ai-api-")),r=Pe(t,"api-export.py");try{Nd(r,Ts,{mode:384});let i=Sd(Gt(),[r,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(i.status!==0){let o=i.stderr?.trim()??"";try{let a=JSON.parse(i.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(p=>`- ${p.code}: ${p.message}${p.path?` (${p.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(i.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s}finally{Td(t,{recursive:!0,force:!0})}}function xs(n,e){if(e)return vd(n,e);let t=Pe(n,"include","zephyr"),r=[],i=[],s=[],o=[...re(t,{skipPrefixes:["internal","arch/arm/internal"],match:c=>c.endsWith(".h")})].sort();for(let c of o){let l;try{l=Ed(Pe(t,c),"utf8")}catch(d){throw new Error(`Cannot read public API header ${Pe(t,c)}: ${d instanceof Error?d.message:String(d)}`)}let p=`include/zephyr/${c}`,u=Ss(l,p);for(let d of u.symbols){if(d.kind==="function"&&d.signature.includes("=")){s.push({path:`${p}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let m=d.signature.indexOf("["),y=d.signature.indexOf("(");if(d.kind==="function"&&m>=0&&(y<0||m<y)){s.push({path:`${p}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){s.push({path:`${p}:${d.line}`,reason:"fallback-include-guard"});continue}r.push(d)}i.push(...u.groups)}r.sort(ue(c=>c.name));let a=new Map;for(let c of i)(!a.has(c.id)||c.title&&!a.get(c.id).title)&&a.set(c.id,c);return{symbols:r,groups:[...a.values()],mode:"header-fallback",report:{discovered:r.length+a.size+s.length+1,indexed:r.length+a.size,intentionallyExcluded:[...s,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as Ad,mkdtempSync as Ld,rmSync as Od,writeFileSync as Rd}from"node:fs";import{tmpdir as xd}from"node:os";import{dirname as Cs,join as dr}from"node:path";import{spawnSync as Id}from"node:child_process";var Is=`#!/usr/bin/env python3
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
`;var Ds=new Map;function Ps(n){let e=JSON.stringify(n),t=Ds.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let r=Cs(Cs(n[0])),i=dr(r,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!Ad(i))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=Ld(dr(xd(),"zephyr-ai-bindings-")),o=dr(s,"binding-export.py");try{Rd(o,Is,{mode:384});let a=[o,"--zephyr",r];for(let p of n)a.push("--root",p);let c=Id(De(r),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let p="";try{p=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let u=p||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${u}`)}let l=JSON.parse(c.stdout);return Ds.set(e,l),l}finally{Od(s,{recursive:!0,force:!0})}}var vc=or(Gn(),1);import{existsSync as ah,readFileSync as ch,readdirSync as lh}from"node:fs";import{dirname as zi,join as ye}from"node:path";import{spawnSync as dh}from"node:child_process";function Yi(n){try{let e=(0,vc.parse)(ch(n,"utf8"),{logLevel:"silent"});if(!e||typeof e!="object"||Array.isArray(e))throw new Error("expected a YAML mapping");return e}catch(e){throw new Error(`Failed to parse board/SoC metadata ${n}: ${e.message}`)}}function le(n){return Array.isArray(n)?n:[]}function Mt(n){return le(n).filter(e=>typeof e=="string")}function uh(n){let e=ye(n,"scripts","list_boards.py");if(!ah(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let i of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(i&&(t=dh(i,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let r=new Map;for(let i of t.stdout.split(`
`).filter(Boolean)){let s=i.split("@@").filter(Boolean).map(p=>p.split(";")),o=p=>s.find(([u])=>u===p)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),r.set(a,c)}return r}function fh(n){let e=[],t;try{t=lh(n)}catch{return e}for(let r of t){if(!r.endsWith(".yaml")&&!r.endsWith(".yml")||r==="board.yml"||r==="board.yaml")continue;let i=Yi(ye(n,r)),s={toolchains:Mt(i.toolchain),supported:Mt(i.supported),...typeof i.name=="string"?{name:i.name}:{},...typeof i.arch=="string"?{arch:i.arch}:{},...typeof i.type=="string"?{type:i.type}:{},...typeof i.ram=="number"?{ram:i.ram}:{},...typeof i.flash=="number"?{flash:i.flash}:{},...typeof i.vendor=="string"?{vendor:i.vendor}:{}};typeof i.identifier=="string"&&e.push({identifier:i.identifier,...s});let o=i.variants&&typeof i.variants=="object"&&!Array.isArray(i.variants)?i.variants:{};for(let[a,c]of Object.entries(o)){let l=c&&typeof c=="object"&&!Array.isArray(c)?c:{};e.push({identifier:a,...s,toolchains:Mt(l.toolchain).length?Mt(l.toolchain):s.toolchains,supported:[...new Set([...s.supported,...Mt(l.supported)])]})}}return e.sort(ue(r=>r.identifier)),e}function kc(n){let e=[],t=uh(n);for(let r of re(ye(n,"boards"),{match:i=>i==="board.yml"||i==="board.yaml"})){let i=ye(n,"boards",r),s=Yi(i),o=[],a=s.board;a&&typeof a=="object"&&!Array.isArray(a)&&o.push(a);for(let y of le(s.boards))y&&typeof y=="object"&&!Array.isArray(y)&&o.push(y);if(o.length===0)continue;let c=zi(i),l=Te(ye("boards",zi(r))),p=fh(c),u=[...re(ye(c,"doc"),{match:y=>y.endsWith(".rst")})].sort(),d=u.includes("index.rst")?"index.rst":u.sort()[0],m=d?`${l}/doc/${d}`:void 0;for(let y of o){if(typeof y.name!="string")continue;let f=y.name,h=le(y.socs).flatMap(R=>{if(!R||typeof R!="object")return[];let Z=R;return typeof Z.name!="string"?[]:[{name:Z.name,variants:le(Z.variants).flatMap(J=>J&&typeof J=="object"&&typeof J.name=="string"?[J.name]:[]),cpuclusters:le(Z.cpuclusters).flatMap(J=>J&&typeof J=="object"&&typeof J.name=="string"?[J.name]:[])}]}),E=p.filter(R=>R.identifier===f||R.identifier.startsWith(`${f}/`)),b=t.get(f);if(!b)throw new Error(`Zephyr's board model did not enumerate ${f}.`);let _=b.qualifiers.length>0?b.qualifiers:[""],T=_.map(R=>R?`${f}/${R}`:f);for(let R of b.revisions)T.push(..._.map(Z=>Z?`${f}@${R}/${Z}`:`${f}@${R}`));let v=T.map(R=>({identifier:R,toolchains:[],supported:[]})),k=E.length>0?E:o.length===1?p:[],A=new Map(v.map(R=>[R.identifier,R]));for(let R of k){let Z=A.get(R.identifier);A.set(R.identifier,Z?{...Z,...R}:R)}let N=[...A.values()].sort((R,Z)=>ct(R.identifier,Z.identifier)),S={name:f,dir:l,socs:h,targets:N,revisions:b.revisions,supported:[...new Set(N.flatMap(R=>R.supported))].sort()};typeof y.full_name=="string"&&(S.fullName=y.full_name),typeof y.vendor=="string"&&(S.vendor=y.vendor),b.defaultRevision&&(S.defaultRevision=b.defaultRevision),m&&(S.docPath=m);let P=N.find(R=>R.arch)?.arch;P&&(S.arch=P);let W=N.find(R=>R.ram!==void 0)?.ram;W!==void 0&&(S.ram=W);let U=N.find(R=>R.flash!==void 0)?.flash;U!==void 0&&(S.flash=U),e.push(S)}}return e.sort(ue(r=>r.name)),e}function Ac(n){let e=[];for(let t of re(ye(n,"soc"),{match:r=>r==="soc.yml"||r==="soc.yaml"})){let r=ye(n,"soc",t),i=Yi(r),s=Te(ye("soc",zi(t))),o=t.includes("/")?t.split("/")[0]:void 0,a=(l,p,u)=>{if(typeof l.name!="string")return;let d={name:l.name,dir:s,cpuclusters:le(l.cpuclusters).flatMap(m=>m&&typeof m=="object"&&typeof m.name=="string"?[m.name]:[])};p&&(d.family=p),u&&(d.series=u),o&&(d.vendor=o),e.push(d)};(l=>{for(let p of l){if(!p||typeof p!="object")continue;let u=p,d=typeof u.name=="string"?u.name:void 0;for(let m of le(u.socs))m&&typeof m=="object"&&a(m,d);for(let m of le(u.series)){if(!m||typeof m!="object")continue;let y=m,f=typeof y.name=="string"?y.name:void 0;for(let h of le(y.socs))h&&typeof h=="object"&&a(h,d,f)}}})(le(i.family));for(let l of le(i.socs))l&&typeof l=="object"&&a(l)}return e.sort(ue(t=>t.name)),e}import{existsSync as bh,lstatSync as Eh,readFileSync as Dc,realpathSync as Ji}from"node:fs";import{dirname as _h,extname as Th,join as Rc,relative as Hi,resolve as Nh,sep as xc}from"node:path";var ph="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function Jn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!ph.includes(t))return null;for(let r of e)if(r!==t)return null;return{char:t,length:e.length}}function mh(n){let e=[];for(let t=0;t<n.length;t++){let r=Jn(n[t]);if(!r)continue;let i=n[t-1];if(i===void 0)continue;let s=i.trim();if(s===""||r.length<s.length)continue;if(Jn(i)){if(Jn(n[t-2]??""))continue;continue}let o=Jn(n[t-2]??""),a=o!==null&&o.char===r.char;e.push({line:t-1,text:s,char:r.char,overlined:a})}return e}function hh(n){let e=[];return n.map(t=>{let r=t.overlined?`over:${t.char}`:t.char,i=e.indexOf(r);return i===-1&&(i=e.length,e.push(r)),i})}var Gi=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function Lc(n){let e=n.split(`
`),t=[],r=s=>t.push({code:!1,text:s}),i=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(Gi.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",p=""]=a,u=c.length,d=l.toLowerCase(),m=[],y=s+1;for(;y<e.length;y++){let f=e[y];if(f.trim()===""){m.push("");continue}if(f.match(/^\s*/)[0].length<=u)break;m.push(f)}if(i.has(d)){s=y-1;continue}if(d==="code-block"||d==="code"||d==="literalinclude"){let f=p.trim(),h=Vi(m).join(`
`).replace(/^\n+|\n+$/g,"");h&&t.push({code:!0,text:`\`\`\`${f}
${h}
\`\`\``}),s=y-1;continue}if(d==="note"||d==="warning"||d==="important"||d==="tip"){let f=Vi(m).join(`
`).trim();f&&r(`${l.toUpperCase()}: ${f}`),s=y-1;continue}p.trim()&&r(p.trim());for(let f of Vi(m))r(f);s=y-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||r(o)}return t.map(s=>s.code?s.text:gh(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function Vi(n){let e=n.filter(r=>r.trim()!=="").map(r=>r.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(r=>r.trim()===""?"":r.slice(t))}function gh(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function Oc(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),r=[];for(let l of t){let p=l.match(Gi);p&&r.push(p[1].trim())}let i=mh(t),s=hh(i);if(i.length===0){let l=Lc(e);return{title:"",labels:r,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=i[0].text,a=[],c=[];for(let l=0;l<i.length;l++){let p=i[l],u=s[l],d=i[l+1];for(;c.length>0&&c[c.length-1].level>=u;)c.pop();c.push({level:u,text:p.text});let m=p.line+2,y=d?d.line-(d.overlined?1:0):t.length,f=t.slice(m,Math.max(m,y)).join(`
`),h=Lc(f),E=yh(t,p.line-(p.overlined?1:0));(h||l===0)&&a.push({...E?{anchor:E}:{},heading:p.text,headingPath:c.map(b=>b.text),ord:a.length,body:h})}return{title:o,labels:r,chunks:a}}function yh(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let r=n[t];if(r.trim()==="")continue;let i=r.match(Gi);return i?i[1].trim():void 0}}var wh=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function Sh(n,e){let t=n.replace(/\.rst$/,""),r=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${r}.html`}function Ic(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function vh(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function kh(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let r=0;r<e.length;r++){let i=e[r].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!i)continue;let s=i[1].length;for(r+=1;r<e.length;r++){let o=e[r];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){r-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),p=(l?.[2]??c).replace(/\.rst$/,""),u=l?.[1]?.trim()||p.split("/").filter(Boolean).at(-1)?.replace(/^index$/,p.split("/").at(-2)??"index").replace(/[_-]/g," ");p&&u&&t.push(`${u} (${p})`)}}return[...new Set(t)]}function Ah(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function Lh(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=1,i=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(r=s),Number.isInteger(o)&&o>=r&&(i=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(p=>p.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);r=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((p,u)=>u>=r-1&&p.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);i=l+(e["end-at"]?1:0)}return t=t.slice(r-1,i),{text:t.join(`
`),start:r,end:i}}function Wi(n,e,t,r,i=[]){let s=Ji(e);if(i.includes(s))throw new Error(`include cycle: ${[...i,s].map(l=>Hi(n,l)).join(" -> ")}`);let o=[...i,s],a=t.replace(/\r\n?/g,`
`).split(`
`),c=[];for(let l=0;l<a.length;l++){let p=a[l],u=p.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!u){c.push(p);continue}let d=u[1].length,m=u[2],y=u[3].trim(),f=[],h=l+1;for(;h<a.length;h++){let A=a[h];if(A.trim()===""){f.push(A);continue}if(A.match(/^\s*/)[0].length<=d)break;f.push(A)}if(l=h-1,m==="only"){if(/\bhtml\b/.test(y)){let A=f.map(S=>S.trim()?S.slice(Math.min(S.length,d+3)):""),N=Wi(n,s,A.join(`
`),r,i);c.push(...N.split(`
`).map(S=>`${" ".repeat(d)}${S}`))}continue}let E=Ah(f),b=Nh(_h(s),y);if(!bh(b))throw new Error(`include target not found: ${y}`);if(Eh(b).isSymbolicLink())throw new Error(`include target is a symbolic link: ${y}`);let _=Ji(n),T=Ji(b),v=Hi(_,T);if(v===".."||v.startsWith(`..${xc}`))throw new Error(`include escapes the Zephyr tree: ${y}`);let k=Lh(Dc(T,"utf8"),E);if(r.push({path:Hi(_,T).replaceAll(xc,"/"),startLine:k.start,endLine:k.end,directive:m}),m==="literalinclude"){let A=E.language??Th(b).slice(1);c.push(`${" ".repeat(d)}.. code-block:: ${A}`,"",...k.text.split(`
`).map(N=>`${" ".repeat(d+3)}${N}`))}else{let A=Wi(_,T,k.text,r,o);c.push(...A.split(`
`).map(N=>`${" ".repeat(d)}${N}`))}}return c.join(`
`)}function Cc(n,e,t,r){let i=[],s=Rc(n,e),o=[...re(s,{skipDirs:wh,match:a=>a.endsWith(".rst")})].sort();for(let a of o){let c=`${e}/${a}`,l=Rc(s,a);r.discovered++;try{let p=Dc(l,"utf8"),u=[{path:c,startLine:1,endLine:p.split(/\r?\n/).length,directive:"page"}],d=Wi(n,l,p,u),m=Oc(d),y=m.chunks.filter(f=>f.body.trim()!=="").map((f,h)=>({...f,ord:h}));if(y.length===0){let f=kh(d);if(f.length>0){let h=m.title||Ic(c);y=[{heading:h,headingPath:[h],ord:0,body:`Contained documentation pages:
${f.map(E=>`- ${E}`).join(`
`)}`}]}}if(y.length===0){r.intentionallyExcluded.push({path:c,reason:"no-retrievable-content"});continue}i.push({path:c,url:Sh(c,t),title:m.title||Ic(c),area:vh(c),labels:m.labels,chunks:y,origins:u}),r.indexed++}catch(p){r.errors.push({path:c,code:"rst-preprocess",message:p.message})}}return i}function Pc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},r=[...Cc(n,"doc",e,t),...Cc(n,"boards",e,t)];if(t.errors.length>0){let i=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${i}`)}return{pages:r,report:t}}import{existsSync as Rh,mkdtempSync as xh,rmSync as Ih,writeFileSync as Ch}from"node:fs";import{tmpdir as Dh}from"node:os";import{join as Hn}from"node:path";import{spawnSync as Ph}from"node:child_process";var $c=`#!/usr/bin/env python3
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
`;var qc=new Map,$h={zephyr:"Kconfig",sysbuild:"share/sysbuild/Kconfig"};function Zi(n,e=[],t="zephyr"){let r=JSON.stringify([n,[...e].sort(),t]),i=qc.get(r);if(i)return i;let s=Hn(n,"scripts","kconfig","kconfiglib.py");if(!Rh(s))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let o=xh(Hn(Dh(),"zephyr-ai-kconfig-")),a=Hn(o,"kconfig-export.py"),c=Hn(o,"generated");try{Ch(a,$c,{mode:384});let l=[a,"--zephyr",n,"--build-dir",c,"--root",$h[t]];for(let m of e)l.push("--module",m);let p=Ph(De(n),l,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(p.status!==0){let m=p.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${m}`)}let u=JSON.parse(p.stdout),d={symbols:u.symbols,choices:u.choices,filesScanned:u.files.length,warnings:u.warnings};return qc.set(r,d),d}finally{Ih(o,{recursive:!0,force:!0})}}var Bc=or(Gn(),1);import{existsSync as Zn,readFileSync as Fc,statSync as qh}from"node:fs";import{dirname as Uc,join as Ke}from"node:path";var Uh=64*1024,Mh=160*1024;function Kc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var Mc={"sample.yaml":"sample","testcase.yaml":"test"};function Fh(n,e){let t=[],r=[],i=Mh;for(let s of e){if(!Kc(s))continue;let o=Ke(n,s);try{if(qh(o).size>Uh){r.push({path:s,reason:"file-size-limit"});continue}let a=Fc(o,"utf8");if(Buffer.byteLength(a)>i){r.push({path:s,reason:"sample-size-budget"});continue}i-=Buffer.byteLength(a),t.push({path:s,text:a})}catch(a){throw new Error(`Failed to capture sample file ${o}: ${a.message}`)}}return{contents:t,exclusions:r}}function Bh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function Wn(n){return Bh(n).filter(e=>typeof e=="string")}function Kh(n){let e=[],t=r=>{Zn(Ke(n,r))&&e.push(r)};for(let r of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])t(r);for(let r of["src","boards","snippets"]){let i=Ke(n,r);if(Zn(i))try{e.push(...[...re(i,{match:s=>Kc(`${r}/${s}`)})].sort().map(s=>`${r}/${s}`))}catch{}}return e}function jc(n){let e=[],t=new Set;for(let r of["samples","snippets","tests"]){let i=Ke(n,r);if(Zn(i))for(let s of[...re(i,{match:o=>Object.hasOwn(Mc,o)})].sort()){let o=Ke(i,s),a=s.split("/").pop(),c=Mc[a],l=null;try{let S=(0,Bc.parse)(Fc(o,"utf8"),{logLevel:"silent"});if(!S||typeof S!="object"||Array.isArray(S))throw new Error("expected a YAML mapping");l=S}catch(S){throw new Error(`Failed to parse ${a} metadata ${s}: ${S.message}`)}let p=Uc(o),u=Te(Ke(r,Uc(s)));if(t.has(u))continue;t.add(u);let d=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},y=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},f=new Set,h=new Set,E=new Set,b=new Set,_=S=>{for(let P of Wn(S.tags))f.add(P);if(typeof S.tags=="string")for(let P of S.tags.split(/\s+/).filter(Boolean))f.add(P);for(let P of Wn(S.depends_on))h.add(P);for(let P of Wn(S.integration_platforms))E.add(P);for(let P of Wn(S.platform_allow))b.add(P)};_(y);for(let S of Object.values(m))!S||typeof S!="object"||_({...y,...S});let T=Kh(p),{contents:v,exclusions:k}=Fh(p,T),A=v.map(S=>S.path),N={path:u,kind:c,name:typeof d.name=="string"?d.name:u.split("/").pop(),tags:[...f].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...h].sort(),integrationPlatforms:[...E].sort(),platformAllow:[...b].sort(),files:A,contents:v,exclusions:k};typeof d.description=="string"&&(N.description=d.description),Zn(Ke(p,"README.rst"))&&(N.docPath=`${u}/README.rst`),e.push(N)}}return e.sort(ue(r=>r.path)),e}var Vc=or(Gn(),1);import{existsSync as Qn,mkdtempSync as Xh,readFileSync as Qi,rmSync as zh,writeFileSync as Yh}from"node:fs";import{tmpdir as Vh}from"node:os";import{join as Ie}from"node:path";import{spawnSync as Gh}from"node:child_process";var Xc=`#!/usr/bin/env python3
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
`;function Jh(n){let e="",t=!1;for(let r=0;r<n.length;r++){let i=n[r];if(t){e+=i,i==="\\"?(e+=n[r+1]??"",r++):i==='"'&&(t=!1);continue}if(i==='"'){t=!0,e+=i;continue}if(i==="#"){for(;r<n.length&&n[r]!==`
`;)r++;e+=`
`;continue}e+=i}return e}function Hh(n){let e=[],t="",r=!1,i=!1;for(let s=0;s<n.length;s++){let o=n[s];if(r){o==="\\"?(t+=n[s+1]??"",s++):o==='"'?r=!1:t+=o;continue}if(o==='"'){r=!0,i=!0;continue}if(/\s/.test(o)){i&&e.push(t),t="",i=!1;continue}t+=o,i=!0}return i&&e.push(t),e}function zc(n){return n.replace(/\s+/g," ").trim()}function Wh(n){return n.predicate}function Gc(n){let e=Jh(n),t=[],r=[],i=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,s;for(;(s=i.exec(e))!==null;){let o=s[1].toLowerCase(),a=1,c=s.index+s[0].length,l=!1;for(;c<e.length&&a>0;c++){let d=e[c];if(l){d==="\\"?c++:d==='"'&&(l=!1);continue}d==='"'?l=!0:d==="("?a++:d===")"&&a--}if(a!==0)break;let p=e.slice(s.index+s[0].length,c-1);if(i.lastIndex=c,o==="if"){let d=zc(p);r.push({taken:[d],predicate:d});continue}if(o==="elseif"||o==="else"){let d=r[r.length-1];if(!d)continue;let m=zc(p),y=d.taken.map(f=>`NOT (${f})`).join(" AND ");d.predicate=o==="else"?y||null:y?`(${m}) AND ${y}`:m,o==="elseif"&&d.taken.push(m);continue}if(o==="endif"){r.pop();continue}let u=r.map(Wh).filter(d=>!!d);t.push({name:o,args:Hh(p),...u.length>0?{guard:u.join(" AND ")}:{}})}return t}function je(n,e,t){let r=n.declaredIn.get(e);r?r.add(t):n.declaredIn.set(e,new Set([t]))}function Yc(n,e,t,r){let i=n.args.get(e)??[];for(let s of t)i.push({value:s,...r?{guard:r}:{},unresolved:s.includes("${")});n.args.set(e,i)}function Jc(n,e,t,r,i){if(r.has(e))return;r.add(e);let s=Ie(n,e);if(!Qn(s))return;let o;try{o=Gc(Qi(s,"utf8"))}catch(a){i.push({path:e,code:"cmake-parse",message:a.message});return}for(let a of o){let[c,...l]=a.args;switch(a.name){case"include":{if(!c)break;let p=c.startsWith("${ZEPHYR_BASE}/")?c.slice(15):null;p&&Jc(n,p,t,r,i);break}case"board_finalize_runner_args":{if(!c)break;t.finalized.add(c),je(t,c,e),Yc(t,c,l,a.guard);break}case"board_runner_args":{if(!c)break;je(t,c,e),Yc(t,c,l,a.guard);break}case"board_set_flasher_ifnset":{c&&t.flashDefault===void 0&&(t.flashDefault=c,je(t,c,e));break}case"board_set_debugger_ifnset":{c&&t.debugDefault===void 0&&(t.debugDefault=c,je(t,c,e));break}case"board_set_flasher":{c&&(t.flashDefault=c,je(t,c,e));break}case"board_set_debugger":{c&&(t.debugDefault=c,je(t,c,e));break}default:break}}}function Zh(n,e){let t=[],r=Ie(n,"soc");if(!Qn(r))return t;let i=[...re(r,{match:s=>s==="CMakeLists.txt"||s.endsWith(".cmake")})].sort();for(let s of i){let o=Te(Ie("soc",s)),a=Qi(Ie(r,s),"utf8");if(!a.includes("board_finalize_runner_args"))continue;let c;try{c=Gc(a)}catch(l){e.push({path:o,code:"cmake-parse",message:l.message});continue}for(let l of c){if(l.name!=="board_finalize_runner_args")continue;let[p,...u]=l.args;p&&t.push({path:o,runner:p,args:u.map(d=>({value:d,...l.guard?{guard:l.guard}:{},unresolved:d.includes("${")}))})}}return t}function Hc(n){let e=Xh(Ie(Vh(),"zephyr-ai-runners-")),t=Ie(e,"runner-export.py");try{Yh(t,Xc,{mode:384});let r=Gh(Gt(),[t,"--zephyr",n],{encoding:"utf8",maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let i=r.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`The west runner catalogue could not be exported:
${i}`)}return JSON.parse(r.stdout)}finally{zh(e,{recursive:!0,force:!0})}}function Wc(n){let e=Ie(n,"scripts","west-commands.yml");if(!Qn(e))return[];let t=(0,Vc.parse)(Qi(e,"utf8"),{logLevel:"silent"});if(!t||typeof t!="object")return[];let r=t["west-commands"];if(!Array.isArray(r))return[];let i=[];for(let s of r){if(!s||typeof s!="object")continue;let o=s,a=typeof o.file=="string"?o.file:"";for(let c of Array.isArray(o.commands)?o.commands:[]){if(!c||typeof c!="object")continue;let l=c;typeof l.name=="string"&&i.push({name:l.name,className:typeof l.class=="string"?l.class:"",file:a,...typeof l.help=="string"?{help:l.help}:{}})}}return i.sort(ue(s=>s.name))}function Zc(n,e){let t=[],r=Zh(n,t),i=[],s=0;for(let l of e){let p=`${l.dir}/board.cmake`,u={finalized:new Set,args:new Map,declaredIn:new Map};Qn(Ie(n,p))?Jc(n,p,u,new Set,t):s++;for(let m of r){if(!l.socDirs.some(f=>f&&m.path.startsWith(`${f}/`)))continue;u.finalized.add(m.runner),je(u,m.runner,m.path);let y=u.args.get(m.runner)??[];y.push(...m.args),u.args.set(m.runner,y)}let d=new Set(u.finalized);u.flashDefault&&d.add(u.flashDefault),u.debugDefault&&d.add(u.debugDefault);for(let m of[...d].sort())i.push({board:l.name,runner:m,available:u.finalized.has(m),flashDefault:u.flashDefault===m,debugDefault:u.debugDefault===m,args:u.args.get(m)??[],declaredIn:[...u.declaredIn.get(m)??[]].sort()})}let o=new Set(i.map(l=>l.board)),a=e.filter(l=>!o.has(l.name)).length,c=[];return s>0&&c.push({path:"boards",code:"no-board-cmake",message:`${s} boards ship no board.cmake`}),a>0&&c.push({path:"boards",code:"no-runner-declared",message:`${a} boards declare no runner; report this as undeclared, never as unsupported`}),{boardRunners:i,report:{discovered:i.length,indexed:i.length,intentionallyExcluded:[],warnings:c,errors:t}}}import{createHash as ts}from"node:crypto";import{existsSync as tr,readFileSync as er,realpathSync as Ft,statSync as ag}from"node:fs";import{basename as el,dirname as cg,join as Xe,relative as lg,resolve as dg}from"node:path";import{spawnSync as nl}from"node:child_process";import{createHash as Qh}from"node:crypto";import{existsSync as eg,lstatSync as tg,readFileSync as ng,readlinkSync as rg,realpathSync as ig}from"node:fs";import{join as sg}from"node:path";import{spawnSync as og}from"node:child_process";function es(n,e){let t=og("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function Qc(n){let e=ig(n),t=es(e,["rev-parse","HEAD"]);if(!t)return null;let r=es(e,["diff","--binary","HEAD"])??"",i=(es(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=sg(e,s);if(!eg(o))return{path:s,missing:!0};try{let a=tg(o);return a.isSymbolicLink()?{path:s,symlink:rg(o)}:a.isFile()?{path:s,sha256:Qh("sha256").update(ng(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(r||i.length),stateFingerprint:Ce({commit:t,diff:r,untracked:i})}}function ug(n,e){let t=nl("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function fg(n){let e=er(Xe(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",r=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),i=t("EXTRAVERSION");return i?`${r}-${i}`:r}function pg(n){let e=dg(n);for(;;){if(tr(Xe(e,".west","config")))return e;let t=cg(e);if(t===e)return;e=t}}function mg(n){if(!n)return;let e=nl("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return ts("sha256").update(e.stdout).digest("hex");let t="",r="west.yml";try{let o=er(Xe(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",r=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??r}catch{}let s=[...t?[Xe(n,t,r)]:[],Xe(n,"west.yml"),Xe(n,"west.yaml")].find(tr);return s?ts("sha256").update(er(s)).digest("hex"):void 0}function tl(n){let e=Ft(n),t=Qc(e);if(t)return{name:el(e),...t};let r=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(i=>Xe(e,i)).filter(tr).map(i=>{let s=ag(i);return{path:lg(e,i),bytes:s.size,sha256:ts("sha256").update(er(i)).digest("hex")}});return{name:el(e),markers:r}}function rl(n){let e=Ft(n.zephyrRoot),t=n.projectRoot&&tr(n.projectRoot)?Ft(n.projectRoot):void 0,r=ug(e,["rev-parse","HEAD"]);if(!r)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let i=pg(t??e),s=mg(i),o=n.modules.map(d=>tl(d)),a=Ce(o),c=tl(e),l=String(c.stateFingerprint??Ce(c)),p=n.pinnedCommit===r&&c.dirty===!1?"pinned-upstream":i?"west-workspace":"explicit-tree",u={descriptorVersion:ms,schemaVersion:Yt,builderVersion:hs,sourceKind:p,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:fg(e),zephyrCommit:r,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:Ft(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:Ft(n.buildDirectory)}:{},...n.producer?{producer:n.producer}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index covering the application and sysbuild namespaces; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},west:{complete:!!n.westComplete,note:n.westComplete?void 0:"The west package was not importable when this index was built, so runners that import it \u2014 openocd among them \u2014 carry no capabilities."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...u,createdAt:new Date().toISOString(),contextFingerprint:ys(u)}}import{createHash as hg}from"node:crypto";var gg=new Set(["built_at","index_descriptor","context_fingerprint","source_path","ingest_version","content_hash"]);function yg(n){return/_fts(_|$)/.test(n)||n.startsWith("sqlite_")}function il(n){let r=hg("sha256"),i=n.prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name").all().map(s=>s.name).filter(s=>!yg(s));for(let s of i){if(r.update(`table:${s}`),s==="meta"){let o=n.prepare("SELECT key, value FROM meta ORDER BY key").all();for(let a of o)gg.has(a.key)||r.update(`${a.key}\0${a.value}`);continue}for(let o of n.prepare(`SELECT * FROM "${s}" ORDER BY rowid`).all()){for(let a of Object.values(o))r.update(a===null?"\0null":String(a)),r.update("\0");r.update("")}}return r.digest("hex")}import{spawnSync as Eg}from"node:child_process";import{existsSync as ns,mkdirSync as _g,mkdtempSync as Tg,renameSync as Ng,rmSync as wg,writeFileSync as Sg}from"node:fs";import{dirname as sl,join as Bt,resolve as vg}from"node:path";var V={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var ol=V,al=".zephyr-ai-managed.json";function nr(n,e){return Eg("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function kg(n){if(!ns(Bt(n,".git"))||!ns(Bt(n,"VERSION")))return!1;let e=nr(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==V.commit)return!1;let t=nr(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(r=>r.endsWith(` ${al}`))}function cl(n,e){let t=vg(n,"sources",`zephyr-${V.version}-${V.commit.slice(0,12)}`);if(kg(t))return e(`Using pinned Zephyr ${V.version} checkout at ${t}`),t;if(ns(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${V.version}.`);_g(sl(t),{recursive:!0});let r=Tg(Bt(sl(t),".zephyr-ai-fetch-")),i=Bt(r,"zephyr");try{e(`Cloning pinned Zephyr ${V.version}; this requires network access and may take several minutes.`);let s=nr(["clone","--depth","1","--branch",V.tag,"--single-branch",V.repository,i]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=nr(["rev-parse","HEAD"],i);if(o.status!==0||o.stdout.trim()!==V.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${V.commit}.`);return Sg(Bt(i,al),`${JSON.stringify({owner:"zephyr-ai",repository:V.repository,tag:V.tag,commit:V.commit},null,2)}
`,{flag:"wx"}),Ng(i,t),e(`Pinned Zephyr ${V.version} is ready at ${t}`),t}finally{wg(r,{recursive:!0,force:!0})}}var ll={name:"@zephyr-ai/ingest",version:"0.6.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function Pg(n){let e=de(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??G(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requireWest:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let r=0;r<n.length;r++){let i=n[r];switch(i){case"--zephyr":t.zephyr=de(n[++r]);break;case"--out":t.out=de(n[++r]);break;case"--project-root":t.projectRoot=de(n[++r]);break;case"--plugin-data":t.pluginData=de(n[++r]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++r];break;case"--application":t.applicationRoot=de(n[++r]);break;case"--build-dir":t.buildDirectory=de(n[++r]);break;case"--api-xml":t.apiXml=de(n[++r]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-west":t.requireWest=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(de(n[++r]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${i}`)}}return t.zephyr=de(t.zephyr),t}function $g(){for(let n of[G(process.cwd(),"zephyr.lock.json"),G(process.cwd(),"..","..","zephyr.lock.json")])try{return JSON.parse(pl(n,"utf8"))}catch{}return{}}function rs(n){return n==null?null:JSON.stringify(n)}function qg(n){let e=G(n,"scripts","requirements-base.txt");return jt(e)?ks(pl(e,"utf8")):[]}function Ug(n,e){let t=(i,s)=>{let o=Dg(i,s,{encoding:"utf8",timeout:5e3});if(o.status===0)return`${o.stdout}${o.stderr}`.trim().split(`
`)[0]??void 0},r;try{r=t(De(n),["--version"])}catch{}return{node:process.version,sqlite:String(new hl(":memory:").prepare("SELECT sqlite_version() AS v").get()?.v??""),...r?{python:r}:{},...e?{doxygen:t("doxygen",["--version"])??"unknown"}:{},collator:new Intl.Collator().resolvedOptions().locale}}function ss(n){let e=xg(n,"r");try{Og(e)}finally{Lg(e)}}function fl(n){try{ss(n)}catch{}}function Mg(n,e){let t=Ig(n,{withFileTypes:!0}).filter(i=>i.isDirectory()&&/^[a-f0-9]{64}$/.test(i.name)).flatMap(i=>{let s=G(n,i.name),o=G(s,"zephyr.db");if(!jt(o))return[];let a=G(s,"last-used");return[{fingerprint:i.name,directory:s,usedAt:ml(jt(a)?a:o).mtimeMs}]}).sort((i,s)=>s.usedAt-i.usedAt),r=new Set([e,...t.filter(i=>i.fingerprint!==e).slice(0,4).map(i=>i.fingerprint)]);for(let i of t)r.has(i.fingerprint)||is(i.directory,{recursive:!0,force:!0})}function Fg(){let n=Pg(process.argv.slice(2)),e=$=>{n.quiet||process.stderr.write(`${$}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=cl(n.pluginData,e)}if(!jt(G(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(De(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let $=Rs(n.zephyr);$&&(n.apiXml=$,e(`Using auto-detected Doxygen XML from ${$}`))}let t=n.fetchPinned?ol:$g();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let r=Hc(n.zephyr);if(n.requireWest&&!r.complete)throw new Error("The west runner catalogue is incomplete: the selected interpreter cannot import the west package, which openocd needs, and hundreds of boards select openocd. An index built here would omit it without saying so. Install the tree's requirements (python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.");let i=rl({zephyrRoot:n.zephyr,westComplete:r.complete,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml,producer:Ug(n.zephyr,n.apiXml)}),s=i.zephyrVersion;if(n.requirePinned&&(!t.commit||i.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${i.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let o=`https://docs.zephyrproject.org/${s}/`,a,c=n.out;if(!c&&n.pluginData)if(i.projectRoot){let $=G(n.pluginData,"indexes","projects",gs(i.projectRoot));c=G($,i.contextFingerprint,"zephyr.db"),a=G($,"active.json")}else c=G(n.pluginData,"indexes","defaults",i.zephyrCommit,String(i.schemaVersion),"zephyr.db");c??=G(de(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${s} from ${n.zephyr}`);let l=Date.now(),p=Date.now(),{pages:u,report:d}=Pc(n.zephyr,o),m=u.reduce(($,ne)=>$+ne.chunks.length,0);e(`  docs      ${u.length} pages, ${m} sections (${Date.now()-p} ms)`);let y=Date.now(),f=new Map([["zephyr",Zi(n.zephyr,n.modules,"zephyr")],["sysbuild",Zi(n.zephyr,[],"sysbuild")]]),h=f.get("zephyr");e(`  kconfig   ${h.symbols.length} symbols from ${h.filesScanned} files, ${f.get("sysbuild").symbols.length} sysbuild (${Date.now()-y} ms)`);let E=Date.now(),b=[G(n.zephyr,"dts","bindings"),...n.modules.map($=>G($,"dts","bindings")).filter(jt)],{bindings:_,fragments:T,report:v}=Ps(b),k=$=>$.properties.length+$.children.reduce((ne,rr)=>ne+k(rr),0),A=_.reduce(($,ne)=>$+k(ne),0);e(`  bindings  ${_.length} compatibles, ${A} properties, ${T} fragments (${Date.now()-E} ms)`);let N=Date.now(),S=kc(n.zephyr),P=Ac(n.zephyr),W=S.reduce(($,ne)=>$+ne.targets.length,0);e(`  boards    ${S.length} boards, ${W} targets, ${P.length} SoCs (${Date.now()-N} ms)`);let U=Date.now(),R=new Map(P.map($=>[$.name,$.dir])),Z=Wc(n.zephyr),J=Zc(n.zephyr,S.map($=>({name:$.name,dir:$.dir,socDirs:[...new Set($.socs.map(ne=>R.get(ne.name)).filter(ne=>!!ne))]}))),ie={runners:r.runners,commands:Z,boardRunners:J.boardRunners};e(`  west      ${ie.runners.length} runners, ${ie.commands.length} commands, ${ie.boardRunners.length} board bindings${r.complete?"":", incomplete"} (${Date.now()-U} ms)`);let gl=Date.now(),be=jc(n.zephyr);e(`  samples   ${be.length} (${Date.now()-gl} ms)`);let yl=Date.now(),Ee=xs(n.zephyr,n.apiXml);e(`  api       ${Ee.symbols.length} symbols, ${Ee.groups.length} groups, ${Ee.mode} (${Date.now()-yl} ms)`),Rg(Kt(c),{recursive:!0});let ot=G(Kt(c),`.${ul()}.zephyr.db.tmp`),L,os=!1;try{L=new hl(ot),L.exec(Es);let $=Date.now();L.exec("BEGIN");let ne=L.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),rr=L.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),bl=L.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let g of u){let O=ne.run(g.path,g.url,g.title,g.area,JSON.stringify(g.labels)),M=Number(O.lastInsertRowid);for(let q of g.origins)bl.run(M,q.path,q.startLine,q.endLine,q.directive);for(let q of g.chunks)rr.run(M,q.anchor??null,q.heading,q.headingPath.join(" > "),q.ord,g.title,q.body)}for(let[g,O]of f){let M=L.prepare(`INSERT INTO kconfig
         (name, scope, type, prompt, help, defaults, depends, selects, implies, ranges,
          defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),q=L.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind, scope) VALUES (?, ?, ?, ?)"),ze=new Map;for(let x of O.symbols){let _e=x.definitions.flatMap(C=>C.defaults.map(F=>({value:F.value.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),K=x.definitions.map(C=>C.condition.display).filter((C,F,Bl)=>C!=="y"&&Bl.indexOf(C)===F),se=x.definitions.flatMap(C=>C.selects.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),Y=x.definitions.flatMap(C=>C.implies.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),sr=x.definitions.flatMap(C=>C.ranges.map(F=>({low:F.low.display,high:F.high.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),Ye=x.definitions.find(C=>C.prompt)?.prompt??"",Ml=x.definitions.find(C=>C.menuPath.length>0)?.menuPath.join(" > ")??"",Fl=M.run(x.name,g,x.type??null,Ye,x.help??"",JSON.stringify(_e),JSON.stringify(K),JSON.stringify(se),JSON.stringify(Y),JSON.stringify(sr),JSON.stringify(x.definitions.map(C=>({file:C.file,line:C.line}))),Ml,x.choice?1:0,x.choice??null,x.definitions.length,x.hasPrompt?1:0);ze.set(x.name,Number(Fl.lastInsertRowid));for(let C of se)q.run(x.name,C.value,"select",g);for(let C of Y)q.run(x.name,C.value,"imply",g);let fs=C=>[...C.kind==="symbol"&&C.value?[C.value]:[],...(C.children??[]).flatMap(fs)];for(let C of x.definitions)for(let F of fs(C.condition))q.run(x.name,F,"depends",g)}let ir=L.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),me=new Map,H=x=>{if(!x)return null;let _e=Q(x),K=me.get(_e);if(K!==void 0)return K;let se=x.children??[],Y=Number(ir.run(x.kind,x.value??null,x.display,H(se[0]??null),H(se[1]??null)).lastInsertRowid);return me.set(_e,Y),Y},X=L.prepare(`INSERT INTO kconfig_definition
         (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
          is_menuconfig, is_configdefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),at=L.prepare(`INSERT INTO kconfig_default
         (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),Xt=L.prepare(`INSERT INTO kconfig_relation
         (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?, ?)`),$l=L.prepare(`INSERT INTO kconfig_range
         (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?)`);for(let x of O.symbols){let _e=ze.get(x.name);for(let K of x.definitions){let se=Number(X.run(_e,K.file,K.line,K.prompt,JSON.stringify(K.menuPath),H(K.condition),H(K.promptCondition),K.isMenuconfig?1:0,K.isConfigDefault?1:0).lastInsertRowid);for(let Y of K.defaults)at.run(se,H(Y.value),H(Y.condition),Y.order);for(let[Y,sr]of[["select",K.selects],["imply",K.implies]])for(let Ye of sr)Xt.run(se,Y,Ye.target,ze.get(Ye.target)??null,H(Ye.condition),Ye.order);for(let Y of K.ranges)$l.run(se,H(Y.low),H(Y.high),H(Y.condition),Y.order)}}let ql=L.prepare("INSERT INTO kconfig_choice (stable_id, scope, name, type, definitions) VALUES (?, ?, ?, ?, ?)"),Ul=L.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let x of O.choices){let _e=Number(ql.run(x.id,g,x.name,x.type,JSON.stringify(x.definitions)).lastInsertRowid);for(let K of new Set(x.members)){let se=ze.get(K);se!==void 0&&Ul.run(_e,se)}}}let El=L.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),_l=L.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Tl=L.prepare("INSERT INTO text_pool (text) VALUES (?)"),as=new Map,Nl=g=>{if(!g)return null;let O=as.get(g);if(O!==void 0)return O;let M=Number(Tl.run(g).lastInsertRowid);return as.set(g,M),M};for(let g of _){let O=g.compatible,M=(me,H=0,X="")=>[...me.properties.map(at=>({level:H,childPath:X,property:at})),...me.children.flatMap((at,Xt)=>M(at,H+1,X?`${X}/${Xt}`:String(Xt)))],q=M(g),ze=El.run(O,g.path,g.description??"",g.bus===void 0||g.bus===null?null:typeof g.bus=="string"?g.bus:JSON.stringify(g.bus),g.onBus??null,JSON.stringify(g.cells),JSON.stringify(g.includes),q.map(({property:me})=>me.name).join(" "),q.length,O.includes(",")?O.split(",")[0]:null),ir=Number(ze.lastInsertRowid);for(let{level:me,childPath:H,property:X}of q)_l.run(ir,me,X.name,X.type??null,X.required?1:0,Nl(X.description),rs(X.default),rs(X.enum),rs(X.const),X.deprecated?1:0,X.specifierSpace??null,X.inheritedFrom??null,JSON.stringify(X.provenance??{}),JSON.stringify(X.constraints??{}),H)}let wl=L.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of S){let O=g.socs.map(M=>M.name);wl.run(g.name,g.fullName??"",g.vendor??"",g.dir,g.arch??null,g.ram??null,g.flash??null,JSON.stringify(g.socs),O.join(" "),JSON.stringify(g.targets),g.targets.map(M=>M.identifier).join(" "),JSON.stringify(g.revisions),g.defaultRevision??null,JSON.stringify(g.supported),g.supported.join(" "),g.docPath??null)}let Sl=L.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let g of P)Sl.run(g.name,g.series??null,g.family??null,g.vendor??null,g.dir,JSON.stringify(g.cpuclusters));let vl=L.prepare("INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)");for(let g of ie.runners)vl.run(g.name,g.module,g.description??null,Q(g.capabilities),JSON.stringify(g.capabilities.commands??[]));let kl=L.prepare("INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)");for(let g of ie.commands)kl.run(g.name,g.className,g.file,g.help??null);let Al=L.prepare(`INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`);for(let g of ie.boardRunners)Al.run(g.board,g.runner,g.available?1:0,g.flashDefault?1:0,g.debugDefault?1:0,JSON.stringify(g.args),JSON.stringify(g.declaredIn));let Ll=L.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Ol=L.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),cs=L.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let g of be){let O=Ll.run(g.path,g.kind,g.name,g.description??"",JSON.stringify(g.tags),g.tags.join(" "),JSON.stringify(g.scenarios),JSON.stringify(g.dependsOn),JSON.stringify(g.integrationPlatforms),JSON.stringify(g.platformAllow),JSON.stringify(g.files),g.docPath??null),M=Number(O.lastInsertRowid);for(let q of g.contents)Ol.run(M,q.path,q.text);for(let q of g.integrationPlatforms)cs.run(M,q,"integration");for(let q of g.platformAllow)cs.run(M,q,"allowlist")}let Rl=L.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of Ee.symbols)Rl.run(g.name,g.kind,g.signature,g.brief??"",g.detail??"",JSON.stringify(g.params),JSON.stringify(g.returns),JSON.stringify(g.retvals),g.group??null,g.since??null,g.deprecated?1:0,g.header,g.line,g.doxygenId??null,g.compoundId??null,g.docAnchor??null,g.parentSymbol??null);let xl=L.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let g of Ee.groups)xl.run(g.id,g.title,g.parent??null,g.header);let Il=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),Cl={schema_version:String(bs),zephyr_version:s,zephyr_commit:i.zephyrCommit,zephyr_tag:i.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:i.sourceKind,index_descriptor:Q(i),context_fingerprint:i.contextFingerprint,module_fingerprint:i.moduleFingerprint,doc_base_url:o,built_at:new Date().toISOString(),ingest_version:ll.version,count_docs:String(u.length),count_doc_chunks:String(m),report_docs:Q(d),count_kconfig:String(h.symbols.length),count_kconfig_sysbuild:String(f.get("sysbuild").symbols.length),report_kconfig:Q({discovered:[...f.values()].reduce((g,O)=>g+O.symbols.length+O.choices.length,0),indexed:[...f.values()].reduce((g,O)=>g+O.symbols.length+O.choices.length,0),intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts cover both Kconfig namespaces: the application tree and sysbuild."},...[...f].map(([g,O])=>({code:"source-files",message:`Kconfiglib evaluated ${O.filesScanned} source files for the ${g} namespace.`})),...[...f].flatMap(([g,O])=>O.warnings.map(M=>({code:"kconfiglib",message:`${g}: ${M}`})))],errors:[]}),count_bindings:String(_.length),count_dt_properties:String(A),report_bindings:Q(v),count_boards:String(S.length),count_board_targets:String(W),count_socs:String(P.length),report_boards:Q({discovered:S.length+W+P.length,indexed:S.length+W+P.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),python_requirements:Q(qg(n.zephyr)),count_runners:String(ie.runners.length),count_west_commands:String(ie.commands.length),count_board_runners:String(ie.boardRunners.length),report_west:Q({discovered:r.report.discovered+ie.commands.length+J.report.discovered,indexed:ie.runners.length+ie.commands.length+J.report.indexed,intentionallyExcluded:r.report.intentionallyExcluded,warnings:[...r.report.warnings,...J.report.warnings,{code:"report-units",message:"Counts include runner classes, west commands, and board-runner pairings."}],errors:[...r.report.errors,...J.report.errors]}),count_samples:String(be.length),report_samples:Q({discovered:be.length+be.reduce((g,O)=>g+O.contents.length+O.exclusions.length,0),indexed:be.length+be.reduce((g,O)=>g+O.contents.length,0),intentionallyExcluded:be.flatMap(g=>g.exclusions.map(O=>({path:`${g.path}/${O.path}`,reason:O.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(Ee.symbols.length),api_ingest_mode:Ee.mode,report_api:Q(Ee.report)};for(let[g,O]of Object.entries(Cl))Il.run(g,O);L.exec("COMMIT"),e(`  written   (${Date.now()-$} ms)`);let ls=il(L);L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)").run("content_hash",ls),e(`  content   ${ls.slice(0,16)}\u2026`);let Dl=Date.now();L.exec(_s),e(`  indexed   full-text (${Date.now()-Dl} ms)`),L.exec("VACUUM"),L.exec("PRAGMA optimize");let ds=String(L.prepare("PRAGMA integrity_check").get()?.integrity_check??""),us=L.prepare("PRAGMA foreign_key_check").all();if(ds!=="ok"||us.length>0)throw new Error(`Index verification failed (integrity=${ds}, foreign-key violations=${us.length}).`);for(let[g,O]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let M=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${g}`).get()?.n),q=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${O}`).get()?.n);if(M!==q)throw new Error(`Index verification failed: ${g} has ${M} rows; ${O} has ${q}.`)}if(L.close(),L=void 0,ss(ot),dl(ot,c),fl(Kt(c)),os=!0,a){let g=`${a}.${ul()}.tmp`;Cg(g,`${Q({contextFingerprint:i.contextFingerprint,relativePath:`${i.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),ss(g),dl(g,a),fl(Kt(a)),Mg(Kt(a),i.contextFingerprint)}let Pl=ml(c).size;e(`Done in ${((Date.now()-l)/1e3).toFixed(1)} s -> ${c} (${(Pl/1024/1024).toFixed(1)} MiB)`)}finally{try{L?.close()}catch{}os||(is(ot,{force:!0}),is(`${ot}-journal`,{force:!0}))}}try{Fg()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
