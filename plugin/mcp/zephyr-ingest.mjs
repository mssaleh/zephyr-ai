#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var dl=Object.create;var Yr=Object.defineProperty;var ul=Object.getOwnPropertyDescriptor;var fl=Object.getOwnPropertyNames;var pl=Object.getPrototypeOf,ml=Object.prototype.hasOwnProperty;var xt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var S=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var hl=(n,e,t,i)=>{if(e&&typeof e=="object"||typeof e=="function")for(let r of fl(e))!ml.call(n,r)&&r!==t&&Yr(n,r,{get:()=>e[r],enumerable:!(i=ul(e,r))||i.enumerable});return n};var Vr=(n,e,t)=>(t=n!=null?dl(pl(n)):{},hl(e||!n||!n.__esModule?Yr(t,"default",{value:n,enumerable:!0}):t,n));var C=S(Y=>{"use strict";var Yn=Symbol.for("yaml.alias"),ys=Symbol.for("yaml.document"),Pt=Symbol.for("yaml.map"),bs=Symbol.for("yaml.pair"),Vn=Symbol.for("yaml.scalar"),qt=Symbol.for("yaml.seq"),le=Symbol.for("yaml.node.type"),Ql=n=>!!n&&typeof n=="object"&&n[le]===Yn,ed=n=>!!n&&typeof n=="object"&&n[le]===ys,td=n=>!!n&&typeof n=="object"&&n[le]===Pt,nd=n=>!!n&&typeof n=="object"&&n[le]===bs,Es=n=>!!n&&typeof n=="object"&&n[le]===Vn,id=n=>!!n&&typeof n=="object"&&n[le]===qt;function Ts(n){if(n&&typeof n=="object")switch(n[le]){case Pt:case qt:return!0}return!1}function rd(n){if(n&&typeof n=="object")switch(n[le]){case Yn:case Pt:case Vn:case qt:return!0}return!1}var sd=n=>(Es(n)||Ts(n))&&!!n.anchor;Y.ALIAS=Yn;Y.DOC=ys;Y.MAP=Pt;Y.NODE_TYPE=le;Y.PAIR=bs;Y.SCALAR=Vn;Y.SEQ=qt;Y.hasAnchor=sd;Y.isAlias=Ql;Y.isCollection=Ts;Y.isDocument=ed;Y.isMap=td;Y.isNode=rd;Y.isPair=nd;Y.isScalar=Es;Y.isSeq=id});var We=S(Gn=>{"use strict";var B=C(),J=Symbol("break visit"),_s=Symbol("skip children"),oe=Symbol("remove node");function $t(n,e){let t=Ns(e);B.isDocument(n)?Me(null,n.contents,t,Object.freeze([n]))===oe&&(n.contents=null):Me(null,n,t,Object.freeze([]))}$t.BREAK=J;$t.SKIP=_s;$t.REMOVE=oe;function Me(n,e,t,i){let r=Ss(n,e,t,i);if(B.isNode(r)||B.isPair(r))return ws(n,i,r),Me(n,r,t,i);if(typeof r!="symbol"){if(B.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=Me(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===J)return J;o===oe&&(e.items.splice(s,1),s-=1)}}}else if(B.isPair(e)){i=Object.freeze(i.concat(e));let s=Me("key",e.key,t,i);if(s===J)return J;s===oe&&(e.key=null);let o=Me("value",e.value,t,i);if(o===J)return J;o===oe&&(e.value=null)}}return r}async function Mt(n,e){let t=Ns(e);B.isDocument(n)?await Ue(null,n.contents,t,Object.freeze([n]))===oe&&(n.contents=null):await Ue(null,n,t,Object.freeze([]))}Mt.BREAK=J;Mt.SKIP=_s;Mt.REMOVE=oe;async function Ue(n,e,t,i){let r=await Ss(n,e,t,i);if(B.isNode(r)||B.isPair(r))return ws(n,i,r),Ue(n,r,t,i);if(typeof r!="symbol"){if(B.isCollection(e)){i=Object.freeze(i.concat(e));for(let s=0;s<e.items.length;++s){let o=await Ue(s,e.items[s],t,i);if(typeof o=="number")s=o-1;else{if(o===J)return J;o===oe&&(e.items.splice(s,1),s-=1)}}}else if(B.isPair(e)){i=Object.freeze(i.concat(e));let s=await Ue("key",e.key,t,i);if(s===J)return J;s===oe&&(e.key=null);let o=await Ue("value",e.value,t,i);if(o===J)return J;o===oe&&(e.value=null)}}return r}function Ns(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function Ss(n,e,t,i){if(typeof t=="function")return t(n,e,i);if(B.isMap(e))return t.Map?.(n,e,i);if(B.isSeq(e))return t.Seq?.(n,e,i);if(B.isPair(e))return t.Pair?.(n,e,i);if(B.isScalar(e))return t.Scalar?.(n,e,i);if(B.isAlias(e))return t.Alias?.(n,e,i)}function ws(n,e,t){let i=e[e.length-1];if(B.isCollection(i))i.items[n]=t;else if(B.isPair(i))n==="key"?i.key=t:i.value=t;else if(B.isDocument(i))i.contents=t;else{let r=B.isAlias(i)?"alias":"scalar";throw new Error(`Cannot replace node with ${r} parent`)}}Gn.visit=$t;Gn.visitAsync=Mt});var Jn=S(ks=>{"use strict";var vs=C(),od=We(),ad={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},cd=n=>n.replace(/[!,[\]{}]/g,e=>ad[e]),Ze=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let i=e.trim().split(/[ \t]+/),r=i.shift();switch(r){case"%TAG":{if(i.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),i.length<2))return!1;let[s,o]=i;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,i.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=i;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${r}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,i,r]=e.match(/^(.*!)([^!]*)$/s);r||t(`The ${e} tag has no suffix`);let s=this.tags[i];if(s)try{return s+decodeURIComponent(r)}catch(o){return t(String(o)),null}return i==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,i]of Object.entries(this.tags))if(e.startsWith(i))return t+cd(e.substring(i.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],i=Object.entries(this.tags),r;if(e&&i.length>0&&vs.isNode(e.contents)){let s={};od.visit(e.contents,(o,a)=>{vs.isNode(a)&&a.tag&&(s[a.tag]=!0)}),r=Object.keys(s)}else r=[];for(let[s,o]of i)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||r.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};Ze.defaultYaml={explicit:!1,version:"1.2"};Ze.defaultTags={"!!":"tag:yaml.org,2002:"};ks.Directives=Ze});var Ut=S(Qe=>{"use strict";var As=C(),ld=We();function dd(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function Ls(n){let e=new Set;return ld.visit(n,{Value(t,i){i.anchor&&e.add(i.anchor)}}),e}function Os(n,e){for(let t=1;;++t){let i=`${n}${t}`;if(!e.has(i))return i}}function ud(n,e){let t=[],i=new Map,r=null;return{onAnchor:s=>{t.push(s),r??(r=Ls(n));let o=Os(e,r);return r.add(o),o},setAnchors:()=>{for(let s of t){let o=i.get(s);if(typeof o=="object"&&o.anchor&&(As.isScalar(o.node)||As.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:i}}Qe.anchorIsValid=dd;Qe.anchorNames=Ls;Qe.createNodeAnchors=ud;Qe.findNewAnchor=Os});var Hn=S(Is=>{"use strict";function et(n,e,t,i){if(i&&typeof i=="object")if(Array.isArray(i))for(let r=0,s=i.length;r<s;++r){let o=i[r],a=et(n,i,String(r),o);a===void 0?delete i[r]:a!==o&&(i[r]=a)}else if(i instanceof Map)for(let r of Array.from(i.keys())){let s=i.get(r),o=et(n,i,r,s);o===void 0?i.delete(r):o!==s&&i.set(r,o)}else if(i instanceof Set)for(let r of Array.from(i)){let s=et(n,i,r,r);s===void 0?i.delete(r):s!==r&&(i.delete(r),i.add(s))}else for(let[r,s]of Object.entries(i)){let o=et(n,i,r,s);o===void 0?delete i[r]:o!==s&&(i[r]=o)}return n.call(e,t,i)}Is.applyReviver=et});var fe=S(xs=>{"use strict";var fd=C();function Rs(n,e,t){if(Array.isArray(n))return n.map((i,r)=>Rs(i,String(r),t));if(n&&typeof n.toJSON=="function"){if(!t||!fd.hasAnchor(n))return n.toJSON(e,t);let i={aliasCount:0,count:1,res:void 0};t.anchors.set(n,i),t.onCreate=s=>{i.res=s,delete t.onCreate};let r=n.toJSON(e,t);return t.onCreate&&t.onCreate(r),r}return typeof n=="bigint"&&!t?.keep?Number(n):n}xs.toJS=Rs});var Ft=S(Ds=>{"use strict";var pd=Hn(),Cs=C(),md=fe(),Wn=class{constructor(e){Object.defineProperty(this,Cs.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:i,onAnchor:r,reviver:s}={}){if(!Cs.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},a=md.toJS(this,"",o);if(typeof r=="function")for(let{count:c,res:l}of o.anchors.values())r(l,c);return typeof s=="function"?pd.applyReviver(s,{"":a},"",a):a}};Ds.NodeBase=Wn});var tt=S(Ps=>{"use strict";var hd=Ut(),gd=We(),Fe=C(),yd=Ft(),bd=fe(),Zn=class extends yd.NodeBase{constructor(e){super(Fe.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let i;t?.aliasResolveCache?i=t.aliasResolveCache:(i=[],gd.visit(e,{Node:(s,o)=>{(Fe.isAlias(o)||Fe.hasAnchor(o))&&i.push(o)}}),t&&(t.aliasResolveCache=i));let r;for(let s of i){if(s===this)break;s.anchor===this.source&&(r=s)}return r}toJSON(e,t){if(!t)return{source:this.source};let{anchors:i,doc:r,maxAliasCount:s}=t,o=this.resolve(r,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=i.get(o);if(a||(bd.toJS(o,null,t),a=i.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=Bt(r,o,i)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,i){let r=`*${this.source}`;if(e){if(hd.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${r} `}return r}};function Bt(n,e,t){if(Fe.isAlias(e)){let i=e.resolve(n),r=t&&i&&t.get(i);return r?r.count*r.aliasCount:0}else if(Fe.isCollection(e)){let i=0;for(let r of e.items){let s=Bt(n,r,t);s>i&&(i=s)}return i}else if(Fe.isPair(e)){let i=Bt(n,e.key,t),r=Bt(n,e.value,t);return Math.max(i,r)}return 1}Ps.Alias=Zn});var F=S(Qn=>{"use strict";var Ed=C(),Td=Ft(),_d=fe(),Nd=n=>!n||typeof n!="function"&&typeof n!="object",pe=class extends Td.NodeBase{constructor(e){super(Ed.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:_d.toJS(this.value,e,t)}toString(){return String(this.value)}};pe.BLOCK_FOLDED="BLOCK_FOLDED";pe.BLOCK_LITERAL="BLOCK_LITERAL";pe.PLAIN="PLAIN";pe.QUOTE_DOUBLE="QUOTE_DOUBLE";pe.QUOTE_SINGLE="QUOTE_SINGLE";Qn.Scalar=pe;Qn.isScalarValue=Nd});var nt=S($s=>{"use strict";var Sd=tt(),we=C(),qs=F(),wd="tag:yaml.org,2002:";function vd(n,e,t){if(e){let i=t.filter(s=>s.tag===e),r=i.find(s=>!s.format)??i[0];if(!r)throw new Error(`Tag ${e} not found`);return r}return t.find(i=>i.identify?.(n)&&!i.format)}function kd(n,e,t){if(we.isDocument(n)&&(n=n.contents),we.isNode(n))return n;if(we.isPair(n)){let d=t.schema[we.MAP].createNode?.(t.schema,null,t);return d.items.push(n),d}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:i,onAnchor:r,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(i&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=r(n)),new Sd.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=wd+e.slice(2));let l=vd(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let d=new qs.Scalar(n);return c&&(c.node=d),d}l=n instanceof Map?o[we.MAP]:Symbol.iterator in Object(n)?o[we.SEQ]:o[we.MAP]}s&&(s(l),delete t.onTagObj);let p=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new qs.Scalar(n);return e?p.tag=e:l.default||(p.tag=l.tag),c&&(c.node=p),p}$s.createNode=kd});var Kt=S(jt=>{"use strict";var Ad=nt(),ae=C(),Ld=Ft();function ei(n,e,t){let i=t;for(let r=e.length-1;r>=0;--r){let s=e[r];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=i,i=o}else i=new Map([[s,i]])}return Ad.createNode(i,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var Ms=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,ti=class extends Ld.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(i=>ae.isNode(i)||ae.isPair(i)?i.clone(e):i),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(Ms(e))this.add(t);else{let[i,...r]=e,s=this.get(i,!0);if(ae.isCollection(s))s.addIn(r,t);else if(s===void 0&&this.schema)this.set(i,ei(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}deleteIn(e){let[t,...i]=e;if(i.length===0)return this.delete(t);let r=this.get(t,!0);if(ae.isCollection(r))return r.deleteIn(i);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${i}`)}getIn(e,t){let[i,...r]=e,s=this.get(i,!0);return r.length===0?!t&&ae.isScalar(s)?s.value:s:ae.isCollection(s)?s.getIn(r,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!ae.isPair(t))return!1;let i=t.value;return i==null||e&&ae.isScalar(i)&&i.value==null&&!i.commentBefore&&!i.comment&&!i.tag})}hasIn(e){let[t,...i]=e;if(i.length===0)return this.has(t);let r=this.get(t,!0);return ae.isCollection(r)?r.hasIn(i):!1}setIn(e,t){let[i,...r]=e;if(r.length===0)this.set(i,t);else{let s=this.get(i,!0);if(ae.isCollection(s))s.setIn(r,t);else if(s===void 0&&this.schema)this.set(i,ei(this.schema,r,t));else throw new Error(`Expected YAML collection at ${i}. Remaining path: ${r}`)}}};jt.Collection=ti;jt.collectionFromPath=ei;jt.isEmptyPath=Ms});var it=S(Xt=>{"use strict";var Od=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function ni(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var Id=(n,e,t)=>n.endsWith(`
`)?ni(t,e):t.includes(`
`)?`
`+ni(t,e):(n.endsWith(" ")?"":" ")+t;Xt.indentComment=ni;Xt.lineComment=Id;Xt.stringifyComment=Od});var Fs=S(rt=>{"use strict";var Rd="flow",ii="block",zt="quoted";function xd(n,e,t="flow",{indentAtStart:i,lineWidth:r=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!r||r<0)return n;r<s&&(s=0);let c=Math.max(1+s,1+r-e.length);if(n.length<=c)return n;let l=[],p={},d=r-e.length;typeof i=="number"&&(i>r-Math.max(2,s)?l.push(0):d=r-i);let u,m,y=!1,f=-1,h=-1,E=-1;t===ii&&(f=Us(n,f,e.length),f!==-1&&(d=f+c));for(let N;N=n[f+=1];){if(t===zt&&N==="\\"){switch(h=f,n[f+1]){case"x":f+=3;break;case"u":f+=5;break;case"U":f+=9;break;default:f+=1}E=f}if(N===`
`)t===ii&&(f=Us(n,f,e.length)),d=f+e.length+c,u=void 0;else{if(N===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let _=n[f+1];_&&_!==" "&&_!==`
`&&_!=="	"&&(u=f)}if(f>=d)if(u)l.push(u),d=u+c,u=void 0;else if(t===zt){for(;m===" "||m==="	";)m=N,N=n[f+=1],y=!0;let _=f>E+1?f-2:h-1;if(p[_])return n;l.push(_),p[_]=!0,d=_+c,u=void 0}else y=!0}m=N}if(y&&a&&a(),l.length===0)return n;o&&o();let b=n.slice(0,l[0]);for(let N=0;N<l.length;++N){let _=l[N],w=l[N+1]||n.length;_===0?b=`
${e}${n.slice(0,w)}`:(t===zt&&p[_]&&(b+=`${n[_]}\\`),b+=`
${e}${n.slice(_+1,w)}`)}return b}function Us(n,e,t){let i=e,r=e+1,s=n[r];for(;s===" "||s==="	";)if(e<r+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);i=e,r=e+1,s=n[r]}return i}rt.FOLD_BLOCK=ii;rt.FOLD_FLOW=Rd;rt.FOLD_QUOTED=zt;rt.foldFlowLines=xd});var ot=S(Bs=>{"use strict";var te=F(),me=Fs(),Vt=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),Gt=n=>/^(%|---|\.\.\.)/m.test(n);function Cd(n,e,t){if(!e||e<0)return!1;let i=e-t,r=n.length;if(r<=i)return!1;for(let s=0,o=0;s<r;++s)if(n[s]===`
`){if(s-o>i)return!0;if(o=s+1,r-o<=i)return!1}return!0}function st(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:i}=e,r=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(Gt(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let p=t.substr(c+2,4);switch(p){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:p.substr(0,2)==="00"?o+="\\x"+p.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(i||t[c+2]==='"'||t.length<r)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,i?o:me.foldFlowLines(o,s,me.FOLD_QUOTED,Vt(e,!1))}function ri(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return st(n,e);let t=e.indent||(Gt(n)?"  ":""),i="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?i:me.foldFlowLines(i,t,me.FOLD_FLOW,Vt(e,!1))}function Be(n,e){let{singleQuote:t}=e.options,i;if(t===!1)i=st;else{let r=n.includes('"'),s=n.includes("'");r&&!s?i=ri:s&&!r?i=st:i=t?ri:st}return i(n,e)}var si;try{si=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{si=/\n+(?!\n|$)/g}function Yt({comment:n,type:e,value:t},i,r,s){let{blockQuote:o,commentString:a,lineWidth:c}=i.options;if(!o||/\n[\t ]+$/.test(t))return Be(t,i);let l=i.indent||(i.forceBlockIndent||Gt(t)?"  ":""),p=o==="literal"?!0:o==="folded"||e===te.Scalar.BLOCK_FOLDED?!1:e===te.Scalar.BLOCK_LITERAL?!0:!Cd(t,c,l.length);if(!t)return p?`|
`:`>
`;let d,u;for(u=t.length;u>0;--u){let w=t[u-1];if(w!==`
`&&w!=="	"&&w!==" ")break}let m=t.substring(u),y=m.indexOf(`
`);y===-1?d="-":t===m||y!==m.length-1?(d="+",s&&s()):d="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(si,`$&${l}`));let f=!1,h,E=-1;for(h=0;h<t.length;++h){let w=t[h];if(w===" ")f=!0;else if(w===`
`)E=h;else break}let b=t.substring(0,E<h?E+1:h);b&&(t=t.substring(b.length),b=b.replace(/\n+/g,`$&${l}`));let _=(f?l?"2":"1":"")+d;if(n&&(_+=" "+a(n.replace(/ ?[\r\n]+/g," ")),r&&r()),!p){let w=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),k=!1,A=Vt(i,!0);o!=="folded"&&e!==te.Scalar.BLOCK_FOLDED&&(A.onOverflow=()=>{k=!0});let T=me.foldFlowLines(`${b}${w}${m}`,l,me.FOLD_BLOCK,A);if(!k)return`>${_}
${l}${T}`}return t=t.replace(/\n+/g,`$&${l}`),`|${_}
${l}${b}${t}${m}`}function Dd(n,e,t,i){let{type:r,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:p}=e;if(a&&s.includes(`
`)||p&&/[[\]{},]/.test(s))return Be(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||p||!s.includes(`
`)?Be(s,e):Yt(n,e,t,i);if(!a&&!p&&r!==te.Scalar.PLAIN&&s.includes(`
`))return Yt(n,e,t,i);if(Gt(s)){if(c==="")return e.forceBlockIndent=!0,Yt(n,e,t,i);if(a&&c===l)return Be(s,e)}let d=s.replace(/\n+/g,`$&
${c}`);if(o){let u=f=>f.default&&f.tag!=="tag:yaml.org,2002:str"&&f.test?.test(d),{compat:m,tags:y}=e.doc.schema;if(y.some(u)||m?.some(u))return Be(s,e)}return a?d:me.foldFlowLines(d,c,me.FOLD_FLOW,Vt(e,!1))}function Pd(n,e,t,i){let{implicitKey:r,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==te.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=te.Scalar.QUOTE_DOUBLE);let c=p=>{switch(p){case te.Scalar.BLOCK_FOLDED:case te.Scalar.BLOCK_LITERAL:return r||s?Be(o.value,e):Yt(o,e,t,i);case te.Scalar.QUOTE_DOUBLE:return st(o.value,e);case te.Scalar.QUOTE_SINGLE:return ri(o.value,e);case te.Scalar.PLAIN:return Dd(o,e,t,i);default:return null}},l=c(a);if(l===null){let{defaultKeyType:p,defaultStringType:d}=e.options,u=r&&p||d;if(l=c(u),l===null)throw new Error(`Unsupported default string type ${u}`)}return l}Bs.stringifyString=Pd});var at=S(oi=>{"use strict";var qd=Ut(),he=C(),$d=it(),Md=ot();function Ud(n,e){let t=Object.assign({blockQuote:!0,commentString:$d.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),i;switch(t.collectionStyle){case"block":i=!1;break;case"flow":i=!0;break;default:i=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:i,options:t}}function Fd(n,e){if(e.tag){let r=n.filter(s=>s.tag===e.tag);if(r.length>0)return r.find(s=>s.format===e.format)??r[0]}let t,i;if(he.isScalar(e)){i=e.value;let r=n.filter(s=>s.identify?.(i));if(r.length>1){let s=r.filter(o=>o.test);s.length>0&&(r=s)}t=r.find(s=>s.format===e.format)??r.find(s=>!s.format)}else i=e,t=n.find(r=>r.nodeClass&&i instanceof r.nodeClass);if(!t){let r=i?.constructor?.name??(i===null?"null":typeof i);throw new Error(`Tag not resolved for ${r} value`)}return t}function Bd(n,e,{anchors:t,doc:i}){if(!i.directives)return"";let r=[],s=(he.isScalar(n)||he.isCollection(n))&&n.anchor;s&&qd.anchorIsValid(s)&&(t.add(s),r.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&r.push(i.directives.tagString(o)),r.join(" ")}function jd(n,e,t,i){if(he.isPair(n))return n.toString(e,t,i);if(he.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let r,s=he.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>r=c});r??(r=Fd(e.doc.schema.tags,s));let o=Bd(s,r,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof r.stringify=="function"?r.stringify(s,e,t,i):he.isScalar(s)?Md.stringifyString(s,e,t,i):s.toString(e,t,i);return o?he.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}oi.createStringifyContext=Ud;oi.stringify=jd});var zs=S(Xs=>{"use strict";var de=C(),js=F(),Ks=at(),ct=it();function Kd({key:n,value:e},t,i,r){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:p,simpleKeys:d}}=t,u=de.isNode(n)&&n.comment||null;if(d){if(u)throw new Error("With simple keys, key nodes cannot have comments");if(de.isCollection(n)||!de.isNode(n)&&typeof n=="object"){let A="With simple keys, collection cannot be used as a key value";throw new Error(A)}}let m=!d&&(!n||u&&e==null&&!t.inFlow||de.isCollection(n)||(de.isScalar(n)?n.type===js.Scalar.BLOCK_FOLDED||n.type===js.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(d||!s),indent:a+c});let y=!1,f=!1,h=Ks.stringify(n,t,()=>y=!0,()=>f=!0);if(!m&&!t.inFlow&&h.length>1024){if(d)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return y&&i&&i(),h===""?"?":m?`? ${h}`:h}else if(s&&!d||e==null&&m)return h=`? ${h}`,u&&!y?h+=ct.lineComment(h,t.indent,l(u)):f&&r&&r(),h;y&&(u=null),m?(u&&(h+=ct.lineComment(h,t.indent,l(u))),h=`? ${h}
${a}:`):(h=`${h}:`,u&&(h+=ct.lineComment(h,t.indent,l(u))));let E,b,N;de.isNode(e)?(E=!!e.spaceBefore,b=e.commentBefore,N=e.comment):(E=!1,b=null,N=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!u&&de.isScalar(e)&&(t.indentAtStart=h.length+1),f=!1,!p&&c.length>=2&&!t.inFlow&&!m&&de.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let _=!1,w=Ks.stringify(e,t,()=>_=!0,()=>f=!0),k=" ";if(u||E||b){if(k=E?`
`:"",b){let A=l(b);k+=`
${ct.indentComment(A,t.indent)}`}w===""&&!t.inFlow?k===`
`&&N&&(k=`

`):k+=`
${t.indent}`}else if(!m&&de.isCollection(e)){let A=w[0],T=w.indexOf(`
`),v=T!==-1,$=t.inFlow??e.flow??e.items.length===0;if(v||!$){let j=!1;if(v&&(A==="&"||A==="!")){let q=w.indexOf(" ");A==="&"&&q!==-1&&q<T&&w[q+1]==="!"&&(q=w.indexOf(" ",q+1)),(q===-1||T<q)&&(j=!0)}j||(k=`
${t.indent}`)}}else(w===""||w[0]===`
`)&&(k="");return h+=k+w,t.inFlow?_&&i&&i():N&&!_?h+=ct.lineComment(h,t.indent,l(N)):f&&r&&r(),h}Xs.stringifyPair=Kd});var ci=S(ai=>{"use strict";var Ys=xt("process");function Xd(n,...e){n==="debug"&&console.log(...e)}function zd(n,e){(n==="debug"||n==="warn")&&(typeof Ys.emitWarning=="function"?Ys.emitWarning(e):console.warn(e))}ai.debug=Xd;ai.warn=zd});var Qt=S(Zt=>{"use strict";var Wt=C(),Vs=F(),Jt="<<",Ht={identify:n=>n===Jt||typeof n=="symbol"&&n.description===Jt,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new Vs.Scalar(Symbol(Jt)),{addToJSMap:Gs}),stringify:()=>Jt},Yd=(n,e)=>(Ht.identify(e)||Wt.isScalar(e)&&(!e.type||e.type===Vs.Scalar.PLAIN)&&Ht.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===Ht.tag&&t.default);function Gs(n,e,t){let i=Js(n,t);if(Wt.isSeq(i))for(let r of i.items)li(n,e,r);else if(Array.isArray(i))for(let r of i)li(n,e,r);else li(n,e,i)}function li(n,e,t){let i=Js(n,t);if(!Wt.isMap(i))throw new Error("Merge sources must be maps or map aliases");let r=i.toJSON(null,n,Map);for(let[s,o]of r)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function Js(n,e){return n&&Wt.isAlias(e)?e.resolve(n.doc,n):e}Zt.addMergeToJSMap=Gs;Zt.isMergeKey=Yd;Zt.merge=Ht});var ui=S(Zs=>{"use strict";var Vd=ci(),Hs=Qt(),Gd=at(),Ws=C(),di=fe();function Jd(n,e,{key:t,value:i}){if(Ws.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,i);else if(Hs.isMergeKey(n,t))Hs.addMergeToJSMap(n,e,i);else{let r=di.toJS(t,"",n);if(e instanceof Map)e.set(r,di.toJS(i,r,n));else if(e instanceof Set)e.add(r);else{let s=Hd(t,r,n),o=di.toJS(i,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function Hd(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(Ws.isNode(n)&&t?.doc){let i=Gd.createStringifyContext(t.doc,{});i.anchors=new Set;for(let s of t.anchors.keys())i.anchors.add(s.anchor);i.inFlow=!0,i.inStringifyKey=!0;let r=n.toString(i);if(!t.mapKeyWarned){let s=JSON.stringify(r);s.length>40&&(s=s.substring(0,36)+'..."'),Vd.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return r}return JSON.stringify(e)}Zs.addPairToJSMap=Jd});var ge=S(fi=>{"use strict";var Qs=nt(),Wd=zs(),Zd=ui(),en=C();function Qd(n,e,t){let i=Qs.createNode(n,void 0,t),r=Qs.createNode(e,void 0,t);return new tn(i,r)}var tn=class n{constructor(e,t=null){Object.defineProperty(this,en.NODE_TYPE,{value:en.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:i}=this;return en.isNode(t)&&(t=t.clone(e)),en.isNode(i)&&(i=i.clone(e)),new n(t,i)}toJSON(e,t){let i=t?.mapAsMap?new Map:{};return Zd.addPairToJSMap(t,i,this)}toString(e,t,i){return e?.doc?Wd.stringifyPair(this,e,t,i):JSON.stringify(this)}};fi.Pair=tn;fi.createPair=Qd});var pi=S(to=>{"use strict";var ve=C(),eo=at(),nn=it();function eu(n,e,t){return(e.inFlow??n.flow?nu:tu)(n,e,t)}function tu({comment:n,items:e},t,{blockItemPrefix:i,flowChars:r,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,p=Object.assign({},t,{indent:s,type:null}),d=!1,u=[];for(let y=0;y<e.length;++y){let f=e[y],h=null;if(ve.isNode(f))!d&&f.spaceBefore&&u.push(""),rn(t,u,f.commentBefore,d),f.comment&&(h=f.comment);else if(ve.isPair(f)){let b=ve.isNode(f.key)?f.key:null;b&&(!d&&b.spaceBefore&&u.push(""),rn(t,u,b.commentBefore,d))}d=!1;let E=eo.stringify(f,p,()=>h=null,()=>d=!0);h&&(E+=nn.lineComment(E,s,l(h))),d&&h&&(d=!1),u.push(i+E)}let m;if(u.length===0)m=r.start+r.end;else{m=u[0];for(let y=1;y<u.length;++y){let f=u[y];m+=f?`
${c}${f}`:`
`}}return n?(m+=`
`+nn.indentComment(l(n),c),a&&a()):d&&o&&o(),m}function nu({items:n},e,{flowChars:t,itemIndent:i}){let{indent:r,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;i+=s;let c=Object.assign({},e,{indent:i,inFlow:!0,type:null}),l=!1,p=0,d=[];for(let y=0;y<n.length;++y){let f=n[y],h=null;if(ve.isNode(f))f.spaceBefore&&d.push(""),rn(e,d,f.commentBefore,!1),f.comment&&(h=f.comment);else if(ve.isPair(f)){let b=ve.isNode(f.key)?f.key:null;b&&(b.spaceBefore&&d.push(""),rn(e,d,b.commentBefore,!1),b.comment&&(l=!0));let N=ve.isNode(f.value)?f.value:null;N?(N.comment&&(h=N.comment),N.commentBefore&&(l=!0)):f.value==null&&b?.comment&&(h=b.comment)}h&&(l=!0);let E=eo.stringify(f,c,()=>h=null);l||(l=d.length>p||E.includes(`
`)),y<n.length-1?E+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=d.reduce((b,N)=>b+N.length+2,2)+(E.length+2)>e.options.lineWidth)),l&&(E+=",")),h&&(E+=nn.lineComment(E,i,a(h))),d.push(E),p=d.length}let{start:u,end:m}=t;if(d.length===0)return u+m;if(!l){let y=d.reduce((f,h)=>f+h.length+2,2);l=e.options.lineWidth>0&&y>e.options.lineWidth}if(l){let y=u;for(let f of d)y+=f?`
${s}${r}${f}`:`
`;return`${y}
${r}${m}`}else return`${u}${o}${d.join(" ")}${o}${m}`}function rn({indent:n,options:{commentString:e}},t,i,r){if(i&&r&&(i=i.replace(/^\n+/,"")),i){let s=nn.indentComment(e(i),n);t.push(s.trimStart())}}to.stringifyCollection=eu});var be=S(hi=>{"use strict";var iu=pi(),ru=ui(),su=Kt(),ye=C(),sn=ge(),ou=F();function lt(n,e){let t=ye.isScalar(e)?e.value:e;for(let i of n)if(ye.isPair(i)&&(i.key===e||i.key===t||ye.isScalar(i.key)&&i.key.value===t))return i}var mi=class extends su.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(ye.MAP,e),this.items=[]}static from(e,t,i){let{keepUndefined:r,replacer:s}=i,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||r)&&o.items.push(sn.createPair(c,l,i))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let i;ye.isPair(e)?i=e:!e||typeof e!="object"||!("key"in e)?i=new sn.Pair(e,e?.value):i=new sn.Pair(e.key,e.value);let r=lt(this.items,i.key),s=this.schema?.sortMapEntries;if(r){if(!t)throw new Error(`Key ${i.key} already set`);ye.isScalar(r.value)&&ou.isScalarValue(i.value)?r.value.value=i.value:r.value=i.value}else if(s){let o=this.items.findIndex(a=>s(i,a)<0);o===-1?this.items.push(i):this.items.splice(o,0,i)}else this.items.push(i)}delete(e){let t=lt(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let r=lt(this.items,e)?.value;return(!t&&ye.isScalar(r)?r.value:r)??void 0}has(e){return!!lt(this.items,e)}set(e,t){this.add(new sn.Pair(e,t),!0)}toJSON(e,t,i){let r=i?new i:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(r);for(let s of this.items)ru.addPairToJSMap(t,r,s);return r}toString(e,t,i){if(!e)return JSON.stringify(this);for(let r of this.items)if(!ye.isPair(r))throw new Error(`Map items must all be pairs; found ${JSON.stringify(r)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),iu.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:i,onComment:t})}};hi.YAMLMap=mi;hi.findPair=lt});var je=S(io=>{"use strict";var au=C(),no=be(),cu={collection:"map",default:!0,nodeClass:no.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return au.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>no.YAMLMap.from(n,e,t)};io.map=cu});var Ee=S(ro=>{"use strict";var lu=nt(),du=pi(),uu=Kt(),an=C(),fu=F(),pu=fe(),gi=class extends uu.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(an.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=on(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let i=on(e);if(typeof i!="number")return;let r=this.items[i];return!t&&an.isScalar(r)?r.value:r}has(e){let t=on(e);return typeof t=="number"&&t<this.items.length}set(e,t){let i=on(e);if(typeof i!="number")throw new Error(`Expected a valid index, not ${e}.`);let r=this.items[i];an.isScalar(r)&&fu.isScalarValue(t)?r.value=t:this.items[i]=t}toJSON(e,t){let i=[];t?.onCreate&&t.onCreate(i);let r=0;for(let s of this.items)i.push(pu.toJS(s,String(r++),t));return i}toString(e,t,i){return e?du.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:i,onComment:t}):JSON.stringify(this)}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof r=="function"){let c=t instanceof Set?a:String(o++);a=r.call(t,c,a)}s.items.push(lu.createNode(a,void 0,i))}}return s}};function on(n){let e=an.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}ro.YAMLSeq=gi});var Ke=S(oo=>{"use strict";var mu=C(),so=Ee(),hu={collection:"seq",default:!0,nodeClass:so.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return mu.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>so.YAMLSeq.from(n,e,t)};oo.seq=hu});var dt=S(ao=>{"use strict";var gu=ot(),yu={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,i){return e=Object.assign({actualString:!0},e),gu.stringifyString(n,e,t,i)}};ao.string=yu});var cn=S(uo=>{"use strict";var co=F(),lo={identify:n=>n==null,createNode:()=>new co.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new co.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&lo.test.test(n)?n:e.options.nullStr};uo.nullTag=lo});var yi=S(po=>{"use strict";var bu=F(),fo={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new bu.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&fo.test.test(n)){let i=n[0]==="t"||n[0]==="T";if(e===i)return n}return e?t.options.trueStr:t.options.falseStr}};po.boolTag=fo});var Xe=S(mo=>{"use strict";function Eu({format:n,minFractionDigits:e,tag:t,value:i}){if(typeof i=="bigint")return String(i);let r=typeof i=="number"?i:Number(i);if(!isFinite(r))return isNaN(r)?".nan":r<0?"-.inf":".inf";let s=Object.is(i,-0)?"-0":JSON.stringify(i);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}mo.stringifyNumber=Eu});var Ei=S(ln=>{"use strict";var Tu=F(),bi=Xe(),_u={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:bi.stringifyNumber},Nu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():bi.stringifyNumber(n)}},Su={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new Tu.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:bi.stringifyNumber};ln.float=Su;ln.floatExp=Nu;ln.floatNaN=_u});var _i=S(un=>{"use strict";var ho=Xe(),dn=n=>typeof n=="bigint"||Number.isInteger(n),Ti=(n,e,t,{intAsBigInt:i})=>i?BigInt(n):parseInt(n.substring(e),t);function go(n,e,t){let{value:i}=n;return dn(i)&&i>=0?t+i.toString(e):ho.stringifyNumber(n)}var wu={identify:n=>dn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>Ti(n,2,8,t),stringify:n=>go(n,8,"0o")},vu={identify:dn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>Ti(n,0,10,t),stringify:ho.stringifyNumber},ku={identify:n=>dn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>Ti(n,2,16,t),stringify:n=>go(n,16,"0x")};un.int=vu;un.intHex=ku;un.intOct=wu});var bo=S(yo=>{"use strict";var Au=je(),Lu=cn(),Ou=Ke(),Iu=dt(),Ru=yi(),Ni=Ei(),Si=_i(),xu=[Au.map,Ou.seq,Iu.string,Lu.nullTag,Ru.boolTag,Si.intOct,Si.int,Si.intHex,Ni.floatNaN,Ni.floatExp,Ni.float];yo.schema=xu});var _o=S(To=>{"use strict";var Cu=F(),Du=je(),Pu=Ke();function Eo(n){return typeof n=="bigint"||Number.isInteger(n)}var fn=({value:n})=>JSON.stringify(n),qu=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:fn},{identify:n=>n==null,createNode:()=>new Cu.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:fn},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:fn},{identify:Eo,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Eo(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:fn}],$u={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},Mu=[Du.map,Pu.seq].concat(qu,$u);To.schema=Mu});var vi=S(No=>{"use strict";var ut=xt("buffer"),wi=F(),Uu=ot(),Fu={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof ut.Buffer=="function")return ut.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),i=new Uint8Array(t.length);for(let r=0;r<t.length;++r)i[r]=t.charCodeAt(r);return i}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},i,r,s){if(!t)return"";let o=t,a;if(typeof ut.Buffer=="function")a=o instanceof ut.Buffer?o.toString("base64"):ut.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=wi.Scalar.BLOCK_LITERAL),e!==wi.Scalar.QUOTE_DOUBLE){let c=Math.max(i.options.lineWidth-i.indent.length,i.options.minContentWidth),l=Math.ceil(a.length/c),p=new Array(l);for(let d=0,u=0;d<l;++d,u+=c)p[d]=a.substr(u,c);a=p.join(e===wi.Scalar.BLOCK_LITERAL?`
`:" ")}return Uu.stringifyString({comment:n,type:e,value:a},i,r,s)}};No.binary=Fu});var hn=S(mn=>{"use strict";var pn=C(),ki=ge(),Bu=F(),ju=Ee();function So(n,e){if(pn.isSeq(n))for(let t=0;t<n.items.length;++t){let i=n.items[t];if(!pn.isPair(i)){if(pn.isMap(i)){i.items.length>1&&e("Each pair must have its own sequence indicator");let r=i.items[0]||new ki.Pair(new Bu.Scalar(null));if(i.commentBefore&&(r.key.commentBefore=r.key.commentBefore?`${i.commentBefore}
${r.key.commentBefore}`:i.commentBefore),i.comment){let s=r.value??r.key;s.comment=s.comment?`${i.comment}
${s.comment}`:i.comment}i=r}n.items[t]=pn.isPair(i)?i:new ki.Pair(i)}}else e("Expected a sequence for this tag");return n}function wo(n,e,t){let{replacer:i}=t,r=new ju.YAMLSeq(n);r.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof i=="function"&&(o=i.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;r.items.push(ki.createPair(a,c,t))}return r}var Ku={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:So,createNode:wo};mn.createPairs=wo;mn.pairs=Ku;mn.resolvePairs=So});var Oi=S(Li=>{"use strict";var vo=C(),Ai=fe(),ft=be(),Xu=Ee(),ko=hn(),ke=class n extends Xu.YAMLSeq{constructor(){super(),this.add=ft.YAMLMap.prototype.add.bind(this),this.delete=ft.YAMLMap.prototype.delete.bind(this),this.get=ft.YAMLMap.prototype.get.bind(this),this.has=ft.YAMLMap.prototype.has.bind(this),this.set=ft.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let i=new Map;t?.onCreate&&t.onCreate(i);for(let r of this.items){let s,o;if(vo.isPair(r)?(s=Ai.toJS(r.key,"",t),o=Ai.toJS(r.value,s,t)):s=Ai.toJS(r,"",t),i.has(s))throw new Error("Ordered maps must not include duplicate keys");i.set(s,o)}return i}static from(e,t,i){let r=ko.createPairs(e,t,i),s=new this;return s.items=r.items,s}};ke.tag="tag:yaml.org,2002:omap";var zu={collection:"seq",identify:n=>n instanceof Map,nodeClass:ke,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=ko.resolvePairs(n,e),i=[];for(let{key:r}of t.items)vo.isScalar(r)&&(i.includes(r.value)?e(`Ordered maps must not include duplicate keys: ${r.value}`):i.push(r.value));return Object.assign(new ke,t)},createNode:(n,e,t)=>ke.from(n,e,t)};Li.YAMLOMap=ke;Li.omap=zu});var Ro=S(Ii=>{"use strict";var Ao=F();function Lo({value:n,source:e},t){return e&&(n?Oo:Io).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var Oo={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new Ao.Scalar(!0),stringify:Lo},Io={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new Ao.Scalar(!1),stringify:Lo};Ii.falseTag=Io;Ii.trueTag=Oo});var xo=S(gn=>{"use strict";var Yu=F(),Ri=Xe(),Vu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Ri.stringifyNumber},Gu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Ri.stringifyNumber(n)}},Ju={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new Yu.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let i=n.substring(t+1).replace(/_/g,"");i[i.length-1]==="0"&&(e.minFractionDigits=i.length)}return e},stringify:Ri.stringifyNumber};gn.float=Ju;gn.floatExp=Gu;gn.floatNaN=Vu});var Do=S(mt=>{"use strict";var Co=Xe(),pt=n=>typeof n=="bigint"||Number.isInteger(n);function yn(n,e,t,{intAsBigInt:i}){let r=n[0];if((r==="-"||r==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),i){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return r==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return r==="-"?-1*s:s}function xi(n,e,t){let{value:i}=n;if(pt(i)){let r=i.toString(e);return i<0?"-"+t+r.substr(1):t+r}return Co.stringifyNumber(n)}var Hu={identify:pt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>yn(n,2,2,t),stringify:n=>xi(n,2,"0b")},Wu={identify:pt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>yn(n,1,8,t),stringify:n=>xi(n,8,"0")},Zu={identify:pt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>yn(n,0,10,t),stringify:Co.stringifyNumber},Qu={identify:pt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>yn(n,2,16,t),stringify:n=>xi(n,16,"0x")};mt.int=Zu;mt.intBin=Hu;mt.intHex=Qu;mt.intOct=Wu});var Di=S(Ci=>{"use strict";var Tn=C(),bn=ge(),En=be(),Ae=class n extends En.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;Tn.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new bn.Pair(e.key,null):t=new bn.Pair(e,null),En.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let i=En.findPair(this.items,e);return!t&&Tn.isPair(i)?Tn.isScalar(i.key)?i.key.value:i.key:i}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let i=En.findPair(this.items,e);i&&!t?this.items.splice(this.items.indexOf(i),1):!i&&t&&this.items.push(new bn.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,i){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,i);throw new Error("Set items must all have null values")}static from(e,t,i){let{replacer:r}=i,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof r=="function"&&(o=r.call(t,o,o)),s.items.push(bn.createPair(o,null,i));return s}};Ae.tag="tag:yaml.org,2002:set";var ef={collection:"map",identify:n=>n instanceof Set,nodeClass:Ae,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>Ae.from(n,e,t),resolve(n,e){if(Tn.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new Ae,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};Ci.YAMLSet=Ae;Ci.set=ef});var qi=S(_n=>{"use strict";var tf=Xe();function Pi(n,e){let t=n[0],i=t==="-"||t==="+"?n.substring(1):n,r=o=>e?BigInt(o):Number(o),s=i.replace(/_/g,"").split(":").reduce((o,a)=>o*r(60)+r(a),r(0));return t==="-"?r(-1)*s:s}function Po(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return tf.stringifyNumber(n);let i="";e<0&&(i="-",e*=t(-1));let r=t(60),s=[e%r];return e<60?s.unshift(0):(e=(e-s[0])/r,s.unshift(e%r),e>=60&&(e=(e-s[0])/r,s.unshift(e))),i+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var nf={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>Pi(n,t),stringify:Po},rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>Pi(n,!1),stringify:Po},qo={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(qo.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,i,r,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,i-1,r,s||0,o||0,a||0,c),p=e[8];if(p&&p!=="Z"){let d=Pi(p,!1);Math.abs(d)<30&&(d*=60),l-=6e4*d}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};_n.floatTime=rf;_n.intTime=nf;_n.timestamp=qo});var Uo=S(Mo=>{"use strict";var sf=je(),of=cn(),af=Ke(),cf=dt(),lf=vi(),$o=Ro(),$i=xo(),Nn=Do(),df=Qt(),uf=Oi(),ff=hn(),pf=Di(),Mi=qi(),mf=[sf.map,af.seq,cf.string,of.nullTag,$o.trueTag,$o.falseTag,Nn.intBin,Nn.intOct,Nn.int,Nn.intHex,$i.floatNaN,$i.floatExp,$i.float,lf.binary,df.merge,uf.omap,ff.pairs,pf.set,Mi.intTime,Mi.floatTime,Mi.timestamp];Mo.schema=mf});var Jo=S(Bi=>{"use strict";var Ko=je(),hf=cn(),Xo=Ke(),gf=dt(),yf=yi(),Ui=Ei(),Fi=_i(),bf=bo(),Ef=_o(),zo=vi(),ht=Qt(),Yo=Oi(),Vo=hn(),Fo=Uo(),Go=Di(),Sn=qi(),Bo=new Map([["core",bf.schema],["failsafe",[Ko.map,Xo.seq,gf.string]],["json",Ef.schema],["yaml11",Fo.schema],["yaml-1.1",Fo.schema]]),jo={binary:zo.binary,bool:yf.boolTag,float:Ui.float,floatExp:Ui.floatExp,floatNaN:Ui.floatNaN,floatTime:Sn.floatTime,int:Fi.int,intHex:Fi.intHex,intOct:Fi.intOct,intTime:Sn.intTime,map:Ko.map,merge:ht.merge,null:hf.nullTag,omap:Yo.omap,pairs:Vo.pairs,seq:Xo.seq,set:Go.set,timestamp:Sn.timestamp},Tf={"tag:yaml.org,2002:binary":zo.binary,"tag:yaml.org,2002:merge":ht.merge,"tag:yaml.org,2002:omap":Yo.omap,"tag:yaml.org,2002:pairs":Vo.pairs,"tag:yaml.org,2002:set":Go.set,"tag:yaml.org,2002:timestamp":Sn.timestamp};function _f(n,e,t){let i=Bo.get(e);if(i&&!n)return t&&!i.includes(ht.merge)?i.concat(ht.merge):i.slice();let r=i;if(!r)if(Array.isArray(n))r=[];else{let s=Array.from(Bo.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)r=r.concat(s);else typeof n=="function"&&(r=n(r.slice()));return t&&(r=r.concat(ht.merge)),r.reduce((s,o)=>{let a=typeof o=="string"?jo[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(jo).map(p=>JSON.stringify(p)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}Bi.coreKnownTags=Tf;Bi.getTags=_f});var Xi=S(Ho=>{"use strict";var ji=C(),Nf=je(),Sf=Ke(),wf=dt(),wn=Jo(),vf=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,Ki=class n{constructor({compat:e,customTags:t,merge:i,resolveKnownTags:r,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?wn.getTags(e,"compat"):e?wn.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=r?wn.coreKnownTags:{},this.tags=wn.getTags(t,this.name,i),this.toStringOptions=a??null,Object.defineProperty(this,ji.MAP,{value:Nf.map}),Object.defineProperty(this,ji.SCALAR,{value:wf.string}),Object.defineProperty(this,ji.SEQ,{value:Sf.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?vf:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};Ho.Schema=Ki});var Zo=S(Wo=>{"use strict";var kf=C(),zi=at(),gt=it();function Af(n,e){let t=[],i=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),i=!0):n.directives.docStart&&(i=!0)}i&&t.push("---");let r=zi.createStringifyContext(n,e),{commentString:s}=r.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(gt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(kf.isNode(n.contents)){if(n.contents.spaceBefore&&i&&t.push(""),n.contents.commentBefore){let p=s(n.contents.commentBefore);t.push(gt.indentComment(p,""))}r.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=zi.stringify(n.contents,r,()=>a=null,c);a&&(l+=gt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(zi.stringify(n.contents,r));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(gt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(gt.indentComment(s(c),"")))}return t.join(`
`)+`
`}Wo.stringifyDocument=Af});var yt=S(Qo=>{"use strict";var Lf=tt(),ze=Kt(),Z=C(),Of=ge(),If=fe(),Rf=Xi(),xf=Zo(),Yi=Ut(),Cf=Hn(),Df=nt(),Vi=Jn(),Gi=class n{constructor(e,t,i){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,Z.NODE_TYPE,{value:Z.DOC});let r=null;typeof t=="function"||Array.isArray(t)?r=t:i===void 0&&t&&(i=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},i);this.options=s;let{version:o}=s;i?._directives?(this.directives=i._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new Vi.Directives({version:o}),this.setSchema(o,i),this.contents=e===void 0?null:this.createNode(e,r,i)}clone(){let e=Object.create(n.prototype,{[Z.NODE_TYPE]:{value:Z.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=Z.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){Ye(this.contents)&&this.contents.add(e)}addIn(e,t){Ye(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let i=Yi.anchorNames(this);e.anchor=!t||i.has(t)?Yi.findNewAnchor(t||"a",i):t}return new Lf.Alias(e.anchor)}createNode(e,t,i){let r;if(typeof t=="function")e=t.call({"":e},"",e),r=t;else if(Array.isArray(t)){let h=b=>typeof b=="number"||b instanceof String||b instanceof Number,E=t.filter(h).map(String);E.length>0&&(t=t.concat(E)),r=t}else i===void 0&&t&&(i=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:p}=i??{},{onAnchor:d,setAnchors:u,sourceObjects:m}=Yi.createNodeAnchors(this,o||"a"),y={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:d,onTagObj:l,replacer:r,schema:this.schema,sourceObjects:m},f=Df.createNode(e,p,y);return a&&Z.isCollection(f)&&(f.flow=!0),u(),f}createPair(e,t,i={}){let r=this.createNode(e,null,i),s=this.createNode(t,null,i);return new Of.Pair(r,s)}delete(e){return Ye(this.contents)?this.contents.delete(e):!1}deleteIn(e){return ze.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):Ye(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return Z.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return ze.isEmptyPath(e)?!t&&Z.isScalar(this.contents)?this.contents.value:this.contents:Z.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return Z.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return ze.isEmptyPath(e)?this.contents!==void 0:Z.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=ze.collectionFromPath(this.schema,[e],t):Ye(this.contents)&&this.contents.set(e,t)}setIn(e,t){ze.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=ze.collectionFromPath(this.schema,Array.from(e),t):Ye(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let i;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new Vi.Directives({version:"1.1"}),i={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new Vi.Directives({version:e}),i={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,i=null;break;default:{let r=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${r}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(i)this.schema=new Rf.Schema(Object.assign(i,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:i,maxAliasCount:r,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:i===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},c=If.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:p}of a.anchors.values())s(p,l);return typeof o=="function"?Cf.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return xf.stringifyDocument(this,e)}};function Ye(n){if(Z.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}Qo.Document=Gi});var Tt=S(Et=>{"use strict";var bt=class extends Error{constructor(e,t,i,r){super(),this.name=e,this.code=i,this.message=r,this.pos=t}},Ji=class extends bt{constructor(e,t,i){super("YAMLParseError",e,t,i)}},Hi=class extends bt{constructor(e,t,i){super("YAMLWarning",e,t,i)}},Pf=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:i,col:r}=t.linePos[0];t.message+=` at line ${i}, column ${r}`;let s=r-1,o=n.substring(e.lineStarts[i-1],e.lineStarts[i]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),i>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[i-2],e.lineStarts[i-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===i&&c.col>r&&(a=Math.max(1,Math.min(c.col-r,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};Et.YAMLError=bt;Et.YAMLParseError=Ji;Et.YAMLWarning=Hi;Et.prettifyError=Pf});var _t=S(ea=>{"use strict";function qf(n,{flow:e,indicator:t,next:i,offset:r,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,p=a,d="",u="",m=!1,y=!1,f=null,h=null,E=null,b=null,N=null,_=null,w=null;for(let T of n)switch(y&&(T.type!=="space"&&T.type!=="newline"&&T.type!=="comma"&&s(T.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),y=!1),f&&(l&&T.type!=="comment"&&T.type!=="newline"&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),f=null),T.type){case"space":!e&&(t!=="doc-start"||i?.type!=="flow-collection")&&T.source.includes("	")&&(f=T),p=!0;break;case"comment":{p||s(T,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let v=T.source.substring(1)||" ";d?d+=u+v:d=v,u="",l=!1;break}case"newline":l?d?d+=T.source:(!_||t!=="seq-item-ind")&&(c=!0):u+=T.source,l=!0,m=!0,(h||E)&&(b=T),p=!0;break;case"anchor":h&&s(T,"MULTIPLE_ANCHORS","A node can have at most one anchor"),T.source.endsWith(":")&&s(T.offset+T.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),h=T,w??(w=T.offset),l=!1,p=!1,y=!0;break;case"tag":{E&&s(T,"MULTIPLE_TAGS","A node can have at most one tag"),E=T,w??(w=T.offset),l=!1,p=!1,y=!0;break}case t:(h||E)&&s(T,"BAD_PROP_ORDER",`Anchors and tags must be after the ${T.source} indicator`),_&&s(T,"UNEXPECTED_TOKEN",`Unexpected ${T.source} in ${e??"collection"}`),_=T,l=t==="seq-item-ind"||t==="explicit-key-ind",p=!1;break;case"comma":if(e){N&&s(T,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),N=T,l=!1,p=!1;break}default:s(T,"UNEXPECTED_TOKEN",`Unexpected ${T.type} token`),l=!1,p=!1}let k=n[n.length-1],A=k?k.offset+k.source.length:r;return y&&i&&i.type!=="space"&&i.type!=="newline"&&i.type!=="comma"&&(i.type!=="scalar"||i.source!=="")&&s(i.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),f&&(l&&f.indent<=o||i?.type==="block-map"||i?.type==="block-seq")&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:N,found:_,spaceBefore:c,comment:d,hasNewline:m,anchor:h,tag:E,newlineAfterProp:b,end:A,start:w??A}}ea.resolveProps=qf});var vn=S(ta=>{"use strict";function Wi(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(Wi(e.key)||Wi(e.value))return!0}return!1;default:return!0}}ta.containsNewline=Wi});var Zi=S(na=>{"use strict";var $f=vn();function Mf(n,e,t){if(e?.type==="flow-collection"){let i=e.end[0];i.indent===n&&(i.source==="]"||i.source==="}")&&$f.containsNewline(e)&&t(i,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}na.flowIndentCheck=Mf});var Qi=S(ra=>{"use strict";var ia=C();function Uf(n,e,t){let{uniqueKeys:i}=n.options;if(i===!1)return!1;let r=typeof i=="function"?i:(s,o)=>s===o||ia.isScalar(s)&&ia.isScalar(o)&&s.value===o.value;return e.some(s=>r(s.key,t))}ra.mapIncludes=Uf});var da=S(la=>{"use strict";var sa=ge(),Ff=be(),oa=_t(),Bf=vn(),aa=Zi(),jf=Qi(),ca="All mapping items must start at the same column";function Kf({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??Ff.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=i.offset,l=null;for(let p of i.items){let{start:d,key:u,sep:m,value:y}=p,f=oa.resolveProps(d,{indicator:"explicit-key-ind",next:u??m?.[0],offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0}),h=!f.found;if(h){if(u&&(u.type==="block-seq"?r(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in u&&u.indent!==i.indent&&r(c,"BAD_INDENT",ca)),!f.anchor&&!f.tag&&!m){l=f.end,f.comment&&(a.comment?a.comment+=`
`+f.comment:a.comment=f.comment);continue}(f.newlineAfterProp||Bf.containsNewline(u))&&r(u??d[d.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else f.found?.indent!==i.indent&&r(c,"BAD_INDENT",ca);t.atKey=!0;let E=f.end,b=u?n(t,u,f,r):e(t,E,d,null,f,r);t.schema.compat&&aa.flowIndentCheck(i.indent,u,r),t.atKey=!1,jf.mapIncludes(t,a.items,b)&&r(E,"DUPLICATE_KEY","Map keys must be unique");let N=oa.resolveProps(m??[],{indicator:"map-value-ind",next:y,offset:b.range[2],onError:r,parentIndent:i.indent,startOnNewline:!u||u.type==="block-scalar"});if(c=N.end,N.found){h&&(y?.type==="block-map"&&!N.hasNewline&&r(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&f.start<N.found.offset-1024&&r(b.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let _=y?n(t,y,N,r):e(t,c,m,null,N,r);t.schema.compat&&aa.flowIndentCheck(i.indent,y,r),c=_.range[2];let w=new sa.Pair(b,_);t.options.keepSourceTokens&&(w.srcToken=p),a.items.push(w)}else{h&&r(b.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),N.comment&&(b.comment?b.comment+=`
`+N.comment:b.comment=N.comment);let _=new sa.Pair(b);t.options.keepSourceTokens&&(_.srcToken=p),a.items.push(_)}}return l&&l<c&&r(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[i.offset,c,l??c],a}la.resolveBlockMap=Kf});var fa=S(ua=>{"use strict";var Xf=Ee(),zf=_t(),Yf=Zi();function Vf({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=s?.nodeClass??Xf.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=i.offset,l=null;for(let{start:p,value:d}of i.items){let u=zf.resolveProps(p,{indicator:"seq-item-ind",next:d,offset:c,onError:r,parentIndent:i.indent,startOnNewline:!0});if(!u.found)if(u.anchor||u.tag||d)d?.type==="block-seq"?r(u.end,"BAD_INDENT","All sequence items must start at the same column"):r(c,"MISSING_CHAR","Sequence item without - indicator");else{l=u.end,u.comment&&(a.comment=u.comment);continue}let m=d?n(t,d,u,r):e(t,u.end,p,null,u,r);t.schema.compat&&Yf.flowIndentCheck(i.indent,d,r),c=m.range[2],a.items.push(m)}return a.range=[i.offset,c,l??c],a}ua.resolveBlockSeq=Vf});var Ve=S(pa=>{"use strict";function Gf(n,e,t,i){let r="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&i(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let p=c.substring(1)||" ";r?r+=o+p:r=p,o="";break}case"newline":r&&(o+=c),s=!0;break;default:i(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:r,offset:e}}pa.resolveEnd=Gf});var ya=S(ga=>{"use strict";var Jf=C(),Hf=ge(),ma=be(),Wf=Ee(),Zf=Ve(),ha=_t(),Qf=vn(),ep=Qi(),er="Block collections are not allowed within flow collections",tr=n=>n&&(n.type==="block-map"||n.type==="block-seq");function tp({composeNode:n,composeEmptyNode:e},t,i,r,s){let o=i.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?ma.YAMLMap:Wf.YAMLSeq),l=new c(t.schema);l.flow=!0;let p=t.atRoot;p&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let d=i.offset+i.start.source.length;for(let h=0;h<i.items.length;++h){let E=i.items[h],{start:b,key:N,sep:_,value:w}=E,k=ha.resolveProps(b,{flow:a,indicator:"explicit-key-ind",next:N??_?.[0],offset:d,onError:r,parentIndent:i.indent,startOnNewline:!1});if(!k.found){if(!k.anchor&&!k.tag&&!_&&!w){h===0&&k.comma?r(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):h<i.items.length-1&&r(k.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),k.comment&&(l.comment?l.comment+=`
`+k.comment:l.comment=k.comment),d=k.end;continue}!o&&t.options.strict&&Qf.containsNewline(N)&&r(N,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(h===0)k.comma&&r(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(k.comma||r(k.start,"MISSING_CHAR",`Missing , between ${a} items`),k.comment){let A="";e:for(let T of b)switch(T.type){case"comma":case"space":break;case"comment":A=T.source.substring(1);break e;default:break e}if(A){let T=l.items[l.items.length-1];Jf.isPair(T)&&(T=T.value??T.key),T.comment?T.comment+=`
`+A:T.comment=A,k.comment=k.comment.substring(A.length+1)}}if(!o&&!_&&!k.found){let A=w?n(t,w,k,r):e(t,k.end,_,null,k,r);l.items.push(A),d=A.range[2],tr(w)&&r(A.range,"BLOCK_IN_FLOW",er)}else{t.atKey=!0;let A=k.end,T=N?n(t,N,k,r):e(t,A,b,null,k,r);tr(N)&&r(T.range,"BLOCK_IN_FLOW",er),t.atKey=!1;let v=ha.resolveProps(_??[],{flow:a,indicator:"map-value-ind",next:w,offset:T.range[2],onError:r,parentIndent:i.indent,startOnNewline:!1});if(v.found){if(!o&&!k.found&&t.options.strict){if(_)for(let q of _){if(q===v.found)break;if(q.type==="newline"){r(q,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}k.start<v.found.offset-1024&&r(v.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else w&&("source"in w&&w.source?.[0]===":"?r(w,"MISSING_CHAR",`Missing space after : in ${a}`):r(v.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let $=w?n(t,w,v,r):v.found?e(t,v.end,_,null,v,r):null;$?tr(w)&&r($.range,"BLOCK_IN_FLOW",er):v.comment&&(T.comment?T.comment+=`
`+v.comment:T.comment=v.comment);let j=new Hf.Pair(T,$);if(t.options.keepSourceTokens&&(j.srcToken=E),o){let q=l;ep.mapIncludes(t,q.items,T)&&r(A,"DUPLICATE_KEY","Map keys must be unique"),q.items.push(j)}else{let q=new ma.YAMLMap(t.schema);q.flow=!0,q.items.push(j);let O=($??T).range;q.range=[T.range[0],O[1],O[2]],l.items.push(q)}d=$?$.range[2]:v.end}}let u=o?"}":"]",[m,...y]=i.end,f=d;if(m?.source===u)f=m.offset+m.source.length;else{let h=a[0].toUpperCase()+a.substring(1),E=p?`${h} must end with a ${u}`:`${h} in block collection must be sufficiently indented and end with a ${u}`;r(d,p?"MISSING_CHAR":"BAD_INDENT",E),m&&m.source.length!==1&&y.unshift(m)}if(y.length>0){let h=Zf.resolveEnd(y,f,t.options.strict,r);h.comment&&(l.comment?l.comment+=`
`+h.comment:l.comment=h.comment),l.range=[i.offset,f,h.offset]}else l.range=[i.offset,f,f];return l}ga.resolveFlowCollection=tp});var Ea=S(ba=>{"use strict";var np=C(),ip=F(),rp=be(),sp=Ee(),op=da(),ap=fa(),cp=ya();function nr(n,e,t,i,r,s){let o=t.type==="block-map"?op.resolveBlockMap(n,e,t,i,s):t.type==="block-seq"?ap.resolveBlockSeq(n,e,t,i,s):cp.resolveFlowCollection(n,e,t,i,s),a=o.constructor;return r==="!"||r===a.tagName?(o.tag=a.tagName,o):(r&&(o.tag=r),o)}function lp(n,e,t,i,r){let s=i.tag,o=s?e.directives.tagName(s.source,u=>r(s,"TAG_RESOLVE_FAILED",u)):null;if(t.type==="block-seq"){let{anchor:u,newlineAfterProp:m}=i,y=u&&s?u.offset>s.offset?u:s:u??s;y&&(!m||m.offset<y.offset)&&r(y,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===rp.YAMLMap.tagName&&a==="map"||o===sp.YAMLSeq.tagName&&a==="seq")return nr(n,e,t,r,o);let c=e.schema.tags.find(u=>u.tag===o&&u.collection===a);if(!c){let u=e.schema.knownTags[o];if(u?.collection===a)e.schema.tags.push(Object.assign({},u,{default:!1})),c=u;else return u?r(s,"BAD_COLLECTION_TYPE",`${u.tag} used for ${a} collection, but expects ${u.collection??"scalar"}`,!0):r(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),nr(n,e,t,r,o)}let l=nr(n,e,t,r,o,c),p=c.resolve?.(l,u=>r(s,"TAG_RESOLVE_FAILED",u),e.options)??l,d=np.isNode(p)?p:new ip.Scalar(p);return d.range=l.range,d.tag=o,c?.format&&(d.format=c.format),d}ba.composeCollection=lp});var rr=S(Ta=>{"use strict";var ir=F();function dp(n,e,t){let i=e.offset,r=up(e,n.options.strict,t);if(!r)return{value:"",type:null,comment:"",range:[i,i,i]};let s=r.mode===">"?ir.Scalar.BLOCK_FOLDED:ir.Scalar.BLOCK_LITERAL,o=e.source?fp(e.source):[],a=o.length;for(let f=o.length-1;f>=0;--f){let h=o[f][1];if(h===""||h==="\r")a=f;else break}if(a===0){let f=r.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",h=i+r.length;return e.source&&(h+=e.source.length),{value:f,type:s,comment:r.comment,range:[i,h,h]}}let c=e.indent+r.indent,l=e.offset+r.length,p=0;for(let f=0;f<a;++f){let[h,E]=o[f];if(E===""||E==="\r")r.indent===0&&h.length>c&&(c=h.length);else{h.length<c&&t(l+h.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),r.indent===0&&(c=h.length),p=f,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=h.length+E.length+1}for(let f=o.length-1;f>=a;--f)o[f][0].length>c&&(a=f+1);let d="",u="",m=!1;for(let f=0;f<p;++f)d+=o[f][0].slice(c)+`
`;for(let f=p;f<a;++f){let[h,E]=o[f];l+=h.length+E.length+1;let b=E[E.length-1]==="\r";if(b&&(E=E.slice(0,-1)),E&&h.length<c){let _=`Block scalar lines must not be less indented than their ${r.indent?"explicit indentation indicator":"first line"}`;t(l-E.length-(b?2:1),"BAD_INDENT",_),h=""}s===ir.Scalar.BLOCK_LITERAL?(d+=u+h.slice(c)+E,u=`
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
`}let y=i+r.length+e.source.length;return{value:d,type:s,comment:r.comment,range:[i,y,y]}}function up({offset:n,props:e},t,i){if(e[0].type!=="block-scalar-header")return i(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:r}=e[0],s=r[0],o=0,a="",c=-1;for(let u=1;u<r.length;++u){let m=r[u];if(!a&&(m==="-"||m==="+"))a=m;else{let y=Number(m);!o&&y?o=y:c===-1&&(c=n+u)}}c!==-1&&i(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${r}`);let l=!1,p="",d=r.length;for(let u=1;u<e.length;++u){let m=e[u];switch(m.type){case"space":l=!0;case"newline":d+=m.source.length;break;case"comment":t&&!l&&i(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),d+=m.source.length,p=m.source.substring(1);break;case"error":i(m,"UNEXPECTED_TOKEN",m.message),d+=m.source.length;break;default:{let y=`Unexpected token in block scalar header: ${m.type}`;i(m,"UNEXPECTED_TOKEN",y);let f=m.source;f&&typeof f=="string"&&(d+=f.length)}}}return{mode:s,indent:o,chomp:a,comment:p,length:d}}function fp(n){let e=n.split(/\n( *)/),t=e[0],i=t.match(/^( *)/),s=[i?.[1]?[i[1],t.slice(i[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}Ta.resolveBlockScalar=dp});var or=S(Na=>{"use strict";var sr=F(),pp=Ve();function mp(n,e,t){let{offset:i,type:r,source:s,end:o}=n,a,c,l=(u,m,y)=>t(i+u,m,y);switch(r){case"scalar":a=sr.Scalar.PLAIN,c=hp(s,l);break;case"single-quoted-scalar":a=sr.Scalar.QUOTE_SINGLE,c=gp(s,l);break;case"double-quoted-scalar":a=sr.Scalar.QUOTE_DOUBLE,c=yp(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${r}`),{value:"",type:null,comment:"",range:[i,i+s.length,i+s.length]}}let p=i+s.length,d=pp.resolveEnd(o,p,e,t);return{value:c,type:a,comment:d.comment,range:[i,p,d.offset]}}function hp(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),_a(n)}function gp(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),_a(n.slice(1,-1)).replace(/''/g,"'")}function _a(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let i=e.exec(n);if(!i)return n;let r=i[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;i=t.exec(n);)i[1]===""?s===`
`?r+=s:s=`
`:(r+=s+i[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,i=a.exec(n),r+s+(i?.[1]??"")}function yp(n,e){let t="";for(let i=1;i<n.length-1;++i){let r=n[i];if(!(r==="\r"&&n[i+1]===`
`))if(r===`
`){let{fold:s,offset:o}=bp(n,i);t+=s,i=o}else if(r==="\\"){let s=n[++i],o=Ep[s];if(o)t+=o;else if(s===`
`)for(s=n[i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="\r"&&n[i+1]===`
`)for(s=n[++i+1];s===" "||s==="	";)s=n[++i+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=Tp(n,i+1,a,e),i+=a}else{let a=n.substr(i-1,2);e(i-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(r===" "||r==="	"){let s=i,o=n[i+1];for(;o===" "||o==="	";)o=n[++i+1];o!==`
`&&!(o==="\r"&&n[i+2]===`
`)&&(t+=i>s?n.slice(s,i+1):r)}else t+=r}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function bp(n,e){let t="",i=n[e+1];for(;(i===" "||i==="	"||i===`
`||i==="\r")&&!(i==="\r"&&n[e+2]!==`
`);)i===`
`&&(t+=`
`),e+=1,i=n[e+1];return t||(t=" "),{fold:t,offset:e}}var Ep={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function Tp(n,e,t,i){let r=n.substr(e,t),o=r.length===t&&/^[0-9a-fA-F]+$/.test(r)?parseInt(r,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return i(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Na.resolveFlowScalar=mp});var va=S(wa=>{"use strict";var Le=C(),Sa=F(),_p=rr(),Np=or();function Sp(n,e,t,i){let{value:r,type:s,comment:o,range:a}=e.type==="block-scalar"?_p.resolveBlockScalar(n,e,i):Np.resolveFlowScalar(e,n.options.strict,i),c=t?n.directives.tagName(t.source,d=>i(t,"TAG_RESOLVE_FAILED",d)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Le.SCALAR]:c?l=wp(n.schema,r,c,t,i):e.type==="scalar"?l=vp(n,r,e,i):l=n.schema[Le.SCALAR];let p;try{let d=l.resolve(r,u=>i(t??e,"TAG_RESOLVE_FAILED",u),n.options);p=Le.isScalar(d)?d:new Sa.Scalar(d)}catch(d){let u=d instanceof Error?d.message:String(d);i(t??e,"TAG_RESOLVE_FAILED",u),p=new Sa.Scalar(r)}return p.range=a,p.source=r,s&&(p.type=s),c&&(p.tag=c),l.format&&(p.format=l.format),o&&(p.comment=o),p}function wp(n,e,t,i,r){if(t==="!")return n[Le.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(r(i,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Le.SCALAR])}function vp({atKey:n,directives:e,schema:t},i,r,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(i))||t[Le.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(i))??t[Le.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),p=`Value may be parsed as either ${c} or ${l}`;s(r,"TAG_RESOLVE_FAILED",p,!0)}}return o}wa.composeScalar=Sp});var Aa=S(ka=>{"use strict";function kp(n,e,t){if(e){t??(t=e.length);for(let i=t-1;i>=0;--i){let r=e[i];switch(r.type){case"space":case"comment":case"newline":n-=r.source.length;continue}for(r=e[++i];r?.type==="space";)n+=r.source.length,r=e[++i];break}}return n}ka.emptyScalarPosition=kp});var Ia=S(cr=>{"use strict";var Ap=tt(),Lp=C(),Op=Ea(),La=va(),Ip=Ve(),Rp=Aa(),xp={composeNode:Oa,composeEmptyNode:ar};function Oa(n,e,t,i){let r=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,p=!0;switch(e.type){case"alias":l=Cp(n,e,i),(a||c)&&i(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=La.composeScalar(n,e,c,i),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=Op.composeCollection(xp,n,e,t,i),a&&(l.anchor=a.source.substring(1))}catch(d){let u=d instanceof Error?d.message:String(d);i(e,"RESOURCE_EXHAUSTION",u)}break;default:{let d=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;i(e,"UNEXPECTED_TOKEN",d),p=!1}}return l??(l=ar(n,e.offset,void 0,null,t,i)),a&&l.anchor===""&&i(a,"BAD_ALIAS","Anchor cannot be an empty string"),r&&n.options.stringKeys&&(!Lp.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&i(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&p&&(l.srcToken=e),l}function ar(n,e,t,i,{spaceBefore:r,comment:s,anchor:o,tag:a,end:c},l){let p={type:"scalar",offset:Rp.emptyScalarPosition(e,t,i),indent:-1,source:""},d=La.composeScalar(n,p,a,l);return o&&(d.anchor=o.source.substring(1),d.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),r&&(d.spaceBefore=!0),s&&(d.comment=s,d.range[2]=c),d}function Cp({options:n},{offset:e,source:t,end:i},r){let s=new Ap.Alias(t.substring(1));s.source===""&&r(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&r(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=Ip.resolveEnd(i,o,n.strict,r);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}cr.composeEmptyNode=ar;cr.composeNode=Oa});var Ca=S(xa=>{"use strict";var Dp=yt(),Ra=Ia(),Pp=Ve(),qp=_t();function $p(n,e,{offset:t,start:i,value:r,end:s},o){let a=Object.assign({_directives:e},n),c=new Dp.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},p=qp.resolveProps(i,{indicator:"doc-start",next:r??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});p.found&&(c.directives.docStart=!0,r&&(r.type==="block-map"||r.type==="block-seq")&&!p.hasNewline&&o(p.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=r?Ra.composeNode(l,r,p,o):Ra.composeEmptyNode(l,p.end,i,null,p,o);let d=c.contents.range[2],u=Pp.resolveEnd(s,d,!1,o);return u.comment&&(c.comment=u.comment),c.range=[t,d,u.offset],c}xa.composeDoc=$p});var dr=S(qa=>{"use strict";var Mp=xt("process"),Up=Jn(),Fp=yt(),Nt=Tt(),Da=C(),Bp=Ca(),jp=Ve();function St(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function Pa(n){let e="",t=!1,i=!1;for(let r=0;r<n.length;++r){let s=n[r];switch(s[0]){case"#":e+=(e===""?"":i?`

`:`
`)+(s.substring(1)||" "),t=!0,i=!1;break;case"%":n[r+1]?.[0]!=="#"&&(r+=1),t=!1;break;default:t||(i=!0),t=!1}}return{comment:e,afterEmptyLine:i}}var lr=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,i,r,s)=>{let o=St(t);s?this.warnings.push(new Nt.YAMLWarning(o,i,r)):this.errors.push(new Nt.YAMLParseError(o,i,r))},this.directives=new Up.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:i,afterEmptyLine:r}=Pa(this.prelude);if(i){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${i}`:i;else if(r||e.directives.docStart||!s)e.commentBefore=i;else if(Da.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];Da.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${i}
${a}`:i}else{let o=s.commentBefore;s.commentBefore=o?`${i}
${o}`:i}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:Pa(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,i=-1){for(let r of e)yield*this.next(r);yield*this.end(t,i)}*next(e){switch(Mp.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,i,r)=>{let s=St(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",i,r)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=Bp.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,i=new Nt.YAMLParseError(St(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(i):this.doc.errors.push(i);break}case"doc-end":{if(!this.doc){let i="Unexpected doc-end without preceding document";this.errors.push(new Nt.YAMLParseError(St(e),"UNEXPECTED_TOKEN",i));break}this.doc.directives.docEnd=!0;let t=jp.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let i=this.doc.comment;this.doc.comment=i?`${i}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new Nt.YAMLParseError(St(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let i=Object.assign({_directives:this.directives},this.options),r=new Fp.Document(void 0,i);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),r.range=[0,t,t],this.decorate(r,!1),yield r}}};qa.Composer=lr});var Ua=S(kn=>{"use strict";var Kp=rr(),Xp=or(),zp=Tt(),$a=ot();function Yp(n,e=!0,t){if(n){let i=(r,s,o)=>{let a=typeof r=="number"?r:Array.isArray(r)?r[0]:r.offset;if(t)t(a,s,o);else throw new zp.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return Xp.resolveFlowScalar(n,e,i);case"block-scalar":return Kp.resolveBlockScalar({options:{strict:e}},n,i)}}return null}function Vp(n,e){let{implicitKey:t=!1,indent:i,inFlow:r=!1,offset:s=-1,type:o="PLAIN"}=e,a=$a.stringifyString({type:o,value:n},{implicitKey:t,indent:i>0?" ".repeat(i):"",inFlow:r,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:i,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),p=a.substring(0,l),d=a.substring(l+1)+`
`,u=[{type:"block-scalar-header",offset:s,indent:i,source:p}];return Ma(u,c)||u.push({type:"newline",offset:-1,indent:i,source:`
`}),{type:"block-scalar",offset:s,indent:i,props:u,source:d}}case'"':return{type:"double-quoted-scalar",offset:s,indent:i,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:i,source:a,end:c};default:return{type:"scalar",offset:s,indent:i,source:a,end:c}}}function Gp(n,e,t={}){let{afterKey:i=!1,implicitKey:r=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(i&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=$a.stringifyString({type:o,value:e},{implicitKey:r||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Jp(n,c);break;case'"':ur(n,c,"double-quoted-scalar");break;case"'":ur(n,c,"single-quoted-scalar");break;default:ur(n,c,"scalar")}}function Jp(n,e){let t=e.indexOf(`
`),i=e.substring(0,t),r=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=i,n.source=r}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:i}];Ma(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:r})}}function Ma(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function ur(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let i=n.props.slice(1),r=e.length;n.props[0].type==="block-scalar-header"&&(r-=n.props[0].source.length);for(let s of i)s.offset+=r;delete n.props,Object.assign(n,{type:t,source:e,end:i});break}case"block-map":case"block-seq":{let r={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[r]});break}default:{let i="indent"in n?n.indent:-1,r="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:i,source:e,end:r})}}}kn.createScalarToken=Vp;kn.resolveAsScalar=Yp;kn.setScalarValue=Gp});var Ba=S(Fa=>{"use strict";var Hp=n=>"type"in n?Ln(n):An(n);function Ln(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Ln(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=An(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=An(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=An(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function An({start:n,key:e,sep:t,value:i}){let r="";for(let s of n)r+=s.source;if(e&&(r+=Ln(e)),t)for(let s of t)r+=s.source;return i&&(r+=Ln(i)),r}Fa.stringify=Hp});var za=S(Xa=>{"use strict";var fr=Symbol("break visit"),Wp=Symbol("skip children"),ja=Symbol("remove item");function Oe(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),Ka(Object.freeze([]),n,e)}Oe.BREAK=fr;Oe.SKIP=Wp;Oe.REMOVE=ja;Oe.itemAtPath=(n,e)=>{let t=n;for(let[i,r]of e){let s=t?.[i];if(s&&"items"in s)t=s.items[r];else return}return t};Oe.parentCollection=(n,e)=>{let t=Oe.itemAtPath(n,e.slice(0,-1)),i=e[e.length-1][0],r=t?.[i];if(r&&"items"in r)return r;throw new Error("Parent collection not found")};function Ka(n,e,t){let i=t(e,n);if(typeof i=="symbol")return i;for(let r of["key","value"]){let s=e[r];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=Ka(Object.freeze(n.concat([[r,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===fr)return fr;a===ja&&(s.items.splice(o,1),o-=1)}}typeof i=="function"&&r==="key"&&(i=i(e,n))}}return typeof i=="function"?i(e,n):i}Xa.visit=Oe});var On=S(H=>{"use strict";var pr=Ua(),Zp=Ba(),Qp=za(),mr="\uFEFF",hr="",gr="",yr="",em=n=>!!n&&"items"in n,tm=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function nm(n){switch(n){case mr:return"<BOM>";case hr:return"<DOC>";case gr:return"<FLOW_END>";case yr:return"<SCALAR>";default:return JSON.stringify(n)}}function im(n){switch(n){case mr:return"byte-order-mark";case hr:return"doc-mode";case gr:return"flow-error-end";case yr:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}H.createScalarToken=pr.createScalarToken;H.resolveAsScalar=pr.resolveAsScalar;H.setScalarValue=pr.setScalarValue;H.stringify=Zp.stringify;H.visit=Qp.visit;H.BOM=mr;H.DOCUMENT=hr;H.FLOW_END=gr;H.SCALAR=yr;H.isCollection=em;H.isScalar=tm;H.prettyToken=nm;H.tokenType=im});var Tr=S(Va=>{"use strict";var wt=On();function ne(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var Ya=new Set("0123456789ABCDEFabcdef"),rm=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),In=new Set(",[]{}"),sm=new Set(` ,[]{}
\r	`),br=n=>!n||sm.has(n),Er=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let i=this.next??"stream";for(;i&&(t||this.hasChars(1));)i=yield*this.parseNext(i)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let i=0;for(;t===" ";)t=this.buffer[++i+e];if(t==="\r"){let r=this.buffer[i+e+1];if(r===`
`||!r&&!this.atEnd)return e+i+1}return t===`
`||i>=this.indentNext||!t&&!this.atEnd?e+i:-1}if(t==="-"||t==="."){let i=this.buffer.substr(e,3);if((i==="---"||i==="...")&&ne(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===wt.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,i=e.indexOf("#");for(;i!==-1;){let s=e[i-1];if(s===" "||s==="	"){t=i-1;break}else i=e.indexOf("#",i+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let r=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-r),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield wt.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ne(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ne(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ne(t)){let i=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=i,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(br),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,i=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=i=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let r=this.getLine();if(r===null)return this.setNext("flow");if((i!==-1&&i<this.indentNext&&r[0]!=="#"||i===0&&(r.startsWith("---")||r.startsWith("..."))&&ne(r[3]))&&!(i===this.indentNext-1&&this.flowLevel===1&&(r[0]==="]"||r[0]==="}")))return this.flowLevel=0,yield wt.FLOW_END,yield*this.parseLineStart();let s=0;for(;r[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),r[s]){case void 0:return"flow";case"#":return yield*this.pushCount(r.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(br),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ne(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let i=this.buffer.substring(0,t),r=i.indexOf(`
`,this.pos);if(r!==-1){for(;r!==-1;){let s=this.continueScalar(r+1);if(s===-1)break;r=i.indexOf(`
`,s)}r!==-1&&(t=r-(i[r-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ne(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,i;e:for(let s=this.pos;i=this.buffer[s];++s)switch(i){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!i&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let r=e+1;for(i=this.buffer[r];i===" ";)i=this.buffer[++r];if(i==="	"){for(;i==="	"||i===" "||i==="\r"||i===`
`;)i=this.buffer[++r];e=r-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield wt.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,i=this.pos-1,r;for(;r=this.buffer[++i];)if(r===":"){let s=this.buffer[i+1];if(ne(s)||e&&In.has(s))break;t=i}else if(ne(r)){let s=this.buffer[i+1];if(r==="\r"&&(s===`
`?(i+=1,r=`
`,s=this.buffer[i+1]):t=i),s==="#"||e&&In.has(s))break;if(r===`
`){let o=this.continueScalar(i+1);if(o===-1)break;i=Math.max(i,o-2)}}else{if(e&&In.has(r))break;t=i}return!r&&!this.atEnd?this.setNext("plain-scalar"):(yield wt.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let i=this.buffer.slice(this.pos,e);return i?(yield i,this.pos+=i.length,i.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(br),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,i=this.charAt(1);if(ne(i)||t&&In.has(i)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ne(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(rm.has(t))t=this.buffer[++e];else if(t==="%"&&Ya.has(this.buffer[e+1])&&Ya.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,i;do i=this.buffer[++t];while(i===" "||e&&i==="	");let r=t-this.pos;return r>0&&(yield this.buffer.substr(this.pos,r),this.pos=t),r}*pushUntil(e){let t=this.pos,i=this.buffer[t];for(;!e(i);)i=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};Va.Lexer=Er});var Nr=S(Ga=>{"use strict";var _r=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,i=this.lineStarts.length;for(;t<i;){let s=t+i>>1;this.lineStarts[s]<e?t=s+1:i=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let r=this.lineStarts[t-1];return{line:t,col:e-r+1}}}};Ga.LineCounter=_r});var wr=S(Qa=>{"use strict";var om=xt("process"),Ja=On(),am=Tr();function Te(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function Ha(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function Za(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function Rn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function Ge(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function xn(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function Wa(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Te(e.start,"explicit-key-ind")&&!Te(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,Za(e.value)?e.value.end?xn(e.value.end,e.sep):e.value.end=e.sep:xn(e.start,e.sep),delete e.sep)}var Sr=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new am.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let i of this.lexer.lex(e,t))yield*this.next(i);t||(yield*this.end())}*next(e){if(this.source=e,om.env.LOG_TOKENS&&console.log("|",Ja.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=Ja.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let i=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:i,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let i=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in i?i.indent:0:t.type==="flow-collection"&&i.type==="document"&&(t.indent=0),t.type==="flow-collection"&&Wa(t),i.type){case"document":i.value=t;break;case"block-scalar":i.props.push(t);break;case"block-map":{let r=i.items[i.items.length-1];if(r.value){i.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(r.sep)r.value=t;else{Object.assign(r,{key:t,sep:[]}),this.onKeyLine=!r.explicitKey;return}break}case"block-seq":{let r=i.items[i.items.length-1];r.value?i.items.push({start:[],value:t}):r.value=t;break}case"flow-collection":{let r=i.items[i.items.length-1];!r||r.value?i.items.push({start:[],key:t,sep:[]}):r.sep?r.value=t:Object.assign(r,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((i.type==="document"||i.type==="block-map"||i.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let r=t.items[t.items.length-1];r&&!r.sep&&!r.value&&r.start.length>0&&Ha(r.start)===-1&&(t.indent===0||r.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(i.type==="document"?i.end=r.start:i.items.push({start:r.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{Ha(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=Rn(this.peek(2)),i=Ge(t),r;e.end?(r=e.end,r.push(this.sourceToken),delete e.end):r=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:i,key:e,sep:r}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){xn(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let i=!this.onKeyLine&&this.indent===e.indent,r=i&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(r&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":r||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):r||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Te(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(Za(t.key)&&!Te(t.sep,"newline")){let o=Ge(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Te(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=Ge(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||r?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Te(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);r||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Te(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else i&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let i="end"in t.value?t.value.end:void 0;(Array.isArray(i)?i[i.length-1]:void 0)?.type==="comment"?i?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let r=e.items[e.items.length-2]?.value?.end;if(Array.isArray(r)){xn(r,t.start),r.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Te(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let i=this.startBlockValue(e);if(i){this.stack.push(i);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let i;do yield*this.pop(),i=this.peek(1);while(i?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let r=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:r,sep:[]}):t.sep?this.stack.push(r):Object.assign(t,{key:r,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let i=this.startBlockValue(e);i?this.stack.push(i):(yield*this.pop(),yield*this.step())}else{let i=this.peek(2);if(i.type==="block-map"&&(this.type==="map-value-ind"&&i.indent===e.indent||this.type==="newline"&&!i.items[i.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&i.type!=="flow-collection"){let r=Rn(i),s=Ge(r);Wa(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=Rn(e),i=Ge(t);return i.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=Rn(e),i=Ge(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:i,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(i=>i.type==="newline"||i.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};Qa.Parser=Sr});var rc=S(kt=>{"use strict";var ec=dr(),cm=yt(),vt=Tt(),lm=ci(),dm=C(),um=Nr(),tc=wr();function nc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new um.LineCounter||null,prettyErrors:e}}function fm(n,e={}){let{lineCounter:t,prettyErrors:i}=nc(e),r=new tc.Parser(t?.addNewLine),s=new ec.Composer(e),o=Array.from(s.compose(r.parse(n)));if(i&&t)for(let a of o)a.errors.forEach(vt.prettifyError(n,t)),a.warnings.forEach(vt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function ic(n,e={}){let{lineCounter:t,prettyErrors:i}=nc(e),r=new tc.Parser(t?.addNewLine),s=new ec.Composer(e),o=null;for(let a of s.compose(r.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new vt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return i&&t&&(o.errors.forEach(vt.prettifyError(n,t)),o.warnings.forEach(vt.prettifyError(n,t))),o}function pm(n,e,t){let i;typeof e=="function"?i=e:t===void 0&&e&&typeof e=="object"&&(t=e);let r=ic(n,t);if(!r)return null;if(r.warnings.forEach(s=>lm.warn(r.options.logLevel,s)),r.errors.length>0){if(r.options.logLevel!=="silent")throw r.errors[0];r.errors=[]}return r.toJS(Object.assign({reviver:i},t))}function mm(n,e,t){let i=null;if(typeof e=="function"||Array.isArray(e)?i=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let r=Math.round(t);t=r<1?void 0:r>8?{indent:8}:{indent:r}}if(n===void 0){let{keepUndefined:r}=t??e??{};if(!r)return}return dm.isDocument(n)&&!i?n.toString(t):new cm.Document(n,i,t).toString(t)}kt.parse=pm;kt.parseAllDocuments=fm;kt.parseDocument=ic;kt.stringify=mm});var kr=S(P=>{"use strict";var hm=dr(),gm=yt(),ym=Xi(),vr=Tt(),bm=tt(),_e=C(),Em=ge(),Tm=F(),_m=be(),Nm=Ee(),Sm=On(),wm=Tr(),vm=Nr(),km=wr(),Cn=rc(),sc=We();P.Composer=hm.Composer;P.Document=gm.Document;P.Schema=ym.Schema;P.YAMLError=vr.YAMLError;P.YAMLParseError=vr.YAMLParseError;P.YAMLWarning=vr.YAMLWarning;P.Alias=bm.Alias;P.isAlias=_e.isAlias;P.isCollection=_e.isCollection;P.isDocument=_e.isDocument;P.isMap=_e.isMap;P.isNode=_e.isNode;P.isPair=_e.isPair;P.isScalar=_e.isScalar;P.isSeq=_e.isSeq;P.Pair=Em.Pair;P.Scalar=Tm.Scalar;P.YAMLMap=_m.YAMLMap;P.YAMLSeq=Nm.YAMLSeq;P.CST=Sm;P.Lexer=wm.Lexer;P.LineCounter=vm.LineCounter;P.Parser=km.Parser;P.parse=Cn.parse;P.parseAllDocuments=Cn.parseAllDocuments;P.parseDocument=Cn.parseDocument;P.stringify=Cn.stringify;P.visit=sc.visit;P.visitAsync=sc.visitAsync});import{closeSync as Dh,existsSync as Bn,fsyncSync as Ph,mkdirSync as qh,openSync as $h,readFileSync as Mh,readdirSync as Uh,renameSync as qc,rmSync as Mr,statSync as Uc,writeFileSync as Fh}from"node:fs";import{randomUUID as $c}from"node:crypto";import{dirname as It,join as G,resolve as re}from"node:path";import{DatabaseSync as Bh}from"node:sqlite";import{createHash as gl}from"node:crypto";var Ct=7,Gr=2,Jr="0.7.0";function Q(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,i])=>i!==void 0).sort(([i],[r])=>i.localeCompare(r)).map(([i,r])=>[i,e(r)])):t;return JSON.stringify(e(n))}function Ne(n){return gl("sha256").update(Q(n)).digest("hex")}function Hr(n){return Ne({projectRoot:n}).slice(0,24)}function Wr(n){let{zephyrRoot:e,projectRoot:t,...i}=n;return Ne(i)}var Zr=Ct,Qr=`
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
CREATE TABLE kconfig (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL UNIQUE,
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
  has_prompt INTEGER NOT NULL DEFAULT 0
);

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
  stable_id         TEXT NOT NULL UNIQUE,
  name              TEXT,
  type              TEXT,
  definitions       TEXT NOT NULL DEFAULT '[]'
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
  kind     TEXT NOT NULL
);
CREATE INDEX kconfig_edge_to_idx ON kconfig_edge(to_sym, kind);
CREATE INDEX kconfig_edge_from_idx ON kconfig_edge(from_sym, kind);

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
`,es=`
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
`;import{existsSync as ds,mkdtempSync as Ml,readFileSync as Ul,realpathSync as Fl,rmSync as Bl,writeFileSync as jl}from"node:fs";import{tmpdir as Kl}from"node:os";import{join as Se,resolve as Xn}from"node:path";import{spawnSync as Xl}from"node:child_process";var ts=`#!/usr/bin/env python3
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
`;function ns(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function is(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),i=[],r={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(r.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=r.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[r.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:i.push(a)}};for(let o of t){let a=o.trim();if(a===""){r.kind==="brief"?r={kind:"detail"}:r.kind==="detail"&&i.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",p=""]=c,d=l.toLowerCase(),u=p.trim();switch(d){case"brief":case"short":r={kind:"brief"},s(u);break;case"param":{let m=u.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let y={name:m[2],description:(m[3]??"").trim()};m[1]&&(y.direction=m[1].replace(/\s+/g,"")),e.params.push(y),r={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(u),r={kind:"return",index:e.returns.length-1};break;case"retval":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),r={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),r={kind:"detail"};break}case"addtogroup":e.addtogroup=u.split(/\s+/)[0],r={kind:"detail"};break;case"ingroup":e.ingroup=u.split(/\s+/)[0],r={kind:"detail"};break;case"since":e.since=u,r={kind:"detail"};break;case"deprecated":e.deprecated=!0,r={kind:"detail"},s(u);break;case"note":case"warning":case"details":case"remark":r={kind:"detail"},s(`${l.toUpperCase()}: ${u}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":r={kind:"detail"};break;default:r={kind:"detail"},s(u);break}}e.detail=i.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=De(e.brief)),e.detail=De(e.detail),e.returns=e.returns.map(De);for(let o of e.params)o.description=De(o.description);for(let o of e.retvals)o.description=De(o.description);return e}function De(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function bl(n){let e=[];for(let t of n.split(`
`)){let i=t.trim(),r=i.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(r){e.push({kind:"define",id:r[1],title:(r[2]??"").trim()});continue}let s=i.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of i.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Pe(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var El=["z_impl_"];function Tl(n){for(let e of El)if(n.startsWith(e))return n.slice(e.length);return n}var _l=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,Nl=new RegExp(String.raw`^(struct|union|enum)\s+${_l}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),Sl=/^[^(]*\(\s*\*/;function wl(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Pe(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let i=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(i)return{kind:"typedef",name:i[1],signature:Pe(e)};let r=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(r)return{kind:"typedef",name:r[1],signature:Pe(e)};let s=e.match(Nl);if(s)return{kind:s[1],name:s[2],signature:Pe(e.replace(/\{[\s\S]*$/,"").trim())};if(Sl.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:Tl(a),signature:Pe(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function vl(n,e){let t=0,i=!1,r=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(r){l==="*"&&a[c+1]==="/"&&(r=!1,c++);continue}if(l==="/"&&a[c+1]==="*")r=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,i=!0):l==="}"&&t--}}if(i&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),p=c.lastIndexOf("}");return l<0||p<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,p),line:e,endLine:o}}}return null}function kl(n,e){let t=n.split(`
`).map(f=>/^\s*#/.test(f)?"":f).join(`
`),i=[],r="",s=[],o=[],a=[],c=0,l=e,p=e,d=()=>{i.push({code:r,before:s,trailingPrevious:o,trailingOwn:a,line:p}),r="",s=[],o=[],a=[]};for(let f=0;f<t.length;f++){let h=t[f];if(h===`
`){l++,r+=" ";continue}if(h==="/"&&t[f+1]==="*"){let E=t.indexOf("*/",f+2),b=E<0?t.length:E+2,N=t.slice(f,b);/^\/\*[*!]</.test(N)?(r.trim()?a:o).push(N):/^\/\*[*!]/.test(N)&&s.push(N);for(let _ of N)_===`
`&&l++;f=b-1;continue}if(h==="/"&&t[f+1]==="/"){let E=t.indexOf(`
`,f);f=(E<0?t.length:E)-1;continue}if(h==="("||h==="[")c++;else if(h===")"||h==="]")c--;else if(h===","&&c<=0){d();continue}!r.trim()&&h.trim()&&(p=l),r+=h}d();let u=f=>ns(f.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],y=(f,h)=>{f&&h&&!f.brief&&(f.brief=De(u(h)))};for(let f of i){y(m[m.length-1],f.trailingPrevious[0]);let h=f.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!h)continue;let E=f.before[f.before.length-1],b=E?is(u(E)):void 0,N=b?.brief??b?.detail??"",_={name:h[1],value:Pe(h[2]??""),brief:N,detail:b?.brief?b.detail??"":"",line:f.line};m.push(_),y(_,f.trailingOwn[0])}return m}function Al(n,e){let t=e,i=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||i.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let r=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];r.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:r.join(`
`),line:t}}function rs(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=[],r=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,p=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){p=!0;break}if(!p)continue;let d=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),u={text:ns(d),endLine:l},m=is(u.text),y=bl(u.text);if(y.length>0){let N;for(let _ of y)switch(_.kind){case"define":{let w={id:_.id,title:_.title,header:e},k=m.ingroup??s[s.length-1];k&&(w.parent=k),r.push(w),N=_.id;break}case"add":N=_.id;break;case"open":s.push(N??s[s.length-1]??""),N=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let f=Al(t,l+1);if(!f){o=l;continue}let h=wl(f.text);if(!h){o=l;continue}let E=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],b={name:h.name,kind:h.kind,signature:h.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:f.line+1,deprecated:m.deprecated};if(m.brief&&(b.brief=m.brief),m.detail&&(b.detail=m.detail),E&&(b.group=E),m.since&&(b.since=m.since),i.push(b),o=l,h.kind==="enum"&&f.text.includes("{")){let N=vl(t,f.line);if(N){for(let _ of kl(N.body,N.line)){let w={name:_.name,kind:"enumvalue",signature:_.value?`${_.name} = ${_.value}`:_.name,params:[],returns:[],retvals:[],header:e,line:_.line+1,deprecated:!1,parentSymbol:h.name};_.brief&&(w.brief=_.brief),_.detail&&(w.detail=_.detail),E&&(w.group=E),i.push(w)}o=N.endLine}}}return{symbols:i,groups:r}}import{existsSync as Dt,readFileSync as Ll,realpathSync as Ol}from"node:fs";import{delimiter as Il,join as He,resolve as Rl}from"node:path";import{spawnSync as os}from"node:child_process";function ss(n,e){if(n.includes("/")||n.includes("\\"))return Dt(n)?Rl(n):void 0;for(let t of(e??"").split(Il).filter(Boolean)){let i=He(t,n);if(Dt(i))return i}}function xl(n){let e=ss("west",n.PATH);if(e)try{let i=(Ll(Ol(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return i?i[1]?.endsWith("/env")&&i[2]?ss(i[2].trim().split(/\s+/,1)[0],n.PATH):i[1]&&Dt(i[1])?i[1]:void 0:void 0}catch{return}}function as(n){return[n.PYTHON_EXECUTABLE,xl(n),"python3","python"].filter((e,t,i)=>!!e&&i.indexOf(e)===t)}function cs(n=process.env){for(let e of as(n))if(os(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function qe(n,e=process.env){let t=He(n,"scripts","kconfig"),i=He(n,"scripts","dts","python-devicetree","src");if([He(t,"kconfiglib.py"),He(i,"devicetree","edtlib.py")].filter(a=>!Dt(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=as(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(i)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(os(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}import{existsSync as Cl,readdirSync as Dl}from"node:fs";import{join as Pl,relative as ql,sep as ls}from"node:path";var $l=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function*ee(n,e={}){if(!Cl(n))return;let t=e.skipDirs??$l,i=e.skipPrefixes??[],r=[n];for(;r.length>0;){let s=r.pop(),o;try{o=Dl(s,{withFileTypes:!0})}catch(a){throw new Error(`Failed to read source directory ${s}: ${a instanceof Error?a.message:String(a)}`)}for(let a of o){let c=Pl(s,a.name),l=$e(ql(n,c));if(a.isDirectory()){if(t.has(a.name)||i.some(p=>l===p||l.startsWith(`${p}/`)))continue;r.push(c)}else if(a.isFile()){if(i.some(p=>l.startsWith(`${p}/`))||e.match&&!e.match(a.name))continue;yield l}else if(a.isSymbolicLink())throw new Error(`Refusing symbolic link in indexed source tree: ${c}`)}}}function $e(n){return ls==="/"?n:n.split(ls).join("/")}function us(n){let e=Xn(n),t=e;try{t=Fl(e)}catch{}return[...new Set([e,t])].flatMap(i=>[Xn(i,"..","doxygen","xml"),Xn(i,"doc","_build","doxygen","xml")]).find(i=>ds(Se(i,"index.xml")))}function zl(n,e){if(!ds(Se(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=Ml(Se(Kl(),"zephyr-ai-api-")),i=Se(t,"api-export.py");try{jl(i,ts,{mode:384});let r=Xl(cs(),[i,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let o=r.stderr?.trim()??"";try{let a=JSON.parse(r.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(p=>`- ${p.code}: ${p.message}${p.path?` (${p.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(r.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s}finally{Bl(t,{recursive:!0,force:!0})}}function fs(n,e){if(e)return zl(n,e);let t=Se(n,"include","zephyr"),i=[],r=[],s=[];for(let a of ee(t,{skipPrefixes:["internal","arch/arm/internal"],match:c=>c.endsWith(".h")})){let c;try{c=Ul(Se(t,a),"utf8")}catch(d){throw new Error(`Cannot read public API header ${Se(t,a)}: ${d instanceof Error?d.message:String(d)}`)}let l=`include/zephyr/${a}`,p=rs(c,l);for(let d of p.symbols){if(d.kind==="function"&&d.signature.includes("=")){s.push({path:`${l}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let u=d.signature.indexOf("["),m=d.signature.indexOf("(");if(d.kind==="function"&&u>=0&&(m<0||u<m)){s.push({path:`${l}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){s.push({path:`${l}:${d.line}`,reason:"fallback-include-guard"});continue}i.push(d)}r.push(...p.groups)}i.sort((a,c)=>a.name.localeCompare(c.name));let o=new Map;for(let a of r)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:i,groups:[...o.values()],mode:"header-fallback",report:{discovered:i.length+o.size+s.length+1,indexed:i.length+o.size,intentionallyExcluded:[...s,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as Vl,mkdtempSync as Gl,rmSync as Jl,writeFileSync as Hl}from"node:fs";import{tmpdir as Wl}from"node:os";import{dirname as ms,join as zn}from"node:path";import{spawnSync as Zl}from"node:child_process";var ps=`#!/usr/bin/env python3
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
`;var hs=new Map;function gs(n){let e=JSON.stringify(n),t=hs.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let i=ms(ms(n[0])),r=zn(i,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!Vl(r))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=Gl(zn(Wl(),"zephyr-ai-bindings-")),o=zn(s,"binding-export.py");try{Hl(o,ps,{mode:384});let a=[o,"--zephyr",i];for(let p of n)a.push("--root",p);let c=Zl(qe(i),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let p="";try{p=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let d=p||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${d}`)}let l=JSON.parse(c.stdout);return hs.set(e,l),l}finally{Jl(s,{recursive:!0,force:!0})}}var oc=Vr(kr(),1);import{existsSync as Am,readFileSync as Lm,readdirSync as Om}from"node:fs";import{dirname as Ar,join as ue}from"node:path";import{spawnSync as Im}from"node:child_process";function Lr(n){try{let e=(0,oc.parse)(Lm(n,"utf8"),{logLevel:"silent"});if(!e||typeof e!="object"||Array.isArray(e))throw new Error("expected a YAML mapping");return e}catch(e){throw new Error(`Failed to parse board/SoC metadata ${n}: ${e.message}`)}}function ie(n){return Array.isArray(n)?n:[]}function At(n){return ie(n).filter(e=>typeof e=="string")}function Rm(n){let e=ue(n,"scripts","list_boards.py");if(!Am(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let r of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(r&&(t=Im(r,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let i=new Map;for(let r of t.stdout.split(`
`).filter(Boolean)){let s=r.split("@@").filter(Boolean).map(p=>p.split(";")),o=p=>s.find(([d])=>d===p)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),i.set(a,c)}return i}function xm(n){let e=[],t;try{t=Om(n)}catch{return e}for(let i of t){if(!i.endsWith(".yaml")&&!i.endsWith(".yml")||i==="board.yml"||i==="board.yaml")continue;let r=Lr(ue(n,i)),s={toolchains:At(r.toolchain),supported:At(r.supported),...typeof r.name=="string"?{name:r.name}:{},...typeof r.arch=="string"?{arch:r.arch}:{},...typeof r.type=="string"?{type:r.type}:{},...typeof r.ram=="number"?{ram:r.ram}:{},...typeof r.flash=="number"?{flash:r.flash}:{},...typeof r.vendor=="string"?{vendor:r.vendor}:{}};typeof r.identifier=="string"&&e.push({identifier:r.identifier,...s});let o=r.variants&&typeof r.variants=="object"&&!Array.isArray(r.variants)?r.variants:{};for(let[a,c]of Object.entries(o)){let l=c&&typeof c=="object"&&!Array.isArray(c)?c:{};e.push({identifier:a,...s,toolchains:At(l.toolchain).length?At(l.toolchain):s.toolchains,supported:[...new Set([...s.supported,...At(l.supported)])]})}}return e.sort((i,r)=>i.identifier.localeCompare(r.identifier)),e}function ac(n){let e=[],t=Rm(n);for(let i of ee(ue(n,"boards"),{match:r=>r==="board.yml"||r==="board.yaml"})){let r=ue(n,"boards",i),s=Lr(r),o=[],a=s.board;a&&typeof a=="object"&&!Array.isArray(a)&&o.push(a);for(let y of ie(s.boards))y&&typeof y=="object"&&!Array.isArray(y)&&o.push(y);if(o.length===0)continue;let c=Ar(r),l=$e(ue("boards",Ar(i))),p=xm(c),d=[...ee(ue(c,"doc"),{match:y=>y.endsWith(".rst")})],u=d.includes("index.rst")?"index.rst":d.sort()[0],m=u?`${l}/doc/${u}`:void 0;for(let y of o){if(typeof y.name!="string")continue;let f=y.name,h=ie(y.socs).flatMap(O=>{if(!O||typeof O!="object")return[];let K=O;return typeof K.name!="string"?[]:[{name:K.name,variants:ie(K.variants).flatMap(L=>L&&typeof L=="object"&&typeof L.name=="string"?[L.name]:[]),cpuclusters:ie(K.cpuclusters).flatMap(L=>L&&typeof L=="object"&&typeof L.name=="string"?[L.name]:[])}]}),E=p.filter(O=>O.identifier===f||O.identifier.startsWith(`${f}/`)),b=t.get(f);if(!b)throw new Error(`Zephyr's board model did not enumerate ${f}.`);let N=b.qualifiers.length>0?b.qualifiers:[""],_=N.map(O=>O?`${f}/${O}`:f);for(let O of b.revisions)_.push(...N.map(K=>K?`${f}@${O}/${K}`:`${f}@${O}`));let w=_.map(O=>({identifier:O,toolchains:[],supported:[]})),k=E.length>0?E:o.length===1?p:[],A=new Map(w.map(O=>[O.identifier,O]));for(let O of k){let K=A.get(O.identifier);A.set(O.identifier,K?{...K,...O}:O)}let T=[...A.values()].sort((O,K)=>O.identifier.localeCompare(K.identifier)),v={name:f,dir:l,socs:h,targets:T,revisions:b.revisions,supported:[...new Set(T.flatMap(O=>O.supported))].sort()};typeof y.full_name=="string"&&(v.fullName=y.full_name),typeof y.vendor=="string"&&(v.vendor=y.vendor),b.defaultRevision&&(v.defaultRevision=b.defaultRevision),m&&(v.docPath=m);let $=T.find(O=>O.arch)?.arch;$&&(v.arch=$);let j=T.find(O=>O.ram!==void 0)?.ram;j!==void 0&&(v.ram=j);let q=T.find(O=>O.flash!==void 0)?.flash;q!==void 0&&(v.flash=q),e.push(v)}}return e.sort((i,r)=>i.name.localeCompare(r.name)),e}function cc(n){let e=[];for(let t of ee(ue(n,"soc"),{match:i=>i==="soc.yml"||i==="soc.yaml"})){let i=ue(n,"soc",t),r=Lr(i),s=$e(ue("soc",Ar(t))),o=t.includes("/")?t.split("/")[0]:void 0,a=(l,p,d)=>{if(typeof l.name!="string")return;let u={name:l.name,dir:s,cpuclusters:ie(l.cpuclusters).flatMap(m=>m&&typeof m=="object"&&typeof m.name=="string"?[m.name]:[])};p&&(u.family=p),d&&(u.series=d),o&&(u.vendor=o),e.push(u)};(l=>{for(let p of l){if(!p||typeof p!="object")continue;let d=p,u=typeof d.name=="string"?d.name:void 0;for(let m of ie(d.socs))m&&typeof m=="object"&&a(m,u);for(let m of ie(d.series)){if(!m||typeof m!="object")continue;let y=m,f=typeof y.name=="string"?y.name:void 0;for(let h of ie(y.socs))h&&typeof h=="object"&&a(h,u,f)}}})(ie(r.family));for(let l of ie(r.socs))l&&typeof l=="object"&&a(l)}return e.sort((t,i)=>t.name.localeCompare(i.name)),e}import{existsSync as Mm,lstatSync as Um,readFileSync as hc,realpathSync as Rr}from"node:fs";import{dirname as Fm,extname as Bm,join as uc,relative as xr,resolve as jm,sep as fc}from"node:path";var Cm="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function Dn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!Cm.includes(t))return null;for(let i of e)if(i!==t)return null;return{char:t,length:e.length}}function Dm(n){let e=[];for(let t=0;t<n.length;t++){let i=Dn(n[t]);if(!i)continue;let r=n[t-1];if(r===void 0)continue;let s=r.trim();if(s===""||i.length<s.length)continue;if(Dn(r)){if(Dn(n[t-2]??""))continue;continue}let o=Dn(n[t-2]??""),a=o!==null&&o.char===i.char;e.push({line:t-1,text:s,char:i.char,overlined:a})}return e}function Pm(n){let e=[];return n.map(t=>{let i=t.overlined?`over:${t.char}`:t.char,r=e.indexOf(i);return r===-1&&(r=e.length,e.push(i)),r})}var Ir=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function lc(n){let e=n.split(`
`),t=[],i=s=>t.push({code:!1,text:s}),r=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(Ir.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",p=""]=a,d=c.length,u=l.toLowerCase(),m=[],y=s+1;for(;y<e.length;y++){let f=e[y];if(f.trim()===""){m.push("");continue}if(f.match(/^\s*/)[0].length<=d)break;m.push(f)}if(r.has(u)){s=y-1;continue}if(u==="code-block"||u==="code"||u==="literalinclude"){let f=p.trim(),h=Or(m).join(`
`).replace(/^\n+|\n+$/g,"");h&&t.push({code:!0,text:`\`\`\`${f}
${h}
\`\`\``}),s=y-1;continue}if(u==="note"||u==="warning"||u==="important"||u==="tip"){let f=Or(m).join(`
`).trim();f&&i(`${l.toUpperCase()}: ${f}`),s=y-1;continue}p.trim()&&i(p.trim());for(let f of Or(m))i(f);s=y-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||i(o)}return t.map(s=>s.code?s.text:qm(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function Or(n){let e=n.filter(i=>i.trim()!=="").map(i=>i.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(i=>i.trim()===""?"":i.slice(t))}function qm(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function dc(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),i=[];for(let l of t){let p=l.match(Ir);p&&i.push(p[1].trim())}let r=Dm(t),s=Pm(r);if(r.length===0){let l=lc(e);return{title:"",labels:i,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=r[0].text,a=[],c=[];for(let l=0;l<r.length;l++){let p=r[l],d=s[l],u=r[l+1];for(;c.length>0&&c[c.length-1].level>=d;)c.pop();c.push({level:d,text:p.text});let m=p.line+2,y=u?u.line-(u.overlined?1:0):t.length,f=t.slice(m,Math.max(m,y)).join(`
`),h=lc(f),E=$m(t,p.line-(p.overlined?1:0));(h||l===0)&&a.push({...E?{anchor:E}:{},heading:p.text,headingPath:c.map(b=>b.text),ord:a.length,body:h})}return{title:o,labels:i,chunks:a}}function $m(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let i=n[t];if(i.trim()==="")continue;let r=i.match(Ir);return r?r[1].trim():void 0}}var Km=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function Xm(n,e){let t=n.replace(/\.rst$/,""),i=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${i}.html`}function pc(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function zm(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function Ym(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let i=0;i<e.length;i++){let r=e[i].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!r)continue;let s=r[1].length;for(i+=1;i<e.length;i++){let o=e[i];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){i-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),p=(l?.[2]??c).replace(/\.rst$/,""),d=l?.[1]?.trim()||p.split("/").filter(Boolean).at(-1)?.replace(/^index$/,p.split("/").at(-2)??"index").replace(/[_-]/g," ");p&&d&&t.push(`${d} (${p})`)}}return[...new Set(t)]}function Vm(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function Gm(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),i=1,r=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(i=s),Number.isInteger(o)&&o>=i&&(r=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(p=>p.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);i=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((p,d)=>d>=i-1&&p.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);r=l+(e["end-at"]?1:0)}return t=t.slice(i-1,r),{text:t.join(`
`),start:i,end:r}}function Cr(n,e,t,i,r=[]){let s=Rr(e);if(r.includes(s))throw new Error(`include cycle: ${[...r,s].map(l=>xr(n,l)).join(" -> ")}`);let o=[...r,s],a=t.replace(/\r\n?/g,`
`).split(`
`),c=[];for(let l=0;l<a.length;l++){let p=a[l],d=p.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){c.push(p);continue}let u=d[1].length,m=d[2],y=d[3].trim(),f=[],h=l+1;for(;h<a.length;h++){let A=a[h];if(A.trim()===""){f.push(A);continue}if(A.match(/^\s*/)[0].length<=u)break;f.push(A)}if(l=h-1,m==="only"){if(/\bhtml\b/.test(y)){let A=f.map(v=>v.trim()?v.slice(Math.min(v.length,u+3)):""),T=Cr(n,s,A.join(`
`),i,r);c.push(...T.split(`
`).map(v=>`${" ".repeat(u)}${v}`))}continue}let E=Vm(f),b=jm(Fm(s),y);if(!Mm(b))throw new Error(`include target not found: ${y}`);if(Um(b).isSymbolicLink())throw new Error(`include target is a symbolic link: ${y}`);let N=Rr(n),_=Rr(b),w=xr(N,_);if(w===".."||w.startsWith(`..${fc}`))throw new Error(`include escapes the Zephyr tree: ${y}`);let k=Gm(hc(_,"utf8"),E);if(i.push({path:xr(N,_).replaceAll(fc,"/"),startLine:k.start,endLine:k.end,directive:m}),m==="literalinclude"){let A=E.language??Bm(b).slice(1);c.push(`${" ".repeat(u)}.. code-block:: ${A}`,"",...k.text.split(`
`).map(T=>`${" ".repeat(u+3)}${T}`))}else{let A=Cr(N,_,k.text,i,o);c.push(...A.split(`
`).map(T=>`${" ".repeat(u)}${T}`))}}return c.join(`
`)}function mc(n,e,t,i){let r=[],s=uc(n,e);for(let o of ee(s,{skipDirs:Km,match:a=>a.endsWith(".rst")})){let a=`${e}/${o}`,c=uc(s,o);i.discovered++;try{let l=hc(c,"utf8"),p=[{path:a,startLine:1,endLine:l.split(/\r?\n/).length,directive:"page"}],d=Cr(n,c,l,p),u=dc(d),m=u.chunks.filter(y=>y.body.trim()!=="").map((y,f)=>({...y,ord:f}));if(m.length===0){let y=Ym(d);if(y.length>0){let f=u.title||pc(a);m=[{heading:f,headingPath:[f],ord:0,body:`Contained documentation pages:
${y.map(h=>`- ${h}`).join(`
`)}`}]}}if(m.length===0){i.intentionallyExcluded.push({path:a,reason:"no-retrievable-content"});continue}r.push({path:a,url:Xm(a,t),title:u.title||pc(a),area:zm(a),labels:u.labels,chunks:m,origins:p}),i.indexed++}catch(l){i.errors.push({path:a,code:"rst-preprocess",message:l.message})}}return r}function gc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},i=[...mc(n,"doc",e,t),...mc(n,"boards",e,t)];if(t.errors.length>0){let r=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${r}`)}return{pages:i,report:t}}import{existsSync as Hm,mkdtempSync as Wm,rmSync as Zm,writeFileSync as Qm}from"node:fs";import{tmpdir as eh}from"node:os";import{join as Pn}from"node:path";import{spawnSync as th}from"node:child_process";var yc=`#!/usr/bin/env python3
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
        str(Path(zephyr, "Kconfig")), warn_to_stderr=False, suppress_traceback=True
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
`;var bc=new Map;function Ec(n,e=[]){let t=JSON.stringify([n,[...e].sort()]),i=bc.get(t);if(i)return i;let r=Pn(n,"scripts","kconfig","kconfiglib.py");if(!Hm(r))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let s=Wm(Pn(eh(),"zephyr-ai-kconfig-")),o=Pn(s,"kconfig-export.py"),a=Pn(s,"generated");try{Qm(o,yc,{mode:384});let c=[o,"--zephyr",n,"--build-dir",a];for(let u of e)c.push("--module",u);let l=th(qe(n),c,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(l.status!==0){let u=l.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${u}`)}let p=JSON.parse(l.stdout),d={symbols:p.symbols,choices:p.choices,filesScanned:p.files.length,warnings:p.warnings};return bc.set(t,d),d}finally{Zm(s,{recursive:!0,force:!0})}}var Sc=Vr(kr(),1);import{existsSync as $n,readFileSync as Nc,statSync as nh}from"node:fs";import{dirname as Tc,join as Ie}from"node:path";var ih=64*1024,rh=160*1024;function wc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var _c={"sample.yaml":"sample","testcase.yaml":"test"};function sh(n,e){let t=[],i=[],r=rh;for(let s of e){if(!wc(s))continue;let o=Ie(n,s);try{if(nh(o).size>ih){i.push({path:s,reason:"file-size-limit"});continue}let a=Nc(o,"utf8");if(Buffer.byteLength(a)>r){i.push({path:s,reason:"sample-size-budget"});continue}r-=Buffer.byteLength(a),t.push({path:s,text:a})}catch(a){throw new Error(`Failed to capture sample file ${o}: ${a.message}`)}}return{contents:t,exclusions:i}}function oh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function qn(n){return oh(n).filter(e=>typeof e=="string")}function ah(n){let e=[],t=i=>{$n(Ie(n,i))&&e.push(i)};for(let i of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])t(i);for(let i of["src","boards","snippets"]){let r=Ie(n,i);if($n(r))try{e.push(...[...ee(r,{match:s=>wc(`${i}/${s}`)})].map(s=>`${i}/${s}`))}catch{}}return e}function vc(n){let e=[],t=new Set;for(let i of["samples","snippets","tests"]){let r=Ie(n,i);if($n(r))for(let s of[...ee(r,{match:o=>Object.hasOwn(_c,o)})].sort()){let o=Ie(r,s),a=s.split("/").pop(),c=_c[a],l=null;try{let v=(0,Sc.parse)(Nc(o,"utf8"),{logLevel:"silent"});if(!v||typeof v!="object"||Array.isArray(v))throw new Error("expected a YAML mapping");l=v}catch(v){throw new Error(`Failed to parse ${a} metadata ${s}: ${v.message}`)}let p=Tc(o),d=$e(Ie(i,Tc(s)));if(t.has(d))continue;t.add(d);let u=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},y=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},f=new Set,h=new Set,E=new Set,b=new Set,N=v=>{for(let $ of qn(v.tags))f.add($);if(typeof v.tags=="string")for(let $ of v.tags.split(/\s+/).filter(Boolean))f.add($);for(let $ of qn(v.depends_on))h.add($);for(let $ of qn(v.integration_platforms))E.add($);for(let $ of qn(v.platform_allow))b.add($)};N(y);for(let v of Object.values(m))!v||typeof v!="object"||N({...y,...v});let _=ah(p),{contents:w,exclusions:k}=sh(p,_),A=w.map(v=>v.path),T={path:d,kind:c,name:typeof u.name=="string"?u.name:d.split("/").pop(),tags:[...f].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...h].sort(),integrationPlatforms:[...E].sort(),platformAllow:[...b].sort(),files:A,contents:w,exclusions:k};typeof u.description=="string"&&(T.description=u.description),$n(Ie(p,"README.rst"))&&(T.docPath=`${d}/README.rst`),e.push(T)}}return e.sort((i,r)=>i.path.localeCompare(r.path)),e}import{createHash as Pr}from"node:crypto";import{existsSync as Un,readFileSync as Mn,realpathSync as Lt,statSync as gh}from"node:fs";import{basename as Ac,dirname as yh,join as Re,relative as bh,resolve as Eh}from"node:path";import{spawnSync as Oc}from"node:child_process";import{createHash as ch}from"node:crypto";import{existsSync as lh,lstatSync as dh,readFileSync as uh,readlinkSync as fh,realpathSync as ph}from"node:fs";import{join as mh}from"node:path";import{spawnSync as hh}from"node:child_process";function Dr(n,e){let t=hh("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function kc(n){let e=ph(n),t=Dr(e,["rev-parse","HEAD"]);if(!t)return null;let i=Dr(e,["diff","--binary","HEAD"])??"",r=(Dr(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=mh(e,s);if(!lh(o))return{path:s,missing:!0};try{let a=dh(o);return a.isSymbolicLink()?{path:s,symlink:fh(o)}:a.isFile()?{path:s,sha256:ch("sha256").update(uh(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(i||r.length),stateFingerprint:Ne({commit:t,diff:i,untracked:r})}}function Th(n,e){let t=Oc("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function _h(n){let e=Mn(Re(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",i=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),r=t("EXTRAVERSION");return r?`${i}-${r}`:i}function Nh(n){let e=Eh(n);for(;;){if(Un(Re(e,".west","config")))return e;let t=yh(e);if(t===e)return;e=t}}function Sh(n){if(!n)return;let e=Oc("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return Pr("sha256").update(e.stdout).digest("hex");let t="",i="west.yml";try{let o=Mn(Re(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",i=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??i}catch{}let s=[...t?[Re(n,t,i)]:[],Re(n,"west.yml"),Re(n,"west.yaml")].find(Un);return s?Pr("sha256").update(Mn(s)).digest("hex"):void 0}function Lc(n){let e=Lt(n),t=kc(e);if(t)return{name:Ac(e),...t};let i=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(r=>Re(e,r)).filter(Un).map(r=>{let s=gh(r);return{path:bh(e,r),bytes:s.size,sha256:Pr("sha256").update(Mn(r)).digest("hex")}});return{name:Ac(e),markers:i}}function Ic(n){let e=Lt(n.zephyrRoot),t=n.projectRoot&&Un(n.projectRoot)?Lt(n.projectRoot):void 0,i=Th(e,["rev-parse","HEAD"]);if(!i)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let r=Nh(t??e),s=Sh(r),o=n.modules.map(u=>Lc(u)),a=Ne(o),c=Lc(e),l=String(c.stateFingerprint??Ne(c)),p=n.pinnedCommit===i&&c.dirty===!1?"pinned-upstream":r?"west-workspace":"explicit-tree",d={descriptorVersion:Gr,schemaVersion:Ct,builderVersion:Jr,sourceKind:p,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:_h(e),zephyrCommit:i,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:Lt(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:Lt(n.buildDirectory)}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...d,createdAt:new Date().toISOString(),contextFingerprint:Wr(d)}}import{spawnSync as vh}from"node:child_process";import{existsSync as qr,mkdirSync as kh,mkdtempSync as Ah,renameSync as Lh,rmSync as Oh,writeFileSync as Ih}from"node:fs";import{dirname as Rc,join as Ot,resolve as Rh}from"node:path";var V={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var xc=V,Cc=".zephyr-ai-managed.json";function Fn(n,e){return vh("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function xh(n){if(!qr(Ot(n,".git"))||!qr(Ot(n,"VERSION")))return!1;let e=Fn(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==V.commit)return!1;let t=Fn(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(i=>i.endsWith(` ${Cc}`))}function Dc(n,e){let t=Rh(n,"sources",`zephyr-${V.version}-${V.commit.slice(0,12)}`);if(xh(t))return e(`Using pinned Zephyr ${V.version} checkout at ${t}`),t;if(qr(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${V.version}.`);kh(Rc(t),{recursive:!0});let i=Ah(Ot(Rc(t),".zephyr-ai-fetch-")),r=Ot(i,"zephyr");try{e(`Cloning pinned Zephyr ${V.version}; this requires network access and may take several minutes.`);let s=Fn(["clone","--depth","1","--branch",V.tag,"--single-branch",V.repository,r]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=Fn(["rev-parse","HEAD"],r);if(o.status!==0||o.stdout.trim()!==V.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${V.commit}.`);return Ih(Ot(r,Cc),`${JSON.stringify({owner:"zephyr-ai",repository:V.repository,tag:V.tag,commit:V.commit},null,2)}
`,{flag:"wx"}),Lh(r,t),e(`Pinned Zephyr ${V.version} is ready at ${t}`),t}finally{Oh(i,{recursive:!0,force:!0})}}var Pc={name:"@zephyr-ai/ingest",version:"0.3.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function jh(n){let e=re(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??G(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let i=0;i<n.length;i++){let r=n[i];switch(r){case"--zephyr":t.zephyr=re(n[++i]);break;case"--out":t.out=re(n[++i]);break;case"--project-root":t.projectRoot=re(n[++i]);break;case"--plugin-data":t.pluginData=re(n[++i]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++i];break;case"--application":t.applicationRoot=re(n[++i]);break;case"--build-dir":t.buildDirectory=re(n[++i]);break;case"--api-xml":t.apiXml=re(n[++i]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(re(n[++i]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${r}`)}}return t.zephyr=re(t.zephyr),t}function Kh(){for(let n of[G(process.cwd(),"zephyr.lock.json"),G(process.cwd(),"..","..","zephyr.lock.json")])try{return JSON.parse(Mh(n,"utf8"))}catch{}return{}}function $r(n){return n==null?null:JSON.stringify(n)}function Ur(n){let e=$h(n,"r");try{Ph(e)}finally{Dh(e)}}function Mc(n){try{Ur(n)}catch{}}function Xh(n,e){let t=Uh(n,{withFileTypes:!0}).filter(r=>r.isDirectory()&&/^[a-f0-9]{64}$/.test(r.name)).flatMap(r=>{let s=G(n,r.name),o=G(s,"zephyr.db");if(!Bn(o))return[];let a=G(s,"last-used");return[{fingerprint:r.name,directory:s,usedAt:Uc(Bn(a)?a:o).mtimeMs}]}).sort((r,s)=>s.usedAt-r.usedAt),i=new Set([e,...t.filter(r=>r.fingerprint!==e).slice(0,4).map(r=>r.fingerprint)]);for(let r of t)i.has(r.fingerprint)||Mr(r.directory,{recursive:!0,force:!0})}function zh(){let n=jh(process.argv.slice(2)),e=M=>{n.quiet||process.stderr.write(`${M}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=Dc(n.pluginData,e)}if(!Bn(G(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(qe(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let M=us(n.zephyr);M&&(n.apiXml=M,e(`Using auto-detected Doxygen XML from ${M}`))}let t=n.fetchPinned?xc:Kh();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let i=Ic({zephyrRoot:n.zephyr,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml}),r=i.zephyrVersion;if(n.requirePinned&&(!t.commit||i.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${i.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let s=`https://docs.zephyrproject.org/${r}/`,o,a=n.out;if(!a&&n.pluginData)if(i.projectRoot){let M=G(n.pluginData,"indexes","projects",Hr(i.projectRoot));a=G(M,i.contextFingerprint,"zephyr.db"),o=G(M,"active.json")}else a=G(n.pluginData,"indexes","defaults",i.zephyrCommit,String(i.schemaVersion),"zephyr.db");a??=G(re(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${r} from ${n.zephyr}`);let c=Date.now(),l=Date.now(),{pages:p,report:d}=gc(n.zephyr,s),u=p.reduce((M,ce)=>M+ce.chunks.length,0);e(`  docs      ${p.length} pages, ${u} sections (${Date.now()-l} ms)`);let m=Date.now(),y=Ec(n.zephyr,n.modules);e(`  kconfig   ${y.symbols.length} symbols from ${y.filesScanned} files (${Date.now()-m} ms)`);let f=Date.now(),h=[G(n.zephyr,"dts","bindings"),...n.modules.map(M=>G(M,"dts","bindings")).filter(Bn)],{bindings:E,fragments:b,report:N}=gs(h),_=M=>M.properties.length+M.children.reduce((ce,jn)=>ce+_(jn),0),w=E.reduce((M,ce)=>M+_(ce),0);e(`  bindings  ${E.length} compatibles, ${w} properties, ${b} fragments (${Date.now()-f} ms)`);let k=Date.now(),A=ac(n.zephyr),T=cc(n.zephyr),v=A.reduce((M,ce)=>M+ce.targets.length,0);e(`  boards    ${A.length} boards, ${v} targets, ${T.length} SoCs (${Date.now()-k} ms)`);let $=Date.now(),j=vc(n.zephyr);e(`  samples   ${j.length} (${Date.now()-$} ms)`);let q=Date.now(),O=fs(n.zephyr,n.apiXml);e(`  api       ${O.symbols.length} symbols, ${O.groups.length} groups, ${O.mode} (${Date.now()-q} ms)`),qh(It(a),{recursive:!0});let K=G(It(a),`.${$c()}.zephyr.db.tmp`),L,Fr=!1;try{L=new Bh(K),L.exec(Qr);let M=Date.now();L.exec("BEGIN");let ce=L.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),jn=L.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),Fc=L.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let g of p){let x=ce.run(g.path,g.url,g.title,g.area,JSON.stringify(g.labels)),I=Number(x.lastInsertRowid);for(let R of g.origins)Fc.run(I,R.path,R.startLine,R.endLine,R.directive);for(let R of g.chunks)jn.run(I,R.anchor??null,R.heading,R.headingPath.join(" > "),R.ord,g.title,R.body)}let Bc=L.prepare(`INSERT INTO kconfig
       (name, type, prompt, help, defaults, depends, selects, implies, ranges,
        defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Kn=L.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind) VALUES (?, ?, ?)"),Rt=new Map;for(let g of y.symbols){let x=g.definitions.flatMap(D=>D.defaults.map(U=>({value:U.value.display,...U.condition.display!=="y"?{cond:U.condition.display}:{}}))),I=g.definitions.map(D=>D.condition.display).filter((D,U,ll)=>D!=="y"&&ll.indexOf(D)===U),R=g.definitions.flatMap(D=>D.selects.map(U=>({value:U.target,...U.condition.display!=="y"?{cond:U.condition.display}:{}}))),X=g.definitions.flatMap(D=>D.implies.map(U=>({value:U.target,...U.condition.display!=="y"?{cond:U.condition.display}:{}}))),Je=g.definitions.flatMap(D=>D.ranges.map(U=>({low:U.low.display,high:U.high.display,...U.condition.display!=="y"?{cond:U.condition.display}:{}}))),W=g.definitions.find(D=>D.prompt)?.prompt??"",xe=g.definitions.find(D=>D.menuPath.length>0)?.menuPath.join(" > ")??"",z=Bc.run(g.name,g.type??null,W,g.help??"",JSON.stringify(x),JSON.stringify(I),JSON.stringify(R),JSON.stringify(X),JSON.stringify(Je),JSON.stringify(g.definitions.map(D=>({file:D.file,line:D.line}))),xe,g.choice?1:0,g.choice??null,g.definitions.length,g.hasPrompt?1:0);Rt.set(g.name,Number(z.lastInsertRowid));for(let D of R)Kn.run(g.name,D.value,"select");for(let D of X)Kn.run(g.name,D.value,"imply");let Ce=D=>[...D.kind==="symbol"&&D.value?[D.value]:[],...(D.children??[]).flatMap(Ce)];for(let D of g.definitions)for(let U of Ce(D.condition))Kn.run(g.name,U,"depends")}let jc=L.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),Br=new Map,se=g=>{if(!g)return null;let x=Q(g),I=Br.get(x);if(I!==void 0)return I;let R=g.children??[],X=Number(jc.run(g.kind,g.value??null,g.display,se(R[0]??null),se(R[1]??null)).lastInsertRowid);return Br.set(x,X),X},Kc=L.prepare(`INSERT INTO kconfig_definition
       (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
        is_menuconfig, is_configdefault)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),Xc=L.prepare(`INSERT INTO kconfig_default
       (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),zc=L.prepare(`INSERT INTO kconfig_relation
       (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?, ?)`),Yc=L.prepare(`INSERT INTO kconfig_range
       (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?)`);for(let g of y.symbols){let x=Rt.get(g.name);for(let I of g.definitions){let R=Number(Kc.run(x,I.file,I.line,I.prompt,JSON.stringify(I.menuPath),se(I.condition),se(I.promptCondition),I.isMenuconfig?1:0,I.isConfigDefault?1:0).lastInsertRowid);for(let X of I.defaults)Xc.run(R,se(X.value),se(X.condition),X.order);for(let[X,Je]of[["select",I.selects],["imply",I.implies]])for(let W of Je)zc.run(R,X,W.target,Rt.get(W.target)??null,se(W.condition),W.order);for(let X of I.ranges)Yc.run(R,se(X.low),se(X.high),se(X.condition),X.order)}}let Vc=L.prepare("INSERT INTO kconfig_choice (stable_id, name, type, definitions) VALUES (?, ?, ?, ?)"),Gc=L.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let g of y.choices){let x=Number(Vc.run(g.id,g.name,g.type,JSON.stringify(g.definitions)).lastInsertRowid);for(let I of new Set(g.members)){let R=Rt.get(I);R!==void 0&&Gc.run(x,R)}}let Jc=L.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Hc=L.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Wc=L.prepare("INSERT INTO text_pool (text) VALUES (?)"),jr=new Map,Zc=g=>{if(!g)return null;let x=jr.get(g);if(x!==void 0)return x;let I=Number(Wc.run(g).lastInsertRowid);return jr.set(g,I),I};for(let g of E){let x=g.compatible,I=(W,xe=0,z="")=>[...W.properties.map(Ce=>({level:xe,childPath:z,property:Ce})),...W.children.flatMap((Ce,D)=>I(Ce,xe+1,z?`${z}/${D}`:String(D)))],R=I(g),X=Jc.run(x,g.path,g.description??"",g.bus===void 0||g.bus===null?null:typeof g.bus=="string"?g.bus:JSON.stringify(g.bus),g.onBus??null,JSON.stringify(g.cells),JSON.stringify(g.includes),R.map(({property:W})=>W.name).join(" "),R.length,x.includes(",")?x.split(",")[0]:null),Je=Number(X.lastInsertRowid);for(let{level:W,childPath:xe,property:z}of R)Hc.run(Je,W,z.name,z.type??null,z.required?1:0,Zc(z.description),$r(z.default),$r(z.enum),$r(z.const),z.deprecated?1:0,z.specifierSpace??null,z.inheritedFrom??null,JSON.stringify(z.provenance??{}),JSON.stringify(z.constraints??{}),xe)}let Qc=L.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of A){let x=g.socs.map(I=>I.name);Qc.run(g.name,g.fullName??"",g.vendor??"",g.dir,g.arch??null,g.ram??null,g.flash??null,JSON.stringify(g.socs),x.join(" "),JSON.stringify(g.targets),g.targets.map(I=>I.identifier).join(" "),JSON.stringify(g.revisions),g.defaultRevision??null,JSON.stringify(g.supported),g.supported.join(" "),g.docPath??null)}let el=L.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let g of T)el.run(g.name,g.series??null,g.family??null,g.vendor??null,g.dir,JSON.stringify(g.cpuclusters));let tl=L.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),nl=L.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),Kr=L.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let g of j){let x=tl.run(g.path,g.kind,g.name,g.description??"",JSON.stringify(g.tags),g.tags.join(" "),JSON.stringify(g.scenarios),JSON.stringify(g.dependsOn),JSON.stringify(g.integrationPlatforms),JSON.stringify(g.platformAllow),JSON.stringify(g.files),g.docPath??null),I=Number(x.lastInsertRowid);for(let R of g.contents)nl.run(I,R.path,R.text);for(let R of g.integrationPlatforms)Kr.run(I,R,"integration");for(let R of g.platformAllow)Kr.run(I,R,"allowlist")}let il=L.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let g of O.symbols)il.run(g.name,g.kind,g.signature,g.brief??"",g.detail??"",JSON.stringify(g.params),JSON.stringify(g.returns),JSON.stringify(g.retvals),g.group??null,g.since??null,g.deprecated?1:0,g.header,g.line,g.doxygenId??null,g.compoundId??null,g.docAnchor??null,g.parentSymbol??null);let rl=L.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let g of O.groups)rl.run(g.id,g.title,g.parent??null,g.header);let sl=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),ol={schema_version:String(Zr),zephyr_version:r,zephyr_commit:i.zephyrCommit,zephyr_tag:i.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:i.sourceKind,index_descriptor:Q(i),context_fingerprint:i.contextFingerprint,module_fingerprint:i.moduleFingerprint,doc_base_url:s,built_at:new Date().toISOString(),ingest_version:Pc.version,count_docs:String(p.length),count_doc_chunks:String(u),report_docs:Q(d),count_kconfig:String(y.symbols.length),report_kconfig:Q({discovered:y.symbols.length+y.choices.length,indexed:y.symbols.length+y.choices.length,intentionallyExcluded:[],warnings:[{code:"source-files",message:`Kconfiglib evaluated ${y.filesScanned} source files.`},...y.warnings.map(g=>({code:"kconfiglib",message:g}))],errors:[]}),count_bindings:String(E.length),count_dt_properties:String(w),report_bindings:Q(N),count_boards:String(A.length),count_board_targets:String(v),count_socs:String(T.length),report_boards:Q({discovered:A.length+v+T.length,indexed:A.length+v+T.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),count_samples:String(j.length),report_samples:Q({discovered:j.length+j.reduce((g,x)=>g+x.contents.length+x.exclusions.length,0),indexed:j.length+j.reduce((g,x)=>g+x.contents.length,0),intentionallyExcluded:j.flatMap(g=>g.exclusions.map(x=>({path:`${g.path}/${x.path}`,reason:x.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(O.symbols.length),api_ingest_mode:O.mode,report_api:Q(O.report)};for(let[g,x]of Object.entries(ol))sl.run(g,x);L.exec("COMMIT"),e(`  written   (${Date.now()-M} ms)`);let al=Date.now();L.exec(es),e(`  indexed   full-text (${Date.now()-al} ms)`),L.exec("VACUUM"),L.exec("PRAGMA optimize");let Xr=String(L.prepare("PRAGMA integrity_check").get()?.integrity_check??""),zr=L.prepare("PRAGMA foreign_key_check").all();if(Xr!=="ok"||zr.length>0)throw new Error(`Index verification failed (integrity=${Xr}, foreign-key violations=${zr.length}).`);for(let[g,x]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let I=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${g}`).get()?.n),R=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${x}`).get()?.n);if(I!==R)throw new Error(`Index verification failed: ${g} has ${I} rows; ${x} has ${R}.`)}if(L.close(),L=void 0,Ur(K),qc(K,a),Mc(It(a)),Fr=!0,o){let g=`${o}.${$c()}.tmp`;Fh(g,`${Q({contextFingerprint:i.contextFingerprint,relativePath:`${i.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),Ur(g),qc(g,o),Mc(It(o)),Xh(It(o),i.contextFingerprint)}let cl=Uc(a).size;e(`Done in ${((Date.now()-c)/1e3).toFixed(1)} s -> ${a} (${(cl/1024/1024).toFixed(1)} MiB)`)}finally{try{L?.close()}catch{}Fr||(Mr(K,{force:!0}),Mr(`${K}-journal`,{force:!0}))}}try{zh()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
