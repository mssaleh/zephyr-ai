#!/usr/bin/env node
import{createRequire}from'node:module';const require=createRequire(import.meta.url);
var Dl=Object.create;var rs=Object.defineProperty;var Pl=Object.getOwnPropertyDescriptor;var ql=Object.getOwnPropertyNames;var $l=Object.getPrototypeOf,Ml=Object.prototype.hasOwnProperty;var Mt=(n=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(n,{get:(e,t)=>(typeof require<"u"?require:e)[t]}):n)(function(n){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+n+'" is not supported')});var w=(n,e)=>()=>{try{return e||n((e={exports:{}}).exports,e),e.exports}catch(t){throw e=0,t}};var Ul=(n,e,t,r)=>{if(e&&typeof e=="object"||typeof e=="function")for(let i of ql(e))!Ml.call(n,i)&&i!==t&&rs(n,i,{get:()=>e[i],enumerable:!(r=Pl(e,i))||r.enumerable});return n};var Zn=(n,e,t)=>(t=n!=null?Dl($l(n)):{},Ul(e||!n||!n.__esModule?rs(t,"default",{value:n,enumerable:!0}):t,n));var C=w(Y=>{"use strict";var rr=Symbol.for("yaml.alias"),ks=Symbol.for("yaml.document"),jt=Symbol.for("yaml.map"),As=Symbol.for("yaml.pair"),ir=Symbol.for("yaml.scalar"),Kt=Symbol.for("yaml.seq"),de=Symbol.for("yaml.node.type"),vd=n=>!!n&&typeof n=="object"&&n[de]===rr,kd=n=>!!n&&typeof n=="object"&&n[de]===ks,Ad=n=>!!n&&typeof n=="object"&&n[de]===jt,Ld=n=>!!n&&typeof n=="object"&&n[de]===As,Ls=n=>!!n&&typeof n=="object"&&n[de]===ir,Od=n=>!!n&&typeof n=="object"&&n[de]===Kt;function Os(n){if(n&&typeof n=="object")switch(n[de]){case jt:case Kt:return!0}return!1}function Rd(n){if(n&&typeof n=="object")switch(n[de]){case rr:case jt:case ir:case Kt:return!0}return!1}var Id=n=>(Ls(n)||Os(n))&&!!n.anchor;Y.ALIAS=rr;Y.DOC=ks;Y.MAP=jt;Y.NODE_TYPE=de;Y.PAIR=As;Y.SCALAR=ir;Y.SEQ=Kt;Y.hasAnchor=Id;Y.isAlias=vd;Y.isCollection=Os;Y.isDocument=kd;Y.isMap=Ad;Y.isNode=Rd;Y.isPair=Ld;Y.isScalar=Ls;Y.isSeq=Od});var nt=w(sr=>{"use strict";var j=C(),H=Symbol("break visit"),Rs=Symbol("skip children"),ce=Symbol("remove node");function Xt(n,e){let t=Is(e);j.isDocument(n)?Ke(null,n.contents,t,Object.freeze([n]))===ce&&(n.contents=null):Ke(null,n,t,Object.freeze([]))}Xt.BREAK=H;Xt.SKIP=Rs;Xt.REMOVE=ce;function Ke(n,e,t,r){let i=xs(n,e,t,r);if(j.isNode(i)||j.isPair(i))return Cs(n,r,i),Ke(n,i,t,r);if(typeof i!="symbol"){if(j.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=Ke(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===H)return H;o===ce&&(e.items.splice(s,1),s-=1)}}}else if(j.isPair(e)){r=Object.freeze(r.concat(e));let s=Ke("key",e.key,t,r);if(s===H)return H;s===ce&&(e.key=null);let o=Ke("value",e.value,t,r);if(o===H)return H;o===ce&&(e.value=null)}}return i}async function zt(n,e){let t=Is(e);j.isDocument(n)?await Xe(null,n.contents,t,Object.freeze([n]))===ce&&(n.contents=null):await Xe(null,n,t,Object.freeze([]))}zt.BREAK=H;zt.SKIP=Rs;zt.REMOVE=ce;async function Xe(n,e,t,r){let i=await xs(n,e,t,r);if(j.isNode(i)||j.isPair(i))return Cs(n,r,i),Xe(n,i,t,r);if(typeof i!="symbol"){if(j.isCollection(e)){r=Object.freeze(r.concat(e));for(let s=0;s<e.items.length;++s){let o=await Xe(s,e.items[s],t,r);if(typeof o=="number")s=o-1;else{if(o===H)return H;o===ce&&(e.items.splice(s,1),s-=1)}}}else if(j.isPair(e)){r=Object.freeze(r.concat(e));let s=await Xe("key",e.key,t,r);if(s===H)return H;s===ce&&(e.key=null);let o=await Xe("value",e.value,t,r);if(o===H)return H;o===ce&&(e.value=null)}}return i}function Is(n){return typeof n=="object"&&(n.Collection||n.Node||n.Value)?Object.assign({Alias:n.Node,Map:n.Node,Scalar:n.Node,Seq:n.Node},n.Value&&{Map:n.Value,Scalar:n.Value,Seq:n.Value},n.Collection&&{Map:n.Collection,Seq:n.Collection},n):n}function xs(n,e,t,r){if(typeof t=="function")return t(n,e,r);if(j.isMap(e))return t.Map?.(n,e,r);if(j.isSeq(e))return t.Seq?.(n,e,r);if(j.isPair(e))return t.Pair?.(n,e,r);if(j.isScalar(e))return t.Scalar?.(n,e,r);if(j.isAlias(e))return t.Alias?.(n,e,r)}function Cs(n,e,t){let r=e[e.length-1];if(j.isCollection(r))r.items[n]=t;else if(j.isPair(r))n==="key"?r.key=t:r.value=t;else if(j.isDocument(r))r.contents=t;else{let i=j.isAlias(r)?"alias":"scalar";throw new Error(`Cannot replace node with ${i} parent`)}}sr.visit=Xt;sr.visitAsync=zt});var or=w(Ps=>{"use strict";var Ds=C(),xd=nt(),Cd={"!":"%21",",":"%2C","[":"%5B","]":"%5D","{":"%7B","}":"%7D"},Dd=n=>n.replace(/[!,[\]{}]/g,e=>Cd[e]),rt=class n{constructor(e,t){this.docStart=null,this.docEnd=!1,this.yaml=Object.assign({},n.defaultYaml,e),this.tags=Object.assign({},n.defaultTags,t)}clone(){let e=new n(this.yaml,this.tags);return e.docStart=this.docStart,e}atDocument(){let e=new n(this.yaml,this.tags);switch(this.yaml.version){case"1.1":this.atNextDocument=!0;break;case"1.2":this.atNextDocument=!1,this.yaml={explicit:n.defaultYaml.explicit,version:"1.2"},this.tags=Object.assign({},n.defaultTags);break}return e}add(e,t){this.atNextDocument&&(this.yaml={explicit:n.defaultYaml.explicit,version:"1.1"},this.tags=Object.assign({},n.defaultTags),this.atNextDocument=!1);let r=e.trim().split(/[ \t]+/),i=r.shift();switch(i){case"%TAG":{if(r.length!==2&&(t(0,"%TAG directive should contain exactly two parts"),r.length<2))return!1;let[s,o]=r;return this.tags[s]=o,!0}case"%YAML":{if(this.yaml.explicit=!0,r.length!==1)return t(0,"%YAML directive should contain exactly one part"),!1;let[s]=r;if(s==="1.1"||s==="1.2")return this.yaml.version=s,!0;{let o=/^\d+\.\d+$/.test(s);return t(6,`Unsupported YAML version ${s}`,o),!1}}default:return t(0,`Unknown directive ${i}`,!0),!1}}tagName(e,t){if(e==="!")return"!";if(e[0]!=="!")return t(`Not a valid tag: ${e}`),null;if(e[1]==="<"){let o=e.slice(2,-1);return o==="!"||o==="!!"?(t(`Verbatim tags aren't resolved, so ${e} is invalid.`),null):(e[e.length-1]!==">"&&t("Verbatim tags must end with a >"),o)}let[,r,i]=e.match(/^(.*!)([^!]*)$/s);i||t(`The ${e} tag has no suffix`);let s=this.tags[r];if(s)try{return s+decodeURIComponent(i)}catch(o){return t(String(o)),null}return r==="!"?e:(t(`Could not resolve tag: ${e}`),null)}tagString(e){for(let[t,r]of Object.entries(this.tags))if(e.startsWith(r))return t+Dd(e.substring(r.length));return e[0]==="!"?e:`!<${e}>`}toString(e){let t=this.yaml.explicit?[`%YAML ${this.yaml.version||"1.2"}`]:[],r=Object.entries(this.tags),i;if(e&&r.length>0&&Ds.isNode(e.contents)){let s={};xd.visit(e.contents,(o,a)=>{Ds.isNode(a)&&a.tag&&(s[a.tag]=!0)}),i=Object.keys(s)}else i=[];for(let[s,o]of r)s==="!!"&&o==="tag:yaml.org,2002:"||(!e||i.some(a=>a.startsWith(o)))&&t.push(`%TAG ${s} ${o}`);return t.join(`
`)}};rt.defaultYaml={explicit:!1,version:"1.2"};rt.defaultTags={"!!":"tag:yaml.org,2002:"};Ps.Directives=rt});var Yt=w(it=>{"use strict";var qs=C(),Pd=nt();function qd(n){if(/[\x00-\x19\s,[\]{}]/.test(n)){let t=`Anchor must not contain whitespace or control characters: ${JSON.stringify(n)}`;throw new Error(t)}return!0}function $s(n){let e=new Set;return Pd.visit(n,{Value(t,r){r.anchor&&e.add(r.anchor)}}),e}function Ms(n,e){for(let t=1;;++t){let r=`${n}${t}`;if(!e.has(r))return r}}function $d(n,e){let t=[],r=new Map,i=null;return{onAnchor:s=>{t.push(s),i??(i=$s(n));let o=Ms(e,i);return i.add(o),o},setAnchors:()=>{for(let s of t){let o=r.get(s);if(typeof o=="object"&&o.anchor&&(qs.isScalar(o.node)||qs.isCollection(o.node)))o.node.anchor=o.anchor;else{let a=new Error("Failed to resolve repeated object (this should not happen)");throw a.source=s,a}}},sourceObjects:r}}it.anchorIsValid=qd;it.anchorNames=$s;it.createNodeAnchors=$d;it.findNewAnchor=Ms});var ar=w(Us=>{"use strict";function st(n,e,t,r){if(r&&typeof r=="object")if(Array.isArray(r))for(let i=0,s=r.length;i<s;++i){let o=r[i],a=st(n,r,String(i),o);a===void 0?delete r[i]:a!==o&&(r[i]=a)}else if(r instanceof Map)for(let i of Array.from(r.keys())){let s=r.get(i),o=st(n,r,i,s);o===void 0?r.delete(i):o!==s&&r.set(i,o)}else if(r instanceof Set)for(let i of Array.from(r)){let s=st(n,r,i,i);s===void 0?r.delete(i):s!==i&&(r.delete(i),r.add(s))}else for(let[i,s]of Object.entries(r)){let o=st(n,r,i,s);o===void 0?delete r[i]:o!==s&&(r[i]=o)}return n.call(e,t,r)}Us.applyReviver=st});var ge=w(Fs=>{"use strict";var Md=C();function Bs(n,e,t){if(Array.isArray(n))return n.map((r,i)=>Bs(r,String(i),t));if(n&&typeof n.toJSON=="function"){if(!t||!Md.hasAnchor(n))return n.toJSON(e,t);let r={aliasCount:0,count:1,res:void 0};t.anchors.set(n,r),t.onCreate=s=>{r.res=s,delete t.onCreate};let i=n.toJSON(e,t);return t.onCreate&&t.onCreate(i),i}return typeof n=="bigint"&&!t?.keep?Number(n):n}Fs.toJS=Bs});var Vt=w(Ks=>{"use strict";var Ud=ar(),js=C(),Bd=ge(),cr=class{constructor(e){Object.defineProperty(this,js.NODE_TYPE,{value:e})}clone(){let e=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return this.range&&(e.range=this.range.slice()),e}toJS(e,{mapAsMap:t,maxAliasCount:r,onAnchor:i,reviver:s}={}){if(!js.isDocument(e))throw new TypeError("A document argument is required");let o={anchors:new Map,doc:e,keep:!0,mapAsMap:t===!0,mapKeyWarned:!1,maxAliasCount:typeof r=="number"?r:100},a=Bd.toJS(this,"",o);if(typeof i=="function")for(let{count:c,res:l}of o.anchors.values())i(l,c);return typeof s=="function"?Ud.applyReviver(s,{"":a},"",a):a}};Ks.NodeBase=cr});var ot=w(Xs=>{"use strict";var Fd=Yt(),jd=nt(),ze=C(),Kd=Vt(),Xd=ge(),lr=class extends Kd.NodeBase{constructor(e){super(ze.ALIAS),this.source=e,Object.defineProperty(this,"tag",{set(){throw new Error("Alias nodes cannot have tags")}})}resolve(e,t){if(t?.maxAliasCount===0)throw new ReferenceError("Alias resolution is disabled");let r;t?.aliasResolveCache?r=t.aliasResolveCache:(r=[],jd.visit(e,{Node:(s,o)=>{(ze.isAlias(o)||ze.hasAnchor(o))&&r.push(o)}}),t&&(t.aliasResolveCache=r));let i;for(let s of r){if(s===this)break;s.anchor===this.source&&(i=s)}return i}toJSON(e,t){if(!t)return{source:this.source};let{anchors:r,doc:i,maxAliasCount:s}=t,o=this.resolve(i,t);if(!o){let c=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new ReferenceError(c)}let a=r.get(o);if(a||(Xd.toJS(o,null,t),a=r.get(o)),a?.res===void 0){let c="This should not happen: Alias anchor was not resolved?";throw new ReferenceError(c)}if(s>=0&&(a.count+=1,a.aliasCount===0&&(a.aliasCount=Gt(i,o,r)),a.count*a.aliasCount>s)){let c="Excessive alias count indicates a resource exhaustion attack";throw new ReferenceError(c)}return a.res}toString(e,t,r){let i=`*${this.source}`;if(e){if(Fd.anchorIsValid(this.source),e.options.verifyAliasOrder&&!e.anchors.has(this.source)){let s=`Unresolved alias (the anchor must be set before the alias): ${this.source}`;throw new Error(s)}if(e.implicitKey)return`${i} `}return i}};function Gt(n,e,t){if(ze.isAlias(e)){let r=e.resolve(n),i=t&&r&&t.get(r);return i?i.count*i.aliasCount:0}else if(ze.isCollection(e)){let r=0;for(let i of e.items){let s=Gt(n,i,t);s>r&&(r=s)}return r}else if(ze.isPair(e)){let r=Gt(n,e.key,t),i=Gt(n,e.value,t);return Math.max(r,i)}return 1}Xs.Alias=lr});var F=w(dr=>{"use strict";var zd=C(),Yd=Vt(),Vd=ge(),Gd=n=>!n||typeof n!="function"&&typeof n!="object",ye=class extends Yd.NodeBase{constructor(e){super(zd.SCALAR),this.value=e}toJSON(e,t){return t?.keep?this.value:Vd.toJS(this.value,e,t)}toString(){return String(this.value)}};ye.BLOCK_FOLDED="BLOCK_FOLDED";ye.BLOCK_LITERAL="BLOCK_LITERAL";ye.PLAIN="PLAIN";ye.QUOTE_DOUBLE="QUOTE_DOUBLE";ye.QUOTE_SINGLE="QUOTE_SINGLE";dr.Scalar=ye;dr.isScalarValue=Gd});var at=w(Ys=>{"use strict";var Jd=ot(),Oe=C(),zs=F(),Hd="tag:yaml.org,2002:";function Wd(n,e,t){if(e){let r=t.filter(s=>s.tag===e),i=r.find(s=>!s.format)??r[0];if(!i)throw new Error(`Tag ${e} not found`);return i}return t.find(r=>r.identify?.(n)&&!r.format)}function Zd(n,e,t){if(Oe.isDocument(n)&&(n=n.contents),Oe.isNode(n))return n;if(Oe.isPair(n)){let d=t.schema[Oe.MAP].createNode?.(t.schema,null,t);return d.items.push(n),d}(n instanceof String||n instanceof Number||n instanceof Boolean||typeof BigInt<"u"&&n instanceof BigInt)&&(n=n.valueOf());let{aliasDuplicateObjects:r,onAnchor:i,onTagObj:s,schema:o,sourceObjects:a}=t,c;if(r&&n&&typeof n=="object"){if(c=a.get(n),c)return c.anchor??(c.anchor=i(n)),new Jd.Alias(c.anchor);c={anchor:null,node:null},a.set(n,c)}e?.startsWith("!!")&&(e=Hd+e.slice(2));let l=Wd(n,e,o.tags);if(!l){if(n&&typeof n.toJSON=="function"&&(n=n.toJSON()),!n||typeof n!="object"){let d=new zs.Scalar(n);return c&&(c.node=d),d}l=n instanceof Map?o[Oe.MAP]:Symbol.iterator in Object(n)?o[Oe.SEQ]:o[Oe.MAP]}s&&(s(l),delete t.onTagObj);let p=l?.createNode?l.createNode(t.schema,n,t):typeof l?.nodeClass?.from=="function"?l.nodeClass.from(t.schema,n,t):new zs.Scalar(n);return e?p.tag=e:l.default||(p.tag=l.tag),c&&(c.node=p),p}Ys.createNode=Zd});var Ht=w(Jt=>{"use strict";var Qd=at(),le=C(),eu=Vt();function ur(n,e,t){let r=t;for(let i=e.length-1;i>=0;--i){let s=e[i];if(typeof s=="number"&&Number.isInteger(s)&&s>=0){let o=[];o[s]=r,r=o}else r=new Map([[s,r]])}return Qd.createNode(r,void 0,{aliasDuplicateObjects:!1,keepUndefined:!1,onAnchor:()=>{throw new Error("This should not happen, please report a bug.")},schema:n,sourceObjects:new Map})}var Vs=n=>n==null||typeof n=="object"&&!!n[Symbol.iterator]().next().done,fr=class extends eu.NodeBase{constructor(e,t){super(e),Object.defineProperty(this,"schema",{value:t,configurable:!0,enumerable:!1,writable:!0})}clone(e){let t=Object.create(Object.getPrototypeOf(this),Object.getOwnPropertyDescriptors(this));return e&&(t.schema=e),t.items=t.items.map(r=>le.isNode(r)||le.isPair(r)?r.clone(e):r),this.range&&(t.range=this.range.slice()),t}addIn(e,t){if(Vs(e))this.add(t);else{let[r,...i]=e,s=this.get(r,!0);if(le.isCollection(s))s.addIn(i,t);else if(s===void 0&&this.schema)this.set(r,ur(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}deleteIn(e){let[t,...r]=e;if(r.length===0)return this.delete(t);let i=this.get(t,!0);if(le.isCollection(i))return i.deleteIn(r);throw new Error(`Expected YAML collection at ${t}. Remaining path: ${r}`)}getIn(e,t){let[r,...i]=e,s=this.get(r,!0);return i.length===0?!t&&le.isScalar(s)?s.value:s:le.isCollection(s)?s.getIn(i,t):void 0}hasAllNullValues(e){return this.items.every(t=>{if(!le.isPair(t))return!1;let r=t.value;return r==null||e&&le.isScalar(r)&&r.value==null&&!r.commentBefore&&!r.comment&&!r.tag})}hasIn(e){let[t,...r]=e;if(r.length===0)return this.has(t);let i=this.get(t,!0);return le.isCollection(i)?i.hasIn(r):!1}setIn(e,t){let[r,...i]=e;if(i.length===0)this.set(r,t);else{let s=this.get(r,!0);if(le.isCollection(s))s.setIn(i,t);else if(s===void 0&&this.schema)this.set(r,ur(this.schema,i,t));else throw new Error(`Expected YAML collection at ${r}. Remaining path: ${i}`)}}};Jt.Collection=fr;Jt.collectionFromPath=ur;Jt.isEmptyPath=Vs});var ct=w(Wt=>{"use strict";var tu=n=>n.replace(/^(?!$)(?: $)?/gm,"#");function pr(n,e){return/^\n+$/.test(n)?n.substring(1):e?n.replace(/^(?! *$)/gm,e):n}var nu=(n,e,t)=>n.endsWith(`
`)?pr(t,e):t.includes(`
`)?`
`+pr(t,e):(n.endsWith(" ")?"":" ")+t;Wt.indentComment=pr;Wt.lineComment=nu;Wt.stringifyComment=tu});var Js=w(lt=>{"use strict";var ru="flow",mr="block",Zt="quoted";function iu(n,e,t="flow",{indentAtStart:r,lineWidth:i=80,minContentWidth:s=20,onFold:o,onOverflow:a}={}){if(!i||i<0)return n;i<s&&(s=0);let c=Math.max(1+s,1+i-e.length);if(n.length<=c)return n;let l=[],p={},d=i-e.length;typeof r=="number"&&(r>i-Math.max(2,s)?l.push(0):d=i-r);let u,m,y=!1,f=-1,g=-1,E=-1;t===mr&&(f=Gs(n,f,e.length),f!==-1&&(d=f+c));for(let T;T=n[f+=1];){if(t===Zt&&T==="\\"){switch(g=f,n[f+1]){case"x":f+=3;break;case"u":f+=5;break;case"U":f+=9;break;default:f+=1}E=f}if(T===`
`)t===mr&&(f=Gs(n,f,e.length)),d=f+e.length+c,u=void 0;else{if(T===" "&&m&&m!==" "&&m!==`
`&&m!=="	"){let N=n[f+1];N&&N!==" "&&N!==`
`&&N!=="	"&&(u=f)}if(f>=d)if(u)l.push(u),d=u+c,u=void 0;else if(t===Zt){for(;m===" "||m==="	";)m=T,T=n[f+=1],y=!0;let N=f>E+1?f-2:g-1;if(p[N])return n;l.push(N),p[N]=!0,d=N+c,u=void 0}else y=!0}m=T}if(y&&a&&a(),l.length===0)return n;o&&o();let b=n.slice(0,l[0]);for(let T=0;T<l.length;++T){let N=l[T],S=l[T+1]||n.length;N===0?b=`
${e}${n.slice(0,S)}`:(t===Zt&&p[N]&&(b+=`${n[N]}\\`),b+=`
${e}${n.slice(N+1,S)}`)}return b}function Gs(n,e,t){let r=e,i=e+1,s=n[i];for(;s===" "||s==="	";)if(e<i+t)s=n[++e];else{do s=n[++e];while(s&&s!==`
`);r=e,i=e+1,s=n[i]}return r}lt.FOLD_BLOCK=mr;lt.FOLD_FLOW=ru;lt.FOLD_QUOTED=Zt;lt.foldFlowLines=iu});var ut=w(Hs=>{"use strict";var re=F(),be=Js(),en=(n,e)=>({indentAtStart:e?n.indent.length:n.indentAtStart,lineWidth:n.options.lineWidth,minContentWidth:n.options.minContentWidth}),tn=n=>/^(%|---|\.\.\.)/m.test(n);function su(n,e,t){if(!e||e<0)return!1;let r=e-t,i=n.length;if(i<=r)return!1;for(let s=0,o=0;s<i;++s)if(n[s]===`
`){if(s-o>r)return!0;if(o=s+1,i-o<=r)return!1}return!0}function dt(n,e){let t=JSON.stringify(n);if(e.options.doubleQuotedAsJSON)return t;let{implicitKey:r}=e,i=e.options.doubleQuotedMinMultiLineLength,s=e.indent||(tn(n)?"  ":""),o="",a=0;for(let c=0,l=t[c];l;l=t[++c])if(l===" "&&t[c+1]==="\\"&&t[c+2]==="n"&&(o+=t.slice(a,c)+"\\ ",c+=1,a=c,l="\\"),l==="\\")switch(t[c+1]){case"u":{o+=t.slice(a,c);let p=t.substr(c+2,4);switch(p){case"0000":o+="\\0";break;case"0007":o+="\\a";break;case"000b":o+="\\v";break;case"001b":o+="\\e";break;case"0085":o+="\\N";break;case"00a0":o+="\\_";break;case"2028":o+="\\L";break;case"2029":o+="\\P";break;default:p.substr(0,2)==="00"?o+="\\x"+p.substr(2):o+=t.substr(c,6)}c+=5,a=c+1}break;case"n":if(r||t[c+2]==='"'||t.length<i)c+=1;else{for(o+=t.slice(a,c)+`

`;t[c+2]==="\\"&&t[c+3]==="n"&&t[c+4]!=='"';)o+=`
`,c+=2;o+=s,t[c+2]===" "&&(o+="\\"),c+=1,a=c+1}break;default:c+=1}return o=a?o+t.slice(a):t,r?o:be.foldFlowLines(o,s,be.FOLD_QUOTED,en(e,!1))}function hr(n,e){if(e.options.singleQuote===!1||e.implicitKey&&n.includes(`
`)||/[ \t]\n|\n[ \t]/.test(n))return dt(n,e);let t=e.indent||(tn(n)?"  ":""),r="'"+n.replace(/'/g,"''").replace(/\n+/g,`$&
${t}`)+"'";return e.implicitKey?r:be.foldFlowLines(r,t,be.FOLD_FLOW,en(e,!1))}function Ye(n,e){let{singleQuote:t}=e.options,r;if(t===!1)r=dt;else{let i=n.includes('"'),s=n.includes("'");i&&!s?r=hr:s&&!i?r=dt:r=t?hr:dt}return r(n,e)}var gr;try{gr=new RegExp(`(^|(?<!
))
+(?!
|$)`,"g")}catch{gr=/\n+(?!\n|$)/g}function Qt({comment:n,type:e,value:t},r,i,s){let{blockQuote:o,commentString:a,lineWidth:c}=r.options;if(!o||/\n[\t ]+$/.test(t))return Ye(t,r);let l=r.indent||(r.forceBlockIndent||tn(t)?"  ":""),p=o==="literal"?!0:o==="folded"||e===re.Scalar.BLOCK_FOLDED?!1:e===re.Scalar.BLOCK_LITERAL?!0:!su(t,c,l.length);if(!t)return p?`|
`:`>
`;let d,u;for(u=t.length;u>0;--u){let S=t[u-1];if(S!==`
`&&S!=="	"&&S!==" ")break}let m=t.substring(u),y=m.indexOf(`
`);y===-1?d="-":t===m||y!==m.length-1?(d="+",s&&s()):d="",m&&(t=t.slice(0,-m.length),m[m.length-1]===`
`&&(m=m.slice(0,-1)),m=m.replace(gr,`$&${l}`));let f=!1,g,E=-1;for(g=0;g<t.length;++g){let S=t[g];if(S===" ")f=!0;else if(S===`
`)E=g;else break}let b=t.substring(0,E<g?E+1:g);b&&(t=t.substring(b.length),b=b.replace(/\n+/g,`$&${l}`));let N=(f?l?"2":"1":"")+d;if(n&&(N+=" "+a(n.replace(/ ?[\r\n]+/g," ")),i&&i()),!p){let S=t.replace(/\n+/g,`
$&`).replace(/(?:^|\n)([\t ].*)(?:([\n\t ]*)\n(?![\n\t ]))?/g,"$1$2").replace(/\n+/g,`$&${l}`),k=!1,A=en(r,!0);o!=="folded"&&e!==re.Scalar.BLOCK_FOLDED&&(A.onOverflow=()=>{k=!0});let _=be.foldFlowLines(`${b}${S}${m}`,l,be.FOLD_BLOCK,A);if(!k)return`>${N}
${l}${_}`}return t=t.replace(/\n+/g,`$&${l}`),`|${N}
${l}${b}${t}${m}`}function ou(n,e,t,r){let{type:i,value:s}=n,{actualString:o,implicitKey:a,indent:c,indentStep:l,inFlow:p}=e;if(a&&s.includes(`
`)||p&&/[[\]{},]/.test(s))return Ye(s,e);if(/^[\n\t ,[\]{}#&*!|>'"%@`]|^[?-]$|^[?-][ \t]|[\n:][ \t]|[ \t]\n|[\n\t ]#|[\n\t :]$/.test(s))return a||p||!s.includes(`
`)?Ye(s,e):Qt(n,e,t,r);if(!a&&!p&&i!==re.Scalar.PLAIN&&s.includes(`
`))return Qt(n,e,t,r);if(tn(s)){if(c==="")return e.forceBlockIndent=!0,Qt(n,e,t,r);if(a&&c===l)return Ye(s,e)}let d=s.replace(/\n+/g,`$&
${c}`);if(o){let u=f=>f.default&&f.tag!=="tag:yaml.org,2002:str"&&f.test?.test(d),{compat:m,tags:y}=e.doc.schema;if(y.some(u)||m?.some(u))return Ye(s,e)}return a?d:be.foldFlowLines(d,c,be.FOLD_FLOW,en(e,!1))}function au(n,e,t,r){let{implicitKey:i,inFlow:s}=e,o=typeof n.value=="string"?n:Object.assign({},n,{value:String(n.value)}),{type:a}=n;a!==re.Scalar.QUOTE_DOUBLE&&/[\x00-\x08\x0b-\x1f\x7f-\x9f\u{D800}-\u{DFFF}]/u.test(o.value)&&(a=re.Scalar.QUOTE_DOUBLE);let c=p=>{switch(p){case re.Scalar.BLOCK_FOLDED:case re.Scalar.BLOCK_LITERAL:return i||s?Ye(o.value,e):Qt(o,e,t,r);case re.Scalar.QUOTE_DOUBLE:return dt(o.value,e);case re.Scalar.QUOTE_SINGLE:return hr(o.value,e);case re.Scalar.PLAIN:return ou(o,e,t,r);default:return null}},l=c(a);if(l===null){let{defaultKeyType:p,defaultStringType:d}=e.options,u=i&&p||d;if(l=c(u),l===null)throw new Error(`Unsupported default string type ${u}`)}return l}Hs.stringifyString=au});var ft=w(yr=>{"use strict";var cu=Yt(),Ee=C(),lu=ct(),du=ut();function uu(n,e){let t=Object.assign({blockQuote:!0,commentString:lu.stringifyComment,defaultKeyType:null,defaultStringType:"PLAIN",directives:null,doubleQuotedAsJSON:!1,doubleQuotedMinMultiLineLength:40,falseStr:"false",flowCollectionPadding:!0,indentSeq:!0,lineWidth:80,minContentWidth:20,nullStr:"null",simpleKeys:!1,singleQuote:null,trailingComma:!1,trueStr:"true",verifyAliasOrder:!0},n.schema.toStringOptions,e),r;switch(t.collectionStyle){case"block":r=!1;break;case"flow":r=!0;break;default:r=null}return{anchors:new Set,doc:n,flowCollectionPadding:t.flowCollectionPadding?" ":"",indent:"",indentStep:typeof t.indent=="number"?" ".repeat(t.indent):"  ",inFlow:r,options:t}}function fu(n,e){if(e.tag){let i=n.filter(s=>s.tag===e.tag);if(i.length>0)return i.find(s=>s.format===e.format)??i[0]}let t,r;if(Ee.isScalar(e)){r=e.value;let i=n.filter(s=>s.identify?.(r));if(i.length>1){let s=i.filter(o=>o.test);s.length>0&&(i=s)}t=i.find(s=>s.format===e.format)??i.find(s=>!s.format)}else r=e,t=n.find(i=>i.nodeClass&&r instanceof i.nodeClass);if(!t){let i=r?.constructor?.name??(r===null?"null":typeof r);throw new Error(`Tag not resolved for ${i} value`)}return t}function pu(n,e,{anchors:t,doc:r}){if(!r.directives)return"";let i=[],s=(Ee.isScalar(n)||Ee.isCollection(n))&&n.anchor;s&&cu.anchorIsValid(s)&&(t.add(s),i.push(`&${s}`));let o=n.tag??(e.default?null:e.tag);return o&&i.push(r.directives.tagString(o)),i.join(" ")}function mu(n,e,t,r){if(Ee.isPair(n))return n.toString(e,t,r);if(Ee.isAlias(n)){if(e.doc.directives)return n.toString(e);if(e.resolvedAliases?.has(n))throw new TypeError("Cannot stringify circular structure without alias nodes");e.resolvedAliases?e.resolvedAliases.add(n):e.resolvedAliases=new Set([n]),n=n.resolve(e.doc)}let i,s=Ee.isNode(n)?n:e.doc.createNode(n,{onTagObj:c=>i=c});i??(i=fu(e.doc.schema.tags,s));let o=pu(s,i,e);o.length>0&&(e.indentAtStart=(e.indentAtStart??0)+o.length+1);let a=typeof i.stringify=="function"?i.stringify(s,e,t,r):Ee.isScalar(s)?du.stringifyString(s,e,t,r):s.toString(e,t,r);return o?Ee.isScalar(s)||a[0]==="{"||a[0]==="["?`${o} ${a}`:`${o}
${e.indent}${a}`:a}yr.createStringifyContext=uu;yr.stringify=mu});var eo=w(Qs=>{"use strict";var ue=C(),Ws=F(),Zs=ft(),pt=ct();function hu({key:n,value:e},t,r,i){let{allNullValues:s,doc:o,indent:a,indentStep:c,options:{commentString:l,indentSeq:p,simpleKeys:d}}=t,u=ue.isNode(n)&&n.comment||null;if(d){if(u)throw new Error("With simple keys, key nodes cannot have comments");if(ue.isCollection(n)||!ue.isNode(n)&&typeof n=="object"){let A="With simple keys, collection cannot be used as a key value";throw new Error(A)}}let m=!d&&(!n||u&&e==null&&!t.inFlow||ue.isCollection(n)||(ue.isScalar(n)?n.type===Ws.Scalar.BLOCK_FOLDED||n.type===Ws.Scalar.BLOCK_LITERAL:typeof n=="object"));t=Object.assign({},t,{allNullValues:!1,implicitKey:!m&&(d||!s),indent:a+c});let y=!1,f=!1,g=Zs.stringify(n,t,()=>y=!0,()=>f=!0);if(!m&&!t.inFlow&&g.length>1024){if(d)throw new Error("With simple keys, single line scalar must not span more than 1024 characters");m=!0}if(t.inFlow){if(s||e==null)return y&&r&&r(),g===""?"?":m?`? ${g}`:g}else if(s&&!d||e==null&&m)return g=`? ${g}`,u&&!y?g+=pt.lineComment(g,t.indent,l(u)):f&&i&&i(),g;y&&(u=null),m?(u&&(g+=pt.lineComment(g,t.indent,l(u))),g=`? ${g}
${a}:`):(g=`${g}:`,u&&(g+=pt.lineComment(g,t.indent,l(u))));let E,b,T;ue.isNode(e)?(E=!!e.spaceBefore,b=e.commentBefore,T=e.comment):(E=!1,b=null,T=null,e&&typeof e=="object"&&(e=o.createNode(e))),t.implicitKey=!1,!m&&!u&&ue.isScalar(e)&&(t.indentAtStart=g.length+1),f=!1,!p&&c.length>=2&&!t.inFlow&&!m&&ue.isSeq(e)&&!e.flow&&!e.tag&&!e.anchor&&(t.indent=t.indent.substring(2));let N=!1,S=Zs.stringify(e,t,()=>N=!0,()=>f=!0),k=" ";if(u||E||b){if(k=E?`
`:"",b){let A=l(b);k+=`
${pt.indentComment(A,t.indent)}`}S===""&&!t.inFlow?k===`
`&&T&&(k=`

`):k+=`
${t.indent}`}else if(!m&&ue.isCollection(e)){let A=S[0],_=S.indexOf(`
`),v=_!==-1,$=t.inFlow??e.flow??e.items.length===0;if(v||!$){let ne=!1;if(v&&(A==="&"||A==="!")){let M=S.indexOf(" ");A==="&"&&M!==-1&&M<_&&S[M+1]==="!"&&(M=S.indexOf(" ",M+1)),(M===-1||_<M)&&(ne=!0)}ne||(k=`
${t.indent}`)}}else(S===""||S[0]===`
`)&&(k="");return g+=k+S,t.inFlow?N&&r&&r():T&&!N?g+=pt.lineComment(g,t.indent,l(T)):f&&i&&i(),g}Qs.stringifyPair=hu});var Er=w(br=>{"use strict";var to=Mt("process");function gu(n,...e){n==="debug"&&console.log(...e)}function yu(n,e){(n==="debug"||n==="warn")&&(typeof to.emitWarning=="function"?to.emitWarning(e):console.warn(e))}br.debug=gu;br.warn=yu});var an=w(on=>{"use strict";var sn=C(),no=F(),nn="<<",rn={identify:n=>n===nn||typeof n=="symbol"&&n.description===nn,default:"key",tag:"tag:yaml.org,2002:merge",test:/^<<$/,resolve:()=>Object.assign(new no.Scalar(Symbol(nn)),{addToJSMap:ro}),stringify:()=>nn},bu=(n,e)=>(rn.identify(e)||sn.isScalar(e)&&(!e.type||e.type===no.Scalar.PLAIN)&&rn.identify(e.value))&&n?.doc.schema.tags.some(t=>t.tag===rn.tag&&t.default);function ro(n,e,t){let r=io(n,t);if(sn.isSeq(r))for(let i of r.items)_r(n,e,i);else if(Array.isArray(r))for(let i of r)_r(n,e,i);else _r(n,e,r)}function _r(n,e,t){let r=io(n,t);if(!sn.isMap(r))throw new Error("Merge sources must be maps or map aliases");let i=r.toJSON(null,n,Map);for(let[s,o]of i)e instanceof Map?e.has(s)||e.set(s,o):e instanceof Set?e.add(s):Object.prototype.hasOwnProperty.call(e,s)||Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0});return e}function io(n,e){return n&&sn.isAlias(e)?e.resolve(n.doc,n):e}on.addMergeToJSMap=ro;on.isMergeKey=bu;on.merge=rn});var Nr=w(ao=>{"use strict";var Eu=Er(),so=an(),_u=ft(),oo=C(),Tr=ge();function Tu(n,e,{key:t,value:r}){if(oo.isNode(t)&&t.addToJSMap)t.addToJSMap(n,e,r);else if(so.isMergeKey(n,t))so.addMergeToJSMap(n,e,r);else{let i=Tr.toJS(t,"",n);if(e instanceof Map)e.set(i,Tr.toJS(r,i,n));else if(e instanceof Set)e.add(i);else{let s=Nu(t,i,n),o=Tr.toJS(r,s,n);s in e?Object.defineProperty(e,s,{value:o,writable:!0,enumerable:!0,configurable:!0}):e[s]=o}}return e}function Nu(n,e,t){if(e===null)return"";if(typeof e!="object")return String(e);if(oo.isNode(n)&&t?.doc){let r=_u.createStringifyContext(t.doc,{});r.anchors=new Set;for(let s of t.anchors.keys())r.anchors.add(s.anchor);r.inFlow=!0,r.inStringifyKey=!0;let i=n.toString(r);if(!t.mapKeyWarned){let s=JSON.stringify(i);s.length>40&&(s=s.substring(0,36)+'..."'),Eu.warn(t.doc.options.logLevel,`Keys with collection values will be stringified due to JS Object restrictions: ${s}. Set mapAsMap: true to use object keys.`),t.mapKeyWarned=!0}return i}return JSON.stringify(e)}ao.addPairToJSMap=Tu});var _e=w(wr=>{"use strict";var co=at(),wu=eo(),Su=Nr(),cn=C();function vu(n,e,t){let r=co.createNode(n,void 0,t),i=co.createNode(e,void 0,t);return new ln(r,i)}var ln=class n{constructor(e,t=null){Object.defineProperty(this,cn.NODE_TYPE,{value:cn.PAIR}),this.key=e,this.value=t}clone(e){let{key:t,value:r}=this;return cn.isNode(t)&&(t=t.clone(e)),cn.isNode(r)&&(r=r.clone(e)),new n(t,r)}toJSON(e,t){let r=t?.mapAsMap?new Map:{};return Su.addPairToJSMap(t,r,this)}toString(e,t,r){return e?.doc?wu.stringifyPair(this,e,t,r):JSON.stringify(this)}};wr.Pair=ln;wr.createPair=vu});var Sr=w(uo=>{"use strict";var Re=C(),lo=ft(),dn=ct();function ku(n,e,t){return(e.inFlow??n.flow?Lu:Au)(n,e,t)}function Au({comment:n,items:e},t,{blockItemPrefix:r,flowChars:i,itemIndent:s,onChompKeep:o,onComment:a}){let{indent:c,options:{commentString:l}}=t,p=Object.assign({},t,{indent:s,type:null}),d=!1,u=[];for(let y=0;y<e.length;++y){let f=e[y],g=null;if(Re.isNode(f))!d&&f.spaceBefore&&u.push(""),un(t,u,f.commentBefore,d),f.comment&&(g=f.comment);else if(Re.isPair(f)){let b=Re.isNode(f.key)?f.key:null;b&&(!d&&b.spaceBefore&&u.push(""),un(t,u,b.commentBefore,d))}d=!1;let E=lo.stringify(f,p,()=>g=null,()=>d=!0);g&&(E+=dn.lineComment(E,s,l(g))),d&&g&&(d=!1),u.push(r+E)}let m;if(u.length===0)m=i.start+i.end;else{m=u[0];for(let y=1;y<u.length;++y){let f=u[y];m+=f?`
${c}${f}`:`
`}}return n?(m+=`
`+dn.indentComment(l(n),c),a&&a()):d&&o&&o(),m}function Lu({items:n},e,{flowChars:t,itemIndent:r}){let{indent:i,indentStep:s,flowCollectionPadding:o,options:{commentString:a}}=e;r+=s;let c=Object.assign({},e,{indent:r,inFlow:!0,type:null}),l=!1,p=0,d=[];for(let y=0;y<n.length;++y){let f=n[y],g=null;if(Re.isNode(f))f.spaceBefore&&d.push(""),un(e,d,f.commentBefore,!1),f.comment&&(g=f.comment);else if(Re.isPair(f)){let b=Re.isNode(f.key)?f.key:null;b&&(b.spaceBefore&&d.push(""),un(e,d,b.commentBefore,!1),b.comment&&(l=!0));let T=Re.isNode(f.value)?f.value:null;T?(T.comment&&(g=T.comment),T.commentBefore&&(l=!0)):f.value==null&&b?.comment&&(g=b.comment)}g&&(l=!0);let E=lo.stringify(f,c,()=>g=null);l||(l=d.length>p||E.includes(`
`)),y<n.length-1?E+=",":e.options.trailingComma&&(e.options.lineWidth>0&&(l||(l=d.reduce((b,T)=>b+T.length+2,2)+(E.length+2)>e.options.lineWidth)),l&&(E+=",")),g&&(E+=dn.lineComment(E,r,a(g))),d.push(E),p=d.length}let{start:u,end:m}=t;if(d.length===0)return u+m;if(!l){let y=d.reduce((f,g)=>f+g.length+2,2);l=e.options.lineWidth>0&&y>e.options.lineWidth}if(l){let y=u;for(let f of d)y+=f?`
${s}${i}${f}`:`
`;return`${y}
${i}${m}`}else return`${u}${o}${d.join(" ")}${o}${m}`}function un({indent:n,options:{commentString:e}},t,r,i){if(r&&i&&(r=r.replace(/^\n+/,"")),r){let s=dn.indentComment(e(r),n);t.push(s.trimStart())}}uo.stringifyCollection=ku});var Ne=w(kr=>{"use strict";var Ou=Sr(),Ru=Nr(),Iu=Ht(),Te=C(),fn=_e(),xu=F();function mt(n,e){let t=Te.isScalar(e)?e.value:e;for(let r of n)if(Te.isPair(r)&&(r.key===e||r.key===t||Te.isScalar(r.key)&&r.key.value===t))return r}var vr=class extends Iu.Collection{static get tagName(){return"tag:yaml.org,2002:map"}constructor(e){super(Te.MAP,e),this.items=[]}static from(e,t,r){let{keepUndefined:i,replacer:s}=r,o=new this(e),a=(c,l)=>{if(typeof s=="function")l=s.call(t,c,l);else if(Array.isArray(s)&&!s.includes(c))return;(l!==void 0||i)&&o.items.push(fn.createPair(c,l,r))};if(t instanceof Map)for(let[c,l]of t)a(c,l);else if(t&&typeof t=="object")for(let c of Object.keys(t))a(c,t[c]);return typeof e.sortMapEntries=="function"&&o.items.sort(e.sortMapEntries),o}add(e,t){let r;Te.isPair(e)?r=e:!e||typeof e!="object"||!("key"in e)?r=new fn.Pair(e,e?.value):r=new fn.Pair(e.key,e.value);let i=mt(this.items,r.key),s=this.schema?.sortMapEntries;if(i){if(!t)throw new Error(`Key ${r.key} already set`);Te.isScalar(i.value)&&xu.isScalarValue(r.value)?i.value.value=r.value:i.value=r.value}else if(s){let o=this.items.findIndex(a=>s(r,a)<0);o===-1?this.items.push(r):this.items.splice(o,0,r)}else this.items.push(r)}delete(e){let t=mt(this.items,e);return t?this.items.splice(this.items.indexOf(t),1).length>0:!1}get(e,t){let i=mt(this.items,e)?.value;return(!t&&Te.isScalar(i)?i.value:i)??void 0}has(e){return!!mt(this.items,e)}set(e,t){this.add(new fn.Pair(e,t),!0)}toJSON(e,t,r){let i=r?new r:t?.mapAsMap?new Map:{};t?.onCreate&&t.onCreate(i);for(let s of this.items)Ru.addPairToJSMap(t,i,s);return i}toString(e,t,r){if(!e)return JSON.stringify(this);for(let i of this.items)if(!Te.isPair(i))throw new Error(`Map items must all be pairs; found ${JSON.stringify(i)} instead`);return!e.allNullValues&&this.hasAllNullValues(!1)&&(e=Object.assign({},e,{allNullValues:!0})),Ou.stringifyCollection(this,e,{blockItemPrefix:"",flowChars:{start:"{",end:"}"},itemIndent:e.indent||"",onChompKeep:r,onComment:t})}};kr.YAMLMap=vr;kr.findPair=mt});var Ve=w(po=>{"use strict";var Cu=C(),fo=Ne(),Du={collection:"map",default:!0,nodeClass:fo.YAMLMap,tag:"tag:yaml.org,2002:map",resolve(n,e){return Cu.isMap(n)||e("Expected a mapping for this tag"),n},createNode:(n,e,t)=>fo.YAMLMap.from(n,e,t)};po.map=Du});var we=w(mo=>{"use strict";var Pu=at(),qu=Sr(),$u=Ht(),mn=C(),Mu=F(),Uu=ge(),Ar=class extends $u.Collection{static get tagName(){return"tag:yaml.org,2002:seq"}constructor(e){super(mn.SEQ,e),this.items=[]}add(e){this.items.push(e)}delete(e){let t=pn(e);return typeof t!="number"?!1:this.items.splice(t,1).length>0}get(e,t){let r=pn(e);if(typeof r!="number")return;let i=this.items[r];return!t&&mn.isScalar(i)?i.value:i}has(e){let t=pn(e);return typeof t=="number"&&t<this.items.length}set(e,t){let r=pn(e);if(typeof r!="number")throw new Error(`Expected a valid index, not ${e}.`);let i=this.items[r];mn.isScalar(i)&&Mu.isScalarValue(t)?i.value=t:this.items[r]=t}toJSON(e,t){let r=[];t?.onCreate&&t.onCreate(r);let i=0;for(let s of this.items)r.push(Uu.toJS(s,String(i++),t));return r}toString(e,t,r){return e?qu.stringifyCollection(this,e,{blockItemPrefix:"- ",flowChars:{start:"[",end:"]"},itemIndent:(e.indent||"")+"  ",onChompKeep:r,onComment:t}):JSON.stringify(this)}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t)){let o=0;for(let a of t){if(typeof i=="function"){let c=t instanceof Set?a:String(o++);a=i.call(t,c,a)}s.items.push(Pu.createNode(a,void 0,r))}}return s}};function pn(n){let e=mn.isScalar(n)?n.value:n;return e&&typeof e=="string"&&(e=Number(e)),typeof e=="number"&&Number.isInteger(e)&&e>=0?e:null}mo.YAMLSeq=Ar});var Ge=w(go=>{"use strict";var Bu=C(),ho=we(),Fu={collection:"seq",default:!0,nodeClass:ho.YAMLSeq,tag:"tag:yaml.org,2002:seq",resolve(n,e){return Bu.isSeq(n)||e("Expected a sequence for this tag"),n},createNode:(n,e,t)=>ho.YAMLSeq.from(n,e,t)};go.seq=Fu});var ht=w(yo=>{"use strict";var ju=ut(),Ku={identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify(n,e,t,r){return e=Object.assign({actualString:!0},e),ju.stringifyString(n,e,t,r)}};yo.string=Ku});var hn=w(_o=>{"use strict";var bo=F(),Eo={identify:n=>n==null,createNode:()=>new bo.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^(?:~|[Nn]ull|NULL)?$/,resolve:()=>new bo.Scalar(null),stringify:({source:n},e)=>typeof n=="string"&&Eo.test.test(n)?n:e.options.nullStr};_o.nullTag=Eo});var Lr=w(No=>{"use strict";var Xu=F(),To={identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:[Tt]rue|TRUE|[Ff]alse|FALSE)$/,resolve:n=>new Xu.Scalar(n[0]==="t"||n[0]==="T"),stringify({source:n,value:e},t){if(n&&To.test.test(n)){let r=n[0]==="t"||n[0]==="T";if(e===r)return n}return e?t.options.trueStr:t.options.falseStr}};No.boolTag=To});var Je=w(wo=>{"use strict";function zu({format:n,minFractionDigits:e,tag:t,value:r}){if(typeof r=="bigint")return String(r);let i=typeof r=="number"?r:Number(r);if(!isFinite(i))return isNaN(i)?".nan":i<0?"-.inf":".inf";let s=Object.is(r,-0)?"-0":JSON.stringify(r);if(!n&&e&&(!t||t==="tag:yaml.org,2002:float")&&/^-?\d/.test(s)&&!s.includes("e")){let o=s.indexOf(".");o<0&&(o=s.length,s+=".");let a=e-(s.length-o-1);for(;a-- >0;)s+="0"}return s}wo.stringifyNumber=zu});var Rr=w(gn=>{"use strict";var Yu=F(),Or=Je(),Vu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:Or.stringifyNumber},Gu={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:\.[0-9]+|[0-9]+(?:\.[0-9]*)?)[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():Or.stringifyNumber(n)}},Ju={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:\.[0-9]+|[0-9]+\.[0-9]*)$/,resolve(n){let e=new Yu.Scalar(parseFloat(n)),t=n.indexOf(".");return t!==-1&&n[n.length-1]==="0"&&(e.minFractionDigits=n.length-t-1),e},stringify:Or.stringifyNumber};gn.float=Ju;gn.floatExp=Gu;gn.floatNaN=Vu});var xr=w(bn=>{"use strict";var So=Je(),yn=n=>typeof n=="bigint"||Number.isInteger(n),Ir=(n,e,t,{intAsBigInt:r})=>r?BigInt(n):parseInt(n.substring(e),t);function vo(n,e,t){let{value:r}=n;return yn(r)&&r>=0?t+r.toString(e):So.stringifyNumber(n)}var Hu={identify:n=>yn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^0o[0-7]+$/,resolve:(n,e,t)=>Ir(n,2,8,t),stringify:n=>vo(n,8,"0o")},Wu={identify:yn,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9]+$/,resolve:(n,e,t)=>Ir(n,0,10,t),stringify:So.stringifyNumber},Zu={identify:n=>yn(n)&&n>=0,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^0x[0-9a-fA-F]+$/,resolve:(n,e,t)=>Ir(n,2,16,t),stringify:n=>vo(n,16,"0x")};bn.int=Wu;bn.intHex=Zu;bn.intOct=Hu});var Ao=w(ko=>{"use strict";var Qu=Ve(),ef=hn(),tf=Ge(),nf=ht(),rf=Lr(),Cr=Rr(),Dr=xr(),sf=[Qu.map,tf.seq,nf.string,ef.nullTag,rf.boolTag,Dr.intOct,Dr.int,Dr.intHex,Cr.floatNaN,Cr.floatExp,Cr.float];ko.schema=sf});var Ro=w(Oo=>{"use strict";var of=F(),af=Ve(),cf=Ge();function Lo(n){return typeof n=="bigint"||Number.isInteger(n)}var En=({value:n})=>JSON.stringify(n),lf=[{identify:n=>typeof n=="string",default:!0,tag:"tag:yaml.org,2002:str",resolve:n=>n,stringify:En},{identify:n=>n==null,createNode:()=>new of.Scalar(null),default:!0,tag:"tag:yaml.org,2002:null",test:/^null$/,resolve:()=>null,stringify:En},{identify:n=>typeof n=="boolean",default:!0,tag:"tag:yaml.org,2002:bool",test:/^true$|^false$/,resolve:n=>n==="true",stringify:En},{identify:Lo,default:!0,tag:"tag:yaml.org,2002:int",test:/^-?(?:0|[1-9][0-9]*)$/,resolve:(n,e,{intAsBigInt:t})=>t?BigInt(n):parseInt(n,10),stringify:({value:n})=>Lo(n)?n.toString():JSON.stringify(n)},{identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^-?(?:0|[1-9][0-9]*)(?:\.[0-9]*)?(?:[eE][-+]?[0-9]+)?$/,resolve:n=>parseFloat(n),stringify:En}],df={default:!0,tag:"",test:/^/,resolve(n,e){return e(`Unresolved plain scalar ${JSON.stringify(n)}`),n}},uf=[af.map,cf.seq].concat(lf,df);Oo.schema=uf});var qr=w(Io=>{"use strict";var gt=Mt("buffer"),Pr=F(),ff=ut(),pf={identify:n=>n instanceof Uint8Array,default:!1,tag:"tag:yaml.org,2002:binary",resolve(n,e){if(typeof gt.Buffer=="function")return gt.Buffer.from(n,"base64");if(typeof atob=="function"){let t=atob(n.replace(/[\n\r]/g,"")),r=new Uint8Array(t.length);for(let i=0;i<t.length;++i)r[i]=t.charCodeAt(i);return r}else return e("This environment does not support reading binary tags; either Buffer or atob is required"),n},stringify({comment:n,type:e,value:t},r,i,s){if(!t)return"";let o=t,a;if(typeof gt.Buffer=="function")a=o instanceof gt.Buffer?o.toString("base64"):gt.Buffer.from(o.buffer).toString("base64");else if(typeof btoa=="function"){let c="";for(let l=0;l<o.length;++l)c+=String.fromCharCode(o[l]);a=btoa(c)}else throw new Error("This environment does not support writing binary tags; either Buffer or btoa is required");if(e??(e=Pr.Scalar.BLOCK_LITERAL),e!==Pr.Scalar.QUOTE_DOUBLE){let c=Math.max(r.options.lineWidth-r.indent.length,r.options.minContentWidth),l=Math.ceil(a.length/c),p=new Array(l);for(let d=0,u=0;d<l;++d,u+=c)p[d]=a.substr(u,c);a=p.join(e===Pr.Scalar.BLOCK_LITERAL?`
`:" ")}return ff.stringifyString({comment:n,type:e,value:a},r,i,s)}};Io.binary=pf});var Nn=w(Tn=>{"use strict";var _n=C(),$r=_e(),mf=F(),hf=we();function xo(n,e){if(_n.isSeq(n))for(let t=0;t<n.items.length;++t){let r=n.items[t];if(!_n.isPair(r)){if(_n.isMap(r)){r.items.length>1&&e("Each pair must have its own sequence indicator");let i=r.items[0]||new $r.Pair(new mf.Scalar(null));if(r.commentBefore&&(i.key.commentBefore=i.key.commentBefore?`${r.commentBefore}
${i.key.commentBefore}`:r.commentBefore),r.comment){let s=i.value??i.key;s.comment=s.comment?`${r.comment}
${s.comment}`:r.comment}r=i}n.items[t]=_n.isPair(r)?r:new $r.Pair(r)}}else e("Expected a sequence for this tag");return n}function Co(n,e,t){let{replacer:r}=t,i=new hf.YAMLSeq(n);i.tag="tag:yaml.org,2002:pairs";let s=0;if(e&&Symbol.iterator in Object(e))for(let o of e){typeof r=="function"&&(o=r.call(e,String(s++),o));let a,c;if(Array.isArray(o))if(o.length===2)a=o[0],c=o[1];else throw new TypeError(`Expected [key, value] tuple: ${o}`);else if(o&&o instanceof Object){let l=Object.keys(o);if(l.length===1)a=l[0],c=o[a];else throw new TypeError(`Expected tuple with one key, not ${l.length} keys`)}else a=o;i.items.push($r.createPair(a,c,t))}return i}var gf={collection:"seq",default:!1,tag:"tag:yaml.org,2002:pairs",resolve:xo,createNode:Co};Tn.createPairs=Co;Tn.pairs=gf;Tn.resolvePairs=xo});var Br=w(Ur=>{"use strict";var Do=C(),Mr=ge(),yt=Ne(),yf=we(),Po=Nn(),Ie=class n extends yf.YAMLSeq{constructor(){super(),this.add=yt.YAMLMap.prototype.add.bind(this),this.delete=yt.YAMLMap.prototype.delete.bind(this),this.get=yt.YAMLMap.prototype.get.bind(this),this.has=yt.YAMLMap.prototype.has.bind(this),this.set=yt.YAMLMap.prototype.set.bind(this),this.tag=n.tag}toJSON(e,t){if(!t)return super.toJSON(e);let r=new Map;t?.onCreate&&t.onCreate(r);for(let i of this.items){let s,o;if(Do.isPair(i)?(s=Mr.toJS(i.key,"",t),o=Mr.toJS(i.value,s,t)):s=Mr.toJS(i,"",t),r.has(s))throw new Error("Ordered maps must not include duplicate keys");r.set(s,o)}return r}static from(e,t,r){let i=Po.createPairs(e,t,r),s=new this;return s.items=i.items,s}};Ie.tag="tag:yaml.org,2002:omap";var bf={collection:"seq",identify:n=>n instanceof Map,nodeClass:Ie,default:!1,tag:"tag:yaml.org,2002:omap",resolve(n,e){let t=Po.resolvePairs(n,e),r=[];for(let{key:i}of t.items)Do.isScalar(i)&&(r.includes(i.value)?e(`Ordered maps must not include duplicate keys: ${i.value}`):r.push(i.value));return Object.assign(new Ie,t)},createNode:(n,e,t)=>Ie.from(n,e,t)};Ur.YAMLOMap=Ie;Ur.omap=bf});var Bo=w(Fr=>{"use strict";var qo=F();function $o({value:n,source:e},t){return e&&(n?Mo:Uo).test.test(e)?e:n?t.options.trueStr:t.options.falseStr}var Mo={identify:n=>n===!0,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:Y|y|[Yy]es|YES|[Tt]rue|TRUE|[Oo]n|ON)$/,resolve:()=>new qo.Scalar(!0),stringify:$o},Uo={identify:n=>n===!1,default:!0,tag:"tag:yaml.org,2002:bool",test:/^(?:N|n|[Nn]o|NO|[Ff]alse|FALSE|[Oo]ff|OFF)$/,resolve:()=>new qo.Scalar(!1),stringify:$o};Fr.falseTag=Uo;Fr.trueTag=Mo});var Fo=w(wn=>{"use strict";var Ef=F(),jr=Je(),_f={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^(?:[-+]?\.(?:inf|Inf|INF)|\.nan|\.NaN|\.NAN)$/,resolve:n=>n.slice(-3).toLowerCase()==="nan"?NaN:n[0]==="-"?Number.NEGATIVE_INFINITY:Number.POSITIVE_INFINITY,stringify:jr.stringifyNumber},Tf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"EXP",test:/^[-+]?(?:[0-9][0-9_]*)?(?:\.[0-9_]*)?[eE][-+]?[0-9]+$/,resolve:n=>parseFloat(n.replace(/_/g,"")),stringify(n){let e=Number(n.value);return isFinite(e)?e.toExponential():jr.stringifyNumber(n)}},Nf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",test:/^[-+]?(?:[0-9][0-9_]*)?\.[0-9_]*$/,resolve(n){let e=new Ef.Scalar(parseFloat(n.replace(/_/g,""))),t=n.indexOf(".");if(t!==-1){let r=n.substring(t+1).replace(/_/g,"");r[r.length-1]==="0"&&(e.minFractionDigits=r.length)}return e},stringify:jr.stringifyNumber};wn.float=Nf;wn.floatExp=Tf;wn.floatNaN=_f});var Ko=w(Et=>{"use strict";var jo=Je(),bt=n=>typeof n=="bigint"||Number.isInteger(n);function Sn(n,e,t,{intAsBigInt:r}){let i=n[0];if((i==="-"||i==="+")&&(e+=1),n=n.substring(e).replace(/_/g,""),r){switch(t){case 2:n=`0b${n}`;break;case 8:n=`0o${n}`;break;case 16:n=`0x${n}`;break}let o=BigInt(n);return i==="-"?BigInt(-1)*o:o}let s=parseInt(n,t);return i==="-"?-1*s:s}function Kr(n,e,t){let{value:r}=n;if(bt(r)){let i=r.toString(e);return r<0?"-"+t+i.substr(1):t+i}return jo.stringifyNumber(n)}var wf={identify:bt,default:!0,tag:"tag:yaml.org,2002:int",format:"BIN",test:/^[-+]?0b[0-1_]+$/,resolve:(n,e,t)=>Sn(n,2,2,t),stringify:n=>Kr(n,2,"0b")},Sf={identify:bt,default:!0,tag:"tag:yaml.org,2002:int",format:"OCT",test:/^[-+]?0[0-7_]+$/,resolve:(n,e,t)=>Sn(n,1,8,t),stringify:n=>Kr(n,8,"0")},vf={identify:bt,default:!0,tag:"tag:yaml.org,2002:int",test:/^[-+]?[0-9][0-9_]*$/,resolve:(n,e,t)=>Sn(n,0,10,t),stringify:jo.stringifyNumber},kf={identify:bt,default:!0,tag:"tag:yaml.org,2002:int",format:"HEX",test:/^[-+]?0x[0-9a-fA-F_]+$/,resolve:(n,e,t)=>Sn(n,2,16,t),stringify:n=>Kr(n,16,"0x")};Et.int=vf;Et.intBin=wf;Et.intHex=kf;Et.intOct=Sf});var zr=w(Xr=>{"use strict";var An=C(),vn=_e(),kn=Ne(),xe=class n extends kn.YAMLMap{constructor(e){super(e),this.tag=n.tag}add(e){let t;An.isPair(e)?t=e:e&&typeof e=="object"&&"key"in e&&"value"in e&&e.value===null?t=new vn.Pair(e.key,null):t=new vn.Pair(e,null),kn.findPair(this.items,t.key)||this.items.push(t)}get(e,t){let r=kn.findPair(this.items,e);return!t&&An.isPair(r)?An.isScalar(r.key)?r.key.value:r.key:r}set(e,t){if(typeof t!="boolean")throw new Error(`Expected boolean value for set(key, value) in a YAML set, not ${typeof t}`);let r=kn.findPair(this.items,e);r&&!t?this.items.splice(this.items.indexOf(r),1):!r&&t&&this.items.push(new vn.Pair(e))}toJSON(e,t){return super.toJSON(e,t,Set)}toString(e,t,r){if(!e)return JSON.stringify(this);if(this.hasAllNullValues(!0))return super.toString(Object.assign({},e,{allNullValues:!0}),t,r);throw new Error("Set items must all have null values")}static from(e,t,r){let{replacer:i}=r,s=new this(e);if(t&&Symbol.iterator in Object(t))for(let o of t)typeof i=="function"&&(o=i.call(t,o,o)),s.items.push(vn.createPair(o,null,r));return s}};xe.tag="tag:yaml.org,2002:set";var Af={collection:"map",identify:n=>n instanceof Set,nodeClass:xe,default:!1,tag:"tag:yaml.org,2002:set",createNode:(n,e,t)=>xe.from(n,e,t),resolve(n,e){if(An.isMap(n)){if(n.hasAllNullValues(!0))return Object.assign(new xe,n);e("Set items must all have null values")}else e("Expected a mapping for this tag");return n}};Xr.YAMLSet=xe;Xr.set=Af});var Vr=w(Ln=>{"use strict";var Lf=Je();function Yr(n,e){let t=n[0],r=t==="-"||t==="+"?n.substring(1):n,i=o=>e?BigInt(o):Number(o),s=r.replace(/_/g,"").split(":").reduce((o,a)=>o*i(60)+i(a),i(0));return t==="-"?i(-1)*s:s}function Xo(n){let{value:e}=n,t=o=>o;if(typeof e=="bigint")t=o=>BigInt(o);else if(isNaN(e)||!isFinite(e))return Lf.stringifyNumber(n);let r="";e<0&&(r="-",e*=t(-1));let i=t(60),s=[e%i];return e<60?s.unshift(0):(e=(e-s[0])/i,s.unshift(e%i),e>=60&&(e=(e-s[0])/i,s.unshift(e))),r+s.map(o=>String(o).padStart(2,"0")).join(":").replace(/000000\d*$/,"")}var Of={identify:n=>typeof n=="bigint"||Number.isInteger(n),default:!0,tag:"tag:yaml.org,2002:int",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+$/,resolve:(n,e,{intAsBigInt:t})=>Yr(n,t),stringify:Xo},Rf={identify:n=>typeof n=="number",default:!0,tag:"tag:yaml.org,2002:float",format:"TIME",test:/^[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\.[0-9_]*$/,resolve:n=>Yr(n,!1),stringify:Xo},zo={identify:n=>n instanceof Date,default:!0,tag:"tag:yaml.org,2002:timestamp",test:RegExp("^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})(?:(?:t|T|[ \\t]+)([0-9]{1,2}):([0-9]{1,2}):([0-9]{1,2}(\\.[0-9]+)?)(?:[ \\t]*(Z|[-+][012]?[0-9](?::[0-9]{2})?))?)?$"),resolve(n){let e=n.match(zo.test);if(!e)throw new Error("!!timestamp expects a date, starting with yyyy-mm-dd");let[,t,r,i,s,o,a]=e.map(Number),c=e[7]?Number((e[7]+"00").substr(1,3)):0,l=Date.UTC(t,r-1,i,s||0,o||0,a||0,c),p=e[8];if(p&&p!=="Z"){let d=Yr(p,!1);Math.abs(d)<30&&(d*=60),l-=6e4*d}return new Date(l)},stringify:({value:n})=>n?.toISOString().replace(/(T00:00:00)?\.000Z$/,"")??""};Ln.floatTime=Rf;Ln.intTime=Of;Ln.timestamp=zo});var Go=w(Vo=>{"use strict";var If=Ve(),xf=hn(),Cf=Ge(),Df=ht(),Pf=qr(),Yo=Bo(),Gr=Fo(),On=Ko(),qf=an(),$f=Br(),Mf=Nn(),Uf=zr(),Jr=Vr(),Bf=[If.map,Cf.seq,Df.string,xf.nullTag,Yo.trueTag,Yo.falseTag,On.intBin,On.intOct,On.int,On.intHex,Gr.floatNaN,Gr.floatExp,Gr.float,Pf.binary,qf.merge,$f.omap,Mf.pairs,Uf.set,Jr.intTime,Jr.floatTime,Jr.timestamp];Vo.schema=Bf});var ia=w(Zr=>{"use strict";var Zo=Ve(),Ff=hn(),Qo=Ge(),jf=ht(),Kf=Lr(),Hr=Rr(),Wr=xr(),Xf=Ao(),zf=Ro(),ea=qr(),_t=an(),ta=Br(),na=Nn(),Jo=Go(),ra=zr(),Rn=Vr(),Ho=new Map([["core",Xf.schema],["failsafe",[Zo.map,Qo.seq,jf.string]],["json",zf.schema],["yaml11",Jo.schema],["yaml-1.1",Jo.schema]]),Wo={binary:ea.binary,bool:Kf.boolTag,float:Hr.float,floatExp:Hr.floatExp,floatNaN:Hr.floatNaN,floatTime:Rn.floatTime,int:Wr.int,intHex:Wr.intHex,intOct:Wr.intOct,intTime:Rn.intTime,map:Zo.map,merge:_t.merge,null:Ff.nullTag,omap:ta.omap,pairs:na.pairs,seq:Qo.seq,set:ra.set,timestamp:Rn.timestamp},Yf={"tag:yaml.org,2002:binary":ea.binary,"tag:yaml.org,2002:merge":_t.merge,"tag:yaml.org,2002:omap":ta.omap,"tag:yaml.org,2002:pairs":na.pairs,"tag:yaml.org,2002:set":ra.set,"tag:yaml.org,2002:timestamp":Rn.timestamp};function Vf(n,e,t){let r=Ho.get(e);if(r&&!n)return t&&!r.includes(_t.merge)?r.concat(_t.merge):r.slice();let i=r;if(!i)if(Array.isArray(n))i=[];else{let s=Array.from(Ho.keys()).filter(o=>o!=="yaml11").map(o=>JSON.stringify(o)).join(", ");throw new Error(`Unknown schema "${e}"; use one of ${s} or define customTags array`)}if(Array.isArray(n))for(let s of n)i=i.concat(s);else typeof n=="function"&&(i=n(i.slice()));return t&&(i=i.concat(_t.merge)),i.reduce((s,o)=>{let a=typeof o=="string"?Wo[o]:o;if(!a){let c=JSON.stringify(o),l=Object.keys(Wo).map(p=>JSON.stringify(p)).join(", ");throw new Error(`Unknown custom tag ${c}; use one of ${l}`)}return s.includes(a)||s.push(a),s},[])}Zr.coreKnownTags=Yf;Zr.getTags=Vf});var ti=w(sa=>{"use strict";var Qr=C(),Gf=Ve(),Jf=Ge(),Hf=ht(),In=ia(),Wf=(n,e)=>n.key<e.key?-1:n.key>e.key?1:0,ei=class n{constructor({compat:e,customTags:t,merge:r,resolveKnownTags:i,schema:s,sortMapEntries:o,toStringDefaults:a}){this.compat=Array.isArray(e)?In.getTags(e,"compat"):e?In.getTags(null,e):null,this.name=typeof s=="string"&&s||"core",this.knownTags=i?In.coreKnownTags:{},this.tags=In.getTags(t,this.name,r),this.toStringOptions=a??null,Object.defineProperty(this,Qr.MAP,{value:Gf.map}),Object.defineProperty(this,Qr.SCALAR,{value:Hf.string}),Object.defineProperty(this,Qr.SEQ,{value:Jf.seq}),this.sortMapEntries=typeof o=="function"?o:o===!0?Wf:null}clone(){let e=Object.create(n.prototype,Object.getOwnPropertyDescriptors(this));return e.tags=this.tags.slice(),e}};sa.Schema=ei});var aa=w(oa=>{"use strict";var Zf=C(),ni=ft(),Tt=ct();function Qf(n,e){let t=[],r=e.directives===!0;if(e.directives!==!1&&n.directives){let c=n.directives.toString(n);c?(t.push(c),r=!0):n.directives.docStart&&(r=!0)}r&&t.push("---");let i=ni.createStringifyContext(n,e),{commentString:s}=i.options;if(n.commentBefore){t.length!==1&&t.unshift("");let c=s(n.commentBefore);t.unshift(Tt.indentComment(c,""))}let o=!1,a=null;if(n.contents){if(Zf.isNode(n.contents)){if(n.contents.spaceBefore&&r&&t.push(""),n.contents.commentBefore){let p=s(n.contents.commentBefore);t.push(Tt.indentComment(p,""))}i.forceBlockIndent=!!n.comment,a=n.contents.comment}let c=a?void 0:()=>o=!0,l=ni.stringify(n.contents,i,()=>a=null,c);a&&(l+=Tt.lineComment(l,"",s(a))),(l[0]==="|"||l[0]===">")&&t[t.length-1]==="---"?t[t.length-1]=`--- ${l}`:t.push(l)}else t.push(ni.stringify(n.contents,i));if(n.directives?.docEnd)if(n.comment){let c=s(n.comment);c.includes(`
`)?(t.push("..."),t.push(Tt.indentComment(c,""))):t.push(`... ${c}`)}else t.push("...");else{let c=n.comment;c&&o&&(c=c.replace(/^\n+/,"")),c&&((!o||a)&&t[t.length-1]!==""&&t.push(""),t.push(Tt.indentComment(s(c),"")))}return t.join(`
`)+`
`}oa.stringifyDocument=Qf});var Nt=w(ca=>{"use strict";var ep=ot(),He=Ht(),te=C(),tp=_e(),np=ge(),rp=ti(),ip=aa(),ri=Yt(),sp=ar(),op=at(),ii=or(),si=class n{constructor(e,t,r){this.commentBefore=null,this.comment=null,this.errors=[],this.warnings=[],Object.defineProperty(this,te.NODE_TYPE,{value:te.DOC});let i=null;typeof t=="function"||Array.isArray(t)?i=t:r===void 0&&t&&(r=t,t=void 0);let s=Object.assign({intAsBigInt:!1,keepSourceTokens:!1,logLevel:"warn",prettyErrors:!0,strict:!0,stringKeys:!1,uniqueKeys:!0,version:"1.2"},r);this.options=s;let{version:o}=s;r?._directives?(this.directives=r._directives.atDocument(),this.directives.yaml.explicit&&(o=this.directives.yaml.version)):this.directives=new ii.Directives({version:o}),this.setSchema(o,r),this.contents=e===void 0?null:this.createNode(e,i,r)}clone(){let e=Object.create(n.prototype,{[te.NODE_TYPE]:{value:te.DOC}});return e.commentBefore=this.commentBefore,e.comment=this.comment,e.errors=this.errors.slice(),e.warnings=this.warnings.slice(),e.options=Object.assign({},this.options),this.directives&&(e.directives=this.directives.clone()),e.schema=this.schema.clone(),e.contents=te.isNode(this.contents)?this.contents.clone(e.schema):this.contents,this.range&&(e.range=this.range.slice()),e}add(e){We(this.contents)&&this.contents.add(e)}addIn(e,t){We(this.contents)&&this.contents.addIn(e,t)}createAlias(e,t){if(!e.anchor){let r=ri.anchorNames(this);e.anchor=!t||r.has(t)?ri.findNewAnchor(t||"a",r):t}return new ep.Alias(e.anchor)}createNode(e,t,r){let i;if(typeof t=="function")e=t.call({"":e},"",e),i=t;else if(Array.isArray(t)){let g=b=>typeof b=="number"||b instanceof String||b instanceof Number,E=t.filter(g).map(String);E.length>0&&(t=t.concat(E)),i=t}else r===void 0&&t&&(r=t,t=void 0);let{aliasDuplicateObjects:s,anchorPrefix:o,flow:a,keepUndefined:c,onTagObj:l,tag:p}=r??{},{onAnchor:d,setAnchors:u,sourceObjects:m}=ri.createNodeAnchors(this,o||"a"),y={aliasDuplicateObjects:s??!0,keepUndefined:c??!1,onAnchor:d,onTagObj:l,replacer:i,schema:this.schema,sourceObjects:m},f=op.createNode(e,p,y);return a&&te.isCollection(f)&&(f.flow=!0),u(),f}createPair(e,t,r={}){let i=this.createNode(e,null,r),s=this.createNode(t,null,r);return new tp.Pair(i,s)}delete(e){return We(this.contents)?this.contents.delete(e):!1}deleteIn(e){return He.isEmptyPath(e)?this.contents==null?!1:(this.contents=null,!0):We(this.contents)?this.contents.deleteIn(e):!1}get(e,t){return te.isCollection(this.contents)?this.contents.get(e,t):void 0}getIn(e,t){return He.isEmptyPath(e)?!t&&te.isScalar(this.contents)?this.contents.value:this.contents:te.isCollection(this.contents)?this.contents.getIn(e,t):void 0}has(e){return te.isCollection(this.contents)?this.contents.has(e):!1}hasIn(e){return He.isEmptyPath(e)?this.contents!==void 0:te.isCollection(this.contents)?this.contents.hasIn(e):!1}set(e,t){this.contents==null?this.contents=He.collectionFromPath(this.schema,[e],t):We(this.contents)&&this.contents.set(e,t)}setIn(e,t){He.isEmptyPath(e)?this.contents=t:this.contents==null?this.contents=He.collectionFromPath(this.schema,Array.from(e),t):We(this.contents)&&this.contents.setIn(e,t)}setSchema(e,t={}){typeof e=="number"&&(e=String(e));let r;switch(e){case"1.1":this.directives?this.directives.yaml.version="1.1":this.directives=new ii.Directives({version:"1.1"}),r={resolveKnownTags:!1,schema:"yaml-1.1"};break;case"1.2":case"next":this.directives?this.directives.yaml.version=e:this.directives=new ii.Directives({version:e}),r={resolveKnownTags:!0,schema:"core"};break;case null:this.directives&&delete this.directives,r=null;break;default:{let i=JSON.stringify(e);throw new Error(`Expected '1.1', '1.2' or null as first argument, but found: ${i}`)}}if(t.schema instanceof Object)this.schema=t.schema;else if(r)this.schema=new rp.Schema(Object.assign(r,t));else throw new Error("With a null YAML version, the { schema: Schema } option is required")}toJS({json:e,jsonArg:t,mapAsMap:r,maxAliasCount:i,onAnchor:s,reviver:o}={}){let a={anchors:new Map,doc:this,keep:!e,mapAsMap:r===!0,mapKeyWarned:!1,maxAliasCount:typeof i=="number"?i:100},c=np.toJS(this.contents,t??"",a);if(typeof s=="function")for(let{count:l,res:p}of a.anchors.values())s(p,l);return typeof o=="function"?sp.applyReviver(o,{"":c},"",c):c}toJSON(e,t){return this.toJS({json:!0,jsonArg:e,mapAsMap:!1,onAnchor:t})}toString(e={}){if(this.errors.length>0)throw new Error("Document with errors cannot be stringified");if("indent"in e&&(!Number.isInteger(e.indent)||Number(e.indent)<=0)){let t=JSON.stringify(e.indent);throw new Error(`"indent" option must be a positive integer, not ${t}`)}return ip.stringifyDocument(this,e)}};function We(n){if(te.isCollection(n))return!0;throw new Error("Expected a YAML collection as document contents")}ca.Document=si});var vt=w(St=>{"use strict";var wt=class extends Error{constructor(e,t,r,i){super(),this.name=e,this.code=r,this.message=i,this.pos=t}},oi=class extends wt{constructor(e,t,r){super("YAMLParseError",e,t,r)}},ai=class extends wt{constructor(e,t,r){super("YAMLWarning",e,t,r)}},ap=(n,e)=>t=>{if(t.pos[0]===-1)return;t.linePos=t.pos.map(a=>e.linePos(a));let{line:r,col:i}=t.linePos[0];t.message+=` at line ${r}, column ${i}`;let s=i-1,o=n.substring(e.lineStarts[r-1],e.lineStarts[r]).replace(/[\n\r]+$/,"");if(s>=60&&o.length>80){let a=Math.min(s-39,o.length-79);o="\u2026"+o.substring(a),s-=a-1}if(o.length>80&&(o=o.substring(0,79)+"\u2026"),r>1&&/^ *$/.test(o.substring(0,s))){let a=n.substring(e.lineStarts[r-2],e.lineStarts[r-1]);a.length>80&&(a=a.substring(0,79)+`\u2026
`),o=a+o}if(/[^ ]/.test(o)){let a=1,c=t.linePos[1];c?.line===r&&c.col>i&&(a=Math.max(1,Math.min(c.col-i,80-s)));let l=" ".repeat(s)+"^".repeat(a);t.message+=`:

${o}
${l}
`}};St.YAMLError=wt;St.YAMLParseError=oi;St.YAMLWarning=ai;St.prettifyError=ap});var kt=w(la=>{"use strict";function cp(n,{flow:e,indicator:t,next:r,offset:i,onError:s,parentIndent:o,startOnNewline:a}){let c=!1,l=a,p=a,d="",u="",m=!1,y=!1,f=null,g=null,E=null,b=null,T=null,N=null,S=null;for(let _ of n)switch(y&&(_.type!=="space"&&_.type!=="newline"&&_.type!=="comma"&&s(_.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),y=!1),f&&(l&&_.type!=="comment"&&_.type!=="newline"&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),f=null),_.type){case"space":!e&&(t!=="doc-start"||r?.type!=="flow-collection")&&_.source.includes("	")&&(f=_),p=!0;break;case"comment":{p||s(_,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let v=_.source.substring(1)||" ";d?d+=u+v:d=v,u="",l=!1;break}case"newline":l?d?d+=_.source:(!N||t!=="seq-item-ind")&&(c=!0):u+=_.source,l=!0,m=!0,(g||E)&&(b=_),p=!0;break;case"anchor":g&&s(_,"MULTIPLE_ANCHORS","A node can have at most one anchor"),_.source.endsWith(":")&&s(_.offset+_.source.length-1,"BAD_ALIAS","Anchor ending in : is ambiguous",!0),g=_,S??(S=_.offset),l=!1,p=!1,y=!0;break;case"tag":{E&&s(_,"MULTIPLE_TAGS","A node can have at most one tag"),E=_,S??(S=_.offset),l=!1,p=!1,y=!0;break}case t:(g||E)&&s(_,"BAD_PROP_ORDER",`Anchors and tags must be after the ${_.source} indicator`),N&&s(_,"UNEXPECTED_TOKEN",`Unexpected ${_.source} in ${e??"collection"}`),N=_,l=t==="seq-item-ind"||t==="explicit-key-ind",p=!1;break;case"comma":if(e){T&&s(_,"UNEXPECTED_TOKEN",`Unexpected , in ${e}`),T=_,l=!1,p=!1;break}default:s(_,"UNEXPECTED_TOKEN",`Unexpected ${_.type} token`),l=!1,p=!1}let k=n[n.length-1],A=k?k.offset+k.source.length:i;return y&&r&&r.type!=="space"&&r.type!=="newline"&&r.type!=="comma"&&(r.type!=="scalar"||r.source!=="")&&s(r.offset,"MISSING_CHAR","Tags and anchors must be separated from the next token by white space"),f&&(l&&f.indent<=o||r?.type==="block-map"||r?.type==="block-seq")&&s(f,"TAB_AS_INDENT","Tabs are not allowed as indentation"),{comma:T,found:N,spaceBefore:c,comment:d,hasNewline:m,anchor:g,tag:E,newlineAfterProp:b,end:A,start:S??A}}la.resolveProps=cp});var xn=w(da=>{"use strict";function ci(n){if(!n)return null;switch(n.type){case"alias":case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":if(n.source.includes(`
`))return!0;if(n.end){for(let e of n.end)if(e.type==="newline")return!0}return!1;case"flow-collection":for(let e of n.items){for(let t of e.start)if(t.type==="newline")return!0;if(e.sep){for(let t of e.sep)if(t.type==="newline")return!0}if(ci(e.key)||ci(e.value))return!0}return!1;default:return!0}}da.containsNewline=ci});var li=w(ua=>{"use strict";var lp=xn();function dp(n,e,t){if(e?.type==="flow-collection"){let r=e.end[0];r.indent===n&&(r.source==="]"||r.source==="}")&&lp.containsNewline(e)&&t(r,"BAD_INDENT","Flow end indicator should be more indented than parent",!0)}}ua.flowIndentCheck=dp});var di=w(pa=>{"use strict";var fa=C();function up(n,e,t){let{uniqueKeys:r}=n.options;if(r===!1)return!1;let i=typeof r=="function"?r:(s,o)=>s===o||fa.isScalar(s)&&fa.isScalar(o)&&s.value===o.value;return e.some(s=>i(s.key,t))}pa.mapIncludes=up});var Ea=w(ba=>{"use strict";var ma=_e(),fp=Ne(),ha=kt(),pp=xn(),ga=li(),mp=di(),ya="All mapping items must start at the same column";function hp({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??fp.YAMLMap,a=new o(t.schema);t.atRoot&&(t.atRoot=!1);let c=r.offset,l=null;for(let p of r.items){let{start:d,key:u,sep:m,value:y}=p,f=ha.resolveProps(d,{indicator:"explicit-key-ind",next:u??m?.[0],offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0}),g=!f.found;if(g){if(u&&(u.type==="block-seq"?i(c,"BLOCK_AS_IMPLICIT_KEY","A block sequence may not be used as an implicit map key"):"indent"in u&&u.indent!==r.indent&&i(c,"BAD_INDENT",ya)),!f.anchor&&!f.tag&&!m){l=f.end,f.comment&&(a.comment?a.comment+=`
`+f.comment:a.comment=f.comment);continue}(f.newlineAfterProp||pp.containsNewline(u))&&i(u??d[d.length-1],"MULTILINE_IMPLICIT_KEY","Implicit keys need to be on a single line")}else f.found?.indent!==r.indent&&i(c,"BAD_INDENT",ya);t.atKey=!0;let E=f.end,b=u?n(t,u,f,i):e(t,E,d,null,f,i);t.schema.compat&&ga.flowIndentCheck(r.indent,u,i),t.atKey=!1,mp.mapIncludes(t,a.items,b)&&i(E,"DUPLICATE_KEY","Map keys must be unique");let T=ha.resolveProps(m??[],{indicator:"map-value-ind",next:y,offset:b.range[2],onError:i,parentIndent:r.indent,startOnNewline:!u||u.type==="block-scalar"});if(c=T.end,T.found){g&&(y?.type==="block-map"&&!T.hasNewline&&i(c,"BLOCK_AS_IMPLICIT_KEY","Nested mappings are not allowed in compact mappings"),t.options.strict&&f.start<T.found.offset-1024&&i(b.range,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit block mapping key"));let N=y?n(t,y,T,i):e(t,c,m,null,T,i);t.schema.compat&&ga.flowIndentCheck(r.indent,y,i),c=N.range[2];let S=new ma.Pair(b,N);t.options.keepSourceTokens&&(S.srcToken=p),a.items.push(S)}else{g&&i(b.range,"MISSING_CHAR","Implicit map keys need to be followed by map values"),T.comment&&(b.comment?b.comment+=`
`+T.comment:b.comment=T.comment);let N=new ma.Pair(b);t.options.keepSourceTokens&&(N.srcToken=p),a.items.push(N)}}return l&&l<c&&i(l,"IMPOSSIBLE","Map comment with trailing content"),a.range=[r.offset,c,l??c],a}ba.resolveBlockMap=hp});var Ta=w(_a=>{"use strict";var gp=we(),yp=kt(),bp=li();function Ep({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=s?.nodeClass??gp.YAMLSeq,a=new o(t.schema);t.atRoot&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let c=r.offset,l=null;for(let{start:p,value:d}of r.items){let u=yp.resolveProps(p,{indicator:"seq-item-ind",next:d,offset:c,onError:i,parentIndent:r.indent,startOnNewline:!0});if(!u.found)if(u.anchor||u.tag||d)d?.type==="block-seq"?i(u.end,"BAD_INDENT","All sequence items must start at the same column"):i(c,"MISSING_CHAR","Sequence item without - indicator");else{l=u.end,u.comment&&(a.comment=u.comment);continue}let m=d?n(t,d,u,i):e(t,u.end,p,null,u,i);t.schema.compat&&bp.flowIndentCheck(r.indent,d,i),c=m.range[2],a.items.push(m)}return a.range=[r.offset,c,l??c],a}_a.resolveBlockSeq=Ep});var Ze=w(Na=>{"use strict";function _p(n,e,t,r){let i="";if(n){let s=!1,o="";for(let a of n){let{source:c,type:l}=a;switch(l){case"space":s=!0;break;case"comment":{t&&!s&&r(a,"MISSING_CHAR","Comments must be separated from other tokens by white space characters");let p=c.substring(1)||" ";i?i+=o+p:i=p,o="";break}case"newline":i&&(o+=c),s=!0;break;default:r(a,"UNEXPECTED_TOKEN",`Unexpected ${l} at node end`)}e+=c.length}}return{comment:i,offset:e}}Na.resolveEnd=_p});var ka=w(va=>{"use strict";var Tp=C(),Np=_e(),wa=Ne(),wp=we(),Sp=Ze(),Sa=kt(),vp=xn(),kp=di(),ui="Block collections are not allowed within flow collections",fi=n=>n&&(n.type==="block-map"||n.type==="block-seq");function Ap({composeNode:n,composeEmptyNode:e},t,r,i,s){let o=r.start.source==="{",a=o?"flow map":"flow sequence",c=s?.nodeClass??(o?wa.YAMLMap:wp.YAMLSeq),l=new c(t.schema);l.flow=!0;let p=t.atRoot;p&&(t.atRoot=!1),t.atKey&&(t.atKey=!1);let d=r.offset+r.start.source.length;for(let g=0;g<r.items.length;++g){let E=r.items[g],{start:b,key:T,sep:N,value:S}=E,k=Sa.resolveProps(b,{flow:a,indicator:"explicit-key-ind",next:T??N?.[0],offset:d,onError:i,parentIndent:r.indent,startOnNewline:!1});if(!k.found){if(!k.anchor&&!k.tag&&!N&&!S){g===0&&k.comma?i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`):g<r.items.length-1&&i(k.start,"UNEXPECTED_TOKEN",`Unexpected empty item in ${a}`),k.comment&&(l.comment?l.comment+=`
`+k.comment:l.comment=k.comment),d=k.end;continue}!o&&t.options.strict&&vp.containsNewline(T)&&i(T,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line")}if(g===0)k.comma&&i(k.comma,"UNEXPECTED_TOKEN",`Unexpected , in ${a}`);else if(k.comma||i(k.start,"MISSING_CHAR",`Missing , between ${a} items`),k.comment){let A="";e:for(let _ of b)switch(_.type){case"comma":case"space":break;case"comment":A=_.source.substring(1);break e;default:break e}if(A){let _=l.items[l.items.length-1];Tp.isPair(_)&&(_=_.value??_.key),_.comment?_.comment+=`
`+A:_.comment=A,k.comment=k.comment.substring(A.length+1)}}if(!o&&!N&&!k.found){let A=S?n(t,S,k,i):e(t,k.end,N,null,k,i);l.items.push(A),d=A.range[2],fi(S)&&i(A.range,"BLOCK_IN_FLOW",ui)}else{t.atKey=!0;let A=k.end,_=T?n(t,T,k,i):e(t,A,b,null,k,i);fi(T)&&i(_.range,"BLOCK_IN_FLOW",ui),t.atKey=!1;let v=Sa.resolveProps(N??[],{flow:a,indicator:"map-value-ind",next:S,offset:_.range[2],onError:i,parentIndent:r.indent,startOnNewline:!1});if(v.found){if(!o&&!k.found&&t.options.strict){if(N)for(let M of N){if(M===v.found)break;if(M.type==="newline"){i(M,"MULTILINE_IMPLICIT_KEY","Implicit keys of flow sequence pairs need to be on a single line");break}}k.start<v.found.offset-1024&&i(v.found,"KEY_OVER_1024_CHARS","The : indicator must be at most 1024 chars after the start of an implicit flow sequence key")}}else S&&("source"in S&&S.source?.[0]===":"?i(S,"MISSING_CHAR",`Missing space after : in ${a}`):i(v.start,"MISSING_CHAR",`Missing , or : between ${a} items`));let $=S?n(t,S,v,i):v.found?e(t,v.end,N,null,v,i):null;$?fi(S)&&i($.range,"BLOCK_IN_FLOW",ui):v.comment&&(_.comment?_.comment+=`
`+v.comment:_.comment=v.comment);let ne=new Np.Pair(_,$);if(t.options.keepSourceTokens&&(ne.srcToken=E),o){let M=l;kp.mapIncludes(t,M.items,_)&&i(A,"DUPLICATE_KEY","Map keys must be unique"),M.items.push(ne)}else{let M=new wa.YAMLMap(t.schema);M.flow=!0,M.items.push(ne);let R=($??_).range;M.range=[_.range[0],R[1],R[2]],l.items.push(M)}d=$?$.range[2]:v.end}}let u=o?"}":"]",[m,...y]=r.end,f=d;if(m?.source===u)f=m.offset+m.source.length;else{let g=a[0].toUpperCase()+a.substring(1),E=p?`${g} must end with a ${u}`:`${g} in block collection must be sufficiently indented and end with a ${u}`;i(d,p?"MISSING_CHAR":"BAD_INDENT",E),m&&m.source.length!==1&&y.unshift(m)}if(y.length>0){let g=Sp.resolveEnd(y,f,t.options.strict,i);g.comment&&(l.comment?l.comment+=`
`+g.comment:l.comment=g.comment),l.range=[r.offset,f,g.offset]}else l.range=[r.offset,f,f];return l}va.resolveFlowCollection=Ap});var La=w(Aa=>{"use strict";var Lp=C(),Op=F(),Rp=Ne(),Ip=we(),xp=Ea(),Cp=Ta(),Dp=ka();function pi(n,e,t,r,i,s){let o=t.type==="block-map"?xp.resolveBlockMap(n,e,t,r,s):t.type==="block-seq"?Cp.resolveBlockSeq(n,e,t,r,s):Dp.resolveFlowCollection(n,e,t,r,s),a=o.constructor;return i==="!"||i===a.tagName?(o.tag=a.tagName,o):(i&&(o.tag=i),o)}function Pp(n,e,t,r,i){let s=r.tag,o=s?e.directives.tagName(s.source,u=>i(s,"TAG_RESOLVE_FAILED",u)):null;if(t.type==="block-seq"){let{anchor:u,newlineAfterProp:m}=r,y=u&&s?u.offset>s.offset?u:s:u??s;y&&(!m||m.offset<y.offset)&&i(y,"MISSING_CHAR","Missing newline after block sequence props")}let a=t.type==="block-map"?"map":t.type==="block-seq"?"seq":t.start.source==="{"?"map":"seq";if(!s||!o||o==="!"||o===Rp.YAMLMap.tagName&&a==="map"||o===Ip.YAMLSeq.tagName&&a==="seq")return pi(n,e,t,i,o);let c=e.schema.tags.find(u=>u.tag===o&&u.collection===a);if(!c){let u=e.schema.knownTags[o];if(u?.collection===a)e.schema.tags.push(Object.assign({},u,{default:!1})),c=u;else return u?i(s,"BAD_COLLECTION_TYPE",`${u.tag} used for ${a} collection, but expects ${u.collection??"scalar"}`,!0):i(s,"TAG_RESOLVE_FAILED",`Unresolved tag: ${o}`,!0),pi(n,e,t,i,o)}let l=pi(n,e,t,i,o,c),p=c.resolve?.(l,u=>i(s,"TAG_RESOLVE_FAILED",u),e.options)??l,d=Lp.isNode(p)?p:new Op.Scalar(p);return d.range=l.range,d.tag=o,c?.format&&(d.format=c.format),d}Aa.composeCollection=Pp});var hi=w(Oa=>{"use strict";var mi=F();function qp(n,e,t){let r=e.offset,i=$p(e,n.options.strict,t);if(!i)return{value:"",type:null,comment:"",range:[r,r,r]};let s=i.mode===">"?mi.Scalar.BLOCK_FOLDED:mi.Scalar.BLOCK_LITERAL,o=e.source?Mp(e.source):[],a=o.length;for(let f=o.length-1;f>=0;--f){let g=o[f][1];if(g===""||g==="\r")a=f;else break}if(a===0){let f=i.chomp==="+"&&o.length>0?`
`.repeat(Math.max(1,o.length-1)):"",g=r+i.length;return e.source&&(g+=e.source.length),{value:f,type:s,comment:i.comment,range:[r,g,g]}}let c=e.indent+i.indent,l=e.offset+i.length,p=0;for(let f=0;f<a;++f){let[g,E]=o[f];if(E===""||E==="\r")i.indent===0&&g.length>c&&(c=g.length);else{g.length<c&&t(l+g.length,"MISSING_CHAR","Block scalars with more-indented leading empty lines must use an explicit indentation indicator"),i.indent===0&&(c=g.length),p=f,c===0&&!n.atRoot&&t(l,"BAD_INDENT","Block scalar values in collections must be indented");break}l+=g.length+E.length+1}for(let f=o.length-1;f>=a;--f)o[f][0].length>c&&(a=f+1);let d="",u="",m=!1;for(let f=0;f<p;++f)d+=o[f][0].slice(c)+`
`;for(let f=p;f<a;++f){let[g,E]=o[f];l+=g.length+E.length+1;let b=E[E.length-1]==="\r";if(b&&(E=E.slice(0,-1)),E&&g.length<c){let N=`Block scalar lines must not be less indented than their ${i.indent?"explicit indentation indicator":"first line"}`;t(l-E.length-(b?2:1),"BAD_INDENT",N),g=""}s===mi.Scalar.BLOCK_LITERAL?(d+=u+g.slice(c)+E,u=`
`):g.length>c||E[0]==="	"?(u===" "?u=`
`:!m&&u===`
`&&(u=`

`),d+=u+g.slice(c)+E,u=`
`,m=!0):E===""?u===`
`?d+=`
`:u=`
`:(d+=u+E,u=" ",m=!1)}switch(i.chomp){case"-":break;case"+":for(let f=a;f<o.length;++f)d+=`
`+o[f][0].slice(c);d[d.length-1]!==`
`&&(d+=`
`);break;default:d+=`
`}let y=r+i.length+e.source.length;return{value:d,type:s,comment:i.comment,range:[r,y,y]}}function $p({offset:n,props:e},t,r){if(e[0].type!=="block-scalar-header")return r(e[0],"IMPOSSIBLE","Block scalar header not found"),null;let{source:i}=e[0],s=i[0],o=0,a="",c=-1;for(let u=1;u<i.length;++u){let m=i[u];if(!a&&(m==="-"||m==="+"))a=m;else{let y=Number(m);!o&&y?o=y:c===-1&&(c=n+u)}}c!==-1&&r(c,"UNEXPECTED_TOKEN",`Block scalar header includes extra characters: ${i}`);let l=!1,p="",d=i.length;for(let u=1;u<e.length;++u){let m=e[u];switch(m.type){case"space":l=!0;case"newline":d+=m.source.length;break;case"comment":t&&!l&&r(m,"MISSING_CHAR","Comments must be separated from other tokens by white space characters"),d+=m.source.length,p=m.source.substring(1);break;case"error":r(m,"UNEXPECTED_TOKEN",m.message),d+=m.source.length;break;default:{let y=`Unexpected token in block scalar header: ${m.type}`;r(m,"UNEXPECTED_TOKEN",y);let f=m.source;f&&typeof f=="string"&&(d+=f.length)}}}return{mode:s,indent:o,chomp:a,comment:p,length:d}}function Mp(n){let e=n.split(/\n( *)/),t=e[0],r=t.match(/^( *)/),s=[r?.[1]?[r[1],t.slice(r[1].length)]:["",t]];for(let o=1;o<e.length;o+=2)s.push([e[o],e[o+1]]);return s}Oa.resolveBlockScalar=qp});var yi=w(Ia=>{"use strict";var gi=F(),Up=Ze();function Bp(n,e,t){let{offset:r,type:i,source:s,end:o}=n,a,c,l=(u,m,y)=>t(r+u,m,y);switch(i){case"scalar":a=gi.Scalar.PLAIN,c=Fp(s,l);break;case"single-quoted-scalar":a=gi.Scalar.QUOTE_SINGLE,c=jp(s,l);break;case"double-quoted-scalar":a=gi.Scalar.QUOTE_DOUBLE,c=Kp(s,l);break;default:return t(n,"UNEXPECTED_TOKEN",`Expected a flow scalar value, but found: ${i}`),{value:"",type:null,comment:"",range:[r,r+s.length,r+s.length]}}let p=r+s.length,d=Up.resolveEnd(o,p,e,t);return{value:c,type:a,comment:d.comment,range:[r,p,d.offset]}}function Fp(n,e){let t="";switch(n[0]){case"	":t="a tab character";break;case",":t="flow indicator character ,";break;case"%":t="directive indicator character %";break;case"|":case">":{t=`block scalar indicator ${n[0]}`;break}case"@":case"`":{t=`reserved character ${n[0]}`;break}}return t&&e(0,"BAD_SCALAR_START",`Plain value cannot start with ${t}`),Ra(n)}function jp(n,e){return(n[n.length-1]!=="'"||n.length===1)&&e(n.length,"MISSING_CHAR","Missing closing 'quote"),Ra(n.slice(1,-1)).replace(/''/g,"'")}function Ra(n){let e,t;try{e=new RegExp(`(.*?)(?<![ 	])[ 	]*\r?
`,"sy"),t=new RegExp(`[ 	]*(.*?)(?:(?<![ 	])[ 	]*)?\r?
`,"sy")}catch{e=/(.*?)[ \t]*\r?\n/sy,t=/[ \t]*(.*?)[ \t]*\r?\n/sy}let r=e.exec(n);if(!r)return n;let i=r[1],s=" ",o=e.lastIndex;for(t.lastIndex=o;r=t.exec(n);)r[1]===""?s===`
`?i+=s:s=`
`:(i+=s+r[1],s=" "),o=t.lastIndex;let a=/[ \t]*(.*)/sy;return a.lastIndex=o,r=a.exec(n),i+s+(r?.[1]??"")}function Kp(n,e){let t="";for(let r=1;r<n.length-1;++r){let i=n[r];if(!(i==="\r"&&n[r+1]===`
`))if(i===`
`){let{fold:s,offset:o}=Xp(n,r);t+=s,r=o}else if(i==="\\"){let s=n[++r],o=zp[s];if(o)t+=o;else if(s===`
`)for(s=n[r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="\r"&&n[r+1]===`
`)for(s=n[++r+1];s===" "||s==="	";)s=n[++r+1];else if(s==="x"||s==="u"||s==="U"){let a=s==="x"?2:s==="u"?4:8;t+=Yp(n,r+1,a,e),r+=a}else{let a=n.substr(r-1,2);e(r-1,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),t+=a}}else if(i===" "||i==="	"){let s=r,o=n[r+1];for(;o===" "||o==="	";)o=n[++r+1];o!==`
`&&!(o==="\r"&&n[r+2]===`
`)&&(t+=r>s?n.slice(s,r+1):i)}else t+=i}return(n[n.length-1]!=='"'||n.length===1)&&e(n.length,"MISSING_CHAR",'Missing closing "quote'),t}function Xp(n,e){let t="",r=n[e+1];for(;(r===" "||r==="	"||r===`
`||r==="\r")&&!(r==="\r"&&n[e+2]!==`
`);)r===`
`&&(t+=`
`),e+=1,r=n[e+1];return t||(t=" "),{fold:t,offset:e}}var zp={0:"\0",a:"\x07",b:"\b",e:"\x1B",f:"\f",n:`
`,r:"\r",t:"	",v:"\v",N:"\x85",_:"\xA0",L:"\u2028",P:"\u2029"," ":" ",'"':'"',"/":"/","\\":"\\","	":"	"};function Yp(n,e,t,r){let i=n.substr(e,t),o=i.length===t&&/^[0-9a-fA-F]+$/.test(i)?parseInt(i,16):NaN;try{return String.fromCodePoint(o)}catch{let a=n.substr(e-2,t+2);return r(e-2,"BAD_DQ_ESCAPE",`Invalid escape sequence ${a}`),a}}Ia.resolveFlowScalar=Bp});var Da=w(Ca=>{"use strict";var Ce=C(),xa=F(),Vp=hi(),Gp=yi();function Jp(n,e,t,r){let{value:i,type:s,comment:o,range:a}=e.type==="block-scalar"?Vp.resolveBlockScalar(n,e,r):Gp.resolveFlowScalar(e,n.options.strict,r),c=t?n.directives.tagName(t.source,d=>r(t,"TAG_RESOLVE_FAILED",d)):null,l;n.options.stringKeys&&n.atKey?l=n.schema[Ce.SCALAR]:c?l=Hp(n.schema,i,c,t,r):e.type==="scalar"?l=Wp(n,i,e,r):l=n.schema[Ce.SCALAR];let p;try{let d=l.resolve(i,u=>r(t??e,"TAG_RESOLVE_FAILED",u),n.options);p=Ce.isScalar(d)?d:new xa.Scalar(d)}catch(d){let u=d instanceof Error?d.message:String(d);r(t??e,"TAG_RESOLVE_FAILED",u),p=new xa.Scalar(i)}return p.range=a,p.source=i,s&&(p.type=s),c&&(p.tag=c),l.format&&(p.format=l.format),o&&(p.comment=o),p}function Hp(n,e,t,r,i){if(t==="!")return n[Ce.SCALAR];let s=[];for(let a of n.tags)if(!a.collection&&a.tag===t)if(a.default&&a.test)s.push(a);else return a;for(let a of s)if(a.test?.test(e))return a;let o=n.knownTags[t];return o&&!o.collection?(n.tags.push(Object.assign({},o,{default:!1,test:void 0})),o):(i(r,"TAG_RESOLVE_FAILED",`Unresolved tag: ${t}`,t!=="tag:yaml.org,2002:str"),n[Ce.SCALAR])}function Wp({atKey:n,directives:e,schema:t},r,i,s){let o=t.tags.find(a=>(a.default===!0||n&&a.default==="key")&&a.test?.test(r))||t[Ce.SCALAR];if(t.compat){let a=t.compat.find(c=>c.default&&c.test?.test(r))??t[Ce.SCALAR];if(o.tag!==a.tag){let c=e.tagString(o.tag),l=e.tagString(a.tag),p=`Value may be parsed as either ${c} or ${l}`;s(i,"TAG_RESOLVE_FAILED",p,!0)}}return o}Ca.composeScalar=Jp});var qa=w(Pa=>{"use strict";function Zp(n,e,t){if(e){t??(t=e.length);for(let r=t-1;r>=0;--r){let i=e[r];switch(i.type){case"space":case"comment":case"newline":n-=i.source.length;continue}for(i=e[++r];i?.type==="space";)n+=i.source.length,i=e[++r];break}}return n}Pa.emptyScalarPosition=Zp});var Ua=w(Ei=>{"use strict";var Qp=ot(),em=C(),tm=La(),$a=Da(),nm=Ze(),rm=qa(),im={composeNode:Ma,composeEmptyNode:bi};function Ma(n,e,t,r){let i=n.atKey,{spaceBefore:s,comment:o,anchor:a,tag:c}=t,l,p=!0;switch(e.type){case"alias":l=sm(n,e,r),(a||c)&&r(e,"ALIAS_PROPS","An alias node must not specify any properties");break;case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"block-scalar":l=$a.composeScalar(n,e,c,r),a&&(l.anchor=a.source.substring(1));break;case"block-map":case"block-seq":case"flow-collection":try{l=tm.composeCollection(im,n,e,t,r),a&&(l.anchor=a.source.substring(1))}catch(d){let u=d instanceof Error?d.message:String(d);r(e,"RESOURCE_EXHAUSTION",u)}break;default:{let d=e.type==="error"?e.message:`Unsupported token (type: ${e.type})`;r(e,"UNEXPECTED_TOKEN",d),p=!1}}return l??(l=bi(n,e.offset,void 0,null,t,r)),a&&l.anchor===""&&r(a,"BAD_ALIAS","Anchor cannot be an empty string"),i&&n.options.stringKeys&&(!em.isScalar(l)||typeof l.value!="string"||l.tag&&l.tag!=="tag:yaml.org,2002:str")&&r(c??e,"NON_STRING_KEY","With stringKeys, all keys must be strings"),s&&(l.spaceBefore=!0),o&&(e.type==="scalar"&&e.source===""?l.comment=o:l.commentBefore=o),n.options.keepSourceTokens&&p&&(l.srcToken=e),l}function bi(n,e,t,r,{spaceBefore:i,comment:s,anchor:o,tag:a,end:c},l){let p={type:"scalar",offset:rm.emptyScalarPosition(e,t,r),indent:-1,source:""},d=$a.composeScalar(n,p,a,l);return o&&(d.anchor=o.source.substring(1),d.anchor===""&&l(o,"BAD_ALIAS","Anchor cannot be an empty string")),i&&(d.spaceBefore=!0),s&&(d.comment=s,d.range[2]=c),d}function sm({options:n},{offset:e,source:t,end:r},i){let s=new Qp.Alias(t.substring(1));s.source===""&&i(e,"BAD_ALIAS","Alias cannot be an empty string"),s.source.endsWith(":")&&i(e+t.length-1,"BAD_ALIAS","Alias ending in : is ambiguous",!0);let o=e+t.length,a=nm.resolveEnd(r,o,n.strict,i);return s.range=[e,o,a.offset],a.comment&&(s.comment=a.comment),s}Ei.composeEmptyNode=bi;Ei.composeNode=Ma});var ja=w(Fa=>{"use strict";var om=Nt(),Ba=Ua(),am=Ze(),cm=kt();function lm(n,e,{offset:t,start:r,value:i,end:s},o){let a=Object.assign({_directives:e},n),c=new om.Document(void 0,a),l={atKey:!1,atRoot:!0,directives:c.directives,options:c.options,schema:c.schema},p=cm.resolveProps(r,{indicator:"doc-start",next:i??s?.[0],offset:t,onError:o,parentIndent:0,startOnNewline:!0});p.found&&(c.directives.docStart=!0,i&&(i.type==="block-map"||i.type==="block-seq")&&!p.hasNewline&&o(p.end,"MISSING_CHAR","Block collection cannot start on same line with directives-end marker")),c.contents=i?Ba.composeNode(l,i,p,o):Ba.composeEmptyNode(l,p.end,r,null,p,o);let d=c.contents.range[2],u=am.resolveEnd(s,d,!1,o);return u.comment&&(c.comment=u.comment),c.range=[t,d,u.offset],c}Fa.composeDoc=lm});var Ti=w(za=>{"use strict";var dm=Mt("process"),um=or(),fm=Nt(),At=vt(),Ka=C(),pm=ja(),mm=Ze();function Lt(n){if(typeof n=="number")return[n,n+1];if(Array.isArray(n))return n.length===2?n:[n[0],n[1]];let{offset:e,source:t}=n;return[e,e+(typeof t=="string"?t.length:1)]}function Xa(n){let e="",t=!1,r=!1;for(let i=0;i<n.length;++i){let s=n[i];switch(s[0]){case"#":e+=(e===""?"":r?`

`:`
`)+(s.substring(1)||" "),t=!0,r=!1;break;case"%":n[i+1]?.[0]!=="#"&&(i+=1),t=!1;break;default:t||(r=!0),t=!1}}return{comment:e,afterEmptyLine:r}}var _i=class{constructor(e={}){this.doc=null,this.atDirectives=!1,this.prelude=[],this.errors=[],this.warnings=[],this.onError=(t,r,i,s)=>{let o=Lt(t);s?this.warnings.push(new At.YAMLWarning(o,r,i)):this.errors.push(new At.YAMLParseError(o,r,i))},this.directives=new um.Directives({version:e.version||"1.2"}),this.options=e}decorate(e,t){let{comment:r,afterEmptyLine:i}=Xa(this.prelude);if(r){let s=e.contents;if(t)e.comment=e.comment?`${e.comment}
${r}`:r;else if(i||e.directives.docStart||!s)e.commentBefore=r;else if(Ka.isCollection(s)&&!s.flow&&s.items.length>0){let o=s.items[0];Ka.isPair(o)&&(o=o.key);let a=o.commentBefore;o.commentBefore=a?`${r}
${a}`:r}else{let o=s.commentBefore;s.commentBefore=o?`${r}
${o}`:r}}if(t){for(let s=0;s<this.errors.length;++s)e.errors.push(this.errors[s]);for(let s=0;s<this.warnings.length;++s)e.warnings.push(this.warnings[s])}else e.errors=this.errors,e.warnings=this.warnings;this.prelude=[],this.errors=[],this.warnings=[]}streamInfo(){return{comment:Xa(this.prelude).comment,directives:this.directives,errors:this.errors,warnings:this.warnings}}*compose(e,t=!1,r=-1){for(let i of e)yield*this.next(i);yield*this.end(t,r)}*next(e){switch(dm.env.LOG_STREAM&&console.dir(e,{depth:null}),e.type){case"directive":this.directives.add(e.source,(t,r,i)=>{let s=Lt(e);s[0]+=t,this.onError(s,"BAD_DIRECTIVE",r,i)}),this.prelude.push(e.source),this.atDirectives=!0;break;case"document":{let t=pm.composeDoc(this.options,this.directives,e,this.onError);this.atDirectives&&!t.directives.docStart&&this.onError(e,"MISSING_CHAR","Missing directives-end/doc-start indicator line"),this.decorate(t,!1),this.doc&&(yield this.doc),this.doc=t,this.atDirectives=!1;break}case"byte-order-mark":case"space":break;case"comment":case"newline":this.prelude.push(e.source);break;case"error":{let t=e.source?`${e.message}: ${JSON.stringify(e.source)}`:e.message,r=new At.YAMLParseError(Lt(e),"UNEXPECTED_TOKEN",t);this.atDirectives||!this.doc?this.errors.push(r):this.doc.errors.push(r);break}case"doc-end":{if(!this.doc){let r="Unexpected doc-end without preceding document";this.errors.push(new At.YAMLParseError(Lt(e),"UNEXPECTED_TOKEN",r));break}this.doc.directives.docEnd=!0;let t=mm.resolveEnd(e.end,e.offset+e.source.length,this.doc.options.strict,this.onError);if(this.decorate(this.doc,!0),t.comment){let r=this.doc.comment;this.doc.comment=r?`${r}
${t.comment}`:t.comment}this.doc.range[2]=t.offset;break}default:this.errors.push(new At.YAMLParseError(Lt(e),"UNEXPECTED_TOKEN",`Unsupported token ${e.type}`))}}*end(e=!1,t=-1){if(this.doc)this.decorate(this.doc,!0),yield this.doc,this.doc=null;else if(e){let r=Object.assign({_directives:this.directives},this.options),i=new fm.Document(void 0,r);this.atDirectives&&this.onError(t,"MISSING_CHAR","Missing directives-end indicator line"),i.range=[0,t,t],this.decorate(i,!1),yield i}}};za.Composer=_i});var Ga=w(Cn=>{"use strict";var hm=hi(),gm=yi(),ym=vt(),Ya=ut();function bm(n,e=!0,t){if(n){let r=(i,s,o)=>{let a=typeof i=="number"?i:Array.isArray(i)?i[0]:i.offset;if(t)t(a,s,o);else throw new ym.YAMLParseError([a,a+1],s,o)};switch(n.type){case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return gm.resolveFlowScalar(n,e,r);case"block-scalar":return hm.resolveBlockScalar({options:{strict:e}},n,r)}}return null}function Em(n,e){let{implicitKey:t=!1,indent:r,inFlow:i=!1,offset:s=-1,type:o="PLAIN"}=e,a=Ya.stringifyString({type:o,value:n},{implicitKey:t,indent:r>0?" ".repeat(r):"",inFlow:i,options:{blockQuote:!0,lineWidth:-1}}),c=e.end??[{type:"newline",offset:-1,indent:r,source:`
`}];switch(a[0]){case"|":case">":{let l=a.indexOf(`
`),p=a.substring(0,l),d=a.substring(l+1)+`
`,u=[{type:"block-scalar-header",offset:s,indent:r,source:p}];return Va(u,c)||u.push({type:"newline",offset:-1,indent:r,source:`
`}),{type:"block-scalar",offset:s,indent:r,props:u,source:d}}case'"':return{type:"double-quoted-scalar",offset:s,indent:r,source:a,end:c};case"'":return{type:"single-quoted-scalar",offset:s,indent:r,source:a,end:c};default:return{type:"scalar",offset:s,indent:r,source:a,end:c}}}function _m(n,e,t={}){let{afterKey:r=!1,implicitKey:i=!1,inFlow:s=!1,type:o}=t,a="indent"in n?n.indent:null;if(r&&typeof a=="number"&&(a+=2),!o)switch(n.type){case"single-quoted-scalar":o="QUOTE_SINGLE";break;case"double-quoted-scalar":o="QUOTE_DOUBLE";break;case"block-scalar":{let l=n.props[0];if(l.type!=="block-scalar-header")throw new Error("Invalid block scalar header");o=l.source[0]===">"?"BLOCK_FOLDED":"BLOCK_LITERAL";break}default:o="PLAIN"}let c=Ya.stringifyString({type:o,value:e},{implicitKey:i||a===null,indent:a!==null&&a>0?" ".repeat(a):"",inFlow:s,options:{blockQuote:!0,lineWidth:-1}});switch(c[0]){case"|":case">":Tm(n,c);break;case'"':Ni(n,c,"double-quoted-scalar");break;case"'":Ni(n,c,"single-quoted-scalar");break;default:Ni(n,c,"scalar")}}function Tm(n,e){let t=e.indexOf(`
`),r=e.substring(0,t),i=e.substring(t+1)+`
`;if(n.type==="block-scalar"){let s=n.props[0];if(s.type!=="block-scalar-header")throw new Error("Invalid block scalar header");s.source=r,n.source=i}else{let{offset:s}=n,o="indent"in n?n.indent:-1,a=[{type:"block-scalar-header",offset:s,indent:o,source:r}];Va(a,"end"in n?n.end:void 0)||a.push({type:"newline",offset:-1,indent:o,source:`
`});for(let c of Object.keys(n))c!=="type"&&c!=="offset"&&delete n[c];Object.assign(n,{type:"block-scalar",indent:o,props:a,source:i})}}function Va(n,e){if(e)for(let t of e)switch(t.type){case"space":case"comment":n.push(t);break;case"newline":return n.push(t),!0}return!1}function Ni(n,e,t){switch(n.type){case"scalar":case"double-quoted-scalar":case"single-quoted-scalar":n.type=t,n.source=e;break;case"block-scalar":{let r=n.props.slice(1),i=e.length;n.props[0].type==="block-scalar-header"&&(i-=n.props[0].source.length);for(let s of r)s.offset+=i;delete n.props,Object.assign(n,{type:t,source:e,end:r});break}case"block-map":case"block-seq":{let i={type:"newline",offset:n.offset+e.length,indent:n.indent,source:`
`};delete n.items,Object.assign(n,{type:t,source:e,end:[i]});break}default:{let r="indent"in n?n.indent:-1,i="end"in n&&Array.isArray(n.end)?n.end.filter(s=>s.type==="space"||s.type==="comment"||s.type==="newline"):[];for(let s of Object.keys(n))s!=="type"&&s!=="offset"&&delete n[s];Object.assign(n,{type:t,indent:r,source:e,end:i})}}}Cn.createScalarToken=Em;Cn.resolveAsScalar=bm;Cn.setScalarValue=_m});var Ha=w(Ja=>{"use strict";var Nm=n=>"type"in n?Pn(n):Dn(n);function Pn(n){switch(n.type){case"block-scalar":{let e="";for(let t of n.props)e+=Pn(t);return e+n.source}case"block-map":case"block-seq":{let e="";for(let t of n.items)e+=Dn(t);return e}case"flow-collection":{let e=n.start.source;for(let t of n.items)e+=Dn(t);for(let t of n.end)e+=t.source;return e}case"document":{let e=Dn(n);if(n.end)for(let t of n.end)e+=t.source;return e}default:{let e=n.source;if("end"in n&&n.end)for(let t of n.end)e+=t.source;return e}}}function Dn({start:n,key:e,sep:t,value:r}){let i="";for(let s of n)i+=s.source;if(e&&(i+=Pn(e)),t)for(let s of t)i+=s.source;return r&&(i+=Pn(r)),i}Ja.stringify=Nm});var ec=w(Qa=>{"use strict";var wi=Symbol("break visit"),wm=Symbol("skip children"),Wa=Symbol("remove item");function De(n,e){"type"in n&&n.type==="document"&&(n={start:n.start,value:n.value}),Za(Object.freeze([]),n,e)}De.BREAK=wi;De.SKIP=wm;De.REMOVE=Wa;De.itemAtPath=(n,e)=>{let t=n;for(let[r,i]of e){let s=t?.[r];if(s&&"items"in s)t=s.items[i];else return}return t};De.parentCollection=(n,e)=>{let t=De.itemAtPath(n,e.slice(0,-1)),r=e[e.length-1][0],i=t?.[r];if(i&&"items"in i)return i;throw new Error("Parent collection not found")};function Za(n,e,t){let r=t(e,n);if(typeof r=="symbol")return r;for(let i of["key","value"]){let s=e[i];if(s&&"items"in s){for(let o=0;o<s.items.length;++o){let a=Za(Object.freeze(n.concat([[i,o]])),s.items[o],t);if(typeof a=="number")o=a-1;else{if(a===wi)return wi;a===Wa&&(s.items.splice(o,1),o-=1)}}typeof r=="function"&&i==="key"&&(r=r(e,n))}}return typeof r=="function"?r(e,n):r}Qa.visit=De});var qn=w(W=>{"use strict";var Si=Ga(),Sm=Ha(),vm=ec(),vi="\uFEFF",ki="",Ai="",Li="",km=n=>!!n&&"items"in n,Am=n=>!!n&&(n.type==="scalar"||n.type==="single-quoted-scalar"||n.type==="double-quoted-scalar"||n.type==="block-scalar");function Lm(n){switch(n){case vi:return"<BOM>";case ki:return"<DOC>";case Ai:return"<FLOW_END>";case Li:return"<SCALAR>";default:return JSON.stringify(n)}}function Om(n){switch(n){case vi:return"byte-order-mark";case ki:return"doc-mode";case Ai:return"flow-error-end";case Li:return"scalar";case"---":return"doc-start";case"...":return"doc-end";case"":case`
`:case`\r
`:return"newline";case"-":return"seq-item-ind";case"?":return"explicit-key-ind";case":":return"map-value-ind";case"{":return"flow-map-start";case"}":return"flow-map-end";case"[":return"flow-seq-start";case"]":return"flow-seq-end";case",":return"comma"}switch(n[0]){case" ":case"	":return"space";case"#":return"comment";case"%":return"directive-line";case"*":return"alias";case"&":return"anchor";case"!":return"tag";case"'":return"single-quoted-scalar";case'"':return"double-quoted-scalar";case"|":case">":return"block-scalar-header"}return null}W.createScalarToken=Si.createScalarToken;W.resolveAsScalar=Si.resolveAsScalar;W.setScalarValue=Si.setScalarValue;W.stringify=Sm.stringify;W.visit=vm.visit;W.BOM=vi;W.DOCUMENT=ki;W.FLOW_END=Ai;W.SCALAR=Li;W.isCollection=km;W.isScalar=Am;W.prettyToken=Lm;W.tokenType=Om});var Ii=w(nc=>{"use strict";var Ot=qn();function ie(n){switch(n){case void 0:case" ":case`
`:case"\r":case"	":return!0;default:return!1}}var tc=new Set("0123456789ABCDEFabcdef"),Rm=new Set("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-#;/?:@&=+$_.!~*'()"),$n=new Set(",[]{}"),Im=new Set(` ,[]{}
\r	`),Oi=n=>!n||Im.has(n),Ri=class{constructor(){this.atEnd=!1,this.blockScalarIndent=-1,this.blockScalarKeep=!1,this.buffer="",this.flowKey=!1,this.flowLevel=0,this.indentNext=0,this.indentValue=0,this.lineEndPos=null,this.next=null,this.pos=0}*lex(e,t=!1){if(e){if(typeof e!="string")throw TypeError("source is not a string");this.buffer=this.buffer?this.buffer+e:e,this.lineEndPos=null}this.atEnd=!t;let r=this.next??"stream";for(;r&&(t||this.hasChars(1));)r=yield*this.parseNext(r)}atLineEnd(){let e=this.pos,t=this.buffer[e];for(;t===" "||t==="	";)t=this.buffer[++e];return!t||t==="#"||t===`
`?!0:t==="\r"?this.buffer[e+1]===`
`:!1}charAt(e){return this.buffer[this.pos+e]}continueScalar(e){let t=this.buffer[e];if(this.indentNext>0){let r=0;for(;t===" ";)t=this.buffer[++r+e];if(t==="\r"){let i=this.buffer[r+e+1];if(i===`
`||!i&&!this.atEnd)return e+r+1}return t===`
`||r>=this.indentNext||!t&&!this.atEnd?e+r:-1}if(t==="-"||t==="."){let r=this.buffer.substr(e,3);if((r==="---"||r==="...")&&ie(this.buffer[e+3]))return-1}return e}getLine(){let e=this.lineEndPos;return(typeof e!="number"||e!==-1&&e<this.pos)&&(e=this.buffer.indexOf(`
`,this.pos),this.lineEndPos=e),e===-1?this.atEnd?this.buffer.substring(this.pos):null:(this.buffer[e-1]==="\r"&&(e-=1),this.buffer.substring(this.pos,e))}hasChars(e){return this.pos+e<=this.buffer.length}setNext(e){return this.buffer=this.buffer.substring(this.pos),this.pos=0,this.lineEndPos=null,this.next=e,null}peek(e){return this.buffer.substr(this.pos,e)}*parseNext(e){switch(e){case"stream":return yield*this.parseStream();case"line-start":return yield*this.parseLineStart();case"block-start":return yield*this.parseBlockStart();case"doc":return yield*this.parseDocument();case"flow":return yield*this.parseFlowCollection();case"quoted-scalar":return yield*this.parseQuotedScalar();case"block-scalar":return yield*this.parseBlockScalar();case"plain-scalar":return yield*this.parsePlainScalar()}}*parseStream(){let e=this.getLine();if(e===null)return this.setNext("stream");if(e[0]===Ot.BOM&&(yield*this.pushCount(1),e=e.substring(1)),e[0]==="%"){let t=e.length,r=e.indexOf("#");for(;r!==-1;){let s=e[r-1];if(s===" "||s==="	"){t=r-1;break}else r=e.indexOf("#",r+1)}for(;;){let s=e[t-1];if(s===" "||s==="	")t-=1;else break}let i=(yield*this.pushCount(t))+(yield*this.pushSpaces(!0));return yield*this.pushCount(e.length-i),this.pushNewline(),"stream"}if(this.atLineEnd()){let t=yield*this.pushSpaces(!0);return yield*this.pushCount(e.length-t),yield*this.pushNewline(),"stream"}return yield Ot.DOCUMENT,yield*this.parseLineStart()}*parseLineStart(){let e=this.charAt(0);if(!e&&!this.atEnd)return this.setNext("line-start");if(e==="-"||e==="."){if(!this.atEnd&&!this.hasChars(4))return this.setNext("line-start");let t=this.peek(3);if((t==="---"||t==="...")&&ie(this.charAt(3)))return yield*this.pushCount(3),this.indentValue=0,this.indentNext=0,t==="---"?"doc":"stream"}return this.indentValue=yield*this.pushSpaces(!1),this.indentNext>this.indentValue&&!ie(this.charAt(1))&&(this.indentNext=this.indentValue),yield*this.parseBlockStart()}*parseBlockStart(){let[e,t]=this.peek(2);if(!t&&!this.atEnd)return this.setNext("block-start");if((e==="-"||e==="?"||e===":")&&ie(t)){let r=(yield*this.pushCount(1))+(yield*this.pushSpaces(!0));return this.indentNext=this.indentValue+1,this.indentValue+=r,"block-start"}return"doc"}*parseDocument(){yield*this.pushSpaces(!0);let e=this.getLine();if(e===null)return this.setNext("doc");let t=yield*this.pushIndicators();switch(e[t]){case"#":yield*this.pushCount(e.length-t);case void 0:return yield*this.pushNewline(),yield*this.parseLineStart();case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel=1,"flow";case"}":case"]":return yield*this.pushCount(1),"doc";case"*":return yield*this.pushUntil(Oi),"doc";case'"':case"'":return yield*this.parseQuotedScalar();case"|":case">":return t+=yield*this.parseBlockScalarHeader(),t+=yield*this.pushSpaces(!0),yield*this.pushCount(e.length-t),yield*this.pushNewline(),yield*this.parseBlockScalar();default:return yield*this.parsePlainScalar()}}*parseFlowCollection(){let e,t,r=-1;do e=yield*this.pushNewline(),e>0?(t=yield*this.pushSpaces(!1),this.indentValue=r=t):t=0,t+=yield*this.pushSpaces(!0);while(e+t>0);let i=this.getLine();if(i===null)return this.setNext("flow");if((r!==-1&&r<this.indentNext&&i[0]!=="#"||r===0&&(i.startsWith("---")||i.startsWith("..."))&&ie(i[3]))&&!(r===this.indentNext-1&&this.flowLevel===1&&(i[0]==="]"||i[0]==="}")))return this.flowLevel=0,yield Ot.FLOW_END,yield*this.parseLineStart();let s=0;for(;i[s]===",";)s+=yield*this.pushCount(1),s+=yield*this.pushSpaces(!0),this.flowKey=!1;switch(s+=yield*this.pushIndicators(),i[s]){case void 0:return"flow";case"#":return yield*this.pushCount(i.length-s),"flow";case"{":case"[":return yield*this.pushCount(1),this.flowKey=!1,this.flowLevel+=1,"flow";case"}":case"]":return yield*this.pushCount(1),this.flowKey=!0,this.flowLevel-=1,this.flowLevel?"flow":"doc";case"*":return yield*this.pushUntil(Oi),"flow";case'"':case"'":return this.flowKey=!0,yield*this.parseQuotedScalar();case":":{let o=this.charAt(1);if(this.flowKey||ie(o)||o===",")return this.flowKey=!1,yield*this.pushCount(1),yield*this.pushSpaces(!0),"flow"}default:return this.flowKey=!1,yield*this.parsePlainScalar()}}*parseQuotedScalar(){let e=this.charAt(0),t=this.buffer.indexOf(e,this.pos+1);if(e==="'")for(;t!==-1&&this.buffer[t+1]==="'";)t=this.buffer.indexOf("'",t+2);else for(;t!==-1;){let s=0;for(;this.buffer[t-1-s]==="\\";)s+=1;if(s%2===0)break;t=this.buffer.indexOf('"',t+1)}let r=this.buffer.substring(0,t),i=r.indexOf(`
`,this.pos);if(i!==-1){for(;i!==-1;){let s=this.continueScalar(i+1);if(s===-1)break;i=r.indexOf(`
`,s)}i!==-1&&(t=i-(r[i-1]==="\r"?2:1))}if(t===-1){if(!this.atEnd)return this.setNext("quoted-scalar");t=this.buffer.length}return yield*this.pushToIndex(t+1,!1),this.flowLevel?"flow":"doc"}*parseBlockScalarHeader(){this.blockScalarIndent=-1,this.blockScalarKeep=!1;let e=this.pos;for(;;){let t=this.buffer[++e];if(t==="+")this.blockScalarKeep=!0;else if(t>"0"&&t<="9")this.blockScalarIndent=Number(t)-1;else if(t!=="-")break}return yield*this.pushUntil(t=>ie(t)||t==="#")}*parseBlockScalar(){let e=this.pos-1,t=0,r;e:for(let s=this.pos;r=this.buffer[s];++s)switch(r){case" ":t+=1;break;case`
`:e=s,t=0;break;case"\r":{let o=this.buffer[s+1];if(!o&&!this.atEnd)return this.setNext("block-scalar");if(o===`
`)break}default:break e}if(!r&&!this.atEnd)return this.setNext("block-scalar");if(t>=this.indentNext){this.blockScalarIndent===-1?this.indentNext=t:this.indentNext=this.blockScalarIndent+(this.indentNext===0?1:this.indentNext);do{let s=this.continueScalar(e+1);if(s===-1)break;e=this.buffer.indexOf(`
`,s)}while(e!==-1);if(e===-1){if(!this.atEnd)return this.setNext("block-scalar");e=this.buffer.length}}let i=e+1;for(r=this.buffer[i];r===" ";)r=this.buffer[++i];if(r==="	"){for(;r==="	"||r===" "||r==="\r"||r===`
`;)r=this.buffer[++i];e=i-1}else if(!this.blockScalarKeep)do{let s=e-1,o=this.buffer[s];o==="\r"&&(o=this.buffer[--s]);let a=s;for(;o===" ";)o=this.buffer[--s];if(o===`
`&&s>=this.pos&&s+1+t>a)e=s;else break}while(!0);return yield Ot.SCALAR,yield*this.pushToIndex(e+1,!0),yield*this.parseLineStart()}*parsePlainScalar(){let e=this.flowLevel>0,t=this.pos-1,r=this.pos-1,i;for(;i=this.buffer[++r];)if(i===":"){let s=this.buffer[r+1];if(ie(s)||e&&$n.has(s))break;t=r}else if(ie(i)){let s=this.buffer[r+1];if(i==="\r"&&(s===`
`?(r+=1,i=`
`,s=this.buffer[r+1]):t=r),s==="#"||e&&$n.has(s))break;if(i===`
`){let o=this.continueScalar(r+1);if(o===-1)break;r=Math.max(r,o-2)}}else{if(e&&$n.has(i))break;t=r}return!i&&!this.atEnd?this.setNext("plain-scalar"):(yield Ot.SCALAR,yield*this.pushToIndex(t+1,!0),e?"flow":"doc")}*pushCount(e){return e>0?(yield this.buffer.substr(this.pos,e),this.pos+=e,e):0}*pushToIndex(e,t){let r=this.buffer.slice(this.pos,e);return r?(yield r,this.pos+=r.length,r.length):(t&&(yield""),0)}*pushIndicators(){let e=0;e:for(;;){switch(this.charAt(0)){case"!":e+=yield*this.pushTag(),e+=yield*this.pushSpaces(!0);continue e;case"&":e+=yield*this.pushUntil(Oi),e+=yield*this.pushSpaces(!0);continue e;case"-":case"?":case":":{let t=this.flowLevel>0,r=this.charAt(1);if(ie(r)||t&&$n.has(r)){t?this.flowKey&&(this.flowKey=!1):this.indentNext=this.indentValue+1,e+=yield*this.pushCount(1),e+=yield*this.pushSpaces(!0);continue e}}}break e}return e}*pushTag(){if(this.charAt(1)==="<"){let e=this.pos+2,t=this.buffer[e];for(;!ie(t)&&t!==">";)t=this.buffer[++e];return yield*this.pushToIndex(t===">"?e+1:e,!1)}else{let e=this.pos+1,t=this.buffer[e];for(;t;)if(Rm.has(t))t=this.buffer[++e];else if(t==="%"&&tc.has(this.buffer[e+1])&&tc.has(this.buffer[e+2]))t=this.buffer[e+=3];else break;return yield*this.pushToIndex(e,!1)}}*pushNewline(){let e=this.buffer[this.pos];return e===`
`?yield*this.pushCount(1):e==="\r"&&this.charAt(1)===`
`?yield*this.pushCount(2):0}*pushSpaces(e){let t=this.pos-1,r;do r=this.buffer[++t];while(r===" "||e&&r==="	");let i=t-this.pos;return i>0&&(yield this.buffer.substr(this.pos,i),this.pos=t),i}*pushUntil(e){let t=this.pos,r=this.buffer[t];for(;!e(r);)r=this.buffer[++t];return yield*this.pushToIndex(t,!1)}};nc.Lexer=Ri});var Ci=w(rc=>{"use strict";var xi=class{constructor(){this.lineStarts=[],this.addNewLine=e=>this.lineStarts.push(e),this.linePos=e=>{let t=0,r=this.lineStarts.length;for(;t<r;){let s=t+r>>1;this.lineStarts[s]<e?t=s+1:r=s}if(this.lineStarts[t]===e)return{line:t+1,col:1};if(t===0)return{line:0,col:e};let i=this.lineStarts[t-1];return{line:t,col:e-i+1}}}};rc.LineCounter=xi});var Pi=w(cc=>{"use strict";var xm=Mt("process"),ic=qn(),Cm=Ii();function Se(n,e){for(let t=0;t<n.length;++t)if(n[t].type===e)return!0;return!1}function sc(n){for(let e=0;e<n.length;++e)switch(n[e].type){case"space":case"comment":case"newline":break;default:return e}return-1}function ac(n){switch(n?.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":case"flow-collection":return!0;default:return!1}}function Mn(n){switch(n.type){case"document":return n.start;case"block-map":{let e=n.items[n.items.length-1];return e.sep??e.start}case"block-seq":return n.items[n.items.length-1].start;default:return[]}}function Qe(n){if(n.length===0)return[];let e=n.length;e:for(;--e>=0;)switch(n[e].type){case"doc-start":case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":case"newline":break e}for(;n[++e]?.type==="space";);return n.splice(e,n.length)}function Un(n,e){if(e.length<1e5)Array.prototype.push.apply(n,e);else for(let t=0;t<e.length;++t)n.push(e[t])}function oc(n){if(n.start.type==="flow-seq-start")for(let e of n.items)e.sep&&!e.value&&!Se(e.start,"explicit-key-ind")&&!Se(e.sep,"map-value-ind")&&(e.key&&(e.value=e.key),delete e.key,ac(e.value)?e.value.end?Un(e.value.end,e.sep):e.value.end=e.sep:Un(e.start,e.sep),delete e.sep)}var Di=class{constructor(e){this.atNewLine=!0,this.atScalar=!1,this.indent=0,this.offset=0,this.onKeyLine=!1,this.stack=[],this.source="",this.type="",this.lexer=new Cm.Lexer,this.onNewLine=e}*parse(e,t=!1){this.onNewLine&&this.offset===0&&this.onNewLine(0);for(let r of this.lexer.lex(e,t))yield*this.next(r);t||(yield*this.end())}*next(e){if(this.source=e,xm.env.LOG_TOKENS&&console.log("|",ic.prettyToken(e)),this.atScalar){this.atScalar=!1,yield*this.step(),this.offset+=e.length;return}let t=ic.tokenType(e);if(t)if(t==="scalar")this.atNewLine=!1,this.atScalar=!0,this.type="scalar";else{switch(this.type=t,yield*this.step(),t){case"newline":this.atNewLine=!0,this.indent=0,this.onNewLine&&this.onNewLine(this.offset+e.length);break;case"space":this.atNewLine&&e[0]===" "&&(this.indent+=e.length);break;case"explicit-key-ind":case"map-value-ind":case"seq-item-ind":this.atNewLine&&(this.indent+=e.length);break;case"doc-mode":case"flow-error-end":return;default:this.atNewLine=!1}this.offset+=e.length}else{let r=`Not a YAML token: ${e}`;yield*this.pop({type:"error",offset:this.offset,message:r,source:e}),this.offset+=e.length}}*end(){for(;this.stack.length>0;)yield*this.pop()}get sourceToken(){return{type:this.type,offset:this.offset,indent:this.indent,source:this.source}}*step(){let e=this.peek(1);if(this.type==="doc-end"&&e?.type!=="doc-end"){for(;this.stack.length>0;)yield*this.pop();this.stack.push({type:"doc-end",offset:this.offset,source:this.source});return}if(!e)return yield*this.stream();switch(e.type){case"document":return yield*this.document(e);case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return yield*this.scalar(e);case"block-scalar":return yield*this.blockScalar(e);case"block-map":return yield*this.blockMap(e);case"block-seq":return yield*this.blockSequence(e);case"flow-collection":return yield*this.flowCollection(e);case"doc-end":return yield*this.documentEnd(e)}yield*this.pop()}peek(e){return this.stack[this.stack.length-e]}*pop(e){let t=e??this.stack.pop();if(!t)yield{type:"error",offset:this.offset,source:"",message:"Tried to pop an empty stack"};else if(this.stack.length===0)yield t;else{let r=this.peek(1);switch(t.type==="block-scalar"?t.indent="indent"in r?r.indent:0:t.type==="flow-collection"&&r.type==="document"&&(t.indent=0),t.type==="flow-collection"&&oc(t),r.type){case"document":r.value=t;break;case"block-scalar":r.props.push(t);break;case"block-map":{let i=r.items[r.items.length-1];if(i.value){r.items.push({start:[],key:t,sep:[]}),this.onKeyLine=!0;return}else if(i.sep)i.value=t;else{Object.assign(i,{key:t,sep:[]}),this.onKeyLine=!i.explicitKey;return}break}case"block-seq":{let i=r.items[r.items.length-1];i.value?r.items.push({start:[],value:t}):i.value=t;break}case"flow-collection":{let i=r.items[r.items.length-1];!i||i.value?r.items.push({start:[],key:t,sep:[]}):i.sep?i.value=t:Object.assign(i,{key:t,sep:[]});return}default:yield*this.pop(),yield*this.pop(t)}if((r.type==="document"||r.type==="block-map"||r.type==="block-seq")&&(t.type==="block-map"||t.type==="block-seq")){let i=t.items[t.items.length-1];i&&!i.sep&&!i.value&&i.start.length>0&&sc(i.start)===-1&&(t.indent===0||i.start.every(s=>s.type!=="comment"||s.indent<t.indent))&&(r.type==="document"?r.end=i.start:r.items.push({start:i.start}),t.items.splice(-1,1))}}}*stream(){switch(this.type){case"directive-line":yield{type:"directive",offset:this.offset,source:this.source};return;case"byte-order-mark":case"space":case"comment":case"newline":yield this.sourceToken;return;case"doc-mode":case"doc-start":{let e={type:"document",offset:this.offset,start:[]};this.type==="doc-start"&&e.start.push(this.sourceToken),this.stack.push(e);return}}yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML stream`,source:this.source}}*document(e){if(e.value)return yield*this.lineEnd(e);switch(this.type){case"doc-start":{sc(e.start)!==-1?(yield*this.pop(),yield*this.step()):e.start.push(this.sourceToken);return}case"anchor":case"tag":case"space":case"comment":case"newline":e.start.push(this.sourceToken);return}let t=this.startBlockValue(e);t?this.stack.push(t):yield{type:"error",offset:this.offset,message:`Unexpected ${this.type} token in YAML document`,source:this.source}}*scalar(e){if(this.type==="map-value-ind"){let t=Mn(this.peek(2)),r=Qe(t),i;e.end?(i=e.end,i.push(this.sourceToken),delete e.end):i=[this.sourceToken];let s={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:r,key:e,sep:i}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=s}else yield*this.lineEnd(e)}*blockScalar(e){switch(this.type){case"space":case"comment":case"newline":e.props.push(this.sourceToken);return;case"scalar":if(e.source=this.source,this.atNewLine=!0,this.indent=0,this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}yield*this.pop();break;default:yield*this.pop(),yield*this.step()}}*blockMap(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(this.onKeyLine=!1,t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else if(t.sep)t.sep.push(this.sourceToken);else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Un(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return}if(this.indent>=e.indent){let r=!this.onKeyLine&&this.indent===e.indent,i=r&&(t.sep||t.explicitKey)&&this.type!=="seq-item-ind",s=[];if(i&&t.sep&&!t.value){let o=[];for(let a=0;a<t.sep.length;++a){let c=t.sep[a];switch(c.type){case"newline":o.push(a);break;case"space":break;case"comment":c.indent>e.indent&&(o.length=0);break;default:o.length=0}}o.length>=2&&(s=t.sep.splice(o[1]))}switch(this.type){case"anchor":case"tag":i||t.value?(s.push(this.sourceToken),e.items.push({start:s}),this.onKeyLine=!0):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"explicit-key-ind":!t.sep&&!t.explicitKey?(t.start.push(this.sourceToken),t.explicitKey=!0):i||t.value?(s.push(this.sourceToken),e.items.push({start:s,explicitKey:!0})):this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken],explicitKey:!0}]}),this.onKeyLine=!0;return;case"map-value-ind":if(t.explicitKey)if(t.sep)if(t.value)e.items.push({start:[],key:null,sep:[this.sourceToken]});else if(Se(t.sep,"map-value-ind"))this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:s,key:null,sep:[this.sourceToken]}]});else if(ac(t.key)&&!Se(t.sep,"newline")){let o=Qe(t.start),a=t.key,c=t.sep;c.push(this.sourceToken),delete t.key,delete t.sep,this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:a,sep:c}]})}else s.length>0?t.sep=t.sep.concat(s,this.sourceToken):t.sep.push(this.sourceToken);else if(Se(t.start,"newline"))Object.assign(t,{key:null,sep:[this.sourceToken]});else{let o=Qe(t.start);this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:o,key:null,sep:[this.sourceToken]}]})}else t.sep?t.value||i?e.items.push({start:s,key:null,sep:[this.sourceToken]}):Se(t.sep,"map-value-ind")?this.stack.push({type:"block-map",offset:this.offset,indent:this.indent,items:[{start:[],key:null,sep:[this.sourceToken]}]}):t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});this.onKeyLine=!0;return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let o=this.flowScalar(this.type);i||t.value?(e.items.push({start:s,key:o,sep:[]}),this.onKeyLine=!0):t.sep?this.stack.push(o):(Object.assign(t,{key:o,sep:[]}),this.onKeyLine=!0);return}default:{let o=this.startBlockValue(e);if(o){if(o.type==="block-seq"){if(!t.explicitKey&&t.sep&&!Se(t.sep,"newline")){yield*this.pop({type:"error",offset:this.offset,message:"Unexpected block-seq-ind on same line with key",source:this.source});return}}else r&&e.items.push({start:s});this.stack.push(o);return}}}}yield*this.pop(),yield*this.step()}*blockSequence(e){let t=e.items[e.items.length-1];switch(this.type){case"newline":if(t.value){let r="end"in t.value?t.value.end:void 0;(Array.isArray(r)?r[r.length-1]:void 0)?.type==="comment"?r?.push(this.sourceToken):e.items.push({start:[this.sourceToken]})}else t.start.push(this.sourceToken);return;case"space":case"comment":if(t.value)e.items.push({start:[this.sourceToken]});else{if(this.atIndentedComment(t.start,e.indent)){let i=e.items[e.items.length-2]?.value?.end;if(Array.isArray(i)){Un(i,t.start),i.push(this.sourceToken),e.items.pop();return}}t.start.push(this.sourceToken)}return;case"anchor":case"tag":if(t.value||this.indent<=e.indent)break;t.start.push(this.sourceToken);return;case"seq-item-ind":if(this.indent!==e.indent)break;t.value||Se(t.start,"seq-item-ind")?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return}if(this.indent>e.indent){let r=this.startBlockValue(e);if(r){this.stack.push(r);return}}yield*this.pop(),yield*this.step()}*flowCollection(e){let t=e.items[e.items.length-1];if(this.type==="flow-error-end"){let r;do yield*this.pop(),r=this.peek(1);while(r?.type==="flow-collection")}else if(e.end.length===0){switch(this.type){case"comma":case"explicit-key-ind":!t||t.sep?e.items.push({start:[this.sourceToken]}):t.start.push(this.sourceToken);return;case"map-value-ind":!t||t.value?e.items.push({start:[],key:null,sep:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):Object.assign(t,{key:null,sep:[this.sourceToken]});return;case"space":case"comment":case"newline":case"anchor":case"tag":!t||t.value?e.items.push({start:[this.sourceToken]}):t.sep?t.sep.push(this.sourceToken):t.start.push(this.sourceToken);return;case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":{let i=this.flowScalar(this.type);!t||t.value?e.items.push({start:[],key:i,sep:[]}):t.sep?this.stack.push(i):Object.assign(t,{key:i,sep:[]});return}case"flow-map-end":case"flow-seq-end":e.end.push(this.sourceToken);return}let r=this.startBlockValue(e);r?this.stack.push(r):(yield*this.pop(),yield*this.step())}else{let r=this.peek(2);if(r.type==="block-map"&&(this.type==="map-value-ind"&&r.indent===e.indent||this.type==="newline"&&!r.items[r.items.length-1].sep))yield*this.pop(),yield*this.step();else if(this.type==="map-value-ind"&&r.type!=="flow-collection"){let i=Mn(r),s=Qe(i);oc(e);let o=e.end.splice(1,e.end.length);o.push(this.sourceToken);let a={type:"block-map",offset:e.offset,indent:e.indent,items:[{start:s,key:e,sep:o}]};this.onKeyLine=!0,this.stack[this.stack.length-1]=a}else yield*this.lineEnd(e)}}flowScalar(e){if(this.onNewLine){let t=this.source.indexOf(`
`)+1;for(;t!==0;)this.onNewLine(this.offset+t),t=this.source.indexOf(`
`,t)+1}return{type:e,offset:this.offset,indent:this.indent,source:this.source}}startBlockValue(e){switch(this.type){case"alias":case"scalar":case"single-quoted-scalar":case"double-quoted-scalar":return this.flowScalar(this.type);case"block-scalar-header":return{type:"block-scalar",offset:this.offset,indent:this.indent,props:[this.sourceToken],source:""};case"flow-map-start":case"flow-seq-start":return{type:"flow-collection",offset:this.offset,indent:this.indent,start:this.sourceToken,items:[],end:[]};case"seq-item-ind":return{type:"block-seq",offset:this.offset,indent:this.indent,items:[{start:[this.sourceToken]}]};case"explicit-key-ind":{this.onKeyLine=!0;let t=Mn(e),r=Qe(t);return r.push(this.sourceToken),{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,explicitKey:!0}]}}case"map-value-ind":{this.onKeyLine=!0;let t=Mn(e),r=Qe(t);return{type:"block-map",offset:this.offset,indent:this.indent,items:[{start:r,key:null,sep:[this.sourceToken]}]}}}return null}atIndentedComment(e,t){return this.type!=="comment"||this.indent<=t?!1:e.every(r=>r.type==="newline"||r.type==="space")}*documentEnd(e){this.type!=="doc-mode"&&(e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop()))}*lineEnd(e){switch(this.type){case"comma":case"doc-start":case"doc-end":case"flow-seq-end":case"flow-map-end":case"map-value-ind":yield*this.pop(),yield*this.step();break;case"newline":this.onKeyLine=!1;default:e.end?e.end.push(this.sourceToken):e.end=[this.sourceToken],this.type==="newline"&&(yield*this.pop())}}};cc.Parser=Di});var pc=w(It=>{"use strict";var lc=Ti(),Dm=Nt(),Rt=vt(),Pm=Er(),qm=C(),$m=Ci(),dc=Pi();function uc(n){let e=n.prettyErrors!==!1;return{lineCounter:n.lineCounter||e&&new $m.LineCounter||null,prettyErrors:e}}function Mm(n,e={}){let{lineCounter:t,prettyErrors:r}=uc(e),i=new dc.Parser(t?.addNewLine),s=new lc.Composer(e),o=Array.from(s.compose(i.parse(n)));if(r&&t)for(let a of o)a.errors.forEach(Rt.prettifyError(n,t)),a.warnings.forEach(Rt.prettifyError(n,t));return o.length>0?o:Object.assign([],{empty:!0},s.streamInfo())}function fc(n,e={}){let{lineCounter:t,prettyErrors:r}=uc(e),i=new dc.Parser(t?.addNewLine),s=new lc.Composer(e),o=null;for(let a of s.compose(i.parse(n),!0,n.length))if(!o)o=a;else if(o.options.logLevel!=="silent"){o.errors.push(new Rt.YAMLParseError(a.range.slice(0,2),"MULTIPLE_DOCS","Source contains multiple documents; please use YAML.parseAllDocuments()"));break}return r&&t&&(o.errors.forEach(Rt.prettifyError(n,t)),o.warnings.forEach(Rt.prettifyError(n,t))),o}function Um(n,e,t){let r;typeof e=="function"?r=e:t===void 0&&e&&typeof e=="object"&&(t=e);let i=fc(n,t);if(!i)return null;if(i.warnings.forEach(s=>Pm.warn(i.options.logLevel,s)),i.errors.length>0){if(i.options.logLevel!=="silent")throw i.errors[0];i.errors=[]}return i.toJS(Object.assign({reviver:r},t))}function Bm(n,e,t){let r=null;if(typeof e=="function"||Array.isArray(e)?r=e:t===void 0&&e&&(t=e),typeof t=="string"&&(t=t.length),typeof t=="number"){let i=Math.round(t);t=i<1?void 0:i>8?{indent:8}:{indent:i}}if(n===void 0){let{keepUndefined:i}=t??e??{};if(!i)return}return qm.isDocument(n)&&!r?n.toString(t):new Dm.Document(n,r,t).toString(t)}It.parse=Um;It.parseAllDocuments=Mm;It.parseDocument=fc;It.stringify=Bm});var Fn=w(P=>{"use strict";var Fm=Ti(),jm=Nt(),Km=ti(),qi=vt(),Xm=ot(),ve=C(),zm=_e(),Ym=F(),Vm=Ne(),Gm=we(),Jm=qn(),Hm=Ii(),Wm=Ci(),Zm=Pi(),Bn=pc(),mc=nt();P.Composer=Fm.Composer;P.Document=jm.Document;P.Schema=Km.Schema;P.YAMLError=qi.YAMLError;P.YAMLParseError=qi.YAMLParseError;P.YAMLWarning=qi.YAMLWarning;P.Alias=Xm.Alias;P.isAlias=ve.isAlias;P.isCollection=ve.isCollection;P.isDocument=ve.isDocument;P.isMap=ve.isMap;P.isNode=ve.isNode;P.isPair=ve.isPair;P.isScalar=ve.isScalar;P.isSeq=ve.isSeq;P.Pair=zm.Pair;P.Scalar=Ym.Scalar;P.YAMLMap=Vm.YAMLMap;P.YAMLSeq=Gm.YAMLSeq;P.CST=Jm;P.Lexer=Hm.Lexer;P.LineCounter=Wm.LineCounter;P.Parser=Zm.Parser;P.parse=Bn.parse;P.parseAllDocuments=Bn.parseAllDocuments;P.parseDocument=Bn.parseDocument;P.stringify=Bn.stringify;P.visit=mc.visit;P.visitAsync=mc.visitAsync});import{closeSync as gg,existsSync as qt,fsyncSync as yg,mkdirSync as bg,openSync as Eg,readFileSync as rl,readdirSync as _g,renameSync as el,rmSync as Ji,statSync as il,writeFileSync as Tg}from"node:fs";import{randomUUID as tl}from"node:crypto";import{dirname as Pt,join as G,resolve as oe}from"node:path";import{DatabaseSync as Ng}from"node:sqlite";import{createHash as Bl}from"node:crypto";var Ut=8,is=2,ss="0.7.0";function J(n){let e=t=>Array.isArray(t)?t.map(e):t!==null&&typeof t=="object"?Object.fromEntries(Object.entries(t).filter(([,r])=>r!==void 0).sort(([r],[i])=>r.localeCompare(i)).map(([r,i])=>[r,e(i)])):t;return JSON.stringify(e(n))}function Ae(n){return Bl("sha256").update(J(n)).digest("hex")}function os(n){return Ae({projectRoot:n}).slice(0,24)}function as(n){let{zephyrRoot:e,projectRoot:t,...r}=n;return Ae(r)}var cs=Ut,ls=`
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
`,ds=`
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
`;import{existsSync as Es,mkdtempSync as dd,readFileSync as ud,realpathSync as fd,rmSync as pd,writeFileSync as md}from"node:fs";import{tmpdir as hd}from"node:os";import{join as Le,resolve as tr}from"node:path";import{spawnSync as gd}from"node:child_process";var us=`#!/usr/bin/env python3
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
`;function fs(n){return n.split(`
`).map(e=>e.replace(/^\s*\*\/?/,"").replace(/^ /,"")).join(`
`).trim()}function ps(n){let e={detail:"",params:[],returns:[],retvals:[],deprecated:!1},t=n.split(`
`),r=[],i={kind:"detail"},s=o=>{let a=o.trim();if(a)switch(i.kind){case"brief":e.brief=e.brief?`${e.brief} ${a}`:a;break;case"param":{let c=e.params[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}case"return":{let c=i.index;e.returns[c]=e.returns[c]?`${e.returns[c]} ${a}`:a;break}case"retval":{let c=e.retvals[i.index];c&&(c.description=c.description?`${c.description} ${a}`:a);break}default:r.push(a)}};for(let o of t){let a=o.trim();if(a===""){i.kind==="brief"?i={kind:"detail"}:i.kind==="detail"&&r.push("");continue}if(a==="@{"||a==="@}")continue;let c=a.match(/^[@\\]([a-zA-Z]+)\s*(.*)$/);if(!c){s(a);continue}let[,l="",p=""]=c,d=l.toLowerCase(),u=p.trim();switch(d){case"brief":case"short":i={kind:"brief"},s(u);break;case"param":{let m=u.match(/^(?:\[([a-z,\s]+)\]\s*)?(\S+)\s*(.*)$/);if(m){let y={name:m[2],description:(m[3]??"").trim()};m[1]&&(y.direction=m[1].replace(/\s+/g,"")),e.params.push(y),i={kind:"param",index:e.params.length-1}}break}case"return":case"returns":case"result":e.returns.push(u),i={kind:"return",index:e.returns.length-1};break;case"retval":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.retvals.push({value:m[1],description:(m[2]??"").trim()}),i={kind:"retval",index:e.retvals.length-1});break}case"defgroup":{let m=u.match(/^(\S+)\s*(.*)$/);m&&(e.defgroup={id:m[1],title:(m[2]??"").trim()}),i={kind:"detail"};break}case"addtogroup":e.addtogroup=u.split(/\s+/)[0],i={kind:"detail"};break;case"ingroup":e.ingroup=u.split(/\s+/)[0],i={kind:"detail"};break;case"since":e.since=u,i={kind:"detail"};break;case"deprecated":e.deprecated=!0,i={kind:"detail"},s(u);break;case"note":case"warning":case"details":case"remark":i={kind:"detail"},s(`${l.toUpperCase()}: ${u}`);break;case"version":case"name":case"file":case"cond":case"endcond":case"internal":case"endinternal":i={kind:"detail"};break;default:i={kind:"detail"},s(u);break}}e.detail=r.join(`
`).replace(/\n{3,}/g,`

`).trim(),e.brief&&(e.brief=Be(e.brief)),e.detail=Be(e.detail),e.returns=e.returns.map(Be);for(let o of e.params)o.description=Be(o.description);for(let o of e.retvals)o.description=Be(o.description);return e}function Be(n){return n.replace(/[@\\](?:a|p|c|e|em|b)\s+(\S+)/g,"$1").replace(/[@\\]ref\s+(\S+)/g,"$1").replace(/[@\\]kconfig\{([^}]*)\}/g,"$1").replace(/[@\\]f\$/g,"").replace(/[ \t]{2,}/g," ").trim()}function jl(n){let e=[];for(let t of n.split(`
`)){let r=t.trim(),i=r.match(/^[@\\]defgroup\s+(\S+)\s*(.*)$/);if(i){e.push({kind:"define",id:i[1],title:(i[2]??"").trim()});continue}let s=r.match(/^[@\\]addtogroup\s+(\S+)/);if(s){e.push({kind:"add",id:s[1]});continue}for(let o of r.matchAll(/[@\\]([{}])/g))e.push(o[1]==="{"?{kind:"open"}:{kind:"close"})}return e}function Fe(n){return n.replace(/\s*\n\s*/g," ").replace(/\s{2,}/g," ").replace(/\s*,\s*/g,", ").trim()}var Kl=["z_impl_"];function Xl(n){for(let e of Kl)if(n.startsWith(e))return n.slice(e.length);return n}var zl=String.raw`(?:__[A-Za-z_][A-Za-z0-9_]*(?:\s*\([^)]*\))?\s+)*`,Yl=new RegExp(String.raw`^(struct|union|enum)\s+${zl}([A-Za-z_][A-Za-z0-9_]*)\s*([{;]|$)`),Vl=/^[^(]*\(\s*\*/;function Gl(n){let e=n.trim();if(!e)return null;let t=e.match(/^#\s*define\s+([A-Za-z_][A-Za-z0-9_]*)\s*(\([^)]*\))?/);if(t){let a=t[1],c=Fe(e.split(`
`)[0].replace(/\\$/,""));return{kind:"macro",name:a,signature:c}}let r=e.match(/^typedef\s+[\s\S]*?\(\s*\*?\s*([A-Za-z_][A-Za-z0-9_]*)\s*\)\s*\(/);if(r)return{kind:"typedef",name:r[1],signature:Fe(e)};let i=e.match(/^typedef\s+[\s\S]+?\b([A-Za-z_][A-Za-z0-9_]*)\s*;/);if(i)return{kind:"typedef",name:i[1],signature:Fe(e)};let s=e.match(Yl);if(s)return{kind:s[1],name:s[2],signature:Fe(e.replace(/\{[\s\S]*$/,"").trim())};if(Vl.test(e))return null;let o=e.match(/([A-Za-z_][A-Za-z0-9_]*)\s*\(([\s\S]*)$/);if(o&&/^[A-Za-z_][A-Za-z0-9_ \t*]*[\s*]/.test(e)){let a=o[1];return a==="if"||a==="for"||a==="while"||a==="switch"?null:{kind:"function",name:Xl(a),signature:Fe(e.replace(/\s*\{[\s\S]*$/,"").replace(/;\s*$/,""))}}return null}function Jl(n,e){let t=0,r=!1,i=!1,s=[];for(let o=e;o<n.length;o++){let a=n[o];s.push(a);for(let c=0;c<a.length;c++){let l=a[c];if(i){l==="*"&&a[c+1]==="/"&&(i=!1,c++);continue}if(l==="/"&&a[c+1]==="*")i=!0,c++;else{if(l==="/"&&a[c+1]==="/")break;l==="{"?(t++,r=!0):l==="}"&&t--}}if(r&&t<=0){let c=s.join(`
`),l=c.indexOf("{"),p=c.lastIndexOf("}");return l<0||p<l?null:{body:c.slice(0,l+1).replace(/[^\n]/g,"")+c.slice(l+1,p),line:e,endLine:o}}}return null}function Hl(n,e){let t=n.split(`
`).map(f=>/^\s*#/.test(f)?"":f).join(`
`),r=[],i="",s=[],o=[],a=[],c=0,l=e,p=e,d=()=>{r.push({code:i,before:s,trailingPrevious:o,trailingOwn:a,line:p}),i="",s=[],o=[],a=[]};for(let f=0;f<t.length;f++){let g=t[f];if(g===`
`){l++,i+=" ";continue}if(g==="/"&&t[f+1]==="*"){let E=t.indexOf("*/",f+2),b=E<0?t.length:E+2,T=t.slice(f,b);/^\/\*[*!]</.test(T)?(i.trim()?a:o).push(T):/^\/\*[*!]/.test(T)&&s.push(T);for(let N of T)N===`
`&&l++;f=b-1;continue}if(g==="/"&&t[f+1]==="/"){let E=t.indexOf(`
`,f);f=(E<0?t.length:E)-1;continue}if(g==="("||g==="[")c++;else if(g===")"||g==="]")c--;else if(g===","&&c<=0){d();continue}!i.trim()&&g.trim()&&(p=l),i+=g}d();let u=f=>fs(f.replace(/^\/\*[*!]<?/,"").replace(/\*\/\s*$/,"")),m=[],y=(f,g)=>{f&&g&&!f.brief&&(f.brief=Be(u(g)))};for(let f of r){y(m[m.length-1],f.trailingPrevious[0]);let g=f.code.trim().match(/^([A-Za-z_][A-Za-z0-9_]*)\s*(?:=\s*([\s\S]+))?$/);if(!g)continue;let E=f.before[f.before.length-1],b=E?ps(u(E)):void 0,T=b?.brief??b?.detail??"",N={name:g[1],value:Fe(g[2]??""),brief:T,detail:b?.brief?b.detail??"":"",line:f.line};m.push(N),y(N,f.trailingOwn[0])}return m}function Wl(n,e){let t=e,r=/^\s*(#\s*(if|ifdef|ifndef|else|elif|endif)\b|__deprecated\b|__syscall_always_inline\b)/;for(;t<n.length;){let o=n[t];if(o.trim()===""||r.test(o)){t++;continue}break}if(t>=n.length)return null;if(/^\s*#\s*define\b/.test(n[t])){let o=[],a=t;for(;a<n.length&&(o.push(n[a]),!!n[a].trimEnd().endsWith("\\"));)a++;return{text:o.join(`
`),line:t}}let i=[],s=0;for(let o=t;o<n.length&&o<t+40;o++){let a=n[o];i.push(a);for(let c of a)c==="("?s++:c===")"&&s--;if(s<=0&&(a.includes(";")||a.includes("{")))break}return{text:i.join(`
`),line:t}}function ms(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=[],i=[],s=[];for(let o=0;o<t.length;o++){let a=t[o];if(!/\/\*\*|\/\*!/.test(a))continue;let c=[],l=o,p=!1;for(;l<t.length;l++)if(c.push(t[l]),t[l].includes("*/")){p=!0;break}if(!p)continue;let d=c.join(`
`).replace(/^[\s\S]*?\/\*[*!]/,"").replace(/\*\/[\s\S]*$/,""),u={text:fs(d),endLine:l},m=ps(u.text),y=jl(u.text);if(y.length>0){let T;for(let N of y)switch(N.kind){case"define":{let S={id:N.id,title:N.title,header:e},k=m.ingroup??s[s.length-1];k&&(S.parent=k),i.push(S),T=N.id;break}case"add":T=N.id;break;case"open":s.push(T??s[s.length-1]??""),T=void 0;break;case"close":s.pop();break}if(!m.brief&&m.params.length===0&&m.retvals.length===0){o=l;continue}}let f=Wl(t,l+1);if(!f){o=l;continue}let g=Gl(f.text);if(!g){o=l;continue}let E=m.ingroup??s.filter(Boolean)[s.filter(Boolean).length-1],b={name:g.name,kind:g.kind,signature:g.signature,params:m.params,returns:m.returns,retvals:m.retvals,header:e,line:f.line+1,deprecated:m.deprecated};if(m.brief&&(b.brief=m.brief),m.detail&&(b.detail=m.detail),E&&(b.group=E),m.since&&(b.since=m.since),r.push(b),o=l,g.kind==="enum"&&f.text.includes("{")){let T=Jl(t,f.line);if(T){for(let N of Hl(T.body,T.line)){let S={name:N.name,kind:"enumvalue",signature:N.value?`${N.name} = ${N.value}`:N.name,params:[],returns:[],retvals:[],header:e,line:N.line+1,deprecated:!1,parentSymbol:g.name};N.brief&&(S.brief=N.brief),N.detail&&(S.detail=N.detail),E&&(S.group=E),r.push(S)}o=T.endLine}}}return{symbols:r,groups:i}}import{existsSync as id}from"node:fs";import{join as Bt}from"node:path";import{spawnSync as ys}from"node:child_process";import{existsSync as Qn,readFileSync as Zl,realpathSync as Ql}from"node:fs";import{delimiter as ed,join as td,resolve as nd}from"node:path";function hs(n,e){if(n.includes("/")||n.includes("\\"))return Qn(n)?nd(n):void 0;for(let t of(e??"").split(ed).filter(Boolean)){let r=td(t,n);if(Qn(r))return r}}function rd(n){let e=hs("west",n.PATH);if(e)try{let r=(Zl(Ql(e),"utf8").split(/\r?\n/,1)[0]??"").match(/^#!\s*(\S+)(?:\s+(.+))?$/);return r?r[1]?.endsWith("/env")&&r[2]?hs(r[2].trim().split(/\s+/,1)[0],n.PATH):r[1]&&Qn(r[1])?r[1]:void 0:void 0}catch{return}}function er(n){return[n.PYTHON_EXECUTABLE,rd(n),"python3","python"].filter((e,t,r)=>!!e&&r.indexOf(e)===t)}function gs(n){let e=new Map;for(let t of n.split(/\r?\n/)){let r=t.split("#")[0].trim();if(r===""||r.startsWith("-"))continue;let[i,...s]=r.split(";"),o=i.split("[")[0].split(/[<>=!~]/)[0].trim();if(o==="")continue;let a=s.join(";").trim();e.has(o)||e.set(o,{name:o,...a?{marker:a}:{}})}return[...e.values()]}function Ft(n=process.env){for(let e of er(n))if(ys(e,["-c","import sys; assert sys.version_info >= (3, 12)"],{encoding:"utf8",env:{...n,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return e;throw new Error("This index adapter requires Python 3.12 or newer. Set PYTHON_EXECUTABLE to a supported interpreter and retry.")}function je(n,e=process.env){let t=Bt(n,"scripts","kconfig"),r=Bt(n,"scripts","dts","python-devicetree","src");if([Bt(t,"kconfiglib.py"),Bt(r,"devicetree","edtlib.py")].filter(a=>!id(a)).length>0)throw new Error("The selected Zephyr tree is missing its semantic ingestion libraries (scripts/kconfig/kconfiglib.py and/or scripts/dts/python-devicetree). Use a complete Zephyr checkout and retry.");let s=er(e),o=["import sys",`sys.path.insert(0, ${JSON.stringify(t)})`,`sys.path.insert(0, ${JSON.stringify(r)})`,"import kconfiglib","import yaml","from devicetree import edtlib","assert sys.version_info >= (3, 12)"].join("; ");for(let a of s)if(ys(a,["-c",o],{encoding:"utf8",env:{...e,PYTHONDONTWRITEBYTECODE:"1"}}).status===0)return a;throw new Error("Semantic index creation requires Python 3.12 or newer with PyYAML, plus the Kconfiglib and devicetree libraries shipped by the selected Zephyr tree. Activate the project's west virtual environment or set PYTHON_EXECUTABLE to its Python interpreter, then retry.")}import{existsSync as sd,readdirSync as od}from"node:fs";import{join as ad,relative as cd,sep as bs}from"node:path";var ld=new Set([".git","node_modules","__pycache__",".venv","build","twister-out"]);function*ee(n,e={}){if(!sd(n))return;let t=e.skipDirs??ld,r=e.skipPrefixes??[],i=[n];for(;i.length>0;){let s=i.pop(),o;try{o=od(s,{withFileTypes:!0})}catch(a){throw new Error(`Failed to read source directory ${s}: ${a instanceof Error?a.message:String(a)}`)}for(let a of o){let c=ad(s,a.name),l=he(cd(n,c));if(a.isDirectory()){if(t.has(a.name)||r.some(p=>l===p||l.startsWith(`${p}/`)))continue;i.push(c)}else if(a.isFile()){if(r.some(p=>l.startsWith(`${p}/`))||e.match&&!e.match(a.name))continue;yield l}else if(a.isSymbolicLink())throw new Error(`Refusing symbolic link in indexed source tree: ${c}`)}}}function he(n){return bs==="/"?n:n.split(bs).join("/")}function _s(n){let e=tr(n),t=e;try{t=fd(e)}catch{}return[...new Set([e,t])].flatMap(r=>[tr(r,"..","doxygen","xml"),tr(r,"doc","_build","doxygen","xml")]).find(r=>Es(Le(r,"index.xml")))}function yd(n,e){if(!Es(Le(e,"index.xml")))throw new Error(`The Doxygen XML directory has no index.xml: ${e}`);let t=dd(Le(hd(),"zephyr-ai-api-")),r=Le(t,"api-export.py");try{md(r,us,{mode:384});let i=gd(Ft(),[r,"--xml",e],{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(i.status!==0){let o=i.stderr?.trim()??"";try{let a=JSON.parse(i.stdout).report;if(a?.errors?.length){let c=a.errors.slice(0,8).map(p=>`- ${p.code}: ${p.message}${p.path?` (${p.path})`:""}`),l=a.errors.length-c.length;o=`${a.errors.length} error(s) in the Doxygen XML:
${c.join(`
`)}${l>0?`
- ... and ${l} more`:""}`}}catch{}throw new Error(`Doxygen XML export failed.
${o||"The exporter produced no diagnostic output."}`)}let s=JSON.parse(i.stdout);return s.symbols=s.symbols.map(o=>{let a=o.header.replaceAll("\\","/"),c="/include/zephyr/",l=a.lastIndexOf(c);return{...o,header:l>=0?`include/zephyr/${a.slice(l+c.length)}`:a}}),s}finally{pd(t,{recursive:!0,force:!0})}}function Ts(n,e){if(e)return yd(n,e);let t=Le(n,"include","zephyr"),r=[],i=[],s=[];for(let a of ee(t,{skipPrefixes:["internal","arch/arm/internal"],match:c=>c.endsWith(".h")})){let c;try{c=ud(Le(t,a),"utf8")}catch(d){throw new Error(`Cannot read public API header ${Le(t,a)}: ${d instanceof Error?d.message:String(d)}`)}let l=`include/zephyr/${a}`,p=ms(c,l);for(let d of p.symbols){if(d.kind==="function"&&d.signature.includes("=")){s.push({path:`${l}:${d.line}`,reason:"fallback-initializer-artifact"});continue}let u=d.signature.indexOf("["),m=d.signature.indexOf("(");if(d.kind==="function"&&u>=0&&(m<0||u<m)){s.push({path:`${l}:${d.line}`,reason:"fallback-array-declarator-artifact"});continue}if(d.kind==="macro"&&/^#define\s+[A-Z][A-Z0-9_]*_H_*$/.test(d.signature)){s.push({path:`${l}:${d.line}`,reason:"fallback-include-guard"});continue}r.push(d)}i.push(...p.groups)}r.sort((a,c)=>a.name.localeCompare(c.name));let o=new Map;for(let a of i)(!o.has(a.id)||a.title&&!o.get(a.id).title)&&o.set(a.id,a);return{symbols:r,groups:[...o.values()],mode:"header-fallback",report:{discovered:r.length+o.size+s.length+1,indexed:r.length+o.size,intentionallyExcluded:[...s,{path:"include/zephyr/internal",reason:"private-header-policy"}],warnings:[{code:"header-fallback",message:"Doxygen XML was not supplied; API results are an incomplete header-comment catalogue."}],errors:[]}}}import{existsSync as Ed,mkdtempSync as _d,rmSync as Td,writeFileSync as Nd}from"node:fs";import{tmpdir as wd}from"node:os";import{dirname as ws,join as nr}from"node:path";import{spawnSync as Sd}from"node:child_process";var Ns=`#!/usr/bin/env python3
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
`;var Ss=new Map;function vs(n){let e=JSON.stringify(n),t=Ss.get(e);if(t)return t;if(n.length===0)throw new Error("At least one devicetree binding root is required.");let r=ws(ws(n[0])),i=nr(r,"scripts","dts","python-devicetree","src","devicetree","edtlib.py");if(!Ed(i))throw new Error("The selected Zephyr tree does not provide its Python devicetree tooling.");let s=_d(nr(wd(),"zephyr-ai-bindings-")),o=nr(s,"binding-export.py");try{Nd(o,Ns,{mode:384});let a=[o,"--zephyr",r];for(let p of n)a.push("--root",p);let c=Sd(je(r),a,{encoding:"utf8",maxBuffer:512*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(c.status!==0){let p="";try{p=(JSON.parse(c.stdout).report?.errors??[]).slice(0,12).map(m=>`${m.path??"<unknown>"} [${m.code}]: ${m.message}`).join(`
`)}catch{}let d=p||c.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`Zephyr devicetree binding export failed.
${d}`)}let l=JSON.parse(c.stdout);return Ss.set(e,l),l}finally{Td(s,{recursive:!0,force:!0})}}var hc=Zn(Fn(),1);import{existsSync as Qm,readFileSync as eh,readdirSync as th}from"node:fs";import{dirname as $i,join as fe}from"node:path";import{spawnSync as nh}from"node:child_process";function Mi(n){try{let e=(0,hc.parse)(eh(n,"utf8"),{logLevel:"silent"});if(!e||typeof e!="object"||Array.isArray(e))throw new Error("expected a YAML mapping");return e}catch(e){throw new Error(`Failed to parse board/SoC metadata ${n}: ${e.message}`)}}function se(n){return Array.isArray(n)?n:[]}function xt(n){return se(n).filter(e=>typeof e=="string")}function rh(n){let e=fe(n,"scripts","list_boards.py");if(!Qm(e))throw new Error("The selected Zephyr tree has no scripts/list_boards.py.");let t;for(let i of[process.env.PYTHON_EXECUTABLE,"python3","python"])if(i&&(t=nh(i,[e,"--board-root",n,"--soc-root",n,"--arch-root",n,"--cmakeformat=@@{NAME}@@{QUALIFIERS}@@{REVISIONS}@@{REVISION_DEFAULT}"],{encoding:"utf8",maxBuffer:64*1024*1024}),!t.error||t.error.code!=="ENOENT"))break;if(!t||t.status!==0)throw new Error(`Board ingestion requires Python 3 plus the PyYAML and jsonschema modules used by Zephyr scripts/list_boards.py. The official board exporter failed: ${t?.stderr.trim()??"Python was not found."}`);let r=new Map;for(let i of t.stdout.split(`
`).filter(Boolean)){let s=i.split("@@").filter(Boolean).map(p=>p.split(";")),o=p=>s.find(([d])=>d===p)?.slice(1)??[],a=o("NAME")[0];if(!a)continue;let c={qualifiers:o("QUALIFIERS").filter(Boolean),revisions:o("REVISIONS").filter(Boolean)},l=o("REVISION_DEFAULT")[0];l&&l!=="NOTFOUND"&&(c.defaultRevision=l),r.set(a,c)}return r}function ih(n){let e=[],t;try{t=th(n)}catch{return e}for(let r of t){if(!r.endsWith(".yaml")&&!r.endsWith(".yml")||r==="board.yml"||r==="board.yaml")continue;let i=Mi(fe(n,r)),s={toolchains:xt(i.toolchain),supported:xt(i.supported),...typeof i.name=="string"?{name:i.name}:{},...typeof i.arch=="string"?{arch:i.arch}:{},...typeof i.type=="string"?{type:i.type}:{},...typeof i.ram=="number"?{ram:i.ram}:{},...typeof i.flash=="number"?{flash:i.flash}:{},...typeof i.vendor=="string"?{vendor:i.vendor}:{}};typeof i.identifier=="string"&&e.push({identifier:i.identifier,...s});let o=i.variants&&typeof i.variants=="object"&&!Array.isArray(i.variants)?i.variants:{};for(let[a,c]of Object.entries(o)){let l=c&&typeof c=="object"&&!Array.isArray(c)?c:{};e.push({identifier:a,...s,toolchains:xt(l.toolchain).length?xt(l.toolchain):s.toolchains,supported:[...new Set([...s.supported,...xt(l.supported)])]})}}return e.sort((r,i)=>r.identifier.localeCompare(i.identifier)),e}function gc(n){let e=[],t=rh(n);for(let r of ee(fe(n,"boards"),{match:i=>i==="board.yml"||i==="board.yaml"})){let i=fe(n,"boards",r),s=Mi(i),o=[],a=s.board;a&&typeof a=="object"&&!Array.isArray(a)&&o.push(a);for(let y of se(s.boards))y&&typeof y=="object"&&!Array.isArray(y)&&o.push(y);if(o.length===0)continue;let c=$i(i),l=he(fe("boards",$i(r))),p=ih(c),d=[...ee(fe(c,"doc"),{match:y=>y.endsWith(".rst")})],u=d.includes("index.rst")?"index.rst":d.sort()[0],m=u?`${l}/doc/${u}`:void 0;for(let y of o){if(typeof y.name!="string")continue;let f=y.name,g=se(y.socs).flatMap(R=>{if(!R||typeof R!="object")return[];let K=R;return typeof K.name!="string"?[]:[{name:K.name,variants:se(K.variants).flatMap(U=>U&&typeof U=="object"&&typeof U.name=="string"?[U.name]:[]),cpuclusters:se(K.cpuclusters).flatMap(U=>U&&typeof U=="object"&&typeof U.name=="string"?[U.name]:[])}]}),E=p.filter(R=>R.identifier===f||R.identifier.startsWith(`${f}/`)),b=t.get(f);if(!b)throw new Error(`Zephyr's board model did not enumerate ${f}.`);let T=b.qualifiers.length>0?b.qualifiers:[""],N=T.map(R=>R?`${f}/${R}`:f);for(let R of b.revisions)N.push(...T.map(K=>K?`${f}@${R}/${K}`:`${f}@${R}`));let S=N.map(R=>({identifier:R,toolchains:[],supported:[]})),k=E.length>0?E:o.length===1?p:[],A=new Map(S.map(R=>[R.identifier,R]));for(let R of k){let K=A.get(R.identifier);A.set(R.identifier,K?{...K,...R}:R)}let _=[...A.values()].sort((R,K)=>R.identifier.localeCompare(K.identifier)),v={name:f,dir:l,socs:g,targets:_,revisions:b.revisions,supported:[...new Set(_.flatMap(R=>R.supported))].sort()};typeof y.full_name=="string"&&(v.fullName=y.full_name),typeof y.vendor=="string"&&(v.vendor=y.vendor),b.defaultRevision&&(v.defaultRevision=b.defaultRevision),m&&(v.docPath=m);let $=_.find(R=>R.arch)?.arch;$&&(v.arch=$);let ne=_.find(R=>R.ram!==void 0)?.ram;ne!==void 0&&(v.ram=ne);let M=_.find(R=>R.flash!==void 0)?.flash;M!==void 0&&(v.flash=M),e.push(v)}}return e.sort((r,i)=>r.name.localeCompare(i.name)),e}function yc(n){let e=[];for(let t of ee(fe(n,"soc"),{match:r=>r==="soc.yml"||r==="soc.yaml"})){let r=fe(n,"soc",t),i=Mi(r),s=he(fe("soc",$i(t))),o=t.includes("/")?t.split("/")[0]:void 0,a=(l,p,d)=>{if(typeof l.name!="string")return;let u={name:l.name,dir:s,cpuclusters:se(l.cpuclusters).flatMap(m=>m&&typeof m=="object"&&typeof m.name=="string"?[m.name]:[])};p&&(u.family=p),d&&(u.series=d),o&&(u.vendor=o),e.push(u)};(l=>{for(let p of l){if(!p||typeof p!="object")continue;let d=p,u=typeof d.name=="string"?d.name:void 0;for(let m of se(d.socs))m&&typeof m=="object"&&a(m,u);for(let m of se(d.series)){if(!m||typeof m!="object")continue;let y=m,f=typeof y.name=="string"?y.name:void 0;for(let g of se(y.socs))g&&typeof g=="object"&&a(g,u,f)}}})(se(i.family));for(let l of se(i.socs))l&&typeof l=="object"&&a(l)}return e.sort((t,r)=>t.name.localeCompare(r.name)),e}import{existsSync as dh,lstatSync as uh,readFileSync as Sc,realpathSync as Fi}from"node:fs";import{dirname as fh,extname as ph,join as _c,relative as ji,resolve as mh,sep as Tc}from"node:path";var sh="!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~";function jn(n){let e=n.trimEnd();if(e.length<2)return null;let t=e[0];if(!sh.includes(t))return null;for(let r of e)if(r!==t)return null;return{char:t,length:e.length}}function oh(n){let e=[];for(let t=0;t<n.length;t++){let r=jn(n[t]);if(!r)continue;let i=n[t-1];if(i===void 0)continue;let s=i.trim();if(s===""||r.length<s.length)continue;if(jn(i)){if(jn(n[t-2]??""))continue;continue}let o=jn(n[t-2]??""),a=o!==null&&o.char===r.char;e.push({line:t-1,text:s,char:r.char,overlined:a})}return e}function ah(n){let e=[];return n.map(t=>{let r=t.overlined?`over:${t.char}`:t.char,i=e.indexOf(r);return i===-1&&(i=e.length,e.push(r)),i})}var Bi=/^\.\.\s+_([A-Za-z0-9_.\-+ ]+):\s*$/;function bc(n){let e=n.split(`
`),t=[],r=s=>t.push({code:!1,text:s}),i=new Set(["toctree","figure","image","only","contents","highlight","raw","graphviz","index","rst-class","sectionauthor","zephyr:board","zephyr:board-supported-hw","zephyr:board-supported-runners","zephyr:code-sample-category"]);for(let s=0;s<e.length;s++){let o=e[s];if(Bi.test(o))continue;let a=o.match(/^(\s*)\.\.\s+([A-Za-z0-9_:+-]+)::\s*(.*)$/);if(a){let[,c="",l="",p=""]=a,d=c.length,u=l.toLowerCase(),m=[],y=s+1;for(;y<e.length;y++){let f=e[y];if(f.trim()===""){m.push("");continue}if(f.match(/^\s*/)[0].length<=d)break;m.push(f)}if(i.has(u)){s=y-1;continue}if(u==="code-block"||u==="code"||u==="literalinclude"){let f=p.trim(),g=Ui(m).join(`
`).replace(/^\n+|\n+$/g,"");g&&t.push({code:!0,text:`\`\`\`${f}
${g}
\`\`\``}),s=y-1;continue}if(u==="note"||u==="warning"||u==="important"||u==="tip"){let f=Ui(m).join(`
`).trim();f&&r(`${l.toUpperCase()}: ${f}`),s=y-1;continue}p.trim()&&r(p.trim());for(let f of Ui(m))r(f);s=y-1;continue}/^\s*:[a-z-]+:\s*\S*\s*$/i.test(o)&&!o.includes(" ")||r(o)}return t.map(s=>s.code?s.text:ch(s.text)).join(`
`).replace(/\n{3,}/g,`

`).trim()}function Ui(n){let e=n.filter(r=>r.trim()!=="").map(r=>r.match(/^\s*/)[0].length),t=e.length>0?Math.min(...e):0;return n.map(r=>r.trim()===""?"":r.slice(t))}function ch(n){return n.replace(/:[a-z:+-]+:`([^`<]*?)\s*<[^`>]*>`/gi,"$1").replace(/:[a-z:+-]+:`([^`]*)`/gi,"$1").replace(/``([^`]+)``/g,"$1").replace(/`([^`]+)`__?/g,"$1").replace(/\*\*([^*]+)\*\*/g,"$1").replace(/\|([A-Za-z0-9_-]+)\|/g,"$1").replace(/::\s*$/gm,":")}function Ec(n){let e=n.replace(/^﻿/,"").replace(/\r\n?/g,`
`),t=e.split(`
`),r=[];for(let l of t){let p=l.match(Bi);p&&r.push(p[1].trim())}let i=oh(t),s=ah(i);if(i.length===0){let l=bc(e);return{title:"",labels:r,chunks:l?[{heading:"",headingPath:[],ord:0,body:l}]:[]}}let o=i[0].text,a=[],c=[];for(let l=0;l<i.length;l++){let p=i[l],d=s[l],u=i[l+1];for(;c.length>0&&c[c.length-1].level>=d;)c.pop();c.push({level:d,text:p.text});let m=p.line+2,y=u?u.line-(u.overlined?1:0):t.length,f=t.slice(m,Math.max(m,y)).join(`
`),g=bc(f),E=lh(t,p.line-(p.overlined?1:0));(g||l===0)&&a.push({...E?{anchor:E}:{},heading:p.text,headingPath:c.map(b=>b.text),ord:a.length,body:g})}return{title:o,labels:r,chunks:a}}function lh(n,e){for(let t=e-1;t>=0&&t>=e-4;t--){let r=n[t];if(r.trim()==="")continue;let i=r.match(Bi);return i?i[1].trim():void 0}}var hh=new Set(["_build","_static","_scripts","_extensions","_templates","_doxygen","images","node_modules",".git"]);function gh(n,e){let t=n.replace(/\.rst$/,""),r=t.startsWith("doc/")?t.slice(4):t;return`${e.replace(/\/?$/,"/")}${r}.html`}function Nc(n){let e=n.split("/"),t=e[e.length-1].replace(/\.rst$/,"");return t!=="index"?t.replace(/[_-]/g," "):(e[e.length-2]??t).replace(/[_-]/g," ")}function yh(n){if(n.startsWith("boards/"))return"boards";let e=n.split("/");return e[0]==="doc"?e.length>2?e[1]:"index":e[0]??"other"}function bh(n){let e=n.replace(/\r\n?/g,`
`).split(`
`),t=[];for(let r=0;r<e.length;r++){let i=e[r].match(/^(\s*)\.\.\s+toctree::\s*$/);if(!i)continue;let s=i[1].length;for(r+=1;r<e.length;r++){let o=e[r];if(o.trim()==="")continue;if(o.match(/^\s*/)[0].length<=s){r-=1;break}let c=o.trim();if(c.startsWith(":"))continue;let l=c.match(/^(.+?)\s*<([^>]+)>$/),p=(l?.[2]??c).replace(/\.rst$/,""),d=l?.[1]?.trim()||p.split("/").filter(Boolean).at(-1)?.replace(/^index$/,p.split("/").at(-2)??"index").replace(/[_-]/g," ");p&&d&&t.push(`${d} (${p})`)}}return[...new Set(t)]}function Eh(n){return Object.fromEntries(n.flatMap(e=>{let t=e.trim().match(/^:([a-z-]+):\s*(.*)$/i);return t?[[t[1],t[2]]]:[]}))}function _h(n,e){let t=n.replace(/\r\n?/g,`
`).split(`
`),r=1,i=t.length,s=Number(e["start-line"]),o=Number(e["end-line"]);Number.isInteger(s)&&s>=1&&(r=s),Number.isInteger(o)&&o>=r&&(i=Math.min(o,t.length));let a=e["start-after"]??e["start-at"];if(a){let l=t.findIndex(p=>p.includes(a));if(l<0)throw new Error(`start marker not found: ${a}`);r=l+(e["start-after"]?2:1)}let c=e["end-before"]??e["end-at"];if(c){let l=t.findIndex((p,d)=>d>=r-1&&p.includes(c));if(l<0)throw new Error(`end marker not found: ${c}`);i=l+(e["end-at"]?1:0)}return t=t.slice(r-1,i),{text:t.join(`
`),start:r,end:i}}function Ki(n,e,t,r,i=[]){let s=Fi(e);if(i.includes(s))throw new Error(`include cycle: ${[...i,s].map(l=>ji(n,l)).join(" -> ")}`);let o=[...i,s],a=t.replace(/\r\n?/g,`
`).split(`
`),c=[];for(let l=0;l<a.length;l++){let p=a[l],d=p.match(/^(\s*)\.\.\s+(include|literalinclude|only)::\s*(.*)$/);if(!d){c.push(p);continue}let u=d[1].length,m=d[2],y=d[3].trim(),f=[],g=l+1;for(;g<a.length;g++){let A=a[g];if(A.trim()===""){f.push(A);continue}if(A.match(/^\s*/)[0].length<=u)break;f.push(A)}if(l=g-1,m==="only"){if(/\bhtml\b/.test(y)){let A=f.map(v=>v.trim()?v.slice(Math.min(v.length,u+3)):""),_=Ki(n,s,A.join(`
`),r,i);c.push(..._.split(`
`).map(v=>`${" ".repeat(u)}${v}`))}continue}let E=Eh(f),b=mh(fh(s),y);if(!dh(b))throw new Error(`include target not found: ${y}`);if(uh(b).isSymbolicLink())throw new Error(`include target is a symbolic link: ${y}`);let T=Fi(n),N=Fi(b),S=ji(T,N);if(S===".."||S.startsWith(`..${Tc}`))throw new Error(`include escapes the Zephyr tree: ${y}`);let k=_h(Sc(N,"utf8"),E);if(r.push({path:ji(T,N).replaceAll(Tc,"/"),startLine:k.start,endLine:k.end,directive:m}),m==="literalinclude"){let A=E.language??ph(b).slice(1);c.push(`${" ".repeat(u)}.. code-block:: ${A}`,"",...k.text.split(`
`).map(_=>`${" ".repeat(u+3)}${_}`))}else{let A=Ki(T,N,k.text,r,o);c.push(...A.split(`
`).map(_=>`${" ".repeat(u)}${_}`))}}return c.join(`
`)}function wc(n,e,t,r){let i=[],s=_c(n,e);for(let o of ee(s,{skipDirs:hh,match:a=>a.endsWith(".rst")})){let a=`${e}/${o}`,c=_c(s,o);r.discovered++;try{let l=Sc(c,"utf8"),p=[{path:a,startLine:1,endLine:l.split(/\r?\n/).length,directive:"page"}],d=Ki(n,c,l,p),u=Ec(d),m=u.chunks.filter(y=>y.body.trim()!=="").map((y,f)=>({...y,ord:f}));if(m.length===0){let y=bh(d);if(y.length>0){let f=u.title||Nc(a);m=[{heading:f,headingPath:[f],ord:0,body:`Contained documentation pages:
${y.map(g=>`- ${g}`).join(`
`)}`}]}}if(m.length===0){r.intentionallyExcluded.push({path:a,reason:"no-retrievable-content"});continue}i.push({path:a,url:gh(a,t),title:u.title||Nc(a),area:yh(a),labels:u.labels,chunks:m,origins:p}),r.indexed++}catch(l){r.errors.push({path:a,code:"rst-preprocess",message:l.message})}}return i}function vc(n,e){let t={discovered:0,indexed:0,intentionallyExcluded:[],warnings:[],errors:[]},r=[...wc(n,"doc",e,t),...wc(n,"boards",e,t)];if(t.errors.length>0){let i=t.errors.slice(0,12).map(s=>`${s.path}: ${s.message}`).join(`
`);throw new Error(`Documentation preprocessing failed for ${t.errors.length} source(s).
${i}`)}return{pages:r,report:t}}import{existsSync as Nh,mkdtempSync as wh,rmSync as Sh,writeFileSync as vh}from"node:fs";import{tmpdir as kh}from"node:os";import{join as Kn}from"node:path";import{spawnSync as Ah}from"node:child_process";var kc=`#!/usr/bin/env python3
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
`;var Ac=new Map;function Lc(n,e=[]){let t=JSON.stringify([n,[...e].sort()]),r=Ac.get(t);if(r)return r;let i=Kn(n,"scripts","kconfig","kconfiglib.py");if(!Nh(i))throw new Error("The selected Zephyr tree does not provide scripts/kconfig/kconfiglib.py.");let s=wh(Kn(kh(),"zephyr-ai-kconfig-")),o=Kn(s,"kconfig-export.py"),a=Kn(s,"generated");try{vh(o,kc,{mode:384});let c=[o,"--zephyr",n,"--build-dir",a];for(let u of e)c.push("--module",u);let l=Ah(je(n),c,{cwd:n,encoding:"utf8",maxBuffer:256*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(l.status!==0){let u=l.stderr.trim().split(`
`).slice(-8).join(`
`);throw new Error(`Zephyr Kconfiglib export failed.
${u}`)}let p=JSON.parse(l.stdout),d={symbols:p.symbols,choices:p.choices,filesScanned:p.files.length,warnings:p.warnings};return Ac.set(t,d),d}finally{Sh(s,{recursive:!0,force:!0})}}var xc=Zn(Fn(),1);import{existsSync as zn,readFileSync as Ic,statSync as Lh}from"node:fs";import{dirname as Oc,join as Pe}from"node:path";var Oh=64*1024,Rh=160*1024;function Cc(n){return/^(prj.*\.conf|sysbuild\.conf|CMakeLists\.txt|Kconfig|sample\.yaml|testcase\.yaml|README\.rst)$/.test(n)?!0:/\.(overlay|conf|dts|dtsi|c|h|cpp|hpp|yml|yaml)$/.test(n)&&/^(boards|snippets|src)\//.test(n)}var Rc={"sample.yaml":"sample","testcase.yaml":"test"};function Ih(n,e){let t=[],r=[],i=Rh;for(let s of e){if(!Cc(s))continue;let o=Pe(n,s);try{if(Lh(o).size>Oh){r.push({path:s,reason:"file-size-limit"});continue}let a=Ic(o,"utf8");if(Buffer.byteLength(a)>i){r.push({path:s,reason:"sample-size-budget"});continue}i-=Buffer.byteLength(a),t.push({path:s,text:a})}catch(a){throw new Error(`Failed to capture sample file ${o}: ${a.message}`)}}return{contents:t,exclusions:r}}function xh(n){return Array.isArray(n)?n:typeof n=="string"?[n]:[]}function Xn(n){return xh(n).filter(e=>typeof e=="string")}function Ch(n){let e=[],t=r=>{zn(Pe(n,r))&&e.push(r)};for(let r of["sample.yaml","testcase.yaml","prj.conf","CMakeLists.txt","Kconfig","sysbuild.conf","README.rst"])t(r);for(let r of["src","boards","snippets"]){let i=Pe(n,r);if(zn(i))try{e.push(...[...ee(i,{match:s=>Cc(`${r}/${s}`)})].map(s=>`${r}/${s}`))}catch{}}return e}function Dc(n){let e=[],t=new Set;for(let r of["samples","snippets","tests"]){let i=Pe(n,r);if(zn(i))for(let s of[...ee(i,{match:o=>Object.hasOwn(Rc,o)})].sort()){let o=Pe(i,s),a=s.split("/").pop(),c=Rc[a],l=null;try{let v=(0,xc.parse)(Ic(o,"utf8"),{logLevel:"silent"});if(!v||typeof v!="object"||Array.isArray(v))throw new Error("expected a YAML mapping");l=v}catch(v){throw new Error(`Failed to parse ${a} metadata ${s}: ${v.message}`)}let p=Oc(o),d=he(Pe(r,Oc(s)));if(t.has(d))continue;t.add(d);let u=l.sample&&typeof l.sample=="object"?l.sample:{},m=l.tests&&typeof l.tests=="object"?l.tests:{},y=l.common&&typeof l.common=="object"&&!Array.isArray(l.common)?l.common:{},f=new Set,g=new Set,E=new Set,b=new Set,T=v=>{for(let $ of Xn(v.tags))f.add($);if(typeof v.tags=="string")for(let $ of v.tags.split(/\s+/).filter(Boolean))f.add($);for(let $ of Xn(v.depends_on))g.add($);for(let $ of Xn(v.integration_platforms))E.add($);for(let $ of Xn(v.platform_allow))b.add($)};T(y);for(let v of Object.values(m))!v||typeof v!="object"||T({...y,...v});let N=Ch(p),{contents:S,exclusions:k}=Ih(p,N),A=S.map(v=>v.path),_={path:d,kind:c,name:typeof u.name=="string"?u.name:d.split("/").pop(),tags:[...f].sort(),scenarios:Object.keys(m).sort(),dependsOn:[...g].sort(),integrationPlatforms:[...E].sort(),platformAllow:[...b].sort(),files:A,contents:S,exclusions:k};typeof u.description=="string"&&(_.description=u.description),zn(Pe(p,"README.rst"))&&(_.docPath=`${d}/README.rst`),e.push(_)}}return e.sort((r,i)=>r.path.localeCompare(i.path)),e}var Mc=Zn(Fn(),1);import{existsSync as Yn,mkdtempSync as Ph,readFileSync as Xi,rmSync as qh,writeFileSync as $h}from"node:fs";import{tmpdir as Mh}from"node:os";import{join as ke}from"node:path";import{spawnSync as Uh}from"node:child_process";var Pc=`#!/usr/bin/env python3
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
`;function Bh(n){let e="",t=!1;for(let r=0;r<n.length;r++){let i=n[r];if(t){e+=i,i==="\\"?(e+=n[r+1]??"",r++):i==='"'&&(t=!1);continue}if(i==='"'){t=!0,e+=i;continue}if(i==="#"){for(;r<n.length&&n[r]!==`
`;)r++;e+=`
`;continue}e+=i}return e}function Fh(n){let e=[],t="",r=!1,i=!1;for(let s=0;s<n.length;s++){let o=n[s];if(r){o==="\\"?(t+=n[s+1]??"",s++):o==='"'?r=!1:t+=o;continue}if(o==='"'){r=!0,i=!0;continue}if(/\s/.test(o)){i&&e.push(t),t="",i=!1;continue}t+=o,i=!0}return i&&e.push(t),e}function qc(n){return n.replace(/\s+/g," ").trim()}function jh(n){return n.predicate}function Uc(n){let e=Bh(n),t=[],r=[],i=/([A-Za-z_][A-Za-z0-9_]*)\s*\(/g,s;for(;(s=i.exec(e))!==null;){let o=s[1].toLowerCase(),a=1,c=s.index+s[0].length,l=!1;for(;c<e.length&&a>0;c++){let u=e[c];if(l){u==="\\"?c++:u==='"'&&(l=!1);continue}u==='"'?l=!0:u==="("?a++:u===")"&&a--}if(a!==0)break;let p=e.slice(s.index+s[0].length,c-1);if(i.lastIndex=c,o==="if"){let u=qc(p);r.push({taken:[u],predicate:u});continue}if(o==="elseif"||o==="else"){let u=r[r.length-1];if(!u)continue;let m=qc(p),y=u.taken.map(f=>`NOT (${f})`).join(" AND ");u.predicate=o==="else"?y||null:y?`(${m}) AND ${y}`:m,o==="elseif"&&u.taken.push(m);continue}if(o==="endif"){r.pop();continue}let d=r.map(jh).filter(u=>!!u);t.push({name:o,args:Fh(p),...d.length>0?{guard:d.join(" AND ")}:{}})}return t}function qe(n,e,t){let r=n.declaredIn.get(e);r?r.add(t):n.declaredIn.set(e,new Set([t]))}function $c(n,e,t,r){let i=n.args.get(e)??[];for(let s of t)i.push({value:s,...r?{guard:r}:{},unresolved:s.includes("${")});n.args.set(e,i)}function Bc(n,e,t,r,i){if(r.has(e))return;r.add(e);let s=ke(n,e);if(!Yn(s))return;let o;try{o=Uc(Xi(s,"utf8"))}catch(a){i.push({path:e,code:"cmake-parse",message:a.message});return}for(let a of o){let[c,...l]=a.args;switch(a.name){case"include":{if(!c)break;let p=c.startsWith("${ZEPHYR_BASE}/")?c.slice(15):null;p&&Bc(n,p,t,r,i);break}case"board_finalize_runner_args":{if(!c)break;t.finalized.add(c),qe(t,c,e),$c(t,c,l,a.guard);break}case"board_runner_args":{if(!c)break;qe(t,c,e),$c(t,c,l,a.guard);break}case"board_set_flasher_ifnset":{c&&t.flashDefault===void 0&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger_ifnset":{c&&t.debugDefault===void 0&&(t.debugDefault=c,qe(t,c,e));break}case"board_set_flasher":{c&&(t.flashDefault=c,qe(t,c,e));break}case"board_set_debugger":{c&&(t.debugDefault=c,qe(t,c,e));break}default:break}}}function Kh(n,e){let t=[],r=ke(n,"soc");if(!Yn(r))return t;let i=[...ee(r,{match:s=>s==="CMakeLists.txt"||s.endsWith(".cmake")})].sort();for(let s of i){let o=he(ke("soc",s)),a=Xi(ke(r,s),"utf8");if(!a.includes("board_finalize_runner_args"))continue;let c;try{c=Uc(a)}catch(l){e.push({path:o,code:"cmake-parse",message:l.message});continue}for(let l of c){if(l.name!=="board_finalize_runner_args")continue;let[p,...d]=l.args;p&&t.push({path:o,runner:p,args:d.map(u=>({value:u,...l.guard?{guard:l.guard}:{},unresolved:u.includes("${")}))})}}return t}function Fc(n){let e=Ph(ke(Mh(),"zephyr-ai-runners-")),t=ke(e,"runner-export.py");try{$h(t,Pc,{mode:384});let r=Uh(Ft(),[t,"--zephyr",n],{encoding:"utf8",maxBuffer:64*1024*1024,env:{...process.env,PYTHONDONTWRITEBYTECODE:"1"}});if(r.status!==0){let i=r.stderr.trim().split(`
`).slice(-12).join(`
`);throw new Error(`The west runner catalogue could not be exported:
${i}`)}return JSON.parse(r.stdout)}finally{qh(e,{recursive:!0,force:!0})}}function jc(n){let e=ke(n,"scripts","west-commands.yml");if(!Yn(e))return[];let t=(0,Mc.parse)(Xi(e,"utf8"),{logLevel:"silent"});if(!t||typeof t!="object")return[];let r=t["west-commands"];if(!Array.isArray(r))return[];let i=[];for(let s of r){if(!s||typeof s!="object")continue;let o=s,a=typeof o.file=="string"?o.file:"";for(let c of Array.isArray(o.commands)?o.commands:[]){if(!c||typeof c!="object")continue;let l=c;typeof l.name=="string"&&i.push({name:l.name,className:typeof l.class=="string"?l.class:"",file:a,...typeof l.help=="string"?{help:l.help}:{}})}}return i.sort((s,o)=>s.name.localeCompare(o.name))}function Kc(n,e){let t=[],r=Kh(n,t),i=[],s=0;for(let l of e){let p=`${l.dir}/board.cmake`,d={finalized:new Set,args:new Map,declaredIn:new Map};Yn(ke(n,p))?Bc(n,p,d,new Set,t):s++;for(let m of r){if(!l.socDirs.some(f=>f&&m.path.startsWith(`${f}/`)))continue;d.finalized.add(m.runner),qe(d,m.runner,m.path);let y=d.args.get(m.runner)??[];y.push(...m.args),d.args.set(m.runner,y)}let u=new Set(d.finalized);d.flashDefault&&u.add(d.flashDefault),d.debugDefault&&u.add(d.debugDefault);for(let m of[...u].sort())i.push({board:l.name,runner:m,available:d.finalized.has(m),flashDefault:d.flashDefault===m,debugDefault:d.debugDefault===m,args:d.args.get(m)??[],declaredIn:[...d.declaredIn.get(m)??[]].sort()})}let o=new Set(i.map(l=>l.board)),a=e.filter(l=>!o.has(l.name)).length,c=[];return s>0&&c.push({path:"boards",code:"no-board-cmake",message:`${s} boards ship no board.cmake`}),a>0&&c.push({path:"boards",code:"no-runner-declared",message:`${a} boards declare no runner; report this as undeclared, never as unsupported`}),{boardRunners:i,report:{discovered:i.length,indexed:i.length,intentionallyExcluded:[],warnings:c,errors:t}}}import{createHash as Yi}from"node:crypto";import{existsSync as Gn,readFileSync as Vn,realpathSync as Ct,statSync as Zh}from"node:fs";import{basename as zc,dirname as Qh,join as $e,relative as eg,resolve as tg}from"node:path";import{spawnSync as Vc}from"node:child_process";import{createHash as Xh}from"node:crypto";import{existsSync as zh,lstatSync as Yh,readFileSync as Vh,readlinkSync as Gh,realpathSync as Jh}from"node:fs";import{join as Hh}from"node:path";import{spawnSync as Wh}from"node:child_process";function zi(n,e){let t=Wh("git",["-C",n,...e],{encoding:"utf8",maxBuffer:268435456,stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function Xc(n){let e=Jh(n),t=zi(e,["rev-parse","HEAD"]);if(!t)return null;let r=zi(e,["diff","--binary","HEAD"])??"",i=(zi(e,["ls-files","--others","--exclude-standard"])??"").split(`
`).filter(s=>!!s&&s!==".zephyr-ai-managed.json").sort().map(s=>{let o=Hh(e,s);if(!zh(o))return{path:s,missing:!0};try{let a=Yh(o);return a.isSymbolicLink()?{path:s,symlink:Gh(o)}:a.isFile()?{path:s,sha256:Xh("sha256").update(Vh(o)).digest("hex")}:{path:s,special:a.mode}}catch{return{path:s,unreadable:!0}}});return{commit:t,dirty:!!(r||i.length),stateFingerprint:Ae({commit:t,diff:r,untracked:i})}}function ng(n,e){let t=Vc("git",["-C",n,...e],{encoding:"utf8",stdio:["ignore","pipe","ignore"]});return t.status===0?t.stdout.trim():null}function rg(n){let e=Vn($e(n,"VERSION"),"utf8"),t=s=>e.match(new RegExp(`^${s}\\s*=\\s*(.*)$`,"m"))?.[1]?.trim()??"",r=[t("VERSION_MAJOR"),t("VERSION_MINOR"),t("PATCHLEVEL")].join("."),i=t("EXTRAVERSION");return i?`${r}-${i}`:r}function ig(n){let e=tg(n);for(;;){if(Gn($e(e,".west","config")))return e;let t=Qh(e);if(t===e)return;e=t}}function sg(n){if(!n)return;let e=Vc("west",["manifest","--freeze"],{cwd:n,encoding:"utf8",stdio:["ignore","pipe","ignore"]});if(e.status===0&&e.stdout.trim())return Yi("sha256").update(e.stdout).digest("hex");let t="",r="west.yml";try{let o=Vn($e(n,".west","config"),"utf8");t=o.match(/^\s*path\s*=\s*(.+)$/m)?.[1]?.trim()??"",r=o.match(/^\s*file\s*=\s*(.+)$/m)?.[1]?.trim()??r}catch{}let s=[...t?[$e(n,t,r)]:[],$e(n,"west.yml"),$e(n,"west.yaml")].find(Gn);return s?Yi("sha256").update(Vn(s)).digest("hex"):void 0}function Yc(n){let e=Ct(n),t=Xc(e);if(t)return{name:zc(e),...t};let r=["VERSION","west.yml","zephyr/module.yml","module.yml"].map(i=>$e(e,i)).filter(Gn).map(i=>{let s=Zh(i);return{path:eg(e,i),bytes:s.size,sha256:Yi("sha256").update(Vn(i)).digest("hex")}});return{name:zc(e),markers:r}}function Gc(n){let e=Ct(n.zephyrRoot),t=n.projectRoot&&Gn(n.projectRoot)?Ct(n.projectRoot):void 0,r=ng(e,["rev-parse","HEAD"]);if(!r)throw new Error(`Cannot determine the Git commit for the Zephyr tree at ${e}.`);let i=ig(t??e),s=sg(i),o=n.modules.map(u=>Yc(u)),a=Ae(o),c=Yc(e),l=String(c.stateFingerprint??Ae(c)),p=n.pinnedCommit===r&&c.dirty===!1?"pinned-upstream":i?"west-workspace":"explicit-tree",d={descriptorVersion:is,schemaVersion:Ut,builderVersion:ss,sourceKind:p,...t?{projectRoot:t}:{},zephyrRoot:e,zephyrVersion:rg(e),zephyrCommit:r,zephyrTreeFingerprint:l,...s?{westManifestHash:s}:{},moduleFingerprint:a,...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:Ct(n.applicationRoot)}:{},...n.buildDirectory?{buildDirectory:Ct(n.buildDirectory)}:{},coverage:{docs:{complete:n.modules.length===0,note:n.modules.length?"Module documentation is not indexed.":void 0},kconfig:{complete:!1,note:"Catalogue index; generated and application-local symbols require resolved context."},bindings:{complete:n.modules.length===0&&!t&&!n.applicationRoot,note:n.modules.length||t||n.applicationRoot?"Application-local or undisclosed module binding roots may not be indexed.":void 0},boards:{complete:n.modules.length===0,note:n.modules.length?"Module board roots are not indexed.":void 0},samples:{complete:n.modules.length===0,note:n.modules.length?"Module samples are not indexed.":void 0},api:{complete:!!n.apiSemantic&&n.modules.length===0,note:n.apiSemantic?n.modules.length?"Module public headers are not indexed.":void 0:"Doxygen XML was not supplied; the API catalogue is an incomplete header fallback."},west:{complete:!!n.westComplete,note:n.westComplete?void 0:"The west package was not importable when this index was built, so runners that import it \u2014 openocd among them \u2014 carry no capabilities."},resolvedBuild:{complete:!1,note:n.buildDirectory?"Build identity is recorded, but resolved .config and final devicetree values are not ingested.":"No resolved build output was supplied or ingested."}}};return{...d,createdAt:new Date().toISOString(),contextFingerprint:as(d)}}import{spawnSync as ag}from"node:child_process";import{existsSync as Vi,mkdirSync as cg,mkdtempSync as lg,renameSync as dg,rmSync as ug,writeFileSync as fg}from"node:fs";import{dirname as Jc,join as Dt,resolve as pg}from"node:path";var V={$comment:"Pinned upstream Zephyr revision used to build the default shipped index. Update with scripts/fetch-zephyr.mjs --update <tag>.",repository:"https://github.com/zephyrproject-rtos/zephyr.git",tag:"v4.4.2",commit:"dccb09599635bdff17633fa7e9dab014b91dce90",version:"4.4.2",sdkVersion:"1.0.1",docBaseUrl:"https://docs.zephyrproject.org/4.4.2/",apiBaseUrl:"https://docs.zephyrproject.org/4.4.2/doxygen/html/"};var Hc=V,Wc=".zephyr-ai-managed.json";function Jn(n,e){return ag("git",n,{...e?{cwd:e}:{},encoding:"utf8",stdio:["ignore","pipe","pipe"]})}function mg(n){if(!Vi(Dt(n,".git"))||!Vi(Dt(n,"VERSION")))return!1;let e=Jn(["rev-parse","HEAD"],n);if(e.status!==0||e.stdout.trim()!==V.commit)return!1;let t=Jn(["status","--porcelain","--untracked-files=all"],n);return t.status!==0?!1:t.stdout.split(`
`).filter(Boolean).every(r=>r.endsWith(` ${Wc}`))}function Zc(n,e){let t=pg(n,"sources",`zephyr-${V.version}-${V.commit.slice(0,12)}`);if(mg(t))return e(`Using pinned Zephyr ${V.version} checkout at ${t}`),t;if(Vi(t))throw new Error(`Refusing to replace ${t}: it is not a clean checkout of pinned Zephyr ${V.version}.`);cg(Jc(t),{recursive:!0});let r=lg(Dt(Jc(t),".zephyr-ai-fetch-")),i=Dt(r,"zephyr");try{e(`Cloning pinned Zephyr ${V.version}; this requires network access and may take several minutes.`);let s=Jn(["clone","--depth","1","--branch",V.tag,"--single-branch",V.repository,i]);if(s.error)throw new Error(`Cannot run git: ${s.error.message}`);if(s.status!==0)throw new Error(`git clone failed: ${s.stderr.trim()||s.stdout.trim()||`status ${s.status}`}`);let o=Jn(["rev-parse","HEAD"],i);if(o.status!==0||o.stdout.trim()!==V.commit)throw new Error(`Fetched commit ${o.stdout.trim()||"unknown"} does not match the bundled pin ${V.commit}.`);return fg(Dt(i,Wc),`${JSON.stringify({owner:"zephyr-ai",repository:V.repository,tag:V.tag,commit:V.commit},null,2)}
`,{flag:"wx"}),dg(i,t),e(`Pinned Zephyr ${V.version} is ready at ${t}`),t}finally{ug(r,{recursive:!0,force:!0})}}var Qc={name:"@zephyr-ai/ingest",version:"0.4.0",private:!0,type:"module",description:"Builds the Zephyr knowledge index consumed by the zephyr-ai MCP server",license:"Apache-2.0",bin:{"zephyr-ai-ingest":"./dist/cli.js"},scripts:{build:`esbuild src/cli.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outfile=dist/cli.js --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,pretest:`esbuild test/*.test.ts --bundle --platform=node --target=node24 --format=esm --loader:.py=text --outdir=dist-test --out-extension:.js=.mjs --banner:js="import{createRequire}from'node:module';const require=createRequire(import.meta.url);"`,test:'node --test "dist-test/*.test.mjs"'},dependencies:{yaml:"^2.9.0"}};function wg(n){let e=oe(process.cwd()),t={zephyr:process.env.ZEPHYR_BASE??G(e,".cache","zephyr"),modules:[],quiet:!1,requireDoxygen:!1,requireWest:!1,requirePinned:!1,fetchPinned:!1,autoDetectApiXml:!0,projectRoot:process.env.CLAUDE_PROJECT_DIR??process.env.ZEPHYR_AI_PROJECT_ROOT,pluginData:process.env.ZEPHYR_AI_PLUGIN_DATA??process.env.CLAUDE_PLUGIN_DATA};for(let r=0;r<n.length;r++){let i=n[r];switch(i){case"--zephyr":t.zephyr=oe(n[++r]);break;case"--out":t.out=oe(n[++r]);break;case"--project-root":t.projectRoot=oe(n[++r]);break;case"--plugin-data":t.pluginData=oe(n[++r]);break;case"--fetch-pinned":t.fetchPinned=!0;break;case"--board":t.boardTarget=n[++r];break;case"--application":t.applicationRoot=oe(n[++r]);break;case"--build-dir":t.buildDirectory=oe(n[++r]);break;case"--api-xml":t.apiXml=oe(n[++r]);break;case"--no-api-xml-auto-detect":t.autoDetectApiXml=!1;break;case"--require-doxygen":t.requireDoxygen=!0;break;case"--require-west":t.requireWest=!0;break;case"--require-pinned":t.requirePinned=!0;break;case"--modules":t.modules.push(oe(n[++r]));break;case"--quiet":case"-q":t.quiet=!0;break;case"--help":case"-h":console.log(["Usage: zephyr-ai-ingest [--zephyr <path> | --fetch-pinned] [--project-root <path>]","  [--plugin-data <path>] [--out <path>] [--modules <path>]... [--api-xml <dir>]","  [--board <target>] [--application <path>] [--build-dir <path>]","  [--require-doxygen] [--require-west] [--require-pinned] [--quiet]","","--fetch-pinned clones the bundled lockfile revision under --plugin-data, then indexes it.","Without --api-xml, conventional adjacent and doc/_build Doxygen XML trees are detected.","Use --no-api-xml-auto-detect only when a reproducible caller requires header fallback.","--board, --application, and --build-dir record context identity only; resolved .config","and final devicetree values are not currently ingested."].join(`
`)),process.exit(0);break;default:throw new Error(`Unknown argument: ${i}`)}}return t.zephyr=oe(t.zephyr),t}function Sg(){for(let n of[G(process.cwd(),"zephyr.lock.json"),G(process.cwd(),"..","..","zephyr.lock.json")])try{return JSON.parse(rl(n,"utf8"))}catch{}return{}}function Gi(n){return n==null?null:JSON.stringify(n)}function vg(n){let e=G(n,"scripts","requirements-base.txt");return qt(e)?gs(rl(e,"utf8")):[]}function Hi(n){let e=Eg(n,"r");try{yg(e)}finally{gg(e)}}function nl(n){try{Hi(n)}catch{}}function kg(n,e){let t=_g(n,{withFileTypes:!0}).filter(i=>i.isDirectory()&&/^[a-f0-9]{64}$/.test(i.name)).flatMap(i=>{let s=G(n,i.name),o=G(s,"zephyr.db");if(!qt(o))return[];let a=G(s,"last-used");return[{fingerprint:i.name,directory:s,usedAt:il(qt(a)?a:o).mtimeMs}]}).sort((i,s)=>s.usedAt-i.usedAt),r=new Set([e,...t.filter(i=>i.fingerprint!==e).slice(0,4).map(i=>i.fingerprint)]);for(let i of t)r.has(i.fingerprint)||Ji(i.directory,{recursive:!0,force:!0})}function Ag(){let n=wg(process.argv.slice(2)),e=q=>{n.quiet||process.stderr.write(`${q}
`)};if(n.fetchPinned){if(!n.pluginData)throw new Error("--fetch-pinned requires --plugin-data so the checkout survives plugin updates.");n.zephyr=Zc(n.pluginData,e)}if(!qt(G(n.zephyr,"VERSION")))throw new Error(`${n.zephyr} does not look like a Zephyr tree (no VERSION file).
Run 'npm run fetch:zephyr' first, or pass --zephyr <path>.`);if(je(n.zephyr),!n.apiXml&&n.autoDetectApiXml){let q=_s(n.zephyr);q&&(n.apiXml=q,e(`Using auto-detected Doxygen XML from ${q}`))}let t=n.fetchPinned?Hc:Sg();if(n.requireDoxygen&&!n.apiXml)throw new Error("Release API ingestion requires Doxygen XML. Run npm run build:api-xml, then pass --api-xml .cache/doxygen/xml.");let r=Fc(n.zephyr);if(n.requireWest&&!r.complete)throw new Error("The west runner catalogue is incomplete: the selected interpreter cannot import the west package, which openocd needs, and hundreds of boards select openocd. An index built here would omit it without saying so. Install the tree's requirements (python -m pip install -r <zephyr>/scripts/requirements-base.txt) and retry.");let i=Gc({zephyrRoot:n.zephyr,westComplete:r.complete,...n.projectRoot?{projectRoot:n.projectRoot}:{},modules:n.modules,...t.commit?{pinnedCommit:t.commit}:{},...n.boardTarget?{boardTarget:n.boardTarget}:{},...n.applicationRoot?{applicationRoot:n.applicationRoot}:{},...n.buildDirectory?{buildDirectory:n.buildDirectory}:{},apiSemantic:!!n.apiXml}),s=i.zephyrVersion;if(n.requirePinned&&(!t.commit||i.sourceKind!=="pinned-upstream"))throw new Error(`The requested pinned index build requires commit ${t.commit??"<missing lock>"}, but the selected tree is ${i.zephyrCommit}. The checkout must also have no tracked or untracked source changes. Run npm run fetch:zephyr -- --force or omit --require-pinned for an explicit workspace index.`);let o=`https://docs.zephyrproject.org/${s}/`,a,c=n.out;if(!c&&n.pluginData)if(i.projectRoot){let q=G(n.pluginData,"indexes","projects",os(i.projectRoot));c=G(q,i.contextFingerprint,"zephyr.db"),a=G(q,"active.json")}else c=G(n.pluginData,"indexes","defaults",i.zephyrCommit,String(i.schemaVersion),"zephyr.db");c??=G(oe(process.cwd()),"index","zephyr.db"),e(`Indexing Zephyr ${s} from ${n.zephyr}`);let l=Date.now(),p=Date.now(),{pages:d,report:u}=vc(n.zephyr,o),m=d.reduce((q,Z)=>q+Z.chunks.length,0);e(`  docs      ${d.length} pages, ${m} sections (${Date.now()-p} ms)`);let y=Date.now(),f=Lc(n.zephyr,n.modules);e(`  kconfig   ${f.symbols.length} symbols from ${f.filesScanned} files (${Date.now()-y} ms)`);let g=Date.now(),E=[G(n.zephyr,"dts","bindings"),...n.modules.map(q=>G(q,"dts","bindings")).filter(qt)],{bindings:b,fragments:T,report:N}=vs(E),S=q=>q.properties.length+q.children.reduce((Z,Hn)=>Z+S(Hn),0),k=b.reduce((q,Z)=>q+S(Z),0);e(`  bindings  ${b.length} compatibles, ${k} properties, ${T} fragments (${Date.now()-g} ms)`);let A=Date.now(),_=gc(n.zephyr),v=yc(n.zephyr),$=_.reduce((q,Z)=>q+Z.targets.length,0);e(`  boards    ${_.length} boards, ${$} targets, ${v.length} SoCs (${Date.now()-A} ms)`);let ne=Date.now(),M=new Map(v.map(q=>[q.name,q.dir])),R=jc(n.zephyr),K=Kc(n.zephyr,_.map(q=>({name:q.name,dir:q.dir,socDirs:[...new Set(q.socs.map(Z=>M.get(Z.name)).filter(Z=>!!Z))]}))),U={runners:r.runners,commands:R,boardRunners:K.boardRunners};e(`  west      ${U.runners.length} runners, ${U.commands.length} commands, ${U.boardRunners.length} board bindings${r.complete?"":", incomplete"} (${Date.now()-ne} ms)`);let sl=Date.now(),pe=Dc(n.zephyr);e(`  samples   ${pe.length} (${Date.now()-sl} ms)`);let ol=Date.now(),me=Ts(n.zephyr,n.apiXml);e(`  api       ${me.symbols.length} symbols, ${me.groups.length} groups, ${me.mode} (${Date.now()-ol} ms)`),bg(Pt(c),{recursive:!0});let et=G(Pt(c),`.${tl()}.zephyr.db.tmp`),L,Wi=!1;try{L=new Ng(et),L.exec(ls);let q=Date.now();L.exec("BEGIN");let Z=L.prepare("INSERT INTO doc (path, url, title, area, labels) VALUES (?, ?, ?, ?, ?)"),Hn=L.prepare(`INSERT INTO doc_chunk (doc_id, anchor, heading, heading_path, ord, title, body)
     VALUES (?, ?, ?, ?, ?, ?, ?)`),al=L.prepare("INSERT INTO doc_origin (doc_id, path, start_line, end_line, directive) VALUES (?, ?, ?, ?, ?)");for(let h of d){let x=Z.run(h.path,h.url,h.title,h.area,JSON.stringify(h.labels)),O=Number(x.lastInsertRowid);for(let I of h.origins)al.run(O,I.path,I.startLine,I.endLine,I.directive);for(let I of h.chunks)Hn.run(O,I.anchor??null,I.heading,I.headingPath.join(" > "),I.ord,h.title,I.body)}let cl=L.prepare(`INSERT INTO kconfig
       (name, type, prompt, help, defaults, depends, selects, implies, ranges,
        defined_in, menu_path, is_choice, choice, n_defs, has_prompt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),Wn=L.prepare("INSERT INTO kconfig_edge (from_sym, to_sym, kind) VALUES (?, ?, ?)"),$t=new Map;for(let h of f.symbols){let x=h.definitions.flatMap(D=>D.defaults.map(B=>({value:B.value.display,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),O=h.definitions.map(D=>D.condition.display).filter((D,B,Cl)=>D!=="y"&&Cl.indexOf(D)===B),I=h.definitions.flatMap(D=>D.selects.map(B=>({value:B.target,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),X=h.definitions.flatMap(D=>D.implies.map(B=>({value:B.target,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),tt=h.definitions.flatMap(D=>D.ranges.map(B=>({low:B.low.display,high:B.high.display,...B.condition.display!=="y"?{cond:B.condition.display}:{}}))),Q=h.definitions.find(D=>D.prompt)?.prompt??"",Me=h.definitions.find(D=>D.menuPath.length>0)?.menuPath.join(" > ")??"",z=cl.run(h.name,h.type??null,Q,h.help??"",JSON.stringify(x),JSON.stringify(O),JSON.stringify(I),JSON.stringify(X),JSON.stringify(tt),JSON.stringify(h.definitions.map(D=>({file:D.file,line:D.line}))),Me,h.choice?1:0,h.choice??null,h.definitions.length,h.hasPrompt?1:0);$t.set(h.name,Number(z.lastInsertRowid));for(let D of I)Wn.run(h.name,D.value,"select");for(let D of X)Wn.run(h.name,D.value,"imply");let Ue=D=>[...D.kind==="symbol"&&D.value?[D.value]:[],...(D.children??[]).flatMap(Ue)];for(let D of h.definitions)for(let B of Ue(D.condition))Wn.run(h.name,B,"depends")}let ll=L.prepare("INSERT INTO kconfig_expr (kind, value, display, left_id, right_id) VALUES (?, ?, ?, ?, ?)"),Zi=new Map,ae=h=>{if(!h)return null;let x=J(h),O=Zi.get(x);if(O!==void 0)return O;let I=h.children??[],X=Number(ll.run(h.kind,h.value??null,h.display,ae(I[0]??null),ae(I[1]??null)).lastInsertRowid);return Zi.set(x,X),X},dl=L.prepare(`INSERT INTO kconfig_definition
       (symbol_id, file, line, prompt, menu_path, condition_expr_id, prompt_condition_id,
        is_menuconfig, is_configdefault)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`),ul=L.prepare(`INSERT INTO kconfig_default
       (definition_id, value_expr_id, condition_expr_id, ord) VALUES (?, ?, ?, ?)`),fl=L.prepare(`INSERT INTO kconfig_relation
       (definition_id, kind, target_name, target_symbol_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?, ?)`),pl=L.prepare(`INSERT INTO kconfig_range
       (definition_id, low_expr_id, high_expr_id, condition_expr_id, ord)
     VALUES (?, ?, ?, ?, ?)`);for(let h of f.symbols){let x=$t.get(h.name);for(let O of h.definitions){let I=Number(dl.run(x,O.file,O.line,O.prompt,JSON.stringify(O.menuPath),ae(O.condition),ae(O.promptCondition),O.isMenuconfig?1:0,O.isConfigDefault?1:0).lastInsertRowid);for(let X of O.defaults)ul.run(I,ae(X.value),ae(X.condition),X.order);for(let[X,tt]of[["select",O.selects],["imply",O.implies]])for(let Q of tt)fl.run(I,X,Q.target,$t.get(Q.target)??null,ae(Q.condition),Q.order);for(let X of O.ranges)pl.run(I,ae(X.low),ae(X.high),ae(X.condition),X.order)}}let ml=L.prepare("INSERT INTO kconfig_choice (stable_id, name, type, definitions) VALUES (?, ?, ?, ?)"),hl=L.prepare("INSERT INTO kconfig_choice_member (choice_id, symbol_id) VALUES (?, ?)");for(let h of f.choices){let x=Number(ml.run(h.id,h.name,h.type,JSON.stringify(h.definitions)).lastInsertRowid);for(let O of new Set(h.members)){let I=$t.get(O);I!==void 0&&hl.run(x,I)}}let gl=L.prepare(`INSERT INTO dt_binding
       (compatible, path, description, bus, on_bus, cells, includes, prop_names, n_props, vendor)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),yl=L.prepare(`INSERT INTO dt_property
       (binding_id, child_level, name, type, required, description_id, default_value,
        enum_values, const_value, deprecated, specifier_space, inherited_from,
        provenance, constraints, child_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),bl=L.prepare("INSERT INTO text_pool (text) VALUES (?)"),Qi=new Map,El=h=>{if(!h)return null;let x=Qi.get(h);if(x!==void 0)return x;let O=Number(bl.run(h).lastInsertRowid);return Qi.set(h,O),O};for(let h of b){let x=h.compatible,O=(Q,Me=0,z="")=>[...Q.properties.map(Ue=>({level:Me,childPath:z,property:Ue})),...Q.children.flatMap((Ue,D)=>O(Ue,Me+1,z?`${z}/${D}`:String(D)))],I=O(h),X=gl.run(x,h.path,h.description??"",h.bus===void 0||h.bus===null?null:typeof h.bus=="string"?h.bus:JSON.stringify(h.bus),h.onBus??null,JSON.stringify(h.cells),JSON.stringify(h.includes),I.map(({property:Q})=>Q.name).join(" "),I.length,x.includes(",")?x.split(",")[0]:null),tt=Number(X.lastInsertRowid);for(let{level:Q,childPath:Me,property:z}of I)yl.run(tt,Q,z.name,z.type??null,z.required?1:0,El(z.description),Gi(z.default),Gi(z.enum),Gi(z.const),z.deprecated?1:0,z.specifierSpace??null,z.inheritedFrom??null,JSON.stringify(z.provenance??{}),JSON.stringify(z.constraints??{}),Me)}let _l=L.prepare(`INSERT INTO board
       (name, full_name, vendor, dir, arch, ram, flash, socs, socs_text, targets,
        targets_text, revisions, default_revision, supported, supported_text, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let h of _){let x=h.socs.map(O=>O.name);_l.run(h.name,h.fullName??"",h.vendor??"",h.dir,h.arch??null,h.ram??null,h.flash??null,JSON.stringify(h.socs),x.join(" "),JSON.stringify(h.targets),h.targets.map(O=>O.identifier).join(" "),JSON.stringify(h.revisions),h.defaultRevision??null,JSON.stringify(h.supported),h.supported.join(" "),h.docPath??null)}let Tl=L.prepare("INSERT INTO soc (name, series, family, vendor, dir, cpuclusters) VALUES (?, ?, ?, ?, ?, ?)");for(let h of v)Tl.run(h.name,h.series??null,h.family??null,h.vendor??null,h.dir,JSON.stringify(h.cpuclusters));let Nl=L.prepare("INSERT INTO runner (name, module, description, capabilities, commands) VALUES (?, ?, ?, ?, ?)");for(let h of U.runners)Nl.run(h.name,h.module,h.description??null,J(h.capabilities),JSON.stringify(h.capabilities.commands??[]));let wl=L.prepare("INSERT INTO west_command (name, class_name, file, help) VALUES (?, ?, ?, ?)");for(let h of U.commands)wl.run(h.name,h.className,h.file,h.help??null);let Sl=L.prepare(`INSERT INTO board_runner
       (board_id, runner, available, flash_default, debug_default, args, declared_in)
     VALUES ((SELECT id FROM board WHERE name = ?), ?, ?, ?, ?, ?, ?)`);for(let h of U.boardRunners)Sl.run(h.board,h.runner,h.available?1:0,h.flashDefault?1:0,h.debugDefault?1:0,JSON.stringify(h.args),JSON.stringify(h.declaredIn));let vl=L.prepare(`INSERT INTO sample
       (path, kind, name, description, tags, tags_text, scenarios, depends_on,
        integration_platforms, platform_allow, files, doc_path)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`),kl=L.prepare("INSERT INTO sample_file (sample_id, path, text) VALUES (?, ?, ?)"),es=L.prepare("INSERT INTO sample_platform (sample_id, platform, evidence) VALUES (?, ?, ?)");for(let h of pe){let x=vl.run(h.path,h.kind,h.name,h.description??"",JSON.stringify(h.tags),h.tags.join(" "),JSON.stringify(h.scenarios),JSON.stringify(h.dependsOn),JSON.stringify(h.integrationPlatforms),JSON.stringify(h.platformAllow),JSON.stringify(h.files),h.docPath??null),O=Number(x.lastInsertRowid);for(let I of h.contents)kl.run(O,I.path,I.text);for(let I of h.integrationPlatforms)es.run(O,I,"integration");for(let I of h.platformAllow)es.run(O,I,"allowlist")}let Al=L.prepare(`INSERT INTO api_symbol
       (name, kind, signature, brief, detail, params, returns, retvals, api_group,
        since, deprecated, header, line, doxygen_id, compound_id, doc_anchor, parent_symbol)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);for(let h of me.symbols)Al.run(h.name,h.kind,h.signature,h.brief??"",h.detail??"",JSON.stringify(h.params),JSON.stringify(h.returns),JSON.stringify(h.retvals),h.group??null,h.since??null,h.deprecated?1:0,h.header,h.line,h.doxygenId??null,h.compoundId??null,h.docAnchor??null,h.parentSymbol??null);let Ll=L.prepare("INSERT INTO api_group (gid, title, parent, header) VALUES (?, ?, ?, ?)");for(let h of me.groups)Ll.run(h.id,h.title,h.parent??null,h.header);let Ol=L.prepare("INSERT INTO meta (key, value) VALUES (?, ?)"),Rl={schema_version:String(cs),zephyr_version:s,zephyr_commit:i.zephyrCommit,zephyr_tag:i.sourceKind==="pinned-upstream"?t.tag??"":"",source_path:n.zephyr,source_kind:i.sourceKind,index_descriptor:J(i),context_fingerprint:i.contextFingerprint,module_fingerprint:i.moduleFingerprint,doc_base_url:o,built_at:new Date().toISOString(),ingest_version:Qc.version,count_docs:String(d.length),count_doc_chunks:String(m),report_docs:J(u),count_kconfig:String(f.symbols.length),report_kconfig:J({discovered:f.symbols.length+f.choices.length,indexed:f.symbols.length+f.choices.length,intentionallyExcluded:[],warnings:[{code:"source-files",message:`Kconfiglib evaluated ${f.filesScanned} source files.`},...f.warnings.map(h=>({code:"kconfiglib",message:h}))],errors:[]}),count_bindings:String(b.length),count_dt_properties:String(k),report_bindings:J(N),count_boards:String(_.length),count_board_targets:String($),count_socs:String(v.length),report_boards:J({discovered:_.length+$+v.length,indexed:_.length+$+v.length,intentionallyExcluded:[],warnings:[{code:"report-units",message:"Counts include board, target, and SoC records."}],errors:[]}),python_requirements:J(vg(n.zephyr)),count_runners:String(U.runners.length),count_west_commands:String(U.commands.length),count_board_runners:String(U.boardRunners.length),report_west:J({discovered:r.report.discovered+U.commands.length+K.report.discovered,indexed:U.runners.length+U.commands.length+K.report.indexed,intentionallyExcluded:r.report.intentionallyExcluded,warnings:[...r.report.warnings,...K.report.warnings,{code:"report-units",message:"Counts include runner classes, west commands, and board-runner pairings."}],errors:[...r.report.errors,...K.report.errors]}),count_samples:String(pe.length),report_samples:J({discovered:pe.length+pe.reduce((h,x)=>h+x.contents.length+x.exclusions.length,0),indexed:pe.length+pe.reduce((h,x)=>h+x.contents.length,0),intentionallyExcluded:pe.flatMap(h=>h.exclusions.map(x=>({path:`${h.path}/${x.path}`,reason:x.reason}))),warnings:[{code:"report-units",message:"Counts include sample records and eligible attached files."}],errors:[]}),count_api:String(me.symbols.length),api_ingest_mode:me.mode,report_api:J(me.report)};for(let[h,x]of Object.entries(Rl))Ol.run(h,x);L.exec("COMMIT"),e(`  written   (${Date.now()-q} ms)`);let Il=Date.now();L.exec(ds),e(`  indexed   full-text (${Date.now()-Il} ms)`),L.exec("VACUUM"),L.exec("PRAGMA optimize");let ts=String(L.prepare("PRAGMA integrity_check").get()?.integrity_check??""),ns=L.prepare("PRAGMA foreign_key_check").all();if(ts!=="ok"||ns.length>0)throw new Error(`Index verification failed (integrity=${ts}, foreign-key violations=${ns.length}).`);for(let[h,x]of[["doc_fts","doc_chunk"],["kconfig_fts","kconfig"],["dt_fts","dt_binding"],["board_fts","board"],["sample_fts","sample"],["api_fts","api_symbol"]]){let O=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${h}`).get()?.n),I=Number(L.prepare(`SELECT COUNT(*) AS n FROM ${x}`).get()?.n);if(O!==I)throw new Error(`Index verification failed: ${h} has ${O} rows; ${x} has ${I}.`)}if(L.close(),L=void 0,Hi(et),el(et,c),nl(Pt(c)),Wi=!0,a){let h=`${a}.${tl()}.tmp`;Tg(h,`${J({contextFingerprint:i.contextFingerprint,relativePath:`${i.contextFingerprint}/zephyr.db`,activatedAt:new Date().toISOString()})}
`,{flag:"wx"}),Hi(h),el(h,a),nl(Pt(a)),kg(Pt(a),i.contextFingerprint)}let xl=il(c).size;e(`Done in ${((Date.now()-l)/1e3).toFixed(1)} s -> ${c} (${(xl/1024/1024).toFixed(1)} MiB)`)}finally{try{L?.close()}catch{}Wi||(Ji(et,{force:!0}),Ji(`${et}-journal`,{force:!0}))}}try{Ag()}catch(n){process.stderr.write(`zephyr-ai-ingest: ${n.message}
`),process.exit(1)}
