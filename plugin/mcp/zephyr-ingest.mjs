#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var $l=Object.create;var ds=Object.defineProperty;var Ul=Object.getOwnPropertyDescriptor;var Ml=Object.getOwnPropertyNames;var Fl=Object.getPrototypeOf,Bl=Object.prototype.hasOwnProperty;var Kt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var w=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var jl=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of Ml(e))!Bl.call(n,r)&&r!==t&&ds(n,r,{get:()=>e[r],enumerable:!(i=Ul(e,r))||i.enumerable});return n};var ri=(n,e,t)=>(t=n!=null?$l(Fl(n)):{},jl(e||!n||!n.__esModule?ds(t,"default",{value:n,enumerable:!0}):t,n));var x=w(z=>{"use strict";var li=Symbol.for("yaml.alias"),Cs=Symbol.for("yaml.document"),Vt=Symbol.for("yaml.map"),Ds=Symbol.for("yaml.pair"),di=Symbol.for("yaml.scalar"),Gt=Symbol.for("yaml.seq"),me=Symbol.for("yaml.node.type"),Ld=n=>!!n&&typeof n=="object"&&n[me]===li,Od=n=>!!n&&typeof n=="object"&&n[me]===Cs,Rd=n=>!!n&&typeof n=="object"&&n[me]===Vt,Id=n=>!!n&&typeof n=="object"&&n[me]===Ds,Ps=n=>!!n&&typeof n=="object"&&n[me]===di,xd=n=>!!n&&typeof n=="object"&&n[me]===Gt;function qs(n){if(n&&typeof n=="object")switch(n[me]){case Vt:case Gt:return!0}return!1}function Cd(n){if(n&&typeof n=="object")switch(n[me]){case li:case Vt:case di:case Gt:return!0}return!1}var Dd=n=>(Ps(n)||qs(n))&&!!n.anchor;z.ALIAS=li;z.DOC=Cs;z.MAP=Vt;z.NODE_TYPE=me;z.PAIR=Ds;z.SCALAR=di;z.SEQ=Gt;z.hasAnchor=Dd;z.isAlias=Ld;z.isCollection=qs;z.isDocument=Od;z.isMap=Rd;z.isNode=Cd;z.isPair=Id;z.isScalar=Ps;z.isSeq=xd});var at=w(ui=>{"use strict";var K=x(),ee=Symbol("break visit"),$s=Symbol("skip children"),ue=Symbol("remove node");function Jt(n,e){let t=Us(e);K.isDocument(n)?Ge(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):Ge(null,n,t,Object.freeze([]))}Jt.BREAK=ee;Jt.SKIP=$s;Jt.REMOVE=ue;function Ge(n,e,t,i){let r=Ms(n,e,t,i);if(K.isNode(r)||K.isPair(r))return Fs(n,i,r),Ge(n,r,t,i);if(typeof r!="symbol"){if(K.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=Ge(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===ee)return ee;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(K.isPair(e)){i=Object.freeze(i.concat(e));let s=Ge("key",e.key,t,i);if(s===ee)return ee;s===ue&&(e.key=null);let o=Ge("value",e.value,t,i);if(o===ee)return ee;o===ue&&(e.value=null)}}return r}async function Ht(n,e){let t=Us(e);K.isDocument(n)?await Je(null,n.contents,t,Object.freeze([n]))===ue&&(n.contents=null):await Je(null,n,t,Object.freeze([]))}Ht.BREAK=ee;Ht.SKIP=$s;Ht.REMOVE=ue;async function Je(n,e,t,i){let r=await Ms(n,e,t,i);if(K.isNode(r)||K.isPair(r))return Fs(n,i,r),Je(n,r,t,i);if(typeof r!="symbol"){if(K.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=await Je(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===ee)return ee;o===ue&&(e.items.splice(s,1),s-=1)}}}else if(K.isPair(e)){i=Object.freeze(i.concat(e));let s=await Je("key",e.key,t,i);if(s===ee)return ee;s===ue&&(e.key=null);let o=await Je("value",e.value,t,i);if(o===ee)return ee;o===ue&&(e.value=null)}}return r}function Us(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function Ms(n,e,t,i){if(typeof t=="function")return t(n,e,i);if(K.isMap(e))return t.Map?.(n,e,i);if(K.isSeq(e))return t.Seq?.(n,e,i);if(K.isPair(e))return t.Pair?.(n,e,i);if(K.isScalar(e))return t.Scalar?.(n,e,i);if(K.isAlias(e))return t.Alias?.(n,e,i)}function Fs(n,e,t){let i=e[e.length-1];if(K.isCollection(i))i.items[n]=t;else if(K.isPair(i))n==="key"?i.key=t:i.value=t;else if(K.isDocument(i))i.contents=t;else{let r=K.isAlias(i)?"alias":"scalar";throw new Error(`Cannot replace node with ${r} parent`)}}ui.visit=Jt;ui.visitAsync=Ht});var fi=w(js=>{"use strict";var Bs=x(),Pd=at(),qd={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},$d=n=>n.replace(/[!,[\]{}]/g,e=>qd[e]),ct=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let i=e.trim().split(/[ \t]+/),r=i.shift();switch(r){case"%TAG":{if(i.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),i.length<2))return!1;let[s,o]=i;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,i.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=i;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${r}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,i,r]=e.match(/^(.*!)([^!]*)$/s);r||t(`The ${e} tag has no suffix`);let s=this.tags[i];if(s)try{return s+decodeURIComponent(r)}catch(o){return t(String(o)),null}return i==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,i]of Object.entries(this.tags))if(e.startsWith(i))return t+$d(e.substring(i.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],i=Object.entries(this.tags),r;if(e&&i.length>0&&Bs.isNode(e.contents)){let s={};Pd.visit(e.contents,(o,a)=>{Bs.isNode(a)&&a.tag&&(s[a.tag]=!0)}),r=Object.keys(s)}else r=[];for(let[s,o]of i)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||r.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};ct.defaultYaml={explicit:!1,version:"1.2"};ct.defaultTags={"!!":"tag:yaml.org,2002:"};js.Directives=ct});var Wt=w(lt=>{"use strict";var Ks=x(),Ud=at();function Md(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function Xs(n){let e=new Set;return Ud.visit(n,{Value(t,i){i.anchor&&e.add(i.anchor)}}),e}function zs(n,e){for(let t=1;;++t){let i=`${n}${t}`;if(!e.has(i))return i}}function Fd(n,e){let t=[],i=new Map,r=null;return{onAnchor:s=>{t.push(s),r??(r=Xs(n));let o=zs(e,r);return r.add(o),o},setAnchors:()=>{for(let s of t){let o=i.get(s);if(typeof o=="object"&&o.anchor&&(Ks.isScalar(o.node)||Ks.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:i}}lt.anchorIsValid=Md;lt.anchorNames=Xs;lt.createNodeAnchors=Fd;lt.findNewAnchor=zs});var pi=w(Ys=>{"use strict";function dt(n,e,t,i){if(i&&typeof i=="object")if(Array.isArray(i))for(let r=0,s=i.length;r<s;++r){let o=i[r],a=dt(n,i,String(r),o);a===void 0?delete i[r]:a!==o&&(i[r]=a)}else if(i instanceof Map)for(let r of Array.from(i.keys())){let s=i.get(r),o=dt(n,i,r,s);o===void 0?i.delete(r):o!==s&&i.set(r,o)}else if(i instanceof Set)for(let r of Array.from(i)){let s=dt(n,i,r,r);s===void 0?i.delete(r):s!==r&&(i.delete(r),i.add(s))}else for(let[r,s]of Object.entries(i)){let o=dt(n,i,r,s);o===void 0?delete i[r]:o!==s&&(i[r]=o)}return n.call(e,t,i)}Ys.applyReviver=dt});var Te=w(Gs=>{"use strict";var Bd=x();function Vs(n,e,t){if(Array.isArray(n))return n.map((i,r)=>Vs(i,String(r),t));if(n&&typeof n.toJSON=="function"){if(!t||!Bd.hasAnchor(n))return n.toJSON(e,t);let i={aliasCount:0,count:1,res:void 0};t.anchors.set(n,i),t.onCreate=s=>{i.res=s,delete t.onCreate};let r=n.toJSON(e,t);return t.onCreate&&t.onCreate(r),r}return typeof n=="bigint"&&!t?.keep?Number(n):n}Gs.toJS=Vs});var Zt=w(Hs=>{"use strict";var jd=pi(),Js=x(),Kd=Te(),mi=class{constructor(e){Object.defineProperty(this,Js.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:i,onAnchor:r,reviver:s}={}){if(!Js.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},a=Kd.toJS(this,"",o);if(typeof r=="function")for(let{count:c,res:l}of o.anchors.values())r(l,c);return typeof s=="function"?jd.applyReviver(s,{"":a},"",a):a}};Hs.NodeBase=mi});var ut=w(Ws=>{"use strict";var Xd=Wt(),zd=at(),He=x(),Yd=Zt(),Vd=Te(),hi=class extends Yd.NodeBase{constructor(e){super(He.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let i;t?.aliasResolveCache?i=t.aliasResolveCache:(i=[],zd.visit(e,{Node:(s,o)=>{(He.isAlias(o)||He.hasAnchor(o))&&i.push(o)}}),t&&(t.aliasResolveCache=i));let r;for(let s of i){if(s===this)break;s.anchor===this.source&&(r=s)}return r}toJSON(e,t){if(!t)return{source:this.source};let{anchors:i,doc:r,maxAliasCount:s}=t,o=this.resolve(r,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=i.get(o);if(a||(Vd.toJS(o,null,t),a=i.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=Qt(r,o,i)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,i){let r=`*${this.source}`;if(e){if(Xd.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${r} `}return r}};function Qt(n,e,t){if(He.isAlias(e)){let i=e.resolve(n),r=t&&i&&t.get(i);return r?r.count*r.aliasCount:0}else if(He.isCollection(e)){let i=0;for(let r of e.items){let s=Qt(n,r,t);s>i&&(i=s)}return i}else if(He.isPair(e)){let i=Qt(n,e.key,t),r=Qt(n,e.value,t);return Math.max(i,r)}return 1}Ws.Alias=hi});var B=w(gi=>{"use strict";var Gd=x(),Jd=Zt(),Hd=Te(),Wd=n=>!n||typeof n!="function"&&typeof n!="object",Ne=class extends Jd.NodeBase{constructor(e){super(Gd.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:Hd.toJS(this.value,e,t)}toString(){return String(this.value)}};Ne.BLOCK_FOLDED="BLOCK_FOLDED";Ne.BLOCK_LITERAL="BLOCK_LITERAL";Ne.PLAIN="PLAIN";Ne.QUOTE_DOUBLE="QUOTE_DOUBLE";Ne.QUOTE_SINGLE="QUOTE_SINGLE";gi.Scalar=Ne;gi.isScalarValue=Wd});var ft=w(Qs=>{"use strict";var Zd=ut(),De=x(),Zs=B(),Qd="tag:yaml.org,2002:";function eu(n,e,t){if(e){let i=t.filter(s=>s.tag===e),r=i.find(s=>!s.format)??i[0];if(!r)throw new Error(`Tag ${e} not found`);return r}return t.find(i=>i.identify?.(n)&&!i.format)}function tu(n,e,t){if(De.isDocument(n)&&(n=n.contents),De.isNode(n))return n;if(De.isPair(n)){let d=t.schema[De.MAP].createNode?.(t.schema,null,t);return d.items.push(n),d}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:i,onAnchor:r,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(i&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=r(n)),new Zd.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=Qd+e.slice(2));let l=eu(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let d=new Zs.Scalar(n);return c&&(c.node=d),d}l=n instanceof Map?o[De.MAP]:Symbol.iterator in Object(n)?o[De.SEQ]:o[De.MAP]}s&&(s(l),delete t.onTagObj);let p=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new Zs.Scalar(n);return e?p.tag=e:l.default||(p.tag=l.tag),c&&(c.node=p),p}Qs.createNode=tu});var tn=w(en=>{"use strict";var nu=ft(),fe=x(),iu=Zt();function yi(n,e,t){let i=t;for(let r=e.length-1;r>=0;--r){let s=e[r];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=i,i=o}else i=new Map([[s,i]])}return nu.createNode(i,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var eo=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,bi=class extends iu.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(i=>fe.isNode(i)||fe.isPair(i)?i.clone(e):i),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(eo(e))this.add(t);else{let[i,...r]=e,s=this.get(i,!0);if(fe.isCollection(s))s.addIn(r,t);else if(s===void 0&&this.schema)this.set(i,yi(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}deleteIn(e){let[t,...i]=e;if(i.length===0)return this.delete(t);let r=this.get(t,!0);if(fe.isCollection(r))return r.deleteIn(i);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${i}`)}getIn(e,t){let[i,...r]=e,s=this.get(i,!0);return r.length===0?!t&&fe.isScalar(s)?s.value:s:fe.isCollection(s)?s.getIn(r,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!fe.isPair(t))return!1;let i=t.value;return i==null||e&&fe.isScalar(i)&&i.value==null&&!i.commentBefore&&!i.comment&&!i.tag})}hasIn(e){let[t,...i]=e;if(i.length===0)return this.has(t);let r=this.get(t,!0);return fe.isCollection(r)?r.hasIn(i):!1}setIn(e,t){let[i,...r]=e;if(r.length===0)this.set(i,t);else{let s=this.get(i,!0);if(fe.isCollection(s))s.setIn(r,t);else if(s===void 0&&this.schema)this.set(i,yi(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}};en.Collection=bi;en.collectionFromPath=yi;en.isEmptyPath=eo});var pt=w(nn=>{"use strict";var ru=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function Ei(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var su=(n,e,t)=>n.endsWith(`
`)?Ei(t,e):t.includes(`
`)?`
`+Ei(t,e):(n.endsWith(" ")?"":" ")+t;nn.indentComment=Ei;nn.lineComment=su;nn.stringifyComment=ru});var no=w(mt=>{"use strict";var ou="flow",_i="block",rn="quoted";function au(n,e,t="flow",{indentAtStart:i,lineWidth:r=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!r||r<0)return n;r<s&&(s=0);let c=Math.max(1+s,1+r-e.length);if(n.length<=c)return n;let l=[],p={},d=r-e.length;typeof i=="number"&&(i>r-Math.max(2,s)?l.push(0):d=r-i);let u,m,y=!1,f=-1,h=-1,E=-1;t===_i&&(f=to(n,f,e.length),f!==-1&&(d=f+c));for(let _;_=n[f+=1];){if(t===rn&&_==="\\"){switch(h=f,n[f+1]){case"x":f+=3;break;case"u":f+=5;break;case"U":f+=9;break;default:f+=1}E=f}if(_===`
`)t===_i&&(f=to(n,f,e.length)),d=f+e.length+c,u=void 0;else{if(_===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let T=n[f+1];T&&T!==" "&&T!==`
`&&T!=="	"&&(u=f)}if(f>=d)if(u)l.push(u),d=u+c,u=void 0;else if(t===rn){for(;m===" "||m==="	";)m=_,_=n[f+=1],y=!0;let T=f>E+1?f-2:h-1;if(p[T])return n;l.push(T),p[T]=!0,d=T+c,u=void 0}else y=!0}m=_}if(y&&a&&a(),l.length===0)return n;o&&o();let b=n.slice(0,l[0]);for(let _=0;_<l.length;++_){let T=l[_],v=l[_+1]||n.length;T===0?b=`
${e}${n.slice(0,v)}`:(t===rn&&p[T]&&(b+=`${n[T]}\\`),b+=`
${e}${n.slice(T+1,v)}`)}return b}function to(n,e,t){let i=e,r=e+1,s=n[r];for(;s===" "||s==="	";)if(e<r+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);i=e,r=e+1,s=n[r]}return i}mt.FOLD_BLOCK=_i;mt.FOLD_FLOW=ou;mt.FOLD_QUOTED=rn;mt.foldFlowLines=au});var gt=w(io=>{"use strict";var ae=B(),we=no(),on=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),an=n=>/^(%|---|\.\.\.)/m.test(n);function cu(n,e,t){if(!e||e<0)return!1;let i=e-t,r=n.length;if(r<=i)return!1;for(let s=0,o=0;s<r;++s)if(n[s]===`
`){if(s-o>i)return!0;if(o=s+1,r-o<=i)return!1}return!0}function ht(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:i}=e,r=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(an(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let p=t.substr(c+2,4);switch(p){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:p.substr(0,2)==="00"?o+="\\x"+p.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(i||t[c+2]==='"'||t.length<r)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,i?o:we.foldFlowLines(o,s,we.FOLD_QUOTED,on(e,!1))}function Ti(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return ht(n,e);let t=e.indent||(an(n)?"  ":""),i="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?i:we.foldFlowLines(i,t,we.FOLD_FLOW,on(e,!1))}function We(n,e){let{singleQuote:t}=e.options,i;if(t===!1)i=ht;else{let r=n.includes('"'),s=n.includes("'");r&&!s?i=Ti:s&&!r?i=ht:i=t?Ti:ht}return i(n,e)}var Ni;try{Ni=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{Ni=/\n+(?!\n|$)/g}function sn({comment:n,type:e,value:t},i,r,s){let{blockQuote:o,commentString:a,lineWidth:c}=i.options;if(!o||/\n[\t ]+$/.test(t))return We(t,i);let l=i.indent||(i.forceBlockIndent||an(t)?"  ":""),p=o==="literal"?!0:o==="folded"||e===ae.Scalar.BLOCK_FOLDED?!1:e===ae.Scalar.BLOCK_LITERAL?!0:!cu(t,c,l.length);if(!t)return p?`|
`:`>
`;let d,u;for(u=t.length;u>0;--u){let v=t[u-1];if(v!==`
`&&v!=="	"&&v!==" ")break}let m=t.substring(u),y=m.indexOf(`
`);y===-1?d="-":t===m||y!==m.length-1?(d="+",s&&s()):d="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(Ni,`$&${l}`));let f=!1,h,E=-1;for(h=0;h<t.length;++h){let v=t[h];if(v===" ")f=!0;else if(v===`
`)E=h;else break}let b=t.substring(0,E<h?E+1:h);b&&(t=t.substring(b.length),b=b.replace(/\n+/g,`$&${l}`));let T=(f?l?"2":"1":"")+d;if(n&&(T+=" "+a(n.replace(/ ?[\r\n]+/g," ")),r&&r()),!p){let v=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),k=!1,A=on(i,!0);o!=="folded"&&e!==ae.Scalar.BLOCK_FOLDED&&(A.onOverflow=()=>{k=!0});let N=we.foldFlowLines(`${b}${v}${m}`,l,we.FOLD_BLOCK,A);if(!k)return`>${T}
${l}${N}`}return t=t.replace(/\n+/g,`$&${l}`),`|${T}
${l}${b}${t}${m}`}function lu(n,e,t,i){let{type:r,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:p}=e;if(a&&s.includes(`
`)||p&&/[[\]{},]/.test(s))return We(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||p||!s.includes(`
`)?We(s,e):sn(n,e,t,i);if(!a&&!p&&r!==ae.Scalar.PLAIN&&s.includes(`
`))return sn(n,e,t,i);if(an(s)){if(c==="")return e.forceBlockIndent=!0,sn(n,e,t,i);if(a&&c===l)return We(s,e)}let d=s.replace(/\n+/g,`$&
${c}`);if(o){let u=f=>f.default&&f.tag!=="tag:yaml.org,2002:str"&&f.test?.test(d),{compat:m,tags:y}=e.doc.schema;if(y.some(u)||m?.some(u))return We(s,e)}return a?d:we.foldFlowLines(d,c,we.FOLD_FLOW,on(e,!1))}function du(n,e,t,i){let{implicitKey:r,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==ae.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=ae.Scalar.QUOTE_DOUBLE);let c=p=>{switch(p){case ae.Scalar.BLOCK_FOLDED:case ae.Scalar.BLOCK_LITERAL:return r||s?We(o.value,e):sn(o,e,t,i);case ae.Scalar.QUOTE_DOUBLE:return ht(o.value,e);case ae.Scalar.QUOTE_SINGLE:return Ti(o.value,e);case ae.Scalar.PLAIN:return lu(o,e,t,i);default:return null}},l=c(a);if(l===null){let{defaultKeyType:p,defaultStringType:d}=e.options,u=r&&p||d;if(l=c(u),l===null)throw new Error(`Unsupported default string type ${u}`)}return l}io.stringifyString=du});var yt=w(wi=>{"use strict";var uu=Wt(),Se=x(),fu=pt(),pu=gt();function mu(n,e){let t=Object.assign({blockQuote:!0,commentString:fu.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),i;switch(t.collectionStyle){case"block":i=!1;break;case"flow":i=!0;break;default:i=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:i,options:t}}function hu(n,e){if(e.tag){let r=n.filter(s=>s.tag===e.tag);if(r.length>0)return r.find(s=>s.format===e.format)??r[0]}let t,i;if(Se.isScalar(e)){i=e.value;let r=n.filter(s=>s.identify?.(i));if(r.length>1){let s=r.filter(o=>o.test);s.length>0&&(r=s)}t=r.find(s=>s.format===e.format)??r.find(s=>!s.format)}else i=e,t=n.find(r=>r.nodeClass&&i instanceof r.nodeClass);if(!t){let r=i?.constructor?.name??(i===null?"null":typeof i);throw new Error(`Tag not resolved for ${r} value`)}return t}function gu(n,e,{anchors:t,doc:i}){if(!i.directives)return"";let r=[],s=(Se.isScalar(n)||Se.isCollection(n))&&n.anchor;s&&uu.anchorIsValid(s)&&(t.add(s),r.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&r.push(i.directives.tagString(o)),r.join(" ")}function yu(n,e,t,i){if(Se.isPair(n))return n.toString(e,t,i);if(Se.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let r,s=Se.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>r=c});r??(r=hu(e.doc.schema.tags,s));let o=gu(s,r,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof r.stringify=="function"?r.stringify(s,e,t,i):Se.isScalar(s)?pu.stringifyString(s,e,t,i):s.toString(e,t,i);return o?Se.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}wi.createStringifyContext=mu;wi.stringify=yu});var ao=w(oo=>{"use strict";var he=x(),ro=B(),so=yt(),bt=pt();function bu({key:n,value:e},t,i,r){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:p,simpleKeys:d}}=t,u=he.isNode(n)&&n.comment||null;if(d){if(u)throw new Error("With simple keys, key nodes cannot have comments");if(he.isCollection(n)||!he.isNode(n)&&typeof n=="object"){let A="With simple keys, collection cannot be used as a key value";throw new Error(A)}}let m=!d&&(!n||u&&e==null&&!t.inFlow||he.isCollection(n)||(he.isScalar(n)?n.type===ro.Scalar.BLOCK_FOLDED||n.type===ro.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(d||!s),indent:a+c});let y=!1,f=!1,h=so.stringify(n,t,()=>y=!0,()=>f=!0);if(!m&&!t.inFlow&&h.length>1024){if(d)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return y&&i&&i(),h===""?"?":m?`? ${h}`:h}else if(s&&!d||e==null&&m)return h=`? ${h}`,u&&!y?h+=bt.lineComment(h,t.indent,l(u)):f&&r&&r(),h;y&&(u=null),m?(u&&(h+=bt.lineComment(h,t.indent,l(u))),h=`? ${h}
${a}:`):(h=`${h}:`,u&&(h+=bt.lineComment(h,t.indent,l(u))));let E,b,_;he.isNode(e)?(E=!!e.spaceBefore,b=e.commentBefore,_=e.comment):(E=!1,b=null,_=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!u&&he.isScalar(e)&&(t.indentAtStart=h.length+1),f=!1,!p&&c.length>=2&&!t.inFlow&&!m&&he.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let T=!1,v=so.stringify(e,t,()=>T=!0,()=>f=!0),k=" ";if(u||E||b){if(k=E?`
`:"",b){let A=l(b);k+=`
${bt.indentComment(A,t.indent)}`}v===""&&!t.inFlow?k===`
`&&_&&(k=`

`):k+=`
${t.indent}`}else if(!m&&he.isCollection(e)){let A=v[0],N=v.indexOf(`
`),S=N!==-1,P=t.inFlow??e.flow??e.items.length===0;if(S||!P){let W=!1;if(S&&(A==="&"||A==="!")){let U=v.indexOf(" ");A==="&"&&U!==-1&&U<N&&v[U+1]==="!"&&(U=v.indexOf(" ",U+1)),(U===-1||N<U)&&(W=!0)}W||(k=`
${t.indent}`)}}else(v===""||v[0]===`
`)&&(k="");return h+=k+v,t.inFlow?T&&i&&i():_&&!T?h+=bt.lineComment(h,t.indent,l(_)):f&&r&&r(),h}oo.stringifyPair=bu});var vi=w(Si=>{"use strict";var co=Kt("process");function Eu(n,...e){n==="debug"&&console.log(...e)}function _u(n,e){(n==="debug"||n==="warn")&&(typeof co.emitWarning=="function"?co.emitWarning(e):console.warn(e))}Si.debug=Eu;Si.warn=_u});var fn=w(un=>{"use strict";var dn=x(),lo=B(),cn="<<",ln={identify:n=>n===cn||typeof n=="symbol"&&n.description===cn,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new lo.Scalar(Symbol(cn)),{addToJSMap:uo}),stringify:()=>cn},Tu=(n,e)=>(ln.identify(e)||dn.isScalar(e)&&(!e.type||e.type===lo.Scalar.PLAIN)&&ln.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===ln.tag&&t.default);function uo(n,e,t){let i=fo(n,t);if(dn.isSeq(i))for(let r of i.items)ki(n,e,r);else if(Array.isArray(i))for(let r of i)ki(n,e,r);else ki(n,e,i)}function ki(n,e,t){let i=fo(n,t);if(!dn.isMap(i))throw new Error("Merge sources must be maps or map aliases");let r=i.toJSON(null,n,Map);for(let[s,o]of r)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function fo(n,e){return n&&dn.isAlias(e)?e.resolve(n.doc,n):e}un.addMergeToJSMap=uo;un.isMergeKey=Tu;un.merge=ln});var Li=w(ho=>{"use strict";var Nu=vi(),po=fn(),wu=yt(),mo=x(),Ai=Te();function Su(n,e,{key:t,value:i}){if(mo.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,i);else if(po.isMergeKey(n,t))po.addMergeToJSMap(n,e,i);else{let r=Ai.toJS(t,"",n);if(e instanceof Map)e.set(r,Ai.toJS(i,r,n));else if(e instanceof Set)e.add(r);else{let s=vu(t,r,n),o=Ai.toJS(i,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function vu(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(mo.isNode(n)&&t?.doc){let i=wu.createStringifyContext(t.doc,{});i.anchors=new Set;for(let s of t.anchors.keys())i.anchors.add(s.anchor);i.inFlow=!0,i.inStringifyKey=!0;let r=n.toString(i);if(!t.mapKeyWarned){let s=JSON.stringify(r);s.length>40&&(s=s.substring(0,36)+'..."'),Nu.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return r}return JSON.stringify(e)}ho.addPairToJSMap=Su});var ve=w(Oi=>{"use strict";var go=ft(),ku=ao(),Au=Li(),pn=x();function Lu(n,e,t){let i=go.createNode(n,void 0,t),r=go.createNode(e,void 0,t);return new mn(i,r)}var mn=class n{constructor(e,t=null){Object.defineProperty(this,pn.NODE_TYPE,{value:pn.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:i}=this;return pn.isNode(t)&&(t=t.clone(e)),pn.isNode(i)&&(i=i.clone(e)),new n(t,i)}toJSON(e,t){let i=t?.mapAsMap?new Map:{};return Au.addPairToJSMap(t,i,this)}toString(e,t,i){return e?.doc?ku.stringifyPair(this,e,t,i):JSON.stringify(this)}};Oi.Pair=mn;Oi.createPair=Lu});var Ri=w(bo=>{"use strict";var Pe=x(),yo=yt(),hn=pt();function Ou(n,e,t){return(e.inFlow??n.flow?Iu:Ru)(n,e,t)}function Ru({comment:n,items:e},t,{blockItemPrefix:i,flowChars:r,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,p=Object.assign({},t,{indent:s,type:null}),d=!1,u=[];for(let y=0;y<e.length;++y){let f=e[y],h=null;if(Pe.isNode(f))!d&&f.spaceBefore&&u.push(""),gn(t,u,f.commentBefore,d),f.comment&&(h=f.comment);else if(Pe.isPair(f)){let b=Pe.isNode(f.key)?f.key:null;b&&(!d&&b.spaceBefore&&u.push(""),gn(t,u,b.commentBefore,d))}d=!1;let E=yo.stringify(f,p,()=>h=null,()=>d=!0);h&&(E+=hn.lineComment(E,s,l(h))),d&&h&&(d=!1),u.push(i+E)}let m;if(u.length===0)m=r.start+r.end;else{m=u[0];for(let y=1;y<u.length;++y){let f=u[y];m+=f?`
${c}${f}`:`
`}}return n?(m+=`
`+hn.indentComment(l(n),c),a&&a()):d&&o&&o(),m}function Iu({items:n},e,{flowChars:t,itemIndent:i}){let{indent:r,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;i+=s;let c=Object.assign({},e,{indent:i,inFlow:!0,type:null}),l=!1,p=0,d=[];for(let y=0;y<n.length;++y){let f=n[y],h=null;if(Pe.isNode(f))f.spaceBefore&&d.push(""),gn(e,d,f.commentBefore,!1),f.comment&&(h=f.comment);else if(Pe.isPair(f)){let b=Pe.isNode(f.key)?f.key:null;b&&(b.spaceBefore&&d.push(""),gn(e,d,b.commentBefore,!1),b.comment&&(l=!0));let _=Pe.isNode(f.value)?f.value:null;_?(_.comment&&(h=_.comment),_.commentBefore&&(l=!0)):f.value==null&&b?.comment&&(h=b.comment)}h&&(l=!0);let E=yo.stringify(f,c,()=>h=null);l||(l=d.length>p||E.includes(`
`)),y<n.length-1?E+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=d.reduce((b,_)=>b+_.length+2,2)+(E.length+2)>e.options.lineWidth)),l&&(E+=",")),h&&(E+=hn.lineComment(E,i,a(h))),d.push(E),p=d.length}let{start:u,end:m}=t;if(d.length===0)return u+m;if(!l){let y=d.reduce((f,h)=>f+h.length+2,2);l=e.options.lineWidth>0&&y>e.options.lineWidth}if(l){let y=u;for(let f of d)y+=f?`
${s}${r}${f}`:`
`;return`${y}
${r}${m}`}else return`${u}${o}${d.join(" ")}${o}${m}`}function gn({indent:n,options:{commentString:e}},t,i,r){if(i&&r&&(i=i.replace(/^\n+/,"")),i){let s=hn.indentComment(e(i),n);t.push(s.trimStart())}}bo.stringifyCollection=Ou});var Ae=w(xi=>{"use strict";var xu=Ri(),Cu=Li(),Du=tn(),ke=x(),yn=ve(),Pu=B();function Et(n,e){let t=ke.isScalar(e)?e.value:e;for(let i of n)if(ke.isPair(i)&&(i.key===e||i.key===t||ke.isScalar(i.key)&&i.key.value===t))return i}var Ii=class extends Du.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ke.MAP,e),this.items=[]}static from(e,t,i){let{keepUndefined:r,replacer:s}=i,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||r)&&o.items.push(yn.createPair(c,l,i))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let i;ke.isPair(e)?i=e:!e||typeof e!="object"||!("key"in e)?i=new yn.Pair(e,e?.value):i=new yn.Pair(e.key,e.value);let r=Et(this.items,i.key),s=this.schema?.sortMapEntries;if(r){if(!t)throw new Error(`Key ${i.key} already set`);ke.isScalar(r.value)&&Pu.isScalarValue(i.value)?r.value.value=i.value:r.value=i.value}else if(s){let o=this.items.findIndex(a=>s(i,a)<0);o===-1?this.items.push(i):this.items.splice(o,0,i)}else this.items.push(i)}delete(e){let t=Et(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let r=Et(this.items,e)?.value;return(!t&&ke.isScalar(r)?r.value:r)??void 0}has(e){return!!Et(this.items,e)}set(e,t){this.add(new yn.Pair(e,t),!0)}toJSON(e,t,i){let r=i?new i:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(r);for(let s of this.items)Cu.addPairToJSMap(t,r,s);return r}toString(e,t,i){if(!e)return JSON.stringify(this);for(let r of this.items)if(!ke.isPair(r))throw new Error(`Map items must all be pairs; found ${JSON.stringify(r)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),xu.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:i,onComment:t})}};xi.YAMLMap=Ii;xi.findPair=Et});var Ze=w(_o=>{"use strict";var qu=x(),Eo=Ae(),$u={collection:"map",default:!0,nodeClass:Eo.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return qu.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>Eo.YAMLMap.from(n,e,t)};_o.map=$u});var Le=w(To=>{"use strict";var Uu=ft(),Mu=Ri(),Fu=tn(),En=x(),Bu=B(),ju=Te(),Ci=class extends Fu.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(En.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=bn(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let i=bn(e);if(typeof i!="number")return;let r=this.items[i];return!t&&En.isScalar(r)?r.value:r}has(e){let t=bn(e);return typeof t=="number"&&t<this.items.length}set(e,t){let i=bn(e);if(typeof i!="number")throw new Error(`Expected a valid index, not ${e}.`);let r=this.items[i];En.isScalar(r)&&Bu.isScalarValue(t)?r.value=t:this.items[i]=t}toJSON(e,t){let i=[];t?.onCreate&&t.onCreate(i);let r=0;for(let s of this.items)i.push(ju.toJS(s,String(r++),t));return i}toString(e,t,i){return e?Mu.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:i,onComment:t}):JSON.stringify(this)}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof r=="function"){let c=t instanceof Set?a:String(o++);a=r.call(t,c,a)}s.items.push(Uu.createNode(a,void 0,i))}}return s}};function bn(n){let e=En.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}To.YAMLSeq=Ci});var Qe=w(wo=>{"use strict";var Ku=x(),No=Le(),Xu={collection:"seq",default:!0,nodeClass:No.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Ku.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>No.YAMLSeq.from(n,e,t)};wo.seq=Xu});var _t=w(So=>{"use strict";var zu=gt(),Yu={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,i){return e=Object.assign({actualString:!0},e),zu.stringifyString(n,e,t,i)}};So.string=Yu});var _n=w(Ao=>{"use strict";var vo=B(),ko={identify:n=>n==null,createNode:()=>new vo.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new vo.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&ko.test.test(n)?n:e.options.nullStr};Ao.nullTag=ko});var Di=w(Oo=>{"use strict";var Vu=B(),Lo={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new Vu.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&Lo.test.test(n)){let i=n[0]==="t"||n[0]==="T";if(e===i)return n}return e?t.options.trueStr:t.options.falseStr}};Oo.boolTag=Lo});var et=w(Ro=>{"use strict";function Gu({format:n,minFractionDigits:e,tag:t,value:i}){if(typeof i=="bigint")return String(i);let r=typeof i=="number"?i:Number(i);if(!isFinite(r))return isNaN(r)?".nan":r<0?"-.inf":".inf";let s=Object.is(i,-0)?"-0":JSON.stringify(i);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}Ro.stringifyNumber=Gu});var qi=w(Tn=>{"use strict";var Ju=B(),Pi=et(),Hu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Pi.stringifyNumber},Wu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Pi.stringifyNumber(n)}},Zu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new Ju.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:Pi.stringifyNumber};Tn.float=Zu;Tn.floatExp=Wu;Tn.floatNaN=Hu});var Ui=w(wn=>{"use strict";var Io=et(),Nn=n=>typeof n=="bigint"||Number.isInteger(n),$i=(n,e,t,{intAsBigInt:i})=>i?BigInt(n):parseInt(n.substring(e),t);function xo(n,e,t){let{value:i}=n;return Nn(i)&&i>=0?t+i.toString(e):Io.stringifyNumber(n)}var Qu={identify:n=>Nn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>$i(n,2,8,t),stringify:n=>xo(n,8,"0o")},ef={identify:Nn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>$i(n,0,10,t),stringify:Io.stringifyNumber},tf={identify:n=>Nn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>$i(n,2,16,t),stringify:n=>xo(n,16,"0x")};wn.int=ef;wn.intHex=tf;wn.intOct=Qu});var Do=w(Co=>{"use strict";var nf=Ze(),rf=_n(),sf=Qe(),of=_t(),af=Di(),Mi=qi(),Fi=Ui(),cf=[nf.map,sf.seq,of.string,rf.nullTag,af.boolTag,Fi.intOct,Fi.int,Fi.intHex,Mi.floatNaN,Mi.floatExp,Mi.float];Co.schema=cf});var $o=w(qo=>{"use strict";var lf=B(),df=Ze(),uf=Qe();function Po(n){return typeof n=="bigint"||Number.isInteger(n)}var Sn=({value:n})=>JSON.stringify(n),ff=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:Sn},{identify:n=>n==null,createNode:()=>new lf.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:Sn},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:Sn},{identify:Po,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Po(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:Sn}],pf={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},mf=[df.map,uf.seq].concat(ff,pf);qo.schema=mf});var ji=w(Uo=>{"use strict";var Tt=Kt("buffer"),Bi=B(),hf=gt(),gf={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof Tt.Buffer=="function")return Tt.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),i=new Uint8Array(t.length);for(let r=0;r<t.length;++r)i[r]=t.charCodeAt(r);return i}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},i,r,s){if(!t)return"";let o=t,a;if(typeof Tt.Buffer=="function")a=o instanceof Tt.Buffer?o.toString("base64"):Tt.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Bi.Scalar.BLOCK_LITERAL),e!==Bi.Scalar.QUOTE_DOUBLE){let c=Math.max(i.options.lineWidth-i.indent.length,i.options.minContentWidth),l=Math.ceil(a.length/c),p=new Array(l);for(let d=0,u=0;d<l;++d,u+=c)p[d]=a.substr(u,c);a=p.join(e===Bi.Scalar.BLOCK_LITERAL?`
`:" ")}return hf.stringifyString({comment:n,type:e,value:a},i,r,s)}};Uo.binary=gf});var An=w(kn=>{"use strict";var vn=x(),Ki=ve(),yf=B(),bf=Le();function Mo(n,e){if(vn.isSeq(n))for(let t=0;t<n.items.length;++t){let i=n.items[t];if(!vn.isPair(i)){if(vn.isMap(i)){i.items.length>1&&e("Each pair must have its own sequence indicator");let r=i.items[0]||new Ki.Pair(new yf.Scalar(null));if(i.commentBefore&&(r.key.commentBefore=r.key.commentBefore?`${i.commentBefore}
${r.key.commentBefore}`:i.commentBefore),i.comment){let s=r.value??r.key;s.comment=s.comment?`${i.comment}
${s.comment}`:i.comment}i=r}n.items[t]=vn.isPair(i)?i:new Ki.Pair(i)}}else e("Expected a sequence for this tag");return n}function Fo(n,e,t){let{replacer:i}=t,r=new bf.YAMLSeq(n);r.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof i=="function"&&(o=i.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;r.items.push(Ki.createPair(a,c,t))}return r}var Ef={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:Mo,createNode:Fo};kn.createPairs=Fo;kn.pairs=Ef;kn.resolvePairs=Mo});var Yi=w(zi=>{"use strict";var Bo=x(),Xi=Te(),Nt=Ae(),_f=Le(),jo=An(),qe=class n extends _f.YAMLSeq{constructor(){super(),this.add=Nt.YAMLMap.prototype.add.bind(this),this.delete=Nt.YAMLMap.prototype.delete.bind(this),this.get=Nt.YAMLMap.prototype.get.bind(this),this.has=Nt.YAMLMap.prototype.has.bind(this),this.set=Nt.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let i=new Map;t?.onCreate&&t.onCreate(i);for(let r of this.items){let s,o;if(Bo.isPair(r)?(s=Xi.toJS(r.key,"",t),o=Xi.toJS(r.value,s,t)):s=Xi.toJS(r,"",t),i.has(s))throw new Error("Ordered maps must not include duplicate keys");i.set(s,o)}return i}static from(e,t,i){let r=jo.createPairs(e,t,i),s=new this;return s.items=r.items,s}};qe.tag="tag:yaml.org,2002:omap";var Tf={collection:"seq",identify:n=>n instanceof Map,nodeClass:qe,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=jo.resolvePairs(n,e),i=[];for(let{key:r}of t.items)Bo.isScalar(r)&&(i.includes(r.value)?e(`Ordered maps must not include duplicate keys: ${r.value}`):i.push(r.value));return Object.assign(new qe,t)},createNode:(n,e,t)=>qe.from(n,e,t)};zi.YAMLOMap=qe;zi.omap=Tf});var Vo=w(Vi=>{"use strict";var Ko=B();function Xo({value:n,source:e},t){return e&&(n?zo:Yo).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var zo={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new Ko.Scalar(!0),stringify:Xo},Yo={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new Ko.Scalar(!1),stringify:Xo};Vi.falseTag=Yo;Vi.trueTag=zo});var Go=w(Ln=>{"use strict";var Nf=B(),Gi=et(),wf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Gi.stringifyNumber},Sf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Gi.stringifyNumber(n)}},vf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new Nf.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let i=n.substring(t+1).replace(/_/g,"");i[i.length-1]==="0"&&(e.minFractionDigits=i.length)}return e},stringify:Gi.stringifyNumber};Ln.float=vf;Ln.floatExp=Sf;Ln.floatNaN=wf});var Ho=w(St=>{"use strict";var Jo=et(),wt=n=>typeof n=="bigint"||Number.isInteger(n);function On(n,e,t,{intAsBigInt:i}){let r=n[0];if((r==="-"||r==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),i){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return r==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return r==="-"?-1*s:s}function Ji(n,e,t){let{value:i}=n;if(wt(i)){let r=i.toString(e);return i<0?"-"+t+r.substr(1):t+r}return Jo.stringifyNumber(n)}var kf={identify:wt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>On(n,2,2,t),stringify:n=>Ji(n,2,"0b")},Af={identify:wt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>On(n,1,8,t),stringify:n=>Ji(n,8,"0")},Lf={identify:wt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>On(n,0,10,t),stringify:Jo.stringifyNumber},Of={identify:wt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>On(n,2,16,t),stringify:n=>Ji(n,16,"0x")};St.int=Lf;St.intBin=kf;St.intHex=Of;St.intOct=Af});var Wi=w(Hi=>{"use strict";var xn=x(),Rn=ve(),In=Ae(),$e=class n extends In.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;xn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new Rn.Pair(e.key,null):t=new Rn.Pair(e,null),In.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let i=In.findPair(this.items,e);return!t&&xn.isPair(i)?xn.isScalar(i.key)?i.key.value:i.key:i}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let i=In.findPair(this.items,e);i&&!t?this.items.splice(this.items.indexOf(i),1):!i&&t&&this.items.push(new Rn.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,i){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,i);throw new Error("Set items must all have null values")}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof r=="function"&&(o=r.call(t,o,o)),s.items.push(Rn.createPair(o,null,i));return s}};$e.tag="tag:yaml.org,2002:set";var Rf={collection:"map",identify:n=>n instanceof Set,nodeClass:$e,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>$e.from(n,e,t),resolve(n,e){if(xn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new $e,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};Hi.YAMLSet=$e;Hi.set=Rf});var Qi=w(Cn=>{"use strict";var If=et();function Zi(n,e){let t=n[0],i=t==="-"||t==="+"?n.substring(1):n,r=o=>e?BigInt(o):Number(o),s=i.replace(/_/g,"").split(":").reduce((o,a)=>o*r(60)+r(a),r(0));return t==="-"?r(-1)*s:s}function Wo(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return If.stringifyNumber(n);let i="";e<0&&(i="-",e*=t(-1));let r=t(60),s=[e%r];return e<60?s.unshift(0):(e=(e-s[0])/r,s.unshift(e%r),e>=60&&(e=(e-s[0])/r,s.unshift(e))),i+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var xf={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>Zi(n,t),stringify:Wo},Cf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>Zi(n,!1),stringify:Wo},Zo={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(Zo.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,i,r,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,i-1,r,s||0,o||0,a||0,c),p=e[8];if(p&&p!=="Z"){let d=Zi(p,!1);Math.abs(d)<30&&(d*=60),l-=6e4*d}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};Cn.floatTime=Cf;Cn.intTime=xf;Cn.timestamp=Zo});var ta=w(ea=>{"use strict";var Df=Ze(),Pf=_n(),qf=Qe(),$f=_t(),Uf=ji(),Qo=Vo(),er=Go(),Dn=Ho(),Mf=fn(),Ff=Yi(),Bf=An(),jf=Wi(),tr=Qi(),Kf=[Df.map,qf.seq,$f.string,Pf.nullTag,Qo.trueTag,Qo.falseTag,Dn.intBin,Dn.intOct,Dn.int,Dn.intHex,er.floatNaN,er.floatExp,er.float,Uf.binary,Mf.merge,Ff.omap,Bf.pairs,jf.set,tr.intTime,tr.floatTime,tr.timestamp];ea.schema=Kf});var ua=w(rr=>{"use strict";var sa=Ze(),Xf=_n(),oa=Qe(),zf=_t(),Yf=Di(),nr=qi(),ir=Ui(),Vf=Do(),Gf=$o(),aa=ji(),vt=fn(),ca=Yi(),la=An(),na=ta(),da=Wi(),Pn=Qi(),ia=new Map([["core",Vf.schema],["failsafe",[sa.map,oa.seq,zf.string]],["json",Gf.schema],["yaml11",na.schema],["yaml-1.1",na.schema]]),ra={binary:aa.binary,bool:Yf.boolTag,float:nr.float,floatExp:nr.floatExp,floatNaN:nr.floatNaN,floatTime:Pn.floatTime,int:ir.int,intHex:ir.intHex,intOct:ir.intOct,intTime:Pn.intTime,map:sa.map,merge:vt.merge,null:Xf.nullTag,omap:ca.omap,pairs:la.pairs,seq:oa.seq,set:da.set,timestamp:Pn.timestamp},Jf={"tag:yaml.org,2002:binary":aa.binary,"tag:yaml.org,2002:merge":vt.merge,"tag:yaml.org,2002:omap":ca.omap,"tag:yaml.org,2002:pairs":la.pairs,"tag:yaml.org,2002:set":da.set,"tag:yaml.org,2002:timestamp":Pn.timestamp};function Hf(n,e,t){let i=ia.get(e);if(i&&!n)return t&&!i.includes(vt.merge)?i.concat(vt.merge):i.slice();let r=i;if(!r)if(Array.isArray(n))r=[];else{let s=Array.from(ia.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)r=r.concat(s);else typeof n=="function"&&(r=n(r.slice()));return t&&(r=r.concat(vt.merge)),r.reduce((s,o)=>{let a=typeof o=="string"?ra[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(ra).map(p=>JSON.stringify(p)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}rr.coreKnownTags=Jf;rr.getTags=Hf});var ar=w(fa=>{"use strict";var sr=x(),Wf=Ze(),Zf=Qe(),Qf=_t(),qn=ua(),ep=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,or=class n{constructor({compat:e,customTags:t,merge:i,resolveKnownTags:r,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?qn.getTags(e,"compat"):e?qn.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=r?qn.coreKnownTags:{},this.tags=qn.getTags(t,this.name,i),this.toStringOptions=a??null,Object.defineProperty(this,sr.MAP,{value:Wf.map}),Object.defineProperty(this,sr.SCALAR,{value:Qf.string}),Object.defineProperty(this,sr.SEQ,{value:Zf.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?ep:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};fa.Schema=or});var ma=w(pa=>{"use strict";var tp=x(),cr=yt(),kt=pt();function np(n,e){let t=[],i=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),i=!0):n.directives.docStart&&(i=!0)}i&&t.push("---");let r=cr.createStringifyContext(n,e),{commentString:s}=r.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(kt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(tp.isNode(n.contents)){if(n.contents.spaceBefore&&i&&t.push(""),n.contents.commentBefore){let p=s(n.contents.commentBefore);t.push(kt.indentComment(p,""))}r.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=cr.stringify(n.contents,r,()=>a=null,c);a&&(l+=kt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(cr.stringify(n.contents,r));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(kt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(kt.indentComment(s(c),"")))}return t.join(`
`)+`
`}pa.stringifyDocument=np});var At=w(ha=>{"use strict";var ip=ut(),tt=tn(),oe=x(),rp=ve(),sp=Te(),op=ar(),ap=ma(),lr=Wt(),cp=pi(),lp=ft(),dr=fi(),ur=class n{constructor(e,t,i){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,oe.NODE_TYPE,{value:oe.DOC});let r=null;typeof t=="function"||Array.isArray(t)?r=t:i===void 0&&t&&(i=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},i);this.options=s;let{version:o}=s;i?._directives?(this.directives=i._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new dr.Directives({version:o}),this.setSchema(o,i),this.contents=e===void 0?null:this.createNode(e,r,i)}clone(){let e=Object.create(n.prototype,{[oe.NODE_TYPE]:{value:oe.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=oe.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){nt(this.contents)&&this.contents.add(e)}addIn(e,t){nt(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let i=lr.anchorNames(this);e.anchor=!t||i.has(t)?lr.findNewAnchor(t||"a",i):t}return new ip.Alias(e.anchor)}createNode(e,t,i){let r;if(typeof t=="function")e=t.call({"":e},"",e),r=t;else if(Array.isArray(t)){let h=b=>typeof b=="number"||b instanceof String||b instanceof Number,E=t.filter(h).map(String);E.length>0&&(t=t.concat(E)),r=t}else i===void 0&&t&&(i=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:p}=i??{},{onAnchor:d,setAnchors:u,sourceObjects:m}=lr.createNodeAnchors(this,o||"a"),y={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:d,onTagObj:l,replacer:r,schema:this.schema,sourceObjects:m},f=lp.createNode(e,p,y);return a&&oe.isCollection(f)&&(f.flow=!0),u(),f}createPair(e,t,i={}){let r=this.createNode(e,null,i),s=this.createNode(t,null,i);return new rp.Pair(r,s)}delete(e){return nt(this.contents)?this.contents.delete(e):!1}deleteIn(e){return tt.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):nt(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return oe.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return tt.isEmptyPath(e)?!t&&oe.isScalar(this.contents)?this.contents.value:this.contents:oe.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return oe.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return tt.isEmptyPath(e)?this.contents!==void 0:oe.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=tt.collectionFromPath(this.schema,[e],t):nt(this.contents)&&this.contents.set(e,t)}setIn(e,t){tt.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=tt.collectionFromPath(this.schema,Array.from(e),t):nt(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let i;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new dr.Directives({version:"1.1"}),i={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new dr.Directives({version:e}),i={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,i=null;break;default:{let r=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${r}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(i)this.schema=new op.Schema(Object.assign(i,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:i,maxAliasCount:r,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:i===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},c=sp.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:p}of a.anchors.values())s(p,l);return typeof o=="function"?cp.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return ap.stringifyDocument(this,e)}};function nt(n){if(oe.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}ha.Document=ur});var Rt=w(Ot=>{"use strict";var Lt=class extends Error{constructor(e,t,i,r){super(),this.name=e,this.code=i,this.message=r,this.pos=t}},fr=class extends Lt{constructor(e,t,i){super("YAMLParseError",e,t,i)}},pr=class extends Lt{constructor(e,t,i){super("YAMLWarning",e,t,i)}},dp=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:i,col:r}=t.linePos[0];t.message+=` at line ${i}, column ${r}`;let s=r-1,o=n.substring(e.lineStarts[i-1],e.lineStarts[i]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),i>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[i-2],e.lineStarts[i-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===i&&c.col>r&&(a=Math.max(1,Math.min(c.col-r,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};Ot.YAMLError=Lt;Ot.YAMLParseError=fr;Ot.YAMLWarning=pr;Ot.prettifyError=dp});var It=w(ga=>{"use strict";function up(n,{flow:e,indicator:t,next:i,offset:r,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,p=a,d="",u="",m=!1,y=!1,f=null,h=null,E=null,b=null,_=null,T=null,v=null;for(let N of n)switch(y&&(N.type!=="space"&&N.type!=="newline"&&N.type!=="comma"&&s(N.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),y=!1),f&&(l&&N.type!=="comment"&&N.type!=="newline"&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),f=null),N.type){case"space":!e&&(t!=="doc-start"||i?.type!=="flow-collection")&&N.source.includes("	")&&(f=N),p=!0;break;case"comment":{p||s(N,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let S=N.source.substring(1)||" ";d?d+=u+S:d=S,u="",l=!1;break}case"newline":l?d?d+=N.source:(!T||t!=="seq-item-ind")&&(c=!0):u+=N.source,l=!0,m=!0,(h||E)&&(b=N),p=!0;break;case"anchor":h&&s(N,"MULTIPLE_ANCHORS","A node can have at most one anchor"),N.source.endsWith(":")&&s(N.offset+N.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),h=N,v??(v=N.offset),l=!1,p=!1,y=!0;break;case"tag":{E&&s(N,"MULTIPLE_TAGS","A node can have at most one tag"),E=N,v??(v=N.offset),l=!1,p=!1,y=!0;break}case t:(h||E)&&s(N,"BAD_PROP_ORDER",`Anchors and tags must be after the ${N.source} indicator`),T&&s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.source} in ${e??"collection"}`),T=N,l=t==="seq-item-ind"||t==="explicit-key-ind",p=!1;break;case"comma":if(e){_&&s(N,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),_=N,l=!1,p=!1;break}default:s(N,"UNEXPECTED_TOKEN",`Unexpected ${N.type} token`),l=!1,p=!1}let k=n[n.length-1],A=k?k.offset+k.source.length:r;return y&&i&&i.type!=="space"&&i.type!=="newline"&&i.type!=="comma"&&(i.type!=="scalar"||i.source!=="")&&s(i.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),f&&(l&&f.indent<=o||i?.type==="block-map"||i?.type==="block-seq")&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:_,found:T,spaceBefore:c,comment:d,hasNewline:m,anchor:h,tag:E,newlineAfterProp:b,end:A,start:v??A}}ga.resolveProps=up});var $n=w(ya=>{"use strict";function mr(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(mr(e.key)||mr(e.value))return!0}return!1;default:return!0}}ya.containsNewline=mr});var hr=w(ba=>{"use strict";var fp=$n();function pp(n,e,t){if(e?.type==="flow-collection"){let i=e.end[0];i.indent===n&&(i.source==="]"||i.source==="}")&&fp.containsNewline(e)&&t(i,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}ba.flowIndentCheck=pp});var gr=w(_a=>{"use strict";var Ea=x();function mp(n,e,t){let{uniqueKeys:i}=n.options;if(i===!1)return!1;let r=typeof i=="function"?i:(s,o)=>s===o||Ea.isScalar(s)&&Ea.isScalar(o)&&s.value===o.value;return e.some(s=>r(s.key,t))}_a.mapIncludes=mp});var ka=w(va=>{"use strict";var Ta=ve(),hp=Ae(),Na=It(),gp=$n(),wa=hr(),yp=gr(),Sa="All mapping items must start at the same column";function bp({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??hp.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=i.offset,l=null;for(let p of i.items){let{start:d,key:u,sep:m,value:y}=p,f=Na.resolveProps(d,{indicator:"explicit-key-ind",next:u??m?.[0],offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0}),h=!f.found;if(h){if(u&&(u.type==="block-seq"?r(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in u&&u.indent!==i.indent&&r(c,"BAD_INDENT",Sa)),!f.anchor&&!f.tag&&!m){l=f.end,f.comment&&(a.comment?a.comment+=`
`+f.comment:a.comment=f.comment);continue}(f.newlineAfterProp||gp.containsNewline(u))&&r(u??d[d.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else f.found?.indent!==i.indent&&r(c,"BAD_INDENT",Sa);t.atKey=!0;let E=f.end,b=u?n(t,u,f,r):e(t,E,d,null,f,r);t.schema.compat&&wa.flowIndentCheck(i.indent,u,r),t.atKey=!1,yp.mapIncludes(t,a.items,b)&&r(E,"DUPLICATE_KEY","Map keys must be unique");let _=Na.resolveProps(m??[],{indicator:"map-value-ind",next:y,offset:b.range[2],onError:r,parentIndent:i.indent,startOnNewline:!u||u.type==="block-scalar"});if(c=_.end,_.found){h&&(y?.type==="block-map"&&!_.hasNewline&&r(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&f.start<_.found.offset-1024&&r(b.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let T=y?n(t,y,_,r):e(t,c,m,null,_,r);t.schema.compat&&wa.flowIndentCheck(i.indent,y,r),c=T.range[2];let v=new Ta.Pair(b,T);t.options.keepSourceTokens&&(v.srcToken=p),a.items.push(v)}else{h&&r(b.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),_.comment&&(b.comment?b.comment+=`
`+_.comment:b.comment=_.comment);let T=new Ta.Pair(b);t.options.keepSourceTokens&&(T.srcToken=p),a.items.push(T)}}return l&&l<c&&r(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[i.offset,c,l??c],a}va.resolveBlockMap=bp});var La=w(Aa=>{"use strict";var Ep=Le(),_p=It(),Tp=hr();function Np({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??Ep.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=i.offset,l=null;for(let{start:p,value:d}of i.items){let u=_p.resolveProps(p,{indicator:"seq-item-ind",next:d,offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0});if(!u.found)if(u.anchor||u.tag||d)d?.type==="block-seq"?r(u.end,"BAD_INDENT","All sequence items must start at the same column"):r(c,"MISSING_CHAR","Sequence item without - indicator");else{l=u.end,u.comment&&(a.comment=u.comment);continue}let m=d?n(t,d,u,r):e(t,u.end,p,null,u,r);t.schema.compat&&Tp.flowIndentCheck(i.indent,d,r),c=m.range[2],a.items.push(m)}return a.range=[i.offset,c,l??c],a}Aa.resolveBlockSeq=Np});var it=w(Oa=>{"use strict";function wp(n,e,t,i){let r="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&i(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let p=c.substring(1)||" ";r?r+=o+p:r=p,o="";break}case"newline":r&&(o+=c),s=!0;break;default:i(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:r,offset:e}}Oa.resolveEnd=wp});var Ca=w(xa=>{"use strict";var Sp=x(),vp=ve(),Ra=Ae(),kp=Le(),Ap=it(),Ia=It(),Lp=$n(),Op=gr(),yr="Block collections are not allowed within flow collections",br=n=>n&&(n.type==="block-map"||n.type==="block-seq");function Rp({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=i.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?Ra.YAMLMap:kp.YAMLSeq),l=new c(t.schema);l.flow=!0;let p=t.atRoot;p&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let d=i.offset+i.start.source.length;for(let h=0;h<i.items.length;++h){let E=i.items[h],{start:b,key:_,sep:T,value:v}=E,k=Ia.resolveProps(b,{flow:a,indicator:"explicit-key-ind",next:_??T?.[0],offset:d,onError:r,parentIndent:i.indent,startOnNewline:!1});if(!k.found){if(!k.anchor&&!k.tag&&!T&&!v){h===0&&k.comma?r(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):h<i.items.length-1&&r(k.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),k.comment&&(l.comment?l.comment+=`
`+k.comment:l.comment=k.comment),d=k.end;continue}!o&&t.options.strict&&Lp.containsNewline(_)&&r(_,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(h===0)k.comma&&r(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(k.comma||r(k.start,"MISSING_CHAR",`Missing , between ${a} items`),k.comment){let A="";e:for(let N of b)switch(N.type){case"comma":case"space":break;case"comment":A=N.source.substring(1);break e;default:break e}if(A){let N=l.items[l.items.length-1];Sp.isPair(N)&&(N=N.value??N.key),N.comment?N.comment+=`
`+A:N.comment=A,k.comment=k.comment.substring(A.length+1)}}if(!o&&!T&&!k.found){let A=v?n(t,v,k,r):e(t,k.end,T,null,k,r);l.items.push(A),d=A.range[2],br(v)&&r(A.range,"BLOCK_IN_FLOW",yr)}else{t.atKey=!0;let A=k.end,N=_?n(t,_,k,r):e(t,A,b,null,k,r);br(_)&&r(N.range,"BLOCK_IN_FLOW",yr),t.atKey=!1;let S=Ia.resolveProps(T??[],{flow:a,indicator:"map-value-ind",next:v,offset:N.range[2],onError:r,parentIndent:i.indent,startOnNewline:!1});if(S.found){if(!o&&!k.found&&t.options.strict){if(T)for(let U of T){if(U===S.found)break;if(U.type==="newline"){r(U,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}k.start<S.found.offset-1024&&r(S.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else v&&("source"in v&&v.source?.[0]===":"?r(v,"MISSING_CHAR",`Missing space after : in ${a}`):r(S.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let P=v?n(t,v,S,r):S.found?e(t,S.end,T,null,S,r):null;P?br(v)&&r(P.range,"BLOCK_IN_FLOW",yr):S.comment&&(N.comment?N.comment+=`
`+S.comment:N.comment=S.comment);let W=new vp.Pair(N,P);if(t.options.keepSourceTokens&&(W.srcToken=E),o){let U=l;Op.mapIncludes(t,U.items,N)&&r(A,"DUPLICATE_KEY","Map keys must be unique"),U.items.push(W)}else{let U=new Ra.YAMLMap(t.schema);U.flow=!0,U.items.push(W);let R=(P??N).range;U.range=[N.range[0],R[1],R[2]],l.items.push(U)}d=P?P.range[2]:S.end}}let u=o?"}":"]",[m,...y]=i.end,f=d;if(m?.source===u)f=m.offset+m.source.length;else{let h=a[0].toUpperCase()+a.substring(1),E=p?`${h} must end with a ${u}`:`${h} in block collection must be sufficiently indented and end with a ${u}`;r(d,p?"MISSING_CHAR":"BAD_INDENT",E),m&&m.source.length!==1&&y.unshift(m)}if(y.length>0){let h=Ap.resolveEnd(y,f,t.options.strict,r);h.comment&&(l.comment?l.comment+=`
`+h.comment:l.comment=h.comment),l.range=[i.offset,f,h.offset]}else l.range=[i.offset,f,f];return l}xa.resolveFlowCollection=Rp});var Pa=w(Da=>{"use strict";var Ip=x(),xp=B(),Cp=Ae(),Dp=Le(),Pp=ka(),qp=La(),$p=Ca();function Er(n,e,t,i,r,s){let o=t.type==="block-map"?Pp.resolveBlockMap(n,e,t,i,s):t.type==="block-seq"?qp.resolveBlockSeq(n,e,t,i,s):$p.resolveFlowCollection(n,e,t,i,s),a=o.constructor;return r==="!"||r===a.tagName?(o.tag=a.tagName,o):(r&&(o.tag=r),o)}function Up(n,e,t,i,r){let s=i.tag,o=s?e.directives.tagName(s.source,u=>r(s,"TAG_RESOLVE_FAILED",u)):null;if(t.type==="block-seq"){let{anchor:u,newlineAfterProp:m}=i,y=u&&s?u.offset>s.offset?u:s:u??s;y&&(!m||m.offset<y.offset)&&r(y,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===Cp.YAMLMap.tagName&&a==="map"||o===Dp.YAMLSeq.tagName&&a==="seq")return Er(n,e,t,r,o);let c=e.schema.tags.find(u=>u.tag===o&&u.collection===a);if(!c){let u=e.schema.knownTags[o];if(u?.collection===a)e.schema.tags.push(Object.assign({},u,{default:!1})),c=u;else return u?r(s,"BAD_COLLECTION_TYPE",`${u.tag} used for ${a} collection, but expects ${u.collection??"scalar"}`,!0):r(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),Er(n,e,t,r,o)}let l=Er(n,e,t,r,o,c),p=c.resolve?.(l,u=>r(s,"TAG_RESOLVE_FAILED",u),e.options)??l,d=Ip.isNode(p)?p:new xp.Scalar(p);return d.range=l.range,d.tag=o,c?.format&&(d.format=c.format),d}Da.composeCollection=Up});var Tr=w(qa=>{"use strict";var _r=B();function Mp(n,e,t){let i=e.offset,r=Fp(e,n.options.strict,t);if(!r)return{value:"",type:null,comment:"",range:[i,i,i]};let s=r.mode===">"?_r.Scalar.BLOCK_FOLDED:_r.Scalar.BLOCK_LITERAL,o=e.source?Bp(e.source):[],a=o.length;for(let f=o.length-1;f>=0;--f){let h=o[f][1];if(h===""||h==="\r")a=f;else break}if(a===0){let f=r.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",h=i+r.length;return e.source&&(h+=e.source.length),{value:f,type:s,comment:r.comment,range:[i,h,h]}}let c=e.indent+r.indent,l=e.offset+r.length,p=0;for(let f=0;f<a;++f){let[h,E]=o[f];if(E===""||E==="\r")r.indent===0&&h.length>c&&(c=h.length);else{h.length<c&&t(l+h.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),r.indent===0&&(c=h.length),p=f,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=h.length+E.length+1}for(let f=o.length-1;f>=a;--f)o[f][0].length>c&&(a=f+1);let d="",u="",m=!1;for(let f=0;f<p;++f)d+=o[f][0].slice(c)+`
`;for(let f=p;f<a;++f){let[h,E]=o[f];l+=h.length+E.length+1;let b=E[E.length-1]==="\r";if(b&&(E=E.slice(0,-1)),E&&h.length<c){let T=`Block scalar lines must not be less indented than their ${r.indent?"explicit indentation indicator":"first line"}`;t(l-E.length-(b?2:1),"BAD_INDENT",T),h=""}s===_r.Scalar.BLOCK_LITERAL?(d+=u+h.slice(c)+E,u=`
`):h.length>c||E[0]==="	"?(u===" "?u=`
`:!m&&u===`
`&&(u=`

`),d+=u+h.slice(c)+E,u=`
`,m=!0):E===""?u===`
`?d+=`
`:u=`
`:(d+=u+E,u=" ",m=!1)}switch(r.chomp){case"-":break;case"+":for(let f=a;f<o.length;++f)d+=`
`+o[f][0].slice(c);d[d.length-1]!==`
`&&(d+=`
`);break;default:d+=`
`}let y=i+r.length+e.source.length;return{value:d,type:s,comment:r.comment,range:[i,y,y]}}function Fp({offset:n,props:e},t,i){if(e[0].type!=="block-scalar-header")return i(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:r}=e[0],s=r[0],o=0,a="",c=-1;for(let u=1;u<r.length;++u){let m=r[u];if(!a&&(m==="-"||m==="+"))a=m;else{let y=Number(m);!o&&y?o=y:c===-1&&(c=n+u)}}c!==-1&&i(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${r}`);let l=!1,p="",d=r.length;for(let u=1;u<e.length;++u){let m=e[u];switch(m.type){case"space":l=!0;case"newline":d+=m.source.length;break;case"comment":t&&!l&&i(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),d+=m.source.length,p=m.source.substring(1);break;case"error":i(m,"UNEXPECTED_TOKEN",m.message),d+=m.source.length;break;default:{let y=`Unexpected token in block scalar header: ${m.type}`;i(m,"UNEXPECTED_TOKEN",y);let f=m.source;f&&typeof f=="string"&&(d+=f.length)}}}return{mode:s,indent:o,chomp:a,comment:p,length:d}}function Bp(n){let e=n.split(/\n( *)/),t=e[0],i=t.match(/^( *)/),s=[i?.[1]?[i[1],t.slice(i[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}qa.resolveBlockScalar=Mp});var wr=w(Ua=>{"use strict";var Nr=B(),jp=it();function Kp(n,e,t){let{offset:i,type:r,source:s,end:o}=n,a,c,l=(u,m,y)=>t(i+u,m,y);switch(r){case"scalar":a=Nr.Scalar.PLAIN,c=Xp(s,l);break;case"single-quoted-scalar":a=Nr.Scalar.QUOTE_SINGLE,c=zp(s,l);break;case"double-quoted-scalar":a=Nr.Scalar.QUOTE_DOUBLE,c=Yp(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${r}`),{value:"",type:null,comment:"",range:[i,i+s.length,i+s.length]}}let p=i+s.length,d=jp.resolveEnd(o,p,e,t);return{value:c,type:a,comment:d.comment,range:[i,p,d.offset]}}function Xp(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),$a(n)}function zp(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),$a(n.slice(1,-1)).replace(/''/g,"'")}function $a(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let i=e.exec(n);if(!i)return n;let r=i[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;i=t.exec(n);)i[1]===""?s===`
`?r+=s:s=`
`:(r+=s+i[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,i=a.exec(n),r+s+(i?.[1]??"")}function Yp(n,e){let t="";for(let i=1;i<n.length-1;++i){let r=n[i];if(!(r==="\r"&&n[i+1]===`
`))if(r===`
`){let{fold:s,offset:o}=Vp(n,i);t+=s,i=o}else if(r==="\\"){let s=n[++i],o=Gp[s];if(o)t+=o;else if(s===`
`)for(s=n[i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="\r"&&n[i+1]===`
`)for(s=n[++i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=Jp(n,i+1,a,e),i+=a}else{let a=n.substr(i-1,2);e(i-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(r===" "||r==="	"){let s=i,o=n[i+1];for(;o===" "||o==="	";)o=n[++i+1];o!==`
`&&!(o==="\r"&&n[i+2]===`
`)&&(t+=i>s?n.slice(s,i+1):r)}else t+=r}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function Vp(n,e){let t="",i=n[e+1];for(;(i===" "||i==="	"||i===`
`||i==="\r")&&!(i==="\r"&&n[e+2]!==`
`);)i===`
`&&(t+=`
`),e+=1,i=n[e+1];return t||(t=" "),{fold:t,offset:e}}var Gp={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function Jp(n,e,t,i){let r=n.substr(e,t),o=r.length===t&&/^[0-9a-fA-F]+$/.test(r)?parseInt(r,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return i(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Ua.resolveFlowScalar=Kp});var Ba=w(Fa=>{"use strict";var Ue=x(),Ma=B(),Hp=Tr(),Wp=wr();function Zp(n,e,t,i){let{value:r,type:s,comment:o,range:a}=e.type==="block-scalar"?Hp.resolveBlockScalar(n,e,i):Wp.resolveFlowScalar(e,n.options.strict,i),c=t?n.directives.tagName(t.source,d=>i(t,"TAG_RESOLVE_FAILED",d)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Ue.SCALAR]:c?l=Qp(n.schema,r,c,t,i):e.type==="scalar"?l=em(n,r,e,i):l=n.schema[Ue.SCALAR];let p;try{let d=l.resolve(r,u=>i(t??e,"TAG_RESOLVE_FAILED",u),n.options);p=Ue.isScalar(d)?d:new Ma.Scalar(d)}catch(d){let u=d instanceof Error?d.message:String(d);i(t??e,"TAG_RESOLVE_FAILED",u),p=new Ma.Scalar(r)}return p.range=a,p.source=r,s&&(p.type=s),c&&(p.tag=c),l.format&&(p.format=l.format),o&&(p.comment=o),p}function Qp(n,e,t,i,r){if(t==="!")return n[Ue.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(r(i,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Ue.SCALAR])}function em({atKey:n,directives:e,schema:t},i,r,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(i))||t[Ue.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(i))??t[Ue.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),p=`Value may be parsed as either ${c} or ${l}`;s(r,"TAG_RESOLVE_FAILED",p,!0)}}return o}Fa.composeScalar=Zp});var Ka=w(ja=>{"use strict";function tm(n,e,t){if(e){t??(t=e.length);for(let i=t-1;i>=0;--i){let r=e[i];switch(r.type){case"space":case"comment":case"newline":n-=r.source.length;continue}for(r=e[++i];r?.type==="space";)n+=r.source.length,r=e[++i];break}}return n}ja.emptyScalarPosition=tm});var Ya=w(vr=>{"use strict";var nm=ut(),im=x(),rm=Pa(),Xa=Ba(),sm=it(),om=Ka(),am={composeNode:za,composeEmptyNode:Sr};function za(n,e,t,i){let r=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,p=!0;switch(e.type){case"alias":l=cm(n,e,i),(a||c)&&i(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=Xa.composeScalar(n,e,c,i),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=rm.composeCollection(am,n,e,t,i),a&&(l.anchor=a.source.substring(1))}catch(d){let u=d instanceof Error?d.message:String(d);i(e,"RESOURCE_EXHAUSTION",u)}break;default:{let d=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;i(e,"UNEXPECTED_TOKEN",d),p=!1}}return l??(l=Sr(n,e.offset,void 0,null,t,i)),a&&l.anchor===""&&i(a,"BAD_ALIAS","Anchor cannot be an empty string"),r&&n.options.stringKeys&&(!im.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&i(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&p&&(l.srcToken=e),l}function Sr(n,e,t,i,{spaceBefore:r,comment:s,anchor:o,tag:a,end:c},l){let p={type:"scalar",offset:om.emptyScalarPosition(e,t,i),indent:-1,source:""},d=Xa.composeScalar(n,p,a,l);return o&&(d.anchor=o.source.substring(1),d.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),r&&(d.spaceBefore=!0),s&&(d.comment=s,d.range[2]=c),d}function cm({options:n},{offset:e,source:t,end:i},r){let s=new nm.Alias(t.substring(1));s.source===""&&r(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&r(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=sm.resolveEnd(i,o,n.strict,r);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}vr.composeEmptyNode=Sr;vr.composeNode=za});var Ja=w(Ga=>{"use strict";var lm=At(),Va=Ya(),dm=it(),um=It();function fm(n,e,{offset:t,start:i,value:r,end:s},o){let a=Object.assign({_directives:e},n),c=new lm.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},p=um.resolveProps(i,{indicator:"doc-start",next:r??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});p.found&&(c.directives.docStart=!0,r&&(r.type==="block-map"||r.type==="block-seq")&&!p.hasNewline&&o(p.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=r?Va.composeNode(l,r,p,o):Va.composeEmptyNode(l,p.end,i,null,p,o);let d=c.contents.range[2],u=dm.resolveEnd(s,d,!1,o);return u.comment&&(c.comment=u.comment),c.range=[t,d,u.offset],c}Ga.composeDoc=fm});var Ar=w(Za=>{"use strict";var pm=Kt("process"),mm=fi(),hm=At(),xt=Rt(),Ha=x(),gm=Ja(),ym=it();function Ct(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function Wa(n){let e="",t=!1,i=!1;for(let r=0;r<n.length;++r){let s=n[r];switch(s[0]){case"#":e+=(e===""?"":i?`

`:`
`)+(s.substring(1)||" "),t=!0,i=!1;break;case"%":n[r+1]?.[0]!=="#"&&(r+=1),t=!1;break;default:t||(i=!0),t=!1}}return{comment:e,afterEmptyLine:i}}var kr=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,i,r,s)=>{let o=Ct(t);s?this.warnings.push(new xt.YAMLWarning(o,i,r)):this.errors.push(new xt.YAMLParseError(o,i,r))},this.directives=new mm.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:i,afterEmptyLine:r}=Wa(this.prelude);if(i){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${i}`:i;else if(r||e.directives.docStart||!s)e.commentBefore=i;else if(Ha.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];Ha.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${i}
${a}`:i}else{let o=s.commentBefore;s.commentBefore=o?`${i}
${o}`:i}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:Wa(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,i=-1){for(let r of e)yield*this.next(r);yield*this.end(t,i)}*next(e){switch(pm.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,i,r)=>{let s=Ct(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",i,r)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=gm.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,i=new xt.YAMLParseError(Ct(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(i):this.doc.errors.push(i);break}case"doc-end":{if(!this.doc){let i="Unexpected doc-end without preceding document";this.errors.push(new xt.YAMLParseError(Ct(e),"UNEXPECTED_TOKEN",i));break}this.doc.directives.docEnd=!0;let t=ym.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let i=this.doc.comment;this.doc.comment=i?`${i}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new xt.YAMLParseError(Ct(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let i=Object.assign({_directives:this.directives},this.options),r=new hm.Document(void 0,i);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),r.range=[0,t,t],this.decorate(r,!1),yield r}}};Za.Composer=kr});var tc=w(Un=>{"use strict";var bm=Tr(),Em=wr(),_m=Rt(),Qa=gt();function Tm(n,e=!0,t){if(n){let i=(r,s,o)=>{let a=typeof r=="number"?r:Array.isArray(r)?r[0]:r.offset;if(t)t(a,s,o);else throw new _m.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return Em.resolveFlowScalar(n,e,i);case"block-scalar":return bm.resolveBlockScalar({options:{strict:e}},n,i)}}return null}function Nm(n,e){let{implicitKey:t=!1,indent:i,inFlow:r=!1,offset:s=-1,type:o="PLAIN"}=e,a=Qa.stringifyString({type:o,value:n},{implicitKey:t,indent:i>0?" ".repeat(i):"",inFlow:r,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:i,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),p=a.substring(0,l),d=a.substring(l+1)+`
`,u=[{type:"block-scalar-header",offset:s,indent:i,source:p}];return ec(u,c)||u.push({type:"newline",offset:-1,indent:i,source:`
`}),{type:"block-scalar",offset:s,indent:i,props:u,source:d}}case'"':return{type:"double-quoted-scalar",offset:s,indent:i,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:i,source:a,end:c};default:return{type:"scalar",offset:s,indent:i,source:a,end:c}}}function wm(n,e,t={}){let{afterKey:i=!1,implicitKey:r=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(i&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=Qa.stringifyString({type:o,value:e},{implicitKey:r||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Sm(n,c);break;case'"':Lr(n,c,"double-quoted-scalar");break;case"'":Lr(n,c,"single-quoted-scalar");break;default:Lr(n,c,"scalar")}}function Sm(n,e){let t=e.indexOf(`
`),i=e.substring(0,t),r=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=i,n.source=r}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:i}];ec(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:r})}}function ec(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function Lr(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let i=n.props.slice(1),r=e.length;n.props[0].type==="block-scalar-header"&&(r-=n.props[0].source.length);for(let s of i)s.offset+=r;delete n.props,Object.assign(n,{type:t,source:e,end:i});break}case"block-map":case"block-seq":{let r={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[r]});break}default:{let i="indent"in n?n.indent:-1,r="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:i,source:e,end:r})}}}Un.createScalarToken=Nm;Un.resolveAsScalar=Tm;Un.setScalarValue=wm});var ic=w(nc=>{"use strict";var vm=n=>"type"in n?Fn(n):Mn(n);function Fn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Fn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=Mn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=Mn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=Mn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function Mn({start:n,key:e,sep:t,value:i}){let r="";for(let s of n)r+=s.source;if(e&&(r+=Fn(e)),t)for(let s of t)r+=s.source;return i&&(r+=Fn(i)),r}nc.stringify=vm});var ac=w(oc=>{"use strict";var Or=Symbol("break visit"),km=Symbol("skip children"),rc=Symbol("remove item");function Me(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),sc(Object.freeze([]),n,e)}Me.BREAK=Or;Me.SKIP=km;Me.REMOVE=rc;Me.itemAtPath=(n,e)=>{let t=n;for(let[i,r]of e){let s=t?.[i];if(s&&"items"in s)t=s.items[r];else return}return t};Me.parentCollection=(n,e)=>{let t=Me.itemAtPath(n,e.slice(0,-1)),i=e[e.length-1][0],r=t?.[i];if(r&&"items"in r)return r;throw new Error("Parent collection not found")};function sc(n,e,t){let i=t(e,n);if(typeof i=="symbol")return i;for(let r of["key","value"]){let s=e[r];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=sc(Object.freeze(n.concat([[r,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===Or)return Or;a===rc&&(s.items.splice(o,1),o-=1)}}typeof i=="function"&&r==="key"&&(i=i(e,n))}}return typeof i=="function"?i(e,n):i}oc.visit=Me});var Bn=w(te=>{"use strict";var Rr=tc(),Am=ic(),Lm=ac(),Ir="\uFEFF",xr="",Cr="",Dr="",Om=n=>!!n&&"items"in n,Rm=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function Im(n){switch(n){case Ir:return"<BOM>";case xr:return"<DOC>";case Cr:return"<FLOW_END>";case Dr:return"<SCALAR>";default:return JSON.stringify(n)}}function xm(n){switch(n){case Ir:return"byte-order-mark";case xr:return"doc-mode";case Cr:return"flow-error-end";case Dr:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}te.createScalarToken=Rr.createScalarToken;te.resolveAsScalar=Rr.resolveAsScalar;te.setScalarValue=Rr.setScalarValue;te.stringify=Am.stringify;te.visit=Lm.visit;te.BOM=Ir;te.DOCUMENT=xr;te.FLOW_END=Cr;te.SCALAR=Dr;te.isCollection=Om;te.isScalar=Rm;te.prettyToken=Im;te.tokenType=xm});var $r=w(lc=>{"use strict";var Dt=Bn();function ce(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var cc=new Set("0123456789ABCDEFabcdef"),Cm=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),jn=new Set(",[]{}"),Dm=new Set(` ,[]{}
\r	`),Pr=n=>!n||Dm.has(n),qr=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let i=this.next??"stream";for(;i&&(t||this.hasChars(1));)i=yield*this.parseNext(i)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let i=0;for(;t===" ";)t=this.buffer[++i+e];if(t==="\r"){let r=this.buffer[i+e+1];if(r===`
`||!r&&!this.atEnd)return e+i+1}return t===`
`||i>=this.indentNext||!t&&!this.atEnd?e+i:-1}if(t==="-"||t==="."){let i=this.buffer.substr(e,3);if((i==="---"||i==="...")&&ce(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===Dt.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,i=e.indexOf("#");for(;i!==-1;){let s=e[i-1];if(s===" "||s==="	"){t=i-1;break}else i=e.indexOf("#",i+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let r=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-r),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield Dt.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ce(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ce(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ce(t)){let i=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=i,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(Pr),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,i=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=i=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let r=this.getLine();if(r===null)return this.setNext("flow");if((i!==-1&&i<this.indentNext&&r[0]!=="#"||i===0&&(r.startsWith("---")||r.startsWith("..."))&&ce(r[3]))&&!(i===this.indentNext-1&&this.flowLevel===1&&(r[0]==="]"||r[0]==="}")))return this.flowLevel=0,yield Dt.FLOW_END,yield*this.parseLineStart();let s=0;for(;r[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),r[s]){case void 0:return"flow";case"#":return yield*this.pushCount(r.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(Pr),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ce(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let i=this.buffer.substring(0,t),r=i.indexOf(`
`,this.pos);if(r!==-1){for(;r!==-1;){let s=this.continueScalar(r+1);if(s===-1)break;r=i.indexOf(`
`,s)}r!==-1&&(t=r-(i[r-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ce(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,i;e:for(let s=this.pos;i=this.buffer[s];++s)switch(i){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!i&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let r=e+1;for(i=this.buffer[r];i===" ";)i=this.buffer[++r];if(i==="	"){for(;i==="	"||i===" "||i==="\r"||i===`
`;)i=this.buffer[++r];e=r-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield Dt.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,i=this.pos-1,r;for(;r=this.buffer[++i];)if(r===":"){let s=this.buffer[i+1];if(ce(s)||e&&jn.has(s))break;t=i}else if(ce(r)){let s=this.buffer[i+1];if(r==="\r"&&(s===`
`?(i+=1,r=`
`,s=this.buffer[i+1]):t=i),s==="#"||e&&jn.has(s))break;if(r===`
`){let o=this.continueScalar(i+1);if(o===-1)break;i=Math.max(i,o-2)}}else{if(e&&jn.has(r))break;t=i}return!r&&!this.atEnd?this.setNext("plain-scalar"):(yield Dt.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let i=this.buffer.slice(this.pos,e);return i?(yield i,this.pos+=i.length,i.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(Pr),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,i=this.charAt(1);if(ce(i)||t&&jn.has(i)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ce(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(Cm.has(t))t=this.buffer[++e];else if(t==="%"&&cc.has(this.buffer[e+1])&&cc.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,i;do i=this.buffer[++t];while(i===" "||e&&i==="	");let r=t-this.pos;return r>0&&(yield this.buffer.substr(this.pos,r),this.pos=t),r}*pushUntil(e){let t=this.pos,i=this.buffer[t];for(;!e(i);)i=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};lc.Lexer=qr});var Mr=w(dc=>{"use strict";var Ur=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,i=this.lineStarts.length;for(;t<i;){let s=t+i>>1;this.lineStarts[s]<e?t=s+1:i=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let r=this.lineStarts[t-1];return{line:t,col:e-r+1}}}};dc.LineCounter=Ur});var Br=w(hc=>{"use strict";var Pm=Kt("process"),uc=Bn(),qm=$r();function Oe(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function fc(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function mc(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function Kn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function rt(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function Xn(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function pc(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Oe(e.start,"explicit-key-ind")&&!Oe(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,mc(e.value)?e.value.end?Xn(e.value.end,e.sep):e.value.end=e.sep:Xn(e.start,e.sep),delete e.sep)}var Fr=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new qm.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let i of this.lexer.lex(e,t))yield*this.next(i);t||(yield*this.end())}*next(e){if(this.source=e,Pm.env.LOG_TOKENS&&console.log("|",uc.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=uc.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let i=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:i,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let i=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in i?i.indent:0:t.type==="flow-collection"&&i.type==="document"&&(t.indent=0),t.type==="flow-collection"&&pc(t),i.type){case"document":i.value=t;break;case"block-scalar":i.props.push(t);break;case"block-map":{let r=i.items[i.items.length-1];if(r.value){i.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(r.sep)r.value=t;else{Object.assign(r,{key:t,sep:[]}),this.onKeyLine=!r.explicitKey;return}break}case"block-seq":{let r=i.items[i.items.length-1];r.value?i.items.push({start:[],value:t}):r.value=t;break}case"flow-collection":{let r=i.items[i.items.length-1];!r||r.value?i.items.push({start:[],key:t,sep:[]}):r.sep?r.value=t:Object.assign(r,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((i.type==="document"||i.type==="block-map"||i.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let r=t.items[t.items.length-1];r&&!r.sep&&!r.value&&r.start.length>0&&fc(r.start)===-1&&(t.indent===0||r.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(i.type==="document"?i.end=r.start:i.items.push({start:r.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{fc(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=Kn(this.peek(2)),i=rt(t),r;e.end?(r=e.end,r.push(this.sourceToken),delete e.end):r=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:i,key:e,sep:r}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){Xn(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let i=!this.onKeyLine&&this.indent===e.indent,r=i&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(r&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":r||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):r||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Oe(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(mc(t.key)&&!Oe(t.sep,"newline")){let o=rt(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Oe(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=rt(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||r?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Oe(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);r||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Oe(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else i&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){Xn(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Oe(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let i=this.startBlockValue(e);if(i){this.stack.push(i);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let i;do yield*this.pop(),i=this.peek(1);while(i?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let r=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:r,sep:[]}):t.sep?this.stack.push(r):Object.assign(t,{key:r,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let i=this.startBlockValue(e);i?this.stack.push(i):(yield*this.pop(),yield*this.step())}else{let i=this.peek(2);if(i.type==="block-map"&&(this.type==="map-value-ind"&&i.indent===e.indent||this.type==="newline"&&!i.items[i.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&i.type!=="flow-collection"){let r=Kn(i),s=rt(r);pc(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=Kn(e),i=rt(t);return i.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=Kn(e),i=rt(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(i=>i.type==="newline"||i.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};hc.Parser=Fr});var _c=w(qt=>{"use strict";var gc=Ar(),$m=At(),Pt=Rt(),Um=vi(),Mm=x(),Fm=Mr(),yc=Br();function bc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new Fm.LineCounter||null,prettyErrors:e}}function Bm(n,e={}){let{lineCounter:t,prettyErrors:i}=bc(e),r=new yc.Parser(t?.addNewLine),s=new gc.Composer(e),o=Array.from(s.compose(r.parse(n)));if(i&&t)for(let a of o)a.errors.forEach(Pt.prettifyError(n,t)),a.warnings.forEach(Pt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function Ec(n,e={}){let{lineCounter:t,prettyErrors:i}=bc(e),r=new yc.Parser(t?.addNewLine),s=new gc.Composer(e),o=null;for(let a of s.compose(r.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new Pt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return i&&t&&(o.errors.forEach(Pt.prettifyError(n,t)),o.warnings.forEach(Pt.prettifyError(n,t))),o}function jm(n,e,t){let i;typeof e=="function"?i=e:t===void 0&&e&&typeof e=="object"&&(t=e);let r=Ec(n,t);if(!r)return null;if(r.warnings.forEach(s=>Um.warn(r.options.logLevel,s)),r.errors.length>0){if(r.options.logLevel!=="silent")throw r.errors[0];r.errors=[]}return r.toJS(Object.assign({reviver:i},t))}function Km(n,e,t){let i=null;if(typeof e=="function"||Array.isArray(e)?i=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let r=Math.round(t);t=r<1?void 0:r>8?{indent:8}:{indent:r}}if(n===void 0){let{keepUndefined:r}=t??e??{};if(!r)return}return Mm.isDocument(n)&&!i?n.toString(t):new $m.Document(n,i,t).toString(t)}qt.parse=jm;qt.parseAllDocuments=Bm;qt.parseDocument=Ec;qt.stringify=Km});var Yn=w(D=>{"use strict";var Xm=Ar(),zm=At(),Ym=ar(),jr=Rt(),Vm=ut(),Re=x(),Gm=ve(),Jm=B(),Hm=Ae(),Wm=Le(),Zm=Bn(),Qm=$r(),eh=Mr(),th=Br(),zn=_c(),Tc=at();D.Composer=Xm.Composer;D.Document=zm.Document;D.Schema=Ym.Schema;D.YAMLError=jr.YAMLError;D.YAMLParseError=jr.YAMLParseError;D.YAMLWarning=jr.YAMLWarning;D.Alias=Vm.Alias;D.isAlias=Re.isAlias;D.isCollection=Re.isCollection;D.isDocument=Re.isDocument;D.isMap=Re.isMap;D.isNode=Re.isNode;D.isPair=Re.isPair;D.isScalar=Re.isScalar;D.isSeq=Re.isSeq;D.Pair=Gm.Pair;D.Scalar=Jm.Scalar;D.YAMLMap=Hm.YAMLMap;D.YAMLSeq=Wm.YAMLSeq;D.CST=Zm;D.Lexer=Qm.Lexer;D.LineCounter=eh.LineCounter;D.Parser=th.Parser;D.parse=zn.parse;D.parseAllDocuments=zn.parseAllDocuments;D.parseDocument=zn.parseDocument;D.stringify=zn.stringify;D.visit=Tc.visit;D.visitAsync=Tc.visitAsync});import{closeSync as _g,existsSync as Bt,fsyncSync as Tg,mkdirSync as Ng,openSync as wg,readFileSync as ll,readdirSync as Sg,renameSync as ol,rmSync as ns,statSync as dl,writeFileSync as vg}from"node:fs";import{randomUUID as al}from"node:crypto";import{dirname as Ft,join as G,resolve as de}from"node:path";import{DatabaseSync as kg}from"node:sqlite";import{createHash as Kl}from"node:crypto";var Xt=9,us=2,fs="0.7.0";function Q(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,i])=>i!==void 0).sort(([i],[r])=>i.localeCompare(r)).map(([i,r])=>[i,e(r)])):t;return JSON.stringify(e(n))}function xe(n){return Kl("sha256").update(Q(n)).digest("hex")}function ps(n){return xe({projectRoot:n}).slice(0,24)}function ms(n){let{zephyrRoot:e,projectRoot:t,...i}=n;return xe(i)}var hs=Xt,gs=`
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
`,ys=`
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
`;import{existsSync as ks,mkdtempSync as pd,readFileSync as md,realpathSync as hd,rmSync as gd,writeFileSync as yd}from"node:fs";import{tmpdir as bd}from"node:os";import{join as Ce,resolve as ai}from"node:path";import{spawnSync as Ed}from"node:child_process";var bs=`#!/usr/bin/env python3
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
        if not os.path.isfile(source):
            discovered += 1
            errors.append({"path": source, "code": "missing-compound", "message": "Referenced by index.xml"})
            continue
        root = ET.parse(source).getroot()
        compound = root.find("compounddef")
        if compound is None:
            discovered += 1
            errors.append({"path": source, "code": "missing-compounddef", "message": "No compounddef element"})
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
                exclusion_id = member.get("id", "") or source + ":" + kind
                if exclusion_id not in excluded_ids:
                    excluded_ids.add(exclusion_id)
                    discovered += 1
                    excluded.append({
                        "id": exclusion_id,
                        "path": source,
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
                excluded.append({"path": source, "reason": "unnamed-member"})
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
`;function Es(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function _s(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),i=[],r={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(r.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=r.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:i.push(a)}};for(let o of t){let a=o.trim();if(a===""){r.kind==="brief"?r={kind:"detail"}:r.kind==="detail"&&i.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",p=""]=c,d=l.toLowerCase(),u=p.trim();switch(d){case"brief":case"short":r={kind:"brief"},s(u);break;case"param":{let m=u.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let y={name:m[2],description:(m[3]??"").trim()};m[1]&&(y.direction=m[1].replace(/\s+/g,"")),e.params.push(y),r={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(u),r={kind:"return",index:e.returns.length-1};break;case"retval":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),r={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),r={kind:"detail"};break}case"addtogroup":e.addtogroup=u.split(/\s+/)[0],r={kind:"detail"};break;case"ingroup":e.ingroup=u.split(/\s+/)[0],r={kind:"detail"};break;case"since":e.since=u,r={kind:"detail"};break;case"deprecated":e.deprecated=!0,r={kind:"detail"},s(u);break;case"note":case"warning":case"details":case"remark":r={kind:"detail"},s(`${l.toUpperCase()}: ${u}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":r={kind:"detail"};break;default:r={kind:"detail"},s(u);break}}e.detail=i.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=ze(e.brief)),e.detail=ze(e.detail),e.returns=e.returns.map(ze);for(let o of e.params)o.description=ze(o.description);for(let o of e.retvals)o.description=ze(o.description);return e}function ze(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function zl(n){let e=[];for(let t of n.split(`
`)){let i=t.trim(),r=i.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(r){e.push({kind:"define",id:r[1],title:(r[2]??"").trim()});continue}let s=i.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of i.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Ye(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var Yl=["z_impl_"];function Vl(n){for(let e of Yl)if(n.startsWith(e))return n.slice(e.length);return n}var Gl=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,Jl=new RegExp(String.raw`^(struct|union|enum)\s+${Gl}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),Hl=/^[^(]*\(\s*\*/;function Wl(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Ye(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let i=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(i)return{kind:"typedef",name:i[1],signature:Ye(e)};let r=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(r)return{kind:"typedef",name:r[1],signature:Ye(e)};let s=e.match(Jl);if(s)return{kind:s[1],name:s[2],signature:Ye(e.replace(/\{[\s\S]*$/,"").trim())};if(Hl.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:Vl(a),signature:Ye(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function Zl(n,e){let t=0,i=!1,r=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(r){l==="*"&&a[c+1]==="/"&&(r=!1,c++);continue}if(l==="/"&&a[c+1]==="*")r=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,i=!0):l==="}"&&t--}}if(i&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),p=c.lastIndexOf("}");return l<0||p<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,p),line:e,endLine:o}}}return null}function Ql(n,e){let t=n.split(`
`).map(f=>/^\s*#/.test(f)?"":f).join(`
`),i=[],r="",s=[],o=[],a=[],c=0,l=e,p=e,d=()=>{i.push({code:r,before:s,trailingPrevious:o,trailingOwn:a,line:p}),r="",s=[],o=[],a=[]};for(let f=0;f<t.length;f++){let h=t[f];if(h===`
`){l++,r+=" ";continue}if(h==="/"&&t[f+1]==="*"){let E=t.indexOf("*/",f+2),b=E<0?t.length:E+2,_=t.slice(f,b);/^\/\*[*!]</.test(_)?(r.trim()?a:o).push(_):/^\/\*[*!]/.test(_)&&s.push(_);for(let T of _)T===`
`&&l++;f=b-1;continue}if(h==="/"&&t[f+1]==="/"){let E=t.indexOf(`
`,f);f=(E<0?t.length:E)-1;continue}if(h==="("||h==="[")c++;else if(h===")"||h==="]")c--;else if(h===","&&c<=0){d();continue}!r.trim()&&h.trim()&&(p=l),r+=h}d();let u=f=>Es(f.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],y=(f,h)=>{f&&h&&!f.brief&&(f.brief=ze(u(h)))};for(let f of i){y(m[m.length-1],f.trailingPrevious[0]);let h=f.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!h)continue;let E=f.before[f.before.length-1],b=E?_s(u(E)):void 0,_=b?.brief??b?.detail??"",T={name:h[1],value:Ye(h[2]??""),brief:_,detail:b?.brief?b.detail??"":"",line:f.line};m.push(T),y(T,f.trailingOwn[0])}return m}function ed(n,e){let t=e,i=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||i.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let r=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];r.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:r.join(`
`),line:t}}function Ts(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=[],r=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,p=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){p=!0;break}if(!p)continue;let d=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),u={text:Es(d),endLine:l},m=_s(u.text),y=zl(u.text);if(y.length>0){let _;for(let T of y)switch(T.kind){case"define":{let v={id:T.id,title:T.title,header:e},k=m.ingroup??s[s.length-1];k&&(v.parent=k),r.push(v),_=T.id;break}case"add":_=T.id;break;case"open":s.push(_??s[s.length-1]??""),_=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let f=ed(t,l+1);if(!f){o=l;continue}let h=Wl(f.text);if(!h){o=l;continue}let E=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],b={name:h.name,kind:h.kind,signature:h.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:f.line+1,deprecated:m.deprecated};if(m.brief&&(b.brief=m.brief),m.detail&&(b.detail=m.detail),E&&(b.group=E),m.since&&(b.since=m.since),i.push(b),o=l,h.kind==="enum"&&f.text.includes("{")){let _=Zl(t,f.line);if(_){for(let T of Ql(_.body,_.line)){let v={name:T.name,kind:"enumvalue",signature:T.value?`${T.name} = ${T.value}`:T.name,params:[],returns:[],retvals:[],header:e,line:T.line+1,deprecated:!1,parentSymbol:h.name};T.brief&&(v.brief=T.brief),T.detail&&(v.detail=T.detail),E&&(v.group=E),i.push(v)}o=_.endLine}}}return{symbols:i,groups:r}}import{existsSync as ad}from"node:fs";import{join as zt}from"node:path";import{spawnSync as Ss}from"node:child_process";import{existsSync as si,readFileSync as td,realpathSync as nd}from"node:fs";import{delimiter as id,join as rd,resolve as sd}from"node:path";function Ns(n,e){if(n.includes("/")||n.includes("\\"))return si(n)?sd(n):void 0;for(let t of(e??"").split(id).filter(Boolean)){let i=rd(t,n);if(si(i))return i}}function od(n){let e=Ns("west",n.PATH);if(e)try{let i=(td(nd(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return i?i[1]?.endsWith("/env")&&i[2]?Ns(i[2].trim().split(/\s+/,1)[0],n.PATH):i[1]&&si(i[1])?i[1]:void 0:void 0}catch{return}}function oi(n){return[n.PYTHON_EXECUTABLE,od(n),"python3","python"].filter((e,t,i)=>!!e&&i.indexOf(e)===t)}function ws(n){let e=new Map;for(let t of n.split(/\r?\n/)){let i=t.split("#")[0].trim();if(i===""||i.startsWith("-"))continue;let[r,...s]=i.split(";"),o=r.split("[")[0].split(/[<>=!~]/)[0].trim();if(o==="")continue;let a=s.join(";").trim();e.has(o)||e.set(o,{name:o,...a?{marker:a}:{}})}return[...e.values()]}function Yt(n=process.env){for(let e of oi(n))if(Ss(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function Ve(n,e=process.env){let t=zt(n,"scripts","kconfig"),i=zt(n,"scripts","dts","python-devicetree","src");if([zt(t,"kconfiglib.py"),zt(i,"devicetree","edtlib.py")].filter(a=>!ad(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=oi(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(i)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(Ss(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}import{existsSync as cd,readdirSync as ld}from"node:fs";import{join as dd,relative as ud,sep as vs}from"node:path";var fd=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function*ie(n,e={}){if(!cd(n))return;let t=e.skipDirs??fd,i=e.skipPrefixes??[],r=[n];for(;r.length>0;){let s=r.pop(),o;try{o=ld(s,{withFileTypes:!0})}catch(a){throw new Error(`Failed to read source directory ${s}: ${a instanceof Error?a.message:String(a)}`)}for(let a of o){let c=dd(s,a.name),l=_e(ud(n,c));if(a.isDirectory()){if(t.has(a.name)||i.some(p=>l===p||l.startsWith(`${p}/`)))continue;r.push(c)}else if(a.isFile()){if(i.some(p=>l.startsWith(`${p}/`))||e.match&&!e.match(a.name))continue;yield l}else if(a.isSymbolicLink())throw new Error(`Refusing symbolic link in indexed source tree: ${c}`)}}}function _e(n){return vs==="/"?n:n.split(vs).join("/")}function As(n){let e=ai(n),t=e;try{t=hd(e)}catch{}return[...new Set([e,t])].flatMap(i=>[ai(i,"..","doxygen","xml"),ai(i,"doc","_build","doxygen","xml")]).find(i=>ks(Ce(i,"index.xml")))}function _d(n,e){if(!ks(Ce(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=pd(Ce(bd(),"zephyr-ai-api-")),i=Ce(t,"api-export.py");try{yd(i,bs,{mode:384});let r=Ed(Yt(),[i,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let o=r.stderr?.trim()??"";try{let a=JSON.parse(r.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(p=>`- ${p.code}: ${p.message}${p.path?` (${p.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(r.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s}finally{gd(t,{recursive:!0,force:!0})}}function Ls(n,e){if(e)return _d(n,e);let t=Ce(n,"include","zephyr"),i=[],r=[],s=[];for(let a of ie(t,{skipPrefixes:["internal","arch/arm/internal"],match:c=>c.endsWith(".h")})){let c;try{c=md(Ce(t,a),"utf8")}catch(d){throw new Error(`Cannot read public API header ${Ce(t,a)}: ${d instanceof Error?d.message:String(d)}`)}let l=`include/zephyr/${a}`,p=Ts(c,l);for(let d of p.symbols){if(d.kind==="function"&&d.signature.includes("=")){s.push({path:`${l}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let u=d.signature.indexOf("["),m=d.signature.indexOf("(");if(d.kind==="function"&&u>=0&&(m<0||u<m)){s.push({path:`${l}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){s.push({path:`${l}:${d.line}`,reason:"fallback-include-guard"});continue}i.push(d)}r.push(...p.groups)}i.sort((a,c)=>a.name.localeCompare(c.name));let o=new Map;for(let a of r)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:i,groups:[...o.values()],mode:"header-fallback",report:{discovered:i.length+o.size+s.length+1,indexed:i.length+o.size,intentionallyExcluded:[...s,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as Nd,mkdtempSync as wd,rmSync as Sd,writeFileSync as vd}from"node:fs";import{tmpdir as kd}from"node:os";import{dirname as Rs,join as ci}from"node:path";import{spawnSync as Ad}from"node:child_process";var Os=`#!/usr/bin/env python3
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
`;var Is=new Map;function xs(n){let e=JSON.stringify(n),t=Is.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let i=Rs(Rs(n[0])),r=ci(i,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!Nd(r))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=wd(ci(kd(),"zephyr-ai-bindings-")),o=ci(s,"binding-export.py");try{vd(o,Os,{mode:384});let a=[o,"--zephyr",i];for(let p of n)a.push("--root",p);let c=Ad(Ve(i),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let p="";try{p=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let d=p||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${d}`)}let l=JSON.parse(c.stdout);return Is.set(e,l),l}finally{Sd(s,{recursive:!0,force:!0})}}var Nc=ri(Yn(),1);import{existsSync as nh,readFileSync as ih,readdirSync as rh}from"node:fs";import{dirname as Kr,join as ge}from"node:path";import{spawnSync as sh}from"node:child_process";function Xr(n){try{let e=(0,Nc.parse)(ih(n,"utf8"),{logLevel:"silent"});if(!e||typeof e!="object"||Array.isArray(e))throw new Error("expected a YAML mapping");return e}catch(e){throw new Error(`Failed to parse board/SoC metadata ${n}: ${e.message}`)}}function le(n){return Array.isArray(n)?n:[]}function $t(n){return le(n).filter(e=>typeof e=="string")}function oh(n){let e=ge(n,"scripts","list_boards.py");if(!nh(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let r of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(r&&(t=sh(r,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let i=new Map;for(let r of t.stdout.split(`
`).filter(Boolean)){let s=r.split("@@").filter(Boolean).map(p=>p.split(";")),o=p=>s.find(([d])=>d===p)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),i.set(a,c)}return i}function ah(n){let e=[],t;try{t=rh(n)}catch{return e}for(let i of t){if(!i.endsWith(".yaml")&&!i.endsWith(".yml")||i==="board.yml"||i==="board.yaml")continue;let r=Xr(ge(n,i)),s={toolchains:$t(r.toolchain),supported:$t(r.supported),...typeof r.name=="string"?{name:r.name}:{},...typeof r.arch=="string"?{arch:r.arch}:{},...typeof r.type=="string"?{type:r.type}:{},...typeof r.ram=="number"?{ram:r.ram}:{},...typeof r.flash=="number"?{flash:r.flash}:{},...typeof r.vendor=="string"?{vendor:r.vendor}:{}};typeof r.identifier=="string"&&e.push({identifier:r.identifier,...s});let o=r.variants&&typeof r.variants=="object"&&!Array.isArray(r.variants)?r.variants:{};for(let[a,c]of Object.entries(o)){let l=c&&typeof c=="object"&&!Array.isArray(c)?c:{};e.push({identifier:a,...s,toolchains:$t(l.toolchain).length?$t(l.toolchain):s.toolchains,supported:[...new Set([...s.supported,...$t(l.supported)])]})}}return e.sort((i,r)=>i.identifier.localeCompare(r.identifier)),e}function wc(n){let e=[],t=oh(n);for(let i of ie(ge(n,"boards"),{match:r=>r==="board.yml"||r==="board.yaml"})){let r=ge(n,"boards",i),s=Xr(r),o=[],a=s.board;a&&typeof a=="object"&&!Array.isArray(a)&&o.push(a);for(let y of le(s.boards))y&&typeof y=="object"&&!Array.isArray(y)&&o.push(y);if(o.length===0)continue;let c=Kr(r),l=_e(ge("boards",Kr(i))),p=ah(c),d=[...ie(ge(c,"doc"),{match:y=>y.endsWith(".rst")})],u=d.includes("index.rst")?"index.rst":d.sort()[0],m=u?`${l}/doc/${u}`:void 0;for(let y of o){if(typeof y.name!="string")continue;let f=y.name,h=le(y.socs).flatMap(R=>{if(!R||typeof R!="object")return[];let Z=R;return typeof Z.name!="string"?[]:[{name:Z.name,variants:le(Z.variants).flatMap(J=>J&&typeof J=="object"&&typeof J.name=="string"?[J.name]:[]),cpuclusters:le(Z.cpuclusters).flatMap(J=>J&&typeof J=="object"&&typeof J.name=="string"?[J.name]:[])}]}),E=p.filter(R=>R.identifier===f||R.identifier.startsWith(`${f}/`)),b=t.get(f);if(!b)throw new Error(`Zephyr's board model did not enumerate ${f}.`);let _=b.qualifiers.length>0?b.qualifiers:[""],T=_.map(R=>R?`${f}/${R}`:f);for(let R of b.revisions)T.push(..._.map(Z=>Z?`${f}@${R}/${Z}`:`${f}@${R}`));let v=T.map(R=>({identifier:R,toolchains:[],supported:[]})),k=E.length>0?E:o.length===1?p:[],A=new Map(v.map(R=>[R.identifier,R]));for(let R of k){let Z=A.get(R.identifier);A.set(R.identifier,Z?{...Z,...R}:R)}let N=[...A.values()].sort((R,Z)=>R.identifier.localeCompare(Z.identifier)),S={name:f,dir:l,socs:h,targets:N,revisions:b.revisions,supported:[...new Set(N.flatMap(R=>R.supported))].sort()};typeof y.full_name=="string"&&(S.fullName=y.full_name),typeof y.vendor=="string"&&(S.vendor=y.vendor),b.defaultRevision&&(S.defaultRevision=b.defaultRevision),m&&(S.docPath=m);let P=N.find(R=>R.arch)?.arch;P&&(S.arch=P);let W=N.find(R=>R.ram!==void 0)?.ram;W!==void 0&&(S.ram=W);let U=N.find(R=>R.flash!==void 0)?.flash;U!==void 0&&(S.flash=U),e.push(S)}}return e.sort((i,r)=>i.name.localeCompare(r.name)),e}function Sc(n){let e=[];for(let t of ie(ge(n,"soc"),{match:i=>i==="soc.yml"||i==="soc.yaml"})){let i=ge(n,"soc",t),r=Xr(i),s=_e(ge("soc",Kr(t))),o=t.includes("/")?t.split("/")[0]:void 0,a=(l,p,d)=>{if(typeof l.name!="string")return;let u={name:l.name,dir:s,cpuclusters:le(l.cpuclusters).flatMap(m=>m&&typeof m=="object"&&typeof m.name=="string"?[m.name]:[])};p&&(u.family=p),d&&(u.series=d),o&&(u.vendor=o),e.push(u)};(l=>{for(let p of l){if(!p||typeof p!="object")continue;let d=p,u=typeof d.name=="string"?d.name:void 0;for(let m of le(d.socs))m&&typeof m=="object"&&a(m,u);for(let m of le(d.series)){if(!m||typeof m!="object")continue;let y=m,f=typeof y.name=="string"?y.name:void 0;for(let h of le(y.socs))h&&typeof h=="object"&&a(h,u,f)}}})(le(r.family));for(let l of le(r.socs))l&&typeof l=="object"&&a(l)}return e.sort((t,i)=>t.name.localeCompare(i.name)),e}import{existsSync as ph,lstatSync as mh,readFileSync as Ic,realpathSync as Vr}from"node:fs";import{dirname as hh,extname as gh,join as Ac,relative as Gr,resolve as yh,sep as Lc}from"node:path";var ch="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function Vn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!ch.includes(t))return null;for(let i of e)if(i!==t)return null;return{char:t,length:e.length}}function lh(n){let e=[];for(let t=0;t<n.length;t++){let i=Vn(n[t]);if(!i)continue;let r=n[t-1];if(r===void 0)continue;let s=r.trim();if(s===""||i.length<s.length)continue;if(Vn(r)){if(Vn(n[t-2]??""))continue;continue}let o=Vn(n[t-2]??""),a=o!==null&&o.char===i.char;e.push({line:t-1,text:s,char:i.char,overlined:a})}return e}function dh(n){let e=[];return n.map(t=>{let i=t.overlined?`over:${t.char}`:t.char,r=e.indexOf(i);return r===-1&&(r=e.length,e.push(i)),r})}var Yr=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function vc(n){let e=n.split(`
`),t=[],i=s=>t.push({code:!1,text:s}),r=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(Yr.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",p=""]=a,d=c.length,u=l.toLowerCase(),m=[],y=s+1;for(;y<e.length;y++){let f=e[y];if(f.trim()===""){m.push("");continue}if(f.match(/^\s*/)[0].length<=d)break;m.push(f)}if(r.has(u)){s=y-1;continue}if(u==="code-block"||u==="code"||u==="literalinclude"){let f=p.trim(),h=zr(m).join(`
`).replace(/^\n+|\n+$/g,"");h&&t.push({code:!0,text:`\`\`\`${f}
${h}
\`\`\``}),s=y-1;continue}if(u==="note"||u==="warning"||u==="important"||u==="tip"){let f=zr(m).join(`
`).trim();f&&i(`${l.toUpperCase()}: ${f}`),s=y-1;continue}p.trim()&&i(p.trim());for(let f of zr(m))i(f);s=y-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||i(o)}return t.map(s=>s.code?s.text:uh(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function zr(n){let e=n.filter(i=>i.trim()!=="").map(i=>i.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(i=>i.trim()===""?"":i.slice(t))}function uh(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function kc(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),i=[];for(let l of t){let p=l.match(Yr);p&&i.push(p[1].trim())}let r=lh(t),s=dh(r);if(r.length===0){let l=vc(e);return{title:"",labels:i,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=r[0].text,a=[],c=[];for(let l=0;l<r.length;l++){let p=r[l],d=s[l],u=r[l+1];for(;c.length>0&&c[c.length-1].level>=d;)c.pop();c.push({level:d,text:p.text});let m=p.line+2,y=u?u.line-(u.overlined?1:0):t.length,f=t.slice(m,Math.max(m,y)).join(`
`),h=vc(f),E=fh(t,p.line-(p.overlined?1:0));(h||l===0)&&a.push({...E?{anchor:E}:{},heading:p.text,headingPath:c.map(b=>b.text),ord:a.length,body:h})}return{title:o,labels:i,chunks:a}}function fh(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let i=n[t];if(i.trim()==="")continue;let r=i.match(Yr);return r?r[1].trim():void 0}}var bh=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function Eh(n,e){let t=n.replace(/\.rst$/,""),i=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${i}.html`}function Oc(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function _h(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function Th(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let i=0;i<e.length;i++){let r=e[i].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!r)continue;let s=r[1].length;for(i+=1;i<e.length;i++){let o=e[i];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){i-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),p=(l?.[2]??c).replace(/\.rst$/,""),d=l?.[1]?.trim()||p.split("/").filter(Boolean).at(-1)?.replace(/^index$/,p.split("/").at(-2)??"index").replace(/[_-]/g," ");p&&d&&t.push(`${d} (${p})`)}}return[...new Set(t)]}function Nh(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function wh(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=1,r=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(i=s),Number.isInteger(o)&&o>=i&&(r=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(p=>p.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);i=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((p,d)=>d>=i-1&&p.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);r=l+(e["end-at"]?1:0)}return t=t.slice(i-1,r),{text:t.join(`
`),start:i,end:r}}function Jr(n,e,t,i,r=[]){let s=Vr(e);if(r.includes(s))throw new Error(`include cycle: ${[...r,s].map(l=>Gr(n,l)).join(" -> ")}`);let o=[...r,s],a=t.replace(/\r\n?/g,`
`).split(`
`),c=[];for(let l=0;l<a.length;l++){let p=a[l],d=p.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){c.push(p);continue}let u=d[1].length,m=d[2],y=d[3].trim(),f=[],h=l+1;for(;h<a.length;h++){let A=a[h];if(A.trim()===""){f.push(A);continue}if(A.match(/^\s*/)[0].length<=u)break;f.push(A)}if(l=h-1,m==="only"){if(/\bhtml\b/.test(y)){let A=f.map(S=>S.trim()?S.slice(Math.min(S.length,u+3)):""),N=Jr(n,s,A.join(`
`),i,r);c.push(...N.split(`
`).map(S=>`${" ".repeat(u)}${S}`))}continue}let E=Nh(f),b=yh(hh(s),y);if(!ph(b))throw new Error(`include target not found: ${y}`);if(mh(b).isSymbolicLink())throw new Error(`include target is a symbolic link: ${y}`);let _=Vr(n),T=Vr(b),v=Gr(_,T);if(v===".."||v.startsWith(`..${Lc}`))throw new Error(`include escapes the Zephyr tree: ${y}`);let k=wh(Ic(T,"utf8"),E);if(i.push({path:Gr(_,T).replaceAll(Lc,"/"),startLine:k.start,endLine:k.end,directive:m}),m==="literalinclude"){let A=E.language??gh(b).slice(1);c.push(`${" ".repeat(u)}.. code-block:: ${A}`,"",...k.text.split(`
`).map(N=>`${" ".repeat(u+3)}${N}`))}else{let A=Jr(_,T,k.text,i,o);c.push(...A.split(`
`).map(N=>`${" ".repeat(u)}${N}`))}}return c.join(`
`)}function Rc(n,e,t,i){let r=[],s=Ac(n,e);for(let o of ie(s,{skipDirs:bh,match:a=>a.endsWith(".rst")})){let a=`${e}/${o}`,c=Ac(s,o);i.discovered++;try{let l=Ic(c,"utf8"),p=[{path:a,startLine:1,endLine:l.split(/\r?\n/).length,directive:"page"}],d=Jr(n,c,l,p),u=kc(d),m=u.chunks.filter(y=>y.body.trim()!=="").map((y,f)=>({...y,ord:f}));if(m.length===0){let y=Th(d);if(y.length>0){let f=u.title||Oc(a);m=[{heading:f,headingPath:[f],ord:0,body:`Contained documentation pages:
${y.map(h=>`- ${h}`).join(`
`)}`}]}}if(m.length===0){i.intentionallyExcluded.push({path:a,reason:"no-retrievable-content"});continue}r.push({path:a,url:Eh(a,t),title:u.title||Oc(a),area:_h(a),labels:u.labels,chunks:m,origins:p}),i.indexed++}catch(l){i.errors.push({path:a,code:"rst-preprocess",message:l.message})}}return r}function xc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},i=[...Rc(n,"doc",e,t),...Rc(n,"boards",e,t)];if(t.errors.length>0){let r=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${r}`)}return{pages:i,report:t}}import{existsSync as vh,mkdtempSync as kh,rmSync as Ah,writeFileSync as Lh}from"node:fs";import{tmpdir as Oh}from"node:os";import{join as Gn}from"node:path";import{spawnSync as Rh}from"node:child_process";var Cc=`#!/usr/bin/env python3
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

    def expression(value):
        if value is None:
            return None
        if isinstance(value, tuple):
            op = operators.get(value[0], "unknown")
            children = [expression(child) for child in value[1:]]
            return {"kind": op, "children": children, "display": kc.expr_str(value)}
        if isinstance(value, kc.Symbol):
            return {
                "kind": "constant" if value.is_constant else "symbol",
                "value": value.name,
                "display": kc.expr_str(value),
            }
        if isinstance(value, kc.Choice):
            return {"kind": "choice", "value": choice_id(value), "display": kc.expr_str(value)}
        return {"kind": "literal", "value": str(value), "display": str(value)}

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
`;var Dc=new Map,Ih={zephyr:"Kconfig",sysbuild:"share/sysbuild/Kconfig"};function Hr(n,e=[],t="zephyr"){let i=JSON.stringify([n,[...e].sort(),t]),r=Dc.get(i);if(r)return r;let s=Gn(n,"scripts","kconfig","kconfiglib.py");if(!vh(s))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let o=kh(Gn(Oh(),"zephyr-ai-kconfig-")),a=Gn(o,"kconfig-export.py"),c=Gn(o,"generated");try{Lh(a,Cc,{mode:384});let l=[a,"--zephyr",n,"--build-dir",c,"--root",Ih[t]];for(let m of e)l.push("--module",m);let p=Rh(Ve(n),l,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(p.status!==0){let m=p.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${m}`)}let d=JSON.parse(p.stdout),u={symbols:d.symbols,choices:d.choices,filesScanned:d.files.length,warnings:d.warnings};return Dc.set(i,u),u}finally{Ah(o,{recursive:!0,force:!0})}}var Uc=ri(Yn(),1);import{existsSync as Hn,readFileSync as $c,statSync as xh}from"node:fs";import{dirname as Pc,join as Fe}from"node:path";var Ch=64*1024,Dh=160*1024;function Mc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var qc={"sample.yaml":"sample","testcase.yaml":"test"};function Ph(n,e){let t=[],i=[],r=Dh;for(let s of e){if(!Mc(s))continue;let o=Fe(n,s);try{if(xh(o).size>Ch){i.push({path:s,reason:"file-size-limit"});continue}let a=$c(o,"utf8");if(Buffer.byteLength(a)>r){i.push({path:s,reason:"sample-size-budget"});continue}r-=Buffer.byteLength(a),t.push({path:s,text:a})}catch(a){throw new Error(`Failed to capture sample file ${o}: ${a.message}`)}}return{contents:t,exclusions:i}}function qh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function Jn(n){return qh(n).filter(e=>typeof e=="string")}function $h(n){let e=[],t=i=>{Hn(Fe(n,i))&&e.push(i)};for(let i of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])t(i);for(let i of["src","boards","snippets"]){let r=Fe(n,i);if(Hn(r))try{e.push(...[...ie(r,{match:s=>Mc(`${i}/${s}`)})].map(s=>`${i}/${s}`))}catch{}}return e}function Fc(n){let e=[],t=new Set;for(let i of["samples","snippets","tests"]){let r=Fe(n,i);if(Hn(r))for(let s of[...ie(r,{match:o=>Object.hasOwn(qc,o)})].sort()){let o=Fe(r,s),a=s.split("/").pop(),c=qc[a],l=null;try{let S=(0,Uc.parse)($c(o,"utf8"),{logLevel:"silent"});if(!S||typeof S!="object"||Array.isArray(S))throw new Error("expected a YAML mapping");l=S}catch(S){throw new Error(`Failed to parse ${a} metadata ${s}: ${S.message}`)}let p=Pc(o),d=_e(Fe(i,Pc(s)));if(t.has(d))continue;t.add(d);let u=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},y=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},f=new Set,h=new Set,E=new Set,b=new Set,_=S=>{for(let P of Jn(S.tags))f.add(P);if(typeof S.tags=="string")for(let P of S.tags.split(/\s+/).filter(Boolean))f.add(P);for(let P of Jn(S.depends_on))h.add(P);for(let P of Jn(S.integration_platforms))E.add(P);for(let P of Jn(S.platform_allow))b.add(P)};_(y);for(let S of Object.values(m))!S||typeof S!="object"||_({...y,...S});let T=$h(p),{contents:v,exclusions:k}=Ph(p,T),A=v.map(S=>S.path),N={path:d,kind:c,name:typeof u.name=="string"?u.name:d.split("/").pop(),tags:[...f].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...h].sort(),integrationPlatforms:[...E].sort(),platformAllow:[...b].sort(),files:A,contents:v,exclusions:k};typeof u.description=="string"&&(N.description=u.description),Hn(Fe(p,"README.rst"))&&(N.docPath=`${d}/README.rst`),e.push(N)}}return e.sort((i,r)=>i.path.localeCompare(r.path)),e}var Xc=ri(Yn(),1);import{existsSync as Wn,mkdtempSync as Mh,readFileSync as Wr,rmSync as Fh,writeFileSync as Bh}from"node:fs";import{tmpdir as jh}from"node:os";import{join as Ie}from"node:path";import{spawnSync as Kh}from"node:child_process";var Bc=`#!/usr/bin/env python3
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
`;function Xh(n){let e="",t=!1;for(let i=0;i<n.length;i++){let r=n[i];if(t){e+=r,r==="\\"?(e+=n[i+1]??"",i++):r==='"'&&(t=!1);continue}if(r==='"'){t=!0,e+=r;continue}if(r==="#"){for(;i<n.length&&n[i]!==`
`;)i++;e+=`
`;continue}e+=r}return e}function zh(n){let e=[],t="",i=!1,r=!1;for(let s=0;s<n.length;s++){let o=n[s];if(i){o==="\\"?(t+=n[s+1]??"",s++):o==='"'?i=!1:t+=o;continue}if(o==='"'){i=!0,r=!0;continue}if(/\s/.test(o)){r&&e.push(t),t="",r=!1;continue}t+=o,r=!0}return r&&e.push(t),e}function jc(n){return n.replace(/\s+/g," ").trim()}function Yh(n){return n.predicate}function zc(n){let e=Xh(n),t=[],i=[],r=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,s;for(;(s=r.exec(e))!==null;){let o=s[1].toLowerCase(),a=1,c=s.index+s[0].length,l=!1;for(;c<e.length&&a>0;c++){let u=e[c];if(l){u==="\\"?c++:u==='"'&&(l=!1);continue}u==='"'?l=!0:u==="("?a++:u===")"&&a--}if(a!==0)break;let p=e.slice(s.index+s[0].length,c-1);if(r.lastIndex=c,o==="if"){let u=jc(p);i.push({taken:[u],predicate:u});continue}if(o==="elseif"||o==="else"){let u=i[i.length-1];if(!u)continue;let m=jc(p),y=u.taken.map(f=>`NOT (${f})`).join(" AND ");u.predicate=o==="else"?y||null:y?`(${m}) AND ${y}`:m,o==="elseif"&&u.taken.push(m);continue}if(o==="endif"){i.pop();continue}let d=i.map(Yh).filter(u=>!!u);t.push({name:o,args:zh(p),...d.length>0?{guard:d.join(" AND ")}:{}})}return t}function Be(n,e,t){let i=n.declaredIn.get(e);i?i.add(t):n.declaredIn.set(e,new Set([t]))}function Kc(n,e,t,i){let r=n.args.get(e)??[];for(let s of t)r.push({value:s,...i?{guard:i}:{},unresolved:s.includes("${")});n.args.set(e,r)}function Yc(n,e,t,i,r){if(i.has(e))return;i.add(e);let s=Ie(n,e);if(!Wn(s))return;let o;try{o=zc(Wr(s,"utf8"))}catch(a){r.push({path:e,code:"cmake-parse",message:a.message});return}for(let a of o){let[c,...l]=a.args;switch(a.name){case"include":{if(!c)break;let p=c.startsWith("${ZEPHYR_BASE}/")?c.slice(15):null;p&&Yc(n,p,t,i,r);break}case"board_finalize_runner_args":{if(!c)break;t.finalized.add(c),Be(t,c,e),Kc(t,c,l,a.guard);break}case"board_runner_args":{if(!c)break;Be(t,c,e),Kc(t,c,l,a.guard);break}case"board_set_flasher_ifnset":{c&&t.flashDefault===void 0&&(t.flashDefault=c,Be(t,c,e));break}case"board_set_debugger_ifnset":{c&&t.debugDefault===void 0&&(t.debugDefault=c,Be(t,c,e));break}case"board_set_flasher":{c&&(t.flashDefault=c,Be(t,c,e));break}case"board_set_debugger":{c&&(t.debugDefault=c,Be(t,c,e));break}default:break}}}function Vh(n,e){let t=[],i=Ie(n,"soc");if(!Wn(i))return t;let r=[...ie(i,{match:s=>s==="CMakeLists.txt"||s.endsWith(".cmake")})].sort();for(let s of r){let o=_e(Ie("soc",s)),a=Wr(Ie(i,s),"utf8");if(!a.includes("board_finalize_runner_args"))continue;let c;try{c=zc(a)}catch(l){e.push({path:o,code:"cmake-parse",message:l.message});continue}for(let l of c){if(l.name!=="board_finalize_runner_args")continue;let[p,...d]=l.args;p&&t.push({path:o,runner:p,args:d.map(u=>({value:u,...l.guard?{guard:l.guard}:{},unresolved:u.includes("${")}))})}}return t}function Vc(n){let e=Mh(Ie(jh(),"zephyr-ai-runners-")),t=Ie(e,"runner-export.py");try{Bh(t,Bc,{mode:384});let i=Kh(Yt(),[t,"--zephyr",n],{encoding:"utf8",maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(i.status!==0){let r=i.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`The west runner catalogue could not be exported:
${r}`)}return JSON.parse(i.stdout)}finally{Fh(e,{recursive:!0,force:!0})}}function Gc(n){let e=Ie(n,"scripts","west-commands.yml");if(!Wn(e))return[];let t=(0,Xc.parse)(Wr(e,"utf8"),{logLevel:"silent"});if(!t||typeof t!="object")return[];let i=t["west-commands"];if(!Array.isArray(i))return[];let r=[];for(let s of i){if(!s||typeof s!="object")continue;let o=s,a=typeof o.file=="string"?o.file:"";for(let c of Array.isArray(o.commands)?o.commands:[]){if(!c||typeof c!="object")continue;let l=c;typeof l.name=="string"&&r.push({name:l.name,className:typeof l.class=="string"?l.class:"",file:a,...typeof l.help=="string"?{help:l.help}:{}})}}return r.sort((s,o)=>s.name.localeCompare(o.name))}function Jc(n,e){let t=[],i=Vh(n,t),r=[],s=0;for(let l of e){let p=`${l.dir}/board.cmake`,d={finalized:new Set,args:new Map,declaredIn:new Map};Wn(Ie(n,p))?Yc(n,p,d,new Set,t):s++;for(let m of i){if(!l.socDirs.some(f=>f&&m.path.startsWith(`${f}/`)))continue;d.finalized.add(m.runner),Be(d,m.runner,m.path);let y=d.args.get(m.runner)??[];y.push(...m.args),d.args.set(m.runner,y)}let u=new Set(d.finalized);d.flashDefault&&u.add(d.flashDefault),d.debugDefault&&u.add(d.debugDefault);for(let m of[...u].sort())r.push({board:l.name,runner:m,available:d.finalized.has(m),flashDefault:d.flashDefault===m,debugDefault:d.debugDefault===m,args:d.args.get(m)??[],declaredIn:[...d.declaredIn.get(m)??[]].sort()})}let o=new Set(r.map(l=>l.board)),a=e.filter(l=>!o.has(l.name)).length,c=[];return s>0&&c.push({path:"boards",code:"no-board-cmake",message:`${s} boards ship no board.cmake`}),a>0&&c.push({path:"boards",code:"no-runner-declared",message:`${a} boards declare no runner; report this as undeclared, never as unsupported`}),{boardRunners:r,report:{discovered:r.length,indexed:r.length,intentionallyExcluded:[],warnings:c,errors:t}}}import{createHash as Qr}from"node:crypto";import{existsSync as Qn,readFileSync as Zn,realpathSync as Ut,statSync as ng}from"node:fs";import{basename as Wc,dirname as ig,join as je,relative as rg,resolve as sg}from"node:path";import{spawnSync as Qc}from"node:child_process";import{createHash as Gh}from"node:crypto";import{existsSync as Jh,lstatSync as Hh,readFileSync as Wh,readlinkSync as Zh,realpathSync as Qh}from"node:fs";import{join as eg}from"node:path";import{spawnSync as tg}from"node:child_process";function Zr(n,e){let t=tg("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function Hc(n){let e=Qh(n),t=Zr(e,["rev-parse","HEAD"]);if(!t)return null;let i=Zr(e,["diff","--binary","HEAD"])??"",r=(Zr(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=eg(e,s);if(!Jh(o))return{path:s,missing:!0};try{let a=Hh(o);return a.isSymbolicLink()?{path:s,symlink:Zh(o)}:a.isFile()?{path:s,sha256:Gh("sha256").update(Wh(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(i||r.length),stateFingerprint:xe({commit:t,diff:i,untracked:r})}}function og(n,e){let t=Qc("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function ag(n){let e=Zn(je(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",i=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),r=t("EXTRAVERSION");return r?`${i}-${r}`:i}function cg(n){let e=sg(n);for(;;){if(Qn(je(e,".west","config")))return e;let t=ig(e);if(t===e)return;e=t}}function lg(n){if(!n)return;let e=Qc("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return Qr("sha256").update(e.stdout).digest("hex");let t="",i="west.yml";try{let o=Zn(je(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",i=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??i}catch{}let s=[...t?[je(n,t,i)]:[],je(n,"west.yml"),je(n,"west.yaml")].find(Qn);return s?Qr("sha256").update(Zn(s)).digest("hex"):void 0}function Zc(n){let e=Ut(n),t=Hc(e);if(t)return{name:Wc(e),...t};let i=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(r=>je(e,r)).filter(Qn).map(r=>{let s=ng(r);return{path:rg(e,r),bytes:s.size,sha256:Qr("sha256").update(Zn(r)).digest("hex")}});return{name:Wc(e),markers:i}}function el(n){let e=Ut(n.zephyrRoot),t=n.projectRoot&&Qn(n.projectRoot)?Ut(n.projectRoot):void 0,i=og(e,["rev-parse","HEAD"]);if(!i)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let r=cg(t??e),s=lg(r),o=n.modules.map(u=>Zc(u)),a=xe(o),c=Zc(e),l=String(c.stateFingerprint??xe(c)),p=n.pinnedCommit===i&&c.dirty===!1?"pinned-upstream":r?"west-workspace":"explicit-tree",d={descriptorVersion:us,schemaVersion:Xt,builderVersion:fs,sourceKind:p,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:ag(e),zephyrCommit:i,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:Ut(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:Ut(n.buildDirectory)}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index covering the application and sysbuild namespaces; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},west:{complete:!!n.westComplete,note:n.westComplete?void 0:"The west package was not importable when this index was built, so runners that import it \u2014 openocd among them \u2014 carry no capabilities."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...d,createdAt:new Date().toISOString(),contextFingerprint:ms(d)}}import{spawnSync as ug}from"node:child_process";import{existsSync as es,mkdirSync as fg,mkdtempSync as pg,renameSync as mg,rmSync as hg,writeFileSync as gg}from"node:fs";import{dirname as tl,join as Mt,resolve as yg}from"node:path";var V={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var nl=V,il=".zephyr-ai-managed.json";function ei(n,e){return ug("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function bg(n){if(!es(Mt(n,".git"))||!es(Mt(n,"VERSION")))return!1;let e=ei(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==V.commit)return!1;let t=ei(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(i=>i.endsWith(` ${il}`))}function rl(n,e){let t=yg(n,"sources",`zephyr-${V.version}-${V.commit.slice(0,12)}`);if(bg(t))return e(`Using pinned Zephyr ${V.version} checkout at ${t}`),t;if(es(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${V.version}.`);fg(tl(t),{recursive:!0});let i=pg(Mt(tl(t),".zephyr-ai-fetch-")),r=Mt(i,"zephyr");try{e(`Cloning pinned Zephyr ${V.version}; this requires network access and may take several minutes.`);let s=ei(["clone","--depth","1","--branch",V.tag,"--single-branch",V.repository,r]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=ei(["rev-parse","HEAD"],r);if(o.status!==0||o.stdout.trim()!==V.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${V.commit}.`);return gg(Mt(r,il),`${JSON.stringify({owner:"zephyr-ai",repository:V.repository,tag:V.tag,commit:V.commit},null,2)}
`,{flag:"wx"}),mg(r,t),e(`Pinned Zephyr ${V.version} is ready at ${t}`),t}finally{hg(i,{recursive:!0,force:!0})}}var sl={name:"@zephyr-ai/ingest",version:"0.5.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function Ag(n){let e=de(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??G(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requireWest:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let i=0;i<n.length;i++){let r=n[i];switch(r){case"--zephyr":t.zephyr=de(n[++i]);break;case"--out":t.out=de(n[++i]);break;case"--project-root":t.projectRoot=de(n[++i]);break;case"--plugin-data":t.pluginData=de(n[++i]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++i];break;case"--application":t.applicationRoot=de(n[++i]);break;case"--build-dir":t.buildDirectory=de(n[++i]);break;case"--api-xml":t.apiXml=de(n[++i]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-west":t.requireWest=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(de(n[++i]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${r}`)}}return t.zephyr=de(t.zephyr),t}function Lg(){for(let n of[G(process.cwd(),"zephyr.lock.json"),G(process.cwd(),"..","..","zephyr.lock.json")])try{return JSON.parse(ll(n,"utf8"))}catch{}return{}}function ts(n){return n==null?null:JSON.stringify(n)}function Og(n){let e=G(n,"scripts","requirements-base.txt");return Bt(e)?ws(ll(e,"utf8")):[]}function is(n){let e=wg(n,"r");try{Tg(e)}finally{_g(e)}}function cl(n){try{is(n)}catch{}}function Rg(n,e){let t=Sg(n,{withFileTypes:!0}).filter(r=>r.isDirectory()&&/^[a-f0-9]{64}$/.test(r.name)).flatMap(r=>{let s=G(n,r.name),o=G(s,"zephyr.db");if(!Bt(o))return[];let a=G(s,"last-used");return[{fingerprint:r.name,directory:s,usedAt:dl(Bt(a)?a:o).mtimeMs}]}).sort((r,s)=>s.usedAt-r.usedAt),i=new Set([e,...t.filter(r=>r.fingerprint!==e).slice(0,4).map(r=>r.fingerprint)]);for(let r of t)i.has(r.fingerprint)||ns(r.directory,{recursive:!0,force:!0})}function Ig(){let n=Ag(process.argv.slice(2)),e=q=>{n.quiet||process.stderr.write(`${q}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=rl(n.pluginData,e)}if(!Bt(G(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(Ve(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let q=As(n.zephyr);q&&(n.apiXml=q,e(`Using auto-detected Doxygen XML from ${q}`))}let t=n.fetchPinned?nl:Lg();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let i=Vc(n.zephyr);if(n.requireWest&&!i.complete)throw new Error("The west runner catalogue is incomplete: the selected interpreter cannot import the west package, which openocd needs, and hundreds of boards select openocd. An index built here would omit it without saying so. Install the tree's requirements (python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.");let r=el({zephyrRoot:n.zephyr,westComplete:i.complete,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml}),s=r.zephyrVersion;if(n.requirePinned&&(!t.commit||r.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${r.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let o=`https://docs.zephyrproject.org/${s}/`,a,c=n.out;if(!c&&n.pluginData)if(r.projectRoot){let q=G(n.pluginData,"indexes","projects",ps(r.projectRoot));c=G(q,r.contextFingerprint,"zephyr.db"),a=G(q,"active.json")}else c=G(n.pluginData,"indexes","defaults",r.zephyrCommit,String(r.schemaVersion),"zephyr.db");c??=G(de(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${s} from ${n.zephyr}`);let l=Date.now(),p=Date.now(),{pages:d,report:u}=xc(n.zephyr,o),m=d.reduce((q,ne)=>q+ne.chunks.length,0);e(`  docs      ${d.length} pages, ${m} sections (${Date.now()-p} ms)`);let y=Date.now(),f=new Map([["zephyr",Hr(n.zephyr,n.modules,"zephyr")],["sysbuild",Hr(n.zephyr,[],"sysbuild")]]),h=f.get("zephyr");e(`  kconfig   ${h.symbols.length} symbols from ${h.filesScanned} files, ${f.get("sysbuild").symbols.length} sysbuild (${Date.now()-y} ms)`);let E=Date.now(),b=[G(n.zephyr,"dts","bindings"),...n.modules.map(q=>G(q,"dts","bindings")).filter(Bt)],{bindings:_,fragments:T,report:v}=xs(b),k=q=>q.properties.length+q.children.reduce((ne,ti)=>ne+k(ti),0),A=_.reduce((q,ne)=>q+k(ne),0);e(`  bindings  ${_.length} compatibles, ${A} properties, ${T} fragments (${Date.now()-E} ms)`);let N=Date.now(),S=wc(n.zephyr),P=Sc(n.zephyr),W=S.reduce((q,ne)=>q+ne.targets.length,0);e(`  boards    ${S.length} boards, ${W} targets, ${P.length} SoCs (${Date.now()-N} ms)`);let U=Date.now(),R=new Map(P.map(q=>[q.name,q.dir])),Z=Gc(n.zephyr),J=Jc(n.zephyr,S.map(q=>({name:q.name,dir:q.dir,socDirs:[...new Set(q.socs.map(ne=>R.get(ne.name)).filter(ne=>!!ne))]}))),re={runners:i.runners,commands:Z,boardRunners:J.boardRunners};e(`  west      ${re.runners.length} runners, ${re.commands.length} commands, ${re.boardRunners.length} board bindings${i.complete?"":", incomplete"} (${Date.now()-U} ms)`);let ul=Date.now(),ye=Fc(n.zephyr);e(`  samples   ${ye.length} (${Date.now()-ul} ms)`);let fl=Date.now(),be=Ls(n.zephyr,n.apiXml);e(`  api       ${be.symbols.length} symbols, ${be.groups.length} groups, ${be.mode} (${Date.now()-fl} ms)`),Ng(Ft(c),{recursive:!0});let st=G(Ft(c),`.${al()}.zephyr.db.tmp`),L,rs=!1;try{L=new kg(st),L.exec(gs);let q=Date.now();L.exec("BEGIN");let ne=L.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),ti=L.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),pl=L.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let g of d){let O=ne.run(g.path,g.url,g.title,g.area,JSON.stringify(g.labels)),M=Number(O.lastInsertRowid);for(let $ of g.origins)pl.run(M,$.path,$.startLine,$.endLine,$.directive);for(let $ of g.chunks)ti.run(M,$.anchor??null,$.heading,$.headingPath.join(" > "),$.ord,g.title,$.body)}for(let[g,O]of f){let M=L.prepare(`INSERT INTO kconfig
         (name, scope, type, prompt, help, defaults, depends, selects, implies, ranges,
          defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),$=L.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind, scope) VALUES (?, ?, ?, ?)"),Ke=new Map;for(let I of O.symbols){let Ee=I.definitions.flatMap(C=>C.defaults.map(F=>({value:F.value.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),j=I.definitions.map(C=>C.condition.display).filter((C,F,ql)=>C!=="y"&&ql.indexOf(C)===F),se=I.definitions.flatMap(C=>C.selects.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),Y=I.definitions.flatMap(C=>C.implies.map(F=>({value:F.target,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),ii=I.definitions.flatMap(C=>C.ranges.map(F=>({low:F.low.display,high:F.high.display,...F.condition.display!=="y"?{cond:F.condition.display}:{}}))),Xe=I.definitions.find(C=>C.prompt)?.prompt??"",Dl=I.definitions.find(C=>C.menuPath.length>0)?.menuPath.join(" > ")??"",Pl=M.run(I.name,g,I.type??null,Xe,I.help??"",JSON.stringify(Ee),JSON.stringify(j),JSON.stringify(se),JSON.stringify(Y),JSON.stringify(ii),JSON.stringify(I.definitions.map(C=>({file:C.file,line:C.line}))),Dl,I.choice?1:0,I.choice??null,I.definitions.length,I.hasPrompt?1:0);Ke.set(I.name,Number(Pl.lastInsertRowid));for(let C of se)$.run(I.name,C.value,"select",g);for(let C of Y)$.run(I.name,C.value,"imply",g);let ls=C=>[...C.kind==="symbol"&&C.value?[C.value]:[],...(C.children??[]).flatMap(ls)];for(let C of I.definitions)for(let F of ls(C.condition))$.run(I.name,F,"depends",g)}let ni=L.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),pe=new Map,H=I=>{if(!I)return null;let Ee=Q(I),j=pe.get(Ee);if(j!==void 0)return j;let se=I.children??[],Y=Number(ni.run(I.kind,I.value??null,I.display,H(se[0]??null),H(se[1]??null)).lastInsertRowid);return pe.set(Ee,Y),Y},X=L.prepare(`INSERT INTO kconfig_definition
         (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
          is_menuconfig, is_configdefault)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),ot=L.prepare(`INSERT INTO kconfig_default
         (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),jt=L.prepare(`INSERT INTO kconfig_relation
         (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?, ?)`),Il=L.prepare(`INSERT INTO kconfig_range
         (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
       VALUES (?, ?, ?, ?, ?)`);for(let I of O.symbols){let Ee=Ke.get(I.name);for(let j of I.definitions){let se=Number(X.run(Ee,j.file,j.line,j.prompt,JSON.stringify(j.menuPath),H(j.condition),H(j.promptCondition),j.isMenuconfig?1:0,j.isConfigDefault?1:0).lastInsertRowid);for(let Y of j.defaults)ot.run(se,H(Y.value),H(Y.condition),Y.order);for(let[Y,ii]of[["select",j.selects],["imply",j.implies]])for(let Xe of ii)jt.run(se,Y,Xe.target,Ke.get(Xe.target)??null,H(Xe.condition),Xe.order);for(let Y of j.ranges)Il.run(se,H(Y.low),H(Y.high),H(Y.condition),Y.order)}}let xl=L.prepare("INSERT INTO kconfig_choice (stable_id, scope, name, type, definitions) VALUES (?, ?, ?, ?, ?)"),Cl=L.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let I of O.choices){let Ee=Number(xl.run(I.id,g,I.name,I.type,JSON.stringify(I.definitions)).lastInsertRowid);for(let j of new Set(I.members)){let se=Ke.get(j);se!==void 0&&Cl.run(Ee,se)}}}let ml=L.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),hl=L.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),gl=L.prepare("INSERT INTO text_pool (text) VALUES (?)"),ss=new Map,yl=g=>{if(!g)return null;let O=ss.get(g);if(O!==void 0)return O;let M=Number(gl.run(g).lastInsertRowid);return ss.set(g,M),M};for(let g of _){let O=g.compatible,M=(pe,H=0,X="")=>[...pe.properties.map(ot=>({level:H,childPath:X,property:ot})),...pe.children.flatMap((ot,jt)=>M(ot,H+1,X?`${X}/${jt}`:String(jt)))],$=M(g),Ke=ml.run(O,g.path,g.description??"",g.bus===void 0||g.bus===null?null:typeof g.bus=="string"?g.bus:JSON.stringify(g.bus),g.onBus??null,JSON.stringify(g.cells),JSON.stringify(g.includes),$.map(({property:pe})=>pe.name).join(" "),$.length,O.includes(",")?O.split(",")[0]:null),ni=Number(Ke.lastInsertRowid);for(let{level:pe,childPath:H,property:X}of $)hl.run(ni,pe,X.name,X.type??null,X.required?1:0,yl(X.description),ts(X.default),ts(X.enum),ts(X.const),X.deprecated?1:0,X.specifierSpace??null,X.inheritedFrom??null,JSON.stringify(X.provenance??{}),JSON.stringify(X.constraints??{}),H)}let bl=L.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of S){let O=g.socs.map(M=>M.name);bl.run(g.name,g.fullName??"",g.vendor??"",g.dir,g.arch??null,g.ram??null,g.flash??null,JSON.stringify(g.socs),O.join(" "),JSON.stringify(g.targets),g.targets.map(M=>M.identifier).join(" "),JSON.stringify(g.revisions),g.defaultRevision??null,JSON.stringify(g.supported),g.supported.join(" "),g.docPath??null)}let El=L.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let g of P)El.run(g.name,g.series??null,g.family??null,g.vendor??null,g.dir,JSON.stringify(g.cpuclusters));let _l=L.prepare("INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)");for(let g of re.runners)_l.run(g.name,g.module,g.description??null,Q(g.capabilities),JSON.stringify(g.capabilities.commands??[]));let Tl=L.prepare("INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)");for(let g of re.commands)Tl.run(g.name,g.className,g.file,g.help??null);let Nl=L.prepare(`INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`);for(let g of re.boardRunners)Nl.run(g.board,g.runner,g.available?1:0,g.flashDefault?1:0,g.debugDefault?1:0,JSON.stringify(g.args),JSON.stringify(g.declaredIn));let wl=L.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Sl=L.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),os=L.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let g of ye){let O=wl.run(g.path,g.kind,g.name,g.description??"",JSON.stringify(g.tags),g.tags.join(" "),JSON.stringify(g.scenarios),JSON.stringify(g.dependsOn),JSON.stringify(g.integrationPlatforms),JSON.stringify(g.platformAllow),JSON.stringify(g.files),g.docPath??null),M=Number(O.lastInsertRowid);for(let $ of g.contents)Sl.run(M,$.path,$.text);for(let $ of g.integrationPlatforms)os.run(M,$,"integration");for(let $ of g.platformAllow)os.run(M,$,"allowlist")}let vl=L.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of be.symbols)vl.run(g.name,g.kind,g.signature,g.brief??"",g.detail??"",JSON.stringify(g.params),JSON.stringify(g.returns),JSON.stringify(g.retvals),g.group??null,g.since??null,g.deprecated?1:0,g.header,g.line,g.doxygenId??null,g.compoundId??null,g.docAnchor??null,g.parentSymbol??null);let kl=L.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let g of be.groups)kl.run(g.id,g.title,g.parent??null,g.header);let Al=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),Ll={schema_version:String(hs),zephyr_version:s,zephyr_commit:r.zephyrCommit,zephyr_tag:r.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:r.sourceKind,index_descriptor:Q(r),context_fingerprint:r.contextFingerprint,module_fingerprint:r.moduleFingerprint,doc_base_url:o,built_at:new Date().toISOString(),ingest_version:sl.version,count_docs:String(d.length),count_doc_chunks:String(m),report_docs:Q(u),count_kconfig:String(h.symbols.length),count_kconfig_sysbuild:String(f.get("sysbuild").symbols.length),report_kconfig:Q({discovered:[...f.values()].reduce((g,O)=>g+O.symbols.length+O.choices.length,0),indexed:[...f.values()].reduce((g,O)=>g+O.symbols.length+O.choices.length,0),intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts cover both Kconfig namespaces: the application tree and sysbuild."},...[...f].map(([g,O])=>({code:"source-files",message:`Kconfiglib evaluated ${O.filesScanned} source files for the ${g} namespace.`})),...[...f].flatMap(([g,O])=>O.warnings.map(M=>({code:"kconfiglib",message:`${g}: ${M}`})))],errors:[]}),count_bindings:String(_.length),count_dt_properties:String(A),report_bindings:Q(v),count_boards:String(S.length),count_board_targets:String(W),count_socs:String(P.length),report_boards:Q({discovered:S.length+W+P.length,indexed:S.length+W+P.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),python_requirements:Q(Og(n.zephyr)),count_runners:String(re.runners.length),count_west_commands:String(re.commands.length),count_board_runners:String(re.boardRunners.length),report_west:Q({discovered:i.report.discovered+re.commands.length+J.report.discovered,indexed:re.runners.length+re.commands.length+J.report.indexed,intentionallyExcluded:i.report.intentionallyExcluded,warnings:[...i.report.warnings,...J.report.warnings,{code:"report-units",message:"Counts include runner classes, west commands, and board-runner pairings."}],errors:[...i.report.errors,...J.report.errors]}),count_samples:String(ye.length),report_samples:Q({discovered:ye.length+ye.reduce((g,O)=>g+O.contents.length+O.exclusions.length,0),indexed:ye.length+ye.reduce((g,O)=>g+O.contents.length,0),intentionallyExcluded:ye.flatMap(g=>g.exclusions.map(O=>({path:`${g.path}/${O.path}`,reason:O.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(be.symbols.length),api_ingest_mode:be.mode,report_api:Q(be.report)};for(let[g,O]of Object.entries(Ll))Al.run(g,O);L.exec("COMMIT"),e(`  written   (${Date.now()-q} ms)`);let Ol=Date.now();L.exec(ys),e(`  indexed   full-text (${Date.now()-Ol} ms)`),L.exec("VACUUM"),L.exec("PRAGMA optimize");let as=String(L.prepare("PRAGMA integrity_check").get()?.integrity_check??""),cs=L.prepare("PRAGMA foreign_key_check").all();if(as!=="ok"||cs.length>0)throw new Error(`Index verification failed (integrity=${as}, foreign-key violations=${cs.length}).`);for(let[g,O]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let M=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${g}`).get()?.n),$=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${O}`).get()?.n);if(M!==$)throw new Error(`Index verification failed: ${g} has ${M} rows; ${O} has ${$}.`)}if(L.close(),L=void 0,is(st),ol(st,c),cl(Ft(c)),rs=!0,a){let g=`${a}.${al()}.tmp`;vg(g,`${Q({contextFingerprint:r.contextFingerprint,relativePath:`${r.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),is(g),ol(g,a),cl(Ft(a)),Rg(Ft(a),r.contextFingerprint)}let Rl=dl(c).size;e(`Done in ${((Date.now()-l)/1e3).toFixed(1)} s -> ${c} (${(Rl/1024/1024).toFixed(1)} MiB)`)}finally{try{L?.close()}catch{}rs||(ns(st,{force:!0}),ns(`${st}-journal`,{force:!0}))}}try{Ig()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
